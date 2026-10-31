// Ankara, 20 or 28 July 1402: the Ottomans north on the low hills west of the Çubuk plain, Timur south on the plain
// with his camp by the stream. The ground comes from elevation data, the order of the lines from the accounts (README.md).
// Frame: origin at the front of the Ottoman centre, u east along the lines, w south from the Ottomans to Timur.
import { frame, writePlan } from './lib.mjs';

const f = frame([32.925, 40.14], 90), P = f.p, OTT = f.face(90), TIM = f.face(270);
const G = 'pages/050-timur/040-ankara';
// from the ridge behind the Ottomans to Timur's main body, about 10.4 km by 10.9 km: the same on every phase page
const bbox = [P(-5000, 0)[0], P(0, 4700)[1], P(5400, 0)[0], P(0, -6200)[1]];
// the Çubuk stream along its valley floor, traced from the elevation data from Çubuk south to the reservoir above Ankara
const CUBUK = [[33.026, 40.26], [33.028, 40.245], [33.027, 40.235], [33.028, 40.225], [33.03, 40.215], [33.027, 40.205],
  [33.022, 40.195], [33.011, 40.188], [33.011, 40.178], [33.01, 40.168], [33.006, 40.16], [32.993, 40.155], [32.988, 40.148],
  [32.978, 40.14], [32.972, 40.132], [32.972, 40.122], [32.972, 40.112], [32.97, 40.103], [32.966, 40.095], [32.963, 40.087],
  [32.957, 40.078], [32.955, 40.068], [32.957, 40.058], [32.953, 40.048], [32.95, 40.035]];
const stream = width => [{ path: CUBUK, width, id: 'cubuk', name: 'The Çubuk stream, which flows south to Ankara. Both armies draw their water from it and the streams that join it' }];
const unit = (side, type, u, w, width, depth, id, name, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing: ['ottomans', 'serbia'].includes(side) ? OTT : TIM, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
// a marker with its icon at (u, w): labels hang about 600 m below the icon, so the icons sit north of their blocks
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });
// the bearing of a move from one local point to another, for units that turn
const toward = ([u0, w0], [u1, w1]) => f.face(Math.round(Math.atan2(w1 - w0, u1 - u0) * 180 / Math.PI));

const CATALTEPE = [-400, -4100];

// the Ottoman army
const SERBS = unit('serbia', 'knights', -2200, -350, 1700, 600, 'serbs', 'Stefan Lazarević on the right wing with his Serbian horsemen in black armour, his brother Vuk and Đurađ and Grgur Branković. Doukas gives them 5,000 men');
const BAYEZID = unit('ottomans', 'infantry', 0, -400, 1500, 700, 'bayezid', 'Bayezid in the centre on a low rise, with about 10,000 janissaries, the azaps in front of them, his sons İsa, Musa and Mustafa and the grand vizier Çandarlı Ali Pasha');
const SULEYMAN = unit('ottomans', 'cavalry', 1950, -350, 1600, 600, 'suleyman', 'Süleyman Çelebi on the left wing with the sipahis of Anatolia. Nizam ad-Din Shami and İsmail Hakkı Uzunçarşılı put the Rumelian troops here and the Anatolian troops on the right beside the Serbs');
const BEYLIKS = unit('beyliks', 'cavalry', 3550, -350, 1200, 600, 'beyliks', 'The troops of Aydın, Saruhan, Menteşe and Germiyan, lands Bayezid annexed in 1390, on the left wing with Süleyman. The accounts place them no closer', { facing: OTT });
const MEHMED = unit('ottomans', 'cavalry', 600, -2700, 1500, 500, 'mehmed', 'Mehmed Çelebi with the reserve behind the centre');
const TATARS = unit('tatars', 'cavalry', 3700, -1900, 1400, 500, 'tatars', 'The Black Tatars, horse archers settled in Anatolia, behind the left wing. Spencer Tucker counts a quarter of Bayezid’s army as Tatars', { facing: OTT });
const HILL = unit('ottomans', 'infantry', ...CATALTEPE, 900, 400, 'cataltepe', 'Troops Bayezid leaves against an encirclement on Çataltepe, about 4 km behind the line in Alexandrescu-Dersca’s account. Drawn on the ridge that fits that distance');
// Timur's army
const ELEPHANTS = unit('timurids', 'elephants', 0, 2000, 1400, 250, 'elephants', 'Thirty-two war elephants brought from India, in front of Timur’s centre', { count: 8 });
const TIMUR = unit('timurids', 'cavalry', 0, 3000, 2200, 900, 'timur', 'Timur in the centre with the main body. The accounts put his grandson Muhammad Sultan here or with the right wing');
const MIRANSHAH = unit('timurids', 'cavalry', 2800, 2700, 2200, 800, 'miranshah', 'Timur’s son Miran Shah with the right wing');
const SHAHRUKH = unit('timurids', 'cavalry', -2800, 2700, 2200, 800, 'shahrukh', 'Timur’s son Shah Rukh with the left wing, with his grandson Khalil Sultan');

// --- overview: the plain north-east of Ankara, the camps and the approach of both armies ---
const TIMUR_CAMP = [2800, 4800], BAYEZID_CAMP = [-1800, -1600];
writePlan(`${G}/010-ankara`, {
  bbox: [32.74, 39.86, 33.14, 40.22],
  emblem: { water: stream(160) },
  markers: {
    'ankara-timur-camp': { lnglat: P(...TIMUR_CAMP), icon: 'flag', color: 'timurids', label: 'Timur’s camp', note: 'By the Çubuk stream' },
    'ankara-bayezid-camp': { lnglat: P(...BAYEZID_CAMP), icon: 'flag', color: 'ottomans', label: 'Bayezid’s camp', note: 'Near Melikşah' },
    'ankara-ravli': { lnglat: [33.087, 40.134], icon: 'tent', color: 'ottomans', label: 'Ravlı (Akyurt)', note: 'Bayezid’s first camp' },
  },
  show: ['ankara-1402'],
  routes: {
    'timur-cubuk-1402': { color: 'timurids', name: 'Timur from Ankara to the Çubuk plain, July 1402',
      path: [[32.866, 39.946], [32.88, 39.962], [32.9, 39.985], [32.925, 40.008], [32.945, 40.03], [32.963, 40.05], [32.972, 40.068], [32.97, 40.084], P(...TIMUR_CAMP)] },
    'bayezid-cubuk-1402': { color: 'ottomans', name: 'Bayezid from Ravlı to Melikşah, July 1402',
      path: [[33.087, 40.134], [33.06, 40.14], [33.03, 40.148], [33.0, 40.153], [32.975, 40.156], [32.95, 40.156], P(...BAYEZID_CAMP)] },
  },
});

// --- the morning: the lines, and the first attack on the Ottoman left ---
writePlan(`${G}/020-ankara-lines`, {
  bbox,
  emblem: {
    water: stream(80),
    units: [SERBS, BAYEZID, SULEYMAN, BEYLIKS, MEHMED, TATARS, HILL, ELEPHANTS, TIMUR, MIRANSHAH, SHAHRUKH,
      unit('timurids', 'light', 2800, 1300, 1500, 350, 'vanguard', 'Horse archers of the vanguard under Timur’s grandson Abu Bakr. In later Turkish accounts they open the battle against the Ottoman left')],
    arrows: [
      arrow('timurids', [[2800, 1100], [2700, 600], [2400, 100]], 90, 'vanguard-fire', 'The vanguard shoots into the Ottoman left. Later Turkish accounts have Timur’s right open the battle. Other accounts have the Ottomans attack first into swarms of arrows', 'fire'),
      arrow('ottomans', [[1950, 0], [2100, 500], [2400, 900], [2650, 1100]], 160, 'left-attack', 'The Ottoman left charges and drives the vanguard back'),
    ],
    clashes: [{ at: P(2650, 1060), size: 280 }],
  },
  markers: {
    'ankara-lines-bayezid': mark(0, -1950, 'Bayezid', 'With the janissaries', 'ottomans'),
    'ankara-lines-lazarevic': mark(-2200, -1800, 'Stefan Lazarević', 'Right wing, with the Serbs', 'serbia'),
    'ankara-lines-suleyman': mark(1950, -1800, 'Süleyman Çelebi', 'Left wing', 'ottomans'),
    'ankara-lines-mehmed': mark(-1050, -3200, 'Mehmed Çelebi', 'The reserve', 'ottomans'),
    'ankara-lines-timur': mark(0, 3850, 'Timur', 'In the centre', 'timurids'),
    'ankara-cataltepe': mark(CATALTEPE[0], CATALTEPE[1] - 1250, 'Çataltepe', 'Bayezid’s last stand, after Bıyıktay', 'ottomans', 'mountain'),
  },
});

// --- the Tatars and the troops of the beyliks go over to Timur, Süleyman leaves, the Serbs fight their way out ---
const SERBS_OUT = [-3500, -1900], BEYLIKS_OVER = [2800, 2500];
writePlan(`${G}/030-ankara-desertion`, {
  bbox,
  emblem: {
    water: stream(80),
    units: [
      unit('serbia', 'knights', ...SERBS_OUT, 1300, 500, 'serbs', 'Stefan Lazarević’s Serbs cut through the Timurid ranks three times. Bayezid refuses to break out with them, and they fight their way off the field', { facing: toward([-2200, -350], SERBS_OUT) }),
      BAYEZID,
      unit('ottomans', 'cavalry', 1800, -1000, 1100, 500, 'left-wing', 'What remains of the Ottoman left gives way and falls back on the centre'),
      MEHMED,
      unit('tatars', 'cavalry', 3700, -1900, 1400, 500, 'tatars', 'The Black Tatars change sides and shoot into the Ottoman left from behind', { facing: OTT }),
      unit('beyliks', 'cavalry', ...BEYLIKS_OVER, 1200, 600, 'beyliks', 'The troops of Aydın, Saruhan, Menteşe and Germiyan see the banners of their old beys in Timur’s army and ride over to them'),
      HILL,
      unit('timurids', 'elephants', 0, 1000, 1400, 250, 'elephants', 'Timur’s elephants and the armoured horsemen of Transoxiana advance against the Ottoman centre', { count: 8 }),
      unit('timurids', 'cavalry', 0, 2200, 2200, 900, 'timur', 'Timur in the centre with the main body'),
      unit('timurids', 'cavalry', 1700, 900, 2000, 700, 'miranshah', 'Miran Shah’s right wing presses the Ottoman left'),
      unit('timurids', 'cavalry', -2800, 1000, 2200, 800, 'shahrukh', 'Shah Rukh’s left wing, reinforced, fights the Serbs and the Ottoman right'),
    ],
    arrows: [
      arrow('beyliks', [[3550, -50], [3700, 700], [3500, 1500], [3000, 2150]], 150, 'beyliks-over', 'The troops of the beyliks ride over to Timur’s side. Later Turkish accounts have the Anatolian sipahis of the Ottoman right go over in the afternoon'),
      arrow('tatars', [[3300, -1650], [2800, -1450], [2300, -1250]], 90, 'tatars-fire', 'The Tatars shoot into the Ottoman left from behind', 'fire'),
      arrow('timurids', [[1700, 550], [1750, 0], [1800, -700]], 170, 'miranshah-attack', 'Timur’s right wing breaks the Ottoman left'),
      arrow('ottomans', [[2100, -1300], [2500, -2600], [2300, -3800], [1400, -5200], [-500, -6400], [-3000, -7200], [-5500, -7700]], 120, 'suleyman-leaves', 'Süleyman leaves the field for Bursa with the grand vizier Çandarlı Ali Pasha and the commander of the janissaries', 'dashed'),
      arrow('serbia', [[-2200, -650], [-2600, -1000], [-3100, -1500], [-3400, -1700]], 150, 'serbs-out', 'The Serbs break out to the north-west. Stefan is wounded and Grgur Branković taken. Laonikos Chalkokondyles praises their fight', 'dashed'),
    ],
    clashes: [{ at: P(1800, -650), size: 280 }, { at: P(-2300, 300), size: 280 }],
  },
  markers: {
    'ankara-desertion-bayezid': mark(0, -1950, 'Bayezid', 'Holds the centre', 'ottomans'),
    'ankara-desertion-lazarevic': mark(-3700, -3600, 'Stefan Lazarević', 'Fights his way out', 'serbia'),
    'ankara-desertion-suleyman': mark(2950, -3600, 'Süleyman Çelebi', 'Leaves the field', 'ottomans'),
    'ankara-desertion-tatars': mark(3700, -1150, 'Black Tatars', 'Change sides', 'tatars', 'swords'),
    'ankara-desertion-beyliks': mark(BEYLIKS_OVER[0], 3350, 'Troops of the beyliks', 'Go over to their old beys', 'beyliks', 'swords'),
  },
  show: ['ankara-cataltepe'],
});

// --- evening: Bayezid on the hill, surrounded, breaks out at sunset and is taken ---
const RING = 'Timur’s troops surround the hill: Shah Rukh, sent to take Bayezid, with Miran Shah, Sultan Husayn and Süleyman Shah, joined by the horsemen back from the pursuit';
writePlan(`${G}/040-ankara-hill`, {
  bbox,
  emblem: {
    water: stream(80),
    units: [
      unit('ottomans', 'infantry', ...CATALTEPE, 1000, 500, 'bayezid', 'Bayezid with a few thousand janissaries on the hill until sunset. Bıyıktay names the hill Çataltepe. Drawn on the ridge about 4 km behind the Ottoman line'),
      unit('timurids', 'cavalry', -2000, -4000, 1400, 500, 'ring', RING, { facing: f.face(0) }),
      unit('timurids', 'cavalry', 1300, -4000, 1400, 500, 'ring', RING, { facing: f.face(180) }),
      unit('timurids', 'cavalry', -400, -2800, 1800, 500, 'ring', RING),
      unit('timurids', 'cavalry', 0, 400, 2200, 900, 'timur', 'Timur with the main body. He sends his son Shah Rukh to take Bayezid'),
    ],
    arrows: [
      arrow('timurids', [[-400, -3050], [-400, -3450], [-400, -3800]], 160, 'ring-assault', 'Timur’s horsemen attack the hill again and again and are driven back by the janissaries'),
      arrow('ottomans', [[1000, -2950], [2000, -3400], [3400, -4400], [5200, -5700]], 120, 'mehmed-leaves', 'In the afternoon Mehmed Çelebi leaves the field with his troops for Amasya', 'dashed'),
      arrow('ottomans', [[-100, -4350], [500, -5200], [1800, -5900], [3800, -6600], [6000, -7300]], 120, 'bayezid-flight', 'At sunset Bayezid breaks out to the north-east with about 300 horsemen. Many die of heat and thirst', 'dashed'),
      arrow('timurids', [[1300, -4500], [2300, -5100], [4000, -5800], [6200, -6600]], 120, 'mahmud-pursuit', 'The Chagatai khan Sultan Mahmud, who rides with Timur, pursues Bayezid and takes him about 16 km from the hill, in the Turkish reconstruction'),
    ],
    clashes: [{ at: P(-400, -3800), size: 280 }],
  },
  markers: {
    'ankara-hill-bayezid': mark(-1600, -5700, 'Bayezid', 'Taken at nightfall with his son Musa', 'ottomans'),
    'ankara-hill-mehmed': mark(2700, -2500, 'Mehmed Çelebi', 'Leaves for Amasya', 'ottomans'),
    'ankara-hill-shahrukh': mark(-3400, -4000, 'Shah Rukh', 'Sent to take Bayezid', 'timurids'),
    'ankara-hill-timur': mark(0, 1250, 'Timur', 'Waits for news of Bayezid', 'timurids'),
  },
});

console.log('ankara: bbox', JSON.stringify(bbox), 'card at', JSON.stringify(P(800, 1500)), 'centre at', JSON.stringify(P(0, -400)), 'hill at', JSON.stringify(P(...CATALTEPE)));
