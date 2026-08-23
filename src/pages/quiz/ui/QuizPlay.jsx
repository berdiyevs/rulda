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
    <Box mih="100vh">
      <QuizNav
        mode={mode}
        topic={topic}
        ticketId={ticketId}
        timeFormatted={timeFormatted}
        showTimer={hasTimeLimit}
      />

      <Flex align="flex-start" gap="lg" px={{ base: 'md', md: 'xl' }} py="lg" wrap="wrap">
        {!finished && (
          <QuizSidebar totalSteps={totalSteps} currentIndex={currentIndex} stepStatuses={stepStatuses} />
        )}

        <Box flex={1} miw={280}>
          {loading && <Skeleton height={420} radius="lg" />}
          {error && <Text c="danger">{error}</Text>}

          {!loading && !error && finished && (
            <Center mih="70vh">
              <QuizResults result={result} onRetry={onRetry} />
            </Center>
          )}

          {!loading && !error && !finished && (
            <QuestionCard
              question={currentQuestion}
              selectedOption={selectedOption}
              isAnswered={isAnswered}
              correctAnswer={correctAnswer}
              onAnswer={handleAnswer}
            />
          )}
        </Box>
      </Flex>
    </Box>
  )
}
