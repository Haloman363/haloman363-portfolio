import styles from './PageArrows.module.css'

// Wii-menu style prev/next page buttons beside the channel grid. Each hides on the first/last page.
export default function PageArrows({ page, totalPages, onPrev, onNext, hidden }) {
  if (totalPages < 2 || hidden) return null
  return (
    <>
      {page > 0 && (
        <button className={`${styles.arrow} ${styles.left}`} onClick={onPrev} aria-label="Previous page">
          <svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="15,4 7,12 15,20" /></svg>
        </button>
      )}
      {page < totalPages - 1 && (
        <button className={`${styles.arrow} ${styles.right}`} onClick={onNext} aria-label="Next page">
          <svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="9,4 17,12 9,20" /></svg>
        </button>
      )}
    </>
  )
}
