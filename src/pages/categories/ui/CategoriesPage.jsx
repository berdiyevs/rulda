import { useEffect, useState } from 'react'
import { Container, Stack, Title, Text, SimpleGrid, Skeleton } from '@mantine/core'
import { CategoriesNav } from '../../../widgets/sidebar'
import { TOPICS, COMING_SOON, CategoryCard, ComingSoonCard } from '../../../entities/category'
import { fetchAllLatestAttempts } from '../../../entities/quiz-attempt'
import { useAuth } from '../../../entities/user'

export function CategoriesPage() {
  const { user, profile } = useAuth()
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
    <div className="page-shell">
      <CategoriesNav />

      <Container size={1180} py="xl">
        <Stack gap={4} mb="xl">
          <Title order={1}>
            Xush kelibsiz,{' '}
            <Text component="span" className="gradient-text" inherit fw={800}>
              {displayName}
            </Text>
          </Title>
          <Text c="dimmed">O'rganishni davom ettirish uchun mavzuni tanlang.</Text>
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
                <CategoryCard key={topic.id} topic={topic} latestAttempt={attempts[topic.id]} />
              ))}
            </SimpleGrid>

            <Title order={2} fz="lg" mt="xl" mb="md">
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
