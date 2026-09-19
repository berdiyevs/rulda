export const FREE_TICKET_LIMIT = 3

export function isTicketLocked(ticketId, isPremiumActive) {
  return Number(ticketId) > FREE_TICKET_LIMIT && !isPremiumActive
}
