import styles from './MakerWorldBanner.module.css'
import snapshot from '../data/makerworld-snapshot.json'

export default function MakerWorldBanner() {
  return (
    <div className={styles.mw}>
      <h1 className={styles.title}>MakerWorld</h1>
      <p className={styles.desc}>3D printing models for designers and makers. Check out my profile for prints I&apos;ve shared.</p>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statNum}>{snapshot.designCount}</span>
          <span className={styles.statLabel}>Models</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum}>{snapshot.likes}</span>
          <span className={styles.statLabel}>Likes</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum}>{snapshot.downloads}</span>
          <span className={styles.statLabel}>Downloads</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum}>{snapshot.followers}</span>
          <span className={styles.statLabel}>Followers</span>
        </div>
      </div>

      {snapshot.models.length > 0 && (
        <div className={styles.models}>
          {snapshot.models.map(m => (
            <a
              key={m.url}
              className={styles.modelCard}
              href={m.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img className={styles.modelCover} src={m.coverUrl} alt={m.title} />
              <span className={styles.modelTitle}>{m.title}</span>
              <span className={styles.modelMeta}>♥ {m.likes} &middot; ↓ {m.downloads}</span>
            </a>
          ))}
        </div>
      )}

      <a
        className={styles.cta}
        href="https://makerworld.com/en/@Haloman363"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open MakerWorld ↗
      </a>

      <p className={styles.updated}>
        Stats as of {new Date(snapshot.fetchedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>
    </div>
  )
}
