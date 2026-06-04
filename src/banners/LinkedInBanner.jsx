import styles from './LinkedInBanner.module.css'

export default function LinkedInBanner() {
  return (
    <div className={styles.li}>
      <h1 className={styles.title}>LinkedIn</h1>
      <p className={styles.handle}>jaymes-bunce</p>
      <a
        className={styles.cta}
        href="https://www.linkedin.com/in/jaymes-bunce"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open Profile ↗
      </a>
    </div>
  )
}
