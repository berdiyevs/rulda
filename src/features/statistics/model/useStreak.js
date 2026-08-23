import { useEffect, useState } from 'react'
import { fetchAllAttempts, computeStreak } from '../../../entities/quiz-attempt'
import { useAuth } from '../../../entities/user'

export function useStreak() {
  const { user } = useAuth()
  const [streak, setStreak] = useState(null)

  useEffect(() => {
    if (!user) return
    let isMounted = true

    fetchAllAttempts(user.uid)
      .then((attempts) => {
        if (isMounted) setStreak(computeStreak(attempts))
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [user])

  return streak
}
