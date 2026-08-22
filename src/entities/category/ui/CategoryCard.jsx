import { Link } from 'react-router-dom'
import { CategoryIcon } from '../../../shared/ui/CategoryIcon/CategoryIcon'
import { Badge } from '../../../shared/ui/Badge/Badge'
import './CategoryCard.css'

export function CategoryCard({ topic, latestAttempt }) {
  const { icon, title, description, id } = topic

  const scorePercent = latestAttempt
    ? Math.round((latestAttempt.correctCount / latestAttempt.totalQuestions) * 100)
    : null

  return (
    <Link to={`/quiz?topic=${id}`} className="topic-card slide-up">
      <div className="topic-card-top">
        <div className="topic-icon">
          <CategoryIcon name={icon} />
        </div>
        {scorePercent !== null ? (
          <Badge variant={scorePercent >= 70 ? 'success' : 'warning'}>{scorePercent}%</Badge>
        ) : (
          <Badge>Boshlanmagan</Badge>
        )}
      </div>

      <h3>{title}</h3>
      <p>{description}</p>

      <div className="topic-card-footer">
        {latestAttempt ? (
          <span>
            Oxirgi urinish: {latestAttempt.correctCount}/{latestAttempt.totalQuestions} to'g'ri
          </span>
        ) : (
          <span>Mashq qilishni boshlang</span>
        )}
        <span className="topic-arrow">→</span>
      </div>
    </Link>
  )
}
