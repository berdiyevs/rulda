import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Box } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { QuizPlay } from './QuizPlay'
import { useAuth } from '../../../entities/user'
import { useAttempts, hasReviewedToday } from '../../../entities/quiz-attempt'
import { uzToday } from '../../../shared/lib/uzDate'
import { isTicketLocked, isTicketGuestLocked } from '../../../shared/lib/premium'
import { Spinner } from '../../../shared/ui/Spinner/Spinner'
import { ROUTES } from '../../../shared/config/routes'

const VALID_TOPICS = ['all', 'signs', 'theory']

export function QuizPage() {
  const navigate = useNavigate()
  const { user, isAuthReady, isPremiumActive } = useAuth()
  const { attempts, loaded: attemptsLoaded } = useAttempts()
  const [searchParams] = useSearchParams()
  const topicParam = searchParams.get('topic')
  const modeParam = searchParams.get('mode')
  const ticketParam = searchParams.get('ticket')
  const idsParam = searchParams.get('ids')
  const countParam = searchParams.get('count')
  const durationParam = searchParams.get('duration')
  const errorsParam = searchParams.get('errors')
  const feedbackParam = searchParams.get('feedback')

  const ticketId = ticketParam ? Number(ticketParam) : null
  const topic = VALID_TOPICS.includes(topicParam) ? topicParam : 'all'
  const isTicket = Boolean(ticketId)
  const isMistakes = !isTicket && modeParam === 'mistakes'
  const isReview = !isTicket && modeParam === 'review'
  const mode = isTicket
    ? 'ticket'
    : isMistakes
      ? 'mistakes'
      : isReview
        ? 'review'
        : modeParam === 'exam'
          ? 'exam'
          : modeParam === 'mini'
            ? 'mini'
            : 'practice'

  const questionIds = useMemo(
    () => (idsParam ? idsParam.split(',').map(Number).filter((n) => !Number.isNaN(n)) : []),
    [idsParam],
  )
  const questionCount = countParam ? Number(countParam) || 20 : 20
  const durationMinutes = durationParam ? Number(durationParam) || 0 : 0
  const maxMistakes = errorsParam !== null && errorsParam !== '' ? Number(errorsParam) : null
  const feedbackMode = feedbackParam === 'end' ? 'end' : 'instant'

  const [sessionKey, setSessionKey] = useState(0)
  // Saqlangan testni davom ettirish (?resume=1). "Qayta urinish"da yangi test boshlanadi.
  const [resume, setResume] = useState(searchParams.get('resume') === '1')
  const sessionSearch = useMemo(() => {
    const params = new URLSearchParams(searchParams)
    params.delete('resume')
    return params.toString()
  }, [searchParams])

  // Bepul foydalanuvchi kuniga bitta takrorlash sessiyasini yecha oladi (server ham tekshiradi).
  const reviewCheckedRef = useRef(false)
  useEffect(() => {
    if (mode !== 'review' || !user || !isAuthReady || isPremiumActive || !attemptsLoaded) return
    if (reviewCheckedRef.current) return
    reviewCheckedRef.current = true
    if (hasReviewedToday(attempts, uzToday())) {
      notifications.show({
        color: 'warning',
        title: 'Bugungi bepul takrorlash bajarilgan',
        message: 'Premium bilan takrorlashni cheklovsiz yechishingiz mumkin.',
      })
      navigate(ROUTES.CATEGORIES, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, user, isAuthReady, isPremiumActive, attemptsLoaded])

  // Mehmon faqat mini-testni va 1-biletni yecha oladi, qolganlari uchun kirish kerak.
  const guestBlocked = !user && !(mode === 'mini' || (mode === 'ticket' && !isTicketGuestLocked(ticketId, true)))

  const premiumRequired =
    Boolean(user) && !isPremiumActive && (mode === 'exam' || mode === 'mistakes' || isTicketLocked(ticketId, isPremiumActive))

  useEffect(() => {
    if (!premiumRequired) return
    notifications.show({
      color: 'warning',
      title: 'Bu funksiya Premium uchun',
      message: 'Davom etish uchun Premium sotib oling.',
    })
    navigate(ROUTES.PREMIUM, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [premiumRequired])

  if (!isAuthReady) {
    return (
      <div className="center-screen">
        <Spinner label="Tekshirilmoqda..." />
      </div>
    )
  }

  if (guestBlocked) {
    const reason = isTicket ? `Bilet ${ticketId} ni ochish uchun kiring` : 'Testni boshlash uchun kiring'
    return <Navigate to="/" state={{ requireAuth: true, reason }} replace />
  }

  if (premiumRequired) return null

  return (
    <Box mih="100vh">
      <QuizPlay
        key={sessionKey}
        topic={topic}
        mode={mode}
        ticketId={ticketId}
        questionIds={questionIds}
        questionCount={questionCount}
        durationMinutes={durationMinutes}
        maxMistakes={maxMistakes}
        feedbackMode={feedbackMode}
        resume={resume}
        sessionSearch={sessionSearch}
        onRetry={() => {
          setResume(false)
          setSessionKey((k) => k + 1)
        }}
      />
    </Box>
  )
}
