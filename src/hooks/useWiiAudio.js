import { useEffect, useRef, useState, useCallback } from 'react'

const base = import.meta.env.BASE_URL

const PREF_KEY = 'wii-sound'
const MUSIC_VOLUME = 0.4
const FADE_MS = 350

function readSoundPref() {
  try { return localStorage.getItem(PREF_KEY) === 'on' } catch { return false }
}

function saveSoundPref(on) {
  try { localStorage.setItem(PREF_KEY, on ? 'on' : 'off') } catch { /* storage unavailable */ }
}

// Smoothly move an <audio> element's volume, optionally pausing it at the end.
function fadeTo(audio, volume, then) {
  clearInterval(audio._fade)
  const from = audio.volume
  const steps = 14
  let i = 0
  audio._fade = setInterval(() => {
    i += 1
    audio.volume = Math.min(1, Math.max(0, from + ((volume - from) * i) / steps))
    if (i >= steps) {
      clearInterval(audio._fade)
      then?.()
    }
  }, FADE_MS / steps)
}

export function useWiiAudio() {
  const [enabled, setEnabled] = useState(false)
  const enabledRef = useRef(false)
  const bgmRef = useRef(null)
  const miiRef = useRef(null)
  const themeRef = useRef('menu') // which background track should be playing: 'menu' | 'mii'
  const startupRef = useRef(null)
  const unlockedRef = useRef(false)

  function unlock() {
    if (unlockedRef.current) return
    unlockedRef.current = true
    const bgm = new Audio(`${base}wii/audio/bg-music.mp3`)
    bgm.loop = true
    bgm.volume = MUSIC_VOLUME
    bgmRef.current = bgm
    // The Mii Channel theme is ~3.5 MB, so only fetch it when it's actually needed.
    const mii = new Audio(`${base}wii/audio/mii-channel-theme.mp3`)
    mii.loop = true
    mii.preload = 'none'
    mii.volume = 0
    miiRef.current = mii
  }

  // Crossfade between the menu music and the Mii Channel theme.
  function applyTheme() {
    const menu = bgmRef.current
    const mii = miiRef.current
    if (!enabledRef.current || !menu || !mii) return
    const [on, off] = themeRef.current === 'mii' ? [mii, menu] : [menu, mii]
    if (on.paused) {
      on.volume = 0
      on.play().catch(() => {})
    }
    fadeTo(on, MUSIC_VOLUME)
    if (!off.paused) fadeTo(off, 0, () => off.pause())
  }

  const setTheme = useCallback((theme) => {
    themeRef.current = theme
    // Only switch once the startup chime has handed over to the music.
    if (!startupRef.current) applyTheme()
  }, [])

  const setSound = useCallback((next) => {
    unlock()
    enabledRef.current = next
    setEnabled(next)
    saveSoundPref(next)
    if (next) {
      const startup = new Audio(`${base}wii/audio/sfx-startup.mp3`)
      startup.volume = 0.7
      startupRef.current = startup
      startup.play().catch(() => {})
      startup.addEventListener('ended', () => {
        startupRef.current = null
        if (enabledRef.current) applyTheme()
      })
    } else {
      if (startupRef.current) {
        startupRef.current.pause()
        startupRef.current.currentTime = 0
        startupRef.current = null
      }
      for (const a of [bgmRef.current, miiRef.current]) {
        if (!a) continue
        clearInterval(a._fade)
        a.pause()
      }
    }
  }, [])

  const toggle = useCallback(() => setSound(!enabledRef.current), [setSound])

  // Browsers won't play audio before the visitor interacts, so a remembered "sound on"
  // resumes on their first click or key press (unless that click is the sound button itself).
  useEffect(() => {
    if (!readSoundPref()) return
    function resume(e) {
      if (e.target.closest?.('[aria-label="Mute audio"], [aria-label="Enable audio"]')) {
        cleanup()
        return
      }
      cleanup()
      if (!enabledRef.current) setSound(true)
    }
    function cleanup() {
      window.removeEventListener('click', resume, true)
      window.removeEventListener('keydown', resume, true)
    }
    window.addEventListener('click', resume, true)
    window.addEventListener('keydown', resume, true)
    return cleanup
  }, [setSound])

  const playSfx = useCallback((src) => {
    if (!enabledRef.current) return
    const sfx = new Audio(src)
    sfx.volume = 0.6
    sfx.play().catch(() => {})
  }, [])

  const playHover  = useCallback(() => playSfx(`${base}wii/audio/sfx-hover.wav`),  [playSfx])
  const playSelect = useCallback(() => playSfx(`${base}wii/audio/sfx-zip.mp3`),    [playSfx])
  const playBack   = useCallback(() => playSfx(`${base}wii/audio/sfx-back.mp3`),   [playSfx])
  const playClick  = useCallback(() => playSfx(`${base}wii/audio/sfx-click.mp3`),  [playSfx])

  // Short synthesized swish for page turns — a quick pitch-swept noise burst,
  // distinct from the click SFX. Generated on the fly so no extra audio asset is needed.
  const playPageTurn = useCallback((direction = 1) => {
    if (!enabledRef.current) return
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const duration = 0.22
    const bufferSize = Math.floor(ctx.sampleRate * duration)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.Q.value = 0.7
    const startFreq = direction >= 0 ? 800 : 2200
    const endFreq = direction >= 0 ? 2200 : 800
    filter.frequency.setValueAtTime(startFreq, ctx.currentTime)
    filter.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.5, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    noise.connect(filter).connect(gain).connect(ctx.destination)
    noise.start()
    noise.stop(ctx.currentTime + duration)
    noise.onended = () => {
      if (ctx.state !== 'closed') ctx.close().catch(() => {})
    }
  }, [])

  return { enabled, toggle, setTheme, playHover, playSelect, playBack, playClick, playPageTurn }
}
