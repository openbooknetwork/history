// Follows a run of the pipeline that was started with "claude -p --output-format stream-json --verbose > <file>".
// Run from the repo root, while the run goes or after it:
//   node scripts/run-watch.mjs <stream file>
// It prints one line for each dispatch, each call a hook or the permission check refused, each thing the main session
// said, and the result when the session ends. It reads the stream and no transcript, so it works on a run in progress.
import fs from 'fs';
const lines = fs.readFileSync(process.argv[2], 'utf8').split('\n').filter(Boolean);
let n = 0;
for (const l of lines) {
  let m; try { m = JSON.parse(l); } catch { continue; }
  n++;
  const depth = m.parent_tool_use_id ? '  sub ' : 'main ';
  for (const b of m.message?.content ?? []) {
    if (b.type === 'tool_use' && b.name === 'Agent') console.log(depth + 'DISPATCH ' + b.input.subagent_type + ' | ' + b.input.description);
    if (b.type === 'tool_result') { const t = typeof b.content === 'string' ? b.content : (b.content ?? []).map(c => c.text ?? '').join(' '); if (b.is_error && /hook|denied|refus/i.test(t)) console.log(depth + 'REFUSED ' + t.replace(/\s+/g, ' ').slice(0, 260)); }
    if (b.type === 'text' && !m.parent_tool_use_id && m.type === 'assistant') console.log('main SAYS ' + b.text.replace(/\s+/g, ' ').slice(0, 300));
  }
  if (m.type === 'result') console.log('RESULT ' + JSON.stringify({ turns: m.num_turns, ms: m.duration_ms, cost: m.total_cost_usd, err: m.is_error }) + '\n' + String(m.result).slice(0, 3000));
}
console.log(`[${n} events]`);
