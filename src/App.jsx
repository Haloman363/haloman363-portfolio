import { useState } from 'react'
import WiiBackground from './components/WiiBackground'
import WiiCursor from './components/WiiCursor'
import WiiHeader from './components/WiiHeader'
import WiiFooter from './components/WiiFooter'
import ChannelGrid from './components/ChannelGrid'
import { useWiiAudio } from './hooks/useWiiAudio'
import './App.css'

export default function App() {
  const [activeChannel, setActiveChannel] = useState(null)
  const audio = useWiiAudio()

  function handleSelect(id, channelData) {
    audio.playSelect()
    setActiveChannel(id)
  }

  return (
    <div className="wii">
      <WiiBackground />
      <WiiCursor />
      <WiiHeader audioEnabled={audio.enabled} onAudioToggle={audio.toggle} />
      <ChannelGrid onSelect={handleSelect} onHover={audio.playHover} />
      <WiiFooter />
    </div>
  )
}
