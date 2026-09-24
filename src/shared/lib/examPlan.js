// Imtihongacha tayyorgarlik tavsiyasi. Kuniga 3 tadan ko'p bilet tavsiya qilinmaydi.
export const MAX_TICKETS_PER_DAY = 3

// Nechta kun qolgandan boshlab "imtihon rejimi"da mashq qilish tavsiya etiladi.
const EXAM_PRACTICE_DAYS = 3

/**
 * @param {number} days           imtihongacha qolgan kunlar (> 0)
 * @param {number} ticketsLeft    foydalanuvchiga ochiq va hali yechilmagan biletlar soni
 * @param {boolean} isPremiumActive
 * @returns {string}
 */
export function getExamRecommendation({ days, ticketsLeft, isPremiumActive }) {
  const prefix = `Imtihongacha ${days} kun.`
  const fitsInTime = ticketsLeft <= days * MAX_TICKETS_PER_DAY

  if (fitsInTime) {
    if (ticketsLeft === 0) {
      return "Ochiq biletlarning hammasini yechib bo'ldingiz. Endi xatolaringiz ustida ishlang."
    }
    const perDay = Math.ceil(ticketsLeft / days)
    return `${prefix} Kuniga ${perDay} ta bilet yechsangiz, hammasini ulgurasiz.`
  }

  // Hamma biletni kuniga 3 tadan ham ulgurib bo'lmaydi.
  if (days >= EXAM_PRACTICE_DAYS) {
    return `${prefix} Kuniga ${MAX_TICKETS_PER_DAY} ta bilet yeching va xatolaringizni takrorlang.`
  }
  return isPremiumActive
    ? `${prefix} Imtihon rejimida mashq qiling va xatolaringizni takrorlang.`
    : `${prefix} Biletlarni yechishda davom eting va xatolaringizni takrorlang.`
}
