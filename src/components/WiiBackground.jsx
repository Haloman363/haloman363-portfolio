import { useEffect, useRef } from 'react'
import styles from './WiiBackground.module.css'

function makestar(w, h) {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    r: 0.5 + Math.random() * 1.8,
    alpha: 0.3 + Math.random() * 0.7,
    twinkleSpeed: 0.01 + Math.random() * 0.03,
    twinkleOffset: Math.random() * Math.PI * 2,
  }
}

export default function WiiBackground({ darkMode }) {
  const canvasRef = useRef(null)
  const darkRef = useRef(darkMode)
  darkRef.current = darkMode

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf
    let stars = []
    let t = 0

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      stars = Array.from({ length: 180 }, () => makestar(canvas.width, canvas.height))
    }

    function draw() {
      const { width: w, height: h } = canvas
      t += 1

      if (darkRef.current) {
        // Starfield: deep space gradient
        const grad = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.8)
        grad.addColorStop(0, '#0d1b3e')
        grad.addColorStop(0.5, '#060d24')
        grad.addColorStop(1, '#020510')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, w, h)

        // Nebula wisps
        const nebula = ctx.createRadialGradient(w * 0.3, h * 0.3, 0, w * 0.3, h * 0.3, w * 0.35)
        nebula.addColorStop(0, 'rgba(80,40,160,0.08)')
        nebula.addColorStop(1, 'rgba(80,40,160,0)')
        ctx.fillStyle = nebula
        ctx.fillRect(0, 0, w, h)

        const nebula2 = ctx.createRadialGradient(w * 0.75, h * 0.6, 0, w * 0.75, h * 0.6, w * 0.3)
        nebula2.addColorStop(0, 'rgba(20,80,160,0.07)')
        nebula2.addColorStop(1, 'rgba(20,80,160,0)')
        ctx.fillStyle = nebula2
        ctx.fillRect(0, 0, w, h)

        // Stars
        for (const s of stars) {
          const twinkle = s.alpha * (0.6 + 0.4 * Math.sin(t * s.twinkleSpeed + s.twinkleOffset))
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,255,255,${twinkle})`
          ctx.fill()
        }
      } else {
        // Light mode: original bg-pattern is handled by CSS, canvas is transparent
        ctx.clearRect(0, 0, w, h)
      }

      raf = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <>
      {/* CSS bg-pattern tile for light mode */}
      <div className={`${styles.bg} ${darkMode ? styles.bgHidden : ''}`} aria-hidden="true" />
      {/* Canvas for dark mode starfield (always mounted, only draws when dark) */}
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
    </>
  )
}
