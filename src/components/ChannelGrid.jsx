import { useState, useEffect, useCallback } from 'react'
import ChannelSlot from './ChannelSlot'
import { NAMED_CHANNELS, GITHUB_USER, FEATURED_REPO } from '../data/channels'
import styles from './ChannelGrid.module.css'

const SLOTS_PER_PAGE = 12
const TOTAL_PAGES = 2

function buildSlots(namedChannels, repos) {
  const pages = Array.from({ length: TOTAL_PAGES }, () => Array(SLOTS_PER_PAGE).fill(null))

  for (const ch of namedChannels) {
    pages[ch.page][ch.slot] = ch
  }

  const featured = repos.find(r => r.name === FEATURED_REPO)
  if (featured) {
    pages[0][2] = repoToChannel(featured, true)
  }

  const rest = repos.filter(r => r.name !== FEATURED_REPO).slice(0, 5)
  let slotIdx = 3
  for (const repo of rest) {
    if (slotIdx > 7) break
    if (!pages[0][slotIdx]) pages[0][slotIdx] = repoToChannel(repo, false)
    slotIdx++
  }

  return pages
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
          .filter(r => !r.fork && r.name !== GITHUB_USER.toLowerCase())
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
  const cols = [
    currentSlots.slice(0, 3),
    currentSlots.slice(3, 6),
    currentSlots.slice(6, 9),
    currentSlots.slice(9, 12),
  ]

  return (
    <div className={styles.topSection}>
      <div className={styles.channels}>
        {cols.map((col, ci) => (
          <div key={ci} className={`${styles.col} ${ci === 0 ? styles.first : ''}`}>
            {col.map((channel, ri) => (
              <ChannelSlot
                key={channel?.id ?? `empty-${page}-${ci}-${ri}`}
                channel={channel}
                onSelect={onSelect}
                onHover={onHover}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
