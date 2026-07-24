import { useEffect, useRef, useState } from 'react'

export function useCursorPhysics() {
  const [pos, setPos] = useState({ x: -200, y: -200 })
  const [tilt, setTilt] = useState(0)
  const [scale, setScale] = useState({ x: 1, y: 1 })
  const velX = useRef(0)
  const velY = useRef(0)
  const lastX = useRef(null)
  const lastY = useRef(null)
  const tiltRef = useRef(0)
  const scaleRef = useRef({ x: 1, y: 1 })
  const idleFrames = useRef(0)
  const rafRef = useRef(null)

  useEffect(() => {
    function onMove(e) {
      const x = e.clientX
      const y = e.clientY
      if (lastX.current !== null) {
        velX.current = x - lastX.current
        velY.current = y - lastY.current
      }
      lastX.current = x
      lastY.current = y
      idleFrames.current = 0
      setPos({ x, y })
    }

    function decay() {
      const target = Math.max(-15, Math.min(15, velX.current * 1.5))
      tiltRef.current += (target - tiltRef.current) * 0.12
      velX.current *= 0.85

      // vertical speed squashes/stretches the cursor slightly (springy feel)
      const speedY = Math.max(-1, Math.min(1, velY.current * 0.15))
      const targetScaleY = 1 - speedY * 0.12
      const targetScaleX = 1 + speedY * 0.06
      velY.current *= 0.85

      idleFrames.current += 1
      // subtle idle "breathing" wobble once the pointer has been still a moment
      const idleWobble = idleFrames.current > 30
        ? Math.sin(idleFrames.current * 0.05) * 0.015
        : 0

      scaleRef.current = {
        x: scaleRef.current.x + (targetScaleX + idleWobble - scaleRef.current.x) * 0.15,
        y: scaleRef.current.y + (targetScaleY - idleWobble - scaleRef.current.y) * 0.15,
      }

      setTilt(tiltRef.current)
      setScale({ x: scaleRef.current.x, y: scaleRef.current.y })
      rafRef.current = requestAnimationFrame(decay)
    }

    window.addEventListener('mousemove', onMove)
    rafRef.current = requestAnimationFrame(decay)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return { pos, tilt, scale }
}
