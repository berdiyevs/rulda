import { Box, Flex, Skeleton, Text } from '@mantine/core'
import { QuizNav, QuizSidebar } from '../../../widgets/quiz-sidebar'
import { QuizResults } from '../../../widgets/quiz-results'
import { QuestionCard } from '../../../entities/question'
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
    <Box mih="100vh">
      <QuizNav mode={mode} topic={topic} timeFormatted={timeFormatted} />

      <Flex align="flex-start" gap="lg" px={{ base: 'md', md: 'xl' }} py="lg" wrap="wrap">
        {!finished && (
          <QuizSidebar totalSteps={totalSteps} currentIndex={currentIndex} stepStatuses={stepStatuses} />
        )}

        <Box flex={1} miw={280}>
          {loading && <Skeleton height={420} radius="lg" />}
          {error && <Text c="danger">{error}</Text>}

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
        </Box>
      </Flex>
    </Box>
  )
}
