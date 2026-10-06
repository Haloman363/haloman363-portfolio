# haloman363 portfolio

A personal portfolio styled as the Nintendo Wii Menu. Each "channel" tile opens a banner for a different part of my work: resume, GitHub projects, MakerWorld models, LinkedIn, referrals and more.

**Live site:** https://www.jaymesbunce.com (served from GitHub Pages, see `public/CNAME`)

## Stack

- React 19 + Vite
- Framer Motion for animation
- CSS Modules for styling
- Playwright (dev only) for the MakerWorld scraper

## Getting started

```bash
npm ci
npm run dev      # start the dev server
npm run build    # production build into dist/
npm run preview  # serve the production build locally
npm run lint     # ESLint
```

## Project layout

| Path | Purpose |
| --- | --- |
| `src/components/` | Wii shell: background, cursor, header, footer, channel grid and slots |
| `src/banners/` | One banner component per channel |
| `src/data/channels.js` | Channel definitions and grid slot assignments |
| `src/data/makerworld-snapshot.json` | Generated MakerWorld stats (do not edit by hand) |
| `src/hooks/` | Cursor physics and audio hooks |
| `public/wii/` | Sprites and audio |
| `public/resume/` | Resume PDF and photo |
| `scripts/scrape-makerworld.mjs` | Scrapes public MakerWorld profile stats |
| `docs/superpowers/` | Design spec and implementation plans |

## Automation

- **Deploy** (`.github/workflows/deploy.yml`): pushes to `master` build the site and publish it to GitHub Pages.
- **MakerWorld stats** (`.github/workflows/scrape-makerworld.yml`): runs daily, scrapes the profile and commits an updated `makerworld-snapshot.json`. These are the frequent `chore: update MakerWorld stats snapshot` commits.

## Scope

Desktop-first by design. There is no backend or database, and mobile/responsive layout is not currently supported (see `docs/superpowers/specs/`).
