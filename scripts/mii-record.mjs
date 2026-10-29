// Records a scripted run of the dev site, then cuts it into contact sheets so motion can be
// read as a row of frames. Set PLAYWRIGHT_CHROMIUM_PATH (see CLAUDE.md). Needs `npm run dev` on :5173 (or pass URL) and ffmpeg.
//   [CROP=w:h:x:y] node scripts/mii-record.mjs <scenario> [outDir] [fps]    scenarios: certs, pose, intro
import { chromium } from 'playwright'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, renameSync, rmSync } from 'node:fs'

const [scenario = 'certs', out = `.playwright-mcp/rec-${scenario}`, fps = '5'] = process.argv.slice(2)
const URL = process.env.URL ?? 'http://localhost:5173/'
const SIZE = { width: 1400, height: 900 }
const click = (page, loc) => loc.evaluate(el => el.click())

const SCENARIOS = {
  // the intro walk-in (the 3.5s load wait already covers its start, so just record on)
  async intro(page) { await page.waitForTimeout(4000) },
  // POSE=swat: stands the menu Mii still and plays one pose (dev builds expose window.__mii).
  async pose(page) {
    await page.waitForTimeout(1500)
    await page.evaluate(() => { window.__miiHold = true }) // stop wandering and idle antics
    await page.waitForTimeout(5000) // let a stroll in progress finish
    await page.evaluate(p => window.__mii.act(p, 2500), process.env.POSE ?? 'swat')
    const b = await page.locator('canvas').last().boundingBox()
    await page.waitForTimeout(3000)
    // crop around where he stands, unless CROP overrides
    return `320:300:${Math.max(0, Math.round(b.x + b.width / 2 - 160))}:${Math.max(0, Math.round(b.y + b.height - 260))}`
  },
  async certs(page) {
    await click(page, page.getByRole('button', { name: /Open Resume/i }))
    await page.waitForTimeout(1500)
    await click(page, page.getByText('Certifications', { exact: true }).first())
    await page.waitForTimeout(1500)
    await click(page, page.getByRole('button', { name: 'Sure!' }))
    await page.waitForTimeout(16000)
  },
}

rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH })
const ctx = await browser.newContext({ viewport: SIZE, recordVideo: { dir: out, size: SIZE } })
const page = await ctx.newPage()
await page.goto(URL)
await page.waitForTimeout(3500)
const autoCrop = await SCENARIOS[scenario](page)
await ctx.close() // flushes the video
await browser.close()

const webm = readdirSync(out).find(f => f.endsWith('.webm'))
renameSync(`${out}/${webm}`, `${out}/run.webm`)
// 12 frames per sheet (4x3), cropped to the content panel, each 460px wide, stamped with its time.
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', `${out}/run.webm`, '-vf',
  `fps=${fps},crop=${process.env.CROP ?? autoCrop ?? '1400:420:0:340'},scale=460:-1,drawtext=text='%{pts\\:hms}':x=6:y=6:fontsize=18:fontcolor=red:box=1:boxcolor=white@0.8,tile=4x3`,
  `${out}/sheet-%02d.png`], { stdio: 'inherit' })
console.log(readdirSync(out).filter(f => f.endsWith('.png')).map(f => `${out}/${f}`).join('\n'))
