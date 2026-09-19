import { useEffect, useState } from 'react'
import { SimpleGrid, Paper, Text, Stack, Group, Skeleton } from '@mantine/core'
import { fetchAdminStats } from '../api/adminApi'

function StatCard({ label, value }) {
  return (
    <Paper className="glass-card" p="lg">
      <Stack gap={4}>
        <Text c="dimmed" size="sm">
          {label}
        </Text>
        <Text fw={800} fz="1.8rem">
          {value}
        </Text>
      </Stack>
    </Paper>
  )
}

function MiniBars({ title, data }) {
  const max = Math.max(1, ...data.map((d) => d.count))
  return (
    <Paper className="glass-card" p="lg">
      <Text fw={700} mb="md">
        {title}
      </Text>
      <Group align="flex-end" gap={6} h={100}>
        {data.map((d) => (
          <Stack key={d.date} gap={4} align="center" style={{ flex: 1 }}>
            <div
              style={{
                width: '100%',
                height: `${Math.max(4, (d.count / max) * 80)}px`,
                borderRadius: 4,
                background: 'var(--mantine-color-brand-5)',
              }}
              title={`${d.date}: ${d.count}`}
            />
          </Stack>
        ))}
      </Group>
      <Group justify="space-between" mt={4}>
        <Text size="xs" c="dimmed">
          {data[0]?.date}
        </Text>
        <Text size="xs" c="dimmed">
          {data[data.length - 1]?.date}
        </Text>
      </Group>
    </Paper>
  )
}

export function AdminStatsTab() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let isMounted = true
    fetchAdminStats().then((data) => {
      if (isMounted) setStats(data)
    })
    return () => {
      isMounted = false
    }
  }, [])

  if (!stats) {
    return <Skeleton height={300} radius="lg" />
  }

  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        <StatCard label="Jami foydalanuvchilar" value={stats.total_users} />
        <StatCard label="Tasdiqlangan" value={stats.verified_users} />
        <StatCard label="Premium" value={stats.premium_users} />
        <StatCard label="Adminlar" value={stats.admin_users} />
        <StatCard label="Jami urinishlar" value={stats.total_attempts} />
        <StatCard label="Bugungi urinishlar" value={stats.attempts_today} />
        <StatCard label="O'tilgan urinishlar" value={stats.passed_attempts} />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <MiniBars title="Ro'yxatdan o'tishlar (14 kun)" data={stats.signups_last_14_days} />
        <MiniBars title="Test urinishlari (14 kun)" data={stats.attempts_last_14_days} />
      </SimpleGrid>
    </Stack>
  )
}
