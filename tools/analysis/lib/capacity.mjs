// Capacity model for tools/analysis/capacity-lint.mjs (pure functions: no file or game access).
// Semantics (GTM 7.5.3, tag v7.5.3-1.20.1), the reason for each rule below:
//  - WorkableTieredMachine (api/machine/WorkableTieredMachine.java:118-133): a singleblock has as many item slots and fluid tanks as the
//    recipe type's max IO (GTRecipeType.getMaxInputs/getMaxOutputs), and every tank holds tankScalingFunction(tier) mB.
//  - NotifiableFluidTank (api/machine/trait/NotifiableFluidTank.java fillInternal/handleRecipeInner, allowSameFluids=false): one fluid fills
//    ONE tank and outputs merge into the tank already holding that fluid, so each fluid amount must fit a single tank.
//  - NotifiableItemStackHandler: a sized ingredient spans several slots (64 per slot), so slots needed = sum(ceil(count/64)).
//    The programmed circuit has its own slot and is not counted.
//  - Hatches: FluidHatchPartMachine.java:63-65,106-107 (initial * 2^min(9,tier)), ItemBusPartMachine.java:106-108 ((1+min(9,tier))^2 slots),
//    DualHatchPartMachine.java (2 tanks, (tier-4)^2 slots). The snapshot holds the values the game reported, not these formulas.
//  - GTRecipeSchema.java:136-142 only WARNS when a recipe has more inputs than the type supports ("... than its recipe type can support"),
//    so we enforce it here. The builder counts every item entry, the programmed circuit included, whether it is raw or sized; the circuit
//    needs no ordinary slot (singleblocks have a circuit slot, buses/hatches a circuit-capable inventory), so the slot check skips it.
// Verdicts per recipe: ok | warn (fits only a multiblock hatch although a singleblock exists, or the type is unknown) | error (fits nothing).

export const V = [8, 32, 128, 512, 2048, 8192, 32768, 131072, 524288, 2097152, 8388608, 33554432, 134217728, 536870912, 2147483647];
export const STACK = 64;
export const MAX_TIER = V.length - 1;

/** Lowest tier whose voltage covers the EU/t (tier 0 = ULV). */
export const tierOfEut = (eut) => {
  const e = Math.abs(Number(eut) || 0);
  for (let t = 0; t <= MAX_TIER; t++) if (V[t] >= e) return t;
  return MAX_TIER;
};

const eutOf = (json) => {
  const eu = json && json.tickInputs && json.tickInputs.eu;
  const c = Array.isArray(eu) && eu[0] ? eu[0].content : 0;
  return typeof c === 'number' ? c : 0;
};

/** A programmed-circuit ingredient, raw (the stand-in's form) or inside a sized/provider wrapper (GTM's serialization). */
export const isCircuit = (c) => !!c && typeof c === 'object' && (c.type === 'gtceu:circuit' || ((c.type === 'gtceu:sized' || c.type === 'gtceu:int_provider') && isCircuit(c.ingredient)));

/** Item stacks of one side: [{count}] without circuits (they have their own slot); fluid entries: [{amount, name}]. */
export const itemsOf = (list) => {
  const out = [];
  for (const e of list || []) {
    const c = e && e.content;
    if (!c || isCircuit(c)) continue;
    out.push({ count: Math.max(1, Number(c.count) || 1) });
  }
  return out;
};
/** How many circuit entries a side holds. GTM's builder counts them against the type's max item inputs. */
export const circuitsOf = (list) => (list || []).filter((e) => e && isCircuit(e.content)).length;
/**
 * Parses GTM's capacity warning ("Recipe <id> is trying to add more inputs than its recipe type can support, Max item inputs: N").
 * Returns {recipe, side, kind, max} or null when the line is not one.
 */
export function parseCapacityWarning(line) {
  if (!/more (inputs|outputs)\b.*\bthan (its recipe type|RecipeType) can support/i.test(line)) return null;
  const rec = /Recipe\s+([a-z0-9_.-]+:[a-z0-9_\/.-]+)/i.exec(line);
  const lim = /Max\s+(item|fluid)\s+(inputs|outputs)\s*:\s*(\d+)/i.exec(line);
  const side = /more (inputs|outputs)/i.exec(line)[1].toLowerCase();
  return { recipe: rec ? rec[1] : '', side, kind: lim ? lim[1].toLowerCase() : '', max: lim ? Number(lim[3]) : null };
}
export const fluidsOf = (list) => {
  const out = [];
  for (const e of list || []) {
    const c = e && e.content;
    if (!c) continue;
    const v = Array.isArray(c.value) && c.value[0] ? c.value[0] : {};
    out.push({ amount: Number(c.amount) || 0, name: v.fluid || v.tag || '?' });
  }
  return out;
};
export const slotsFor = (stacks) => stacks.reduce((n, s) => n + Math.ceil(s.count / STACK), 0);

/**
 * M8-04: entries per side beyond the recipe type's layout [itemsIn, itemsOut, fluidsIn, fluidsOut] (GTRecipeTypeUI lays out
 * exactly that many slots; the programmed circuit takes one of the item inputs, so EMI shows no slot for the last entry).
 * `recipes` = [{id, type, json}], `ioOf(typeId)` -> [4 numbers] | null (unknown layouts are skipped). Returns {id: reason}.
 */
export function layoutOverflows(recipes, ioOf) {
  const out = {};
  for (const r of recipes) {
    const io = ioOf(r.type);
    if (!io) continue;
    const j = r.json || {};
    const n = [(j.inputs && j.inputs.item || []).length, (j.outputs && j.outputs.item || []).length, (j.inputs && j.inputs.fluid || []).length, (j.outputs && j.outputs.fluid || []).length];
    const names = ['item inputs', 'item outputs', 'fluid inputs', 'fluid outputs'];
    const why = n.map((v, k) => (v > io[k] ? `${v} ${names[k]} > layout ${io[k]}` : '')).filter(Boolean);
    if (why.length) out[r.id] = `${r.type}: ${why.join('; ')}`;
  }
  return out;
}

/** Ratchet diff of two key sets: {fresh: keys not in the known list, stale: known keys no longer found}. */
export function ratchetDiff(current, known) {
  const cur = new Set(current);
  const kn = new Set(known);
  return { fresh: [...cur].filter((k) => !kn.has(k)).sort(), stale: [...kn].filter((k) => !cur.has(k)).sort() };
}

const atTier = (byTier, t) => {
  for (let i = Math.min(t, MAX_TIER); i >= 0; i--) if (byTier && byTier[i] !== undefined) return byTier[i];
  return undefined;
};

// A side (items or fluids in/out) against a capacity {slots, tanks, cap}; returns the failure texts.
function fitSide(side, kind, lim) {
  const out = [];
  if (kind === 'item') {
    const need = slotsFor(side);
    if (need > lim.slots) out.push(`${need} item slots needed, ${lim.slots} available`);
  } else {
    if (side.length > lim.tanks) out.push(`${side.length} fluids, ${lim.tanks} tanks`);
    for (const f of side) if (f.amount > lim.cap) out.push(`${f.name} ${f.amount} mB > ${lim.cap} mB tank`);
  }
  return out;
}

/** Problems of the recipe for one capacity set {iIn, iOut, fIn:{tanks,cap}, fOut:{tanks,cap}}. */
function fitAll(r, c) {
  return [
    ...fitSide(r.iIn, 'item', { slots: c.iIn }).map((m) => 'in ' + m),
    ...fitSide(r.iOut, 'item', { slots: c.iOut }).map((m) => 'out ' + m),
    ...fitSide(r.fIn, 'fluid', c.fIn).map((m) => 'in ' + m),
    ...fitSide(r.fOut, 'fluid', c.fOut).map((m) => 'out ' + m)
  ];
}

/**
 * Checks one recipe ({type, json}) against the snapshot.
 * Snapshot: {types:{id:{io:[iIn,iOut,fIn,fOut]}}, singleblock:{type:{tier:{iIn,iOut,fIn:{tanks,cap},fOut:{tanks,cap}}}},
 *            multiblockTypes:[ids], hatch:{fluidIn:{tier:cap}, fluidOut, itemIn:{tier:slots}, itemOut}}
 * Returns {level, tier, reasons[]}.
 */
export function checkRecipe(recipe, snap) {
  const json = recipe.json || {};
  const t = tierOfEut(eutOf(json));
  const type = snap.types[recipe.type];
  if (!type) return { level: 'warn', tier: t, reasons: ['recipe type not in the capacity snapshot (not checked)'] };
  const r = {
    iIn: itemsOf(json.inputs && json.inputs.item), iOut: itemsOf(json.outputs && json.outputs.item),
    fIn: fluidsOf(json.inputs && json.inputs.fluid), fOut: fluidsOf(json.outputs && json.outputs.fluid)
  };
  const [mi, mo, mfi, mfo] = type.io;
  const count = [];
  const circuits = circuitsOf(json.inputs && json.inputs.item);
  if (r.iIn.length + circuits > mi) count.push(`${r.iIn.length + circuits} item inputs${circuits ? ` (${circuits} circuit)` : ''} > type max ${mi}`);
  if (r.iOut.length > mo) count.push(`${r.iOut.length} item outputs > type max ${mo}`);
  if (r.fIn.length > mfi) count.push(`${r.fIn.length} fluid inputs > type max ${mfi}`);
  if (r.fOut.length > mfo) count.push(`${r.fOut.length} fluid outputs > type max ${mfo}`);
  if (count.length) return { level: 'error', tier: t, reasons: count };

  const sbTiers = Object.keys(snap.singleblock[recipe.type] || {}).map(Number).sort((a, b) => a - b);
  const sbTier = sbTiers.find((x) => x >= t);
  const sb = sbTier === undefined ? null : fitAll(r, snap.singleblock[recipe.type][sbTier]);
  let mb = null;
  if (snap.multiblockTypes.includes(recipe.type)) {
    const ht = Math.min(t + 1, MAX_TIER);
    const h = snap.hatch;
    mb = fitAll(r, {
      iIn: Infinity, iOut: Infinity,
      fIn: { tanks: Infinity, cap: atTier(h.fluidIn, ht) ?? 0 }, fOut: { tanks: Infinity, cap: atTier(h.fluidOut, ht) ?? 0 }
    });
  }
  if (sb === null && mb === null) return { level: 'warn', tier: t, reasons: ['no machine of this type at or above the recipe tier (not checked)'] };
  if (sb && sb.length === 0) return { level: 'ok', tier: t, reasons: [] };
  if (mb && mb.length === 0) return sb === null ? { level: 'ok', tier: t, reasons: [] } : { level: 'warn', tier: t, reasons: ['singleblock: ' + sb.join('; ')] };
  return { level: 'error', tier: t, reasons: [...(sb ? ['singleblock T' + sbTier + ': ' + sb.join('; ')] : []), ...(mb ? ['multiblock hatches T' + Math.min(t + 1, MAX_TIER) + ': ' + mb.join('; ')] : [])] };
}

const maxBy = (arr, f) => arr.reduce((a, x) => Math.max(a, f(x)), 0);
const cap = (m, kind, io) => (m.cap || []).filter((c) => c[0] === kind && c[1] === io);

/** Builds the snapshot from a dump's machines.json (format gg-machines-1 with the capacity additions). */
export function buildSnapshot(machines) {
  const types = {};
  for (const rt of machines.recipeTypes) if (rt.io) types[rt.id] = { io: rt.io };
  const singleblock = {};
  const mbTypes = new Set();
  const hatch = { fluidIn: {}, fluidOut: {}, itemIn: {}, itemOut: {} };
  const up = (o, t, v) => { o[t] = Math.max(o[t] || 0, v); };
  for (const m of machines.machines) {
    if (m.mb) { for (const ty of m.types) mbTypes.add(ty); continue; }
    if (!m.cap) continue;
    const fi = cap(m, 'f', 'IN'), fo = cap(m, 'f', 'OUT'), ii = cap(m, 'i', 'IN'), io = cap(m, 'i', 'OUT');
    if (m.types.length) {
      for (const ty of m.types) {
        if (!types[ty]) continue;
        (singleblock[ty] ||= {})[m.tier] = {
          iIn: maxBy(ii, (c) => c[2]), iOut: maxBy(io, (c) => c[2]),
          fIn: { tanks: maxBy(fi, (c) => c[2]), cap: maxBy(fi, (c) => c[3]) }, fOut: { tanks: maxBy(fo, (c) => c[2]), cap: maxBy(fo, (c) => c[3]) }
        };
      }
      continue;
    }
    if (!/^gtceu:[a-z]+_(input|output)_(bus|hatch|hatch_4x|hatch_9x)$|^gtceu:[a-z]+_dual_(input|output)_hatch$/.test(m.id)) continue;
    if (/_(input|output)_bus$/.test(m.id)) up(/_input_/.test(m.id) ? hatch.itemIn : hatch.itemOut, m.tier, maxBy(ii.concat(io), (c) => c[2] * (c[3] || 1)));
    else up(/_input_/.test(m.id) ? hatch.fluidIn : hatch.fluidOut, m.tier, maxBy(fi.concat(fo), (c) => c[3]));
    if (/_dual_/.test(m.id)) up(/_input_/.test(m.id) ? hatch.itemIn : hatch.itemOut, m.tier, maxBy(ii.concat(io).filter((c) => c[2] > 1), (c) => c[2]));
  }
  return { types, singleblock, multiblockTypes: [...mbTypes].sort(), hatch };
}
