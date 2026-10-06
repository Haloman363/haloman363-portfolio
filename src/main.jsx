import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
// Nunito, self-hosted (Latin subset): no third-party font request, no flash from a late stylesheet
import '@fontsource/nunito/latin-400.css'
import '@fontsource/nunito/latin-600.css'
import '@fontsource/nunito/latin-700.css'
import '@fontsource/nunito/latin-800.css'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// Fetch the heavier weights now (they're otherwise loaded the first time a channel uses them,
// which shows up as a brief font swap when you open one).
if (document.fonts?.load) {
  for (const w of [600, 700, 800]) document.fonts.load(`${w} 1em Nunito`).catch(() => {})
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <ErrorBoundary scope="app">
        <App />
      </ErrorBoundary>
    </MotionConfig>
  </StrictMode>,
)
