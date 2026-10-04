// Lexington and Concord, 19 April 1775: the green at dawn, the North Bridge, and the road back to Charlestown.
// The green and the bridge are laid out in local frames, the road back in real coordinates along the Battle Road.
import { frame, writePlan } from './lib.mjs';

const G = 'pages/020-war/010-1775';
// compass bearing from one [lon, lat] to another
const toward = ([x1, y1], [x2, y2]) => (Math.atan2((x2 - x1) * Math.cos(y1 * Math.PI / 180), y2 - y1) * 180 / Math.PI + 360) % 360;
const mk = (lnglat, label, note, color, icon = 'user') => ({ lnglat, icon, color, label, note });
// a field too small to read at the map's closest zoom is drawn k times larger around its origin
const scaled = (origin, bearing, k) => { const f = frame(origin, bearing); return { ...f, p: (u, w) => f.p(u * k, w * k), path: pts => pts.map(([u, w]) => f.p(u * k, w * k)), box: (pts, pad) => f.box(pts.map(([u, w]) => [u * k, w * k]), pad * k), k }; };

// --- the green: u runs north-north-east across the common, w towards the road from Boston ---
{
  const f = scaled([-71.2308, 42.4494], 39, 1), P = f.p;
  const unit = (side, type, u, w, width, depth, id, name, facing) => ({ side, type, at: P(u, w), width: width * f.k, depth: depth * f.k, facing, id, name });
  const at = (u, w) => P(u, w), MILITIA = f.face(90);
  writePlan(`${G}/011-lexington-green`, {
    bbox: f.box([[-330, -300], [300, 600]], 70),
    emblem: {
      units: [
        unit('usa', 'infantry', 0, 0, 110, 30, 'militia', 'Lexington training band under Captain John Parker, 77 men', MILITIA),
        unit('held', 'infantry', 75, 125, 90, 30, 'advance-guard', 'Advance guard under Lieutenant Jesse Adair, turning onto the common', toward(at(75, 125), at(0, 0))),
        unit('held', 'infantry', -110, 165, 110, 35, 'pitcairn-companies', 'Three light companies halted by Major John Pitcairn', toward(at(-110, 165), at(-20, 0))),
        unit('held', 'infantry', -20, 500, 40, 200, 'grenadiers', 'Grenadier companies under Lieutenant Colonel Francis Smith', f.face(270)),
      ],
      arrows: [
        { side: 'held', path: f.path([[15, 360], [40, 250], [70, 170]]), width: 22 * f.k, id: 'regulars-advance', name: 'The advance guard turns onto the common' },
        { side: 'held', path: f.path([[-10, 360], [-55, 280], [-95, 210]]), width: 22 * f.k, id: 'pitcairn-left', name: 'Pitcairn leads three companies to the left and halts' },
        { side: 'held', path: f.path([[45, 105], [15, 32]]), width: 18 * f.k, id: 'bayonet-charge', name: 'The regulars fire and charge with the bayonet' },
        { side: 'usa', path: f.path([[-25, -25], [-95, -190]]), width: 18 * f.k, style: 'dashed', id: 'militia-disperse', name: 'The militia disperse under fire' },
        { side: 'usa', path: f.path([[30, -25], [85, -180]]), width: 18 * f.k, style: 'dashed', id: 'militia-disperse', name: 'The militia disperse under fire' },
      ],
      clashes: [{ at: P(12, 52), size: 40 * f.k }],
    },
    markers: {
      'lexington-green-parker': mk(P(-175, -45), 'Parker', '77 militiamen', 'usa'),
      'lexington-green-pitcairn': mk(P(-255, 175), 'Pitcairn', 'Three companies halt on the left', 'held'),
      'lexington-green-smith': mk(P(-130, 520), 'Smith', 'The grenadiers on the road', 'held'),
      'lexington-green-buckman': mk(P(190, -70), 'Buckman Tavern', 'The militia wait here at night', 'usa', 'house'),
    },
  });
}

// --- the North Bridge: u runs north along the Concord River, w east, the town to the south-east ---
{
  const f = scaled([-71.3508, 42.4689], 0, 1), P = f.p;
  const unit = (side, type, u, w, width, depth, id, name, facing) => ({ side, type, at: P(u, w), width: width * f.k, depth: depth * f.k, facing, id, name });
  writePlan(`${G}/012-lexington-north-bridge`, {
    bbox: f.box([[-1000, -520], [450, 450]], 100),
    emblem: {
      water: [{ path: f.path([[-1150, -380], [-700, -250], [-300, -90], [0, 0], [350, 70], [800, 180], [1100, 330]]), width: 40 * f.k, id: 'concord-river', name: 'The Concord River, in spring flood' }],
      works: [{ side: 'neutral', path: f.path([[-14, -16], [14, 16]]), width: 14 * f.k, id: 'north-bridge', name: 'The North Bridge' }],
      units: [
        unit('usa', 'infantry', 100, -200, 24, 230, 'militia-column', 'Minutemen and militia under Major John Buttrick, at least 400, the Acton company in front', toward(P(180, -310), P(0, -30))),
        unit('usa', 'infantry', 250, -400, 220, 50, 'militia-hill', 'Militia still on the hill with Colonel James Barrett', toward(P(250, -400), P(0, 0))),
        unit('held', 'infantry', -10, 112, 34, 140, 'laurie', 'Three light companies under Captain Walter Laurie, about 95 men, formed for street firing', 270),
        unit('held', 'infantry', -520, 235, 50, 120, 'smith-grenadiers', 'Two grenadier companies brought up by Smith', toward(P(-520, 235), P(-100, 140))),
      ],
      arrows: [
        { side: 'usa', path: f.path([[30, -105], [12, -42]]), width: 20 * f.k, id: 'militia-advance', name: 'The militia advance on the bridge' },
        { side: 'held', path: f.path([[-15, 195], [-200, 262], [-430, 300]]), width: 22 * f.k, style: 'dashed', id: 'light-companies-flee', name: 'The light companies break and run for the town' },
        { side: 'held', path: f.path([[-850, 290], [-640, 250], [-300, 175]]), width: 22 * f.k, id: 'smith-comes-up', name: 'Smith comes up from the town, too late' },
      ],
      clashes: [{ at: P(0, 22), size: 45 * f.k }],
    },
    markers: {
      'lexington-north-bridge-buttrick': mk(P(200, -95), 'Buttrick and Davis', 'Lead the column, Davis is killed', 'usa'),
      'lexington-north-bridge-barrett': mk(P(390, -480), 'Barrett', 'Commands the militia', 'usa'),
      'lexington-north-bridge-laurie': mk(P(85, 300), 'Laurie', 'About 95 regulars', 'held'),
      'lexington-north-bridge-smith': mk(P(-610, 330), 'Smith', 'Two grenadier companies', 'held'),
      'lexington-north-bridge-town': mk(P(-932, 156), 'Concord', 'Gun carriages burned in the square', 'held', 'landmark'),
    },
  });
}

// --- the road back: real coordinates, Concord to Charlestown ---
{
  const road = [[-71.3462, 42.4602], [-71.3233, 42.4593], [-71.3125, 42.4562], [-71.2933, 42.4547], [-71.2700, 42.4494]];
  const back = [[-71.2120, 42.4395], [-71.1840, 42.4245], [-71.1590, 42.4150], [-71.1405, 42.4040], [-71.1205, 42.3935], [-71.1150, 42.3872], [-71.0950, 42.3830], [-71.0745, 42.3818], [-71.0665, 42.3792]];
  const percy = [[-71.0640, 42.3545], [-71.0735, 42.3385], [-71.1050, 42.3430], [-71.1215, 42.3680], [-71.1180, 42.3765], [-71.1420, 42.4050], [-71.1640, 42.4180], [-71.2000, 42.4330], [-71.2140, 42.4405]];
  const light = (lnglat, width, facing, id, name) => ({ side: 'usa', type: 'light', at: lnglat, width: width * 1.6, depth: 320, facing, id, name });
  writePlan(`${G}/013-lexington-road-back`, {
    bbox: [-71.37, 42.325, -71.045, 42.475],
    emblem: {
      water: [
        { path: [[-71.1900, 42.3640], [-71.1530, 42.3700], [-71.1220, 42.3695], [-71.0960, 42.3600], [-71.0760, 42.3640], [-71.0640, 42.3700]], width: 220, id: 'charles', name: 'The Charles River' },
        { path: [[-71.1350, 42.4230], [-71.1050, 42.4060], [-71.0820, 42.3960], [-71.0640, 42.3880], [-71.0450, 42.3800]], width: 260, id: 'mystic', name: 'The Mystic River' },
      ],
      units: [
        { side: 'held', type: 'infantry', at: [-71.2560, 42.4472], width: 300, depth: 1800, facing: 100, id: 'smith-column', name: 'Smith’s column, short of ammunition' },
        { side: 'held', type: 'infantry', at: [-71.2240, 42.4452], width: 1500, depth: 380, facing: 280, id: 'percy-brigade', name: 'Percy’s brigade, about 1,000 men with two guns, on the high ground at Lexington' },
        light([-71.3225, 42.4618], 900, 180, 'militia-meriams', 'Militia at Meriam’s Corner'),
        light([-71.2935, 42.4575], 1000, 190, 'militia-lincoln', 'Militia along the road through Lincoln'),
        light([-71.1600, 42.4185], 1200, 215, 'militia-menotomy', 'Militia in the houses of Menotomy'),
        light([-71.1520, 42.4110], 1200, 35, 'militia-menotomy', 'Militia in the houses of Menotomy'),
        light([-71.1240, 42.3985], 900, 240, 'militia-cambridge', 'Militia at Watson’s Corner'),
        { side: 'usa', type: 'infantry', at: [-71.0890, 42.3950], width: 1600, depth: 360, facing: 220, id: 'pickering', name: 'Salem and Marblehead militia under Timothy Pickering, halted on Winter Hill' },
      ],
      arrows: [
        { side: 'held', path: road, width: 220, style: 'dashed', id: 'smith-retreat', name: 'Smith’s column falls back from Concord' },
        { side: 'held', path: percy, width: 200, id: 'percy-march', name: 'Percy marches out of Boston by the Neck and Cambridge' },
        { side: 'held', path: back, width: 230, style: 'dashed', id: 'percy-retreat', name: 'Percy’s column withdraws to Charlestown' },
      ],
      clashes: [{ at: [-71.3233, 42.4593], size: 350 }, { at: [-71.2933, 42.4547], size: 350 }, { at: [-71.1590, 42.4150], size: 400 }, { at: [-71.1205, 42.3935], size: 350 }],
    },
    markers: {
      'lexington-road-back-percy': mk([-71.2240, 42.4390], 'Percy', 'Guns drive the militia back', 'held'),
      'lexington-road-back-heath': mk([-71.1700, 42.4290], 'Heath and Warren', 'A ring of skirmishers', 'usa'),
      'lexington-road-back-meriam': mk([-71.3150, 42.4490], 'Meriam’s Corner', 'The firing begins again', 'usa', 'crosshair'),
      'lexington-road-back-charlestown': mk([-71.0620, 42.3745], 'Charlestown', 'Under the guns of the Somerset', 'held', 'landmark'),
    },
    show: ['concord'],
  });
}
console.log('lexington plans written');
