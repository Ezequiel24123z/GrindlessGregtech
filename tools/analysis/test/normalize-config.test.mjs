// Pruebas de normalización de recetas y de la carga de configuración con herencia.
import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadTierConfig } from '../lib/config.mjs';
import { TagIndex } from '../lib/dump.mjs';
import { prepareConfig } from '../lib/model.mjs';
import { normalizeRecipe } from '../lib/normalize.mjs';
import { gf, gi, gt, gtag } from './helpers.mjs';

const tiersDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'tiers');

function norm(rec, { tags = {}, fluidTags = {}, cfg = {}, gtTypes = ['gtceu:macerator'] } = {}) {
  const ctx = {
    tags: new TagIndex({ item: tags, fluid: fluidTags }),
    st: { unresolved: new Set() },
    cfg: prepareConfig({ typeAliases: { 'gtceu:shaped': 'minecraft:crafting_shaped' }, toolTags: ['gtceu:tools/crafting_hammers'], ...cfg }),
    gtTypes: new Set(gtTypes),
  };
  return { n: normalizeRecipe({ id: rec.id, type: rec.type, added: false, json: rec.json }, ctx), ctx };
}

test('receta GT: capital (chance 0), catalizador (chance parcial), consumibles, salidas y EU/t', () => {
  const { n } = norm(gt('x', 'gtceu:macerator', {
    ins: [gi('a', 2), gi('molde', 1, 0), gi('broca', 1, 1000), gtag('forge:dusts/x')],
    outs: [gi('b', 1, 5000)],
    fins: [gf('minecraft:water', 500)],
    eut: 30,
  }), { tags: { 'forge:dusts/x': ['d1', 'd2'] } });
  assert.equal(n.eut, 30);
  const byLabel = Object.fromEntries(n.inputs.map((i) => [i.label, i]));
  assert.equal(byLabel.a.cap, false);
  assert.equal(byLabel.a.count, 2);
  assert.equal(byLabel.molde.cap, true);
  assert.equal(byLabel.broca.cap, false);
  assert.equal(byLabel.broca.cat, true);
  assert.deepEqual(byLabel['#forge:dusts/x'].alts, ['d1', 'd2']);
  assert.deepEqual(n.outputs.map((o) => [o.key, o.chance]), [['b', 0.5]]);
  assert.ok(n.inputs.some((i) => i.kind === 'fluid' && i.alts[0] === 'fluid:minecraft:water'));
});

test('receta GT: el EU/t sale de tickInputs y admite {voltage, amperage}', () => {
  const rec = gt('x', 'gtceu:macerator', { ins: [gi('a')], outs: [gi('b')] });
  rec.json.tickInputs = { eu: [{ content: { voltage: 120, amperage: 2 }, chance: 10000, maxChance: 10000 }] };
  assert.equal(norm(rec).n.eut, 120);
});

test('crafteo: las herramientas son capital y el tipo gtceu:shaped se normaliza al de vanilla', () => {
  const rec = {
    id: 'gtceu:shaped/x', type: 'gtceu:shaped',
    json: { type: 'unknown', pattern: ['HI'], key: { H: { tag: 'gtceu:tools/crafting_hammers' }, I: { item: 'ingot' } }, result: { item: 'plate' } },
  };
  const { n } = norm(rec, { tags: { 'gtceu:tools/crafting_hammers': ['hammer'] } });
  assert.equal(n.type, 'minecraft:crafting_shaped');
  assert.equal(n.inputs.find((i) => i.kind === 'tool').cap, true);
  assert.equal(n.inputs.find((i) => i.kind === 'item').cap, false);
  assert.deepEqual(n.outputs.map((o) => o.key), ['plate']);
});

test('circuito programado y entradas compuestas de Forge se resuelven', () => {
  const rec = gt('x', 'gtceu:macerator', { ins: [] });
  rec.json.inputs.item = [
    { content: { type: 'gtceu:circuit', configuration: 3 }, chance: 0, maxChance: 10000 },
    { content: { type: 'forge:compound', children: [{ item: 'p' }, { tag: 'forge:q' }] }, chance: 10000, maxChance: 10000 },
  ];
  const { n } = norm(rec, { tags: { 'forge:q': ['q1'] } });
  assert.deepEqual(n.inputs[0].alts, ['gtceu:programmed_circuit']);
  assert.deepEqual(n.inputs[1].alts, ['p', 'q1']);
});

test('una etiqueta vacía de vanilla (solo la barrera) o ausente deja la ranura sin miembros y con nombre', () => {
  const rec = {
    id: 'x', type: 'minecraft:crafting_shaped',
    json: { pattern: ['AB'], key: { A: { tag: 'a:vacia' }, B: { tag: 'a:no_esta' } }, result: { item: 'r' } },
  };
  const { n, ctx } = norm(rec, { tags: { 'a:vacia': ['minecraft:barrier'] } });
  assert.deepEqual(n.inputs.map((i) => i.alts.length), [0, 0]);
  assert.match(n.inputs[0].label, /#a:vacia/);
  assert.ok(ctx.tags.empty.has('a:vacia'));
  assert.ok(ctx.tags.missing.has('a:no_esta'));
});

test('la configuración hija hereda del padre: listas sumadas, objetivos solo con inheritTargets', () => {
  const steam = loadTierConfig({ tier: 'steam' }, tiersDir).raw;
  const lv = loadTierConfig({ tier: 'lv' }, tiersDir).raw;
  assert.ok(steam.targets.length > 10);
  assert.ok(lv.machines.length > steam.machines.length);
  assert.ok(lv.world.length > steam.world.length);
  assert.ok(lv.synthetic.length > steam.synthetic.length);
  assert.ok(lv.machinesFromRegistry.length >= 1);
  assert.ok(lv.targets.length > steam.targets.length, 'inheritTargets añade los del vapor');
  assert.ok(lv.autoTargets.length > steam.autoTargets.length);
  assert.ok(lv.targets.some((t) => t.id === 'turbina-lv'));
  assert.ok(lv.targets.some((t) => t.id === 'horno-arco'));
  assert.equal(lv.tier, 'lv');
  assert.equal(lv.typeAliases['gtceu:shaped'], 'minecraft:crafting_shaped');
  // los mapas se combinan clave a clave
  assert.deepEqual(lv.partAbilities.steam, steam.partAbilities.steam);
  assert.ok(lv.partAbilities.energy_input);
  assert.ok(lv.conditions.cleanroom && lv.conditions.ae2_circumstance_explosion);
  assert.ok(lv.autoTargetsFromVeins.length >= 1);
});

test('los ids de los objetivos de cada tier son únicos', () => {
  for (const tier of ['steam', 'lv']) {
    const raw = loadTierConfig({ tier }, tiersDir).raw;
    for (const list of [raw.targets, raw.autoTargets]) {
      const ids = list.map((t) => t.id);
      assert.equal(new Set(ids).size, ids.length, `${tier}: ids repetidos ${ids.filter((x, i) => ids.indexOf(x) !== i)}`);
    }
  }
});

test('los objetivos del LV nombran objetos o claves con el formato esperado', () => {
  const lv = loadTierConfig({ tier: 'lv' }, tiersDir).raw;
  const check = (list, expectValue) => {
    for (const t of list) {
      const keys = [t.item, t.fluid, t.output, t.input].flat().filter(Boolean);
      for (const k of keys) assert.match(String(k), /^(fluid:)?[a-z0-9_.-]+:[a-z0-9_./-]+$/, `${t.id}: ${k}`);
      if (t.expect !== undefined) assert.equal(t.expect, expectValue, `${t.id}: expect solo admite "${expectValue}" en esta lista`);
    }
  };
  check(lv.targets, 'unreachable');
  check(lv.autoTargets, 'not-automatic');
});
