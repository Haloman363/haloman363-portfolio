import { useState } from 'react'
import './App.css'

export default function App() {
  const [activeChannel, setActiveChannel] = useState(null)

  return (
    <div className="wii">
      <p style={{ color: '#fff', padding: '2rem' }}>
        Wii shell — activeChannel: {activeChannel ?? 'none'}
      </p>
    </div>
  )
}
