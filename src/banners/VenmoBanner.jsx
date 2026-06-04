import styles from './VenmoBanner.module.css'

export default function VenmoBanner() {
  return (
    <div className={styles.venmo}>
      <h1 className={styles.title}>Venmo</h1>
      <p className={styles.handle}>@JaymesBunce</p>
      <a
        className={styles.cta}
        href="https://account.venmo.com/u/JaymesBunce"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open Venmo ↗
      </a>
    </div>
  )
}
