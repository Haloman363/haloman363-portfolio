import styles from './ChannelSlot.module.css'

export default function ChannelSlot({ channel, onSelect, onHover, style }) {
  if (!channel) {
    return (
      <div className={`${styles.channelIcon} ${styles.blank}`} style={style} aria-hidden="true">
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

  return (
    <div
      className={`${styles.channelIcon} ${styles.occupied}`}
      style={style}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      role="button"
      tabIndex={0}
      aria-label={`Open ${channel.label}`}
      onKeyDown={e => e.key === 'Enter' && handleClick(e)}
    >
      {channel.sprite ? (
        <img src={channel.sprite} alt={channel.label} />
      ) : (
        <div className={styles.textInner}>
          <span className={styles.textLabel}>{channel.label}</span>
        </div>
      )}
      <div className={styles.hover} />
    </div>
  )
}
