// Checks every arrow of the Processing Lines charts and of the Power tab against a recipe dump (gg_dump's kubejs-exported),
// with the repository's own loaders (tools/analysis/lib). An arrow A -> B passes when:
//   item -> item        some recipe takes A and gives B (recycling recipes do not count; `by` limits the recipe types);
//   item -> machine M   some recipe of M's types takes A;
//   machine M -> item   some recipe of M's types gives B and takes one of the items drawn into M (any, if none is drawn);
//   machine -> machine  some recipe takes the first controller and gives the second (how it is built);
//   summary A -> B      { via: [I1, I2, ...] }: every step A -> I1 -> I2 -> ... -> B passes as item -> item.
// The Power tab's own arrows: an era quest -> B (B's item is a task or the icon of that quest), engineFluid (what GTM's large
// combustion engines burn besides the fuel), boilerWater (a GTM boiler drinks it), build (a part of B's controller recipe),
// structure (a block of B's pattern in the dump's structures.json) and network (a wireless hatch or cover of the wireless table,
// registered in the dump, that works through the network the tower holds).
// Every number in a Power node's text is a figure (pl-lib.mjs#P) that checkFig recomputes from the dump's recipes and
// machines, pack/config/gtceu.yaml, a constant of the pack's scripts or tables, or the dump's electric.json.
// Also: every icon and task item exists and is not hidden in EMI (the dump's c:hidden_from_recipe_viewers, and
// hidden_until.json groups after IMPLEMENTED_ERA), every machine's recipe types exist, and every leaf states where it ends.
//
//   node tools/quests/processing-lines/pl-check.mjs --dump <kubejs-exported> [--out <report.md>] [--era iv]
//        [--dump-table <hidden_until.json>]
//
// --dump is the kubejs-exported folder of a gg_dump run (test-runs/<run>/results/server/kubejs-exported). --out writes the
// full report (every arrow with the recipe that proves it, and the summary arrows); without it only the totals and the
// problems are printed. --dump-table is the hidden table the dump was taken with; by default it is read from the run's
// upload.zip, three folders up from the dump.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { buildModel, REPO } from './pl-model.mjs';
import { loadIndex, inputKeys, outputKeys } from './pl-index.mjs';

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const dumpDir = opt('--dump', null);
if (!dumpDir) {
  console.error('usage: node pl-check.mjs --dump <kubejs-exported folder of a gg_dump run> [--out <report.md>] [--era <era>] [--dump-table <file>]');
  process.exit(2);
}
const repo = REPO;
const outFile = opt('--out', null);
const ERAS = ['steam', 'lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv', 'uev', 'uiv', 'uxv', 'opv', 'max'];
// the era EMI shows today: hidden.js's IMPLEMENTED_ERA in this checkout (the dump may come from an earlier switch)
const hiddenJs = fs.readFileSync(path.join(repo, 'pack', 'kubejs', 'server_scripts', 'grindless', 'integration', 'hidden.js'), 'utf8');
const implemented = opt('--era', (/const IMPLEMENTED_ERA = '([a-z]+)'/.exec(hiddenJs) || [])[1] || 'ev');

// one entry of a zip file (the bench's upload.zip: no zip64, stored or deflated)
function readZipEntry(file, name) {
  const buf = fs.readFileSync(file);
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) return null;
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  for (let n = 0; n < count && buf.readUInt32LE(p) === 0x02014b50; n++) {
    const method = buf.readUInt16LE(p + 10);
    const size = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const skip = nameLen + buf.readUInt16LE(p + 30) + buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    if (buf.toString('utf8', p + 46, p + 46 + nameLen).replace(/\\/g, '/') === name) {
      const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
      const data = buf.subarray(start, start + size);
      return method === 0 ? data : method === 8 ? zlib.inflateRawSync(data) : null;
    }
    p += 46 + skip;
  }
  return null;
}

const model = buildModel();
if (model.errors.length) { console.error(model.errors.join('\n')); process.exit(2); }
const idx = await loadIndex({ dump: dumpDir });
// a machine node without explicit recipe types runs the ones machines.json lists for its controller
for (const m of model.chapters) {
  for (const nd of m.nodes) {
    if (!nd.machine || nd.types.length) continue;
    const reg = idx.machines.get(nd.item);
    nd.types = reg && Array.isArray(reg.types) ? reg.types : [];
    if (!nd.types.length) nd.typeless = true;
  }
}

const hiddenTag = new Set((idx.tags.itemTags.get('c:hidden_from_recipe_viewers') || []));
const hiddenFluidTag = new Set((idx.tags.fluidTags.get('c:hidden_from_recipe_viewers') || []));
const readJson = (text) => JSON.parse(String(text).replace(/^\uFEFF/, ''));
const table = readJson(fs.readFileSync(path.join(repo, 'pack', 'kubejs', 'data', 'grindless', 'tables', 'hidden_until.json'), 'utf8'));
const dumpEra = (idx.dump.info && idx.dump.info.hidden && idx.dump.info.hidden.implementedEra) || 'ev';
const rankOf = (g) => (g.until === 'never' ? ERAS.length : ERAS.indexOf(g.until));
const lateItem = new Map();
const lateFluid = new Map();
for (const g of table.groups || []) {
  if (rankOf(g) <= ERAS.indexOf(implemented)) continue;
  for (const i of g.items || []) lateItem.set(i, g.until);
  for (const f of g.fluids || []) lateFluid.set(f, g.until);
}
// the dump's tag was written at dumpEra with the table of that run (the current table drops the eras it already shows):
// what that table hid until an era up to the current switch shows again, whatever else the tag hides (junk, old items,
// removed machines) stays hidden
let dumpTable = table;
let dumpTableFrom = 'the current hidden_until.json';
const tableArg = opt('--dump-table', null);
const upload = path.resolve(dumpDir, '..', '..', '..', 'upload.zip');
if (tableArg) {
  dumpTable = readJson(fs.readFileSync(tableArg, 'utf8'));
  dumpTableFrom = tableArg;
} else if (fs.existsSync(upload)) {
  const raw = readZipEntry(upload, 'pack/kubejs/data/grindless/tables/hidden_until.json');
  if (raw) { dumpTable = readJson(raw.toString('utf8')); dumpTableFrom = upload; }
}
if (dumpTable === table && dumpEra !== implemented) {
  console.log(`note: the dump was taken with EMI at ${dumpEra} and the switch is now at ${implemented}, but the run's hidden table was not found (pass --dump-table): items that showed up since then count as hidden`);
}
const dumpItem = new Map();
const dumpFluid = new Map();
for (const g of dumpTable.groups || []) {
  for (const i of g.items || []) dumpItem.set(i, rankOf(g));
  for (const f of g.fluids || []) dumpFluid.set(f, rankOf(g));
}
const stillHidden = (id, dumpMap) => {
  const r = dumpMap.get(id);
  return r === undefined || r <= ERAS.indexOf(dumpEra) || r > ERAS.indexOf(implemented);
};

const recycling = (r) => typeof r.category === 'string' && r.category.endsWith('_recycling');
const keysOf = (nd) => [nd.res, ...(nd.alt || [])];

function itemToItem(a, b, types, allowRecycling = false) {
  const hits = [];
  for (const ka of a) {
    for (const r of idx.consumers.get(ka) || []) {
      if ((!allowRecycling && recycling(r)) || (types && !types.includes(r.type))) continue;
      const outs = outputKeys(r);
      if (b.some((kb) => outs.has(kb))) hits.push(r);
    }
  }
  return hits;
}

function drawnInputs(m) {
  return m.arrows.filter((e) => !e.srcRes.machine && !e.srcRes.era && !e.engine && !e.boilerWater && !e.build && !e.structure && !e.network).flatMap((e) => keysOf(e.srcRes));
}

// ---------------------------------------------------------------- facts beyond recipes (the Power tab)

const V = (tier) => 8 * 4 ** tier;
const TIER_INDEX = { ulv: 0, lv: 1, mv: 2, hv: 3, ev: 4, iv: 5, luv: 6, zpm: 7, uv: 8, uhv: 9 };
const byType = new Map();
for (const r of idx.recipes.values()) { if (!byType.has(r.type)) byType.set(r.type, []); byType.get(r.type).push(r); }
const recipesOf = (types) => types.flatMap((t) => byType.get(t) || []);

// pack/config/gtceu.yaml as dotted paths (a plain reader: indentation and key: value)
function readYaml(file) {
  const out = new Map();
  const stack = [];
  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (/^\s*(#|$)/.test(raw)) continue;
    const mm = /^(\s*)([A-Za-z0-9_.-]+):\s*(.*)$/.exec(raw);
    if (!mm) continue;
    while (stack.length && stack[stack.length - 1].indent >= mm[1].length) stack.pop();
    const value = mm[3].replace(/\s+#.*$/, '').trim();
    const key = [...stack.map((s) => s.key), mm[2]].join('.');
    if (value === '') stack.push({ indent: mm[1].length, key: mm[2] });
    else out.set(key, value.replace(/^["']|["']$/g, ''));
  }
  return out;
}
const gtYaml = readYaml(path.join(repo, 'pack', 'config', 'gtceu.yaml'));
const cfgNum = (suffix, def) => { for (const [k, v] of gtYaml) if (k === suffix || k.endsWith('.' + suffix)) return Number(v); return def; };

// GTM 7.5.3's boilers (defaults from ConfigHolder): a small boiler makes base / 2 every 10 ticks at full heat
// (SteamBoilerMachine#getTotalSteamOutput), and a high-pressure one burns its fuel twice as fast (recipeModifier, duration x 0.5);
// a large boiler drains floor(T x 5 / steamPerWater) water every 5 ticks at full throttle and makes steamPerWater steam from each
// mB (LargeBoilerMachine#updateCurrentTemperature), burning each fuel for its large_boiler recipe's duration
const BOILERS = {
  'gtceu:lp_steam_solid_boiler': { key: 'smallBoilers.solidBoilerBaseOutput', def: 120, type: 'gtceu:steam_boiler' },
  'gtceu:hp_steam_solid_boiler': { key: 'smallBoilers.hpSolidBoilerBaseOutput', def: 300, type: 'gtceu:steam_boiler', hp: true },
  'gtceu:lp_steam_liquid_boiler': { key: 'smallBoilers.liquidBoilerBaseOutput', def: 240, type: 'gtceu:steam_boiler' },
  'gtceu:hp_steam_liquid_boiler': { key: 'smallBoilers.hpLiquidBoilerBaseOutput', def: 600, type: 'gtceu:steam_boiler', hp: true },
  'gtceu:lp_steam_solar_boiler': { key: 'smallBoilers.solarBoilerBaseOutput', def: 120 },
  'gtceu:hp_steam_solar_boiler': { key: 'smallBoilers.hpSolarBoilerBaseOutput', def: 360 },
  'gtceu:bronze_large_boiler': { key: 'largeBoilers.bronzeBoilerMaxTemperature', def: 800, type: 'gtceu:large_boiler', large: true },
  'gtceu:steel_large_boiler': { key: 'largeBoilers.steelBoilerMaxTemperature', def: 1800, type: 'gtceu:large_boiler', large: true },
  'gtceu:titanium_large_boiler': { key: 'largeBoilers.titaniumBoilerMaxTemperature', def: 3200, type: 'gtceu:large_boiler', large: true },
  'gtceu:tungstensteel_large_boiler': { key: 'largeBoilers.tungstensteelBoilerMaxTemperature', def: 6400, type: 'gtceu:large_boiler', large: true },
};
function boilerSteam(item) {
  const b = BOILERS[item];
  if (!b) return null;
  const v = cfgNum(b.key, b.def);
  if (!b.large) return v / 20;
  const spw = cfgNum('largeBoilers.steamPerWater', 160);
  return (Math.floor((v * 5) / spw) * spw) / 5;
}
// GTM 7.5.3's large combustion engines: V[tier] of the hull, x2 voltage with the boost and the output times 1.5 (EV) or 2
// (above EV), taking lubricant and oxygen (liquid oxygen above EV) besides the fuel (LargeCombustionEngineMachine)
const ENGINES = {
  'gtceu:large_combustion_engine': ['fluid:gtceu:lubricant', 'fluid:gtceu:oxygen'],
  'gtceu:extreme_combustion_engine': ['fluid:gtceu:lubricant', 'fluid:gtceu:liquid_oxygen'],
};
// the tier of the machine hull in a controller's own recipe
function hullTier(item) {
  for (const r of idx.producers.get(item) || []) {
    for (const i of r.inputs) for (const a of i.alts) {
      const mm = /^gtceu:(ulv|lv|mv|hv|ev|iv|luv|zpm|uv|uhv)_machine_hull$/.exec(a);
      if (mm) return TIER_INDEX[mm[1]];
    }
  }
  return null;
}
// a file of the pack: this checkout's, or else the one in the pack the dump was made from (the run's upload.zip), for content
// that is on another branch until it merges (the wireless network's table)
function packText(rel) {
  const file = path.join(repo, rel);
  if (fs.existsSync(file)) return { text: fs.readFileSync(file, 'utf8'), from: rel };
  const raw = fs.existsSync(upload) ? readZipEntry(upload, rel.replace(/\\/g, '/')) : null;
  return raw ? { text: raw.toString('utf8'), from: `${rel} (the dump's upload.zip)` } : null;
}
// a constant of the pack's scripts or tables: { file, re } (first capture) or { file, json: 'a.b' }
function sourceValue(src) {
  const got = packText(src.file);
  if (!got) return null;
  if (src.json) return src.json.split('.').reduce((o, k) => (o == null ? o : o[k]), readJson(got.text));
  const mm = new RegExp(src.re).exec(got.text);
  return mm ? Number(mm[1]) : null;
}
// gg_dump's electric.json: wire properties per material, EU-holding items, AE2's P2P toll
const electricFile = path.join(dumpDir, 'electric.json');
const electric = fs.existsSync(electricFile) ? readJson(fs.readFileSync(electricFile, 'utf8')) : null;
// gg_dump's structures.json: every multiblock's pattern (slices of symbols, and what each symbol accepts)
const structuresFile = path.join(dumpDir, 'structures.json');
const structures = new Map();
if (fs.existsSync(structuresFile)) {
  const all = readJson(fs.readFileSync(structuresFile, 'utf8')).structures || {};
  for (const [id, s] of Array.isArray(all) ? all.map((x) => [x.id, x]) : Object.entries(all)) structures.set(id, s);
}
const symbolBlocks = (sym) => (!sym ? [] : sym.kind === 'blocks' ? sym.blocks || [] : sym.kind === 'oneOf' ? (sym.options || []).flatMap(symbolBlocks) : []);
// how many places of a multiblock's pattern take this block
function patternCount(machine, block) {
  const s = structures.get(machine);
  if (!s) return null;
  const takes = new Set(Object.keys(s.symbols || {}).filter((k) => symbolBlocks(s.symbols[k]).includes(block)));
  let n = 0;
  for (const slice of s.slices || []) for (const row of slice) for (const ch of row) if (takes.has(ch)) n++;
  return n;
}
// the wireless network's table, and the hatches and covers it registers (startup_scripts/grindless/lv/wireless_energy.js)
const wirelessSrc = packText('pack/kubejs/data/grindless/tables/wireless_energy.json');
const wireless = wirelessSrc ? readJson(wirelessSrc.text) : null;
function wirelessIds(kind) {
  if (!wireless) return [];
  const names = (wireless.tiers || []).map((t) => t.name);
  if (kind === 'energy_hatch' || kind === 'dynamo_hatch') {
    return names.flatMap((t) => (wireless.hatchAmps || []).map((a) => `gtceu:${t}_wireless_${kind}${a === 2 ? '' : '_' + a + 'a'}`));
  }
  return names.map((t) => `grindless:${t}_wireless_${kind}`);
}
const wirelessKind = (item) => (/_wireless_(energy|dynamo)_(hatch|cover)(_\d+a)?$/.exec(item) || []).slice(1, 3).join('_');

const near = (a, b) => Math.abs(a - b) < 0.005 + 1e-9 * Math.abs(b) || Math.round(a * 100) / 100 === b;
const consumed = (r, key) => r.inputs.find((i) => i.alts.includes(key) && !i.cap);

function checkFig(nd, f) {
  const fail = (why) => ({ ok: false, why });
  const pass = (how) => ({ ok: true, how });
  const any = (vals, want, what) => (vals.some((v) => near(v, want)) ? pass(what) : fail(`${what}: ${vals.length ? vals.map((v) => Math.round(v * 100) / 100).join(' or ') : 'no recipe'}`));
  switch (f.t) {
    case 'single': {
      const reg = idx.machines.get(nd.item);
      if (!reg) return fail('not in machines.json');
      return V(reg.tier) === f.eut ? pass(`machines.json tier ${reg.tier}: V = ${V(reg.tier)}`) : fail(`machines.json tier ${reg.tier}: V = ${V(reg.tier)}`);
    }
    case 'run': {
      const hits = recipesOf(nd.types).filter((r) => r.euOut === f.eut && (!f.recipe || r.id === f.recipe));
      return hits.length ? pass(hits[0].id) : fail(`no ${nd.types.join('|')} recipe makes ${f.eut} EU/t${f.recipe ? ' as ' + f.recipe : ''}`);
    }
    case 'uses': {
      const hits = recipesOf(nd.types).filter((r) => r.eut === f.eut);
      return hits.length ? pass(hits[0].id) : fail(`no ${nd.types.join('|')} recipe uses ${f.eut} EU/t`);
    }
    case 'max': {
      const n = sourceValue(f.src);
      if (n !== f.n) return fail(`${f.src.file} gives ${n}, not ${f.n}`);
      return f.total === f.n * f.each ? pass(`${f.n} x ${f.each} (${f.src.file})`) : fail(`${f.n} x ${f.each} is ${f.n * f.each}`);
    }
    case 'fuel': {
      const vals = [];
      for (const r of idx.consumers.get(f.key) || []) {
        if (!nd.types.includes(r.type) || !(r.euOut > 0) || !r.duration || (f.recipe && r.id !== f.recipe)) continue;
        const inp = consumed(r, f.key);
        if (inp) vals.push((r.euOut * r.duration) / ((inp.count || 1) * (inp.consume || 1)));
      }
      return any(vals, f.eu, `EU per unit of ${f.key}`);
    }
    case 'steam': {
      const fromConfig = boilerSteam(nd.item);
      if (fromConfig !== null) return near(fromConfig, f.mbt) ? pass(`gtceu.yaml: ${fromConfig} mB/t`) : fail(`gtceu.yaml gives ${fromConfig} mB/t`);
      const vals = recipesOf(nd.types).flatMap((r) => r.outputs.filter((o) => o.key === 'fluid:gtceu:steam' && r.duration).map((o) => o.count / r.duration));
      return any(vals, f.mbt, 'steam per tick');
    }
    case 'steamFuel': {
      const b = BOILERS[nd.item];
      if (!b || !b.type) return fail('not a fuel-burning GTM boiler');
      const mbt = boilerSteam(nd.item);
      const vals = [];
      for (const r of idx.consumers.get(f.key) || []) {
        if (r.type !== b.type || !r.duration) continue;
        const inp = consumed(r, f.key);
        if (!inp) continue;
        const dur = b.hp ? Math.max(1, Math.floor(r.duration * 0.5)) : r.duration;
        vals.push(f.key.startsWith('fluid:') ? (mbt * dur) / inp.count : (mbt * dur) / inp.count / 1000);
      }
      return any(vals, f.buckets, `buckets of steam from ${f.key}`);
    }
    case 'ccSteam': {
      const vals = [];
      for (const r of idx.consumers.get(f.key) || []) {
        if (!nd.types.includes(r.type)) continue;
        const inp = consumed(r, f.key);
        const st = r.outputs.find((o) => o.key === 'fluid:gtceu:steam');
        if (inp && st) vals.push(st.count / inp.count);
      }
      return any(vals, f.mb, `steam per mB of ${f.key}`);
    }
    case 'engine': {
      const t = hullTier(nd.item);
      if (t === null) return fail('no machine hull in the controller recipe');
      const factor = t > TIER_INDEX.ev ? 2 : 1.5;
      if (f.eut !== V(t)) return fail(`hull tier ${t}: V = ${V(t)}`);
      if (f.factor !== factor || f.boosted !== V(t) * 2 * factor) return fail(`boosted: ${V(t) * 2 * factor} (factor ${factor})`);
      return pass(`hull tier ${t}: V = ${V(t)}, boosted 2 x ${factor}`);
    }
    case 'turbine': {
      const t = hullTier(nd.item);
      return t !== null && f.eut === 2 * V(t) ? pass(`hull tier ${t}: 2 x V = ${2 * V(t)}`) : fail(`hull tier ${t}`);
    }
    case 'cover': {
      const mm = /^gtceu:(ulv|lv|mv|hv|ev|iv|luv|zpm|uv|uhv)_solar_panel$/.exec(nd.item);
      const v = nd.item === 'gtceu:solar_panel' ? 1 : mm ? V(TIER_INDEX[mm[1]]) : null;
      return v === f.eut ? pass(`CoverSolarPanel: ${v}`) : fail(`CoverSolarPanel: ${v}`);
    }
    case 'battery': {
      if (!electric) return fail('needs the dump\'s electric.json');
      const e = (electric.items || []).find((x) => x.id === f.item);
      return e && e.capacity === f.eu ? pass(`electric.json: ${e.capacity}`) : fail(`electric.json: ${e ? e.capacity : 'no entry'}`);
    }
    case 'cable': {
      if (!electric) return fail('needs the dump\'s electric.json');
      const w = (electric.wires || []).find((x) => x.material === f.material);
      if (!w) return fail(`electric.json has no wire for ${f.material}`);
      const ok = w.voltage === V(TIER_INDEX[String(f.tier).toLowerCase()]) && w.amperage === f.amps && w.loss === f.loss;
      return ok ? pass(`electric.json: ${w.voltage} V, ${w.amperage} A, loss ${w.loss}`) : fail(`electric.json: ${w.voltage} V, ${w.amperage} A, loss ${w.loss}`);
    }
    case 'toll': {
      if (!electric || !electric.ae2) return fail('needs the dump\'s electric.json');
      const p = Math.round(Number(electric.ae2.p2pEnergyTax) * 10000) / 100;
      return p === f.percent ? pass(`AE2 P2P energy tax ${electric.ae2.p2pEnergyTax}`) : fail(`AE2 P2P energy tax ${electric.ae2.p2pEnergyTax}`);
    }
    case 'anywhere': {
      // the recipes of the type with no dimension condition are the ones that run off Earth: their fuels must be exactly these
      const free = (byType.get(f.type) || []).filter((r) => !(r.conditions || []).some((c) => /dimension/.test(String(c.type || ''))));
      if (!free.length) return fail(`no recipe of ${f.type} runs without a dimension condition`);
      const want = f.fuels.map((x) => x.key);
      const stray = free.filter((r) => !r.inputs.some((i) => i.alts.some((a) => want.includes(a))));
      const missing = want.filter((k) => !free.some((r) => r.inputs.some((i) => i.alts.includes(k))));
      if (stray.length || missing.length) return fail(`off Earth: ${free.map((r) => r.id).join(', ')}`);
      return pass(`${free.length} ${f.type} recipe(s) with no dimension condition: ${free.map((r) => r.id).join(', ')}`);
    }
    case 'wcell': {
      if (!wireless) return fail('no tables/wireless_energy.json in this checkout or in the dump\'s upload.zip');
      const row = (wireless.tiers || []).find((t) => t.cell === f.item);
      if (!row) return fail(`the wireless table has no cell ${f.item}`);
      if (row.capacity !== f.eu) return fail(`${wirelessSrc.from}: ${row.capacity}`);
      if (!idx.items.has(f.item)) return fail(`${f.item} is not registered in the dump`);
      if (!electric) return pass(`${wirelessSrc.from}: ${row.capacity}`);
      const bat = (electric.items || []).find((x) => x.id === row.referenceBattery);
      return bat && bat.capacity * 6 === f.eu ? pass(`${wirelessSrc.from}: ${row.capacity} = 6 x ${row.referenceBattery} (electric.json: ${bat.capacity})`)
        : fail(`6 x ${row.referenceBattery} = ${bat ? bat.capacity * 6 : 'no entry in electric.json'}`);
    }
    case 'wslots': {
      if (!wireless) return fail('no tables/wireless_energy.json in this checkout or in the dump\'s upload.zip');
      const t = wireless.tower || {};
      if (t.cellSlots !== f.n) return fail(`${wirelessSrc.from}: cellSlots ${t.cellSlots}`);
      const cells = (wireless.tiers || []).map((r) => r.cell);
      const counts = cells.map((c) => patternCount(t.id, c));
      if (counts.some((c) => c !== f.n)) return fail(`structures.json: ${t.id} takes cells in ${counts.join('/')} places`);
      return pass(`${wirelessSrc.from}: cellSlots ${t.cellSlots}; structures.json: every cell fits ${f.n} places of ${t.id}`);
    }
    case 'wloss': {
      if (!wireless || !wireless.loss) return fail('no loss in the wireless table');
      const lost = 100 * (1 - wireless.loss.numerator / wireless.loss.denominator);
      return near(lost, f.percent) ? pass(`${wirelessSrc.from}: ${wireless.loss.numerator}/${wireless.loss.denominator} arrives`) : fail(`${wirelessSrc.from}: ${lost}% lost`);
    }
    case 'wamps':
    case 'wcover': {
      if (!wireless) return fail('no tables/wireless_energy.json in this checkout or in the dump\'s upload.zip');
      const names = (wireless.tiers || []).map((r) => r.name);
      if (names[0] !== f.from || names[names.length - 1] !== f.to) return fail(`${wirelessSrc.from}: tiers ${names.join(', ')}`);
      const amps = f.t === 'wamps' ? wireless.hatchAmps : wireless.coverAmps;
      if (JSON.stringify(amps) !== JSON.stringify(f.amps)) return fail(`${wirelessSrc.from}: ${JSON.stringify(amps)} A`);
      const kind = wirelessKind(nd.item);
      const ids = wirelessIds(kind);
      if (!ids.includes(nd.item)) return fail(`${nd.item} is not one of the table's ${kind}s`);
      const missing = ids.filter((id) => !idx.items.has(id));
      if (missing.length) return fail(`not registered in the dump: ${missing.join(', ')}`);
      return pass(`${wirelessSrc.from}: ${JSON.stringify(amps)} A, ${names.join(', ')}; all ${ids.length} ${kind}s registered`);
    }
    default:
      return fail('unknown figure ' + f.t);
  }
}

function checkArrow(e) {
  const A = e.srcRes;
  const B = e.dst;
  if (A.era) {
    // an era quest introduces B: B's item is one of its tasks, or its icon
    return A.items.has(B.item) ? { ok: true, recipes: [`${A.chapter} "${A.title}" (${A.id})`] } : { ok: false, why: `quest ${A.chapter} "${A.title}" has no task or icon ${B.item}` };
  }
  if (e.engine) {
    const ok = (ENGINES[B.item] || []).some((k) => keysOf(A).includes(k));
    return ok ? { ok: true, recipes: [`LargeCombustionEngineMachine takes ${A.res}`] } : { ok: false, why: `${B.item} does not take ${A.res} besides its fuel` };
  }
  if (e.boilerWater) {
    return BOILERS[B.item] && A.res === 'fluid:minecraft:water' ? { ok: true, recipes: ['a GTM boiler drinks water'] } : { ok: false, why: `${B.item} is not a GTM boiler, or ${A.res} is not water` };
  }
  if (e.build) {
    const hits = keysOf(A).flatMap((k) => (idx.consumers.get(k) || []).filter((r) => outputKeys(r).has(B.item)));
    return hits.length ? { ok: true, recipes: [hits[0].id], build: true } : { ok: false, why: `no recipe builds ${B.item} from ${A.res}` };
  }
  if (e.structure) {
    const n = patternCount(B.item, A.item);
    return n ? { ok: true, recipes: [`structures.json: ${B.item} takes ${A.item} in ${n} places`] } : { ok: false, why: `${B.item}'s pattern (structures.json) has no place for ${A.item}` };
  }
  if (e.network) {
    if (!wireless) return { ok: false, why: 'no tables/wireless_energy.json in this checkout or in the dump\'s upload.zip' };
    if (!wireless.tower || A.item !== wireless.tower.id) return { ok: false, why: `${A.item} is not the wireless table's tower` };
    const kind = wirelessKind(B.item);
    return kind && wirelessIds(kind).includes(B.item) && idx.items.has(B.item) ? { ok: true, recipes: [`${wirelessSrc.from}: ${B.item} works through the network ${A.item} holds`] }
      : { ok: false, why: `${B.item} is not a registered wireless hatch or cover of the table` };
  }
  const types = e.by || (B.machine ? null : B.by) || null;
  if (e.via) {
    const chain = [keysOf(A), ...e.via.map((k) => [k]), keysOf(B)];
    if (A.machine || B.machine) return { ok: false, why: 'a summary arrow joins items, not machines' };
    const steps = [];
    for (let i = 0; i + 1 < chain.length; i++) {
      const hits = itemToItem(chain[i], chain[i + 1], null);
      if (!hits.length) return { ok: false, why: `no recipe takes ${chain[i][0]} and gives ${chain[i + 1][0]}` };
      steps.push(hits[0].id);
    }
    return { ok: true, recipes: steps, summary: e.via };
  }
  if (!A.machine && !B.machine) {
    // GTM files block-to-dust grinding (cobblestone to stone dust) under its recycling categories: an arrow says so with recycle
    const hits = itemToItem(keysOf(A), keysOf(B), types, !!(e.recycle || B.recycle));
    return hits.length ? { ok: true, recipes: [hits[0].id], n: hits.length } : { ok: false, why: `no recipe${types ? ' of ' + types.join('|') : ''} takes ${A.res} and gives ${B.res}` };
  }
  if (!A.machine && B.machine) {
    const hits = keysOf(A).flatMap((k) => (idx.consumers.get(k) || []).filter((r) => B.types.includes(r.type) && !recycling(r)));
    return hits.length ? { ok: true, recipes: [hits[0].id], n: hits.length } : { ok: false, why: `no ${B.types.join('|')} recipe takes ${A.res}` };
  }
  if (A.machine && !B.machine) {
    const ins = drawnInputs(A);
    const hits = keysOf(B).flatMap((k) => (idx.producers.get(k) || []).filter((r) => A.types.includes(r.type) && !recycling(r)
      && (ins.length === 0 || ins.some((i) => inputKeys(r).has(i)))));
    return hits.length ? { ok: true, recipes: [hits[0].id], n: hits.length } : { ok: false, why: `no ${A.types.join('|')} recipe gives ${B.res}${ins.length ? ' from ' + ins.join(' or ') : ''}` };
  }
  const hits = itemToItem([A.item], [B.item], null);
  return hits.length ? { ok: true, recipes: [hits[0].id], build: true } : { ok: false, why: `no recipe builds ${B.item} from ${A.item}` };
}

const lines = ['# Processing lines: arrow check', '', `Dump: \`${dumpDir}\` (EMI switch at ${dumpEra} when dumped). Implemented era now: ${implemented}.`, ''];
let fails = 0;
let total = 0;
let figs = 0;
let figFails = 0;
let allIssues = 0;
const summaries = [];
for (const m of model.chapters) {
  const issues = [];
  const verified = [];
  const verifiedFigs = [];
  // what every node shows
  for (const nd of m.nodes) {
    if (nd.link) continue;
    if (!idx.items.has(nd.item)) issues.push(`${nd.key}: item ${nd.item} does not exist`);
    // later content (kind peek) may still be hidden in EMI: it only takes a checkmark
    const peek = nd.kind === 'peek';
    if (!peek && hiddenTag.has(nd.item) && stillHidden(nd.item, dumpItem)) issues.push(`${nd.key}: ${nd.item} is hidden in EMI (c:hidden_from_recipe_viewers)`);
    if (!peek && lateItem.has(nd.item)) issues.push(`${nd.key}: ${nd.item} waits for ${lateItem.get(nd.item)} (hidden_until.json)`);
    if (nd.fluid) {
      if (!idx.fluids.has(nd.fluid)) issues.push(`${nd.key}: fluid ${nd.fluid} does not exist`);
      if (!peek && hiddenFluidTag.has(nd.fluid) && stillHidden(nd.fluid, dumpFluid)) issues.push(`${nd.key}: fluid ${nd.fluid} is hidden in EMI`);
      if (!peek && lateFluid.has(nd.fluid)) issues.push(`${nd.key}: fluid ${nd.fluid} waits for ${lateFluid.get(nd.fluid)}`);
    }
    if (nd.machine && nd.typeless) issues.push(`${nd.key}: no recipe types for ${nd.item} (machines.json has none: give them)`);
    if (nd.machine) for (const t of nd.types) if (!idx.recipeTypes.has(t) && ![...idx.recipes.values()].some((r) => r.type === t)) issues.push(`${nd.key}: recipe type ${t} unknown`);
    // the numbers in its text
    for (const f of nd.figs || []) {
      figs++;
      const r = checkFig(nd, f);
      const what = `${f.t}${f.name ? ' ' + f.name : ''} ${f.eu ?? f.eut ?? f.mbt ?? f.buckets ?? f.mb ?? f.total ?? f.loss ?? f.percent ?? f.n ?? f.amps ?? ''}`.trim();
      if (r.ok) verifiedFigs.push(`${nd.key} [${what}]: ${r.how}`);
      else { figFails++; issues.push(`FIGURE ${nd.key} [${what}]: ${r.why}`); }
    }
  }
  // leaves
  const hasOut = new Set();
  for (const mm of model.chapters) for (const nd of mm.nodes) for (const e of nd.arrows) hasOut.add(e.srcRes.id);
  for (const nd of m.nodes) {
    if (nd.link || nd.machine || hasOut.has(nd.id)) continue;
    if (['product', 'ret', 'dest', 'info', 'peek', 'slot'].includes(nd.kind)) continue;
    if (!nd.end) issues.push(`${nd.key}: a leaf with no destination (give it an arrow, kind 'product', or end: '...')`);
  }
  // arrows
  for (const nd of m.nodes) {
    for (const e of nd.arrows) {
      total++;
      const r = checkArrow(e);
      const name = `${e.src.key}${e.src.link ? ' (' + e.src.link + ')' : ''} -> ${nd.key}`;
      if (!r.ok) { fails++; issues.push(`ARROW ${name}: ${r.why}`); continue; }
      verified.push(`${name}: ${r.recipes.join(' + ')}${r.n > 1 ? ` (and ${r.n - 1} more)` : ''}${r.build ? ' (built from)' : ''}`);
      if (r.summary) summaries.push(`${m.file}: ${e.srcRes.title} -> ${nd.title}, through ${r.summary.join(', ')} (${r.recipes.join(', ')})`);
    }
  }
  lines.push(`## ${m.file}: ${m.nodes.length} nodes, ${verified.length} arrows verified${verifiedFigs.length ? ', ' + verifiedFigs.length + ' figures verified' : ''}, ${issues.length} issues`, '');
  allIssues += issues.length;
  for (const i of issues) lines.push('- **' + i + '**');
  if (issues.length) lines.push('');
  for (const v of [...verified, ...verifiedFigs]) lines.push('- ' + v);
  lines.push('');
  console.log(`${m.file}: ${verified.length} arrows verified${verifiedFigs.length ? ', ' + verifiedFigs.length + ' figures verified' : ''}, ${issues.length} issues`);
  for (const i of issues) console.log('  ' + i);
}
lines.push('## Summary arrows (named intermediates)', '');
for (const s of summaries) lines.push('- ' + s);
if (outFile) {
  fs.mkdirSync(path.dirname(path.resolve(outFile)), { recursive: true });
  fs.writeFileSync(outFile, lines.join('\n') + '\n');
}
console.log(`total: ${total} arrows, ${fails} failing; ${figs} figures, ${figFails} failing; ${allIssues} issues; ${summaries.length} summary arrows; hidden table at dump time: ${dumpTableFrom}${electric ? '' : '; no electric.json in this dump'}${outFile ? '; report ' + outFile : ''}`);
process.exitCode = allIssues ? 1 : 0;
