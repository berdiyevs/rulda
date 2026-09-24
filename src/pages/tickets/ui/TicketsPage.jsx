import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Stack, Title, Text, SimpleGrid, Skeleton, Card, Group } from '@mantine/core'
import { IconTicket, IconLock } from '@tabler/icons-react'
import { CategoriesNav } from '../../../widgets/sidebar'
import { fetchQuestions } from '../../../entities/question'
import { groupByTicket } from '../../../entities/ticket'
import { fetchAllLatestAttempts } from '../../../entities/quiz-attempt'
import { useAuth } from '../../../entities/user'
import { useQuizStart } from '../../../widgets/quiz-start'
import { useLoginModal } from '../../../widgets/login-modal'
import { Badge } from '../../../shared/ui/Badge/Badge'
import { isTicketLocked, isTicketGuestLocked } from '../../../shared/lib/premium'
import { ROUTES } from '../../../shared/config/routes'

export function TicketsPage() {
  const { user, isAuthReady, isPremiumActive } = useAuth()
  const navigate = useNavigate()
  const openQuizStart = useQuizStart()
  const openLogin = useLoginModal()
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
          return fetchAllLatestAttempts(grouped.map((t) => `ticket-${t.ticketId}`)).then((data) => {
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
    <div className="page-shell has-tabbar">
      <CategoriesNav />

      <Container size={1180} py="xl">
        <Stack gap={4} mb="xl">
          <Title order={1}>Biletlar</Title>
          <Text c="dimmed">
            Rasmiy imtihon formatidagi {tickets.length || ''} ta bilet — har birida aynan 20 ta savol.
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
              const answered = attempt ? attempt.correctCount + attempt.wrongCount : 0
              const scorePercent = answered ? Math.round((attempt.correctCount / answered) * 100) : null
              const guestLocked = isTicketGuestLocked(ticketId, isAuthReady && !user)
              const locked = guestLocked || isTicketLocked(ticketId, isPremiumActive)

              return (
                <Card
                  key={ticketId}
                  component="button"
                  type="button"
                  onClick={() => {
                    if (guestLocked) {
                      openLogin({ title: `Bilet ${ticketId} ni ochish uchun kiring`, redirectTo: false })
                    } else if (locked) {
                      navigate(ROUTES.PREMIUM)
                    } else {
                      openQuizStart({ ticketId })
                    }
                  }}
                  className="glass-card category-card"
                  padding="md"
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    font: 'inherit',
                    color: 'inherit',
                    cursor: 'pointer',
                    opacity: locked ? 0.6 : 1,
                    position: 'relative',
                  }}
                >
                  <Stack gap={6} align="center" ta="center">
                    {locked ? (
                      <IconLock size={22} color="var(--mantine-color-warning-6)" />
                    ) : (
                      <IconTicket size={22} color="var(--mantine-color-brand-5)" />
                    )}
                    <Text fw={700}>Bilet {ticketId}</Text>
                    <Text c="dimmed" size="xs">
                      {questions.length} ta savol
                    </Text>
                    {locked ? (
                      <Badge variant="warning">{guestLocked ? 'Kirish kerak' : 'Premium'}</Badge>
                    ) : (
                      scorePercent !== null && (
                        <Badge variant={scorePercent >= 70 ? 'success' : 'warning'}>{scorePercent}%</Badge>
                      )
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
