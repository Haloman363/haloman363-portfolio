import styles from './ChannelSlot.module.css'
import { LANG_COLORS } from '../data/channels'

export default function ChannelSlot({ channel, onSelect, onHover }) {
  if (!channel) {
    return (
      <div className={`${styles.slot} ${styles.empty}`} aria-hidden="true">
        <span className={styles.emptyInner} />
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
      className={styles.slot}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      role="button"
      tabIndex={0}
      aria-label={`Open ${channel.label}`}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
    >
      {isRepo ? (
        <div className={styles.repoTile}>
          {channel.language && (
            <span
              className={styles.langDot}
              style={{ background: LANG_COLORS[channel.language] ?? '#888' }}
            />
          )}
          <span className={styles.repoName}>{channel.label}</span>
        </div>
      ) : channel.sprite ? (
        <>
          <img className={styles.sprite} src={channel.sprite} alt="" aria-hidden="true" />
          <span className={styles.label}>{channel.label}</span>
        </>
      ) : (
        <span className={styles.label}>{channel.label}</span>
      )}
    </div>
  )
}
