import { Button } from '../../../shared/ui/Button/Button'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../../shared/config/routes'

const TOPIC_INFO = {
  all: { title: 'Barcha savollar', desc: '600+ savol bazasidan tasodifiy 20 tasi tanlanadi.' },
  signs: { title: "Yo'l belgilari", desc: "Rasm asosidagi savollar bo'yicha mashq." },
  theory: { title: 'Nazariy savollar', desc: 'Faqat matnli, nazariy savollar.' },
}

export function QuizIntro({ topic, mode, onStart }) {
  const info = TOPIC_INFO[topic] || TOPIC_INFO.all

  return (
    <div className="quiz-intro-wrap">
      <div className="quiz-intro-card glass-card slide-up">
        <span className="quiz-intro-mode">{mode === 'exam' ? 'Imtihon rejimi' : "Mashg'ulot"}</span>
        <h1>{info.title}</h1>
        <p>{info.desc}</p>

        <ul className="quiz-intro-rules">
          <li>
            <i className="bi bi-check2-circle"></i> {mode === 'exam' ? '20' : 'Bir nechta'} savol
          </li>
          {mode === 'exam' && (
            <>
              <li>
                <i className="bi bi-clock"></i> 20 daqiqa vaqt
              </li>
              <li>
                <i className="bi bi-exclamation-triangle"></i> Maksimal 2 ta xatoga ruxsat
              </li>
            </>
          )}
          <li>
            <i className="bi bi-save"></i> Natija profilingizga saqlanadi
          </li>
        </ul>

        <div className="quiz-intro-actions">
          <Button variant="secondary" as={Link} to={ROUTES.CATEGORIES}>
            Orqaga
          </Button>
          <Button variant="primary" size="lg" onClick={onStart}>
            Boshlash
          </Button>
        </div>
      </div>
    </div>
  )
}
