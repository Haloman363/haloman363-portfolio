import { MiiBubble } from '../components/BannerParts'
import parts from '../components/BannerParts.module.css'
import styles from './CoolGamesBanner.module.css'

const SITE = 'https://jaymes.nofundsit.net'

// Picked from the site's data/games.js manifest.
const FEATURED = [
  { title: 'Robby Fart Simulator', slug: 'robby-fart-simulator', thumb: 'png' },
  { title: 'Ticket Snake',         slug: 'ticket-snake',         thumb: 'svg' },
  { title: 'Browser Strike',       slug: 'browser-strike',       thumb: 'svg' },
  { title: 'Macrodata Refinement', slug: 'macrodata-refinement', thumb: 'png' },
  { title: 'Ruby Doob',            slug: 'ruby-doob',            thumb: 'png' },
  { title: 'Egg Game',             slug: 'egg-game',             thumb: 'png' },
]

const MARQUEE = 'WELCOME TO MY DUMB WEBSITE *** FREE ONLINE GAMES AND PROJECTS *** CLICK A GAME TO PLAY *** '

export default function CoolGamesBanner({ sfx }) {
  const hover = sfx?.playHover
  const click = sfx?.playClick

  return (
    <div className={styles.games}>
      <div className={styles.marquee} aria-hidden="true">
        <span className={styles.marqueeText}>{MARQUEE.repeat(4)}</span>
      </div>

      <div className={styles.inner}>
        <h1 className={`${styles.title} ${parts.rise}`}>
          Cool <span className={styles.jaymes}>Jaymes</span> Games
        </h1>
        <p className={`${styles.sub} ${parts.rise}`} style={{ '--i': 1 }}>
          Free online games and projects <span className={styles.blink}>FREE!</span>
        </p>

        <div className={styles.grid}>
          {FEATURED.map((g, i) => (
            <a
              key={g.slug}
              className={`${styles.card} ${parts.rise}`}
              style={{ '--i': i + 2 }}
              href={`${SITE}/games/${g.slug}/`}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={hover}
              onClick={click}
            >
              <img className={styles.thumb} src={`${SITE}/assets/thumbs/${g.slug}.${g.thumb}`} alt="" loading="lazy" />
              <span className={styles.cardTitle}>{g.title}</span>
            </a>
          ))}
        </div>

        <a
          className={`${styles.cta} ${parts.rise}`}
          style={{ '--i': 8 }}
          href={SITE}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={hover}
          onClick={click}
        >
          See all games ↗
        </a>
      </div>

      <MiiBubble text="Play something!" />
    </div>
  )
}
