# Recipe quality ladder and audit (QR-C0)

Why: the owner found controllers and multiblock parts at UEV and similar tiers crafted at a plain crafting table. Controllers, parts and tier machines
must climb a ladder of crafting forms that gets harder with the tier. `node tools/analysis/recipe-quality.mjs` checks it, and
`tools/analysis/test/recipe-quality.test.mjs` fails on any violation outside the baseline.

## The ladder

Tier numbers: steam 0, LV 1, MV 2, HV 3, EV 4, IV 5, LuV 6, ZPM 7, UV 8, UHV 9, UEV 10, UIV 11. The tier of a recipe is its era directory (`eraTier`
in `tools/analysis/recipe_quality.json`), else the tier prefix of the output, else the highest tier among its inputs.

| Class | Tier | Required form | Code |
|---|---|---|---|
| Controller | steam-HV | crafting table allowed, but at least 1 domain input (and 5 distinct ingredients from MV) | C-DOMAIN, C-DISTINCT |
| Controller | EV-IV | assembler (or a recipe of its own line), at least 1 fluid, 2 domain inputs | C-FORM, C-FLUID, C-DOMAIN |
| Controller | LuV | assembly line, soldering alloy plus lubricant or a polymer | C-FORM, C-FLUID |
| Controller | ZPM | assembly line with scanner (or station) research | C-RESEARCH |
| Controller | UV+ | assembly line with station research, an era fluid (domain fluid, or tritanium/neutronium/quantum/... or a plasma), 3 domain inputs | C-RESEARCH, C-FLUID, C-DOMAIN |
| Part (structure block) | EV-IV | not a crafting-table recipe | P-FORM |
| Part, complex (sensor, module, cavity...) | LuV+ | assembly line | P-FORM |
| Part, bulk casing (casing, coil, glass, block, frame...) | LuV+ | assembler with an era fluid and at least one domain component | P-FORM, P-FLUID, P-DOMAIN |
| Hatch / bus | EV-IV | not crafting (assembler with a fluid at least) | H-FORM |
| Hatch / bus | LuV+ | assembly line | H-FORM |
| Single-block machine | EV-IV | not crafting; an assembler needs a fluid | S-FORM, S-FLUID |
| Single-block machine | LuV+ | assembly line | S-FORM |
| Any other item of ours (components, intermediates; addon namespaces gtca, gtnn, extendedfeatures count as ours) | IV+ | machine-made, and above the era complexity floor | C-MANUAL, C-COMPLEX |

**C-MANUAL (owner directive, from IV up).** No item or block of ours has a crafting-table recipe from IV up: controllers, casings and other structure
parts, hatches, components, intermediates. IV is machine-made (assembler with a fluid at least); the assembly line is reachable at IV here, but IV
controllers use the assembler plus fluids and from LuV the line. Exemptions, and only these: (1) basic single-block machines in GTM's hull-plus-parts
convention are judged by S-FORM instead; (2) save-compat 1:1 conversions and tier swaps of one thing (same-stem input and output); (3) unpacking and
decomposition (one distinct input, several outputs); (4) `manualIgnore` in `recipe_quality.json`, each entry justified in this document. GTM's own IV+
crafting-table controllers and parts are not changed here and are not in the baseline; the stand-in only sees recipes our scripts add, so their count
needs a native dump (see the handoff) and the integrator decides them separately.

**Complexity score (C-COMPLEX).** Per output of ours at IV+: steps from raw (depth over our recipe graph, cycles count as raw, capped at 6) + 0.5 per
distinct input (cap 8) + 0.5 per fluid (cap 2) + form bonus (assembler/machine 1, assembly line 2) + 1 for research. Floors per tier in
`complexFloor` (IV 5, LuV 6, ZPM 7, UV 7.5, UHV 8, UEV 8.5, UIV 9). Principle 2: more distinct steps and inputs count; quantity and duration do not.

All controllers (any tier from MV) need at least 5 distinct ingredients (items plus fluids).

**Domain ingredient.** An input that only our pack makes: an id registered by our startup scripts, a `grindless:` id, or an output of a recipe type we registered.
It ties the controller to the process it runs (a cryogenic plant needs night-sky radiators, an actinide plant needs the hot-cell lining) instead of being
"hull + circuits". Do not use an item the controller itself will produce (no loops).

**Soso rule (X-SOSO).** A crafting-table recipe at EV or above, with no fluid, at most 2 distinct inputs, that is not a same-stem conversion (packing,
unpacking, a tier swap of one thing) and not in `sosoIgnore`. Today it fires 0 times: the trivial table crafts at high tiers are chart copies, vein samples
and drill bits, which are exempt. It keeps the door shut for new ones.

## How the gate works

- It runs the pack's scripts in the static KubeJS stand-in (no Minecraft), and records per recipe: form (crafting / assembler / assembly_line / machine), outputs,
  items and fluids (with domain flag) and research (`data_module` condition = station, `data_stick` = scanner).
- Baseline `baseline` in `recipe_quality.json`: `"recipeId|outputId": ["CODE", ...]`. It is a ratchet: a new violation fails the test, and a fixed one
  makes its entry stale, which also fails. Fix recipes, then run `node tools/analysis/recipe-quality.mjs --write-baseline`. Never add a violation by hand.
- `--md` prints the backlog below, `--json file` the findings, `--facts file` reuses facts from a previous run (stored in `tools/analysis/out/`).
- The stand-in now records `stationResearch` / `scannerResearch` as research conditions.
- Limits: recipes in `lib/`, `integration/`, `data/` and `power/` have no era, so their tier is inferred from output/inputs. Only the crafting form is checked
  for soso. A custom multiblock is a controller only if its structure is registered; `extraControllers` lists the exceptions.

## What other packs do (research, ideas only, no code reused)

- **GTNH** (GT5-Unofficial; custom licence, reference only): LV-IV tier machines and hatches come from the Assembler, with fluids from EV (molten PTFE, glass); from LuV the Assembly Line with a
  scanned research item. `AssemblerRecipes.java:1004-1015` (HV energy hatch: hull, cable, 2 chips, 2 coils, coolant, pump), `AssemblyLineRecipes.java:611-633` (UV energy hatch:
  research = the ZPM hatch, 8 000 mB coolant, 20 ingots of Indalloy). 5-9 ingredients, 2-4 domain.
- **Monifactory** (GTCEu Modern fork): UHV and above only through `assembly_line` + `.stationResearch(researchStack(<previous-tier part>))`; UV+ forced onto living soldering alloy
  (`kubejs/server_scripts/gregtech/tiered_recipes.js:44-54`); `Post_UV_Components.js:139-150` is the UHV dynamo hatch (6-11 ingredients, 3-5 domain). Our UV+ rule matches this.
- **GregTech Leisure** (pack scripts; its core is LGPL, ideas only): hatches UHV-MAX from one loop over a tier table with station research
  (`overrides/kubejs/server_scripts/gtceu.js:994-1004`); bespoke controllers such as `magic_manufacturer` (`gtceu.js:1010-1028`) have 9-13 ingredients, 4-6 domain, three or four fluids.
  Our ladder is lighter on counts: it asks for form, research and domain, not for padding.

## Pilot (done in this package)

| Controller | Was | Now |
|---|---|---|
| `cryogenic_plant` (EV) | shaped, hull + freezer + 2 pumps + circuits | `grindless:assembler/cryogenic_plant`: + 4 night-sky radiators, 8 sintered regolith, 2 B ammonia |
| `waste_retrieval_plant`, `actinide_partitioning_plant` (ZPM) | shaped, hull + pumps + arm + circuits | `grindless:assembly_line/<machine>`: scanner research (IV hot cell for the retrieval plant, the retrieval plant for the partitioning plant; never a GTM component, whose id GTM already researches), carbon nanotube yarn, CVD diamond plate, silica aerogel, soldering alloy, lubricant |
| `electron_beam_furnace`, `single_crystal_foundry` (UEV) | shaped, hull + UV tool + circuits | `grindless:assembly_line/<machine>`: station research (UV emitter / robot arm), SRF cryomodule and cavities, neutronium gear, soldering alloy, neutronium |

No multiblock shape changed; only the recipe ids changed (`grindless:crafting/<machine>` -> `grindless:assembler/` or `grindless:assembly_line/<machine>`), and
the smoke test overlay `gg_test_cryogenic_plant.js` reads the new id. Saves are unaffected (recipes, not registrations).

## Notes against the earlier inventory

The gate does not reproduce several claims of the first inventory: only the IV and UEV parallel hatches are crafting recipes; the UIV scanners, power turbines and launch-road autoclaves
are not table-crafted in the dump in the form claimed. Trust the table below and regenerate it when in doubt.

## Backlog

Pilot added by the scope extension: `uev_parallel_hatch` (table shaped -> assembly line with station research, fluids, neutronium gear).


### steam to ev (QR-R1, done)

All 47 controller rows of steam, lv, mv, hv and ev left the baseline. Steam-HV controllers got a domain input (drill bits, electrodes, catalysts of their own line); MV and HV ones also reach 5 distinct ingredients. The EV crafting controllers moved from the crafting table to the assembler with a fluid and 2+ domain inputs; ids are now grindless:assembler/NAME (combined_cycle_plant, hot_strip_mill, atmosphere_processor, extraction_cascade, regolith_cell, sealed_dome, ev_vein_drill, lunar_drill, lunar_solar_array, deep_space_antenna). ore_refinery and platinum_plant (already assembler) gained a fluid and domain inputs. Out of scope, in iv/: grindless:assembler/ev_rtg (C-FLUID).

### iv

| Output | Class | Now | Missing | File:line |
|---|---|---|---|---|
| `grindless:platinum_gauze` | component | assembler | C-COMPLEX | iv/foundation.js:76 |
| `grindless:vein_sample_iridosmine_mercury` | component | crafting | C-COMPLEX C-MANUAL | iv/foundation.js:28 |
| `grindless:vein_sample_naquadah_venus` | component | crafting | C-COMPLEX C-MANUAL | iv/foundation.js:28 |
| `grindless:vein_sample_pitchblende_end` | component | crafting | C-COMPLEX C-MANUAL | iv/foundation.js:28 |
| `gtca:mega_lcr` | component | assembler | C-COMPLEX | integration/gtca.js:81 |
| `gtca:mega_oil_cracking_unit` | component | assembler | C-COMPLEX | integration/gtca.js:82 |
| `alloy_blast_smelter` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM | iv/mass_production.js:17 |
| `composite_autoclave` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM | launch_road/recipes.js:90 |
| `engine_test_stand` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM | launch_road/recipes.js:90 |
| `ev_rtg` | single | assembler | S-FLUID | iv/travel_network.js:137 |
| `fission_reactor` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM | iv/fission_reactor.js:17 |
| `fluorspar_kiln` | controller | crafting | C-DOMAIN C-FLUID C-FORM | iv/fluorspar_kiln.js:20 |
| `fuel_fabrication_plant` | controller | crafting | C-DOMAIN C-FLUID C-FORM | iv/uranium_cycle.js:59 |
| `heavy_water_plant` | controller | crafting | C-DOMAIN C-FLUID C-FORM | iv/heavy_water_plant.js:19 |
| `hot_cell` | controller | assembler | C-DOMAIN C-FLUID | iv/hot_cell.js:18 |
| `interferometer` | controller | crafting | C-DOMAIN C-FLUID C-FORM | iv/mercury.js:73 |
| `isr_wellfield` | controller | crafting | C-DOMAIN C-FLUID C-FORM | iv/uranium_cycle.js:59 |
| `iv_parallel_hatch` | hatch | crafting | H-FORM | iv/mass_production.js:11 |
| `large_packer` | controller | crafting | C-DOMAIN C-FLUID C-FORM | iv/mass_production.js:16 |
| `mercury_solar_field` | controller | crafting | C-FLUID C-FORM | iv/mercury.js:72 |
| `mercury_solar_works` | controller | crafting | C-DOMAIN C-FLUID C-FORM | iv/mercury.js:72 |
| `mercury_vein_drill` | controller | crafting | C-DOMAIN C-FLUID C-FORM | iv/mercury.js:72 |
| `naquadah_plant` | controller | assembler | C-DOMAIN C-FLUID | iv/naquadah_plant.js:34 |
| `pressurized_vein_drill` | controller | crafting | C-DOMAIN C-FLUID C-FORM | iv/venus.js:262 |
| `smelting_complex` | controller | assembler | C-DISTINCT C-DOMAIN C-FLUID | iv/mega_smelting_complex.js:2 |
| `tritium_removal_facility` | controller | crafting | C-DOMAIN C-FLUID C-FORM | iv/tritium_removal.js:21 |
| `venus_acid_works` | controller | crafting | C-DOMAIN C-FLUID C-FORM | iv/venus.js:278 |
| `venus_heat_engine` | controller | crafting | C-DOMAIN C-FLUID C-FORM | iv/venus.js:270 |
| `gtnn:maceration_stack_controller` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM | integration/gtnn.js:75 |

### luv

| Output | Class | Now | Missing | File:line |
|---|---|---|---|---|
| `grindless:anchor_harpoon` | component | assembler | C-COMPLEX | luv/asteroid_belt.js:190 |
| `grindless:capture_bag` | component | assembler | C-COMPLEX | luv/asteroid_belt.js:190 |
| `grindless:heat_exchanger_bundle` | component | assembler | C-COMPLEX | luv/io_surface.js:15 |
| `grindless:jupiter_entry_probe` | component | assembler | C-COMPLEX | luv/ganymede.js:35 |
| `grindless:melt_head` | component | assembler | C-COMPLEX | luv/europa.js:31 |
| `grindless:orbital_solar_panel` | part | assembler | P-FORM | luv/orbital_solar.js:11 |
| `grindless:orbital_solar_panel` | part | assembler | P-FORM | luv/orbital_solar.js:14 |
| `grindless:radiation_vault_casing` | part | assembler | P-DOMAIN P-FLUID | luv/io_surface.js:68 |
| `grindless:station_truss_casing` | part | assembler | P-DOMAIN P-FLUID | luv/travel.js:8 |
| `grindless:tether_spool` | component | assembler | C-COMPLEX | luv/io_orbit.js:10 |
| `grindless:vein_sample_c_type_belt` | component | crafting | C-COMPLEX C-MANUAL | luv/asteroid_belt.js:10 |
| `grindless:vein_sample_m_type_belt` | component | crafting | C-COMPLEX C-MANUAL | luv/asteroid_belt.js:10 |
| `grindless:vein_sample_s_type_belt` | component | crafting | C-COMPLEX C-MANUAL | luv/asteroid_belt.js:10 |
| `algae_bioreactor` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM | luv/europa.js:32 |
| `asteroid_processor` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM | luv/asteroid_belt.js:223 |
| `biofoundry` | controller | assembler | C-DISTINCT C-DOMAIN C-FLUID C-FORM | luv/biofoundry.js:18 |
| `coated_conductor_line` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM | luv/coated_conductor_line.js:17 |
| `coilgun_launcher` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM | luv/ganymede.js:39 |
| `cryobot` | controller | crafting | C-DOMAIN C-FLUID C-FORM | luv/europa.js:32 |
| `flux_tube_tether` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM | luv/io_orbit.js:34 |
| `fumarole_condenser` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM | luv/io_surface.js:77 |
| `gravitational_wave_detector` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM | luv/ganymede.js:39 |
| `harpoon_anchor_drill` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM | luv/asteroid_belt.js:220 |
| `helium_refrigerator` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM | luv/helium_refrigerator.js:37 |
| `hts_magnet_works` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM | luv/hts_magnet_works.js:17 |
| `hydroponic_ring` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM | luv/orbital_biology.js:50 |
| `mega_chemical_complex` | controller | assembler | C-DISTINCT C-DOMAIN C-FLUID C-FORM | luv/mega_chemical_complex.js:3 |
| `microgravity_smelter` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM | luv/orbital_industry.js:57 |
| `optical_miner` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM | luv/asteroid_belt.js:226 |
| `orbital_solar_station` | controller | assembler | C-DISTINCT C-DOMAIN C-FLUID C-FORM | luv/orbital_solar.js:19 |
| `organoid_lab` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM | luv/orbital_biology.js:51 |
| `volcanic_intake` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM | luv/io_surface.js:80 |
| `wake_shield_facility` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM | luv/orbital_industry.js:60 |
| `zero_g_crystal_grower` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM | luv/orbital_biology.js:49 |

### zpm

| Output | Class | Now | Missing | File:line |
|---|---|---|---|---|
| `grindless:aerogel_cartridge` | component | assembler | C-COMPLEX | zpm/saturn_science.js:26 |
| `grindless:aerogel_cartridge` | component | assembler | C-COMPLEX | zpm/saturn_science.js:110 |
| `grindless:cryostat_casing` | part | assembler | P-DOMAIN P-FLUID | zpm/magnet_works.js:14 |
| `grindless:naquadria_containment_casing` | part | assembler | P-DOMAIN P-FLUID | zpm/naquadria.js:15 |
| `grindless:neptune_flyby_probe` | component | assembler | C-COMPLEX | zpm/uranus.js:37 |
| `grindless:photographic_plate` | component | assembler | C-COMPLEX | observatory/recipes.js:32 |
| `grindless:photomultiplier_casing` | part | assembler | P-DOMAIN P-FLUID | zpm/observatory.js:108 |
| `grindless:pressure_hull_casing` | part | assembler | P-FLUID | zpm/uranus.js:140 |
| `grindless:probe_bay_casing` | part | assembler | P-FLUID | zpm/titan_probes.js:112 |
| `grindless:ring_sail_net` | component | assembler | C-COMPLEX | zpm/saturn_siphon.js:30 |
| `grindless:scoop_head` | component | assembler | C-COMPLEX | zpm/saturn_siphon.js:29 |
| `grindless:titan_entry_probe` | component | assembler | C-COMPLEX | zpm/titan_probes.js:28 |
| `aerogel_works` | controller | crafting | C-DISTINCT C-DOMAIN C-FORM C-RESEARCH | zpm/outer_chemistry.js:115 |
| `assembly_hall` | controller | assembler | C-DISTINCT C-DOMAIN C-FORM C-RESEARCH | zpm/mega_assembly_hall.js:3 |
| `deep_space_network` | controller | crafting | C-DOMAIN C-FORM C-RESEARCH | zpm/observatory.js:124 |
| `diamond_lattice_fab` | controller | crafting | C-DISTINCT C-DOMAIN C-FORM C-RESEARCH | zpm/qubits.js:180 |
| `direct_energy_converter` | controller | crafting | C-DISTINCT C-DOMAIN C-FORM C-RESEARCH | zpm/fusion.js:36 |
| `entry_probe_bay` | controller | crafting | C-DISTINCT C-DOMAIN C-FORM C-RESEARCH | zpm/titan_probes.js:130 |
| `europium_reductor` | controller | crafting | C-DISTINCT C-DOMAIN C-FORM C-RESEARCH | zpm/europium.js:166 |
| `flyby_probe_bay` | controller | crafting | C-DISTINCT C-DOMAIN C-FORM C-RESEARCH | zpm/uranus.js:174 |
| `gas_giant_siphon` | controller | crafting | C-DISTINCT C-DOMAIN C-FORM C-RESEARCH | zpm/saturn_siphon.js:6 |
| `ice_giant_siphon` | controller | crafting | C-DISTINCT C-DOMAIN C-FORM C-RESEARCH | zpm/uranus.js:6 |
| `ion_implanter` | controller | crafting | C-DOMAIN C-FORM C-RESEARCH | zpm/qubits.js:181 |
| `isotope_column` | controller | crafting | C-DISTINCT C-DOMAIN C-FORM C-RESEARCH | zpm/saturn_siphon.js:152 |
| `kuiper_survey_telescope` | controller | crafting | C-DISTINCT C-DOMAIN C-FORM C-RESEARCH | zpm/observatory.js:126 |
| `methane_pyrolyser` | controller | crafting | C-DISTINCT C-DOMAIN C-FORM C-RESEARCH | zpm/outer_chemistry.js:113 |
| `naquadah_fuel_works` | controller | crafting | C-DISTINCT C-DOMAIN C-FORM C-RESEARCH | zpm/naquadria.js:203 |
| `naquadria_magnet_works` | controller | crafting | C-DISTINCT C-DOMAIN C-FORM C-RESEARCH | zpm/magnet_works.js:17 |
| `naquadria_refinery` | controller | crafting | C-DISTINCT C-DOMAIN C-FORM C-RESEARCH | zpm/naquadria.js:202 |
| `neutrino_observatory` | controller | crafting | C-DISTINCT C-DOMAIN C-FORM C-RESEARCH | zpm/observatory.js:123 |
| `optical_observatory` | controller | crafting | C-DOMAIN C-FORM C-RESEARCH | observatory/crafting.js:20 |
| `plasma_quench_caster` | controller | crafting | C-DISTINCT C-DOMAIN C-FORM C-RESEARCH | zpm/fusion.js:36 |
| `plume_sampler` | controller | crafting | C-DISTINCT C-DOMAIN C-FORM C-RESEARCH | zpm/saturn_science.js:119 |
| `qubit_fab` | controller | crafting | C-DISTINCT C-DOMAIN C-FORM C-RESEARCH | zpm/qubits.js:182 |
| `radio_telescope` | controller | crafting | C-DOMAIN C-FORM C-RESEARCH | observatory/crafting.js:21 |
| `ring_harvester` | controller | crafting | C-DISTINCT C-DOMAIN C-FORM C-RESEARCH | zpm/saturn_siphon.js:153 |
| `ring_seismometer` | controller | crafting | C-DISTINCT C-DOMAIN C-FORM C-RESEARCH | zpm/saturn_science.js:120 |
| `slurry_separator` | controller | crafting | C-DISTINCT C-DOMAIN C-FORM C-RESEARCH | zpm/uranus.js:173 |
| `steam_observatory` | controller | crafting | C-DOMAIN C-FORM C-RESEARCH | observatory/crafting.js:20 |
| `tholin_reformer` | controller | crafting | C-DISTINCT C-DOMAIN C-FORM C-RESEARCH | zpm/titan_probes.js:131 |
| `vent_bioreactor` | controller | crafting | C-DISTINCT C-DOMAIN C-FORM C-RESEARCH | zpm/outer_chemistry.js:114 |

### uv

| Output | Class | Now | Missing | File:line |
|---|---|---|---|---|
| `grindless:cutting_module` | component | assembler | C-COMPLEX | uv/mega_factory.js:18 |
| `grindless:empty_antiproton_cartridge` | component | assembler | C-COMPLEX | uv/accelerators.js:50 |
| `grindless:empty_antiproton_trap` | component | assembler | C-COMPLEX | uv/accelerators.js:1 |
| `grindless:fibre_laser_module` | component | crafting | C-COMPLEX C-MANUAL | uv/photonics.js:219 |
| `grindless:forming_module` | component | assembler | C-COMPLEX | uv/mega_factory.js:17 |
| `grindless:heat_module` | component | assembler | C-COMPLEX | uv/mega_factory.js:20 |
| `grindless:laser_module_block` | part | crafting | P-FORM | uv/photonics.js:218 |
| `grindless:lithium_breeder_blanket` | component | assembler | C-COMPLEX | uv/accelerators.js:1 |
| `grindless:mixing_module` | component | assembler | C-COMPLEX | uv/mega_factory.js:19 |
| `grindless:propellant_tank` | component | assembler | C-COMPLEX | uv/propulsion.js:67 |
| `grindless:sample_canister` | component | assembler | C-COMPLEX | uv/kuiper.js:34 |
| `grindless:separation_module` | component | assembler | C-COMPLEX | uv/mega_factory.js:16 |
| `grindless:srf_cryomodule_block` | part | crafting | P-FORM | uv/cold.js:116 |
| `grindless:tungsten_target` | component | assembler | C-COMPLEX | uv/accelerators.js:1 |
| `grindless:uv_electromagnet` | component | assembler | C-COMPLEX | uv/propulsion.js:66 |
| `grindless:x_ray_mask` | component | assembler | C-COMPLEX | uv/accelerators.js:1 |
| `accelerator_driven_reactor` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uv/thorium.js:169 |
| `amorphous_ice_annealer` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uv/kuiper.js:72 |
| `antimatter_trap` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uv/accelerators.js:229 |
| `ark_biosphere` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uv/life.js:80 |
| `boron_nitride_reactor` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uv/materials.js:171 |
| `cryotank_winder` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uv/propulsion.js:147 |
| `event_horizon_interferometer` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uv/edge.js:70 |
| `fibre_draw_tower` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uv/photonics.js:216 |
| `heat_source_works` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uv/heat_sources.js:87 |
| `kuiper_interceptor_bay` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uv/kuiper.js:71 |
| `laser_fusion_chamber` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uv/fusion.js:79 |
| `laser_sail_launcher` | controller | assembler | C-DOMAIN C-FLUID C-FORM C-RESEARCH | uv/starshot.js:158 |
| `light_sail_fab` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uv/starshot.js:157 |
| `mega_factory` | controller | assembler | C-DOMAIN C-FLUID C-FORM C-RESEARCH | uv/mega_factory.js:3 |
| `mocvd_reactor` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uv/photonics.js:217 |
| `muon_fusion_cell` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uv/accelerators.js:228 |
| `neptune_deep_siphon` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uv/neptune.js:131 |
| `neural_culture_vat` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uv/life.js:80 |
| `optical_ground_station` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uv/detectors.js:86 |
| `penetrator_probe_bay` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uv/pluto_ices.js:128 |
| `powder_bed_printer` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uv/materials.js:173 |
| `powder_in_tube_line` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uv/materials.js:172 |
| `precursor_probe_bay` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uv/edge.js:69 |
| `pyroprocessing_cell` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uv/thorium.js:168 |
| `srf_cavity_works` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uv/cold.js:115 |
| `starchip_fab` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uv/starshot.js:157 |
| `superfluid_helium_plant` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uv/cold.js:114 |
| `synchrotron` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uv/accelerators.js:3 |
| `thruster_works` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uv/propulsion.js:148 |
| `triton_geyser_sampler` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uv/neptune.js:132 |
| `volatile_ice_fractionator` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uv/pluto_ices.js:129 |
| `zone_refining_tower` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uv/detectors.js:86 |

### uhv

| Output | Class | Now | Missing | File:line |
|---|---|---|---|---|
| `grindless:bsl4_casing` | part | assembler | P-DOMAIN P-FLUID | uhv/proxima_life.js:15 |
| `grindless:cold_trap_coring_head` | component | assembler | C-COMPLEX | uhv/proxima_ground.js:1 |
| `grindless:empty_penning_trap` | component | assembler | C-COMPLEX | uhv/antimatter.js:1 |
| `grindless:excavator_bucket_drum` | component | assembler | C-COMPLEX | uhv/mercury.js:45 |
| `grindless:field_ring_casing` | part | assembler | P-DOMAIN P-FLUID | uhv/mega_quantum_fabricator.js:26 |
| `grindless:hangar_casing` | part | assembler | P-DOMAIN P-FLUID | uhv/proxima_life.js:15 |
| `grindless:iridium_crucible` | component | assembler | C-COMPLEX | uhv/crystals.js:12 |
| `grindless:magnesium_target` | component | assembler | C-COMPLEX | uhv/antimatter.js:1 |
| `grindless:proxima_rover` | component | assembler | C-COMPLEX | uhv/proxima_life.js:1 |
| `grindless:sodium_potassium_heat_pipe` | component | assembler | C-COMPLEX | uhv/swarm.js:58 |
| `grindless:warp_gate_casing` | part | assembler | P-FLUID | uhv/gate.js:269 |
| `gtca:space_elevator` | controller | crafting | C-DOMAIN C-FLUID C-FORM C-RESEARCH | uhv/elevator.js:189 |
| `gtca:space_elevator_base_casing` | component | assembler | C-COMPLEX | uhv/elevator.js:95 |
| `gtca:space_elevator_cable` | component | assembler | C-COMPLEX | uhv/elevator.js:98 |
| `gtca:space_elevator_internal_structure` | component | assembler | C-COMPLEX | uhv/elevator.js:97 |
| `gtca:space_elevator_motor_mk_1` | component | assembler | C-COMPLEX | uhv/elevator.js:99 |
| `gtca:space_elevator_support_structure` | component | assembler | C-COMPLEX | uhv/elevator.js:96 |
| `gtca:ultra_high_strength_concrete_floor` | component | assembler | C-COMPLEX | uhv/elevator.js:94 |
| `baseline_astrometer` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uhv/gate.js:18 |
| `betavoltaic_fab` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uhv/betavoltaics.js:181 |
| `biomining_heap` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uhv/proxima_ground.js:17 |
| `casimir_array` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uhv/antimatter.js:199 |
| `cold_trap_drill` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uhv/proxima_ground.js:7 |
| `crystal_growth_furnace` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uhv/crystals.js:184 |
| `high_flux_reactor` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uhv/transcurium.js:172 |
| `mbe_reactor` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uhv/photonics.js:196 |
| `nuclear_clock_lab` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uhv/crystals.js:183 |
| `organoid_array` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uhv/wetware.js:79 |
| `pbo_plant` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uhv/elevator.js:187 |
| `photonic_foundry` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uhv/photonics.js:7 |
| `positron_accumulator` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uhv/antimatter.js:198 |
| `quantum_fabricator` | controller | assembler | C-DOMAIN C-FLUID C-FORM C-RESEARCH | uhv/mega_quantum_fabricator.js:3 |
| `radiotrophic_vat` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uhv/proxima_life.js:17 |
| `regolith_excavator` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uhv/mercury.js:183 |
| `sample_receiving_facility` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uhv/proxima_life.js:17 |
| `sic_device_fab` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uhv/power_devices.js:193 |
| `solar_array_fab` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uhv/power_devices.js:194 |
| `solar_probe_bay` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uhv/swarm.js:220 |
| `solar_vapour_furnace` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uhv/mercury.js:185 |
| `spark_plasma_sinterer` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uhv/propulsion.js:111 |
| `swarm_control_station` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uhv/swarm.js:218 |
| `swarm_segment_foundry` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uhv/swarm.js:216 |
| `tether_ribbon_works` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uhv/elevator.js:188 |
| `transuranium_facility` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uhv/transcurium.js:173 |
| `uhv_parallel_hatch` | hatch | crafting | H-FORM | uhv/parallel_hatch.js:4 |
| `ultrapure_water_plant` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uhv/betavoltaics.js:180 |
| `warp_gate` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uhv/gate.js:7 |
| `xenobiochem_plant` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uhv/proxima_life.js:17 |
| `xenobotany_greenhouse` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uhv/proxima_life.js:17 |
| `xenoflora_rover_bay` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uhv/proxima_life.js:17 |
| `zblan_draw_tower` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uhv/zblan.js:85 |

### uev

| Output | Class | Now | Missing | File:line |
|---|---|---|---|---|
| `grindless:bond_coated_sx_blade` | component | assembler | C-COMPLEX | uev/electron_beam.js:1 |
| `grindless:ca48_beam` | component | assembler | C-COMPLEX | uev/superheavy.js:1 |
| `grindless:ca48_oven_charge` | component | assembler | C-COMPLEX | uev/isotopes.js:1 |
| `grindless:ceramic_shell_mould` | component | assembler | C-COMPLEX | uev/electron_beam.js:1 |
| `grindless:cnt_coiled_muscle` | component | assembler | C-COMPLEX | uev/earth_orbit.js:1 |
| `grindless:cnt_twisted_yarn` | component | assembler | C-COMPLEX | uev/earth_orbit.js:1 |
| `grindless:degenerate_containment_casing` | part | assembler | P-FLUID | uev/sirius.js:1 |
| `grindless:etchable_core_tube` | component | assembler | C-COMPLEX | uev/earth_orbit.js:1 |
| `grindless:faraday_isolator` | component | assembler | C-COMPLEX | uev/earth_orbit.js:1 |
| `grindless:hftacn_coil_block` | part | assembler | P-FLUID | uev/composites.js:1 |
| `grindless:hftacn_heating_element` | component | assembler | C-COMPLEX | uev/composites.js:1 |
| `grindless:ktp_electroded_wafer` | component | assembler | C-COMPLEX | uev/earth_orbit.js:1 |
| `grindless:lobster_eye_mcp` | component | assembler | C-COMPLEX | uev/earth_orbit.js:1 |
| `grindless:nanotwinned_diamond_anvil` | component | assembler | C-COMPLEX | uev/megabar.js:1 |
| `grindless:nanotwinned_diamond_bit` | component | assembler | C-COMPLEX | uev/megabar.js:1 |
| `grindless:photonic_casing` | part | assembler | P-FLUID | uev/photonics.js:1 |
| `grindless:plutonium_244_target` | component | assembler | C-COMPLEX | uev/isotopes.js:1 |
| `grindless:plutonium_oxide_target` | component | assembler | C-COMPLEX | uev/isotopes.js:1 |
| `grindless:polycarbonate_foil` | component | assembler | C-COMPLEX | uev/superheavy.js:1 |
| `grindless:qd_source` | component | assembler | C-COMPLEX | uev/photonics.js:1 |
| `grindless:sdd` | component | assembler | C-COMPLEX | uev/photonics.js:1 |
| `grindless:sealed_capsule` | component | assembler | C-COMPLEX | uev/superheavy.js:1 |
| `grindless:sic_fibre_preform` | component | assembler | C-COMPLEX | uev/composites.js:1 |
| `grindless:stacked_preform` | component | assembler | C-COMPLEX | uev/earth_orbit.js:1 |
| `grindless:superhydride_scoop_coil` | component | assembler | C-COMPLEX | uev/alpha_centauri.js:1 |
| `grindless:target_wheel` | component | assembler | C-COMPLEX | uev/superheavy.js:1 |
| `grindless:target_wheel_blank` | component | assembler | C-COMPLEX | uev/superheavy.js:1 |
| `grindless:uev_fusion_casing` | part | assembler | P-FLUID | uev/fusion.js:10 |
| `grindless:ule_cavity` | component | assembler | C-COMPLEX | uev/earth_orbit.js:1 |
| `grindless:ule_mirrored_spacer` | component | assembler | C-COMPLEX | uev/earth_orbit.js:1 |
| `grindless:w_fibre_preform` | component | assembler | C-COMPLEX | uev/composites.js:1 |
| `barnard_core_drill` | controller | crafting | C-DISTINCT C-FLUID C-FORM C-RESEARCH | uev/barnard.js:6 |
| `calutron` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uev/isotopes.js:11 |
| `carbonyl_refinery` | controller | crafting | C-DISTINCT C-FLUID C-FORM C-RESEARCH | uev/barnard.js:13 |
| `containment_works` | controller | crafting | C-DISTINCT C-FLUID C-FORM C-RESEARCH | uev/sirius.js:11 |
| `cvi_furnace` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uev/composites.js:186 |
| `degenerate_harvester` | controller | crafting | C-DISTINCT C-FLUID C-FORM C-RESEARCH | uev/sirius.js:11 |
| `entanglement_station` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uev/earth_orbit.js:11 |
| `heavy_ion_cyclotron` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uev/superheavy.js:27 |
| `helium3_polariser` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uev/fusion.js:74 |
| `interstellar_dust_lab` | controller | crafting | C-DISTINCT C-FLUID C-FORM C-RESEARCH | uev/alpha_centauri.js:12 |
| `megabar_press` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uev/megabar.js:11 |
| `nebula_collector` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uev/alpha_centauri.js:12 |
| `nitride_magnet_works` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uev/composites.js:184 |
| `photonic_integration_hall` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uev/photonics.js:14 |
| `pulsar_timing_station` | controller | crafting | C-DISTINCT C-FLUID C-FORM C-RESEARCH | uev/alpha_centauri.js:12 |
| `quantum_gas_lab` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uev/earth_orbit.js:11 |
| `recoil_separator` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uev/superheavy.js:27 |
| `sic_fibre_plant` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uev/composites.js:185 |
| `snspd_foundry` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uev/photonics.js:14 |
| `stellar_forge` | controller | assembler | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uev/stellar_forge.js:2 |
| `superheavy_chemistry_lab` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uev/superheavy.js:27 |
| `uev_energy_input_hatch` | hatch | assembler | H-FORM | uev/foundation.js:22 |
| `uev_energy_input_hatch_16a` | hatch | assembler | H-FORM | uev/foundation.js:36 |
| `uev_energy_output_hatch` | hatch | assembler | H-FORM | uev/foundation.js:29 |
| `uev_energy_output_hatch_16a` | hatch | assembler | H-FORM | uev/foundation.js:43 |
| `uev_fusion_reactor` | controller | crafting | C-DISTINCT C-FLUID C-FORM C-RESEARCH | uev/fusion.js:76 |
| `uev_machine_hull` | single | assembler | S-FORM | uev/foundation.js:15 |
| `vdw_stacker` | controller | crafting | C-DISTINCT C-DOMAIN C-FLUID C-FORM C-RESEARCH | uev/photonics.js:14 |
| `white_dwarf_spectrograph` | controller | crafting | C-DISTINCT C-FLUID C-FORM C-RESEARCH | uev/sirius.js:11 |

### uiv

| Output | Class | Now | Missing | File:line |
|---|---|---|---|---|
| `grindless:aqfp_module` | component | assembler | C-COMPLEX | uiv/matrioshka.js:1 |
| `grindless:balanced_rhea_impeller` | component | assembler | C-COMPLEX | uiv/uiv_components.js:1 |
| `grindless:beuv_mirror` | component | assembler | C-COMPLEX | uiv/beuv_stm.js:1 |
| `grindless:braided_mh_tether` | component | assembler | C-COMPLEX | uiv/rx_j1856.js:1 |
| `grindless:cage_part` | component | assembler | C-COMPLEX | uiv/isotopes.js:1 |
| `grindless:capped_thf4_film` | component | assembler | C-COMPLEX | uiv/mainframe.js:5 |
| `grindless:cold_plate` | component | assembler | C-COMPLEX | uiv/memories_cryostat.js:1 |
| `grindless:cps_wetted_mesh` | component | assembler | C-COMPLEX | uiv/mk5.js:1 |
| `grindless:crossbar_on_interposer` | component | assembler | C-COMPLEX | uiv/mainframe.js:5 |
| `grindless:crust_lift_tether` | component | assembler | C-COMPLEX | uiv/rx_j1856.js:1 |
| `grindless:dac_charge` | component | assembler | C-COMPLEX | uiv/metallic_hydrogen.js:1 |
| `grindless:diamond_schottky_die` | component | assembler | C-COMPLEX | uiv/matrioshka.js:1 |
| `grindless:divertor` | component | assembler | C-COMPLEX | uiv/mk5.js:1 |
| `grindless:divertor_cassette` | component | assembler | C-COMPLEX | uiv/mk5.js:1 |
| `grindless:droplet_collector` | component | assembler | C-COMPLEX | uiv/matrioshka.js:1 |
| `grindless:droplet_wick` | component | assembler | C-COMPLEX | uiv/matrioshka.js:1 |
| `grindless:er_fibre` | component | assembler | C-COMPLEX | uiv/memories_cryostat.js:1 |
| `grindless:er_fibre_coil` | component | assembler | C-COMPLEX | uiv/memories_cryostat.js:1 |
| `grindless:es254_target` | component | assembler | C-COMPLEX | uiv/rx_j1856.js:1 |
| `grindless:first_wall_tile` | component | assembler | C-COMPLEX | uiv/mk5.js:1 |
| `grindless:gamma_bragg_mirror` | component | assembler | C-COMPLEX | uiv/j0437.js:1 |
| `grindless:impregnated_gdbco` | component | assembler | C-COMPLEX | uiv/uiv_components.js:1 |
| `grindless:impregnated_mh_coil` | component | assembler | C-COMPLEX | uiv/levitation_melter.js:1 |
| `grindless:kilonova_capsule` | component | assembler | C-COMPLEX | uiv/rx_j1856.js:1 |
| `grindless:li_sn_armoured_tile` | component | assembler | C-COMPLEX | uiv/mk5.js:1 |
| `grindless:lonsdaleite_bearing` | component | assembler | C-COMPLEX | uiv/metallic_hydrogen.js:1 |
| `grindless:maglev_stator` | component | assembler | C-COMPLEX | uiv/levitation_melter.js:1 |
| `grindless:matrioshka_emitter_shell` | part | assembler | P-FORM | uiv/matrioshka.js:1 |
| `grindless:matrioshka_logic_tile` | part | assembler | P-FORM | uiv/matrioshka.js:1 |
| `grindless:matrioshka_node` | part | assembler | P-FORM | uiv/matrioshka.js:1 |
| `grindless:matrioshka_tpv_shell` | part | assembler | P-FORM | uiv/matrioshka.js:1 |
| `grindless:metallic_hydrogen_coil_block` | part | assembler | P-FLUID | uiv/levitation_melter.js:1 |
| `grindless:mh_laminated_yarn` | component | assembler | C-COMPLEX | uiv/rx_j1856.js:1 |
| `grindless:neon_moderator_cartridge` | component | assembler | C-COMPLEX | uiv/j0437.js:1 |
| `grindless:neutron_guide` | component | assembler | C-COMPLEX | uiv/isotopes.js:1 |
| `grindless:neutron_supermirror` | component | assembler | C-COMPLEX | uiv/isotopes.js:1 |
| `grindless:polar_cap_electrode` | component | assembler | C-COMPLEX | uiv/rx_j1856.js:1 |
| `grindless:potted_mh_stator` | component | assembler | C-COMPLEX | uiv/levitation_melter.js:1 |
| `grindless:ps_cooling_laser` | component | assembler | C-COMPLEX | uiv/tfln_femtosecond.js:1 |
| `grindless:pumped_edfa` | component | assembler | C-COMPLEX | uiv/memories_cryostat.js:1 |
| `grindless:rhea_cased_charge` | component | assembler | C-COMPLEX | uiv/levitation_melter.js:1 |
| `grindless:rhea_cased_halbach` | component | assembler | C-COMPLEX | uiv/levitation_melter.js:1 |
| `grindless:rhea_former` | component | assembler | C-COMPLEX | uiv/levitation_melter.js:1 |
| `grindless:selective_emitter` | component | assembler | C-COMPLEX | uiv/matrioshka.js:1 |
| `grindless:shg_486_stage` | component | assembler | C-COMPLEX | uiv/tfln_femtosecond.js:1 |
| `grindless:six_hour_memory` | component | assembler | C-COMPLEX | uiv/memories_cryostat.js:1 |
| `grindless:sled_charge` | component | assembler | C-COMPLEX | uiv/levitation_melter.js:1 |
| `grindless:strain_wave_gear` | component | assembler | C-COMPLEX | uiv/uiv_components.js:1 |
| `grindless:tb_droplet_target` | component | assembler | C-COMPLEX | uiv/beuv_stm.js:1 |
| `grindless:ti50_oven_charge` | component | assembler | C-COMPLEX | uiv/isotopes.js:1 |
| `grindless:tpv_segment` | component | assembler | C-COMPLEX | uiv/matrioshka.js:1 |
| `grindless:uiv_conveyor_module` | component | assembler | C-COMPLEX | uiv/levitation_melter.js:1 |
| `grindless:uiv_electric_piston` | component | assembler | C-COMPLEX | uiv/metallic_hydrogen.js:1 |
| `grindless:uiv_emitter` | component | assembler | C-COMPLEX | uiv/j0437.js:1 |
| `grindless:uiv_fusion_casing` | part | assembler | P-FLUID | uiv/mk5.js:1 |
| `grindless:uiv_sensor` | component | assembler | C-COMPLEX | uiv/mainframe.js:5 |
| `grindless:wound_rhea_former` | component | assembler | C-COMPLEX | uiv/levitation_melter.js:1 |
| `beuv_scanner` | controller | crafting | C-DISTINCT C-FLUID C-FORM C-RESEARCH | uiv/beuv_stm.js:166 |
| `crust_lift` | controller | crafting | C-DISTINCT C-FLUID C-FORM C-RESEARCH | uiv/rx_j1856.js:7 |
| `decay_heat_vault` | controller | crafting | C-DISTINCT C-FLUID C-FORM C-RESEARCH | uiv/rx_j1856.js:180 |
| `droplet_radiator_works` | controller | crafting | C-DISTINCT C-FLUID C-FORM C-RESEARCH | uiv/matrioshka.js:174 |
| `femtosecond_writer` | controller | crafting | C-DISTINCT C-FLUID C-FORM C-RESEARCH | uiv/tfln_femtosecond.js:170 |
| `levitation_melter` | controller | crafting | C-DISTINCT C-FLUID C-FORM C-RESEARCH | uiv/levitation_melter.js:12 |
| `matrioshka_computer` | controller | crafting | C-DISTINCT C-FLUID C-FORM C-RESEARCH | uiv/matrioshka.js:174 |
| `millikelvin_cryostat_works` | controller | crafting | C-DISTINCT C-FLUID C-FORM C-RESEARCH | uiv/memories_cryostat.js:168 |
| `neutron_drip_separator` | controller | crafting | C-DISTINCT C-FLUID C-FORM C-RESEARCH | uiv/rx_j1856.js:179 |
| `neutronium_cage` | controller | crafting | C-DISTINCT C-FLUID C-FORM C-RESEARCH | uiv/rx_j1856.js:180 |
| `polarised_proton_source` | controller | crafting | C-DISTINCT C-FLUID C-FORM C-RESEARCH | uiv/mk5.js:165 |
| `positronium_condensate_lab` | controller | crafting | C-DISTINCT C-FLUID C-FORM C-RESEARCH | uiv/j0437.js:181 |
| `pulsar_wind_trap` | controller | crafting | C-DISTINCT C-FLUID C-FORM C-RESEARCH | uiv/j0437.js:7 |
| `r_process_decompressor` | controller | crafting | C-DISTINCT C-FLUID C-FORM C-RESEARCH | uiv/rx_j1856.js:180 |
| `ramp_compression_pulser` | controller | crafting | C-DISTINCT C-FLUID C-FORM C-RESEARCH | uiv/metallic_hydrogen.js:12 |
| `spectral_hole_burner` | controller | crafting | C-DISTINCT C-FLUID C-FORM C-RESEARCH | uiv/memories_cryostat.js:168 |
| `stm_lithography_cell` | controller | crafting | C-DISTINCT C-FLUID C-FORM C-RESEARCH | uiv/beuv_stm.js:166 |
| `tfln_fab` | controller | crafting | C-DISTINCT C-FLUID C-FORM C-RESEARCH | uiv/tfln_femtosecond.js:170 |
| `uiv_energy_input_hatch` | hatch | assembler | H-FORM | uiv/foundation.js:48 |
| `uiv_energy_input_hatch_16a` | hatch | assembler | H-FORM | uiv/foundation.js:50 |
| `uiv_energy_output_hatch` | hatch | assembler | H-FORM | uiv/foundation.js:49 |
| `uiv_energy_output_hatch_16a` | hatch | assembler | H-FORM | uiv/foundation.js:51 |
| `uiv_fusion_reactor` | controller | crafting | C-DISTINCT C-FLUID C-FORM C-RESEARCH | uiv/mk5.js:165 |
| `uiv_machine_hull` | single | assembler | S-FORM | uiv/foundation.js:18 |
| `uiv_parallel_hatch` | hatch | crafting | H-FORM | uiv/parallel_hatch.js:4 |
| `xray_pulse_profiler` | controller | crafting | C-DISTINCT C-FLUID C-FORM C-RESEARCH | uiv/j0437.js:182 |
