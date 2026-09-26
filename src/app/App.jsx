import { BrowserRouter } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { AuthProvider } from '../entities/user'
import { AttemptsProvider } from '../entities/quiz-attempt'
import { QuizStartProvider } from '../widgets/quiz-start'
import { LoginModalProvider } from '../widgets/login-modal'
import { CookieBanner } from '../widgets/cookie-banner'
import { GuestAttemptsSync } from '../features/guest-sync'
import { AppRouter } from './providers/AppRouter'
import { RouteTracker } from './providers/RouteTracker'
import { SeoManager } from './providers/SeoManager'
import { theme } from './theme'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import './styles/variables.css'
import './styles/reset.css'
import './styles/global.css'

export function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications position="top-right" zIndex={20000} />
      <AuthProvider>
        <GuestAttemptsSync />
        <AttemptsProvider>
        <BrowserRouter>
          <RouteTracker />
          <SeoManager />
          <LoginModalProvider>
            <QuizStartProvider>
              <AppRouter />
              <CookieBanner />
            </QuizStartProvider>
          </LoginModalProvider>
        </BrowserRouter>
        </AttemptsProvider>
      </AuthProvider>
    </MantineProvider>
  )
}
