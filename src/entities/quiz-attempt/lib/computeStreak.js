function dateKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

export function computeStreak(attempts) {
  const dateKeys = new Set(attempts.filter((a) => a.createdAt).map((a) => dateKey(a.createdAt)))

  let streak = 0
  const cursor = new Date()
  if (!dateKeys.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  while (dateKeys.has(dateKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
