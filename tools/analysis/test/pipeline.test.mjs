// End-to-end tests for the model with small in-memory packs: node --test tools/analysis/test/
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { gf, gi, gt, miniPack, mkDump, run, shaped, shapeless, verdicts, without } from './helpers.mjs';

const statusOf = (list, id) => list.find((r) => r.target.id === id).status;
const linesOf = (list, id) => list.find((r) => r.target.id === id).lines.join('\n');

test('mini pack: the gate is built and everything sustains itself', () => {
  const pack = miniPack();
  const { out, model } = run(pack.dump, pack.cfg);
  assert.deepEqual(model.warnings, []);
  assert.equal(out.verdict, 'PASS', out && JSON.stringify([...out.gate, ...out.auto].filter((r) => r.verdict !== 'PASS').map((r) => r.target.id)));
  assert.deepEqual(Object.values(verdicts(out.gate)), ['PASS', 'PASS', 'PASS']);
  assert.ok(Object.values(verdicts(out.auto)).every((v) => v === 'PASS'));
});

test('the ore -> ingot -> bit -> drill cycle sustains itself even though the bit gets used up (catalyst)', () => {
  const pack = miniPack();
  const { res, model } = run(pack.dump, pack.cfg);
  const raw = model.g.key('t:raw');
  assert.equal(res.susInf.inS[raw], 1);
  // the ore comes from the drill, not from a shortcut
  assert.equal(model.g.rules[res.susInf.supportRule[raw]].name, 't:drilling');
});

test('without the bit recipe the drill isn\'t sustained: the ore only exists via the manual bootstrap', () => {
  const { dump, cfg } = without(miniPack(), 't:bit');
  const { out } = run(dump, cfg);
  assert.equal(statusOf(out.auto, 'auto-mena'), 'bootstrap');
  assert.equal(out.verdict, 'FAIL');
  assert.match(linesOf(out.auto, 'auto-mena'), /manual|bootstrap/i);
});

test('without the drilling recipe there\'s no ore generation, and it says why', () => {
  const { dump, cfg } = without(miniPack(), 't:drilling');
  const { out } = run(dump, cfg);
  assert.equal(statusOf(out.auto, 'auto-mena'), 'bootstrap');
  assert.equal(out.gate.find((r) => r.target.id === 'receta-perforacion').verdict, 'FAIL');
});

test('without the greenhouse there are no sustained logs, and the boiler stops giving steam', () => {
  const { dump, cfg } = without(miniPack(), 't:greenhouse_logs');
  const { out } = run(dump, cfg);
  assert.equal(statusOf(out.auto, 'auto-troncos'), 'bootstrap');
  assert.notEqual(statusOf(out.auto, 'auto-vapor'), 'sustained');
  assert.notEqual(statusOf(out.auto, 'auto-lingote'), 'sustained');
});

test('the steam machine\'s EU/t cap leaves recipes that are too expensive without a machine', () => {
  const pack = miniPack({ drillEut: 120 });
  const { out } = run(pack.dump, pack.cfg);
  const rule = out.gate.find((r) => r.target.id === 'receta-perforacion');
  assert.equal(rule.verdict, 'FAIL');
  assert.match(rule.lines.join('\n'), /no t:drilling machine accepts 120 EU\/t/);
});

test('--pass gate mode neither evaluates nor counts the auto targets', () => {
  const { dump, cfg } = without(miniPack(), 't:greenhouse_logs');
  const full = run(dump, cfg);
  assert.equal(full.out.verdict, 'FAIL');
  const { out } = run(dump, cfg, { pass: 'gate' });
  assert.equal(out.auto.length, 0);
  assert.equal(out.verdict, 'PASS');
});

test('a cycle with no source (compress <-> decompress) isn\'t sustained even with a manual bootstrap', () => {
  const recipes = [
    shapeless('t:compress', Array(9).fill({ item: 't:a' }), 't:block'),
    shapeless('t:decompress', [{ item: 't:block' }], 't:a', 9),
  ];
  const cfg = {
    tier: 'ciclo',
    unconditionalTypes: ['minecraft:crafting_shapeless'],
    world: [{ id: 'a', mode: 'manual', bootstrap: true, items: ['t:a'] }],
    targets: [],
    autoTargets: [{ id: 'auto-a', item: 't:a' }],
  };
  const dump = mkDump({ recipes });
  const { out } = run(dump, cfg);
  assert.equal(statusOf(out.auto, 'auto-a'), 'bootstrap');
  assert.equal(out.verdict, 'FAIL');

  // with a source that resupplies the ore, the same cycle does count
  const withSource = mkDump({ recipes: [...recipes, gt('t:mine', 't:mining', { outs: [gi('t:a')] })], items: ['t:miner'] });
  const cfg2 = { ...cfg, machines: [{ machine: 't:miner', types: ['t:mining'] }] };
  cfg2.world = [...cfg.world, { id: 'minero-pieza', mode: 'manual', bootstrap: true, items: ['t:miner'] }];
  const res2 = run(withSource, cfg2);
  assert.equal(statusOf(res2.out.auto, 'auto-a'), 'sustained');
});

test('a source that runs out (miner) gives WARN, not PASS', () => {
  const cfg = {
    tier: 'finito',
    world: [
      { id: 'minero', mode: 'manual', bootstrap: true, items: ['t:miner'] },
      { id: 'mena', mode: 'manual', bootstrap: true, items: ['t:ore'] },
      { id: 'fuente', mode: 'auto', finite: true, via: ['t:miner'], items: ['t:ore'] },
    ],
    machines: [{ machine: 't:miner', types: [] }],
    targets: [],
    autoTargets: [{ id: 'auto-mena', item: 't:ore' }, { id: 'auto-mena-ok', item: 't:ore', allowFinite: true }],
  };
  const { out } = run(mkDump({ items: ['t:miner', 't:ore'] }), cfg);
  assert.equal(statusOf(out.auto, 'auto-mena'), 'finite');
  assert.deepEqual(verdicts(out.auto), { 'auto-mena': 'WARN', 'auto-mena-ok': 'PASS' });
});

test('a tag\'s members work as alternatives, and an empty tag blocks, naming itself', () => {
  const recipes = [
    shaped('t:tool', ['PP'], { P: { tag: 't:plates' } }, 't:tool'),
    shaped('t:tool2', ['PP'], { P: { tag: 't:vacia' } }, 't:tool2'),
  ];
  const cfg = {
    tier: 'tags',
    unconditionalTypes: ['minecraft:crafting_shaped'],
    world: [{ id: 'w', mode: 'manual', items: ['t:plate_b'] }],
    targets: [{ id: 'herramienta', item: 't:tool' }, { id: 'herramienta2', item: 't:tool2' }],
    autoTargets: [],
  };
  const dump = mkDump({ recipes, tagsItem: { 't:plates': ['t:plate_a', 't:plate_b'], 't:vacia': [] }, items: ['t:plate_a', 't:plate_b'] });
  const { out } = run(dump, cfg);
  assert.deepEqual(verdicts(out.gate), { herramienta: 'PASS', herramienta2: 'FAIL' });
  assert.match(linesOf(out.gate, 'herramienta2'), /#t:vacia/);
});

test('the tool (a tool tag) is capital: having it is enough, and it isn\'t consumed', () => {
  const recipes = [
    shaped('t:hammer', ['I'], { I: { item: 't:ingot' } }, 't:hammer'),
    shaped('t:plate', ['H', 'I'], { H: { tag: 'gtceu:tools/crafting_hammers' }, I: { item: 't:ingot' } }, 't:plate'),
  ];
  const cfg = {
    tier: 'herramientas',
    unconditionalTypes: ['minecraft:crafting_shaped'],
    toolTags: ['gtceu:tools/crafting_hammers'],
    world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:ingot'] }],
    targets: [{ id: 'placa', item: 't:plate' }],
    autoTargets: [],
  };
  const dump = mkDump({ recipes, tagsItem: { 'gtceu:tools/crafting_hammers': ['t:hammer'] } });
  const { out, model } = run(dump, cfg);
  assert.equal(out.verdict, 'PASS');
  const rule = model.g.rules[model.ruleOfRecipe.get('t:plate')];
  assert.equal(rule.slots.filter((s) => s.cap).length, 1);
});

test('a fluid container needs the fluid and something to carry it in', () => {
  const recipes = [
    {
      id: 'gtceu:shaped_fluid_container/paper',
      type: 'gtceu:crafting_shaped_fluid_container',
      json: {
        type: 'gtceu:crafting_shaped_fluid_container', pattern: ['SB'],
        key: { S: { item: 't:dust' }, B: { type: 'gtceu:fluid_container', fluid: { amount: 1000, value: [{ tag: 'forge:water' }] } } },
        result: { item: 't:paper', count: 2 },
      },
    },
    shaped('t:bucket', ['I'], { I: { item: 't:ingot' } }, 'minecraft:bucket'),
  ];
  const base = {
    tier: 'recipiente',
    unconditionalTypes: ['gtceu:crafting_shaped_fluid_container', 'minecraft:crafting_shaped'],
    world: [
      { id: 'w', mode: 'manual', bootstrap: true, items: ['t:dust', 't:ingot'] },
      { id: 'agua', mode: 'manual', bootstrap: true, items: ['fluid:t:water'] },
    ],
    targets: [{ id: 'papel', item: 't:paper' }],
    autoTargets: [],
  };
  const dumpArgs = { recipes, tagsFluid: { 'forge:water': ['t:water'] }, fluids: ['t:water'] };
  assert.equal(run(mkDump(dumpArgs), base).out.verdict, 'PASS');

  const noWater = { ...base, world: base.world.filter((w) => w.id !== 'agua') };
  const r = run(mkDump(dumpArgs), noWater);
  assert.equal(r.out.verdict, 'FAIL');
  assert.match(linesOf(r.out.gate, 'papel'), /fluid:t:water/);

  const noBucket = run(mkDump({ ...dumpArgs, recipes: recipes.slice(0, 1) }), base);
  assert.equal(noBucket.out.verdict, 'FAIL');
  assert.match(linesOf(noBucket.out.gate, 'papel'), /minecraft:bucket/);
});

test('a target can require sustaining itself "without" certain rules (without), making the shortcut invalid', () => {
  const pack = miniPack();
  const mk = (recipes) => {
    const cfg = {
      ...pack.cfg,
      synthetic: [...pack.cfg.synthetic, { id: 'solar', machines: ['t:boiler'], consumes: ['fluid:t:water'], produces: ['fluid:t:steam'] }],
      autoTargets: [
        { id: 'vapor', fluid: 't:steam' },
        { id: 'vapor-sin-solar', fluid: 't:steam', without: ['synthetic:solar'] },
        { id: 'perforacion-sin-solar', kind: 'recipe', type: 't:drilling', without: ['synthetic:solar'] },
      ],
    };
    return run(without({ ...pack, recipes }, 'nada').dump, cfg);
  };
  const ok = mk(pack.recipes);
  assert.deepEqual(verdicts(ok.out.auto), { vapor: 'PASS', 'vapor-sin-solar': 'PASS', 'perforacion-sin-solar': 'PASS' });

  // without the greenhouse there's no fuel to resupply: with the solar shortcut there's still steam, without it there isn't
  const noFuel = mk(pack.recipes.filter((r) => r.id !== 't:greenhouse_logs'));
  const v = verdicts(noFuel.out.auto);
  assert.equal(v.vapor, 'PASS');
  assert.equal(v['vapor-sin-solar'], 'FAIL');
  assert.equal(v['perforacion-sin-solar'], 'FAIL');
  assert.match(noFuel.text, /\[without synthetic:solar\]/);
});

test('a recipe target with no outputs or no machine in the tier is reported without failing', () => {
  const recipes = [gt('t:fuel', 't:boiler_fuel', { ins: [gi('t:log')] })];
  const cfg = {
    tier: 'sin-salida',
    world: [{ id: 'w', mode: 'manual', items: ['t:log'] }],
    targets: [{ id: 'combustible', kind: 'recipe', type: 't:boiler_fuel' }],
    autoTargets: [{ id: 'combustible-auto', kind: 'recipe', type: 't:boiler_fuel' }],
  };
  const { out, text } = run(mkDump({ recipes, items: ['t:log'] }), cfg);
  assert.equal(out.verdict, 'FAIL');
  assert.match(text, /there's no machine for t:boiler_fuel in this tier/);
});

test('registry machines are added in bulk with their recipe types (machinesFromRegistry)', () => {
  const recipes = [
    gt('t:macerate', 'gtceu:macerator', { ins: [gi('t:ore')], outs: [gi('t:dust')], eut: 2 }),
    shaped('t:lv_macerator', ['I'], { I: { item: 't:ingot' } }, 'gtceu:lv_macerator'),
  ];
  const machines = [{ id: 'gtceu:lv_macerator', tier: 1, types: ['gtceu:macerator'] }, { id: 'gtceu:lv_miner', tier: 1, types: ['gtceu:dummy'] }];
  const cfg = {
    tier: 'registro',
    unconditionalTypes: ['minecraft:crafting_shaped'],
    world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:ore', 't:ingot'] }],
    synthetic: [{ id: 'energia', produces: ['eu:lv'] }],
    machinesFromRegistry: [{ prefix: 'gtceu:lv_', maxEUt: 32, needs: ['eu:lv'] }],
    targets: [{ id: 'polvo', item: 't:dust' }],
    autoTargets: [],
  };
  const dump = mkDump({ recipes, machines });
  const r = run(dump, cfg);
  assert.equal(r.model.stats.machinesFromRegistry, 1);
  assert.equal(r.out.verdict, 'PASS');
});

test('warns about config parts, machines and fluids that don\'t exist in the registry', () => {
  const cfg = {
    tier: 'avisos',
    world: [],
    machines: [{ machine: 'gtceu:no_existe', types: [], parts: ['t:parte_fantasma'], needs: ['fluid:t:fantasma'] }],
    targets: [],
    autoTargets: [],
  };
  const dump = mkDump({ recipes: [shaped('t:x', ['I'], { I: { item: 't:y' } }, 't:z')], fluids: ['t:water'] });
  const { model } = run(dump, cfg);
  const text = model.warnings.join('\n');
  assert.match(text, /gtceu:no_existe/);
  assert.match(text, /t:parte_fantasma/);
  assert.match(text, /fluid:t:fantasma/);
});

test('output recipes with fluids are read: a fluid produced by a machine counts', () => {
  const recipes = [gt('t:pump_recipe', 't:pumping', { fouts: [gf('t:oil')], eut: 8 })];
  const cfg = {
    tier: 'fluidos',
    world: [{ id: 'bomba', mode: 'manual', bootstrap: true, items: ['t:pumpjack'] }],
    machines: [{ machine: 't:pumpjack', types: ['t:pumping'] }],
    targets: [{ id: 'petroleo', fluid: 't:oil' }],
    autoTargets: [],
  };
  const { out } = run(mkDump({ recipes, fluids: ['t:oil'], items: ['t:pumpjack'] }), cfg);
  assert.equal(out.verdict, 'PASS');
});
