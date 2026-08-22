import { ThemeIcon } from '@mantine/core'
import { IconRoadSign, IconArrowsExchange, IconWalk, IconTool, IconFirstAidKit } from '@tabler/icons-react'

const ICONS = {
  signs: IconRoadSign,
  priority: IconArrowsExchange,
  vulnerable: IconWalk,
  technical: IconTool,
  firstAid: IconFirstAidKit,
}

export function CategoryIcon({ name, size = 22 }) {
  const Icon = ICONS[name]
  if (!Icon) return null

  return (
    <ThemeIcon size={size + 20} radius="md" variant="light" color="brand">
      <Icon size={size} stroke={1.75} />
    </ThemeIcon>
  )
}
