// Search Wikimedia Commons for each page's queries and download candidate photos for review.
//   node scripts/fetch-candidates.mjs [story] [--limit 6] [--pages a,b]   (--pages refetches those pages)
// Reads scripts/image-queries.yaml, writes content/<story>/.candidates/<page>/ and .candidates/index.yaml.
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';

const story = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'ataturk-turkish-republic';
const limit = Number(process.argv[process.argv.indexOf('--limit') + 1]) || 6;
const only = process.argv.includes('--pages') ? process.argv[process.argv.indexOf('--pages') + 1].split(',') : null;
const queries = yaml.load(fs.readFileSync('scripts/image-queries.yaml', 'utf8'))[story];
if (!queries) { console.error(`no queries for story "${story}" in scripts/image-queries.yaml`); process.exit(2); }
const outDir = path.join('content', story, '.candidates');
fs.mkdirSync(outDir, { recursive: true });

const API = 'https://commons.wikimedia.org/w/api.php';
const headers = { 'User-Agent': 'harita-image-fetch/0.1 (history map build; contact via repo)' };
const sleep = ms => new Promise(r => setTimeout(r, ms));
// Commons answers 429 when asked too fast: wait as told, or doubling from two seconds, up to six tries
async function get(url) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers });
    if (res.ok) return res;
    if ((res.status === 429 || res.status >= 500) && attempt < 6) {
      const wait = Number(res.headers.get('retry-after')) * 1000 || 2000 * 2 ** attempt;
      console.log(`  ${res.status}, waiting ${wait / 1000}s`); await sleep(wait); continue;
    }
    throw new Error(`${res.status} for ${url}`);
  }
}
const api = async params => (await get(API + '?' + new URLSearchParams({ format: 'json', ...params }))).json();
const strip = s => String(s ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

// resume: pages already in index.yaml are kept and skipped
const indexFile = path.join(outDir, 'index.yaml');
const index = fs.existsSync(indexFile) ? yaml.load(fs.readFileSync(indexFile, 'utf8')) ?? {} : {};
const save = () => fs.writeFileSync(indexFile, yaml.dump(index, { lineWidth: 120 }));
let seen = new Set(Object.values(index).flat().map(c => 'File:' + c.title));
for (const [page, spec] of Object.entries(queries)) {
  if (only && !only.includes(page)) continue;
  if (only && index[page]) { for (const c of index[page]) seen.delete('File:' + c.title); delete index[page]; fs.rmSync(path.join(outDir, page), { recursive: true, force: true }); }
  if (index[page]) { console.log(`${page}: done earlier, skipping`); continue; }
  const terms = Array.isArray(spec) ? spec : spec.queries ?? [];
  const files = Array.isArray(spec) ? [] : spec.files ?? [];
  const titles = [...files.map(f => f.startsWith('File:') ? f : 'File:' + f)];
  for (const q of terms) {
    const r = await api({ action: 'query', list: 'search', srsearch: `${q} filetype:bitmap`, srnamespace: 6, srlimit: limit * 2 });
    for (const hit of r.query?.search ?? []) if (/\.(jpe?g|png|tiff?)$/i.test(hit.title)) titles.push(hit.title);
    await sleep(1000);
  }
  const picked = [...new Set(titles)].filter(t => !seen.has(t)).slice(0, limit * Math.max(1, terms.length));
  if (!picked.length) { console.log(`${page}: nothing found`); continue; }
  const info = await api({ action: 'query', prop: 'imageinfo', titles: picked.join('|'), iiprop: 'url|extmetadata|size', iiurlwidth: 1200 });
  const dir = path.join(outDir, page);
  fs.mkdirSync(dir, { recursive: true });
  index[page] = [];
  let n = 0;
  for (const p of Object.values(info.query?.pages ?? {})) {
    const ii = p.imageinfo?.[0]; if (!ii) continue;
    const meta = ii.extmetadata ?? {};
    const license = strip(meta.LicenseShortName?.value);
    const file = `${String(++n).padStart(2, '0')}-${p.title.replace(/^File:/, '').replace(/[^\w.-]+/g, '_').slice(0, 80)}`;
    const name = file.replace(/\.(tiff?|png)$/i, '.jpg');
    try {
      const img = await get(ii.thumburl ?? ii.url);
      fs.writeFileSync(path.join(dir, name), Buffer.from(await img.arrayBuffer()));
    } catch (e) { console.log(`  skip ${p.title}: ${e.message}`); continue; }
    seen.add(p.title);
    index[page].push({ file: name, title: p.title.replace(/^File:/, ''), page: `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`,
      author: strip(meta.Artist?.value), license, date: strip(meta.DateTimeOriginal?.value), description: strip(meta.ImageDescription?.value).slice(0, 300), width: ii.width, height: ii.height });
    await sleep(800);
  }
  console.log(`${page}: ${index[page].length} candidates`);
  save();
}
console.log(`wrote ${indexFile}`);
