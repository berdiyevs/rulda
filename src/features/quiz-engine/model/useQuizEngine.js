import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { fetchQuestions, filterQuestionsByTopic } from '../../../entities/question'
import { saveAttempt } from '../../../entities/quiz-attempt'
import { useAuth } from '../../../entities/user'
import { shuffleArray, pickRandom } from '../../../shared/lib/shuffle'
import { useCountdown } from '../../../shared/lib/useCountdown'
import { exitFullscreen } from '../../../shared/lib/fullscreen'

const PRACTICE_SESSION_SIZE = 20
const EXAM_SESSION_SIZE = 20
const EXAM_DURATION_SECONDS = 25 * 60
const EXAM_MAX_MISTAKES = 2
const EMPTY_QUESTION_IDS = []

function prepareSession(allQuestions, topic, mode, ticketId, questionIds, questionCount) {
  if (mode === 'ticket') {
    const pool = allQuestions.filter((q) => q.ticketId === Number(ticketId))
    return pool.map((q) => ({ ...q, options: shuffleArray(q.options) }))
  }

  if (mode === 'mistakes') {
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

export function useQuizEngine({
  topic,
  mode,
  ticketId,
  questionIds = EMPTY_QUESTION_IDS,
  questionCount = PRACTICE_SESSION_SIZE,
  durationMinutes = 0,
  maxMistakes = null,
  feedbackMode = 'instant',
}) {
  const { user } = useAuth()
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
  const [pendingFinish, setPendingFinish] = useState(false)
  const hasSavedRef = useRef(false)

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
    const session = prepareSession(sourceQuestions, topic, mode, ticketId, questionIds, questionCount)
    if (session.length === 0) {
      setError('Savollar topilmadi.')
      return
    }
    setSessionQuestions(session)
    setStepStatuses(Array.from({ length: session.length }, () => 'idle'))
    setCurrentIndex(0)
    setSelectedOption(null)
    setIsAnswered(false)
    setFinished(false)
    setResult(null)
    setPendingFinish(false)
    hasSavedRef.current = false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceQuestions, topic, mode, ticketId, questionIds, questionCount])

  const finishSession = useCallback(
    (statuses) => {
      if (hasSavedRef.current) return
      hasSavedRef.current = true

      const correctCount = statuses.filter((s) => s === 'completed').length
      const wrongCount = statuses.filter((s) => s === 'wrong').length
      const totalQuestions = sessionQuestions.length
      const passed =
        mode === 'exam'
          ? wrongCount <= EXAM_MAX_MISTAKES
          : mode !== 'mistakes' && maxMistakes != null
            ? wrongCount <= maxMistakes
            : correctCount / totalQuestions >= 0.7
      const attemptTopic = mode === 'ticket' ? `ticket-${ticketId}` : mode === 'mistakes' ? 'mistakes' : topic

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
        mode,
        wrongQuestionIds,
        correctQuestionIds,
      }
      setResult(summary)
      setFinished(true)
      if (mode === 'exam') exitFullscreen()

      if (user) {
        saveAttempt(summary).catch(() => {})
      }
    },
    [mode, topic, ticketId, user, sessionQuestions, maxMistakes],
  )

  const hasTimeLimit = mode === 'exam' || ((mode === 'practice' || mode === 'ticket') && durationMinutes > 0)
  const durationSeconds = mode === 'exam' ? EXAM_DURATION_SECONDS : durationMinutes * 60

  const timer = useCountdown(durationSeconds || EXAM_DURATION_SECONDS, {
    autoStart: false,
    onExpire: () => finishSession(stepStatuses),
  })

  useEffect(() => {
    if (hasTimeLimit && sessionQuestions.length > 0 && !finished) {
      timer.reset(durationSeconds)
      timer.start()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasTimeLimit, sessionQuestions.length])

  const currentQuestion = sessionQuestions[currentIndex]

  const advance = useCallback(
    (statuses, shouldFinish) => {
      if (shouldFinish) {
        if (hasTimeLimit) timer.stop()
        finishSession(statuses)
      } else {
        setCurrentIndex((i) => i + 1)
        setSelectedOption(null)
        setIsAnswered(false)
        setPendingFinish(false)
      }
    },
    [hasTimeLimit, timer, finishSession],
  )

  const handleAnswer = useCallback(
    (option) => {
      if (isAnswered || !currentQuestion) return

      setSelectedOption(option)
      setIsAnswered(true)

      const next = [...stepStatuses]
      next[currentIndex] = option.is_correct ? 'completed' : 'wrong'
      setStepStatuses(next)

      const wrongSoFar = next.filter((s) => s === 'wrong').length
      const examFailed = mode === 'exam' && wrongSoFar > EXAM_MAX_MISTAKES
      const mistakesCapFailed = mode !== 'exam' && mode !== 'mistakes' && maxMistakes != null && wrongSoFar > maxMistakes
      const isLastQuestion = currentIndex + 1 >= sessionQuestions.length
      const shouldFinish = examFailed || mistakesCapFailed || isLastQuestion

      if (feedbackMode === 'end') {
        setTimeout(() => advance(next, shouldFinish), 350)
      } else {
        // Javob ko'rsatiladigan rejimda foydalanuvchi "Keyingi savol" tugmasini bosguncha kutamiz.
        setPendingFinish(shouldFinish)
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
    ],
  )

  const goNext = useCallback(() => {
    if (!isAnswered) return
    advance(stepStatuses, pendingFinish)
  }, [isAnswered, advance, stepStatuses, pendingFinish])

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
    isLastQuestion: currentIndex + 1 >= sessionQuestions.length || pendingFinish,
    timeFormatted: timer.formatted,
    isExam: mode === 'exam',
    hasTimeLimit,
  }
}
