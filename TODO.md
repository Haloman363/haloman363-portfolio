# TODO

Running list for the portfolio. Check items off as they land. Items marked **(needs decision)** are blocked on a choice from Jaymes.

## Needs verification / follow-up

- [ ] **MakerWorld data-branch pipeline is untested.** Every manual scrape run on 2026-10-06 was blocked by Cloudflare ("Just a moment..."), so the "Commit snapshot to `makerworld-data` branch" step has never actually run. Check the next scheduled run (daily 13:00 UTC): a `makerworld-data` branch should appear and trigger a deploy. If MakerWorld keeps blocking GitHub's runners, options are (a) accept stale stats, (b) run the scraper from a home machine and push to `makerworld-data`, (c) try a less detectable browser mode (judgment call).
- [ ] **Old bot commits in `master`.** 45 of ~55 commits are "chore: update MakerWorld stats snapshot". New ones now go to `makerworld-data`. Cleaning up the old ones means a force-push to `master` (auto-deploys), so only do it deliberately. **(needs decision)**
- [ ] Delete the leftover `claude/beautiful-dijkstra-b0sayl` branch once nothing else needs it.

## Quick wins

- [ ] **Contact channel** ("Message Board" tile): a way to reach me. Resume deliberately omits email, so decide what to publish: email, a contact form, or just LinkedIn/GitHub links. **(needs decision)**
- [ ] **Startup splash:** optional "Press A to start" screen on first load that plays `sfx-startup.mp3` (also unlocks audio autoplay on mobile). Audio already in `public/wii/audio/`.
- [ ] **Keyboard / gamepad navigation:** arrow keys move between tiles, Enter opens, Escape goes back. Optional Gamepad API support.
- [ ] **Easter eggs:** Konami code, clicking the clock, clicking the Mii.

## Medium

- [ ] **Forecast Channel:** weather tile for Logan, UT (needs a free no-key weather API; check CORS). **(needs decision: location / API)**
- [ ] **News Channel:** latest GitHub commits / MakerWorld uploads as a live feed.
- [ ] **Photo / 3D print gallery:** `src/banners/PhotoBanner.jsx` exists but isn't wired into `channels.js`. Needs photos. **(needs decision: which photos)**
- [ ] **Mii Plaza visitor wall:** wandering Miis on the home screen, one per recent visitor. Needs a tiny backend, which the spec currently rules out. **(needs decision)**
- [ ] **Settings channel:** expand the wrench menu (volume, reduce motion, theme picker).
- [ ] **Projects channel:** fuller write-ups of the best projects with screenshots.

## Polish and housekeeping

- [ ] **Footer buttons on phones:** sound/settings buttons render ~28px; enlarge the tap target to 44px without changing the look.
- [ ] **Tablet spacing:** the 3-column grid has large gaps between rows; consider larger tiles.
- [ ] **Open-channel zoom on phones:** `zoomVariants` in `ChannelBanner.jsx` assumes an 80% viewport height, phones use 75%, so the zoom origin is slightly off.
- [ ] **Accessibility pass:** focus rings, labels for sprite-only tiles, `prefers-reduced-motion` coverage.
- [ ] **Share image:** a proper Open Graph image for link previews (currently uses `mii-fullbody.png`).
- [ ] Test on real iOS Safari / Android Chrome (all mobile testing so far was headless Chromium emulation).

## Done

- [x] Real README; removed unused Vite template assets; plan docs marked implemented.
- [x] ESLint clean (`npm run lint` passes).
- [x] Tablet/phone tile sprites keep their aspect ratio so labels aren't cropped.
- [x] "Best viewed on a desktop" banner on phone/tablet (dismissible, dark-mode aware).
- [x] Swipe between channels; `dvh` heights; touch polish.
- [x] US Mobile added to Referrals.
- [x] MakerWorld snapshots go to a `makerworld-data` branch instead of `master`; scraper retries and no longer fails the run when blocked by the bot-check.
