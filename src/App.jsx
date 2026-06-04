import { useState, useRef } from 'react'
import WiiBackground from './components/WiiBackground'
import WiiCursor from './components/WiiCursor'
import WiiHeader from './components/WiiHeader'
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

export default function App() {
  const [activeChannel, setActiveChannel] = useState(null)
  const [activeChannelData, setActiveChannelData] = useState(null)
  // Retain last channel data through exit animation so banner doesn't blank
  const lastChannelDataRef = useRef(null)
  const audio = useWiiAudio()

  function handleSelect(id, channelData) {
    audio.playSelect()
    lastChannelDataRef.current = channelData
    setActiveChannel(id)
    setActiveChannelData(channelData)
  }

  function handleBack() {
    audio.playBack()
    setActiveChannel(null)
    setActiveChannelData(null)
  }

  function renderBannerContent(channelId, channelData) {
    if (!channelId) return null
    const data = channelData ?? lastChannelDataRef.current
    if (channelId === 'mii-channel') return <AboutBanner />
    if (channelId === 'photo-channel') return <PhotoBanner />
    if (channelId === 'wii-shop') return <ShopBanner />
    if (channelId === 'check-mii-out') return <MakerWorldBanner />
    if (channelId === 'linkedin') return <LinkedInBanner />
    if (channelId === 'venmo') return <VenmoBanner />
    if (channelId.startsWith('repo-')) return <RepoBanner channel={data} />
    return null
  }

  return (
    <div className="wii">
      <WiiBackground />
      <WiiCursor />
      <WiiHeader audioEnabled={audio.enabled} onAudioToggle={audio.toggle} />
      <ChannelGrid onSelect={handleSelect} onHover={audio.playHover} />
      <WiiFooter />
      <ChannelBanner channelId={activeChannel} onBack={handleBack}>
        {renderBannerContent(activeChannel, activeChannelData)}
      </ChannelBanner>
    </div>
  )
}
