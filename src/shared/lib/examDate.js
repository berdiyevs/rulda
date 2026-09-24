// Imtihon sanasi bilan ishlash: ko'rinish "kk.oo.yyyy", serverga "yyyy-mm-dd" ko'rinishida yuboriladi.

const pad = (n) => String(n).padStart(2, '0')

function toIso(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// "2026-12-25" -> "25.12.2026"
export function isoToDisplay(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

// Faqat raqamlarni qoldirib, "kk.oo.yyyy" ko'rinishiga keltiradi.
export function maskDate(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean)
  return parts.join('.')
}

// "25.12.2026" -> "2026-12-25"; sana noto'g'ri bo'lsa null.
export function displayToIso(display) {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(display)
  if (!match) return null
  const [, dd, mm, yyyy] = match
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
  const isReal =
    date.getFullYear() === Number(yyyy) && date.getMonth() === Number(mm) - 1 && date.getDate() === Number(dd)
  return isReal ? `${yyyy}-${mm}-${dd}` : null
}

// Bugundan boshlab N kun keyingi sana ("yyyy-mm-dd").
export function addDaysFromToday(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return toIso(date)
}

// Bugundan boshlab N oy keyingi sana ("yyyy-mm-dd").
export function addMonthsFromToday(months) {
  const date = new Date()
  const day = date.getDate()
  date.setMonth(date.getMonth() + months)
  // 31-yanvar + 1 oy fevralga emas, mart boshiga tushib ketmasin.
  if (date.getDate() !== day) date.setDate(0)
  return toIso(date)
}

export function daysUntil(iso) {
  const target = new Date(`${iso}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((target - today) / 86400000)
}
