// The political map: one set of zones per period, written to shared/zones/, with the page map in .plans/zones.yaml,
// the zones line of each page.yaml and the Turkish names in .i18n-parts/zones.tr.yaml. Run from the repo root:
//   node content/ottoman/ottoman-bayezid-i-mehmed-i/.plans/zones.mjs
// Each town has an owners' timeline and an area, the land nearest to it along the ground; a period's zones are its
// owners' areas joined in one topology. The first page shows the Ottoman lands of 1389 that story 1 ends on, and the
// Ottoman lands of 1402 and 1421 go to content/shared/zones/ for the stories of Timur and Murad II.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
// turf, topojson and the world atlas come with harita, linked or installed
const hreq = createRequire(require.resolve('@openbooknetwork/harita/package.json'));
const turf = hreq('@turf/turf'), tc = hreq('topojson-client'), ts = hreq('topojson-server'), tsi = hreq('topojson-simplify'), world = hreq('world-atlas/countries-10m.json');
const yaml = hreq('js-yaml');
const story = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const content = path.resolve(story, '..', '..');
const repo = path.resolve(content, '..');

// --- geometry helpers, Features in and out ---
const BOX = [12, 29.5, 53, 50];
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
const country = n => { const f = countries.find(c => c.properties.name === n); if (!f) throw new Error(`no country ${n}`); return f; };
// a clip to the box can leave rings of fewer than four points where a country only touches its edge
const LAND = U(storyYaml.land.map(n => polysOf(turf.bboxClip(country(n), BOX).geometry).filter(p => p[0]?.length >= 4))
  .filter(p => p.length).map(p => turf.multiPolygon(p)));
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
  vardar: [[21.55, 41.9], [21.78, 41.7], [21.95, 41.58], [22.24, 41.4], [22.5, 41.13], [22.6, 40.9], [22.75, 40.6]],
  morava: [[21.9, 42.55], [21.95, 43.0], [21.88, 43.3], [21.7, 43.54], [21.4, 43.67], [21.38, 43.93], [21.25, 44.2], [21.1, 44.5], [21.05, 44.7]],
  westMorava: [[20.03, 43.85], [20.35, 43.9], [20.55, 43.8], [20.69, 43.73], [20.99, 43.62], [21.2, 43.6], [21.38, 43.65]],
  drin: [[20.68, 41.18], [20.5, 41.5], [20.4, 41.85], [20.42, 42.08], [20.15, 42.1], [19.85, 42.05], [19.62, 42.0], [19.55, 41.8]],
  olympus: [[21.15, 39.95], [21.6, 40.05], [22.0, 40.05], [22.35, 40.1], [22.6, 40.0]],
  pindus: [[20.95, 40.3], [21.15, 39.8], [21.25, 39.5], [21.4, 39.15], [21.6, 38.85]],
  sakarya: [[30.17, 40.5], [30.3, 40.55], [30.4, 40.75], [30.55, 40.95], [30.65, 41.12]],
  tmolos: [[27.15, 38.52], [27.45, 38.5], [27.75, 38.38], [28.1, 38.35], [28.45, 38.33], [28.75, 38.4]],
  menderes: [[30.16, 38.07], [29.75, 38.2], [29.4, 38.0], [29.05, 37.9], [28.6, 37.9], [28.2, 37.88], [27.8, 37.82], [27.45, 37.72], [27.25, 37.55]],
  kizilirmak: [[38.4, 39.9], [37.6, 39.8], [37.0, 39.73], [36.3, 39.4], [35.5, 39.0], [34.85, 38.72], [34.3, 38.95], [33.9, 39.25], [33.5, 39.8], [33.6, 40.3], [34.0, 40.75], [34.8, 40.97], [35.5, 41.3], [35.9, 41.57], [36.0, 41.75]],
  ilgaz: [[32.4, 41.0], [32.9, 41.02], [33.3, 41.07], [33.7, 41.1], [34.1, 41.15], [34.4, 41.25], [34.7, 41.3]],
  taurus: [[29.8, 37.15], [30.4, 37.3], [31.0, 37.25], [31.6, 37.15], [32.3, 36.95], [33.0, 37.0], [33.8, 37.25], [34.75, 37.3], [35.3, 37.6], [36.0, 37.9], [36.6, 38.1]],
  euphrates: [[38.5, 39.55], [38.5, 39.25], [38.75, 38.95], [38.9, 38.75], [38.75, 38.55], [38.6, 38.3], [38.55, 38.0], [38.45, 37.65], [38.15, 37.35], [38.0, 37.05],
    [38.02, 36.75], [38.2, 36.45], [38.6, 36.05], [39.05, 35.93], [39.6, 35.7], [40.15, 35.33], [40.6, 34.85], [40.95, 34.4], [41.5, 34.4], [42.0, 34.5], [42.4, 34.1],
    [42.85, 33.65], [43.3, 33.43], [43.75, 33.35], [44.1, 32.95], [44.4, 32.5], [44.9, 31.9], [45.3, 31.3], [46.25, 31.05], [47.0, 30.95], [47.43, 31.0]],
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
  midia: [28.35, 41.78, 'agathopolis'], strandzha: [28.22, 42.08, 'agathopolis'], burgas: [28.0, 42.4, 'agathopolis'], emine: [28.05, 42.7, 'agathopolis'],
};
// the lattice of sites in degrees, finer where pages look closely: Constantinople and its land walls
const LATTICE = 0.07, FINE = [[[28.0, 40.7, 29.5, 41.4], 0.02]];

// --- towns: [lon, lat, owners]. The owner in 1389, then each later owner after the year it takes over; - is no zone.
// A town stands for the country around it up to the next town, so towns sit on both sides of a border that matters.
// The usual courses of the lands of the Ottoman princes, 1402–1413:
const EU = 'ott 1402.6 sul 1411.13 musa 1413.51 ott'; // Ottoman Europe: Süleyman, then Musa
const NW = 'ott 1402.6 isa 1403.3 meh 1404.2 sul 1410.4 meh 1413.51 ott'; // Bithynia, Karesi, Eskişehir
const ANK = 'ott 1402.6 meh 1404.5 sul 1410.4 meh 1413.51 ott'; // Ankara
const RUM = 'ott 1402.6 meh 1413.51 ott'; // Amasya, Tokat, Sivas: Mehmed Çelebi
const THR = 'byz 1394 ott 1402.6 sul 1403.1 byz 1411.3 musa 1413.51 byz'; // the land of Constantinople, ceded in 1403
const MARMARA = 'ott 1402.6 sul 1403.1 byz 1411.3 musa 1413.51 ott'; // Panidos to Selymbria, ceded in 1403
const COAST = 'ott 1402.6 sul 1403.1 thes 1411.3 musa 1413.51 ott'; // the coast from the Strymon to Zetounion, ceded in 1403
const THESSALY = 'byzthessaly 1393.9 ' + EU;
// Dobruja: Mircea's from 1388, Bayezid's from his campaign of 1395, Mircea's again from 1404, Ottoman from 1420
const DOBRUJA = 'wallachia 1395.3 ott 1402.6 sul 1404 wallachia 1420.3 ott';
const T = {
  // Bithynia and Paphlagonia
  sogut: [30.18, 40.02, NW], bozuyuk: [30.04, 39.91, NW], domanic: [29.61, 39.8, NW], inonu: [30.145, 39.815, NW], eskisehir: [30.52, 39.77, NW],
  kulaca: [29.43, 40.03, NW], inegol: [29.51, 40.08, NW], bilecik: [29.98, 40.14, NW], yarhisar: [29.74, 40.19, NW], yenisehir: [29.65, 40.27, NW],
  harmankaya: [30.36, 40.08, NW], koprihisar: [29.85, 40.33, NW], lefke: [30.01, 40.36, NW], mekece: [30.07, 40.44, NW], golpazari: [30.32, 40.29, NW],
  pamukova: [30.17, 40.51, NW], geyve: [30.29, 40.51, NW], tarakli: [30.49, 40.4, NW], goynuk: [30.79, 40.4, NW], mudurnu: [31.21, 40.47, NW],
  kestel: [29.21, 40.2, NW], uludag: [29.15, 40.05, NW], ulubat: [28.43, 40.17, NW], kite: [28.86, 40.21, NW], mudanya: [28.885, 40.375, NW],
  adranos: [28.99, 39.9, NW], karamursel: [29.615, 40.69, NW], hersek: [29.52, 40.7, NW], altinova: [29.4, 40.67, NW], golcuk: [29.83, 40.715, NW],
  bursa: [29.06, 40.185, NW], kios: [29.16, 40.43, NW], orhangazi: [29.31, 40.49, NW], armutlu: [28.83, 40.52, NW], kapakli: [29.0, 40.47, NW],
  gemlikbay: [29.0, 40.33, NW], yalova: [29.27, 40.65, NW], sapanca: [30.27, 40.69, NW], aydos: [29.27, 40.96, NW], kocaelihills: [29.62, 40.93, NW],
  nicaea: [29.72, 40.43, NW], nicomedia: [29.92, 40.765, NW], derince: [29.8, 40.79, NW], hereke: [29.62, 40.79, NW], gebze: [29.43, 40.8, NW],
  tuzla: [29.3, 40.83, NW], kartal: [29.19, 40.9, NW], chrysopolis: [29.03, 41.01, NW], yoros: [29.1, 41.16, NW], omerli: [29.37, 41.05, NW],
  kandira: [30.15, 41.07, NW], agva: [29.85, 41.13, NW], sile: [29.61, 41.175, 'byz 1394 ' + NW], adapazari: [30.4, 40.78, NW], akyazi: [30.62, 40.68, NW],
  karasu: [30.69, 41.08, NW], konuralp: [31.15, 40.9, NW], bolu: [31.6, 40.73, NW], gerede: [32.19, 40.8, NW], nallihan: [31.35, 40.19, NW],
  beypazari: [31.92, 40.17, NW], kizilcahamam: [32.65, 40.47, ANK], ankara: [32.86, 39.94, ANK], polatli: [32.15, 39.58, ANK], kirikkale: [33.52, 39.85, ANK],
  sivrihisar: [31.54, 39.45, 'ott 1402.6 germiyan'], mihaliccik: [31.5, 39.86, NW],
  kalecik: [33.41, 40.1, 'burh 1392.3 ott 1402.6 candar 1417.5 ott'], cankiri: [33.62, 40.6, 'candar 1391.5 ott 1402.6 candar 1417.5 ott'],
  tosya: [34.03, 41.02, 'candar 1391.5 ott 1402.6 candar 1417.5 ott'], safranbolu: [32.69, 41.25, 'candar 1391.5 ott 1402.6 candar'],
  bartin: [32.34, 41.63, 'candar 1391.5 ott 1402.6 candar'], amastris: [32.39, 41.74, 'amastris'], kurucasile: [32.72, 41.83, 'candar 1391.5 ott 1402.6 candar'],
  cide: [33.0, 41.88, 'candar 1391.5 ott 1402.6 candar'], kastamonu: [33.78, 41.38, 'candar 1391.5 ott 1402.6 candar'],
  sinop: [35.15, 42.02, 'candar'], boyabat: [34.77, 41.47, 'candar'], bafra: [35.9, 41.57, 'candar'],
  // central and eastern Anatolia: Kadı Burhaneddin, Canik, Erzincan
  osmancik: [34.8, 41.0, 'burh 1392.3 ' + RUM], corum: [34.95, 40.55, 'burh 1398.6 ' + RUM], amasya: [35.83, 40.65, 'burh 1392.45 ' + RUM],
  tokat: [36.55, 40.31, 'burh 1398.6 ' + RUM], niksar: [36.96, 40.59, 'canik 1398.3 ' + RUM], erbaa: [36.57, 40.69, 'canik 1398.3 ' + RUM],
  resadiye: [37.33, 40.39, 'burh 1398.6 ' + RUM], samsun: [36.33, 41.29, 'canik 1398.3 ott 1402.6 candar 1420.62 ott'],
  carsamba: [36.72, 41.2, 'canik 1398.3 ott 1402.6 canik'], unye: [37.28, 41.13, 'canik 1398.3 ott 1402.6 canik'], ordu: [37.88, 40.98, 'canik 1398.3 ott 1402.6 canik'],
  giresun: [38.39, 40.91, 'treb'], tirebolu: [38.8, 41.0, 'treb'], vakfikebir: [39.27, 41.03, 'treb'], trabzon: [39.72, 41.0, 'treb'], rize: [40.52, 41.02, 'treb'],
  gumushane: [39.48, 40.46, 'erz'], bayburt: [40.23, 40.26, 'erz'], erzincan: [39.5, 39.75, 'erz'], kemah: [38.48, 39.6, 'erz 1401.4 ott 1402.3 erz'],
  tunceli: [39.55, 39.1, 'erz'], ispir: [40.99, 40.48, 'tim'], erzurum: [41.27, 39.9, 'tim'], tortum: [41.55, 40.3, 'tim'], oltu: [41.99, 40.54, 'tim'],
  kars: [43.1, 40.6, 'tim'], agri: [43.05, 39.72, 'tim'], dogubayazit: [44.08, 39.55, 'tim'], igdir: [44.04, 39.92, 'tim'], malazgirt: [42.53, 39.15, 'tim'],
  mus: [41.5, 38.75, 'tim'], ahlat: [42.48, 38.75, 'tim'], van: [43.4, 38.5, 'tim'], bitlis: [42.11, 38.4, 'tim'], hakkari: [43.74, 37.57, 'tim'],
  siirt: [41.94, 37.93, 'tim'], hasankeyf: [41.41, 37.71, 'tim'], cizre: [42.19, 37.33, 'tim'], nusaybin: [41.21, 37.08, 'tim'], mardin: [40.74, 37.31, 'tim'],
  sebinkarahisar: [38.42, 40.29, 'burh 1398.6 ' + RUM], sivas: [37.02, 39.75, 'burh 1398.6 ' + RUM], kangal: [37.39, 39.23, 'burh 1398.6 ' + RUM],
  zara: [37.75, 39.9, 'burh 1398.6 ' + RUM], susehri: [38.08, 40.16, 'burh 1398.6 ' + RUM], yozgat: [34.8, 39.82, 'burh 1398.6 ' + RUM],
  kirsehir: [34.16, 39.15, 'burh 1398.6 ' + RUM], kayseri: [35.49, 38.73, 'burh 1398.6 ott 1402.6 karaman'],
  divrigi: [38.11, 39.37, 'dul 1399.7 ott 1402.6 dul'], darende: [37.5, 38.55, 'dul 1399.7 ott 1402.6 dul'],
  malatya: [38.31, 38.35, 'mam 1399.7 ott 1400.7 tim 1402 mam'], kharput: [39.22, 38.67, 'aq'], palu: [39.93, 38.69, 'aq'], bingol: [40.5, 38.88, 'aq'],
  ergani: [39.76, 38.27, 'aq'], diyarbakir: [40.23, 37.91, 'aq'], siverek: [39.32, 37.75, 'aq'],
  // Karaman and Cilicia
  nigde: [34.68, 37.97, 'karaman 1397.8 ott 1402.6 karaman'], aksaray: [34.03, 38.37, 'karaman 1397.8 ott 1402.6 karaman'],
  develi: [35.49, 38.38, 'karaman 1397.8 ott 1402.6 karaman'], kibistra: [34.05, 37.51, 'karaman 1397.8 ott 1402.6 karaman'],
  konya: [32.49, 37.87, 'karaman 1397.8 ott 1402.6 karaman'], ilgin: [31.91, 38.28, 'karaman 1397.8 ott 1402.6 karaman'],
  larende: [33.22, 37.18, 'karaman 1397.8 ott 1402.6 karaman'], ermenek: [32.89, 36.64, 'karaman'], mut: [33.43, 36.64, 'karaman'],
  silifke: [33.93, 36.38, 'karaman'], alanya: [32.0, 36.55, 'karaman'],
  mersin: [34.63, 36.8, 'mam'], tarsus: [34.9, 36.92, 'mam'], adana: [35.32, 37.0, 'mam'], ayas: [35.78, 36.77, 'mam'], sis: [35.82, 37.45, 'mam'],
  lampron: [34.87, 37.27, 'mam'], osmaniye: [36.25, 37.07, 'mam'], maras: [36.93, 37.58, 'dul'], elbistan: [37.2, 38.2, 'dul'],
  adiyaman: [38.28, 37.76, 'dul 1399.7 ott 1402.6 dul'], besni: [37.86, 37.69, 'dul 1399.7 ott 1402.6 dul'], kahta: [38.62, 37.78, 'dul 1399.7 ott 1402.6 dul'],
  // Syria, Palestine and Egypt
  urfa: [38.79, 37.16, 'mam'], harran: [39.03, 36.86, 'mam'], birecik: [37.99, 37.03, 'mam'], antep: [37.38, 37.07, 'mam'], kilis: [37.12, 36.72, 'mam'],
  iskenderun: [36.17, 36.59, 'mam'], antioch: [36.16, 36.2, 'mam'], aleppo: [37.16, 36.2, 'mam'], manbij: [37.95, 36.53, 'mam'], idlib: [36.63, 35.93, 'mam'],
  latakia: [35.78, 35.52, 'mam'], hama: [36.75, 35.13, 'mam'], homs: [36.72, 34.73, 'mam'], tartus: [35.89, 34.89, 'mam'], tripoli: [35.84, 34.43, 'mam'],
  baalbek: [36.2, 34.0, 'mam'], beirut: [35.5, 33.89, 'mam'], sidon: [35.37, 33.56, 'mam'], damascus: [36.3, 33.51, 'mam'], safed: [35.5, 32.96, 'mam'],
  acre: [35.07, 32.93, 'mam'], nablus: [35.26, 32.22, 'mam'], jerusalem: [35.23, 31.78, 'mam'], hebron: [35.1, 31.53, 'mam'], gaza: [34.46, 31.5, 'mam'],
  beersheba: [34.79, 31.25, 'mam'], irbid: [35.85, 32.55, 'mam'], daraa: [36.1, 32.62, 'mam'], suwayda: [36.57, 32.7, 'mam'], amman: [35.93, 31.95, 'mam'],
  azraq: [36.82, 31.83, 'mam'], karak: [35.7, 31.18, 'mam'], maan: [35.73, 30.2, 'mam'], aqaba: [35.0, 29.6, 'mam'], palmyra: [38.27, 34.55, 'mam'],
  raqqa: [39.01, 35.95, 'mam'], deir: [40.14, 35.33, 'mam'], rahba: [40.45, 35.02, 'mam'], abukamal: [40.92, 34.45, 'mam'], hasakah: [40.75, 36.5, 'mam'],
  arish: [33.8, 31.13, 'mam'], nakhl: [33.75, 29.95, 'mam'], suez: [32.55, 29.97, 'mam'], portsaid: [32.3, 31.26, 'mam'], damietta: [31.81, 31.42, 'mam'],
  cairo: [31.24, 30.04, 'mam'], natrun: [30.35, 30.4, 'mam'], alexandria: [29.92, 31.2, 'mam'], matruh: [27.24, 31.35, 'mam'], qattara: [27.5, 30.0, 'mam'],
  // Iraq, Persia and the Caucasus
  ana: [41.98, 34.47, 'jal 1401.55 tim'], hit: [42.83, 33.64, 'jal 1401.55 tim'], ramadi: [43.3, 33.42, 'jal 1401.55 tim'], baghdad: [44.36, 33.34, 'jal 1401.55 tim'],
  baqubah: [44.64, 33.75, 'jal 1401.55 tim'], samarra: [43.88, 34.2, 'jal 1401.55 tim'], karbala: [44.02, 32.6, 'jal 1401.55 tim'], hillah: [44.43, 32.48, 'jal 1401.55 tim'],
  najaf: [44.32, 32.0, 'jal 1401.55 tim'], diwaniyah: [44.92, 31.99, 'jal 1401.55 tim'], kut: [45.82, 32.5, 'jal 1401.55 tim'], amara: [47.15, 31.84, 'jal 1401.55 tim'],
  samawah: [45.29, 31.31, 'jal 1401.55 tim'], nasiriyah: [46.26, 31.04, 'jal 1401.55 tim'], basra: [47.78, 30.5, 'jal 1401.55 tim'],
  // the desert west of the Euphrates: the Mamluks' Syrian steppe, and the Jalayirids' land west of Karbala
  rutba: [40.28, 33.03, 'mam'], nukhaib: [42.28, 32.03, 'jal 1401.55 tim'],
  tikrit: [43.68, 34.6, 'tim'], kirkuk: [44.39, 35.47, 'tim'], khanaqin: [45.38, 34.35, 'tim'], sulaymaniyah: [45.43, 35.56, 'tim'], erbil: [44.01, 36.19, 'tim'],
  mosul: [43.13, 36.34, 'tim'], dohuk: [43.0, 36.87, 'tim'], zakho: [42.68, 37.14, 'tim'], sinjar: [41.88, 36.32, 'tim'],
  tabriz: [46.29, 38.08, 'tim'], ardabil: [48.29, 38.25, 'tim'], astara: [48.87, 38.43, 'tim'], urmia: [45.07, 37.55, 'tim'], khoy: [44.95, 38.55, 'tim'],
  maragheh: [46.24, 37.39, 'tim'], miyaneh: [47.71, 37.42, 'tim'], zanjan: [48.48, 36.68, 'tim'], soltaniyeh: [48.79, 36.43, 'tim'], mahabad: [45.72, 36.77, 'tim'],
  saqqez: [46.27, 36.25, 'tim'], bijar: [47.6, 35.87, 'tim'], sanandaj: [47.0, 35.31, 'tim'], hamadan: [48.51, 34.8, 'tim'], kermanshah: [47.06, 34.31, 'tim'],
  ilam: [46.42, 33.64, 'tim'], khorramabad: [48.36, 33.49, 'tim'], dezful: [48.4, 32.38, 'tim'], ahvaz: [48.67, 31.32, 'tim'],
  rasht: [49.58, 37.28, 'tim'], qazvin: [50.0, 36.27, 'tim'], amol: [52.35, 36.47, 'tim'], tehran: [51.39, 35.69, 'tim'], semnan: [52.9, 35.6, 'tim'],
  qom: [50.88, 34.64, 'tim'], arak: [49.69, 34.09, 'tim'], kashan: [51.44, 33.98, 'tim'], isfahan: [51.67, 32.65, 'tim'], shahrekord: [50.86, 32.33, 'tim'],
  yasuj: [51.59, 30.67, 'tim'], behbahan: [50.24, 30.6, 'tim'], baku: [49.87, 40.41, 'tim'],
  nakhchivan: [45.41, 39.21, 'tim'], yerevan: [44.51, 40.18, 'tim'], gyumri: [43.85, 40.79, 'tim'], sevan: [45.0, 40.4, 'tim'], goris: [46.34, 39.51, 'tim'],
  shusha: [46.75, 39.76, 'tim'], ganja: [46.36, 40.68, 'tim'], barda: [47.12, 40.37, 'tim'], imishli: [48.06, 39.87, 'tim'], salyan: [48.98, 39.6, 'tim'],
  lankaran: [48.85, 38.75, 'tim'], mingachevir: [47.06, 40.76, 'tim'], sheki: [47.17, 41.2, 'tim'], shamakhi: [48.64, 40.63, 'tim'],
  zaqatala: [46.64, 41.63, 'geo'], telavi: [45.47, 41.92, 'geo'], tbilisi: [44.79, 41.69, 'geo'], vanadzor: [44.49, 40.81, 'geo'], gori: [44.11, 41.98, 'geo'],
  akhaltsikhe: [42.98, 41.64, 'geo'], ardahan: [42.7, 41.11, 'geo'], artvin: [41.82, 41.18, 'geo'], batumi: [41.64, 41.64, 'geo'], kutaisi: [42.7, 42.27, 'geo'],
  poti: [41.67, 42.15, 'geo'], sukhumi: [41.0, 43.0, 'geo'], gagra: [40.27, 43.3, 'geo'],
  nicosia: [33.36, 35.17, '-'], famagusta: [33.94, 35.12, '-'], paphos: [32.42, 34.77, '-'], kyrenia: [33.32, 35.34, '-'], karpas: [34.4, 35.6, '-'],
  // western Anatolia: Mysia, Lydia, Ionia, Caria, Phrygia, Pisidia, Lycia
  bandirma: [27.97, 40.35, NW], kyzikos: [27.85, 40.45, NW], marmara: [27.6, 40.62, NW], manyas: [27.97, 40.05, NW], gonen: [27.65, 40.1, NW],
  susurluk: [28.16, 39.91, NW], balikesir: [27.88, 39.65, NW], bigadic: [28.13, 39.39, NW], sindirgi: [28.18, 39.24, NW], dursunbey: [28.63, 39.59, NW],
  biga: [27.24, 40.23, NW], lampsacus: [26.75, 40.32, NW], abydos: [26.45, 40.1, NW], troad: [26.33, 39.79, NW], geyikli: [26.22, 39.8, NW],
  bayramic: [26.62, 39.81, NW], can: [27.05, 40.03, NW], assos: [26.45, 39.52, NW], babakale: [26.15, 39.52, NW], edremit: [27.02, 39.6, NW],
  ayvalik: [26.88, 39.3, NW], cunda: [26.68, 39.33, NW], bergama: [27.18, 39.12, NW], dikili: [26.95, 39.07, NW], candarli: [26.95, 38.93, NW], soma: [27.61, 39.19, NW],
  thyatira: [27.84, 38.92, 'saruhan 1390.6 ott 1402.6 saruhan 1414 ott'], gordes: [28.29, 38.93, 'saruhan 1390.6 ott 1402.6 saruhan 1414 ott'],
  sardis: [28.06, 38.48, 'saruhan 1390.6 ott 1402.6 saruhan 1414 ott'], magnesia: [27.43, 38.61, 'saruhan 1390.6 ott 1402.6 saruhan 1414 ott'],
  menemen: [26.98, 38.6, 'saruhan 1390.6 ott 1402.6 saruhan 1414 ott'], phocaea: [26.8, 38.7, 'phocaea'],
  demirci: [28.66, 39.05, 'germiyan 1390.6 ott 1402.6 germiyan'], simav: [28.98, 39.09, 'ott 1402.6 germiyan'], emet: [29.26, 39.34, 'ott 1402.6 germiyan'],
  tavsanli: [29.49, 39.54, 'ott 1402.6 germiyan'], kutahya: [29.98, 39.42, 'ott 1402.6 germiyan'], altintas: [30.11, 39.06, 'ott 1402.6 germiyan'],
  seyitgazi: [30.69, 39.44, 'ott 1402.6 germiyan'], emirdag: [31.15, 39.02, 'ott 1402.6 germiyan'], gediz: [29.4, 39.0, 'germiyan 1390.6 ott 1402.6 germiyan'],
  usak: [29.4, 38.68, 'germiyan 1390.6 ott 1402.6 germiyan'], kula: [28.65, 38.55, 'germiyan 1390.6 ott 1402.6 germiyan'],
  selendi: [28.87, 38.74, 'germiyan 1390.6 ott 1402.6 germiyan'], esme: [28.97, 38.4, 'germiyan 1390.6 ott 1402.6 germiyan'],
  philadelphia: [28.52, 38.35, 'phil 1390.95 ott 1402.6 germiyan'], denizli: [29.09, 37.78, 'germiyan 1390.6 ott 1402.6 germiyan'],
  acipayam: [29.35, 37.42, 'germiyan 1390.6 ott 1402.6 germiyan'], dinar: [30.16, 38.07, 'germiyan 1390.6 ott 1402.6 germiyan'],
  sandikli: [30.27, 38.46, 'germiyan 1390.6 ott 1402.6 germiyan'], afyon: [30.54, 38.76, 'germiyan 1390.6 ott 1402.6 germiyan'],
  nymphaion: [27.42, 38.43, 'aydin 1390.6 ott 1402.6 aydin 1414.4 ott'], smyrna: [27.2, 38.42, 'aydin 1390.6 ott 1402.6 aydin 1414.4 ott'],
  urla: [26.76, 38.32, 'aydin 1390.6 ott 1402.6 aydin 1414.4 ott'], cesme: [26.32, 38.32, 'aydin 1390.6 ott 1402.6 aydin 1414.4 ott'],
  karaburun: [26.52, 38.62, 'aydin 1390.6 ott 1402.6 aydin 1414.4 ott'], seferihisar: [26.84, 38.2, 'aydin 1390.6 ott 1402.6 aydin 1414.4 ott'],
  ephesus: [27.37, 37.95, 'aydin 1390.6 ott 1402.6 aydin 1414.4 ott'], tire: [27.73, 38.09, 'aydin 1390.6 ott 1402.6 aydin 1414.4 ott'],
  birgi: [27.97, 38.25, 'aydin 1390.6 ott 1402.6 aydin 1414.4 ott'], tralles: [27.84, 37.86, 'aydin 1390.6 ott 1402.6 aydin 1414.4 ott'],
  nazilli: [28.32, 37.91, 'aydin 1390.6 ott 1402.6 aydin 1414.4 ott'], kusadasi: [27.26, 37.86, 'aydin 1390.6 ott 1402.6 aydin 1414.4 ott'],
  turgutreis: [27.27, 37.04, 'mentese 1390.6 ott 1402.6 mentese'], soke: [27.4, 37.75, 'mentese 1390.6 ott 1402.6 mentese'],
  mycale: [27.055, 37.642, 'mentese 1390.6 ott 1402.6 mentese'], miletus: [27.28, 37.53, 'mentese 1390.6 ott 1402.6 mentese'],
  milas: [27.78, 37.32, 'mentese 1390.6 ott 1402.6 mentese'], bodrum: [27.43, 37.04, 'mentese 1390.6 ott 1402.6 mentese'],
  mugla: [28.36, 37.22, 'mentese 1390.6 ott 1402.6 mentese'], marmaris: [28.27, 36.88, 'mentese 1390.6 ott 1402.6 mentese'],
  knidos: [27.45, 36.7, 'mentese 1390.6 ott 1402.6 mentese'], datca: [27.62, 36.74, 'mentese 1390.6 ott 1402.6 mentese'],
  hisaronu: [27.9, 36.77, 'mentese 1390.6 ott 1402.6 mentese'], bozburun: [28.08, 36.65, 'mentese 1390.6 ott 1402.6 mentese'],
  fethiye: [29.12, 36.62, 'mentese 1390.6 ott 1402.6 mentese'], koycegiz: [28.69, 36.97, 'mentese 1390.6 ott 1402.6 mentese'], tavas: [29.07, 37.57, 'mentese 1390.6 ott 1402.6 mentese'],
  bolvadin: [31.05, 38.71, 'ott 1402.6 karaman 1414.4 ott'], aksehir: [31.41, 38.36, 'ott 1402.6 karaman 1414.4 ott'],
  yalvac: [31.18, 38.3, 'ott 1402.6 karaman 1414.4 ott'], karaagac: [31.36, 38.08, 'ott 1402.6 karaman 1414.4 ott'],
  uluborlu: [30.45, 38.08, 'hamid 1390.6 ott 1402.6 karaman 1414.4 ott'], egirdir: [30.87, 37.875, 'hamid 1390.6 ott 1402.6 karaman 1414.4 ott'],
  isparta: [30.55, 37.76, 'hamid 1390.6 ott 1402.6 karaman 1414.4 ott'], burdur: [30.29, 37.72, 'hamid 1390.6 ott 1402.6 karaman 1414.4 ott'],
  beysehir: [31.72, 37.68, 'karaman 1390.6 ott 1402.6 karaman 1414.4 ott'], seydisehir: [31.85, 37.42, 'karaman 1390.6 ott 1402.6 karaman 1414.4 ott'],
  antalya: [30.7, 36.89, 'teke 1390.6 ott 1402.6 teke 1420.6 ott'], korkuteli: [30.2, 37.07, 'teke 1390.6 ott 1402.6 teke 1420.6 ott'],
  elmali: [29.92, 36.74, 'teke 1390.6 ott 1402.6 teke 1420.6 ott'], kas: [29.64, 36.2, 'teke 1390.6 ott 1402.6 teke 1420.6 ott'],
  manavgat: [31.43, 36.79, 'teke 1390.6 ott 1402.6 teke 1420.6 ott'],
  // the islands off Asia
  tenedos: [26.03, 39.81, '-'], lesbos: [26.22, 39.22, 'lesbos'], molyvos: [26.25, 39.33, 'lesbos'], mytilene: [26.48, 39.12, 'lesbos'],
  chios: [26.03, 38.4, 'chios'], psara: [25.57, 38.56, 'chios'], samos: [26.8, 37.72, 'chios'], samoseast: [27.025, 37.738, 'chios'], ikaria: [26.15, 37.6, 'chios'],
  patmos: [26.55, 37.32, 'rhodes'], leros: [26.85, 37.15, 'rhodes'], kalymnos: [26.98, 36.98, 'rhodes'], kos: [27.0, 36.76, 'rhodes'], kostown: [27.25, 36.86, 'rhodes'],
  nisyros: [27.16, 36.59, 'rhodes'], tilos: [27.37, 36.43, 'rhodes'], symi: [27.83, 36.59, 'rhodes'], rhodes: [27.95, 36.2, 'rhodes'], rhodestown: [28.2, 36.4, 'rhodes'],
  karpathos: [27.15, 35.6, 'crete'], kasos: [26.92, 35.4, 'crete'],
  // Thrace; the walled city of Constantinople is a small place
  walls: [28.8, 41.04, THR], derkos: [28.75, 41.3, THR], catalca: [28.46, 41.14, THR], selymbria: [28.25, 41.07, 'selym 1399.95 byz'],
  midia: [28.09, 41.62, THR], vize: [27.76, 41.57, EU], corlu: [27.8, 41.16, EU], herakleia: [27.95, 40.98, MARMARA], rhaidestos: [27.5, 41.0, MARMARA],
  hayrabolu: [27.1, 41.21, EU], malkara: [26.9, 40.89, EU], sarkoy: [27.11, 40.61, EU], kesan: [26.64, 40.86, EU], ipsala: [26.38, 40.92, EU], saros: [26.45, 40.66, EU],
  ainos: [26.08, 40.72, 'ainos'], ferres: [26.17, 40.9, EU], tzympe: [26.75, 40.5, EU], gallipoli: [26.6, 40.42, EU], eceabat: [26.33, 40.15, EU],
  luleburgaz: [27.355, 41.4, EU], babaeski: [27.09, 41.43, EU], didymoteicho: [26.495, 41.35, EU], uzunkopru: [26.69, 41.27, EU], adrianople: [26.56, 41.68, EU],
  kirklareli: [27.22, 41.74, EU], strandzha: [27.52, 42.0, EU], agathopolis: [27.94, 42.1, THR], sozopol: [27.7, 42.42, THR], anchialos: [27.64, 42.56, THR],
  mesembria: [27.73, 42.66, THR], burgas: [27.42, 42.5, EU], karnobat: [26.98, 42.65, EU], aytos: [27.25, 42.7, EU], yambol: [26.5, 42.48, EU],
  sliven: [26.32, 42.68, EU], starazagora: [25.63, 42.43, EU], kazanlak: [25.39, 42.62, EU], haskovo: [25.56, 41.93, EU], kardzhali: [25.37, 41.65, EU],
  philippopolis: [24.75, 42.15, EU], asenovgrad: [24.87, 41.98, EU], pazardzhik: [24.33, 42.19, EU], smolyan: [24.7, 41.58, EU], komotini: [25.4, 41.12, EU],
  maroneia: [25.52, 40.88, EU], xanthi: [24.88, 41.14, EU],
  // Bulgaria, Dobruja, Wallachia and Moldavia
  sofia: [23.32, 42.7, EU], pernik: [23.03, 42.6, EU], dragoman: [22.93, 42.92, EU], samokov: [23.56, 42.34, EU], ihtiman: [23.82, 42.43, EU],
  botevgrad: [23.79, 42.9, 'bulgaria 1393.54 ' + EU], vratsa: [23.56, 43.21, 'bulgaria 1393.54 ' + EU], montana: [23.23, 43.41, 'vidin 1396.95 ' + EU],
  lom: [23.24, 43.83, 'vidin 1396.95 ' + EU], vidin: [22.88, 43.99, 'vidin 1396.95 ' + EU], belogradchik: [22.68, 43.63, 'vidin 1396.95 ' + EU],
  oryahovo: [23.96, 43.73, 'vidin 1395.42 ' + EU], zajecar: [22.29, 43.9, 'vidin 1396.95 ' + EU], negotin: [22.53, 44.23, 'vidin 1396.95 ' + EU],
  pleven: [24.62, 43.42, 'bulgaria 1395.42 ' + EU], nikopol: [24.9, 43.7, 'bulgaria 1395.42 ' + EU], svishtov: [25.35, 43.62, 'bulgaria 1393.54 ' + EU],
  lovech: [24.72, 43.13, 'bulgaria 1393.54 ' + EU], tarnovo: [25.63, 43.08, 'bulgaria 1393.54 ' + EU], gabrovo: [25.32, 42.87, 'bulgaria 1393.54 ' + EU],
  ruse: [25.97, 43.85, 'bulgaria 1393.54 ' + EU], tutrakan: [26.62, 44.05, 'bulgaria 1393.54 ' + EU],
  // the south bank of the Danube, which the towns on the north bank reach across the river without these. Towns on the
  // river sit on their bank of the 1:10m border, which runs a few km off the river in places
  novoselo: [22.79, 44.12, 'vidin 1396.95 ' + EU], kozloduy: [23.73, 43.74, 'vidin 1396.95 ' + EU], gigen: [24.48, 43.7, 'bulgaria 1395.42 ' + EU],
  belene: [25.12, 43.64, 'bulgaria 1393.54 ' + EU],
  razgrad: [26.52, 43.53, EU], isperih: [26.83, 43.72, EU], targovishte: [26.57, 43.25, EU], shumen: [26.93, 43.27, EU], preslav: [26.82, 43.16, EU],
  provadia: [27.44, 43.18, EU], varna: [27.91, 43.21, EU], obzor: [27.88, 42.82, EU], silistra: [27.26, 44.08, 'ott 1402.6 sul 1404 wallachia 1420.3 ott'],
  dobrich: [27.83, 43.57, DOBRUJA], kaliakra: [28.47, 43.36, DOBRUJA], constanta: [28.63, 44.17, DOBRUJA],
  medgidia: [28.27, 44.25, DOBRUJA], hirsova: [27.95, 44.68, DOBRUJA], enisala: [28.83, 44.89, DOBRUJA],
  isaccea: [28.46, 45.27, DOBRUJA], tulcea: [28.8, 45.18, DOBRUJA], delta: [29.3, 45.2, DOBRUJA],
  severin: [22.66, 44.63, 'wallachia 1419.5 hungary'], calafat: [22.95, 44.17, 'wallachia'], craiova: [23.8, 44.32, 'wallachia'],
  ramnicu: [24.37, 45.1, 'wallachia'], arges: [24.68, 45.14, 'wallachia'], targoviste: [25.46, 44.93, 'wallachia'], bucharest: [26.1, 44.43, 'wallachia'],
  teleorman: [25.1, 44.1, 'wallachia'], bailesti: [23.35, 44.03, 'wallachia'], cetate: [23.05, 44.1, 'wallachia'], bistret: [23.5, 43.9, 'wallachia'], dabuleni: [24.09, 43.9, 'wallachia'],
  gruia: [22.7, 44.29, 'wallachia 1419.5 hungary'], bechet: [23.96, 43.86, 'wallachia'], corabia: [24.5, 43.86, 'wallachia'],
  turnuland: [24.98, 43.88, 'wallachia'], zimnicea: [25.37, 43.72, 'wallachia'], giurgiuland: [25.75, 44.03, 'wallachia'], oltenita: [26.64, 44.13, 'wallachia'],
  fetesti: [27.83, 44.38, 'wallachia'], calarasi: [27.33, 44.2, 'wallachia'], slobozia: [27.37, 44.56, 'wallachia'], buzau: [26.82, 45.15, 'wallachia'],
  braila: [27.97, 45.27, 'wallachia'], chilia: [29.27, 45.43, 'wallachia 1408 moldavia'], focsani: [27.19, 45.7, 'moldavia'], galati: [28.04, 45.43, 'moldavia'],
  bacau: [26.91, 46.57, 'moldavia'], suceava: [26.25, 47.65, 'moldavia'], iasi: [27.6, 47.16, 'moldavia'], chisinau: [28.85, 47.0, 'moldavia'],
  cahul: [28.2, 45.9, 'moldavia'], balti: [27.93, 47.76, 'moldavia'], tighina: [29.47, 46.83, 'moldavia'], budjak: [29.2, 45.9, 'moldavia'],
  bilhorod: [30.35, 46.19, 'moldavia'], chernivtsi: [25.94, 48.29, 'moldavia'],
  transnistria: [29.4, 47.3, '-'], odessa: [30.6, 46.6, '-'], mykolaiv: [32.0, 46.97, '-'], kherson: [32.6, 46.6, '-'],
  azov: [36.5, 46.8, '-'], zaporizhzhia: [35.14, 47.84, '-'], dnipro: [35.05, 48.46, '-'], donbas: [38.5, 48.2, '-'],
  kharkiv: [36.23, 49.8, '-'], kropyvnytskyi: [32.26, 48.51, '-'], uman: [30.22, 48.75, '-'], vinnytsia: [28.47, 49.23, '-'],
  khmelnytskyi: [26.99, 49.42, '-'], lviv: [24.03, 49.7, '-'], frankivsk: [24.71, 48.92, '-'],
  // Hungary, Transylvania, Croatia and Dalmatia
  brasov: [25.6, 45.65, 'hungary'], sibiu: [24.15, 45.79, 'hungary'], hateg: [22.95, 45.6, 'hungary'], alba: [23.57, 46.07, 'hungary'], cluj: [23.6, 46.77, 'hungary'],
  targumures: [24.56, 46.54, 'hungary'], ciuc: [25.8, 46.36, 'hungary'], bistrita: [24.5, 47.13, 'hungary'], deva: [22.9, 45.88, 'hungary'],
  caransebes: [22.22, 45.42, 'hungary'], orsova: [22.4, 44.72, 'hungary'], timisoara: [21.23, 45.75, 'hungary'], arad: [21.31, 46.18, 'hungary'],
  oradea: [21.92, 47.06, 'hungary'], debrecen: [21.62, 47.53, 'hungary'], baiamare: [23.58, 47.66, 'hungary'], satumare: [22.88, 47.79, 'hungary'],
  vrsac: [21.3, 45.12, 'hungary'], kovin: [20.97, 44.75, 'hungary'], belacrkva: [21.42, 44.9, 'hungary'], moldovanoua: [21.66, 44.74, 'hungary'], pancevo: [20.64, 44.87, 'hungary'], zrenjanin: [20.39, 45.38, 'hungary'],
  novisad: [19.86, 45.25, 'hungary'], srem: [19.4, 45.05, 'hungary'], vukovar: [19.0, 45.35, 'hungary'], szeged: [20.15, 46.25, 'hungary'],
  kecskemet: [19.69, 46.9, 'hungary'], budapest: [19.04, 47.5, 'hungary'], esztergom: [18.74, 47.79, 'hungary'], eger: [20.38, 47.9, 'hungary'],
  miskolc: [20.78, 48.1, 'hungary'], nyiregyhaza: [21.72, 47.95, 'hungary'], kosice: [21.26, 48.72, 'hungary'], presov: [21.24, 49.0, 'hungary'],
  uzhhorod: [22.29, 48.62, 'hungary'], mukachevo: [22.72, 48.44, 'hungary'], banskabystrica: [19.15, 48.74, 'hungary'], zilina: [18.74, 49.22, 'hungary'],
  nitra: [18.09, 48.31, 'hungary'], trnava: [17.59, 48.38, 'hungary'], bratislava: [17.11, 48.15, 'hungary'], gyor: [17.63, 47.68, 'hungary'],
  sopron: [16.59, 47.68, 'hungary'], szombathely: [16.62, 47.23, 'hungary'], zalaegerszeg: [16.84, 46.84, 'hungary'], pecs: [18.23, 46.07, 'hungary'],
  balaton: [17.8, 46.9, 'hungary'], osijek: [18.69, 45.55, 'hungary'], slavbrod: [18.0, 45.16, 'hungary'], pozega: [17.68, 45.34, 'hungary'],
  sisak: [16.37, 45.48, 'hungary'], zagreb: [15.98, 45.81, 'hungary'], varazdin: [16.34, 46.3, 'hungary'], karlovac: [15.55, 45.49, 'hungary'],
  bihac: [15.87, 44.82, 'hungary'], senj: [14.9, 45.0, 'hungary'], rijeka: [14.44, 45.33, 'hungary'], lika: [15.4, 44.55, 'hungary'], knin: [16.2, 44.04, 'hungary'],
  zadar: [15.23, 44.12, 'hungary 1409.5 dalmatia'], biograd: [15.45, 43.93, 'hungary 1409.5 dalmatia'], pag: [15.05, 44.45, 'hungary 1409.5 dalmatia'],
  sibenik: [15.89, 43.73, 'hungary 1412.8 dalmatia'], split: [16.44, 43.51, 'hungary 1403.5 bosnia 1413.3 hungary 1420.5 dalmatia'], omis: [16.69, 43.44, 'hungary'],
  korcula: [17.0, 42.95, 'hungary 1403.5 bosnia 1413.3 hungary 1420.5 dalmatia'], korculatown: [17.13, 42.94, 'hungary 1403.5 bosnia 1413.3 hungary 1420.5 dalmatia'],
  hvareast: [16.88, 43.15, 'hungary 1403.5 bosnia 1413.3 hungary 1420.5 dalmatia'], sucuraj: [17.08, 43.135, 'hungary 1403.5 bosnia 1413.3 hungary 1420.5 dalmatia'],
  hvar: [16.6, 43.15, 'hungary 1403.5 bosnia 1413.3 hungary 1420.5 dalmatia'], brac: [16.6, 43.32, 'hungary 1403.5 bosnia 1413.3 hungary 1420.5 dalmatia'],
  bracEast: [16.82, 43.3, 'hungary 1403.5 bosnia 1413.3 hungary 1420.5 dalmatia'], cres: [14.4, 44.9, 'hungary'], krk: [14.6, 45.05, 'hungary'],
  pula: [13.85, 44.87, 'istria'], porec: [13.6, 45.23, 'istria'], labin: [14.12, 45.09, 'istria'], koper: [13.73, 45.55, 'istria'], pazin: [13.94, 45.24, '-'],
  ljubljana: [14.5, 46.05, '-'], maribor: [15.65, 46.55, '-'], novomesto: [15.17, 45.8, '-'],
  // Bosnia, Ragusa and the Serbian lands
  mljet: [17.55, 42.75, 'ragusa'], ragusa: [18.11, 42.64, 'ragusa'], ston: [17.7, 42.84, 'ragusa'], peljesac: [17.3, 42.97, 'ragusa'], orebic: [17.15, 43.02, 'ragusa'],
  peljesacwest: [17.05, 43.03, 'ragusa'], peljesaceast: [17.5, 42.87, 'ragusa'], slano: [17.9, 42.78, 'bosnia'], popovo: [18.1, 42.82, 'bosnia'],
  ploce: [17.42, 43.07, 'bosnia'], gradac: [17.28, 43.2, 'bosnia'], zaostrog: [17.12, 43.25, 'bosnia'], opuzen: [17.6, 43.02, 'bosnia'], makarska: [17.02, 43.3, 'bosnia'],
  livno: [17.01, 43.83, 'bosnia'], banjaluka: [17.19, 44.77, 'bosnia'], jajce: [17.27, 44.34, 'bosnia'], zenica: [17.9, 44.2, 'bosnia'], visoko: [18.18, 43.99, 'bosnia'],
  sarajevo: [18.41, 43.86, 'bosnia'], doboj: [18.09, 44.73, 'bosnia'], tuzlabih: [18.67, 44.54, 'bosnia'], zvornik: [19.1, 44.39, 'bosnia'], srebrenica: [19.3, 44.1, 'bosnia'],
  visegrad: [19.29, 43.78, 'bosnia'], gorazde: [18.98, 43.67, 'bosnia'], foca: [18.78, 43.5, 'bosnia'], mostar: [17.81, 43.34, 'bosnia'], stolac: [17.96, 43.08, 'bosnia'],
  nevesinje: [18.12, 43.26, 'bosnia'], gacko: [18.53, 43.17, 'bosnia'], bileca: [18.43, 42.87, 'bosnia'], trebinje: [18.34, 42.71, 'bosnia'], konavle: [18.35, 42.55, 'bosnia'],
  novi: [18.54, 42.45, 'bosnia'], lustica: [18.65, 42.4, 'bosnia'], kotor: [18.77, 42.42, 'bosnia'], zabljak: [19.12, 43.15, 'bosnia'], pljevlja: [19.36, 43.36, 'bosnia'],
  prijepolje: [19.65, 43.39, 'bosnia'], bijelopolje: [19.75, 43.04, 'bosnia'],
  belgrade: [20.46, 44.82, 'hungary 1403.9 lazar'], macva: [19.65, 44.7, 'hungary 1403.9 lazar'], valjevo: [19.89, 44.27, 'lazar'], smederevo: [20.93, 44.66, 'lazar'],
  branicevo: [21.23, 44.73, 'lazar'], golubac: [21.63, 44.66, 'lazar 1391 ott 1402.6 lazar'], kucevo: [21.67, 44.48, 'lazar'], paracin: [21.41, 43.86, 'lazar'],
  kragujevac: [20.92, 44.01, 'lazar'], rudnik: [20.5, 44.14, 'lazar'], cacak: [20.35, 43.89, 'lazar'], uzice: [19.85, 43.86, 'lazar'], kraljevo: [20.69, 43.72, 'lazar'],
  krusevac: [21.33, 43.58, 'lazar 1413.25 musa 1413.51 lazar'], stalac: [21.41, 43.67, 'lazar 1413.25 musa 1413.51 lazar'],
  aleksinac: [21.7, 43.54, 'lazar 1413.25 musa 1413.51 lazar'], sokobanja: [21.87, 43.64, 'lazar 1413.25 musa 1413.51 lazar'],
  svrljig: [22.12, 43.42, 'lazar 1413.25 musa 1413.51 lazar'], nis: [21.9, 43.32, EU], pirot: [22.59, 43.15, EU], prokuplje: [21.59, 43.24, 'lazar'],
  kursumlija: [21.27, 43.14, 'lazar'], leskovac: [21.95, 42.99, 'lazar'], vranje: [21.9, 42.55, 'dragas 1395.4 ott 1402.6 sul 1402.88 lazar'],
  presevo: [21.65, 42.31, 'dragas 1395.4 ott 1402.6 sul 1402.88 lazar'], novobrdo: [21.43, 42.62, 'lazar'],
  sjenica: [20.0, 43.27, 'vuk'], novipazar: [20.52, 43.14, 'vuk 1396.8 lazar'], raska: [20.68, 43.02, 'vuk 1396.8 lazar'], zvecan: [20.87, 42.9, 'vuk'],
  vucitrn: [20.97, 42.82, 'vuk'], pristina: [21.165, 42.663, 'vuk 1396.8 ott 1398 lazar'], urosevac: [21.16, 42.37, 'vuk 1396.8 ' + EU],
  berane: [19.87, 42.84, 'vuk'], pec: [20.29, 42.66, 'vuk'], djakovica: [20.43, 42.38, 'vuk'], prizren: [20.74, 42.21, 'vuk'], kukes: [20.4, 42.08, 'vuk'],
  // Zeta and Albania
  plav: [19.92, 42.6, 'zeta'], niksic: [18.95, 42.78, 'zeta'], podgorica: [19.26, 42.44, 'zeta'], budva: [18.84, 42.29, 'zeta'], bar: [19.1, 42.09, 'zeta'],
  ulcinj: [19.21, 41.93, 'zeta'], scutari: [19.51, 42.07, 'zeta 1396.3 venalb'], puke: [19.9, 42.03, 'zeta'], lezhe: [19.65, 41.78, 'zeta 1393 venalb'],
  mat: [20.1, 41.65, 'alb'], kruje: [19.79, 41.51, 'alb 1415.5 ott'], durres: [19.45, 41.32, 'alb 1392.5 venalb'], elbasan: [20.08, 41.11, 'alb'],
  berat: [19.95, 40.7, 'valona 1417.45 ott'], vlore: [19.49, 40.47, 'valona 1417.45 ott'], himare: [19.75, 40.1, 'valona 1417.45 ott'],
  divjake: [19.55, 40.95, 'valona 1417.45 ott'],
  // Macedonia
  kumanovo: [21.71, 42.13, 'dragas 1395.4 ' + EU], kratovo: [22.18, 42.08, 'dragas 1395.4 ' + EU], velbuzd: [22.69, 42.28, 'dragas 1395.4 ' + EU],
  dupnitsa: [23.12, 42.27, 'dragas 1395.4 ' + EU], blagoevgrad: [23.1, 42.02, 'dragas 1395.4 ' + EU], razlog: [23.47, 41.88, 'dragas 1395.4 ' + EU],
  stip: [22.19, 41.74, EU], strumica: [22.64, 41.44, 'dragas 1395.4 ' + EU], melnik: [23.39, 41.52, 'dragas 1395.4 ' + EU], negotino: [22.09, 41.48, EU],
  veles: [21.78, 41.72, 'marko 1395.4 ' + EU], skopje: [21.43, 42.0, 'vuk 1392.1 ' + EU], tetovo: [20.97, 42.01, 'marko 1395.4 ' + EU],
  kicevo: [20.96, 41.51, 'marko 1395.4 ' + EU], prilep: [21.55, 41.35, 'marko 1395.4 ' + EU], bitola: [21.33, 41.03, EU], florina: [21.4, 40.78, EU],
  ohrid: [20.8, 41.12, 'alb 1395.4 ' + EU], debar: [20.52, 41.52, 'alb 1395.4 ' + EU], korce: [20.78, 40.62, EU], kastoria: [21.27, 40.52, EU],
  edessa: [22.05, 40.8, EU], veria: [22.2, 40.52, EU], servia: [21.9, 40.2, EU], gevgelija: [22.5, 41.14, EU], kilkis: [22.88, 40.99, EU],
  katerini: [22.5, 40.27, COAST], platamon: [22.6, 40.0, 'byzthessaly 1393.9 ' + COAST], thessalonica: [22.94, 40.64, 'ott 1402.6 sul 1403.1 thes'],
  chalkidiki: [23.4, 40.35, 'ott 1402.6 sul 1403.1 thes 1411.3 musa 1413.51 thes'], athos: [24.2, 40.25, 'ott 1402.6 sul 1403.1 thes 1411.3 musa 1413.51 thes'],
  strymon: [23.8, 40.8, COAST], serres: [23.55, 41.09, EU], drama: [24.15, 41.15, EU], kavala: [24.41, 40.94, EU], nevrokop: [23.73, 41.57, EU], nestos: [24.75, 41.0, EU],
  thasos: [24.67, 40.64, 'byzisl'], samothrace: [25.55, 40.47, 'byzisl'], imbros: [25.85, 40.17, 'byzisl'], lemnos: [25.25, 39.9, 'byzisl'],
  skiathos: [23.47, 39.16, 'byzthessaly 1393.9 ott 1402.6 sul 1403.1 sporades'], skopelos: [23.72, 39.12, 'byzthessaly 1393.9 ott 1402.6 sul 1403.1 sporades'],
  skyros: [24.56, 38.88, 'byzthessaly 1393.9 ott 1402.6 sul 1403.1 sporades'],
  // Thessaly, Epirus and Greece
  larissa: [22.42, 39.64, THESSALY], trikala: [21.77, 39.55, THESSALY], elassona: [22.19, 39.9, THESSALY], karditsa: [21.92, 39.37, THESSALY],
  pharsala: [22.38, 39.29, THESSALY], grevena: [21.43, 40.08, THESSALY], agia: [22.76, 39.72, 'byzthessaly 1393.9 ' + COAST],
  volos: [22.94, 39.36, 'byzthessaly 1393.9 ' + COAST], halmyros: [22.79, 39.18, 'byzthessaly 1393.9 ' + COAST], trikeri: [23.05, 39.15, 'byzthessaly 1393.9 ' + COAST],
  pelion: [23.15, 39.3, 'byzthessaly 1393.9 ' + COAST], pteleos: [22.93, 39.02, 'byzthessaly 1393.9 ' + COAST],
  domokos: [22.3, 39.13, 'acc 1393.9 ' + EU], neopatras: [22.24, 38.87, 'acc 1393.9 ' + EU], lamia: [22.43, 38.9, 'acc 1393.9 ' + COAST],
  stylida: [22.845, 38.9375, 'acc 1393.9 ' + COAST], atalanti: [22.99, 38.65, 'acc 1394.2 ott 1402.6 sul 1403.1 negro'], kamena: [22.84, 38.73, 'acc 1394.2 ' + EU],
  larymna: [23.22, 38.6, 'acc 1394.2 ott 1402.6 sul 1403.1 negro'], salona: [22.38, 38.53, 'acc 1394.2 ' + EU], galaxidi: [22.3, 38.38, 'acc 1394.2 ' + EU],
  eratini: [22.15, 38.4, 'acc 1394.2 ' + EU], antikyra: [22.65, 38.35, 'acc'], livadeia: [22.87, 38.43, 'acc'], thebes: [23.32, 38.32, 'acc'],
  aulis: [23.55, 38.44, 'acc'], avlida: [23.6, 38.37, 'acc'], athens: [23.73, 37.98, 'acc 1394.9 venath 1402.5 acc'], varnavas: [23.92, 38.24, 'acc 1394.9 venath 1402.5 acc'],
  marathon: [23.97, 38.15, 'acc 1394.9 venath 1402.5 acc'], oropos: [23.75, 38.3, 'acc'], lavrion: [24.0, 37.75, 'acc 1394.9 venath 1402.5 acc'],
  megara: [23.35, 38.0, 'acc'], aegina: [23.5, 37.74, 'acc'],
  chalkis: [23.68, 38.47, 'negro'], limni: [23.5, 38.72, 'negro'], oreoi: [23.08, 38.93, 'negro'], istiaia: [23.2, 38.9, 'negro'], lichada: [22.875, 38.8425, 'negro'],
  styra: [24.24, 38.18, 'negro'], eretria: [23.85, 38.42, 'negro'], aliveri: [24.05, 38.4, 'negro'], karystos: [24.42, 38.02, 'negro'], kymi: [24.1, 38.63, 'negro'],
  naupaktos: [21.83, 38.42, 'alb 1407.5 lepanto'], antirrio: [21.77, 38.37, 'alb 1407.5 lepanto'], mesolongi: [21.43, 38.37, 'alb 1416.8 tocco'],
  evinochori: [21.6, 38.4, 'alb 1416.8 tocco'], marathias: [22.0, 38.41, 'alb 1416.8 tocco'], akarnania: [20.82, 38.75, 'alb 1416.8 tocco'],
  vonitsa: [20.95, 38.85, 'alb 1416.8 tocco'], astakos: [21.1, 38.55, 'alb 1416.8 tocco'], agrinio: [21.41, 38.62, 'alb 1416.8 tocco'],
  arta: [20.98, 39.16, 'alb 1416.8 tocco'], preveza: [20.75, 38.96, 'alb 1416.8 tocco'], paramythia: [20.5, 39.47, 'alb 1416.8 tocco'],
  igoumenitsa: [20.3, 39.45, 'alb 1416.8 tocco'], ioannina: [20.85, 39.66, 'esau 1411.1 tocco'], metsovo: [21.18, 39.77, 'esau 1411.1 tocco'],
  konitsa: [20.75, 40.05, 'esau 1411.1 tocco'], gjirokaster: [20.14, 40.08, 'alb'], permet: [20.35, 40.23, 'alb'],
  butrint: [20.08, 39.76, 'corfu'], saranda: [20.05, 39.9, 'corfu'], corfu: [19.8, 39.6, 'corfu'], corfunorth: [19.85, 39.76, 'corfu'], corfusouth: [20.0, 39.42, 'corfu'],
  paxos: [20.17, 39.2, 'corfu'], lefkada: [20.66, 38.72, 'tocco'], cephalonia: [20.55, 38.2, 'tocco'], zakynthos: [20.85, 37.78, 'tocco'],
  // the Morea
  patras: [21.73, 38.25, 'achaea'], rion: [21.8, 38.26, 'achaea'], psathopyrgos: [21.93, 38.27, 'achaea'], araxos: [21.42, 38.12, 'achaea'], akrata: [22.35, 38.12, 'achaea'],
  xylokastro: [22.63, 38.03, 'achaea'], kyllini: [21.2, 37.88, 'achaea'], vostitsa: [22.08, 38.25, 'achaea'], kalavryta: [22.1, 38.03, 'achaea'],
  corinth: [22.93, 37.94, 'acc 1395.8 morea 1397.5 kcorinth 1404.5 morea'], nemea: [22.66, 37.82, 'acc 1395.8 morea 1397.5 kcorinth 1404.5 morea'],
  kenchreai: [23.0, 37.87, 'acc 1395.8 morea 1397.5 kcorinth 1404.5 morea'], argos: [22.73, 37.63, 'morea 1394.3 nauplia'], lerna: [22.7, 37.53, 'morea 1394.3 nauplia'],
  nauplia: [22.8, 37.57, 'nauplia'], kranidi: [23.15, 37.38, 'nauplia'], troezen: [23.35, 37.5, 'nauplia'], astros: [22.65, 37.4, 'morea'], elis: [21.4, 37.75, 'achaea'],
  kyparissia: [21.67, 37.25, 'achaea'], pylos: [21.75, 37.0, 'achaea'], modon: [21.71, 36.82, 'messenia'], coron: [21.96, 36.8, 'messenia'], kalamata: [22.11, 37.04, 'achaea'],
  androusa: [21.92, 37.22, 'achaea'], akova: [21.95, 37.67, 'achaea'], karytaina: [22.04, 37.49, 'morea'], tripoli: [22.38, 37.51, 'morea'],
  mystras: [22.43, 37.07, 'morea'], mani: [22.38, 36.65, 'morea'], monemvasia: [22.98, 36.75, 'morea'], malea: [23.1, 36.55, 'morea'], leonidio: [22.86, 37.17, 'morea'],
  kythera: [22.98, 36.22, 'crete'],
  // Crete and the Cyclades
  chania: [23.95, 35.4, 'crete'], candia: [25.13, 35.3, 'crete'], sitia: [26.0, 35.15, 'crete'],
  andros: [24.85, 37.85, 'archipelago'], tinos: [25.15, 37.58, 'tinos'], mykonos: [25.37, 37.45, 'tinos'], syros: [24.93, 37.44, 'archipelago'],
  kea: [24.33, 37.62, 'archipelago'], serifos: [24.48, 37.15, 'archipelago'], milos: [24.42, 36.7, 'archipelago'], paros: [25.15, 37.05, 'archipelago'],
  naxos: [25.45, 37.05, 'archipelago'], ios: [25.3, 36.72, 'archipelago'], santorini: [25.43, 36.4, 'archipelago'], amorgos: [25.88, 36.85, 'archipelago'],
  astypalaia: [26.36, 36.57, 'archipelago'],
};

// places smaller than a town's area, drawn by hand: [ring, owners]
const ringIn = (centre, km, landOf) => {
  const c = turf.circle(centre, km, { steps: 24 }), g = landOf ? I(c, landOf) : c;
  return polysOf(g.geometry).sort((a, b) => km2(turf.polygon(b)) - km2(turf.polygon(a)))[0][0].slice(0, -1);
};
const SMALL = {
  // the city inside the land walls, south of the Golden Horn, which the 1:10m land does not show as water
  constantinople: [[[28.918, 40.993], [28.945, 40.998], [28.97, 41.003], [28.985, 41.008], [28.986, 41.015], [28.972, 41.016], [28.96, 41.021], [28.95, 41.031],
    [28.944, 41.042], [28.932, 41.036], [28.92, 41.02]], 'byz'],
  // Pera, the Genoese town across the Golden Horn
  galata: [[[28.962, 41.024], [28.988, 41.022], [29.005, 41.026], [29.005, 41.04], [28.99, 41.042], [28.975, 41.04], [28.962, 41.034]], 'galata'],
  // the harbour castle of Smyrna, held by the Knights until Timur takes it in December 1402
  smyrnacastle: [[[27.09, 38.4], [27.135, 38.4], [27.15, 38.415], [27.145, 38.432], [27.09, 38.435]], 'smyrna 1402.95 aydin 1414.4 ott'],
  // the bridgeheads on the north bank of the Danube: Little Nicopolis, held by a Hungarian garrison 1395–1396, and Giurgiu
  turnu: [ringIn([24.87, 43.75], 5, country('Romania')), 'wallachia 1395.5 hungary 1396.8 wallachia 1417.5 ott'],
  giurgiu: [ringIn([25.97, 43.92], 6, country('Romania')), 'wallachia 1417.5 ott'],
};

// --- owners: family, the id each zone's name starts with, and the names from the year they apply ---
const N = (from, en, tr, id) => ({ from, en, tr, id });
const O = {
  ott: ['ottomans', 'ottomans', [N(1389, 'Ottoman state under Bayezid I', 'I. Bayezid yönetiminde Osmanlı Devleti'),
    N(1413.5, 'Ottoman state under Mehmed I', 'I. Mehmed yönetiminde Osmanlı Devleti')]],
  sul: ['suleyman', 'suleyman', [N(1389, 'Lands of Süleyman Çelebi', 'Süleyman Çelebi’nin toprakları')]],
  isa: ['isa', 'isa', [N(1389, 'Lands of İsa Çelebi', 'İsa Çelebi’nin toprakları')]],
  meh: ['mehmed', 'mehmed', [N(1389, 'Lands of Mehmed Çelebi', 'Mehmed Çelebi’nin toprakları')]],
  musa: ['musa', 'musa', [N(1389, 'Lands of Musa Çelebi', 'Musa Çelebi’nin toprakları')]],
  byz: ['byzantium', 'byzantium', [N(1389, 'Byzantine Empire under John V, an Ottoman vassal', 'Osmanlı’ya bağlı V. Ioannis yönetiminde Bizans İmparatorluğu'),
    N(1390.28, 'Byzantine Empire under John VII, an Ottoman vassal', 'Osmanlı’ya bağlı VII. Ioannis yönetiminde Bizans İmparatorluğu'),
    N(1390.71, 'Byzantine Empire under John V, an Ottoman vassal', 'Osmanlı’ya bağlı V. Ioannis yönetiminde Bizans İmparatorluğu'),
    N(1391.13, 'Byzantine Empire under Manuel II', 'II. Manuel yönetiminde Bizans İmparatorluğu'),
    N(1399.95, 'Byzantine Empire under John VII, regent for Manuel II', 'II. Manuel adına naip VII. Ioannis yönetiminde Bizans İmparatorluğu'),
    N(1403.44, 'Byzantine Empire under Manuel II', 'II. Manuel yönetiminde Bizans İmparatorluğu')]],
  selym: ['byzantium', 'selymbria', [N(1389, 'Selymbria under John VII', 'VII. Ioannis yönetiminde Silivri')]],
  morea: ['byzantium', 'morea', [N(1389, 'Despotate of the Morea under Theodore I', 'I. Theodoros yönetiminde Mora Despotluğu'),
    N(1407.5, 'Despotate of the Morea under Theodore II', 'II. Theodoros yönetiminde Mora Despotluğu')]],
  thes: ['byzantium', 'thessalonica', [N(1389, 'Byzantine Thessalonica', 'Bizans’ın Selanik’i'), N(1403.9, 'Thessalonica under John VII', 'VII. Ioannis yönetiminde Selanik'),
    N(1408.7, 'Byzantine Thessalonica', 'Bizans’ın Selanik’i')]],
  phil: ['byzantium', 'philadelphia', [N(1389, 'Philadelphia, the last Byzantine town in Anatolia', 'Anadolu’daki son Bizans şehri: Alaşehir (Philadelphia)')]],
  byzthessaly: ['byzantium', 'thessaly', [N(1389, 'Thessaly under its Byzantine lord, an Ottoman vassal', 'Osmanlı’ya bağlı Bizanslı beyi yönetiminde Teselya')]],
  byzisl: ['byzantium', 'aegean-islands', [N(1389, 'Byzantine islands of the northern Aegean', 'Bizans’ın Kuzey Ege adaları')]],
  sporades: ['byzantium', 'sporades', [N(1389, 'Northern Sporades, Byzantine from 1403', '1403’ten sonra Bizans’ın Kuzey İsporad adaları')]],
  lazar: ['serbia', 'serbia', [N(1389, 'Moravian Serbia under Stefan Lazarević, an Ottoman vassal', 'Osmanlı’ya bağlı Stefan Lazareviç yönetiminde Moravya Sırbistanı'),
    N(1402.6, 'Serbian Despotate under Stefan Lazarević', 'Stefan Lazareviç yönetiminde Sırp Despotluğu')]],
  vuk: ['brankovic', 'brankovic', [N(1389, 'Vuk Branković’s land in Kosovo', 'Vuk Brankoviç’in Kosova’daki toprakları'),
    N(1392.9, 'Vuk Branković’s land in Kosovo, an Ottoman vassal', 'Osmanlı’ya bağlı Vuk Brankoviç’in Kosova’daki toprakları'),
    N(1396.8, 'Lands of Vuk Branković’s widow and sons, Ottoman vassals', 'Osmanlı’ya bağlı Vuk Brankoviç’in dul eşi ve oğullarının toprakları'),
    N(1402.6, 'Lands of Đurađ Branković', 'Đurađ Brankoviç’in toprakları'),
    N(1411.9, 'Lands of Đurađ Branković, a vassal of Stefan Lazarević', 'Stefan Lazareviç’e bağlı Đurađ Brankoviç’in toprakları')]],
  dragas: ['dragas', 'dragas', [N(1389, 'Lands of Konstantin Dragaš, an Ottoman vassal', 'Osmanlı’ya bağlı Konstantin Dragaş’ın toprakları')]],
  marko: ['prilep', 'marko', [N(1389, 'Marko’s lands at Prilep, an Ottoman vassal', 'Osmanlı’ya bağlı Marko’nun Pirlepe’deki toprakları')]],
  bulgaria: ['bulgaria', 'bulgaria', [N(1389, 'Bulgaria of Tarnovo under Ivan Shishman, an Ottoman vassal', 'Osmanlı’ya bağlı İvan Şişman yönetiminde Tırnova Bulgaristanı'),
    N(1393.54, 'Ivan Shishman’s lands at Nikopol, an Ottoman vassal', 'Osmanlı’ya bağlı İvan Şişman’ın Niğbolu’daki toprakları')]],
  vidin: ['vidin', 'vidin', [N(1389, 'Tsardom of Vidin under Ivan Sratsimir, an Ottoman vassal', 'Osmanlı’ya bağlı İvan Sratsimir yönetiminde Vidin Çarlığı')]],
  wallachia: ['wallachia', 'wallachia', [N(1389, 'Wallachia under Mircea the Elder', 'Yaşlı Mircea yönetiminde Eflak'),
    N(1395.4, 'Wallachia under Vlad I, an Ottoman vassal', 'Osmanlı’ya bağlı I. Vlad yönetiminde Eflak'),
    N(1395.9, 'Wallachia, contested by Mircea and Vlad I', 'Mircea ile I. Vlad arasında çekişmeli Eflak'),
    N(1397, 'Wallachia under Mircea the Elder', 'Yaşlı Mircea yönetiminde Eflak'),
    N(1417.5, 'Wallachia under Mircea the Elder, paying tribute to the Ottomans', 'Osmanlı’ya vergi veren Yaşlı Mircea yönetiminde Eflak'),
    N(1418.08, 'Wallachia under Mihail I', 'I. Mihail yönetiminde Eflak'),
    N(1420.4, 'Wallachia under Dan II, an Ottoman vassal', 'Osmanlı’ya bağlı II. Dan yönetiminde Eflak')]],
  moldavia: ['moldavia', 'moldavia', [N(1389, 'Principality of Moldavia', 'Boğdan Prensliği')]],
  hungary: ['hungary', 'hungary', [N(1389, 'Kingdom of Hungary under Sigismund', 'Zsigmond yönetiminde Macaristan Krallığı')]],
  bosnia: ['bosnia', 'bosnia', [N(1389, 'Kingdom of Bosnia', 'Bosna Krallığı')]],
  zeta: ['zeta', 'zeta', [N(1389, 'Zeta under Đurađ II Balšić, an Ottoman vassal', 'Osmanlı’ya bağlı II. Đurađ Balšić yönetiminde Zeta'),
    N(1403.3, 'Zeta under Balša III', 'III. Balša yönetiminde Zeta')]],
  ragusa: ['ragusa', 'ragusa', [N(1389, 'Republic of Ragusa', 'Ragusa (Dubrovnik) Cumhuriyeti')]],
  alb: ['albanian-lords', 'albanian-lords', [N(1389, 'Albanian lords', 'Arnavut beyleri')]],
  valona: ['valona', 'valona', [N(1389, 'Principality of Valona', 'Avlonya Prensliği')]],
  esau: ['epirus', 'ioannina', [N(1389, 'Ioannina under Esau Buondelmonti', 'Esau Buondelmonti yönetiminde Yanya')]],
  tocco: ['epirus', 'tocco', [N(1389, 'County palatine of Cephalonia under Carlo I Tocco', 'I. Carlo Tocco yönetiminde Kefalonya Kontluğu'),
    N(1411.1, 'Despotate of Epirus under Carlo I Tocco', 'I. Carlo Tocco yönetiminde Epir Despotluğu')]],
  achaea: ['achaea', 'achaea', [N(1389, 'Principality of Achaea', 'Ahaya Prensliği')]],
  acc: ['athens', 'athens', [N(1389, 'Duchy of Athens under Nerio I Acciaioli', 'I. Nerio Acciaioli yönetiminde Atina Dükalığı'),
    N(1394.73, 'Lands of Antonio Acciaioli at Thebes and Livadeia', 'Antonio Acciaioli’nin İstefe ve Livadya’daki toprakları'),
    N(1402.5, 'Duchy of Athens under Antonio I Acciaioli', 'I. Antonio Acciaioli yönetiminde Atina Dükalığı')]],
  crete: ['venice', 'crete', [N(1389, 'Venetian Crete', 'Venedik’in Girit’i')]],
  negro: ['venice', 'negroponte', [N(1389, 'Negroponte (Euboea), Venetian', 'Venedik’in Eğriboz’u')]],
  messenia: ['venice', 'modon-coron', [N(1389, 'Modon and Coron, Venetian', 'Venedik’in Moton ve Koron’u')]],
  nauplia: ['venice', 'nauplia', [N(1389, 'Nauplia, Venetian', 'Venedik’in Anabolu’su'), N(1394.3, 'Argos and Nauplia, Venetian', 'Venedik’in Arhos ve Anabolu’su')]],
  venath: ['venice', 'venetian-athens', [N(1389, 'Athens, Venetian 1394–1402', '1394–1402 arasında Venedik’in Atina’sı')]],
  corfu: ['venice', 'corfu', [N(1389, 'Corfu, Venetian', 'Venedik’in Korfu’su')]],
  venalb: ['venice', 'venetian-albania', [N(1389, 'Venetian towns in Albania', 'Venedik’in Arnavutluk’taki şehirleri')]],
  lepanto: ['venice', 'lepanto', [N(1389, 'Lepanto, Venetian', 'Venedik’in İnebahtı’sı')]],
  archipelago: ['venice', 'archipelago', [N(1389, 'Duchy of the Archipelago, a Venetian client', 'Venedik’e bağlı Ege Dükalığı (Nakşa)')]],
  tinos: ['venice', 'tinos', [N(1389, 'Tinos and Mykonos, Venetian', 'Venedik’in İstendil ve Mikonos’u')]],
  dalmatia: ['venice', 'dalmatia', [N(1389, 'Venetian Dalmatia', 'Venedik’in Dalmaçya’sı')]],
  istria: ['venice', 'istria', [N(1389, 'Venetian Istria', 'Venedik’in İstria’sı')]],
  galata: ['genoa', 'galata', [N(1389, 'Galata (Pera), Genoese', 'Cenevizlilerin Galata’sı')]],
  amastris: ['genoa', 'amastris', [N(1389, 'Amastris, Genoese', 'Cenevizlilerin Amasra’sı')]],
  chios: ['chios', 'chios', [N(1389, 'Chios and Samos under the Genoese Maona', 'Ceneviz Maona şirketinin Sakız ve Sisam’ı')]],
  phocaea: ['chios', 'phocaea', [N(1389, 'Phocaea under the Genoese Maona', 'Ceneviz Maona şirketinin Foça’sı')]],
  lesbos: ['gattilusi', 'lesbos', [N(1389, 'Lesbos under the Gattilusi', 'Gattilusi ailesinin Midilli’si')]],
  ainos: ['gattilusi', 'ainos', [N(1389, 'Ainos under the Gattilusi', 'Gattilusi ailesinin Enez’i')]],
  rhodes: ['knights', 'rhodes', [N(1389, 'Rhodes and the Dodecanese, held by the Knights Hospitaller', 'Hospitalier şövalyelerinin Rodos ve Onikiada’sı')]],
  smyrna: ['knights', 'smyrna', [N(1389, 'Harbour castle of Smyrna, held by the Knights until 1402', '1402’ye dek şövalyelerin elindeki İzmir liman kalesi')]],
  kcorinth: ['knights', 'corinth', [N(1389, 'Corinth, held by the Knights 1397–1404', '1397–1404 arasında şövalyelerin elindeki Korint')]],
  karaman: ['karaman', 'karaman', [N(1389, 'Beylik of Karaman', 'Karamanoğulları Beyliği')]],
  germiyan: ['germiyan', 'germiyan', [N(1389, 'Beylik of Germiyan', 'Germiyanoğulları Beyliği')]],
  saruhan: ['saruhan', 'saruhan', [N(1389, 'Beylik of Saruhan', 'Saruhanoğulları Beyliği')]],
  aydin: ['aydin', 'aydin', [N(1389, 'Beylik of Aydın', 'Aydınoğulları Beyliği')]],
  mentese: ['mentese', 'mentese', [N(1389, 'Beylik of Menteşe', 'Menteşeoğulları Beyliği')]],
  hamid: ['hamid', 'hamid', [N(1389, 'Beylik of Hamid', 'Hamidoğulları Beyliği')]],
  teke: ['teke', 'teke', [N(1389, 'Beylik of Teke', 'Tekeoğulları Beyliği')]],
  candar: ['candar', 'candar', [N(1389, 'Beylik of Candar', 'Candaroğulları Beyliği'),
    N(1391.5, 'Beylik of Candar under İsfendiyar, an Ottoman vassal', 'Osmanlı’ya bağlı İsfendiyar Bey yönetiminde Candaroğulları Beyliği'),
    N(1402.6, 'Beylik of Candar under İsfendiyar', 'İsfendiyar Bey yönetiminde Candaroğulları Beyliği')]],
  canik: ['beyliks', 'canik', [N(1389, 'Turkmen beys of Canik', 'Canik’in Türkmen beyleri')]],
  burh: ['burhaneddin', 'burhaneddin', [N(1389, 'State of Kadı Burhaneddin', 'Kadı Burhaneddin Devleti')]],
  dul: ['dulkadir', 'dulkadir', [N(1389, 'Beylik of Dulkadir, a Mamluk vassal', 'Memlüklere bağlı Dulkadiroğulları Beyliği')]],
  erz: ['erzincan', 'erzincan', [N(1389, 'Emirate of Erzincan under Taharten', 'Taharten yönetiminde Erzincan Emirliği'),
    N(1400.4, 'Emirate of Erzincan under Taharten, Timur’s vassal', 'Timur’a bağlı Taharten yönetiminde Erzincan Emirliği'),
    N(1401.4, 'Emirate of Erzincan under Taharten, an Ottoman vassal', 'Osmanlı’ya bağlı Taharten yönetiminde Erzincan Emirliği'),
    N(1402.3, 'Emirate of Erzincan under Taharten, Timur’s vassal', 'Timur’a bağlı Taharten yönetiminde Erzincan Emirliği')]],
  aq: ['aq-qoyunlu', 'aq-qoyunlu', [N(1389, 'Aq Qoyunlu under Kara Yülük Osman', 'Kara Yülük Osman yönetiminde Akkoyunlular')]],
  jal: ['jalayirids', 'jalayirids', [N(1389, 'Jalayirid sultanate of Ahmad Jalayir', 'Celayirli Sultan Ahmed’in sultanlığı')]],
  tim: ['timurids', 'timurids', [N(1389, 'Timurid Empire', 'Timur İmparatorluğu')]],
  geo: ['georgia', 'georgia', [N(1389, 'Kingdom of Georgia', 'Gürcistan Krallığı')]],
  treb: ['trebizond', 'trebizond', [N(1389, 'Empire of Trebizond', 'Trabzon İmparatorluğu')]],
  mam: ['mamluks', 'mamluks', [N(1389, 'Mamluk Sultanate under Barquq', 'Berkuk yönetiminde Memlük Sultanlığı'),
    N(1399.47, 'Mamluk Sultanate under Faraj', 'Ferec yönetiminde Memlük Sultanlığı'),
    N(1412.4, 'Mamluk Sultanate under al-Mu’ayyad Shaykh', 'Müeyyed Şeyh yönetiminde Memlük Sultanlığı'),
    N(1421.05, 'Mamluk Sultanate', 'Memlük Sultanlığı')]],
};

// --- periods: the moment whose owners a page shows ---
const PERIODS = [
  // the Ottoman lands keep the outline of story 1's last page, the shared zone
  [1390.0, ['bayezid'], { outline: 'ottomans-1389' }],
  [1390.85, ['philadelphia']],
  [1392.5, ['kastamonu']],
  [1393.4, ['tarnovo']],
  [1394.5, ['constantinople']],
  [1394.95, ['serres']],
  [1395.37, ['rovine']],
  [1395.6, ['nikopol']],
  [1396.5, ['crusade']],
  [1396.68, ['vidin']],
  [1396.73, ['nicopolis']],
  [1397.1, ['after-nicopolis']],
  [1397.9, ['akcay']],
  [1399.5, ['morea']],
  [1399.8, ['sivas']],
  [1400.3, ['boucicaut', 'empire-1400']],
  [1400.55, ['sivas-1400']],
  [1401.45, ['syria']],
  [1402.4, ['ankara-march', 'ankara']],
  [1402.85, ['tripolje']],
  [1402.9, ['smyrna']],
  [1403.15, ['aksehir']],
  [1403.4, ['ulubad']],
  [1403.95, ['gallipoli-treaty']],
  [1405.0, ['suleyman']],
  [1411.15, ['musa']],
  [1411.8, ['constantinople-1411']],
  [1412.2, ['incegiz']],
  [1413.45, ['camurlu']],
  [1414.6, ['mehmed']],
  [1415.4, ['doboj']],
  [1416.4, ['gallipoli-1416', 'mustafa', 'bedreddin']],
  [1420.7, ['wallachia', 'samsun', 'green-mosque']],
  [1421.45, ['mehmed-death']],
];
// the phase pages of the two battle plans show none
const NONE = ['nicopolis-charge', 'nicopolis-sipahis', 'nicopolis-serbs', 'ankara-lines', 'ankara-desertion', 'ankara-hill'];
// the Ottoman lands of these pages are shared zones that other stories open or close on
const SHARED = [
  { id: 'ottomans-1402', page: 'ankara-march', en: 'Ottoman state before the Battle of Ankara, 1402', tr: 'Ankara Savaşı’ndan önce Osmanlı Devleti, 1402' },
  { id: 'ottomans-1421', page: 'mehmed-death', en: 'Ottoman state at the death of Mehmed I, 1421', tr: 'I. Mehmed’in ölümünde Osmanlı Devleti, 1421' },
];
// a page that looks closer than the town areas reach: its zones split its frame along the river of the time, as the
// battle plan traces it, and follow the modern border of the countries on either bank beyond the trace. A small
// place on one bank is a zone of its own: [owner, centre, radius in km]
const CLOSE = {
  nicopolis: {
    frame: [24.3, 43.3, 25.5, 44.1], south: ['ott', 'Bulgaria'], north: ['wallachia', 'Romania'],
    // the Danube's middle from .plans/nicopolis-1396.mjs
    river: [[24.62, 43.746], [24.67, 43.735], [24.71, 43.729], [24.74, 43.726], [24.77, 43.719], [24.8, 43.7135], [24.83, 43.7135], [24.86, 43.708],
      [24.89, 43.709], [24.92, 43.7155], [24.95, 43.7185], [24.98, 43.7235], [25.02, 43.728], [25.06, 43.73], [25.1, 43.731], [25.16, 43.728]],
    // Little Nicopolis (Turnu) on the north bank, held by a Hungarian garrison
    small: [['hungary', [24.876, 43.722], 2.5, 'north']],
  },
};


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
// pairs of sites a raster cell to either side of the rivers that modern borders follow, every RES along them, so the
// cells meet on the river and not up to a lattice step away from it
for (const pair of RIVER_BORDERS) {
  const key = [...pair].sort().join('|');
  for (const line of tc.mesh(world, world.objects.countries, (a, b) => a !== b && [a.properties.name, b.properties.name].sort().join('|') === key).coordinates)
    for (let i = 0; i < line.length - 1; i++) {
      const [a, b] = [line[i], line[i + 1]], len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(len / RES));
      if (!len) continue;
      const nx = -(b[1] - a[1]) / len * RES * 1.2, ny = (b[0] - a[0]) / len * RES * 1.2;
      for (let k = 0; k < n; k++) {
        const x = a[0] + (b[0] - a[0]) * (k + 0.5) / n, y = a[1] + (b[1] - a[1]) * (k + 0.5) / n;
        for (const side of [1, -1]) { const c = cellAt(x + side * nx, y + side * ny); if (c >= 0 && land[c]) site(x + side * nx, y + side * ny, ownerNear(x + side * nx, y + side * ny)); }
      }
    }
}
towns.forEach((t, k) => { if (t.cell !== undefined) { t.site = site(...centre(t.cell), k); } });
const townIdx = Object.fromEntries(towns.map((t, k) => [t.id, k]));
for (const [id, [lon, lat, t]] of Object.entries(SEA)) { if (!(t in townIdx)) throw new Error(`sea site ${id}: no town ${t}`); site(lon, lat, townIdx[t]); }
// the small places, drawn by a fine grid of sites of their own inside them and a ring of their neighbours' sites. Two
// small places side by side, the walled city and Galata, keep each other's sites
const units = [...towns, ...Object.entries(SMALL).map(([id, [ring, h]]) => ({ id, small: poly(ring), steps: history(id, h) }))];
const smallAt = (x, y) => units.findIndex(v => v.small && turf.booleanPointInPolygon([x, y], v.small));
units.forEach((u, k) => {
  if (!u.small) return;
  const [w, s, e, n] = turf.bbox(u.small), step = Math.max(e - w, n - s) / 8;
  u.at = turf.pointOnFeature(u.small).geometry.coordinates;
  for (const [key, [x, y, o]] of sites) if (x > w - 3 * step && x < e + 3 * step && y > s - 3 * step && y < n + 3 * step && !units[o]?.small) sites.delete(key);
  for (let y = s - 2 * step; y <= n + 2 * step + 1e-9; y += step) for (let x = w - 2 * step; x <= e + 2 * step + 1e-9; x += step) {
    const inside = smallAt(x, y);
    site(x, y, inside >= 0 ? inside : ownerNear(x, y));
  }
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

// --- the zones of each period: its owners' cells merged. An owner whose land lies in parts, such as islands, keeps them
// as one zone of several parts ---
const Z = {}, byKey = {};
const nameAt = (o, year) => O[o][2].filter(n => n.from <= year).at(-1);
// ids that stand for shared zones: story 1's last Ottoman lands and the two this story writes
for (const id of ['ottomans-1389', ...SHARED.map(s => s.id)]) Z[id] = { id, reserved: true };
const freeId = id => { while (Z[id]) id = id.replace(/(-\d+)([a-z]?)$/, (_, y, s) => y + (s ? String.fromCharCode(s.charCodeAt(0) + 1) : 'b')); return id; };
const geometryOf = parts => parts.length > 1 ? { type: 'MultiPolygon', coordinates: parts.map(x => x.p) } : { type: 'Polygon', coordinates: parts[0].p };
const aliases = {};
const periodZones = PERIODS.map(([year, pages, opts = {}]) => {
  const owned = {};
  units.forEach((u, k) => { const o = ownerAt(u.steps, year); if (o !== '-') (owned[o] ??= []).push(k); });
  const ids = [];
  for (const [o, idx] of Object.entries(owned)) {
    const merged = tc.merge(topo, idx.flatMap(k => unitGeoms[k]));
    const parts = merged.coordinates.map(p => ({ p, a: km2(turf.polygon(p)) })).sort((x, y) => y.a - x.a);
    // a piece under 30 km2 is a stray cell, unless it holds a small place such as the walled city
    for (const x of parts.slice(1)) if (x.a < 30 && !units.some(u => u.small && turf.booleanPointInPolygon(u.at, turf.polygon(x.p)))) problems.push(`${year} ${o}: a piece of ${x.a.toFixed(1)} km2 at ${turf.centroid(turf.polygon(x.p)).geometry.coordinates.map(v => v.toFixed(2))}`);
    const name = nameAt(o, year), members = idx.map(k => units[k].id).sort();
    // a period that shows a shared outline for the Ottoman lands gets zones of its own, drawn to meet that outline
    const key = `${o}|${name.en}|${members.join(',')}${opts.outline ? `|${year}` : ''}`;
    if (!byKey[key]) {
      const id = freeId(`${name.id ?? O[o][1]}-${Math.floor(year)}`);
      Z[id] = { id, owner: o, family: O[o][0], name, towns: members, geometry: geometryOf(parts) };
      byKey[key] = id;
    }
    ids.push(byKey[key]);
  }
  // the shared outline of the Ottoman lands differs from this drawing by a few km along its borders, so the zones around
  // it reach into this period's Ottoman land, and the build trims them along the outline
  if (opts.outline) {
    const ott = ids.find(id => Z[id].owner === 'ott'), land = turf.feature(Z[ott].geometry);
    for (const id of ids) if (id !== ott) {
      const reach = I(turf.buffer(turf.feature(Z[id].geometry), 40, { units: 'kilometers' }), land);
      if (reach) Z[id].geometry = U(turf.feature(Z[id].geometry), reach).geometry;
    }
    const zone = Z[ott];
    delete Z[ott];
    const alias = freeId(`ottomans-${Math.floor(year)}`);
    Z[alias] = { ...zone, id: alias };
    aliases[alias] = { zone: opts.outline, name: zone.name };
    ids[ids.indexOf(ott)] = alias;
  }
  return { year, pages, ids };
});

// the shared Ottoman zones of this story: the Ottoman lands of their page. Another period with the same outline names
// it under an id and name of its own in shared/zones.yaml
const sharedOf = {};
for (const s of SHARED) {
  const p = periodZones.find(q => q.pages.includes(s.page)), own = p.ids.find(id => Z[id].owner === 'ott');
  sharedOf[s.id] = own;
  for (const q of periodZones) q.ids = q.ids.map(id => {
    if (q === p && id === own) return s.id;
    if (Z[id]?.owner !== 'ott' || Z[id].towns.join(',') !== Z[own].towns.join(',')) return id;
    const alias = freeId(`ottomans-${Math.floor(q.year)}`);
    Z[alias] = { ...Z[own], id: alias, name: nameAt('ott', q.year) };
    aliases[alias] = { zone: s.id, name: Z[alias].name };
    return alias;
  });
}
const zoneOf = id => sharedOf[id] ? Z[sharedOf[id]] : Z[id];

// the close pages: the frame split along the river, the countries beyond the trace, and the small places
for (const [p, { frame, south, north, river, small }] of Object.entries(CLOSE)) {
  const period = periodZones.find(q => q.pages.includes(p)), year = period.year, box = turf.bboxPolygon(frame), ids = [];
  const [, s, , n] = frame, x0 = river[0][0], x1 = river.at(-1)[0], span = turf.bboxPolygon([x0, s, x1, n]);
  const side = { south: poly([...river, [x1, s], [x0, s]]), north: poly([...river, [x1, n], [x0, n]]) };
  const bank = ([, c], key) => U(side[key], D(I(country(c), box), span));
  const smalls = small.map(([o, at, km, key]) => [o, I(turf.circle(at, km, { steps: 32 }), side[key])]);
  for (const [o, g] of [[south[0], D(bank(south, 'south'), smalls.map(x => x[1]))], [north[0], D(bank(north, 'north'), smalls.map(x => x[1]))], ...smalls]) {
    const id = freeId(`${nameAt(o, year).id ?? O[o][1]}-${Math.floor(year)}-${p}`);
    Z[id] = { id, owner: o, family: O[o][0], name: nameAt(o, year), towns: [], close: true, geometry: g.geometry };
    ids.push(id);
  }
  period.close = { ...period.close, [p]: ids };
}

// --- the legend: a page lists the zones with at least SHOWN of the land inside its frame ---
const SHOWN = 0.0005;
// a zone under SHOWN stays on a page whose text names it
const NAMED = { byz: /Constantinople/, galata: /Galata|Pera\b/, smyrna: /harbour castle/, chios: /Chios/, phocaea: /Phocaea|Phokaia/, lesbos: /Lesbos|Gattilusi/,
  amastris: /Amastris/, ainos: /Ainos/, phil: /Philadelphia/, selym: /Selymbria/, rhodes: /Rhodes|Knights/, negro: /Negroponte|Euboea|Oreos/,
  crete: /Crete/, messenia: /Modon|Coron/, nauplia: /Nauplia|Argos/, corfu: /Corfu/, morea: /Morea|Mistra/, thes: /Thessalonica/, byzisl: /Lemnos/,
  sporades: /Sporades/, kcorinth: /Corinth/, venalb: /Durazzo|Scutari|Skadar/, tinos: /Tinos|Mykonos/, archipelago: /Naxos|Andros|Paros|Melos/,
  ragusa: /Ragusa/, venath: /Athens/, acc: /Athens|Thebes|Acciaioli/, achaea: /Achaea|Navarrese/, zeta: /Zeta|Ulcinj|Balšić/, valona: /Valona/,
  dalmatia: /Zadar|Šibenik|Split/, lepanto: /Lepanto/ };
// a family is one state; its parts on a page join into one zone named for the state where its owners differ
const FAMILY_NAMES = {
  venice: ['venetian-colonies', 'Republic of Venice and its colonies', 'Venedik Cumhuriyeti ve kolonileri'],
  genoa: ['genoese-colonies', 'Genoese colonies', 'Ceneviz kolonileri'],
  chios: ['chios', 'Chios and Phocaea under the Genoese Maona', 'Ceneviz Maona şirketinin Sakız ve Foça’sı'],
  gattilusi: ['gattilusi', 'Lesbos and Ainos under the Gattilusi', 'Gattilusi ailesinin Midilli ve Enez’i'],
  knights: ['knights', 'Knights Hospitaller', 'Hospitalier şövalyeleri'],
  epirus: ['epirus', 'Ioannina under Esau Buondelmonti and the islands of Carlo I Tocco', 'Esau Buondelmonti’nin Yanya’sı ve I. Carlo Tocco’nun adaları'],
};
// on a crowded page small states join into one zone named for the group: [family, id, English, Turkish, owners]
const LUMPS = {
  albanians: ['albanian-lords', 'albanian-lords', 'Albanian lords', 'Arnavut beyleri', ['alb', 'valona']],
  latins: ['achaea', 'latin-lords', 'Latin lords of Greece', 'Yunanistan’daki Latin beyleri', ['achaea', 'acc', 'esau', 'tocco']],
  genoese: ['genoa', 'genoese-lords', 'Genoese colonies and lords', 'Ceneviz kolonileri ve beyleri', ['galata', 'amastris', 'chios', 'phocaea', 'lesbos', 'ainos']],
};
const LUMPED = { crusade: ['albanians', 'latins', 'genoese'], boucicaut: ['albanians', 'latins', 'genoese'],
  'after-nicopolis': ['albanians', 'latins', 'genoese'], 'empire-1400': ['albanians', 'latins', 'genoese'], nikopol: ['albanians'],
  tripolje: ['albanians', 'latins', 'genoese'], 'gallipoli-treaty': ['albanians', 'genoese'], wallachia: ['latins', 'genoese'],
  'mehmed-death': ['latins', 'genoese'], bedreddin: ['genoese'], aksehir: ['genoese'] };
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
  const id = freeId(`${base}-${year}`);
  Z[id] = { id, owner: key, family, name: { en, tr }, towns: [...new Set(inside.flatMap(m => zoneOf(m).towns))].sort(), geometry: shape.geometry };
  return lumpKeys[k] = { id, members: inside };
};
const order = Object.keys(storyYaml.families);
const PAGES = {};
for (const period of periodZones) for (const p of period.pages) {
  const { year, ids } = period;
  if (!BBOX[p]) throw new Error(`no page ${p}`);
  if (period.close?.[p]) { PAGES[p] = period.close[p]; continue; }
  const box = BBOX[p], { by, total } = landIn(box), text = textOf(p);
  const share = id => zoneOf(id).towns.reduce((sum, t) => sum + (t in townIndex ? by[townIndex[t]]
    : inBox(box)(...smallLand[t].at) ? smallLand[t].km : 0), 0) / total;
  const whole = id => zoneOf(id).towns.reduce((sum, t) => sum + (t in townIndex ? landOf[townIndex[t]] : smallLand[t].km), 0) * 0.9 <= share(id) * total;
  PAGES[p] = ids.filter(id => {
    const z = zoneOf(id), sh = share(id);
    return sh >= SHOWN || sh > 0 && NAMED[z.owner]?.test(text) || sh >= 0.0002 && whole(id);
  });
  // a state on the page shows all its parts in the frame, as one zone
  const families = new Set(PAGES[p].map(id => zoneOf(id).family));
  PAGES[p].push(...ids.filter(id => !PAGES[p].includes(id) && families.has(zoneOf(id).family) && share(id) > 0));
  if (process.argv.includes('--legends')) console.log(`  ${p} leaves out: ${ids.filter(id => !PAGES[p].includes(id) && share(id) > 0).map(id => `${id} ${(100 * share(id)).toFixed(2)}%`).join(', ')}`);
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
  // owner in O, or of the family where its owners are separate lords
  const shownOf = f => PAGES[p].filter(id => zoneOf(id).family === f);
  for (const family of new Set(PAGES[p].map(id => zoneOf(id).family))) {
    if (shownOf(family).length < 2) continue;
    const members = ids.filter(id => zoneOf(id).family === family && !LUMPED[p]?.some(k => LUMPS[k][4].includes(zoneOf(id).owner)));
    const first = Object.keys(O).find(o => members.some(m => zoneOf(m).owner === o));
    if (!first) { problems.push(`page ${p}: family ${family} has the zones ${shownOf(family).join(", ")}`); continue; }
    const name = nameAt(first, year);
    const [base, en, tr] = FAMILY_NAMES[family] ?? [name.id ?? O[first][1], name.en, name.tr];
    const { id, members: inside } = lump(`one ${family}`, family, base, en, tr, members, Math.floor(year));
    if (id) PAGES[p] = [...PAGES[p].filter(x => !inside.includes(x)), id];
    if (shownOf(family).length > 1) problems.push(`page ${p}: family ${family} has the zones ${shownOf(family).join(', ')}`);
  }
  PAGES[p].sort((a, b) => order.indexOf(zoneOf(a).family) - order.indexOf(zoneOf(b).family));
}
for (const p of NONE) { if (!BBOX[p]) throw new Error(`no page ${p}`); PAGES[p] = []; }
for (const p of Object.keys(BBOX)) if (!PAGES[p]) problems.push(`page ${p} has no period`);
if (process.argv.includes('--legends')) for (const [p, ids] of Object.entries(PAGES)) console.log(`  ${p}: ${ids.join(' ')}`);

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

// --- write: the story's zones, the shared zones with their Turkish names, the aliases, the page map, each page's zones
// line, the Turkish names. With --no-shared the shared zones go to .cache/ only, to compare them first
const round = c => typeof c[0] === 'number' ? [+c[0].toFixed(5), +c[1].toFixed(5)] : c.map(round);
const feature = (id, props) => ({ type: 'Feature', properties: props, geometry: { type: shapes[id].type, coordinates: round(shapes[id].coordinates) } });
const dir = path.join(story, 'shared', 'zones');
fs.mkdirSync(dir, { recursive: true });
for (const f of fs.readdirSync(dir)) if (f.endsWith('.geojson')) fs.rmSync(path.join(dir, f));
const sharedIds = SHARED.map(s => s.id);
for (const id of drawn) if (!sharedIds.includes(id)) fs.writeFileSync(path.join(dir, id + '.geojson'), JSON.stringify(feature(id, { family: Z[id].family, name: Z[id].name.en })) + '\n');
for (const s of SHARED) {
  const json = JSON.stringify(feature(s.id, { family: 'ottomans', name: s.en })) + '\n';
  const cache = path.join(repo, '.cache', 'ottoman-bayezid-i-mehmed-i-shared');
  fs.mkdirSync(cache, { recursive: true });
  fs.writeFileSync(path.join(cache, s.id + '.geojson'), json);
  if (process.argv.includes('--no-shared')) continue;
  const sharedDir = path.join(content, 'shared', 'zones', s.id);
  fs.mkdirSync(path.join(sharedDir, 'i18n'), { recursive: true });
  fs.writeFileSync(path.join(sharedDir, 'zone.geojson'), json);
  fs.writeFileSync(path.join(sharedDir, 'i18n', 'tr.yaml'), `zone.name: ${JSON.stringify(s.tr)}\n`);
}
const usedAliases = Object.entries(aliases).filter(([id]) => used.includes(id));
const aliasFile = path.join(story, 'shared', 'zones.yaml');
if (usedAliases.length) fs.writeFileSync(aliasFile, '# The Ottoman lands of these pages have the outline of a shared zone. Written by .plans/zones.mjs.\n'
  + usedAliases.map(([id, a]) => `${id}: { zone: ${a.zone}, name: ${JSON.stringify(a.name.en)} }`).join('\n') + '\n');
else fs.rmSync(aliasFile, { force: true });
fs.writeFileSync(path.join(story, '.plans', 'zones.yaml'), '# Zones per page, written by .plans/zones.mjs. The phase pages of the battle plans show none.\n'
  + Object.entries(PAGES).map(([p, ids]) => `${p}: [${ids.join(', ')}]`).join('\n') + '\n');
for (const [p, ids] of Object.entries(PAGES)) {
  const file = path.join(pageDir[p], 'page.yaml'), text = fs.readFileSync(file, 'utf8'), line = `zones: [${ids.join(', ')}]`;
  fs.writeFileSync(file, /^zones:.*$/m.test(text) ? text.replace(/^zones:.*$/m, line) : text.replace(/^(bbox:.*)$/m, `$1\n${line}`));
}
fs.mkdirSync(path.join(story, '.i18n-parts'), { recursive: true });
fs.writeFileSync(path.join(story, '.i18n-parts', 'zones.tr.yaml'), used.filter(id => !sharedIds.includes(id))
  .map(id => `zones.${id}.name: ${JSON.stringify(zoneOf(id).name.tr)}`).join('\n') + '\n');
console.log(`${used.length} zones on ${Object.values(PAGES).filter(l => l.length).length} pages, the longest legend ${Math.max(...Object.values(PAGES).map(l => l.length))}`);
