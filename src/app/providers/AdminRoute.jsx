import { Navigate } from 'react-router-dom'
import { useAuth } from '../../entities/user'
import { Spinner } from '../../shared/ui/Spinner/Spinner'
import { ROUTES } from '../../shared/config/routes'

export function AdminRoute({ children }) {
  const { user, isAuthReady, isAdmin } = useAuth()

  if (!isAuthReady) {
    return (
      <div className="center-screen">
        <Spinner label="Tekshirilmoqda..." />
      </div>
    )
  }

  if (!user || !isAdmin) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return children
}
