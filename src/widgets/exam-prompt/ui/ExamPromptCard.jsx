import { useEffect, useRef, useState } from 'react'
import { Paper, Stack, Group, Title, Text, SimpleGrid, TextInput, CloseButton } from '@mantine/core'
import { IconCalendarEvent } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { Button } from '../../../shared/ui/Button/Button'
import { useAuth, updateExamDate } from '../../../entities/user'
import { track } from '../../../shared/lib/analytics'
import { addDaysFromToday, addMonthsFromToday, displayToIso, maskDate } from '../../../shared/lib/examDate'

const REASK_AFTER_MS = 7 * 24 * 60 * 60 * 1000

const QUICK_OPTIONS = [
  { label: '1 hafta ichida', getDate: () => addDaysFromToday(7) },
  { label: '2 hafta ichida', getDate: () => addDaysFromToday(14) },
  { label: '1 oy ichida', getDate: () => addMonthsFromToday(1) },
]

function storageKey(uid) {
  return `rulda_exam_prompt_${uid}`
}

function readState(uid) {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey(uid)) || '{}')
    return { shown: Number(parsed.shown) || 0, lastShownAt: Number(parsed.lastShownAt) || 0 }
  } catch {
    return { shown: 0, lastShownAt: 0 }
  }
}

function writeState(uid, state) {
  try {
    localStorage.setItem(storageKey(uid), JSON.stringify(state))
  } catch {
    // localStorage yopiq bo'lsa, karta har safar chiqishi mumkin, bu xavfli emas.
  }
}

// Birinchi testdan keyin imtihon sanasini so'raydi. Sana kiritilmasa, 7 kundan keyin bir marta qayta so'raydi.
export function ExamPromptCard() {
  const { user, profile, refreshProfile } = useAuth()
  const [visible, setVisible] = useState(false)
  const [exactMode, setExactMode] = useState(false)
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const decidedRef = useRef(false)

  const uid = user?.uid
  const hasExamDate = Boolean(profile?.examDate)

  useEffect(() => {
    if (!uid || !profile || hasExamDate || decidedRef.current) return
    decidedRef.current = true
    const state = readState(uid)
    const canShow = state.shown === 0 || (state.shown === 1 && Date.now() - state.lastShownAt >= REASK_AFTER_MS)
    if (!canShow) return
    writeState(uid, { shown: state.shown + 1, lastShownAt: Date.now() })
    setVisible(true)
  }, [uid, profile, hasExamDate])

  if (!visible || hasExamDate) return null

  const save = async (iso) => {
    setSaving(true)
    try {
      await updateExamDate(iso)
      await refreshProfile()
      track('exam_date_set')
      notifications.show({
        color: 'success',
        title: 'Imtihon sanasi saqlandi',
        message: "Asosiy sahifada tayyorgarlik rejangizni ko'rasiz.",
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const saveExact = () => {
    const iso = displayToIso(value)
    if (!iso) {
      setError("Sanani kun.oy.yil ko'rinishida to'g'ri kiriting, masalan: 25.12.2026")
      return
    }
    save(iso)
  }

  return (
    <Paper className="glass-card" p="md" w="100%" ta="left">
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap" align="flex-start">
          <Group gap={8} wrap="nowrap" align="flex-start">
            <IconCalendarEvent size={20} color="var(--mantine-color-brand-6)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <Title order={3} fz="1rem">
                Imtihoningiz qachon?
              </Title>
              <Text c="dimmed" fz="sm">
                Sizga tayyorgarlik rejasini tuzib beramiz
              </Text>
            </div>
          </Group>
          <CloseButton aria-label="Yopish" onClick={() => setVisible(false)} />
        </Group>

        {exactMode ? (
          <Stack gap="xs">
            <TextInput
              value={value}
              onChange={(e) => {
                setValue(maskDate(e.target.value))
                setError('')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveExact()
              }}
              placeholder="kk.oo.yyyy"
              inputMode="numeric"
              aria-label="Imtihon sanasi"
              error={error || undefined}
            />
            <Group gap="xs" grow>
              <Button variant="secondary" size="sm" onClick={() => setExactMode(false)}>
                Orqaga
              </Button>
              <Button variant="primary" size="sm" onClick={saveExact} loading={saving}>
                Saqlash
              </Button>
            </Group>
          </Stack>
        ) : (
          <>
            <SimpleGrid cols={{ base: 1, xs: 3 }} spacing="xs">
              {QUICK_OPTIONS.map((option) => (
                <Button
                  key={option.label}
                  variant="secondary"
                  size="sm"
                  disabled={saving}
                  onClick={() => save(option.getDate())}
                >
                  {option.label}
                </Button>
              ))}
            </SimpleGrid>
            <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="xs">
              <Button variant="outline" size="sm" onClick={() => setExactMode(true)}>
                Aniq sanani tanlash
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setVisible(false)}>
                Hali bilmayman
              </Button>
            </SimpleGrid>
            {error && (
              <Text c="danger" fz="xs">
                {error}
              </Text>
            )}
          </>
        )}
      </Stack>
    </Paper>
  )
}
