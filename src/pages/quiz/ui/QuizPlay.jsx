import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Box, Center, Flex, Skeleton, Text } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { QuizNav, QuizSidebar } from '../../../widgets/quiz-sidebar'
import { QuizResults } from '../../../widgets/quiz-results'
import { QuestionCard } from '../../../entities/question'
import { useQuizEngine } from '../../../features/quiz-engine'
import { useAuth } from '../../../entities/user'
import { isResumableMode } from '../../../entities/quiz-attempt'
import { ROUTES } from '../../../shared/config/routes'

export function QuizPlay({
  topic,
  mode,
  ticketId,
  questionIds,
  questionCount,
  durationMinutes,
  maxMistakes,
  feedbackMode = 'instant',
  resume = false,
  sessionSearch = '',
  onRetry,
}) {
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
    goNext,
    finishNow,
    answeredCount,
    isLastQuestion,
    timeFormatted,
    hasTimeLimit,
  } = useQuizEngine({
    topic,
    mode,
    ticketId,
    questionIds,
    questionCount,
    durationMinutes,
    maxMistakes,
    feedbackMode,
    resume,
    sessionSearch,
  })

  // Foydalanuvchi testga qayerdan kelgan bo'lsa, chiqqanda o'sha yerga qaytadi.
  const location = useLocation()
  const { user } = useAuth()
  const backTo = location.state?.from ?? (mode === 'ticket' ? ROUTES.TICKETS : user ? ROUTES.CATEGORIES : ROUTES.HOME)

  const isMobile = useMediaQuery('(max-width: 800px)', false, { getInitialValueInEffect: false })
  const scrollRef = useRef(null)
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [currentIndex])

  const revealAnswer = feedbackMode !== 'end'
  const displayStatuses =
    feedbackMode === 'end' && !finished
      ? stepStatuses.map((s) => (s === 'idle' ? 'idle' : 'answered'))
      : stepStatuses

  return (
    <Box
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'var(--gradient-surface)',
      }}
    >
      <QuizNav
        mode={mode}
        topic={topic}
        ticketId={ticketId}
        timeFormatted={timeFormatted}
        showTimer={hasTimeLimit && !finished}
        finished={finished}
        answeredCount={answeredCount}
        exitTo={backTo}
        resumable={isResumableMode(mode)}
        onFinish={finishNow}
        currentIndex={finished ? undefined : currentIndex}
        totalSteps={finished ? undefined : totalSteps}
      />

      {!finished && !loading && (
        <Box h={6} style={{ background: 'var(--border)', flexShrink: 0, overflow: 'hidden' }}>
          <Box
            h="100%"
            style={{
              width: `${totalSteps ? (currentIndex / totalSteps) * 100 : 0}%`,
              background: 'var(--gradient-brand)',
              borderRadius: '0 var(--r-full) var(--r-full) 0',
              boxShadow: '0 0 10px 1px rgba(109, 91, 255, 0.55)',
              transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </Box>
      )}

      <Box ref={scrollRef} style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <Flex
          h={isMobile ? 'auto' : '100%'}
          mih="100%"
          gap={isMobile ? 'sm' : 'lg'}
          px={{ base: 12, sm: 28, lg: 40 }}
          py={{ base: 12, sm: 28 }}
          direction={isMobile ? 'column' : 'row'}
          wrap={isMobile ? 'nowrap' : 'wrap'}
        >
          {!finished && (
            <QuizSidebar totalSteps={totalSteps} currentIndex={currentIndex} stepStatuses={displayStatuses} />
          )}

          <Box
            flex={1}
            miw={280}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: isMobile ? 'flex-start' : 'center',
            }}
          >
            {loading && <Skeleton height={420} radius="lg" w="100%" maw={920} />}
            {error && <Text c="danger">{error}</Text>}

            {!loading && !error && finished && (
              <Center w="100%">
                <QuizResults result={result} onRetry={onRetry} backTo={backTo} />
              </Center>
            )}

            {!loading && !error && !finished && (
              <QuestionCard
                key={currentQuestion?.id}
                question={currentQuestion}
                index={currentIndex}
                total={totalSteps}
                selectedOption={selectedOption}
                isAnswered={isAnswered}
                correctAnswer={correctAnswer}
                revealAnswer={revealAnswer}
                onAnswer={handleAnswer}
                onNext={goNext}
                nextLabel={isLastQuestion ? "Natijani ko'rish" : 'Keyingi savol'}
              />
            )}
          </Box>
        </Flex>
      </Box>
    </Box>
  )
}
