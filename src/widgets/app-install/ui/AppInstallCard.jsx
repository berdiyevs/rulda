import { Paper, Group, Stack, Text, Title, CloseButton } from '@mantine/core'
import { IconDeviceMobile } from '@tabler/icons-react'
import { Button } from '../../../shared/ui/Button/Button'
import { useAttempts } from '../../../entities/quiz-attempt'
import { useInstallPrompt } from '../../../shared/lib/pwaInstall'

const MIN_FINISHED_TESTS = 2

// "Rulda'ni telefoningizga o'rnating": kamida 2 ta test tugatgandan keyin, bir marta.
export function AppInstallCard() {
  const { attempts } = useAttempts()
  const { kind, install, dismiss } = useInstallPrompt()

  const finishedTests = attempts.filter((a) => (a.correctCount || 0) + (a.wrongCount || 0) > 0).length
  if (!kind || finishedTests < MIN_FINISHED_TESTS) return null

  return (
    <Paper className="glass-card" p="md">
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap" align="flex-start">
          <Group gap={10} wrap="nowrap" align="flex-start">
            <IconDeviceMobile size={22} color="var(--mantine-color-brand-6)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <Title order={3} fz="1rem">
                Rulda'ni telefoningizga o'rnating
              </Title>
              <Text c="dimmed" fz="sm">
                {kind === 'android'
                  ? 'Bosh ekrandan bir bosishda oching: ilova kabi ishlaydi.'
                  : "Safari'da pastdagi «Ulashish» tugmasini bosing, so'ng «Bosh ekranga qo'shish» ni tanlang."}
              </Text>
            </div>
          </Group>
          <CloseButton aria-label="Yopish" onClick={dismiss} />
        </Group>

        {kind === 'android' ? (
          <Button variant="primary" size="sm" onClick={install}>
            O'rnatish
          </Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={dismiss}>
            Tushunarli
          </Button>
        )}
      </Stack>
    </Paper>
  )
}
