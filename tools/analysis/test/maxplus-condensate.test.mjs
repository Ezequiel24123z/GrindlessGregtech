// XP-A1 (MAX+ condensate): the stand-in run of maxplus/condensate.js, the machine rows, lang parity and the test zone.
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
const MC = run.global.grindless.maxPlusCondensate;
const plain = (x) => JSON.parse(JSON.stringify(x));
const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');
const server = read(kube, 'server_scripts', 'grindless', 'maxplus', 'condensate.js');
const lang = read(kube, 'client_scripts', 'grindless', 'maxplus_condensate_lang.js');
const loomLang = read(kube, 'client_scripts', 'grindless', 'maxplus_loom_lang.js');

test('the stand-in runs the script without errors, skips nothing', () => {
  const mine = run.errors.filter((e) => /maxplus[\\/]condensate/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(MC.skipped), []);
  assert.equal(MC.recipes.length, 15); // D5-QPU-MAXP added c12 condensate_cooled_module
  assert.equal(MC.controllerRecipes.length, 2);
});

test('machine rows: unique circuits per type, run at Sgr A*, never above V[MAX] x 16', () => {
  const rows = [...server.matchAll(/type: '(condensate_refinery|bound_matter_press)'[^\n]*name: '([a-z_0-9]+)', circuit: (\d+), eut: ([^,]+),/g)];
  assert.equal(rows.length, 11);
  const seen = new Set();
  for (const [, type, name, circuit, eut] of rows) {
    const k = `${type}:${circuit}`;
    assert.ok(!seen.has(k), `circuit clash ${k} (${name})`);
    seen.add(k);
    assert.ok(Number(circuit) >= 1 && Number(circuit) <= 32);
    assert.match(eut, /^(VA_MAX|V_MAX( \* (2|4|8|16))?)$/);
  }
  assert.doesNotMatch(server, /b\.dimension\(/);
});

test('the recompress row returns the boil-off as condensate (no free source: 4 in, 4,000 mB out)', () => {
  assert.match(server, /name: 'recompress_boil_off'[\s\S]*?items: \['4x grindless:condensate_boil_off'\][\s\S]*?fluidOuts: \[\[KERR, 4000\]\]/);
});

test('lang: every recipe row has an en_us entry', () => {
  const names = [...server.matchAll(/name: '([a-z_0-9]+)', circuit: \d+, eut: (?:VA_MAX|V_MAX)/g)].map((m) => m[1]);
  assert.equal(names.length, 11);
  // XP-H1's c4 row (line T4) is named in the loom's lang file, XP-H3's c3 row (line T1) in the assembler's
  const assemblerLang = read(kube, 'client_scripts', 'grindless', 'maxplus_assembler_lang.js');
  for (const n of names) {
    assert.ok(lang.includes(`.${n}'`) || (n === 'graded_horizon_laminate' && loomLang.includes(`.${n}'`))
      || (n === 'condensate_cooled_module' && lang.includes(`.${n}'`) === false && read(kube, 'client_scripts', 'grindless', 'maxplus_circuits_lang.js').includes(`.${n}'`))
      || (n === 'laminated_containment_core' && assemblerLang.includes(`.${n}'`)), `no lang key for ${n}`);
  }
  assert.ok(lang.includes("'gtceu.condensate_refinery'") && lang.includes("'gtceu.bound_matter_press'"));
  assert.ok(lang.includes("ClientEvents.lang('en_us'"));
  assert.ok(!/[^\x00-\x7f]/.test(lang), 'non-ASCII characters must be \\u escapes');
});

test('the zone row exists and does not overlap another', () => {
  const z = JSON.parse(read(root, 'tools', 'test', 'zones.json'));
  const list = z.zones || z;
  const mine = list.find((r) => r.id === 'maxplus_condensate');
  assert.ok(mine);
  assert.deepEqual(mine.tests, ['maxplus_condensate']);
  for (const o of list) {
    if (o === mine) continue;
    const overlap = o.x[0] <= mine.x[1] && mine.x[0] <= o.x[1] && o.z[0] <= mine.z[1] && mine.z[0] <= o.z[1] && o.y[0] <= mine.y[1] && mine.y[0] <= o.y[1];
    assert.ok(!overlap, `overlaps ${o.id}`);
  }
});
