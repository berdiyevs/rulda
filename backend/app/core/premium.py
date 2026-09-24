from datetime import date, datetime, timedelta, timezone

FREE_TICKET_LIMIT = 3
# O'zbekiston vaqti UTC+5 (yozgi vaqt yo'q). Kunlik cheklovlar shu kun bo'yicha hisoblanadi.
UZ_TZ = timezone(timedelta(hours=5))


def is_premium_active(is_premium: bool, premium_until: date | None) -> bool:
    if not is_premium:
        return False
    if premium_until is None:
        return True
    return premium_until >= date.today()


def uz_day_bounds(now: datetime | None = None) -> tuple[datetime, datetime]:
    """O'zbekiston kunining boshi va oxiri (UTC'da): [boshi, oxiri)."""
    local_now = (now or datetime.now(timezone.utc)).astimezone(UZ_TZ)
    start_local = local_now.replace(hour=0, minute=0, second=0, microsecond=0)
    return start_local.astimezone(timezone.utc), (start_local + timedelta(days=1)).astimezone(timezone.utc)


def attempt_requires_premium(topic: str, mode: str) -> bool:
    if mode in ("exam", "mistakes"):
        return True
    # "Bugungi takrorlash" Premium talab qilmaydi; bepul foydalanuvchi uchun kunlik cheklov attempts.py da.
    if mode == "review":
        return False
    if topic.startswith("ticket-"):
        try:
            ticket_number = int(topic.removeprefix("ticket-"))
        except ValueError:
            return False
        return ticket_number > FREE_TICKET_LIMIT
    return False
