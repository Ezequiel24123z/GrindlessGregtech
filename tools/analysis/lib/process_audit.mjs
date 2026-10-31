// Process audit: every item, fluid, block and machine of ours, with who makes it, who uses it and whether anything explains it.
//
// It flags what the owner found in EMI ("objetos incrafteables", "sin informacion de que hace la maquina", "no podemos dejar
// procesos invisibles"): uncraftable or useless things of ours, recipe types and machines with no recipe, hidden items that still
// have recipes, byproducts with no honest destination (product principle 3), loops that make something from nothing (principle 8)
// and chains that only shuffle an item through one trivial step. Findings are keyed `kind|id`; T0 fails only on keys that are not in
// tools/analysis/process_audit.json. The model is the native dump (lib/dump.mjs) plus the registry the static KubeJS stand-in learns
// from the pack's startup scripts (a cached copy: node tools/analysis/process-audit.mjs --make-registry). The in-game EMI runtime is
// QR-A0's (lib/emi_coverage.mjs); this audit is static.
import fs from 'node:fs';
import path from 'node:path';
import { normalizeRecipe } from './normalize.mjs';
import { makeGlobMatcher } from './util.mjs';

const FLUID = 'fluid:';
export const KINDS = [
  'uncraftable',
  'no_use',
  'byproduct_no_destination',
  'machine_no_craft',
  'machine_empty_type',
  'type_empty',
  'machine_no_info',
  'm_info_missing',
  'm_info_generic',
  'm_info_empty',
  'hidden_with_recipes',
  'self_gain',
  'cycle_gain',
  'trivial_step',
];
const ERAS = ['steam', 'lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv', 'uev', 'uiv', 'uxv', 'opv', 'max'];
const TIER_ERA = ['steam', 'lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv', 'uev', 'uiv', 'uxv', 'opv', 'max'];
const OURS_NS = ['grindless'];
// GT forms that are used by placing or wearing them, not by a recipe: no use is expected.
const PLACED_OR_WORN = /(_casing|_block|_glass|_coil_block|_frame|_fuel_tank|_cell|_vault|_radiator|_pipe|_wire|_cable|_hatch|_bus|_sword|_pickaxe|_axe|_shovel|_hoe|_helmet|_chestplate|_leggings|_boots|_key|_pump|_turbine_rotor|_drill|_antenna)$/;

/** Era folder of a script path ("kubejs/startup_scripts/grindless/ev/x.js" -> "ev"). */
export function eraOfFile(file) {
  const m = /grindless\/([^/]+)\//.exec(String(file || '').replace(/\\/g, '/'));
  return m ? m[1] : null;
}

/** Finds the line of the first mention of `needle` in a pack file (pack-relative path), or 0. */
export function locate(packDir, file, needles) {
  if (!file) return 0;
  const p = path.join(packDir, file);
  if (!fs.existsSync(p)) return 0;
  const lines = fs.readFileSync(p, 'utf8').split('\n');
  for (const n of needles) {
    const i = lines.findIndex((l) => l.includes(n));
    if (i >= 0) return i + 1;
  }
  return 0;
}

const tokenRe = (name) => new RegExp('(^|_)' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(_|$)');

/**
 * What is ours: the registry's items, blocks, fluids and machines, every item or fluid of our namespace in the dump, and the forms
 * of the materials our startup scripts register (an id of that namespace whose local name holds the material name as a token).
 * Returns {items: Map(key -> {file}), fluids: Map(key -> {file}), machines: Map(id -> registry machine)}.
 */
export function oursOf(dump, registry) {
  const items = new Map();
  const fluids = new Map();
  for (const it of registry.items) items.set(it.id, { file: it.file, via: 'registry' });
  for (const b of registry.blocks || []) if (!items.has(b.id)) items.set(b.id, { file: b.file, via: 'registry' });
  for (const f of registry.fluids) fluids.set(FLUID + f.id, { file: f.file, via: 'registry' });
  const mats = [...registry.materials].map((m) => ({ ns: m.name.split(':')[0], re: tokenRe(m.name.split(':')[1]), file: m.file }));
  const modified = new Set(registry.modifiedMaterials || []);
  const matchMaterial = (id) => {
    const [ns, local] = id.split(':');
    for (const m of mats) if (m.ns === ns && m.re.test(local)) return m;
    return null;
  };
  for (const id of dump.items) {
    if (items.has(id)) continue;
    if (OURS_NS.includes(id.split(':')[0])) items.set(id, { file: null, via: 'namespace' });
    else {
      const m = matchMaterial(id);
      if (m && !modified.has(id)) items.set(id, { file: m.file, via: 'material' });
    }
  }
  for (const id of dump.fluids) {
    const k = FLUID + id;
    if (fluids.has(k)) continue;
    if (OURS_NS.includes(id.split(':')[0])) fluids.set(k, { file: null, via: 'namespace' });
    else {
      const m = matchMaterial(id);
      if (m) fluids.set(k, { file: m.file, via: 'material' });
    }
  }
  const machines = new Map(registry.machines.map((m) => [m.id, m]));
  return { items, fluids, machines };
}

/** Blocks the structure patterns place (every candidate of every symbol): a use by placing. */
function structureBlocks(dump) {
  const out = new Set();
  for (const s of dump.structures.values()) {
    for (const sym of Object.values(s.symbols || {})) for (const b of sym.blocks || []) out.add(b);
  }
  return out;
}

/** ["grindless:x", ...] named in the ES5 loot tables / quests, to separate "given by a quest" from "never obtainable". */
export function questMentions(packDir) {
  const out = new Set();
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(snbt|json)$/.test(e.name)) for (const m of fs.readFileSync(p, 'utf8').matchAll(/\b(grindless:[a-z0-9_]+)/g)) out.add(m[1]);
    }
  };
  walk(path.join(packDir, 'config', 'ftbquests'));
  walk(path.join(packDir, 'kubejs', 'data'));
  return out;
}

/**
 * The audit. Inputs: dump (lib/dump.mjs), registry (cached stand-in registry), cfg (process_audit.json options and
 * emi_coverage.json's endProducts via `endProducts`), emi (loadEmiData), packDir, quests (a Set from questMentions).
 */
export function auditProcesses({ dump, registry, cfg = {}, emi = { pages: [], disabled: [] }, endProducts = {}, pendingUses = [], worldItems = new Set(), quests = new Set(), packDir = 'pack' }) {
  const st = { unresolved: new Set() };
  const gtTypes = new Set([...dump.recipeTypes.keys()]);
  const ctx = { tags: dump.tags, st, cfg: { typeAliases: {}, toolTagSet: new Set() }, gtTypes };
  const ours = oursOf(dump, registry);
  const ourTypes = new Set(registry.recipeTypes.map((t) => t.id));
  const hiddenIndex = new Set(dump.tags.items('c:hidden_from_recipe_viewers'));
  const hiddenWith = new Set(dump.tags.items('grindless:hidden_with_recipes'));
  const endItems = new Map((endProducts.items || []).map((e) => [e.id, e.reason || '']));
  const endGlob = makeGlobMatcher(endProducts.globs || []);
  // emi_coverage.json's pendingUses: a later package of the era writes the use (the EMI audit fails once the entry is stale)
  const laterUse = new Set(pendingUses.map((p) => p.id));
  const allow = makeGlobMatcher(cfg.ignore || []);

  // ---- recipes
  const producers = new Map(); // key -> [{id, type, byproduct}]
  const consumers = new Map();
  const typeCount = new Map();
  const norm = [];
  for (const r of dump.recipes.values()) {
    const n = normalizeRecipe(r, ctx);
    typeCount.set(r.type, (typeCount.get(r.type) || 0) + 1);
    norm.push({ r, n });
    const outs = n.outputs.filter((o) => !o.key.startsWith('research:'));
    const distinct = new Set(outs.map((o) => o.key)).size;
    for (const o of outs) {
      const by = distinct >= 2 && (o.chance < 1 || o !== outs[0]);
      if (!producers.has(o.key)) producers.set(o.key, []);
      producers.get(o.key).push({ id: r.id, type: r.type, byproduct: by && o.chance < 1 ? true : by, added: r.added });
    }
    for (const i of n.inputs) {
      for (const a of i.alts) {
        if (!consumers.has(a)) consumers.set(a, []);
        consumers.get(a).push({ id: r.id, type: r.type, cap: !!i.cap });
      }
    }
  }
  const structBlocks = structureBlocks(dump);
  const pageStacks = new Set();
  const expand = (s) => (s.tag ? (s.kind === 'fluid' ? dump.tags.fluids(s.tag).map((f) => FLUID + f) : dump.tags.items(s.tag)) : [s.kind === 'fluid' ? FLUID + s.id : s.id]);
  for (const p of emi.pages) for (const s of (p.type === 'emi:info' ? p.stacks : [...p.inputs, ...p.outputs])) for (const k of expand(s)) pageStacks.add(k);
  const infoPage = new Set();
  for (const p of emi.pages) if (p.type === 'emi:info') for (const s of p.stacks) for (const k of expand(s)) infoPage.add(k);
  const langKeys = new Set(Object.keys((registry.lang && registry.lang.en_us) || {}));
  const hasTooltip = (local) => {
    for (const k of langKeys) if (k.startsWith('tooltip.grindless.' + local + '.') || k === 'item.grindless.' + local + '.tooltip' || k === 'tooltip.grindless.' + local) return true;
    return false;
  };

  const findings = [];
  const add = (kind, id, era, file, detail, extra) => findings.push({ kind, id, era: era || 'unknown', file: file || null, detail, ...extra });
  const eraOfItem = (key, info) => eraOfFile(info && info.file) || null;

  // ---- items and fluids of ours
  const isMachineId = (id) => ours.machines.has(id) || dump.machines.has(id);
  const veinRes = (dump.veins || []).flatMap((v) => v.mats || []).map((m) => tokenRe(m.split(':')[1]));
  const veinFluids = new Set((dump.fluidVeins || []).map((v) => FLUID + v.fluid));
  const veinMat = (local) => veinRes.some((re) => re.test(local));
  const subjects = [...ours.items.entries()].map(([k, v]) => ({ key: k, info: v, fluid: false })).concat([...ours.fluids.entries()].map(([k, v]) => ({ key: k, info: v, fluid: true })));
  for (const s of subjects) {
    const k = s.key;
    if (allow(k) || isMachineId(k)) continue;
    const prod = producers.get(k) || [];
    const cons = consumers.get(k) || [];
    const era = eraOfItem(k, s.info);
    const file = s.info.file;
    const local = k.split(':')[1];
    const hidden = !s.fluid && hiddenIndex.has(k);
    if (/_bucket$/.test(k) || /^fluid:[^:]+:flowing_/.test(k)) continue;
    const given = (/_ore$/.test(k) && veinMat(local)) || worldItems.has(k) || quests.has(k) || (s.fluid && worldItems.has(k.slice(FLUID.length))) || veinFluids.has(k);
    if (!hidden) {
      if (prod.length === 0 && !given && !s.fluid) add('uncraftable', k, era, file, 'no recipe makes it and no world, loot or quest source is known');
      else if (prod.length === 0 && s.fluid && !given) add('uncraftable', k, era, file, 'no recipe makes this fluid');
      const used = cons.length > 0 || structBlocks.has(k) || pageStacks.has(k) || endItems.has(k) || endGlob(k) || laterUse.has(k) || (!s.fluid && PLACED_OR_WORN.test(local));
      const onlyBy = prod.length > 0 && prod.every((p) => p.byproduct);
      if (!used && !given) {
        if (onlyBy) add('byproduct_no_destination', k, era, file, `only a byproduct of ${prod.slice(0, 3).map((p) => p.id).join(', ')}; nothing consumes, voids or explains it`);
        else if (prod.length > 0) add('no_use', k, era, file, `made by ${prod.slice(0, 3).map((p) => p.id).join(', ')} but nothing consumes it and no page states its use`);
      }
    } else if (!hiddenWith.has(k) && (prod.length > 0 || cons.length > 0)
      // an old item of an earlier version (TP-D2): nothing makes it, its only use is the 1:1 conversion EMI must keep showing
      && !(prod.length === 0 && cons.every((c) => /^grindless:crafting\/retired\//.test(c.id)))) {
      add('hidden_with_recipes', k, era, file, `hidden from the index only, yet ${prod.length} recipes make it and ${cons.length} use it (hide with grindless:hidden_with_recipes or drop the recipes)`);
    }
    // trivial step: the only producer is a 1:1 recipe from one other item of ours
    if (!hidden && prod.length === 1 && prod[0].added) {
      const rec = norm.find((x) => x.r.id === prod[0].id);
      const ins = rec.n.inputs.filter((i) => !i.cap && i.consume > 0 && !i.alts.includes('gtceu:programmed_circuit'));
      const outs = rec.n.outputs;
      if (ins.length === 1 && outs.length === 1 && ins[0].alts.length === 1 && ins[0].count === outs[0].count && outs[0].chance >= 1 && ins[0].alts[0] !== k && rec.n.shape !== 'shaped' && rec.n.conditions.length === 0 && (ours.items.has(ins[0].alts[0]) || ours.fluids.has(ins[0].alts[0]))) {
        add('trivial_step', k, era, file, `only made by ${prod[0].id}: ${ins[0].alts[0]} x${ins[0].count} -> ${k} x${outs[0].count}, one trivial step`);
      }
    }
  }

  // ---- recipe types and machines
  // A machine hidden with its recipes (hidden_until groups, `until: never` included) is not offered to the player, so an
  // empty type or a missing craft is not a gap; the audit catches it once the machine is released.
  const machineHidden = (id) => hiddenWith.has(id);
  const eraOfTier = (t) => TIER_ERA[Math.max(0, Math.min(TIER_ERA.length - 1, (t || 1) - 1 + 0))] || 'unknown';
  const emptyTypes = new Set([...gtTypes].filter((t) => !typeCount.get(t) && t !== 'gtceu:dummy'));
  for (const t of emptyTypes) {
    const users = [...dump.machines.values()].filter((m) => m.types.includes(t));
    if (users.length === 0 && !ourTypes.has(t)) continue;
    if (users.length > 0 && users.every((m) => machineHidden(m.id))) continue;
    const reg = registry.recipeTypes.find((x) => x.id === t);
    add('type_empty', t, eraOfFile(reg && reg.file) || 'unknown', reg ? reg.file : null, `${ourTypes.has(t) ? 'our' : 'GTM/addon'} recipe type with 0 recipes; machines: ${users.slice(0, 6).map((m) => m.id).join(', ') || 'none'}`, { ours: ourTypes.has(t) });
  }
  const craftProducers = (id) => producers.get(id) || [];
  for (const m of dump.machines.values()) {
    if (machineHidden(m.id)) continue;
    const reg = ours.machines.get(m.id);
    const era = (reg && eraOfFile(reg.file)) || eraOfTier(m.tier);
    const file = reg ? reg.file : null;
    if (m.types.length > 0 && m.types.every((t) => emptyTypes.has(t))) {
      add('machine_empty_type', m.id, era, file, `every recipe type (${m.types.join(', ')}) has 0 recipes`, { ours: !!reg });
    }
    if (!m.mb && m.tier > 0 && m.types.length > 0 && craftProducers(m.id).length === 0 && !worldItems.has(m.id) && !quests.has(m.id)) {
      add('machine_no_craft', m.id, era, file, 'single machine with recipe types and no recipe that crafts it', { ours: !!reg });
    }
  }
  for (const reg of registry.machines) {
    if (!['multiblock', 'simple', 'generator'].includes(reg.kind)) continue;
    const name = reg.name || reg.id.split(':')[1];
    const tip = [...langKeys].some((k) => k.startsWith(`grindless.machine.${name}.tooltip`) || k.startsWith(`block.gtceu.${name}.tooltip`) || k.startsWith(`block.gtceu.${reg.id.split(':')[1]}.tooltip`));
    if (!tip && !infoPage.has(reg.id)) add('machine_no_info', reg.id, eraOfFile(reg.file) || 'unknown', reg.file, `${reg.kind} machine with no tooltip (grindless.machine.${name}.tooltip.N) and no EMI info page`);
  }

  // M-INFO: every multiblock controller of ours needs a page of its own that says what it does and what it is for.
  const SPECIAL = /chart|reader|writer|research|data|scanner|imaging|interferometer|simulat|locked|dimension|assembly_line_research/;
  const pagesOf = (id) => emi.pages.filter((p) => p.type === 'emi:info' && p.stacks.some((s) => expand(s).includes(id)));
  for (const reg of registry.machines) {
    const dm = dump.machines.get(reg.id);
    if (!(reg.kind === 'multiblock' || reg.kind === 'custom') || !(dm ? dm.mb : reg.kind === 'multiblock')) continue;
    const types = dm ? dm.types : reg.recipeTypes || [];
    const pages = pagesOf(reg.id);
    const specific = pages.some((p) => p.stacks.length <= 3);
    const visible = types.some((t) => typeCount.get(t) > 0 && !/research|data/.test(t));
    const special = SPECIAL.test(reg.id) || types.some((t) => SPECIAL.test(t)) || types.length === 0 || !visible;
    const era = eraOfFile(reg.file) || 'unknown';
    if (pages.length === 0) {
      if (!visible) add('m_info_empty', reg.id, era, reg.file, 'multiblock with no visible recipe and no EMI info page: EMI shows nothing for it. Needs a page saying what it does and what it is for');
      else add('m_info_missing', reg.id, era, reg.file, `multiblock with no EMI info page (types: ${types.join(', ') || 'none'}). Needs a page saying what it does and what it is for`);
    } else if (special && !specific) {
      add('m_info_generic', reg.id, era, reg.file, 'special-purpose multiblock covered only by a shared page; needs a page of its own');
    }
  }

  // ---- loops and gains of our own recipes
  const edges = new Map();
  for (const { r, n } of norm) {
    if (!r.added) continue;
    const ins = n.inputs.filter((i) => !i.cap && i.consume > 0 && !i.alts.includes('gtceu:programmed_circuit'));
    for (const i of ins) {
      if (i.alts.length !== 1) continue;
      const o = n.outputs.find((x) => x.key === i.alts[0]);
      if (o && o.count * o.chance > i.count + 1e-9 && n.shape === 'gt') add('self_gain', r.id, eraOfFile((ours.items.get(i.alts[0]) || ours.fluids.get(i.alts[0]) || {}).file) || eraOfFile((ours.items.get(n.outputs[0].key) || {}).file), null, `${i.alts[0]}: in ${i.count}, out ${o.count} x${o.chance}`);
    }
    if (ins.length === 1 && ins[0].alts.length === 1 && n.outputs.length === 1) edges.set(r.id, { from: ins[0].alts[0], to: n.outputs[0].key, ratio: (n.outputs[0].count * n.outputs[0].chance) / ins[0].count, type: r.type });
  }
  const byFrom = new Map();
  for (const [id, e] of edges) {
    if (!byFrom.has(e.from)) byFrom.set(e.from, []);
    byFrom.get(e.from).push({ id, ...e });
  }
  const seen = new Set();
  for (const [id, e] of edges) {
    for (const back of byFrom.get(e.to) || []) {
      if (back.to !== e.from || back.id === id) continue;
      const pair = [id, back.id].sort().join('+');
      if (seen.has(pair) || e.ratio * back.ratio <= 1 + 1e-9) continue;
      seen.add(pair);
      add('cycle_gain', pair, 'unknown', null, `${e.from} -> ${e.to} (x${e.ratio}) and back (x${back.ratio}) gains x${(e.ratio * back.ratio).toFixed(3)} per lap`);
    }
  }

  findings.sort((a, b) => (a.kind < b.kind ? -1 : a.kind > b.kind ? 1 : a.id < b.id ? -1 : 1));
  for (const f of findings) f.key = f.kind + '|' + f.id;
  const counts = Object.fromEntries(KINDS.map((k) => [k, findings.filter((f) => f.kind === k).length]));
  return { findings, counts, ours: { items: ours.items.size, fluids: ours.fluids.size, machines: ours.machines.size }, emptyTypes: [...emptyTypes].sort(), typeCount };
}

/** Findings not in the baseline ({keys: [...]}). */
export function newFindings(res, baseline) {
  const known = new Set((baseline && baseline.keys) || []);
  return res.findings.filter((f) => !known.has(f.key));
}

export function renderAuditText(res, baseline = null, limit = 8) {
  const fresh = baseline ? newFindings(res, baseline) : [];
  const lines = [`Process audit: ${res.ours.items} items, ${res.ours.fluids} fluids, ${res.ours.machines} machines of ours; ${res.findings.length} findings`];
  for (const k of KINDS) lines.push(`  ${k.padEnd(26)} ${res.counts[k]}`);
  if (baseline) lines.push(`${fresh.length} new against the baseline`);
  for (const f of fresh.slice(0, limit)) lines.push(`  NEW ${f.key}: ${f.detail}`);
  return lines.join('\n');
}

export { ERAS };
