import styles from './CertBadge.module.css'
import anthropic from '../assets/issuers/anthropic.svg'
import google from '../assets/issuers/google.svg'

// Official marks from the simple-icons set, shown on a white tile. Issuers
// without a logo file yet fall back to a lettered circle (TestOut: the only
// current source, testout.com, now serves CompTIA branding, so add the file
// to src/assets/issuers/ and list it here once there's a proper one).
const LOGOS = { Anthropic: anthropic, Google: google }
const FALLBACK = { bg: '#0f766e', glyph: 'T' }
const LETTERED = { 'TestOut Corporation': FALLBACK }

export default function CertBadge({ issuer, size = 40 }) {
  const logo = LOGOS[issuer]
  if (logo) {
    return (
      <span className={styles.tile} aria-hidden="true" style={{ width: size, height: size }}>
        <img src={logo} alt="" width={size * 0.6} height={size * 0.6} />
      </span>
    )
  }
  const { bg, glyph } = LETTERED[issuer] ?? { bg: '#64748b', glyph: '★' }
  return (
    <span className={styles.letter} aria-hidden="true"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.5 }}>
      {glyph}
    </span>
  )
}
