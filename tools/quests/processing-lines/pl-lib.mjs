// Helpers for the processing-lines data files (pl-data-*.mjs).
//
// A chapter: { file, order, title, subtitle, icon, focus, bands: [[clusterKey, ...], ...], clusters: { key: { name, nodes } } }.
// A node:    n(key, x, y, res, title, opts): x/y relative to its cluster, in quest-grid cells (multiples of 0.25).
//   res:     I(item) | F(fluid[, bucket]) | M(controller item, recipe types)
//   opts:    from  dependencies = the arrows drawn into this node: 'key' (same chapter; a link node's key for another chapter),
//                  or { k, via: [res keys...] } for a summary arrow that hides named intermediates, { k, by: [types] } to say
//                  which machine does that step (the checker only accepts recipes of those types)
//            kind  'raw' | 'item' | 'product' | 'by' | 'ret' | 'machine' | 'ours' (shape and size; see KINDS)
//            sub   subtitle (shown under the title on hover): the machine, or what happens to it
//            desc  one or two short sentences (docs/quests.md, section 8)
//            end   a leaf's destination in words ("inert: void it", "stored for IV"); every leaf needs one or a machine
//            by    recipe types that make this node (for every arrow into it)
// A link:    L(key, x, y, 'pl_lv:acid'): a quest link to a node of an earlier chapter; this chapter's nodes depend on it by key.
export const KINDS = {
  raw: { shape: 'rsquare', size: 1 },
  item: { shape: '', size: 1 },
  product: { shape: '', size: 1.25 },
  by: { shape: '', size: 0.75 },
  dest: { shape: '', size: 0.75 },
  ret: { shape: 'circle', size: 0.75 },
  machine: { shape: 'gear', size: 1.25 },
  ours: { shape: 'gear', size: 1.5 },
  link: { shape: 'rsquare', size: 1 },
};

export function bucketOf(fluid) {
  if (fluid === 'minecraft:water') return 'minecraft:water_bucket';
  if (fluid === 'minecraft:lava') return 'minecraft:lava_bucket';
  if (fluid === 'minecraft:milk') return 'minecraft:milk_bucket';
  const [ns, p] = fluid.split(':');
  return `${ns}:${p}_bucket`;
}

export const I = (item) => ({ item, res: item });
export const F = (fluid, bucket) => ({ item: bucket || bucketOf(fluid), fluid, res: 'fluid:' + fluid });
export const M = (item, types) => ({ item, res: item, machine: true, types: types ? [].concat(types) : [] });

export function n(key, x, y, res, title, opts = {}) {
  const kind = opts.kind || (res.machine ? 'machine' : 'item');
  return { key, x, y, ...res, title, kind, ...opts, from: opts.from || [] };
}

export function L(key, x, y, ref, opts = {}) {
  return { key, x, y, link: ref, kind: 'link', from: [], ...opts };
}

// a summary arrow: from k through the named intermediates (res keys)
export const via = (k, ...steps) => ({ k, via: steps });
// an arrow whose step is done by these recipe types
export const by = (k, ...types) => ({ k, by: types });
