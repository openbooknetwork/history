// Keeps in each .urls list only the addresses whose file was fetched, so a list that is committed holds what the
// story was read from. An address with no file becomes a comment line, "# not fetched: <address>", which
// harita sources skips. Run from the repo root:
//   node scripts/urls-fetched.mjs [story]      every story, or one
//   node scripts/urls-fetched.mjs --dry        prints the counts and changes no file
// The file names follow kitap's sources command: <Title>.wiki for a Wikipedia article, else the address's host and
// path as .txt, .pdf or .html, in the folder named after the list with a dot before it.
import fs from 'fs';
import path from 'path';

const WIKI = /^https?:\/\/([a-z-]+)\.wikipedia\.org\/wiki\/([^?#]+)/;
const clean = t => t.replace(/[^A-Za-z0-9.]+/g, '-').replace(/^-|-$/g, '');
const slug = url => {
  const u = new URL(url), host = clean(u.hostname.replace(/^www\./, ''));
  return clean(`${host}-${clean(`${u.pathname.replace(/\.(?:pdf|html?)$/i, '')}${u.search}`).slice(-(100 - host.length))}`);
};
const fetched = (out, url) => {
  const wiki = url.match(WIKI);
  if (wiki) return fs.existsSync(path.join(out, `${decodeURIComponent(wiki[2]).replace(/[\/\\:*?"<>|]/g, '_')}.wiki`));
  let base;
  try { base = path.join(out, slug(url)); } catch { return false; }
  return ['.txt', '.pdf', '.html'].some(ext => fs.existsSync(base + ext));
};

const args = process.argv.slice(2), dry = args.includes('--dry'), only = args.find(a => !a.startsWith('--'));
const lists = [];
const walk = dir => { for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
  if (d.isDirectory() && !d.name.startsWith('.') && d.name !== 'pages' && d.name !== 'shared') walk(path.join(dir, d.name));
  else if (d.isFile() && d.name.endsWith('.urls') && (!only || path.basename(dir) === only)) lists.push(path.join(dir, d.name));
} };
walk('content');

let kept = 0, dropped = 0;
for (const list of lists.sort()) {
  const out = path.join(path.dirname(list), `.${path.basename(list, '.urls')}`);
  let gone = 0;
  const lines = fs.readFileSync(list, 'utf8').split('\n').map(line => {
    const url = line.replace(/(^|\s)#.*/, '').trim();
    if (!url) return line;
    if (fetched(out, url)) { kept++; return line; }
    gone++;
    return `# not fetched: ${line.trim().replace(/\s+#\s*/, '  ')}`;
  });
  dropped += gone;
  if (gone) console.log(`${list}: ${gone} not fetched`);
  if (gone && !dry) fs.writeFileSync(list, lines.join('\n'));
}
console.log(`${lists.length} lists, ${kept} addresses fetched, ${dropped} not fetched${dry ? ', nothing changed' : ''}`);
