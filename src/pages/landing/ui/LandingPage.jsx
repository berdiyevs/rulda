import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Container, Stack, Group, Title, Text, SimpleGrid, Box } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { Navbar } from '../../../widgets/navbar'
import { LoginModal } from '../../../widgets/login-modal'
import { Footer } from '../../../widgets/footer'
import { Button } from '../../../shared/ui/Button/Button'
import { Badge } from '../../../shared/ui/Badge/Badge'
import { useAuth } from '../../../entities/user'
import { ROUTES } from '../../../shared/config/routes'

const STATS = [
  { value: '600+', label: 'Rasmiy savollar' },
  { value: '93', label: "Yo'l belgilari" },
  { value: '24/7', label: 'Istalgan vaqtda mashq' },
]

const FEATURES = [
  {
    icon: '🎯',
    title: 'Real imtihon formati',
    text: "20 ta savol, 20 daqiqa, maksimal 2 ta xato — DAN imtihoniga aynan o'xshash sharoit.",
  },
  {
    icon: '🖼️',
    title: 'Rasmli savollar',
    text: "Yo'l belgilarini haqiqiy rasmlar orqali o'rganing va eslab qoling.",
  },
  {
    icon: '📊',
    title: 'Progress kuzatuvi',
    text: "Har bir urinishingiz saqlanadi — qayerda ko'proq mashq qilish kerakligini bilib boring.",
  },
]

export function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { user, isVerified, isAuthReady } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.state?.requireAuth) {
      setIsModalOpen(true)
    }
  }, [location.state])

  const handlePracticeClick = () => {
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
      setIsModalOpen(true)
    }
  }

  return (
    <>
      <Navbar onOpenModal={() => setIsModalOpen(true)} />
      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <Box component="main" className="page-shell">
        <Box component="section" py={80}>
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
                savollar bazasi, real imtihon rejimi va shaxsiy progress kuzatuvi bilan.
              </Text>
              <Group justify="center">
                <Button variant="primary" size="lg" onClick={handlePracticeClick}>
                  Mashq qilishni boshlash
                </Button>
                <Button variant="secondary" size="lg" onClick={handlePracticeClick}>
                  Imtihonni sinab ko'rish
                </Button>
              </Group>

              <SimpleGrid cols={3} spacing="xl" mt="md">
                {STATS.map((s) => (
                  <Stack key={s.label} gap={2} align="center">
                    <Text fz={28} fw={800} className="gradient-text">
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

        <Box component="section" py={60}>
          <Container size={1180}>
            <Title order={2} ta="center" mb="xl">
              Nega aynan Rulda?
            </Title>
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
              {FEATURES.map((f) => (
                <Stack key={f.title} className="glass-card" p="lg" gap="xs">
                  <Text fz={32}>{f.icon}</Text>
                  <Title order={3} fz="lg">
                    {f.title}
                  </Title>
                  <Text c="dimmed">{f.text}</Text>
                </Stack>
              ))}
            </SimpleGrid>
          </Container>
        </Box>

        <Box component="section" py={60}>
          <Container size={1180}>
            <Stack align="center" ta="center" gap="md" className="glass-card" p="xl">
              <Title order={2}>Bugundan boshlang</Title>
              <Text c="dimmed">Bepul ro'yxatdan o'ting va zaif tomonlaringizni aniqlashtiring.</Text>
              <Button variant="primary" size="lg" onClick={handlePracticeClick}>
                Hoziroq boshlash
              </Button>
            </Stack>
          </Container>
        </Box>
      </Box>

      <Footer />
    </>
  )
}
