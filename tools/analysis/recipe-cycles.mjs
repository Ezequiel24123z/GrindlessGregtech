// Deadlock check: every multiblock controller our recipes make must be reachable from the pack's own recipes.
//   node tools/analysis/recipe-cycles.mjs [--pack <dir>] [--explain id,id] [--all]
// Static run (no game). Prints the unreachable controllers and the cycles behind them, root cycles first (a root cycle
// is blocked only from inside: break it by changing one research item or input to something made earlier).
// Exit 1 when a controller is unreachable. Rules and limits: lib/recipe_cycles.mjs; T0 runs it through test/recipe-cycles.test.mjs.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { staticDump } from './lib/kubejs_static.mjs';
import { deadlocks } from './lib/recipe_cycles.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_PACK = path.resolve(here, '..', '..', 'pack');
// grindless ids obtainable outside recipes (loot, drops, block events); none so far
export const ASSUMED = [];

export function packDeadlocks(pack = DEFAULT_PACK) {
  return deadlocks(staticDump(pack).dump, { assumed: ASSUMED });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
  const r = packDeadlocks(opt('--pack') || DEFAULT_PACK);
  const show = (x) => { for (const w of r.why(x)) console.log(`    ${x} <= ${w.recipe}${w.type ? ' [' + w.type + ' has no machine]' : ''}: needs ${w.missing.join(', ') || '-'}`); };
  if (opt('--explain')) { for (const x of opt('--explain').split(',')) show(x); process.exit(0); }
  console.log(`unreachable controllers: ${r.deadMachines.length}; unreachable tracked ids: ${r.dead.length}; cycles: ${r.cycles.length} (${r.cycles.filter((c) => c.root).length} root)`);
  const limit = args.includes('--all') ? Infinity : 12;
  for (const c of r.cycles.slice(0, limit)) {
    console.log(`  ${c.root ? 'ROOT' : 'downstream'} cycle (${c.members.length}): ${c.members.length > 12 ? c.members.slice(0, 12).join(' ') + ' ...' : c.members.join(' ')}`);
    if (c.root && c.members.length <= 12) for (const x of c.members) show(x);
  }
  if (r.cycles.length > limit) console.log(`  ... ${r.cycles.length - limit} more (--all)`);
  if (!args.includes('--all') && r.deadMachines.length) console.log(`  controllers: ${r.deadMachines.slice(0, 20).join(' ')}${r.deadMachines.length > 20 ? ' ...' : ''}`);
  process.exit(r.deadMachines.length ? 1 : 0);
}
