import { useState } from 'react'
import { Modal } from '../../../shared/ui/Modal/Modal'
import { Button } from '../../../shared/ui/Button/Button'
import { useAuthActions } from '../../../features/auth'
import './LoginModal.css'

export function LoginModal({ isOpen, onClose }) {
  const [tab, setTab] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { signUpWithEmail, loginWithEmail, loginWithGoogle } = useAuthActions()

  const clearInputs = () => {
    setName('')
    setEmail('')
    setPassword('')
  }

  const handleClose = () => {
    clearInputs()
    setTab('login')
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (tab === 'login') {
        await loginWithEmail({ email, password })
      } else {
        await signUpWithEmail({ name, email, password })
        setTab('login')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogle = async () => {
    setSubmitting(true)
    try {
      await loginWithGoogle()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth={400}>
      <div className="login-modal">
        <div className="login-logo">
          <span>Rul</span>da
        </div>

        <div className="login-tabs">
          <button className={tab === 'login' ? 'active' : ''} onClick={() => setTab('login')}>
            Kirish
          </button>
          <button className={tab === 'signup' ? 'active' : ''} onClick={() => setTab('signup')}>
            Ro'yxatdan o'tish
          </button>
        </div>

        <p className="login-subtitle">
          {tab === 'login'
            ? 'Mavzular va testlarga kirish uchun tizimga kiring'
            : "Bepul hisob yaratib, o'rganishni boshlang"}
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          {tab === 'signup' && (
            <div className="input-group">
              <i className="input-icon bi bi-person"></i>
              <input
                className="custom-input"
                type="text"
                placeholder="Ismingiz"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="input-group">
            <i className="input-icon bi bi-envelope"></i>
            <input
              className="custom-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <i className="input-icon bi bi-lock"></i>
            <input
              className="custom-input"
              type="password"
              placeholder="Parol"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <Button type="submit" variant="primary" fullWidth disabled={submitting}>
            {submitting ? 'Iltimos kuting...' : tab === 'login' ? 'Kirish' : "Ro'yxatdan o'tish"}
          </Button>
        </form>

        <div className="divider">
          <span>yoki</span>
        </div>

        <Button variant="secondary" fullWidth onClick={handleGoogle} disabled={submitting} className="btn-google">
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.09-1.8 2.73v2.27h2.92c1.7-1.57 2.68-3.88 2.68-6.64z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.27c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34C2.44 15.98 5.48 18 9 18z" />
            <path fill="#FBBC05" d="M3.97 10.71c-.18-.54-.28-1.11-.28-1.71s.1-1.17.28-1.71V4.95H.96C.35 6.17 0 7.55 0 9s.35 2.83.96 4.05l3.01-2.34z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.95l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z" />
          </svg>
          Google bilan davom etish
        </Button>
      </div>
    </Modal>
  )
}
