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
npm run check    # lint + build (what CI runs first)
```

### Smoke test

Opens every channel in a real browser and re-checks layouts that have broken before (tiles clipped on short tablets, sideways scrolling on phones). External services are blocked so it runs the same everywhere.

```bash
npm run build && npx vite preview --port 4173 &
npx playwright install chromium   # first time only
npm run test:smoke                # SMOKE_URL=... to point it elsewhere
```

## Project layout

| Path | Purpose |
| --- | --- |
| `src/components/` | Wii shell: background, cursor, header, footer, channel grid and slots |
| `src/banners/` | One banner component per channel |
| `src/data/channels.js` | Channel definitions and grid slot assignments (12 per page; extra channels paginate) |
| `src/photos/` | Drop images here to enable the Photos channel (see its README) |
| `src/data/makerworld-snapshot.json` | Generated MakerWorld stats (do not edit by hand) |
| `src/hooks/` | Cursor physics and audio hooks |
| `public/wii/` | Sprites and audio |
| `public/resume/` | Resume PDF and photo |
| `scripts/scrape-makerworld.mjs` | Scrapes public MakerWorld profile stats |
| `scripts/smoke-test.mjs` | Browser smoke test (`npm run test:smoke`) |
| `docs/superpowers/` | Design spec and implementation plans |

## Automation

- **Deploy** (`.github/workflows/deploy.yml`): pushes to `master` run lint, build the site and publish it to GitHub Pages. A lint or build failure blocks the deploy.
- **CI** (`.github/workflows/ci.yml`): lint, build and the browser smoke test on every push and pull request. It reports problems but does not block deploys (yet).
- **MakerWorld stats** (`.github/workflows/scrape-makerworld.yml`): runs daily, scrapes the profile and commits the snapshot to the `makerworld-data` branch (keeping `master` history clean), then triggers a redeploy. The deploy workflow copies the latest snapshot from that branch into `src/data/` at build time. The copy committed on `master` is only a fallback.

## Scope

Responsive: desktop (1024px and up) shows the 4x3 Wii grid, tablets (640-1023px) a 3-column grid, and phones (under 640px) a single scrolling column. Touch devices skip hover effects and the custom cursor. There is no backend or database.
