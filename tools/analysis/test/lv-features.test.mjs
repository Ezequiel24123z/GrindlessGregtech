// Pruebas de lo que añade el tier LV: estructuras de multibloque, recetas de AE2, fugas, objetivos opcionales y por veta.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { abilityMaxCount, structureSelectors } from '../lib/structure.mjs';
import { gf, gi, gt, mkDump, run, shaped, verdicts } from './helpers.mjs';

const linesOf = (list, id) => list.find((r) => r.target.id === id).lines.join('\n');
const statusOf = (list, id) => list.find((r) => r.target.id === id).status;

// ---------------------------------------------------------------- estructuras de multibloque

const DRILL_DESC = {
  id: 'gtceu:steam_vein_drill',
  slices: [['XXX', 'XPX', 'XSX'], ['F F', ' F ', 'F F']],
  symbols: {
    S: { kind: 'controller' },
    X: {
      kind: 'oneOf',
      options: [
        { kind: 'blocks', blocks: ['gtceu:steam_machine_casing'], limits: { min: 11 } },
        { kind: 'part', ability: 'steam', limits: { exact: 1 } },
        { kind: 'part', ability: 'steam_output_bus', limits: { min: 1, max: 2 } },
      ],
    },
    P: { kind: 'blocks', blocks: ['gtceu:bronze_pipe_casing', 'gtceu:steel_pipe_casing', 'no:existe'] },
    F: { kind: 'frames', materials: ['bronze', 'steel'] },
  },
};
const ABILITIES = { steam: ['gtceu:steam_input_hatch'], steam_output_bus: ['gtceu:steam_output_bus'] };
const REGISTRY = new Set([
  'gtceu:steam_machine_casing', 'gtceu:steam_input_hatch', 'gtceu:steam_output_bus', 'gtceu:bronze_pipe_casing',
  'gtceu:steel_pipe_casing', 'gtceu:bronze_frame', 'gtceu:steel_frame',
]);

test('structureSelectors: carcasa con mínimo, piezas por habilidad, tubería y marcos como ranuras de capital', () => {
  const { selectors, problems } = structureSelectors(DRILL_DESC, ABILITIES, (i) => REGISTRY.has(i));
  assert.deepEqual(problems, []);
  assert.deepEqual(selectors.map((s) => s.anyOf), [
    ['gtceu:steam_machine_casing'], ['gtceu:steam_input_hatch'], ['gtceu:steam_output_bus'],
    ['gtceu:bronze_pipe_casing', 'gtceu:steel_pipe_casing'], ['gtceu:bronze_frame', 'gtceu:steel_frame'],
  ]);
});

test('structureSelectors: una habilidad sin objetos en partAbilities se avisa y deja la ranura imposible con nombre', () => {
  const { selectors, problems } = structureSelectors(DRILL_DESC, { steam_output_bus: ['gtceu:steam_output_bus'] }, (i) => REGISTRY.has(i));
  assert.match(problems.join('\n'), /«steam».*partAbilities/);
  assert.deepEqual(selectors.find((s) => s.label === 'pieza «steam»').anyOf, []);
});

test('structureSelectors: las opciones sin límite de una celda "o" rellenan y solo las acotadas por max no son obligatorias', () => {
  const desc = {
    slices: [['AB']],
    symbols: {
      A: { kind: 'oneOf', options: [{ kind: 'blocks', blocks: ['x:casing'] }, { kind: 'part', ability: 'muffler', limits: { max: 1 } }] },
      B: { kind: 'controller' },
    },
  };
  const { selectors } = structureSelectors(desc, { muffler: ['x:muffler'] }, () => true);
  assert.deepEqual(selectors.map((s) => s.anyOf), [['x:casing', 'x:muffler']]);
});

function drillPack({ withStructure = true, withHatch = true } = {}) {
  const recipes = [
    shaped('t:drill', ['H'], { H: { item: 't:hull' } }, 't:drill'),
    shaped('t:hatch', ['I'], { I: { item: 't:ingot' } }, 't:energy_hatch'),
    shaped('t:casing', ['I'], { I: { item: 't:ingot' } }, 't:casing'),
    shaped('t:hull', ['I'], { I: { item: 't:ingot' } }, 't:hull'),
  ].filter((r) => withHatch || r.id !== 't:hatch');
  const cfg = {
    tier: 'estructura',
    unconditionalTypes: ['minecraft:crafting_shaped'],
    partAbilities: { energy_input: ['t:energy_hatch'] },
    world: [{ id: 'w', mode: 'manual', items: ['t:ingot'] }],
    machines: [{ machine: 't:drill', types: [], partsFromStructure: true, parts: ['t:fallback_part'] }],
    targets: [{ id: 'maquina', item: 'm:t:drill' }],
    autoTargets: [],
  };
  const structures = withStructure ? {
    't:drill': {
      id: 't:drill',
      slices: [['XXS']],
      symbols: {
        S: { kind: 'controller' },
        X: { kind: 'oneOf', options: [{ kind: 'blocks', blocks: ['t:casing'], limits: { min: 1 } }, { kind: 'part', ability: 'energy_input', limits: { exact: 1 } }] },
      },
    },
  } : null;
  const dump = mkDump({ recipes, items: ['t:ingot', 't:drill'], structures });
  return { dump, cfg };
}

test('partsFromStructure: las piezas salen del patrón volcado y no de la configuración de reserva', () => {
  const { dump, cfg } = drillPack();
  const r = run(dump, cfg);
  assert.equal(r.model.stats.structureMachines, 1);
  assert.equal(r.out.verdict, 'PASS');
  const rule = r.model.g.rules.find((x) => x.name === 'construir:t:drill');
  assert.equal(rule.meta.partsFrom, 'estructura');
  assert.deepEqual(rule.slots.slice(1).map((s) => s.label), ['t:casing', 'pieza «energy_input»']);
});

test('partsFromStructure: si falta una pieza del patrón se dice cuál bloquea la máquina', () => {
  const { dump, cfg } = drillPack({ withHatch: false });
  const r = run(dump, cfg);
  assert.equal(r.out.verdict, 'FAIL');
  assert.match(linesOf(r.out.gate, 'maquina'), /t:energy_hatch|pieza «energy_input»/);
});

test('partsFromStructure: sin estructura en el volcado se usan las partes de la configuración y se avisa', () => {
  const { dump, cfg } = drillPack({ withStructure: false });
  const r = run(dump, cfg);
  assert.match(r.model.warnings.join('\n'), /no trae la estructura de t:drill; se usan las partes de la configuración/);
  const rule = r.model.g.rules.find((x) => x.name === 'construir:t:drill');
  assert.equal(rule.meta.partsFrom, 'config');
  assert.equal(rule.slots[1].label, 't:fallback_part');
});

// ---------------------------------------------------------------- AE2

const ae2Cfg = (extra = {}) => ({
  tier: 'ae2',
  unconditionalTypes: ['minecraft:crafting_shaped', 'ae2:transform'],
  conditions: { adjacent_fluid: { fluidsFrom: 'fluids' }, ae2_circumstance_explosion: { unsupported: true } },
  world: [
    { id: 'w', mode: 'manual', bootstrap: true, items: ['t:iron_block', 't:ingredient', 't:charged', 't:redstone', 't:quartz'] },
    { id: 'agua', mode: 'manual', items: ['fluid:t:water'] },
  ],
  synthetic: [{ id: 'energia', produces: ['ae:power'] }],
  machines: [{ machine: 'ae2:inscriber', types: ['ae2:inscriber'], needs: ['ae:power'] }],
  targets: [],
  autoTargets: [],
  ...extra,
});

const inscribe = (id, mode, ingredients, result) => ({
  id, type: 'ae2:inscriber', json: { type: 'ae2:inscriber', mode, ingredients, result: { item: result } },
});

test('AE2 inscriptor: en modo inscribe los moldes (arriba/abajo) son capital y en modo press se gastan', () => {
  const recipes = [
    inscribe('a:print', 'inscribe', { top: { item: 't:press' }, middle: { item: 't:ingredient' } }, 't:print'),
    inscribe('a:processor', 'press', { top: { item: 't:print' }, middle: { item: 't:redstone' }, bottom: { item: 't:print' } }, 't:processor'),
  ];
  const dump = mkDump({ recipes, items: ['ae2:inscriber', 't:press'] });
  const r = run(dump, ae2Cfg({ targets: [] }));
  const slots = (id) => r.model.g.rules[r.model.ruleOfRecipe.get(id)].slots;
  assert.deepEqual(slots('a:print').filter((s) => s.role !== 'machine').map((s) => [s.label, s.cap]), [['t:press', true], ['t:ingredient', false]]);
  assert.deepEqual(slots('a:processor').filter((s) => s.role !== 'machine').map((s) => s.cap), [false, false, false]);
});

test('AE2 inscriptor: sin la máquina o sin energía de AE2 la receta no se puede completar', () => {
  const recipes = [inscribe('a:print', 'inscribe', { top: { item: 't:press' }, middle: { item: 't:ingredient' } }, 't:print')];
  const targets = [{ id: 'impreso', item: 't:print' }];
  const world = [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:press', 't:ingredient', 'ae2:inscriber'] }];
  const ok = run(mkDump({ recipes, items: ['ae2:inscriber', 't:press'] }), ae2Cfg({ world, targets }));
  assert.equal(ok.out.verdict, 'PASS');
  const noPower = run(mkDump({ recipes, items: ['ae2:inscriber', 't:press'] }), ae2Cfg({ world, targets, synthetic: [] }));
  assert.equal(noPower.out.verdict, 'FAIL');
  assert.match(linesOf(noPower.out.gate, 'impreso'), /ae:power/);
});

test('AE2 transform: los objetos tirados al agua necesitan el fluido y la explosión no está soportada', () => {
  const water = {
    id: 'a:fluix', type: 'ae2:transform',
    json: {
      type: 'ae2:transform', circumstance: { type: 'fluid', tag: 'minecraft:water' },
      ingredients: [{ item: 't:charged' }, { item: 't:redstone' }, { item: 't:quartz' }], result: { item: 't:fluix', count: 2 },
    },
  };
  const boom = {
    id: 'a:singularity', type: 'ae2:transform',
    json: { type: 'ae2:transform', circumstance: { type: 'explosion' }, ingredients: [{ item: 't:quartz' }], result: { item: 't:singularity' } },
  };
  const targets = [{ id: 'fluix', item: 't:fluix' }, { id: 'singularidad', item: 't:singularity' }];
  const dump = mkDump({ recipes: [water, boom], tagsFluid: { 'minecraft:water': ['t:water'] }, fluids: ['t:water'] });
  const r = run(dump, ae2Cfg({ targets }));
  assert.deepEqual(verdicts(r.out.gate), { fluix: 'PASS', singularidad: 'FAIL' });
  assert.match(linesOf(r.out.gate, 'singularidad'), /ae2_circumstance_explosion|explosion/);
  const dry = run(dump, ae2Cfg({ targets, world: [{ id: 'w', mode: 'manual', items: ['t:charged', 't:redstone', 't:quartz'] }] }));
  assert.equal(dry.out.gate.find((x) => x.target.id === 'fluix').verdict, 'FAIL');
});

// ---------------------------------------------------------------- fugas, opcionales, vetas

test('expect "unreachable": PASS si el objeto no se puede conseguir y FAIL con la cadena si hay una fuga', () => {
  const recipes = [gt('t:blast', 't:ebf', { ins: [gi('t:sand')], outs: [gi('t:silicon')] }), shaped('t:leak', ['S'], { S: { item: 't:sand' } }, 't:silicon2')];
  const cfg = {
    tier: 'fuga',
    unconditionalTypes: ['minecraft:crafting_shaped'],
    world: [{ id: 'w', mode: 'manual', items: ['t:sand'] }],
    targets: [
      { id: 'silicio', item: 't:silicon', expect: 'unreachable' },
      { id: 'silicio2', item: 't:silicon2', expect: 'unreachable' },
    ],
    autoTargets: [],
  };
  const r = run(mkDump({ recipes }), cfg);
  assert.deepEqual(verdicts(r.out.gate), { silicio: 'PASS', silicio2: 'FAIL' });
  assert.match(linesOf(r.out.gate, 'silicio'), /como debe ser/);
  assert.match(linesOf(r.out.gate, 'silicio2'), /FUGA[\s\S]*t:silicon2/);
  assert.equal(r.out.verdict, 'FAIL');
});

test('expect "not-automatic": PASS si el objeto solo existe como bloque puesto una vez y FAIL con la cadena si una máquina lo repone', () => {
  const melt = gt('t:rock_melt', 't:arc', { ins: [gi('t:cobble', 8)], fouts: [gf('t:lava', 100)], eut: 32 });
  const cfg = {
    tier: 'fuga-auto',
    machines: [{ machine: 't:arc_machine', types: ['t:arc'], maxEUt: 64 }],
    world: [
      { id: 'maquina', mode: 'manual', bootstrap: true, items: ['t:arc_machine'] },
      { id: 'piedra', mode: 'auto', items: ['t:cobble'] },
      { id: 'lava-puesta', mode: 'manual', bootstrap: true, items: ['fluid:t:lava'] },
    ],
    targets: [{ id: 'mal-puesto', item: 't:cobble', expect: 'not-automatic' }],
    autoTargets: [{ id: 'lava', fluid: 't:lava', expect: 'not-automatic' }],
  };
  const items = ['t:arc_machine', 't:cobble'];
  const fluids = ['t:lava'];
  const clean = run(mkDump({ recipes: [], items, fluids }), cfg);
  assert.equal(clean.out.auto[0].verdict, 'PASS');
  assert.match(linesOf(clean.out.auto, 'lava'), /no se produce sola, como debe ser \(solo gracias al arranque manual/);
  assert.match(clean.model.warnings.join('\n'), /mal-puesto: expect «not-automatic» no vale en targets/);

  const leaky = run(mkDump({ recipes: [melt], items, fluids }), cfg);
  assert.equal(leaky.out.auto[0].verdict, 'FAIL');
  assert.match(linesOf(leaky.out.auto, 'lava'), /FUGA: se produce sola[\s\S]*t:rock_melt/);
  assert.equal(leaky.out.verdict, 'FAIL');
});

test('un objetivo opcional que no se cumple da WARN y no tumba el veredicto', () => {
  const cfg = {
    tier: 'opcional',
    world: [],
    targets: [{ id: 'conversor', item: 't:converter', optional: true }, { id: 'nada', item: 't:other', optional: true }],
    autoTargets: [],
  };
  const r = run(mkDump({ items: ['t:converter', 't:other'] }), cfg);
  assert.deepEqual(verdicts(r.out.gate), { conversor: 'WARN', nada: 'WARN' });
  assert.equal(r.out.verdict, 'PASS');
  assert.match(r.text, /2 avisos/);
  assert.match(linesOf(r.out.gate, 'conversor'), /opcional/);
});

const VEINS = [
  { id: 'gtceu:iron_vein', layer: 'stone', dims: ['minecraft:overworld'], mats: ['gtceu:goethite', 'gtceu:iron'] },
  { id: 'gtceu:banded_iron_vein', layer: 'netherrack', dims: ['minecraft:the_nether'], mats: ['gtceu:goethite', 'gtceu:gold'] },
  { id: 'gtceu:topaz_vein', layer: 'netherrack', dims: ['minecraft:the_nether'], mats: ['gtceu:topaz', 'gtceu:bornite'] },
  { id: 'gtceu:certus_quartz', layer: 'netherrack', dims: ['minecraft:the_nether'], mats: ['gtceu:certus_quartz'] },
];

test('objetivos por veta: receta con muestra por veta (plantilla {id}) y menas exclusivas de la dimensión', () => {
  const recipes = [
    gt('t:drill_topaz', 'gtceu:vein_drilling', { ins: [gi('grindless:vein_sample_topaz', 1, 0)], outs: [gi('gtceu:raw_topaz')] }),
  ];
  const cfg = {
    tier: 'vetas',
    machines: [{ machine: 't:drill', types: ['gtceu:vein_drilling'] }],
    world: [
      { id: 'w', mode: 'manual', bootstrap: true, items: ['t:drill', 'grindless:vein_sample_topaz', 'grindless:vein_sample_banded_iron'] },
    ],
    targets: [],
    autoTargets: [],
    autoTargetsFromVeins: [
      {
        idPrefix: 'receta-', labelPrefix: 'Perforación', dimensions: ['minecraft:the_nether'],
        target: { kind: 'recipe', type: 'gtceu:vein_drilling', input: 'grindless:vein_sample_{id}' },
      },
      {
        idPrefix: 'mena-', labelPrefix: 'Mena', dimensions: ['minecraft:the_nether'], exclusiveFrom: ['minecraft:overworld'],
        template: 'gtceu:raw_{m}', overrides: { gold: 'minecraft:raw_gold' }, mode: 'anyOf',
      },
    ],
  };
  const dump = mkDump({
    recipes, veins: VEINS,
    items: ['t:drill', 'grindless:vein_sample_topaz', 'grindless:vein_sample_banded_iron', 'gtceu:raw_topaz', 'gtceu:raw_bornite', 'gtceu:raw_certus_quartz'],
  });
  const r = run(dump, cfg);
  assert.equal(r.model.stats.veinTargets, 5);
  const ids = r.out.auto.map((x) => x.target.id);
  // banded_iron solo comparte menas con el Overworld (goethita) o no tiene objeto (oro): sin objetivo de menas
  assert.deepEqual(ids, ['receta-banded_iron_vein', 'receta-topaz_vein', 'receta-certus_quartz', 'mena-topaz_vein', 'mena-certus_quartz']);
  assert.equal(r.out.auto.find((x) => x.target.id === 'receta-topaz_vein').target.input, 'grindless:vein_sample_topaz');
  assert.equal(r.out.auto.find((x) => x.target.id === 'receta-certus_quartz').target.input, 'grindless:vein_sample_certus_quartz');
  assert.equal(statusOf(r.out.auto, 'mena-topaz_vein'), 'sustained');
  assert.equal(r.out.auto.find((x) => x.target.id === 'receta-topaz_vein').verdict, 'PASS');
  // sin receta para esa veta: FAIL y se dice que no hay ninguna receta con esa muestra
  assert.equal(r.out.auto.find((x) => x.target.id === 'receta-banded_iron_vein').verdict, 'FAIL');
  assert.equal(r.out.verdict, 'FAIL');
});

test('objetivos por veta: se avisa si el volcado no trae veins.json', () => {
  const cfg = { tier: 'sin-vetas', world: [], targets: [], autoTargets: [], autoTargetsFromVeins: [{ idPrefix: 'v-', dimensions: ['minecraft:the_nether'], template: 'x:{m}' }] };
  const r = run(mkDump({}), cfg);
  assert.match(r.model.warnings.join('\n'), /autoTargetsFromVeins: el volcado no trae veins.json/);
});

test('objetivo de receta con varias entradas: la receta debe tenerlas todas (muestra + lodo)', () => {
  const recipes = [
    gt('t:drill_plain', 'gtceu:vein_drilling', { ins: [gi('t:sample', 1, 0)], outs: [gi('t:raw_a')] }),
    gt('t:drill_mud', 'gtceu:vein_drilling', { ins: [gi('t:sample', 1, 0)], fins: [gf('t:mud', 50)], outs: [gi('t:raw_b')] }),
  ];
  const cfg = {
    tier: 'multi-entrada',
    machines: [{ machine: 't:drill', types: ['gtceu:vein_drilling'], maxEUt: 32 }],
    world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:drill', 't:sample'] }],
    targets: [
      { id: 'con-lodo', kind: 'recipe', type: 'gtceu:vein_drilling', input: ['t:sample', 'fluid:t:mud'] },
      { id: 'solo-muestra', kind: 'recipe', type: 'gtceu:vein_drilling', input: 't:sample' },
    ],
    autoTargets: [],
  };
  const r = run(mkDump({ recipes, items: ['t:drill', 't:sample', 't:raw_a', 't:raw_b'], fluids: ['t:mud'] }), cfg);
  // el lodo no existe en el mundo: la receta con lodo no se puede completar, la sencilla sí
  assert.deepEqual(verdicts(r.out.gate), { 'con-lodo': 'FAIL', 'solo-muestra': 'PASS' });
  assert.match(linesOf(r.out.gate, 'con-lodo'), /hay 1 receta\(s\) del tipo/);
});

test('coilTemp: cada variante de EBF lleva su bobina; GTM suma 100 K por escalón de tensión sobre MV', () => {
  const recipes = [
    gt('t:blast_1700', 't:ebf', { ins: [gi('t:dust')], outs: [gi('t:i1700')], eut: 120, data: { ebf_temp: 1700 } }),
    gt('t:blast_1900', 't:ebf', { ins: [gi('t:dust')], outs: [gi('t:i1900')], eut: 120, data: { ebf_temp: 1900 } }),
    gt('t:blast_2700', 't:ebf', { ins: [gi('t:dust')], outs: [gi('t:i2700')], eut: 480, data: { ebf_temp: 2700 } }),
    gt('t:blast_2800', 't:ebf', { ins: [gi('t:dust')], outs: [gi('t:i2800')], eut: 480, data: { ebf_temp: 2800 } }),
    gt('t:blast_2900', 't:ebf', { ins: [gi('t:dust')], outs: [gi('t:i2900')], eut: 480, data: { ebf_temp: 2900 } }),
  ];
  const cfg = {
    tier: 'bobinas',
    machines: [
      { id: 't:ebf@cupro', machine: 't:ebf_machine', types: ['t:ebf'], energy: { voltage: 32, hatches: 2 }, coilTemp: 1800 },
      { id: 't:ebf@kanthal', machine: 't:ebf_machine', types: ['t:ebf'], energy: { voltage: 128, hatches: 2 }, coilTemp: 2700 },
    ],
    world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:ebf_machine', 't:dust'] }],
    targets: ['1700', '1900', '2700', '2800', '2900'].map((k) => ({ id: 'i' + k, item: 't:i' + k })),
    autoTargets: [],
  };
  const items = ['t:ebf_machine', 't:dust'];
  const r = run(mkDump({ recipes, items }), cfg);
  // cuproníquel con 2 escotillas LV = MV (sin bonus): 1800 K y 128 V; Kanthal con 2 escotillas MV = HV: 2700 + 100 = 2800 K, 512 V
  assert.deepEqual(verdicts(r.out.gate), { i1700: 'PASS', i1900: 'PASS', i2700: 'PASS', i2800: 'PASS', i2900: 'FAIL' });
  // solo cuproníquel: 1900 K y 480 EU/t quedan fuera
  const only = run(mkDump({ recipes, items }), { ...cfg, machines: [cfg.machines[0]] });
  assert.deepEqual(verdicts(only.out.gate), { i1700: 'PASS', i1900: 'FAIL', i2700: 'FAIL', i2800: 'FAIL', i2900: 'FAIL' });
  assert.match(linesOf(only.out.gate, 'i1900'), /ninguna máquina de t:ebf llega a 1900 K/);
  assert.match(linesOf(only.out.gate, 'i2700'), /ninguna máquina de t:ebf admite 480 EU\/t/);
});

test('dimensión de la fábrica: una receta con condición de dimensión solo vale donde la fábrica está', () => {
  const dim = (d, reverse) => [{ type: 'dimension', dimension: d, ...(reverse ? { reverse: true } : {}) }];
  const recipes = [
    gt('t:air_ow', 'gtceu:gas_collector', { fouts: [gf('t:air', 10000)], eut: 16, conditions: dim('minecraft:overworld') }),
    gt('t:air_flat', 'gtceu:gas_collector', { fouts: [gf('t:air', 10000)], eut: 16, conditions: dim('grindless:flat') }),
    gt('t:gas_not_nether', 'gtceu:gas_collector', { fouts: [gf('t:gas', 10000)], eut: 16, conditions: dim('minecraft:the_nether', true) }),
  ];
  const cfg = (dimension) => ({
    tier: 'contexto',
    ...(dimension ? { dimension } : {}),
    machines: [{ machine: 't:collector', types: ['gtceu:gas_collector'], maxEUt: 32 }],
    world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:collector'] }],
    targets: [{ id: 'aire', fluid: 't:air' }, { id: 'gas', fluid: 't:gas' }],
    autoTargets: [],
  });
  const dump = () => mkDump({ recipes, items: ['t:collector'], fluids: ['t:air', 't:gas'] });
  assert.deepEqual(verdicts(run(dump(), cfg()).out.gate), { aire: 'PASS', gas: 'PASS' });
  const flat = run(dump(), cfg('grindless:flat'));
  assert.deepEqual(verdicts(flat.out.gate), { aire: 'PASS', gas: 'PASS' });
  assert.match(flat.text, /Contexto: la fábrica está en la dimensión grindless:flat/);
  const nether = run(dump(), cfg('minecraft:the_nether'));
  assert.deepEqual(verdicts(nether.out.gate), { aire: 'FAIL', gas: 'FAIL' });
  assert.match(linesOf(nether.out.gate, 'aire'), /solo vale en (minecraft:overworld|grindless:flat); la fábrica está en minecraft:the_nether/);
  // conditions.dimension.ignore desactiva el filtro
  const loose = run(dump(), { ...cfg('minecraft:the_nether'), conditions: { dimension: { ignore: true } } });
  assert.deepEqual(verdicts(loose.out.gate), { aire: 'PASS', gas: 'PASS' });
});

test('yacimientos de fluidos: la perforadora solo da los fluidos cuyos yacimientos admiten la dimensión; la config decide si se agotan', () => {
  const FLUID_VEINS = [
    { id: 'gtceu:oil_deposit', fluid: 't:oil', weight: 25, dims: ['minecraft:overworld'] },
    { id: 'grindless:flat_gas', fluid: 't:gas', weight: 10, dims: ['grindless:flat'] },
    { id: 'gtceu:salt_deposit', fluid: 't:brine', weight: 10, dims: null },
  ];
  const cfg = (dimension) => ({
    tier: 'fluidos',
    dimension,
    machines: [{ machine: 't:rig', types: [] }],
    world: [
      { id: 'taladro', mode: 'manual', bootstrap: true, items: ['t:rig'] },
      {
        id: 'yacimientos', mode: 'auto', via: ['t:rig'], fromFluidVeins: true,
        sustainedIf: { config: 'worldgen.oreVeins.infiniteBedrockOresFluids', equals: true },
      },
    ],
    targets: [],
    autoTargets: [
      { id: 'aceite', fluid: 't:oil' }, { id: 'gas', fluid: 't:gas' }, { id: 'salmuera', fluid: 't:brine' },
    ],
  });
  const dump = (config) => mkDump({ items: ['t:rig'], fluids: ['t:oil', 't:gas', 't:brine'], fluidVeins: FLUID_VEINS, config });
  const infinite = { 'worldgen.oreVeins.infiniteBedrockOresFluids': true };
  const ow = run(dump(infinite), cfg('minecraft:overworld'));
  assert.deepEqual(verdicts(ow.out.auto), { aceite: 'PASS', gas: 'FAIL', salmuera: 'PASS' });
  assert.match(linesOf(ow.out.auto, 'gas'), /el yacimiento grindless:flat_gas solo admite grindless:flat; este análisis es en minecraft:overworld/);
  assert.match(ow.text, /yacimientos de fluidos que admiten minecraft:overworld: t:oil \(gtceu:oil_deposit\), t:brine \(gtceu:salt_deposit\)/);
  assert.match(ow.text, /config de GTM leída del volcado: worldgen.oreVeins.infiniteBedrockOresFluids=true/);
  const flat = run(dump(infinite), cfg('grindless:flat'));
  assert.deepEqual(verdicts(flat.out.auto), { aceite: 'FAIL', gas: 'PASS', salmuera: 'PASS' });
  // sin la config infinita los yacimientos se agotan: solo una fuente finita (WARN)
  const finite = run(dump({ 'worldgen.oreVeins.infiniteBedrockOresFluids': false }), cfg('minecraft:overworld'));
  assert.equal(finite.out.auto.find((x) => x.target.id === 'aceite').status, 'finite');
  assert.equal(finite.out.auto.find((x) => x.target.id === 'aceite').verdict, 'WARN');
  // un volcado sin config.json no permite comprobarla: se avisa y se trata como no cumplida
  const unknown = run(dump(null), cfg('minecraft:overworld'));
  assert.equal(unknown.out.auto.find((x) => x.target.id === 'aceite').verdict, 'WARN');
  assert.match(unknown.model.warnings.join('\n'), /no se puede comprobar la config worldgen.oreVeins.infiniteBedrockOresFluids \(el volcado no trae config.json\)/);
});

test('mundo: requires (config) y dimensions desactivan una entrada con el motivo en el informe', () => {
  const cfg = (dimension, config) => ({
    tier: 'requisitos',
    dimension,
    world: [
      { id: 'sin-flag', mode: 'auto', requires: [{ config: 'gameplay.hazardsEnabled', equals: false }], items: ['t:a'] },
      { id: 'solo-nether', mode: 'auto', dimensions: ['minecraft:the_nether'], items: ['t:b'] },
      { id: 'siempre', mode: 'auto', items: ['t:c'] },
    ],
    targets: [{ id: 'a', item: 't:a' }, { id: 'b', item: 't:b' }, { id: 'c', item: 't:c' }],
    autoTargets: [],
    _config: config,
  });
  const dump = (config) => mkDump({ items: ['t:a', 't:b', 't:c'], config });
  const r = run(dump({ 'gameplay.hazardsEnabled': true }), cfg('minecraft:overworld'));
  assert.deepEqual(verdicts(r.out.gate), { a: 'FAIL', b: 'FAIL', c: 'PASS' });
  assert.match(linesOf(r.out.gate, 'a'), /sin-flag \(config gameplay.hazardsEnabled = true, se pide false\)/);
  assert.match(linesOf(r.out.gate, 'b'), /solo-nether \(solo en minecraft:the_nether\)/);
  const nether = run(dump({ 'gameplay.hazardsEnabled': false }), cfg('minecraft:the_nether'));
  assert.deepEqual(verdicts(nether.out.gate), { a: 'PASS', b: 'PASS', c: 'PASS' });
});

test('condición numérica con tope (ebf_temp): la receta que pide más temperatura que las bobinas del tier no vale', () => {
  const recipes = [
    gt('t:blast_low', 't:ebf', { ins: [gi('t:dust')], outs: [gi('t:ingot_low')], eut: 120, data: { ebf_temp: 1700 } }),
    gt('t:blast_high', 't:ebf', { ins: [gi('t:dust')], outs: [gi('t:ingot_high')], eut: 120, data: { ebf_temp: 2273 } }),
    gt('t:blast_hot', 't:ebf', { ins: [gi('t:dust')], outs: [gi('t:ingot_hot')], eut: 480, data: { ebf_temp: 1000 } }),
  ];
  const cfg = {
    tier: 'ebf',
    conditions: { ebf_temp: { field: 'temperature', max: 1800 } },
    machines: [{ machine: 't:ebf_machine', types: ['t:ebf'], maxEUt: 128 }],
    world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:ebf_machine', 't:dust'] }],
    targets: [{ id: 'bajo', item: 't:ingot_low' }, { id: 'alto', item: 't:ingot_high' }, { id: 'caliente', item: 't:ingot_hot' }],
    autoTargets: [],
  };
  const r = run(mkDump({ recipes, items: ['t:ebf_machine', 't:dust'] }), cfg);
  assert.deepEqual(verdicts(r.out.gate), { bajo: 'PASS', alto: 'FAIL', caliente: 'FAIL' });
  assert.match(linesOf(r.out.gate, 'alto'), /ebf_temp 2273 \(este tier llega a 1800\)/);
  assert.match(linesOf(r.out.gate, 'caliente'), /ninguna máquina de t:ebf admite 480 EU\/t/);
  // sin la regla de condición, la temperatura se ignora
  const loose = run(mkDump({ recipes, items: ['t:ebf_machine', 't:dust'] }), { ...cfg, conditions: {} });
  assert.equal(loose.out.gate.find((x) => x.target.id === 'alto').verdict, 'PASS');
});

test('verbose / explain también cuelgan la derivación de los objetivos de tipo receta que dan PASS', () => {
  const recipes = [gt('t:drill', 'gtceu:vein_drilling', { ins: [gi('t:sample', 1, 0), gi('t:coal', 1)], outs: [gi('t:raw')] })];
  const cfg = {
    tier: 'verbose',
    machines: [{ machine: 't:drill_machine', types: ['gtceu:vein_drilling'], maxEUt: 32 }],
    world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:drill_machine', 't:sample', 't:coal'] }],
    targets: [{ id: 'perforar', kind: 'recipe', type: 'gtceu:vein_drilling', output: 't:raw' }],
    autoTargets: [],
  };
  const r = run(mkDump({ recipes, items: ['t:drill_machine', 't:sample', 't:coal'] }), cfg, { verbose: true });
  assert.equal(r.out.gate[0].verdict, 'PASS');
  assert.match(linesOf(r.out.gate, 'perforar'), /receta usable, necesita:[\s\S]*t:coal/);
});

test('abilityMaxCount: suma los límites de las opciones con esa habilidad, acotada por las celdas del símbolo', () => {
  const desc = {
    slices: [['XXXX', 'XSEX']],
    symbols: {
      S: { kind: 'controller' },
      X: {
        kind: 'oneOf',
        options: [
          { kind: 'blocks', blocks: ['t:casing'], limits: { min: 3 } },
          { kind: 'part', ability: 'energy_input', limits: { min: 1, max: 2 } },
          { kind: 'part', ability: 'muffler', limits: { exact: 1 } },
        ],
      },
      E: { kind: 'part', ability: 'energy_input', limits: { exact: 1 } },
    },
  };
  assert.equal(abilityMaxCount(desc, 'energy_input'), 3); // 2 en la carcasa "o" + 1 exacta
  assert.equal(abilityMaxCount(desc, 'muffler'), 1);
  assert.equal(abilityMaxCount(desc, 'output_bus'), 0);
  // sin límite superior: tantas como celdas del símbolo
  const free = { slices: [['AAA']], symbols: { A: { kind: 'oneOf', options: [{ kind: 'part', ability: 'energy_input' }] } } };
  assert.equal(abilityMaxCount(free, 'energy_input'), 3);
});

test('energy: con 2 o más escotillas del mismo nivel un multibloque cuenta un escalón más (GTM getMaxVoltage), con 1 no', () => {
  const recipes = [
    gt('t:mv_blast', 't:blast', { ins: [gi('t:dust')], outs: [gi('t:ingot_mv')], eut: 120 }),
    gt('t:hv_blast', 't:blast', { ins: [gi('t:dust')], outs: [gi('t:ingot_hv')], eut: 480 }),
    gt('t:lv_blast', 't:blast', { ins: [gi('t:dust')], outs: [gi('t:ingot_lv')], eut: 30 }),
  ];
  const base = (energy) => ({
    tier: 'energia',
    machines: [{ machine: 't:furnace', types: ['t:blast'], energy }],
    world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:furnace', 't:dust'] }],
    targets: [{ id: 'lv', item: 't:ingot_lv' }, { id: 'mv', item: 't:ingot_mv' }, { id: 'hv', item: 't:ingot_hv' }],
    autoTargets: [],
  });
  const dump = () => mkDump({ recipes, items: ['t:furnace', 't:dust'] });
  const two = run(dump(), base({ voltage: 32, hatches: 2 }));
  assert.deepEqual(verdicts(two.out.gate), { lv: 'PASS', mv: 'PASS', hv: 'FAIL' });
  assert.deepEqual(two.model.stats.rolledMachines, [{ machine: 't:furnace', hatches: 2, voltage: 32, maxEUt: 128 }]);
  assert.match(two.text, /2 escotilla\(s\) de 32 V -> 128 V/);
  const one = run(dump(), base({ voltage: 32, hatches: 1 }));
  assert.deepEqual(verdicts(one.out.gate), { lv: 'PASS', mv: 'FAIL', hv: 'FAIL' });
  assert.match(linesOf(one.out.gate, 'mv'), /ninguna máquina de t:blast admite 120 EU\/t/);
});

test('energy: las escotillas que admite el patrón salen de la estructura del pack (exactamente 2 -> 128 V; 1 -> 32 V)', () => {
  const recipes = [gt('t:mv_arc', 't:arc', { ins: [gi('t:dust')], outs: [gi('t:glass')], eut: 120 })];
  const structure = (limits) => ({
    'gtceu:arc': {
      id: 'gtceu:arc',
      slices: [['XSX']],
      symbols: { S: { kind: 'controller' }, X: { kind: 'oneOf', options: [{ kind: 'blocks', blocks: ['t:casing'] }, { kind: 'part', ability: 'energy_input', limits }] } },
    },
  });
  const cfg = {
    tier: 'energia-estructura',
    partAbilities: { energy_input: ['t:hatch'] },
    machines: [{ machine: 'gtceu:arc', types: ['t:arc'], energy: { voltage: 32 }, partsFromStructure: true }],
    world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['gtceu:arc', 't:dust', 't:casing', 't:hatch'] }],
    targets: [{ id: 'cristal', item: 't:glass' }],
    autoTargets: [],
  };
  const items = ['gtceu:arc', 't:dust', 't:casing', 't:hatch'];
  const two = run(mkDump({ recipes, items, structures: structure({ exact: 2 }) }), cfg);
  assert.equal(two.out.gate[0].verdict, 'PASS');
  assert.equal(two.model.stats.rolledMachines[0].hatches, 2);
  const one = run(mkDump({ recipes, items, structures: structure({ exact: 1 }) }), cfg);
  assert.equal(one.out.gate[0].verdict, 'FAIL');
  const none = run(mkDump({ recipes, items }), cfg);
  assert.match(none.model.warnings.join('\n'), /energy sin «hatches» y sin estructura/);
});

test('objetivo de receta con dimension: solo cuentan las recetas sin condición de dimensión o con esa dimensión', () => {
  const dim = (d, reverse) => [{ type: 'dimension', dimension: d, ...(reverse ? { reverse: true } : {}) }];
  const recipes = [
    gt('t:air_overworld', 'gtceu:gas_collector', { fouts: [gf('t:air', 10000)], eut: 16, conditions: dim('minecraft:overworld') }),
    gt('t:air_flat', 'gtceu:gas_collector', { fouts: [gf('t:air2', 10000)], eut: 16, conditions: dim('grindless:flat') }),
    gt('t:air_anywhere_but_nether', 'gtceu:gas_collector', { fouts: [gf('t:air3', 10000)], eut: 16, conditions: dim('minecraft:the_nether', true) }),
  ];
  const cfg = {
    tier: 'dimension',
    conditions: { dimension: { ignore: true } },
    machines: [{ machine: 't:collector', types: ['gtceu:gas_collector'], maxEUt: 32 }],
    world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:collector'] }],
    targets: [
      { id: 'aire-overworld', kind: 'recipe', type: 'gtceu:gas_collector', output: 'fluid:t:air', dimension: 'minecraft:overworld' },
      { id: 'aire-llano', kind: 'recipe', type: 'gtceu:gas_collector', output: 'fluid:t:air', dimension: 'grindless:flat' },
      { id: 'aire2-llano', kind: 'recipe', type: 'gtceu:gas_collector', output: 'fluid:t:air2', dimension: 'grindless:flat' },
      { id: 'aire2-vacio', kind: 'recipe', type: 'gtceu:gas_collector', output: 'fluid:t:air2', dimension: 'grindless:void' },
      { id: 'aire3-llano', kind: 'recipe', type: 'gtceu:gas_collector', output: 'fluid:t:air3', dimension: 'grindless:flat' },
      { id: 'aire3-nether', kind: 'recipe', type: 'gtceu:gas_collector', output: 'fluid:t:air3', dimension: 'minecraft:the_nether' },
      { id: 'aire-sin-dimension', kind: 'recipe', type: 'gtceu:gas_collector', output: 'fluid:t:air' },
    ],
    autoTargets: [],
  };
  const r = run(mkDump({ recipes, items: ['t:collector'], fluids: ['t:air', 't:air2', 't:air3'] }), cfg);
  assert.deepEqual(verdicts(r.out.gate), {
    'aire-overworld': 'PASS', 'aire-llano': 'FAIL', 'aire2-llano': 'PASS', 'aire2-vacio': 'FAIL',
    'aire3-llano': 'PASS', 'aire3-nether': 'FAIL', 'aire-sin-dimension': 'PASS',
  });
  assert.match(linesOf(r.out.gate, 'aire-llano'), /válida en grindless:flat/);
});
