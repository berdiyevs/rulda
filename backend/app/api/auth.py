import logging
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.config import settings
from ..core.security import (
    create_access_token,
    generate_verification_token,
    hash_password,
    verify_password,
)
from ..db.models import User
from ..schemas.auth import (
    GoogleLoginRequest,
    LoginRequest,
    SignupRequest,
    SignupResponse,
    TokenResponse,
    VerifyEmailRequest,
)
from ..schemas.user import UserOut
from .deps import get_current_user, get_db

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger("rulda.auth")


@router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)) -> SignupResponse:
    existing = db.scalar(select(User).where(User.email == payload.email))
    if existing is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Bu email allaqachon ro'yxatdan o'tgan")

    token = generate_verification_token()
    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        display_name=payload.name,
        is_verified=False,
        verification_token=token,
    )
    db.add(user)
    db.commit()

    verification_url = f"{settings.frontend_url}/verify-email?token={token}"
    logger.info("Email tasdiqlash havolasi (%s): %s", payload.email, verification_url)

    return SignupResponse(
        message="Ro'yxatdan o'tdingiz. Tasdiqlash havolasini bosing.",
        dev_verification_url=verification_url if settings.simple_email_mode else None,
    )


@router.post("/verify-email")
def verify_email(payload: VerifyEmailRequest, db: Session = Depends(get_db)) -> dict:
    user = db.scalar(select(User).where(User.verification_token == payload.token))
    if user is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Havola yaroqsiz yoki eskirgan")

    user.is_verified = True
    user.verification_token = None
    db.commit()

    return {"message": "Email tasdiqlandi"}


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == payload.email))
    if user is None or not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Email yoki parol noto'g'ri")

    if not user.is_verified:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Avval emailingizni tasdiqlang")

    user.last_login = datetime.now(timezone.utc)
    db.commit()

    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.post("/google", response_model=TokenResponse)
def google_login(payload: GoogleLoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    response = httpx.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        headers={"Authorization": f"Bearer {payload.access_token}"},
        timeout=10,
    )
    if response.status_code != 200:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Google token yaroqsiz")

    info = response.json()
    google_sub = info.get("sub")
    email = info.get("email")
    name = info.get("name") or (email.split("@")[0] if email else "Foydalanuvchi")

    if not google_sub or not email:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Google profilidan ma'lumot olinmadi")

    user = db.scalar(select(User).where(User.google_sub == google_sub))
    if user is None:
        user = db.scalar(select(User).where(User.email == email))

    if user is None:
        user = User(email=email, display_name=name, is_verified=True, google_sub=google_sub)
        db.add(user)
    else:
        user.google_sub = google_sub
        user.is_verified = True

    user.last_login = datetime.now(timezone.utc)
    db.commit()

    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> User:
    if not current_user.is_admin and current_user.email.lower() in settings.admin_email_list:
        current_user.is_admin = True
        db.commit()
        db.refresh(current_user)
    return current_user
