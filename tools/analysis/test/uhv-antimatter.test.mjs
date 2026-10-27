// UHV-A6 (docs/eras/uhv.md, "A6. Antimatter and Casimir"): the positron accumulator's, the Casimir array's and the older machines'
// rows (UV's synchrotron and antimatter trap, EV's cryogenic plant), checked without Minecraft by static recipe lookup. No T1: the
// table-driven machines and the chanced inputs and outputs are proven by UV-A5 (accelerators) and UHV-A5 (power devices).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const kube = path.join(root, 'pack', 'kubejs');
const tables = path.join(kube, 'data', 'grindless', 'tables');
const table = (name) => JSON.parse(fs.readFileSync(path.join(tables, name), 'utf8'));
const read = (...p) => fs.readFileSync(path.join(kube, ...p), 'utf8');
const T = table('antimatter.json');
const AC = table('accelerators.json');
const ACC = T.types.positron_accumulation.recipes;
const ARR = T.types.casimir_cavity.recipes;
const STARTUP = read('startup_scripts', 'grindless', 'uhv', 'antimatter.js');
const SERVER = read('server_scripts', 'grindless', 'uhv', 'antimatter.js');
const ACCEL = read('server_scripts', 'grindless', 'uv', 'accelerators.js');
const CRYO = read('server_scripts', 'grindless', 'ev', 'cryogenic_plant.js');
const LANG = read('client_scripts', 'grindless', 'uhv_antimatter_lang.js');

const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => x.id);
const inputs = (r) => ids(r.itemsIn).concat(ids(r.kept), ids(r.chancedIn), ids(r.fluidsIn), ids(r.charge));
const outputs = (r) => ids(r.itemsOut).concat(ids(r.chancedOut), ids(r.fluidsOut));
const by = (rs, name) => {
  const r = rs.find((x) => x.name === name);
  assert.ok(r, name);
  return r;
};

// every recipe-producing row of every table, as [table/type/name, recipe]
function allRows() {
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
const producers = (id) => allRows().filter(([, r]) => outputs(r).includes(id));

// every server script that names the id as an output-like literal (outside this package's table loader)
function scriptsNaming(id) {
  const dir = path.join(kube, 'server_scripts');
  const out = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.js') && fs.readFileSync(p, 'utf8').includes(id)) out.push(path.relative(dir, p).split(path.sep).join('/'));
    }
  };
  walk(dir);
  return out.sort();
}

// the inline UHV_ROWS entry of uv/accelerators.js for a name, as source text
function uhvRow(name) {
  const start = ACCEL.indexOf(`name: '${name}'`);
  assert.ok(start > 0, name);
  return ACCEL.slice(start, ACCEL.indexOf('fluidsOut', start) + 80);
}

test('every recipe has a unique name, a positive EU/t and duration; circuits are unique inside a type', () => {
  for (const [type, t] of Object.entries(T.types)) {
    assert.equal(new Set(t.recipes.map((r) => r.name)).size, t.recipes.length, type);
    const circuits = t.recipes.map((r) => r.circuit).filter((c) => c > 0);
    assert.equal(new Set(circuits).size, circuits.length, type);
    for (const r of t.recipes) {
      assert.ok(Number.isInteger(r.eut) && r.eut > 0 && Number.isInteger(r.duration) && r.duration > 0, r.name);
      if (type !== 'assembler') assert.ok(r.circuit >= 1 && r.circuit <= 32, `${type}/${r.name}: one recipe per lookup path needs a circuit`);
      for (const x of r.itemsIn.concat(r.itemsOut)) if (x.chance !== undefined) assert.ok(Number.isInteger(x.chance) && x.chance >= 1 && x.chance < 10000, `${r.name}: ${x.id}`);
    }
  }
});

test('one recipe per lookup path: no recipe\'s ingredients are a subset of another\'s in its type', () => {
  const keys = (r) => new Set(inputs(r).concat([`circuit:${r.circuit}`]));
  const sub = (a, b) => [...a].every((k) => b.has(k));
  for (const [type, t] of Object.entries(T.types)) {
    const ks = t.recipes.map(keys);
    for (let i = 0; i < ks.length; i++) {
      for (let j = i + 1; j < ks.length; j++) assert.ok(!sub(ks[i], ks[j]) && !sub(ks[j], ks[i]), `${type}: ${t.recipes[i].name} / ${t.recipes[j].name}`);
    }
  }
});

test('the recipes fit the machines\' slots (startup maxIO; the circuit takes an item slot)', () => {
  const io = {
    positron_accumulation: { itemsIn: 3, itemsOut: 2, fluidsIn: 1, fluidsOut: 1 },
    casimir_cavity: { itemsIn: 3, itemsOut: 2, fluidsIn: 1, fluidsOut: 1 }
  };
  for (const [type, m] of Object.entries(io)) {
    assert.ok(STARTUP.includes(`type: '${type}'`), type);
    assert.equal(STARTUP.split(`maxIO: { itemsIn: ${m.itemsIn}, itemsOut: ${m.itemsOut}, fluidsIn: ${m.fluidsIn}, fluidsOut: ${m.fluidsOut} }`).length - 1, 2);
    for (const r of T.types[type].recipes) {
      assert.ok(r.itemsIn.length + r.kept.length + 1 <= m.itemsIn, `${r.name} items in`);
      assert.ok(r.fluidsIn.length + r.charge.length <= m.fluidsIn, `${r.name} fluids in`);
      assert.ok(r.itemsOut.length <= m.itemsOut, `${r.name} items out`);
      assert.ok(r.fluidsOut.length <= m.fluidsOut, `${r.name} fluids out`);
    }
  }
  assert.equal(T.types.casimir_cavity.orbit, true, 'the array works only in Earth orbit');
  assert.ok(SERVER.includes('if (rec.orbit) recipe.dimension(ORBIT)'));
});

test('positron cartridges come only from the accumulator, which wears its source and refuses voiding', () => {
  const p = producers('grindless:positron_cartridge');
  assert.deepEqual(p.map(([w, r]) => [w.split(':')[0], r.name]), [['antimatter.json', 'accumulate']]);
  const acc = by(ACC, 'accumulate');
  assert.deepEqual(acc.itemsIn.find((x) => x.id === 'grindless:moderated_positron_source'), { id: 'grindless:moderated_positron_source', count: 1, chance: 625 });
  assert.deepEqual(acc.itemsOut.find((x) => x.id === 'grindless:spent_positron_source'), { id: 'grindless:spent_positron_source', count: 1, chance: 625 });
  assert.ok(inputs(acc).includes('grindless:empty_penning_trap'));
  assert.ok(STARTUP.includes('G.noVoiding.modifier(accOpts') && STARTUP.includes('G.noVoiding.beforeWorking(accOpts)'));
  assert.ok(LANG.includes("'grindless.machine.positron_accumulator.no_voiding'"));
  // the spent source: neon back, the sodium-22 as radioactive waste -> ZPM's waste retrieval plant
  const strip = by(ACC, 'strip_source');
  assert.deepEqual(outputs(strip).sort(), ['gtceu:neon', 'gtnn:radioactive_waste']);
  const zpm = read('server_scripts', 'grindless', 'zpm', 'actinides.js');
  assert.ok(zpm.includes("var WASTE = 'gtnn:radioactive_waste'"));
});

test('antihydrogen comes only from the antimatter trap, in orbit, and only with a positron cartridge', () => {
  assert.deepEqual(producers('grindless:antihydrogen_cartridge'), [], 'no table makes antihydrogen');
  assert.deepEqual(scriptsNaming('grindless:antihydrogen_cartridge'), ['grindless/uv/accelerators.js']);
  const row = uhvRow('antihydrogen');
  assert.ok(row.startsWith("name: 'antihydrogen', circuit: 3"), row);
  assert.ok(row.includes("orbit: true"));
  assert.ok(/itemsIn: \[[^\]]*'grindless:antiproton_cartridge'[^\]]*'grindless:positron_cartridge'/.test(row), 'antiprotons + positrons');
  assert.ok(/itemsOut: \[\{ id: 'grindless:antihydrogen_cartridge'/.test(row));
  assert.ok(ACCEL.slice(ACCEL.lastIndexOf('{', ACCEL.indexOf("name: 'antihydrogen'")), ACCEL.indexOf("name: 'antihydrogen'")).includes("type: 'antimatter_storage'"));
  const trap = AC.types.antimatter_storage.recipes;
  assert.ok(!trap.some((r) => r.circuit === 3 || r.name === 'antihydrogen'), 'trap circuit 3 is free in the table');
  // the generator registers UHV_ROWS as grindless:<type>/<name> with builder id grindless:<name>
  assert.ok(ACCEL.includes("rec.builderId = 'grindless:' + rec.name") && ACCEL.includes('rec.builderId || rec.recipeId'));
});

test('exotic matter comes only from the Casimir array\'s harvest, with the nuclear clock kept', () => {
  const p = producers('grindless:exotic_matter_cell');
  assert.deepEqual(p.map(([w, r]) => [w.split(':')[0], r.name]), [['antimatter.json', 'harvest']]);
  assert.ok(p[0][0].includes('casimir_cavity'));
  assert.deepEqual(scriptsNaming('grindless:exotic_matter_cell'), []);
  const h = by(ARR, 'harvest');
  assert.deepEqual(h.kept, [{ id: 'grindless:nuclear_clock', count: 1 }]);
  assert.deepEqual(h.itemsIn, [{ id: 'grindless:casimir_cavity_stack', count: 16, chance: 313 }]);
  assert.ok(h.itemsOut.some((x) => x.id === 'grindless:worn_casimir_cavity_stack' && x.count === 16 && x.chance === 313));
  // the stack's plates loop back: worn stack -> mirror blanks -> UV's MOCVD -> NbN-coated plates -> stack
  assert.ok(outputs(by(ARR, 'strip_stack')).includes('grindless:sic_mirror_blank'));
  assert.ok(inputs(by(ARR, 'cavity_stack')).includes('grindless:nbn_coated_sic_plate'));
  const mocvd = read('server_scripts', 'grindless', 'uv', 'photonics.js');
  assert.ok(mocvd.includes('grindless:nbn_coated_sic_plate') && mocvd.includes('grindless:sic_mirror_blank'));
  const emi = JSON.parse(fs.readFileSync(path.join(kube, 'assets', 'emi', 'recipe', 'additions', 'grindless', 'uhv_antimatter_casimir_fiction.json'), 'utf8'));
  assert.ok(emi.stacks.includes('item:gtceu:casimir_array') && emi.stacks.includes('item:grindless:exotic_matter_cell'));
  for (const k of emi.text) assert.equal(LANG.split(`'${k}'`).length - 1, 1, k);
  assert.ok(/Fiction:/.test(LANG) && /Ficción:/.test(LANG), 'the fiction is labelled in both languages');
});

test('line 27\'s older rows: synchrotron c5 sodium-22, the magnesium target, the cryogenic plant\'s 99.999 % neon', () => {
  const row = uhvRow('sodium_22');
  assert.ok(row.startsWith("name: 'sodium_22', circuit: 5"), row);
  assert.ok(row.includes("'grindless:magnesium_target'") && row.includes("'gtceu:deuterium'") && /itemsOut: \[\{ id: 'grindless:sodium_22_target'/.test(row));
  assert.ok(!AC.types.synchrotron.recipes.some((r) => r.circuit === 5 || r.name === 'sodium_22'), 'synchrotron circuit 5 is free in the table');
  assert.deepEqual(scriptsNaming("'grindless:sodium_22_target'"), ['grindless/uv/accelerators.js']);
  assert.deepEqual(producers('grindless:magnesium_target').map(([, r]) => r.name), ['magnesium_target']);
  assert.ok(inputs(by(ACC, 'moderated_source')).includes('gtceu:high_purity_neon'));
  // the neon row: neon in, 99.999 % neon and helium out, on the Moon with the night key
  const neon = CRYO.slice(CRYO.indexOf('var HIGH_PURITY_NEON'), CRYO.indexOf('function addHighPurityNeon'));
  assert.ok(neon.includes("id: 'grindless:cryogenic_processing/high_purity_neon'"));
  assert.ok(neon.includes("input: { id: 'gtceu:neon', amount: 1000 }"));
  assert.ok(neon.includes("{ id: 'gtceu:high_purity_neon', amount: 950 }") && neon.includes("{ id: 'gtceu:helium', amount: 50 }"));
  assert.ok(CRYO.includes('addHighPurityNeon(event)') && CRYO.includes("event.recipes.gtceu.cryogenic_processing('grindless:high_purity_neon')"));
  assert.ok(STARTUP.includes('high_purity_neon: {') && STARTUP.includes('.gas()'));
  // only the cryogenic plant makes it
  assert.deepEqual(producers('gtceu:high_purity_neon'), []);
  assert.deepEqual(scriptsNaming('gtceu:high_purity_neon'), ['grindless/ev/cryogenic_plant.js']);
});

test('the controllers have shapes no other UHV controller uses', () => {
  const dir = path.join(kube, 'server_scripts', 'grindless', 'uhv');
  const shapes = [];
  for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.js'))) {
    const s = fs.readFileSync(path.join(dir, f), 'utf8');
    for (const m of s.matchAll(/pattern: (\[[^\]]*\]), ingredients: (\{[^}]*\})/g)) shapes.push(`${m[1]} ${m[2].replace(/: [A-Z_]+/g, '')}`);
  }
  assert.ok(shapes.length >= 2);
  assert.equal(new Set(shapes).size, shapes.length, shapes.join('\n'));
});

test('no UEV input; every item has a texture; every lang key is written in en_us and es_es', () => {
  const rows = Object.values(T.types).flatMap((t) => t.recipes);
  for (const r of rows) for (const id of inputs(r).concat(outputs(r))) assert.ok(!/(^|[:_])uev(_|$)/.test(id.split(':')[1] || ''), `${r.name}: ${id}`);
  const items = [...STARTUP.matchAll(/^ {4}([a-z0-9_]+): \{ stack: \d+ \}/gm)].map((m) => m[1]);
  assert.equal(items.length, 7);
  for (const n of items) {
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'item', `${n}.png`)), n);
    for (const k of [`item.grindless.${n}`, `tooltip.grindless.${n}.0`, `tooltip.grindless.${n}.1`]) assert.ok(LANG.includes(`'${k}'`), k);
  }
  for (const m of ['positron_accumulator', 'casimir_array']) {
    for (const f of ['overlay_front.png', 'overlay_front_active.png', 'overlay_front_active_emissive.png']) {
      assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'block', 'multiblock', m, f)), `${m}/${f}`);
    }
    for (const k of [`block.gtceu.${m}`, ...[0, 1, 2].map((i) => `grindless.machine.${m}.tooltip.${i}`)]) assert.ok(LANG.includes(`'${k}'`), k);
  }
  for (const [type, t] of Object.entries(T.types)) {
    if (!t.dataKey) continue;
    assert.ok(LANG.includes(`'gtceu.${type}'`), type);
    for (const r of t.recipes) assert.ok(LANG.includes(`'gtceu.recipe.${t.dataKey}.${r.name}'`), `${type}/${r.name}`);
  }
  for (const k of ['gtceu.recipe.grindless_synchrotron.sodium_22', 'gtceu.recipe.grindless_antimatter_storage.antihydrogen', 'material.gtceu.high_purity_neon']) {
    assert.ok(LANG.includes(`'${k}'`), k);
  }
  // each entry is [key, en, es]: three strings
  const entries = LANG.slice(LANG.indexOf('var ENTRIES = ['), LANG.indexOf(']\n\n    ;['));
  for (const m of entries.matchAll(/\['([a-z0-9_.]+)',/g)) assert.ok(m[1].length > 0);
});
