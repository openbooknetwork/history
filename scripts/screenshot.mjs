// Screenshots story pages in headless Chrome through the DevTools protocol and prints the pages' console errors.
//   node scripts/screenshot.mjs <story url> <out dir> <page id> [page id ...]
// Env: SHOT_W/SHOT_H (1400x900), SHOT_WAIT ms after each hash change (6000), SHOT_SCHEME light|dark (dark),
// SHOT_HOVER=<lon>,<lat> to point the mouse at that place first, which shows a battle unit's hover label.
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const [base, out, ...ids] = process.argv.slice(2);
if (!ids.length) { console.error('usage: node scripts/screenshot.mjs <story url> <out dir> <page id> [page id ...]'); process.exit(2); }
const W = +(process.env.SHOT_W ?? 1400), H = +(process.env.SHOT_H ?? 900);
const wait = +(process.env.SHOT_WAIT ?? 6000), port = 9300 + Math.floor(Math.random() * 500);
fs.mkdirSync(out, { recursive: true });
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
  `--remote-debugging-port=${port}`, `--user-data-dir=/tmp/cdp-profile-${port}`, `--window-size=${W},${H}`, '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 50 && !target; i++) { await sleep(200); try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === 'page'); } catch {} }
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
for (const [i, id] of ids.entries()) {
  if (i === 0) { await send('Page.navigate', { url: base + '#' + id }); await sleep(wait + 3000); }
  else { await send('Runtime.evaluate', { expression: `location.hash = ${JSON.stringify(id)}` }); await sleep(wait); }
  if (process.env.SHOT_HOVER) {
    const expr = `(() => { const r = ML.map.getContainer().getBoundingClientRect(), p = ML.map.project([${process.env.SHOT_HOVER}]); return [r.left + p.x, r.top + p.y]; })()`;
    const [x, y] = (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result.result.value;
    for (const d of [8, 0]) { await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x + d, y: y + d }); await sleep(400); }
  }
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(out, id + '.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('shot', id);
}
ws.close(); chrome.kill();
