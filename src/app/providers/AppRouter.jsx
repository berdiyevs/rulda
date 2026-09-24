import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Center } from '@mantine/core'
import { Spinner } from '../../shared/ui/Spinner/Spinner'
// Landing sahifasi darhol yuklanadi (birinchi ekran), qolganlari kerak bo'lganda.
import { LandingPage } from '../../pages/landing'
import { ProtectedRoute } from './ProtectedRoute'
import { AdminRoute } from './AdminRoute'
import { ROUTES } from '../../shared/config/routes'

const CategoriesPage = lazy(() => import('../../pages/categories').then((m) => ({ default: m.CategoriesPage })))
const QuizPage = lazy(() => import('../../pages/quiz').then((m) => ({ default: m.QuizPage })))
const RoadSignsPage = lazy(() => import('../../pages/road-signs').then((m) => ({ default: m.RoadSignsPage })))
const TicketsPage = lazy(() => import('../../pages/tickets').then((m) => ({ default: m.TicketsPage })))
const StatisticsPage = lazy(() => import('../../pages/statistics').then((m) => ({ default: m.StatisticsPage })))
const PremiumPage = lazy(() => import('../../pages/premium').then((m) => ({ default: m.PremiumPage })))
const TermsPage = lazy(() => import('../../pages/terms').then((m) => ({ default: m.TermsPage })))
const PrivacyPage = lazy(() => import('../../pages/privacy').then((m) => ({ default: m.PrivacyPage })))
const VerifyEmailPage = lazy(() => import('../../pages/verify-email').then((m) => ({ default: m.VerifyEmailPage })))
const AdminPage = lazy(() => import('../../pages/admin').then((m) => ({ default: m.AdminPage })))
const NotFoundPage = lazy(() => import('../../pages/not-found').then((m) => ({ default: m.NotFoundPage })))


export function AppRouter() {
  return (
    <Suspense
      fallback={
        <Center mih="60vh">
          <Spinner />
        </Center>
      }
    >
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
    </Suspense>
  )
}
