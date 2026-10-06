import { useEffect, useState } from 'react'
import parts from '../components/BannerParts.module.css'
import snapshot from '../data/makerworld-snapshot.json'
import { fetchGitHubEvents, buildNews, timeAgo } from '../data/news'
import { GITHUB_USER } from '../data/channels'
import styles from './NewsBanner.module.css'

// Tiny glyphs, one per kind of event.
function Glyph({ kind }) {
  const common = { viewBox: '0 0 16 16', width: 18, height: 18, fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  switch (kind) {
    case 'push':
      return <svg {...common}><circle cx="8" cy="8" r="2.8" /><path d="M0.8 8h4.4M10.8 8h4.4" /></svg>
    case 'repo':
      return <svg {...common}><path d="M3.5 2.5h8a1 1 0 0 1 1 1v9.5h-8a1.5 1.5 0 0 1-1.5-1.5v-8a1 1 0 0 1 .5-1z" /><path d="M4.5 13v1.2l1.6-.9 1.6.9V13" /></svg>
    case 'star':
      return <svg {...common}><path d="M8 1.8l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.5l-3.8 2.1.7-4.3-3.1-3 4.3-.6z" /></svg>
    case 'pr':
      return <svg {...common}><circle cx="4" cy="3.5" r="1.6" /><circle cx="4" cy="12.5" r="1.6" /><circle cx="12" cy="12.5" r="1.6" /><path d="M4 5.1v5.8M12 10.9V6a2 2 0 0 0-2-2H8.5" /></svg>
    case 'issue':
      return <svg {...common}><circle cx="8" cy="8" r="6" /><circle cx="8" cy="8" r="0.9" fill="currentColor" /></svg>
    case 'release':
      return <svg {...common}><path d="M1.8 8.4V2.8h5.6l6.8 6.8-5.6 5.6z" /><circle cx="5" cy="6" r="0.9" fill="currentColor" /></svg>
    case 'fork':
      return <svg {...common}><circle cx="4" cy="3" r="1.5" /><circle cx="12" cy="3" r="1.5" /><circle cx="8" cy="13" r="1.5" /><path d="M4 4.5v1.5a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V4.5M8 8v3.5" /></svg>
    default:
      return null
  }
}

export default function NewsBanner({ sfx }) {
  const hover = sfx?.playHover
  const click = sfx?.playClick

  const [items, setItems] = useState(null)   // null = loading
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    fetchGitHubEvents(controller.signal)
      .then(events => setItems(buildNews(events)))
      .catch(err => {
        if (err.name === 'AbortError') return
        setError(err.message === 'rate-limited' ? 'rate-limited' : 'failed')
        setItems([])
      })
    return () => controller.abort()
  }, [])

  const models = snapshot.models ?? []

  return (
    <div className={styles.news}>
      <div className={styles.inner}>
        <header className={`${styles.head} ${parts.rise}`}>
          <h1 className={styles.title}>News Channel</h1>
          <p className={styles.sub}>The latest from Jaymes</p>
        </header>

        <section className={`${styles.section} ${parts.rise}`} style={{ '--i': 1 }} aria-labelledby="news-gh">
          <h2 className={styles.sectionTitle} id="news-gh">On GitHub</h2>

          {items === null && (
            <ul className={styles.list} aria-busy="true">
              {[0, 1, 2, 3].map(i => <li key={i} className={`${styles.item} ${styles.skeleton}`} />)}
            </ul>
          )}

          {items && items.length > 0 && (
            <ul className={styles.list}>
              {items.map(item => (
                <li key={item.id}>
                  <a className={styles.item} data-kind={item.kind} href={item.href} target="_blank" rel="noopener noreferrer" onMouseEnter={hover} onClick={click}>
                    <span className={styles.icon}><Glyph kind={item.kind} /></span>
                    <span className={styles.text}>
                      <span className={styles.itemTitle}>{item.title}</span>
                      {item.detail && <span className={styles.detail}>{item.detail}</span>}
                    </span>
                    <time className={styles.when} dateTime={item.at}>{timeAgo(item.at)}</time>
                  </a>
                </li>
              ))}
            </ul>
          )}

          {items && items.length === 0 && (
            <p className={styles.empty}>
              {error === 'rate-limited'
                ? 'GitHub is rate-limiting live updates right now. Try again in a bit, or '
                : error
                  ? 'Couldn’t load live GitHub activity. You can '
                  : 'No recent public activity. You can '}
              <a href={`https://github.com/${GITHUB_USER}`} target="_blank" rel="noopener noreferrer">see everything on GitHub</a>.
            </p>
          )}
        </section>

        {models.length > 0 && (
          <section className={`${styles.section} ${parts.rise}`} style={{ '--i': 2 }} aria-labelledby="news-mw">
            <h2 className={styles.sectionTitle} id="news-mw">On MakerWorld</h2>
            <ul className={styles.models}>
              {models.map(m => (
                <li key={m.url}>
                  <a className={styles.model} href={m.url} target="_blank" rel="noopener noreferrer" onMouseEnter={hover} onClick={click}>
                    <img className={styles.cover} src={m.coverUrl} alt="" loading="lazy" />
                    <span className={styles.modelText}>
                      <span className={styles.itemTitle}>{m.title}</span>
                      <span className={styles.detail}>♥ {m.likes} · ↓ {m.downloads} · {m.prints} prints</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <p className={styles.asOf}>
              Stats as of {new Date(snapshot.fetchedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </section>
        )}
      </div>
    </div>
  )
}
