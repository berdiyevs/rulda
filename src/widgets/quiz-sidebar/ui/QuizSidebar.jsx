import './QuizSidebar.css'

export function QuizSidebar({ totalSteps, currentIndex, stepStatuses }) {
  const correctCount = stepStatuses.filter((s) => s === 'completed').length
  const wrongCount = stepStatuses.filter((s) => s === 'wrong').length
  const answeredCount = correctCount + wrongCount
  const progressPercent = totalSteps ? Math.round((answeredCount / totalSteps) * 100) : 0

  return (
    <aside className="quiz-sidebar">
      <div className="progress-grid">
        {Array.from({ length: totalSteps }, (_, i) => {
          const label = i + 1 < 10 ? `0${i + 1}` : `${i + 1}`
          const status = stepStatuses[i]
          const classNames = ['step']
          if (i === currentIndex) classNames.push('current')
          if (status === 'completed') classNames.push('completed')
          if (status === 'wrong') classNames.push('wrong')

          return (
            <div className={classNames.join(' ')} key={i}>
              {label}
            </div>
          )
        })}
      </div>

      <div className="exam-status">
        <p>Jarayon</p>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
        <span className="progress-percent">{progressPercent}%</span>
      </div>

      <div className="live-stats">
        <div className="stat stat-correct">
          <span className="dot"></span>
          To'g'ri: {correctCount}
        </div>
        <div className="stat stat-wrong">
          <span className="dot"></span>
          Xato: {wrongCount}
        </div>
      </div>
    </aside>
  )
}
