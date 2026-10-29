// Deadlock check: every multiblock controller our recipes make must be reachable from the pack's own recipes.
//   node tools/analysis/recipe-cycles.mjs [--pack <dir>] [--explain id,id] [--all]
// Static run (no game). Prints the unreachable controllers and the cycles behind them, root cycles first (a root cycle
// is blocked only from inside: break it by changing one research item or input to something made earlier).
// Exit 1 when a controller is unreachable. Rules and limits: lib/recipe_cycles.mjs; T0 runs it through test/recipe-cycles.test.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { staticDump } from './lib/kubejs_static.mjs';
import { loadDump } from './lib/dump.mjs';
import { bridgeFromDump, deadlocks } from './lib/recipe_cycles.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_PACK = path.resolve(here, '..', '..', 'pack');
// grindless ids obtainable outside recipes (loot, drops, block events); none so far
export const ASSUMED = [];
export const BRIDGE_FILE = path.join(here, 'recipe_bridge.json');

export const loadBridge = (file = BRIDGE_FILE) => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null);

export function packDeadlocks(pack = DEFAULT_PACK, dump = null) {
  return deadlocks(dump || staticDump(pack).dump, { assumed: ASSUMED, bridge: loadBridge() });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
  if (opt('--bridge-from')) {
    const from = path.resolve(opt('--bridge-from'));
    const bridge = await bridgeFromDump(loadDump(from, { log: null }), path.join(here, 'tiers'));
    const doc = { _doc: 'Foreign ids only our recipes lead to (lib/recipe_cycles.mjs bridgeFromDump). Written by: node tools/analysis/recipe-cycles.mjs --bridge-from <dump> --write', ...bridge };
    const one = (o) => '{\n' + Object.entries(o).map(([k, v]) => ' ' + JSON.stringify(k) + ': ' + JSON.stringify(v)).join(',\n') + '\n }';
  const text = '{\n "_doc": ' + JSON.stringify(doc._doc) + ',\n "tags": ' + one(doc.tags) + ',\n "alt": ' + one(doc.alt) + '\n}\n';
    if (args.includes('--write')) fs.writeFileSync(BRIDGE_FILE, text);
    console.log('bridge: ' + Object.keys(doc.alt).length + ' ids, ' + Object.keys(doc.tags).length + ' tags' + (args.includes('--write') ? ' -> ' + BRIDGE_FILE : ''));
    process.exit(0);
  }
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
