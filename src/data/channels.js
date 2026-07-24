export const GITHUB_USER = 'Haloman363'
export const FEATURED_REPO = 'rune-claude'

export const LANG_COLORS = {
  Python: '#3572A5',
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  PowerShell: '#012456',
  Rust: '#dea584',
  HTML: '#e34c26',
  CSS: '#563d7c',
}

const base = import.meta.env.BASE_URL

export const EXCLUDED_REPOS = ['haloman363-portfolio', 'ctt']

export const NAMED_CHANNELS = [
  { id: 'mii-channel',   label: 'Mii Channel',       sprite: `${base}wii/sprites/channel-mii.svg`,        page: 0, slot: 0 },
  { id: 'wii-shop',      label: 'Referrals',           sprite: `${base}wii/sprites/channel-referrals.svg`,  page: 0, slot: 8 },
  { id: 'check-mii-out', label: 'Check Mii Out',      sprite: `${base}wii/sprites/channel-makerworld.svg`, page: 0, slot: 9 },
  { id: 'github',        label: 'GitHub',              sprite: `${base}wii/sprites/channel-github.svg`,    page: 0, slot: 10 },
  { id: 'linkedin',      label: 'LinkedIn',            sprite: `${base}wii/sprites/channel-linkedin.svg`,   page: 0, slot: 11 },
  { id: 'venmo',         label: 'Venmo',               sprite: `${base}wii/sprites/channel-venmo.svg`,      page: 0, slot: 12 },
]

export const REFERRAL_LINKS = [
  { name: 'Ally Bank', desc: '$100 welcome bonus referral', href: 'https://ally.com/referral?code=7C9J9N9V9B', accent: '#c9a84c' },
  { name: 'Discover', desc: 'Cashback card referral', href: 'https://refer.discover.com/s/jaymesbunce6', accent: '#f97316' },
  { name: 'Capital One', desc: 'Card referral with bonus benefits', href: 'https://i.capitalone.com/GCvRtodqH', accent: '#a855f7' },
]
