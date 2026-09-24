import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../user'
import { fetchAllAttempts } from '../api/attemptsApi'

const AttemptsContext = createContext({
  attempts: [],
  loading: false,
  refresh: async () => [],
})

// Tizimga kirgan foydalanuvchining urinishlari bir marta yuklanadi va test tugagach yangilanadi.
// Menyudagi seriya, asosiy sahifa va biletlar sahifasi shu yerdan foydalanadi.
export function AttemptsProvider({ children }) {
  const { user } = useAuth()
  const uid = user?.uid
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!uid) return []
    try {
      const data = await fetchAllAttempts()
      setAttempts(data)
      return data
    } catch {
      return null
    }
  }, [uid])

  useEffect(() => {
    if (!uid) {
      setAttempts([])
      setLoading(false)
      return
    }
    let isMounted = true
    setLoading(true)
    refresh().finally(() => {
      if (isMounted) setLoading(false)
    })
    return () => {
      isMounted = false
    }
  }, [uid, refresh])

  const value = useMemo(() => ({ attempts, loading, refresh }), [attempts, loading, refresh])
  return <AttemptsContext.Provider value={value}>{children}</AttemptsContext.Provider>
}

export function useAttempts() {
  return useContext(AttemptsContext)
}
