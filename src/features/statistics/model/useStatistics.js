import { useEffect, useState } from 'react'
import { fetchAllAttempts, computeStreak } from '../../../entities/quiz-attempt'
import { fetchQuestions } from '../../../entities/question'
import { TOPICS } from '../../../entities/category'
import { useAuth } from '../../../entities/user'

function percentOf(attempt) {
  if (!attempt || !attempt.totalQuestions) return null
  return Math.round((attempt.correctCount / attempt.totalQuestions) * 100)
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
      .filter((t) => t.percent != null)
      .sort((a, b) => a.percent - b.percent)[0] || null

  const examAttempts = attempts.filter((a) => a.mode === 'exam')
  const examStats = {
    totalExams: examAttempts.length,
    passedExams: examAttempts.filter((a) => a.passed).length,
    bestPercent: examAttempts.length ? Math.max(...examAttempts.map((a) => percentOf(a) ?? 0)) : 0,
  }

  const latestStatusByQuestion = new Map()
  attempts.forEach((a) => {
    const time = a.createdAt?.getTime() ?? 0
    const applyStatus = (id, correct) => {
      const prev = latestStatusByQuestion.get(id)
      if (!prev || time >= prev.time) latestStatusByQuestion.set(id, { correct, time })
    }
    ;(a.wrongQuestionIds || []).forEach((id) => applyStatus(id, false))
    ;(a.correctQuestionIds || []).forEach((id) => applyStatus(id, true))
  })
  const questionById = new Map(questions.map((q) => [q.id, q]))
  const mistakeQuestions = Array.from(latestStatusByQuestion.entries())
    .filter(([, status]) => !status.correct)
    .map(([id]) => questionById.get(id))
    .filter(Boolean)

  const totalAttempts = attempts.length
  const totalQuestionsAnswered = attempts.reduce((sum, a) => sum + (a.totalQuestions || 0), 0)
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

    Promise.all([fetchAllAttempts(user.uid), fetchQuestions()])
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
