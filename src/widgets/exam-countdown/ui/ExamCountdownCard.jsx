import { useState } from 'react'
import { Paper, Stack, Group, Text, TextInput } from '@mantine/core'
import { IconCalendarEvent, IconEdit } from '@tabler/icons-react'
import { Button } from '../../../shared/ui/Button/Button'
import { useAuth, updateExamDate } from '../../../entities/user'
import { track } from '../../../shared/lib/analytics'
import { isoToDisplay, maskDate, displayToIso, daysUntil } from '../../../shared/lib/examDate'
import { getExamRecommendation } from '../../../shared/lib/examPlan'

// ticketsLeft: ochiq va hali o'tilmagan biletlar; totalLeft: barcha o'tilmagan biletlar (tavsiya uchun).
export function ExamCountdownCard({ ticketsLeft, totalLeft }) {
  const { user, profile, isPremiumActive, refreshProfile } = useAuth()
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
      track('exam_date_set')
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

  let recommendation = null
  if (isPast) {
    recommendation = "Qayta topshirmoqchi bo'lsangiz, yangi imtihon sanasini kiriting: tayyorgarlik rejangiz yangilanadi."
  } else if (days > 0 && typeof ticketsLeft === 'number') {
    recommendation = getExamRecommendation({ days, ticketsLeft, totalLeft, isPremiumActive })
  }

  return (
    <Paper className="glass-card" p="lg">
      <Group justify="space-between" align="center" wrap="wrap" gap="md">
        <Group gap={12}>
          <IconCalendarEvent size={22} color="var(--mantine-color-brand-6)" />
          <div>
            <Text fw={800} fz="1.3rem">
              {isPast ? "Imtihoningiz qanday o'tdi?" : days === 0 ? 'Imtihon bugun!' : `${days} kun qoldi`}
            </Text>
            <Text c="dimmed" fz="sm">
              Imtihon sanasi: {isoToDisplay(examDate)}
            </Text>
          </div>
        </Group>
        <Button
          variant={isPast ? 'primary' : 'secondary'}
          size="xs"
          leftSection={<IconEdit size={14} />}
          onClick={() => {
            // Sana o'tib ketgan bo'lsa, yangi sana kiritiladi; aks holda mavjud sana tahrirlanadi.
            setValue(isPast ? '' : isoToDisplay(examDate))
            setEditing(true)
          }}
        >
          {isPast ? 'Yangi sana kiritish' : "O'zgartirish"}
        </Button>
      </Group>
      {recommendation && (
        <Text fz="sm" mt="sm" pt="sm" style={{ borderTop: '1px solid var(--border)' }}>
          {recommendation}
        </Text>
      )}
    </Paper>
  )
}
