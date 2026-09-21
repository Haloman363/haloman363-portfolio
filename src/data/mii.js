// Mii Studio data for "Jaymes", rendered by ariankordi's FFL renderer.
// Exported from mii.nxw.pw (miic -> studioData). Clothes aren't part of Mii
// data, so shirt/pants colors are passed as params to match the old sprite.
const MII_DATA = '080326040b030430020a010805030102070000000004000804000a08002b7004000214021303160d05030a030608'
export const miiURL = expression =>
  'https://mii-unsecure.ariankordi.net/miis/image.png' +
  // all_body_sugar frames the body tighter and returns a portrait image,
  // matching the old sprite's proportions (plain all_body wastes ~84% of frame).
  `?data=${MII_DATA}&type=all_body_sugar&width=500` +
  `&clothesColor=blue&pantsColor=gray&expression=${expression}`
