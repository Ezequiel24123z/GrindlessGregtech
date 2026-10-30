// UEV-A5 (docs/eras/uev.md, "A5. Magnets and composites"): the nitride magnet works, SiC fibre plant and CVI furnace table, lines 14-17
// and 35, checked without Minecraft by static recipe lookup. T1 is proof reuse (plain lib/patterns.js multiblocks and the table-driven
// generator of UHV-A2): no native test.
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
const T = JSON.parse(read(path.join(tables, 'composites.json')));
const startup = read(path.join(kube, 'startup_scripts', 'grindless', 'uev', 'composites.js'));
const lang = read(path.join(kube, 'client_scripts', 'grindless', 'uev_composites_lang.js'));
const sv = (...p) => read(path.join(kube, 'server_scripts', 'grindless', ...p));

const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => x.id);
const outputs = (r) => ids(r.itemsOut).concat(ids(r.fluidsOut));
const by = (type, name) => {
  const r = T.types[type].recipes.find((x) => x.name === name);
  assert.ok(r, `${type}/${name}`);
  return r;
};

// every recipe-producing row of every table, as [file:type/name, recipe]
function allRows() {
  const out = [];
  for (const f of fs.readdirSync(tables).filter((n) => n.endsWith('.json'))) {
    const walk = (node, where) => {
      if (Array.isArray(node)) node.forEach((x, i) => walk(x, `${where}[${i}]`));
      else if (node && typeof node === 'object') {
        if (Array.isArray(node.itemsOut) || Array.isArray(node.fluidsOut)) out.push([`${f}:${where}:${node.name}`, node]);
        for (const [k, v] of Object.entries(node)) if (k !== 'itemsOut' && k !== 'fluidsOut') walk(v, `${where}.${k}`);
      }
    };
    walk(JSON.parse(read(path.join(tables, f))), '');
  }
  return out;
}
const producers = (id) => allRows().filter(([, r]) => outputs(r).includes(id));

// the server scripts, recursively
function serverScripts(dir = path.join(kube, 'server_scripts')) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? serverScripts(p) : p.endsWith('.js') ? [p] : [];
  });
}

test('every recipe has a unique name, a positive EU/t and duration; circuits are unique inside a type', () => {
  for (const [type, t] of Object.entries(T.types)) {
    assert.equal(new Set(t.recipes.map((r) => r.name)).size, t.recipes.length, type);
    const circuits = t.recipes.map((r) => r.circuit).filter((c) => c > 0);
    assert.equal(new Set(circuits).size, circuits.length, type);
    for (const r of t.recipes) {
      assert.ok(r.eut > 0 && r.duration > 0, `${type}/${r.name}`);
      assert.ok(r.itemsIn?.length || r.fluidsIn?.length, `${type}/${r.name}: no input`);
    }
  }
});

test('the three machines and their recipe types are registered, and none may void', () => {
  for (const m of ['nitride_magnet_works', 'sic_fibre_plant', 'cvi_furnace']) {
    assert.ok(startup.includes(`'${m}'`) || startup.includes(`"${m}"`), m);
    assert.ok(lang.includes(`block.gtceu.${m}`), `${m} name`);
  }
  for (const t of ['nitride_magnet_synthesis', 'sic_fibre_spinning', 'chemical_vapour_infiltration']) assert.ok(T.types[t], t);
  assert.match(startup, /no_voiding|noVoiding/);
});

test('SiC/SiC plates come only from the CVI furnace', () => {
  const p = producers('grindless:sic_sic_plate');
  assert.equal(p.length, 1, JSON.stringify(p.map((x) => x[0])));
  assert.equal(by('chemical_vapour_infiltration', 'sic_sic_plate').itemsOut[0].id, 'grindless:sic_sic_plate');
  for (const f of serverScripts()) {
    if (f.endsWith(path.join('uev', 'composites.js'))) continue;
    assert.ok(!/output\w*\([^)]*sic_sic_plate|addOutput[^)]*sic_sic_plate/.test(read(f)), `${f} produces sic_sic_plate`);
  }
});

test('Fe16N2 comes only from the nitride magnet works', () => {
  const p = producers('gtceu:fe16n2_dust');
  assert.equal(p.length, 1, JSON.stringify(p.map((x) => x[0])));
  assert.equal(by('nitride_magnet_synthesis', 'fe16n2_powder').itemsOut[0].id, 'gtceu:fe16n2_dust');
  for (const f of serverScripts()) {
    if (f.endsWith(path.join('uev', 'composites.js'))) continue;
    assert.ok(!/fe16n2_dust/.test(read(f).replace(/\/\/.*$/gm, '')) || !/output|itemsOut/i.test(read(f).match(/.*fe16n2_dust.*/g).join('\n')), `${f}`);
  }
});

test('the HfTaCN coil block is obtainable from the heating element and the HfTaCN ingot', () => {
  const block = producers('grindless:hftacn_coil_block');
  assert.equal(block.length, 1);
  assert.ok(ids(by('assembler', 'hftacn_coil_block').itemsIn).includes('grindless:hftacn_heating_element'));
  assert.ok(producers('grindless:hftacn_heating_element').length === 1);
  assert.ok(ids(by('assembler', 'hftacn_heating_element').itemsIn).includes('gtceu:hftacn_ingot'));
  // the ingot comes from the UHV spark plasma sinterer's billet, which consumes the A4 6N hafnium
  assert.match(sv('uhv', 'propulsion.js'), /hftacn_billet[\s\S]{0,400}six_n_hafnium[\s\S]{0,400}hftacn_ingot/);
});

test('the older rows exist: the BN interphase (circuit 5) and the HfTaCN billet (circuit 4)', () => {
  assert.match(sv('uv', 'materials.js'), /row\('sic_fibre_bn_interphase', 'boron_nitride', 5,/);
  assert.match(sv('uhv', 'propulsion.js'), /row\('hftacn_billet', 'spark_plasma_sintering', 4,/);
});

test('byproducts are routed, never voided: CH4 and H2 to the pyrolyser, HCl to the cascade, HF to the kiln, CO to syngas', () => {
  const fibre = by('sic_fibre_spinning', 'sic_fibre');
  assert.ok(ids(fibre.fluidsOut).includes('gtceu:methane') && ids(fibre.fluidsOut).includes('gtceu:hydrogen'));
  assert.ok(ids(by('chemical_vapour_infiltration', 'sic_sic_plate').fluidsOut).includes('gtceu:hydrochloric_acid'));
  assert.ok(ids(by('chemical_vapour_infiltration', 'wf_w_tile').fluidsOut).includes('gtceu:hydrofluoric_acid'));
  assert.ok(ids(by('nitride_magnet_synthesis', 'fe16n2_powder').fluidsOut).includes('gtceu:hydrogen'));
  assert.ok(ids(by('chemical_reactor', 'carbonyl_iron_powder').fluidsOut).includes('gtceu:carbon_monoxide'));
  // the destinations exist
  const all = serverScripts().map(read).join('\n');
  assert.match(all, /methane_pyrolysis/);
  assert.match(all, /extraction_cascade/);
  assert.match(all, /hydrofluoric_acid/);
});

test('the motor recipe exists and takes the bonded magnet, the SiC/SiC plate and the FFKM seal', () => {
  const r = by('assembler', 'uev_electric_motor');
  assert.equal(r.itemsOut[0].id, 'gtceu:uev_electric_motor');
  const i = ids(r.itemsIn);
  for (const x of ['grindless:bonded_fe16n2_magnet', 'grindless:sic_sic_plate', 'grindless:ffkm_seal']) assert.ok(i.includes(x), x);
});

test('the ids F1 registered are reused, never registered again', () => {
  for (const id of ['uev_electric_motor', 'sic_sic_plate', 'wf_w_tile', 'bonded_fe16n2_magnet', 'hftacn_coil_block']) {
    assert.ok(!new RegExp(`['"]${id}['"]\\s*,\\s*['"]`).test(startup.split('CO.items')[0] ?? ''), id);
  }
});

test('every package item has en_us and es_es names (one table, two languages)', () => {
  const names = [...lang.matchAll(/^\s*\['([a-z0-9_]+)', '[^']+', '[^']+', '/gm)].map((m) => m[1]);
  assert.ok(names.length >= 19, String(names.length));
  for (const n of names) assert.ok(startup.includes(`${n}:`), `${n} is not registered`);
  assert.match(lang, /\['en_us', 'es_es'\]/);
});
