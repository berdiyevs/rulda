import { Link } from 'react-router-dom'
import { Card, Stack, Text, Title, RingProgress, SimpleGrid, ThemeIcon, Badge } from '@mantine/core'
import { IconCheck, IconX } from '@tabler/icons-react'
import { Button } from '../../../shared/ui/Button/Button'
import { ROUTES } from '../../../shared/config/routes'

// Telefonda kichik katakchalarda yozuv kesilmasligi uchun.
const LABEL_STYLES = { overflow: 'visible', textOverflow: 'clip' }

const BACK_LABELS = {
  [ROUTES.CATEGORIES]: 'Bosh sahifa',
  [ROUTES.TICKETS]: 'Biletlarga qaytish',
}

export function QuizResults({ result, onRetry, backTo = ROUTES.CATEGORIES }) {
  if (!result) return null

  const { correctCount, wrongCount, totalQuestions, passed, mode, endReason } = result
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
