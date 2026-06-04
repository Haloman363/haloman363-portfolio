import { useState } from 'react'
import WiiBackground from './components/WiiBackground'
import WiiCursor from './components/WiiCursor'
import WiiHeader from './components/WiiHeader'
import WiiFooter from './components/WiiFooter'
import { useWiiAudio } from './hooks/useWiiAudio'
import './App.css'

export default function App() {
  const [activeChannel, setActiveChannel] = useState(null)
  const audio = useWiiAudio()

  return (
    <div className="wii">
      <WiiBackground />
      <WiiCursor />
      <WiiHeader audioEnabled={audio.enabled} onAudioToggle={audio.toggle} />
      <main style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#fff' }}>Channel grid goes here</p>
      </main>
      <WiiFooter />
    </div>
  )
}
