import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Spinner } from '../../../shared/ui/Spinner/Spinner'
import { Button } from '../../../shared/ui/Button/Button'
import { apiFetch } from '../../../shared/api/client'
import { ROUTES } from '../../../shared/config/routes'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState('loading')
  const requestedRef = useRef(null)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      return
    }
    if (requestedRef.current === token) return
    requestedRef.current = token

    apiFetch('/auth/verify-email', { method: 'POST', body: { token }, auth: false })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [token])

  if (status === 'loading') {
    return (
      <div className="center-screen">
        <Spinner label="Email tekshirilmoqda..." />
      </div>
    )
  }

  return (
    <div className="center-screen">
      <span style={{ fontSize: 56 }}>{status === 'success' ? '✅' : '⚠️'}</span>
      <h1 style={{ fontSize: '1.8rem' }}>
        {status === 'success' ? 'Email tasdiqlandi' : 'Havola yaroqsiz'}
      </h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: 380 }}>
        {status === 'success'
          ? 'Endi tizimga kirishingiz mumkin.'
          : 'Tasdiqlash havolasi eskirgan yoki noto\'g\'ri. Qaytadan ro\'yxatdan o\'ting.'}
      </p>
      <Button as={Link} to={ROUTES.HOME} variant="primary">
        Bosh sahifaga qaytish
      </Button>
    </div>
  )
}
