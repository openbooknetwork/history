// Belgrade, 4 to 22 July 1456: the fortress on the headland where the Sava meets the Danube, the Ottoman lines across
// the neck of the headland, the river fleet above the city and the crusaders at Zemun across the rivers. The rivers come
// from the elevation tiles, the fortress from general plans of Kalemegdan, the lines from the accounts (README.md).
// Frame: origin at the middle of the Ottoman line, about 800 m from the walls, u along the line to the north-east
// (bearing 42), from the Sava at u = -1360 to the Danube at u = 1360, w to the south-east, away from the fortress.
import { frame, writePlan as write } from './lib.mjs';

// shared points would come out as YAML anchors, so each page gets its own copy of the emblem
const writePlan = (dir, plan) => write(dir, { ...plan, emblem: JSON.parse(JSON.stringify(plan.emblem)) });

const G = 'pages/030-serbia/040-belgrade';
const f = frame([20.462, 44.8176], 42), P = f.p, OTT = f.face(270), HUN = f.face(90);
// one bbox for the three phases, about 6.6 km by 5.5 km: Zemun and the river fleet in the north-west, the Ottoman
// camp in the south-east
const bbox = [20.41, 44.801, 20.494, 44.851];

// --- the ground ---
// The water of the Danube and the Sava: the flattened river surface of the elevation tiles at zoom 14, traced and cut
// into three pieces that each hold no island. The Great War Island lies between the Danube, the Zemun arm and the Sava.
// A modern marina on the bank east of the fortress is left out.
const DANUBE = [[20.4794, 44.8266], [20.4819, 44.8266], [20.4861, 44.8256],
  [20.4881, 44.8256], [20.4901, 44.8249], [20.4944, 44.8246], [20.4961, 44.8239], [20.4981, 44.8241], [20.5016, 44.8234], [20.5091, 44.8231], [20.5114, 44.8236],
  [20.5174, 44.8236], [20.5191, 44.8241], [20.5251, 44.8244], [20.5251, 44.8336], [20.5214, 44.8334], [20.5211, 44.8329], [20.5164, 44.8321], [20.5109, 44.8321],
  [20.4999, 44.8311], [20.4931, 44.8311], [20.4929, 44.8316], [20.4859, 44.8314], [20.4846, 44.8319], [20.4819, 44.8319], [20.4811, 44.8324], [20.4794, 44.8321],
  [20.4736, 44.8326], [20.4714, 44.8329], [20.4701, 44.8336], [20.4651, 44.8339], [20.4641, 44.8344], [20.4616, 44.8346], [20.4604, 44.8354], [20.4586, 44.8361],
  [20.4519, 44.8379], [20.4514, 44.8386], [20.4451, 44.8404], [20.4441, 44.8411], [20.4401, 44.8421], [20.4381, 44.8434], [20.4331, 44.8449], [20.4279, 44.8481],
  [20.4241, 44.8494], [20.4201, 44.8516], [20.4186, 44.8529], [20.4161, 44.8544], [20.4116, 44.8564], [20.3999, 44.8594], [20.3979, 44.8609], [20.3916, 44.8629],
  [20.3864, 44.8651], [20.3849, 44.8661], [20.3849, 44.8589], [20.3906, 44.8574], [20.3939, 44.8554], [20.3991, 44.8544], [20.4019, 44.8534], [20.4039, 44.8521],
  [20.4061, 44.8511], [20.4114, 44.8494], [20.4146, 44.8474], [20.4166, 44.8451], [20.4181, 44.8429], [20.4191, 44.8396], [20.4246, 44.8396], [20.4266, 44.8401],
  [20.4279, 44.8396], [20.4334, 44.8396], [20.4336, 44.8379], [20.4396, 44.8366], [20.4454, 44.8336], [20.4464, 44.8326], [20.4456, 44.8311], [20.4526, 44.8311],
  [20.4526, 44.8306], [20.4576, 44.8306], [20.4589, 44.8301], [20.4614, 44.8304], [20.4639, 44.8296], [20.4666, 44.8296], [20.4709, 44.8289], [20.4719, 44.8279],
  [20.4739, 44.8281], [20.4756, 44.8274], [20.4771, 44.8269]];
// the Zemun arm, west of the island, which joins the Sava south of it
const ZEMUN_ARM = [[20.4319, 44.8221], [20.4371, 44.8221], [20.4401, 44.8226], [20.4404, 44.8251], [20.4384, 44.8244], [20.4339, 44.8241], [20.4291, 44.8264],
  [20.4276, 44.8279], [20.4274, 44.8291], [20.4264, 44.8291], [20.4241, 44.8361], [20.4236, 44.8376], [20.4244, 44.8396], [20.4191, 44.8396], [20.4194, 44.8354],
  [20.4204, 44.8336], [20.4204, 44.8321], [20.4219, 44.8301], [20.4226, 44.8289], [20.4226, 44.8279], [20.4239, 44.8261], [20.4254, 44.8251], [20.4276, 44.8231],
  [20.4296, 44.8224]];
// the Sava, which runs north between the island and the fortress into the Danube
const SAVA = [[20.4404, 44.8006], [20.4411, 44.8006], [20.4451, 44.8041], [20.4489, 44.8094], [20.4499, 44.8169], [20.4459, 44.8224], [20.4466, 44.8239],
  [20.4451, 44.8254], [20.4451, 44.8264], [20.4486, 44.8296], [20.4526, 44.8304], [20.4526, 44.8311], [20.4454, 44.8311], [20.4426, 44.8281], [20.4414, 44.8254],
  [20.4404, 44.8231], [20.4424, 44.8219], [20.4439, 44.8204], [20.4459, 44.8159], [20.4469, 44.8154], [20.4469, 44.8136], [20.4459, 44.8129], [20.4461, 44.8101],
  [20.4429, 44.8056], [20.4404, 44.8036]];
const water = [
  { area: DANUBE, id: 'danube', name: 'The Danube. The low ground on its far bank is marsh' },
  { area: ZEMUN_ARM, id: 'zemun-arm', name: 'The arm of the Danube between Zemun and the Great War Island' },
  { area: SAVA, id: 'sava', name: 'The Sava, which flows into the Danube below the fortress' },
  { path: [[20.4493, 44.8205], [20.4528, 44.8202], [20.4552, 44.822], [20.4562, 44.824]], width: 30, id: 'ditch', name: 'The ditch filled with water before the southern walls of the upper town' },
];

// --- the fortress ---
// The upper town on the end of the ridge, about 115 m high, with the inner castle at its north-west corner, and the lower
// town on the slope down to the Danube and the Sava. Placed from general plans of Kalemegdan, good to about 50 m.
const UPPER = [[20.4483, 44.8243], [20.4508, 44.8254], [20.4532, 44.8256], [20.4556, 44.824], [20.4548, 44.8222], [20.4527, 44.8207], [20.4495, 44.8209],
  [20.448, 44.8224], [20.4483, 44.8243]];
const LOWER = [[20.4483, 44.8243], [20.4463, 44.8255], [20.4464, 44.8268], [20.4473, 44.8281], [20.4488, 44.8292], [20.4515, 44.8299], [20.4545, 44.83],
  [20.4575, 44.8297], [20.458, 44.8275], [20.4568, 44.8255], [20.4556, 44.824]];
const walls = [
  { side: 'hungary', path: UPPER, width: 30, id: 'upper-town', name: 'The walls of the upper town: a double wall with four gates, round the camps of the garrison' },
  { side: 'hungary', path: LOWER, width: 20, id: 'lower-town', name: 'The walls of the lower town, with the cathedral and the port on the Danube' },
];
const TRENCH = { side: 'ottomans', path: f.path([[-1300, -300], [-650, -340], [0, -350], [650, -340], [1300, -300]]), width: 30, style: 'trench', id: 'trenches',
  name: 'The Ottoman trenches across the neck of the headland, from the Sava to the Danube' };
const CASTLE = { side: 'hungary', type: 'fort', at: [20.4497, 44.8239], width: 110, depth: 90, facing: HUN, id: 'castle', name: 'The inner castle with the palace of the despots' };
const BREACH = [20.4553, 44.8236];

// --- the units ---
const unit = (side, type, at, width, depth, facing, id, name, extra = {}) => ({ side, type, at, width, depth, facing, id, name, ...extra });
// boats as rows of hulls L metres long, about five times a river galley's length, so that a hull reads at this scale
const ships = (side, at, facing, rows, count, id, name, L = 150) => {
  const cols = Math.ceil(count / rows);
  return { side, type: 'ships', at, width: Math.round(L * cols / 1.6), depth: Math.round(L * rows / 0.85), facing, rows, count, id, name };
};
const arrow = (side, path, width, id, name, style) => ({ side, path, width, id, name, ...(style ? { style } : {}) });
const mk = (lnglat, label, note, color, icon = 'user') => ({ lnglat, icon, color, label, note });

const ANATOLIANS = unit('ottomans', 'infantry', P(-850, 0), 900, 180, OTT, 'anatolians', 'The Anatolian troops, the left wing, from the Sava to the middle of the line', { bow: 40 });
const JANISSARIES = unit('ottomans', 'infantry', P(0, -40), 600, 150, OTT, 'janissaries', 'The janissaries in the centre, before the sultan’s post', { bow: 40 });
const RUMELIANS = unit('ottomans', 'infantry', P(850, 0), 900, 180, OTT, 'rumelians', 'The Rumelian troops under Karaca Pasha, the beylerbey of Rumelia, the right wing towards the Danube', { bow: 40 });
const GUNS_R = unit('ottomans', 'artillery', P(800, -230), 600, 60, OTT, 'guns-rumelia', 'The batteries of the Rumelian troops, who have most of the 300 guns, 22 of them large', { count: 10 });
const GUNS_C = unit('ottomans', 'artillery', P(-50, -230), 340, 60, OTT, 'guns-centre', 'Guns before the centre', { count: 6 });
const SIPAHIS = unit('ottomans', 'cavalry', [20.487, 44.8205], 900, 220, 15, 'sipahis', 'The sipahis, the horsemen who hold fiefs, guard the ground from the Danube eastwards so that no army can come round the right wing');
const CAMP = P(150, 1150);
const FLEET = ships('ottomans', [20.4295, 44.8428], 315, 1, 14, 'fleet', 'The Ottoman river fleet closes the Danube above the city and watches the marshes, so that no help reaches the fortress. 21 to 200 boats in the accounts, 60 by Doukas');
const SAVA_SHIPS = ships('ottomans', [20.4448, 44.8075], 20, 3, 3, 'sava-ships', 'Ottoman boats on the Sava, which guard the left wing of the army');
const GARRISON = unit('hungary', 'infantry', [20.4522, 44.8228], 260, 100, HUN, 'garrison', 'Michael Szilágyi with the garrison, 5,000 to 7,000 men: Hungarian, Czech and Polish mercenaries hired by Hunyadi, and the townspeople');
const CRUSADERS_ZEMUN = unit('crusaders', 'irregular', [20.4125, 44.8392], 450, 250, 120, 'crusaders', 'Capistrano’s crusaders on the Syrmian bank at Zemun: peasants, townsmen, students and friars, many armed with clubs, flails and slings');

// --- the places: story markers defined on the overview, shown again on the phases ---
const PLACES = {
  'belgrade-1456': { lnglat: [20.4515, 44.8232], icon: 'castle', color: 'hungary', label: 'Belgrade (Nándorfehérvár)', note: 'Held by Michael Szilágyi' },
  'zemun-1456-crusaders': { lnglat: [20.4125, 44.8455], icon: 'flag', color: 'crusaders', label: 'Zemun (Zimony)', note: 'Camp of the crusaders' },
};

// --- 010 overview: the approach of the armies and the fleets, June and early July ---
// the Danube and the Sava from the flattened water of the elevation tiles at zoom 11 and 12, good to about 500 m
const DANUBE_COURSE = [[20.267, 45.14], [20.287, 45.12], [20.303, 45.1], [20.327, 45.08], [20.351, 45.06], [20.36, 45.04], [20.36, 45.02], [20.334, 45.0],
  [20.291, 44.98], [20.291, 44.96], [20.305, 44.94], [20.331, 44.92], [20.348, 44.9], [20.362, 44.88], [20.392, 44.86], [20.418, 44.845], [20.44, 44.839],
  [20.46, 44.833], [20.49, 44.828], [20.52, 44.828], [20.552, 44.84], [20.6, 44.842], [20.632, 44.838], [20.647, 44.82], [20.634, 44.8], [20.623, 44.78],
  [20.631, 44.76], [20.662, 44.74], [20.687, 44.72], [20.706, 44.7], [20.726, 44.68], [20.76, 44.665], [20.82, 44.663], [20.88, 44.665], [20.93, 44.675],
  [20.97, 44.7], [21.02, 44.72], [21.08, 44.74], [21.15, 44.76]];
const SAVA_COURSE = [[20.15, 44.71], [20.2, 44.685], [20.24, 44.67], [20.27, 44.662], [20.3, 44.68], [20.315, 44.71], [20.32, 44.742], [20.34, 44.756],
  [20.36, 44.775], [20.38, 44.79], [20.4, 44.795], [20.42, 44.797], [20.44, 44.803], [20.447, 44.815], [20.446, 44.83]];
const BELGRADE_DOWN = DANUBE_COURSE.slice(DANUBE_COURSE.findIndex(p => p[0] === 20.46));
writePlan(`${G}/010-belgrade`, {
  bbox: [20.15, 44.36, 21.15, 45.18],
  emblem: {
    water: [
      { path: DANUBE_COURSE, width: 700, id: 'danube', name: 'The Danube' },
      { path: SAVA_COURSE, width: 300, id: 'sava', name: 'The Sava' },
    ],
  },
  markers: { ...PLACES },
  routes: {
    'mehmed-belgrade-1456': { name: 'Mehmed’s army comes down the Morava valley and along the Danube to Belgrade, June 1456', color: 'ottomans', group: 'approach',
      path: [[21.0, 44.38], [20.97, 44.46], [20.92, 44.54], [20.86, 44.6], [20.8, 44.645], [20.74, 44.665], [20.68, 44.7], [20.64, 44.73], [20.6, 44.76],
        [20.555, 44.785], [20.51, 44.8], [20.476, 44.811]] },
    'fleet-belgrade-1456': { name: 'The Ottoman river fleet comes up the Danube and takes its post above the city, June 1456', color: 'ottomans', group: 'approach',
      path: [...[...BELGRADE_DOWN].reverse(), [20.44, 44.839], [20.428, 44.843]] },
    'hunyadi-belgrade-1456': { name: 'Hunyadi’s relief army and boats come down the Danube towards Belgrade, July 1456', color: 'hungary',
      path: DANUBE_COURSE.slice(0, DANUBE_COURSE.findIndex(p => p[0] === 20.392) + 1) },
  },
  show: ['smederevo'],
});

// --- 020 the battle on the Danube, 14 July ---
const HUNYADI_BOATS = ships('hungary', [20.4245, 44.8458], 135, 2, 16, 'hunyadi-boats', 'Hunyadi’s boats, about 200, only one of them a galley, with his troops and food for the fortress', 120);
writePlan(`${G}/020-belgrade-river`, {
  bbox,
  emblem: {
    water, works: [...walls, TRENCH],
    units: [
      ANATOLIANS, JANISSARIES, RUMELIANS, GUNS_R, GUNS_C, SIPAHIS, SAVA_SHIPS,
      ships('ottomans', [20.434, 44.842], 300, 1, 9, 'fleet', 'The Ottoman river fleet, broken after five hours: three large galleys sunk, four large boats and twenty smaller ones taken'),
      HUNYADI_BOATS,
      ships('hungary', [20.4425, 44.839], 315, 1, 5, 'city-boats', 'About 40 boats from the city sail out against the Ottoman fleet', 110),
      CASTLE, GARRISON, CRUSADERS_ZEMUN,
    ],
    arrows: [
      arrow('hungary', [[20.4118, 44.8508], [20.4155, 44.8488], [20.4198, 44.8467]], 140, 'hunyadi-down', 'Hunyadi’s boats come down the Danube'),
      arrow('hungary', [[20.4505, 44.8306], [20.4445, 44.8358], [20.4395, 44.8405]], 100, 'city-out', 'Boats from the city attack the Ottoman fleet from below'),
      arrow('hungary', [[20.4295, 44.8445], [20.4375, 44.8405], [20.4445, 44.8365], [20.4485, 44.8318]], 130, 'hunyadi-in', 'Hunyadi breaks through and brings his troops and food into the fortress'),
    ],
    clashes: [{ at: [20.4295, 44.8442], size: 220 }, { at: [20.439, 44.8418], size: 160 }],
  },
  markers: {
    'belgrade-ottoman-camp': mk(CAMP, 'Ottoman camp', 'Mehmed’s tent', 'ottomans', 'tent'),
    'belgrade-river-hunyadi': mk([20.4335, 44.8492], 'John Hunyadi', 'Leads the boats', 'hungary'),
    'belgrade-river-karaca': mk(P(1000, 420), 'Karaca Pasha', 'Beylerbey of Rumelia', 'ottomans'),
  },
  show: ['belgrade-1456', 'zemun-1456-crusaders'],
});

// --- 030 the guns and the assault of 21 July ---
writePlan(`${G}/030-belgrade-assault`, {
  bbox,
  emblem: {
    water, works: [...walls, TRENCH],
    units: [
      GUNS_R, GUNS_C,
      unit('ottomans', 'infantry', [20.4592, 44.8222], 420, 130, 300, 'janissaries', 'The janissaries attack the eastern walls of the upper town at sundown on 21 July'),
      unit('ottomans', 'infantry', [20.4547, 44.8237], 120, 60, 285, 'janissaries-in', 'Janissaries inside the walls, cut off by the fire and killed'),
      unit('ottomans', 'infantry', [20.4618, 44.8272], 420, 130, 280, 'rumelians', 'The Rumelian troops attack the lower town'),
      unit('ottomans', 'infantry', [20.4512, 44.8178], 460, 130, 345, 'anatolians', 'The Anatolian troops attack the southern walls'),
      CASTLE,
      unit('hungary', 'infantry', [20.4517, 44.8228], 220, 90, 110, 'garrison', 'Michael Szilágyi’s men hold the upper town'),
      unit('hungary', 'infantry', [20.4533, 44.8283], 240, 80, 100, 'lower', 'Hunyadi’s troops and the crusaders who came in with him hold the lower town'),
    ],
    arrows: [
      arrow('ottomans', [P(800, -260), [20.458, 44.8268]], 90, 'guns-fire', 'The guns fire on the walls day and night and open several breaches', 'fire'),
      arrow('ottomans', [P(-50, -260), [20.4558, 44.8228]], 80, 'guns-fire', 'The guns fire on the walls day and night and open several breaches', 'fire'),
      arrow('ottomans', [[20.4605, 44.8216], [20.458, 44.8229], BREACH], 110, 'breach', 'The janissaries break through the eastern walls'),
      arrow('ottomans', [[20.4645, 44.8268], [20.4605, 44.8277], [20.456, 44.8283]], 100, 'lower-attack', 'The Rumelian troops break into the lower town'),
      arrow('hungary', [[20.4518, 44.8236], [20.4548, 44.8238]], 70, 'fire-wood', 'The defenders throw burning tarred wood and brushwood into the breaches, and a wall of fire cuts off the janissaries inside', 'fire'),
    ],
    clashes: [{ at: BREACH, size: 110 }, { at: [20.4563, 44.8283], size: 120 }, { at: [20.4518, 44.8206], size: 90 }],
  },
  markers: {
    'belgrade-assault-karaca': mk(P(950, -130), 'Karaca Pasha', 'Killed by a cannon ball', 'ottomans', 'skull'),
    'belgrade-assault-fire': mk([20.4598, 44.8243], 'Wall of fire', 'Burning wood in the breaches', 'hungary', 'flame'),
    'belgrade-assault-szilagyi': mk([20.4482, 44.8203], 'Michael Szilágyi', 'Holds the upper town', 'hungary'),
    'belgrade-assault-hunyadi': mk([20.4476, 44.8288], 'John Hunyadi', 'In the fortress', 'hungary'),
  },
  show: ['belgrade-ottoman-camp'],
});

// --- 040 the sortie of 22 July and the retreat that night ---
writePlan(`${G}/040-belgrade-sortie`, {
  bbox,
  emblem: {
    water, works: [...walls, TRENCH],
    units: [
      unit('crusaders', 'irregular', P(-650, -480), 520, 140, HUN, 'crusaders-out', 'Crusaders who climb out over the broken walls and attack the Ottoman line'),
      unit('crusaders', 'irregular', [20.4538, 44.807], 420, 150, 45, 'capistrano', 'About 2,000 crusaders under Capistrano, who cross the Sava and fall on the Ottoman flank and rear'),
      unit('hungary', 'knights', P(380, -130), 380, 120, HUN, 'hunyadi', 'Hunyadi with his men, who charge out of the fortress and take the guns'),
      unit('hungary', 'artillery', P(800, -230), 600, 60, OTT, 'guns-rumelia', 'The Ottoman guns, taken by Hunyadi’s men', { count: 10 }),
      unit('hungary', 'artillery', P(-50, -230), 340, 60, OTT, 'guns-centre', 'The Ottoman guns, taken by Hunyadi’s men', { count: 6 }),
      unit('ottomans', 'infantry', P(-950, 650), 600, 160, OTT, 'anatolians', 'The Anatolian troops fall back'),
      unit('ottomans', 'infantry', P(450, 800), 500, 150, OTT, 'janissaries', 'The janissaries and the sultan’s household rally round Mehmed at the edge of the camp'),
      unit('ottomans', 'cavalry', [20.4835, 44.818], 700, 200, 250, 'sipahis', 'The sipahis, who try to scatter the crusaders and later help to drive the Christians out of the camp'),
      CASTLE,
    ],
    arrows: [
      arrow('crusaders', [[20.4398, 44.8042], [20.4455, 44.8053], [20.4518, 44.8064]], 110, 'sava-crossing', 'Capistrano leads his crusaders across the Sava'),
      arrow('hungary', [[20.4527, 44.8207], P(250, -700), P(380, -250)], 140, 'hunyadi-charge', 'Hunyadi charges out of the fortress to the Ottoman guns'),
      arrow('crusaders', [P(-700, -400), P(-650, 250), P(-250, 850)], 120, 'into-camp', 'The Christians reach the Ottoman camp'),
      arrow('ottomans', [P(300, 950), P(200, 650), P(0, 350)], 130, 'counter', 'Mehmed’s men drive the Christians out of the camp, but fail to take back the guns'),
      arrow('ottomans', [CAMP, [20.4835, 44.8065], [20.4915, 44.8025]], 150, 'retreat', 'In the night of 22 to 23 July the army leaves its camp and marches south-east with its wounded in a long column of wagons', 'dashed'),
    ],
    clashes: [{ at: P(-760, 120), size: 160 }, { at: P(380, -330), size: 160 }, { at: P(-50, 620), size: 150 }],
  },
  markers: {
    'belgrade-sortie-capistrano': mk([20.4555, 44.8035], 'John of Capistrano', 'Crosses the Sava', 'crusaders'),
    'belgrade-sortie-hunyadi': mk(P(150, -750), 'John Hunyadi', 'Takes the guns', 'hungary'),
    'belgrade-sortie-mehmed': mk(P(-450, 1100), 'Mehmed II', 'Wounded in the fighting', 'ottomans'),
  },
  show: ['belgrade-ottoman-camp'],
});

console.log('belgrade: phase bbox', JSON.stringify(bbox), 'line from', JSON.stringify(P(-1360, 0)), 'to', JSON.stringify(P(1360, 0)), 'camp', JSON.stringify(CAMP));
