import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { animate, motion, useMotionValue } from 'framer-motion'
import useAliveMii from '../hooks/useAliveMii'
import { CERTIFICATIONS, EXPERIENCE } from '../data/resume'
import { CHATTER as CHANNEL_LINES, OPENERS } from '../data/miiLines'
import MiiView from './MiiView'
import styles from './MenuMii.module.css'

// The site Mii lives on one floor line: the strip above the footer on the menu, the bottom
// edge of the channel panel when a channel is open. He wanders along it, looks at the
// cursor, can be picked up (gravity drops him back onto the floor), greets you by time of
// day and reacts to what you do.
const SIDE = 70 // keep this far from the screen's left/right edges
const POKES = ['Hi!', 'Hehe!', 'That tickles!', 'Try the Konami code!', 'Open a channel!', 'Wheee!']
const CHATTER = ['La la la~', 'Nice day for a stroll!', 'Try dragging me!', 'I live here now.', 'Psst, click me!', 'Whistling...', 'Look at all these channels!']
const MENU_CHATTER = ['Open the Resume channel!', 'Check out Dog Vision!', 'Cool Jaymes Games is fun!', 'Try the Konami code!', 'Press T for a tour!']
// Real facts from the resume data.
const FACTS = [
  `Jaymes holds ${CERTIFICATIONS.length} certifications.`,
  `Jaymes is a ${EXPERIENCE[0].role} at ${EXPERIENCE[0].company}.`,
  'Jaymes builds homelabs, ESP32 gadgets and 3D prints.',
]
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
// A throw that would leave the screen bounces back off the edge instead.
const bounceX = fx => {
  const lo = SIDE
  const hi = window.innerWidth - SIDE
  if (fx < lo) return Math.min(hi, lo + (lo - fx) * 0.6)
  if (fx > hi) return Math.max(lo, hi - (fx - hi) * 0.6)
  return fx
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
export default function MenuMii({ channelOpen, channelId, darkMode, sfx, onDismiss, ref }) {
  const [walkYaw, setWalkYaw] = useState(null)
  const walking = useRef(false)
  const [line, setLine] = useState(null)
  const mii = useAliveMii({ forcedYaw: walkYaw })
  const layer = useRef(null)
  const walker = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useMotionValue(1)
  const sy = useMotionValue(1)
  const taps = useRef([])
  const touring = useRef(false)
  const xAnim = useRef(null)
  const dragging = useRef(false)
  const placed = useRef(false)
  const pokes = useRef(0)
  const lineTimer = useRef()
  const askTimer = useRef()
  const lastReact = useRef(0)
  const asleepRef = useRef(false) // the stroll timer's closure outlives renders, so it reads this
  const [choices, setChoices] = useState([])
  const asking = useRef(false)
  const certs = useRef(null) // the Certifications tab's handle while it's open
  const chaos = useRef(0)

  const show = (text, ms = 3000) => {
    clearTimeout(lineTimer.current)
    setLine(text)
    if (ms) lineTimer.current = setTimeout(() => setLine(null), ms)
  }
  // Small talk gives way to a pending offer (a question with buttons) until it's answered.
  const say = (text, ms) => { if (!asking.current) show(text, ms) }
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

  useEffect(() => () => clearTimeout(lineTimer.current), [])

  // Stand on the floor from the start, and fall (or hop up) to the new floor when a channel
  // opens or closes.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (!walker.current) return
      const t = onFloor(origin().cx + x.get())
      const first = !placed.current
      placed.current = true
      if (first && !calm()) {
        // First load: he starts off the left edge and walks in to his spot, then greets you.
        y.set(t.y)
        x.set(-100 - origin().cx)
        touring.current = true
        setWalkYaw(24)
        animate(x, t.x, { duration: Math.abs(t.x - x.get()) / 150, ease: 'easeOut' }).then(() => {
          setWalkYaw(null)
          touring.current = false
          show(greeting(), 3000)
        }, () => { touring.current = false })
        return
      }
      x.set(t.x)
      if (calm() || first) y.set(t.y)
      else drop(y, t.y)
      if (first) show(greeting(), 3000)
    })
    return () => cancelAnimationFrame(id)
  }, [channelOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  // Falling asleep stops him where he stands.
  useEffect(() => {
    asleepRef.current = mii.asleep
    if (!mii.asleep) return
    xAnim.current?.stop()
    walking.current = false
    setWalkYaw(null)
  }, [mii.asleep])

  // Wander: pick a spot on the floor, turn toward it, walk, rest, repeat.
  useEffect(() => {
    if (calm()) return undefined
    let t
    let live = true
    const stroll = async () => {
      if (!live) return
      if (!dragging.current && !touring.current && !window.__miiHold && !asleepRef.current && walker.current) {
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
        if (!dragging.current && !walking.current && !touring.current && !window.__miiHold && !mii.asleep) {
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

  // Each channel gets its own greeting just after the generic "Ooh!", and banners can ask him
  // to comment on what they loaded (`mii:react`).
  useEffect(() => {
    const o = OPENERS[channelId]
    if (!o) return undefined
    const t = setTimeout(() => { if (!touring.current && Date.now() - lastReact.current > 1500) { mii.act(o.act); say(o.say, 2500) } }, 1100)
    return () => clearTimeout(t)
  }, [channelId]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const onReact = e => {
      if (touring.current || dragging.current) return
      lastReact.current = Date.now()
      mii.act(e.detail.act)
      say(e.detail.say, 3000)
    }
    window.addEventListener('mii:react', onReact)
    return () => window.removeEventListener('mii:react', onReact)
  })

  // Chatter now and then, without waiting to be poked.
  useEffect(() => {
    let t
    const chat = () => {
      t = setTimeout(() => {
        if (!dragging.current && !touring.current) {
          const pool = [...CHATTER, ...FACTS, ...(channelOpen ? [...CHANNEL_CHATTER, ...(CHANNEL_LINES[channelId] ?? [])] : MENU_CHATTER)]
          if (mii.asleep) say('Zzz...', 4000)
          else say(pool[Math.floor(Math.random() * pool.length)], 3500)
        }
        chat()
      }, 9000 + Math.random() * 12000)
    }
    chat()
    return () => clearTimeout(t)
  }, [channelOpen, mii.asleep]) // eslint-disable-line react-hooks/exhaustive-deps

  if (import.meta.env.DEV) window.__mii = mii // pose lab: scripts/mii-record.mjs pose

  const CUES = {
    open: () => { mii.act('cheer', 1200); say('Ooh!', 1500) },
    back: () => { mii.act('wave'); say('Welcome back!') },
    dark: () => { mii.act('shrug'); say('Lights out!') },
    light: () => { mii.act('stretch', 1600); say('So bright!') },
    soundOn: () => { mii.act('dance'); say('Music!') },
    soundOff: () => { mii.act('shrug'); say('Shh...') },
    party: () => { mii.act('dance', 5000); say('PARTY TIME!', 4500) },
  }
  // Stroll to the floor under `el`; resolves when he gets there (or is interrupted).
  const walkTo = (el, speed = 160) => {
    const r = el.getBoundingClientRect()
    const target = onFloor(r.left + r.width / 2)
    if (Math.abs(target.x - x.get()) < 40) return Promise.resolve()
    xAnim.current?.stop()
    walking.current = true
    setWalkYaw(target.x < x.get() ? -24 : 24)
    xAnim.current = animate(x, target.x, { duration: Math.abs(target.x - x.get()) / speed, ease: 'easeInOut' })
    return xAnim.current.then(() => { walking.current = false; setWalkYaw(null) }, () => {})
  }
  const free = () => !channelOpen && !calm() && !dragging.current && !mii.asleep && walker.current
  // Hovering a menu tile: stroll under it, if he's free.
  const visit = el => { if (el && free() && !touring.current) walkTo(el) }

  // Tour: visit every tile on this page in reading order and say its name. Ends early if a
  // channel opens or he's picked up.
  const tour = async () => {
    if (!free() || touring.current) return
    touring.current = true
    const tiles = [...document.querySelectorAll('[data-channel-tile]')]
      .map(el => [el, el.getBoundingClientRect()]).filter(([, r]) => r.width)
      .sort(([, a], [, b]) => a.top - b.top || a.left - b.left)
    say('Tour time! Follow me!', 2000)
    mii.act('wave')
    for (const [el] of tiles) {
      if (!free()) break
      await walkTo(el, 200)
      if (!free()) break
      mii.act('lookAround', 1200)
      say(el.getAttribute('aria-label')?.replace(/^Open /, '') ?? '', 1600)
      await new Promise(res => setTimeout(res, 1700))
    }
    touring.current = false
    say('That is everything!', 2000)
    mii.act('bow')
  }
  // Certifications gag. While that tab is open he offers to dust the badges; each "help"
  // makes it worse (see data/certMess.js) until he puts it all back. He walks up to every
  // badge he disturbs, winds up, shoves it, and drops back to the floor afterwards.
  const wait = ms => new Promise(r => setTimeout(r, ms))
  const STAGES = [
    { say: 'Want me to dust off your badges?', act: 'Sure!' },
    { say: 'Oops, I bumped a few. Let me fix that!', act: 'Help me fix it' },
    { say: 'Hmm, that made it worse. Try again?', act: 'Try again' },
    { say: "Okay... that's definitely worse. Sorry!", act: 'Put it all back' },
  ]
  const ask = (text, label, run) => {
    asking.current = true
    show(text, 0)
    setChoices([{ label, run }])
    clearTimeout(askTimer.current)
    askTimer.current = setTimeout(stopAsking, 15000) // click him to hear it again
  }
  const stopAsking = () => { clearTimeout(askTimer.current); asking.current = false; setChoices([]); setLine(null) }
  const askStage = (text = STAGES[chaos.current].say) => ask(text, chaos.current === 0 && text !== STAGES[0].say ? 'Again?' : STAGES[chaos.current].act, answer)

  // Walk (both axes at once, like a sprite on the page) to put his feet at screen (fx, fy).
  const goTo = (fx, fy) => {
    const o = origin()
    const tx = clampX(fx) - o.cx
    const ty = fy + FEET_PAD - o.fy
    xAnim.current?.stop()
    setWalkYaw(tx < x.get() ? -24 : 24)
    const d = Math.hypot(tx - x.get(), ty - y.get())
    const opts = { duration: Math.max(0.25, d / 260), ease: 'easeInOut' }
    xAnim.current = animate(x, tx, opts)
    return Promise.all([xAnim.current, animate(y, ty, opts)]).then(() => setWalkYaw(null), () => setWalkYaw(null))
  }

  const answer = async () => {
    const api = certs.current
    if (!api || touring.current) return
    stopAsking()
    touring.current = true
    const done = () => { touring.current = false }
    try {
      if (chaos.current >= 3) {
        mii.act('cheer', 900)
        await api.reset()
        chaos.current = 0
        if (certs.current === api) askStage('All tidy! Thanks for the help.')
        return
      }
      const next = chaos.current + 1
      const targets = api.targets(next)
      const instant = calm() || window.innerWidth < 640
      // Only badges that are on screen are worth the walk; nearest first, at most five.
      const seen = i => { const r = api.el(i).getBoundingClientRect(); return r.top > 40 && r.bottom < window.innerHeight * 0.78 }
      const queue = instant ? [] : targets.filter(seen)
        .sort((a, b) => api.el(a).getBoundingClientRect().left - api.el(b).getBoundingClientRect().left).slice(0, 5)
      for (const i of queue) {
        if (dragging.current || certs.current !== api) break
        const r = api.el(i).getBoundingClientRect()
        const feet = Math.max(160, Math.min(floorY(true) - FEET_PAD, r.bottom - 4))
        await goTo(r.left - 26, feet)
        mii.act('lookAround', 300)
        await wait(320) // looks at it first
        mii.act('swat')
        await wait(620) // ... the hit lands as the arm comes down
        sfx?.playClick?.()
        api.set(i, next)
        mii.react('surprise', 900)
        show('Oops!', 1200)
        await wait(650)
      }
      // Whatever he didn't reach goes in a chain reaction, one after another.
      for (const i of targets.filter(t => !queue.includes(t))) { api.set(i, next); if (!instant) await wait(90) }
      chaos.current = next
      if (certs.current === api && !dragging.current) {
        if (!instant) {
          const home = onFloor(origin().cx + x.get())
          mii.act('shrug')
          await Promise.all([animate(x, home.x, { duration: 0.6, ease: 'easeInOut' }), drop(y, home.y)])
        }
        askStage()
      }
    } finally { done() }
  }

  useEffect(() => {
    const onTab = e => {
      certs.current = e.detail
      chaos.current = 0
      stopAsking()
      if (e.detail && !touring.current) setTimeout(() => certs.current && askStage(), 700)
    }
    window.addEventListener('mii:certs-tab', onTab)
    return () => window.removeEventListener('mii:certs-tab', onTab)
  })

  // Waves goodbye and walks off the nearer screen edge (App unmounts him afterwards).
  const leave = async () => {
    if (calm() || !walker.current) return
    touring.current = true
    xAnim.current?.stop()
    mii.act('wave', 900)
    show('Bye!', 900)
    await wait(900)
    const o = origin()
    const right = o.cx + x.get() > window.innerWidth / 2
    const to = (right ? window.innerWidth + 100 : -100) - o.cx
    setWalkYaw(right ? 24 : -24)
    await animate(x, to, { duration: Math.abs(to - x.get()) / 200, ease: 'easeIn' }).then(() => {}, () => {})
  }

  // Press T on the menu for the tour.
  useEffect(() => {
    const onKey = e => {
      if (e.key.toLowerCase() !== 't' || e.ctrlKey || e.metaKey || e.altKey || e.target.closest?.('input, textarea')) return
      tour()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  useImperativeHandle(ref, () => ({ cue: name => CUES[name]?.(), visit, tour, leave }))

  // Let go: he's thrown a little, then gravity drops him back on the floor with a bounce.
  const land = vx => {
    x.stop(); y.stop()
    const o = origin()
    const t = onFloor(bounceX(o.cx + x.get() + vx * 0.25))
    const fell = Math.abs(t.y - y.get())
    mii.act(null)
    mii.react('surprise', 400)
    animate(x, t.x, { duration: 0.5, ease: 'easeOut' })
    drop(y, t.y).then(() => {
      if (fell > 160) { mii.react('frustrated', 1500); mii.act('shrug'); say('Ouch!') } else mii.react('smile', 1500)
      dragging.current = false
      if (fell > 40 && !calm()) {
        animate(sx, [1, 1.18, 0.96, 1], { duration: 0.35 })
        animate(sy, [1, 0.8, 1.04, 1], { duration: 0.35 })
      }
    })
  }

  return (
    <div className={`${styles.layer}${channelOpen ? ` ${styles.front}` : ''}`} ref={layer}>
      <motion.div className={styles.walker} ref={walker} style={{ x, y, scaleX: sx, scaleY: sy, originY: 1 }}
        drag dragConstraints={layer} dragElastic={0.1} dragMomentum={false}
        onDragStart={() => { dragging.current = true; xAnim.current?.stop(); walking.current = false; setWalkYaw(null); mii.act('held', 0); say('Whoa!', 1500) }}
        // framer starts its own post-drag animation right after this fires and would cancel the fall,
        // so let it finish first.
        onDragEnd={(_, info) => { const vx = info.velocity.x; setTimeout(() => land(vx), 60) }}
        onTap={() => {
          sfx?.playClick?.()
          pokes.current += 1
          if (certs.current && !touring.current && !asking.current) { askStage(); return }
          const now = Date.now()
          taps.current = [...taps.current.filter(t => now - t < 2500), now]
          if (taps.current.length >= 5) {
            taps.current = []
            mii.act('dizzy')
            say('So... dizzy...', 3000)
            return
          }
          mii.act(pick(POKE_ACTS))
          say(POKES[pokes.current % POKES.length], 2000)
        }}
      >
        <button className={styles.dismiss} aria-label="Send the Mii away" title="Send the Mii away"
          onPointerDown={e => e.stopPropagation()} onClick={() => onDismiss?.()}>&times;</button>
        {line && (
          <div className={`${styles.bubble}${choices.length ? ` ${styles.ask}` : ''}`} role="status" onPointerDown={e => e.stopPropagation()}>
            {line}
            {choices.map(c => <button key={c.label} className={styles.choice} onClick={() => c.run()}>{c.label}</button>)}
          </div>
        )}
        <MiiView mii={mii} dark={darkMode} className={styles.mii} />
      </motion.div>
    </div>
  )
}
