// Pruebas de la regla de eras (lib/eras.mjs): nada de una era puede pedir un recurso que sale en una era posterior.
// Mini pack: la Tierra da mena y bauxita; el acero sale de la mena; el titanio sale de la ilmenita, que solo se recoge en la Luna
// (con el cohete); el End da su mena con la llave. Los objetos de cada era se comprueban con los recursos posteriores quitados.
import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadTierConfig } from '../lib/config.mjs';
import { lfp, Graph } from '../lib/engine.mjs';
import { gi, gt, mkDump, run, shaped } from './helpers.mjs';

const TIERS = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'tiers');
const S = (id, inputs, result) => shaped(id, [Object.keys(inputs).join('')], Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, { item: v }])), result);
const groupOf = (r, id) => r.out.eras.groups.find((x) => x.group.id === id);
const textOf = (r, id) => groupOf(r, id).lines.join('\n');

/**
 * opciones (mutaciones): scannerTi (el escáner HV pide placa de titanio), bitTi (la perforadora HV pide la broca de titanio),
 * leak (la electrólisis de la bauxita da polvo de titanio como subproducto), mvEnd (un objeto MV pide la mena del End),
 * hullW (el casco EV pide tungsteno), onlyFrom (comprobación "el titanio solo sale de la Luna").
 */
function eraPack(o = {}) {
  const recipes = [
    S('t:ingot', { O: 't:ore' }, 't:ingot'),
    S('t:steel_plate', { I: 't:ingot' }, 't:steel_plate'),
    S('t:rocket', { P: 't:steel_plate' }, 't:rocket'),
    S('t:end_key', { I: 't:ingot' }, 't:end_key'),
    S('t:ti_dust', { R: 't:raw_ilmenite' }, 't:ti_dust'),
    S('t:ti_plate', { D: 't:ti_dust' }, 't:ti_plate'),
    S('t:ti_bit', { T: 't:ti_plate' }, 't:ti_bit'),
    S('t:hv_bit', { P: 't:steel_plate' }, 't:hv_bit'),
    S('t:hv_ti_tool', { T: 't:ti_plate' }, 't:hv_ti_tool'),
    S('t:hv_scanner', o.scannerTi ? { P: 't:steel_plate', T: 't:ti_plate' } : { P: 't:steel_plate' }, 't:hv_scanner'),
    S('t:ev_hull', o.hullW ? { T: 't:ti_plate', W: 't:w_dust' } : { T: 't:ti_plate' }, 't:ev_hull'),
    S('t:mv_thing', o.mvEnd ? { I: 't:ingot', E: 't:end_ore' } : { I: 't:ingot' }, 't:mv_thing'),
    S('t:al_thing', { A: 't:al_dust' }, 't:al_thing'),
    S('t:sample', { O: 't:ore' }, 't:sample'),
    S('t:drill', { P: 't:steel_plate' }, 't:drill'),
    S('t:electrolyzer', { P: 't:steel_plate' }, 't:electrolyzer'),
    gt('t:drill/hv/a', 't:drilling', { ins: [gi('t:sample', 1, 0), gi(o.bitTi ? 't:ti_bit' : 't:hv_bit', 1, 1000)], outs: [gi('t:ore')] }),
    gt('t:electro/bauxite', 't:electrolyzer', { ins: [gi('t:bauxite')], outs: o.leak ? [gi('t:al_dust'), gi('t:ti_dust', 1, 2000)] : [gi('t:al_dust')] }),
    // reciclaje: deshacer el casco EV devuelve titanio (no es una fuente: el casco ya lleva titanio)
    gt('t:electro/recycle_ev_hull', 't:electrolyzer', { ins: [gi('t:ev_hull')], outs: [gi('t:ti_dust')] }),
  ];
  const titanio = { id: 'titanio', era: 'ev', label: 'titanio', items: ['t:*ti_*', 't:raw_ilmenite'] };
  if (o.onlyFrom) titanio.onlyFrom = ['luna'];
  const cfg = {
    tier: 'hv',
    eraOrder: ['steam', 'lv', 'mv', 'hv', 'ev', 'iv'],
    unconditionalTypes: ['minecraft:crafting_shaped'],
    world: [
      { id: 'tierra', mode: 'manual', bootstrap: true, items: ['t:ore', 't:bauxite'] },
      { id: 'menas-luna', mode: 'manual', bootstrap: true, needs: ['t:rocket'], origin: ['t:luna'], items: ['t:raw_ilmenite'] },
      { id: 'menas-end', mode: 'manual', bootstrap: true, needs: ['t:end_key'], origin: ['minecraft:the_end'], items: ['t:end_ore'] },
    ],
    machines: [
      { machine: 't:drill', types: ['t:drilling'] },
      { machine: 't:electrolyzer', types: ['t:electrolyzer'] },
    ],
    targets: [],
    autoTargets: [],
    eraResources: [
      { id: 'end', era: 'hv', label: 'el End', dimensions: ['minecraft:the_end'] },
      { id: 'luna', era: 'ev', label: 'la Luna', dimensions: ['t:luna'] },
      titanio,
      { id: 'tungsteno', era: 'iv', label: 'tungsteno', items: ['t:w_*'] },
    ],
    eraItems: [
      { id: 'mv-objetos', era: 'mv', items: ['t:mv_thing', 't:al_thing'] },
      { id: 'hv-patron', era: 'hv', items: ['t:hv_*'] },
      { id: 'hv-explicito', era: 'hv', items: ['t:hv_scanner', 't:hv_bit'] },
      { id: 'hv-perforadora', era: 'hv', inputsOf: ['t:drill/hv/*'] },
      { id: 'hv-opcional', era: 'hv', optional: true, items: ['t:aun_no_existe'] },
      { id: 'salida-hv', era: 'ev', items: ['t:ev_hull'] },
    ],
  };
  const dump = mkDump({ recipes, items: ['t:ore', 't:bauxite', 't:raw_ilmenite', 't:end_ore', 't:w_dust', 't:al_dust'] });
  return { dump, cfg };
}

const verdictsOf = (r) => Object.fromEntries(r.out.eras.groups.map((x) => [x.group.id, x.verdict]));

// ---------------------------------------------------------------- referencia y mutaciones

test('eras: el pack de referencia pasa; el opcional que aún no existe avisa sin tumbar el veredicto', () => {
  const { dump, cfg } = eraPack();
  const r = run(dump, cfg, { pass: 'eras' });
  assert.deepEqual(verdictsOf(r), {
    'mv-objetos': 'PASS', 'hv-patron': 'PASS', 'hv-explicito': 'PASS', 'hv-perforadora': 'PASS', 'hv-opcional': 'WARN', 'salida-hv': 'PASS',
  });
  assert.equal(r.out.verdict, 'PASS');
  assert.deepEqual(r.out.gate, []);
  assert.deepEqual(r.out.auto, []);
  assert.match(textOf(r, 'hv-opcional'), /t:aun_no_existe — no existe en el registro \(aún no ha llegado\)/);
  assert.match(r.text, /PASO 3 · ERAS/);
  assert.match(r.text, /VEREDICTO: PASS {2}\(eras 5\/6 \(\+1 avisos\)\)/);
});

test('eras (mutación): un objeto HV que pide titanio da FAIL con la cadena más corta hasta el recurso de EV', () => {
  const { dump, cfg } = eraPack({ scannerTi: true });
  const r = run(dump, cfg, { pass: 'eras' });
  assert.equal(verdictsOf(r)['hv-explicito'], 'FAIL');
  assert.equal(r.out.verdict, 'FAIL');
  const g = groupOf(r, 'hv-explicito');
  assert.deepEqual(g.violations, [{ item: 't:hv_scanner', resources: [{ id: 'titanio', era: 'ev', label: 'titanio' }] }]);
  const text = textOf(r, 'hv-explicito');
  assert.match(text, /1 de 2 piden un recurso de una era posterior a hv/);
  assert.match(text, /✗ t:hv_scanner — pide titanio \(ev\)/);
  assert.match(text, /\[t:ti_plate\] t:ti_plate {2}✗ recurso de una era posterior: titanio \(ev\)/);
  // la cadena es la más corta: llega a la placa de titanio y no baja hasta la ilmenita ni la Luna
  assert.doesNotMatch(text, /raw_ilmenite|t:luna/);
  // el mismo objeto en el patrón también es violación (no es él mismo de titanio)
  assert.equal(verdictsOf(r)['hv-patron'], 'FAIL');
});

test('eras: en un patrón, lo que ya es de un recurso posterior (la herramienta HV de titanio) no cuenta; si se nombra, es violación', () => {
  const { dump, cfg } = eraPack();
  const r = run(dump, cfg, { pass: 'eras' });
  const g = groupOf(r, 'hv-patron');
  assert.deepEqual(g.later, ['t:hv_ti_tool']);
  assert.equal(g.verdict, 'PASS');
  assert.match(textOf(r, 'hv-patron'), /de un recurso posterior \(no cuentan como de esta era\): t:hv_ti_tool/);
  const named = run(dump, { ...cfg, eraItems: [{ id: 'hv-nombrado', era: 'hv', items: ['t:hv_ti_tool'] }] }, { pass: 'eras' });
  assert.equal(verdictsOf(named)['hv-nombrado'], 'FAIL');
  assert.match(textOf(named, 'hv-nombrado'), /t:hv_ti_tool {2}✗ recurso de una era posterior: titanio \(ev\)/);
});

test('eras: inputsOf toma cada entrada de las recetas (la broca de la perforadora HV) y señala la que pide titanio', () => {
  const { dump, cfg } = eraPack({ bitTi: true });
  const r = run(dump, cfg, { pass: 'eras' });
  const g = groupOf(r, 'hv-perforadora');
  assert.equal(g.verdict, 'FAIL');
  assert.deepEqual(g.violations.map((v) => v.item), ['t:ti_bit']);
  assert.equal(g.counts.ok, 1, 'la muestra (capital) es de la Tierra y pasa');
  assert.match(textOf(r, 'hv-perforadora'), /✗ t:ti_bit {2}\(entrada de 1 receta\(s\), p\. ej\. t:drill\/hv\/a\) — pide titanio \(ev\)/);
});

test('eras: una dimensión posterior quita sus fuentes del mundo; un objeto MV que pide la mena del End da FAIL y nombra la fuente', () => {
  const { dump, cfg } = eraPack({ mvEnd: true });
  const r = run(dump, cfg, { pass: 'eras' });
  assert.equal(verdictsOf(r)['mv-objetos'], 'FAIL');
  const text = textOf(r, 'mv-objetos');
  assert.match(text, /t:mv_thing — pide el End \(hv\)/);
  assert.match(text, /t:end_ore {2}✗ solo sale de minecraft:the_end \(fuente «menas-end»\): recurso de una era posterior, el End \(hv\)/);
  // para los objetos HV el End no es posterior: el mismo objeto en un grupo HV pasa
  const hv = run(dump, { ...cfg, eraItems: [{ id: 'hv-con-end', era: 'hv', items: ['t:mv_thing'] }] }, { pass: 'eras' });
  assert.equal(verdictsOf(hv)['hv-con-end'], 'PASS');
});

test('eras: un subproducto de era posterior se quita de la receta, pero la receta sigue dando lo demás', () => {
  const { dump, cfg } = eraPack({ leak: true });
  const r = run(dump, cfg, { pass: 'eras' });
  // la electrólisis de la bauxita da titanio de regalo: el aluminio sigue valiendo para el MV
  assert.equal(verdictsOf(r)['mv-objetos'], 'PASS');
  assert.equal(groupOf(r, 'mv-objetos').counts.ok, 2);
});

test('eras: la salida de una era es de la siguiente; el casco EV puede pedir titanio (EV) pero no tungsteno (IV)', () => {
  const ok = run(eraPack().dump, eraPack().cfg, { pass: 'eras' });
  assert.equal(verdictsOf(ok)['salida-hv'], 'PASS');
  const { dump, cfg } = eraPack({ hullW: true });
  const r = run(dump, { ...cfg, world: [...cfg.world, { id: 'tungsteno-de-prueba', mode: 'manual', items: ['t:w_dust'] }] }, { pass: 'eras' });
  assert.equal(verdictsOf(r)['salida-hv'], 'FAIL');
  assert.match(textOf(r, 'salida-hv'), /t:ev_hull — pide tungsteno \(iv\)/);
});

test('eras: un objeto explícito que no se fabrica ni con todo avisa (la regla no se puede comprobar) y dice qué recurso posterior pide', () => {
  const { dump, cfg } = eraPack({ hullW: true });
  const r = run(dump, cfg, { pass: 'eras' });
  // sin fuente de tungsteno el casco EV no se fabrica en este tier: aviso, no violación
  assert.equal(verdictsOf(r)['salida-hv'], 'WARN');
  assert.match(textOf(r, 'salida-hv'), /t:ev_hull — no se fabrica en este tier ni con todos los recursos \(la regla no se puede comprobar\); además pide tungsteno \(iv\)/);
  assert.equal(r.out.verdict, 'PASS');
});

// ---------------------------------------------------------------- exclusividad: "el titanio solo sale de la Luna"

test('eras (onlyFrom): sin fugas, ninguna clave del titanio sale sin la Luna; con la bauxita que da titanio, FUGA con su fuente (el reciclaje no cuenta)', () => {
  const clean = run(eraPack({ onlyFrom: true }).dump, eraPack({ onlyFrom: true }).cfg, { pass: 'eras' });
  const ex = clean.out.eras.exclusive;
  assert.equal(ex.length, 1);
  assert.equal(ex[0].verdict, 'PASS', 'deshacer el casco EV da titanio, pero el casco ya pide titanio de la Luna');
  assert.match(ex[0].lines[0], /ninguno de sus \d+ objetos y fluidos sale sin la Luna/);
  const { dump, cfg } = eraPack({ onlyFrom: true, leak: true });
  const r = run(dump, cfg, { pass: 'eras' });
  const leak = r.out.eras.exclusive[0];
  assert.equal(leak.verdict, 'FAIL');
  assert.equal(r.out.verdict, 'FAIL');
  const text = leak.lines.join('\n');
  assert.match(text, /FUGA: \d+ de sus \d+ objetos y fluidos salen sin la Luna\. Entran por 1 fuente\(s\) en 1 clave\(s\) \(y 1 receta\(s\) que reciclan lo que ya lo lleva, que no cuentan\)/);
  assert.match(text, /· t:ti_dust {2}← t:electrolyzer · t:electro\/bauxite/);
  assert.doesNotMatch(text, /← .*recycle_ev_hull/);
  assert.equal(leak.recycled, 1);
  assert.ok(leak.leaked.includes('t:ti_plate'));
  assert.ok(!leak.leaked.includes('t:raw_ilmenite'), 'la ilmenita solo sale de la Luna');
  assert.match(r.text, /FAIL {2}ev: titanio solo sale de luna/);
});

// ---------------------------------------------------------------- motor: claves quitadas de toda fuente

test('lfp con `blocked`: la regla sigue dando sus otras salidas y los hechos quitados no cuentan', () => {
  const g = new Graph();
  const a = g.key('a');
  const b = g.key('b');
  const c = g.key('c');
  const d = g.key('d');
  g.addRule({ name: 'r1', kind: 'recipe', slots: [{ alts: [a] }], outs: [b, c], meta: {} });
  g.addRule({ name: 'r2', kind: 'recipe', slots: [{ alts: [c] }], outs: [d], meta: {} });
  g.finalize();
  const blocked = new Uint8Array(g.nKeys);
  blocked[c] = 1;
  const lf = lfp(g, { facts: [a], blocked });
  assert.deepEqual([lf.reached[a], lf.reached[b], lf.reached[c], lf.reached[d]], [1, 1, 0, 0]);
  const lf2 = lfp(g, { facts: [a, c], blocked });
  assert.equal(lf2.reached[c], 0);
});

// ---------------------------------------------------------------- configuración: herencia y capa de la versión siguiente

function memoryTiers(files) {
  const root = path.resolve('/memoria/tiers');
  const map = new Map(Object.entries(files).map(([name, doc]) => [path.join(root, name), doc]));
  return {
    root,
    io: { exists: (f) => map.has(path.resolve(f)), read: (f) => structuredClone(map.get(path.resolve(f))) },
  };
}

test('config de eras: se heredan; un elemento nuevo es de la era de su archivo y uno con el mismo id se combina campo a campo', () => {
  const { root, io } = memoryTiers({
    'steam.json': { tier: 'steam', eraOrder: ['steam', 'lv', 'mv'], eraItems: [{ id: 'a', items: ['x:a'] }, { id: 'b', era: 'lv', items: ['x:b'] }] },
    'lv.json': {
      tier: 'lv', extends: 'steam', inheritTargets: true, dropTargets: ['b'],
      eraResources: [{ id: 'nether', label: 'el Nether', dimensions: ['minecraft:the_nether'] }],
      eraItems: [{ id: 'c', items: ['x:c'] }],
    },
    'mv.json': { tier: 'mv', extends: 'lv', eraResources: [{ id: 'nether', era: 'mv' }], eraItems: [{ id: 'a', optional: true }] },
  });
  const lv = loadTierConfig({ tier: 'lv' }, root, io).raw;
  assert.deepEqual(lv.eraOrder, ['steam', 'lv', 'mv']);
  assert.deepEqual(lv.eraItems.map((e) => [e.id, e.era]), [['a', 'steam'], ['c', 'lv']]);
  assert.deepEqual(lv.eraResources.map((e) => [e.id, e.era]), [['nether', 'lv']]);
  const mv = loadTierConfig({ tier: 'mv' }, root, io).raw;
  // el parche solo cambia lo que dice: el Nether conserva su nombre y sus dimensiones; el grupo a, su era y sus objetos
  assert.deepEqual(mv.eraResources, [{ id: 'nether', era: 'mv', label: 'el Nether', dimensions: ['minecraft:the_nether'] }]);
  assert.deepEqual(mv.eraItems.find((e) => e.id === 'a'), { id: 'a', era: 'steam', items: ['x:a'], optional: true });
});

test('config: la capa tiers/next/ hace que toda la cadena herede de sus archivos (next/hv -> hv -> next/mv -> mv)', () => {
  const { root, io } = memoryTiers({
    'mv.json': { tier: 'mv', targets: [{ id: 'mv-actual' }], world: [{ id: 'w-mv' }] },
    'hv.json': { tier: 'hv', extends: 'mv', inheritTargets: true, targets: [{ id: 'hv-actual' }], eraResources: [{ id: 'end', label: 'el End' }] },
    'next/mv.json': {
      tier: 'mv', extends: '../mv', inheritTargets: true, targets: [{ id: 'mv-siguiente' }], world: [{ id: 'menas-end' }],
      eraResources: [{ id: 'end', label: 'el End' }],
    },
    'next/hv.json': { tier: 'hv', extends: '../hv', inheritTargets: true, eraResources: [{ id: 'end', era: 'mv' }] },
  });
  const now = loadTierConfig({ tier: 'hv' }, root, io).raw;
  assert.deepEqual(now.targets.map((t) => t.id), ['mv-actual', 'hv-actual']);
  assert.deepEqual(now.eraResources.map((r) => [r.id, r.era]), [['end', 'hv']]);
  const next = loadTierConfig({ tier: 'next/hv' }, root, io).raw;
  assert.equal(next.tier, 'hv');
  assert.deepEqual(next.targets.map((t) => t.id), ['mv-actual', 'mv-siguiente', 'hv-actual']);
  assert.deepEqual(next.world.map((w) => w.id), ['w-mv', 'menas-end']);
  assert.deepEqual(next.eraResources.map((r) => [r.id, r.era]), [['end', 'mv']]);
  // fuera de la capa nada cambia: el mv de siempre sigue sin el End
  assert.deepEqual(loadTierConfig({ tier: 'mv' }, root, io).raw.world.map((w) => w.id), ['w-mv']);
  // un archivo de la capa que se nombra a sí mismo por nombre daría un ciclo: se detecta
  const loop = memoryTiers({ 'mv.json': { tier: 'mv' }, 'next/mv.json': { tier: 'mv', extends: 'mv' } });
  assert.throws(() => loadTierConfig({ tier: 'next/mv' }, loop.root, loop.io), /herencia circular/);
});

// ---------------------------------------------------------------- configuraciones reales

test('tiers reales: el orden de eras se hereda y cada recurso y grupo tiene una era del orden', () => {
  for (const tier of ['steam', 'lv', 'mv', 'hv', 'next/mv', 'next/hv']) {
    const { raw } = loadTierConfig({ tier }, TIERS);
    assert.ok(raw.eraOrder && raw.eraOrder.length >= 6, `${tier}: eraOrder`);
    for (const e of [...raw.eraResources, ...raw.eraItems]) assert.ok(raw.eraOrder.includes(e.era), `${tier}: ${e.id} tiene la era ${e.era}`);
    const ids = raw.eraItems.map((e) => e.id);
    assert.equal(new Set(ids).size, ids.length, `${tier}: ids de eraItems repetidos`);
  }
});

test('tiers reales (hv): el titanio y la Luna son de EV, el End de HV; la broca de inox, el cohete y el traje de GCYR son de HV (v0.4.1)', () => {
  const { raw } = loadTierConfig({ tier: 'hv' }, TIERS);
  const res = Object.fromEntries(raw.eraResources.map((r) => [r.id, r]));
  assert.equal(res.titanio.era, 'ev');
  assert.equal(res.luna.era, 'ev');
  assert.deepEqual(res.luna.dimensions, ['gcyr:luna']);
  assert.equal(res.end.era, 'hv');
  assert.equal(res.nether.era, 'lv');
  for (const id of ['tungsteno', 'naquadah', 'iridio-osmio', 'marte', 'venus', 'mercurio']) assert.equal(res[id].era, 'iv', id);
  assert.equal(res.titanio.onlyFrom, undefined, 'la exclusividad del titanio solo se activa en la versión siguiente');
  const items = Object.fromEntries(raw.eraItems.map((g) => [g.id, g]));
  for (const id of ['hv-cohete', 'hv-traje', 'hv-broca-inox']) assert.ok(!items[id].optional, `${id} ya llegó: no es opcional`);
  for (const it of ['gcyr:rocket_scanner', 'gcyr:launch_pad', 'gcyr:basic_fuel_tank', 'gcyr:basic_rocket_motor', 'gcyr:seat']) assert.ok(items['hv-cohete'].items.includes(it), it);
  assert.equal(items['salida-hv'].era, 'ev');
  assert.deepEqual(items['salida-hv'].items.slice(0, 3), ['gtceu:ev_machine_hull', 'gtceu:ev_electric_motor', 'gtceu:ev_electric_pump']);
  assert.equal(items['hv-gtm'].era, 'hv');
  assert.equal(items['vapor-maquinas'].era, 'steam');
  assert.equal(items['salida-vapor'].era, 'lv');
  // ningún objetivo nombra ya la broca de titanio salvo la comprobación de que no se fabrica
  const named = [...raw.targets, ...raw.autoTargets, ...raw.autoTargetsFromVeins.map((s) => s.target || {})]
    .filter((t) => JSON.stringify([t.item, t.input]).includes('grindless:titanium_drill_bit'));
  assert.deepEqual(named.map((t) => [t.id, t.expect]), [['broca-titanio-no-se-fabrica', 'unreachable']]);
  // las vetas se cuentan por las recetas de la perforadora, no por que exista su muestra
  const veinSpecs = [raw.world.find((w) => w.id === 'menas-end').fromVeins, ...raw.targetsFromVeins, ...raw.autoTargetsFromVeins];
  for (const s of veinSpecs.filter((x) => x.requireItem || x.requireRecipe)) {
    assert.equal(s.requireItem, undefined);
    assert.deepEqual(s.requireRecipe, { type: 'gtceu:vein_drilling', input: 'grindless:vein_sample_{id}' });
  }
});

test('tiers reales (next): el End pasa a MV, el titanio solo sale de la Luna y el cohete, el traje y la broca de inox siguen siendo de HV', () => {
  const { raw: mv } = loadTierConfig({ tier: 'next/mv' }, TIERS);
  const { raw: hv } = loadTierConfig({ tier: 'next/hv' }, TIERS);
  assert.equal(mv.tier, 'mv');
  assert.equal(hv.tier, 'hv');
  for (const cfg of [mv, hv]) {
    const end = cfg.eraResources.find((r) => r.id === 'end');
    assert.equal(end.era, 'mv');
    assert.ok(cfg.world.some((w) => w.id === 'menas-end'));
  }
  const ti = hv.eraResources.find((r) => r.id === 'titanio');
  assert.equal(ti.era, 'ev');
  assert.deepEqual(ti.onlyFrom, ['luna']);
  assert.ok(hv.world.some((w) => w.id === 'menas-luna' && w.fromVeins.dimensions.includes('gcyr:luna')));
  const items = Object.fromEntries(hv.eraItems.map((g) => [g.id, g]));
  for (const id of ['hv-cohete', 'hv-traje', 'hv-broca-inox']) assert.ok(!items[id].optional, id);
  // la versión actual no cambia
  const { raw: now } = loadTierConfig({ tier: 'mv' }, TIERS);
  assert.ok(!now.world.some((w) => w.id === 'menas-end'));
});
