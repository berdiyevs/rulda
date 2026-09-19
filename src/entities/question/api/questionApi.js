import { apiFetch } from '../../../shared/api/client'

export async function fetchQuestions() {
  return apiFetch('/questions', { auth: false })
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
