"""Create a local demo admin without embedding credentials in source or config."""
import argparse
import secrets
import sys

from pydantic import EmailStr, TypeAdapter, ValidationError

from app.core.config import settings
from app.db import Base, SessionLocal, engine
from app.models import Client, User, UserClient
from app.security import hash_password


def create_admin(email: str, display_name: str, client_names: list[str]) -> tuple[str, str]:
    if settings.app_env.lower() not in {"development", "demo"}:
        raise RuntimeError("Admin bootstrap is allowed only in development or demo environments")
    try:
        normalized_email = str(TypeAdapter(EmailStr).validate_python(email.strip())).lower()
    except ValidationError as exc:
        raise ValueError("Enter a valid email address") from exc
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).filter_by(email=normalized_email).first() is not None:
            raise ValueError("An account with that email already exists; no password was changed")

        clients = db.query(Client).filter(Client.name.in_(client_names)).all() if client_names else []
        found_names = {client.name for client in clients}
        missing_names = set(client_names) - found_names
        if missing_names:
            raise ValueError(f"Unknown client assignment(s): {', '.join(sorted(missing_names))}")

        password = secrets.token_urlsafe(24)
        user = User(
            email=normalized_email,
            display_name=display_name.strip(),
            password_hash=hash_password(password),
            role="admin",
        )
        db.add(user)
        db.flush()
        db.add_all(UserClient(user_id=user.id, client_id=client.id) for client in clients)
        db.commit()
        return normalized_email, password
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def main() -> int:
    parser = argparse.ArgumentParser(description="Create one development/demo admin account")
    parser.add_argument("--email", required=True)
    parser.add_argument("--name", required=True, dest="display_name")
    parser.add_argument("--client", action="append", default=[], dest="client_names",
                        help="Optional existing client assignment; repeat for multiple clients")
    args = parser.parse_args()
    try:
        email, password = create_admin(args.email, args.display_name, args.client_names)
    except Exception as exc:
        print(f"Admin creation failed: {exc}", file=sys.stderr)
        return 1
    print("Admin created. Save this generated password; it will not be shown again:")
    print(f"  {email}  {password}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
