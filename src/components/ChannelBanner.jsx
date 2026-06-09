import { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import styles from './ChannelBanner.module.css'

export default function ChannelBanner({ channelId, onBack, onPrev, onNext, children }) {
  const [direction, setDirection] = useState(0)
  const isOpen = !!channelId

  function handlePrev() {
    setDirection(-1)
    onPrev()
  }

  function handleNext() {
    setDirection(1)
    onNext()
  }

  const slideVariants = {
    enter: (dir) => ({ x: dir >= 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir >= 0 ? '-100%' : '100%', opacity: 0 }),
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Viewport clip layer — covers the 80vh content area */}
          <div className={styles.viewport}>
            <AnimatePresence mode="sync" custom={direction}>
              <motion.div
                key={channelId}
                className={styles.splashScreen}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div
                  className={styles.content}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.2 }}
                >
                  {children}
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Side nav arrows */}
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
          </div>

          <motion.div
            className={styles.splashBar}
            initial={{ bottom: '-20vh', opacity: 0 }}
            animate={{ bottom: 0, opacity: 1 }}
            exit={{ bottom: '-20vh', opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.splashButtons}>
              <button className={styles.btn} onClick={onBack}>
                Wii Menu
              </button>
            </div>
          </motion.div>

          {[styles.borderTopleft, styles.borderTopright, styles.borderBottomleft, styles.borderBottomright].map(cls => (
            <motion.div
              key={cls}
              className={`${styles.border} ${cls}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            />
          ))}
        </>
      )}
    </AnimatePresence>
  )
}
