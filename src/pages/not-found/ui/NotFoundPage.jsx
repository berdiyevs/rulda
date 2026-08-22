import { Link } from 'react-router-dom'
import { Button } from '../../../shared/ui/Button/Button'
import { ROUTES } from '../../../shared/config/routes'

export function NotFoundPage() {
  return (
    <div className="center-screen">
      <span style={{ fontSize: 56 }}>🧭</span>
      <h1 style={{ fontSize: '1.8rem' }}>Sahifa topilmadi</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: 380 }}>
        Siz qidirgan sahifa mavjud emas yoki ko'chirilgan bo'lishi mumkin.
      </p>
      <Button as={Link} to={ROUTES.HOME} variant="primary">
        Bosh sahifaga qaytish
      </Button>
    </div>
  )
}
