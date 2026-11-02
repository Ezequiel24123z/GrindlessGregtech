// AF-K2 (audit #198 M9-26): Carry On must never pick up a GregTech machine, one of our multiblock controllers, a pipe or a cable.
// server_scripts/grindless/integration/carryon.js fills the data tag #carryon:block_blacklist with the selector /^gtceu:/. This reads what the
// script really adds and tests the membership of real ids, so a narrowed selector, a renamed tag or a controller registered outside gtceu: fails.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const pack = path.join(root, 'pack');
const source = fs.readFileSync(path.join(pack, 'kubejs', 'server_scripts', 'grindless', 'integration', 'carryon.js'), 'utf8');

const adds = [];
const sandbox = {
  ServerEvents: { tags: (kind, cb) => cb({ add: (tag, ...ids) => adds.push({ kind, tag, ids }) }) },
};
vm.runInNewContext(source, sandbox, { filename: 'carryon.js' });

const BLACKLIST = 'carryon:block_blacklist';
const members = adds.filter((a) => a.kind === 'block' && a.tag === BLACKLIST).flatMap((a) => a.ids);
const isRegExp = (m) => Object.prototype.toString.call(m) === '[object RegExp]';
const covers = (id) => members.some((m) => (isRegExp(m) ? m.test(id) : String(m) === id));

test('the script adds one entry to the block tag #carryon:block_blacklist', () => {
  assert.equal(adds.length, 1, 'one tags event call');
  assert.equal(adds[0].kind, 'block');
  assert.equal(adds[0].tag, BLACKLIST);
  assert.equal(members.length, 1);
  assert.ok(isRegExp(members[0]), 'a selector, not a list that goes stale');
});

test('a GregTech machine, a pipe and a cable are covered', () => {
  for (const id of ['gtceu:lv_electric_furnace', 'gtceu:hv_chemical_reactor', 'gtceu:steel_normal_fluid_pipe', 'gtceu:copper_single_cable',
    'gtceu:tungsten_steel_huge_item_pipe', 'gtceu:lv_energy_input_hatch']) assert.ok(covers(id), id + ' must not be pick-up-able');
});

test('every multiblock controller and machine the pack registers is covered', () => {
  const run = runPackScripts(pack);
  const machines = [...run.registry.machines.keys()];
  assert.ok(machines.length > 50, 'the pack registers machines (' + machines.length + ')');
  const loose = machines.filter((id) => !covers(id));
  assert.deepEqual(loose, [], 'machines outside the selector: Carry On could move them');
  const custom = machines.filter((id) => run.registry.machines.get(id).kind === 'multiblock');
  assert.ok(custom.length > 0, 'at least one custom multiblock controller to check');
  for (const id of custom) assert.ok(covers(id), id);
});

test('the selector does not swallow what is not GregTech', () => {
  for (const id of ['minecraft:chest', 'minecraft:furnace', 'grindless:void_key', 'ae2:controller', 'carryon:tile_item']) {
    assert.ok(!covers(id), id + ' is not ours to block');
  }
});
