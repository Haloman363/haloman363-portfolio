import { useMemo, useEffect } from 'react'
import ChannelSlot from './ChannelSlot'
import { NAMED_CHANNELS } from '../data/channels'
import styles from './ChannelGrid.module.css'

const SLOTS_PER_PAGE = 12
const COLS = 4
const ROWS = 3

// Slots are stored in row-major reading order (left to right, top to bottom),
// with blanks pushed to the end. Desktop's column layout is derived from this
// at render time; tablet/phone consume it directly since they flow row-major too.
function buildSlots(namedChannels) {
  const named = [...namedChannels].sort((a, b) => a.slot - b.slot)
  const flat = named.slice(0, SLOTS_PER_PAGE)
  return [[...flat, ...Array(SLOTS_PER_PAGE - flat.length).fill(null)]]
}

export default function ChannelGrid({ onSelect, onHover, page, onPrev, onNext, onSlotsReady }) {
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
    <div className={styles.topSection}>
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
