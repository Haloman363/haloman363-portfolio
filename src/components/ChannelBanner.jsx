import { AnimatePresence, motion } from 'framer-motion'
import styles from './ChannelBanner.module.css'

export default function ChannelBanner({ channelId, onBack, onPrev, onNext, children }) {
  return (
    <AnimatePresence>
      {channelId && (
        <>
          <motion.div
            key={channelId}
            className={styles.splashScreen}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className={styles.content}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.2 }}
            >
              {children}
            </motion.div>
          </motion.div>

          <motion.div
            className={styles.splashBar}
            initial={{ bottom: '-20vh', opacity: 0 }}
            animate={{ bottom: 0, opacity: 1 }}
            exit={{ bottom: '-20vh', opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.splashButtons}>
              <button className={`${styles.btn} ${styles.navBtn}`} onClick={onPrev} aria-label="Previous channel">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none"><polyline points="15,18 9,12 15,6" stroke="#474747" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button className={styles.btn} onClick={onBack}>
                Wii Menu
              </button>
              <button className={`${styles.btn} ${styles.navBtn}`} onClick={onNext} aria-label="Next channel">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none"><polyline points="9,6 15,12 9,18" stroke="#474747" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
