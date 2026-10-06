import { useMemo, useEffect } from 'react'
import ChannelSlot from './ChannelSlot'
import { NAMED_CHANNELS, SLOTS_PER_PAGE } from '../data/channels'
import styles from './ChannelGrid.module.css'

const COLS = 4
const ROWS = 3

// Slots are stored in row-major reading order (left to right, top to bottom),
// with blanks pushed to the end. Desktop's column layout is derived from this
// at render time; tablet/phone consume it directly since they flow row-major too.
function buildSlots(namedChannels) {
  const named = [...namedChannels].sort((a, b) => a.slot - b.slot)
  const pages = []
  for (let i = 0; i < Math.max(named.length, 1); i += SLOTS_PER_PAGE) {
    const chunk = named.slice(i, i + SLOTS_PER_PAGE)
    pages.push([...chunk, ...Array(SLOTS_PER_PAGE - chunk.length).fill(null)])
  }
  return pages
}

// Arrow keys move focus to the nearest tile in that direction (geometric, so it
// works for the desktop column layout and the tablet/phone grids alike).
function handleArrowNav(e) {
  const dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]
  if (!dir) return
  const tiles = [...e.currentTarget.querySelectorAll('[data-channel-tile]')]
  const current = tiles.indexOf(document.activeElement)
  if (current === -1) return
  const center = el => {
    const r = el.getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  }
  const from = center(tiles[current])
  let best = null
  for (const el of tiles) {
    if (el === tiles[current]) continue
    const c = center(el)
    const along = (c.x - from.x) * dir[0] + (c.y - from.y) * dir[1]
    const across = Math.abs((c.x - from.x) * dir[1]) + Math.abs((c.y - from.y) * dir[0])
    if (along <= 4) continue
    const score = along + across * 2
    if (!best || score < best.score) best = { el, score }
  }
  if (best) {
    e.preventDefault()
    best.el.focus()
    best.el.scrollIntoView({ block: 'nearest' })
  }
}

export default function ChannelGrid({ onSelect, onHover, page, onSlotsReady, inert }) {
  const slots = useMemo(() => buildSlots(NAMED_CHANNELS), [])

  useEffect(() => {
    if (!onSlotsReady) return
    const flat = slots.flat().filter(Boolean)
    onSlotsReady(flat)
  }, [slots, onSlotsReady])

  const currentSlots = slots[page]
  // currentSlots is row-major (reading order); regroup into column-major for
  // desktop's flex-column layout, where each .col renders top-to-bottom. Each
  // slot also carries its row-major index as a CSS `order`, so the tablet
  // breakpoint (which flattens .col via display:contents and grid auto-flow)
  // still reads left-to-right, top-to-bottom regardless of DOM order.
  const cols = Array.from({ length: COLS }, (_, ci) =>
    Array.from({ length: ROWS }, (_, ri) => {
      const rowMajorIndex = ri * COLS + ci
      return { channel: currentSlots[rowMajorIndex], order: rowMajorIndex }
    })
  )

  return (
    <div className={styles.topSection} onKeyDown={handleArrowNav} inert={inert}>
      <div className={styles.channels}>
        {cols.map((col, ci) => (
          <div key={ci} className={`${styles.col} ${ci === 0 ? styles.first : ''}`}>
            {col.map(({ channel, order }, ri) => (
              <ChannelSlot
                key={channel?.id ?? `empty-${page}-${ci}-${ri}`}
                channel={channel}
                onSelect={onSelect}
                onHover={onHover}
                style={{ order }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
