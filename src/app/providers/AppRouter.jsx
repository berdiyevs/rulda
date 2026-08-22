import { Routes, Route } from 'react-router-dom'
import { LandingPage } from '../../pages/landing'
import { CategoriesPage } from '../../pages/categories'
import { QuizPage } from '../../pages/quiz'
import { RoadSignsPage } from '../../pages/road-signs'
import { NotFoundPage } from '../../pages/not-found'
import { ProtectedRoute } from './ProtectedRoute'
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
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
