import { useEffect, useMemo, useState } from 'react'
import { Table, TextInput, Group, Text, ActionIcon, Skeleton, Pagination } from '@mantine/core'
import { IconSearch, IconTrash, IconEdit, IconPlus } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { fetchQuestions } from '../../../entities/question'
import { createQuestion, updateQuestion, deleteQuestion } from '../api/adminApi'
import { Button } from '../../../shared/ui/Button/Button'
import { Badge } from '../../../shared/ui/Badge/Badge'
import { QuestionFormModal } from './QuestionFormModal'

const PAGE_SIZE = 25

export function AdminQuestionsTab() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalState, setModalState] = useState({ open: false, question: null })

  const load = () => {
    setLoading(true)
    fetchQuestions()
      .then(setQuestions)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return questions
    const q = search.trim().toLowerCase()
    return questions.filter(
      (item) => item.question.toLowerCase().includes(q) || String(item.ticketId).includes(q),
    )
  }, [questions, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const openCreate = () => setModalState({ open: true, question: null })
  const openEdit = (q) => setModalState({ open: true, question: q })
  const closeModal = () => setModalState({ open: false, question: null })

  const handleSubmit = async (payload) => {
    try {
      if (modalState.question) {
        const updated = await updateQuestion(modalState.question.pk, payload)
        setQuestions((prev) => prev.map((q) => (q.pk === updated.pk ? updated : q)))
        notifications.show({ color: 'success', message: 'Savol yangilandi' })
      } else {
        const created = await createQuestion(payload)
        setQuestions((prev) => [...prev, created])
        notifications.show({ color: 'success', message: 'Savol qo\'shildi' })
      }
    } catch (error) {
      notifications.show({ color: 'danger', title: 'Xatolik', message: error.message })
      throw error
    }
  }

  const handleDelete = async (q) => {
    if (!window.confirm(`"${q.question.slice(0, 40)}..." savoli o'chirilsinmi?`)) return
    try {
      await deleteQuestion(q.pk)
      setQuestions((prev) => prev.filter((x) => x.pk !== q.pk))
    } catch (error) {
      notifications.show({ color: 'danger', title: 'Xatolik', message: error.message })
    }
  }

  if (loading) {
    return <Skeleton height={300} radius="lg" />
  }

  return (
    <div>
      <Group justify="space-between" mb="md" wrap="wrap">
        <TextInput
          placeholder="Savol matni yoki bilet raqami..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          maw={360}
        />
        <Button variant="primary" leftSection={<IconPlus size={16} />} onClick={openCreate}>
          Yangi savol
        </Button>
      </Group>

      <Text size="sm" c="dimmed" mb="xs">
        Jami: {filtered.length} ta savol
      </Text>

      <Table.ScrollContainer minWidth={800}>
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Bilet</Table.Th>
              <Table.Th>Turi</Table.Th>
              <Table.Th>Savol</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {pageItems.map((q) => (
              <Table.Tr key={q.pk}>
                <Table.Td>{q.id}</Table.Td>
                <Table.Td>{q.ticketId ?? '—'}</Table.Td>
                <Table.Td>
                  <Badge variant={q.image_url ? 'primary' : 'default'}>
                    {q.image_url ? 'Rasmli' : 'Nazariy'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" lineClamp={1} maw={420}>
                    {q.question}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap={4} wrap="nowrap">
                    <ActionIcon variant="subtle" onClick={() => openEdit(q)}>
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="danger" onClick={() => handleDelete(q)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {totalPages > 1 && (
        <Group justify="center" mt="md">
          <Pagination value={page} onChange={setPage} total={totalPages} />
        </Group>
      )}

      <QuestionFormModal
        isOpen={modalState.open}
        onClose={closeModal}
        question={modalState.question}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
