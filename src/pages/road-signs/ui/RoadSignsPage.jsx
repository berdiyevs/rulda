import { useEffect, useMemo, useState } from 'react'
import { Container, Stack, Group, Title, Text, TextInput, Chip, SimpleGrid, Paper, Image, Skeleton } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { CategoriesNav } from '../../../widgets/sidebar'
import { fetchRoadSigns, SIGN_CATEGORIES } from '../../../entities/road-sign'

export function RoadSignsPage() {
  const [signs, setSigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let isMounted = true
    fetchRoadSigns()
      .then((data) => {
        if (isMounted) setSigns(data)
      })
      .catch((err) => {
        if (isMounted) setError(err.message)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const filteredByCategory = useMemo(() => {
    if (activeCategory === 'all') return signs
    return signs.filter((s) => s.kategoriya === activeCategory)
  }, [signs, activeCategory])

  const filtered = useMemo(() => {
    if (!search.trim()) return filteredByCategory
    const q = search.trim().toLowerCase()
    return filteredByCategory.filter((s) => s.nom?.toLowerCase().includes(q))
  }, [filteredByCategory, search])

  return (
    <div className="page-shell">
      <CategoriesNav />

      <Container size={1180} py="xl">
        <Stack gap={4} mb="lg">
          <Title order={1}>Yo'l belgilari to'plami</Title>
          <Text c="dimmed">Barcha rasmiy yo'l belgilarini kategoriya bo'yicha ko'rib chiqing.</Text>
        </Stack>

        <Stack gap="md" mb="xl">
          <TextInput
            placeholder="Belgi nomini qidirish..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            maw={420}
          />
          <Chip.Group multiple={false} value={activeCategory} onChange={setActiveCategory}>
            <Group gap="xs">
              <Chip value="all" variant="light" color="brand">
                Barchasi
              </Chip>
              {SIGN_CATEGORIES.map((c) => (
                <Chip key={c.key} value={c.key} variant="light" color="brand">
                  {c.nom}
                </Chip>
              ))}
            </Group>
          </Chip.Group>
        </Stack>

        {loading && (
          <SimpleGrid cols={{ base: 2, sm: 4, lg: 6 }} spacing="md">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} height={140} radius="lg" />
            ))}
          </SimpleGrid>
        )}
        {error && <Text c="danger">{error}</Text>}

        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <Text c="dimmed">Hech narsa topilmadi.</Text>
            ) : (
              <SimpleGrid cols={{ base: 2, sm: 4, lg: 6 }} spacing="md">
                {filtered.map((b) => (
                  <Paper key={b.id} bg="white" radius="lg" p="sm" ta="center" withBorder>
                    <Image src={b.rasm} alt={b.nom || b.id} loading="lazy" fit="contain" h={70} mx="auto" />
                    <Text size="xs" mt={6} c="dark.8">
                      {b.nom}
                    </Text>
                  </Paper>
                ))}
              </SimpleGrid>
            )}
          </>
        )}
      </Container>
    </div>
  )
}
