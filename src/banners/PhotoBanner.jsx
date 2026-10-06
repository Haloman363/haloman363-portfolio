import { useEffect, useRef, useState } from 'react'
import { PHOTOS } from '../data/photos'
import styles from './PhotoBanner.module.css'

export default function PhotoBanner({ sfx }) {
  const hover = sfx?.playHover
  const click = sfx?.playClick

  const [openIndex, setOpenIndex] = useState(null)
  const thumbRefs = useRef([])
  const closeRef = useRef(null)
  const touchStart = useRef(null)
  const lastOpened = useRef(0)
  const isOpen = openIndex !== null
  const count = PHOTOS.length

  function open(i) {
    click?.()
    lastOpened.current = i
    setOpenIndex(i)
  }

  function close() {
    click?.()
    const back = lastOpened.current
    setOpenIndex(null)
    requestAnimationFrame(() => thumbRefs.current[back]?.focus())
  }

  function step(delta) {
    setOpenIndex(i => {
      const next = (i + delta + count) % count
      lastOpened.current = next
      return next
    })
  }

  // While the viewer is open it owns the keyboard: capture-phase + stopImmediatePropagation
  // keeps the app's own handlers (Escape closes the channel, arrows switch channels) from also firing.
  useEffect(() => {
    if (!isOpen) return
    function onKey(e) {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowLeft') step(-1)
      else if (e.key === 'ArrowRight') step(1)
      else return
      e.preventDefault()
      e.stopImmediatePropagation()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
    // close/step only touch refs and a state setter, so they're stable enough to omit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  useEffect(() => {
    if (isOpen) closeRef.current?.focus()
  }, [isOpen])

  // Warm the neighbours so stepping through feels instant.
  useEffect(() => {
    if (!isOpen || count < 2) return
    for (const d of [-1, 1]) new Image().src = PHOTOS[(openIndex + d + count) % count].src
  }, [isOpen, openIndex, count])

  // Own swipe handling; stopPropagation keeps the channel-level swipe from also firing.
  function onTouchStart(e) {
    e.stopPropagation()
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
  }

  function onTouchEnd(e) {
    e.stopPropagation()
    const s = touchStart.current
    touchStart.current = null
    if (!s) return
    const t = e.changedTouches[0]
    const dx = t.clientX - s.x
    const dy = t.clientY - s.y
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return
    step(dx < 0 ? 1 : -1)
  }

  const photo = isOpen ? PHOTOS[openIndex] : null

  return (
    <div className={styles.photo}>
      <header className={styles.head}>
        <h1 className={styles.title}>Photo Channel</h1>
        <p className={styles.count}>{count} {count === 1 ? 'photo' : 'photos'}</p>
      </header>

      {count === 0 ? (
        <p className={styles.empty}>No photos yet.</p>
      ) : (
        <ul className={styles.grid}>
          {PHOTOS.map((p, i) => (
            <li key={p.file}>
              <button
                ref={el => { thumbRefs.current[i] = el }}
                className={styles.thumb}
                onClick={() => open(i)}
                onMouseEnter={hover}
                aria-label={`Open photo: ${p.caption || p.alt}`}
              >
                <img src={p.src} alt="" loading="lazy" decoding="async" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {photo && (
        <div
          className={styles.viewer}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button className={styles.close} ref={closeRef} onClick={close} onMouseEnter={hover} aria-label="Close photo viewer">✕</button>

          <figure className={styles.figure}>
            <img className={styles.full} src={photo.src} alt={photo.alt} />
            <figcaption className={styles.caption}>
              {photo.caption && <span className={styles.captionText}>{photo.caption}</span>}
              <span className={styles.counter}>{openIndex + 1} / {count}</span>
            </figcaption>
          </figure>

          {count > 1 && (
            <>
              <button className={`${styles.nav} ${styles.prev}`} onClick={() => { click?.(); step(-1) }} onMouseEnter={hover} aria-label="Previous photo">‹</button>
              <button className={`${styles.nav} ${styles.next}`} onClick={() => { click?.(); step(1) }} onMouseEnter={hover} aria-label="Next photo">›</button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
