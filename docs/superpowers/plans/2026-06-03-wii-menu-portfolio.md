# Wii Menu Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portfolio site ground-up as a pixel-faithful Nintendo Wii System Menu with channel grid navigation, animated background, custom Wii Remote cursor, audio toggle, and full-screen channel banners for each portfolio section.

**Architecture:** React 19 + Vite + Framer Motion shell, unchanged. New components replace all existing pages/nav. `activeChannel` state in App drives everything — null = grid, string = open banner. Assets (sprites, SFX, BGM) served locally from `public/wii/`.

**Tech Stack:** React 19, Vite, Framer Motion, HTML5 Canvas, Web Audio API, CSS Modules, GitHub REST API.

---

## File Map

### Delete (old design, fully replaced)
- `src/components/MirrorPatches.jsx` + `.module.css`
- `src/components/Nav.jsx` + `.module.css`
- `src/components/Pyramid.jsx` + `.module.css`
- `src/components/TransitionWipe.jsx` + `.module.css`
- `src/pages/Home.jsx` + `.module.css`
- `src/pages/Work.jsx` + `.module.css`
- `src/pages/Links.jsx` + `.module.css`

### Modify
- `src/App.jsx` — full rewrite as Wii shell
- `src/App.css` — full rewrite for Wii globals
- `src/index.css` — add `cursor: none` globally, Nunito font import
- `index.html` — add Nunito Google Font link

### Create — data
- `src/data/channels.js` — static channel definitions for all named slots

### Create — hooks
- `src/hooks/useWiiAudio.js` — audio management (BGM loop + SFX)
- `src/hooks/useCursorPhysics.js` — mouse tracking + tilt physics

### Create — components
- `src/components/WiiBackground.jsx` — canvas bubble animation
- `src/components/WiiBackground.module.css`
- `src/components/WiiCursor.jsx` — custom pointer div
- `src/components/WiiCursor.module.css`
- `src/components/WiiHeader.jsx` — clock + speaker toggle
- `src/components/WiiHeader.module.css`
- `src/components/WiiFooter.jsx` — Mii avatar bar
- `src/components/WiiFooter.module.css`
- `src/components/ChannelGrid.jsx` — 4×3 grid + pagination
- `src/components/ChannelGrid.module.css`
- `src/components/ChannelSlot.jsx` — individual tile
- `src/components/ChannelSlot.module.css`
- `src/components/ChannelBanner.jsx` — full-screen overlay shell
- `src/components/ChannelBanner.module.css`

### Create — banners
- `src/banners/AboutBanner.jsx` + `.module.css` — Mii Channel / About Me
- `src/banners/PhotoBanner.jsx` + `.module.css` — Photo Channel
- `src/banners/RepoBanner.jsx` + `.module.css` — GitHub repo template (used for rune-claude + dynamic repos)
- `src/banners/ShopBanner.jsx` + `.module.css` — Wii Shop / referrals
- `src/banners/MakerWorldBanner.jsx` + `.module.css` — Check Mii Out
- `src/banners/LinkedInBanner.jsx` + `.module.css`
- `src/banners/VenmoBanner.jsx` + `.module.css`

### Create — public assets (manual download steps included in tasks)
- `public/wii/audio/mii-channel-theme.mp3`
- `public/wii/audio/sfx-hover.wav`
- `public/wii/audio/sfx-select.wav`
- `public/wii/audio/sfx-back.wav`
- `public/wii/sprites/cursor-hand.png`
- `public/wii/sprites/channel-mii.png`
- `public/wii/sprites/channel-photo.png`
- `public/wii/sprites/channel-shop.png`
- `public/wii/sprites/channel-checkmiiout.png`
- `public/wii/sprites/arrow-left.png`
- `public/wii/sprites/arrow-right.png`
- `public/wii/sprites/mii-avatar-placeholder.png` (placeholder until real avatar supplied)

---

## Task 1: Download Wii Assets

**Files:**
- Create: `public/wii/audio/` (directory + files)
- Create: `public/wii/sprites/` (directory + files)

- [ ] **Step 1: Create asset directories**

```bash
mkdir -p public/wii/audio public/wii/sprites
```

- [ ] **Step 2: Download Mii Channel BGM from Internet Archive**

Go to https://archive.org/details/wiichannelsoundtracks and download the Mii Channel theme track. Save it as `public/wii/audio/mii-channel-theme.mp3`.

Alternatively via curl (check the archive page for the direct MP3 link):
```bash
curl -L "https://archive.org/download/wiichannelsoundtracks/Mii%20Channel.mp3" \
  -o public/wii/audio/mii-channel-theme.mp3
```

- [ ] **Step 3: Download Wii SFX from The Sounds Resource**

Go to https://sounds.spriters-resource.com/wii/wiimenu/ — download:
- The channel hover blip sound → `public/wii/audio/sfx-hover.wav`
- The channel select/click sound → `public/wii/audio/sfx-select.wav`
- The back/return sound → `public/wii/audio/sfx-back.wav`

If the site requires individual download, use the browser. These are small WAV files.

- [ ] **Step 4: Download channel icon sprites from The Spriters Resource**

Go to https://www.spriters-resource.com/wii/wiimenu/ — download individual channel icon PNGs:
- Mii Channel icon → `public/wii/sprites/channel-mii.png`
- Photo Channel icon → `public/wii/sprites/channel-photo.png`
- Wii Shop Channel icon → `public/wii/sprites/channel-shop.png`
- Check Mii Out Channel icon → `public/wii/sprites/channel-checkmiiout.png`
- Left arrow button → `public/wii/sprites/arrow-left.png`
- Right arrow button → `public/wii/sprites/arrow-right.png`

- [ ] **Step 5: Download cursor sprite**

From the same Spriters Resource page, download the Wii Remote hand cursor PNG → `public/wii/sprites/cursor-hand.png`

- [ ] **Step 6: Create a placeholder Mii avatar**

Create a simple 64×64 white square PNG as a placeholder until you have a real avatar:
```bash
# If you have ImageMagick installed:
convert -size 64x64 xc:white -fill "#cccccc" -draw "roundrectangle 4,4 60,60 8,8" \
  public/wii/sprites/mii-avatar-placeholder.png
# Or just copy any small PNG you have and rename it:
cp src/assets/hero.png public/wii/sprites/mii-avatar-placeholder.png
```

- [ ] **Step 7: Verify all assets present**

```bash
ls public/wii/audio/ public/wii/sprites/
```
Expected: all 4 audio files and all 7+ sprite files listed.

- [ ] **Step 8: Commit**

```bash
git add public/wii/
git commit -m "feat: add Wii asset files (audio, sprites)"
```

---

## Task 2: Foundation — index.html, index.css, App scaffold

**Files:**
- Modify: `index.html`
- Modify: `src/index.css`
- Modify: `src/App.css`
- Modify: `src/App.jsx`

- [ ] **Step 1: Update `index.html` to add Nunito font**

Replace the contents of `index.html` with:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Jaymes Bunce</title>
    <meta name="description" content="Hobbyist developer & maker — Python, JavaScript, hardware, 3D printing." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
    <script type="module" src="/src/main.jsx"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

- [ ] **Step 2: Replace `src/index.css` with Wii globals**

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body, #root {
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: none;
}

body {
  font-family: 'Nunito', 'system-ui', sans-serif;
  background: #1a6ca8;
  color: #fff;
  -webkit-font-smoothing: antialiased;
}

/* Touch devices: restore cursor */
@media (hover: none) {
  html, body, #root {
    cursor: auto;
  }
}
```

- [ ] **Step 3: Replace `src/App.css` with Wii shell layout**

```css
.wii {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
```

- [ ] **Step 4: Replace `src/App.jsx` with minimal Wii shell (no old imports)**

```jsx
import { useState } from 'react'
import './App.css'

export default function App() {
  const [activeChannel, setActiveChannel] = useState(null)

  return (
    <div className="wii">
      <p style={{ color: '#fff', padding: '2rem' }}>
        Wii shell — activeChannel: {activeChannel ?? 'none'}
      </p>
    </div>
  )
}
```

- [ ] **Step 5: Delete old components and pages**

```bash
rm src/components/MirrorPatches.jsx src/components/MirrorPatches.module.css
rm src/components/Nav.jsx src/components/Nav.module.css
rm src/components/Pyramid.jsx src/components/Pyramid.module.css
rm src/components/TransitionWipe.jsx src/components/TransitionWipe.module.css
rm src/pages/Home.jsx src/pages/Home.module.css
rm src/pages/Work.jsx src/pages/Work.module.css
rm src/pages/Links.jsx src/pages/Links.module.css
```

- [ ] **Step 6: Run dev server and verify it starts without errors**

```bash
npm run dev
```
Expected: Vite server starts, browser shows white text "Wii shell — activeChannel: none" on blue background. No console errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: scaffold Wii shell, remove old design"
```

---

## Task 3: Channel Data

**Files:**
- Create: `src/data/channels.js`

- [ ] **Step 1: Create `src/data/channels.js`**

```js
export const GITHUB_USER = 'Haloman363'
export const FEATURED_REPO = 'rune-claude'

export const LANG_COLORS = {
  Python: '#3572A5',
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  PowerShell: '#012456',
  Rust: '#dea584',
  HTML: '#e34c26',
  CSS: '#563d7c',
}

// Static named channels — these occupy fixed slots
export const NAMED_CHANNELS = [
  {
    id: 'mii-channel',
    label: 'Mii Channel',
    sprite: '/wii/sprites/channel-mii.png',
    page: 0,
    slot: 0,
  },
  {
    id: 'photo-channel',
    label: 'Photo Channel',
    sprite: '/wii/sprites/channel-photo.png',
    page: 0,
    slot: 1,
  },
  // slot 2 = featured repo (rune-claude) — injected dynamically by ChannelGrid
  {
    id: 'wii-shop',
    label: 'Wii Shop Channel',
    sprite: '/wii/sprites/channel-shop.png',
    page: 0,
    slot: 8,
  },
  {
    id: 'check-mii-out',
    label: 'Check Mii Out',
    sprite: '/wii/sprites/channel-checkmiiout.png',
    page: 0,
    slot: 9,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    sprite: null, // text tile
    page: 0,
    slot: 10,
  },
  {
    id: 'venmo',
    label: 'Venmo',
    sprite: null, // text tile
    page: 1,
    slot: 0,
  },
]

// Referral links shown inside ShopBanner
export const REFERRAL_LINKS = [
  {
    name: 'Ally Bank',
    desc: '$100 welcome bonus referral',
    href: 'https://ally.com/referral?code=7C9J9N9V9B',
    accent: '#c9a84c',
  },
  {
    name: 'Discover',
    desc: 'Cashback card referral',
    href: 'https://refer.discover.com/s/jaymesbunce6',
    accent: '#f97316',
  },
  {
    name: 'Capital One',
    desc: 'Card referral with bonus benefits',
    href: 'https://i.capitalone.com/GCvRtodqH',
    accent: '#a855f7',
  },
]
```

- [ ] **Step 2: Commit**

```bash
git add src/data/channels.js
git commit -m "feat: add channel data definitions"
```

---

## Task 4: WiiBackground (canvas bubbles)

**Files:**
- Create: `src/components/WiiBackground.jsx`
- Create: `src/components/WiiBackground.module.css`

- [ ] **Step 1: Create `src/components/WiiBackground.module.css`**

```css
.canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}
```

- [ ] **Step 2: Create `src/components/WiiBackground.jsx`**

```jsx
import { useEffect, useRef } from 'react'
import styles from './WiiBackground.module.css'

const BUBBLE_COUNT = 25

function makeBubble(w, h) {
  const r = 4 + Math.random() * 28
  return {
    x: Math.random() * w,
    y: h + r + Math.random() * h,
    r,
    speed: 0.2 + Math.random() * 0.5,
    drift: (Math.random() - 0.5) * 0.3,
    alpha: 0.08 + Math.random() * 0.12,
  }
}

export default function WiiBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf
    let bubbles = []

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      bubbles = Array.from({ length: BUBBLE_COUNT }, () =>
        makeBubble(canvas.width, canvas.height)
      )
    }

    function drawBackground() {
      const { width: w, height: h } = canvas
      const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.75)
      grad.addColorStop(0, '#3d8fc4')
      grad.addColorStop(0.5, '#1a6ca8')
      grad.addColorStop(1, '#8ec8e8')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)
    }

    function drawBubble(b) {
      const grad = ctx.createRadialGradient(
        b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.1,
        b.x, b.y, b.r
      )
      grad.addColorStop(0, `rgba(255,255,255,${b.alpha * 2.5})`)
      grad.addColorStop(0.6, `rgba(255,255,255,${b.alpha})`)
      grad.addColorStop(1, `rgba(255,255,255,0)`)
      ctx.beginPath()
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()
    }

    function tick() {
      const { width: w, height: h } = canvas
      drawBackground()
      for (const b of bubbles) {
        b.y -= b.speed
        b.x += b.drift
        if (b.y + b.r < 0) {
          Object.assign(b, makeBubble(w, h))
          b.y = h + b.r
        }
        drawBubble(b)
      }
      raf = requestAnimationFrame(tick)
    }

    resize()
    tick()
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className={styles.canvas} />
}
```

- [ ] **Step 3: Wire WiiBackground into App and verify**

In `src/App.jsx`:

```jsx
import { useState } from 'react'
import WiiBackground from './components/WiiBackground'
import './App.css'

export default function App() {
  const [activeChannel, setActiveChannel] = useState(null)

  return (
    <div className="wii">
      <WiiBackground />
      <p style={{ color: '#fff', padding: '2rem', position: 'relative', zIndex: 1 }}>
        Wii shell — activeChannel: {activeChannel ?? 'none'}
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Run dev server and verify**

```bash
npm run dev
```
Expected: Blue radial gradient background with ~25 slowly floating translucent bubbles. Text visible on top. No console errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/WiiBackground.jsx src/components/WiiBackground.module.css src/App.jsx
git commit -m "feat: add Wii animated bubble background"
```

---

## Task 5: useCursorPhysics hook + WiiCursor

**Files:**
- Create: `src/hooks/useCursorPhysics.js`
- Create: `src/components/WiiCursor.jsx`
- Create: `src/components/WiiCursor.module.css`

- [ ] **Step 1: Create `src/hooks/useCursorPhysics.js`**

```js
import { useEffect, useRef, useState } from 'react'

export function useCursorPhysics() {
  const [pos, setPos] = useState({ x: -200, y: -200 })
  const [tilt, setTilt] = useState(0)
  const velX = useRef(0)
  const lastX = useRef(-200)
  const tiltRef = useRef(0)
  const rafRef = useRef(null)

  useEffect(() => {
    function onMove(e) {
      const x = e.clientX
      const y = e.clientY
      velX.current = x - lastX.current
      lastX.current = x
      setPos({ x, y })
    }

    function decay() {
      // Tilt follows velocity, decays toward 0
      const target = Math.max(-15, Math.min(15, velX.current * 1.5))
      tiltRef.current += (target - tiltRef.current) * 0.12
      velX.current *= 0.85
      setTilt(tiltRef.current)
      rafRef.current = requestAnimationFrame(decay)
    }

    window.addEventListener('mousemove', onMove)
    rafRef.current = requestAnimationFrame(decay)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return { pos, tilt }
}
```

- [ ] **Step 2: Create `src/components/WiiCursor.module.css`**

```css
.cursor {
  position: fixed;
  top: 0;
  left: 0;
  width: 40px;
  height: 56px;
  pointer-events: none;
  z-index: 9999;
  transform-origin: 20px 8px;
  filter: drop-shadow(0 0 8px rgba(255,255,255,0.7));
  will-change: transform;
}

.cursor img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Touch: hide cursor entirely */
@media (hover: none) {
  .cursor {
    display: none;
  }
}
```

- [ ] **Step 3: Create `src/components/WiiCursor.jsx`**

```jsx
import { useCursorPhysics } from '../hooks/useCursorPhysics'
import styles from './WiiCursor.module.css'

export default function WiiCursor() {
  const { pos, tilt } = useCursorPhysics()

  return (
    <div
      className={styles.cursor}
      style={{
        transform: `translate(${pos.x - 20}px, ${pos.y - 8}px) rotate(${tilt}deg)`,
      }}
    >
      <img src="/wii/sprites/cursor-hand.png" alt="" aria-hidden="true" />
    </div>
  )
}
```

- [ ] **Step 4: Add WiiCursor to App**

```jsx
import { useState } from 'react'
import WiiBackground from './components/WiiBackground'
import WiiCursor from './components/WiiCursor'
import './App.css'

export default function App() {
  const [activeChannel, setActiveChannel] = useState(null)

  return (
    <div className="wii">
      <WiiBackground />
      <WiiCursor />
      <p style={{ color: '#fff', padding: '2rem', position: 'relative', zIndex: 1 }}>
        Wii shell — activeChannel: {activeChannel ?? 'none'}
      </p>
    </div>
  )
}
```

- [ ] **Step 5: Run dev server and verify**

```bash
npm run dev
```
Expected: Standard cursor is hidden. Custom hand cursor appears at mouse position. Moving the mouse quickly causes the cursor to tilt in the direction of motion, then settle back upright.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useCursorPhysics.js src/components/WiiCursor.jsx src/components/WiiCursor.module.css src/App.jsx
git commit -m "feat: add custom Wii Remote cursor with tilt physics"
```

---

## Task 6: useWiiAudio hook

**Files:**
- Create: `src/hooks/useWiiAudio.js`

- [ ] **Step 1: Create `src/hooks/useWiiAudio.js`**

```js
import { useRef, useState, useCallback } from 'react'

export function useWiiAudio() {
  const [enabled, setEnabled] = useState(false)
  const bgmRef = useRef(null)
  const unlockedRef = useRef(false)

  function unlock() {
    if (unlockedRef.current) return
    unlockedRef.current = true
    // Create BGM audio element once
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
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useWiiAudio.js
git commit -m "feat: add Wii audio hook (BGM + SFX)"
```

---

## Task 7: WiiHeader (clock + speaker toggle)

**Files:**
- Create: `src/components/WiiHeader.jsx`
- Create: `src/components/WiiHeader.module.css`

- [ ] **Step 1: Create `src/components/WiiHeader.module.css`**

```css
.header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px 6px;
  flex-shrink: 0;
}

.speaker {
  background: none;
  border: none;
  cursor: none;
  color: rgba(255,255,255,0.85);
  font-size: 22px;
  line-height: 1;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.15s;
}

.speaker:hover {
  background: rgba(255,255,255,0.15);
}

.clock {
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 15px;
  color: rgba(255,255,255,0.9);
  letter-spacing: 0.02em;
  text-shadow: 0 1px 3px rgba(0,0,0,0.3);
}
```

- [ ] **Step 2: Create `src/components/WiiHeader.jsx`**

```jsx
import { useState, useEffect } from 'react'
import styles from './WiiHeader.module.css'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

function formatTime(d) {
  const day = DAYS[d.getDay()]
  let h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${day}  ${h}:${m} ${ampm}`
}

export default function WiiHeader({ audioEnabled, onAudioToggle }) {
  const [time, setTime] = useState(() => formatTime(new Date()))

  useEffect(() => {
    const id = setInterval(() => setTime(formatTime(new Date())), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className={styles.header}>
      <button
        className={styles.speaker}
        onClick={onAudioToggle}
        aria-label={audioEnabled ? 'Mute audio' : 'Unmute audio'}
        title={audioEnabled ? 'Mute' : 'Unmute'}
      >
        {audioEnabled ? '🔊' : '🔇'}
      </button>
      <span className={styles.clock}>{time}</span>
    </header>
  )
}
```

- [ ] **Step 3: Wire WiiHeader into App**

```jsx
import { useState } from 'react'
import WiiBackground from './components/WiiBackground'
import WiiCursor from './components/WiiCursor'
import WiiHeader from './components/WiiHeader'
import { useWiiAudio } from './hooks/useWiiAudio'
import './App.css'

export default function App() {
  const [activeChannel, setActiveChannel] = useState(null)
  const audio = useWiiAudio()

  return (
    <div className="wii">
      <WiiBackground />
      <WiiCursor />
      <WiiHeader audioEnabled={audio.enabled} onAudioToggle={audio.toggle} />
      <p style={{ color: '#fff', padding: '2rem', position: 'relative', zIndex: 1 }}>
        Wii shell — activeChannel: {activeChannel ?? 'none'}
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Run dev server and verify**

```bash
npm run dev
```
Expected: Top bar shows mute icon on left and live clock updating every second on right. Clicking speaker icon toggles the icon between 🔊 and 🔇. If audio files are present, BGM plays when toggled on.

- [ ] **Step 5: Commit**

```bash
git add src/components/WiiHeader.jsx src/components/WiiHeader.module.css src/App.jsx
git commit -m "feat: add WiiHeader with live clock and audio toggle"
```

---

## Task 8: WiiFooter (Mii bar)

**Files:**
- Create: `src/components/WiiFooter.jsx`
- Create: `src/components/WiiFooter.module.css`

- [ ] **Step 1: Create `src/components/WiiFooter.module.css`**

```css
.footer {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 20px 12px;
  flex-shrink: 0;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.6);
  object-fit: cover;
  background: rgba(255,255,255,0.2);
}

.name {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 18px;
  color: #fff;
  text-shadow: 0 1px 4px rgba(0,0,0,0.3);
  letter-spacing: 0.04em;
}
```

- [ ] **Step 2: Create `src/components/WiiFooter.jsx`**

```jsx
import styles from './WiiFooter.module.css'

export default function WiiFooter() {
  return (
    <footer className={styles.footer}>
      <img
        className={styles.avatar}
        src="/wii/sprites/mii-avatar-placeholder.png"
        alt="Mii avatar"
      />
      <span className={styles.name}>JAYMES</span>
    </footer>
  )
}
```

- [ ] **Step 3: Wire WiiFooter into App**

```jsx
import { useState } from 'react'
import WiiBackground from './components/WiiBackground'
import WiiCursor from './components/WiiCursor'
import WiiHeader from './components/WiiHeader'
import WiiFooter from './components/WiiFooter'
import { useWiiAudio } from './hooks/useWiiAudio'
import './App.css'

export default function App() {
  const [activeChannel, setActiveChannel] = useState(null)
  const audio = useWiiAudio()

  return (
    <div className="wii">
      <WiiBackground />
      <WiiCursor />
      <WiiHeader audioEnabled={audio.enabled} onAudioToggle={audio.toggle} />
      <main style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#fff' }}>Channel grid goes here</p>
      </main>
      <WiiFooter />
    </div>
  )
}
```

Update `src/App.css` to make the layout fill vertically:

```css
.wii {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
```

- [ ] **Step 4: Run dev server and verify**

```bash
npm run dev
```
Expected: Avatar circle and "JAYMES" label in bottom-left. Layout fills full viewport height with header at top and footer at bottom.

- [ ] **Step 5: Commit**

```bash
git add src/components/WiiFooter.jsx src/components/WiiFooter.module.css src/App.jsx
git commit -m "feat: add WiiFooter Mii bar"
```

---

## Task 9: ChannelSlot component

**Files:**
- Create: `src/components/ChannelSlot.jsx`
- Create: `src/components/ChannelSlot.module.css`

- [ ] **Step 1: Create `src/components/ChannelSlot.module.css`**

```css
.slot {
  width: 100%;
  aspect-ratio: 1.5 / 1;
  border-radius: 12px;
  background: rgba(255,255,255,0.15);
  border: 2px solid rgba(255,255,255,0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: none;
  overflow: hidden;
  position: relative;
  animation: channelFloat 3s ease-in-out infinite;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.slot:hover {
  transform: scale(1.04);
  box-shadow: 0 0 0 3px rgba(255,255,255,0.5), 0 8px 24px rgba(0,0,0,0.25);
}

.slot.empty {
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.1);
  cursor: default;
  animation: none;
  pointer-events: none;
}

.sprite {
  width: 72px;
  height: 72px;
  object-fit: contain;
  image-rendering: pixelated;
}

.label {
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 11px;
  color: #fff;
  text-align: center;
  margin-top: 6px;
  text-shadow: 0 1px 3px rgba(0,0,0,0.4);
  padding: 0 4px;
  line-height: 1.2;
}

.repoTile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  width: 100%;
  height: 100%;
}

.langDot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.repoName {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 12px;
  color: #fff;
  text-align: center;
  word-break: break-all;
  line-height: 1.2;
}

@keyframes channelFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.slot:hover {
  animation-play-state: paused;
  transform: scale(1.04);
}
```

- [ ] **Step 2: Create `src/components/ChannelSlot.jsx`**

```jsx
import styles from './ChannelSlot.module.css'
import { LANG_COLORS } from '../data/channels'

export default function ChannelSlot({ channel, onSelect, onHover }) {
  if (!channel) {
    return <div className={`${styles.slot} ${styles.empty}`} aria-hidden="true" />
  }

  function handleClick() {
    onSelect?.(channel.id)
  }

  function handleMouseEnter() {
    onHover?.()
  }

  const isRepo = channel.id.startsWith('repo-') || channel.id === 'rune-claude'

  return (
    <div
      className={styles.slot}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      role="button"
      tabIndex={0}
      aria-label={`Open ${channel.label}`}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
    >
      {isRepo ? (
        <div className={styles.repoTile}>
          {channel.language && (
            <span
              className={styles.langDot}
              style={{ background: LANG_COLORS[channel.language] ?? '#888' }}
            />
          )}
          <span className={styles.repoName}>{channel.label}</span>
        </div>
      ) : channel.sprite ? (
        <>
          <img className={styles.sprite} src={channel.sprite} alt="" aria-hidden="true" />
          <span className={styles.label}>{channel.label}</span>
        </>
      ) : (
        <span className={styles.label}>{channel.label}</span>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ChannelSlot.jsx src/components/ChannelSlot.module.css
git commit -m "feat: add ChannelSlot tile component"
```

---

## Task 10: ChannelGrid + GitHub API integration

**Files:**
- Create: `src/components/ChannelGrid.jsx`
- Create: `src/components/ChannelGrid.module.css`

- [ ] **Step 1: Create `src/components/ChannelGrid.module.css`**

```css
.gridWrap {
  flex: 1;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.frame {
  background: rgba(180,195,210,0.25);
  border: 3px solid rgba(255,255,255,0.35);
  border-radius: 18px;
  padding: 16px 20px 20px;
  backdrop-filter: blur(2px);
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: min(92vw, 820px);
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.arrowBtn {
  background: none;
  border: none;
  cursor: none;
  padding: 4px;
  opacity: 0.75;
  transition: opacity 0.15s;
}

.arrowBtn:hover {
  opacity: 1;
}

.arrowBtn img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.4);
  transition: background 0.2s;
}

.dot.active {
  background: #fff;
}
```

- [ ] **Step 2: Create `src/components/ChannelGrid.jsx`**

```jsx
import { useState, useEffect, useCallback } from 'react'
import ChannelSlot from './ChannelSlot'
import { NAMED_CHANNELS, GITHUB_USER, FEATURED_REPO, LANG_COLORS } from '../data/channels'
import styles from './ChannelGrid.module.css'

const SLOTS_PER_PAGE = 12
const TOTAL_PAGES = 2

function buildSlots(namedChannels, repos) {
  // pages[0..1] each = array of 12 (null = empty)
  const pages = Array.from({ length: TOTAL_PAGES }, () => Array(SLOTS_PER_PAGE).fill(null))

  // Place named channels at fixed positions
  for (const ch of namedChannels) {
    pages[ch.page][ch.slot] = ch
  }

  // Featured repo at page 0 slot 2
  const featured = repos.find(r => r.name === FEATURED_REPO)
  if (featured) {
    pages[0][2] = repoToChannel(featured, true)
  }

  // Fill page 0 slots 3–7 with next 5 repos (excluding featured)
  const rest = repos.filter(r => r.name !== FEATURED_REPO).slice(0, 5)
  let slotIdx = 3
  for (const repo of rest) {
    if (slotIdx > 7) break
    if (!pages[0][slotIdx]) pages[0][slotIdx] = repoToChannel(repo, false)
    slotIdx++
  }

  return pages
}

function repoToChannel(repo, featured) {
  return {
    id: `repo-${repo.name}`,
    label: repo.name,
    sprite: null,
    language: repo.language,
    description: repo.description,
    url: repo.html_url,
    stars: repo.stargazers_count,
    featured,
  }
}

export default function ChannelGrid({ onSelect, onHover }) {
  const [page, setPage] = useState(0)
  const [slots, setSlots] = useState(() => buildSlots(NAMED_CHANNELS, []))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRepos() {
      try {
        const res = await fetch(
          `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`,
          { headers: { Accept: 'application/vnd.github.v3+json' } }
        )
        if (!res.ok) throw new Error()
        const data = await res.json()
        const filtered = data
          .filter(r => !r.fork && r.name !== GITHUB_USER.toLowerCase())
          .sort((a, b) => b.stargazers_count - a.stargazers_count)
        setSlots(buildSlots(NAMED_CHANNELS, filtered))
      } catch {
        // Leave named channels, repo slots stay null (show empty)
      } finally {
        setLoading(false)
      }
    }
    loadRepos()
  }, [])

  const prevPage = useCallback(() => setPage(p => Math.max(0, p - 1)), [])
  const nextPage = useCallback(() => setPage(p => Math.min(TOTAL_PAGES - 1, p + 1)), [])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowLeft') prevPage()
      if (e.key === 'ArrowRight') nextPage()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prevPage, nextPage])

  const currentSlots = slots[page]

  return (
    <div className={styles.gridWrap}>
      <div className={styles.frame}>
        <div className={styles.grid}>
          {currentSlots.map((channel, i) => (
            <ChannelSlot
              key={channel?.id ?? `empty-${page}-${i}`}
              channel={channel}
              onSelect={onSelect}
              onHover={onHover}
            />
          ))}
        </div>
        <nav className={styles.nav} aria-label="Channel pages">
          <button
            className={styles.arrowBtn}
            onClick={prevPage}
            disabled={page === 0}
            aria-label="Previous page"
          >
            <img src="/wii/sprites/arrow-left.png" alt="←" />
          </button>
          <div className={styles.dots}>
            {Array.from({ length: TOTAL_PAGES }, (_, i) => (
              <span key={i} className={`${styles.dot} ${i === page ? styles.active : ''}`} />
            ))}
          </div>
          <button
            className={styles.arrowBtn}
            onClick={nextPage}
            disabled={page === TOTAL_PAGES - 1}
            aria-label="Next page"
          >
            <img src="/wii/sprites/arrow-right.png" alt="→" />
          </button>
        </nav>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Wire ChannelGrid into App**

```jsx
import { useState } from 'react'
import WiiBackground from './components/WiiBackground'
import WiiCursor from './components/WiiCursor'
import WiiHeader from './components/WiiHeader'
import WiiFooter from './components/WiiFooter'
import ChannelGrid from './components/ChannelGrid'
import { useWiiAudio } from './hooks/useWiiAudio'
import './App.css'

export default function App() {
  const [activeChannel, setActiveChannel] = useState(null)
  const audio = useWiiAudio()

  function handleSelect(id) {
    audio.playSelect()
    setActiveChannel(id)
  }

  return (
    <div className="wii">
      <WiiBackground />
      <WiiCursor />
      <WiiHeader audioEnabled={audio.enabled} onAudioToggle={audio.toggle} />
      <ChannelGrid onSelect={handleSelect} onHover={audio.playHover} />
      <WiiFooter />
    </div>
  )
}
```

- [ ] **Step 4: Run dev server and verify**

```bash
npm run dev
```
Expected: 4×3 grid of channel tiles visible inside a rounded frame. Named channels show sprite + label. Repo channels show language dot + repo name. Empty slots are dim. Left/right arrows and page dots visible. Hovering tiles scales them up. Clicking a tile logs its ID (check console via `console.log` temporarily or verify state with React DevTools). Keyboard arrows switch pages.

- [ ] **Step 5: Commit**

```bash
git add src/components/ChannelGrid.jsx src/components/ChannelGrid.module.css src/App.jsx
git commit -m "feat: add ChannelGrid with GitHub API integration and pagination"
```

---

## Task 11: ChannelBanner shell (open/close animation)

**Files:**
- Create: `src/components/ChannelBanner.jsx`
- Create: `src/components/ChannelBanner.module.css`

- [ ] **Step 1: Create `src/components/ChannelBanner.module.css`**

```css
.overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.backBtn {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
  background: rgba(0,0,0,0.35);
  border: 2px solid rgba(255,255,255,0.4);
  color: #fff;
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 14px;
  padding: 6px 14px;
  border-radius: 20px;
  cursor: none;
  transition: background 0.15s;
}

.backBtn:hover {
  background: rgba(0,0,0,0.55);
}

.content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
```

- [ ] **Step 2: Create `src/components/ChannelBanner.jsx`**

```jsx
import { AnimatePresence, motion } from 'framer-motion'
import styles from './ChannelBanner.module.css'

export default function ChannelBanner({ channelId, onBack, children }) {
  return (
    <AnimatePresence>
      {channelId && (
        <motion.div
          key={channelId}
          className={styles.overlay}
          initial={{ scale: 0.08, borderRadius: '12px', opacity: 0.6 }}
          animate={{ scale: 1, borderRadius: '0px', opacity: 1 }}
          exit={{ scale: 0.08, borderRadius: '12px', opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <button className={styles.backBtn} onClick={onBack} aria-label="Back to menu">
            ← Back
          </button>
          <motion.div
            className={styles.content}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.25 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 3: Wire ChannelBanner into App with a placeholder content switcher**

```jsx
import { useState } from 'react'
import WiiBackground from './components/WiiBackground'
import WiiCursor from './components/WiiCursor'
import WiiHeader from './components/WiiHeader'
import WiiFooter from './components/WiiFooter'
import ChannelGrid from './components/ChannelGrid'
import ChannelBanner from './components/ChannelBanner'
import { useWiiAudio } from './hooks/useWiiAudio'
import './App.css'

export default function App() {
  const [activeChannel, setActiveChannel] = useState(null)
  const audio = useWiiAudio()

  function handleSelect(id) {
    audio.playSelect()
    setActiveChannel(id)
  }

  function handleBack() {
    audio.playBack()
    setActiveChannel(null)
  }

  return (
    <div className="wii">
      <WiiBackground />
      <WiiCursor />
      <WiiHeader audioEnabled={audio.enabled} onAudioToggle={audio.toggle} />
      <ChannelGrid onSelect={handleSelect} onHover={audio.playHover} />
      <WiiFooter />
      <ChannelBanner channelId={activeChannel} onBack={handleBack}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#1a1a2e', color: '#fff', fontSize: '2rem' }}>
          {activeChannel}
        </div>
      </ChannelBanner>
    </div>
  )
}
```

- [ ] **Step 4: Run dev server and verify**

```bash
npm run dev
```
Expected: Clicking any channel tile triggers a zoom-expand animation covering the full screen, showing the channel ID as text. Clicking "← Back" collapses back to grid with a reverse zoom. No console errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/ChannelBanner.jsx src/components/ChannelBanner.module.css src/App.jsx
git commit -m "feat: add ChannelBanner full-screen overlay with zoom animation"
```

---

## Task 12: AboutBanner (Mii Channel)

**Files:**
- Create: `src/banners/AboutBanner.jsx`
- Create: `src/banners/AboutBanner.module.css`

- [ ] **Step 1: Create `src/banners/AboutBanner.module.css`**

```css
.about {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f0f4f8;
  color: #1a1a2e;
  padding: 64px 48px 32px;
  overflow-y: auto;
}

.top {
  display: flex;
  align-items: flex-start;
  gap: 32px;
  margin-bottom: 32px;
}

.avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 4px solid #1a6ca8;
  object-fit: cover;
  flex-shrink: 0;
}

.info {
  flex: 1;
}

.name {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 40px;
  color: #1a6ca8;
  line-height: 1;
  margin-bottom: 8px;
}

.role {
  font-size: 16px;
  color: #444;
  font-weight: 600;
}

.bio {
  font-size: 15px;
  color: #333;
  line-height: 1.6;
  max-width: 560px;
  margin-bottom: 32px;
}

.skillsTitle {
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 13px;
  color: #888;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.bars {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 480px;
}

.barRow {
  display: flex;
  align-items: center;
  gap: 12px;
}

.barLabel {
  font-size: 13px;
  font-weight: 700;
  width: 100px;
  flex-shrink: 0;
  color: #333;
}

.barTrack {
  flex: 1;
  height: 14px;
  background: #dde4ec;
  border-radius: 7px;
  overflow: hidden;
}

.barFill {
  height: 100%;
  border-radius: 7px;
  transition: width 1s ease;
}
```

- [ ] **Step 2: Create `src/banners/AboutBanner.jsx`**

```jsx
import styles from './AboutBanner.module.css'

const SKILLS = [
  { label: 'Python',       pct: 85, color: '#3572A5' },
  { label: 'JavaScript',   pct: 75, color: '#f1e05a' },
  { label: '3D Printing',  pct: 80, color: '#00e08a' },
  { label: 'Hardware',     pct: 65, color: '#e34c26' },
  { label: 'Rust',         pct: 40, color: '#dea584' },
]

export default function AboutBanner() {
  return (
    <div className={styles.about}>
      <div className={styles.top}>
        <img
          className={styles.avatar}
          src="/wii/sprites/mii-avatar-placeholder.png"
          alt="Mii avatar"
        />
        <div className={styles.info}>
          <h1 className={styles.name}>JAYMES BUNCE</h1>
          <p className={styles.role}>Hobbyist Developer &amp; Maker</p>
        </div>
      </div>

      <p className={styles.bio}>
        Hey! I&apos;m Jaymes — a hobbyist developer and maker living in the overlap between
        software and hardware. I build Python tools, browser experiments, ESP32 projects,
        and whatever else catches my curiosity. I care about making things that work
        and feel good to use.
      </p>

      <p className={styles.skillsTitle}>Skills</p>
      <div className={styles.bars}>
        {SKILLS.map(s => (
          <div key={s.label} className={styles.barRow}>
            <span className={styles.barLabel}>{s.label}</span>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{ width: `${s.pct}%`, background: s.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/banners/AboutBanner.jsx src/banners/AboutBanner.module.css
git commit -m "feat: add AboutBanner (Mii Channel)"
```

---

## Task 13: PhotoBanner

**Files:**
- Create: `src/banners/PhotoBanner.jsx`
- Create: `src/banners/PhotoBanner.module.css`

- [ ] **Step 1: Create `src/banners/PhotoBanner.module.css`**

```css
.photo {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #111;
  position: relative;
}

.imageWrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.toolbar {
  background: #2a2a2a;
  border-top: 2px solid #444;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 12px 24px;
  flex-shrink: 0;
}

.toolbarLabel {
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 12px;
  color: #aaa;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
```

- [ ] **Step 2: Create `src/banners/PhotoBanner.jsx`**

```jsx
import styles from './PhotoBanner.module.css'
import heroImg from '../assets/hero.png'

export default function PhotoBanner() {
  return (
    <div className={styles.photo}>
      <div className={styles.imageWrap}>
        <img className={styles.image} src={heroImg} alt="Profile photo" />
      </div>
      <div className={styles.toolbar}>
        <span className={styles.toolbarLabel}>Photo Channel</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/banners/PhotoBanner.jsx src/banners/PhotoBanner.module.css
git commit -m "feat: add PhotoBanner (Photo Channel)"
```

---

## Task 14: RepoBanner (featured + dynamic repos)

**Files:**
- Create: `src/banners/RepoBanner.jsx`
- Create: `src/banners/RepoBanner.module.css`

- [ ] **Step 1: Create `src/banners/RepoBanner.module.css`**

```css
.repo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #0d1117;
  color: #fff;
  padding: 48px;
  gap: 20px;
  text-align: center;
}

.badge {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #f0c040;
  background: rgba(240,192,64,0.12);
  border: 1px solid rgba(240,192,64,0.3);
  padding: 3px 10px;
  border-radius: 12px;
}

.name {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 48px;
  color: #fff;
  line-height: 1;
}

.desc {
  font-size: 16px;
  color: #8b949e;
  max-width: 480px;
  line-height: 1.5;
}

.meta {
  display: flex;
  gap: 16px;
  align-items: center;
}

.langTag {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #8b949e;
  font-weight: 600;
}

.langDot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.stars {
  font-size: 13px;
  color: #f0c040;
  font-weight: 700;
}

.cta {
  margin-top: 8px;
  display: inline-block;
  background: #238636;
  color: #fff;
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 16px;
  padding: 12px 28px;
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.15s;
}

.cta:hover {
  background: #2ea043;
}
```

- [ ] **Step 2: Create `src/banners/RepoBanner.jsx`**

```jsx
import styles from './RepoBanner.module.css'
import { LANG_COLORS } from '../data/channels'

export default function RepoBanner({ channel }) {
  if (!channel) return null
  return (
    <div className={styles.repo}>
      {channel.featured && <span className={styles.badge}>Featured Project</span>}
      <h1 className={styles.name}>{channel.label}</h1>
      {channel.description && <p className={styles.desc}>{channel.description}</p>}
      <div className={styles.meta}>
        {channel.language && (
          <span className={styles.langTag}>
            <span
              className={styles.langDot}
              style={{ background: LANG_COLORS[channel.language] ?? '#888' }}
            />
            {channel.language}
          </span>
        )}
        {channel.stars > 0 && (
          <span className={styles.stars}>★ {channel.stars}</span>
        )}
      </div>
      {channel.url && (
        <a className={styles.cta} href={channel.url} target="_blank" rel="noopener noreferrer">
          View on GitHub ↗
        </a>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/banners/RepoBanner.jsx src/banners/RepoBanner.module.css
git commit -m "feat: add RepoBanner (GitHub repo template)"
```

---

## Task 15: ShopBanner, MakerWorldBanner, LinkedInBanner, VenmoBanner

**Files:**
- Create: `src/banners/ShopBanner.jsx` + `.module.css`
- Create: `src/banners/MakerWorldBanner.jsx` + `.module.css`
- Create: `src/banners/LinkedInBanner.jsx` + `.module.css`
- Create: `src/banners/VenmoBanner.jsx` + `.module.css`

- [ ] **Step 1: Create `src/banners/ShopBanner.module.css`**

```css
.shop {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  background: linear-gradient(160deg, #f59e0b 0%, #d97706 100%);
  color: #fff;
  padding: 64px 48px 32px;
  overflow-y: auto;
}

.header {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 28px;
  text-align: center;
  margin-bottom: 8px;
  text-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.sub {
  font-size: 14px;
  opacity: 0.85;
  margin-bottom: 40px;
}

.cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 480px;
}

.card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255,255,255,0.15);
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 12px;
  padding: 16px 20px;
  text-decoration: none;
  color: #fff;
  transition: background 0.15s;
}

.card:hover {
  background: rgba(255,255,255,0.25);
}

.cardAccent {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.cardInfo {
  flex: 1;
}

.cardName {
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 16px;
}

.cardDesc {
  font-size: 13px;
  opacity: 0.8;
  margin-top: 2px;
}

.arrow {
  opacity: 0.7;
  font-size: 18px;
}
```

- [ ] **Step 2: Create `src/banners/ShopBanner.jsx`**

```jsx
import styles from './ShopBanner.module.css'
import { REFERRAL_LINKS } from '../data/channels'

export default function ShopBanner() {
  return (
    <div className={styles.shop}>
      <h1 className={styles.header}>Welcome to the Wii Shop Channel!</h1>
      <p className={styles.sub}>Referral links &amp; bonus offers</p>
      <div className={styles.cards}>
        {REFERRAL_LINKS.map(link => (
          <a
            key={link.name}
            className={styles.card}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className={styles.cardAccent} style={{ background: link.accent }} />
            <span className={styles.cardInfo}>
              <span className={styles.cardName}>{link.name}</span>
              <span className={styles.cardDesc}>{link.desc}</span>
            </span>
            <span className={styles.arrow}>↗</span>
          </a>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/banners/MakerWorldBanner.module.css`**

```css
.mw {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #0a1628;
  color: #fff;
  gap: 20px;
  text-align: center;
  padding: 48px;
}

.title {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 40px;
  color: #00e08a;
}

.desc {
  font-size: 15px;
  color: #8b9cb0;
  max-width: 380px;
}

.cta {
  display: inline-block;
  background: #00e08a;
  color: #0a1628;
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 16px;
  padding: 12px 28px;
  border-radius: 8px;
  text-decoration: none;
  transition: opacity 0.15s;
}

.cta:hover { opacity: 0.85; }
```

- [ ] **Step 4: Create `src/banners/MakerWorldBanner.jsx`**

```jsx
import styles from './MakerWorldBanner.module.css'

export default function MakerWorldBanner() {
  return (
    <div className={styles.mw}>
      <h1 className={styles.title}>MakerWorld</h1>
      <p className={styles.desc}>3D printing models for designers and makers. Check out my profile for prints I&apos;ve shared.</p>
      <a
        className={styles.cta}
        href="https://makerworld.com/en/@Haloman363"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open MakerWorld ↗
      </a>
    </div>
  )
}
```

- [ ] **Step 5: Create `src/banners/LinkedInBanner.module.css`**

```css
.li {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #0a66c2;
  color: #fff;
  gap: 20px;
  text-align: center;
  padding: 48px;
}

.title {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 40px;
}

.handle {
  font-size: 16px;
  opacity: 0.85;
}

.cta {
  display: inline-block;
  background: #fff;
  color: #0a66c2;
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 16px;
  padding: 12px 28px;
  border-radius: 8px;
  text-decoration: none;
  transition: opacity 0.15s;
}

.cta:hover { opacity: 0.9; }
```

- [ ] **Step 6: Create `src/banners/LinkedInBanner.jsx`**

```jsx
import styles from './LinkedInBanner.module.css'

export default function LinkedInBanner() {
  return (
    <div className={styles.li}>
      <h1 className={styles.title}>LinkedIn</h1>
      <p className={styles.handle}>jaymes-bunce</p>
      <a
        className={styles.cta}
        href="https://www.linkedin.com/in/jaymes-bunce"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open Profile ↗
      </a>
    </div>
  )
}
```

- [ ] **Step 7: Create `src/banners/VenmoBanner.module.css`**

```css
.venmo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #3d95ce;
  color: #fff;
  gap: 20px;
  text-align: center;
  padding: 48px;
}

.title {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 40px;
}

.handle {
  font-size: 18px;
  opacity: 0.9;
  font-weight: 600;
}

.cta {
  display: inline-block;
  background: #fff;
  color: #3d95ce;
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 16px;
  padding: 12px 28px;
  border-radius: 8px;
  text-decoration: none;
  transition: opacity 0.15s;
}

.cta:hover { opacity: 0.9; }
```

- [ ] **Step 8: Create `src/banners/VenmoBanner.jsx`**

```jsx
import styles from './VenmoBanner.module.css'

export default function VenmoBanner() {
  return (
    <div className={styles.venmo}>
      <h1 className={styles.title}>Venmo</h1>
      <p className={styles.handle}>@JaymesBunce</p>
      <a
        className={styles.cta}
        href="https://account.venmo.com/u/JaymesBunce"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open Venmo ↗
      </a>
    </div>
  )
}
```

- [ ] **Step 9: Commit**

```bash
git add src/banners/
git commit -m "feat: add ShopBanner, MakerWorldBanner, LinkedInBanner, VenmoBanner"
```

---

## Task 16: Wire all banners into App — final assembly

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Replace `src/App.jsx` with final wired version**

This passes the full `channel` object to banners that need it (RepoBanner needs the channel data), and routes by `activeChannel` id:

```jsx
import { useState, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import WiiBackground from './components/WiiBackground'
import WiiCursor from './components/WiiCursor'
import WiiHeader from './components/WiiHeader'
import WiiFooter from './components/WiiFooter'
import ChannelGrid from './components/ChannelGrid'
import ChannelBanner from './components/ChannelBanner'
import AboutBanner from './banners/AboutBanner'
import PhotoBanner from './banners/PhotoBanner'
import RepoBanner from './banners/RepoBanner'
import ShopBanner from './banners/ShopBanner'
import MakerWorldBanner from './banners/MakerWorldBanner'
import LinkedInBanner from './banners/LinkedInBanner'
import VenmoBanner from './banners/VenmoBanner'
import { useWiiAudio } from './hooks/useWiiAudio'
import './App.css'

export default function App() {
  const [activeChannel, setActiveChannel] = useState(null)
  // Store the full channel object so banners (e.g. RepoBanner) can access its data
  const [activeChannelData, setActiveChannelData] = useState(null)
  const audio = useWiiAudio()

  function handleSelect(id, channelData) {
    audio.playSelect()
    setActiveChannel(id)
    setActiveChannelData(channelData)
  }

  function handleBack() {
    audio.playBack()
    setActiveChannel(null)
    setActiveChannelData(null)
  }

  function renderBannerContent() {
    if (!activeChannel) return null
    if (activeChannel === 'mii-channel') return <AboutBanner />
    if (activeChannel === 'photo-channel') return <PhotoBanner />
    if (activeChannel === 'wii-shop') return <ShopBanner />
    if (activeChannel === 'check-mii-out') return <MakerWorldBanner />
    if (activeChannel === 'linkedin') return <LinkedInBanner />
    if (activeChannel === 'venmo') return <VenmoBanner />
    if (activeChannel.startsWith('repo-') || activeChannel === 'rune-claude') {
      return <RepoBanner channel={activeChannelData} />
    }
    return null
  }

  return (
    <div className="wii">
      <WiiBackground />
      <WiiCursor />
      <WiiHeader audioEnabled={audio.enabled} onAudioToggle={audio.toggle} />
      <ChannelGrid onSelect={handleSelect} onHover={audio.playHover} />
      <WiiFooter />
      <ChannelBanner channelId={activeChannel} onBack={handleBack}>
        {renderBannerContent()}
      </ChannelBanner>
    </div>
  )
}
```

- [ ] **Step 2: Update ChannelSlot to pass full channel object to onSelect**

In `src/components/ChannelSlot.jsx`, change the `handleClick` function:

```jsx
function handleClick() {
  onSelect?.(channel.id, channel)
}
```

- [ ] **Step 3: Update ChannelGrid to forward channel object to onSelect**

In `src/components/ChannelGrid.jsx`, the `onSelect` prop already receives `id` from ChannelSlot. Update to pass through the channel object too. The `onSelect` callback in ChannelGrid currently receives `(id)` from ChannelSlot and passes it up to App. Since ChannelSlot now calls `onSelect(channel.id, channel)`, ChannelGrid just needs to forward both args:

In `src/components/ChannelGrid.jsx`, the `<ChannelSlot>` receives `onSelect={onSelect}` — no change needed there since the prop is forwarded directly. The signature just flows through.

- [ ] **Step 4: Run dev server and verify all banners**

```bash
npm run dev
```
Test each channel:
- Click "Mii Channel" → white panel with name, bio, skill bars
- Click "Photo Channel" → hero image with toolbar
- Click any repo tile → dark GitHub-style banner with name, description, stars, link
- Click "Wii Shop Channel" → orange gradient with 3 referral cards
- Click "Check Mii Out" → dark panel with MakerWorld green CTA
- Click "LinkedIn" → blue banner with Open Profile button
- Click "Venmo" (page 2) → blue-ish banner with @JaymesBunce handle
- Click "← Back" on each → zoom-out returns to grid

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx src/components/ChannelSlot.jsx
git commit -m "feat: wire all banners into App — full portfolio complete"
```

---

## Task 17: Polish pass — hover states, empty slot indicator, touch fallback

**Files:**
- Modify: `src/components/ChannelGrid.module.css`
- Modify: `src/components/ChannelSlot.module.css`
- Modify: `src/index.css`

- [ ] **Step 1: Add "locked" visual to empty slots in ChannelSlot.module.css**

Add to the existing `src/components/ChannelSlot.module.css`:

```css
.emptyInner {
  width: 28px;
  height: 28px;
  border: 2px solid rgba(255,255,255,0.15);
  border-radius: 6px;
  opacity: 0.3;
}
```

Update `src/components/ChannelSlot.jsx` — inside the empty branch, add the lock icon:

```jsx
if (!channel) {
  return (
    <div className={`${styles.slot} ${styles.empty}`} aria-hidden="true">
      <span className={styles.emptyInner} />
    </div>
  )
}
```

- [ ] **Step 2: Ensure arrow buttons hide when at first/last page**

In `src/components/ChannelGrid.module.css`, add:

```css
.arrowBtn:disabled {
  opacity: 0.2;
  pointer-events: none;
}
```

- [ ] **Step 3: Touch device: restore pointer events on buttons**

In `src/index.css`, ensure touch users can click (cursor is auto on touch). Add at the bottom:

```css
@media (hover: none) {
  button, a, [role="button"] {
    cursor: auto;
  }
}
```

- [ ] **Step 4: Run dev server and do a final visual QA pass**

```bash
npm run dev
```
Check:
- Empty slots show a small dim square, not just blank
- Arrow buttons at page 0: left arrow is dim/disabled; at page 1: right arrow is dim/disabled
- On a touch-simulated viewport (Chrome DevTools device toolbar): standard cursor visible, all buttons tappable
- No layout overflow or scrollbars on the main grid view

- [ ] **Step 5: Commit**

```bash
git add src/components/ChannelSlot.jsx src/components/ChannelSlot.module.css src/components/ChannelGrid.module.css src/index.css
git commit -m "feat: polish — empty slot indicator, disabled arrows, touch fallback"
```

---

## Task 18: Build verification

**Files:** None created — verification only.

- [ ] **Step 1: Run production build**

```bash
npm run build
```
Expected: Build completes with no errors. Output in `dist/`.

- [ ] **Step 2: Preview the production build**

```bash
npm run preview
```
Expected: Site loads at `http://localhost:4173`. All channels open correctly. Audio toggle works. Cursor visible.

- [ ] **Step 3: Check console for errors**

Open browser DevTools → Console. Expected: No errors. Warnings about missing audio/sprite files are acceptable if assets were not downloaded yet (Task 1), but no JS errors.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: production build verified"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] WiiBackground canvas bubble animation — Task 4
- [x] WiiCursor with tilt physics — Task 5
- [x] useWiiAudio (BGM + SFX) — Task 6
- [x] WiiHeader (clock + speaker toggle) — Task 7
- [x] WiiFooter (Mii bar) — Task 8
- [x] ChannelSlot tile with float animation — Task 9
- [x] ChannelGrid 4×3, 2 pages, GitHub API — Task 10
- [x] ChannelBanner zoom open/close — Task 11
- [x] AboutBanner (Mii Channel) — Task 12
- [x] PhotoBanner — Task 13
- [x] RepoBanner (featured + dynamic) — Task 14
- [x] ShopBanner, MakerWorldBanner, LinkedInBanner, VenmoBanner — Task 15
- [x] Full banner wiring + channel data passed — Task 16
- [x] Polish: empty slots, disabled arrows, touch fallback — Task 17
- [x] Asset download (sprites, SFX, BGM) — Task 1
- [x] Old code deleted — Task 2
- [x] channels.js data — Task 3

**No placeholders found.**

**Type consistency confirmed:** `channel.id`, `channel.label`, `channel.sprite`, `channel.language`, `channel.description`, `channel.url`, `channel.stars`, `channel.featured` — used consistently across channels.js → ChannelSlot → RepoBanner. `onSelect(id, channelData)` signature consistent from ChannelSlot → ChannelGrid → App.
