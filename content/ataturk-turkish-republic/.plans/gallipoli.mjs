// Gallipoli, 1915: the landing at Arıburnu on 25 April and the August battles at Suvla and Conkbayırı.
// Positions are written as the real ground, then shifted west so the beaches meet the map's drawn coastline, a coarse
// Natural Earth line that runs about 1.15 km west of the real shore at Anzac Cove and 0.6 km west near Suvla.
import { writePlan as write } from './lib.mjs';
import { U, A, W, M } from './ata.mjs';

const G = 'pages/020-great-war';
// moves every [lon, lat] in a plan, and the bbox, dx degrees east
const shift = (v, dx) => Array.isArray(v) && v.length === 2 && v.every(Number.isFinite) && v[0] > 20 && v[0] < 40 ? [+(v[0] + dx).toFixed(5), v[1]]
  : Array.isArray(v) ? v.map(x => shift(x, dx)) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shift(x, dx)])) : v;
const ANZAC_DX = -0.0115, AUGUST_DX = -0.006;
let dx = 0;
const writePlan = (dir, plan) => write(dir, { ...shift(plan, dx), ...(plan.bbox ? { bbox: [plan.bbox[0] + dx, plan.bbox[1], plan.bbox[2] + dx, plan.bbox[3]] } : {}) });
const R = 'republic', B = 'british';

// --- Arıburnu, 25 April 1915 ---
dx = ANZAC_DX;
const anzacBox = [26.245, 40.215, 26.322, 40.268];
const kemalyeri = [26.304, 40.244];

writePlan(`${G}/011-gallipoli-landing-dawn`, {
  bbox: anzacBox,
  emblem: {
    units: [
      U(B, 'ships', [26.258, 40.2465], 1600, 500, 90, 'tows', 'Steam pinnaces towing the boats of the covering force', { count: 12, rows: 2 }),
      U(B, 'infantry', [26.2875, 40.2515], 450, 140, 75, 'eleventh-battalion', '11th Battalion, towards Russell’s Top and the Nek'),
      U(B, 'infantry', [26.2860, 40.2462], 450, 140, 95, 'tenth-battalion', '10th Battalion, on Plugge’s Plateau'),
      U(B, 'infantry', [26.2870, 40.2405], 500, 140, 110, 'ninth-battalion', '9th and 12th Battalions, towards the 400 Plateau'),
      U(R, 'light', [26.2905, 40.2495], 300, 60, 270, 'turkish-platoon', 'A platoon of the 2nd Battalion, 27th Regiment, falling back'),
      U(R, 'light', [26.2780, 40.2580], 200, 50, 270, 'fishermans-hut', 'A second platoon at the Fisherman’s Hut'),
    ],
    arrows: [
      A(B, [[26.2635, 40.2505], [26.2725, 40.2495], [26.2790, 40.2485]], 70, 'first-wave', 'The first six companies land at Arıburnu, about 4.30'),
      A(B, [[26.2635, 40.2430], [26.2740, 40.2440], [26.2810, 40.2448]], 70, 'second-wave', 'The second six companies land while it is still dark'),
      A(B, [[26.2880, 40.2525], [26.2915, 40.2540], [26.2950, 40.2555]], 60, 'to-baby-700', 'Small parties push on to Baby 700'),
      A(B, [[26.2890, 40.2400], [26.2915, 40.2375], [26.2930, 40.2350]], 60, 'to-400-plateau', 'Towards the 400 Plateau'),
      A(R, [[26.2940, 40.2490], [26.2990, 40.2475], [26.3040, 40.2455]], 50, 'platoon-falls-back', 'The Turkish platoon withdraws inland', 'dashed'),
      A(R, [[26.3200, 40.2190], [26.3120, 40.2260], [26.3060, 40.2330]], 90, 'sefik-march', 'Mehmet Şefik’s 27th Regiment marches from Eceabat'),
    ],
  },
  markers: {
    'gallipoli-landing-dawn-brigade': M([26.2825, 40.2425], '3rd Australian Brigade', 'Ashore at about 4.30', B, 'swords'),
    'gallipoli-landing-dawn-sefik': M([26.3135, 40.2290], 'Mehmet Şefik', '27th Regiment, from Eceabat', R),
    'gallipoli-landing-dawn-kabatepe': M([26.2735, 40.2160], 'Kabatepe', 'Near the beach the plan intended', B, 'anchor'),
  },
});

writePlan(`${G}/012-gallipoli-landing-57th`, {
  bbox: anzacBox,
  emblem: {
    units: [
      U(B, 'infantry', [26.2905, 40.2420], 1500, 120, 90, 'anzac-second-ridge', 'Australians on the second ridge, from Pope’s Hill to the 400 Plateau'),
      U(B, 'infantry', [26.2948, 40.2552], 300, 100, 60, 'anzac-baby-700', 'Australians on Baby 700'),
      U(B, 'infantry', [26.2895, 40.2520], 250, 90, 60, 'anzac-nek', 'Australians at the Nek and Russell’s Top'),
      U(R, 'infantry', [26.3000, 40.2535], 330, 120, 230, 'first-battalion', '1st Battalion, 57th Regiment: against Baby 700 and Mortar Ridge'),
      U(R, 'infantry', [26.3050, 40.2585], 330, 120, 270, 'second-battalion', '2nd Battalion, 57th Regiment: round to the west of Baby 700'),
      U(R, 'infantry', [26.3065, 40.2490], 300, 120, 260, 'third-battalion', '3rd Battalion, 57th Regiment, in reserve'),
      U(R, 'light', [26.3040, 40.2448], 200, 50, 270, 'battery', 'Mountain battery on the knoll'),
      U(R, 'infantry', [26.3030, 40.2345], 900, 130, 270, 'twenty-seventh', '27th Regiment on Gun Ridge'),
    ],
    arrows: [
      A(R, [[26.3020, 40.2550], [26.2990, 40.2553], [26.2962, 40.2556]], 70, 'attack-baby-700', 'The 1st Battalion attacks Baby 700'),
      A(R, [[26.3015, 40.2522], [26.2998, 40.2512], [26.2985, 40.2503]], 60, 'attack-mortar-ridge', 'And Mortar Ridge'),
      A(R, [[26.3030, 40.2600], [26.2990, 40.2615], [26.2945, 40.2600], [26.2940, 40.2568]], 70, 'round-the-west', 'The 2nd Battalion circles round to the west'),
    ],
    clashes: [[26.2955, 40.2557], [26.2985, 40.2505]],
  },
  markers: {
    'gallipoli-landing-57th-kemal': M([26.3080, 40.2430], 'Mustafa Kemal', 'At Kemalyeri, about 10.00', R),
    'gallipoli-landing-57th-baby-700': M([26.2925, 40.2585], 'Baby 700', 'Changes hands through the day', B, 'mountain'),
  },
});

writePlan(`${G}/013-gallipoli-landing-afternoon`, {
  bbox: anzacBox,
  emblem: {
    works: [{ side: B, path: [[26.2830, 40.2548], [26.2858, 40.2516], [26.2905, 40.2496], [26.2915, 40.2470], [26.2905, 40.2420], [26.2895, 40.2370], [26.2880, 40.2320], [26.2860, 40.2290]], width: 45, id: 'anzac-line', name: 'The Anzac line at nightfall, under two miles long' }],
    units: [
      U(B, 'infantry', [26.2875, 40.2475], 900, 110, 90, 'anzac-north', 'Australians and New Zealanders from Walker’s Ridge to Pope’s Hill'),
      U(B, 'infantry', [26.2875, 40.2340], 900, 110, 90, 'anzac-south', 'Australians on the western slope of the 400 Plateau and Bolton’s Ridge'),
      U(R, 'infantry', [26.2952, 40.2565], 400, 140, 240, 'fifty-seventh', 'What is left of the 57th Regiment on Baby 700'),
      U(R, 'infantry', [26.2990, 40.2625], 600, 150, 215, 'seventy-second', '72nd Regiment, attacking from the north at 16.30'),
      U(R, 'infantry', [26.3000, 40.2445], 500, 140, 270, 'seventy-seventh', 'Two battalions of the 77th Regiment, between the 57th and the 27th'),
      U(R, 'infantry', [26.2990, 40.2345], 900, 140, 270, 'twenty-seventh', '27th Regiment, on the 400 Plateau'),
    ],
    arrows: [
      A(R, [[26.2985, 40.2600], [26.2955, 40.2575], [26.2920, 40.2545]], 70, 'seventy-second-attack', 'The 72nd Regiment drives on towards the Nek'),
      A(R, [[26.2985, 40.2360], [26.2955, 40.2355], [26.2925, 40.2352]], 70, 'plateau-attack', 'The 27th and 77th Regiments retake most of the 400 Plateau'),
      A(B, [[26.2945, 40.2550], [26.2905, 40.2528], [26.2868, 40.2518]], 60, 'baby-700-lost', 'The Australians and New Zealanders fall back from Baby 700', 'dashed'),
    ],
    clashes: [[26.2905, 40.2522], [26.2930, 40.2360]],
  },
  markers: {
    'gallipoli-landing-afternoon-kemal': M([26.3080, 40.2430], 'Mustafa Kemal', 'Commits the 77th and the 72nd', R),
    'gallipoli-landing-afternoon-beachhead': M([26.2820, 40.2385], 'Anzac beachhead', '16,000 men ashore by nightfall', B, 'flag'),
  },
});

// --- Anafartalar and Conkbayırı, August 1915 ---
dx = AUGUST_DX;
const suvlaBox = [26.235, 40.24, 26.345, 40.335];
const saltLake = { area: [[26.252, 40.300], [26.256, 40.305], [26.264, 40.304], [26.270, 40.301], [26.271, 40.295], [26.266, 40.290], [26.258, 40.288], [26.253, 40.292]], id: 'salt-lake', name: 'The salt lake behind Suvla Bay, mostly dry in August' };

writePlan(`${G}/021-suvla-offensive`, {
  bbox: suvlaBox,
  emblem: {
    water: [saltLake],
    units: [
      U(B, 'ships', [26.236, 40.2795], 1400, 400, 90, 'b-beach-ships', 'Destroyers and lighters off B Beach', { count: 6 }),
      U(B, 'ships', [26.2285, 40.3105], 900, 350, 110, 'a-beach-ships', 'Destroyers in Suvla Bay', { count: 4 }),
      U(B, 'infantry', [26.2575, 40.2835], 700, 150, 70, 'eleventh-division', 'British 11th Division, round Lala Baba'),
      U(B, 'infantry', [26.2700, 40.3065], 700, 150, 100, 'thirty-fourth-brigade', '34th Brigade, between the beach and the salt lake'),
      U(B, 'infantry', [26.2850, 40.3255], 800, 140, 90, 'manchesters', '11th Manchesters on the Kireçtepe ridge'),
      U(R, 'light', [26.2880, 40.2930], 1200, 70, 270, 'willmer', 'Major Willmer’s small detachment'),
      U(B, 'infantry', [26.3085, 40.2522], 280, 100, 100, 'wellingtons', 'Wellington Battalion on the summit of Conkbayırı, 8 August'),
      U(R, 'infantry', [26.3005, 40.2570], 900, 150, 250, 'nineteenth-division', 'Mustafa Kemal’s 19th Division on Düztepe and Kılıçbayır'),
    ],
    arrows: [
      A(B, [[26.2830, 40.2620], [26.2910, 40.2600], [26.2980, 40.2560], [26.3040, 40.2535]], 80, 'right-column', 'Right assaulting column up the spur to the Apex'),
      A(B, [[26.2850, 40.2690], [26.2980, 40.2700], [26.3100, 40.2660], [26.3170, 40.2610]], 80, 'left-column', 'Left assaulting column towards Hill Q and Kocaçimen Tepe'),
      A(B, [[26.2450, 40.2790], [26.2530, 40.2815]], 70, 'b-beach', 'The landing at B Beach, night of 6 August'),
      A(B, [[26.2330, 40.3085], [26.2420, 40.3075]], 70, 'a-beach', 'The landing at A Beach'),
    ],
  },
  markers: {
    'suvla-offensive-lala-baba': M([26.2520, 40.2865], 'Lala Baba', 'Taken on the first night', B, 'mountain'),
    'suvla-offensive-apex': M([26.2990, 40.2510], 'The Apex', '500 yards below the summit', B, 'flag'),
    'suvla-offensive-971': M([26.3220, 40.2620], 'Kocaçimen Tepe', 'Hill 971', R, 'mountain'),
  },
});

writePlan(`${G}/022-suvla-tekke-tepe`, {
  bbox: suvlaBox,
  emblem: {
    water: [saltLake],
    units: [
      U(R, 'infantry', [26.3180, 40.3160], 2600, 180, 250, 'seventh-twelfth', '7th and 12th Divisions on the Tekke Tepe ridge, under Mustafa Kemal'),
      U(R, 'infantry', [26.3080, 40.2900], 1600, 160, 270, 'anafarta-spur', 'Ottoman troops on the Anafarta spur and the W Hills'),
      U(B, 'infantry', [26.2830, 40.2935], 900, 150, 80, 'chocolate-hill', 'British troops round Chocolate Hill'),
      U(B, 'infantry', [26.2700, 40.3065], 700, 150, 100, 'hill-10', 'British troops at Hill 10'),
      U(B, 'infantry', [26.2900, 40.3260], 900, 140, 90, 'kirectepe', 'British 10th Division on the Kireçtepe ridge'),
    ],
    arrows: [
      A(B, [[26.2860, 40.3010], [26.2980, 40.3070], [26.3080, 40.3120]], 90, 'thirty-second-march', 'The British 32nd Brigade marches for Tekke Tepe in the night'),
      A(R, [[26.3150, 40.3150], [26.3070, 40.3110], [26.3000, 40.3060]], 100, 'bayonet-charge', 'The Ottoman bayonet charge at about 4.00'),
      A(B, [[26.3030, 40.3080], [26.2900, 40.3030], [26.2770, 40.2980]], 80, 'thirty-second-flight', 'The 32nd Brigade breaks and falls back towards the beach', 'dashed'),
    ],
    clashes: [[26.3090, 40.3115]],
  },
  markers: {
    'suvla-tekke-tepe-kemal': M([26.3330, 40.2880], 'Mustafa Kemal', 'Commands from Suvla to Conkbayırı', R),
    'suvla-tekke-tepe-scimitar': M([26.2930, 40.3000], 'Scimitar Hill', 'Scrub set on fire by gunfire', B, 'flame'),
  },
  show: ['suvla'],
});

writePlan(`${G}/023-suvla-conkbayiri`, {
  bbox: [26.288, 40.243, 26.325, 40.267],
  emblem: {
    units: [
      U(B, 'infantry', [26.3082, 40.2522], 280, 80, 100, 'lancashires', '6th South Lancashires on the summit, overrun'),
      U(B, 'light', [26.3060, 40.2532], 250, 60, 100, 'wiltshires', '5th Wiltshires below the summit, scattered'),
      U(B, 'infantry', [26.3075, 40.2572], 500, 140, 120, 'baldwin', 'Baldwin’s brigade at the Farm, about 3,000 men'),
      U(B, 'light', [26.3030, 40.2541], 200, 60, 90, 'apex-guns', 'New Zealand machine guns at the Apex'),
      U(R, 'infantry', [26.3140, 40.2515], 900, 160, 275, 'kemal-battalions', 'Six battalions led by Mustafa Kemal, attacking at dawn'),
    ],
    arrows: [
      A(R, [[26.3120, 40.2520], [26.3090, 40.2522], [26.3055, 40.2530]], 90, 'over-the-summit', 'Over the summit to the Pinnacle'),
      A(R, [[26.3115, 40.2540], [26.3100, 40.2558], [26.3080, 40.2572]], 90, 'down-to-the-farm', 'Down the northern slope onto the Farm'),
      A(B, [[26.3060, 40.2575], [26.3030, 40.2585], [26.3000, 40.2590]], 60, 'farm-survivors', 'Survivors fall back to Cheshire Ridge', 'dashed'),
    ],
    clashes: [{ at: [26.3082, 40.2522], size: 70 }, { at: [26.3040, 40.2538], size: 70 }, { at: [26.3075, 40.2572], size: 70 }],
  },
  markers: {
    'suvla-conkbayiri-kemal': M([26.3160, 40.2495], 'Mustafa Kemal', 'Leads the attack at dawn', R),
    'suvla-conkbayiri-baldwin': M([26.3080, 40.2595], 'Baldwin', 'Killed at the Farm', B, 'skull'),
    'suvla-conkbayiri-apex': M([26.3000, 40.2525], 'The Apex', 'Becomes the new front line', B, 'flag'),
  },
});
console.log('gallipoli: 6 phase pages');
