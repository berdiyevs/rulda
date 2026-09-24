import { useEffect } from 'react'
import { notifications } from '@mantine/notifications'
import { useAuth } from '../../../entities/user'
import { syncGuestAttempts } from '../../../entities/quiz-attempt'

// Foydalanuvchi tizimga kirgach, mehmon sifatida yechgan natijalarini hisobiga ko'chiradi.
export function GuestAttemptsSync() {
  const { user, isVerified } = useAuth()

  useEffect(() => {
    if (!user || !isVerified) return
    syncGuestAttempts().then((saved) => {
      if (saved > 0) {
        notifications.show({
          color: 'success',
          title: 'Natijangiz saqlandi',
          message: "Mehmon sifatida yechgan testlaringiz hisobingizga qo'shildi.",
        })
      }
    })
  }, [user, isVerified])

  return null
}
