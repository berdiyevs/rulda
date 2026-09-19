from datetime import date

FREE_TICKET_LIMIT = 3


def is_premium_active(is_premium: bool, premium_until: date | None) -> bool:
    if not is_premium:
        return False
    if premium_until is None:
        return True
    return premium_until >= date.today()


def attempt_requires_premium(topic: str, mode: str) -> bool:
    if mode in ("exam", "mistakes"):
        return True
    if topic.startswith("ticket-"):
        try:
            ticket_number = int(topic.removeprefix("ticket-"))
        except ValueError:
            return False
        return ticket_number > FREE_TICKET_LIMIT
    return False
