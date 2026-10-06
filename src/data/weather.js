// Weather + location helpers for the Forecast channel.
// All services are free, keyless and CORS-enabled:
//   - Open-Meteo            forecast + city search  (https://open-meteo.com)
//   - GeoJS / ipwho.is /    approximate location from the visitor's IP (tried in order,
//     BigDataCloud / ipapi    so one being blocked or down doesn't break the channel)
//   - BigDataCloud          also reverse-geocodes browser (GPS) coordinates

const TIMEOUT_MS = 10000

async function getJSON(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json()
}

const joinParts = (...parts) => parts.filter(Boolean).join(', ')

const PROVIDER_TIMEOUT_MS = 6000

// Each provider maps its own response shape onto { lat, lon, name }.
const IP_PROVIDERS = [
  {
    id: 'geojs',
    url: 'https://get.geojs.io/v1/ip/geo.json',
    parse: d => ({ lat: parseFloat(d.latitude), lon: parseFloat(d.longitude), name: joinParts(d.city, d.region) || d.country }),
  },
  {
    id: 'ipwho.is',
    url: 'https://ipwho.is/',
    parse: d => {
      if (d.success === false) throw new Error(d.message || 'lookup failed')
      return { lat: Number(d.latitude), lon: Number(d.longitude), name: joinParts(d.city, d.region) || d.country }
    },
  },
  {
    // With no coordinates supplied, BigDataCloud locates the caller by IP.
    id: 'bigdatacloud',
    url: 'https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en',
    parse: d => ({ lat: Number(d.latitude), lon: Number(d.longitude), name: joinParts(d.city || d.locality, d.principalSubdivision) || d.countryName }),
  },
  {
    id: 'ipapi.co',
    url: 'https://ipapi.co/json/',
    parse: d => {
      if (d.error) throw new Error(d.reason || 'lookup failed')
      return { lat: Number(d.latitude), lon: Number(d.longitude), name: joinParts(d.city, d.region) || d.country_name }
    },
  },
]

// Approximate, city-level location from the visitor's IP. No permission prompt.
// Providers are tried one at a time (so usually only one service ever sees the
// request); each failure is logged to the console to make blocked requests easy to spot.
export async function locateByIP() {
  for (const p of IP_PROVIDERS) {
    try {
      const res = await fetch(p.url, { signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const { lat, lon, name } = p.parse(await res.json())
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('no coordinates in response')
      return { lat, lon, name: name || 'Your area' }
    } catch (err) {
      console.warn(`[forecast] ${p.id} location lookup failed: ${err.message}`)
    }
  }
  throw new Error('All location providers failed')
}

// Friendly name for exact coordinates; falls back to a generic label.
export async function nameForCoords(lat, lon) {
  try {
    const d = await getJSON(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    )
    return joinParts(d.city || d.locality, d.principalSubdivision) || d.countryName || 'Your location'
  } catch {
    return 'Your location'
  }
}

export async function searchPlaces(query) {
  const q = query.trim()
  if (!q) return []
  const d = await getJSON(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=en&format=json`
  )
  return (d.results ?? []).map(r => ({
    lat: r.latitude,
    lon: r.longitude,
    name: joinParts(r.name, r.admin1, r.country_code),
  }))
}

// Temperatures come back in °C and wind in km/h; the UI converts for display.
export async function fetchForecast(lat, lon) {
  const url =
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${lat}&longitude=${lon}` +
    '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day' +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max' +
    '&timezone=auto&forecast_days=5'
  const d = await getJSON(url)
  if (!d.current || !d.daily) throw new Error('Unexpected forecast response')
  return {
    current: {
      temp: d.current.temperature_2m,
      feels: d.current.apparent_temperature,
      humidity: d.current.relative_humidity_2m,
      wind: d.current.wind_speed_10m,
      code: d.current.weather_code,
      isDay: d.current.is_day === 1,
    },
    days: d.daily.time.map((date, i) => ({
      date,
      code: d.daily.weather_code[i],
      hi: d.daily.temperature_2m_max[i],
      lo: d.daily.temperature_2m_min[i],
      rain: d.daily.precipitation_probability_max?.[i] ?? null,
    })),
  }
}

// WMO weather codes -> label + icon kind.
export function describe(code) {
  if (code === 0) return { label: 'Clear', kind: 'clear' }
  if (code === 1) return { label: 'Mostly clear', kind: 'clear' }
  if (code === 2) return { label: 'Partly cloudy', kind: 'partly' }
  if (code === 3) return { label: 'Overcast', kind: 'cloud' }
  if (code === 45 || code === 48) return { label: 'Fog', kind: 'fog' }
  if (code >= 51 && code <= 57) return { label: 'Drizzle', kind: 'rain' }
  if (code >= 61 && code <= 67) return { label: 'Rain', kind: 'rain' }
  if (code >= 71 && code <= 77) return { label: 'Snow', kind: 'snow' }
  if (code >= 80 && code <= 82) return { label: 'Rain showers', kind: 'rain' }
  if (code === 85 || code === 86) return { label: 'Snow showers', kind: 'snow' }
  if (code >= 95) return { label: 'Thunderstorm', kind: 'storm' }
  return { label: 'Unknown', kind: 'cloud' }
}

export const toF = c => (c * 9) / 5 + 32
export const kmhToMph = k => k * 0.621371

// US (and a few others) default to °F; everyone else °C. Visitor can toggle.
export function defaultUnit() {
  const lang = (typeof navigator !== 'undefined' && navigator.language) || ''
  return /-(US|LR|MM)$/i.test(lang) ? 'f' : 'c'
}

// Shown when the visitor's location can't be determined: a spread of places with
// very different weather, picked at random. Curated so names are always right
// (no extra lookup) and every spot is somewhere interesting.
export const RANDOM_PLACES = [
  ['Reykjavik, Iceland', 64.15, -21.94], ['Tromsø, Norway', 69.65, 18.96], ['Longyearbyen, Svalbard', 78.22, 15.65],
  ['Oslo, Norway', 59.91, 10.75], ['London, UK', 51.51, -0.13], ['Paris, France', 48.86, 2.35],
  ['Lisbon, Portugal', 38.72, -9.14], ['Istanbul, Türkiye', 41.01, 28.98], ['Moscow, Russia', 55.76, 37.62],
  ['Yakutsk, Russia', 62.03, 129.73], ['Ulaanbaatar, Mongolia', 47.89, 106.91], ['Tokyo, Japan', 35.68, 139.69],
  ['Seoul, South Korea', 37.57, 126.98], ['Kathmandu, Nepal', 27.72, 85.32], ['Mumbai, India', 19.08, 72.88],
  ['Bangkok, Thailand', 13.76, 100.5], ['Singapore', 1.35, 103.82], ['Dubai, UAE', 25.2, 55.27],
  ['Cairo, Egypt', 30.04, 31.24], ['Marrakesh, Morocco', 31.63, -7.99], ['Lagos, Nigeria', 6.52, 3.38],
  ['Addis Ababa, Ethiopia', 9.03, 38.74], ['Nairobi, Kenya', -1.29, 36.82], ['Cape Town, South Africa', -33.92, 18.42],
  ['Perth, Australia', -31.95, 115.86], ['Sydney, Australia', -33.87, 151.21], ['Auckland, New Zealand', -36.85, 174.76],
  ['Suva, Fiji', -18.14, 178.44], ['Honolulu, Hawaii', 21.31, -157.86], ['Anchorage, Alaska', 61.22, -149.9],
  ['Vancouver, Canada', 49.28, -123.12], ['Mexico City, Mexico', 19.43, -99.13], ['Havana, Cuba', 23.11, -82.37],
  ['Quito, Ecuador', -0.18, -78.47], ['Lima, Peru', -12.05, -77.04], ['Rio de Janeiro, Brazil', -22.91, -43.17],
  ['Buenos Aires, Argentina', -34.6, -58.38], ['Santiago, Chile', -33.45, -70.67], ['Ushuaia, Argentina', -54.8, -68.3],
].map(([name, lat, lon]) => ({ name, lat, lon }))

// A random spot, never the same one as `exclude` (so "shuffle" always changes it).
export function randomPlace(exclude) {
  const pool = exclude ? RANDOM_PLACES.filter(p => p.name !== exclude.name) : RANDOM_PLACES
  return pool[Math.floor(Math.random() * pool.length)]
}
