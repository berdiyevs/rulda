import './Button.css'

export function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...rest
}) {
  const classes = ['btn', `btn-${variant}`, `btn-${size}`, fullWidth ? 'btn-full' : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  )
}
