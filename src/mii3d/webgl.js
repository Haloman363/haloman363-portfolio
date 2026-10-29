export const webgl = (() => {
  try { return !!document.createElement('canvas').getContext('webgl') } catch { return false }
})()
