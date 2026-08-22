import { QuizNav, QuizSidebar } from '../../../widgets/quiz-sidebar'
import { QuizResults } from '../../../widgets/quiz-results'
import { QuestionCard } from '../../../entities/question'
import { Spinner } from '../../../shared/ui/Spinner/Spinner'
import { useQuizEngine } from '../../../features/quiz-engine'

export function QuizPlay({ topic, mode, onRetry }) {
  const {
    loading,
    error,
    finished,
    result,
    currentQuestion,
    currentIndex,
    totalSteps,
    stepStatuses,
    selectedOption,
    isAnswered,
    correctAnswer,
    handleAnswer,
    timeFormatted,
  } = useQuizEngine({ topic, mode })

  return (
    <div className="quiz-play-root">
      <QuizNav mode={mode} topic={topic} timeFormatted={timeFormatted} />

      <div className="quiz-layout">
        {!finished && <QuizSidebar totalSteps={totalSteps} currentIndex={currentIndex} stepStatuses={stepStatuses} />}

        <div className="quiz-main">
          {loading && <Spinner label="Savollar yuklanmoqda..." />}
          {error && <p className="quiz-status-text">{error}</p>}

          {!loading && !error && finished && <QuizResults result={result} onRetry={onRetry} />}

          {!loading && !error && !finished && (
            <QuestionCard
              question={currentQuestion}
              selectedOption={selectedOption}
              isAnswered={isAnswered}
              correctAnswer={correctAnswer}
              onAnswer={handleAnswer}
            />
          )}
        </div>
      </div>
    </div>
  )
}
