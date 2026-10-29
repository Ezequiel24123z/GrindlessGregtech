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
- LuV 0/21, ZPM 0/27, launch_road and power 0: done in QR-S2 (all pass the gate without baseline entries).
- UV 1/33: only the ZPM `ice_giant_siphon` (`zpm/uranus.js`, 7x7x13 pressure-hull box, gate attributes it to `uv/neptune.js:130`) is left; QR-S3 did the other 30 uv/ structures.
- UHV 30/32: `xenoflora_rover_bay`, `biomining_heap`, `zblan_draw_tower`, `positron_accumulator`, `warp_gate`.
- UEV, UIV: almost all are hollow 5x5x7 / 7x7x7 single-casing boxes (`uev/*.js` shell helpers: `megabar`, `sirius`, `composites`,
  `electron_beam`, `earth_orbit`, `alpha_centauri`, `photonics`; `uiv/beuv_stm.js:53`, `matrioshka.js:83`, `tfln_femtosecond.js:65`,
  `j0437.js:67`). Redesign with a shared per-era shell helper mixing frame posts, glass bands, pipes/coils and a second casing.

### QR-S2 release notes (reshaped structures; shape changes, same ids, no registrations removed)

Size changed: `ion_implanter` 3x3x11 -> 5x5x15 (beamline hall); `direct_energy_converter` 9x5x5 -> 9x6x7.
Same WxHxD, new layout (frame posts, glass bands, pipes/coils, second casing; `neutrino_observatory` is now an octagonal drum in its 15x15x15 box):
- LuV: `wake_shield_facility` 9x9x4, `microgravity_smelter` 3x9x7, `coilgun_launcher` 8x5x37 (coil ring every 3rd ring), `gravitational_wave_detector` 33x5x33,
  `orbital_solar_station` 19x3x9, `algae_bioreactor` 5x13x5, `biofoundry` 9x6x9, `mega_chemical_complex` 15x15x15, `zero_g_crystal_grower` 5x5x5,
  `asteroid_processor` 9x6x5.
- launch_road / power: `composite_autoclave` 5x7x4 (casing min 50 -> 40), `generator_array` 9x4x3.
- ZPM: `waste_retrieval_plant` and `actinide_partitioning_plant` 7x5x7, `vent_bioreactor` 5x7x5, `aerogel_works` 5x5x5, `assembly_hall` 11x9x12,
  `diamond_lattice_fab` 5x5x5, `qubit_fab` 5x5x9, `plasma_quench_caster` 5x7x5, `naquadria_magnet_works` 7x5x7, `naquadria_refinery` 7x11x7,
  `naquadah_fuel_works` 5x7x5, `entry_probe_bay` 7x5x9, `tholin_reformer` 5x7x5, `slurry_separator` 5x5x7, `flyby_probe_bay` 7x5x9,
  `gas_giant_siphon` 7x7x11, `isotope_column` 5x5x15, `ring_harvester` 9x3x9, `neutrino_observatory` 15x15x15, `kuiper_survey_telescope` 5x11x5,
  `plume_sampler` 7x5x7, `ring_seismometer` 5x5x5.
First-met blocks: no new block types; only blocks already obtainable in their era (glass, frames, pipe casings, coil blocks, gearboxes, stable/frostproof casings,
`grindless:station_truss_casing`, `probe_bay_casing`, `pressure_hull_casing`).

### QR-S3 release notes (UV structures; same ids, same WxHxD, new layout; no registrations removed)

Frame posts and roof edges, window bands, pipe/coil/second-casing bands; the controller, hatch cells and abilities are unchanged. Casing minimums
are unchanged except `mega_factory`, whose casing count is computed from the shell cells that remain casing (still shell cells minus 24 parts).
- `mega_factory` 15x12x21, `laser_fusion_chamber` 13x13x13, `neptune_deep_siphon` 7x15x7, `triton_geyser_sampler` 7x7x7, `synchrotron` 23x5x23,
  `muon_fusion_cell` 9x11x9, `antimatter_trap` 5x5x9.
- `superfluid_helium_plant`, `srf_cavity_works` 7x7x9; `zone_refining_tower` 3x13x3; `optical_ground_station` 9x9x9; `precursor_probe_bay` 7x7x11;
  `event_horizon_interferometer` 9x5x9; `kuiper_interceptor_bay` 7x7x9; `amorphous_ice_annealer` 5x7x5; `heat_source_works` 5x5x7;
  `neural_culture_vat` 7x7x7; `boron_nitride_reactor` 7x7x9; `powder_in_tube_line` 3x5x15; `powder_bed_printer` 7x7x7;
  `penetrator_probe_bay` 7x9x7; `volatile_ice_fractionator` 7x7x7; `cryotank_winder`, `thruster_works` 7x7x9; `starchip_fab` 5x5x5; `light_sail_fab` 7x7x7;
  `accelerator_driven_reactor` 11x13x11; `pyroprocessing_cell` 7x7x7; `fibre_draw_tower` 5x15x5; `mocvd_reactor` 7x7x7.
First-met blocks in UV structures: no new block types. Blocks first used in a UV structure (already obtainable earlier): `gtceu:fusion_glass`,
`gtceu:laminated_glass`, `gtceu:tungsten_steel_frame`/`titanium_frame`/`stainless_steel_frame`, `gtceu:tungstensteel_pipe_casing`, `gtceu:ptfe_pipe_casing`,
`gtceu:steel_pipe_casing`, `gtceu:naquadah_coil_block`, `gtceu:superconducting_coil`, `gtceu:heatproof_machine_casing`, `gtceu:frostproof_machine_casing`,
`gtceu:filter_casing`, `grindless:pressure_hull_casing`, `grindless:cryostat_casing`.

Process for each: redesign the spec, run `--static --check`, lower the baseline, update its T1 overlay test; from the next tier on
every new structure must pass the gate without a baseline entry.
