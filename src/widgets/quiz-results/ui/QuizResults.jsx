import { Link } from 'react-router-dom'
import { Card, Stack, Text, Title, RingProgress, SimpleGrid, ThemeIcon, Badge } from '@mantine/core'
import { IconCheck, IconX, IconCircleCheck } from '@tabler/icons-react'
import { Button } from '../../../shared/ui/Button/Button'
import { GoogleButton } from '../../../shared/ui/GoogleButton/GoogleButton'
import { useAuth } from '../../../entities/user'
import { useAuthActions } from '../../../features/auth'
import { useLoginModal } from '../../login-modal'
import { ExamPromptCard } from '../../exam-prompt'
import { ROUTES } from '../../../shared/config/routes'

// Telefonda kichik katakchalarda yozuv kesilmasligi uchun.
const LABEL_STYLES = { overflow: 'visible', textOverflow: 'clip' }

const BACK_LABELS = {
  [ROUTES.CATEGORIES]: 'Bosh sahifa',
  [ROUTES.HOME]: 'Bosh sahifa',
  [ROUTES.TICKETS]: 'Biletlarga qaytish',
}

export function QuizResults({ result, onRetry, backTo = ROUTES.CATEGORIES }) {
  const { user } = useAuth()
  const openLogin = useLoginModal()
  const { loginWithGoogle } = useAuthActions({ redirectTo: false })

  if (!result) return null

  const { correctCount, wrongCount, totalQuestions, passed, mode, endReason, isGuest, ticketCount } = result
  const answeredCount = correctCount + wrongCount
  const percent = answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0
  const stoppedEarly = answeredCount < totalQuestions

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
            {passed ? 'Tabriklaymiz!' : "Qayta urinib ko'ring"}
          </Title>
          <Text c="dimmed" fz="0.92rem">
            {mode === 'exam'
              ? passed
                ? "Siz imtihondan muvaffaqiyatli o'tdingiz."
                : "Imtihondan o'ta olmadingiz, ruxsat etilgan xatolar sonidan oshib ketdi."
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
          <Button variant="primary" onClick={onRetry} fullWidth>
            Qayta urinish
          </Button>
        </SimpleGrid>
      </Stack>
    </Card>
  )
}
