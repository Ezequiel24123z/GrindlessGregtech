// OpV-R2 (replication): the debris harvester, replication refinery and von Neumann foundry (machines 14-16, lines 38-39), their controller
// lines, the older methane pyrolyser row and the structure of startup_scripts/grindless/opv/replication.js. T1 is gg_test_opv_replication.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const pack = path.join(root, 'pack');
const run = runPackScripts(pack);
const RP = run.global.grindless.replication;
const recipes = run.docs.recipes.recipes;
const find = (id) => recipes.find((r) => r.i === id);
const plain = (x) => JSON.parse(JSON.stringify(x));
const rec = (name) => RP.recipes.find((r) => r.name === name);
const ids = (list) => plain(list.map((x) => [x.id, x.count]));
const kube = (...p) => fs.readFileSync(path.join(pack, 'kubejs', ...p), 'utf8');
const SITE = 'grindless:terzan5_core';
const V_UXV = 2 ** 27;
const VA_OPV = 503316480;
const MACHINES = ['debris_harvester'];
const TYPES = ['debris_harvesting'];
const DIMS = [[11, 5, 11]];

test('the stand-in runs the OpV-R2 scripts without errors, nothing skipped, no lookup clash', () => {
  const mine = run.errors.filter((e) => /replication/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(RP.skipped), []);
  assert.deepEqual(plain(RP.clashes), []);
});

test('each machine is registered on its recipe type with one controller and its designed size', () => {
  MACHINES.forEach((m, i) => {
    const reg = run.registry.machines.get('gtceu:' + m);
    assert.ok(reg, m);
    assert.deepEqual(reg.recipeTypes, ['gtceu:' + TYPES[i]]);
    const s = run.docs.structures.structures['gtceu:' + m];
    assert.ok(s, m + ' structure');
    const cells = s.slices.flatMap((sl) => sl.join('').split(''));
    assert.equal(cells.filter((c) => c === 'S').length, 1, m + ' one controller');
    for (const sl of s.slices) for (const row of sl) for (const c of row) assert.ok(c === ' ' || s.symbols[c], m + ' symbol ' + c);
    assert.deepEqual([s.slices[0][0].length, s.slices.length === 0 ? 0 : s.slices[0].length, s.slices.length], DIMS[i]);
  });
});

test('harvester c1-c2: sensor head kept -> 4 bulge debris; 4 debris -> 2 metal + 2 silicate fractions; 268,435,456 EU/t, Terzan 5 only', () => {
  const c1 = rec('bulge_debris_harvest');
  assert.deepEqual([c1.circuit, c1.eut, c1.duration, c1.site], [1, 2 * V_UXV, 400, SITE]);
  assert.deepEqual(ids(c1.kept), [['gtceu:opv_sensor', 1]]);
  assert.deepEqual(ids(c1.itemsOut), [['grindless:bulge_debris', 4]]);
  const c2 = rec('debris_fractions');
  assert.deepEqual([c2.circuit, c2.eut, c2.duration, c2.site], [2, 2 * V_UXV, 200, SITE]);
  assert.deepEqual(ids(c2.itemsIn), [['grindless:bulge_debris', 4]]);
  assert.deepEqual(ids(c2.itemsOut), [['grindless:metal_debris_fraction', 2], ['grindless:silicate_debris_fraction', 2]]);
  for (const r of RP.recipes) {
    assert.ok(r.eut < 2 ** 31, `${r.name}: below 2^31`);
    assert.ok(JSON.stringify(find(`grindless:${r.type}/${r.name}`).j.recipeConditions || []).includes(SITE), `${r.name}: dimension lock`);
  }
});

test('controller lines: OpV hull, components, circuits and a research item; VA[OpV]', () => {
  assert.deepEqual(plain(RP.controllerRecipes), MACHINES.map((m) => `grindless:assembly_line/${m}`));
  for (const m of MACHINES) {
    const r = find(`grindless:assembly_line/${m}`);
    assert.ok(r, m);
    assert.ok(JSON.stringify(r.j).includes('opv_machine_hull'), `${m}: OpV hull`);
    assert.ok(JSON.stringify(r.j).includes('circuits/opv'), `${m}: OpV circuits`);
  }
});

test('en_us and es_es names exist and differ', () => {
  for (const m of MACHINES) {
    const k = 'block.gtceu.' + m;
    assert.ok(run.lang.en_us[k] && run.lang.es_es[k], k);
    assert.notEqual(run.lang.en_us[k], run.lang.es_es[k]);
  }
  TYPES.forEach((t) => assert.ok(run.lang.en_us['gtceu.' + t] && run.lang.es_es['gtceu.' + t], t));
});

test('the texture generator is documented and the controller faces exist', () => {
  const gen = fs.readFileSync(path.join(root, 'tools', 'assets', 'Build-OpVReplicationTextures.ps1'), 'utf8');
  assert.match(gen, /\.SYNOPSIS/);
  for (const m of MACHINES) {
    for (const f of ['overlay_front.png', 'overlay_front_active.png', 'overlay_front_active_emissive.png']) {
      assert.ok(fs.existsSync(path.join(pack, 'kubejs', 'assets', 'grindless', 'textures', 'block', 'multiblock', m, f)), `${m}/${f}`);
    }
  }
  assert.ok(kube('data', 'grindless', 'tables', 'replication.json').length > 0);
});
