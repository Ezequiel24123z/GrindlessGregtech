// Helpers for the chart data files (pl-data-*.mjs, power-data.mjs).
//
// A chapter: { file, order, title, subtitle, icon, focus, bands: [[clusterKey, ...], ...], clusters: { key: { name, nodes } } },
//            and group: the title of its chapter group in chapter_groups.snbt (default: "Processing Lines").
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
// An era link: E(key, x, y, 'lv_age', '<quest id>'): a link to a quest of a hand-written chapter; an arrow out of it says "that
//            quest introduces this", and the checker wants this node's item among that quest's tasks or its icon.
// Power tab (power-data.mjs): figs: [P.single(32), P.fuel(...), ...] are the node's numbers. The generator writes them into the
//            subtitle and description, and the checker recomputes every one from the dump, the pack's config or a script.
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
  // kit that is not a recipe step (a battery, a cable): a leaf by design
  info: { shape: '', size: 1 },
  // later content: checkmark only; its item may still be hidden in EMI
  peek: { shape: 'circle', size: 1, checkOnly: true },
  // a placeholder for something being built (checkmark only)
  slot: { shape: 'circle', size: 1, checkOnly: true },
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

export function E(key, x, y, chapter, id, opts = {}) {
  return { key, x, y, link: chapter + '#' + id, era: true, kind: 'link', from: [], ...opts };
}

// a summary arrow: from k through the named intermediates (res keys)
export const via = (k, ...steps) => ({ k, via: steps });
// an arrow whose step is done by these recipe types
export const by = (k, ...types) => ({ k, by: types });
// an arrow into a large combustion engine for what its own logic burns besides the fuel (lubricant, the oxygen boost)
export const engineFluid = (k) => ({ k, engine: true });
// water into a GTM boiler: the boiler drinks it by itself, outside its fuel recipes (GTM's SteamBoilerMachine, LargeBoilerMachine)
export const boilerWater = (k) => ({ k, boilerWater: true });
// an arrow into a machine from a part of its controller's own recipe ("built from")
export const build = (k) => ({ k, build: true });
// a block that goes into a multiblock's structure (the dump's structures.json): capacitor cells into the wireless tower
export const structure = (k) => ({ k, structure: true });
// a wireless hatch or cover that only works through the network a wireless energy tower holds (tables/wireless_energy.json)
export const network = (k) => ({ k, network: true });

// The Power tab's numbers. Each one is checked by pl-check.mjs#checkFig against the source named here.
export const P = {
  // a GTM single-block generator's EU/t: V[tier] of its machine tier (machines.json), what GTM's parallel brings any fuel up to
  single: (eut) => ({ t: 'single', eut }),
  // EU/t of one run of a recipe of the node's types (recipe pins it); per: the unit ('a panel'); where: the site ('on the Moon')
  run: (eut, opts = {}) => ({ t: 'run', eut, ...opts }),
  // EU/t a recipe of the node's types uses (the heliostat tower's pumps)
  uses: (eut) => ({ t: 'uses', eut }),
  // up to n runs at once: total = n x each; n is read from a script or table of the pack (src: { file, re } or { file, json })
  max: (total, n, each, src) => ({ t: 'max', total, n, each, src }),
  // EU per unit of a fuel in the recipes of the node's types: per mB of a fluid, per item (a chanced item counts its odds)
  fuel: (key, name, eu, opts = {}) => ({ t: 'fuel', key, name, eu, ...opts }),
  // a boiler's steam per tick at full heat: pack/config/gtceu.yaml for GTM's boilers, the recipe for ours
  steam: (mbt) => ({ t: 'steam', mbt }),
  // buckets of steam a boiler makes from one item, or from one bucket of a fluid fuel
  steamFuel: (key, name, buckets) => ({ t: 'steamFuel', key, name, buckets }),
  // mB of steam the combined-cycle plant makes per mB of a fuel
  ccSteam: (key, name, mb) => ({ t: 'ccSteam', key, name, mb }),
  // a large combustion engine: V[tier] of its controller's hull, and with the boost (GTM's LargeCombustionEngineMachine)
  engine: (eut, boosted, factor) => ({ t: 'engine', eut, boosted, factor }),
  // a large turbine: twice V[tier] of its controller's hull, times the rotor's power (GTM's LargeTurbineMachine)
  turbine: (eut) => ({ t: 'turbine', eut }),
  // a solar panel cover: 1 EU/t for the basic one, V[tier] for a tiered one (GTM's CoverSolarPanel)
  cover: (eut) => ({ t: 'cover', eut }),
  // EU a battery holds (the dump's electric.json)
  battery: (item, name, eu) => ({ t: 'battery', item, name, eu }),
  // a cable's voltage tier, amps and loss per block (the dump's electric.json; a cable loses what its material loses)
  cable: (material, name, tier, amps, loss) => ({ t: 'cable', material, name, tier, amps, loss }),
  // AE2's P2P energy toll, in percent (the dump's electric.json)
  toll: (percent) => ({ t: 'toll', percent }),
  // the only fuels of a recipe type that work off Earth: its recipes with no dimension condition (site_fuels.json, power/generators.js)
  anywhere: (type, fuels) => ({ t: 'anywhere', type, fuels: fuels.map(([key, name]) => ({ key, name })) }),
  // the wireless network (tables/wireless_energy.json, read from this checkout or from the pack the dump was made from):
  // EU a capacitor cell holds (and six of its tier's reference battery, with electric.json)
  wcell: (item, name, eu) => ({ t: 'wcell', item, name, eu }),
  // the tower's cell slots (the table, and the cell positions of its pattern in structures.json)
  wslots: (n) => ({ t: 'wslots', n }),
  // what is lost on the way into the network, in percent
  wloss: (percent) => ({ t: 'wloss', percent }),
  // the amperages of the wireless hatches and the tiers they come in (every one registered in the dump)
  wamps: (amps, from, to) => ({ t: 'wamps', amps, from, to }),
  // the wireless covers' amperage and tiers (every one registered in the dump)
  wcover: (amps, from, to) => ({ t: 'wcover', amps, from, to }),
};
