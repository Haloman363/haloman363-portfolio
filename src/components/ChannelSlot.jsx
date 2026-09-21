import { useEffect, useRef, useState } from 'react'
import styles from './ChannelSlot.module.css'

const TILT_DEG = 6

export default function ChannelSlot({ channel, onSelect, onHover, style }) {
  const faceRef = useRef(null)
  const [blink, setBlink] = useState(false)
  const blinkSprite = channel?.blinkSprite

  // Idle blink for tiles that ship a blink variant (the Mii). Same loose
  // cadence as the About page Mii.
  useEffect(() => {
    if (!blinkSprite) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    new Image().src = blinkSprite
    let wait, open
    const schedule = () => {
      wait = setTimeout(() => {
        setBlink(true)
        open = setTimeout(() => setBlink(false), 140)
        schedule()
      }, 3000 + Math.random() * 3500)
    }
    schedule()
    return () => { clearTimeout(wait); clearTimeout(open) }
  }, [blinkSprite])

  // `order` doubles as the entrance stagger index (row-major reading order).
  const slotStyle = { ...style, '--n': style?.order ?? 0 }

  if (!channel) {
    return (
      <div className={`${styles.channelIcon} ${styles.blank}`} style={slotStyle} aria-hidden="true">
        <div className={styles.hover} />
      </div>
    )
  }

  function handleClick(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    onSelect?.(channel.id, channel, {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      width: rect.width,
      height: rect.height,
    })
  }

  function handleMouseEnter() {
    onHover?.()
  }

  // Tilt toward the pointer. Written straight to CSS vars so mousemove doesn't
  // re-render React.
  function handleMouseMove(e) {
    const face = faceRef.current
    if (!face) return
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    face.style.setProperty('--rx', `${(-py * TILT_DEG).toFixed(2)}deg`)
    face.style.setProperty('--ry', `${(px * TILT_DEG).toFixed(2)}deg`)
  }

  function handleMouseLeave() {
    faceRef.current?.style.removeProperty('--rx')
    faceRef.current?.style.removeProperty('--ry')
  }

  return (
    <div
      className={`${styles.channelIcon} ${styles.occupied}`}
      style={slotStyle}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      aria-label={`Open ${channel.label}`}
      onKeyDown={e => e.key === 'Enter' && handleClick(e)}
    >
      <div className={styles.face} ref={faceRef}>
        {channel.sprite ? (
          <img src={blink ? blinkSprite : channel.sprite} alt={channel.label} />
        ) : (
          <div className={styles.textInner}>
            <span className={styles.textLabel}>{channel.label}</span>
          </div>
        )}
        <div className={styles.hover} />
        <div className={styles.gloss} />
      </div>
    </div>
  )
}
