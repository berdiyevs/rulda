import { useEffect, useMemo, useState } from 'react'
import { Paper, Stack, Group, Title, Text, Skeleton } from '@mantine/core'
import { IconBulb } from '@tabler/icons-react'
import { fetchQuestions } from '../../../entities/question'
import { useAuth } from '../../../entities/user'
import { Badge } from '../../../shared/ui/Badge/Badge'
import { uzToday } from '../../../shared/lib/uzDate'
import './DailyQuestionCard.css'

// Kun O'zbekiston vaqti bo'yicha almashadi (UTC bo'yicha emas: aks holda savol soat 05:00 da o'zgarardi).
function pickDailyQuestion(questions) {
  const dayKey = `uz-${uzToday()}`
  let hash = 0
  for (let i = 0; i < dayKey.length; i += 1) {
    hash = (hash * 31 + dayKey.charCodeAt(i)) >>> 0
  }
  return questions[hash % questions.length]
}

export function DailyQuestionCard() {
  const { user } = useAuth()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOption, setSelectedOption] = useState(null)
  const [isAnswered, setIsAnswered] = useState(false)

  useEffect(() => {
    let isMounted = true
    fetchQuestions()
      .then((data) => {
        if (isMounted) setQuestions(data)
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const dailyQuestion = useMemo(() => (questions.length ? pickDailyQuestion(questions) : null), [questions])
  const correctAnswer = dailyQuestion?.options.find((o) => o.is_correct)

  if (loading) return <Skeleton height={320} radius="lg" />
  if (!dailyQuestion) return null

  const handleAnswer = (option) => {
    setSelectedOption(option)
    setIsAnswered(true)
  }

  const wasCorrect = selectedOption?.is_correct

  return (
    <Paper className="glass-card" p="xl">
      <Stack gap="lg">
        <Group justify="space-between" wrap="wrap">
          <Badge variant="primary">
            <Group gap={6} wrap="nowrap">
              <IconBulb size={13} />
              Kun savoli
            </Group>
          </Badge>
          <Text c="dimmed" fz="xs">
            Har kuni yangilanadi
          </Text>
        </Group>

        <div>
          <Title order={2} fz="lg" mb={4}>
            Bugungi savolni yechib ko'ring
          </Title>
          {!user && (
            <Text c="dimmed" fz="sm">
              Hisobga kirmasdan ham mashq qilishingiz mumkin.
            </Text>
          )}
        </div>

        {dailyQuestion.image_url && (
          <div className="daily-question-image-wrap">
            <img src={dailyQuestion.image_url} alt="Yo'l belgisi" loading="lazy" />
          </div>
        )}

        <div>
          <p className="daily-question-text">{dailyQuestion.question}</p>

          <div className="daily-options">
            {dailyQuestion.options.map((option, i) => {
              const classNames = ['daily-option-btn']
              if (isAnswered) {
                if (selectedOption === option) {
                  classNames.push(option.is_correct ? 'is-correct' : 'is-wrong')
                } else if (correctAnswer === option) {
                  classNames.push('is-correct')
                }
              }

              return (
                <button
                  key={option.id}
                  className={classNames.join(' ')}
                  disabled={isAnswered}
                  onClick={() => handleAnswer(option)}
                >
                  <span className="daily-option-letter">{String.fromCharCode(65 + i)}</span>
                  <span>{option.text}</span>
                </button>
              )
            })}
          </div>

          {isAnswered && (
            <div className={`daily-question-feedback ${wasCorrect ? 'is-correct' : 'is-wrong'}`}>
              {wasCorrect ? "To'g'ri javob!" : `Xato. To'g'ri javob: ${correctAnswer?.text}`}
            </div>
          )}
        </div>
      </Stack>
    </Paper>
  )
}
