// Photos for the Photos channel. Drop images into src/photos/ (see the README
// there); the channel only shows up on the home screen when at least one exists.
import captions from '../photos/captions.json'

const urls = import.meta.glob('../photos/*.{jpg,jpeg,png,webp,avif,gif}', {
  eager: true,
  query: '?url',
  import: 'default',
})

// "03-my_first-print.jpg" -> "My first print"
function prettify(file) {
  const name = file.replace(/\.[^.]+$/, '').replace(/^\d+[-_.\s]*/, '').replace(/[-_]+/g, ' ').trim()
  return name ? name.charAt(0).toUpperCase() + name.slice(1) : 'Photo'
}

export const PHOTOS = Object.entries(urls)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([path, src]) => {
    const file = path.split('/').pop()
    const meta = captions[file] ?? {}
    return { src, file, caption: meta.caption ?? '', alt: meta.alt ?? meta.caption ?? prettify(file) }
  })
