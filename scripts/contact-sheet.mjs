// Draws every image a story shows as a thumbnail in page order, labelled with its page id, so two images that look
// alike on nearby pages stand out. Reads each page's text, marker and battle card images. Run from the repo root:
//   node scripts/contact-sheet.mjs <story id>      writes .cache/<story id>-images-<n>.png, 40 thumbnails a sheet
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
const tiles = [];
const walk = dir => { for (const d of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) if (d.isDirectory()) {
  const full = path.join(dir, d.name), pageFile = path.join(full, 'page.yaml');
  if (!fs.existsSync(pageFile)) { walk(full); continue; }
  const page = load(pageFile) ?? {}, ids = [...read(path.join(full, 'text/en.md')).matchAll(/^@image\s+(\S+)/gm)].map(m => m[1]);
  for (const m of Object.values(load(path.join(full, 'markers.yaml')) ?? {})) if (m?.image) ids.push(m.image);
  const battle = typeof page.battle === 'string' && battleDir(page.battle);
  if (battle) ids.push(...(load(path.join(battle, 'battle.yaml'))?.images ?? []));
  for (const id of new Set(ids)) tiles.push({ page: d.name.replace(/^\d+-/, ''), id });
} };
walk(path.join(story, 'pages'));

const W = 180, H = 150, LABEL = 20, COLS = 8, PER = 40;
const label = text => Buffer.from(`<svg width="${W}" height="${LABEL}"><text x="4" y="14" font-family="sans-serif" font-size="12" fill="#222">${text}</text></svg>`);
fs.mkdirSync('.cache', { recursive: true });
for (let s = 0; s * PER < tiles.length; s++) {
  const sheet = tiles.slice(s * PER, (s + 1) * PER), rows = Math.ceil(sheet.length / COLS), layers = [];
  for (const [i, t] of sheet.entries()) {
    const left = (i % COLS) * W, top = Math.floor(i / COLS) * (H + LABEL);
    const thumb = files[t.id] ? await sharp(files[t.id]).resize(W - 8, H - 8, { fit: 'inside' }).png().toBuffer() : null;
    if (thumb) layers.push({ input: thumb, left: left + 4, top: top + 4 });
    layers.push({ input: label(thumb ? t.page : `${t.page}: no file for ${t.id}`), left, top: top + H });
  }
  const out = `.cache/${storyId}-images-${s + 1}.png`;
  await sharp({ create: { width: COLS * W, height: rows * (H + LABEL), channels: 3, background: '#f4f2ec' } }).composite(layers).png().toFile(out);
  console.log(`${out}: ${sheet.length} images, ${sheet[0].page} to ${sheet.at(-1).page}`);
}
