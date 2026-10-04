// Short constructors for this story's battle plans. Positions are [lon, lat], sizes in metres, facing a compass bearing.
// Every unit, arrow and water carries an id and a name: what the reader sees on pointing at it.
export const U = (side, type, at, width, depth, facing, id, name, extra = {}) => ({ side, type, at, width, depth, facing, id, name, ...extra });
export const A = (side, path, width, id, name, style) => ({ side, path, width, id, name, ...(style ? { style } : {}) });
export const W = (path, width, id, name) => ({ path, width, id, name });
export const M = (lnglat, label, note, color, icon = 'user') => ({ lnglat, icon, color, label, note });
