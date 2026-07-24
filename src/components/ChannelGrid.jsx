import { useState, useEffect, useCallback } from 'react'
import ChannelSlot from './ChannelSlot'
import { NAMED_CHANNELS, GITHUB_USER, FEATURED_REPO, EXCLUDED_REPOS } from '../data/channels'
import styles from './ChannelGrid.module.css'

const SLOTS_PER_PAGE = 12
const COLS = 4
const ROWS = 3

// Slots are stored in row-major reading order (left to right, top to bottom),
// with blanks pushed to the end. Desktop's column layout is derived from this
// at render time; tablet/phone consume it directly since they flow row-major too.
function buildSlots(namedChannels, repos) {
  const named = [...namedChannels].sort((a, b) => a.slot - b.slot)

  const featured = repos.find(r => r.name === FEATURED_REPO)
  const rest = repos.filter(r => r.name !== FEATURED_REPO)
  const repoChannels = [
    ...(featured ? [repoToChannel(featured, true)] : []),
    ...rest.map(r => repoToChannel(r, false)),
  ]

  const flat = [...named, ...repoChannels].slice(0, SLOTS_PER_PAGE)

  return [[...flat, ...Array(SLOTS_PER_PAGE - flat.length).fill(null)]]
}

function repoToChannel(repo, featured) {
  return {
    id: `repo-${repo.name}`,
    label: repo.name,
    sprite: null,
    language: repo.language,
    description: repo.description,
    url: repo.html_url,
    stars: repo.stargazers_count,
    featured,
  }
}

export default function ChannelGrid({ onSelect, onHover, page, onPrev, onNext, onSlotsReady }) {
  const [slots, setSlots] = useState(() => buildSlots(NAMED_CHANNELS, []))

  useEffect(() => {
    const controller = new AbortController()
    async function loadRepos() {
      try {
        const res = await fetch(
          `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`,
          {
            headers: { Accept: 'application/vnd.github.v3+json' },
            signal: controller.signal,
          }
        )
        if (!res.ok) throw new Error()
        const data = await res.json()
        const filtered = data
          .filter(r => !r.fork && r.name !== GITHUB_USER.toLowerCase() && !EXCLUDED_REPOS.includes(r.name))
          .sort((a, b) => b.stargazers_count - a.stargazers_count)
        setSlots(buildSlots(NAMED_CHANNELS, filtered))
      } catch (err) {
        if (err.name === 'AbortError') return
      }
    }
    loadRepos()
    return () => controller.abort()
  }, [])

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
