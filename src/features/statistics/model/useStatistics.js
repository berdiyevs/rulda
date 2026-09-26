import { useEffect, useState } from 'react'
import { fetchAllAttempts, computeStreak, getMistakeIds, getLatestResults } from '../../../entities/quiz-attempt'
import { fetchQuestions, filterQuestionsByTopic, uniqueQuestions } from '../../../entities/question'
import { TOPICS } from '../../../entities/category'
import { useAuth } from '../../../entities/user'

// Faqat haqiqatda javob berilgan savollar hisobga olinadi (tugallanmagan urinishlarda ham to'g'ri chiqadi).
function answeredOf(attempt) {
  return (attempt.correctCount || 0) + (attempt.wrongCount || 0)
}

function percentOf(attempt) {
  if (!attempt) return null
  const total = attempt.totalQuestions || answeredOf(attempt)
  if (!total) return null
  return Math.round((attempt.correctCount / total) * 100)
}

// Kichik foizlar 0% bo'lib ko'rinmasligi uchun 10% gacha bitta kasr xonasi bilan.
function roundPercent(value) {
  return value > 0 && value < 10 ? Math.round(value * 10) / 10 : Math.round(value)
}

function computeStatistics(attempts, allQuestions) {
  const questions = uniqueQuestions(allQuestions)
  // Har bir savolning oxirgi natijasi — barcha rejimlar (bilet, mashq, takrorlash, imtihon) hisobga olinadi.
  // Oldin faqat "mavzular" rejimi hisoblangani uchun biletlar yechilsa ham tayyorlik 0% qolardi.
  const latest = getLatestResults(attempts)
  const questionIds = new Set(questions.map((q) => q.id))
  const masteredCount = Array.from(latest.entries()).filter(([id, correct]) => correct && questionIds.has(id)).length
  const seenCount = Array.from(latest.keys()).filter((id) => questionIds.has(id)).length
  const readinessPercent = questions.length ? roundPercent((masteredCount / questions.length) * 100) : 0

  const topicBreakdown = TOPICS.map((t) => {
    const topicQuestions = filterQuestionsByTopic(questions, t.id)
    const seen = topicQuestions.filter((q) => latest.has(q.id))
    const correct = seen.filter((q) => latest.get(q.id)).length
    return {
      id: t.id,
      title: t.title,
      seenCount: seen.length,
      totalCount: topicQuestions.length,
      percent: seen.length ? Math.round((correct / seen.length) * 100) : null,
    }
  })

  // Eng zaif mavzu: kamida 5 ta savol yechilgan mavzular orasidan.
  const weakestTopic =
    topicBreakdown
      .filter((t) => t.id !== 'all' && t.percent != null && t.seenCount >= 5)
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
    masteredCount,
    seenCount,
    totalQuestionCount: questions.length,
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
