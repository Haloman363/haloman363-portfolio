import styles from './MakerWorldBanner.module.css'

export default function MakerWorldBanner() {
  return (
    <div className={styles.mw}>
      <h1 className={styles.title}>MakerWorld</h1>
      <p className={styles.desc}>3D printing models for designers and makers. Check out my profile for prints I&apos;ve shared.</p>
      <a
        className={styles.cta}
        href="https://makerworld.com/en/@Haloman363"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open MakerWorld ↗
      </a>
    </div>
  )
}
