import styles from './ShopBanner.module.css'
import { REFERRAL_LINKS } from '../data/channels'

export default function ShopBanner() {
  return (
    <div className={styles.shop}>
      <h1 className={styles.header}>Welcome to the Wii Shop Channel!</h1>
      <p className={styles.sub}>Referral links &amp; bonus offers</p>
      <div className={styles.cards}>
        {REFERRAL_LINKS.map(link => (
          <a
            key={link.name}
            className={styles.card}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className={styles.cardAccent} style={{ background: link.accent }} />
            <span className={styles.cardInfo}>
              <span className={styles.cardName}>{link.name}</span>
              <span className={styles.cardDesc}>{link.desc}</span>
            </span>
            <span className={styles.arrow}>↗</span>
          </a>
        ))}
      </div>
    </div>
  )
}
