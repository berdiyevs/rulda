import { useEffect, useRef, useState } from 'react'

export function useCountdown(totalSeconds, { onExpire, autoStart = false } = {}) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const [isRunning, setIsRunning] = useState(autoStart)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    if (!isRunning) return
    if (secondsLeft <= 0) {
      setIsRunning(false)
      onExpireRef.current?.()
      return
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [isRunning, secondsLeft])

  const start = () => setIsRunning(true)
  const stop = () => setIsRunning(false)
  const reset = (seconds = totalSeconds) => setSecondsLeft(seconds)

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return { secondsLeft, formatted, isRunning, start, stop, reset }
}
