import { Routes, Route } from 'react-router-dom'
import { LandingPage } from '../../pages/landing'
import { CategoriesPage } from '../../pages/categories'
import { QuizPage } from '../../pages/quiz'
import { RoadSignsPage } from '../../pages/road-signs'
import { TicketsPage } from '../../pages/tickets'
import { StatisticsPage } from '../../pages/statistics'
import { PremiumPage } from '../../pages/premium'
import { TermsPage } from '../../pages/terms'
import { PrivacyPage } from '../../pages/privacy'
import { VerifyEmailPage } from '../../pages/verify-email'
import { AdminPage } from '../../pages/admin'
import { NotFoundPage } from '../../pages/not-found'
import { ProtectedRoute } from './ProtectedRoute'
import { AdminRoute } from './AdminRoute'
import { ROUTES } from '../../shared/config/routes'

export function AppRouter() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<LandingPage />} />
      <Route
        path={ROUTES.CATEGORIES}
        element={
          <ProtectedRoute>
            <CategoriesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.QUIZ}
        element={
          <ProtectedRoute>
            <QuizPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ROAD_SIGNS}
        element={
          <ProtectedRoute>
            <RoadSignsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.TICKETS}
        element={
          <ProtectedRoute>
            <TicketsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.STATISTICS}
        element={
          <ProtectedRoute>
            <StatisticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PREMIUM}
        element={
          <ProtectedRoute>
            <PremiumPage />
          </ProtectedRoute>
        }
      />
      <Route path={ROUTES.TERMS} element={<TermsPage />} />
      <Route path={ROUTES.PRIVACY} element={<PrivacyPage />} />
      <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
      <Route
        path={ROUTES.ADMIN}
        element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
