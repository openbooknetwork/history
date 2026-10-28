// The zones that join several drawn parts, written to shared/zones/. Run from the repo root:
//   node content/american-revolutionary-war/.plans/zones.mjs
// A page shows each family in one zone, so the parts of a family on one page are joined into one zone here. The parts
// no page shows alone live in .plans/zones/, the others in shared/zones/.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as turf from '@turf/turf';

const story = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const part = id => {
  for (const dir of ['.plans/zones', 'shared/zones']) {
    const file = path.join(story, dir, `${id}.geojson`);
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  throw new Error(`no zone part "${id}" in .plans/zones/ or shared/zones/`);
};

// the states in the order they ratify the Constitution
const DEC_1787 = ['de', 'pa', 'nj'];
const MAY_1788 = [...DEC_1787, 'ga', 'ct', 'ma', 'md', 'sc'];
const JUL_1788 = [...MAY_1788, 'nh', 'va', 'ny'];
// the states drawn as one zone are cut to the United States of today, where the drawn outlines run into Canada
const US = ['United States of America'];

const zones = {
  'crown-1763': { family: 'crown', name: 'Quebec, Nova Scotia and the Floridas, 1763', parts: ['quebec-1763', 'nova-scotia', 'florida-british'] },
  'crown-north-1763': { family: 'crown', name: 'Quebec and Nova Scotia, 1763', parts: ['quebec-1763', 'nova-scotia'] },
  'crown-1774': { family: 'crown', name: 'Quebec, Nova Scotia and the Floridas, from 1774', parts: ['quebec-1774', 'nova-scotia', 'florida-british'] },
  'crown-north-1774': { family: 'crown', name: 'Quebec and Nova Scotia, from 1774', parts: ['quebec-1774', 'nova-scotia'] },
  'held-new-york-newport': { family: 'held', name: 'New York and Newport, held by the British', parts: ['new-york-held', 'newport-held'] },
  'held-new-york-philadelphia': { family: 'held', name: 'New York and Philadelphia, held by the British', parts: ['new-york-held', 'philadelphia-held'] },
  'held-new-york-savannah': { family: 'held', name: 'New York and Savannah, held by the British', parts: ['new-york-held', 'savannah-held'] },
  'held-new-york-savannah-charleston': { family: 'held', name: 'New York, Savannah and Charleston, held by the British',
    parts: ['new-york-held', 'savannah-held', 'charleston-held'] },
  'spanish-1781': { family: 'spanish', name: 'Spanish Louisiana, with West Florida taken 1779 to 1781', parts: ['louisiana-spanish', 'florida-west-1781'] },
  'territories-1790': { family: 'territory', name: 'Northwest and Southwest Territories, 1790', parts: ['northwest-1787', 'southwest-1790'] },
  'ratified-1787': { family: 'ratified', name: 'States that have ratified, December 1787', parts: DEC_1787, clip: US },
  'ratified-1788-may': { family: 'ratified', name: 'States that have ratified, May 1788', parts: MAY_1788, clip: US },
  'ratified-1788-july': { family: 'ratified', name: 'States that have ratified, July 1788', parts: JUL_1788, clip: US },
  'ratified-1790': { family: 'ratified', name: 'States that have ratified, May 1790', parts: [...JUL_1788, 'nc', 'ri'], clip: US },
  'states-1790': { family: 'ratified', name: 'The thirteen states, 1790', parts: [...JUL_1788, 'nc-1796', 'ri'], clip: US },
  'states-1792': { family: 'ratified', name: 'The thirteen original states, from 1792',
    parts: [...MAY_1788, 'nh', 'ny', 'ri', 'va-1792', 'nc-1796'], clip: US },
  'admitted-1792': { family: 'admitted', name: 'New states: Vermont 1791, Kentucky 1792', parts: ['vt', 'ky'], clip: US },
  'admitted-1796': { family: 'admitted', name: 'New states: Vermont 1791, Kentucky 1792, Tennessee 1796', parts: ['vt', 'ky', 'southwest-1790'], clip: US },
};

const round = ring => ring.map(([x, y]) => [Math.round(x * 1e5) / 1e5, Math.round(y * 1e5) / 1e5]);
for (const [id, z] of Object.entries(zones)) {
  const { geometry } = turf.union(turf.featureCollection(z.parts.map(part)));
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  const coordinates = polygons.map(p => p.map(round));
  const feature = {
    type: 'Feature',
    properties: { id, family: z.family, name: z.name, ...(z.clip ? { clip: z.clip } : {}) },
    geometry: coordinates.length === 1 ? { type: 'Polygon', coordinates: coordinates[0] } : { type: 'MultiPolygon', coordinates },
  };
  fs.writeFileSync(path.join(story, 'shared/zones', `${id}.geojson`), JSON.stringify(feature, null, 1) + '\n');
  const holes = coordinates.flatMap(p => p.slice(1)).map(r => Math.round(turf.area(turf.polygon([r])) / 1e6));
  console.log(`${id}: ${coordinates.length} polygons${holes.length ? `, holes of ${holes.join(', ')} km2` : ''}`);
}
