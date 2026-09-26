import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Container, Stack, Group, Title, Text, SimpleGrid, Box, Accordion, ThemeIcon } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconTargetArrow, IconPhoto, IconChartBar } from '@tabler/icons-react'
import { Navbar } from '../../../widgets/navbar'
import { useLoginModal } from '../../../widgets/login-modal'
import { Footer } from '../../../widgets/footer'
import { Button } from '../../../shared/ui/Button/Button'
import { Badge } from '../../../shared/ui/Badge/Badge'
import { useAuth } from '../../../entities/user'
import { ROUTES } from '../../../shared/config/routes'
import { FAQS } from '../model/faq'

// Raqamlar bosiladigan havolalar: foydalanuvchi va qidiruv tizimlari uchun ichki bo'limlarga yo'l.
const STATS = [
  { value: '1240 ta', label: 'Rasmiy savollar', to: ROUTES.TICKETS },
  { value: '93', label: "Yo'l belgilari", to: ROUTES.ROAD_SIGNS },
  { value: '62 ta bilet', label: 'Har birida 20 ta savol', to: ROUTES.TICKETS },
]

const FEATURES = [
  {
    icon: IconTargetArrow,
    title: 'Real imtihon formati',
    text: "20 ta savol, 25 daqiqa, maksimal 2 ta xato — DAN imtihoniga aynan o'xshash sharoit.",
  },
  {
    icon: IconPhoto,
    title: 'Rasmli savollar',
    text: "Yo'l belgilarini haqiqiy rasmlar orqali o'rganing va eslab qoling.",
  },
  {
    icon: IconChartBar,
    title: 'Progress kuzatuvi',
    text: "Har bir urinishingiz saqlanadi — qayerda ko'proq mashq qilish kerakligini bilib boring.",
  },
]

export function LandingPage() {
  const openLogin = useLoginModal()
  const { user, isVerified, isAuthReady } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!location.state?.requireAuth) return
    const from = location.state.from
    openLogin({
      title: location.state.reason,
      redirectTo: from ? `${from.pathname}${from.search || ''}` : undefined,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

  const isMember = Boolean(user)

  // Kirgan foydalanuvchi ichki sahifaga o'tadi; mehmon ro'yxatdan o'tmasdan mini-testni boshlaydi.
  const handlePrimaryClick = () => {
    if (!isAuthReady) return
    if (user && isVerified) {
      navigate(ROUTES.CATEGORIES)
    } else if (user && !isVerified) {
      notifications.show({
        color: 'warning',
        title: 'Email tasdiqlanmagan',
        message: 'Iltimos, avval emailingizni tasdiqlang. Tasdiqlash xati emailingizga yuborilgan.',
      })
    } else {
      navigate(`${ROUTES.QUIZ}?mode=mini`)
    }
  }

  const handleSecondaryClick = () => {
    if (!isAuthReady) return
    if (user) {
      navigate(ROUTES.TICKETS)
    } else {
      navigate(`${ROUTES.QUIZ}?ticket=1&duration=25&errors=2&feedback=instant`)
    }
  }

  return (
    <>
      <Navbar onOpenModal={() => openLogin()} />

      <Box component="main" className="page-shell">
        <Box component="section" py={{ base: 32, sm: 64 }}>
          <Container size={1180}>
            <Stack align="center" gap="lg" ta="center" maw={720} mx="auto">
              <Badge variant="primary">✦ 2026 test bazasi yangilandi</Badge>
              <Title order={1} fz={{ base: 32, sm: 48 }} fw={800}>
                Haydovchilik guvohnomasini{' '}
                <Text component="span" className="gradient-text" inherit fw={800}>
                  birinchi urinishda
                </Text>{' '}
                oling
              </Title>
              <Text c="dimmed" fz="lg">
                O'zbekiston yo'l harakati qoidalarini interaktiv testlar orqali o'rganing. Rasmiy DAN
                savollar bazasi, imtihon formatidagi biletlar va shaxsiy progress kuzatuvi bilan.
              </Text>
              <Group justify="center">
                <Button variant="primary" size="lg" onClick={handlePrimaryClick}>
                  {isMember ? 'Davom ettirish' : 'Mashq qilishni boshlash'}
                </Button>
                <Button variant="secondary" size="lg" onClick={handleSecondaryClick}>
                  {isMember ? 'Biletlar' : "Imtihonni sinab ko'rish"}
                </Button>
              </Group>
            </Stack>

            <Stack align="center" ta="center" maw={720} mx="auto" mt={{ base: 'lg', sm: 'xl' }}>
              <SimpleGrid cols={3} spacing={{ base: 8, sm: 'xl' }} mt="md" w="100%">
                {STATS.map((s) => (
                  <Stack
                    key={s.label}
                    component={Link}
                    to={s.to}
                    gap={2}
                    align="center"
                    className="landing-stat-link"
                  >
                    <Text fz={{ base: 18, sm: 28 }} fw={800} className="gradient-text" ta="center">
                      {s.value}
                    </Text>
                    <Text c="dimmed" size="sm">
                      {s.label}
                    </Text>
                  </Stack>
                ))}
              </SimpleGrid>
            </Stack>
          </Container>
        </Box>

        <Box component="section" py={{ base: 32, sm: 60 }}>
          <Container size={1180}>
            <Title order={2} ta="center" mb="xl">
              Nega aynan Rulda?
            </Title>
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
              {FEATURES.map((f) => (
                <Stack key={f.title} className="glass-card" p="lg" gap="xs">
                  <ThemeIcon size={48} radius="xl" variant="gradient" gradient={{ from: 'brand.6', to: 'accent.5', deg: 135 }}>
                    <f.icon size={24} stroke={1.8} />
                  </ThemeIcon>
                  <Title order={3} fz="lg" mt={4}>
                    {f.title}
                  </Title>
                  <Text c="dimmed">{f.text}</Text>
                </Stack>
              ))}
            </SimpleGrid>
          </Container>
        </Box>

        <Box component="section" py={{ base: 32, sm: 60 }}>
          <Container size={720}>
            <Title order={2} ta="center" mb="xl">
              Ko'p so'raladigan savollar
            </Title>
            <Accordion variant="separated" radius="lg">
              {FAQS.map((faq) => (
                <Accordion.Item key={faq.question} value={faq.question} className="glass-card">
                  <Accordion.Control>
                    <Text fw={600}>{faq.question}</Text>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Text c="dimmed">{faq.answer}</Text>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </Container>
        </Box>

        <Box component="section" py={{ base: 32, sm: 60 }}>
          <Container size={1180}>
            <Stack align="center" ta="center" gap="md" className="glass-card" p="xl">
              <Title order={2}>{isMember ? 'Mashqni davom ettiring' : 'Bugundan boshlang'}</Title>
              <Text c="dimmed">
                {isMember
                  ? "Har kuni ozgina mashq qiling: seriyangiz va natijalaringiz saqlanib boradi."
                  : "Ro'yxatdan o'tmasdan 10 ta savollik mini-testni yeching va darajangizni bilib oling."}
              </Text>
              <Button variant="primary" size="lg" onClick={handlePrimaryClick}>
                {isMember ? 'Davom ettirish' : 'Hoziroq boshlash'}
              </Button>
            </Stack>
          </Container>
        </Box>
      </Box>

      <Footer />
    </>
  )
}
