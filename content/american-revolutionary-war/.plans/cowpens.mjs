// Cowpens, 17 January 1781. Morgan's three lines on the open pasture, facing south-east down the Green River
// Road towards Tarleton. Frame: origin on Howard's main line on the hill, u along the lines (north-east, the
// American left), w from the Americans towards the British. Distances between the lines are a reconstruction.
import { frame, writePlan } from './lib.mjs';

const f = frame([-81.816, 35.1368], 45), P = f.p, AM = f.face(90), BR = f.face(270);
const G = 'pages/020-war/050-1780-1781';
const bbox = f.box([[-750, -450], [750, 1200]], 0);
const unit = (side, type, u, w, width, depth, facing, id, name, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });

const continentals = unit('usa', 'infantry', 60, 0, 260, 80, AM, 'continentals', 'Howard’s main line: Continentals from Maryland and Delaware');
const virginians = unit('usa', 'infantry', -190, 0, 160, 70, AM, 'virginia-militia', 'Virginia militia and state troops on the right of the main line');
const washington = unit('usa', 'cavalry', 220, -260, 120, 80, AM, 'washington', 'William Washington’s dragoons and mounted militia, about 180');
const legionCav = unit('held', 'cavalry', 150, 880, 160, 80, BR, 'legion-cavalry', 'British Legion cavalry, 200, kept for the pursuit');

writePlan(`${G}/021-cowpens-lines`, {
  bbox,
  emblem: {
    units: [
      unit('usa', 'light', 0, 320, 460, 60, AM, 'riflemen', 'Picked riflemen under McDowell and Cunningham, about 150'),
      unit('usa', 'infantry', 0, 160, 380, 60, AM, 'pickens', 'Pickens’s militia, about 300, ordered to fire two volleys and fall back'),
      continentals, virginians, washington,
      unit('held', 'infantry', 0, 660, 420, 80, BR, 'british-line', 'Legion infantry, 7th Foot and light companies, with two 3-pounders'),
      unit('held', 'cavalry', 300, 660, 70, 70, BR, 'british-dragoons', 'Dragoons of the 17th and the Legion on the flanks'),
      unit('held', 'cavalry', -300, 660, 70, 70, BR, 'british-dragoons', 'Dragoons of the 17th and the Legion on the flanks'),
      unit('held', 'infantry', -270, 830, 150, 80, BR, '71st', '71st Highlanders under McArthur in reserve'),
      legionCav,
    ],
    arrows: [arrow('held', [[0, 1250], [0, 930]], 50, 'tarleton-arrives', 'Tarleton arrives along the Green River Road before sunrise')],
  },
  markers: {
    'cowpens-lines-morgan': mark(-60, -150, 'Morgan', 'On the hill behind the main line', 'usa'),
    'cowpens-lines-pickens': mark(330, 170, 'Pickens', 'Two volleys, then fall back', 'usa'),
    'cowpens-lines-riflemen': mark(-380, 330, 'McDowell and Cunningham', 'Riflemen in front', 'usa', 'crosshair'),
    'cowpens-lines-washington': mark(360, -280, 'William Washington', 'Cavalry behind the hill', 'usa'),
    'cowpens-lines-tarleton': mark(-40, 1010, 'Tarleton', 'About 1,150 men', 'held'),
  },
});

writePlan(`${G}/022-cowpens-volleys`, {
  bbox,
  emblem: {
    units: [
      unit('usa', 'infantry', 380, -90, 220, 70, AM, 'pickens', 'Pickens’s militia, falling back round the left as ordered'),
      continentals,
      unit('usa', 'infantry', -190, -120, 160, 70, AM, 'virginia-militia', 'Virginia militia, withdrawing after a misheard order'),
      unit('usa', 'cavalry', 380, 30, 120, 80, f.face(60), 'washington', 'William Washington’s dragoons'),
      unit('held', 'infantry', 0, 240, 440, 80, BR, 'british-line', 'British infantry advancing in line'),
      unit('held', 'infantry', -400, 330, 150, 80, f.face(300), '71st', '71st Highlanders moving round the American right'),
      legionCav,
    ],
    arrows: [
      arrow('usa', [[200, 160], [430, 40], [400, -230]], 45, 'pickens-back', 'Pickens’s militia fire two volleys and file off around the left', 'dashed'),
      arrow('held', [[300, 470], [430, 130]], 35, 'ogilvie', 'Ogilvie’s dragoons charge the retreating militia'),
      arrow('usa', [[230, -250], [390, -60]], 35, 'washington-charge', 'Washington’s dragoons drive them back'),
      arrow('held', [[-270, 800], [-420, 520], [-410, 400]], 40, '71st-flank', 'The 71st is sent round the American right'),
      arrow('usa', [[-190, -20], [-190, -100]], 30, 'virginians-back', 'The Virginia militia begin to withdraw', 'dashed'),
    ],
    clashes: [{ at: P(420, 110), size: 60 }, { at: P(0, 120), size: 60 }],
  },
  markers: {
    'cowpens-volleys-pickens': mark(560, -240, 'Pickens', 'Falls back as planned', 'usa'),
    'cowpens-volleys-howard': mark(110, -150, 'Howard', 'Turns the right, the order is misheard', 'usa'),
    'cowpens-volleys-tarleton': mark(-20, 560, 'Tarleton', 'Takes it for a rout', 'held'),
    'cowpens-volleys-mcarthur': mark(-590, 380, 'McArthur', '71st Highlanders', 'held'),
  },
});

writePlan(`${G}/023-cowpens-envelopment`, {
  bbox,
  emblem: {
    units: [
      unit('usa', 'infantry', 40, 120, 260, 80, AM, 'continentals', 'Howard’s Continentals, charging with the bayonet'),
      unit('usa', 'infantry', -230, 40, 160, 70, f.face(120), 'virginia-militia', 'Virginia militia, turned about'),
      unit('usa', 'cavalry', 300, 400, 130, 80, f.face(200), 'washington', 'William Washington’s dragoons in the British rear'),
      unit('usa', 'infantry', -600, 330, 200, 70, f.face(10), 'pickens', 'Pickens’s militia, back from behind the hill'),
      unit('held', 'infantry', 0, 280, 400, 80, BR, 'british-line', 'British infantry, collapsing and surrendering'),
      unit('held', 'infantry', -420, 340, 150, 80, f.face(300), '71st', '71st Highlanders, surrounded'),
      legionCav,
    ],
    arrows: [
      arrow('usa', [[60, -20], [50, 190]], 45, 'bayonet-charge', 'Howard’s Continentals charge with the bayonet and take the guns'),
      arrow('usa', [[400, -120], [480, 250], [330, 380]], 40, 'washington-envelops', 'Washington’s dragoons strike the British right and rear'),
      arrow('usa', [[260, -260], [-150, -340], [-500, -150], [-590, 260]], 40, 'pickens-circle', 'Pickens’s militia circle the hill and strike the 71st in flank and rear'),
      arrow('usa', [[-210, 70], [-340, 260]], 35, 'virginians-turn', 'The Virginia militia turn on the Highlanders'),
      arrow('held', [[150, 920], [320, 1180]], 40, 'legion-flees', 'The Legion cavalry ride off and Tarleton escapes with about 40 horsemen', 'dashed'),
    ],
    clashes: [{ at: P(10, 190), size: 60 }, { at: P(-500, 340), size: 60 }, { at: P(260, 330), size: 55 }],
  },
  markers: {
    'cowpens-envelopment-howard': mark(120, -130, 'Howard', 'Charge bayonets', 'usa'),
    'cowpens-envelopment-washington': mark(560, 260, 'Washington', 'Into the British rear', 'usa'),
    'cowpens-envelopment-pickens': mark(-720, 120, 'Pickens', 'Round the hill to the right', 'usa'),
    'cowpens-envelopment-71st': mark(-330, 520, '71st Highlanders', 'Surrounded, they surrender', 'held', 'skull'),
    'cowpens-envelopment-tarleton': mark(400, 1130, 'Tarleton', 'Escapes with about 40 men', 'held'),
  },
});

console.log('cowpens: battle at', JSON.stringify(P(0, 350)));
