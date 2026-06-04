import styles from './RepoBanner.module.css'
import { LANG_COLORS } from '../data/channels'

export default function RepoBanner({ channel }) {
  if (!channel) return null
  return (
    <div className={styles.repo}>
      {channel.featured && <span className={styles.badge}>Featured Project</span>}
      <h1 className={styles.name}>{channel.label}</h1>
      {channel.description && <p className={styles.desc}>{channel.description}</p>}
      <div className={styles.meta}>
        {channel.language && (
          <span className={styles.langTag}>
            <span
              className={styles.langDot}
              style={{ background: LANG_COLORS[channel.language] ?? '#888' }}
            />
            {channel.language}
          </span>
        )}
        {channel.stars > 0 && (
          <span className={styles.stars}>★ {channel.stars}</span>
        )}
      </div>
      {channel.url && (
        <a className={styles.cta} href={channel.url} target="_blank" rel="noopener noreferrer">
          View on GitHub ↗
        </a>
      )}
    </div>
  )
}
