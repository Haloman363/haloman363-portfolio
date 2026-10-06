import { useState, useRef, useCallback, useEffect } from 'react'
import WiiBackground from './components/WiiBackground'
import WiiCursor from './components/WiiCursor'
import WiiFooter from './components/WiiFooter'
import DesktopHint from './components/DesktopHint'
import ChannelGrid from './components/ChannelGrid'
import ChannelBanner from './components/ChannelBanner'
import AboutBanner from './banners/AboutBanner'
import ResumeBanner from './banners/ResumeBanner'
import PhotoBanner from './banners/PhotoBanner'
import ShopBanner from './banners/ShopBanner'
import MakerWorldBanner from './banners/MakerWorldBanner'
import GitHubBanner from './banners/GitHubBanner'
import LinkedInBanner from './banners/LinkedInBanner'
import VenmoBanner from './banners/VenmoBanner'
import CoolGamesBanner from './banners/CoolGamesBanner'
import ArtifactBanner from './banners/ArtifactBanner'
import ForecastBanner from './banners/ForecastBanner'
import NewsBanner from './banners/NewsBanner'
import { TOTAL_PAGES } from './data/channels'
import { useWiiAudio } from './hooks/useWiiAudio'
import { useGamepad } from './hooks/useGamepad'
import './App.css'

const THEME_KEY = 'wii-theme'

// Saved choice wins; otherwise follow the device's light/dark setting.
function initialDarkMode() {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved) return saved === 'dark'
  } catch { /* storage unavailable */ }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

export default function App() {
  const [activeChannel, setActiveChannel] = useState(null)
  const [page, setPage] = useState(0)
  const [darkMode, setDarkMode] = useState(initialDarkMode)
  const [openOrigin, setOpenOrigin] = useState(null)
  const allChannelsRef = useRef([])
  const audio = useWiiAudio()
  useGamepad()
  const openerRef = useRef(null)

  function handleDarkToggle() {
    audio.playClick()
    const next = !darkMode
    setDarkMode(next)
    try { localStorage.setItem(THEME_KEY, next ? 'dark' : 'light') } catch { /* ignore */ }
  }

  // The Mii Channel has its own theme music (when sound is on).
  const { setTheme } = audio
  useEffect(() => { setTheme(activeChannel === 'mii-channel' ? 'mii' : 'menu') }, [activeChannel, setTheme])

  const handleSlotsReady = useCallback((flat) => {
    allChannelsRef.current = flat
  }, [])

  const prevPage = useCallback(() => {
    if (page <= 0) return
    audio.playPageTurn(-1)
    setPage(page - 1)
  }, [audio, page])

  const nextPage = useCallback(() => {
    if (page >= TOTAL_PAGES - 1) return
    audio.playPageTurn(1)
    setPage(page + 1)
  }, [audio, page])

  const handleBack = useCallback(() => {
    audio.playClick()
    setActiveChannel(null)
    // The grid is inert while a channel is open; hand focus back to the tile that opened it.
    const opener = openerRef.current
    requestAnimationFrame(() => opener?.isConnected && opener.focus())
  }, [audio])

  // Konami code: a short rainbow shimmer over the whole menu.
  const [party, setParty] = useState(false)
  const konamiProgress = useRef(0)

  const handleChannelNav = useCallback((direction) => {
    const channels = allChannelsRef.current
    const idx = channels.findIndex(c => c.id === activeChannel)
    if (idx === -1) return
    const next = channels[(idx + direction + channels.length) % channels.length]
    if (!next) return
    audio.playClick()
    setActiveChannel(next.id)
  }, [activeChannel, audio])

  useEffect(() => {
    function onKey(e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return

      const expected = KONAMI[konamiProgress.current]
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if (key === expected) {
        konamiProgress.current += 1
        if (konamiProgress.current === KONAMI.length) {
          konamiProgress.current = 0
          audio.playSelect()
          setParty(true)
          setTimeout(() => setParty(false), 5000)
        }
      } else {
        konamiProgress.current = key === KONAMI[0] ? 1 : 0
      }

      if (e.key === 'Escape' && activeChannel) {
        handleBack()
        return
      }
      if (activeChannel) {
        if (e.key === 'ArrowLeft') handleChannelNav(-1)
        if (e.key === 'ArrowRight') handleChannelNav(1)
      } else if (!e.defaultPrevented) {
        // (the grid already handled it if focus moved between tiles)
        if (e.key === 'ArrowLeft') prevPage()
        if (e.key === 'ArrowRight') nextPage()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prevPage, nextPage, activeChannel, handleChannelNav, handleBack, audio])

  function handleSelect(id, channelData, origin) {
    audio.playClick()
    openerRef.current = document.activeElement
    setOpenOrigin(origin ?? null)
    setActiveChannel(id)
  }

  function renderBannerContent(channelId) {
    if (!channelId) return null
    if (channelId === 'mii-channel') return <AboutBanner sfx={audio} />
    if (channelId === 'resume') return <ResumeBanner />
    if (channelId === 'photo-channel') return <PhotoBanner sfx={audio} />
    if (channelId === 'wii-shop') return <ShopBanner />
    if (channelId === 'check-mii-out') return <MakerWorldBanner />
    if (channelId === 'github') return <GitHubBanner />
    if (channelId === 'linkedin') return <LinkedInBanner sfx={audio} />
    if (channelId === 'venmo') return <VenmoBanner sfx={audio} />
    if (channelId === 'cool-jaymes-games') return <CoolGamesBanner sfx={audio} />
    if (channelId === 'news') return <NewsBanner sfx={audio} />
    if (channelId === 'forecast') return <ForecastBanner sfx={audio} />
    if (channelId === 'dog-vision') return (
      <ArtifactBanner
        title="Dog Vision"
        sub="See the world the way a dog does, through your camera or a photo"
        href="https://haloman363.github.io/artifacts/dog-vision"
        bg="#0c4a6e"
        accent="#7dd3fc"
      />
    )
    if (channelId === 'dolos21') return (
      <ArtifactBanner
        title="DOLOS://21"
        sub="Pixel-art IT-horror card game against a corrupted daemon dealer"
        href="https://haloman363.github.io/artifacts/dolos21"
        bg="#022c22"
        accent="#34d399"
        titleFont="'Courier New', monospace"
      />
    )
    return null
  }

  return (
    <main className={`wii${darkMode ? ' dark' : ''}${party ? ' party' : ''}`}>
      <WiiBackground darkMode={darkMode} />
      <WiiCursor />
      <DesktopHint />
      <ChannelGrid
        onSelect={handleSelect}
        onHover={audio.playHover}
        page={page}
        onSlotsReady={handleSlotsReady}
        inert={!!activeChannel}
      />
      <WiiFooter
        page={page}
        onPrev={prevPage}
        onNext={nextPage}
        totalPages={TOTAL_PAGES}
        audioEnabled={audio.enabled}
        onAudioToggle={audio.toggle}
        darkMode={darkMode}
        onDarkToggle={handleDarkToggle}
        channelOpen={!!activeChannel}
      />
      <ChannelBanner
        channelId={activeChannel}
        origin={openOrigin}
        onBack={handleBack}
        onPrev={() => handleChannelNav(-1)}
        onNext={() => handleChannelNav(1)}
      >
        {renderBannerContent(activeChannel)}
      </ChannelBanner>
    </main>
  )
}
