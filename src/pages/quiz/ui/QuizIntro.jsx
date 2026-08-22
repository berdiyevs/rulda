import { Link } from 'react-router-dom'
import { Paper, Stack, Title, Text, List, ThemeIcon, Group, Center } from '@mantine/core'
import { IconCircleCheck, IconClock, IconAlertTriangle, IconDeviceFloppy } from '@tabler/icons-react'
import { Button } from '../../../shared/ui/Button/Button'
import { Badge } from '../../../shared/ui/Badge/Badge'
import { ROUTES } from '../../../shared/config/routes'

const TOPIC_INFO = {
  all: { title: 'Barcha savollar', desc: '600+ savol bazasidan tasodifiy 20 tasi tanlanadi.' },
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

export function QuizIntro({ topic, mode, ticketId, onStart }) {
  const isTicket = mode === 'ticket'
  const info = isTicket
    ? { title: `Bilet ${ticketId}`, desc: 'Rasmiy imtihon formatidagi 10 ta savoldan iborat aniq to\'plam.' }
    : TOPIC_INFO[topic] || TOPIC_INFO.all
  const isExam = mode === 'exam'

  return (
    <Center mih="100vh" py="xl">
      <Paper className="glass-card slide-up" p="xl" maw={460} w="100%">
        <Stack gap="md">
          <Badge variant="primary">{isTicket ? 'Bilet' : isExam ? 'Imtihon rejimi' : "Mashg'ulot"}</Badge>
          <Title order={2}>{info.title}</Title>
          <Text c="dimmed">{info.desc}</Text>

          <Stack gap="sm" className="glass-card" p="md">
            <List spacing="sm" size="sm" center icon={<RuleIcon color="brand" icon={IconCircleCheck} />}>
              <List.Item>{isTicket ? '10' : isExam ? '20' : 'Bir nechta'} savol</List.Item>
              {isExam && (
                <>
                  <List.Item icon={<RuleIcon color="brand" icon={IconClock} />}>20 daqiqa vaqt</List.Item>
                  <List.Item icon={<RuleIcon color="warning" icon={IconAlertTriangle} />}>
                    Maksimal 2 ta xatoga ruxsat
                  </List.Item>
                </>
              )}
              <List.Item icon={<RuleIcon color="success" icon={IconDeviceFloppy} />}>
                Natija profilingizga saqlanadi
              </List.Item>
            </List>
          </Stack>

          <Group grow mt="sm">
            <Button variant="secondary" as={Link} to={ROUTES.CATEGORIES}>
              Orqaga
            </Button>
            <Button variant="primary" size="lg" onClick={onStart}>
              Boshlash
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Center>
  )
}
