// Data layer for the News Channel: recent public GitHub activity.
import { GITHUB_USER, EXCLUDED_REPOS } from './channels'

const CACHE_KEY = 'news-github-events'
const CACHE_MS = 10 * 60 * 1000
const MAX_ITEMS = 10

function readCache() {
  try {
    const c = JSON.parse(sessionStorage.getItem(CACHE_KEY))
    if (c && Date.now() - c.at < CACHE_MS) return c.events
  } catch { /* storage unavailable or corrupt: just refetch */ }
  return null
}

function writeCache(events) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), events }))
  } catch { /* ignore */ }
}

// Unauthenticated GitHub API allows 60 requests/hour/IP, so cache for the session.
export async function fetchGitHubEvents(signal) {
  const cached = readCache()
  if (cached) return cached
  const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/events/public?per_page=50`, {
    headers: { Accept: 'application/vnd.github+json' },
    signal,
  })
  if (res.status === 403 || res.status === 429) throw new Error('rate-limited')
  if (!res.ok) throw new Error(`GitHub responded ${res.status}`)
  const events = await res.json()
  writeCache(events)
  return events
}

const firstLine = s => String(s ?? '').split('\n')[0].trim()
const clip = (s, n = 90) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)
const repoOf = e => e.repo?.name?.split('/')[1] ?? e.repo?.name ?? 'a repo'
const repoUrl = e => `https://github.com/${e.repo?.name}`

// Turn a raw GitHub event into { id, kind, title, detail?, href, at } or null to skip.
export function toNewsItem(e) {
  const repo = repoOf(e)
  const base = { id: e.id, at: e.created_at }
  const p = e.payload ?? {}

  switch (e.type) {
    case 'PushEvent': {
      if (p.ref?.startsWith('refs/tags/')) return null
      // GitHub may omit the commits array; fall back to the push size / head sha.
      const commits = p.commits ?? []
      const count = commits.length || p.distinct_size || p.size || 1
      const msg = commits.length ? clip(firstLine(commits[commits.length - 1].message)) : null
      return {
        ...base,
        kind: 'push',
        title: `Pushed ${count === 1 ? 'a commit' : `${count} commits`} to ${repo}`,
        detail: msg,
        href: p.head ? `${repoUrl(e)}/commit/${p.head}` : repoUrl(e),
      }
    }
    case 'CreateEvent':
      if (p.ref_type === 'repository') return { ...base, kind: 'repo', title: `Created ${repo}`, detail: clip(p.description ?? '') || null, href: repoUrl(e) }
      if (p.ref_type === 'tag') return { ...base, kind: 'release', title: `Tagged ${p.ref} in ${repo}`, href: `${repoUrl(e)}/releases/tag/${p.ref}` }
      return null
    case 'ReleaseEvent':
      return { ...base, kind: 'release', title: `Released ${p.release?.name || p.release?.tag_name || 'a version'} of ${repo}`, href: p.release?.html_url ?? repoUrl(e) }
    case 'PullRequestEvent':
      if (!['opened', 'closed', 'reopened'].includes(p.action)) return null
      return {
        ...base,
        kind: 'pr',
        title: `${p.pull_request?.merged ? 'Merged' : p.action === 'closed' ? 'Closed' : 'Opened'} PR #${p.number} in ${repo}`,
        detail: clip(firstLine(p.pull_request?.title)) || null,
        href: p.pull_request?.html_url ?? repoUrl(e),
      }
    case 'IssuesEvent':
      if (!['opened', 'closed', 'reopened'].includes(p.action)) return null
      return {
        ...base,
        kind: 'issue',
        title: `${p.action === 'closed' ? 'Closed' : 'Opened'} issue #${p.issue?.number} in ${repo}`,
        detail: clip(firstLine(p.issue?.title)) || null,
        href: p.issue?.html_url ?? repoUrl(e),
      }
    case 'WatchEvent':
      return { ...base, kind: 'star', title: `Starred ${e.repo?.name}`, href: repoUrl(e) }
    case 'ForkEvent':
      return { ...base, kind: 'fork', title: `Forked ${e.repo?.name}`, href: p.forkee?.html_url ?? repoUrl(e) }
    case 'PublicEvent':
      return { ...base, kind: 'repo', title: `Made ${repo} public`, href: repoUrl(e) }
    default:
      return null
  }
}

// Newest first, minus noise and repos hidden elsewhere on the site.
export function buildNews(events) {
  const seen = new Set()
  const items = []
  for (const e of events) {
    if (EXCLUDED_REPOS.includes(e.repo?.name?.split('/')[1])) continue
    const item = toNewsItem(e)
    if (!item) continue
    // collapse back-to-back pushes to the same repo into one line
    const key = `${item.kind}:${item.title}`
    if (item.kind === 'push' && seen.has(key)) continue
    seen.add(key)
    items.push(item)
    if (items.length >= MAX_ITEMS) break
  }
  return items
}

const UNITS = [
  ['year', 31536000], ['month', 2592000], ['week', 604800],
  ['day', 86400], ['hour', 3600], ['minute', 60],
]

export function timeAgo(iso, now = Date.now()) {
  const secs = Math.round((new Date(iso).getTime() - now) / 1000)
  const rtf = new Intl.RelativeTimeFormat([], { numeric: 'auto' })
  for (const [unit, size] of UNITS) {
    if (Math.abs(secs) >= size) return rtf.format(Math.round(secs / size), unit)
  }
  return 'just now'
}
