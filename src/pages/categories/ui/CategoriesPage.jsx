import { useEffect, useState } from 'react'
import { CategoriesNav } from '../../../widgets/sidebar'
import { TOPICS, COMING_SOON, CategoryCard, ComingSoonCard } from '../../../entities/category'
import { fetchAllLatestAttempts } from '../../../entities/quiz-attempt'
import { useAuth } from '../../../entities/user'
import { Spinner } from '../../../shared/ui/Spinner/Spinner'
import './CategoriesPage.css'

export function CategoriesPage() {
  const { user, profile } = useAuth()
  const [attempts, setAttempts] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let isMounted = true
    fetchAllLatestAttempts(
      user.uid,
      TOPICS.map((t) => t.id),
    )
      .then((data) => {
        if (isMounted) setAttempts(data)
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [user])

  const displayName = profile?.displayName || user?.displayName || 'Foydalanuvchi'

  return (
    <div className="page-shell">
      <CategoriesNav />

      <div className="container categories-page">
        <div className="categories-header">
          <div>
            <h1>
              Xush kelibsiz, <span className="gradient-text">{displayName}</span>
            </h1>
            <p>O'rganishni davom ettirish uchun mavzuni tanlang.</p>
          </div>
        </div>

        {loading ? (
          <div className="categories-loading">
            <Spinner label="Statistika yuklanmoqda..." />
          </div>
        ) : (
          <>
            <div className="topics-grid">
              {TOPICS.map((topic) => (
                <CategoryCard key={topic.id} topic={topic} latestAttempt={attempts[topic.id]} />
              ))}
            </div>

            <h2 className="coming-soon-title">Tez kunda qo'shiladi</h2>
            <div className="topics-grid">
              {COMING_SOON.map((topic) => (
                <ComingSoonCard key={topic.id} topic={topic} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
