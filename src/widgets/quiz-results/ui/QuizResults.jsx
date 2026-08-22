import { Link } from 'react-router-dom'
import { Button } from '../../../shared/ui/Button/Button'
import { Badge } from '../../../shared/ui/Badge/Badge'
import { ROUTES } from '../../../shared/config/routes'
import './QuizResults.css'

export function QuizResults({ result, onRetry }) {
  if (!result) return null

  const { correctCount, wrongCount, totalQuestions, passed, mode } = result
  const percent = Math.round((correctCount / totalQuestions) * 100)

  return (
    <div className="results-card slide-up">
      <div className={`results-badge ${passed ? 'pass' : 'fail'}`}>
        {passed ? '✓' : '✕'}
      </div>

      <h2>{passed ? "Tabriklaymiz!" : 'Qayta urinib ko\'ring'}</h2>
      <p className="results-subtitle">
        {mode === 'exam'
          ? passed
            ? "Siz imtihondan muvaffaqiyatli o'tdingiz."
            : "Imtihondan o'ta olmadingiz, ruxsat etilgan xatolar sonidan oshib ketdi."
          : "Mashg'ulot yakunlandi."}
      </p>

      <div className="results-score">
        <span className="score-number">{percent}%</span>
        <span className="score-label">to'g'ri javoblar</span>
      </div>

      <div className="results-stats">
        <div className="stat-box">
          <Badge variant="success">To'g'ri</Badge>
          <span>{correctCount}</span>
        </div>
        <div className="stat-box">
          <Badge variant="danger">Xato</Badge>
          <span>{wrongCount}</span>
        </div>
        <div className="stat-box">
          <Badge>Jami</Badge>
          <span>{totalQuestions}</span>
        </div>
      </div>

      <div className="results-actions">
        <Button variant="secondary" as={Link} to={ROUTES.CATEGORIES}>
          Mavzularga qaytish
        </Button>
        <Button variant="primary" onClick={onRetry}>
          Qayta urinish
        </Button>
      </div>
    </div>
  )
}
