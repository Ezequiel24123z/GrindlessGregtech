// UEV-B4 (docs/eras/uev.md, "B4. Sirius B"): the white dwarf spectrograph's, degenerate harvester's and containment works' table (machines 23-25,
// line 28) and the UEV field generator's recipe, checked without Minecraft by static lookup. The T1 (gg_test_uev_sirius) covers the runtime.
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
const table = (name) => JSON.parse(fs.readFileSync(path.join(tables, name), 'utf8'));
const T = table('sirius.json');
const all = () => Object.entries(T.types).flatMap(([type, t]) => t.recipes.map((r) => ({ type, dimension: t.dimension === true, ...r })));
const by = (type, name) => {
  const r = T.types[type].recipes.find((x) => x.name === name);
  assert.ok(r, `${type}/${name}`);
  return r;
};
const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => x.id);
const ORBIT = 'grindless:sirius_b_orbit';
const ALPHA = ['interstellar_gas', 'nebula_collector', 'silicate_residue', 'fe60_record', 'pulsar_navigation_chart', 'dust_laden_aerogel', 'scoop_coil',
  'extracted_grains', 'demineralised_grains', 'helium_fraction', 'hydrogen_deuterium_fraction', 'compressed_interstellar_gas'];

test('names unique per type, EU/t and duration positive, circuits unique per type', () => {
  for (const [type, t] of Object.entries(T.types)) {
    assert.equal(new Set(t.recipes.map((r) => r.name)).size, t.recipes.length, type);
    const circuits = t.recipes.map((r) => r.circuit).filter((c) => c > 0);
    assert.equal(new Set(circuits).size, circuits.length, type);
    for (const r of t.recipes) {
      assert.ok(Number.isInteger(r.eut) && r.eut > 0 && Number.isInteger(r.duration) && r.duration > 0, r.name);
      assert.ok(r.itemsOut.length + r.fluidsOut.length > 0, r.name);
    }
  }
});

test('dimension allowlist: the three own types are Sirius B orbit only, the script locks it, and B1 owns that dimension', () => {
  for (const type of ['gravitational_redshift', 'degenerate_harvesting', 'degenerate_containment']) {
    assert.equal(T.types[type].dimension, true, type);
    // MAX-D1 appends one Sgr A* row (c2, string site) to the harvester
    assert.equal(T.types[type].recipes.length, type === 'degenerate_harvesting' ? 2 : 1, type);
    assert.equal(T.types[type].recipes[0].circuit, 1, type);
  }
  const srv = read('server_scripts', 'grindless', 'uev', 'sirius.js');
  assert.match(srv, /if \(rec\.dimension\) recipe\.dimension\(ORBIT\)/);
  assert.match(srv, /SI\.orbit \|\| 'grindless:sirius_b_orbit'/);
  assert.match(read('startup_scripts', 'grindless', 'uev', 'sirius.js'), new RegExp(`SI\\.orbit = '${ORBIT}'`));
  assert.match(JSON.stringify(table('orbits.json')), /grindless:sirius_b_orbit/);
  assert.match(JSON.stringify(table('stations.json')), /sirius/);
});

test('the spectrograph keeps the nuclear clock and makes the chart from a ULE cavity and SNSPDs', () => {
  const r = by('gravitational_redshift', 'mass_radius_chart');
  assert.deepEqual(ids(r.kept), ['grindless:nuclear_clock']);
  assert.ok(ids(r.itemsIn).includes('grindless:ule_cavity') && ids(r.itemsIn).includes('grindless:snspd'));
  assert.deepEqual(ids(r.itemsOut), ['grindless:mass_radius_chart']);
});

test('the harvester consumes the EOS model, keeps the chart and the helium loop, and gives degenerate matter', () => {
  const r = by('degenerate_harvesting', 'degenerate_matter');
  assert.deepEqual(ids(r.itemsIn), ['grindless:degenerate_eos_model']);
  assert.deepEqual(ids(r.kept), ['grindless:mass_radius_chart']);
  assert.deepEqual(ids(r.charge), ['gtceu:liquid_helium']);
  assert.deepEqual(ids(r.itemsOut), ['grindless:degenerate_matter']);
  assert.equal(r.fluidsOut.length, 0);
  assert.equal(r.eut, 7864320);
});

test('pellet containment: degenerate matter is sealed with the Casimir array\'s stasis cell into the pellet; nothing is voided', () => {
  const r = by('degenerate_containment', 'degenerate_pellet');
  assert.deepEqual(ids(r.itemsIn).sort(), ['grindless:degenerate_matter', 'grindless:exotic_matter_cell']);
  assert.deepEqual(ids(r.itemsOut), ['grindless:degenerate_pellet']);
  assert.equal(r.fluidsOut.length, 0);
  // the cell comes from UHV's Casimir array
  assert.match(JSON.stringify(table('antimatter.json')), /grindless:exotic_matter_cell/);
  // every row of this table that handles degenerate matter or the pellet is accounted for: matter only in the harvester out and the works in
  const handlers = all().filter((x) => [...ids(x.itemsIn), ...ids(x.itemsOut), ...ids(x.kept)].some((i) => /degenerate_(matter|pellet)/.test(i)));
  assert.deepEqual(handlers.map((x) => `${x.type}/${x.name}`).sort(), ['assembler/uev_field_generator', 'degenerate_containment/degenerate_pellet', 'degenerate_harvesting/degenerate_matter', 'degenerate_harvesting/degenerate_slug']);
});

test('degenerate matter, the chart and the pellet come only from Sirius B rows', () => {
  const made = new Set(['grindless:degenerate_matter', 'grindless:mass_radius_chart', 'grindless:degenerate_pellet']);
  const rows = [];
  for (const f of fs.readdirSync(tables).filter((n) => n.endsWith('.json'))) {
    const walk = (node, where) => {
      if (Array.isArray(node)) node.forEach((x, i) => walk(x, `${where}[${i}]`));
      else if (node && typeof node === 'object') {
        if (Array.isArray(node.itemsOut) && ids(node.itemsOut).some((i) => made.has(i))) rows.push(`${f}:${where}`);
        for (const [k, v] of Object.entries(node)) if (k !== 'itemsOut') walk(v, `${where}.${k}`);
      }
    };
    walk(table(f), '');
  }
  assert.equal(rows.length, 3, rows.join(', '));
  assert.ok(rows.every((w) => w.startsWith('sirius.json:')), rows.join(', '));
  // scripts other than ours must not output them either
  for (const f of fs.readdirSync(path.join(kube, 'server_scripts', 'grindless', 'uev')).filter((n) => n !== 'sirius.js' && n.endsWith('.js'))) {
    assert.ok(!/itemOutputs\([^)]*(degenerate_matter|degenerate_pellet|mass_radius_chart)/.test(read('server_scripts', 'grindless', 'uev', f)), f);
  }
});

test('the UEV field generator: assembler, pellet + the SX pump impeller, no Alpha Centauri product, no Barnard cycle', () => {
  const r = by('assembler', 'uev_field_generator');
  assert.equal(r.circuit, 0);
  assert.deepEqual(ids(r.itemsOut), ['gtceu:uev_field_generator']);
  assert.ok(ids(r.itemsIn).includes('grindless:degenerate_pellet'));
  assert.ok(ids(r.itemsIn).includes('grindless:sx_pump_impeller'));
  assert.equal(r.fluidsIn.length, 0);
  for (const i of [...ids(r.itemsIn), ...ids(r.kept), ...ids(r.fluidsIn)]) for (const a of ALPHA) assert.ok(!i.includes(a), `${i} / ${a}`);
  // only the UIV field generator's row (TP-C: each tier's part takes the tier below's) consumes it; Alpha Centauri builds with UV field generators
  const users = [];
  for (const f of fs.readdirSync(tables).filter((n) => n.endsWith('.json') && n !== 'hidden_until.json')) {
    if (f === 'sirius.json') continue;
    if (JSON.stringify(table(f)).includes('gtceu:uev_field_generator')) users.push(f);
  }
  assert.deepEqual(users, ['rx_j1856.json']);
  // nothing in the Barnard, rhenium or Alpha Centauri chains needs the field generator or the pellet
  for (const f of ['barnard.json', 'electron_beam.json', 'alpha_centauri.json']) {
    assert.ok(!/uev_field_generator|degenerate_/.test(JSON.stringify(table(f)).replace(/degenerate_eos_model/g, '')), f);
  }
  // the casing recipe
  const casing = by('assembler', 'degenerate_containment_casing');
  assert.deepEqual(ids(casing.itemsOut), ['grindless:degenerate_containment_casing']);
});

test('the EOS model, the clock and the impeller exist as producers elsewhere', () => {
  assert.match(JSON.stringify(table('earth_orbit.json')), /grindless:degenerate_eos_model/);
  assert.match(JSON.stringify(table('electron_beam.json')), /grindless:sx_pump_impeller/);
});

test('the controllers are assembly lines with station research and the machines are registered', () => {
  const srv = read('server_scripts', 'grindless', 'uev', 'sirius.js');
  assert.equal((srv.match(/gtceu\.assembly_line\(/g) || []).length, 1);
  assert.match(srv, /stationResearch/);
  const st = read('startup_scripts', 'grindless', 'uev', 'sirius.js');
  for (const m of ['white_dwarf_spectrograph', 'degenerate_harvester', 'containment_works']) assert.match(st, new RegExp(`gtceu:${m}`));
  for (const t of ['gravitational_redshift', 'degenerate_harvesting', 'degenerate_containment']) assert.match(st, new RegExp(`type: '${t}'`));
  assert.match(srv, /gtceu:uev_machine_hull/);
});

test('the fiction note names degenerate matter and says it is contained', () => {
  const info = JSON.parse(fs.readFileSync(path.join(kube, 'assets', 'emi', 'recipe', 'additions', 'grindless', 'uev_sirius_fiction.json'), 'utf8'));
  assert.equal(info.type, 'emi:info');
  assert.ok(info.stacks.includes('item:grindless:degenerate_matter') && info.stacks.includes('item:grindless:degenerate_pellet'));
  const lang = read('client_scripts', 'grindless', 'uev_sirius_lang.js');
  assert.match(lang, /emi\.grindless\.info\.sirius_fiction\.0',\s*'Degenerate matter is named fiction/);
  assert.match(lang, /sealed at once into a pellet/);
});
