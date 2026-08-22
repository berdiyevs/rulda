import { Card, Group, Stack, Text, Title } from '@mantine/core'
import { CategoryIcon } from '../../../shared/ui/CategoryIcon/CategoryIcon'
import { Badge } from '../../../shared/ui/Badge/Badge'
import './ComingSoonCard.css'

export function ComingSoonCard({ topic }) {
  const { icon, title, description } = topic

  return (
    <Card className="glass-card category-card-disabled" padding="lg">
      <Stack gap="md">
        <Group justify="space-between">
          <CategoryIcon name={icon} />
          <Badge variant="default">Tez kunda</Badge>
        </Group>

        <Stack gap={4}>
          <Title order={3} fz="1.15rem">
            {title}
          </Title>
          <Text c="dimmed" fz="sm" lh={1.5}>
            {description}
          </Text>
        </Stack>
      </Stack>
    </Card>
  )
}
