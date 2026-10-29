// IV features of the validator (2026-10-25): per-machine recipe allowlists (`onlyRecipes`), generators read from their own recipes
// (synthetic `recipesOf`), the assembly line's research (conditions.research.researchKeys), sibling substages (`eraSiblings`) and
// planet-only generator rules in the era view; variants built with an optional part (`requireAbilities`, IV-B6's parallel hatch) and
// optional parts next to a casing with a minimum.
import test from 'node:test';
import assert from 'node:assert/strict';
import { researchIdOf } from '../lib/normalize.mjs';
import { structureSelectors } from '../lib/structure.mjs';
import { gt, gi, gf, mkDump, run, verdicts } from './helpers.mjs';

const dim = (d) => ({ type: 'dimension', dimension: d });

function drills(machines) {
  const recipes = [
    gt('t:vein_drilling/iv/pressurized_a', 't:drilling', { ins: [gi('t:sample_a', 1, 0)], outs: [gi('t:ore_a')] }),
    gt('t:vein_drilling/iv/mercury_b', 't:drilling', { ins: [gi('t:sample_b', 1, 0)], outs: [gi('t:ore_b')] }),
    gt('t:vein_drilling/ev/c', 't:drilling', { ins: [gi('t:sample_c', 1, 0)], outs: [gi('t:ore_c')] }),
  ];
  const cfg = {
    tier: 'lv',
    eraOrder: ['steam', 'lv'],
    world: [{ id: 'kit', mode: 'manual', bootstrap: true, items: ['t:sample_a', 't:sample_b', 't:sample_c', ...machines.map((m) => m.machine)] }],
    machines,
    targets: [
      { id: 'a', item: 't:ore_a' },
      { id: 'b', item: 't:ore_b' },
      { id: 'c', item: 't:ore_c' },
      { id: 'b-only-mercury', kind: 'recipe', recipe: 't:vein_drilling/iv/mercury_*', without: ['operate:t:mercury_drill'], expect: 'unreachable' },
    ],
  };
  return [mkDump({ recipes, items: ['t:ore_a', 't:ore_b', 't:ore_c', ...machines.map((m) => m.machine)] }), cfg];
}

test('onlyRecipes: two machines of one type and tier folder take only their own prefix (the pressurized and Mercury drills)', () => {
  const machines = [
    { machine: 't:pressurized_drill', types: ['t:drilling'], onlyTier: 'iv', onlyRecipes: ['t:vein_drilling/iv/pressurized_*'] },
    { machine: 't:mercury_drill', types: ['t:drilling'], onlyTier: 'iv', onlyRecipes: ['t:vein_drilling/iv/mercury_*'] },
  ];
  let r = run(...drills(machines));
  assert.deepEqual(verdicts(r.out.gate), { a: 'PASS', b: 'PASS', c: 'FAIL', 'b-only-mercury': 'PASS' });
  const dead = r.model.g.rules.find((x) => x.name === 't:vein_drilling/ev/c').slots.find((s) => s.role === 'machine');
  assert.ok(/takes t:vein_drilling\/ev\/c \(the family's veto: its tier folders and the machines' recipe allowlists\)/.test(dead.label), dead.label);
  // with onlyTier alone both drills would run each other's recipes: the leak check catches it
  r = run(...drills(machines.map(({ onlyRecipes, ...m }) => m)));
  assert.equal(verdicts(r.out.gate)['b-only-mercury'], 'FAIL');
  // an empty allowlist is a config warning
  r = run(...drills([{ machine: 't:mercury_drill', types: ['t:drilling'], onlyRecipes: [] }]));
  assert.ok(r.model.warnings.some((w) => /onlyRecipes is empty/.test(w)), r.model.warnings.join('\n'));
});

function generators(extra = {}) {
  const recipes = [
    gt('t:fission/leu', 't:fission_core', { ins: [gi('t:assembly', 1, 50)], fins: [gf('t:water')], outs: [gi('t:spent', 1, 50)], eut: 0 }),
    gt('t:venus_heat/ground', 't:venus_heat', { fins: [gf('t:distilled_water')], eut: 0, conditions: [dim('t:venus')] }),
    gt('t:assembly', 't:fab', { ins: [gi('t:uranium')], outs: [gi('t:assembly')] }),
    gt('t:press', 't:presser', { ins: [gi('t:sand')], outs: [gi('t:glass')], eut: 2000 }),
  ];
  const cfg = {
    tier: 'lv',
    eraOrder: ['steam', 'lv', 'mv'],
    conditions: { dimension: { asKeysFor: ['t:venus'] } },
    world: [
      { id: 'w', mode: 'manual', bootstrap: true, items: ['t:sand', 't:reactor', 't:engine', 't:fab_m', 't:press_m'] },
      { id: 'mine', mode: 'auto', items: ['t:uranium', 'fluid:t:water', 'fluid:t:distilled_water'] },
    ],
    machines: [
      { machine: 't:reactor', types: ['t:fission_core'] },
      { machine: 't:engine', types: ['t:venus_heat'] },
      { machine: 't:fab_m', types: ['t:fab'] },
      { machine: 't:press_m', types: ['t:presser'], needs: ['eu:iv'] },
    ],
    synthetic: [
      { id: 'fission', recipesOf: ['t:fission_core'], produces: ['eu:iv'] },
      { id: 'venus-heat', recipesOf: 't:venus_heat', produces: ['eu:iv'] },
      { id: 'nothing', recipesOf: ['t:no_such_type'], produces: ['eu:iv'] },
      ...(extra.synthetic || []),
    ],
    targets: [
      { id: 'glass', item: 't:glass' },
      { id: 'glass-no-fission', item: 't:glass', without: ['synthetic:fission'] },
      { id: 'glass-no-generators', item: 't:glass', without: ['synthetic:fission', 'synthetic:venus-heat'], expect: 'unreachable' },
    ],
    autoTargets: [{ id: 'auto-eu', item: 'eu:iv' }],
  };
  return [mkDump({ recipes, fluids: ['t:water', 't:distilled_water'], items: ['t:glass', 't:reactor', 't:engine', 't:fab_m', 't:press_m'] }), cfg];
}

test('recipesOf: a generator type gives its energy through each of its recipes, with their machine, fuel and site', () => {
  const r = run(...generators());
  const syn = r.model.g.rules.filter((x) => x.name === 'synthetic:fission');
  assert.equal(syn.length, 1);
  assert.equal(syn[0].meta.recipe, 't:fission/leu');
  assert.ok(syn[0].slots.some((s) => s.role === 'machine' && s.alts.some((a) => r.model.g.keyNames[a] === 'run:t:reactor')));
  assert.ok(syn[0].slots.some((s) => s.alts.some((a) => r.model.g.keyNames[a] === 't:assembly')), 'the chanced assembly is a slot');
  const heat = r.model.g.rules.find((x) => x.name === 'synthetic:venus-heat');
  assert.deepEqual(heat.meta.dims, ['t:venus']);
  assert.ok(heat.slots.some((s) => s.role === 'cond' && s.alts.some((a) => r.model.g.keyNames[a] === 'dim:t:venus')), 'its site needs the trip\'s key');
  assert.deepEqual(verdicts(r.out.gate), { glass: 'PASS', 'glass-no-fission': 'FAIL', 'glass-no-generators': 'PASS' }, 'no Venus key: only the reactor powers it');
  assert.ok(r.model.warnings.some((w) => /synthetic nothing: no recipe of t:no_such_type/.test(w)), r.model.warnings.join('\n'));
  assert.equal(verdicts(r.out.auto)['auto-eu'], 'PASS');
  // with the trip, the engine powers it too
  const [dump, cfg] = generators({ synthetic: [{ id: 'trip', produces: ['dim:t:venus'] }] });
  const r2 = run(dump, cfg);
  assert.deepEqual(verdicts(r2.out.gate), { glass: 'PASS', 'glass-no-fission': 'PASS', 'glass-no-generators': 'PASS' });
});

test('research: the scanner\'s data stick carries research:<id>, which the assembly line recipe\'s research condition needs', () => {
  const stick = (id) => ({
    content: { type: 'gtceu:sized', count: 1, ingredient: { type: 'forge:nbt', item: 't:data_stick', count: 1, nbt: `{assembly_line_research:{research_id:"${id}",research_type:"gtceu:assembly_line"}}` } },
    chance: 10000, maxChance: 10000, tierChanceBoost: 0,
  });
  assert.equal(researchIdOf(stick('1x_t_motor').content), '1x_t_motor');
  assert.equal(researchIdOf({ ingredient: { item: 't:x', nbt: { assembly_line_research: { research_id: 'obj' } } } }), 'obj');
  assert.equal(researchIdOf(gi('t:plain').content), null);
  const cond = { type: 'research', research: [{ researchId: '1x_t_motor', dataItem: { id: 't:data_stick', Count: 1 } }] };
  const recipes = [
    { ...gt('t:scan_motor', 't:scanner', { ins: [gi('t:data_stick'), gi('t:motor')] }), json: { ...gt('t:scan_motor', 't:scanner', { ins: [gi('t:data_stick'), gi('t:motor')] }).json, outputs: { item: [stick('1x_t_motor')] } } },
    gt('t:line_motor', 't:assembly_line', { ins: [gi('t:motor', 2)], outs: [gi('t:big_motor')], conditions: [cond] }),
    gt('t:line_other', 't:assembly_line', { ins: [gi('t:motor')], outs: [gi('t:other')], conditions: [{ type: 'research', research: [{ researchId: '1x_t_unknown' }] }] }),
  ];
  const cfg = (researchRule) => ({
    tier: 'lv',
    eraOrder: ['steam', 'lv'],
    conditions: { ...(researchRule ? { research: researchRule } : { research: { unsupported: true } }) },
    world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:data_stick', 't:motor', 't:scanner_m', 't:line_m'] }],
    machines: [{ machine: 't:scanner_m', types: ['t:scanner'] }, { machine: 't:line_m', types: ['t:assembly_line'] }],
    targets: [
      { id: 'research', item: 'research:1x_t_motor' },
      { id: 'big-motor', item: 't:big_motor' },
      { id: 'other', item: 't:other' },
      { id: 'big-motor-needs-scan', item: 't:big_motor', without: ['t:scan_motor'], expect: 'unreachable' },
    ],
  });
  const dump = mkDump({ recipes, items: ['t:big_motor', 't:other', 't:scanner_m', 't:line_m'] });
  let r = run(dump, cfg({ researchKeys: true }));
  assert.deepEqual(verdicts(r.out.gate), { research: 'PASS', 'big-motor': 'PASS', other: 'FAIL', 'big-motor-needs-scan': 'PASS' });
  const slot = r.model.g.rules.find((x) => x.name === 't:line_motor').slots.find((s) => s.role === 'cond');
  assert.equal(slot.cap, true, 'the research is capital: scanned once');
  assert.equal(slot.label, 'research 1x_t_motor');
  // the old rule (unsupported) never meets it
  r = run(dump, cfg(null));
  assert.equal(verdicts(r.out.gate)['big-motor'], 'FAIL');
});

test('research: GTM\'s generated research (not in the dump) is synthesised, so a machine researched with what only it makes is a deadlock', () => {
  const res = (id) => ({ type: 'research', research: [{ researchId: id, dataItem: { id: 'gtceu:data_orb', Count: 1 } }] });
  const recipes = [
    gt('t:line_big', 't:assembly_line', { ins: [gi('t:motor', 2)], outs: [gi('t:big_motor')], conditions: [res('1x_t_motor')] }),
    gt('t:line_works', 't:assembly_line', { ins: [gi('t:motor')], outs: [gi('t:works_m')], conditions: [res('1x_t_ribbon')] }),
    gt('t:ribbon', 't:ribbon_making', { ins: [gi('t:motor')], outs: [gi('t:ribbon')] }),
  ];
  const cfg = (research) => ({
    tier: 'lv',
    eraOrder: ['steam', 'lv'],
    conditions: { research },
    world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['gtceu:data_orb', 't:motor', 't:station_m', 't:line_m'] }],
    machines: [{ machine: 't:station_m', types: ['gtceu:research_station'] }, { machine: 't:line_m', types: ['t:assembly_line'] },
      { machine: 't:works_m', types: ['t:ribbon_making'] }],
    targets: [{ id: 'big', item: 't:big_motor' }, { id: 'works', item: 't:works_m' }],
  });
  const dump = mkDump({ recipes, items: ['gtceu:data_orb', 't:motor', 't:big_motor', 't:ribbon', 't:works_m', 't:station_m', 't:line_m'] });
  let r = run(dump, cfg({ researchKeys: true }));
  assert.deepEqual(verdicts(r.out.gate), { big: 'PASS', works: 'FAIL' });
  assert.ok(r.model.g.rules.some((x) => x.name === 'synthetic:gtm-research/1x_t_motor'), 'the station research rule');
  assert.equal(r.model.stats.generatedResearch, 2);
  r = run(dump, cfg({ researchKeys: true, noGenerated: true }));
  assert.equal(verdicts(r.out.gate).big, 'FAIL', 'noGenerated: only the dump\'s research recipes count');
});

function siblingPack(siblings) {
  const recipes = [
    gt('t:make_naq', 't:drill', { ins: [gi('t:naq_sample', 1, 0)], outs: [gi('t:naquadah')], conditions: [dim('t:venus')] }),
    gt('t:make_iri', 't:drill', { ins: [gi('t:iri_sample', 1, 0)], outs: [gi('t:iridium')], conditions: [dim('t:mercury')] }),
    gt('t:venus_seed', 't:assembler', { ins: [gi('t:naquadah')], outs: [gi('t:venus_seed')] }),
    gt('t:mercury_gadget', 't:assembler', { ins: [gi('t:iridium'), gi('t:naquadah')], outs: [gi('t:mercury_gadget')] }),
    gt('t:gate', 't:assembler', { ins: [gi('t:iridium'), gi('t:naquadah')], outs: [gi('t:gate_item')] }),
    gt('t:venus_engine', 't:venus_heat', { fins: [gf('t:water')], conditions: [dim('t:venus')] }),
    gt('t:home_part', 't:presser', { ins: [gi('t:sand')], outs: [gi('t:home_part')], eut: 2000 }),
  ];
  const cfg = {
    tier: 'iv',
    eraOrder: ['steam', 'iv', 'iv-venus', 'iv-mercury', 'luv'],
    ...(siblings ? { eraSiblings: [['iv-venus', 'iv-mercury']] } : {}),
    conditions: { dimension: { asKeysFor: ['t:venus', 't:mercury'] } },
    world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:naq_sample', 't:iri_sample', 't:sand', 'fluid:t:water', 't:drill_m', 't:assembler_m', 't:engine', 't:press_m'] }],
    machines: [
      { machine: 't:drill_m', types: ['t:drill'] }, { machine: 't:assembler_m', types: ['t:assembler'] },
      { machine: 't:engine', types: ['t:venus_heat'] }, { machine: 't:press_m', types: ['t:presser'], needs: ['eu:iv'] },
    ],
    synthetic: [
      { id: 'trip', produces: ['dim:t:venus', 'dim:t:mercury'] },
      { id: 'venus-heat', recipesOf: ['t:venus_heat'], produces: ['eu:iv'] },
    ],
    eraResources: [
      { id: 'venus', era: 'iv-venus', dimensions: ['t:venus'] },
      { id: 'mercury', era: 'iv-mercury', dimensions: ['t:mercury'] },
      { id: 'naquadah', era: 'iv-venus', items: ['t:naquadah'], onlyFrom: ['venus'] },
      { id: 'iridium', era: 'iv-mercury', items: ['t:iridium'], onlyFrom: ['mercury'] },
    ],
    eraItems: [
      { id: 'venus-items', era: 'iv-venus', items: ['t:venus_seed'] },
      { id: 'mercury-items', era: 'iv-mercury', items: ['t:mercury_gadget'] },
      { id: 'home-items', era: 'iv', items: ['t:home_part'] },
      { id: 'output', era: 'luv', items: ['t:gate_item'] },
    ],
  };
  return [mkDump({ recipes, fluids: ['t:water'], items: ['t:naquadah', 't:iridium', 't:venus_seed', 't:mercury_gadget', 't:gate_item', 't:home_part', 't:drill_m', 't:assembler_m', 't:engine', 't:press_m'] }), cfg];
}

test('eraSiblings: Venus and Mercury are reached together, so neither may need the other; later eras may need both', () => {
  // linear order: Mercury comes "after" Venus, so a Mercury item may need naquadah
  let r = run(...siblingPack(false));
  let v = Object.fromEntries(r.out.eras.groups.map((x) => [x.group.id, x.verdict]));
  assert.deepEqual(v, { 'venus-items': 'PASS', 'mercury-items': 'PASS', 'home-items': 'FAIL', output: 'PASS' });
  // siblings: each is later than the other
  r = run(...siblingPack(true));
  v = Object.fromEntries(r.out.eras.groups.map((x) => [x.group.id, x.verdict]));
  assert.deepEqual(v, { 'venus-items': 'PASS', 'mercury-items': 'FAIL', 'home-items': 'FAIL', output: 'PASS' });
  const merc = r.out.eras.groups.find((x) => x.group.id === 'mercury-items');
  assert.deepEqual(merc.violations[0].resources.map((x) => x.id), ['naquadah']);
  assert.ok(r.out.eras.exclusive.every((x) => x.verdict === 'PASS'), 'naquadah only from Venus, iridium only from Mercury');
  // the home part needs IV power, which here only Venus's engine gives: the era view switches off the generator rule copied from
  // its Venus-only recipe (synthetic recipesOf), not just the recipe (the chain can't name the resource: the rule is off, not a key)
  const home = r.out.eras.groups.find((x) => x.group.id === 'home-items');
  assert.deepEqual(home.violations.map((x) => x.item), ['t:home_part']);
  assert.ok(!r.model.warnings.some((w) => /sibling/.test(w)));
});

test('eraSiblings: a sibling era that isn\'t in eraOrder is a config warning', () => {
  const [dump, cfg] = siblingPack(true);
  const r = run(dump, { ...cfg, eraSiblings: [['iv-venus', 'iv-moon']] });
  assert.ok(r.model.warnings.some((w) => /sibling era «iv-moon» isn't in eraOrder/.test(w)), r.model.warnings.join('\n'));
});

test('pos_y: an altitude condition in a source (Venus\'s clouds) is met on its planet; only the dimension key is needed', () => {
  const recipes = [
    gt('t:clouds', 't:gas_collector', { fouts: [gf('t:acid')], conditions: [dim('t:venus'), { type: 'pos_y', min: 240, max: 319 }] }),
  ];
  const base = {
    tier: 'iv', eraOrder: ['steam', 'iv'],
    world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:collector'] }],
    machines: [{ machine: 't:collector', types: ['t:gas_collector'] }],
    targets: [{ id: 'acid', fluid: 't:acid' }],
  };
  const dump = mkDump({ recipes, fluids: ['t:acid'], items: ['t:collector'] });
  const withTrip = { ...base, conditions: { dimension: { asKeysFor: ['t:venus'] }, pos_y: { ignore: true } }, synthetic: [{ id: 'trip', produces: ['dim:t:venus'] }] };
  assert.equal(verdicts(run(dump, withTrip).out.gate).acid, 'PASS');
  assert.equal(verdicts(run(dump, { ...withTrip, synthetic: [] }).out.gate).acid, 'FAIL', 'no trip, no clouds');
  // the steam tier's default ignores unknown conditions too ('*'), so the explicit rule only documents it
  assert.equal(verdicts(run(dump, { ...withTrip, conditions: { dimension: { asKeysFor: ['t:venus'] }, '*': { ignore: true } } }).out.gate).acid, 'PASS');
});

test('structureSelectors: a casing with a minimum and no maximum fills the rest, so an optional part next to it stays optional', () => {
  const desc = (casingLimits) => ({
    slices: [['XXXXS']],
    symbols: {
      S: { kind: 'controller' },
      X: {
        kind: 'oneOf',
        options: [
          { kind: 'blocks', blocks: ['x:casing'], limits: casingLimits },
          { kind: 'part', ability: 'energy_input', limits: { min: 1, max: 2 } },
          { kind: 'part', ability: 'parallel_hatch', limits: { max: 1, preview: 1 } },
        ],
      },
    },
  });
  const abilities = { energy_input: ['x:hatch'], parallel_hatch: ['x:parallel'] };
  let { selectors, problems } = structureSelectors(desc({ min: 2 }), abilities, () => true);
  assert.deepEqual(selectors.map((s) => s.anyOf), [['x:casing'], ['x:hatch']], 'the hot cell before the fix needed the parallel hatch');
  // an optional part that isn't needed doesn't need its ability configured either
  ({ selectors, problems } = structureSelectors(desc({ min: 2 }), { energy_input: ['x:hatch'] }, () => true));
  assert.deepEqual(problems, []);
  // a capped casing: one casing and two hatches can't fill four cells, so the optional part fills the rest
  ({ selectors } = structureSelectors(desc({ min: 1, max: 1 }), abilities, () => true));
  assert.deepEqual(selectors.map((s) => s.anyOf), [['x:casing'], ['x:hatch'], ['x:parallel']]);
});

test('requireAbilities: a variant built with an optional part its pattern offers needs that part; the base machine doesn\'t', () => {
  const structures = {
    't:plant': {
      id: 't:plant',
      slices: [['XXXS']],
      symbols: {
        S: { kind: 'controller' },
        X: {
          kind: 'oneOf',
          options: [
            { kind: 'blocks', blocks: ['t:casing'], limits: { min: 1 } },
            { kind: 'part', ability: 'parallel_hatch', limits: { max: 1, preview: 1 } },
          ],
        },
      },
    },
  };
  const recipes = [gt('t:make_parallel', 't:assembler', { ins: [gi('t:iridium')], outs: [gi('t:parallel')] })];
  const cfg = ({ variant = {}, worldItems = [] } = {}) => ({
    tier: 'iv',
    eraOrder: ['steam', 'iv'],
    partAbilities: { parallel_hatch: ['t:parallel'] },
    world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:casing', 't:plant', 't:assembler_m', ...worldItems] }],
    machines: [
      { machine: 't:assembler_m', types: ['t:assembler'] },
      { machine: 't:plant', types: [], partsFromStructure: true },
      { id: 't:plant@parallel', machine: 't:plant', types: [], partsFromStructure: true, requireAbilities: ['parallel_hatch'], ...variant },
    ],
    targets: [
      { id: 'plant', item: 'm:t:plant' },
      { id: 'plant-parallel', item: 'm:t:plant@parallel' },
    ],
  });
  const dump = mkDump({ recipes, items: ['t:plant', 't:casing', 't:parallel', 't:iridium', 't:assembler_m'], structures });
  let r = run(dump, cfg());
  assert.deepEqual(verdicts(r.out.gate), { plant: 'PASS', 'plant-parallel': 'FAIL' }, 'no iridium, no parallel hatch: only the variant waits');
  const slot = r.model.g.rules.find((x) => x.name === 'build:t:plant@parallel').slots.find((s) => s.label === 'part «parallel_hatch» (this variant\'s)');
  assert.ok(slot && slot.cap, 'the part is a capital slot of the variant');
  assert.ok(!r.model.g.rules.find((x) => x.name === 'build:t:plant').slots.some((s) => /parallel/.test(s.label)), 'the base machine has no parallel slot');
  assert.deepEqual(r.model.warnings, []);
  r = run(dump, cfg({ worldItems: ['t:iridium'] }));
  assert.deepEqual(verdicts(r.out.gate), { plant: 'PASS', 'plant-parallel': 'PASS' });
  // an ability the pattern doesn't offer, or the config doesn't know, is a config warning
  r = run(dump, cfg({ variant: { requireAbilities: ['muffler'] } }));
  const w = r.model.warnings.join('\n');
  assert.match(w, /requireAbilities «muffler»: t:plant's pattern has no part with that ability/);
  assert.match(w, /requireAbilities «muffler» isn't in the config's partAbilities/);
});
