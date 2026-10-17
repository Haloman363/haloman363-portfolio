import { useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue } from 'framer-motion'
import styles from './CertMii.module.css'
import { miiURL } from '../data/mii'

// The Mii "helps" with the cert badges and makes a mess. It really walks to each badge
// it is about to disturb, bumps it (the parent applies the mess on arrival), then walks
// home. Each "help" raises `chaos` (0-3) until it maxes out and offers a reset.
export const MAX_CHAOS = 3
const MAX_VISITS = 5 // the rest get knocked by the chain reaction at the end

const SCRIPT = [
  { say: 'Hi! Want me to dust off your badges?', act: 'Sure!', face: 'smile' },
  { say: 'Oops, I bumped a few. Let me fix that!', act: 'Help me fix it', face: 'surprise' },
  { say: 'Hmm, that made it worse. Try again?', act: 'Try again', face: 'sorrow' },
  { say: "Okay... that's definitely worse. Sorry!", act: 'Put it all back', face: 'sorrow' },
]
const TIDY = { say: 'All tidy! Thanks for the help.', act: 'Again?', face: 'smile' }
const FALLBACK = `${import.meta.env.BASE_URL}wii/sprites/mii-fullbody.png`
const EXPRESSIONS = ['normal', 'blink', 'smile', 'surprise', 'sorrow']

const wait = ms => new Promise(r => setTimeout(r, ms))
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const POSES = {
  idle: { y: [0, -3, 0], scaleY: [1, 1.015, 1], rotate: 0,
    transition: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } },
  hop: { y: [0, -22, 0], scaleY: [1, 1.04, 0.94, 1], rotate: 0, transition: { duration: 0.4 } },
}
const walkPose = lean => ({ y: [0, -7, 0], rotate: lean, scaleY: 1,
  transition: { y: { duration: 0.28, repeat: Infinity, ease: 'easeOut' }, rotate: { duration: 0.2 } } })

export default function CertMii({ chaos, levels, plan, cardEls, onKnock, onSettle, sfx }) {
  const [busy, setBusy] = useState(false)
  const [tidy, setTidy] = useState(false)
  const [failed, setFailed] = useState(false)
  const [mood, setMood] = useState(null) // transient expression override
  const [blink, setBlink] = useState(false)
  const [pose, setPose] = useState('idle')
  const [lean, setLean] = useState(0)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const body = useRef(null)
  const anchor = useRef(null)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    EXPRESSIONS.forEach(e => { new Image().src = miiURL(e) }) // no blank frame on swaps
    return () => { alive.current = false }
  }, [])

  // Idle blink every few seconds, like the About channel's Mii.
  useEffect(() => {
    if (busy) return undefined
    let t
    const loop = () => {
      t = setTimeout(() => {
        setBlink(true)
        t = setTimeout(() => { setBlink(false); loop() }, 150)
      }, 2500 + Math.random() * 3000)
    }
    loop()
    return () => clearTimeout(t)
  }, [busy])

  const line = tidy && chaos === 0 ? TIDY : SCRIPT[chaos]
  const face = mood ?? (blink ? 'blink' : line.face)

  const hop = async mood => {
    setMood(mood); setPose('hop')
    await wait(420)
    if (alive.current) setPose('idle')
  }

  // Where the Mii's body sits at rest, ignoring its current offset.
  const restRect = () => {
    const r = body.current.getBoundingClientRect()
    const cx = r.left + r.width / 2 - x.get()
    return { cx, bottom: r.bottom - y.get(), height: r.height }
  }

  const walkTo = async (tx, ty) => {
    setLean(tx < x.get() ? -6 : 6)
    setPose('walk')
    const dist = Math.hypot(tx - x.get(), ty - y.get())
    const duration = Math.min(0.9, Math.max(0.35, dist / 520))
    await Promise.all([
      animate(x, tx, { duration, ease: 'easeInOut' }),
      animate(y, ty, { duration, ease: 'easeInOut' }),
    ])
  }

  const help = async () => {
    const next = chaos + 1
    const targets = plan(next)
    const panel = anchor.current.parentElement.getBoundingClientRect()
    const home = restRect()
    const calm = reducedMotion()
    // Only walk to badges that are on screen; order them nearest-first from home.
    const spot = i => {
      const r = cardEls.current[i].getBoundingClientRect()
      return { i, cx: r.left + r.width / 2, cy: r.top + r.height / 2, seen: r.top > panel.top && r.bottom < panel.bottom }
    }
    const visible = targets.map(spot).filter(t => t.seen && !calm)
      .sort((a, b) => Math.hypot(a.cx - home.cx, a.cy - home.bottom) - Math.hypot(b.cx - home.cx, b.cy - home.bottom))
      .slice(0, MAX_VISITS)
    const visited = new Set()
    for (const t of visible) {
      if (!alive.current) return
      // Stand just right of the badge's centre, feet on its middle (never below the panel).
      const lowest = panel.top - (home.bottom - home.height) // keep the Mii's head inside the panel
      await walkTo(t.cx - home.cx + 40, Math.max(lowest, Math.min(0, t.cy - home.bottom + 30)))
      setPose('idle')
      sfx?.playClick?.()
      onKnock(t.i, next)
      visited.add(t.i)
      await hop('surprise')
      await wait(120)
    }
    // Chain reaction: everything the Mii didn't reach lands now.
    targets.filter(i => !visited.has(i)).forEach(i => onKnock(i, next))
    if (visible.length) { setLean(x.get() > 0 ? -6 : 6); await walkTo(0, 0) }
    setPose('idle'); setLean(0)
    if (!alive.current) return
    onSettle(next)
    setMood(next >= 2 ? 'sorrow' : null)
    await wait(1200)
    if (alive.current) setMood(null)
  }

  const putBack = async () => {
    const messy = levels.flatMap((l, i) => (l > 0 ? [i] : []))
    setMood('smile')
    for (const i of messy) {
      if (!alive.current) return
      onKnock(i, 0)
      await wait(70)
    }
    await hop('smile')
    setTidy(true)
    onSettle(0)
    await wait(1200)
    if (alive.current) setMood(null)
  }

  const act = async () => {
    if (busy) return
    sfx?.playClick?.()
    setBusy(true)
    try { await (chaos >= MAX_CHAOS ? putBack() : help()) } finally { if (alive.current) setBusy(false) }
  }

  const reset = async () => {
    if (busy) return
    sfx?.playClick?.()
    setBusy(true)
    try { await putBack() } finally { if (alive.current) setBusy(false) }
  }

  const poke = () => { if (!busy) { sfx?.playClick?.(); hop('smile').then(() => alive.current && setMood(null)) } }

  return (
    <div className={styles.anchor} ref={anchor}>
      <div className={styles.stage}>
        <div className={styles.bubble} role="status" aria-live="polite">
          <p className={styles.say}>{line.say}</p>
          <div className={styles.actions}>
            <button className={styles.act} onClick={act} disabled={busy}>{line.act}</button>
            {chaos > 0 && chaos < MAX_CHAOS && (
              <button className={styles.reset} onClick={reset} disabled={busy}>Put it back</button>
            )}
          </div>
        </div>
        <motion.div ref={body} className={styles.walker} style={{ x, y }}>
          <motion.img
            className={styles.mii}
            src={failed ? FALLBACK : miiURL(face)}
            alt=""
            aria-hidden="true"
            draggable={false}
            onClick={poke}
            onError={() => setFailed(true)}
            animate={pose === 'walk' ? walkPose(lean) : POSES[pose]}
          />
        </motion.div>
      </div>
    </div>
  )
}
