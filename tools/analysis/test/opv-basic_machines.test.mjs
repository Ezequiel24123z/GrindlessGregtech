// OpV's basic machines (package OpV-A4, docs/eras/opv.md 'A4. Basic machines'), no game needed: tables/opv_basic_machines.json holds
// every machine GTM registers at OpV (tables/opv_ids.json gtm.machines), and opv/basic_machines.js makes each one an assembler row at
// VA[OpV] with the OpV hull, at least 2 OpV components, 2 OpV circuits, 2 chain strand cables, a chain lamina stack, 1152 mB soldering
// alloy and a circuit no same-set row shares.
// The OpV assembler running a 2^28 component row on a chain strand cable runs in the game: gg_test_opv_basic_machines.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const pack = path.join(root, 'pack');
const tables = path.join(pack, 'kubejs', 'data', 'grindless', 'tables');
const TABLE = JSON.parse(fs.readFileSync(path.join(tables, 'opv_basic_machines.json'), 'utf8'));
const IDS = JSON.parse(fs.readFileSync(path.join(tables, 'opv_ids.json'), 'utf8'));
const run = runPackScripts(pack);
const plain = (x) => JSON.parse(JSON.stringify(x, (k, v) => (typeof v === 'function' ? undefined : v)));
const OB = run.global.grindless.opvBasicMachines;
const docs = run.docs.recipes.recipes;
const find = (id) => docs.find((r) => r.i === id);
const HULL = 'gtceu:opv_machine_hull';
const CABLE = 'gtceu:chain_strand_single_cable';
const LAMINA = 'grindless:chain_lamina_stack';
const SOLDER = 'gtceu:soldering_alloy';
const V_UXV = 134217728;
// the stand-in's VA[13] is V[13]; in the game GTValues.VA[OpV] is 503,316,480 EU/t
const VA_OPV = 536870912;
const COMPONENT = /^gtceu:opv_(electric_motor|electric_pump|conveyor_module|electric_piston|robot_arm|emitter|sensor|field_generator)$/;
const LOWER = /^(gtceu|grindless):(ulv|lv|mv|hv|ev|iv|luv|zpm|uv|uhv|uev|uiv|uxv)_(electric_motor|electric_pump|conveyor_module|electric_piston|robot_arm|emitter|sensor|field_generator|fluid_regulator)$/;

const nameOf = (ing) => (ing.item ? ing.item : ing.tag ? '#' + ing.tag : JSON.stringify(ing));
/** {inputs: {id: count}, circuit, outputs: [id], eut} of a static GTM recipe. */
function io(rec) {
  const j = rec.j;
  const inputs = {};
  let circuit = null;
  for (const e of j.inputs.item) {
    if (e.content.type === 'gtceu:circuit') circuit = e.content.configuration;
    else inputs[nameOf(e.content.ingredient)] = (inputs[nameOf(e.content.ingredient)] || 0) + e.content.count;
  }
  const outputs = j.outputs.item.map((e) => nameOf(e.content.ingredient));
  return { inputs, circuit, outputs, eut: Math.max(...j.tickInputs.eu.map((e) => Number(e.content))),
    fluids: ((j.inputs && j.inputs.fluid) || []).map((e) => [e.content.value[0].fluid, e.content.amount]) };
}

test('the stand-in runs opv/basic_machines.js without errors, skips or clashes', () => {
  const errs = run.errors.filter((e) => /basic_machines/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(OB.skipped), []);
  assert.deepEqual(plain(OB.clashes), []);
});

test('the table holds exactly the machines GTM registers at OpV', () => {
  const machines = TABLE.machines.map((r) => 'gtceu:opv_' + r.machine);
  assert.equal(new Set(machines).size, machines.length, 'no machine twice');
  assert.deepEqual([...machines].sort(), [...IDS.gtm.machines].sort());
  assert.equal(machines.length, 37);
  assert.equal(TABLE.hull, HULL);
  assert.deepEqual(TABLE.circuits, { id: '#gtceu:circuits/opv', count: 2 });
  assert.deepEqual(TABLE.cable, { id: CABLE, count: 2 });
  assert.deepEqual(TABLE.lamina, { id: LAMINA, count: 1 });
  assert.deepEqual(TABLE.fluid, { id: SOLDER, amount: 1152 });
  assert.ok(IDS.foundation.chain_strand.includes(CABLE), 'the cable is F1\'s chain strand cable');
  assert.ok(IDS.foundation.items.includes(LAMINA), 'the lamina stack is F1\'s');
});

test('every row: at least 2 OpV components (C1\'s threshold), a circuit 1-32, field generator rows pending A3', () => {
  for (const r of TABLE.machines) {
    const total = r.components.reduce((s, c) => s + c.count, 0);
    assert.ok(total >= 2, r.machine + ' has ' + total);
    for (const c of r.components) assert.match(c.id, COMPONENT, r.machine);
    assert.ok(Number.isInteger(r.circuit) && r.circuit >= 1 && r.circuit <= 32, r.machine);
    const field = r.components.some((c) => c.id === 'gtceu:opv_field_generator');
    assert.equal(r.pending === 'A3', field, r.machine + ': pending A3 exactly when it takes a field generator');
  }
  assert.deepEqual(TABLE.machines.filter((r) => r.pending).map((r) => r.machine), ['polarizer']);
});

test('no two rows with the same circuit have one component set inside the other (GTM\'s lookup keys on types)', () => {
  const rows = TABLE.machines;
  const clashes = [];
  for (let i = 0; i < rows.length; i++) {
    for (let k = i + 1; k < rows.length; k++) {
      if (rows[i].circuit !== rows[k].circuit) continue;
      const a = new Set(rows[i].components.map((c) => c.id));
      const b = new Set(rows[k].components.map((c) => c.id));
      if ([...a].every((x) => b.has(x)) || [...b].every((x) => a.has(x))) clashes.push(rows[i].machine + '/' + rows[k].machine);
    }
  }
  assert.deepEqual(clashes, []);
  // the mixed rows (more than one component type) each own a circuit
  const mixed = rows.filter((r) => r.components.length > 1).map((r) => r.circuit);
  assert.equal(new Set(mixed).size, mixed.length);
  for (const c of mixed) assert.equal(rows.filter((r) => r.circuit === c).length, 1, 'circuit ' + c);
});

test('the recipes: assembler at VA[OpV], hull + components + 2 OpV circuits + 2 chain cables + lamina + solder, nothing below OpV', () => {
  assert.equal(OB.recipes.length, TABLE.machines.length);
  for (const r of TABLE.machines) {
    const id = 'grindless:assembler/opv_' + r.machine;
    const rec = find(id);
    assert.ok(rec, id);
    assert.equal(rec.t, 'gtceu:assembler', id);
    const x = io(rec);
    const want = { [HULL]: 1, '#gtceu:circuits/opv': 2, [CABLE]: 2, [LAMINA]: 1 };
    for (const c of r.components) want[c.id] = (want[c.id] || 0) + c.count;
    assert.deepEqual(x.inputs, want, id);
    assert.equal(x.circuit, r.circuit, id);
    assert.deepEqual(x.outputs, ['gtceu:opv_' + r.machine], id);
    assert.equal(x.eut, VA_OPV, id);
    assert.ok(x.eut > V_UXV && x.eut < 2 ** 31, id + ': above V[UXV], an int');
    assert.deepEqual(x.fluids, [[SOLDER, 1152]], id + ': one fluid (a single-block assembler takes one)');
    assert.ok(Object.keys(x.inputs).length + x.fluids.length >= 6, id + ': at least 6 distinct items and fluids (OpV complexFloor 10 at the depth cap)');
    for (const k of Object.keys(x.inputs)) assert.doesNotMatch(k, LOWER, id + ': a UXV-or-lower component');
    assert.ok(rec.j.duration === undefined || rec.j.duration === TABLE.duration, id);
  }
  assert.deepEqual(plain(OB.recipes).map((r) => r.recipeId).sort(), TABLE.machines.map((r) => 'grindless:assembler/opv_' + r.machine).sort());
});

test('each OpV machine has exactly one recipe of ours', () => {
  for (const id of IDS.gtm.machines) {
    const making = docs.filter((r) => JSON.stringify((r.j || {}).outputs || (r.j || {}).result || {}).includes('"' + id + '"'));
    assert.deepEqual(making.map((r) => r.i), ['grindless:assembler/' + id.replace('gtceu:', '')], id);
  }
});

test('the smoke test\'s band: opv_basic_machines at X 38080, 64 wide, its overlay script present', () => {
  const zones = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'test', 'zones.json'), 'utf8'));
  const list = Array.isArray(zones) ? zones : zones.zones;
  const z = list.find((x) => x.id === 'opv_basic_machines');
  assert.ok(z, 'the row');
  assert.deepEqual([z.x, z.z, z.y], [[38080, 38143], [0, 63], [98, 115]]);
  assert.ok(z.tests.includes('opv_basic_machines'));
  assert.ok(fs.existsSync(path.join(root, 'tools', 'test', 'overlay', 'kubejs', 'server_scripts', 'gg_test_opv_basic_machines.js')));
});
