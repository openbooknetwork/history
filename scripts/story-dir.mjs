// The folder of a story by its folder name, in group folders such as content/ottoman/ too, as harita finds stories.
// Run from the repo root. Returns null for a name no story folder has.
import fs from 'fs';
import path from 'path';

export function storyDir(name, dir = 'content') {
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!d.isDirectory() || d.name.startsWith('.') || (dir === 'content' && d.name === 'shared')) continue;
    const full = path.join(dir, d.name);
    if (fs.existsSync(path.join(full, 'story.yaml'))) { if (d.name === name) return full; continue; }
    const hit = storyDir(name, full);
    if (hit) return hit;
  }
  return null;
}
