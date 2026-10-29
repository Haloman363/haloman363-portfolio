// Mii Studio data for "Jaymes", rendered by ariankordi's FFL renderer.
// Exported from mii.nxw.pw (miic -> studioData). Clothes aren't part of Mii
// data, so shirt/pants colors are passed as params to match the old sprite.
const MII_DATA = '080326040b030430020a010805030102070000000004000804000a08002b7004000214021303160d05030a030608'
// yaw: degrees the whole character turns (+ = toward the viewer's right).
export const miiURL = (expression, yaw = 0) =>
  'https://mii-unsecure.ariankordi.net/miis/image.png' +
  // all_body_sugar frames the body tighter and returns a portrait image,
  // matching the old sprite's proportions (plain all_body wastes ~84% of frame).
  `?data=${MII_DATA}&type=all_body_sugar&width=500` +
  `&clothesColor=blue&pantsColor=gray&expression=${expression}` +
  (yaw ? `&characterYRotate=${yaw}` : '')

// Same Mii as a glTF head (the renderer serves no body; the expression is baked into the
// face mask texture, so each expression is its own file).
export const miiGLB = expression =>
  'https://mii-unsecure.ariankordi.net/miis/image.glb' +
  `?data=${MII_DATA}&type=all_body&expression=${expression}`
