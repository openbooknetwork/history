// The Petén pages around the Nojpetén battle: places, routes and Lake Petén Itzá, which the base map does not draw.
// Routes follow the places Jones (1998) names; Sakalum, Tzuktok', Chunpich and Chuntuki are placed from his maps.
import fs from 'fs';
import { writePlan } from './lib.mjs';

const G = 'pages/100-peten';
const lake = JSON.parse(fs.readFileSync(new URL('./lake-peten-itza.json', import.meta.url)));
const water = rings => ({ water: rings.map(area => ({ area, id: 'lake', name: 'Lake Petén Itzá' })) });
const NOJPETEN = [-89.8913, 16.93];
// the road south from Campeche, ending at Ch'ich' by the north and west shores of the lake
const ROAD = [[-90.53, 19.85], [-90.36, 19.66], [-90.13, 19.47], [-90.08, 19.0], [-90.08, 18.27], [-90.04, 17.86], [-90.03, 17.48],
  [-90.0, 17.25], [-89.94, 17.1], [-89.905, 17.035], [-89.918, 16.99], [-89.925, 16.972], [-89.938, 16.962], [-89.941, 16.955], [-89.937, 16.9495], [-89.925, 16.9487]];

writePlan(`${G}/010-itza-kingdom`, {
  emblem: water(lake.coarse),
  routes: {
    'cortes-1525': {
      name: 'Cortés’s march from Acalan across Petén to Nito, March to April 1525',
      path: [[-90.837, 18.122], [-90.62, 17.95], [-90.4, 17.72], [-90.2, 17.45], [-90.05, 17.2], [-89.94, 17.03], [-89.99, 16.98], [-90.005, 16.945], [-89.98, 16.925],
        [-89.9, 16.915], [-89.82, 16.75], [-89.65, 16.45], [-89.48, 16.15], [-89.3, 15.9], [-89.1, 15.75], [-88.93, 15.66], [-88.78, 15.8]],
    },
  },
  markers: {
    'nojpeten-1525': { lnglat: NOJPETEN, icon: 'crown', color: 'itza', label: 'Nojpetén', note: 'Island capital of Aj Kan Ek\'' },
    'itzamkanac-1525': { lnglat: [-90.837, 18.122], icon: 'crown', color: 'chontal', label: 'Itzamkanac', note: 'Capital of Acalan' },
    'tipu-1525': { lnglat: [-89.08, 17.08], icon: 'landmark', label: 'Tipuj', note: 'Maya town on the Macal River' },
  },
  show: ['nito-1500'],
});

writePlan(`${G}/020-missions`, {
  emblem: water(lake.coarse),
  routes: {
    'fuensalida-1618': {
      name: 'Fuensalida and Orbita from Mérida by Bacalar and Tipuj to Nojpetén, 1618',
      path: [[-89.62, 20.97], [-89.29, 20.2], [-88.95, 19.9], [-88.59, 19.585], [-88.45, 19.1], [-88.395, 18.677], [-88.36, 18.5], [-88.38, 18.3],
        [-88.5, 18.05], [-88.65, 17.75], [-88.85, 17.4], [-89.08, 17.08], [-89.35, 17.02], [-89.62, 16.98], [-89.75, 16.95], NOJPETEN],
    },
  },
  markers: {
    'merida-1618': { lnglat: [-89.624, 20.967], icon: 'church', color: 'spain', label: 'Mérida', note: 'The friars set out, 1618' },
    'bacalar-1618': { lnglat: [-88.39, 18.68], icon: 'castle', color: 'spain', label: 'Salamanca de Bacalar', note: 'Its alcalde escorts the friars' },
    'tipu-1618': { lnglat: [-89.08, 17.08], icon: 'church', color: 'spain', label: 'Tipuj', note: 'Christian Maya town' },
    'nojpeten-1618': { lnglat: NOJPETEN, icon: 'crown', color: 'itza', label: 'Nojpetén', note: 'Friars expelled, 1619' },
    'sakalum-1624': { lnglat: [-89.14, 18.28], icon: 'skull', color: 'spain', label: 'Sakalum', note: 'Mirones killed, 27 January 1624' },
    'oxkutzcab-1624': { lnglat: [-89.418, 20.303], icon: 'user', color: 'xiu', label: 'Oxkutzcab', note: 'Fernando Kamal’s 150 archers' },
  },
});

writePlan(`${G}/030-ursua-road`, {
  emblem: water(lake.coarse),
  routes: {
    'camino-real-1695': { name: 'The road from Campeche towards Lake Petén Itzá, 1695 to 1696', path: ROAD },
    'diaz-de-velasco-1695': {
      name: 'Díaz de Velasco from Cahabón to Lake Petén Itzá, March to April 1695',
      path: [[-89.8125, 15.6056], [-89.65, 15.75], [-89.5, 15.95], [-89.44, 16.2], [-89.55, 16.45], [-89.72, 16.68], [-89.86, 16.89]],
    },
  },
  markers: {
    'campeche-1695': { lnglat: [-90.53, 19.85], icon: 'castle', color: 'spain', label: 'Campeche', note: 'The road begins, 1695' },
    'chuntuki-1695': { lnglat: [-90.03, 17.48], icon: 'castle', color: 'spain', label: 'Chuntuki', note: 'Fort and base of the road' },
    'chich-1696': { lnglat: [-89.925, 16.9487], icon: 'swords', color: 'itza', label: 'Ch\'ich\'', note: 'Zubiaur’s party attacked, 2 February 1696' },
    'cahabon-1695': { lnglat: [-89.8125, 15.6056], icon: 'flag', color: 'spain', label: 'Cahabón', note: 'Díaz de Velasco sets out, 1695' },
  },
});

writePlan(`${G}/050-after-nojpeten`, {
  bbox: [-89.99, 16.86, -89.6, 17.06],
  emblem: water(lake.whole),
  markers: {
    'remedios-1697': { lnglat: NOJPETEN, icon: 'castle', color: 'spain', label: 'Los Remedios', note: 'Garrison, fortress-prison finished 1700' },
    'san-jose-1702': { lnglat: [-89.901, 16.9836], icon: 'church', color: 'itza', label: 'San José', note: 'Mission town, Itza still spoken' },
    'zacpeten-1697': { lnglat: [-89.65, 16.983], icon: 'landmark', color: 'itza', label: 'Zacpetén', note: 'Kowoj town on Lake Salpetén' },
  },
});
