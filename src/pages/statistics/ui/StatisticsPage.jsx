import {
  Container,
  Stack,
  Group,
  Title,
  Text,
  SimpleGrid,
  Skeleton,
  ThemeIcon,
  Paper,
  RingProgress,
  Progress,
} from '@mantine/core'
import {
  IconFlame,
  IconCertificate,
  IconChartBar,
  IconMoodSmile,
  IconCircleCheck,
  IconRefresh,
  IconClipboardCheck,
  IconTargetArrow,
} from '@tabler/icons-react'
import { CategoriesNav } from '../../../widgets/sidebar'
import { Button } from '../../../shared/ui/Button/Button'
import { Badge } from '../../../shared/ui/Badge/Badge'
import { useStatistics } from '../../../features/statistics'
import { useQuizStart } from '../../../widgets/quiz-start'

function readinessColor(percent) {
  if (percent >= 75) return 'success'
  if (percent >= 50) return 'warning'
  return 'danger'
}

function TrendChart({ history }) {
  const width = 600
  const height = 170
  const padY = 18
  const padX = 26
  const usableH = height - padY * 2
  const usableW = width - padX * 2
  const n = history.length

  const points = history.map((h, i) => ({
    x: n === 1 ? width / 2 : padX + (i / (n - 1)) * usableW,
    y: padY + (1 - h.percent / 100) * usableH,
    ...h,
  }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ')
  const areaPath =
    `M ${points[0].x},${height} ` +
    points.map((p) => `L ${p.x},${p.y}`).join(' ') +
    ` L ${points[points.length - 1].x},${height} Z`

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        preserveAspectRatio="none"
        style={{ display: 'block', minWidth: 480 }}
      >
        <defs>
          <linearGradient id="trendLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
          <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 50, 100].map((mark) => {
          const y = padY + (1 - mark / 100) * usableH
          return (
            <g key={mark}>
              <line x1={0} y1={y} x2={width} y2={y} stroke="var(--border)" strokeWidth={1} />
              <text x={4} y={y - 4} fontSize={9} fill="var(--text-muted)">
                {mark}%
              </text>
            </g>
          )
        })}

        <path d={areaPath} fill="url(#trendArea)" stroke="none" />
        <path
          d={linePath}
          fill="none"
          stroke="url(#trendLine)"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {points.map((p) => (
          <g key={p.id}>
            <circle cx={p.x} cy={p.y} r={4} fill={p.passed ? 'var(--success)' : 'var(--danger)'} stroke="var(--bg)" strokeWidth={1.5}>
              <title>
                {p.percent}% · {p.date ? p.date.toLocaleDateString('uz-UZ') : ''}
              </title>
            </circle>
            <text x={p.x} y={height - 4} fontSize={8} textAnchor="middle" fill="var(--text-muted)">
              {p.date ? p.date.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' }) : ''}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

export function StatisticsPage() {
  const { stats, loading, error } = useStatistics()
  const openQuizStart = useQuizStart()

  return (
    <div className="page-shell has-tabbar">
      <CategoriesNav />

      <Container size={1180} py="xl">
        <Stack gap={4} mb="xl">
          <Title order={1}>Statistika</Title>
          <Text c="dimmed">Tayyorgarligingiz, xatolaringiz va progressingiz bir joyda.</Text>
        </Stack>

        {loading && (
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" mb="xl">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} height={160} radius="lg" />
            ))}
          </SimpleGrid>
        )}

        {error && <Text c="danger">{error}</Text>}

        {!loading && !error && stats && (
          <Stack gap="xl">
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
              <Paper className="glass-card" p="lg">
                <Stack align="center" gap={4} ta="center">
                  <Text c="dimmed" fz="sm" fw={600} tt="uppercase">
                    Imtihonga tayyorligingiz
                  </Text>
                  <RingProgress
                    size={120}
                    thickness={9}
                    roundCaps
                    sections={[{ value: stats.readinessPercent, color: readinessColor(stats.readinessPercent) }]}
                    label={
                      <Text fw={800} fz="1.4rem" ta="center">
                        {stats.readinessPercent}%
                      </Text>
                    }
                  />
                </Stack>
              </Paper>

              <Paper className="glass-card" p="lg">
                <Stack align="center" gap={8} ta="center" justify="center" h="100%">
                  <ThemeIcon size={44} radius="xl" variant="light" color="warning">
                    <IconFlame size={22} />
                  </ThemeIcon>
                  <Text fw={800} fz="1.6rem">
                    {stats.streak} kun
                  </Text>
                  <Text c="dimmed" fz="sm">
                    Ketma-ket mashq qilish
                  </Text>
                </Stack>
              </Paper>

              <Paper className="glass-card" p="lg">
                <Stack align="center" gap={8} ta="center" justify="center" h="100%">
                  <ThemeIcon size={44} radius="xl" variant="light" color="brand">
                    <IconCertificate size={22} />
                  </ThemeIcon>
                  <Text fw={800} fz="1.6rem">
                    {stats.examStats.passedExams}/{stats.examStats.totalExams}
                  </Text>
                  <Text c="dimmed" fz="sm">
                    Rasmiy imtihonlar o'tildi · eng yaxshisi {stats.examStats.bestPercent}%
                  </Text>
                </Stack>
              </Paper>
            </SimpleGrid>

            <div>
              <Group justify="space-between" mb="md">
                <Title order={2} fz="lg">
                  Mavzular bo'yicha natija
                </Title>
                {stats.weakestTopic && (
                  <Badge variant="warning">Eng zaif: {stats.weakestTopic.title}</Badge>
                )}
              </Group>
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                {stats.topicBreakdown.map((t) => (
                  <Paper key={t.id} className="glass-card" p="md">
                    <Group justify="space-between" mb={8}>
                      <Text fw={600} fz="sm">
                        {t.title}
                      </Text>
                      <Text fw={700} fz="sm" c={t.percent == null ? 'dimmed' : undefined}>
                        {t.percent == null ? '—' : `${t.percent}%`}
                      </Text>
                    </Group>
                    <Progress
                      value={t.percent ?? 0}
                      color={t.percent == null ? 'gray' : readinessColor(t.percent)}
                      radius="xl"
                      size="sm"
                    />
                  </Paper>
                ))}
              </SimpleGrid>
            </div>

            <div>
              <Title order={2} fz="lg" mb="md">
                Oxirgi urinishlar dinamikasi
              </Title>
              <Paper className="glass-card" p="lg">
                {stats.history.length === 0 ? (
                  <Text c="dimmed">Hali urinishlar mavjud emas.</Text>
                ) : (
                  <TrendChart history={stats.history} />
                )}
              </Paper>
            </div>

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
              <Paper className="glass-card" p="lg" ta="center">
                <ThemeIcon size={40} radius="xl" variant="light" color="brand" mx="auto" mb={8}>
                  <IconChartBar size={20} />
                </ThemeIcon>
                <Text fw={800} fz="1.3rem">
                  {stats.totals.totalAttempts}
                </Text>
                <Text c="dimmed" fz="sm">
                  Jami urinishlar
                </Text>
              </Paper>
              <Paper className="glass-card" p="lg" ta="center">
                <ThemeIcon size={40} radius="xl" variant="light" color="accent" mx="auto" mb={8}>
                  <IconClipboardCheck size={20} />
                </ThemeIcon>
                <Text fw={800} fz="1.3rem">
                  {stats.totals.totalQuestionsAnswered}
                </Text>
                <Text c="dimmed" fz="sm">
                  Jami yechilgan savollar
                </Text>
              </Paper>
              <Paper className="glass-card" p="lg" ta="center">
                <ThemeIcon size={40} radius="xl" variant="light" color="success" mx="auto" mb={8}>
                  <IconTargetArrow size={20} />
                </ThemeIcon>
                <Text fw={800} fz="1.3rem">
                  {stats.totals.overallAccuracy}%
                </Text>
                <Text c="dimmed" fz="sm">
                  Umumiy aniqlik
                </Text>
              </Paper>
            </SimpleGrid>

            <div>
              <Title order={2} fz="lg" mb="md">
                Xatolarim
              </Title>

              {stats.mistakeQuestions.length === 0 ? (
                <Stack align="center" ta="center" gap="md" className="glass-card" p="xl">
                  <ThemeIcon size={56} radius="xl" variant="light" color="success">
                    <IconMoodSmile size={28} />
                  </ThemeIcon>
                  <Title order={3} fz="1.1rem">
                    Xatolaringiz yo'q!
                  </Title>
                  <Text c="dimmed">Hozircha xato qilingan savollaringiz yo'q. Mashq qilishda davom eting.</Text>
                </Stack>
              ) : (
                <Stack gap="md">
                  <Group justify="space-between" wrap="wrap" className="glass-card" p="lg">
                    <div>
                      <Text fw={700} fz="1.1rem">
                        {stats.mistakeQuestions.length} ta savolda xato qilgansiz
                      </Text>
                      <Text c="dimmed" fz="sm">
                        Ularni qayta ko'rib chiqing va mashq qiling.
                      </Text>
                    </div>
                    <Button
                      variant="primary"
                      onClick={() =>
                        openQuizStart({
                          mode: 'mistakes',
                          questionIds: stats.mistakeQuestions.map((q) => q.id),
                        })
                      }
                      leftSection={<IconRefresh size={16} />}
                    >
                      Xatolar bo'yicha mashq qilish
                    </Button>
                  </Group>

                  <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                    {stats.mistakeQuestions.map((q) => {
                      const correctOption = q.options.find((o) => o.is_correct)
                      return (
                        <Paper key={q.id} className="glass-card" p="md">
                          <Text fw={600} mb={8} lh={1.4}>
                            {q.question}
                          </Text>
                          <Group gap={6} wrap="nowrap" align="flex-start">
                            <ThemeIcon size={20} radius="xl" variant="light" color="success" mt={2}>
                              <IconCircleCheck size={13} />
                            </ThemeIcon>
                            <Text c="dimmed" fz="sm">
                              {correctOption?.text}
                            </Text>
                          </Group>
                        </Paper>
                      )
                    })}
                  </SimpleGrid>
                </Stack>
              )}
            </div>
          </Stack>
        )}
      </Container>
    </div>
  )
}
