import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Navbar } from '../../../widgets/navbar'
import { LoginModal } from '../../../widgets/login-modal'
import { Footer } from '../../../widgets/footer'
import { Button } from '../../../shared/ui/Button/Button'
import { Badge } from '../../../shared/ui/Badge/Badge'
import { useAuth } from '../../../entities/user'
import { ROUTES } from '../../../shared/config/routes'
import './LandingPage.css'

const STATS = [
  { value: '600+', label: 'Rasmiy savollar' },
  { value: '93', label: "Yo'l belgilari" },
  { value: '24/7', label: 'Istalgan vaqtda mashq' },
]

const FEATURES = [
  {
    icon: '🎯',
    title: "Real imtihon formati",
    text: '20 ta savol, 20 daqiqa, maksimal 2 ta xato — DAN imtihoniga aynan o\'xshash sharoit.',
  },
  {
    icon: '🖼️',
    title: "Rasmli savollar",
    text: "Yo'l belgilarini haqiqiy rasmlar orqali o'rganing va eslab qoling.",
  },
  {
    icon: '📊',
    title: 'Progress kuzatuvi',
    text: "Har bir urinishingiz saqlanadi — qayerda ko'proq mashq qilish kerakligini bilib boring.",
  },
]

export function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { user, isVerified, isAuthReady } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.state?.requireAuth) {
      setIsModalOpen(true)
    }
  }, [location.state])

  const handlePracticeClick = () => {
    if (!isAuthReady) return
    if (user && isVerified) {
      navigate(ROUTES.CATEGORIES)
    } else if (user && !isVerified) {
      alert("Iltimos, avval emailingizni tasdiqlang. Tasdiqlash xati emailingizga yuborilgan.")
    } else {
      setIsModalOpen(true)
    }
  }

  return (
    <>
      <Navbar onOpenModal={() => setIsModalOpen(true)} />
      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <main className="page-shell">
        <section className="hero">
          <div className="container hero-inner">
            <Badge variant="primary">✦ 2026 test bazasi yangilandi</Badge>
            <h1 className="hero-title">
              Haydovchilik guvohnomasini <span className="gradient-text">birinchi urinishda</span> oling
            </h1>
            <p className="hero-text">
              O'zbekiston yo'l harakati qoidalarini interaktiv testlar orqali o'rganing. Rasmiy DAN
              savollar bazasi, real imtihon rejimi va shaxsiy progress kuzatuvi bilan.
            </p>
            <div className="hero-actions">
              <Button variant="primary" size="lg" onClick={handlePracticeClick}>
                Mashq qilishni boshlash
              </Button>
              <Button variant="secondary" size="lg" onClick={handlePracticeClick}>
                Imtihonni sinab ko'rish
              </Button>
            </div>

            <div className="hero-stats">
              {STATS.map((s) => (
                <div key={s.label} className="hero-stat">
                  <span className="stat-value gradient-text">{s.value}</span>
                  <span className="stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="features">
          <div className="container">
            <h2 className="section-title">Nega aynan Rulda?</h2>
            <div className="features-grid">
              {FEATURES.map((f) => (
                <div className="feature-card glass-card" key={f.title}>
                  <div className="feature-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cta">
          <div className="container cta-inner glass-card">
            <h2>Bugundan boshlang</h2>
            <p>Bepul ro'yxatdan o'ting va zaif tomonlaringizni aniqlashtiring.</p>
            <Button variant="primary" size="lg" onClick={handlePracticeClick}>
              Hoziroq boshlash
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
