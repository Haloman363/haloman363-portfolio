import styles from './CertBadge.module.css'

// Simple issuer marks (original glyphs, not the companies' logos) drawn as
// round badges so the Certifications list is scannable at a glance.
const ISSUERS = {
  Anthropic: { bg: '#d97757', fg: '#fff', glyph: 'A' },
  Google: { bg: '#fff', fg: '#4285f4', glyph: 'G', ring: '#4285f4' },
  'TestOut Corporation': { bg: '#0f766e', fg: '#fff', glyph: 'T' },
}
const FALLBACK = { bg: '#64748b', fg: '#fff', glyph: '★' }

export default function CertBadge({ issuer, size = 40 }) {
  const { bg, fg, glyph, ring } = ISSUERS[issuer] ?? FALLBACK
  return (
    <span
      className={styles.badge}
      aria-hidden="true"
      style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.5,
        boxShadow: ring ? `inset 0 0 0 2px ${ring}` : undefined }}
    >
      {glyph}
    </span>
  )
}
