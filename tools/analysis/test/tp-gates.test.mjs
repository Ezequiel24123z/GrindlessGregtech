// TP-G: the tier parity gates (T-COMP, T-COUNT, T-CIRC, T-HULL, T-VOLT in lib/recipe_quality.mjs, the tooltip lint) on tiny in-memory facts.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compareBaseline, evaluate, extractFacts, tierComponent, vaOf } from '../lib/recipe_quality.mjs';
import { controllersOf, lint } from '../tooltip-lint.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const real = JSON.parse(fs.readFileSync(path.join(here, '..', 'recipe_quality.json'), 'utf8'));
const cfg = { ...real, extraControllers: [], baseline: {} };

const it = (id, n = 1) => ({ id, domain: true, n });
const rec = (o) => ({ id: 'grindless:r', file: 'pack/kubejs/server_scripts/grindless/uev/a.js', form: 'assembly_line', type: 'x', outputs: ['gtceu:big_machine'], items: [], fluids: [], research: 'station', eut: null, ...o });
const facts = (recipes, extra = {}) => ({ controllers: ['gtceu:big_machine'], parts: [], machines: [], recipes, ...extra });
const tp = (r, extra, c = cfg) => evaluate(facts([r], extra), c).filter((f) => f.code.startsWith('T-')).map((f) => f.code).sort();
const comps = (tier, ns = 'gtceu') => ['electric_motor', 'robot_arm', 'sensor'].map((f) => it(`${ns}:${tier}_${f}`, 3));
const circ = (n = 4) => it('#gtceu:circuits/uev', n);
const good = () => rec({ items: [...comps('uev'), circ()], eut: vaOf(10) });

test('1:1 retired conversions are exempt from every gate; our uev components are components, not singles', () => {
  const conv = rec({ id: 'grindless:crafting/retired/uev_sensor', form: 'crafting', outputs: ['gtceu:uev_sensor'], items: [it('grindless:uev_sensor')] });
  assert.deepEqual(evaluate(facts([conv]), cfg), []);
  const own = rec({ id: 'grindless:assembler/uev_sensor', form: 'assembler', outputs: ['gtceu:uev_sensor'], items: [it('x:a')] });
  assert.ok(!evaluate(facts([own]), cfg).some((f) => f.code === 'S-FORM'));
});

test('VA is floor(V * 15 / 16) with V = 8 * 4^t', () => {
  assert.equal(vaOf(8), 491520);
  assert.equal(vaOf(13), 536870912 * 15 / 16);
});

test('the nine families in both namespaces; grindless only for uev, uiv and uxv', () => {
  assert.deepEqual(tierComponent('gtceu:uhv_fluid_regulator'), { tier: 9, family: 'fluid_regulator' });
  assert.deepEqual(tierComponent('grindless:uev_robot_arm'), { tier: 10, family: 'robot_arm' });
  assert.deepEqual(tierComponent('gtceu:max_sensor'), { tier: 14, family: 'sensor' });
  assert.equal(tierComponent('grindless:uv_robot_arm'), null);
  assert.equal(tierComponent('gtceu:uev_voltage_coil'), null);
});

test('a controller that meets every gate is clean', () => assert.deepEqual(tp(good()), []));

test('T-COMP: no tier component below N, in both namespaces; other tiered items are not checked', () => {
  assert.deepEqual(tp({ ...good(), items: [...good().items, it('gtceu:uhv_emitter')] }), ['T-COMP']);
  const uiv = (item) => ({ ...good(), file: 'pack/kubejs/server_scripts/grindless/uiv/a.js', items: [...comps('uiv'), it('#gtceu:circuits/uiv', 4), it(item)], eut: vaOf(11) });
  assert.deepEqual(tp(uiv('grindless:uev_emitter')), ['T-COMP'], 'the retired grindless: ids are checked like gtceu: ones');
  assert.deepEqual(tp(uiv('grindless:uiv_emitter')), []);
  assert.deepEqual(tp({ ...good(), items: [...good().items, it('gtceu:uv_voltage_coil'), it('gtceu:uv_battery')] }), []);
});

test('T-COMP: a tier component recipe may use tier N-1, not lower', () => {
  const r = (item) => rec({ outputs: ['gtceu:uev_electric_pump'], items: [it(item), circ()], eut: vaOf(9), form: 'assembler' });
  assert.deepEqual(tp(r('gtceu:uhv_electric_motor')), []);
  assert.deepEqual(tp(r('grindless:uhv_electric_motor')), []);
  assert.deepEqual(tp(r('gtceu:uv_electric_motor')), ['T-COMP']);
});

test('T-COUNT: controllers need 8 tier components of N+ from 3 families; hatches, singles and complex parts 2', () => {
  assert.deepEqual(tp({ ...good(), items: [...comps('uev').slice(0, 2).map((i) => ({ ...i, n: 4 })), circ()] }), ['T-COUNT'], 'two families');
  assert.deepEqual(tp({ ...good(), items: [...comps('uev').map((i) => ({ ...i, n: 2 })), circ()] }), ['T-COUNT'], '6 components');
  assert.deepEqual(tp({ ...good(), items: [...comps('uiv').map((i) => ({ ...i, n: 3 })), circ()] }), [], 'a higher tier counts');
  const hatch = (items) => rec({ outputs: ['gtceu:uev_input_hatch'], items: [...items, circ(1)], eut: vaOf(10), form: 'assembly_line' });
  assert.deepEqual(tp(hatch([it('gtceu:uev_sensor', 2)])), []);
  assert.deepEqual(tp(hatch([it('gtceu:uev_sensor', 1)])), ['T-COUNT']);
  const part = (out, n) => rec({ outputs: [out], items: [it('gtceu:uev_sensor', n), circ(1)], eut: vaOf(10) });
  assert.deepEqual(tp(part('grindless:grav_lens', 1), { parts: ['grindless:grav_lens'] }), ['T-COUNT']);
  assert.deepEqual(tp(part('grindless:big_casing', 0), { parts: ['grindless:big_casing'] }), [], 'a bulk part needs no components');
  const single = rec({ outputs: ['gtceu:uev_widget'], items: [it('gtceu:uev_sensor', 1), circ(1)], eut: vaOf(10) });
  assert.deepEqual(tp(single, { machines: ['gtceu:uev_widget'] }), ['T-COUNT']);
});

test('T-CIRC: the highest circuit tier is N and a controller takes 4 of tier N; concrete items come from circuitTier', () => {
  const noCirc = { ...good(), items: comps('uev') };
  assert.deepEqual(tp(noCirc), ['T-CIRC']);
  assert.deepEqual(tp({ ...good(), items: [...comps('uev'), it('#gtceu:circuits/uhv', 4)] }), ['T-CIRC'], 'a lower tier');
  assert.deepEqual(tp({ ...good(), items: [...comps('uev'), circ(4), it('#gtceu:circuits/uiv', 1)] }), ['T-CIRC'], 'a higher tier is not N either');
  assert.deepEqual(tp({ ...good(), items: [...comps('uev'), circ(3)] }), ['T-CIRC'], 'fewer than 4');
  assert.deepEqual(tp({ ...good(), items: [...comps('uev'), it('gtnn:optical_computer', 4)] }), [], 'optical computer is uev');
  assert.deepEqual(tp({ ...good(), items: [...comps('uev'), it('gtnn:optical_computer', 4)] }, {}, { ...cfg, circuitTier: {} }), ['T-CIRC'], 'unknown concrete item');
  assert.equal(real.circuitTier['gtnn:optical_mainframe'], 'uiv');
  assert.equal(real.circuitTier['gtnn:spintronic_mainframe'], 'uxv');
  assert.equal(real.circuitTier['gtceu:wetware_processor_mainframe'], 'uhv');
});

test('T-HULL: a machine hull input is tier N', () => {
  const r = (hull) => ({ ...good(), items: [...good().items, it(hull)] });
  assert.deepEqual(tp(r('gtceu:uev_machine_hull')), []);
  assert.deepEqual(tp(r('gtceu:uv_machine_hull')), ['T-HULL']);
  assert.deepEqual(tp(r('gtceu:uiv_machine_hull')), ['T-HULL']);
});

test('T-VOLT: EU/t >= VA[N]; recipes without EU/t (crafting) are skipped', () => {
  assert.deepEqual(tp({ ...good(), eut: vaOf(10) - 1 }), ['T-VOLT']);
  assert.deepEqual(tp({ ...good(), eut: vaOf(9) }), ['T-VOLT'], 'the UHV voltage is one tier short');
  assert.deepEqual(tp({ ...good(), eut: null, form: 'crafting' }), []);
});

test('T-VOLT: tier components, hulls and the 2 A energy hatches only need VA[N-1]; the bootstrap list too', () => {
  const comp = (eut, out = 'gtceu:uev_emitter') => rec({ outputs: [out], items: [it('gtceu:uhv_sensor'), circ()], eut, form: 'assembler' });
  assert.deepEqual(tp(comp(vaOf(9))), []);
  assert.deepEqual(tp(comp(vaOf(9), 'grindless:uev_emitter')), []);
  assert.deepEqual(tp(comp(vaOf(9) - 1)), ['T-VOLT']);
  const hull = rec({ outputs: ['gtceu:uev_machine_hull'], items: [], eut: vaOf(9), form: 'assembler' });
  assert.deepEqual(tp(hull), []);
  const hatch = (out, eut) => rec({ outputs: [out], items: [...comps('uev').slice(0, 1).map((i) => ({ ...i, n: 2 })), circ(1)], eut });
  assert.deepEqual(tp(hatch('gtceu:uev_energy_input_hatch', vaOf(9))), []);
  assert.deepEqual(tp(hatch('gtceu:uev_energy_output_hatch', vaOf(9))), []);
  assert.deepEqual(tp(hatch('gtceu:uev_input_hatch', vaOf(9))), ['T-VOLT'], 'an ordinary hatch needs VA[N]');
  const none = { ...cfg, voltBootstrap: [] };
  assert.deepEqual(tp(hatch('gtceu:uev_energy_input_hatch_16a', vaOf(9)), {}, none), ['T-VOLT'], 'not on the bootstrap list');
  assert.deepEqual(tp(hatch('gtceu:uev_energy_input_hatch_16a', vaOf(9))), [], 'the committed list has the multi-amp hatches');
  const boot = { ...cfg, voltBootstrap: ['^gtceu:uev_energy_input_hatch_16a$', 'grindless:first_works'] };
  assert.deepEqual(tp(hatch('gtceu:uev_energy_input_hatch_16a', vaOf(9)), {}, boot), []);
  assert.deepEqual(tp({ ...good(), id: 'grindless:first_works', eut: vaOf(9) }, {}, boot), [], 'by recipe id');
  assert.deepEqual(tp({ ...good(), eut: vaOf(9) - 1 }, {}, boot), ['T-VOLT']);
});

test('the gates start at UHV: a UV recipe is not held to them', () => {
  assert.deepEqual(tp({ ...good(), file: 'pack/kubejs/server_scripts/grindless/uv/a.js', items: [it('gtceu:luv_motor')], eut: 1 }), []);
});

test('a tier component keeps its baseline key when grindless:uev_x becomes gtceu:uev_x', () => {
  const r = rec({ id: 'grindless:assembler/uev_sensor', outputs: ['grindless:uev_sensor'], items: [it('gtceu:uv_sensor')], eut: 1, form: 'assembler' });
  const before = evaluate(facts([r]), cfg).filter((f) => f.code.startsWith('T-'));
  const after = evaluate(facts([{ ...r, outputs: ['gtceu:uev_sensor'] }]), cfg).filter((f) => f.code.startsWith('T-'));
  assert.deepEqual(before.map((f) => f.code), after.map((f) => f.code));
  const baseline = Object.fromEntries([...new Set(before.map((f) => f.code))].map((c) => [`${r.id}|grindless:uev_sensor`, [c]]));
  const merged = { [`${r.id}|grindless:uev_sensor`]: [...new Set(before.map((f) => f.code))] };
  assert.deepEqual(compareBaseline(after, merged), { fresh: [], stale: [] });
  assert.deepEqual(compareBaseline(before, merged), { fresh: [], stale: [] });
  assert.ok(baseline);
});

test('item counts: crafting counts pattern cells per key, machine recipes the content count', () => {
  const registry = { items: new Map(), blocks: new Map(), machines: new Map(), fluids: new Map(), recipeTypes: new Map() };
  const recipes = new Map([
    ['a', { id: 'a', type: 'minecraft:crafting_shaped', added: true, json: { pattern: ['SSS', 'S S', 'MMM'], key: { S: { item: 'gtceu:uhv_sensor' }, M: { item: 'gtceu:uhv_electric_motor' } }, result: { item: 'gtceu:big_machine' } } }],
    ['b', { id: 'b', type: 'gtceu:assembly_line', added: true, json: {
      inputs: { item: [{ content: { type: 'gtceu:sized', count: 6, ingredient: { item: 'gtceu:uhv_sensor' } } }] },
      outputs: { item: [{ content: { type: 'gtceu:sized', count: 1, ingredient: { item: 'gtceu:big_machine' } } }] },
      tickInputs: { eu: [{ content: 1966080 }] } } }],
  ]);
  const f = extractFacts({ recipes, recipeFiles: new Map(), registry, structures: new Map([['gtceu:big_machine', { symbols: {} }]]) });
  const byId = Object.fromEntries(f.recipes.map((r) => [r.id, r]));
  assert.deepEqual(byId.a.items.map((i) => [i.id, i.n]), [['gtceu:uhv_sensor', 5], ['gtceu:uhv_electric_motor', 3]]);
  assert.equal(byId.a.eut, null);
  assert.deepEqual(byId.b.items.map((i) => [i.id, i.n]), [['gtceu:uhv_sensor', 6]]);
  assert.equal(byId.b.eut, 1966080);
});

// ---------------------------------------------------------------- tooltip lint (TP-D5)

const ctrl = (o = {}) => ({ id: 'gtceu:works', name: 'works', era: 'uev', entries: 3, ...o });
const langOf = (en, es = en) => ({ en_us: Object.fromEntries(en.map((t, n) => [`grindless.machine.works.tooltip.${n}`, t])), es_es: Object.fromEntries(es.map((t, n) => [`grindless.machine.works.tooltip.${n}`, t])) });
const codes = (c, lang) => lint([c], lang).map((f) => f.code);

test('tooltip lint: a short §7 tooltip.0 and short lines are clean', () => {
  assert.deepEqual(codes(ctrl(), langOf(['§7Makes things.', 'Takes A and B', 'Output: C'])), []);
});

test('tooltip lint: more than 4 entries', () => {
  assert.deepEqual(codes(ctrl({ entries: 5 }), langOf(['§7Makes things.'])), ['TT-COUNT']);
  assert.deepEqual(codes(ctrl({ entries: 4 }), langOf(['§7Makes things.'])), []);
});

test('tooltip lint: tooltip.0 exists, starts with §7 and has at most 80 visible characters', () => {
  assert.deepEqual(codes(ctrl(), { en_us: {}, es_es: {} }), ['TT-FIRST', 'TT-FIRST']);
  assert.deepEqual(codes(ctrl(), langOf(['Makes things.'])), ['TT-FIRST', 'TT-FIRST']);
  assert.deepEqual(codes(ctrl(), langOf(['§7' + 'x'.repeat(81)])), ['TT-FIRST-LEN', 'TT-FIRST-LEN']);
  assert.deepEqual(codes(ctrl(), langOf(['§7' + 'x'.repeat(78)])), []);
  assert.deepEqual(codes(ctrl(), langOf(['§7§l' + 'x'.repeat(80)])), [], 'formatting codes are not counted');
});

test('tooltip lint: other lines have at most 60 visible characters', () => {
  assert.deepEqual(codes(ctrl(), langOf(['§7a', '§a' + 'x'.repeat(60)])), []);
  assert.deepEqual(codes(ctrl(), langOf(['§7a', '§a' + 'x'.repeat(61)], ['§7a', 'ok'])), ['TT-LEN']);
});

test('tooltip lint: en_us and es_es have the same tooltip keys', () => {
  assert.deepEqual(codes(ctrl(), langOf(['§7a', 'b'], ['§7a'])), ['TT-PARITY']);
});

test('tooltip lint: controllers come from the registry (multiblocks of ours only) with the array length', () => {
  const m = (id, kind, file, tooltips) => [id, { id, name: id.replace('gtceu:', ''), kind, file, tooltips }];
  const registry = { machines: new Map([
    m('gtceu:a', 'multiblock', 'startup_scripts/grindless/uev/a.js', ['k0', null, 'k2']),
    m('gtceu:b', 'simple', 'startup_scripts/grindless/uev/b.js', []),
    m('gtceu:c', 'multiblock', 'startup_scripts/other/c.js', []),
    m('gtceu:d', 'multiblock', 'startup_scripts/grindless/uhv/d.js', undefined),
  ]) };
  assert.deepEqual(controllersOf(registry).map((c) => [c.id, c.era, c.entries]), [['gtceu:a', 'uev', 3], ['gtceu:d', 'uhv', 0]]);
});
