// D2-NIOBIUM (docs/eras/lines-ev-zpm.md I4): the kiln's pyrochlore digestion and the two EBF rows, checked by static source reading.
// T1 is none.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const iv = path.resolve(here, '..', '..', '..', 'pack', 'kubejs', 'server_scripts', 'grindless', 'iv');
const niobium = fs.readFileSync(path.join(iv, 'niobium.js'), 'utf8');
const kiln = fs.readFileSync(path.join(iv, 'fluorspar_kiln.js'), 'utf8');

test('the pyrochlore electrolysis is removed', () => {
  assert.match(niobium, /gtceu:electrolyzer\/decomposition_electrolyzing_pyrochlore/);
  assert.match(niobium, /event\.remove\(\{ id: N\.removed \}\)/);
});

test('kiln row: 11 pyrochlore hold 2 Nb, out 2 NbOF3 + 6 fluorite (2 CaF2), 9 HF in, water balances (Ca2Nb2O6F + 9 HF -> 2 NbOF3 + 2 CaF2 + 4.5 H2O)', () => {
  const m = /name: 'niobium_oxyfluoride_from_pyrochlore',\s*itemIn: \{ id: 'gtceu:pyrochlore_dust', count: (\d+) \}, fluidIn: \{ id: 'gtceu:hydrofluoric_acid', amount: (\d+) \},\s*itemOut: \{ id: 'grindless:niobium_oxyfluoride_dust', count: (\d+) \}, itemOut2: \{ id: 'gcyr:fluorite_dust', count: (\d+) \},\s*fluidOut: \{ id: 'minecraft:water', amount: (\d+) \},\s*eut: (\d+)/.exec(kiln);
  assert.ok(m, 'row present');
  assert.deepEqual(m.slice(1, 6).map(Number), [11, 9000, 2, 6, 4500]);
  assert.ok(Number(m[6]) <= 8192);
  assert.match(kiln, /addUevRows\(event, D2_ROWS\)/);
  const startup = fs.readFileSync(path.join(iv, '..', '..', '..', 'startup_scripts', 'grindless', 'iv', 'fluorspar_kiln.js'), 'utf8');
  assert.match(startup, /FK\.maxIO = \{ itemsIn: 1, itemsOut: 2, fluidsIn: 2, fluidsOut: 1 \}/);
});

test('EBF rows conserve Nb, Al, Ta, Na and run at IV voltage or below', () => {
  const rows = [...niobium.matchAll(/name: '(\w+)',\s*temp: (\d+), eut: (\d+), duration: (\d+),\s*itemsIn: \[(.*)\],\s*itemsOut: \[(.*)\]/g)];
  assert.equal(rows.length, 2);
  const parse = (s) => Object.fromEntries([...s.matchAll(/id: '([^']+)', count: (\d+)/g)].map((x) => [x[1], Number(x[2])]));
  for (const r of rows) assert.ok(Number(r[3]) <= 8192, r[1]);
  const nb = parse(rows[0][5]), nbo = parse(rows[0][6]);
  // 3 Nb2O5 (1 dust per formula, 2 Nb) -> 6 Nb; 10 Al -> 5 Al2O3 = 25 sapphire dust (5 atoms each)
  assert.equal(nb['gtceu:niobium_pentoxide_dust'] * 2, nbo['gtceu:niobium_dust']);
  assert.equal(nb['gtceu:aluminium_dust'] * 5 / 2, nbo['gtceu:sapphire_dust']);
  const ta = parse(rows[1][5]), tao = parse(rows[1][6]);
  assert.equal(ta['grindless:k2taf7_dust'], tao['gtceu:tantalum_dust']);
  // 1 K2TaF7 + 5 Na -> Ta + 2 KF + 5 NaF
  assert.equal(ta['gtceu:sodium_dust'], 5 * ta['grindless:k2taf7_dust']);
  assert.equal(tao['grindless:alkali_fluoride_dust'], 7 * ta['grindless:k2taf7_dust']);
});

test('the cascade still feeds both rows (c12 Nb2O5, c9 K2TaF7)', () => {
  const cascade = fs.readFileSync(path.join(iv, '..', 'ev', 'extraction_cascade.js'), 'utf8');
  assert.match(cascade, /name: 'columbite_niobium_split'/);
  assert.match(cascade, /name: 'tantalum_cut'/);
});
