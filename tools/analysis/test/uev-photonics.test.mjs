// UEV-A6 (docs/eras/uev.md, "A6. Photonics"): the SNSPD foundry, the van der Waals stacker and the photonic integration hall, lines 18-22 and 27,
// checked without Minecraft by static recipe lookup. The runtime half (GT--'s optical computer is gone, ours is found) is T1: gg_test_uev_photonics.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const kube = path.join(root, 'pack', 'kubejs');
const tables = path.join(kube, 'data', 'grindless', 'tables');
const read = (p) => fs.readFileSync(p, 'utf8');
const T = JSON.parse(read(path.join(tables, 'photonics_uev.json')));
const OLD = JSON.parse(read(path.join(tables, 'photonics.json')));
const startup = read(path.join(kube, 'startup_scripts', 'grindless', 'uev', 'photonics.js'));
const server = read(path.join(kube, 'server_scripts', 'grindless', 'uev', 'photonics.js'));
const lang = read(path.join(kube, 'client_scripts', 'grindless', 'uev_photonics_lang.js'));

const GTM = new Set(['cutter', 'electric_blast_furnace', 'chemical_reactor', 'assembler']);
const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => x.id);
const inputs = (r) => ids(r.itemsIn).concat(ids(r.kept), ids(r.fluidsIn), ids(r.charge));
const outputs = (r) => ids(r.itemsOut).concat(ids(r.fluidsOut));
const rowsOf = (tbl, file) => Object.entries(tbl.types).flatMap(([type, t]) => t.recipes.map((r) => ({ file, type, ...r })));
const mine = rowsOf(T, 'photonics_uev.json');
const all = mine.concat(rowsOf(OLD, 'photonics.json'));
const producers = (id) => all.filter((r) => outputs(r).includes(id));
const row = (type, name) => {
  const r = mine.find((x) => x.type === type && x.name === name);
  assert.ok(r, `${type}/${name}`);
  return r;
};

test('every recipe has a unique name, a positive EU/t and duration; circuits are unique inside a type', () => {
  for (const [type, t] of Object.entries(T.types)) {
    assert.equal(new Set(t.recipes.map((r) => r.name)).size, t.recipes.length, type);
    const circuits = t.recipes.map((r) => r.circuit).filter((c) => c > 0);
    assert.equal(new Set(circuits).size, circuits.length, type);
    for (const r of t.recipes) {
      assert.ok(Number.isInteger(r.eut) && r.eut > 0 && Number.isInteger(r.duration) && r.duration > 0, r.name);
      assert.ok(GTM.has(type) ? r.circuit >= 0 && r.circuit <= 32 : r.circuit >= 1 && r.circuit <= 32, `${type}/${r.name}: circuit`);
    }
  }
});

test("one recipe per lookup path: no recipe's ingredients are a subset of another's in its type", () => {
  const keys = (r) => new Set(inputs(r).concat([`circuit:${r.circuit}`]));
  for (const [type, t] of Object.entries(T.types)) {
    const ks = t.recipes.map(keys);
    for (let i = 0; i < ks.length; i++) {
      for (let j = i + 1; j < ks.length; j++) {
        const sub = (a, b) => [...a].every((k) => b.has(k));
        assert.ok(!sub(ks[i], ks[j]) && !sub(ks[j], ks[i]), `${type}: ${t.recipes[i].name} / ${t.recipes[j].name}`);
      }
    }
  }
});

test('the three machines and their types are registered; every data-keyed recipe has its EMI line in en_us and es_es', () => {
  for (const m of ['snspd_foundry', 'vdw_stacker', 'photonic_integration_hall']) assert.ok(startup.includes(`'${m}'`), m);
  for (const k of ['snspd_fabrication', 'vdw_assembly', 'photonic_integration']) assert.ok(startup.includes(`'${k}'`), k);
  for (const [type, t] of Object.entries(T.types)) {
    if (!t.dataKey) continue;
    for (const r of t.recipes) assert.ok(lang.includes(`'gtceu.recipe.${t.dataKey}.${r.name}'`), `${t.dataKey}.${r.name}`);
  }
  for (const k of ['grindless_molecular_beam_epitaxy.inas_quantum_dots', 'grindless_photonic_foundry.sin_waveguide_anneal', 'grindless_synchrotron.sin_waveguide_lithography']) {
    assert.ok(lang.includes(`gtceu.recipe.${k}'`), k);
  }
});

test('only from there: SNSPDs, QD sources and SDDs come only from their lines', () => {
  assert.deepEqual(producers('grindless:snspd').map((r) => `${r.type}/${r.name}`), ['snspd_fabrication/cool_and_package']);
  assert.deepEqual(producers('grindless:qd_source').map((r) => `${r.type}/${r.name}`), ['assembler/qd_source_mount']);
  assert.deepEqual(producers('grindless:sdd').map((r) => `${r.type}/${r.name}`), ['assembler/sdd_metallise']);
  for (const [id, from] of [['grindless:snspd', 'snspd_die'], ['grindless:qd_source', 'micropillar_wafer'], ['grindless:sdd', 'sdd_annealed_wafer']]) {
    assert.ok(inputs(producers(id)[0]).includes(`grindless:${from}`), `${id} needs ${from}`);
    assert.ok(producers(`grindless:${from}`).length >= 1, `${from} has a producer`);
  }
  // no server script outside this package makes them
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(path.join(dir, d.name)) : d.name.endsWith('.js') ? [path.join(dir, d.name)] : []));
  for (const f of walk(path.join(kube, 'server_scripts'))) {
    if (f.endsWith(path.join('uev', 'photonics.js'))) continue;
    assert.ok(!/itemOutputs\([^)]*grindless:(snspd|qd_source|sdd)\b/.test(read(f)), `${path.relative(kube, f)} outputs a detector`);
  }
});

test('exactly one recipe makes gtnn:optical_computer: the hall, circuit 3; GT--s own is removed; the mainframe is untouched', () => {
  const p = producers('gtnn:optical_computer');
  assert.equal(p.length, 1);
  assert.equal(`${p[0].type}/${p[0].name}/${p[0].circuit}`, 'photonic_integration/optical_computer/3');
  assert.ok(inputs(p[0]).includes('gtnn:optical_assembly') && inputs(p[0]).includes('grindless:quantum_photonic_chip'));
  assert.match(server, /event\.remove\(\{ output: COMPUTER, not: \{ id: COMPUTER_RECIPE \} \}\)/);
  assert.ok(server.includes("COMPUTER = 'gtnn:optical_computer'") && server.includes("COMPUTER_RECIPE = 'grindless:photonic_integration/optical_computer'"));
  assert.ok(!/optical_mainframe/.test(server.replace(/^\/\/.*$/gm, '')) && !all.some((r) => outputs(r).concat(inputs(r)).includes('gtnn:optical_mainframe')));
});

test('arsine is contained: no recipe of the package outputs or vents it, and the MBE row uses it all up', () => {
  for (const r of all) assert.ok(!outputs(r).includes('gtceu:arsine'), `${r.file}:${r.type}/${r.name} outputs arsine`);
  const mbe = all.find((r) => r.type === 'molecular_beam_epitaxy' && r.name === 'inas_quantum_dots');
  assert.equal(mbe.circuit, 3);
  assert.ok(ids(mbe.fluidsIn).includes('gtceu:arsine'));
  assert.ok(!ids(mbe.charge).includes('gtceu:arsine'), 'arsine is consumed, not a kept charge');
});

test('the UEV parts get recipes (never re-registered) and the older rows exist at their circuits', () => {
  for (const n of ['uev_sensor', 'uev_emitter', 'uev_electric_pump', 'uev_conveyor_module', 'uev_electric_piston']) {
    const r = row('assembler', n);
    assert.deepEqual(ids(r.itemsOut), [`grindless:${n}`]);
    assert.ok(!new RegExp(`event\\.create\\('${n}'`).test(startup), `${n} must not be registered here`);
  }
  assert.equal(row('zone_refining', 'fz_silicon').circuit, 4);
  assert.equal(row('zone_refining', 'seven_n_indium').circuit, 5);
  assert.equal(row('synchrotron', 'sin_waveguide_lithography').circuit, 6);
  assert.equal(row('ion_implantation', 'sdd_drift_rings').circuit, 5);
  const old = (type, name) => OLD.types[type].recipes.find((r) => r.name === name);
  assert.equal(old('molecular_beam_epitaxy', 'inas_quantum_dots').circuit, 3);
  assert.equal(old('photonic_foundry', 'sin_waveguide_anneal').circuit, 7);
});

test('no UIV-only input, no alumina, no SiCl4 fluid, no rhenium', () => {
  for (const r of mine) {
    for (const id of inputs(r)) {
      assert.ok(!/uiv|alumina|silicon_tetrachloride|gtceu:rhenium|six_n_rhenium/.test(id), `${r.type}/${r.name}: ${id}`);
    }
  }
});
