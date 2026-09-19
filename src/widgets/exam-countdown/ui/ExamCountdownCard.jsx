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

export function ExamCountdownCard() {
  const { user, profile, refreshProfile } = useAuth()
  const examDate = profile?.examDate
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(examDate || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!value || !user) return
    setSaving(true)
    try {
      await updateExamDate(value)
      await refreshProfile()
      setEditing(false)
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
              type="date"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              style={{ flex: 1, minWidth: 160 }}
            />
            <Button variant="primary" onClick={handleSave} disabled={!value || saving}>
              Saqlash
            </Button>
            {editing && (
              <Button variant="secondary" onClick={() => setEditing(false)}>
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
              Imtihon sanasi: {new Date(`${examDate}T00:00:00`).toLocaleDateString('uz-UZ')}
            </Text>
          </div>
        </Group>
        <Button
          variant="secondary"
          size="xs"
          leftSection={<IconEdit size={14} />}
          onClick={() => {
            setValue(examDate)
            setEditing(true)
          }}
        >
          O'zgartirish
        </Button>
      </Group>
    </Paper>
  )
}
