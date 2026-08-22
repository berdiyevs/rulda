import { useEffect, useMemo, useState } from 'react'
import { CategoriesNav } from '../../../widgets/sidebar'
import { fetchRoadSigns, SIGN_CATEGORIES } from '../../../entities/road-sign'
import { Spinner } from '../../../shared/ui/Spinner/Spinner'
import './RoadSignsPage.css'

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

      <div className="container road-signs-page">
        <div className="road-signs-header">
          <h1>Yo'l belgilari to'plami</h1>
          <p>Barcha rasmiy yo'l belgilarini kategoriya bo'yicha ko'rib chiqing.</p>
        </div>

        <div className="road-signs-controls">
          <input
            type="text"
            placeholder="Belgi nomini qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="signs-search"
          />
          <div className="signs-filters">
            <button
              className={activeCategory === 'all' ? 'active' : ''}
              onClick={() => setActiveCategory('all')}
            >
              Barchasi
            </button>
            {SIGN_CATEGORIES.map((c) => (
              <button
                key={c.key}
                className={activeCategory === c.key ? 'active' : ''}
                onClick={() => setActiveCategory(c.key)}
              >
                {c.nom}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="road-signs-loading">
            <Spinner label="Yuklanmoqda..." />
          </div>
        )}
        {error && <p className="road-signs-status">{error}</p>}

        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <p className="road-signs-status">Hech narsa topilmadi.</p>
            ) : (
              <div className="signs-grid">
                {filtered.map((b) => (
                  <div className="sign-card" key={b.id}>
                    <img src={b.rasm} alt={b.nom || b.id} loading="lazy" />
                    <p>{b.nom}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
