import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../entities/user'
import { Spinner } from '../../shared/ui/Spinner/Spinner'
import { ROUTES } from '../../shared/config/routes'

export function ProtectedRoute({ children, reason }) {
  const { user, isAuthReady, isVerified } = useAuth()
  const location = useLocation()

  if (!isAuthReady) {
    return (
      <div className="center-screen">
        <Spinner label="Tekshirilmoqda..." />
      </div>
    )
  }

  if (!user || !isVerified) {
    return <Navigate to={ROUTES.HOME} state={{ from: location, requireAuth: true, reason }} replace />
  }

  return children
}
