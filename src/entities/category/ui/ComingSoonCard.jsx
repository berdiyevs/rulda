import { CategoryIcon } from '../../../shared/ui/CategoryIcon/CategoryIcon'
import { Badge } from '../../../shared/ui/Badge/Badge'
import './ComingSoonCard.css'

export function ComingSoonCard({ topic }) {
  const { icon, title, description } = topic

  return (
    <div className="topic-card topic-card-disabled">
      <div className="topic-card-top">
        <div className="topic-icon">
          <CategoryIcon name={icon} />
        </div>
        <Badge variant="default">Tez kunda</Badge>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}
