import { useEffect, useState } from 'react'
import { Container, Stack, Title, Text, SimpleGrid, Skeleton, Group } from '@mantine/core'
import { IconFlame } from '@tabler/icons-react'
import { CategoriesNav } from '../../../widgets/sidebar'
import { TOPICS, COMING_SOON, CategoryCard, ComingSoonCard } from '../../../entities/category'
import { fetchAllLatestAttempts } from '../../../entities/quiz-attempt'
import { useAuth } from '../../../entities/user'
import { useQuizStart } from '../../../widgets/quiz-start'
import { useStreak } from '../../../features/statistics'
import { ExamCountdownCard } from '../../../widgets/exam-countdown'
import { DailyQuestionCard } from '../../../widgets/daily-question'
import { Badge } from '../../../shared/ui/Badge/Badge'

export function CategoriesPage() {
  const { user, profile } = useAuth()
  const openQuizStart = useQuizStart()
  const streak = useStreak()
  const [attempts, setAttempts] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let isMounted = true
    fetchAllLatestAttempts(
      user.uid,
      TOPICS.map((t) => t.id),
    )
      .then((data) => {
        if (isMounted) setAttempts(data)
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [user])

  const displayName = profile?.displayName || user?.displayName || 'Foydalanuvchi'

  return (
    <div className="page-shell has-tabbar">
      <CategoriesNav />

      <Container size={1180} py="xl">
        <Group justify="space-between" align="flex-end" wrap="wrap" mb="xl">
          <Stack gap={4}>
            <Title order={1}>
              Xush kelibsiz,{' '}
              <Text component="span" className="gradient-text" inherit fw={800}>
                {displayName}
              </Text>
            </Title>
            <Text c="dimmed">O'rganishni davom ettirish uchun mavzuni tanlang.</Text>
          </Stack>

          {streak > 0 && (
            <Badge variant="warning">
              <Group gap={6} wrap="nowrap">
                <IconFlame size={13} />
                {streak} kun ketma-ket mashq qilyapsiz
              </Group>
            </Badge>
          )}
        </Group>

        <Stack gap="xl" mb="xl">
          <ExamCountdownCard />
        </Stack>

        {loading ? (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} height={180} radius="lg" />
            ))}
          </SimpleGrid>
        ) : (
          <>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
              {TOPICS.map((topic) => (
                <CategoryCard
                  key={topic.id}
                  topic={topic}
                  latestAttempt={attempts[topic.id]}
                  onSelect={() => openQuizStart({ topic: topic.id, mode: 'practice' })}
                />
              ))}
            </SimpleGrid>

            <Stack mt="xl" mb="xl">
              <DailyQuestionCard />
            </Stack>

            <Title order={2} fz="lg" mb="md">
              Tez kunda qo'shiladi
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
              {COMING_SOON.map((topic) => (
                <ComingSoonCard key={topic.id} topic={topic} />
              ))}
            </SimpleGrid>
          </>
        )}
      </Container>
    </div>
  )
}
