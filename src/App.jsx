import { useState, useRef, useCallback, useEffect } from 'react'
import WiiBackground from './components/WiiBackground'
import WiiCursor from './components/WiiCursor'
import WiiFooter from './components/WiiFooter'
import ChannelGrid from './components/ChannelGrid'
import ChannelBanner from './components/ChannelBanner'
import AboutBanner from './banners/AboutBanner'
import PhotoBanner from './banners/PhotoBanner'
import RepoBanner from './banners/RepoBanner'
import ShopBanner from './banners/ShopBanner'
import MakerWorldBanner from './banners/MakerWorldBanner'
import LinkedInBanner from './banners/LinkedInBanner'
import VenmoBanner from './banners/VenmoBanner'
import { useWiiAudio } from './hooks/useWiiAudio'
import './App.css'

const TOTAL_PAGES = 2

export default function App() {
  const [activeChannel, setActiveChannel] = useState(null)
  const [activeChannelData, setActiveChannelData] = useState(null)
  const [page, setPage] = useState(0)
  const [darkMode, setDarkMode] = useState(false)
  const lastChannelDataRef = useRef(null)
  const allChannelsRef = useRef([])
  const audio = useWiiAudio()

  const handleSlotsReady = useCallback((flat) => {
    allChannelsRef.current = flat
  }, [])

  const prevPage = useCallback(() => {
    audio.playHover()
    setPage(p => Math.max(0, p - 1))
  }, [audio])

  const nextPage = useCallback(() => {
    audio.playHover()
    setPage(p => Math.min(TOTAL_PAGES - 1, p + 1))
  }, [audio])

  useEffect(() => {
    function onKey(e) {
      if (activeChannel) {
        if (e.key === 'ArrowLeft') handleChannelNav(-1)
        if (e.key === 'ArrowRight') handleChannelNav(1)
      } else {
        if (e.key === 'ArrowLeft') prevPage()
        if (e.key === 'ArrowRight') nextPage()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prevPage, nextPage, activeChannel])

  function handleSelect(id, channelData) {
    audio.playClick()
    audio.playSelect()
    lastChannelDataRef.current = channelData
    setActiveChannel(id)
    setActiveChannelData(channelData)
  }

  function handleBack() {
    audio.playClick()
    audio.playBack()
    setActiveChannel(null)
    setActiveChannelData(null)
  }

  function handleChannelNav(direction) {
    const channels = allChannelsRef.current
    const idx = channels.findIndex(c => c.id === activeChannel)
    if (idx === -1) return
    const next = channels[(idx + direction + channels.length) % channels.length]
    if (!next) return
    audio.playClick()
    audio.playHover()
    lastChannelDataRef.current = next
    setActiveChannel(next.id)
    setActiveChannelData(next)
  }

  function renderBannerContent(channelId, channelData) {
    if (!channelId) return null
    if (channelId === 'mii-channel') return <AboutBanner />
    if (channelId === 'photo-channel') return <PhotoBanner />
    if (channelId === 'wii-shop') return <ShopBanner />
    if (channelId === 'check-mii-out') return <MakerWorldBanner />
    if (channelId === 'linkedin') return <LinkedInBanner />
    if (channelId === 'venmo') return <VenmoBanner />
    if (channelId.startsWith('repo-')) {
      return <RepoBanner channel={channelData ?? lastChannelDataRef.current} />
    }
    return null
  }

  return (
    <div className={`wii${darkMode ? ' dark' : ''}`}>
      <WiiBackground darkMode={darkMode} />
      <WiiCursor />
      <ChannelGrid
        onSelect={handleSelect}
        onHover={audio.playHover}
        page={page}
        onPrev={prevPage}
        onNext={nextPage}
        onSlotsReady={handleSlotsReady}
      />
      <WiiFooter
        page={page}
        onPrev={prevPage}
        onNext={nextPage}
        totalPages={TOTAL_PAGES}
        audioEnabled={audio.enabled}
        onAudioToggle={audio.toggle}
        darkMode={darkMode}
        onDarkToggle={() => { audio.playClick(); setDarkMode(d => !d) }}
        channelOpen={!!activeChannel}
      />
      <ChannelBanner
        channelId={activeChannel}
        onBack={handleBack}
        onPrev={() => handleChannelNav(-1)}
        onNext={() => handleChannelNav(1)}
      >
        {renderBannerContent(activeChannel, activeChannelData)}
      </ChannelBanner>
    </div>
  )
}
