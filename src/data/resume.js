// Single source of truth for the Resume channel and the downloadable PDF.
// After editing, regenerate the PDF with `npm run resume:pdf` and commit both.
// Certifications: mirror https://www.linkedin.com/in/jaymes-bunce/details/certifications/
// (newest first). `url` is the credential verification link, when there is one.

export const PROFILE = {
  name: 'Jaymes Bunce',
  location: 'Logan, UT (Ready to Relocate)',
  site: 'https://www.jaymesbunce.com',
  summary:
    'System Administrator with 6+ years of IT experience in Windows, Mac, and Linux administration, ' +
    'networking, cloud services (Google Workspace, O365), and automation (Ansible, Docker, PowerShell). ' +
    'Skilled at deploying secure infrastructure, managing enterprise systems, and streamlining IT ' +
    'operations. Actively seeking to contribute technical expertise to a growing IT team.',
}

export const EDUCATION = [
  { school: 'Brigham Young University - Idaho', degree: 'B.S. in Computer Information Technology', date: 'Graduated 2021' },
]

export const EXPERIENCE = [
  {
    company: 'Conservice', location: 'Logan, Utah', role: 'System Administrator II',
    dates: 'June 2022 - Present',
    bullets: [
      'Deploying and administering firewalls, strengthening network security, and reducing unauthorized access.',
      'Handle all aspects of OpenVPN servers for over 1,800 remote staff members across 4 regions.',
      'Manage Google Workspace for 3,000+ users, troubleshooting and configuring various Workspace services and features.',
      'Works with departments to analyze, document, and solve email routing for 5+ departments to improve email productivity with clients.',
      'Identify a manual process for managing SSL management system, resulting in automation creating real-time certificates for 50+ servers.',
      'Automated IT processes with Ansible and PowerShell, reducing manual workload and reducing audits from 3 days down to 1 day.',
      'Implemented 3 monitoring solutions (Zabbix, Uptime Kuma, PagerDuty) to cut incident response times.',
      'Maintain Linux servers and Docker environments, improving the reliability and security patches for over 26 services.',
      'Deployed and administers WebTitan filtering to 2,800+ devices to remove the risk of malicious and unsafe sites.',
      'Administers ProofPoint email protection services to reduce attack vectors for over 4 million monthly incoming emails.',
      'Implements Google Workspace Single Sign-On for 20+ services for easier integration and account management.',
      'Monitor and maintain 30+ Ubiquiti access points across 4 buildings.',
    ],
  },
  {
    company: 'Conservice', location: 'Logan, Utah', role: 'IT - Help Desk',
    dates: 'January 2022 - June 2022',
    bullets: [
      'Provided Tier 1-2 support for 3,000+ local and remote employees, resolving hardware and software issues within a 1-hour time frame.',
      'Assisted with administering Google Workspace, Microsoft 365, and custom PowerShell scripting, contributing to efficient ticket resolution.',
      'Reduced computer formatting for 30+ items by creating custom scripting in KACE for the formatting process. Reducing the average formatting time by 1 hour.',
      'Installed and administered a Wikijs server for IT troubleshooting procedures and documentation for the team. Reducing training time for new employees.',
      'Created a custom PowerShell Toolkit of various scripts and repetitive actions for the team to resolve tickets rapidly.',
    ],
  },
  {
    company: 'Conservice', location: 'Logan, Utah', role: 'Electronic Data Exchange Setup Specialist',
    dates: 'January 2020 - January 2022',
    bullets: [
      'Coordinated with ~170 clients to configure and troubleshoot electronic data exchange systems.',
      'Set up an average of 150-200 properties per month into the internal system to process utility charges.',
      'Managed portfolio of large firms/properties, keeping track of timelines and following up with internal teams to ensure setups were completed by the contracted agreement dates.',
      'Assisted other team members with their firms and properties when they would fall behind or need coverage during time off.',
      'Trained a new employee to provide the same diligence and care for my portfolio as I moved to new career steps.',
    ],
  },
]

export const SKILLS = [
  { group: 'AI', items: ['Claude', 'Gemini', 'Cowork', 'Claude Code', 'MCP'] },
  { group: 'Systems', items: ['Linux Administration', 'Windows Server', 'Proxmox', 'Docker', 'KACE', 'pfSense', 'VMware vSphere', 'Ubuntu', 'LXC', 'Unifi Network Manager', 'OPNsense'] },
  { group: 'Networking', items: ['Firewall Administration', 'OpenVPN', 'DNS', 'DHCP', 'SSL', 'Netbird', 'VPN', 'Ubiquiti', 'VNC'] },
  { group: 'Cloud / Email', items: ['Google Workspace', 'Office 365', 'Mailgun', 'Proofpoint', 'GAM', 'Email Routing/Management'] },
  { group: 'Automation', items: ['Ansible', 'PowerShell', 'AWX', 'Bash', 'Rsync', 'Cron jobs'] },
  { group: 'Monitoring', items: ['Zabbix', 'Uptime Kuma', 'PagerDuty', 'Prometheus', 'Grafana'] },
]

export const CERTIFICATIONS = [
  { name: 'AI for App Deployment', issuer: 'Google', date: 'Oct 2026' },
  { name: 'AI for Content Creation', issuer: 'Google', date: 'Oct 2026' },
  { name: 'AI for Writing and Communicating', issuer: 'Google', date: 'Oct 2026' },
  { name: 'AI for Research and Insights', issuer: 'Google', date: 'Oct 2026' },
  { name: 'AI for Brainstorming and Planning', issuer: 'Google', date: 'Oct 2026' },
  { name: 'AI Fundamentals', issuer: 'Google', date: 'Oct 2026' },
  { name: 'AI for App Building', issuer: 'Google', date: 'Oct 2026' },
  { name: 'Claude Platform 101', issuer: 'Anthropic', date: 'Sep 2026', url: 'https://verify.skilljar.com/c/qiqc89rgfg8x' },
  { name: 'Introduction to Model Context Protocol', issuer: 'Anthropic', date: 'Sep 2026', url: 'https://verify.skilljar.com/c/7xtej59i384j' },
  { name: 'Claude Code 101', issuer: 'Anthropic', date: 'Sep 2026', url: 'https://verify.skilljar.com/c/do4dkpwjbmpd' },
  { name: 'Introduction to Subagents', issuer: 'Anthropic', date: 'Mar 2026', url: 'https://verify.skilljar.com/c/aayzh4z7xu6n' },
  { name: 'AI Fluency Framework & Foundations', issuer: 'Anthropic', date: 'Mar 2026', url: 'https://verify.skilljar.com/c/xaxixvbnqhhx' },
  { name: 'Claude 101', issuer: 'Anthropic', date: 'Mar 2026', url: 'https://verify.skilljar.com/c/pdnukygkecin' },
  { name: 'Introduction to Claude Cowork', issuer: 'Anthropic', date: 'Mar 2026', url: 'https://verify.skilljar.com/c/eyag8zq6gquv' },
  { name: 'Introduction to Agent Skills', issuer: 'Anthropic', date: 'Mar 2026', url: 'https://verify.skilljar.com/c/toq3p9dkgmso' },
  { name: 'Claude Code in Action', issuer: 'Anthropic', date: 'Feb 2026', url: 'https://verify.skilljar.com/c/5sbap7ksu58n' },
  { name: 'TestOut Network Pro', issuer: 'TestOut Corporation', date: 'Apr 2020' },
  { name: 'TestOut Client Pro', issuer: 'TestOut Corporation', date: 'Jul 2019' },
]

export const INTERESTS = [
  { title: 'Homelab / Self-Hosting', items: ['Proxmox', 'pfSense', 'TrueNAS', 'Plex', 'Nextcloud', 'VPN', 'Ansible', 'LXC', 'Ubiquiti', 'TP-Link Omada', 'OPNsense'] },
  { title: 'Gaming', items: ['LAN Parties', 'PC Building', 'Game Server Hosting', 'VR', 'Streaming', 'Local Tournaments'] },
  { title: 'Maker Hobbies', items: ['3D Printing', 'Soldering', 'Home Projects', '3D Modeling', 'Cosplay', 'Programming', 'Custom Keyboards'] },
]
