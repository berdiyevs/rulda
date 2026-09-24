import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { notifications } from '@mantine/notifications'
import { fetchQuestions, filterQuestionsByTopic } from '../../../entities/question'
import {
  saveAttempt,
  addGuestAttempt,
  useAttempts,
  isResumableMode,
  ownerOf,
  saveSession,
  loadSavedSession,
  clearSavedSession,
  sessionMatches,
  getTodayProgress,
  computeStreak,
} from '../../../entities/quiz-attempt'
import { useAuth } from '../../../entities/user'
import { shuffleArray, pickRandom } from '../../../shared/lib/shuffle'
import { useCountdown } from '../../../shared/lib/useCountdown'
import { exitFullscreen } from '../../../shared/lib/fullscreen'
import { FREE_TICKET_LIMIT } from '../../../shared/lib/premium'
import { track } from '../../../shared/lib/analytics'

const PRACTICE_SESSION_SIZE = 20
const EXAM_SESSION_SIZE = 20
const EXAM_DURATION_SECONDS = 25 * 60
const EXAM_MAX_MISTAKES = 2
const MINI_TEST_SIZE = 10
const EMPTY_QUESTION_IDS = []

function prepareSession(allQuestions, topic, mode, ticketId, questionIds, questionCount) {
  if (mode === 'ticket') {
    const pool = allQuestions.filter((q) => q.ticketId === Number(ticketId))
    return pool.map((q) => ({ ...q, options: shuffleArray(q.options) }))
  }

  if (mode === 'mini') {
    // Mehmon uchun mini-test: faqat bepul (1–3) biletlardagi savollardan tasodifiy tanlanadi.
    const pool = allQuestions.filter((q) => q.ticketId >= 1 && q.ticketId <= FREE_TICKET_LIMIT)
    return pickRandom(pool, MINI_TEST_SIZE).map((q) => ({ ...q, options: shuffleArray(q.options) }))
  }

  if (mode === 'mistakes' || mode === 'review') {
    const idSet = new Set(questionIds)
    const pool = allQuestions.filter((q) => idSet.has(q.id))
    return pool.map((q) => ({ ...q, options: shuffleArray(q.options) }))
  }

  const pool = mode === 'exam' ? allQuestions : filterQuestionsByTopic(allQuestions, topic)
  const size = mode === 'exam' ? EXAM_SESSION_SIZE : Math.min(questionCount || PRACTICE_SESSION_SIZE, pool.length)
  const picked = pickRandom(pool, size)
  return picked.map((q) => ({
    ...q,
    options: shuffleArray(q.options),
  }))
}

// Saqlangan yozuvdan savollar va variantlarni avvalgi tartibda tiklaydi. Bironta savol topilmasa, null qaytaradi.
function restoreSession(saved, allQuestions, { mode, ticketId, topic, user }) {
  if (!sessionMatches(saved, { mode, ticketId, topic })) return null
  if (saved.owner !== 'guest' && saved.owner !== ownerOf(user)) return null

  const byId = new Map(allQuestions.map((q) => [q.id, q]))
  const questions = []
  for (const id of saved.questionIds) {
    const question = byId.get(id)
    const order = saved.optionOrders?.[id]
    if (!question || !order) return null
    const options = order.map((optionId) => question.options.find((o) => o.id === optionId))
    if (options.some((o) => !o) || options.length !== question.options.length) return null
    questions.push({ ...question, options })
  }
  if (saved.statuses.length !== questions.length) return null
  return {
    questions,
    statuses: saved.statuses,
    currentIndex: Math.min(saved.currentIndex, questions.length - 1),
    remainingSeconds: saved.remainingSeconds,
  }
}

export function useQuizEngine({
  topic,
  mode,
  ticketId,
  questionIds = EMPTY_QUESTION_IDS,
  questionCount = PRACTICE_SESSION_SIZE,
  durationMinutes = 0,
  maxMistakes = null,
  feedbackMode = 'instant',
  resume = false,
  sessionSearch = '',
}) {
  const { user } = useAuth()
  const { attempts, refresh: refreshAttempts } = useAttempts()
  const attemptsRef = useRef(attempts)
  attemptsRef.current = attempts
  const [sourceQuestions, setSourceQuestions] = useState([])
  const [sessionQuestions, setSessionQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [stepStatuses, setStepStatuses] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [finished, setFinished] = useState(false)
  const [result, setResult] = useState(null)
  const [pendingFinish, setPendingFinish] = useState(null)
  const hasSavedRef = useRef(false)
  const resumedRemainingRef = useRef(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    fetchQuestions()
      .then((data) => {
        if (isMounted) setSourceQuestions(data)
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
  }, [])

  useEffect(() => {
    if (sourceQuestions.length === 0) return
    const saved = resume && isResumableMode(mode) ? loadSavedSession() : null
    const resumed = saved ? restoreSession(saved, sourceQuestions, { mode, ticketId, topic, user }) : null
    const session = resumed
      ? resumed.questions
      : prepareSession(sourceQuestions, topic, mode, ticketId, questionIds, questionCount)
    if (session.length === 0) {
      setError('Savollar topilmadi.')
      return
    }
    resumedRemainingRef.current = resumed ? resumed.remainingSeconds : null
    setSessionQuestions(session)
    setStepStatuses(resumed ? resumed.statuses : Array.from({ length: session.length }, () => 'idle'))
    setCurrentIndex(resumed ? resumed.currentIndex : 0)
    setSelectedOption(null)
    setIsAnswered(false)
    setFinished(false)
    setResult(null)
    setPendingFinish(null)
    hasSavedRef.current = false
    if (!resumed) track(mode === 'mini' ? 'mini_test_start' : 'test_start')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceQuestions, topic, mode, ticketId, questionIds, questionCount])

  const finishSession = useCallback(
    (statuses, endReason = 'completed') => {
      if (hasSavedRef.current) return
      hasSavedRef.current = true
      if (isResumableMode(mode)) clearSavedSession()

      const correctCount = statuses.filter((s) => s === 'completed').length
      const wrongCount = statuses.filter((s) => s === 'wrong').length
      const totalQuestions = sessionQuestions.length
      const answeredCount = correctCount + wrongCount
      // Tugallanmagan (qisman yoki vaqti tugagan) urinish hech qachon "o'tdi" hisoblanmaydi.
      let passed
      if (answeredCount < totalQuestions) passed = false
      else if (mode === 'exam') passed = wrongCount <= EXAM_MAX_MISTAKES
      else if (mode !== 'mistakes' && maxMistakes != null) passed = wrongCount <= maxMistakes
      else passed = correctCount / totalQuestions >= 0.7
      const attemptTopic =
        mode === 'ticket' ? `ticket-${ticketId}` : mode === 'mistakes' ? 'mistakes' : mode === 'review' ? 'review' : mode === 'mini' ? 'mini-test' : topic

      const wrongQuestionIds = statuses
        .map((s, i) => (s === 'wrong' ? sessionQuestions[i]?.id : null))
        .filter((id) => id != null)
      const correctQuestionIds = statuses
        .map((s, i) => (s === 'completed' ? sessionQuestions[i]?.id : null))
        .filter((id) => id != null)

      const summary = {
        correctCount,
        wrongCount,
        totalQuestions,
        passed,
        topic: attemptTopic,
        mode: mode === 'mini' ? 'practice' : mode,
        wrongQuestionIds,
        correctQuestionIds,
        // Quyidagi maydonlar faqat natija sahifasi uchun, backend'ga yuborilmaydi.
        endReason,
        isMini: mode === 'mini',
        isGuest: !user,
        ticketCount: new Set(sourceQuestions.map((q) => q.ticketId)).size,
      }
      setResult(summary)
      setFinished(true)
      track(mode === 'mini' ? 'mini_test_finish' : 'test_finish')
      if (mode === 'exam') exitFullscreen()

      if (user) {
        // Maqsad shu testda bajarildimi (bugun avval bajarilmagan edi)? Bajarilgan bo'lsa, kichik tabrik.
        const goalMetBefore = getTodayProgress(attemptsRef.current).met
        saveAttempt(summary)
          .then(() => refreshAttempts())
          .then((data) => {
            if (!data || goalMetBefore || !getTodayProgress(data).met) return
            notifications.show({
              color: 'success',
              title: 'Bugungi maqsad bajarildi!',
              message: `Kuniga 20 ta savol. Seriyangiz: ${computeStreak(data)} kun.`,
            })
          })
          .catch((error) => {
            // Masalan, bepul foydalanuvchining kunlik takrorlash cheklovi.
            if (error.status === 403) {
              notifications.show({ color: 'warning', title: 'Natija saqlanmadi', message: error.message })
            }
          })
      } else {
        addGuestAttempt(summary)
      }
    },
    [mode, topic, ticketId, user, sessionQuestions, sourceQuestions, maxMistakes, refreshAttempts],
  )

  const hasTimeLimit = mode === 'exam' || ((mode === 'practice' || mode === 'ticket') && durationMinutes > 0)
  const durationSeconds = mode === 'exam' ? EXAM_DURATION_SECONDS : durationMinutes * 60

  const timer = useCountdown(durationSeconds || EXAM_DURATION_SECONDS, {
    autoStart: false,
    onExpire: () => finishSession(stepStatuses, 'time'),
  })

  useEffect(() => {
    if (hasTimeLimit && sessionQuestions.length > 0 && !finished) {
      timer.reset(resumedRemainingRef.current ?? durationSeconds)
      resumedRemainingRef.current = null
      timer.start()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasTimeLimit, sessionQuestions.length])

  const currentQuestion = sessionQuestions[currentIndex]

  const advance = useCallback(
    (statuses, finishReason) => {
      if (finishReason) {
        if (hasTimeLimit) timer.stop()
        finishSession(statuses, finishReason)
      } else {
        setCurrentIndex((i) => i + 1)
        setSelectedOption(null)
        setIsAnswered(false)
        setPendingFinish(null)
      }
    },
    [hasTimeLimit, timer, finishSession],
  )

  const handleAnswer = useCallback(
    (option) => {
      if (isAnswered || !currentQuestion) return

      track('first_answer')
      setSelectedOption(option)
      setIsAnswered(true)

      const next = [...stepStatuses]
      next[currentIndex] = option.is_correct ? 'completed' : 'wrong'
      setStepStatuses(next)

      const wrongSoFar = next.filter((s) => s === 'wrong').length
      const examFailed = mode === 'exam' && wrongSoFar > EXAM_MAX_MISTAKES
      const mistakesCapFailed = mode !== 'exam' && mode !== 'mistakes' && maxMistakes != null && wrongSoFar > maxMistakes
      const isLastQuestion = currentIndex + 1 >= sessionQuestions.length
      const finishReason = examFailed || mistakesCapFailed ? 'mistakes' : isLastQuestion ? 'completed' : null

      // Tugallanmagan testni davom ettirish uchun har javobdan keyin holat saqlanadi.
      if (isResumableMode(mode)) {
        if (finishReason) {
          clearSavedSession()
        } else {
          saveSession({
            mode,
            topic,
            ticketId: ticketId ?? null,
            search: sessionSearch,
            owner: ownerOf(user),
            questionIds: sessionQuestions.map((q) => q.id),
            optionOrders: Object.fromEntries(sessionQuestions.map((q) => [q.id, q.options.map((o) => o.id)])),
            statuses: next,
            currentIndex: currentIndex + 1,
            remainingSeconds: hasTimeLimit ? timer.secondsLeft : 0,
          })
        }
      }

      if (feedbackMode === 'end') {
        setTimeout(() => advance(next, finishReason), 350)
      } else {
        // Javob ko'rsatiladigan rejimda foydalanuvchi "Keyingi savol" tugmasini bosguncha kutamiz.
        setPendingFinish(finishReason)
      }
    },
    [
      isAnswered,
      currentQuestion,
      currentIndex,
      stepStatuses,
      sessionQuestions.length,
      mode,
      maxMistakes,
      feedbackMode,
      advance,
      sessionQuestions,
      sessionSearch,
      ticketId,
      topic,
      user,
      hasTimeLimit,
      timer,
    ],
  )

  const goNext = useCallback(() => {
    if (!isAnswered) return
    advance(stepStatuses, pendingFinish)
  }, [isAnswered, advance, stepStatuses, pendingFinish])

  const answeredCount = stepStatuses.filter((s) => s === 'completed' || s === 'wrong').length

  const finishNow = useCallback(() => {
    if (answeredCount < 1) return
    if (hasTimeLimit) timer.stop()
    finishSession(stepStatuses, 'manual')
  }, [answeredCount, hasTimeLimit, timer, finishSession, stepStatuses])

  const correctAnswer = useMemo(
    () => currentQuestion?.options.find((o) => o.is_correct),
    [currentQuestion],
  )

  return {
    loading,
    error,
    finished,
    result,
    currentQuestion,
    currentIndex,
    totalSteps: sessionQuestions.length,
    stepStatuses,
    selectedOption,
    isAnswered,
    correctAnswer,
    handleAnswer,
    goNext,
    finishNow,
    answeredCount,
    isLastQuestion: currentIndex + 1 >= sessionQuestions.length || Boolean(pendingFinish),
    timeFormatted: timer.formatted,
    isExam: mode === 'exam',
    hasTimeLimit,
  }
}
