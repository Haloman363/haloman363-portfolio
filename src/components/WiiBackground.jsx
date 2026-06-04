import { useEffect, useRef } from 'react'
import styles from './WiiBackground.module.css'

const BUBBLE_COUNT = 25

function makeBubble(w, h) {
  const r = 4 + Math.random() * 28
  return {
    x: Math.random() * w,
    y: h + r + Math.random() * h,
    r,
    speed: 0.2 + Math.random() * 0.5,
    drift: (Math.random() - 0.5) * 0.3,
    alpha: 0.08 + Math.random() * 0.12,
  }
}

export default function WiiBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf
    let bubbles = []

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      bubbles = Array.from({ length: BUBBLE_COUNT }, () =>
        makeBubble(canvas.width, canvas.height)
      )
    }

    function drawBackground() {
      const { width: w, height: h } = canvas
      const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.75)
      grad.addColorStop(0, '#3d8fc4')
      grad.addColorStop(0.5, '#1a6ca8')
      grad.addColorStop(1, '#8ec8e8')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)
    }

    function drawBubble(b) {
      const grad = ctx.createRadialGradient(
        b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.1,
        b.x, b.y, b.r
      )
      grad.addColorStop(0, `rgba(255,255,255,${b.alpha * 2.5})`)
      grad.addColorStop(0.6, `rgba(255,255,255,${b.alpha})`)
      grad.addColorStop(1, `rgba(255,255,255,0)`)
      ctx.beginPath()
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()
    }

    function tick() {
      const { width: w, height: h } = canvas
      drawBackground()
      for (const b of bubbles) {
        b.y -= b.speed
        b.x += b.drift
        if (b.y + b.r < 0) {
          Object.assign(b, makeBubble(w, h))
          b.y = h + b.r
        }
        drawBubble(b)
      }
      raf = requestAnimationFrame(tick)
    }

    resize()
    tick()
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className={styles.canvas} />
}
