import logging

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


logger = logging.getLogger("rulda.config")


class Settings(BaseSettings):
    # "production" rejimida /docs o'chadi va xavfli sozlamalar startda tekshiriladi.
    environment: str = "development"
    database_url: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7
    google_client_id: str = ""
    cors_origins: str = "http://localhost:5173"
    frontend_url: str = "http://localhost:5173"
    simple_email_mode: bool = False
    seed_data_dir: str = "seed_data"
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
    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    @model_validator(mode="after")
    def check_production_safety(self) -> "Settings":
        if len(self.jwt_secret) < 32 or self.jwt_secret.startswith("change-me"):
            raise ValueError("JWT_SECRET kamida 32 belgili tasodifiy qiymat bo'lishi kerak (python -c \"import secrets; print(secrets.token_urlsafe(48))\")")
        if self.is_production:
            if not self.google_client_id:
                raise ValueError("Production'da GOOGLE_CLIENT_ID majburiy (Google token auditoriyasini tekshirish uchun)")
            if any("localhost" in o or "127.0.0.1" in o for o in self.cors_origin_list):
                raise ValueError("Production'da CORS_ORIGINS localhost'ni o'z ichiga olmasligi kerak")
            if self.simple_email_mode:
                logger.warning(
                    "SIMPLE_EMAIL_MODE=true production'da yoqilgan: tasdiqlash havolasi javobda qaytariladi, "
                    "ya'ni istalgan kishi istalgan email bilan ro'yxatdan o'ta oladi. Real email xizmatini ulang."
                )
        return self

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
