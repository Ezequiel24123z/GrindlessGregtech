// Helpers for the chart data files (pl-data-*.mjs, power-data.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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
//            quest introduces this", and the checker wants this node's item among that quest's tasks or its icon. The chapter
//            is a hint: the link resolves to the era chapter that holds the id (eraChapterOf), and keeps the hint if none does.
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

// The chapter that holds a quest id. `hint` is the chapter the data file names; the era chapters of the book (or of
// GG_QUESTS_ERA_DIR, as in pl-model.mjs) are searched, because quests move between an era's
// chapters (docs/reforge/05_quest_design.md, section 4.2: the era seed keeps the id). Charts and Power never link a chart.
const BOOK_CHAPTERS = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'pack', 'config', 'ftbquests', 'quests', 'chapters');
const NOT_ERA = /^(pl_|power\.|multiblocks\.)/;
const idCache = new Map();

function chapterIndex(bookDir, overDir) {
  const cacheKey = bookDir + '|' + (overDir || '');
  if (idCache.has(cacheKey)) return idCache.get(cacheKey);
  const files = new Map();
  for (const dir of [bookDir, overDir]) {
    if (!dir || !fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) if (f.endsWith('.snbt') && !NOT_ERA.test(f)) files.set(f.slice(0, -5), path.join(dir, f));
  }
  const holder = new Map();
  for (const [chapter, file] of [...files].sort(([a], [b]) => (a < b ? -1 : 1))) {
    const text = fs.readFileSync(file, 'utf8');
    for (const m of text.matchAll(/\bid: "([0-9A-F]{16})"/g)) if (!holder.has(m[1])) holder.set(m[1], chapter);
  }
  idCache.set(cacheKey, holder);
  return holder;
}

export function eraChapterOf(chapter, id, { bookDir = BOOK_CHAPTERS, overDir = process.env.GG_QUESTS_ERA_DIR } = {}) {
  // ids are unique in the book: the chapter that holds this one is the quest's chapter, wherever the data file says it was
  return chapterIndex(bookDir, overDir).get(id) || chapter;
}

export function E(key, x, y, chapter, id, opts = {}) {
  return { key, x, y, link: eraChapterOf(chapter, id) + '#' + id, era: true, kind: 'link', from: [], ...opts };
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
  // EU/t of one run of a recipe of the node's types (recipe pins it); per: the unit ('a panel'); where: the site ('on the Moon');
  // solar: { file } also recomputes it from that script's solar-family constants and tables/sunlight.json (Earth orbit, tables/orbits.json);
  // src: { file, re } also reads it from a constant of the pack's scripts (both need no dump)
  run: (eut, opts = {}) => ({ t: 'run', eut, ...opts }),
  // EU/t a recipe of the node's types uses (the heliostat tower's pumps)
  uses: (eut) => ({ t: 'uses', eut }),
  // up to n runs at once: total = n x each; n is read from a script or table of the pack (src: { file, re } or { file, json },
  // or { file, re, count: true }: how many times re matches, such as the entries of a list)
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
  // EU/t that reaches the network from a source of `from` EU/t, after the table's loss (rounded to the EU)
  wnet: (eut, from) => ({ t: 'wnet', eut, from }),
  // the amperages of the wireless hatches and the tiers they come in (every one registered in the dump)
  wamps: (amps, from, to) => ({ t: 'wamps', amps, from, to }),
  // the wireless covers' amperage and tiers (every one registered in the dump)
  wcover: (amps, from, to) => ({ t: 'wcover', amps, from, to }),
};

// ---------------------------------------------------------------- rate cards (AUD3-RATES)
// A rate card is a figure that sizes one machine running one recipe of the dump: the profile (voltage, overclocks, parallels)
// plus what the recipe moves per minute. Every claimed number is recomputed by checkRate from the dump's recipe, so a card
// cannot outlive the recipe it describes. Rates are expected values: a chanced output or a chanced (catalyst) input counts its odds.
//   R.rate(recipe, profile, claims)   one machine: EU/t, ticks per run, what it consumes and makes per minute
//   R.cmp(key, unit, routes, ...)     routes that make the same product, per unit of it, under equal assumptions
//   R.ratio(prod, cons, n, m)         n producer machines feed m consumer machines of the same flow
// profile: { tier, amps?, oc?, par?, parSrc? }  tier: the energy hatch's voltage tier; amps: its amperage (default 1);
//   oc: overclocks (each halves the time and quadruples the EU/t, as GTM's standard overclock); par: parallels (multiplies the EU/t
//   and the amounts, not the time); parSrc: { file, re } names the script constant that caps the parallels (needed when par > 1).
export const TIERS = ['ulv', 'lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv', 'uev', 'uxv', 'opv', 'max'];
export const voltage = (tier) => 8 * 4 ** TIERS.indexOf(String(tier).toLowerCase());
const round2 = (x) => Math.round(x * 100) / 100;
const ins = (rec, key) => rec.inputs.find((i) => !i.cap && ((i.alts || []).includes(key) || (i.tags || []).some((t) => key === '#' + t)));
const outs = (rec, key) => rec.outputs.filter((o) => o.key === key);

// the recipe under a profile: EU/t, ticks per run and the expected flow of every input and output per minute
export function rateOf(rec, { oc = 0, par = 1 } = {}) {
  if (!rec || !(rec.duration > 0)) throw new Error('rateOf: the recipe has no duration');
  if (!Number.isInteger(oc) || oc < 0 || !Number.isInteger(par) || par < 1) throw new Error('rateOf: oc and par are whole numbers (par from 1)');
  if (rec.duration % 2 ** oc) throw new Error(`rateOf: ${rec.id} (${rec.duration} t) does not halve ${oc} times to a whole tick`);
  const ticks = rec.duration / 2 ** oc;
  const runs = 1200 / ticks;
  const out = {};
  for (const o of rec.outputs) out[o.key] = round2((out[o.key] || 0) + o.count * o.chance * par * runs);
  const inn = {};
  for (const i of rec.inputs) {
    if (i.cap || !(i.count > 0)) continue;
    const key = (i.alts || [])[0] || (i.tags && i.tags[0] ? '#' + i.tags[0] : i.label);
    inn[key] = round2((inn[key] || 0) + i.count * i.consume * par * runs);
  }
  return { ticks, eut: rec.eut * par * 4 ** oc, out, in: inn, runs };
}

// one product unit's cost: EU and every consumed input per `unit` of `key` (1000 for a bucket, 1 for an item)
export function perUnit(rec, key, unit, profile = {}) {
  const r = rateOf(rec, profile);
  const made = r.out[key];
  if (!made) throw new Error(`perUnit: ${rec.id} does not make ${key}`);
  const k = unit / made;
  const inn = {};
  for (const [id, v] of Object.entries(r.in)) inn[id] = round2(v * k);
  const other = {};
  for (const [id, v] of Object.entries(r.out)) if (id !== key) other[id] = round2(v * k);
  return { perMin: made, eu: round2(r.eut * 1200 * k), in: inn, out: other };
}

// the smallest whole machine counts n (producers) and m (consumers) whose flows of `key` match exactly
export function ratioOf(prodRec, consRec, key, prodProfile = {}, consProfile = {}) {
  const make = rateOf(prodRec, prodProfile).out[key];
  const take = rateOf(consRec, consProfile).in[key];
  if (!make) throw new Error(`ratioOf: ${prodRec.id} does not make ${key}`);
  if (!take) throw new Error(`ratioOf: ${consRec.id} does not consume ${key}`);
  const a = Math.round(take * 100);
  const b = Math.round(make * 100);
  const g = gcd(a, b);
  return { n: a / g, m: b / g, make, take };
}
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

export const R = {
  rate: (recipe, profile, claims) => ({ t: 'rate', recipe, ...profile, ...claims }),
  cmp: (key, unit, name, profile, routes, extra = {}) => ({ t: 'cmp', key, unit, name, profile, routes, dominates: [], ...extra }),
  ratio: (prod, cons, key, n, m, claims = {}) => ({ t: 'ratio', prod, cons, key, n, m, ...claims }),
};

// the first reason a profile does not fit its recipe, or null: the voltage the hatches carry, and the parallel cap
function profileProblem(rec, p, readSrc) {
  const r = rateOf(rec, p);
  const limit = voltage(p.tier) * (p.amps || 1);
  if (r.eut > limit) return `${rec.id} at this profile needs ${r.eut} EU/t, a ${p.tier.toUpperCase()} hatch of ${p.amps || 1} A carries ${limit}`;
  if ((p.par || 1) > 1) {
    const cap = p.parSrc ? readSrc(p.parSrc) : null;
    if (cap === null || cap === undefined) return `${rec.id}: ${p.par} parallels need a parSrc that names the cap`;
    if (p.par > cap) return `${p.par} parallels are over the cap ${cap} (${p.parSrc.file})`;
  }
  return null;
}
const same = (claimed, got, what) => {
  for (const [k, v] of Object.entries(claimed || {})) if (round2(v) !== got[k]) return `${what} ${k}: card says ${v}, the recipe gives ${got[k] === undefined ? 'none' : got[k]}`;
  return null;
};

// Recomputes one rate, cmp or ratio figure against the dump's recipes. get(id) -> normalized recipe or undefined;
// readSrc({ file, re }) -> a number of the pack's scripts. Returns { ok, how } or { ok: false, why }.
export function checkRate(f, get, readSrc = () => null) {
  const fail = (why) => ({ ok: false, why });
  const rec = (id) => get(id);
  try {
    if (f.t === 'rate') {
      const r = rec(f.recipe);
      if (!r) return fail(`no recipe ${f.recipe}`);
      const bad = profileProblem(r, f, readSrc);
      if (bad) return fail(bad);
      const got = rateOf(r, f);
      if (got.eut !== f.eut) return fail(`${f.recipe}: ${got.eut} EU/t, not ${f.eut}`);
      if (got.ticks !== f.ticks) return fail(`${f.recipe}: ${got.ticks} t per run, not ${f.ticks}`);
      const bad2 = same(f.outs, got.out, 'makes') || same(f.ins, got.in, 'takes');
      return bad2 ? fail(`${f.recipe}: ${bad2}`) : { ok: true, how: `${f.recipe}: ${got.eut} EU/t, ${got.ticks} t` };
    }
    if (f.t === 'cmp') {
      const rows = [];
      for (const x of f.routes) {
        const r = rec(x.recipe);
        if (!r) return fail(`no recipe ${x.recipe}`);
        const bad = profileProblem(r, { ...f.profile, ...x }, readSrc);
        if (bad) return fail(bad);
        const u = perUnit(r, x.key || f.key, x.unit || f.unit, { ...f.profile, ...x });
        if (u.perMin !== x.perMin) return fail(`${x.recipe}: ${u.perMin} per min, not ${x.perMin}`);
        if (u.eu !== x.eu) return fail(`${x.recipe}: ${u.eu} EU per ${f.unit}, not ${x.eu}`);
        const bad2 = same(x.ins, u.in, 'takes per unit') || same(x.out, u.out, 'also makes per unit');
        if (bad2) return fail(`${x.recipe}: ${bad2}`);
        rows.push({ id: x.label, u });
      }
      const dom = [];
      for (const a of rows) for (const b of rows) {
        if (a === b) continue;
        const keys = new Set([...Object.keys(a.u.in), ...Object.keys(b.u.in)]);
        const le = a.u.eu <= b.u.eu && a.u.perMin >= b.u.perMin && [...keys].every((k) => (a.u.in[k] || 0) <= (b.u.in[k] || 0));
        const lt = a.u.eu < b.u.eu || a.u.perMin > b.u.perMin || [...keys].some((k) => (a.u.in[k] || 0) < (b.u.in[k] || 0));
        if (le && lt) dom.push(`${a.id}>${b.id}`);
      }
      const want = (f.dominates || []).map(([a, b]) => `${a}>${b}`).sort().join(',');
      return dom.sort().join(',') === want ? { ok: true, how: `${f.routes.length} routes for ${f.key}; dominance: ${want || 'none'}` } : fail(`dominance on cost alone is ${dom.join(', ') || 'none'}, the card says ${want || 'none'}`);
    }
    if (f.t === 'ratio') {
      const p = rec(f.prod.recipe);
      const c = rec(f.cons.recipe);
      if (!p || !c) return fail(`no recipe ${!p ? f.prod.recipe : f.cons.recipe}`);
      for (const [r, x] of [[p, f.prod], [c, f.cons]]) { const bad = profileProblem(r, x, readSrc); if (bad) return fail(bad); }
      const got = ratioOf(p, c, f.key, f.prod, f.cons);
      if (got.n !== f.n || got.m !== f.m) return fail(`${got.n} producers to ${got.m} consumers, not ${f.n} to ${f.m}`);
      if (f.make !== undefined && f.make !== got.make) return fail(`a producer makes ${got.make} per min, not ${f.make}`);
      if (f.take !== undefined && f.take !== got.take) return fail(`a consumer takes ${got.take} per min, not ${f.take}`);
      return { ok: true, how: `${f.n} x ${f.prod.recipe} : ${f.m} x ${f.cons.recipe} (${got.make} vs ${got.take} per min)` };
    }
  } catch (e) {
    return fail(e.message);
  }
  return fail('unknown rate figure ' + f.t);
}

const num = (x) => x.toLocaleString('en-US');
const short = (k) => k.replace(/^fluid:/, '').replace(/^#/, '').replace(/^[a-z_]+:/, '').replace(/_/g, ' ');
const unitOf = (k) => (k.startsWith('fluid:') ? 'mB' : 'items');
const flow = (m) => Object.entries(m || {}).map(([k, v]) => `${num(v)} ${unitOf(k)} ${short(k)}`);

// the card's words, built from its claims (which checkRate recomputes): never typed twice
export function rateText(f) {
  const prof = (x) => `${String(x.tier).toUpperCase()}${x.amps > 1 ? ' x' + x.amps + ' A' : ''}${x.oc ? ', ' + x.oc + ' overclock' + (x.oc > 1 ? 's' : '') : ''}${x.par > 1 ? ', ' + x.par + ' parallels' : ''}`;
  if (f.t === 'rate') return `${f.title ? f.title + ': ' : ''}${prof(f)}, ${num(f.eut)} EU/t, ${num(f.ticks)} t per run (${f.recipe.replace(/^[a-z]+:/, '')}). Per minute it takes ${flow(f.ins).join(', ') || 'nothing'} and makes ${flow(f.outs).join(', ')}.${f.note ? ' ' + f.note : ''}`;
  if (f.t === 'ratio') return `${f.title ? f.title + ': ' : ''}${num(f.n)} ${f.prodName} to ${num(f.m)} ${f.consName} (${num(f.make)} against ${num(f.take)} ${unitOf(f.key)} per minute of ${short(f.key)}).${f.note ? ' ' + f.note : ''}`;
  const per = f.unit === 1 ? 'item' : f.unit === 1000 ? 'bucket' : `${num(f.unit)} units`;
  const rows = f.routes.map((x) => `${x.label}: ${num(x.perMin)}/min, ${num(x.eu)} EU, takes ${flow(x.ins).join(' + ') || 'nothing'}${Object.keys(x.out || {}).length ? ', also ${flow(x.out).join(' + ')}' : ''}`);
  return `${f.name} (${prof(f.profile)}, per ${per} of ${f.what || short(f.key)}): ${rows.join('; ')}.${f.verdict ? ' ' + f.verdict : ''}`;
}
