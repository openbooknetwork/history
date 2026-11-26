// Draws every image a story shows as a thumbnail in page order, labelled with its page id, so two images that look
// alike on nearby pages stand out. Reads each page's text, marker and battle card images. A marker is the page's own,
// in its markers.yaml, or a shared one the page switches on by id. Run from the repo root:
//   node scripts/contact-sheet.mjs <story id>      writes .cache/<story id>-images-<n>.png, 40 thumbnails a sheet
// Try: node scripts/contact-sheet.mjs alexander-the-great
// Then prints each image the story shows in more than one place, a place being a page or a battle's card.
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';
import sharp from 'sharp';
import { storyDir } from './story-dir.mjs';

const storyId = process.argv[2], story = storyId && storyDir(storyId);
if (!story) { console.error('usage: node scripts/contact-sheet.mjs <story id>, from the repo root'); process.exit(2); }

// image folder id -> its original, in the story's shared/images and in content/shared/images, group folders too
const files = {};
const collect = dir => { if (fs.existsSync(dir)) for (const d of fs.readdirSync(dir, { withFileTypes: true })) if (d.isDirectory()) {
  const full = path.join(dir, d.name), meta = path.join(full, 'image.yaml');
  if (fs.existsSync(meta)) files[d.name] = path.join(full, yaml.load(fs.readFileSync(meta, 'utf8')).file); else collect(full);
} };
collect(path.join(story, 'shared/images'));
collect('content/shared/images');

const battleDir = id => [path.join(story, 'shared/battles', id), path.join('content/shared/battles', id)].find(d => fs.existsSync(path.join(d, 'battle.yaml')));
const read = f => fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
const load = f => { const t = read(f); return t.trim() ? yaml.load(t) : null; };
const sharedMarkers = { ...load('content/shared/markers.yaml'), ...load(path.join(story, 'shared/markers.yaml')) };
const tiles = [], places = {};
const walk = dir => { for (const d of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) if (d.isDirectory()) {
  const full = path.join(dir, d.name), pageFile = path.join(full, 'page.yaml');
  if (!fs.existsSync(pageFile)) { walk(full); continue; }
  const page = load(pageFile) ?? {}, pageId = d.name.replace(/^\d+-/, ''), ids = [];
  const show = (id, place) => { ids.push(id); (places[id] ??= new Set()).add(place); };
  for (const m of read(path.join(full, 'text/en.md')).matchAll(/^@image\s+(\S+)/gm)) show(m[1], `page ${pageId}`);
  const markers = [...Object.values(load(path.join(full, 'markers.yaml')) ?? {}), ...(page.markers ?? []).map(id => sharedMarkers[id])];
  for (const m of markers) if (m?.image) show(m.image, `page ${pageId}`);
  const battle = typeof page.battle === 'string' && battleDir(page.battle);
  if (battle) for (const id of load(path.join(battle, 'battle.yaml'))?.images ?? []) show(id, `card of ${page.battle}`);
  for (const id of new Set(ids)) tiles.push({ page: pageId, id });
} };
walk(path.join(story, 'pages'));

const W = 180, H = 150, LABEL = 20, COLS = 8, PER = 40;
const label = text => Buffer.from(`<svg width="${W}" height="${LABEL}"><text x="4" y="14" font-family="sans-serif" font-size="12" fill="#222">${text}</text></svg>`);
fs.mkdirSync('.cache', { recursive: true });
const missing = new Set();
for (let s = 0; s * PER < tiles.length; s++) {
  const sheet = tiles.slice(s * PER, (s + 1) * PER), rows = Math.ceil(sheet.length / COLS), layers = [];
  for (const [i, t] of sheet.entries()) {
    const left = (i % COLS) * W, top = Math.floor(i / COLS) * (H + LABEL);
    // an image's original is in the asset store and not in git, so a machine may hold its image.yaml alone. A
    // placeholder has no folder at all. Either way the tile is a label, and the list below is still printed
    const have = files[t.id] && fs.existsSync(files[t.id]);
    let thumb = null;
    if (have) try { thumb = await sharp(files[t.id]).resize(W - 8, H - 8, { fit: 'inside' }).png().toBuffer(); } catch { /* a file sharp cannot read */ }
    if (thumb) layers.push({ input: thumb, left: left + 4, top: top + 4 });
    else missing.add(t.id);
    layers.push({ input: label(thumb ? t.page : `${t.page}: ${files[t.id] ? 'no original here' : 'placeholder'}`), left, top: top + H });
  }
  const out = `.cache/${storyId}-images-${s + 1}.png`;
  await sharp({ create: { width: COLS * W, height: rows * (H + LABEL), channels: 3, background: '#f4f2ec' } }).composite(layers).png().toFile(out);
  console.log(`${out}: ${sheet.length} images, ${sheet[0].page} to ${sheet.at(-1).page}`);
}
if (missing.size) console.log(`${missing.size} images have no picture on this machine, an original that is in the store alone or a placeholder: their tiles are labels.`);
for (const [id, at] of Object.entries(places)) if (at.size > 1) console.log(`${id} shows ${at.size} times: ${[...at].join(', ')}`);
