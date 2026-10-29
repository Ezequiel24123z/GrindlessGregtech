# Structure quality (QR-B0)

Rubric, tooling and per-era backlog for the shape of our multiblocks. Owner's rule: a multiblock must never be a giant cube or
rectangle of one block; bigger and with many block types is welcome, boring and meaningless is not. Odd preview blocks are fine
before forming; once formed it should look good, as GregTech's own machines do.

## Tooling

- `node tools/analysis/structure-quality.mjs [--static | --dump <dir>] [--top N] [--check] [--write-baseline]`
  (`lib/structure_quality.mjs`). `--static` runs the pack scripts in Node (what T0 uses, about 80 s); `--dump` reads a server dump's
  `structures.json`. The full ranking with `file:line` is the report of `--top 0`; it is not duplicated here.
- Gate: `tools/analysis/structure_quality.json` is the baseline (violations, block types, dominant share per structure).
  `tools/analysis/test/structure-quality.test.mjs` fails only on a new or worsened violation, and on any new `const` inside a loop
  in `startup_scripts`. A redesign lowers its entry: rewrite the baseline with `--static --write-baseline`.
- Metrics per structure: bounding box, filled cells, distinct primary blocks, dominant block and its share, solid cuboid, hollow
  box, mono-block, functional detail (glass, pipe, frame, coil, machine). A space in a spec means "any block", so it counts as empty.

## Rubric (violations the gate reports)

| Code | Rule |
|---|---|
| solid-cuboid | No filled box. Cavities, shafts, halls or stepped silhouettes. |
| mono-block | No structure of a single block type and no hollow box of one casing. |
| dominant-share | No block above 70% of the cells (structures of 30+ cells). |
| few-block-types | At least 3 distinct blocks (casing, frames, glass, pipe, coil, machine casing...). |
| no-functional-detail | At least 2 kinds of functional detail that say what the process is (glass window, pipe riser, coil band, frames, gearbox). |

Per-era guidance (not gated): size grows with the era (UV and later should not be 5x5x7 boxes); the silhouette says what the
process does (tower for columns, ring for rings, long hall for lines); parts stay reachable on the surface; the formed look needs
an `appearanceBlock` plus `workableCasingModel` overlay (active and emissive) so the controller face lights up like GTM's.
Preview suppliers: never use `Java.to(...)` in a `Predicates.custom` candidate supplier (it aborts GTM's EMI plugin); reuse
`Predicates['blocks(net.minecraft.world.level.block.Block[])'](blocks).common.get(0).candidates`.

## Finding: Rhino `const` in loops (fixed)

Rhino initialises a `const` once per function call and keeps the first iteration's value. Pattern builders that computed
`const edge = x === 0 || ...` per cell therefore collapsed to a solid block in game, while Node (T0) saw the hollow shape. Twelve
declarations in 6 files (13 structures) were changed to `var`, and the test now forbids the pattern.

## Pilots

- Large Steam family (5 controllers, `steam/large_family.js`): solid 5x5x5 cube to a boiler house: corner frames, two glass
  windows per face, a 3x3x3 hall with a steel gearbox and a bronze pipe riser. Same 5x5x5; fewer casing/part cells.
- Methane pyrolyser (`zpm/outer_chemistry.js`): plain casing column to a reactor tower: tungstensteel frame posts, nichrome coil
  bands every 4 rows, fusion-glass windows between them and a pipe riser inside. Same 3x12x3.
- Not yet proven in game: T1 forming and T3 formed/unformed screenshots (see the handoff).

## Release-note lines (shape changes; rebuild existing machines)

- Large Steam macerator, thermal centrifuge, ore washer, chemical bath and centrifuge: new hollow 5x5x5 shape (glass, gearbox,
  bronze pipe).
- Methane pyrolyser: new frame/coil/glass/pipe layout, same 3x12x3.
- QR-S1 (steam to IV): six small steam machines (boiler house, 3x3x3), coking_battery 5x4x3 -> 5x6x3, wire_works 5x4x5 (new layout), submerged_arc_furnace 3x5x3 -> 5x6x5, biorefinery 3x9x3 -> 5x10x3, four universal factories 5x3x3 -> 7x4x5, lava_furnace 3x3x3 -> 5x6x5, advanced_multi_smelter 5x3x3 -> 5x4x5, polymer_works, reformer, refinery, coil_chemical_plant, ore_refinery, sealed_dome, heavy_water_plant, fuel_fabrication_plant, mercury_vein_drill: same size, frames/glass/pipes added.
- Formed shape now matches the design (it was solid in game) for: event horizon interferometer, precursor probe bay, kuiper
  interceptor bay, amorphous ice annealer, entry probe bay, flyby probe bay, slurry separator, plume sampler, ring seismometer,
  gas giant siphon, isotope column, ring harvester, ice giant siphon.

## Backlog by era (failing / total; worst first)

- Steam 0/15, LV 0/7, MV 0/12, HV 0/6, EV 0/12, IV 0/16: done in QR-S1 (all pass the gate without baseline entries).
- LuV 10/21: `wake_shield_facility`, `coilgun_launcher`, `gravitational_wave_detector`, `orbital_solar_station`, `algae_bioreactor`.
- ZPM 24/27: `ion_implanter`, `kuiper_survey_telescope`, `flyby_probe_bay`, `neutrino_observatory` (15x15x15 near-solid),
  `aerogel_works`, `diamond_lattice_fab`, `qubit_fab`, `vent_bioreactor`.
- UV 31/33: `mega_factory` (15x12x21, 2 types), `laser_fusion_chamber`, `triton_geyser_sampler`, `powder_in_tube_line`, `zone_refining_tower`.
- UHV 30/32: `xenoflora_rover_bay`, `biomining_heap`, `zblan_draw_tower`, `positron_accumulator`, `warp_gate`.
- UEV, UIV: almost all are hollow 5x5x7 / 7x7x7 single-casing boxes (`uev/*.js` shell helpers: `megabar`, `sirius`, `composites`,
  `electron_beam`, `earth_orbit`, `alpha_centauri`, `photonics`; `uiv/beuv_stm.js:53`, `matrioshka.js:83`, `tfln_femtosecond.js:65`,
  `j0437.js:67`). Redesign with a shared per-era shell helper mixing frame posts, glass bands, pipes/coils and a second casing.

Process for each: redesign the spec, run `--static --check`, lower the baseline, update its T1 overlay test; from the next tier on
every new structure must pass the gate without a baseline entry.
