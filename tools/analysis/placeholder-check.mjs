// Placeholder check (mega audit #202 M2-04): no live recipe makes a UEV+ item from an LV-grade input.
//
//   node tools/analysis/placeholder-check.mjs --dump <dir> [--json out.json]
//
// GTM 7.5.3 fills the tiers above UHV with stand-in recipes made of the LV materials (lead and tin wire, iron plate, red alloy
// cable, a wooden chest): a UEV battery buffer from a lead wire and a chest. Every item of tier UEV and above (an id
// `gtceu:` or `grindless:` that starts with uev_, uiv_, uxv_, opv_ or max_) must be made from its own tier's parts.
// A recipe is flagged when its primary output (GT recipes: the first item output; crafting: the result) is such an item and one of
// its consumed inputs is LV-grade (LV_GRADE below). Exit code: 0 none, 1 any, 2 bad arguments.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const HIGH_TIER = /^(gtceu|grindless):(uev|uiv|uxv|opv|max)_[a-z0-9_]+$/;
// the materials of GTM's placeholders: an item of the material (gtceu:<m>_<form>, minecraft:<m>_<form>), its forge tag, or a wooden chest
export const LV_MATERIALS = ['lead', 'iron', 'tin', 'red_alloy', 'bronze', 'copper', 'wrought_iron'];
const MAT = LV_MATERIALS.join('|');
export const LV_GRADE = [
  new RegExp(`^(gtceu|minecraft):(${MAT})_[a-z0-9_]+$`),
  new RegExp(`^#forge:[a-z_]+/(${MAT})$`),
  /^minecraft:chest$/,
  /^#forge:chests(\/wooden)?$/,
  /^#c:(wooden_)?chests$/,
];

export const isLvGrade = (id) => LV_GRADE.some((re) => re.test(id));

function idsOf(x) {
  if (!x || typeof x !== 'object') return typeof x === 'string' ? [x] : [];
  if (Array.isArray(x)) return x.flatMap(idsOf);
  if (x.ingredient !== undefined) return idsOf(x.ingredient);
  if (x.value !== undefined) return idsOf(x.value);
  if (typeof x.item === 'string') return [x.item];
  if (typeof x.tag === 'string') return ['#' + x.tag];
  return [];
}

function consumed(e) {
  if (e.chance === undefined || e.chance === null) return true;
  const max = e.maxChance === undefined || e.maxChance === null ? 10000 : e.maxChance;
  return e.chance > 0 && e.chance === max;
}

/** The primary output id and the consumed input ids of a dump recipe json (GT or crafting); null when it has neither. */
export function shapeOf(json) {
  if (!json || typeof json !== 'object') return null;
  if (json.inputs && typeof json.inputs === 'object' && !Array.isArray(json.inputs)) {
    const o = json.outputs && json.outputs.item && json.outputs.item[0];
    const out = o ? idsOf(o.content)[0] : undefined;
    const ins = (json.inputs.item || []).filter(consumed).flatMap((e) => idsOf(e.content));
    return out ? { out, ins } : null;
  }
  const out = json.result ? idsOf(json.result)[0] || (typeof json.result === 'string' ? json.result : undefined) : undefined;
  if (!out) return null;
  if (json.key && typeof json.key === 'object') return { out, ins: Object.values(json.key).flatMap(idsOf) };
  if (Array.isArray(json.ingredients)) return { out, ins: json.ingredients.flatMap(idsOf) };
  return null;
}

/** [{id, out, lv: [inputs]}] for every recipe of `recipes` (iterable of {id, json}) that makes a UEV+ item from an LV-grade input. */
export function placeholderRows(recipes) {
  const rows = [];
  for (const r of recipes) {
    const s = shapeOf(r.json);
    if (!s || !HIGH_TIER.test(s.out)) continue;
    const lv = [...new Set(s.ins.filter(isLvGrade))];
    if (lv.length) rows.push({ id: r.id, out: s.out, lv });
  }
  return rows.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

async function main() {
  const argv = process.argv.slice(2);
  const arg = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
  const dir = arg('--dump');
  if (!dir) { console.error('usage: node tools/analysis/placeholder-check.mjs --dump <dir> [--json out.json]'); process.exitCode = 2; return; }
  const { loadDump } = await import('./lib/dump.mjs');
  const dump = loadDump(dir, { log: null });
  const rows = placeholderRows([...dump.recipes].map(([id, rec]) => ({ id, json: rec.json })));
  for (const r of rows) console.log(`${r.id} -> ${r.out}: ${r.lv.join(', ')}`);
  console.log(`placeholder check: ${rows.length} live recipe(s) make a UEV+ item from an LV-grade input`);
  if (arg('--json')) fs.writeFileSync(arg('--json'), JSON.stringify(rows, null, 2) + '\n');
  if (rows.length) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
