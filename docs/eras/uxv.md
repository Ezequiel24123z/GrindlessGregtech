# UXV (T12): the galactic arm

UXV is the twelfth tier: V[UXV] = 134,217,728 EU/t. The journey calls it "the galactic arm: many systems at once" (journey.md:14-54): stellar plasma, accretion disk plasma, the stellar elevator and the accretion disk skimmer. UIV went to three tier-11 places and gated on the Kerr chart (uiv.md:871-887). UXV goes back to Cygnus X-1 to work its star and its disk, then slings out to two more places at once, each with a product only it has:

- **Home (Earth):** spintronics (the UXV circuit), the superfluid gyroscope, superheavies III and the island of stability, the gamma laser, and the Mk6 fusion ring.
- **Cygnus X-1 orbit** (`grindless:cygnus_x1_orbit`, UIV place, revisited): star lifting of HDE 226868, the plasma mass filter, stellar condensation, the accretion disk skimmer, FRC cartridges and the Blandford-Znajek dynamo.
- **Vela pulsar orbit** (`grindless:vela_pulsar_orbit`, new): nuclear pasta from the inner crust (spaghetti for cable, lasagna for plate) and the polar cap tap.
- **Cassiopeia A** (`grindless:cas_a_remnant`, new): titanium-44 from the remnant's ejecta knots, the only long-lived positron source this pack has.

Everything is built against uiv.md as designed; where a UIV package is not merged yet, the dependency is named (UIV-A10, B1-B5, M2, C1-C3). Nothing in UIV is reworked.

**Size (rule 7):** guidance, never padding. Counted as uiv.md:20-39 counts: a progression multiblock has a product of its own; a line is a real chain of at least 4 steps (rule 7) that ends in a UXV part, a stored item or a fuel; a crossing is a UXV line that consumes, or feeds, a line or machine of UEV or older (UIV is one era back and does not count).

| | UIV (as designed) | UXV (this design) | Growth | Guideline |
|---|---|---|---|---|
| Progression multiblocks | 22 | 21 | x0.95 | ~30 (x1.35) |
| Process lines | 46 (333 steps, avg 7.2) | 49 (359 steps, avg 7.33) | x1.07 | ~69 (x1.5) |
| Crossings with lines two or more eras back | 100 (UHV and older) | 178 (UEV and older, 44 machines) | x1.78 | ~150 |
| Older machines with a new mode | 58 | 46 (about 135 rows) | x0.79 | none |
| Places with a product of their own | 3 | 3 (+ home) | x1.0 | breadth |

**Why 21 machines:** every machine has a route only it gives; the nine candidates that would reach ~30 are second routes to existing products (tetrataenite `luv/foundation.js:12`, CNT muscles `uev/earth_orbit.js:27`), convenience versions or OpV material, listed with reasons under Considered and dropped. A 22nd for parity is an open question (default no).

**Why 49 lines, not 69:** the lines grow (x1.07) but short of x1.5, and it is honest. Steps are counted by UIV's method (as-built upstream rows from the raw or older product, a shared older prefix counted in each line, uiv.md:20-39), so the averages compare: 7.33 against UIV's 7.2 (DECISIONS.md:377: the average never falls). Lines 44-49 are the parts UXV consumes that were first treated as assemblies: the STNO array, the arm's strain-wave gear and encoder, the hatches' Ga₂O₃ die and voltage coil, the mainframe's shielded interposer. The 20 missing lines are each a second route to a product UXV or an older era already has, a data chain, an assembly with no feedstock, a chain under 4 steps, or OpV material (named one by one under Considered and dropped, Lines). Crossings (178, x1.78) pass the ~150 guideline because every UXV line is fed by older plants: the stellar burning ring feeds its own ash back as the next fuel through ZPM and UEV machines, and spintronics pulls on six older eras' chemistry. Accepting 49 is an open question (default accept: growth resumes with OpV's bulge, journey.md:53).

- complexity.md:97: difficulty is steps, conditions, multiblocks and crossings, never quantity. UXV adds conditions (glitch timing, Roche-lobe lifting, site locks, fuel sequences that need the previous fuel's ash) rather than bigger numbers.
- No UXV coil: nothing in UXV needs more than the UIV metallic hydrogen coil's 14,400 K.
- highTierContent stays off (DECISIONS.md:499).

**The UXV era in four sentences.** At home the player builds spin-based logic (MTJs, magnetoelectric switches, van der Waals readouts, racetracks and magnonic buses) into the spintronic mainframe, and a superfluid helium gyroscope into the UXV sensor. At Cygnus X-1 they lift plasma off a supergiant and skim a black hole's disk, filtering one into fusion fuels and trapping the other in field-reversed rings. Those rings and a CNT Whipple shield let the Kerr sling throw relay seeds to Vela, where nuclear pasta becomes cable and plate, and to Cassiopeia A, where titanium-44 drives a gamma-ray laser. The Mk6 fusion ring then burns the star's sequence (CNO, helium, carbon, oxygen), each fuel made from the ash of the one before, and the gate holds 2^31 EU/t at Cygnus X-1 to chart the galactic bulge.

## Route

1. **Spintronics (home, substage `uxv`).** MTJ sputter cluster, oxide PLD chamber, vdW stacking cell, racetrack fab and YIG LPE furnace; their dies are joined into `gtnn:spintronic_mainframe` on the UEV photonic integration hall (new row). The mainframe is the UXV circuit (`#gtceu:circuits/uxv`, S0-5). Before UXV hatches exist, UXV recipes run on two UIV hatches (WorkableElectricMultiblockMachine.java:250-273, as uiv.md cites).
2. **The sensor.** The SHeQUID works makes the superfluid gyroscope; with the MTJ die and the existing `grindless:nv_diamond_chip` (`zpm/qubits.js:28`) it becomes `grindless:uxv_sensor`, the only UXV component made before Vela.
3. **Superheavies III.** UIV line 32's Es/Fm debris is split by the UHV transuranium HDEHP rows (as built, UIV-B2); the UEV calutron takes Fm-257 out, and Fm-257, Es-254 and Cm-248 (the IV hot cell's Cf-252 decay store, as built) are plated as targets; the UEV cyclotron makes elements 121 and 122 with UIV's Ti-50 (`grindless:superheavy_census_iii`); the MNT collider reaches the N=184 island (`grindless:island_chart`).
4. **Back to Cygnus X-1.** The stellar elevator lifts HDE 226868's envelope at L1; the plasma mass filter splits it into H, He-4, CNO and heavy cuts; the condensation tower is the heavy cut's destination (rule 3). The accretion disk skimmer takes disk plasma, the FRC former traps it as `grindless:frc_cartridge`, and the BZ dynamo draws power from the black hole's spin.
5. **The Kerr sling.** UIV's ergosphere probe bay slings a relay seed (new mode); the Cygnus warp gate throws the player to Vela (consumes an FRC cartridge, the M2P2 shield) or to Cas A (consumes a CNT Whipple shield). Substages `uxv-vela` and `uxv-cas-a` run in parallel.
6. **Vela.** The pasta extractor works the crust at glitch time; the phase sorter (each phase leaves in a `grindless:cage_part` made by a new mode of UIV's neutronium cage at RX J1856) splits spaghetti, lasagna, gnocchi and the anti-phases; the draw bench makes the UXV strand cable, the laminator the hull plate. `gtceu:uxv_machine_hull` and UXV hatches follow. The polar cap tap gives power.
7. **Cassiopeia A.** The ejecta knot sweeper gathers Ti-rich dust; the EV extraction cascade, UEV calutron and IV hot cell make a sealed Ti-44/Sc-44 core; the annihilation laser works turns it into a gamma laser module and `grindless:uxv_emitter`.
8. **Parts, power and scale.** The UXV motor, pump, conveyor, piston, arm and field generator; the Mk6 stellar burning ring; wireless case 12 and the UXV SMES cell; the x65,536 parallel hatch; the stellar fractionation hall (mega).
9. **Gate to OpV.** The UIV Matrioshka computes the arm chart (Vela glitch record, Cas A Ti-44 map, Cygnus elevator log, EHT VLBI record); the Cygnus warp gate holds 16 A x V[UXV] = 2^31 EU/t and returns `grindless:bulge_chart`, which researches `gtceu:opv_machine_casing`.

## Inherited, as built

| Piece | From | State |
|---|---|---|
| `gtceu:uiv_machine_hull`, UIV energy hatches, `.tiers(UEV, UIV)` | UIV-F1 (`uev/foundation.js:177-204`) | merged |
| UIV components, `gtnn:optical_mainframe` tag | UIV-A7, A8 | merged |
| Mk5 ring, `fusion_mk5.json`, `uiv_fusion_casing` | UIV-A9 | merged |
| Wireless case 11, `uiv_smes_cell` | UIV-W | merged |
| Parallel hatch tiers 9-11 | UIV-M1 (`lib/parallel_hatch.js:80-84`) | merged |
| Ti-50 oven charge, census II, Es/Fm debris (line 32) | UIV-A1 | merged |
| Matrioshka computer | UIV-A10 | running |
| Relay seed, launched seed, platforms table, SITES key `cygnus_x1_orbit` | UIV-B1 | to come |
| Neutronium cage, r-process decompressor | UIV-B2 | to come |
| Positronium lab, gamma cavity (line 34), solid neon moderator (line 45) | UIV-B3 | to come |
| Ergosphere probe bay, Penrose engine, `kerr_chart` | UIV-B4, B5 | to come |
| Neutronium compression hall, x16,384 hatch | UIV-M2 | to come |
| `gtceu:uxv_machine_casing`, `gtceu:opv_machine_casing` (GTM) | GTM 7.5.3 | exists (dump) |
| `gtnn:spintronic_mainframe` and lower spintronic circuits | GT-- | exist (dump) |

Existing pack ids UXV reuses instead of making again: `gtceu:tetrataenite` ingot, rod and dust (LuV material, `luv/foundation.js:12`; ore split at the belt, `luv/asteroid_belt.js:47`), `grindless:cnt_coiled_muscle` and `cnt_densified_yarn` (UEV, `uev/earth_orbit.js:27`), `grindless:nv_diamond_chip` (ZPM, `zpm/qubits.js:28`), `grindless:whipple_shield_casing` (LuV, `luv/foundation.js:126`), `grindless:neutronium_pellet`, `grindless:mh_winding`, `grindless:wf_rhea_billet` (UIV, `uiv/foundation.js:33-68`).

## Places and site rules

| Place | Dimension id | GCYR tier | Reached by | Role |
|---|---|---|---|---|
| Earth | `minecraft:overworld` | n/a | home | spintronics, gyroscope, superheavies, gamma laser, Mk6 |
| Cygnus X-1 orbit | `grindless:cygnus_x1_orbit` | 11 (UIV-B1) | UIV warp gate | star lifting, disk skimming, FRC, BZ power, the gate |
| Vela pulsar orbit | `grindless:vela_pulsar_orbit` | 12 (S0-3; fallback 11) | Kerr sling, c8 | nuclear pasta, polar cap tap |
| Cassiopeia A | `grindless:cas_a_remnant` | 12 (S0-3; fallback 11) | Kerr sling, c9 | Ti-44 |

Site rules (as UIV, DECISIONS.md:498): new places are void datapack dimensions (GCYR 0.2.9 tier from S0-3), with no atmosphere and low gravity (S0-9); each arrival platform is a row in `tables/relay_platforms.json` (UIV-B1). Site-locked machines check `.dimension` in their recipes: elevator, filter c1, condensation tower, skimmer, FRC former c1 and BZ at Cygnus; the four pasta machines and the tap at Vela; the sweeper at Cas A.

- Vela PSR B0833−45: 89 ms period, 287 pc (Dodson 2003), glitches about every 2.5-3 years with Δν/ν ≈ 10⁻⁶ (Radhakrishnan & Manchester 1969). Pasta sits at 0.5-0.9 of nuclear saturation density in the inner crust's base (Ravenhall, Pethick & Wilson 1983; Hashimoto, Seki & Yamada 1984).
- Cas A: about 340 years old at 3.4 kpc; NuSTAR mapped about 1.25 x 10⁻⁴ M☉ of Ti-44 in knots (Grefenstette 2014, Nature 506:339); Ti-rich plumes trace neutrino-driven convection (Sato 2021, Nature 592:537). Ti-44 half-life 59 years, to Sc-44 (3.97 h, β+ 94%) to stable Ca-44.
- Cygnus X-1: 21.2 M☉ black hole, 40.6 M☉ O9.7Iab companion HDE 226868, 5.6 day orbit, 2.22 kpc (Miller-Jones 2021, Science 371:1046; Orosz 2011). The companion nearly fills its Roche lobe, so its wind is focused toward L1 (Miškovičová 2016).

### Sunlight (B1 platform rows)

| Place | Sunlight | Solar panels |
|---|---|---|
| Cygnus X-1 orbit | as UIV-B1 | as UIV-B1 |
| Vela pulsar orbit | none (the pulsar emits no useful optical light) | 0 |
| Cassiopeia A | none (no star) | 0 |

## Bridges and first arrivals

| Bridge | From → to | Why it cannot be made there |
|---|---|---|
| `grindless:frc_cartridge` | Cygnus → warp gate c8, field generator, gate | disk plasma is site-locked to Cygnus |
| `grindless:cnt_whipple_shield` | home → warp gate c9 | assembled from LuV, UEV and UIV parts at home |
| `grindless:launched_relay_seed` | UIV probe bay (Cygnus) → warp gate c8/c9 | UIV-B1 item, slung by a new probe bay mode |
| `pasta_strand` wire, `grindless:lasagna_plate` | Vela → home, Cygnus | pasta exists only at Vela |
| `grindless:ti44_core` | home (from Cas A dust) → annihilation works | Ti-44 exists only in Cas A |
| stellar H, He-4 and CNO cuts | Cygnus → home Mk6 | stellar plasma is site-locked |
| `grindless:superheavy_census_iii`, `island_chart` | home → gate | home accelerators only |
| `grindless:cage_part` | RX J1856 (UIV cage mode) → Vela sorter | the neutronium cage is site-locked at RX J1856 (uiv.md:381) |

First arrival on Vela and Cas A is UIV-B1's platform kit (a row each in `relay_platforms.json`, same kit, S0-10) with its AE2 seed (uiv.md:677-679): home materials, water and air arrive over AE2, the backbone between planets (DECISIONS.md:59). No platform receives a product of its place.

**Bootstrap (UEV-C1 lesson, DECISIONS.md:516-517).** Vela travel needs the FRC cartridge, made at Cygnus with UIV `mh_winding` coils, never pasta. Cas A travel needs the Whipple shield, made without lasagna. Every Vela and Cas A controller uses only home and Cygnus products. Checked one by one under Risks.

## Automatic resource generation

| Resource | Machine | Place | Catalyst |
|---|---|---|---|
| H, He-4, CNO and heavy cuts | plasma mass filter | Cygnus X-1 | stellar plasma |
| Refractory (Al, Ca, Ti oxides), metal (Fe, Ni, Co), silicate (Mg, Si) and volatile (H₂O, CO, N₂, S) cuts | stellar condensation tower | Cygnus X-1 | stellar plasma |
| Disk plasma | accretion disk skimmer | Cygnus X-1 | none (site) |
| Pasta slurry | pasta extractor | Vela | `grindless:vela_glitch_timing` (kept) |
| Ejecta knot dust (Ti, Si, S, Ar, Ca, Fe) | ejecta knot sweeper | Cas A | none (site) |

The condensation cuts are the honest destination of the filter's heavy cut (rule 3): ordinary materials made automatically at Cygnus and sent to stock over AE2. They are not line endpoints and not the platforms' supply (AE2 ships home materials, DECISIONS.md:59). Ash of the Mk6 ring returns as fuel or stock (Fusion).

## Only from there and cuts

| Product | Only from | Uses |
|---|---|---|
| `grindless:stellar_plasma`, stellar cuts | Cygnus elevator and filter | Mk6 fuels, condensation |
| `grindless:disk_plasma` | Cygnus skimmer | FRC, BZ fuel, OpV reserve |
| `grindless:frc_cartridge` | FRC former | Vela travel, field generator, gate |
| Nuclear pasta (`spaghetti_strand`, `lasagna_plate`, `pasta_core_sample`) | Vela | cable, hull, gate, OpV reserve |
| `grindless:ti44_core` | Cas A dust via older plants | gamma laser, emitter |
| `gtnn:spintronic_mainframe` | photonic integration hall row | UXV circuit |

**Cuts (F2, integrator, DECISIONS.md:528 pattern).** F2 removes by output: GT--'s own recipe for `gtnn:spintronic_mainframe`, and every GT-- or extendedfeatures UXV-tier item with a recipe that a UXV part replaces (list taken from the S0-1 dump). F2 adds a class B obtain rule for each new id in this design; each producing package deletes its own rule and any EMI "use" exception its recipes resolve. Every cut lands with its replacement (Build order).

## Our multiblocks

| Place | Machines | Count |
|---|---|---|
| Earth | MTJ sputter cluster, oxide PLD chamber, vdW stacking cell, racetrack fab, YIG LPE furnace, SHeQUID works, MNT collider, annihilation laser works, Mk6 fusion ring | 9 |
| Cygnus X-1 orbit | stellar elevator, plasma mass filter, stellar condensation tower, accretion disk skimmer, FRC former, BZ dynamo | 6 |
| Vela pulsar orbit | pasta extractor, pasta phase sorter, pasta draw bench, pasta laminator, polar cap tap | 5 |
| Cassiopeia A | ejecta knot sweeper | 1 |
| | | **21** |

**Not counted:** the stellar fractionation hall (mega family, M2), the UXV parallel hatch (M1), hatches, the hull, the SMES cell.

### Audit

Keys: what the era needs the machine for. Policy: H home (runs on two UIV hatches until UXV hatches exist), S site-locked, G generator.

| # | Machine | Route only it gives | Keys | Policy |
|---|---|---|---|---|
| 1 | MTJ sputter cluster | MgO-barrier tunnel junctions, Heusler MRAM, STNO stacks | sensor die, mainframe, magnonic bus | H |
| 2 | Oxide PLD chamber | perovskite magnetoelectric stacks | MESO write | H |
| 3 | vdW stacking cell | hBN-encapsulated WTe₂/FGT stacks | MESO read | H |
| 4 | Racetrack fab | domain-wall shift registers | mainframe storage | H |
| 5 | YIG LPE furnace | low-damping YIG on GGG | magnonic bus | H |
| 6 | SHeQUID works | superfluid Josephson gyroscope | sensor | H |
| 7 | MNT collider | neutron-rich island nuclides | island chart, OpV reserve | H |
| 8 | Annihilation laser works | stimulated 511 keV emission | emitter | H |
| 9 | Mk6 fusion ring | CNO, helium, carbon and oxygen burning | power, ash chain | H, G-fed |
| 10 | Stellar elevator | stellar plasma | fuels, condensation | S |
| 11 | Plasma mass filter | mass-split stellar and disk cuts | Mk6 fuels | S (c1-c3) |
| 12 | Stellar condensation tower | heavy cut condensed in sequence | rule 3 for the heavy cut; syngas, stock | S |
| 13 | Accretion disk skimmer | disk plasma | FRC, BZ, OpV reserve | S |
| 14 | FRC former | trapped compact toroids | Vela travel, field generator, gate | S (c1) |
| 15 | BZ dynamo | black-hole spin power | power | S, G |
| 16 | Pasta extractor | nuclear pasta | cable, plate | S |
| 17 | Pasta phase sorter | phase-pure pasta | cable, plate, gate | S |
| 18 | Pasta draw bench | spaghetti strand | UXV cable, motor, coils | S |
| 19 | Pasta laminator | lasagna plate | hull, electrodes | S |
| 20 | Polar cap tap | pulsar polar-cap current | power | S, G |
| 21 | Ejecta knot sweeper | Ti-44-rich dust | emitter | S |

### Voltages and controllers

UXV recipes run up to 1 A x V[UXV] = 134,217,728 EU/t on two UIV energy hatches, because a multiblock with two or more hatches of its highest tier runs one tier up (WorkableElectricMultiblockMachine.java:250-273, as uiv.md cites). UXV hatches are needed only for the Mk6 ring, the gate's 16 A hold and anything above 1 A UXV. All EU/t and ticks below are *(tune)*.

**Controllers (QR ladder, `docs/quality/recipes.md`; DECISIONS.md:551-567).** Every controller is a GTM `assembly_line` recipe with station research (`data_module`). The research item is a product of the machine's own line or the machine before it, never a GTM component GTM already researches. Each recipe keeps the draft base:

- machines 1-6: `gtceu:uiv_machine_hull` + 2 `gtnn:optical_mainframe` + UIV components;
- machines 7, 8 and 10-21: `gtceu:uiv_machine_hull` + 2 `gtnn:spintronic_mainframe` + `grindless:uxv_sensor` + UIV components;
- the Mk6 and the M2 hall: `gtceu:uxv_machine_hull` + UXV components.

To the base it adds one era fluid (1,000 mB *(tune)*) and three domain inputs: ids only this pack makes, tied to the process, never the machine's own product. Every controller has 8 or more distinct ingredients (the gate asks for 5). Earth controllers 1-8 take `grindless:he_6n` (F1 fluid, A2's cryogenic row): the Cygnus fluids do not exist before B2. Controllers 10-21 and M2 take a Cygnus fluid once B2 or B3 has made it (`filtered_disk_plasma` also matches the gate's `plasma$`). No controller of 1-8 or 10-21 uses a Vela or Cas A product (bootstrap, Risks).

| # | Research item | Era fluid | Domain inputs |
|---|---|---|---|
| 1 | `cofeb_target` | `he_6n` | `ta_seed_target`, `mgo_target`, `mu_metal_foil` |
| 2 | `srruo3_target` | `he_6n` | `krf_excimer_laser`, `vuv_caf2_optic`, `pt_sheet` |
| 3 | `wte2_crystal` | `he_6n` | `terfenol_d_rod`, `sin_membrane`, `vuv_caf2_optic` |
| 4 | `saf_track_wafer` | `he_6n` | `mtj_die`, `pt_sheet`, `ga2o3_power_die` |
| 5 | `ggg_wafer` | `he_6n` | `pt_lpe_crucible`, `w184_cvi_preform`, `pt_sheet` |
| 6 | `nanoaperture_array` | `he_6n` | `mu_metal_foil`, `sin_membrane`, `mtj_die` |
| 7 | `cm248_target` | `he_6n` (catcher buffer) | `gas_stopping_cell`, `u238_ion_source`, `mu_metal_foil` |
| 8 | the UIV gamma cavity (UIV line 34 id, as built) | `he_6n` | `mtj_die`, `mu_metal_foil`, `w184_cvi_preform` |
| 9 Mk6 | the Mk5 controller (UIV-A9 id, as built) | `stellar_hydrogen_cut` | `uxv_fusion_casing`, `uxv_field_generator`, `uxv_electric_pump` |
| 10 | `mh_winding` | `he_6n` | `ga2o3_power_die`, `w184_cvi_preform`, `mu_metal_foil` |
| 11 | `gtceu:stellar_elevator` | `he_6n` | `ga2o3_power_die`, `mh_winding`, `w184_cvi_preform` |
| 12 | `gtceu:plasma_mass_filter` | `stellar_helium_cut` | `pt_sheet`, `w184_cvi_preform`, `grindless:iridium_crucible` |
| 13 | `mh_winding` | `stellar_hydrogen_cut` | `ga2o3_power_die`, `w184_cvi_preform`, `shielded_interposer` |
| 14 | `gtceu:accretion_disk_skimmer` | `stellar_hydrogen_cut` | `ga2o3_power_die`, `mh_winding`, `vuv_caf2_optic` |
| 15 | `gtceu:frc_former` | `filtered_disk_plasma` | `frc_cartridge`, `ga2o3_power_die`, `mh_winding` |
| 16 | `vela_glitch_timing` | `filtered_disk_plasma` | `cage_part`, `frc_cartridge`, `neutronium_pellet` |
| 17 | `cage_part` | `filtered_disk_plasma` | `frc_cartridge`, `neutronium_pellet`, `ga2o3_power_die` |
| 18 | `gtceu:pasta_phase_sorter` | `stellar_helium_cut` | `cage_part`, `frc_cartridge`, `uxv_strain_wave_gear` |
| 19 | `wf_rhea_billet` | `filtered_disk_plasma` | `cage_part`, `frc_cartridge`, `w184_cvi_preform` |
| 20 | `gtceu:pasta_laminator` | `filtered_disk_plasma` | `frc_cartridge`, `ga2o3_power_die`, `mh_winding` |
| 21 | `cnt_whipple_shield` | `stellar_hydrogen_cut` | `cnt_bumper_weave`, `mh_winding`, `ga2o3_power_die` |
| M2 | `gtceu:stellar_condensation_tower` | `stellar_helium_cut` | `lasagna_plate`, `uxv_electric_pump`, `pt_sheet` |

The research items are all ours and none is a Vela or Cas A product: `vela_glitch_timing` is the ZPM DSN's home record, and `cage_part` is made at RX J1856. The M2 hall needs `lasagna_plate` and the UXV hull, so it stays at `uxv-vela`, as drafted.

**Forms of everything else (QR; no crafting table anywhere in UXV).**

- **Assembly line with station research:** the UXV hull, the four UXV energy hatches, M1's parallel hatch and the eight UXV components (sensor, motor, pump, piston, conveyor, arm, field generator, emitter). Each takes an era fluid and at least two domain inputs.
- **Assembler, bulk casing:** `uxv_fusion_casing` is the only new casing block. Its recipe takes `wf_rhea_billet`, `w184_cvi_preform`, `mh_winding`, `uxv_field_generator` and `gtceu:tritanium_frame`, plus 1,000 mB `he_6n` backfill. That is 5 items and 1 domain fluid, scoring about 10 against the proposed 9.5 floor.
- **Machine form (one of our multiblocks or an older type) or assembly line:** every other new part, as drafted:
  - `pt_lpe_crucible`, `gas_stopping_cell`, `krf_excimer_laser`;
  - `cnt_whipple_shield`, `pasta_strand_repeater`, `uxv_smes_cell`;
  - `uxv_voltage_coil`, `tmr_encoder`, `uxv_strain_wave_gear`;
  - `frc_cartridge`, `gamma_laser_module`.

  An item made by an assembler or assembly line must clear the UXV C-COMPLEX floor. Plan for depth 6 or more with 5 items and 1 fluid.
- **Crafting table:** none. The only exceptions are a save-compat 1:1 conversion or unpacking.

**Structures (QR, `docs/quality/structures.md`).** Every structure below passes `structure-quality.mjs --static --check`:

- **Rubric:** not a solid cuboid; at least 3 blocks; no block above 70% of the cells (designed at 60% or less, so hatches swapped into casing positions cannot push it over); at least 2 functional kinds (glass, pipe, frame, coil, machine).
- **Shape:** UV and later are never a 5x5x7 box. The silhouette reads as the process, and every hatch sits on the outer skin within the player's reach.
- **Controller model:** each controller sets `.appearanceBlock(<main casing>)` and `.workableCasingModel(<casing texture>, 'grindless:block/multiblock/<machine>')`, with an active emissive overlay (the package's texture script).
- **Rhino:** pattern loops use `var`, never `const`, and `Predicates.custom` previews do not use `Java.to`.
- **Shell helper:** each package builds its shell with a local helper in its own startup file. A shared helper would live in lib, which the integrator owns (open question 14).
- **Blocks:** only these, all present by UIV:
  - GTM: `plascrete`, `cleanroom_glass`, `laminated_glass`, `fusion_glass`, `superconducting_coil`, `tritanium_coil_block`, `high_power_casing`, `filter_casing`, `computer_casing`, `computer_heat_vent`, `robust_machine_casing`, `clean_machine_casing`, `uiv_machine_casing`, `uxv_machine_casing` (UIV-B5);
  - GTM pipe casings and gearboxes: titanium and tungstensteel;
  - frames from `Pat.frame`'s list only: stainless steel, tungsten steel, naquadah alloy and HSS-S;
  - ours: `grindless:cryostat_casing`, `neutron_star_site_casing`, `whipple_shield_casing`, `uxv_fusion_casing`.
- **Dropped dump-check casings:** the draft's three (`laser_safe`, lead-lined, `high_temperature_smelting`). None is certain to exist; each machine's spec names its replacement.

Sizes grew where the draft had a box; the machines, types and recipes are unchanged.

### 1. MTJ sputter cluster: `gtceu:mtj_sputter_cluster`, type `gtceu:mtj_sputtering` (Earth)

**What it gains:** multi-gun magnetron sputtering of 1 nm layers with in-situ MgO (001) texture and coherent Δ1 tunnelling; nothing older deposits a tunnel barrier. Tunnel magnetoresistance above 600% (Ikeda 2008).
**Recipes:** c1 `cofeb_target` + `mgo_target` + Ta and Ru targets + `grindless:h_si28_wafer` → `mtj_stack_wafer` (33,554,432 EU/t, 600 t); c2 `heusler_target` + `mgo_target` + wafer → `mram_stack_wafer` (67,108,864 EU/t, 800 t); c3 `saf_target_set` + wafer → `saf_track_wafer` (33,554,432 EU/t, 600 t); c4 `heusler_target` + `mgo_target` + wafer → `stno_stack_wafer`, a thicker free layer for spin-torque nano-oscillators (33,554,432 EU/t, 700 t *(tune)*; line 44).
**Byproducts:** spent targets → UV powder bed (re-pressed, 80% back).
**Structure (QR):** 11x7x11 cluster tool. A hollow octagonal transfer hub 5 wide sits in the centre, four gun bays stand on its diagonals and a load lock is on the front.
- Blocks: `gtceu:plascrete` (appearance, ~50%: hub and bay walls); `gtceu:cleanroom_glass` (~20%: hub roof and bay windows); a `gtceu:superconducting_coil` ring round each magnetron gun; `gtceu:tungstensteel_pipe_casing` gas runs from the back wall to each bay; `gtceu:stainless_steel_frame` load-lock rails.
- Kinds: glass, coil, pipe, frame.
- Hatches: energy and maintenance on the back wall; input and output buses at the load lock.
**Crossings:** UV powder bed (targets), EV platinum plant (Ru, Pt), UEV nitride magnet works (field anneal).
**Risks:** none beyond circuits on shared types.
**Source:** Parkin 2004 (Nature Mater 3:862); Yuasa 2004 (Nature Mater 3:868); Ikeda 2008 (APL 93:082508); Ikeda 2010 (Nature Mater 9:721).

### 2. Oxide PLD chamber: `gtceu:oxide_pld_chamber`, type `gtceu:pulsed_laser_deposition` (Earth)

**What it gains:** stoichiometric complex-oxide epitaxy, unit cell by unit cell (RHEED); nothing older grows perovskite heterostructures.
**Recipes:** c1 `srruo3_target` + `dysco3_substrate` → `srruo3_electrode_wafer` (33,554,432 EU/t, 400 t); c2 + `la_bfo_target` → `bfo_film_wafer` (67,108,864 EU/t, 600 t); c3 + CoFe target (sputter c4 bank) → `me_switch_wafer` (67,108,864 EU/t, 600 t).
**Byproducts:** ablated plume dust → UV powder bed.
**Structure (QR):** 9x9x13. An octagonal vacuum chamber 9 wide has a beamline arm running out at 45° to a laser bay.
- Blocks: `gtceu:plascrete` (appearance, ~55%: chamber and bay); `gtceu:laminated_glass` beamline arm (it replaces the dump-check `laser_safe` casing); a `gtceu:tritanium_coil_block` substrate heater under the chamber; `gtceu:computer_casing` RHEED gun and screen on the opposite walls; `gtceu:tungsten_steel_frame` struts under the arm.
- Kinds: glass, coil, machine, frame.
- Hatches: energy on the laser bay; buses on the chamber front.
**Crossings:** UHV crystal growth (DyScO₃), EV platinum plant (Ru), UV powder bed.
**Source:** Manipatruni 2019 (Nature 565:35); Heron 2014 (Nature 516:370); Ramesh & Spaldin 2007 (Nature Mater 6:21).

### 3. vdW stacking cell: `gtceu:vdw_stacking_cell`, type `gtceu:vdw_stacking` (Earth)

**What it gains:** robotic dry transfer of exfoliated flakes in argon, with twist control; nothing older assembles air-sensitive 2D stacks.
**Recipes:** c1 `wte2_crystal` → 4 `wte2_flake` (8,388,608 EU/t, 200 t); c2 `fgt_crystal` → 4 `fgt_flake`; c3 `hbn_crystal` → 8 `hbn_flake`; c4 2 `hbn_flake` + `wte2_flake` + `fgt_flake` → `sot_readout_stack` (67,108,864 EU/t, 900 t).
*(QR: c1-c3 also take 50 mB argon, the glovebox purge, which is consumed. They give the offcuts below as a real chanced output (25% *(tune)*, a small dust of the crystal) so that the destination exists in EMI.)*
**Byproducts:** flake offcuts → recrystallised on the UHV crystal growth furnace (c5 back, 50%).
**Structure (QR):** 11x6x9 glovebox line, an L-shaped bench with an antechamber at one end.
- Blocks: `gtceu:clean_machine_casing` (appearance, ~50%); a `gtceu:cleanroom_glass` front with three glove ports in `gtceu:titanium_pipe_casing` sleeves; a `gtceu:filter_casing` argon purifier column at the far end; a `gtceu:computer_casing` microscope turret on the roof.
- Kinds: glass, pipe, machine.
- Hatches: argon input on the purifier column; buses at the antechamber; energy on the back.
**Crossings:** UHV crystal growth (CVT crystals), UEV megabar (hBN), UV BN reactor, EV cryogenic plant (argon).
**Source:** MacNeill 2017 (Nature Phys 13:300); Alghamdi 2019 (Nano Lett 19:4400); Shin 2022 (Adv Mater); Mannix 2022 (Nature Nanotech 17:361).

### 4. Racetrack fab: `gtceu:racetrack_fab`, type `gtceu:racetrack_patterning` (Earth)

**What it gains:** synthetic-antiferromagnet tracks with chiral, DMI-stabilised domain walls that current pulses shift in lockstep; nothing older stores data by moving walls.
**Recipes:** c1 `saf_track_wafer` → `patterned_track_wafer` (33,554,432 EU/t, 600 t); c2 `patterned_track_wafer` + `mtj_stack_wafer` (read heads) → `racetrack_chip` (67,108,864 EU/t, 900 t).
*(QR: c1 was 1 in, 1 out. It now also takes 100 mB argon for the ion mill, which is consumed, and gives the etch residue as a real output: 25% `gtceu:platinum_group_sludge_dust`, the EV platinum plant's input as built.)*
**Byproducts:** etch residue → EV platinum plant (Pt, Ru recovery).
**Structure (QR):** 13x7x9 litho bay. A long cleanroom has an e-beam column rising through its roof and a wafer track on its floor.
- Blocks: `gtceu:plascrete` (appearance, ~50%); `gtceu:cleanroom_glass` side windows; a `gtceu:filter_casing` ceiling; the `gtceu:superconducting_coil` e-beam column; a `gtceu:stainless_steel_frame` wafer track.
- Kinds: glass, machine, coil, frame.
- Hatches: argon input at the ion-mill end; buses at the track ends.
**Crossings:** EV platinum plant both ways, UEV electron beam furnace (patterning row).
**Source:** Parkin, Hayashi & Thomas 2008 (Science 320:190); Yang, Ryu & Parkin 2015 (Nature Nanotech 10:221); Fert, Cros & Sampaio 2013 (Nature Nanotech 8:152).

### 5. YIG LPE furnace: `gtceu:yig_lpe_furnace`, type `gtceu:liquid_phase_epitaxy` (Earth)

**What it gains:** isothermal dipping epitaxy from a PbO-B₂O₃ flux near 900 °C; YIG with damping near 10⁻⁵ grows only this way, on GGG.
**Recipes:** c1 PbO + B₂O₃ → `lpe_flux` (fluid, 4,194,304 EU/t, 200 t); c2 Y₂O₃ + Fe₂O₃ + `lpe_flux` + `ggg_wafer` → `yig_film_wafer` + spent flux (33,554,432 EU/t, 1,200 t); c3 spent flux → PbO + B₂O₃ (90%).
**Byproducts:** Pb-bearing flux closed in c3; dross → EV extraction cascade (Pb).
**Structure (QR):** 7x13x7 vertical three-zone tower, stepped in at each zone, with the dip head on top.
- Blocks: `gtceu:robust_machine_casing` (appearance, ~50%; it replaces the dump-check `high_temperature_smelting` casing); three `gtceu:tritanium_coil_block` heater bands; a `gtceu:laminated_glass` viewport at the melt line; a `gtceu:tungstensteel_gearbox` dip head that rotates and withdraws the wafer; `gtceu:tungsten_steel_frame` legs. The Pt crucible is the controller's `pt_lpe_crucible`, not a block.
- Kinds: machine, coil, glass, frame.
- Hatches: flux input and output hatches at the base; buses at the dip head.
**Crossings:** UHV crystal growth (GGG), EV platinum plant (crucible), EV extraction cascade.
**Source:** Chumak 2015 (Nature Phys 11:453); Serga, Chumak & Hillebrands 2010 (J Phys D 43:264002).

### 6. SHeQUID works: `gtceu:shequid_works`, type `gtceu:shequid_assembly` (Earth)

**What it gains:** superfluid He-4 Josephson weak links in a multi-turn loop: the phase shift 4πmΩ·A/h measures rotation. Nothing older uses the superfluid Josephson effect.
**Recipes:** c1 `nanoaperture_array` + cell body (Ti, as built) → `weak_link_cell` (16,777,216 EU/t, 400 t); c2 2 `weak_link_cell` + 1,000 mB isotopically pure superfluid He-4 + `mtj_die` (readout) → `shequid_gyro` (33,554,432 EU/t, 1,200 t).
**Byproducts:** boil-off He → UV cold (recondensed).
**Structure (QR):** 9x11x9 cryostat tower on a rotation platform: a round dewar narrowing to a neck.
- Blocks: `grindless:cryostat_casing` (appearance, ~55%); `gtceu:superconducting_coil` shield rings; a `gtceu:titanium_pipe_casing` helium fill line up the side; a `gtceu:tungstensteel_gearbox` turntable under the dewar; a `gtceu:computer_casing` readout rack at the foot.
- Kinds: machine, coil, pipe.
- Hatches: He-II input on the fill line; boil-off output at the neck; buses at the readout rack.
**Crossings:** UV cold (He-II, heat-flush purification row), UEV electron beam furnace (apertures), UV MOCVD (SiN).
**Source:** Hoskinson, Sato & Packard 2006 (PRB 74:100509); Sato & Packard 2012 (Rep Prog Phys 75:016401); Narayana & Sato 2011 (PRL 106:255301).

### 7. MNT collider: `gtceu:mnt_collider`, type `gtceu:multinucleon_transfer` (Earth)

**What it gains:** deep-inelastic U-238 + Cm-248 collisions near the Coulomb barrier, a gas catcher and a multi-reflection time-of-flight spectrometer; fusion-evaporation (UEV cyclotron) stays neutron-poor, MNT reaches toward N=184.
**Recipes:** c1 `u238_beam_charge` + `cm248_target` → `mnt_product_gas` (134,217,728 EU/t, 2,400 t); c2 → gas catcher → `mnt_thermal_ions` (33,554,432 EU/t, 400 t); c3 MR-TOF → `island_nuclide` + light fragments (67,108,864 EU/t, 1,200 t); c4 16 `island_nuclide` → `island_chart` (data, 8,388,608 EU/t).
*(QR: c2 was 1 in, 1 out. The gas catcher now takes 100 mB `grindless:he_6n` buffer gas and returns 90 mB `gtceu:helium` to A2's cryogenic `he_6n` row. c4 also takes 1 `gtceu:data_module`, the medium of the chart.)*
**Byproducts:** light fragments (Pb, Hg, Pt region) → ZPM actinide partitioning; activated target → ZPM waste retrieval.
**Structure (QR):** 9x7x23 beamline: a source end, the target chamber, a 2-block-wide beam pipe and the catcher and MR-TOF at the far end.
- Blocks: `gtceu:high_power_casing` (appearance, ~50%: the shell); `gtceu:superconducting_coil` quadrupole pairs every 4 blocks; `gtceu:tungstensteel_pipe_casing` beam pipe between the quads; a `grindless:cryostat_casing` gas catcher; `gtceu:naquadah_alloy_frame` supports; `gtceu:computer_casing` MR-TOF and DAQ.
- Kinds: coil, pipe, machine, frame.
- Hatches: beam-charge bus at the source; target bus at the chamber; `he_6n` input on the catcher; outputs at the MR-TOF.
**Crossings:** UV synchrotron (U-238 beam), ZPM actinide partitioning (fragments), ZPM waste retrieval, IV hot cell (Cm-248 decay store, as built).
**Risks:** bulk island nuclides are named fiction (MNT cross sections are picobarns).
**Source:** Zagrebaev & Greiner 2008 (PRC 78:034610); Savard 2020 (NIM B 463:258).

### 8. Annihilation laser works: `gtceu:annihilation_laser_works`, type `gtceu:annihilation_lasing` (Earth)

**What it gains:** a sealed Ti-44/Sc-44 positron source, a solid-neon moderator, laser-cooled positronium condensed inside a gamma cavity: stimulated 511 keV emission. UIV's positronium lab (B3) condenses Ps from a pulsar's pair wind but has no long-lived source and no cavity output.
**Recipes:** c1 `ti44_core` (2% consumed) + solid neon moderator (UIV line 45) → `moderated_ps_cell` (67,108,864 EU/t, 1,200 t); c2 `moderated_ps_cell` + gamma cavity (UIV line 34) + `mtj_die` (timing) → `gamma_laser_module` (134,217,728 EU/t, 2,400 t).
**Byproducts:** annihilation heat → UEV He-3 polariser cooling loop (as built coolant); spent core → IV hot cell c (Ca-44, decayed).
**Structure (QR):** 9x9x15. A shielded vault holds the source and trap, with the cavity running along its axis out to an emitter nose.
- Blocks: `gtceu:robust_machine_casing` (appearance, ~50%: the gamma shield; it replaces the dump-check lead-lined casing); a `gtceu:superconducting_coil` Penning trap; a `grindless:cryostat_casing` solid-neon moderator stage; `gtceu:fusion_glass` along the cavity axis; `gtceu:tungsten_steel_frame` cradles.
- Kinds: machine, coil, glass, frame.
- Hatches: core bus at the source end; module output at the nose; coolant hatches on the shield.
**Crossings:** IV hot cell (core), UV antimatter trap (Penning trap row), UV cold.
**Risks:** a gamma-ray laser at scale is named fiction; the parts are real.
**Source:** Platzman & Mills 1994 (PRB 49:454); Avetissian, Avetissian & Mkrtchian 2014 (PRL 113:023904); Shu 2024 (Nature 633:793).

### 9. Mk6 fusion ring: `gtceu:uxv_fusion_reactor`, type GTM `gtceu:fusion_reactor` (Earth)

**What it gains:** the "stellar burning ring" (named fiction, DECISIONS.md:502): a second `registerFusionTier(12)` ring that burns a star's sequence, each fuel made from the previous fuel's ash.
**Recipes:** c1 stellar H cut + CNO cut → `cno_ash_plasma` (67,108,864 EU/t, start 6,000,000,000); c2 triple-alpha fuel + triple-alpha fuel → helium-burning ash plasma (100,663,296 EU/t, start 8,000,000,000); c3 carbon-burning fuel x2 → carbon-burning ash plasma (134,217,728 EU/t, start 9,000,000,000); c4 oxygen-burning fuel x2 → oxygen-burning ash plasma (268,435,456 EU/t, start 10,000,000,000). All *(tune)*; the type takes fluids only, 2 in and 1 out (FusionReactorMachine.java:308-313, :330-349).
**Byproducts:** plasmas → ZPM DEC rows (`zpm/fusion.js:149-170`) → EU and ash (Fusion).
**Structure:** GTM fusion ring through the lib tier helper as Mk5 (UIV-A9 as built), `grindless:uxv_fusion_casing`, Mk5 coil, `gtceu:fusion_glass`.
- *(QR)* Before anything else, A7 runs `structure-quality.mjs --static` on the generated ring. The ring is hollow, with three blocks (kinds coil and glass), so the only risk is the casing share. If that share is above 70%, A7 stops and escalates a lib tier-helper change (more glass positions) to the integrator, never a baseline entry.
- Appearance and overlay are as on the Mk5.
**Crossings:** ZPM DEC, ZPM quench caster, UEV calutron, UEV electron beam furnace, EV cryogenic plant.
**Risks:** storage 10,240,000,000 at 16 hatches and the starts are long values (S0-4).
**Source:** Burbidge, Burbidge, Fowler & Hoyle 1957 (Rev Mod Phys 29:547); Hoyle 1954 (ApJS 1:121).

### 10. Stellar elevator: `gtceu:stellar_elevator`, type `gtceu:star_lifting` (Cygnus X-1 orbit)

**What it gains:** star lifting at L1 (named fiction): HDE 226868 nearly fills its Roche lobe, so a ring current and surface heating beneath the inner Lagrange point push its envelope over the saddle into a magnetic funnel. Nothing older takes matter from a star.
**Recipes:** c1 1,000 mB liquid helium (coolant, 90% back) → 1,000 mB `stellar_plasma` (134,217,728 EU/t, 1,200 t); c2 `gtceu:data_module` + 100 mB `stellar_plasma` (assay sample) → `elevator_log` (data: the arm chart's Cygnus piece; 8,388,608 EU/t).
*(QR: c2 made data from nothing. It now writes the log on a data module from an assayed sample. c1's matter is the star's: the row is gated by `.dimension` (Cygnus X-1 orbit), and its EMI info page says so. The coolant only cools.)*
**Byproducts:** warm helium → UV cold (recondensed).
**Structure (QR):** 11x25x11 tapered funnel tower, wide at the base and narrowing to the L1 boom.
- Blocks: `gtceu:uxv_machine_casing` (appearance, ~50%); a `gtceu:superconducting_coil` ring-current loop every 4 layers; a `gtceu:fusion_glass` funnel core; `gtceu:titanium_pipe_casing` coolant risers; a `gtceu:naquadah_alloy_frame` crown (the boom).
- Kinds: machine, coil, glass, pipe, frame.
- Hatches: helium in and out at the base; plasma output at the crown; energy at the base.
**Crossings:** UV cold, LuV helium refrigerator (as built coolant).
**Source:** Criswell 1985 (Interstellar Migration and the Human Experience, 50-87); Miller-Jones 2021 (Science 371:1046); Miškovičová 2016 (A&A 590:A114).

### 11. Plasma mass filter: `gtceu:plasma_mass_filter`, type `gtceu:plasma_mass_filtering` (Cygnus X-1 orbit, c1-c2)

**What it gains:** an Archimedes band-gap filter: in a rotating plasma with crossed E and B fields, ions above a cutoff mass are ejected radially while light ions stay confined, a one-pass mass split at fluid rates.
**Recipes:** c1 1,000 mB `stellar_plasma` → 700 mB `stellar_hydrogen_cut` + 270 mB `stellar_helium_cut` + 15 mB `stellar_cno_cut` + 15 mB `stellar_heavy_cut` (67,108,864 EU/t, 400 t); c2 1,000 mB `disk_plasma` → 900 mB `filtered_disk_plasma` + 100 mB `stellar_heavy_cut` (67,108,864 EU/t, 400 t).
**Byproducts:** none; every cut has a use (Lines).
**Structure (QR):** 9x9x15 octagonal solenoid with end caps and a band of radial ejection ports at the midplane.
- Blocks: `gtceu:high_power_casing` (appearance, ~50%: outer can and caps); `gtceu:superconducting_coil` solenoid winding (~25%); a `gtceu:fusion_glass` band at the midplane; `gtceu:tungstensteel_pipe_casing` radial ports.
- Kinds: coil, glass, pipe.
- Hatches: plasma input at one cap; light cuts out at the other cap; heavy cut out at the radial ports.
**Crossings:** UEV calutron (heavy cut isotopes), EV cryogenic plant (He-4 cut).
**Source:** Ohkawa & Miller 2002 (Phys Plasmas 9:5116); Gueroult, Rax & Fisch 2018 (J Clean Prod 182:1060).

### 12. Stellar condensation tower: `gtceu:stellar_condensation_tower`, type `gtceu:stellar_condensation` (Cygnus X-1 orbit)

**What it gains:** cools the heavy cut along the equilibrium condensation sequence (Ca-Al-Ti oxides near 1,700 K, Fe-Ni metal near 1,350 K, forsterite near 1,300 K, troilite near 700 K, then ices) and draws each cut at its stage; the honest destination of the filter's heavy cut (rule 3), whose cuts go to syngas and stock over AE2.
**Recipes:** c1 100 mB `stellar_heavy_cut` + 100 mB `stellar_hydrogen_cut` → `refractory_condensate` + `metal_condensate` + `silicate_condensate` + 100 mB `volatile_condensate` (33,554,432 EU/t, 600 t). The cuts separate into ordinary GT materials on EV and HV plants as built.
**Structure (QR):** 7x23x7 tower of 7 stages, 3 layers each, every stage stepped and labelled by its draw-off.
- Blocks: `gtceu:uxv_machine_casing` (appearance, ~50%); a `gtceu:laminated_glass` sight window per stage; a `gtceu:titanium_pipe_casing` draw-off per stage; `gtceu:naquadah_alloy_frame` tray rings between stages; a `gtceu:computer_heat_vent` jacket on the three cold stages at the top.
- Kinds: machine, glass, pipe, frame.
- Hatches: feed at the hot base; item buses on the lower draw-offs; volatile output hatch at the top.
**Crossings:** EV extraction cascade, HV syngas plant (volatiles).
**Source:** Grossman 1972 (GCA 36:597); Lodders 2003 (ApJ 591:1220).

### 13. Accretion disk skimmer: `gtceu:accretion_disk_skimmer`, type `gtceu:disk_skimming` (Cygnus X-1 orbit)

**What it gains:** a magnetic scoop in the outer disk (journey.md:119; named fiction). Cygnus X-1's disk is fed by the focused wind and its inner edge reaches about 1 keV; nothing older reaches disk plasma.
**Recipes:** c1 → 1,000 mB `disk_plasma` (134,217,728 EU/t, 1,200 t), consumes 1 `grindless:mh_winding` at 5% *(tune)*.
*(QR: the matter is the disk's. The row is gated by `.dimension` (Cygnus X-1 orbit), and the EMI info page states the source.)*
**Structure (QR):** 15x7x15 scoop dish: a shallow bowl facing the disk, with a throat behind it.
- Blocks: `gtceu:uxv_machine_casing` (appearance, ~50%: the bowl); a `gtceu:superconducting_coil` rim; a `gtceu:fusion_glass` throat; `gtceu:tungstensteel_pipe_casing` spokes from the rim to the throat.
- Kinds: machine, coil, glass, pipe.
- Hatches: winding bus and energy on the back; plasma output behind the throat.
**Crossings:** none of its own; its product feeds the FRC and BZ lines.
**Source:** Shakura & Sunyaev 1973 (A&A 24:337); Gou 2011 (ApJ 742:85).

### 14. FRC former: `gtceu:frc_former`, type `gtceu:frc_forming` (Cygnus X-1 orbit, c1)

**What it gains:** theta-pinch formation of field-reversed configurations, compact toroids with closed poloidal flux and no central post, trapped in a cartridge; the M2P2 shield that carries the player through Vela's wind. The cartridge's indefinite life is named fiction.
**Recipes:** c1 500 mB `filtered_disk_plasma` + 4 `grindless:mh_winding` (10% consumed) → `frc_cartridge` (134,217,728 EU/t, 1,600 t); c2 500 mB `filtered_disk_plasma` → 400 mB `flux_loaded_plasma` (BZ fuel) + 100 mB `gtceu:hydrogen` (67,108,864 EU/t, 400 t).
*(QR: c2 was 1:1. The plasma lost in formation now recombines to hydrogen, which goes to stock, and the BZ run is retuned on 400 mB (line 31).)*
**Structure (QR):** 7x7x21 linear theta-pinch: a coil-ringed formation tube with a capacitor bank along one flank and a capture chamber at the end.
- Blocks: `gtceu:high_power_casing` (appearance, ~45%); `gtceu:superconducting_coil` rings every 2 blocks; a `gtceu:fusion_glass` formation tube; a `grindless:cryostat_casing` capture chamber; a `gtceu:uiv_machine_casing` capacitor bank.
- Kinds: coil, glass, machine.
- Hatches: plasma input at the formation end; cartridge bus and flux-plasma and hydrogen outputs at the capture chamber; energy on the capacitor bank.
**Crossings:** none (UIV windings are one era back).
**Source:** Tuszewski 1988 (Nucl Fusion 28:2033); Binderbauer 2015 (Phys Plasmas 22:056110); Winglee 2000 (JGR 105:21067).

### 15. BZ dynamo: `gtceu:bz_dynamo`, type `gtceu:blandford_znajek`, generator (Cygnus X-1 orbit)

**What it gains:** power from the black hole's spin (a* > 0.95) through field lines threading the horizon; uiv.md reserved relativistic jets and Blandford-Znajek for UXV. Not free (rule 8): the field must be loaded, and the jet carries the flux-loaded plasma away.
**Recipes:** c1 50 mB/t `flux_loaded_plasma` → 1,073,741,824 EU/t (8 A x V[UXV] = 2^30) for 200 t *(tune)*, out through two UIV 16 A dynamo hatches (2^29 each) or one UXV 16 A dynamo hatch.
**Structure (QR):** 17x7x17 torus round a central jet column. The jet carries the plasma away.
- Blocks: `gtceu:uxv_machine_casing` (appearance, ~50%: the torus); a `gtceu:superconducting_coil` flux loop inside the torus; a `gtceu:fusion_glass` jet column; `gtceu:titanium_pipe_casing` feed spokes.
- Kinds: machine, coil, glass, pipe.
- Hatches: flux-plasma input on a spoke; dynamo hatches on the outer rim.
**Crossings:** none; power only.
**Risks:** output below 2^31 by design (S0-2 not needed).
**Source:** Blandford & Znajek 1977 (MNRAS 179:433); Tchekhovskoy, Narayan & McKinney 2011 (MNRAS 418:L79).

### 16. Pasta extractor: `gtceu:pasta_extractor`, type `gtceu:pasta_extraction` (Vela pulsar orbit)

**What it gains:** at a glitch, pinned superfluid vortices unpin and the crust slips; the extractor draws inner-crust matter out along the flux tubes into a cage (named fiction; the glitch is real). Nothing older reaches the pasta layers.
**Recipes:** c1 `vela_glitch_timing` (kept) + `grindless:neutronium_pellet` (ballast, 10% consumed) → `raw_pasta` (134,217,728 EU/t, 2,400 t).
*(QR: the matter is the crust's. The row is gated by `.dimension` (Vela pulsar orbit), and the EMI info page states the source.)*
**Structure (QR):** 11x21x11 downward throat: a flux-tube funnel hanging under a receiver.
- Blocks: `grindless:neutron_star_site_casing` (appearance, ~50%); `gtceu:superconducting_coil` rings along the throat; `gtceu:fusion_glass` throat windows; a `grindless:cryostat_casing` receiver cage at the top; `gtceu:naquadah_alloy_frame` struts.
- Kinds: coil, glass, machine, frame.
- Hatches: timing and ballast buses and energy at the receiver; output from the receiver cage.
**Crossings:** ZPM DSN (glitch timing), LuV GW detector (glitch record).
**Source:** Anderson & Itoh 1975 (Nature 256:25); Link, Epstein & Lattimer 1999 (PRL 83:3362).

### 17. Pasta phase sorter: `gtceu:pasta_phase_sorter`, type `gtceu:pasta_sorting` (Vela pulsar orbit)

**What it gains:** splits raw pasta along the inner crust's density sequence: gnocchi, spaghetti, lasagna, then the inverted phases (anti-spaghetti, bubbles).
**Recipes:** c1 `raw_pasta` → `spaghetti_phase` + `lasagna_phase` + `gnocchi_fragment` + `anti_phase_residue` (67,108,864 EU/t, 1,200 t); each phase leaves only in a cage (UIV neutronium cage new mode, `grindless:cage_part`); c2 16 `anti_phase_residue` + 1 `grindless:cage_part` → `pasta_core_sample` (134,217,728 EU/t, 2,400 t).
*(QR: c2 now takes the cage that holds the sample.)*
**Byproducts:** gnocchi → UIV r-process decompressor (new row): r-process elements to stock.
**Structure (QR):** 11x9x13 density arc: a deflector arc sweeping past 5 cage bins, one per phase.
- Blocks: `grindless:neutron_star_site_casing` (appearance, ~50%); five `grindless:cryostat_casing` cage bays; a `gtceu:superconducting_coil` deflector arc; a `gtceu:tungstensteel_gearbox` cage changer under the bins.
- Kinds: machine, coil.
- Hatches: raw input at the arc's start; one output bus per bin.
**Source:** Ravenhall, Pethick & Wilson 1983 (PRL 50:2066); Hashimoto, Seki & Yamada 1984 (Prog Theor Phys 71:320); Caplan & Horowitz 2017 (Rev Mod Phys 89:041002).

### 18. Pasta draw bench: `gtceu:pasta_draw_bench`, type `gtceu:pasta_drawing` (Vela pulsar orbit)

**What it gains:** draws caged spaghetti into a continuous strand inside a field sheath that stands in for crust pressure (named fiction): the UXV superconductor.
**Recipes:** c1 caged `spaghetti_phase` + aerogel (ZPM, as built) → 8 `gtceu:pasta_strand_single_wire` (134,217,728 EU/t, 1,200 t).
**Structure (QR):** 5x5x23 draw line. The head and tail are 5x5, with a 3x3 sheathed strand between them and capstan pylons rising every 4 blocks.
- Blocks: `grindless:neutron_star_site_casing` (appearance, ~50%); a `gtceu:superconducting_coil` field sheath; `gtceu:tungstensteel_gearbox` capstans; a `grindless:cryostat_casing` feed cage at the head; a `gtceu:hsss_frame` bed.
- Kinds: coil, machine, frame.
- Hatches: cage and aerogel buses at the head; wire output at the tail.
**Crossings:** ZPM aerogel.
**Risks:** material `pasta_strand` with superconductor properties at V[UXV] (S0-8); generic wiremill and extruder rows for it are cut (F2).
**Source:** Baym, Pethick & Pines 1969 (Nature 224:673); Caplan & Horowitz 2017.

### 19. Pasta laminator: `gtceu:pasta_laminator`, type `gtceu:pasta_lamination` (Vela pulsar orbit)

**What it gains:** presses caged lasagna sheets into plate. Pasta is the stiffest material computed: shear modulus near 10³⁰ erg/cm³, breaking strain near 0.1 (Caplan 2018).
**Recipes:** c1 caged `lasagna_phase` + `grindless:wf_rhea_billet` (frame) → 4 `lasagna_plate` (134,217,728 EU/t, 1,200 t); c2 `lasagna_plate` + 2 strand wire → `polar_cap_electrode` (33,554,432 EU/t, 400 t).
**Structure (QR):** 9x11x9 portal press: four columns carry a crosshead with rams over a bed.
- Blocks: a `grindless:neutron_star_site_casing` base and crosshead (appearance, ~50%); `gtceu:naquadah_alloy_frame` columns; `gtceu:robust_machine_casing` platens; `gtceu:tungstensteel_gearbox` rams; a `grindless:cryostat_casing` cage bay beside the bed.
- Kinds: frame, machine.
- Hatches: cage and billet buses at the cage bay; plate output at the bed.
**Source:** Caplan, Schneider & Horowitz 2018 (PRL 121:132701).

### 20. Polar cap tap: `gtceu:polar_cap_tap`, type `gtceu:polar_cap_tapping`, generator (Vela pulsar orbit)

**What it gains:** a share of the open-field-line potential (named fiction): Vela's polar-cap drop is near 10¹⁵ V and its spin-down power near 7 x 10³⁶ erg/s. The tap draws current through a lasagna electrode that sputters away (rule 8).
**Recipes:** c1 1 `polar_cap_electrode` → 536,870,912 EU/t (4 A x V[UXV]) for 2,400 t *(tune)*, out through one UIV 16 A dynamo hatch.
**Structure (QR):** 11x13x11 electrode mast: a broad base, an insulated mast and a vented crown pointing to the polar cap.
- Blocks: `grindless:neutron_star_site_casing` (appearance, ~50%); a `gtceu:superconducting_coil` wrap on the mast; `gtceu:fusion_glass` insulator rings; a `gtceu:computer_heat_vent` crown.
- Kinds: coil, glass, machine.
- Hatches: electrode bus at the base; dynamo hatch on the base.
**Risks:** weakest machine claim: UIV dropped a pulsar-wind dynamo at J0437. It counts because its electrode is a Vela product and it powers the Vela platform with no sunlight.
**Source:** Goldreich & Julian 1969 (ApJ 157:869); Ruderman & Sutherland 1975 (ApJ 196:51).

### 21. Ejecta knot sweeper: `gtceu:ejecta_knot_sweeper`, type `gtceu:ejecta_sweeping` (Cassiopeia A)

**What it gains:** a magnetic scoop through Cas A's Ti-rich knots collects ejecta dust; young Ti-44 exists in reach only here.
**Recipes:** c1 → `ejecta_knot_dust` (67,108,864 EU/t, 1,200 t), consumes 1 `grindless:mh_winding` at 2% *(tune)*.
*(QR: the matter is the knots'. The row is gated by `.dimension` (Cassiopeia A), and the EMI info page states the source.)*
**Byproducts:** Si, S, Ar, Ca, Fe in the dust: inert, split on the EV extraction cascade, voidable (rule 3).
**Structure (QR):** 13x7x15 scoop ship: a shielded bow, a coil mouth ring, a hopper and a collector astern.
- Blocks: `grindless:whipple_shield_casing` (appearance, ~50%: the bow and hull); a `gtceu:superconducting_coil` mouth ring; a `gtceu:tungstensteel_pipe_casing` hopper; a `gtceu:filter_casing` collector.
- Kinds: coil, pipe, machine.
- Hatches: winding bus and energy amidships; dust output at the collector.
**Crossings:** EV extraction cascade, UEV calutron, IV hot cell.
**Source:** Grefenstette 2014 (Nature 506:339); Sato 2021 (Nature 592:537); Vink 2012 (A&ARv 20:49).

## Older machines, new modes

Placement per DECISIONS.md:508. Circuits are taken by each package after `git grep` of the type (Common). UIV machines are one era back: they take modes but are not crossings.

| Machine (era, file:line) | Mode | Recipe | Feeds |
|---|---|---|---|
| Cryogenic plant (EV, `ev/cryogenic_plant.js:40`) | He-4 polish; O-16 liquefaction; Kr; 6N He | `stellar_helium_cut` → `triple_alpha_fuel`; O-16 → `oxygen_burning_fuel`; air → Kr; He → `he_6n` | Mk6 c2, c4; KrF laser; stopping cell |
| Extraction cascade (EV, `ev/extraction_cascade.js:92`) | knot dust; flux dross; Bi fume | `ejecta_knot_dust` → Ti fraction + Si, S, Ca, Fe; magnesite → Mg(OH)₂; LPE dross → Pb; BFO fume → Bi (columbite split exists, `:166-168`) | Ti-44 line; YIG; MESO |
| Platinum plant (EV, `ev/platinum_plant.js:598`) | sputter grade; etch and redeposit recovery | 5N Pt, Ru, Ir → `saf_target_set` and `pt_lpe_crucible` feed; etch residue, sputter redeposit (lines 4, 6-8, 10) → Pt, Ru | targets, crucible |
| Hot strip mill (EV, `ev/combined_cycle_and_hot_mill.js:464`) | lamination; foil; sheet; duct; mu-metal band; gum metal forge; encoder ring | `gtceu:tetrataenite_ingot` → `tetrataenite_lamination`; 5N Ta → `ta_foil`; 5N Pt → `pt_sheet`; `lasagna_plate` → `alip_duct`; mu-metal ingot → hot band → `mu_metal_foil`; sintered gum metal → hot-forged `gum_metal_blank`; tetrataenite ingot → `encoder_ring` | motor, Ta target, crucible, pump, interposer, gear, encoder |
| Syngas plant (HV, `hv/syngas_plant.js:82`) | platform syngas | `volatile_condensate` → syngas | platform plastics |
| Fuel fabrication (IV, `iv/uranium_cycle.js:44`) | ion-source charge | depleted U → `u238_ion_source` | MNT |
| Hot cell (IV, `iv/hot_cell.js:36`) | sealed core; spent core | Ti-44 → `ti44_core`; spent core → Ca-44 | gamma laser |
| Fluorspar kiln (IV, `iv/fluorspar_kiln.js:83`) | oxide calcines; F₂ | Mg(OH)₂ → 5N MgO; DyScO₃, SrRuO₃, La-BFO, GGG oxides; HF → F₂ | targets, substrates, KrF laser |
| HTS magnet works (LuV, `luv/hts_magnet_works.js:32`) | strand stator | strand wire + lamination → `strand_stator` | motor |
| Coated conductor line (LuV, `luv/coated_conductor_line.js:32`) | strand tape | strand wire → `strand_tape` | field generator, SMES |
| GW detector (LuV, `luv/ganymede.js:48`) | Vela strain record | `vela_glitch_timing` → `vela_glitch_record` (data) | arm chart |
| Eu reductor (ZPM, `zpm/europium.js:105`) | Dy oxide; Dy metal | depleted liquor → Dy₂O₃ (c10); Dy₂O₃ + La → Dy (c11, as c6 does for Tb; Tb and Gd rows exist, `:107-119`; Y₂O₃ and La₂O₃ are the cascade's c11, as built) | DyScO₃, Terfenol-D |
| Magnet works (ZPM, `zpm/magnet_works.js:27`) | rotor; encoder ring | `tetrataenite_lamination` → `tetrataenite_rotor`; `encoder_ring` → `multipole_encoder_ring` | motor, encoder |
| Quench caster (ZPM, `zpm/fusion.js:97`) | Mk6 ash x3; planar flow casting | He-burning ash → C-12 + O-16; C ash → Ne-20, Na-23, Mg-24; O ash → Si-28, S-32, P-31; Fe-Si-B-Nb-Cu melt → 20 µm `finemet_ribbon` (open question 13) | Mk6 c3, c4; stock; voltage coil |
| Ion implanter (ZPM, `zpm/qubits.js:47`) | ion-beam etch; STNO milling | annealed `mtj_stack_wafer`, `mram_stack_wafer` → etched; defined `stno_stack_wafer` → milled pillars | `mtj_die`, `mram_wafer`, `stno_array` |
| Actinide partitioning (ZPM, `zpm/actinides.js:85`) | fragments | MNT fragments → Pb, Hg, Pt (the Cm and Es/Fm cuts are as built, UIV-B2) | MNT |
| Waste retrieval (ZPM, `zpm/actinides.js:58`) | MNT target | activated target → stock | by-product |
| DEC (ZPM, `zpm/fusion.js:149-170`) | Mk6 plasmas x4 | four plasmas → EU + ash | power, ash |
| DSN (ZPM, `zpm/observatory.js:30`) | Vela timing | → `vela_glitch_timing` (kept) | extractor |
| Cold (UV, `uv/cold.js:55`) | heat flush | He-II → isotopically pure He-II | SHeQUID |
| Powder bed (UV, `uv/materials.js:52`) | targets x5; gum metal | CoFeB, MgO, Heusler, SrRuO₃, La-BFO powders → targets; spent re-press; Ti-Nb-Ta-Zr-O blend → sintered gum metal | spintronics, gear |
| Zone refining (UV, `uv/detectors.js:56`) | 7N Te, Ge | Te, Ge → 7N | CVT crystals |
| MOCVD (UV, `uv/photonics.js:143`) | LPCVD SiN; STNO planarisation; Ga₂O₃ epi | → `sin_membrane`; milled STNO wafer → SiN-planarised; (010) `ga2o3_wafer` → Sn-doped homoepitaxy | SHeQUID, STNO, power die |
| Synchrotron (UV, `uv/accelerators.js:34`) | U-238 injector | `u238_ion_source` → `u238_beam_charge` | MNT |
| Antimatter trap (UV, `uv/accelerators.js:146`) | positron stacking; own file, `.dimension` overworld | slow positrons → `positron_stack` | gamma laser |
| EHT (UV, `uv/edge.js:46`) | VLBI parallax | → `cygnus_vlbi_record` (data) | arm chart |
| Crystal growth (UHV, `uhv/crystals.js:28`) | GGG, DyScO₃ (Czochralski); WTe₂, FGT (CVT); Ga₂O₃ (EFG, Ir die); Terfenol-D, Ni-Mn-Ga (Bridgman); recrystallise | eight rows; the KrF laser reuses `vuv_caf2_optic` (as built, `uhv/crystals.js:16`) | spintronics, components, power die |
| Foundry (UHV, `uhv/photonics.js:32`) | MESO integration; Cu back end; RF carpet; STNO contacts; Ga₂O₃ packaging; interposer bonding | `me_switch_wafer` + `sot_readout_stack` → `meso_logic_die`; MRAM back end; `rf_carpet_board`; planarised STNO wafer → `stno_array`; gated wafer → `ga2o3_power_die`; shield can + `glass_interposer` → `shielded_interposer` | mainframe, MRAM, stopping cell, magnonic bus, hatches |
| Transuranium (UHV, `uhv/transcurium.js:25`) | molecular plating | Fm-257, Es-254, Cm-248 → targets (the Es/Fm HDEHP split is as built, UIV-B2) | superheavies, MNT |
| Tether works (UHV, `uhv/elevator.js:106`) | Whipple bumper | `cnt_densified_yarn` → `cnt_bumper_weave` | Whipple shield |
| Warp gate (UHV, `uhv/gate.js:28`) | c8 Vela, c9 Cas A, c10 OpV gate | Gate | travel, gate |
| Calutron (UEV, `uev/isotopes.js:21`) | Ti-44, Fm-257, W-184 | three rows (Es-254 and Cm-248 are as built: UHV transuranium, IV hot cell c8) | lines 19, 22, 25 |
| Cyclotron (UEV, `uev/superheavy.js:21`) | 121, 122 | Ti-50 + Es-254 / Fm-257 | census III |
| Recoil separator (UEV, `uev/superheavy.js:21`) | 121, 122 | → recoils | census III |
| Chem lab (UEV, `uev/superheavy.js:21`) | 121, 122 catch; census III | recoils → caught 121, 122 → census | superheavies |
| Megabar (UEV, `uev/megabar.js:23`) | Ba-BN growth | BN + Ba → `hbn_crystal` | vdW |
| Electron beam furnace (UEV, `uev/electron_beam.js:23`) | 5N Co, Fe, Mn, Si, Ta, Ni, Ga; Pt melt; mu-metal melt; apertures, tracks, waveguides, contacts, ME patterning, STNO pillars, Ga₂O₃ gates; C-12 vapour | about 17 rows | targets, SHeQUID, racetrack, YIG, vdW, MESO, STNO, interposer, power die, Mk6 c3 |
| Nitride magnet works (UEV, `uev/composites.js:22`) | field anneals; twin training; SMES cell; shield and core anneals | MTJ, MRAM, SAF, Heusler, SOT anneals; Ni-Mn-Ga twin training; `uxv_smes_cell`; `mu_metal_foil` H₂ anneal; Finemet toroid field anneal | spintronics, conveyor, W, interposer, voltage coil |
| CVI (UEV, `uev/composites.js:22`) | W-184 preform | W-184 fibre → `w184_cvi_preform` | Mk6 casing |
| Photonic hall (UEV, `uev/photonics.js:25`) | spintronic mainframe | dies → `gtnn:spintronic_mainframe` | circuit |
| Ergosphere probe bay (UIV-B4) | Kerr sling | `relay_seed` → `launched_relay_seed` | travel |
| Matrioshka (UIV-A10) | arm chart | four records → `arm_chart` | gate |
| Neutronium cage (UIV-B2, RX J1856 site) | cage parts | `neutronium_pellet` → `grindless:cage_part` (carried to Vela) | phase sorter |
| R-process decompressor (UIV-B2) | gnocchi | `gnocchi_fragment` → r-process stock | by-product |
| Levitation melter (UIV-A3) | CoFeB, Heusler, Terfenol-D, Ni-Mn-Ga, Finemet | five melts → `cofeb_ingot`, `heusler_ingot`, `terfenol_d_ingot`, `ni_mn_ga_ingot`, Finemet melt; STNO mill redeposit re-melted | targets, piston, conveyor, voltage coil |
| X-ray pulse profiler (UIV-B3) | Ti-44 line map | knot dust sample → `ti44_map` (data) | arm chart |

**Process honesty (QR, `docs/quality/items.md` trivial_step; product rules 3 and 8).** Every older row of ours that makes a new UXV id takes a second consumed ingredient or yields a real byproduct, and no row makes data or matter from nothing. The package that owns the row writes it as follows:
- **Cryogenic plant:**
  - He → `he_6n`: 1,000 mB helium + 100 mB liquid nitrogen precool → 990 mB `he_6n` + 100 mB nitrogen. Its input key also differs from the liquid-helium row.
  - He-4 polish: the stellar cut's H and Ne are real outputs (line 27).
  - O-16: + 250 mB liquid nitrogen, back as nitrogen.
  - Kr: air → Kr + nitrogen + oxygen.
- **Extraction cascade:**
  - magnesite + water → Mg(OH)₂ + CO₂;
  - LPE dross → Pb + B₂O₃ (back to YIG c1);
  - BFO fume → Bi + an Fe small dust.
- **Hot strip mill:** every row follows the generated pattern, water in and steam out (`ev/combined_cycle_and_hot_mill.js:464-469`).
- **Syngas plant:** volatiles go in as a `tables` row with steam (the `hv/syngas_plant.js` pattern).
- **Fuel fabrication:** depleted U + oxygen → `u238_ion_source`, a sintered UO₂ charge.
- **Hot cell:** Ti-44 + a `gtceu:tungsten_plate` capsule → `ti44_core`; spent core → Ca-44 + a tungsten small dust.
- **Fluorspar kiln:** each calcine gives off its water or CO₂; HF → F₂ + H₂.
- **Coated conductor line:** strand wire + `gtceu:copper_foil` stabiliser → `strand_tape`.
- **Data rows** (GW detector, DSN, EHT, X-ray profiler): they follow the as-built data pattern (a data orb + 1,000 mB helium, `zpm/observatory.js:30-53`, `luv/ganymede.js:49-51`).
- **Eu reductor:** Dy₂O₃ + La → Dy + La₂O₃ (as c6).
- **Magnet works:**
  - rotor: + a `gtceu:tungsten_steel_rod` shaft.
  - encoder: `encoder_ring` → `grindless:multipole_encoder_ring` + 10% tetrataenite small dust (the "ring scrap" of line 49, re-melted). This is **one new id**: the draft magnetised the ring into itself, which is a self-loop.
- **Quench caster:** planar flow casting takes 100 mB argon.
- **Ion implanter:** each etch takes 100 mB argon.
- **Waste retrieval:** the activated target gives back recovered Cm-248 (50% *(tune)*) and the row's as-built waste.
- **Cold:** the heat flush is 1,000 mB He-II → 990 mB pure He-II + 10 mB He-3 concentrate (the superleak pattern, `uv/cold.js:9`).
- **Powder bed:**
  - each target is bonded to a `gtceu:copper_plate` backing;
  - re-pressing a spent target returns the plate;
  - gum metal sinters under 100 mB argon.
- **Zone refining:** + an impure-tail small dust.
- **MOCVD:** the rows take their precursor gases as the as-built rows do.
- **Synchrotron:** + 100 mB liquid helium, back as helium.
- **Antimatter trap:** + 100 mB nitrogen buffer gas (the Surko trap), consumed.
- **Crystal growth:** the CVT and recrystallise rows take an iodine transport charge.
- **Transuranium:** molecular plating onto a titanium backing.
- **Tether works:** + 2 `gtceu:aluminium_foil` interleaf.
- **Nitride magnet works:** each anneal consumes 100 mB of its atmosphere (argon, or hydrogen for mu-metal, which gives steam).
- **CVI:** 1,000 mB methane in, 2,000 mB hydrogen out (pyrolytic interphase; the `tables/composites.json` fluidsIn/fluidsOut pattern).
- **Recoil separator:** the spent beam is an output.
- **Probe bay:** `relay_seed` + 1 `gtceu:tungsten_steel_block` (the ballast that falls in, the Penrose split) → `launched_relay_seed`.
- **Neutronium cage:** `neutronium_pellet` + 1 `grindless:mh_winding` (the cage's field coil) → `cage_part`.
- **R-process decompressor:** several r-process elements, as the UIV row.

All amounts are *(tune)*. None of these changes a crossing or a step count.

**Count:** 46 older machines take about 135 rows (40 UEV-and-older machines, 6 UIV). UIV counted 58 machines; UXV leans on fewer machines but harder: its lines meet 44 UEV-and-older machines, as-built upstream included, for 178 crossings (Crossings).

**File order:** each row goes in the older machine's table or inline array (DECISIONS.md:508) by the package that consumes it; the antimatter trap row goes in the package's own file with `.dimension` and a free circuit. Two packages never append to one table in the same wave (Parallel and serial).

## Family steps

| Family | Step | Machine | Era before |
|---|---|---|---|
| Circuits | `gtnn:spintronic_mainframe` | UEV photonic hall row | `gtnn:optical_mainframe` (UIV-A7) |
| Superheavies | census III: elements 121, 122; the island chart | UEV cyclotron rows, MNT collider | census II: 119, 120 (UIV-A1) |
| Fusion | Mk6 stellar burning ring | `gtceu:uxv_fusion_reactor` | Mk5 (UIV-A9) |
| Neutron star matter | nuclear pasta | Vela machines | neutronium (UIV-B2) |
| Positrons | gamma laser module | annihilation laser works | positronium condensate (UIV-B3) |
| Black holes | disk skimming, BZ dynamo | Cygnus machines | ergosphere probes, Penrose engine (UIV-B4) |
| Travel | Kerr sling, M2P2 and Whipple shields | probe bay mode, warp gate c8-c9 | relay seed jump (UIV-B1) |
| Sensor | SHeQUID gyroscope | SHeQUID works | UIV sensor (UIV-A7) |
| Mega | stellar fractionation hall | M2 | neutronium compression hall (UIV-M2) |
| Parallel hatch | x65,536 | M1 | x16,384 (UIV-M1) |
| Wireless | case 12 | W | case 11 (UIV-W) |

## Reserve for OpV

OpV is built right after UXV (user direction). Each OpV line below has its feed, place or machine already made by UXV, and UXV itself makes none of these OpV products (journey.md:53).

| Kept for OpV | Hook in UXV (id) |
|---|---|
| Industrial antimatter | Cygnus X-1's jet: LHAASO sees microquasar jets accelerating particles to PeV energies (LHAASO Collaboration 2024, arXiv:2410.08988). UXV leaves the jet beam line undone; `gtceu:bz_dynamo` and `grindless:flux_loaded_plasma` power it, `grindless:gamma_laser_module` drives γγ pair production |
| Stable exotic matter | `grindless:disk_plasma` (journey.md:119, :139); the skimmer exists, no exotic matter is made |
| Kugelblitz forge | `grindless:gamma_laser_module` (pump), `grindless:frc_cartridge` (confinement) |
| Self-replicating probes | `grindless:launched_relay_seed`, the Kerr sling mode, `grindless:shequid_gyro` (inertial navigation), `gtnn:spintronic_mainframe` |
| The galactic bulge | `grindless:bulge_chart` (gate output). Candidate OpV places: Terzan 5 (bulge cluster with 39+ millisecond pulsars; Ransom 2005, Science 307:892), SGR 1806−20 |
| The inner core | `grindless:pasta_core_sample` (anti-phases); PSR J0952−0607 at 2.35 M☉ (Romani 2022, ApJL 934:L17) is the OpV place for quark matter |
| Island of stability, element 124 on | `grindless:island_chart`, `grindless:island_nuclide`, `grindless:superheavy_census_iii` |
| Kardashev III | wireless case 12 across four places; OpV is case 13 |
| OpV fusion tier | `registerFusionTier(13)`: silicon burning; Mk6 c4 ash Si-28 is stocked for it (`grindless:si28_ash`) |
| OpV parallel hatch | `lib/parallel_hatch.js` tier 13 (x262,144), not in UXV |
| OpV hull and hatches | widen `uev/foundation.js:177-204` again (`.tiers(UEV, UIV, UXV, OpV)`) after S0-1 proves three |

**OpV-bound ids made in UXV:** `grindless:bulge_chart`, `pasta_core_sample`, `island_chart`, `island_nuclide`, `superheavy_census_iii`, `gamma_laser_module`, `frc_cartridge`, `flux_loaded_plasma`, `disk_plasma`, `stellar_plasma`, `si28_ash`, `shequid_gyro`. **Existing OpV ids (dump):** `gtceu:opv_machine_casing` (researched by the gate), `gtnn:component_assline_casing_opv`, `gtnn:opv_wrap_circuit`, `extendedfeatures:opv_universal_circuit`.

**MAX and MAX+** keep everything DECISIONS.md:450 and :507 give them: GCYR `black_hole_orbit`, Sagittarius A*, the hyper stargate and creative items. UXV adds none of them; the BZ dynamo and the polar cap tap are generators with fuels, never creative sources.

## Considered and dropped

**Machines** (the nine that would reach ~30):

- Field irradiation hall (synthetic tetrataenite): second route; tetrataenite is LuV meteorite matter (`luv/foundation.js:12`).
- CNT yarn muscle spinner: second route (`uev/earth_orbit.js:27`).
- FRC merging compressor: a second machine for one chain; FRC former c1 suffices.
- UXV computation hall: second route to compute (UIV Matrioshka).
- Sc-44 elution column: the IV hot cell's mode does it.
- Jet beam line: OpV industrial antimatter.
- Corona pair tap: second positron route (UIV pulsar wind trap; the Ti-44 core).
- Antiferromagnet or altermagnet memory: a second memory; MRAM and racetrack cover cache and storage.
- Spintronic mainframe hall: convenience; the photonic hall row joins the dies.
- Also dropped: QAH interconnect (nothing needs it), SMES winder (UEV nitride magnet works), EM pump works (the ALIP pump is an assembly), Kerr sling launcher (a probe bay mode), magnetar tap (OpV bulge), Cas A's compact object (no product of its own).

**Places** with no product of their own: Eta Carinae (N-rich ejecta: second route to the CNO cut), WR 104 (carbon dust), the Crab (a second pulsar), Przybylski's star (unconfirmed actinide lines), 3 Cen A (He-3), SS 433 (jets: OpV), PSR J1719−1438 b (diamond), BPM 37093 (second route to Sirius B's degenerate matter), Pa 30, TMC-1, NGC 7027, Westerlund 1.

**Lines** (29 judged and not counted; the gap to ~69 is 20):

1. Si-28 from Mk6 oxygen ash as UIV's H-Si28 wafer: second route; the ash is stocked for OpV.
2. Neon from carbon ash for UIV's solid neon moderator: second route; stock.
3. Sc-44 eluate as a positron source for the UHV accumulator: second route to positrons.
4. C-13 and N-14 from the CNO cut as products: no use beyond the Mk6 c1 catalyst.
5. Rare earths from the stellar heavy cut: second route; the condensation cuts are supply.
6. Skyrmion logic track: a second logic family; MESO is the logic.
7. YIG/Pt spin Seebeck thermopile: power from heat already counted.
8. Microquasar jet protons: OpV.
9. Antiferromagnet or altermagnet memory: a second memory.
10. Quantum anomalous Hall interconnect: nothing needs it; the pasta strand is the conductor.
11. Synthetic tetrataenite by irradiation: second route (LuV meteorite matter).
12. CNT yarn muscle actuator: second route (UEV).
13. Pasta core sample as a line: three steps; it is a gate token.
14. Polar cap electrode as a line: two steps.
15. Gnocchi to r-process nuclei: second route to UIV line 31.
16. Corona pairs from Cygnus X-1: second positron route.
17. Stellar He-3 cut: second route to UIV line 27.
18. Cas A Fe, Ca, Si, S, Ar: inert; voided.
19. Eta Carinae nitrogen: second route to the CNO cut.
20. WR 104 carbon dust: second route to carbon.
21. Crab pasta: a second pasta source.
22. Przybylski's star actinides: unconfirmed lines; second route to UIV actinides.
23. Magnetar field tap: OpV bulge.
24. Platform supply from the condensation tower: AE2 relays ship home materials to the far platforms (DECISIONS.md:59; *AE2*), so the tower's cuts are not the only route there; they stay machine 12's product, not a line.
25. Assemblies with no feedstock of their own: the hull, the mainframe join and `pasta_strand_repeater` (strand wire, `pulsar_timed_repeater` and `mtj_die`, all made by other lines). The robot arm now has lines 45 and 49, the hatches lines 46 and 48, the mainframe's package line 47.
26. Dy metal as its own line: a branch of line 36, two steps from line 9's Dy₂O₃.
27. TSV silicon interposer: a second route to UIV's `glass_interposer` (UIV line 12); line 47 shields that one instead.
28. CaF₂ window for the KrF laser: a second route to UHV's `vuv_caf2_optic` (`uhv/crystals.js:16`).
29. Neon-burning Mk6 fuel: no product beyond EU (its O-16 and Mg-24 are stock already); silicon burning is OpV's (`si28_ash`).

The seven data chains (arm chart, island chart, glitch record, VLBI record, Ti-44 map, elevator log, bulge chart) do not count either.

## Power

**Wireless case 12** (`lv/wireless_energy.js:291-308`, W): caps V[UXV] x amps x 10 as long: 2 A 2,684,354,560; 4 A 5,368,709,120; 16 A 21,474,836,480; 64 A 85,899,345,920 (long caps proven by UIV-S0-5 and W). Link item `grindless:pasta_strand_repeater` (strand wire + `grindless:pulsar_timed_repeater` + `mtj_die`); the cell `grindless:uxv_smes_cell` holds 4,026,531,840,000 EU *(tune)*, made on the UEV nitride magnet works (`composites.json` row) from `strand_tape` and `lasagna_plate`. Cas A has no source of its own: it runs on wireless from home and Cygnus.

| Source | Place | EU/t | Doubled by generators.js? |
|---|---|---|---|
| Mk6 c1-c4 plasmas in ZPM DEC rows | Earth | 2x the fusion EU/t, net *(tune)* | no (DEC rows sized directly) |
| BZ dynamo | Cygnus X-1 | 1,073,741,824 (2^30) | no |
| Polar cap tap | Vela | 536,870,912 | no |
| Penrose engine (UIV-B4) | Cygnus X-1 | as built | as built |

**Gate example:** 16 A x V[UXV] = 2,147,483,648 EU/t (2^31) for 1,200 t *(tune)* = 2,576,980,377,600 EU: one BZ dynamo (2^30) plus two polar cap taps on wireless (2 x 2^29), or the Mk6 through DEC. S0-2 proves a 2^31 recipe EU/t and the 16 A hatch; fallback 15 A = 2,013,265,920 EU/t.

**Rule 8:** every source has a fuel or consumable (plasma, flux-loaded plasma, a lasagna electrode); no source exceeds 2^30 per machine.

## Fusion

The Mk6 is a second `registerFusionTier(12)` ring (`tables/fusion_mk6.json`, A7), named the stellar burning ring (fiction): it burns a massive star's sequence, and each fuel comes from the previous fuel's ash.

| Recipe | Fuel (both inputs) | Plasma out | DEC returns | Ash goes to |
|---|---|---|---|---|
| c1 hot CNO | `stellar_hydrogen_cut` + `stellar_cno_cut` | `cno_ash_plasma` | He-4, CNO cut (95% back) | c2 |
| c2 triple-alpha | `triple_alpha_fuel` x2 | `helium_burning_ash_plasma` | C-12 + O-16 (quench caster) | c3, c4 |
| c3 carbon burning | `carbon_burning_fuel` x2 | `carbon_burning_ash_plasma` | Ne-20, Na-23, Mg-24 | stock (ordinary Ne, Na, Mg) |
| c4 oxygen burning | `oxygen_burning_fuel` x2 | `oxygen_burning_ash_plasma` | Si-28, S-32, P-31 | `si28_ash` (OpV); stock |

- Fuel prep: `triple_alpha_fuel` on the EV cryogenic plant from the He-4 cut and c1 ash; `carbon_burning_fuel` is C-12 vapour from the UEV electron beam furnace; `oxygen_burning_fuel` is O-16 liquefied on the EV cryogenic plant.
- Storage: 10,240,000,000 EU at 16 hatches (twice Mk5's 5,120,000,000, run 20261028-192609-server) *(tune)*; starts 6, 8, 9 and 10 billion *(tune)*; all long (S0-4). FusionReactorMachine.java :185, :276, :294-298, :326-327 as uiv.md cites.
- Casing `grindless:uxv_fusion_casing`: W-184 (UEV calutron) → CVI preform (UEV CVI) → `grindless:wf_rhea_billet` (UIV) → casing.
- Real physics: CNO and triple-alpha are textbook (B²FH 1957; Hoyle 1954). Burning carbon and oxygen in a ring at these rates is fiction.

## Nothing one at a time

- **Stellar fractionation hall** (`gtceu:stellar_fractionation_hall`, M2, mega.md 4.1, 4.11, 4.12, 5, 6.6): the UXV member of the mega family. It runs GTM `gtceu:distillation_tower` and `gtceu:distillery` recipes; parallels are energy-bound times the parallel hatch; the overclock rule follows mega.md 5 as the stellar forge (open question 6). It gains over GTCA's `gtceu:large_distillery` by parallels up to x65,536 in one hall. GTNH's mega distillation tower is an idea only (CREDITS.md).
- **UXV parallel hatch** (`gtceu:uxv_parallel_hatch`, M1): `lib/parallel_hatch.js:80-81` → `.tiers(9, 10, 11, 12)`, name ternary at :84; x65,536 = 4^(12-4). Recipe mirrors server `uiv/parallel_hatch.js:17` with spintronic mainframes and UXV parts. Parallel x EU/t overflow is checked by S0-6.

## AE2

Nothing new. Each arrival platform seeds AE2 through its far ring, as at UIV (uiv.md:677-679): AE2 stays the backbone between places (DECISIONS.md:59), so home materials and fluids reach Vela and Cas A without a second route. Stellar cuts are fluids in existing fluid cells; caged pasta phases are items; site-locked fluids (`disk_plasma`, `stellar_plasma`) are processed where they are made. No new cell tier, no new AE2 mechanism.

## New process lines

Steps count item nodes as uiv.md does: from the first raw or older product, with older eras' as-built upstream rows counted (a shared older prefix counts again in each line, as UIV lines 21, 38 and 43 share one CVD diamond prefix). A UXV line's product used by another UXV line is not counted again. Numbers in brackets are UXV machines (Our multiblocks); "UIV line n" is uiv.md's line. The Cr column counts crossings: the machines of UEV or older that the line consumes from or feeds, as-built rows included (Crossings).

| # | Line | Steps | Cr | By-products → destination |
|---|---|---|---|---|
| 1 | CoFeB target: cobaltite → Co (EV extraction cascade) → 5N Co (UEV electron beam furnace) → CoFeB melt with Fe, B (UIV levitation melter) → atomised (UV powder bed) → HIP blank (UV powder bed) → bonded `cofeb_target` | 7 | 3 | spent target → re-pressed (UV powder bed) |
| 2 | MgO target: magnesite → MgCl₂ brine purified (EV extraction cascade) → Mg(OH)₂ precipitate → 5N MgO (IV fluorspar kiln) → pressed (UV powder bed) → sintered `mgo_target` | 6 | 3 | CO₂ → voided (inert); CaCl₂ liquor → EV extraction cascade |
| 3 | Heusler target: Mn, Si → 5N (UEV electron beam furnace) → Co₂MnSi `heusler_ingot` with line 1's Co (UIV levitation melter) → homogenised (UEV nitride magnet works) → atomised (UV powder bed) → HIP `heusler_target` | 6 | 3 | melt skull → re-melted |
| 4 | SAF target set: pentlandite → purified ore → `gtceu:platinum_group_sludge_dust` (chemical bath) → Pt, Ru, Ir salts (EV platinum plant, `ev/platinum_plant.js:146-200`) → 5N metals (EV platinum plant) → powders → pressed (UV powder bed) → HIP-bonded `saf_target_set` | 8 | 2 | etch residue → Pt, Ru (EV platinum plant) |
| 5 | Ta seed target: columbite → Nb/Ta split (EV extraction cascade) → Ta₂O₅ → Ta → 5N Ta (UEV electron beam furnace) → rolled (EV hot strip mill) → bonded `ta_seed_target` | 7 | 3 | Nb → stock |
| 6 | MTJ die: Si → `silicon_28_dust` (IV hot cell c5, `hot_cell.json:146`) → `si28_fz_ingot` (UV zone refining c6, `uv/detectors.js:72`) → `si28_fz_wafer` (cutter, `beuv_stm.json:188`) → `h_si28_wafer` (ZPM ion implanter c6, `zpm/qubits.js:125`) → Ta/CoFeB/MgO/CoFeB/Ru stack (1 c1) → field anneal (UEV nitride magnet works) → ion-beam etch (ZPM ion implanter) → SiN cap (UV MOCVD) → probed, diced `mtj_die` | 10 | 6 | redeposit → EV platinum plant |
| 7 | MRAM wafer: line 6's Si-28 prefix to `h_si28_wafer` (ZPM) → Heusler/MgO stack (1 c2) → L2₁ anneal (UEV nitride magnet works) → ion-beam etch (ZPM ion implanter) → Cu back end (UHV foundry) → tested `mram_wafer` | 10 | 6 | as line 6 |
| 8 | Racetrack chip: line 6's Si-28 prefix to `h_si28_wafer` → SAF track stack from `saf_target_set` (1 c3) → field anneal (UEV nitride magnet works) → tracks written (UEV electron beam furnace) → notch-etched (4 c1) → `racetrack_chip` with `mtj_die` read heads (4 c2) | 10 | 6 | etch residue → EV platinum plant |
| 9 | DyScO₃: monazite froth (GTCA) → EuCl₃ solution (EV extraction cascade c5) → depleted liquor (ZPM Eu reductor c1) → Dy₂O₃ (Eu reductor c10) + Sc₂O₃ (EV extraction cascade) → calcined (IV fluorspar kiln) → Czochralski boule (UHV crystal growth) → (110) slices → polished → terrace-annealed `dysco3_substrate` | 9 | 4 | kerf → re-melted |
| 10 | SrRuO₃ electrode: 5N Ru (line 4) + SrCO₃ → SrRuO₃ (IV fluorspar kiln) → `srruo3_target` (UV powder bed) → film on `dysco3_substrate` (2 c1) → O₂-annealed `srruo3_electrode_wafer` | 5 | 3 | RuO₄ fume → EV platinum plant |
| 11 | MESO logic die: merrillite (Mars) → REE chloride solution (EV extraction cascade c1) → mixed RE chloride (c2) → La₂O₃ (c11, as built, `ev/extraction_cascade.js:162`) → La-BFO powder with Bi₂O₃, Fe₂O₃ (IV fluorspar kiln) → `la_bfo_target` (UV powder bed) → BFO film on line 10's wafer (2 c2) → CoFe magnet (2 c3) → patterned `me_switch_wafer` (UEV electron beam furnace) → MESO cell with `sot_readout_stack` (UHV foundry) → `meso_logic_die` | 11 | 5 | Bi fume → EV extraction cascade |
| 12 | hBN flake: air → N₂ (EV cryogenic plant) → BN (UV BN reactor) → Ba-BN charge → HPHT crystal (UEV megabar) → acid-leached `hbn_crystal` → exfoliated `hbn_flake` (3 c3) | 7 | 3 | Ba liquor → recycled |
| 13 | WTe₂ flake: metal sludge (EV platinum plant) → Te (large chemical reactor, `uhv/photonics.js:17`) → 7N Te (UV zone refining) → ampoule with W (EV extraction cascade) → CVT crystal (UHV crystal growth) → Te-flux annealed `wte2_crystal` → exfoliated `wte2_flake` (3 c1) | 7 | 4 | I₂ carrier → recovered |
| 14 | FGT flake: `ionian_sublimate` (LuV Io surface, `luv/io_surface.js:39-48`) → Ge dust → GeCl₄ (UV zone refining c1) → Ge ingot (c2) → Fe₃GeTe₂ charge with line 13's 7N Te and 5N Fe (UEV electron beam furnace) → CVT `fgt_crystal` (UHV crystal growth) → exfoliated `fgt_flake` (3 c2) | 7 | 4 | as line 13 |
| 15 | SOT readout stack: `hbn_flake` → bottom hBN picked up → WTe₂ → FGT → top hBN (3 c4, four transfers in argon from the EV cryogenic plant) → edge contacts (UEV electron beam furnace) → annealed `sot_readout_stack` (UEV nitride magnet works) | 7 | 3 | broken flakes → re-exfoliated |
| 16 | GGG wafer: monazite froth → EuCl₃ solution (EV extraction cascade c5) → depleted liquor (ZPM Eu reductor c1) → Gd₂O₃ (Eu reductor c7, as built, `zpm/europium.js:113-119`) → GGG oxide with `gallium_oxide_dust` (IV fluorspar kiln) → Czochralski boule in `grindless:iridium_crucible` (UHV crystal growth) → (111) slices → polished, O₂-annealed `ggg_wafer` | 8 | 5 | worn crucible → EV platinum plant c5 (`uhv/crystals.js:12-15`); kerf → re-melted |
| 17 | Magnonic bus: merrillite → REE chloride solution (EV extraction cascade c1) → mixed RE chloride (c2) → Y₂O₃ (c11, as built) → dissolved in `lpe_flux` with Fe₂O₃ (5 c1, in a `pt_lpe_crucible`) → YIG film on `ggg_wafer` (5 c2) → annealed → waveguides written (UEV electron beam furnace) → `magnonic_bus` with line 4's Pt antennas and line 44's `stno_array` as the spin-wave source | 9 | 2 | spent flux (5 c3) → Pb dross (EV extraction cascade) |
| 18 | UXV sensor: SiH₂Cl₂ + NH₃ → SiN membrane (UV MOCVD) → back-etched → 70 nm `nanoaperture_array` (UEV electron beam furnace) → `weak_link_cell` (6 c1) → `shequid_gyro` with heat-flushed He-II (UV cold) and `mtj_die` (6 c2) → `uxv_sensor` with `nv_diamond_chip` | 7 | 3 | He-II boil-off → UV cold |
| 19 | Fm-257 target: U-238 target (IV fuel fabrication) → neutron flash (UIV line 32) → Es/Fm debris (IV hot cell) → actinide cut (ZPM actinide partitioning) → Fm fraction (UHV transuranium, HDEHP, as built by UIV-B2) → Fm-257 (UEV calutron c10) → molecular-plated on Ti (UHV transuranium) → sintered `fm257_target` | 8 | 6 | spent target → ZPM waste retrieval; Fm-255 → stock |
| 20 | Es-254 target: line 19's prefix to the actinide cut → Es-254 (UHV transuranium, HDEHP, as built by UIV-B2) → molecular-plated (UHV transuranium) → sintered `es254_target` | 7 | 5 | spent target → ZPM waste retrieval; Es-253 → stock |
| 21 | Element 121: TiCl₄ → Ti-50 chloride (UEV calutron c7, `isotopes.json:104-116`) → Ti-50 sponge (UV pyroprocessing c6, `transcurium_pyroprocessing.json:28`) → melted (UIV levitation melter c3) → `ti50_oven_charge` (`isotopes_uiv.json:39`) → Ti-50 beam on `es254_target` (UEV cyclotron) → recoils separated (UEV recoil separator) → caught, `element_121_recoil` (UEV chem lab) | 8 | 6 | target activation → ZPM waste retrieval |
| 22 | Element 122, census III: line 21's Ti-50 prefix to `ti50_oven_charge` → beam on `fm257_target` (UEV cyclotron) → recoils (UEV recoil separator) → `element_122_recoil` → `superheavy_census_iii` with line 21's recoil (UEV chem lab) | 9 | 6 | as line 21 |
| 23 | Cm-248 target: curium oxide (ZPM actinide partitioning) → heavy curium oxide (UV heat source works c1) → `transcurium_target` (UHV transuranium c4) → irradiated (UHV HFIR c1) → transcurium liquor (UHV transuranium c1) → Cf-252 (c2) → `gtceu:curium_248_dust` by Cf-252 alpha decay (IV hot cell c8, `hot_cell.json:184-191`) → plated (UHV transuranium) → sintered `cm248_target` | 9 | 6 | activated target → ZPM waste retrieval; Cm-244, Cm-246 → stock |
| 24 | Island nuclides: depleted UF₆ → UF₄ → U metal charge (IV fuel fabrication) → U-238 beam (UV synchrotron) → on `cm248_target` (7 c1, through the `gas_stopping_cell`) → thermalised (7 c2) → MR-TOF-selected `island_nuclide` (7 c3) | 7 | 3 | fragments → Pb, Hg, Pt (ZPM actinide partitioning) |
| 25 | Gamma-ray emitter: Cas A knots → `ejecta_knot_dust` (21) → Ti fraction (EV extraction cascade) → TiCl₄ → Ti-44 (UEV calutron) → sealed `ti44_core` (IV hot cell) → positronium moderated on solid Ne (8 c1) → `positron_stack` (UV antimatter trap) → `gamma_laser_module` with the UIV gamma cavity and `mtj_die` (8 c2) → `uxv_emitter` | 10 | 4 | Si, S, Ar, Ca, Fe → voided (inert); spent core → Ca-44 (IV hot cell) |
| 26 | Hot CNO fuel: `stellar_plasma` lifted with He coolant (10; UV cold) → H and CNO cuts (11 c1) → burned (9 c1) → `cno_ash_plasma` → EU (ZPM DEC) → He-4 and 95% of the CNO back | 6 | 2 | none; the catalyst returns |
| 27 | Triple-alpha fuel: He-4 cut (11 c1) with line 26's He-4 → polished `triple_alpha_fuel` (EV cryogenic plant) → burned (9 c2) → ash plasma → EU (ZPM DEC) → C-12 + O-16 (ZPM quench caster) | 6 | 3 | Ne, H frozen out → stock |
| 28 | Carbon-burning fuel: C-12 (line 27) → vapour-purified `carbon_burning_fuel` (UEV electron beam furnace) → burned (9 c3) → EU (ZPM DEC) → Ne-20, Na-23, Mg-24 (ZPM quench caster) | 5 | 3 | Ne-20, Na-23, Mg-24 → stock (ordinary Ne, Na, Mg) |
| 29 | Oxygen-burning fuel: O-16 (line 27) → liquefied `oxygen_burning_fuel` (EV cryogenic plant) → burned (9 c4) → EU (ZPM DEC) → Si-28, S-32, P-31 (ZPM quench caster) | 5 | 3 | `si28_ash` → stock for OpV; S, P → stock |
| 30 | Field generator: `disk_plasma` skimmed on `mh_winding` (13) → filtered (11 c2) → FRC formed (14 c1) → `frc_cartridge` → in a strand coil (strand tape, LuV coated conductor line; wound, ZPM magnet works) → `uxv_field_generator` | 6 | 3 | cartridges also → warp gate c8 (UHV) |
| 31 | BZ power: `mh_winding` → `disk_plasma` (13) → filtered (11 c2) → `flux_loaded_plasma` (14 c2) → burned at 2^30 EU/t (15) | 5 | 0 | the jet carries it off; 14 c2's formation hydrogen goes to stock (QR) |
| 32 | Pasta strand: Vela timing (ZPM DSN) → `raw_pasta` (16) → `spaghetti_phase` (17) → caged in a `cage_part` (UIV neutronium cage mode) → drawn in an aerogel sheath (18; ZPM aerogel) → `gtceu:pasta_strand_single_wire` | 6 | 2 | gnocchi → r-process stock (UIV decompressor) |
| 33 | Lasagna plate, UXV hull: `raw_pasta` → `lasagna_phase` (17) → caged in a `cage_part` → pressed with `wf_rhea_billet` into `lasagna_plate` (19 c1) → `gtceu:uxv_machine_hull` (on GTM's `uxv_machine_casing`, whose recipe is UIV's gate, uiv.md:1627) | 5 | 0 | anti-phases → `pasta_core_sample` (17 c2) |
| 34 | UXV motor: raw tetrataenite (LuV belt vein, `veins_belt.json:22`) → crushed → `gtceu:tetrataenite_dust` (LuV asteroid belt magnetic split, `luv/asteroid_belt.js:47`) → `gtceu:tetrataenite_ingot` → cold-rolled (EV hot strip mill) → laminations → magnetised rotor (ZPM magnet works) → stator of strand tape (LuV coated conductor line, wound on LuV HTS magnet works) → `uxv_electric_motor` | 9 | 5 | lamination scrap → re-melted |
| 35 | UXV pump: Na + K (ordinary stock; natural Na is all Na-23) → NaK → ALIP duct rolled from `lasagna_plate` (EV hot strip mill) → three-phase strand coils (LuV coated conductor line; ZPM magnet works) → NaK-filled, sealed → `uxv_electric_pump` | 6 | 3 | none |
| 36 | UXV piston: merrillite → REE chloride solution (EV extraction cascade c1) → mixed RE chloride (c2) → Tb₄O₇ (c10, as built) → Tb (ZPM Eu reductor c6, as built) → Terfenol-D melt with Dy (line 9's Dy₂O₃ reduced, Eu reductor c11; UIV levitation melter) → [112] Bridgman rod (UHV crystal growth) → prestressed in a `lasagna_plate` housing → `uxv_electric_piston` with a strand drive coil (LuV coated conductor line) | 9 | 4 | rod ends → re-melted |
| 37 | UXV conveyor: Ni, Mn, Ga → 5N (UEV electron beam furnace) → Ni₂MnGa melt (UIV levitation melter) → single crystal (UHV crystal growth) → twin-trained (UEV nitride magnet works) → `uxv_conveyor_module` (MSM elements driven by strand coils, LuV coated conductor line) | 6 | 4 | offcuts → re-melted |
| 38 | Mk6 casing: scheelite → WO₃ (EV extraction cascade) → W-184 (UEV calutron c13) → W-184 wire → fibre preform (UEV CVI) → infiltrated `wf_rhea_billet` (UIV) → `uxv_fusion_casing` | 7 | 3 | W-182, W-186 → stock |
| 39 | SMES cell: strand wire (line 32) → strand tape (LuV coated conductor line) → solenoid (UEV nitride magnet works) → `lasagna_plate` case → He-II cooled (UV cold) → `uxv_smes_cell` | 6 | 3 | none |
| 40 | Whipple shield: methane → `grindless:cnt_sock` (ZPM methane pyrolyser c3, `zpm/outer_chemistry.js:55`) → `cnt_densified_yarn` (as built, `earth_orbit.json:40`) → `cnt_twisted_yarn` (as built, `:140`) → `cnt_bumper_weave` (UHV tether works) → on `whipple_shield_casing` with RHEA plate → `cnt_whipple_shield` (spent at warp gate c9, UHV) | 7 | 3 | none |
| 41 | KrF laser (PLD part): air → Kr (EV cryogenic plant) → KrF premix with F₂ (IV fluorspar kiln) → discharge tube with `vuv_caf2_optic` windows (UHV crystal growth, as built, `uhv/crystals.js:16`) → pulsed-power head → `krf_excimer_laser` | 6 | 3 | spent premix → F₂ scrubbed (IV) |
| 42 | LPE crucible: line 4's pentlandite prefix → 5N Pt (EV platinum plant) → electron-beam melted (UEV electron beam furnace) → sheet (EV hot strip mill) → spun, welded `pt_lpe_crucible` | 7 | 3 | worn crucible → EV platinum plant |
| 43 | Gas stopping cell (MNT part): He (UV cold) → 6N He (EV cryogenic plant) → RF carpet board (UHV foundry) → cryogenic cell → `gas_stopping_cell` | 5 | 3 | He → recovered |
| 44 | STNO array: line 6's Si-28 prefix to `h_si28_wafer` → Heusler/MgO nanopillar stack (1 c4) → pillars defined (UEV electron beam furnace) → ion-milled (ZPM ion implanter) → SiN-planarised (UV MOCVD) → Au contacts, phase-locked `stno_array` (UHV foundry) | 10 | 6 | mill redeposit → re-melted (UIV levitation melter) |
| 45 | Strain-wave gear: tantalite → `tantalite_fluoride_cake` (`electron_beam.json:110-112`) → `niobium_oxyfluoride_dust` (EV extraction cascade c9, `ev/extraction_cascade.js:144-146`) → `niobium_powder` (`electron_beam.json:116-118`) → `six_n_niobium` (UEV electron beam furnace c4, as built) → Ti-23Nb-0.7Ta-2Zr-O gum metal blend → sintered (UV powder bed) → hot-forged (EV hot strip mill) → 90% cold-swaged cup → hobbed, shot-peened `gum_metal_flexspline` → `uxv_strain_wave_gear` | 11 | 4 | K₂TaF₇ → Ta stock; swarf → re-sintered |
| 46 | Ga₂O₃ power die: gallium → `gallium_oxide_dust` (chemical reactor, `earth_orbit.json:43`) → EFG crystal from an Ir die (UHV crystal growth) → (010) wafer → Sn-doped homoepitaxy (UV MOCVD) → gates patterned (UEV electron beam furnace) → diced, packaged `ga2o3_power_die` (UHV foundry) | 7 | 5 | worn Ir die → EV platinum plant c5; kerf → re-melted |
| 47 | Shielded interposer: Ni, Fe, Mo → mu-metal ingot (UEV electron beam furnace) → hot band (EV hot strip mill) → `mu_metal_foil` → H₂-annealed (UEV nitride magnet works) → drawn shield can → `shielded_interposer`: the can bonded over UIV's `glass_interposer` (UIV line 12; UHV foundry) | 7 | 4 | trim → re-melted |
| 48 | UXV voltage coil: Fe-Si-B-Nb-Cu charge → melt (UIV levitation melter) → 20 µm amorphous `finemet_ribbon` by planar flow casting (ZPM quench caster, new mode) → wound toroid → nanocrystallised in a field (UEV nitride magnet works) → strand-wound `uxv_voltage_coil` | 6 | 2 | ribbon trim → re-melted |
| 49 | TMR encoder: line 34's tetrataenite prefix to `gtceu:tetrataenite_ingot` → rolled ring (EV hot strip mill) → `multipole_encoder_ring` (ZPM magnet works) → `tmr_encoder` with an `mtj_die` bridge | 7 | 3 | ring scrap → re-melted (a real output, QR) |

**Totals:** 49 lines, 359 steps, an average of 7.33 (UIV 7.2), none under 5 (rule 7's floor is 4); 178 crossings.

**Weakest claims:**
- Lines 26-29 burn a massive star's sequence in a ring: the reactions are textbook (B²FH 1957), the ring is named fiction.
- Line 31 is the shortest and has no crossing: power from the Kerr black hole, kept because the BZ dynamo is the Cygnus platform's source (rule 8).
- Line 33's casing has no crossing: pasta plate is a Vela product; the hull's other inputs are UIV.
- Lines 32-33: pasta as a drawn conductor and a plate is named fiction on real physics (Caplan 2018).
- Lines 41-43 are machine parts (UIV counted parts such as line 19's wick and line 20's droplet sheet); each is a real laboratory part: PLD runs on KrF lasers, YIG LPE uses Pt crucibles, MNT products are caught in gas cells.
- Shared older prefixes count again (Si-28 in lines 6-8 and 44; U-238 flash in 19-20; Ti-50 in 21-22; tetrataenite in 34 and 49; pentlandite in 4 and 42), as UIV counted its CVD diamond prefix in three lines.
- Line 48's planar flow casting is a new mode on the ZPM quench caster, which quenches plasma ash; a 10⁶ K/s chill wheel is the same job on a melt (open question 13).
- Lines 44-49 are real hardware: phase-locked STNO arrays (Kaka 2005, Mancoff 2005, Nature 437:389, :393) driving spin waves (Madami 2011, Nat. Nanotech. 6:635); gum metal (Saito 2003, Science 300:464) as the flexspline of a strain-wave gear, as UIV-A8's BMG flexspline (DECISIONS.md:539); β-Ga₂O₃ power transistors (Higashiwaki 2012, APL 100:013504; EFG wafers, Kuramata 2016); mu-metal shielded MRAM packages; Finemet cores (Yoshizawa 1988, J. Appl. Phys. 64:6044) in solid-state transformers; TMR angle encoders.
- Line 25's Ti-44 activity at game scale is *(tune)*; Cas A holds about 1.5 x 10⁻⁴ M☉ of it (Grefenstette 2014).

## Crossings

A crossing is one (UXV line, older machine) pair from the Cr column; UIV is one era back and does not count (uiv.md counted UHV and older for UIV, so UXV counts UEV and older). The lines table is the list; this is the summary.

| Era | Crossings | Machines met |
|---|---|---|
| UEV | 38 | electron beam furnace (16), nitride magnet works (9), calutron (5), chem lab (2), cyclotron (2), recoil separator (2), megabar, CVI |
| EV | 34 | extraction cascade (12), platinum plant (9), hot strip mill (7), cryogenic plant (6) |
| ZPM | 31 | waste retrieval (5), quench caster (4), DEC (4), magnet works (4), actinide partitioning (4), ion implanter (4), Eu reductor (3), DSN, aerogel, methane pyrolyser |
| UV | 27 | powder bed (7), zone refining (6), cold (4), MOCVD (4), pyroprocessing (2), BN reactor, synchrotron, antimatter trap, heat source works |
| UHV | 21 | crystal growth (8), foundry (6), transuranium (3), warp gate (2), HFIR, tether works |
| IV | 17 | hot cell (8), fluorspar kiln (6), fuel fabrication (3) |
| LuV | 10 | coated conductor line (6), asteroid belt (2), HTS magnet works, Io surface |
| **Total** | **178** | 44 older machines (x1.78 on UIV's 100); HV and below give ordinary stock only |

Counted by UIV's method: as-built upstream rows count (cascade, platinum plant, hot cell, EBF and zone-refining rows the chain actually runs), and a by-product destination counts when it is a row on that machine. A line that meets one machine twice counts once; a by-product destination counts when it is a row on that machine. C1 checks the pairs against the built rows (Validator).

## Quests

Short, in English, each with a small reward. They never block a recipe (rule 5). C2 builds them (`tools/quests/uxv-chapter/`, `pl-data-uxv.mjs`).

| Part | Quests | Ends with |
|---|---|---|
| 1. Spintronics | 7 | a CoFeB target, an MTJ die, an MRAM wafer, a DyScO₃ substrate, a MESO logic die, a racetrack chip, `gtnn:spintronic_mainframe` |
| 2. The sensor | 4 | a nanoaperture array, a weak link cell, the SHeQUID gyro, `grindless:uxv_sensor` |
| 3. Superheavy III | 5 | an Fm-257 target, an Es-254 target, element 121, element 122 and census III, an island nuclide and the island chart |
| 4. Cygnus X-1 | 6 | the stellar elevator, the filter cuts, the condensation tower, disk plasma, an FRC cartridge, a BZ run |
| 5. The Kerr sling | 3 | a launched relay seed, the Whipple shield, the first jump |
| 6. Vela | 6 | raw pasta at glitch time, a caged phase, strand wire, a lasagna plate, `gtceu:uxv_machine_hull`, a polar cap run |
| 7. Cassiopeia A | 4 | knot dust, a Ti-44 core, a gamma laser module, `grindless:uxv_emitter` |
| 8. Parts and power | 6 | the UXV motor, pump, conveyor and piston, the field generator, the Mk6 ring through c4, a UXV SMES cell |
| 9. Scale | 2 | the UXV parallel hatch, the stellar fractionation hall |
| 10. Gate | 3 | the arm chart, the 2^31 hold, OpV casing research |

46 quests *(tune)*. Fiction quests (the stellar burning ring, pasta as cable and plate, the Kerr sling, the FRC and Whipple shields, the gamma laser) say so in their text.

## Gate to OpV

| What is built or run | What it tests |
|---|---|
| `gtceu:opv_machine_casing` researched with `grindless:bulge_chart` (the casing exists in the dump; the research and the casing's assembly-line recipe go in `server_scripts/grindless/uxv/gate.js`, B6, by the pattern of `uhv/gate.js:206-219` and uiv.md:1627) | the arm chart, the Matrioshka, all three places |
| Warp gate c10 at Cygnus X-1 orbit: 16 A x V[UXV] = 2,147,483,648 EU/t for 1,200 t *(tune)* over the network through two UXV 16 A input hatches (S0-2; fallback 15 A = 2,013,265,920 EU/t) | the BZ dynamo with two polar cap taps, or the Mk6 through DEC; wireless case 12; the UXV hatches (after Vela) |
| The c10 row consumes 1 `grindless:frc_cartridge` and keeps (not consumed, the six slots of `uhv/gate.js:90-97`) `grindless:superheavy_census_iii`, `grindless:island_chart`, `grindless:arm_chart`, `grindless:pasta_core_sample` and 4 `gtnn:spintronic_mainframe`; it outputs 1 `grindless:bulge_chart` | Cygnus, superheavies III, the MNT collider, Vela, Cas A (through the arm chart's Ti-44 map), the spintronic lines |
| `grindless:arm_chart` on UIV's Matrioshka (new row) from `vela_glitch_record`, `ti44_map`, `elevator_log` and `cygnus_vlbi_record` | the three places' data, held to both substages |
| One representative run per new place and the substages `uxv`, `uxv-vela` and `uxv-cas-a` reached | the site rules and platforms |

- **It unlocks:** the OpV substage `opv` (the stage grant follows `uhv/gate.js:294`). OpV's design starts from *Reserve for OpV*: industrial antimatter, stable exotic matter, the Kugelblitz forge, self-replicating probes and the galactic bulge (journey.md:53) are its lines.
- **It cannot unlock:**
  - anything of MAX or MAX+ (DECISIONS.md:450, :507): `black_hole_orbit`, Sagittarius A*, a hyper stargate, creative items;
  - an OpV hull or hatch, which needs OpV's own S0-1 (a fourth tier on UEV's builders);
  - any OpV product: the gate gives a chart and casing research, never antimatter, exotic matter or a probe.

  UXV adds no creative item or stargate block. Its OpV hooks are listed under *Reserve for OpV*.

## Validator (`-Tier uxv`)

- **Ti-44, Fm-257 and W-184 only from the UEV calutron** (with UIV's and UEV's calutron isotopes as built). Ti-44 only from Cas A knot dust. Es-254 only from the UHV transuranium HDEHP split (UIV-B2) and Cm-248 only from the IV hot cell's Cf-252 decay store (`hot_cell.json:184-191`), both as built; no second route.
- **Elements 121 and 122 and census III only from the cyclotron, the recoil separator and the chem lab; `island_nuclide` and `island_chart` only from the MNT collider.**
- **Spintronic intermediates only from their machines:** MTJ, MRAM and SAF stacks from the sputter cluster; oxide films from the PLD chamber; vdW stacks from the stacking cell; tracks from the racetrack fab; YIG from the LPE furnace; gyros from the SHeQUID works.
- **`gtnn:spintronic_mainframe`:** only from the UEV photonic integration hall row; at `uxv`; GT--'s own recipe stays removed (F2).
- **The Mk6's plasmas only from the Mk6.** The Mk6, its DEC rows, the BZ dynamo and the polar cap tap are written final and not in `power/generators.js`'s list.
- **Place-only items** as in *Only from there*: stellar plasma and cuts, disk plasma, FRC cartridges, flux-loaded plasma and the elevator log from Cygnus X-1 orbit; pasta phases, strand wire, lasagna plates, the core sample and polar cap electrodes from Vela pulsar orbit; knot dust from Cassiopeia A.
- **Three substages:**
  - `uxv` (Earth, Mercury and Cygnus X-1 orbit);
  - `uxv-vela` and `uxv-cas-a` (in parallel, after the Kerr sling);
  - the gate after both.

  No Earth recipe takes a Vela or Cas A product before its substage; `gtceu:uxv_machine_hull`, the UXV hatches, the Mk6 and every UXV component except the sensor are held to `uxv-vela`, and `uxv_emitter` to `uxv-cas-a`.
- **Long values:** the c10 row's EU/t and the 16 A UXV hatch buffer are read as long (S0-2); no recipe EU/t is above 2^31.
- **Nothing hand-gathered;** no OpV item in a UXV recipe (the OpV casing is only researched).
- **C1 re-counts** the lines' nodes (359 steps, 49 lines, average 7.33, none under 5), the 178 crossings (44 machines of UEV or older) and the 46 older machines with a mode, by UIV's method (*New process lines*).

## Mods and integration

| Mod | Use | Spike |
|---|---|---|
| GregTech Modern 7.5.3 | UXV hull and hatches on UEV's builders with `highTierContent` off; `registerFusionTier(12)`; strand cable properties; parallel hatch tier 12; a 2^31 recipe EU/t | S0-1, -2, -4, -6, -8 |
| GCYR 0.2.9 | two datapack places at tier 12 (fallback 11), no rocket offers them | S0-3, -9 |
| GT-- (gtnn, AGPL, in game) | `gtnn:spintronic_mainframe` unhidden at `uxv` with our recipe | S0-5 |
| GT Community Additions | none new | — |
| AE2 | relays as at UIV, seeded by each arrival platform | S0-10 |
| FTB Quests, FTB Chunks | chapter, chunk loading of the far platforms | S0-10 |

### The `highTierContent` decision: off, on UEV's builders (as UIV)

- **Evidence:** UIV-S0 found that a second `machine_hull` or energy hatch create crashes the boot (`Duplicate key 'gtceu:machine_hull'`, DECISIONS.md:526), so UIV's hull and four hatches come from UEV's builders with `.tiers(UEV, GTValues.UIV)` (`uev/foundation.js:178-180` hatch helper, `:192-193` hull; `uiv/foundation.js:7-9`). ON would still widen every GTM tier set and add recipe-less ids (uiv.md, the same decision).
- **Choice:** keep it OFF. F1 widens both calls to `.tiers(UEV, GTValues.UIV, GTValues.UXV)` with tier-named labels, giving `gtceu:uxv_machine_hull`, `gtceu:uxv_energy_input_hatch`, `gtceu:uxv_energy_output_hatch`, `gtceu:uxv_energy_input_hatch_16a` and `gtceu:uxv_energy_output_hatch_16a`. Their recipes go in `server_scripts/grindless/uxv/foundation.js` (B4, after lasagna exists).
- **S0-1** proves the third tier forms, the labels read UXV and the 16 A UXV hatch buffer (16 x V[UXV] x 64 *(tune)*) is a long. Fallback: none cheaper than ON with mass hiding (orchestrator decision).

**Startup:** `uev/foundation.js` (F1, two lines), `uxv/foundation.js` (F1: components and shared items), one file per package, `lv/wireless_energy.js` (W), `lib/parallel_hatch.js` (M1), `lib/mega.js` (read unchanged by M2), `uxv/travel.js` (B1).
**Server:** `server_scripts/grindless/uxv/*.js`; older-era rows in their own files (*Older machines*).
**Data:** `data/gcyr/gcyr/planets/` and the solar system files S0-3 names, `tables/relay_platforms.json` (two rows), `tables/sunlight.json`, `tables/wireless_energy.json`, `tables/fusion_mk6.json` (new), and the older tables each contract names (*Build order*).

## Save compatibility

- Nothing registered is removed. New ids only.
- The new dimension ids (`grindless:vela_pulsar_orbit`, `grindless:cas_a_remnant`) never change once shipped; `grindless:cygnus_x1_orbit` is UIV's and unchanged.
- `highTierContent` stays off in the shipped `gtceu.yaml`. The release note lists the `gtceu:uxv_*` ids that would collide if it were turned on (S0-1).
- **Widening UEV's builders** adds a tier; the UEV and UIV hulls and hatches keep their ids, labels and recipes (S0-1 reopens a v0.13.0 save).
- **Older-file rows** add recipes only. The warp gate's rows and the swarm station's dimension list are widened, never narrowed.
- **The Mk6's pattern is new.** GTM's rings, the Mk4 and the Mk5 are untouched.
- **Arrival platforms** are placed once per world and never moved or rebuilt by a later version.
- **C3 reopens a v0.13.0 save** and checks UIV machines, the Cygnus platform, the relays and the network.

## Risks

| Risk | Effect | Mitigation |
|---|---|---|
| **Lines 49 against ~69 (x1.07 of UIV's 46)** | the rule 7 guideline is missed in the measure the user stressed; the average (7.33) holds | every missing line named under Considered and dropped; open question 9 (default accept, no padding) |
| 21 multiblocks against ~30 | size target missed | per item under Considered and dropped; open question 1 |
| A third tier on UEV's builders fails (S0-1) | no UXV voltage | ON with mass hiding (orchestrator) |
| A 2^31 recipe EU/t or 16 A UXV hatch overflows (S0-2) | gate cannot hold | 15 A = 2,013,265,920 EU/t, time scaled to the same EU *(tune)* |
| Tier 12 datapack places don't load (S0-3) | Vela, Cas A missing | tier 11, as Cygnus |
| `registerFusionTier(12)` or its long starts fail (S0-4) | no Mk6 | starts under 2^31 *(tune)*; else a KubeJS multiblock with the `fusion_reactor` type, as uiv.md's Mk5 fallback |
| `gtnn:spintronic_mainframe` not in `#gtceu:circuits/uxv` (S0-5) | no UXV circuit | add the tag in F2 |
| x65,536 parallels times EU/t overflow (S0-6) | no x65,536 hatch | cap at energy-bound parallels; hatch stays x16,384 |
| Wireless case 12 caps (S0-7) | wrong caps | cap at the long-safe value, the gate's 16 A first |
| The strand cable loses at V[UXV] (S0-8) | no UXV cable | properties as `uev/foundation.js:165` with zero loss; else a superconductor flag |
| Site atmosphere or gravity rows (S0-9) | machines fail on site | the UIV-B1 rows reused |
| The Kerr sling or a second platform row (S0-10) | no jump | the UIV warp gate rows reused; a one-way arrival kit |
| UIV-B1 to B5 or M2 not merged when F1 starts | contracts drift | *Inherited* re-checked before F1; the UIV package is named in each *Depends on* |
| Several packages append rows to the UEV electron beam furnace (about 14) and the nitride magnet works | merge conflicts | one writer per table per wave (*Parallel and serial*) |
| Circuit collisions on shared types | repairs | every contract names its circuits after `git grep` (Common) |
| Far platforms on the 4 GB client | out of memory | one leg per run |
| Fiction (stellar burning ring, pasta cable, Kerr sling, gamma laser) | realism | named fiction in the doc, EMI and quests |
| **QR gates do not know tier 12** (`TIER_NAMES`, `TIER_PREFIX`, `eraTier`, `complexFloor`, process_audit `ERAS`/`TIER_ERA` stop at UIV) | UXV recipes and items are judged as no era or skipped; a package "passes" without being checked | F2 adds tier 12 before A1 (*Decisions proposed*); until then a package runs the gates with `--era uxv` and reads the findings |
| **Mk6 on the lib ring** fails the structure rubric (casing share) | A7 cannot pass without a baseline | A7 runs structure-quality first; above 70% is an escalation to a lib change, never a baseline (open question 14) |
| **Big structures** (up to 17x7x17 and 13x25x13) in Rhino | `const` in loops breaks the pattern; previews slow or wrong | `var` only, a package-local shell helper, `--static --check`; the preview is looked at in T3 |
| **22 controllers and 13 parts by research** | a research station queue at `uxv`; a research item that is a previous controller costs one more controller | every research item is ours and made before its use (*Bootstrap check*); complexity, not quantity (rule 2) |
| **20 new loops** (sound budget; about 2.0 MB for 55 loops now) | pack size about +0.7 MB | the Starter settings (6 s, `-q 0`); the integrator generates once per batch; open question 15 |
| **Shared `sounds.js` and `tools/assets/sounds.json`** written by every multiblock package | one-line merge conflicts | each package appends its rows at the end; pairs never touch the same row; the integrator resolves at merge |
| **BZ chain energy** (pre-existing, *(tune)*): skimmer, filter c2 and FRC c2 cost about 10x the EU the BZ dynamo returns at the draft numbers | the Cygnus generator loses energy, which is useless rather than free | B3 tunes so the chain returns more than it costs (product rule 8: generous, never free) and states the balance on the dynamo's info page; open question 17 |
| **Process honesty amounts** (ballast, backings, buffer gases) | inputs too cheap or too dear | all *(tune)*; they add steps of complexity, never raw quantity |

### Bootstrap check (UEV-C1 lesson, DECISIONS.md:516-517)

| Needed | Its inputs come from | Needed in | Cycle? |
|---|---|---|---|
| Controllers 1-6 | UIV hull, `gtnn:optical_mainframe`, UIV components; `he_6n`; the research items and domain inputs of the controller table (home or UIV) | `uxv` | no |
| `he_6n` (Earth era fluid) | helium + liquid nitrogen (EV cryogenic plant, A2) | `uxv` | no |
| `mgo_target` (MTJ die, sensor) | magnesite through EV, IV, UV plants | `uxv` | no: never Mk6 ash (fixed in this design) |
| `uxv_sensor` | `mtj_die`, SHeQUID gyro, `nv_diamond_chip` | `uxv` | no |
| `gtnn:spintronic_mainframe` | machines 1-5, home older plants; `shielded_interposer` (mu-metal through UEV, EV plants; UIV `glass_interposer`); magnonic bus with `stno_array` (UIV Si-28 wafer, machine 1 c4) | `uxv` | no: every input is home or UIV |
| `ga2o3_power_die` | ordinary Ga, UHV crystal growth, UV MOCVD, UEV electron beam furnace, UHV foundry | `uxv` | no |
| `uxv_strain_wave_gear`, `tmr_encoder` (arm) | `six_n_niobium` (as built), UV powder bed, EV hot strip mill; LuV tetrataenite, ZPM magnet works, `mtj_die` | `uxv` (the arm at `uxv-vela`) | no |
| `uxv_voltage_coil` (hatches) | `finemet_ribbon` (UIV levitation melter, ZPM quench caster c6), UEV nitride anneal, strand wire (Vela) | `uxv-vela` | no: the hatches are held there already |
| Controllers 7, 8, 10-21 | UIV hull, 2 spintronic mainframes, `uxv_sensor`, UIV components; `he_6n` or a Cygnus fluid; the research items and domain inputs of the controller table (home, UIV, Cygnus, or `cage_part` and `neutronium_pellet` from RX J1856) | `uxv` (built at home, carried) | no: no Vela or Cas A product; the Vela controllers' research items are home records or earlier controllers built at home |
| Cygnus era fluids (`stellar_hydrogen_cut`, `stellar_helium_cut`, `filtered_disk_plasma`) | machines 10, 11 and 13, whose controllers take `he_6n` (10, 11) or a cut made by 10 and 11 (13) | `uxv` | no |
| `frc_cartridge` (Vela travel) | disk plasma skimmed on `mh_winding` (UIV), never pasta | `uxv` | no |
| `cnt_whipple_shield` (Cas A travel) | UHV tether works, RHEA plate (UIV), `whipple_shield_casing` (LuV); no lasagna | `uxv` | no |
| `launched_relay_seed` | UIV relay seed, probe bay mode | `uxv` | no |
| `cage_part` | UIV neutronium cage at RX J1856 | before Vela | no |
| Pasta extractor | `vela_glitch_timing` (ZPM DSN, home) | `uxv-vela` | no |
| Cas A sweeper power | wireless case 11 (UIV): its recipe stays at or under 4 A x V[UIV] *(tune)*, so case 12 is not needed before Vela | `uxv-cas-a` | no |
| `gtceu:uxv_machine_hull`, UXV hatches | `lasagna_plate` (Vela), UIV-B5's `uxv_machine_casing`, strand wire | `uxv-vela` | no |
| UXV motor, pump, piston, conveyor, field generator, arm | strand tape and lasagna (Vela), natural Na, Cygnus cartridges | `uxv-vela` | no: the pump's Na is ordinary sodium, never Mk6 ash (fixed) |
| Mk6 controller | UXV hull and motor, pump, field generator (not the emitter); the Mk5 controller as research; `stellar_hydrogen_cut`; `uxv_fusion_casing` | `uxv-vela` | no: the Mk6 is never needed for the hull or the parts |
| `uxv_fusion_casing` | `wf_rhea_billet`, `w184_cvi_preform`, `mh_winding` (UIV and A3), `uxv_field_generator`, tritanium frame, `he_6n` | `uxv-vela` | no: no Mk6 product |
| `uxv_emitter` | Ti-44 (Cas A), `mtj_die`, UIV gamma cavity | `uxv-cas-a` | no |
| Gate c10 | cartridge, census III, island chart, arm chart, core sample, mainframes; 2^31 EU/t from BZ + taps or Mk6 | both substages | no |

## Build order

UXV is built in packages after v0.13.0, as UIV was. Each package below is one work-package issue (`.github/ISSUE_TEMPLATE/work-package.yml`), and its contract is written so the issue can be filled from this section alone. Each package's rationale is the machine sections and lines it cites.

**Test bands** are assigned by the integrator when it opens each issue (`tools\test\Get-GGTestZone.ps1 -Next` after UIV-C3's row). The worker adds only that row to `tools/test/zones.json`. F1, F2, C1 and C2 have no native test and no band.

**Script load-order bands** (`tools/analysis/script_order.json`) are integrator-owned. Every cross-file mutation names its band as "assigned by integrator"; packages never add `// priority:` lines (the integrator stamps them).

### Common to every package

UIV's *Common to every package* (uiv.md:981-1018) applies with `uiv` replaced by `uxv` in every path. The changes for UXV:

- **Allowed, always:** `startup_scripts/grindless/uxv/<name>.js`, `server_scripts/grindless/uxv/<name>.js`, `client_scripts/grindless/uxv_<name>_lang.js`, new tables `tables/<name>*.json`, `tools/assets/Build-UXV<Name>Textures.ps1` and its outputs, `assets/emi/recipe/additions/grindless/uxv_<name>_*.json`, `tools/analysis/test/uxv-<name>.test.mjs`, `tools/test/overlay/kubejs/server_scripts/gg_test_uxv_<name>.js` and the package's row in `tools/test/zones.json`.
  - **Its own obtain rule:** the package deletes its own class B rule in `tools/analysis/tiers/obtain.json` (F2 adds one per producing package, DECISIONS.md:431 pattern) and every `tools/analysis/emi_coverage.json` "use" exception its recipes resolve. Nothing else in either file.
  - **Pinned older tests:** a test that pins the row count, circuit list or lang keys of an older table the package appends to (named in each contract) is an allowed edit, limited to adding the new row with a comment naming the package, or appending the package's lang file to a lang check.
  - **EMI and sound (QR):**
    - per multiblock of its own, `assets/emi/recipe/additions/grindless/<machine>.json` (the info page's stack list);
    - per new recipe type, one row in `tools/assets/sounds.json` and its line in `WIRING` of `startup_scripts/grindless/sounds.js`. `sounds.test.mjs` accepts a spec row whose `.ogg` does not exist yet, and the integrator generates the audio and the shipped `assets/grindless/sounds.json` once per batch.
- **Gates (QR, DECISIONS.md:551-567):** each package's T0 passes, with no new baseline entry, `node tools/analysis/structure-quality.mjs --static --check`, `recipe-quality.mjs`, `process-audit.mjs` and `emi-coverage.mjs`.
  - A package never edits `tools/analysis/emi_runtime_known.json` (the integrator's ratchet) or any baseline (`structure_quality`, `recipe_quality`, `process_audit`, `emi_coverage`), except to delete entries it resolves.
  - The gates judge UXV only once the integrator has added tier 12 (*Decisions proposed*, F2); until then a package also runs them with `--era uxv` and reads the findings by hand.
- **Info pages and loops (QR):**
  - Every multiblock of the package ships an EMI info page in its own `client_scripts/grindless/uxv_<name>_lang.js`, with keys `emi.grindless.info.<machine>.<n>` in en_us and es_es. The page says what the machine does, its recipe types and modes, where it must stand (site rows: the source of their matter), what its byproducts become, and what it unlocks.
  - Every item of ours with no consumer yet (the OpV-bound ids in *Reserve for OpV*, the `stock` outputs) gets an info page in the producing package's lang file that names its use or "stock for OpV".
  - Every new recipe type has a working loop `loop_<machine>`, listed below; the Mk6 and M2 keep GTM's sounds.

  | Type → loop | Type → loop |
  |---|---|
  | `mtj_sputtering` → `loop_mtj_sputter_cluster` | `star_lifting` → `loop_stellar_elevator` |
  | `pulsed_laser_deposition` → `loop_oxide_pld_chamber` | `plasma_mass_filtering` → `loop_plasma_mass_filter` |
  | `vdw_stacking` → `loop_vdw_stacking_cell` | `stellar_condensation` → `loop_stellar_condensation_tower` |
  | `racetrack_patterning` → `loop_racetrack_fab` | `disk_skimming` → `loop_accretion_disk_skimmer` |
  | `liquid_phase_epitaxy` → `loop_yig_lpe_furnace` | `frc_forming` → `loop_frc_former` |
  | `shequid_assembly` → `loop_shequid_works` | `blandford_znajek` → `loop_bz_dynamo` |
  | `multinucleon_transfer` → `loop_mnt_collider` | `pasta_extraction` → `loop_pasta_extractor` |
  | `annihilation_lasing` → `loop_annihilation_laser_works` | `pasta_sorting` → `loop_pasta_phase_sorter` |
  | `pasta_drawing` → `loop_pasta_draw_bench` | `pasta_lamination` → `loop_pasta_laminator` |
  | `polar_cap_tapping` → `loop_polar_cap_tap` | `ejecta_sweeping` → `loop_ejecta_knot_sweeper` |

- **Structures (QR):** as *Voltages and controllers*: the rubric, the block list, `var` in loops, a package-local shell helper, appearance and overlay. A structure that fails the rubric is redesigned in the package, never baselined.
- **Prohibited, always:** as UIV's (`pack/index.toml`, `pack/pack.toml`, `hidden_until.json`, `lib/**`, `AGENTS.md`, `docs/STATUS.md`, `DECISIONS.md`, `CREDITS.md`, every `.snbt`, `script_order.json`), and any older file or table the contract does not list.
- **Older rows:** placed per DECISIONS.md:508 (the machine's table or inline array first; a companion table second; the package's own file only for GTM types and generated rows, such as the hot strip mill). One package owns a table per wave (*Parallel and serial*). A row adds a recipe and never edits an existing one. Each row is written with the second ingredient or byproduct that *Process honesty (QR)* gives it.
- **Circuits:** the table below was read on 2026-10-28. The worker re-reads every row of the type before writing; if a number has been taken since, it takes the next free one and records it in the handoff.
- **Ids:** exactly as in this file. A new cross-package id, or a changed one, is an escalation.
- **Bootstrap:** every controller, travel item and gate input is checked against the *Bootstrap check* table (Risks). An input that arrives only in a later substage is an escalation, never a quiet change.
- **Invariants, always:**
  - no UXV recipe takes an OpV-only input (`gtceu:opv_machine_casing` is only researched) or anything in *Reserve for OpV* except as listed there;
  - no Earth, Mercury or Cygnus recipe takes a Vela or Cas A product before its substage;
  - Ti-44, Fm-257 and W-184 only from the calutron; Es-254 and Cm-248 only as built (UHV transuranium, IV hot cell c8); elements 121 and 122 and census III only from the cyclotron, the recoil separator and the chem lab;
  - the Mk6, its DEC rows, the BZ dynamo and the polar cap tap are written final, not in `power/generators.js`'s list;
  - no recipe EU/t above 2^31; only B6's c10 row reaches it (S0-2);
  - the pump's sodium is ordinary sodium and the MgO comes from magnesite (never Mk6 ash);
  - UIV's invariants hold.
- **Controllers, parts and casings:** as *Voltages and controllers* (QR ladder).
  - Every controller is an assembly line with station research, an era fluid and three domain inputs.
  - The hull, hatches and components are assembly lines; `uxv_fusion_casing` is an assembler with `he_6n`.
  - No crafting-table recipe, except save-compat 1:1 or unpacking.
  - Only the Mk6 and M2 take the UXV hull.
- **Tests:** T0 is `tools\Check-Fast.ps1`. T1 is the one native test the contract names, run once in its band on the Linux VM first (`docs/testing/`), client legs one per run.
- **Repairs and agent:** at most 2 repairs, then escalate with the triage output, the suspected `path:line` and the attempts. The implementer (Sonnet) runs each package; `mechanical` (Haiku) may take A2's rows; Opus only for a cross-system contradiction.
- **Proof reuse:** UIV proved, and no UXV T1 re-proves:
  - the UEV builders with a second tier (UIV-S0-1);
  - `registerFusionTier(11)` with long storage and starts (UIV-A9, run 20261028-192609-server);
  - wireless case 11 long caps (UIV-S0-5, W);
  - the x16,384 hatch (UIV-M1, run 20261028-151927-server-b3b);
  - relay platforms, teleport and chunk loading (UIV-S0-2, -4, B1);
  - tier 11 datapack places (UIV-S0-3);
  - KubeJS cable at V[UIV] (UIV-S0-7);
  - `.dimension` rows.

  A plain recipe multiblock through `lib/patterns.js` needs only the recipe lookup check.

**Circuits by type** (in use as read; UXV numbers by package):

| Type (where its rows live) | In use | UXV |
|---|---|---|
| Calutron (`tables/isotopes.json`) | 1-9, 20-26 | A1 10, 13; B5 14 |
| Cyclotron, recoil separator, chem lab (`tables/superheavy.json`) | 1-7, 20-25 | A1 8-9 (cyclotron, recoil separator), 8-10 (chem lab) |
| Transuranium (`tables/transcurium.json`) | 0-6 | A1 7-9 |
| Actinide partitioning, waste retrieval (`zpm/actinides.js:58`, `:85`) | 1-5 | A1 6 each |
| Electron beam furnace (`tables/electron_beam.json`) | 0-7, 23, 25, 26 | A3 8-21, 27-29 |
| Nitride magnet works, CVI (`tables/composites.json`) | 0-6 | W 7; A3 8-16 |
| Crystal growth (`tables/crystals.json`) | 0-9, 24 | A3 10-17 |
| Megabar (`tables/megabar.json`) | 0-3 | A3 4 |
| Levitation melter (`tables/levitation_melter.json`) | 1-5 | A3 6-10 |
| Foundry (`tables/photonics.json`) | 0-13 | A3 14-19 |
| MOCVD (`uv/photonics.js:143`) | 1-11 | A3 12-15 |
| Ion implanter (`zpm/qubits.js:47`) | 1-4, 6, 7 | A3 8-10 |
| Photonic hall (`tables/photonics_uev.json`) | 0-6 | A5 7 |
| Extraction cascade (`ev/extraction_cascade.js:92`) | 1-2, 5-13 | A2 14-21; B5 22 |
| Platinum plant (`ev/platinum_plant.js:598`) | 1-4, 7-9 | A2 10-13 |
| Powder bed (`tables/am_powders.json`) | 1-7 | A2 8-16 |
| Zone refining (`uv/detectors.js:56`) | 1-3, 6, 7 | A2 8-9 |
| Eu reductor (`zpm/europium.js:105`) | 1-9 | A2 10-11 |
| Cryogenic plant, fluorspar kiln | none (rows keyed by input) | A2: distinct inputs |
| Hot strip mill (generated, `ev/combined_cycle_and_hot_mill.js:464`) | own file | A2, A3, A8: first free in their own files |
| Cold (`uv/cold.js:55`) | 1-5 | A6 6 |
| Fuel fabrication (`iv/uranium_cycle.js:44`) | 1-3, 9 | A6 10 |
| Synchrotron (`tables/accelerators.json`) | 0-4, 7 | A6 8 |
| Quench caster, DEC (`zpm/fusion.js:97`, `:149-170`) | 1-2 | A7 3-6; DEC rows keyed by plasma |
| Magnet works (`tables/magnet_works.json`) | 1-7 | A8 8, 10; B3 9 |
| HTS magnet works (`luv/hts_magnet_works.js:32`) | 1-5 | A8 6 |
| Coated conductor line (`luv/coated_conductor_line.js:32`) | 1-3 | A8 4 |
| Tether works (`uhv/elevator.js:106`) | 1-6, 16 | B1 7 |
| Warp gate (`tables/gate.json`) | 1-2, UIV-B5's c7 | B1 8-9; B6 10 |
| EHT (`uv/edge.js:46`), syngas (`hv/syngas_plant.js:82`) | 1; 0-6 | B2 2; B2 7 |
| DSN (`zpm/observatory.js:30`), GW detector (`luv/ganymede.js:48`) | 1-3; 1-2 | B4 4; B4 3 |
| Hot cell (`tables/hot_cell.json`) | 1-12 | B5 13-14 |
| UIV machines (probe bay, cage, decompressor, profiler, Matrioshka) | read at package start | next free (B1, B4, B5, B6) |

### Spikes (S0): disposable, before any permanent id

As UIV's (uiv.md:1020-1026): bench overlay and the S0 row of `zones.json` only, nothing in `pack/`. One question each, pass or fail with a run id. A fail changes the named contract before it opens. The S0 worker writes `docs/research/uxv-s0.md`.

| Spike | Question | If it fails | Changes |
|---|---|---|---|
| **S0-1** | With `highTierContent` off, UEV's builders widened to `.tiers(UEV, GTValues.UIV, GTValues.UXV)` (`uev/foundation.js:180`, `:193`) register `gtceu:uxv_machine_hull`, `gtceu:uxv_energy_input_hatch`, `gtceu:uxv_energy_output_hatch` and their `_16a` pair, with tier-named labels. The UEV and UIV ids, labels and recipes are unchanged; the UXV ones form in one of our multiblocks and in GTM's assembly line; the 16 A buffer is a long. The dump also covers `gtceu:opv_machine_casing`, `gtnn:spintronic_mainframe` and its GT-- recipe id, the GT-- and extendedfeatures UXV-tier items, and GTM's cobalt, manganese, gallium, dysprosium, yttrium, scandium, gadolinium, terbium, ruthenium, iridium, tantalum, tungsten, curium, einsteinium and fermium. | `highTierContent` ON with mass hiding (orchestrator decision; S0-1 records the id count). Every missing material is registered as `gtceu:` in F1 | F1, every package |
| **S0-2** | A KubeJS recipe at 2,147,483,648 EU/t (a long) on GTM's warp gate type runs on two UXV 16 A input hatches fed by wireless case 12 for 1,200 t, and the EMI and Jade read-outs do not overflow | 15 A = 2,013,265,920 EU/t, duration scaled to the same EU *(tune)* | B6 |
| **S0-3** | A datapack adds two GCYR solar systems at tier 12 (Vela pulsar orbit with a pulsar sky; Cassiopeia A remnant with a nebula sky) and keeps every older id, `cygnus_x1_orbit` included. No rocket offers them. | tier 11, as Cygnus | B1, B4, B5 |
| **S0-4** | `registerFusionTier(GTValues.UXV, ...)` from KubeJS registers a third ring beside the Mk4 and Mk5, with our pattern and casing, that forms with 16 UXV energy hatches, stores 10,240,000,000 EU (long) and starts a recipe at 10 G. A dump of every `fusion_reactor` row shows the four Mk6 fuels collide with nothing; `direct_conversion` takes four more rows | every start under 2^31 *(tune)*; else a KubeJS multiblock with the `fusion_reactor` type (uiv.md's Mk5 fallback) | F1, A7 |
| **S0-5** | `gtnn:spintronic_mainframe` is in `#gtceu:circuits/uxv` and GT--'s lower spintronic circuits in theirs; GT--'s recipe id for it is known | F2 adds the tag in a data file | F2, A5 |
| **S0-6** | A tier 12 `ParallelHatchPartMachine` (`gtceu:uxv_parallel_hatch`) from `lib/parallel_hatch.js` reports 65,536 and forms in the stellar forge and one UXV machine; parallels x EU/t stays a long and the hatches still bound it | the hatch stays x16,384 and M1 is dropped | M1, M2 |
| **S0-7** | `withTiers` case 12 caps (2,684,354,560 to 85,899,345,920 EU) and a 4,026,531,840,000 EU cell are stored and reported as long; the table accepts `grindless:pasta_strand_repeater` as a link | each figure capped at the largest safe value, recorded; the gate's 16 A still fits | W |
| **S0-8** | A KubeJS material `gtceu:pasta_strand` with cable properties at V[UXV], 4 A, zero loss makes `gtceu:pasta_strand_single_wire` and its cable (as `uev/foundation.js:165`) | a superconductor flag; else the hull takes UIV metallic hydrogen cable x4 and the strand is an item | F1, B4 |
| **S0-9** | The atmosphere, temperature and gravity GCYR loads for the two new places | figures recorded; site rules stay "no combustion, sealed machines" | B1, B4, B5 |
| **S0-10** | A `launched_relay_seed` thrown through a warp gate row places a relay platform (pre-formed far ring, wireless hatch pair, AE2 seed) in an unvisited dimension, for two more rows of `tables/relay_platforms.json`; the platform's chunks stay loaded with nobody there | a one-way arrival kit, as UIV-S0-2's fallback | B1 |

Order: S0-1 first (it fixes F1's list); S0-3, S0-9 and S0-10 (they fix B1); then S0-2, S0-4, S0-5, S0-7 and S0-8; S0-6 any time (UIV-M1 is merged).

### Foundation (serial)

#### F1. Registrations

- **Objective:** every UXV material, item and shared block that more than one package uses exists, with names and textures and no recipe; the UXV hull and hatches exist on UEV's builders.
- **`<name>`:** `foundation`.
- **What:**
  - the UXV tier: `gtceu:uxv_machine_hull`, `gtceu:uxv_energy_input_hatch`, `gtceu:uxv_energy_output_hatch`, `gtceu:uxv_energy_input_hatch_16a`, `gtceu:uxv_energy_output_hatch_16a` (S0-1). Their recipes are B4's (lasagna plate, strand cable);
  - components `grindless:uxv_electric_motor`, `uxv_electric_pump`, `uxv_conveyor_module`, `uxv_electric_piston`, `uxv_robot_arm`, `uxv_sensor`, `uxv_emitter`, `uxv_field_generator` (Monifactory `Post_UV_Components.js` pattern, LGPL, credited). Each recipe goes in its maker's own server file, so no table is shared: sensor A6; motor, pump, piston, conveyor, arm A8; field generator B3; emitter B5;
  - blocks: `grindless:uxv_fusion_casing` (S0-4);
  - materials (`gtceu:`): `pasta_strand` with cable properties (S0-8); `titanium_44`, `fermium_257`, `einsteinium_254`, `curium_248`, `tungsten_184` (with a wire form), `oxygen_16` (fluid; `gtceu:carbon_12` is UIV's, `uiv/foundation.js:97`); CoFeB, Co₂MnSi, Terfenol-D, Ni₂MnGa, DyScO₃, SrRuO₃, La-BFO, GGG, YIG, hBN, WTe₂, Fe₃GeTe₂; and every material S0-1's dump shows missing;
  - fluids (`grindless:`): `stellar_plasma`, `disk_plasma`, `filtered_disk_plasma`, `flux_loaded_plasma`, the four cuts (`stellar_hydrogen_cut`, `stellar_helium_cut`, `stellar_cno_cut`, `stellar_heavy_cut`), `triple_alpha_fuel`, `carbon_burning_fuel`, `oxygen_burning_fuel`, the four ash plasmas (`cno_ash_plasma`, `helium_burning_ash_plasma`, `carbon_burning_ash_plasma`, `oxygen_burning_ash_plasma`), `lpe_flux`, `he_6n`, `mnt_product_gas`, `finemet_melt`. They are here because older files (`zpm/fusion.js`, `ev/cryogenic_plant.js`) read them;
  - items made by one package and used by another:
    - spintronics: `cofeb_target`, `mgo_target`, `heusler_target`, `saf_target_set`, `ta_seed_target`, `srruo3_target`, `la_bfo_target`, `cofeb_ingot`, `heusler_ingot`, `terfenol_d_ingot`, `ni_mn_ga_ingot`, `ta_foil`, `pt_sheet`, `dysco3_substrate`, `ggg_wafer`, `hbn_crystal`, `wte2_crystal`, `fgt_crystal`, `mtj_stack_wafer`, `mram_stack_wafer`, `saf_track_wafer`, `mtj_die`, `mram_wafer`, `srruo3_electrode_wafer`, `me_switch_wafer`, `sot_readout_stack`, `meso_logic_die`, `racetrack_chip`, `magnonic_bus`, `sin_membrane`, `nanoaperture_array`, `rf_carpet_board`, `kr_f2_premix`, `krf_excimer_laser`, `pt_lpe_crucible`, `gas_stopping_cell`, `shequid_gyro`, `nv_diamond_chip` if S0-1 shows it missing;
    - lines 44-49: `stno_stack_wafer`, `stno_array`, `gum_metal_billet` (A2 → A8), `gum_metal_blank`, `gum_metal_flexspline`, `uxv_strain_wave_gear`, `encoder_ring`, `multipole_encoder_ring` (QR), `tmr_encoder`, `ga2o3_wafer`, `ga2o3_power_die`, `mu_metal_foil`, `shielded_interposer`, `finemet_ribbon` (A7 → B4), `finemet_toroid` (B4 → A3), `finemet_core` (A3 → B4), `uxv_voltage_coil` (the KrF laser reuses `grindless:vuv_caf2_optic`; no new window id);
    - superheavy: `fm257_target`, `es254_target`, `cm248_target`, `element_121_recoil`, `element_122_recoil`, `superheavy_census_iii`, `spent_actinide_target` (every spent Fm, Es and Cm target: A1's cyclotron rows and A6's collider make it, A1's waste retrieval row takes it), `u238_ion_source`, `u238_beam_charge`, `island_nuclide`, `island_chart`;
    - parts: `tetrataenite_lamination`, `tetrataenite_rotor`, `strand_stator`, `strand_tape`, `alip_duct`, `w184_cvi_preform`, `terfenol_d_rod`, `ni_mn_ga_crystal`, `cnt_bumper_weave`, `cnt_whipple_shield`, `frc_cartridge`, `gamma_laser_module`, `positron_stack`, `ti44_core`, `si28_ash`;
    - far products: `raw_pasta`, `spaghetti_phase`, `lasagna_phase`, `gnocchi_fragment`, `anti_phase_residue`, `cage_part`, `lasagna_plate`, `pasta_core_sample`, `polar_cap_electrode`, `ejecta_knot_dust`, the four condensates;
    - data and charts: `vela_glitch_timing`, `vela_glitch_record`, `cygnus_vlbi_record`, `elevator_log`, `ti44_map`, `arm_chart`, `bulge_chart`; the link `grindless:pasta_strand_repeater`;
  - not here: `grindless:uxv_smes_cell` (W's `wireless_energy.json` row registers it, `lv/wireless_energy.js:149`), and each machine's own-only intermediates (its package).
- **Allowed (extra):**
  - `startup_scripts/grindless/uxv/foundation.js`, `client_scripts/grindless/uxv_foundation_lang.js`, `tools/assets/Build-UXVFoundationTextures.ps1` and outputs;
  - `startup_scripts/grindless/uev/foundation.js`: two lines, `:180` and `:193` → `.tiers(UEV, GTValues.UIV, GTValues.UXV)`, and the label ternaries beside them; the header comment at `:171`;
  - pinned tests: `tools/analysis/test/uiv-foundation.test.mjs` and the UEV foundation test, if they pin the tier list.
- **References:** *Mods and integration*; `uev/foundation.js:165` (cable), `:172` (registry), `:178-180` (hatch helper), `:192-193` (hull); `startup_scripts/grindless/uiv/foundation.js:1-30` (header pattern); `uiv/uiv_components.js` (component pattern); Monifactory's `Post_UV_Components.js`.
- **Depends on:** S0-1, S0-4 (casing), S0-8 (cable); UIV shipped (v0.13.0).
- **Invariants:**
  - no machine, no recipe;
  - the UEV and UIV hulls and hatches keep their ids, labels and recipes;
  - ids exactly as here.
- **Acceptance:**
  - every id registered once, with `en_us` and `es_es`;
  - `emi-coverage.mjs` lists each as expected-unobtained until its package;
  - the UXV hull and hatches appear in EMI with a UXV label.
- **Tests:** T0; `tools/analysis/test/uxv-foundation.test.mjs`. T1: none (S0-1 is the proof).
- **Commits:** 2 (registrations; textures).
- **Serial:** alone; every package depends on it.

#### F2. Integrator step

- **Objective:**
  - `hidden_until.json`: `gtnn:spintronic_mainframe` from `never` to `uxv`; `gtceu:opv_machine_casing` stays hidden until `opv`;
  - F1's ids are class B until `uxv` in `tools/analysis/tiers/obtain.json`, one rule per producing package, named for it (each package deletes its own);
  - cuts by output (*Only from there and cuts*): GT--'s recipe for `gtnn:spintronic_mainframe`, the GT-- and extendedfeatures UXV-tier items a UXV part replaces (S0-1 list), the generic wiremill and extruder rows for `pasta_strand`;
  - the `#gtceu:circuits/uxv` tag if S0-5 failed;
  - `script_order.json`: a band for `uxv/` and one for each older file in *Older machines* that gets a row reading a UXV id;
  - the QR gates learn tier 12 (*Decisions proposed*): `uxv` 12 in `TIER_NAMES` and `TIER_PREFIX` (`tools/analysis/lib/recipe_quality.mjs`), `eraTier` `uxv: 12` and `complexFloor` `"12": 9.5` in `tools/analysis/recipe_quality.json`, `uxv` in process_audit's `ERAS` and `TIER_ERA`.
- **Allowed:** `hidden_until.json`, `tools/analysis/tiers/obtain.json`, `script_order.json`, `server_scripts/grindless/uxv/cuts.js` (new), the three gate files named above (tier entries only), and a tag file only after a failed S0-5.
- **References:** *Only from there and cuts*; *Save compatibility*; UIV's F2 (uiv.md:1092-1105); DECISIONS.md:528.
- **Acceptance:** the mainframe appears at `uxv`, in the same release as A5's row; no lib change.
- **Tests:** T0. T1: none.
- **Commits:** 1. The integrator runs it; it may overlap W.

#### W. UXV wireless tier (standalone serial)

- **Objective:**
  - `withTiers` case 12 after case 11 (`lv/wireless_energy.js:304`), with the four caps of *Power* as long;
  - the UXV row in `tables/wireless_energy.json` after the UIV row (`:47`), link `grindless:pasta_strand_repeater` (F1 id, made by B4), cell `grindless:uxv_smes_cell`, capacity 4,026,531,840,000 *(tune)*, `referenceCount` 1,536 *(tune)*;
  - the cell's row in `tables/composites.json` (nitride magnet works, circuit 7; the UIV cell row at `:15-17` is the pattern): 4 `uiv_smes_cell`, 16 `strand_tape`, 2 `lasagna_plate`, charge 1,000 mB isotopically pure He-II (A6's cold row) *(tune)*.
- **`<name>`:** `wireless`.
- **Allowed (extra):** `lv/wireless_energy.js` (case 12 only); `tables/wireless_energy.json` (1 row); `tables/composites.json` (1 row); pinned tests `uiv-wireless.test.mjs`, `uev-wireless.test.mjs`, `wireless_network.test.mjs`, `uev-composites.test.mjs`, `uiv-uiv_components.test.mjs` (row and tier counts only).
- **References:** *Power*; UIV's W (uiv.md:1107-1126); DECISIONS.md:501; S0-7.
- **Depends on:** F1, S0-7.
- **Invariants:** every cap and the cell are long; tiers below 12 are untouched.
- **Acceptance:** UXV wireless hatches register; the cell stores and reports 4,026,531,840,000 EU; a 16 A UXV draw (2,147,483,648 EU/t) is served for 60 s, or 15 A if S0-2 failed.
- **Tests:** T0; T1: `gg_test_uxv_wireless`, band assigned by integrator. Doubt: a draw at 2^31 EU/t and a cell above 2^41 held as long through the loader, the hatch and the network sum.
- **Commits:** 1.
- **Serial:** alone among workers (shared mechanism). It opens the `composites.json` sequence.

#### M1. UXV parallel hatch (standalone serial)

- **Objective:** `gtceu:uxv_parallel_hatch`, x65,536 = 4^(12-4) (ParallelHatchPartMachine.java:37), from the one create in `lib/parallel_hatch.js` (`.tiers(9, 10, 11, 12)` at `:81`, the name ternary at `:85`, the list at `:103`), usable through `global.grindless.parallelHatch.part()`.
- **`<name>`:** `parallel_hatch`.
- **Allowed (extra):** `lib/parallel_hatch.js` (the three places named); its recipe in `server_scripts/grindless/uxv/parallel_hatch.js` (UXV hull, 4 spintronic mainframes, UXV field generator and emitter *(tune)*, by `server_scripts/grindless/uiv/parallel_hatch.js:17`), an assembly line researched with `gtceu:uiv_parallel_hatch`, with 1,000 mB `filtered_disk_plasma`; pinned tests that list the hatches.
- **References:** *Nothing one at a time*; mega.md 4.12; UIV-M1 (uiv.md:1128-1146; DECISIONS.md:530); S0-6.
- **Depends on:** F1, S0-6.
- **Invariants:** the UV to UIV hatches untouched; not counted.
- **Acceptance:** reports 65,536; forms in the stellar forge and in one UXV machine. Reachable after B4 and B5 (hull, emitter); C1 checks.
- **Tests:** T0; T1: `gg_test_uxv_parallel_hatch`, band assigned by integrator. Doubt: tier 12 with `highTierContent` off, and 65,536 copies still bound by energy as a long.
- **Commits:** 1.
- **Serial:** alone (lib). If S0-6 failed, M1 is dropped.

### Wave A: home (Earth)

Two at a time, in the pairs of *Parallel and serial*. A row whose input is made by a later package reads that input's F1 id, and C1 checks reachability. Wave A is reachable at `uxv`, except A7 and A8, which wait for Vela products (`uxv-vela`); they are written in Wave A because their tables are free then.

#### A1. Superheavies III (rows only)

- **Objective:** lines 19-23. The calutron takes Fm-257 and W-184 out; Es-254 (UHV transuranium HDEHP, UIV-B2) and Cm-248 (IV hot cell c8 decay store) are as built and only plated here; elements 121 and 122 and census III come from the cyclotron, the recoil separator and the chem lab; the three targets are plated and sintered; spent targets are recovered. No new machine.
- **`<name>`:** `superheavy`.
- **Allowed (extra):**
  - `tables/isotopes.json`: calutron c10 (Fm-257) and c13 (W-184); c11-12 stay free; c14 is reserved for B5;
  - `tables/superheavy.json`: cyclotron c8-9 (Ti-50 on `es254_target`, on `fm257_target`), recoil separator c8-9, chem lab c8-10 (121 catch, 122 catch, census III). The Ti-50 charge is the one UIV-A1's rows use;
  - `tables/transcurium.json`: c7-9 (molecular plating of Fm, Es, Cm on Ti, from UIV-B2's Fm and Es and `gtceu:curium_248_dust`);
  - `zpm/actinides.js`: actinide partitioning array at `:85` c6 (`grindless:mnt_product_gas` → Pb, Hg, Pt); waste retrieval array at `:58` c6 (`spent_actinide_target` → stock);
  - sintering in `server_scripts/grindless/uxv/superheavy.js` (GTM type, first free circuit);
  - pinned tests: `uev-isotopes`, `uiv-isotopes`, `uev-superheavy`, `uhv-transcurium`, `uhv-betavoltaics`, `uhv-antimatter`, `zpm-actinides` (`.test.mjs`).
- **References:** lines 19-23; *Older machines* (calutron, cyclotron, recoil separator, chem lab, transuranium, actinide partitioning, waste retrieval); `uev/isotopes.js:21`; `uev/superheavy.js:21`; `uhv/transcurium.js:25`; DECISIONS.md:504 (census II, Fm to stock).
- **Depends on:** F1; UIV-B2 (line 32's debris and the HDEHP Es/Fm split, as merged).
- **Invariants:**
  - Fm-257 and W-184 only from the calutron; Es-254 and Cm-248 never get a second route; census III only from the chem lab;
  - Fm-255, Es-253, Cm-244 and Cm-246 go to stock, never voided;
  - the island nuclide is A6's.
- **Acceptance:** `fm257_target`, `es254_target`, `cm248_target`, both recoils and `superheavy_census_iii` are obtainable at `uxv` in EMI; `gtceu:tungsten_184` is obtainable for A3 and A7.
- **Tests:** T0. T1: none (rows on proven types; C1 checks reachability).
- **Commits:** 2 (tables; own file and lang).
- **Serial:** owns `isotopes.json`, `superheavy.json`, `transcurium.json` and `zpm/actinides.js` in Wave A (B5 follows on `isotopes.json`). Pair: A2.

#### A2. Spintronic feedstock (rows on EV to UV plants)

- **Objective:** the plant-side steps of lines 1-5, 9-11, 13-14, 16-17, 26-29 (fuel prep), 36, 38, 41, 42, 43 and 45 (gum metal sinter), and the bonded targets.
- **`<name>`:** `spin_feed`.
- **Allowed (extra):**
  - `ev/extraction_cascade.js` (array at `:92`) c14-21: cobaltite → Co; magnesite → MgCl₂ brine → Mg(OH)₂; CaCl₂ liquor recycle; Sc₂O₃; W charge for the WTe₂ ampoule; scheelite → WO₃; Bi fume → Bi; LPE dross → Pb;
  - `ev/platinum_plant.js` (`:598`) c10-13: 5N Pt, 5N Ru, 5N Ir, etch and redeposit recovery;
  - `iv/fluorspar_kiln.js` (`:83`), six rows keyed by input: 5N MgO, DyScO₃, SrRuO₃, La-BFO, GGG oxide, HF → F₂;
  - `zpm/europium.js` (`:105`) c10-11: Dy₂O₃; Dy₂O₃ + La → Dy (the c6 Tb pattern; Y₂O₃ and La₂O₃ are the cascade's c11, as built);
  - `tables/am_powders.json` c8-16: CoFeB atomise, Heusler atomise, HIP blank, MgO press and sinter, SAF set, SrRuO₃ target, La-BFO target, spent re-press; c16 Ti-Nb-Ta-Zr-O blend (from `six_n_niobium`, as built) → sintered `gum_metal_billet` (line 45);
  - `uv/detectors.js` (`:56`) c8-9: 7N Te, 7N Ge;
  - `ev/cryogenic_plant.js` (`:40`), four rows keyed by input: `stellar_helium_cut` → `triple_alpha_fuel`; `gtceu:oxygen_16` → `oxygen_burning_fuel`; air → Kr; He → `he_6n` (each with *Process honesty (QR)*'s second input and byproduct; `he_6n` is the Earth controllers' era fluid);
  - `server_scripts/grindless/uxv/spin_feed.js`: hot strip mill rows (5N Ta → `ta_foil`, 5N Pt → `pt_sheet`; first free circuits, the `ev/combined_cycle_and_hot_mill.js:464` pattern) and the seven bonded targets (`cofeb_target` to `la_bfo_target`) on GTM types;
  - pinned tests that read these files (as `git grep` shows on 2026-10-28): `uev-composites`, `uev-electron_beam`, `uhv-proxima_ground`, `uiv-levitation_melter`, `uv-photonics`, `zpm-europium`, `luv-a2-ids`, `platinum-asteroid`, `uev-barnard`, `uhv-crystals`, `uhv-photonics`, `uhv-zblan`, `uiv-mainframe`, `uiv-isotopes`, `uiv-uiv_components`, `uv-materials`, `uv-detectors`, `uev-alpha_centauri`, `uev-fusion`, `uev-superheavy`, `uhv-antimatter`, `uhv-swarm`, `uiv-metallic_hydrogen`, `uv-kuiper`, `uv-pluto-ices`.
- **References:** lines 1-5, 9-11, 13-14, 16-17, 27, 29, 38, 41-43; *Older machines*; DECISIONS.md:508.
- **Depends on:** F1.
- **Invariants:**
  - MgO from magnesite only;
  - CO₂ voided (inert), every other by-product to the destination its line names;
  - the knot-dust row is B5's (cascade c22).
- **Acceptance:** the seven targets, `ta_foil`, `pt_sheet`, `he_6n` and the two Mk6 fuels are obtainable in EMI (the fuels after B2 and A7).
- **Tests:** T0. T1: none (rows on proven types).
- **Agent:** `mechanical` may write the rows after the Sonnet implementer fixes the row shapes; judgement goes to Sonnet.
- **Commits:** 2-3 (EV-IV rows; ZPM-UV rows; own file).
- **Serial:** owns those seven files in Wave A (B5 follows on the cascade). Pair: A1.

#### A3. Spintronic rows (UHV to UIV shared tables)

- **Objective:** the shared-machine steps of lines 1, 3, 5-9, 11-18, 28, 36-38, 42-44, 46, 47 and 48 (melt and anneal).
- **`<name>`:** `spin_rows`.
- **Allowed (extra):**
  - `tables/electron_beam.json` c8-21 and c27-29 (c23, c25, c26 are in use):
    - 5N Co, Fe, Mn, Si, Ta, Ni, Ga;
    - Pt melt;
    - `nanoaperture_array` milling;
    - racetrack track writing;
    - YIG waveguides;
    - vdW edge contacts;
    - ME switch patterning;
    - C-12 vapour → `carbon_burning_fuel`;
    - c27 STNO pillar definition, c28 Ga₂O₃ gate patterning, c29 Ni-Fe-Mo → mu-metal ingot;
  - `tables/composites.json`, after W:
    - nitride magnet works c8-13: MTJ, MRAM and SAF anneals, Heusler homogenise, SOT anneal, Ni-Mn-Ga twin training;
    - CVI c14: W-184 fibre → `w184_cvi_preform`;
    - nitride magnet works c15 `mu_metal_foil` H₂ anneal, c16 `finemet_toroid` → `finemet_core` (field anneal);
  - `tables/crystals.json` c10-17: GGG and DyScO₃ Czochralski (Ir crucible), WTe₂ and FGT CVT, Ga₂O₃ EFG from an Ir die (`gallium_oxide_dust`), Terfenol-D rod, Ni-Mn-Ga crystal, recrystallise;
  - `tables/levitation_melter.json` c6-10: the four melts; c10 Fe-Si-B-Nb-Cu → `grindless:finemet_melt`;
  - `tables/megabar.json` c4: Ba-BN → `hbn_crystal` (raw; the leach is in the own file);
  - `tables/photonics.json` (foundry) c14-19: MESO integration → `meso_logic_die`, MRAM Cu back end, `rf_carpet_board`; c17 Au contacts → `stno_array`; c18 dicing and packaging → `ga2o3_power_die`; c19 shield can + `glass_interposer` → `shielded_interposer`;
  - `uv/photonics.js:143` (era array, a `UXV_ROWS` block in the same pattern) c12-15: SiN cap, `sin_membrane`; c14 STNO SiN planarisation; c15 Sn-doped Ga₂O₃ homoepitaxy;
  - `zpm/qubits.js:47` c8-10: MTJ and MRAM ion-beam etch; c10 STNO pillar milling;
  - `server_scripts/grindless/uxv/spin_rows.js`: slicing and polishing to `dysco3_substrate`, `ggg_wafer` and (010) `ga2o3_wafer`, the hBN leach, the WTe₂ and FGT anneals, the W-184 wire, the hot strip mill rows (mu-metal ingot → hot band → `mu_metal_foil`) and the drawn shield can (GTM types, first free circuits);
  - pinned tests for these tables: `uev-barnard`, `uev-electron_beam`, `uev-sirius`, `uiv-levitation_melter`, `uev-composites`, `uiv-uiv_components`, `uiv-wireless`, `uev-earth_orbit`, `uhv-crystals`, `uhv-photonics`, `uiv-mainframe`, `uiv-memories_cryostat`, `uev-megabar`, `uev-photonics`, `uhv-power_devices`, `uiv-beuv_stm`, `uiv-isotopes`, `uiv-tfln_femtosecond`, `zpm-qubits`, `uhv-betavoltaics`, `uv-detectors`, `uv-fusion`, `uv-photonics`.
- **References:** the lines above; *Older machines*; `uev/electron_beam.js:23`; `uev/composites.js:22`; `uhv/crystals.js:28`; `uhv/photonics.js:32`; `uv/photonics.js:133`, `:143`.
- **Depends on:** F1; W (on `composites.json`); A2 for the reachability of inputs; A4 for `stno_stack_wafer` (the c27 row reads its F1 id; C1 checks reachability).
- **Invariants:**
  - one row per step;
  - melt skulls, kerf and offcuts re-melted; the worn Ir die → EV platinum plant c5; STNO mill redeposit → levitation melter;
  - the Mk6 ash is never an input except C-12 (line 28).
- **Acceptance:** every listed output is obtainable at `uxv` in EMI (`carbon_burning_fuel` after A7); `stno_array`, `ga2o3_power_die` and `shielded_interposer` included.
- **Tests:** T0. T1: none (rows on proven types).
- **Commits:** 3 (UEV and UIV tables; UHV and UV tables; own file).
- **Serial:** owns those eight tables in Wave A. Pair: A4.

#### A4. Deposition (machines 1, 2; line 41)

- **Objective:** the MTJ sputter cluster and the oxide PLD chamber, and the KrF laser they share.
- **`<name>`:** `spin_deposition`.
- **What:**
  - machine 1 c1-c4 (`mtj_stack_wafer`, `mram_stack_wafer`, `saf_track_wafer`, `stno_stack_wafer`);
  - machine 2 c1-c3 (`srruo3_electrode_wafer`, `bfo_film_wafer`, `me_switch_wafer`'s CoFe layer), with `krf_excimer_laser` as catalyst;
  - line 41's `kr_f2_premix` (mixer), discharge tube with `grindless:vuv_caf2_optic` windows (as built, `uhv/crystals.js:16`), pulsed-power head and the laser itself (own file, GTM types).
- **Allowed (extra):** own files only.
- **References:** machines 1-2 (uxv.md:238-262); lines 6-8, 10-11, 41; `lib/patterns.js`; `uiv/beuv_stm.js` (a UIV plain multiblock, the pattern).
- **Depends on:** F1; A2 and A3 for inputs.
- **Invariants:**
  - the controllers as *Voltages and controllers* (UIV hull, 2 `gtnn:optical_mainframe`);
  - the laser is a catalyst, never consumed;
  - spent targets → A2's powder bed re-press.
- **Acceptance:** both machines form and run c1 at `uxv`.
- **QR:** controllers 1-2 as the controller table; structures as machines 1-2's specs; `krf_excimer_laser` in machine form or by assembly line; info pages `mtj_sputter_cluster`, `oxide_pld_chamber`; loops `loop_mtj_sputter_cluster`, `loop_oxide_pld_chamber`; the four gates as *Common*.
- **Tests:** T0. T1: `gg_test_uxv_spin_deposition`, band assigned by integrator. Doubt: the first 1 A x V[UXV] recipe runs on two UIV energy hatches (one tier up, WorkableElectricMultiblockMachine.java:250-273); every later UXV machine reuses this proof.
- **Commits:** 2.
- **Serial:** no shared table. Pair: A3.

#### A5. Logic (machines 3, 4, 5; line 42; the mainframe)

- **Objective:**
  - the vdW stacking cell (c1-c4), the racetrack fab (c1-c2) and the YIG LPE furnace (c1-c3);
  - line 42's `pt_lpe_crucible` (spun and welded from `pt_sheet`, own file);
  - the spintronic mainframe: one row in `tables/photonics_uev.json` (photonic hall c7): `meso_logic_die`, `racetrack_chip`, `mram_wafer`, `magnonic_bus`, `mtj_die` on a `shielded_interposer` *(tune)* → `gtnn:spintronic_mainframe`;
  - the `magnonic_bus` assembly takes A3's `stno_array` as its spin-wave source (line 17).
- **`<name>`:** `spin_logic`.
- **Allowed (extra):** `tables/photonics_uev.json` (1 row); pinned tests `uev-earth_orbit`, `uev-photonics`, `uhv-photonics`, `uiv-mainframe`.
- **References:** machines 3-5 (uxv.md:263-300); lines 4, 8, 12-17, 42; *Family steps*; `uev/photonics.js:25`; S0-5.
- **Depends on:** F1, F2 (mainframe unhidden, GT--'s recipe cut); A3, A4 for inputs.
- **Invariants:**
  - the crucible is a catalyst;
  - spent flux → A2's cascade Pb row;
  - the mainframe only from this row.
- **Acceptance:**
  - `gtnn:spintronic_mainframe` is obtainable at `uxv` and accepted by a GTM recipe that asks for `#gtceu:circuits/uxv`;
  - the package deletes F2's class B rule for the mainframe chain.
- **QR:** controllers 3-5 as the controller table; structures as machines 3-5's specs; `pt_lpe_crucible` in machine form; info pages `vdw_stacking_cell`, `racetrack_fab`, `yig_lpe_furnace`; loops `loop_vdw_stacking_cell`, `loop_racetrack_fab`, `loop_yig_lpe_furnace`; the four gates as *Common*.
- **Tests:** T0. T1: `gg_test_uxv_spin_logic`, band assigned by integrator. Doubt: our row's `gtnn:spintronic_mainframe` (plain, no NBT) satisfies `#gtceu:circuits/uxv` in an assembly-line recipe (S0-5 proved the tag on GT--'s own item).
- **Commits:** 2.
- **Serial:** owns `photonics_uev.json`. Pair: A6.

#### A6. Sensor and MNT (machines 6, 7; lines 18, 24, 43)

- **Objective:**
  - the SHeQUID works (c1 `weak_link_cell`, c2 `shequid_gyro`) and the `grindless:uxv_sensor` recipe (own file: gyro, `nv_diamond_chip`, `mtj_die`, UIV sensor *(tune)*);
  - the MNT collider (c1-c3, `gas_stopping_cell` as catalyst; c1 also returns `spent_actinide_target`);
  - line 43's stopping cell (own file).
- **`<name>`:** `shequid_mnt`.
- **Allowed (extra):**
  - `uv/cold.js` (`:55`) c6: He-II → isotopically pure He-II + He-3 concentrate;
  - `iv/uranium_cycle.js` (`:44`) c10: depleted UF₆ + oxygen → `u238_ion_source` (sintered UO₂);
  - `tables/accelerators.json` (synchrotron) c8: `u238_ion_source` + liquid helium → `u238_beam_charge` + helium;
  - pinned tests `uv-cold`, `uev-electron_beam`, `uiv-memories_cryostat`, `uiv-metallic_hydrogen`, `uev-isotopes`, `uhv-transcurium`, `uiv-uiv_components`, `uhv-antimatter`, `uiv-tfln_femtosecond`, `uv-accelerators`, `uv-validator`.
- **References:** machines 6-7 (uxv.md:301-326); lines 18, 24, 43; `uv/accelerators.js:34`; Monifactory's components pattern (CREDITS).
- **Depends on:** F1; A1 (`cm248_target`), A3 (`sin_membrane`, `rf_carpet_board`, `nanoaperture_array`), A4 (`mtj_die` comes from A4's stacks after A3's etch).
- **Invariants:**
  - the sensor uses no Vela or Cas A product (bootstrap);
  - He boil-off → UV cold;
  - MNT fragments leave as `mnt_product_gas` (A1's partitioning row).
- **Acceptance:** `uxv_sensor`, `island_nuclide` and `island_chart` are obtainable at `uxv`; controllers 7, 8 and 10-21 become craftable.
- **QR:**
  - controllers 6-7 as the controller table; structures as machines 6-7's specs;
  - `uxv_sensor` by assembly line, researched with `shequid_gyro`, with 1,000 mB `he_6n`;
  - `gas_stopping_cell` in machine form;
  - info pages `shequid_works`, `mnt_collider`, and "stock for OpV" pages for `island_nuclide` and `island_chart` if no UXV recipe consumes them;
  - loops `loop_shequid_works`, `loop_mnt_collider`; the four gates as *Common*.
- **Tests:** T0. T1: `gg_test_uxv_shequid_mnt`, band assigned by integrator. Doubt: the collider's chained circuits keep the `gas_stopping_cell` (catalyst) and consume the beam charge and the target in one run, returning the spent target.
- **Commits:** 2.
- **Serial:** owns `uv/cold.js`, `iv/uranium_cycle.js` and `accelerators.json` in Wave A. Pair: A5.

#### A7. Mk6 stellar burning ring (machine 9; lines 26-29, 38)

- **Objective:**
  - `gtceu:uxv_fusion_reactor` via `registerFusionTier(GTValues.UXV, ' (UXV)')` in `startup_scripts/grindless/uxv/fusion_mk6.js` (`uev/fusion.js:55`, UIV-A9's Mk5 file as merged), with `grindless:uxv_fusion_casing`;
  - `tables/fusion_mk6.json` c1-c4 (*Fusion*);
  - the casing chain of line 38: `w184_cvi_preform` → `wf_rhea_billet` (UIV) → casing (own file);
  - DEC rows in `zpm/fusion.js` (array at `:149-170`, keyed by plasma): the four ash plasmas → EU + ash;
  - quench caster c3-5 (`zpm/fusion.js:97`): He-burning ash → `gtceu:carbon_12` + `gtceu:oxygen_16`; C ash → Ne, Na, Mg; O ash → `si28_ash`, S, P;
  - quench caster c6 (same array; line 48, open question 13): A3's `finemet_melt` → 20 µm amorphous `finemet_ribbon` by planar flow casting; trim → re-melted.
- **`<name>`:** `fusion_mk6`.
- **Allowed (extra):** `zpm/fusion.js` (the two arrays); `tables/fusion_mk6.json` (new); pinned tests `zpm-fusion`, `uev-fusion` and UIV-A9's fusion test (tier list only).
- **References:** machine 9 (uxv.md:340-351); *Fusion*; lines 26-29, 38; DECISIONS.md:500; FusionReactorMachine.java :185, :276, :294-298, :326-327 as uiv.md cites; S0-4.
- **Depends on:** F1, S0-4, UIV-A9; A1 (W-184), A3 (CVI, c10 Finemet melt); reachable after A8, B3 and B4 (hull, motor, pump, field generator).
- **Invariants:**
  - written final, not in `power/generators.js`;
  - storage and starts are long;
  - the Mk4 and Mk5 are untouched;
  - c1 returns 95% of the CNO cut;
  - Si-28 to stock for OpV.
- **Acceptance:** the ring forms with 16 UXV energy hatches, stores 10,240,000,000 EU and runs c1-c4. DEC rows return EU and ash; the quench caster splits all three ashes.
- **QR:**
  - the Mk6 controller as the controller table (researched with the Mk5 controller, `stellar_hydrogen_cut`);
  - `uxv_fusion_casing` by assembler as *Forms of everything else*;
  - the structure as machine 9's spec: run `structure-quality.mjs --static` on the lib ring first; a casing share above 70% is an escalation (a lib change), never a baseline;
  - info page `uxv_fusion_reactor` (rows c1-c4, DEC rows, where each ash goes) and a "stock for OpV" page for `si28_ash`;
  - no loop (GTM's fusion type and sound); the four gates as *Common*.
- **Tests:** T0. T1: `gg_test_uxv_fusion_mk6`, band assigned by integrator. Doubt: our pattern and casing on the third ring hold 10.24 G and start c4 at 10 G as long, with four rows that collide with no older fuel (beyond S0-4's bare registration).
- **Commits:** 2.
- **Serial:** owns `zpm/fusion.js`. Pair: A8.

#### A8. UXV parts (lines 34-37, 45, 49; robot arm)

- **Objective:**
  - `uxv_electric_motor`, `uxv_electric_pump`, `uxv_electric_piston`, `uxv_conveyor_module` and `uxv_robot_arm` (the arm drives on `uxv_strain_wave_gear` with a `tmr_encoder`, the UIV-A8 strain-wave pattern, DECISIONS.md:539), in `server_scripts/grindless/uxv/uxv_parts.js` (assembly line, the Monifactory pattern);
  - line 45 after A2's `gum_metal_billet`: hot-forged `gum_metal_blank`, cold-swaged cup, hobbed and shot-peened `gum_metal_flexspline`, `uxv_strain_wave_gear`;
  - line 49: `gtceu:tetrataenite_ingot` → rolled `encoder_ring` → `multipole_encoder_ring` → `tmr_encoder` with an `mtj_die` bridge;
  - their older rows.
- **`<name>`:** `uxv_parts`.
- **Allowed (extra):**
  - `tables/magnet_works.json` c8: `tetrataenite_lamination` → `tetrataenite_rotor`; c10: `encoder_ring` → `multipole_encoder_ring` + 10% tetrataenite small dust (c9 is B3's);
  - `luv/hts_magnet_works.js` (`:32`) c6: strand wire + lamination → `strand_stator`;
  - `luv/coated_conductor_line.js` (`:32`) c4: strand wire → `strand_tape`;
  - in the own file: hot strip mill (`gtceu:tetrataenite_ingot` → `tetrataenite_lamination`; `lasagna_plate` → `alip_duct`; `gum_metal_billet` → `gum_metal_blank`; tetrataenite ingot → `encoder_ring`), the swage, hob and gear rows (GTM types), NaK (UHV's `sodium_potassium`, `uhv/mercury.js`, reused if its recipe exists; else a mixer row from ordinary Na and K);
  - pinned tests `zpm-magnet_works`, `hts_magnet_works`, `luv_a4_fixture`, `uev-wireless`, `uhv-wireless`, `uiv-metallic_hydrogen`, `uiv-uiv_components`, `uv-wireless`, `wireless_network`, `luv-cryogenics`, `luv-foundation`.
- **References:** lines 34-37, 45, 49; *Older machines*; `zpm/magnet_works.js:27`; `uiv/uiv_components.js:25-26` (UIV's `bmg_flexspline` and `strain_wave_gear`, the pattern); DECISIONS.md:539.
- **Depends on:** F1; A2 (gum metal sinter), A3 (melts, crystals), A4 (`mtj_die` after A3's etch); reachable after B4 (strand wire, lasagna).
- **Invariants:**
  - Na is ordinary sodium (never Mk6 ash);
  - scrap and offcuts re-melted;
  - no part takes the emitter or a Cas A product.
- **Acceptance:** the five parts, `uxv_strain_wave_gear` and `tmr_encoder` are obtainable at `uxv-vela` (the gear and encoder at `uxv`). C1 confirms the Mk6 controller then needs nothing from Cas A.
- **QR:**
  - each part by assembly line with station research (the matching UIV part), an era fluid from the controller table and two or more domain inputs;
  - `uxv_strain_wave_gear` and `tmr_encoder` in machine form (the GTM rows above);
  - no multiblock and no recipe type, so no info page or loop; the four gates as *Common*.
- **Tests:** T0. T1: none (assembly-line rows; the UIV components proof).
- **Commits:** 2.
- **Serial:** owns `magnet_works.json` in Wave A (B3 follows), `hts_magnet_works.js` and `coated_conductor_line.js`. Pair: A7.

### Wave B: the arm

B1 opens both places. B2 and B3 work at Cygnus X-1 orbit (UIV's platform) and can run beside B1. B4 and B5 need B1's places.

#### B1. The Kerr sling (two places; line 40)

- **Objective:**
  - the two places of *Places and site rules* as a datapack (S0-3's files: `data/gcyr/gcyr/planets/`, the solar systems and dimensions `grindless:vela_pulsar_orbit` and `grindless:cas_a_remnant`), with skies in `startup_scripts/grindless/uxv/travel.js` (UIV-B1's travel file is the pattern);
  - the arrival platforms;
  - the jump rows and the Whipple shield;
  - the substage grants `uxv-vela` and `uxv-cas-a` on arrival, as UIV-B1 grants its own.
- **`<name>`:** `kerr_sling`.
- **Allowed (extra):**
  - the datapack files S0-3 names;
  - `tables/gate.json` c8-9 (c8: `launched_relay_seed` + `frc_cartridge` → Vela; c9: `launched_relay_seed` + `cnt_whipple_shield` → Cas A; UIV-B1's jump rows are the pattern);
  - `tables/relay_platforms.json` (2 rows, the UIV-B1 kit);
  - `tables/sunlight.json` (2 rows, *Sunlight*);
  - `uhv/elevator.js` (`:106`) tether works c7: `cnt_densified_yarn` → `cnt_bumper_weave`;
  - the UIV-B4 probe bay's row list, 1 row at the next free circuit: `relay_seed` + 1 `gtceu:tungsten_steel_block` ballast → `launched_relay_seed` (the Kerr sling);
  - the Whipple shield assembly in the own file;
  - pinned tests `uev-gate`, `uhv-gate`, `uhv-elevator`, and UIV-B1's and UIV-B4's tests (row and platform counts only).
- **References:** *Places and site rules*; *Bridges and first arrivals*; Route 5; line 40; DECISIONS.md:498; `uhv/gate.js:28`; S0-3, S0-9, S0-10.
- **Depends on:** F1, S0-3, S0-9, S0-10; UIV-B1, UIV-B4. Reachable after B3 (`frc_cartridge`).
- **Invariants:**
  - no rocket offers either place; the dimension ids are final;
  - no platform holds a product of its place;
  - Cygnus X-1 orbit and UIV's rows are untouched.
- **Acceptance:** each jump places its platform once, keeps its chunks loaded with nobody there and grants its substage; both skies load.
- **QR:** `cnt_whipple_shield` in machine form or by assembly line (never crafting); no multiblock and no recipe type; the info pages of the two jump items name their place; the four gates as *Common*.
- **Tests:** T0. T1: `gg_test_uxv_kerr_sling` (server leg) and one client leg per run for one sky, band assigned by integrator. Doubt: two tier 12 places in the shipped datapack beside UIV's three, each jump placing its own platform row and granting its substage (S0-3 and S0-10 proved a bare place and a bare row).
- **Commits:** 3 (datapack and travel; rows; shield).
- **Serial:** owns `gate.json` in Wave B (B6 follows), `relay_platforms.json`, `sunlight.json` and `uhv/elevator.js`. Pair: B2.

#### B2. Cygnus X-1: the lift (machines 10-12; line 26)

- **Objective:**
  - the stellar elevator, the plasma mass filter (c1 stellar cuts; c2 disk plasma, which reads B3's F1 id) and the stellar condensation tower;
  - `elevator_log` (elevator by-product, *(tune)* per run);
  - the condensates' rows.
- **`<name>`:** `cygnus_lift`.
- **Allowed (extra):**
  - `hv/syngas_plant.js` (`:82`) c7: `volatile_condensate` → syngas;
  - `uv/edge.js` (`:46`) EHT c2: → `cygnus_vlbi_record`;
  - pinned tests `uev-barnard`, `uev-composites`, `uv-pluto-ices`, `uv-edge`.
- **References:** machines 10-12 (uxv.md:352-387); lines 26-27; *Places and site rules* (Cygnus X-1); UIV-B4's platform.
- **Depends on:** F1; A6 (`uxv_sensor` in controllers); UIV-B1, UIV-B4.
- **Invariants:**
  - `.dimension` Cygnus on 10, 11 c1 and 12;
  - He coolant returns to UV cold;
  - no Vela or Cas A product.
- **Acceptance:** the four cuts, the condensates, `elevator_log` and `cygnus_vlbi_record` are obtainable at `uxv`.
- **QR:**
  - controllers 10-12 as the controller table; structures as machines 10-12's specs;
  - elevator c2 as machine 10's QR note (data module + stellar plasma → `elevator_log`);
  - info pages `stellar_elevator`, `plasma_mass_filter`, `stellar_condensation_tower` (each names Cygnus X-1 orbit as the source of its matter);
  - loops `loop_stellar_elevator`, `loop_plasma_mass_filter`, `loop_stellar_condensation_tower`; the four gates as *Common*.
- **Tests:** T0. T1: `gg_test_uxv_cygnus_lift`, band assigned by integrator. Doubt: the stellar elevator runs at Cygnus X-1 orbit on wireless case 11 through two UIV hatches under its `.dimension` lock (the first UXV recipe on a far platform).
- **Commits:** 2.
- **Serial:** owns `hv/syngas_plant.js` and `uv/edge.js`. Pair: B1.

#### B3. Cygnus X-1: the disk (machines 13-15; lines 30, 31)

- **Objective:**
  - the accretion disk skimmer, the FRC former (c1 `frc_cartridge`, c2 `flux_loaded_plasma`) and the BZ dynamo (generator, 2^30 EU/t through two UIV 16 A dynamo hatches);
  - the `uxv_field_generator` recipe (own file).
- **`<name>`:** `cygnus_disk`.
- **Allowed (extra):** `tables/magnet_works.json` c9 (after A8): `strand_tape` + `frc_cartridge` → strand coil; pinned magnet works tests as A8.
- **References:** machines 13-15 (uxv.md:388-423); lines 30-31; *Power*; UIV `grindless:mh_winding` (`uiv_metallic_hydrogen`).
- **Depends on:** F1; B2 (filter c2); A6; A8 (`magnet_works.json` order). The field generator is reachable after B4 (strand).
- **Invariants:**
  - `.dimension` Cygnus on 13, 14 c1 and 15;
  - the cartridge never takes pasta (bootstrap);
  - the BZ dynamo is written final, not in `power/generators.js`.
- **Acceptance:** `frc_cartridge` is obtainable at `uxv`; the BZ dynamo feeds the network; the field generator is obtainable at `uxv-vela`.
- **QR:**
  - controllers 13-15 as the controller table; structures as machines 13-15's specs;
  - FRC c2 as machine 14's QR note (flux-loaded plasma + hydrogen);
  - `frc_cartridge` in machine form; `uxv_field_generator` by assembly line, researched with `frc_cartridge`, with `filtered_disk_plasma`;
  - info pages `accretion_disk_skimmer`, `frc_former`, `bz_dynamo` (the dynamo's page states its fuel and EU per run);
  - loops `loop_accretion_disk_skimmer`, `loop_frc_former`, `loop_bz_dynamo`; the four gates as *Common*.
- **Tests:** T0. T1: `gg_test_uxv_cygnus_disk`, band assigned by integrator. Doubt: a KubeJS generator multiblock emits 2^30 EU/t through two UIV 16 A dynamo hatches into wireless case 11, and the network sum stays long.
- **Commits:** 2.
- **Serial:** after A8 on `magnet_works.json`. Pair: B4.

#### B4. Vela: pasta (machines 16-20; lines 32, 33, 48; the hull)

- **Objective:**
  - the pasta extractor, the phase sorter (c1 phases, c2 `pasta_core_sample`), the draw bench (`gtceu:pasta_strand_single_wire`), the laminator (`lasagna_plate`) and the polar cap tap (generator, through one UIV 16 A dynamo hatch);
  - line 48's last steps: A7's `finemet_ribbon` → wound `finemet_toroid` → (A3's c16 field anneal) `finemet_core` + strand wire → `uxv_voltage_coil` (own file, GTM types);
  - in `server_scripts/grindless/uxv/foundation.js`: the recipes of `gtceu:uxv_machine_hull` (on GTM's `uxv_machine_casing`, UIV-B5) and the four UXV hatches, each taking `uxv_voltage_coil` and A3's `ga2o3_power_die` *(tune)*. All five are assembly lines with station research (the hull researched with `uxv_voltage_coil`, each hatch with the UXV hull) and 1,000 mB `filtered_disk_plasma`;
  - `pasta_strand_repeater` (own file).
- **`<name>`:** `vela_pasta`.
- **Allowed (extra):**
  - `zpm/observatory.js` (`:30`) DSN c4: → `vela_glitch_timing`;
  - `luv/ganymede.js` (`:48`) GW detector c3: `vela_glitch_timing` → `vela_glitch_record`;
  - the UIV-B2 neutronium cage's rows, 1 row: `neutronium_pellet` + 1 `mh_winding` (the cage's field coil) → `cage_part`;
  - the UIV-B2 r-process decompressor's rows, 1 row: `gnocchi_fragment` → several r-process elements, as the UIV row;
  - `server_scripts/grindless/uxv/foundation.js` (new);
  - pinned tests `zpm-observatory`, `luv-ganymede`, `luv-foundation`, `luv-travel`, `luv-validator`, `luv-worlds`, `luv_b1_fixture`, `zpm-validator`, and UIV-B2's tests.
- **References:** machines 16-20 (uxv.md:424-480); lines 32-33, 39, 48; *Mods and integration* (hull); uiv.md:1627 (`uxv_machine_casing`); S0-8.
- **Depends on:** F1, B1, A6; A3 (die, anneal), A7 (`finemet_ribbon`); UIV-B2, UIV-B5.
- **Invariants:**
  - pasta only at Vela (`.dimension` on 16-20);
  - anti-phases → `pasta_core_sample`;
  - the tap is written final;
  - the UEV and UIV hulls are untouched.
- **Acceptance:**
  - strand wire, `lasagna_plate`, `uxv_voltage_coil` and the core sample are obtainable at `uxv-vela`;
  - the UXV hull and hatches are craftable; W's link and cell become reachable.
- **QR:**
  - controllers 16-20 as the controller table; structures as machines 16-20's specs;
  - sorter c2 as machine 17's QR note;
  - `pasta_strand_repeater` and `uxv_voltage_coil` in machine form;
  - info pages `pasta_extractor`, `pasta_phase_sorter`, `pasta_draw_bench`, `pasta_laminator`, `polar_cap_tap` (Vela as the source; the tap's page states its EU per run);
  - loops `loop_pasta_extractor`, `loop_pasta_phase_sorter`, `loop_pasta_draw_bench`, `loop_pasta_laminator`, `loop_polar_cap_tap`; the four gates as *Common*.
- **Tests:** T0. T1: `gg_test_uxv_vela_pasta`, band assigned by integrator. Doubt: the shipped strand wire (S0-8 material) carries 4 A x V[UXV] from the tap's hatch to a UXV hatch with zero loss, and a hull from our recipe forms a UXV machine.
- **Commits:** 3.
- **Serial:** owns `zpm/observatory.js`, `luv/ganymede.js` and the UIV-B2 rows. Pair: B3.

#### B5. Cassiopeia A and the emitter (machines 21, 8; line 25)

- **Objective:**
  - the ejecta knot sweeper (Cas A) and the annihilation laser works (Earth; c1 Ps on solid Ne, c2 `gamma_laser_module`);
  - the `uxv_emitter` recipe (own file);
  - the Ti-44 rows.
- **`<name>`:** `cas_a`.
- **Allowed (extra):**
  - `tables/isotopes.json` c14: Ti fraction → `gtceu:titanium_44` (after A1);
  - `ev/extraction_cascade.js` c22: `ejecta_knot_dust` → Ti fraction + Si, S, Ca, Fe (after A2);
  - `tables/hot_cell.json` c13-14: Ti-44 + a `gtceu:tungsten_plate` capsule → `ti44_core`; spent core → Ca-44 + a tungsten small dust;
  - the UV antimatter trap row in `server_scripts/grindless/uxv/cas_a.js` (`.dimension` overworld, first free circuit, `uv/accelerators.js:146`'s type): slow positrons + 100 mB nitrogen buffer gas → `positron_stack`;
  - the UIV-B3 X-ray pulse profiler's rows, 1 row: knot dust → `ti44_map`;
  - pinned tests `uev-isotopes`, `uiv-isotopes`, the cascade tests as A2, `uev-superheavy`, `uhv-betavoltaics`, `uhv-transcurium`, `uv-fusion`, `zpm-qubits`, and UIV-B3's tests.
- **References:** machines 8 and 21 (uxv.md:327-339, :481-493); line 25; *Places and site rules* (Cas A); uiv.md:439 (the gamma laser cavity: B5 reads the id UIV-B3 ships, open question 11).
- **Depends on:** F1, B1, A1, A2, A6; UIV-B3.
- **Invariants:**
  - Ti-44 only from Cas A dust;
  - the sweeper's recipe stays at or under 4 A x V[UIV] (bootstrap: no case 12 before Vela);
  - inert ejecta voided; Ca-44 to stock.
- **Acceptance:** `ti44_core`, `gamma_laser_module`, `uxv_emitter` and `ti44_map` are obtainable at `uxv-cas-a`.
- **QR:**
  - controllers 21 and 8 as the controller table; structures as machines 21 and 8's specs;
  - `gamma_laser_module` in machine form; `uxv_emitter` by assembly line, researched with `gamma_laser_module`, with `stellar_hydrogen_cut`;
  - info pages `ejecta_knot_sweeper` (Cas A as the source; inert ejecta voided) and `annihilation_laser_works`; a "stock" page for Ca-44;
  - loops `loop_ejecta_knot_sweeper`, `loop_annihilation_laser_works`; the four gates as *Common*.
- **Tests:** T0. T1: `gg_test_uxv_cas_a`, band assigned by integrator. Doubt: the sweeper runs at Cas A on wireless case 11 within 4 A x V[UIV] under its `.dimension` lock, with no UXV hatch.
- **Commits:** 2.
- **Serial:** after A1 on `isotopes.json` and after A2 on the cascade; owns `hot_cell.json`. Pair: M2.

#### B6. Gate to OpV

- **Objective:**
  - `tables/gate.json` c10 (*Gate to OpV*);
  - the UIV-A10 Matrioshka row (next free circuit): the four records → `arm_chart`;
  - `server_scripts/grindless/uxv/gate.js`: `gtceu:opv_machine_casing` researched with `bulge_chart`, its assembly-line recipe (`uhv/gate.js:206-219`, uiv.md:1627) and the `opv` grant (`uhv/gate.js:294`).
- **`<name>`:** `gate`.
- **Allowed (extra):** `tables/gate.json` (1 row); the Matrioshka's row list (1 row); pinned tests `uev-gate`, `uhv-gate`, and UIV-A10's test.
- **References:** *Gate to OpV*; *Reserve for OpV*; `uhv/gate.js:90-97` (kept slots); S0-2.
- **Depends on:** W, A1-A8, B1-B5, S0-2.
- **Invariants:**
  - no OpV product or hull; the casing is only researched;
  - c10 is the only recipe at 2^31;
  - MAX and MAX+ untouched (DECISIONS.md:450).
- **Acceptance:** the gate holds 2^31 (or 15 A) for 1,200 t, consumes one cartridge, keeps the six, returns `bulge_chart` and grants `opv`; the OpV casing recipe appears only after research.
- **Tests:** T0. T1: `gg_test_uxv_gate`, band assigned by integrator. Doubt: the hold, from real sources (the BZ dynamo and two taps) over wireless case 12 through two UXV 16 A hatches, stays long end to end and then grants `opv` (S0-2 proved a bare row).
- **Commits:** 2.
- **Serial:** alone, after B1-B5.

### Scale and close

#### M2. Stellar fractionation hall (mega)

- **Objective:** `gtceu:stellar_fractionation_hall`, the UXV member of the mega family (*Nothing one at a time*):
  - it runs GTM's `gtceu:distillation_tower` and `gtceu:distillery`;
  - parallels are energy-bound times the parallel hatch, and it overclocks as the stellar forge (open question 6);
  - controller: UXV hull + UXV parts, an assembly line as the controller table (researched with `gtceu:stellar_condensation_tower`, `stellar_helium_cut`, `lasagna_plate`, `uxv_electric_pump`, `pt_sheet`);
  - **Structure (QR):** 13x25x13, two 5x5 fractionating columns rising 22 layers from a 13x3x13 reboiler plinth, joined by bridges every 6 layers; the hall reads as a twin-column refinery.
    - Blocks: `uxv_machine_casing` (appearance casing, about 50%), `laminated_glass` sight bands on each column every fourth layer, titanium pipe casing cores visible through the glass and in the bridges, `naquadah_alloy_frame` bridge railings, `superconducting_coil` reboiler ring in the plinth, and `computer_heat_vent` condenser crowns.
    - Functional kinds: glass, pipe, frame, coil, machine.
    - Hatches: item and fluid inputs, energy and the parallel hatch on the plinth's front face beside the controller; fluid output hatches on the columns' outer faces, as many as a tower recipe has outputs (a plain workable multiblock, not GTM's layered tower class).
    - Overlay `grindless:block/multiblock/stellar_fractionation_hall`.
- **`<name>`:** `stellar_fractionation_hall`.
- **Allowed (extra):** own files; its row in the mega table if mega.md 6.6 uses one; pinned mega tests (member count only).
- **References:** mega.md 4.1, 4.11, 4.12, 5, 6.6; DECISIONS.md:505; `lib/mega.js` (read unchanged).
- **Depends on:** M1, B4, A8.
- **Invariants:** no recipe of its own; counted as the mega member, not as a line.
- **Acceptance:** it forms with the x65,536 hatch and runs a GTM distillation recipe at the energy-bound parallels.
- **QR:** info page `stellar_fractionation_hall` (what it runs, the parallel rule, that it has no recipe of its own); no loop (GTM's types and sounds); the four gates as *Common*.
- **Tests:** T0. T1: `gg_test_uxv_stellar_fractionation_hall`, band assigned by integrator. Doubt: a tower recipe with many fluid outputs at x65,536 keeps output amounts long and fits the output hatches.
- **Commits:** 1.
- **Serial:** pair: B5.

#### C1. Validator

- **Objective:**
  - `-Tier uxv` with the rules of *Validator*;
  - re-count the lines' nodes (49 lines, 359 steps, average 7.33), the 178 crossings and the 46 older machines, by UIV's method;
  - the reachability of every F1 id at its substage;
  - the *Bootstrap check* table.
- **Allowed:** `tools/analysis/tiers/uxv.json` (new), `tools/analysis/test/uxv-validator.test.mjs`, and the validator's era list (one line).
- **Depends on:** every package. **Tests:** T0. **Commits:** 1.

#### C2. Quests

- **Objective:** *Quests*' 46 quests in `tools/quests/uxv-chapter/` and `pl-data-uxv.mjs`; the integrator generates the chapter.
- **Allowed:** those files and their test.
- **Depends on:** C1. **Tests:** T0 (quest lint). **Commits:** 1.

#### C3. Integration and release (integrator)

- **Objective:**
  - reopen a v0.13.0 save (*Save compatibility*);
  - T2 batch, then T3 (client legs one per run);
  - `hidden_until.json` final; STATUS, DECISIONS and CREDITS lines; index; v0.14.0.
- **Depends on:** C1, C2.

### Parallel and serial

Order: S0 (one worker) → F1 → F2 ∥ W → M1 → A1 ∥ A2 → A3 ∥ A4 → A5 ∥ A6 → A7 ∥ A8 → B1 ∥ B2 → B3 ∥ B4 → B5 ∥ M2 → B6 → C1 → C2 → C3. At most two workers; the bench is serial (Linux VM first). A pair starts only when the pair before it has merged.

| Shared file | Writers in order |
|---|---|
| `tables/composites.json` | W → A3 |
| `ev/extraction_cascade.js` | A2 → B5 |
| `tables/isotopes.json` | A1 → B5 |
| `tables/magnet_works.json` | A8 → B3 |
| `tables/gate.json` | B1 → B6 |
| `lib/parallel_hatch.js` | M1 alone |
| `zpm/fusion.js` A7; `zpm/actinides.js` A1; `tables/photonics.json`, `tables/electron_beam.json`, `tables/crystals.json`, `uv/photonics.js` A3; `tables/photonics_uev.json` A5 | one writer each |
| hot strip mill rows | each package's own file (A2, A3, A8) |

A3 ∥ A4 holds: A3's c27 row reads `stno_stack_wafer` by its F1 id and writes none of A4's files; C1 checks the reachability. A8 needs A2, A3 and A4 merged, which the order gives; B4 needs A3 (die, anneal) and A7 (ribbon), merged in Wave A.

## Decisions proposed

- 2026-10-28 UXV route: home spintronics, the SHeQUID sensor and superheavies III; Cygnus X-1 orbit for star lifting and disk skimming; the Kerr sling (UIV probe bay mode + warp gate c8/c9) to Vela (nuclear pasta) and Cassiopeia A (Ti-44); gate c10 at Cygnus returns `bulge_chart`. Substages `uxv`, `uxv-vela`, `uxv-cas-a`.
- 2026-10-28 UXV size: 21 multiblocks (growth goes to lines and crossings, DECISIONS.md:455, :497), 49 lines (359 steps, average 7.33 against UIV's 7.2, counted by UIV's method), 178 crossings with UEV and older (x1.78), 46 older machines. Rule 7's ~69 lines and ~30 machines are missed with no padding; every missing item is named under *Considered and dropped*.
- 2026-10-28 UXV hull and hatches: `highTierContent` stays off; UEV's builders take a third tier (`.tiers(UEV, GTValues.UIV, GTValues.UXV)`). The hull sits on GTM's `uxv_machine_casing` (UIV gate research) with `lasagna_plate` and strand cable and is held to `uxv-vela`.
- 2026-10-28 UXV circuit: `gtnn:spintronic_mainframe`, unhidden at `uxv`, made only by our UEV photonic hall row; GT--'s recipe cut.
- 2026-10-28 UXV Mk6: `registerFusionTier(12)`, the stellar burning ring (fiction), four fuels from a massive star's sequence (hot CNO, triple-alpha, carbon, oxygen burning); 10,240,000,000 EU storage; starts 6-10 G as long; DEC and quench caster rows.
- 2026-10-28 UXV wireless case 12: caps V[UXV] x amps x 10 as long; link `pasta_strand_repeater`; cell `uxv_smes_cell` 4,026,531,840,000 EU.
- 2026-10-28 UXV scale: `gtceu:uxv_parallel_hatch` x65,536 (lib, serial); the mega member is the stellar fractionation hall.
- 2026-10-28 UXV places: `grindless:vela_pulsar_orbit` and `grindless:cas_a_remnant`, GCYR tier 12 datapack places (fallback 11), no rocket; arrival platforms are rows of `relay_platforms.json`.
- 2026-10-28 UXV 2^31: only gate c10 runs at 2,147,483,648 EU/t (16 A x V[UXV]); fallback 15 A. No generator exceeds 2^30 per machine (BZ dynamo 2^30, polar cap tap 2^29).
- 2026-10-28 UXV superheavies III: elements 121 and 122 by Ti-50 beams on Es-254 and Fm-257; island nuclides by multinucleon transfer on Cm-248.
- 2026-10-28 UXV OpV hooks: `si28_ash`, `island_nuclide`, `launched_relay_seed` with the Kerr sling, `shequid_gyro`, `bulge_chart`, `gtceu:opv_machine_casing` research (*Reserve for OpV*).
- 2026-10-28 UXV component recipes live in each maker's own server file; there is no shared component table.
- 2026-10-28 UXV named fiction: the stellar burning ring, pasta as conductor and plate, the Kerr sling, FRC and Whipple shields as jump consumables, the gamma laser.
- QR-UXV: the UXV design meets the QR standards (DECISIONS.md:551-567).
  - Every controller is an assembly line with station research on an item of ours from its own line or the previous machine, plus an era fluid and three domain inputs: `he_6n` for Earth 1-8; `stellar_hydrogen_cut`, `stellar_helium_cut` or `filtered_disk_plasma` for Cygnus, Vela, Cas A, Mk6 and M2.
  - The hull, hatches, parallel hatch and components are assembly lines; `uxv_fusion_casing` is an assembler with `he_6n`; there is no crafting table.
  - Each of the 22 structures passes the rubric (silhouettes from 5x5x23 to 13x25x13, at least 3 blocks, main casing ≤55%; the Mk6 on the lib ring, checked first by A7), with appearance and overlay.
  - Each multiblock package ships its info pages; each of the 20 new types gets a `loop_<machine>`.
- QR-UXV gate tiers (F2, integrator): `eraTier` `uxv: 12`; `complexFloor` `"12": 9.5` (the +0.5 step from UIV's 9); `uxv` 12 in `TIER_NAMES`/`TIER_PREFIX`; `uxv` in process_audit `ERAS`/`TIER_ERA`.
- QR-UXV casings: the draft's `laser_safe`, lead-lined and `high_temperature_smelting` casings are dropped from the structures (not certain to exist), replaced by `laminated_glass` and `robust_machine_casing`.
- QR-UXV process honesty: every older row that makes a UXV id takes a second consumed input or gives a real byproduct (*Process honesty (QR)*). FRC c2 also returns hydrogen. Elevator c2 needs a data module and stellar plasma. One new id, `grindless:multipole_encoder_ring` (magnet works c10 had magnetised the ring into itself). No line, step or crossing count changes.

**CREDITS lines proposed:** the Monifactory (LGPL-3.0) `Post_UV_Components.js` pattern for the UXV components, with attribution (UIV's line extended to UXV). GTNH's mega distillation tower and GT Leisure's power figures are ideas only, no code. GT-- (AGPL) supplies `gtnn:spintronic_mainframe` in game; we use its item and none of its code.

## Open questions

1. **A 22nd machine** (a computation hall or a magnetar tap)? **Default: no**; each is a second route or OpV's.
2. **GT--'s lower spintronic circuits keep their tags?** **Default: keep** (S0-5 reads them).
3. **Tier 12 places?** **Default: yes; fallback tier 11** (S0-3).
4. **If S0-2 fails, 15 A for the hold?** **Default: yes**, the duration scaled to the same EU.
5. **The Mk6 at UXV rather than OpV?** **Default: yes**; OpV gets antimatter power.
6. **M2's overclock?** **Default: as the stellar forge** (mega.md 5).
7. **Keep the polar cap tap** (a second far generator)? **Default: keep**; Vela's source (rule 8).
8. **Cm-248:** settled by the dump; `gtceu:curium_248_dust` is as built (IV hot cell c8, `hot_cell.json:184-191`), so F1 registers no Cm-248. Open only if the decay store's rate starves line 23: **default: tune its time, no second route** *(tune)*.
9. **Lines: 49 against ~69?** **Default: accept, no padding** (average 7.33 holds, crossings x1.78); growth resumes at OpV with the antimatter and exotic matter lines.
10. **Keep the condensation tower** (its condensates feed syngas and stock)? **Default: keep.**
11. **The UIV gamma laser cavity's id** (uiv.md:439 names the item, not the id)? **Default: B5 reads the id UIV-B3 ships.**
12. **The Cas A sweeper on wireless case 11?** **Default: yes**, at or under 4 A x V[UIV], so Cas A does not wait for Vela.
13. **Planar flow casting (line 48) on the ZPM quench caster** (a new mode on a plasma-ash quencher)? **Default: yes, A7's c6**; fallback a UIV levitation melter row with a chill wheel, in A3.
14. **A shared shell helper in `lib/patterns.js`** (cylinders, rings, columns) for big structures, and a casing-share fix for the lib fusion ring if the Mk6 fails the rubric? **Default: no lib change now**; each package keeps a local helper. A lib package is opened only if A7 escalates or three packages duplicate the same helper.
15. **The sound budget:** 20 more loops (about +0.7 MB)? **Default: yes**, at the Starter settings; the integrator may share one loop between two types of the same family (the four pasta machines) if the budget binds.
16. **The Earth era fluid:** `he_6n` (ours, made at home) or a GTM fluid that matches the gate's era-fluid list (molten tritanium or neutronium)? **Default: `he_6n`**; it is a domain fluid and ties the controllers to the cryogenic line. GTM fluids are the fallback.
17. **The BZ chain's net energy** at the draft numbers is about -90%. **Default: B3 tunes the BZ dynamo's EU per run so the chain is net positive by a margin like other generators**; no free energy, and the skimmer and FRC costs stay as drafted.
