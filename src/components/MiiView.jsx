import { useEffect, useRef, useState } from 'react'
import styles from './MiiView.module.css'
import { webgl } from '../mii3d/webgl'

// Draws the Mii from useAliveMii as a live 3D model, or as the 2D renderer PNG when WebGL
// or the glTF is unavailable. three.js loads on demand so it stays out of the main bundle.
export default function MiiView({ mii, className = '', alt = '', ...rest }) {
  const [fallback, setFallback] = useState(!webgl)
  const canvas = useRef(null)
  const scene = useRef(null)
  const { face, asleep, walkDir, pose, ref } = mii

  useEffect(() => {
    if (fallback) return undefined
    let dead = false
    import('../mii3d/miiScene').then(({ createMiiScene }) => {
      if (dead) return
      const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      const s = createMiiScene(canvas.current, { calm })
      scene.current = s
      s.ready.catch(() => !dead && setFallback(true))
    }).catch(() => !dead && setFallback(true))
    return () => { dead = true; scene.current?.dispose(); scene.current = null }
  }, [fallback])

  useEffect(() => { scene.current?.set({ expression: face, asleep, walkDir, pose }) }, [face, asleep, walkDir, pose, fallback])

  // Head follows the pointer smoothly (the hook's bucketed yaw is only for the 2D frames).
  useEffect(() => {
    if (fallback) return undefined
    const onMove = e => {
      const r = ref.current?.getBoundingClientRect()
      if (!r) return
      const k = v => Math.max(-1, Math.min(1, v))
      scene.current?.set({ look: {
        x: k((e.clientX - (r.left + r.width / 2)) / (window.innerWidth * 0.3)),
        y: k((e.clientY - (r.top + r.height * 0.2)) / (window.innerHeight * 0.3)),
      } })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [fallback, ref])

  if (fallback) return <img {...mii.imgProps} className={className} alt={alt} aria-hidden={alt ? undefined : 'true'} {...rest} />
  return (
    <div ref={ref} className={`${styles.view} ${className}`} role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : 'true'} {...rest}>
      <canvas ref={canvas} className={styles.canvas} />
    </div>
  )
}
