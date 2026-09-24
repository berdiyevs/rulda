// Tizimga kirmagan (mehmon) foydalanuvchining natijalari brauzerda saqlanadi
// va ro'yxatdan o'tgandan keyin hisobiga bir marta ko'chiriladi.
const STORAGE_KEY = 'rulda_guest_attempts'
const MAX_ATTEMPTS = 20

function readAll() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(list) {
  try {
    if (list.length === 0) localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(-MAX_ATTEMPTS)))
  } catch {
    // localStorage yopiq bo'lsa (masalan, maxfiy rejim) natija shunchaki saqlanmaydi.
  }
}

export function addGuestAttempt(attempt) {
  writeAll([...readAll(), attempt])
}

// Ro'yxatni olib, saqlashdan darhol o'chiradi: ikkinchi marta ko'chirib bo'lmasligi uchun.
export function claimGuestAttempts() {
  const list = readAll()
  writeAll([])
  return list
}

// Yuborib bo'lmagan urinishlarni (masalan, internet uzilganda) keyingi safar uchun qaytarib qo'yadi.
export function restoreGuestAttempts(list) {
  writeAll([...list, ...readAll()])
}
