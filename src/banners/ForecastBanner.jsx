import { useEffect, useState } from 'react'
import { Bubbles } from '../components/BannerParts'
import parts from '../components/BannerParts.module.css'
import {
  locateByIP, nameForCoords, searchPlaces, fetchForecast,
  describe, toF, kmhToMph, defaultUnit,
} from '../data/weather'
import styles from './ForecastBanner.module.css'

function WeatherIcon({ kind, night = false, size = 64 }) {
  const cloud = (fill = '#fff', dy = 0) => (
    <path d="M18 50h28a10 10 0 0 0 1.5-19.9A14 14 0 0 0 21 33.5 8.5 8.5 0 0 0 18 50z" transform={`translate(0 ${dy})`} fill={fill} />
  )
  const sun = (cx, cy, r) => (
    <g>
      <g stroke="#ffd34d" strokeWidth="3" strokeLinecap="round">
        {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
          <line key={a} x1={cx} y1={cy - r - 4} x2={cx} y2={cy - r - 9} transform={`rotate(${a} ${cx} ${cy})`} />
        ))}
      </g>
      <circle cx={cx} cy={cy} r={r} fill="#ffd34d" />
    </g>
  )
  const moon = (cx, cy, r) => (
    <path d={`M${cx + r * 0.6} ${cy - r}a${r} ${r} 0 1 0 ${r * 0.9} ${r * 1.6}a${r * 0.85} ${r * 0.85} 0 0 1 -${r * 0.9} -${r * 1.6}z`} fill="#f4f1c8" />
  )
  let body
  switch (kind) {
    case 'clear':
      body = night ? moon(32, 32, 14) : sun(32, 32, 12)
      break
    case 'partly':
      body = (<>{night ? moon(24, 24, 11) : sun(24, 24, 9)}{cloud()}</>)
      break
    case 'fog':
      body = (
        <>
          {cloud('#e4e8ec', -6)}
          <g stroke="#e4e8ec" strokeWidth="3" strokeLinecap="round">
            <line x1="14" y1="48" x2="50" y2="48" /><line x1="18" y1="55" x2="46" y2="55" />
          </g>
        </>
      )
      break
    case 'rain':
      body = (
        <>
          {cloud('#dfe6ee', -6)}
          <g stroke="#5fb4ff" strokeWidth="3.5" strokeLinecap="round">
            <line x1="24" y1="48" x2="21" y2="56" /><line x1="34" y1="48" x2="31" y2="56" /><line x1="44" y1="48" x2="41" y2="56" />
          </g>
        </>
      )
      break
    case 'snow':
      body = (
        <>
          {cloud('#e9eff5', -6)}
          <g fill="#fff"><circle cx="24" cy="51" r="3" /><circle cx="34" cy="55" r="3" /><circle cx="44" cy="51" r="3" /></g>
        </>
      )
      break
    case 'storm':
      body = (
        <>
          {cloud('#aeb6c4', -6)}
          <polygon points="35,40 26,54 33,54 29,63 43,47 35,47 39,40" fill="#ffd34d" />
        </>
      )
      break
    default:
      body = cloud('#e6ebf0')
  }
  return <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">{body}</svg>
}

// Sky colours by conditions and time of day.
function skyFor(kind, isDay) {
  if (!isDay && (kind === 'clear' || kind === 'partly')) return ['#22336e', '#0b1230']
  const day = {
    clear: ['#4fb0f7', '#1d6fc4'],
    partly: ['#5aa9e6', '#2f78bf'],
    cloud: ['#8aa4bd', '#566e87'],
    fog: ['#9aa7b3', '#6a7885'],
    rain: ['#62809c', '#31475d'],
    snow: ['#a9c4dc', '#6a88a6'],
    storm: ['#4d4d70', '#22223a'],
  }[kind] ?? ['#5aa9e6', '#2f78bf']
  return isDay ? day : [day[1], '#0d1424']
}

function dayName(date, index) {
  if (index === 0) return 'Today'
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString([], { weekday: 'short' })
}

export default function ForecastBanner({ sfx }) {
  const hover = sfx?.playHover
  const click = sfx?.playClick

  const [place, setPlace] = useState(null)        // { lat, lon, name }
  const [locFailed, setLocFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)        // bump to retry the forecast
  const [forecast, setForecast] = useState(null)   // { key, data?, error? }
  const [unit, setUnit] = useState(defaultUnit)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)     // null = no search yet
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState(false)
  const [geoError, setGeoError] = useState('')

  // 1. Approximate location from IP (no permission prompt) when the channel opens.
  useEffect(() => {
    let cancelled = false
    locateByIP()
      .then(p => { if (!cancelled) setPlace(p) })
      .catch(() => { if (!cancelled) setLocFailed(true) })
    return () => { cancelled = true }
  }, [])

  // 2. Forecast for whatever place is current.
  const key = place ? `${place.lat},${place.lon},${attempt}` : null
  useEffect(() => {
    if (!place) return
    let cancelled = false
    fetchForecast(place.lat, place.lon)
      .then(data => { if (!cancelled) setForecast({ key, data }) })
      .catch(error => { if (!cancelled) setForecast({ key, error }) })
    return () => { cancelled = true }
  }, [place, key])

  function locateMe() {
    click?.()
    setGeoError('')
    if (!navigator.geolocation) {
      setGeoError('Your browser can’t share its location.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude: lat, longitude: lon } = pos.coords
        setPlace({ lat, lon, name: 'Your location' })
        setResults(null)
        const name = await nameForCoords(lat, lon)
        setPlace(p => (p && p.lat === lat && p.lon === lon ? { ...p, name } : p))
      },
      () => setGeoError('Location permission was declined. Try searching for a city instead.'),
      { timeout: 10000, maximumAge: 10 * 60 * 1000 }
    )
  }

  async function onSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    click?.()
    setSearching(true)
    setSearchError(false)
    try {
      setResults(await searchPlaces(query))
    } catch {
      setSearchError(true)
    } finally {
      setSearching(false)
    }
  }

  function choose(p) {
    click?.()
    setPlace(p)
    setResults(null)
    setQuery('')
    setGeoError('')
  }

  const current = forecast && forecast.key === key ? forecast : null
  const data = current?.data
  const error = current?.error
  const loading = place && !current
  const desc = data ? describe(data.current.code) : null
  const [skyTop, skyBottom] = desc ? skyFor(desc.kind, data.current.isDay) : ['#5aa9e6', '#2f78bf']

  const temp = c => Math.round(unit === 'f' ? toF(c) : c)
  const wind = k => (unit === 'f' ? `${Math.round(kmhToMph(k))} mph` : `${Math.round(k)} km/h`)

  return (
    <div className={styles.fc} style={{ '--sky-top': skyTop, '--sky-bottom': skyBottom }}>
      <Bubbles />
      <div className={styles.inner}>
        <h1 className={`${styles.title} ${parts.rise}`}>Forecast Channel</h1>

        {/* Location line + controls */}
        <div className={`${styles.where} ${parts.rise}`} style={{ '--i': 1 }}>
          <span className={styles.placeName}>
            {place ? place.name : locFailed ? 'Where are you?' : 'Finding your area…'}
          </span>
          <div className={styles.controls}>
            <button className={styles.chipBtn} onClick={locateMe} onMouseEnter={hover}>
              Use my exact location
            </button>
            <button
              className={styles.chipBtn}
              onClick={() => { click?.(); setUnit(u => (u === 'f' ? 'c' : 'f')) }}
              onMouseEnter={hover}
              aria-label={`Switch to °${unit === 'f' ? 'C' : 'F'}`}
            >
              °{unit === 'f' ? 'F' : 'C'}
            </button>
          </div>
        </div>

        <form className={`${styles.search} ${parts.rise}`} style={{ '--i': 2 }} onSubmit={onSearch}>
          <input
            className={styles.input}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search for a city"
            aria-label="Search for a city"
            autoComplete="off"
          />
          <button className={styles.chipBtn} type="submit" disabled={searching} onMouseEnter={hover}>
            {searching ? '…' : 'Search'}
          </button>
        </form>

        {geoError && <p className={styles.note} role="alert">{geoError}</p>}
        {searchError && <p className={styles.note} role="alert">Couldn’t search right now. Try again in a moment.</p>}
        {results && (
          <ul className={styles.results}>
            {results.length === 0 && <li className={styles.note}>No matches found.</li>}
            {results.map(r => (
              <li key={`${r.lat},${r.lon}`}>
                <button className={styles.result} onClick={() => choose(r)} onMouseEnter={hover}>{r.name}</button>
              </li>
            ))}
          </ul>
        )}

        {/* Weather */}
        {loading && <p className={styles.status}>Checking the skies…</p>}
        {locFailed && !place && (
          <p className={styles.status}>
            We couldn’t guess your location. Search for a city or use your exact location above.
          </p>
        )}
        {error && (
          <div className={styles.status} role="alert">
            <p>Couldn’t load the forecast.</p>
            <button className={styles.chipBtn} onClick={() => { click?.(); setAttempt(a => a + 1) }}>Try again</button>
          </div>
        )}

        {data && (
          <>
            <div className={`${styles.now} ${parts.rise}`} style={{ '--i': 3 }}>
              <WeatherIcon kind={desc.kind} night={!data.current.isDay} size={120} />
              <div className={styles.nowText}>
                <span className={styles.temp}>{temp(data.current.temp)}°</span>
                <span className={styles.cond}>{desc.label}</span>
              </div>
            </div>

            <div className={`${styles.facts} ${parts.rise}`} style={{ '--i': 4 }}>
              <span>Feels like <b>{temp(data.current.feels)}°</b></span>
              <span>Humidity <b>{Math.round(data.current.humidity)}%</b></span>
              <span>Wind <b>{wind(data.current.wind)}</b></span>
            </div>

            <ul className={`${styles.days} ${parts.rise}`} style={{ '--i': 5 }}>
              {data.days.map((d, i) => (
                <li key={d.date} className={styles.day} onMouseEnter={hover}>
                  <span className={styles.dayName}>{dayName(d.date, i)}</span>
                  <WeatherIcon kind={describe(d.code).kind} size={44} />
                  <span className={styles.hi}>{temp(d.hi)}°</span>
                  <span className={styles.lo}>{temp(d.lo)}°</span>
                  {d.rain != null && <span className={styles.rain}>{Math.round(d.rain)}%</span>}
                </li>
              ))}
            </ul>
          </>
        )}

        <p className={styles.credit}>
          Weather by{' '}
          <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo</a>.
          Your approximate location comes from your IP address and isn’t stored.
        </p>
      </div>
    </div>
  )
}
