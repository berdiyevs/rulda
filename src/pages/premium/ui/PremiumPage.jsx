import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Container, Stack, Title, Text, SimpleGrid, Card, ThemeIcon, Table, Paper } from '@mantine/core'
import { IconCrown, IconCheck, IconMinus } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { CategoriesNav } from '../../../widgets/sidebar'
import { Button } from '../../../shared/ui/Button/Button'
import { Badge } from '../../../shared/ui/Badge/Badge'
import { useAuth } from '../../../entities/user'
import { fetchPlans, createClickPayment } from '../../../entities/payment'
import { FREE_TICKET_LIMIT } from '../../../shared/lib/premium'
import { formatPrice } from '../../../shared/lib/formatPrice'
import { isoToDisplay } from '../../../shared/lib/examDate'
import { ROUTES } from '../../../shared/config/routes'
import './PremiumPage.css'

// Bepul va Premium farqi: shared/lib/premium.js va backend/app/core/premium.py dagi haqiqiy cheklovlar.
const COMPARISON = [
  { feature: 'Biletlar', free: `1–${FREE_TICKET_LIMIT}-biletlar`, premium: 'Barcha biletlar' },
  { feature: "Kengaytirilgan mashq rejimi", free: true, premium: true },
  { feature: "Yo'l belgilari to'plami", free: true, premium: true },
  { feature: 'Kun savoli va statistika', free: true, premium: true },
  { feature: "Qat'iy mashq rejimi", free: false, premium: true },
  { feature: 'Rasmiy imtihon rejimi', free: false, premium: true },
  { feature: "Xatolarim bo'yicha mashq", free: false, premium: true },
]

function Cell({ value }) {
  if (value === true) {
    return (
      <ThemeIcon size={20} radius="xl" variant="light" color="success" mx="auto">
        <IconCheck size={13} />
      </ThemeIcon>
    )
  }
  if (value === false) {
    return (
      <ThemeIcon size={20} radius="xl" variant="light" color="gray" mx="auto">
        <IconMinus size={13} />
      </ThemeIcon>
    )
  }
  return <Text fz="sm">{value}</Text>
}

export function PremiumPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isPremiumActive, profile, refreshProfile } = useAuth()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [buyingPlan, setBuyingPlan] = useState(null)

  useEffect(() => {
    fetchPlans()
      .then(setPlans)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (searchParams.get('status') !== 'success') return
    refreshProfile()
    notifications.show({
      color: 'success',
      title: "To'lov qabul qilindi",
      message: 'Premium bir necha soniyada faollashadi.',
    })
    navigate(ROUTES.PREMIUM, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleBuy = async (planId) => {
    setBuyingPlan(planId)
    try {
      const { payment_url: paymentUrl } = await createClickPayment(planId)
      window.location.href = paymentUrl
    } catch (error) {
      notifications.show({ color: 'danger', title: 'Xatolik', message: error.message })
      setBuyingPlan(null)
    }
  }

  return (
    <div className="page-shell has-tabbar">
      <CategoriesNav />

      <Container size={1000} py="xl">
        <Stack gap={8} mb="xl" ta="center" align="center">
          <ThemeIcon
            size={56}
            radius="xl"
            variant="gradient"
            gradient={{ from: 'warning.6', to: 'accent.5', deg: 135 }}
          >
            <IconCrown size={28} />
          </ThemeIcon>
          <Title order={1}>Premium</Title>
          <Text c="dimmed" maw={480}>
            Barcha biletlar, rasmiy imtihon, qat'iy rejim va xatolaringiz ustida ishlash uchun Premium sotib oling.
          </Text>
          {isPremiumActive && (
            <Badge variant="success">
              Premium faol
              {profile?.premiumUntil ? ` · ${isoToDisplay(profile.premiumUntil)} gacha` : ''}
            </Badge>
          )}
          {isPremiumActive && (
            <Text c="dimmed" fz="sm" maw={420}>
              Muddatni uzaytirsangiz, yangi kunlar hozirgi tugash sanasiga qo'shiladi.
            </Text>
          )}
        </Stack>

        <Stack gap="xl">
        <Paper className="glass-card" p={{ base: 'sm', sm: 'lg' }}>
          <Table className="comparison-table" verticalSpacing="xs" ta="center">
            <Table.Thead>
              <Table.Tr>
                <Table.Th />
                <Table.Th ta="center">Bepul</Table.Th>
                <Table.Th ta="center">Premium</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {COMPARISON.map((row) => (
                <Table.Tr key={row.feature}>
                  <Table.Td ta="left" fz="sm">
                    {row.feature}
                  </Table.Td>
                  <Table.Td>
                    <Cell value={row.free} />
                  </Table.Td>
                  <Table.Td>
                    <Cell value={row.premium} />
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>

        <div className="premium-plans-block">
        {loading ? (
          <Text ta="center" c="dimmed">
            Yuklanmoqda...
          </Text>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            {plans.map((plan) => {
              const isPopular = plan.id === '3_month'
              return (
                <Card
                  key={plan.id}
                  className={`glass-card plan-card${isPopular ? ' is-popular' : ''}`}
                  p="lg"
                  style={isPopular ? { border: '2px solid var(--mantine-color-brand-5)' } : undefined}
                >
                  <Stack gap={10} align="center" ta="center">
                    {isPopular && <Badge variant="primary">Mashhur</Badge>}
                    <Text fw={700} fz="1.1rem">
                      {plan.label}
                    </Text>
                    <Text fw={800} fz="1.6rem">
                      {formatPrice(plan.amount)}
                    </Text>
                    <Text c="dimmed" fz="sm">
                      {plan.days} kun
                    </Text>
                    <Button
                      variant="primary"
                      fullWidth
                      disabled={buyingPlan !== null}
                      onClick={() => handleBuy(plan.id)}
                    >
                      {buyingPlan === plan.id
                        ? "Yo'naltirilmoqda..."
                        : isPremiumActive
                          ? 'Muddatni uzaytirish'
                          : 'Sotib olish'}
                    </Button>
                  </Stack>
                </Card>
              )
            })}
          </SimpleGrid>
        )}
        </div>
        </Stack>

        <Text ta="center" c="dimmed" fz="xs" mt="xl">
          To'lov Click orqali xavfsiz amalga oshiriladi.
        </Text>
      </Container>
    </div>
  )
}
