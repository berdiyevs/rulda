// Kunlar O'zbekiston vaqti (UTC+5, yozgi vaqt yo'q) bo'yicha hisoblanadi: streak, kunlik maqsad, takrorlash jadvali.
const UZ_OFFSET_MS = 5 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000
const DEBUG_KEY = 'rulda_debug_shift_days'

// Faqat `npm run dev` da: "hozir"ni N kunga surib, vaqtga bog'liq narsalarni tekshirish uchun.
let debugShiftDays = 0
if (import.meta.env?.DEV && typeof window !== 'undefined') {
  try {
    debugShiftDays = Number(localStorage.getItem(DEBUG_KEY)) || 0
  } catch {
    debugShiftDays = 0
  }
  window.__ruldaShiftDays = (days) => {
    debugShiftDays = Number(days) || 0
    try {
      localStorage.setItem(DEBUG_KEY, String(debugShiftDays))
    } catch {
      // e'tibor bermaymiz
    }
    console.info(`[Rulda] "Hozir" ${debugShiftDays} kunga surildi. Sahifani yangilang.`)
  }
}

export function now() {
  return new Date(Date.now() + debugShiftDays * DAY_MS)
}

// Sanani O'zbekiston kuni raqamiga aylantiradi (ketma-ket kunlar ketma-ket raqamlar).
export function uzDayNumber(date) {
  return Math.floor((date.getTime() + UZ_OFFSET_MS) / DAY_MS)
}

export function uzToday() {
  return uzDayNumber(now())
}

// O'zbekiston vaqti bo'yicha soat (0–23).
export function uzHour(date = now()) {
  return new Date(date.getTime() + UZ_OFFSET_MS).getUTCHours()
}
