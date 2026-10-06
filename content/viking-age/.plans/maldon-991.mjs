// Maldon, 10 or 11 August 991. The Viking fleet lies at Northey Island in the Blackwater estuary below Maldon. A
// causeway, uncovered at low tide, joins the island to the south bank near South House Farm. The shores follow
// OpenStreetMap, with the salt marsh counted as land.
// Frame: origin on the mainland end of the causeway, u north-west along the shore, w north-east towards the island.
import { frame, writePlan } from './lib.mjs';

const A = [0.70603, 51.71869], B = [0.70790, 51.71967]; // the causeway, mainland end and island end
const f = frame(A, 320), P = f.p, ENGLISH = f.face(90), VIKINGS = f.face(270);
const G = 'pages/110-england-danes/010-maldon';
const bbox = [0.6940, 51.7128, 0.7185, 51.7255];

// the estuary north-west of the causeway, from the Maldon marsh round the Heybridge shore to the island's west shore
const estuary = { id: 'blackwater', name: 'The Blackwater, then called the Panta', area: [
  [0.6930, 51.7290], [0.6930, 51.7268], [0.69729, 51.72677], [0.69740, 51.72545], [0.69874, 51.72514], [0.70020, 51.72348],
  [0.70141, 51.72258], [0.70263, 51.72137], [0.70360, 51.72077], [0.70457, 51.72002], [0.70554, 51.71927], A, B,
  [0.70821, 51.71969], [0.71016, 51.71991], [0.71113, 51.72040], [0.71186, 51.72115], [0.71259, 51.72183], [0.71356, 51.72235],
  [0.71441, 51.72318], [0.71489, 51.72408], [0.71526, 51.72469], [0.71574, 51.72521], [0.71635, 51.72604], [0.71671, 51.72664],
  [0.71744, 51.72755], [0.71800, 51.7290], [0.70950, 51.7290], [0.70919, 51.72740], [0.70809, 51.72604], [0.70797, 51.72499],
  [0.70749, 51.72454], [0.70676, 51.72424], [0.70603, 51.72405], [0.70530, 51.72424], [0.70457, 51.72461], [0.70409, 51.72506],
  [0.70372, 51.72619], [0.70348, 51.72710], [0.70320, 51.7290]] };
// the tidal channel south of the island, from the causeway east between the island and the mainland marsh
const channel = { id: 'channel', name: 'The tidal channel between Northey Island and the mainland', area: [
  A, [0.70700, 51.71806], [0.70846, 51.71761], [0.70943, 51.71693], [0.71089, 51.71625], [0.71198, 51.71595], [0.71331, 51.71610],
  [0.71550, 51.71603], [0.71744, 51.71618], [0.71866, 51.71580], [0.72011, 51.71520], [0.72206, 51.71437], [0.72400, 51.71392],
  [0.7260, 51.7136], [0.7260, 51.7173], [0.72400, 51.71746], [0.72230, 51.71776], [0.72133, 51.71814], [0.72036, 51.71851],
  [0.71914, 51.71874], [0.71793, 51.71896], [0.71671, 51.71911], [0.71574, 51.71896], [0.71429, 51.71851], [0.71307, 51.71818],
  [0.71186, 51.71821], [0.71064, 51.71859], [0.70943, 51.71904], [0.70846, 51.71957], B] };
const water = [estuary, channel];
// the map's coast runs a sea wedge from [0.700, 51.720] east over the island and the causeway head. Land covers the
// wedge and the whole estuary, so no edge of it runs under the translucent water, and the water lies on top
const land = [{ area: [[0.6900, 51.7240], [0.6900, 51.7300], [0.7280, 51.7312], [0.7280, 51.7128], [0.7150, 51.7141], [0.6988, 51.7201], [0.6900, 51.7240]] }];
const causeway = { side: 'neutral', path: [A, [0.70700, 51.71925], B], width: 18, id: 'causeway', name: 'The causeway to Northey Island, passable at low tide' };
const fleet = { side: 'norway', type: 'ships', at: [0.71249, 51.72187], width: 260, depth: 40, count: 7, facing: 131, id: 'fleet', name: 'The Viking fleet at Northey Island, 93 ships by the Anglo-Saxon Chronicle' };

const unit = (side, type, u, w, width, depth, id, name, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing: side === 'english' ? ENGLISH : VIKINGS, id, name, ...extra });
const arrow = (side, path, width, id, name, style) => ({ side, path, width, id, name, ...(style ? { style } : {}) });
const mark = (lnglat, label, note, color, icon = 'user') => ({ lnglat, icon, color, label, note });
// shared points would come out as YAML anchors, so each page gets its own copy
const copy = x => JSON.parse(JSON.stringify(x));

// --- overview: the fleet's course by the Chronicle, the battle card on the field ---
writePlan(`${G}/010-maldon`, {
  routes: {
    'olaf-991': { name: 'Olaf’s fleet from Folkestone by Sandwich and Ipswich to Maldon, August 991', path: [
      [1.19, 51.07], [1.33, 51.1], [1.42, 51.17], [1.43, 51.24], [1.36, 51.28], [1.43, 51.31], [1.47, 51.39], [1.42, 51.5],
      [1.42, 51.7], [1.33, 51.85], [1.29, 51.94], [1.22, 51.99], [1.16, 52.05], [1.215, 51.985], [1.27, 51.925], [1.17, 51.83],
      [1.0, 51.76], [0.92, 51.735], [0.85, 51.735], [0.79, 51.725], [0.75, 51.722], [0.722, 51.721]] },
  },
  markers: {
    'folkestone-991': mark([1.166, 51.081], 'Folkestone', 'Ravaged by the fleet', 'norway', 'flag'),
    'sandwich-991': mark([1.339, 51.274], 'Sandwich', 'The fleet’s second stop', 'norway', 'flag'),
    'ipswich-991': mark([1.155, 52.059], 'Ipswich', 'Overrun by the fleet', 'norway', 'flag'),
  },
});

// --- the causeway: the English on the shore, three men hold the causeway, the Vikings on the island ---
writePlan(`${G}/020-maldon-causeway`, {
  bbox,
  emblem: copy({
    land, water, works: [causeway],
    units: [
      unit('english', 'infantry', 0, -100, 260, 45, 'english', 'Byrhtnoth’s army on the shore: his household troops and the Essex levy, about 1,000 by Cyril Hart’s estimate'),
      unit('english', 'infantry', 0, 8, 75, 30, 'three', 'Wulfstan, Ælfhere and Maccus hold the causeway'),
      { side: 'norway', type: 'infantry', at: [0.71150, 51.71940], width: 200, depth: 90, facing: 275, id: 'vikings', name: 'The Viking army on Northey Island, 2,000 to 4,000 men by modern estimates' },
      fleet,
    ],
    arrows: [arrow('norway', [[0.71030, 51.71950], B, [0.70700, 51.71925], P(0, 34)], 40, 'attack', 'The Vikings try to cross at low tide and are held')],
    clashes: [{ at: P(0, 28), size: 44 }],
  }),
  markers: {
    'maldon-causeway-byrhtnoth': mark(P(-80, -210), 'Byrhtnoth', 'Ealdorman of Essex', 'english'),
    'maldon-causeway-three': mark(P(-230, 110), 'Wulfstan, Ælfhere, Maccus', 'Hold the causeway', 'english', 'swords'),
    'maldon-causeway-vikings': mark([0.71330, 51.71940], 'Viking army', 'Camped on Northey Island', 'norway', 'swords'),
    'maldon-causeway-fleet': mark([0.71080, 51.72290], 'The fleet', '93 ships by the Chronicle', 'norway', 'ship'),
  },
});

// --- the battle on the mainland: Byrhtnoth killed, Godric's flight, the household troops fight on ---
writePlan(`${G}/030-maldon-last-stand`, {
  bbox,
  emblem: copy({
    land, water, works: [causeway],
    units: [
      unit('norway', 'infantry', -30, -255, 380, 70, 'vikings', 'The Viking army, formed up on the mainland', { bow: 40 }),
      unit('english', 'infantry', -30, -410, 120, 50, 'household', 'Byrhtnoth’s household troops, fighting on around his body'),
      fleet,
    ],
    arrows: [
      arrow('norway', [[0.71000, 51.71955], B, [0.70700, 51.71925], A, P(-10, -120), P(-30, -230)], 60, 'crossing', 'The Vikings cross the ford with Byrhtnoth’s leave'),
      arrow('english', [P(20, -430), P(40, -540), P(70, -660)], 45, 'godric', 'Godric flees on Byrhtnoth’s horse with his brothers Godwine and Godwig', 'dashed'),
      arrow('english', [P(-90, -430), P(-110, -540), P(-120, -650)], 45, 'levy-flight', 'Much of the levy takes the rider for Byrhtnoth and flees to the wood', 'dashed'),
    ],
    clashes: [{ at: P(-30, -357), size: 44 }],
  }),
  markers: {
    'maldon-last-byrhtnoth': mark(P(-190, -430), 'Byrhtnoth', 'Killed in the shield wall', 'english', 'skull'),
    'maldon-last-household': mark(P(260, -520), 'Household troops', 'Fight on around his body', 'english', 'swords'),
    'maldon-last-godric': mark(P(120, -690), 'Godric', 'Flees on Byrhtnoth’s horse', 'english'),
    'maldon-last-vikings': mark(P(250, -190), 'Viking army', 'Crosses at low tide', 'norway', 'swords'),
  },
});

// the corners of the phase bbox in the local frame, to keep the field inside it
const [W, S, E, N] = bbox, kx = 111320 * Math.cos(A[1] * Math.PI / 180), ky = 110540, t = 320 * Math.PI / 180;
const local = ([lon, lat]) => { const x = (lon - A[0]) * kx, y = (lat - A[1]) * ky; return [Math.round(x * Math.sin(t) + y * Math.cos(t)), Math.round(x * Math.cos(t) - y * Math.sin(t))]; };
console.log('maldon: bbox corners (u, w)', [[W, S], [W, N], [E, N], [E, S]].map(local).map(c => c.join(',')).join('  '), 'battle at', JSON.stringify(P(-30, -357)));
