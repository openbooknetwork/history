// Search Wikimedia Commons for each page's queries and download candidate photos for review.
//   node scripts/fetch-candidates.mjs [story] [--limit 6] [--pages a,b] [--queries file]   (--pages refetches those pages)
// Reads scripts/image-queries.yaml or the --queries file, writes content/<story>/.candidates/<page>/ and .candidates/index.yaml.
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';

const story = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'ataturk-turkish-republic';
const arg = name => process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : null;
const limit = Number(arg('--limit')) || 6;
const only = arg('--pages')?.split(',') ?? null;
const queriesFile = arg('--queries') ?? 'scripts/image-queries.yaml';
const queries = yaml.load(fs.readFileSync(queriesFile, 'utf8'))[story];
if (!queries) { console.error(`no queries for story "${story}" in ${queriesFile}`); process.exit(2); }
const outDir = path.join('content', story, '.candidates');
fs.mkdirSync(outDir, { recursive: true });

const API = 'https://commons.wikimedia.org/w/api.php';
const BITMAP = /\.(jpe?g|png|tiff?)$/i;
// An article is a Wikipedia URL or an English Wikipedia title
const articleApi = a => { const m = a.match(/^https?:\/\/([a-z-]+)\.wikipedia\.org\/wiki\/([^?#]+)/); return m ? [`https://${m[1]}.wikipedia.org/w/api.php`, decodeURIComponent(m[2]).replace(/_/g, ' ')] : ['https://en.wikipedia.org/w/api.php', a]; };
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
const api = async (params, base = API) => (await get(base + '?' + new URLSearchParams({ format: 'json', ...params }))).json();
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
  const articles = Array.isArray(spec) ? [] : spec.articles ?? [];
  const titles = [...files.map(f => f.startsWith('File:') ? f : 'File:' + f)];
  // Every bitmap an article uses. Files local to Wikipedia, usually non-free, have no Commons record and drop out below.
  for (const a of articles) {
    const [base, title] = articleApi(a);
    const r = await api({ action: 'query', prop: 'images', titles: title, imlimit: 'max', redirects: 1 }, base);
    const pages = Object.values(r.query?.pages ?? {});
    if (!pages.length || pages.some(p => 'missing' in p)) console.log(`  no article "${title}"`);
    for (const p of pages) for (const im of p.images ?? []) if (BITMAP.test(im.title)) titles.push(im.title);
    await sleep(1000);
  }
  for (const q of terms) {
    const r = await api({ action: 'query', list: 'search', srsearch: `${q} filetype:bitmap`, srnamespace: 6, srlimit: limit * 2 });
    const hits = (r.query?.search ?? []).map(h => h.title).filter(t => BITMAP.test(t) && !seen.has(t) && !titles.includes(t));
    titles.push(...hits.slice(0, limit));
    await sleep(1000);
  }
  const picked = [...new Set(titles)].filter(t => !seen.has(t));
  if (!picked.length) { console.log(`${page}: nothing found`); continue; }
  const infoPages = [];
  for (let i = 0; i < picked.length; i += 50) { // the API takes at most 50 titles per call
    const info = await api({ action: 'query', prop: 'imageinfo', titles: picked.slice(i, i + 50).join('|'), iiprop: 'url|extmetadata|size', iiurlwidth: 1200 });
    infoPages.push(...Object.values(info.query?.pages ?? {}));
  }
  const dir = path.join(outDir, page);
  fs.mkdirSync(dir, { recursive: true });
  index[page] = [];
  let n = 0;
  for (const p of infoPages) {
    const ii = p.imageinfo?.[0]; if (!ii) continue;
    const meta = ii.extmetadata ?? {};
    const license = strip(meta.LicenseShortName?.value);
    // The extension comes from the downloaded thumbnail, so a long title cut to 80 characters keeps one
    const url = ii.thumburl ?? ii.url, ext = path.extname(new URL(url).pathname).toLowerCase();
    const base = p.title.replace(/^File:/, '').replace(/\.\w+$/, '').replace(/[^\w.-]+/g, '_').slice(0, 80);
    const name = `${String(++n).padStart(2, '0')}-${base}${ext}`;
    try {
      const img = await get(url);
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
