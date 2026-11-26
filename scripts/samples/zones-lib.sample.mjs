// A zone generator in small: one zone made of four lines, cut by a zone that stands and by a town, with its tests.
// It draws into .cache/, so it leaves the story as it is. A real generator is content/<story>/.plans/zones.mjs,
// begins `const z = draw('<story>')` with no second argument, and so writes shared/zones/ and .plan/ground.yaml.
// Run from the repo root: node scripts/samples/zones-lib.sample.mjs
import { draw } from '../zones-lib.mjs';
const z = draw('alexander-the-great', { out: '.cache/zones-sample', manifest: '.cache/zones-sample/ground.yaml' });

// a line is src, with the claim that gives it, or est, with what it is inferred from
const north = z.src('010.7', [[21.2, 40.1], [22.0, 40.0], [23.8, 40.2]]);            // through places the claim lists
const east = z.est('the open sea east of Magnesia: the coast cuts it', [north.points.at(-1), [23.8, 38.75]]);
const south = z.est('the Othrys and the Spercheus, where the League begins, after 010.7', [[23.8, 38.75], [22.2, 38.9], [21.45, 39.1]]);
const west = z.est('the crest of the Pindus, after 010.7', [[21.45, 39.1], [21.25, 39.5], north.points[0]]);
// along a fetched river it would be: z.src('020.4', z.feature('danube'), [22.67, 44.2], [25.9, 43.7])

// the lines in order, closed into a shape; then cut by what it is not
const THESSALY = z.region(north, east, south, west);
const pherae = z.town('Pherae, held by its tyrants until 352 BC, after 010.7', [22.73, 39.38], 6);
const shape = z.noIslands(z.diff(z.inter(THESSALY, z.country('Greece')), z.standing('sparta-337'), pherae), [[23.47, 39.16]]);

// the neighbour to the south shares the line `south`, run the other way
const MALIS = z.region(z.back(south), z.est('a day\'s march south of the Spercheus, drawn for the sample', [[23.8, 38.75], [23.6, 38.6], [21.6, 38.7], [21.45, 39.1]]));

z.zone('thessaly-352', { family: 'thessaly', name: 'Thessaly' }, shape, { inside: { larissa: [22.42, 39.64] }, outside: { pherae: [22.73, 39.38], pella: [22.52, 40.76] } });
z.zone('malis-352', { family: 'greeks', name: 'Malis' }, z.diff(MALIS, shape), { inside: { thermopylae: [22.54, 38.8] } });
const manifest = z.write();
// manifest.totals: { zones: 2, sourced_lines: 1, estimated_lines: 5, sourced_km: ..., estimated_km: ... }
// manifest.zones['thessaly-352']: { lines: [1, 2, 3, 4, 5], sourced_km, estimated_km, inside: { larissa: 'ok' }, outside: { ... } }
if (manifest.totals.zones !== 2 || process.exitCode) throw new Error('the sample no longer draws its two zones with every test passing');
