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

  return { enabled, toggle, playHover, playSelect, playBack, playClick }
}
