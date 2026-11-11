// The political map: one set of zones per period, written to shared/zones/, with the page map in .plans/zones.yaml
// and the Turkish names in .i18n-parts/zones.tr.yaml. Run from the repo root, then merge the page map:
//   node content/ottoman/ottoman-mehmed-ii/.plans/zones.mjs
//   node scripts/merge-parts.mjs ottoman-mehmed-ii zones
// Each town has an owners' timeline and an area, the land nearest to it along the ground; a period's zones are its
// owners' areas joined in one topology. The towns, lines, raster and lattice are story 3's where the land is the same,
// so the borders of 1451 meet the shared zone ottomans-1451 that story 3 ends on. The pages of 1451 to 1453 show that
// outline, redrawn only around the towns whose owner differs from it, and the Ottoman lands of 1481 go to
// content/shared/zones/ for the story of Bayezid II.
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
const story3 = path.join(content, 'ottoman', 'ottoman-murad-ii');

// --- geometry helpers, Features in and out ---
// story 2's box, over which the noise and the first lattice come out as in stories 2 and 3, and the box of this story,
// which reaches a degree further west than story 3's for the Veneto
const BOX2 = [12, 29.5, 53, 50], BOX = [11, 29.5, 53, 52.5];
const fc = (...a) => turf.featureCollection(a.flat().filter(Boolean));
const U = (...a) => { const p = a.flat().filter(Boolean); return p.length > 1 ? turf.union(fc(p)) : p[0] ?? null; };
const I = (a, b) => a && b ? turf.intersect(fc(a, b)) : null;
const D = (a, ...b) => { b = b.flat().filter(Boolean); return a && b.length ? turf.difference(fc(a, ...b)) : a; };
const poly = pts => turf.polygon([[...pts, pts[0]]]);
const km2 = f => f ? turf.area(f) / 1e6 : 0;
const polysOf = g => !g ? [] : g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
const multi = ps => { ps = ps.filter(p => p[0]?.length >= 4); return ps.length ? turf.multiPolygon(ps) : null; };
const problems = [];

// the story's land, which the build clips the zones to: to filter each page's zones and to find towns on the wrong shore
const storyYaml = yaml.load(fs.readFileSync(path.join(story, 'story.yaml'), 'utf8'));
const countries = tc.feature(world, world.objects.countries).features;
const country = n => { const f = countries.find(c => c.properties.name === n); if (!f) throw new Error(`no country ${n}`); return f; };
// a clip to the box can leave rings of fewer than four points where a country only touches its edge
const landOfNames = names => U(names.map(n => multi(polysOf(turf.bboxClip(country(n), BOX).geometry))).filter(Boolean));
const LAND = landOfNames(storyYaml.land);
const landNear = f => multi(polysOf(turf.bboxClip(LAND, turf.bbox(f)).geometry));
// the countries the story leaves out, cut from the shared zone so that a story with other land finds no sea cell on them
const OFFLAND = U(countries.filter(c => !storyYaml.land.includes(c.properties.name) && c.geometry && turf.booleanIntersects(c, turf.bboxPolygon(BOX)))
  .map(c => multi(polysOf(turf.bboxClip(c, BOX).geometry))).filter(Boolean));

// --- borders that follow nature: crossing a river or a range costs BARRIER km of road, so a border between two towns
// runs along it where one lies between them. [lon, lat] lines, story 3's with the Isonzo, the Dniester and the Dnieper
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
  shkumbin: [[20.45, 41.15], [20.3, 41.17], [20.1, 41.09], [19.9, 41.06], [19.7, 41.07], [19.45, 41.03]],
  vjosa: [[20.75, 40.05], [20.55, 40.17], [20.35, 40.23], [20.15, 40.27], [20.02, 40.3], [19.85, 40.4], [19.63, 40.53], [19.4, 40.63]],
  beskids: [[22.56, 49.08], [23.0, 48.9], [23.5, 48.7], [24.0, 48.4], [24.6, 47.95]],
  // the Danube from Silistra to the delta, between Dobruja and the Wallachian plain
  danube: [[27.27, 44.12], [27.6, 44.15], [27.9, 44.22], [27.98, 44.33], [27.93, 44.5], [27.88, 44.68], [27.9, 44.95], [27.98, 45.2], [28.04, 45.33],
    [28.15, 45.4], [28.35, 45.36], [28.47, 45.31], [28.65, 45.25], [28.75, 45.24], [28.83, 45.31], [29.0, 45.36], [29.27, 45.39], [29.6, 45.36], [29.7, 45.31]],
  // the Isonzo between Venetian Friuli and Gorizia, the Dniester between Moldavia and the steppe, the lower Dnieper
  isonzo: [[13.55, 46.35], [13.58, 46.22], [13.7, 46.17], [13.63, 46.0], [13.6, 45.92], [13.52, 45.85], [13.53, 45.72]],
  dniester: [[26.6, 48.6], [27.1, 48.45], [27.6, 48.35], [28.2, 48.1], [28.65, 47.8], [29.15, 47.45], [29.3, 47.1], [29.6, 46.8], [29.95, 46.5], [30.2, 46.35], [30.3, 46.2]],
  dnieper: [[35.1, 48.0], [35.1, 47.75], [34.6, 47.55], [34.1, 47.45], [33.6, 47.0], [33.35, 46.8], [33.0, 46.7], [32.7, 46.62], [32.3, 46.55]],
};
// rivers and ranges that modern borders follow, taken from the Natural Earth borders: story 3's, with the Alps between
// Italy and Austria and the Caucasus between Georgia, Azerbaijan and Russia
const RIVER_BORDERS = [['Romania', 'Bulgaria'], ['Romania', 'Serbia'], ['Croatia', 'Serbia'], ['Bosnia and Herz.', 'Croatia'],
  ['Bosnia and Herz.', 'Serbia'], ['Greece', 'Turkey'], ['Greece', 'Bulgaria'], ['Poland', 'Slovakia'],
  ['Austria', 'Italy'], ['Georgia', 'Russia'], ['Azerbaijan', 'Russia']];
// straits narrower than the raster, which no town's area crosses
const WATER = {
  bosporus: [[29.125, 41.23], [29.105, 41.2], [29.083, 41.18], [29.062, 41.16], [29.073, 41.14], [29.073, 41.12], [29.065, 41.1], [29.055, 41.08],
    [29.045, 41.06], [29.013, 41.04], [29.0, 41.02], [29.0, 40.995], [29.0, 40.97]],
  dardanelles: [[26.69, 40.405], [26.66, 40.37], [26.625, 40.34], [26.59, 40.31], [26.535, 40.28], [26.5, 40.25], [26.46, 40.22], [26.375, 40.19],
    [26.385, 40.16], [26.375, 40.13], [26.33, 40.1], [26.3, 40.07], [26.26, 40.035]],
  euripus: [[23.585, 38.5], [23.592, 38.465], [23.6, 38.44]],
  rion: [[21.74, 38.315], [21.79, 38.322], [21.84, 38.326]],
  messina: [[15.66, 38.3], [15.64, 38.25], [15.62, 38.2], [15.6, 38.12], [15.57, 38.02]],
  kerch: [[36.64, 45.47], [36.63, 45.4], [36.64, 45.33], [36.6, 45.27], [36.57, 45.2], [36.55, 45.1], [36.5, 45.0]],
};
// sea sites, far enough from the shore to take no land, that join a coastal town's area to its owner's other towns
// across the water: [lon, lat, town]
const SEA = {
  midia: [28.35, 41.78, 'agathopolis'], strandzha: [28.22, 42.08, 'agathopolis'], burgas: [28.0, 42.4, 'agathopolis'], emine: [28.05, 42.7, 'agathopolis'],
  // the sea off Selymbria, so the Ottoman sea cells do not reach its shore
  silivri: [28.25, 41.0, 'selymbria'],
};
// the lattice of sites in degrees, finer where pages look closely: story 3's Constantinople and Albanian coast, and here
// the coast of Zeta and Lake Shkodër
const LATTICE = 0.07, FINE3 = [[[28.0, 40.7, 29.5, 41.4], 0.02], [[19.3, 41.2, 20.3, 42.2], 0.025]];
const FINE4 = [[[18.5, 41.75, 19.3, 42.7], 0.025], [[19.3, 42.2, 20.0, 42.7], 0.025]];
const FINE = [...FINE3, ...FINE4];

// --- towns: [lon, lat, owners]. The owner at the start, then each later owner after the year it takes over; - is no
// zone. A town stands for the country around it up to the next town, so towns sit on both sides of a border that
// matters. Story 3's towns keep their timelines to 1451; a change dated 1451.05 is this story's reading of 1451
const THR = 'byz 1424.15 ott'; // the land of Constantinople ceded in 1403, given back in February 1424
const GERM = 'germiyan 1429.05 ott'; // Yakub II leaves Germiyan to Murad, January 1429
const AYD = 'ott 1424.4 aydin 1425.4 ott'; // Cüneyd's revolt
const MENT = 'mentese 1426.2 ott';
const HAMID = 'ott 1422.65 karaman 1424.3 ott 1428.3 karaman 1437.6 ott'; // the Hamid lands around Isparta
const TEKE = 'teke 1423.4 ott'; // the Teke beylik until Osman Çelebi’s death in 1423, Antalya Ottoman since 1420
// Beyşehir and Akşehir, Karaman's by the peace of 1444; Mehmed has them by the peace of autumn 1451
const BEY = 'ott 1428.3 karaman 1437.6 ott 1444.6 karaman 1451.7 ott';
const AKS = 'ott 1428.3 karaman 1436.5 ott 1444.6 karaman 1451.7 ott';
const CANIK = '- 1428 ott'; // the Turkmen beys of Canik, outside every frame until 1428
// the Serbian Despotate: lost in 1439 and given back in 1444; the south taken in 1455, the north in 1459
const SRB = 'serbia 1439.63 ott 1444.62 serbia';
const SRBS = SRB + ' 1455.4 ott', SRBN = SRB + ' 1459.45 ott';
const ACH = 'achaea 1429.7 morea'; // the Principality of Achaea, Catherine Zaccaria's dowry
// Albania: the revolt of 1432–1436, Skanderbeg from November 1443, the League of Lezhë from March 1444
const NORTH = 'ott 1433.3 alb 1435.5 ott 1444.2 skanderbeg'; // the Dukagjini lands north of the Mat
const ARIANITI = 'ott 1432.7 alb 1436.5 ott 1443.6 arianiti 1444.2 skanderbeg 1450.1 alb';
// the plain round Tirana: the League's from 1451, Ottoman in the siege of 1466, the League's again in 1467
const LEAGUE = ' 1451.3 skanderbeg 1466.4 ott 1467.5 skanderbeg 1468.1 ott';
const CAND = 'candar 1461.4 ott'; // İsmail Bey gives up Sinop in 1461
const TREB = 'treb 1461.62 ott'; // Trebizond surrenders in August 1461
const KK = 'kk 1467.9 aq'; // Jahan Shah's lands, Uzun Hasan's after November 1467
const KKAQ = 'kk 1458 aq'; // the upper Euphrates, Uzun Hasan's by 1461
// the Morea after the fall of Constantinople: the despots Thomas and Demetrios, the revolt of 1453–1454
const TH = ' 1453.42 thomas', DM = ' 1453.42 demetrios', REB = ' 1453.6 rebels 1454.8';
// the Kosača lands: the north given up by the truce of 1463, the east in 1465, Blagaj and Mostar in 1466, the lower
// Neretva by 1477
const HERZ_E = 'herz 1465.5 ott', HERZ_S = 'herz 1466.5 ott', HERZ_W = 'herz 1477 ott';
const BOS = 'bosnia 1463.4 ott';
const CRIM = 'crimea', VEN = 'veneto', PAP = 'papal', NAP = 'naples';
const T = {
  // Bithynia and Paphlagonia
  sogut: [30.18, 40.02, 'ott'], bozuyuk: [30.04, 39.91, 'ott'], domanic: [29.61, 39.8, 'ott'], inonu: [30.145, 39.815, 'ott'], eskisehir: [30.52, 39.77, 'ott'],
  kulaca: [29.43, 40.03, 'ott'], inegol: [29.51, 40.08, 'ott'], bilecik: [29.98, 40.14, 'ott'], yarhisar: [29.74, 40.19, 'ott'], yenisehir: [29.65, 40.27, 'ott'],
  harmankaya: [30.36, 40.08, 'ott'], koprihisar: [29.85, 40.33, 'ott'], lefke: [30.01, 40.36, 'ott'], mekece: [30.07, 40.44, 'ott'], golpazari: [30.32, 40.29, 'ott'],
  pamukova: [30.17, 40.51, 'ott'], geyve: [30.29, 40.51, 'ott'], tarakli: [30.49, 40.4, 'ott'], goynuk: [30.79, 40.4, 'ott'], mudurnu: [31.21, 40.47, 'ott'],
  kestel: [29.21, 40.2, 'ott'], uludag: [29.15, 40.05, 'ott'], ulubat: [28.43, 40.17, 'ott'], kite: [28.86, 40.21, 'ott'], mudanya: [28.885, 40.375, 'ott'],
  adranos: [28.99, 39.9, 'ott'], karamursel: [29.615, 40.69, 'ott'], hersek: [29.52, 40.7, 'ott'], altinova: [29.4, 40.67, 'ott'], golcuk: [29.83, 40.715, 'ott'],
  bursa: [29.06, 40.185, 'ott'], kios: [29.16, 40.43, 'ott'], orhangazi: [29.31, 40.49, 'ott'], armutlu: [28.83, 40.52, 'ott'], kapakli: [29.0, 40.47, 'ott'],
  gemlikbay: [29.0, 40.33, 'ott'], yalova: [29.27, 40.65, 'ott'], sapanca: [30.27, 40.69, 'ott'], aydos: [29.27, 40.96, 'ott'], kocaelihills: [29.62, 40.93, 'ott'],
  nicaea: [29.72, 40.43, 'ott'], nicomedia: [29.92, 40.765, 'ott'], derince: [29.8, 40.79, 'ott'], hereke: [29.62, 40.79, 'ott'], gebze: [29.43, 40.8, 'ott'],
  tuzla: [29.3, 40.83, 'ott'], kartal: [29.19, 40.9, 'ott'], chrysopolis: [29.03, 41.01, 'ott'], yoros: [29.1, 41.16, 'ott'], omerli: [29.37, 41.05, 'ott'],
  kandira: [30.15, 41.07, 'ott'], agva: [29.85, 41.13, 'ott'], sile: [29.61, 41.175, 'ott'], adapazari: [30.4, 40.78, 'ott'], akyazi: [30.62, 40.68, 'ott'],
  karasu: [30.69, 41.08, 'ott'], konuralp: [31.15, 40.9, 'ott'], bolu: [31.6, 40.73, 'ott'], gerede: [32.19, 40.8, 'ott'], nallihan: [31.35, 40.19, 'ott'],
  beypazari: [31.92, 40.17, 'ott'], kizilcahamam: [32.65, 40.47, 'ott'], ankara: [32.86, 39.94, 'ott'], polatli: [32.15, 39.58, 'ott'], kirikkale: [33.52, 39.85, 'ott'],
  sivrihisar: [31.54, 39.45, GERM], mihaliccik: [31.5, 39.86, 'ott'],
  kalecik: [33.41, 40.1, 'ott'], cankiri: [33.62, 40.6, 'ott'], tosya: [34.03, 41.02, 'ott'], safranbolu: [32.69, 41.25, 'candar 1423.5 ott'],
  bartin: [32.34, 41.63, CAND], amastris: [32.39, 41.74, 'amastris 1460.75 ott'], kurucasile: [32.72, 41.83, CAND],
  cide: [33.0, 41.88, CAND], kastamonu: [33.78, 41.38, CAND], sinop: [35.15, 42.02, CAND], boyabat: [34.77, 41.47, CAND], bafra: [35.9, 41.57, CAND],
  // central and eastern Anatolia
  osmancik: [34.8, 41.0, 'ott'], corum: [34.95, 40.55, 'ott'], amasya: [35.83, 40.65, 'ott'], tokat: [36.55, 40.31, 'ott'], niksar: [36.96, 40.59, 'ott'],
  erbaa: [36.57, 40.69, 'ott'], resadiye: [37.33, 40.39, 'ott'], samsun: [36.33, 41.29, 'ott'],
  carsamba: [36.72, 41.2, CANIK], unye: [37.28, 41.13, CANIK], ordu: [37.88, 40.98, CANIK],
  giresun: [38.39, 40.91, TREB], tirebolu: [38.8, 41.0, TREB], vakfikebir: [39.27, 41.03, TREB], trabzon: [39.72, 41.0, TREB], rize: [40.52, 41.02, TREB],
  // the Matzouka valley up to the Zigana pass, the coast east of Rize, and Lazona, Georgian
  macka: [39.61, 40.81, TREB], zigana: [39.4, 40.66, TREB], of: [40.27, 40.95, TREB], pazar: [40.88, 41.18, TREB], hopa: [41.43, 41.4, 'georgia'],
  gumushane: [39.48, 40.46, 'aq'], bayburt: [40.23, 40.26, KKAQ], erzincan: [39.5, 39.75, KKAQ], kemah: [38.48, 39.6, KKAQ], tunceli: [39.55, 39.1, KKAQ],
  ispir: [40.99, 40.48, KKAQ], erzurum: [41.27, 39.9, KKAQ], tortum: [41.55, 40.3, KKAQ], oltu: [41.99, 40.54, KKAQ], kars: [43.1, 40.6, KK], agri: [43.05, 39.72, KK],
  dogubayazit: [44.08, 39.55, KK], igdir: [44.04, 39.92, KK], malazgirt: [42.53, 39.15, KK], mus: [41.5, 38.75, KK], ahlat: [42.48, 38.75, KK],
  van: [43.4, 38.5, KK], bitlis: [42.11, 38.4, KK], hakkari: [43.74, 37.57, KK], siirt: [41.94, 37.93, KK], hasankeyf: [41.41, 37.71, 'kk 1462 aq'],
  cizre: [42.19, 37.33, KK], nusaybin: [41.21, 37.08, KK], mardin: [40.74, 37.31, 'aq'], ardahan: [42.7, 41.11, 'kk 1451.05 georgia'], artvin: [41.82, 41.18, 'kk 1451.05 georgia'],
  tercan: [40.39, 39.78, KKAQ], koyulhisar: [37.83, 40.3, 'aq 1461.55 ott'],
  // Şebinkarahisar and the Kelkit valley below it, Aq Qoyunlu until Otlukbeli
  sebinkarahisar: [38.42, 40.29, 'ott 1451.05 aq 1473.6 ott'], sivas: [37.02, 39.75, 'ott'], kangal: [37.39, 39.23, 'ott'], zara: [37.75, 39.9, 'ott'], susehri: [38.08, 40.16, 'ott 1451.05 aq 1473.6 ott'],
  yozgat: [34.8, 39.82, 'ott'], kirsehir: [34.16, 39.15, 'ott'], kayseri: [35.49, 38.73, 'karaman 1436.5 dul 1467.5 ott'],
  divrigi: [38.11, 39.37, 'dul'], darende: [37.5, 38.55, 'dul'], malatya: [38.31, 38.35, 'mam'], kharput: [39.22, 38.67, 'aq'], palu: [39.93, 38.69, 'aq'],
  bingol: [40.5, 38.88, 'aq'], ergani: [39.76, 38.27, 'aq'], diyarbakir: [40.23, 37.91, 'aq'], siverek: [39.32, 37.75, 'aq'],
  // Karaman and Cilicia: Mehmed takes the plain of Konya in 1468, the Taurus and Niğde in 1474, the coast of İçel by 1475
  nigde: [34.68, 37.97, 'karaman 1474.5 ott'], aksaray: [34.03, 38.37, 'karaman 1468.5 ott'], develi: [35.49, 38.38, 'karaman 1436.5 dul 1451.05 karaman 1474.5 ott'],
  kibistra: [34.05, 37.51, 'karaman 1468.5 ott'], konya: [32.49, 37.87, 'karaman 1468.5 ott'], ilgin: [31.91, 38.28, 'karaman 1468.5 ott'],
  larende: [33.22, 37.18, 'karaman 1468.5 ott'], ermenek: [32.89, 36.64, 'karaman 1474.5 ott'], mut: [33.43, 36.64, 'karaman 1474.5 ott'],
  silifke: [33.93, 36.38, 'karaman 1472.8 ott 1473.2 karaman 1474.9 ott'], alanya: [32.0, 36.55, 'karaman 1471.5 ott'],
  korykos: [34.15, 36.46, 'karaman 1472.8 ott 1473.2 karaman 1474.9 ott'], anamur: [32.83, 36.08, 'karaman 1474.5 ott'],
  mersin: [34.63, 36.8, 'mam'], tarsus: [34.9, 36.92, 'mam'], adana: [35.32, 37.0, 'mam'], ayas: [35.78, 36.77, 'mam'], sis: [35.82, 37.45, 'mam'],
  lampron: [34.87, 37.27, 'mam'], osmaniye: [36.25, 37.07, 'mam'], maras: [36.93, 37.58, 'dul'], elbistan: [37.2, 38.2, 'dul'],
  adiyaman: [38.28, 37.76, 'dul'], besni: [37.86, 37.69, 'dul'], kahta: [38.62, 37.78, 'dul'],
  // Syria and Iraq
  urfa: [38.79, 37.16, 'mam 1455 aq'], harran: [39.03, 36.86, 'mam'], birecik: [37.99, 37.03, 'mam'], antep: [37.38, 37.07, 'mam'], kilis: [37.12, 36.72, 'mam'],
  iskenderun: [36.17, 36.59, 'mam'], antioch: [36.16, 36.2, 'mam'], aleppo: [37.16, 36.2, 'mam'], manbij: [37.95, 36.53, 'mam'], idlib: [36.63, 35.93, 'mam'],
  latakia: [35.78, 35.52, 'mam'], hama: [36.75, 35.13, 'mam'], homs: [36.72, 34.73, 'mam'], tartus: [35.89, 34.89, 'mam'], tripoli: [35.84, 34.43, 'mam'],
  baalbek: [36.2, 34.0, 'mam'], beirut: [35.5, 33.89, 'mam'], sidon: [35.37, 33.56, 'mam'], damascus: [36.3, 33.51, 'mam'],
  daraa: [36.1, 32.62, 'mam'], suwayda: [36.57, 32.7, 'mam'], palmyra: [38.27, 34.55, 'mam'],
  raqqa: [39.01, 35.95, 'mam'], deir: [40.14, 35.33, 'mam'], rahba: [40.45, 35.02, 'mam'], abukamal: [40.92, 34.45, 'mam'], hasakah: [40.75, 36.5, 'mam'],
  ana: [41.98, 34.47, KK], hit: [42.83, 33.64, KK], ramadi: [43.3, 33.42, KK], baghdad: [44.36, 33.34, KK], baqubah: [44.64, 33.75, KK],
  samarra: [43.88, 34.2, KK], karbala: [44.02, 32.6, KK], hillah: [44.43, 32.48, KK], najaf: [44.32, 32.0, KK], diwaniyah: [44.92, 31.99, KK],
  kut: [45.82, 32.5, KK], amara: [47.15, 31.84, KK], samawah: [45.29, 31.31, KK], nasiriyah: [46.26, 31.04, KK], basra: [47.78, 30.5, KK],
  rutba: [40.28, 33.03, 'mam'], nukhaib: [42.28, 32.03, KK], tikrit: [43.68, 34.6, KK], kirkuk: [44.39, 35.47, KK], khanaqin: [45.38, 34.35, KK],
  sulaymaniyah: [45.43, 35.56, KK], erbil: [44.01, 36.19, KK], mosul: [43.13, 36.34, KK], dohuk: [43.0, 36.87, KK], zakho: [42.68, 37.14, KK], sinjar: [41.88, 36.32, KK],
  // Cyprus: the Lusignan kingdom, Genoese Famagusta until James II takes it in January 1464
  nicosia: [33.36, 35.17, 'cyprus'], famagusta: [33.94, 35.12, 'famagusta 1464.05 cyprus'], paphos: [32.42, 34.77, 'cyprus'], kyrenia: [33.32, 35.34, 'cyprus'], karpas: [34.4, 35.6, 'cyprus'],
  // western Anatolia: Mysia, Lydia, Ionia, Caria, Phrygia, Pisidia, Lycia
  bandirma: [27.97, 40.35, 'ott'], kyzikos: [27.85, 40.45, 'ott'], marmara: [27.6, 40.62, 'ott'], manyas: [27.97, 40.05, 'ott'], gonen: [27.65, 40.1, 'ott'],
  susurluk: [28.16, 39.91, 'ott'], balikesir: [27.88, 39.65, 'ott'], bigadic: [28.13, 39.39, 'ott'], sindirgi: [28.18, 39.24, 'ott'], dursunbey: [28.63, 39.59, 'ott'],
  biga: [27.24, 40.23, 'ott'], lampsacus: [26.75, 40.32, 'ott'], abydos: [26.45, 40.1, 'ott'], troad: [26.33, 39.79, 'ott'], geyikli: [26.22, 39.8, 'ott'],
  bayramic: [26.62, 39.81, 'ott'], can: [27.05, 40.03, 'ott'], assos: [26.45, 39.52, 'ott'], babakale: [26.15, 39.52, 'ott'], edremit: [27.02, 39.6, 'ott'],
  ayvalik: [26.88, 39.3, 'ott'], cunda: [26.68, 39.33, 'ott'], bergama: [27.18, 39.12, 'ott'], dikili: [26.95, 39.07, 'ott'], candarli: [26.95, 38.93, 'ott'], soma: [27.61, 39.19, 'ott'],
  thyatira: [27.84, 38.92, 'ott'], gordes: [28.29, 38.93, 'ott'], sardis: [28.06, 38.48, 'ott'], magnesia: [27.43, 38.61, 'ott'], menemen: [26.98, 38.6, 'ott'],
  phocaea: [26.8, 38.7, 'phocaea 1455.9 ott'],
  demirci: [28.66, 39.05, GERM], simav: [28.98, 39.09, GERM], emet: [29.26, 39.34, GERM], tavsanli: [29.49, 39.54, GERM], kutahya: [29.98, 39.42, GERM],
  altintas: [30.11, 39.06, GERM], seyitgazi: [30.69, 39.44, GERM], emirdag: [31.15, 39.02, GERM], gediz: [29.4, 39.0, GERM], usak: [29.4, 38.68, GERM],
  kula: [28.65, 38.55, GERM], selendi: [28.87, 38.74, GERM], esme: [28.97, 38.4, GERM], philadelphia: [28.52, 38.35, GERM], denizli: [29.09, 37.78, GERM],
  acipayam: [29.35, 37.42, GERM], dinar: [30.16, 38.07, GERM], sandikli: [30.27, 38.46, GERM], afyon: [30.54, 38.76, GERM],
  nymphaion: [27.42, 38.43, AYD], smyrna: [27.2, 38.42, AYD], urla: [26.76, 38.32, AYD], cesme: [26.32, 38.32, AYD], karaburun: [26.52, 38.62, AYD],
  seferihisar: [26.84, 38.2, AYD], ephesus: [27.37, 37.95, AYD], tire: [27.73, 38.09, AYD], birgi: [27.97, 38.25, AYD], tralles: [27.84, 37.86, AYD],
  nazilli: [28.32, 37.91, AYD], kusadasi: [27.26, 37.86, AYD],
  turgutreis: [27.27, 37.04, MENT], soke: [27.4, 37.75, MENT], mycale: [27.055, 37.642, MENT], miletus: [27.28, 37.53, MENT], milas: [27.78, 37.32, MENT],
  bodrum: [27.43, 37.04, MENT], mugla: [28.36, 37.22, MENT], marmaris: [28.27, 36.88, MENT], knidos: [27.45, 36.7, MENT], datca: [27.62, 36.74, MENT],
  hisaronu: [27.9, 36.77, MENT], bozburun: [28.08, 36.65, MENT], fethiye: [29.12, 36.62, MENT], koycegiz: [28.69, 36.97, MENT], tavas: [29.07, 37.57, MENT],
  bolvadin: [31.05, 38.71, 'ott'], aksehir: [31.41, 38.36, AKS], yalvac: [31.18, 38.3, AKS], karaagac: [31.36, 38.08, AKS],
  uluborlu: [30.45, 38.08, HAMID], egirdir: [30.87, 37.875, HAMID], isparta: [30.55, 37.76, HAMID], burdur: [30.29, 37.72, HAMID],
  beysehir: [31.72, 37.68, BEY], seydisehir: [31.85, 37.42, BEY],
  antalya: [30.7, 36.89, 'ott'], korkuteli: [30.2, 37.07, TEKE], elmali: [29.92, 36.74, TEKE], kas: [29.64, 36.2, TEKE], manavgat: [31.43, 36.79, TEKE],
  // the islands off Asia
  tenedos: [26.03, 39.81, '- 1453.5 ott'], lesbos: [26.22, 39.22, 'lesbos 1462.7 ott'], molyvos: [26.25, 39.33, 'lesbos 1462.7 ott'], mytilene: [26.48, 39.12, 'lesbos 1462.7 ott'],
  chios: [26.03, 38.4, 'chios'], psara: [25.57, 38.56, 'chios'], samos: [26.8, 37.72, 'chios 1475.5 ott'], samoseast: [27.025, 37.738, 'chios 1475.5 ott'], ikaria: [26.15, 37.6, 'chios'],
  patmos: [26.55, 37.32, 'rhodes'], leros: [26.85, 37.15, 'rhodes'], kalymnos: [26.98, 36.98, 'rhodes'], kos: [27.0, 36.76, 'rhodes'], kostown: [27.25, 36.86, 'rhodes'],
  nisyros: [27.16, 36.59, 'rhodes'], tilos: [27.37, 36.43, 'rhodes'], symi: [27.83, 36.59, 'rhodes'], rhodes: [27.95, 36.2, 'rhodes'], rhodestown: [28.2, 36.4, 'rhodes'],
  karpathos: [27.15, 35.6, 'crete'], kasos: [26.92, 35.4, 'crete'],
  // Thrace; the walled city of Constantinople is a small place. Byzantium holds the city within its land walls,
  // Selymbria, Mesembria and Anchialos in 1451
  walls: [28.8, 41.04, 'byz 1451.05 ott'], derkos: [28.75, 41.3, THR], catalca: [28.46, 41.14, THR], selymbria: [28.25, 41.07, 'byz 1453.42 ott'],
  midia: [28.09, 41.62, THR], vize: [27.76, 41.57, 'ott'], corlu: [27.8, 41.16, 'ott'], herakleia: [27.95, 40.98, 'ott'], rhaidestos: [27.5, 41.0, 'ott'],
  hayrabolu: [27.1, 41.21, 'ott'], malkara: [26.9, 40.89, 'ott'], sarkoy: [27.11, 40.61, 'ott'], kesan: [26.64, 40.86, 'ott'], ipsala: [26.38, 40.92, 'ott'], saros: [26.45, 40.66, 'ott'],
  ainos: [26.08, 40.72, 'ainos 1456.05 ott'], ferres: [26.17, 40.9, 'ott'], tzympe: [26.75, 40.5, 'ott'], gallipoli: [26.6, 40.42, 'ott'], eceabat: [26.33, 40.15, 'ott'],
  luleburgaz: [27.355, 41.4, 'ott'], babaeski: [27.09, 41.43, 'ott'], didymoteicho: [26.495, 41.35, 'ott'], uzunkopru: [26.69, 41.27, 'ott'], adrianople: [26.56, 41.68, 'ott'],
  kirklareli: [27.22, 41.74, 'ott'], strandzha: [27.52, 42.0, 'ott'], agathopolis: [27.94, 42.1, THR], sozopol: [27.7, 42.42, THR], anchialos: [27.64, 42.56, THR + ' 1451.05 byz 1453.05 ott'],
  mesembria: [27.73, 42.66, 'byz 1453.05 ott'], burgas: [27.42, 42.5, 'ott'], karnobat: [26.98, 42.65, 'ott'], aytos: [27.25, 42.7, 'ott'], yambol: [26.5, 42.48, 'ott'],
  sliven: [26.32, 42.68, 'ott'], starazagora: [25.63, 42.43, 'ott'], kazanlak: [25.39, 42.62, 'ott'], haskovo: [25.56, 41.93, 'ott'], kardzhali: [25.37, 41.65, 'ott'],
  philippopolis: [24.75, 42.15, 'ott'], asenovgrad: [24.87, 41.98, 'ott'], pazardzhik: [24.33, 42.19, 'ott'], smolyan: [24.7, 41.58, 'ott'], komotini: [25.4, 41.12, 'ott'],
  maroneia: [25.52, 40.88, 'ott'], xanthi: [24.88, 41.14, 'ott'],
  // Bulgaria, Dobruja, Wallachia and Moldavia
  sofia: [23.32, 42.7, 'ott'], pernik: [23.03, 42.6, 'ott'], dragoman: [22.93, 42.92, 'ott'], samokov: [23.56, 42.34, 'ott'], ihtiman: [23.82, 42.43, 'ott'],
  botevgrad: [23.79, 42.9, 'ott'], vratsa: [23.56, 43.21, 'ott'], montana: [23.23, 43.41, 'ott'], lom: [23.24, 43.83, 'ott'], vidin: [22.88, 43.99, 'ott'],
  belogradchik: [22.68, 43.63, 'ott'], oryahovo: [23.96, 43.73, 'ott'], zajecar: [22.29, 43.9, 'ott'], negotin: [22.53, 44.23, 'ott'],
  pleven: [24.62, 43.42, 'ott'], nikopol: [24.9, 43.7, 'ott'], svishtov: [25.35, 43.62, 'ott'], lovech: [24.72, 43.13, 'ott'], tarnovo: [25.63, 43.08, 'ott'],
  gabrovo: [25.32, 42.87, 'ott'], ruse: [25.97, 43.85, 'ott'], tutrakan: [26.62, 44.05, 'ott'],
  // the south bank of the Danube, which the towns on the north bank reach across the river without these. Towns on the
  // river sit on their bank of the 1:10m border, which runs a few km off the river in places
  novoselo: [22.79, 44.12, 'ott'], kozloduy: [23.73, 43.74, 'ott'], gigen: [24.48, 43.7, 'ott'], belene: [25.12, 43.64, 'ott'],
  razgrad: [26.52, 43.53, 'ott'], isperih: [26.83, 43.72, 'ott'], targovishte: [26.57, 43.25, 'ott'], shumen: [26.93, 43.27, 'ott'], preslav: [26.82, 43.16, 'ott'],
  provadia: [27.44, 43.18, 'ott'], varna: [27.91, 43.21, 'ott'], obzor: [27.88, 42.82, 'ott'], silistra: [27.26, 44.08, 'ott'],
  dobrich: [27.83, 43.57, 'ott'], kaliakra: [28.47, 43.36, 'ott'], constanta: [28.63, 44.17, 'ott'], medgidia: [28.27, 44.25, 'ott'], hirsova: [27.95, 44.68, 'ott'],
  enisala: [28.83, 44.89, 'ott'], isaccea: [28.46, 45.27, 'ott'], tulcea: [28.8, 45.18, 'ott'], delta: [29.3, 45.2, 'ott'],
  severin: [22.66, 44.63, 'hungary'], calafat: [22.95, 44.17, 'wallachia'], craiova: [23.8, 44.32, 'wallachia'],
  ramnicu: [24.37, 45.1, 'wallachia'], arges: [24.68, 45.14, 'wallachia'], targoviste: [25.46, 44.93, 'wallachia'], bucharest: [26.1, 44.43, 'wallachia'],
  teleorman: [25.1, 44.1, 'wallachia'], bailesti: [23.35, 44.03, 'wallachia'], cetate: [23.05, 44.1, 'wallachia'], bistret: [23.5, 43.9, 'wallachia'], dabuleni: [24.09, 43.9, 'wallachia'],
  gruia: [22.7, 44.29, 'hungary'], bechet: [23.96, 43.86, 'wallachia'], corabia: [24.5, 43.86, 'wallachia'],
  turnuland: [24.98, 43.88, 'wallachia'], zimnicea: [25.37, 43.72, 'wallachia'], giurgiuland: [25.75, 44.03, 'wallachia'], oltenita: [26.64, 44.13, 'wallachia'],
  fetesti: [27.83, 44.38, 'wallachia'], calarasi: [27.33, 44.2, 'wallachia'], slobozia: [27.37, 44.56, 'wallachia'], buzau: [26.82, 45.15, 'wallachia'],
  braila: [27.97, 45.27, 'wallachia'], chilia: [29.27, 45.43, 'moldavia'], focsani: [27.19, 45.7, 'moldavia'], galati: [28.04, 45.43, 'moldavia'],
  bacau: [26.91, 46.57, 'moldavia'], suceava: [26.25, 47.65, 'moldavia'], iasi: [27.6, 47.16, 'moldavia'], chisinau: [28.85, 47.0, 'moldavia'],
  cahul: [28.2, 45.9, 'moldavia'], balti: [27.93, 47.76, 'moldavia'], tighina: [29.47, 46.83, 'moldavia'], budjak: [29.2, 45.9, 'moldavia'],
  bilhorod: [30.35, 46.19, 'moldavia'], reni: [28.28, 45.47, 'moldavia'], izmail: [28.83, 45.38, 'moldavia'], bolhrad: [28.6, 45.7, 'moldavia'], chernivtsi: [25.94, 48.29, 'moldavia'],
  // Moldavia up to Suceava and Hotin, for the wars of Stephen the Great
  neamt: [26.37, 47.2, 'moldavia'], roman: [26.92, 46.92, 'moldavia'], vaslui: [27.73, 46.64, 'moldavia'], barlad: [27.67, 46.23, 'moldavia'], hotin: [26.49, 48.48, 'moldavia'],
  dorohoi: [26.4, 47.96, 'moldavia'], botosani: [26.67, 47.75, 'moldavia'], husi: [28.06, 46.67, 'moldavia'], orhei: [28.82, 47.38, 'moldavia'], soroca: [28.3, 48.16, 'moldavia'],
  tecuci: [27.43, 45.85, 'moldavia'], ramnicusarat: [27.06, 45.38, 'wallachia'],
  // the steppe north of the Black Sea, the Crimean Khanate's, and the Lithuanian lands north of it, outside the story
  transnistria: [29.4, 47.3, '-'], odessa: [30.6, 46.6, CRIM], mykolaiv: [32.0, 46.97, CRIM], kherson: [32.6, 46.6, CRIM],
  azov: [36.5, 46.8, CRIM], zaporizhzhia: [35.14, 47.84, '-'], dnipro: [35.05, 48.46, '-'], donbas: [38.5, 48.2, '-'],
  kharkiv: [36.23, 49.8, '-'], kropyvnytskyi: [32.26, 48.51, '-'], uman: [30.22, 48.75, '-'], vinnytsia: [28.47, 49.23, '-'], khmelnytskyi: [26.99, 49.42, '-'],
  perekop: [33.7, 46.1, CRIM], kakhovka: [33.48, 46.77, CRIM], melitopol: [35.37, 46.84, CRIM],
  chernihiv: [31.3, 51.5, '-'], sumy: [34.8, 50.9, '-'], poltava: [34.55, 49.59, '-'],
  // the Crimea: the Genoese towns of Gazaria and Tana, Theodoro, the khan's steppe
  caffa: [35.38, 45.03, 'gazaria 1475.45 ott'], soldaia: [34.95, 44.84, 'gazaria 1475.5 ott'], cembalo: [33.6, 44.5, 'gazaria 1475.5 ott'], kerch: [36.47, 45.36, 'gazaria 1475.5 ott'],
  mangup: [33.81, 44.59, 'theodoro 1475.9 ott'], inkerman: [33.61, 44.62, 'theodoro 1475.9 ott'], yalta: [34.16, 44.5, 'theodoro 1475.9 ott'], alushta: [34.41, 44.67, 'theodoro 1475.9 ott'],
  solkhat: [35.09, 45.05, CRIM], bakhchisaray: [33.86, 44.76, CRIM], simferopol: [34.1, 44.95, CRIM], gozleve: [33.37, 45.2, CRIM], dzhankoi: [34.39, 45.71, CRIM],
  tarkhankut: [32.7, 45.45, CRIM], kerchland: [35.85, 45.3, CRIM], sivash: [35.1, 45.4, CRIM],
  // Red Ruthenia and Little Poland south of 50°N
  lviv: [24.03, 49.7, 'poland'], frankivsk: [24.71, 48.92, 'poland'], ternopil: [25.6, 49.55, 'poland'], kamianets: [26.58, 48.68, 'poland'], kolomyia: [25.04, 48.53, 'poland'],
  przemysl: [22.77, 49.78, 'poland'], sanok: [22.2, 49.56, 'poland'], krosno: [21.77, 49.69, 'poland'], nowysacz: [20.69, 49.62, 'poland'], bochnia: [20.43, 49.94, 'poland'],
  wadowice: [19.49, 49.88, 'poland'], krakow: [19.94, 50.06, 'poland'], tarnow: [20.99, 50.01, 'poland'], rzeszow: [22.0, 50.04, 'poland'],
  belz: [24.0, 50.38, 'poland'], zamosc: [23.25, 50.72, 'poland'], sandomierz: [21.75, 50.68, 'poland'], kielce: [20.63, 50.87, 'poland'],
  czestochowa: [19.12, 50.81, 'poland'], radom: [21.15, 51.4, 'poland'], lublin: [22.57, 51.25, 'poland'], piotrkow: [19.7, 51.4, 'poland'],
  lodz: [19.46, 51.76, 'poland'], chelm: [23.47, 51.13, 'poland'], kalisz: [18.09, 51.76, 'poland'],
  // Silesia, a land of the Bohemian crown, and Volhynia and Kiev, Lithuanian, outside the story
  bytom: [18.92, 50.35, '-'], opole: [17.93, 50.67, '-'], wroclaw: [17.03, 51.11, '-'], lutsk: [25.33, 50.75, '-'], rivne: [26.25, 50.62, '-'],
  zhytomyr: [28.66, 50.25, '-'], kyiv: [30.5, 50.45, '-'], cherkasy: [32.06, 49.44, '-'],
  // Hungary, Transylvania, Croatia and Dalmatia
  brasov: [25.6, 45.65, 'hungary'], sibiu: [24.15, 45.79, 'hungary'], hateg: [22.95, 45.6, 'hungary'], alba: [23.57, 46.07, 'hungary'], cluj: [23.6, 46.77, 'hungary'],
  targumures: [24.56, 46.54, 'hungary'], ciuc: [25.8, 46.36, 'hungary'], bistrita: [24.5, 47.13, 'hungary'], deva: [22.9, 45.88, 'hungary'],
  caransebes: [22.22, 45.42, 'hungary'], orsova: [22.4, 44.72, 'hungary'], timisoara: [21.23, 45.75, 'hungary'], arad: [21.31, 46.18, 'hungary'],
  oradea: [21.92, 47.06, 'hungary'], debrecen: [21.62, 47.53, 'hungary'], baiamare: [23.58, 47.66, 'hungary'], satumare: [22.88, 47.79, 'hungary'],
  vrsac: [21.3, 45.12, 'hungary'], kovin: [20.97, 44.75, 'hungary 1457.3 serbia 1459 hungary'], belacrkva: [21.42, 44.9, 'hungary'], moldovanoua: [21.66, 44.76, 'hungary'],
  // the Banat on the north bank of the Danube gorge
  oravita: [21.69, 45.03, 'hungary'], bozovici: [22.0, 44.93, 'hungary'], berzasca: [21.96, 44.67, 'hungary'], svinita: [22.12, 44.53, 'hungary'], baia: [22.7, 44.95, 'hungary'], pancevo: [20.64, 44.87, 'hungary'], zrenjanin: [20.39, 45.38, 'hungary'],
  novisad: [19.86, 45.25, 'hungary'], srem: [19.4, 45.05, 'hungary'], vukovar: [19.0, 45.35, 'hungary'], szeged: [20.15, 46.25, 'hungary'],
  kecskemet: [19.69, 46.9, 'hungary'], budapest: [19.04, 47.5, 'hungary'], esztergom: [18.74, 47.79, 'hungary'], eger: [20.38, 47.9, 'hungary'],
  miskolc: [20.78, 48.1, 'hungary'], nyiregyhaza: [21.72, 47.95, 'hungary'], kosice: [21.26, 48.72, 'hungary'], presov: [21.24, 49.0, 'hungary'],
  uzhhorod: [22.29, 48.62, 'hungary'], mukachevo: [22.72, 48.44, 'hungary'], banskabystrica: [19.15, 48.74, 'hungary'], zilina: [18.74, 49.22, 'hungary'],
  nitra: [18.09, 48.31, 'hungary'], trnava: [17.59, 48.38, 'hungary'], bratislava: [17.11, 48.15, 'hungary'], gyor: [17.63, 47.68, 'hungary'],
  sopron: [16.59, 47.68, 'hungary'], szombathely: [16.62, 47.23, 'hungary'], zalaegerszeg: [16.84, 46.84, 'hungary'], pecs: [18.23, 46.07, 'hungary'],
  balaton: [17.8, 46.9, 'hungary'], osijek: [18.69, 45.55, 'hungary'], slavbrod: [18.0, 45.16, 'hungary'], pozega: [17.68, 45.34, 'hungary'],
  sisak: [16.37, 45.48, 'hungary'], zagreb: [15.98, 45.81, 'hungary'], varazdin: [16.34, 46.3, 'hungary'], karlovac: [15.55, 45.49, 'hungary'],
  // Rijeka passes to the Habsburgs in 1466, Krk to Venice in 1480; Cres is Venetian since 1409
  bihac: [15.87, 44.82, 'hungary'], senj: [14.9, 45.0, 'hungary'], rijeka: [14.44, 45.33, 'hungary 1466 -'], lika: [15.4, 44.55, 'hungary'], knin: [16.2, 44.04, 'hungary'],
  zadar: [15.23, 44.12, 'dalmatia'], biograd: [15.45, 43.93, 'dalmatia'], pag: [15.05, 44.45, 'dalmatia'], sibenik: [15.89, 43.73, 'dalmatia'],
  trogir: [16.25, 43.52, 'dalmatia'], split: [16.44, 43.51, 'dalmatia'], omis: [16.69, 43.44, 'hungary 1444.5 dalmatia'],
  korcula: [17.0, 42.95, 'dalmatia'], korculatown: [17.13, 42.94, 'dalmatia'], hvareast: [16.88, 43.15, 'dalmatia'], sucuraj: [17.08, 43.135, 'dalmatia'],
  hvar: [16.6, 43.15, 'dalmatia'], brac: [16.6, 43.32, 'dalmatia'], bracEast: [16.82, 43.3, 'dalmatia'], cres: [14.4, 44.9, 'hungary 1451.05 dalmatia'], krk: [14.6, 45.05, 'hungary 1480.1 dalmatia'],
  pula: [13.85, 44.87, 'istria'], porec: [13.6, 45.23, 'istria'], labin: [14.12, 45.09, 'istria'], koper: [13.73, 45.55, 'istria'], pazin: [13.94, 45.24, '-'],
  ljubljana: [14.5, 46.05, '-'], maribor: [15.65, 46.55, '-'], novomesto: [15.17, 45.8, '-'],
  // Gorizia, Trieste and the Austrian lands, Habsburg or the counts of Gorizia, outside the story; Burgenland Hungarian
  gorizia: [13.62, 45.94, '-'], trieste: [13.77, 45.65, '-'], tolmin: [13.73, 46.18, '-'], villach: [13.85, 46.61, '-'], klagenfurt: [14.31, 46.62, '-'],
  lienz: [12.77, 46.83, '-'], innsbruck: [11.39, 47.27, '-'], salzburg: [13.05, 47.8, '-'], graz: [15.44, 47.07, '-'], linz: [14.29, 48.31, '-'],
  vienna: [16.37, 48.21, '-'], eisenstadt: [16.52, 47.85, 'hungary'], oberwart: [16.2, 47.29, 'hungary'],
  // Bosnia, Herzegovina, Ragusa and the Serbian lands. The Kosača lands are Herzegovina from the herceg's title of 1448
  mljet: [17.55, 42.75, 'ragusa'], ragusa: [18.11, 42.64, 'ragusa'], ston: [17.7, 42.84, 'ragusa'], peljesac: [17.3, 42.97, 'ragusa'], orebic: [17.15, 43.02, 'ragusa'],
  peljesacwest: [17.05, 43.03, 'ragusa'], peljesaceast: [17.5, 42.87, 'ragusa'], slano: [17.9, 42.78, 'ragusa'], popovo: [18.1, 42.82, HERZ_S],
  // the Makarska coast goes over to Venice in 1452
  ploce: [17.42, 43.07, HERZ_W], gradac: [17.28, 43.2, 'herz 1452.5 dalmatia'], zaostrog: [17.12, 43.25, 'herz 1452.5 dalmatia'], opuzen: [17.6, 43.02, HERZ_W],
  makarska: [17.02, 43.3, 'herz 1452.5 dalmatia'],
  livno: [17.01, 43.83, BOS], banjaluka: [17.19, 44.77, 'bosnia 1463.4 ott 1463.95 hungary'], jajce: [17.27, 44.34, 'bosnia 1463.4 ott 1463.95 hungary'], zenica: [17.9, 44.2, BOS], visoko: [18.18, 43.99, BOS],
  sarajevo: [18.41, 43.86, BOS], doboj: [18.09, 44.73, 'bosnia 1463.4 ott 1464.8 hungary'], tuzlabih: [18.67, 44.54, 'bosnia 1463.4 ott 1464.8 hungary'],
  srebrenica: [19.3, 44.1, 'bosnia 1463.4 ott 1464.7 hungary 1465.5 ott'],
  zvornik: [19.1, 44.39, 'bosnia 1433.3 ' + SRBN], teocak: [18.99, 44.6, 'bosnia 1433.3 ' + SRBN],
  visegrad: [19.29, 43.78, BOS], gorazde: [18.98, 43.67, HERZ_E], foca: [18.78, 43.5, HERZ_E], mostar: [17.81, 43.34, HERZ_S], stolac: [17.96, 43.08, HERZ_S],
  nevesinje: [18.12, 43.26, HERZ_E], gacko: [18.53, 43.17, HERZ_E], bileca: [18.43, 42.87, HERZ_S], trebinje: [18.34, 42.71, HERZ_S], konavle: [18.35, 42.55, 'bosnia 1427 ragusa'],
  novi: [18.54, 42.45, 'herz'], lustica: [18.65, 42.4, 'herz'], kotor: [18.77, 42.42, 'dalmatia'], zabljak: [19.12, 43.15, HERZ_E], pljevlja: [19.36, 43.36, HERZ_E],
  prijepolje: [19.65, 43.39, HERZ_E], bijelopolje: [19.75, 43.04, HERZ_E],
  blagaj: [17.88, 43.26, HERZ_S], ljubuski: [17.55, 43.2, HERZ_W], imotski: [17.22, 43.45, HERZ_W], pocitelj: [17.73, 43.13, 'herz 1471.5 ott'], konjic: [17.96, 43.65, 'herz 1463.6 ott'],
  bobovac: [18.23, 44.15, BOS], travnik: [17.67, 44.23, BOS], kljuc: [16.78, 44.53, BOS], srebrenik: [18.49, 44.71, 'bosnia 1463.4 ott 1464.8 hungary'],
  // Belgrade and Mačva, Hungarian since 1427; Šabac, the Ottoman fort of 1470 in Mačva, Hungarian from February 1476
  belgrade: [20.46, 44.82, 'serbia 1427.8 hungary'], macva: [19.65, 44.7, 'serbia 1427.8 hungary 1470.5 ott 1476.12 hungary'], valjevo: [19.89, 44.27, SRBN], loznica: [19.22, 44.53, SRBN],
  krupanj: [19.36, 44.37, SRBN], smederevo: [20.93, 44.66, SRBN], branicevo: [21.23, 44.73, 'serbia 1437.5 ott 1444.62 serbia 1459.45 ott'],
  golubac: [21.63, 44.66, 'serbia 1427.55 ott 1444.62 serbia 1459.45 ott'], kucevo: [21.67, 44.48, 'serbia 1437.5 ott 1444.62 serbia 1459.45 ott'], paracin: [21.41, 43.86, SRBN],
  pozarevac: [21.19, 44.62, 'serbia 1437.5 ott 1444.62 serbia 1459.45 ott'], dmilanovac: [22.15, 44.46, 'serbia 1437.5 ott 1444.62 serbia 1459.45 ott'],
  svilajnac: [21.2, 44.23, SRBN], resava: [21.44, 44.09, SRBN], jagodina: [21.26, 43.98, SRBN],
  kragujevac: [20.92, 44.01, SRBN], rudnik: [20.5, 44.14, SRBN], cacak: [20.35, 43.89, SRBN], uzice: [19.85, 43.86, SRBN], kraljevo: [20.69, 43.72, SRBS],
  krusevac: [21.33, 43.58, 'serbia 1427.6 ott'], stalac: [21.41, 43.67, 'serbia 1427.6 ott'], aleksinac: [21.7, 43.54, 'serbia 1427.6 ott'],
  sokobanja: [21.87, 43.64, 'serbia 1427.6 ott'], svrljig: [22.12, 43.42, 'serbia 1427.6 ott'], nis: [21.9, 43.32, 'ott'], pirot: [22.59, 43.15, 'ott'],
  // Toplica and Dubočica, Mara's dowry, which Mehmed gives back to Serbia in 1451
  prokuplje: [21.59, 43.24, 'serbia 1427.6 ott 1451.3 serbia 1455.4 ott'], kursumlija: [21.27, 43.14, 'serbia 1427.6 ott 1451.3 serbia 1455.4 ott'],
  leskovac: [21.95, 42.99, 'serbia 1427.6 ott 1451.3 serbia 1455.4 ott'],
  vranje: [21.9, 42.55, SRBS], presevo: [21.65, 42.31, SRBS], novobrdo: [21.43, 42.62, 'serbia 1441.49 ott 1444.62 serbia 1455.42 ott'],
  sjenica: [20.0, 43.27, SRBS], novipazar: [20.52, 43.14, SRBS], raska: [20.68, 43.02, SRBS], zvecan: [20.87, 42.9, SRBS],
  vucitrn: [20.97, 42.82, SRBS], pristina: [21.165, 42.663, 'serbia 1441.49 ott 1444.62 serbia 1455.4 ott'], urosevac: [21.16, 42.37, 'ott'],
  berane: [19.87, 42.84, SRBS], pec: [20.29, 42.66, SRBS], djakovica: [20.43, 42.38, SRBS], prizren: [20.74, 42.21, SRB + ' 1455.47 ott'], kukes: [20.4, 42.08, 'serbia 1439.63 ott'],
  // Zeta and Albania: Zeta is Serbian from Balša III's death in 1421 to 1442, Venice holds the coast towns. The
  // Ottomans take the country round Shkodër in 1474, most of Zeta in 1477 and the rest after the peace of 1479
  malesia: [19.62, 42.38, 'serbia 1442.15 zeta 1444.2 skanderbeg 1447.9 zeta 1474 ott'], plav: [19.92, 42.6, SRBS], niksic: [18.95, 42.78, 'serbia 1442.15 herz 1465.5 ott'],
  podgorica: [19.26, 42.44, 'serbia 1442.15 zeta 1444.2 skanderbeg 1447.9 zeta 1474 ott'],
  cetinje: [18.92, 42.39, 'zeta 1479.6 ott'], zabljakzeta: [19.15, 42.31, 'zeta 1477.5 ott'],
  budva: [18.84, 42.29, 'serbia 1442.15 venalb'], bar: [19.1, 42.09, 'serbia 1442.15 venalb'], ulcinj: [19.21, 41.93, 'venalb'], scutari: [19.51, 42.07, 'venalb 1479.3 ott'],
  drisht: [19.6, 42.12, 'venalb 1478.67 ott'], dukagjin: [19.85, 42.3, NORTH + ' 1450.4 alb 1454.5 skanderbeg 1468.1 ott'], ishem: [19.6, 41.56, 'ott 1443.905 skanderbeg 1468.1 ott'],
  puke: [19.9, 42.03, NORTH + ' 1450.4 alb 1454.5 skanderbeg 1468.1 ott'], mirdite: [19.98, 41.83, NORTH + ' 1450.4 alb 1454.5 skanderbeg 1468.1 ott'],
  // the lower Buna, Venetian with Shkodër
  buna: [19.4, 41.97, 'venalb 1479.3 ott'], dagnum: [19.63, 42.0, NORTH + ' 1447.5 venalb 1474 ott'], zadrima: [19.58, 41.9, NORTH + ' 1447.5 venalb 1474 ott'], lezhe: [19.65, 41.78, 'venalb 1478.7 ott'],
  mat: [20.1, 41.65, 'ott 1443.905 skanderbeg 1468.1 ott'], kruje: [19.79, 41.51, 'ott 1443.905 skanderbeg 1468.1 ott'],
  preze: [19.67, 41.43, 'ott 1443.905 skanderbeg 1466.4 ott 1467.5 skanderbeg 1468.1 ott'],
  petrela: [19.86, 41.25, 'ott 1443.905 skanderbeg 1450.4 ott' + LEAGUE], thopia: [19.58, 41.3, 'ott 1432.7 alb 1435.5 ott 1444.2 skanderbeg 1450.4 alb' + LEAGUE],
  tirana: [19.82, 41.33, 'ott' + LEAGUE], krrabe: [19.97, 41.22, 'ott' + LEAGUE],
  lowerdibra: [20.42, 41.68, 'ott 1444.2 skanderbeg 1450.4 ott 1451.3 skanderbeg 1466.4 ott'], durres: [19.45, 41.32, 'venalb'], elbasan: [20.08, 41.11, 'ott 1451.3 skanderbeg 1466.4 ott'],
  // Gjergj Arianiti's lands between the Shkumbin and the Vjosa, with Skanderbeg from his marriage to Donika in 1451
  shpat: [20.05, 40.97, ARIANITI + ' 1451.3 skanderbeg 1458 ott'], tomorrica: [20.25, 40.62, ARIANITI + ' 1451.3 skanderbeg 1458 ott'], skrapar: [20.3, 40.45, ARIANITI + ' 1451.3 skanderbeg 1458 ott'],
  berat: [19.95, 40.7, 'ott'], vlore: [19.49, 40.47, 'ott 1432.7 alb 1434.5 ott'], himare: [19.75, 40.1, 'ott'], divjake: [19.55, 40.95, 'ott'],
  // Modrič, the League's fortress of 1451 in the Drin valley, sold to the Ottomans in 1456; Svetigrad, Ottoman since 1448
  modric: [20.62, 41.3, 'ott 1451.5 skanderbeg 1456.3 ott'], svetigrad: [20.63, 41.6, 'ott'], struga: [20.68, 41.18, 'ott'], mokra: [20.42, 41.0, 'ott'],
  // Macedonia
  kumanovo: [21.71, 42.13, 'ott'], kratovo: [22.18, 42.08, 'ott'], velbuzd: [22.69, 42.28, 'ott'], dupnitsa: [23.12, 42.27, 'ott'], blagoevgrad: [23.1, 42.02, 'ott'],
  razlog: [23.47, 41.88, 'ott'], stip: [22.19, 41.74, 'ott'], strumica: [22.64, 41.44, 'ott'], melnik: [23.39, 41.52, 'ott'], negotino: [22.09, 41.48, 'ott'],
  veles: [21.78, 41.72, 'ott'], skopje: [21.43, 42.0, 'ott'], tetovo: [20.97, 42.01, 'ott'], kicevo: [20.96, 41.51, 'ott'], prilep: [21.55, 41.35, 'ott'],
  bitola: [21.33, 41.03, 'ott'], florina: [21.4, 40.78, 'ott'], ohrid: [20.8, 41.12, 'ott'], debar: [20.52, 41.52, 'ott 1451.3 skanderbeg 1463.3 ott'], korce: [20.78, 40.62, 'ott'],
  kastoria: [21.27, 40.52, 'ott'], edessa: [22.05, 40.8, 'ott'], veria: [22.2, 40.52, 'ott'], servia: [21.9, 40.2, 'ott'], gevgelija: [22.5, 41.14, 'ott'],
  kilkis: [22.88, 40.99, 'ott'], katerini: [22.5, 40.27, 'ott'], platamon: [22.6, 40.0, 'ott'], thessalonica: [22.94, 40.64, 'thes 1423.7 venthes 1430.24 ott'],
  chalkidiki: [23.4, 40.35, 'thes 1423.7 venthes 1425 ott'], langadas: [23.07, 40.75, 'thes 1423.7 venthes 1425 ott'],
  giannitsa: [22.4, 40.8, 'thes 1423.7 venthes 1425 ott'], athos: [24.2, 40.25, 'thes 1423.7 venthes 1425 ott'], ierissos: [23.87, 40.4, 'thes 1423.7 venthes 1425 ott'],
  sithonia: [23.8, 40.08, 'thes 1423.7 venthes 1425 ott'], kassandra: [23.42, 40.03, 'thes 1423.7 venthes 1430.24 ott'],
  strymon: [23.8, 40.8, 'ott'], serres: [23.55, 41.09, 'ott'], drama: [24.15, 41.15, 'ott'], kavala: [24.41, 40.94, 'ott'], nevrokop: [23.73, 41.57, 'ott'], nestos: [24.75, 41.0, 'ott'],
  // the islands of the northern Aegean: the Gattilusi's after 1453, Ottoman in 1456, Venetian in the war of 1463–1479
  thasos: [24.67, 40.64, 'byzisl 1434 gattisl 1456.5 ott 1466.3 ven 1479.1 ott'], samothrace: [25.55, 40.47, 'byzisl 1440 gattisl 1456.5 ott 1466.3 ven 1479.1 ott'],
  imbros: [25.85, 40.17, 'byzisl 1440 gattisl 1456.5 ott 1466.3 ven 1470.43 ott'], lemnos: [25.25, 39.9, 'byzisl 1453.5 gattisl 1456.5 ott 1464.3 ven 1479.1 ott'],
  skiathos: [23.47, 39.16, 'sporades 1453.5 ven'], skopelos: [23.72, 39.12, 'sporades 1453.5 ven'], skyros: [24.56, 38.88, 'sporades 1453.5 ven'],
  // Thessaly, Epirus and Greece
  larissa: [22.42, 39.64, 'ott'], trikala: [21.77, 39.55, 'ott'], elassona: [22.19, 39.9, 'ott'], karditsa: [21.92, 39.37, 'ott'],
  pharsala: [22.38, 39.29, 'ott'], grevena: [21.43, 40.08, 'ott'], agia: [22.76, 39.72, 'ott'], volos: [22.94, 39.36, 'ott'], halmyros: [22.79, 39.18, 'ott'],
  trikeri: [23.05, 39.15, 'ott'], pelion: [23.15, 39.3, 'ott'], pteleos: [22.93, 39.02, 'ott'], domokos: [22.3, 39.13, 'ott'], neopatras: [22.24, 38.87, 'ott'],
  lamia: [22.43, 38.9, 'ott'], stylida: [22.845, 38.9375, 'ott'], atalanti: [22.99, 38.65, 'negro 1470.53 ott'], kamena: [22.84, 38.73, 'ott'],
  larymna: [23.22, 38.6, 'negro 1470.53 ott'], salona: [22.38, 38.53, 'ott'], galaxidi: [22.3, 38.38, 'ott'], eratini: [22.15, 38.4, 'ott'], lidoriki: [22.2, 38.53, 'ott 1444.9 morea 1446.9 ott'],
  // the duchy of Athens, which ends with the Acropolis in June 1458; Aegina goes to Venice in 1451
  antikyra: [22.65, 38.35, 'acc 1444.9 morea 1446.9 acc 1458.45 ott'], livadeia: [22.87, 38.43, 'acc 1444.9 morea 1446.9 acc 1458.45 ott'], thebes: [23.32, 38.32, 'acc 1444.9 morea 1446.9 acc 1458.45 ott'],
  aulis: [23.55, 38.44, 'acc 1444.9 morea 1446.9 acc 1458.45 ott'], avlida: [23.6, 38.37, 'acc 1444.9 morea 1446.9 acc 1458.45 ott'], athens: [23.73, 37.98, 'acc 1458.45 ott'], varnavas: [23.92, 38.24, 'acc 1458.45 ott'],
  marathon: [23.97, 38.15, 'acc 1458.45 ott'], oropos: [23.75, 38.3, 'acc 1458.45 ott'], lavrion: [24.0, 37.75, 'acc 1458.45 ott'], megara: [23.35, 38.0, 'acc 1458.45 ott'], aegina: [23.5, 37.74, 'acc 1451.3 ven'],
  // Negroponte, Venetian until July 1470
  chalkis: [23.68, 38.47, 'negro 1470.53 ott'], limni: [23.5, 38.72, 'negro 1470.53 ott'], oreoi: [23.08, 38.93, 'negro 1470.53 ott'], istiaia: [23.2, 38.9, 'negro 1470.53 ott'], lichada: [22.875, 38.8425, 'negro 1470.53 ott'],
  styra: [24.24, 38.18, 'negro 1470.53 ott'], eretria: [23.85, 38.42, 'negro 1470.53 ott'], aliveri: [24.05, 38.4, 'negro 1470.53 ott'], karystos: [24.42, 38.02, 'negro 1470.53 ott'], kymi: [24.1, 38.63, 'negro 1470.53 ott'],
  // the Tocco: Aetolia and Akarnania lost by 1460, Vonitsa and the islands in 1479
  naupaktos: [21.83, 38.42, 'lepanto'], antirrio: [21.77, 38.37, 'lepanto'], mesolongi: [21.43, 38.37, 'tocco 1460 ott'],
  evinochori: [21.6, 38.4, 'tocco 1460 ott'], marathias: [22.0, 38.41, 'tocco 1460 ott'], akarnania: [20.82, 38.75, 'tocco 1460 ott'],
  vonitsa: [20.95, 38.85, 'tocco 1479.65 ott'], astakos: [21.1, 38.55, 'tocco 1460 ott'], agrinio: [21.41, 38.62, 'tocco 1460 ott'],
  arta: [20.98, 39.16, 'tocco 1449 ott'], preveza: [20.75, 38.96, 'tocco 1449 ott'], paramythia: [20.5, 39.47, 'tocco 1430.77 ott'],
  igoumenitsa: [20.3, 39.45, 'tocco 1430.77 ott'], ioannina: [20.85, 39.66, 'tocco 1430.77 ott'], metsovo: [21.18, 39.77, 'tocco 1430.77 ott'],
  konitsa: [20.75, 40.05, 'tocco 1430.77 ott'], gjirokaster: [20.14, 40.08, 'ott'], permet: [20.35, 40.23, 'ott'],
  butrint: [20.08, 39.76, 'corfu'], saranda: [20.05, 39.9, 'corfu'], corfu: [19.8, 39.6, 'corfu'], corfunorth: [19.85, 39.76, 'corfu'], corfusouth: [20.0, 39.42, 'corfu'],
  paxos: [20.17, 39.2, 'corfu'], lefkada: [20.66, 38.72, 'tocco 1479.65 ott'], cephalonia: [20.55, 38.2, 'tocco 1479.65 ott'], zakynthos: [20.85, 37.78, 'tocco 1479.65 ott'],
  // the Morea: the two despots from 1453, the revolt of 1453–1454 in the hills, Mehmed's conquest in 1458 and 1460
  patras: [21.73, 38.25, 'patras 1429.45 morea' + TH + ' 1458.6 ott'], rion: [21.8, 38.26, 'patras 1429.45 morea' + TH + ' 1458.6 ott'], psathopyrgos: [21.93, 38.27, 'patras 1429.45 morea' + TH + ' 1458.6 ott'],
  araxos: [21.42, 38.12, ACH + TH + ' 1458.6 ott'], akrata: [22.35, 38.12, ACH + TH + ' 1458.6 ott'], xylokastro: [22.63, 38.03, ACH + TH + ' 1458.6 ott'],
  glarentza: [21.2, 37.88, 'tocco 1428.33 morea' + TH + ' 1460.4 ott'], vostitsa: [22.08, 38.25, ACH + TH + ' 1458.6 ott'],
  kalavryta: [22.1, 38.03, ACH + TH + REB + ' thomas 1458.6 ott'], corinth: [22.93, 37.94, 'morea' + TH + ' 1458.6 ott'], nemea: [22.66, 37.82, 'morea' + TH + ' 1458.6 ott'],
  kenchreai: [23.0, 37.87, 'morea' + TH + ' 1458.6 ott'],
  argos: [22.73, 37.63, 'nauplia 1463.25 ott'], lerna: [22.7, 37.53, 'nauplia'], nauplia: [22.8, 37.57, 'nauplia'], kranidi: [23.15, 37.38, 'nauplia'], troezen: [23.35, 37.5, 'nauplia'],
  astros: [22.65, 37.4, 'morea' + DM + ' 1460.4 ott'], elis: [21.4, 37.75, ACH + TH + ' 1460.4 ott'], kyparissia: [21.67, 37.25, 'achaea 1432.5 morea' + TH + ' 1460.4 ott'],
  pylos: [21.75, 37.0, 'achaea 1423 messenia'], modon: [21.71, 36.82, 'messenia'], coron: [21.96, 36.8, 'messenia'],
  kalamata: [22.11, 37.04, ACH + TH + ' 1458.6 demetrios 1460.4 ott'], androusa: [21.92, 37.22, ACH + TH + REB + ' thomas 1458.6 demetrios 1460.4 ott'],
  akova: [21.95, 37.67, ACH + TH + REB + ' thomas 1460.4 ott'],
  karytaina: [22.04, 37.49, 'morea' + TH + REB + ' thomas 1460.4 ott'], tripoli: [22.38, 37.51, 'morea' + DM + REB + ' demetrios 1458.6 ott'],
  mystras: [22.43, 37.07, 'morea' + DM + ' 1460.4 ott'], mani: [22.38, 36.65, 'morea' + DM + ' 1460.4 ott 1465.3 ven 1479.1 ott'],
  vardounia: [22.62, 36.88, 'morea' + DM + ' 1460.4 ott 1465.3 ven 1479.1 ott'],
  monemvasia: [22.98, 36.75, 'morea' + DM + ' 1460.4 papalmon 1464 ven'],
  malea: [23.1, 36.55, 'morea' + DM + ' 1460.4 ott'], leonidio: [22.86, 37.17, 'morea' + DM + ' 1460.4 ott'], kythera: [22.98, 36.22, 'crete'],
  // Crete and the Cyclades
  chania: [23.95, 35.4, 'crete'], candia: [25.13, 35.3, 'crete'], sitia: [26.0, 35.15, 'crete'],
  andros: [24.85, 37.85, 'archipelago'], tinos: [25.15, 37.58, 'tinos'], mykonos: [25.37, 37.45, 'tinos'], syros: [24.93, 37.44, 'archipelago'],
  kea: [24.33, 37.62, 'archipelago'], serifos: [24.48, 37.15, 'archipelago'], milos: [24.42, 36.7, 'archipelago'], paros: [25.15, 37.05, 'archipelago'],
  naxos: [25.45, 37.05, 'archipelago'], ios: [25.3, 36.72, 'archipelago'], santorini: [25.43, 36.4, 'archipelago'], amorgos: [25.88, 36.85, 'archipelago'],
  astypalaia: [26.36, 36.57, 'archipelago'],
  // Italy: the Venetian Terraferma, Ravenna and Friuli to the Isonzo; Pordenone, Habsburg; Ferrara's Polesine, Florence
  // and Siena outside the story
  venezia: [12.33, 45.44, VEN], padova: [11.88, 45.41, VEN], treviso: [12.24, 45.67, VEN], vicenza: [11.55, 45.55, VEN], verona: [11.05, 45.44, VEN],
  bassano: [11.73, 45.77, VEN], belluno: [12.22, 46.14, VEN], feltre: [11.9, 46.02, VEN], cadore: [12.43, 46.45, VEN], udine: [13.23, 46.06, VEN],
  cividale: [13.43, 46.09, VEN], gemona: [13.14, 46.28, VEN], tolmezzo: [13.01, 46.4, VEN], aquileia: [13.37, 45.77, VEN], portogruaro: [12.84, 45.78, VEN],
  chioggia: [12.28, 45.22, VEN], ravenna: [12.2, 44.42, VEN], cervia: [12.35, 44.26, VEN], pordenone: [12.66, 45.96, '-'],
  rovigo: [11.79, 45.07, '-'], ferrara: [11.62, 44.84, '-'], florence: [11.25, 43.77, '-'], arezzo: [11.88, 43.46, '-'], siena: [11.33, 43.32, '-'], grosseto: [11.11, 42.76, '-'],
  trento: [11.12, 46.07, '-'], bolzano: [11.35, 46.5, '-'], bressanone: [11.66, 46.71, '-'], sanmarino: [12.45, 43.94, '-'],
  // the Papal States with the vicariates of Romagna and the Marche
  bologna: [11.34, 44.49, PAP], imola: [11.71, 44.35, PAP], forli: [12.04, 44.22, PAP], rimini: [12.57, 44.06, PAP], urbino: [12.64, 43.73, PAP], pesaro: [12.91, 43.91, PAP],
  ancona: [13.52, 43.62, PAP], macerata: [13.45, 43.3, PAP], fermo: [13.72, 43.16, PAP], ascoli: [13.58, 42.85, PAP], perugia: [12.39, 43.11, PAP], cittadicastello: [12.24, 43.46, PAP],
  gubbio: [12.58, 43.35, PAP], camerino: [13.07, 43.14, PAP], spoleto: [12.74, 42.73, PAP], orvieto: [12.11, 42.72, PAP], viterbo: [12.1, 42.42, PAP], civitavecchia: [11.8, 42.09, PAP],
  rieti: [12.86, 42.4, PAP], rome: [12.5, 41.9, PAP], tivoli: [12.8, 41.96, PAP], anagni: [13.16, 41.74, PAP], frosinone: [13.35, 41.64, PAP], terracina: [13.25, 41.29, PAP],
  velletri: [12.78, 41.69, PAP],
  // the Kingdom of Naples
  teramo: [13.7, 42.66, NAP], laquila: [13.4, 42.35, NAP], pescara: [14.21, 42.46, NAP], chieti: [14.17, 42.35, NAP], sulmona: [13.93, 42.05, NAP], avezzano: [13.43, 42.03, NAP],
  sora: [13.61, 41.72, NAP], cassino: [13.83, 41.49, NAP], gaeta: [13.57, 41.21, NAP], isernia: [14.23, 41.59, NAP], campobasso: [14.66, 41.56, NAP], termoli: [14.99, 42.0, NAP],
  vasto: [14.71, 42.11, NAP], lanciano: [14.39, 42.23, NAP], foggia: [15.55, 41.46, NAP], manfredonia: [15.92, 41.63, NAP], vieste: [16.18, 41.88, NAP], sansevero: [15.38, 41.69, NAP],
  capua: [14.21, 41.11, NAP], napoli: [14.25, 40.85, NAP], sorrento: [14.37, 40.63, NAP], salerno: [14.77, 40.68, NAP], avellino: [14.79, 40.91, NAP], benevento: [14.78, 41.13, NAP],
  ariano: [15.09, 41.15, NAP], melfi: [15.65, 40.99, NAP], barletta: [16.28, 41.32, NAP], trani: [16.42, 41.28, NAP], bari: [16.87, 41.12, NAP], monopoli: [17.3, 40.95, NAP],
  altamura: [16.55, 40.83, NAP], gioia: [16.92, 40.8, NAP], potenza: [15.8, 40.64, NAP], matera: [16.6, 40.67, NAP], taranto: [17.24, 40.47, NAP], manduria: [17.63, 40.4, NAP],
  brindisi: [17.94, 40.64, NAP], ostuni: [17.58, 40.73, NAP], lecce: [18.17, 40.35, NAP], gallipoliit: [17.99, 40.06, NAP], leuca: [18.36, 39.8, NAP], nardo: [18.03, 40.18, NAP],
  maglie: [18.3, 40.12, NAP], policoro: [16.68, 40.21, NAP], sala: [15.59, 40.4, NAP], lagonegro: [15.76, 40.12, NAP], eboli: [15.06, 40.62, NAP], agropoli: [14.99, 40.35, NAP],
  scalea: [15.8, 39.81, NAP], castrovillari: [16.2, 39.81, NAP], paola: [16.04, 39.36, NAP], cosenza: [16.25, 39.3, NAP], rossano: [16.63, 39.58, NAP], crotone: [17.13, 39.08, NAP],
  catanzaro: [16.59, 38.91, NAP], vibo: [16.1, 38.68, NAP], locri: [16.26, 38.24, NAP], reggio: [15.65, 38.11, NAP],
  // Sicily, Aragonese, outside the story
  messina: [15.55, 38.19, '-'], palermo: [13.36, 38.12, '-'], catania: [15.09, 37.5, '-'], syracuse: [15.29, 37.07, '-'], agrigento: [13.58, 37.31, '-'],
  trapani: [12.51, 38.02, '-'], enna: [14.28, 37.57, '-'], cefalu: [14.02, 38.04, '-'], ragusasic: [14.73, 36.93, '-'], mazara: [12.59, 37.65, '-'],
  // Georgia, the Caucasus and Iran: the Kara Koyunlu's until Uzun Hasan beats Jahan Shah in November 1467
  tbilisi: [44.8, 41.7, 'georgia'], kutaisi: [42.7, 42.27, 'georgia'], akhaltsikhe: [42.98, 41.64, 'georgia'], batumi: [41.64, 41.64, 'georgia'], poti: [41.67, 42.15, 'georgia'],
  sukhumi: [41.0, 43.0, 'georgia'], gagra: [40.27, 43.33, 'georgia'], telavi: [45.47, 41.92, 'georgia'], gori: [44.11, 41.98, 'georgia'], zugdidi: [41.87, 42.51, 'georgia'],
  ozurgeti: [42.0, 41.92, 'georgia'], akhalkalaki: [43.48, 41.4, 'georgia'], oni: [43.44, 42.58, 'georgia'], zaqatala: [46.65, 41.63, 'georgia'], marneuli: [44.81, 41.48, 'georgia'],
  yerevan: [44.51, 40.18, KK], gyumri: [43.84, 40.79, KK], vanadzor: [44.49, 40.81, KK], sevan: [45.0, 40.4, KK], goris: [46.34, 39.51, KK], nakhchivan: [45.41, 39.21, KK],
  ganja: [46.36, 40.68, KK], shusha: [46.75, 39.76, KK], barda: [47.13, 40.37, KK], mughan: [48.0, 39.6, KK], gazakh: [45.36, 41.1, KK], lankaran: [48.85, 38.75, KK],
  tabriz: [46.29, 38.08, KK], marand: [45.77, 38.43, KK], khoy: [44.95, 38.55, KK], urmia: [45.07, 37.55, KK], salmas: [44.77, 38.2, KK], maragheh: [46.24, 37.39, KK],
  miyaneh: [47.7, 37.42, KK], ardabil: [48.29, 38.25, KK], mahabad: [45.72, 36.76, KK], saqqez: [46.27, 36.25, KK], sanandaj: [47.0, 35.31, KK], kermanshah: [47.07, 34.31, KK],
  ilam: [46.42, 33.64, KK], zanjan: [48.48, 36.67, KK], ahar: [47.07, 38.48, KK], maku: [44.42, 39.29, KK], sarab: [47.54, 37.94, KK], hamadan: [48.51, 34.8, KK],
  bijar: [47.61, 35.87, KK], miandoab: [46.1, 36.97, KK], piranshahr: [45.14, 36.7, KK], khorramabad: [48.35, 33.49, KK], qazvin: [50.0, 36.27, KK], tehran: [51.39, 35.69, KK],
  qom: [50.88, 34.64, KK], arak: [49.69, 34.09, KK], isfahan: [51.67, 32.65, KK], shiraz: [52.53, 29.6, KK], kashan: [51.44, 33.98, KK], dezful: [48.4, 32.38, KK],
  // Shirvan, Gilan, Mazandaran and Khuzestan, outside the story
  sheki: [47.17, 41.2, '-'], shamakhi: [48.64, 40.63, '-'], quba: [48.51, 41.36, '-'], baku: [49.87, 40.41, '-'], rasht: [49.58, 37.28, '-'], sari: [52.6, 36.5, '-'], ahvaz: [48.67, 31.32, '-'],
  // Russia: Circassia, the north Caucasus and the steppe of the Great Horde, outside the story
  sochi: [39.73, 43.6, '-'], maykop: [40.1, 44.6, '-'], novorossiysk: [37.77, 44.72, '-'], krasnodar: [38.98, 45.04, '-'], taman: [36.72, 45.2, '-'], yeysk: [38.27, 46.7, '-'],
  rostov: [39.7, 47.23, '-'], taganrog: [38.9, 47.22, '-'], stavropol: [41.97, 45.04, '-'], cherkessk: [42.06, 44.22, '-'], nalchik: [43.6, 43.49, '-'], vladikavkaz: [44.68, 43.02, '-'],
  grozny: [45.7, 43.32, '-'], makhachkala: [47.5, 42.98, '-'], derbent: [48.29, 42.06, '-'], kizlyar: [46.71, 43.85, '-'], elista: [44.27, 46.31, '-'], salsk: [41.5, 46.47, '-'],
  volgodonsk: [42.15, 47.51, '-'], volgograd: [44.5, 48.7, '-'], kamensk: [40.27, 48.32, '-'], millerovo: [40.4, 48.92, '-'], voronezh: [39.2, 51.66, '-'], belgorod: [36.6, 50.6, '-'],
  kursk: [36.19, 51.73, '-'], saratov: [46.0, 51.5, '-'], astrakhan: [48.03, 46.35, '-'], uryupinsk: [42.0, 50.8, '-'], kalach: [41.0, 50.4, '-'], kropotkin: [40.57, 45.44, '-'],
  armavir: [41.12, 44.99, '-'], pyatigorsk: [43.06, 44.04, '-'], budyonnovsk: [44.16, 44.78, '-'],
};

// places smaller than a town's area, drawn by hand: [ring, owners]
const ringIn = (centre, km, landOf) => {
  const c = turf.circle(centre, km, { steps: 24 }), g = landOf ? I(c, landOf) : c;
  return polysOf(g.geometry).sort((a, b) => km2(turf.polygon(b)) - km2(turf.polygon(a)))[0][0].slice(0, -1);
};
const SMALL = {
  // the city inside the land walls, south of the Golden Horn, which the 1:10m land does not show as water
  constantinople: [[[28.918, 40.993], [28.945, 40.998], [28.97, 41.003], [28.985, 41.008], [28.986, 41.015], [28.972, 41.016], [28.96, 41.021], [28.95, 41.031],
    [28.944, 41.042], [28.932, 41.036], [28.92, 41.02]], 'byz 1453.41 ott'],
  // Pera, the Genoese town across the Golden Horn, which surrenders after the fall
  galata: [[[28.962, 41.024], [28.988, 41.022], [29.005, 41.026], [29.005, 41.04], [28.99, 41.042], [28.975, 41.04], [28.962, 41.034]], 'galata 1453.42 ott'],
  // the castle of St Peter at Bodrum, held by the Knights
  bodrumcastle: [ringIn([27.43, 37.035], 2.5, country('Turkey')), 'bodrum'],
  // the bridgeheads on the north bank of the Danube: Little Nicopolis (Turnu) and Giurgiu, which Vlad II takes in 1445
  // and Vlad III burns in February 1462
  turnu: [ringIn([24.87, 43.75], 5, country('Romania')), 'ott'],
  giurgiu: [ringIn([25.97, 43.92], 6, country('Romania')), 'ott 1445.65 wallachia 1462.05 - 1462.4 ott'],
  // Buzëgjarpri at the mouth of the Drin, which Venice cedes to Skanderbeg by the peace of 4 October 1448
  buzegjarpri: [ringIn([19.575, 41.835], 3, country('Albania')), 'venalb 1448.755 skanderbeg 1468.1 venalb 1474 ott'],
  // the town of Krujë, Venetian from Skanderbeg's death to its surrender in June 1478
  krujecastle: [ringIn([19.795, 41.512], 2.5, country('Albania')), 'ott 1443.905 skanderbeg 1468.1 venalb 1478.45 ott'],
  // Tana at the mouth of the Don, a Genoese trading post until 1475
  tana: [ringIn([39.42, 47.11], 6, country('Russia')), 'gazaria 1475.6 ott'],
  // Otranto, held by the Ottoman garrison from August 1480 to September 1481
  otranto: [ringIn([18.49, 40.15], 7, country('Italy')), 'naples 1480.61 ott 1481.7 naples'],
};

// --- owners: family, the id each zone's name starts with, and the names from the year they apply ---
const N = (from, en, tr, id) => ({ from, en, tr, id });
const O = {
  ott: ['ottomans', 'ottomans', [N(1421, 'Ottoman state under Mehmed II', 'II. Mehmed yönetiminde Osmanlı Devleti')]],
  byz: ['byzantium', 'byzantium', [N(1421, 'Byzantine Empire under Constantine XI, paying tribute to the Ottomans', 'Osmanlı’ya vergi veren XI. Konstantinos yönetiminde Bizans İmparatorluğu'),
    N(1452.3, 'Byzantine Empire under Constantine XI', 'XI. Konstantinos yönetiminde Bizans İmparatorluğu')]],
  morea: ['byzantium', 'morea', [N(1421, 'Despotate of the Morea under Demetrios and Thomas, paying tribute to the Ottomans', 'Osmanlı’ya vergi veren Demetrios ve Thomas yönetiminde Mora Despotluğu')]],
  thes: ['byzantium', 'thessalonica', [N(1421, 'Thessalonica under Andronikos Palaiologos', 'Andronikos Palaiologos yönetiminde Selanik')]],
  byzisl: ['byzantium', 'aegean-islands', [N(1421, 'Byzantine islands of the northern Aegean', 'Bizans’ın Kuzey Ege adaları')]],
  sporades: ['byzantium', 'sporades', [N(1421, 'Northern Sporades, Byzantine', 'Bizans’ın Kuzey İsporad adaları')]],
  thomas: ['thomas', 'thomas', [N(1453, 'Lands of Thomas Palaiologos in the Morea', 'Thomas Palaiologos’un Mora’daki toprakları')]],
  demetrios: ['demetrios', 'demetrios', [N(1453, 'Lands of Demetrios Palaiologos in the Morea', 'Demetrios Palaiologos’un Mora’daki toprakları')]],
  rebels: ['morea-rebels', 'morea-rebels', [N(1453, 'Rebels in the Morea under John Asen Zaccaria and Manuel Kantakouzenos', 'Giovanni Asen Zaccaria ve Manuel Kantakuzenos önderliğinde Mora isyancıları')]],
  serbia: ['serbia', 'serbia', [N(1421, 'Serbian Despotate under Đurađ Branković, an Ottoman vassal', 'Osmanlı’ya bağlı Đurađ Brankoviç yönetiminde Sırp Despotluğu'),
    N(1457, 'Serbian Despotate under Lazar Branković, an Ottoman vassal', 'Osmanlı’ya bağlı Lazar Brankoviç yönetiminde Sırp Despotluğu'),
    N(1458.05, 'Serbian Despotate under Stefan Branković', 'Stefan Brankoviç yönetiminde Sırp Despotluğu')]],
  zeta: ['zeta', 'zeta', [N(1421, 'Zeta under Stefan Crnojević', 'Stefan Crnojević yönetiminde Zeta'), N(1465.5, 'Zeta under Ivan Crnojević', 'İvan Crnojević yönetiminde Zeta')]],
  karaman: ['karaman', 'karaman', [N(1421, 'Beylik of Karaman under Ibrahim II', 'II. İbrahim Bey yönetiminde Karamanoğulları Beyliği'),
    N(1464.5, 'Beylik of Karaman under Pir Ahmed', 'Pir Ahmed Bey yönetiminde Karamanoğulları Beyliği'),
    N(1473, 'Beylik of Karaman under Pir Ahmed and Kasım', 'Pir Ahmed ve Kasım Bey yönetiminde Karamanoğulları Beyliği')]],
  germiyan: ['germiyan', 'germiyan', [N(1421, 'Beylik of Germiyan under Yakub II', 'II. Yakub Bey yönetiminde Germiyanoğulları Beyliği')]],
  aydin: ['aydin', 'aydin', [N(1421, 'Cüneyd’s beylik of Aydın', 'Cüneyd Bey’in Aydınoğulları Beyliği')]],
  mentese: ['mentese', 'mentese', [N(1421, 'Beylik of Menteşe', 'Menteşeoğulları Beyliği')]],
  teke: ['teke', 'teke', [N(1421, 'Beylik of Teke', 'Tekeoğulları Beyliği')]],
  candar: ['candar', 'candar', [N(1421, 'Beylik of Candar under İsmail, an Ottoman vassal', 'Osmanlı’ya bağlı İsmail Bey yönetiminde Candaroğulları Beyliği')]],
  dul: ['dulkadir', 'dulkadir', [N(1421, 'Beylik of Dulkadir', 'Dulkadiroğulları Beyliği'),
    N(1466.5, 'Beylik of Dulkadir under Shah Suwar', 'Şehsuvar Bey yönetiminde Dulkadiroğulları Beyliği'),
    N(1472.6, 'Beylik of Dulkadir under Shah Budak', 'Şah Budak Bey yönetiminde Dulkadiroğulları Beyliği'),
    N(1480.3, 'Beylik of Dulkadir under Ala al-Dawla', 'Alaüddevle Bozkurt Bey yönetiminde Dulkadiroğulları Beyliği')]],
  mam: ['mamluks', 'mamluks', [N(1421, 'Mamluk Sultanate under Jaqmaq', 'Çakmak yönetiminde Memlük Sultanlığı'), N(1453.1, 'Mamluk Sultanate under Inal', 'İnal yönetiminde Memlük Sultanlığı'),
    N(1461.5, 'Mamluk Sultanate under Khushqadam', 'Hoşkadem yönetiminde Memlük Sultanlığı'), N(1468.1, 'Mamluk Sultanate under Qaitbay', 'Kayıtbay yönetiminde Memlük Sultanlığı')]],
  treb: ['trebizond', 'trebizond', [N(1421, 'Empire of Trebizond', 'Trabzon İmparatorluğu')]],
  aq: ['aq-qoyunlu', 'aq-qoyunlu', [N(1421, 'Aq Qoyunlu', 'Akkoyunlular'), N(1453.5, 'Aq Qoyunlu under Uzun Hasan', 'Uzun Hasan yönetiminde Akkoyunlular'),
    N(1478.5, 'Aq Qoyunlu under Yaqub', 'Yakub Bey yönetiminde Akkoyunlular')]],
  kk: ['kara-koyunlu', 'kara-koyunlu', [N(1421, 'Kara Koyunlu under Jahan Shah', 'Cihan Şah yönetiminde Karakoyunlular')]],
  georgia: ['georgia', 'georgia', [N(1421, 'Kingdom of Georgia', 'Gürcistan Krallığı'), N(1463.5, 'Georgian kingdoms and principalities', 'Gürcü krallıkları ve prenslikleri')]],
  hungary: ['hungary', 'hungary', [N(1421, 'Kingdom of Hungary, John Hunyadi regent for Ladislaus V', 'V. Ladislaus adına naip Hunyadi Yanoş yönetiminde Macaristan Krallığı'),
    N(1453.05, 'Kingdom of Hungary under Ladislaus V', 'V. Ladislaus yönetiminde Macaristan Krallığı'),
    N(1458.1, 'Kingdom of Hungary under Matthias Corvinus', 'Matyas Korvin yönetiminde Macaristan Krallığı')]],
  poland: ['poland', 'poland', [N(1421, 'Kingdom of Poland under Casimir IV', 'IV. Kazimierz yönetiminde Polonya Krallığı')]],
  bosnia: ['bosnia', 'bosnia', [N(1421, 'Kingdom of Bosnia under Stephen Thomas', 'Stjepan Tomaš yönetiminde Bosna Krallığı'),
    N(1461.55, 'Kingdom of Bosnia under Stephen Tomašević', 'Stjepan Tomašević yönetiminde Bosna Krallığı')]],
  herz: ['herzegovina', 'herzegovina', [N(1421, 'Herzegovina under Stjepan Vukčić Kosača', 'Stjepan Vukčić Kosača yönetiminde Hersek'),
    N(1466.4, 'Herzegovina under Vladislav and Vlatko Hercegović', 'Vladislav ve Vlatko Hercegović yönetiminde Hersek')]],
  wallachia: ['wallachia', 'wallachia', [N(1421, 'Wallachia under Vladislav II', 'II. Vladislav yönetiminde Eflak'),
    N(1456.6, 'Wallachia under Vlad III, an Ottoman vassal', 'Osmanlı’ya bağlı III. Vlad yönetiminde Eflak'),
    N(1461.9, 'Wallachia under Vlad III', 'III. Vlad yönetiminde Eflak'),
    N(1462.45, 'Wallachia, contested by Vlad III and Radu', 'III. Vlad ile Radu arasında çekişmeli Eflak'),
    N(1462.9, 'Wallachia under Radu, an Ottoman vassal', 'Osmanlı’ya bağlı Radu yönetiminde Eflak'),
    N(1474.8, 'Wallachia under Basarab Laiotă, an Ottoman vassal', 'Osmanlı’ya bağlı Basarab Laiotă yönetiminde Eflak'),
    N(1477.9, 'Wallachia under Basarab the Younger, an Ottoman vassal', 'Osmanlı’ya bağlı Genç Basarab yönetiminde Eflak')]],
  moldavia: ['moldavia', 'moldavia', [N(1421, 'Principality of Moldavia under Bogdan II', 'II. Bogdan yönetiminde Boğdan Prensliği'),
    N(1451.8, 'Principality of Moldavia under Peter Aron', 'Petru Aron yönetiminde Boğdan Prensliği'),
    N(1457.3, 'Principality of Moldavia under Stephen the Great', 'Büyük Ştefan yönetiminde Boğdan Prensliği')]],
  ragusa: ['ragusa', 'ragusa', [N(1421, 'Republic of Ragusa', 'Ragusa (Dubrovnik) Cumhuriyeti')]],
  skanderbeg: ['skanderbeg', 'skanderbeg', [N(1421, 'League of Lezhë under Skanderbeg', 'İskender Bey önderliğinde Leş Birliği')]],
  arianiti: ['skanderbeg', 'arianiti', [N(1421, 'Lands of Gjergj Arianiti, in revolt', 'İsyandaki Gjergj Arianiti’nin toprakları')]],
  alb: ['albanian-lords', 'albanian-lords', [N(1421, 'Lands of the Dukagjini', 'Dukagjini ailesinin toprakları')]],
  tocco: ['epirus', 'epirus', [N(1421, 'Lands of Leonardo III Tocco', 'III. Leonardo Tocco’nun toprakları')]],
  achaea: ['achaea', 'achaea', [N(1421, 'Arcadia, the last land of Centurione II Zaccaria', 'II. Centurione Zaccaria’nın son toprağı Arkadia')]],
  patras: ['achaea', 'patras', [N(1421, 'Patras under its Latin archbishop', 'Latin başpiskoposu yönetiminde Balyabadra')]],
  acc: ['athens', 'athens', [N(1421, 'Duchy of Athens under the Acciaioli, an Ottoman vassal', 'Osmanlı’ya bağlı Acciaioli ailesi yönetiminde Atina Dükalığı')]],
  crete: ['venice', 'crete', [N(1421, 'Venetian Crete', 'Venedik’in Girit’i')]],
  negro: ['venice', 'negroponte', [N(1421, 'Negroponte (Euboea), Venetian', 'Venedik’in Eğriboz’u')]],
  messenia: ['venice', 'modon-coron', [N(1421, 'Modon and Coron, Venetian', 'Venedik’in Moton ve Koron’u')]],
  nauplia: ['venice', 'nauplia', [N(1421, 'Argos and Nauplia, Venetian', 'Venedik’in Arhos ve Anabolu’su')]],
  corfu: ['venice', 'corfu', [N(1421, 'Corfu, Venetian', 'Venedik’in Korfu’su')]],
  venalb: ['venice', 'venetian-albania', [N(1421, 'Venetian towns in Albania', 'Venedik’in Arnavutluk’taki şehirleri')]],
  venthes: ['venice', 'venetian-thessalonica', [N(1421, 'Thessalonica, Venetian 1423–1430', '1423–1430 arasında Venedik’in Selanik’i')]],
  lepanto: ['venice', 'lepanto', [N(1421, 'Lepanto, Venetian', 'Venedik’in İnebahtı’sı')]],
  archipelago: ['venice', 'archipelago', [N(1421, 'Duchy of the Archipelago, a Venetian client', 'Venedik’e bağlı Ege Dükalığı (Nakşa)')]],
  tinos: ['venice', 'tinos', [N(1421, 'Tinos and Mykonos, Venetian', 'Venedik’in İstendil ve Mikonos’u')]],
  dalmatia: ['venice', 'dalmatia', [N(1421, 'Venetian Dalmatia', 'Venedik’in Dalmaçya’sı')]],
  istria: ['venice', 'istria', [N(1421, 'Venetian Istria', 'Venedik’in İstria’sı')]],
  ven: ['venice', 'venetian-possessions', [N(1421, 'Venetian possessions', 'Venedik toprakları')]],
  veneto: ['venice', 'venice', [N(1421, 'Republic of Venice', 'Venedik Cumhuriyeti')]],
  galata: ['genoa', 'galata', [N(1421, 'Galata (Pera), Genoese', 'Cenevizlilerin Galata’sı')]],
  amastris: ['genoa', 'amastris', [N(1421, 'Amastris, Genoese', 'Cenevizlilerin Amasra’sı')]],
  gazaria: ['genoa', 'gazaria', [N(1421, 'Genoese towns of the Crimea', 'Cenevizlilerin Kırım’daki şehirleri')]],
  famagusta: ['genoa', 'famagusta', [N(1421, 'Famagusta, Genoese', 'Cenevizlilerin Magosa’sı')]],
  chios: ['chios', 'chios', [N(1421, 'Chios and Samos under the Genoese Maona', 'Ceneviz Maona şirketinin Sakız ve Sisam’ı'),
    N(1475.5, 'Chios under the Genoese Maona', 'Ceneviz Maona şirketinin Sakız’ı')]],
  phocaea: ['chios', 'phocaea', [N(1421, 'Phocaea under the Genoese Maona', 'Ceneviz Maona şirketinin Foça’sı')]],
  lesbos: ['gattilusi', 'lesbos', [N(1421, 'Lesbos under the Gattilusi', 'Gattilusi ailesinin Midilli’si')]],
  ainos: ['gattilusi', 'ainos', [N(1421, 'Ainos under the Gattilusi', 'Gattilusi ailesinin Enez’i')]],
  gattisl: ['gattilusi', 'gattilusi-islands', [N(1421, 'Islands of the Gattilusi in the northern Aegean', 'Gattilusi ailesinin Kuzey Ege adaları')]],
  rhodes: ['knights', 'rhodes', [N(1421, 'Rhodes and the Dodecanese, held by the Knights Hospitaller', 'Hospitalier şövalyelerinin Rodos ve Onikiada’sı')]],
  bodrum: ['knights', 'bodrum', [N(1421, 'Castle of Bodrum, held by the Knights Hospitaller', 'Hospitalier şövalyelerinin Bodrum Kalesi')]],
  naples: ['naples', 'naples', [N(1421, 'Kingdom of Naples under Alfonso V', 'V. Alfonso yönetiminde Napoli Krallığı'), N(1458.45, 'Kingdom of Naples under Ferrante', 'Ferrante yönetiminde Napoli Krallığı')]],
  papal: ['papacy', 'papal-states', [N(1421, 'Papal States', 'Papalık Devleti')]],
  papalmon: ['papacy', 'monemvasia', [N(1421, 'Monemvasia, held for the pope', 'Papa adına tutulan Monemvasia')]],
  theodoro: ['theodoro', 'theodoro', [N(1421, 'Principality of Theodoro', 'Theodoro (Mangup) Prensliği')]],
  crimea: ['crimea', 'crimea', [N(1421, 'Crimean Khanate under Hacı Giray', 'Hacı Giray yönetiminde Kırım Hanlığı'),
    N(1466.7, 'Crimean Khanate under Mengli Giray', 'Mengli Giray yönetiminde Kırım Hanlığı'),
    N(1475.4, 'Crimean Khanate under Nur Devlet, an Ottoman vassal', 'Osmanlı’ya bağlı Nur Devlet yönetiminde Kırım Hanlığı'),
    N(1478.3, 'Crimean Khanate under Mengli Giray, an Ottoman vassal', 'Osmanlı’ya bağlı Mengli Giray yönetiminde Kırım Hanlığı')]],
  cyprus: ['cyprus', 'cyprus', [N(1421, 'Kingdom of Cyprus', 'Kıbrıs Krallığı')]],
};

// --- periods: the moment whose owners a page shows ---
const PERIODS = [
  // the Ottoman lands keep story 3's last outline, redrawn where an owner differs from it, until Constantinople falls
  [1451.85, ['accession', 'karaman-1451'], { outline: 'ottomans-1451' }],
  [1452.8, ['rumelihisari'], { outline: 'ottomans-1451' }],
  [1453.2, ['preparations', 'polog'], { outline: 'ottomans-1451' }],
  [1453.8, ['after-1453']],
  [1454.5, ['morea-revolt']],
  [1454.85, ['serbia-1454']],
  [1455.5, ['novo-brdo-1455']],
  [1456.5, ['belgrade', 'berat']],
  [1456.95, ['aegean-1456']],
  [1457.7, ['albulena']],
  [1458.0, ['after-belgrade']],
  [1458.7, ['corinth-1458']],
  [1459.95, ['smederevo-1459']],
  [1460.8, ['mistra-1460']],
  [1461.5, ['amasra-sinop']],
  [1461.65, ['trebizond']],
  [1462.1, ['danube-1462']],
  [1462.55, ['night-attack', 'mokra']],
  [1462.75, ['lesbos']],
  [1463.45, ['bosnia']],
  [1464.7, ['ohrid']],
  [1464.95, ['jajce']],
  [1465.5, ['venice-war']],
  [1465.6, ['vaikal']],
  [1466.6, ['patras']],
  [1466.9, ['herzegovina', 'kruje-1466']],
  [1467.8, ['kruje-1467']],
  [1469.1, ['aq-qoyunlu']],
  [1469.95, ['karaman']],
  [1470.55, ['negroponte']],
  [1472.95, ['karaman-coast', 'beysehir-1472']],
  [1473.55, ['otlukbeli']],
  [1474.5, ['shkodra-1474']],
  [1475.05, ['vaslui']],
  [1475.95, ['after-otlukbeli', 'caffa']],
  [1476.15, ['sabac']],
  [1476.65, ['valea-alba']],
  [1477.8, ['friuli']],
  [1478.7, ['shkodra-1478']],
  [1479.8, ['peace-1479', 'government', 'court', 'breadfield']],
  [1480.55, ['rhodes']],
  [1480.75, ['otranto']],
  [1481.35, ['death']],
];
// the overview of the siege of Constantinople, the phase pages of the three battle plans and the plan of Istanbul show
// none: their plans draw the land, the walls, the camps and the water over any zone
const NONE = ['istanbul', 'constantinople', 'constantinople-chain', 'constantinople-guns', 'constantinople-four-ships', 'constantinople-overland', 'constantinople-mines',
  'constantinople-assault', 'constantinople-fall', 'belgrade-river', 'belgrade-assault', 'belgrade-sortie', 'otlukbeli-euphrates', 'otlukbeli-battle'];
// the Ottoman lands of this page are a shared zone that the story of Bayezid II opens on
const SHARED = [
  { id: 'ottomans-1481', page: 'death', en: 'Ottoman state at the death of Mehmed II, 1481', tr: 'II. Mehmed’in ölümünde Osmanlı Devleti, 1481' },
];
// the shared zones this story reads: story 3's last Ottoman lands, and the moment they show
const OUTLINES = ['ottomans-1451'], OUTLINE_YEAR = 1451.0;
// a page that looks closer than the town areas reach, an island inside one state's land: one zone over its frame
const CLOSE = { rhodes: 'rhodes' };


// --- the owners' timelines ---
const history = (id, s) => {
  const t = s.split(/\s+/), steps = [[-Infinity, t[0]]];
  for (let i = 1; i < t.length; i += 2) steps.push([+t[i], t[i + 1]]);
  for (const [, o] of steps) if (o !== '-' && !O[o]) throw new Error(`${id}: unknown owner ${o}`);
  for (let i = 2; i < steps.length; i++) if (!(steps[i][0] > steps[i - 1][0])) throw new Error(`${id}: years out of order`);
  return steps;
};
const ownerAt = (steps, year) => steps.filter(([y]) => y <= year).at(-1)[1];

// --- the towns' areas: the land nearest each town along a raster of the ground, where LINES cost BARRIER km, WATER is
// closed and noise bends the borders; Voronoi cells of sites on a lattice turn them into polygons with shared edges.
// The raster is story 3's, which starts at 12°E, with XOFF columns added west of it: a column keeps its centre and its
// index moves by XOFF, so the areas come out as story 3's wherever the towns and the land are the same ---
const RES = 0.02, X0 = 12, XOFF = Math.round((X0 - BOX[0]) / RES), [W0, S0, E0, N0] = BOX, NX = Math.round((E0 - W0) / RES), NY = Math.round((N0 - S0) / RES);
const colAt = lon => Math.floor((lon - X0) / RES) + XOFF, xOf = c => X0 + (c - XOFF + 0.5) * RES;
const cellAt = (lon, lat) => { const x = colAt(lon), y = Math.floor((lat - S0) / RES); return x >= 0 && x < NX && y >= 0 && y < NY ? y * NX + x : -1; };
const centre = c => [xOf(c % NX), S0 + (Math.floor(c / NX) + 0.5) * RES];
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
    for (let k = 0; k + 1 < xs.length; k += 2) for (let c = Math.max(0, Math.ceil((xs[k] - X0) / RES - 0.5) + XOFF); c < NX && xOf(c) < xs[k + 1]; c++) grid[r * NX + c] = value;
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
const borderLines = pair => { const key = [...pair].sort().join('|'); return tc.mesh(world, world.objects.countries, (a, b) => a !== b && [a.properties.name, b.properties.name].sort().join('|') === key).coordinates; };
for (const pair of RIVER_BORDERS) borderLines(pair).forEach(l => draw(barrier, l));
Object.values(WATER).forEach(l => draw(wall, l));
// the cost of the ground: 1 on average, 0.55 to 1.45 in three octaves of smooth noise, the same on every run. Story 3's
// noise starts at 12°E; west of it, it repeats as in a mirror
let seed = 1389;
const rand = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
const noise = g => {
  const nx = Math.ceil((BOX2[2] - BOX2[0]) / g) + 2, ny = Math.ceil((BOX2[3] - BOX2[1]) / g) + 2, v = Float32Array.from({ length: nx * ny }, () => rand() * 2 - 1);
  return (lon, lat) => {
    // north of story 2's box the noise keeps its last row
    const fx = Math.abs(lon - X0) / g, fy = (lat - S0) / g, x = Math.floor(fx), y = Math.min(Math.floor(fy), ny - 2), s = fx - x, t = Math.min(1, fy - y);
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

// --who=lon,lat;lon,lat prints the town whose area holds each point, and stops
{
  const arg = process.argv.find(a => a.startsWith('--who='));
  if (arg) { for (const q of arg.slice(6).split(';')) { const [x, y] = q.split(',').map(Number), c = cellAt(x, y); console.log(`  ${q}: ${owner[c] >= 0 ? towns[owner[c]].id : 'sea'}`); } process.exit(0); }
}
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
// story 3's lattices first, in its order, so the jitter of its sites comes out the same; then this story's
lattice(BOX2, LATTICE, (x, y) => FINE.some(([b]) => inBox(b)(x, y)));
for (const [b, step] of FINE3) lattice(b, step);
lattice([X0, BOX2[3], E0, N0], LATTICE);
for (const [b, step] of FINE4) lattice(b, step);
lattice([W0, S0, X0, N0], LATTICE);
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
  for (const line of borderLines(pair))
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

// the towns and small places of story 3, read from its script, to list the ones whose owner in 1451 differs from its
const story3Units = (() => {
  const src = fs.readFileSync(path.join(story3, '.plans', 'zones.mjs'), 'utf8');
  const block = name => src.slice(src.indexOf(`const ${name} = {`), src.indexOf('\n};', src.indexOf(`const ${name} = {`)));
  return new Set([...`${block('T')}\n${block('SMALL')}`.matchAll(/(?:^|[\s,{])([a-zA-Z]+): \[/g)].map(m => m[1]));
})();

// --- the zones of each period: its owners' cells merged. An owner whose land lies in parts, such as islands, keeps them
// as one zone of several parts ---
const Z = {}, byKey = {};
const nameAt = (o, year) => O[o][2].filter(n => n.from <= year).at(-1);
// ids that stand for shared zones: story 3's last Ottoman lands and the one this story writes
for (const id of [...OUTLINES, ...SHARED.map(s => s.id)]) Z[id] = { id, reserved: true };
const freeId = id => { while (Z[id]) id = id.replace(/(-\d+)([a-z]?)$/, (_, y, s) => y + (s ? String.fromCharCode(s.charCodeAt(0) + 1) : 'b')); return id; };
const geometryOf = parts => parts.length > 1 ? { type: 'MultiPolygon', coordinates: parts.map(x => x.p) } : { type: 'Polygon', coordinates: parts[0].p };
const sharedGeometry = id => JSON.parse(fs.readFileSync(path.join(content, 'shared', 'zones', id, 'zone.geojson'), 'utf8')).geometry;
const aliases = {}, aliasKeys = {};
const periodZones = PERIODS.map(([year, pages, opts = {}]) => {
  const owned = {};
  units.forEach((u, k) => { const o = ownerAt(u.steps, year); if (o !== '-') (owned[o] ??= []).push(k); });
  const ids = [];
  for (const [o, idx] of Object.entries(owned)) {
    const merged = tc.merge(topo, idx.flatMap(k => unitGeoms[k]));
    const parts = merged.coordinates.map(p => ({ p, a: km2(turf.polygon(p)) })).sort((x, y) => y.a - x.a);
    if (!parts.length) { problems.push(`${year} ${o}: no land in ${idx.map(k => units[k].id).join(', ')}`); continue; }
    // a piece under 30 km2 is a stray cell, unless it holds a small place such as the walled city
    for (const x of parts.slice(1)) if (x.a < 30 && !units.some(u => u.small && turf.booleanPointInPolygon(u.at, turf.polygon(x.p)))) problems.push(`${year} ${o}: a piece of ${x.a.toFixed(1)} km2 at ${turf.centroid(turf.polygon(x.p)).geometry.coordinates.map(v => v.toFixed(2))}`);
    const name = nameAt(o, year), members = idx.map(k => units[k].id).sort();
    // a period that shows the outline of 1451 gets zones of its own, drawn to meet that outline
    const key = `${o}|${name.en}|${members.join(',')}${opts.outline ? (o === 'ott' ? '|outline' : `|${year}`) : ''}`;
    if (!byKey[key]) {
      const id = freeId(`${name.id ?? O[o][1]}-${Math.floor(year)}`);
      Z[id] = { id, owner: o, family: O[o][0], name, towns: members, geometry: geometryOf(parts) };
      byKey[key] = id;
    }
    ids.push(byKey[key]);
  }
  // the outline of 1451 differs from this drawing by a few km along its borders, so the zones around it reach into this
  // period's Ottoman land, and the build trims them along the outline. The Ottoman zone takes this drawing where the
  // two differ by more than a sliver, below
  if (opts.outline) {
    const ott = ids.find(id => Z[id].owner === 'ott'), land = turf.feature(Z[ott].geometry);
    for (const id of ids) if (id !== ott && !Z[id].reach) {
      const reach = I(turf.buffer(turf.feature(Z[id].geometry), 40, { units: 'kilometers' }), land);
      if (reach) Z[id] = { ...Z[id], geometry: U(turf.feature(Z[id].geometry), reach).geometry, reach: true };
    }
    if (!Z[ott].edit) {
      const changed = units.filter(u => story3Units.has(u.id) && (ownerAt(u.steps, OUTLINE_YEAR) === 'ott') !== (ownerAt(u.steps, year) === 'ott'));
      console.log(`  ${ott}: the outline of ${opts.outline}, with these towns' owners changed: ${changed.map(u => u.id).join(', ')}`);
      Z[ott].edit = { outline: opts.outline };
    }
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
    if (Z[id]?.owner !== 'ott' || aliases[id] || Z[id].edit || Z[id].towns.join(',') !== Z[own].towns.join(',')) return id;
    const name = nameAt('ott', q.year), akey = `${s.id}|${name.en}`;
    if (!aliasKeys[akey]) {
      const alias = freeId(`ottomans-${Math.floor(q.year)}`);
      Z[alias] = { ...Z[own], id: alias, name };
      aliases[alias] = { zone: s.id, name };
      aliasKeys[akey] = alias;
    }
    return aliasKeys[akey];
  });
}
const zoneOf = id => sharedOf[id] ? Z[sharedOf[id]] : Z[id];

// the close pages: one zone over the frame and well beyond it, which the build clips to the land
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const pageDir = Object.fromEntries(walk(path.join(story, 'pages')).filter(f => f.endsWith('page.yaml')).map(f => [path.basename(path.dirname(f)).replace(/^\d+-/, ''), path.dirname(f)]));
const BBOX = Object.fromEntries(Object.entries(pageDir).map(([p, d]) => [p, fs.readFileSync(path.join(d, 'page.yaml'), 'utf8').match(/^bbox:\s*\[([^\]]*)\]/m)[1].split(',').map(Number)]));
for (const [p, o] of Object.entries(CLOSE)) {
  // half a degree at least, so that a tall screen or a zoom out still finds land under the zone
  const period = periodZones.find(q => q.pages.includes(p)), year = period.year, [w, s, e, n] = BBOX[p], m = Math.max(e - w, n - s, 0.5);
  const id = freeId(`${nameAt(o, year).id ?? O[o][1]}-${Math.floor(year)}-${p}`);
  Z[id] = { id, owner: o, family: O[o][0], name: nameAt(o, year), towns: [], close: true, geometry: turf.bboxPolygon([w - m, s - m, e + m, n + m]).geometry };
  period.close = { ...period.close, [p]: [id] };
}

// --- the legend: a page lists the zones with at least SHOWN of the land inside its frame ---
const SHOWN = 0.0005;
// a zone under SHOWN stays on a page whose text names it
const NAMED = { byz: /Constantinople/, galata: /Galata|Pera\b/, chios: /Chios/, phocaea: /Phocaea|Foça/, lesbos: /Lesbos|Gattilusi|Mytilene/, gattisl: /Thasos|Imbros|Samothrace|Lemnos/,
  amastris: /Amastris|Amasra/, ainos: /Ainos|Enez/, rhodes: /Rhodes|Knights/, bodrum: /Bodrum|Knights/, negro: /Negroponte|Euboea/, crete: /Crete/,
  messenia: /Modon|Coron|Methoni|Navarino/, nauplia: /Nauplia|Argos/, corfu: /Corfu/, morea: /Morea|Mistra/, byzisl: /Lemnos/, sporades: /Sporades/,
  venalb: /Durrës|Shkodër|Lezhë|Ulcinj|Dagnum|Drisht|Krujë/, ragusa: /Ragusa|Dubrovnik/, acc: /Athens|Thebes|Acciaioli/, zeta: /Zeta|Crnojević/, dalmatia: /Dalmatia|Kotor/,
  lepanto: /Lepanto/, skanderbeg: /Skanderbeg|Krujë/, tinos: /Tinos|Mykonos/, archipelago: /Naxos|Andros|Paros|Cyclades/, gazaria: /Caffa|Soldaia|Tana|Genoese/,
  theodoro: /Theodoro|Mangup/, famagusta: /Famagusta/, papalmon: /Monemvasia/, ven: /Venetian|Venice/ };
// owners a page shows however small they are in its frame, since its text or its notes name them
const KEEP = { accession: ['galata', 'amastris'], 'karaman-1451': ['galata', 'amastris'], rumelihisari: ['galata'], preparations: ['galata'] };
// a family is one state; its parts on a page join into one zone named for the state where its owners differ
const FAMILY_NAMES = {
  venice: ['venetian-colonies', 'Republic of Venice and its colonies', 'Venedik Cumhuriyeti ve kolonileri'],
  genoa: ['genoese-colonies', 'Genoese colonies', 'Ceneviz kolonileri'],
  chios: ['chios', 'Chios and Phocaea under the Genoese Maona', 'Ceneviz Maona şirketinin Sakız ve Foça’sı'],
  gattilusi: ['gattilusi', 'Lands of the Gattilusi', 'Gattilusi ailesinin toprakları'],
  knights: ['knights', 'Knights Hospitaller', 'Hospitalier şövalyeleri'],
  papacy: ['papacy', 'Papal States', 'Papalık Devleti'],
};
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
    for (let x = Math.max(0, colAt(w)); x < Math.min(NX, Math.ceil((e - X0) / RES) + XOFF); x++) {
      const c = y * NX + x;
      if (land[c]) { total += a; by[owner[c]] += a; }
    }
  }
  return { by, total };
};
// the parts of one state on a page, merged into one zone of several parts
const lumpKeys = {};
const join = (family, base, en, tr, members, year) => {
  const k = `${family}|${en}|${members.join(',')}`;
  if (lumpKeys[k]) return lumpKeys[k];
  const towns = [...new Set(members.flatMap(m => zoneOf(m).towns))];
  // zones that reach into a shared outline join as drawn, the others by their towns' cells
  const parts = members.some(m => zoneOf(m).reach) ? polysOf(U(members.map(m => turf.feature(zoneOf(m).geometry))).geometry)
    : tc.merge(topo, towns.flatMap(t => unitGeoms[units.findIndex(u => u.id === t)])).coordinates;
  const id = freeId(`${base}-${year}`);
  Z[id] = { id, owner: `one ${family}`, family, name: { en, tr }, towns: towns.sort(), reach: members.some(m => zoneOf(m).reach),
    geometry: parts.length > 1 ? { type: 'MultiPolygon', coordinates: parts } : { type: 'Polygon', coordinates: parts[0] } };
  return lumpKeys[k] = id;
};
const order = Object.keys(storyYaml.families);
const PAGES = {};
for (const period of periodZones) for (const p of period.pages) {
  const { year, ids } = period;
  if (!BBOX[p]) throw new Error(`no page ${p}`);
  if (period.close?.[p]) { PAGES[p] = period.close[p]; continue; }
  // the frame and a margin round it, which a wide screen shows too
  const [w, s, e, n] = BBOX[p], box = [w - 0.15 * (e - w), s - 0.15 * (n - s), e + 0.15 * (e - w), n + 0.15 * (n - s)], { by, total } = landIn(box), text = textOf(p);
  const share = id => zoneOf(id).towns.reduce((sum, t) => sum + (t in townIndex ? by[townIndex[t]]
    : inBox(box)(...smallLand[t].at) ? smallLand[t].km : 0), 0) / total;
  const whole = id => zoneOf(id).towns.reduce((sum, t) => sum + (t in townIndex ? landOf[townIndex[t]] : smallLand[t].km), 0) * 0.9 <= share(id) * total;
  PAGES[p] = ids.filter(id => {
    const z = zoneOf(id), sh = share(id);
    return sh >= SHOWN || sh > 0 && (NAMED[z.owner]?.test(text) || KEEP[p]?.includes(z.owner)) || sh >= 0.0002 && whole(id);
  });
  // a state on the page shows all its parts in the frame, as one zone
  const families = new Set(PAGES[p].map(id => zoneOf(id).family));
  PAGES[p].push(...ids.filter(id => !PAGES[p].includes(id) && families.has(zoneOf(id).family) && share(id) > 0));
  if (process.argv.includes('--legends')) console.log(`  ${p} leaves out: ${ids.filter(id => !PAGES[p].includes(id) && share(id) > 0).map(id => `${id} ${(100 * share(id)).toFixed(2)}%`).join(', ')}`);
  // a family is one state, so its zones on a page join into one zone of several parts, under the name of its first
  // owner in O, or of the family where its owners are separate lords
  for (const family of new Set(PAGES[p].map(id => zoneOf(id).family))) {
    const shown = PAGES[p].filter(id => zoneOf(id).family === family);
    if (shown.length < 2) continue;
    if (shown.some(id => aliases[id] || Z[id]?.exact || Z[id]?.edit)) { problems.push(`page ${p}: family ${family} has the zones ${shown.join(', ')}`); continue; }
    const members = ids.filter(id => zoneOf(id).family === family);
    const first = Object.keys(O).find(o => members.some(m => zoneOf(m).owner === o)), name = nameAt(first, year);
    const [base, en, tr] = FAMILY_NAMES[family] ?? [name.id ?? O[first][1], name.en, name.tr];
    PAGES[p] = [...PAGES[p].filter(x => !members.includes(x)), join(family, base, en, tr, members.sort(), Math.floor(year))];
  }
  PAGES[p].sort((a, b) => order.indexOf(zoneOf(a).family) - order.indexOf(zoneOf(b).family));
}
for (const p of NONE) { if (!BBOX[p]) throw new Error(`no page ${p}`); PAGES[p] = []; }
for (const p of Object.keys(BBOX)) if (!PAGES[p]) problems.push(`page ${p} has no period`);
if (process.argv.includes('--legends')) for (const [p, ids] of Object.entries(PAGES)) console.log(`  ${p}: ${ids.join(' ')}`);

const perimeter = f => polysOf(f.geometry).flat().reduce((sum, r) => sum + turf.length(turf.lineString(r)), 0);

// --- the outlines: every zone a page shows, simplified together in one topology so an edge two zones share stays one
// line. The lattice's small steps go, then long edges get a point every DENSE degrees so corner rounding stays local
const SIMPLIFY = 0.0003, DENSE = 0.1;
const used = [...new Set(Object.values(PAGES).flat())], drawn = used.filter(id => !aliases[id]);
for (const id of used) if (!storyYaml.families[zoneOf(id).family]) problems.push(`zone ${id}: family ${zoneOf(id).family} is not in story.yaml`);
const joint = ts.topology({ z: fc(drawn.filter(id => !Z[id]?.exact).map(id => ({ type: 'Feature', id, properties: {}, geometry: zoneOf(id).geometry }))) });
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
for (const id of drawn) if (Z[id]?.exact) shapes[id] = Z[id].geometry;
// the Ottoman lands of 1451 to 1453: the outline of 1451, and this drawing where the two differ by more than a sliver
// along a border, around a town whose owner differs from the outline's or on land story 3 left out
const wide = g => polysOf(g?.geometry).map(q => turf.polygon(q)).filter(q => km2(q) > 2 && 2 * km2(q) / perimeter(q) > 1);
for (const id of drawn) if (Z[id]?.edit) {
  const outline = turf.feature(sharedGeometry(Z[id].edit.outline)), mine = turf.feature(shapes[id]);
  shapes[id] = U(D(outline, wide(D(outline, mine))), ...wide(D(mine, outline))).geometry;
  shapes[id] = multi(polysOf(shapes[id]).filter(q => km2(turf.polygon(q)) > 0.5).map(q => [q[0], ...q.slice(1).filter(r => km2(turf.polygon([r])) > 0.5)])).geometry;
}
// the small places keep their drawn outline, which the simplifying rounds away at their size
for (const [id, g] of Object.entries(shapes)) {
  const z = zoneOf(id);
  if (!z || z.close) continue;
  let f = turf.feature(g);
  for (const u of units.filter(v => v.small)) {
    if (z.towns.includes(u.id)) f = U(f, u.small);
    else if (turf.booleanIntersects(f, u.small)) f = D(f, u.small) ?? f;
  }
  shapes[id] = f.geometry;
}
for (const [id, g] of Object.entries(shapes)) if (!polysOf(g).length || polysOf(g).some(q => q[0].length < 4)) problems.push(`zone ${id}: ${g.type} after simplifying`);

// --- zones another story drew first: a zone with the outline of a shared zone, within a few hundred metres, names it in
// shared/zones.yaml. The slivers where this drawing reaches past the shared outline go to the neighbour that borders
// them on each of its pages, so no gap opens along it. A zone of an earlier Ottoman story is shared first with harita
// zones --share
const sharedRoot = path.join(content, 'shared', 'zones');
const earlier = ['ottoman-osman-orhan-murad-i', 'ottoman-bayezid-i-mehmed-i', 'ottoman-murad-ii'];
const sharedIds = SHARED.map(s => s.id);
const candidates = [
  ...fs.readdirSync(sharedRoot).filter(d => !OUTLINES.includes(d) && !sharedIds.includes(d) && fs.existsSync(path.join(sharedRoot, d, 'zone.geojson')))
    .map(d => ({ id: d, shared: true, file: path.join(sharedRoot, d, 'zone.geojson') })),
  ...earlier.flatMap(st => { const d = path.join(content, 'ottoman', st, 'shared', 'zones');
    return fs.readdirSync(d).filter(f => f.endsWith('.geojson')).map(f => ({ id: f.replace('.geojson', ''), story: st, shared: false, file: path.join(d, f) })); }),
].map(c => { const f = JSON.parse(fs.readFileSync(c.file, 'utf8')); return { ...c, family: f.properties.family, feature: turf.feature(f.geometry), bbox: turf.bbox(f) }; });
const borrowed = {};
for (const id of drawn) {
  const z = Z[id];
  if (!z || z.exact || z.reach || z.close || sharedIds.includes(id) || z.owner === 'ott') continue;
  // the two outlines compared as drawn and on the land, since their parts at sea differ with the sites offshore
  const onLand = f => I(f, landNear(f)), raw = turf.feature(shapes[id]), box = turf.bbox(raw), mine = onLand(raw);
  const alike = (a, b, other) => {
    if (!a || !b) return false;
    const both = km2(I(a, b));
    const iou = both / (km2(a) + km2(b) - both);
    if (iou < 0.99) { if (iou > 0.97 && process.argv.includes('--alike')) console.log(`  ${id} ~ ${other}: ${iou.toFixed(4)}`); return false; }
    // the widest piece between the two outlines, as twice its area over its perimeter
    const wide = Math.max(0, ...[D(a, b), D(b, a)].flatMap(g => g ? polysOf(g.geometry) : []).map(q => turf.polygon(q))
      .filter(q => km2(q) > 0.5).map(q => 2 * km2(q) / perimeter(q)));
    if (wide > 0.8 && process.argv.includes('--alike')) console.log(`  ${id} ~ ${other}: ${iou.toFixed(4)}, ${wide.toFixed(2)} km wide`);
    return wide <= 0.8;
  };
  for (const c of candidates) {
    if (c.family !== z.family || c.bbox.some((v, i) => Math.abs(v - box[i]) > 1)) continue;
    // a shared zone drawn without this story's land is alike only on the land
    if (!alike(mine, c.land ??= onLand(c.feature), c.id)) continue;
    if (!c.shared) { problems.push(`zone ${id} has the outline of ${c.story}/${c.id}: ./node_modules/.bin/harita zones --share ${c.story}/${c.id}`); continue; }
    borrowed[id] = c;
    break;
  }
}
{
  const fill = {}, near = (f, box) => multi(polysOf(turf.bboxClip(f, box).geometry));
  for (const [x, c] of Object.entries(borrowed)) {
    const pieces = polysOf(D(turf.feature(shapes[x]), c.feature)?.geometry).map(q => turf.polygon(q)).filter(q => km2(q) > 0.01);
    for (const piece of pieces) {
      const halo = turf.buffer(piece, 0.3, { units: 'kilometers' }), hb = turf.bbox(halo), touch = {};
      const touching = n => touch[n] ??= km2(I(halo, near(turf.feature(shapes[n]), hb)));
      for (const ids of Object.values(PAGES)) {
        if (!ids.includes(x)) continue;
        const best = ids.filter(n => n !== x && shapes[n] && !borrowed[n]).map(n => [n, touching(n)]).sort((u, v) => v[1] - u[1])[0];
        if (best?.[1] > 0) (fill[best[0]] ??= new Set()).add(piece);
      }
    }
  }
  for (const [n, set] of Object.entries(fill)) shapes[n] = U(turf.feature(shapes[n]), ...set).geometry;
  console.log(`  ${Object.keys(borrowed).length} zones take a shared outline: ${Object.entries(borrowed).map(([id, c]) => `${id} ${c.id}`).join(', ')}`);
}

if (problems.length) { console.log(problems.map(p => '  ' + p).join('\n')); if (!process.argv.includes('--anyway')) process.exit(1); }

// --- write: the story's zones, the shared zone with its Turkish name, the aliases, the page map, the Turkish names. With
// --no-shared the shared zone goes to .cache/ only, to compare it first
const round = c => typeof c[0] === 'number' ? [+c[0].toFixed(5), +c[1].toFixed(5)] : c.map(round);
const feature = (id, props) => ({ type: 'Feature', properties: props, geometry: { type: shapes[id].type, coordinates: round(shapes[id].coordinates) } });
// a drawing that several zones of this story show under other names is written once, and the others name it in
// shared/zones.yaml
const same = {};
{
  const first = {};
  for (const id of drawn) {
    if (sharedIds.includes(id) || borrowed[id]) continue;
    const key = `${Z[id].family}|${JSON.stringify(round(shapes[id].coordinates))}`;
    if (first[key]) same[id] = first[key]; else first[key] = id;
  }
}
const dir = path.join(story, 'shared', 'zones');
fs.mkdirSync(dir, { recursive: true });
for (const f of fs.readdirSync(dir)) if (f.endsWith('.geojson')) fs.rmSync(path.join(dir, f));
for (const id of drawn) if (!sharedIds.includes(id) && !borrowed[id] && !same[id]) fs.writeFileSync(path.join(dir, id + '.geojson'), JSON.stringify(feature(id, { family: Z[id].family, name: Z[id].name.en })) + '\n');
for (const s of SHARED) {
  // without the countries the story leaves out, which its cells at sea run over
  shapes[s.id] = D(turf.feature(shapes[s.id]), OFFLAND).geometry;
  const json = JSON.stringify(feature(s.id, { family: 'ottomans', name: s.en })) + '\n';
  const cache = path.join(repo, '.cache', 'ottoman-mehmed-ii-shared');
  fs.mkdirSync(cache, { recursive: true });
  fs.writeFileSync(path.join(cache, s.id + '.geojson'), json);
  if (process.argv.includes('--no-shared')) continue;
  const sharedDir = path.join(content, 'shared', 'zones', s.id);
  fs.mkdirSync(path.join(sharedDir, 'i18n'), { recursive: true });
  fs.writeFileSync(path.join(sharedDir, 'zone.geojson'), json);
  fs.writeFileSync(path.join(sharedDir, 'i18n', 'tr.yaml'), `# tr strings for the zone "${s.id}".\n# Keys are stable ids, the comment above each one is the source text. Empty values fall back to the\n`
    + `# default language, and kitap build --strict reports them. Regenerate with: kitap i18n tr\n\n# ${s.en}\nzone.name: ${JSON.stringify(s.tr)}\n`);
}
const usedAliases = Object.entries(aliases).filter(([id]) => used.includes(id));
const aliasFile = path.join(story, 'shared', 'zones.yaml');
const uses = [...usedAliases.map(([id, a]) => `${id}: { zone: ${a.zone}, name: ${JSON.stringify(a.name.en)} }`),
  ...Object.entries(borrowed).map(([id, c]) => `${id}: { zone: ${c.id}, name: ${JSON.stringify(Z[id].name.en)} }`),
  ...Object.entries(same).map(([id, o]) => `${id}: { zone: ${o}, name: ${JSON.stringify(Z[id].name.en)} }`)];
if (uses.length) fs.writeFileSync(aliasFile, '# Zones of these pages that have the outline of a shared zone or of another zone of this story. Written by .plans/zones.mjs.\n' + uses.join('\n') + '\n');
else fs.rmSync(aliasFile, { force: true });
fs.writeFileSync(path.join(story, '.plans', 'zones.yaml'), '# Zones per page, written by .plans/zones.mjs. The plans of the siege of Constantinople and of Istanbul and the phase pages of the battle plans show none.\n'
  + Object.entries(PAGES).map(([p, ids]) => `${p}: [${ids.join(', ')}]`).join('\n') + '\n');
// a page without a zones line gets an empty one after its bbox, which scripts/merge-parts.mjs then fills
for (const p of Object.keys(PAGES)) {
  const file = path.join(pageDir[p], 'page.yaml'), text = fs.readFileSync(file, 'utf8');
  if (!/^zones:.*$/m.test(text)) fs.writeFileSync(file, text.replace(/^(bbox:.*)$/m, '$1\nzones: []'));
}
fs.mkdirSync(path.join(story, '.i18n-parts'), { recursive: true });
fs.writeFileSync(path.join(story, '.i18n-parts', 'zones.tr.yaml'), used.filter(id => !sharedIds.includes(id))
  .map(id => `zones.${id}.name: ${JSON.stringify(zoneOf(id).name.tr)}`).join('\n') + '\n');
console.log(`${used.length} zones on ${Object.values(PAGES).filter(l => l.length).length} pages, the longest legend ${Math.max(...Object.values(PAGES).map(l => l.length))}`);
