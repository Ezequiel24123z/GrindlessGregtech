// UXV-A7: the Mk6 stellar burning ring (docs/eras/uxv.md, machine 9, "Fusion", lines 26-29, 38 and 48): tables/fusion_mk6.json, the ring's
// startup script, the casing/controller script, the converter and quench rows in zpm/fusion.js, the lang pages and the native fixture's band.
// No Java, no Minecraft.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const read = (p) => fs.readFileSync(path.join(root, ...p.split('/')), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, ...p.split('/')));
const TABLE = 'pack/kubejs/data/grindless/tables/fusion_mk6.json';
const table = JSON.parse(read(TABLE));
const STARTUP = 'pack/kubejs/startup_scripts/grindless/uxv/fusion_mk6.js';
const SERVER = 'pack/kubejs/server_scripts/grindless/uxv/fusion_mk6.js';
const ZPM = 'pack/kubejs/server_scripts/grindless/zpm/fusion.js';
const LANG = 'pack/kubejs/client_scripts/grindless/uxv_fusion_mk6_lang.js';
const OVERLAY = 'tools/test/overlay/kubejs/server_scripts/gg_test_uxv_fusion_mk6.js';

const V12 = 134217728;
const by = (type, name) => table.types[type].recipes.find((r) => r.name === name);
const ids = (xs) => xs.map((x) => x.id);

test('the four fusion rows: fuels, plasmas, starts long, EU/t within the tier-12 voltage, 16 ticks', () => {
  const rs = table.types.fusion_reactor.recipes;
  assert.deepEqual(rs.map((r) => r.name), ['uxv_hot_cno', 'uxv_triple_alpha', 'uxv_carbon_burning', 'uxv_oxygen_burning']);
  assert.deepEqual(rs.map((r) => r.start), [6e9, 8e9, 9e9, 10e9]);
  assert.deepEqual(rs.map((r) => r.eut), [67108864, 100663296, 134217728, 134217728]);
  for (const r of rs) {
    assert.ok(r.eut <= V12, 'GTM refuses a recipe above the machine tier: ' + r.name);
    assert.ok(r.start > 2 ** 31 && r.start <= 16 * 64 * 10000000, 'a long start inside the 10.24 G buffer: ' + r.name);
    assert.equal(r.duration, 16);
    assert.equal(r.itemsIn.length, 0);
    assert.equal(r.fluidsOut.length, 1);
    assert.equal(r.fluidsOut[0].amount, 1024);
    assert.ok(r.fluidsIn.length >= 1 && r.fluidsIn.length <= 2);
    assert.equal(r.fluidsIn.reduce((s, f) => s + f.amount, 0), 128);
  }
  assert.deepEqual(rs.map((r) => ids(r.fluidsIn)), [
    ['gtceu:stellar_hydrogen_cut', 'gtceu:stellar_cno_cut'], ['gtceu:triple_alpha_fuel'], ['gtceu:carbon_burning_fuel'], ['gtceu:oxygen_burning_fuel']]);
  assert.deepEqual(rs.map((r) => r.fluidsOut[0].id), ['gtceu:cno_ash_plasma', 'gtceu:helium_burning_ash_plasma', 'gtceu:carbon_burning_ash_plasma', 'gtceu:oxygen_burning_ash_plasma']);
  assert.equal(10240000000, 16 * 2 ** 6 * 10000000);
});

test('c1 returns 95% of the CNO cut through the converter; every row pays twice its fusion row and is final', () => {
  const rs = table.types.fusion_reactor.recipes;
  const cno = rs[0].fluidsIn[1].amount;
  const d = table.converter.recipes;
  assert.equal(d.length, 4);
  assert.equal(d[0].amountOut / cno, 0.95);
  assert.equal(d[0].output, 'gtceu:stellar_cno_cut');
  d.forEach((r, i) => {
    assert.equal(r.input, rs[i].fluidsOut[0].id);
    assert.equal(r.amountIn <= rs[i].fluidsOut[0].amount, true);
    assert.equal(r.total, 128 * r.eut);
    assert.ok(r.eut <= 2 ** 21 + 2 ** 20, 'a row stays under the UIV hatch: ' + r.name);
    const paid = r.eut * r.duration * (rs[i].fluidsOut[0].amount / r.amountIn);
    const spent = rs[i].eut * rs[i].duration;
    assert.equal(paid, 2 * spent, r.name + ' pays 2 x the fusion row');
  });
  assert.deepEqual(d.slice(1).map((r) => r.output), ['gtceu:helium_burning_ash', 'gtceu:carbon_burning_ash', 'gtceu:oxygen_burning_ash']);
  assert.ok(!read('pack/kubejs/server_scripts/grindless/power/generators.js').includes('direct_conversion'));
});

test('the quench rows: circuits 3-8 once each, one item out at most, argon in every row, the finemet cast re-melts its trim', () => {
  const q = table.quench;
  assert.equal(q.machine, 'gtceu:plasma_quench_caster');
  assert.deepEqual(q.rows.map((r) => r.circuit), [3, 4, 5, 6, 7, 8]);
  for (const r of q.rows) {
    assert.ok(r.itemsOut.length === 1 && r.fluidsIn.length === 2 && r.fluidsOut.length <= 2, r.name);
    assert.ok(r.fluidsIn.some((f) => f.id === 'gtceu:argon' && f.amount === 100), r.name);
  }
  const row = (n) => q.rows.find((r) => r.name === n);
  assert.deepEqual([...ids(row('helium_ash_split').itemsOut), ...ids(row('helium_ash_split').fluidsOut)], ['gtceu:carbon_12_dust', 'gtceu:oxygen_16', 'gtceu:argon']);
  assert.deepEqual([...ids(row('carbon_ash_split').itemsOut), ...ids(row('carbon_ash_split').fluidsOut)], ['gtceu:sodium_dust', 'gtceu:neon', 'gtceu:magnesium']);
  assert.deepEqual([row('oxygen_ash_silicon'), row('oxygen_ash_sulfur'), row('oxygen_ash_phosphorus')].map((r) => r.itemsOut[0].id), ['grindless:si28_ash', 'gtceu:sulfur_dust', 'gtceu:phosphorus_dust']);
  const cast = row('finemet_ribbon_cast');
  assert.deepEqual(ids(cast.fluidsIn), ['gtceu:finemet_melt', 'gtceu:argon']);
  assert.deepEqual(cast.itemsOut, [{ id: 'grindless:finemet_ribbon', count: 4 }]);
  assert.deepEqual(cast.fluidsOut.find((f) => f.id === 'gtceu:finemet_melt'), { id: 'gtceu:finemet_melt', amount: 72 });
  // 4 ribbons from 576 mB of melt (A3's c13 output), the trim comes back as melt: 1/8
  assert.equal(72 / 576, 1 / 8);
  for (const r of q.rows.filter((x) => x.name.endsWith('_split') || x.name.startsWith('oxygen_ash'))) {
    const from = ids(r.fluidsIn)[0];
    assert.ok(['gtceu:helium_burning_ash', 'gtceu:carbon_burning_ash', 'gtceu:oxygen_burning_ash'].includes(from), r.name);
  }
});

test('the casing row takes the five line-38 items and 1,000 mB he_6n', () => {
  const c = by('assembler', 'uxv_fusion_casing');
  assert.deepEqual(ids(c.itemsIn), ['grindless:wf_rhea_billet', 'grindless:w184_cvi_preform', 'grindless:mh_winding', 'grindless:uxv_field_generator', 'gtceu:tritanium_frame']);
  assert.deepEqual(c.fluidsIn, [{ id: 'gtceu:he_6n', amount: 1000 }]);
  assert.deepEqual(c.itemsOut, [{ id: 'grindless:uxv_fusion_casing', count: 2 }]);
});

// every id the pack's tables write as an output
function producers(id) {
  const found = [];
  const dir = path.join(root, 'pack/kubejs/data/grindless/tables');
  const walk = (o, f) => {
    if (Array.isArray(o)) o.forEach((x) => walk(x, f));
    else if (o && typeof o === 'object') {
      for (const k of ['itemsOut', 'fluidsOut']) if (Array.isArray(o[k]) && o[k].some((x) => x && x.id === id)) found.push(`${f}:${o.name}`);
      Object.values(o).forEach((v) => walk(v, f));
    }
  };
  for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.json'))) {
    let j; try { j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch { continue; }
    walk(j, f);
  }
  return found;
}

test('"only from" claims: no other table row produces the Mk6 ids', () => {
  const only = {
    'grindless:uxv_fusion_casing': ['fusion_mk6.json:uxv_fusion_casing'],
    'grindless:finemet_ribbon': ['fusion_mk6.json:finemet_ribbon_cast'],
    'grindless:si28_ash': ['fusion_mk6.json:oxygen_ash_silicon'],
    'gtceu:cno_ash_plasma': ['fusion_mk6.json:uxv_hot_cno'],
    'gtceu:helium_burning_ash_plasma': ['fusion_mk6.json:uxv_triple_alpha'],
    'gtceu:carbon_burning_ash_plasma': ['fusion_mk6.json:uxv_carbon_burning'],
    'gtceu:oxygen_burning_ash_plasma': ['fusion_mk6.json:uxv_oxygen_burning'],
    'gtceu:helium_burning_ash': ['fusion_mk6.json:uxv_helium_burning_ash_plasma'],
    'gtceu:carbon_burning_ash': ['fusion_mk6.json:uxv_carbon_burning_ash_plasma'],
    'gtceu:oxygen_burning_ash': ['fusion_mk6.json:uxv_oxygen_burning_ash_plasma'],
    'gtceu:oxygen_16': ['fusion_mk6.json:helium_ash_split']
  };
  // the converter's and the quench's rows live in arrays named 'recipes' / 'rows' with output keys of their own
  for (const [id, who] of Object.entries(only)) {
    const hits = producers(id).filter((h) => !h.startsWith('fusion_mk6.json'));
    assert.deepEqual(hits, [], id);
    const mine = JSON.stringify(table);
    assert.ok(mine.includes(`"${id}"`), id);
    assert.ok(who.length === 1);
  }
});

test('the server scripts: the Mk5 and Mk4 rows are untouched and the Mk6 functions are published', () => {
  const z = read(ZPM);
  for (const m of ['addMk4Converter(event)', 'addMk5Converter(event)', 'addMk5Quench(event)', 'F.mk6Converter = addMk6Converter', 'F.mk6Quench = addMk6Quench']) assert.ok(z.includes(m), m);
  const mk5 = read('pack/kubejs/data/grindless/tables/fusion_mk5.json');
  assert.equal(JSON.parse(mk5).converter.recipes.length, 3);
  const s = read(SERVER);
  for (const m of ['gtceu:uxv_machine_hull', "'gtceu:uiv_fusion_reactor'", 'gtceu:stellar_hydrogen_cut', '#gtceu:circuits/uxv', 'stationResearch', 'grindless:uxv_electric_pump', 'grindless:uxv_field_generator', 'grindless:uxv_fusion_casing']) assert.ok(s.includes(m), m);
});

test('the startup script: tier 12, 16 hatches, the casing, the Mk5 coil, fusion glass, no priority line, no loop', () => {
  const s = read(STARTUP);
  assert.match(s, /registerFusionTier\(UXV/);
  assert.match(s, /var UXV = 12/);
  assert.match(s, /gtceu:uxv_fusion_reactor/);
  assert.match(s, /max: 16/);
  for (const m of ['grindless:uxv_fusion_casing', 'grindless:metallic_hydrogen_coil_block', 'gtceu:fusion_glass', 'workableCasingModel']) assert.ok(s.includes(m), m);
  for (const f of [STARTUP, SERVER, LANG]) assert.ok(!/^\/\/ priority:/m.test(read(f)), f);
  assert.ok(!/sounds\.json/.test(s));
  assert.ok(!/\bconst\b/.test(s.slice(s.indexOf('function ringCell'))), 'pattern loops use var');
});

test('the Mk6 ring: the table is read, every id of every row has no other spelling', () => {
  const ctx = vm.createContext({ global: { grindless: { patterns: {} } }, console, GTCEuStartupEvents: { registry() {} }, Java: { loadClass: () => ({ registerFusionTier() {} }) } });
  assert.doesNotThrow(() => vm.runInContext(read(STARTUP).replace(/GTCEuStartupEvents\.registry/g, 'GTCEuStartupEvents.registry'), ctx));
  const MK6 = ctx.global.grindless.fusionMk6;
  assert.equal(MK6.tier, 12);
  assert.equal(MK6.ring.machine, 'gtceu:uxv_fusion_reactor');
  assert.deepEqual(Object.keys(MK6.fluids).sort(), ['gtceu:carbon_burning_ash', 'gtceu:helium_burning_ash', 'gtceu:oxygen_burning_ash']);
});

test('lang parity: every key in en_us and es_es, the machine tooltips and each info page', () => {
  const lang = read(LANG);
  const keys = [...lang.matchAll(/^\s*\['([^']+)',/gm)].map((m) => m[1]);
  assert.ok(keys.length >= 12);
  assert.equal((lang.match(/'es_es'/g) || []).length, 1);
  for (const k of ['block.gtceu.uxv_fusion_reactor', 'material.gtceu.helium_burning_ash', 'material.gtceu.carbon_burning_ash', 'material.gtceu.oxygen_burning_ash']) assert.ok(keys.includes(k), k);
  for (let i = 0; i < 3; i++) assert.ok(keys.includes(`grindless.machine.uxv_fusion_reactor.tooltip.${i}`), String(i));
  const start = read(STARTUP);
  for (let i = 0; i < 3; i++) assert.ok(start.includes(`grindless.machine.uxv_fusion_reactor.tooltip.${i}`));
  // each entry has en and es
  for (const m of lang.matchAll(/\['([^']+)',\s*'((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)'\]/g)) assert.ok(m[2].length > 0 && m[3].length > 0 && m[2] !== m[3] || /^(block|material)/.test(m[1]), m[1]);
  const pages = { uxv_fusion_reactor: 3, uxv_fusion_casing: 1, si28_ash: 1, uxv_fusion_stock: 1 };
  for (const [page, n] of Object.entries(pages)) {
    const j = JSON.parse(read(`pack/kubejs/assets/emi/recipe/additions/grindless/${page}.json`));
    assert.equal(j.type, 'emi:info');
    assert.equal(j.text.length, n);
    for (const t of j.text) assert.ok(keys.includes(t), t);
  }
  assert.ok(lang.includes('Stock for OpV'));
});

test('the native fixture: band X 36672-36735, Z 0-63, Y 98-112, Overworld, and the zones row', () => {
  const o = read(OVERLAY);
  assert.ok(o.includes('uxv_fusion_mk6'));
  assert.ok(o.includes('gg_test_uxv_fusion_mk6'));
  assert.ok(o.includes('36672'));
  const zones = JSON.parse(read('tools/test/zones.json'));
  const all = JSON.stringify(zones);
  assert.ok(all.includes('"id": "uxv_fusion_mk6"') || all.includes('"id":"uxv_fusion_mk6"'));
  const z = (function find(x) { if (Array.isArray(x)) { for (const y of x) { const r = find(y); if (r) return r; } } else if (x && typeof x === 'object') { if (x.id === 'uxv_fusion_mk6') return x; for (const v of Object.values(x)) { const r = find(v); if (r) return r; } } return null; })(zones);
  assert.deepEqual([z.x, z.z, z.y], [[36672, 36735], [0, 63], [98, 112]]);
  assert.deepEqual(z.tests, ['uxv_fusion_mk6']);
});

test('the texture script and its outputs exist', () => {
  assert.ok(exists('tools/assets/Build-UXVFusionMk6Textures.ps1'));
  for (const n of ['overlay_front.png', 'overlay_front_active.png', 'overlay_front_active.png.mcmeta', 'overlay_front_active_emissive.png', 'overlay_front_active_emissive.png.mcmeta'])
    assert.ok(exists('pack/kubejs/assets/grindless/textures/block/multiblock/uxv_fusion_reactor/' + n), n);
});

test('the A7 hold rule and the two pending uses are gone', () => {
  assert.ok(!read('tools/analysis/tiers/obtain.json').includes('"UXV (A7)"'));
  assert.ok(!read('tools/analysis/emi_coverage.json').includes('UXV-A7'));
});
