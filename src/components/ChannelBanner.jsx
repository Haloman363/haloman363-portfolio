import { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import styles from './ChannelBanner.module.css'
import ScrollRail from './ScrollRail'

const slideVariants = {
  enter: (dir) => ({ x: dir >= 0 ? '100%' : '-100%' }),
  center: { x: 0 },
  exit: (dir) => ({ x: dir >= 0 ? '-100%' : '100%' }),
}

// Wii-style "start" transition: the viewport scales from the clicked tile's
// screen rect up to fullscreen (and reverses on close), paired with a brief
// radial flash. Falls back to a plain fade if no tile origin is known.
function zoomVariants(origin) {
  if (!origin) {
    return {
      enter: { opacity: 0 },
      center: { opacity: 1 },
      exit: { opacity: 0 },
    }
  }
  const vw = window.innerWidth
  const vh = window.innerHeight * (vw < 640 ? 0.75 : 0.8) // matches .viewport's height (75vh phone / 80vh else)
  const scaleX = origin.width / vw
  const scaleY = origin.height / vh
  const originX = (origin.x / vw) * 100
  const originY = (origin.y / vh) * 100
  return {
    enter: { scale: scaleX, scaleY, opacity: 0.4, transformOrigin: `${originX}% ${originY}%` },
    center: { scale: 1, scaleY: 1, opacity: 1, transformOrigin: `${originX}% ${originY}%` },
    exit: { scale: scaleX, scaleY, opacity: 0, transformOrigin: `${originX}% ${originY}%` },
  }
}

export default function ChannelBanner({ channelId, origin, onBack, onPrev, onNext, children }) {
  const [direction, setDirection] = useState(0)
  const isOpen = !!channelId
  const isChannelSwitch = direction !== 0

  // Freeze the origin used for the zoom-from-tile effect for the lifetime of
  // this open/close cycle, so a stale origin from a previous session doesn't leak in.
  // (Adjusted during render: while closed the last origin is kept for the exit animation.)
  const [frozenOrigin, setFrozenOrigin] = useState(origin)
  if (isOpen && frozenOrigin !== origin) setFrozenOrigin(origin)

  // Swipe left/right to move between channels on touch screens.
  const touchStart = useRef(null)

  function handleTouchStart(e) {
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
  }

  function handleTouchEnd(e) {
    const start = touchStart.current
    touchStart.current = null
    if (!start) return
    const t = e.changedTouches[0]
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return
    if (dx < 0) handleNext()
    else handlePrev()
  }

  function handlePrev() {
    setDirection(-1)
    onPrev()
  }

  function handleNext() {
    setDirection(1)
    onNext()
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="channel-bar"
            className={styles.splashBar}
            initial={{ bottom: '-20vh', opacity: 0 }}
            animate={{ bottom: 0, opacity: 1 }}
            exit={{ bottom: '-20vh', opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.splashButtons}>
              <button className={styles.btn} onClick={onBack}>Jaymes Menu</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && [styles.borderTopleft, styles.borderTopright, styles.borderBottomleft, styles.borderBottomright].map(cls => (
          <motion.div
            key={cls}
            className={`${styles.border} ${cls}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </AnimatePresence>

      {/* Radial "start" flash — bursts from the clicked tile on open/close */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="channel-flash"
            className={styles.flash}
            style={
              frozenOrigin
                ? { left: frozenOrigin.x, top: frozenOrigin.y }
                : undefined
            }
            initial={{ opacity: 0.9, scale: 0 }}
            animate={{ opacity: 0, scale: 1 }}
            exit={{ opacity: 0.9, scale: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
      </AnimatePresence>

      {/* Viewport zooms from the clicked tile on true open/close;
          the inner panel slides on prev/next channel switches. */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="viewport"
            className={styles.viewport}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            variants={zoomVariants(frozenOrigin)}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <AnimatePresence mode="sync" custom={direction}>
              <motion.div
                key={channelId}
                className={styles.splashScreen}
                custom={direction}
                variants={slideVariants}
                initial={isChannelSwitch ? 'enter' : false}
                animate="center"
                exit={isChannelSwitch ? 'exit' : undefined}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <PanelBody>{children}</PanelBody>
              </motion.div>
            </AnimatePresence>

            <button className={`${styles.sideArrow} ${styles.sideArrowLeft}`} onClick={handlePrev} aria-label="Previous channel">
              <svg viewBox="0 0 40 80" width="40" height="80" fill="none">
                <polyline points="32,8 8,40 32,72" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className={`${styles.sideArrow} ${styles.sideArrowRight}`} onClick={handleNext} aria-label="Next channel">
              <svg viewBox="0 0 40 80" width="40" height="80" fill="none">
                <polyline points="8,8 32,40 8,72" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// A channel's content plus its scroll rail. Split out so each panel owns its own ref
// (the exiting and entering panels both exist during a channel switch).
function PanelBody({ children }) {
  const contentRef = useRef(null)
  return (
    <>
      <div className={styles.content} ref={contentRef}>
        {children}
      </div>
      <ScrollRail rootRef={contentRef} />
    </>
  )
}
