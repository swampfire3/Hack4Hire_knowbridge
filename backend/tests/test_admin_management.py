import os

os.environ.setdefault("APP_ENV", "development")
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_knowbridge.db")
os.environ.setdefault("JWT_SECRET", "test-secret-that-is-longer-than-thirty-two-characters")

import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app import routers
from app.db import Base
from app.models import AuditLog, Client, Document, User, UserClient
from app.schemas import ClientCreate, UserCreate


@pytest.fixture
def admin_context(monkeypatch, tmp_path):
    engine = create_engine(f"sqlite:///{tmp_path / 'management.db'}")
    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine, autoflush=False)
    session = factory()
    northwind = Client(name="Northwind", tier="Standard")
    unrelated = Client(name="Other Client", tier="Standard")
    admin = User(email="admin@example.com", display_name="Admin", password_hash="not-used", role="admin")
    session.add_all([northwind, unrelated, admin])
    session.flush()
    session.add(UserClient(user_id=admin.id, client_id=northwind.id))
    session.commit()
    monkeypatch.setattr(routers, "hash_password", lambda password: f"hashed:{password}")
    yield session, admin, northwind, unrelated
    session.close()


def test_admin_can_create_client_and_is_assigned(admin_context):
    session, admin, _, _ = admin_context
    created = routers.create_client(ClientCreate(name="Contoso", tier="Premium"), admin, session)
    assert created.name == "Contoso"
    assert created.id in {assignment.client_id for assignment in admin.assignments}


def test_admin_can_create_user_only_in_assigned_client(admin_context):
    session, admin, northwind, unrelated = admin_context
    created = routers.create_user(
        UserCreate(email="staff@example.com", display_name="Staff User", role="staff",
                   password="a-strong-initial-password", client_ids=[northwind.id]),
        admin,
        session,
    )
    staff = session.query(User).filter_by(id=created.id).one()
    assert created.clients[0].name == "Northwind"
    assert staff.password_hash == "hashed:a-strong-initial-password"
    with pytest.raises(HTTPException) as error:
        routers.create_user(
            UserCreate(email="outside@example.com", display_name="Outside User", role="staff",
                       password="another-strong-initial-password", client_ids=[unrelated.id]),
            admin,
            session,
        )
    assert error.value.status_code == 403


def test_admin_audit_list_is_scoped_and_resolves_source_documents(admin_context):
    session, admin, northwind, unrelated = admin_context
    source = Document(client_id=northwind.id, name="northwind-policy.pdf", version="v2", media_type="application/pdf",
                      status="indexed", is_active=True, uploaded_by=admin.id, storage_path="/data/documents/northwind.pdf")
    other_source = Document(client_id=unrelated.id, name="other-policy.pdf", version="v1", media_type="application/pdf",
                            status="indexed", is_active=True, uploaded_by=admin.id, storage_path="/data/documents/other.pdf")
    session.add_all([source, other_source])
    session.flush()
    session.add_all([
        AuditLog(user_id=admin.id, client_id=northwind.id, question="Northwind question", status="answered", source_ids=f'["{source.id}"]'),
        AuditLog(user_id=admin.id, client_id=unrelated.id, question="Other tenant question", status="answered", source_ids=f'["{other_source.id}"]'),
    ])
    session.commit()

    logs = routers.list_audit_logs(admin, session)
    assert len(logs) == 1
    assert logs[0].query == "Northwind question"
    assert logs[0].retrieved_sources == ["northwind-policy.pdf (v2)"]
