import { useLayoutEffect, useRef, useState } from 'react'
import { useCursorPhysics } from '../hooks/useCursorPhysics'
import styles from './WiiCursor.module.css'

// Hotspot (pointer tip) as a fraction of the cursor image's rendered size —
// matches the tip position within cursor.png regardless of clamp()'d size.
const HOTSPOT_X = 20 / 65
const HOTSPOT_Y = 8 / 91

export default function WiiCursor() {
  const { pos, tilt, scale } = useCursorPhysics()
  const elRef = useRef(null)
  const [hotspot, setHotspot] = useState({ x: 20, y: 8 })

  useLayoutEffect(() => {
    function measure() {
      const el = elRef.current
      if (!el) return
      const { width, height } = el.getBoundingClientRect()
      setHotspot({ x: width * HOTSPOT_X, y: height * HOTSPOT_Y })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  return (
    <div
      ref={elRef}
      className={styles.cursor}
      style={{
        transform: `translate(${pos.x - hotspot.x}px, ${pos.y - hotspot.y}px) rotate(${tilt}deg)`,
        transformOrigin: `${hotspot.x}px ${hotspot.y}px`,
      }}
    >
      <img
        src={`${import.meta.env.BASE_URL}wii/sprites/cursor.png`}
        alt=""
        aria-hidden="true"
        style={{ transform: `scale(${scale.x}, ${scale.y})`, transformOrigin: `${hotspot.x}px ${hotspot.y}px` }}
      />
    </div>
  )
}
