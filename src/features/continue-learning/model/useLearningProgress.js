import { useEffect, useMemo, useState } from 'react'
import { fetchAllAttempts, computeStreak, getMistakeIds } from '../../../entities/quiz-attempt'
import { fetchQuestions } from '../../../entities/question'
import { groupByTicket } from '../../../entities/ticket'
import { TOPICS } from '../../../entities/category'
import { useAuth } from '../../../entities/user'
import { isTicketLocked } from '../../../shared/lib/premium'

function answeredOf(attempt) {
  return (attempt.correctCount || 0) + (attempt.wrongCount || 0)
}

// Asosiy sahifa uchun bitta so'rovda hamma narsa: davom ettirish, xatolar, mavzular natijasi, seriya.
export function useLearningProgress() {
  const { user, isPremiumActive } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let isMounted = true
    Promise.all([fetchAllAttempts(), fetchQuestions()])
      .then(([attempts, questions]) => {
        if (isMounted) setData({ attempts, questions })
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [user])

  const progress = useMemo(() => {
    if (!data) return null
    const { attempts, questions } = data

    const ticketIds = groupByTicket(questions).map((t) => t.ticketId)
    const ticketAttempts = attempts.filter((a) => a.topic?.startsWith('ticket-'))
    const ticketIdOf = (a) => Number(a.topic.slice('ticket-'.length))

    // Bilet "yechilgan" — hamma savoliga javob berilgan bo'lsa.
    const solved = new Set(
      ticketAttempts.filter((a) => answeredOf(a) >= a.totalQuestions).map((a) => ticketIdOf(a)),
    )
    const lastAttempt = ticketAttempts.length ? ticketAttempts[ticketAttempts.length - 1] : null
    const lastTicketId = lastAttempt ? ticketIdOf(lastAttempt) : null

    const unsolved = ticketIds.filter((id) => !solved.has(id))
    const nextTicketId =
      unsolved.find((id) => lastTicketId != null && id > lastTicketId) ?? unsolved[0] ?? null

    const questionIds = new Set(questions.map((q) => q.id))
    const mistakeIds = getMistakeIds(attempts).filter((id) => questionIds.has(id))

    const latestByTopic = {}
    TOPICS.forEach((topic) => {
      const list = attempts.filter((a) => a.topic === topic.id)
      latestByTopic[topic.id] = list.length ? list[list.length - 1] : null
    })

    return {
      lastAttempt,
      lastTicketId,
      nextTicketId,
      mistakeIds,
      latestByTopic,
      streak: computeStreak(attempts),
      // Foydalanuvchiga ochiq va hali yechilmagan biletlar soni (imtihongacha tavsiya uchun).
      unsolvedAvailableCount: unsolved.filter((id) => !isTicketLocked(id, isPremiumActive)).length,
    }
  }, [data, isPremiumActive])

  return { progress, loading }
}
