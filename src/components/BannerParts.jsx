import { useState } from 'react'
import { miiURL } from '../data/mii'
import styles from './BannerParts.module.css'

// Slow-drifting Wii-menu style bubbles. Parent must be position: relative;
// overflow: hidden. Purely decorative.
const BUBBLES = [
  { left: '6%',  size: 46, dur: 19, delay: -4 },
  { left: '17%', size: 22, dur: 14, delay: -9 },
  { left: '31%', size: 64, dur: 24, delay: -14 },
  { left: '48%', size: 28, dur: 16, delay: -2 },
  { left: '62%', size: 52, dur: 21, delay: -11 },
  { left: '76%', size: 20, dur: 13, delay: -6 },
  { left: '88%', size: 40, dur: 18, delay: -16 },
]

export function Bubbles() {
  return (
    <div className={styles.bubbles} aria-hidden="true">
      {BUBBLES.map((b, i) => (
        <span
          key={i}
          className={styles.bubble}
          style={{ left: b.left, width: b.size, height: b.size, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}
        />
      ))}
    </div>
  )
}

// The site Mii with a speech bubble, pinned to the bottom-right of the banner.
// The renderer is a third party, so vanish quietly if it's down.
export function MiiBubble({ text }) {
  const [ok, setOk] = useState(true)
  if (!ok) return null
  return (
    <div className={styles.mii}>
      <p className={styles.speech}>{text}</p>
      <img className={styles.miiImg} src={miiURL('smile')} alt="" aria-hidden="true" onError={() => setOk(false)} />
    </div>
  )
}
