import { useEffect, useState } from 'react'
import { Table, TextInput, NumberInput, Text, Skeleton, Group } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { fetchAdminPlans, updateAdminPlan } from '../api/adminApi'

export function AdminPlansTab() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    fetchAdminPlans()
      .then((data) => {
        if (isMounted) setPlans(data)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const handleUpdate = async (planId, field, value) => {
    try {
      const updated = await updateAdminPlan(planId, { [field]: value })
      setPlans((prev) => prev.map((p) => (p.id === planId ? updated : p)))
    } catch (error) {
      notifications.show({ color: 'danger', title: 'Xatolik', message: error.message })
    }
  }

  if (loading) {
    return <Skeleton height={200} radius="lg" />
  }

  return (
    <div>
      <Text c="dimmed" size="sm" mb="md">
        Premium tariflar narxi va muddati — o'zgartirilgach maydondan chiqishingiz bilan saqlanadi.
      </Text>

      <Table.ScrollContainer minWidth={600}>
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nomi</Table.Th>
              <Table.Th>Muddati (kun)</Table.Th>
              <Table.Th>Narxi (so'm)</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {plans.map((plan) => (
              <Table.Tr key={plan.id}>
                <Table.Td>
                  <TextInput
                    defaultValue={plan.label}
                    size="xs"
                    w={160}
                    onBlur={(e) => {
                      if (e.currentTarget.value !== plan.label) {
                        handleUpdate(plan.id, 'label', e.currentTarget.value)
                      }
                    }}
                  />
                </Table.Td>
                <Table.Td>
                  <NumberInput
                    defaultValue={plan.days}
                    size="xs"
                    w={110}
                    min={1}
                    onBlur={(e) => {
                      const value = Number(e.currentTarget.value)
                      if (value && value !== plan.days) {
                        handleUpdate(plan.id, 'days', value)
                      }
                    }}
                  />
                </Table.Td>
                <Table.Td>
                  <Group gap={6} wrap="nowrap">
                    <NumberInput
                      defaultValue={plan.amount}
                      size="xs"
                      w={130}
                      min={0}
                      step={1000}
                      thousandSeparator=" "
                      onBlur={(e) => {
                        const raw = e.currentTarget.value.replace(/\s/g, '')
                        const value = Number(raw)
                        if (!Number.isNaN(value) && value !== plan.amount) {
                          handleUpdate(plan.id, 'amount', value)
                        }
                      }}
                    />
                    <Text size="xs" c="dimmed">
                      so'm
                    </Text>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </div>
  )
}
