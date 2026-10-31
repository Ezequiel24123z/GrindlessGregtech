// UHV-A5 (docs/eras/uhv.md, "A5. Power devices and photovoltaics"): the SiC device fab's and the solar array fab's rows of
// power_devices.json, the side rows on GTM's cutter and alloy smelter, and the MOCVD reactor's two UHV rows (uv/photonics.js, circuits
// 7-8), checked without Minecraft by static recipe lookup in the stand-in (lib/kubejs_static.mjs). T1: none (UV-A1's table-driven
// machines, proof reuse).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const pack = path.join(root, 'pack');
const kube = path.join(pack, 'kubejs');
const tables = path.join(kube, 'data', 'grindless', 'tables');
const T = JSON.parse(fs.readFileSync(path.join(tables, 'power_devices.json'), 'utf8'));
const run = runPackScripts(pack);
const plain = (x) => JSON.parse(JSON.stringify(x, (k, v) => (typeof v === 'function' ? undefined : v)));
const G = run.global.grindless;
const PD = plain(G.uhvPowerDevices);
const P = plain(G.photonics);
const startupOf = (...p) => fs.readFileSync(path.join(kube, 'startup_scripts', 'grindless', ...p), 'utf8');
const serverOf = (...p) => fs.readFileSync(path.join(kube, 'server_scripts', 'grindless', ...p), 'utf8');

const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => (typeof x === 'string' ? x : x.id));
const inputs = (r) => ids(r.itemsIn).concat(ids(r.kept), ids(r.fluidsIn), ids(r.charge));
const outputs = (r) => ids(r.itemsOut).concat(ids(r.fluidsOut));
const rowsOf = (type) => T.types[type].recipes;
const by = (type, name) => {
  const r = rowsOf(type).find((x) => x.name === name);
  assert.ok(r, `${type}/${name}`);
  return r;
};
const dump = run.docs.recipes.recipes;
const madeBy = (id) => dump.filter((r) => JSON.stringify(r.j.outputs || {}).includes(`"${id}"`)).map((r) => r.i);
const circuitOf = (r) => ((r.j.inputs || {}).item || []).filter((i) => i.content && i.content.type === 'gtceu:circuit').map((i) => i.content.configuration);

// every recipe-producing row of every table, as [table:where, recipe]
function allRows() {
  const out = [];
  for (const f of fs.readdirSync(tables).filter((n) => n.endsWith('.json'))) {
    const walk = (node, where) => {
      if (Array.isArray(node)) node.forEach((x, i) => walk(x, `${where}[${i}]`));
      else if (node && typeof node === 'object') {
        if (Array.isArray(node.itemsOut) || Array.isArray(node.fluidsOut)) out.push([`${f}:${where}`, node]);
        for (const [k, v] of Object.entries(node)) if (k !== 'itemsOut' && k !== 'fluidsOut') walk(v, `${where}.${k}`);
      }
    };
    walk(JSON.parse(fs.readFileSync(path.join(tables, f), 'utf8')), '');
  }
  return out;
}
const producers = (id) => allRows().filter(([, r]) => outputs(r).includes(id));

function keysOf(r) {
  const k = new Set(r.circuit ? [`circuit:${r.circuit}`] : []);
  ids(r.itemsIn).concat(ids(r.kept)).forEach((id) => k.add(`i:${id}`));
  ids(r.fluidsIn).concat(ids(r.charge)).forEach((id) => k.add(`f:${id}`));
  return k;
}

test('the scripts load: every row made with its circuit, nothing skipped, no clash, both controllers', () => {
  const mine = run.errors.filter((e) => /uhv\/power_devices|uv\/photonics/.test(e.file || ''));
  assert.deepEqual(mine, []);
  const rows = Object.entries(T.types).flatMap(([type, t]) => t.recipes.map((r) => ({ type, ...r })));
  assert.equal(PD.recipes.length, rows.length);
  assert.deepEqual(PD.skipped, []);
  assert.deepEqual(PD.clashes, []);
  assert.deepEqual(PD.controllerRecipes, ['grindless:assembly_line/sic_device_fab', 'grindless:assembly_line/solar_array_fab']);
  const made = new Map(dump.map((r) => [r.i, r]));
  for (const r of rows) {
    const id = `grindless:${r.type}/${r.name}`;
    assert.ok(made.has(id), id);
    assert.deepEqual(circuitOf(made.get(id)), r.circuit ? [r.circuit] : [], id);
    assert.equal(made.get(id).t, `gtceu:${r.type}`, id);
  }
  // the EMI line: the loader writes each row's name under the type's data key
  assert.ok(serverOf('uhv', 'power_devices.js').includes('recipe.addDataString(rec.dataKey, rec.name)'));
  for (const id of PD.controllerRecipes) assert.ok(made.has(id), id);
});

test('one recipe per lookup path: unique circuits, no subset clash', () => {
  for (const [type, want] of [['silicon_carbide', [1, 2, 3, 4, 5, 6]], ['space_photovoltaics', [1, 2, 3]]]) { // OpV-A2 appended SiC c6 (the GaN MMIC)
    const rs = rowsOf(type);
    assert.deepEqual(rs.map((r) => r.circuit), want, type);
    const ks = rs.map(keysOf);
    const sub = (a, b) => [...a].every((k) => b.has(k));
    for (let i = 0; i < ks.length; i++) {
      for (let j = i + 1; j < ks.length; j++) assert.ok(!sub(ks[i], ks[j]) && !sub(ks[j], ks[i]), `${type}: ${rs[i].name} / ${rs[j].name}`);
    }
  }
  for (const type of ['cutter', 'alloy_smelter']) for (const r of rowsOf(type)) assert.equal(r.circuit, 0, r.name);
});

test('the recipes fit the machines\' slots (startup maxIO; the circuit takes an item slot)', () => {
  const startup = startupOf('uhv', 'power_devices.js');
  const io = {
    silicon_carbide: { itemsIn: 4, itemsOut: 1, fluidsIn: 3, fluidsOut: 1 },
    space_photovoltaics: { itemsIn: 5, itemsOut: 3, fluidsIn: 1, fluidsOut: 1 }
  };
  for (const [type, m] of Object.entries(io)) {
    assert.ok(startup.includes(`maxIO: { itemsIn: ${m.itemsIn}, itemsOut: ${m.itemsOut}, fluidsIn: ${m.fluidsIn}, fluidsOut: ${m.fluidsOut} }`), type);
    for (const r of rowsOf(type)) {
      assert.ok(r.itemsIn.length + r.kept.length + 1 <= m.itemsIn, `${r.name} items in`);
      assert.ok(r.fluidsIn.length + r.charge.length <= m.fluidsIn, `${r.name} fluids in`);
      assert.ok(r.itemsOut.length <= m.itemsOut, `${r.name} items out`);
      assert.ok(r.fluidsOut.length <= m.fluidsOut, `${r.name} fluids out`);
    }
  }
});

test('SiC power modules and SiC mirror blanks come only from the SiC device fab', () => {
  assert.deepEqual(producers('grindless:sic_power_module').map(([w]) => w), ['power_devices.json:.types.silicon_carbide.recipes[3]']);
  assert.deepEqual(madeBy('grindless:sic_power_module'), ['grindless:silicon_carbide/sic_power_modules']);
  // A6's Casimir array strips worn cavity stacks back to blanks for re-coating (uhv.md: worn stacks -> plates re-coated)
  assert.deepEqual(producers('grindless:sic_mirror_blank').map(([w]) => w),
    ['antimatter.json:.types.casimir_cavity.recipes[2]', 'power_devices.json:.types.silicon_carbide.recipes[4]']);
  assert.deepEqual(madeBy('grindless:sic_mirror_blank').sort(), ['grindless:casimir_cavity/strip_stack', 'grindless:silicon_carbide/sic_mirror_blank']);
  // the SiC line in order: boule -> wafers (cutter) -> epi -> A4's aluminium implant -> anneal -> modules
  assert.deepEqual(madeBy('grindless:sic_boule'), ['grindless:silicon_carbide/sic_boule']);
  assert.deepEqual(madeBy('grindless:sic_wafer'), ['grindless:cutter/sic_wafers']);
  assert.deepEqual(madeBy('grindless:sic_epi_wafer'), ['grindless:silicon_carbide/sic_epi']);
  assert.ok(inputs(by('silicon_carbide', 'sic_epi')).includes('grindless:sic_wafer'));
  assert.ok(producers('grindless:implanted_sic_wafer').some(([w, r]) => w.startsWith('photonics.json') && inputs(r).includes('grindless:sic_epi_wafer')));
  assert.ok(inputs(by('silicon_carbide', 'sic_anneal')).includes('grindless:implanted_sic_wafer'));
  assert.ok(inputs(by('silicon_carbide', 'sic_power_modules')).includes('grindless:sic_device_wafer'));
  // the epi's hydrogen carrier comes back, never more than went in (the silane route brings no chlorine)
  const epi = by('silicon_carbide', 'sic_epi');
  const h = epi.fluidsOut.find((f) => f.id === 'gtceu:hydrogen');
  assert.ok(h && h.amount <= epi.fluidsIn.find((f) => f.id === 'gtceu:hydrogen').amount);
  // A7's tether climber and GEO lift take the module
  const users = dump.filter((r) => JSON.stringify(r.j.inputs || {}).includes('"grindless:sic_power_module"')).map((r) => r.i);
  assert.ok(madeBy('grindless:tether_climber').some((i) => users.includes(i)), `climber: ${users}`);
  assert.ok(users.length >= 4, `${users}`);
});

test('the IMM lift-off returns the GaAs substrate: 7 wafers back of 8, the worn one as dust for the UV boule', () => {
  const lo = by('space_photovoltaics', 'imm_lift_off');
  const n = lo.itemsIn.find((x) => x.id === 'grindless:imm_epi_wafer').count;
  assert.equal(lo.itemsOut.find((x) => x.id === 'grindless:imm_film').count, n);
  assert.equal(lo.itemsOut.find((x) => x.id === 'grindless:gallium_arsenide_wafer').count, n - 1);
  assert.equal(lo.itemsOut.find((x) => x.id === 'gtceu:gallium_arsenide_dust').count, 1);
  for (const x of lo.itemsOut) assert.ok(x.chance === undefined || x.chance === 10000, x.id);
  // the dust goes back into UV's GaAs boule; the release layer's arsine to the MOCVD reactor
  assert.ok(P.side.some((r) => r.name === 'gallium_arsenide_boule' && ids(r.itemsIn).includes('gtceu:gallium_arsenide_dust')));
  assert.ok(outputs(lo).includes('gtceu:arsine'));
  assert.ok(P.recipes.concat(P.uhvRows).some((r) => ids(r.fluidsIn).includes('gtceu:arsine')));
  // both arrays carry a SiC power module and cerium coverglass; the red-tuned one adds UV's InGaAs epi wafer
  for (const name of ['imm_array', 'red_tuned_array']) {
    const r = by('space_photovoltaics', name);
    for (const id of ['grindless:imm_film', 'grindless:cerium_coverglass', 'grindless:sic_power_module']) assert.ok(inputs(r).includes(id), `${name}: ${id}`);
  }
  assert.ok(inputs(by('space_photovoltaics', 'red_tuned_array')).includes('grindless:ingaas_epi_wafer'));
  assert.deepEqual(madeBy('grindless:imm_solar_array'), ['grindless:space_photovoltaics/imm_array']);
  assert.deepEqual(madeBy('grindless:red_tuned_solar_array'), ['grindless:space_photovoltaics/red_tuned_array']);
  assert.deepEqual(madeBy('grindless:cerium_coverglass'), ['grindless:alloy_smelter/cerium_coverglass']);
});

test('the MOCVD reactor\'s two UHV rows (circuits 7-8), published apart so UV\'s six stay as they were', () => {
  const uv = P.recipes.filter((r) => r.type === 'mocvd');
  assert.deepEqual(uv.map((r) => r.circuit), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(P.uhvRows.map((r) => [r.name, r.type, r.circuit]), [['imm_epi', 'mocvd', 7], ['nbn_sic_plate', 'mocvd', 8]]);
  assert.deepEqual(P.clashes, []);
  assert.deepEqual(P.skipped, []);
  const all = uv.concat(P.uhvRows);
  assert.equal(new Set(all.map((r) => r.circuit)).size, all.length);
  const made = new Map(dump.map((r) => [r.i, r]));
  for (const [id, c] of [['grindless:mocvd/imm_epi', 7], ['grindless:mocvd/nbn_sic_plate', 8]]) {
    assert.ok(made.has(id), id);
    assert.deepEqual(circuitOf(made.get(id)), [c], id);
  }
  const imm = P.uhvRows[0];
  assert.ok(ids(imm.itemsIn).includes('grindless:gallium_arsenide_wafer'));
  assert.deepEqual(ids(imm.itemsOut), ['grindless:imm_epi_wafer']);
  assert.ok(imm.eut <= 491520, 'runs on the UV reactor');
  const nbn = P.uhvRows[1];
  assert.ok(ids(nbn.itemsIn).includes('grindless:sic_mirror_blank'));
  assert.deepEqual(madeBy('grindless:nbn_coated_sic_plate'), ['grindless:mocvd/nbn_sic_plate']);
  assert.deepEqual(madeBy('grindless:imm_epi_wafer'), ['grindless:mocvd/imm_epi']);
});

test('controllers and structures: own shapes, 7x5x7 with one controller', () => {
  const sts = Object.values(run.docs.structures.structures || {});
  for (const m of ['sic_device_fab', 'solar_array_fab']) {
    const st = sts.find((x) => x.id === `gtceu:${m}`);
    assert.ok(st, m);
    assert.equal(st.slices.length, 7, `${m}: depth`);
    for (const s of st.slices) {
      assert.equal(s.length, 5, `${m}: height`);
      for (const row of s) assert.equal(row.length, 7, `${m}: width`);
    }
    const ctl = Object.entries(st.symbols).filter(([, v]) => v.kind === 'controller').map(([k]) => k);
    assert.equal(ctl.length, 1, m);
    assert.equal(st.slices.flat().join('').split(ctl[0]).length - 1, 1, `${m}: one controller`);
  }
});

test('no UEV input, and every lang key and texture the package needs', () => {
  for (const r of Object.values(T.types).flatMap((t) => t.recipes).concat(P.uhvRows)) {
    for (const id of inputs(r).concat(outputs(r))) assert.ok(!/(^|[:_])uev(_|$)/.test(id.split(':')[1] || ''), `${r.name}: ${id}`);
  }
  const lang = fs.readFileSync(path.join(kube, 'client_scripts', 'grindless', 'uhv_power_devices_lang.js'), 'utf8');
  // OpV-A2's SiC c6 keeps its EMI line in its own lang file
  const opvLang = fs.readFileSync(path.join(kube, 'client_scripts', 'grindless', 'opv_circuits_lang.js'), 'utf8');
  for (const [type, t] of Object.entries(T.types)) {
    if (!t.dataKey) continue;
    for (const r of t.recipes) {
      const k = `'gtceu.recipe.${t.dataKey}.${r.name}'`;
      assert.ok(lang.includes(k) || (/^OpV-/.test(r._why || '') && opvLang.includes(k)), `${type}/${r.name}`);
    }
  }
  const keys = ['block.gtceu.sic_device_fab', 'block.gtceu.solar_array_fab', 'gtceu.silicon_carbide', 'gtceu.space_photovoltaics'];
  for (const m of ['sic_device_fab', 'solar_array_fab']) keys.push(`grindless.machine.${m}.tooltip.0`);
  for (const name of Object.keys(PD.items)) keys.push(`item.grindless.${name}`, `tooltip.grindless.${name}.0`, `tooltip.grindless.${name}.1`);
  for (const k of keys) assert.ok(lang.includes(`'${k}'`), k);
  assert.ok(lang.includes("'es_es'") || lang.includes('es_es'));
  const tex = path.join(kube, 'assets', 'grindless', 'textures');
  for (const name of Object.keys(PD.items)) assert.ok(fs.existsSync(path.join(tex, 'item', `${name}.png`)), name);
  for (const m of ['sic_device_fab', 'solar_array_fab']) {
    for (const f of ['overlay_front.png', 'overlay_front_active.png', 'overlay_front_active_emissive.png']) {
      assert.ok(fs.existsSync(path.join(tex, 'block', 'multiblock', m, f)), `${m}/${f}`);
    }
  }
});
