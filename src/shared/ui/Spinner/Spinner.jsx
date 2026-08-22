import { Loader, Stack, Text } from '@mantine/core'

export function Spinner({ size = 40, label }) {
  return (
    <Stack align="center" gap="sm">
      <Loader size={size} color="brand" />
      {label && (
        <Text c="dimmed" size="sm">
          {label}
        </Text>
      )}
    </Stack>
  )
}
