import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const file = p => path.join(root, ...p.split('/'));
const json = p => JSON.parse(fs.readFileSync(file(p), 'utf8'));
const data = 'pack/kubejs/data/grindless';
const local = id => { assert.match(id, /^grindless:[a-z_]+$/); return id.slice('grindless:'.length); };

const SURFACES = ['asteroid_belt', 'io', 'europa', 'ganymede'];
const SPACE = ['jupiter', 'jupiter_orbit', 'asteroid_belt_orbit', 'io_orbit', 'europa_orbit', 'ganymede_orbit'];
const SKY_TEXTURES = ['sun.png', 'jupiter.png', 'light.png', 'earth.png'].map(t => `gcyr:textures/sky/${t}`);
const registry = json('tools/analysis/fixtures/luv-b1-registry-ids.json');
const known = new Set([...registry.blocks, ...registry.fluids]);

const names = node => {
  const out = [];
  const walk = n => {
    if (Array.isArray(n)) n.forEach(walk);
    else if (n && typeof n === 'object') {
      for (const [k, v] of Object.entries(n)) {
        if (k === 'Name') out.push(v);
        else walk(v);
      }
    }
  };
  walk(node);
  return out;
};

// Interval bounds of a density function at height y, taking every noise as [-1, 1] (its usual range).
function bounds(df, y) {
  if (typeof df === 'number') return [df, df];
  const b = a => bounds(a, y);
  switch (df.type) {
    case 'minecraft:y_clamped_gradient': {
      const t = Math.min(1, Math.max(0, (y - df.from_y) / (df.to_y - df.from_y)));
      const v = df.from_value + t * (df.to_value - df.from_value);
      return [v, v];
    }
    case 'minecraft:noise': return [-1, 1];
    case 'minecraft:interpolated': return b(df.argument);
    case 'minecraft:add': { const [a, c] = [b(df.argument1), b(df.argument2)]; return [a[0] + c[0], a[1] + c[1]]; }
    case 'minecraft:mul': {
      const [a, c] = [b(df.argument1), b(df.argument2)];
      const p = [a[0] * c[0], a[0] * c[1], a[1] * c[0], a[1] * c[1]];
      return [Math.min(...p), Math.max(...p)];
    }
    case 'minecraft:min': { const [a, c] = [b(df.argument1), b(df.argument2)]; return [Math.min(a[0], c[0]), Math.min(a[1], c[1])]; }
    case 'minecraft:max': { const [a, c] = [b(df.argument1), b(df.argument2)]; return [Math.max(a[0], c[0]), Math.max(a[1], c[1])]; }
    case 'minecraft:abs': {
      const [lo, hi] = b(df.argument);
      return lo >= 0 ? [lo, hi] : hi <= 0 ? [-hi, -lo] : [0, Math.max(-lo, hi)];
    }
    case 'minecraft:clamp': { const [lo, hi] = b(df.input); const c = v => Math.min(df.max, Math.max(df.min, v)); return [c(lo), c(hi)]; }
    case 'minecraft:squeeze': {
      const s = v => { const x = Math.min(1, Math.max(-1, v)); return x / 2 - x * x * x / 24; };
      const [lo, hi] = b(df.argument);
      return [s(lo), s(hi)];
    }
    default: throw new Error(`no bounds for ${df.type}`);
  }
}

test('Jupiter and the five LuV orbits are GCYR space voids', () => {
  for (const name of SPACE) {
    assert.deepEqual(json(`${data}/dimension/${name}.json`), { type: 'gcyr:space', generator: { type: 'gcyr:space' } }, name);
  }
});

for (const name of SURFACES) {
  const id = `grindless:${name}`;
  test(`${id}: dimension, type, noise settings, biome and sky agree`, () => {
    const dim = json(`${data}/dimension/${name}.json`);
    assert.equal(dim.type, id);
    assert.equal(dim.generator.type, 'minecraft:noise');
    assert.equal(dim.generator.settings, id);

    const type = json(`${data}/dimension_type/${name}.json`);
    assert.equal(type.effects, id, 'GCYR keys the sky renderer by world id; vanilla looks effects up by this field');
    assert.ok(!('fixed_time' in type), 'surfaces keep a day cycle');
    assert.equal(type.has_skylight, true);
    assert.equal(type.has_ceiling, false);

    const source = dim.generator.biome_source;
    const biomes = source.type === 'minecraft:fixed' ? [source.biome] : source.biomes.map(b => b.biome);
    assert.ok(biomes.length > 0);
    for (const biomeId of biomes) {
      const biome = json(`${data}/worldgen/biome/${local(biomeId)}.json`);
      assert.equal(biome.has_precipitation, false, biomeId);
      assert.deepEqual(biome.spawners, {}, biomeId);
      assert.equal(biome.creature_spawn_probability, 0, biomeId);
    }

    const settings = json(`${data}/worldgen/noise_settings/${name}.json`);
    const { min_y, height } = settings.noise;
    for (const v of [min_y, height, type.min_y, type.height]) assert.ok(Number.isInteger(v / 16), `${v} is not a multiple of 16`);
    assert.ok(min_y >= type.min_y && min_y + height <= type.min_y + type.height, 'noise range fits the dimension type');
    assert.ok(type.min_y + type.height > 214, 'test fixtures build up to Y 214');
    assert.deepEqual(Object.keys(settings.noise_router).sort(), [
      'barrier', 'continents', 'depth', 'erosion', 'final_density', 'fluid_level_floodedness', 'fluid_level_spread',
      'initial_density_without_jaggedness', 'lava', 'ridges', 'temperature', 'vegetation', 'vein_gap', 'vein_ridged', 'vein_toggle'
    ]);
    assert.equal(settings.aquifers_enabled, false);
    assert.equal(settings.disable_mob_generation, true);
    if (settings.default_fluid.Name === 'minecraft:water') assert.fail('no liquid water on these worlds');

    const sky = json(`pack/kubejs/assets/grindless/gcyr/planet_assets/sky_renderers/${name}.json`);
    assert.equal(sky.world, id);
    assert.equal(sky.cloud_effects, 'none');
    assert.equal(sky.weather_effects, 'none');
    const textures = sky.sky_objects.map(o => o.texture);
    assert.ok(textures.includes('gcyr:textures/sky/sun.png'));
    assert.ok(textures.includes('gcyr:textures/sky/jupiter.png'));
    for (const t of textures) assert.ok(SKY_TEXTURES.includes(t), `${t} is not one of GCYR's sky textures`);
  });

  test(`${id}: every block and fluid is in the native registry`, () => {
    const settings = json(`${data}/worldgen/noise_settings/${name}.json`);
    const used = names(settings);
    assert.ok(used.length > 0);
    for (const n of used) assert.ok(known.has(n), `${n} is not in the native registry snapshot`);
  });

  test(`${id}: natural terrain stays at or below Y 180 and the ground is reachable`, () => {
    const settings = json(`${data}/worldgen/noise_settings/${name}.json`);
    const fd = settings.noise_router.final_density;
    assert.equal(fd.type, 'minecraft:max');
    assert.equal(fd.argument2.type, 'minecraft:min');
    const cap = fd.argument2.argument2;
    assert.equal(cap.type, 'minecraft:y_clamped_gradient');
    assert.ok(cap.to_y <= 180 && cap.to_value < 0, 'cap is negative from Y 180 up');
    const zero = cap.from_y + (cap.to_y - cap.from_y) * cap.from_value / (cap.from_value - cap.to_value);
    assert.ok(zero <= 180, `cap crosses zero at Y ${zero}`);
    const { min_y, height } = settings.noise;
    for (let y = Math.ceil(zero); y < min_y + height; y++) assert.ok(bounds(fd, y)[1] <= 0, `solid possible at Y ${y}`);
    for (let y = min_y; y <= 55; y++) assert.ok(bounds(fd, y)[0] > 0, `air possible at Y ${y}`);
    if (name !== 'asteroid_belt') {
      for (let y = 145; y < min_y + height; y++) assert.ok(bounds(fd, y)[1] < 0, `ground above Y 140 at Y ${y}`);
    }
  });
}

test('the belt is tuff (B5 ore layer) with a rubble floor and floating asteroids', () => {
  const settings = json(`${data}/worldgen/noise_settings/asteroid_belt.json`);
  assert.equal(settings.default_block.Name, 'minecraft:tuff');
  const fd = settings.noise_router.final_density;
  assert.ok(bounds(fd, 72)[1] < 0, 'air just above the floor');
  assert.ok(bounds(fd, 120)[1] > 0, 'asteroids possible above the floor');
  assert.ok(bounds(fd, 80)[1] < 0, 'a gap between floor and asteroids');
});

test('surface rules carry each world\'s signature blocks', () => {
  const rule = name => new Set(names(json(`${data}/worldgen/noise_settings/${name}.json`).surface_rule));
  const io = rule('io');
  for (const b of ['biomesoplenty:brimstone', 'biomesoplenty:brimstone_fumarole', 'minecraft:magma_block', 'minecraft:basalt']) assert.ok(io.has(b), b);
  const europa = rule('europa');
  assert.ok(europa.has('minecraft:packed_ice'));
  const europaSettings = json(`${data}/worldgen/noise_settings/europa.json`);
  assert.ok(europa.has('minecraft:blue_ice') || europaSettings.default_block.Name === 'minecraft:blue_ice');
  const ganymede = rule('ganymede');
  assert.ok(ganymede.has('minecraft:packed_ice'));
  const ganymedeSettings = json(`${data}/worldgen/noise_settings/ganymede.json`);
  assert.ok(ganymede.has('minecraft:tuff') || ganymedeSettings.default_block.Name === 'minecraft:tuff');
  assert.equal(json(`${data}/worldgen/noise_settings/io.json`).default_fluid.Name, 'minecraft:lava');
});

test('every grindless place surface and grindless orbit has a dimension file', () => {
  const places = json(`${data}/tables/places.json`);
  const orbits = json(`${data}/tables/orbits.json`);
  // GCYR surfaces (UHV's Proxima b) are GCYR's own dimensions
  const ids = [...Object.values(places.surfaces), ...orbits.dimensions].filter(d => d.startsWith('grindless:'));
  assert.ok(ids.length >= 9);
  for (const id of ids) assert.ok(fs.existsSync(file(`${data}/dimension/${local(id)}.json`)), id);
});
