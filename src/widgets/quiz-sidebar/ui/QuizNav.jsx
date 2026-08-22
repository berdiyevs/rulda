import { useNavigate } from 'react-router-dom'
import { Box, Group, Text, Badge, Button, Modal, Stack } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconClock, IconDoorExit } from '@tabler/icons-react'
import { ROUTES } from '../../../shared/config/routes'

const TOPIC_LABELS = {
  all: 'Barcha savollar',
  signs: "Yo'l belgilari",
  theory: 'Nazariy savollar',
}

export function QuizNav({ mode, topic, ticketId, timeFormatted }) {
  const navigate = useNavigate()
  const [confirmOpen, { open: openConfirm, close: closeConfirm }] = useDisclosure(false)

  const handleQuit = () => {
    navigate(ROUTES.CATEGORIES)
  }

  return (
    <>
      <Box
        component="nav"
        h={64}
        px={24}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          background: 'var(--mantine-color-dark-7)',
          borderBottom: '1px solid var(--mantine-color-dark-4)',
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

        <Text c="dimmed" fz="0.82rem" tt="uppercase" fw={600} style={{ letterSpacing: '0.06em' }}>
          {mode === 'ticket'
            ? `Bilet ${ticketId} · Imtihon formati`
            : `${mode === 'exam' ? 'Imtihon rejimi' : "Mashg'ulot"} · ${TOPIC_LABELS[topic] || topic}`}
        </Text>

        <Group ml="auto" gap={10}>
          {mode === 'exam' && (
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
