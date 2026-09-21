import { useEffect } from 'react'
import styles from './ArtifactBanner.module.css'

// Embeds an external app in the channel, with a link to open it full-size
// in the top-left corner.
export default function ArtifactBanner({ title, sub, href, bg, accent, titleFont }) {
  // The iframe swallows mouse events, so the Wii cursor would freeze at its
  // edge next to the native pointer. Hide it while the pointer is inside.
  useEffect(() => () => document.body.removeAttribute('data-embed-hover'), [])

  return (
    <div className={styles.artifact} style={{ '--bg': bg, '--accent': accent }}>
      <div className={styles.bar}>
        <a className={styles.cta} href={href} target="_blank" rel="noopener noreferrer">
          Open full game ↗
        </a>
        <span className={styles.title} style={titleFont && { fontFamily: titleFont }}>{title}</span>
      </div>
      <p className={styles.sub}>{sub}</p>
      <iframe
        className={styles.frame}
        src={href}
        title={title}
        allow="camera; autoplay; fullscreen"
        loading="lazy"
        onMouseEnter={() => document.body.setAttribute('data-embed-hover', '')}
        onMouseLeave={() => document.body.removeAttribute('data-embed-hover')}
      />
    </div>
  )
}
