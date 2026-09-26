// Imtihongacha tayyorgarlik tavsiyasi. Kuniga 3 tadan ko'p bilet tavsiya qilinmaydi.
export const MAX_TICKETS_PER_DAY = 3

// Nechta kun qolgandan boshlab "imtihon rejimi"da mashq qilish tavsiya etiladi.
const EXAM_PRACTICE_DAYS = 3

/**
 * @param {number} days           imtihongacha qolgan kunlar (> 0)
 * @param {number} ticketsLeft    foydalanuvchiga ochiq va hali o'tilmagan biletlar soni
 * @param {number} [totalLeft]    barcha (qulflanganlari bilan) hali o'tilmagan biletlar soni
 * @param {boolean} isPremiumActive
 * @returns {string}
 */
export function getExamRecommendation({ days, ticketsLeft, totalLeft = ticketsLeft, isPremiumActive }) {
  const prefix = `Imtihongacha ${days} kun.`
  const perDay = (count) => Math.ceil(count / days)

  // Bepul foydalanuvchi: ochiq biletlar kam, lekin reja butun baza bo'yicha aytiladi —
  // "hammasini ulgurasiz" faqat haqiqatan hammasi nazarda tutilganda yoziladi.
  if (!isPremiumActive && totalLeft > ticketsLeft) {
    const freePart =
      ticketsLeft === 0
        ? "Bepul biletlarni yechib bo'ldingiz."
        : `Bepul biletlardan ${ticketsLeft} tasi qoldi.`
    return `${prefix} ${freePart} Barcha ${totalLeft} ta biletni ulgurish uchun kuniga ${perDay(totalLeft)} ta bilet kerak bo'ladi (Premium).`
  }

  if (ticketsLeft === 0) {
    return "Barcha biletlarni o'tdingiz. Endi xatolaringiz ustida ishlang va imtihon rejimida mashq qiling."
  }

  if (ticketsLeft <= days * MAX_TICKETS_PER_DAY) {
    const count = perDay(ticketsLeft)
    return `${prefix} ${ticketsLeft} ta bilet qoldi: kuniga ${count} ta bilet yechsangiz, hammasini ulgurasiz.`
  }

  // Hamma biletni kuniga 3 tadan ham ulgurib bo'lmaydi.
  if (days >= EXAM_PRACTICE_DAYS) {
    return `${prefix} ${ticketsLeft} ta bilet qoldi. Kuniga ${MAX_TICKETS_PER_DAY} ta bilet yeching va xatolaringizni takrorlang.`
  }
  return isPremiumActive
    ? `${prefix} Imtihon rejimida mashq qiling va xatolaringizni takrorlang.`
    : `${prefix} Biletlarni yechishda davom eting va xatolaringizni takrorlang.`
}
