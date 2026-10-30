// The political map: one set of zones per period, written to shared/zones/, with the page map in .plans/zones.yaml
// and the Turkish names in .i18n-parts/zones.tr.yaml. Run from the repo root: node content/hussite-wars/.plans/zones.mjs
// The crown lands and the kingdoms around them are cut from the Natural Earth countries along hand drawn lines of the
// time. Inside Bohemia the Hussite unions are drawn as the country around the towns each one held, and the royalist
// zone of a period is all the crown lands, which the build cuts where a Hussite zone of higher priority lies over it.
// A family shows as one zone per page, so a party that holds lands apart is one zone of several pieces.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
// turf, topojson and the world atlas come with harita, linked or installed
const hreq = createRequire(require.resolve('@openbooknetwork/harita/package.json'));
const turf = hreq('@turf/turf'), tc = hreq('topojson-client'), world = hreq('world-atlas/countries-10m.json');
const story = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// --- geometry helpers, Features in and out ---
const BOX = turf.bboxPolygon([4, 44.5, 25, 57]);
const fc = (...a) => turf.featureCollection(a.flat().filter(Boolean));
const U = (...a) => { const p = a.flat().filter(Boolean); return p.length > 1 ? turf.union(fc(p)) : p[0] ?? null; };
const I = (a, b) => a && b ? turf.intersect(fc(a, b)) : null;
const D = (a, ...b) => { b = b.flat().filter(Boolean); return a && b.length ? turf.difference(fc(a, ...b)) : a; };
const poly = pts => turf.polygon([[...pts, pts[0]]]);
const km2 = f => turf.area(f) / 1e6;
const countries = tc.feature(world, world.objects.countries).features;
const C = (...names) => U(names.map(n => { const f = countries.find(c => c.properties.name === n); if (!f) throw new Error(`no country ${n}`); return I(f, BOX); }));

// --- lines of the time, [lon, lat] ---
// Bohemia and Moravia: from the Austrian border west of Slavonice by Jihlava and Polička to Králický Sněžník
const BOH_MOR = [[15.22, 48.4], [15.25, 48.96], [15.33, 49.1], [15.36, 49.25], [15.48, 49.35], [15.55, 49.47], [15.8, 49.55], [15.98, 49.66],
  [16.12, 49.73], [16.38, 49.78], [16.52, 49.86], [16.66, 49.98], [16.84, 50.19], [16.95, 50.5], [17.2, 51.2]];
// Moravia and the Silesian duchies of Opava and Těšín, east of Králický Sněžník
const MOR_SIL = [[16.84, 50.19], [17.0, 50.1], [17.3, 49.98], [17.6, 49.87], [17.9, 49.85], [18.15, 49.8], [18.3, 49.72], [18.4, 49.6], [18.6, 49.48], [18.95, 49.45]];
const WEST_OF_MORAVIA = poly([[10.5, 48.4], ...BOH_MOR, [10.5, 51.2]]);
// the county of Kladsko, a Bohemian salient into Silesia: its northern line, closed through Czechia so the cut takes all of it
const KLADSKO = poly([[15.9, 50.3], [16.15, 50.66], [16.45, 50.75], [16.75, 50.62], [16.95, 50.45], [17.05, 50.3], [17.0, 49.9], [16.0, 49.9]]);
const CZ_SILESIA = poly([...MOR_SIL, [19.3, 49.45], [19.3, 50.8], [16.95, 50.5]]);
// the Silesian duchies, from Crossen along the border of Greater Poland to Bytom. Its west reaches into the
// Lusatias, which are cut out of it, so the two share one border line and no sliver opens between them
const SILESIA_POLY = poly([[14.9, 50.75], [14.9, 51.4], [14.85, 52.08], [15.4, 52.2], [15.85, 52.12], [16.2, 51.85], [16.6, 51.72],
  [17.2, 51.6], [17.6, 51.45], [18.1, 51.2], [18.45, 50.95], [18.9, 50.75], [19.15, 50.45], [19.25, 50.1], [19.35, 49.85], [19.3, 49.3], [14.9, 49.3]]);
const U_LUSATIA_POLY = poly([[13.9, 50.95], [13.95, 51.25], [14.05, 51.42], [14.5, 51.5], [14.9, 51.5], [15.25, 51.42], [15.3, 51.4], [15.3, 50.75], [14.9, 50.8], [14.3, 50.8], [14.0, 50.85]]);
const L_LUSATIA_POLY = poly([[13.25, 51.6], [13.5, 52.05], [13.9, 52.2], [14.4, 52.15], [14.75, 52.1], [14.95, 52.05], [15.05, 51.85], [15.25, 51.6], [15.25, 51.42],
  [14.9, 51.5], [14.5, 51.5], [14.05, 51.42], [13.6, 51.45]]);
// the Leitha line: Burgenland east of it belongs to Hungary
const BURGENLAND = poly([[16.98, 48.12], [16.78, 48.02], [16.55, 47.92], [16.37, 47.85], [16.25, 47.7], [16.15, 47.5], [16.2, 47.3], [16.1, 47.0], [16.0, 46.6], [17.6, 46.6], [17.6, 48.2]]);
// the archbishopric of Salzburg, a prince of the Empire
const SALZBURG = poly([[12.08, 47.6], [12.6, 47.65], [12.95, 47.97], [13.15, 48.05], [13.5, 47.95], [13.6, 47.75], [13.85, 47.55], [13.9, 47.25], [13.8, 47.05], [13.35, 47.0], [12.65, 47.05], [12.15, 47.1], [12.2, 47.3]]);
const SOUTH_TYROL = poly([[10.4, 46.4], [10.45, 47.1], [12.2, 47.1], [12.5, 46.6], [12.4, 46.4]]);
const ZAKARPATTIA = poly([[22.0, 47.8], [22.0, 49.0], [22.6, 49.1], [23.6, 48.95], [23.6, 47.8]]);
// the State of the Teutonic Order: Pomerelia, the Chełmno land, Warmia and Prussia to the Neman
const PRUSSIA_POLY = poly([[17.45, 54.85], [17.55, 54.45], [17.45, 54.15], [17.15, 53.95], [17.05, 53.75], [17.15, 53.6], [17.25, 53.55], [17.6, 53.35], [17.95, 53.2],
  [18.25, 53.15], [18.55, 52.98], [18.9, 53.0], [19.2, 53.1], [19.45, 53.2], [19.75, 53.2], [20.2, 53.13], [20.6, 53.28], [21.2, 53.33], [21.6, 53.45], [22.0, 53.55],
  [22.4, 53.75], [22.75, 54.0], [22.85, 54.35], [22.75, 54.8], [22.3, 55.05], [21.3, 55.25], [20.8, 56.0], [17.3, 56.0]]);
// the Neumark, sold to the Order in 1402 and bought back by Brandenburg in 1455
const NEUMARK_POLY = poly([[14.35, 52.55], [14.3, 52.95], [14.55, 53.2], [14.9, 53.35], [15.4, 53.5], [15.75, 53.6], [16.1, 53.45], [16.15, 53.2], [15.95, 52.95],
  [15.75, 52.82], [15.6, 52.68], [15.35, 52.6], [14.9, 52.55], [14.6, 52.5]]);
const LITHUANIA_POLY = poly([[22.3, 52.3], [25, 52.3], [25, 57], [20.8, 57], [21.3, 55.25], [22.3, 55.05], [22.75, 54.8], [22.85, 54.35], [22.75, 54.0], [22.4, 53.75], [22.3, 53.4]]);
// Poland from Greater Poland's western border to Red Ruthenia; Silesia, the Order, Hungary and the Neumark cut it
const POLAND_POLY = poly([[14.8, 48.6], [25, 48.6], [25, 52.3], [22.3, 52.3], [22.3, 53.4], [22.4, 53.75], [22.0, 53.95], [19.0, 54.2], [17.6, 54.0], [17.25, 53.55],
  [16.9, 53.62], [16.45, 53.62], [16.2, 53.4], [16.2, 53.05], [15.9, 52.88], [15.6, 52.68], [15.55, 52.5], [15.62, 52.35], [15.85, 52.15], [15.6, 51.8], [15.2, 51.3], [14.8, 50.9]]);
// Denmark with Scania, Bornholm and Schleswig to the Eider
const DENMARK_POLY = poly([[7.9, 54.35], [8.9, 54.3], [9.6, 54.35], [10.2, 54.35], [10.9, 54.55], [11.7, 54.7], [12.6, 54.8], [13.2, 55.05], [14.4, 54.95], [15.6, 54.9], [15.6, 57], [7.9, 57]]);

// --- the outlines ---
const CZ = C('Czechia'), PL = C('Poland'), DE = C('Germany'), DE_PL = U(DE, PL);
const BOHEMIA = U(I(CZ, WEST_OF_MORAVIA), I(PL, KLADSKO));
const CZSIL = D(I(CZ, CZ_SILESIA), WEST_OF_MORAVIA);
const MORAVIA = D(CZ, WEST_OF_MORAVIA, CZ_SILESIA);
const U_LUSATIA = I(DE_PL, U_LUSATIA_POLY);
const L_LUSATIA = I(DE_PL, D(L_LUSATIA_POLY, U_LUSATIA_POLY));
const SILESIA = U(D(I(PL, SILESIA_POLY), KLADSKO, U_LUSATIA, L_LUSATIA), CZSIL);
const AUSTRIA = U(D(C('Austria'), BURGENLAND, SALZBURG), C('Slovenia'), I(C('Italy'), SOUTH_TYROL));
const HUNGARY = U(C('Slovakia', 'Hungary', 'Croatia', 'Romania'), I(C('Ukraine'), ZAKARPATTIA), I(C('Austria'), BURGENLAND));
const PRUSSIA = PRUSSIA_POLY, NEUMARK = NEUMARK_POLY, LITHUANIA = LITHUANIA_POLY, POLAND = POLAND_POLY, DENMARK = DENMARK_POLY;
const EMPIRE = D(turf.bboxPolygon([4, 44.5, 25, 57]), DENMARK_POLY);
const LUSATIA = U(U_LUSATIA, L_LUSATIA), CROWN = U(BOHEMIA, MORAVIA, SILESIA, LUSATIA);
// one zone of pieces that do not touch: the writer keeps every piece, where it keeps the largest of any other zone
const pieces = (...a) => { const u = U(a); u.properties = { pieces: true }; return u; };

// --- towns, [lon, lat] ---
const T = {
  prague: [14.42, 50.09], tabor: [14.66, 49.41], usti_sez: [14.68, 49.39], pisek: [14.15, 49.31], hradec: [15.83, 50.21], zatec: [13.55, 50.33], louny: [13.8, 50.36],
  slany: [14.09, 50.23], klatovy: [13.3, 49.4], domazlice: [12.93, 49.44], susice: [13.52, 49.23], prachatice: [14.0, 49.01], vodnany: [14.18, 49.15],
  kutna: [15.27, 49.95], caslav: [15.39, 49.91], kolin: [15.2, 50.03], kourim: [14.98, 50.0], nymburk: [15.04, 50.19], boleslav: [14.9, 50.41], jaromer: [15.92, 50.36],
  dvur: [15.81, 50.43], trutnov: [15.91, 50.56], litomerice: [14.13, 50.53], usti_labem: [14.03, 50.66], beroun: [14.07, 49.96], melnik: [14.47, 50.35],
  brod: [14.86, 50.07], tachov: [12.63, 49.8], stribro: [13.0, 49.75], pelhrimov: [15.22, 49.43], chrudim: [15.8, 49.95], myto: [16.16, 49.95], litomysl: [16.31, 49.87],
  nachod: [16.16, 50.42], rakovnik: [13.73, 50.1],
};
// the country around a union's towns: a round area of km around each town, joined to its nearest towns along the
// shortest tree that links them all, so the zone follows the towns and the roads between them; kept inside Bohemia
const around = (towns, km) => {
  const pts = towns.map(t => { if (!T[t]) throw new Error(`no town ${t}`); return T[t]; });
  const dist = (a, b) => turf.distance(a, b, { units: 'kilometers' }), parts = pts.map(p => turf.buffer(turf.point(p), km, { units: 'kilometers', steps: 16 }));
  const linked = [0];
  while (linked.length < pts.length) {
    let best = null;
    for (const i of linked) for (let j = 0; j < pts.length; j++) if (!linked.includes(j) && (!best || dist(pts[i], pts[j]) < best.d)) best = { i, j, d: dist(pts[i], pts[j]) };
    parts.push(turf.buffer(turf.lineString([pts[best.i], pts[best.j]]), km * 0.7, { units: 'kilometers', steps: 16 }));
    linked.push(best.j);
  }
  // grow and shrink back by twice the radius: fills the bays between nearby towns, which the build's corner rounding
  // would otherwise close into holes, and rounds the outline
  const grown = turf.buffer(U(parts), 2 * km, { units: 'kilometers', steps: 16 }), shrunk = turf.buffer(grown, -2 * km, { units: 'kilometers', steps: 16 });
  // a hole inside a union's country is not a place it lacks: keep the outer ring of each piece
  const outer = shrunk.geometry.type === 'Polygon' ? turf.polygon([shrunk.geometry.coordinates[0]]) : turf.multiPolygon(shrunk.geometry.coordinates.map(c => [c[0]]));
  return I(outer, BOHEMIA);
};

// --- zones: id, family, English and Turkish name, shape ---
const Z = {};
const zone = (id, family, en, tr, shape) => { Z[id] = { id, family, name: { en, tr }, shape }; return id; };

// around 1400: the crown lands one by one where the text names them, else one zone
const lands = [
  zone('bohemia-1400', 'bohemia', 'Kingdom of Bohemia', 'Bohemya Krallığı', BOHEMIA),
  zone('moravia-1400', 'moravia', 'Margraviate of Moravia', 'Moravya Uçbeyliği', MORAVIA),
  zone('silesia-1400', 'silesia', 'Duchies of Silesia, under the Bohemian crown', 'Bohemya tacına bağlı Silezya dükalıkları', SILESIA),
  zone('lusatia-1400', 'lusatia', 'Margraviates of Upper and Lower Lusatia, under the Bohemian crown', 'Bohemya tacına bağlı Yukarı ve Aşağı Lusatya uçbeylikleri', LUSATIA),
];
const crown = zone('crown-1400', 'bohemia', 'Lands of the Bohemian crown: Bohemia, Moravia, Silesia and the Lusatias', 'Bohemya tacının toprakları: Bohemya, Moravya, Silezya ve Lusatyalar', CROWN);
const austria = zone('austria-1400', 'austria', 'Duchies of Austria under the Habsburgs', 'Habsburgların Avusturya dükalıkları', AUSTRIA);
const hungary = zone('hungary-1400', 'hungary', 'Kingdom of Hungary under Sigismund, 1387–1437', 'Sigismund’un Macaristan Krallığı, 1387–1437', HUNGARY);
// Poland and Lithuania one zone where the text names Poland alone, two where it names both
const poland = zone('poland-1400', 'poland', 'Kingdom of Poland', 'Polonya Krallığı', POLAND);
const lithuania = zone('lithuania-1400', 'lithuania', 'Grand Duchy of Lithuania, in union with Poland', 'Polonya ile birlik içindeki Litvanya Büyük Dükalığı', LITHUANIA);
const union = zone('poland-lithuania-1400', 'poland', 'Kingdom of Poland, with the Grand Duchy of Lithuania in union with it',
  'Polonya Krallığı ve onunla birlik içindeki Litvanya Büyük Dükalığı', U(POLAND, LITHUANIA));
const prussia = zone('teutonic-1400', 'teutonic', 'State of the Teutonic Order in Prussia', 'Prusya’daki Töton Şövalyeleri Tarikatı Devleti', PRUSSIA);
const order = zone('teutonic-1410', 'teutonic', 'State of the Teutonic Order in Prussia, with the Neumark 1402–1455',
  'Prusya’daki Töton Şövalyeleri Tarikatı Devleti, 1402–1455 arasında Neumark ile', pieces(PRUSSIA, NEUMARK));
const denmark = zone('denmark-1400', 'other', 'Kingdom of Denmark', 'Danimarka Krallığı', DENMARK);
const empire1378 = zone('empire-1378', 'empire', 'Holy Roman Empire: German princes, bishops and towns', 'Kutsal Roma İmparatorluğu: Alman prensleri, piskoposları ve şehirleri', EMPIRE);
const empire = zone('empire-1400', 'empire', 'Holy Roman Empire: German princes, bishops and towns', 'Kutsal Roma İmparatorluğu: Alman prensleri, piskoposları ve şehirleri', EMPIRE);
const OUT = [austria, hungary, poland, order, denmark, empire];
const withUnion = ids => ids.map(id => id === poland ? union : id);

// the war years: Sigismund's side holds the crown lands outside the Hussite unions
const royal = (year, en, tr) => zone(`royal-${year}`, 'royalists', en, tr, CROWN);

const p1420 = [
  zone('prague-1420', 'prague', 'Prague and the Hussite towns allied with it, 1420', 'Prag ve onunla birleşen Husçu şehirler, 1420', around(['prague', 'slany', 'louny', 'zatec'], 12)),
  zone('tabor-1420', 'taborites', 'Tábor, Písek and the country around them, 1420', 'Tábor, Písek ve çevreleri, 1420', around(['tabor', 'usti_sez', 'pisek'], 12)),
  zone('oreb-1420', 'orebites', 'The Orebites of Hradec Králové, 1420', 'Hradec Králové’nin Orebçileri, 1420', around(['hradec'], 14)),
  royal('1420', 'Lands loyal to Sigismund or not yet committed, 1420: Plzeň, Kutná Hora, the Rožmberk lands and the royal castles in Bohemia, with Moravia, Silesia and the Lusatias',
    'Sigismund’a bağlı ya da henüz taraf tutmamış topraklar, 1420: Bohemya’da Plzeň, Kutná Hora, Rožmberk toprakları ve kraliyet kaleleri, ayrıca Moravya, Silezya ve Lusatyalar'),
];
const p1420b = [
  'prague-1420', 'oreb-1420',
  zone('tabor-1420b', 'taborites', 'Tábor and the towns of the south it holds by the end of 1420', '1420 sonunda Tábor ve elindeki güney şehirleri',
    around(['tabor', 'usti_sez', 'pisek', 'vodnany', 'prachatice'], 10)),
  royal('1420b', 'Lands loyal to Sigismund, late 1420: Plzeň, Kutná Hora, the Rožmberk lands and the royal castles in Bohemia, with Moravia, Silesia and the Lusatias',
    'Sigismund’a bağlı topraklar, 1420 sonu: Bohemya’da Plzeň, Kutná Hora, Rožmberk toprakları ve kraliyet kaleleri, ayrıca Moravya, Silezya ve Lusatyalar'),
];
// Tábor's towns in the south, and in the west the towns allied with it from 1421 that join its union in 1425
const TABOR_SOUTH = around(['tabor', 'usti_sez', 'pisek', 'vodnany', 'prachatice'], 10), TABOR_SOUTH_1423 = around(['tabor', 'usti_sez', 'pisek', 'vodnany', 'prachatice', 'pelhrimov'], 10);
const KLATOVY = around(['klatovy', 'domazlice', 'susice'], 9), TABOR_WEST = around(['klatovy', 'domazlice', 'susice', 'stribro', 'tachov'], 8);
const p1421 = [
  zone('prague-1421', 'prague', 'Prague and the towns of the Prague union, 1421', 'Prag ve Prag birliğinin şehirleri, 1421',
    around(['prague', 'beroun', 'slany', 'louny', 'zatec', 'litomerice', 'melnik', 'boleslav', 'nymburk', 'kolin', 'kutna', 'caslav', 'kourim', 'brod'], 9)),
  zone('tabor-1421', 'taborites', 'Tábor and the towns of the south, with Klatovy, Domažlice and Sušice in the west, 1421',
    'Tábor ve güney şehirleri, batıda Klatovy, Domažlice ve Sušice ile, 1421', pieces(TABOR_SOUTH, KLATOVY)),
  zone('oreb-1421', 'orebites', 'The Orebites of eastern Bohemia, 1421', 'Doğu Bohemya’nın Orebçileri, 1421', around(['hradec', 'jaromer', 'dvur', 'chrudim', 'myto'], 9)),
  royal('1421', 'Lands loyal to Sigismund, 1421: the Plzeň Landfrieden, the Rožmberk lands, Most, Karlštejn and other castles in Bohemia, with Moravia, Silesia and the Lusatias',
    'Sigismund’a bağlı topraklar, 1421: Bohemya’da Plzeň Landfrieden’i, Rožmberk toprakları, Most, Karlštejn ve öteki kaleler, ayrıca Moravya, Silezya ve Lusatyalar'),
];
const p1423 = [
  zone('prague-1423', 'prague', 'Prague and its union under Sigismund Korybut, 1422–1424', 'Sigismund Korybut yönetiminde Prag ve birliği, 1422–1424',
    around(['prague', 'beroun', 'slany', 'louny', 'zatec', 'litomerice', 'melnik', 'boleslav', 'nymburk', 'kolin', 'kutna', 'kourim', 'brod'], 9)),
  zone('tabor-1423', 'taborites', 'Tábor and the towns of the south, with Klatovy, Domažlice and Sušice in the west, 1423–1424',
    'Tábor ve güney şehirleri, batıda Klatovy, Domažlice ve Sušice ile, 1423–1424', pieces(TABOR_SOUTH_1423, KLATOVY)),
  zone('oreb-1423', 'orebites', 'Žižka’s Lesser Tábor, the Orebite towns of eastern Bohemia, 1423–1424', 'Žižka’nın Küçük Tábor’u, Doğu Bohemya’nın Orebçi şehirleri, 1423–1424',
    around(['hradec', 'jaromer', 'dvur', 'trutnov', 'caslav', 'myto'], 9)),
  royal('1423', 'Lands of the royalist and Utraquist lords, 1422–1424: Plzeň, the Rožmberk lands and the lords of eastern Bohemia, with Moravia under Albert of Austria from 1423, Silesia and the Lusatias',
    'Kralcı ve Utrakist soyluların toprakları, 1422–1424: Plzeň, Rožmberk toprakları ve Doğu Bohemya soyluları, ayrıca 1423’ten sonra Avusturyalı Albrecht’in yönetimindeki Moravya, Silezya ve Lusatyalar'),
];
const p1426 = [
  zone('prague-1426', 'prague', 'Prague and the towns of the Prague union, 1425–1433', 'Prag ve Prag birliğinin şehirleri, 1425–1433',
    around(['prague', 'beroun', 'slany', 'litomerice', 'melnik', 'boleslav', 'nymburk', 'brod'], 9)),
  zone('zatec-1426', 'zatec', 'The union of Žatec and Louny, 1425–1433', 'Žatec ve Louny birliği, 1425–1433', around(['zatec', 'louny'], 9)),
  zone('tabor-1426', 'taborites', 'The Tábor union, 1425–1433: the towns of the south, and in the west Klatovy, Domažlice, Sušice, Stříbro from 1426 and Tachov from 1427',
    'Tábor birliği, 1425–1433: güney şehirleri, batıda Klatovy, Domažlice, Sušice, 1426’dan sonra Stříbro ve 1427’den sonra Tachov', pieces(TABOR_SOUTH_1423, TABOR_WEST)),
  zone('orphans-1426', 'orebites', 'The towns of the Orphans, 1425–1433', 'Yetimlerin şehirleri, 1425–1433',
    around(['hradec', 'jaromer', 'dvur', 'trutnov', 'nachod', 'caslav', 'kolin', 'kutna', 'kourim', 'myto', 'litomysl'], 8)),
  royal('1426', 'Lands loyal to Sigismund, 1425–1433: the Plzeň Landfrieden, the Rožmberk lands, Most, Karlštejn and other castles in Bohemia, with Moravia under Albert of Austria, Silesia and the Lusatias',
    'Sigismund’a bağlı topraklar, 1425–1433: Bohemya’da Plzeň Landfrieden’i, Rožmberk toprakları, Most, Karlštejn ve öteki kaleler, ayrıca Avusturyalı Albrecht’in yönetimindeki Moravya, Silezya ve Lusatyalar'),
];
const p1434 = [
  zone('prague-1434', 'prague', 'The lords’ league and the Old Town of Prague, May 1434', 'Soylular birliği ve Prag Eski Şehri, Mayıs 1434',
    around(['prague', 'beroun', 'slany', 'melnik', 'boleslav', 'litomerice', 'zatec', 'louny'], 9)),
  zone('tabor-1434', 'taborites', 'The Tábor union with the field armies, 1434: the towns of the south, and in the west Klatovy, Domažlice, Sušice, Stříbro and Tachov',
    'Sahra ordularıyla birlikte Tábor birliği, 1434: güney şehirleri, batıda Klatovy, Domažlice, Sušice, Stříbro ve Tachov', pieces(TABOR_SOUTH_1423, TABOR_WEST)),
  zone('orphans-1434', 'orebites', 'The towns of the Orphans, with the field armies, 1434', 'Sahra ordularıyla birlikte Yetimlerin şehirleri, 1434',
    around(['hradec', 'jaromer', 'dvur', 'trutnov', 'nachod', 'caslav', 'kolin', 'kutna', 'kourim', 'nymburk', 'myto', 'litomysl'], 8)),
  royal('1434', 'Plzeň, the Rožmberk lands and the royal castles, with the lords’ league in 1434, and Moravia, Silesia and the Lusatias',
    '1434’te soylular birliğinin yanındaki Plzeň, Rožmberk toprakları ve kraliyet kaleleri, ayrıca Moravya, Silezya ve Lusatyalar'),
];
const p1436 = [
  zone('tabor-1436', 'taborites', 'Tábor, until it submits to Sigismund in 1436', '1436’da Sigismund’a boyun eğene dek Tábor', around(['tabor', 'usti_sez'], 10)),
  royal('1436', 'Lands of the Bohemian crown under Sigismund, from August 1436', 'Ağustos 1436’dan sonra Sigismund’un Bohemya tacı toprakları'),
];
const p1458 = [
  zone('bohemia-1458', 'prague', 'Kingdom of Bohemia under George of Poděbrady, 1458–1471', 'Poděbradlı George’un Bohemya Krallığı, 1458–1471', BOHEMIA),
  zone('hungary-1458', 'hungary', 'Kingdom of Hungary under Matthias Corvinus, 1458–1490, with Moravia, Silesia and the Lusatias from 1469',
    'Matthias Corvinus’un Macaristan Krallığı, 1458–1490, 1469’dan sonra Moravya, Silezya ve Lusatyalar ile', U(HUNGARY, MORAVIA, SILESIA, LUSATIA)),
];
const OUT1458 = OUT.filter(id => id !== hungary && id !== order);

// --- the pages ---
const war = (period) => [...period, ...OUT];
const PAGES = {
  'crown-lands': [...lands, austria, hungary, union, prussia, denmark, empire1378],
  grunwald: [...lands, austria, hungary, poland, lithuania, order, denmark, empire],
  ...Object.fromEntries(['trocnov', 'bethlehem', 'indulgences', 'constance', 'chalice'].map(p => [p, [crown, ...OUT]])),
  ...Object.fromEntries(['plzen', 'tabor', 'sudomer', 'crusade-1420', 'coronation'].map(p => [p, war(p1420)])),
  'south-bohemia': war(p1420b),
  ...Object.fromEntries(['west-bohemia', 'rabi', 'caslav', 'zatec', 'kutna-hora'].map(p => [p, war(p1421)])),
  ...Object.fromEntries(['korybut', 'horice', 'hungary-1423', 'skalice', 'malesov', 'pribyslav'].map(p => [p, war(p1423)])),
  ...Object.fromEntries(['field-armies', 'usti', 'tachov', 'austria-silesia', 'pressburg', 'franconia', 'trnava', 'domazlice', 'brandenburg', 'basel',
    'plzen-siege'].map(p => [p, war(p1426)])),
  baltic: withUnion(war(p1426)),
  ...Object.fromEntries(['lords-league', 'lipany'].map(p => [p, war(p1434)])),
  compacts: war(p1436),
  podebrady: [...p1458, ...OUT1458],
  // city views, the wagon fort diagram and the page on Žižka's memory show none
  prague: [], defenestration: [], 'prague-1419': [], vitkov: [], vysehrad: [], 'wagon-fort': [], memory: [],
};

// --- each page lists the zones that reach into its frame, so its legend names what the reader sees ---
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const BBOX = Object.fromEntries(walk(path.join(story, 'pages')).filter(f => f.endsWith('page.yaml')).map(f => {
  const m = fs.readFileSync(f, 'utf8').match(/^bbox:\s*\[([^\]]*)\]/m);
  return [path.basename(path.dirname(f)).replace(/^\d+-/, ''), m ? m[1].split(',').map(Number) : null];
}));
for (const [p, ids] of Object.entries(PAGES)) {
  if (!BBOX[p]) throw new Error(`no page ${p}`);
  // the map shows more than the frame on a wide or tall screen: keep the zones within half a frame of it
  const [w, s_, e, n] = BBOX[p], dx = (e - w) / 2, dy = (n - s_) / 2, frame = turf.bboxPolygon([w - dx, s_ - dy, e + dx, n + dy]);
  PAGES[p] = ids.filter(id => turf.booleanIntersects(Z[id].shape, frame));
}

// --- write: one Polygon per zone, its largest piece, or a MultiPolygon for a zone drawn in pieces; smaller pieces
// are logged so a lost part stands out ---
const dir = path.join(story, 'shared', 'zones');
fs.mkdirSync(dir, { recursive: true });
for (const f of fs.readdirSync(dir)) if (f.endsWith('.geojson')) fs.rmSync(path.join(dir, f));
const used = [...new Set(Object.values(PAGES).flat())];
const round = ring => ring.map(([x, y]) => [+x.toFixed(4), +y.toFixed(4)]);
// a hole under 1 km2 is a sliver left where the joined lands meet
const solid = rings => rings.filter((r, i) => !i || km2(turf.polygon([r])) >= 1);
for (const id of used) {
  const z = Z[id]; if (!z) throw new Error(`no zone ${id}`);
  let g = z.shape.geometry;
  if (g.type === 'MultiPolygon') {
    const parts = g.coordinates.map(c => ({ c, a: km2(turf.polygon(c)) })).sort((a, b) => b.a - a.a);
    const kept = z.shape.properties?.pieces ? parts.filter(p => p.a > 20) : parts.slice(0, 1);
    const lost = parts.filter(p => !kept.includes(p) && p.a > 20);
    if (lost.length) console.log(`  ${id}: kept ${kept.map(p => Math.round(p.a)).join(', ')} km2, dropped ${lost.map(p => Math.round(p.a)).join(', ')} km2`);
    g = kept.length > 1 ? { type: 'MultiPolygon', coordinates: kept.map(p => p.c) } : { type: 'Polygon', coordinates: kept[0].c };
  }
  const geometry = { type: g.type, coordinates: g.type === 'Polygon' ? solid(g.coordinates).map(round) : g.coordinates.map(p => solid(p).map(round)) };
  fs.writeFileSync(path.join(dir, id + '.geojson'), JSON.stringify({ type: 'Feature', properties: { family: z.family, name: z.name.en }, geometry }) + '\n');
}
fs.writeFileSync(path.join(story, '.plans', 'zones.yaml'), '# Zones per page, written by .plans/zones.mjs. Close views and phase pages show none.\n'
  + Object.entries(PAGES).map(([p, ids]) => `${p}: [${ids.join(', ')}]`).join('\n') + '\n');
fs.mkdirSync(path.join(story, '.i18n-parts'), { recursive: true });
fs.writeFileSync(path.join(story, '.i18n-parts', 'zones.tr.yaml'), used.map(id => `zones.${id}.name: ${JSON.stringify(Z[id].name.tr)}`).join('\n') + '\n');
console.log(`${used.length} zones on ${Object.values(PAGES).filter(l => l.length).length} pages`);
