# UXV (T12): the galactic arm

UXV is the twelfth tier: V[UXV] = 134,217,728 EU/t. The journey calls it "the galactic arm: many systems at once" (journey.md:14-54): stellar plasma, accretion disk plasma, the stellar elevator and the accretion disk skimmer. UIV went to three tier-11 places and gated on the Kerr chart (uiv.md:871-887). UXV goes back to Cygnus X-1 to work its star and its disk, then slings out to two more places at once, each with a product only it has:

- **Home (Earth):** spintronics (the UXV circuit), the superfluid gyroscope, superheavies III and the island of stability, the gamma laser, and the Mk6 fusion ring.
- **Cygnus X-1 orbit** (`grindless:cygnus_x1_orbit`, UIV place, revisited): star lifting of HDE 226868, the plasma mass filter, stellar condensation, the accretion disk skimmer, FRC cartridges and the Blandford-Znajek dynamo.
- **Vela pulsar orbit** (`grindless:vela_pulsar_orbit`, new): nuclear pasta from the inner crust (spaghetti for cable, lasagna for plate) and the polar cap tap.
- **Cassiopeia A** (`grindless:cas_a_remnant`, new): titanium-44 from the remnant's ejecta knots, the only long-lived positron source this pack has.

Everything is built against uiv.md as designed; where a UIV package is not merged yet, the dependency is named (UIV-A10, B1-B5, M2, C1-C3). Nothing in UIV is reworked.

**Size (rule 7):** guidance, never padding. Counted as uiv.md:20-39 counts: a progression multiblock has a product of its own; a line is a real chain of at least 6 steps that ends in a UXV part, a stored item or a fuel; a crossing is a UXV line that consumes, or feeds, a line or machine of UEV or older (UIV is one era back and does not count).

| | UIV (as designed) | UXV (this design) | Growth | Guideline |
|---|---|---|---|---|
| Progression multiblocks | 22 | 21 | x0.95 | ~30 (x1.35) |
| Process lines | 46 (333 steps, avg 7.2) | 61 (453 steps, avg 7.4) | x1.33 | ~69 (x1.5) |
| Crossings with lines two or more eras back | 100 (UHV and older) | 152 (UEV and older) | x1.52 | ~150 |
| Older machines with a new mode | 58 | 45 (about 80 rows) | x0.78 | none |
| Places with a product of their own | 3 | 3 (+ home) | x1.0 | breadth |

**Why 21 machines:** every machine has a route only it gives; the nine candidates that would reach ~30 are second routes to existing products (tetrataenite `luv/foundation.js:12`, CNT muscles `uev/earth_orbit.js:27`), convenience versions or OpV material, listed with reasons under Considered and dropped. A 22nd for parity is an open question (default no).

**Why 61 lines, not 69:** the eight missing lines are each a second route, a data chain or an OpV pre-emption (named one by one under Considered and dropped). Crossings meet the guideline because every UXV line is fed by older plants: the stellar burning ring feeds its own ash back as the next fuel through ZPM and UEV machines, and spintronics pulls on six older eras' chemistry.

- complexity.md:97: difficulty is steps, conditions, multiblocks and crossings, never quantity. UXV adds conditions (glitch timing, Roche-lobe lifting, site locks, fuel sequences that need the previous fuel's ash) rather than bigger numbers.
- No UXV coil: nothing in UXV needs more than the UIV metallic hydrogen coil's 14,400 K.
- highTierContent stays off (DECISIONS.md:499).

**The UXV era in four sentences.** At home the player builds spin-based logic (MTJs, magnetoelectric switches, van der Waals readouts, racetracks and magnonic buses) into the spintronic mainframe, and a superfluid helium gyroscope into the UXV sensor. At Cygnus X-1 they lift plasma off a supergiant and skim a black hole's disk, filtering one into fusion fuels and trapping the other in field-reversed rings. Those rings and a CNT Whipple shield let the Kerr sling throw relay seeds to Vela, where nuclear pasta becomes cable and plate, and to Cassiopeia A, where titanium-44 drives a gamma-ray laser. The Mk6 fusion ring then burns the star's sequence (CNO, helium, carbon, oxygen), each fuel made from the ash of the one before, and the gate holds 2^31 EU/t at Cygnus X-1 to chart the galactic bulge.

## Route

1. **Spintronics (home, substage `uxv`).** MTJ sputter cluster, oxide PLD chamber, vdW stacking cell, racetrack fab and YIG LPE furnace; their dies are joined into `gtnn:spintronic_mainframe` on the UEV photonic integration hall (new row). The mainframe is the UXV circuit (`#gtceu:circuits/uxv`, S0-5). Before UXV hatches exist, UXV recipes run on two UIV hatches (WorkableElectricMultiblockMachine.java:250-273, as uiv.md cites).
2. **The sensor.** The SHeQUID works makes the superfluid gyroscope; with the MTJ die and the existing `grindless:nv_diamond_chip` (`zpm/qubits.js:28`) it becomes `grindless:uxv_sensor`, the only UXV component made before Vela.
3. **Superheavies III.** UIV line 32's Es/Fm debris is split on the UEV chem lab and calutron into Fm-257 and Es-254 targets; the UEV cyclotron makes elements 121 and 122 with UIV's Ti-50 (`grindless:superheavy_census_iii`); the MNT collider reaches the N=184 island (`grindless:island_chart`).
4. **Back to Cygnus X-1.** The stellar elevator lifts HDE 226868's envelope at L1; the plasma mass filter splits it into H, He-4, CNO and heavy cuts; the condensation tower feeds the rockless platforms. The accretion disk skimmer takes disk plasma, the FRC former traps it as `grindless:frc_cartridge`, and the BZ dynamo draws power from the black hole's spin.
5. **The Kerr sling.** UIV's ergosphere probe bay slings a relay seed (new mode); the Cygnus warp gate throws the player to Vela (consumes an FRC cartridge, the M2P2 shield) or to Cas A (consumes a CNT Whipple shield). Substages `uxv-vela` and `uxv-cas-a` run in parallel.
6. **Vela.** The pasta extractor works the crust at glitch time; the phase sorter (caged in UIV's neutronium cage) splits spaghetti, lasagna, gnocchi and the anti-phases; the draw bench makes the UXV strand cable, the laminator the hull plate. `gtceu:uxv_machine_hull` and UXV hatches follow. The polar cap tap gives power.
7. **Cassiopeia A.** The ejecta knot sweeper gathers Ti-rich dust; the EV extraction cascade, UEV calutron and IV hot cell make a sealed Ti-44/Sc-44 core; the annihilation laser works turns it into a gamma laser module and `grindless:uxv_emitter`.
8. **Parts, power and scale.** The UXV motor, pump, conveyor, piston, arm and field generator; the Mk6 stellar burning ring; wireless case 12 and the UXV SMES cell; the x65,536 parallel hatch; the stellar fractionation hall (mega).
9. **Gate to OpV.** The UIV Matrioshka computes the arm chart (Vela glitch record, Cas A Ti-44 map, Cygnus elevator log); the Cygnus warp gate holds 16 A x V[UXV] = 2^31 EU/t and returns `grindless:bulge_chart`, which researches `gtceu:opv_machine_casing`.

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

Existing pack ids UXV reuses instead of making again: `grindless:tetrataenite` rods (LuV, `luv/foundation.js:12`), `grindless:cnt_coiled_muscle` and `cnt_densified_yarn` (UEV, `uev/earth_orbit.js:27`), `grindless:nv_diamond_chip` (ZPM, `zpm/qubits.js:28`), `grindless:whipple_shield_casing` (LuV, `luv/foundation.js:126`), `grindless:neutronium_pellet`, `grindless:mh_winding`, `grindless:wf_rhea_billet` (UIV, `uiv/foundation.js:33-68`).

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

First arrival on Vela and Cas A is UIV-B1's platform kit (a row each in `relay_platforms.json`, same kit, S0-10), plus the volatile cut of the condensation tower carried from Cygnus for water and air. No platform receives a product of its place.

**Bootstrap (UEV-C1 lesson, DECISIONS.md:516-517).** Vela travel needs the FRC cartridge, made at Cygnus with UIV `mh_winding` coils, never pasta. Cas A travel needs the Whipple shield, made without lasagna. Every Vela and Cas A controller uses only home and Cygnus products. Checked one by one under Risks.

## Automatic resource generation

| Resource | Machine | Place | Catalyst |
|---|---|---|---|
| H, He-4, CNO and heavy cuts | plasma mass filter | Cygnus X-1 | stellar plasma |
| Refractory (Al, Ca, Ti oxides), metal (Fe, Ni, Co), silicate (Mg, Si) and volatile (H₂O, CO, N₂, S) cuts | stellar condensation tower | Cygnus X-1 | stellar plasma |
| Disk plasma | accretion disk skimmer | Cygnus X-1 | none (site) |
| Pasta slurry | pasta extractor | Vela | `grindless:vela_glitch_timing` (kept) |
| Ejecta knot dust (Ti, Si, S, Ar, Ca, Fe) | ejecta knot sweeper | Cas A | none (site) |

The condensation cuts are the platforms' supply (rule 1), not line endpoints. Ash of the Mk6 ring returns as fuel or stock (Fusion).

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
| 1 | MTJ sputter cluster | MgO-barrier tunnel junctions, Heusler MRAM | sensor die, mainframe | H |
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
| 12 | Stellar condensation tower | platform supply by condensation | rule 1 at Vela, Cas A | S |
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

UXV recipes run up to 1 A x V[UXV] = 134,217,728 EU/t on two UIV energy hatches, because a multiblock with two or more hatches of its highest tier runs one tier up (WorkableElectricMultiblockMachine.java:250-273, as uiv.md cites). UXV hatches are needed only for the Mk6 ring, the gate's 16 A hold and anything above 1 A UXV. Controllers: machines 1-6 (the mainframe and sensor chain) use `gtceu:uiv_machine_hull` + 2 `gtnn:optical_mainframe` + UIV components; machines 7, 8 and 10-21 use `gtceu:uiv_machine_hull` + 2 `gtnn:spintronic_mainframe` + `grindless:uxv_sensor` + UIV components; the Mk6 controller and the M2 hall use `gtceu:uxv_machine_hull` + UXV components. No Vela or Cas A controller uses a Vela or Cas A product (bootstrap, Risks). All EU/t and ticks below are *(tune)*; every structure uses only casings present in the S0-1 dump.

### 1. MTJ sputter cluster: `gtceu:mtj_sputter_cluster`, type `gtceu:mtj_sputtering` (Earth)

**What it gains:** multi-gun magnetron sputtering of 1 nm layers with in-situ MgO (001) texture and coherent Δ1 tunnelling; nothing older deposits a tunnel barrier. Tunnel magnetoresistance above 600% (Ikeda 2008).
**Recipes:** c1 `cofeb_target` + `mgo_target` + Ta and Ru targets + `grindless:h_si28_wafer` → `mtj_stack_wafer` (33,554,432 EU/t, 600 t); c2 `heusler_target` + `mgo_target` + wafer → `mram_stack_wafer` (67,108,864 EU/t, 800 t); c3 `saf_target_set` + wafer → `saf_track_wafer` (33,554,432 EU/t, 600 t).
**Byproducts:** spent targets → UV powder bed (re-pressed, 80% back).
**Structure:** 5x5x7 cleanroom chamber, plascrete and cleanroom glass, four gun ports.
**Crossings:** UV powder bed (targets), EV platinum plant (Ru, Pt), UEV nitride magnet works (field anneal).
**Risks:** none beyond circuits on shared types.
**Source:** Parkin 2004 (Nature Mater 3:862); Yuasa 2004 (Nature Mater 3:868); Ikeda 2008 (APL 93:082508); Ikeda 2010 (Nature Mater 9:721).

### 2. Oxide PLD chamber: `gtceu:oxide_pld_chamber`, type `gtceu:pulsed_laser_deposition` (Earth)

**What it gains:** stoichiometric complex-oxide epitaxy, unit cell by unit cell (RHEED); nothing older grows perovskite heterostructures.
**Recipes:** c1 `srruo3_target` + `dysco3_substrate` → `srruo3_electrode_wafer` (33,554,432 EU/t, 400 t); c2 + `la_bfo_target` → `bfo_film_wafer` (67,108,864 EU/t, 600 t); c3 + CoFe target (sputter c4 bank) → `me_switch_wafer` (67,108,864 EU/t, 600 t).
**Byproducts:** ablated plume dust → UV powder bed.
**Structure:** 5x5x5, plascrete, laser port of `gtceu:laser_safe` class casing (dump check).
**Crossings:** UHV crystal growth (DyScO₃), EV platinum plant (Ru), UV powder bed.
**Source:** Manipatruni 2019 (Nature 565:35); Heron 2014 (Nature 516:370); Ramesh & Spaldin 2007 (Nature Mater 6:21).

### 3. vdW stacking cell: `gtceu:vdw_stacking_cell`, type `gtceu:vdw_stacking` (Earth)

**What it gains:** robotic dry transfer of exfoliated flakes in argon, with twist control; nothing older assembles air-sensitive 2D stacks.
**Recipes:** c1 `wte2_crystal` → 4 `wte2_flake` (8,388,608 EU/t, 200 t); c2 `fgt_crystal` → 4 `fgt_flake`; c3 `hbn_crystal` → 8 `hbn_flake`; c4 2 `hbn_flake` + `wte2_flake` + `fgt_flake` → `sot_readout_stack` (67,108,864 EU/t, 900 t).
**Byproducts:** flake offcuts → recrystallised on the UHV crystal growth furnace (c5 back, 50%).
**Structure:** 5x3x5 glovebox, cleanroom glass, argon input hatch.
**Crossings:** UHV crystal growth (CVT crystals), UEV megabar (hBN), UV BN reactor, EV cryogenic plant (argon).
**Source:** MacNeill 2017 (Nature Phys 13:300); Alghamdi 2019 (Nano Lett 19:4400); Shin 2022 (Adv Mater 34:2101730); Mannix 2022 (Nature Nanotech 17:361).

### 4. Racetrack fab: `gtceu:racetrack_fab`, type `gtceu:racetrack_patterning` (Earth)

**What it gains:** synthetic-antiferromagnet tracks with chiral, DMI-stabilised domain walls that current pulses shift in lockstep; nothing older stores data by moving walls.
**Recipes:** c1 `saf_track_wafer` → `patterned_track_wafer` (33,554,432 EU/t, 600 t); c2 `patterned_track_wafer` + `mtj_stack_wafer` (read heads) → `racetrack_chip` (67,108,864 EU/t, 900 t).
**Byproducts:** etch residue → EV platinum plant (Pt, Ru recovery).
**Structure:** 5x5x5, plascrete, cleanroom glass.
**Crossings:** EV platinum plant both ways, UEV electron beam furnace (patterning row).
**Source:** Parkin, Hayashi & Thomas 2008 (Science 320:190); Yang, Ryu & Parkin 2015 (Nature Nanotech 10:221); Fert, Cros & Sampaio 2013 (Nature Nanotech 8:152).

### 5. YIG LPE furnace: `gtceu:yig_lpe_furnace`, type `gtceu:liquid_phase_epitaxy` (Earth)

**What it gains:** isothermal dipping epitaxy from a PbO-B₂O₃ flux near 900 °C; YIG with damping near 10⁻⁵ grows only this way, on GGG.
**Recipes:** c1 PbO + B₂O₃ → `lpe_flux` (fluid, 4,194,304 EU/t, 200 t); c2 Y₂O₃ + Fe₂O₃ + `lpe_flux` + `ggg_wafer` → `yig_film_wafer` + spent flux (33,554,432 EU/t, 1,200 t); c3 spent flux → PbO + B₂O₃ (90%).
**Byproducts:** Pb-bearing flux closed in c3; dross → EV extraction cascade (Pb).
**Structure:** 3x3x6 vertical furnace, `gtceu:high_temperature_smelting_casing` (dump check), Pt crucible (EV platinum plant).
**Crossings:** UHV crystal growth (GGG), EV platinum plant (crucible), EV extraction cascade.
**Source:** Chumak 2015 (Nature Phys 11:453); Serga, Chumak & Hillebrands 2010 (J Phys D 43:264002).

### 6. SHeQUID works: `gtceu:shequid_works`, type `gtceu:shequid_assembly` (Earth)

**What it gains:** superfluid He-4 Josephson weak links in a multi-turn loop: the phase shift 4πmΩ·A/h measures rotation. Nothing older uses the superfluid Josephson effect.
**Recipes:** c1 `nanoaperture_array` + cell body (Ti, as built) → `weak_link_cell` (16,777,216 EU/t, 400 t); c2 2 `weak_link_cell` + 1,000 mB isotopically pure superfluid He-4 + `mtj_die` (readout) → `shequid_gyro` (33,554,432 EU/t, 1,200 t).
**Byproducts:** boil-off He → UV cold (recondensed).
**Structure:** 3x3x5 cryostat, `gtceu:superconducting_coil` shield.
**Crossings:** UV cold (He-II, heat-flush purification row), UEV electron beam furnace (apertures), UV MOCVD (SiN).
**Source:** Hoskinson, Sato & Packard 2006 (PRB 74:100509); Sato & Packard 2012 (Rep Prog Phys 75:016401); Narayana & Sato 2011 (PRL 106:255301).

### 7. MNT collider: `gtceu:mnt_collider`, type `gtceu:multinucleon_transfer` (Earth)

**What it gains:** deep-inelastic U-238 + Cm-248 collisions near the Coulomb barrier, a gas catcher and a multi-reflection time-of-flight spectrometer; fusion-evaporation (UEV cyclotron) stays neutron-poor, MNT reaches toward N=184.
**Recipes:** c1 `u238_beam_charge` + `cm248_target` → `mnt_product_gas` (134,217,728 EU/t, 2,400 t); c2 → gas catcher → `mnt_thermal_ions` (33,554,432 EU/t, 400 t); c3 MR-TOF → `island_nuclide` + light fragments (67,108,864 EU/t, 1,200 t); c4 16 `island_nuclide` → `island_chart` (data, 8,388,608 EU/t).
**Byproducts:** light fragments (Pb, Hg, Pt region) → ZPM actinide partitioning; activated target → ZPM waste retrieval.
**Structure:** 7x5x15, `gtceu:high_power_casing`, `gtceu:superconducting_coil`.
**Crossings:** UV synchrotron (U-238 beam), ZPM actinide partitioning (Cm), ZPM waste retrieval, UEV calutron (Cm-248).
**Risks:** bulk island nuclides are named fiction (MNT cross sections are picobarns).
**Source:** Zagrebaev & Greiner 2008 (PRC 78:034610); Savard 2020 (NIM B 463:258).

### 8. Annihilation laser works: `gtceu:annihilation_laser_works`, type `gtceu:annihilation_lasing` (Earth)

**What it gains:** a sealed Ti-44/Sc-44 positron source, a solid-neon moderator, laser-cooled positronium condensed inside a gamma cavity: stimulated 511 keV emission. UIV's positronium lab (B3) condenses Ps from a pulsar's pair wind but has no long-lived source and no cavity output.
**Recipes:** c1 `ti44_core` (2% consumed) + solid neon moderator (UIV line 45) → `moderated_ps_cell` (67,108,864 EU/t, 1,200 t); c2 `moderated_ps_cell` + gamma cavity (UIV line 34) + `mtj_die` (timing) → `gamma_laser_module` (134,217,728 EU/t, 2,400 t).
**Byproducts:** annihilation heat → UEV He-3 polariser cooling loop (as built coolant); spent core → IV hot cell c (Ca-44, decayed).
**Structure:** 5x5x9, `gtceu:superconducting_coil`, lead-lined casing (dump check).
**Crossings:** IV hot cell (core), UV antimatter trap (Penning trap row), UV cold.
**Risks:** a gamma-ray laser at scale is named fiction; the parts are real.
**Source:** Platzman & Mills 1994 (PRB 49:454); Avetissian, Avetissian & Mkrtchian 2014 (PRL 113:023904); Shu 2024 (Nature 633:793).

### 9. Mk6 fusion ring: `gtceu:uxv_fusion_reactor`, type GTM `gtceu:fusion_reactor` (Earth)

**What it gains:** the "stellar burning ring" (named fiction, DECISIONS.md:502): a second `registerFusionTier(12)` ring that burns a star's sequence, each fuel made from the previous fuel's ash.
**Recipes:** c1 stellar H cut + CNO cut → helium-4 plasma (67,108,864 EU/t, start 6,000,000,000); c2 triple-alpha fuel + triple-alpha fuel → helium-burning ash plasma (100,663,296 EU/t, start 8,000,000,000); c3 carbon-burning fuel x2 → carbon-burning ash plasma (134,217,728 EU/t, start 9,000,000,000); c4 oxygen-burning fuel x2 → oxygen-burning ash plasma (268,435,456 EU/t, start 10,000,000,000). All *(tune)*; the type takes fluids only, 2 in and 1 out (FusionReactorMachine.java:308-313, :330-349).
**Byproducts:** plasmas → ZPM DEC rows (`zpm/fusion.js:149-170`) → EU and ash (Fusion).
**Structure:** GTM fusion ring through the lib tier helper as Mk5 (UIV-A9 as built), `grindless:uxv_fusion_casing`, Mk5 coil, `gtceu:fusion_glass`.
**Crossings:** ZPM DEC, ZPM quench caster, UEV calutron, UEV electron beam furnace, EV cryogenic plant.
**Risks:** storage 10,240,000,000 at 16 hatches and the starts are long values (S0-4).
**Source:** Burbidge, Burbidge, Fowler & Hoyle 1957 (Rev Mod Phys 29:547); Hoyle 1954 (ApJS 1:121).

### 10. Stellar elevator: `gtceu:stellar_elevator`, type `gtceu:star_lifting` (Cygnus X-1 orbit)

**What it gains:** star lifting at L1 (named fiction): HDE 226868 nearly fills its Roche lobe, so a ring current and surface heating beneath the inner Lagrange point push its envelope over the saddle into a magnetic funnel. Nothing older takes matter from a star.
**Recipes:** c1 1,000 mB liquid helium (coolant, 90% back) → 1,000 mB `stellar_plasma` (134,217,728 EU/t, 1,200 t); c2 → `elevator_log` (data, every 64 runs: the arm chart's Cygnus piece; 8,388,608 EU/t).
**Byproducts:** warm helium → UV cold (recondensed).
**Structure:** 9x9x19, `gtceu:uxv_machine_casing`, `gtceu:superconducting_coil`.
**Crossings:** UV cold, LuV helium refrigerator (as built coolant).
**Source:** Criswell 1985 (Interstellar Migration and the Human Experience, 50-87); Miller-Jones 2021 (Science 371:1046); Miškovičová 2016 (A&A 590:A114).

### 11. Plasma mass filter: `gtceu:plasma_mass_filter`, type `gtceu:plasma_mass_filtering` (Cygnus X-1 orbit, c1-c2)

**What it gains:** an Archimedes band-gap filter: in a rotating plasma with crossed E and B fields, ions above a cutoff mass are ejected radially while light ions stay confined, a one-pass mass split at fluid rates.
**Recipes:** c1 1,000 mB `stellar_plasma` → 700 mB `stellar_hydrogen_cut` + 270 mB `stellar_helium_cut` + 15 mB `stellar_cno_cut` + 15 mB `stellar_heavy_cut` (67,108,864 EU/t, 400 t); c2 1,000 mB `disk_plasma` → 900 mB `filtered_disk_plasma` + 100 mB `stellar_heavy_cut` (67,108,864 EU/t, 400 t).
**Byproducts:** none; every cut has a use (Lines).
**Structure:** 7x7x11, `gtceu:superconducting_coil`, `gtceu:high_power_casing`.
**Crossings:** UEV calutron (heavy cut isotopes), EV cryogenic plant (He-4 cut).
**Source:** Ohkawa & Miller 2002 (Phys Plasmas 9:5116); Gueroult, Rax & Fisch 2018 (J Clean Prod 182:1060).

### 12. Stellar condensation tower: `gtceu:stellar_condensation_tower`, type `gtceu:stellar_condensation` (Cygnus X-1 orbit)

**What it gains:** cools the heavy cut along the equilibrium condensation sequence (Ca-Al-Ti oxides near 1,700 K, Fe-Ni metal near 1,350 K, forsterite near 1,300 K, troilite near 700 K, then ices) and draws each cut at its stage; the supply of the rockless platforms (rule 1).
**Recipes:** c1 100 mB `stellar_heavy_cut` + 100 mB `stellar_hydrogen_cut` → `refractory_condensate` + `metal_condensate` + `silicate_condensate` + 100 mB `volatile_condensate` (33,554,432 EU/t, 600 t). The cuts separate into ordinary GT materials on EV and HV plants as built.
**Structure:** 5x5x21 tower, 7 stages, `gtceu:uxv_machine_casing`.
**Crossings:** EV extraction cascade, HV syngas plant (volatiles).
**Source:** Grossman 1972 (GCA 36:597); Lodders 2003 (ApJ 591:1220).

### 13. Accretion disk skimmer: `gtceu:accretion_disk_skimmer`, type `gtceu:disk_skimming` (Cygnus X-1 orbit)

**What it gains:** a magnetic scoop in the outer disk (journey.md:119; named fiction). Cygnus X-1's disk is fed by the focused wind and its inner edge reaches about 1 keV; nothing older reaches disk plasma.
**Recipes:** c1 → 1,000 mB `disk_plasma` (134,217,728 EU/t, 1,200 t), consumes 1 `grindless:mh_winding` at 5% *(tune)*.
**Structure:** 9x5x15, `gtceu:uxv_machine_casing`, `gtceu:superconducting_coil`.
**Crossings:** none of its own; its product feeds the FRC and BZ lines.
**Source:** Shakura & Sunyaev 1973 (A&A 24:337); Gou 2011 (ApJ 742:85).

### 14. FRC former: `gtceu:frc_former`, type `gtceu:frc_forming` (Cygnus X-1 orbit, c1)

**What it gains:** theta-pinch formation of field-reversed configurations, compact toroids with closed poloidal flux and no central post, trapped in a cartridge; the M2P2 shield that carries the player through Vela's wind. The cartridge's indefinite life is named fiction.
**Recipes:** c1 500 mB `filtered_disk_plasma` + 4 `grindless:mh_winding` (10% consumed) → `frc_cartridge` (134,217,728 EU/t, 1,600 t); c2 500 mB `filtered_disk_plasma` → 500 mB `flux_loaded_plasma` (BZ fuel, 67,108,864 EU/t, 400 t).
**Structure:** 5x5x13 linear theta-pinch, `gtceu:superconducting_coil`, `gtceu:fusion_glass`.
**Crossings:** none (UIV windings are one era back).
**Source:** Tuszewski 1988 (Nucl Fusion 28:2033); Binderbauer 2015 (Phys Plasmas 22:056110); Winglee 2000 (JGR 105:21067).

### 15. BZ dynamo: `gtceu:bz_dynamo`, type `gtceu:blandford_znajek`, generator (Cygnus X-1 orbit)

**What it gains:** power from the black hole's spin (a* > 0.95) through field lines threading the horizon; uiv.md reserved relativistic jets and Blandford-Znajek for UXV. Not free (rule 8): the field must be loaded, and the jet carries the flux-loaded plasma away.
**Recipes:** c1 50 mB/t `flux_loaded_plasma` → 1,073,741,824 EU/t (8 A x V[UXV] = 2^30) for 200 t *(tune)*, out through two UIV 16 A dynamo hatches (2^29 each) or one UXV 16 A dynamo hatch.
**Structure:** 11x11x7 ring around the scoop line, `gtceu:uxv_machine_casing`.
**Crossings:** none; power only.
**Risks:** output below 2^31 by design (S0-2 not needed).
**Source:** Blandford & Znajek 1977 (MNRAS 179:433); Tchekhovskoy, Narayan & McKinney 2011 (MNRAS 418:L79).

### 16. Pasta extractor: `gtceu:pasta_extractor`, type `gtceu:pasta_extraction` (Vela pulsar orbit)

**What it gains:** at a glitch, pinned superfluid vortices unpin and the crust slips; the extractor draws inner-crust matter out along the flux tubes into a cage (named fiction; the glitch is real). Nothing older reaches the pasta layers.
**Recipes:** c1 `vela_glitch_timing` (kept) + `grindless:neutronium_pellet` (ballast, 10% consumed) → `raw_pasta` (134,217,728 EU/t, 2,400 t).
**Structure:** 9x9x15, `grindless:neutron_star_site_casing`, `gtceu:superconducting_coil`.
**Crossings:** ZPM DSN (glitch timing), LuV GW detector (glitch record).
**Source:** Anderson & Itoh 1975 (Nature 256:25); Link, Epstein & Lattimer 1999 (PRL 83:3362).

### 17. Pasta phase sorter: `gtceu:pasta_phase_sorter`, type `gtceu:pasta_sorting` (Vela pulsar orbit)

**What it gains:** splits raw pasta along the inner crust's density sequence: gnocchi, spaghetti, lasagna, then the inverted phases (anti-spaghetti, bubbles).
**Recipes:** c1 `raw_pasta` → `spaghetti_phase` + `lasagna_phase` + `gnocchi_fragment` + `anti_phase_residue` (67,108,864 EU/t, 1,200 t); each phase leaves only in a cage (UIV neutronium cage new mode, `grindless:cage_part`); c2 16 `anti_phase_residue` → `pasta_core_sample` (134,217,728 EU/t, 2,400 t).
**Byproducts:** gnocchi → UIV r-process decompressor (new row): r-process elements to stock.
**Structure:** 7x7x9, `grindless:neutron_star_site_casing`.
**Source:** Ravenhall, Pethick & Wilson 1983 (PRL 50:2066); Hashimoto, Seki & Yamada 1984 (Prog Theor Phys 71:320); Caplan & Horowitz 2017 (Rev Mod Phys 89:041002).

### 18. Pasta draw bench: `gtceu:pasta_draw_bench`, type `gtceu:pasta_drawing` (Vela pulsar orbit)

**What it gains:** draws caged spaghetti into a continuous strand inside a field sheath that stands in for crust pressure (named fiction): the UXV superconductor.
**Recipes:** c1 caged `spaghetti_phase` + aerogel (ZPM, as built) → 8 `gtceu:pasta_strand_single_wire` (134,217,728 EU/t, 1,200 t).
**Structure:** 3x3x17 draw line, `grindless:neutron_star_site_casing`.
**Crossings:** ZPM aerogel.
**Risks:** material `pasta_strand` with superconductor properties at V[UXV] (S0-8); generic wiremill and extruder rows for it are cut (F2).
**Source:** Baym, Pethick & Pines 1969 (Nature 224:673); Caplan & Horowitz 2017.

### 19. Pasta laminator: `gtceu:pasta_laminator`, type `gtceu:pasta_lamination` (Vela pulsar orbit)

**What it gains:** presses caged lasagna sheets into plate. Pasta is the stiffest material computed: shear modulus near 10³⁰ erg/cm³, breaking strain near 0.1 (Caplan 2018).
**Recipes:** c1 caged `lasagna_phase` + `grindless:wf_rhea_billet` (frame) → 4 `lasagna_plate` (134,217,728 EU/t, 1,200 t); c2 `lasagna_plate` + 2 strand wire → `polar_cap_electrode` (33,554,432 EU/t, 400 t).
**Structure:** 5x5x7 press, `grindless:neutron_star_site_casing`.
**Source:** Caplan, Schneider & Horowitz 2018 (PRL 121:132701).

### 20. Polar cap tap: `gtceu:polar_cap_tap`, type `gtceu:polar_cap_tapping`, generator (Vela pulsar orbit)

**What it gains:** a share of the open-field-line potential (named fiction): Vela's polar-cap drop is near 10¹⁵ V and its spin-down power near 7 x 10³⁶ erg/s. The tap draws current through a lasagna electrode that sputters away (rule 8).
**Recipes:** c1 1 `polar_cap_electrode` → 536,870,912 EU/t (4 A x V[UXV]) for 2,400 t *(tune)*, out through one UIV 16 A dynamo hatch.
**Structure:** 7x7x7, `grindless:neutron_star_site_casing`.
**Risks:** weakest machine claim: UIV dropped a pulsar-wind dynamo at J0437. It counts because its electrode is a Vela product and it powers the Vela platform with no sunlight.
**Source:** Goldreich & Julian 1969 (ApJ 157:869); Ruderman & Sutherland 1975 (ApJ 196:51).

### 21. Ejecta knot sweeper: `gtceu:ejecta_knot_sweeper`, type `gtceu:ejecta_sweeping` (Cassiopeia A)

**What it gains:** a magnetic scoop through Cas A's Ti-rich knots collects ejecta dust; young Ti-44 exists in reach only here.
**Recipes:** c1 → `ejecta_knot_dust` (67,108,864 EU/t, 1,200 t), consumes 1 `grindless:mh_winding` at 2% *(tune)*.
**Byproducts:** Si, S, Ar, Ca, Fe in the dust: inert, split on the EV extraction cascade, voidable (rule 3).
**Structure:** 9x5x9, `grindless:whipple_shield_casing`, `gtceu:superconducting_coil`.
**Crossings:** EV extraction cascade, UEV calutron, IV hot cell.
**Source:** Grefenstette 2014 (Nature 506:339); Sato 2021 (Nature 592:537); Vink 2012 (A&ARv 20:49).

## Older machines, new modes

Placement per DECISIONS.md:508. Circuits are taken by each package after `git grep` of the type (Common). UIV machines are one era back: they take modes but are not crossings.

| Machine (era, file:line) | Mode | Recipe | Feeds |
|---|---|---|---|
| Cryogenic plant (EV, `ev/cryogenic_plant.js:40`) | He-4 polish; O-16 liquefaction | `stellar_helium_cut` → `triple_alpha_fuel`; O-16 → `oxygen_burning_fuel` | Mk6 c2, c4 |
| Extraction cascade (EV, `ev/extraction_cascade.js:92`) | knot dust; flux dross | `ejecta_knot_dust` → Ti fraction + Si, S, Ca, Fe; LPE dross → Pb | Ti-44 line; YIG |
| Platinum plant (EV, `ev/platinum_plant.js:598`) | sputter grade; etch recovery | 5N Pt, Ru, Ir → `saf_target_set` feed; etch residue → Pt, Ru | targets |
| Hot strip mill (EV, `ev/combined_cycle_and_hot_mill.js:464`) | tetrataenite lamination | `grindless:tetrataenite` rod → `tetrataenite_lamination` | motor |
| Syngas plant (HV, `hv/syngas_plant.js:82`) | platform syngas | `volatile_condensate` → syngas | platform plastics |
| Fuel fabrication (IV, `iv/uranium_cycle.js:44`) | ion-source charge | depleted U → `u238_ion_source` | MNT |
| Hot cell (IV, `iv/hot_cell.js:36`) | sealed core; spent core | Ti-44 → `ti44_core`; spent core → Ca-44 | gamma laser |
| Fluorspar kiln (IV, `iv/fluorspar_kiln.js:83`) | MgO calcine | Mg-24 carbonate → 5N MgO | `mgo_target` |
| HTS magnet works (LuV, `luv/hts_magnet_works.js:32`) | strand stator | strand wire + lamination → `strand_stator` | motor |
| Coated conductor line (LuV, `luv/coated_conductor_line.js:32`) | strand tape | strand wire → `strand_tape` | field generator, SMES |
| GW detector (LuV, `luv/ganymede.js:48`) | Vela strain record | `vela_glitch_timing` → `vela_glitch_record` (data) | arm chart |
| Magnet works (ZPM, `zpm/magnet_works.js:27`) | rotor | `tetrataenite_lamination` → `tetrataenite_rotor` | motor |
| Quench caster (ZPM, `zpm/fusion.js:97`) | Mk6 ash x3 | He-burning ash → C-12 + O-16; C ash → Ne-20, Na-23, Mg-24; O ash → Si-28, S-32, P-31 | Mk6 c3, c4; MgO |
| Ion implanter (ZPM, `zpm/qubits.js:47`) | ion-beam etch | `mtj_stack_wafer` (annealed) → `mtj_die` | sensor, racetrack |
| Actinide partitioning (ZPM, `zpm/actinides.js:85`) | Cm cut; fragments | Cm fraction → calutron; MNT fragments → Pb, Hg, Pt | MNT |
| Waste retrieval (ZPM, `zpm/actinides.js:58`) | MNT target | activated target → stock | by-product |
| DEC (ZPM, `zpm/fusion.js:149-170`) | Mk6 plasmas x4 | four plasmas → EU + ash | power, ash |
| DSN (ZPM, `zpm/observatory.js:30`) | Vela timing | → `vela_glitch_timing` (kept) | extractor |
| Cold (UV, `uv/cold.js:55`) | heat flush | He-II → isotopically pure He-II | SHeQUID |
| Powder bed (UV, `uv/materials.js:52`) | targets x5 | CoFeB, MgO, Heusler, SrRuO₃, La-BFO powders → targets; spent re-press | spintronics |
| Zone refining (UV, `uv/detectors.js:56`) | 7N Te, Ge | Te, Ge → 7N | CVT crystals |
| MOCVD (UV, `uv/photonics.js:143`) | LPCVD SiN | → `sin_membrane` | SHeQUID |
| Synchrotron (UV, `uv/accelerators.js:34`) | U-238 injector | `u238_ion_source` → `u238_beam_charge` | MNT |
| Antimatter trap (UV, `uv/accelerators.js:146`) | positron stacking; own file, `.dimension` overworld | slow positrons → `positron_stack` | gamma laser |
| EHT (UV, `uv/edge.js:46`) | VLBI parallax | → `cygnus_vlbi_record` (data) | arm chart |
| Crystal growth (UHV, `uhv/crystals.js:28`) | GGG, DyScO₃ (Czochralski); WTe₂, FGT (CVT); recrystallise | five rows | spintronics |
| Foundry (UHV, `uhv/photonics.js:32`) | MESO integration | `me_switch_wafer` + `sot_readout_stack` → `meso_logic_die` | mainframe |
| Transuranium (UHV, `uhv/transcurium.js:25`) | molecular plating | Fm-257, Es-254, Cm-248 → targets | superheavies, MNT |
| Tether works (UHV, `uhv/elevator.js:106`) | Whipple bumper | `cnt_densified_yarn` → `cnt_bumper_weave` | Whipple shield |
| Warp gate (UHV, `uhv/gate.js:28`) | c8 Vela, c9 Cas A, c10 OpV gate | Gate | travel, gate |
| Calutron (UEV, `uev/isotopes.js:21`) | Ti-44, Fm-257, Es-254, Cm-248, W-184 | five rows | lines |
| Cyclotron (UEV, `uev/superheavy.js:21`) | 121, 122 | Ti-50 + Es-254 / Fm-257 | census III |
| Recoil separator (UEV, `uev/superheavy.js:21`) | 121, 122 | → recoils | census III |
| Chem lab (UEV, `uev/superheavy.js:21`) | Es/Fm split; census III | UIV line 32 debris → Es, Fm; recoils → census | superheavies |
| Megabar (UEV, `uev/megabar.js:23`) | Ba-BN growth | BN + Ba → `hbn_crystal` | vdW |
| Electron beam furnace (UEV, `uev/electron_beam.js:23`) | apertures, tracks, bus, C-12 vapour | four rows | SHeQUID, racetrack, YIG, Mk6 c3 |
| Nitride magnet works (UEV, `uev/composites.js:22`) | field anneal; SMES cell | MTJ, MRAM anneal; `uxv_smes_cell` | spintronics, W |
| CVI (UEV, `uev/composites.js:22`) | W-184 preform | W-184 fibre → `w184_cvi_preform` | Mk6 casing |
| Photonic hall (UEV, `uev/photonics.js:25`) | spintronic mainframe | dies → `gtnn:spintronic_mainframe` | circuit |
| Ergosphere probe bay (UIV-B4) | Kerr sling | `relay_seed` → `launched_relay_seed` | travel |
| Matrioshka (UIV-A10) | arm chart | three records → `arm_chart` | gate |
| Neutronium cage (UIV-B2) | pasta caging | phases → caged phases | Vela |
| R-process decompressor (UIV-B2) | gnocchi | `gnocchi_fragment` → r-process stock | by-product |
| Levitation melter (UIV-A3) | Heusler | Co, Mn, Si → `heusler_ingot` | MRAM |
| X-ray pulse profiler (UIV-B3) | Ti-44 line map | knot dust sample → `ti44_map` (data) | arm chart |

**Count:** 45 older machines take about 80 rows (39 UEV-and-older machines, 6 UIV). UIV counted 58 machines; UXV leans on fewer machines but harder (152 crossings, Crossings).

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

**Lines** (the eight that would reach 69):

1. Si-28 from Mk6 oxygen ash as UIV's H-Si28 wafer: second route; the ash is stocked for OpV.
2. Neon from carbon ash for UIV's solid neon moderator: second route; stock.
3. Sc-44 eluate as a positron source for the UHV accumulator: second route to positrons.
4. C-13 and N-14 from the CNO cut as products: no use beyond the Mk6 c1 catalyst.
5. Rare earths from the stellar heavy cut: second route; the condensation cuts are supply.
6. Skyrmion logic track: a second logic family; MESO is the logic.
7. YIG/Pt spin Seebeck thermopile: power from heat already counted.
8. Microquasar jet protons: OpV.

Data chains (arm chart, island chart, glitch record, VLBI record, Ti-44 map, elevator log, bulge chart) and the hull and hatch assemblies do not count.

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
| c3 carbon burning | `carbon_burning_fuel` x2 | `carbon_burning_ash_plasma` | Ne-20, Na-23, Mg-24 | MgO target; stock |
| c4 oxygen burning | `oxygen_burning_fuel` x2 | `oxygen_burning_ash_plasma` | Si-28, S-32, P-31 | `si28_ash` (OpV); stock |

- Fuel prep: `triple_alpha_fuel` on the EV cryogenic plant from the He-4 cut and c1 ash; `carbon_burning_fuel` is C-12 vapour from the UEV electron beam furnace; `oxygen_burning_fuel` is O-16 liquefied on the EV cryogenic plant.
- Storage: 10,240,000,000 EU at 16 hatches (twice Mk5's 5,120,000,000, run 20261028-192609-server) *(tune)*; starts 6, 8, 9 and 10 billion *(tune)*; all long (S0-4). FusionReactorMachine.java :185, :276, :294-298, :326-327 as uiv.md cites.
- Casing `grindless:uxv_fusion_casing`: W-184 (UEV calutron) → CVI preform (UEV CVI) → `grindless:wf_rhea_billet` (UIV) → casing.
- Real physics: CNO and triple-alpha are textbook (B²FH 1957; Hoyle 1954). Burning carbon and oxygen in a ring at these rates is fiction.

## Nothing one at a time

- **Stellar fractionation hall** (`gtceu:stellar_fractionation_hall`, M2, mega.md 4.1, 4.11, 4.12, 5, 6.6): the UXV member of the mega family. It runs GTM `gtceu:distillation_tower` and `gtceu:distillery` recipes; parallels are energy-bound times the parallel hatch; the overclock rule follows mega.md 5 as the stellar forge (open question 6). It gains over GTCA's `gtceu:large_distillery` by parallels up to x65,536 in one hall. GTNH's mega distillation tower is an idea only (CREDITS.md).
- **UXV parallel hatch** (`gtceu:uxv_parallel_hatch`, M1): `lib/parallel_hatch.js:80-81` → `.tiers(9, 10, 11, 12)`, name ternary at :84; x65,536 = 4^(12-4). Recipe mirrors server `uiv/parallel_hatch.js:17` with spintronic mainframes and UXV parts. Parallel x EU/t overflow is checked by S0-6.

## AE2

Nothing new. Stellar cuts and plasmas are fluids in existing fluid cells; caged pasta phases are items; site-locked fluids (`disk_plasma`, `stellar_plasma`) are processed where they are made. No new cell tier, no cross-dimension bridge; wireless energy is the only link between places.

<!-- CONTINUE -->
