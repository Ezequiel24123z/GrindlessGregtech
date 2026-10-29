// UHV-B7 (docs/eras/uhv.md, "B7. The gate and the edge"): the warp gate's and the baseline astrometer's tables and the scripts'
// wiring, checked without Minecraft by static recipe lookup. The runtime proof is the T1 gg_test_uhv_gate.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const kube = path.resolve(here, '..', '..', '..', 'pack', 'kubejs');
const G = JSON.parse(fs.readFileSync(path.join(kube, 'data', 'grindless', 'tables', 'gate.json'), 'utf8'));
const server = fs.readFileSync(path.join(kube, 'server_scripts', 'grindless', 'uhv', 'gate.js'), 'utf8');
const startup = fs.readFileSync(path.join(kube, 'startup_scripts', 'grindless', 'uhv', 'gate.js'), 'utf8');

const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => x.id);
const by = (type, name) => {
  const r = G.types[type].recipes.find((x) => x.name === name);
  assert.ok(r, `${type}/${name}`);
  return r;
};
const uses = (r) => ids(r.itemsIn).concat(ids(r.kept));

test('unique names and circuits inside each type; positive EU/t and duration', () => {
  for (const [type, t] of Object.entries(G.types)) {
    assert.equal(new Set(t.recipes.map((r) => r.name)).size, t.recipes.length, type);
    const c = t.recipes.map((r) => r.circuit);
    assert.equal(new Set(c).size, c.length, type);
    for (const r of t.recipes) {
      assert.ok(r.circuit >= 1 && r.circuit <= 32, r.name);
      assert.ok(Number.isInteger(r.eut) && r.eut > 0 && Number.isInteger(r.duration) && r.duration > 0, r.name);
    }
  }
});

test('the gate opens with exotic matter and antihydrogen cartridges and returns the shells and a seed', () => {
  const open = by('warp_gate', 'open');
  assert.ok(uses(open).includes('grindless:antihydrogen_cartridge'));
  assert.ok(uses(open).includes('grindless:exotic_matter_cell'));
  assert.ok(ids(open.itemsOut).includes('grindless:proxima_gate_seed'));
  assert.ok(ids(open.itemsOut).includes('grindless:empty_antiproton_cartridge'));
  assert.equal(open.eut, 1966080);
});

test('the sustain run is 16 A UHV and has no output', () => {
  const s = by('warp_gate', 'sustain');
  assert.equal(s.eut, 1966080 * 16);
  assert.ok(!(s.itemsOut || []).length);
});

test('the astrometer uses the zblan fibre and the infrared pigment and yields the chart, at Proxima b only', () => {
  const r = by('baseline_astrometry', 'stellar_neighbourhood_chart');
  assert.ok(uses(r).includes('grindless:zblan_fibre'));
  assert.ok(uses(r).includes('grindless:infrared_pigment'));
  assert.equal(r.site, 'proxima_b_orbit');
  assert.ok(ids(r.itemsOut).length >= 1);
  assert.match(server, new RegExp(ids(r.itemsOut)[0].replace(':', ':')));
});

test('the server script wires the pair, the UEV casing with research, the crafting recipes and the transit', () => {
  assert.match(server, /ae2:transform/);
  assert.match(server, /quantum_entangled_singularity/);
  assert.match(server, /uev_machine_casing/);
  assert.match(server, /assembly_line/);
  assert.match(server, /stationResearch/);
  assert.match(server, /teleportTo/);
  assert.match(server, /grindless:assembly_line\//);
  assert.match(server, /assembler\('grindless:warp_gate_casing'\)/, 'the ring casing has a recipe');
  assert.match(startup, /grindless:warp_gate_casing/, 'the ring is built of it');
});

test('the startup script registers both machines and the run-recording hook', () => {
  assert.match(startup, /name: 'warp_gate'/);
  assert.match(startup, /name: 'baseline_astrometer'/);
  assert.match(startup, /beforeWorking/);
  assert.match(startup, /grindless_warp_gate/);
  assert.match(startup, /grindless_baseline_astrometry/);
});
