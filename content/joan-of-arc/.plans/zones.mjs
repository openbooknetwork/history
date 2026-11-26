// The zones of joan-of-arc: the kingdom of France drawn whole, and the English, Burgundian, Breton, Lorraine and Bar
// lands that the families of a lower priority number cut out of it on each page. Run from the repo root:
//   node content/joan-of-arc/.plans/zones.mjs
// It writes content/joan-of-arc/shared/zones/<id>.geojson and the manifest content/joan-of-arc/.plan/ground.yaml.
// The zones.yaml entries beside the zones (the france stages and english-1429) are written by hand: each france
// stage takes the outline of france-1407 and shares its pages with one english zone alone, since a zone is cut
// once for the whole story by every zone that shares any page with it (agents/pages.md).
//
// Every zone is a reconstruction (the brief's Map part): the sources give the holdings by province and by town,
// never by a line. A line is sourced where a claim names the river or the province it runs along, and a province
// is drawn by the départements of today that carry its name in Natural Earth (Normandy, Brittany, Champagne, the
// Île-de-France, Flanders, the duchy and the county of Burgundy). Natural Earth lacks the Meuse in France and no
// OpenStreetMap server answered, so the Meuse is drawn by hand through the towns on its banks.
//
// How the zones fit. english (priority 0) cuts every other family, burgundy (1) cuts brittany, lorraine, bar and
// france, and so on. So a zone may overrun a neighbour of a higher priority where that neighbour holds the land on
// every page the two share: burgundy-1420 and bar-1412 overrun Normandy and Champagne, which english-1420 holds,
// and the build trims them along the English edge. English land never overruns Brittany, which every english zone
// shares a page with, so each english zone is cut by the duchy before it is written.
import { draw } from '../../../scripts/zones-lib.mjs';
const z = draw('joan-of-arc');
const end = l => l.points.at(-1), start = l => l.points[0];

// ---------------------------------------------------------------------------------------------------------------
// Provinces of today that the claims name
const NORMANDY = z.area('010.38', z.feature('normandie'));          // the whole duchy, Mont-Saint-Michel aside, by 1419
const BRETAGNE = z.area('010.57', z.feature('brittany'));           // "Brittany its own prince's"
const CHAMPAGNE = z.area('020.8', z.feature('champana-ardenne'));   // "Champagne, with Troyes and Reims, was Anglo-Burgundian"
const IDF = z.area('010.46', z.feature('ile-de-france'));           // Oman: Henry acknowledged over the Île-de-France
const FLANDERS = z.area('010.7', z.feature('flanders'));            // Lowell: "the trading cities of Flanders"
const DUCHY = z.union(z.area('010.7', z.feature('cote-d-or')), z.area('010.7', z.feature('saone-et-loire')));   // the duchy of Burgundy
const COUNTY = z.area('010.7', z.feature('franco-condado'));        // the county of Burgundy, the Franche-Comté
const DAUPHINE = z.union(z.area('010.57', z.feature('isere')), z.area('010.57', z.feature('drome')), z.area('010.57', z.feature('hautes-alpes')));   // "together with Dauphiny": the three départements made of the province

// The county of Nantes, the duchy's land on the lower Loire, which the Bretagne of today leaves out
const NANTES = z.region(z.est('the county of Nantes, the duchy of Brittany\'s land on the lower Loire (010.57 names Brittany; the Bretagne of today leaves it out): its march with Anjou and Poitou drawn in few points', [[-2.70, 47.62], [-2.10, 47.75], [-1.40, 47.88], [-1.15, 47.72], [-1.12, 47.35], [-1.30, 47.10], [-1.70, 46.97], [-2.08, 47.06]]),
  z.est('the open sea off the Loire: the coast cuts it', [[-2.08, 47.06], [-2.70, 47.20], [-2.70, 47.62]]));
const BRITTANY = z.union(BRETAGNE, NANTES);

// ---------------------------------------------------------------------------------------------------------------
// The kingdom's edge
// KB: from Flanders to the Meuse, between the kingdom and Hainaut, the Cambrésis and the Empire
const KBa = z.est('the edge of Flanders and Artois with Hainaut along the Scheldt, Lille, Douai and Arras inside (010.7, 060.18); no source gives the line', [[3.65, 50.60], [3.45, 50.45], [3.25, 50.30], [3.05, 50.15]]);
const KBb = z.est('the kingdom\'s edge with the Cambrésis and Hainaut: Saint-Quentin and Beaurevoir inside, Cambrai and Le Cateau outside; no source gives the line', [end(KBa), [3.22, 50.06], [3.45, 50.06], [3.65, 50.05], [4.10, 50.00]]);
const KBc = z.est('the kingdom\'s edge from the Thiérache to the Meuse at Mézières, the brief\'s "east to the Meuse"; no source gives the line', [end(KBb), [4.45, 49.99], [4.60, 49.90], [4.72, 49.77]]);
// The Meuse: the kingdom's edge in the brief, with Vaucouleurs on it (020.62) and Domrémy French (020.9)
const MEUSE_WHY = 'the Meuse, the kingdom\'s edge on the east (the brief; 020.62 has Vaucouleurs on it, 020.9 Domrémy belonging to France): Natural Earth lacks the river in France and no OpenStreetMap server answered, so it is drawn through the towns on its banks';
const M1 = z.est(MEUSE_WHY, [end(KBc), [4.94, 49.70], [5.08, 49.60], [5.19, 49.49], [5.18, 49.38], [5.30, 49.25], [5.38, 49.16], [5.50, 48.98], [5.54, 48.89], [5.59, 48.76], [5.66, 48.69], [5.684, 48.66]]);
const M2 = z.est(MEUSE_WHY + ': by Vaucouleurs, Greux and Domrémy on its west bank', [end(M1), [5.686, 48.60], [5.686, 48.52], [5.686, 48.445]]);
const M3 = z.est(MEUSE_WHY + ': up to its source in the Bassigny, Neufchâteau on its west bank', [end(M2), [5.69, 48.40], [5.71, 48.36], [5.66, 48.25], [5.60, 48.15], [5.62, 47.98]]);
const MS = z.est('the kingdom\'s edge from the source of the Meuse to the Saône by Langres; no source gives it, and the county of Burgundy covers most of it', [end(M3), [5.90, 47.90], [5.85, 47.55], [5.50, 47.25]]);
const SAONE = z.est('the Saône, the kingdom\'s edge on the east in the brief, down to Lyon; no claim names it, and the duchy and the county of Burgundy cover it above Mâcon', [end(MS), [5.25, 46.75], [4.88, 46.32], [4.79, 46.15], [4.76, 46.02], [4.83, 45.77]]);
const DLINE = z.est('a line inside Dauphiné from Lyon to the Rhône by Pierrelatte: the province itself (010.57) is drawn by its départements, and this line only joins them to the land west of the Rhône', [end(SAONE), [5.05, 45.77], [5.10, 45.55], [5.00, 44.60], [4.70, 44.33]]);
const RHONE = z.src('010.57', z.feature('rhone'), end(DLINE), [4.63, 43.72]);   // "between the Garonne and the Rhone"
const SEA = z.est('the open sea round the kingdom and the Pyrenees: the coast and the clip to France cut it', [end(RHONE), [4.55, 43.30], [3.60, 42.90], [3.30, 42.35], [1.50, 42.00], [-1.00, 42.30], [-1.90, 43.20], [-2.30, 43.50], [-1.90, 45.60], [-3.00, 47.00], [-5.80, 48.00], [-5.80, 48.70], [-2.30, 49.85], [-1.00, 49.80], [0.80, 50.20], [1.30, 50.80], [1.75, 51.05], [2.50, 51.20]]);
const NCLOSE = z.est('a line inside Flanders, which burgundy holds on every page: it only closes the kingdom', [end(SEA), [3.50, 50.80], start(KBa)]);
// Champagne to the Meuse: the province the English hold to 1429 is the kingdom's after it, the Rethélois too. The
// Champagne-Ardenne of today runs past the river, and no claim gives the kingdom the Givet salient or the land of Sedan
// and Carignan east of the Meuse, so a mask cuts them off along the kingdom's edge (cloud ruling, story-overseer-4).
// Bar, Lorraine and Burgundy are still cut by the whole province, so that land stands in no zone.
const CHAMPAGNE_K = z.diff(CHAMPAGNE, z.mask([...KBc.points, ...M1.points.slice(1, 4), [5.60, 49.49], [5.60, 50.40], [4.10, 50.40]]));
// Roussillon and the Cerdagne, the crown of Aragon's, which the clip to France of today would put in the kingdom
const CORB = z.est('the kingdom\'s edge with Roussillon and the Cerdagne, which were the crown of Aragon\'s: along the Corbières and round the Cerdagne, after the Pyrénées-Orientales of today, by the cloud ruling (story-overseer-5); no claim gives the line', [[3.15, 42.93], [2.86, 42.91], [2.38, 42.85], [2.33, 42.71], [2.10, 42.66], [1.96, 42.60], [1.72, 42.54]]);
const ROUSSILLON = z.region(CORB, z.est('south of the Pyrenees and the open sea: the clip to France cuts it, and it only closes Roussillon', [end(CORB), [1.60, 42.20], [3.60, 42.20], start(CORB)]));
const FRANCE = z.diff(z.union(z.region(KBa, KBb, KBc, M1, M2, M3, MS, SAONE, DLINE, RHONE, SEA, NCLOSE), DAUPHINE, CHAMPAGNE_K), ROUSSILLON);

// ---------------------------------------------------------------------------------------------------------------
// The English north: the line with Picardy, and the south edge of 1420
// B: Burgundian Picardy (Montdidier, Noyon, Saint-Quentin) against the English Beauvaisis, Compiègne, Soissons and Laon
const B = z.est('the edge of Burgundian Picardy, "to the Bresle and the Oise" (the brief, after 010.57 and 010.46): Montdidier, Noyon, Beaulieu and Saint-Quentin Burgundian; Beauvais, Gournay-sur-Aronde, Compiègne, Choisy, Soissons and Laon English until 1429 (050.9, 040.81); no source gives the line', [[1.70, 49.72], [2.15, 49.62], [2.55, 49.58], [2.85, 49.53], [2.95, 49.50], [3.22, 49.60], [3.40, 49.65], [3.75, 49.68], [4.10, 49.72], end(KBb)]);
// S20: Chartres, Étampes, Sens and Saint-Florentin inside; Janville, Châteaudun, Auxerre outside
const S20a = z.est('the south edge of the English north from 1420: Chartres and Étampes English to 1429 (020.13: men of Chartres reinforce Salisbury; 040.33: Fastolf flees from Patay to Étampes), Janville English only from August 1428 (020.14), Châteaudun outside; no source gives a line', [[0.80, 48.62], [1.20, 48.42], [1.50, 48.33], [1.90, 48.28], [2.30, 48.25], [2.80, 48.20], [3.10, 48.12]]);
const S20b = z.est('the English edge with the Burgundian Auxerrois: Sens and Saint-Florentin English (040.86, 040.53), Joigny, Auxerre and Cravant Burgundian (020.46, 040.51); no source gives a line', [end(S20a), [3.50, 48.00], [3.85, 47.92]]);
const S20c = z.est('the English edge with the Burgundian Tonnerrois, up to Champagne; no source gives a line', [end(S20b), [4.20, 48.05]]);
const ECLOSE = z.est('a line inside Champagne, which the province itself bounds: it only closes the land between Normandy and Champagne', [end(B), [4.45, 49.99], [4.60, 49.70], [4.35, 48.50], end(S20c)]);
const WCLOSE = z.est('a line inside Normandy, which the duchy itself bounds: it only closes the land east of it', [start(S20a), [1.20, 49.20], start(B)]);
const BETWEEN = z.region(B, ECLOSE, z.back(S20c), z.back(S20b), z.back(S20a), WCLOSE);   // the Beauvaisis, the Valois, the Soissonnais, the Laonnois, the Chartrain, the Sénonais

// The Norman bank of the Bresle, which the Seine-Maritime of Natural Earth draws a little short of Eu and Blangy
const BRESLE = z.region(z.est('the Bresle, Normandy\'s edge with Picardy (the brief): Eu, Blangy and Aumale on its Norman bank, Blangy and Aumale English until August 1429 (050.9)', [[1.36, 50.10], [1.47, 50.07], [1.66, 49.96], [1.79, 49.78], [1.80, 49.70]]),
  z.est('a line inside Normandy, which the duchy itself bounds: it only closes the bank of the Bresle', [[1.80, 49.70], [1.55, 49.75], [1.30, 49.98], [1.36, 50.10]]));
const NORMANDY2 = z.union(NORMANDY, BRESLE);

const MSM = z.town('Mont-Saint-Michel, the one place in Normandy left to the French by the end of 1419 (010.38)', [-1.511, 48.636], 3);

// Most of Maine and the Perche, English in 1428 (010.57) and to 1449 (the brief, from 070.16's Fresnay)
const SM = z.est('the edge of English Maine with Anjou and the Vendômois, after Lowell\'s "most of Maine" (010.57): Le Mans and Fresnay inside; no source gives a line', [[-1.40, 47.85], [-0.60, 47.85], [-0.10, 47.82], [0.40, 47.80], [0.75, 47.95], [0.95, 48.30]]);
const MAINE = z.diff(z.region(SM,
  z.est('a line inside English Normandy, which the duchy itself bounds: it only closes Maine and the Perche', [end(SM), [0.95, 48.70], [-1.40, 48.62]]),
  z.est('a line inside Brittany: the duchy\'s own outline cuts it', [[-1.40, 48.62], start(SM)])), BRITTANY);

// The Beauce down to the Loire, English from August 1428 to June 1429
const LOIRE = z.src('020.16', z.feature('loire'), [1.60, 47.735], [1.835, 47.881]);   // Meung and Beaugency on the north bank, between them the English held the river
const ORLW = z.est('the Loire below Orléans to the city: the Natural Earth line cuts across the city, so the river is drawn by hand past the Île Charlemagne (030.6) to the walls', [end(LOIRE), [1.860, 47.889], [1.882, 47.8925], [1.8965, 47.8962]]);
const ORLN = z.est('the English edge round the west and the north of Orléans: Saint-Laurent, London, Rouen and Paris inside (030.3, 030.4), the city and the open land to its north-east outside (030.1); no source gives the line', [end(ORLW), [1.898, 47.904], [1.904, 47.9075], [1.912, 47.9085], [1.925, 47.95], [1.96, 48.02], [2.10, 48.10], [2.35, 48.17], [2.55, 48.30]]);
const BEAUCE = z.region(LOIRE, ORLW, ORLN,
  z.est('a line inside the English north of 1428: it only closes the Beauce', [end(ORLN), [1.50, 48.45]]),
  z.est('the English edge west of the Beauce: Janville and Patay inside, Châteaudun outside (020.14, 040.42); no source gives a line', [[1.50, 48.45], [1.55, 48.05], [1.58, 47.80], start(LOIRE)]));
const JARGEAU = z.town('the bridgehead of Jargeau, the English bridge above Orléans (020.14, 020.16)', [2.125, 47.862], 3);

// Calais, Gascony, England
const CALAIS = z.region(z.est('the march of Calais, English from 1347 (010.23, 010.34, 070.26): its bounds are no source\'s, drawn some ten km round the town', [[1.65, 51.02], [1.72, 50.88], [1.90, 50.82], [2.08, 50.90], [2.12, 51.06]]),
  z.est('the open sea off Calais: the coast cuts it', [[2.12, 51.06], [1.65, 51.02]]));
const G1 = z.est('the north edge of English Gascony along the Gironde and north of the Dordogne to Castillon, "from the Gironde to Bayonne" (the brief, after 010.57 and 070.25); no source gives a line', [[-1.50, 45.70], [-1.05, 45.60], [-0.80, 45.35], [-0.55, 45.05], [-0.25, 44.98], [0.00, 44.90]]);
const G2 = z.est('the east edge of the Bordelais, Castillon inside (070.29) and the Garonne at Langon; no source gives a line', [end(G1), [0.03, 44.75], [-0.22, 44.55]]);
const G3 = z.est('the south edge of the Bordelais that the English hold in 1452-1453 (070.28): Bordeaux and the Médoc inside; no source gives a line', [end(G2), [-0.80, 44.45], [-1.50, 44.40]]);
const G4 = z.est('the inland edge of the Landes and the Labourd, Dax and Bayonne inside (070.25), drawn as the brief\'s coastal Gascony; no source gives a line', [end(G2), [-0.10, 44.30], [-0.35, 43.90], [-0.75, 43.60], [-1.05, 43.42], [-1.40, 43.28], [-1.85, 43.25]]);
const GASCONY = z.region(G1, G2, G4, z.est('the open sea off the Landes: the coast and the clip cut it', [end(G4), [-2.10, 43.50], [-1.70, 44.50], start(G1)]));
const GASCONY52 = z.region(G1, G2, G3, z.est('the open sea off the Médoc: the coast cuts it', [end(G3), [-1.70, 45.00], start(G1)]));
const ENGLAND = z.inter(z.region(z.est('the kingdom of England itself, south of the map\'s north edge (the brief)', [[-6.50, 49.80], [2.50, 49.80], [2.50, 51.60], [-6.50, 51.60], [-6.50, 49.80]])), z.country('United Kingdom'));
const ABROAD = z.union(CALAIS, GASCONY, ENGLAND);

// The north of 1420 and of 1428
const NORTH20 = z.diff(z.union(NORMANDY2, IDF, CHAMPAGNE_K, BETWEEN), MSM, BRITTANY);
const NORTH28 = z.diff(z.union(NORTH20, MAINE), MSM, BRITTANY);

// The cuts of 1429
const C1 = z.est('the English edge after the coronation road: Saint-Florentin, Troyes, Châlons and Reims gone (040.53, 040.58, 040.62, 040.63), Sens, Provins, Château-Thierry, Soissons and Laon left (040.81, 040.86); no source gives a line', [[3.47, 47.90], [3.45, 48.05], [3.55, 48.45], [3.70, 48.85], [3.75, 49.25], [3.85, 49.45], [4.05, 49.85]]);
const REIMS_CUT = z.region(C1, z.est('a line east of the kingdom: it only closes the land the English lose', [end(C1), [4.05, 50.30], [6.50, 50.30], [6.50, 47.50], [3.47, 47.50], start(C1)]));
const C2 = z.est('the English edge after the towns came over: Laon, Soissons, Château-Thierry, Crécy, Coulommiers and Provins gone with the land between the Marne and the Aisne (040.81); Meaux, Lagny, Bray, Senlis and Compiègne left until August (050.9); no source gives a line', [[3.47, 47.90], [3.45, 48.10], [3.40, 48.38], [3.15, 48.60], [2.95, 48.75], [2.83, 48.88], [2.97, 48.97], [2.80, 49.10], [2.75, 49.25], [2.95, 49.38], [3.05, 49.65]]);
const AUG_CUT = z.region(C2, z.est('a line east of the kingdom: it only closes the land the English lose', [end(C2), [3.05, 50.30], [6.50, 50.30], [6.50, 47.50], [3.47, 47.50], start(C2)]));
// Normandy stays whole: Aumale and Blangy on the Norman bank of the Bresle change hands in August 1429 (050.9) and
// are won back in 1430 (070.55, 070.56), so their markers carry the change and the cut keeps to Normandy's edge
const C3 = z.est('the English edge from the second half of August 1429: Beauvais, Gournay-sur-Aronde, Creil, Pont-Sainte-Maxence, Senlis, Compiègne and Choisy gone (050.9, 050.8, 050.25); Paris, Saint-Denis and Normandy left; the line keeps to Normandy\'s edge, since Aumale and Blangy on the Norman bank of the Bresle, which change hands in August 1429 (050.9), are won back in 1430 (070.55, 070.56) and their markers carry the change; no source gives a line', [[1.80, 49.70], [1.92, 49.52], [1.97, 49.38], [2.20, 49.25], [2.45, 49.15], [2.65, 49.12], [2.80, 49.10]]);
const SEP_CUT = z.diff(z.region(C3, z.est('a line inside the land already gone: it only closes the towns between the Oise and Paris', [end(C3), [3.30, 49.20], [3.30, 50.05], start(C3)])), NORMANDY2);
const LAGNY_CUT = z.region(z.est('Lagny on the Marne, the king\'s from August 1429 (050.9, 050.25), joined to the Brie that came over: Meaux left English to the north; no source gives a line', [[2.86, 48.83], [2.75, 48.82], [2.66, 48.84], [2.66, 48.90], [2.76, 48.91], [2.86, 48.90]]),
  z.est('a line inside the land already gone: it only closes Lagny', [[2.86, 48.90], [2.86, 48.83]]));
const BRAY_CUT = z.region(z.est('Bray on the Seine, which yields to the king in September 1429 (050.29), joined to Provins: Montereau and Sens left English; no source gives a line', [[3.40, 48.38], [3.17, 48.37], [3.17, 48.47], [3.30, 48.52]]),
  z.est('a line inside the land already gone: it only closes Bray', [[3.30, 48.52], [3.40, 48.38]]));

// Caux, gone after Arras
const CAUX_CUT = z.region(z.est('the Pays de Caux and Dieppe, lost after Arras with only Caudebec kept (070.7); Rouen and Honfleur left; no source gives a line', [[1.30, 50.10], [1.30, 49.95], [1.20, 49.70], [0.95, 49.58], [0.78, 49.56], [0.68, 49.52], [0.55, 49.46], [0.20, 49.465], [-0.30, 49.50]]),
  z.est('the open sea off the Caux: the coast cuts it', [[-0.30, 49.50], [-0.30, 50.10], [1.30, 50.10]]));

// The holds of 13 April 1436 outside Normandy: every town no source read has the English lose by then (cloud ruling
// on story-map-auditor-1). Chartres (070.59), Clermont (070.62), Sens (070.58), Pont-Sainte-Maxence and Meulan (070.63)
// are gone, and Étampes, of which no source read gives the holder, is left out (story-researcher-1)
const HOLDS36 = z.union(
  z.town('Meaux, English from 1422 to August 1439 (070.60): a hold in the king\'s land in April 1436', [2.88, 48.96], 5),
  z.town('Creil, retaken by Talbot on 20 June 1434 and English to May 1441 (070.61, 070.64)', [2.47, 49.26], 5),
  z.town('Beaumont-sur-Oise, retaken by Talbot in May 1434 (070.61); no source read has it lost by April 1436', [2.29, 49.14], 5),
  z.town('Crépy-en-Valois, stormed by Talbot in 1434 (070.61); no source read has it lost by April 1436', [2.89, 49.23], 5),
  z.town('Montereau, English until October 1437 (070.65)', [2.95, 48.38], 5),
  z.town('Mantes, English until 26 August 1449 (070.66)', [1.72, 48.99], 5));

// Lower Normandy at the close of 1449, drawn round the towns of 070.16
const COTENTIN = z.diff(z.region(z.est('round Cherbourg and Saint-Sauveur, English at the close of 1449 (070.16); Carentan outside; no source gives a line', [[-1.15, 49.75], [-1.22, 49.48], [-1.38, 49.34], [-1.80, 49.32]]),
  z.est('the open sea round the Cotentin: the coast cuts it', [[-1.80, 49.32], [-2.05, 49.78], [-1.15, 49.75]])),
  z.town('Valognes, which Kyriell besieges and takes in 1450 (the plan of 070, after Ramsay), so French at the close of 1449', [-1.47, 49.51], 4));
const BESSIN = z.region(z.est('round Bayeux, Caen, Falaise, Vire, Domfront and Honfleur, English at the close of 1449 (070.16); Saint-Lô, Lisieux and Argentan outside; no source gives a line', [[0.30, 49.48], [0.32, 49.38], [0.05, 49.28], [-0.12, 49.15], [-0.08, 48.95], [-0.25, 48.78], [-0.48, 48.55], [-0.78, 48.50], [-1.00, 48.72], [-1.00, 48.98], [-1.02, 49.20], [-1.00, 49.42]]),
  z.est('the open sea off the Bessin: the coast cuts it', [[-1.00, 49.42], [0.30, 49.48]]));
const FRESNAY = z.town('Fresnay, English at the close of 1449 (070.16), a castle on the Sarthe held alone', [0.02, 48.28], 6);

// ---------------------------------------------------------------------------------------------------------------
// Burgundy
const AS = z.est('the south edge of Artois with Picardy, Arras and Bapaume in Artois (060.18), Doullens and Péronne in Picardy; no source gives a line', [[1.40, 50.37], [1.60, 50.36], [2.00, 50.25], [2.35, 50.17], [2.80, 50.10], start(KBb)]);
const ARTOIS = z.region(AS, z.back(KBa),
  z.est('a line inside Flanders: it only joins Artois and French Flanders to the Flanders of today', [start(KBa), [3.50, 50.80], [2.60, 51.10], [1.80, 51.10]]),
  z.est('the open sea off the Boulonnais: the coast cuts it', [[1.80, 51.10], [1.30, 50.70], start(AS)]));
// Picardy and the Auxerrois are cut by Normandy and Champagne here, so that no Burgundian land lies under a province
// that is French on a later page: Picardy ends at the Bresle
const PICARDY = z.diff(z.region(B, z.back(KBb), z.back(AS),
  z.est('the open sea off Ponthieu, then a line inside Normandy, which the Norman bank of the Bresle cuts', [start(AS), [1.10, 50.15], [1.30, 49.95], start(B)])), NORMANDY2, CHAMPAGNE);
const AUXERROIS = z.diff(z.region(S20b, S20c,
  z.est('a line inside Champagne and the duchy of Burgundy, which cut it: it only joins the Auxerrois to the duchy', [end(S20c), [4.45, 47.85], [4.45, 47.40]]),
  z.est('the edge of the Burgundian Auxerrois with the Nivernais and the Gâtinais: Auxerre and Cravant Burgundian (020.46, 040.51, the plan of 010), Courtenay, Gien and Cosne outside; no source gives a line', [[4.45, 47.40], [3.60, 47.42], [3.30, 47.55], [3.10, 47.80], start(S20b)])), CHAMPAGNE);
const BURGUNDY07 = z.union(FLANDERS, ARTOIS, DUCHY, COUNTY);
const BURGUNDY20 = z.union(BURGUNDY07, PICARDY, AUXERROIS);

// ---------------------------------------------------------------------------------------------------------------
// The Meuse: Bar, Lorraine and the castellany of Vaucouleurs
const CASTELLANY = z.region(M2,
  z.est('the Three Fountains brook through Domrémy, Lowell\'s edge of Bar (010.14, disputed): Greux and the north of the village French (020.9)', [end(M2), [5.66, 48.443], [5.63, 48.445]]),
  z.est('the castellany of Vaucouleurs west of the Meuse, Burey and Vaucouleurs inside, "a kind of island of loyalty" (010.15); no source gives its bounds', [[5.63, 48.445], [5.61, 48.53], [5.62, 48.64], [5.65, 48.67], start(M2)]));
const LB = z.est('the line between the duchies of Bar and Lorraine: Neufchâteau Lorraine\'s (020.9), Nancy and Saint-Nicolas-de-Port in Lorraine (020.34, 020.35), the south of Domrémy in Bar (010.14); no source gives it', [[5.60, 48.28], [5.64, 48.37], [5.71, 48.415], [5.80, 48.43], [5.90, 48.52], [5.92, 48.80], [6.05, 48.90], [6.40, 49.00]]);
const BAR = z.diff(z.region(LB,
  z.est('the north edge of Bar, Metz outside; no source gives it', [end(LB), [6.05, 49.05], [5.95, 49.30], [5.80, 49.50], [5.25, 49.62]]),
  z.est('a line inside Champagne, which the province itself bounds: Bar meets Champagne at its edge (020.8, 010.15)', [[5.25, 49.62], [4.85, 49.30], [4.85, 48.60], [5.30, 48.25]]),
  z.est('the south edge of Bar in the Bassigny, west of Neufchâteau; no source gives it', [[5.30, 48.25], start(LB)])), CHAMPAGNE, CASTELLANY);
const LORRAINE = z.diff(z.region(z.back(LB),
  z.est('the south edge of the duchy of Lorraine with the Bassigny and the county of Burgundy, which cuts it; no source gives it', [start(LB), [5.55, 48.10], [5.60, 47.95], [5.85, 47.88], [6.30, 47.80], [6.80, 47.82], [6.95, 48.10]]),
  z.est('the east edge of the duchy along the Vosges, and German Lorraine to the north; no source gives it', [[6.95, 48.10], [7.15, 48.50], [7.10, 48.85], [6.85, 49.15], end(LB)])), CHAMPAGNE);

// ---------------------------------------------------------------------------------------------------------------
// The zones
const T = {
  paris: [2.352, 48.857], rouen: [1.099, 49.443], caen: [-0.37, 49.183], troyes: [4.074, 48.297], reims: [4.034, 49.254], chalons: [4.37, 48.96],
  orleans: [1.909, 47.902], bourges: [2.399, 47.081], chinon: [0.24, 47.17], poitiers: [0.34, 46.58], tours: [0.69, 47.39], lyon: [4.83, 45.76],
  grenoble: [5.72, 45.19], toulouse: [1.44, 43.60], calais: [1.858, 50.951], bordeaux: [-0.58, 44.84], bayonne: [-1.47, 43.49], dax: [-1.05, 43.71],
  castillon: [-0.04, 44.855], london: [-0.12, 51.50], lille: [3.063, 50.637], arras: [2.78, 50.29], ghent: [3.72, 51.05], dijon: [5.04, 47.32],
  besancon: [6.02, 47.24], amiens: [2.30, 49.89], montdidier: [2.57, 49.65], noyon: [3.0, 49.58], beaulieu: [2.91, 49.66], beaurevoir: [3.31, 50.0],
  saint_quentin: [3.29, 49.85], auxerre: [3.57, 47.80], cravant: [3.689, 47.683], rennes: [-1.68, 48.11], nantes: [-1.55, 47.22], fougeres: [-1.20, 48.35],
  nancy: [6.18, 48.69], saint_nicolas: [6.30, 48.63], neufchateau: [5.696, 48.356], vaucouleurs: [5.667, 48.602], greux: [5.68, 48.452], bar_le_duc: [5.16, 48.77],
  saint_mihiel: [5.54, 48.89], metz: [6.18, 49.12], provence_aix: [5.45, 43.53], avignon: [4.81, 43.95], chambery: [5.92, 45.57], cambrai: [3.23, 50.18],
  mont_saint_michel: [-1.511, 48.636], alencon: [0.09, 48.43], le_mans: [0.20, 48.0], laval: [-0.77, 48.07], angers: [-0.55, 47.47], fresnay: [0.02, 48.28],
  chartres: [1.489, 48.447], etampes: [2.16, 48.43], sens: [3.28, 48.20], saint_florentin: [3.73, 48.0], janville: [1.88, 48.20], chateaudun: [1.33, 48.07],
  meung: [1.70, 47.83], beaugency: [1.633, 47.776], jargeau: [2.12, 47.86], patay: [1.70, 48.05], saint_laurent: [1.892, 47.900], bastille_paris: [1.901, 47.909],
  saint_loup: [1.948, 47.899], checy: [2.02, 47.89], boucher: [1.903, 47.902], blois: [1.33, 47.59], gien: [2.63, 47.69],
  laon: [3.62, 49.56], soissons: [3.32, 49.38], compiegne: [2.83, 49.42], choisy: [2.88, 49.44], gournay: [2.70, 49.49], beauvais: [2.08, 49.43],
  senlis: [2.59, 49.21], creil: [2.47, 49.26], pont_sainte_maxence: [2.60, 49.30], aumale: [1.75, 49.77], blangy: [1.63, 49.93], lagny: [2.71, 48.87],
  meaux: [2.88, 48.96], crecy: [2.91, 48.86], coulommiers: [3.08, 48.81], provins: [3.30, 48.56], chateau_thierry: [3.40, 49.05], bray: [3.24, 48.41],
  montereau: [2.95, 48.38], crepy: [2.89, 49.23], saint_denis: [2.36, 48.936], melun: [2.66, 48.54], pontoise: [2.10, 49.05], vincennes: [2.435, 48.843],
  dieppe: [1.08, 49.92], caudebec: [0.726, 49.526], le_havre: [0.11, 49.49], honfleur: [0.233, 49.42], harfleur: [0.198, 49.507], eu: [1.42, 50.05],
  cherbourg: [-1.62, 49.64], saint_sauveur: [-1.53, 49.39], valognes: [-1.47, 49.51], bayeux: [-0.70, 49.28], falaise: [-0.20, 48.90], vire: [-0.89, 48.84],
  domfront: [-0.65, 48.59], carentan: [-1.25, 49.30], saint_lo: [-1.09, 49.12], lisieux: [0.23, 49.15], argentan: [-0.02, 48.74], formigny: [-0.90, 49.33],
  saint_urbain: [5.19, 48.40], rouvray: [1.95, 48.27],
  le_crotoy: [1.62, 50.22], abbeville: [1.83, 50.10], la_charite: [3.02, 47.18], nevers: [3.16, 46.99], courtenay: [3.06, 48.04], tonnerre: [3.97, 47.86],
  beaumont: [2.29, 49.14], mantes: [1.72, 48.99], meulan: [1.91, 49.01], clermont: [2.41, 49.38], carignan: [5.17, 49.63], givet: [4.82, 50.14],
  rethel: [4.37, 49.51], perpignan: [2.895, 42.699], narbonne: [3.00, 43.18], carcassonne: [2.35, 43.21],
};
const pick = (...ks) => Object.fromEntries(ks.map(k => [k, T[k]]));

z.zone('france-1407', { family: 'france', name: 'The kingdom of Charles VI' }, FRANCE, {
  inside: pick('paris', 'orleans', 'bourges', 'toulouse', 'lyon', 'grenoble', 'vaucouleurs', 'greux', 'rennes', 'rouen', 'troyes', 'bordeaux', 'rethel', 'narbonne', 'carcassonne'),
  outside: pick('provence_aix', 'avignon', 'chambery', 'nancy', 'metz', 'cambrai', 'london', 'besancon', 'carignan', 'givet', 'perpignan') });

z.zone('english-1407', { family: 'english', name: 'The English king\'s lands' }, ABROAD, {
  inside: pick('calais', 'bordeaux', 'bayonne', 'dax', 'castillon', 'london'), outside: pick('rouen', 'paris', 'harfleur', 'arras') });
z.zone('english-1420', { family: 'english', name: 'The English kings\' lands' }, z.union(ABROAD, NORTH20), {
  inside: pick('calais', 'bordeaux', 'rouen', 'caen', 'paris', 'troyes', 'reims', 'chartres', 'etampes', 'sens', 'saint_florentin', 'beauvais', 'compiegne', 'soissons', 'laon', 'alencon'),
  outside: pick('mont_saint_michel', 'le_mans', 'angers', 'orleans', 'janville', 'auxerre', 'amiens', 'montdidier', 'noyon', 'rennes', 'fougeres', 'vaucouleurs', 'greux', 'bar_le_duc', 'chateaudun', 'carignan', 'givet') });
z.zone('english-1428', { family: 'english', name: 'The English kings\' lands' }, z.union(ABROAD, NORTH28), {
  inside: pick('rouen', 'paris', 'troyes', 'reims', 'le_mans', 'laval', 'fresnay', 'alencon', 'chartres', 'saint_florentin', 'saint_urbain', 'calais', 'bordeaux'),
  outside: pick('mont_saint_michel', 'vaucouleurs', 'greux', 'neufchateau', 'angers', 'janville', 'orleans', 'rennes', 'fougeres', 'le_crotoy', 'tours') });
z.zone('english-siege-1428', { family: 'english', name: 'The English kings\' lands' }, z.union(ABROAD, NORTH28, BEAUCE, JARGEAU), {
  inside: pick('janville', 'meung', 'beaugency', 'jargeau', 'patay', 'rouvray', 'saint_laurent', 'bastille_paris', 'chartres', 'paris'),
  outside: pick('orleans', 'boucher', 'saint_loup', 'checy', 'blois', 'gien', 'chateaudun', 'vaucouleurs') });
z.zone('english-reims-1429', { family: 'english', name: 'The English kings\' lands' }, z.diff(z.union(ABROAD, NORTH28), REIMS_CUT), {
  inside: pick('paris', 'sens', 'provins', 'chateau_thierry', 'soissons', 'laon', 'coulommiers', 'chartres', 'rouen'),
  outside: pick('troyes', 'reims', 'chalons', 'saint_florentin', 'janville', 'orleans') });
z.zone('english-aug-1429', { family: 'english', name: 'The English kings\' lands' }, z.diff(z.union(ABROAD, NORTH28), REIMS_CUT, AUG_CUT), {
  inside: pick('paris', 'meaux', 'lagny', 'bray', 'montereau', 'sens', 'senlis', 'compiegne', 'choisy', 'beauvais', 'creil', 'aumale', 'blangy'),
  outside: pick('laon', 'soissons', 'chateau_thierry', 'crecy', 'coulommiers', 'provins', 'crepy', 'reims') });
// Mid-August 1429, Montépilloy and the towns between the Oise and Paris: Bray on the Seine holds against the king
// until September (050.2, 050.29), so this stage has no BRAY_CUT (story-map-auditor-3)
z.zone('english-compiegne-1429', { family: 'english', name: 'The English kings\' lands' }, z.diff(z.union(ABROAD, NORTH28), REIMS_CUT, AUG_CUT, SEP_CUT, LAGNY_CUT), {
  inside: pick('paris', 'saint_denis', 'meaux', 'bray', 'montereau', 'melun', 'sens', 'rouen', 'aumale', 'blangy'),
  outside: pick('compiegne', 'senlis', 'beauvais', 'creil', 'pont_sainte_maxence', 'choisy', 'gournay', 'lagny', 'crepy', 'provins', 'le_crotoy') });
z.zone('english-sep-1429', { family: 'english', name: 'The English kings\' lands' }, z.diff(z.union(ABROAD, NORTH28), REIMS_CUT, AUG_CUT, SEP_CUT, LAGNY_CUT, BRAY_CUT), {
  inside: pick('paris', 'saint_denis', 'vincennes', 'meaux', 'montereau', 'melun', 'sens', 'pontoise', 'rouen', 'chartres', 'eu', 'aumale', 'blangy', 'calais'),
  outside: pick('compiegne', 'senlis', 'beauvais', 'creil', 'pont_sainte_maxence', 'choisy', 'gournay', 'lagny', 'bray', 'crepy', 'le_crotoy') });
z.zone('english-1436', { family: 'english', name: 'The English kings\' lands' }, z.union(ABROAD, z.diff(z.union(NORMANDY2, MAINE), MSM, CAUX_CUT, BRITTANY), HOLDS36), {
  inside: pick('rouen', 'caudebec', 'honfleur', 'caen', 'le_mans', 'fresnay', 'alencon', 'eu', 'aumale', 'blangy', 'calais', 'bayonne', 'meaux', 'creil', 'beaumont', 'crepy', 'montereau', 'mantes'),
  outside: pick('dieppe', 'le_havre', 'harfleur', 'paris', 'pontoise', 'saint_denis', 'vincennes', 'chartres', 'etampes', 'sens', 'clermont', 'pont_sainte_maxence', 'meulan', 'lagny', 'melun', 'troyes', 'le_crotoy') });
z.zone('english-1449', { family: 'english', name: 'The English kings\' lands' }, z.union(ABROAD, COTENTIN, BESSIN, FRESNAY), {
  inside: pick('cherbourg', 'saint_sauveur', 'bayeux', 'caen', 'falaise', 'vire', 'domfront', 'honfleur', 'fresnay', 'calais', 'bordeaux', 'bayonne'),
  outside: pick('valognes', 'carentan', 'saint_lo', 'lisieux', 'argentan', 'rouen', 'alencon', 'le_mans', 'fougeres') });
z.zone('english-1451', { family: 'english', name: 'The English kings\' lands' }, z.union(CALAIS, ENGLAND), {
  inside: pick('calais', 'london'), outside: pick('bordeaux', 'bayonne', 'rouen', 'arras') });
z.zone('english-1452', { family: 'english', name: 'The English kings\' lands' }, z.union(CALAIS, GASCONY52, ENGLAND), {
  inside: pick('calais', 'bordeaux', 'castillon'), outside: pick('bayonne', 'dax') });

z.zone('burgundy-1407', { family: 'burgundy', name: 'The lands of the Duke of Burgundy' }, BURGUNDY07, {
  inside: pick('lille', 'arras', 'ghent', 'dijon', 'besancon'), outside: pick('amiens', 'paris', 'auxerre', 'cambrai', 'saint_quentin', 'troyes') });
z.zone('burgundy-1420', { family: 'burgundy', name: 'The lands of the Duke of Burgundy' }, BURGUNDY20, {
  inside: pick('lille', 'arras', 'dijon', 'besancon', 'amiens', 'abbeville', 'montdidier', 'noyon', 'beaulieu', 'beaurevoir', 'saint_quentin', 'auxerre', 'cravant'),
  outside: pick('beauvais', 'compiegne', 'soissons', 'laon', 'sens', 'saint_florentin', 'courtenay', 'gien', 'la_charite', 'cambrai') });
z.zone('brittany-1407', { family: 'brittany', name: 'The duchy of Brittany' }, BRITTANY, {
  inside: pick('rennes', 'nantes', 'fougeres'), outside: pick('mont_saint_michel', 'laval', 'angers') });
z.zone('lorraine-1412', { family: 'lorraine', name: 'The duchy of Lorraine' }, LORRAINE, {
  inside: pick('nancy', 'saint_nicolas', 'neufchateau'), outside: pick('vaucouleurs', 'greux', 'bar_le_duc', 'troyes') });
z.zone('bar-1412', { family: 'bar', name: 'The duchy of Bar' }, BAR, {
  inside: pick('bar_le_duc', 'saint_mihiel'), outside: pick('vaucouleurs', 'greux', 'neufchateau', 'nancy', 'metz', 'troyes') });

z.write();
