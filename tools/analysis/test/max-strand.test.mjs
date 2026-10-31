// MAX-A0 (docs/eras/max.md line L1 and the hull), no game needed: the horizon strand chain on older machines (vault c4, draw bench c5 and c6 at
// SGR 1806-20, PBO plant c10, two GTM assembler rows) and the MAX hull. T1 is gg_test_max_strand (tools/test/overlay/kubejs/server_scripts).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const pack = path.join(root, 'pack');
const tables = path.join(pack, 'kubejs', 'data', 'grindless', 'tables');
const run = runPackScripts(pack);
const plain = (x) => JSON.parse(JSON.stringify(x, (k, v) => (typeof v === 'function' ? undefined : v)));
const json = (f) => JSON.parse(fs.readFileSync(path.join(tables, f), 'utf8'));
const VA_MAX = 2013265920;
const SGR = 'grindless:sgr1806_orbit';
const draw = json('vela_pasta.json').types.pasta_drawing.recipes;
const vault = json('exotic_matter.json').types.strangelet_growth.recipes;
const ids = (list) => (list || []).map((x) => [x.id, x.count]);
const M = run.global.grindless.maxStrand;

test('strand.js runs without errors, nothing skipped, and makes the three assembler-side rows', () => {
  const errs = run.errors.filter((e) => /max[\\/]strand/.test(String(e.file)) && !/no original recipe/.test(String(e.message)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(M.skipped), []);
  assert.deepEqual(plain(M.recipes), ['grindless:assembly_line/clad_chain_strand', 'grindless:assembler/horizon_strand_single_cable', 'grindless:assembly_line/max_machine_hull']);
});

test('line L1: stable matter -> 4 foil (vault c4) -> clad strand -> preform (c5) -> 4 wires (c6) -> PBO sleeve (c10) -> cable -> hull', () => {
  const foil = vault.find((r) => r.name === 'exotic_cladding_foil');
  assert.equal(foil.circuit, 4);
  assert.deepEqual(ids(foil.itemsIn), [['grindless:stable_exotic_matter', 1]]);
  assert.deepEqual(ids(foil.itemsOut), [['grindless:exotic_cladding_foil', 4]]);
  const pre = draw.find((r) => r.name === 'horizon_strand_preform');
  const wire = draw.find((r) => r.name === 'horizon_wire_drawing');
  assert.deepEqual([pre.circuit, pre.site, wire.circuit, wire.site], [5, SGR, 6, SGR]);
  assert.deepEqual(ids(pre.itemsIn), [['grindless:clad_chain_strand', 1]]);
  assert.deepEqual(ids(pre.itemsOut), [['grindless:horizon_strand_preform', 1]]);
  assert.deepEqual(ids(wire.itemsIn), [['grindless:horizon_strand_preform', 1]]);
  assert.deepEqual(ids(wire.itemsOut), [['gtceu:horizon_strand_single_wire', 4]]);
  const braid = run.global.grindless.elevator.recipes.find((r) => r.name === 'horizon_braid');
  assert.deepEqual([braid.type, braid.circuit], ['pbo_synthesis', 10]);
  assert.deepEqual(plain(braid.itemsOut.map((x) => x.id)), ['grindless:pbo_braid_sleeve']);
  const recipes = run.docs.recipes.recipes;
  const ins = (id) => JSON.stringify(recipes.find((r) => r.i === id).j.inputs);
  assert.ok(ins('grindless:assembly_line/clad_chain_strand').includes('grindless:exotic_cladding_foil'));
  assert.ok(ins('grindless:assembler/horizon_strand_single_cable').includes('grindless:pbo_braid_sleeve'));
  assert.ok(ins('grindless:assembly_line/max_machine_hull').includes('gtceu:horizon_strand_single_cable'));
});

test('circuits do not repeat in a type, every row is within VA[MAX], and the hull is VH[MAX] for 200 t at home (no site)', () => {
  for (const rows of [draw, vault]) {
    const cs = rows.map((r) => r.circuit);
    assert.equal(new Set(cs).size, cs.length);
    assert.ok(rows.every((r) => r.eut <= VA_MAX));
  }
  const hull = run.docs.recipes.recipes.find((r) => r.i === 'grindless:assembly_line/max_machine_hull');
  assert.ok(hull, 'hull recipe');
  assert.match(fs.readFileSync(path.join(pack, 'kubejs', 'server_scripts', 'grindless', 'max', 'strand.js'), 'utf8'), /h\.EUt\(VH_MAX\)\.duration\(200\)/);
  assert.equal(hull.j.tickInputs.eu[0].content, 1073741824);
  assert.ok(1073741824 <= VA_MAX);
});

test('no input of the chain is returned by it; the strand has its only draw at SGR', () => {
  const made = new Set(['grindless:clad_chain_strand', 'grindless:horizon_strand_preform', 'gtceu:horizon_strand_single_wire', 'grindless:pbo_braid_sleeve',
    'gtceu:horizon_strand_single_cable', 'gtceu:max_machine_hull', 'grindless:exotic_cladding_foil']);
  const recipes = run.docs.recipes.recipes.filter((r) => r.i.startsWith('grindless:') && /clad_chain_strand|horizon|exotic_cladding|max_machine_hull/.test(r.i));
  assert.ok(recipes.length >= 7);
  const outs = (r) => JSON.stringify(r.j.outputs || {});
  for (const r of recipes) for (const id of made) if (r.i !== 'grindless:assembly_line/max_machine_hull') assert.ok(!(JSON.stringify(r.j.inputs).includes(`"${id}"`) && outs(r).includes(`"${id}"`)), `${r.i} loops ${id}`);
  const wireMakers = run.docs.recipes.recipes.filter((r) => JSON.stringify(r.j.outputs || {}).includes('"gtceu:horizon_strand_single_wire"')).map((r) => r.i);
  assert.deepEqual(wireMakers, ['grindless:pasta_drawing/horizon_wire_drawing']);
});

test('T1: the overlay exists and its zone row lists it', () => {
  assert.ok(fs.existsSync(path.join(root, 'tools', 'test', 'overlay', 'kubejs', 'server_scripts', 'gg_test_max_strand.js')));
  const z = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'test', 'zones.json'), 'utf8'));
  const row = (z.zones || z.bands || z).find((b) => b.id === 'max_strand');
  assert.deepEqual([row.x, row.z, row.y, row.tests], [[39256, 39319], [0, 63], [98, 115], ['max_strand']]);
});
