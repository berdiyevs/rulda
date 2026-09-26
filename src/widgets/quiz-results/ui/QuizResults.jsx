import { Link, useNavigate } from 'react-router-dom'
import { Card, Stack, Text, Title, RingProgress, SimpleGrid, ThemeIcon, Badge } from '@mantine/core'
import { IconCheck, IconX, IconCircleCheck } from '@tabler/icons-react'
import { Button } from '../../../shared/ui/Button/Button'
import { GoogleButton } from '../../../shared/ui/GoogleButton/GoogleButton'
import { useAuth } from '../../../entities/user'
import { useAuthActions } from '../../../features/auth'
import { useLoginModal } from '../../login-modal'
import { ExamPromptCard } from '../../exam-prompt'
import { ShareResult } from './ShareResult'
import { ROUTES } from '../../../shared/config/routes'
import { ticketIdOf } from '../../../entities/ticket'
import { isTicketLocked, isTicketGuestLocked } from '../../../shared/lib/premium'
import { useQuizStart } from '../../quiz-start'

// Telefonda kichik katakchalarda yozuv kesilmasligi uchun.
const LABEL_STYLES = { overflow: 'visible', textOverflow: 'clip' }

const BACK_LABELS = {
  [ROUTES.CATEGORIES]: 'Bosh sahifa',
  [ROUTES.HOME]: 'Bosh sahifa',
  [ROUTES.TICKETS]: 'Biletlarga qaytish',
}

export function QuizResults({ result, onRetry, backTo = ROUTES.CATEGORIES }) {
  const { user, isPremiumActive } = useAuth()
  const openLogin = useLoginModal()
  const openQuizStart = useQuizStart()
  const navigate = useNavigate()
  const { loginWithGoogle } = useAuthActions({ redirectTo: false })

  if (!result) return null

  const { correctCount, wrongCount, totalQuestions, passed, mode, endReason, isGuest, ticketCount } = result
  const answeredCount = correctCount + wrongCount
  // Foiz barcha savollardan hisoblanadi: 20 tadan 4 tasi to'g'ri bo'lsa 20%, 67% emas.
  const percent = totalQuestions ? Math.round((correctCount / totalQuestions) * 100) : 0
  const stoppedEarly = answeredCount < totalQuestions

  // Bilet rejimida keyingi biletga to'g'ridan-to'g'ri o'tish.
  const ticketId = ticketIdOf(result)
  const nextTicketId = ticketId != null && ticketId < (ticketCount || 0) ? ticketId + 1 : null
  const nextGuestLocked = nextTicketId != null && isTicketGuestLocked(nextTicketId, !user)
  const nextPremiumLocked = nextTicketId != null && Boolean(user) && isTicketLocked(nextTicketId, isPremiumActive)
  const startNextTicket = () => {
    if (nextGuestLocked) openLogin({ title: `Bilet ${nextTicketId} ni ochish uchun kiring`, redirectTo: false })
    else if (nextPremiumLocked) navigate(ROUTES.PREMIUM)
    else openQuizStart({ ticketId: nextTicketId })
  }

  const endReasonText = {
    mistakes: "Ruxsat etilgan xatolar soni oshgani uchun test avtomatik tugadi.",
    time: 'Vaqt tugagani uchun test avtomatik tugadi.',
    manual: "Testni o'zingiz yakunladingiz.",
  }[endReason]

  return (
    <Card className="glass-card slide-up" p={{ base: 20, xs: 40 }} w="100%" maw={480} style={{ textAlign: 'center' }}>
      <Stack align="center" gap="lg">
        <ThemeIcon size={64} radius="xl" variant="light" color={passed ? 'success' : 'danger'}>
          {passed ? <IconCheck size={30} /> : <IconX size={30} />}
        </ThemeIcon>

        <div>
          <Title order={2} fz="1.5rem" mb={6}>
            {passed ? 'Tabriklaymiz!' : stoppedEarly && endReason === 'manual' ? 'Test tugallanmadi' : "Qayta urinib ko'ring"}
          </Title>
          <Text c="dimmed" fz="0.92rem">
            {mode === 'exam'
              ? passed
                ? "Siz imtihondan muvaffaqiyatli o'tdingiz."
                : "Imtihondan o'ta olmadingiz, ruxsat etilgan xatolar sonidan oshib ketdi."
              : mode === 'review'
                ? "Takrorlash yakunlandi. To'g'ri javoblar keyingi bosqichga o'tadi, xatolar ertaga qayta chiqadi."
                : ticketId != null
                  ? `Bilet ${ticketId} yakunlandi.`
                  : "Mashg'ulot yakunlandi."}
          </Text>
        </div>

        <RingProgress
          size={140}
          thickness={10}
          roundCaps
          sections={[{ value: percent, color: passed ? 'success' : 'brand' }]}
          label={
            <Stack gap={0} align="center">
              <Text fw={800} fz="1.7rem" className="gradient-text">
                {percent}%
              </Text>
              <Text c="dimmed" fz="0.7rem">
                to'g'ri
              </Text>
            </Stack>
          }
        />

        <Text fz="0.9rem" fw={600}>
          {totalQuestions} tadan {answeredCount} ta savolga javob berildi
        </Text>

        <SimpleGrid cols={3} spacing={{ base: 6, xs: 'sm' }} w="100%">
          <Stack align="center" gap={8} p={{ base: 6, xs: 'sm' }} className="glass-card">
            <Badge variant="light" color="success" styles={{ label: LABEL_STYLES }}>To'g'ri</Badge>
            <Text fw={700} fz="1.1rem">
              {correctCount}
            </Text>
          </Stack>
          <Stack align="center" gap={8} p={{ base: 6, xs: 'sm' }} className="glass-card">
            <Badge variant="light" color="danger" styles={{ label: LABEL_STYLES }}>Xato</Badge>
            <Text fw={700} fz="1.1rem">
              {wrongCount}
            </Text>
          </Stack>
          <Stack align="center" gap={8} p={{ base: 6, xs: 'sm' }} className="glass-card">
            <Badge variant="light" color="gray" styles={{ label: LABEL_STYLES }}>Jami</Badge>
            <Text fw={700} fz="1.1rem">
              {totalQuestions}
            </Text>
          </Stack>
        </SimpleGrid>

        {stoppedEarly && endReasonText && (
          <Text c="dimmed" fz="0.8rem">
            {endReasonText}
          </Text>
        )}

        {passed && answeredCount > 0 && <ShareResult result={result} prominent />}

        {user && answeredCount > 0 && <ExamPromptCard />}

        {!user && (
          <Stack gap="xs" w="100%" p="md" className="glass-card" ta="center">
            <Text fw={700} fz="0.95rem" lh={1.4}>
              Natijangiz {correctCount}/{totalQuestions}. Saqlab qolish va {ticketCount || 62} ta biletni ochish uchun
              hisobga kiring
            </Text>
            <GoogleButton size="md" onClick={loginWithGoogle} />
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={() => openLogin({ title: 'Natijangizni saqlash uchun kiring', redirectTo: false })}
            >
              Email orqali kirish
            </Button>
          </Stack>
        )}

        {user && isGuest && (
          <Stack gap="xs" w="100%" p="md" className="glass-card" align="center" ta="center">
            <IconCircleCheck size={28} color="var(--mantine-color-success-6)" />
            <Text fw={700} fz="0.95rem">
              Natijangiz hisobingizga saqlandi
            </Text>
            <Button variant="secondary" size="sm" as={Link} to={ROUTES.CATEGORIES} fullWidth>
              Asosiy sahifaga o'tish
            </Button>
          </Stack>
        )}

        <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm" w="100%">
          <Button variant="secondary" as={Link} to={backTo} fullWidth>
            {BACK_LABELS[backTo] || 'Orqaga qaytish'}
          </Button>
          {mode !== 'review' && (
            <Button variant={nextTicketId != null ? 'secondary' : 'primary'} onClick={onRetry} fullWidth>
              Qayta urinish
            </Button>
          )}
        </SimpleGrid>

        {nextTicketId != null && (
          <Button variant="primary" onClick={startNextTicket} fullWidth>
            {nextPremiumLocked ? `Bilet ${nextTicketId} (Premium)` : `Keyingi bilet: ${nextTicketId}`}
          </Button>
        )}

        {!passed && answeredCount > 0 && <ShareResult result={result} />}
      </Stack>
    </Card>
  )
}
