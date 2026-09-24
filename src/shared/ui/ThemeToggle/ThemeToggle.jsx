import { ActionIcon, useMantineColorScheme } from '@mantine/core'
import { IconSun, IconMoon } from '@tabler/icons-react'

export function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <ActionIcon
      variant="subtle"
      color="gray"
      size="lg"
      radius="xl"
      onClick={toggleColorScheme}
      aria-label="Mavzuni almashtirish"
      title="Mavzuni almashtirish"
    >
      {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
    </ActionIcon>
  )
}
