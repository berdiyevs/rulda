import { useEffect, useMemo, useState } from 'react'
import { Table, TextInput, Group, Text, ActionIcon, Skeleton, Image } from '@mantine/core'
import { IconSearch, IconTrash, IconEdit, IconPlus } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { fetchRoadSigns } from '../../../entities/road-sign'
import { createRoadSign, updateRoadSign, deleteRoadSign } from '../api/adminApi'
import { Button } from '../../../shared/ui/Button/Button'
import { RoadSignFormModal } from './RoadSignFormModal'

export function AdminRoadSignsTab() {
  const [signs, setSigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalState, setModalState] = useState({ open: false, sign: null })

  const load = () => {
    setLoading(true)
    fetchRoadSigns()
      .then(setSigns)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return signs
    const q = search.trim().toLowerCase()
    return signs.filter((s) => s.nom.toLowerCase().includes(q) || s.id.includes(q))
  }, [signs, search])

  const openCreate = () => setModalState({ open: true, sign: null })
  const openEdit = (s) => setModalState({ open: true, sign: s })
  const closeModal = () => setModalState({ open: false, sign: null })

  const handleSubmit = async (payload) => {
    try {
      if (modalState.sign) {
        const updated = await updateRoadSign(modalState.sign.id, payload)
        setSigns((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
        notifications.show({ color: 'success', message: 'Belgi yangilandi' })
      } else {
        const created = await createRoadSign(payload)
        setSigns((prev) => [...prev, created])
        notifications.show({ color: 'success', message: "Belgi qo'shildi" })
      }
    } catch (error) {
      notifications.show({ color: 'danger', title: 'Xatolik', message: error.message })
      throw error
    }
  }

  const handleDelete = async (s) => {
    if (!window.confirm(`"${s.nom}" belgisi o'chirilsinmi?`)) return
    try {
      await deleteRoadSign(s.id)
      setSigns((prev) => prev.filter((x) => x.id !== s.id))
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
          placeholder="Nomi yoki ID bo'yicha qidirish..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          maw={360}
        />
        <Button variant="primary" leftSection={<IconPlus size={16} />} onClick={openCreate}>
          Yangi belgi
        </Button>
      </Group>

      <Table.ScrollContainer minWidth={700}>
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Rasm</Table.Th>
              <Table.Th>ID</Table.Th>
              <Table.Th>Kategoriya</Table.Th>
              <Table.Th>Nomi</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filtered.map((s) => (
              <Table.Tr key={s.id}>
                <Table.Td>
                  <Image src={s.rasm} w={40} h={40} fit="contain" alt={s.nom} />
                </Table.Td>
                <Table.Td>{s.id}</Table.Td>
                <Table.Td>{s.kategoriya}</Table.Td>
                <Table.Td>
                  <Text size="sm">{s.nom}</Text>
                </Table.Td>
                <Table.Td>
                  <Group gap={4} wrap="nowrap">
                    <ActionIcon variant="subtle" onClick={() => openEdit(s)}>
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="danger" onClick={() => handleDelete(s)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      <RoadSignFormModal
        isOpen={modalState.open}
        onClose={closeModal}
        sign={modalState.sign}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
