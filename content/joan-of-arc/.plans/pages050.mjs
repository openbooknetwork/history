// Writes the page files, routes and markers of section 050, paris-and-compiegne. Run from the repo root:
//   node content/joan-of-arc/.plans/pages050.mjs
// Each page file it writes opens with a comment naming this script: change a page here and run it again, never by
// hand. The plan is content/joan-of-arc/.plan/050-paris-and-compiegne/{pages,map}.yaml. Every route but the sortie
// at Compiègne is a reconstruction: the sources give the stations and no road, and the comment over each says what
// the line follows. Marker places are the plan's, and the zone generator's (zones.mjs, T) where it has the place.
import fs from 'node:fs';
import path from 'node:path';

const SEC = 'content/joan-of-arc/pages/050-paris-and-compiegne';
const HEAD = '# Written by content/joan-of-arc/.plans/pages050.mjs. Change it there and run it again.\n';
const q = s => JSON.stringify(s);

const P = {
  // the road of August 1429, from Provins where 040 ends
  provins: [3.30, 48.56], nangis: [3.015, 48.555], bray: [3.24, 48.41], coulommiers: [3.08, 48.81],
  laFerteMilon: [3.13, 49.175], crepy: [2.89, 49.23], lagnyLeSec: [2.745, 49.075], dammartin: [2.68, 49.055],
  baron: [2.73, 49.165], montepilloy: [2.70, 49.21], mitry: [2.62, 48.98], thieux: [2.665, 49.01],
  louvres: [2.505, 49.04], victoire: [2.62, 49.19], senlis: [2.59, 49.21], compiegne: [2.83, 49.42],
  paris: [2.352, 48.857], beauvais: [2.08, 49.43], creil: [2.47, 49.26], pontSainteMaxence: [2.60, 49.30],
  choisy: [2.88, 49.44], gournay: [2.70, 49.49], aumale: [1.75, 49.77], blangy: [1.63, 49.93], lagny: [2.71, 48.87],
  // Paris, 7-8 September: the gates on the line of the wall of Charles V, as the plan places them
  saintDenisTown: [2.355, 48.936], saintDenisAbbey: [2.36, 48.936], laChapelle: [2.36, 48.89],
  porteSaintDenis: [2.352, 48.867], porteSaintHonore: [2.337, 48.863],
  // the pig market: outside the wall before the Porte Saint-Honoré, a few hundred metres north-west of the card
  pigMarket: [2.3325, 48.8662],
  // the road south, September 1429
  sens: [3.28, 48.20], yonneFord: [3.255, 48.226], courtenay: [3.06, 48.04], chateauRenard: [2.93, 47.93],
  montargis: [2.73, 48.00], gien: [2.63, 47.69],
  // the upper Loire, autumn 1429
  bourges: [2.399, 47.081], mehun: [2.21, 47.15], saintPierre: [3.12, 46.80], moulins: [3.33, 46.57],
  laCharite: [3.02, 47.18], cosne: [2.93, 47.41],
  // spring 1430
  sully: [2.38, 47.77], melun: [2.66, 48.54],
  // Compiègne, May 1430: the town on the left bank of the Oise, the bridge by the card, the posts on the right bank
  bridge: [2.8275, 49.4195], coudun: [2.81, 49.47], clairoix: [2.85, 49.44], margny: [2.82, 49.43], venette: [2.80, 49.42],
};

const route = (name, color, coords, extra = {}) => ({ type: 'Feature',
  properties: { name, style: 'solid', arrows: true, color, ...extra },
  geometry: { type: 'LineString', coordinates: coords } });

const pages = [
  { dir: '010-montepilloy', id: 'montepilloy',
    title: 'Montépilloy', date: 'August 1429', when: '1429-08-14',
    bbox: [1.45, 48.3, 3.6, 50.0],
    zones: ['france-compiegne-1429', 'english-compiegne-1429', 'burgundy-1420', 'brittany-1407'],
    routes: ['france-1429-bray', 'france-1429-montepilloy', 'english-1429-montepilloy', 'english-1429-paris', 'france-1429-compiegne'],
    routeFiles: {
      // Provins west to Nangis, south-east to Bray on the Seine, where the army turned back, and north past Provins
      // to Coulommiers, La Ferté-Milon and Crépy; the towns are Cagny's, Ramsay's and the Journal's, the roads no source's
      'france-1429-bray': route("Charles VII's army marches from Provins by Nangis towards Bray, and turns north by Coulommiers and La Ferté-Milon to Crépy, 5–11 August 1429", 'france',
        [P.provins, [3.16, 48.565], P.nangis, [3.13, 48.48], P.bray, [3.20, 48.50], [3.17, 48.62], [3.12, 48.72], P.coulommiers,
          [3.11, 48.95], [3.14, 49.08], P.laFerteMilon, [3.01, 49.21], P.crepy]),
      // south-west from Crépy to Lagny-le-Sec and Dammartin, then north by Baron to Montépilloy (Cagny, Ramsay)
      'france-1429-montepilloy': route("Charles VII's army goes from Crépy by Lagny-le-Sec and Dammartin, and from Baron to Montépilloy, 12–14 August 1429", 'france',
        [P.crepy, [2.82, 49.15], P.lagnyLeSec, P.dammartin, [2.71, 49.11], P.baron, P.montepilloy]),
      // Mitry north-east to Thieux, west to Louvres on the road from Paris to Senlis, and north up it to the camp on
      // the Nonette (Ramsay)
      'english-1429-montepilloy': route("John, Duke of Bedford's army goes from Mitry by Thieux and Louvres to Notre-Dame-de-la-Victoire, 13–14 August 1429", 'english',
        [P.mitry, P.thieux, [2.58, 49.03], P.louvres, [2.53, 49.10], [2.58, 49.16], P.victoire]),
      // back by Senlis and down the road to Paris, east of the way out so the two stand apart
      'english-1429-paris': route("John, Duke of Bedford's army falls back by Senlis to Paris, 16 August 1429", 'english',
        [P.victoire, P.senlis, [2.56, 49.12], [2.47, 49.02], [2.40, 48.93], P.paris], { offset: 4 }),
      // back to Crépy, then north to Compiègne (Cagny)
      'france-1429-compiegne': route('Charles VII goes from Montépilloy by Crépy to Compiègne, 16–18 August 1429', 'france',
        [P.montepilloy, [2.80, 49.225], P.crepy, [2.88, 49.32], [2.85, 49.38], P.compiegne]),
    },
    markers: {
      'bray-held-1429': { lnglat: P.bray, icon: 'shield-x', color: 'english', label: 'Bray',
        note: "Charles VII's army means to cross the Seine by its bridge early in August 1429, but its townsmen let in English and Burgundian troops overnight" },
      'crepy-1429': { lnglat: P.crepy, icon: 'flag', color: 'france', label: 'Crépy',
        note: "Charles VII's quarters, where a letter of challenge from John, Duke of Bedford reaches him on 11 August 1429 and Compiègne's keys are brought to him on 17 August" },
      'montepilloy': { lnglat: P.montepilloy, icon: 'swords', color: 'france', label: 'Montépilloy', rank: 2,
        image: 'montepilloy-castle-ruins',
        note: "Charles VII's army lodges by a hedge in its fields, about two leagues from Senlis, and faces John, Duke of Bedford's army on 14 and 15 August 1429 (Lowell's date); there are skirmishes and no battle" },
      'victoire-1429': { lnglat: P.victoire, icon: 'tent', color: 'english', label: 'Notre-Dame-de-la-Victoire', rank: 1,
        note: "John, Duke of Bedford's camp by this abbey on the Nonette, half a league from Senlis, fortified overnight with stakes, ditches and carts, 14–16 August 1429" },
      'senlis-1429': { lnglat: P.senlis, icon: 'key', color: 'france', label: 'Senlis', rank: 1,
        image: 'senlis-cathedral',
        note: "Yields by treaty to Louis de Bourbon, Count of Vendôme, after John, Duke of Bedford falls back; Charles VII's letters of abolition are dated 22 August 1429, and Vendôme stays as its governor" },
      'compiegne-1429': { lnglat: P.compiegne, icon: 'key', color: 'france', label: 'Compiègne', rank: 2,
        note: 'Sends its keys to Charles VII at Crépy on 17 August 1429; he enters on 18 August and makes Guillaume de Flavy its captain, and a truce with the Duke of Burgundy is signed here on 28 August' },
      'beauvais-1429': { lnglat: P.beauvais, icon: 'flag', color: 'france', label: 'Beauvais',
        note: 'Comes over to Charles VII in the second half of August 1429 and drives out its bishop, Pierre Cauchon' },
      'creil-1429': { lnglat: P.creil, icon: 'flag', color: 'france', label: 'Creil',
        note: 'Comes over to Charles VII in August 1429 (Monstrelet, Ramsay); Jacques de Chabannes is left as its captain' },
      'pont-sainte-maxence-1429': { lnglat: P.pontSainteMaxence, icon: 'flag', color: 'france', label: 'Pont-Sainte-Maxence',
        note: 'Its bridge over the Oise comes over to Charles VII in August 1429 (Monstrelet, Ramsay)' },
      'choisy-1429': { lnglat: P.choisy, icon: 'castle', color: 'france', label: 'Choisy', rank: 1,
        note: 'A castle on the Oise that comes over to Charles VII in August 1429 (Monstrelet)' },
      'gournay-1429': { lnglat: P.gournay, icon: 'flag', color: 'france', label: 'Gournay-sur-Aronde',
        note: 'Comes over to Charles VII in August 1429 (Monstrelet)' },
      'aumale-1429': { lnglat: P.aumale, icon: 'flag', color: 'france', label: 'Aumale',
        note: "Changes hands during Charles VII's talks with the Duke of Burgundy, August 1429 (Ramsay)" },
      'blangy-1429': { lnglat: P.blangy, icon: 'flag', color: 'france', label: 'Blangy',
        note: "Changes hands during Charles VII's talks with the Duke of Burgundy, August 1429 (Ramsay)" },
      'lagny-1429': { lnglat: P.lagny, icon: 'flag', color: 'france', label: 'Lagny',
        note: 'A small walled town on the south bank of the Marne that acknowledges Charles VII in August 1429 (Lowell); Ambroise de Loré is later made its captain' },
    } },
  { dir: '020-paris', id: 'paris',
    title: 'The Porte Saint-Honoré', date: 'September 1429', when: '1429-09-08',
    bbox: [2.27, 48.84, 2.42, 48.95], battle: 'paris-1429',
    zones: ['france-sep-1429', 'english-sep-1429', 'burgundy-1420', 'brittany-1407'],
    routes: ['france-1429-paris'],
    routeFiles: {
      // south down the road from Saint-Denis to La Chapelle (the Journal: midway on that road), then west outside
      // the line of the wall of Charles V to the pig market before the gate, which no source draws
      'france-1429-paris': route("Charles VII's army goes from Saint-Denis by La Chapelle to the pig market before the Porte Saint-Honoré, 7–8 September 1429", 'france',
        [P.saintDenisTown, [2.357, 48.92], [2.359, 48.905], P.laChapelle, [2.358, 48.881], [2.350, 48.877], [2.342, 48.873],
          [2.336, 48.870], P.pigMarket]),
    },
    markers: {
      'saint-denis-1429': { lnglat: P.saintDenisTown, icon: 'flag', color: 'france', label: 'Saint-Denis',
        note: 'Taken by Joan and the Duke of Alençon on 25 August 1429 (the Bourgeois of Paris; Cagny has them lodge here on the 26th); from it they skirmish at Paris for a fortnight, and Charles VII comes on 7 September' },
      'la-chapelle-1429': { lnglat: P.laChapelle, icon: 'tent', color: 'france', label: 'La Chapelle',
        note: 'A village midway between Saint-Denis and Paris, where Joan and her captains lodge on 7 September 1429, and to which she is carried back wounded next day' },
      'porte-saint-denis-1429': { lnglat: P.porteSaintDenis, icon: 'door-closed', color: 'english', label: 'Porte Saint-Denis', rank: 1,
        note: "A gate of Paris from which its defenders threaten a sally on 8 September 1429, while the Duke of Alençon covers Joan's attack; its place is approximate" },
      'porte-saint-honore': { lnglat: P.porteSaintHonore, icon: 'door-closed', color: 'english', label: 'Porte Saint-Honoré', rank: 2,
        image: 'paris-charles-v-wall-plan',
        note: 'Joan, Gilles de Rais and Raoul de Gaucourt attack it from the pig market on 8 September 1429; its barrier and boulevard are fired and taken, but its inner moat is full of water, and Joan is wounded there by a crossbow bolt; its place is approximate' },
    } },
  { dir: '030-back-to-the-loire', id: 'back-to-the-loire',
    title: 'Back to the Loire', date: 'September 1429', when: '1429-09-13',
    bbox: [2.0, 47.55, 3.55, 49.0],
    zones: ['france-sep-1429', 'english-sep-1429', 'burgundy-1420', 'brittany-1407'],
    routes: ['france-1429-back-to-gien'],
    routeFiles: {
      // east to Lagny on the Marne, south-east to Provins, south to Bray on the Seine, on past Sens to a ford of the
      // Yonne a little below it, and south-west by Courtenay, Château-Renard and Montargis to Gien; the towns are the
      // Journal's, in its order, the ford's place and the roads no source's
      'france-1429-back-to-gien': route("Charles VII leads his army from Saint-Denis by Lagny, Provins, Bray, Courtenay and Montargis to Gien, 13–21 September 1429", 'france',
        [P.saintDenisAbbey, [2.50, 48.92], P.lagny, [2.90, 48.76], [3.12, 48.65], P.provins, [3.28, 48.48], P.bray, [3.27, 48.31],
          P.yonneFord, [3.17, 48.13], P.courtenay, P.chateauRenard, P.montargis, [2.68, 47.85], P.gien]),
    },
    markers: {
      'saint-denis-abbey': { lnglat: P.saintDenisAbbey, icon: 'church', color: 'france', label: 'Saint-Denis',
        image: 'saint-denis-basilica',
        note: "Joan offers her whole white armour, with a sword won before Paris, to this abbey's image of Our Lady and its relics, September 1429; she told her judges her voice had bidden her stay here" },
      'bray-1429': { lnglat: P.bray, icon: 'key', color: 'france', label: 'Bray',
        note: "Held against Charles VII in August, it yields to him on his way south in September 1429, and his army crosses the Seine by its bridge" },
      'gien-disbanded': { lnglat: P.gien, icon: 'flag-off', color: 'france', label: 'Gien',
        note: 'Charles VII dines here on 21 September 1429 and his army is disbanded: the Duke of Alençon goes home to Beaumont, and other captains to their frontiers' },
    } },
  { dir: '040-saint-pierre-and-la-charite', id: 'saint-pierre-and-la-charite',
    title: 'Saint-Pierre-le-Moûtier and La Charité', date: 'October – December 1429', when: '1429-10',
    bbox: [1.9, 46.45, 3.65, 47.55],
    zones: ['france-sep-1429', 'english-sep-1429', 'burgundy-1420', 'brittany-1407'],
    routes: ['france-1429-saint-pierre', 'france-1429-la-charite'],
    routeFiles: {
      // only the two ends are given: east across the Berry to the Allier and Saint-Pierre
      'france-1429-saint-pierre': route('Joan and Charles d\'Albret lead their force from Bourges to Saint-Pierre-le-Moûtier, October – November 1429', 'france',
        [P.bourges, [2.65, 47.00], [2.92, 46.88], P.saintPierre]),
      // south up the Allier to Moulins, where the letters of 9 November were written, and back north down the Allier
      // and the Loire to La Charité, east of the way out so the two legs stand apart
      'france-1429-la-charite': route('Joan and Charles d\'Albret go from Saint-Pierre-le-Moûtier by Moulins to besiege La Charité, November 1429', 'france',
        [P.saintPierre, [3.20, 46.67], P.moulins, [3.30, 46.72], [3.22, 46.90], [3.12, 47.06], P.laCharite]),
    },
    markers: {
      'mehun-1429': { lnglat: P.mehun, icon: 'crown', color: 'france', label: 'Mehun-sur-Yèvre',
        note: "Charles VII's council resolves here to take La Charité, and Saint-Pierre-le-Moûtier first; here in December 1429 (on 29 December, Thurston) Charles VII ennobles Joan and her family" },
      'bourges-1429': { lnglat: P.bourges, icon: 'flag', color: 'france', label: 'Bourges',
        note: "Joan stays about three weeks in October 1429 in Marguerite La Touroulde's house and gathers her force; its townsmen are asked for 1,300 crowns for La Charité's siege on 24 November" },
      'saint-pierre-le-moutier': { lnglat: P.saintPierre, icon: 'castle', color: 'france', label: 'Saint-Pierre-le-Moûtier',
        image: 'saint-pierre-le-moutier-church',
        note: 'Burgundian since 1422 (Lowell), it is taken by assault by 9 November 1429 after a first assault fails; Joan stops her soldiers pillaging its church' },
      'moulins-1429': { lnglat: P.moulins, icon: 'scroll-text', color: 'france', label: 'Moulins',
        note: "Joan and Charles d'Albret write from here on 9 November 1429 to Riom for powder, saltpetre, sulphur, arrows and crossbows for La Charité's siege" },
      'la-charite': { lnglat: P.laCharite, icon: 'castle', color: 'burgundy', label: 'La Charité',
        image: 'la-charite-priory',
        note: "Perrinet Gressart's town on the Loire, held for Burgundy since 1423; besieged from about 10 November 1429 for about a month, an assault fails and its siege is raised with loss of artillery; it stays Gressart's" },
      'cosne-1429': { lnglat: P.cosne, icon: 'flag', color: 'burgundy', label: 'Cosne',
        note: "A town on the Loire held against Charles VII in autumn 1429, named with La Charité in Charles d'Albret's letter of 9 November" },
    } },
  { dir: '050-melun-and-lagny', id: 'melun-and-lagny',
    title: 'Melun and Lagny', date: 'March – May 1430', when: '1430-03',
    bbox: [2.0, 47.6, 3.1, 49.0],
    zones: ['france-sep-1429', 'english-sep-1429', 'burgundy-1420', 'brittany-1407'],
    routes: ['joan-1430-lagny'],
    routeFiles: {
      // north from Sully across the Gâtinais to Melun on the Seine, and north to Lagny on the Marne; the towns are
      // Cagny's, her own answer's and Lowell's, the roads no source's
      'joan-1430-lagny': route('Joan rides with her company from Sully by Melun to Lagny, spring 1430', 'joan',
        [P.sully, [2.44, 47.98], [2.55, 48.28], P.melun, [2.70, 48.70], P.lagny]),
    },
    markers: {
      'sully-1430': { lnglat: P.sully, icon: 'flag', color: 'france', label: 'Sully',
        note: "Charles VII's court is here late in March 1430, when Joan leaves it with her small household without his leave" },
      'melun-1430': { lnglat: P.melun, icon: 'key', color: 'france', label: 'Melun',
        image: 'melun-notre-dame',
        note: "English and then Burgundian since Henry V took it, it drives out its garrison about Easter 1430 and comes over to Charles VII; in its trenches in Easter week Joan's voices tell her she will be taken before Saint John's Day" },
      'lagny-1430': { lnglat: P.lagny, icon: 'shield', color: 'france', label: 'Lagny',
        note: "Charles VII's town on the Marne, whose garrison makes war on Paris's English; from it Joan defeats and takes Franquet d'Arras, who is tried and beheaded here, April or May 1430" },
    } },
  { dir: '060-compiegne', id: 'compiegne',
    title: 'Compiègne', date: 'May 1430', when: '1430-05',
    bbox: [2.65, 49.18, 3.4, 49.52], battle: 'compiegne-1430',
    zones: ['france-sep-1429', 'english-sep-1429', 'burgundy-1420', 'brittany-1407'],
    routes: ['joan-1430-compiegne', 'joan-1430-sortie', 'burgundy-1430-clairoix', 'english-1430-venette'],
    routeFiles: {
      // only the two ends are given: north from Crépy through the forest to the town on the left bank
      'joan-1430-compiegne': route('Joan rides by night from Crépy into Compiègne, May 1430', 'joan',
        [P.crepy, [2.88, 49.32], [2.85, 49.39], [2.832, 49.414]]),
      // over the bridge and along the causeway to Margny (her own answer, Monstrelet)
      'joan-1430-sortie': route('Joan sorties over the bridge of Compiègne against the Burgundian post at Margny, 23 May 1430', 'joan',
        [P.bridge, [2.824, 49.425], P.margny]),
      // only the two ends are given
      'burgundy-1430-clairoix': route('John of Luxembourg rides from Clairoix to Margny against the sortie, 23 May 1430', 'burgundy',
        [P.clairoix, [2.835, 49.435], P.margny]),
      // from Venette across the meadows to the end of the bridge, which no source places further
      'english-1430-venette': route('The English from Venette cut Joan off from the bridge of Compiègne, 23 May 1430', 'english',
        [P.venette, [2.815, 49.421], [2.826, 49.4205]]),
    },
    markers: {
      'choisy-1430': { lnglat: P.choisy, icon: 'flame', color: 'burgundy', label: 'Choisy', rank: 1,
        note: "Charles VII's castle on the Oise, held by Louis de Flavy for his brother; Philip the Good takes it in May 1430, razes it and bridges the Oise to come at Compiègne" },
      'soissons-1430': { lnglat: [3.32, 49.38], icon: 'shield-x', color: 'burgundy', label: 'Soissons',
        note: "Held for Charles VII by a captain bought by Burgundy, it shuts its gates on Joan's army in May 1430 (18 May, Lang), and is sold to the Duke of Burgundy weeks later" },
      'crepy-1430': { lnglat: P.crepy, icon: 'flag', color: 'france', label: 'Crépy',
        note: 'Joan hears here that the Duke of Burgundy and the Earl of Arundel besiege Compiègne, and rides out about midnight with her company, May 1430' },
      'compiegne-1430': { lnglat: P.compiegne, icon: 'castle', color: 'france', label: 'Compiègne', rank: 1,
        note: 'Besieged by the Duke of Burgundy from May 1430; Joan rides in at sunrise (Cagny) and sorties that afternoon over its bridge; its captain raises it and shuts the gate behind her' },
      'coudun-1430': { lnglat: P.coudun, icon: 'tent', color: 'burgundy', label: 'Coudun', rank: 1,
        note: "The Duke of Burgundy's quarters, a league from Compiègne, whence he writes to Saint-Quentin of Joan's capture; he arrives after she is taken and speaks with her" },
      'clairoix-1430': { lnglat: P.clairoix, icon: 'tent', color: 'burgundy', label: 'Clairoix', rank: 2,
        note: "John of Luxembourg's quarters, whence he rides to Margny against Joan's sortie; she is kept in his lodging three or four days (Cagny)" },
      'margny-1430': { lnglat: P.margny, icon: 'tent', color: 'burgundy', label: 'Margny', rank: 3,
        note: "Baudot de Noyelle's post at the far end of a causeway from Compiègne's bridge, which Joan drives back twice; she is taken in fields between it and Compiègne's boulevard, and led here" },
      'venette-1430': { lnglat: P.venette, icon: 'tent', color: 'english', label: 'Venette', rank: 1,
        note: "English quarters under Lord Montgomery in meadows by the Oise, whence English troops cut Joan off from Compiègne's bridge" },
    } },
];

// The sources of each page are the plan's (text.yaml, each page's `sources`).
const plan = fs.readFileSync('content/joan-of-arc/.plan/050-paris-and-compiegne/text.yaml', 'utf8');
const planSources = id => {
  const at = plan.indexOf(`\n  ${id}:\n`);
  if (at < 0) throw new Error('no page ' + id + ' in text.yaml');
  const rest = plan.slice(at + 1);
  const next = rest.slice(1).search(/\n  [a-z][a-z-]*:\n/);
  const block = next < 0 ? rest : rest.slice(0, next + 1);
  const m = block.match(/\n    sources:\n((?:      - .*\n)+)/);
  if (!m) throw new Error('no sources for ' + id);
  return m[1].split('\n').filter(Boolean).map(l => JSON.parse(l.replace(/^ {6}- /, '')));
};

const list = a => '[' + a.map(x => Array.isArray(x) ? list(x) : x).join(', ') + ']';
const yamlMarker = (id, m) => {
  let s = `${id}:\n  lnglat: [${m.lnglat.join(', ')}]\n  icon: ${m.icon}\n`;
  if (m.color) s += `  color: ${m.color}\n`;
  if (m.image) s += `  image: ${m.image}\n`;
  s += `  label: ${q(m.label)}\n  note: ${q(m.note)}\n`;
  if (m.rank) s += `  rank: ${m.rank}\n`;
  return s;
};

fs.mkdirSync(SEC, { recursive: true });
fs.writeFileSync(path.join(SEC, 'group.yaml'), HEAD + 'title: "Paris and Compiègne"\n');
for (const p of pages) {
  const dir = path.join(SEC, p.dir);
  fs.mkdirSync(path.join(dir, 'routes'), { recursive: true });
  let y = HEAD + `title: ${q(p.title)}\ndate: ${q(p.date)}\nwhen: ${p.when}\nbbox: [${p.bbox.join(', ')}]\n` +
    `zones: ${list(p.zones)}\nroutes: ${list(p.routes)}\nmarkers: ${list(Object.keys(p.markers))}\n`;
  if (p.battle) y += `battle: ${p.battle}\n`;
  // A reviewer may fill the sources in page.yaml: a rerun keeps the lines already there.
  const file = path.join(dir, 'page.yaml');
  const old = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const kept = old.match(/^sources:\n(?:  - .*\n)+/m);
  y += kept ? kept[0] : 'sources:\n' + planSources(p.id).map(s => `  - ${q(s)}\n`).join('');
  fs.writeFileSync(file, y);
  fs.writeFileSync(path.join(dir, 'markers.yaml'),
    HEAD + Object.entries(p.markers).map(([id, m]) => yamlMarker(id, m)).join(''));
  for (const [id, f] of Object.entries(p.routeFiles)) {
    fs.writeFileSync(path.join(dir, 'routes', id + '.geojson'), JSON.stringify(f) + '\n');
  }
}
console.log('section 050: wrote', pages.length, 'pages');
