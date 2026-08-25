import { forwardRef } from 'react'
import { Button as MantineButton } from '@mantine/core'

const VARIANT_MAP = {
  primary: { variant: 'gradient' },
  secondary: { variant: 'light', color: 'brand' },
  ghost: { variant: 'subtle', color: 'brand' },
  danger: { variant: 'filled', color: 'danger' },
  outline: { variant: 'outline', color: 'brand' },
}

export const Button = forwardRef(function Button(
  { as, variant = 'primary', size = 'md', fullWidth = false, className, children, ...rest },
  ref,
) {
  const mapped = VARIANT_MAP[variant] ?? VARIANT_MAP.primary
  const component = as && as !== 'button' ? as : undefined

  return (
    <MantineButton
      ref={ref}
      component={component}
      variant={mapped.variant}
      color={mapped.color}
      size={size}
      fullWidth={fullWidth}
      className={className}
      {...rest}
    >
      {children}
    </MantineButton>
  )
})
