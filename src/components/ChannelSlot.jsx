import styles from './ChannelSlot.module.css'
import { LANG_COLORS } from '../data/channels'

export default function ChannelSlot({ channel, onSelect, onHover }) {
  if (!channel) {
    return (
      <div className={`${styles.channelIcon} ${styles.blank}`} aria-hidden="true">
        <div className={styles.hover} />
      </div>
    )
  }

  function handleClick() {
    onSelect?.(channel.id, channel)
  }

  function handleMouseEnter() {
    onHover?.()
  }

  const isRepo = channel.id.startsWith('repo-') || channel.id === 'rune-claude'

  return (
    <div
      className={`${styles.channelIcon} ${styles.occupied}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      role="button"
      tabIndex={0}
      aria-label={`Open ${channel.label}`}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
    >
      {isRepo ? (
        <div className={styles.repoInner}>
          {channel.language && (
            <span
              className={styles.langDot}
              style={{ background: LANG_COLORS[channel.language] ?? '#888' }}
            />
          )}
          <span className={styles.repoName}>{channel.label}</span>
        </div>
      ) : channel.sprite ? (
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
