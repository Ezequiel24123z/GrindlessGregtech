import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const source = fs.readFileSync(path.join(ROOT, 'tools', 'test', 'overlay', 'kubejs',
  'startup_scripts', 'gg_test_luv_s0.js'), 'utf8');
const production = JSON.parse(fs.readFileSync(path.join(ROOT, 'pack', 'kubejs',
  'data', 'grindless', 'tables', 'orbits.json'), 'utf8')).dimensions;

function profile(marker, dimensions) {
  const messages = [];
  const G = dimensions ? { orbits: { dimensions } } : {};
  const context = vm.createContext({
    global: { grindless: G },
    StartupEvents: { registry() {} },
    JsonIO: { read: () => marker === null ? null : { get: key => marker[key] } },
    console: { info: message => messages.push(message) },
  });
  return { run: () => vm.runInContext(source, context), G, messages };
}

test('disposable orbit is not published in the production registry', () => {
  assert.ok(production.length > 0);
  assert.ok(production.every(id => !id.startsWith('grindless:s0_')));
});

test('disposable planet table preserves the complete integrated production table', () => {
  const tablePath = path.join('kubejs', 'data', 'grindless', 'tables', 'planets.json');
  const base = JSON.parse(fs.readFileSync(path.join(ROOT, 'pack', tablePath), 'utf8'));
  const overlay = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'test', 'overlay', tablePath), 'utf8'));
  for (const [name, entry] of Object.entries(base.planets)) {
    assert.deepEqual(overlay.planets[name], entry, name);
  }
  assert.deepEqual(overlay.dryOnEarth, base.dryOnEarth);
  assert.deepEqual(Object.keys(overlay.planets).filter(name => !(name in base.planets)).sort(),
    ['s0_jupiter', 's0_moon']);
});

test('missing/disabled/non-station markers leave the registry untouched', () => {
  for (const marker of [null, {}, { enabled: false, stationsOnly: true }, { enabled: true }]) {
    const dimensions = [...production];
    const p = profile(marker, dimensions);
    p.run();
    assert.deepEqual(dimensions, production);
    assert.equal(p.messages.length, 0);
  }
});

test('enabled station continuation extends the same registry once, preserving production dimensions', () => {
  const dimensions = [...production];
  const p = profile({ enabled: true, stationsOnly: true }, dimensions);
  p.run();
  p.run();
  assert.equal(p.G.orbits.dimensions, dimensions);
  assert.deepEqual(dimensions, [...production, 'grindless:s0_moon_orbit']);
  assert.ok(p.messages.every(message => message.includes('test_orbit_allowlist|PASS')));
});

test('enabled continuation fails explicitly without the production orbit registry', () => {
  const p = profile({ enabled: true, stationsOnly: true });
  assert.throws(p.run, /requires the production orbit registry/);
});
