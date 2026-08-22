import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../../shared/config/routes'
import './QuizNav.css'

const TOPIC_LABELS = {
  all: 'Barcha savollar',
  signs: "Yo'l belgilari",
  theory: 'Nazariy savollar',
}

export function QuizNav({ mode, topic, timeFormatted }) {
  const navigate = useNavigate()

  const handleQuit = () => {
    if (window.confirm("Testni tark etmoqchimisiz? Joriy urinish saqlanmaydi.")) {
      navigate(ROUTES.CATEGORIES)
    }
  }

  return (
    <div className="quiz-nav">
      <div className="logo">
        Rul<span>da</span>
      </div>
      <p className="quiz-nav-label">
        {mode === 'exam' ? 'Imtihon rejimi' : 'Mashg\'ulot'} · {TOPIC_LABELS[topic] || topic}
      </p>

      {mode === 'exam' && (
        <div className="time">
          <i className="bi bi-clock"></i>
          <p>{timeFormatted}</p>
        </div>
      )}

      <button className="quit" onClick={handleQuit}>
        Tugatish
      </button>
    </div>
  )
}
