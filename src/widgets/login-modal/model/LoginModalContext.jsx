import { createContext, useCallback, useContext, useState } from 'react'
import { LoginModal } from '../ui/LoginModal'

const LoginModalContext = createContext(null)

// Kirish oynasini istalgan sahifadan ochish uchun: openLogin({ title, redirectTo }).
export function LoginModalProvider({ children }) {
  const [state, setState] = useState({ isOpen: false, title: null, redirectTo: undefined })
  const [seq, setSeq] = useState(0)

  const open = useCallback((config = {}) => {
    setState({ isOpen: true, title: config.title ?? null, redirectTo: config.redirectTo })
    setSeq((s) => s + 1)
  }, [])

  const close = useCallback(() => setState((prev) => ({ ...prev, isOpen: false })), [])

  return (
    <LoginModalContext.Provider value={open}>
      {children}
      <LoginModal
        key={seq}
        isOpen={state.isOpen}
        title={state.title}
        redirectTo={state.redirectTo}
        onClose={close}
      />
    </LoginModalContext.Provider>
  )
}

export function useLoginModal() {
  const open = useContext(LoginModalContext)
  if (!open) throw new Error('useLoginModal must be used within LoginModalProvider')
  return open
}
