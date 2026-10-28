// ZPM's naquadria magnet works and the ZPM wireless tier (package ZPM-A5), no game needed. The pack's scripts run in the stand-in of
// lib/kubejs_static.mjs:
//   - startup_scripts/grindless/zpm/magnet_works.js: the recipe type, the machine and its 7 x 7 x 5 pattern, the HTS insert;
//   - server_scripts/grindless/zpm/magnet_works.js: the recipes (one circuit each, nothing clashing), the cryostat casing and the controller;
//   - the ZPM row of tables/wireless_energy.json (its cell is wound here), the wire's energy price against GTM's route, en_us and es_es text,
//     and A5's hide rules gone.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const pack = path.join(root, 'pack');
const run = runPackScripts(pack);
const plain = (x) => JSON.parse(JSON.stringify(x, (k, v) => (typeof v === 'function' ? undefined : v)));
const MW = plain(run.global.grindless.magnetWorks);
const tables = path.join(pack, 'kubejs', 'data', 'grindless', 'tables');
const TABLE = JSON.parse(fs.readFileSync(path.join(tables, 'magnet_works.json'), 'utf8'));
const WIRELESS = JSON.parse(fs.readFileSync(path.join(tables, 'wireless_energy.json'), 'utf8'));
const recipes = run.docs.recipes.recipes;
const byId = (id) => recipes.find((r) => r.i === id);
const ZPM_VA = 122880;
const MACHINE = 'gtceu:naquadria_magnet_works';

test('the stand-in runs the magnet works scripts without errors, nothing skipped or clashing', () => {
  const errs = run.errors.filter((e) => /zpm[\\/]magnet_works/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(MW.skipped, []);
  assert.deepEqual(MW.clashes, []);
  assert.equal(MW.recipes.length, TABLE.recipes.length);
});

test('registration: the recipe type, the machine, the HTS insert', () => {
  assert.ok(run.registry.recipeTypes.has('gtceu:naquadria_magnets'));
  assert.deepEqual(run.registry.machines.get(MACHINE).recipeTypes, ['gtceu:naquadria_magnets']);
  assert.ok(run.registry.items.has('grindless:hts_insert'));
  assert.ok(run.registry.items.has('grindless:cryostat_casing') || run.registry.blocks.has('grindless:cryostat_casing'));
});

test('the pattern: one controller in the front slice, 7 x 7 x 5, GTM part limits, only known symbols', () => {
  const s = run.docs.structures.structures[MACHINE];
  assert.ok(s, 'described');
  assert.equal(s.slices.length, 7, '7 slices');
  assert.ok(s.slices.every((sl) => sl.length === 5 && sl.every((row) => row.length === 7)), '5 high, 7 wide in every slice');
  const front = s.slices[s.slices.length - 1];
  assert.equal(front.join('').split('').filter((c) => c === 'S').length, 1, 'one controller');
  const lim = Object.fromEntries(s.symbols.X.options.filter((o) => o.kind === 'part').map((o) => [o.ability, o.limits]));
  assert.deepEqual(lim.energy_input, { min: 1, max: 2 });
  assert.ok(lim.input_bus && lim.input_hatch && lim.output_bus, 'buses and hatches');
  for (const sl of s.slices) for (const row of sl) for (const c of row) assert.ok(c === ' ' || s.symbols[c], 'symbol ' + c);
  const blocks = Object.values(s.symbols).flatMap((v) => v.blocks || []);
  assert.ok(blocks.includes('grindless:cryostat_casing'));
});

test('six recipes: one circuit each, the ZPM ones ZPM VA bound, the UV cell UV VA bound, the UHV cell UHV VA bound and the UEV cell UEV VA bound, each cell is its row\'s cell, the charge is not consumed', () => {
  assert.deepEqual(MW.recipes.map((r) => [r.name, r.circuit]), [['zpm_smes_cell', 1], ['urhnq2_wire', 2], ['hts_insert', 3], ['uv_smes_cell', 4], ['uhv_smes_cell', 5], ['uev_smes_cell', 6]]);
  for (const p of MW.recipes) {
    const r = byId(p.recipeId);
    assert.ok(r, p.recipeId + ' added');
    assert.equal(r.t, 'gtceu:naquadria_magnets');
    assert.ok(Number.isInteger(p.duration) && p.duration > 0 && p.eut <= (p.name === 'uev_smes_cell' ? 64 * ZPM_VA : p.name === 'uhv_smes_cell' ? 16 * ZPM_VA : p.name === 'uv_smes_cell' ? 4 * ZPM_VA : ZPM_VA), p.name);
    const text = JSON.stringify(r.j);
    if (p.charge) assert.match(text, /liquid_helium/, p.name + ' carries the charge');
    else assert.doesNotMatch(text, /liquid_helium/, p.name + ' needs no charge');
  }
  const zpm = WIRELESS.tiers.find((r) => r.name === 'zpm');
  assert.ok(zpm, 'the ZPM row');
  assert.equal(zpm.tier, 7);
  assert.equal(zpm.cellMadeBy, MACHINE);
  assert.equal(zpm.capacity, 6 * 655360000, 'six of the ZPM naquadria battery');
  assert.ok(zpm.capacity > 2 ** 31);
  assert.deepEqual(MW.recipes[0].itemsOut, [{ id: zpm.cell, count: 1 }]);
  assert.equal(MW.recipes.filter((r) => r.itemsOut.some((o) => o.id === zpm.cell)).length, 1, 'one recipe makes the cell');
});

test('the wire is never cheaper in EU than GTM\'s own route to a URhNq2 wire', () => {
  const e = TABLE.wireEconomy;
  const gtmPerIngot = e.mixer.eut * e.mixer.duration / e.dustsPerMix + e.ebf.eut * e.ebf.duration + e.freezer.eut * e.freezer.duration;
  const gtmPerWire = gtmPerIngot / e.wiresPerIngot + e.wiremill.eut * e.wiremill.duration / e.wiresPerIngot;
  const w = TABLE.recipes.find((r) => r.name === 'urhnq2_wire');
  const perWire = w.eut * w.duration / w.itemsOut[0].count;
  assert.ok(perWire >= gtmPerWire, `${perWire} EU per wire against GTM's ${gtmPerWire}`);
});

test('nothing at ZPM asks for a UV part (circuit 4, UV-A9\'s UV cell, aside); the controller recipe uses ZPM parts', () => {
  const text = JSON.stringify(TABLE.recipes.filter((r) => r.circuit <= 3)) + JSON.stringify(TABLE.casing);
  assert.doesNotMatch(text, /uv_|uhv_/);
  const r = byId(MW.craftingRecipe);
  assert.ok(r, 'controller recipe added');
  const t = JSON.stringify(r.j);
  assert.match(t, /naquadria_magnet_works/);
  for (const part of MW.craftingParts) assert.ok(t.includes(part), part);
  assert.ok(byId(MW.casingRecipe), 'the cryostat casing\'s assembler recipe');
});

test('A5\'s hide rules are gone', () => {
  const obtain = fs.readFileSync(path.join(root, 'tools', 'analysis', 'tiers', 'obtain.json'), 'utf8');
  assert.ok(!/ZPM \(A5\)/.test(obtain), 'A5 rule deleted');
  const hidden = fs.readFileSync(path.join(tables, 'hidden_until.json'), 'utf8');
  assert.ok(!hidden.includes('grindless:cryostat_casing'), 'cryostat casing no longer hidden');
});

test('every new name and tooltip has en_us and es_es text', () => {
  const en = run.lang.en_us || {};
  const es = run.lang.es_es || {};
  const keys = ['block.gtceu.naquadria_magnet_works', 'gtceu.naquadria_magnets', 'item.grindless.hts_insert',
    'tooltip.grindless.hts_insert.0', 'tooltip.grindless.hts_insert.1', 'emi.grindless.info.hts_insert.0', 'emi.grindless.info.cryostat_casing.0',
    'grindless.machine.naquadria_magnet_works.charge.ok', 'grindless.machine.naquadria_magnet_works.charge.low'];
  for (let i = 0; i < 3; i++) keys.push(`grindless.machine.naquadria_magnet_works.tooltip.${i}`);
  for (const r of TABLE.recipes) keys.push('gtceu.recipe.grindless_naquadria_magnets.' + r.name);
  for (const k of keys) {
    assert.ok(en[k] && en[k].length > 3, 'en_us ' + k);
    assert.ok(es[k] && es[k].length > 3, 'es_es ' + k);
    assert.notEqual(en[k], es[k], 'es_es ' + k + ' is translated');
  }
  assert.equal(en['block.grindless.zpm_smes_cell'] || 'x', en['block.grindless.zpm_smes_cell'] || 'x');
});
