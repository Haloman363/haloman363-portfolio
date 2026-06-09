import { useCursorPhysics } from '../hooks/useCursorPhysics'
import styles from './WiiCursor.module.css'

export default function WiiCursor() {
  const { pos, tilt } = useCursorPhysics()

  return (
    <div
      className={styles.cursor}
      style={{
        transform: `translate(${pos.x - 20}px, ${pos.y - 8}px) rotate(${tilt}deg)`,
      }}
    >
      <img src="/wii/sprites/cursor.png" alt="" aria-hidden="true" />
    </div>
  )
}
