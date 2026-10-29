import { useCallback, useEffect, useRef, useState } from 'react'
import { miiURL } from '../data/mii'
import { webgl } from '../mii3d/webgl'
import { ACTS } from '../mii3d/poses'

// Shared "alive" behaviour for every renderer-backed Mii: idle blink, head turn toward the
// pointer, going to sleep when the visitor is idle, and short mood reactions.
// The renderer only serves still frames, so each state is a different PNG; the few
// frames used every time are preloaded and the rest load on first use (~0.1s).
export const YAWS = [-24, -12, 0, 12, 24]
const SLEEP_AFTER = 30000
const FALLBACK = `${import.meta.env.BASE_URL}wii/sprites/mii-fullbody.png`

const calm = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const preloaded = new Set()
const preload = (e, yaw) => {
  const url = miiURL(e, yaw)
  if (!preloaded.has(url)) { preloaded.add(url); new Image().src = url }
}

// base: resting expression. look: turn toward the pointer. forcedYaw: caller-driven yaw
// (e.g. while walking); null hands control back to the pointer.
export default function useAliveMii({ base = 'normal', look = true, forcedYaw = null } = {}) {
  const ref = useRef(null)
  const [blink, setBlink] = useState(false)
  const [mood, setMood] = useState(null)
  const [yaw, setYaw] = useState(0)
  const [asleep, setAsleep] = useState(false)
  const [failed, setFailed] = useState(false)
  const [pose, setPose] = useState(null)
  const reactTimer = useRef()
  const poseTimer = useRef()

  useEffect(() => {
    if (calm() || webgl) return // 3D draws its own frames
    YAWS.forEach(y => preload(base, y))
    preload('smile', 0)
    preload('blink', 0)
  }, [base])

  // Idle blink; asleep keeps the eyes shut instead.
  useEffect(() => {
    if (asleep || calm()) return undefined
    let t
    const loop = () => {
      t = setTimeout(() => {
        setBlink(true)
        t = setTimeout(() => { setBlink(false); loop() }, 150)
      }, 2500 + Math.random() * 3500)
    }
    loop()
    return () => clearTimeout(t)
  }, [asleep])

  // Pointer look-at + sleep timer, one listener set per Mii.
  useEffect(() => {
    if (calm()) return undefined
    let sleepT
    const rest = () => {
      setAsleep(false)
      clearTimeout(sleepT)
      sleepT = setTimeout(() => setAsleep(true), SLEEP_AFTER)
    }
    const onMove = e => {
      rest()
      if (!look || !ref.current) return
      const r = ref.current.getBoundingClientRect()
      const dx = (e.clientX - (r.left + r.width / 2)) / (window.innerWidth * 0.3)
      const next = YAWS[Math.round(Math.max(-1, Math.min(1, dx)) * 2) + 2]
      setYaw(y => (y === next ? y : next))
    }
    rest()
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('keydown', rest)
    window.addEventListener('pointerdown', rest)
    return () => {
      clearTimeout(sleepT)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('keydown', rest)
      window.removeEventListener('pointerdown', rest)
    }
  }, [look])

  useEffect(() => () => { clearTimeout(reactTimer.current); clearTimeout(poseTimer.current) }, [])

  // Show `m` for `ms`, then go back to normal. ms = 0 holds until setMood(null).
  const react = useCallback((m, ms = 1200) => {
    clearTimeout(reactTimer.current)
    setMood(m)
    if (ms) reactTimer.current = setTimeout(() => setMood(null), ms)
  }, [])

  // Play a pose from poses.js with its matching face; act(null) stands him back up.
  const act = useCallback((name, ms) => {
    clearTimeout(poseTimer.current)
    const a = ACTS[name]
    setPose(name)
    if (!name) return
    if (a.mood) react(a.mood, ms ?? a.ms)
    if (ms ?? a.ms) poseTimer.current = setTimeout(() => setPose(null), ms ?? a.ms)
  }, [react])

  const face = asleep ? 'blink' : mood ?? (blink ? 'blink' : base)
  const turn = asleep ? 0 : forcedYaw ?? yaw
  const src = failed ? FALLBACK : miiURL(face, turn)

  return {
    ref, asleep, failed, face, pose, act, walkDir: forcedYaw ? Math.sign(forcedYaw) : 0, mood, setMood, react,
    imgProps: { ref, src, alt: '', draggable: false, onError: () => setFailed(true) },
  }
}
