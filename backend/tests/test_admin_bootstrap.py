import os

os.environ.setdefault("APP_ENV", "development")
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_knowbridge.db")
os.environ.setdefault("JWT_SECRET", "test-secret-that-is-longer-than-thirty-two-characters")

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import app.create_admin as create_admin_module
from app.db import Base
from app.models import Client, User


@pytest.fixture
def admin_db(monkeypatch, tmp_path):
    engine = create_engine(f"sqlite:///{tmp_path / 'admin.db'}")
    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine, autoflush=False)
    monkeypatch.setattr(create_admin_module, "engine", engine)
    monkeypatch.setattr(create_admin_module, "SessionLocal", factory)
    monkeypatch.setattr(create_admin_module, "hash_password", lambda password: f"hashed:{password}")
    monkeypatch.setattr(create_admin_module.settings, "app_env", "development")
    return factory


def test_bootstrap_admin_can_be_created_before_any_clients(admin_db):
    email, password = create_admin_module.create_admin("owner@example.com", "Organization Admin", [])
    session = admin_db()
    user = session.query(User).filter_by(email=email).one()
    assert user.role == "admin"
    assert user.password_hash == f"hashed:{password}"
    assert user.assignments == []
    session.close()


def test_bootstrap_admin_can_be_assigned_to_existing_clients(admin_db):
    session = admin_db()
    session.add_all([Client(name="Northwind", tier="Standard"), Client(name="Fabrikam", tier="Premium")])
    session.commit()
    session.close()

    email, _ = create_admin_module.create_admin("owner@example.com", "Organization Admin", ["Northwind", "Fabrikam"])
    session = admin_db()
    admin = session.query(User).filter_by(email=email).one()
    assert {assignment.client.name for assignment in admin.assignments} == {"Northwind", "Fabrikam"}
    session.close()


def test_bootstrap_is_development_only_and_does_not_reset_existing_accounts(admin_db, monkeypatch):
    email, password = create_admin_module.create_admin("owner@example.com", "Organization Admin", [])
    with pytest.raises(ValueError, match="already exists"):
        create_admin_module.create_admin(email, "Do Not Replace", [])

    monkeypatch.setattr(create_admin_module.settings, "app_env", "production")
    with pytest.raises(RuntimeError, match="development or demo"):
        create_admin_module.create_admin("another@example.com", "Blocked", [])

    session = admin_db()
    assert session.query(User).filter_by(email=email).one().password_hash == f"hashed:{password}"
    assert session.query(User).filter_by(email="another@example.com").count() == 0
    session.close()
