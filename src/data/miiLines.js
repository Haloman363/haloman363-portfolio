// What the site Mii says and does per channel. MenuMii plays OPENERS when a channel opens and
// mixes CHATTER into his small talk; banners call miiReact() when their data arrives.
export const OPENERS = {
  'mii-channel': { say: "Hey, that's me!", act: 'wave' },
  resume: { say: 'Look at all those certs!', act: 'cheer' },
  'wii-shop': { say: 'Referral perks!', act: 'clap' },
  'check-mii-out': { say: 'Jaymes prints stuff!', act: 'clap' },
  github: { say: 'So much code...', act: 'lookAround' },
  linkedin: { say: 'Very professional.', act: 'bow' },
  venmo: { say: 'Tip jar!', act: 'cheer' },
  'cool-jaymes-games': { say: 'Game time!', act: 'jack' },
  'dog-vision': { say: 'Woof! How do dogs see?', act: 'lookAround' },
  forecast: { say: 'Checking the sky...', act: 'lookAround' },
  news: { say: 'Extra, extra!', act: 'wave' },
  dolos21: { say: 'Ooh, mysterious.', act: 'shrug' },
  'app-manager': { say: 'Apps, apps, apps.', act: 'clap' },
  'photo-channel': { say: 'Say cheese!', act: 'cheer' },
}

export const CHATTER = {
  resume: ['Try the Certifications tab!', 'Download the PDF up top!'],
  forecast: ['Tap a city to look elsewhere.', 'Fahrenheit or Celsius?'],
  news: ['Fresh from GitHub.', 'Jaymes ships a lot.'],
  'cool-jaymes-games': ['Beat my high score!'],
  'dog-vision': ['Dogs see blue and yellow.'],
}

// Banners tell the Mii something ({ say, act }) once their data has loaded.
export const miiReact = (say, act) => window.dispatchEvent(new CustomEvent('mii:react', { detail: { say, act } }))

// kind: icon kind from data/weather.js describe(); tempC in Celsius.
export function weatherReaction(kind, tempC) {
  if (kind === 'storm') return { say: 'Yikes, thunder!', act: 'shrug' }
  if (kind === 'rain') return { say: 'Bring an umbrella!', act: 'shrug' }
  if (kind === 'snow') return { say: 'Brr, snow!', act: 'cheer' }
  if (tempC >= 30) return { say: 'Phew, it is hot!', act: 'stretch' }
  if (tempC <= 0) return { say: 'Bundle up!', act: 'shrug' }
  if (kind === 'clear') return { say: 'Nice day for a stroll!', act: 'cheer' }
  return { say: 'Not bad out there.', act: 'wave' }
}
