import { useNavigate } from 'react-router-dom'
import { Paper, Stack, Group, Title, Text } from '@mantine/core'
import { IconPlayerPlay, IconRefresh, IconLock, IconArrowBackUp, IconRepeat } from '@tabler/icons-react'
import { Button } from '../../../shared/ui/Button/Button'
import { useAuth } from '../../../entities/user'
import { TOPICS } from '../../../entities/category'
import {
  getResumableSession,
  answeredCountOf,
  resumeUrl,
  REVIEW_SESSION_SIZE_FREE,
  REVIEW_SESSION_SIZE_PREMIUM,
} from '../../../entities/quiz-attempt'
import { useQuizStart } from '../../quiz-start'
import { isTicketLocked } from '../../../shared/lib/premium'
import { ROUTES } from '../../../shared/config/routes'

function describeSession(session) {
  if (session.mode === 'ticket') return `Bilet ${session.ticketId}`
  if (session.mode === 'mini') return 'Mini-test'
  const topic = TOPICS.find((t) => t.id === session.topic)
  return `Mashg'ulot · ${topic?.title ?? 'Savollar'}`
}

// "Davom ettirish" kartasi: keyingi bilet, oxirgi bilet va xatolar ustida ishlash.
export function ContinueCard({ progress }) {
  const navigate = useNavigate()
  const openQuizStart = useQuizStart()
  const { user, isPremiumActive } = useAuth()
  const saved = getResumableSession(user)

  const { lastAttempt, lastTicketId, nextTicketId, mistakeIds, reviewDueIds, reviewedToday } = progress
  const reviewSize = isPremiumActive ? REVIEW_SESSION_SIZE_PREMIUM : REVIEW_SESSION_SIZE_FREE
  const reviewLimitReached = !isPremiumActive && reviewedToday
  const hasStarted = lastTicketId != null
  const targetTicketId = hasStarted ? nextTicketId : 1
  const targetLocked = targetTicketId != null && isTicketLocked(targetTicketId, isPremiumActive)
  const answered = lastAttempt ? lastAttempt.correctCount + lastAttempt.wrongCount : 0
  const isPartial = lastAttempt && answered < lastAttempt.totalQuestions

  const startTicket = (ticketId) => {
    if (isTicketLocked(ticketId, isPremiumActive)) navigate(ROUTES.PREMIUM)
    else openQuizStart({ ticketId })
  }

  const startReview = () => {
    const ids = reviewDueIds.slice(0, reviewSize).join(',')
    navigate(`${ROUTES.QUIZ}?mode=review&ids=${ids}`, { state: { from: ROUTES.CATEGORIES } })
  }

  const startMistakes = () => {
    if (!isPremiumActive) navigate(ROUTES.PREMIUM)
    else openQuizStart({ mode: 'mistakes', questionIds: mistakeIds })
  }

  const title = hasStarted || saved ? 'Davom ettirish' : 'Bilet 1 dan boshlang'
  const description = saved
    ? `Tugallanmagan: ${describeSession(saved)} · ${answeredCountOf(saved)}/${saved.questionIds.length} savol`
    : !hasStarted
    ? 'Rasmiy imtihon formatidagi 20 ta savol, 25 daqiqa. Natijangiz saqlanadi.'
    : isPartial
      ? `Oxirgi: Bilet ${lastTicketId} · tugallanmagan (${answered}/${lastAttempt.totalQuestions} savolga javob berilgan)`
      : `Oxirgi: Bilet ${lastTicketId} · ${lastAttempt.correctCount}/${answered} to'g'ri`

  return (
    <Paper className="glass-card" p="lg">
      <Stack gap="md">
        <div>
          <Title order={2} fz="1.2rem">
            {title}
          </Title>
          <Text c="dimmed" fz="sm" mt={4}>
            {description}
          </Text>
          {hasStarted && nextTicketId == null && (
            <Text c="dimmed" fz="sm" mt={4}>
              Barcha biletlarni yechib bo'ldingiz!
            </Text>
          )}
        </div>

        {reviewDueIds.length > 0 && (
          <Group
            justify="space-between"
            align="center"
            wrap="wrap"
            gap="sm"
            p="sm"
            style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}
          >
            <div>
              <Text fw={700} fz="sm">
                Bugungi takrorlash: {reviewDueIds.length} ta savol
              </Text>
              <Text c="dimmed" fz="xs">
                {reviewLimitReached
                  ? 'Bugungi bepul takrorlash bajarildi. Premium bilan cheklovsiz.'
                  : "Oldin xato qilgan savollaringiz qayta so'raladi."}
              </Text>
            </div>
            {reviewLimitReached ? (
              <Button
                variant="secondary"
                size="xs"
                leftSection={<IconLock size={14} />}
                onClick={() => navigate(ROUTES.PREMIUM)}
              >
                Premium
              </Button>
            ) : (
              <Button variant="secondary" size="xs" leftSection={<IconRepeat size={14} />} onClick={startReview}>
                Takrorlash
              </Button>
            )}
          </Group>
        )}

        <Group gap="sm" wrap="wrap">
          {saved && (
            <Button
              variant="primary"
              style={{ flex: '1 1 220px' }}
              leftSection={<IconPlayerPlay size={16} />}
              onClick={() => navigate(resumeUrl(saved), { state: { from: ROUTES.CATEGORIES } })}
            >
              {saved.mode === 'ticket' ? `Bilet ${saved.ticketId} ni davom ettirish` : 'Testni davom ettirish'}
            </Button>
          )}

          {targetTicketId != null && !(saved?.mode === 'ticket' && Number(saved.ticketId) === targetTicketId) && (
            <Button
              variant={saved ? 'secondary' : 'primary'}
              style={{ flex: '1 1 220px' }}
              leftSection={targetLocked ? <IconLock size={16} /> : <IconPlayerPlay size={16} />}
              onClick={() => startTicket(targetTicketId)}
            >
              {targetLocked
                ? `Bilet ${targetTicketId} (Premium)`
                : hasStarted
                  ? `Bilet ${targetTicketId} ni yechish`
                  : 'Bilet 1 ni boshlash'}
            </Button>
          )}

          {hasStarted && lastTicketId !== targetTicketId && (
            <Button
              variant="secondary"
              style={{ flex: '1 1 220px' }}
              leftSection={<IconRefresh size={16} />}
              onClick={() => startTicket(lastTicketId)}
            >
              Bilet {lastTicketId} ni qayta yechish
            </Button>
          )}

          {mistakeIds.length > 0 && (
            <Button
              variant="secondary"
              style={{ flex: '1 1 220px' }}
              leftSection={isPremiumActive ? <IconArrowBackUp size={16} /> : <IconLock size={16} />}
              onClick={startMistakes}
            >
              Xatolaringizni takrorlang ({mistakeIds.length} ta)
            </Button>
          )}
        </Group>
      </Stack>
    </Paper>
  )
}
