// UEV-A1 (docs/eras/uev.md, "A1. Isotopes"): the calutron's table, the chain rows round it and the older actinide rows, checked without
// Minecraft by static recipe lookup. T1 is proof reuse (plain lib/patterns.js multiblock, table-driven recipes): no native test.
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
const ISO = table('isotopes.json');
const FAC = table('isotopes_facility.json');
const FAB = table('isotopes_fabrication.json');
// UEV's calutron rows; UIV-A1 appended its own (marked "_": "UIV-...") and pins them in uiv-isotopes.test.mjs
const CAL = ISO.types.calutron_separation.recipes.filter((r) => !String(r._ || '').startsWith('UIV-'));

const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => x.id);
const inputs = (r) => ids(r.itemsIn).concat(ids(r.kept), ids(r.fluidsIn), ids(r.charge));
const outputs = (r) => ids(r.itemsOut).concat(ids(r.fluidsOut));
const by = (rs, name) => {
  const r = rs.find((x) => x.name === name);
  assert.ok(r, name);
  return r;
};

// every recipe-producing row of every table, as [table/type/name, recipe]
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
const producers = (id) => allRows().filter(([, r]) => outputs(r).includes(id)).map(([w]) => w);

function jsFiles(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...jsFiles(p));
    else if (e.name.endsWith('.js')) out.push(p);
  }
  return out;
}

const ISOTOPES = ['gtceu:calcium_48_dust', 'gtceu:potassium_40_dust', 'gtceu:lithium_6_dust', 'gtceu:plutonium_244_dust'];

test('every calutron recipe has a unique name and circuit 1-6, a UHV-voltage EU/t and a positive duration', () => {
  assert.equal(new Set(CAL.map((r) => r.name)).size, CAL.length);
  assert.deepEqual(CAL.map((r) => r.circuit).sort(), [1, 2, 3, 4, 5, 6]);
  for (const r of CAL) {
    assert.ok(Number.isInteger(r.eut) && r.eut === 1966080, r.name);
    assert.ok(Number.isInteger(r.duration) && r.duration > 0, r.name);
  }
});

test('the calutron recipes fit the type\'s slots (startup maxIO; the circuit takes an item slot) and none uses a fluid', () => {
  const startup = read('startup_scripts', 'grindless', 'uev', 'isotopes.js');
  assert.match(startup, /maxIO: \{ itemsIn: 2, itemsOut: 3, fluidsIn: 0, fluidsOut: 0 \}/);
  for (const r of CAL) {
    assert.ok(r.itemsIn.length + (r.kept || []).length + 1 <= 2, r.name);
    assert.ok(r.itemsOut.length <= 3, r.name);
    assert.equal((r.fluidsIn || []).length + (r.charge || []).length + (r.fluidsOut || []).length, 0, r.name);
  }
});

test('Ca-48, K-40, Li-6 and Pu-244 come only from the calutron: no other row or script recipe produces them', () => {
  for (const id of ISOTOPES) {
    const p = producers(id);
    assert.equal(p.length, 1, `${id}: ${p}`);
    assert.match(p[0], /^isotopes\.json:\.types\.calutron_separation\.recipes\[\d\]$/, id);
  }
  assert.deepEqual(ISOTOPES.map((id) => CAL.filter((r) => outputs(r).includes(id)).map((r) => r.circuit)), [[2], [3], [4], [5]]);
  const self = ['isotopes.js'];
  const scripts = ['server_scripts', 'startup_scripts'].flatMap((d) => jsFiles(path.join(kube, d)));
  for (const f of scripts) {
    if (self.includes(path.basename(f)) && f.includes(`${path.sep}uev${path.sep}`)) continue;
    const txt = fs.readFileSync(f, 'utf8');
    for (const id of ISOTOPES) {
      const name = id.split(':')[1];
      assert.ok(!new RegExp(`(?:itemOutputs|outputs?|\\.id)[^\\n]*${name}`).test(txt) || f.includes('foundation'), `${path.relative(kube, f)}: ${name}`);
    }
  }
});

test('the isotope feeds and tails: Ca/K/Li tails go back to their natural chloride; depleted Pu goes to the MOX blend and IV\'s MOX', () => {
  assert.ok(outputs(by(CAL, 'calcium_pass_1')).includes('gtceu:calcium_chloride_dust'));
  assert.ok(outputs(by(CAL, 'calcium_pass_2')).includes('gtceu:calcium_chloride_dust'));
  assert.ok(outputs(by(CAL, 'potassium_40')).includes('gtceu:rock_salt_dust'));
  assert.ok(outputs(by(CAL, 'lithium_6')).includes('gtceu:lithium_chloride_dust'));
  const depleted = 'gtceu:depleted_plutonium_oxide_dust';
  assert.ok(outputs(by(CAL, 'plutonium_244')).includes(depleted));
  assert.ok(outputs(by(CAL, 'plutonium_242')).includes(depleted));
  const mix = by(ISO.types.mixer.recipes, 'mox_blend');
  assert.ok(inputs(mix).includes(depleted));
  const fab = FAB.fabrication;
  const mox = fab.find((r) => r.name === 'depleted_pu_mox');
  assert.ok(mox, 'iv fabrication row depleted_pu_mox');
  assert.ok(inputs(mox).includes('gtceu:mox_blend_powder_dust'));
  assert.deepEqual(outputs(mox), ['grindless:mox_fuel_assembly']);
  assert.equal(mox.circuit, 8);
});

test('line 2 closes: oxide feed -> Pu-242 -> target -> HFIR -> dissolve -> recovery -> chloride -> Pu-244 -> oxide -> target', () => {
  const chain = [
    [ISO.types.chemical_reactor.recipes, 'plutonium_oxide', 'gtceu:plutonium_oxide_feed_dust'],
    [CAL, 'plutonium_242', 'gtceu:plutonium_242_oxide_dust'],
    [ISO.types.assembler.recipes, 'plutonium_oxide_target', 'grindless:plutonium_oxide_target'],
    [FAC.types.high_flux_irradiation.recipes, 'plutonium_target', 'grindless:irradiated_plutonium_target'],
    [FAC.types.transuranium_processing.recipes, 'plutonium_dissolve', 'gtceu:plutonium_nitrate'],
    [ISO.types.chemical_reactor.recipes, 'plutonium_244_chlorination', 'gtceu:plutonium_244_rich_chloride_dust'],
    [CAL, 'plutonium_244', 'gtceu:plutonium_244_dust'],
    [ISO.types.chemical_reactor.recipes, 'plutonium_244_oxidation', 'gtceu:plutonium_244_oxide_dust'],
    [ISO.types.chemical_reactor.recipes, 'pu244_plating_ampoule', 'grindless:pu244_plating_ampoule'],
    [ISO.types.assembler.recipes, 'plutonium_244_target', 'grindless:plutonium_244_target']
  ];
  for (const [rs, name, out] of chain) assert.ok(outputs(by(rs, name)).includes(out), `${name} -> ${out}`);
  // each link's output is the next link's input
  const feeds = [[0, 1], [1, 2], [2, 3], [3, 4], [6, 7], [7, 8], [8, 9]];
  for (const [a, b] of feeds) {
    const out = outputs(by(chain[a][0], chain[a][1]));
    assert.ok(inputs(by(chain[b][0], chain[b][1])).some((i) => out.includes(i)), `${chain[a][1]} -> ${chain[b][1]}`);
  }
});

test('line 1, 29 and 30 chains: calcite -> CaCl2 -> Ca-48 passes -> oven charge; Li -> LiCl; KOH -> KCl', () => {
  const cr = ISO.types.chemical_reactor.recipes;
  assert.ok(inputs(by(CAL, 'calcium_pass_1')).includes('gtceu:calcium_chloride_dust'));
  assert.ok(outputs(by(cr, 'calcite_to_calcium_chloride')).includes('gtceu:calcium_chloride_dust'));
  assert.ok(outputs(by(CAL, 'calcium_pass_1')).includes('gtceu:calcium_48_enriched_dust'));
  assert.ok(outputs(by(cr, 'calcium_48_chlorination')).includes('gtceu:calcium_48_enriched_chloride_dust'));
  assert.ok(inputs(by(CAL, 'calcium_pass_2')).includes('gtceu:calcium_48_enriched_chloride_dust'));
  assert.ok(inputs(by(ISO.types.mixer.recipes, 'ca48_crucible_load')).includes('gtceu:calcium_48_dust'));
  assert.ok(inputs(by(ISO.types.assembler.recipes, 'ca48_oven_charge')).includes('grindless:ca48_crucible_load'));
  assert.ok(outputs(by(cr, 'lithium_to_lithium_chloride')).includes('gtceu:lithium_chloride_dust'));
  assert.ok(outputs(by(cr, 'potassium_chloride_feed')).includes('gtceu:rock_salt_dust'));
});

test('GTM-type rows use circuits 20 and up and carry unique circuits inside their type', () => {
  for (const type of ['chemical_reactor', 'mixer', 'assembler']) {
    const cs = ISO.types[type].recipes.map((r) => r.circuit);
    assert.equal(new Set(cs).size, cs.length, type);
    for (const c of cs) assert.ok(c >= 20 && c <= 32, `${type} ${c}`);
  }
});

test('the older rows exist: HFIR c4, facility c7 and c8, ZPM partitioning c3-c5, IV fabrication c8', () => {
  const hfir = by(FAC.types.high_flux_irradiation.recipes, 'plutonium_target');
  assert.equal(hfir.circuit, 4);
  const proc = FAC.types.transuranium_processing.recipes;
  assert.equal(by(proc, 'plutonium_dissolve').circuit, 7);
  assert.equal(by(proc, 'curium_californium_cut').circuit, 8);
  assert.ok(outputs(by(proc, 'curium_californium_cut')).includes('gtceu:curium_californium_nitrate'));
  assert.ok(outputs(by(proc, 'curium_californium_cut')).includes('gtceu:berkelium_californium_nitrate'));
  const actinides = read('server_scripts', 'grindless', 'zpm', 'actinides.js');
  for (const n of ['plutonium_recovery', 'curium_cut', 'berkelium_cut']) assert.ok(actinides.includes(`name: '${n}'`), n);
  const uranium = read('server_scripts', 'grindless', 'iv', 'uranium_cycle.js');
  assert.ok(uranium.includes('isotopes_fabrication.json'));
  const transcurium = read('server_scripts', 'grindless', 'uhv', 'transcurium.js');
  assert.ok(transcurium.includes('isotopes_facility.json'));
});

test('the HFIR and facility circuits of the new rows are free in the main tables', () => {
  const T = table('transcurium.json');
  const used = (t) => T.types[t].recipes.filter((r) => !/^UIV-B2/.test(r._why || '')).map((r) => r.circuit); // UIV-B2 appended es254_extraction c7
  assert.ok(!used('high_flux_irradiation').includes(4));
  assert.ok(!used('transuranium_processing').includes(7) && !used('transuranium_processing').includes(8));
  const fab = JSON.stringify(table('transcurium_fabrication.json'));
  assert.ok(!/"circuit":\s*8\b/.test(fab));
});

test('no recipe of the package needs a UEV or UIV-only input', () => {
  const all = [...CAL, ...Object.values(ISO.types).flatMap((t) => t.recipes), ...Object.values(FAC.types).flatMap((t) => t.recipes)];
  for (const r of all) for (const id of inputs(r)) assert.ok(!/\b(uev|uiv|uxv|opv|max)_/.test(id), `${r.name}: ${id}`);
});

test('names exist in en_us and es_es for the machine, the type, the items, the materials and every calutron recipe', () => {
  const lang = read('client_scripts', 'grindless', 'uev_isotopes_lang.js');
  const need = ['block.gtceu.calutron', 'gtceu.calutron_separation', 'grindless.machine.calutron.no_voiding'];
  for (const r of CAL) need.push(`gtceu.recipe.grindless_calutron_separation.${r.name}`);
  for (const i of ['ca48_oven_charge', 'plutonium_oxide_target', 'irradiated_plutonium_target', 'plutonium_244_target']) need.push(`item.grindless.${i}`);
  const startup = read('startup_scripts', 'grindless', 'uev', 'isotopes.js');
  for (const m of startup.matchAll(/^ {4}(\w+): \{ form: /gm)) need.push(`material.gtceu.${m[1]}`);
  for (const k of need) assert.ok(lang.includes(`'${k}'`) || lang.includes(`'${k.replace(/^(item|material\.gtceu)\.(?:grindless\.)?/, '')}'`), k);
  assert.match(lang, /\['en_us', 'es_es'\]/);
});

test('the new GT materials the tables name are registered by the startup script', () => {
  const startup = read('startup_scripts', 'grindless', 'uev', 'isotopes.js');
  const all = JSON.stringify(ISO) + JSON.stringify(FAC) + JSON.stringify(FAB);
  const mats = [...new Set([...startup.matchAll(/^ {4}(\w+): \{ form: /gm)].map((m) => m[1]))];
  assert.equal(mats.length, 15);
  for (const id of new Set([...all.matchAll(/gtceu:(\w+?)(?:_dust)?"/g)].map((m) => m[1]))) {
    if (/^(calcium_48_enriched|plutonium_2(?:42_oxide|44_rich|44_oxide)|depleted_plutonium|mox_blend|curium_californium|berkelium_californium|curium_nitrate|californium_nitrate|berkelium_nitrate)/.test(id)) {
      assert.ok(mats.includes(id.replace(/_dust$/, '')), id);
    }
  }
});
