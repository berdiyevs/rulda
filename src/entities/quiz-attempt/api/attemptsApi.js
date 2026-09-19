import { apiFetch } from '../../../shared/api/client'

function toApiAttempt(attempt) {
  return {
    topic: attempt.topic,
    mode: attempt.mode,
    correct_count: attempt.correctCount,
    wrong_count: attempt.wrongCount,
    total_questions: attempt.totalQuestions,
    passed: attempt.passed,
    wrong_question_ids: attempt.wrongQuestionIds || [],
    correct_question_ids: attempt.correctQuestionIds || [],
  }
}

function fromApiAttempt(data) {
  return {
    id: data.id,
    topic: data.topic,
    mode: data.mode,
    correctCount: data.correct_count,
    wrongCount: data.wrong_count,
    totalQuestions: data.total_questions,
    passed: data.passed,
    wrongQuestionIds: data.wrong_question_ids,
    correctQuestionIds: data.correct_question_ids,
    createdAt: data.created_at ? new Date(data.created_at) : null,
  }
}

export async function saveAttempt(attempt) {
  await apiFetch('/attempts', { method: 'POST', body: toApiAttempt(attempt) })
}

export async function fetchAllAttempts() {
  const data = await apiFetch('/attempts')
  return data.map(fromApiAttempt)
}

export async function fetchLatestAttempt(topic) {
  const attempts = await fetchAllAttempts()
  const topicAttempts = attempts.filter((a) => a.topic === topic)
  return topicAttempts.length ? topicAttempts[topicAttempts.length - 1] : null
}

export async function fetchAllLatestAttempts(topics) {
  const attempts = await fetchAllAttempts()
  return Object.fromEntries(
    topics.map((topic) => {
      const topicAttempts = attempts.filter((a) => a.topic === topic)
      return [topic, topicAttempts.length ? topicAttempts[topicAttempts.length - 1] : null]
    }),
  )
}
