// OpV-B2 (docs/eras/opv.md, "B2. Census IV"; process lines 43 and 44): the older-machine rows that thaw the caged Ni chain, split Ni-64,
// make elements 124 and 126 and count them with the island nuclide in census IV, checked without Minecraft. T1 is proof reuse (UXV-A1's
// table-driven rows on the same unchanged loaders and machines): no native test.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const pack = path.join(root, 'pack');
const kube = path.join(pack, 'kubejs');
const tables = path.join(kube, 'data', 'grindless', 'tables');
const table = (name) => JSON.parse(fs.readFileSync(path.join(tables, name), 'utf8'));
const text = (...p) => fs.readFileSync(path.join(kube, ...p), 'utf8');

const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => x.id);
const inputs = (r) => ids(r.itemsIn).concat(ids(r.kept), ids(r.fluidsIn), ids(r.charge));
const outputs = (r) => ids(r.itemsOut).concat(ids(r.fluidsOut));
const rows = (file, type) => table(file).types[type].recipes;
const by = (rs, name) => {
  const r = rs.find((x) => x.name === name);
  assert.ok(r, name);
  return r;
};

const EB = rows('electron_beam.json', 'electron_beam_refining');
const CAL = rows('isotopes.json', 'calutron_separation');
const IRR = rows('superheavy.json', 'heavy_ion_irradiation');
const REC = rows('superheavy.json', 'recoil_separation');
const CHEM = rows('superheavy.json', 'superheavy_chemistry');
const HOT_TABLE = table('hot_cell.json');
const HOT = HOT_TABLE.recipes ?? HOT_TABLE;
const STARTUP = text('startup_scripts', 'grindless', 'opv', 'census_iv.js');
const LANG = text('client_scripts', 'grindless', 'opv_census_iv_lang.js');

// [file, type, row, circuit]: the contract's numbers (opv.md B2)
const MINE = [
  ['electron_beam.json', 'electron_beam_refining', 'ni_chain_thaw', 23],
  ['isotopes.json', 'calutron_separation', 'nickel_64', 11],
  ['superheavy.json', 'heavy_ion_irradiation', 'element_124', 11],
  ['superheavy.json', 'heavy_ion_irradiation', 'element_126', 13],
  ['superheavy.json', 'recoil_separation', 'element_124_recoil', 10],
  ['superheavy.json', 'recoil_separation', 'element_126_recoil', 11],
  ['superheavy.json', 'superheavy_chemistry', 'census_iv', 11]
];
const DATAKEY = {
  electron_beam_refining: 'grindless_electron_beam',
  calutron_separation: 'grindless_calutron_separation',
  heavy_ion_irradiation: 'grindless_heavy_ion_irradiation',
  recoil_separation: 'grindless_recoil_separation',
  superheavy_chemistry: 'grindless_superheavy_chemistry'
};
const SLOTS = {
  electron_beam_refining: ['uev', 'electron_beam.js'],
  calutron_separation: ['uev', 'isotopes.js'],
  heavy_ion_irradiation: ['uev', 'superheavy.js'],
  recoil_separation: ['uev', 'superheavy.js'],
  superheavy_chemistry: ['uev', 'superheavy.js']
};
const MATERIALS = { thawed_chain_nickel: 'dust', nickel_64: 'dust', element_124_recoil_gas: 'gas', element_126_recoil_gas: 'gas' };

function allTableRows() {
  const out = [];
  for (const f of fs.readdirSync(tables).filter((n) => n.endsWith('.json'))) {
    const walk = (node, where) => {
      if (Array.isArray(node)) node.forEach((x, i) => walk(x, `${where}[${i}]`));
      else if (node && typeof node === 'object') {
        if (Array.isArray(node.itemsOut) || Array.isArray(node.fluidsOut)) out.push([`${f}:${where}`, node]);
        for (const [k, v] of Object.entries(node)) if (k !== 'itemsOut' && k !== 'fluidsOut') walk(v, `${where}.${k}`);
      }
    };
    walk(JSON.parse(fs.readFileSync(path.join(tables, f), 'utf8')), '');
  }
  return out;
}
const tableProducers = (id) => allTableRows().filter(([, r]) => outputs(r).includes(id)).map(([w]) => w);
const tableConsumers = (id) => allTableRows().filter(([, r]) => inputs(r).includes(id)).map(([w]) => w);

function jsFiles(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...jsFiles(p));
    else if (e.name.endsWith('.js')) out.push(p);
  }
  return out;
}

const run = runPackScripts(pack);
const mineFile = (f) => /(^|[\\/])opv[\\/]census_iv\.js$|opv_census_iv_lang/.test(String(f));

test('the stand-in runs census_iv.js and its names without errors', () => {
  const errs = run.errors.filter((e) => mineFile(e.file));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
});

test('the rows sit on the contract\'s circuits, unique inside the type, and name the package', () => {
  for (const [file, type, name, circuit] of MINE) {
    const rs = rows(file, type);
    const r = by(rs, name);
    assert.equal(r.circuit, circuit, `${type}/${name}`);
    assert.match(String(r._why || r._ || ''), /^OpV-B2\b/, `${type}/${name}: _why names the package`);
    assert.equal(rs.filter((x) => x.circuit === circuit).length, 1, `${type}: circuit ${circuit} once`);
  }
});

test('every row fits its machine\'s slots (startup maxIO; the circuit takes an item slot) and stays at the machine\'s older EU/t', () => {
  const older = { electron_beam_refining: 1966080, calutron_separation: 1966080, heavy_ion_irradiation: 7864320, recoil_separation: 3932160, superheavy_chemistry: 3932160 };
  for (const [file, type, name] of MINE) {
    const src = text('startup_scripts', 'grindless', ...SLOTS[type]);
    const m = src.match(new RegExp(`type: '${type}'[\\s\\S]*?maxIO: \\{ itemsIn: (\\d+), itemsOut: (\\d+), fluidsIn: (\\d+), fluidsOut: (\\d+) \\}`));
    assert.ok(m, `${type}: maxIO`);
    const [a, b, c, d] = m.slice(1).map(Number);
    const r = by(rows(file, type), name);
    assert.ok(r.itemsIn.length + (r.kept || []).length + 1 <= a, `${type}/${name}: item inputs`);
    assert.ok(r.itemsOut.length <= b, `${type}/${name}: item outputs`);
    assert.ok((r.fluidsIn || []).length + (r.charge || []).length <= c, `${type}/${name}: fluid inputs`);
    assert.ok((r.fluidsOut || []).length <= d, `${type}/${name}: fluid outputs`);
    assert.equal(r.eut, older[type], `${type}/${name}: EU/t`);
    assert.ok(r.eut < 2 ** 31 && Number.isInteger(r.duration) && r.duration > 0, `${type}/${name}`);
  }
});

test('line 43: EB c23 thaws the caged Ni chain, the cage part returns; calutron c11 splits Ni-64 and leaves the rest in stock', () => {
  const thaw = by(EB, 'ni_chain_thaw');
  assert.deepEqual(thaw.itemsIn, [{ id: 'grindless:caged_ni_chain', count: 1 }]);
  assert.deepEqual(thaw.itemsOut, [{ id: 'gtceu:thawed_chain_nickel_dust', count: 4 }, { id: 'grindless:cage_part', count: 1 }]);
  assert.deepEqual(thaw.kept, []);
  const ni = by(CAL, 'nickel_64');
  assert.deepEqual(ni.itemsIn, [{ id: 'gtceu:thawed_chain_nickel_dust', count: 4 }]);
  assert.deepEqual(ni.itemsOut, [{ id: 'gtceu:nickel_64_dust', count: 1 }, { id: 'gtceu:nickel_dust', count: 3 }]);
  // the returned cage part is the same one the caging rows spend
  assert.ok(tableConsumers('grindless:cage_part').length > 0);
});

test('lines 43 and 44: the cyclotron fires the Ni-64 beam at Cm-248 (c11) and at a consumed Cf-249 wheel (c13), keeps the cavity and helium', () => {
  for (const [name, target, gas, rest] of [
    ['element_124', 'grindless:cm248_target', 'gtceu:element_124_recoil_gas', 'grindless:spent_actinide_target'],
    ['element_126', 'grindless:cf249_target_wheel', 'gtceu:element_126_recoil_gas', 'grindless:activated_target_wheel']
  ]) {
    const r = by(IRR, name);
    assert.deepEqual(ids(r.itemsIn), [target, 'gtceu:nickel_64_dust']);
    assert.deepEqual(ids(r.kept), ['grindless:nb3sn_srf_cavity']);
    assert.deepEqual(r.charge, [{ id: 'gtceu:helium', amount: 1000 }]);
    assert.deepEqual(r.itemsOut, [{ id: rest, count: 1 }]);
    assert.deepEqual(r.fluidsOut, [{ id: gas, amount: 1000 }]);
  }
  // the spent target goes to waste retrieval; the activated wheel goes back to the hot cell, which re-presses Cf-249
  assert.match(text('server_scripts', 'grindless', 'zpm', 'actinides.js'), /id: 'grindless:spent_actinide_target', count: 1/);
  assert.ok(inputs(by(HOT, 'target_wheel_return')).includes('grindless:activated_target_wheel'));
  assert.ok(outputs(by(HOT, 'target_wheel_return')).includes('grindless:target_wheel_blank'));
  assert.ok(tableProducers('grindless:cf249_target_wheel').some((w) => w.startsWith('hot_cell.json')));
});

test('recoil separator c10 and c11 catch elements 124 and 126; chemistry lab c11 counts them with the island nuclide in census IV', () => {
  for (const [name, gas, out] of [['element_124_recoil', 'gtceu:element_124_recoil_gas', 'grindless:element_124_recoil'], ['element_126_recoil', 'gtceu:element_126_recoil_gas', 'grindless:element_126_recoil']]) {
    const r = by(REC, name);
    assert.deepEqual(ids(r.itemsIn), ['grindless:etched_membrane']);
    assert.deepEqual(r.fluidsIn, [{ id: gas, amount: 1000 }]);
    assert.deepEqual(r.itemsOut, [{ id: out, count: 1 }]);
    assert.deepEqual(r.fluidsOut, [{ id: 'gtceu:helium', amount: 1000 }]);
  }
  const census = by(CHEM, 'census_iv');
  assert.deepEqual(ids(census.itemsIn), ['grindless:element_124_recoil', 'grindless:element_126_recoil', 'grindless:island_nuclide', 'grindless:sealed_capsule']);
  assert.deepEqual(census.itemsOut, [{ id: 'grindless:superheavy_census_iv', count: 1 }]);
});

test('only from: each new product has one producer, the package\'s row, and every intermediate has its consumer', () => {
  const only = {
    'gtceu:thawed_chain_nickel_dust': 'electron_beam.json:.types.electron_beam_refining.',
    'gtceu:nickel_64_dust': 'isotopes.json:.types.calutron_separation.',
    'gtceu:element_124_recoil_gas': 'superheavy.json:.types.heavy_ion_irradiation.',
    'gtceu:element_126_recoil_gas': 'superheavy.json:.types.heavy_ion_irradiation.',
    'grindless:element_124_recoil': 'superheavy.json:.types.recoil_separation.',
    'grindless:element_126_recoil': 'superheavy.json:.types.recoil_separation.',
    'grindless:superheavy_census_iv': 'superheavy.json:.types.superheavy_chemistry.'
  };
  for (const [id, where] of Object.entries(only)) {
    const from = tableProducers(id);
    assert.equal(from.length, 1, `${id}: ${from}`);
    assert.ok(from[0].startsWith(where), `${id}: ${from[0]}`);
  }
  const scripts = jsFiles(path.join(kube, 'server_scripts')).map((f) => [path.relative(kube, f), fs.readFileSync(f, 'utf8')]);
  for (const id of Object.keys(only)) {
    const made = new RegExp(`(?:itemOutputs|outputFluids|outputs?)\\([^)]*${id.split(':')[1]}`);
    assert.deepEqual(scripts.filter(([, s]) => made.test(s)).map(([p]) => p), [], `${id} made by a server script`);
  }
  for (const id of Object.keys(only).filter((x) => x !== 'grindless:superheavy_census_iv')) assert.ok(tableConsumers(id).length > 0, `${id} has no consumer`);
});

test('the four materials are census_iv.js\'s (two dusts, two radioactive gases); F1\'s items and A0\'s caged_ni_chain are not registered again', () => {
  for (const [name, form] of Object.entries(MATERIALS)) {
    const mat = run.registry.materials.get(`gtceu:${name}`) || run.registry.materials.get(name);
    assert.ok(mat && mineFile(mat.file), `${name} is not a material of census_iv.js`);
    assert.ok(mat.forms.has(form), `${name} lacks the ${form} form`);
    if (form === 'gas') assert.ok(run.registry.fluids.has(`gtceu:${name}`), `${name} fluid`);
  }
  for (const n of ['element_124_recoil', 'element_126_recoil', 'superheavy_census_iv']) {
    const it = run.registry.items.get(`grindless:${n}`);
    assert.ok(it && /opv[\\/]foundation\.js$/.test(String(it.file)), `${n} stays F1's`);
  }
  const code = STARTUP.replace(/^\s*\/\/.*$/gm, '');
  for (const n of ['caged_ni_chain', 'element_124_recoil\'', 'superheavy_census_iv', 'StartupEvents.registry(\'item\'']) assert.ok(!code.includes(n), n);
  assert.doesNotMatch(STARTUP, /^\/\/ priority:/m, 'the integrator stamps the load order');
});

test('lang parity: every new material and row has its name in en_us and es_es; F1 names the three items', () => {
  const need = Object.keys(MATERIALS).map((n) => `material.gtceu.${n}`);
  for (const [, type, name] of MINE) need.push(`gtceu.recipe.${DATAKEY[type]}.${name}`);
  for (const l of ['en_us', 'es_es']) {
    for (const k of need) assert.ok(run.lang[l][k], `${l} ${k}`);
    for (const n of ['element_124_recoil', 'element_126_recoil', 'superheavy_census_iv']) {
      assert.ok(run.lang[l][`item.grindless.${n}`] && run.lang[l][`tooltip.grindless.${n}.0`], `${l} ${n}`);
    }
  }
  for (const k of need) assert.notEqual(run.lang.en_us[k], run.lang.es_es[k], k);
  assert.match(LANG, /\['en_us', 'es_es'\]/);
});
