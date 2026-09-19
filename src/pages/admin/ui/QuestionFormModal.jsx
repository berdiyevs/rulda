import { useEffect, useState } from 'react'
import { Stack, TextInput, Textarea, NumberInput, Radio, Group, ActionIcon, Text } from '@mantine/core'
import { IconTrash, IconPlus } from '@tabler/icons-react'
import { Modal } from '../../../shared/ui/Modal/Modal'
import { Button } from '../../../shared/ui/Button/Button'

const EMPTY_OPTION = () => ({ id: Date.now() + Math.random(), text: '', is_correct: false })

function toFormState(question) {
  if (!question) {
    return {
      id: '',
      ticketId: '',
      image_url: '',
      question: '',
      options: [EMPTY_OPTION(), EMPTY_OPTION()],
    }
  }
  return {
    id: question.id,
    ticketId: question.ticketId ?? '',
    image_url: question.image_url || '',
    question: question.question,
    options: question.options.map((o) => ({ ...o })),
  }
}

export function QuestionFormModal({ isOpen, onClose, question, onSubmit }) {
  const [form, setForm] = useState(() => toFormState(question))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) setForm(toFormState(question))
  }, [isOpen, question])

  const setOption = (index, patch) => {
    setForm((f) => ({
      ...f,
      options: f.options.map((o, i) => (i === index ? { ...o, ...patch } : o)),
    }))
  }

  const setCorrect = (index) => {
    setForm((f) => ({
      ...f,
      options: f.options.map((o, i) => ({ ...o, is_correct: i === index })),
    }))
  }

  const addOption = () => setForm((f) => ({ ...f, options: [...f.options, EMPTY_OPTION()] }))

  const removeOption = (index) =>
    setForm((f) => ({ ...f, options: f.options.filter((_, i) => i !== index) }))

  const isValid =
    form.question.trim().length > 0 &&
    form.options.length >= 2 &&
    form.options.every((o) => o.text.trim().length > 0) &&
    form.options.some((o) => o.is_correct) &&
    form.id !== ''

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await onSubmit({
        id: Number(form.id),
        ticketId: form.ticketId === '' ? null : Number(form.ticketId),
        image_url: form.image_url.trim() || null,
        question: form.question.trim(),
        options: form.options.map((o, i) => ({ id: i + 1, text: o.text.trim(), is_correct: o.is_correct })),
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth={620}>
      <Stack gap="sm">
        <Text fw={700} fz="lg">
          {question ? 'Savolni tahrirlash' : 'Yangi savol'}
        </Text>

        <Group grow>
          <NumberInput
            label="ID"
            value={form.id}
            onChange={(v) => setForm((f) => ({ ...f, id: v }))}
            disabled={Boolean(question)}
          />
          <NumberInput
            label="Bilet raqami"
            value={form.ticketId}
            onChange={(v) => setForm((f) => ({ ...f, ticketId: v }))}
          />
        </Group>

        <TextInput
          label="Rasm URL (ixtiyoriy)"
          placeholder="/assets/quest-image/..."
          value={form.image_url}
          onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
        />

        <Textarea
          label="Savol matni"
          value={form.question}
          onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
          minRows={2}
          autosize
        />

        <Stack gap={6}>
          <Text size="sm" fw={600}>
            Javob variantlari (to'g'risini belgilang)
          </Text>
          {form.options.map((option, i) => (
            <Group key={option.id} gap="xs" wrap="nowrap">
              <Radio checked={option.is_correct} onChange={() => setCorrect(i)} />
              <TextInput
                style={{ flex: 1 }}
                value={option.text}
                onChange={(e) => setOption(i, { text: e.target.value })}
                placeholder={`Variant ${i + 1}`}
              />
              <ActionIcon
                variant="subtle"
                color="danger"
                disabled={form.options.length <= 2}
                onClick={() => removeOption(i)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          ))}
          <Button variant="ghost" size="xs" onClick={addOption} leftSection={<IconPlus size={14} />}>
            Variant qo'shish
          </Button>
        </Stack>

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
