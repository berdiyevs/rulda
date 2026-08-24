import { useState } from 'react'
import { Card, Grid } from '@mantine/core'
import { IconEye } from '@tabler/icons-react'
import './QuestionCard.css'

export function QuestionCard({ question, index, total, selectedOption, isAnswered, correctAnswer, onAnswer }) {
  const [imageError, setImageError] = useState(false)

  if (!question) return null

  const hasImage = Boolean(question.image_url) && !imageError
  const showCounter = Number.isInteger(index) && Number.isInteger(total) && total > 0

  return (
    <Card
      className="question-card-shell slide-up"
      padding={0}
      w="100%"
      maw={920}
      style={{ overflow: 'hidden' }}
    >
      <Grid gutter={0}>
        {hasImage && (
          <Grid.Col span={{ base: 12, sm: 5 }} className="question-image-col">
            <div className="question-image">
              <img
                src={question.image_url}
                alt="Yo'l belgisi"
                loading="lazy"
                onError={() => setImageError(true)}
              />
            </div>
            <div className="question-image-caption">
              <IconEye size={13} stroke={2} />
              <span>Rasmga diqqat bilan e'tibor bering</span>
            </div>
          </Grid.Col>
        )}

        <Grid.Col span={{ base: 12, sm: hasImage ? 7 : 12 }} className="question-body">
          {showCounter && <span className="question-counter">Savol {index + 1} / {total}</span>}
          <p className="question-text">{question.question}</p>

          <div className="options-list">
            {question.options.map((option, i) => {
              const classNames = ['option-btn']
              if (isAnswered) {
                if (selectedOption === option) {
                  classNames.push(option.is_correct ? 'is-correct' : 'is-wrong')
                } else if (!option.is_correct && correctAnswer === option) {
                  classNames.push('is-correct')
                }
              }

              return (
                <button
                  key={option.id}
                  className={classNames.join(' ')}
                  disabled={isAnswered}
                  onClick={() => onAnswer(option)}
                >
                  <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                  <span>{option.text}</span>
                </button>
              )
            })}
          </div>
        </Grid.Col>
      </Grid>
    </Card>
  )
}
