import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Box, Group, Text, ActionIcon, Avatar, Button, Modal, Stack } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconLogout,
  IconLayoutGrid,
  IconTicket,
  IconRoadSign,
  IconClock,
  IconChartBar,
  IconShieldLock,
  IconCrown,
} from '@tabler/icons-react'
import { useAuth } from '../../../entities/user'
import { useQuizStart } from '../../../widgets/quiz-start'
import { ThemeToggle } from '../../../shared/ui/ThemeToggle/ThemeToggle'
import { Badge } from '../../../shared/ui/Badge/Badge'
import { ROUTES } from '../../../shared/config/routes'

const LINKS = [
  { to: ROUTES.CATEGORIES, label: 'Asosiy', end: true, icon: IconLayoutGrid },
  { to: ROUTES.TICKETS, label: 'Biletlar', icon: IconTicket },
  { to: ROUTES.ROAD_SIGNS, label: "Belgilar", icon: IconRoadSign },
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
  const { profile, user, logout, isAdmin, isPremiumActive } = useAuth()
  const navigate = useNavigate()
  const openQuizStart = useQuizStart()
  const [logoutOpen, { open: openLogout, close: closeLogout }] = useDisclosure(false)

  const handleExamClick = () => {
    openQuizStart({ topic: 'all', mode: 'exam' })
  }

  const handleLogout = () => {
    closeLogout()
    logout()
    navigate(ROUTES.HOME)
  }

  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0]
  const initial = displayName ? displayName[0].toUpperCase() : '?'

  return (
    <>
      <Box
        component="header"
        h={72}
        px={{ base: 16, sm: 28 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          flexWrap: 'nowrap',
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

        <Group gap={{ base: 16, lg: 26 }} mr="auto" visibleFrom="sm" wrap="nowrap">
          {LINKS.map((link) =>
            link.action === 'exam' ? (
              <button key="exam" type="button" onClick={handleExamClick} style={actionStyle}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Box component="span" visibleFrom="md" style={{ display: 'inline-flex' }}>
                    <link.icon size={16} stroke={2} />
                  </Box>
                  {link.label}
                </span>
              </button>
            ) : (
              <NavLink key={link.to} to={link.to} end={link.end} style={linkStyle}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Box component="span" visibleFrom="md" style={{ display: 'inline-flex' }}>
                    <link.icon size={16} stroke={2} />
                  </Box>
                  {link.label}
                </span>
              </NavLink>
            ),
          )}
        </Group>

        <Group gap={{ base: 8, lg: 14 }} fz="0.88rem" c="dimmed" visibleFrom="sm" ml="auto" wrap="nowrap">
          {isPremiumActive ? (
            <Badge variant="warning">
              <Group gap={4} wrap="nowrap">
                <IconCrown size={12} />
                Premium
              </Group>
            </Badge>
          ) : (
            <Button
              component={Link}
              to={ROUTES.PREMIUM}
              variant="subtle"
              color="warning"
              size="xs"
              leftSection={<IconCrown size={14} />}
            >
              Premium
            </Button>
          )}
          <ThemeToggle />
          {isAdmin && (
            <ActionIcon
              component={Link}
              to={ROUTES.ADMIN}
              variant="subtle"
              color="brand"
              aria-label="Admin panel"
              title="Admin panel"
            >
              <IconShieldLock size={18} />
            </ActionIcon>
          )}
          <Avatar
            radius="xl"
            size={30}
            variant="gradient"
            gradient={{ from: 'brand.6', to: 'accent.5', deg: 135 }}
            color="white"
            title={displayName}
            aria-label={displayName}
          >
            {initial}
          </Avatar>
          <Text size="sm" c="dimmed" visibleFrom="lg">
            {displayName}
          </Text>
          <Button
            variant="subtle"
            color="danger"
            size="xs"
            onClick={openLogout}
            leftSection={<IconLogout size={15} />}
            visibleFrom="lg"
          >
            Chiqish
          </Button>
          <ActionIcon
            variant="subtle"
            color="danger"
            size="lg"
            onClick={openLogout}
            aria-label="Chiqish"
            title="Chiqish"
            hiddenFrom="lg"
          >
            <IconLogout size={18} />
          </ActionIcon>
        </Group>

        <Group gap={6} hiddenFrom="sm" ml="auto">
          <ThemeToggle />
          {isAdmin && (
            <ActionIcon
              component={Link}
              to={ROUTES.ADMIN}
              variant="subtle"
              color="brand"
              aria-label="Admin panel"
              title="Admin panel"
            >
              <IconShieldLock size={18} />
            </ActionIcon>
          )}
          <ActionIcon variant="subtle" color="danger" size="lg" onClick={openLogout} aria-label="Chiqish" title="Chiqish">
            <IconLogout size={18} />
          </ActionIcon>
        </Group>
      </Box>

      <Box component="nav" className="mobile-tabbar" hiddenFrom="sm">
        {LINKS.map((link) =>
          link.action === 'exam' ? (
            <button key="exam" type="button" className="mobile-tabbar-item" onClick={handleExamClick}>
              <span className="mobile-tabbar-icon">
                <link.icon size={21} stroke={2} />
              </span>
              <span>{link.label}</span>
            </button>
          ) : (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `mobile-tabbar-item${isActive ? ' is-active' : ''}`}
            >
              <span className="mobile-tabbar-icon">
                <link.icon size={21} stroke={2} />
              </span>
              <span>{link.label}</span>
            </NavLink>
          ),
        )}
      </Box>

      <Modal opened={logoutOpen} onClose={closeLogout} title="Hisobdan chiqish" centered size={380}>
        <Stack gap="lg">
          <Text c="dimmed" size="sm">
            Hisobingizdan chiqmoqchimisiz?
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="subtle" color="gray" onClick={closeLogout}>
              Bekor qilish
            </Button>
            <Button variant="filled" color="danger" onClick={handleLogout}>
              Chiqish
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
