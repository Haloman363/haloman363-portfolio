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

export default function ChannelGrid({ onSelect, onHover }) {
  const [page, setPage] = useState(0)
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
        // Leave named channels in place on error
      }
    }
    loadRepos()
    return () => controller.abort()
  }, [])

  const prevPage = useCallback(() => setPage(p => Math.max(0, p - 1)), [])
  const nextPage = useCallback(() => setPage(p => Math.min(TOTAL_PAGES - 1, p + 1)), [])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowLeft') prevPage()
      if (e.key === 'ArrowRight') nextPage()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prevPage, nextPage])

  const currentSlots = slots[page]

  return (
    <div className={styles.gridWrap}>
      <div className={styles.frame}>
        <div className={styles.grid}>
          {currentSlots.map((channel, i) => (
            <ChannelSlot
              key={channel?.id ?? `empty-${page}-${i}`}
              channel={channel}
              onSelect={onSelect}
              onHover={onHover}
            />
          ))}
        </div>
        <nav className={styles.nav} aria-label="Channel pages">
          <button
            className={styles.arrowBtn}
            onClick={prevPage}
            disabled={page === 0}
            aria-label="Previous page"
          >
            <img src="/wii/sprites/arrow-left.png" alt="←" />
          </button>
          <div className={styles.dots}>
            {Array.from({ length: TOTAL_PAGES }, (_, i) => (
              <span key={i} className={`${styles.dot} ${i === page ? styles.active : ''}`} />
            ))}
          </div>
          <button
            className={styles.arrowBtn}
            onClick={nextPage}
            disabled={page === TOTAL_PAGES - 1}
            aria-label="Next page"
          >
            <img src="/wii/sprites/arrow-right.png" alt="→" />
          </button>
        </nav>
      </div>
    </div>
  )
}
