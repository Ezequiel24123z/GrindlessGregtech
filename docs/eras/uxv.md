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
| Older machines with a new mode | 58 | 66 | x1.14 | none |
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

<!-- CONTINUE -->
