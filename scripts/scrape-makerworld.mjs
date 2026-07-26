// Scrapes public profile stats from MakerWorld's SSR __NEXT_DATA__ blob.
// No public API exists (auth-scoped + CORS-blocked); this runs headless
// Chromium (which passes Cloudflare's bot check, unlike plain curl/fetch)
// on a schedule via .github/workflows/scrape-makerworld.yml.
import { chromium } from 'playwright'
import { writeFile } from 'node:fs/promises'

const PROFILE_URL = 'https://makerworld.com/en/@Haloman363'
const OUT_PATH = new URL('../src/data/makerworld-snapshot.json', import.meta.url)

const browser = await chromium.launch()
const page = await browser.newPage({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
})
await page.goto(PROFILE_URL, { waitUntil: 'domcontentloaded' })

const raw = await page.evaluate(() => document.getElementById('__NEXT_DATA__')?.textContent)
await browser.close()

if (!raw) throw new Error('__NEXT_DATA__ not found — MakerWorld page structure may have changed')

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
console.log(`Wrote ${OUT_PATH.pathname}`)
