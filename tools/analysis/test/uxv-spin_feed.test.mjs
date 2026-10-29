// UXV-A2 (spin_feed): the feedstock rows of the older plants, the hot strip mill foils, the oxide charges, the seven bonded targets and
// the powder bed's extra rows, plus the items registered by startup_scripts/grindless/uxv/spin_feed.js.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const pack = path.resolve(here, '..', '..', '..', 'pack');
const run = runPackScripts(pack);
const SF = run.global.grindless.spinFeed;
const recipes = run.docs.recipes.recipes;
const fileOf = (r) => String(run.recipeFiles.get(r.i)).replace(/\\/g, '/');
const json = (...p) => JSON.parse(fs.readFileSync(path.join(pack, 'kubejs', 'data', 'grindless', 'tables', ...p), 'utf8'));
const producers = (id) => recipes.filter((r) => JSON.stringify(r.j.outputs || {}).includes(`"${id}"`));
const plain = (x) => JSON.parse(JSON.stringify(x));

const ITEMS = ['dysprosium_oxide_dust', 'dysprosium_dust', 'scandium_oxide_dust', 'strontium_carbonate_dust', 'magnesium_hydroxide_dust',
  'five_n_magnesia_dust', 'five_n_platinum', 'five_n_ruthenium', 'five_n_iridium', 'seven_n_tellurium', 'seven_n_germanium', 'bfo_fume', 'lpe_dross',
  'dysco3_charge_dust', 'ggg_charge_dust', 'srruo3_charge_dust', 'la_bfo_charge_dust', 'gum_metal_blend',
  'cofeb_am_powder', 'heusler_am_powder', 'mgo_am_powder', 'ruthenium_am_powder', 'srruo3_am_powder', 'la_bfo_am_powder',
  'spent_cofeb_target'];
for (const m of ['cofeb', 'heusler', 'mgo', 'saf', 'srruo3', 'la_bfo']) ITEMS.push(`near_net_${m}_blank`, `${m}_hip_blank`);

test('the stand-in runs the UXV-A2 scripts without errors', () => {
  const mine = run.errors.filter((e) => /spin_feed|cryogenic_plant|extraction_cascade|platinum_plant|fluorspar_kiln|europium|detectors|materials/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(SF.skipped), []);
});

test('37 items registered by the startup file, named in en_us and es_es', () => {
  assert.equal(ITEMS.length, 37);
  for (const n of ITEMS) {
    const id = `grindless:${n}`;
    const it = run.registry.items.get(id);
    assert.ok(it && /uxv[\\/]spin_feed\.js$/.test(String(it.file)), `${id} registered by spin_feed.js`);
    for (const lang of ['en_us', 'es_es']) {
      assert.ok(run.lang[lang][`item.grindless.${n}`], `${lang} names ${n}`);
      assert.ok(run.lang[lang][`tooltip.grindless.${n}.0`], `${lang} tooltip ${n}`);
    }
  }
});

test('hot rolling: tantalum foil and platinum sheet on circuits 5 and 6, water in and steam out', () => {
  assert.deepEqual(plain(SF.hotRolling.map((r) => [r.id, r.circuit])), [['grindless:hot_rolling/uxv/ta_foil', 5], ['grindless:hot_rolling/uxv/pt_sheet', 6]]);
  for (const r of SF.hotRolling) {
    const rec = recipes.find((x) => x.i === r.id);
    assert.ok(rec, r.id);
    assert.equal(rec.t, 'gtceu:hot_rolling');
    assert.equal(r.fluidsIn[0].amount * 160, r.fluidsOut[0].amount, 'the mill\'s 160 steam per water');
  }
  // circuits of every hot_rolling row that is not a generated one: no clash with 5 and 6
  const cs = recipes.filter((r) => r.t === 'gtceu:hot_rolling' && !r.i.startsWith('grindless:hot_rolling/ev/'))
    .map((r) => (r.j.inputs.item.find((x) => x.content.type === 'gtceu:circuit') || { content: {} }).content.configuration);
  assert.equal(new Set(cs).size, cs.length, `unique circuits ${cs}`);
});

test('charges, seven targets and powder bed rows exist with their ids and figures', () => {
  assert.deepEqual(plain(SF.charges.map((r) => r.path)), ['uxv/dysco3_charge', 'uxv/ggg_charge', 'uxv/srruo3_charge', 'uxv/la_bfo_charge', 'uxv/gum_metal_blend']);
  assert.deepEqual(plain(SF.targets.map((r) => r.itemsOut[0].id.split(':')[1])),
    ['cofeb_target', 'mgo_target', 'heusler_target', 'saf_target_set', 'srruo3_target', 'la_bfo_target', 'ta_seed_target']);
  for (const r of [...SF.charges, ...SF.targets, ...SF.powderBed]) assert.ok(recipes.some((x) => x.i === r.id), r.id);
  for (const r of SF.targets) assert.ok(r.itemsIn.some((x) => x.id === 'gtceu:copper_plate'), 'bonded to a copper plate');
  assert.deepEqual(plain(SF.powderBed.map((r) => r.circuit)), [15, 16]);
  const spent = SF.powderBed[0];
  assert.equal(spent.itemsOut.find((x) => x.id.endsWith('cofeb_am_powder')).count, 4, 'spent re-press returns 4 powder');
  const pb = recipes.filter((r) => r.t === 'gtceu:powder_bed_fusion');
  const circuitOf = (r) => (r.j.inputs.item.find((x) => x.content.type === 'gtceu:circuit') || { content: {} }).content.configuration;
  const cs = pb.map(circuitOf).filter((c) => c >= 9);
  assert.deepEqual([...cs].sort((a, b) => a - b), [9, 10, 11, 12, 13, 14, 15, 16], 'blank prints 9-14, re-press 15, sinter 16');
});

test('older rows written by UXV-A2: counts and circuits', () => {
  const by = (f) => recipes.filter((r) => fileOf(r).endsWith(f));
  const circ = (r) => (r.j.inputs.item.find((x) => x.content.type === 'gtceu:circuit') || { content: {} }).content.configuration;
  const cryo = by('ev/cryogenic_plant.js').filter((r) => /cryogenic_processing\/(triple_alpha_fuel|oxygen_burning_fuel|krypton_from_air|he_6n)$/.test(r.i));
  assert.equal(cryo.length, 4);
  const casc = by('ev/extraction_cascade.js').filter((r) => circ(r) >= 14 && circ(r) <= 21);
  assert.deepEqual(casc.map(circ).sort((a, b) => a - b), [14, 15, 16, 17, 18, 19, 20, 21]);
  const pt = recipes.filter((r) => r.i.includes('/uxv/') && fileOf(r).endsWith('ev/platinum_plant.js'));
  assert.deepEqual(pt.map(circ).sort((a, b) => a - b), [11, 12, 13, 14]);
  const kiln = recipes.filter((r) => fileOf(r).endsWith('iv/fluorspar_kiln.js') && /(five_n_magnesia|dysco3_calcine|srruo3_calcine|la_bfo_calcine|ggg_calcine|fluorine_from_hf)$/.test(r.i));
  assert.equal(kiln.length, 6);
  const eu = recipes.filter((r) => /valence_reduction\/dysprosium_/.test(r.i));
  assert.deepEqual(eu.map(circ).sort((a, b) => a - b), [11, 12]);
  const zr = recipes.filter((r) => /zone_refining\/seven_n_(tellurium|germanium)$/.test(r.i));
  assert.deepEqual(zr.map(circ).sort((a, b) => a - b), [8, 9]);
  const am = json('am_powders.json');
  assert.deepEqual(am.metals.slice(-6).map((m) => m.name), ['cofeb', 'heusler', 'mgo', 'ruthenium', 'srruo3', 'la_bfo']);
  assert.deepEqual(am.parts.slice(-6).map((p) => p.circuit), [9, 10, 11, 12, 13, 14]);
  for (const p of am.parts.slice(-6)) assert.ok(p.powderBack < p.powderIn && p.gtm === false);
});

test('"only from": nothing else in the pack makes these ids', () => {
  const only = {
    'grindless:ta_foil': 'hot_rolling/uxv/ta_foil', 'grindless:pt_sheet': 'hot_rolling/uxv/pt_sheet',
    'grindless:cofeb_target': 'assembler/uxv/cofeb_target', 'grindless:mgo_target': 'assembler/uxv/mgo_target',
    'grindless:heusler_target': 'assembler/uxv/heusler_target', 'grindless:saf_target_set': 'assembler/uxv/saf_target_set',
    'grindless:srruo3_target': 'assembler/uxv/srruo3_target', 'grindless:la_bfo_target': 'assembler/uxv/la_bfo_target',
    'grindless:ta_seed_target': 'assembler/uxv/ta_seed_target', 'grindless:gum_metal_billet': 'powder_bed_fusion/uxv/gum_metal_sinter',
    'grindless:seven_n_tellurium': 'zone_refining/seven_n_tellurium', 'grindless:seven_n_germanium': 'zone_refining/seven_n_germanium',
    'grindless:dysprosium_dust': 'valence_reduction/dysprosium_reduction',
    'grindless:five_n_platinum': 'uxv/five_n_platinum', 'grindless:five_n_ruthenium': 'uxv/five_n_ruthenium',
    'grindless:five_n_iridium': 'uxv/five_n_iridium',
    'gtceu:dysco3_dust': 'dysco3_calcine', 'gtceu:ggg_dust': 'ggg_calcine'
  };
  for (const [id, tail] of Object.entries(only)) {
    const ps = producers(id);
    assert.ok(ps.length >= 1, `${id} has a producer`);
    assert.ok(ps.every((r) => r.i.includes(tail)), `${id} only from ${tail}: ${ps.map((r) => r.i)}`);
  }
  for (const id of ['grindless:spent_cofeb_target']) assert.deepEqual(producers(id).map((r) => r.i), [], `${id} is made by nobody in A2 (A3/A6)`);
});
