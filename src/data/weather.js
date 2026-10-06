// Weather + location helpers for the Forecast channel.
// All services are free, keyless and CORS-enabled:
//   - Open-Meteo            forecast + city search  (https://open-meteo.com)
//   - GeoJS                 approximate location from the visitor's IP
//   - BigDataCloud          reverse geocode for browser (GPS) coordinates

const TIMEOUT_MS = 10000

async function getJSON(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json()
}

const joinParts = (...parts) => parts.filter(Boolean).join(', ')

// Approximate, city-level location from the visitor's IP. No permission prompt.
export async function locateByIP() {
  const d = await getJSON('https://get.geojs.io/v1/ip/geo.json')
  const lat = parseFloat(d.latitude)
  const lon = parseFloat(d.longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('No location')
  return { lat, lon, name: joinParts(d.city, d.region) || d.country || 'Your area' }
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
