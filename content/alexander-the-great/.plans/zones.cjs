// Generates every territory zone of alexander-the-great into shared/zones/ (started for section 010, extended per section). Run from the repo root:
//   node content/alexander-the-great/.plans/zones.cjs [--check]
const fs = require('fs');
const path = require('path');
const turf = require(path.resolve('node_modules/@turf/turf'));
const topo = require(path.resolve('node_modules/topojson-client'));
const atlas = require(path.resolve('node_modules/world-atlas/land-10m.json'));
const land = turf.flatten(topo.feature(atlas, atlas.objects.land)).features;
const OUT = 'content/alexander-the-great/shared/zones';

const poly = (pts) => { const r = pts.slice(); r.push(r[0]); return turf.polygon([r]); };
const fc = (...fs) => turf.featureCollection(fs);
const union = (...fs) => turf.union(fc(...fs));
const diff = (a, ...bs) => bs.reduce((acc, b) => turf.difference(fc(acc, b)) || acc, a);
// Takes away the land piece (an island) that holds each point, widened by 1 km.
function noIslands(f, points) {
  for (const p of points) {
    const isl = land.find(l => turf.booleanPointInPolygon(turf.point(p), l)) || land
      .filter(l => { const b = turf.bbox(l); return b[0] <= p[0] && p[0] <= b[2] && b[1] <= p[1] && p[1] <= b[3] && turf.area(l) < 2e8; })
      .sort((a, b) => turf.area(a) - turf.area(b))[0];
    if (!isl) throw new Error('no land at ' + p);
    const b = turf.buffer(turf.simplify(isl, { tolerance: 0.003, highQuality: true }), 1.5, { units: 'kilometers' });
    f = diff(f, b);
  }
  return f;
}
const ISL = {
  thasos: [24.7, 40.68], samothrace: [25.55, 40.47], imbros: [25.85, 40.18], tenedos: [26.03, 39.83],
  corfu: [19.85, 39.6], paxos: [20.18, 39.2], euboea: [23.6, 38.6], skiathos: [23.47, 39.16],
  lefkada: [20.65, 38.72], kefalonia: [20.55, 38.25], ithaca: [20.7, 38.37], zakynthos: [20.8, 37.78],
  aegina: [23.5, 37.73], hydra: [23.47, 37.34], spetses: [23.15, 37.26], salamis: [23.48, 37.93],
  lesbos: [26.4, 39.2], chios: [26.0, 38.4], samos: [26.8, 37.75], ikaria: [26.15, 37.6], psara: [25.57, 38.58],
  oinousses: [26.23, 38.51], fourni: [26.47, 37.58], kos: [27.1, 36.82], kalymnos: [26.97, 36.98],
  leros: [26.85, 37.15], pserimos: [27.13, 36.93], patmos: [26.55, 37.32], rhodes: [28.0, 36.2], symi: [27.84, 36.6],
  nisyros: [27.16, 36.59], tilos: [27.37, 36.43], kastellorizo: [29.59, 36.15], agathonisi: [26.97, 37.46],
  pharmakonisi: [27.09, 37.29], arki: [26.73, 37.38], lipsi: [26.77, 37.3],
  kalamos: [20.91, 38.62], kastos: [20.91, 38.57], meganisi: [20.78, 38.64],
};
const isl = (...names) => names.map(n => ISL[n]);

// ---- Macedon ----
const CHALCIDICE = poly([[22.75, 40.45], [22.95, 40.55], [23.2, 40.62], [23.5, 40.63], [23.68, 40.65], [23.78, 40.68],
  [24.5, 40.35], [24.5, 39.85], [23.3, 39.85], [22.75, 40.2]]);
const MAC_CORE = poly([[20.73, 41.22], [20.73, 40.92], [21.02, 40.8], [21.05, 40.55], [20.97, 40.45], [21.08, 40.2],
  [21.27, 40.0], [21.6, 39.97], [22.0, 39.99], [22.3, 40.05], [22.6, 39.9], [22.85, 39.9], [22.95, 40.25],
  [23.3, 40.5], [23.75, 40.6], [23.83, 40.76], [23.80, 40.84], [23.72, 40.92], [23.55, 41.02], [23.35, 41.13],
  [23.25, 41.22], [23.2, 41.3], [22.75, 41.25], [22.25, 41.42], [21.8, 41.45], [21.3, 41.45], [20.95, 41.35]]);
const AMPHIPOLIS = poly([[23.82, 40.70], [23.83, 40.76], [23.80, 40.84], [23.72, 40.92], [23.62, 40.99], [23.78, 41.02],
  [23.93, 40.95], [23.96, 40.85], [23.93, 40.73]]);
const PANGAEUM = poly([[23.85, 40.66], [23.9, 41.0], [24.1, 41.15], [24.35, 41.15], [24.5, 41.08], [24.6, 40.95],
  [24.62, 40.86], [24.3, 40.78], [24.0, 40.66]]);
// The Thracian coast to the Gallipoli neck: the Chersonese stays out, and so do the islands.
const THRACE_SOUTH = [[26.9, 40.48], [26.80, 40.47], [26.70, 40.58], [26.6, 40.58], [26.3, 40.55], [25.8, 40.68],
  [25.3, 40.78], [24.9, 40.8], [24.62, 40.82]];
const THRACE_ADD = poly([[24.6, 40.95], [24.3, 41.0], [23.9, 40.9], [23.6, 40.95], [23.3, 41.1], [23.1, 41.25], [22.95, 41.42],
  [22.95, 41.9], [23.05, 42.25], [23.5, 42.45], [24.3, 42.6], [25.0, 42.65], [25.8, 42.65], [26.5, 42.68],
  [27.0, 42.6], [27.2, 42.2], [27.3, 41.7], [27.55, 41.25], [27.78, 40.99], [27.7, 40.8], ...THRACE_SOUTH]);

// Anthemus, Macedonian until Philip gave it to the Chalcidians in 357/356 (Ellis ch. 14 §V).
const ANTHEMUS = poly([[22.75, 40.45], [22.95, 40.55], [23.2, 40.62], [23.27, 40.5], [23.15, 40.4], [22.9, 40.36]]);
// Coastal towns outside the kingdom: Pydna to 357, Methone to 354; Abdera and Maronea, allies of Athens in 340.
const town = (c, km) => turf.circle(c, km, { units: 'kilometers', steps: 24 });
const PYDNA = town([22.596, 40.371], 5), METHONE = town([22.581, 40.462], 5);
const ABDERA = town([24.976, 40.953], 6), MARONEA = town([25.52, 40.87], 6);
const MAC_BASE = diff(MAC_CORE, CHALCIDICE);
const macedon359 = diff(MAC_CORE, diff(CHALCIDICE, ANTHEMUS), PYDNA, METHONE);
const macedon356 = diff(union(MAC_BASE, AMPHIPOLIS), METHONE);
const macedon348 = noIslands(union(MAC_BASE, AMPHIPOLIS, CHALCIDICE, PANGAEUM), isl('thasos'));
const macedon340 = diff(noIslands(union(macedon348, THRACE_ADD), isl('thasos', 'samothrace')), ABDERA, MARONEA);
const olynthus356 = CHALCIDICE;

// ---- Balkan neighbours ----
const illyrians359 = poly([[19.2, 40.35], [19.2, 42.6], [21.0, 42.6], [21.1, 42.0], [20.95, 41.5], [20.8, 41.25],
  [20.78, 40.92], [21.0, 40.82], [21.06, 40.7], [21.06, 40.55], [20.95, 40.45], [20.4, 40.4], [19.9, 40.38]]);
const thracians359raw = noIslands(poly([[22.9, 43.3], [22.9, 41.7], [23.15, 41.3], [23.6, 40.95], [23.86, 40.72],
  [24.3, 40.75], ...THRACE_SOUTH.slice().reverse(), [27.5, 40.8], [28.7, 40.85], [28.7, 41.6],
  [28.5, 42.5], [28.5, 43.3]]), isl('thasos', 'samothrace'));
// Amphipolis, Pangaeum and Crenides left blank (the map-auditor's ruling).
const thracians359 = diff(thracians359raw, AMPHIPOLIS, PANGAEUM);
// thracians-359's ring above runs THRACE_SOUTH west to east after the Strymon mouth.
const thracians340 = poly([[23.0, 42.15], [23.5, 42.35], [24.3, 42.5], [25.0, 42.55], [26.5, 42.55], [27.0, 42.5],
  [27.6, 42.45], [28.1, 42.75], [27.9, 42.95], [27.0, 43.05], [26.0, 43.15], [24.5, 43.2], [23.0, 43.1]]);
const thessaly352 = noIslands(poly([[21.27, 40.0], [21.6, 39.97], [22.0, 39.99], [22.3, 40.05], [22.6, 39.9],
  [22.9, 39.9], [23.45, 39.6], [23.35, 39.1], [22.95, 38.98], [22.75, 38.86], [22.45, 38.88], [22.0, 38.92],
  [21.7, 39.0], [21.45, 39.1], [21.35, 39.5], [21.2, 39.9]]), isl('euboea', 'skiathos'));
const epirus350 = noIslands(poly([[19.2, 40.48], [19.95, 40.43], [20.45, 40.45], [20.95, 40.5], [21.35, 40.15],
  [21.5, 39.6], [21.45, 39.35], [21.2, 39.25], [21.0, 39.25], [20.85, 39.33], [20.6, 39.36], [20.4, 39.3], [19.9, 39.3],
  [19.6, 39.8], [19.2, 40.0]]), isl('corfu', 'paxos'));

// ---- Greece south of Thessaly ----
const ATTICA = poly([[23.44, 38.01], [23.43, 38.1], [23.25, 38.17], [23.4, 38.22], [23.6, 38.22], [23.75, 38.29],
  [23.9, 38.33], [24.2, 38.2], [24.12, 37.62], [23.9, 37.6], [23.62, 37.83], [23.45, 37.86], [23.38, 37.88],
  [23.39, 37.965]]);
const athens338 = noIslands(ATTICA, isl('euboea', 'aegina'));
const BOEOTIA = poly([[22.85, 38.15], [22.8, 38.35], [22.8, 38.5], [22.85, 38.6], [23.1, 38.62], [23.35, 38.62],
  [23.55, 38.5], [23.8, 38.4], [23.95, 38.3], [23.6, 38.18], [23.3, 38.1], [23.1, 38.1]]);
const thebes338 = noIslands(diff(BOEOTIA, ATTICA), isl('euboea'));
const GREECE_S = noIslands(poly([[20.55, 38.97], [20.74, 38.955], [20.9, 38.98], [21.15, 39.0], [21.4, 39.15],
  [21.8, 39.1], [22.5, 39.0], [22.95, 38.95], [23.4, 38.75], [24.4, 38.4], [24.2, 37.55], [23.4, 37.25],
  [23.25, 36.9], [23.35, 36.4], [23.15, 36.05], [22.85, 36.05], [22.4, 36.3], [21.6, 36.6], [21.4, 37.2],
  [21.0, 37.85], [20.95, 38.2], [20.5, 38.4]]),
  isl('euboea', 'lefkada', 'kefalonia', 'ithaca', 'zakynthos', 'aegina', 'hydra', 'spetses', 'kalamos', 'kastos', 'meganisi'));
const greeks338 = diff(GREECE_S, ATTICA, BOEOTIA);
// Laconia after Philip gave its borderlands to Messene, Megalopolis, Tegea and Argos.
const sparta337 = poly([[22.3, 37.18], [22.5, 37.2], [22.7, 37.12], [22.95, 37.05], [23.25, 36.9], [23.35, 36.4],
  [23.15, 36.05], [22.85, 36.05], [22.5, 36.3], [22.3, 36.4], [22.2, 36.85], [22.3, 36.95]]);
const league337 = diff(GREECE_S, sparta337);

// ---- Persian Empire, drawn once ----
// The hills of the mountain Uxians, between the Susian lowlands and Persis: never subject to the Persian king
// (Arrian 3.17.1), so left out of every Persian stage, blank until macedon-330a takes them with Persis. Its west
// side lies on MESO's edge (050).
const UXIAN_HILLS = poly([[49.3, 32.6], [50.0, 32.0], [50.6, 31.4], [50.4, 30.9], [49.75, 31.0], [49.6, 31.5]]);
const PERSIA_CLIP = ['Turkey', 'Cyprus', 'N. Cyprus', 'Syria', 'Lebanon', 'Israel', 'Palestine', 'Jordan', 'Egypt',
  'Iraq', 'Kuwait', 'Iran', 'Armenia', 'Azerbaijan', 'Georgia', 'Turkmenistan', 'Uzbekistan', 'Tajikistan',
  'Kyrgyzstan', 'Kazakhstan', 'Afghanistan', 'Pakistan'];
const persia336raw = noIslands(poly([
  // the Hellespont, the Propontis and the Bosporus, down their middle
  [26.05, 39.95], [26.12, 39.98], [26.2, 40.03], [26.33, 40.08], [26.385, 40.13], [26.39, 40.155], [26.38, 40.19],
  [26.42, 40.215], [26.5, 40.26], [26.57, 40.3], [26.66, 40.385], [26.72, 40.43], [26.85, 40.45], [27.0, 40.47],
  [27.3, 40.75], [28.0, 40.82], [28.6, 40.88], [28.95, 40.96], [28.995, 41.0], [29.0, 41.03], [29.033, 41.05],
  [29.058, 41.08], [29.073, 41.12], [29.075, 41.14], [29.058, 41.153], [29.07, 41.17], [29.09, 41.19],
  [29.115, 41.21], [29.14, 41.235], [29.25, 41.4], [29.6, 42.4],
  // the Black Sea to Colchis, which stays out; Armenia to the Kura
  [41.0, 42.4], [41.55, 41.55], [42.8, 41.5], [43.5, 41.15], [45.0, 41.1], [46.5, 40.75], [48.5, 40.0],
  [49.6, 39.6],
  // across the Caspian to Hyrcania; Parthia, Margiana and Sogdiana to the Jaxartes
  [52.5, 37.9], [53.85, 37.55], [55.5, 38.1], [57.0, 38.4], [58.4, 38.05], [60.0, 37.5], [60.8, 38.0],
  [61.5, 38.4], [62.5, 38.4], [63.5, 39.05], [64.0, 39.9], [65.0, 40.3], [66.0, 40.5], [67.0, 40.5],
  [68.0, 40.7], [68.6, 40.85], [68.9, 40.6], [69.3, 40.22], [69.65, 40.3], [70.1, 40.35],
  // Bactria to the Pamirs; the Hindu Kush; Arachosia and Gedrosia, the Cophen valley and the Indus left out
  [70.3, 39.9], [71.0, 39.3], [71.5, 38.5], [71.6, 37.0], [71.2, 36.0], [70.0, 35.6], [69.6, 34.8], [69.4, 34.2],
  [69.0, 33.4], [68.6, 32.3], [68.0, 31.2], [67.4, 30.3], [67.0, 29.0], [66.8, 27.5], [66.6, 26.2], [66.4, 25.3],
  [66.3, 24.8],
  // the Ocean, the Gulf, the Arabian desert to Egypt and the First Cataract
  [57.0, 24.0], [48.0, 28.0], [39.0, 29.2], [35.0, 29.3], [36.0, 24.0], [27.3, 24.0], [27.3, 31.8],
  // the Mediterranean and the Aegean; the clip leaves out the Greek islands
  [28.0, 35.0], [25.8, 37.5], [25.8, 39.5]]), isl('imbros', 'tenedos'));
const persia336 = diff(persia336raw, UXIAN_HILLS);

// ---- 020 ----
// The Triballi between the Haemus and the Danube, round the lower Oescus; the clip gives the Danube.
// The build subtracts before it clips, so the zone is cut to the Danube here, from the Natural Earth countries.
const countries = require(path.resolve('node_modules/world-atlas/countries-10m.json'));
const country = name => turf.feature(topo.feature(countries, countries.objects.countries).features
  .find(f => f.properties.name === name).geometry);
const TRIBALLI_LAND = turf.simplify(union(country('Bulgaria'), country('Serbia')), { tolerance: 0.002, highQuality: true });
const triballi335 = diff(turf.intersect(fc(poly([[22.75, 43.05], [22.75, 44.3], [25.3, 44.3], [25.3, 43.1]]),
  TRIBALLI_LAND)), thracians340);
// The Getae on the north bank, west of where the river turns north; the clip gives the Danube.
const getae335 = poly([[22.9, 43.5], [27.3, 43.5], [27.3, 44.15], [26.0, 44.6], [24.0, 44.6], [22.9, 44.4]]);
// Cleitus's Dardani round Kosovo and Glaucias's Taulantians behind Epidamnus.
const illyrians335 = poly([[19.2, 40.35], [19.2, 42.7], [19.9, 43.0], [20.8, 43.2], [21.8, 43.0], [21.85, 42.3],
  [21.35, 42.05], [21.0, 41.6], [20.8, 41.25], [20.78, 40.92], [21.0, 40.82], [21.06, 40.7], [21.06, 40.55], [20.95, 40.45], [20.4, 40.4],
  [19.9, 40.38]]);
// Thebes and its own land; Orchomenus, Plataea and Thespiae outside.
const thebes335 = poly([[23.22, 38.3], [23.24, 38.42], [23.35, 38.47], [23.5, 38.42], [23.56, 38.33], [23.45, 38.26],
  [23.3, 38.25]]);

// ---- 030 ----
const ASIA_ISL = isl('lesbos', 'chios', 'samos', 'ikaria', 'psara', 'tenedos', 'imbros', 'patmos', 'leros',
  'kalymnos', 'kos', 'nisyros', 'symi', 'tilos', 'rhodes');
// Hellespontine Phrygia, Lydia and Ionia to the Maeander, Miletus included; the Hellespont down its middle.
const MAEANDER = [[29.1, 37.95], [28.6, 37.92], [28.15, 37.88], [27.6, 37.82], [27.4, 37.6], [27.32, 37.45]];
const ASIA_334A = poly([[26.0, 39.5], [26.05, 39.95], [26.12, 39.98], [26.2, 40.03], [26.33, 40.08], [26.385, 40.13],
  [26.39, 40.155], [26.38, 40.19], [26.42, 40.215], [26.5, 40.26], [26.57, 40.3], [26.66, 40.385], [26.72, 40.43],
  [26.85, 40.45], [27.0, 40.47], [27.3, 40.72], [28.0, 40.75], [28.75, 40.55], [28.9, 40.42], [29.2, 40.35], [29.6, 40.2],
  [29.7, 40.0], [29.3, 39.5], [29.2, 38.6], ...MAEANDER, [27.0, 37.4], [26.0, 38.0], [25.8, 39.0]]);
// Caria under Ada, south of the Maeander to the Lycian border.
const CARIA = poly([...MAEANDER.slice().reverse(), [29.1, 37.4], [29.0, 37.15], [28.85, 36.55], [27.3, 36.55],
  [26.9, 37.05], [27.0, 37.4]]);
// Lycia with Milyas, and Pamphylia to Side.
const LYCIA_PAMPH = poly([[28.85, 36.55], [29.0, 37.15], [29.4, 37.15], [29.85, 37.3], [30.2, 37.0], [30.4, 36.93],
  [30.6, 37.05], [31.0, 37.1], [31.6, 37.08], [31.95, 37.0], [31.95, 36.5], [31.9, 36.2], [30.5, 35.9], [29.3, 35.95]]);
// Greater Phrygia from Lydia to Gordium.
const PHRYGIA = poly([[29.0, 37.3], [28.95, 37.95], [29.05, 38.6], [29.2, 39.5], [29.7, 40.0], [30.4, 40.15], [31.5, 40.1],
  [32.4, 39.9], [32.45, 38.9], [32.0, 38.0], [31.2, 37.95], [30.45, 37.95], [29.95, 37.75], [29.85, 37.3],
  [29.4, 37.15]]);
// Pisidia, crossed but never conquered (Bosworth ch. 2.V).
const PISIDIA = poly([[29.85, 37.3], [29.95, 37.75], [30.45, 37.95], [31.2, 37.95], [31.9, 37.7], [32.0, 37.3],
  [31.6, 37.08], [31.0, 37.1], [30.6, 37.05], [30.4, 36.93], [30.2, 37.0]]);
const macedon334a = noIslands(union(macedon340, ASIA_334A), ASIA_ISL);
// Myndus, Caunus and the Triopian peninsula held out for Persia until 333 (Arrian 1.20, 2.5.7; Bosworth ch. 2.IV);
// Sillyum was never taken (Arrian 1.26). The triangle closes a gap between Caria, Lycia and Phrygia.
const MYNDUS = town([27.24, 37.08], 5), CAUNUS = town([28.62, 36.83], 5), SILLYUM = town([30.99, 36.99], 4);
const TRIOPIAN = poly([[27.3, 36.5], [27.3, 36.86], [28.0, 36.86], [28.05, 36.7], [27.9, 36.5]]);
const GAP_TRIANGLE = poly([[28.95, 37.1], [29.07, 37.32], [29.45, 37.15]]);
const macedon334full = noIslands(union(macedon334a, CARIA), ASIA_ISL);
const macedon334 = diff(macedon334full, MYNDUS, CAUNUS, TRIOPIAN);
const macedon333full = diff(noIslands(union(macedon334full, LYCIA_PAMPH, PHRYGIA, GAP_TRIANGLE), ASIA_ISL), PISIDIA, SILLYUM);
const macedon333 = diff(macedon333full, MYNDUS, CAUNUS, TRIOPIAN);

// ---- 040 ----
// Cilicia to the Amanus, and Cappadocia this side of the Halys and much beyond it (Arrian 2.4).
const CILICIA = poly([[31.95, 37.0], [32.6, 36.95], [33.5, 37.0], [34.2, 37.4], [35.0, 37.5], [35.9, 37.6],
  [36.4, 37.3], [36.55, 37.0], [36.35, 36.6], [36.2, 36.3], [35.5, 36.0], [32.0, 36.0]]);
const CAPPADOCIA = poly([[32.3, 39.9], [32.6, 40.3], [33.9, 40.4], [35.5, 40.2], [36.5, 39.6], [37.2, 38.8],
  [36.8, 38.0], [35.9, 37.6], [35.0, 37.5], [34.2, 37.4], [33.3, 37.5], [32.3, 37.9], [32.0, 38.0], [32.45, 38.9]]);
// Northern and central Syria with Damascus, the Phoenician coast from Aradus to Sidon; Tyre and Cyprus out.
const SYRIA_N = poly([[36.2, 36.3], [36.35, 36.6], [36.55, 37.0], [36.5, 37.1], [37.5, 37.0], [38.0, 36.9], [38.2, 36.0], [37.5, 35.0], [37.0, 34.0],
  [36.7, 33.2], [36.0, 33.3], [35.6, 33.4], [35.3, 33.42], [34.9, 33.45], [35.3, 35.0], [35.5, 35.95], [35.5, 36.0]]);
// The coast from Tyre to Gaza, west of the Jordan; and Cyprus.
const PALESTINE = poly([[34.9, 33.45], [35.3, 33.42], [35.6, 33.4], [35.65, 32.7], [35.55, 32.3], [35.5, 31.75],
  [35.4, 31.3], [34.9, 31.2], [34.25, 31.3], [34.1, 31.4], [34.5, 32.3], [34.8, 33.2]]);
const CYPRUS = poly([[32.1, 34.4], [34.8, 34.4], [34.8, 35.8], [32.1, 35.5]]);
// Egypt to Paraetonium and Siwa, and Sinai, to the First Cataract.
const EGYPT = poly([[34.1, 31.6], [34.25, 31.3], [34.95, 29.5], [36.5, 24.0], [27.3, 24.0], [27.3, 28.8], [25.2, 28.8],
  [25.2, 31.8], [29.0, 31.9], [32.0, 31.8]]);
// Lycaonia stays out: no source says it was taken (cloud ruling, as with Pisidia).
const LYCAONIA = poly([[32.0, 38.0], [32.45, 38.9], [33.3, 38.6], [33.6, 37.6], [33.3, 37.3], [32.3, 37.25], [32.0, 37.3]]);
const macedon333b = diff(union(macedon333full, CILICIA, CAPPADOCIA), LYCAONIA, SILLYUM);
const macedon333c = union(macedon333b, SYRIA_N);
// During the siege: the coast from Sidon to Old Tyre and Cyprus, the island city left out (Arrian 2.18, 2.20.3).
const TYRE_ISLAND = town([35.193, 33.271], 2);
const macedon332a = diff(union(macedon333c, poly([[35.0, 33.45], [35.3, 33.42], [35.6, 33.4], [35.6, 33.2],
  [35.15, 33.2]]), CYPRUS), TYRE_ISLAND);
const macedon332 = union(macedon333c, PALESTINE, CYPRUS);
const macedon331 = union(macedon332, EGYPT);

// ---- 050 ----
// Mesopotamia and Assyria to the Zagros foothills, Babylonia, and Susiana to the Uxian lowlands; the Syrian desert out.
const MESO = poly([[38.0, 36.9], [38.8, 37.2], [40.5, 37.3], [42.3, 37.3], [43.5, 37.0], [44.3, 36.6], [44.8, 35.8],
  [45.5, 35.0], [46.0, 34.0], [46.5, 33.2], [47.3, 32.8], [48.5, 33.0], [49.3, 32.6], [49.6, 31.5], [49.9, 30.5],
  [49.9, 30.0], [49.0, 29.6], [48.0, 29.4], [47.0, 29.0], [46.5, 29.2], [44.5, 30.5], [42.5, 31.5], [40.5, 33.5],
  [39.0, 34.5], [38.2, 36.0]]);
// Persis with the Uxian hills.
const PERSIS = poly([[49.3, 32.6], [50.0, 32.0], [51.0, 31.7], [52.0, 31.3], [53.5, 31.0], [54.6, 29.8], [54.6, 28.0],
  [53.5, 26.8], [51.5, 27.5], [50.3, 29.0], [49.9, 30.0], [49.9, 30.5], [49.6, 31.5]]);
// Media and Paraetacene, meeting Persis on its northern vertices (Arrian 3.19.2: the road from Persis through
// Paraetacene), and the road east by Rhagae and the Caspian Gates to where Darius died, short of Hecatompylus,
// which stays Persian (Bosworth: "a little short" of it).
const MEDIA = poly([[44.8, 35.8], [45.8, 35.6], [46.5, 36.3], [48.0, 36.8], [49.5, 36.6], [50.5, 36.3], [51.5, 35.95],
  [52.5, 35.85], [53.5, 36.15], [53.85, 36.15], [53.9, 35.6], [53.0, 35.0], [52.0, 34.3], [52.6, 33.0], [53.5, 31.0],
  [52.0, 31.3], [51.0, 31.7], [50.0, 32.0], [49.3, 32.6], [48.5, 33.0], [47.3, 32.8], [46.5, 33.2], [46.0, 34.0], [45.5, 35.0]]);
const macedon331b = union(macedon331, MESO);
const macedon330a = union(macedon331b, PERSIS);
const macedon330 = union(macedon330a, MEDIA);
// Sparta with Elis, the Achaeans but Pellene, and the Arcadians but Megalopolis.
const MEGALOPOLIS = town([22.13, 37.4], 9);
const sparta331 = diff(poly([[21.1, 37.6], [21.2, 38.1], [21.6, 38.3], [22.1, 38.25], [22.45, 38.12], [22.5, 38.0],
  [22.6, 37.75], [22.6, 37.4], [22.7, 37.12], [22.95, 37.05], [23.25, 36.9], [23.35, 36.4], [23.15, 36.05],
  [22.85, 36.05], [22.5, 36.3], [22.3, 36.4], [22.2, 36.85], [22.3, 36.95], [22.0, 37.2], [21.85, 37.35],
  [21.55, 37.4]]), MEGALOPOLIS);

// ---- 060 ----
// Satrapy bounds after 030.21, drawn plain. Neighbours share their vertices exactly.
// The north edge of Hyrcania and Parthia and of Margiana is persia-336's; the Caspian strip from the Mardians and
// Tapurians to Hyrcania lies north of MEDIA's edge.
const PARTHIA_N = [[53.85, 37.55], [55.5, 38.1], [57.0, 38.4], [58.4, 38.05], [60.0, 37.5]];
const MARGIANA_N = [[60.0, 37.5], [60.8, 38.0], [61.5, 38.4], [62.5, 38.4], [63.5, 39.05]];
const NODE_P = [59.5, 33.4];    // Parthia, Areia and Drangiana meet
const NODE_A = [64.0, 33.6];    // Areia, Drangiana and Arachosia
const NODE_B = [64.2, 35.5];    // Areia, Bactria and the Parapamisadae
const PARTHIA_E = [[60.0, 37.5], [60.6, 36.6], [60.8, 35.6]];
const AREIA_W = [[60.8, 35.6], [60.3, 34.6], NODE_P];
const AREIA_S = [NODE_P, [61.0, 33.3], [62.5, 33.4], NODE_A];
const AREIA_E = [NODE_A, [64.6, 34.6], NODE_B];
const AREIA_N = [NODE_B, [63.4, 35.9], [62.0, 35.9], [60.8, 35.6]];
const PARTHIA_S = [NODE_P, [58.5, 33.4], [57.0, 33.8], [55.5, 34.6], [53.9, 35.6]];
const MEDIA_NE = [[53.9, 35.6], [53.85, 36.15], [53.5, 36.15], [52.5, 35.85], [51.5, 35.95], [50.5, 36.3]];
const HYRC_PARTH = poly([[50.5, 37.6], [53.0, 37.4], ...PARTHIA_N, ...PARTHIA_E.slice(1), ...AREIA_W.slice(1),
  ...PARTHIA_S.slice(1), ...MEDIA_NE.slice(1)]);
const AREIA = poly([...AREIA_W, ...AREIA_S.slice(1), ...AREIA_E.slice(1), ...AREIA_N.slice(1, -1)]);
const ARACH_W = [[63.6, 30.4], [63.8, 32.4], NODE_A];       // Drangiana and Arachosia
const DRANGIANA = poly([...AREIA_S, ...ARACH_W.slice().reverse().slice(1), [62.5, 29.6], [61.0, 29.4], [60.2, 30.5],
  [59.6, 32.0]]);
// The crest of the Hindu Kush, between Bactria and the Parapamisadae; the Khawak pass near 69.8 E.
const HINDU_KUSH = [NODE_B, [65.5, 35.3], [67.0, 35.0], [68.2, 35.2], [69.0, 35.4], [69.8, 35.62], [70.6, 35.9],
  [71.2, 36.0]];
// Arachosia with the Parapamisadae to the crest; the Cophen valley and the Indus left out, as in persia-336.
const ARACHOSIA = poly([...ARACH_W, ...AREIA_E.slice(1), ...HINDU_KUSH.slice(1, 6), [69.6, 34.8], [69.4, 34.2],
  [69.0, 33.4], [68.6, 32.3], [68.0, 31.2], [67.4, 30.3], [66.0, 30.0], [64.8, 30.0]]);
// The Oxus (060.3): drawn by hand from Turkmenabat to the Afghan border, then the Afghan border, which follows
// the Amu Darya and the Panj, to Khorog.
const AFG = country('Afghanistan').geometry.coordinates[0];
const afgAt = p => AFG.reduce((bi, q, i) => (Math.hypot(q[0] - p[0], q[1] - p[1]) <
  Math.hypot(AFG[bi][0] - p[0], AFG[bi][1] - p[1]) ? i : bi), 0);
const OXUS_AFG = AFG.slice(afgAt([66.52, 37.364]), afgAt([71.434, 37.055]) + 1)
  .map(p => p.map(x => Math.round(x * 10000) / 10000));
const PANJ_BEND = afgAt([71.358, 38.252]) - afgAt([66.52, 37.364]);   // where the Panj turns south to Khorog
const OXUS = [[63.5, 39.05], [63.9, 38.85], [64.3, 38.55], [64.7, 38.2], [65.0, 37.98], [65.22, 37.84], [65.6, 37.62],
  [66.0, 37.45], [66.3, 37.36], ...OXUS_AFG];
const BACTRIA = poly([NODE_B, [64.6, 36.4], [65.2, 37.0], ...OXUS.slice(5), ...HINDU_KUSH.slice().reverse().slice(0, -1)]);
// The Jaxartes (060.6), from the mouth of the Fergana valley past Alexandria Eschate (Khujand) to Chinaz; then the
// edge of the Hungry Steppe and the Kyzyl Kum, persia-336's line, west to the Oxus.
const JAXARTES = [[70.1, 40.36], [69.85, 40.31], [69.62, 40.305], [69.4, 40.33], [69.15, 40.31], [69.0, 40.42],
  [68.85, 40.65], [68.72, 40.9], [68.65, 40.95]];
const SOGDIANA_N = [...JAXARTES, [68.0, 40.7], [67.0, 40.5], [66.0, 40.5], [65.0, 40.3], [64.0, 39.9], [63.5, 39.05]];
// East of the Panj bend the Pamirs stay blank.
const SOGDIANA = poly([...OXUS.slice(0, 9 + PANJ_BEND + 1), [71.6, 38.5], [71.0, 39.3], [70.3, 39.9],
  ...SOGDIANA_N.slice(0, -1)]);
const macedon330b = union(macedon330, HYRC_PARTH, AREIA, DRANGIANA);
const macedon329 = union(macedon330b, ARACHOSIA, BACTRIA);
const macedon329b = union(macedon329, SOGDIANA);
// Bessus's kingdom, Bactria and Sogdiana (060.19, 060.3).
const persia330b = union(BACTRIA, SOGDIANA);
// The rising: Sogdiana but Alexandria Eschate, which the Macedonians hold. The parts of Bactria that rose are not
// placed by any source and are not drawn.
const sogdians329 = diff(SOGDIANA, town([69.62, 40.28], 18));
// Autumn 329 BC (040): the citadel of Maracanda never fell (Arrian 4.5-4.6), so it stays out too.
const sogdians329b = diff(SOGDIANA, town([69.62, 40.28], 18), town([66.97, 39.65], 15));
// 328 BC (050): the columns hold the north and west of Sogdiana, Maracanda, where Coenus winters, and Nautaca, where
// Alexander does (Arrian 4.16.3, 4.17.4, 4.18.1; Bosworth XIII). The rising holds out in the south and in the eastern
// highlands of the Paraetacae, where the rocks are taken in 327. A plain line.
const HELD_328 = poly([[63.0, 38.9], [64.5, 38.6], [66.0, 38.75], [66.6, 38.8], [67.2, 39.1], [67.6, 39.6], [68.3, 39.75],
  [69.1, 39.85], [70.2, 40.1], [70.4, 40.7], [69.0, 41.6], [63.0, 41.2]]);
const sogdians328 = diff(SOGDIANA, HELD_328);
// The Dahae, the Massagetae and the Saka: the Karakum and the Kyzyl Kum north of Hyrcania, Parthia, Margiana and
// Sogdiana, and the steppe beyond the Jaxartes, west of the Fergana valley.
const scythians329 = poly([[53.0, 37.4], [52.3, 40.0], [50.5, 44.0], [50.8, 46.3], [71.5, 46.3], [71.5, 42.3],
  [70.6, 41.0], ...SOGDIANA_N, ...MARGIANA_N.slice().reverse().slice(1), ...PARTHIA_N.slice().reverse().slice(1)]);

// ---- 070 ----
// The Indus and the Punjab rivers on their modern courses (rivers.json, from Natural Earth; Bosworth warns that
// they have moved). seg(river, a, b) is the stretch between the vertices nearest a and b, in the order a to b.
const RIV = require('./rivers.json');
const nearest = (r, p) => RIV[r].reduce((bi, q, i) => (Math.hypot(q[0] - p[0], q[1] - p[1]) <
  Math.hypot(RIV[r][bi][0] - p[0], RIV[r][bi][1] - p[1]) ? i : bi), 0);
function seg(r, a, b) {
  const i = nearest(r, a), j = nearest(r, b);
  return i <= j ? RIV[r].slice(i, j + 1) : RIV[r].slice(j, i + 1).reverse();
}
const INDUS_N = [72.9, 35.0], INDUS_TARBELA = [72.75, 34.2], INDUS_K = [71.68, 33.0];  // Kalabagh
const JH_N = [73.52, 34.01], JH_MANGLA = [73.67, 33.08], JH_S = [72.77, 32.46], JH_PORUS_S = [72.22, 31.77];
const JH_END = [72.14, 31.18];
const CH_N = [74.74, 32.89], CH_PORUS_S = [72.74, 31.68], CH_END = [70.64, 29.04];
const RAVI_N = [75.54, 32.35], RAVI_S = [73.71, 31.19], BEAS_N = [75.6, 32.09], BEAS_END = [75.0, 31.18];
// The Cophen valley, Bajaur, Swat and the Peshawar plain: the land west of the Indus put under a satrap (Arrian
// 4.28), from Arachosia's edge and the Hindu Kush to the Indus above Kalabagh.
const COPHEN = poly([[69.8, 35.62], [70.6, 35.9], [71.2, 36.0], [71.8, 35.9], [72.6, 35.5], ...seg('indus', INDUS_N, INDUS_K),
  [70.6, 33.2], [69.9, 33.7], [69.4, 34.2], [69.6, 34.8]]);
// Taxiles's kingdom between the Indus and the Hydaspes (070.4), from the hills of Abisares to the Salt Range.
const TAXILA = poly([...seg('indus', INDUS_TARBELA, INDUS_K), [72.2, 32.6], ...seg('jhelum', JH_S, JH_N), [73.2, 34.05]]);
// Porus between the Hydaspes and the Acesines (070.5), from the hills to a plain line across the doab.
const PORUS = poly([...seg('jhelum', JH_MANGLA, JH_PORUS_S), ...seg('chenab', CH_PORUS_S, CH_N), [74.2, 32.95]]);
// The land up to the Hyphasis that Porus is given (070.14): the doabs of the Hydraotes and the Hyphasis.
const PUNJAB_E = poly([...seg('chenab', CH_N, CH_PORUS_S), seg('ravi', RAVI_S, RAVI_S)[0], BEAS_END,
  ...seg('beas', BEAS_END, BEAS_N), seg('ravi', RAVI_N, RAVI_N)[0], [75.3, 32.55]]);
// The Malli on the lower Acesines and the Hydraotes, and the Indus valley from the confluence to the Ocean
// (Arrian 6.14-6.15): what macedon-325a adds.
const MALLI_INDUS = poly([...seg('chenab', CH_PORUS_S, CH_END), [70.3, 28.95], [69.3, 28.45], [68.2, 27.9], [67.6, 27.0],
  [67.4, 25.9], [67.1, 24.9], [67.0, 23.6], [68.5, 23.6], [68.8, 24.5], [69.0, 25.4], [69.2, 26.4], [69.6, 27.4],
  [70.6, 28.3], [71.5, 28.9], [72.6, 29.6], [73.6, 30.6], seg('ravi', RAVI_S, RAVI_S)[0]]);
// The other Indian lands: the Sind Sagar doab and the Indus's west bank below Kalabagh, and the Punjab south of
// Porus's grant to the Sutlej.
const THAL = poly([INDUS_K, [70.6, 33.2], [70.2, 32.0], [70.1, 30.5], [70.0, 29.6], [70.3, 28.95],
  ...seg('chenab', CH_END, CH_PORUS_S), ...seg('jhelum', JH_PORUS_S, JH_S), [72.2, 32.6]]);
const SUTLEJ_S = poly([seg('ravi', RAVI_S, RAVI_S)[0], BEAS_END, ...seg('sutlej', [74.95, 31.15], [71.5, 29.45]),
  [71.5, 28.9], [72.6, 29.6], [73.6, 30.6]]);
const indians327 = union(COPHEN, THAL, PUNJAB_E, MALLI_INDUS, SUTLEJ_S);
const taxila327 = TAXILA;
const porus326 = PORUS;
const porus326b = union(PORUS, PUNJAB_E);
const macedon326 = union(macedon329b, COPHEN);
// The Indus valley above the confluence, the Derajat and the Sind Sagar doab (THAL), was Philip's satrapy (Arrian
// 6.15; Bosworth ch. 2.XVI), so macedon-325a takes it in too and indians-325 gives it up.
const macedon325a = union(macedon326, MALLI_INDUS, THAL);

// ---- 080 ----
// Gedrosia and the coast of Ora (080.1, 080.3), late 325 BC. A plain line: on the north it takes the south edges
// of Arachosia and Drangiana (060) vertex for vertex; on the east persia-336's old line down to the Kirthar range
// and then MALLI_INDUS's edge to the Hab and the Ocean; on the west the east side of the Jaz Murian, across which
// the army marches from Pura "into Carmania" (080.20).
const GEDROSIA = poly([[67.4, 30.3], [67.0, 29.0], [67.6, 27.0], [67.4, 25.9], [67.1, 24.9], [67.0, 23.6], [62.0, 23.6],
  [58.9, 24.8], [59.3, 27.4], [59.6, 29.0], [61.0, 29.4], [62.5, 29.6], [63.6, 30.4], [64.8, 30.0], [66.0, 30.0]]);
// Carmania, late 325 BC (cloud ruling): Alexander appoints its satraps and the army reunites there (Arrian
// 6.27-28). A plain line: Persis's east edge (050) vertex for vertex, Drangiana's west edge (060), Gedrosia's west
// edge, and on the north the edge of the Lut and the Dasht-e Kavir.
const CARMANIA = poly([[53.5, 31.0], [55.5, 31.6], [57.5, 31.5], [59.6, 32.0], [60.2, 30.5], [61.0, 29.4], [59.6, 29.0],
  [59.3, 27.4], [58.9, 24.8], [57.4, 24.9], [56.6, 25.6], [55.6, 26.0], [54.6, 26.0], [53.5, 26.8], [54.6, 28.0],
  [54.6, 29.8]]);
const macedon325 = union(macedon325a, GEDROSIA, CARMANIA);

// ---- 090 ----
// Every 090 zone is a reconstruction (brief, Map). The satrapies of 323 BC from Diodorus 18.3 (090.2), on the
// regions drawn for the conquest, so neighbours share their vertices.
const landAt = p => land.find(l => turf.booleanPointInPolygon(turf.point(p), l));
const lysimachus323 = noIslands(diff(THRACE_ADD, macedon348), isl('thasos', 'samothrace'));
const ptolemaic323 = EGYPT;
// Cyrene and Cyrenaica, annexed to Ptolemy's satrapy late in 322 BC (Diodorus 18.21.9; H&W ch. V.4; 090.34), to the
// Gulf of Sirte; a plain line.
const CYRENAICA = poly([[25.2, 31.8], [25.2, 28.8], [22.0, 29.5], [19.5, 30.2], [19.5, 33.0], [25.2, 33.0]]);
const ptolemaic322 = union(EGYPT, CYRENAICA);
const antigonus323 = diff(noIslands(union(PHRYGIA, LYCIA_PAMPH, GAP_TRIANGLE), ASIA_ISL), PISIDIA, SILLYUM);
// Paphlagonia from the Bithynian border to the Halys mouth, north of Cappadocia; Lycaonia stays out.
const PAPHLAGONIA = poly([[32.3, 39.9], [31.9, 40.4], [31.6, 41.1], [31.5, 41.6], [33.0, 42.2], [35.2, 42.1], [36.0, 41.75],
  [36.4, 41.2], [35.5, 40.2], [33.9, 40.4], [32.6, 40.3]]);
const eumenes323 = diff(union(CAPPADOCIA, PAPHLAGONIA), LYCAONIA);
// Babylonia (090.7): Mesopotamia south of a line across the two rivers above Babylon, west of the Tigris marshes.
const LINE_N = [[40.0, 34.1], [44.0, 34.2], [45.6, 33.9], [46.5, 33.2]];
const BABYLONIA = turf.intersect(fc(MESO, poly([...LINE_N, [47.3, 32.8], [47.5, 31.6], [47.7, 30.6], [48.3, 29.8],
  [48.5, 28.5], [40.0, 28.5]])));
const seleucid320 = BABYLONIA;
// The Greeks of the Lamian War after Diodorus 18.11.1-2: Attica, Aetolia, Thessaly but Pelinna, Phocis, Locris, Doris,
// Oeta and Malis but Lamia, the Leucadians, Carystus, and Argos with the Acte, Sicyon, Elis and Messenia.
const CENTRAL = poly([[21.3, 38.3], [21.35, 38.9], [21.45, 39.1], [21.7, 39.0], [22.0, 38.92], [22.45, 38.88],
  [22.75, 38.86], [22.95, 38.98], [23.2, 38.75], [23.1, 38.62], [22.85, 38.6], [22.8, 38.5], [22.8, 38.35],
  [22.85, 38.15], [22.4, 38.3], [21.8, 38.33]]);
const PELINNA = town([21.92, 39.57], 6), LAMIA = town([22.43, 38.9], 5);
const LEFKADA = landAt(ISL.lefkada);
const CARYSTUS = turf.intersect(fc(landAt(ISL.euboea), poly([[24.25, 38.25], [24.62, 38.25], [24.62, 37.95], [24.25, 37.95]])));
const ELIS = poly([[21.1, 37.6], [21.2, 38.1], [21.6, 38.0], [21.8, 37.75], [21.85, 37.35], [21.55, 37.4]]);
const MESSENIA = poly([[21.55, 37.4], [21.85, 37.35], [22.0, 37.2], [22.2, 36.85], [22.3, 36.4], [21.6, 36.6], [21.4, 37.2]]);
const ARGOLID = poly([[22.55, 37.75], [22.85, 37.85], [23.2, 37.75], [23.5, 37.5], [23.2, 37.3], [22.75, 37.35], [22.6, 37.5]]);
const SICYON = poly([[22.55, 37.95], [22.75, 38.05], [22.85, 37.92], [22.65, 37.85]]);
// Also the Alyzaeans (Alyzia, on the Acarnanian coast), the Athamanians and the Dolopians (Diodorus 18.11.1). Lamia,
// Heracleia Trachinia and Phthiotic Thebes stay out ("the Oetaeans except the inhabitants of Heracleia, the Achaeans
// of Phthiotis except the people of Thebae, the Melians except those of Lamia"), cut from the whole union.
const HERACLEIA = town([22.43, 38.78], 4), PHTHIOTIC_THEBES = town([22.78, 39.27], 4);
const ALYZIA = town([20.98, 38.68], 8);
const ATHAMANIA = poly([[21.0, 39.3], [21.0, 39.65], [21.35, 39.65], [21.35, 39.5], [21.45, 39.1], [21.2, 39.25]]);
const DOLOPIA = poly([[21.45, 39.1], [21.75, 39.25], [21.85, 39.1], [21.7, 39.0]]);
const greeks323 = diff(union(athens338, diff(thessaly352, PELINNA), noIslands(CENTRAL, isl('euboea')), LEFKADA, CARYSTUS,
  ELIS, MESSENIA, ARGOLID, SICYON, ALYZIA, ATHAMANIA, DOLOPIA), LAMIA, HERACLEIA, PHTHIOTIC_THEBES);
// Ptolemy's Egypt with Syria and Phoenicia, 319-315 BC (090.27): Laomedon's whole satrapy.
const ptolemaic319 = union(EGYPT, CYRENAICA, PALESTINE, SYRIA_N);
const macedon316 = union(macedon348, thessaly352);
// Antigonus's Asia, 316 BC (090.9): persia-336's outline with the Uxian hills, without Egypt and Cyprus;
// ptolemaic-319 and lysimachus-323 cut it on its page.
const antigonus316 = diff(persia336raw, EGYPT, CYPRUS);
// The kingdom of Antigonus, 306-301 BC: Asia Minor without Bithynia, Paphlagonia, Pontus and Armenia, Syria with
// Phoenicia and Coele-Syria, and Mesopotamia north of LINE_N, the Zagros front its east edge (cloud ruling on 090.22).
const ASIA_MINOR = noIslands(union(ASIA_334A, CARIA, LYCIA_PAMPH, PHRYGIA, GAP_TRIANGLE, PISIDIA, LYCAONIA, CILICIA,
  CAPPADOCIA), ASIA_ISL);
const SOUTH_OF_LINE = poly([...LINE_N, [50.0, 33.0], [50.0, 28.0], [40.0, 28.0]]);
const antigonus306 = union(ASIA_MINOR, SYRIA_N, PALESTINE, diff(MESO, SOUTH_OF_LINE));
// Seleucus's kingdom, 306-301 BC: persia-336's outline east of the Antigonus line and south of Media's north edge,
// the desert west of MESO left out; the Indus lands out as in persia-336.
const NORTHWEST = poly([[20.0, 24.0], [20.0, 46.0], [52.0, 46.0], [50.5, 37.6], [50.5, 36.3], [49.5, 36.6], [48.0, 36.8],
  [46.5, 36.3], [45.8, 35.6], [44.8, 35.8], [45.5, 35.0], [46.0, 34.0], ...LINE_N.slice().reverse(), [40.0, 24.0]]);
const DESERT = poly([[40.0, 34.1], [40.5, 33.5], [42.5, 31.5], [44.5, 30.5], [46.5, 29.2], [47.0, 29.0], [48.0, 29.4],
  [48.0, 24.0], [40.0, 24.0]]);
const seleucid306 = diff(persia336raw, NORTHWEST, DESERT);
// After Ipsus (090.15, 090.24, 090.25): Lysimachus north of the Taurus, Pontus and Bithynia inside; Seleucus Syria and
// Mesopotamia too; Ptolemy Syria south of Damascus and the Lebanon, to the coast south of Tyre.
const NORTH_AM = poly([[27.3, 40.72], [28.0, 40.82], [28.6, 40.88], [28.95, 40.96], [28.995, 41.0], [29.0, 41.03],
  [29.033, 41.05], [29.058, 41.08], [29.073, 41.12], [29.075, 41.14], [29.058, 41.153], [29.07, 41.17], [29.09, 41.19],
  [29.115, 41.21], [29.14, 41.235], [29.25, 41.4], [29.6, 42.4], [41.0, 42.4], [41.55, 41.55], [40.0, 40.2], [38.5, 39.6],
  [37.2, 38.8], [36.5, 39.6], [35.5, 40.2], [33.9, 40.4], [32.6, 40.3], [32.3, 39.9], [31.5, 40.1], [30.4, 40.15],
  [29.7, 40.0], [29.6, 40.2], [29.2, 40.35], [28.9, 40.42], [28.75, 40.55], [28.0, 40.75]]);
const lysimachus301 = noIslands(union(lysimachus323, ASIA_334A, PHRYGIA, GAP_TRIANGLE, PISIDIA, LYCAONIA, CAPPADOCIA,
  NORTH_AM), ASIA_ISL);
const COELE = poly([[34.9, 33.05], [35.1, 33.08], [35.6, 33.25], [36.0, 33.3], [36.7, 33.2], [36.6, 32.3], [35.9, 31.3],
  [35.4, 31.3], [34.9, 31.2], [34.25, 31.3], [34.1, 31.4], [34.5, 32.3]]);
const ptolemaic301 = union(EGYPT, CYRENAICA, COELE);
// Tyre and Sidon stay with Demetrius (090.25, Tarn), so they are cut out.
const seleucid301 = diff(union(seleucid306, MESO, SYRIA_N, PALESTINE), town([35.195, 33.27], 4), town([35.37, 33.56], 4));

const Z = {
  'macedon-359': [macedon359, 'macedon', 'Macedon, 358 BC'],
  'macedon-356': [macedon356, 'macedon', 'Macedon, 356 BC'],
  'macedon-348': [macedon348, 'macedon', 'Macedon, 348 BC'],
  'macedon-340': [macedon340, 'macedon', 'Macedon and Thrace, 340–336 BC'],
  'olynthus-356': [olynthus356, 'olynthus', 'Chalcidian League under Olynthus'],
  'illyrians-359': [illyrians359, 'illyrians', 'Illyrians'],
  'thracians-359': [thracians359, 'thracians', 'Thracians'],
  'thracians-340': [thracians340, 'thracians', 'Free Thracians of the Haemus'],
  'thessaly-352': [thessaly352, 'thessaly', 'Thessaly, under the king of Macedon as archon'],
  'epirus-350': [epirus350, 'epirus', 'Kingdom of Epirus'],
  'athens-338': [athens338, 'athens', 'Athens'],
  'thebes-338': [thebes338, 'thebes', 'Thebes and the Boeotians'],
  'greeks-338': [greeks338, 'greeks', 'Other Greek states'],
  'league-337': [league337, 'league', 'League of Corinth'],
  'sparta-337': [sparta337, 'sparta', 'Sparta'],
  'triballi-335': [triballi335, 'triballi', 'Triballi', ['Bulgaria', 'Serbia']],
  'getae-335': [getae335, 'getae', 'Getae', ['Romania']],
  'illyrians-335': [illyrians335, 'illyrians', 'Illyrians under Cleitus and Glaucias'],
  'thebes-335': [thebes335, 'thebes', 'Thebes in revolt'],
  'macedon-334a': [macedon334a, 'macedon', 'Macedon, summer 334 BC'],
  'macedon-334': [macedon334, 'macedon', 'Macedon, end of 334 BC'],
  'macedon-333': [macedon333, 'macedon', 'Macedon, spring 333 BC'],
  'macedon-333b': [macedon333b, 'macedon', 'Macedon, 333 BC'],
  'macedon-333c': [macedon333c, 'macedon', 'Macedon, winter 333–332 BC'],
  'macedon-332a': [macedon332a, 'macedon', 'Macedon, 332 BC'],
  'macedon-332': [macedon332, 'macedon', 'Macedon, autumn 332 BC'],
  'macedon-331': [macedon331, 'macedon', 'Macedon, 332–331 BC'],
  'macedon-331b': [macedon331b, 'macedon', 'Macedon, late 331 BC'],
  'macedon-330a': [macedon330a, 'macedon', 'Macedon, January–May 330 BC'],
  'macedon-330': [macedon330, 'macedon', 'Macedon, July 330 BC'],
  'sparta-331': [sparta331, 'sparta', 'Sparta and the allies of Agis III'],
  'persia-336': [persia336, 'persia', 'Persian Empire', PERSIA_CLIP],
  'macedon-330b': [macedon330b, 'macedon', 'Macedon, autumn 330 BC'],
  'macedon-329': [macedon329, 'macedon', 'Macedon, spring 329 BC'],
  'macedon-329b': [macedon329b, 'macedon', 'Macedon, summer 329 BC'],
  'persia-330b': [persia330b, 'persia', 'Kingdom of Bessus'],
  'sogdians-329': [sogdians329, 'sogdians', 'Sogdians in revolt'],
  'sogdians-329b': [sogdians329b, 'sogdians', 'Sogdians in revolt'],
  'sogdians-328': [sogdians328, 'sogdians', 'Sogdians in revolt'],
  'scythians-329': [scythians329, 'scythians', 'Saka, Massagetae and Dahae'],
  'indians-327': [indians327, 'indians', 'Indian peoples'],
  'taxila-327': [taxila327, 'taxila', 'Kingdom of Taxiles'],
  'porus-326': [porus326, 'porus', 'Kingdom of Porus'],
  'porus-326b': [porus326b, 'porus', 'Kingdom of Porus'],
  'macedon-326': [macedon326, 'macedon', 'Macedon, 326 BC'],
  'macedon-325a': [macedon325a, 'macedon', 'Macedon, summer 325 BC'],
  'macedon-325': [macedon325, 'macedon', "Alexander's empire, late 325 BC"],
  'lysimachus-323': [lysimachus323, 'lysimachus', "Lysimachus's Thrace"],
  'ptolemaic-323': [ptolemaic323, 'ptolemaic', "Ptolemy's Egypt"],
  'antigonus-323': [antigonus323, 'antigonus', "Antigonus's satrapy"],
  'eumenes-323': [eumenes323, 'eumenes', "Eumenes's Cappadocia and Paphlagonia"],
  'seleucid-320': [seleucid320, 'seleucid', "Seleucus's Babylonia"],
  'greeks-323': [greeks323, 'greeks', 'The Greeks of the Lamian War'],
  'ptolemaic-322': [ptolemaic322, 'ptolemaic', "Ptolemy's Egypt and Cyrenaica"],
  'ptolemaic-319': [ptolemaic319, 'ptolemaic', "Ptolemy's Egypt and Cyrenaica with Syria and Phoenicia, 319–315 BC"],
  'macedon-316': [macedon316, 'macedon', 'Macedon under Cassander, 316–301 BC'],
  'antigonus-316': [antigonus316, 'antigonus', "Antigonus's Asia", PERSIA_CLIP],
  'antigonus-306': [antigonus306, 'antigonus', 'Kingdom of Antigonus, 306–301 BC'],
  'seleucid-306': [seleucid306, 'seleucid', "Seleucus's kingdom, 306–301 BC", PERSIA_CLIP],
  'lysimachus-301': [lysimachus301, 'lysimachus', 'Kingdom of Lysimachus after Ipsus'],
  'ptolemaic-301': [ptolemaic301, 'ptolemaic', "Ptolemy's Egypt and Cyrenaica with Coele-Syria"],
  'seleucid-301': [seleucid301, 'seleucid', "Seleucus's kingdom after Ipsus", PERSIA_CLIP],
};

const round = c => Array.isArray(c[0]) ? c.map(round) : c.map(x => Math.round(x * 10000) / 10000);
const check = process.argv.includes('--check');
fs.mkdirSync(OUT, { recursive: true });
for (const [id, [f, family, name, clip]] of Object.entries(Z)) {
  const g = turf.truncate(f, { precision: 4 }).geometry;
  const props = { family, name };
  if (clip) props.clip = clip;
  const feat = { type: 'Feature', properties: props, geometry: { type: g.type, coordinates: round(g.coordinates) } };
  fs.writeFileSync(path.join(OUT, id + '.geojson'), JSON.stringify(feat) + '\n');
  if (check) {
    // land pieces of the zone, to spot a stray island or a sliver over the straits
    const box = turf.bbox(feat);
    const pieces = [];
    for (const l of land) {
      const b = turf.bbox(l);
      if (b[2] < box[0] || b[0] > box[2] || b[3] < box[1] || b[1] > box[3]) continue;
      const i = turf.intersect(fc(l, feat));
      if (!i) continue;
      for (const p of turf.flatten(i).features) {
        const a = turf.area(p) / 1e6;
        if (a > 1) pieces.push([a.toFixed(0), turf.centroid(p).geometry.coordinates.map(x => x.toFixed(2)).join(',')]);
      }
    }
    pieces.sort((a, b) => b[0] - a[0]);
    console.log(id, g.type, 'land pieces:', pieces.map(p => `${p[0]}km2@${p[1]}`).join('  '));
  }
}
