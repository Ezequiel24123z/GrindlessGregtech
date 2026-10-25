// The recipes GTM's recipe lookup never finds (lookup_unreachable.json, written next to the gg_dump files by the bench guard
// gg_test_recipe_lookup) leave the model: lib/dump.mjs drops them and prints one line about it; with no file it prints a note and
// the dump is as before.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { LOOKUP_FILE, loadDump, lookupLine, makeDump } from '../lib/dump.mjs';
import { gi, gt, miniPack, run } from './helpers.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

// the documents of a dump (what gg_dump writes), plus lookup_unreachable.json when `lookup` is given
function docsOf(pack, lookup) {
  const { recipes, dump } = pack;
  return {
    recipes: { recipes: recipes.map((r) => JSON.stringify({ i: r.id, t: r.type, j: r.json })) },
    items: { items: [...dump.items], fluids: [...dump.fluids] },
    tags: { item: {}, fluid: {} },
    machines: { machines: [], recipeTypes: [] },
    ...(lookup ? { lookup } : {}),
  };
}

const unreachable = (...rows) => ({ format: 'gg-lookup-unreachable-1', unreachable: rows, emptyPath: [] });
const statusOf = (list, id) => list.find((r) => r.target.id === id).status;

test('a recipe GTM\'s lookup never finds is dropped and stops being a route (the drill loses its only drilling recipe)', () => {
  const pack = miniPack();
  const before = run(makeDump('(memory)', docsOf(pack)), pack.cfg).out;
  assert.equal(before.verdict, 'PASS');
  assert.equal(statusOf(before.auto, 'auto-ore'), 'sustained');

  const dump = makeDump('(memory)', docsOf(pack, unreachable({ id: 't:drilling', type: 't:drilling', reaches: [], shadowedBy: ['t:other'] })));
  assert.equal(dump.recipes.has('t:drilling'), false);
  assert.deepEqual(dump.lookup.dropped, ['t:drilling']);
  const { out } = run(dump, pack.cfg);
  assert.equal(out.gate.find((r) => r.target.id === 'recipe-drilling').verdict, 'FAIL');
  assert.equal(statusOf(out.auto, 'auto-ore'), 'bootstrap');
});

test('only a recipe of the same type is dropped: a proxy keeps its own type, an id the dump lacks is only counted', () => {
  const pack = miniPack({ extraRecipes: [gt('t:twin', 't:greenhouse', { ins: [gi('t:sapling', 1, 0)], outs: [gi('t:log')], eut: 4 })] });
  const dump = makeDump('(memory)', docsOf(pack, unreachable(
    { id: 't:twin', type: 't:greenhouse' },
    { id: 't:ingot_from_raw', type: 'gtceu:electric_furnace', proxy: true },
    { id: 't:gone', type: 't:greenhouse' },
  )));
  assert.deepEqual(dump.lookup, { file: true, listed: 3, dropped: ['t:twin'], notInDump: ['t:gone'], otherType: ['t:ingot_from_raw'] });
  assert.equal(dump.recipes.has('t:twin'), false);
  assert.equal(dump.recipes.has('t:ingot_from_raw'), true);
  assert.equal(dump.recipes.has('t:greenhouse_logs'), true);
  assert.equal(lookupLine(dump), `Lookup  : dropped 1 recipe GTM's recipe lookup never finds (${LOOKUP_FILE}: 3 listed; 1 not in recipes.json; ` +
    '1 kept as recipes of their own type (proxies))');
});

test('with no lookup_unreachable.json nothing is dropped and the line says so', () => {
  const pack = miniPack();
  const dump = makeDump('(memory)', docsOf(pack));
  assert.equal(dump.recipes.size, pack.recipes.length);
  assert.deepEqual(dump.lookup, { file: false, listed: 0, dropped: [], notInDump: [], otherType: [] });
  assert.match(lookupLine(dump), /^Lookup {2}: no lookup_unreachable\.json in the dump/);
  // an empty file is still a file: GTM's lookup was checked and found nothing to drop
  assert.match(lookupLine(makeDump('(memory)', docsOf(pack, unreachable()))), /^Lookup {2}: dropped 0 recipes .*: 0 listed\)$/);
});

test('loadDump reads the file next to recipes.json, and the CLI prints the line even with --quiet', () => {
  const work = path.join(here, '..', '.work', 'test-lookup-unreachable');
  fs.rmSync(work, { recursive: true, force: true });
  const dir = path.join(work, 'dump');
  fs.mkdirSync(dir, { recursive: true });
  try {
    const pack = miniPack();
    const docs = docsOf(pack);
    for (const [name, doc] of [['recipes.json', docs.recipes], ['items.json', docs.items], ['tags.json', docs.tags], ['machines.json', docs.machines]]) {
      fs.writeFileSync(path.join(dir, name), JSON.stringify(doc), 'utf8');
    }
    const lines = [];
    let dump = loadDump(dir, { log: (l) => lines.push(l) });
    assert.equal(dump.recipes.has('t:drilling'), true);
    assert.equal(lines.length, 1);
    assert.match(lines[0], /no lookup_unreachable\.json/);

    fs.writeFileSync(path.join(dir, LOOKUP_FILE), JSON.stringify(unreachable({ id: 't:drilling', type: 't:drilling' })), 'utf8');
    dump = loadDump(dir, { log: (l) => lines.push(l) });
    assert.equal(dump.recipes.has('t:drilling'), false);
    assert.match(lines[1], /^Lookup {2}: dropped 1 recipe GTM's recipe lookup never finds \(lookup_unreachable\.json: 1 listed\)$/);

    const cfgFile = path.join(work, 'mini.json');
    fs.writeFileSync(cfgFile, JSON.stringify(pack.cfg), 'utf8');
    const cli = path.join(here, '..', 'reachability.mjs');
    const r = spawnSync(process.execPath, [cli, '--config', cfgFile, '--dump', dir, '--quiet'], { encoding: 'utf8' });
    assert.match(r.stdout, /^Lookup {2}: dropped 1 recipe GTM's recipe lookup never finds/m, r.stderr);
    assert.match(r.stdout, /VERDICT: FAIL/);
    assert.equal(r.status, 1, r.stderr);
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
});
