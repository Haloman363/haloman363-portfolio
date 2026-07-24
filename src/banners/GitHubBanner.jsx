import styles from './GitHubBanner.module.css'

export default function GitHubBanner() {
  return (
    <div className={styles.gh}>
      <h1 className={styles.title}>GitHub</h1>
      <p className={styles.handle}>Haloman363</p>
      <a
        className={styles.cta}
        href="https://github.com/Haloman363"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open Profile ↗
      </a>
    </div>
  )
}
