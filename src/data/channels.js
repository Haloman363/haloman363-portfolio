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
  { id: 'mii-channel',   label: 'Mii Channel',       sprite: `${base}wii/sprites/channel-mii.svg`,        blinkSprite: `${base}wii/sprites/channel-mii-blink.svg`, page: 0, slot: 0 },
  { id: 'resume',        label: 'Resume',              sprite: `${base}wii/sprites/channel-resume.svg`,     page: 0, slot: 1 },
  { id: 'wii-shop',      label: 'Referrals',           sprite: `${base}wii/sprites/channel-referrals.svg`,  page: 0, slot: 8 },
  { id: 'check-mii-out', label: 'Check Mii Out',      sprite: `${base}wii/sprites/channel-makerworld.svg`, page: 0, slot: 9 },
  { id: 'github',        label: 'GitHub',              sprite: `${base}wii/sprites/channel-github.svg`,    page: 0, slot: 10 },
  { id: 'linkedin',      label: 'LinkedIn',            sprite: `${base}wii/sprites/channel-linkedin.svg`,   page: 0, slot: 11 },
  { id: 'venmo',         label: 'Venmo',               sprite: `${base}wii/sprites/channel-venmo.svg`,      page: 0, slot: 12 },
  { id: 'cool-jaymes-games', label: 'Cool Jaymes Games', sprite: `${base}wii/sprites/channel-coolgames.svg`, page: 0, slot: 13 },
  { id: 'dog-vision',     label: 'Dog Vision',        sprite: `${base}wii/sprites/channel-dogvision.svg`,  page: 0, slot: 14 },
  { id: 'dolos21',        label: 'Dolos://21',        sprite: `${base}wii/sprites/channel-dolos21.svg`,    page: 0, slot: 15 },
]

export const REFERRAL_LINKS = [
  { name: 'Ally Bank', desc: '$100 welcome bonus referral', href: 'https://ally.com/referral?code=7C9J9N9V9B', accent: '#c9a84c' },
  { name: 'Discover', desc: 'Cashback card referral', href: 'https://refer.discover.com/s/jaymesbunce6', accent: '#f97316' },
  { name: 'Capital One', desc: 'Card referral with bonus benefits', href: 'https://i.capitalone.com/GCvRtodqH', accent: '#a855f7' },
  { name: 'Amazon Prime Visa', desc: 'Prime Visa card referral', href: 'https://www.amazon.com/dp/BT00LN946S?externalReferenceId=7707afa3-9fb6-48a4-aec7-c36c6fcdf8bb', accent: '#00a8e1' },
  { name: 'Venmo', desc: 'Sign up for Venmo with my invite', href: 'https://get.venmo.com/3HrXU3Q5A6b', accent: '#3d95ce' },
  { name: 'PayPal', desc: 'Sign up for PayPal with my referral', href: 'https://py.pl/3NGu1', accent: '#0070e0' },
]
