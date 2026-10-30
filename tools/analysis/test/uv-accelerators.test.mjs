// UV-A5 (docs/eras/uv.md, "A5. Accelerators"): the synchrotron's, the muon fusion cell's and the antimatter trap's table, checked
// without Minecraft. The live lookups, the dimension veto and the generator figure are the native test gg_test_uv_accelerators.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const kube = path.join(root, 'pack', 'kubejs');
const read = (...p) => fs.readFileSync(path.join(kube, ...p), 'utf8');
const T = JSON.parse(read('data', 'grindless', 'tables', 'accelerators.json'));
const startup = read('startup_scripts', 'grindless', 'uv', 'accelerators.js');
const OWN = ['synchrotron', 'muon_catalysed_fusion', 'antimatter_storage'];
const ins = (r) => [...(r.itemsIn || []), ...(r.kept || []), ...(r.chancedIn || [])].map((x) => x.id);
const outs = (r) => [...(r.itemsOut || []), ...(r.chancedOut || [])].map((x) => x.id);

test('every recipe has a unique name, a positive EU/t and duration; circuits are unique inside our own types', () => {
  for (const [type, t] of Object.entries(T.types)) {
    assert.equal(new Set(t.recipes.map((r) => r.name)).size, t.recipes.length, type);
    for (const r of t.recipes) {
      assert.ok(Number.isInteger(r.eut) && r.eut > 0 && Number.isInteger(r.duration) && r.duration > 0, r.name);
      for (const c of [...(r.chancedIn || []), ...(r.chancedOut || [])]) assert.ok(Number.isInteger(c.chance) && c.chance >= 1 && c.chance <= 9999, r.name);
    }
    const circuits = t.recipes.map((r) => r.circuit);
    if (OWN.includes(type) && type !== 'muon_catalysed_fusion') {
      assert.ok(circuits.every((c) => c >= 1 && c <= 32), type);
      assert.equal(new Set(circuits).size, circuits.length, type);
    } else {
      assert.ok(circuits.every((c) => c === 0), type);
    }
  }
});

test('the muon fusion cell gives 786,432 EU/t, final, and its generator type is not in the doubling list (S0-6)', () => {
  const rx = T.types.muon_catalysed_fusion.recipes;
  assert.equal(rx.length, 1);
  assert.equal(rx[0].eut, 786432);
  assert.ok(startup.includes('AC.cellEUt = 786432'));
  const gen = read('server_scripts', 'grindless', 'power', 'generators.js');
  assert.ok(!gen.includes('muon_catalysed_fusion'));
});

test('the cell writes its tritium make-up: it breeds back less tritium than its D-T holds', () => {
  const r = T.types.muon_catalysed_fusion.recipes[0];
  const dt = r.fluidsIn.find((f) => f.id === 'gtceu:liquid_deuterium_tritium').amount;
  const bred = r.fluidsOut.find((f) => f.id === 'gtceu:tritium').amount;
  assert.ok(bred > 0 && bred < dt / 2, 'bred tritium below the tritium fed');
  assert.ok(r.kept.some((x) => x.id === 'grindless:lithium_breeder_blanket'));
});

test('every antimatter trap recipe is limited to Earth orbit', () => {
  for (const r of T.types.antimatter_storage.recipes) assert.equal(r.orbit, true, r.name);
  for (const [type, t] of Object.entries(T.types)) {
    if (type !== 'antimatter_storage') for (const r of t.recipes) assert.notEqual(r.orbit, true, `${type}/${r.name}`);
  }
});

test('antiprotons come only from the synchrotron', () => {
  for (const [type, t] of Object.entries(T.types)) {
    for (const r of t.recipes) {
      if (outs(r).includes('grindless:antiproton_cartridge')) assert.equal(type, 'synchrotron', r.name);
    }
  }
  const sync = T.types.synchrotron.recipes.find((r) => outs(r).includes('grindless:antiproton_cartridge'));
  assert.ok(sync && ins(sync).includes('gtca:proton'));
});

test('every byproduct has a destination: activated target, hydrogen, helium, tritium, diluted acid', () => {
  const madeFrom = new Set(Object.values(T.types).flatMap((t) => t.recipes.flatMap(ins)));
  assert.ok(madeFrom.has('grindless:activated_tungsten_target'), 'the activated target is processed');
  const lang = (read('client_scripts', 'grindless', 'uv_accelerators_lang.js') + read('client_scripts', 'grindless', 'uv_info_lang.js')).toLowerCase();
  for (const word of ['chemical bath', 'hydrogen', 'superfluid helium plant', 'make-up', 'extrapolation', 'earth orbit']) assert.ok(lang.includes(word), word);
  const server = read('server_scripts', 'grindless', 'uv', 'accelerators.js').toLowerCase();
  assert.ok(server.includes('diluted sulfuric acid ->'));
});

test('every new item has a texture, en_us and es_es names, and the F1 ids are used, never registered again', () => {
  const lang = read('client_scripts', 'grindless', 'uv_accelerators_lang.js');
  const items = [...startup.matchAll(/^ {4}([a-z0-9_]+): \{ stack: \d+ \}/gm)].map((m) => m[1]);
  assert.equal(items.length, 13);
  for (const n of items) {
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'item', `${n}.png`)), n);
    assert.ok(lang.includes(`['item.grindless.${n}',`), n);
    assert.ok(lang.includes(`['tooltip.grindless.${n}.1',`), n);
  }
  for (const f1 of ['antiproton_cartridge', 'srf_cryomodule_block', 'liquid_deuterium_tritium', 'superfluid_helium']) {
    assert.ok(!items.includes(f1), f1);
    assert.ok(!new RegExp(`^ {4}${f1}: \\{`, 'm').test(startup), f1);
  }
});
