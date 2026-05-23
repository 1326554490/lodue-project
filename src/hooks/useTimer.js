import { useEffect, useState } from 'react'

export function useTimer(initialSeconds = 0) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return undefined
    const id = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(id)
  }, [running])

  return {
    seconds,
    running,
    setSeconds,
    reset: () => setSeconds(0),
    toggle: () => setRunning((value) => !value),
    stop: () => setRunning(false),
  }
}
