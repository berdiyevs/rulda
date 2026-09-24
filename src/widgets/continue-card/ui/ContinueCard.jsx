import { useNavigate } from 'react-router-dom'
import { Paper, Stack, Group, Title, Text } from '@mantine/core'
import { IconPlayerPlay, IconRefresh, IconLock, IconArrowBackUp } from '@tabler/icons-react'
import { Button } from '../../../shared/ui/Button/Button'
import { useAuth } from '../../../entities/user'
import { TOPICS } from '../../../entities/category'
import { getResumableSession, answeredCountOf, resumeUrl } from '../../../entities/quiz-attempt'
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

  const { lastAttempt, lastTicketId, nextTicketId, mistakeIds } = progress
  const hasStarted = lastTicketId != null
  const targetTicketId = hasStarted ? nextTicketId : 1
  const targetLocked = targetTicketId != null && isTicketLocked(targetTicketId, isPremiumActive)
  const answered = lastAttempt ? lastAttempt.correctCount + lastAttempt.wrongCount : 0
  const isPartial = lastAttempt && answered < lastAttempt.totalQuestions

  const startTicket = (ticketId) => {
    if (isTicketLocked(ticketId, isPremiumActive)) navigate(ROUTES.PREMIUM)
    else openQuizStart({ ticketId })
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
