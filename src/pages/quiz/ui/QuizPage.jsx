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
  const ticketParam = searchParams.get('ticket')

  const ticketId = ticketParam ? Number(ticketParam) : null
  const topic = VALID_TOPICS.includes(topicParam) ? topicParam : 'all'
  const mode = ticketId ? 'ticket' : modeParam === 'exam' ? 'exam' : 'practice'

  const [sessionKey, setSessionKey] = useState(0)
  const [started, setStarted] = useState(false)

  const handleRetry = () => {
    setSessionKey((k) => k + 1)
    setStarted(false)
  }

  return (
    <Box mih="100vh">
      {started ? (
        <QuizPlay key={sessionKey} topic={topic} mode={mode} ticketId={ticketId} onRetry={handleRetry} />
      ) : (
        <QuizIntro topic={topic} mode={mode} ticketId={ticketId} onStart={() => setStarted(true)} />
      )}
    </Box>
  )
}
