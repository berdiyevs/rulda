import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container, Stack, Title, Text, SimpleGrid, Skeleton, Card, Group } from '@mantine/core'
import { IconTicket } from '@tabler/icons-react'
import { CategoriesNav } from '../../../widgets/sidebar'
import { fetchQuestions } from '../../../entities/question'
import { groupByTicket } from '../../../entities/ticket'
import { fetchAllLatestAttempts } from '../../../entities/quiz-attempt'
import { useAuth } from '../../../entities/user'
import { Badge } from '../../../shared/ui/Badge/Badge'

export function TicketsPage() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [attempts, setAttempts] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    fetchQuestions()
      .then((questions) => {
        if (!isMounted) return
        const grouped = groupByTicket(questions)
        setTickets(grouped)
        if (user) {
          return fetchAllLatestAttempts(
            user.uid,
            grouped.map((t) => `ticket-${t.ticketId}`),
          ).then((data) => {
            if (isMounted) setAttempts(data)
          })
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [user])

  return (
    <div className="page-shell">
      <CategoriesNav />

      <Container size={1180} py="xl">
        <Stack gap={4} mb="xl">
          <Title order={1}>Biletlar</Title>
          <Text c="dimmed">
            Rasmiy imtihon formatidagi {tickets.length || ''} ta bilet — har birida aynan 10 ta savol.
          </Text>
        </Stack>

        {loading ? (
          <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 6 }} spacing="md">
            {Array.from({ length: 18 }).map((_, i) => (
              <Skeleton key={i} height={110} radius="lg" />
            ))}
          </SimpleGrid>
        ) : (
          <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 6 }} spacing="md">
            {tickets.map(({ ticketId, questions }) => {
              const attempt = attempts[`ticket-${ticketId}`]
              const scorePercent = attempt
                ? Math.round((attempt.correctCount / attempt.totalQuestions) * 100)
                : null

              return (
                <Card
                  key={ticketId}
                  component={Link}
                  to={`/quiz?ticket=${ticketId}`}
                  className="glass-card category-card"
                  padding="md"
                >
                  <Stack gap={6} align="center" ta="center">
                    <IconTicket size={22} color="var(--mantine-color-brand-5)" />
                    <Text fw={700}>Bilet {ticketId}</Text>
                    <Text c="dimmed" size="xs">
                      {questions.length} ta savol
                    </Text>
                    {scorePercent !== null && (
                      <Badge variant={scorePercent >= 70 ? 'success' : 'warning'}>{scorePercent}%</Badge>
                    )}
                  </Stack>
                </Card>
              )
            })}
          </SimpleGrid>
        )}
      </Container>
    </div>
  )
}
