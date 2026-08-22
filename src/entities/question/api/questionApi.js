export async function fetchQuestions() {
  const response = await fetch('/data/questions.json')
  if (!response.ok) {
    throw new Error('Savollarni yuklashda xatolik yuz berdi')
  }
  return response.json()
}

export function filterQuestionsByTopic(questions, topic) {
  switch (topic) {
    case 'signs':
      return questions.filter((q) => Boolean(q.image_url))
    case 'theory':
      return questions.filter((q) => !q.image_url)
    case 'all':
    default:
      return questions
  }
}
