import { apiFetch } from '../../../shared/api/client'
import { claimGuestAttempts, restoreGuestAttempts } from '../lib/guestAttempts'

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

let syncPromise = null

// Mehmon natijalarini hisobga ko'chiradi. Bir vaqtning o'zida bitta jarayon ishlaydi,
// shuning uchun bir nechta joydan chaqirilsa ham natijalar takrorlanmaydi. Saqlanganlar sonini qaytaradi.
export function syncGuestAttempts() {
  if (syncPromise) return syncPromise
  const list = claimGuestAttempts()
  if (list.length === 0) return Promise.resolve(0)

  syncPromise = (async () => {
    const failed = []
    let saved = 0
    for (const attempt of list) {
      try {
        await saveAttempt(attempt)
        saved += 1
      } catch (error) {
        // Server rad etgan urinish (masalan, Premium talab qiladigan) qayta yuborilmaydi.
        // Boshqa xatolarda (tarmoq, server, muddati o'tgan sessiya) keyingi safarga qoldiriladi.
        if (![400, 403, 422].includes(error.status)) failed.push(attempt)
      }
    }
    if (failed.length > 0) restoreGuestAttempts(failed)
    return saved
  })().finally(() => {
    syncPromise = null
  })
  return syncPromise
}

export async function fetchAllAttempts() {
  await syncGuestAttempts()
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
