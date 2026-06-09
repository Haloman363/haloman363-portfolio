import { useRef, useState, useCallback } from 'react'

export function useWiiAudio() {
  const [enabled, setEnabled] = useState(false)
  const enabledRef = useRef(false)
  const bgmRef = useRef(null)
  const unlockedRef = useRef(false)

  function unlock() {
    if (unlockedRef.current) return
    unlockedRef.current = true
    const bgm = new Audio('/wii/audio/bg-music.mp3')
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
        const connect = new Audio('/wii/audio/sfx-connect.mp3')
        connect.volume = 0.7
        connect.play().catch(() => {})
        connect.addEventListener('ended', () => {
          bgmRef.current?.play().catch(() => {})
        })
      } else {
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

  const playHover  = useCallback(() => playSfx('/wii/audio/sfx-hover.mp3'),  [playSfx])
  const playSelect = useCallback(() => playSfx('/wii/audio/sfx-zip.mp3'),    [playSfx])
  const playBack   = useCallback(() => playSfx('/wii/audio/sfx-back.mp3'),   [playSfx])
  const playClick  = useCallback(() => playSfx('/wii/audio/sfx-click.mp3'),  [playSfx])

  return { enabled, toggle, playHover, playSelect, playBack, playClick }
}
