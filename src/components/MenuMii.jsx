import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { animate, motion, useMotionValue } from 'framer-motion'
import useAliveMii from '../hooks/useAliveMii'
import MiiView from './MiiView'
import styles from './MenuMii.module.css'

// The site Mii lives on one floor line: the strip above the footer on the menu, the bottom
// edge of the channel panel when a channel is open. He wanders along it, looks at the
// cursor, can be picked up (gravity drops him back onto the floor), greets you by time of
// day and reacts to what you do.
const SIDE = 70 // keep this far from the screen's left/right edges
const POKES = ['Hi!', 'Hehe!', 'That tickles!', 'Try the Konami code!', 'Open a channel!', 'Wheee!']
const CHATTER = ['La la la~', 'Nice day for a stroll!', 'Try dragging me!', 'I live here now.', 'Psst, click me!', 'Whistling...', 'Look at all these channels!']
const MENU_CHATTER = ['Open the Resume channel!', 'Check out Dog Vision!', 'Cool Jaymes Games is fun!', 'Try the Konami code!']
const CHANNEL_CHATTER = ['Good stuff in here!', 'Use the arrows to switch channels!', 'Press Esc to go back!', 'Dont mind me.']
// What he does when poked, and what he gets up to by himself (weighted by repeats).
const POKE_ACTS = ['wave', 'cheer', 'spin', 'jack', 'clap', 'dance']
const IDLE_ACTS = ['lookAround', 'lookAround', 'stretch', 'shrug', 'wave', 'clap', 'bow', 'dance', 'spin', 'jack']
const pick = list => list[Math.floor(Math.random() * list.length)]
const G = 2600 // px/s^2
// Constant-acceleration fall with two shrinking bounces that never dip below the floor.
// Rising to a higher floor (leaving a channel) is a plain eased hop instead.
function drop(value, to) {
  const from = value.get()
  const d = to - from
  if (d < 1) return animate(value, to, { duration: 0.35, ease: 'easeOut' })
  const fall = Math.sqrt((2 * d) / G)
  const total = fall + 0.27
  const at = s => (fall + s) / total
  return animate(value, [from, to, to - 12, to, to - 3, to], {
    duration: total,
    times: [0, fall / total, at(0.09), at(0.18), at(0.23), 1],
    ease: [[0.55, 0, 1, 0.45], 'easeOut', 'easeIn', 'easeOut', 'easeIn'],
  })
}
const calm = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const greeting = () => {
  const h = new Date().getHours()
  if (h < 5) return 'Up late? Same.'
  if (h < 12) return 'Good morning!'
  if (h < 18) return 'Good afternoon!'
  return 'Good evening!'
}

// Screen y of the bottom of his canvas, which sits FEET_PAD below his feet (the scene frames
// a little ground under them). Menu: on the footer's top edge.
// Channel: his feet on the bottom edge of the viewport panel (80vh, see ChannelBanner.module.css).
const FEET_PAD = 3
function floorY(channelOpen) {
  if (channelOpen) return window.innerHeight * 0.8 + FEET_PAD
  const footer = document.querySelector('[data-wii-footer]')
  return (footer ? footer.getBoundingClientRect().top : window.innerHeight * 0.76) - 1 + FEET_PAD
}

// `ref.cue(name)` lets App trigger a reaction from the event handler that caused it.
export default function MenuMii({ channelOpen, sfx, ref }) {
  const [walkYaw, setWalkYaw] = useState(null)
  const walking = useRef(false)
  const [line, setLine] = useState(greeting)
  const mii = useAliveMii({ forcedYaw: walkYaw })
  const layer = useRef(null)
  const walker = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const xAnim = useRef(null)
  const dragging = useRef(false)
  const placed = useRef(false)
  const pokes = useRef(0)
  const lineTimer = useRef()

  const say = (text, ms = 3000) => {
    clearTimeout(lineTimer.current)
    setLine(text)
    lineTimer.current = setTimeout(() => setLine(null), ms)
  }
  // Where (0, 0) puts his feet: horizontal centre and resting line, in screen px.
  function origin() {
    const r = walker.current.getBoundingClientRect()
    return { cx: r.left + r.width / 2 - x.get(), fy: r.bottom - y.get() }
  }
  const clampX = fx => Math.max(SIDE, Math.min(window.innerWidth - SIDE, fx))
  // Offsets that put his feet on the floor at screen x `fx`.
  function onFloor(fx) {
    const o = origin()
    return { x: clampX(fx) - o.cx, y: floorY(channelOpen) - o.fy }
  }

  useEffect(() => {
    lineTimer.current = setTimeout(() => setLine(null), 3000) // the greeting
    return () => clearTimeout(lineTimer.current)
  }, [])

  // Stand on the floor from the start, and fall (or hop up) to the new floor when a channel
  // opens or closes.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (!walker.current) return
      const t = onFloor(origin().cx + x.get())
      x.set(t.x)
      if (calm() || !placed.current) y.set(t.y)
      else drop(y, t.y)
      placed.current = true
    })
    return () => cancelAnimationFrame(id)
  }, [channelOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  // Wander: pick a spot on the floor, turn toward it, walk, rest, repeat.
  useEffect(() => {
    if (calm()) return undefined
    let t
    let live = true
    const stroll = async () => {
      if (!live) return
      if (!dragging.current && !mii.asleep && walker.current) {
        const target = onFloor(SIDE + Math.random() * (window.innerWidth - 2 * SIDE))
        walking.current = true
        setWalkYaw(target.x < x.get() ? -24 : 24)
        y.set(target.y)
        xAnim.current = animate(x, target.x, { duration: Math.abs(target.x - x.get()) / 70, ease: 'easeInOut' })
        await xAnim.current.then(() => {}, () => {})
        walking.current = false
        if (live) setWalkYaw(null)
      }
      if (live) t = setTimeout(stroll, 3000 + Math.random() * 6000)
    }
    t = setTimeout(stroll, 4000)
    return () => { live = false; clearTimeout(t); xAnim.current?.stop() }
  }, [channelOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  // Idle antics while he's standing around: stretch, look about, dance, ...
  useEffect(() => {
    if (calm()) return undefined
    let t
    const antics = () => {
      t = setTimeout(() => {
        if (!dragging.current && !walking.current && !mii.asleep) {
          const a = pick(IDLE_ACTS)
          mii.act(a)
          if (a === 'wave') say('Hi there!', 2000)
          if (a === 'stretch') say('Aaah...', 2000)
          if (a === 'bow') say('Thank you!', 2000)
        }
        antics()
      }, 5000 + Math.random() * 7000)
    }
    antics()
    return () => clearTimeout(t)
  }, [channelOpen, mii.asleep]) // eslint-disable-line react-hooks/exhaustive-deps

  // Chatter now and then, without waiting to be poked.
  useEffect(() => {
    let t
    const chat = () => {
      t = setTimeout(() => {
        if (!dragging.current) {
          const pool = [...CHATTER, ...(channelOpen ? CHANNEL_CHATTER : MENU_CHATTER)]
          if (mii.asleep) say('Zzz...', 4000)
          else say(pool[Math.floor(Math.random() * pool.length)], 3500)
        }
        chat()
      }, 9000 + Math.random() * 12000)
    }
    chat()
    return () => clearTimeout(t)
  }, [channelOpen, mii.asleep])

  const CUES = {
    open: () => { mii.act('cheer', 1200); say('Ooh!', 1500) },
    back: () => { mii.act('wave'); say('Welcome back!') },
    dark: () => { mii.act('shrug'); say('Lights out!') },
    light: () => { mii.act('stretch', 1600); say('So bright!') },
    soundOn: () => { mii.act('dance'); say('Music!') },
    soundOff: () => { mii.act('shrug'); say('Shh...') },
    party: () => { mii.act('dance', 5000); say('PARTY TIME!', 4500) },
  }
  useImperativeHandle(ref, () => ({ cue: name => CUES[name]?.() }))

  // Let go: he's thrown a little, then gravity drops him back on the floor with a bounce.
  const land = vx => {
    x.stop(); y.stop()
    const o = origin()
    const t = onFloor(o.cx + x.get() + vx * 0.25)
    const fell = Math.abs(t.y - y.get())
    mii.act(null)
    mii.react('surprise', 400)
    animate(x, t.x, { duration: 0.5, ease: 'easeOut' })
    drop(y, t.y).then(() => {
      if (fell > 160) { mii.react('frustrated', 1500); mii.act('shrug'); say('Ouch!') } else mii.react('smile', 1500)
      dragging.current = false
    })
  }

  return (
    <div className={`${styles.layer}${channelOpen ? ` ${styles.front}` : ''}`} ref={layer}>
      <motion.div className={styles.walker} ref={walker} style={{ x, y }}
        drag dragConstraints={layer} dragElastic={0.1} dragMomentum={false}
        onDragStart={() => { dragging.current = true; xAnim.current?.stop(); walking.current = false; setWalkYaw(null); mii.act('held', 0); say('Whoa!', 1500) }}
        // framer starts its own post-drag animation right after this fires and would cancel the fall,
        // so let it finish first.
        onDragEnd={(_, info) => { const vx = info.velocity.x; setTimeout(() => land(vx), 60) }}
        onTap={() => {
          sfx?.playClick?.()
          pokes.current += 1
          mii.act(pick(POKE_ACTS))
          say(POKES[pokes.current % POKES.length], 2000)
        }}
      >
        {line && <p className={styles.bubble} role="status">{line}</p>}
        <MiiView mii={mii} className={styles.mii} />
      </motion.div>
    </div>
  )
}
