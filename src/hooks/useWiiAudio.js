import { useRef, useState, useCallback } from 'react'

export function useWiiAudio() {
  const [enabled, setEnabled] = useState(false)
  const bgmRef = useRef(null)
  const unlockedRef = useRef(false)

  function unlock() {
    if (unlockedRef.current) return
    unlockedRef.current = true
    const bgm = new Audio('/wii/audio/mii-channel-theme.mp3')
    bgm.loop = true
    bgm.volume = 0.4
    bgmRef.current = bgm
  }

  const toggle = useCallback(() => {
    unlock()
    setEnabled(prev => {
      const next = !prev
      if (next) {
        bgmRef.current?.play().catch(() => {})
      } else {
        bgmRef.current?.pause()
      }
      return next
    })
  }, [])

  const playSfx = useCallback((src) => {
    if (!enabled) return
    const sfx = new Audio(src)
    sfx.volume = 0.6
    sfx.play().catch(() => {})
  }, [enabled])

  const playHover = useCallback(() => playSfx('/wii/audio/sfx-hover.wav'), [playSfx])
  const playSelect = useCallback(() => playSfx('/wii/audio/sfx-select.wav'), [playSfx])
  const playBack = useCallback(() => playSfx('/wii/audio/sfx-back.wav'), [playSfx])

  return { enabled, toggle, playHover, playSelect, playBack }
}
