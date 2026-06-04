import styles from './PhotoBanner.module.css'
import heroImg from '../assets/hero.png'

export default function PhotoBanner() {
  return (
    <div className={styles.photo}>
      <div className={styles.imageWrap}>
        <img className={styles.image} src={heroImg} alt="Profile photo" />
      </div>
      <div className={styles.toolbar}>
        <span className={styles.toolbarLabel}>Photo Channel</span>
      </div>
    </div>
  )
}
