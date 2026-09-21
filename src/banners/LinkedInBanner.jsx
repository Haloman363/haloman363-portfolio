import { Bubbles, MiiBubble } from '../components/BannerParts'
import parts from '../components/BannerParts.module.css'
import styles from './LinkedInBanner.module.css'

const BASE = import.meta.env.BASE_URL

const STATS = [
  { value: '5+', label: 'years in IT' },
  { value: '1,800+', label: 'remote staff on OpenVPN' },
  { value: '3,000+', label: 'Google Workspace users' },
]

const CHIPS = ['Linux', 'Proxmox', 'Docker', 'Ansible', 'PowerShell', 'Google Workspace', 'OpenVPN', 'Zabbix', 'pfSense']

export default function LinkedInBanner({ sfx }) {
  const hover = sfx?.playHover
  const click = sfx?.playClick

  return (
    <div className={styles.li}>
      <Bubbles />

      <div className={styles.inner}>
        <div className={`${styles.head} ${parts.rise}`}>
          <img className={styles.logo} src={`${BASE}wii/sprites/linkedin-logo.png`} alt="" />
          <div>
            <h1 className={styles.title}>LinkedIn</h1>
            <p className={styles.handle}>jaymes-bunce</p>
          </div>
        </div>

        <p className={`${styles.headline} ${parts.rise}`} style={{ '--i': 1 }}>
          System Administrator II at Conservice &middot; Logan, UT
        </p>

        <div className={styles.stats}>
          {STATS.map((s, i) => (
            <div key={s.label} className={`${styles.stat} ${parts.rise}`} style={{ '--i': i + 2 }} onMouseEnter={hover}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className={`${styles.chips} ${parts.rise}`} style={{ '--i': 5 }}>
          {CHIPS.map(c => (
            <span key={c} className={styles.chip} onMouseEnter={hover}>{c}</span>
          ))}
        </div>

        <a
          className={`${parts.pill} ${parts.rise}`}
          style={{ '--i': 6 }}
          href="https://www.linkedin.com/in/jaymes-bunce"
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={hover}
          onClick={click}
        >
          Open Profile ↗
        </a>
      </div>

      <MiiBubble text="Let's connect!" />
    </div>
  )
}
