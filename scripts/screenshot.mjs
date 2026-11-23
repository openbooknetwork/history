// Screenshots story pages in headless Chrome through the DevTools protocol and prints the pages' console errors.
//   node scripts/screenshot.mjs <story url> <out dir> <page id> [page id ...]
// Env: SHOT_W/SHOT_H (1400x900), SHOT_WAIT ms after each page change (6000), SHOT_SCHEME light|dark (dark),
// SHOT_LANG to show the pages in another of the story's languages,
// SHOT_HOVER=<lon>,<lat> to point the mouse at that place first, which shows a battle unit's hover label,
// SHOT_TEXT=1 to open each page's Text view before its capture, where a phone shows a battle card.
// The browser is CHROME_PATH where it is set, else the first found of Chrome on macOS, google-chrome and chromium
// on Linux, and Playwright's Chromium under /opt/pw-browsers. It runs without its sandbox as root, as in a container.
import { spawn, spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

function browser() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const fixed = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium', '/usr/bin/chromium-browser'];
  const playwright = fs.existsSync('/opt/pw-browsers')
    ? fs.readdirSync('/opt/pw-browsers').filter(d => d.startsWith('chromium')).sort().reverse().flatMap(d => ['chrome-linux/chrome', 'chrome-linux64/chrome'].map(f => path.join('/opt/pw-browsers', d, f)))
    : [];
  const found = [...fixed, ...playwright].find(f => fs.existsSync(f));
  if (found) return found;
  for (const name of ['google-chrome', 'chromium', 'chromium-browser']) {
    const which = spawnSync('which', [name], { encoding: 'utf8' });
    if (which.status === 0 && which.stdout.trim()) return which.stdout.trim();
  }
  console.error('no Chrome or Chromium found: set CHROME_PATH to the browser to run'); process.exit(2);
}

const [base, out, ...ids] = process.argv.slice(2);
if (!ids.length) { console.error('usage: node scripts/screenshot.mjs <story url> <out dir> <page id> [page id ...]'); process.exit(2); }
const W = +(process.env.SHOT_W ?? 1400), H = +(process.env.SHOT_H ?? 900);
const wait = +(process.env.SHOT_WAIT ?? 6000), port = 9300 + Math.floor(Math.random() * 500);
fs.mkdirSync(out, { recursive: true });
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-profile-'));
const chrome = spawn(browser(), ['--headless=new', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', ...(process.getuid?.() === 0 ? ['--no-sandbox'] : []),
  `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, `--window-size=${W},${H}`, '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
// the browser ends with this script however it ends: a finished run, an error, a timeout or a signal
let closed = false;
const close = () => { if (closed) return; closed = true; try { chrome.kill('SIGKILL'); } catch {} try { fs.rmSync(profile, { recursive: true, force: true }); } catch {} };
process.on('exit', close);
for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(signal, () => { close(); process.exit(130); });
for (const event of ['uncaughtException', 'unhandledRejection']) process.on(event, err => { console.error(err?.stack ?? err); close(); process.exit(1); });
chrome.on('error', err => { console.error(`the browser did not start: ${err.message}`); process.exit(2); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 50 && !target; i++) { await sleep(200); try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === 'page'); } catch {} }
if (!target) { console.error('the browser gave no page within 10 s'); process.exit(1); }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let seq = 0; const pending = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') console.log('  exception:', m.params.exceptionDetails.exception?.description?.split('\n')[0] ?? m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) console.log(`  console.${m.params.type}:`, m.params.args.map(a => a.value ?? a.description).join(' ').slice(0, 300)); };
const send = (method, params = {}) => new Promise(r => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
await send('Runtime.enable');
await send('Page.enable'); await send('Page.bringToFront'); await send('Emulation.setFocusEmulationEnabled', { enabled: true });
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: process.env.SHOT_SCHEME ?? 'dark' }] });
// the map lives inside the engine since the kitap split: keep a handle on it as maplibregl makes it, for SHOT_HOVER
await send('Page.addScriptToEvaluateOnNewDocument', { source: `(() => { let ml; Object.defineProperty(window, 'maplibregl', { configurable: true, get: () => ml, set: v => { const M = v.Map; v.Map = class extends M { constructor(o) { super(o); window.__MAP = this; } }; ml = v; } }); })()` });
// the story loads once, then the page's own go() steps to each page in place
await send('Page.navigate', { url: base });
const evaluate = async expression => (await send('Runtime.evaluate', { expression, returnByValue: true })).result.result.value;
const stop = msg => { console.error(msg); ws.close(); process.exit(1); };
// a cold start, or harita dev rebuilding after an edit, takes a while: wait until the story's pages are defined, up to 90 s
let loaded = false;
for (let i = 0; i < 180 && !loaded; i++) { await sleep(500); loaded = await evaluate(`typeof PAGES !== 'undefined' && PAGES.length > 0`); }
if (!loaded) stop(`${base} showed no story within 90 s. Check that the address is a story and that harita dev has finished building.`);
await sleep(1000);
if (process.env.SHOT_LANG) {
  const langs = await evaluate('B.languages');
  if (!langs.includes(process.env.SHOT_LANG)) stop(`SHOT_LANG=${process.env.SHOT_LANG}: the story's languages are ${langs.join(', ')}`);
  await evaluate(`setLang(${JSON.stringify(process.env.SHOT_LANG)})`);
}
for (const id of ids) {
  const found = await evaluate(`(i => { if (i >= 0) go(i); return i >= 0; })(PAGES.findIndex(p => p.id === ${JSON.stringify(id)}))`);
  if (!found) { console.log(`no page ${id}`); continue; }
  await sleep(wait);
  if (process.env.SHOT_TEXT) {
    const opened = await evaluate(`(b => { b?.click(); return !!b; })([...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Text'))`);
    if (!opened) console.log(`  ${id}: no Text button on this page at ${W}x${H}`);
    await sleep(2500);
  }
  if (process.env.SHOT_HOVER) {
    const expr = `(() => { const r = window.__MAP.getContainer().getBoundingClientRect(), p = window.__MAP.project([${process.env.SHOT_HOVER}]); return [r.left + p.x, r.top + p.y]; })()`;
    const [x, y] = await evaluate(expr);
    for (const d of [8, 0]) { await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x + d, y: y + d }); await sleep(400); }
  }
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(out, id + '.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('shot', id);
}
ws.close(); close(); process.exit(0);
