import { useEffect, useRef, useState } from 'react'

export function useCursorPhysics() {
  const [pos, setPos] = useState({ x: -200, y: -200 })
  const [tilt, setTilt] = useState(0)
  const velX = useRef(0)
  const lastX = useRef(null)
  const tiltRef = useRef(0)
  const rafRef = useRef(null)

  useEffect(() => {
    function onMove(e) {
      const x = e.clientX
      const y = e.clientY
      if (lastX.current !== null) {
        velX.current = x - lastX.current
      }
      lastX.current = x
      setPos({ x, y })
    }

    function decay() {
      const target = Math.max(-15, Math.min(15, velX.current * 1.5))
      tiltRef.current += (target - tiltRef.current) * 0.12
      velX.current *= 0.85
      setTilt(tiltRef.current)
      rafRef.current = requestAnimationFrame(decay)
    }

    window.addEventListener('mousemove', onMove)
    rafRef.current = requestAnimationFrame(decay)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return { pos, tilt }
}
