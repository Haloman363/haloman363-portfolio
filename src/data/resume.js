// Single source of truth for the Resume channel and the downloadable PDF.
// After editing, regenerate the PDF with `npm run resume:pdf` and commit both.
// Certifications: mirror https://www.linkedin.com/in/jaymes-bunce/details/certifications/
// (newest first). `url` is the credential verification link, when there is one.

export const PROFILE = {
  name: 'Jaymes Bunce',
  headline: 'System Administrator | Linux, Google Workspace, Networking, Automation',
  location: 'Logan, UT (Ready to Relocate)',
  linkedin: 'https://www.linkedin.com/in/jaymes-bunce',
  site: 'https://www.jaymesbunce.com',
  summary:
    'System Administrator with 6+ years at Conservice supporting 3,000+ users across Linux, Windows and Mac, ' +
    'networking, Google Workspace and Microsoft 365, and automation (Ansible, PowerShell, Docker). Google Workspace ' +
    'Administrator certified. Replaces manual work with automation: SSL issuance for 50+ servers, audits cut from ' +
    '3 days to 1. Looking to bring that to a growing IT team.',
}

export const EDUCATION = [
  { school: 'Brigham Young University - Idaho', degree: 'B.S. in Computer Information Technology', date: 'Graduated 2021' },
]

export const EXPERIENCE = [
  {
    company: 'Conservice', location: 'Logan, Utah', role: 'System Administrator II',
    dates: 'June 2022 - Present',
    bullets: [
      'Administer Google Workspace for 3,000+ users: Single Sign-On for 20+ services, email routing for 5+ departments, and Proofpoint filtering of 4 million+ monthly emails.',
      'Run OpenVPN for 1,800+ remote staff across 4 regions and deploy firewalls that cut unauthorized access.',
      'Automate IT processes with Ansible and PowerShell, cutting audits from 3 days to 1.',
      'Replaced a manual SSL process with automation that issues real-time certificates for 50+ servers.',
      'Implemented Zabbix, Uptime Kuma and PagerDuty monitoring to cut incident response times.',
      'Maintain Linux servers and Docker environments (26+ services), keeping them reliable and patched.',
      'Administer WebTitan filtering on 2,800+ devices to block malicious and unsafe sites.',
      'Manage 30+ Ubiquiti access points across 4 buildings.',
    ],
  },
  {
    company: 'Conservice', location: 'Logan, Utah', role: 'IT Help Desk',
    dates: 'January 2022 - June 2022',
    bullets: [
      'Provided Tier 1-2 support for 3,000+ local and remote employees, resolving hardware and software issues within 1 hour, and assisted with Google Workspace and Microsoft 365 administration.',
      'Scripted computer formatting in KACE, cutting the average format time by 1 hour.',
      'Built a Wiki.js knowledge base for troubleshooting procedures, reducing training time for new hires.',
      'Created a PowerShell toolkit of repetitive fixes that let the team resolve tickets faster.',
    ],
  },
  {
    company: 'Conservice', location: 'Logan, Utah', role: 'Electronic Data Exchange: Processor, Manager, Setup Specialist',
    dates: 'January 2020 - January 2022',
    bullets: [
      'Coordinated with ~170 clients to configure and troubleshoot electronic data exchange systems.',
      'Set up 150-200 properties per month in the internal system to process utility charges, meeting contracted deadlines.',
      'Covered other team members\' portfolios during time off and trained a new employee to take over mine.',
    ],
  },
]

export const SKILLS = [
  { group: 'Systems', items: ['Linux Administration', 'Windows Server', 'Active Directory', 'Proxmox', 'VMware vSphere', 'Docker', 'LXC', 'Ubuntu', 'KACE', 'PDQ Deploy', 'pfSense', 'OPNsense', 'Unifi Network Manager'] },
  { group: 'Networking', items: ['Firewall Administration', 'OpenVPN', 'DNS', 'DHCP', 'SSL', 'Netbird', 'VPN', 'Ubiquiti', 'VNC'] },
  { group: 'Cloud / Email', items: ['Google Workspace', 'Office 365', 'Mailgun', 'Proofpoint', 'GAM', 'Email Routing/Management'] },
  { group: 'Automation', items: ['Ansible', 'PowerShell', 'AWX', 'Bash', 'Python', 'Rsync', 'Cron jobs'] },
  { group: 'Monitoring', items: ['Zabbix', 'Uptime Kuma', 'PagerDuty', 'Prometheus', 'Grafana'] },
  { group: 'AI Tooling', items: ['Claude', 'Claude Code', 'MCP', 'Cowork', 'Gemini'] },
]

export const CERTIFICATIONS = [
  { name: 'Google Workspace Administrator Professional Certificate', issuer: 'Google', date: 'Oct 2026' },
  { name: 'Google Workspace Core Services', issuer: 'Google', date: 'Oct 2026' },
  { name: 'Google Workspace User and Resource Management', issuer: 'Google', date: 'Oct 2026' },
  { name: 'Google Workspace Data Governance', issuer: 'Google', date: 'Oct 2026' },
  { name: 'Google Workspace Security', issuer: 'Google', date: 'Oct 2026' },
  { name: 'Google Workspace Troubleshooting', issuer: 'Google', date: 'Oct 2026' },
  { name: 'Google AI Professional Certificate', issuer: 'Google', date: 'Oct 2026' },
  { name: 'AI Fundamentals', issuer: 'Google', date: 'Oct 2026' },
  { name: 'AI for App Building', issuer: 'Google', date: 'Oct 2026' },
  { name: 'AI for App Deployment', issuer: 'Google', date: 'Oct 2026' },
  { name: 'AI for Brainstorming and Planning', issuer: 'Google', date: 'Oct 2026' },
  { name: 'AI for Content Creation', issuer: 'Google', date: 'Oct 2026' },
  { name: 'AI for Data Analysis', issuer: 'Google', date: 'Oct 2026' },
  { name: 'AI for Research and Insights', issuer: 'Google', date: 'Oct 2026' },
  { name: 'AI for Writing and Communicating', issuer: 'Google', date: 'Oct 2026' },
  { name: 'Claude Academy: Model Context Protocol: Advanced topics', issuer: 'Anthropic', date: 'Oct 2026' },
  { name: 'Claude Code 101', issuer: 'Anthropic', date: 'Oct 2026', url: 'https://verify.skilljar.com/c/do4dkpwjbmpd' },
  { name: 'Claude Code in Action', issuer: 'Anthropic', date: 'Oct 2026', url: 'https://verify.skilljar.com/c/5sbap7ksu58n' },
  { name: 'Introduction to Model Context Protocol', issuer: 'Anthropic', date: 'Oct 2026', url: 'https://verify.skilljar.com/c/7xtej59i384j' },
  { name: 'Introduction to Claude Cowork', issuer: 'Anthropic', date: 'Oct 2026', url: 'https://verify.skilljar.com/c/eyag8zq6gquv' },
  { name: 'Claude 101', issuer: 'Anthropic', date: 'Oct 2026', url: 'https://verify.skilljar.com/c/pdnukygkecin' },
  { name: 'Claude Platform 101', issuer: 'Anthropic', date: 'Sep 2026', url: 'https://verify.skilljar.com/c/qiqc89rgfg8x' },
  { name: 'Introduction to Subagents', issuer: 'Anthropic', date: 'Mar 2026', url: 'https://verify.skilljar.com/c/aayzh4z7xu6n' },
  { name: 'AI Fluency Framework & Foundations', issuer: 'Anthropic', date: 'Mar 2026', url: 'https://verify.skilljar.com/c/xaxixvbnqhhx' },
  { name: 'Introduction to Agent Skills', issuer: 'Anthropic', date: 'Mar 2026', url: 'https://verify.skilljar.com/c/toq3p9dkgmso' },
  { name: 'TestOut Network Pro', issuer: 'TestOut Corporation', date: 'Apr 2020' },
  { name: 'TestOut Client Pro', issuer: 'TestOut Corporation', date: 'Jul 2019' },
]

export const INTERESTS = [
  { title: 'Homelab / Self-Hosting', items: ['Proxmox', 'pfSense', 'TrueNAS', 'Plex', 'Nextcloud', 'VPN', 'Ansible', 'LXC', 'Ubiquiti', 'TP-Link Omada', 'OPNsense'] },
  { title: 'Gaming', items: ['LAN Parties', 'PC Building', 'Game Server Hosting', 'VR', 'Streaming', 'Local Tournaments'] },
  { title: 'Maker Hobbies', items: ['3D Printing', 'Soldering', 'Home Projects', '3D Modeling', 'Cosplay', 'Programming', 'Custom Keyboards'] },
]
