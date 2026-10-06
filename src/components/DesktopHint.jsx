import { useState } from 'react'
import styles from './DesktopHint.module.css'

const STORAGE_KEY = 'desktop-hint-dismissed'

function wasDismissed() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

// Shown only below the desktop breakpoint (the CSS hides it at >=1024px).
// Dismissal lasts for the browser session.
export default function DesktopHint() {
  const [dismissed, setDismissed] = useState(wasDismissed)
  if (dismissed) return null

  function dismiss() {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // storage unavailable (private mode); just hide for this page view
    }
    setDismissed(true)
  }

  return (
    <div className={styles.hint} role="status">
      <span className={styles.text}>
        Best viewed on a desktop. Check it out there for the full Wii experience!
      </span>
      <button className={styles.close} onClick={dismiss} aria-label="Dismiss message">
        <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
          <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
