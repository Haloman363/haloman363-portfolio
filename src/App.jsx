import { useState } from 'react'
import WiiBackground from './components/WiiBackground'
import WiiCursor from './components/WiiCursor'
import './App.css'

export default function App() {
  const [activeChannel, setActiveChannel] = useState(null)

  return (
    <div className="wii">
      <WiiBackground />
      <WiiCursor />
      <p style={{ color: '#fff', padding: '2rem', position: 'relative', zIndex: 1 }}>
        Wii shell — activeChannel: {activeChannel ?? 'none'}
      </p>
    </div>
  )
}
