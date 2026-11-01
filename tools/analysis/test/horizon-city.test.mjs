// XP-Z1a: static checks of the final dimension grindless:horizon_city: wiring resolves, every template parses and only uses allowed blocks,
// and the generator is deterministic. Run: node --test tools/analysis/test/horizon-city.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { ROOT, DIRS, buildTemplates, encodeTemplate, encodePng, ringPixels, RING_SIZE, POOLS, STRUCTURE, STRUCTURE_SET, TABLE } from '../../assets/Build-HorizonCity.mjs';

const DATA = path.join(ROOT, 'pack', 'kubejs', 'data', 'grindless');
const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));

// minimal NBT reader: enough for structure templates
function readNbt(buf) {
  let o = 0;
  const str = () => { const n = buf.readUInt16BE(o); o += 2; const s = buf.toString('utf8', o, o + n); o += n; return s; };
  const payload = (t) => {
    switch (t) {
      case 1: return buf.readInt8(o++);
      case 2: { const v = buf.readInt16BE(o); o += 2; return v; }
      case 3: { const v = buf.readInt32BE(o); o += 4; return v; }
      case 4: { const v = buf.readBigInt64BE(o); o += 8; return v; }
      case 5: { const v = buf.readFloatBE(o); o += 4; return v; }
      case 6: { const v = buf.readDoubleBE(o); o += 8; return v; }
      case 8: return str();
      case 9: { const it = buf.readInt8(o++); const n = buf.readInt32BE(o); o += 4; const a = []; for (let i = 0; i < n; i++) a.push(payload(it)); return a; }
      case 10: { const m = {}; for (;;) { const k = buf.readInt8(o++); if (k === 0) break; const name = str(); m[name] = payload(k); } return m; }
      case 11: { const n = buf.readInt32BE(o); o += 4; const a = []; for (let i = 0; i < n; i++) { a.push(buf.readInt32BE(o)); o += 4; } return a; }
      default: throw new Error('nbt tag ' + t);
    }
  };
  assert.equal(buf.readInt8(o++), 10);
  str();
  return payload(10);
}

const ALLOWED_NS = new Set(['minecraft', 'architects_palette']);
const BANNED = /(chest|barrel|furnace|smoker|hopper|dispenser|dropper|crafting_table|smithing_table|cartography_table|fletching_table|loom|stonecutter|grindstone|anvil|beacon|spawner|sign|command_block|structure_block|lectern|brewing_stand|enchanting_table|jukebox|note_block|shulker|campfire|composter|cauldron|bell|ender_chest|conduit|_ore$|^minecraft:(ancient_debris|gilded_blackstone|nether_gold_ore|reinforced_deepslate)$)/;

const files = fs.readdirSync(DIRS.structures).filter((f) => f.endsWith('.nbt'));
const parsed = new Map(files.map((f) => [f.replace(/\.nbt$/, ''), readNbt(zlib.gunzipSync(fs.readFileSync(path.join(DIRS.structures, f))))]));

test('dimension wiring resolves', () => {
  const dim = readJson(path.join(DATA, 'dimension', 'horizon_city.json'));
  assert.ok(fs.existsSync(path.join(DATA, 'dimension_type', dim.type.split(':')[1] + '.json')));
  const biome = dim.generator.settings.biome;
  assert.equal(biome, 'grindless:horizon_city');
  assert.ok(fs.existsSync(path.join(DATA, 'worldgen', 'biome', 'horizon_city.json')));
  for (const s of dim.generator.settings.structure_overrides) assert.ok(fs.existsSync(path.join(DATA, 'worldgen', 'structure_set', s.split(':')[1] + '.json')), s);
  const type = readJson(path.join(DATA, 'dimension_type', 'horizon_city.json'));
  assert.ok(type.min_y + type.height <= 320 + type.min_y && type.height % 16 === 0);
  const layers = dim.generator.settings.layers.reduce((n, l) => n + l.height, 0);
  assert.equal(layers, TABLE.ground_y + 1, 'flat layers end at ground_y');
  assert.ok(fs.existsSync(path.join(ROOT, 'pack', 'kubejs', 'assets', 'grindless', 'gcyr', 'planet_assets', 'sky_renderers', 'horizon_city.json')));
  const sky = readJson(path.join(ROOT, 'pack', 'kubejs', 'assets', 'grindless', 'gcyr', 'planet_assets', 'sky_renderers', 'horizon_city.json'));
  assert.equal(sky.world, 'grindless:horizon_city');
  for (const o of sky.sky_objects) if (o.texture.startsWith('grindless:')) assert.ok(fs.existsSync(path.join(ROOT, 'pack', 'kubejs', 'assets', 'grindless', o.texture.slice(10).replace(/^/, '')), o.texture));
});

test('structure, pools and templates resolve', () => {
  const set = readJson(DIRS.structureSet);
  const st = readJson(DIRS.structure);
  assert.equal(set.structures[0].structure, 'grindless:horizon_city');
  assert.ok(st.size <= 20);
  const poolIds = new Set(fs.readdirSync(DIRS.pools).map((f) => 'grindless:horizon_city/' + f.replace(/\.json$/, '')));
  assert.ok(poolIds.has(st.start_pool));
  const used = new Set();
  for (const f of fs.readdirSync(DIRS.pools)) {
    const p = readJson(path.join(DIRS.pools, f));
    assert.ok(p.fallback === 'minecraft:empty' || poolIds.has(p.fallback), f);
    for (const e of p.elements) {
      const name = e.element.location.replace('grindless:horizon_city/', '');
      assert.ok(parsed.has(name), `${f} -> ${name}`);
      used.add(name);
    }
  }
  for (const name of parsed.keys()) if (name !== 'arrival_plaza') assert.ok(used.has(name), 'unused template ' + name);
  for (const [name, t] of parsed) {
    for (const b of t.blocks) {
      if (!b.nbt || b.nbt.id !== 'minecraft:jigsaw') continue;
      assert.ok(poolIds.has(b.nbt.pool) || b.nbt.pool === 'minecraft:empty', `${name} jigsaw pool ${b.nbt.pool}`);
    }
  }
  assert.equal(TABLE.plaza.template, 'grindless:horizon_city/arrival_plaza');
  assert.deepEqual(parsed.get('arrival_plaza').size, TABLE.plaza.size);
  assert.equal(parsed.get('arrival_plaza').blocks.filter((b) => b.nbt).length, 0, 'arrival plaza has no jigsaws');
});

test('templates only use allowed blocks and fit the dimension', () => {
  for (const [name, t] of parsed) {
    assert.ok(t.size[1] <= 320 - TABLE.ground_y, `${name} too tall`);
    assert.ok(t.entities.length === 0, `${name} has entities`);
    for (const p of t.palette) {
      const [ns] = p.Name.split(':');
      assert.ok(ALLOWED_NS.has(ns), `${name}: namespace ${p.Name}`);
      if (p.Name === 'minecraft:jigsaw') continue;
      assert.ok(!BANNED.test(p.Name), `${name}: banned block ${p.Name}`);
    }
    for (const b of t.blocks) {
      if (!b.nbt) continue;
      assert.equal(b.nbt.id, 'minecraft:jigsaw', `${name}: block entity ${b.nbt.id}`);
      assert.equal(b.nbt.final_state, 'minecraft:air');
    }
  }
});

// The deflate bytes depend on the zlib build, so compare what they decode to.
function idat(png) {
  const parts = [];
  for (let o = 8; o < png.length;) { const n = png.readUInt32BE(o); if (png.toString('latin1', o + 4, o + 8) === 'IDAT') parts.push(png.subarray(o + 8, o + 8 + n)); o += 12 + n; }
  return zlib.inflateSync(Buffer.concat(parts));
}

test('the generator is deterministic and matches the committed files', () => {
  for (const t of buildTemplates()) {
    const disk = zlib.gunzipSync(fs.readFileSync(path.join(DIRS.structures, t.name + '.nbt')));
    assert.ok(zlib.gunzipSync(encodeTemplate(t)).equals(disk), t.name);
    assert.ok(encodeTemplate(t).equals(encodeTemplate(t)), t.name + ' twice');
  }
  assert.ok(idat(encodePng(RING_SIZE, RING_SIZE, ringPixels(RING_SIZE))).equals(idat(fs.readFileSync(DIRS.ring))));
  assert.deepEqual(readJson(DIRS.structure), STRUCTURE);
  assert.deepEqual(readJson(DIRS.structureSet), STRUCTURE_SET);
  assert.deepEqual(readJson(DIRS.table), TABLE);
  for (const [n, p] of Object.entries(POOLS)) assert.deepEqual(readJson(path.join(DIRS.pools, n + '.json')), p);
  assert.equal(parsed.size, buildTemplates().length);
});
