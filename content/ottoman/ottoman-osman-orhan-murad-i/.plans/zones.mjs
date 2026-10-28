// The political map: one set of zones per period, written to shared/zones/, with the page map in .plans/zones.yaml
// and the Turkish names in .i18n-parts/zones.tr.yaml. Run from the repo root:
//   node content/ottoman/ottoman-osman-orhan-murad-i/.plans/zones.mjs
// Each town has an owners' timeline and an area, the land nearest to it along the ground; a period's zones are its
// owners' areas joined in one topology. The Ottoman lands of 1389 go to content/shared/zones/ottomans-1389/.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
// turf, topojson and the world atlas come with harita, linked or installed
const hreq = createRequire(require.resolve('@openhistoryatlas/harita/package.json'));
const turf = hreq('@turf/turf'), tc = hreq('topojson-client'), ts = hreq('topojson-server'), tsi = hreq('topojson-simplify'), world = hreq('world-atlas/countries-10m.json');
const yaml = hreq('js-yaml');
const story = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const content = path.resolve(story, '..', '..');

// --- geometry helpers, Features in and out ---
const BOX = [8, 30, 46, 50];
const fc = (...a) => turf.featureCollection(a.flat().filter(Boolean));
const U = (...a) => { const p = a.flat().filter(Boolean); return p.length > 1 ? turf.union(fc(p)) : p[0] ?? null; };
const I = (a, b) => a && b ? turf.intersect(fc(a, b)) : null;
const D = (a, ...b) => { b = b.flat().filter(Boolean); return a && b.length ? turf.difference(fc(a, ...b)) : a; };
const poly = pts => turf.polygon([[...pts, pts[0]]]);
const km2 = f => f ? turf.area(f) / 1e6 : 0;
const polysOf = g => !g ? [] : g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
const problems = [];

// the story's land, which the build clips the zones to: to filter each page's zones and to find towns on the wrong shore
const storyYaml = yaml.load(fs.readFileSync(path.join(story, 'story.yaml'), 'utf8'));
const countries = tc.feature(world, world.objects.countries).features;
const LAND = U(storyYaml.land.map(n => {
  const f = countries.find(c => c.properties.name === n); if (!f) throw new Error(`no country ${n}`);
  return turf.bboxClip(f, BOX);
}).filter(f => polysOf(f.geometry).some(p => p[0]?.length >= 4)));
const landNear = f => { const g = turf.bboxClip(LAND, turf.bbox(f)).geometry; const p = polysOf(g).filter(q => q[0]?.length >= 4); return p.length ? turf.multiPolygon(p) : null; };

// --- borders that follow nature: crossing a river or a range costs BARRIER km of road, so a border between two towns
// runs along it where one lies between them. [lon, lat] lines, drawn after the usual atlas maps
const BARRIER = 30;
const LINES = {
  balkanRange: [[22.4, 43.8], [22.68, 43.4], [23.1, 43.15], [23.5, 43.0], [24.0, 42.85], [24.5, 42.75], [24.92, 42.72], [25.35, 42.75], [25.9, 42.75], [26.4, 42.85], [26.9, 42.88], [27.4, 42.85], [27.88, 42.72]],
  carpathians: [[22.4, 44.75], [22.8, 45.25], [23.3, 45.35], [24.0, 45.5], [24.6, 45.55], [25.3, 45.4], [25.8, 45.45], [26.3, 45.6], [26.6, 45.9], [26.5, 46.5]],
  maritsa: [[23.85, 42.25], [24.33, 42.2], [24.75, 42.15], [25.2, 42.08], [25.6, 42.03], [25.95, 41.93], [26.25, 41.75], [26.55, 41.67], [26.6, 41.5], [26.45, 41.3]],
  nestos: [[23.5, 41.95], [23.65, 41.75], [23.78, 41.55], [24.05, 41.42], [24.4, 41.3], [24.68, 41.2], [24.75, 40.88]],
  struma: [[23.03, 42.6], [22.85, 42.4], [23.05, 42.25], [23.1, 42.0], [23.25, 41.6], [23.3, 41.35], [23.2, 41.2], [23.5, 41.0], [23.85, 40.8]],
  vardar: [[20.9, 41.8], [21.43, 41.98], [21.78, 41.7], [21.95, 41.58], [22.24, 41.4], [22.5, 41.13], [22.6, 40.9], [22.75, 40.6]],
  morava: [[21.9, 42.55], [21.95, 43.0], [21.88, 43.3], [21.7, 43.54], [21.4, 43.67], [21.38, 43.93], [21.25, 44.2], [21.1, 44.5], [21.05, 44.7]],
  drin: [[20.68, 41.18], [20.5, 41.5], [20.4, 41.85], [20.42, 42.08], [20.15, 42.1], [19.85, 42.05], [19.62, 42.0], [19.55, 41.8]],
  olympus: [[21.15, 39.95], [21.6, 40.05], [22.0, 40.05], [22.35, 40.1], [22.6, 40.0]],
  pindus: [[20.95, 40.3], [21.15, 39.8], [21.25, 39.5], [21.4, 39.15], [21.6, 38.85]],
  sakarya: [[30.17, 40.5], [30.3, 40.55], [30.4, 40.75], [30.55, 40.95], [30.65, 41.12]],
  tmolos: [[27.15, 38.52], [27.45, 38.5], [27.75, 38.38], [28.1, 38.35], [28.45, 38.33], [28.75, 38.4]],
  menderes: [[30.16, 38.07], [29.75, 38.2], [29.4, 38.0], [29.05, 37.9], [28.6, 37.9], [28.2, 37.88], [27.8, 37.82], [27.45, 37.72], [27.25, 37.55]],
  kizilirmak: [[38.4, 39.9], [37.6, 39.8], [37.0, 39.73], [36.3, 39.4], [35.5, 39.0], [34.85, 38.72], [34.3, 38.95], [33.9, 39.25], [33.5, 39.8], [33.6, 40.3], [34.0, 40.75], [34.8, 40.97], [35.5, 41.3], [35.9, 41.57], [36.0, 41.75]],
  taurus: [[29.8, 37.15], [30.4, 37.3], [31.0, 37.25], [31.6, 37.15], [32.3, 36.95], [33.0, 37.0], [33.8, 37.25], [34.75, 37.3], [35.3, 37.6], [36.0, 37.9], [36.6, 38.1]],
};
// rivers and ranges that modern borders follow, taken from the Natural Earth borders: the Danube, the Sava and the Una,
// the Drina, the lower Maritsa, the Rhodopes
const RIVER_BORDERS = [['Romania', 'Bulgaria'], ['Romania', 'Serbia'], ['Croatia', 'Serbia'], ['Bosnia and Herz.', 'Croatia'],
  ['Bosnia and Herz.', 'Serbia'], ['Greece', 'Turkey'], ['Greece', 'Bulgaria']];
// straits narrower than the raster, which no town's area crosses
const WATER = {
  bosporus: [[29.125, 41.23], [29.105, 41.2], [29.083, 41.18], [29.062, 41.16], [29.073, 41.14], [29.073, 41.12], [29.065, 41.1], [29.055, 41.08],
    [29.045, 41.06], [29.013, 41.04], [29.0, 41.02], [29.0, 40.995], [29.0, 40.97]],
  dardanelles: [[26.69, 40.405], [26.66, 40.37], [26.625, 40.34], [26.59, 40.31], [26.535, 40.28], [26.5, 40.25], [26.46, 40.22], [26.375, 40.19],
    [26.385, 40.16], [26.375, 40.13], [26.33, 40.1], [26.3, 40.07], [26.26, 40.035]],
  euripus: [[23.585, 38.5], [23.592, 38.465], [23.6, 38.44]],
  rion: [[21.74, 38.315], [21.79, 38.322], [21.84, 38.326]],
};
// sea sites, far enough from the shore to take no land, that join a coastal town's area to its owner's other towns
// across the water: [lon, lat, town]
const SEA = {
  sileWest: [29.2, 41.42, 'derkos'], sileNorth: [29.5, 41.47, 'derkos'], sileEast: [29.78, 41.42, 'derkos'],
  midia: [28.35, 41.78, 'agathopolis'], strandzha: [28.22, 42.08, 'agathopolis'], burgas: [28.0, 42.4, 'agathopolis'], emine: [28.05, 42.7, 'agathopolis'],
};
// the lattice of sites in degrees, finer where pages look closely: Bithynia and the field of Kosovo
const LATTICE = 0.07, FINE = [[[28.3, 39.5, 31.3, 41.3], 0.03], [[20.7, 42.45, 21.5, 43.0], 0.02]];

// --- towns: [lon, lat, owners]. The owner from 1280, then each later owner after the year it takes over; - is no zone.
// A town stands for the country around it up to the next town, so towns sit on both sides of a border that matters.
const T = {
  // Bithynia
  sogut: [30.18, 40.02, 'ott'], bozuyuk: [30.04, 39.91, 'ott'], domanic: [29.61, 39.8, 'ott'],
  inonu: [30.145, 39.815, 'rum 1288 ott'], eskisehir: [30.52, 39.77, 'rum 1288 ott'], kulaca: [29.43, 40.03, 'byz 1288 ott'],
  inegol: [29.51, 40.08, 'byz 1299 ott'], bilecik: [29.98, 40.14, 'byz 1299 ott'], yarhisar: [29.74, 40.19, 'byz 1299 ott'],
  yenisehir: [29.65, 40.27, 'byz 1299 ott'], harmankaya: [30.36, 40.08, 'byz 1299 ott'], koprihisar: [29.85, 40.33, 'byz 1302 ott'],
  lefke: [30.01, 40.36, 'byz 1303 ott'], mekece: [30.07, 40.44, 'byz 1303 ott'], golpazari: [30.32, 40.29, 'byz 1303 ott'],
  pamukova: [30.17, 40.51, 'byz 1305 ott'], geyve: [30.29, 40.51, 'byz 1305 ott'], tarakli: [30.49, 40.4, 'byz 1305 ott'],
  goynuk: [30.79, 40.4, 'byz 1324 ott'], mudurnu: [31.21, 40.47, 'byz 1324 ott'], kestel: [29.21, 40.2, 'byz 1308 ott'], uludag: [29.15, 40.05, 'byz 1308 ott'],
  ulubat: [28.43, 40.17, 'byz 1308 ott'], kite: [28.86, 40.21, 'byz 1308 ott'], mudanya: [28.885, 40.375, 'byz 1321 ott'],
  adranos: [28.99, 39.9, 'byz 1308 ott'], karamursel: [29.615, 40.69, 'byz 1324 ott'], hersek: [29.52, 40.7, 'byz 1324 ott'], altinova: [29.4, 40.67, 'byz 1324 ott'],
  golcuk: [29.83, 40.715, 'byz 1324 ott'], bursa: [29.06, 40.185, 'byz 1321 byzbursa 1326.2 ott'], kios: [29.16, 40.43, 'byz 1327 ott'], orhangazi: [29.31, 40.49, 'byz 1327 ott'],
  armutlu: [28.83, 40.52, 'byz 1327 ott'], kapakli: [29.0, 40.47, 'byz 1327 ott'], gemlikbay: [29.0, 40.33, 'byz 1321 ott'], yalova: [29.27, 40.65, 'byz 1327 ott'], sapanca: [30.27, 40.69, 'byz 1329 ott'],
  aydos: [29.27, 40.96, 'byz 1337 ott'], kocaelihills: [29.62, 40.93, 'byz 1329 ott'], nicaea: [29.72, 40.43, 'byz 1327 byznicaea 1331.1 ott'],
  nicomedia: [29.92, 40.765, 'byz 1337 ott'], derince: [29.8, 40.79, 'byz 1337 ott'], hereke: [29.62, 40.79, 'byz 1337 ott'], gebze: [29.43, 40.8, 'byz 1337 ott'],
  tuzla: [29.3, 40.83, 'byz 1337 ott'], kartal: [29.19, 40.9, 'byz 1337 ott'], chrysopolis: [29.03, 41.01, 'byz 1337 ott'],
  yoros: [29.1, 41.16, 'byz 1337 ott'], omerli: [29.37, 41.05, 'byz 1337 ott'], kandira: [30.15, 41.07, 'byz 1329 ott'],
  agva: [29.85, 41.13, 'byz 1329 ott'], sile: [29.61, 41.175, 'byz'], adapazari: [30.4, 40.78, 'byz 1337 ott'],
  akyazi: [30.62, 40.68, 'byz 1337 ott'], karasu: [30.69, 41.08, 'byz 1337 ott'], konuralp: [31.15, 40.9, 'byz 1337 ott'],
  // Paphlagonia and the road to Ankara
  bolu: [31.6, 40.73, 'rum 1300 candar 1354 ott'], gerede: [32.19, 40.8, 'rum 1300 candar 1354 ott'],
  nallihan: [31.35, 40.19, 'rum 1354 ott'], beypazari: [31.92, 40.17, 'rum 1354 ott'], kizilcahamam: [32.65, 40.47, 'rum 1354 ott'],
  ankara: [32.86, 39.94, 'rum 1354 ott'], polatli: [32.15, 39.58, 'rum 1300 germiyan 1362 ott'],
  sivrihisar: [31.54, 39.45, 'rum 1300 germiyan 1362 ott'], mihaliccik: [31.5, 39.86, 'rum 1300 germiyan 1362 ott'],
  kalecik: [33.41, 40.1, 'rum'], cankiri: [33.62, 40.6, 'candar'], safranbolu: [32.69, 41.25, 'candar'], bartin: [32.34, 41.63, 'candar'],
  amastris: [32.39, 41.74, 'amastris'], kurucasile: [32.72, 41.83, 'candar'], cide: [33.0, 41.88, 'candar'], kastamonu: [33.78, 41.38, 'candar'], tosya: [34.03, 41.02, 'candar'],
  sinop: [35.15, 42.02, 'rum 1322 candar'], boyabat: [34.77, 41.47, 'rum 1322 candar'],
  // central and eastern Anatolia
  bafra: [35.9, 41.57, 'rum'], samsun: [36.33, 41.29, 'rum'], corum: [34.95, 40.55, 'rum'], amasya: [35.83, 40.65, 'rum'],
  tokat: [36.55, 40.31, 'rum'], niksar: [36.96, 40.59, 'rum'], unye: [37.28, 41.13, 'trebizond 1300 rum'],
  giresun: [38.39, 40.91, 'trebizond'], tirebolu: [38.8, 41.0, 'trebizond'], vakfikebir: [39.27, 41.03, 'trebizond'], trabzon: [39.72, 41.0, 'trebizond'], rize: [40.52, 41.02, 'trebizond'],
  gumushane: [39.48, 40.46, 'rum'], bayburt: [40.23, 40.26, 'rum 1381 -'], erzincan: [39.5, 39.75, 'rum 1381 -'],
  erzurum: [41.27, 39.9, 'rum 1335 -'], kars: [43.1, 40.6, 'rum 1335 -'], mus: [41.5, 38.75, 'rum 1335 -'], van: [43.4, 38.5, 'rum 1335 -'],
  sebinkarahisar: [38.42, 40.29, 'rum'], sivas: [37.02, 39.75, 'rum'], yozgat: [34.8, 39.82, 'rum'], kirsehir: [34.16, 39.15, 'rum'],
  kayseri: [35.49, 38.73, 'rum'], nigde: [34.68, 37.97, 'rum 1360 karaman'], aksaray: [34.03, 38.37, 'rum 1360 karaman'],
  kibistra: [34.05, 37.51, 'rum 1314 karaman'], konya: [32.49, 37.87, 'rum 1314 karaman'], ilgin: [31.91, 38.28, 'rum 1314 karaman'],
  larende: [33.22, 37.18, 'karaman'], ermenek: [32.89, 36.64, 'karaman'], mut: [33.43, 36.64, 'karaman'],
  silifke: [33.93, 36.38, 'armenia 1308 karaman'], alanya: [32.0, 36.55, 'rum 1293 karaman'],
  // Cilicia and Syria
  mersin: [34.63, 36.8, 'armenia 1359 mamluks'], tarsus: [34.9, 36.92, 'armenia 1359 mamluks'], adana: [35.32, 37.0, 'armenia 1359 mamluks'],
  ayas: [35.78, 36.77, 'armenia 1347 mamluks'], sis: [35.82, 37.45, 'armenia 1375 mamluks'], lampron: [34.87, 37.27, 'armenia 1359 mamluks'],
  osmaniye: [36.25, 37.07, 'armenia 1347 mamluks'], maras: [36.93, 37.58, 'mamluks'], elbistan: [37.2, 38.2, 'rum 1337 mamluks'],
  malatya: [38.31, 38.35, 'rum 1360 mamluks'], adiyaman: [38.28, 37.76, 'rum 1300 mamluks'], kharput: [39.22, 38.67, 'rum 1335 -'],
  diyarbakir: [40.23, 37.91, 'rum 1335 -'], urfa: [38.79, 37.16, 'rum 1300 mamluks'], mardin: [40.74, 37.31, '-'],
  antep: [37.38, 37.07, 'mamluks'], iskenderun: [36.17, 36.59, 'mamluks'], antioch: [36.16, 36.2, 'mamluks'], aleppo: [37.16, 36.2, 'mamluks'],
  latakia: [35.78, 35.52, 'mamluks'], hama: [36.75, 35.13, 'mamluks'], homs: [36.72, 34.73, 'mamluks'], tartus: [35.89, 34.89, 'mamluks'],
  damascus: [36.3, 33.51, 'mamluks'], raqqa: [39.01, 35.95, 'mamluks'], deir: [40.14, 35.33, 'mamluks'], palmyra: [38.27, 34.55, 'mamluks'],
  nicosia: [33.36, 35.17, 'cyprus'], famagusta: [33.94, 35.12, 'cyprus'], paphos: [32.42, 34.77, 'cyprus'], kyrenia: [33.32, 35.34, 'cyprus'],
  karpas: [34.4, 35.6, 'cyprus'],
  sukhumi: [41.0, 43.0, 'georgia'], gagra: [40.27, 43.3, 'georgia'], poti: [41.67, 42.15, 'georgia'], batumi: [41.64, 41.64, 'georgia'],
  kutaisi: [42.7, 42.27, 'georgia'], artvin: [41.82, 41.18, 'georgia'],
  // western Anatolia: Mysia, Lydia, Ionia, Caria, Phrygia, Pisidia, Lycia
  bandirma: [27.97, 40.35, 'byz 1305 karesi 1345 ott'], kyzikos: [27.85, 40.45, 'byz 1305 karesi 1345 ott'],
  marmara: [27.6, 40.62, 'byz 1305 karesi 1345 ott'], manyas: [27.97, 40.05, 'byz 1300 karesi 1345 ott'],
  gonen: [27.65, 40.1, 'byz 1300 karesi 1345 ott'], susurluk: [28.16, 39.91, 'byz 1300 karesi 1345 ott'],
  balikesir: [27.88, 39.65, 'byz 1297 karesi 1345 ott'], bigadic: [28.13, 39.39, 'byz 1300 karesi 1345 ott'],
  sindirgi: [28.18, 39.24, 'germiyan 1300 karesi 1345 ott'], dursunbey: [28.63, 39.59, 'byz 1300 karesi 1345 ott'],
  biga: [27.24, 40.23, 'byz 1310 karesi 1345 ott'], lampsacus: [26.75, 40.32, 'byz 1310 karesi 1345 ott'],
  abydos: [26.45, 40.1, 'byz 1310 karesi 1345 ott'], troad: [26.33, 39.79, 'byz 1310 karesi 1345 ott'], geyikli: [26.22, 39.8, 'byz 1310 karesi 1345 ott'],
  bayramic: [26.62, 39.81, 'byz 1310 karesi 1345 ott'], can: [27.05, 40.03, 'byz 1305 karesi 1345 ott'],
  assos: [26.45, 39.52, 'byz 1310 karesi 1345 ott'], babakale: [26.15, 39.52, 'byz 1310 karesi 1345 ott'], edremit: [27.02, 39.6, 'byz 1308 karesi 1345 ott'],
  ayvalik: [26.88, 39.3, 'byz 1308 karesi 1345 ott'], cunda: [26.68, 39.33, 'byz 1308 karesi 1345 ott'],
  bergama: [27.18, 39.12, 'byz 1308 karesi 1345 ott'], dikili: [26.95, 39.07, 'byz 1308 karesi 1345 ott'], candarli: [26.95, 38.93, 'byz 1308 karesi 1345 ott'],
  soma: [27.61, 39.19, 'byz 1305 karesi 1345 ott'], thyatira: [27.84, 38.92, 'byz 1305 saruhan'], gordes: [28.29, 38.93, 'germiyan 1300 saruhan'],
  demirci: [28.66, 39.05, 'germiyan'], simav: [28.98, 39.09, 'germiyan 1381 ott'], emet: [29.26, 39.34, 'germiyan 1381 ott'],
  tavsanli: [29.49, 39.54, 'germiyan 1381 ott'], kutahya: [29.98, 39.42, 'germiyan 1381 ott'], altintas: [30.11, 39.06, 'germiyan 1381 ott'],
  seyitgazi: [30.69, 39.44, 'rum 1300 germiyan 1381 ott'], gediz: [29.4, 39.0, 'germiyan'], usak: [29.4, 38.68, 'germiyan'],
  kula: [28.65, 38.55, 'germiyan'], selendi: [28.87, 38.74, 'germiyan'], esme: [28.97, 38.4, 'germiyan'], sardis: [28.06, 38.48, 'byz 1300 saruhan'], philadelphia: [28.52, 38.35, 'byz 1300 phil'],
  magnesia: [27.43, 38.61, 'byz 1308 byzhermos 1313 saruhan'], menemen: [26.98, 38.6, 'byz 1308 byzhermos 1313 saruhan'], phocaea: [26.8, 38.7, 'phocaea 1340 byz 1346 phocaea'],
  nymphaion: [27.42, 38.43, 'byz 1308 byzhermos 1313 aydin'], smyrna: [27.2, 38.42, 'byz 1308 byzhermos 1317 aydin'],
  urla: [26.76, 38.32, 'byz 1308 byzhermos 1310 aydin'], cesme: [26.32, 38.32, 'byz 1308 byzhermos 1310 aydin'],
  karaburun: [26.52, 38.62, 'byz 1308 byzhermos 1310 aydin'], seferihisar: [26.84, 38.2, 'byz 1308 byzhermos 1310 aydin'],
  ephesus: [27.37, 37.95, 'byz 1304 aydin'], tire: [27.73, 38.09, 'byz 1300 aydin'], birgi: [27.97, 38.25, 'byz 1300 aydin'],
  tralles: [27.84, 37.86, 'byz 1284 mentese 1308 aydin'], nazilli: [28.32, 37.91, 'byz 1284 mentese 1308 aydin'],
  kusadasi: [27.26, 37.86, 'byz 1308 aydin'], turgutreis: [27.27, 37.04, 'mentese'], soke: [27.4, 37.75, 'byz 1284 mentese'], mycale: [27.055, 37.642, 'byz 1284 mentese'],
  miletus: [27.28, 37.53, 'mentese'], milas: [27.78, 37.32, 'mentese'], bodrum: [27.43, 37.04, 'mentese'], mugla: [28.36, 37.22, 'mentese'],
  marmaris: [28.27, 36.88, 'mentese'], knidos: [27.45, 36.7, 'mentese'], datca: [27.62, 36.74, 'mentese'],
  hisaronu: [27.9, 36.77, 'mentese'], bozburun: [28.08, 36.65, 'mentese'], fethiye: [29.12, 36.62, 'mentese'], tavas: [29.07, 37.57, 'mentese'],
  denizli: [29.09, 37.78, 'germiyan'], acipayam: [29.35, 37.42, 'germiyan'], dinar: [30.16, 38.07, 'germiyan'], sandikli: [30.27, 38.46, 'germiyan'],
  afyon: [30.54, 38.76, 'rum 1314 germiyan'], emirdag: [31.15, 39.02, 'rum 1300 germiyan 1381 ott'],
  bolvadin: [31.05, 38.71, 'rum 1314 hamid 1381 ott'], aksehir: [31.41, 38.36, 'rum 1314 hamid 1381 ott'],
  yalvac: [31.18, 38.3, 'rum 1300 hamid 1381 ott'], karaagac: [31.36, 38.08, 'rum 1300 hamid 1381 ott'],
  uluborlu: [30.45, 38.08, 'rum 1300 hamid'], egirdir: [30.87, 37.875, 'rum 1300 hamid'], isparta: [30.55, 37.76, 'rum 1300 hamid'],
  burdur: [30.29, 37.72, 'rum 1300 hamid'], beysehir: [31.72, 37.68, 'rum 1300 esref 1327 hamid 1381 ott'],
  seydisehir: [31.85, 37.42, 'rum 1300 esref 1327 hamid 1381 ott'], antalya: [30.7, 36.89, 'rum 1300 teke'], korkuteli: [30.2, 37.07, 'rum 1300 teke'],
  elmali: [29.92, 36.74, 'rum 1300 teke'], kas: [29.64, 36.2, 'rum 1300 teke'], manavgat: [31.43, 36.79, 'rum 1300 teke'],
  // the islands off Asia
  tenedos: [26.03, 39.81, 'byz 1361 thes 1376.5 tenedos 1383.5 -'], lesbos: [26.22, 39.22, 'byz 1355 lesbos'], molyvos: [26.25, 39.33, 'byz 1355 lesbos'], mytilene: [26.48, 39.12, 'byz 1355 lesbos'],
  chios: [26.03, 38.4, 'byz 1304 chios 1329 byz 1346 chios'], psara: [25.57, 38.56, 'byz 1304 chios 1329 byz 1346 chios'],
  samos: [26.8, 37.72, 'byz 1304 chios 1329 byz 1346 chios'], samoseast: [27.025, 37.738, 'byz 1304 chios 1329 byz 1346 chios'], ikaria: [26.15, 37.6, 'byz 1304 chios 1329 byz 1346 chios'],
  patmos: [26.55, 37.32, 'byz 1308 rhodes'], leros: [26.85, 37.15, 'byz 1308 rhodes'], kalymnos: [26.98, 36.98, 'byz 1308 rhodes'],
  kos: [27.0, 36.76, 'byz 1308 rhodes'], kostown: [27.25, 36.86, 'byz 1308 rhodes'], nisyros: [27.16, 36.59, 'byz 1308 rhodes'],
  tilos: [27.37, 36.43, 'byz 1308 rhodes'], symi: [27.83, 36.59, 'byz 1308 rhodes'], rhodes: [27.95, 36.2, 'byz 1308 rhodes'],
  rhodestown: [28.2, 36.4, 'byz 1308 rhodes'], karpathos: [27.15, 35.6, 'crete'], kasos: [26.92, 35.4, 'crete'],
  // Thrace
  constantinople: [28.93, 41.02, 'byz'], derkos: [28.75, 41.3, 'byz'], catalca: [28.46, 41.14, 'byz'], selymbria: [28.25, 41.07, 'byz'],
  midia: [28.09, 41.62, 'byz'], vize: [27.76, 41.57, 'byz 1368 ott'], corlu: [27.8, 41.16, 'byz 1359 ott'], herakleia: [27.95, 40.98, 'byz 1359 ott'],
  rhaidestos: [27.5, 41.0, 'byz 1354.8 ott'], hayrabolu: [27.1, 41.21, 'byz 1356 ott'], malkara: [26.9, 40.89, 'byz 1354.5 ott'],
  sarkoy: [27.11, 40.61, 'byz 1354.5 ott'], kesan: [26.64, 40.86, 'byz 1354.5 ott'], ipsala: [26.38, 40.92, 'byz 1354.5 ott'], saros: [26.45, 40.66, 'byz 1354.5 ott'],
  ainos: [26.08, 40.72, 'byz 1361 thes 1384 ainos'], ferres: [26.17, 40.9, 'byz 1361 ott'],
  tzympe: [26.75, 40.5, 'byz 1352.1 ott 1366.6 byzgal 1376.9 ott'], gallipoli: [26.6, 40.42, 'byz 1354.2 ott 1366.6 byzgal 1376.9 ott'],
  eceabat: [26.33, 40.15, 'byz 1354.2 ott 1366.6 byzgal 1376.9 ott'], luleburgaz: [27.355, 41.4, 'byz 1361 ott'], babaeski: [27.09, 41.43, 'byz 1361 ott'],
  didymoteicho: [26.495, 41.35, 'byz 1361 ott'], uzunkopru: [26.69, 41.27, 'byz 1361 ott'], adrianople: [26.56, 41.68, 'byz 1362 ott'],
  kirklareli: [27.22, 41.74, 'byz 1368 ott'], strandzha: [27.52, 42.0, 'byz 1304 bulgaria 1368 ott'], agathopolis: [27.94, 42.1, 'byz'],
  sozopol: [27.7, 42.42, 'byz 1304 bulgaria 1366.9 byz'], anchialos: [27.64, 42.56, 'byz 1304 bulgaria 1366.9 byz'],
  mesembria: [27.73, 42.66, 'byz 1304 bulgaria 1366.9 byz'], burgas: [27.42, 42.5, 'byz 1304 bulgaria 1371.9 ott'],
  karnobat: [26.98, 42.65, 'byz 1304 bulgaria 1371.9 ott'], aytos: [27.25, 42.7, 'byz 1304 bulgaria 1371.9 ott'],
  yambol: [26.5, 42.48, 'byz 1304 bulgaria 1371.9 ott'], sliven: [26.32, 42.68, 'bulgaria 1371.9 ott'],
  starazagora: [25.63, 42.43, 'byz 1304 bulgaria 1364 ott'], kazanlak: [25.39, 42.62, 'bulgaria 1371.9 ott'],
  haskovo: [25.56, 41.93, 'byz 1344 bulgaria 1363 ott'], kardzhali: [25.37, 41.65, 'byz 1344 bulgaria 1363 ott'],
  philippopolis: [24.75, 42.15, 'byz 1344 bulgaria 1363 ott'], asenovgrad: [24.87, 41.98, 'byz 1344 bulgaria 1363 ott'],
  pazardzhik: [24.33, 42.19, 'bulgaria 1364 ott'], smolyan: [24.7, 41.58, 'byz 1344 bulgaria 1363 ott'],
  komotini: [25.4, 41.12, 'byz 1361 thes 1363 ott'], maroneia: [25.52, 40.88, 'byz 1361 thes 1363 ott'], xanthi: [24.88, 41.14, 'byz 1361 thes 1365 ott'],
  // Bulgaria, Dobruja and Wallachia
  sofia: [23.32, 42.7, 'bulgaria 1382.5 ott'], pernik: [23.03, 42.6, 'bulgaria 1382.5 ott'], dragoman: [22.93, 42.92, 'bulgaria 1382.5 ott'],
  samokov: [23.56, 42.34, 'bulgaria 1371.9 ott 1373 bulgaria 1382.5 ott'], ihtiman: [23.82, 42.43, 'bulgaria 1371.9 ott 1373 bulgaria 1382.5 ott'],
  botevgrad: [23.79, 42.9, 'bulgaria'], vratsa: [23.56, 43.21, 'bulgaria'], montana: [23.23, 43.41, 'bulgaria 1356 vidin 1365 hungary 1369 vidin'],
  lom: [23.24, 43.83, 'bulgaria 1356 vidin 1365 hungary 1369 vidin'], vidin: [22.88, 43.99, 'bulgaria 1356 vidin 1365 hungary 1369 vidin'],
  belogradchik: [22.68, 43.63, 'bulgaria 1356 vidin 1365 hungary 1369 vidin'], oryahovo: [23.96, 43.73, 'bulgaria 1356 vidin 1365 hungary 1369 vidin'],
  zajecar: [22.29, 43.9, 'bulgaria 1356 vidin 1365 hungary 1369 vidin'], negotin: [22.53, 44.23, 'bulgaria 1356 vidin 1365 hungary 1369 vidin'],
  pleven: [24.62, 43.42, 'bulgaria'], nikopol: [24.9, 43.7, 'bulgaria'], svishtov: [25.35, 43.62, 'bulgaria'], lovech: [24.72, 43.13, 'bulgaria'],
  tarnovo: [25.63, 43.08, 'bulgaria'], gabrovo: [25.32, 42.87, 'bulgaria'], ruse: [25.97, 43.85, 'bulgaria'], tutrakan: [26.62, 44.05, 'bulgaria'],
  razgrad: [26.52, 43.53, 'bulgaria 1388.5 ott'], isperih: [26.83, 43.72, 'bulgaria 1388.5 ott'], targovishte: [26.57, 43.25, 'bulgaria 1388.5 ott'],
  shumen: [26.93, 43.27, 'bulgaria 1388.5 ott'], preslav: [26.82, 43.16, 'bulgaria 1388.5 ott'], provadia: [27.44, 43.18, 'bulgaria 1388.5 ott'],
  silistra: [27.26, 44.12, 'bulgaria 1388.5 ott'], dobrich: [27.83, 43.57, 'bulgaria 1356 dobruja'], varna: [27.91, 43.21, 'bulgaria 1366 dobruja'],
  obzor: [27.88, 42.82, 'bulgaria 1366 dobruja'], kaliakra: [28.47, 43.36, 'bulgaria 1356 dobruja'], constanta: [28.63, 44.17, 'bulgaria 1356 dobruja'],
  medgidia: [28.27, 44.25, 'bulgaria 1356 dobruja'], hirsova: [27.95, 44.68, 'bulgaria 1356 dobruja'], tulcea: [28.8, 45.18, 'bulgaria 1356 dobruja'],
  severin: [22.66, 44.63, 'hungary 1330 wallachia'], calafat: [22.95, 44.05, '- 1310 wallachia'], craiova: [23.8, 44.32, '- 1310 wallachia'],
  turnu: [24.87, 43.75, '- 1310 wallachia'], ramnicu: [24.37, 45.1, '- 1310 wallachia'], arges: [24.68, 45.14, '- 1310 wallachia'],
  targoviste: [25.46, 44.93, '- 1310 wallachia'], bucharest: [26.1, 44.43, '- 1310 wallachia'], giurgiu: [25.97, 43.9, '- 1310 wallachia'],
  calarasi: [27.33, 44.2, '- 1310 wallachia'], slobozia: [27.37, 44.56, '- 1310 wallachia'], buzau: [26.82, 45.15, '- 1310 wallachia'],
  braila: [27.97, 45.27, '- 1330 wallachia'], focsani: [27.19, 45.7, '-'], galati: [28.04, 45.43, '-'], bacau: [26.91, 46.57, '-'],
  suceava: [26.25, 47.65, '-'], iasi: [27.6, 47.16, '-'], chisinau: [28.85, 47.0, '-'], budjak: [29.2, 45.9, '-'], odessa: [30.5, 46.5, '-'],
  kherson: [32.6, 46.6, '-'], delta: [29.3, 45.35, '-'], azov: [36.5, 46.8, '-'], donbas: [38.5, 48.2, '-'],
  // Hungary, Transylvania, Croatia and Dalmatia
  brasov: [25.6, 45.65, 'hungary'], sibiu: [24.15, 45.79, 'hungary'], hateg: [22.95, 45.6, 'hungary'], alba: [23.57, 46.07, 'hungary'],
  cluj: [23.6, 46.77, 'hungary'], targumures: [24.56, 46.54, 'hungary'], ciuc: [25.8, 46.36, 'hungary'], bistrita: [24.5, 47.13, 'hungary'],
  deva: [22.9, 45.88, 'hungary'], caransebes: [22.22, 45.42, 'hungary'], orsova: [22.4, 44.72, 'hungary'], timisoara: [21.23, 45.75, 'hungary'],
  arad: [21.31, 46.18, 'hungary'], oradea: [21.92, 47.06, 'hungary'], debrecen: [21.62, 47.53, 'hungary'], baiamare: [23.58, 47.66, 'hungary'],
  vrsac: [21.3, 45.12, 'hungary'], pancevo: [20.64, 44.87, 'hungary'], zrenjanin: [20.39, 45.38, 'hungary'], novisad: [19.86, 45.25, 'hungary'],
  srem: [19.4, 45.05, 'hungary'], vukovar: [19.0, 45.35, 'hungary'], szeged: [20.15, 46.25, 'hungary'], kecskemet: [19.69, 46.9, 'hungary'],
  budapest: [19.04, 47.5, 'hungary'], gyor: [17.63, 47.68, 'hungary'], pecs: [18.23, 46.07, 'hungary'], balaton: [17.8, 46.9, 'hungary'],
  osijek: [18.69, 45.55, 'hungary'], slavbrod: [18.0, 45.16, 'hungary'], pozega: [17.68, 45.34, 'hungary'], sisak: [16.37, 45.48, 'hungary'],
  zagreb: [15.98, 45.81, 'hungary'], varazdin: [16.34, 46.3, 'hungary'], karlovac: [15.55, 45.49, 'hungary'], bihac: [15.87, 44.82, 'hungary'],
  senj: [14.9, 45.0, 'hungary'], rijeka: [14.44, 45.33, 'hungary'], lika: [15.4, 44.55, 'hungary'], knin: [16.2, 44.04, 'hungary'],
  zadar: [15.23, 44.12, 'dalmatia 1358 hungary'], biograd: [15.45, 43.93, 'dalmatia 1358 hungary'], sibenik: [15.89, 43.73, 'hungary'],
  split: [16.44, 43.51, 'hungary'], omis: [16.69, 43.44, 'hungary'], korcula: [17.0, 42.95, 'hungary'], korculatown: [17.13, 42.94, 'hungary'], hvareast: [16.88, 43.15, 'hungary'], sucuraj: [17.08, 43.135, 'hungary'],
  hvar: [16.6, 43.15, 'hungary'], brac: [16.6, 43.32, 'hungary'], bracEast: [16.82, 43.3, 'hungary'], pag: [15.05, 44.45, 'dalmatia 1358 hungary'],
  cres: [14.4, 44.9, 'hungary'], krk: [14.6, 45.05, 'hungary'], pula: [13.85, 44.87, 'istria'],
  porec: [13.6, 45.23, 'istria'], labin: [14.12, 45.09, 'istria'], koper: [13.73, 45.55, 'istria'], pazin: [13.94, 45.24, '-'],
  ljubljana: [14.5, 46.05, '-'], maribor: [15.65, 46.55, '-'], novomesto: [15.17, 45.8, '-'],
  // Bosnia, Hum, Ragusa and the Serbian lands
  mljet: [17.55, 42.75, 'serbia 1326 bosnia 1333 ragusa'], ragusa: [18.11, 42.64, 'ragusa'], slano: [17.9, 42.78, 'serbia 1326 bosnia'], popovo: [18.1, 42.82, 'serbia 1326 bosnia'], ston: [17.7, 42.84, 'serbia 1326 bosnia 1333 ragusa'], peljesac: [17.3, 42.97, 'serbia 1326 bosnia 1333 ragusa'],
  orebic: [17.15, 43.02, 'serbia 1326 bosnia 1333 ragusa'], peljesacwest: [17.05, 43.03, 'serbia 1326 bosnia 1333 ragusa'],
  peljesaceast: [17.5, 42.87, 'serbia 1326 bosnia 1333 ragusa'], ploce: [17.42, 43.07, 'serbia 1326 bosnia'], gradac: [17.28, 43.2, 'serbia 1326 bosnia'], zaostrog: [17.12, 43.25, 'serbia 1326 bosnia'], opuzen: [17.6, 43.02, 'serbia 1326 bosnia'],
  makarska: [17.02, 43.3, 'serbia 1326 bosnia'], livno: [17.01, 43.83, 'hungary 1326 bosnia'], banjaluka: [17.19, 44.77, 'hungary 1326 bosnia'],
  jajce: [17.27, 44.34, 'hungary 1326 bosnia'], zenica: [17.9, 44.2, 'bosnia'], visoko: [18.18, 43.99, 'bosnia'], sarajevo: [18.41, 43.86, 'bosnia'],
  doboj: [18.09, 44.73, 'hungary 1284 dragutin 1324 bosnia'], tuzla: [18.67, 44.54, 'hungary 1284 dragutin 1324 bosnia'],
  zvornik: [19.1, 44.39, 'hungary 1284 dragutin 1324 bosnia'], srebrenica: [19.3, 44.1, 'serbia 1373 bosnia'],
  visegrad: [19.29, 43.78, 'serbia 1373 bosnia'], gorazde: [18.98, 43.67, 'serbia 1373 bosnia'], foca: [18.78, 43.5, 'serbia 1373 bosnia'],
  mostar: [17.81, 43.34, 'serbia 1326 bosnia'], stolac: [17.96, 43.08, 'serbia 1326 bosnia'], nevesinje: [18.12, 43.26, 'serbia 1373 bosnia'],
  gacko: [18.53, 43.17, 'serbia 1373 bosnia'], bileca: [18.43, 42.87, 'serbia 1373 bosnia'], trebinje: [18.34, 42.71, 'serbia 1373 bosnia'],
  konavle: [18.35, 42.55, 'serbia 1373 bosnia'], novi: [18.54, 42.45, 'serbia 1373 bosnia'], lustica: [18.65, 42.4, 'serbia 1360 zeta 1385 bosnia'], zabljak: [19.12, 43.15, 'serbia 1373 bosnia'],
  pljevlja: [19.36, 43.36, 'serbia 1373 bosnia'], prijepolje: [19.65, 43.39, 'serbia 1373 bosnia'], bijelopolje: [19.75, 43.04, 'serbia 1373 bosnia'],
  belgrade: [20.46, 44.82, 'hungary 1284 dragutin 1319 hungary'], macva: [19.65, 44.7, 'hungary 1284 dragutin 1319 hungary'],
  valjevo: [19.89, 44.27, 'serbia 1284 dragutin 1316 serbia 1371.9 lazar'], smederevo: [20.93, 44.66, 'serbia 1284 dragutin 1316 serbia 1371.9 lazar'],
  branicevo: [21.23, 44.73, 'bulgaria 1291 dragutin 1316 serbia 1356 hungary 1379 lazar'],
  kucevo: [21.67, 44.48, 'bulgaria 1291 dragutin 1316 serbia 1356 hungary 1379 lazar'],
  paracin: [21.41, 43.86, 'serbia 1371.9 lazar'], kragujevac: [20.92, 44.01, 'serbia 1371.9 lazar'], rudnik: [20.5, 44.14, 'serbia 1371.9 lazar'],
  cacak: [20.35, 43.89, 'serbia 1371.9 lazar'], uzice: [19.85, 43.86, 'serbia 1371.9 lazar'], kraljevo: [20.69, 43.72, 'serbia 1371.9 lazar'],
  krusevac: [21.33, 43.58, 'serbia 1371.9 lazar'], nis: [21.9, 43.32, 'serbia 1371.9 lazar 1386.5 ott'], prokuplje: [21.59, 43.24, 'serbia 1371.9 lazar'],
  kursumlija: [21.27, 43.14, 'serbia 1371.9 lazar'], leskovac: [21.95, 42.99, 'serbia 1371.9 lazar'],
  pirot: [22.59, 43.15, 'bulgaria 1330 serbia 1371.9 lazar 1386.5 ott'], vranje: [21.9, 42.55, 'serbia 1371.9 dragas'],
  presevo: [21.65, 42.31, 'serbia 1371.9 dragas'], sjenica: [20.0, 43.27, 'serbia 1371.9 vuk'], novipazar: [20.52, 43.14, 'serbia 1371.9 vuk'], raska: [20.68, 43.02, 'serbia 1371.9 vuk'],
  zvecan: [20.87, 42.9, 'serbia 1371.9 vuk'], vucitrn: [20.97, 42.82, 'serbia 1371.9 vuk'], pristina: [21.165, 42.663, 'serbia 1371.9 lazar 1378 vuk'],
  novobrdo: [21.43, 42.62, 'serbia 1371.9 lazar'], urosevac: [21.16, 42.37, 'serbia 1371.9 vuk'], berane: [19.87, 42.84, 'serbia 1373 vuk'],
  pec: [20.29, 42.66, 'serbia 1372 zeta 1377 vuk'], djakovica: [20.43, 42.38, 'serbia 1372 zeta 1377 vuk'], prizren: [20.74, 42.21, 'serbia 1372 zeta 1377 vuk'],
  kukes: [20.4, 42.08, 'serbia 1372 zeta 1377 vuk'], plav: [19.92, 42.6, 'serbia 1372 zeta'],
  // Zeta and Albania
  niksic: [18.95, 42.78, 'serbia 1373 zeta'], podgorica: [19.26, 42.44, 'serbia 1360 zeta'], kotor: [18.77, 42.42, 'serbia 1360 zeta 1385 bosnia'],
  budva: [18.84, 42.29, 'serbia 1360 zeta'], bar: [19.1, 42.09, 'serbia 1360 zeta'], ulcinj: [19.21, 41.93, 'serbia 1360 zeta'],
  scutari: [19.51, 42.07, 'serbia 1360 zeta'], puke: [19.9, 42.03, 'serbia 1360 zeta'], lezhe: [19.65, 41.78, 'serbia 1360 zeta'],
  mat: [20.1, 41.65, 'serbia 1359 thopia'], kruje: [19.79, 41.51, 'angevin 1345 serbia 1359 thopia'],
  durres: [19.45, 41.32, 'angevin 1368 thopia 1383 zeta 1385.75 thopia'], elbasan: [20.08, 41.11, 'byz 1345 serbia 1359 thopia'],
  berat: [19.95, 40.7, 'byz 1345 serbia 1356 valona 1372 zvalona 1385.75 komnina'],
  vlore: [19.49, 40.47, 'byz 1345 serbia 1356 valona 1372 zvalona 1385.75 komnina'],
  himare: [19.75, 40.1, 'byz 1345 serbia 1356 valona 1372 zvalona 1385.75 komnina'], divjake: [19.55, 40.95, 'byz 1345 serbia 1356 valona 1372 zvalona 1385.75 komnina'],
  // Macedonia
  kumanovo: [21.71, 42.13, 'byz 1282 serbia 1365 vukasin 1371.9 dragas'], kratovo: [22.18, 42.08, 'bulgaria 1282 serbia 1365 vukasin 1371.9 dragas'],
  velbuzd: [22.69, 42.28, 'bulgaria 1330 serbia 1365 vukasin 1371.9 dragas'], dupnitsa: [23.12, 42.27, 'bulgaria 1330 serbia 1365 vukasin 1371.9 dragas'],
  blagoevgrad: [23.1, 42.02, 'byz 1334 serbia 1365 ugljesa 1371.9 dragas'], razlog: [23.47, 41.88, 'bulgaria 1345 serbia 1365 ugljesa 1371.9 dragas'],
  stip: [22.19, 41.74, 'byz 1282 serbia 1365 vukasin 1371.9 dragas 1382.5 ott'], strumica: [22.64, 41.44, 'byz 1334 serbia 1365 vukasin 1371.9 dragas'],
  melnik: [23.39, 41.52, 'byz 1345 serbia 1365 ugljesa 1371.9 dragas'], negotino: [22.09, 41.48, 'byz 1334 serbia 1365 vukasin 1371.9 marko 1382.5 ott'],
  veles: [21.78, 41.72, 'byz 1282 serbia 1365 vukasin 1371.9 marko'], skopje: [21.43, 42.0, 'byz 1282 serbia 1365 vukasin 1371.9 marko 1377 vuk'],
  tetovo: [20.97, 42.01, 'byz 1282 serbia 1365 vukasin 1371.9 marko'], kicevo: [20.96, 41.51, 'byz 1282 serbia 1365 vukasin 1371.9 marko'],
  prilep: [21.55, 41.35, 'byz 1334 serbia 1365 vukasin 1371.9 marko'], bitola: [21.33, 41.03, 'byz 1334 serbia 1365 vukasin 1371.9 marko 1382.5 ott'],
  florina: [21.4, 40.78, 'byz 1334 serbia 1365 vukasin 1371.9 marko 1385 ott'], ohrid: [20.8, 41.12, 'byz 1334 serbia 1365 vukasin 1371.9 gropa'],
  debar: [20.52, 41.52, 'byz 1282 serbia 1365 vukasin 1371.9 gropa'], korce: [20.78, 40.62, 'byz 1347 serbia 1365 vukasin 1371.9 marko 1385 ott'],
  kastoria: [21.27, 40.52, 'byz 1347 serbia 1365 vukasin 1371.9 marko 1385 ott'], edessa: [22.05, 40.8, 'byz 1345 serbia 1365 vukasin 1371.9 marko 1385 ott'],
  veria: [22.2, 40.52, 'byz 1347 serbia 1365 vukasin 1371.9 marko 1385 ott'], servia: [21.9, 40.2, 'byz 1348 serbia 1365 vukasin 1371.9 marko 1385 ott'],
  gevgelija: [22.5, 41.14, 'byz 1334 serbia 1365 vukasin 1371.9 marko 1383 ott'], kilkis: [22.88, 40.99, 'byz 1345 serbia 1365 ugljesa 1371.9 thes 1383.7 ott'],
  katerini: [22.5, 40.27, 'byz 1361 thes 1387.3 ott'], thessalonica: [22.94, 40.64, 'byz 1361 thes 1387.3 ott'],
  chalkidiki: [23.4, 40.35, 'byz 1361 thes 1387.3 ott'], athos: [24.2, 40.25, 'byz 1361 thes 1387.3 ott'],
  strymon: [23.8, 40.8, 'byz 1345.7 serbia 1365 ugljesa 1371.9 thes 1383.7 ott'], serres: [23.55, 41.09, 'byz 1345.7 serbia 1365 ugljesa 1371.9 thes 1383.7 ott'],
  drama: [24.15, 41.15, 'byz 1345.7 serbia 1365 ugljesa 1371.9 ott'], kavala: [24.41, 40.94, 'byz 1345.7 serbia 1365 ugljesa 1371.9 ott'],
  nevrokop: [23.73, 41.57, 'byz 1345.7 serbia 1365 ugljesa 1371.9 ott'], nestos: [24.75, 41.0, 'byz 1361 thes 1365 ott'],
  thasos: [24.67, 40.64, 'byz 1361 thes 1387.3 byzisl'], samothrace: [25.55, 40.47, 'byz 1361 thes 1387.3 byzisl'],
  imbros: [25.85, 40.17, 'byz 1361 thes 1387.3 byzisl'], lemnos: [25.25, 39.9, 'byz 1361 thes 1387.3 byzisl'],
  // Thessaly, Epirus and Greece
  larissa: [22.42, 39.64, 'thessalypre 1318 thessalylords 1333 byz 1348 serbia 1356 simeon 1370 jovanuros 1373 byzthessaly'],
  trikala: [21.77, 39.55, 'thessalypre 1318 thessalylords 1333 byz 1348 serbia 1356 simeon 1370 jovanuros 1373 byzthessaly'],
  elassona: [22.19, 39.9, 'thessalypre 1318 thessalylords 1333 byz 1348 serbia 1356 simeon 1370 jovanuros 1373 byzthessaly'],
  karditsa: [21.92, 39.37, 'thessalypre 1318 thessalylords 1333 byz 1348 serbia 1356 simeon 1370 jovanuros 1373 byzthessaly'],
  pharsala: [22.38, 39.29, 'thessalypre 1318 thessalylords 1333 byz 1348 serbia 1356 simeon 1370 jovanuros 1373 byzthessaly'],
  volos: [22.94, 39.36, 'thessalypre 1318 thessalylords 1333 byz 1348 serbia 1356 simeon 1370 jovanuros 1373 byzthessaly'],
  halmyros: [22.79, 39.18, 'thessalypre 1318 thessalylords 1333 byz 1348 serbia 1356 simeon 1370 jovanuros 1373 byzthessaly'],
  trikeri: [23.05, 39.15, 'thessalypre 1318 thessalylords 1333 byz 1348 serbia 1356 simeon 1370 jovanuros 1373 byzthessaly'], pelion: [23.15, 39.3, 'thessalypre 1318 thessalylords 1333 byz 1348 serbia 1356 simeon 1370 jovanuros 1373 byzthessaly'], pteleos: [22.93, 39.02, 'thessalypre 1318 thessalylords 1333 byz 1348 serbia 1356 simeon 1370 jovanuros 1373 byzthessaly'],
  grevena: [21.43, 40.08, 'thessalypre 1318 thessalylords 1333 byz 1348 serbia 1356 simeon 1370 jovanuros 1373 byzthessaly'],
  domokos: [22.3, 39.13, 'thessalypre 1319 athens'], neopatras: [22.24, 38.87, 'thessalypre 1319 athens'], lamia: [22.43, 38.9, 'thessalypre 1319 athens'], stylida: [22.845, 38.9375, 'thessalypre 1319 athens'],
  atalanti: [22.99, 38.65, 'athenspre 1311 athens 1388.5 acciaioli'], kamena: [22.84, 38.73, 'athenspre 1311 athens 1388.5 acciaioli'],
  varnavas: [23.92, 38.24, 'athenspre 1311 athens 1388.5 acciaioli'], antikyra: [22.65, 38.35, 'athenspre 1311 athens 1388.5 acciaioli'], salona: [22.38, 38.53, 'athenspre 1311 athens'],
  livadeia: [22.87, 38.43, 'athenspre 1311 athens 1388.5 acciaioli'], thebes: [23.32, 38.32, 'athenspre 1311 athens 1388.5 acciaioli'],
  aulis: [23.55, 38.44, 'athenspre 1311 athens 1388.5 acciaioli'], avlida: [23.6, 38.37, 'athenspre 1311 athens 1388.5 acciaioli'], larymna: [23.22, 38.6, 'athenspre 1311 athens 1388.5 acciaioli'], athens: [23.73, 37.98, 'athenspre 1311 athens 1388.5 acciaioli'],
  marathon: [23.97, 38.15, 'athenspre 1311 athens 1388.5 acciaioli'], oropos: [23.75, 38.3, 'athenspre 1311 athens 1388.5 acciaioli'],
  lavrion: [24.0, 37.75, 'athenspre 1311 athens 1388.5 acciaioli'], megara: [23.35, 38.0, 'athenspre 1311 athens 1388.5 acciaioli'],
  aegina: [23.5, 37.74, 'athenspre 1311 athens 1388.5 acciaioli'], chalkis: [23.68, 38.47, 'negroponte'], limni: [23.5, 38.72, 'negroponte'], oreoi: [23.08, 38.93, 'negroponte'], istiaia: [23.2, 38.9, 'negroponte'], lichada: [22.875, 38.8425, 'negroponte'], styra: [24.24, 38.18, 'negroponte'],
  eretria: [23.85, 38.42, 'negroponte'], aliveri: [24.05, 38.4, 'negroponte'],
  karystos: [24.42, 38.02, 'negroponte'], kymi: [24.1, 38.63, 'negroponte'],
  naupaktos: [21.83, 38.42, 'epirus 1340 byz 1348 serbia 1356 simeon 1359 arta'], mesolongi: [21.43, 38.37, 'epirus 1340 byz 1348 serbia 1356 simeon 1359 arta'], evinochori: [21.6, 38.4, 'epirus 1340 byz 1348 serbia 1356 simeon 1359 arta'], marathias: [22.0, 38.41, 'epirus 1340 byz 1348 serbia 1356 simeon 1359 arta'], antirrio: [21.77, 38.37, 'epirus 1340 byz 1348 serbia 1356 simeon 1359 arta'],
  akarnania: [20.82, 38.75, 'epirus 1340 byz 1348 serbia 1356 simeon 1359 arta'], vonitsa: [20.95, 38.85, 'epirus 1340 byz 1348 serbia 1356 simeon 1359 arta'],
  astakos: [21.1, 38.55, 'epirus 1340 byz 1348 serbia 1356 simeon 1359 arta'], galaxidi: [22.3, 38.38, 'athenspre 1311 athens'], eratini: [22.15, 38.4, 'athenspre 1311 athens'], agrinio: [21.41, 38.62, 'epirus 1340 byz 1348 serbia 1356 simeon 1359 arta'],
  arta: [20.98, 39.16, 'epirus 1340 byz 1348 serbia 1356 simeon 1359 arta'], preveza: [20.75, 38.96, 'epirus 1340 byz 1348 serbia 1356 simeon 1359 arta'],
  paramythia: [20.5, 39.47, 'epirus 1337 byz 1348 serbia 1356 simeon 1359 arta'], igoumenitsa: [20.3, 39.45, 'epirus 1337 byz 1348 serbia 1356 simeon 1359 arta'],
  ioannina: [20.85, 39.66, 'epirus 1337 byz 1348 serbia 1356 simeon 1367 ioannina 1385 buondelmonti'],
  metsovo: [21.18, 39.77, 'epirus 1337 byz 1348 serbia 1356 simeon 1367 ioannina 1385 buondelmonti'],
  konitsa: [20.75, 40.05, 'epirus 1337 byz 1348 serbia 1356 simeon 1367 ioannina 1385 buondelmonti'],
  gjirokaster: [20.14, 40.08, 'epirus 1300 byz 1345 serbia 1356 simeon 1359 zenebishi'], permet: [20.35, 40.23, 'byz 1345 serbia 1356 simeon 1359 zenebishi'],
  butrint: [20.08, 39.76, 'epirus 1337 byz 1348 serbia 1356 simeon 1359 arta 1386 corfu'],
  saranda: [20.05, 39.9, 'epirus 1337 byz 1348 serbia 1356 simeon 1359 arta 1386 corfu'], corfu: [19.8, 39.6, '- 1386 corfu'], corfunorth: [19.85, 39.76, '- 1386 corfu'], corfusouth: [20.0, 39.42, '- 1386 corfu'], paxos: [20.17, 39.2, '- 1386 corfu'],
  lefkada: [20.66, 38.72, '-'], cephalonia: [20.55, 38.2, '-'], zakynthos: [20.85, 37.78, '-'],
  // the Morea
  patras: [21.73, 38.25, 'achaea'], rion: [21.8, 38.26, 'achaea'], psathopyrgos: [21.93, 38.27, 'achaea'], araxos: [21.42, 38.12, 'achaea'], akrata: [22.35, 38.12, 'achaea'], xylokastro: [22.63, 38.03, 'achaea'], kyllini: [21.2, 37.88, 'achaea'], vostitsa: [22.08, 38.25, 'achaea'], kalavryta: [22.1, 38.03, 'achaea'], corinth: [22.93, 37.94, 'achaea 1358 acciaioli'],
  argos: [22.73, 37.63, 'achaea 1388.5 morea'], lerna: [22.7, 37.53, 'achaea 1388.5 morea'], nauplia: [22.8, 37.57, 'achaea 1388.5 nauplia'], kranidi: [23.15, 37.38, 'achaea 1388.5 nauplia'],
  troezen: [23.35, 37.5, 'achaea 1388.5 nauplia'], astros: [22.65, 37.4, 'morea'], elis: [21.4, 37.75, 'achaea'],
  kyparissia: [21.67, 37.25, 'achaea'], pylos: [21.75, 37.0, 'achaea'], modon: [21.71, 36.82, 'messenia'], coron: [21.96, 36.8, 'messenia'],
  kalamata: [22.11, 37.04, 'achaea'], androusa: [21.92, 37.22, 'achaea'], karytaina: [22.04, 37.49, 'achaea 1320 morea'],
  tripoli: [22.38, 37.51, 'achaea 1320 morea'], mystras: [22.43, 37.07, 'morea'], mani: [22.38, 36.65, 'morea'], monemvasia: [22.98, 36.75, 'morea'], malea: [23.1, 36.55, 'morea'],
  leonidio: [22.86, 37.17, 'morea'], kythera: [22.98, 36.22, 'crete'],
  // Crete and the Cyclades
  chania: [23.95, 35.4, 'crete'], candia: [25.13, 35.3, 'crete'], sitia: [26.0, 35.15, 'crete'],
  andros: [24.85, 37.85, 'archipelago'], tinos: [25.15, 37.58, 'archipelago'], mykonos: [25.37, 37.45, 'archipelago'], syros: [24.93, 37.44, 'archipelago'],
  kea: [24.33, 37.62, 'archipelago'], serifos: [24.48, 37.15, 'archipelago'], milos: [24.42, 36.7, 'archipelago'], paros: [25.15, 37.05, 'archipelago'],
  naxos: [25.45, 37.05, 'archipelago'], ios: [25.3, 36.72, 'archipelago'], santorini: [25.43, 36.4, 'archipelago'], amorgos: [25.88, 36.85, 'archipelago'],
  astypalaia: [26.36, 36.57, 'archipelago'],
};

// places smaller than a town's area, drawn by hand: [ring, owners]
const SMALL = {
  // Pera, the Genoese town across the Golden Horn, which the 1:10m land does not show as water
  galata: [[[28.962, 41.024], [28.988, 41.022], [29.005, 41.026], [29.005, 41.04], [28.99, 41.042], [28.975, 41.04], [28.962, 41.034]], 'galata'],
  // the harbour castle of Smyrna, held by the crusaders and the Knights from 1344
  // Karacahisar, a Byzantine fort near Eskişehir until 1288 by Ottoman tradition
  karacahisar: [turf.circle([30.468, 39.745], 5, { steps: 24 }).geometry.coordinates[0].slice(0, -1), 'byzkara 1288 ott'],
  smyrnacastle: [[[27.09, 38.4], [27.135, 38.4], [27.15, 38.415], [27.145, 38.432], [27.09, 38.435]], 'byz 1308 byzhermos 1317 aydin 1344 smyrna'],
};

// --- owners: family, the id each zone's name starts with, and the names from the year they apply. A name can give
// its own id, as the Seljuk sultanate does when it becomes the Ilkhanid province and then the Eretnid emirate.
const N = (from, en, tr, id) => ({ from, en, tr, id });
const O = {
  ott: ['ottomans', 'ottomans', [N(1280, 'Ertuğrul’s pastures at Söğüt and Domaniç', 'Ertuğrul’un Söğüt ve Domaniç’teki yurdu'),
    N(1288, 'Osman’s land around Söğüt', 'Osman’ın Söğüt çevresindeki toprakları'), N(1299, 'Osman’s beylik', 'Osman Bey’in beyliği'),
    N(1324.5, 'Ottoman beylik under Orhan', 'Orhan Bey yönetiminde Osmanlı Beyliği'), N(1362, 'Ottoman state under Murad I', 'I. Murad yönetiminde Osmanlı Devleti')]],
  byz: ['byzantium', 'byzantium', [N(1280, 'Byzantine Empire under Michael VIII', 'VIII. Mihail yönetiminde Bizans İmparatorluğu'),
    N(1282.9, 'Byzantine Empire under Andronikos II', 'II. Andronikos yönetiminde Bizans İmparatorluğu'),
    N(1328.4, 'Byzantine Empire under Andronikos III', 'III. Andronikos yönetiminde Bizans İmparatorluğu'),
    N(1341.5, 'Byzantine Empire in the civil war of 1341–1347', '1341–1347 iç savaşında Bizans İmparatorluğu'),
    N(1347.1, 'Byzantine Empire under John VI Kantakouzenos and John V', 'VI. Ioannis Kantakuzenos ve V. Ioannis yönetiminde Bizans İmparatorluğu'),
    N(1354.9, 'Byzantine Empire under John V', 'V. Ioannis yönetiminde Bizans İmparatorluğu'),
    N(1373, 'Byzantine Empire under John V, an Ottoman vassal', 'Osmanlı’ya bağlı V. Ioannis yönetiminde Bizans İmparatorluğu'),
    N(1376.6, 'Byzantine Empire under Andronikos IV', 'IV. Andronikos yönetiminde Bizans İmparatorluğu'),
    N(1379.5, 'Byzantine Empire under John V, an Ottoman vassal', 'Osmanlı’ya bağlı V. Ioannis yönetiminde Bizans İmparatorluğu')]],
  morea: ['byzantium', 'morea', [N(1280, 'Byzantine Morea', 'Bizans’ın Mora’sı'), N(1349, 'Despotate of the Morea', 'Mora Despotluğu')]],
  phil: ['byzantium', 'philadelphia', [N(1280, 'Philadelphia, a Byzantine town among the beyliks', 'Beylikler arasında bir Bizans şehri: Alaşehir (Philadelphia)')]],
  thes: ['byzantium', 'thessalonica', [N(1361, 'Byzantine Thessalonica and western Thrace', 'Bizans’ın Selanik’i ve Batı Trakya’sı'),
    N(1365, 'Byzantine Thessalonica and the islands of the northern Aegean', 'Bizans’ın Selanik’i ve Kuzey Ege adaları'),
    N(1371.9, 'Byzantine Thessalonica and Serres, with the islands of the northern Aegean', 'Bizans’ın Selanik ve Serez’i, Kuzey Ege adalarıyla'),
    N(1382.9, 'Thessalonica under Manuel II, with the islands of the northern Aegean', 'II. Manuel yönetiminde Selanik, Kuzey Ege adalarıyla')]],
  byzhermos: ['byzantium', 'hermos', [N(1280, 'Byzantine towns of the Hermos valley and Smyrna', 'Bizans’ın Gediz vadisindeki şehirleri ve İzmir')]],
  byzbursa: ['byzantium', 'bursa', [N(1280, 'Bursa, besieged by the Ottomans', 'Osmanlıların kuşattığı Bursa')]],
  byznicaea: ['byzantium', 'nicaea', [N(1280, 'Nicaea, besieged by the Ottomans', 'Osmanlıların kuşattığı İznik')]],
  byzkara: ['byzantium', 'karacahisar', [N(1280, 'Karacahisar, a Byzantine fort by Ottoman tradition', 'Osmanlı rivayetine göre bir Bizans kalesi: Karacahisar')]],
  byzisl: ['byzantium', 'aegean-islands', [N(1280, 'Byzantine islands of the northern Aegean', 'Bizans’ın Kuzey Ege adaları')]],
  byzgal: ['byzantium', 'gallipoli', [N(1280, 'Gallipoli, Byzantine again 1366–1376', '1366–1376 arasında yeniden Bizans’ın elindeki Gelibolu')]],
  byzthessaly: ['byzantium', 'thessaly', [N(1280, 'Thessaly under Alexios Angelos, a Byzantine lord', 'Bizans’a bağlı Aleksios Angelos yönetiminde Teselya')]],
  serbia: ['serbia', 'serbia', [N(1280, 'Kingdom of Serbia under Stefan Dragutin', 'Stefan Dragutin yönetiminde Sırbistan Krallığı'),
    N(1282, 'Kingdom of Serbia under Stefan Milutin', 'Stefan Milutin yönetiminde Sırbistan Krallığı'),
    N(1321.9, 'Kingdom of Serbia under Stefan Dečanski', 'Stefan Dečanski yönetiminde Sırbistan Krallığı'),
    N(1331.7, 'Kingdom of Serbia under Stefan Dušan', 'Stefan Duşan yönetiminde Sırbistan Krallığı'),
    N(1346.3, 'Serbian Empire under Stefan Dušan', 'Stefan Duşan yönetiminde Sırp İmparatorluğu'),
    N(1355.95, 'Serbian Empire under Uroš V', 'V. Uroš yönetiminde Sırp İmparatorluğu'),
    N(1365, 'Serbian lords under the emperor Uroš V: Lazar, Vuk Branković and Nikola Altomanović',
      'İmparator V. Uroš’a bağlı Sırp beyleri: Lazar, Vuk Brankoviç ve Nikola Altomanoviç')]],
  dragutin: ['syrmia', 'syrmia', [N(1280, 'Kingdom of Syrmia under Stefan Dragutin, a Hungarian vassal', 'Macaristan’a bağlı Stefan Dragutin yönetiminde Srem Krallığı')]],
  simeon: ['thessaly', 'epirus-thessaly', [N(1280, 'Epirus and Thessaly under Simeon Uroš', 'Simeon Uroš yönetiminde Epir ve Teselya')]],
  jovanuros: ['thessaly', 'thessaly', [N(1280, 'Thessaly under Jovan Uroš', 'Jovan Uroš yönetiminde Teselya')]],
  ioannina: ['ioannina', 'ioannina', [N(1280, 'Ioannina under Thomas Preljubović', 'Thomas Preljuboviç yönetiminde Yanya')]],
  valona: ['valona', 'valona', [N(1280, 'Valona and Berat under the Komnenoi Asen', 'Komnen Asen ailesi yönetiminde Avlonya ve Berat')]],
  ugljesa: ['serres', 'ugljesa', [N(1280, 'Despotate of Serres under Jovan Uglješa', 'Jovan Uglješa yönetiminde Serez Despotluğu')]],
  vukasin: ['prilep', 'vukasin', [N(1280, 'King Vukašin’s lands at Prilep', 'Kral Vukaşin’in Pirlepe’deki toprakları')]],
  marko: ['prilep', 'marko', [N(1280, 'Marko’s lands at Prilep, an Ottoman vassal', 'Osmanlı’ya bağlı Marko’nun Pirlepe’deki toprakları')]],
  dragas: ['dragas', 'dragas', [N(1280, 'Lands of Jovan and Konstantin Dragaš, Ottoman vassals', 'Osmanlı’ya bağlı Jovan ve Konstantin Dragaş’ın toprakları'),
    N(1378, 'Lands of Konstantin Dragaš, an Ottoman vassal', 'Osmanlı’ya bağlı Konstantin Dragaş’ın toprakları')]],
  lazar: ['serbia', 'lazar', [N(1280, 'Lazar’s principality on the Morava', 'Lazar’ın Morava’daki prensliği'),
    N(1389.4, 'Moravian Serbia under Milica and Stefan Lazarević', 'Milica ve Stefan Lazareviç yönetiminde Moravya Sırbistanı')]],
  vuk: ['brankovic', 'brankovic', [N(1280, 'Vuk Branković’s land in Kosovo', 'Vuk Brankoviç’in Kosova’daki toprakları')]],
  bulgaria: ['bulgaria', 'bulgaria', [N(1280, 'Bulgarian Empire under George Terter I', 'I. Georgi Terter yönetiminde Bulgar İmparatorluğu'),
    N(1300, 'Bulgarian Empire under Theodore Svetoslav', 'Teodor Svetoslav yönetiminde Bulgar İmparatorluğu'),
    N(1323, 'Bulgarian Empire under Michael Shishman', 'Mihail Şişman yönetiminde Bulgar İmparatorluğu'),
    N(1331, 'Bulgarian Empire under Ivan Alexander', 'İvan Aleksandır yönetiminde Bulgar İmparatorluğu'),
    N(1371.1, 'Bulgaria of Tarnovo under Ivan Shishman', 'İvan Şişman yönetiminde Tırnova Bulgaristanı'),
    N(1373, 'Bulgaria of Tarnovo under Ivan Shishman, an Ottoman vassal', 'Osmanlı’ya bağlı İvan Şişman yönetiminde Tırnova Bulgaristanı')]],
  vidin: ['vidin', 'vidin', [N(1280, 'Tsardom of Vidin under Ivan Sratsimir', 'İvan Sratsimir yönetiminde Vidin Çarlığı'),
    N(1388.5, 'Tsardom of Vidin under Ivan Sratsimir, an Ottoman vassal', 'Osmanlı’ya bağlı İvan Sratsimir yönetiminde Vidin Çarlığı')]],
  dobruja: ['dobruja', 'dobruja', [N(1280, 'Dobruja under Dobrotitsa', 'Dobrotiça yönetiminde Dobruca'), N(1386, 'Dobruja under Ivanko', 'İvanko yönetiminde Dobruca')]],
  hungary: ['hungary', 'hungary', [N(1280, 'Kingdom of Hungary', 'Macaristan Krallığı'),
    N(1365, 'Kingdom of Hungary, with the banate of Vidin 1365–1369', '1365–1369 arasında Vidin Banlığı ile Macaristan Krallığı'),
    N(1369, 'Kingdom of Hungary', 'Macaristan Krallığı')]],
  bosnia: ['bosnia', 'bosnia', [N(1280, 'Banate of Bosnia', 'Bosna Banlığı'), N(1377, 'Kingdom of Bosnia under Tvrtko I', 'I. Tvrtko yönetiminde Bosna Krallığı')]],
  zeta: ['zeta', 'zeta', [N(1280, 'Zeta under the Balšići', 'Balşiçlerin Zeta’sı'), N(1378, 'Zeta under Balša II', 'II. Balşa yönetiminde Zeta'),
    N(1385.75, 'Zeta under Đurađ II Balšić, an Ottoman vassal', 'Osmanlı’ya bağlı II. Đurađ Balšić yönetiminde Zeta')]],
  zvalona: ['valona', 'valona', [N(1280, 'Valona and Berat under Balša II, through his wife Komnina', 'Eşi Komnina yoluyla II. Balşa yönetiminde Avlonya ve Berat')]],
  komnina: ['valona', 'valona', [N(1280, 'Valona and Berat under Komnina, widow of Balša II', 'II. Balşa’nın dul eşi Komnina yönetiminde Avlonya ve Berat')]],
  thopia: ['thopia', 'thopia', [N(1280, 'Lands of Karl Thopia', 'Karl Topia’nın toprakları'),
    N(1385.75, 'Lands of Karl Thopia, an Ottoman vassal', 'Osmanlı’ya bağlı Karl Topia’nın toprakları')]],
  gropa: ['ohrid', 'ohrid', [N(1280, 'Ohrid under Andrea Gropa', 'Andrea Gropa yönetiminde Ohri')]],
  zenebishi: ['gjirokaster', 'gjirokaster', [N(1280, 'Albanian lords of Gjirokastër', 'Ergiri’nin Arnavut beyleri')]],
  arta: ['arta', 'arta', [N(1280, 'Albanian despotates in Epirus: Arta and Angelokastron', 'Epir’deki Arnavut despotlukları: Arta ve Angelokastron')]],
  karaman: ['karaman', 'karaman', [N(1280, 'Beylik of Karaman', 'Karamanoğulları Beyliği')]],
  germiyan: ['germiyan', 'germiyan', [N(1280, 'Beylik of Germiyan', 'Germiyanoğulları Beyliği')]],
  karesi: ['karesi', 'karesi', [N(1280, 'Beylik of Karesi', 'Karesioğulları Beyliği')]],
  saruhan: ['saruhan', 'saruhan', [N(1280, 'Beylik of Saruhan', 'Saruhanoğulları Beyliği')]],
  aydin: ['aydin', 'aydin', [N(1280, 'Beylik of Aydın', 'Aydınoğulları Beyliği')]],
  mentese: ['mentese', 'mentese', [N(1280, 'Beylik of Menteşe', 'Menteşeoğulları Beyliği')]],
  hamid: ['hamid', 'hamid', [N(1280, 'Beylik of Hamid', 'Hamidoğulları Beyliği')]],
  teke: ['teke', 'teke', [N(1280, 'Beylik of Teke', 'Tekeoğulları Beyliği')]],
  esref: ['esref', 'esref', [N(1280, 'Beylik of Eşref', 'Eşrefoğulları Beyliği')]],
  candar: ['candar', 'candar', [N(1280, 'Chobanid emirate of Kastamonu', 'Kastamonu’daki Çobanoğulları Beyliği'), N(1309, 'Beylik of Candar', 'Candaroğulları Beyliği')]],
  rum: ['seljuks', 'seljuks', [N(1280, 'Seljuk Sultanate of Rûm, under the Ilkhanate', 'İlhanlılara bağlı Anadolu Selçuklu Devleti'),
    N(1300, 'Seljuk sultanate under Ilkhanid governors', 'İlhanlı valilerin yönetimindeki Selçuklu sultanlığı'),
    N(1308, 'Ilkhanid province of Anatolia', 'İlhanlıların Anadolu valiliği', 'ilkhanate'), N(1335, 'Eretnid emirate', 'Eretna Beyliği', 'eretna'),
    N(1381, 'State of Kadı Burhaneddin', 'Kadı Burhaneddin Devleti', 'burhaneddin')]],
  crete: ['venice', 'crete', [N(1280, 'Venetian Crete', 'Venedik’in Girit’i')]],
  negroponte: ['venice', 'negroponte', [N(1280, 'Negroponte (Euboea), Venetian', 'Venedik’in Eğriboz’u')]],
  messenia: ['venice', 'modon-coron', [N(1280, 'Modon and Coron, Venetian', 'Venedik’in Moton ve Koron’u')]],
  tenedos: ['venice', 'tenedos', [N(1280, 'Tenedos, Venetian from 1376', '1376’dan sonra Venedik’in Bozcaada’sı')]],
  dalmatia: ['venice', 'zadar', [N(1280, 'Zadar, Venetian until 1358', '1358’e dek Venedik’in Zara’sı')]],
  istria: ['venice', 'istria', [N(1280, 'Venetian Istria', 'Venedik’in İstria’sı')]],
  archipelago: ['venice', 'archipelago', [N(1280, 'Duchy of the Archipelago, a Venetian vassal', 'Venedik’e bağlı Ege Dükalığı (Nakşa)')]],
  corfu: ['venice', 'corfu', [N(1280, 'Corfu, Venetian from 1386', '1386’dan sonra Venedik’in Korfu’su')]],
  nauplia: ['venice', 'nauplia', [N(1280, 'Nauplia, Venetian from 1388', '1388’den sonra Venedik’in Anabolu’su')]],
  galata: ['genoa', 'galata', [N(1280, 'Galata (Pera), Genoese', 'Cenevizlilerin Galata’sı')]],
  chios: ['chios', 'chios', [N(1280, 'Chios and Samos under the Zaccaria of Genoa', 'Cenevizli Zaccaria ailesinin Sakız ve Sisam’ı'),
    N(1346, 'Chios and Samos under the Genoese Maona', 'Ceneviz Maona şirketinin Sakız ve Sisam’ı')]],
  phocaea: ['chios', 'phocaea', [N(1280, 'Phocaea, Genoese', 'Cenevizlilerin Foça’sı')]],
  lesbos: ['gattilusi', 'lesbos', [N(1280, 'Lesbos under the Gattilusi of Genoa', 'Cenevizli Gattilusi ailesinin Midilli’si')]],
  ainos: ['gattilusi', 'ainos', [N(1280, 'Ainos under the Gattilusi', 'Gattilusi ailesinin Enez’i')]],
  amastris: ['genoa', 'amastris', [N(1280, 'Amastris, Genoese', 'Cenevizlilerin Amasra’sı')]],
  rhodes: ['knights', 'rhodes', [N(1280, 'Rhodes, held by the Knights Hospitaller from 1310', '1310’dan sonra Hospitalier şövalyelerinin Rodos’u')]],
  smyrna: ['knights', 'smyrna', [N(1280, 'Harbour castle of Smyrna, held by the Knights 1344–1402', '1344–1402 arasında şövalyelerin elindeki İzmir liman kalesi')]],
  athens: ['catalans', 'athens', [N(1280, 'Catalan Duchy of Athens', 'Katalan Atina Dükalığı'),
    N(1319, 'Catalan duchies of Athens and Neopatras', 'Katalan Atina ve Neopatras dükalıkları')]],
  wallachia: ['wallachia', 'wallachia', [N(1280, 'Wallachia under Basarab I', 'I. Basarab yönetiminde Eflak'),
    N(1352, 'Wallachia under Nicholas Alexander', 'Nikola Aleksandru yönetiminde Eflak'), N(1364, 'Wallachia under Vladislav I', 'I. Vladislav yönetiminde Eflak'),
    N(1377, 'Wallachia under Radu I', 'I. Radu yönetiminde Eflak'), N(1386, 'Wallachia under Mircea the Elder', 'Yaşlı Mircea yönetiminde Eflak')]],
  trebizond: ['trebizond', 'trebizond', [N(1280, 'Empire of Trebizond', 'Trabzon İmparatorluğu')]],
  armenia: ['cilicia', 'cilicia', [N(1280, 'Armenian Kingdom of Cilicia', 'Kilikya Ermeni Krallığı')]],
  mamluks: ['mamluks', 'mamluks', [N(1280, 'Mamluk Sultanate', 'Memlük Sultanlığı')]],
  georgia: ['georgia', 'georgia', [N(1280, 'Kingdom of Georgia', 'Gürcistan Krallığı')]],
  cyprus: ['cyprus', 'cyprus', [N(1280, 'Kingdom of Cyprus', 'Kıbrıs Krallığı')]],
  achaea: ['achaea', 'achaea', [N(1280, 'Principality of Achaea', 'Ahaya Prensliği')]],
  athenspre: ['athens', 'athens', [N(1280, 'Duchy of Athens', 'Atina Dükalığı')]],
  thessalypre: ['thessaly', 'thessaly', [N(1280, 'Thessaly under the Doukas', 'Dukas ailesi yönetiminde Teselya')]],
  thessalylords: ['thessaly', 'thessaly', [N(1280, 'Thessaly under its Greek lords', 'Rum beyleri yönetiminde Teselya')]],
  epirus: ['epirus', 'epirus', [N(1280, 'Despotate of Epirus', 'Epir Despotluğu')]],
  angevin: ['angevin', 'durres', [N(1280, 'Durrës, the Angevin Kingdom of Albania', 'Anjou hanedanının Arnavutluk Krallığı: Draç')]],
  ragusa: ['ragusa', 'ragusa', [N(1280, 'Republic of Ragusa', 'Ragusa (Dubrovnik) Cumhuriyeti')]],
  acciaioli: ['acciaioli', 'acciaioli', [N(1280, 'Corinth under the Acciaioli', 'Acciaioli ailesinin Korint’i'),
    N(1388.5, 'Athens and Corinth under Nerio Acciaioli', 'Nerio Acciaioli yönetiminde Atina ve Korint')]],
  buondelmonti: ['ioannina', 'ioannina', [N(1280, 'Ioannina under Esau Buondelmonti', 'Esau Buondelmonti yönetiminde Yanya')]],
};

// --- periods: the year whose owners a page shows, and owners set by hand where a page shows two moments at once ---
const PERIODS = [
  [1280, ['anatolia-1280', 'sogut']],
  [1288, ['first-raids']],
  [1300, ['bilecik', 'beyliks']],
  [1302.6, ['bapheus']],
  [1308.5, ['sakarya']],
  [1311.3, ['catalans']],
  [1324, ['bursa-ring']],
  [1326.3, ['bursa']],
  [1329.45, ['pelekanon']],
  [1331.2, ['nicaea']],
  [1337.5, ['nicomedia']],
  [1345.5, ['karesi', 'rule']],
  [1346.5, ['civil-war']],
  [1352.5, ['demotika']],
  [1354.9, ['gallipoli', 'ankara', 'gazis', 'subjects']],
  [1356.5, ['thrace']],
  [1361.5, ['murad']],
  [1362.5, ['adrianople']],
  [1365.5, ['philippopolis']],
  [1367.5, ['amadeus']],
  [1371.7, ['maritsa']],
  [1374.5, ['vassals']],
  [1377.5, ['andronikos']],
  [1381.5, ['germiyan', 'dubravnica', 'army']],
  [1385.6, ['sofia', 'savra', 'thessalonica', 'towns']],
  [1387.1, ['karaman', 'plocnik']],
  [1388.9, ['bileca', 'bulgaria', 'kosovo-march', 'kosovo']],
  [1389.6, ['after-kosovo']],
];
// the phase pages of the two battle plans show none
const NONE = ['pelekanon-hills', 'pelekanon-philokrene', 'kosovo-lines', 'kosovo-charge', 'kosovo-bayezid'];
// the Ottoman lands of the last period are the shared zone that opens the next story
const SHARED = { id: 'ottomans-1389', owner: 'ott', en: 'Ottoman state at the death of Murad I, 1389', tr: 'I. Murad’ın ölümünde Osmanlı Devleti, 1389' };

// --- the owners' timelines ---
const history = (id, s) => {
  const t = s.split(/\s+/), steps = [[-Infinity, t[0]]];
  for (let i = 1; i < t.length; i += 2) steps.push([+t[i], t[i + 1]]);
  for (const [, o] of steps) if (o !== '-' && !O[o]) throw new Error(`${id}: unknown owner ${o}`);
  return steps;
};
const ownerAt = (steps, year) => steps.filter(([y]) => y <= year).at(-1)[1];

// --- the towns' areas: the land nearest each town along a raster of the ground, where LINES cost BARRIER km, WATER is
// closed and noise bends the borders; Voronoi cells of sites on a lattice turn them into polygons with shared edges ---
const RES = 0.02, [W0, S0, E0, N0] = BOX, NX = Math.round((E0 - W0) / RES), NY = Math.round((N0 - S0) / RES);
const cellAt = (lon, lat) => { const x = Math.floor((lon - W0) / RES), y = Math.floor((lat - S0) / RES); return x >= 0 && x < NX && y >= 0 && y < NY ? y * NX + x : -1; };
const centre = c => [W0 + (c % NX + 0.5) * RES, S0 + (Math.floor(c / NX) + 0.5) * RES];
const land = new Uint8Array(NX * NY), barrier = new Uint8Array(NX * NY), wall = new Uint8Array(NX * NY);
// the raster cells inside a polygon, by an even-odd fill of its rings row by row
const fill = (geometry, grid, value = 1) => {
  const rows = Array.from({ length: NY }, () => []);
  for (const p of polysOf(geometry)) for (const ring of p) for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i], [x2, y2] = ring[i + 1];
    if (y1 === y2) continue;
    for (let r = Math.max(0, Math.ceil((Math.min(y1, y2) - S0) / RES - 0.5)); r < NY; r++) {
      const yc = S0 + (r + 0.5) * RES;
      if (yc >= Math.max(y1, y2)) break;
      if (yc >= Math.min(y1, y2)) rows[r].push(x1 + (yc - y1) * (x2 - x1) / (y2 - y1));
    }
  }
  rows.forEach((xs, r) => {
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) for (let c = Math.max(0, Math.ceil((xs[k] - W0) / RES - 0.5)); c < NX && W0 + (c + 0.5) * RES < xs[k + 1]; c++) grid[r * NX + c] = value;
  });
};
fill(LAND.geometry, land);
// a line as raster cells without diagonal gaps, so no step between two neighbouring cells passes it unseen
const draw = (grid, line) => {
  let prev = -1;
  for (let i = 0; i < line.length - 1; i++) {
    const [a, b] = [line[i], line[i + 1]], n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / (RES / 4));
    for (let k = 0; k <= n; k++) {
      const c = cellAt(a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n);
      if (c < 0 || c === prev) continue;
      if (prev >= 0 && prev % NX !== c % NX && Math.floor(prev / NX) !== Math.floor(c / NX)) grid[Math.floor(prev / NX) * NX + c % NX] = 1;
      grid[c] = 1; prev = c;
    }
  }
};
Object.values(LINES).forEach(l => draw(barrier, l));
for (const pair of RIVER_BORDERS) {
  const key = [...pair].sort().join('|');
  tc.mesh(world, world.objects.countries, (a, b) => a !== b && [a.properties.name, b.properties.name].sort().join('|') === key).coordinates.forEach(l => draw(barrier, l));
}
Object.values(WATER).forEach(l => draw(wall, l));
// the cost of the ground: 1 on average, 0.55 to 1.45 in three octaves of smooth noise, the same on every run
let seed = 1389;
const rand = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
const noise = g => {
  const nx = Math.ceil((E0 - W0) / g) + 2, v = Float32Array.from({ length: nx * (Math.ceil((N0 - S0) / g) + 2) }, () => rand() * 2 - 1);
  return (lon, lat) => {
    const fx = (lon - W0) / g, fy = (lat - S0) / g, x = Math.floor(fx), y = Math.floor(fy), s = fx - x, t = fy - y;
    const u = s * s * (3 - 2 * s), w = t * t * (3 - 2 * t), at = (i, j) => v[(y + j) * nx + x + i];
    return (at(0, 0) * (1 - u) + at(1, 0) * u) * (1 - w) + (at(0, 1) * (1 - u) + at(1, 1) * u) * w;
  };
};
const octaves = [[noise(0.5), 0.55], [noise(0.2), 0.3], [noise(0.08), 0.15]];
const cost = new Float32Array(NX * NY);
for (let c = 0; c < NX * NY; c++) if (land[c]) { const [x, y] = centre(c); cost[c] = 1 + 0.45 * octaves.reduce((sum, [f, a]) => sum + a * f(x, y), 0); }

// the towns, each from the land cell nearest to it that is not on a line
const towns = Object.entries(T).map(([id, [lon, lat, h]]) => ({ id, at: [lon, lat], steps: history(id, h) }));
const free = c => c >= 0 && land[c] && !barrier[c] && !wall[c];
const snap = ([lon, lat]) => {
  const c0 = cellAt(lon, lat);
  if (free(c0)) return c0;
  const x0 = c0 % NX, y0 = Math.floor(c0 / NX);
  let best = -1, bd = Infinity;
  for (let r = 1; r <= 20; r++) {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      const x = x0 + dx, y = y0 + dy, c = y * NX + x;
      if (x < 0 || y < 0 || x >= NX || y >= NY || !free(c)) continue;
      const [cx, cy] = centre(c), d = Math.hypot((cx - lon) * Math.cos(lat * Math.PI / 180), cy - lat);
      if (d < bd) { bd = d; best = c; }
    }
    if (best >= 0 && r * RES > bd + RES) break;
  }
  return best;
};
const owner = new Int32Array(NX * NY).fill(-1), dist = new Float32Array(NX * NY).fill(Infinity);
const hk = [], hv = [];
const push = (k, v) => {
  let i = hk.length; hk.push(k); hv.push(v);
  while (i > 0) { const p = (i - 1) >> 1; if (hk[p] <= k) break; hk[i] = hk[p]; hv[i] = hv[p]; i = p; }
  hk[i] = k; hv[i] = v;
};
const pop = () => {
  const k = hk[0], v = hv[0], lk = hk.pop(), lv = hv.pop();
  if (hk.length) {
    let i = 0;
    for (;;) { let c = 2 * i + 1; if (c >= hk.length) break; if (c + 1 < hk.length && hk[c + 1] < hk[c]) c++; if (hk[c] >= lk) break; hk[i] = hk[c]; hv[i] = hv[c]; i = c; }
    hk[i] = lk; hv[i] = lv;
  }
  return [k, v];
};
towns.forEach((t, k) => {
  const c = snap(t.at);
  if (c < 0) { problems.push(`town ${t.id}: no land within ${20 * RES} degrees`); return; }
  const [cx, cy] = centre(c), off = turf.distance(t.at, [cx, cy]);
  if (off > 4) console.log(`  town ${t.id} starts ${off.toFixed(1)} km from its point`);
  if (owner[c] >= 0) problems.push(`towns ${t.id} and ${towns[owner[c]].id} start in one cell`);
  t.cell = c; owner[c] = k; dist[c] = 0; push(0, c);
});
const kmY = RES * 110.57;
while (hk.length) {
  const [d, c] = pop();
  if (d > dist[c]) continue;
  const x = c % NX, y = (c - x) / NX, kx = RES * 111.32 * Math.cos((S0 + (y + 0.5) * RES) * Math.PI / 180);
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const nx = x + dx, ny = y + dy, n = ny * NX + nx;
    if ((!dx && !dy) || nx < 0 || ny < 0 || nx >= NX || ny >= NY || !land[n] || wall[n]) continue;
    const nd = d + Math.hypot(dx * kx, dy * kmY) * (cost[c] + cost[n]) / 2 + (barrier[n] && !barrier[c] ? BARRIER : 0);
    if (nd < dist[n]) { dist[n] = nd; owner[n] = owner[c]; push(nd, n); }
  }
}
// land no town reaches, an island without a town of its own: the town nearest to it
const nearestTown = ([lon, lat]) => towns.reduce((b, t, k) => { const d = Math.hypot((t.at[0] - lon) * Math.cos(lat * Math.PI / 180), t.at[1] - lat); return d < b[1] ? [k, d] : b; }, [-1, Infinity])[0];
for (let c = 0; c < NX * NY; c++) if (land[c] && owner[c] < 0) owner[c] = nearestTown(centre(c));

// the sites: a jittered lattice over the land, finer where pages look closely, points along narrow waters, the towns
const ownerNear = (lon, lat) => {
  const c0 = cellAt(lon, lat);
  if (c0 >= 0 && owner[c0] >= 0 && !barrier[c0]) return owner[c0];
  const x0 = c0 % NX, y0 = Math.floor(c0 / NX);
  for (let r = 1; r <= 4; r++) {
    let best = -1, bd = Infinity;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const x = x0 + dx, y = y0 + dy, c = y * NX + x;
      if (x < 0 || y < 0 || x >= NX || y >= NY || owner[c] < 0 || barrier[c]) continue;
      const [cx, cy] = centre(c), d = Math.hypot(cx - lon, cy - lat);
      if (d < bd) { bd = d; best = owner[c]; }
    }
    if (best >= 0) return best;
  }
  return c0 >= 0 && owner[c0] >= 0 ? owner[c0] : nearestTown([lon, lat]);
};
const sites = new Map(), site = (lon, lat, k) => { const key = `${lon.toFixed(6)},${lat.toFixed(6)}`; if (!sites.has(key)) sites.set(key, [lon, lat, k]); return key; };
const lattice = ([w, s, e, n], step, skip) => {
  for (let lat = s; lat < n; lat += step) for (let lon = w; lon < e; lon += step / Math.cos(lat * Math.PI / 180) * 0.8) {
    const x = lon + (rand() - 0.5) * step * 0.6, y = lat + (rand() - 0.5) * step * 0.6, c = cellAt(x, y);
    if (c >= 0 && land[c] && !(skip && skip(x, y))) site(x, y, ownerNear(x, y));
  }
};
const inBox = ([w, s, e, n]) => (x, y) => x >= w && x <= e && y >= s && y <= n;
lattice([W0, S0, E0, N0], LATTICE, (x, y) => FINE.some(([b]) => inBox(b)(x, y)));
for (const [b, step] of FINE) lattice(b, step);
{
  // coast points every 0.03 degrees where another shore lies within 0.12 degrees across water, so a site on one shore
  // does not take land on the other
  const pts = [];
  for (const p of polysOf(LAND.geometry)) for (const ring of p) for (let i = 0; i < ring.length - 1; i++) {
    const [a, b] = [ring[i], ring[i + 1]], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.03));
    for (let k = 0; k < n; k++) pts.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
  }
  const grid = new Map(), gk = (x, y) => `${Math.floor(x / 0.12)},${Math.floor(y / 0.12)}`;
  pts.forEach((p, i) => { const k = gk(...p); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(i); });
  const sea = (x, y) => { const c = cellAt(x, y); return c >= 0 && !land[c]; };
  pts.forEach(([x, y]) => {
    for (let gx = -1; gx <= 1; gx++) for (let gy = -1; gy <= 1; gy++) for (const j of grid.get(`${Math.floor(x / 0.12) + gx},${Math.floor(y / 0.12) + gy}`) ?? []) {
      const [u, v] = pts[j], d = Math.hypot(u - x, v - y);
      if (d < 0.03 || d > 0.12) continue;
      if (sea((x + u) / 2, (y + v) / 2) && sea((3 * x + u) / 4, (3 * y + v) / 4) && sea((x + 3 * u) / 4, (y + 3 * v) / 4)) { site(x, y, ownerNear(x, y)); return; }
    }
  });
}
towns.forEach((t, k) => { if (t.cell !== undefined) { t.site = site(...centre(t.cell), k); } });
const townIdx = Object.fromEntries(towns.map((t, k) => [t.id, k]));
for (const [id, [lon, lat, t]] of Object.entries(SEA)) { if (!(t in townIdx)) throw new Error(`sea site ${id}: no town ${t}`); site(lon, lat, townIdx[t]); }
// the small places, drawn by a fine grid of sites of their own inside them and a ring of their neighbours' sites
const units = [...towns, ...Object.entries(SMALL).map(([id, [ring, h]]) => ({ id, small: poly(ring), steps: history(id, h) }))];
units.forEach((u, k) => {
  if (!u.small) return;
  const [w, s, e, n] = turf.bbox(u.small), step = Math.max(e - w, n - s) / 8;
  u.at = turf.centroid(u.small).geometry.coordinates;
  for (const [key, [x, y]] of sites) if (x > w - 3 * step && x < e + 3 * step && y > s - 3 * step && y < n + 3 * step) sites.delete(key);
  for (let y = s - 2 * step; y <= n + 2 * step + 1e-9; y += step) for (let x = w - 2 * step; x <= e + 2 * step + 1e-9; x += step)
    site(x, y, turf.booleanPointInPolygon([x, y], u.small) ? k : ownerNear(x, y));
});
const siteList = [...sites.values()];
console.log(`  ${siteList.length} sites`);

// the Voronoi cells of the sites in one topology; a zone is its units' cells merged
const vor = turf.voronoi(fc(siteList.map(s => turf.point([s[0], s[1]]))), { bbox: BOX });
const vcells = [], vunit = [];
vor.features.forEach((f, i) => { if (f) { vcells.push(f); vunit.push(siteList[i][2]); } });
const topo = ts.topology({ c: fc(vcells) }), unitGeoms = units.map(() => []);
// cells a unit holds apart from its own area, where the lattice samples a thin strip of the raster, go to the unit
// around them; a unit's own area is the piece with its town, else its largest
{
  const nb = tc.neighbors(topo.objects.c.geometries), keyIndex = new Map();
  vor.features.forEach((f, i) => { if (f) keyIndex.set(`${siteList[i][0].toFixed(6)},${siteList[i][1].toFixed(6)}`, keyIndex.size); });
  for (let pass = 0; pass < 4; pass++) {
    const seen = new Int32Array(vunit.length).fill(-1), pieces = [];
    for (let i = 0; i < vunit.length; i++) {
      if (seen[i] >= 0) continue;
      const piece = [i]; seen[i] = pieces.length;
      for (let j = 0; j < piece.length; j++) for (const n of nb[piece[j]]) if (seen[n] < 0 && vunit[n] === vunit[i]) { seen[n] = pieces.length; piece.push(n); }
      pieces.push(piece);
    }
    const main = new Map();
    pieces.forEach((p, k) => { const u = vunit[p[0]], t = units[u].site && keyIndex.get(units[u].site); if (t !== undefined && seen[t] === k) main.set(u, k); });
    pieces.forEach((p, k) => { const u = vunit[p[0]]; if (!main.has(u) || main.get(u) !== k && pieces[main.get(u)].length < p.length && !units[u].site) main.set(u, k); });
    let moved = 0;
    pieces.forEach((p, k) => {
      if (main.get(vunit[p[0]]) === k || p.length > 25) return;
      const votes = new Map();
      for (const i of p) for (const n of nb[i]) if (seen[n] !== k) votes.set(vunit[n], (votes.get(vunit[n]) ?? 0) + 1);
      const to = [...votes].sort((a, b) => b[1] - a[1])[0]?.[0];
      if (to !== undefined) { for (const i of p) vunit[i] = to; moved++; }
    });
    if (!moved) break;
  }
}
topo.objects.c.geometries.forEach((g, i) => unitGeoms[vunit[i]].push(g));
units.forEach((u, k) => { if (!unitGeoms[k].length) problems.push(`${u.id} has no area`); });

// --- the zones of each period: its owners' cells merged, one polygon per zone ---
const Z = {}, byKey = {};
const nameAt = (o, year) => O[o][2].filter(n => n.from <= year).at(-1);
const periodZones = PERIODS.map(([year, pages, set = {}]) => {
  const owned = {};
  units.forEach((u, k) => { const o = set[u.id] ?? ownerAt(u.steps, year); if (o !== '-') (owned[o] ??= []).push(k); });
  const ids = [];
  for (const [o, idx] of Object.entries(owned)) {
    const merged = tc.merge(topo, idx.flatMap(k => unitGeoms[k]));
    const parts = merged.coordinates.map(p => ({ p, a: km2(turf.polygon(p)) })).sort((x, y) => y.a - x.a);
    if (parts.length > 1) problems.push(`${year} ${o}: ${parts.length} pieces, ${parts.map(x => `${Math.round(x.a)} km2 at ${turf.centroid(turf.polygon(x.p)).geometry.coordinates.map(v => v.toFixed(2))}`).join('; ')}`);
    const name = nameAt(o, year), members = idx.map(k => units[k].id).sort();
    const key = `${o}|${name.en}|${members.join(',')}`;
    if (!byKey[key]) {
      let id = `${name.id ?? O[o][1]}-${Math.floor(year)}`;
      while (Z[id]) id = id.replace(/(-\d+)([a-z]?)$/, (_, y, s) => y + (s ? String.fromCharCode(s.charCodeAt(0) + 1) : 'b'));
      Z[id] = { id, owner: o, family: O[o][0], name, towns: members, geometry: { type: 'Polygon', coordinates: parts[0].p } };
      byKey[key] = id;
    }
    ids.push(byKey[key]);
  }
  return { year, pages, ids };
});

// the shared Ottoman zone: the last period's Ottoman lands. An earlier period with the same outline names it under its
// own id and name, an alias in shared/zones.yaml
const last = periodZones.at(-1), lastOtt = last.ids.find(id => Z[id].owner === SHARED.owner);
const sharedTowns = Z[lastOtt].towns.join(','), aliases = {};
for (const p of periodZones) p.ids = p.ids.map(id => {
  if (Z[id].owner !== SHARED.owner || Z[id].towns.join(',') !== sharedTowns) return id;
  if (p === last) return SHARED.id;
  aliases[id] = Z[id];
  return id;
});

// --- the legend: a page lists the zones with at least 1% of the land inside its frame, without the distant states its
// text does not name; Wallachia is distant from the pages on Anatolia ---
const DISTANT = { cyprus: /Cyprus/, mamluks: /Mamluk/, armenia: /Armenia/, georgia: /Georgia/, trebizond: /Trebizond/,
  wallachia: /Wallachia|Mircea|Basarab|Vladislav|Radu/ };
const distant = (owner, box) => owner in DISTANT && (owner !== 'wallachia' || (box[0] + box[2]) / 2 > 27);
// a zone under 1% stays on a page whose text names it
const NAMED = { galata: /Galata|Pera\b/, smyrna: /harbour castle/, chios: /Chios/, phocaea: /Phocaea/, lesbos: /Lesbos|Gattilusi/, tenedos: /Tenedos/,
  amastris: /Amastris/, ainos: /Ainos/, byzgal: /Gallipoli/, phil: /Philadelphia/, byzkara: /Karacahisar/, rhodes: /Rhodes|Knights/,
  negroponte: /Negroponte|Euboea/, crete: /Crete/, messenia: /Modon|Coron/, nauplia: /Nauplia/, corfu: /Corfu/, morea: /Morea|Mystras/,
  byznicaea: /Nicaea/, byzbursa: /Bursa|Prusa/, byzhermos: /Magnesia|Hermos/, thes: /Thessalonica/, epirus: /Epirus|\bArta\b/ };
// on a crowded page small states join into one zone named for the group: [family, id, English, Turkish, owners]. A page
// that is about them shows them one by one
const LUMPS = {
  byzantines: ['byzantium', 'byzantine-lands', 'Byzantine Empire and its despotates', 'Bizans İmparatorluğu ve despotlukları', ['byz', 'thes', 'morea', 'byzgal', 'byzthessaly', 'byzisl', 'phil', 'byzhermos', 'byznicaea', 'byzbursa', 'byzkara']],
  serbs: ['serbia', 'serbian-lords', 'Serbian Empire and its lords', 'Sırp İmparatorluğu ve beyleri', ['serbia', 'vukasin', 'ugljesa', 'simeon', 'valona', 'jovanuros', 'ioannina', 'marko', 'dragas', 'lazar', 'vuk']],
  albanians: ['albanian-lords', 'albanian-lords', 'Albanian and Epirote lords', 'Arnavut ve Epir beyleri', ['zeta', 'zvalona', 'komnina', 'thopia', 'gropa', 'arta', 'zenebishi', 'ioannina', 'buondelmonti']],
  turks: ['beyliks', 'beyliks', 'Turkish beyliks of Anatolia', 'Anadolu’daki Türk beylikleri', ['germiyan', 'karesi', 'saruhan', 'aydin', 'mentese', 'hamid', 'teke', 'esref', 'candar']],
  bulgars: ['bulgaria', 'bulgarian-tsardoms', 'Bulgarian tsardoms of Tarnovo and Vidin', 'Tırnova ve Vidin Bulgar çarlıkları', ['bulgaria', 'vidin']],
  otherAlbanians: ['albanian-lords', 'albanian-lords', 'Albanian lords', 'Arnavut beyleri', ['zvalona', 'komnina', 'thopia', 'gropa', 'arta', 'zenebishi']],
  otherTurks: ['beyliks', 'other-beyliks', 'Other Turkish beyliks', 'Öteki Türk beylikleri', ['saruhan', 'aydin', 'mentese', 'hamid', 'teke', 'esref', 'candar']],
  venetians: ['venice', 'venetian-colonies', 'Venetian colonies', 'Venedik kolonileri', ['crete', 'negroponte', 'messenia', 'tenedos', 'dalmatia', 'istria', 'archipelago', 'corfu', 'nauplia']],
  genoese: ['genoa', 'genoese-colonies', 'Genoese colonies', 'Ceneviz kolonileri', ['galata', 'chios', 'phocaea', 'lesbos', 'ainos', 'amastris']],
  latins: ['latin-lords', 'latin-lords', 'Latin lords of Greece', 'Yunanistan’daki Latin beyleri', ['achaea', 'acciaioli', 'athenspre', 'athens']],
  colonies: ['venice', 'latin-colonies', 'Venetian, Genoese and Hospitaller colonies', 'Venedik, Ceneviz ve Hospitalier kolonileri',
    ['crete', 'negroponte', 'messenia', 'tenedos', 'dalmatia', 'istria', 'archipelago', 'corfu', 'nauplia', 'galata', 'chios', 'phocaea', 'lesbos', 'ainos', 'amastris', 'rhodes', 'smyrna']],
};
const LUMPED = {
  amadeus: ['byzantines', 'serbs', 'albanians', 'turks', 'colonies', 'latins'],
  'after-kosovo': ['byzantines', 'albanians', 'turks', 'bulgars', 'colonies', 'latins'],
  catalans: ['otherTurks', 'byzantines', 'colonies'], vassals: ['byzantines', 'otherAlbanians'],
};
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const pageDir = Object.fromEntries(walk(path.join(story, 'pages')).filter(f => f.endsWith('page.yaml')).map(f => [path.basename(path.dirname(f)).replace(/^\d+-/, ''), path.dirname(f)]));
const BBOX = Object.fromEntries(Object.entries(pageDir).map(([p, d]) => [p, fs.readFileSync(path.join(d, 'page.yaml'), 'utf8').match(/^bbox:\s*\[([^\]]*)\]/m)[1].split(',').map(Number)]));
const textOf = p => { const f = path.join(pageDir[p], 'text', 'en.md'); return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : ''; };
const townIndex = Object.fromEntries(towns.map((t, k) => [t.id, k]));
const smallLand = Object.fromEntries(units.filter(u => u.small).map(u => [u.id, { at: u.at, km: km2(I(u.small, landNear(u.small))) }]));
// each town's land in km2
const landOf = new Float64Array(towns.length);
for (let c = 0; c < NX * NY; c++) if (land[c]) landOf[owner[c]] += RES * 111.32 * Math.cos((S0 + (Math.floor(c / NX) + 0.5) * RES) * Math.PI / 180) * RES * 110.57;
// the land inside a frame, in km2, in all and by town
const landIn = ([w, s, e, n]) => {
  const by = new Float64Array(towns.length);
  let total = 0;
  for (let y = Math.max(0, Math.floor((s - S0) / RES)); y < Math.min(NY, Math.ceil((n - S0) / RES)); y++) {
    const a = RES * 111.32 * Math.cos((S0 + (y + 0.5) * RES) * Math.PI / 180) * RES * 110.57;
    for (let x = Math.max(0, Math.floor((w - W0) / RES)); x < Math.min(NX, Math.ceil((e - W0) / RES)); x++) {
      const c = y * NX + x;
      if (land[c]) { total += a; by[owner[c]] += a; }
    }
  }
  return { by, total };
};
const zoneOf = id => id === SHARED.id ? Z[lastOtt] : Z[id];
// a lump: its members' cells merged. The parts of one state stay apart as the parts of one zone; a group of states
// has the parts the sea does not join linked by corridors through open water
const clear = new Uint8Array(NX * NY);
for (let c = 0; c < NX * NY; c++) if (!land[c]) {
  const x = c % NX, y = (c - x) / NX;
  let open = 2;
  for (let dy = -2; dy <= 2 && open; dy++) for (let dx = -2; dx <= 2; dx++) { const n = (y + dy) * NX + x + dx; if (n >= 0 && n < NX * NY && land[n]) { open = Math.max(Math.abs(dx), Math.abs(dy)) - 1; if (!open) break; } }
  clear[c] = 1 + open;
}
// the straits narrower than the raster stay open to corridors
{ const strait = new Uint8Array(NX * NY); Object.values(WATER).forEach(l => draw(strait, l)); for (let c = 0; c < NX * NY; c++) if (strait[c]) clear[c] = Math.max(clear[c], 1); }
const seaPath = (from, to) => {
  const a = new Uint8Array(NX * NY), b = new Uint8Array(NX * NY);
  fill(from.geometry, a); fill(to.geometry, b);
  for (const need of [3, 2, 1]) {
    const prev = new Int32Array(NX * NY).fill(-2), queue = [];
    for (let c = 0; c < NX * NY; c++) if (a[c] && clear[c] >= need) { prev[c] = -1; queue.push(c); }
    for (let i = 0; i < queue.length; i++) {
      const c = queue[i];
      if (b[c]) { const path = []; for (let k = c; k >= 0; k = prev[k]) path.push(centre(k)); return path.length > 1 ? path : [path[0], [path[0][0] + RES / 10, path[0][1]]]; }
      const x = c % NX, y = (c - x) / NX;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const n = (y + dy) * NX + x + dx; if (x + dx >= 0 && x + dx < NX && y + dy >= 0 && y + dy < NY && prev[n] === -2 && clear[n] >= need) { prev[n] = c; queue.push(n); } }
    }
  }
  return null;
};
const lumpKeys = {};
// a member of a group the sea cannot reach, an inland enclave, stays out of the lump
const lump = (key, family, base, en, tr, members, year) => {
  const k = `${key}|${members.join(',')}`;
  if (lumpKeys[k]) return lumpKeys[k];
  const oneState = members.every(m => zoneOf(m).family === family);
  let inside = [...members], shape;
  for (;;) {
    const towns = [...new Set(inside.flatMap(m => zoneOf(m).towns))];
    const parts = tc.merge(topo, towns.flatMap(t => unitGeoms[units.findIndex(u => u.id === t)])).coordinates.map(c => turf.polygon(c)).sort((x, y) => km2(y) - km2(x));
    if (oneState) { shape = parts.length > 1 ? turf.multiPolygon(parts.map(q => q.geometry.coordinates)) : parts[0]; break; }
    shape = parts[0];
    const cut = [];
    for (const part of parts.slice(1)) {
      const path = seaPath(shape, part);
      if (path) { shape = U(shape, part, turf.buffer(turf.lineString(path), 0.7, { units: 'kilometers', steps: 4 })); continue; }
      const at = turf.pointOnFeature(part);
      cut.push(...inside.filter(m => turf.booleanPointInPolygon(at, zoneOf(m).geometry)));
    }
    if (!cut.length) break;
    inside = inside.filter(m => !cut.includes(m));
  }
  if (inside.length < 2) return lumpKeys[k] = { id: null, members: [] };
  if (!oneState && shape.geometry.type !== 'Polygon') problems.push(`${base}-${year}: ${shape.geometry.coordinates.length} pieces after the corridors`);
  let id = `${base}-${year}`;
  while (Z[id]) id = id.replace(/(-\d+)([a-z]?)$/, (_, y, s) => y + (s ? String.fromCharCode(s.charCodeAt(0) + 1) : 'b'));
  Z[id] = { id, owner: key, family, name: { en, tr }, towns: [...new Set(inside.flatMap(m => zoneOf(m).towns))].sort(), geometry: shape.geometry };
  return lumpKeys[k] = { id, members: inside };
};
const order = Object.keys(storyYaml.families);
const PAGES = {}, SHARES = {};
for (const { year, pages, ids } of periodZones) for (const p of pages) {
  if (!BBOX[p]) throw new Error(`no page ${p}`);
  const box = BBOX[p], { by, total } = landIn(box), text = textOf(p);
  const share = id => zoneOf(id).towns.reduce((sum, t) => sum + (t in townIndex ? by[townIndex[t]]
    : inBox(box)(...smallLand[t].at) ? smallLand[t].km : 0), 0) / total;
  const whole = id => zoneOf(id).towns.reduce((sum, t) => sum + (t in townIndex ? landOf[townIndex[t]] : smallLand[t].km), 0) * 0.9 <= share(id) * total;
  PAGES[p] = ids.filter(id => {
    const z = zoneOf(id), sh = share(id);
    if (distant(z.owner, box) && !DISTANT[z.owner].test(text)) return false;
    return sh >= 0.01 || sh > 0 && NAMED[z.owner]?.test(text) || sh >= 0.001 && whole(id);
  });
  for (const key of LUMPED[p] ?? []) {
    // all the lump's states of the period join, those outside the frame too, so the lump keeps the land that links them
    const [family, base, en, tr, owners] = LUMPS[key], members = ids.filter(id => owners.includes(zoneOf(id).owner));
    if (members.filter(m => share(m) > 0).length < 2) continue;
    const { id, members: inside } = lump(key, family, base, en, tr, members, Math.floor(year));
    if (!id) continue;
    PAGES[p] = PAGES[p].filter(x => !inside.includes(x));
    if (inside.reduce((sum, m) => sum + share(m), 0) >= 0.0025) PAGES[p].push(id);
  }
  // a family is one state, so its zones on a page join into one zone of several parts, under the name of its first
  // owner in O
  const shownOf = f => PAGES[p].filter(id => zoneOf(id).family === f);
  for (const family of new Set(PAGES[p].map(id => zoneOf(id).family))) {
    if (shownOf(family).length < 2) continue;
    const members = ids.filter(id => zoneOf(id).family === family && !LUMPED[p]?.some(k => LUMPS[k][4].includes(zoneOf(id).owner)));
    const first = Object.keys(O).find(o => members.some(m => zoneOf(m).owner === o)), name = nameAt(first, year);
    const { id, members: inside } = lump(`one ${family}`, family, name.id ?? O[first][1], name.en, name.tr, members, Math.floor(year));
    if (id) PAGES[p] = [...PAGES[p].filter(x => !inside.includes(x)), id];
    if (shownOf(family).length > 1) problems.push(`page ${p}: family ${family} has the zones ${shownOf(family).join(', ')}`);
  }
  PAGES[p].sort((a, b) => order.indexOf(zoneOf(a).family) - order.indexOf(zoneOf(b).family));
}
for (const p of NONE) { if (!BBOX[p]) throw new Error(`no page ${p}`); PAGES[p] = []; }
for (const p of Object.keys(BBOX)) if (!PAGES[p]) problems.push(`page ${p} has no period`);
if (process.argv.includes('--legends')) for (const [p, ids] of Object.entries(PAGES)) console.log(`  ${p}: ${ids.length}`);

// --- the outlines: every zone a page shows, simplified together in one topology so an edge two zones share stays one
// line. The lattice's small steps go, then long edges get a point every DENSE degrees so corner rounding stays local
const SIMPLIFY = 0.0003, DENSE = 0.1;
const used = [...new Set(Object.values(PAGES).flat())], drawn = used.filter(id => !aliases[id]);
for (const id of used) if (!storyYaml.families[zoneOf(id).family]) problems.push(`zone ${id}: family ${zoneOf(id).family} is not in story.yaml`);
const joint = ts.topology({ z: fc(drawn.map(id => ({ type: 'Feature', id, properties: {}, geometry: zoneOf(id).geometry }))) });
const simple = tsi.simplify(tsi.presimplify(joint, t => tsi.planarTriangleArea(t) / Math.cos(t[1][1] * Math.PI / 180)), SIMPLIFY);
simple.arcs = simple.arcs.map(arc => {
  const a = arc.map(p => [p[0], p[1]]), r = [a[0]];
  for (let i = 1; i < a.length; i++) {
    const p = a[i - 1], q = a[i], n = Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / DENSE);
    for (let k = 1; k < n; k++) r.push([p[0] + (q[0] - p[0]) * k / n, p[1] + (q[1] - p[1]) * k / n]);
    r.push(q);
  }
  return r;
});
const shapes = Object.fromEntries(simple.objects.z.geometries.map(g => [g.id, tc.feature(simple, g).geometry]));
for (const [id, g] of Object.entries(shapes)) if (!polysOf(g).length || polysOf(g).some(q => q[0].length < 4)) problems.push(`zone ${id}: ${g.type} after simplifying`);

if (problems.length) { console.log(problems.map(p => '  ' + p).join('\n')); if (!process.argv.includes('--anyway')) process.exit(1); }

// --- write: the story's zones, the shared zone with its Turkish name, the aliases, the page map, the Turkish names ---
const round = c => typeof c[0] === 'number' ? [+c[0].toFixed(5), +c[1].toFixed(5)] : c.map(round);
const feature = (id, props) => ({ type: 'Feature', properties: props, geometry: { type: shapes[id].type, coordinates: round(shapes[id].coordinates) } });
const dir = path.join(story, 'shared', 'zones');
fs.mkdirSync(dir, { recursive: true });
for (const f of fs.readdirSync(dir)) if (f.endsWith('.geojson')) fs.rmSync(path.join(dir, f));
for (const id of drawn) if (id !== SHARED.id) fs.writeFileSync(path.join(dir, id + '.geojson'), JSON.stringify(feature(id, { family: Z[id].family, name: Z[id].name.en })) + '\n');
const sharedDir = path.join(content, 'shared', 'zones', SHARED.id);
fs.mkdirSync(path.join(sharedDir, 'i18n'), { recursive: true });
fs.writeFileSync(path.join(sharedDir, 'zone.geojson'), JSON.stringify(feature(SHARED.id, { family: O[SHARED.owner][0], name: SHARED.en })) + '\n');
fs.writeFileSync(path.join(sharedDir, 'i18n', 'tr.yaml'), `zone.name: ${JSON.stringify(SHARED.tr)}\n`);
const usedAliases = Object.values(aliases).filter(z => used.includes(z.id));
const aliasFile = path.join(story, 'shared', 'zones.yaml');
if (usedAliases.length) fs.writeFileSync(aliasFile, '# The Ottoman lands of these years have the outline of the shared zone of 1389. Written by .plans/zones.mjs.\n'
  + usedAliases.map(z => `${z.id}: { zone: ${SHARED.id}, name: ${JSON.stringify(z.name.en)} }`).join('\n') + '\n');
else fs.rmSync(aliasFile, { force: true });
fs.writeFileSync(path.join(story, '.plans', 'zones.yaml'), '# Zones per page, written by .plans/zones.mjs. The phase pages of the battle plans show none.\n'
  + Object.entries(PAGES).map(([p, ids]) => `${p}: [${ids.join(', ')}]`).join('\n') + '\n');
fs.mkdirSync(path.join(story, '.i18n-parts'), { recursive: true });
fs.writeFileSync(path.join(story, '.i18n-parts', 'zones.tr.yaml'), used.filter(id => id !== SHARED.id)
  .map(id => `zones.${id}.name: ${JSON.stringify(Z[id].name.tr)}`).join('\n') + '\n');
console.log(`${used.length} zones on ${Object.values(PAGES).filter(l => l.length).length} pages, the longest legend ${Math.max(...Object.values(PAGES).map(l => l.length))}`);
