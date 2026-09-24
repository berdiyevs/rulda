import { useEffect, useRef } from 'react'
import { Box, SimpleGrid, Stack, Group, Text, Center, Drawer, UnstyledButton } from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { IconCheck, IconX, IconChevronUp } from '@tabler/icons-react'

function getStepColors(isCurrent, status) {
  let colors = { bg: 'var(--bg-card-hover)', border: 'var(--border-strong)', text: 'var(--text-secondary)' }
  if (isCurrent) {
    colors = { bg: 'var(--primary-soft)', border: 'var(--mantine-color-brand-6)', text: 'var(--text-primary)' }
  }
  if (status === 'answered') {
    colors = { bg: 'var(--bg-card-hover)', border: 'var(--text-muted)', text: 'var(--text-secondary)' }
  }
  if (status === 'completed') {
    colors = { bg: 'var(--mantine-color-success-light)', border: 'var(--mantine-color-success-6)', text: 'var(--mantine-color-success-6)' }
  }
  if (status === 'wrong') {
    colors = { bg: 'var(--mantine-color-danger-light)', border: 'var(--mantine-color-danger-6)', text: 'var(--mantine-color-danger-6)' }
  }
  return colors
}

function StepBox({ index, isCurrent, status }) {
  const label = index + 1 < 10 ? `0${index + 1}` : `${index + 1}`
  const colors = getStepColors(isCurrent, status)

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
      {status === 'answered' && (
        <Box w={5} h={5} style={{ borderRadius: '50%', background: 'var(--text-muted)' }} />
      )}
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

// Telefonda: bitta ixcham qator ("7 / 20" + scroll qilinadigan raqamlar). "7 / 20" bosilsa to'liq ro'yxat ochiladi.
function MobileSteps({ totalSteps, currentIndex, stepStatuses, correctCount, wrongCount }) {
  const [opened, { open, close }] = useDisclosure(false)
  const listRef = useRef(null)

  useEffect(() => {
    const list = listRef.current
    const chip = list?.children[currentIndex]
    if (!list || !chip) return
    list.scrollTo({ left: chip.offsetLeft - list.clientWidth / 2 + chip.clientWidth / 2, behavior: 'smooth' })
  }, [currentIndex])

  return (
    <>
      <Box
        w="100%"
        px={10}
        py={8}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)',
        }}
      >
        <UnstyledButton
          onClick={open}
          aria-label="Barcha savollar ro'yxatini ochish"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            flexShrink: 0,
            padding: '4px 10px',
            borderRadius: 'var(--r-full)',
            background: 'var(--primary-soft)',
            color: 'var(--text-primary)',
            fontWeight: 800,
            fontSize: 13,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {Math.min(currentIndex + 1, totalSteps)} / {totalSteps}
          <IconChevronUp size={14} />
        </UnstyledButton>

        <div
          ref={listRef}
          style={{ display: 'flex', gap: 6, overflowX: 'auto', flex: 1, scrollbarWidth: 'none', padding: '2px 0' }}
        >
          {Array.from({ length: totalSteps }, (_, i) => {
            const colors = getStepColors(i === currentIndex, stepStatuses[i])
            return (
              <Center
                key={i}
                style={{
                  flexShrink: 0,
                  width: 28,
                  height: 28,
                  borderRadius: 'var(--mantine-radius-sm)',
                  fontSize: 12,
                  fontWeight: 700,
                  background: colors.bg,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                }}
              >
                {i + 1}
              </Center>
            )
          })}
        </div>
      </Box>

      <Drawer opened={opened} onClose={close} position="bottom" size="auto" title="Savollar" radius="lg">
        <Stack gap="md" pb="md">
          <SimpleGrid cols={5} spacing={10}>
            {Array.from({ length: totalSteps }, (_, i) => (
              <StepBox key={i} index={i} isCurrent={i === currentIndex} status={stepStatuses[i]} />
            ))}
          </SimpleGrid>
          <LiveStats correctCount={correctCount} wrongCount={wrongCount} />
          <Legend />
        </Stack>
      </Drawer>
    </>
  )
}

export function QuizSidebar({ totalSteps, currentIndex, stepStatuses }) {
  const { correctCount, wrongCount, progressPercent } = useQuizProgress({ totalSteps, stepStatuses })
  const isMobile = useMediaQuery('(max-width: 800px)', false, { getInitialValueInEffect: false })

  if (isMobile) {
    return (
      <MobileSteps
        totalSteps={totalSteps}
        currentIndex={currentIndex}
        stepStatuses={stepStatuses}
        correctCount={correctCount}
        wrongCount={wrongCount}
      />
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
