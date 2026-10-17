import { useRef, useState } from 'react'
import styles from './ResumeBanner.module.css'
import { PROFILE, EDUCATION, EXPERIENCE, SKILLS, CERTIFICATIONS, INTERESTS } from '../data/resume'
import CertBadge from '../components/CertBadge'
import CertMii from '../components/CertMii'

const TABS = ['Summary', 'Experience', 'Education', 'Skills', 'Certifications', 'Interests']

const RESUME_PDF = `${import.meta.env.BASE_URL}resume/Jaymes-Bunce-Resume.pdf`

// Deterministic 0-1 pseudo-random per card, so the mess is the same every run (and testable).
const rand = (i, salt) => ((i * 9301 + salt * 49297) % 233280) / 233280
const SHARE = [0, 0.35, 0.65, 1]    // fraction of cards disturbed at each chaos level
const TILT = [0, 10, 24, 40]        // max rotation, degrees
const DROP = [0, 6, 28, 60]         // downward shove, px
const SPREAD = [0, 8, 20, 40]       // sideways shove, px
const messOf = (i, chaos) => {
  if (rand(i, 1) >= SHARE[chaos]) return undefined
  const x = (rand(i, 2) - 0.5) * SPREAD[chaos]
  const y = DROP[chaos] * (0.5 + rand(i, 3))
  const r = (rand(i, 4) - 0.5) * TILT[chaos]
  return `translate(${x}px, ${y}px) rotate(${r}deg)`
}

export default function ResumeBanner({ sfx }) {
  const [tab, setTab] = useState('Summary')
  const [chaos, setChaos] = useState(0)
  // Each badge has its own mess level so the Mii can knock them one at a time.
  const [levels, setLevels] = useState(() => CERTIFICATIONS.map(() => 0))
  const cardEls = useRef([])
  const knock = (i, level) => setLevels(ls => ls.map((l, j) => (j === i ? level : l)))
  const plan = next => CERTIFICATIONS.map((_, i) => i).filter(i => messOf(i, next) !== messOf(i, levels[i]))

  return (
    <div className={styles.resume}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.name}>{PROFILE.name}</h1>
          <p className={styles.tagline}>System Administrator &middot; Logan, UT (Ready to Relocate)</p>
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
          <>
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
              const cardStyle = { transform: messOf(i, levels[i]) }
              const setRef = el => { cardEls.current[i] = el }
              return c.url ? (
                <a key={c.name} className={`${styles.certCard} ${styles.certLink}`} href={c.url} style={cardStyle} ref={setRef}
                  target="_blank" rel="noopener noreferrer" title="Verify credential">{body}</a>
              ) : (
                <div key={c.name} className={styles.certCard} style={cardStyle} ref={setRef}>{body}</div>
              )
            })}
            </div>
            <CertMii chaos={chaos} levels={levels} plan={plan} cardEls={cardEls} onKnock={knock} onSettle={setChaos} sfx={sfx} />
          </>
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
