import { Container, Tabs, Title, Text, Stack } from '@mantine/core'
import { IconUsers, IconChartBar, IconHelpCircle, IconRoadSign } from '@tabler/icons-react'
import { CategoriesNav } from '../../../widgets/sidebar'
import { AdminUsersTab } from './AdminUsersTab'
import { AdminStatsTab } from './AdminStatsTab'
import { AdminQuestionsTab } from './AdminQuestionsTab'
import { AdminRoadSignsTab } from './AdminRoadSignsTab'

export function AdminPage() {
  return (
    <div className="page-shell has-tabbar">
      <CategoriesNav />

      <Container size={1280} py="xl">
        <Stack gap={4} mb="lg">
          <Title order={1}>Admin panel</Title>
          <Text c="dimmed">Foydalanuvchilar, savollar va statistikani boshqarish.</Text>
        </Stack>

        <Tabs defaultValue="stats" keepMounted={false}>
          <Tabs.List mb="lg">
            <Tabs.Tab value="stats" leftSection={<IconChartBar size={16} />}>
              Statistika
            </Tabs.Tab>
            <Tabs.Tab value="users" leftSection={<IconUsers size={16} />}>
              Foydalanuvchilar
            </Tabs.Tab>
            <Tabs.Tab value="questions" leftSection={<IconHelpCircle size={16} />}>
              Savollar
            </Tabs.Tab>
            <Tabs.Tab value="road-signs" leftSection={<IconRoadSign size={16} />}>
              Yo'l belgilari
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="stats">
            <AdminStatsTab />
          </Tabs.Panel>
          <Tabs.Panel value="users">
            <AdminUsersTab />
          </Tabs.Panel>
          <Tabs.Panel value="questions">
            <AdminQuestionsTab />
          </Tabs.Panel>
          <Tabs.Panel value="road-signs">
            <AdminRoadSignsTab />
          </Tabs.Panel>
        </Tabs>
      </Container>
    </div>
  )
}
