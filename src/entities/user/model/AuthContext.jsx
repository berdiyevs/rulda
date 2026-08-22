import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../../../shared/api/firebase'

const AuthContext = createContext({ user: null, profile: null, loading: true })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribeAuth
  }, [])

  useEffect(() => {
    if (!user) {
      setProfile(null)
      return
    }
    const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      setProfile(snap.exists() ? snap.data() : null)
    })
    return unsubscribeProfile
  }, [user])

  const isAuthReady = !loading
  const isVerified = Boolean(user?.emailVerified)

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAuthReady, isVerified }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
