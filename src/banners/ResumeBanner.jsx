import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { messOf } from '../data/certMess'
import styles from './ResumeBanner.module.css'
import { PROFILE, EDUCATION, EXPERIENCE, SKILLS, CERTIFICATIONS, INTERESTS } from '../data/resume'
import CertBadge from '../components/CertBadge'

const TABS = ['Summary', 'Experience', 'Education', 'Skills', 'Certifications', 'Interests']

const RESUME_PDF = `${import.meta.env.BASE_URL}resume/Jaymes-Bunce-Resume.pdf`

export default function ResumeBanner() {
  const [tab, setTab] = useState('Summary')
  const [levels, setLevels] = useState(() => CERTIFICATIONS.map(() => 0))
  const levelsRef = useRef(levels)
  const cardEls = useRef([])
  useEffect(() => { levelsRef.current = levels }, [levels])

  // On the Certifications tab the site Mii may offer to "help" with the badges. He gets this
  // handle (via MenuMii's `mii:certs-tab` listener) to walk to cards and knock them.
  useEffect(() => {
    if (tab !== 'Certifications') return undefined
    const set = (i, level) => setLevels(ls => ls.map((l, j) => (j === i ? level : l)))
    const api = {
      el: i => cardEls.current[i],
      set,
      targets: next => CERTIFICATIONS.map((_, i) => i)
        .filter(i => JSON.stringify(messOf(i, next)) !== JSON.stringify(messOf(i, levelsRef.current[i]))),
      reset: async () => {
        for (let i = 0; i < levelsRef.current.length; i++) {
          if (levelsRef.current[i]) { set(i, 0); await new Promise(r => setTimeout(r, 70)) }
        }
      },
    }
    window.dispatchEvent(new CustomEvent('mii:certs-tab', { detail: api }))
    return () => {
      window.dispatchEvent(new CustomEvent('mii:certs-tab', { detail: null }))
      setLevels(ls => ls.map(() => 0))
    }
  }, [tab])

  return (
    <div className={styles.resume}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.name}>{PROFILE.name}</h1>
          <p className={styles.tagline}>System Administrator &middot; Logan, UT (Ready to Relocate)</p>
          <p className={styles.links}>
            <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer">{PROFILE.linkedin.replace('https://www.', '')}</a>
            {' · '}
            <a href={PROFILE.site} target="_blank" rel="noopener noreferrer">{PROFILE.site.replace('https://', '')}</a>
          </p>
        </div>
        <a className={styles.download} href={RESUME_PDF} download target="_blank" rel="noopener noreferrer">
          Download Resume ↓
        </a>
      </div>

      <div className={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className={styles.panel}>
        {tab === 'Summary' && (
          <div className={styles.summary}>
            <p className={styles.summaryText}>
              {PROFILE.summary}
            </p>
            <img
              className={styles.photo}
              src={`${import.meta.env.BASE_URL}resume/jaymes-bunce.jpg`}
              alt="Jaymes Bunce"
            />
          </div>
        )}

        {tab === 'Education' && (
          <div className={styles.summary}>
            {EDUCATION.map(e => (
              <div key={e.school} className={styles.eduCard}>
                <p className={styles.eduSchool}>{e.school}</p>
                <p className={styles.eduDegree}>{e.degree}</p>
                <p className={styles.eduDate}>{e.date}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'Experience' && (
          <div className={styles.experience}>
            {EXPERIENCE.map(job => (
              <div key={job.role} className={styles.job}>
                <div className={styles.jobHead}>
                  <div>
                    <p className={styles.jobRole}>{job.role}</p>
                    <p className={styles.jobCompany}>{job.company} &middot; {job.location}</p>
                  </div>
                  <span className={styles.jobDates}>{job.dates}</span>
                </div>
                <ul className={styles.bullets}>
                  {job.bullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}

        {tab === 'Skills' && (
          <div className={styles.skills}>
            {SKILLS.map(s => (
              <div key={s.group} className={styles.skillGroup}>
                <p className={styles.skillGroupTitle}>{s.group}</p>
                <div className={styles.tags}>
                  {s.items.map(item => <span key={item} className={styles.tag}>{item}</span>)}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'Certifications' && (
          <div className={styles.certs}>
            {CERTIFICATIONS.map((c, i) => {
              const body = (
                <>
                  <CertBadge issuer={c.issuer} />
                  <div className={styles.certText}>
                    <p className={styles.certName}>{c.name}</p>
                    <p className={styles.certIssuer}>{c.issuer}</p>
                  </div>
                  <span className={styles.certDate}>{c.date}</span>
                </>
              )
              // Knocked cards spring to their new spot, so they wobble before they settle.
              const motionProps = {
                ref: el => { cardEls.current[i] = el },
                animate: messOf(i, levels[i]) ?? { x: 0, y: 0, rotate: 0 },
                transition: { type: 'spring', stiffness: 220, damping: 9, mass: 0.8 },
              }
              return c.url ? (
                <motion.a key={c.name} className={`${styles.certCard} ${styles.certLink}`} href={c.url}
                  target="_blank" rel="noopener noreferrer" title="Verify credential" {...motionProps}>{body}</motion.a>
              ) : (
                <motion.div key={c.name} className={styles.certCard} {...motionProps}>{body}</motion.div>
              )
            })}
          </div>
        )}

        {tab === 'Interests' && (
          <div className={styles.interests}>
            {INTERESTS.map(g => (
              <div key={g.title} className={styles.interestGroup}>
                <p className={styles.skillGroupTitle}>{g.title}</p>
                <div className={styles.tags}>
                  {g.items.map(item => <span key={item} className={styles.tag}>{item}</span>)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
