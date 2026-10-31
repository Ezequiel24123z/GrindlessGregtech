// Static contracts of LuV's HTS magnet works (package LuV-A4), no game needed:
//   - data/grindless/tables/hts_magnet_works.json: one programmed circuit per recipe, the cold-test charge (1,000 mB of liquid helium),
//     decision 13's 144 mB of trinium for the HTS coil (GTM's own LuV coil takes 3,456 mB), whole EU/t and ticks, and the SMES cell's
//     output equal to the wireless network's LuV cell (tables/wireless_energy.json: its row's cellMadeBy names this machine);
//   - every id the table uses is GTM 7.5.3's (the native dump, when it is on this machine) or one LuV's design names
//     (docs/eras/luv.md: the shared registrations of package A1 and the wireless LuV cell);
//   - startup_scripts/grindless/luv/hts_magnet_works.js and server_scripts/grindless/luv/hts_magnet_works.js run in a sandbox with
//     recording stand-ins: the pattern is valid for lib/patterns.js (one controller in the front slice, at most 16 high, parts with
//     GTM's limits and the parallel hatch), the recipes come out as GTM recipes with the circuit and the charge not consumed, nothing
//     clashes in GTM's lookup, an unknown id skips its recipe loudly, the controller has its crafting recipe, and every recipe's EMI
//     line and the controller lines have en_us and es_es text.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const PACK = path.join(ROOT, 'pack');
const KUBEJS = path.join(PACK, 'kubejs');
const TABLE = JSON.parse(fs.readFileSync(path.join(KUBEJS, 'data', 'grindless', 'tables', 'hts_magnet_works.json'), 'utf8'));
// the LuV rows this package owns; later eras append rows (UIV-A8: seeded_gdbco_growth c5), whose ids their own tests prove
const LUV_NAMES = ['hts_coil', 'luv_smes_cell', 'coilgun_coil_casing', 'magnetic_bearing'];
const LUV_ROWS = TABLE.recipes.filter((r) => LUV_NAMES.includes(r.name));
const WIRELESS = JSON.parse(fs.readFileSync(path.join(KUBEJS, 'data', 'grindless', 'tables', 'wireless_energy.json'), 'utf8'));
const LUV_DOC = fs.readFileSync(path.join(ROOT, 'docs', 'eras', 'luv.md'), 'utf8');
const SCRIPTS = {
  patterns: path.join(KUBEJS, 'startup_scripts', 'grindless', 'lib', 'patterns.js'),
  parallel: path.join(KUBEJS, 'startup_scripts', 'grindless', 'lib', 'parallel_hatch.js'),
  startup: path.join(KUBEJS, 'startup_scripts', 'grindless', 'luv', 'hts_magnet_works.js'),
  server: path.join(KUBEJS, 'server_scripts', 'grindless', 'luv', 'hts_magnet_works.js'),
  lang: path.join(KUBEJS, 'client_scripts', 'grindless', 'luv_hts_magnet_works_lang.js'),
};
// a GTM 7.5.3 registry dump of the pack (gg_dump.js), when the session that made it left it on this machine
const DUMP_ITEMS = [
  process.env.GG_DUMP_ITEMS,
  'C:/Users/EzequielC/.copilot/session-state/52ba6327-e548-48e7-aa57-41c2373d41c2/files/test-runs/power-quests-1/results/server/kubejs-exported/items.json',
].filter(Boolean).find((p) => fs.existsSync(p));

// ---------------------------------------------------------------- the table

test('magnet works table: one circuit per recipe, the helium charge on all, decision 13\'s trinium, whole EU/t and ticks', () => {
  assert.deepEqual(TABLE.charge, { id: 'gtceu:liquid_helium', amount: 1000 });
  const names = TABLE.recipes.map((r) => r.name);
  assert.deepEqual(names, ['hts_coil', 'luv_smes_cell', 'coilgun_coil_casing', 'magnetic_bearing', 'seeded_gdbco_growth', 'strand_stator',
    'rebco_pancake', 'rebco_training', 'octupole_winding', 'octupole_trap_magnet', 'max_coil_winding', 'smes_toroid_winding']); // OpV-A1 appended c7-8 (opv.md line 8), OpV-B3a c9-10, MAX-A2 c11 (L9), MAX-W c13 (max.md L27, kept last)
  assert.deepEqual(TABLE.recipes.map((r) => r.circuit), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13]);
  for (const r of TABLE.recipes) {
    assert.equal(r.charge, true, r.name + ' carries the cold-test charge');
    assert.ok(Number.isInteger(r.eut) && r.eut > 0 && Number.isInteger(r.duration) && r.duration > 0, r.name);
    assert.equal(r.itemsOut.length, 1, r.name + ': one product');
  }
  const coil = TABLE.recipes[0];
  assert.deepEqual(coil.fluidsIn.find((f) => f.id === 'gtceu:trinium'), { id: 'gtceu:trinium', amount: 144 }, 'decision 13: 144 mB of trinium');
  assert.equal(3456 / 144, 24, 'a twenty-fourth of GTM\'s superconducting_coil_luv');
  assert.deepEqual(coil.itemsOut, [{ id: 'gtceu:superconducting_coil', count: 1 }]);
  // the LuV ones at LuV's VA; the coilgun coil at IV's, the bearing at EV's (luv.md); UIV-A8's bulk GdBCO growth at LuV's, for hours; OpV-A1's and B3a's at UV's
  assert.deepEqual(TABLE.recipes.map((r) => [r.eut, r.duration]), [[30720, 400], [30720, 600], [7680, 200], [1920, 200], [30720, 4800], [1966080, 400],
    [1966080, 400], [1966080, 600], [1966080, 600], [1966080, 1200], [7864320, 600], [7864320, 600]]); // OpV-B3a's octupole rows, then MAX-W, then MAX-A2
});

test('magnet works table: the SMES cell is the wireless network\'s LuV cell, made only here', () => {
  const luv = WIRELESS.tiers.find((r) => r.tier === 6);
  assert.ok(luv, 'tables/wireless_energy.json has a LuV row (tier 6)');
  const smes = TABLE.recipes.find((r) => r.name === 'luv_smes_cell');
  assert.equal(smes.itemsOut[0].id, luv.cell);
  assert.equal(luv.cell, 'grindless:luv_smes_cell');
  assert.equal(luv.cellMadeBy, 'gtceu:hts_magnet_works');
  // the table's rule: six of the tier's reference battery (gtceu:luv_vanadium_battery, 163,840,000 EU)
  assert.equal(luv.capacity, 6 * 163840000);
});

test('magnet works table: every id is GTM\'s or one LuV\'s design names', () => {
  const items = new Set();
  const fluids = new Set([TABLE.charge.id]);
  for (const r of LUV_ROWS) {
    [...r.itemsIn, ...r.itemsOut].forEach((x) => items.add(x.id));
    r.fluidsIn.forEach((x) => fluids.add(x.id));
  }
  const ids = new Set([...items, ...fluids]);
  const ours = [...ids].filter((id) => id.startsWith('grindless:'));
  for (const id of ours) assert.ok(LUV_DOC.includes('`' + id + '`'), id + ' is named in docs/eras/luv.md');
  // UXV-A8 appends c6 strand_stator, registered by the UXV foundation; OpV-A1 appends c7-8, registered by opv/components.js
  const uivStartup = ['uiv', 'uxv', 'opv', 'max'].flatMap((d) => fs.readdirSync(path.join(KUBEJS, 'startup_scripts', 'grindless', d)).map((f) => fs.readFileSync(path.join(KUBEJS, 'startup_scripts', 'grindless', d, f), 'utf8'))).join('\n');
  for (const r of TABLE.recipes.filter((x) => !LUV_NAMES.includes(x.name))) {
    assert.match(r._why || '', /^(U[IX][VX]|OpV|MAX)-([AB]\d+|W)/, r.name + ': a later row says which package added it');
    [...r.itemsIn, ...r.itemsOut].filter((x) => x.id.startsWith('grindless:')).forEach((x) => assert.match(uivStartup, new RegExp('\\b' + x.id.slice(10) + '\\b'), x.id + ' is registered by a UIV startup script'));
  }
  // A1's tetrataenite: a GT material with GENERATE_ROD (luv/foundation.js), so GTM names its rod gtceu:tetrataenite_rod
  const a1 = [...ids].filter((x) => /^gtceu:tetrataenite_/.test(x));
  assert.deepEqual(a1, ['gtceu:tetrataenite_rod']);
  const foundation = fs.readFileSync(path.join(KUBEJS, 'startup_scripts', 'grindless', 'luv', 'foundation.js'), 'utf8');
  assert.match(foundation, /event\.create\(LUVF\.materials\.tetrataenite\)[\s\S]*?GENERATE_ROD/, 'A1 gives tetrataenite its rod');
  if (!DUMP_ITEMS) return;
  // GTM 7.5.3's own ids, exactly as the native dump lists them (a fluid by its fluid id, not its bucket): the table's and the pattern's
  const dump = JSON.parse(fs.readFileSync(DUMP_ITEMS, 'utf8'));
  const knownItems = new Set(dump.items);
  const knownFluids = new Set(dump.fluids);
  const pattern = ['gtceu:frostproof_machine_casing', 'gtceu:stainless_steel_gearbox', 'gtceu:ptfe_pipe_casing', 'gtceu:laminated_glass',
    'gtceu:tungsten_steel_frame', 'gtceu:luv_machine_hull', 'gtceu:luv_electric_motor', 'gtceu:luv_sensor', 'gtceu:superconducting_coil'];
  const startup = fs.readFileSync(SCRIPTS.startup, 'utf8');
  for (const id of pattern.slice(0, 4)) assert.ok(startup.includes("'" + id + "'"), id + ' is the pattern\'s');
  assert.ok(startup.includes("const FRAME = 'tungsten_steel'"));
  const missingItems = [...items, ...pattern].filter((id) => id.startsWith('gtceu:') && !a1.includes(id) && !knownItems.has(id));
  const missingFluids = [...fluids].filter((id) => !knownFluids.has(id));
  assert.deepEqual(missingItems, [], 'GTM 7.5.3 item ids absent from the dump ' + DUMP_ITEMS);
  assert.deepEqual(missingFluids, [], 'GTM 7.5.3 fluid ids absent from the dump ' + DUMP_ITEMS);
});

test('magnet works in EMI: each product is hidden exactly while an input of its only recipe is (A1\'s contract, LuV-A4\'s part)', () => {
  const hidden = JSON.parse(fs.readFileSync(path.join(KUBEJS, 'data', 'grindless', 'tables', 'hidden_until.json'), 'utf8')).groups;
  const rules = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'analysis', 'tiers', 'obtain.json'), 'utf8')).obtain.classes;
  const hides = (item) => hidden.some((g) => (g.items || []).includes(item));
  const group = (m) => hidden.find((g) => g.material === m);
  // the SMES cell: its recipe takes A3's ITBTC coated conductor. When A3 lands (its group goes), this group and its rule go too.
  assert.equal(hides('grindless:luv_smes_cell'), hides('grindless:itbtc_coated_conductor'),
    'grindless:luv_smes_cell must be hidden exactly while grindless:itbtc_coated_conductor is (delete the LuV-A4 rule in obtain.json and its group)');
  const smesRule = rules.find((r) => (r.materials || []).includes('grindless:luv_smes_cell'));
  assert.equal(!!smesRule, !!group('grindless:luv_smes_cell'), 'the SMES cell\'s rule and group go together');
  if (smesRule) assert.equal(group('grindless:luv_smes_cell').reason, smesRule.reason);
  // the bearing: its recipe takes B5's tetrataenite rods. Tetrataenite is only out of EMI's index until the belt (keepRecipes), so the
  // bearing and its recipe show now (B4's ring needs the bearing in EMI), with a page that names the route
  assert.equal(hides('grindless:magnetic_bearing'), false);
  const tetrataenite = group('tetrataenite');
  if (tetrataenite) {
    assert.equal(tetrataenite.keepRecipes, true, 'tetrataenite is only index-hidden, or EMI drops the bearing\'s only recipe');
    const rule = rules.find((r) => (r.materials || []).includes('tetrataenite'));
    // UXV-A8 deletes the rule; the integrator regenerates hidden_until.json and the group goes
    if (rule) assert.equal(rule.keepRecipes, true, 'the obtain rule says keepRecipes too, so a regenerated table keeps it');
  }
  const bearingPage = JSON.parse(fs.readFileSync(path.join(KUBEJS, 'assets', 'emi', 'recipe', 'additions', 'grindless', 'magnetic_bearing.json'), 'utf8'));
  assert.deepEqual(bearingPage.stacks, ['item:grindless:magnetic_bearing']);
  // the coilgun coil casings: every input is shown, so they are, with a page that says what they are kept for (B9's coilgun)
  assert.equal(hides('grindless:coilgun_coil_casing'), false);
  const page = JSON.parse(fs.readFileSync(path.join(KUBEJS, 'assets', 'emi', 'recipe', 'additions', 'grindless', 'coilgun_coil_casing.json'), 'utf8'));
  assert.deepEqual(page.stacks, ['item:grindless:coilgun_coil_casing']);
  // nothing the magnet works uses or makes is hidden except through those inputs
  const allowed = new Set(['grindless:itbtc_coated_conductor', 'gtceu:tetrataenite_rod', 'grindless:luv_smes_cell', 'grindless:magnetic_bearing',
    // UXV-A8's strand_stator: pasta strand wire is held by another package's rule; its own ids stay hidden until the integrator regenerates hidden_until.json
    'gtceu:pasta_strand_single_wire', 'grindless:tetrataenite_lamination', 'grindless:strand_stator',
    // OpV-A1's REBCO pancake rows: likewise until the integrator regenerates hidden_until.json
    'gtceu:chain_strand_single_wire', 'grindless:rebco_pancake', 'grindless:potted_rebco_pancake', 'grindless:trained_rebco_pancake',
    // MAX-W's SMES toroid winding: its tape is hidden until the integrator regenerates hidden_until.json
    'grindless:thick_rebco_tape', 'grindless:smes_toroid_winding',
    // MAX-A2's max_coil_winding: its inputs are hidden until the integrator regenerates hidden_until.json
    'grindless:cmc_coil_former', 'grindless:max_coil_winding', 'grindless:stabilised_rebco_tape', 'gtceu:horizon_strand_single_wire']);
  for (const r of TABLE.recipes) for (const x of [...r.itemsIn, ...r.itemsOut]) if (!allowed.has(x.id)) assert.equal(hides(x.id), false, x.id);
});

// ---------------------------------------------------------------- the scripts, in a sandbox

// what the sandbox returns, as this realm's plain objects (deepStrictEqual compares prototypes across realms)
const plain = (x) => JSON.parse(JSON.stringify(x));

function recorder() {
  const calls = [];
  const builder = (kind, id) => {
    const r = { kind, id, items: [], fluids: [], notConsumed: [], out: [], data: {}, circuit: null, eut: 0, duration: 0 };
    calls.push(r);
    const b = {
      itemInputs: (x) => { r.items.push(String(x)); return b; },
      circuit: (n) => { r.circuit = n; return b; },
      inputFluids: (f) => { r.fluids.push(f); return b; },
      notConsumableFluid: (f) => { r.notConsumed.push(f); return b; },
      itemOutputs: (x) => { r.out.push(String(x)); return b; },
      addDataString: (k, v) => { r.data[k] = v; return b; },
      EUt: (n) => { r.eut = n; return b; },
      duration: (n) => { r.duration = n; return b; },
      id: (x) => { r.recipeId = x; return b; },
    };
    return b;
  };
  return { calls, builder };
}

function chain(log, name) {
  return new Proxy(function () {}, {
    get: (_, p) => (p === 'then' ? undefined : (...a) => { log.push([name, String(p), a]); return chain(log, name); }),
    apply: (_, __, a) => { log.push([name, '()', a]); return chain(log, name); },
  });
}

function sandboxRun({ missing = [] } = {}) {
  const handlers = { startup: {}, recipes: [] };
  const errors = [];
  const infos = [];
  const machineLog = [];
  const rec = recorder();
  const sandbox = {
    console: { info: (m) => infos.push(String(m)), log() {}, warn() {}, error: (m) => errors.push(String(m)) },
    JSON, Math, Number, String, Error, Array, Object,
    GTCEuStartupEvents: { registry: (key, fn) => { handlers.startup[key] = fn; } },
    ServerEvents: { recipes: (fn) => handlers.recipes.push(fn) },
    Text: { translate: (k) => ({ key: k }) },
    Item: { exists: (id) => !missing.includes(id) },
    Fluid: { exists: (id) => !missing.includes(id), of: (id, amount) => ({ id, amount }) },
    GTRecipeTypes: { get: (t) => ({ id: t, addDataInfo() {} }) },
    GuiTextures: {}, FillDirection: {}, GTSoundEntries: {}, RotationState: {}, GTBlocks: {},
    Predicates: {}, PartAbility: {}, FactoryBlockPattern: {}, GTRecipeModifiers: {}, ModifierFunction: {},
  };
  sandbox.global = sandbox;
  sandbox.grindless = { readJsonTable: (p) => JSON.parse(fs.readFileSync(path.join(PACK, p), 'utf8')) };
  vm.createContext(sandbox);
  for (const f of [SCRIPTS.patterns, SCRIPTS.parallel, SCRIPTS.startup, SCRIPTS.server]) {
    vm.runInContext(fs.readFileSync(f, 'utf8'), sandbox, { filename: path.basename(f) });
  }
  handlers.startup['gtceu:recipe_type']({ create: (name) => chain(machineLog, 'type:' + name) });
  handlers.startup['gtceu:machine']({ create: (name, kind) => chain(machineLog, 'machine:' + name + ':' + kind) });
  const shaped = [];
  for (const fn of handlers.recipes) {
    fn({ recipes: { gtceu: {
      magnet_winding: (id) => rec.builder('magnet_winding', id),
      assembly_line: (id) => {
        const r = { id, items: [], fluids: [], out: [] };
        const b = {
          itemInputs: (...a) => { r.items.push(...a); return b; },
          inputFluids: (...a) => { r.fluids.push(...a); return b; },
          itemOutputs: (...a) => { r.out.push(...a); return b; },
          EUt: (v) => { r.eut = v; return b; },
          duration: (v) => { r.duration = v; return b; },
        };
        shaped.push(r);
        return b;
      },
    } } });
  }
  return { G: sandbox.grindless, errors, infos, machineLog, recipes: rec.calls, shaped };
}

test('magnet works startup: the pattern is valid, its parts have GTM\'s limits and the parallel hatch, the type and machine register', () => {
  const { G, machineLog, errors } = sandboxRun();
  assert.deepEqual(errors, []);
  const MW = G.htsMagnetWorks;
  assert.equal(MW.machine, 'gtceu:hts_magnet_works');
  assert.equal(MW.recipeType, 'gtceu:magnet_winding');
  const s = G.structures['gtceu:hts_magnet_works'];
  assert.ok(s, 'Pat.register recorded the structure');
  assert.equal(s.slices.length, 5);
  assert.ok(s.slices[0].length <= 16, 'at most 16 high');
  assert.ok(s.slices.every((rows) => rows.every((r) => r.length === 11)), '11 wide');
  const front = s.slices[s.slices.length - 1].join('');
  assert.equal((front.match(/S/g) || []).length, 1, 'the controller in the front slice');
  const parts = plain(s.symbols.X.options.filter((o) => o.kind === 'part'));
  assert.deepEqual(parts.map((p) => [p.ability, p.limits]), [
    ['energy_input', { min: 1, max: 2 }], ['input_bus', { min: 1, max: 3 }], ['input_hatch', { min: 1, max: 3 }],
    ['output_bus', { min: 1, max: 2 }], ['parallel_hatch', { max: 1, preview: 1 }],
  ]);
  // enough part cells for every part's maximum at once (2 + 3 + 3 + 2 + 1)
  const cells = s.slices.reduce((n, rows) => n + rows.join('').split('').filter((c) => c === 'X').length, 0);
  assert.ok(cells >= 11, cells + ' part cells');
  assert.deepEqual(plain(s.symbols.F.blocks), ['gtceu:frostproof_machine_casing']);
  assert.ok(G.parallelHatch.machines.includes('gtceu:hts_magnet_works'));
  assert.ok(machineLog.some(([n, m, a]) => n === 'type:magnet_winding' && m === 'setMaxIOSize' && a.join() === '6,1,3,0'));
  assert.ok(machineLog.some(([n, m, a]) => n === 'machine:hts_magnet_works:multiblock' && m === 'workableCasingModel' &&
    a[1] === 'grindless:block/multiblock/hts_magnet_works'));
  assert.ok(fs.existsSync(path.join(KUBEJS, 'assets', 'grindless', 'textures', 'block', 'multiblock', 'hts_magnet_works', 'overlay_front.png')));
});

test('magnet works recipes: GTM recipes with the circuit, the helium not consumed, no clash in the lookup, and the controller', () => {
  const { G, recipes, shaped, errors } = sandboxRun();
  assert.deepEqual(errors, []);
  const MW = plain({ skipped: G.htsMagnetWorks.skipped, clashes: G.htsMagnetWorks.clashes, recipes: G.htsMagnetWorks.recipes });
  assert.deepEqual(MW.skipped, []);
  assert.deepEqual(MW.clashes, []);
  assert.deepEqual(recipes.map((r) => r.id), TABLE.recipes.map((r) => 'grindless:' + r.name));
  assert.deepEqual(MW.recipes.map((r) => r.recipeId), TABLE.recipes.map((r) => 'grindless:magnet_winding/' + r.name),
    'GTM puts the type in front of the id');
  recipes.forEach((r, i) => {
    const t = TABLE.recipes[i];
    assert.equal(r.circuit, t.circuit);
    assert.deepEqual(plain(r.notConsumed), [{ id: 'gtceu:liquid_helium', amount: 1000 }], r.id + ': the charge, not consumed');
    assert.deepEqual(r.items, t.itemsIn.map((x) => x.count + 'x ' + x.id));
    assert.deepEqual(plain(r.fluids), t.fluidsIn);
    assert.deepEqual(r.out, t.itemsOut.map((x) => x.count + 'x ' + x.id));
    assert.deepEqual(plain(r.data), { grindless_magnet_winding: t.name });
    assert.deepEqual([r.eut, r.duration], [t.eut, t.duration]);
  });
  // GTM's lookup: one recipe per ingredient path; no recipe's keys may be a subset of another's
  const keys = TABLE.recipes.map((r) => new Set([...r.itemsIn.map((x) => 'i:' + x.id), ...r.fluidsIn.map((x) => 'f:' + x.id), 'f:gtceu:liquid_helium', 'c:' + r.circuit]));
  keys.forEach((a, i) => keys.forEach((b, j) => { if (i !== j) assert.ok(![...a].every((k) => b.has(k)), TABLE.recipes[i].name + ' within ' + TABLE.recipes[j].name); }));
  assert.equal(shaped.length, 1);
  assert.deepEqual(shaped[0].out, ['gtceu:hts_magnet_works']);
  assert.equal(shaped[0].id, 'grindless:hts_magnet_works', 'GTM puts the type in front: grindless:assembly_line/hts_magnet_works');
  assert.deepEqual(shaped[0].items, ['gtceu:luv_machine_hull', 'gtceu:luv_sensor', '2x gtceu:luv_electric_motor', '4x #gtceu:circuits/luv',
    '2x grindless:platinum_electrode', '2x grindless:sintered_regolith']);
  assert.deepEqual(plain(shaped[0].fluids), [{ id: 'gtceu:soldering_alloy', amount: 576 }, { id: 'gtceu:lubricant', amount: 500 }]);
  assert.deepEqual([shaped[0].eut, shaped[0].duration], [30720, 600]);
});

test('magnet works recipes: an id the game lacks skips only its recipe, loudly (A1\'s items before they merge)', () => {
  const { G, recipes, errors } = sandboxRun({ missing: ['gtceu:tetrataenite_rod'] });
  assert.deepEqual(recipes.map((r) => r.id), ['grindless:hts_coil', 'grindless:luv_smes_cell', 'grindless:coilgun_coil_casing', 'grindless:seeded_gdbco_growth', 'grindless:strand_stator',
    'grindless:rebco_pancake', 'grindless:rebco_training', 'grindless:octupole_winding', 'grindless:octupole_trap_magnet', 'grindless:max_coil_winding', 'grindless:smes_toroid_winding']); // OpV-A1's c7-8, OpV-B3a's c9-10, MAX-A2's c11, MAX-W's c13
  assert.deepEqual(plain(G.htsMagnetWorks.skipped), [{ name: 'magnetic_bearing', reason: 'unknown id(s): gtceu:tetrataenite_rod' }]);
  assert.ok(errors.some((e) => /skipped magnetic_bearing/.test(e)));
});

test('magnet works text: the machine, the type, every recipe\'s EMI line and the charge lines in en_us and es_es', () => {
  const lang = {};
  const sandbox = { ClientEvents: { lang: (l, fn) => fn({ add: (ns, k, v) => { (lang[l] = lang[l] || {})[k] = v; } }) } };
  vm.runInNewContext(fs.readFileSync(SCRIPTS.lang, 'utf8'), sandbox, { filename: 'luv_hts_magnet_works_lang.js' });
  // later rows' EMI lines live in their package's lang script (UIV-A8: uiv_uiv_components_lang.js)
  vm.runInNewContext(fs.readFileSync(path.join(KUBEJS, 'client_scripts', 'grindless', 'uiv_uiv_components_lang.js'), 'utf8'), sandbox, { filename: 'uiv_uiv_components_lang.js' });
    // UXV-A8: uxv_uxv_parts_lang.js
    vm.runInNewContext(fs.readFileSync(path.join(KUBEJS, 'client_scripts', 'grindless', 'uxv_uxv_parts_lang.js'), 'utf8'), sandbox, { filename: 'uxv_uxv_parts_lang.js' });
    // OpV-A1: opv_components_lang.js
    vm.runInNewContext(fs.readFileSync(path.join(KUBEJS, 'client_scripts', 'grindless', 'opv_components_lang.js'), 'utf8'), sandbox, { filename: 'opv_components_lang.js' });
    vm.runInNewContext(fs.readFileSync(path.join(KUBEJS, 'client_scripts', 'grindless', 'opv_antimatter_lang.js'), 'utf8'), sandbox, { filename: 'opv_antimatter_lang.js' });
    // MAX-W: max_wireless_lang.js
    vm.runInNewContext(fs.readFileSync(path.join(KUBEJS, 'client_scripts', 'grindless', 'max_wireless_lang.js'), 'utf8'), sandbox, { filename: 'max_wireless_lang.js' });
    vm.runInNewContext(fs.readFileSync(path.join(KUBEJS, 'client_scripts', 'grindless', 'max_components_lang.js'), 'utf8'), sandbox, { filename: 'max_components_lang.js' }); // MAX-A2
    const keys = ['block.gtceu.hts_magnet_works', 'gtceu.magnet_winding', 'grindless.machine.hts_magnet_works.charge.ok',
    'grindless.machine.hts_magnet_works.charge.low', ...[0].map((i) => 'grindless.machine.hts_magnet_works.tooltip.' + i),
    ...TABLE.recipes.map((r) => 'gtceu.recipe.grindless_magnet_winding.' + r.name)];
  for (const l of ['en_us', 'es_es']) for (const k of keys) assert.ok(lang[l] && lang[l][k], l + ' ' + k);
  assert.deepEqual(Object.keys(lang.en_us).sort(), Object.keys(lang.es_es).sort());
  for (const l of ['en_us', 'es_es']) {
    for (const k of ['grindless.machine.hts_magnet_works.charge.ok', 'grindless.machine.hts_magnet_works.charge.low']) {
      assert.equal((lang[l][k].match(/%s/g) || []).length, 2, l + ' ' + k + ' takes held and needed');
    }
  }
});
