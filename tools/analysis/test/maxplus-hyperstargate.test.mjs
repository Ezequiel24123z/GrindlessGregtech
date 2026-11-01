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

test('the structure: 41 x 43 x 9, a ring of 160 cells (151 ring blocks and 9 locked chevrons), four power units, the iris and the base', () => {
  const s = G.structures['gtceu:hyperstargate'];
  assert.ok(s, 'the structure is published');
  const m = measure(s);
  assert.deepEqual(m.bbox, [41, 43, 9]);
  assert.deepEqual(violations(m), [], JSON.stringify(m));
  const all = s.slices.flat().join('');
  assert.equal(count(all, 'R'), 151);
  assert.equal(count(all, 'K'), 9);
  assert.equal(count(all, 'W'), 4);
  assert.equal(count(all, 'I'), 1);
  assert.equal(count(all, 'G'), 1);
  assert.equal(count(all, 'S'), 1);
  assert.equal(s.slices.at(-1)[1][20], 'S', 'the controller is in the middle of the front');
});

test('the ring is open: its interior plane is air, and the box is 39 x 39 x 1', () => {
  for (let x = 1; x <= 39; x++) for (let y = 3; y <= 41; y++) assert.equal(HS.cell(x, y, 4), '#', `${x},${y}`);
  const b = HS.box({ x: 100, y: 64, z: 200 }, 'north');
  assert.equal(JSON.stringify(b), JSON.stringify({ minX: 81, maxX: 119, minY: 66, maxY: 104, minZ: 204, maxZ: 204 }));
  const e = HS.box({ x: 100, y: 64, z: 200 }, 'east');
  assert.equal(e.maxX - e.minX, 0);
  assert.equal(e.maxZ - e.minZ, 38);
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
