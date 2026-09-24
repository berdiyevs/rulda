import { useState } from 'react'
import { Paper, Stack, Group, Text, TextInput } from '@mantine/core'
import { IconCalendarEvent, IconEdit } from '@tabler/icons-react'
import { Button } from '../../../shared/ui/Button/Button'
import { useAuth, updateExamDate } from '../../../entities/user'

function daysUntil(dateStr) {
  const target = new Date(`${dateStr}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((target - today) / 86400000)
}

// "2026-12-25" -> "25.12.2026"
function isoToDisplay(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

// Faqat raqamlarni qoldirib, "kk.oo.yyyy" ko'rinishiga keltiradi.
function maskDate(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean)
  return parts.join('.')
}

// "25.12.2026" -> "2026-12-25"; sana noto'g'ri bo'lsa null.
function displayToIso(display) {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(display)
  if (!match) return null
  const [, dd, mm, yyyy] = match
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
  const isReal =
    date.getFullYear() === Number(yyyy) && date.getMonth() === Number(mm) - 1 && date.getDate() === Number(dd)
  return isReal ? `${yyyy}-${mm}-${dd}` : null
}

export function ExamCountdownCard() {
  const { user, profile, refreshProfile } = useAuth()
  const examDate = profile?.examDate
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(isoToDisplay(examDate))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!user) return
    const iso = displayToIso(value)
    if (!iso) {
      setError("Sanani kun.oy.yil ko'rinishida to'g'ri kiriting, masalan: 25.12.2026")
      return
    }
    setError('')
    setSaving(true)
    try {
      await updateExamDate(iso)
      await refreshProfile()
      setEditing(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!examDate || editing) {
    return (
      <Paper className="glass-card" p="lg">
        <Stack gap="sm">
          <Group gap={8}>
            <IconCalendarEvent size={18} color="var(--mantine-color-brand-6)" />
            <Text fw={700}>Imtihon sanangizni belgilang</Text>
          </Group>
          <Text c="dimmed" fz="sm">
            Necha kun qolganini ko'rish uchun imtihon sanasini kiriting.
          </Text>
          <Group gap="sm" wrap="wrap">
            <TextInput
              value={value}
              onChange={(e) => {
                setValue(maskDate(e.target.value))
                setError('')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
              }}
              placeholder="kk.oo.yyyy"
              inputMode="numeric"
              aria-label="Imtihon sanasi"
              error={error || undefined}
              style={{ flex: 1, minWidth: 160 }}
            />
            <Button variant="primary" onClick={handleSave} loading={saving}>
              Saqlash
            </Button>
            {editing && (
              <Button
                variant="secondary"
                onClick={() => {
                  setEditing(false)
                  setError('')
                }}
              >
                Bekor qilish
              </Button>
            )}
          </Group>
        </Stack>
      </Paper>
    )
  }

  const days = daysUntil(examDate)
  const isPast = days < 0

  return (
    <Paper className="glass-card" p="lg">
      <Group justify="space-between" align="center" wrap="wrap" gap="md">
        <Group gap={12}>
          <IconCalendarEvent size={22} color="var(--mantine-color-brand-6)" />
          <div>
            <Text fw={800} fz="1.3rem">
              {isPast ? "Imtihon sanasi o'tib ketdi" : days === 0 ? 'Imtihon bugun!' : `${days} kun qoldi`}
            </Text>
            <Text c="dimmed" fz="sm">
              Imtihon sanasi: {isoToDisplay(examDate)}
            </Text>
          </div>
        </Group>
        <Button
          variant="secondary"
          size="xs"
          leftSection={<IconEdit size={14} />}
          onClick={() => {
            setValue(isoToDisplay(examDate))
            setEditing(true)
          }}
        >
          O'zgartirish
        </Button>
      </Group>
    </Paper>
  )
}
