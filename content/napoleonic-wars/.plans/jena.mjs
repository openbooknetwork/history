// Jena, 14 October 1806. Napoleon attacks from the Landgrafenberg above Jena westward across the plateau against
// Hohenlohe, whose line forms in front of Vierzehnheiligen. Positions after the Jena–Auerstedt article and the
// usual battle maps: Closewitz, Cospeda and Lützeroda in the morning, Vierzehnheiligen at midday, Kapellendorf for Rüchel.
// Frame: origin at Vierzehnheiligen, u north, w east, so the French face 270 and the Prussians 90. The field ends
// short of the Saale valley in the east, which the relief shows.
import { frame, writePlan } from './lib.mjs';

const f = frame([11.5, 50.962], 0), P = f.p, FR = f.face(270), PR = f.face(90);
const G = 'pages/060-fourth-coalition/020-jena';
const bbox = f.box([[-4200, -6000], [4000, 5600]], 0);
const unit = (side, type, u, w, width, depth, id, name, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing: side === 'france' ? FR : PR, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, ...(note ? { note } : {}) });

// --- overview: Lannes from Saalfeld to Jena, Davout to Naumburg, the armies on the evening of 13 October ---
writePlan(`${G}/010-jena`, {
  bbox: [11.15, 50.6, 12.2, 51.22],
  routes: {
    'lannes-jena-1806': { name: 'Lannes marches from Saalfeld to Jena, 11 – 13 October 1806', path: [[11.37, 50.65], [11.6, 50.7], [11.6, 50.78], [11.59, 50.85], [11.586, 50.925], [11.565, 50.942]] },
    'davout-naumburg-1806': { name: 'Davout’s III Corps marches by Gera to Naumburg, 10 – 12 October 1806', path: [[11.89, 50.69], [12.08, 50.88], [12.13, 51.04], [11.95, 51.12], [11.81, 51.155]] },
  },
  markers: {
    'jena-weimar': { lnglat: [11.33, 50.98], icon: 'flag', color: 'prussia', label: 'Weimar', note: 'Rüchel, 15,000' },
    'jena-naumburg': { lnglat: [11.81, 51.155], icon: 'flag', color: 'france', label: 'Naumburg', note: 'Davout and Bernadotte, 12 October' },
  },
});

// --- 6 to 10 a.m.: Lannes drives Tauentzien back from Closewitz and Cospeda, Saint-Hilaire and Augereau come up ---
writePlan(`${G}/020-jena-fog`, {
  bbox,
  emblem: {
    units: [
      unit('france', 'infantry', 600, 1300, 1200, 300, 'suchet', 'Suchet’s division of Lannes’s V Corps'),
      unit('france', 'infantry', -1200, 1700, 1100, 300, 'gazan', 'Gazan’s division of Lannes’s V Corps'),
      unit('france', 'infantry', -2200, 4400, 800, 350, 'guard', 'The Imperial Guard on the Landgrafenberg', { facing: 300 }),
      unit('france', 'infantry', 2250, 3150, 1000, 300, 'st-hilaire', 'Saint-Hilaire’s division of Soult’s IV Corps', { facing: 315 }),
      unit('france', 'infantry', -2700, 2400, 1300, 300, 'augereau', 'Augereau’s VII Corps coming up the Mühltal', { facing: 280 }),
      unit('prussia', 'infantry', 700, 900, 1400, 250, 'tauentzien', 'Tauentzien’s advance guard, driven back', { facing: 100 }),
      unit('prussia', 'infantry', 2750, 2650, 1000, 250, 'prussian-left', 'Prussian troops on the left, cut off by Saint-Hilaire', { facing: 135 }),
      unit('prussia', 'infantry', 0, -1500, 2200, 250, 'grawert', 'Grawert’s division forming in front of Vierzehnheiligen'),
      unit('prussia', 'cavalry', -1000, -2400, 800, 250, 'prussian-cavalry', 'Prussian cavalry'),
      unit('prussia', 'infantry', -2300, -2700, 1500, 300, 'saxons', 'The Saxon division on Hohenlohe’s right', { facing: 110 }),
    ],
    arrows: [
      arrow('france', [[-1500, 4000], [-600, 3000], [500, 1600]], 130, 'lannes-attack', 'Lannes attacks in the fog'),
      arrow('france', [[-2300, 3700], [-1700, 2800], [-1250, 2000]], 130, 'lannes-attack', 'Lannes attacks in the fog'),
      arrow('france', [[-300, 5500], [900, 4500], [1950, 3450]], 130, 'st-hilaire-attack', 'Saint-Hilaire climbs from the Saale valley'),
      arrow('france', [[-3900, 5500], [-3200, 4300], [-2800, 2900]], 130, 'augereau-march', 'Augereau marches up the Mühltal from Jena'),
      arrow('prussia', [[-600, 3100], [200, 2200], [650, 1150]], 110, 'tauentzien-retreat', 'Tauentzien falls back towards Vierzehnheiligen', 'dashed'),
    ],
    clashes: [P(650, 1090), { at: P(2500, 2900), size: 200 }],
  },
  markers: {
    'jena-fog-lannes': mark(-300, 2800, 'Lannes', 'Suchet and Gazan', 'france'),
    'jena-fog-napoleon': mark(-2050, 5150, 'Napoleon', 'With the Guard', 'france'),
    'jena-fog-soult': mark(2600, 4200, 'Saint-Hilaire', 'Soult’s IV Corps', 'france'),
    'jena-fog-augereau': mark(-3400, 1700, 'Augereau', 'VII Corps', 'france'),
    'jena-fog-tauentzien': mark(1700, 600, 'Tauentzien', 'Driven back', 'prussia'),
    'jena-fog-hohenlohe': mark(1200, -2600, 'Hohenlohe', 'Forms a line', 'prussia'),
  },
});

// --- 10 a.m. to 1 p.m.: Ney takes Vierzehnheiligen and is enveloped, Grawert stands in the open ---
writePlan(`${G}/030-jena-vierzehnheiligen`, {
  bbox,
  emblem: {
    units: [
      unit('france', 'square', -750, -450, 320, 320, 'ney', 'Ney’s battalions in squares'),
      unit('france', 'square', -1250, -150, 320, 320, 'ney', 'Ney’s battalions in squares'),
      unit('france', 'light', 300, 100, 1000, 100, 'skirmishers', 'French skirmishers in the village and its gardens'),
      unit('france', 'infantry', 700, 900, 1100, 300, 'lannes', 'Lannes’s corps, sent to help Ney'),
      unit('france', 'infantry', -1500, 1500, 1000, 300, 'lannes', 'Lannes’s corps, sent to help Ney'),
      unit('france', 'infantry', -1300, 3500, 800, 350, 'guard', 'The Imperial Guard, held behind the centre'),
      unit('france', 'infantry', 2500, 1900, 1100, 300, 'soult', 'Soult’s IV Corps on the right', { facing: 250 }),
      unit('france', 'infantry', -2600, -900, 1300, 300, 'augereau', 'Augereau’s VII Corps at Isserstedt'),
      unit('prussia', 'infantry', 500, -650, 2000, 200, 'grawert', 'Grawert’s division in line, in the open before Vierzehnheiligen'),
      unit('prussia', 'cavalry', -1500, -1300, 700, 250, 'prussian-cavalry', 'Prussian cavalry counterattacking Ney', { facing: 60 }),
      unit('prussia', 'infantry', -2700, -1450, 1300, 250, 'saxons', 'The Saxon division'),
      unit('prussia', 'infantry', 3400, 1000, 900, 250, 'prussian-left', 'The broken Prussian left', { facing: 160 }),
    ],
    arrows: [
      arrow('france', [[-1200, 2900], [-700, 1100], [-450, -50]], 130, 'ney-attack', 'Ney attacks without orders and takes Vierzehnheiligen'),
      arrow('prussia', [[-1450, -1150], [-1050, -650]], 110, 'cavalry-charge', 'The Prussian cavalry envelops Ney'),
      arrow('france', [[1000, 2200], [800, 1200]], 120, 'lannes-shift', 'Lannes shifts to help Ney'),
      arrow('prussia', [[3500, 1100], [4000, 600]], 110, 'prussian-left-retreat', 'The Prussian left falls back north', 'dashed'),
    ],
    clashes: [P(450, -330), P(-1100, -800), { at: P(-2650, -1220), size: 200 }],
  },
  markers: {
    'jena-vierzehnheiligen-ney': mark(-1900, 300, 'Ney', 'Enveloped, forms squares', 'france'),
    'jena-vierzehnheiligen-lannes': mark(1500, 1500, 'Lannes', 'Comes to Ney’s aid', 'france'),
    'jena-vierzehnheiligen-grawert': mark(1300, -1800, 'Grawert', 'Stands in the open', 'prussia', 'swords'),
    'jena-vierzehnheiligen-napoleon': mark(-2000, 3500, 'Napoleon', 'Keeps the Guard ready', 'france'),
    'jena-vierzehnheiligen-village': mark(150, 150, 'Vierzehnheiligen', null, 'france', 'house'),
  },
});

// --- 1 p.m. onwards: the general attack, Rüchel overrun near Kapellendorf, Murat's pursuit ---
writePlan(`${G}/040-jena-ruchel`, {
  bbox,
  emblem: {
    units: [
      unit('france', 'infantry', 300, -2300, 1300, 300, 'ney-lannes', 'Ney’s and Lannes’s corps in the centre'),
      unit('france', 'infantry', 2600, -1500, 1300, 300, 'soult', 'Soult’s IV Corps turning the Prussian left', { facing: 240 }),
      unit('france', 'infantry', -2300, -2900, 1300, 300, 'augereau', 'Augereau’s VII Corps turning the Prussian right', { facing: 290 }),
      unit('france', 'cavalry', 1200, -3700, 1000, 300, 'murat', 'Murat’s cavalry reserve', { facing: 290 }),
      unit('france', 'infantry', -400, 1500, 800, 350, 'guard', 'The Imperial Guard in reserve'),
      unit('prussia', 'infantry', 1700, -4750, 1800, 250, 'ruchel', 'Rüchel’s corps, 15,000, arriving from Weimar', { facing: 100 }),
      unit('prussia', 'infantry', -2700, -4150, 1000, 300, 'saxons', 'The Saxon division, cut off on the right', { facing: 110 }),
    ],
    arrows: [
      arrow('france', [[2200, 300], [2550, -1150]], 130, 'general-attack', 'The general attack at 1 p.m.'),
      arrow('france', [[300, -300], [300, -2000]], 130, 'general-attack', 'The general attack at 1 p.m.'),
      arrow('france', [[-1900, -900], [-2250, -2600]], 130, 'general-attack', 'The general attack at 1 p.m.'),
      arrow('prussia', [[-200, -3000], [500, -4500], [600, -5900]], 120, 'hohenlohe-rout', 'Hohenlohe’s army flees towards Weimar', 'dashed'),
      arrow('france', [[1300, -4150], [1300, -4600], [1000, -5900]], 120, 'murat-pursuit', 'Murat pursues towards Weimar'),
    ],
    clashes: [{ at: P(1500, -4250), size: 220 }, P(-2550, -3500)],
  },
  markers: {
    'jena-ruchel-ruchel': mark(3300, -4900, 'Rüchel', 'Overrun, badly wounded', 'prussia'),
    'jena-ruchel-murat': mark(2400, -3300, 'Murat', 'Pursues towards Weimar', 'france'),
    'jena-ruchel-saxons': mark(-3300, -4400, 'Saxons', '7,200 lost', 'prussia', 'skull'),
    'jena-ruchel-napoleon': mark(-1200, 1500, 'Napoleon', 'Orders the general attack', 'france'),
  },
});

console.log('jena: bbox', JSON.stringify(bbox), 'battle at', JSON.stringify(P(0, 800)));
