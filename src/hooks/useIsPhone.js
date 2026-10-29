import { useSyncExternalStore } from 'react'

// Matches the phone breakpoint in ChannelGrid.module.css / WiiFooter.module.css.
const QUERY = '(max-width: 639px)'

const subscribe = (cb) => {
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

export default function useIsPhone() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false)
}
