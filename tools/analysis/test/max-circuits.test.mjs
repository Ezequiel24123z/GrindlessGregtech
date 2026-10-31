// MAX-A1 (circuits): the GTM laser-engraver row of server_scripts/grindless/max/circuits.js, the MOCVD rows of uv/photonics.js (MAX_A1_ROWS)
// and the rows this package appended to older machines' tables (marked MAX-A1 in their own files), ending in the supracausal mainframe join.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const pack = path.resolve(here, '..', '..', '..', 'pack');
const kube = path.join(pack, 'kubejs');
const run = runPackScripts(pack);
const MC = run.global.grindless.maxCircuits;
const recipes = run.docs.recipes.recipes;
const fileOf = (r) => String(run.recipeFiles.get(r.i)).replace(/\\/g, '/');
const find = (id) => recipes.find((r) => r.i === id);
const has = (side, id) => (r) => JSON.stringify(r.j[side] || {}).includes(`"${id}"`);
const producers = (id) => recipes.filter(has('outputs', id));
const plain = (x) => JSON.parse(JSON.stringify(x));
const table = (f) => JSON.parse(fs.readFileSync(path.join(kube, 'data', 'grindless', 'tables', f), 'utf8'));

// [table, type, name, circuit, the script that loads it]
const TABLE_ROWS = [
  ['crystals.json', 'crystal_growth', 'ppln_boule', 28, 'uhv/crystals.js'],
  ['crystals.json', 'crystal_growth', 'quartz_crystal_wafer', 29, 'uhv/crystals.js'],
  ['tfln_femtosecond.json', 'ion_slicing', 'ppln_thin_film_wafer', 9, 'uiv/tfln_femtosecond.js'],
  ['tfln_femtosecond.json', 'ion_slicing', 'transducer_wafer', 10, 'uiv/tfln_femtosecond.js'],
  ['tfln_femtosecond.json', 'femtosecond_writing', 'squeezer_waveguide_die', 7, 'uiv/tfln_femtosecond.js'],
  ['photonics_uev.json', 'snspd_fabrication', 'squeezed_light_chip', 7, 'uev/photonics.js'],
  ['photonics_uev.json', 'photonic_integration', 'supracausal_mainframe', 9, 'uev/photonics.js'],
  ['beuv_stm.json', 'beuv_lithography', 'metalens_wafer', 10, 'uiv/beuv_stm.js'],
  ['spin_deposition.json', 'mtj_sputtering', 'coated_metalens', 13, 'uxv/spin_deposition.js'],
  ['spin_deposition.json', 'mtj_sputtering', 'nb_coplanar_film', 14, 'uxv/spin_deposition.js'],
  ['earth_orbit.json', 'quantum_degenerate_gas', 'tweezer_calibrated_lens', 4, 'uev/earth_orbit.js'],
  ['photonics.json', 'molecular_beam_epitaxy', 'piezo_optomech_layer', 12, 'uhv/photonics.js'],
  ['memories_cryostat.json', 'nuclear_demagnetisation', 'cryo_photonic_interposer', 8, 'uiv/memories_cryostat.js']
];
const MOCVD = [['pump_laser_bonded_die', 23], ['aln_on_si_wafer', 24]];
const tableId = ([, type, name]) => (type === 'crystal_growth' ? `grindless:${type}/${type}/${name}` : `grindless:${type}/${name}`);
const JOIN = 'grindless:photonic_integration/supracausal_mainframe';
// the item of each line step: made by one row, used by the next (the join consumes the three line ends)
const CHAIN = ['ppln_boule', 'quartz_crystal_wafer', 'ppln_thin_film_wafer', 'transducer_wafer', 'squeezer_waveguide_die', 'pump_laser_bonded_die',
  'aln_on_si_wafer', 'squeezed_light_chip', 'metalens_wafer', 'coated_metalens', 'nb_coplanar_film', 'tweezer_calibrated_lens', 'tweezer_array_die',
  'piezo_optomech_layer', 'cryo_photonic_interposer'];

test('the stand-in runs the MAX-A1 script without errors and skips nothing', () => {
  const mine = run.errors.filter((e) => /max[\\/]circuits|max_circuits/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(MC.skipped), []);
  assert.deepEqual(plain(MC.recipes), ['grindless:laser_engraver/tweezer_array_die']);
  assert.equal(MC.joinRecipe, JOIN);
  assert.equal(MC.joinOutput, 'gtnn:supracausal_mainframe');
});

test('the new file is not stamped with a priority line by this package', () => {
  assert.ok(fs.existsSync(path.join(kube, 'server_scripts', 'grindless', 'max', 'circuits.js')));
  assert.ok(fs.existsSync(path.join(kube, 'client_scripts', 'grindless', 'max_circuits_lang.js')));
});

test('every row exists, in the script that owns its machine', () => {
  const own = [['grindless:laser_engraver/tweezer_array_die', 'max/circuits.js'], ...MOCVD.map(([n]) => [`grindless:mocvd/${n}`, 'uv/photonics.js'])];
  for (const [id, file] of own.concat(TABLE_ROWS.map((r) => [tableId(r), r[4]]))) {
    const r = find(id);
    assert.ok(r, `${id} exists`);
    assert.ok(fileOf(r).endsWith(file), `${id} made by ${file}, not ${fileOf(r)}`);
  }
});

test('the table rows: marked MAX-A1, on the contract circuits (all <= 32), and no other MAX-A1 row', () => {
  const byTable = {};
  for (const row of TABLE_ROWS) (byTable[row[0]] = byTable[row[0]] || []).push(row);
  for (const [f, rows] of Object.entries(byTable)) {
    const t = table(f);
    for (const [, type, name, circuit] of rows) {
      const r = t.types[type].recipes.find((x) => x.name === name);
      assert.ok(r, `${f} ${type}/${name}`);
      assert.match(r._why || '', /^MAX-A1/, `${type}/${name} marked`);
      assert.equal(r.circuit, circuit, `${type}/${name} circuit`);
      assert.ok(circuit >= 1 && circuit <= 32, `${type}/${name} circuit within GTM's 0-32`);
      // crystal growth may repeat a circuit only when the item ids differ (MAX-CS); elsewhere a number is used once
      const clash = t.types[type].recipes.filter((x) => x.circuit === circuit);
      assert.equal(clash.length, 1, `${type} c${circuit} used once`);
    }
    const marked = Object.entries(t.types).flatMap(([type, tt]) => tt.recipes.filter((x) => /^MAX-A1/.test(x._why || '')).map((x) => `${type}/${x.name}`));
    assert.deepEqual(marked.sort(), rows.map(([, type, name]) => `${type}/${name}`).sort(), f);
  }
});

test('the MOCVD rows: c23-24, one fluid set within the reactor slots, no circuit repeated', () => {
  const rows = recipes.filter((r) => /^grindless:mocvd\//.test(r.i));
  for (const [name, circuit] of MOCVD) {
    const r = find(`grindless:mocvd/${name}`);
    assert.ok(r, name);
    assert.ok(JSON.stringify(r.j.inputs).includes(`"configuration":${circuit}`), `${name} c${circuit}`);
    assert.ok(circuit <= 32);
    assert.ok(r.j.inputs.item.length <= 4 && r.j.inputs.fluid.length <= 3 && r.j.outputs.fluid.length <= 2, `${name} within the reactor slots`);
    assert.equal(rows.filter((x) => JSON.stringify(x.j.inputs).includes(`"configuration":${circuit},`) || JSON.stringify(x.j.inputs).includes(`"configuration":${circuit}}`)).length, 1, `mocvd c${circuit} used once`);
  }
});

test('the lines chain: every step is made, and used by the next row or the join', () => {
  for (const n of CHAIN) assert.ok(producers(`grindless:${n}`).length >= 1, `${n} has a producer`);
  const consumed = (id) => recipes.some(has('inputs', id));
  for (const n of CHAIN.filter((x) => x !== 'tweezer_array_die')) assert.ok(consumed(`grindless:${n}`), `${n} has a consumer`);
  assert.ok(consumed('grindless:tweezer_array_die'), 'tweezer_array_die is used by the join');
});

test('the join: one photonic hall row, circuit 9, the only maker of gtnn:supracausal_mainframe', () => {
  const hall = table('photonics_uev.json').types.photonic_integration.recipes;
  const r = hall.find((x) => x.name === 'supracausal_mainframe');
  assert.ok(r);
  assert.equal(r.circuit, 9);
  assert.equal(new Set(hall.map((x) => x.circuit)).size, hall.length, 'no circuit twice');
  const ids = r.itemsIn.map((x) => x.id);
  for (const p of ['grindless:squeezed_light_chip', 'grindless:tweezer_array_die', 'grindless:cryo_photonic_interposer', 'grindless:tetron_array']) assert.ok(ids.includes(p), p);
  assert.ok(r.itemsIn.length + 1 <= 8 && r.itemsOut.length <= 2 && (r.fluidsIn || []).length <= 1, 'within the hall slots');
  assert.deepEqual(r.itemsOut, [{ id: 'gtnn:supracausal_mainframe', count: 1 }]);
  assert.deepEqual(plain(producers('gtnn:supracausal_mainframe').map((x) => x.i)), [JOIN]);
  for (const p of r.itemsIn) assert.ok(producers(p.id).length >= 1 || /^gtceu:|^#/.test(p.id) || p.id === 'grindless:tetron_array', `${p.id} has a producer`);
});

test('every MAX-A1 row is at most VA[MAX] = 2013265920 EU/t (max.md:160)', () => {
  for (const [f, type, name] of TABLE_ROWS) {
    const r = table(f).types[type].recipes.find((x) => x.name === name);
    assert.ok(r.eut <= 2013265920, `${type}/${name} eut ${r.eut}`);
  }
  assert.equal(table('photonics_uev.json').types.photonic_integration.recipes.find((x) => x.name === 'supracausal_mainframe').eut, 2013265920);
  for (const id of [JOIN, 'grindless:laser_engraver/tweezer_array_die', ...MOCVD.map(([n]) => `grindless:mocvd/${n}`)]) {
    const e = find(id).j.tickInputs.eu[0].content;
    assert.ok(e <= 2013265920, `${id} ${e}`);
  }
});

test('every data-keyed row has its EMI line in both languages', () => {
  for (const [, type, name] of TABLE_ROWS) {
    const k = `gtceu.recipe.grindless_${type}.${name}`;
    for (const lang of ['en_us', 'es_es']) assert.ok(run.lang[lang][k], `${lang} ${k}`);
  }
});
