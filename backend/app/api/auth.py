import logging
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..core.config import settings
from ..core.rate_limit import limiter
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
@limiter.limit("5/hour")
def signup(request: Request, payload: SignupRequest, db: Session = Depends(get_db)) -> SignupResponse:
    existing = db.scalar(select(User).where(func.lower(User.email) == payload.email.lower()))
    if existing is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Bu email allaqachon ro'yxatdan o'tgan")

    token = generate_verification_token()
    user = User(
        email=payload.email.lower(),
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
@limiter.limit("20/hour")
def verify_email(request: Request, payload: VerifyEmailRequest, db: Session = Depends(get_db)) -> dict:
    user = db.scalar(select(User).where(User.verification_token == payload.token))
    if user is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Havola yaroqsiz yoki eskirgan")

    user.is_verified = True
    user.verification_token = None
    db.commit()

    return {"message": "Email tasdiqlandi"}


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
def login(request: Request, payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.scalar(select(User).where(func.lower(User.email) == payload.email.lower()))
    if user is None or not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Email yoki parol noto'g'ri")

    if not user.is_verified:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Avval emailingizni tasdiqlang")

    user.last_login = datetime.now(timezone.utc)
    db.commit()

    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


def _verify_google_access_token(access_token: str) -> dict:
    """Token aynan bizning Google OAuth client'imiz uchun berilganini tekshiradi.

    Aks holda boshqa saytga berilgan Google token bilan ham Rulda'ga kirish mumkin bo'lardi.
    """
    try:
        token_info = httpx.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"access_token": access_token},
            timeout=10,
        )
    except httpx.HTTPError:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Google bilan bog'lanib bo'lmadi")
    if token_info.status_code != 200:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Google token yaroqsiz")

    audience = token_info.json().get("aud") or token_info.json().get("azp")
    if settings.google_client_id and audience != settings.google_client_id:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Google token boshqa ilova uchun berilgan")

    try:
        response = httpx.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10,
        )
    except httpx.HTTPError:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Google bilan bog'lanib bo'lmadi")
    if response.status_code != 200:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Google token yaroqsiz")
    return response.json()


@router.post("/google", response_model=TokenResponse)
@limiter.limit("20/minute")
def google_login(request: Request, payload: GoogleLoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    info = _verify_google_access_token(payload.access_token)
    google_sub = info.get("sub")
    email = info.get("email")
    name = info.get("name") or (email.split("@")[0] if email else "Foydalanuvchi")

    if not google_sub or not email:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Google profilidan ma'lumot olinmadi")
    if info.get("email_verified") is not True:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Google hisobingizdagi email tasdiqlanmagan")

    user = db.scalar(select(User).where(User.google_sub == google_sub))
    if user is None:
        user = db.scalar(select(User).where(func.lower(User.email) == email.lower()))

    if user is None:
        user = User(email=email, display_name=name, is_verified=True, google_sub=google_sub)
        db.add(user)
    else:
        if not user.is_verified:
            # Kimdir bu emailni oldindan (tasdiqlamasdan) o'z paroli bilan ro'yxatdan o'tkazgan bo'lishi mumkin.
            # Email egasi Google orqali kirganda o'sha begona parolni bekor qilamiz.
            user.password_hash = None
            user.verification_token = None
        user.google_sub = google_sub
        user.is_verified = True

    user.last_login = datetime.now(timezone.utc)
    db.commit()

    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> User:
    # SIMPLE_EMAIL_MODE'da email egaligi tekshirilmaydi, shuning uchun u holda faqat Google orqali
    # tasdiqlangan hisob avtomatik admin bo'la oladi (aks holda istalgan kishi admin emaili bilan ro'yxatdan o'tardi).
    email_ownership_proven = current_user.google_sub is not None or not settings.simple_email_mode
    if (
        not current_user.is_admin
        and current_user.is_verified
        and email_ownership_proven
        and current_user.email.lower() in settings.admin_email_list
    ):
        current_user.is_admin = True
        db.commit()
        db.refresh(current_user)
    return current_user
