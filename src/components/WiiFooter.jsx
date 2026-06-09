import { useEffect } from 'react'
import styles from './WiiFooter.module.css'

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function formatDate(d) {
  return `${DAYS[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}`
}

export default function WiiFooter({ audioEnabled, onAudioToggle, darkMode, onDarkToggle, channelOpen }) {
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

      {!channelOpen && <button
        className={styles.audioButton}
        onClick={onAudioToggle}
        aria-label={audioEnabled ? 'Mute audio' : 'Unmute audio'}
        title={audioEnabled ? 'Mute' : 'Unmute'}
      >
        {audioEnabled ? (
          // Speaker on
          <svg viewBox="0 0 24 24" width="44" height="44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="#5a8a6a" stroke="#5a8a6a" strokeWidth="1" strokeLinejoin="round"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="#5a8a6a" strokeWidth="2" strokeLinecap="round"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="#5a8a6a" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          // Speaker muted
          <svg viewBox="0 0 24 24" width="44" height="44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="#888" stroke="#888" strokeWidth="1" strokeLinejoin="round"/>
            <line x1="23" y1="9" x2="17" y2="15" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
            <line x1="17" y1="9" x2="23" y2="15" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
      </button>}

      {!channelOpen && <button
        className={styles.darkButton}
        onClick={onDarkToggle}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        title={darkMode ? 'Light mode' : 'Dark mode'}
      >
        {darkMode ? (
          // Sun icon
          <svg viewBox="0 0 24 24" width="44" height="44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="5" fill="#f5c842" />
            <g stroke="#f5c842" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="2"  x2="12" y2="5"  />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="2"  y1="12" x2="5"  y2="12" />
              <line x1="19" y1="12" x2="22" y2="12" />
              <line x1="4.93"  y1="4.93"  x2="7.05"  y2="7.05"  />
              <line x1="16.95" y1="16.95" x2="19.07" y2="19.07" />
              <line x1="19.07" y1="4.93"  x2="16.95" y2="7.05"  />
              <line x1="7.05"  y1="16.95" x2="4.93"  y2="19.07" />
            </g>
          </svg>
        ) : (
          // Moon icon
          <svg viewBox="0 0 24 24" width="44" height="44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" fill="#7090c0" />
          </svg>
        )}
      </button>}
    </>
  )
}
