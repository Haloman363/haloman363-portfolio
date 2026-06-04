import styles from './WiiFooter.module.css'

export default function WiiFooter() {
  return (
    <footer className={styles.footer}>
      <img
        className={styles.avatar}
        src="/wii/sprites/mii-avatar-placeholder.png"
        alt="Mii avatar"
      />
      <span className={styles.name}>JAYMES</span>
    </footer>
  )
}
