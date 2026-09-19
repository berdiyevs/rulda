import { useEffect, useMemo, useState } from 'react'
import { Table, TextInput, Switch, Group, Text, ActionIcon, Skeleton, TextInput as DateInput } from '@mantine/core'
import { IconSearch, IconTrash } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { fetchAdminUsers, updateAdminUser, deleteAdminUser } from '../api/adminApi'
import { Badge } from '../../../shared/ui/Badge/Badge'
import { useAuth } from '../../../entities/user'

function formatDate(date) {
  if (!date) return '—'
  return date.toLocaleDateString('uz-UZ')
}

export function AdminUsersTab() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let isMounted = true
    fetchAdminUsers()
      .then((data) => {
        if (isMounted) setUsers(data)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return users
    const q = search.trim().toLowerCase()
    return users.filter(
      (u) => u.email.toLowerCase().includes(q) || u.displayName?.toLowerCase().includes(q),
    )
  }, [users, search])

  const handleToggle = async (u, field, value) => {
    try {
      const updated = await updateAdminUser(u.id, { [field]: value })
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, ...updated } : x)))
    } catch (error) {
      notifications.show({ color: 'danger', title: 'Xatolik', message: error.message })
    }
  }

  const handlePremiumUntil = async (u, value) => {
    try {
      const updated = await updateAdminUser(u.id, { premiumUntil: value || null })
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, ...updated } : x)))
    } catch (error) {
      notifications.show({ color: 'danger', title: 'Xatolik', message: error.message })
    }
  }

  const handleDelete = async (u) => {
    if (!window.confirm(`${u.email} o'chirilsinmi? Bu qaytarib bo'lmaydigan amal.`)) return
    try {
      await deleteAdminUser(u.id)
      setUsers((prev) => prev.filter((x) => x.id !== u.id))
    } catch (error) {
      notifications.show({ color: 'danger', title: 'Xatolik', message: error.message })
    }
  }

  if (loading) {
    return <Skeleton height={300} radius="lg" />
  }

  return (
    <div>
      <TextInput
        placeholder="Email yoki ism bo'yicha qidirish..."
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        mb="md"
        maw={360}
      />

      <Table.ScrollContainer minWidth={900}>
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Email / Ism</Table.Th>
              <Table.Th>Tasdiqlangan</Table.Th>
              <Table.Th>Admin</Table.Th>
              <Table.Th>Premium</Table.Th>
              <Table.Th>Premium muddati</Table.Th>
              <Table.Th>Urinishlar</Table.Th>
              <Table.Th>Ro'yxatdan o'tgan</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filtered.map((u) => (
              <Table.Tr key={u.id}>
                <Table.Td>
                  <Text fw={600} size="sm">
                    {u.displayName}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {u.email}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Switch
                    checked={u.isVerified}
                    onChange={(e) => handleToggle(u, 'isVerified', e.currentTarget.checked)}
                  />
                </Table.Td>
                <Table.Td>
                  <Switch
                    checked={u.isAdmin}
                    disabled={u.id === currentUser?.uid}
                    onChange={(e) => handleToggle(u, 'isAdmin', e.currentTarget.checked)}
                  />
                </Table.Td>
                <Table.Td>
                  <Group gap={6} wrap="nowrap">
                    <Switch
                      checked={u.isPremium}
                      onChange={(e) => handleToggle(u, 'isPremium', e.currentTarget.checked)}
                    />
                    {u.isPremium && !u.isPremiumActive && (
                      <Badge variant="warning">Muddati o'tgan</Badge>
                    )}
                  </Group>
                </Table.Td>
                <Table.Td>
                  <DateInput
                    type="date"
                    size="xs"
                    w={150}
                    defaultValue={u.premiumUntil || ''}
                    onBlur={(e) => handlePremiumUntil(u, e.currentTarget.value)}
                  />
                </Table.Td>
                <Table.Td>
                  <Badge variant="primary">{u.attemptCount}</Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="xs" c="dimmed">
                    {formatDate(u.createdAt)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <ActionIcon
                    variant="subtle"
                    color="danger"
                    disabled={u.id === currentUser?.uid}
                    onClick={() => handleDelete(u)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {filtered.length === 0 && (
        <Group justify="center" py="xl">
          <Text c="dimmed">Hech kim topilmadi.</Text>
        </Group>
      )}
    </div>
  )
}
