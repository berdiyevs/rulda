// Biletlar bo'yicha progress: holat va "keyingi bilet".
// Bitta manba: Asosiy sahifadagi "Davom ettirish" kartasi ham, Biletlar sahifasi ham shu funksiyalardan
// foydalanadi, shuning uchun ular hech qachon bir-biriga zid bilet ko'rsatmaydi.

// Bilet rejimida sukut bo'yicha ruxsat etilgan xatolar (rasmiy imtihon formati).
export const TICKET_DEFAULT_MAX_MISTAKES = 2

const TICKET_PREFIX = 'ticket-'

export function answeredOf(attempt) {
  return (attempt?.correctCount || 0) + (attempt?.wrongCount || 0)
}

export function ticketIdOf(attempt) {
  if (!attempt?.topic?.startsWith(TICKET_PREFIX)) return null
  const id = Number(attempt.topic.slice(TICKET_PREFIX.length))
  return Number.isNaN(id) ? null : id
}

// Har bir bilet bo'yicha eng so'nggi urinish (urinishlar vaqt bo'yicha tartiblangan deb olinadi).
export function lastAttemptByTicket(attempts) {
  const map = new Map()
  attempts.forEach((attempt) => {
    const id = ticketIdOf(attempt)
    if (id != null) map.set(id, attempt)
  })
  return map
}

/**
 * Oxirgi urinish bo'yicha bilet holati:
 *  - passed: barcha savollarga javob berilgan va o'tilgan;
 *  - failed: barcha savollarga javob berilgan, lekin o'tilmagan, yoki xatolar chegaradan oshgani uchun to'xtagan;
 *  - incomplete: foydalanuvchi o'zi to'xtatgan yoki vaqt tugagan (xatolar chegaradan oshmagan);
 *  - new: hali yechilmagan.
 */
export function ticketStatusOf(attempt) {
  if (!attempt) return 'new'
  if (attempt.passed) return 'passed'
  const answered = answeredOf(attempt)
  if (answered >= attempt.totalQuestions) return 'failed'
  return (attempt.wrongCount || 0) > TICKET_DEFAULT_MAX_MISTAKES ? 'failed' : 'incomplete'
}

/**
 * Keyingi yechiladigan bilet: oxirgi yechilgan biletdan keyingi, hali o'tilmagan va ochiq bilet.
 * Oxiriga yetsa, boshidan qidiriladi. Ochiq bilet qolmasa, birinchi o'tilmagan qulflangan bilet
 * qaytariladi (Premium taklifi uchun). Hammasi o'tilgan bo'lsa, null.
 *
 * @param {number[]} ticketIds          tartiblangan bilet raqamlari
 * @param {object[]} attempts           foydalanuvchi urinishlari
 * @param {(id: number) => boolean} isLocked
 * @returns {{ ticketId: number, locked: boolean } | null}
 */
export function getNextTicket(ticketIds, attempts, isLocked) {
  const lastByTicket = lastAttemptByTicket(attempts)
  const ticketAttempts = attempts.filter((a) => ticketIdOf(a) != null)
  const lastTicketId = ticketAttempts.length ? ticketIdOf(ticketAttempts[ticketAttempts.length - 1]) : null

  const notPassed = ticketIds.filter((id) => ticketStatusOf(lastByTicket.get(id)) !== 'passed')
  if (notPassed.length === 0) return null

  const startIndex = lastTicketId == null ? 0 : notPassed.findIndex((id) => id > lastTicketId)
  const ordered = startIndex > 0 ? [...notPassed.slice(startIndex), ...notPassed.slice(0, startIndex)] : notPassed

  const open = ordered.find((id) => !isLocked(id))
  if (open != null) return { ticketId: open, locked: false }
  return { ticketId: ordered[0], locked: true }
}
