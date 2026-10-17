// Regenerates public/resume/Jaymes-Bunce-Resume.pdf from src/data/resume.js so the PDF, the
// Resume channel and LinkedIn can be kept in sync by editing one file.
//
//   npm run resume:pdf      # PLAYWRIGHT_CHROMIUM_PATH overrides the browser binary
import { chromium } from 'playwright'
import { writeFile } from 'node:fs/promises'
import { PROFILE, EDUCATION, EXPERIENCE, SKILLS, CERTIFICATIONS, INTERESTS } from '../src/data/resume.js'

const OUT = new URL('../public/resume/Jaymes-Bunce-Resume.pdf', import.meta.url)
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const link = (href, text) => (href ? `<a href="${esc(href)}">${esc(text)}</a>` : esc(text))
const groups = (list, key) => list.map((g) => `<div class="b">${esc(g[key])}</div><div class="sk">${esc(g.items.join(', '))}</div>`).join('')

const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(PROFILE.name)} - Resume</title><style>
@page{size:letter;margin:0.5in 0.45in}
body{font-family:"Liberation Sans",Arial,sans-serif;font-size:9.6pt;color:#111;margin:0;line-height:1.3}
h1{font-size:19pt;margin:0 0 4px}
h2{font-size:10.5pt;color:#3d6b4f;margin:13px 0 4px;border-bottom:1px solid #3d6b4f;padding-bottom:3px}
.row{display:flex;justify-content:space-between}.b{font-weight:bold}
ul{margin:2px 0 6px;padding-left:20px}li{margin:1px 0}
a{color:#111}.sk{font-size:9pt}.cert{margin:3px 0}.job{margin-top:4px}
</style></head><body>
<h1>${esc(PROFILE.name)}</h1><div>${esc(PROFILE.location)}</div><div>${link(PROFILE.site, PROFILE.site)}</div>
<h2>Summary</h2><div>${esc(PROFILE.summary)}</div>
<h2>Education</h2>${EDUCATION.map((e) => `<div class="row"><span>${esc(e.school)}</span><span>${esc(e.date)}</span></div><div>${esc(e.degree)}</div>`).join('')}
<h2>Experience</h2><div class="row"><a href="https://www.conservice.com/">${esc(EXPERIENCE[0].company)}</a><span>${esc(EXPERIENCE[0].location)}</span></div>
${EXPERIENCE.map((j) => `<div class="job row b"><span>${esc(j.role)}</span><span style="font-weight:normal">${esc(j.dates)}</span></div><ul>${j.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`).join('')}
<h2 style="break-before:page;margin-top:0">Certifications</h2>
${CERTIFICATIONS.map((c) => `<div class="cert row"><span>${link(c.url, c.name)} &middot; ${esc(c.issuer)}</span><span>${esc(c.date)}</span></div>`).join('')}
<h2>Skills</h2>${groups(SKILLS, 'group')}
<h2>Interests</h2>${groups(INTERESTS, 'title')}
</body></html>`

const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {}
)
const page = await browser.newPage()
await page.setContent(html)
await writeFile(OUT, await page.pdf({ preferCSSPageSize: true }))
await browser.close()
console.log('wrote', OUT.pathname)
