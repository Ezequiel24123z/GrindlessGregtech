// The LuV quest chapter (luv_age, LuV-C2): generated from tools/quests/luv-chapter, never names an id that isn't registered, and only
// shows the quests of packages that have landed (docs/quests.md, section 14; docs/eras/luv.md, "Quests").
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const read = (p) => fs.readFileSync(path.join(root, ...p.split('/')), 'utf8');
const chapterPath = 'pack/config/ftbquests/quests/chapters/luv_age.snbt';
const gen = path.join(root, 'tools', 'quests', 'gen-chapters.mjs');
const { QUESTS, LANDED, PACKAGES } = await import('../../quests/luv-chapter/quests-data.mjs');

// Ids of GTM 7.5.3, its addons and GCYR that the chapter uses, each checked against the native registry dump
// (power-quests-1/results/server/kubejs-exported/items.json, gg-items-1) on 2026-10-26.
const NATIVE = new Set([
  'gtceu:luv_electric_motor', 'gtceu:luv_electric_pump', 'gtceu:luv_sensor', 'gtceu:luv_emitter', 'gtceu:luv_mixer',
  'gtceu:osmiridium_ingot', 'gtceu:osmiridium_dust', 'gtceu:indium_tin_barium_titanium_cuprate_dust', 'gtceu:indium_dust',
  'gtceu:nickel_dust', 'gtceu:superconducting_coil', 'gtceu:epoxy_bucket',
  'gtceu:naquadah_coil_block', 'gtceu:enriched_naquadah_oxide_mixture_dust', 'gtceu:enriched_naquadah_sulfate_dust',
  'gtceu:trinium_sulfide_dust', 'gtceu:fluorine_bucket', 'gtceu:hot_trinium_ingot', 'gtceu:trinium_ingot', 'gtceu:zinc_dust',
  'gtnn:luv_naquadah_reactor', 'gtceu:long_enriched_naquadah_rod', 'gtceu:luv_parallel_hatch', 'gtceu:liquid_nitrogen_bucket',
  'gtceu:gelatin_dust', 'gtceu:agar_dust', 'minecraft:bone', 'gcyr:space_station_packager', 'gcyr:space_station_package',
  'gcyr:photovoltaic_cell', 'gtceu:normal_optical_pipe', 'gtceu:uhpic_wafer',
  'gtceu:indium_gallium_phosphide_dust', 'gtceu:sapphire_dust', 'gtceu:luv_fusion_reactor', 'gtceu:luv_energy_input_hatch',
  'gtceu:europium_ingot', 'gtceu:data_bank', 'gtceu:high_performance_computation_array', 'gtceu:research_station',
  'gtceu:data_orb', 'gcyr:elite_rocket_motor', 'gtceu:platinum_group_sludge_dust', 'gtceu:iridium_dust', 'gtceu:osmium_dust',
  'gtceu:carbon_monoxide_bucket', 'gtceu:carbon_dioxide_bucket', 'gtceu:germanium_dust', 'gtceu:bacteria_bucket',
  'gtceu:sterilized_growth_medium_bucket', 'gtceu:stem_cells', 'gtceu:neuro_processing_unit', 'gtnn:circuit_assembly_line',
  'gtceu:wetware_processor', 'gtceu:zpm_machine_hull', 'gtceu:zpm_energy_input_hatch',
  'gtceu:polytetrafluoroethylene_ingot',
  // the circuit and machine quests now in this chapter (the former luv_circuits and luv_machines)
  'gtceu:luv_circuit_assembler', 'gtceu:raw_crystal_chip', 'gtceu:engraved_crystal_chip', 'gtceu:crystal_cpu', 'gtceu:crystal_soc',
  'gtceu:crystal_processor', 'gtceu:crystal_processor_assembly', 'gtceu:wetware_processor_assembly', 'gtceu:quarktech_chestplate',
  'ae2:quantum_link', 'ae2:quantum_ring', 'minecraft:writable_book',
  // MEGA-track controller, registered by its own package (obtain dump 20261028-120239)
  'gtceu:mega_chemical_complex',
  // this pack's own, registered before LuV (same dump; gtceu:ev_rtg is IV's RTG Cell, startup_scripts/grindless/iv/travel_network.js)
  'grindless:outer_system_chart', 'grindless:sagittarius_a_star_signal', 'gtceu:ev_rtg',
  // QUEST-LOW (#294): GTM's and the addons' multiblocks the chapter now teaches (ids from the Multiblocks chapter, which takes them
  // from the batch dump 5d57213f3b83)
  'gtceu:power_substation', 'gtceu:active_transformer', 'gtceu:plasma_large_turbine', 'gtceu:luv_large_miner',
  'gtceu:ev_fluid_drilling_rig', 'gtnn:large_dehydrator', 'gtceu:large_mixer', 'gtca:advanced_ebf', 'gtca:comet',
  // D2-QUESTS-LUV (#386): the process rows (Mond, coated-conductor tape, PEDOT:PSS and MEA, germanium, ZBLAN); GTM's and this pack's
  // ids registered outside luv/foundation.js, each checked against the batch dump fcbb1d552d77 (items.json) on 2026-11-03
  'gtceu:large_chemical_reactor', 'gtceu:distillation_tower', 'gtceu:iron_dust', 'gtceu:crude_metal_carbonyl_bucket',
  'gtceu:nickel_tetracarbonyl_bucket', 'gtceu:iron_pentacarbonyl_bucket', 'gtceu:nickel_tungsten_dust',
  'grindless:textured_nickel_tungsten_tape', 'grindless:seeded_tape', 'grindless:barrier_tape', 'grindless:buffered_tape',
  'grindless:coated_tape', 'grindless:capped_tape', 'gtceu:thiophene_bucket', 'gtceu:tetrabromothiophene_dust',
  'gtceu:dibromothiophene_bucket', 'gtceu:dimethoxythiophene_bucket', 'gtceu:edot_bucket', 'gtceu:polystyrene_sulfonate_bucket',
  'gtceu:pedot_pss_bucket', 'grindless:pedot_microelectrode_array', 'gtceu:germanium_tetrachloride_bucket', 'gtceu:extraction_cascade',
  'gtceu:pure_germanium_tetrachloride_bucket', 'gtceu:germanium_dioxide_dust', 'grindless:germanium_boule', 'grindless:germanium_wafer',
  'gtceu:zirconium_tetrafluoride_dust', 'gtceu:fluorspar_kiln', 'gtceu:barium_fluoride_dust', 'gtceu:lanthanum_fluoride_dust',
  'gtceu:zblan_dopant_blend_dust',
]);
// dimensions that exist without LuV-B1 (GCYR's own)
const NATIVE_DIMENSIONS = new Set(['gcyr:overworld_orbit']);

// what this pack's startup scripts register (checked here from the sources, not from memory)
function registered() {
  const ids = new Set();
  const foundation = read('pack/kubejs/startup_scripts/grindless/luv/foundation.js');
  for (const block of ['ITEMS', 'BLOCKS']) {
    const body = foundation.slice(foundation.indexOf(`const ${block} = {`), foundation.indexOf('}\n\n', foundation.indexOf(`const ${block} = {`)));
    for (const m of body.matchAll(/^\s+([a-z_]+): \{/gm)) ids.add('grindless:' + m[1]);
  }
  for (const m of foundation.matchAll(/'(gtceu:[a-z_]+)'/g)) ids.add(m[1]);
  const luvDir = path.join(root, 'pack', 'kubejs', 'startup_scripts', 'grindless', 'luv');
  for (const f of fs.readdirSync(luvDir)) {
    const s = fs.readFileSync(path.join(luvDir, f), 'utf8');
    for (const m of s.matchAll(/create\('([a-z_]+)', 'multiblock'\)/g)) ids.add('gtceu:' + m[1]);
    // machine ids the scripts name in a constant (E.cryobot = 'gtceu:cryobot', var DRILL = 'gtceu:harpoon_anchor_drill', ...)
    for (const m of s.matchAll(/(?:=|:)\s*'(gtceu:[a-z_]+)'/g)) ids.add(m[1]);
    // blocks made with a spec object: `id: 'grindless:x'` ... `event.create(T.tank.id, ...)`
    if (/event\.create\([A-Za-z.]+\.id,/.test(s)) for (const m of s.matchAll(/\bid: '(grindless:[a-z_]+)'/g)) ids.add(m[1]);
    for (const m of s.matchAll(/names = \[([^\]]+)\]/g)) for (const n of m[1].matchAll(/'([a-z_]+)'/g)) ids.add('gtceu:' + n[1]);
  }
  const industry = read('pack/kubejs/startup_scripts/grindless/luv/orbital_industry.js');
  for (const m of industry.matchAll(/'(microgravity_smelter|wake_shield_facility)'/g)) ids.add('gtceu:' + m[1]);
  const wireless = JSON.parse(read('pack/kubejs/data/grindless/tables/wireless_energy.json'));
  for (const t of wireless.tiers) {
    ids.add(t.cell);
    for (const kind of ['energy', 'dynamo']) {
      ids.add(`gtceu:${t.name}_wireless_${kind}_hatch`);
      ids.add(`grindless:${t.name}_wireless_${kind}_cover`);
    }
  }
  // A1's GT materials: dust forms (foundation.js registers them with .dust() or .ingot())
  for (const m of foundation.matchAll(/event\.create\(LUVF\.materials\.([a-zA-Z]+)\)\s*\n\s*\.(dust|ingot)\(\)/g)) {
    const name = /([a-zA-Z]+): '([a-z_]+)'/g;
    for (const n of foundation.matchAll(name)) if (n[1] === m[1]) ids.add('gtceu:' + n[2] + '_dust');
  }
  return ids;
}

function parseChapter(text) {
  const items = [...text.matchAll(/item: "([^"]+)"/g)].map((m) => m[1]);
  const icons = [...text.matchAll(/icon: "([^"]+)"/g)].map((m) => m[1]);
  const dims = [...text.matchAll(/dimension: "([^"]+)"/g)].map((m) => m[1]);
  const ids = [...text.matchAll(/\bid: "([0-9A-F]{16})"/g)].map((m) => m[1]);
  return { items, icons, dims, ids };
}

test('luv_age.snbt is what the shared writer makes from the data', () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'luv_age_'));
  const r = spawnSync(process.execPath, [gen, '--era', 'luv', '--out', out], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const made = fs.readFileSync(path.join(out, 'luv_age.snbt'), 'utf8');
  const legacy = path.join(root, 'pack', 'config', 'ftbquests', 'quests', 'chapters', 'luv_circuits.snbt');
  if (fs.existsSync(legacy)) {
    // the book still holds the pre-QB-0 split (luv_age + luv_circuits + luv_machines): until the integrator regenerates it, the
    // merged chapter must hold exactly the quests of the three
    const dir = path.dirname(legacy);
    const questIds = (text) => [...text.slice(Math.max(0, text.indexOf('\n\tquests: ['))).matchAll(/^\t\t\tid: "([0-9A-F]{16})"/gm)].map((m) => m[1]);
    const old = ['luv_age', 'luv_circuits', 'luv_machines'].filter((n) => fs.existsSync(path.join(dir, n + '.snbt')))
      .flatMap((n) => questIds(fs.readFileSync(path.join(dir, n + '.snbt'), 'utf8')));
    const now = new Set(questIds(made));
    for (const id of old) assert.ok(now.has(id), `quest ${id} of the split chapters is missing from the merged luv_age`);
  } else {
    assert.equal(made, read(chapterPath), 'regenerate: node tools/quests/gen-chapters.mjs --era luv');
  }
  fs.rmSync(out, { recursive: true, force: true });
});

test('the finished chapter (every package) also generates', () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'luv_age_all_'));
  const r = spawnSync(process.execPath, [gen, '--era', 'luv', '--every-package', '--out', out], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const all = parseChapter(fs.readFileSync(path.join(out, 'luv_age.snbt'), 'utf8'));
  assert.equal(new Set(all.ids).size, all.ids.length, 'ids are unique');
  fs.rmSync(out, { recursive: true, force: true });
});

test('every item, icon and dimension in the book exists now', () => {
  const known = registered();
  const { items, icons, dims } = parseChapter(read(chapterPath));
  const missing = [...new Set([...items, ...icons])].filter((id) => !NATIVE.has(id) && !known.has(id));
  assert.deepEqual(missing, [], 'ids that nothing registers: add the package to LANDED only once it registers them');
  const datapackDims = fs.readdirSync(path.join(root, 'pack', 'kubejs', 'data', 'grindless', 'dimension'))
    .filter((f) => f.endsWith('.json')).map((f) => 'grindless:' + f.slice(0, -5));
  assert.deepEqual(dims.filter((d) => !NATIVE_DIMENSIONS.has(d) && !datapackDims.includes(d)), []);
});

test('only landed packages reach the book; ids never start with 8-F', async () => {
  const text = read(chapterPath);
  for (const p of LANDED) assert.ok(PACKAGES.includes(p), p);
  const circuits = await import('../../quests/luv-chapter/circuits-data.mjs');
  const machines = await import('../../quests/luv-chapter/machines-data.mjs');
  const all = [...QUESTS, ...circuits.QUESTS, ...machines.QUESTS];
  const shown = all.filter((q) => (q.pkg || []).every((p) => LANDED.includes(p)));
  const headings = ['The Journey', 'Circuits', 'Machines'];
  const titles = [...text.matchAll(/title: "([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(titles.slice(0, -1).sort(), [...shown.map((q) => q.title), ...headings].sort());
  for (const id of parseChapter(text).ids) assert.match(id, /^[0-7][0-9A-F]{15}$/);
});

test('the chapter is in GG_QUESTS_EXPECTED', () => {
  // the in-game counts of the merged chapter are the integrator's to set (gg_test_quests.js is not this package's); the row must exist
  const overlay = read('tools/test/overlay/kubejs/server_scripts/gg_test_quests.js');
  assert.ok(/luv_age:\s*\[(\d+),\s*(\d+)\]/.test(overlay), 'luv_age missing from GG_QUESTS_EXPECTED');
});
