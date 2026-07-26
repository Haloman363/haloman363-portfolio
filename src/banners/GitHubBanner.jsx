import { useState, useEffect } from 'react'
import styles from './GitHubBanner.module.css'
import { GITHUB_USER, FEATURED_REPO, EXCLUDED_REPOS, LANG_COLORS } from '../data/channels'

export default function GitHubBanner() {
  const [profile, setProfile] = useState(null)
  const [repos, setRepos] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    const opts = { headers: { Accept: 'application/vnd.github.v3+json' }, signal: controller.signal }

    fetch(`https://api.github.com/users/${GITHUB_USER}`, opts)
      .then(res => {
        if (res.status === 403) throw new Error('rate-limited')
        return res.ok ? res.json() : null
      })
      .then(data => data && setProfile(data))
      .catch(err => { if (err.name !== 'AbortError') setError('rate-limited') })

    fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`, opts)
      .then(res => {
        if (res.status === 403) throw new Error('rate-limited')
        return res.ok ? res.json() : []
      })
      .then(data => {
        const filtered = data
          .filter(r => !r.fork && r.name !== GITHUB_USER.toLowerCase() && !EXCLUDED_REPOS.includes(r.name))
          .sort((a, b) => (b.name === FEATURED_REPO) - (a.name === FEATURED_REPO) || b.stargazers_count - a.stargazers_count)
        setRepos(filtered)
      })
      .catch(err => { if (err.name !== 'AbortError') setError('rate-limited') })

    return () => controller.abort()
  }, [])

  return (
    <div className={styles.gh}>
      <div className={styles.header}>
        {profile?.avatar_url ? (
          <img className={styles.avatar} src={profile.avatar_url} alt={GITHUB_USER} />
        ) : (
          <div className={`${styles.avatar} ${styles.skeleton}`} />
        )}
        <div>
          <h1 className={styles.title}>GitHub</h1>
          <p className={styles.handle}>{GITHUB_USER}</p>
        </div>
        {profile ? (
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>{profile.public_repos}</span>
              <span className={styles.statLabel}>Repos</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>{profile.followers}</span>
              <span className={styles.statLabel}>Followers</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>{profile.following}</span>
              <span className={styles.statLabel}>Following</span>
            </div>
          </div>
        ) : !error && (
          <div className={styles.stats}>
            {[0, 1, 2].map(i => (
              <div key={i} className={styles.stat}>
                <span className={`${styles.statNum} ${styles.skeleton} ${styles.skeletonNum}`} />
                <span className={styles.statLabel}>&nbsp;</span>
              </div>
            ))}
          </div>
        )}
        <a
          className={styles.cta}
          href="https://github.com/Haloman363"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Profile ↗
        </a>
      </div>

      {error && (
        <p className={styles.error}>
          Couldn&apos;t load live GitHub data (likely rate-limited) — try again in a bit, or use the profile link above.
        </p>
      )}

      {repos === null && !error && (
        <div className={styles.repoGrid}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`${styles.repoCard} ${styles.skeleton}`} />
          ))}
        </div>
      )}

      {repos?.length > 0 && (
        <div className={styles.repoGrid}>
          {repos.map(r => (
            <a
              key={r.name}
              className={`${styles.repoCard} ${r.name === FEATURED_REPO ? styles.featured : ''}`}
              href={r.html_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.repoName}>{r.name}</span>
              {r.description && <span className={styles.repoDesc}>{r.description}</span>}
              <div className={styles.repoMeta}>
                {r.language && (
                  <span className={styles.langTag}>
                    <span className={styles.langDot} style={{ background: LANG_COLORS[r.language] ?? '#888' }} />
                    {r.language}
                  </span>
                )}
                {r.stargazers_count > 0 && <span className={styles.stars}>★ {r.stargazers_count}</span>}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
