import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal, Stack, Title, Text, List, ThemeIcon, Group, SegmentedControl, NumberInput, Center, Box } from '@mantine/core'
import {
  IconCircleCheck,
  IconClock,
  IconAlertTriangle,
  IconDeviceFloppy,
  IconInfinity,
  IconRefresh,
  IconCertificate,
  IconMaximize,
} from '@tabler/icons-react'
import { Button } from '../../../shared/ui/Button/Button'
import { Badge } from '../../../shared/ui/Badge/Badge'
import { requestFullscreen } from '../../../shared/lib/fullscreen'

const TOPIC_INFO = {
  all: { title: 'Barcha savollar', desc: '1200+ savol bazasidan tasodifiy savollar tanlanadi.' },
  signs: { title: "Yo'l belgilari", desc: "Rasm asosidagi savollar bo'yicha mashq." },
  theory: { title: 'Nazariy savollar', desc: 'Faqat matnli, nazariy savollar.' },
}

function RuleIcon({ color, icon: Icon }) {
  return (
    <ThemeIcon color={color} variant="light" size={22} radius="xl">
      <Icon size={14} />
    </ThemeIcon>
  )
}

function QuizStartModalBody({ config, onClose }) {
  const navigate = useNavigate()
  const isTicket = Boolean(config.ticketId)
  const isMistakes = !isTicket && config.mode === 'mistakes'
  const mistakeCount = config.questionIds?.length ?? 0

  const [mode, setMode] = useState(isTicket ? 'ticket' : isMistakes ? 'mistakes' : config.mode || 'practice')
  const [questionCount, setQuestionCount] = useState(20)
  const [durationMinutes, setDurationMinutes] = useState(0)

  const isExam = mode === 'exam'
  const isPractice = mode === 'practice'
  const isLockedExam = !isTicket && !isMistakes && config.mode === 'exam'

  const info = isTicket
    ? { title: `Bilet ${config.ticketId}`, desc: "Rasmiy imtihon formatidagi 20 ta savoldan iborat aniq to'plam." }
    : isMistakes
      ? {
          title: 'Xatolarim ustida ishlash',
          desc: `Oldingi urinishlaringizda xato qilingan ${mistakeCount} ta savol bo'yicha maxsus mashq.`,
        }
      : TOPIC_INFO[config.topic] || TOPIC_INFO.all

  const handleStart = () => {
    const params = new URLSearchParams()
    if (isTicket) {
      params.set('ticket', String(config.ticketId))
    } else if (isMistakes) {
      params.set('mode', 'mistakes')
      params.set('ids', (config.questionIds || []).join(','))
    } else {
      params.set('topic', config.topic || 'all')
      if (isExam) {
        params.set('mode', 'exam')
      } else {
        params.set('count', String(questionCount))
        params.set('duration', String(durationMinutes))
      }
    }
    if (isExam) requestFullscreen()
    onClose()
    navigate(`/quiz?${params.toString()}`)
  }

  if (isLockedExam) {
    return (
      <Stack gap="md">
        <Center>
          <ThemeIcon
            size={64}
            radius="xl"
            variant="gradient"
            gradient={{ from: 'warning.6', to: 'danger.5', deg: 135 }}
          >
            <IconCertificate size={32} />
          </ThemeIcon>
        </Center>

        <Stack gap={6} ta="center">
          <Badge variant="warning">Qat'iy imtihon rejimi</Badge>
          <Title order={2}>Rasmiy imtihonga tayyormisiz?</Title>
          <Text c="dimmed" size="sm">
            Bu yerda faqat rasmiy DAN imtihon formati mavjud — vaqt va xatolar soni real imtihondagidek
            qat'iy nazorat qilinadi.
          </Text>
        </Stack>

        <Box
          p="md"
          style={{
            borderRadius: 'var(--r-md)',
            border: '1px solid var(--mantine-color-warning-light)',
            background: 'var(--mantine-color-warning-light)',
          }}
        >
          <List spacing={10} size="sm" center icon={<RuleIcon color="brand" icon={IconCircleCheck} />}>
            <List.Item>20 ta tasodifiy savol</List.Item>
            <List.Item icon={<RuleIcon color="brand" icon={IconClock} />}>25 daqiqa vaqt</List.Item>
            <List.Item icon={<RuleIcon color="danger" icon={IconAlertTriangle} />}>
              3-xato qilinishi bilan test darhol tugaydi (2 tagacha xatoga ruxsat)
            </List.Item>
            <List.Item icon={<RuleIcon color="brand" icon={IconMaximize} />}>
              To'liq ekran rejimida boshlanadi
            </List.Item>
            <List.Item icon={<RuleIcon color="success" icon={IconDeviceFloppy} />}>
              Natija profilingizga saqlanadi
            </List.Item>
          </List>
        </Box>

        <Group grow mt="sm">
          <Button variant="secondary" onClick={onClose}>
            Orqaga
          </Button>
          <Button variant="danger" size="lg" onClick={handleStart}>
            Imtihonni boshlash
          </Button>
        </Group>
      </Stack>
    )
  }

  return (
    <Stack gap="md">
      <Badge variant="primary">
        {isTicket ? 'Bilet' : isMistakes ? 'Xatolar' : isExam ? 'Imtihon rejimi' : "Erkin mashg'ulot"}
      </Badge>
      <Title order={2}>{info.title}</Title>
      <Text c="dimmed">{info.desc}</Text>

      {!isTicket && !isMistakes && (
        <SegmentedControl
          fullWidth
          value={mode}
          onChange={setMode}
          data={[
            { label: "Erkin mashg'ulot", value: 'practice' },
            { label: 'Rasmiy imtihon', value: 'exam' },
          ]}
        />
      )}

      {isPractice && (
        <Stack gap="sm" className="glass-card" p="md">
          <NumberInput
            label="Nechta savol"
            value={questionCount}
            onChange={(v) => setQuestionCount(Number(v) || 5)}
            min={5}
            max={100}
            step={5}
            clampBehavior="strict"
          />
          <div>
            <Text fz="sm" fw={500} mb={6}>
              Vaqt chegarasi
            </Text>
            <SegmentedControl
              fullWidth
              value={String(durationMinutes)}
              onChange={(v) => setDurationMinutes(Number(v))}
              data={[
                { label: 'Vaqtsiz', value: '0' },
                { label: '15 daq', value: '15' },
                { label: '30 daq', value: '30' },
                { label: '45 daq', value: '45' },
              ]}
            />
          </div>
        </Stack>
      )}

      <Stack gap="sm" className="glass-card" p="md">
        <List spacing="sm" size="sm" center icon={<RuleIcon color="brand" icon={IconCircleCheck} />}>
          <List.Item>{isTicket || isExam ? '20' : isMistakes ? mistakeCount : questionCount} savol</List.Item>
          {isExam && (
            <>
              <List.Item icon={<RuleIcon color="brand" icon={IconClock} />}>25 daqiqa vaqt</List.Item>
              <List.Item icon={<RuleIcon color="warning" icon={IconAlertTriangle} />}>
                3-xato qilinishi bilan test darhol tugaydi (2 tagacha xatoga ruxsat)
              </List.Item>
            </>
          )}
          {isMistakes && (
            <List.Item icon={<RuleIcon color="brand" icon={IconRefresh} />}>
              To'g'ri javob bersangiz, savol xatolar ro'yxatidan chiqadi
            </List.Item>
          )}
          {isPractice && durationMinutes > 0 && (
            <List.Item icon={<RuleIcon color="brand" icon={IconClock} />}>{durationMinutes} daqiqa vaqt</List.Item>
          )}
          {!isExam && !isTicket && !(isPractice && durationMinutes > 0) && (
            <List.Item icon={<RuleIcon color="success" icon={IconInfinity} />}>
              {isPractice ? 'Xatolar soni cheklanmagan' : 'Vaqt va xatolar soni cheklanmagan'}
            </List.Item>
          )}
          <List.Item icon={<RuleIcon color="success" icon={IconDeviceFloppy} />}>
            Natija profilingizga saqlanadi
          </List.Item>
        </List>
      </Stack>

      <Group grow mt="sm">
        <Button variant="secondary" onClick={onClose}>
          Orqaga
        </Button>
        <Button variant="primary" size="lg" onClick={handleStart}>
          Boshlash
        </Button>
      </Group>
    </Stack>
  )
}

export function QuizStartModal({ config, onClose }) {
  return (
    <Modal
      opened={Boolean(config)}
      onClose={onClose}
      centered
      size={460}
      radius="lg"
      withCloseButton={false}
      overlayProps={{ blur: 6, backgroundOpacity: 0.6 }}
    >
      {config && <QuizStartModalBody config={config} onClose={onClose} />}
    </Modal>
  )
}
