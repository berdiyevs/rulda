import { useEffect, useRef, useState } from 'react'
import { Card, Grid, Modal } from '@mantine/core'
import { IconEye, IconArrowRight, IconZoomIn } from '@tabler/icons-react'
import { Button } from '../../../shared/ui/Button/Button'
import './QuestionCard.css'

export function QuestionCard({
  question,
  index,
  total,
  selectedOption,
  isAnswered,
  correctAnswer,
  revealAnswer = true,
  onAnswer,
  onNext,
  nextLabel = 'Keyingi savol',
}) {
  const [imageError, setImageError] = useState(false)
  const [zoomOpen, setZoomOpen] = useState(false)
  const nextRef = useRef(null)

  // Telefonda javobdan keyin "Keyingi savol" tugmasi ekrandan pastda qolib ketmasin.
  useEffect(() => {
    if (!isAnswered || !revealAnswer) return
    const frame = requestAnimationFrame(() => {
      nextRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
    return () => cancelAnimationFrame(frame)
  }, [isAnswered, revealAnswer])

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
            <button
              type="button"
              className="question-image"
              onClick={() => setZoomOpen(true)}
              aria-label="Rasmni kattalashtirish"
            >
              <img
                src={question.image_url}
                alt="Savol rasmi"
                onError={() => setImageError(true)}
              />
              <span className="question-image-zoom" aria-hidden="true">
                <IconZoomIn size={16} />
              </span>
            </button>
            <div className="question-image-caption">
              <IconEye size={13} stroke={2} />
              <span>Rasmga diqqat bilan e'tibor bering</span>
            </div>
          </Grid.Col>
        )}

        <Grid.Col span={{ base: 12, sm: hasImage ? 7 : 12 }}>
          {/* Padding ichki div'da: Grid.Col o'z paddingini (gutter) majburan qo'yadi va telefonda
              matn karta chetiga yopishib qolardi. */}
          <div className="question-body">
          {showCounter && <span className="question-counter">Savol {index + 1} / {total}</span>}
          <p className="question-text">{question.question}</p>

          <div className="options-list">
            {question.options.map((option, i) => {
              const classNames = ['option-btn']
              if (isAnswered) {
                if (revealAnswer) {
                  if (selectedOption === option) {
                    classNames.push(option.is_correct ? 'is-correct' : 'is-wrong')
                  } else if (correctAnswer === option) {
                    classNames.push('is-correct')
                  }
                } else if (selectedOption === option) {
                  classNames.push('is-selected')
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

          {isAnswered && revealAnswer && onNext && (
            <Button
              ref={nextRef}
              variant="primary"
              size="md"
              className="question-next-btn"
              rightSection={<IconArrowRight size={16} />}
              onClick={onNext}
            >
              {nextLabel}
            </Button>
          )}
          </div>
        </Grid.Col>
      </Grid>

      {hasImage && (
        <Modal
          opened={zoomOpen}
          onClose={() => setZoomOpen(false)}
          size="xl"
          centered
          title="Savol rasmi"
          zIndex={2000}
        >
          <img src={question.image_url} alt="Savol rasmi (katta)" className="question-image-full" />
        </Modal>
      )}
    </Card>
  )
}
