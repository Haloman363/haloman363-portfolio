import { useEffect, useRef, useState } from 'react'
import styles from './AboutBanner.module.css'
import { miiURL } from '../data/mii'

// ponytail: idle blink + hover smile is all the "alive" this needs.
// Add cursor-follow (characterYRotate) only if it still feels static.
const EXPRESSIONS = ['normal', 'blink', 'smile']

const SKILLS = [
  { label: 'Python',       pct: 85, color: '#3572A5' },
  { label: 'JavaScript',   pct: 75, color: '#f1e05a' },
  { label: '3D Printing',  pct: 80, color: '#00e08a' },
  { label: 'Hardware',     pct: 65, color: '#e34c26' },
  { label: 'Rust',         pct: 40, color: '#dea584' },
]

const FALLBACK = `${import.meta.env.BASE_URL}wii/sprites/mii-fullbody.png`

export default function AboutBanner() {
  const [expression, setExpression] = useState('normal')
  const [failed, setFailed] = useState(false)
  const hovering = useRef(false)

  // Preload so expression swaps don't flash a blank frame.
  useEffect(() => {
    EXPRESSIONS.forEach(e => { new Image().src = miiURL(e) })
  }, [])

  // Blink on a loose interval, but never while hovering (hover owns the smile).
  useEffect(() => {
    let blinkTimer
    const schedule = () => {
      blinkTimer = setTimeout(() => {
        if (!hovering.current) {
          setExpression('blink')
          setTimeout(() => { if (!hovering.current) setExpression('normal') }, 150)
        }
        schedule()
      }, 3000 + Math.random() * 3000)
    }
    schedule()
    return () => clearTimeout(blinkTimer)
  }, [])

  return (
    <div className={styles.about}>
      <div className={styles.content}>
        <div className={styles.top}>
          <div className={styles.info}>
            <h1 className={styles.name}>JAYMES BUNCE</h1>
            <p className={styles.role}>Hobbyist Developer &amp; Maker</p>
          </div>
        </div>

        <p className={styles.bio}>
          Hey! I&apos;m Jaymes, a hobbyist developer and maker living in the overlap between
          software and hardware. I build Python tools, browser experiments, ESP32 projects,
          and whatever else catches my curiosity. I care about making things that work
          and feel good to use.
        </p>

        <p className={styles.skillsTitle}>Skills</p>
        <div className={styles.bars}>
          {SKILLS.map(s => (
            <div key={s.label} className={styles.barRow}>
              <span className={styles.barLabel}>{s.label}</span>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{ width: `${s.pct}%`, background: s.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <img
        className={styles.fullBody}
        src={failed ? FALLBACK : miiURL(expression)}
        alt="Full body Mii"
        onMouseEnter={() => { hovering.current = true; setExpression('smile') }}
        onMouseLeave={() => { hovering.current = false; setExpression('normal') }}
        // Renderer is a third party; if it's down, stay on the sprite for good
        // rather than retrying (and re-breaking) on every blink.
        onError={() => setFailed(true)}
      />
    </div>
  )
}
