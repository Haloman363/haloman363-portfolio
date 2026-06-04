import { AnimatePresence, motion } from 'framer-motion'
import styles from './ChannelBanner.module.css'

export default function ChannelBanner({ channelId, onBack, children }) {
  return (
    <AnimatePresence>
      {channelId && (
        <motion.div
          key={channelId}
          className={styles.overlay}
          initial={{ scale: 0.08, borderRadius: '12px', opacity: 0.6 }}
          animate={{ scale: 1, borderRadius: '0px', opacity: 1 }}
          exit={{ scale: 0.08, borderRadius: '12px', opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <button className={styles.backBtn} onClick={onBack} aria-label="Back to menu">
            ← Back
          </button>
          <motion.div
            className={styles.content}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.25 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
