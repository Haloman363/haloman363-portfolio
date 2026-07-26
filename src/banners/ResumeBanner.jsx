import { useState } from 'react'
import styles from './ResumeBanner.module.css'

const TABS = ['Summary', 'Experience', 'Skills', 'Certifications', 'Interests']

const EXPERIENCE = [
  {
    company: 'Conservice', location: 'Logan, Utah', role: 'Network Admin',
    dates: 'June 2022 - Present',
    bullets: [
      'Deploying and administering firewalls, strengthening network security, and reducing unauthorized access.',
      'Handle all aspects of OpenVPN servers for over 1,800 remote staff members across 4 regions.',
      'Manage Google Workspace for 3,000+ users, troubleshooting and configuring various Workspace services and features.',
      'Identified a manual process for managing SSL certificates, automating real-time issuance for 50+ servers.',
      'Automated IT processes with Ansible and PowerShell, cutting audit turnaround from 3 days to 1 day.',
      'Implemented 3 monitoring solutions (Zabbix, Uptime Kuma, PagerDuty) to cut incident response times.',
      'Maintain Linux servers and Docker environments, improving reliability and security patching for 26+ services.',
      'Administers ProofPoint email protection, reducing attack vectors for over 4 million monthly incoming emails.',
      'Monitor and maintain 30+ Ubiquiti access points across 4 buildings.',
    ],
  },
  {
    company: 'Conservice', location: 'Logan, Utah', role: 'IT Help Desk',
    dates: 'January 2022 - June 2022',
    bullets: [
      'Provided Tier 1-2 support for 3,000+ local and remote employees, resolving issues within a 1-hour timeframe.',
      'Assisted with administering Google Workspace, Microsoft 365, and custom PowerShell scripting for ticket resolution.',
      'Cut computer re-imaging time by 1 hour per unit by scripting the process in KACE.',
      'Installed and administered a Wiki.js server for IT documentation, reducing new-hire training time.',
      'Built a custom PowerShell toolkit of scripts for the team to resolve tickets rapidly.',
    ],
  },
  {
    company: 'Conservice', location: 'Logan, Utah', role: 'Electronic Data Exchange Setup Specialist',
    dates: 'January 2020 - January 2022',
    bullets: [
      'Coordinated with 170+ clients to configure and troubleshoot electronic data exchange systems.',
      'Set up an average of 150-200 properties per month into the internal system to process utility charges.',
      'Managed a portfolio of large firms/properties, tracking timelines to meet contracted setup dates.',
      'Trained a new employee to carry on the same portfolio care as I moved into new career steps.',
    ],
  },
]

const SKILLS = [
  { group: 'Systems', items: ['Linux Administration', 'Windows Server', 'Proxmox', 'Docker', 'KACE', 'pfSense', 'VMware vSphere', 'Ubuntu', 'LXC', 'Unifi Network Manager', 'OPNsense'] },
  { group: 'Networking', items: ['Firewall Administration', 'OpenVPN', 'DNS', 'DHCP', 'SSL', 'Netbird', 'VPN', 'Ubiquiti', 'VNC'] },
  { group: 'Cloud / Email', items: ['Google Workspace', 'Office 365', 'Mailgun', 'Proofpoint', 'GAM', 'Email Routing'] },
  { group: 'Automation', items: ['Ansible', 'PowerShell', 'AWX', 'Bash', 'Rsync', 'Cron'] },
  { group: 'Monitoring', items: ['Zabbix', 'Uptime Kuma', 'PagerDuty', 'Prometheus', 'Grafana'] },
  { group: 'AI', items: ['Claude', 'Claude Code', 'Gemini', 'Cowork', 'MCP'] },
]

const CERTIFICATIONS = [
  { name: 'Claude Code in Action', issuer: 'Anthropic', date: 'Feb 2026' },
  { name: 'Introduction to Agent Skills', issuer: 'Anthropic', date: 'Mar 2026' },
  { name: 'Introduction to Claude Cowork', issuer: 'Anthropic', date: 'Mar 2026' },
  { name: 'Claude 101', issuer: 'Anthropic', date: 'Mar 2026' },
  { name: 'AI Fluency Framework & Foundations', issuer: 'Anthropic', date: 'Mar 2026' },
  { name: 'Introduction to Subagents', issuer: 'Anthropic', date: 'Mar 2026' },
]

const INTERESTS = [
  { title: 'Homelab / Self-Hosting', items: ['Proxmox', 'pfSense', 'TrueNAS', 'Plex', 'Nextcloud', 'VPN', 'Ansible', 'LXC', 'Ubiquiti', 'TP-Link Omada', 'OPNsense'] },
  { title: 'Gaming', items: ['LAN Parties', 'PC Building', 'Game Server Hosting', 'VR', 'Streaming', 'Local Tournaments'] },
  { title: 'Maker Hobbies', items: ['3D Printing', 'Soldering', 'Home Projects', '3D Modeling', 'Cosplay', 'Programming', 'Custom Keyboards'] },
]

const RESUME_PDF = `${import.meta.env.BASE_URL}resume/Jaymes-Bunce-Resume.pdf`

export default function ResumeBanner() {
  const [tab, setTab] = useState('Summary')

  return (
    <div className={styles.resume}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.name}>Jaymes Bunce</h1>
          <p className={styles.tagline}>Network Administrator &middot; Logan, UT (Ready to Relocate)</p>
        </div>
        <a className={styles.download} href={RESUME_PDF} download target="_blank" rel="noopener noreferrer">
          Download Resume ↓
        </a>
      </div>

      <div className={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className={styles.panel}>
        {tab === 'Summary' && (
          <div className={styles.summary}>
            <p className={styles.summaryText}>
              Network Administrator with 5+ years of IT experience in Linux administration, networking, cloud
              services (Google Workspace, O365), and automation (Ansible, Docker, PowerShell). Skilled at deploying
              secure infrastructure, managing enterprise systems, and streamlining IT operations. Actively seeking
              to contribute technical expertise to a growing IT team.
            </p>
            <div className={styles.eduCard}>
              <p className={styles.eduSchool}>Brigham Young University - Idaho</p>
              <p className={styles.eduDegree}>B.S. in Computer Information Technology</p>
              <p className={styles.eduDate}>Graduated 2021</p>
            </div>
          </div>
        )}

        {tab === 'Experience' && (
          <div className={styles.experience}>
            {EXPERIENCE.map(job => (
              <div key={job.role} className={styles.job}>
                <div className={styles.jobHead}>
                  <div>
                    <p className={styles.jobRole}>{job.role}</p>
                    <p className={styles.jobCompany}>{job.company} &middot; {job.location}</p>
                  </div>
                  <span className={styles.jobDates}>{job.dates}</span>
                </div>
                <ul className={styles.bullets}>
                  {job.bullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}

        {tab === 'Skills' && (
          <div className={styles.skills}>
            {SKILLS.map(s => (
              <div key={s.group} className={styles.skillGroup}>
                <p className={styles.skillGroupTitle}>{s.group}</p>
                <div className={styles.tags}>
                  {s.items.map(item => <span key={item} className={styles.tag}>{item}</span>)}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'Certifications' && (
          <div className={styles.certs}>
            {CERTIFICATIONS.map(c => (
              <div key={c.name} className={styles.certCard}>
                <div>
                  <p className={styles.certName}>{c.name}</p>
                  <p className={styles.certIssuer}>{c.issuer}</p>
                </div>
                <span className={styles.certDate}>{c.date}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'Interests' && (
          <div className={styles.interests}>
            {INTERESTS.map(g => (
              <div key={g.title} className={styles.interestGroup}>
                <p className={styles.skillGroupTitle}>{g.title}</p>
                <div className={styles.tags}>
                  {g.items.map(item => <span key={item} className={styles.tag}>{item}</span>)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
