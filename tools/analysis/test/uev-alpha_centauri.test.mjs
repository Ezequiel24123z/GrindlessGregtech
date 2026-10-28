// UEV-B2 (docs/eras/uev.md, "B2. Alpha Centauri"): the nebula collector, interstellar dust lab and pulsar timing station, lines 26 and 37,
// the two Alpha Centauri rows of the swarm and the cryogenic interstellar-gas row, checked without Minecraft by static recipe lookup.
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
const T = JSON.parse(read(path.join(tables, 'alpha_centauri.json')));
const startup = read(path.join(kube, 'startup_scripts', 'grindless', 'uev', 'alpha_centauri.js'));
const server = read(path.join(kube, 'server_scripts', 'grindless', 'uev', 'alpha_centauri.js'));
const lang = read(path.join(kube, 'client_scripts', 'grindless', 'uev_alpha_centauri_lang.js'));
const swarm = read(path.join(kube, 'server_scripts', 'grindless', 'uhv', 'swarm.js'));
const cryo = read(path.join(kube, 'server_scripts', 'grindless', 'ev', 'cryogenic_plant.js'));

const OWN_TYPES = ['nebula_collection', 'interstellar_dust_analysis', 'pulsar_timing'];
const GTM = new Set(['chemical_reactor', 'mixer', 'autoclave', 'distillation_tower', 'electrolyzer', 'assembler']);
const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => x.id);
const rowsOf = (tbl) => Object.entries(tbl.types).flatMap(([type, t]) => t.recipes.map((r) => ({ type, ...r })));
const mine = rowsOf(T);
const row = (type, name) => {
  const r = mine.find((x) => x.type === type && x.name === name);
  assert.ok(r, `${type}/${name}`);
  return r;
};

test('every recipe has a unique name, positive EU/t and duration; circuits are unique inside a type', () => {
  for (const [type, t] of Object.entries(T.types)) {
    assert.equal(new Set(t.recipes.map((r) => r.name)).size, t.recipes.length, type);
    const circuits = t.recipes.map((r) => r.circuit).filter((c) => c > 0);
    assert.equal(new Set(circuits).size, circuits.length, type);
    for (const r of t.recipes) {
      assert.ok(Number.isInteger(r.eut) && r.eut > 0 && Number.isInteger(r.duration) && r.duration > 0, r.name);
      assert.ok(GTM.has(type) ? r.circuit >= 0 : r.circuit >= 1 && r.circuit <= 32, `${type}/${r.name}: circuit`);
    }
  }
  // 19 of UEV-B2's own and UIV-A7's pulsar_timing c3 repeater_discipline
  assert.equal(mine.length, 20);
});

test('the dimension allowlist: the three own types are flagged and the script applies the Alpha Centauri orbit', () => {
  for (const type of OWN_TYPES) assert.equal(T.types[type].dimension, true, type);
  for (const [type, t] of Object.entries(T.types)) if (!OWN_TYPES.includes(type)) assert.ok(!t.dimension, `${type} is a plain GTM type`);
  assert.match(server, /'grindless:alpha_centauri_orbit'/);
  assert.match(server, /\.dimension\(SITE\)/);
});

test('interstellar gas, dust and the pulsar chart come only from the Alpha Centauri types', () => {
  const targets = ['gtceu:interstellar_gas', 'grindless:dust_laden_aerogel', 'grindless:extracted_grains', 'grindless:fe60_record', 'grindless:pulsar_timing_data', 'grindless:pulsar_navigation_chart'];
  for (const id of targets) {
    const makers = mine.filter((r) => ids(r.itemsOut).includes(id) || ids(r.fluidsOut).includes(id));
    assert.equal(makers.length, 1, id);
    assert.ok(OWN_TYPES.includes(makers[0].type), id);
  }
});

test('line 26: gas -> compression -> cryogenic fractions -> distillation (deuterium, helium-3)', () => {
  assert.ok(ids(row('nebula_collection', 'interstellar_gas').fluidsOut).includes('gtceu:interstellar_gas'));
  assert.ok(ids(row('chemical_reactor', 'compress_interstellar_gas').fluidsOut).includes('gtceu:compressed_interstellar_gas'));
  const block = cryo.slice(cryo.indexOf('INTERSTELLAR_GAS'));
  assert.match(block, /gtceu:compressed_interstellar_gas/);
  for (const f of ['gtceu:hydrogen_deuterium_fraction', 'gtceu:helium_fraction', 'gtceu:neon']) assert.match(block, new RegExp(f));
  assert.ok(ids(row('distillation_tower', 'hydrogen_deuterium_split').fluidsOut).includes('gtceu:deuterium'));
  assert.ok(ids(row('distillation_tower', 'helium_isotope_split').fluidsOut).includes('gtceu:helium_3'));
});

test('line 37: SiCl4 -> TEOS -> sol -> gel -> aged gel -> aerogel tile; ethanol and CO2 are recycled', () => {
  const chain = [['chemical_reactor', 'teos_synthesis', 'grindless:teos_flask'], ['mixer', 'silica_sol', 'grindless:silica_sol'],
    ['chemical_reactor', 'silica_gel', 'grindless:silica_wet_gel'], ['autoclave', 'silica_aging', 'grindless:silica_aged_gel'],
    ['chemical_reactor', 'aerogel_drying', 'grindless:aerogel_tile']];
  for (const [type, name, out] of chain) assert.ok(ids(row(type, name).itemsOut).includes(out), name);
  assert.ok(ids(row('chemical_reactor', 'silica_gel').fluidsOut).includes('gtceu:ethanol'));
  assert.ok(ids(row('chemical_reactor', 'aerogel_drying').fluidsOut).includes('gtceu:carbon_dioxide'));
});

test('kept inputs are never consumed: scoop coil, sensor, nuclear clock', () => {
  const kept = [['nebula_collection', 'interstellar_gas', 'grindless:superhydride_scoop_coil'], ['interstellar_dust_analysis', 'fe60_record', 'grindless:uev_sensor'], ['pulsar_timing', 'timing_survey', 'grindless:nuclear_clock']];
  for (const [type, name, id] of kept) {
    const r = row(type, name);
    assert.ok(ids(r.kept).includes(id), name);
    assert.ok(!ids(r.itemsIn).includes(id), name);
  }
});

test('the pulsar station consumes the A8 MCP and the A6 SDD', () => {
  const r = row('pulsar_timing', 'timing_survey');
  assert.ok(ids(r.itemsIn).includes('grindless:lobster_eye_mcp'));
  assert.ok(ids(r.itemsIn).includes('grindless:sdd'));
});

test('every byproduct has a destination: spent HF/SiF4, HCl, silicate residue', () => {
  const consumed = new Set(mine.flatMap((r) => ids(r.itemsIn).concat(ids(r.fluidsIn))));
  assert.ok(consumed.has('gtceu:silicon_tetrafluoride'));
  assert.ok(consumed.has('grindless:silicate_residue'));
  assert.ok(consumed.has('grindless:extracted_grains'));
  for (const r of mine) for (const o of ids(r.itemsOut).concat(ids(r.fluidsOut))) assert.ok(!/void|trash/.test(o), `${r.name}: ${o}`);
});

test('swarm: the Alpha rows carry the Alpha site, circuit 3 and 12,582,912 EU/t each (two stations = 25,165,824); Mercury rows untouched', () => {
  assert.match(swarm, /ALPHA_SITE = 'grindless:alpha_centauri_orbit'/);
  const full = swarm.slice(swarm.indexOf("row('alpha_full_swarm'"), swarm.indexOf("row('corona'"));
  assert.match(full, /STATION, 3,/);
  assert.match(full, /12582912, 6000/);
  assert.match(full, /site: ALPHA_SITE, generator: true/);
  assert.equal(12582912 * 2, 25165824);
  const probe = swarm.slice(swarm.indexOf("row('alpha_corona'"), swarm.indexOf("row('probe'"));
  assert.match(probe, /BAY, 3,/);
  assert.match(probe, /site: ALPHA_SITE/);
  // Mercury rows keep SITE
  assert.match(swarm, /row\('full_swarm', STATION, 2,[\s\S]*?gen\(\[item\(SEGMENT, 60\), item\(MAP, 1\)\]\)\)/);
  assert.match(swarm, /row\('corona', BAY, 1,[^\n]*\{ site: SITE,/);
});

test('the three machines register their types and shell with an output hatch for fluids', () => {
  for (const m of ['nebula_collector', 'interstellar_dust_lab', 'pulsar_timing_station']) {
    assert.ok(startup.includes(`gtceu:${m}`), m);
    assert.ok(lang.includes(`'block.gtceu.${m}'`), m);
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'emi', 'recipe', 'additions', 'grindless', `uev_alpha_centauri_${m}.json`)), `emi ${m}`);
    for (const f of ['overlay_front.png', 'overlay_front_active.png', 'overlay_front_active_emissive.png']) {
      assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'block', 'multiblock', m, f)), `${m}/${f}`);
    }
  }
  assert.match(startup, /output_hatch/);
});

test('every item has a name, tooltips in en_us and es_es form, and a texture; the scoop tooltip says the yield is fiction', () => {
  const names = [...startup.matchAll(/(\w+): \{ stack: \d+ \}/g)].map((m) => m[1]);
  assert.equal(names.length, 12);
  for (const n of names) {
    assert.ok(lang.includes(`['${n}',`), `lang ${n}`);
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'item', `${n}.png`)), `texture ${n}`);
  }
  assert.match(lang, /named fiction/);
  assert.match(lang, /ficción declarada/);
  assert.match(lang, /\['en_us', 'es_es'\]/);
  // later packages' rows (UIV-A7: repeater_discipline) carry their EMI line in their own lang script
  const lines = lang + read(path.join(kube, 'client_scripts', 'grindless', 'uiv_mainframe_lang.js'));
  for (const r of mine.filter((x) => OWN_TYPES.includes(x.type))) {
    assert.ok(lines.includes(`gtceu.recipe.${T.types[r.type].dataKey}.${r.name}'`), `recipe line ${r.type}/${r.name}`);
  }
});
