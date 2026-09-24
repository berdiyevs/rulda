// Har bir savolning eng so'nggi holatiga qarab, hozir xato deb hisoblanadigan savollar ID'lari.
export function getMistakeIds(attempts) {
  const latestStatusByQuestion = new Map()
  attempts.forEach((attempt) => {
    const time = attempt.createdAt?.getTime() ?? 0
    const applyStatus = (id, correct) => {
      const prev = latestStatusByQuestion.get(id)
      if (!prev || time >= prev.time) latestStatusByQuestion.set(id, { correct, time })
    }
    ;(attempt.wrongQuestionIds || []).forEach((id) => applyStatus(id, false))
    ;(attempt.correctQuestionIds || []).forEach((id) => applyStatus(id, true))
  })
  return Array.from(latestStatusByQuestion.entries())
    .filter(([, status]) => !status.correct)
    .map(([id]) => id)
}
