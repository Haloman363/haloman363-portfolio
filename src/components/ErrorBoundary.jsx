import { Component } from 'react'
import styles from './ErrorBoundary.module.css'

// Keeps one broken channel from blanking the whole site. Wrap a channel's content (or the
// whole app, with `scope="app"`); on a render error it shows a friendly message and a retry.
export default class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error, info) {
    console.error('[portfolio] a section failed to render:', error, info?.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children
    const isApp = this.props.scope === 'app'
    return (
      <div className={`${styles.box} ${isApp ? styles.app : ''}`} role="alert">
        <p className={styles.emoji} aria-hidden="true">(っ◔◡◔)っ</p>
        <h2 className={styles.title}>{isApp ? 'The menu hit a snag' : 'This channel hit a snag'}</h2>
        <p className={styles.text}>
          {isApp
            ? 'Something went wrong loading the page. Reloading usually fixes it.'
            : 'Something went wrong loading it. You can try again, or head back to the menu and open another channel.'}
        </p>
        <button
          className={styles.btn}
          onClick={isApp ? () => window.location.reload() : () => this.setState({ failed: false })}
        >
          {isApp ? 'Reload' : 'Try again'}
        </button>
      </div>
    )
  }
}
