// MAX-B4 (gene ark): the stand-in run of max/gene_ark.js, the controller line, the table rows this package appended (marked MAX-B4),
// lang parity, textures, the shape and the overlay.
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
const run = runPackScripts(pack);
const MG = run.global.grindless.maxGeneArk;
const recipes = run.docs.recipes.recipes;
const find = (id) => recipes.find((r) => r.i === id);
const plain = (x) => JSON.parse(JSON.stringify(x));
const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');
const table = (f) => JSON.parse(read(kube, 'data', 'grindless', 'tables', f));
const VA_MAX = 2013265920;

// [table, type or '' for a flat recipes[] table, name, circuit]
const OLDER = [
  ['biofoundry.json', '', 'synthetic_oligo_pool', 17],
  ['biofoundry.json', '', 'syn3_genome_cassettes', 18],
  ['proxima_life.json', 'xenobotany', 'xeno_genome_set', 5],
  ['proxima_life.json', 'xenobiochemistry', 'transplanted_minimal_cell', 5],
  ['proxima_life.json', 'radiotrophic', 'hardened_minimal_cell', 2]
];
const rowsOf = (t, type) => (type === '' ? t.recipes : t.types ? t.types[type].recipes : t.recipes.filter((r) => r.type === type));

test('the stand-in runs the script without errors, skips nothing and leaves no pending route', () => {
  const mine = run.errors.filter((e) => /max[\\/]gene_ark/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(MG.skipped), []);
  assert.deepEqual(plain(MG.pendingRoutes), []);
  assert.ok(MG.controllerRecipe);
});

test('c1 and c2: recipes exist and are at most VA[MAX]', () => {
  for (const id of ['grindless:genome_archiving/genome_archive', 'grindless:genome_archiving/genome_copy']) {
    const r = find(id);
    assert.ok(r, id);
    const eut = JSON.stringify(r.j).match(/"EUt":\s*(\d+)/);
    assert.ok(!eut || Number(eut[1]) <= VA_MAX, `${id} EUt`);
  }
});

test('the controller recipe is an assembly line with MAX circuits, a hull and at least 8 MAX components', () => {
  const r = find('grindless:assembly_line/gene_ark');
  assert.ok(r);
  const s = JSON.stringify(r.j);
  assert.match(s, /max_machine_hull/);
  assert.match(s, /circuits\/max/);
  assert.ok(Number((s.match(/"EUt":\s*(\d+)/) || [0, 0])[1]) <= VA_MAX);
});

test('the older JSON rows exist, are marked MAX-B4 and sit on the contract circuits, and no other row of those tables is marked', () => {
  for (const [f, type, name, circuit] of OLDER) {
    const r = rowsOf(table(f), type).find((x) => x.name === name);
    assert.ok(r, `${f} ${type}/${name}`);
    assert.match(r._why || '', /^MAX-B4/);
    assert.equal(r.circuit, circuit);
  }
  for (const f of new Set(OLDER.map((r) => r[0]))) {
    const t = table(f);
    const all = t.types ? Object.entries(t.types).flatMap(([type, tt]) => tt.recipes.map((x) => [type, x])) : t.recipes.map((x) => ['', x]);
    const marked = all.filter(([, x]) => /^MAX-B4/.test(x._why || '')).map(([type, x]) => `${type}/${x.name}`).sort();
    assert.deepEqual(marked, OLDER.filter((r) => r[0] === f).map((r) => `${r[1]}/${r[2]}`).sort(), f);
  }
});

test('the older script rows exist on the contract circuits', () => {
  const src = (p) => read(kube, 'server_scripts', 'grindless', p);
  assert.match(src('luv/orbital_biology.js'), /orbital\('organoid_assembly', 'organoid_genome_extract'\)\.circuit\(4\)/);
  assert.match(src('uv/life.js'), /name: 'ark_genome_set', type: 'closed_ecosystem', circuit: 4/);
  const oc = src('zpm/outer_chemistry.js');
  for (const [n, t, c] of [['recipient_mycoplasma_culture', 'chemosynthesis', 3], ['encapsulated_genome_library', 'supercritical_drying', 5],
    ['vitrified_cell_capsule', 'supercritical_drying', 6]]) assert.match(oc, new RegExp(`name: '${n}', type: '${t}', circuit: ${c},`), n);
  assert.match(read(kube, 'startup_scripts', 'grindless', 'zpm', 'outer_chemistry.js'), /itemsIn: 3/);
});

test('the shape, textures and EMI page exist', () => {
  const s = read(kube, 'startup_scripts', 'grindless', 'max', 'gene_ark.js');
  assert.match(s, /gene_ark/);
  assert.match(s, /genome_archiving/);
  assert.match(s, /sterilizing_filter_casing/);
  const dir = path.join(kube, 'assets', 'grindless', 'textures', 'block', 'multiblock', 'gene_ark');
  for (const f of ['overlay_front.png', 'overlay_front_active.png', 'overlay_front_active_emissive.png']) assert.ok(fs.existsSync(path.join(dir, f)), f);
  assert.ok(fs.existsSync(path.join(kube, 'assets', 'emi', 'recipe', 'additions', 'grindless', 'max_genome_archiving_gene_ark.json')));
});

test('the lang file has en_us and es_es keys in parity', () => {
  const s = read(kube, 'client_scripts', 'grindless', 'max_gene_ark_lang.js');
  assert.ok(/en_us/.test(s) && /es_es/.test(s));
  assert.match(s, /block\.gtceu\.gene_ark/);
  assert.match(s, /gtceu\.genome_archiving/);
  for (const lang of ['en_us', 'es_es']) {
    assert.ok(run.lang[lang]['block.gtceu.gene_ark'], lang);
    assert.ok(run.lang[lang]['gtceu.genome_archiving'], lang);
  }
});

test('the overlay stays in its band, has no priority line and is registered in zones.json', () => {
  const o = read(root, 'tools', 'test', 'overlay', 'kubejs', 'server_scripts', 'gg_test_max_gene_ark.js');
  assert.doesNotMatch(o.replace(/^\/\/ priority: -?\d+\r?\n/, ''), /^\/\/ priority:/m); // the integrator's stamp is the only one
  assert.match(o, /X0 = 40088/);
  assert.match(o, /X1 = 40151/);
  assert.match(o, /gg_test_max_gene_ark/);
  new Function(o.replace(/^\(function/m, 'return (function'));
  const z = JSON.parse(read(root, 'tools', 'test', 'zones.json')).zones || JSON.parse(read(root, 'tools', 'test', 'zones.json'));
  const rows = Array.isArray(z) ? z : Object.values(z).find(Array.isArray);
  const mine = rows.find((r) => r.id === 'max_gene_ark');
  assert.ok(mine);
  assert.deepEqual(mine.x, [40088, 40151]);
});
