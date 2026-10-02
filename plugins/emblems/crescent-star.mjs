// Crescent and star to the proportions of the Turkish flag law (Türk Bayrağı Tüzüğü), as map geometry.
// Page usage: emblem: { kind: crescent-star, center: [lon, lat], width_km: 320, color: "#ffffff" }
// With the flag width G: outer circle diameter G/2, inner circle diameter 2G/5 with its centre G/16 further
// east, star inside a circle of diameter G/4 whose centre is G/3 east of the inner circle's centre, one
// point towards the crescent.
export default function crescentStar({ center, width_km: G, color = '#ffffff' }, { turf }) {
  if (!Array.isArray(center) || center.length !== 2 || !(G > 0)) throw new Error('crescent-star needs center [lon, lat] and width_km');
  const [lon, lat] = center;
  const pt = (dxKm, dyKm) => [lon + dxKm / (111.32 * Math.cos(lat * Math.PI / 180)), lat + dyKm / 111.32];
  const circle = (dx, r) => turf.circle(pt(dx, 0), r, { steps: 128, units: 'kilometers' });
  const crescent = turf.difference(turf.featureCollection([circle(0, G / 4), circle(G / 16, G / 5)]));
  const R = G / 8, sx = G / 16 + G / 3, ring = [];
  for (let k = 0; k < 10; k++) { const a = Math.PI + k * Math.PI / 5, r = k % 2 ? R * 0.382 : R; ring.push(pt(sx + r * Math.cos(a), r * Math.sin(a))); }
  ring.push(ring[0]);
  return turf.featureCollection([crescent, turf.polygon([ring])].map(f => ({ ...f, properties: { color } })));
}
