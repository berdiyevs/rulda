export function groupByTicket(questions) {
  const map = new Map()

  for (const question of questions) {
    if (!map.has(question.ticketId)) map.set(question.ticketId, [])
    map.get(question.ticketId).push(question)
  }

  return [...map.entries()]
    .map(([ticketId, ticketQuestions]) => ({ ticketId, questions: ticketQuestions }))
    .sort((a, b) => a.ticketId - b.ticketId)
}
