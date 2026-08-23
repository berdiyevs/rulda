import { createContext, useCallback, useContext, useState } from 'react'
import { QuizStartModal } from '../ui/QuizStartModal'

const QuizStartContext = createContext(null)

export function QuizStartProvider({ children }) {
  const [config, setConfig] = useState(null)
  const [seq, setSeq] = useState(0)

  const open = useCallback((cfg) => {
    setConfig(cfg)
    setSeq((s) => s + 1)
  }, [])

  const close = useCallback(() => setConfig(null), [])

  return (
    <QuizStartContext.Provider value={open}>
      {children}
      <QuizStartModal key={seq} config={config} onClose={close} />
    </QuizStartContext.Provider>
  )
}

export function useQuizStart() {
  const open = useContext(QuizStartContext)
  if (!open) throw new Error('useQuizStart must be used within QuizStartProvider')
  return open
}
