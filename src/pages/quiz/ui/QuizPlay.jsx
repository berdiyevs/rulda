import { Box, Center, Flex, Skeleton, Text } from '@mantine/core'
import { QuizNav, QuizSidebar } from '../../../widgets/quiz-sidebar'
import { QuizResults } from '../../../widgets/quiz-results'
import { QuestionCard } from '../../../entities/question'
import { useQuizEngine } from '../../../features/quiz-engine'

export function QuizPlay({ topic, mode, ticketId, questionIds, questionCount, durationMinutes, onRetry }) {
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
    hasTimeLimit,
  } = useQuizEngine({ topic, mode, ticketId, questionIds, questionCount, durationMinutes })

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
        showTimer={hasTimeLimit}
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

      <Box style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <Flex h="100%" gap="lg" px={{ base: 20, sm: 28, lg: 40 }} py={{ base: 20, sm: 28 }} wrap="wrap">
          {!finished && (
            <QuizSidebar totalSteps={totalSteps} currentIndex={currentIndex} stepStatuses={stepStatuses} />
          )}

          <Box
            flex={1}
            miw={280}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            {loading && <Skeleton height={420} radius="lg" w="100%" maw={920} />}
            {error && <Text c="danger">{error}</Text>}

            {!loading && !error && finished && (
              <Center w="100%">
                <QuizResults result={result} onRetry={onRetry} />
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
                onAnswer={handleAnswer}
              />
            )}
          </Box>
        </Flex>
      </Box>
    </Box>
  )
}
