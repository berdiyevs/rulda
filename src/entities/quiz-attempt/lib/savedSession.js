// Tugallanmagan testni brauzerda saqlash: bir vaqtda faqat bitta test, savoldan savolga yangilanadi.
// Imtihon, xatolar va takrorlash rejimlari saqlanmaydi.
const STORAGE_KEY = 'rulda_saved_session'
const MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000
export const RESUMABLE_MODES = ['ticket', 'practice', 'mini']

export function isResumableMode(mode) {
  return RESUMABLE_MODES.includes(mode)
}

// Yozuv kimniki: tizimga kirgan foydalanuvchining uid'i yoki mehmon.
export function ownerOf(user) {
  return user?.uid ?? 'guest'
}

export function clearSavedSession() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // localStorage yopiq bo'lsa, e'tibor bermaymiz.
  }
}

export function saveSession(session) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...session, updatedAt: Date.now() }))
  } catch {
    // localStorage to'la yoki yopiq bo'lsa, test shunchaki davom etaveradi.
  }
}

// 3 kundan eski yoki buzilgan yozuv o'chiriladi.
export function loadSavedSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    const isValid =
      session &&
      Array.isArray(session.questionIds) &&
      Array.isArray(session.statuses) &&
      typeof session.search === 'string' &&
      Date.now() - session.updatedAt <= MAX_AGE_MS
    if (!isValid) {
      clearSavedSession()
      return null
    }
    return session
  } catch {
    clearSavedSession()
    return null
  }
}

// Shu foydalanuvchi davom ettira oladigan yozuv. Mehmon yozuvini keyin kirgan foydalanuvchi ham davom ettira oladi.
export function getResumableSession(user) {
  const session = loadSavedSession()
  if (!session) return null
  if (session.owner !== 'guest' && session.owner !== ownerOf(user)) return null
  return session
}

export function answeredCountOf(session) {
  return session.statuses.filter((s) => s === 'completed' || s === 'wrong').length
}

export function resumeUrl(session) {
  return `/quiz?${session.search}&resume=1`
}

// Yozuv aynan shu test uchunmi (bilet raqami / mavzu / rejim bo'yicha).
export function sessionMatches(session, { mode, ticketId, topic }) {
  if (!session || session.mode !== mode) return false
  if (mode === 'ticket') return Number(session.ticketId) === Number(ticketId)
  if (mode === 'practice') return session.topic === topic
  return true
}
