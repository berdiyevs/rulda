import './Badge.css'

export function Badge({ variant = 'default', children, className = '' }) {
  return <span className={`badge badge-${variant} ${className}`}>{children}</span>
}
