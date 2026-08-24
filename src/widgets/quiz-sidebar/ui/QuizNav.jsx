import { useNavigate } from 'react-router-dom'
import { Box, Group, Text, Badge, Button, Modal, Stack } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconClock, IconDoorExit } from '@tabler/icons-react'
import { ROUTES } from '../../../shared/config/routes'
import { exitFullscreen } from '../../../shared/lib/fullscreen'

const TOPIC_LABELS = {
  all: 'Barcha savollar',
  signs: "Yo'l belgilari",
  theory: 'Nazariy savollar',
}

export function QuizNav({ mode, topic, ticketId, timeFormatted, showTimer, currentIndex, totalSteps }) {
  const navigate = useNavigate()
  const [confirmOpen, { open: openConfirm, close: closeConfirm }] = useDisclosure(false)

  const handleQuit = () => {
    exitFullscreen()
    navigate(ROUTES.CATEGORIES)
  }

  const hasProgress = Number.isInteger(currentIndex) && totalSteps > 0
  const stepNumber = hasProgress ? Math.min(currentIndex + 1, totalSteps) : 0
  const progressPercent = hasProgress ? Math.round((currentIndex / totalSteps) * 100) : 0

  return (
    <>
      <Box
        component="nav"
        h={64}
        px={24}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          background: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <Text ff="Manrope, Inter, sans-serif" fz={19} fw={800}>
          Rul
          <Text
            component="span"
            variant="gradient"
            gradient={{ from: 'brand.6', to: 'accent.5', deg: 135 }}
            inherit
            fw={800}
          >
            da
          </Text>
        </Text>

        <Text c="dimmed" fz="0.82rem" tt="uppercase" fw={600} style={{ letterSpacing: '0.06em' }} visibleFrom="sm">
          {mode === 'ticket'
            ? `Bilet ${ticketId} · Imtihon formati`
            : mode === 'mistakes'
              ? 'Xatolarim ustida ishlash'
              : `${mode === 'exam' ? 'Imtihon rejimi' : "Mashg'ulot"} · ${TOPIC_LABELS[topic] || topic}`}
        </Text>

        {hasProgress && (
          <Box
            visibleFrom="xs"
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <Text fz="0.92rem" fw={800} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {stepNumber} / {totalSteps}
            </Text>
            <Text fz="0.66rem" c="dimmed" fw={600}>
              {progressPercent}% bajarildi
            </Text>
          </Box>
        )}

        <Group ml="auto" gap={10}>
          {showTimer && (
            <Badge
              size="lg"
              radius="xl"
              variant="light"
              color="brand"
              leftSection={<IconClock size={14} />}
              styles={{ label: { fontVariantNumeric: 'tabular-nums' } }}
            >
              {timeFormatted}
            </Badge>
          )}

          <Button
            variant="light"
            color="danger"
            size="xs"
            radius="xl"
            leftSection={<IconDoorExit size={15} />}
            onClick={openConfirm}
          >
            Tugatish
          </Button>
        </Group>
      </Box>

      <Modal opened={confirmOpen} onClose={closeConfirm} title="Testni tugatish" centered size={400}>
        <Stack gap="lg">
          <Text c="dimmed" size="sm">
            Testni tark etmoqchimisiz? Joriy urinish saqlanmaydi.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="subtle" color="gray" onClick={closeConfirm}>
              Bekor qilish
            </Button>
            <Button variant="filled" color="danger" onClick={handleQuit}>
              Ha, tugatish
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
