// The Nile, 1 to 3 August 1798, in Aboukir Bay. Brueys's 13 ships of the line lie at anchor in a line about 2.6 km
// long running south-east from a point 2.2 km south-east of Aboukir Island, along the edge of the shoals, with four
// frigates on the landward side. Ships lie about 215 m apart, bow to stern. The hulls are drawn 150 m long, about
// two and a half times their real length, so they show at the story's zoom.
// Frame: origin on Guerrier at the head of the line, u south-east along the line, w south-west towards the shore.
import { frame, writePlan } from './lib.mjs';

const f = frame([30.1203, 31.336], 135), P = f.p, BOW = f.face(180);
const G = 'pages/030-egypt/030-nile';
const bbox = f.box([[-3000, -2100], [3200, 1500]], 0);
const SAND = '#c9b88a';
const shoals = [
  { side: SAND, path: f.path([[-2900, 250], [-2300, 0], [-1700, -330]]), width: 480, id: 'shoals', name: 'Shoals of Aboukir Bay' },
  { side: SAND, path: f.path([[-2000, 350], [-1000, 700], [0, 800], [1200, 820], [2400, 820], [3300, 780]]), width: 300, id: 'shoals', name: 'Shoals of Aboukir Bay' },
];
const island = { side: 'france', type: 'camp', at: P(-2190, 0), width: 140, depth: 140, facing: BOW, id: 'island-fort', name: 'Fort on Aboukir Island, with French guns and mortars' };
// a column of n ships bow to stern from u0 to u1, or one ship when u1 is left out
const ships = (side, u0, u1, w, n, id, name, extra = {}) => ({ side, type: 'ships', at: P((u0 + (u1 ?? u0)) / 2, w), width: 94, depth: Math.abs((u1 ?? u0) - u0) + 150,
  count: n, rows: n, facing: BOW, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });

// --- overview: Nelson's search ---
writePlan(`${G}/010-nile`, {
  routes: {
    'nelson-1798': { name: 'Nelson’s search from Toulon by Naples to Alexandria, June 1798',
      path: [[6.2, 42.7], [10.3, 42.6], [12.9, 40.9], [14.2, 40.7], [15.62, 38.2], [15.4, 36.6], [20.0, 34.2], [25.0, 32.5], [29.85, 31.32]] },
    'nelson-coron-1798': { name: 'Nelson returns by Anatolia and Syracuse, then by Coron to Aboukir Bay, July 1798', offset: 6,
      path: [[29.85, 31.4], [30.2, 34.0], [29.0, 35.9], [25.0, 35.8], [20.0, 36.4], [15.35, 37.0], [19.0, 36.6], [21.95, 36.75], [24.0, 35.0], [28.0, 32.4], [30.1, 31.4]] },
  },
  markers: {
    'nile-naples': { lnglat: [14.25, 40.84], icon: 'anchor', color: 'britain', label: 'Naples', note: 'News of the French at Malta' },
    'nile-alexandria': { lnglat: [29.9, 31.2], icon: 'anchor', color: 'britain', label: 'Alexandria', note: 'No French there, 28 June' },
    'nile-syracuse': { lnglat: [15.29, 37.07], icon: 'anchor', color: 'britain', label: 'Syracuse', note: 'Supplies, 19 to 24 July' },
    'nile-coron': { lnglat: [21.96, 36.8], icon: 'anchor', color: 'britain', label: 'Coron', note: 'French in Egypt, 28 July' },
  },
});

// French ships at anchor, the line bowed slightly seawards in the centre
const frVan = (name) => ships('france', 0, 860, 0, 5, 'van', name);
const frCentre = (name) => ships('france', 1075, 1505, -120, 3, 'centre', name);
const frRear = (name) => ships('france', 1720, 2580, 0, 5, 'rear', name);

// --- 18:00 to 19:30: round the head of the line ---
writePlan(`${G}/020-nile-van`, {
  bbox,
  emblem: {
    works: shoals,
    units: [
      island,
      frVan('French van: Guerrier, Conquérant, Spartiate, Aquilon and Peuple Souverain'),
      frCentre('French centre: Franklin, Orient with Brueys, and Tonnant'),
      frRear('French rear under Villeneuve: Heureux, Mercure, Guillaume Tell, Généreux and Timoléon'),
      ships('france', 500, 2300, 330, 4, 'frigates', 'French frigates inshore: Sérieuse, Artémise, Diane and Justice', { width: 70 }),
      ships('britain', -60, 900, 160, 5, 'inshore', 'Goliath, Zealous, Audacious, Theseus and Orion, inside the French line'),
      ships('britain', 430, 860, -190, 3, 'nelson', 'Vanguard with Nelson, Minotaur and Defence, on the seaward side'),
      ships('britain', 1290, 1620, -330, 2, 'centre-attack', 'Bellerophon and Majestic, against the French centre'),
      ships('britain', -1480, undefined, -620, 1, 'culloden', 'Culloden under Troubridge, aground on the shoal'),
      ships('britain', -2900, -2650, -1350, 2, 'stragglers', 'Swiftsure and Alexander, still coming up'),
    ],
    arrows: [
      arrow('britain', [[-1700, -1300], [-650, -450], [-250, 120], [200, 240], [520, 240]], 110, 'goliath-track', 'Goliath leads five ships round the head of the line and down its landward side'),
      arrow('britain', [[-1600, -1600], [-450, -750], [400, -260]], 110, 'nelson-track', 'Vanguard, Minotaur and Defence anchor on the seaward side'),
      arrow('britain', [[-1300, -1850], [300, -950], [1250, -420]], 110, 'centre-track', 'Bellerophon and Majestic sail on to the French centre'),
    ],
    clashes: [{ at: P(60, 80), size: 110 }, { at: P(330, -95), size: 110 }, { at: P(650, 80), size: 110 }, { at: P(1290, -225), size: 110 }],
  },
  markers: {
    'nile-van-goliath': mark(-450, 420, 'Goliath', 'Foley crosses the head of the line', 'britain', 'ship'),
    'nile-van-nelson': mark(600, -560, 'Nelson', 'In Vanguard', 'britain'),
    'nile-van-brueys': mark(1290, 600, 'Brueys', 'In Orient, 120 guns', 'france'),
    'nile-van-villeneuve': mark(2365, 480, 'Villeneuve', 'The rear stays at anchor', 'france'),
    'nile-van-culloden': mark(-1480, -950, 'Culloden', 'Aground on the shoal', 'britain', 'ship'),
    'nile-van-island': mark(-2190, 450, 'Aboukir Island', 'French fort and gunboats', 'france', 'flag'),
  },
});

// --- 19:30 to 22:00: the van taken, Orient on fire ---
writePlan(`${G}/030-nile-orient`, {
  bbox,
  emblem: {
    works: shoals,
    units: [
      island,
      ships('france', 0, 645, 0, 4, 'van', 'Guerrier, Conquérant, Spartiate and Aquilon, taken by 21:25'),
      ships('france', 1075, 1290, -120, 2, 'centre', 'Franklin and Orient, Orient on fire from 21:00'),
      ships('france', 1650, 2050, 260, 3, 'drifting', 'Tonnant, Heureux and Mercure, cables cut, drifting south'),
      ships('france', 2150, 2580, 0, 3, 'rear', 'Villeneuve’s ships: Guillaume Tell, Généreux and Timoléon'),
      ships('france', 1100, 2300, 330, 3, 'frigates', 'French frigates: Artémise, Diane and Justice', { width: 70 }),
      ships('britain', -60, 900, 160, 5, 'inshore', 'Zealous, Goliath, Audacious, Theseus and Orion'),
      ships('britain', 430, 1000, -200, 3, 'nelson', 'Vanguard, Minotaur and Defence'),
      ships('britain', 1180, 1400, -330, 2, 'swiftsure', 'Swiftsure and Alexander, arrived in the dark, engage Orient'),
      ships('britain', 880, undefined, 0, 1, 'leander', 'Leander in the gap, raking Franklin and Orient', { facing: f.face(90) }),
      ships('britain', 1650, undefined, -260, 1, 'majestic', 'Majestic, her captain killed, against Tonnant and Heureux'),
      ships('britain', 2650, undefined, -880, 1, 'bellerophon', 'Bellerophon, dismasted, out of the battle'),
      ships('britain', -1480, undefined, -620, 1, 'culloden', 'Culloden, still aground'),
    ],
    arrows: [
      arrow('britain', [[1290, -360], [1950, -620], [2560, -850]], 100, 'bellerophon-drift', 'Bellerophon cuts her cables and drifts away, 20:20', 'dashed'),
      arrow('britain', [[-1700, -1500], [100, -950], [1150, -470]], 110, 'swiftsure-track', 'Swiftsure and Alexander come up in the dark'),
      arrow('france', [[1520, -60], [1600, 120], [1680, 220]], 90, 'drift', 'Tonnant, Heureux and Mercure cut their cables to escape the burning Orient', 'dashed'),
    ],
    clashes: [{ at: P(1180, -230), size: 110 }, { at: P(1640, -150), size: 110 }, { at: P(980, -60), size: 110 }, { at: P(1290, -120), size: 260 }],
  },
  markers: {
    'nile-orient-orient': mark(1290, 520, 'Orient', 'Explodes at 22:00', 'france', 'skull'),
    'nile-orient-brueys': mark(1400, -950, 'Brueys', 'Killed on deck', 'france', 'skull'),
    'nile-orient-nelson': mark(600, -560, 'Nelson', 'Wounded, returns to the deck', 'britain'),
    'nile-orient-van': mark(250, 480, 'French van', 'Struck by 21:25', 'france', 'flag'),
    'nile-orient-bellerophon': mark(2650, -1150, 'Bellerophon', 'Over 200 casualties', 'britain', 'ship'),
  },
});

// --- 2 and 3 August: the rear escapes or runs aground ---
writePlan(`${G}/040-nile-morning`, {
  bbox,
  emblem: {
    works: shoals,
    units: [
      island,
      ships('france', 0, 1075, 0, 6, 'prizes', 'Prizes: Guerrier, Conquérant, Spartiate, Aquilon, Peuple Souverain and Franklin'),
      ships('france', 1850, 2050, 700, 2, 'aground', 'Heureux and Mercure, aground on the shoal, surrender'),
      ships('france', 2600, 2850, 760, 2, 'ashore', 'Tonnant, run ashore, and Timoléon, burned by her crew'),
      ships('france', 2050, 2700, -1650, 4, 'escape', 'Villeneuve escapes with Guillaume Tell, Généreux and the frigates Justice and Diane', { facing: f.face(270) }),
      ships('britain', -60, 1000, -200, 6, 'fleet', 'Vanguard, Minotaur, Defence, Swiftsure, Audacious and Orion, at anchor by the prizes'),
      ships('britain', 1550, 2150, 380, 5, 'southern', 'Alexander, Majestic, Goliath, Theseus and Leander, against the French rear'),
      ships('britain', 1700, undefined, -1900, 1, 'zealous', 'Zealous, pursuing alone', { facing: f.face(270) }),
      ships('britain', 2700, undefined, -880, 1, 'bellerophon', 'Bellerophon, under repair'),
      ships('britain', -1480, undefined, -620, 1, 'culloden', 'Culloden, still aground'),
    ],
    arrows: [
      arrow('france', [[2300, -60], [2450, -700], [2400, -1300], [2300, -2050]], 120, 'escape', 'Villeneuve takes his four ships out to sea, 11:00'),
      arrow('britain', [[300, -350], [1000, -1300], [1650, -1750]], 100, 'zealous-pursuit', 'Zealous pursues and is driven off'),
      arrow('britain', [[1600, 0], [1700, 200], [1800, 320]], 100, 'southern-attack', 'The British ships attack the stranded French'),
    ],
    clashes: [{ at: P(1950, 560), size: 110 }, { at: P(2000, -1800), size: 110 }],
  },
  markers: {
    'nile-morning-villeneuve': mark(2650, -2050, 'Villeneuve', 'Escapes with four ships', 'france'),
    'nile-morning-zealous': mark(1350, -2100, 'Zealous', 'Pursues alone', 'britain', 'ship'),
    'nile-morning-heureux': mark(1950, 1050, 'Heureux and Mercure', 'Aground, surrender', 'france', 'flag'),
    'nile-morning-timoleon': mark(2850, 1100, 'Timoléon', 'Burned by her crew, 3 August', 'france', 'skull'),
    'nile-morning-artemise': mark(1300, 650, 'Artémise', 'Set on fire and abandoned', 'france', 'skull'),
  },
});

console.log('nile: bbox', JSON.stringify(bbox), 'battle at', JSON.stringify(P(1290, -150)));
