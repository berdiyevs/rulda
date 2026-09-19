import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { apiFetch, clearToken, getToken, setToken } from '../../../shared/api/client'

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  isAuthReady: false,
  isVerified: false,
  isAdmin: false,
  isPremiumActive: false,
  login: async () => {},
  logout: () => {},
  refreshProfile: async () => {},
})

function toUser(record) {
  if (!record) return null
  return {
    uid: record.id,
    email: record.email,
    displayName: record.display_name,
    emailVerified: record.is_verified,
  }
}

function toProfile(record) {
  if (!record) return null
  return {
    displayName: record.display_name,
    email: record.email,
    examDate: record.exam_date,
    createdAt: record.created_at,
    isAdmin: record.is_admin,
    isPremium: record.is_premium,
    isPremiumActive: record.is_premium_active,
    premiumUntil: record.premium_until,
  }
}

export function AuthProvider({ children }) {
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    if (!getToken()) {
      setRecord(null)
      return
    }
    try {
      const data = await apiFetch('/auth/me')
      setRecord(data)
    } catch {
      clearToken()
      setRecord(null)
    }
  }, [])

  useEffect(() => {
    refreshProfile().finally(() => setLoading(false))
  }, [refreshProfile])

  const login = useCallback(
    async (token) => {
      setToken(token)
      await refreshProfile()
    },
    [refreshProfile],
  )

  const logout = useCallback(() => {
    clearToken()
    setRecord(null)
  }, [])

  const user = toUser(record)
  const profile = toProfile(record)
  const isAuthReady = !loading
  const isVerified = Boolean(user?.emailVerified)
  const isAdmin = Boolean(profile?.isAdmin)
  const isPremiumActive = Boolean(profile?.isPremiumActive)

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAuthReady,
        isVerified,
        isAdmin,
        isPremiumActive,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
