import { useEffect, useMemo, useState } from 'react'
import {
  useAttempts,
  computeStreak,
  getMistakeIds,
  getReviewDueIds,
  hasReviewedToday,
} from '../../../entities/quiz-attempt'
import { uzToday } from '../../../shared/lib/uzDate'
import { fetchQuestions } from '../../../entities/question'
import {
  groupByTicket,
  getNextTicket,
  lastAttemptByTicket,
  ticketIdOf,
  ticketStatusOf,
} from '../../../entities/ticket'
import { TOPICS } from '../../../entities/category'
import { useAuth } from '../../../entities/user'
import { isTicketLocked } from '../../../shared/lib/premium'

// Asosiy sahifa uchun bitta so'rovda hamma narsa: davom ettirish, xatolar, mavzular natijasi, seriya.
export function useLearningProgress() {
  const { user, isPremiumActive } = useAuth()
  const { attempts, loading: attemptsLoading } = useAttempts()
  const [questions, setQuestions] = useState(null)
  const [questionsLoading, setQuestionsLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let isMounted = true
    fetchQuestions()
      .then((data) => {
        if (isMounted) setQuestions(data)
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setQuestionsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [user])

  const loading = attemptsLoading || questionsLoading

  const progress = useMemo(() => {
    if (!questions) return null

    const ticketIds = groupByTicket(questions).map((t) => t.ticketId)
    const ticketAttempts = attempts.filter((a) => ticketIdOf(a) != null)
    const lastAttempt = ticketAttempts.length ? ticketAttempts[ticketAttempts.length - 1] : null
    const lastTicketId = lastAttempt ? ticketIdOf(lastAttempt) : null
    const isLocked = (id) => isTicketLocked(id, isPremiumActive)
    // Biletlar sahifasi bilan bir xil qoida (entities/ticket): oxirgidan keyingi, hali o'tilmagan bilet.
    const nextTicket = getNextTicket(ticketIds, attempts, isLocked)
    const lastByTicket = lastAttemptByTicket(attempts)
    const openNotPassed = ticketIds.filter(
      (id) => !isLocked(id) && ticketStatusOf(lastByTicket.get(id)) !== 'passed',
    )

    const questionIds = new Set(questions.map((q) => q.id))
    const mistakeIds = getMistakeIds(attempts).filter((id) => questionIds.has(id))

    // Bugungi takrorlash: muddati kelgan (va hali mavjud) savollar.
    const today = uzToday()
    const reviewDueIds = getReviewDueIds(attempts, today).filter((id) => questionIds.has(id))

    const latestByTopic = {}
    TOPICS.forEach((topic) => {
      const list = attempts.filter((a) => a.topic === topic.id)
      latestByTopic[topic.id] = list.length ? list[list.length - 1] : null
    })

    return {
      lastAttempt,
      lastTicketId,
      nextTicketId: nextTicket?.ticketId ?? null,
      mistakeIds,
      reviewDueIds,
      reviewedToday: hasReviewedToday(attempts, today),
      latestByTopic,
      streak: computeStreak(attempts),
      // Imtihongacha tavsiya uchun: ochiq va hali o'tilmagan biletlar, jami o'tilmaganlar.
      unsolvedAvailableCount: openNotPassed.length,
      unsolvedTotalCount: ticketIds.filter((id) => ticketStatusOf(lastByTicket.get(id)) !== 'passed').length,
    }
  }, [attempts, questions, isPremiumActive])

  return { progress, loading }
}
