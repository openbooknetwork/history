// Bunker Hill, 16 to 17 June 1775, on the Charlestown peninsula. The map shows no Charles or Mystic here, so the
// plan draws both rivers around the peninsula. Frame: origin on the redoubt on Breed's Hill, u north-north-east
// along the American line to the Mystic, w east-south-east towards Moulton's Point, where Howe lands.
import { frame, writePlan } from './lib.mjs';

// drawn 1.6 times larger than the ground, rivers included, so the fight reads at the map's closest zoom
const k = 1, f0 = frame([-71.0608, 42.3763], 30), AM = f0.face(90), BR = f0.face(270);
const f = { p: (u, w) => f0.p(u * k, w * k), path: pts => pts.map(([u, w]) => f0.p(u * k, w * k)), box: (pts, pad) => f0.box(pts.map(([u, w]) => [u * k, w * k]), pad * k) }, P = f.p;
const G = 'pages/020-war/010-1775';
const toward = ([x1, y1], [x2, y2]) => (Math.atan2((x2 - x1) * Math.cos(y1 * Math.PI / 180), y2 - y1) * 180 / Math.PI + 360) % 360;
const unit = (side, type, u, w, width, depth, id, name, facing) => ({ side, type, at: P(u, w), width: width * k, depth: depth * k, facing: facing ?? (side === 'usa' ? AM : BR), id, name });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width: width * k, id, name, ...(style ? { style } : {}) });
const clash = (u, w, size = 45) => ({ at: P(u, w), size: size * k });
const mk = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });
const aim = (u, w, tu, tw) => toward(P(u, w), P(tu, tw));

// the peninsula's shore, from the Neck round the north side to Moulton's Point and back along the Charles
const A = [-40, -1260], B = [300, -900], C = [420, -400], D = [445, 0], E = [450, 400], F = [420, 700], Gp = [60, 760], H = [-280, 590], I = [-480, 300], J = [-430, -200], K = [-300, -700], L = [-210, -1180];
const water = [
  { area: f.path([A, B, C, D, E, F, Gp, [200, 2100], [1600, 2100], [1600, 1200], [1150, 900], [1150, -1500], [-40, -1500]]), id: 'mystic', name: 'The Mystic River' },
  { area: f.path([L, K, J, I, H, Gp, [200, 2100], [-820, 2100], [-752, 984], [-594, 703], [-900, 480], [-1354, 383], [-1250, -100], [-900, -700], [-560, -1250], [-210, -1500]]), id: 'charles', name: 'The Charles River, between Charlestown and Boston' },
];
const works = [
  { side: 'usa', path: f.path([[-30, -30], [30, -30], [30, 30], [-30, 30], [-30, -30]]), width: k * 12, id: 'redoubt', name: 'The redoubt on Breed’s Hill, about 40 metres on a side' },
  { side: 'usa', path: f.path([[34, 12], [150, 18]]), width: k * 10, id: 'breastwork', name: 'The breastwork dug at daylight' },
  { side: 'usa', path: f.path([[190, -170], [432, -170]]), width: k * 8, id: 'rail-fence', name: 'The rail fence, packed with hay' },
  { side: 'usa', path: f.path([[432, -170], [472, -176]]), width: k * 12, id: 'stone-wall', name: 'Stark’s stone wall down the beach to the water' },
];
// each phase frames its own action; the camera fits the box, so a tight box is what makes the field large
const boxLanding = f.box([[-600, -640], [520, 880]], 0), boxAttacks = f.box([[-460, -380], [520, 560]], 0), boxRetreat = f.box([[-480, -1300], [520, 420]], 0);
const defenders = [
  unit('usa', 'infantry', 0, 0, 46, 36, 'prescott', 'Prescott’s Massachusetts men in the redoubt'),
  unit('usa', 'infantry', 95, 38, 110, 30, 'breastwork-men', 'Defenders of the breastwork'),
  unit('usa', 'infantry', 290, -192, 190, 30, 'knowlton', 'Knowlton’s Connecticut men at the rail fence'),
  unit('usa', 'infantry', 410, -192, 60, 30, 'stark', 'New Hampshire men under John Stark and James Reed'),
];

// --- the redoubt is built, Howe lands ---
writePlan(`${G}/021-bunker-hill-redoubt`, {
  bbox: boxLanding,
  emblem: {
    water, works,
    units: [
      ...defenders,
      unit('usa', 'infantry', 163, -539, 220, 90, 'putnam', 'Men gathering on Bunker Hill under Israel Putnam'),
      unit('held', 'infantry', 80, 620, 300, 80, 'howe', 'Howe’s grenadiers and light infantry, about 1,500, landed at Moulton’s Point'),
      unit('held', 'light', 370, 480, 220, 40, 'light-forward', 'Light infantry pushed forward along the Mystic side'),
      unit('held', 'infantry', -330, 380, 260, 60, 'pigot', 'Pigot’s regiments and marines gathering south of Charlestown', aim(-330, 380, 0, 0)),
      { side: 'held', type: 'ships', at: P(-500, 470), width: 140 * k, depth: 140 * k, facing: 90, count: 1, id: 'somerset', name: 'HMS Somerset, 68 guns' },
      { side: 'held', type: 'ships', at: P(-200, 820), width: 120 * k, depth: 120 * k, facing: 300, count: 1, id: 'lively', name: 'HMS Lively, which opens fire at dawn' },
    ],
    arrows: [arrow('held', [[-820, 1150], [-400, 1020], [20, 770]], 40, 'boats', 'Howe’s force crosses by boat to Moulton’s Point')],
  },
  markers: {
    'bunker-hill-redoubt-prescott': mk(-95, -120, 'Prescott', 'About 1,200 men dig overnight', 'usa'),
    'bunker-hill-redoubt-putnam': mk(163, -720, 'Putnam', 'On Bunker Hill', 'usa'),
    'bunker-hill-redoubt-stark': mk(345, -330, 'Knowlton and Stark', 'The fence to the Mystic', 'usa'),
    'bunker-hill-redoubt-howe': mk(150, 800, 'Howe', 'Asks Boston for more troops', 'held'),
    'bunker-hill-redoubt-pigot': mk(-440, 480, 'Pigot', 'The left wing', 'held'),
    'bunker-hill-redoubt-copps-hill': mk(-690, 825, 'Copp’s Hill', 'British battery in Boston', 'held', 'flag'),
  },
});

// --- the first two attacks ---
writePlan(`${G}/022-bunker-hill-attacks`, {
  bbox: boxAttacks,
  emblem: {
    water, works,
    units: [
      ...defenders,
      unit('usa', 'infantry', 163, -539, 220, 90, 'putnam', 'Men on Bunker Hill under Putnam, many of whom never go forward'),
      unit('held', 'infantry', 470, 260, 40, 240, 'light-infantry', 'Light infantry in column along the beach'),
      unit('held', 'infantry', 290, -20, 280, 34, 'grenadiers', 'Grenadiers, four deep, against the rail fence'),
      unit('held', 'infantry', -80, 210, 300, 40, 'pigot', 'Pigot’s 5th, 38th, 43rd, 47th and 52nd and the marines against the redoubt', aim(-80, 210, 0, 0)),
    ],
    arrows: [
      arrow('held', [[470, 120], [462, -120]], 36, 'beach-attack', 'The light infantry attack Stark’s wall'),
      arrow('held', [[290, -40], [290, -140]], 36, 'fence-attack', 'The grenadiers attack the fence'),
      arrow('held', [[-60, 170], [-24, 50]], 36, 'redoubt-attack', 'Pigot’s attack on the redoubt'),
      arrow('held', [[430, 60], [380, 480], [200, 700]], 30, 'light-flee', 'Light companies break, some running back to the boats', 'dashed'),
    ],
    clashes: [clash(456, -160), clash(300, -160), clash(-20, 42), clash(100, 52)],
  },
  markers: {
    'bunker-hill-attacks-charlestown': mk(-421, 225, 'Charlestown', 'Set on fire by the navy', 'held', 'flame'),
    'bunker-hill-attacks-abercrombie': mk(330, 190, 'Abercrombie', 'Grenadier commander, mortally wounded', 'held', 'skull'),
    'bunker-hill-attacks-stark': mk(400, -320, 'Stark', 'Holds fire to 50 paces', 'usa'),
    'bunker-hill-attacks-pigot': mk(-170, 360, 'Pigot', 'Retreats after 30 minutes', 'held'),
  },
});

// --- the third attack and the retreat over the Neck ---
writePlan(`${G}/023-bunker-hill-third-attack`, {
  bbox: boxRetreat,
  emblem: {
    water, works,
    units: [
      unit('usa', 'infantry', 0, 0, 40, 30, 'prescott', 'About 150 defenders left in the redoubt, almost out of powder'),
      unit('usa', 'infantry', 290, -205, 190, 22, 'knowlton', 'Knowlton’s and Stark’s men, withdrawing in order'),
      unit('usa', 'infantry', 163, -539, 200, 70, 'putnam', 'Putnam tries to rally the retreating men on Bunker Hill'),
      unit('held', 'infantry', 70, 150, 40, 200, 'grenadier-column', 'Grenadiers in column, packs left behind', aim(70, 150, 0, 0)),
      unit('held', 'infantry', -95, 140, 40, 200, 'pigot-column', 'Pigot’s men in column against the redoubt', aim(-95, 140, 0, 0)),
      unit('held', 'infantry', 190, 100, 40, 160, 'breastwork-column', 'A column against the breastwork', aim(190, 100, 110, 20)),
      unit('held', 'light', 300, -40, 200, 40, 'fence-feint', 'A feint against the rail fence'),
      unit('held', 'infantry', -380, 170, 220, 50, 'clinton', 'Clinton’s reinforcements, about 400 of the 2nd Marines and the 63rd', aim(-380, 170, 0, 0)),
      { side: 'held', type: 'ships', at: P(-360, -1010), width: 120 * k, depth: 120 * k, facing: 40, count: 1, id: 'glasgow', name: 'HMS Glasgow firing on the Neck' },
    ],
    arrows: [
      arrow('held', [[-760, 650], [-600, 420], [-440, 230]], 34, 'clinton-crossing', 'Clinton crosses from Boston'),
      arrow('usa', [[-20, -45], [90, -300], [150, -560], [60, -1000], [-90, -1250]], 34, 'redoubt-retreat', 'The defenders fall back over Bunker Hill to the Neck', 'dashed'),
      arrow('usa', [[300, -230], [290, -520], [170, -900], [-20, -1200]], 34, 'fence-retreat', 'Stark and Knowlton cover the retreat', 'dashed'),
    ],
    clashes: [clash(0, 0, 70), clash(110, 35), clash(-110, -1235, 60)],
  },
  markers: {
    'bunker-hill-third-attack-warren': mk(-150, -200, 'Joseph Warren', 'Killed in the retreat', 'usa', 'skull'),
    'bunker-hill-third-attack-pitcairn': mk(-210, 260, 'Pitcairn', 'Killed in the last volleys', 'held', 'skull'),
    'bunker-hill-third-attack-prescott': mk(90, -150, 'Prescott', 'Among the last to leave', 'usa'),
    'bunker-hill-third-attack-clinton': mk(-470, 360, 'Clinton', 'Rallies the walking wounded', 'held'),
    'bunker-hill-third-attack-neck': mk(60, -1300, 'Charlestown Neck', 'Under fire from the ships', 'usa', 'crosshair'),
  },
});
console.log('bunker hill plans written');
