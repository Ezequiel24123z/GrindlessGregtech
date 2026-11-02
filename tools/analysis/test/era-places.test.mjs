// M1-07: places are dated by when the player reaches them (lib/era.mjs PLACE_ERAS), the rest of a planet follows planets.json.
// Reads the pack's startup scripts and planets.json (read only); T0: local, deterministic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scanStartupEras, datePlaces, ERAS, eraIdx, PLANETS_FILE } from '../lib/era.mjs';
import fs from 'node:fs';

const era = (map, id) => ERAS[map.get(id)];

test('the six places are dated by planets.json and the reach table, not by the first script that names them', () => {
  const m = scanStartupEras();
  assert.equal(era(m, 'gcyr:luna'), 'hv');
  assert.equal(era(m, 'minecraft:the_end'), 'mv');
  assert.equal(era(m, 'minecraft:the_nether'), 'lv');
  assert.equal(era(m, 'gcyr:overworld_orbit'), 'luv');
  assert.equal(era(m, 'grindless:io_orbit'), 'luv');
  assert.equal(era(m, 'minecraft:overworld'), 'steam');
});

test('every dated place is a dimension of planets.json, and the other dimensions of a planet follow it', () => {
  const planets = JSON.parse(fs.readFileSync(PLANETS_FILE, 'utf8')).planets;
  const all = new Set(Object.values(planets).flatMap((p) => p.dimensions));
  for (const id of ['gcyr:luna', 'minecraft:the_end', 'minecraft:the_nether', 'gcyr:overworld_orbit', 'grindless:io_orbit', 'minecraft:overworld']) assert.ok(all.has(id), id);
  assert.equal(era(scanStartupEras(), 'gcyr:luna_orbit'), 'hv', 'the Moon orbit follows the Moon');
});

test('datePlaces keeps a later planet dimension at the earliest era of its dated ones and overrides the scanned date', () => {
  const first = new Map([['gcyr:luna', eraIdx('ev')], ['x:b', eraIdx('uv')]]);
  datePlaces(first, { planets: { x: { dimensions: ['x:a', 'x:b', 'x:c'] }, y: { dimensions: ['y:a'] } } });
  assert.equal(era(first, 'gcyr:luna'), 'hv');
  assert.equal(era(first, 'x:a'), 'uv');
  assert.equal(era(first, 'x:c'), 'uv');
  assert.equal(first.has('y:a'), false, 'a planet with no dated dimension stays undated');
});
