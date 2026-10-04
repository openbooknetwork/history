// A battle at one moment, as map geometry: unit blocks, movement arrows, rivers, walls and points of contact,
// each filled in its side's colour. Sizes are in metres, positions are [lon, lat].
//
// emblem:
//   kind: battle-plan
//   water:  [{ path: [[lon, lat], ...], width: 80 }, { area: [[lon, lat], ...] }]     rivers, lakes, coast
//   works:  [{ side: rome, path: [[lon, lat], ...], width: 40 }]                       walls, ramparts, siege lines
//   units:  [{ side: carthage, type: infantry, at: [lon, lat], width: 1800, depth: 400, facing: 315, bow: 300 }]
//   arrows: [{ side: rome, path: [[lon, lat], ...], width: 160, style: dashed }]
//   clashes: [[lon, lat], ...]           or [{ at: [lon, lat], size: 250 }]
//
// Unit types: infantry (block with an X), cavalry (block with one diagonal), light (a loose row of squares),
// elephants (a row of discs), ships (a line of hulls, `count`, `rows`), camp (a square ring).
// `facing` is the compass bearing the unit faces. `width` runs along its front, `depth` front to back.
// `bow` bends the front: positive pushes the centre towards the enemy, negative draws it back.
// `side` is a family of the story, one of the colours below, or a hex colour. Arrows curve through their points;
// dashed is a retreat. Any unit, arrow, work or water can carry a `name`, shown when the reader points at it; pieces
// with the same name highlight together. `id` sets the catalogue key, else it comes from the English name.

const SIDES = {
  rome: '#d04a3a', carthage: '#8a5cc9', syracuse: '#3a8fd0', numidia: '#d9a21b', macedon: '#3aa66a',
  gauls: '#9a7a50', iberians: '#c27a3a', rebels: '#9a7a50', neutral: '#8c8c8c',
};
const WATER = '#5b9bd5', CLASH = '#f4c542';

export default function battlePlan(spec, { families = {} } = {}) {
  const { water = [], works = [], units = [], arrows = [], clashes = [] } = spec;
  const all = [...water.flatMap(w => w.path ?? w.area ?? []), ...works.flatMap(w => w.path ?? []), ...units.map(u => u.at ?? u.path?.[0]).filter(Boolean),
    ...arrows.flatMap(a => a.path ?? []), ...clashes.map(clashAt)];
  if (!all.length) throw new Error('battle-plan needs at least one of water, works, units, arrows or clashes');
  for (const p of all) if (!Array.isArray(p) || p.length !== 2 || !p.every(Number.isFinite)) throw new Error(`battle-plan: ${JSON.stringify(p)} is not [lon, lat]`);
  // one flat projection around the middle of the plan: metres east and north
  const lon0 = all.reduce((s, p) => s + p[0], 0) / all.length, lat0 = all.reduce((s, p) => s + p[1], 0) / all.length;
  const kx = 111320 * Math.cos(lat0 * Math.PI / 180), ky = 110540;
  const toM = ([lon, lat]) => [(lon - lon0) * kx, (lat - lat0) * ky];
  const toLL = ([x, y]) => [+(lon0 + x / kx).toFixed(5), +(lat0 + y / ky).toFixed(5)];
  // a side that is a family of the story takes the family's colours, light or dark with the theme
  const look = s => families[s] ? { family: s, color: families[s].color } : { color: SIDES[s] ?? (/^#[0-9a-f]{6}$/i.test(s ?? '') ? s : fail(`unknown side "${s}", use a family, ${Object.keys(SIDES).join(', ')} or a hex colour`)) };
  const label = item => item.name == null ? {} : { id: item.id ?? slug(typeof item.name === 'string' ? item.name : item.name.en), name: item.name };
  const feats = [];
  const add = (rings, props) => { const closed = rings.filter(r => r.length >= 3).map(r => { const ll = r.map(toLL); ll.push(ll[0]); return ll; }); if (closed.length) feats.push({ type: 'Feature', properties: props, geometry: { type: 'Polygon', coordinates: closed } }); };

  for (const w of water) {
    if (w.area) add([w.area.map(toM)], { color: WATER, ...label(w) });
    else if (w.path) add([ribbon(smooth(w.path.map(toM)), w.width ?? 80, w.width ?? 80)], { color: WATER, ...label(w) });
    else fail('a water entry needs path or area');
  }
  for (const w of works) add([ribbon(w.path.map(toM), w.width ?? 40, w.width ?? 40)], { ...look(w.side ?? 'neutral'), ...label(w) });
  // a named row of pieces gets an undrawn footprint, so the reader can point at the gaps as well as the pieces
  const gappy = new Set(['light', 'elephants', 'ships']);
  for (const u of units) {
    if (u.name != null && gappy.has(u.type)) add([footprint(u, toM)], { ...look(u.side), ...label(u), hit: true });
    for (const rings of unitShapes(u, toM)) add(rings, { ...look(u.side), ...label(u) });
  }
  for (const a of arrows) {
    if (a.name != null && a.style === 'dashed') add([ribbon(smooth(a.path.map(toM)), a.width ?? 100, a.width ?? 100)], { ...look(a.side), ...label(a), hit: true });
    for (const ring of arrowShapes(a, toM)) add([ring], { ...look(a.side), ...label(a) });
  }
  for (const c of clashes) add([star(toM(clashAt(c)), c.size ?? 150)], { color: CLASH });
  return { type: 'FeatureCollection', features: feats };
}

const clashAt = c => Array.isArray(c) ? c : c.at;
const slug = s => s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const fail = msg => { throw new Error(`battle-plan: ${msg}`); };

// --- units: drawn in local coordinates (u along the front to the right, v towards the enemy), then bent and placed ---
function unitShapes(u, toM) {
  const type = u.type ?? 'infantry', W = u.width ?? fail(`unit ${type} needs width`), D = u.depth ?? Math.max(60, W / 5);
  if (!u.at) fail(`unit ${type} needs at`);
  const [cx, cy] = toM(u.at), th = (u.facing ?? 0) * Math.PI / 180, bow = u.bow ?? 0;
  const fx = Math.sin(th), fy = Math.cos(th), rx = Math.cos(th), ry = -Math.sin(th);
  // only a bent front needs extra points along its edges
  const place = ring => (bow ? densify(ring, Math.max(W, D) / 40) : ring).map(([a, b]) => { const v = b + bow * (1 - (2 * a / W) ** 2); return [cx + a * rx + v * fx, cy + a * ry + v * fy]; });
  const w = W / 2, d = D / 2, gap = Math.min(W, D) * 0.07;
  const A = [-w, -d], B = [w, -d], C = [w, d], E = [-w, d], O = [0, 0];
  if (type === 'infantry') // four triangles split by an X
    return [[A, B, O], [B, C, O], [C, E, O], [E, A, O]].map(t => [place(inset(t, [0, gap, gap]))]);
  if (type === 'cavalry') // two triangles split by one diagonal
    return [[[A, B, C], [0, 0, gap]], [[A, C, E], [gap, 0, 0]]].map(([t, o]) => [place(inset(t, o))]);
  if (type === 'camp') { const t = Math.min(W, D) * 0.14; return [[place([A, B, C, E]), place([[-w + t, -d + t], [-w + t, d - t], [w - t, d - t], [w - t, -d + t]])]]; }
  if (type === 'light') {
    const s = D * 0.45, n = u.count ?? Math.max(3, Math.round(W / (s * 2.2)));
    return [...Array(n)].map((_, i) => { const x = -w + s / 2 + i * (W - s) / Math.max(1, n - 1), y = (i % 2 ? -1 : 1) * D * 0.18; return [place([[x - s / 2, y - s / 2], [x + s / 2, y - s / 2], [x + s / 2, y + s / 2], [x - s / 2, y + s / 2]])]; });
  }
  if (type === 'elephants') {
    const r = D * 0.42, n = u.count ?? Math.max(3, Math.round(W / (r * 3)));
    return [...Array(n)].map((_, i) => { const x = -w + r + i * (W - 2 * r) / Math.max(1, n - 1); return [place([...Array(16)].map((_, k) => [x + r * Math.cos(k * Math.PI / 8), r * Math.sin(k * Math.PI / 8)]))]; });
  }
  if (type === 'ships') {
    const n = u.count ?? 6, rows = u.rows ?? 1, cols = Math.ceil(n / rows), L = Math.min(D / rows * 0.85, W / cols * 1.6), beam = L * 0.3;
    const out = [];
    for (let i = 0; i < n; i++) {
      const col = i % cols, row = Math.floor(i / cols), x = cols === 1 ? 0 : -w + beam + col * (W - 2 * beam) / (cols - 1), y = rows === 1 ? 0 : d - L / 2 - row * (D - L) / (rows - 1);
      const hull = [...Array(12)].map((_, k) => { const t = Math.PI * k / 11; return [x + beam / 2 * Math.sin(t), y - L / 2 + L * (1 - Math.cos(t)) / 2]; });
      out.push([place([...hull, ...hull.slice(1, -1).reverse().map(([a, b]) => [2 * x - a, b])])]);
    }
    return out;
  }
  fail(`unknown unit type "${type}", use infantry, cavalry, light, elephants, ships or camp`);
}

// the rectangle a unit stands in, placed and bent like the unit
function footprint(u, toM) {
  const W = u.width, D = u.depth ?? Math.max(60, W / 5), [cx, cy] = toM(u.at), th = (u.facing ?? 0) * Math.PI / 180, bow = u.bow ?? 0;
  const fx = Math.sin(th), fy = Math.cos(th), rx = Math.cos(th), ry = -Math.sin(th), w = W / 2, d = D / 2;
  return densify([[-w, -d], [w, -d], [w, d], [-w, d]], Math.max(W, D) / 40).map(([a, b]) => { const v = b + bow * (1 - (2 * a / W) ** 2); return [cx + a * rx + v * fx, cy + a * ry + v * fy]; });
}

// move the edges of a convex polygon inwards, edge i (from vertex i to i+1) by offsets[i]
function inset(poly, offsets) {
  const n = poly.length, lines = poly.map((p, i) => {
    const q = poly[(i + 1) % n], dx = q[0] - p[0], dy = q[1] - p[1], len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
    const sign = area(poly) > 0 ? 1 : -1, o = offsets[i] * sign; return [[p[0] + nx * o, p[1] + ny * o], [q[0] + nx * o, q[1] + ny * o]];
  });
  return lines.map((l, i) => cross(lines[(i + n - 1) % n], l));
}
const area = p => p.reduce((s, a, i) => { const b = p[(i + 1) % p.length]; return s + a[0] * b[1] - b[0] * a[1]; }, 0) / 2;
function cross([[x1, y1], [x2, y2]], [[x3, y3], [x4, y4]]) {
  const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4); if (Math.abs(den) < 1e-9) return [x2, y2];
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den; return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
}
function densify(ring, step) {
  const out = [];
  ring.forEach((p, i) => { const q = ring[(i + 1) % ring.length], n = Math.max(1, Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / step)); for (let k = 0; k < n; k++) out.push([p[0] + (q[0] - p[0]) * k / n, p[1] + (q[1] - p[1]) * k / n]); });
  return out;
}

// --- lines: Catmull-Rom through the given points, then a band of the given width ---
function smooth(pts) {
  if (pts.length < 3) return pts;
  const out = [], P = [pts[0], ...pts, pts.at(-1)];
  for (let i = 1; i < P.length - 2; i++) for (let k = 0; k < 12; k++) {
    const t = k / 12, [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    out.push([0, 1].map(j => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t * t + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t ** 3)));
  }
  out.push(pts.at(-1));
  return out;
}
const normals = pts => pts.map((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; });
function ribbon(pts, w0, w1) {
  const nm = normals(pts), n = pts.length, half = i => (w0 + (w1 - w0) * i / Math.max(1, n - 1)) / 2;
  return [...pts.map((p, i) => [p[0] + nm[i][0] * half(i), p[1] + nm[i][1] * half(i)]), ...pts.map((p, i) => [p[0] - nm[i][0] * half(i), p[1] - nm[i][1] * half(i)]).reverse()];
}
// cut a line at length s from its start
function cutAt(pts, s) {
  let acc = 0;
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (acc + l >= s) { const t = (s - acc) / l; return [...pts.slice(0, i), [pts[i - 1][0] + t * (pts[i][0] - pts[i - 1][0]), pts[i - 1][1] + t * (pts[i][1] - pts[i - 1][1])]]; } acc += l; }
  return pts;
}
const length = pts => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);

function arrowShapes(a, toM) {
  if (!a.path || a.path.length < 2) fail('an arrow needs a path of two or more points');
  const pts = smooth(a.path.map(toM)), L = length(pts), w = a.width ?? Math.max(40, L / 25);
  const head = Math.min(w * 2.6, L * 0.4), shaft = cutAt(pts, L - head), base = shaft.at(-1), tip = pts.at(-1);
  const [nx, ny] = normals(shaft).at(-1), hw = w * 1.25;
  const headRing = [[base[0] + nx * hw, base[1] + ny * hw], tip, [base[0] - nx * hw, base[1] - ny * hw]];
  if (a.style !== 'dashed') return [[...ribbon(shaft, w * 0.55, w).slice(0, shaft.length), ...headRing, ...ribbon(shaft, w * 0.55, w).slice(shaft.length)]];
  const out = [headRing], dash = w * 2.2, gap = w * 1.4, Ls = length(shaft);
  for (let s = 0; s < Ls - 1; s += dash + gap) { const piece = cutAt(shaft, Math.min(Ls, s + dash)), from = cutAt(piece, s); const seg = [from.at(-1), ...piece.slice(from.length - 1)]; if (seg.length >= 2) out.push(ribbon(seg, w * 0.8, w * 0.8)); }
  return out;
}

function star([x, y], r) {
  return [...Array(16)].map((_, k) => { const t = k * Math.PI / 8 + Math.PI / 16, rr = k % 2 ? r * 0.42 : r; return [x + rr * Math.cos(t), y + rr * Math.sin(t)]; });
}
