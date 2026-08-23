import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Box, Group, Text, Burger, Drawer, Stack, Button } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconLogout,
  IconLayoutGrid,
  IconTicket,
  IconRoadSign,
  IconClock,
  IconChartBar,
} from '@tabler/icons-react'
import { signOut } from 'firebase/auth'
import { auth } from '../../../shared/api/firebase'
import { useAuth } from '../../../entities/user'
import { useQuizStart } from '../../../widgets/quiz-start'
import { ThemeToggle } from '../../../shared/ui/ThemeToggle/ThemeToggle'
import { ROUTES } from '../../../shared/config/routes'

const LINKS = [
  { to: ROUTES.CATEGORIES, label: 'Mavzular', end: true, icon: IconLayoutGrid },
  { to: ROUTES.TICKETS, label: 'Biletlar', icon: IconTicket },
  { to: ROUTES.ROAD_SIGNS, label: "Yo'l belgilari", icon: IconRoadSign },
  { action: 'exam', label: 'Imtihon', icon: IconClock },
  { to: ROUTES.STATISTICS, label: 'Statistika', icon: IconChartBar },
]

const linkStyle = ({ isActive }) => ({
  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
  fontWeight: 600,
  fontSize: '0.92rem',
  padding: '8px 0',
  borderBottom: `2px solid ${isActive ? 'var(--mantine-color-brand-6)' : 'transparent'}`,
  textDecoration: 'none',
})

const actionStyle = {
  ...linkStyle({ isActive: false }),
  background: 'none',
  border: 'none',
  borderBottom: '2px solid transparent',
  cursor: 'pointer',
  font: 'inherit',
}

export function CategoriesNav() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()
  const openQuizStart = useQuizStart()
  const [drawerOpen, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false)

  const handleExamClick = () => {
    closeDrawer()
    openQuizStart({ topic: 'all', mode: 'exam' })
  }

  const handleLogout = async () => {
    closeDrawer()
    await signOut(auth)
    navigate(ROUTES.HOME)
  }

  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0]

  return (
    <Box
      component="header"
      h={72}
      px={28}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: 32,
        background: 'var(--bg-elevated)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <Text
        component={Link}
        to={ROUTES.HOME}
        ff="Manrope, Inter, sans-serif"
        fz={22}
        fw={800}
        style={{ textDecoration: 'none' }}
      >
        <Text
          component="span"
          variant="gradient"
          gradient={{ from: 'brand.6', to: 'accent.5', deg: 135 }}
          inherit
          fw={800}
        >
          Rul
        </Text>
        da
      </Text>

      <Group gap={26} mr="auto" visibleFrom="sm">
        {LINKS.map((link) =>
          link.action === 'exam' ? (
            <button key="exam" type="button" onClick={handleExamClick} style={actionStyle}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <link.icon size={16} stroke={2} />
                {link.label}
              </span>
            </button>
          ) : (
            <NavLink key={link.to} to={link.to} end={link.end} style={linkStyle}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <link.icon size={16} stroke={2} />
                {link.label}
              </span>
            </NavLink>
          ),
        )}
      </Group>

      <Group gap={14} fz="0.88rem" c="dimmed" visibleFrom="sm" ml="auto">
        <ThemeToggle />
        <Text size="sm" c="dimmed">
          {displayName}
        </Text>
        <Button variant="subtle" color="danger" size="xs" onClick={handleLogout} leftSection={<IconLogout size={15} />}>
          Chiqish
        </Button>
      </Group>

      <Group gap={6} hiddenFrom="sm" ml="auto">
        <ThemeToggle />
        <Burger opened={drawerOpen} onClick={toggleDrawer} />
      </Group>

      <Drawer opened={drawerOpen} onClose={closeDrawer} position="right" title="Menyu" hiddenFrom="sm">
        <Stack gap="lg">
          <Stack gap="md">
            {LINKS.map((link) =>
              link.action === 'exam' ? (
                <button
                  key="exam"
                  type="button"
                  onClick={handleExamClick}
                  style={{ ...actionStyle, textAlign: 'left' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <link.icon size={18} stroke={2} />
                    {link.label}
                  </span>
                </button>
              ) : (
                <NavLink key={link.to} to={link.to} end={link.end} style={linkStyle} onClick={closeDrawer}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <link.icon size={18} stroke={2} />
                    {link.label}
                  </span>
                </NavLink>
              ),
            )}
          </Stack>
          <Text size="sm" c="dimmed">
            {displayName}
          </Text>
          <Button
            variant="light"
            color="danger"
            onClick={handleLogout}
            leftSection={<IconLogout size={16} />}
            fullWidth
          >
            Chiqish
          </Button>
        </Stack>
      </Drawer>
    </Box>
  )
}
