// Scrapes public profile stats from MakerWorld's SSR __NEXT_DATA__ blob.
// No public API exists (auth-scoped + CORS-blocked); this runs headless
// Chromium (which passes Cloudflare's bot check, unlike plain curl/fetch)
// on a schedule via .github/workflows/scrape-makerworld.yml.
import { chromium } from 'playwright'
import { writeFile, appendFile } from 'node:fs/promises'

const PROFILE_URL = 'https://makerworld.com/en/@Haloman363'
const OUT_PATH = new URL('../src/data/makerworld-snapshot.json', import.meta.url)

const MAX_ATTEMPTS = 3

// The profile sometimes comes back as a bot-check interstitial (which clears
// itself after a few seconds) or a transient error page. Wait for the data blob
// to appear and retry with a fresh page before giving up.
async function fetchNextData(browser) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const page = await browser.newPage({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    })
    try {
      await page.goto(PROFILE_URL, { waitUntil: 'domcontentloaded', timeout: 45_000 })
      await page.waitForFunction(() => document.getElementById('__NEXT_DATA__'), null, { timeout: 25_000 })
      return await page.evaluate(() => document.getElementById('__NEXT_DATA__').textContent)
    } catch (err) {
      const title = await page.title().catch(() => '?')
      console.warn(`Attempt ${attempt}/${MAX_ATTEMPTS} failed (page title: "${title}"): ${err.message.split('\n')[0]}`)
    } finally {
      await page.close()
    }
    if (attempt < MAX_ATTEMPTS) await new Promise(r => setTimeout(r, attempt * 10_000))
  }
  return null
}

const browser = await chromium.launch()
const raw = await fetchNextData(browser)
await browser.close()

// Tell the workflow whether a fresh snapshot was written (see scrape-makerworld.yml).
const setOutput = (value) =>
  process.env.GITHUB_OUTPUT ? appendFile(process.env.GITHUB_OUTPUT, `scraped=${value}\n`) : Promise.resolve()

// Cloudflare sometimes serves GitHub's runners a bot-check page that never clears.
// That's outside our control, so keep the last good snapshot and exit cleanly
// instead of failing the run. A page that loads but has an unexpected shape still
// throws below, since that needs a code fix.
if (!raw) {
  console.warn(`::warning::MakerWorld bot-check blocked all ${MAX_ATTEMPTS} attempts; keeping the previous snapshot`)
  await setOutput('false')
  process.exit(0)
}

const { userInfo, modelUploadCount, recentDesigns } = JSON.parse(raw).props.pageProps

const snapshot = {
  fetchedAt: new Date().toISOString(),
  followers: userInfo.fanCount,
  following: userInfo.followCount,
  likes: userInfo.likeCount,
  downloads: userInfo.downloadCount,
  collections: userInfo.collectionCount,
  designCount: modelUploadCount.design3DCnt,
  models: recentDesigns.hits.map(m => ({
    title: m.title,
    url: `https://makerworld.com/en/models/${m.id}`,
    coverUrl: m.coverUrl,
    likes: m.likeCount,
    downloads: m.downloadCount,
    prints: m.printCount,
  })),
}

await writeFile(OUT_PATH, JSON.stringify(snapshot, null, 2) + '\n')
await setOutput('true')
console.log(`Wrote ${OUT_PATH.pathname}`)
