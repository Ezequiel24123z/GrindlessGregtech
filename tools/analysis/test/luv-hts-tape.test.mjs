// D2-TAPE (docs/eras/lines-ev-zpm.md, line L1): HTS tape from belt nickel to the coated conductor.
// Mond chemistry: server_scripts/grindless/luv/asteroid_belt.js; stages: data/grindless/tables/coated_conductor_line.json; ids: startup luv/hts_tape.js.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const kube = path.join(root, 'pack', 'kubejs');
const read = (...p) => fs.readFileSync(path.join(kube, ...p), 'utf8');
const belt = read('server_scripts', 'grindless', 'luv', 'asteroid_belt.js');
const startup = read('startup_scripts', 'grindless', 'luv', 'hts_tape.js');
const lang = read('client_scripts', 'grindless', 'luv_hts_tape_lang.js');
const rows = JSON.parse(read('data', 'grindless', 'tables', 'coated_conductor_line.json')).recipes;
const row = (name) => rows.find((r) => r.name === name);
const num = (src, re) => Number(re.exec(src)[1]);

test('the Mond mass balance: 16 crushed give 24 iron + 4 nickel + 1 cobalt + 1 concentrate, and the CO is never used up', () => {
  const co = num(belt, /co: (\d+), crude: \d+/);
  const crude = num(belt, /crude: (\d+),\n/);
  const split = /split: \{ crude: (\d+), ni: (\d+), fe: (\d+)/.exec(belt).slice(1).map(Number);
  const ni = /nickel: \{ fluid: (\d+), dust: (\d+), co: (\d+)/.exec(belt).slice(1).map(Number);
  const fe = /iron: \{ fluid: (\d+), dust: (\d+), co: (\d+)/.exec(belt).slice(1).map(Number);
  assert.equal(split[0], crude, 'the tower takes all the crude');
  assert.equal(split[1] + split[2], crude, 'the tower gives back every mB');
  assert.equal(ni[0], split[1]);
  assert.equal(fe[0], split[2]);
  assert.equal(ni[2] + fe[2], co, 'the decompositions return exactly the CO the carbonylation took');
  assert.equal(num(belt, /\['gtceu:iron_dust', (\d+)\]/) + fe[1], 24);
  assert.equal(ni[1], 4);
  assert.match(belt, /\['gtceu:cobalt_dust', 1\], \['grindless:asteroid_pgm_concentrate', 1\]/);
  assert.doesNotMatch(belt, /asteroid_processing\('grindless:mond/, 'the processor type has no fluid output');
  assert.match(belt, /alloy: \{ ni: 19, w: 1, out: 20,/);
});

test('the coated conductor line: 20 tapes ride six rows, in order, each one a different ingredient set', () => {
  const chain = ['nickel_tungsten_substrate', 'textured_tape', 'buffered_tape', 'coated_tape', 'capped_tape', 'itbtc_coated_conductor'].map(row);
  chain.forEach((r) => assert.ok(r, 'row missing'));
  assert.deepEqual(chain[0].itemsIn, [{ id: 'gtceu:nickel_tungsten_dust', count: 20 }]);
  const out = (r) => r.itemsOut[0];
  chain.forEach((r) => assert.equal(out(r).count, 20));
  for (let i = 1; i < chain.length; i++) {
    assert.ok(chain[i].itemsIn.some((x) => x.id === out(chain[i - 1]).id && x.count === 20), `${chain[i].name} takes ${out(chain[i - 1]).id}`);
  }
  assert.deepEqual(chain.map((r) => out(r).id), ['grindless:nickel_tungsten_tape', 'grindless:textured_nickel_tungsten_tape', 'grindless:buffered_tape',
    'grindless:coated_tape', 'grindless:capped_tape', 'grindless:itbtc_coated_conductor']);
  const ids = (r) => r.itemsIn.map((x) => x.id).concat(r.fluidsIn.map((x) => x.id)).sort().join('|');
  assert.equal(new Set(chain.map((r) => r.circuit + ids(r))).size, chain.length);
  const fluids = (r) => r.fluidsIn.map((x) => x.id);
  assert.deepEqual(fluids(row('textured_tape')), ['gtceu:hydrogen', 'gtceu:argon']);
  assert.deepEqual(row('buffered_tape').itemsIn.map((x) => x.id).slice(1), ['grindless:yttrium_oxide_dust', 'grindless:ysz_powder', 'gtceu:cerium_dust']);
  assert.ok(row('coated_tape').itemsIn.some((x) => x.id === 'gtceu:indium_tin_barium_titanium_cuprate_dust'));
  assert.ok(fluids(row('coated_tape')).includes('gtceu:oxygen'));
  assert.deepEqual(fluids(row('capped_tape')), ['gtceu:silver', 'gtceu:oxygen']);
  assert.ok(row('itbtc_coated_conductor').itemsIn.some((x) => x.id === 'gtceu:copper_foil'));
  const sizes = rows.filter((r) => r.circuit <= 9).map((r) => r.itemsIn.length + 1);
  assert.ok(Math.max(...sizes) <= 5, 'the widened type holds five item inputs');
});

test('hts_tape.js registers every new id once, widens the type, and the lang names them all', () => {
  const items = ['textured_nickel_tungsten_tape', 'buffered_tape', 'coated_tape', 'capped_tape'];
  const materials = ['crude_metal_carbonyl', 'nickel_tetracarbonyl', 'nickel_tungsten'];
  for (const n of items) {
    assert.match(startup, new RegExp(`\\b${n}: 64`));
    assert.match(lang, new RegExp(`'item.grindless.' \\+ i\\[0\\]|\\['${n}',`));
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'item', n + '.png')), n + ' texture');
  }
  for (const n of materials) {
    assert.match(startup, new RegExp(`\\b${n}: \\{`));
    assert.match(lang, new RegExp(`material.gtceu.${n}'`));
  }
  assert.match(startup, /ITEMS_IN = 5/);
  assert.match(startup, /setMaxIOSize\(io.itemsIn, io.itemsOut, io.fluidsIn, io.fluidsOut\)/);
  for (const n of ['textured_tape', 'buffered_tape', 'coated_tape', 'capped_tape']) assert.ok(lang.includes(`grindless_coated_conductor.${n}'`), n);
  assert.doesNotMatch(startup + lang, /es_es/);
});
