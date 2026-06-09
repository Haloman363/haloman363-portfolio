import { useEffect } from 'react'
import styles from './WiiFooter.module.css'

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function formatDate(d) {
  return `${DAYS[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}`
}

export default function WiiFooter({ audioEnabled, onAudioToggle, darkMode, onDarkToggle }) {
  useEffect(() => {
    function update() {
      const el = document.getElementById('wii-date')
      if (el) el.textContent = formatDate(new Date())
    }
    update()
    const id = setInterval(update, 60000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <div className={styles.bottomSection}>
        <div className={styles.bottomTitle} />

        <div className={styles.leftButtonContainer}>
          <div className={styles.leftButton} />
          <button
            className={`${styles.wiiButton} ${styles.cornerButton}`}
            onClick={onAudioToggle}
            aria-label={audioEnabled ? 'Mute audio' : 'Enable audio'}
            title={audioEnabled ? 'Audio on' : 'Audio off'}
          />
        </div>

        <div className={styles.date} id="wii-date" />

        <div className={styles.rightButtonContainer}>
          <div className={styles.rightButton} />
          <div className={`${styles.mailButton} ${styles.cornerButton}`} />
        </div>
      </div>

      {/* Rendered outside bottomSection so dark mode filter doesn't dim it */}
      <button
        className={styles.darkButton}
        onClick={onDarkToggle}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        title={darkMode ? 'Light mode' : 'Dark mode'}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
    </>
  )
}
