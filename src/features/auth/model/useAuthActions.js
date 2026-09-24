import { useNavigate } from 'react-router-dom'
import { notifications } from '@mantine/notifications'
import { apiFetch } from '../../../shared/api/client'
import { getGoogleAccessToken } from '../../../shared/api/googleAuth'
import { useAuth } from '../../../entities/user'
import { ROUTES } from '../../../shared/config/routes'

// redirectTo: berilmasa /categories ga o'tadi, `false` bo'lsa joyida qoladi, satr bo'lsa o'sha manzilga o'tadi.
export function useAuthActions({ redirectTo } = {}) {
  const navigate = useNavigate()
  const { login } = useAuth()

  const goAfterLogin = () => {
    if (redirectTo === false) return
    navigate(redirectTo || ROUTES.CATEGORIES)
  }

  const signUpWithEmail = async ({ name, email, password }) => {
    if (!email || !password || !name) {
      notifications.show({
        color: 'danger',
        title: "To'ldirilmagan maydonlar",
        message: "Iltimos, ism, email va parolni to'ldiring!",
      })
      return
    }

    try {
      const result = await apiFetch('/auth/signup', {
        method: 'POST',
        body: { name, email, password },
        auth: false,
      })

      notifications.show({
        color: 'success',
        title: "Ro'yxatdan o'tdingiz",
        message: result.dev_verification_url
          ? `Tasdiqlash havolasi: ${result.dev_verification_url}`
          : 'Tasdiqlash xati yuborildi. Iltimos, pochtangizni tekshiring.',
        autoClose: result.dev_verification_url ? false : 5000,
      })
    } catch (error) {
      notifications.show({
        color: 'danger',
        title: "Ro'yxatdan o'tishda xatolik",
        message: error.message,
      })
    }
  }

  const loginWithEmail = async ({ email, password }) => {
    try {
      const result = await apiFetch('/auth/login', {
        method: 'POST',
        body: { email, password },
        auth: false,
      })
      await login(result.access_token)
      goAfterLogin()
      return true
    } catch (error) {
      if (error.message.includes('tasdiqlang')) {
        notifications.show({
          color: 'warning',
          title: 'Email tasdiqlanmagan',
          message: 'Avval emailingizni tasdiqlang!',
        })
      } else {
        notifications.show({
          color: 'danger',
          title: 'Kirishda xatolik',
          message: "Email yoki parol noto'g'ri!",
        })
      }
    }
    return false
  }

  const loginWithGoogle = async () => {
    try {
      const accessToken = await getGoogleAccessToken()
      const result = await apiFetch('/auth/google', {
        method: 'POST',
        body: { access_token: accessToken },
        auth: false,
      })
      await login(result.access_token)
      goAfterLogin()
      return true
    } catch (error) {
      console.error('Google xatosi:', error)
    }
    return false
  }

  return { signUpWithEmail, loginWithEmail, loginWithGoogle }
}
