export const FREE_TICKET_LIMIT = 3

// Mehmon (tizimga kirmagan) foydalanuvchi faqat 1-biletni yecha oladi.
export const GUEST_TICKET_LIMIT = 1

export function isTicketGuestLocked(ticketId, isGuest) {
  return isGuest && Number(ticketId) > GUEST_TICKET_LIMIT
}

export function isTicketLocked(ticketId, isPremiumActive) {
  return Number(ticketId) > FREE_TICKET_LIMIT && !isPremiumActive
}
