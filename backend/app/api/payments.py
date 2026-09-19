import hashlib
import logging
import uuid as uuid_lib
from datetime import date, datetime, timedelta, timezone
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, Form, HTTPException, status
from sqlalchemy.orm import Session

from sqlalchemy import select

from ..core.config import settings
from ..db.models import Payment, Plan, User
from ..schemas.payment import ClickCreateRequest, ClickCreateResponse, PlanOut
from .deps import get_current_user, get_db

router = APIRouter(prefix="/payments", tags=["payments"])
logger = logging.getLogger("rulda.payments")

CLICK_PAY_URL = "https://my.click.uz/services/pay"

# Click Merchant API v2 error codes.
ERR_SUCCESS = 0
ERR_SIGN_FAILED = -1
ERR_AMOUNT = -2
ERR_ALREADY_PAID = -4
ERR_USER_NOT_FOUND = -5
ERR_TRANSACTION_NOT_FOUND = -6
ERR_TRANSACTION_CANCELLED = -9


def _safe_uuid(value: str) -> uuid_lib.UUID | None:
    try:
        return uuid_lib.UUID(value)
    except ValueError:
        return None


def _md5(*parts: object) -> str:
    return hashlib.md5("".join(str(p) for p in parts).encode()).hexdigest()


def _extend_premium(user: User, plan: Plan) -> None:
    base = user.premium_until if (user.premium_until and user.premium_until >= date.today()) else date.today()
    user.is_premium = True
    user.premium_until = base + timedelta(days=plan.days)


@router.get("/plans", response_model=list[PlanOut])
def list_plans(db: Session = Depends(get_db)) -> list[Plan]:
    return list(db.scalars(select(Plan).order_by(Plan.sort_order)).all())


@router.post("/click/create", response_model=ClickCreateResponse)
def create_click_payment(
    payload: ClickCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ClickCreateResponse:
    plan = db.get(Plan, payload.plan)
    if plan is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Noto'g'ri tarif")
    if not settings.click_service_id or not settings.click_merchant_id:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "To'lov tizimi hali sozlanmagan")

    payment = Payment(user_id=current_user.id, plan=plan.id, amount=plan.amount, status="pending")
    db.add(payment)
    db.commit()
    db.refresh(payment)

    params = {
        "service_id": settings.click_service_id,
        "merchant_id": settings.click_merchant_id,
        "amount": f"{plan.amount:.2f}",
        "transaction_param": str(payment.id),
        "return_url": f"{settings.frontend_url}/premium?status=success",
    }
    return ClickCreateResponse(payment_url=f"{CLICK_PAY_URL}?{urlencode(params)}")


@router.post("/click/prepare")
def click_prepare(
    click_trans_id: str = Form(...),
    service_id: str = Form(...),
    merchant_trans_id: str = Form(...),
    amount: str = Form(...),
    action: int = Form(...),
    sign_time: str = Form(...),
    sign_string: str = Form(...),
    error: int = Form(0),
    error_note: str = Form(""),
    db: Session = Depends(get_db),
) -> dict:
    expected = _md5(click_trans_id, service_id, settings.click_secret_key, merchant_trans_id, amount, action, sign_time)
    if expected != sign_string:
        return {
            "click_trans_id": click_trans_id,
            "merchant_trans_id": merchant_trans_id,
            "error": ERR_SIGN_FAILED,
            "error_note": "Sign check failed",
        }

    payment_id = _safe_uuid(merchant_trans_id)
    payment = db.get(Payment, payment_id) if payment_id else None
    if payment is None:
        return {
            "click_trans_id": click_trans_id,
            "merchant_trans_id": merchant_trans_id,
            "error": ERR_TRANSACTION_NOT_FOUND,
            "error_note": "Transaction not found",
        }

    if round(float(amount)) != payment.amount:
        return {
            "click_trans_id": click_trans_id,
            "merchant_trans_id": merchant_trans_id,
            "error": ERR_AMOUNT,
            "error_note": "Incorrect amount",
        }

    if payment.status == "paid":
        return {
            "click_trans_id": click_trans_id,
            "merchant_trans_id": merchant_trans_id,
            "error": ERR_ALREADY_PAID,
            "error_note": "Already paid",
        }

    payment.click_trans_id = click_trans_id
    db.commit()

    return {
        "click_trans_id": click_trans_id,
        "merchant_trans_id": merchant_trans_id,
        "merchant_prepare_id": payment.local_id,
        "error": ERR_SUCCESS,
        "error_note": "Success",
    }


@router.post("/click/complete")
def click_complete(
    click_trans_id: str = Form(...),
    service_id: str = Form(...),
    merchant_trans_id: str = Form(...),
    merchant_prepare_id: str = Form(...),
    amount: str = Form(...),
    action: int = Form(...),
    sign_time: str = Form(...),
    sign_string: str = Form(...),
    error: int = Form(0),
    error_note: str = Form(""),
    db: Session = Depends(get_db),
) -> dict:
    expected = _md5(
        click_trans_id, service_id, settings.click_secret_key, merchant_trans_id, merchant_prepare_id, amount, action, sign_time
    )
    if expected != sign_string:
        return {
            "click_trans_id": click_trans_id,
            "merchant_trans_id": merchant_trans_id,
            "error": ERR_SIGN_FAILED,
            "error_note": "Sign check failed",
        }

    payment_id = _safe_uuid(merchant_trans_id)
    payment = db.get(Payment, payment_id) if payment_id else None
    if payment is None or str(payment.local_id) != merchant_prepare_id:
        return {
            "click_trans_id": click_trans_id,
            "merchant_trans_id": merchant_trans_id,
            "error": ERR_TRANSACTION_NOT_FOUND,
            "error_note": "Transaction not found",
        }

    if error != 0:
        payment.status = "cancelled"
        db.commit()
        return {
            "click_trans_id": click_trans_id,
            "merchant_trans_id": merchant_trans_id,
            "merchant_confirm_id": payment.local_id,
            "error": ERR_TRANSACTION_CANCELLED,
            "error_note": "Transaction cancelled",
        }

    if payment.status == "paid":
        return {
            "click_trans_id": click_trans_id,
            "merchant_trans_id": merchant_trans_id,
            "merchant_confirm_id": payment.local_id,
            "error": ERR_ALREADY_PAID,
            "error_note": "Already paid",
        }

    user = db.get(User, payment.user_id)
    if user is None:
        return {
            "click_trans_id": click_trans_id,
            "merchant_trans_id": merchant_trans_id,
            "error": ERR_USER_NOT_FOUND,
            "error_note": "User not found",
        }

    plan = db.get(Plan, payment.plan)
    if plan is None:
        return {
            "click_trans_id": click_trans_id,
            "merchant_trans_id": merchant_trans_id,
            "error": ERR_TRANSACTION_NOT_FOUND,
            "error_note": "Plan not found",
        }

    payment.status = "paid"
    payment.click_paydoc_id = click_trans_id
    payment.paid_at = datetime.now(timezone.utc)
    _extend_premium(user, plan)
    db.commit()

    logger.info("Click to'lovi tasdiqlandi: user=%s plan=%s amount=%s", user.email, payment.plan, payment.amount)

    return {
        "click_trans_id": click_trans_id,
        "merchant_trans_id": merchant_trans_id,
        "merchant_confirm_id": payment.local_id,
        "error": ERR_SUCCESS,
        "error_note": "Success",
    }
