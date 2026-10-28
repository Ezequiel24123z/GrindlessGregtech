# UIV S0: spikes

Bench results for UIV-S0 (S0-8 is not here: folded into UIV-M1's T1). Base: v0.12.0 candidate (`a64c33dd`). All runs on the Linux VM; run ids are
directories under the session's `test-runs\`. Throwaway ids are `gtceu:gg_uiv_s0_*`; UIV ids were registered in the overlay only, with
`highTierContent` off (`pack/config/gtceu.yaml` untouched). KubeJS errors from our scripts in the enabled runs: 0.

## Results

| Spike | Result | Run | Key figure | Changes |
|---|---|---|---|---|
| S0-1 UIV hull + hatches | **FAIL as written, PASS with the table's fallback** | 20261028-125107-server (FAIL), 20261028-130116/130455/130840-server (fallback) | A second `machine_hull` / hatch registration beside UEV's crashes the boot: `Duplicate key 'gtceu:machine_hull' in registry 'gtceu:machine'` (the builder key is the base id, before tier prefixing). Fallback `.tiers(UEV, GTValues.UIV)` in an overlay copy of `uev/foundation.js` registers the 5 ids; hull is a `HullMachine` tier 11; 2 A and 16 A hatches form in our frame and in `gtceu:assembly_line`; the 16 A buffer reads as the long 8,589,934,592. | F1 (and the shared UEV foundation file) |
| S0-2 relay platform | PARTIAL | 20261028-131151-server | The platform ring (frame + UIV 16 A hatch + UIV output 16 A pair + AE2 controller/drive) forms in `grindless:s0_rx_j1856_orbit` (26 blocks). **The player jump (client half) was not run in this package.** | A2/A3 keep the jump as a T1 item until a client run proves it |
| S0-3 places | PASS | 20261028-130455-server | Datapack `s0_rx_j1856_orbit`, `s0_psr_j0437_orbit`, `s0_cygnus_x1_orbit` load, rocket_tier 11; 700,000 / 3,000,000 / 10,000,000 K. Older planets kept. Black-hole sky is a client asset, checked statically against GCYR's `black_hole_orbit.json`. | None |
| S0-4 platform persistence | PASS | 20261028-131151-server | After a clean restart with nobody present: persistentData row kept, 16 forced chunks kept, controller loaded and formed, AE2 controller kept. | None |
| S0-10 atmospheres | PASS (figures only) | 20261028-130455-server | Gravity 0, no atmosphere in the three orbits; temperatures as S0-3. Nothing client-visible proven. | None |
| S0-5 wireless to UIV | PASS | 20261028-130455-server | 11 tiers LV..UIV register in one builder; V[11] = 33,554,432; long roundtrip 1,006,632,960,000. Caps: V×2×10 = 671,088,640; V×64×10 = 21,474,836,480 wraps as an int to 0 (use long). `grindless:pulsar_timed_repeater` registers. | W: tables and NBT in long; check every int cap |
| S0-6 fusion at UIV | PASS | 20261028-130455-server | `FusionReactorMachine` tier 11 forms with 50 of 50 UIV 16 A hatches, buffer 429,496,729,600 EU; storage factor 5,120,000,000. Start-4.8 G recipe ran 16,000,000 EU/t, 100 t. 30 fusion rows, 0 take a grindless fluid. | None (needs the S0-1 fallback hatches) |
| S0-7 coil / cable | PASS | 20261028-130455-server | `grindless:metallic_hydrogen` with `cableProperties(V[11],4,0,false)`: wire and cable items exist for single..hex, 33,554,432 V, 4 A. | None |
| S0-9 CWU / research | PASS (limit) | 20261028-130840-server | HPCA-based KubeJS multiblock forms; `requestCWUt`/`getMaxCWUt` exist (0 read, empty component). `stationResearch(...)` generates `gtceu:research_station/1x_minecraft_diamond`; `researchWithoutRecipe` generates no row. | A9: use `stationResearch` |
| S0-11 14,400 K coil | PASS | 20261028-130455-server | `global.grindless.coils.temperature` = 14400; a `blastFurnaceTemp` 14000 recipe ran at 114,688 EU/t; `coilParallel`: 64 parallels, 64 out. | None |

## S0-1 exact id list

Registered by the fallback (UEV ids kept): `gtceu:uiv_machine_hull`, `gtceu:uiv_energy_input_hatch`, `gtceu:uiv_energy_input_hatch_16a`,
`gtceu:uiv_energy_output_hatch`, `gtceu:uiv_energy_output_hatch_16a` (5 machine ids). Enabled-run totals: items 35,712, blocks 25,920,
fluids 1,594, machines 1,310 (a marker-off baseline dump was not taken; the delta is these 5 plus the throwaway `gg_uiv_s0_*` ids).

Static facts: `gtceu:uxv_machine_casing` exists; `uxv_machine_hull` and `uxv_energy_input_hatch` do not; `gtnn:optical_computer` exists with 1
recipe; `gtnn:optical_mainframe` exists as an item with 0 recipes (the GT-- recipe is ours to add); 18 of 18 GTM materials exist, but erbium,
einsteinium, fermium have no dust, and terbium, gadolinium, praseodymium, zirconium have dust but no ingot or fluid.

## S0-1 fallback edit

Overlay copy of `pack/kubejs/startup_scripts/grindless/uev/foundation.js`, lines 168-205: each hull/hatch call `.tiers(UEV)` becomes
`.tiers(UEV, GTValues.UIV)`. Proposed contract change: UIV-F1 edits those calls (shared file, integrator-owned) and does not register
its own `machine_hull`/hatch builders. The edited copy is not committed (it lives only in the scratch overlay).

## Bench notes

Zone `uiv_s0`: X 35264-35327, Z 0-63, Y 70-100, in the Overworld and `grindless:s0_rx_j1856_orbit`. Overlay data:
`tools/test/overlay/kubejs/data/grindless/dimension/s0_{rx_j1856,psr_j0437,cygnus_x1}_orbit.json` and
`.../data/grindless/gcyr/planets/s0_{rx_j1856,psr_j0437,cygnus_x1}_orbit.json`. Marker `config/gg_test_uiv_s0.json` is `enabled:false`;
the S0-1 fallback needs `"fallback": true` plus the edited foundation copy.
