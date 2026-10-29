// How far the Mii has knocked each certification badge, shared by the Certifications tab
// (renders it) and MenuMii (decides what to knock). Deterministic per card, so it is the
// same every run.
export const MAX_CHAOS = 3
const rand = (i, salt) => ((i * 9301 + salt * 49297) % 233280) / 233280
const SHARE = [0, 0.35, 0.65, 1] // fraction of cards disturbed at each chaos level
const TILT = [0, 10, 24, 40]     // max rotation, degrees
const DROP = [0, 6, 28, 60]      // downward shove, px
const SPREAD = [0, 8, 20, 40]    // sideways shove, px
export const messOf = (i, chaos) => {
  if (rand(i, 1) >= SHARE[chaos]) return undefined
  return {
    x: (rand(i, 2) - 0.5) * SPREAD[chaos],
    y: DROP[chaos] * (0.5 + rand(i, 3)),
    rotate: (rand(i, 4) - 0.5) * TILT[chaos],
  }
}
