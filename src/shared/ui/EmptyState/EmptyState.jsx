import { Stack, Title, Text } from '@mantine/core'

export function EmptyState({ icon = '🔒', title, description, action }) {
  return (
    <Stack align="center" gap="xs" ta="center" py="xl" className="fade-in">
      <Text fz={40}>{icon}</Text>
      {title && <Title order={3}>{title}</Title>}
      {description && <Text c="dimmed">{description}</Text>}
      {action}
    </Stack>
  )
}
