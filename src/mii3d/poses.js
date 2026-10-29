// Procedural poses, played additively on top of Nintendo's idle clip. Each pose is a
// function of seconds since it started and returns the offsets it wants:
//   aL aR  arms, lL lR  thighs, chest  upper-body lean   -> { x, y, z } radians
//   rootY  hop height (rig units, ~6px each)   rootRot  sway   headX headY headZ  extra head turn
//   spin   absolute turn of the whole body, applied without smoothing (a full turn lands on 0)
// Raised arms past ~2.3 rad vanish behind the big head, so keep them around 2.
// Axes are the parent's: arm/leg z lifts a limb outward (left limbs positive, right negative),
// arm x raises it forward when negative, chest x leans forward when positive.
// Left/right here are the Mii's own, so "left" is on the viewer's right.
const S = Math.sin
const ease = k => (k < 0.5 ? 2 * k * k : 1 - 2 * (1 - k) ** 2)

export const POSES = {
  wave: t => ({ aR: { z: -1.75 + S(t * 11) * 0.35 }, headZ: 0.12 }),
  cheer: t => ({
    aL: { z: 2.25 + S(t * 9) * 0.2 }, aR: { z: -2.25 - S(t * 9) * 0.2 },
    rootY: Math.abs(S(t * 8)) * 2.2, headX: -0.15,
  }),
  dance: t => ({
    aL: { z: 1.3 + S(t * 6) * 1.1, x: S(t * 3) * 0.3 }, aR: { z: -1.3 + S(t * 6 + Math.PI) * 1.1 },
    lL: { x: Math.max(0, S(t * 6)) * 0.55 }, lR: { x: Math.max(0, -S(t * 6)) * 0.55 },
    rootY: Math.abs(S(t * 6)) * 0.8, rootRot: S(t * 3) * 0.5, headZ: S(t * 6) * 0.2,
  }),
  clap: t => ({
    aL: { x: -1.3, z: -0.5 + S(t * 14) * 0.12 }, aR: { x: -1.3, z: 0.5 - S(t * 14) * 0.12 },
    rootY: Math.abs(S(t * 7)) * 0.3, headX: 0.1,
  }),
  shrug: () => ({ aL: { z: 0.7 }, aR: { z: -0.7 }, headZ: 0.25, rootY: -0.2 }),
  stretch: () => ({ aL: { z: 2.35 }, aR: { z: -2.35 }, headX: -0.35, chest: { x: -0.15 } }),
  bow: () => ({ chest: { x: 0.65 }, headX: 0.1 }),
  jack: t => {
    const o = (S(t * 9) + 1) / 2
    return { aL: { z: 0.2 + o * 2.0 }, aR: { z: -0.2 - o * 2.0 }, lL: { z: o * 0.45 }, lR: { z: -o * 0.45 }, rootY: o * 1.6 }
  },
  spin: t => {
    const k = Math.min(t / 0.9, 1)
    return { spin: ease(k) * Math.PI * 2, rootY: S(k * Math.PI) * 1.8, aL: { z: 0.9 }, aR: { z: -0.9 } }
  },
  lookAround: t => ({ headY: S(t * 2.2) * 0.9, headX: -0.05 }),
  // Dangling from the cursor while being carried.
  held: t => ({
    aL: { z: 2.0 + S(t * 14) * 0.4 }, aR: { z: -2.0 - S(t * 14 + 1) * 0.4 },
    lL: { x: S(t * 12) * 0.5 }, lR: { x: -S(t * 12) * 0.5 }, headX: -0.2,
  }),
}

// What each pose does to the face and how long React lets it run (0 = until cleared).
export const ACTS = {
  wave: { mood: 'smile_open_mouth', ms: 2000 },
  cheer: { mood: 'smile_open_mouth', ms: 1800 },
  dance: { mood: 'smile_open_mouth', ms: 4000 },
  clap: { mood: 'smile', ms: 2200 },
  shrug: { mood: 'normal', ms: 1500 },
  stretch: { mood: 'blink', ms: 2400 },
  bow: { mood: 'smile', ms: 1400 },
  jack: { mood: 'smile_open_mouth', ms: 2200 },
  spin: { mood: 'surprise', ms: 1000 },
  lookAround: { mood: null, ms: 2800 },
  held: { mood: 'surprise', ms: 0 },
}
