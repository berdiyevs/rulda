import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Box } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { QuizPlay } from './QuizPlay'
import { useAuth } from '../../../entities/user'
import { isTicketLocked } from '../../../shared/lib/premium'
import { ROUTES } from '../../../shared/config/routes'

const VALID_TOPICS = ['all', 'signs', 'theory']

export function QuizPage() {
  const navigate = useNavigate()
  const { isPremiumActive } = useAuth()
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
  const mode = isTicket ? 'ticket' : isMistakes ? 'mistakes' : modeParam === 'exam' ? 'exam' : 'practice'

  const questionIds = useMemo(
    () => (idsParam ? idsParam.split(',').map(Number).filter((n) => !Number.isNaN(n)) : []),
    [idsParam],
  )
  const questionCount = countParam ? Number(countParam) || 20 : 20
  const durationMinutes = durationParam ? Number(durationParam) || 0 : 0
  const maxMistakes = errorsParam !== null && errorsParam !== '' ? Number(errorsParam) : null
  const feedbackMode = feedbackParam === 'end' ? 'end' : 'instant'

  const [sessionKey, setSessionKey] = useState(0)

  const premiumRequired =
    !isPremiumActive && (mode === 'exam' || mode === 'mistakes' || isTicketLocked(ticketId, isPremiumActive))

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
        onRetry={() => setSessionKey((k) => k + 1)}
      />
    </Box>
  )
}
