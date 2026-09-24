import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Stack, Group, Title, Text, SimpleGrid, Skeleton, Modal, Progress, Paper } from '@mantine/core'
import { IconCheck, IconX, IconPlayerPlay, IconLock } from '@tabler/icons-react'
import { CategoriesNav } from '../../../widgets/sidebar'
import { fetchQuestions } from '../../../entities/question'
import { groupByTicket } from '../../../entities/ticket'
import { useAttempts, getResumableSession, sessionMatches } from '../../../entities/quiz-attempt'
import { useAuth } from '../../../entities/user'
import { useQuizStart } from '../../../widgets/quiz-start'
import { useLoginModal } from '../../../widgets/login-modal'
import { Button } from '../../../shared/ui/Button/Button'
import { fetchPlans } from '../../../entities/payment'
import { formatPrice } from '../../../shared/lib/formatPrice'
import { isTicketLocked, isTicketGuestLocked, FREE_TICKET_LIMIT } from '../../../shared/lib/premium'
import { ROUTES } from '../../../shared/config/routes'
import './TicketsPage.css'

const STATUS_LABELS = {
  passed: "o'tilgan",
  failed: 'yiqilgan',
  inprogress: 'boshlangan, tugallanmagan',
  new: 'yechilmagan',
  locked: 'qulflangan',
}

function StatusIcon({ status }) {
  if (status === 'passed') return <IconCheck size={12} stroke={3} />
  if (status === 'failed') return <IconX size={12} stroke={3} />
  if (status === 'inprogress') return <IconPlayerPlay size={11} stroke={3} />
  if (status === 'locked') return <IconLock size={12} stroke={2.5} />
  return null
}

export function TicketsPage() {
  const { user, isAuthReady, isPremiumActive } = useAuth()
  const { attempts } = useAttempts()
  const navigate = useNavigate()
  const openQuizStart = useQuizStart()
  const openLogin = useLoginModal()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [lockedTicketId, setLockedTicketId] = useState(null)
  const [cheapestPrice, setCheapestPrice] = useState(null)

  useEffect(() => {
    let isMounted = true
    fetchQuestions()
      .then((questions) => {
        if (isMounted) setTickets(groupByTicket(questions))
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  // Qulflangan bilet oynasida "eng arzon narx" ko'rsatish uchun.
  useEffect(() => {
    fetchPlans()
      .then((plans) => {
        if (plans.length > 0) setCheapestPrice(Math.min(...plans.map((p) => p.amount)))
      })
      .catch(() => {})
  }, [])

  const saved = getResumableSession(user)

  // Har bir biletning holati: o'tgan / yiqilgan / boshlangan / yechilmagan / qulflangan.
  const cells = useMemo(() => {
    const lastByTicket = new Map()
    attempts.forEach((a) => {
      if (a.topic?.startsWith('ticket-')) lastByTicket.set(Number(a.topic.slice('ticket-'.length)), a)
    })
    return tickets.map(({ ticketId }) => {
      const guestLocked = isTicketGuestLocked(ticketId, isAuthReady && !user)
      const premiumLocked = isTicketLocked(ticketId, isPremiumActive)
      const locked = guestLocked || premiumLocked
      const last = lastByTicket.get(ticketId)
      let status = 'new'
      if (sessionMatches(saved, { mode: 'ticket', ticketId })) status = 'inprogress'
      else if (last) status = last.passed ? 'passed' : 'failed'
      return { ticketId, status, locked, guestLocked, displayStatus: locked ? 'locked' : status }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickets, attempts, saved?.updatedAt, saved?.ticketId, user, isAuthReady, isPremiumActive])

  const passedCount = cells.filter((c) => c.status === 'passed').length
  const nextCell = cells.find((c) => !c.locked && c.status !== 'passed')

  const openCell = (cell) => {
    if (cell.guestLocked) {
      openLogin({ title: `Bilet ${cell.ticketId} ni ochish uchun kiring`, redirectTo: false })
    } else if (cell.locked) {
      setLockedTicketId(cell.ticketId)
    } else {
      // Boshlangan bo'lsa, oynada "Davom ettirish" / "Boshidan boshlash" tanlovi chiqadi.
      openQuizStart({ ticketId: cell.ticketId })
    }
  }

  return (
    <div className="page-shell has-tabbar">
      <CategoriesNav />

      <Container size={1180} py="xl">
        <Stack gap={4} mb="lg">
          <Title order={1}>Biletlar</Title>
          <Text c="dimmed">
            Rasmiy imtihon formatidagi {tickets.length || ''} ta bilet — har birida aynan 20 ta savol.
          </Text>
        </Stack>

        {loading ? (
          <SimpleGrid cols={{ base: 5, sm: 8, md: 10, lg: 12 }} spacing="xs">
            {Array.from({ length: 30 }).map((_, i) => (
              <Skeleton key={i} height={56} radius="md" />
            ))}
          </SimpleGrid>
        ) : (
          <Stack gap="lg">
            <Paper className="glass-card" p="md">
              <Stack gap="sm">
                <Group justify="space-between" align="center" wrap="wrap" gap="sm">
                  <Text fw={700}>
                    {tickets.length} tadan {passedCount} tasi o'tildi
                  </Text>
                  {nextCell && (
                    <Button variant="primary" size="sm" onClick={() => openCell(nextCell)}>
                      Keyingi bilet: {nextCell.ticketId}
                    </Button>
                  )}
                </Group>
                <Progress
                  value={tickets.length ? (passedCount / tickets.length) * 100 : 0}
                  color="success"
                  radius="xl"
                  size="sm"
                  aria-label={`${tickets.length} tadan ${passedCount} tasi o'tildi`}
                />
              </Stack>
            </Paper>

            <div className="ticket-grid">
              {cells.map((cell) => (
                <button
                  key={cell.ticketId}
                  type="button"
                  className={`ticket-cell is-${cell.displayStatus}`}
                  aria-label={`Bilet ${cell.ticketId}, ${STATUS_LABELS[cell.displayStatus]}`}
                  onClick={() => openCell(cell)}
                >
                  <span className="ticket-cell-number">{cell.ticketId}</span>
                  <span className="ticket-cell-icon">
                    <StatusIcon status={cell.displayStatus} />
                  </span>
                </button>
              ))}
            </div>

            <div className="ticket-legend">
              <span className="ticket-legend-item is-passed">
                <IconCheck size={12} stroke={3} /> o'tilgan
              </span>
              <span className="ticket-legend-item is-failed">
                <IconX size={12} stroke={3} /> yiqilgan
              </span>
              <span className="ticket-legend-item is-inprogress">
                <IconPlayerPlay size={11} stroke={3} /> boshlangan
              </span>
              <span className="ticket-legend-item is-new">yechilmagan</span>
              <span className="ticket-legend-item is-locked">
                <IconLock size={12} stroke={2.5} /> Premium
              </span>
            </div>
          </Stack>
        )}
      </Container>

      <Modal
        opened={lockedTicketId !== null}
        onClose={() => setLockedTicketId(null)}
        title={`Bilet ${lockedTicketId} Premium uchun`}
        centered
        size={400}
      >
        <Stack gap="md">
          <Text c="dimmed" size="sm">
            {`Bepul foydalanuvchilar faqat 1–${FREE_TICKET_LIMIT}-biletlarni yecha oladi. Qolgan biletlar Premium bilan ochiladi.`}
            {cheapestPrice !== null && ` Premium ${formatPrice(cheapestPrice)} dan boshlanadi.`}
          </Text>
          <Stack gap="xs">
            <Button variant="primary" fullWidth onClick={() => navigate(ROUTES.PREMIUM)}>
              Premiumni ko'rish
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setLockedTicketId(null)}>
              Yopish
            </Button>
          </Stack>
        </Stack>
      </Modal>
    </div>
  )
}
