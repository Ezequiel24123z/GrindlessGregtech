// QR-C0: the recipe quality gate (tools/analysis/recipe-quality.mjs), no game needed.
//   - the ladder rules on synthetic facts: controllers per tier, parts, hatches, singles, soso crafts;
//   - the baseline ratchet: a new violation or a fixed (stale) entry fails;
//   - the pack itself: no violation outside tools/analysis/recipe_quality.json "baseline", and the three pilot controllers are clean.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compareBaseline, depthMap, evaluate } from '../lib/recipe_quality.mjs';
import { factsFromPack } from '../recipe-quality.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(fs.readFileSync(path.join(here, '..', 'recipe_quality.json'), 'utf8'));

const it = (id, domain = false) => ({ id, domain });
const rec = (o) => ({ id: 'grindless:x', file: 'f', form: 'crafting', type: 'x', outputs: ['gtceu:big_machine'], items: [], fluids: [], research: null, ...o });
const facts = (recipes, extra = {}) => ({ controllers: ['gtceu:big_machine'], parts: [], machines: [], recipes, ...extra });
const codes = (r, extra) => evaluate(facts([r], extra), { ...cfg, eraTier: { ...cfg.eraTier, t: 0 }, extraControllers: [] }).map((f) => f.code).filter((c) => !c.startsWith('T-')).sort(); // T-* gates: test/tp-gates.test.mjs
const forTier = (era, r) => rec({ id: `grindless:${era}`, file: `pack/kubejs/server_scripts/grindless/${era}/a.js`, ...r });
const five = [it('a'), it('b'), it('c'), it('d'), it('e')];

test('a controller made at the crafting table fails from EV on', () => {
  const v = codes(forTier('ev', { items: five.map((i) => it(i.id, true)) }));
  assert.ok(v.includes('C-FORM'));
  assert.ok(v.includes('C-FLUID'));
});

test('EV assembler with a fluid and domain inputs is clean', () => {
  const r = forTier('ev', { form: 'assembler', items: [it('a', true), it('b', true), it('c'), it('d'), it('e')], fluids: [it('gtceu:ammonia')] });
  assert.deepEqual(codes(r), []);
});

test('LuV needs an assembly line, solder and lubricant or a polymer', () => {
  const base = { items: [it('a', true), it('b', true), it('c'), it('d'), it('e')] };
  assert.ok(codes(forTier('luv', { ...base, form: 'assembler', fluids: [it('gtceu:ammonia')] })).includes('C-FORM'));
  assert.ok(codes(forTier('luv', { ...base, form: 'assembly_line', fluids: [it('gtceu:soldering_alloy')] })).includes('C-FLUID'));
  assert.deepEqual(codes(forTier('luv', { ...base, form: 'assembly_line', fluids: [it('gtceu:soldering_alloy'), it('gtceu:lubricant')] })), []);
});

test('ZPM needs research; UV and later need station research, an era fluid and 3 domain inputs', () => {
  const base = { form: 'assembly_line', items: [it('a', true), it('b', true), it('c', true), it('d'), it('e')], fluids: [it('gtceu:soldering_alloy'), it('gtceu:neutronium')] };
  assert.ok(codes(forTier('zpm', base)).includes('C-RESEARCH'));
  assert.deepEqual(codes(forTier('zpm', { ...base, research: 'scanner' })), []);
  assert.ok(codes(forTier('uhv', { ...base, research: 'scanner' })).includes('C-RESEARCH'));
  assert.deepEqual(codes(forTier('uhv', { ...base, research: 'station' })), []);
  assert.ok(codes(forTier('uhv', { ...base, research: 'station', items: base.items.map((i) => ({ ...i, domain: false })) })).includes('C-DOMAIN'));
  assert.ok(codes(forTier('uhv', { ...base, research: 'station', fluids: [it('gtceu:soldering_alloy')] })).includes('C-FLUID'));
});

test('a controller with fewer than 5 distinct ingredients fails C-DISTINCT', () => {
  const r = forTier('iv', { form: 'assembler', items: [it('a', true), it('b', true), it('a', true)], fluids: [it('gtceu:ammonia')] });
  assert.ok(codes(r).includes('C-DISTINCT'));
});

test('parts and hatches follow their ladder', () => {
  const part = { parts: ['gtceu:big_casing'] };
  const r = forTier('iv', { outputs: ['gtceu:big_casing'], items: [it('a'), it('b')] });
  assert.ok(codes(r, part).includes('P-FORM'));
  assert.deepEqual(codes({ ...r, form: 'assembler' }, part), []);
  const hatch = forTier('uhv', { outputs: ['gtceu:uhv_input_hatch'], form: 'assembler', items: [it('a')] });
  assert.ok(codes(hatch).includes('H-FORM'));
});

test('a trivial crafting-table recipe at EV+ is soso unless it is a same-stem conversion', () => {
  const soso = forTier('iv', { outputs: ['grindless:iv_widget'], items: [it('grindless:iv_part'), it('gtceu:iv_plate')] });
  assert.ok(codes(soso, { controllers: [] }).includes('X-SOSO'));
  const pack = forTier('iv', { outputs: ['grindless:iv_widget'], items: [it('grindless:iv_widget_block')] });
  assert.ok(!codes(pack, { controllers: [] }).includes('X-SOSO'));
});

test('baseline ratchet: fresh violations and stale entries both fail', () => {
  const f = [{ code: 'C-FORM', recipe: 'r', output: 'o' }];
  assert.equal(compareBaseline(f, { 'r|o': ['C-FORM'] }).fresh.length, 0);
  assert.equal(compareBaseline(f, {}).fresh.length, 1);
  assert.equal(compareBaseline([], { 'r|o': ['C-FORM'] }).stale.length, 1);
});

test('the pack has no recipe-quality violation outside the baseline, and the pilots are clean', { timeout: 900000 }, () => {
  const all = evaluate(factsFromPack(), cfg);
  const { fresh, stale } = compareBaseline(all, cfg.baseline);
  assert.deepEqual(fresh.map((f) => `${f.code} ${f.output} ${f.recipe}`), [], 'fix the recipe, never the baseline');
  assert.deepEqual(stale, [], 'fixed: run node tools/analysis/recipe-quality.mjs --write-baseline');
  const pilots = ['cryogenic_plant', 'waste_retrieval_plant', 'actinide_partitioning_plant', 'electron_beam_furnace', 'single_crystal_foundry'];
  for (const p of pilots) assert.ok(!all.some((f) => f.output === `gtceu:${p}` && !f.code.startsWith('T-')), p + ' meets the ladder');
});

test('no script calls scannerResearch with a callback: Rhino hands the function to the ItemStack overload as an empty stack', () => {
  const root = path.join(here, '..', '..', '..', 'pack', 'kubejs');
  const hits = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.js')) {
        fs.readFileSync(p, 'utf8').split('\n').forEach((l, i) => {
          if (/scannerResearch\s*\(\s*(function\b|\(?\s*[a-zA-Z_$]*\s*\)?\s*=>)/.test(l)) hits.push(`${path.relative(root, p)}:${i + 1}`);
        });
      }
    }
  };
  walk(root);
  assert.deepEqual(hits, [], 'use scannerResearch(Item.of(<stack>)); GTM 7.5.3 overloads it with (UnaryOperator) and (ItemStack)');
});

test('depthMap: order-independent, loops our recipes never bootstrap count their edge back as raw', () => {
  // ore -> dust (1) -> plate (2); a recycle loop catalyst <-> spent must not undercut the catalyst's bootstrap
  const g = [
    { o: ['dust'], i: ['ore'] }, { o: ['plate'], i: ['dust'] },
    { o: ['catalyst'], i: ['plate', 'acid'] }, { o: ['spent'], i: ['catalyst'] }, { o: ['catalyst'], i: ['spent', 'acid'] },
    // pearl <-> model, with no recipe of ours that starts the loop; the model also needs a plate
    { o: ['pearl'], i: ['model'] }, { o: ['model'], i: ['pearl', 'plate'] }, { o: ['wand'], i: ['pearl'] },
  ];
  const ids = ['ore', 'dust', 'plate', 'catalyst', 'spent', 'model', 'pearl', 'wand'];
  const want = { ore: 0, dust: 1, plate: 2, catalyst: 3, spent: 4, model: 3, pearl: 1, wand: 2 };
  for (const order of [ids, [...ids].reverse(), ['wand', 'spent', 'pearl', 'catalyst', 'model', 'ore', 'plate', 'dust']]) {
    const d = depthMap(g);
    assert.deepEqual(Object.fromEntries(order.map((id) => [id, d(id)])), Object.fromEntries(order.map((id) => [id, want[id]])));
  }
  const rev = depthMap([...g].reverse());
  assert.deepEqual(Object.fromEntries(ids.map((id) => [id, rev(id)])), want);
});

test('depthMap: a loop through another mod\'s stack is cut at that stack, not across the whole loop', () => {
  // a spent target returns the copper plate its mod makes outside the loop; cutting every loop edge would put target at 1
  const g = [
    { o: ['grindless:dust'], i: ['ore'] }, { o: ['grindless:powder'], i: ['grindless:dust', 'gtceu:copper_plate'] },
    { o: ['grindless:blank'], i: ['grindless:powder'] }, { o: ['grindless:target'], i: ['gtceu:copper_plate', 'grindless:blank'] },
    { o: ['grindless:spent'], i: ['grindless:target'] }, { o: ['gtceu:copper_plate', 'grindless:powder'], i: ['grindless:spent'] },
  ];
  const want = { 'grindless:dust': 1, 'gtceu:copper_plate': 1, 'grindless:powder': 2, 'grindless:blank': 3, 'grindless:target': 4, 'grindless:spent': 5 };
  for (const graph of [g, [...g].reverse()]) {
    const d = depthMap(graph);
    assert.deepEqual(Object.fromEntries(Object.keys(want).map((id) => [id, d(id)])), want);
  }
  const owned = depthMap(g, () => true);
  assert.equal(owned('grindless:target'), 1, 'with no foreign stack the whole loop is cut, as before');
});