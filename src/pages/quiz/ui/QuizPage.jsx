import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Box } from '@mantine/core'
import { QuizIntro } from './QuizIntro'
import { QuizPlay } from './QuizPlay'

const VALID_TOPICS = ['all', 'signs', 'theory']

export function QuizPage() {
  const [searchParams] = useSearchParams()
  const topicParam = searchParams.get('topic')
  const modeParam = searchParams.get('mode')

  const topic = VALID_TOPICS.includes(topicParam) ? topicParam : 'all'
  const mode = modeParam === 'exam' ? 'exam' : 'practice'

  const [sessionKey, setSessionKey] = useState(0)
  const [started, setStarted] = useState(false)

  const handleRetry = () => {
    setSessionKey((k) => k + 1)
    setStarted(false)
  }

  return (
    <Box mih="100vh">
      {started ? (
        <QuizPlay key={sessionKey} topic={topic} mode={mode} onRetry={handleRetry} />
      ) : (
        <QuizIntro topic={topic} mode={mode} onStart={() => setStarted(true)} />
      )}
    </Box>
  )
}
