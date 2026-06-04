# Wii Menu Portfolio — Design Spec

**Date:** 2026-06-03
**Project:** haloman363-portfolio
**Status:** Approved

---

## Overview

Full ground-up redesign of the portfolio site as a faithful recreation of the Nintendo Wii System Menu. The site retains all portfolio content (about, projects, links) but presents it entirely through the Wii channel grid UI — grid layout, animated background, custom cursor, audio, and full-screen channel banners. The tech stack (React 19 + Vite + Framer Motion) is preserved.

---

## 1. Architecture & Tech Stack

**Stack:** React 19 + Vite + Framer Motion. No new major dependencies. Audio via Web Audio API + standard `<audio>` elements. Background via HTML5 canvas rendered through a React ref and custom hook.

**Component tree:**

```
App
├── WiiBackground       — canvas: gradient + floating bubbles
├── WiiCursor           — global custom Wii Remote pointer
├── WiiHeader           — live clock (top-right) + speaker toggle
├── WiiFooter           — Mii avatar + name bar (bottom)
├── ChannelGrid         — 4×3 grid, two pages, page nav arrows
│   └── ChannelSlot × N — individual animated channel tiles
└── ChannelBanner       — full-screen overlay when a channel is open
    └── [content component per channel]
```

**State management:** Single `useState` in App. `activeChannel: null` = grid view. `activeChannel: string` = that channel's banner is open. No React Router.

**Assets:** All sprites, sounds, and music served locally from `public/wii/`. Sources:
- Sprites: The Spriters Resource (spriters-resource.com/wii/wiimenu)
- Sounds/SFX: The Sounds Resource (sounds.spriters-resource.com/wii/wiimenu)
- Music: Internet Archive — Wii Channel Soundtracks (archive.org/details/wiichannelsoundtracks)

GitHub API fetch (existing) retained for repo channel data.

---

## 2. Channel Grid & Content Mapping

**Layout:** 4 columns × 3 rows = 12 slots per page. Two pages total. Page navigation via left/right chevron buttons on the grid frame and keyboard arrow keys.

### Page 1

| Slot | Channel ID | Content |
|------|-----------|---------|
| 1 | `mii-channel` | About Me — bio, skills, avatar |
| 2 | `photo-channel` | Hero image / profile photo |
| 3 | `rune-claude` | Featured project spotlight (first repo channel) |
| 4–8 | `repo-[name]` | Next 5 GitHub repos (dynamic, from API; sorted by stars) |
| 9 | `wii-shop` | Referral links (Ally, Discover, Capital One) |
| 10 | `check-mii-out` | MakerWorld 3D print models |
| 11 | `linkedin` | LinkedIn profile |
| 12 | *(empty)* | Locked/blank slot |

### Page 2

| Slot | Channel ID | Content |
|------|-----------|---------|
| 1 | `venmo` | Venmo profile link |
| 2–12 | *(empty)* | Locked/blank slots (room to grow) |

**Channel icons:**
- Named channels (Mii Channel, Photo Channel, Wii Shop, etc.): static PNG sprites from The Spriters Resource.
- Repo channels: generated tile — language color dot + repo name text, styled as a Wii banner card.
- All tiles have a looping CSS float/pulse animation mimicking Wii animated banners.

---

## 3. Visual Fidelity & Animations

### Background
- HTML5 canvas, full viewport.
- Radial gradient: `#1a6ca8` (center) → `#8ec8e8` (edges), matching Wii's exact palette.
- ~25 translucent white bubbles, sizes 8px–60px, floating upward with slow randomized speeds and gentle horizontal drift. Each bubble has an inner highlight for the Wii's glassy look.
- Canvas redraws on `requestAnimationFrame`.

### Channel Grid Frame
- Gray rounded-rectangle border reproduced in CSS.
- Page indicator dots at bottom center.
- Left/right chevron arrow buttons using sprite assets.

### Wii Remote Cursor
- Absolutely-positioned `<div>` tracking `mousemove`.
- Hand pointer graphic from Spriters Resource.
- Rotates ±15° based on mouse velocity (physics accumulator — fast = more tilt, settles to neutral).
- Soft white glow effect follows cursor.
- Standard browser cursor hidden globally (`cursor: none`).

### Channel Open Animation
- Click sound plays immediately on channel click.
- Framer Motion `layoutId` shared layout animation: tile scales up and expands to fill viewport.
- Banner content fades in after expansion completes.
- "Back" button (top-left, Wii-style) triggers reverse zoom back to grid.

### Clock
- Top-right corner, white text, updates every second.
- Format: `Tuesday 3:42 PM` (matches Wii style).
- Font: FOT-Rodin Pro approximation via web font; fallback to Nunito (rounded sans).

### Mii Footer
- Bottom bar across full width.
- Static pixel-art avatar image (provided by user or placeholder).
- "JAYMES" label in Wii UI style.

### Audio
- Speaker toggle icon (top area). Off by default.
- **BGM:** Mii Channel theme loops on main grid when audio is on.
- **Hover SFX:** Soft blip on channel tile hover.
- **Click SFX:** Wii select sound on channel click.
- **Banner SFX:** Channel-specific jingle on open where available.
- All audio from `public/wii/audio/`.

---

## 4. Channel Banner Content

Each channel opens a full-screen banner. Content per channel:

### Mii Channel (About Me)
- White panel, avatar top-left.
- Name in large Rodin-style font.
- Short bio paragraph.
- Skills displayed as Mii attribute bars (colored horizontal bars, Mii editor style).

### Photo Channel
- Hero image (`src/assets/hero.png`) large and centered.
- Photo Channel UI chrome: gray toolbar at bottom with Wii-style nav buttons.
- Expandable to a gallery if more images are added later.

### rune-claude (Featured Project)
- Dark background, logo-style treatment of project name.
- Repo description, language badge, star count.
- Prominent "View on GitHub ↗" CTA button.

### Repo Channels (dynamic)
- Same template as rune-claude, auto-generated from GitHub API.
- Language color as accent, repo name as title, description as subtitle.
- GitHub link button.

### Wii Shop Channel (Referrals)
- Yellow/orange gradient, "Welcome to the Wii Shop Channel!" header.
- Cards for: Ally Bank ($100 bonus), Discover (cashback referral), Capital One (bonus benefits).
- Each card uses the link's accent color from the existing Links data.

### Check Mii Out (MakerWorld)
- MakerWorld profile link card.
- Wii channel banner styling with MakerWorld green (`#00e08a`) as accent.
- Model thumbnails grid if MakerWorld API allows, otherwise a styled link card.

### LinkedIn
- LinkedIn blue (`#0ea5e9`) branded banner.
- Profile name, headline, "Open Profile ↗" button.

### Venmo
- Venmo indigo (`#818cf8`) branded banner.
- `@JaymesBunce` handle, "Open Venmo ↗" button.

---

## 5. Error Handling & Edge Cases

- **GitHub API failure:** Repo channel slots show a "No Signal" placeholder tile (gray, static icon).
- **Audio blocked by browser:** Speaker toggle initializes to off; first toggle unlocks the AudioContext.
- **Cursor on touch devices:** Custom cursor hidden; standard touch interactions apply.
- **No empty slot crash:** Empty/locked slots render a dimmed placeholder tile with no click handler.
- **Font load failure:** Rounded sans fallback stack (`Nunito`, `system-ui`, `sans-serif`).

---

## 6. File Structure (additions)

```
public/
  wii/
    audio/
      mii-channel-theme.mp3
      sfx-hover.wav
      sfx-select.wav
      sfx-back.wav
    sprites/
      cursor-hand.png
      channel-mii.png
      channel-photo.png
      channel-shop.png
      channel-checkmiiout.png
      arrow-left.png
      arrow-right.png
src/
  components/
    WiiBackground.jsx      — canvas bubble animation
    WiiCursor.jsx          — custom pointer
    WiiHeader.jsx          — clock + speaker toggle
    WiiFooter.jsx          — Mii bar
    ChannelGrid.jsx        — grid + pagination
    ChannelSlot.jsx        — individual tile
    ChannelBanner.jsx      — full-screen overlay shell
  banners/
    AboutBanner.jsx        — Mii Channel content
    PhotoBanner.jsx        — Photo Channel content
    RepoBanner.jsx         — repo template
    ShopBanner.jsx         — Wii Shop / referrals
    MakerWorldBanner.jsx   — Check Mii Out
    LinkedInBanner.jsx
    VenmoBanner.jsx
  hooks/
    useWiiAudio.js         — audio management
    useCursorPhysics.js    — cursor tilt physics
  data/
    channels.js            — static channel definitions + slot assignments
```

---

## 7. Out of Scope

- Mobile/responsive layout (Wii menu was desktop/TV only; touch fallback is graceful degradation, not a mobile design).
- Server-side rendering.
- Any backend or database.
- MakerWorld API integration (link card only unless API is trivially available).
