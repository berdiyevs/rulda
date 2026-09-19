import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Container, Stack, Title, Text, SimpleGrid, Card, List, ThemeIcon } from '@mantine/core'
import { IconCrown, IconCircleCheck } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { CategoriesNav } from '../../../widgets/sidebar'
import { Button } from '../../../shared/ui/Button/Button'
import { Badge } from '../../../shared/ui/Badge/Badge'
import { useAuth } from '../../../entities/user'
import { fetchPlans, createClickPayment } from '../../../entities/payment'
import { ROUTES } from '../../../shared/config/routes'

const PLAN_FEATURES = [
  'Barcha 62 ta bilet',
  'Rasmiy imtihon rejimi',
  "Qat'iy mashq rejimi",
  "Xatolarim bo'yicha maxsus mashq",
]

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
            Barcha 62 ta bilet, rasmiy imtihon, qat'iy rejim va xatolaringiz ustida ishlash uchun
            Premium sotib oling.
          </Text>
          {isPremiumActive && (
            <Badge variant="success">
              Premium faol
              {profile?.premiumUntil
                ? ` · ${new Date(`${profile.premiumUntil}T00:00:00`).toLocaleDateString('uz-UZ')} gacha`
                : ''}
            </Badge>
          )}
        </Stack>

        {loading ? (
          <Text ta="center" c="dimmed">
            Yuklanmoqda...
          </Text>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className="glass-card"
                p="lg"
                style={
                  plan.id === '3_month'
                    ? { border: '2px solid var(--mantine-color-brand-5)' }
                    : undefined
                }
              >
                <Stack gap={10} align="center" ta="center">
                  {plan.id === '3_month' && <Badge variant="primary">Mashhur</Badge>}
                  <Text fw={700} fz="1.1rem">
                    {plan.label}
                  </Text>
                  <Text fw={800} fz="1.6rem">
                    {plan.amount.toLocaleString('uz-UZ')} so'm
                  </Text>
                  <List
                    spacing={6}
                    size="sm"
                    center
                    icon={
                      <ThemeIcon size={18} radius="xl" variant="light" color="success">
                        <IconCircleCheck size={12} />
                      </ThemeIcon>
                    }
                  >
                    {PLAN_FEATURES.map((feature) => (
                      <List.Item key={feature}>{feature}</List.Item>
                    ))}
                  </List>
                  <Button
                    variant="primary"
                    fullWidth
                    disabled={buyingPlan !== null}
                    onClick={() => handleBuy(plan.id)}
                  >
                    {buyingPlan === plan.id ? "Yo'naltirilmoqda..." : 'Sotib olish'}
                  </Button>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        )}

        <Text ta="center" c="dimmed" fz="xs" mt="xl">
          To'lov Click orqali xavfsiz amalga oshiriladi.
        </Text>
      </Container>
    </div>
  )
}
