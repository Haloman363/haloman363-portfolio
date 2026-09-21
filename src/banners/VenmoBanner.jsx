import { Bubbles, MiiBubble } from '../components/BannerParts'
import parts from '../components/BannerParts.module.css'
import styles from './VenmoBanner.module.css'

const BASE = import.meta.env.BASE_URL
const PROFILE = 'https://account.venmo.com/u/JaymesBunce'

export default function VenmoBanner({ sfx }) {
  const hover = sfx?.playHover
  const click = sfx?.playClick
  const link = { target: '_blank', rel: 'noopener noreferrer', onMouseEnter: hover, onClick: click }

  return (
    <div className={styles.venmo}>
      <Bubbles />

      <div className={styles.inner}>
        <div className={styles.main}>
          <img className={`${styles.logo} ${parts.rise}`} src={`${BASE}wii/sprites/venmo-logo.png`} alt="" />
          <h1 className={`${styles.title} ${parts.rise}`} style={{ '--i': 1 }}>Venmo</h1>
          <a className={`${styles.handle} ${parts.rise}`} style={{ '--i': 2 }} href={PROFILE} {...link}>
            @JaymesBunce
          </a>
          <div className={`${styles.actions} ${parts.rise}`} style={{ '--i': 3 }}>
            <a className={parts.pill} href="https://venmo.com/JaymesBunce?txn=pay" {...link}>Pay ↗</a>
            <a className={parts.pill} href="https://venmo.com/JaymesBunce?txn=charge" {...link}>Request ↗</a>
          </div>
          <a className={`${styles.invite} ${parts.rise}`} style={{ '--i': 4 }} href="https://get.venmo.com/3HrXU3Q5A6b" {...link}>
            New to Venmo? Sign up with my invite ↗
          </a>
        </div>

        <a className={`${styles.qrCard} ${parts.rise}`} style={{ '--i': 3 }} href={PROFILE} {...link}>
          <img className={styles.qr} src={`${BASE}wii/sprites/venmo-qr.svg`} alt="QR code for my Venmo profile" />
          <span className={styles.qrLabel}>Scan to pay</span>
        </a>
      </div>

      <MiiBubble text="Venmo me for pizza!" />
    </div>
  )
}
