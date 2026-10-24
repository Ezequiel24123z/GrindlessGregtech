// Pruebas de lo que añade el tier MV: herencia de configuración por id, piezas por máquina, config de GTM leída como booleanos
// y el motivo de un yacimiento de fluidos que no admite la dimensión.
import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadTierConfig } from '../lib/config.mjs';
import { gf, gi, gt, mkDump, run, shaped, verdicts } from './helpers.mjs';

const TIERS = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'tiers');
const linesOf = (list, id) => list.find((r) => r.target.id === id).lines.join('\n');
const dups = (ids) => ids.filter((id, i) => ids.indexOf(id) !== i);

// ---------------------------------------------------------------- configuración real de los tiers

for (const tier of ['steam', 'lv', 'mv']) {
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
