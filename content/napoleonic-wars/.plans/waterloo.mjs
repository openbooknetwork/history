// Waterloo, 18 June 1815. Wellington holds the ridge of Mont-Saint-Jean along the sunken Ohain road, with the farms
// of Hougoumont, La Haye Sainte and Papelotte in front; Napoleon faces him from the ridge of La Belle Alliance, and
// the Prussians come in from the east by Frichermont and Plancenoit. Overview: the retreats of 17 June.
// Frame: origin at La Haye Sainte, u north and w east, so E(x, y) places a point x metres east and y metres north.
// Farm positions are approximate, to about a hundred metres. Squares are drawn about six times their real size,
// so they can be seen at the scale of the field.
import { frame, writePlan } from './lib.mjs';

const f = frame([4.4153, 50.6767], 0), E = (x, y) => f.p(y, x);
const G = 'pages/110-hundred-days/030-waterloo';
const bbox = f.box([[-3000, -2700], [1800, 3000]], 0);
const ring = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]].map(([x, y]) => E(x, y));
const works = [
  { side: 'neutral', path: [[-2400, 280], [-1500, 330], [-800, 330], [-92, 254], [600, 300], [1200, 380], [1900, 500], [2600, 600]].map(([x, y]) => E(x, y)), width: 25, id: 'ohain-road', name: 'The sunken Ohain road along the ridge' },
  { side: 'neutral', path: [[-500, 2300], [-268, 973], [-92, 254], [40, 0], [-155, -1537], [-339, -2399], [-515, -3394]].map(([x, y]) => E(x, y)), width: 25, id: 'brussels-road', name: 'The road from Charleroi to Brussels' },
  { side: 'britain', path: ring(-1530, -620, -1290, -800), width: 30, id: 'hougoumont', name: 'Hougoumont, the château, garden and orchard' },
  { side: 'britain', path: ring(-45, 35, 30, -40), width: 25, id: 'la-haye-sainte', name: 'La Haye Sainte, held by 400 light infantry of the King’s German Legion' },
  { side: 'britain', path: ring(1170, 370, 1260, 295), width: 25, id: 'papelotte', name: 'Papelotte, fortified and garrisoned' },
];
// id and name: what the reader sees on pointing at a block; blocks that share an id highlight together
const unit = (side, type, x, y, width, depth, facing, id, name, extra = {}) => ({ side, type, at: E(x, y), width, depth, facing, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: pts.map(([x, y]) => E(x, y)), width, id, name, ...(style ? { style } : {}) });
const mark = (x, y, label, note, color, icon = 'user') => ({ lnglat: E(x, y), icon, color, label, note });
const SQ = 120; // a battalion square

// --- overview: 17 June, the retreats to Mont-Saint-Jean and Wavre ---
writePlan(`${G}/010-waterloo`, {
  routes: {
    'wellington-waterloo-1815': { name: 'Wellington withdraws from Quatre Bras to Mont-Saint-Jean, 17 June 1815',
      path: [[4.4533, 50.5714], [4.45, 50.61], [4.43, 50.645], [4.413, 50.68]] },
    'napoleon-waterloo-1815': { name: 'Napoleon follows to La Belle Alliance, 17 June 1815', offset: 6,
      path: [[4.4533, 50.5714], [4.45, 50.61], [4.43, 50.645], [4.413, 50.66]] },
    'prussians-wavre-1815': { name: 'Zieten’s and Pirch’s corps fall back by Tilly to Wavre, 16 – 17 June 1815', style: 'dashed',
      path: [[4.57, 50.54], [4.55, 50.56], [4.58, 50.6], [4.61, 50.635], [4.6, 50.715]] },
    'thielmann-wavre-1815': { name: 'Thielmann’s corps falls back by Gembloux to Wavre, 17 June 1815', style: 'dashed',
      path: [[4.6, 50.53], [4.69, 50.56], [4.68, 50.62], [4.63, 50.7], [4.61, 50.715]] },
    'grouchy-1815': { name: 'Grouchy follows the Prussians to Gembloux, 17 June 1815', offset: 6,
      path: [[4.6, 50.525], [4.65, 50.545], [4.69, 50.56]] },
  },
  markers: {
    'waterloo-genappe': { lnglat: [4.45, 50.61], icon: 'swords', color: 'britain', label: 'Genappe', note: 'Cavalry action, 17 June' },
    'waterloo-wavre': { lnglat: [4.6, 50.717], icon: 'flag', color: 'prussia', label: 'Wavre', note: 'The Prussians gather' },
    'waterloo-gembloux': { lnglat: [4.69, 50.56], icon: 'flag', color: 'france', label: 'Gembloux', note: 'Grouchy, evening of 17 June' },
    'waterloo-halle': { lnglat: [4.24, 50.73], icon: 'flag', color: 'britain', label: 'Halle', note: '17,000 men on the western flank' },
  },
});

// --- morning to 13:00: the armies deployed and the attack on Hougoumont ---
writePlan(`${G}/020-waterloo-hougoumont`, {
  bbox,
  emblem: {
    works,
    units: [
      unit('britain', 'infantry', -1250, 480, 1000, 200, 180, 'allied-right', 'Wellington’s right wing, with the British Foot Guards'),
      unit('britain', 'infantry', -420, 450, 600, 200, 180, 'alten', 'Alten’s 3rd Division in the centre'),
      unit('britain', 'infantry', 550, 430, 1100, 200, 180, 'picton', 'Picton’s division with Kempt’s and Pack’s brigades, and Bylandt’s brigade in front'),
      unit('britain', 'cavalry', -350, 850, 500, 150, 180, 'heavy-cavalry', 'Uxbridge’s heavy cavalry, the Household and Union Brigades'),
      unit('britain', 'cavalry', 500, 850, 500, 150, 180, 'heavy-cavalry', 'Uxbridge’s heavy cavalry, the Household and Union Brigades'),
      unit('france', 'infantry', -1100, -1400, 1600, 300, 10, 'reille', 'Reille’s II Corps, 13,000 infantry'),
      unit('france', 'infantry', -1450, -1060, 450, 160, 5, 'jerome', 'Jérôme’s division attacks Hougoumont'),
      unit('france', 'infantry', 800, -1250, 2000, 300, 0, 'derlon', 'd’Erlon’s I Corps, 16,000 infantry'),
      unit('france', 'artillery', 700, -850, 1600, 100, 355, 'grand-battery', 'The grand battery, 80 guns', { count: 16 }),
      unit('france', 'cavalry', 900, -1750, 1200, 250, 0, 'milhaud', 'Milhaud’s cuirassiers behind d’Erlon'),
      unit('france', 'infantry', 250, -2000, 700, 300, 0, 'lobau', 'Lobau’s VI Corps, 6,000'),
      unit('france', 'infantry', -900, -2300, 900, 400, 0, 'guard', 'The Imperial Guard, 13,000 infantry'),
    ],
    arrows: [
      arrow('france', [[-1450, -980], [-1440, -900], [-1420, -830]], 120, 'bauduin-attack', 'Bauduin’s brigade clears the wood'),
      arrow('france', [[-1650, -1000], [-1720, -760], [-1560, -560]], 110, 'soye-attack', 'The second attack reaches the north gate'),
    ],
    clashes: [{ at: E(-1420, -830), size: 120 }, { at: E(-1520, -580), size: 120 }],
  },
  markers: {
    'waterloo-18-napoleon': mark(-339, -2399, 'Napoleon', 'At Rossomme', 'france'),
    'waterloo-18-wellington': mark(-150, 1550, 'Wellington', 'Behind the centre of his line', 'britain'),
    'waterloo-18-bauduin': mark(-2500, -500, 'Bauduin', 'Killed in the first attack', 'france', 'skull'),
  },
});

// --- 13:00 to 15:00: d'Erlon's attack and the charge of the heavy cavalry ---
writePlan(`${G}/030-waterloo-derlon`, {
  bbox,
  emblem: {
    works,
    units: [
      unit('france', 'infantry', -30, -230, 450, 160, 0, 'derlon', 'd’Erlon’s I Corps, four divisions in columns, about 14,000'),
      unit('france', 'infantry', 550, 80, 280, 220, 0, 'derlon', 'd’Erlon’s I Corps, four divisions in columns, about 14,000'),
      unit('france', 'infantry', 950, 130, 280, 220, 0, 'derlon', 'd’Erlon’s I Corps, four divisions in columns, about 14,000'),
      unit('france', 'infantry', 1400, 120, 280, 220, 0, 'derlon', 'd’Erlon’s I Corps, four divisions in columns, about 14,000'),
      unit('france', 'cavalry', -420, -60, 300, 140, 20, 'cuirassiers', 'Cuirassiers covering d’Erlon’s left'),
      unit('france', 'artillery', 700, -850, 1600, 100, 355, 'grand-battery', 'The grand battery, 80 guns', { count: 16 }),
      unit('france', 'cavalry', 1550, -950, 600, 200, 300, 'milhaud', 'Milhaud’s cuirassiers and Jaquinot’s lancers counter-charge'),
      unit('france', 'infantry', 1900, -1700, 700, 300, 70, 'lobau', 'Lobau’s VI Corps moves to face the Prussians'),
      unit('britain', 'infantry', 600, 470, 1100, 150, 180, 'picton', 'Picton’s division: Kempt’s and Pack’s brigades'),
      unit('britain', 'infantry', -420, 450, 600, 200, 180, 'alten', 'Alten’s 3rd Division'),
      unit('britain', 'cavalry', -250, -600, 500, 150, 180, 'household', 'The Household Brigade under Somerset'),
      unit('britain', 'cavalry', 850, -620, 500, 150, 180, 'union', 'The Union Brigade under Ponsonby, among the guns'),
    ],
    arrows: [
      arrow('britain', [[-350, 800], [-380, 200], [-270, -450]], 160, 'household-charge', 'The Household Brigade charges'),
      arrow('britain', [[500, 800], [750, 300], [830, -480]], 160, 'union-charge', 'The Union Brigade charges through d’Erlon’s columns'),
      arrow('france', [[1350, -880], [1200, -760], [1080, -660]], 140, 'milhaud-charge', 'The French counter-charge'),
      arrow('france', [[300, -1950], [1000, -1900], [1650, -1750]], 140, 'lobau-move', 'Lobau marches to the right'),
    ],
    clashes: [E(700, 280), E(1150, 300), E(-380, 60), { at: E(900, -760), size: 180 }],
  },
  markers: {
    'waterloo-18-picton': mark(2000, 1100, 'Picton', 'Killed ordering a counter-attack', 'britain', 'skull'),
    'waterloo-18-ponsonby': mark(450, -1150, 'Ponsonby', 'Killed by a lancer', 'britain', 'skull'),
    'waterloo-18-prussians': mark(2500, 1450, 'Prussians', 'Seen at 13:15 near Chapelle-Saint-Lambert', 'prussia', 'flag'),
  },
});

// --- 16:00 to 18:00: the cavalry charges and La Haye Sainte ---
writePlan(`${G}/040-waterloo-cavalry`, {
  bbox,
  emblem: {
    works,
    units: [
      ...[[-1200, 450], [-950, 650], [-700, 450], [-450, 650], [-200, 450]].map(([x, y]) => unit('britain', 'square', x, y, SQ, SQ, 180, 'squares', 'Allied infantry in squares, with the gunners sheltering in them')),
      unit('france', 'cavalry', -1000, 290, 400, 140, 10, 'french-cavalry', 'Milhaud’s, Kellermann’s and the Guard’s cavalry, about 9,000'),
      unit('france', 'cavalry', -450, 270, 400, 140, 10, 'french-cavalry', 'Milhaud’s, Kellermann’s and the Guard’s cavalry, about 9,000'),
      unit('france', 'infantry', -1000, -550, 700, 200, 10, 'bachelu', 'Bachelu’s division and a regiment of Foy’s, 6,500, driven back'),
      unit('france', 'infantry', 50, -200, 300, 150, 0, 'derlon-lhs', 'd’Erlon’s rallied troops take La Haye Sainte'),
      unit('france', 'infantry', 1800, -1500, 900, 300, 80, 'lobau', 'Lobau’s VI Corps facing the Prussians'),
      unit('prussia', 'infantry', 2650, -1400, 1000, 300, 260, 'bulow', 'Bülow’s IV Corps comes out of the Bois de Paris'),
    ],
    arrows: [
      arrow('france', [[-700, -750], [-700, -350], [-700, 150]], 170, 'cavalry-charge', 'The cavalry charges between Hougoumont and La Haye Sainte'),
      arrow('france', [[50, -650], [30, -400], [10, -100]], 140, 'lhs-attack', 'The attack on La Haye Sainte'),
      arrow('prussia', [[2450, -1420], [2300, -1460], [2150, -1500]], 160, 'bulow-attack', 'Bülow attacks Lobau'),
      arrow('prussia', [[2550, -1050], [2350, -650], [2150, -300]], 140, 'frichermont-attack', 'The Prussian 15th Brigade takes Frichermont'),
    ],
    clashes: [E(-700, 380), E(0, -60), E(2100, -1500)],
  },
  markers: {
    'waterloo-18-ney': mark(-2300, 100, 'Ney', 'Leads the cavalry charges', 'france'),
    'waterloo-18-ompteda': mark(1300, 1000, 'Ompteda', 'His battalion destroyed by cuirassiers', 'britain', 'skull'),
    'waterloo-18-wellington-squares': mark(-700, 1550, 'Wellington', 'Among the squares', 'britain'),
  },
});

// --- 18:00 to 21:00: Plancenoit and the attack of the Imperial Guard ---
writePlan(`${G}/050-waterloo-guard`, {
  bbox,
  emblem: {
    works,
    units: [
      unit('france', 'infantry', -300, 150, 220, 180, 350, 'middle-guard', 'Five battalions of the Middle Guard, led by Ney'),
      unit('france', 'infantry', -800, 200, 220, 180, 345, 'middle-guard', 'Five battalions of the Middle Guard, led by Ney'),
      unit('france', 'infantry', -1100, 100, 220, 180, 345, 'middle-guard', 'Five battalions of the Middle Guard, led by Ney'),
      unit('france', 'infantry', -150, -550, 400, 150, 350, 'old-guard', 'Three battalions of the Old Guard in reserve'),
      unit('france', 'infantry', 1050, -1750, 600, 300, 90, 'plancenoit-guard', 'The Young Guard and two Old Guard battalions in Plancenoit'),
      unit('france', 'infantry', 1450, -250, 600, 200, 30, 'durutte', 'Durutte’s division falls back from Papelotte'),
      unit('britain', 'infantry', -800, 470, 450, 70, 180, 'maitland', '1,500 British Foot Guards under Peregrine Maitland'),
      unit('britain', 'infantry', -1400, 250, 300, 70, 90, 'colborne', 'Colborne’s 52nd Light Infantry wheels onto the flank'),
      unit('britain', 'infantry', -300, 420, 500, 150, 180, 'chasse', 'Chassé’s Dutch division'),
      unit('prussia', 'infantry', 1750, 450, 1000, 250, 220, 'zieten', 'Zieten’s I Corps at Papelotte and Smohain'),
      unit('prussia', 'infantry', 1950, -1900, 900, 300, 270, 'bulow-pirch', 'Bülow’s and Pirch’s brigades storm Plancenoit'),
    ],
    arrows: [
      arrow('france', [[-700, -700], [-750, -250], [-800, 100]], 200, 'guard-advance', 'The Middle Guard climbs the ridge'),
      arrow('britain', [[-800, 430], [-800, 360], [-800, 300]], 160, 'maitland-volley', 'Maitland’s Guards rise and fire'),
      arrow('britain', [[-1350, 250], [-1250, 210], [-1180, 160]], 140, 'colborne-attack', 'The 52nd attacks the chasseurs in the flank'),
      arrow('britain', [[-300, 340], [-300, 290], [-300, 250]], 150, 'chasse-charge', 'Chassé’s bayonet charge'),
      arrow('prussia', [[1700, -1850], [1500, -1780], [1330, -1760]], 160, 'plancenoit-attack', 'The Prussians take Plancenoit for the last time'),
    ],
    clashes: [E(-300, 260), E(-800, 300), E(1320, -1750), E(1450, -100)],
  },
  markers: {
    'waterloo-18-ney-guard': mark(-1900, -400, 'Ney', 'Leads the Guard on his fifth horse', 'france'),
    'waterloo-18-napoleon-leaves': mark(-2000, -1650, 'Napoleon', 'Leaves the field with an Old Guard square', 'france'),
    'waterloo-18-belle-alliance': mark(-155, -1537, 'La Belle Alliance', 'Wellington and Blücher meet, about 21:00', 'britain', 'handshake'),
  },
});

console.log('waterloo: bbox', JSON.stringify(bbox));
