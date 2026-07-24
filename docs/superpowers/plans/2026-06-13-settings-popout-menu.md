# Settings Popout Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the decorative mail button in the footer corner with a functional settings icon that opens a popout menu containing the sound and dark mode toggles, removing the two floating fixed-position buttons.

**Architecture:** Add a `settingsOpen` boolean state to `WiiFooter`. The footer's right-corner button switches from the mail-button sprite to settings-icon. A popout `<div>` renders above it when open, containing the two toggles. Clicking outside or clicking the button again closes it. The existing floating `audioButton` and `darkButton` elements and all their CSS are removed.

**Tech Stack:** React (useState, useEffect, useRef), CSS Modules

---

### Task 1: Add settings state and wire up the corner button

**Files:**
- Modify: `src/components/WiiFooter.jsx`

- [ ] **Step 1: Add `useState` for `settingsOpen` and a `useRef` for click-outside detection**

In `WiiFooter.jsx`, update the imports and add state. The full updated top of the file:

```jsx
import { useEffect, useRef, useState } from 'react'
import styles from './WiiFooter.module.css'

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function formatDate(d) {
  return `${DAYS[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}`
}

export default function WiiFooter({ audioEnabled, onAudioToggle, darkMode, onDarkToggle, channelOpen }) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsRef = useRef(null)
```

- [ ] **Step 2: Add click-outside handler to close the menu**

Inside the component, after the existing `useEffect` for the date clock, add:

```jsx
  useEffect(() => {
    if (!settingsOpen) return
    function handleOutside(e) {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [settingsOpen])
```

- [ ] **Step 3: Replace the mail button div with a clickable settings button**

Find this in the JSX:

```jsx
        <div className={`${styles.mailButton} ${styles.cornerButton}`} />
```

Replace with:

```jsx
        <div className={styles.rightButtonContainer} ref={settingsRef} style={{ position: 'absolute', bottom: 0, right: 0 }}>
```

Wait — the `rightButtonContainer` div already wraps this. The `ref` goes on the container. Replace the entire `rightButtonContainer` block:

```jsx
        <div className={styles.rightButtonContainer} ref={settingsRef}>
          <div className={styles.rightButton} />
          {settingsOpen && !channelOpen && (
            <div className={styles.settingsMenu}>
              <button
                className={styles.settingsMenuItem}
                onClick={() => { onAudioToggle(); }}
                aria-label={audioEnabled ? 'Mute audio' : 'Enable audio'}
              >
                {audioEnabled ? (
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="#5a8a6a" stroke="#5a8a6a" strokeWidth="1" strokeLinejoin="round"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="#5a8a6a" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="#5a8a6a" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="#888" stroke="#888" strokeWidth="1" strokeLinejoin="round"/>
                    <line x1="23" y1="9" x2="17" y2="15" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="17" y1="9" x2="23" y2="15" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )}
                <span>{audioEnabled ? 'Sound on' : 'Sound off'}</span>
              </button>
              <button
                className={styles.settingsMenuItem}
                onClick={() => { onDarkToggle(); }}
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? (
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                    <circle cx="12" cy="12" r="5" fill="#f5c842" />
                    <g stroke="#f5c842" strokeWidth="2" strokeLinecap="round">
                      <line x1="12" y1="2"  x2="12" y2="5"  />
                      <line x1="12" y1="19" x2="12" y2="22" />
                      <line x1="2"  y1="12" x2="5"  y2="12" />
                      <line x1="19" y1="12" x2="22" y2="12" />
                      <line x1="4.93"  y1="4.93"  x2="7.05"  y2="7.05"  />
                      <line x1="16.95" y1="16.95" x2="19.07" y2="19.07" />
                      <line x1="19.07" y1="4.93"  x2="16.95" y2="7.05"  />
                      <line x1="7.05"  y1="16.95" x2="4.93"  y2="19.07" />
                    </g>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" fill="#7090c0" />
                  </svg>
                )}
                <span>{darkMode ? 'Light mode' : 'Dark mode'}</span>
              </button>
            </div>
          )}
          <button
            className={`${styles.settingsButton} ${styles.cornerButton}`}
            onClick={() => !channelOpen && setSettingsOpen(o => !o)}
            aria-label="Settings"
            aria-expanded={settingsOpen}
          />
        </div>
```

- [ ] **Step 4: Remove the two floating buttons from JSX**

Delete the `{!channelOpen && <button className={styles.audioButton} ...>}` block and the `{!channelOpen && <button className={styles.darkButton} ...>}` block entirely. The return should end at `</>` with only the `bottomSection` div remaining (no floating buttons).

- [ ] **Step 5: Commit**

```bash
git add src/components/WiiFooter.jsx
git commit -m "feat: add settings button state and popout menu JSX"
```

---

### Task 2: Update CSS — swap mail sprite, add popout styles, remove floating button styles

**Files:**
- Modify: `src/components/WiiFooter.module.css`

- [ ] **Step 1: Replace `.mailButton` rule with `.settingsButton`**

Find:

```css
.mailButton {
  background-image: url('/wii/sprites/mail-button.png');
  width: 100px;
  height: 105px;
  position: absolute;
  bottom: 60px;
  right: 60px;
  background-size: 100% 100%;
  z-index: 999;
}
```

Replace with:

```css
.settingsButton {
  background-image: url('/wii/sprites/settings-icon.png');
  width: 100px;
  height: 105px;
  position: absolute;
  bottom: 60px;
  right: 60px;
  background-size: 100% 100%;
  background-color: transparent;
  border: none;
  cursor: none;
  z-index: 999;
}
```

- [ ] **Step 2: Add `.settingsMenu` and `.settingsMenuItem` styles**

Add after the `.settingsButton` rule:

```css
.settingsMenu {
  position: absolute;
  bottom: 175px;
  right: 20px;
  background: rgba(255, 255, 255, 0.92);
  border: 2px solid #b0b8c8;
  border-radius: 12px;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  z-index: 1200;
  min-width: 160px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.18);
  animation: settingsFadeIn 120ms ease;
}

:global(.dark) .settingsMenu {
  background: rgba(40, 55, 80, 0.96);
  border-color: #4a6a9e;
  box-shadow: 0 4px 16px rgba(0,0,60,0.4);
}

@keyframes settingsFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.settingsMenuItem {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: transparent;
  border: none;
  cursor: none;
  width: 100%;
  text-align: left;
  font-family: 'Asap', 'Nunito', sans-serif;
  font-size: 15px;
  color: #333;
  transition: background 150ms;
}

.settingsMenuItem:hover {
  background: rgba(90, 200, 232, 0.15);
}

:global(.dark) .settingsMenuItem {
  color: #dde8f8;
}

:global(.dark) .settingsMenuItem:hover {
  background: rgba(120, 170, 240, 0.2);
}
```

- [ ] **Step 3: Remove the `.audioButton` and `.darkButton` rule blocks and all their variants**

Delete these CSS blocks entirely (including their `:hover` and `:global(.dark)` variants):
- `.audioButton { ... }`
- `.audioButton:hover { ... }`
- `:global(.dark) .audioButton { ... }`
- `.darkButton { ... }`
- `.darkButton:hover { ... }`
- `:global(.dark) .darkButton { ... }`

Also remove `.audioButton` and `.darkButton` references in the responsive media query blocks:
- In `@media only screen and (max-width: 1023px)`: remove the `.audioButton, .darkButton { ... }`, `.audioButton svg, .darkButton svg { ... }`, `.audioButton { left: 8px; }`, `.darkButton { right: 8px; }` rules
- In `@media only screen and (max-width: 639px)`: remove the `.audioButton, .darkButton { ... }`, `.audioButton svg, .darkButton svg { ... }`, `.audioButton { left: 2px; }`, `.darkButton { right: 2px; }` rules

- [ ] **Step 4: Update responsive media query references from `.mailButton` to `.settingsButton`**

In `@media only screen and (max-height: 718px)`:

Find:
```css
  .wiiButton, .mailButton {
    bottom: 197px;
  }
```
Replace with:
```css
  .wiiButton, .settingsButton {
    bottom: 197px;
  }
```

In `@media only screen and (max-width: 1023px)`:

Find:
```css
  .wiiButton, .mailButton {
    bottom: 90px;
  }
```
Replace with:
```css
  .wiiButton, .settingsButton {
    bottom: 90px;
  }
```

- [ ] **Step 5: Commit**

```bash
git add src/components/WiiFooter.module.css
git commit -m "feat: swap mail sprite for settings icon, add popout menu styles, remove floating button CSS"
```

---

### Task 3: Remove audio toggle from WiiHeader (it duplicates the footer control)

**Files:**
- Modify: `src/components/WiiHeader.jsx`
- Modify: `src/components/WiiHeader.module.css`

> Check whether the header still uses its audio toggle props after this change — if `WiiHeader` receives `audioEnabled`/`onAudioToggle` but no longer renders a button, those props can be removed from the component signature (and the call site in `App.jsx`).

- [ ] **Step 1: Simplify `WiiHeader` to remove the audio button**

Replace the entire file content with:

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

export default function WiiHeader() {
  const [time, setTime] = useState(() => formatTime(new Date()))

  useEffect(() => {
    const id = setInterval(() => setTime(formatTime(new Date())), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className={styles.header}>
      <span className={styles.clock}>{time}</span>
    </header>
  )
}
```

- [ ] **Step 2: Remove unused audio props from `App.jsx` WiiHeader call**

In `src/App.jsx`, find:

```jsx
      <WiiCursor />
```

Verify `WiiHeader` is not rendered in `App.jsx` at all (it is imported but check if it's in the JSX). If it is rendered with props, remove `audioEnabled` and `onAudioToggle` from it. If it is not rendered, skip this step.

Actually — check the current `App.jsx`: `WiiHeader` is imported but not present in the JSX render. No change needed in `App.jsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/WiiHeader.jsx
git commit -m "chore: remove unused audio toggle from WiiHeader"
```

---

### Task 4: Verify in browser

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify the following in the browser**

1. Bottom-right footer corner shows the settings icon (not the mail icon)
2. Clicking the settings button opens a popout menu above it with "Sound on/off" and "Light/Dark mode" items
3. Clicking outside the menu closes it
4. Clicking the settings button again closes it
5. Sound toggle in the menu works (audio mutes/unmutes)
6. Dark mode toggle in the menu works (theme switches)
7. Menu does NOT appear when a channel is open
8. The two floating circle buttons (top-left audio, top-right dark mode) are gone
9. Responsive: on small screens the popout still appears (may be partially clipped — acceptable for now)

- [ ] **Step 3: Stop dev server and commit if all checks pass**

```bash
git add -p  # stage any fixup changes if needed
git commit -m "fix: verified settings popout menu behavior"
```
