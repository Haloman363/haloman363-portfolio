import { useEffect, useRef, useState } from 'react'
import styles from './ScrollRail.module.css'

const MIN_THUMB = 36
const GAP = 14 // space between the content column and the rail

// Right edge of the visible content column (cards, text, lists...) in the panel's own
// layout pixels, ignoring decorative or full-bleed elements. Measured relative to the panel
// and divided by its on-screen scale, so it stays correct while the channel is mid-zoom/slide.
function contentRight(root, rootRect, scale, limit) {
  let right = 0
  for (const el of root.querySelectorAll('a, button, li, p, h1, h2, h3, img, input, figure')) {
    if (el.closest('[aria-hidden="true"]')) continue
    const r = el.getBoundingClientRect()
    if (r.width < 1 || r.height < 1) continue
    const rel = (r.right - rootRect.left) / scale
    if (rel > limit) continue
    if (rel > right) right = rel
  }
  return right
}

// Finds the element inside a channel that actually scrolls (the largest overflowing one).
function findScroller(root) {
  let best = null
  for (const el of [root, ...root.querySelectorAll('*')]) {
    if (el.scrollHeight <= el.clientHeight + 2) continue
    const oy = getComputedStyle(el).overflowY
    if (oy !== 'auto' && oy !== 'scroll') continue
    if (!best || el.clientHeight > best.clientHeight) best = el
  }
  return best
}

// A themed scrollbar drawn beside the content instead of at the screen edge (where the
// frame and the nav arrows sit on top of a native one). Native scrolling is untouched:
// wheel, keyboard and touch all scroll the real element; the rail only mirrors its position
// and adds drag / click-the-track. Hidden on touch devices, which keep their own indicators.
export default function ScrollRail({ rootRef }) {
  const railRef = useRef(null)
  const scrollerRef = useRef(null)
  const drag = useRef(null)
  const [m, setM] = useState({ show: false, top: 0, height: 0, right: null })

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    let raf = 0

    function measure() {
      raf = 0
      const scroller = findScroller(root)
      scrollerRef.current = scroller
      const rail = railRef.current
      if (!scroller || !rail) {
        setM(prev => (prev.show ? { ...prev, show: false } : prev))
        return
      }
      const track = rail.clientHeight
      const ratio = scroller.clientHeight / scroller.scrollHeight
      const height = Math.max(MIN_THUMB, Math.round(track * ratio))
      const range = scroller.scrollHeight - scroller.clientHeight
      const top = range > 0 ? Math.round((scroller.scrollTop / range) * (track - height)) : 0

      // Hug the content column, but never come closer to the screen edge than the nav arrow.
      const rootRect = root.getBoundingClientRect()
      const width = root.offsetWidth
      const scale = width ? rootRect.width / width : 1
      const arrow = parseFloat(getComputedStyle(root).getPropertyValue('--arrow-inset')) || 64
      const railW = rail.offsetWidth || 12
      const minRight = arrow + 12
      const edge = contentRight(root, rootRect, scale || 1, width - arrow - railW - GAP)
      const right = edge ? Math.max(minRight, Math.round(width - edge - GAP - railW)) : null
      setM(prev => (prev.show && prev.top === top && prev.height === height && prev.right === right ? prev : { show: true, top, height, right }))
    }
    const schedule = () => { if (!raf) raf = requestAnimationFrame(measure) }

    schedule()
    const ro = new ResizeObserver(schedule)
    ro.observe(root)
    const mo = new MutationObserver(schedule)       // async content (news, forecast, photos...)
    mo.observe(root, { childList: true, subtree: true })
    root.addEventListener('scroll', schedule, true)  // scroll doesn't bubble; capture it
    root.addEventListener('load', schedule, true)    // images changing heights
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      mo.disconnect()
      root.removeEventListener('scroll', schedule, true)
      root.removeEventListener('load', schedule, true)
      window.removeEventListener('resize', schedule)
    }
  }, [rootRef])

  function onThumbDown(e) {
    const scroller = scrollerRef.current
    if (!scroller) return
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { y: e.clientY, scrollTop: scroller.scrollTop }
  }

  function onThumbMove(e) {
    const d = drag.current
    const scroller = scrollerRef.current
    const rail = railRef.current
    if (!d || !scroller || !rail) return
    const trackRoom = rail.clientHeight - m.height
    const range = scroller.scrollHeight - scroller.clientHeight
    if (trackRoom <= 0) return
    scroller.scrollTop = d.scrollTop + ((e.clientY - d.y) * range) / trackRoom
  }

  function onThumbUp() {
    drag.current = null
  }

  // Click on the empty track: page toward the click, like a native scrollbar.
  function onTrackDown(e) {
    const scroller = scrollerRef.current
    if (!scroller || e.target !== e.currentTarget) return
    const rect = e.currentTarget.getBoundingClientRect()
    const dir = e.clientY - rect.top < m.top ? -1 : 1
    scroller.scrollBy({ top: dir * scroller.clientHeight * 0.9, behavior: 'smooth' })
  }

  return (
    <div
      ref={railRef}
      className={`${styles.rail}${m.show ? '' : ` ${styles.hidden}`}`}
      onPointerDown={onTrackDown}
      style={m.right != null ? { right: m.right } : undefined}
      aria-hidden="true"
    >
      <div
        className={styles.thumb}
        style={{ height: m.height, transform: `translateY(${m.top}px)` }}
        onPointerDown={onThumbDown}
        onPointerMove={onThumbMove}
        onPointerUp={onThumbUp}
        onPointerCancel={onThumbUp}
      />
    </div>
  )
}
