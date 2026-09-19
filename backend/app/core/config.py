from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7
    google_client_id: str = ""
    cors_origins: str = "http://localhost:5173"
    frontend_url: str = "http://localhost:5173"
    simple_email_mode: bool = True
    seed_data_dir: str = "../public/data"
    click_service_id: str = ""
    click_merchant_id: str = ""
    click_secret_key: str = ""
    admin_emails: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def admin_email_list(self) -> list[str]:
        return [email.strip().lower() for email in self.admin_emails.split(",") if email.strip()]

    @field_validator("database_url")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        # Heroku Postgres provides DATABASE_URL as postgres:// or postgresql://,
        # but SQLAlchemy + psycopg3 need the postgresql+psycopg:// scheme.
        if value.startswith("postgres://"):
            return "postgresql+psycopg://" + value[len("postgres://") :]
        if value.startswith("postgresql://"):
            return "postgresql+psycopg://" + value[len("postgresql://") :]
        return value

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
