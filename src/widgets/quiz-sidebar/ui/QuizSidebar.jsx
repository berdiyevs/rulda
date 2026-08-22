import { Box, SimpleGrid, Stack, Group, Text, RingProgress, Center } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'

function StepBox({ index, isCurrent, status }) {
  const label = index + 1 < 10 ? `0${index + 1}` : `${index + 1}`

  let colors = { bg: 'var(--mantine-color-dark-6)', border: 'var(--mantine-color-dark-4)', text: 'var(--mantine-color-dark-2)' }
  if (isCurrent) {
    colors = { bg: 'var(--mantine-color-dark-6)', border: 'var(--mantine-color-brand-6)', text: 'var(--mantine-color-white)' }
  }
  if (status === 'completed') {
    colors = { bg: 'var(--mantine-color-success-light)', border: 'var(--mantine-color-success-6)', text: 'var(--mantine-color-success-6)' }
  }
  if (status === 'wrong') {
    colors = { bg: 'var(--mantine-color-danger-light)', border: 'var(--mantine-color-danger-6)', text: 'var(--mantine-color-danger-6)' }
  }

  return (
    <Center
      style={{
        aspectRatio: '1',
        borderRadius: 'var(--mantine-radius-sm)',
        fontSize: 12,
        fontWeight: 700,
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        boxShadow: isCurrent ? '0 0 0 3px var(--mantine-color-brand-light)' : 'none',
      }}
    >
      {label}
    </Center>
  )
}

function useQuizProgress({ totalSteps, stepStatuses }) {
  const correctCount = stepStatuses.filter((s) => s === 'completed').length
  const wrongCount = stepStatuses.filter((s) => s === 'wrong').length
  const answeredCount = correctCount + wrongCount
  const progressPercent = totalSteps ? Math.round((answeredCount / totalSteps) * 100) : 0
  return { correctCount, wrongCount, progressPercent }
}

function LiveStats({ correctCount, wrongCount }) {
  return (
    <Group gap="lg">
      <Group gap={8}>
        <Box w={8} h={8} style={{ borderRadius: '50%', background: 'var(--mantine-color-success-6)' }} />
        <Text size="sm" c="dimmed">
          To'g'ri: {correctCount}
        </Text>
      </Group>
      <Group gap={8}>
        <Box w={8} h={8} style={{ borderRadius: '50%', background: 'var(--mantine-color-danger-6)' }} />
        <Text size="sm" c="dimmed">
          Xato: {wrongCount}
        </Text>
      </Group>
    </Group>
  )
}

export function QuizSidebar({ totalSteps, currentIndex, stepStatuses }) {
  const { correctCount, wrongCount, progressPercent } = useQuizProgress({ totalSteps, stepStatuses })
  const isMobile = useMediaQuery('(max-width: 800px)')

  if (isMobile) {
    return (
      <Box
        px={20}
        py={12}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          background: 'var(--mantine-color-dark-7)',
          borderBottom: '1px solid var(--mantine-color-dark-4)',
        }}
      >
        <RingProgress
          size={48}
          thickness={4}
          roundCaps
          sections={[{ value: progressPercent, color: 'brand' }]}
          label={
            <Text size={10} fw={700} ta="center">
              {progressPercent}%
            </Text>
          }
        />
        <LiveStats correctCount={correctCount} wrongCount={wrongCount} />
      </Box>
    )
  }

  return (
    <Stack
      component="aside"
      gap={24}
      w={260}
      style={{
        flexShrink: 0,
        height: 'calc(100vh - 64px)',
        overflowY: 'auto',
        background: 'var(--mantine-color-dark-7)',
        borderRight: '1px solid var(--mantine-color-dark-4)',
      }}
      p={22}
    >
      <SimpleGrid cols={4} spacing={10}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <StepBox key={i} index={i} isCurrent={i === currentIndex} status={stepStatuses[i]} />
        ))}
      </SimpleGrid>

      <Box
        mt="auto"
        p={16}
        style={{
          background: 'var(--mantine-color-dark-6)',
          border: '1px solid var(--mantine-color-dark-4)',
          borderRadius: 'var(--mantine-radius-md)',
        }}
      >
        <Text c="dimmed" fz="0.72rem" tt="uppercase" fw={700} mb={10} style={{ letterSpacing: '0.08em' }}>
          Jarayon
        </Text>
        <Center>
          <RingProgress
            size={110}
            thickness={9}
            roundCaps
            sections={[{ value: progressPercent, color: 'brand' }]}
            label={
              <Text size={18} fw={700} ta="center">
                {progressPercent}%
              </Text>
            }
          />
        </Center>
      </Box>

      <LiveStats correctCount={correctCount} wrongCount={wrongCount} />
    </Stack>
  )
}
