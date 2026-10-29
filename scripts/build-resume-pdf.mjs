// Regenerates public/resume/Jaymes-Bunce-Resume.pdf from src/data/resume.js so the PDF, the
// Resume channel and LinkedIn can be kept in sync by editing one file.
//
//   npm run resume:pdf      # PLAYWRIGHT_CHROMIUM_PATH overrides the browser binary
import { chromium } from 'playwright'
import { writeFile } from 'node:fs/promises'
import { PROFILE, EDUCATION, EXPERIENCE, SKILLS, CERTIFICATIONS } from '../src/data/resume.js'

const OUT = new URL('../public/resume/Jaymes-Bunce-Resume.pdf', import.meta.url)
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const link = (href, text) => (href ? `<a href="${esc(href)}">${esc(text)}</a>` : esc(text))
const groups = (list, key) => list.map((g) => `<div class="g"><b>${esc(g[key])}:</b> ${esc(g.items.join(', '))}</div>`).join('')
const CERT_GROUPS = [
  ['Google Workspace', (c) => c.name.startsWith('Google Workspace')],
  ['Google AI', (c) => c.issuer === 'Google'],
  ['Anthropic', (c) => c.issuer === 'Anthropic'],
  ['TestOut', () => true],
]
const certs = () => {
  const left = [...CERTIFICATIONS]
  return CERT_GROUPS.map(([label, test]) => {
    const mine = left.filter(test)
    mine.forEach((c) => left.splice(left.indexOf(c), 1))
    return mine.length ? `<div class="g"><b>${label}:</b> ${mine.map((c) => link(c.url, c.name.replace(/^(Google Workspace|Claude Academy:) /, '')) + ` (${esc(c.date)})`).join('; ')}</div>` : ''
  }).join('')
}

const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(PROFILE.name)} - Resume</title><style>
@page{size:letter;margin:0.4in 0.55in}
body{font-family:"Liberation Sans",Arial,sans-serif;font-size:9.5pt;color:#111;margin:0;line-height:1.3}
h1{font-size:22pt;margin:0}
.hl{font-size:10.5pt;color:#3d6b4f;font-weight:bold;margin:1px 0 3px}
.ct{font-size:9pt;color:#333}
h2{font-size:10.5pt;color:#3d6b4f;margin:8px 0 3px;border-bottom:1px solid #3d6b4f;padding-bottom:2px;text-transform:uppercase;letter-spacing:.5px}
.row{display:flex;justify-content:space-between}.b{font-weight:bold}
ul{margin:2px 0 5px;padding-left:18px}li{margin:1px 0}
a{color:inherit;text-decoration:none}.g{font-size:9pt;margin:2px 0}.job{margin-top:5px}.d{font-weight:normal;color:#333}
.co{color:#3d6b4f}
</style></head><body>
<h1>${esc(PROFILE.name)}</h1><div class="hl">${esc(PROFILE.headline)}</div>
<div class="ct">${esc(PROFILE.location)} | ${link(PROFILE.linkedin, PROFILE.linkedin.replace('https://www.', ''))} | ${link(PROFILE.site, PROFILE.site.replace('https://', ''))}</div>
<h2>Summary</h2><div>${esc(PROFILE.summary)}</div>
<h2>Experience</h2><div class="b">${esc(EXPERIENCE[0].company)} <span class="d">| ${esc(EXPERIENCE[0].location)}</span></div>
${EXPERIENCE.map((j) => `<div class="job row b"><span>${esc(j.role)}</span><span class="d">${esc(j.dates)}</span></div><ul>${j.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`).join('')}
<h2>Skills</h2>${groups(SKILLS, 'group')}
<h2>Certifications</h2>${certs()}
<h2>Education</h2>${EDUCATION.map((e) => `<div class="row"><span><b>${esc(e.school)}</b>, ${esc(e.degree)}</span><span>${esc(e.date)}</span></div>`).join('')}
</body></html>`

const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {}
)
const page = await browser.newPage()
await page.setContent(html)
await writeFile(OUT, await page.pdf({ preferCSSPageSize: true }))
await browser.close()
console.log('wrote', OUT.pathname)
