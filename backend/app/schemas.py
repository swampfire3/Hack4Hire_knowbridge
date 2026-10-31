from datetime import datetime
from typing import Literal
from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=256)


class TokenResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_in: int


class ClientOut(BaseModel):
    id: str
    name: str
    tier: str


class ClientCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    tier: str = Field(min_length=1, max_length=120)


class UserCreate(BaseModel):
    email: EmailStr
    display_name: str = Field(min_length=1, max_length=120)
    role: Literal["staff", "admin"] = "staff"
    password: str = Field(min_length=12, max_length=256)
    client_ids: list[str] = Field(min_length=1)


class UserOut(BaseModel):
    id: str
    email: EmailStr
    display_name: str
    role: Literal["staff", "admin"]
    active: bool
    clients: list[ClientOut]


class UserAssignmentsUpdate(BaseModel):
    client_ids: list[str] = Field(min_length=1)


class AuditLogOut(BaseModel):
    id: str
    timestamp: datetime
    user: EmailStr
    user_role: str
    client_scope: str
    query: str
    retrieved_sources: list[str]
    status: str
    feedback: str | None = None


class MeResponse(BaseModel):
    id: str
    email: EmailStr
    display_name: str
    role: Literal["staff", "admin"]
    capabilities: list[str]
    clients: list[ClientOut]


class CitationOut(BaseModel):
    id: str
    document_name: str
    version: str
    page: int | None = None
    section: str | None = None
    excerpt: str | None = None


class ChatQuery(BaseModel):
    question: str = Field(min_length=1, max_length=4000)


class ChatResponse(BaseModel):
    state: Literal["answered", "insufficient_evidence", "error"]
    answer: str
    citations: list[CitationOut] = []
    conflict_detected: bool = False
    audit_log_id: str | None = None


class FeedbackRequest(BaseModel):
    audit_log_id: str
    feedback: Literal["thumbs_up", "thumbs_down"]


class DocumentOut(BaseModel):
    id: str
    name: str
    client_id: str
    version: str
    media_type: str
    status: str
    is_active: bool
    chunk_count: int
    created_at: datetime | None
