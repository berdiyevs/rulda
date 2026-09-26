import { uzDayNumber, uzToday } from '../../../shared/lib/uzDate'

// Kunlik maqsad: kuniga kamida 10 ta savolga javob berish. 20 ta (to'liq bilet) yangi
// foydalanuvchi uchun og'ir edi va seriya deyarli hech qachon boshlanmasdi.
export const DAILY_GOAL = 10

function answeredOf(attempt) {
  return (attempt.correctCount || 0) + (attempt.wrongCount || 0)
}

// O'zbekiston kuni (UTC+5) -> shu kuni javob berilgan savollar soni.
function answeredByDay(attempts) {
  const byDay = new Map()
  attempts.forEach((attempt) => {
    if (!attempt.createdAt) return
    const day = uzDayNumber(attempt.createdAt)
    byDay.set(day, (byDay.get(day) || 0) + answeredOf(attempt))
  })
  return byDay
}

export function getTodayProgress(attempts, today = uzToday()) {
  const answered = answeredByDay(attempts).get(today) || 0
  return { answered, goal: DAILY_GOAL, met: answered >= DAILY_GOAL, remaining: Math.max(0, DAILY_GOAL - answered) }
}

// Seriya: maqsad bajarilgan ketma-ket kunlar. Bugungi maqsad hali bajarilmagan bo'lsa,
// seriya kechagacha hisoblanadi (bugun tugamaguncha seriya uzilmaydi).
export function computeStreak(attempts, today = uzToday()) {
  const byDay = answeredByDay(attempts)
  const isGoalDay = (day) => (byDay.get(day) || 0) >= DAILY_GOAL

  let cursor = isGoalDay(today) ? today : today - 1
  let streak = 0
  while (isGoalDay(cursor)) {
    streak += 1
    cursor -= 1
  }
  return streak
}
