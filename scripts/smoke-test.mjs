// Browser smoke test: opens every channel, checks nothing crashes, and re-checks layouts that
// have broken before (clipped tiles on short tablets, horizontal overflow on phones).
//
//   npm run build && npx vite preview --port 4173 &   # then:
//   npm run test:smoke                                # SMOKE_URL overrides http://localhost:4173
//
// External services are blocked so the run is hermetic; the site is expected to degrade
// gracefully without them (Forecast shows a random spot, News its empty state, ...).
import { chromium } from 'playwright'

const URL = process.env.SMOKE_URL ?? 'http://localhost:4173/'
const failures = []
const fail = (msg) => { failures.push(msg); console.error(`  FAIL  ${msg}`) }
const pass = (msg) => console.log(`  ok    ${msg}`)
const check = (cond, msg) => (cond ? pass(msg) : fail(msg))

const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {}
)

async function newPage(viewport, { touch = false } = {}) {
  const context = await browser.newContext({ viewport, hasTouch: touch, isMobile: touch, locale: 'en-US' })
  await context.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)/, (route) => route.abort())
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(URL, { waitUntil: 'load' })
  await page.locator('[data-channel-tile]').first().waitFor({ timeout: 15000 })
  await page.waitForTimeout(900) // let the tile entrance animation settle
  return { page, context, errors }
}

const tilesIn = (page) => page.locator('[data-channel-tile]')

// ---------------------------------------------------------------- desktop: every channel opens
console.log('Desktop 1280x800')
{
  const { page, context, errors } = await newPage({ width: 1280, height: 800 })
  const pageDots = await page.getByRole('tab').count()
  const pages = Math.max(1, pageDots)
  let opened = 0
  for (let p = 0; p < pages; p++) {
    if (pageDots) await page.getByLabel(`Go to page ${p + 1}`).click()
    await page.waitForTimeout(400)
    const labels = await tilesIn(page).evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')))
    for (const label of labels) {
      await page.getByLabel(label, { exact: true }).click()
      const content = page.locator('[class*="viewport"] [class*="content"]').first()
      try {
        await content.waitFor({ timeout: 8000 })
        await page.waitForTimeout(500)
        const text = (await content.innerText()).trim()
        if (!text) fail(`${label}: opened but the channel is empty`)
        else if (/hit a snag/i.test(text)) fail(`${label}: shows the error screen`)
        else opened++
      } catch {
        fail(`${label}: did not open`)
      }
      await page.keyboard.press('Escape')
      await page.locator('[class*="viewport"]').first().waitFor({ state: 'detached', timeout: 5000 }).catch(() => fail(`${label}: Escape did not close it`))
    }
  }
  check(opened >= 10, `opened ${opened} channels without errors`)
  check(errors.length === 0, `no uncaught page errors${errors.length ? ': ' + errors[0] : ''}`)
  await context.close()
}

// ---------------------------------------------------------------- tablets: tiles must fit above the footer
for (const [w, h] of [[820, 1180], [768, 1024], [1000, 700], [900, 600]]) {
  console.log(`Tablet ${w}x${h}`)
  const { page, context, errors } = await newPage({ width: w, height: h }, { touch: true })
  const m = await page.evaluate(() => {
    const tiles = [...document.querySelectorAll('[data-channel-tile]')].map((t) => t.getBoundingClientRect())
    const footer = document.querySelector('[class*="bottomSection"]').getBoundingClientRect()
    return { count: tiles.length, lowest: Math.max(...tiles.map((t) => t.bottom)), highest: Math.min(...tiles.map((t) => t.top)), footerTop: footer.top, rightmost: Math.max(...tiles.map((t) => t.right)) }
  })
  check(m.lowest <= m.footerTop + 1, `all ${m.count} tiles sit above the footer (lowest ${Math.round(m.lowest)} <= footer ${Math.round(m.footerTop)})`)
  check(m.rightmost <= w + 1 && m.highest >= 0, 'tiles are inside the screen')
  check(errors.length === 0, 'no uncaught page errors')
  await context.close()
}

// ---------------------------------------------------------------- phone: no sideways scrolling
console.log('Phone 390x844')
{
  const { page, context, errors } = await newPage({ width: 390, height: 844 }, { touch: true })
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  check(overflow <= 0, `no horizontal overflow (${overflow}px)`)
  await tilesIn(page).first().tap()
  await page.locator('[class*="viewport"] [class*="content"]').first().waitFor({ timeout: 8000 })
  const bannerOverflow = await page.evaluate(() => {
    const el = document.querySelector('[class*="viewport"] [class*="content"]')
    return el.scrollWidth - el.clientWidth
  })
  check(bannerOverflow <= 1, `an open channel has no horizontal overflow (${bannerOverflow}px)`)
  check(errors.length === 0, 'no uncaught page errors')
  await context.close()
}

await browser.close()
if (failures.length) {
  console.error(`\n${failures.length} check(s) failed:\n - ${failures.join('\n - ')}`)
  process.exit(1)
}
console.log('\nAll smoke checks passed.')
