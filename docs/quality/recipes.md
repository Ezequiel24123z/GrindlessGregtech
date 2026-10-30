# Recipe quality ladder and audit (QR-C0)

Why: the owner found controllers and multiblock parts at UEV and similar tiers crafted at a plain crafting table. Controllers, parts and tier machines
must climb a ladder of crafting forms that gets harder with the tier. `node tools/analysis/recipe-quality.mjs` checks it, and
`tools/analysis/test/recipe-quality.test.mjs` fails on any violation outside the baseline.

## The ladder

Tier numbers: steam 0, LV 1, MV 2, HV 3, EV 4, IV 5, LuV 6, ZPM 7, UV 8, UHV 9, UEV 10, UIV 11, UXV 12. The tier of a recipe is its era directory (`eraTier`
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
`complexFloor` (IV 5, LuV 6, ZPM 7, UV 7.5, UHV 8, UEV 8.5, UIV 9, UXV 9.5). Principle 2: more distinct steps and inputs count; quantity and duration do not.

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

## Reachability gate (QR-F3)

`node tools/analysis/recipe-cycles.mjs` (in T0 via `test/recipe-cycles.test.mjs`) runs the same static stand-in and computes what can be made, starting
from everything that is not ours. It tracks `grindless:` items and fluids and our controllers; a recipe of one of our recipe types runs only once one
of its machines can be made, and research items count as inputs. It fails if any controller cannot be made, and prints the root cycles (a controller
that needs its own product, directly or through later steps). `--explain id,id` shows the missing inputs of each recipe for an id; `--all` lists every
unreachable id. `ASSUMED` in the script lists ids obtained without a recipe (loot, events); it is empty. Foreign ids (GTM materials, optical circuits, circuit tags) that only
our recipes lead to come from `recipe_bridge.json`, generated from a release obtain dump: `node tools/analysis/recipe-cycles.mjs --bridge-from <dump> --write` (regenerate once per release).
`era-order` (`lib/era_order.mjs`, T0) fails a machine recipe that takes an item registered in a later era.
Tier components of UHV and above (`ownedPatterns` in `recipe_quality.json`) are tracked as ours even though GTM has no recipe for them; the ones our recipes use and nothing
makes yet are listed in `recipe_cycles.json` `pending` (`--write-pending`), a ratchet that only shrinks: a new unmade one, or a pending one that got a recipe, fails the test.

## Tier parity gates (TP-G, UHV and above)

Codes of the same baseline (tier t >= 9, N = the recipe's era; a tier component or hull uses its own tier). The nine tier component families are electric_motor, electric_pump, fluid_regulator,
conveyor_module, electric_piston, robot_arm, field_generator, emitter and sensor (`gtceu:<tier>_<family>`, also `grindless:` for uev, uiv and uxv; baseline keys name them `gtceu:` either way).
- **T-COMP**: controllers, hatches, singles and parts use no tier component below N; a tier component recipe may use N-1.
- **T-COUNT** (item counts: pattern cells per key, content counts): controllers need 8 tier components of N+ from 3 families; hatches, singles and complex (not casing, coil, glass...) parts need 2.
- **T-CIRC**: the highest circuit tier among the inputs is N (`#gtceu:circuits/<tier>`, or an item in `circuitTier`); controllers take at least 4 circuits of tier N. Bulk parts and tier components are not checked.
- **T-HULL**: a `gtceu:<tier>_machine_hull` input is tier N.
- **T-VOLT**: EU/t (machine recipes only) >= VA[N] = floor(V[N] * 15 / 16). Tier components, hulls, the tier-N 2 A energy hatches and every id or recipe pattern in `voltBootstrap` need only VA[N-1] (the multi-amp energy hatches only run once the tier-N 2 A hatch exists).

## Multiblock tooltips (TP-D5)

`node tools/analysis/tooltip-lint.mjs` (in `tools/Check-Fast.ps1`) takes every multiblock controller of ours from the static stand-in's registry, which records the `tooltips(...)` array: at most 4 entries;
`grindless.machine.<id>.tooltip.0` exists in en_us and es_es, starts with `§7` and has at most 80 visible characters (formatting codes stripped); every other `tooltip.N` has at most 60; en_us and es_es have the same
tooltip keys. Say what the machine does and what it can use, nothing more. Same ratchet as above with `tooltip_lint.json` (`--write-baseline`).

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

### iv (QR-R2, done)

All rows of the iv table, the launch_road rows (composite_autoclave, engine_test_stand), the IV integration rows (gtca mega_lcr, mega_oil_cracking_unit; gtnn maceration_stack_controller) and ev_rtg left the baseline. IV controllers, parts and components moved from the crafting table to the assembler with a fluid and domain inputs of their own line; ids grindless:crafting/NAME are now grindless:assembler/NAME (vein samples: grindless:assembler/vein_sample/VEIN; gtnn: grindless:assembler/gtnn/maceration_stack_controller).

### luv (QR-R2, done)

All rows of the luv table left the baseline. LuV controllers, parts and components moved to the assembly line (grindless:assembly_line/NAME) with soldering alloy plus lubricant and domain inputs; belt vein samples and radiation_vault_casing are assemblers with fluids.

### zpm (QR-R3, done)

All zpm rows left the baseline. The integration dropped `eraTier.observatory = 7` (observatory/ is Steam to MV, so its tier is now inferred); the optical observatory takes a photographic plate and the radio telescope a lunar ephemeris as their domain input, so the four observatory/ rows left too. ZPM controllers (europium reductor, plasma caster, energy converter, magnet works, naquadria refinery and fuel works, assembly hall, three outer-chemistry plants, three qubit machines, three survey instruments, two Saturn science, three siphon, two Titan, three Uranus) moved to `grindless:assembly_line/NAME` with scanner research of an earlier-era item, two domain parts, soldering alloy and lubricant. Casings and probes (cryostat, naquadria containment, photomultiplier, probe bay, pressure hull) and components (aerogel cartridge x2, scoop head, ring sail net, titan entry probe, Neptune flyby probe) stay assemblers with a fluid and domain items.


### uv (QR-R4, done)

All uv rows left the baseline. UV controllers (accelerators x3, cold x2, detectors x2, edge x2, fusion, heat sources, kuiper x2, life x2, materials x3, neptune x2, pluto ices x2, photonics x2, propulsion x2, starshot x3, thorium x2, mega factory) moved to `grindless:assembly_line/NAME` (the mega factory keeps `gtceu:assembly_line/mega_factory`) with station research of a previous item of the same line, UV hull + parts, four UV circuits, three domain items, soldering alloy, lubricant and tritanium. Components (x_ray_mask, tungsten_target, empty antiproton cartridge and trap, lithium breeder blanket, sample canister, uv_electromagnet, propellant tank, mu_metal_shield, the five mega factory modules) stay assemblers, raised with silicon nitride film, plates and two fluids; the fibre Bragg grating moved to the assembler (germanium, hydrogen) and the laser module and cryomodule blocks became assembler rows (4 modules + plates + film), replacing the shapeless pairs.

Process honesty: `culture_seed` keeps 2 out, paid by 2 consumed agar dust beside the biomass (a replication fed by nutrients); `exposed_wafer`, `patterned_wafer` (fluids added in the accelerators table), `fibre_bragg_grating`, `laser_module_block`, `srf_cryomodule_block` are no longer 1-in-1-out.
### uhv (QR-R5, done)

All uhv rows left the baseline. The 33 UHV controllers (antimatter x2, betavoltaics x2, crystals x2, gate x2, mercury x2, photonics x2, power devices x2, proxima ground x2, proxima life x5, swarm x3, transcurium x2, wetware array, zblan tower, spark plasma sinterer, pbo plant, tether ribbon works, space elevator, quantum fabricator, parallel hatch) moved to `grindless:assembly_line/NAME` (the quantum fabricator was an assembler, the parallel hatch a shaped recipe; the GTCA elevator keeps its output `gtca:space_elevator`) with station research of a previous item of the same line, hull + parts, four UHV circuits, three domain items, soldering alloy, lubricant and tritanium. Casings (bsl4, hangar, field ring, warp gate) keep their 1:1 ratio and gain a fluid and a domain item (the warp gate casing only a fluid). Components (empty penning trap, iridium crucible, cold trap coring head, excavator bucket drum, sodium-potassium heat pipe and the six GTCA elevator blocks) stay assemblers, raised with a deep domain item of their line, a second domain item and two fluids.

Process honesty: `sic_epi` returns 1800 mB of the 2000 mB hydrogen carrier; `sic_anneal` (sic_device_wafer) consumes a graphite cap; `californium_source` (californium_252_source) consumes 2 platinum foil and a 500 mB helium fill.

TP-R-uhv (done): the 74 T-VOLT/T-COMP/T-COUNT findings left the baseline; controllers take UHV hull + 3 UHV component families (3 of each) chosen per machine, parts and casings run at VA[UHV]. Nothing remains in the baseline for era uhv.

### uev

Fixed, QR-R8: ca48_oven_charge (ca48_crucible_load mixer), plutonium_244_target (pu244_plating_ampoule reactor), ceramic_shell_mould (ceramic_slurry mixer, green_ceramic_shell mixer, ceramic_shell_firing EBF), cnt_twisted_yarn and cnt_coiled_muscle (cnt_ribbon_draw lathe, cnt_anneal EBF, cnt_sizing reactor), superhydride_scoop_coil (scoop_winding mixer, scoop_impregnation reactor), ca48_beam (ca48_ionisation reactor), polycarbonate_foil (polycarbonate_film_cast reactor) and sealed_capsule (capsule_liner reactor) left the baseline. Still baselined, with no honest own-line chain: target_wheel and target_wheel_blank (titanium plate and berkelium oxide only).

Fixed, QR-R6: the uev table rows left the baseline (the rows above were still pending then). Controllers, hull and hatches are assembly lines with station research, an era fluid and domain inputs; hull and input hatches mirror the output hatches with superconductor cables and faraday_isolator/ule_cavity parts. Components earn their score from their own line: own-line intermediates (hbn_film as insulation or release layer, polycarbosilane, hftac blend, lead glass), a process fluid (epoxy, ethanol, oxygen) and argon or helium only where the process needs an inert or cryogenic gas (sputtering, CVD, annealing, superconducting parts). A machine heater (`hftacn_heating_element`) is consumed only by the coil block and the stellar forge.


### uiv

TP-R-uiv (partly done): 58 of the 86 T-* findings (26 of 35 recipes) left the baseline; controllers take UIV hull + 3 UIV families x3 + 4 UIV circuits at VA[UIV]. `radiator_module` moved to `grindless:assembly_line/radiator_module` (one output: the tin overflow is gone). Kept because a UIV circuit or component would be a cycle (the mainframe needs them, or they need the hull and components): hull, beuv scanner, stm cell, femtosecond writer, tfln fab, spectral hole burner, millikelvin works (all T-*), levitation melter and ramp compression pulser (EU/t raised only).

QR-R7: the 20 controllers, `uiv_parallel_hatch`, the 4 energy hatches and `uiv_machine_hull` are assembly lines (`grindless:assembly_line/<name>`) and left the baseline; the 4 matrioshka parts are assembly lines. The rows below stay in the baseline: each needs an own-line intermediate that does not exist yet. UIV own-line intermediate pending (UIV build, v0.14.0).

| Output | Class | Now | Missing | File:line |
|---|---|---|---|---|
| `grindless:aqfp_module` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/matrioshka.js:1 |
| `grindless:balanced_rhea_impeller` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/uiv_components.js:1 |
| `grindless:beuv_mirror` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/beuv_stm.js:1 |
| `grindless:braided_mh_tether` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/rx_j1856.js:1 |
| `grindless:cage_part` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/isotopes.js:1 |
| `grindless:capped_thf4_film` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/mainframe.js:5 |
| `grindless:cold_plate` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/memories_cryostat.js:1 |
| `grindless:cps_wetted_mesh` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/mk5.js:1 |
| `grindless:crossbar_on_interposer` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/mainframe.js:5 |
| `grindless:crust_lift_tether` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/rx_j1856.js:1 |
| `grindless:dac_charge` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/metallic_hydrogen.js:1 |
| `grindless:diamond_schottky_die` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/matrioshka.js:1 |
| `grindless:divertor` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/mk5.js:1 |
| `grindless:divertor_cassette` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/mk5.js:1 |
| `grindless:droplet_collector` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/matrioshka.js:1 |
| `grindless:droplet_wick` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/matrioshka.js:1 |
| `grindless:er_fibre_coil` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/memories_cryostat.js:1 |
| `grindless:es254_target` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/rx_j1856.js:1 |
| `grindless:first_wall_tile` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/mk5.js:1 |
| `grindless:gamma_bragg_mirror` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/j0437.js:1 |
| `grindless:impregnated_gdbco` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/uiv_components.js:1 |
| `grindless:impregnated_mh_coil` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/levitation_melter.js:1 |
| `grindless:kilonova_capsule` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/rx_j1856.js:1 |
| `grindless:li_sn_armoured_tile` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/mk5.js:1 |
| `grindless:lonsdaleite_bearing` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/metallic_hydrogen.js:1 |
| `grindless:maglev_stator` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/levitation_melter.js:1 |
| `grindless:mh_laminated_yarn` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/rx_j1856.js:1 |
| `grindless:neon_moderator_cartridge` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/j0437.js:1 |
| `grindless:neutron_guide` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/isotopes.js:1 |
| `grindless:neutron_supermirror` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/isotopes.js:1 |
| `grindless:polar_cap_electrode` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/rx_j1856.js:1 |
| `grindless:ps_cooling_laser` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/tfln_femtosecond.js:1 |
| `grindless:pumped_edfa` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/memories_cryostat.js:1 |
| `grindless:rhea_cased_charge` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/levitation_melter.js:1 |
| `grindless:rhea_cased_halbach` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/levitation_melter.js:1 |
| `grindless:rhea_former` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/levitation_melter.js:1 |
| `grindless:selective_emitter` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/matrioshka.js:1 |
| `grindless:shg_486_stage` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/tfln_femtosecond.js:1 |
| `grindless:six_hour_memory` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/memories_cryostat.js:1 |
| `grindless:sled_charge` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/levitation_melter.js:1 |
| `grindless:strain_wave_gear` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/uiv_components.js:1 |
| `grindless:tb_droplet_target` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/beuv_stm.js:1 |
| `grindless:ti50_oven_charge` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/isotopes.js:1 |
| `grindless:tpv_segment` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/matrioshka.js:1 |
| `grindless:uiv_conveyor_module` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/levitation_melter.js:1 |
| `grindless:uiv_electric_piston` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/metallic_hydrogen.js:1 |
| `grindless:uiv_emitter` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/j0437.js:1 |
| `grindless:uiv_sensor` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/mainframe.js:5 |
| `grindless:wound_rhea_former` | component | assembler | C-COMPLEX (UIV own-line intermediate pending (UIV build, v0.14.0)) | uiv/levitation_melter.js:1 |
