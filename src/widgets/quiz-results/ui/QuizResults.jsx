import { Link } from 'react-router-dom'
import { Card, Group, Stack, Text, Title, RingProgress, SimpleGrid, ThemeIcon } from '@mantine/core'
import { IconCheck, IconX } from '@tabler/icons-react'
import { Button } from '../../../shared/ui/Button/Button'
import { Badge } from '../../../shared/ui/Badge/Badge'
import { ROUTES } from '../../../shared/config/routes'

export function QuizResults({ result, onRetry }) {
  if (!result) return null

  const { correctCount, wrongCount, totalQuestions, passed, mode } = result
  const percent = Math.round((correctCount / totalQuestions) * 100)

  return (
    <Card className="glass-card slide-up" padding={40} w="100%" maw={480} style={{ textAlign: 'center' }}>
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

        <SimpleGrid cols={3} spacing="sm" w="100%">
          <Stack align="center" gap={8} p="sm" className="glass-card">
            <Badge variant="success">To'g'ri</Badge>
            <Text fw={700} fz="1.1rem">
              {correctCount}
            </Text>
          </Stack>
          <Stack align="center" gap={8} p="sm" className="glass-card">
            <Badge variant="danger">Xato</Badge>
            <Text fw={700} fz="1.1rem">
              {wrongCount}
            </Text>
          </Stack>
          <Stack align="center" gap={8} p="sm" className="glass-card">
            <Badge>Jami</Badge>
            <Text fw={700} fz="1.1rem">
              {totalQuestions}
            </Text>
          </Stack>
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm" w="100%">
          <Button variant="secondary" as={Link} to={ROUTES.CATEGORIES} fullWidth>
            Mavzularga qaytish
          </Button>
          <Button variant="primary" onClick={onRetry} fullWidth>
            Qayta urinish
          </Button>
        </SimpleGrid>
      </Stack>
    </Card>
  )
}
