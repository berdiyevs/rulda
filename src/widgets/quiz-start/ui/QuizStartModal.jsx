import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Modal, Stack, Title, Text, List, ThemeIcon, Group, SegmentedControl, Menu, Center, Box } from '@mantine/core'
import {
  IconCircleCheck,
  IconClock,
  IconAlertTriangle,
  IconDeviceFloppy,
  IconRefresh,
  IconCertificate,
  IconMaximize,
  IconChevronDown,
  IconLock,
} from '@tabler/icons-react'
import { Button } from '../../../shared/ui/Button/Button'
import { Badge } from '../../../shared/ui/Badge/Badge'
import { requestFullscreen } from '../../../shared/lib/fullscreen'
import { isTicketLocked } from '../../../shared/lib/premium'
import { useAuth } from '../../../entities/user'
import { ROUTES } from '../../../shared/config/routes'

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

function DropdownField({ label, value, options, onSelect }) {
  const current = options.find((o) => o.value === value)
  return (
    <div>
      <Text fz="sm" fw={500} mb={6}>
        {label}
      </Text>
      <Menu shadow="md" width={170} radius="md" position="bottom-start">
        <Menu.Target>
          <Button variant="secondary" fullWidth rightSection={<IconChevronDown size={14} />}>
            {current?.label}
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          {options.map((opt) => (
            <Menu.Item
              key={String(opt.value)}
              fw={opt.value === value ? 700 : 400}
              c={opt.value === value ? 'brand' : undefined}
              onClick={() => onSelect(opt.value)}
            >
              {opt.label}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    </div>
  )
}

function QuizStartModalBody({ config, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isPremiumActive } = useAuth()
  const isTicket = Boolean(config.ticketId)
  const isMistakes = !isTicket && config.mode === 'mistakes'
  const mistakeCount = config.questionIds?.length ?? 0

  const mode = isTicket ? 'ticket' : isMistakes ? 'mistakes' : config.mode || 'practice'
  const [practiceMode, setPracticeMode] = useState('strict')
  const [questionCount, setQuestionCount] = useState(20)
  const [durationMinutes, setDurationMinutes] = useState(0)
  const [maxMistakes, setMaxMistakes] = useState(null)
  const [feedbackMode, setFeedbackMode] = useState('instant')

  const isExam = mode === 'exam'
  const isLockedExam = !isTicket && !isMistakes && config.mode === 'exam'
  const isStrict = practiceMode === 'strict'
  const isCustom = practiceMode === 'custom'

  const ticketLocked = isTicket && isTicketLocked(config.ticketId, isPremiumActive)
  const premiumRequired =
    !isPremiumActive &&
    (isExam || isMistakes || ticketLocked || (!isTicket && !isMistakes && isStrict))

  const info = isTicket
    ? {
        title: `Bilet ${config.ticketId}`,
        desc: "Rasmiy imtihon formatidagi 20 ta savoldan iborat aniq to'plam — 25 daqiqa vaqt beriladi.",
      }
    : isMistakes
      ? {
          title: 'Xatolarim ustida ishlash',
          desc: `Oldingi urinishlaringizda xato qilingan ${mistakeCount} ta savol bo'yicha maxsus mashq.`,
        }
      : TOPIC_INFO[config.topic] || TOPIC_INFO.all

  const handleStart = () => {
    if (premiumRequired) {
      onClose()
      navigate(ROUTES.PREMIUM)
      return
    }

    const params = new URLSearchParams()
    if (isTicket) {
      params.set('ticket', String(config.ticketId))
      params.set('duration', '25')
      params.set('errors', maxMistakes == null ? '' : String(maxMistakes))
      params.set('feedback', feedbackMode)
    } else if (isMistakes) {
      params.set('mode', 'mistakes')
      params.set('ids', (config.questionIds || []).join(','))
    } else {
      params.set('topic', config.topic || 'all')
      if (isExam) {
        params.set('mode', 'exam')
      } else {
        params.set('mode', 'practice')
        if (isStrict) {
          params.set('count', '20')
          params.set('duration', '25')
          params.set('errors', '2')
          params.set('feedback', 'instant')
        } else {
          params.set('count', String(questionCount))
          params.set('duration', String(durationMinutes))
          params.set('errors', maxMistakes == null ? '' : String(maxMistakes))
          params.set('feedback', feedbackMode)
        }
      }
    }
    if (isExam) requestFullscreen()
    onClose()
    navigate(`/quiz?${params.toString()}`, { state: { from: location.pathname } })
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
          <Badge variant="warning">{premiumRequired ? 'Premium' : "Qat'iy imtihon rejimi"}</Badge>
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
          <Button
            variant="danger"
            size="lg"
            leftSection={premiumRequired ? <IconLock size={16} /> : null}
            onClick={handleStart}
          >
            {premiumRequired ? 'Premium kerak' : 'Boshlash'}
          </Button>
        </Group>
      </Stack>
    )
  }

  return (
    <Stack gap="sm">
      <Badge variant="primary">
        {isTicket ? 'Bilet' : isMistakes ? 'Xatolar' : isStrict ? "Qat'iy rejim" : 'Kengaytirilgan rejim'}
      </Badge>
      <Title order={2} fz="1.35rem">
        {info.title}
      </Title>
      <Text c="dimmed" fz="sm">
        {info.desc}
      </Text>

      {premiumRequired && (
        <Group gap={6} justify="center">
          <IconLock size={14} color="var(--mantine-color-warning-6)" />
          <Text c="warning" fz="xs" fw={600}>
            Bu funksiya faqat Premium foydalanuvchilar uchun
          </Text>
        </Group>
      )}

      {!isTicket && !isMistakes && (
        <SegmentedControl
          fullWidth
          value={practiceMode}
          onChange={setPracticeMode}
          data={[
            { label: "Qat'iy rejim", value: 'strict' },
            { label: 'Kengaytirilgan rejim', value: 'custom' },
          ]}
        />
      )}

      {!isTicket && !isMistakes && isCustom && (
        <Stack gap="sm" className="glass-card" p="sm">
          <Group grow>
            <DropdownField
              label="Nechta savol"
              value={questionCount}
              onSelect={setQuestionCount}
              options={[10, 20, 30, 50, 100].map((n) => ({ value: n, label: `${n} ta savol` }))}
            />
            <DropdownField
              label="Vaqt chegarasi"
              value={durationMinutes}
              onSelect={setDurationMinutes}
              options={[
                { value: 0, label: 'Vaqtsiz' },
                ...[15, 30, 45, 60].map((m) => ({ value: m, label: `${m} daqiqa` })),
              ]}
            />
          </Group>

          <Group grow>
            <DropdownField
              label="Ruxsat etilgan xatolar"
              value={maxMistakes}
              onSelect={setMaxMistakes}
              options={[
                { value: null, label: 'Cheklanmagan' },
                { value: 0, label: '0 ta xato' },
                { value: 2, label: '2 ta xato' },
                { value: 5, label: '5 ta xato' },
              ]}
            />
            <DropdownField
              label="Javobni ko'rsatish"
              value={feedbackMode}
              onSelect={setFeedbackMode}
              options={[
                { value: 'instant', label: 'Darhol' },
                { value: 'end', label: 'Faqat oxirida' },
              ]}
            />
          </Group>
        </Stack>
      )}

      {isTicket && (
        <Stack gap="sm" className="glass-card" p="sm">
          <Group grow>
            <DropdownField
              label="Ruxsat etilgan xatolar"
              value={maxMistakes}
              onSelect={setMaxMistakes}
              options={[
                { value: null, label: 'Cheklanmagan' },
                { value: 0, label: '0 ta xato' },
                { value: 2, label: '2 ta xato' },
                { value: 5, label: '5 ta xato' },
              ]}
            />
            <DropdownField
              label="Javobni ko'rsatish"
              value={feedbackMode}
              onSelect={setFeedbackMode}
              options={[
                { value: 'instant', label: 'Darhol' },
                { value: 'end', label: 'Faqat oxirida' },
              ]}
            />
          </Group>
        </Stack>
      )}

      {(isCustom || isTicket) && !isMistakes ? (
        <Group gap={6} justify="center">
          <RuleIcon color="success" icon={IconDeviceFloppy} />
          <Text c="dimmed" fz="xs">
            Natija profilingizga saqlanadi
          </Text>
        </Group>
      ) : (
        <Stack gap="sm" className="glass-card" p="md">
          <List spacing="sm" size="sm" center icon={<RuleIcon color="brand" icon={IconCircleCheck} />}>
            <List.Item>{isTicket ? '20' : isMistakes ? mistakeCount : '20'} savol</List.Item>

            {!isTicket && !isMistakes && isStrict && (
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

            <List.Item icon={<RuleIcon color="success" icon={IconDeviceFloppy} />}>
              Natija profilingizga saqlanadi
            </List.Item>
          </List>
        </Stack>
      )}

      <Group grow mt="sm">
        <Button variant="secondary" onClick={onClose}>
          Orqaga
        </Button>
        <Button
          variant="primary"
          size="lg"
          leftSection={premiumRequired ? <IconLock size={16} /> : null}
          onClick={handleStart}
        >
          {premiumRequired ? 'Premium kerak' : 'Boshlash'}
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
