import { BrowserRouter } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { AuthProvider } from '../entities/user'
import { QuizStartProvider } from '../widgets/quiz-start'
import { LoginModalProvider } from '../widgets/login-modal'
import { AppRouter } from './providers/AppRouter'
import { theme } from './theme'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import './styles/variables.css'
import './styles/reset.css'
import './styles/global.css'

export function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications position="top-right" />
      <AuthProvider>
        <BrowserRouter>
          <LoginModalProvider>
            <QuizStartProvider>
              <AppRouter />
            </QuizStartProvider>
          </LoginModalProvider>
        </BrowserRouter>
      </AuthProvider>
    </MantineProvider>
  )
}
