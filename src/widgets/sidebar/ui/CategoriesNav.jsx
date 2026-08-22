import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Box, Group, Text, Burger, Drawer, Stack, Button } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconLogout } from '@tabler/icons-react'
import { signOut } from 'firebase/auth'
import { auth } from '../../../shared/api/firebase'
import { useAuth } from '../../../entities/user'
import { ROUTES } from '../../../shared/config/routes'

const LINKS = [
  { to: ROUTES.CATEGORIES, label: 'Mavzular', end: true },
  { to: ROUTES.ROAD_SIGNS, label: "Yo'l belgilari" },
  { to: '/quiz?mode=exam&topic=all', label: 'Imtihon' },
]

const linkStyle = ({ isActive }) => ({
  color: isActive ? 'var(--mantine-color-white)' : 'var(--mantine-color-dark-2)',
  fontWeight: 600,
  fontSize: '0.92rem',
  padding: '8px 0',
  borderBottom: `2px solid ${isActive ? 'var(--mantine-color-brand-6)' : 'transparent'}`,
  textDecoration: 'none',
})

export function CategoriesNav() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()
  const [drawerOpen, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false)

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
        display: 'flex',
        alignItems: 'center',
        gap: 32,
        background: 'var(--mantine-color-dark-7)',
        borderBottom: '1px solid var(--mantine-color-dark-4)',
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
        {LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} style={linkStyle}>
            {link.label}
          </NavLink>
        ))}
      </Group>

      <Group gap={14} fz="0.88rem" c="dimmed" visibleFrom="sm" ml="auto">
        <Text size="sm" c="dimmed">
          {displayName}
        </Text>
        <Button variant="subtle" color="danger" size="xs" onClick={handleLogout} leftSection={<IconLogout size={15} />}>
          Chiqish
        </Button>
      </Group>

      <Burger opened={drawerOpen} onClick={toggleDrawer} hiddenFrom="sm" ml="auto" />

      <Drawer opened={drawerOpen} onClose={closeDrawer} position="right" title="Menyu" hiddenFrom="sm">
        <Stack gap="lg">
          <Stack gap="md">
            {LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} style={linkStyle} onClick={closeDrawer}>
                {link.label}
              </NavLink>
            ))}
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
