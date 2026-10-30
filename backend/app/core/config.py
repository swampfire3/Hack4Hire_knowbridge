from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "KnowBridge"
    app_env: str = "development"
    database_url: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 15
    cors_origins: str = "http://localhost:3000"
    qdrant_url: str = "http://qdrant:6333"
    qdrant_collection: str = "knowbridge_chunks"
    ollama_url: str = "http://ollama:11434"
    ollama_model: str = ""
    embedding_model: str = ""
    max_upload_bytes: int = 10_000_000
    document_storage_path: str = "/data/documents"

    @field_validator("jwt_secret")
    @classmethod
    def reject_placeholder_secret(cls, value: str) -> str:
        if len(value) < 32 or value.lower() in {"change-me", "changeme", "development-secret"}:
            raise ValueError("JWT_SECRET must be a unique value of at least 32 characters")
        return value

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
