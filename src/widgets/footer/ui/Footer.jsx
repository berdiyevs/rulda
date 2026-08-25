import { Link } from 'react-router-dom'
import { Box, Stack, Group, Anchor, Text } from '@mantine/core'
import { ROUTES } from '../../../shared/config/routes'

export function Footer() {
  return (
    <Box
      component="footer"
      py={44}
      style={{ borderTop: '1px solid var(--border)' }}
    >
      <Stack align="center" gap={18} ta="center" className="container">
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

        <Group gap={22} justify="center" wrap="wrap">
          <Anchor component={Link} to={ROUTES.TERMS} c="dimmed" fz="0.88rem">
            Foydalanish shartlari
          </Anchor>
          <Anchor component={Link} to={ROUTES.PRIVACY} c="dimmed" fz="0.88rem">
            Maxfiylik siyosati
          </Anchor>
          <Anchor href="#" c="dimmed" fz="0.88rem">
            Texnik yordam
          </Anchor>
        </Group>

        <Text c="dimmed" fz="0.82rem">
          &copy; {new Date().getFullYear()} Rulda. Barcha huquqlar himoyalangan.
        </Text>
      </Stack>
    </Box>
  )
}
