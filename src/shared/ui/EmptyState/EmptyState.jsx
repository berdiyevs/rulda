import './EmptyState.css'

export function EmptyState({ icon = '🔒', title, description, action }) {
  return (
    <div className="empty-state fade-in">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  )
}
