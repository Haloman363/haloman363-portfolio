import { useRef, useState, useCallback } from 'react'

const base = import.meta.env.BASE_URL

export function useWiiAudio() {
  const [enabled, setEnabled] = useState(false)
  const enabledRef = useRef(false)
  const bgmRef = useRef(null)
  const startupRef = useRef(null)
  const unlockedRef = useRef(false)

  function unlock() {
    if (unlockedRef.current) return
    unlockedRef.current = true
    const bgm = new Audio(`${base}wii/audio/bg-music.mp3`)
    bgm.loop = true
    bgm.volume = 0.4
    bgmRef.current = bgm
  }

  const toggle = useCallback(() => {
    unlock()
    setEnabled(prev => {
      const next = !prev
      enabledRef.current = next
      if (next) {
        const startup = new Audio(`${base}wii/audio/sfx-startup.mp3`)
        startup.volume = 0.7
        startupRef.current = startup
        startup.play().catch(() => {})
        startup.addEventListener('ended', () => {
          if (enabledRef.current) bgmRef.current?.play().catch(() => {})
        })
      } else {
        if (startupRef.current) {
          startupRef.current.pause()
          startupRef.current.currentTime = 0
          startupRef.current = null
        }
        bgmRef.current?.pause()
      }
      return next
    })
  }, [])

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

  return { enabled, toggle, playHover, playSelect, playBack, playClick, playPageTurn }
}
