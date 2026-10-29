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
