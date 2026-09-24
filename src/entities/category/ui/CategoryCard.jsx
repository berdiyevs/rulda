import { Card, Group, Stack, Text, Title } from '@mantine/core'
import { IconArrowRight } from '@tabler/icons-react'
import { CategoryIcon } from '../../../shared/ui/CategoryIcon/CategoryIcon'
import { Badge } from '../../../shared/ui/Badge/Badge'
import './CategoryCard.css'

export function CategoryCard({ topic, latestAttempt, onSelect }) {
  const { icon, title, description } = topic

  // Foiz faqat javob berilgan savollarga nisbatan (1240 ta savolning foizi emas).
  const answered = latestAttempt ? latestAttempt.correctCount + latestAttempt.wrongCount : 0
  const scorePercent = answered ? Math.round((latestAttempt.correctCount / answered) * 100) : null

  return (
    <Card
      component="button"
      type="button"
      onClick={onSelect}
      className="glass-card slide-up category-card"
      padding="lg"
      style={{ width: '100%', textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer' }}
    >
      <Stack gap="md" h="100%">
        <Group justify="space-between">
          <CategoryIcon name={icon} />
          {scorePercent !== null ? (
            <Badge variant={scorePercent >= 70 ? 'success' : 'warning'}>
              Oxirgi: {latestAttempt.correctCount}/{answered}
            </Badge>
          ) : (
            <Badge>Boshlanmagan</Badge>
          )}
        </Group>

        <Stack gap={4} style={{ flexGrow: 1 }}>
          <Title order={3} fz="1.15rem">
            {title}
          </Title>
          <Text c="dimmed" fz="sm" lh={1.5}>
            {description}
          </Text>
        </Stack>

        <Group
          justify="space-between"
          pt="sm"
          fz="0.82rem"
          c="dimmed"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          {latestAttempt ? (
            <span>
              Oxirgi urinish: {latestAttempt.correctCount}/{answered} to'g'ri · {scorePercent}%
            </span>
          ) : (
            <span>Mashq qilishni boshlang</span>
          )}
          <IconArrowRight size={18} className="category-arrow" />
        </Group>
      </Stack>
    </Card>
  )
}
