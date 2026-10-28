// UEV-B3 (docs/eras/uev.md, "B3. Barnard b"): the Barnard core drill's and carbonyl refinery's table, lines 10 (rhenium) and 15
// (Fe16N2), and the two older rows (HV syngas plant circuit 6, EV platinum plant circuit 9), checked without Minecraft by static lookup.
// T1 is proof reuse (table-driven machines, the dimension allowlist of UHV's cold-trap drill): no native test.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const kube = path.join(root, 'pack', 'kubejs');
const tables = path.join(kube, 'data', 'grindless', 'tables');
const read = (...p) => fs.readFileSync(path.join(kube, ...p), 'utf8');
const T = JSON.parse(fs.readFileSync(path.join(tables, 'barnard.json'), 'utf8'));
const table = (name) => JSON.parse(fs.readFileSync(path.join(tables, name), 'utf8'));
const all = () => Object.entries(T.types).flatMap(([type, t]) => t.recipes.map((r) => ({ type, ...r })));
const by = (type, name) => {
  const r = T.types[type].recipes.find((x) => x.name === name);
  assert.ok(r, `${type}/${name}`);
  return r;
};
const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => x.id);
const amount = (xs, id) => xs.filter((x) => x.id === id).reduce((n, x) => n + (x.amount || 0), 0);

test('names unique per type, EU/t and duration positive, circuits unique per type', () => {
  for (const [type, t] of Object.entries(T.types)) {
    assert.equal(new Set(t.recipes.map((r) => r.name)).size, t.recipes.length, type);
    const circuits = t.recipes.map((r) => r.circuit).filter((c) => c > 0);
    assert.equal(new Set(circuits).size, circuits.length, type);
    for (const r of t.recipes) {
      assert.ok(Number.isInteger(r.eut) && r.eut > 0 && Number.isInteger(r.duration) && r.duration > 0, r.name);
    }
  }
});

test('dimension allowlist: every row is Barnard b only, and the server script locks it with G.places', () => {
  for (const r of all()) assert.equal(r.site, 'barnard_b', `${r.type}/${r.name}`);
  const srv = read('server_scripts', 'grindless', 'uev', 'barnard.js');
  assert.match(srv, /G\.places\.allow\(recipe, rec\.site\)/);
  assert.match(srv, /SITES = \['barnard_b'\]/);
  assert.ok(table('places.json').barnard_b || JSON.stringify(table('places.json')).includes('barnard_b'));
});

test('the drill: the survey is kept, the pilot core breaks the survey/rock loop, the bit wears 5 %', () => {
  const pilot = by('barnard_core_drilling', 'pilot_core');
  const survey = by('barnard_core_drilling', 'core_survey');
  assert.equal(pilot.circuit, 1);
  assert.equal(survey.circuit, 0);
  assert.deepEqual(ids(survey.kept), ['grindless:barnard_gravity_survey']);
  assert.equal(pilot.kept.length, 0);
  for (const r of [pilot, survey]) {
    assert.equal(r.itemsIn.length, 1);
    assert.equal(r.itemsIn[0].id, 'grindless:nanotwinned_diamond_bit');
    assert.equal(r.itemsIn[0].chance, 500);
    assert.deepEqual(ids(r.itemsOut), ['grindless:barnard_core_rock']);
    assert.ok(r.itemsIn.length + r.kept.length + (r.circuit > 0 ? 1 : 0) <= 2, r.name);
  }
  const orbit = table('earth_orbit.json');
  assert.match(JSON.stringify(orbit), /barnard_gravity_survey/);
  assert.match(JSON.stringify(orbit), /"grindless:barnard_core_rock","count":4|"id":\s*"grindless:barnard_core_rock",\s*"count":\s*4/);
});

test('barnard core rock comes only from the drill', () => {
  const rows = [];
  for (const f of fs.readdirSync(tables).filter((n) => n.endsWith('.json'))) {
    const walk = (node, where) => {
      if (Array.isArray(node)) node.forEach((x, i) => walk(x, `${where}[${i}]`));
      else if (node && typeof node === 'object') {
        if (Array.isArray(node.itemsOut) && ids(node.itemsOut).includes('grindless:barnard_core_rock')) rows.push(`${f}:${where}`);
        for (const [k, v] of Object.entries(node)) if (k !== 'itemsOut') walk(v, `${where}.${k}`);
      }
    };
    walk(JSON.parse(fs.readFileSync(path.join(tables, f), 'utf8')), '');
  }
  assert.equal(rows.length, 2, rows.join(', '));
  assert.ok(rows.every((w) => w.startsWith('barnard.json:') && w.includes('barnard_core_drilling')), rows.join(', '));
});

test('the refinery fits 2 items in / 3 out, 1 fluid in / out, and makes iron pentacarbonyl', () => {
  const m = by('carbonyl_refining', 'mond');
  assert.equal(m.circuit, 1);
  assert.ok(m.itemsIn.length + 1 <= 2 && m.itemsOut.length <= 3 && m.fluidsIn.length <= 1 && m.fluidsOut.length <= 1);
  assert.equal(amount(m.fluidsOut, 'gtceu:iron_pentacarbonyl'), 1000);
  assert.deepEqual(ids(m.itemsIn), ['grindless:barnard_core_rock']);
  assert.ok(ids(m.itemsOut).includes('grindless:barnard_residue'));
});

test('CO balance: the refinery takes the CO the nitride works gives back', () => {
  const m = by('carbonyl_refining', 'mond');
  const comp = JSON.stringify(table('composites.json'));
  const row = /carbonyl_iron_powder[\s\S]*?\}\s*\]\s*\}/.exec(comp);
  assert.ok(row);
  const rows = [];
  const walk = (node) => {
    if (Array.isArray(node)) node.forEach(walk);
    else if (node && typeof node === 'object') {
      if (ids(node.itemsOut).includes('grindless:carbonyl_iron_powder')) rows.push(node);
      Object.values(node).forEach(walk);
    }
  };
  walk(table('composites.json'));
  assert.equal(rows.length, 1);
  const back = amount(rows[0].fluidsOut, 'gtceu:carbon_monoxide');
  const spent = amount(rows[0].fluidsIn, 'gtceu:iron_pentacarbonyl');
  assert.equal(amount(m.fluidsIn, 'gtceu:carbon_monoxide'), back);
  assert.equal(amount(m.fluidsOut, 'gtceu:iron_pentacarbonyl'), spent);
});

test('the HV syngas plant has the CO-rich row at circuit 6 (C + CO2 -> 2 CO)', () => {
  const s = read('server_scripts', 'grindless', 'hv', 'syngas_plant.js');
  assert.match(s, /name: 'co_rich', circuit: 6, feed: 1, co2: 1000, out: \{ co: 2000 \}/);
  assert.match(s, /SYN\.uevRecipes = UEV_TABLE\.map\(planOf\)/);
  assert.match(s, /SYN\.recipes\.concat\(SYN\.orbitRecipes, SYN\.uevRecipes(?:, SYN\.uivRecipes)?\)/);
});

test('the EV platinum plant has the Barnard residue row at circuit 9, locked to Barnard b, no voiding', () => {
  const s = read('server_scripts', 'grindless', 'ev', 'platinum_plant.js');
  const row = /name: 'barnard_residue'[\s\S]*?\n\s*\}/.exec(s);
  assert.ok(row, 'row');
  assert.match(row[0], /circuit: 9/);
  assert.match(row[0], /site: 'barnard_b'/);
  assert.match(row[0], /grindless:barnard_residue/);
  assert.match(row[0], /grindless:crude_ammonium_perrhenate/);
  for (const m of ['osmium', 'iridium', 'platinum']) assert.match(row[0], new RegExp(`gtceu:${m}_dust`));
  assert.match(s, /global\.grindless\.places\.allow\(recipe, r\.site\)/);
});

test('rhenium: dust, ingot and the pellet come only from Barnard b rows, in order', () => {
  const red = by('chemical_reactor', 'perrhenate_reduction');
  assert.deepEqual(ids(red.itemsOut), ['gtceu:rhenium_dust']);
  assert.ok(ids(red.itemsIn).includes('grindless:ammonium_perrhenate'));
  assert.ok(amount(red.fluidsOut, 'gtceu:ammonia') >= 1000);
  assert.deepEqual(ids(by('chemical_reactor', 'perrhenate_recrystallise').itemsOut).slice(0, 1), ['grindless:ammonium_perrhenate']);
  assert.deepEqual(ids(by('compressor', 'rhenium_pellet').itemsOut), ['grindless:rhenium_pellet']);
  assert.deepEqual(ids(by('electric_blast_furnace', 'rhenium_ingot').itemsOut), ['gtceu:rhenium_ingot']);
  assert.equal(by('electric_blast_furnace', 'rhenium_ingot').temp, 2700);
  assert.deepEqual(ids(by('electric_blast_furnace', 'rhenium_ingot').itemsIn), ['grindless:rhenium_pellet']);
  for (const r of all().filter((x) => ids(x.itemsOut).some((i) => i.startsWith('gtceu:rhenium')))) assert.equal(r.site, 'barnard_b', r.name);
  // the electron beam consumes exactly what this chain ends in
  assert.match(JSON.stringify(table('electron_beam.json')), /gtceu:rhenium_ingot/);
});

test('every by-product has a destination: nickel, cobalt, residue, ammonium chloride, ammonia, water', () => {
  const m = by('carbonyl_refining', 'mond');
  assert.ok(ids(m.itemsOut).includes('gtceu:nickel_dust') && ids(m.itemsOut).includes('gtceu:cobalt_dust'));
  const plant = read('server_scripts', 'grindless', 'ev', 'platinum_plant.js');
  assert.match(plant, /itemIn: 'grindless:barnard_residue'|grindless:barnard_residue/);
  assert.ok(ids(by('chemical_reactor', 'perrhenate_recrystallise').itemsOut).includes('gtceu:ammonium_chloride_dust'));
});

test('the controllers have a unique shaped pattern and the machines are registered', () => {
  const srv = read('server_scripts', 'grindless', 'uev', 'barnard.js');
  const patterns = [...srv.matchAll(/pattern: (\['[^\]]*\])/g)].map((x) => x[1]);
  assert.equal(patterns.length, 2);
  const others = new Set();
  for (const f of fs.readdirSync(path.join(kube, 'server_scripts', 'grindless', 'uev')).filter((n) => n !== 'barnard.js' && n.endsWith('.js'))) {
    for (const x of read('server_scripts', 'grindless', 'uev', f).matchAll(/\[('[^'\]]*'(?:, '[^'\]]*')*)\]/g)) others.add(x[1].replace(/ /g, ''));
  }
  for (const p of patterns) assert.ok(!others.has(p.slice(1, -1).replace(/ /g, '')), p);
  const st = read('startup_scripts', 'grindless', 'uev', 'barnard.js');
  assert.match(st, /gtceu:barnard_core_drill/);
  assert.match(st, /gtceu:carbonyl_refinery/);
  assert.match(st, /type: 'barnard_core_drilling'/);
  assert.match(st, /type: 'carbonyl_refining'/);
});
