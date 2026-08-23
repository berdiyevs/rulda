import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { Box, Group, Text, Avatar, Menu, UnstyledButton } from '@mantine/core'
import { IconChevronDown, IconLogout, IconList } from '@tabler/icons-react'
import { auth } from '../../../shared/api/firebase'
import { useAuth } from '../../../entities/user'
import { Button } from '../../../shared/ui/Button/Button'
import { ThemeToggle } from '../../../shared/ui/ThemeToggle/ThemeToggle'
import { ROUTES } from '../../../shared/config/routes'

export function Navbar({ onOpenModal }) {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut(auth)
    navigate(ROUTES.HOME)
  }

  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0]
  const initial = displayName ? displayName[0].toUpperCase() : '?'

  return (
    <Box
      component="nav"
      pos="fixed"
      top={0}
      left={0}
      w="100%"
      h={72}
      style={{
        zIndex: 1000,
        background: 'var(--bg-overlay)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <Group h="100%" justify="space-between" className="container">
        <Text
          component={Link}
          to={ROUTES.HOME}
          ff="Manrope, Inter, sans-serif"
          fz={24}
          fw={800}
          style={{ letterSpacing: '-0.02em', textDecoration: 'none' }}
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

        <Group gap={12}>
          <ThemeToggle />
          {user ? (
            <Menu shadow="md" width={190} position="bottom-end" withArrow offset={10}>
              <Menu.Target>
                <UnstyledButton
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '6px 14px 6px 6px',
                    borderRadius: 999,
                    background: 'var(--bg-card-hover)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <Avatar
                    radius="xl"
                    size={30}
                    variant="gradient"
                    gradient={{ from: 'brand.6', to: 'accent.5', deg: 135 }}
                    color="white"
                  >
                    {initial}
                  </Avatar>
                  <Text size="sm" fw={600} maw={140} truncate="end">
                    {displayName}
                  </Text>
                  <IconChevronDown size={14} style={{ opacity: 0.6 }} />
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item component={Link} to={ROUTES.CATEGORIES} leftSection={<IconList size={16} />}>
                  Mavzular
                </Menu.Item>
                <Menu.Item color="danger" leftSection={<IconLogout size={16} />} onClick={handleLogout}>
                  Chiqish
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <Button variant="primary" onClick={onOpenModal}>
              Boshlash
            </Button>
          )}
        </Group>
      </Group>
    </Box>
  )
}
