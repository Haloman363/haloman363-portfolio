import styles from './AboutBanner.module.css'

const SKILLS = [
  { label: 'Python',       pct: 85, color: '#3572A5' },
  { label: 'JavaScript',   pct: 75, color: '#f1e05a' },
  { label: '3D Printing',  pct: 80, color: '#00e08a' },
  { label: 'Hardware',     pct: 65, color: '#e34c26' },
  { label: 'Rust',         pct: 40, color: '#dea584' },
]

export default function AboutBanner() {
  return (
    <div className={styles.about}>
      <div className={styles.top}>
        <img
          className={styles.avatar}
          src={`${import.meta.env.BASE_URL}wii/sprites/mii-avatar-placeholder.png`}
          alt="Mii avatar"
        />
        <div className={styles.info}>
          <h1 className={styles.name}>JAYMES BUNCE</h1>
          <p className={styles.role}>Hobbyist Developer &amp; Maker</p>
        </div>
      </div>

      <p className={styles.bio}>
        Hey! I&apos;m Jaymes — a hobbyist developer and maker living in the overlap between
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
  )
}
