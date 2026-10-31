import json
import re
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Response, UploadFile
from fastapi.security import HTTPAuthorizationCredentials
from fastapi.responses import FileResponse
from jose import jwt
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db import get_db
from app.models import AuditLog, Client, Document, RevokedToken, User, UserClient
from app.schemas import (AuditLogOut, ChatQuery, ChatResponse, CitationOut, ClientCreate, ClientOut,
                         DocumentOut, FeedbackRequest, LoginRequest, MeResponse, TokenResponse,
                         UserAssignmentsUpdate, UserCreate, UserOut)
from app.security import bearer_scheme, create_access_token, get_current_user, hash_password, require_admin, unauthorized, verify_password
from app.services.ingestion import chunk_text, extract_digital_text
from app.services.retrieval import grounded_answer, index_chunks, retrieve

router = APIRouter()
MIN_RETRIEVAL_SCORE = 0.45
QUERY_STOPWORDS = {"what", "is", "the", "of", "this", "that", "pdf", "docx", "document", "file", "for", "a", "an", "to", "in", "on", "and", "does", "do", "my", "our"}


def allowed_client_ids(user: User) -> list[str]:
    return [assignment.client_id for assignment in user.assignments]


def user_out(user: User, allowed_ids: set[str]) -> UserOut:
    clients = [assignment.client for assignment in user.assignments if assignment.client_id in allowed_ids]
    return UserOut(id=user.id, email=user.email, display_name=user.display_name, role=user.role,
                   active=user.active, clients=[ClientOut.model_validate(client, from_attributes=True) for client in clients])


def has_distinctive_term_match(question: str, evidence_text: str) -> bool:
    """Keep exact acronym/name matches that vector similarity alone can underrank."""
    query_terms = {term for term in re.findall(r"[a-z0-9]+", question.lower())
                   if len(term) >= 3 and term not in QUERY_STOPWORDS}
    if not query_terms:
        return False
    evidence_terms = set(re.findall(r"[a-z0-9]+", evidence_text.lower()))
    return bool(query_terms & evidence_terms)


@router.post("/auth/login", response_model=TokenResponse, tags=["auth"])
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower(), User.active.is_(True)).first()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "Invalid email or password", headers={"WWW-Authenticate": "Bearer"})
    token, _ = create_access_token(user.id)
    return TokenResponse(access_token=token, expires_in=settings.jwt_expire_minutes * 60)


@router.post("/auth/logout", status_code=204, tags=["auth"])
def logout(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if credentials is None:
        raise unauthorized()
    payload = jwt.decode(credentials.credentials, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    expires_at = datetime.fromtimestamp(payload["exp"], tz=UTC)
    db.add(RevokedToken(jti=payload["jti"], expires_at=expires_at))
    db.commit()
    return Response(status_code=204)


@router.get("/me", response_model=MeResponse, tags=["auth"])
def me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    client_ids = allowed_client_ids(user)
    clients = db.query(Client).filter(Client.id.in_(client_ids)).all() if client_ids else []
    capabilities = ["chat"]
    if user.role == "admin":
        capabilities.extend(["documents:read", "documents:upload", "audit:read"])
    return MeResponse(id=user.id, email=user.email, display_name=user.display_name, role=user.role,
                       capabilities=capabilities, clients=[ClientOut.model_validate(client, from_attributes=True) for client in clients])


@router.get("/clients", response_model=list[ClientOut], tags=["clients"])
def list_clients(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    client_ids = allowed_client_ids(user)
    if not client_ids:
        return []
    clients = db.query(Client).filter(Client.id.in_(client_ids)).order_by(Client.name).all()
    return [ClientOut.model_validate(client, from_attributes=True) for client in clients]


@router.post("/clients", response_model=ClientOut, status_code=201, tags=["clients"])
def create_client(payload: ClientCreate, user: User = Depends(require_admin), db: Session = Depends(get_db)):
    name = payload.name.strip()
    tier = payload.tier.strip()
    if not name or not tier:
        raise HTTPException(422, "Client name and tier are required")
    client = Client(name=name, tier=tier)
    db.add(client)
    try:
        db.flush()
        # The creating administrator is explicitly assigned to the new tenant.
        db.add(UserClient(user_id=user.id, client_id=client.id))
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(409, "A client with that name already exists") from exc
    db.refresh(client)
    return ClientOut.model_validate(client, from_attributes=True)


@router.get("/users", response_model=list[UserOut], tags=["admin"])
def list_users(user: User = Depends(require_admin), db: Session = Depends(get_db)):
    allowed_ids = set(allowed_client_ids(user))
    if not allowed_ids:
        return []
    accounts = db.query(User).order_by(User.display_name).all()
    return [user_out(account, allowed_ids) for account in accounts
            if any(assignment.client_id in allowed_ids for assignment in account.assignments)]


@router.post("/users", response_model=UserOut, status_code=201, tags=["admin"])
def create_user(payload: UserCreate, user: User = Depends(require_admin), db: Session = Depends(get_db)):
    allowed_ids = set(allowed_client_ids(user))
    requested_ids = list(dict.fromkeys(payload.client_ids))
    if not requested_ids or not set(requested_ids).issubset(allowed_ids):
        raise HTTPException(403, "You may assign users only to clients assigned to your admin account")
    email = str(payload.email).lower()
    if db.query(User).filter_by(email=email).first() is not None:
        raise HTTPException(409, "An account with that email already exists")
    account = User(email=email, display_name=payload.display_name.strip(),
                    password_hash=hash_password(payload.password), role=payload.role)
    db.add(account)
    db.flush()
    db.add_all(UserClient(user_id=account.id, client_id=client_id) for client_id in requested_ids)
    db.commit()
    db.refresh(account)
    return user_out(account, allowed_ids)


@router.put("/users/{user_id}/assignments", response_model=UserOut, tags=["admin"])
def update_user_assignments(user_id: str, payload: UserAssignmentsUpdate,
                            user: User = Depends(require_admin), db: Session = Depends(get_db)):
    allowed_ids = set(allowed_client_ids(user))
    target = db.query(User).filter_by(id=user_id).first()
    if target is None or not any(assignment.client_id in allowed_ids for assignment in target.assignments):
        raise HTTPException(404, "User not found in your client scope")
    requested_ids = list(dict.fromkeys(payload.client_ids))
    if not requested_ids or not set(requested_ids).issubset(allowed_ids):
        raise HTTPException(403, "You may assign users only to clients assigned to your admin account")
    if target.id == user.id and not requested_ids:
        raise HTTPException(400, "An administrator must retain at least one client assignment")
    db.query(UserClient).filter_by(user_id=target.id).delete(synchronize_session=False)
    db.add_all(UserClient(user_id=target.id, client_id=client_id) for client_id in requested_ids)
    db.commit()
    db.refresh(target)
    return user_out(target, allowed_ids)


@router.get("/audit", response_model=list[AuditLogOut], tags=["admin"])
def list_audit_logs(user: User = Depends(require_admin), db: Session = Depends(get_db)):
    allowed_ids = set(allowed_client_ids(user))
    if not allowed_ids:
        return []
    logs = (db.query(AuditLog)
            .filter(AuditLog.client_id.in_(allowed_ids))
            .order_by(AuditLog.created_at.desc())
            .limit(500)
            .all())
    if not logs:
        return []

    users = {account.id: account for account in db.query(User).filter(User.id.in_({log.user_id for log in logs})).all()}
    clients = {client.id: client for client in db.query(Client).filter(Client.id.in_({log.client_id for log in logs})).all()}
    parsed_sources: dict[str, list[dict | str]] = {}
    document_ids: set[str] = set()
    for log in logs:
        try:
            sources = json.loads(log.source_ids or "[]")
        except (TypeError, json.JSONDecodeError):
            sources = []
        if not isinstance(sources, list):
            sources = []
        parsed_sources[log.id] = sources
        for source in sources:
            document_id = source.get("document_id") if isinstance(source, dict) else source
            if isinstance(document_id, str):
                document_ids.add(document_id)
    documents = {document.id: document for document in db.query(Document).filter(Document.id.in_(document_ids)).all()} if document_ids else {}

    output = []
    for log in logs:
        client = clients.get(log.client_id)
        account = users.get(log.user_id)
        formatted_sources = []
        for source in parsed_sources.get(log.id, []):
            if isinstance(source, dict):
                document_id = source.get("document_id")
                page, section = source.get("page"), source.get("section")
            else:
                document_id, page, section = source, None, None
            document = documents.get(document_id) if isinstance(document_id, str) else None
            if document is None:
                continue
            location = ", ".join(part for part in (
                f"page {page}" if page else "",
                str(section) if section else "",
            ) if part)
            suffix = f", {location}" if location else ""
            formatted_sources.append(f"{document.name} ({document.version}{suffix})")
        output.append(AuditLogOut(
            id=log.id,
            timestamp=log.created_at,
            user=account.email if account else "Unknown user",
            user_role=account.role if account else "unknown",
            client_scope=f"{client.name} ({client.id})" if client else log.client_id,
            query=log.question,
            retrieved_sources=formatted_sources,
            status=log.status,
            feedback=log.feedback,
        ))
    return output


@router.get("/documents", response_model=list[DocumentOut], tags=["documents"])
def list_documents(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    client_ids = allowed_client_ids(user)
    return db.query(Document).filter(Document.client_id.in_(client_ids)).order_by(Document.created_at.desc()).all()


@router.get("/documents/{document_id}/file", tags=["documents"])
def download_document(document_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    client_ids = allowed_client_ids(user)
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.client_id.in_(client_ids),
    ).first()
    if document is None or not document.storage_path:
        raise HTTPException(404, "Document file not found")

    storage_root = Path(settings.document_storage_path).resolve()
    file_path = Path(document.storage_path).resolve()
    if not file_path.is_relative_to(storage_root) or not file_path.is_file():
        raise HTTPException(404, "Document file not found")
    return FileResponse(file_path, media_type=document.media_type, filename=document.name)


@router.post("/documents/upload", response_model=DocumentOut, status_code=201, tags=["documents"])
def upload_document(
    client_id: str,
    version: str,
    file: UploadFile = File(...),
    user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if client_id not in allowed_client_ids(user):
        raise HTTPException(403, "Not authorized for this client")
    raw = file.file.read(settings.max_upload_bytes + 1)
    if len(raw) > settings.max_upload_bytes:
        raise HTTPException(413, "Upload exceeds configured size limit")
    original_name = (file.filename or "document").replace("\\", "/").split("/")[-1][:255]
    suffix = Path(original_name).suffix.lower()
    if suffix not in {".pdf", ".docx"}:
        raise HTTPException(422, "Only digital PDF and DOCX files are supported")

    document = Document(client_id=client_id, name=original_name, version=version,
                        media_type=file.content_type or "application/octet-stream", status="processing", uploaded_by=user.id)
    db.add(document)
    db.commit()
    db.refresh(document)
    try:
        storage_root = Path(settings.document_storage_path).resolve()
        document_directory = storage_root / client_id / document.id
        document_directory.mkdir(parents=True, exist_ok=False)
        stored_file = document_directory / f"original{suffix}"
        temporary_file = document_directory / f".upload-{uuid4().hex}.tmp"
        temporary_file.write_bytes(raw)
        temporary_file.replace(stored_file)
        document.storage_path = str(stored_file)
        db.commit()
        chunks = chunk_text(extract_digital_text(file, raw))
        index_chunks(document.id, client_id, version, chunks)
        document.status, document.is_active, document.chunk_count = "indexed", True, len(chunks)
    except HTTPException:
        document.status = "failed"
        db.commit()
        raise
    except Exception as exc:
        document.status = "failed"
        db.commit()
        raise HTTPException(502, "Document indexing failed; document was not activated") from exc
    db.commit()
    db.refresh(document)
    return document


@router.post("/chat/query", response_model=ChatResponse, tags=["chat"])
def chat_query(payload: ChatQuery, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    client_ids = allowed_client_ids(user)
    # Qdrant's filter always includes the server-loaded assignment IDs and active status.
    try:
        points = retrieve(payload.question, client_ids)
    except Exception as exc:
        raise HTTPException(503, "Retrieval service is unavailable") from exc
    evidence = [
        point.payload for point in points
        if point.payload and (
            point.score >= MIN_RETRIEVAL_SCORE
            or has_distinctive_term_match(payload.question, point.payload.get("text", ""))
        )
    ]
    source_ids = [
        {"document_id": str(item["document_id"]), "version": item.get("version"),
         "page": item.get("page"), "section": item.get("section")}
        for item in evidence
    ]
    client_id = client_ids[0] if client_ids else ""
    citations = [CitationOut(id=f"{item['document_id']}:{index}", document_name=_document_name(db, item["document_id"]),
                 version=item["version"], page=item.get("page"), section=item.get("section"), excerpt=item["text"][:280])
                 for index, item in enumerate(evidence)]
    if not evidence:
        response = ChatResponse(state="insufficient_evidence", answer="The authorized active documents do not provide enough evidence to answer this question.", citations=[])
    else:
        try:
            answer = grounded_answer(payload.question, evidence)
        except Exception as exc:
            _audit(db, user.id, client_id, payload.question, "error", source_ids)
            raise HTTPException(503, "Local answer generation is unavailable") from exc
        if not answer or answer.upper().startswith("INSUFFICIENT"):
            response = ChatResponse(state="insufficient_evidence", answer="The retrieved documents do not provide enough evidence to answer this question.", citations=citations)
        else:
            response = ChatResponse(state="answered", answer=answer, citations=citations, conflict_detected=False)
    log_entry = _audit(db, user.id, client_id, payload.question, response.state, source_ids)
    response.audit_log_id = log_entry.id
    return response


@router.post("/chat/feedback", tags=["chat"])
def submit_chat_feedback(payload: FeedbackRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    log = db.query(AuditLog).filter(AuditLog.id == payload.audit_log_id, AuditLog.user_id == user.id).first()
    if not log:
        raise HTTPException(404, "Audit log not found")
    log.feedback = payload.feedback
    db.commit()
    return {"status": "ok", "feedback": log.feedback}


def _document_name(db: Session, document_id: str) -> str:
    document = db.get(Document, document_id)
    return document.name if document else "Authorized document"


def _audit(db: Session, user_id: str, client_id: str, question: str, status: str, source_ids: list[dict]) -> AuditLog:
    entry = AuditLog(user_id=user_id, client_id=client_id, question=question, status=status, source_ids=json.dumps(source_ids))
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
