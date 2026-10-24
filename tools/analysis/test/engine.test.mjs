// Pruebas del motor: alcance mínimo, sostenibilidad con suelo y costes de bloqueo.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { blockCosts, Graph, groundedSustain, lfp } from '../lib/engine.mjs';

/** rules: [{name, slots:[{alts:[claves], cap?, tol?}], outs:[claves]}] */
function build(rules) {
  const g = new Graph();
  for (const r of rules) {
    g.addRule({
      name: r.name,
      kind: 'recipe',
      type: 't',
      slots: r.slots.map((s) => ({ alts: s.alts.map((a) => g.key(a)), cap: !!s.cap, tol: !!s.tol, label: s.alts.join('|'), role: 'input' })),
      outs: r.outs.map((o) => g.key(o)),
      meta: {},
    });
  }
  g.finalize();
  return g;
}
const set = (g, names) => {
  const a = new Uint8Array(g.nKeys);
  for (const n of names) a[g.key(n)] = 1;
  return a;
};
const ids = (g, names) => names.map((n) => g.key(n));
const has = (g, arr, n) => arr[g.key(n)] === 1;

test('lfp: una regla se dispara cuando todas sus ranuras tienen alguna alternativa alcanzada', () => {
  const g = build([
    { name: 'r1', slots: [{ alts: ['a'] }], outs: ['b'] },
    { name: 'r2', slots: [{ alts: ['b'] }, { alts: ['c', 'a'] }], outs: ['d'] },
    { name: 'r3', slots: [{ alts: ['b'] }, { alts: ['c'] }], outs: ['e'] },
  ]);
  const r = lfp(g, { facts: ids(g, ['a']) });
  assert.ok(has(g, r.reached, 'b'));
  assert.ok(has(g, r.reached, 'd'));
  assert.ok(!has(g, r.reached, 'e'));
  assert.equal(r.level[g.key('d')], 2);
});

test('lfp: las ranuras de capital solo se cumplen con capOk y las tolerantes con tolOk', () => {
  const g = build([
    { name: 'r', slots: [{ alts: ['a'] }, { alts: ['martillo'], cap: true }, { alts: ['combustible'], tol: true }], outs: ['x'] },
  ]);
  const base = { facts: ids(g, ['a']) };
  assert.ok(!has(g, lfp(g, base).reached, 'x'));
  assert.ok(!has(g, lfp(g, { ...base, capOk: set(g, ['martillo']) }).reached, 'x'));
  assert.ok(has(g, lfp(g, { ...base, capOk: set(g, ['martillo']), tolOk: set(g, ['combustible']) }).reached, 'x'));
});

test('lfp: un ciclo sin entrada no se alcanza', () => {
  const g = build([
    { name: 'a->b', slots: [{ alts: ['a'] }], outs: ['b'] },
    { name: 'b->a', slots: [{ alts: ['b'] }], outs: ['a'] },
  ]);
  const r = lfp(g, { facts: [] });
  assert.ok(!has(g, r.reached, 'a'));
});

test('groundedSustain: el ciclo comprimir/descomprimir entra en el gfp pero no en la sostenibilidad con suelo', () => {
  const g = build([
    { name: 'comprimir', slots: [{ alts: ['polvo'] }], outs: ['bloque'] },
    { name: 'descomprimir', slots: [{ alts: ['bloque'] }], outs: ['polvo'] },
  ]);
  const universe = set(g, ['polvo', 'bloque']);
  const permanent = new Uint8Array(g.nKeys);
  const r = groundedSustain(g, { universe, capOk: new Uint8Array(g.nKeys), permanent });
  assert.ok(has(g, r.S.inS, 'polvo'), 'el gfp acepta el ciclo');
  assert.ok(!has(g, r.G.reached, 'polvo'), 'pero no tiene suelo');
  assert.ok(!has(g, r.G.reached, 'bloque'));
});

test('groundedSustain: un bucle de arranque (vapor -> perforadora -> carbón -> caldera -> vapor) se sostiene con una fuente', () => {
  const g = build([
    { name: 'perforar', slots: [{ alts: ['vapor'], tol: true }, { alts: ['broca'], tol: true }, { alts: ['muestra'], cap: true }], outs: ['mena', 'carbon'] },
    { name: 'caldera', slots: [{ alts: ['carbon'] }, { alts: ['agua'] }], outs: ['vapor'] },
    { name: 'forjar-broca', slots: [{ alts: ['mena'] }], outs: ['broca'] },
    { name: 'bomba', slots: [], outs: ['agua'] },
  ]);
  const everything = set(g, ['vapor', 'broca', 'muestra', 'mena', 'carbon', 'agua']);
  const r = groundedSustain(g, { universe: everything, capOk: set(g, ['muestra']), permanent: new Uint8Array(g.nKeys) });
  for (const n of ['agua', 'carbon', 'vapor', 'mena', 'broca']) assert.ok(has(g, r.G.reached, n), n);
});

test('groundedSustain: si falta la fuente de combustible el bucle de arranque no se sostiene', () => {
  const g = build([
    { name: 'perforar', slots: [{ alts: ['vapor'], tol: true }, { alts: ['muestra'], cap: true }], outs: ['mena'] },
    { name: 'caldera', slots: [{ alts: ['carbon'] }, { alts: ['agua'] }], outs: ['vapor'] },
    { name: 'bomba', slots: [], outs: ['agua'] },
  ]);
  // el carbón solo existe como reserva de arranque: está en el universo, pero nada lo repone
  const universe = set(g, ['vapor', 'muestra', 'mena', 'carbon', 'agua']);
  const r = groundedSustain(g, { universe, capOk: set(g, ['muestra']), permanent: new Uint8Array(g.nKeys) });
  assert.ok(!has(g, r.G.reached, 'carbon'));
  assert.ok(!has(g, r.G.reached, 'vapor'));
  assert.ok(!has(g, r.G.reached, 'mena'));
  assert.ok(has(g, r.G.reached, 'agua'));
});

test('blockCosts: elige la cadena de bloqueo más barata y distingue raíces', () => {
  const g = build([
    { name: 'caro', slots: [{ alts: ['a'] }, { alts: ['b'] }, { alts: ['c'] }], outs: ['x'] },
    { name: 'barato', slots: [{ alts: ['d'] }], outs: ['x'] },
  ]);
  const mask = new Uint8Array(g.nKeys);
  const { cost, best } = blockCosts(g, { mask });
  assert.equal(cost[g.key('x')], 2);
  assert.equal(g.rules[best[g.key('x')]].name, 'barato');
  const rootCost = (k) => (g.producers(k).length > 0 ? Infinity : g.keyNames[k] === 'd' ? 10 : 1);
  const withRootCost = blockCosts(g, { mask, rootCost });
  assert.equal(g.rules[withRootCost.best[g.key('x')]].name, 'caro');
});

test('blockCosts: lo que ya se tiene cuesta 0 y las ranuras de capital cumplidas no cuentan', () => {
  const g = build([{ name: 'r', slots: [{ alts: ['a'] }, { alts: ['h'], cap: true }], outs: ['x'] }]);
  const mask = set(g, ['a']);
  const sin = blockCosts(g, { mask });
  const con = blockCosts(g, { mask, capMask: set(g, ['h']) });
  assert.equal(sin.cost[g.key('x')], 2);
  assert.equal(con.cost[g.key('x')], 1);
});
