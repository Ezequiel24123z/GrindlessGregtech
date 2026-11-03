// XP-G1: the Hyperstargate (docs/eras/maxplus.md, machine 17): its structure, its rows, the dial's 2^43 EU/t and the open plane, read from what
// the scripts register. The run-start check against the wireless network and the placement run in the in-game T1 (gg_test_maxplus_hyperstargate.js).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';
import { measure, violations } from '../lib/structure_quality.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const pack = path.resolve(here, '..', '..', '..', 'pack');
const run = runPackScripts(pack);
const G = run.global.grindless;
const HS = G.hyperstargate;
const recipes = run.docs.recipes.recipes;
const count = (s, c) => s.split(c).length - 1;

test('registers without errors: the machine, the dial type and the spent charge', () => {
  const mine = run.errors.filter((e) => /hyperstargate/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.ok(run.registry.machines.has('gtceu:hyperstargate'));
  assert.ok(run.registry.items.has('grindless:spent_dial_charge'));
  assert.equal(G.hyperstargateRows.skipped.length, 0);
});

test('the structure: 59 x 60 x 23, about 9,000 cells, a ring of 160 cells (151 ring blocks and 9 locked chevrons), four power units, the iris and the base', () => {
  const s = G.structures['gtceu:hyperstargate'];
  assert.ok(s, 'the structure is published');
  const m = measure(s);
  assert.deepEqual(m.bbox, [59, 60, 23]);
  assert.ok(m.cells >= 8500 && m.cells <= 9500, `cells ${m.cells}`);
  assert.deepEqual(violations(m), [], JSON.stringify(m));
  assert.ok(m.dominantShare <= 0.7 && m.blockTypes >= 5, JSON.stringify(m));
  const all = s.slices.flat().join('');
  assert.equal(count(all, 'R') + count(all, 'K'), 160);
  assert.equal(count(all, 'R'), 151);
  assert.equal(count(all, 'K'), 9);
  assert.equal(count(all, 'W'), 4);
  assert.equal(count(all, 'I'), 1);
  assert.equal(count(all, 'G'), 1);
  assert.equal(count(all, 'S'), 1);
  assert.equal(s.slices.at(-1)[1][29], 'S', 'the controller is in the middle of the front');
});

test('the body is the era\'s own casings and takes no horizon plate, containment plate or condensate', () => {
  const s = G.structures['gtceu:hyperstargate'];
  const blocks = Object.values(s.symbols).flatMap((y) => y.blocks || (y.options || []).flatMap((o) => o.blocks || []));
  for (const id of ['grindless:horizon_gate_casing', 'grindless:primordial_cryostat_casing', 'grindless:void_diamond_window', 'grindless:fe56_shield_casing']) assert.ok(blocks.includes(id), id);
  for (const id of blocks) assert.ok(!/horizon_plate|containment|condensate|atomic_casing|superconducting/.test(id) || /ring_block|locked_chevron/.test(id), id);
  const casing = ['horizon_gate_casing', 'primordial_cryostat_casing', 'void_diamond_window', 'fe56_shield_casing'];
  for (const c of casing) {
    const rows = recipes.filter((r) => r.i.endsWith('/' + c) && /^grindless:assembl/.test(r.i));
    assert.ok(rows.length >= 1, `${c} has a recipe`);
    assert.ok(!/horizon_plate|containment_plate|condensate/.test(JSON.stringify(rows.map((r) => r.j))), `${c} takes no horizon plate, containment plate or condensate`);
  }
});

test('the ring is a circle of radius 27 in z = 11 and its disc is air; the box is the disc\'s square with its centre and radius', () => {
  const s = G.structures['gtceu:hyperstargate'];
  let ring = 0;
  let air = 0;
  for (let x = 0; x < 59; x++) {
    for (let y = 0; y < 60; y++) {
      const d = Math.hypot(x - 29, y - 30);
      const ch = HS.cell(x, y, 11);
      if (Math.abs(d - 27) <= 0.5) { assert.ok(ch === 'R' || ch === 'K', `${x},${y}`); ring++; }
      else if (d < 26.5) { assert.equal(ch, '#', `${x},${y}`); air++; }
      else assert.ok(!['R', 'K', '#'].includes(ch), `${x},${y} ${ch}`);
    }
  }
  assert.equal(ring, 160);
  assert.ok(air >= 2100 && air <= 2300, `air ${air}`);
  assert.equal(s.slices.length, 23);
  const b = HS.box({ x: 100, y: 64, z: 200 }, 'north');
  assert.equal(JSON.stringify({ ...b, center: undefined }), JSON.stringify({ minX: 74, maxX: 126, minY: 67, maxY: 119, minZ: 211, maxZ: 211, center: undefined, radius: 26.5 }));
  assert.deepEqual(JSON.parse(JSON.stringify(b.center)), { x: 100.5, y: 93.5, z: 211.5 });
  const e = HS.box({ x: 100, y: 64, z: 200 }, 'east');
  assert.equal(e.maxX - e.minX, 0);
  assert.equal(e.maxZ - e.minZ, 52);
  assert.equal(e.center.z, 200.5);
});

test('the chevrons are 40 degrees apart from the top, the first at the top of the ring', () => {
  const at = [];
  for (let x = 0; x < 59; x++) for (let y = 0; y < 60; y++) if (HS.cell(x, y, 11) === 'K') at.push([x, y]);
  assert.equal(at.length, 9);
  assert.ok(at.some(([x, y]) => x === 29 && y === 57), 'the top chevron');
  const angles = at.map(([x, y]) => (Math.atan2(x - 29, y - 30) * 180 / Math.PI + 360) % 360).sort((a, b) => a - b);
  angles.forEach((a, i) => assert.ok(Math.abs(a - 40 * i) <= 3, `chevron ${i} at ${a}`));
});

test('the crossing follows the circle: the centre is inside, the square\'s corner is not', () => {
  const inside = G.ending.inside;
  for (const facing of ['north', 'east']) {
    const b = HS.box({ x: 100, y: 64, z: 200 }, facing);
    const flat = facing === 'north' ? { x: 1, z: 0 } : { x: 0, z: 1 };
    const at = (along, up) => inside(b, b.center.x + flat.x * along, b.center.y + up, b.center.z + flat.z * along);
    assert.ok(at(0, 0));
    assert.ok(at(25, 0) && at(0, -25) && at(0, 25));
    assert.ok(at(18, 18), 'inside the circle');
    assert.ok(!at(25, 25), 'the corner of the square is outside the circle');
    assert.ok(!at(27, 0));
  }
});

test('the dial: 2^43 EU/t for 1,200 t, the lock kept, a spent charge out', () => {
  const d = recipes.find((x) => x.i === 'grindless:hyperstargate_dial/hyperstargate_dial');
  assert.ok(d, 'the dial row exists');
  assert.equal(d.j.tickInputs.eu.reduce((s, e) => s + e.content, 0), 2 ** 43);
  assert.equal(G.hyperstargateRows.dialTicks, 1200);
  const text = JSON.stringify(d.j);
  assert.ok(text.includes('grindless:horizon_lock'));
  assert.ok(text.includes('grindless:spent_dial_charge'));
  assert.ok(text.includes('grindless:jacketed_condensate_cell'));
  const b = G.wireless.table.maxplusBank;
  assert.equal(BigInt(b.dialMultiplier) * 2n ** BigInt(b.dialExponent), 10555311626649600n);
});

test('the controller row and the recharge row exist and use the new item', () => {
  const c = recipes.find((x) => x.i === 'grindless:hyper_assembly_array/hyperstargate');
  assert.ok(c && JSON.stringify(c.j).includes('gtceu:hyperstargate'));
  const r = recipes.find((x) => x.i === 'grindless:condensate_refinery/recharge_dial_charge');
  assert.ok(r && JSON.stringify(r.j).includes('grindless:spent_dial_charge') && JSON.stringify(r.j).includes('grindless:jacketed_condensate_cell'));
});

test('the lang file is English only', () => {
  const file = path.join(pack, 'kubejs', 'client_scripts', 'grindless', 'maxplus_hyperstargate_lang.js');
  const text = fs.readFileSync(file, 'utf8');
  assert.ok(text.includes("'en_us'"));
  assert.ok(!/es_es/.test(text));
  for (const k of ['gtceu.hyperstargate_dial', 'block.gtceu.hyperstargate', 'item.grindless.spent_dial_charge']) assert.ok(text.includes(k), k);
});

test('the zone row is in the Sgr A* band', () => {
  const z = JSON.parse(fs.readFileSync(path.join(here, '..', '..', 'test', 'zones.json'), 'utf8'));
  const row = (z.zones || z).find((x) => x.id === 'maxplus_hyperstargate');
  assert.ok(row);
  assert.deepEqual(row.x, [46912, 46975]);
});
