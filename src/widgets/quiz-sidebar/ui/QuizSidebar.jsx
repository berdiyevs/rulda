import { Box, SimpleGrid, Stack, Group, Text, RingProgress, Center } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconCheck, IconX } from '@tabler/icons-react'

function StepBox({ index, isCurrent, status }) {
  const label = index + 1 < 10 ? `0${index + 1}` : `${index + 1}`

  let colors = { bg: 'var(--bg-card-hover)', border: 'var(--border-strong)', text: 'var(--text-secondary)' }
  if (isCurrent) {
    colors = { bg: 'var(--primary-soft)', border: 'var(--mantine-color-brand-6)', text: 'var(--text-primary)' }
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
        gap: 3,
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
      {status === 'completed' && <IconCheck size={11} stroke={3} />}
      {status === 'wrong' && <IconX size={11} stroke={3} />}
    </Center>
  )
}

function useQuizProgress({ totalSteps, stepStatuses }) {
  const correctCount = stepStatuses.filter((s) => s === 'completed').length
  const wrongCount = stepStatuses.filter((s) => s === 'wrong').length
  const answeredCount = correctCount + wrongCount
  const progressPercent = totalSteps ? Math.round((answeredCount / totalSteps) * 100) : 0
  return { correctCount, wrongCount, answeredCount, progressPercent }
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

const LEGEND_ITEMS = [
  { color: 'var(--mantine-color-success-6)', label: "To'g'ri javob" },
  { color: 'var(--mantine-color-danger-6)', label: "Noto'g'ri javob" },
  { color: 'var(--mantine-color-brand-6)', label: 'Joriy savol' },
  { color: 'var(--text-muted)', label: 'Javob berilmagan' },
]

function Legend() {
  return (
    <Stack gap={7}>
      {LEGEND_ITEMS.map((item) => (
        <Group key={item.label} gap={7} wrap="nowrap">
          <Box w={7} h={7} style={{ borderRadius: '50%', background: item.color, flexShrink: 0 }} />
          <Text fz="0.72rem" c="dimmed">
            {item.label}
          </Text>
        </Group>
      ))}
    </Stack>
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
          background: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border)',
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
      gap={18}
      w={260}
      style={{
        flexShrink: 0,
        height: '100%',
        overflowY: 'auto',
        background: 'var(--bg-elevated)',
        borderRight: '1px solid var(--border)',
      }}
      p={22}
    >
      <Text c="dimmed" fz="0.72rem" tt="uppercase" fw={700} style={{ letterSpacing: '0.08em' }}>
        Savollar
      </Text>

      <SimpleGrid cols={4} spacing={10}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <StepBox key={i} index={i} isCurrent={i === currentIndex} status={stepStatuses[i]} />
        ))}
      </SimpleGrid>

      <Legend />
    </Stack>
  )
}
