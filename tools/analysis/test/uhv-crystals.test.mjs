// UHV-A2 (docs/eras/uhv.md, "A2. Clock and crystals"): the nuclear clock lab's and the crystal growth furnace's table, the cutter rows,
// the iridium crucible and its return to EV's platinum plant, checked without Minecraft by static recipe lookup. T1: none.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const kube = path.join(root, 'pack', 'kubejs');
const tables = path.join(kube, 'data', 'grindless', 'tables');
const T = JSON.parse(fs.readFileSync(path.join(tables, 'crystals.json'), 'utf8'));
const CLOCK = T.types.nuclear_clock.recipes;
const GROW = T.types.crystal_growth.recipes.filter((r) => !(r._why || '').startsWith('UXV-')); // UXV rows are pinned in uxv-spin_rows.test.mjs (A3) and uxv-spin_logic.test.mjs (c18)
const CUT = T.types.cutter.recipes;
const ASM = T.types.assembler.recipes;
const PGM = T.types.pgm_refining.recipes;
const startup = fs.readFileSync(path.join(kube, 'startup_scripts', 'grindless', 'uhv', 'crystals.js'), 'utf8');
const server = fs.readFileSync(path.join(kube, 'server_scripts', 'grindless', 'uhv', 'crystals.js'), 'utf8');
// UEV-A8's TGG and KTP rows keep their lang keys in the UEV file; UIV-A6's Eu-151 and Er:YSO rows in the UIV file
const lang = ['uhv_crystals_lang.js', 'uev_earth_orbit_lang.js', 'uiv_memories_cryostat_lang.js', 'uiv_mainframe_lang.js', 'uxv_spin_rows_lang.js'].map((f) => fs.readFileSync(path.join(kube, 'client_scripts', 'grindless', f), 'utf8')).join('\n');

const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => x.id);
const inputs = (r) => ids(r.itemsIn).concat(ids(r.kept), ids(r.fluidsIn), ids(r.charge));
const outputs = (r) => ids(r.itemsOut).concat(ids(r.fluidsOut));
const by = (rs, name) => {
  const r = rs.find((x) => x.name === name);
  assert.ok(r, name);
  return r;
};
const CRUCIBLE = 'grindless:iridium_crucible';
const WORN = 'grindless:worn_iridium_crucible';
// tgg and ktp: UEV-A8 rows (docs/eras/uev.md, A8); eu151_yso and er_yso: UIV-A6 rows (docs/eras/uiv.md lines 15-16)
const BOULES = ['grindless:lithium_niobate_boule', 'grindless:vuv_caf2_boule', 'grindless:thorium_caf2_crystal', 'grindless:eu_yso_boule', 'grindless:inp_boule', 'grindless:tgg_boule', 'grindless:ktp_boule', 'grindless:eu151_yso_boule', 'grindless:er_yso_boule'];

// every recipe-producing row of every table, as [table/path, recipe]
function allRows() {
  const out = [];
  for (const f of fs.readdirSync(tables).filter((n) => n.endsWith('.json'))) {
    const walk = (node, where) => {
      if (Array.isArray(node)) node.forEach((x, i) => walk(x, `${where}[${i}]`));
      else if (node && typeof node === 'object') {
        if (Array.isArray(node.itemsOut) || Array.isArray(node.fluidsOut)) out.push([`${f}:${where}`, node]);
        for (const [k, v] of Object.entries(node)) if (k !== 'itemsOut' && k !== 'fluidsOut') walk(v, `${where}.${k}`);
      }
    };
    walk(JSON.parse(fs.readFileSync(path.join(tables, f), 'utf8')), '');
  }
  return out;
}
const producers = (id) => allRows().filter(([, r]) => outputs(r).includes(id));

test('every recipe has a unique name, a positive EU/t and duration; circuits are unique inside a type; the machines\' rows all carry one', () => {
  for (const [type, t] of Object.entries(T.types)) {
    assert.equal(new Set(t.recipes.map((r) => r.name)).size, t.recipes.length, type);
    const circuits = t.recipes.map((r) => r.circuit).filter((c) => c > 0);
    assert.equal(new Set(circuits).size, circuits.length, type);
    for (const r of t.recipes) {
      assert.ok(Number.isInteger(r.eut) && r.eut > 0 && Number.isInteger(r.duration) && r.duration > 0, r.name);
      if (t.dataKey) assert.ok(r.circuit >= 1 && r.circuit <= 32, `${type}/${r.name}: one recipe per lookup path needs a circuit`);
      for (const x of r.itemsIn.concat(r.itemsOut)) if (x.chance !== undefined) assert.ok(Number.isInteger(x.chance) && x.chance >= 1 && x.chance < 10000, `${r.name}: ${x.id}`);
    }
  }
});

test('one recipe per lookup path: no recipe\'s ingredients are a subset of another\'s in its type', () => {
  const keys = (r) => new Set(inputs(r).concat([`circuit:${r.circuit}`]));
  for (const [type, t] of Object.entries(T.types)) {
    const ks = t.recipes.map(keys);
    for (let i = 0; i < ks.length; i++) {
      for (let j = i + 1; j < ks.length; j++) {
        const sub = (a, b) => [...a].every((k) => b.has(k));
        assert.ok(!sub(ks[i], ks[j]) && !sub(ks[j], ks[i]), `${type}: ${t.recipes[i].name} / ${t.recipes[j].name}`);
      }
    }
  }
});

test('the recipes fit the machines\' slots (startup maxIO; the circuit takes an item slot) and the platinum plant\'s', () => {
  const io = {
    nuclear_clock: { itemsIn: 4, itemsOut: 1, fluidsIn: 1, fluidsOut: 0 },
    crystal_growth: { itemsIn: 5, itemsOut: 2, fluidsIn: 2, fluidsOut: 0 }
  };
  for (const [type, m] of Object.entries(io)) {
    assert.ok(startup.includes(`maxIO: { itemsIn: ${m.itemsIn}, itemsOut: ${m.itemsOut}, fluidsIn: ${m.fluidsIn}, fluidsOut: ${m.fluidsOut} }`), type);
  }
  const pp = fs.readFileSync(path.join(kube, 'startup_scripts', 'grindless', 'ev', 'platinum_plant.js'), 'utf8');
  const ppio = pp.match(/PP\.maxIO = \{ itemsIn: (\d+), itemsOut: (\d+), fluidsIn: (\d+), fluidsOut: (\d+) \}/);
  assert.ok(ppio, 'platinum plant maxIO');
  io.pgm_refining = { itemsIn: +ppio[1], itemsOut: +ppio[2], fluidsIn: +ppio[3], fluidsOut: +ppio[4] };
  for (const [type, m] of Object.entries(io)) {
    for (const r of T.types[type].recipes) {
      assert.ok(r.itemsIn.length + r.kept.length + 1 <= m.itemsIn, `${r.name} items in`);
      assert.ok(r.fluidsIn.length + r.charge.length <= m.fluidsIn, `${r.name} fluids in`);
      assert.ok(r.itemsOut.length <= m.itemsOut, `${r.name} items out`);
      assert.ok(r.fluidsOut.length <= m.fluidsOut, `${r.name} fluids out`);
    }
  }
});

test('the nuclear clock comes only from the lab; the comb from the lab\'s circuit 1 and its optics from the cutter', () => {
  const clock = producers('grindless:nuclear_clock');
  assert.equal(clock.length, 1);
  assert.ok(clock[0][0].startsWith('crystals.json:.types.nuclear_clock'), clock[0][0]);
  assert.equal(clock[0][1].name, 'clock');
  assert.ok(inputs(by(CLOCK, 'clock')).includes('grindless:thorium_caf2_crystal') && inputs(by(CLOCK, 'clock')).includes('grindless:vuv_frequency_comb'));
  assert.deepEqual(producers('grindless:vuv_frequency_comb').map(([, r]) => r.name), ['comb']);
  const comb = by(CLOCK, 'comb');
  assert.ok(inputs(comb).includes('grindless:fibre_laser_module') && inputs(comb).includes('grindless:vuv_caf2_optic'));
  assert.deepEqual(ids(comb.charge), ['gtceu:xenon'], 'the xenon is never used up');
  assert.deepEqual(producers('grindless:vuv_caf2_optic').map(([, r]) => r.name), ['vuv_caf2_optics']);
});

test('the nine boules each have their own circuit and a single maker; thorium-229 is used here, made only by the decay store', () => {
  const circuits = BOULES.map((id) => {
    const p = producers(id);
    assert.equal(p.length, 1, id);
    assert.ok(p[0][0].startsWith('crystals.json:.types.crystal_growth'), id);
    return p[0][1].circuit;
  });
  assert.equal(new Set(circuits).size, BOULES.length);
  assert.equal(GROW.length, BOULES.length);
  assert.deepEqual(producers('grindless:thorium_229').map(([, r]) => r.name), ['decay_store']);
  assert.ok(inputs(by(GROW, 'thorium_caf2')).includes('grindless:thorium_229'));
  // the scavenger and the cap are kept, the argon is a charge
  assert.deepEqual(ids(by(GROW, 'vuv_caf2').kept), ['gtceu:lead_fluoride_dust']);
  assert.deepEqual(ids(by(GROW, 'thorium_caf2').kept), ['gtceu:lead_fluoride_dust']);
  assert.deepEqual(ids(by(GROW, 'inp').kept), ['gtceu:boron_trioxide_dust']);
  for (const r of GROW) assert.deepEqual(ids(r.charge), ['gtceu:argon'], r.name);
  // the boules that need cutting are cut, and nothing else is cut from them
  for (const [boule, wafer] of [['grindless:lithium_niobate_boule', 'grindless:lithium_niobate_wafer'], ['grindless:inp_boule', 'grindless:inp_wafer'], ['grindless:vuv_caf2_boule', 'grindless:vuv_caf2_optic']]) {
    const cut = CUT.filter((r) => inputs(r).includes(boule));
    assert.equal(cut.length, 1, boule);
    assert.ok(outputs(cut[0]).includes(wafer) && inputs(cut[0]).includes('minecraft:water'), boule);
  }
});

test('the iridium crucible wears out 1 run in 32 and the worn one goes back to iridium in EV\'s platinum plant', () => {
  for (const r of GROW) {
    const c = r.itemsIn.find((x) => x.id === CRUCIBLE);
    const w = r.itemsOut.find((x) => x.id === WORN);
    assert.ok(c && w, r.name);
    assert.equal(c.chance, 313, `${r.name}: about 1 in 32`);
    assert.equal(w.chance, c.chance, `${r.name}: the worn crucible comes out as often as one is used up`);
  }
  assert.deepEqual(producers(CRUCIBLE).map(([w, r]) => [w.split(':')[0], r.name]), [['crystals.json', 'iridium_crucible']]);
  const made = by(ASM, 'iridium_crucible');
  const ingots = made.itemsIn.find((x) => x.id === 'gtceu:iridium_ingot').count;
  // the worn crucible is consumed only by the platinum plant row
  const users = allRows().filter(([, r]) => inputs(r).includes(WORN));
  assert.deepEqual(users.map(([w, r]) => [w.split(':')[0], r.name]), [['crystals.json', 'iridium_crucible']]);
  const back = by(PGM, 'iridium_crucible');
  const ir = back.itemsOut.find((x) => x.id === 'gtceu:iridium_dust');
  assert.ok(ir && ir.count >= 1 && ir.count <= ingots, 'iridium comes back, never more than went in');
  assert.ok(back.itemsIn.some((x) => x.id === 'grindless:platinum_electrode' && x.chance === 10), 'the plant\'s electrode wears as in its other modes');
  assert.equal(T.types.pgm_refining.keep, true, 'it refuses voiding like the plant\'s mode 4');
  assert.equal(T.types.pgm_refining.idPrefix, 'uhv/');
  // the chlorine and hydrogen leave as hydrochloric acid, 1:1:1
  const amt = (xs, id) => xs.find((x) => x.id === id).amount;
  assert.equal(amt(back.fluidsIn, 'gtceu:chlorine'), amt(back.fluidsOut, 'gtceu:hydrochloric_acid'));
  assert.equal(amt(back.fluidsIn, 'gtceu:hydrogen'), amt(back.fluidsOut, 'gtceu:hydrochloric_acid'));
  // circuit 5 is free in the plant (its modes are 1-4)
  const pps = fs.readFileSync(path.join(kube, 'server_scripts', 'grindless', 'ev', 'platinum_plant.js'), 'utf8');
  const plantCircuits = [...pps.matchAll(/const \w+_CIRCUIT = (\d+)/g)].map((m) => +m[1]);
  assert.deepEqual(plantCircuits.sort(), [1, 2, 3, 4]);
  assert.ok(!plantCircuits.includes(back.circuit));
  assert.ok(server.includes("recipe.addDataBool(keepKey, true)") && server.includes('chancedInput') && server.includes('chancedOutput'));
});

test('the furnace refuses voiding; the package registers only its own four items, never an F1 id', () => {
  assert.ok(startup.includes("CR.furnaceNoVoiding = 'grindless.machine.crystal_growth_furnace.no_voiding'"));
  assert.ok(startup.includes('G.noVoiding.beforeWorking'));
  const own = ['vuv_frequency_comb', 'vuv_caf2_optic', 'iridium_crucible', 'worn_iridium_crucible'];
  for (const n of own) assert.ok(startup.includes(`${n}: { stack:`), n);
  const foundation = fs.readFileSync(path.join(kube, 'startup_scripts', 'grindless', 'uhv', 'foundation.js'), 'utf8');
  for (const n of own) assert.ok(!foundation.includes(`'${n}'`) && !foundation.includes(`${n}:`), `${n} is not an F1 id`);
  for (const n of own) assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'item', `${n}.png`)), `${n}.png`);
  for (const m of ['nuclear_clock_lab', 'crystal_growth_furnace']) {
    for (const f of ['overlay_front.png', 'overlay_front_active.png', 'overlay_front_active_emissive.png']) {
      assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'block', 'multiblock', m, f)), `${m}/${f}`);
    }
  }
});

test('no UEV input, and every lang key is written in en_us and es_es', () => {
  const rows = Object.values(T.types).flatMap((t) => t.recipes);
  for (const r of rows) for (const id of inputs(r).concat(outputs(r))) assert.ok(!/(^|[:_/])uev(_|$)/.test(id.split(':')[1] || ''), `${r.name}: ${id}`);
  const keys = [];
  for (const t of Object.values(T.types)) if (t.dataKey) for (const r of t.recipes) keys.push(`gtceu.recipe.${t.dataKey}.${r.name}`);
  for (const m of ['nuclear_clock_lab', 'crystal_growth_furnace']) {
    keys.push(`block.gtceu.${m}`);
    keys.push(`grindless.machine.${m}.tooltip.0`);
  }
  keys.push('gtceu.nuclear_clock', 'gtceu.crystal_growth', 'grindless.machine.crystal_growth_furnace.no_voiding');
  for (const n of ['vuv_frequency_comb', 'vuv_caf2_optic', 'iridium_crucible', 'worn_iridium_crucible']) keys.push(`item.grindless.${n}`, `tooltip.grindless.${n}.0`, `tooltip.grindless.${n}.1`);
  const str = "'(?:[^'\\\\]|\\\\.)+'";
  for (const k of keys) {
    // [key, en, es]: two non-empty strings follow the key
    const re = new RegExp(`\\['${k.replace(/\./g, '\\.')}',\\s*${str},\\s*${str}\\]`);
    assert.ok(re.test(lang), k);
  }
});
