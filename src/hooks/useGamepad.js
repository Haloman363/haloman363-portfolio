import { useEffect } from 'react'

// Maps a standard-layout gamepad onto the keyboard handling the site already has:
// D-pad / left stick = arrow keys, A = Enter, B = Escape, shoulder buttons = left/right.
// Only polls while a pad is connected, so keyboard/mouse visitors pay nothing.
const STICK_THRESHOLD = 0.6
const REPEAT_DELAY = 420
const REPEAT_RATE = 140

const BUTTON_KEYS = { 0: 'Enter', 1: 'Escape', 4: 'ArrowLeft', 5: 'ArrowRight', 12: 'ArrowUp', 13: 'ArrowDown', 14: 'ArrowLeft', 15: 'ArrowRight' }
const REPEATING = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'])

function pressedKeys(pad) {
  const keys = new Set()
  for (const [i, key] of Object.entries(BUTTON_KEYS)) if (pad.buttons[i]?.pressed) keys.add(key)
  const [x = 0, y = 0] = pad.axes
  if (x < -STICK_THRESHOLD) keys.add('ArrowLeft')
  if (x > STICK_THRESHOLD) keys.add('ArrowRight')
  if (y < -STICK_THRESHOLD) keys.add('ArrowUp')
  if (y > STICK_THRESHOLD) keys.add('ArrowDown')
  return keys
}

function press(key) {
  const active = document.activeElement
  const onTile = active?.hasAttribute?.('data-channel-tile')
  // Nothing selected yet: the first direction press just lands on the first tile.
  if (REPEATING.has(key) && !onTile && (!active || active === document.body)) {
    const tile = [...document.querySelectorAll('[data-channel-tile]')].find(t => !t.closest('[inert]'))
    if (tile) {
      tile.focus()
      return
    }
  }
  const target = active && active !== document.body ? active : document.body
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
}

export function useGamepad() {
  useEffect(() => {
    if (!navigator.getGamepads) return
    let raf = 0
    const held = new Map() // key -> time of next repeat (ms)

    function tick(now) {
      const pads = [...navigator.getGamepads()].filter(Boolean)
      const down = new Set()
      for (const pad of pads) for (const k of pressedKeys(pad)) down.add(k)

      for (const key of down) {
        if (!held.has(key)) {
          press(key)
          held.set(key, now + REPEAT_DELAY)
        } else if (REPEATING.has(key) && now >= held.get(key)) {
          press(key)
          held.set(key, now + REPEAT_RATE)
        }
      }
      for (const key of held.keys()) if (!down.has(key)) held.delete(key)

      raf = pads.length ? requestAnimationFrame(tick) : 0
    }

    const start = () => { if (!raf) raf = requestAnimationFrame(tick) }
    const stop = () => {
      if (raf && ![...navigator.getGamepads()].some(Boolean)) {
        cancelAnimationFrame(raf)
        raf = 0
        held.clear()
      }
    }

    window.addEventListener('gamepadconnected', start)
    window.addEventListener('gamepaddisconnected', stop)
    if ([...navigator.getGamepads()].some(Boolean)) start()
    return () => {
      window.removeEventListener('gamepadconnected', start)
      window.removeEventListener('gamepaddisconnected', stop)
      cancelAnimationFrame(raf)
    }
  }, [])
}
