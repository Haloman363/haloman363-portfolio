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

export const NAMED_CHANNELS = [
  { id: 'mii-channel',   label: 'Mii Channel',       sprite: `${base}wii/sprites/channel-mii.svg`,        page: 0, slot: 0 },
  { id: 'photo-channel', label: 'Photo Channel',      sprite: `${base}wii/sprites/channel-photo.svg`,      page: 0, slot: 1 },
  { id: 'wii-shop',      label: 'Wii Shop Channel',   sprite: `${base}wii/sprites/channel-shop.svg`,       page: 0, slot: 8 },
  { id: 'check-mii-out', label: 'Check Mii Out',      sprite: `${base}wii/sprites/channel-makerworld.svg`, page: 0, slot: 9 },
  { id: 'linkedin',      label: 'LinkedIn',            sprite: `${base}wii/sprites/channel-linkedin.svg`,   page: 0, slot: 10 },
  { id: 'venmo',         label: 'Venmo',               sprite: `${base}wii/sprites/channel-venmo.svg`,      page: 1, slot: 0 },
]

export const REFERRAL_LINKS = [
  { name: 'Ally Bank', desc: '$100 welcome bonus referral', href: 'https://ally.com/referral?code=7C9J9N9V9B', accent: '#c9a84c' },
  { name: 'Discover', desc: 'Cashback card referral', href: 'https://refer.discover.com/s/jaymesbunce6', accent: '#f97316' },
  { name: 'Capital One', desc: 'Card referral with bonus benefits', href: 'https://i.capitalone.com/GCvRtodqH', accent: '#a855f7' },
]
