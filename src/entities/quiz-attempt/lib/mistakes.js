// Har bir savolning eng so'nggi natijasi: savol ID -> true (to'g'ri) / false (xato).
// Barcha rejimlar hisobga olinadi: bilet, mashq, takrorlash, imtihon.
export function getLatestResults(attempts) {
  const latest = new Map()
  attempts.forEach((attempt) => {
    const time = attempt.createdAt?.getTime() ?? 0
    const apply = (id, correct) => {
      const prev = latest.get(id)
      if (!prev || time >= prev.time) latest.set(id, { correct, time })
    }
    ;(attempt.wrongQuestionIds || []).forEach((id) => apply(id, false))
    ;(attempt.correctQuestionIds || []).forEach((id) => apply(id, true))
  })
  return new Map(Array.from(latest.entries()).map(([id, s]) => [id, s.correct]))
}

// Har bir savolning eng so'nggi holatiga qarab, hozir xato deb hisoblanadigan savollar ID'lari.
export function getMistakeIds(attempts) {
  return Array.from(getLatestResults(attempts).entries())
    .filter(([, correct]) => !correct)
    .map(([id]) => id)
}
