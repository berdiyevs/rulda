import { uzDayNumber } from '../../../shared/lib/uzDate'

// Xato qilingan savol 1 kun, 3 kun va 7 kundan keyin qayta so'raladi.
// Jadval alohida saqlanmaydi: mavjud urinishlardagi to'g'ri/xato javoblar va vaqtdan hisoblanadi.
const NEXT_INTERVALS_DAYS = [3, 7]
const FIRST_INTERVAL_DAYS = 1

export const REVIEW_SESSION_SIZE_FREE = 10
export const REVIEW_SESSION_SIZE_PREMIUM = 20

/**
 * Bugun takrorlash kerak bo'lgan savollar ID'lari (muddati oldin kelgani birinchi).
 *
 * Qoidalar (kunlar O'zbekiston vaqti bo'yicha):
 *  - xato javob savolni kuzatuvga oladi: 1 kundan keyin takrorlanadi;
 *  - muddati kelgach berilgan to'g'ri javob keyingi bosqichga o'tkazadi (3 kun, keyin 7 kun);
 *  - 7 kunlik bosqichdan keyingi to'g'ri javob savolni "o'zlashtirilgan" qiladi va ro'yxatdan chiqaradi;
 *  - muddatdan oldin berilgan to'g'ri javob hisobga olinmaydi;
 *  - istalgan xato jadvalni boshidan boshlaydi.
 */
export function getReviewDueIds(attempts, today) {
  const state = new Map() // savol ID -> { stage, dueDay }

  const ordered = [...attempts].sort((a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0))
  for (const attempt of ordered) {
    if (!attempt.createdAt) continue
    const day = uzDayNumber(attempt.createdAt)

    for (const id of attempt.correctQuestionIds || []) {
      const current = state.get(id)
      if (!current || day < current.dueDay) continue
      const nextStage = current.stage + 1
      if (nextStage > NEXT_INTERVALS_DAYS.length) state.delete(id)
      else state.set(id, { stage: nextStage, dueDay: day + NEXT_INTERVALS_DAYS[nextStage - 1] })
    }

    // Xatolar keyin ishlanadi: bir urinishda savol ham to'g'ri, ham xato bo'lmaydi, lekin tartib aniq bo'lsin.
    for (const id of attempt.wrongQuestionIds || []) {
      state.set(id, { stage: 0, dueDay: day + FIRST_INTERVAL_DAYS })
    }
  }

  return Array.from(state.entries())
    .filter(([, s]) => s.dueDay <= today)
    .sort((a, b) => a[1].dueDay - b[1].dueDay)
    .map(([id]) => id)
}

// Bugun (O'zbekiston kuni) takrorlash sessiyasi yechilganmi? Bepul foydalanuvchi kuniga bitta yecha oladi.
export function hasReviewedToday(attempts, today) {
  return attempts.some((a) => a.mode === 'review' && a.createdAt && uzDayNumber(a.createdAt) === today)
}
