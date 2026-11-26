// What a reader sees of a page as it opens, for every script that has to know: scripts/rules-lint.mjs,
// scripts/plan-check.mjs, scripts/plan-zones.mjs and scripts/zone-gaps.mjs. A page has a bbox, and a screen is not
// shaped like it, so the map shows more than the bbox along one axis. How much more depends on the screen. So a
// page has not one frame and a list of them, one a screen, and the rule every script shares is:
//
//   a page shows a piece of land where any of its frames holds it.
//
// SCREENS gives the map's pane on each screen and the room kept free beside the bbox, as measured in a browser on
// 25 Nov 2026 with scripts/screenshot.mjs and SHOT_EVAL. A laptop is the window a capture opens, 1400 by 900. A
// phone held upright keeps a band above and below the bbox for the markers' names, which is its tall padding.
// A battle card docks at the end edge of a laptop's and a desktop's map (28.5rem and a margin, 467 pixels) and
// stands in the text on a phone.
export const SCREENS = [
  { name: 'laptop', pane: [792, 818], pad: [40, 40] },
  { name: 'desktop', pane: [1116, 987], pad: [40, 40] },
  { name: 'phone', pane: [356, 571], pad: [40, 156] },
];
// the screen of a capture, which the checks of what stands on what are made for
export const MAP = SCREENS[0].pane, PAD = SCREENS[0].pad[0], DOCK = 467;
// how wide a marker draws: its icon, or the thumbnail of its image
export const ICON = 20, THUMB = 40;
// web mercator, the world one unit wide
export const merc = ([lng, lat]) => [lng / 360, -Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)) / (2 * Math.PI)];
// pixels to a mercator unit at a page's opening view
export function scale([w, s, e, n], dock = DOCK) {
  const [x0, y0] = merc([w, n]), [x1, y1] = merc([e, s]);
  return Math.min((MAP[0] - (dock || 2 * PAD)) / (x1 - x0), (MAP[1] - 2 * PAD) / (y1 - y0));
}
const lat = y => (2 * Math.atan(Math.exp(-y * 2 * Math.PI)) - Math.PI / 2) * 180 / Math.PI;
// what one screen shows of a page with no docked card: its bbox grown to the pane's shape, as [west, south, east, north]
export function frameOn(screen, [w, s, e, n]) {
  const [x0, y0] = merc([w, n]), [x1, y1] = merc([e, s]);
  const k = Math.min((screen.pane[0] - 2 * screen.pad[0]) / (x1 - x0), (screen.pane[1] - 2 * screen.pad[1]) / (y1 - y0));
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, hx = screen.pane[0] / k / 2, hy = screen.pane[1] / k / 2;
  return [(cx - hx) * 360, lat(cy + hy), (cx + hx) * 360, lat(cy - hy)];
}
// a page's frames, one a screen: [{ name, box }]
export const frames = bbox => SCREENS.map(screen => ({ name: screen.name, box: frameOn(screen, bbox) }));
// the frame of a capture
export const frame = bbox => frameOn(SCREENS[0], bbox);
// the box that holds every frame of a page: what any screen can show of it
export function reach(bbox) {
  const all = frames(bbox).map(f => f.box);
  return [Math.min(...all.map(b => b[0])), Math.min(...all.map(b => b[1])), Math.max(...all.map(b => b[2])), Math.max(...all.map(b => b[3]))];
}
// each pair of places that stand on each other at the opening view: [id, id, pixels apart, pixels they need].
// places are [id, lnglat, has an image]
export function crowded(bbox, places, card = false) {
  const k = scale(bbox, card ? DOCK : 0), at = places.map(([id, lnglat, image]) => [id, merc(lnglat), image ? THUMB : ICON]), out = [];
  for (let i = 0; i < at.length; i++) for (let j = i + 1; j < at.length; j++) {
    const px = Math.hypot(at[i][1][0] - at[j][1][0], at[i][1][1] - at[j][1][1]) * k, room = (at[i][2] + at[j][2]) / 2;
    if (px < room) out.push([at[i][0], at[j][0], Math.round(px), room]);
  }
  return out;
}
