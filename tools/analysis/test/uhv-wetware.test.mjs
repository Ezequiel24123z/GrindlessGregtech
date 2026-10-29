// UHV-B6 (docs/eras/uhv.md, "B6. Wetware"; machine 11, line 12): the organoid array's structure, recipe type, recipes and controller
// crafting, and the organoid lab's UHV row, checked without Minecraft by running the real scripts in a mocked KubeJS (static recipe
// lookup). T1: none (proof reuse: table-driven multiblocks through lib/patterns.js, LuV's lab rows and type widening).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const KUBE = path.join(ROOT, 'pack', 'kubejs');
const script = (kind, file) => fs.readFileSync(path.join(KUBE, kind, 'grindless', ...file.split('/')), 'utf8');
const table = (name) => JSON.parse(fs.readFileSync(path.join(KUBE, 'data', 'grindless', 'tables', name), 'utf8'));
const ORBITS = ['test:orbit_a', 'test:orbit_b'];

function harness() {
  const callbacks = [];
  const machines = new Map();
  const types = new Map();
  const widened = [];
  const recipes = [];
  const G = {
    parallelHatch: {
      part: () => ({ kind: 'part', ability: 'parallel_hatch', limits: { max: 1 } }),
      modifier: (next) => (m, r) => next(m, r),
      overclock: () => 'overclock',
    },
    noVoiding: {
      modifier: (opts, next) => { G.noVoidingOpts.push(opts); return (m, r) => (m.voids ? 'cancel' : next(m, r)); },
      beforeWorking: () => (m) => !m.voids,
    },
    noVoidingOpts: [],
    orbits: { dimensions: ORBITS, allow(r) { for (const dim of this.dimensions) r.dimension(dim); return r; } },
  };
  const dummy = new Proxy(() => dummy, { get: () => dummy });
  function builder(calls = []) {
    const b = new Proxy({}, { get: (_, method) => (...args) => { calls.push([method, ...args]); return b; } });
    return b;
  }
  const context = vm.createContext({
    global: { grindless: G }, console: { info() {}, warn: console.warn, error: console.error, log() {} },
    GTCEuStartupEvents: { registry: (type, cb) => callbacks.push([type, cb]) },
    GTRecipeTypes: { get: (name) => { const calls = []; widened.push([name, calls]); return builder(calls); } },
    ModifierFunction: { NULL: 'cancel', IDENTITY: 'identity' }, GuiTextures: dummy, FillDirection: dummy, GTSoundEntries: dummy,
    RotationState: dummy, Text: { translate: (s) => s }, Block: { getBlock: (id) => id },
    Java: { loadClass: (id) => { assert.equal(id, 'com.gregtechceu.gtceu.api.machine.multiblock.CleanroomType'); return { CLEANROOM: 'native-cleanroom' }; } },
    Item: { exists: () => true }, Fluid: { exists: () => true, of: (id, amount) => ({ id, amount }) },
    ServerEvents: { recipes(cb) {
      const gtceu = new Proxy({}, { get: (_, type) => (...args) => {
        const entry = { type, args, calls: [] };
        recipes.push(entry);
        return builder(entry.calls);
      } });
      cb({ recipes: { gtceu } });
    } },
  });
  vm.runInContext(script('startup_scripts', 'lib/patterns.js'), context);
  vm.runInContext(script('startup_scripts', 'luv/orbital_biology.js'), context);
  vm.runInContext(script('startup_scripts', 'uhv/wetware.js'), context);
  // GTM posts the recipe type event before the machine event, whatever the scripts' load order
  for (const kind of ['gtceu:recipe_type', 'gtceu:machine']) {
    for (const [type, cb] of callbacks.filter(([t]) => t === kind)) cb({ create(id) {
      const calls = [];
      (type === 'gtceu:machine' ? machines : types).set(id, calls);
      return builder(calls);
    } });
  }
  vm.runInContext(script('server_scripts', 'luv/orbital_biology.js'), context);
  vm.runInContext(script('server_scripts', 'uhv/wetware.js'), context);
  return { G, W: G.wetware, machines, types, widened, recipes };
}
const call = (calls, method) => calls.filter((c) => c[0] === method).map((c) => c.slice(1));
const only = (calls, method) => call(calls, method)[0]?.[0];
const strip = (s) => s.replace(/^\d+x /, '');
const plain = (x) => JSON.parse(JSON.stringify(x));
const count = (s) => (/^(\d+)x /.exec(s) ? Number(/^(\d+)x /.exec(s)[1]) : 1);
// the lookup keys of an emitted GT recipe: its item ids, fluid ids and circuit
function keysOf(r) {
  const k = new Set(call(r.calls, 'itemInputs').flat().map((s) => 'i:' + strip(s)));
  for (const f of call(r.calls, 'inputFluids').flat()) k.add('f:' + f.id);
  for (const [c] of call(r.calls, 'circuit')) k.add('circuit:' + c);
  return k;
}

test('the organoid array\'s pattern validates through the real helper: a 7x5x7 clean room, parts in the floor, 30+ plascrete', () => {
  const { W, G } = harness();
  const d = G.structures['gtceu:organoid_array'];
  assert.ok(d, 'registered');
  assert.equal(d.slices.length, 7);
  for (const rows of d.slices) {
    assert.equal(rows.length, 5);
    for (const row of rows) assert.equal(row.length, 7);
  }
  const tally = {};
  for (const rows of d.slices) for (const row of rows) for (const ch of row) tally[ch] = (tally[ch] || 0) + 1;
  assert.deepEqual({ S: tally.S, F: tally.F, R: tally.R, M: tally.M, W: tally.W, X: tally.X }, { S: 1, F: 9, R: 16, M: 8, W: 12, X: 49 });
  assert.ok(d.slices[6].some((row) => row.includes('S')), 'the controller is in the front wall');
  for (const rows of d.slices) assert.equal(rows[0], 'XXXXXXX', 'the floor holds the parts');
  const sym = d.symbols;
  assert.equal(sym.F.blocks[0], 'gtceu:sterilizing_filter_casing');
  assert.equal(sym.R.blocks[0], 'gtceu:ptfe_pipe_casing');
  assert.equal(sym.M.blocks[0], 'gtceu:computer_casing');
  assert.equal(sym.W.blocks[0], 'gtceu:cleanroom_glass');
  assert.equal(sym.P.blocks[0], 'gtceu:plascrete');
  const opts = sym.X.options;
  const casing = opts.find((o) => o.kind === 'blocks');
  assert.equal(casing.limits.min, W.minCasings);
  assert.ok(W.minCasings >= 30);
  for (const [ability, lim] of Object.entries(W.parts)) {
    const p = opts.find((o) => o.kind === 'part' && o.ability === ability);
    assert.ok(p, ability);
    assert.equal(p.limits.min, lim.min, ability);
    assert.equal(p.limits.max, lim.max, ability);
  }
  // 49 floor cells: even with every part at its max, 30 stay plascrete
  const maxParts = Object.values(W.parts).reduce((s, l) => s + l.max, 0);
  assert.ok(49 - maxParts >= W.minCasings);
});

test('the recipe type, the machine and the organoid lab\'s widened type are registered as specified', () => {
  const { W, G, machines, types, widened } = harness();
  const t = types.get('organoid_computing');
  assert.ok(t, 'organoid_computing');
  const io = W.maxIO;
  assert.deepEqual(call(t, 'setMaxIOSize')[0], [io.itemsIn, io.itemsOut, io.fluidsIn, io.fluidsOut]);
  assert.equal(only(t, 'setEUIO'), 'in');
  const m = machines.get('organoid_array');
  assert.ok(m, 'organoid_array');
  assert.equal(only(m, 'recipeType'), 'organoid_computing');
  assert.deepEqual(call(m, 'workableCasingModel')[0], ['gtceu:block/casings/cleanroom/plascrete', 'grindless:block/multiblock/organoid_array']);
  assert.ok(G.noVoidingOpts.some((o) => o.which === 'fluids' && o.reason === W.noVoiding), 'the array refuses to void fluids');
  // LuV creates the lab type at (7, 1, 1, 0); this package gives it one fluid output, after it exists
  assert.deepEqual(call(types.get('organoid_assembly'), 'setMaxIOSize')[0], [7, 1, 1, 0]);
  const lab = widened.filter(([name]) => name === 'organoid_assembly');
  assert.equal(lab.length, 1);
  assert.deepEqual(call(lab[0][1], 'setMaxIOSize')[0], [W.labIO.itemsIn, W.labIO.itemsOut, W.labIO.fluidsIn, W.labIO.fluidsOut]);
  assert.deepEqual(plain(W.labIO), { itemsIn: 7, itemsOut: 1, fluidsIn: 1, fluidsOut: 1 });
  const startup = script('startup_scripts', 'uhv/wetware.js');
  assert.match(startup, /GTRecipeTypes\.get\('organoid_assembly'\)\.setMaxIOSize\(7, 1, 1, 1\)/);
});

test('the array grows organoids on Earth and makes 4 wetware mainframes per run from organoid processors', () => {
  const { W, recipes } = harness();
  assert.deepEqual(plain(W.skipped), []);
  assert.deepEqual(plain(W.clashes), []);
  const array = recipes.filter((r) => r.type === 'organoid_computing');
  assert.deepEqual(array.map((r) => r.args[0]), ['grindless:organoid', 'grindless:mainframe']);
  for (const r of array) {
    assert.deepEqual(call(r.calls, 'dimension'), [['minecraft:overworld']], `${r.args[0]}: Earth only`);
    assert.equal(only(r.calls, 'EUt'), 1966080);
  }
  const [organoid, mainframe] = array;
  assert.equal(only(organoid.calls, 'circuit'), 1);
  assert.deepEqual(call(organoid.calls, 'itemInputs').flat(), ['4x gtceu:stem_cells', '1x grindless:chitosan_scaffold']);
  assert.deepEqual(call(organoid.calls, 'inputFluids').flat(), [{ id: 'gtceu:ultrapure_water', amount: 1000 }, { id: 'gtceu:sterilised_growth_medium', amount: 1000 }]);
  assert.deepEqual(call(organoid.calls, 'itemOutputs').flat(), ['1x grindless:organoid_processor']);
  assert.deepEqual(call(organoid.calls, 'outputFluids').flat(), [{ id: 'gtceu:bacterial_sludge', amount: 250 }]);
  assert.equal(only(mainframe.calls, 'circuit'), 2);
  const ins = call(mainframe.calls, 'itemInputs').flat();
  assert.ok(ins.includes('4x grindless:organoid_processor'));
  assert.ok(ins.includes('4x gtceu:neuro_processing_unit'));
  assert.ok(ins.includes('1x grindless:sic_power_module'));
  assert.ok(ins.some((s) => /optical_assembly$/.test(strip(s))));
  const out = call(mainframe.calls, 'itemOutputs').flat();
  assert.deepEqual(out.map(strip), ['gtceu:wetware_processor_mainframe']);
  assert.equal(count(out[0]), 4);
  // the published table and the ids GTM gives the recipes (grindless:<type>/<path>)
  assert.deepEqual(plain(W.recipes.map((r) => r.recipeId)), ['grindless:organoid_computing/organoid', 'grindless:organoid_computing/mainframe',
    'grindless:organoid_assembly/uhv/sterilised_growth_medium']);
});

test('the organoid lab\'s UHV row turns sterilized medium and a xeno radioprotectant into sterilised medium, in orbit, clean', () => {
  const { W, recipes } = harness();
  const lab = recipes.filter((r) => r.type === 'organoid_assembly');
  assert.equal(lab.length, 3, 'LuV\'s two rows + this one');
  const row = lab.find((r) => r.args[0] === 'grindless:uhv/sterilised_growth_medium');
  assert.ok(row);
  assert.equal(only(row.calls, 'circuit'), 3);
  assert.deepEqual(call(row.calls, 'itemInputs').flat(), ['1x grindless:xeno_radioprotectant']);
  assert.deepEqual(call(row.calls, 'inputFluids').flat(), [{ id: 'gtceu:sterilized_growth_medium', amount: 1000 }]);
  assert.deepEqual(call(row.calls, 'itemOutputs'), []);
  assert.deepEqual(call(row.calls, 'outputFluids').flat(), [{ id: 'gtceu:sterilised_growth_medium', amount: 1000 }]);
  assert.deepEqual(call(row.calls, 'dimension').flat(), ORBITS, 'orbit only, like the lab\'s other rows (luv.json)');
  assert.equal(only(row.calls, 'cleanroom'), 'native-cleanroom');
  assert.equal(only(row.calls, 'EUt'), 30720);
  const fit = W.labIO;
  assert.ok(call(row.calls, 'itemInputs').flat().length + 1 <= fit.itemsIn);
  assert.ok(call(row.calls, 'outputFluids').flat().length <= fit.fluidsOut);
});

test('one recipe per lookup path: unique circuits and no recipe\'s keys inside another\'s, LuV\'s lab rows included', () => {
  const { recipes } = harness();
  for (const type of ['organoid_computing', 'organoid_assembly']) {
    const rs = recipes.filter((r) => r.type === type);
    const circuits = rs.map((r) => only(r.calls, 'circuit'));
    assert.ok(circuits.every((c) => Number.isInteger(c)), `${type}: every row has a circuit`);
    assert.equal(new Set(circuits).size, circuits.length, type);
    const ks = rs.map(keysOf);
    const sub = (a, b) => [...a].every((k) => b.has(k));
    for (let i = 0; i < ks.length; i++) {
      for (let j = i + 1; j < ks.length; j++) assert.ok(!sub(ks[i], ks[j]) && !sub(ks[j], ks[i]), `${type}: ${rs[i].args[0]} / ${rs[j].args[0]}`);
    }
  }
});

test('the array\'s recipes fit its slots (the circuit takes an item slot)', () => {
  const { W, recipes } = harness();
  const io = W.maxIO;
  for (const r of recipes.filter((x) => x.type === 'organoid_computing')) {
    assert.ok(call(r.calls, 'itemInputs').flat().length + 1 <= io.itemsIn, `${r.args[0]} items in`);
    assert.ok(call(r.calls, 'inputFluids').flat().length <= io.fluidsIn, `${r.args[0]} fluids in`);
    assert.ok(call(r.calls, 'itemOutputs').flat().length <= io.itemsOut, `${r.args[0]} items out`);
    assert.ok(call(r.calls, 'outputFluids').flat().length <= io.fluidsOut, `${r.args[0]} fluids out`);
  }
});

test('the destinations: the radioprotectant comes from Proxima b, the spent medium feeds the biofoundry\'s mutagen', () => {
  const life = JSON.stringify(table('proxima_life.json'));
  assert.ok(life.includes('"id":"grindless:xeno_radioprotectant"'), 'B4 makes the radioprotectant');
  const bio = table('biofoundry.json');
  const mutagen = JSON.stringify(bio).match(/\{[^{}]*"name":"mutagen"[^{}]*\{[^{}]*\}[^{}]*\}/);
  assert.ok(mutagen && mutagen[0].includes('f:gtceu:bacterial_sludge'), 'the biofoundry takes bacterial sludge');
  // GTM's wetware mainframe assembly line recipe stays: nothing here removes it
  for (const kind of ['server_scripts', 'startup_scripts']) assert.doesNotMatch(script(kind, 'uhv/wetware.js'), /remove\(/);
});

test('the controller crafting: UHV hull, 2 UV sensors, 2 UHV circuits, a shape no other UHV controller uses', () => {
  const { W, recipes } = harness();
  const shaped = recipes.filter((r) => r.type === 'shaped');
  assert.equal(shaped.length, 1, 'the LuV controllers are assembly-line recipes now');
  const mine = shaped.find((r) => r.args[0] === 'gtceu:organoid_array');
  assert.ok(mine);
  assert.equal(only(mine.calls, 'id'), W.crafting.array);
  assert.equal(W.crafting.array, 'grindless:crafting/organoid_array');
  const [, pattern, keys] = mine.args;
  const grid = (pat, k) => pat.map((row) => [...row].map((ch) => (ch === ' ' ? '' : k[ch])));
  const resolved = plain(grid(pattern, keys));
  assert.deepEqual(resolved, [['#gtceu:circuits/uhv', '', '#gtceu:circuits/uhv'], ['gtceu:uv_sensor', 'gtceu:uhv_machine_hull', 'gtceu:uv_sensor']]);
  // every other UHV controller grid (literal ids or the script's var constants), and its mirror
  const dir = path.join(KUBE, 'server_scripts', 'grindless', 'uhv');
  const others = [];
  for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.js') && n !== 'wetware.js')) {
    const src = fs.readFileSync(path.join(dir, f), 'utf8');
    const value = (tok) => {
      tok = tok.trim();
      const lit = /^'([^']*)'$/.exec(tok);
      if (lit) return lit[1];
      const v = new RegExp(`var ${tok} = [^\\n]*?'([^']+)'`).exec(src);
      return v ? v[1] : tok;
    };
    const re = /(?:pattern: |shaped\([^,]+, )\[([^\]]*)\],\s*(?:ingredients: )?\{([^}]*)\}/g;
    for (const m of src.matchAll(re)) {
      const pat = [...m[1].matchAll(/'([^']*)'/g)].map((x) => x[1]);
      const k = {};
      for (const kv of m[2].matchAll(/([A-Z])\s*:\s*([^,]+)/g)) k[kv[1]] = value(kv[2]);
      others.push([f, grid(pat, k)]);
    }
  }
  assert.ok(others.length >= 15, `found ${others.length} other UHV controller grids`);
  const mirror = (g) => g.map((row) => [...row].reverse());
  for (const [f, g] of others) {
    assert.notDeepEqual(g, resolved, f);
    assert.notDeepEqual(mirror(g), resolved, `${f} (mirrored)`);
  }
});

test('names in en_us and es_es, no UEV ids, and the controller overlays exist', () => {
  const languages = {};
  vm.runInNewContext(script('client_scripts', 'uhv_wetware_lang.js'), {
    ClientEvents: { lang(lang, cb) { languages[lang] = {}; cb({ add: (_, key, value) => { languages[lang][key] = value; } }); } },
  });
  assert.deepEqual(Object.keys(languages.en_us).sort(), Object.keys(languages.es_es).sort());
  const startup = script('startup_scripts', 'uhv/wetware.js');
  const keys = ['block.gtceu.organoid_array', 'gtceu.organoid_computing', 'grindless.machine.organoid_array.no_voiding']
    .concat([...startup.matchAll(/Text\.translate\('([^']+)'\)/g)].map((m) => m[1]));
  for (const k of keys) {
    assert.ok(languages.en_us[k], `en_us ${k}`);
    assert.ok(languages.es_es[k], `es_es ${k}`);
  }
  const { recipes } = harness();
  for (const r of recipes.filter((x) => x.type !== 'shaped')) {
    const ids = call(r.calls, 'itemInputs').flat().concat(call(r.calls, 'itemOutputs').flat()).map(strip)
      .concat(call(r.calls, 'inputFluids').flat().map((f) => f.id), call(r.calls, 'outputFluids').flat().map((f) => f.id));
    for (const id of ids) assert.ok(!/(^|[:_])uev(_|$)/.test(id.split(':')[1] || ''), `${r.args[0]}: ${id}`);
  }
  const tex = path.join(KUBE, 'assets', 'grindless', 'textures', 'block', 'multiblock', 'organoid_array');
  for (const [file, h] of [['overlay_front.png', 16], ['overlay_front_active.png', 64], ['overlay_front_active_emissive.png', 64]]) {
    const bytes = fs.readFileSync(path.join(tex, file));
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG', file);
    assert.equal(bytes.readUInt32BE(16), 16, file);
    assert.equal(bytes.readUInt32BE(20), h, file);
  }
  for (const file of ['overlay_front_active.png.mcmeta', 'overlay_front_active_emissive.png.mcmeta']) assert.ok(fs.existsSync(path.join(tex, file)), file);
});
