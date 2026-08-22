import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { fetchQuestions, filterQuestionsByTopic } from '../../../entities/question'
import { saveAttempt } from '../../../entities/quiz-attempt'
import { useAuth } from '../../../entities/user'
import { shuffleArray, pickRandom } from '../../../shared/lib/shuffle'
import { useCountdown } from '../../../shared/lib/useCountdown'

const PRACTICE_SESSION_SIZE = 20
const EXAM_SESSION_SIZE = 20
const EXAM_DURATION_SECONDS = 20 * 60
const EXAM_MAX_MISTAKES = 2

function prepareSession(allQuestions, topic, mode) {
  const pool = mode === 'exam' ? allQuestions : filterQuestionsByTopic(allQuestions, topic)
  const size = mode === 'exam' ? EXAM_SESSION_SIZE : Math.min(PRACTICE_SESSION_SIZE, pool.length)
  const picked = pickRandom(pool, size)
  return picked.map((q) => ({
    ...q,
    options: shuffleArray(q.options),
  }))
}

export function useQuizEngine({ topic, mode }) {
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
    const session = prepareSession(sourceQuestions, topic, mode)
    setSessionQuestions(session)
    setStepStatuses(Array.from({ length: session.length }, () => 'idle'))
    setCurrentIndex(0)
    setSelectedOption(null)
    setIsAnswered(false)
    setFinished(false)
    setResult(null)
    hasSavedRef.current = false
  }, [sourceQuestions, topic, mode])

  const finishSession = useCallback(
    (statuses) => {
      if (hasSavedRef.current) return
      hasSavedRef.current = true

      const correctCount = statuses.filter((s) => s === 'completed').length
      const wrongCount = statuses.filter((s) => s === 'wrong').length
      const totalQuestions = statuses.length
      const passed = mode === 'exam' ? wrongCount <= EXAM_MAX_MISTAKES : correctCount / totalQuestions >= 0.7

      const summary = { correctCount, wrongCount, totalQuestions, passed, topic, mode }
      setResult(summary)
      setFinished(true)

      if (user) {
        saveAttempt(user.uid, summary).catch(() => {})
      }
    },
    [mode, topic, user],
  )

  const timer = useCountdown(EXAM_DURATION_SECONDS, {
    autoStart: false,
    onExpire: () => finishSession(stepStatuses),
  })

  useEffect(() => {
    if (mode === 'exam' && sessionQuestions.length > 0 && !finished) {
      timer.reset(EXAM_DURATION_SECONDS)
      timer.start()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, sessionQuestions.length])

  const currentQuestion = sessionQuestions[currentIndex]

  const handleAnswer = useCallback(
    (option) => {
      if (isAnswered || !currentQuestion) return

      setSelectedOption(option)
      setIsAnswered(true)

      const next = [...stepStatuses]
      next[currentIndex] = option.is_correct ? 'completed' : 'wrong'
      setStepStatuses(next)

      setTimeout(() => {
        const nextIndex = currentIndex + 1
        if (nextIndex >= sessionQuestions.length) {
          if (mode === 'exam') timer.stop()
          finishSession(next)
        } else {
          setCurrentIndex(nextIndex)
          setSelectedOption(null)
          setIsAnswered(false)
        }
      }, 700)
    },
    [
      isAnswered,
      currentQuestion,
      currentIndex,
      stepStatuses,
      sessionQuestions.length,
      mode,
      finishSession,
      timer,
    ],
  )

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
    timeFormatted: timer.formatted,
    isExam: mode === 'exam',
  }
}
