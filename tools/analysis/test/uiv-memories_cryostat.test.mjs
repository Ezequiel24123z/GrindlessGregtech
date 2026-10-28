// UIV-A6 (docs/eras/uiv.md, machines 6 and 8; lines 11, 15, 16, 42, 44): the spectral hole burner and the millikelvin cryostat works. Static checks only (no T1).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const kube = path.join(root, 'pack', 'kubejs');
const tables = path.join(kube, 'data', 'grindless', 'tables');
const read = (...p) => fs.readFileSync(path.join(kube, ...p), 'utf8');
const T = JSON.parse(fs.readFileSync(path.join(tables, 'memories_cryostat.json'), 'utf8'));

const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => x.id);
const inputs = (r) => ids(r.itemsIn).concat(ids(r.kept), ids(r.fluidsIn), ids(r.charge));
const outputs = (r) => ids(r.itemsOut).concat(ids(r.fluidsOut));
const by = (type, name) => {
  const r = T.types[type].recipes.find((x) => x.name === name);
  assert.ok(r, `${type}/${name}`);
  return r;
};

function scripts(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...scripts(p));
    else if (e.name.endsWith('.js')) out.push(p);
  }
  return out;
}
const OTHER_TABLES = fs.readdirSync(tables).filter((n) => n.endsWith('.json') && n !== 'memories_cryostat.json');

test('names unique, EU/t and duration positive, circuits unique per type', () => {
  const names = [];
  for (const [type, t] of Object.entries(T.types)) {
    const circuits = t.recipes.map((r) => r.circuit).filter((c) => c > 0);
    assert.equal(new Set(circuits).size, circuits.length, type);
    for (const r of t.recipes) {
      names.push(r.name);
      assert.ok(Number.isInteger(r.eut) && r.eut > 0 && Number.isInteger(r.duration) && r.duration > 0, r.name);
    }
  }
  assert.equal(new Set(names).size, names.length);
});

test('spectral hole burner: circuits 1-2, figures, slots, no byproduct', () => {
  const rc = T.types.spectral_hole_burning.recipes;
  assert.deepEqual(rc.map((r) => [r.name, r.circuit]), [['six_hour_slab', 1], ['telecom_slab', 2]]);
  for (const r of rc) {
    assert.equal(r.eut, 31457280, r.name);
    assert.equal(r.duration, 1200, r.name);
    assert.equal(r.itemsOut.length, 1, r.name);
    assert.equal(ids(r.fluidsOut).length, 0, r.name);
    assert.ok(r.itemsIn.length + 1 <= 2 && ids(r.charge).length <= 1, r.name);
  }
  assert.deepEqual(inputs(by('spectral_hole_burning', 'six_hour_slab')), ['grindless:eu151_yso_slab', 'gtceu:superfluid_helium']);
  assert.deepEqual(outputs(by('spectral_hole_burning', 'six_hour_slab')), ['grindless:six_hour_memory_slab']);
  assert.deepEqual(inputs(by('spectral_hole_burning', 'telecom_slab')), ['grindless:er_yso_slab', 'gtceu:superfluid_helium']);
  assert.deepEqual(outputs(by('spectral_hole_burning', 'telecom_slab')), ['grindless:telecom_memory_slab']);
});

test('lines 15 and 16 chain: boule, slab, memory', () => {
  assert.deepEqual(inputs(by('cutter', 'eu151_yso_slabs')).slice(0, 1), ['grindless:eu151_yso_boule']);
  assert.deepEqual(inputs(by('cutter', 'er_yso_slabs')).slice(0, 1), ['grindless:er_yso_boule']);
  assert.deepEqual(outputs(by('cutter', 'eu151_yso_slabs')), ['grindless:eu151_yso_slab']);
  assert.deepEqual(outputs(by('cutter', 'er_yso_slabs')), ['grindless:er_yso_slab']);
  const six = by('assembler', 'six_hour_memory');
  assert.deepEqual(inputs(six), ['grindless:six_hour_memory_slab', 'grindless:mk_cryostat_module', 'grindless:uev_sensor']);
  assert.deepEqual(outputs(six), ['grindless:six_hour_memory']);
  assert.ok(six.eut <= 1966080);
});

test('"only from" claims: no other table or script builds these outputs', () => {
  const claims = {
    'grindless:eu151_yso_boule': 'crystals.json',
    'grindless:er_yso_boule': 'crystals.json',
    'grindless:eu151_yso_slab': 'cutter/eu151_yso_slabs',
    'grindless:er_yso_slab': 'cutter/er_yso_slabs',
    'grindless:six_hour_memory_slab': 'spectral_hole_burning/six_hour_slab',
    'grindless:telecom_memory_slab': 'spectral_hole_burning/telecom_slab',
    'grindless:six_hour_memory': 'assembler/six_hour_memory'
  };
  for (const [id, where] of Object.entries(claims)) {
    const mine = Object.entries(T.types).flatMap(([type, t]) => t.recipes.filter((r) => outputs(r).includes(id)).map((r) => `${type}/${r.name}`));
    assert.deepEqual(mine, where === 'crystals.json' ? [] : [where], id);
    for (const f of OTHER_TABLES) {
      const txt = fs.readFileSync(path.join(tables, f), 'utf8');
      const hits = [...txt.matchAll(new RegExp(`"(?:itemsOut|fluidsOut)"\\s*:\\s*\\[[^\\]]*"${id}"`, 'g'))].length;
      assert.equal(hits, where === 'crystals.json' && f === 'crystals.json' ? 1 : 0, `${f} produces ${id}`);
    }
    for (const f of scripts(kube)) {
      if (f.endsWith(path.join('uiv', 'memories_cryostat.js'))) continue;
      const src = fs.readFileSync(f, 'utf8');
      assert.ok(!new RegExp(`\\.(?:itemOutputs|outputItems|output)\\([^)]*${id}`).test(src), `${path.relative(kube, f)} outputs ${id}`);
    }
  }
});

test('the older rows exist, each marked UIV-A6', () => {
  const cr = JSON.parse(fs.readFileSync(path.join(tables, 'crystals.json'), 'utf8'));
  const growth = cr.types.crystal_growth.recipes;
  const eu = growth.find((r) => r.name === 'eu151_yso');
  const er = growth.find((r) => r.name === 'er_yso');
  assert.ok(eu && er && eu.circuit === 8 && er.circuit === 9);
  assert.equal(growth.filter((r) => r.circuit === 8 || r.circuit === 9).length, 2);
  assert.deepEqual(ids(eu.itemsIn).slice(0, 3), ['gtceu:yttrium_dust', 'gtceu:silicon_dioxide_dust', 'gtceu:europium_151_dust']);
  assert.deepEqual(ids(er.itemsIn).slice(0, 3), ['gtceu:yttrium_dust', 'gtceu:silicon_dioxide_dust', 'gtceu:erbium_oxide_dust']);
  assert.deepEqual(ids(eu.itemsOut)[0], 'grindless:eu151_yso_boule');
  assert.deepEqual(ids(er.itemsOut)[0], 'grindless:er_yso_boule');
  const fibre = read('server_scripts', 'grindless', 'uv', 'photonics.js');
  assert.match(fibre, /UIV-A6[\s\S]*?name: 'er_yso_pigtail', type: 'fibre_draw', circuit: 10[\s\S]*?grindless:telecom_memory_slab[\s\S]*?grindless:telecom_memory'/);
});

test('lang parity: every ENTRY and ITEM has en_us and es_es, every item has a texture', () => {
  const lang = read('client_scripts', 'grindless', 'uiv_memories_cryostat_lang.js');
  const itemNames = [...lang.matchAll(/^\s+\['([a-z0-9_]+)', '[^']+', '[^']+', /gm)].map((m) => m[1]);
  const start = read('startup_scripts', 'grindless', 'uiv', 'memories_cryostat.js');
  const registered = [...start.matchAll(/^\s+([a-z0-9_]+): \{ stack: \d+ \}/gm)].map((m) => m[1]);
  assert.equal(registered.length, 7);
  assert.deepEqual(itemNames.sort(), registered.slice().sort());
  const keys = [...lang.matchAll(/^\s+\['((?:block|gtceu|material|grindless)\.[^']+)',\s*$/gm)].map((m) => m[1]);
  const flat = [...lang.matchAll(/^\s+\['((?:block|gtceu|material)\.[^']+)', '[^']+', '[^']+'\]/gm)].map((m) => m[1]);
  for (const k of ['block.gtceu.spectral_hole_burner', 'gtceu.spectral_hole_burning']) assert.ok(flat.includes(k), k);
  for (const n of ['eu151_yso', 'er_yso']) assert.ok(keys.includes(`gtceu.recipe.grindless_crystal_growth.${n}`), n);
  for (const m of ['spectral_hole_burner']) for (let i = 0; i < 3; i++) assert.ok(keys.includes(`grindless.machine.${m}.tooltip.${i}`), `${m} ${i}`);
  for (const [type, t] of Object.entries(T.types)) {
    if (!t.dataKey) continue;
    for (const r of t.recipes) assert.ok(keys.includes(`gtceu.recipe.${t.dataKey}.${r.name}`), `${t.dataKey}.${r.name}`);
  }
  for (const n of registered) {
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'item', `${n}.png`)), n);
  }
  for (const m of ['spectral_hole_burner']) {
    for (const f of ['overlay_front.png', 'overlay_front_active.png', 'overlay_front_active_emissive.png']) {
      assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'block', 'multiblock', m, f)), `${m}/${f}`);
    }
  }
});
