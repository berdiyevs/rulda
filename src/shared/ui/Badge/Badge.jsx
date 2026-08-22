import { Badge as MantineBadge } from '@mantine/core'

const COLOR_MAP = {
  default: 'gray',
  primary: 'brand',
  success: 'success',
  danger: 'danger',
  warning: 'warning',
}

export function Badge({ variant = 'default', children, className }) {
  return (
    <MantineBadge variant="light" color={COLOR_MAP[variant] ?? 'gray'} className={className}>
      {children}
    </MantineBadge>
  )
}
