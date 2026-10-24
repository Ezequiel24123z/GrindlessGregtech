// Pruebas de lo que añade el tier MV: herencia de configuración por id, piezas por máquina, config de GTM leída como booleanos
// y el motivo de un yacimiento de fluidos que no admite la dimensión.
import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadTierConfig } from '../lib/config.mjs';
import { gf, gi, gt, mkDump, run, shaped, shapeless, verdicts } from './helpers.mjs';

const TIERS = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'tiers');
const linesOf = (list, id) => list.find((r) => r.target.id === id).lines.join('\n');
const dups = (ids) => ids.filter((id, i) => ids.indexOf(id) !== i);

// ---------------------------------------------------------------- configuración real de los tiers

for (const tier of ['steam', 'lv', 'mv', 'hv']) {
  test(`config del tier ${tier}: ids únicos, cada objetivo tiene una forma válida y los "without" apuntan a sintéticas que existen`, () => {
    const { raw } = loadTierConfig({ tier }, TIERS);
    assert.deepEqual(dups(raw.targets.map((t) => t.id)), [], 'ids de objetivos repetidos');
    assert.deepEqual(dups(raw.autoTargets.map((t) => t.id)), [], 'ids de objetivos automáticos repetidos');
    assert.deepEqual(dups(raw.machines.map((m) => m.id || m.machine)), [], 'máquinas repetidas');
    assert.deepEqual(dups(raw.synthetic.map((s) => s.id)), [], 'sintéticas repetidas');
    assert.deepEqual(dups(raw.world.map((w) => w.id).filter(Boolean)), [], 'entradas de mundo repetidas');
    const synthetic = new Set(raw.synthetic.map((s) => s.id));
    for (const t of [...raw.targets, ...raw.autoTargets]) {
      assert.ok(t.item || t.fluid || t.anyOf || t.allOf || t.kind === 'recipe', `el objetivo ${t.id} no tiene item, fluid, anyOf, allOf ni kind`);
      for (const w of t.without || []) {
        if (w.startsWith('sintética:')) assert.ok(synthetic.has(w.slice('sintética:'.length)), `${t.id}: sin "${w}" pero esa sintética no existe`);
      }
    }
    assert.deepEqual(dups(raw.targets.map((t) => t.label)), [], 'etiquetas repetidas: dos objetivos dicen lo mismo');
  });
}

test('tier hijo: un elemento con el mismo id sustituye al del padre y dropTargets quita lo que ya no vale', () => {
  const { raw: lv } = loadTierConfig({ tier: 'lv' }, TIERS);
  const { raw: mv } = loadTierConfig({ tier: 'mv' }, TIERS);
  const ids = (cfg) => cfg.targets.map((t) => t.id);
  // las comprobaciones de fuga del LV dejan de ser ciertas en MV: ya no están y su lugar lo ocupa el objetivo positivo
  for (const id of ['silicio-gt-no-antes-de-mv', 'bobina-kanthal-no-antes-de-mv']) {
    assert.ok(ids(lv).includes(id));
    assert.ok(!ids(mv).includes(id));
  }
  assert.ok(ids(mv).includes('silicio-gt') && ids(mv).includes('bobina-kanthal'));
  // el resto de objetivos del LV se hereda (regresión): también las fugas que siguen valiendo
  assert.ok(ids(mv).includes('receta-aluminio-ebf') && ids(mv).includes('receta-obsidiana-arco'));
  assert.ok(mv.autoTargets.some((t) => t.id === 'auto-lava-no-automatica'));
  // el EBF del LV se hereda con su id y las variantes del MV se añaden con ids propios
  const ebf = mv.machines.filter((m) => m.machine === 'gtceu:electric_blast_furnace').map((m) => m.id || m.machine).sort();
  assert.deepEqual(ebf, [
    'gtceu:electric_blast_furnace', 'gtceu:electric_blast_furnace@lv-kanthal', 'gtceu:electric_blast_furnace@mv-cuproniquel',
    'gtceu:electric_blast_furnace@mv-kanthal',
  ]);
  // los mapas se combinan clave a clave: el MV añade escotillas MV a las habilidades y hereda las condiciones
  assert.ok(mv.partAbilities.energy_input.includes('gtceu:lv_energy_input_hatch') && mv.partAbilities.energy_input.includes('gtceu:mv_energy_input_hatch'));
  assert.deepEqual(mv.partAbilities.maintenance, ['gtceu:maintenance_hatch']);
  assert.equal(mv.conditions.environmental_hazard.unsupported, true);
  assert.deepEqual(mv.contexts, lv.contexts);
});

// ---------------------------------------------------------------- piezas por máquina

function hatchPack() {
  const recipes = [
    shaped('t:drill', ['H'], { H: { item: 't:hull' } }, 't:drill'),
    shaped('t:hatch_lv', ['I'], { I: { item: 't:ingot' } }, 't:lv_hatch'),
    shaped('t:casing', ['I'], { I: { item: 't:ingot' } }, 't:casing'),
    shaped('t:hull', ['I'], { I: { item: 't:ingot' } }, 't:hull'),
    shaped('t:mv_hatch_recipe', ['X'], { X: { item: 't:never' } }, 't:mv_hatch'),
  ];
  const structures = {
    't:drill': {
      id: 't:drill',
      slices: [['XXS']],
      symbols: {
        S: { kind: 'controller' },
        X: { kind: 'oneOf', options: [{ kind: 'blocks', blocks: ['t:casing'], limits: { min: 1 } }, { kind: 'part', ability: 'energy_input', limits: { max: 2 } }] },
      },
    },
  };
  const cfg = (machineAbilities) => ({
    tier: 'piezas',
    unconditionalTypes: ['minecraft:crafting_shaped'],
    partAbilities: { energy_input: ['t:lv_hatch', 't:mv_hatch'] },
    world: [{ id: 'w', mode: 'manual', items: ['t:ingot'] }],
    machines: [{ machine: 't:drill', types: [], partsFromStructure: true, ...(machineAbilities ? { partAbilities: machineAbilities } : {}) }],
    targets: [{ id: 'maquina', item: 'm:t:drill' }],
    autoTargets: [],
  });
  const dump = mkDump({ recipes, items: ['t:ingot', 't:drill', 't:never', 't:lv_hatch', 't:mv_hatch'], structures });
  return { dump, cfg };
}

test('machines[].partAbilities: la máquina exige solo la escotilla que dice aunque el tier admita otras para esa habilidad', () => {
  const { dump, cfg } = hatchPack();
  // con la lista del tier basta la escotilla LV
  assert.equal(run(dump, cfg()).out.verdict, 'PASS');
  // la máquina exige la escotilla MV, que nadie sabe fabricar: la cadena la nombra
  const r = run(dump, cfg({ energy_input: ['t:mv_hatch'] }));
  assert.equal(r.out.verdict, 'FAIL');
  assert.match(linesOf(r.out.gate, 'maquina'), /t:mv_hatch/);
  // el override es clave a clave y no toca las demás habilidades
  assert.deepEqual(verdicts(run(dump, cfg({ otra_habilidad: ['t:x'] })).out.gate), { maquina: 'PASS' });
});

// ---------------------------------------------------------------- config de GTM como booleanos

test('config.json: los booleanos escritos como texto por volcados antiguos se leen como booleanos', () => {
  const dump = mkDump({ config: { a: 'true', b: 'false', c: null, d: true, e: 5, f: 'otro' } });
  assert.deepEqual(dump.config, { a: true, b: false, c: null, d: true, e: 5, f: 'otro' });
});

// ---------------------------------------------------------------- piezas que dependen de la config de GTM

test('parts con onlyIf: GTM no exige la pieza cuando la config dice que no (mantenimiento) y se sigue exigiendo si no se puede leer', () => {
  const recipes = [
    shaped('t:ebf_recipe', ['H'], { H: { item: 't:hull' } }, 't:ebf'),
    shaped('t:hull_recipe', ['I'], { I: { item: 't:ingot' } }, 't:hull'),
  ];
  const cfg = {
    tier: 'mantenimiento',
    unconditionalTypes: ['minecraft:crafting_shaped'],
    world: [{ id: 'w', mode: 'manual', items: ['t:ingot'] }],
    machines: [{
      machine: 't:ebf', types: [],
      parts: ['t:hull', { anyOf: ['t:maintenance'], onlyIf: { config: 'machines.enableMaintenance', equals: true } }],
    }],
    targets: [{ id: 'ebf', item: 'm:t:ebf' }],
    autoTargets: [],
  };
  const dump = (config) => mkDump({ recipes, items: ['t:ingot', 't:ebf', 't:hull', 't:maintenance'], config });
  // con mantenimiento la escotilla (que nadie fabrica) es obligatoria
  const on = run(dump({ 'machines.enableMaintenance': true }), cfg);
  assert.equal(on.out.verdict, 'FAIL');
  assert.match(linesOf(on.out.gate, 'ebf'), /t:maintenance/);
  assert.deepEqual(on.model.stats.partsNotRequired, []);
  // sin mantenimiento la máquina se construye sin ella y el informe lo dice
  const off = run(dump({ 'machines.enableMaintenance': false }), cfg);
  assert.equal(off.out.verdict, 'PASS');
  assert.equal(off.model.stats.partsNotRequired.length, 1);
  assert.match(off.text, /pieza que la config de GTM no exige: .*machines\.enableMaintenance = false; solo se exige con true.* en t:ebf/);
  // config ilegible o sin config.json: se sigue exigiendo y se avisa
  const unknown = run(dump(null), cfg);
  assert.equal(unknown.out.verdict, 'FAIL');
  assert.match(unknown.model.warnings.join('\n'), /no se puede comprobar la config machines\.enableMaintenance \(el volcado no trae config\.json\); la pieza se sigue exigiendo/);
});

// ---------------------------------------------------------------- objetivos por veta con tabla de la perforadora

test('objetivos por veta: requireItem salta las vetas sin objeto de la tabla (otros mods) y las lista; {id} quita "_vein" también en medio', () => {
  const veins = [
    { id: 'gtceu:redstone_vein_ow', layer: 'deepslate', dims: ['minecraft:overworld'], mats: ['gtceu:ruby'] },
    { id: 'gtceu:topaz_vein', layer: 'netherrack', dims: ['minecraft:the_nether'], mats: ['gtceu:topaz'] },
    { id: 'gtnn:apatite_vein_tf', layer: 'tf', dims: ['minecraft:overworld'], mats: ['gtceu:apatite'] },
  ];
  const recipes = [
    gt('t:drill_ow', 'gtceu:vein_drilling', { ins: [gi('grindless:vein_sample_redstone_ow', 1, 0)], outs: [gi('gtceu:raw_ruby')] }),
  ];
  const cfg = {
    tier: 'tabla',
    machines: [{ machine: 't:drill', types: ['gtceu:vein_drilling'] }],
    world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:drill', 'grindless:vein_sample_redstone_ow', 'grindless:vein_sample_topaz'] }],
    targets: [],
    autoTargets: [],
    autoTargetsFromVeins: [{
      idPrefix: 'p-', dimensions: ['minecraft:overworld', 'minecraft:the_nether'], requireItem: 'grindless:vein_sample_{id}',
      target: { kind: 'recipe', type: 'gtceu:vein_drilling', input: 'grindless:vein_sample_{id}' },
    }],
  };
  const dump = mkDump({ recipes, veins, items: ['t:drill', 'gtceu:raw_ruby', 'grindless:vein_sample_redstone_ow', 'grindless:vein_sample_topaz'] });
  const r = run(dump, cfg);
  assert.deepEqual(r.out.auto.map((x) => x.target.id), ['p-redstone_vein_ow', 'p-topaz_vein']);
  assert.equal(r.out.auto[0].target.input, 'grindless:vein_sample_redstone_ow');
  assert.equal(r.out.auto[0].verdict, 'PASS');
  // la de la veta del Nether no tiene receta: FAIL; la del otro mod ni siquiera es un objetivo
  assert.equal(r.out.auto[1].verdict, 'FAIL');
  assert.deepEqual(r.model.stats.veinsWithoutItem, ['gtnn:apatite_vein_tf']);
  assert.match(r.text, /vetas del registro que la tabla de la perforadora no ofrece \(sin muestra o sin receta de perforación.*; no se comprueban\): gtnn:apatite_vein_tf/);
  // requireRecipe se fija en las recetas: la muestra de topacio existe (como una muestra oculta de una veta apartada) pero ninguna
  // receta de perforación la toma, así que la veta no tiene objetivo; tampoco la del otro mod
  const byRecipe = run(dump, {
    ...cfg,
    autoTargetsFromVeins: [{
      ...cfg.autoTargetsFromVeins[0], requireItem: undefined,
      requireRecipe: { type: 'gtceu:vein_drilling', input: 'grindless:vein_sample_{id}' },
    }],
  });
  assert.deepEqual(byRecipe.out.auto.map((x) => [x.target.id, x.verdict]), [['p-redstone_vein_ow', 'PASS']]);
  assert.deepEqual(byRecipe.model.stats.veinsWithoutItem, ['gtceu:topaz_vein', 'gtnn:apatite_vein_tf']);
});

test('mundo con fromVeins.requireRecipe: una veta apartada (muestra registrada, sin receta de perforación) no da menas en el viaje', () => {
  const veins = [
    { id: 'gtceu:bauxite_vein_end', layer: 'endstone', dims: ['minecraft:the_end'], mats: ['gtceu:bauxite', 'gtceu:ilmenite'] },
    { id: 'gtceu:scheelite_vein', layer: 'endstone', dims: ['minecraft:the_end'], mats: ['gtceu:scheelite', 'gtceu:tungstate'] },
  ];
  const recipes = [
    gt('t:drill_end', 'gtceu:vein_drilling', { ins: [gi('grindless:vein_sample_bauxite_end', 1, 0)], outs: [gi('gtceu:raw_bauxite')] }),
    // la muestra apartada solo se convierte en una sonda vacía
    shapeless('t:probe_from_scheelite', [{ item: 'grindless:vein_sample_scheelite' }], 'grindless:empty_vein_probe'),
  ];
  const world = (from) => [{ id: 'menas-end', mode: 'manual', bootstrap: true, template: 'gtceu:raw_{m}', materials: [], fromVeins: { dimensions: ['minecraft:the_end'], ...from } }];
  const cfg = (from) => ({
    tier: 'end', unconditionalTypes: ['minecraft:crafting_shapeless'], world: world(from),
    targets: [{ id: 'bauxita', item: 'gtceu:raw_bauxite' }, { id: 'ilmenita', item: 'gtceu:raw_ilmenite' }, { id: 'scheelita', item: 'gtceu:raw_scheelite' }],
    autoTargets: [],
  });
  const dump = mkDump({
    recipes, veins,
    items: ['gtceu:raw_bauxite', 'gtceu:raw_ilmenite', 'gtceu:raw_scheelite', 'gtceu:raw_tungstate', 'grindless:vein_sample_bauxite_end', 'grindless:vein_sample_scheelite'],
  });
  // con requireItem la muestra oculta todavía cuenta la veta de scheelita
  assert.deepEqual(verdicts(run(dump, cfg({ requireItem: 'grindless:vein_sample_{id}' })).out.gate), { bauxita: 'PASS', ilmenita: 'PASS', scheelita: 'PASS' });
  // con requireRecipe solo cuentan las vetas con receta de perforación: la de bauxita (con su ilmenita) sí, la de scheelita no
  const r = run(dump, cfg({ requireRecipe: { type: 'gtceu:vein_drilling', input: 'grindless:vein_sample_{id}' } }));
  assert.deepEqual(verdicts(r.out.gate), { bauxita: 'PASS', ilmenita: 'PASS', scheelita: 'FAIL' });
});

// ---------------------------------------------------------------- motivo del bloqueo de un yacimiento

test('un yacimiento que no admite la dimensión es la raíz que falta aunque otra receta lejana produzca el fluido', () => {
  const recipes = [
    gt('t:soul_oil', 't:centrifuge', { ins: [gi('t:soul_sand')], fouts: [gf('t:oil')] }),
    shaped('t:rig_recipe', ['I'], { I: { item: 't:ingot' } }, 't:rig'),
  ];
  const cfg = (dimension) => ({
    tier: 'aceite',
    dimension,
    unconditionalTypes: ['minecraft:crafting_shaped'],
    machines: [{ machine: 't:rig', types: [] }, { machine: 't:centrifuge', types: ['t:centrifuge'] }],
    world: [
      { id: 'lingotes', mode: 'manual', bootstrap: true, items: ['t:ingot'] },
      { id: 'yacimientos', mode: 'auto', via: ['t:rig'], fromFluidVeins: true },
    ],
    targets: [],
    autoTargets: [{ id: 'aceite', fluid: 't:oil' }],
  });
  const dump = mkDump({
    recipes, items: ['t:ingot', 't:rig', 't:centrifuge', 't:soul_sand'], fluids: ['t:oil'],
    fluidVeins: [{ id: 'gtceu:oil_deposit', fluid: 't:oil', weight: 20, dims: ['minecraft:overworld'] }],
  });
  assert.equal(run(dump, cfg('minecraft:overworld')).out.verdict, 'PASS');
  const flat = run(dump, cfg('grindless:flat'));
  assert.equal(flat.out.verdict, 'FAIL');
  const text = linesOf(flat.out.auto, 'aceite');
  assert.match(text, /el yacimiento gtceu:oil_deposit solo admite minecraft:overworld; este análisis es en grindless:flat/);
  assert.doesNotMatch(text, /soul_sand/);
});
