import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import styles from './ChannelBanner.module.css'

export default function ChannelBanner({ channelId, onBack, children }) {
  return (
    <AnimatePresence>
      {channelId && (
        <>
          <motion.div
            key={channelId}
            className={styles.splashScreen}
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.3 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className={styles.content}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.2 }}
            >
              {children}
            </motion.div>
          </motion.div>

          <motion.div
            className={styles.splashBar}
            initial={{ bottom: '-20vh', opacity: 0 }}
            animate={{ bottom: 0, opacity: 1 }}
            exit={{ bottom: '-20vh', opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.splashButtons}>
              <button className={styles.btn} onClick={onBack}>
                Wii Menu
              </button>
            </div>
          </motion.div>

          <div className={`${styles.border} ${styles.borderTopleft}`} />
          <div className={`${styles.border} ${styles.borderTopright}`} />
          <div className={`${styles.border} ${styles.borderBottomleft}`} />
          <div className={`${styles.border} ${styles.borderBottomright}`} />
        </>
      )}
    </AnimatePresence>
  )
}
