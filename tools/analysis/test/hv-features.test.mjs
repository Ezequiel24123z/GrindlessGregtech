// Pruebas de lo que añade el tier HV: la condición de cámara limpia que exige una máquina construida, las comprobaciones de fuga de
// la puerta (`without` + expect "unreachable"), las menas que exigen antes un objeto (la llave del End) y la recolección de vetas
// filtrada por la tabla de la perforadora.
import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadTierConfig } from '../lib/config.mjs';
import { gi, gt, mkDump, run, shaped, verdicts } from './helpers.mjs';

const TIERS = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'tiers');
const linesOf = (list, id) => list.find((r) => r.target.id === id).lines.join('\n');

// ---------------------------------------------------------------- configuración real del tier

test('tier hv: hereda del MV, quita las dos comprobaciones del End que la Luna deja sin valor y la cámara limpia pasa de no soportada a exigir la máquina', () => {
  const { raw: mv } = loadTierConfig({ tier: 'mv' }, TIERS);
  const { raw: hv } = loadTierConfig({ tier: 'hv' }, TIERS);
  const ids = (cfg) => cfg.targets.map((t) => t.id);
  // v0.5.0: el End (y con él el ojo de ender y el blaze) es del MV; en HV la Luna también da ilmenita y cromita
  for (const id of ['ilmenita-no-sale-del-end', 'menas-end-sin-llave']) {
    assert.ok(ids(mv).includes(id), `${id} debería estar en el MV`);
    assert.ok(!ids(hv).includes(id), `${id} ya no vale en el HV`);
  }
  for (const id of ['ojo-ender-no-antes-de-hv', 'polvo-blaze-no-antes-de-hv', 'vara-blaze-no-antes-de-hv']) {
    assert.ok(!ids(mv).includes(id) && !ids(hv).includes(id), `${id}: el ojo de ender y el blaze ya son del MV`);
  }
  for (const id of ['llave-end', 'ojo-ender', 'menas-end-con-llave']) assert.ok(ids(hv).includes(id), `${id} se hereda del MV`);
  // la escotilla HV deja de ser opcional (el mismo id sustituye al del MV)
  assert.equal(mv.targets.find((t) => t.id === 'escotilla-energia-hv').optional, true);
  assert.ok(!hv.targets.find((t) => t.id === 'escotilla-energia-hv').optional);
  // la regresión se hereda: AE2 base entero en LV, el EBF del MV y las fugas que siguen valiendo
  for (const id of ['componente-256k', 'receta-ebf-estable', 'receta-aluminio-ebf', 'receta-obsidiana-arco']) assert.ok(ids(hv).includes(id), id);
  assert.ok(hv.autoTargets.some((t) => t.id === 'auto-lava-no-automatica'));
  // la cámara limpia: el padre la declara no soportada y el hijo la sustituye entera (los mapas se combinan clave a clave)
  assert.equal(mv.conditions.cleanroom.unsupported, true);
  assert.ok(hv.conditions.cleanroom.needsByField);
  assert.equal(hv.conditions.cleanroom.unsupported, undefined);
  assert.equal(hv.conditions.research.unsupported, true);
  assert.deepEqual(hv.contexts, mv.contexts);
  // los registros de máquinas se suman: el HV añade el prefijo gtceu:hv_ al de LV y MV
  assert.deepEqual(hv.machinesFromRegistry.map((m) => m.prefix), ['gtceu:lv_', 'gtceu:mv_', 'gtceu:hv_']);
});

test('tier hv: los "without" apuntan a algo que existe (sintética, entrada de mundo o regla de construir de una máquina declarada)', () => {
  const { raw } = loadTierConfig({ tier: 'hv' }, TIERS);
  const synthetic = new Set(raw.synthetic.map((s) => s.id));
  const world = new Set(raw.world.map((w) => w.id));
  const machines = raw.machines.map((m) => m.id || m.machine);
  for (const t of [...raw.targets, ...raw.autoTargets]) {
    for (const w of t.without || []) {
      if (w.startsWith('sintética:')) assert.ok(synthetic.has(w.slice('sintética:'.length)), `${t.id}: ${w}`);
      else if (w.startsWith('mundo:')) assert.ok(world.has(w.slice('mundo:'.length)), `${t.id}: ${w}`);
      else if (w.startsWith('construir:') || w.startsWith('operar:')) {
        const re = new RegExp('^' + w.slice(w.indexOf(':') + 1).replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
        assert.ok(machines.some((m) => re.test(m)), `${t.id}: ningún id de máquina casa con ${w}`);
      }
    }
  }
});

test('tier hv: el modelo se construye con un volcado casi vacío y sin selectores inválidos (los objetivos fallan con motivo, no con excepciones)', () => {
  const { raw } = loadTierConfig({ tier: 'hv' }, TIERS);
  const dump = mkDump({ recipes: [], items: ['gtceu:cleanroom', 'gtceu:vacuum_freezer'] });
  const r = run(dump, raw);
  assert.equal(r.out.verdict, 'FAIL');
  assert.ok(r.out.gate.length > 100 && r.out.auto.length > 50);
  assert.deepEqual(r.model.warnings.filter((w) => /selector no válido/.test(w)), []);
});

// ---------------------------------------------------------------- condición de cámara limpia

function cleanroomPack({ withControllerRecipe = true } = {}) {
  const clean = [{ type: 'cleanroom', cleanroom: 'cleanroom' }];
  const sterile = [{ type: 'cleanroom', cleanroom: 'sterile_cleanroom' }];
  const recipes = [
    ...(withControllerRecipe ? [shaped('t:cr', ['I'], { I: { item: 't:ingot' } }, 't:cleanroom')] : []),
    shaped('t:asm', ['I'], { I: { item: 't:ingot' } }, 't:assembler'),
    gt('t:chip_clean', 't:asm_type', { ins: [gi('t:ingot')], outs: [gi('t:chip')], conditions: clean }),
    gt('t:chip_sterile', 't:asm_type', { ins: [gi('t:ingot')], outs: [gi('t:sterile_chip')], conditions: sterile }),
    gt('t:chip_plain', 't:asm_type', { ins: [gi('t:ingot')], outs: [gi('t:plain_chip')] }),
  ];
  const cfg = {
    tier: 'camara',
    unconditionalTypes: ['minecraft:crafting_shaped'],
    conditions: { cleanroom: { needsByField: { field: 'cleanroom', map: { cleanroom: ['run:t:cleanroom'] } } } },
    world: [{ id: 'lingotes', mode: 'auto', items: ['t:ingot'] }],
    machines: [
      { machine: 't:assembler', types: ['t:asm_type'] },
      { machine: 't:cleanroom', types: [] },
    ],
    targets: [
      { id: 'chip', item: 't:chip' },
      { id: 'chip-esteril', item: 't:sterile_chip' },
      { id: 'chip-sin-camara', item: 't:plain_chip' },
      { id: 'camara', item: 'run:t:cleanroom' },
    ],
    autoTargets: [{ id: 'auto-chip', item: 't:chip' }],
  };
  const dump = mkDump({ recipes, items: ['t:ingot', 't:cleanroom', 't:assembler'] });
  return { dump, cfg };
}

test('conditions.needsByField: una receta de cámara limpia exige la máquina construida; la estéril y las sin condición no cambian', () => {
  const { dump, cfg } = cleanroomPack();
  const r = run(dump, cfg);
  assert.deepEqual(verdicts(r.out.gate), { chip: 'PASS', 'chip-esteril': 'FAIL', 'chip-sin-camara': 'PASS', camara: 'PASS' });
  // la cámara limpia se construye una vez (capital): vale también para el paso automático
  assert.deepEqual(verdicts(r.out.auto), { 'auto-chip': 'PASS' });
  // la variante estéril no tiene entrada en el mapa: sigue siendo una condición no soportada y lo dice
  assert.match(linesOf(r.out.gate, 'chip-esteril'), /condición cleanroom «sterile_cleanroom»/);
});

test('conditions.needsByField: sin el controlador de la cámara limpia, las recetas con la condición se quedan sin hacer y la cadena nombra la máquina', () => {
  const { dump, cfg } = cleanroomPack({ withControllerRecipe: false });
  const r = run(dump, cfg);
  assert.deepEqual(verdicts(r.out.gate), { chip: 'FAIL', 'chip-esteril': 'FAIL', 'chip-sin-camara': 'PASS', camara: 'FAIL' });
  assert.match(linesOf(r.out.gate, 'chip'), /t:cleanroom/);
  assert.match(linesOf(r.out.gate, 'chip'), /cleanroom «cleanroom»|cleanroom: run:t:cleanroom|run:t:cleanroom/);
  assert.deepEqual(verdicts(r.out.auto), { 'auto-chip': 'FAIL' });
});

test('conditions.needs (sin campo): una condición se cumple con una pieza concreta construida', () => {
  const recipes = [
    shaped('t:cr', ['I'], { I: { item: 't:ingot' } }, 't:vacuum_cell'),
    gt('t:cold', 't:asm_type', { ins: [gi('t:ingot')], outs: [gi('t:cold_chip')], conditions: [{ type: 'vacuum' }] }),
    shaped('t:asm', ['I'], { I: { item: 't:ingot' } }, 't:assembler'),
  ];
  const cfg = (withIt) => ({
    tier: 'cond',
    unconditionalTypes: ['minecraft:crafting_shaped'],
    conditions: { vacuum: withIt ? { needs: ['t:vacuum_cell'] } : { unsupported: true } },
    world: [{ id: 'lingotes', mode: 'auto', items: ['t:ingot'] }],
    machines: [{ machine: 't:assembler', types: ['t:asm_type'] }],
    targets: [{ id: 'frio', item: 't:cold_chip' }],
    autoTargets: [],
  });
  const dump = mkDump({ recipes, items: ['t:ingot', 't:assembler', 't:vacuum_cell'] });
  assert.equal(run(dump, cfg(true)).out.verdict, 'PASS');
  assert.equal(run(dump, cfg(false)).out.verdict, 'FAIL');
});

// ---------------------------------------------------------------- comprobaciones de fuga de la puerta (without)

function freezerPack({ leak = false } = {}) {
  const recipes = [
    shaped('t:freezer_recipe', ['I'], { I: { item: 't:ingot' } }, 't:freezer'),
    gt('t:cool', 't:vac', { ins: [gi('t:hot')], outs: [gi('t:ti')] }),
    ...(leak ? [shaped('t:alt', ['H'], { H: { item: 't:hot' } }, 't:ti')] : []),
  ];
  const cfg = {
    tier: 'fuga',
    unconditionalTypes: ['minecraft:crafting_shaped'],
    world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:ingot', 't:hot'] }],
    machines: [{ id: 't:freezer@mv2', machine: 't:freezer', types: ['t:vac'] }],
    targets: [
      { id: 'ti', item: 't:ti' },
      { id: 'ti-solo-con-congelador', item: 't:ti', without: ['construir:t:freezer*'], expect: 'unreachable' },
      { id: 'ti-sin-glob', item: 't:ti', without: ['construir:t:freezer'], expect: 'unreachable' },
      { id: 'ti-sin-congelador', item: 't:ti', without: ['construir:t:freezer*'] },
      { id: 'receta-frio', kind: 'recipe', type: 't:vac' },
      { id: 'receta-frio-sin-congelador', kind: 'recipe', type: 't:vac', without: ['construir:t:freezer*'] },
    ],
    autoTargets: [],
  };
  const dump = mkDump({ recipes, items: ['t:ingot', 't:hot', 't:ti', 't:freezer'] });
  return { dump, cfg };
}

test('puerta con `without`: se recalcula el alcance sin esas reglas; la variante @ necesita un asterisco en el glob', () => {
  const { dump, cfg } = freezerPack();
  const r = run(dump, cfg);
  assert.deepEqual(verdicts(r.out.gate), {
    ti: 'PASS',
    'ti-solo-con-congelador': 'PASS', // sin congelador no hay titanio: la dependencia se cumple
    'ti-sin-glob': 'FAIL', // «construir:t:freezer» no casa con «construir:t:freezer@mv2»: el congelador sigue ahí y el titanio se consigue
    'ti-sin-congelador': 'FAIL',
    'receta-frio': 'PASS',
    'receta-frio-sin-congelador': 'FAIL',
  });
  assert.match(linesOf(r.out.gate, 'ti-solo-con-congelador'), /no se puede conseguir en este tier, como debe ser/);
  assert.match(linesOf(r.out.gate, 'ti-sin-glob'), /FUGA/);
  // la cadena de bloqueo se calcula sobre la vista sin esas reglas y nombra la máquina que falta
  assert.match(linesOf(r.out.gate, 'ti-sin-congelador'), /t:vac|t:freezer/);
  assert.match(r.text, /\[sin construir:t:freezer\*\]/);
});

test('puerta con `without`: si existe otra vía al objeto, la comprobación de fuga falla y enseña esa vía', () => {
  const { dump, cfg } = freezerPack({ leak: true });
  const r = run(dump, cfg);
  assert.equal(verdicts(r.out.gate)['ti-solo-con-congelador'], 'FAIL');
  const text = linesOf(r.out.gate, 'ti-solo-con-congelador');
  assert.match(text, /FUGA/);
  assert.match(text, /t:alt/);
  // y los objetivos sin `without` no se ven afectados por la vista recalculada
  assert.equal(verdicts(r.out.gate).ti, 'PASS');
});

// ---------------------------------------------------------------- menas que exigen antes un objeto (la llave del End)

function endPack({ key = true, drill = true } = {}) {
  const recipes = [
    ...(key ? [shaped('t:key_recipe', ['I'], { I: { item: 't:ingot' } }, 't:key')] : []),
    shaped('t:sample_recipe', ['RR'], { R: { item: 't:end_ore' } }, 't:sample'),
    shaped('t:drill_recipe', ['I'], { I: { item: 't:ingot' } }, 't:drill'),
    ...(drill ? [gt('t:end_drill', 't:drilling', { ins: [gi('t:sample', 1, 0)], outs: [gi('t:end_ore')] })] : []),
  ];
  const cfg = {
    tier: 'end',
    unconditionalTypes: ['minecraft:crafting_shaped'],
    world: [
      { id: 'lingotes', mode: 'auto', items: ['t:ingot'] },
      { id: 'menas-end', mode: 'manual', bootstrap: true, needs: ['t:key'], items: ['t:end_ore'] },
    ],
    machines: [{ machine: 't:drill', types: ['t:drilling'] }],
    targets: [
      { id: 'mena', item: 't:end_ore' },
      { id: 'muestra', item: 't:sample' },
      { id: 'mena-sin-viaje', item: 't:end_ore', without: ['mundo:menas-end'], expect: 'unreachable' },
    ],
    autoTargets: [{ id: 'auto-mena', item: 't:end_ore' }],
  };
  const dump = mkDump({ recipes, items: ['t:ingot', 't:key', 't:sample', 't:drill', 't:end_ore'] });
  return { dump, cfg };
}

test('mundo manual con `needs`: con la llave las menas se recogen (un viaje), la perforadora las repone y sin el viaje no hay menas', () => {
  const { dump, cfg } = endPack();
  const r = run(dump, cfg);
  // sin la regla del viaje no hay mena, ni muestra para la perforadora: la dependencia de la llave se cumple
  assert.deepEqual(verdicts(r.out.gate), { mena: 'PASS', muestra: 'PASS', 'mena-sin-viaje': 'PASS' });
  assert.deepEqual(verdicts(r.out.auto), { 'auto-mena': 'PASS' });
  assert.match(linesOf(r.out.auto, 'auto-mena'), /se sostiene con/);
});

test('mundo manual con `needs`: las menas que solo salen del viaje cuentan como arranque (se agotan), no como recurso repuesto', () => {
  const { dump, cfg } = endPack({ drill: false });
  const r = run(dump, cfg);
  assert.deepEqual(verdicts(r.out.gate), { mena: 'PASS', muestra: 'PASS', 'mena-sin-viaje': 'PASS' });
  assert.equal(verdicts(r.out.auto)['auto-mena'], 'FAIL');
  assert.match(linesOf(r.out.auto, 'auto-mena'), /arranque manual; no se repone/);
});

test('mundo manual con `needs`: sin el objeto que exige (la llave) no hay menas, ni muestra, ni arranque; la cadena nombra la llave', () => {
  const { dump, cfg } = endPack({ key: false });
  const r = run(dump, cfg);
  assert.deepEqual(verdicts(r.out.gate), { mena: 'FAIL', muestra: 'FAIL', 'mena-sin-viaje': 'PASS' });
  assert.match(linesOf(r.out.gate, 'mena'), /t:key/);
  assert.match(linesOf(r.out.gate, 'mena'), /menas-end/);
  // sin llave nadie llega a la mena: tampoco la perforadora tiene muestra
  assert.deepEqual(verdicts(r.out.auto), { 'auto-mena': 'FAIL' });
});

// ---------------------------------------------------------------- recolección de vetas filtrada por la tabla

test('mundo con fromVeins: el objeto de cada mena se resuelve con el registro del volcado (addon, vanilla o gtceu), sin overrides', () => {
  const veins = [
    { id: 'gtceu:germanite_vein', layer: 'netherrack', dims: ['minecraft:the_nether'], mats: ['gtceu:germanite', 'gtceu:iron'] },
    { id: 'gtceu:zirconium_vein', layer: 'endstone', dims: ['minecraft:the_end'], mats: ['gtca:red_zircon', 'gtca:green_fuchsite'] },
    { id: 'gtceu:copper_vein', layer: 'stone', dims: ['minecraft:overworld'], mats: ['gtceu:copper', 'gtceu:chalcopyrite', 'gtceu:endstone'] },
  ];
  const cfg = {
    tier: 'espacios',
    world: [{ id: 'menas', mode: 'manual', bootstrap: true, template: 'gtceu:raw_{m}', materials: [], fromVeins: { dimensions: ['minecraft:the_nether', 'minecraft:the_end', 'minecraft:overworld'] } }],
    targets: [
      { id: 'germanita', item: 'gtca:raw_germanite' }, // el material dice gtceu:germanite pero la mena vive en el addon
      { id: 'hierro', item: 'minecraft:raw_iron' }, // sin gtceu:raw_iron: la vanilla
      { id: 'circon', item: 'gtca:raw_red_zircon' },
      { id: 'fuchsita', item: 'gtca:raw_green_fuchsite' },
      { id: 'calcopirita', item: 'gtceu:raw_chalcopyrite' },
      { id: 'cobre', item: 'minecraft:raw_copper' },
      { id: 'piedra-del-end', item: 'gtceu:raw_endstone' }, // no existe: no se inventa
    ],
    autoTargets: [],
  };
  const dump = mkDump({
    veins,
    items: ['gtca:raw_germanite', 'minecraft:raw_iron', 'gtca:raw_red_zircon', 'gtca:raw_green_fuchsite', 'gtceu:raw_chalcopyrite', 'minecraft:raw_copper'],
  });
  const r = run(dump, cfg);
  assert.deepEqual(verdicts(r.out.gate), {
    germanita: 'PASS', hierro: 'PASS', circon: 'PASS', fuchsita: 'PASS', calcopirita: 'PASS', cobre: 'PASS', 'piedra-del-end': 'FAIL',
  });
  // `overrides` sigue valiendo como reserva cuando el volcado no tiene ningún objeto con ese nombre
  const fallback = run(mkDump({ veins: [veins[2]], items: ['t:mi_cobre'] }), {
    ...cfg, world: [{ ...cfg.world[0], overrides: { copper: 't:mi_cobre' } }], targets: [{ id: 'cobre', item: 't:mi_cobre' }],
  });
  assert.deepEqual(verdicts(fallback.out.gate), { cobre: 'PASS' });
});

test('mundo con fromVeins.requireItem: solo las vetas con muestra en la tabla dan menas; las demás del registro no', () => {
  const veins = [
    { id: 'gtceu:bauxite_vein_end', layer: 'endstone', dims: ['minecraft:the_end'], mats: ['gtceu:bauxite', 'gtceu:ilmenite'] },
    { id: 'gtceu:naquadah_vein', layer: 'endstone', dims: ['minecraft:the_end'], mats: ['gtceu:naquadah'] },
    { id: 'gtceu:scheelite_vein', layer: 'endstone', dims: ['minecraft:the_end'], mats: ['gtceu:scheelite'] },
    { id: 'gtceu:zirconium_vein', layer: 'endstone', dims: ['minecraft:the_end'], mats: ['gtca:red_zircon', 'gtceu:endstone'] },
    { id: 'gtceu:iron_vein', layer: 'stone', dims: ['minecraft:overworld'], mats: ['gtceu:hematite'] },
  ];
  const cfg = {
    tier: 'tabla-end',
    world: [{
      id: 'menas-end', mode: 'manual', bootstrap: true, template: 'gtceu:raw_{m}', materials: [],
      fromVeins: { dimensions: ['minecraft:the_end'], requireItem: 'grindless:vein_sample_{id}' },
    }],
    targets: [
      { id: 'bauxita', item: 'gtceu:raw_bauxite' },
      { id: 'ilmenita', item: 'gtceu:raw_ilmenite' },
      { id: 'scheelita', item: 'gtceu:raw_scheelite' },
      { id: 'circon', item: 'gtca:raw_red_zircon' },
      { id: 'naquadah', item: 'gtceu:raw_naquadah' },
      { id: 'hematita', item: 'gtceu:raw_hematite' },
    ],
    autoTargets: [],
  };
  const dump = mkDump({
    veins,
    items: [
      'gtceu:raw_bauxite', 'gtceu:raw_ilmenite', 'gtceu:raw_scheelite', 'gtceu:raw_naquadah', 'gtceu:raw_hematite', 'gtca:raw_red_zircon',
      'grindless:vein_sample_bauxite_end', 'grindless:vein_sample_scheelite', 'grindless:vein_sample_zirconium',
    ],
  });
  const r = run(dump, cfg);
  // la mena de un material de un addon (gtca:red_zircon) vive en el espacio de nombres del addon (gtca:raw_red_zircon)
  assert.deepEqual(verdicts(r.out.gate), {
    bauxita: 'PASS', ilmenita: 'PASS', scheelita: 'PASS', circon: 'PASS', naquadah: 'FAIL', hematita: 'FAIL',
  });
});
