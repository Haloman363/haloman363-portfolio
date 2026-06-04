import { useState } from 'react'
import WiiBackground from './components/WiiBackground'
import WiiCursor from './components/WiiCursor'
import WiiHeader from './components/WiiHeader'
import WiiFooter from './components/WiiFooter'
import ChannelGrid from './components/ChannelGrid'
import ChannelBanner from './components/ChannelBanner'
import { useWiiAudio } from './hooks/useWiiAudio'
import './App.css'

export default function App() {
  const [activeChannel, setActiveChannel] = useState(null)
  const [activeChannelData, setActiveChannelData] = useState(null)
  const audio = useWiiAudio()

  function handleSelect(id, channelData) {
    audio.playSelect()
    setActiveChannel(id)
    setActiveChannelData(channelData)
  }

  function handleBack() {
    audio.playBack()
    setActiveChannel(null)
    setActiveChannelData(null)
  }

  return (
    <div className="wii">
      <WiiBackground />
      <WiiCursor />
      <WiiHeader audioEnabled={audio.enabled} onAudioToggle={audio.toggle} />
      <ChannelGrid onSelect={handleSelect} onHover={audio.playHover} />
      <WiiFooter />
      <ChannelBanner channelId={activeChannel} onBack={handleBack}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#1a1a2e', color: '#fff', fontSize: '2rem' }}>
          {activeChannel}
        </div>
      </ChannelBanner>
    </div>
  )
}
