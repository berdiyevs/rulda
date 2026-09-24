import { useEffect, useState } from 'react'
import { fetchAllAttempts, computeStreak, getMistakeIds } from '../../../entities/quiz-attempt'
import { fetchQuestions } from '../../../entities/question'
import { TOPICS } from '../../../entities/category'
import { useAuth } from '../../../entities/user'

// Faqat haqiqatda javob berilgan savollar hisobga olinadi (tugallanmagan urinishlarda ham to'g'ri chiqadi).
function answeredOf(attempt) {
  return (attempt.correctCount || 0) + (attempt.wrongCount || 0)
}

function percentOf(attempt) {
  if (!attempt) return null
  const answered = answeredOf(attempt)
  if (!answered) return null
  return Math.round((attempt.correctCount / answered) * 100)
}

function computeStatistics(attempts, questions) {
  const latestByTopic = {}
  TOPICS.forEach((t) => {
    const topicAttempts = attempts.filter((a) => a.topic === t.id)
    latestByTopic[t.id] = topicAttempts.length ? topicAttempts[topicAttempts.length - 1] : null
  })

  const topicBreakdown = TOPICS.map((t) => ({
    id: t.id,
    title: t.title,
    percent: percentOf(latestByTopic[t.id]),
  }))

  const availablePercents = topicBreakdown.map((t) => t.percent).filter((p) => p != null)
  const readinessPercent = availablePercents.length
    ? Math.round(availablePercents.reduce((sum, p) => sum + p, 0) / availablePercents.length)
    : 0

  const weakestTopic =
    topicBreakdown
      .filter((t) => t.id !== 'all' && t.percent != null)
      .sort((a, b) => a.percent - b.percent)[0] || null

  const examAttempts = attempts.filter((a) => a.mode === 'exam')
  const examStats = {
    totalExams: examAttempts.length,
    passedExams: examAttempts.filter((a) => a.passed).length,
    bestPercent: examAttempts.length ? Math.max(...examAttempts.map((a) => percentOf(a) ?? 0)) : 0,
  }

  const questionById = new Map(questions.map((q) => [q.id, q]))
  const mistakeQuestions = getMistakeIds(attempts)
    .map((id) => questionById.get(id))
    .filter(Boolean)

  const totalAttempts = attempts.length
  const totalQuestionsAnswered = attempts.reduce((sum, a) => sum + answeredOf(a), 0)
  const totalCorrect = attempts.reduce((sum, a) => sum + (a.correctCount || 0), 0)
  const overallAccuracy = totalQuestionsAnswered
    ? Math.round((totalCorrect / totalQuestionsAnswered) * 100)
    : 0

  const history = attempts.slice(-10).map((a) => ({
    id: a.id,
    percent: percentOf(a) ?? 0,
    passed: a.passed,
    mode: a.mode,
    date: a.createdAt,
  }))

  const streak = computeStreak(attempts)

  return {
    readinessPercent,
    topicBreakdown,
    weakestTopic,
    examStats,
    mistakeQuestions,
    totals: { totalAttempts, totalQuestionsAnswered, totalCorrect, overallAccuracy },
    history,
    streak,
  }
}

export function useStatistics() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return
    let isMounted = true

    Promise.all([fetchAllAttempts(), fetchQuestions()])
      .then(([attempts, questions]) => {
        if (!isMounted) return
        setStats(computeStatistics(attempts, questions))
      })
      .catch((err) => {
        if (isMounted) setError(err.message)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [user])

  return { stats, loading, error }
}
