import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../entities/user'
import { AppRouter } from './providers/AppRouter'
import './styles/variables.css'
import './styles/reset.css'
import './styles/global.css'

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  )
}
