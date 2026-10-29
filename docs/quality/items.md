# Items and processes audit (QR-D0)

Static audit of every item, fluid, machine and recipe type that Grindless registers, against the native recipe dump. It answers the owner's complaints: uncraftable objects in EMI, machines with no information, and invisible processes.

- Tool: `node tools/analysis/process-audit.mjs` (`lib/process_audit.mjs`, tests in `test/process-audit.test.mjs`).
- Inputs: a native dump (`--dump <dir>`, or the path in `tools/analysis/out/latest.txt`) and a registry cache built from the pack's startup scripts (`--make-registry`, about 6 minutes, written to `tools/analysis/out/registry.json`, gitignored).
- Baseline: `tools/analysis/process_audit.json` lists the 112 findings known when QR-D0 ran. The tool exits 1 only for findings not in it. Fix a finding, then delete its key.
- "Ours" = registered items, blocks, fluids and machines, every `grindless:` id in the dump, and forms of registered materials. Exempt from `uncraftable`: buckets, flowing fluids, ores and fluids of veins, ids in `tiers/obtain.json` `obtain.world`, ids named by quests or `emi_coverage.json` end products.

## Result

| Kind | Count | Meaning |
|---|---|---|
| uncraftable | 0 | Registered, not obtainable (after exemptions). The owner's "objetos incrafteables" are buckets, flowing fluids and vein ores, which are gathered through other means; none else remain. |
| no_use | 5 | No recipe consumes it and it has no end-product exemption |
| byproduct_no_destination | 0 | Secondary output nothing uses |
| machine_no_craft | 16 | Machine item without a craft recipe |
| machine_empty_type | 39 | Machine whose recipe types have 0 recipes |
| type_empty | 20 | Recipe type with 0 recipes |
| machine_no_info | 1 | Machine without tooltip or EMI page |
| m_info_missing / generic / empty | 216 / 1 / 0 | M-INFO: multiblock with no info page / special-purpose with a shared page only / EMI would stay empty (see below) |
| hidden_with_recipes | 1 | Hidden by index only, yet has recipes |
| self_gain | 3 | Output exceeds what the same recipe consumes (principle 8) |
| trivial_step | 27 | Item or fluid made only by a 1-in 1-out recipe with no conditions |

Checked on the dump: `gtceu:lv_chemical_reactor` (type `gtceu:chemical_reactor`) and `gtceu:lv_horizon_collector` (type `gtceu:horizon_collection`) are not in `machine_empty_type`, so their types have recipes. The horizon collector is quest-given (`obtain.json` world item `horizon-collector-quest`; page `steam_horizon_collector.json`). If EMI still shows them empty in game, the cause is client-side (recipe viewer category or page), not missing recipes. A native check belongs to QR-A0's EMI coverage work.

## Backlog by era

Era is taken from the registering script's `grindless/<era>/` folder.

### Blocker-level (principle 8: energy or matter from nothing)
- **uhv** `grindless:silicon_carbide/sic_epi`: 2000 mB hydrogen in, 2800 out. Fix: output at most the input, or add the missing reagent as input.
- **zpm / uv** `grindless:closed_ecosystem/culture_seed`: 1 culture in, 2 out (algae and archaeal cultures). Intended as replication? If yes, state it in the page and require a nutrient input that is consumed; if not, output 1.

### no_use (items nothing consumes)
Ore indicators, one per vein: `gtceu:merrillite_indicator` (ev), `iridosmine_indicator` (iv), `meteoric_iron_indicator` and `tetrataenite_indicator` (luv), `deuterium_rich_ice_indicator` (mars). **Resolved (integrator, wave 1):** these are GTM surface-rock indicators, generated for every ore material and used by no GTM recipe by design (rule 6); `gtceu:*_indicator` is in `process_audit.json` `options.ignore`.

### hidden_with_recipes
- **hv** `grindless:vein_sample_scheelite`: hidden from the index yet 1 recipe uses it. Add the item to `grindless:hidden_with_recipes` or drop the recipe. **QR-R1: kept on purpose.** The recipe is the old-save conversion into the empty vein probe (`keepRecipes: true` in hidden_until.json); hiding it with the tag would hide that recipe. The audit row was a false positive: **allowlisted** in `process_audit.json` `options.ignore` (integrator, wave 1). The trivial_step rows below are all UV and later, none in steam to ev.

### machine_no_info
- **iv** `gtceu:ev_rtg`: no tooltip and no EMI page. Add `grindless.machine.ev_rtg.tooltip.N` or a page. **Fixed (QR-I1): own EMI info page.**

### Machines with 0-recipe types or no craft recipe (invisible processes)
Per the owner: no machine may stay empty. For each, either add the recipes, or register the machine hidden (EMI `c:hidden_from_recipe_viewers`; save rule: never remove), or give it a page that states what it does.

| Machine family | Era | Empty types | Notes |
|---|---|---|---|
| `gtca:{lv..uhv}_recycler`, `gtca:{ev..uhv}_matter_amplificator` (all tiers) | steam to uv | `gtceu:recycler`, `gtceu:uu_matter_amplificator` | 16 `machine_no_craft` hits, no craft recipe and no process. Add craft recipes and recipes, or hide. |
| `gtca:ev_chemical_generator`, `gtca:iv_chemical_generator` | steam | `gtceu:chemical_generator` | Add fuels (e.g. pack chemicals) or hide. |
| `gtca:space_assembler_mk{i,ii,iii}`, `space_miner_mk*`, `space_pump_mk*` | steam | `gtceu:space_assembler`, `space_miner`, `space_pump` | Era is steam only because the registering script is shared; they are late content. |
| `gtca:green_house`, `extendedfeatures:industrial_greenhouse`, `advanced_conservatory` | steam | `gtceu:green_house`, `extendedfeatures:greenhouse_{crop,wood}_recipes` | Crop recipes absent. |
| `gtca:extreme_heat_exchanger`, `industrial_coke_oven`, `polymerizer`, `steam_pressurizer`, `shd_turbine`, `residual_decontamiant_degasser_purification_unit` | steam | the same-named types | No recipes. |
| `extendedfeatures:{rock_processing_plant,synthesis_vessel,universal_disassembly_machine}` | steam | `chemical_skips`, `component_disassembly`, `machine_disassembly`, `rock_processing_plant` | No recipes. |
| `gtnn:homemade_bedrock_ore_machine` | steam | `gtceu:homemade_bedrock_ore_machine` | No recipes. |
| `gtnn:uv_naquadah_reactor` | zpm | (type has recipes) | No craft recipe (machine_no_craft). |

These ids come from the dump, not an assumption: `type_empty` lists exactly 20 recipe types.

#### QR-X1 decisions (addon machines with no role)

All 55 machines were checked against `data/grindless/tables/hidden_until.json` (group `until: never`, so both tags `c:hidden_from_recipe_viewers` and `grindless:hidden_with_recipes` apply: out of the EMI index and every recipe with them gone), `integration/gtca.js`, `extendedfeatures.js` and `gtnn.js` (their craft recipes and every recipe of their types are removed on the server). Every one is decision **(b) hide**: nothing is craftable and no process is left invisible, because the empty types have no machine a player can obtain, and EMI drops an empty category. Nothing is unregistered (saves). No code change was needed. Licences (CREDITS.md): GTCA LGPL-3.0, GT-- AGPL-3.0, Extended Features: only registered ids are used, nothing is copied.

| id | decision | era | reason |
|---|---|---|---|
| `gtca:{lv..uhv}_recycler`, scrap, scrap box | hide | never | the scrap box drops a random item of the whole registry; stone to scrap at 1 EU/t |
| `gtca:{ev..uhv}_matter_amplificator` | hide | never | UU matter from scrap: matter from nothing (rule 8) |
| `gtca:{ev,iv}_chemical_generator` | hide | never | acids burn at 5-14x their cost: energy loop; GTM's generators stay |
| `gtca:space_{assembler,miner,pump}_mk{i,ii,iii}` | hide | never | elevator modules: no recipes, the test ones are removed; a future elevator era may reopen them |
| `gtca:green_house`, `extendedfeatures:{industrial_greenhouse,advanced_conservatory}` | hide | never | duplicates our greenhouse family (`gtceu:greenhouse`) with 64 crops or logs per run |
| `gtca:{polymerizer,industrial_coke_oven}` | hide | never | 17-33 % more polymer, 2-3.4x the coke products than GTM's machines: duplicates that undercut GTM |
| `gtca:steam_pressurizer` | hide | never | steam in, 2.5x the energy out: energy from nothing |
| `gtca:{extreme_heat_exchanger,shd_turbine}` | hide | never | 3.4-3.7x GTM's plasma turbine, pahoehoe lava gives metals and energy |
| `gtca:residual_decontamiant_degasser_purification_unit` | hide | never | purification unit with no recipes and no line to serve |
| `extendedfeatures:rock_processing_plant` | hide | never | metals out of plain rock past the vein drills |
| `extendedfeatures:synthesis_vessel` | hide | never | skips our platinum and naquadah plants with 2-4.5x yields |
| `extendedfeatures:universal_disassembly_machine` | hide | never | returns every ingredient of any machine, better than GTM's recycling |
| `gtnn:homemade_bedrock_ore_machine` | hide | never | ores out of stone |
| `gtnn:uv_naquadah_reactor` | hide | never | no GT-- recipe and no fuel line of ours at UV; the LuV and ZPM reactors carry the naquadah power (luv.md:1194, zpm.md:772). A UV reactor needs its own fuel design (x2 rule 8) first |

Baseline: resolved. The audit already skips machines tagged `grindless:hidden_with_recipes` in the dump (and types whose machines are all skipped); with the current dump none of the 55 machines or 20 types is in `process_audit.json`.

### trivial_step (a real process should be more than "1 in, 1 out")
Dedicated machines or conditions justify some of these; flag them to the era owner, not as bugs.
- **uiv** `gtceu:he3he3_ash`, `pli6_ash`, `pn15_ash` (direct conversion, 1 plasma to 1 ash); `annealed_neon_cone`, `bmg_flexspline`, `c12_ion_milled_plate`, `laser_heated_n2_charge`, `lonsdaleite_race`, `p_si_processor`, `polarised_li6h`, `poled_lnoi_wafer`, `six_hour_memory_slab`, `telecom_memory_slab`, `verified_crystal`.
- **uev** `cured_sic_fibre`, `green_sic_fibre`, `hftacn_powder`, `micropillar_wafer`, `sin_etched_wafer`, `strain_annealed_fe16n2_powder`.
- **uhv** `californium_252_source`, `sic_device_wafer`.
- **uv** `exposed_wafer`, `patterned_wafer`, `fibre_bragg_grating`, `laser_module_block`, `srf_cryomodule_block`.
Fix: add a second ingredient or byproduct that makes the step a real process, or merge it with its neighbour (principle 2).

## Learned, to apply from the next tier
1. Every machine needs one craft recipe, one recipe in its type, and one tooltip or page before its tier ships.
2. Register no recipe type before its first recipe exists.
3. Every recipe's output must not exceed its input in mass or energy unless a stated source feeds it.
4. Run `node tools/analysis/process-audit.mjs` after any change to a tier; it prints new findings only.

## M-INFO: multiblocks without an info page of their own

Owner rule: every multiblock controller needs an EMI info page that says what it does and what it is for; special-purpose machines (chart writers and readers, research and data machines, structure-only or dimension-locked machines, machines with hidden or synthetic recipes) need a page specific to that machine, not a shared one. Kinds: **missing** = multiblock with no info page; **generic** = special-purpose, covered only by a shared page (more than 3 machines on one page); **empty** = no visible recipe and no page, i.e. EMI would stay empty even with the EMI plugin fixed (QR-A0 Java.to bug). Current result: 0 empty, 1 generic (lv wireless_energy_tower), 216 missing (all have visible recipes, so none is blank once the plugin works). Rule: tooltips do not count; only an emi:info page listing the controller. The type shown is what the page text has to explain; Phase 2 writes the en_us and es_es text. Baselined: the audit fails only for new multiblocks. Limitation: recipes hidden by tag are not detected, so empty may under-report. **QR-I1 done: pages with en_us and es_es text for steam to IV (rows removed below); LuV and later remain.**

| id | era | script | kind | page must say (types shown) |
|---|---|---|---|---|
| gtceu:algae_bioreactor | luv | kubejs/startup_scripts/grindless/luv/europa.js:97 | missing | what it does and what for; processes gtceu:bioreactor |
| gtceu:asteroid_processor | luv | kubejs/startup_scripts/grindless/luv/asteroid_belt.js:377 | missing | what it does and what for; processes gtceu:asteroid_processing |
| gtceu:biofoundry | luv | kubejs/startup_scripts/grindless/luv/biofoundry.js:142 | missing | what it does and what for; processes gtceu:sterile_culture |
| gtceu:coated_conductor_line | luv | kubejs/startup_scripts/grindless/luv/coated_conductor_line.js:169 | missing | what it does and what for; processes gtceu:coated_conductor |
| gtceu:coilgun_launcher | luv | kubejs/startup_scripts/grindless/luv/ganymede.js:136 | missing | what it does and what for; processes gtceu:probe_launch |
| gtceu:cryobot | luv | kubejs/startup_scripts/grindless/luv/europa.js:96 | missing | what it does and what for; processes gtceu:vein_drilling |
| gtceu:flux_tube_tether | luv | kubejs/startup_scripts/grindless/luv/io_orbit.js:314 | missing | what it does and what for; processes gtceu:electrodynamic_tether |
| gtceu:fumarole_condenser | luv | kubejs/startup_scripts/grindless/luv/io_surface.js:253 | missing | what it does and what for; processes gtceu:fumarole_condensing |
| gtceu:gravitational_wave_detector | luv | kubejs/startup_scripts/grindless/luv/ganymede.js:134 | missing | what it does and what for; processes gtceu:gravitational_wave_astronomy |
| gtceu:harpoon_anchor_drill | luv | kubejs/startup_scripts/grindless/luv/asteroid_belt.js:356 | missing | what it does and what for; processes gtceu:vein_drilling |
| gtceu:helium_refrigerator | luv | kubejs/startup_scripts/grindless/luv/helium_refrigerator.js:262 | missing | what it does and what for; processes gtceu:closed_loop_cooling |
| gtceu:hts_magnet_works | luv | kubejs/startup_scripts/grindless/luv/hts_magnet_works.js:208 | missing | what it does and what for; processes gtceu:magnet_winding |
| gtceu:hydroponic_ring | luv | kubejs/startup_scripts/grindless/luv/orbital_biology.js:8 | missing | what it does and what for; processes gtceu:greenhouse |
| gtceu:mega_chemical_complex | luv | kubejs/startup_scripts/grindless/luv/mega_chemical_complex.js:34 | missing | what it does and what for; processes gtceu:large_chemical_reactor, gtceu:mega_chemical_complex |
| gtceu:microgravity_smelter | luv | kubejs/startup_scripts/grindless/luv/orbital_industry.js:56 | missing | what it does and what for; processes gtceu:microgravity_processing |
| gtceu:optical_miner | luv | kubejs/startup_scripts/grindless/luv/asteroid_belt.js:414 | missing | what it does and what for; processes gtceu:optical_mining |
| gtceu:organoid_lab | luv | kubejs/startup_scripts/grindless/luv/orbital_biology.js:8 | missing | what it does and what for; processes gtceu:organoid_assembly |
| gtceu:volcanic_intake | luv | kubejs/startup_scripts/grindless/luv/io_surface.js:271 | missing | what it does and what for; processes gtceu:volcanic_heat |
| gtceu:wake_shield_facility | luv | kubejs/startup_scripts/grindless/luv/orbital_industry.js:58 | missing | what it does and what for; processes gtceu:wake_epitaxy |
| gtceu:zero_g_crystal_grower | luv | kubejs/startup_scripts/grindless/luv/orbital_biology.js:8 | missing | what it does and what for; processes gtceu:microgravity_crystal_growth |
| gtceu:actinide_partitioning_plant | zpm | kubejs/startup_scripts/grindless/zpm/actinides.js:204 | missing | what it does and what for; processes gtceu:actinide_partitioning |
| gtceu:aerogel_works | zpm | kubejs/startup_scripts/grindless/zpm/outer_chemistry.js:50 | missing | what it does and what for; processes gtceu:supercritical_drying |
| gtceu:assembly_hall | zpm | kubejs/startup_scripts/grindless/zpm/mega_assembly_hall.js:32 | missing | what it does and what for; processes gtceu:assembler, gtceu:circuit_assembler |
| gtceu:deep_space_network | zpm | kubejs/startup_scripts/grindless/zpm/observatory.js:137 | missing | what it does and what for; processes gtceu:telemetry_decoding |
| gtceu:diamond_lattice_fab | zpm | kubejs/startup_scripts/grindless/zpm/qubits.js:44 | missing | what it does and what for; processes gtceu:diamond_cvd |
| gtceu:direct_energy_converter | zpm | kubejs/startup_scripts/grindless/zpm/fusion.js:120 | missing | what it does and what for; processes gtceu:direct_conversion |
| gtceu:entry_probe_bay | zpm | kubejs/startup_scripts/grindless/zpm/titan_probes.js:107 | missing | what it does and what for; processes gtceu:titan_entry |
| gtceu:europium_reductor | zpm | kubejs/startup_scripts/grindless/zpm/europium.js:145 | missing | what it does and what for; processes gtceu:valence_reduction |
| gtceu:flyby_probe_bay | zpm | kubejs/startup_scripts/grindless/zpm/uranus.js:113 | missing | what it does and what for; processes gtceu:outer_flyby |
| gtceu:gas_giant_siphon | zpm | kubejs/startup_scripts/grindless/zpm/saturn_siphon.js:137 | missing | what it does and what for; processes gtceu:gas_giant_siphon |
| gtceu:ice_giant_siphon | zpm | kubejs/startup_scripts/grindless/zpm/uranus.js:109 | missing | what it does and what for; processes gtceu:ice_giant_siphon |
| gtceu:ion_implanter | zpm | kubejs/startup_scripts/grindless/zpm/qubits.js:52 | missing | what it does and what for; processes gtceu:ion_implantation |
| gtceu:isotope_column | zpm | kubejs/startup_scripts/grindless/zpm/saturn_siphon.js:139 | missing | what it does and what for; processes gtceu:cryogenic_isotope_separation |
| gtceu:kuiper_survey_telescope | zpm | kubejs/startup_scripts/grindless/zpm/observatory.js:139 | missing | what it does and what for; processes gtceu:kuiper_survey |
| gtceu:methane_pyrolyser | zpm | kubejs/startup_scripts/grindless/zpm/outer_chemistry.js:36 | missing | what it does and what for; processes gtceu:methane_pyrolysis |
| gtceu:naquadah_fuel_works | zpm | kubejs/startup_scripts/grindless/zpm/naquadria.js:60 | missing | what it does and what for; processes gtceu:naquadah_fuel |
| gtceu:naquadria_magnet_works | zpm | kubejs/startup_scripts/grindless/zpm/magnet_works.js:209 | missing | what it does and what for; processes gtceu:naquadria_magnets |
| gtceu:naquadria_refinery | zpm | kubejs/startup_scripts/grindless/zpm/naquadria.js:43 | missing | what it does and what for; processes gtceu:naquadria_refining |
| gtceu:neutrino_observatory | zpm | kubejs/startup_scripts/grindless/zpm/observatory.js:135 | missing | what it does and what for; processes gtceu:neutrino_detection |
| gtceu:plasma_quench_caster | zpm | kubejs/startup_scripts/grindless/zpm/fusion.js:148 | missing | what it does and what for; processes gtceu:plasma_quench |
| gtceu:plume_sampler | zpm | kubejs/startup_scripts/grindless/zpm/saturn_science.js:101 | missing | what it does and what for; processes gtceu:plume_sampling |
| gtceu:qubit_fab | zpm | kubejs/startup_scripts/grindless/zpm/qubits.js:59 | missing | what it does and what for; processes gtceu:qubit_fabrication |
| gtceu:ring_harvester | zpm | kubejs/startup_scripts/grindless/zpm/saturn_siphon.js:141 | missing | what it does and what for; processes gtceu:ring_harvesting |
| gtceu:ring_seismometer | zpm | kubejs/startup_scripts/grindless/zpm/saturn_science.js:103 | missing | what it does and what for; processes gtceu:kronoseismology |
| gtceu:slurry_separator | zpm | kubejs/startup_scripts/grindless/zpm/uranus.js:111 | missing | what it does and what for; processes gtceu:slurry_separation |
| gtceu:tholin_reformer | zpm | kubejs/startup_scripts/grindless/zpm/titan_probes.js:109 | missing | what it does and what for; processes gtceu:tholin_reforming |
| gtceu:vent_bioreactor | zpm | kubejs/startup_scripts/grindless/zpm/outer_chemistry.js:43 | missing | what it does and what for; processes gtceu:chemosynthesis |
| gtceu:waste_retrieval_plant | zpm | kubejs/startup_scripts/grindless/zpm/actinides.js:188 | missing | what it does and what for; processes gtceu:waste_retrieval |
| gtceu:accelerator_driven_reactor | uv | kubejs/startup_scripts/grindless/uv/thorium.js:76 | missing | what it does and what for; processes gtceu:accelerator_driven |
| gtceu:amorphous_ice_annealer | uv | kubejs/startup_scripts/grindless/uv/kuiper.js:116 | missing | what it does and what for; processes gtceu:ice_annealing |
| gtceu:antimatter_trap | uv | kubejs/startup_scripts/grindless/uv/accelerators.js:96 | missing | what it does and what for; processes gtceu:antimatter_storage |
| gtceu:ark_biosphere | uv | kubejs/startup_scripts/grindless/uv/life.js:201 | missing | what it does and what for; processes gtceu:closed_ecosystem |
| gtceu:boron_nitride_reactor | uv | kubejs/startup_scripts/grindless/uv/materials.js:244 | missing | what it does and what for; processes gtceu:boron_nitride |
| gtceu:cryotank_winder | uv | kubejs/startup_scripts/grindless/uv/propulsion.js:189 | missing | what it does and what for; processes gtceu:cryotank_winding |
| gtceu:event_horizon_interferometer | uv | kubejs/startup_scripts/grindless/uv/edge.js:112 | missing | what it does and what for; processes gtceu:event_horizon_imaging |
| gtceu:fibre_draw_tower | uv | kubejs/startup_scripts/grindless/uv/photonics.js:190 | missing | what it does and what for; processes gtceu:fibre_draw |
| gtceu:heat_source_works | uv | kubejs/startup_scripts/grindless/uv/heat_sources.js:121 | missing | what it does and what for; processes gtceu:heat_source |
| gtceu:kuiper_interceptor_bay | uv | kubejs/startup_scripts/grindless/uv/kuiper.js:114 | missing | what it does and what for; processes gtceu:kuiper_intercept |
| gtceu:laser_fusion_chamber | uv | kubejs/startup_scripts/grindless/uv/fusion.js:116 | missing | what it does and what for; processes gtceu:laser_fusion |
| gtceu:laser_sail_launcher | uv | kubejs/startup_scripts/grindless/uv/starshot.js:293 | missing | what it does and what for; processes gtceu:laser_sail_launch |
| gtceu:light_sail_fab | uv | kubejs/startup_scripts/grindless/uv/starshot.js:263 | missing | what it does and what for; processes gtceu:light_sail |
| gtceu:mocvd_reactor | uv | kubejs/startup_scripts/grindless/uv/photonics.js:205 | missing | what it does and what for; processes gtceu:mocvd |
| gtceu:muon_fusion_cell | uv | kubejs/startup_scripts/grindless/uv/accelerators.js:84 | missing | what it does and what for; processes gtceu:muon_catalysed_fusion |
| gtceu:neptune_deep_siphon | uv | kubejs/startup_scripts/grindless/uv/neptune.js:96 | missing | what it does and what for; processes gtceu:ice_giant_siphon |
| gtceu:neural_culture_vat | uv | kubejs/startup_scripts/grindless/uv/life.js:216 | missing | what it does and what for; processes gtceu:neural_culture |
| gtceu:optical_ground_station | uv | kubejs/startup_scripts/grindless/uv/detectors.js:179 | missing | what it does and what for; processes gtceu:optical_downlink |
| gtceu:penetrator_probe_bay | uv | kubejs/startup_scripts/grindless/uv/pluto_ices.js:102 | missing | what it does and what for; processes gtceu:penetrator_probe |
| gtceu:powder_bed_printer | uv | kubejs/startup_scripts/grindless/uv/materials.js:246 | missing | what it does and what for; processes gtceu:powder_bed_fusion |
| gtceu:powder_in_tube_line | uv | kubejs/startup_scripts/grindless/uv/materials.js:245 | missing | what it does and what for; processes gtceu:powder_in_tube |
| gtceu:precursor_probe_bay | uv | kubejs/startup_scripts/grindless/uv/edge.js:110 | missing | what it does and what for; processes gtceu:precursor_probe |
| gtceu:pyroprocessing_cell | uv | kubejs/startup_scripts/grindless/uv/thorium.js:65 | missing | what it does and what for; processes gtceu:pyroprocessing |
| gtceu:srf_cavity_works | uv | kubejs/startup_scripts/grindless/uv/cold.js:203 | missing | what it does and what for; processes gtceu:srf_cavity |
| gtceu:starchip_fab | uv | kubejs/startup_scripts/grindless/uv/starshot.js:278 | missing | what it does and what for; processes gtceu:starchip |
| gtceu:superfluid_helium_plant | uv | kubejs/startup_scripts/grindless/uv/cold.js:188 | missing | what it does and what for; processes gtceu:superfluid_helium |
| gtceu:synchrotron | uv | kubejs/startup_scripts/grindless/uv/accelerators.js:73 | missing | what it does and what for; processes gtceu:synchrotron |
| gtceu:thruster_works | uv | kubejs/startup_scripts/grindless/uv/propulsion.js:190 | missing | what it does and what for; processes gtceu:thruster_assembly |
| gtceu:triton_geyser_sampler | uv | kubejs/startup_scripts/grindless/uv/neptune.js:98 | missing | what it does and what for; processes gtceu:triton_plume |
| gtceu:volatile_ice_fractionator | uv | kubejs/startup_scripts/grindless/uv/pluto_ices.js:104 | missing | what it does and what for; processes gtceu:ice_fractionation |
| gtceu:zone_refining_tower | uv | kubejs/startup_scripts/grindless/uv/detectors.js:164 | missing | what it does and what for; processes gtceu:zone_refining |
| gtceu:baseline_astrometer | uhv | kubejs/startup_scripts/grindless/uhv/gate.js:50 | missing | what it does and what for; processes gtceu:baseline_astrometry |
| gtceu:betavoltaic_fab | uhv | kubejs/startup_scripts/grindless/uhv/betavoltaics.js:65 | missing | what it does and what for; processes gtceu:betavoltaic |
| gtceu:biomining_heap | uhv | kubejs/startup_scripts/grindless/uhv/proxima_ground.js:75 | missing | what it does and what for; processes gtceu:biomining |
| gtceu:cold_trap_drill | uhv | kubejs/startup_scripts/grindless/uhv/proxima_ground.js:63 | missing | what it does and what for; processes gtceu:cold_trap_drilling |
| gtceu:crystal_growth_furnace | uhv | kubejs/startup_scripts/grindless/uhv/crystals.js:73 | missing | what it does and what for; processes gtceu:crystal_growth |
| gtceu:high_flux_reactor | uhv | kubejs/startup_scripts/grindless/uhv/transcurium.js:60 | missing | what it does and what for; processes gtceu:high_flux_irradiation |
| gtceu:mbe_reactor | uhv | kubejs/startup_scripts/grindless/uhv/photonics.js:75 | missing | what it does and what for; processes gtceu:molecular_beam_epitaxy |
| gtceu:nuclear_clock_lab | uhv | kubejs/startup_scripts/grindless/uhv/crystals.js:63 | missing | what it does and what for; processes gtceu:nuclear_clock |
| gtceu:organoid_array | uhv | kubejs/startup_scripts/grindless/uhv/wetware.js:118 | missing | what it does and what for; processes gtceu:organoid_computing |
| gtceu:pbo_plant | uhv | kubejs/startup_scripts/grindless/uhv/elevator.js:181 | missing | what it does and what for; processes gtceu:pbo_synthesis |
| gtceu:photonic_foundry | uhv | kubejs/startup_scripts/grindless/uhv/photonics.js:86 | missing | what it does and what for; processes gtceu:photonic_foundry |
| gtceu:positron_accumulator | uhv | kubejs/startup_scripts/grindless/uhv/antimatter.js:64 | missing | what it does and what for; processes gtceu:positron_accumulation |
| gtceu:quantum_fabricator | uhv | kubejs/startup_scripts/grindless/uhv/mega_quantum_fabricator.js:35 | missing | what it does and what for; processes gtceu:assembler, gtceu:circuit_assembler, gtceu:forming_press, gtceu:laser_engraver, gtceu:cutter |
| gtceu:radiotrophic_vat | uhv | kubejs/startup_scripts/grindless/uhv/proxima_life.js:144 | missing | what it does and what for; processes gtceu:radiotrophic |
| gtceu:regolith_excavator | uhv | kubejs/startup_scripts/grindless/uhv/mercury.js:67 | missing | what it does and what for; processes gtceu:regolith_excavation |
| gtceu:sample_receiving_facility | uhv | kubejs/startup_scripts/grindless/uhv/proxima_life.js:108 | missing | what it does and what for; processes gtceu:sample_receiving |
| gtceu:sic_device_fab | uhv | kubejs/startup_scripts/grindless/uhv/power_devices.js:62 | missing | what it does and what for; processes gtceu:silicon_carbide |
| gtceu:solar_array_fab | uhv | kubejs/startup_scripts/grindless/uhv/power_devices.js:73 | missing | what it does and what for; processes gtceu:space_photovoltaics |
| gtceu:solar_probe_bay | uhv | kubejs/startup_scripts/grindless/uhv/swarm.js:91 | missing | what it does and what for; processes gtceu:solar_probe |
| gtceu:solar_vapour_furnace | uhv | kubejs/startup_scripts/grindless/uhv/mercury.js:78 | missing | what it does and what for; processes gtceu:solar_vaporisation |
| gtceu:spark_plasma_sinterer | uhv | kubejs/startup_scripts/grindless/uhv/propulsion.js:134 | missing | what it does and what for; processes gtceu:spark_plasma_sintering |
| gtceu:swarm_control_station | uhv | kubejs/startup_scripts/grindless/uhv/swarm.js:78 | missing | what it does and what for; processes gtceu:dyson_swarm |
| gtceu:swarm_segment_foundry | uhv | kubejs/startup_scripts/grindless/uhv/swarm.js:66 | missing | what it does and what for; processes gtceu:swarm_segment |
| gtceu:tether_ribbon_works | uhv | kubejs/startup_scripts/grindless/uhv/elevator.js:196 | missing | what it does and what for; processes gtceu:tether_ribbon |
| gtceu:transuranium_facility | uhv | kubejs/startup_scripts/grindless/uhv/transcurium.js:70 | missing | what it does and what for; processes gtceu:transuranium_processing |
| gtceu:ultrapure_water_plant | uhv | kubejs/startup_scripts/grindless/uhv/betavoltaics.js:54 | missing | what it does and what for; processes gtceu:ultrapure_water |
| gtceu:warp_gate | uhv | kubejs/startup_scripts/grindless/uhv/gate.js:38 | missing | what it does and what for; processes gtceu:warp_gate |
| gtceu:xenobiochem_plant | uhv | kubejs/startup_scripts/grindless/uhv/proxima_life.js:132 | missing | what it does and what for; processes gtceu:xenobiochemistry |
| gtceu:xenobotany_greenhouse | uhv | kubejs/startup_scripts/grindless/uhv/proxima_life.js:120 | missing | what it does and what for; processes gtceu:xenobotany |
| gtceu:xenoflora_rover_bay | uhv | kubejs/startup_scripts/grindless/uhv/proxima_life.js:96 | missing | what it does and what for; processes gtceu:xenoflora_rover |
| gtceu:zblan_draw_tower | uhv | kubejs/startup_scripts/grindless/uhv/zblan.js:119 | missing | what it does and what for; processes gtceu:zblan_draw |
| gtceu:calutron | uev | kubejs/startup_scripts/grindless/uev/isotopes.js:66 | missing | what it does and what for; processes gtceu:calutron_separation |
| gtceu:electron_beam_furnace | uev | kubejs/startup_scripts/grindless/uev/electron_beam.js:74 | missing | what it does and what for; processes gtceu:electron_beam_refining |
| gtceu:entanglement_station | uev | kubejs/startup_scripts/grindless/uev/earth_orbit.js:50 | missing | what it does and what for; processes gtceu:entanglement_distribution |
| gtceu:heavy_ion_cyclotron | uev | kubejs/startup_scripts/grindless/uev/superheavy.js:61 | missing | what it does and what for; processes gtceu:heavy_ion_irradiation |
| gtceu:helium3_polariser | uev | kubejs/startup_scripts/grindless/uev/fusion.js:36 | missing | what it does and what for; processes gtceu:spin_polarisation |
| gtceu:megabar_press | uev | kubejs/startup_scripts/grindless/uev/megabar.js:45 | missing | what it does and what for; processes gtceu:megabar_synthesis |
| gtceu:photonic_integration_hall | uev | kubejs/startup_scripts/grindless/uev/photonics.js:87 | missing | what it does and what for; processes gtceu:photonic_integration |
| gtceu:quantum_gas_lab | uev | kubejs/startup_scripts/grindless/uev/earth_orbit.js:39 | missing | what it does and what for; processes gtceu:quantum_degenerate_gas |
| gtceu:recoil_separator | uev | kubejs/startup_scripts/grindless/uev/superheavy.js:66 | missing | what it does and what for; processes gtceu:recoil_separation |
| gtceu:single_crystal_foundry | uev | kubejs/startup_scripts/grindless/uev/electron_beam.js:84 | missing | what it does and what for; processes gtceu:single_crystal_casting |
| gtceu:snspd_foundry | uev | kubejs/startup_scripts/grindless/uev/photonics.js:65 | missing | what it does and what for; processes gtceu:snspd_fabrication |
| gtceu:superheavy_chemistry_lab | uev | kubejs/startup_scripts/grindless/uev/superheavy.js:71 | missing | what it does and what for; processes gtceu:superheavy_chemistry |
| gtceu:uev_fusion_reactor | uev | kubejs/startup_scripts/grindless/uev/fusion.js:37 | missing | what it does and what for; processes gtceu:fusion_reactor |
| gtceu:vdw_stacker | uev | kubejs/startup_scripts/grindless/uev/photonics.js:76 | missing | what it does and what for; processes gtceu:vdw_assembly |
| gtceu:beuv_scanner | uiv | kubejs/startup_scripts/grindless/uiv/beuv_stm.js:53 | missing | what it does and what for; processes gtceu:beuv_lithography |
| gtceu:crust_lift | uiv | kubejs/startup_scripts/grindless/uiv/rx_j1856.js:64 | missing | what it does and what for; processes gtceu:crust_lifting |
| gtceu:decay_heat_vault | uiv | kubejs/startup_scripts/grindless/uiv/rx_j1856.js:91 | missing | what it does and what for; processes gtceu:decay_heat |
| gtceu:droplet_radiator_works | uiv | kubejs/startup_scripts/grindless/uiv/matrioshka.js:83 | missing | what it does and what for; processes gtceu:droplet_radiator_assembly |
| gtceu:femtosecond_writer | uiv | kubejs/startup_scripts/grindless/uiv/tfln_femtosecond.js:65 | missing | what it does and what for; processes gtceu:femtosecond_writing |
| gtceu:levitation_melter | uiv | kubejs/startup_scripts/grindless/uiv/levitation_melter.js:46 | missing | what it does and what for; processes gtceu:levitation_melting |
| gtceu:matrioshka_computer | uiv | kubejs/startup_scripts/grindless/uiv/matrioshka.js:75 | missing | what it does and what for; processes gtceu:matrioshka_computing |
| gtceu:millikelvin_cryostat_works | uiv | kubejs/startup_scripts/grindless/uiv/memories_cryostat.js:57 | missing | what it does and what for; processes gtceu:nuclear_demagnetisation |
| gtceu:neutron_drip_separator | uiv | kubejs/startup_scripts/grindless/uiv/rx_j1856.js:70 | missing | what it does and what for; processes gtceu:neutron_drip_separation |
| gtceu:neutronium_cage | uiv | kubejs/startup_scripts/grindless/uiv/rx_j1856.js:77 | missing | what it does and what for; processes gtceu:neutronium_caging |
| gtceu:positronium_condensate_lab | uiv | kubejs/startup_scripts/grindless/uiv/j0437.js:67 | missing | what it does and what for; processes gtceu:positronium_condensation |
| gtceu:pulsar_wind_trap | uiv | kubejs/startup_scripts/grindless/uiv/j0437.js:59 | missing | what it does and what for; processes gtceu:pulsar_wind_trapping |
| gtceu:r_process_decompressor | uiv | kubejs/startup_scripts/grindless/uiv/rx_j1856.js:83 | missing | what it does and what for; processes gtceu:r_process_decompression |
| gtceu:ramp_compression_pulser | uiv | kubejs/startup_scripts/grindless/uiv/metallic_hydrogen.js:50 | missing | what it does and what for; processes gtceu:ramp_compression |
| gtceu:spectral_hole_burner | uiv | kubejs/startup_scripts/grindless/uiv/memories_cryostat.js:51 | missing | what it does and what for; processes gtceu:spectral_hole_burning |
| gtceu:stm_lithography_cell | uiv | kubejs/startup_scripts/grindless/uiv/beuv_stm.js:58 | missing | what it does and what for; processes gtceu:stm_lithography |
| gtceu:tfln_fab | uiv | kubejs/startup_scripts/grindless/uiv/tfln_femtosecond.js:60 | missing | what it does and what for; processes gtceu:ion_slicing |
| gtceu:xray_pulse_profiler | uiv | kubejs/startup_scripts/grindless/uiv/j0437.js:75 | missing | what it does and what for; processes gtceu:xray_pulse_profiling |
| gtceu:composite_autoclave | launch_road | kubejs/startup_scripts/grindless/launch_road/composite_autoclave.js:89 | missing | what it does and what for; processes gtceu:composite_curing |
| gtceu:engine_test_stand | launch_road | kubejs/startup_scripts/grindless/launch_road/engine_test_stand.js:106 | missing | what it does and what for; processes gtceu:static_fire |
| gtceu:lunar_drill | moon | kubejs/startup_scripts/grindless/moon/lunar_drill.js:91 | missing | what it does and what for; processes gtceu:lunar_drilling |
| gtceu:optical_observatory | observatory | kubejs/startup_scripts/grindless/observatory/machines.js:225 | missing | what it does and what for; processes gtceu:astrophotography |
| gtceu:radio_telescope | observatory | kubejs/startup_scripts/grindless/observatory/machines.js:240 | missing | what it does and what for; processes gtceu:radio_astronomy |
| gtceu:steam_observatory | observatory | kubejs/startup_scripts/grindless/observatory/machines.js:208 | missing | what it does and what for; processes gtceu:stargazing |
| gtceu:generator_array | power | kubejs/startup_scripts/grindless/power/generator_array.js:96 | missing | what it does and what for; processes gtceu:steam_turbine, gtceu:combustion_generator, gtceu:gas_turbine |
