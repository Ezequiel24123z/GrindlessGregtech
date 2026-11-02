// AF-E2 (#197 M3-04): tables/orbits.json is the catalogue G.orbits reads (relay platforms, stations, markers). Every late place
// the travel scripts jump to must be listed, so a new place cannot be left out of it silently.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const kube = path.resolve(here, '..', '..', '..', 'pack', 'kubejs');
const orbits = JSON.parse(fs.readFileSync(path.join(kube, 'data', 'grindless', 'tables', 'orbits.json'), 'utf8')).dimensions;
const travel = (era) => fs.readFileSync(path.join(kube, 'startup_scripts', 'grindless', era, 'travel.js'), 'utf8');

test('orbits.json has no duplicate and lists the six late orbits', () => {
  assert.equal(new Set(orbits).size, orbits.length);
  for (const d of ['gcyr:black_hole_orbit', 'grindless:nsc_belt', 'grindless:tarantula_orbit', 'grindless:magellanic_stream',
    'grindless:m31_nucleus_orbit', 'grindless:local_group_filament']) assert.ok(orbits.includes(d), d);
});

test('every dimension the MAX and MAX+ travel scripts jump to is in orbits.json', () => {
  for (const era of ['max', 'maxplus']) {
    const dims = [...travel(era).matchAll(/dimension: '([a-z0-9_]+:[a-z0-9_]+)'/g)].map((m) => m[1]);
    assert.ok(dims.length > 0, era);
    for (const d of dims) assert.ok(orbits.includes(d), `${era}: ${d}`);
  }
});
