import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import styles from './CertMii.module.css'
import { miiURL } from '../data/mii'

// The Mii "helps" with the cert badges and makes a mess. `chaos` (0-3) is owned by the
// parent, which scatters the cards; this component drives the Mii, the speech bubble
// and the buttons. Each "help" bumps chaos until it maxes out, then offers a reset.
export const MAX_CHAOS = 3

const SCRIPT = [
  { say: 'Hi! Want me to dust off your badges?', act: 'Sure!', face: 'smile' },
  { say: 'Oops, I bumped a few. Let me fix that!', act: 'Help me fix it', face: 'surprise' },
  { say: 'Hmm, that made it worse. Try again?', act: 'Try again', face: 'sorrow' },
  { say: "Okay... that's definitely worse. Sorry!", act: 'Put it all back', face: 'sorrow' },
]
const TIDY = { say: 'All tidy! Thanks for the help.', act: 'Again?', face: 'smile' }
const FALLBACK = `${import.meta.env.BASE_URL}wii/sprites/mii-fullbody.png`

export default function CertMii({ chaos, onChaos, sfx }) {
  const [dashing, setDashing] = useState(false)
  const [tidy, setTidy] = useState(false)
  const [failed, setFailed] = useState(false)
  const timer = useRef()
  useEffect(() => () => clearTimeout(timer.current), [])

  const line = tidy && chaos === 0 ? TIDY : SCRIPT[chaos]

  const act = () => {
    if (dashing) return
    sfx?.playClick?.()
    if (chaos >= MAX_CHAOS) {
      setTidy(true)
      onChaos(0)
      return
    }
    setDashing(true)
    // The mess lands mid-dash, when the Mii is over the badges.
    timer.current = setTimeout(() => onChaos(chaos + 1), 450)
  }

  return (
    <div className={styles.anchor}>
      <div className={styles.stage}>
        <div className={styles.bubble} role="status" aria-live="polite">
          <p className={styles.say}>{line.say}</p>
          <div className={styles.actions}>
            <button className={styles.act} onClick={act} disabled={dashing}>{line.act}</button>
            {chaos > 0 && chaos < MAX_CHAOS && (
              <button className={styles.reset} onClick={() => { sfx?.playClick?.(); setTidy(true); onChaos(0) }}>
                Put it back
              </button>
            )}
          </div>
        </div>
        <motion.img
          className={styles.mii}
          src={failed ? FALLBACK : miiURL(dashing ? 'surprise' : line.face)}
          alt=""
          aria-hidden="true"
          draggable={false}
          onError={() => setFailed(true)}
          animate={dashing ? { x: [0, -260, -40, 0], y: [0, -6, 0, 0], rotate: [0, -8, 4, 0] } : { x: 0, y: 0, rotate: 0 }}
          transition={{ duration: 1.1, ease: 'easeInOut' }}
          onAnimationComplete={() => setDashing(false)}
        />
      </div>
    </div>
  )
}
