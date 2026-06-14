import { useState, useEffect } from 'react'
import styles from './WiiHeader.module.css'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

function formatTime(d) {
  const day = DAYS[d.getDay()]
  let h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${day}  ${h}:${m} ${ampm}`
}

export default function WiiHeader() {
  const [time, setTime] = useState(() => formatTime(new Date()))

  useEffect(() => {
    const id = setInterval(() => setTime(formatTime(new Date())), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className={styles.header}>
      <span className={styles.clock}>{time}</span>
    </header>
  )
}
