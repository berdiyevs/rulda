import { useEffect, useState } from 'react'
import { Stack, TextInput, Select, Group, Text, Image } from '@mantine/core'
import { Modal } from '../../../shared/ui/Modal/Modal'
import { Button } from '../../../shared/ui/Button/Button'
import { SIGN_CATEGORIES } from '../../../entities/road-sign'

function toFormState(sign) {
  if (!sign) return { id: '', kategoriya: SIGN_CATEGORIES[0].key, nom: '', rasm: '' }
  return { id: sign.id, kategoriya: sign.kategoriya, nom: sign.nom, rasm: sign.rasm }
}

export function RoadSignFormModal({ isOpen, onClose, sign, onSubmit }) {
  const [form, setForm] = useState(() => toFormState(sign))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) setForm(toFormState(sign))
  }, [isOpen, sign])

  const isValid = form.id.trim() && form.nom.trim() && form.rasm.trim() && form.kategoriya

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await onSubmit({
        id: form.id.trim(),
        kategoriya: form.kategoriya,
        nom: form.nom.trim(),
        rasm: form.rasm.trim(),
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth={460}>
      <Stack gap="sm">
        <Text fw={700} fz="lg">
          {sign ? 'Belgini tahrirlash' : "Yangi yo'l belgisi"}
        </Text>

        <TextInput
          label="ID (masalan 1.1)"
          value={form.id}
          onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
          disabled={Boolean(sign)}
        />

        <Select
          label="Kategoriya"
          data={SIGN_CATEGORIES.map((c) => ({ value: c.key, label: c.nom }))}
          value={form.kategoriya}
          onChange={(v) => setForm((f) => ({ ...f, kategoriya: v }))}
        />

        <TextInput
          label="Nomi"
          value={form.nom}
          onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
        />

        <TextInput
          label="Rasm URL"
          placeholder="/assets/images/1.1.gif"
          value={form.rasm}
          onChange={(e) => setForm((f) => ({ ...f, rasm: e.target.value }))}
        />

        {form.rasm && (
          <Image src={form.rasm} h={80} w={80} fit="contain" fallbackSrc="" alt="Ko'rinishi" />
        )}

        <Group justify="flex-end" mt="sm">
          <Button variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button variant="primary" disabled={!isValid || saving} onClick={handleSubmit}>
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
