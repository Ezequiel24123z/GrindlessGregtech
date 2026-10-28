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
| Process lines | 46 (333 steps, avg 7.2) | 43 (263 steps, avg 6.1) | x0.93 | ~69 (x1.5) |
| Crossings with lines two or more eras back | 100 (UHV and older) | 132 (UEV and older) | x1.32 | ~150 |
| Older machines with a new mode | 58 | 46 (about 120 rows) | x0.79 | none |
| Places with a product of their own | 3 | 3 (+ home) | x1.0 | breadth |

**Why 21 machines:** every machine has a route only it gives; the nine candidates that would reach ~30 are second routes to existing products (tetrataenite `luv/foundation.js:12`, CNT muscles `uev/earth_orbit.js:27`), convenience versions or OpV material, listed with reasons under Considered and dropped. A 22nd for parity is an open question (default no).

**Why 43 lines, not 69:** this is the headline shortfall, and it is honest. The 26 missing lines are each a second route to a product UXV or an older era already has, a data chain, an assembly with no feedstock, a chain under 4 steps, or OpV material (named one by one under Considered and dropped, Lines). Steps per line (6.1) are also below UIV's 7.2: UIV counted as-built upstream steps more generously, UXV counts from the first older product it touches. Crossings (132, x1.32) come closer because every UXV line is fed by older plants: the stellar burning ring feeds its own ash back as the next fuel through ZPM and UEV machines, and spintronics pulls on six older eras' chemistry. Accepting the count is an open question (default accept: growth resumes with OpV's bulge, journey.md:53).

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
| `grindless:cage_part` | RX J1856 (UIV cage mode) → Vela sorter | the neutronium cage is site-locked at RX J1856 (uiv.md:381) |

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
**Source:** MacNeill 2017 (Nature Phys 13:300); Alghamdi 2019 (Nano Lett 19:4400); Shin 2022 (Adv Mater); Mannix 2022 (Nature Nanotech 17:361).

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
**Recipes:** c1 stellar H cut + CNO cut → `cno_ash_plasma` (67,108,864 EU/t, start 6,000,000,000); c2 triple-alpha fuel + triple-alpha fuel → helium-burning ash plasma (100,663,296 EU/t, start 8,000,000,000); c3 carbon-burning fuel x2 → carbon-burning ash plasma (134,217,728 EU/t, start 9,000,000,000); c4 oxygen-burning fuel x2 → oxygen-burning ash plasma (268,435,456 EU/t, start 10,000,000,000). All *(tune)*; the type takes fluids only, 2 in and 1 out (FusionReactorMachine.java:308-313, :330-349).
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
| Cryogenic plant (EV, `ev/cryogenic_plant.js:40`) | He-4 polish; O-16 liquefaction; Kr; 6N He | `stellar_helium_cut` → `triple_alpha_fuel`; O-16 → `oxygen_burning_fuel`; air → Kr; He → `he_6n` | Mk6 c2, c4; KrF laser; stopping cell |
| Extraction cascade (EV, `ev/extraction_cascade.js:92`) | knot dust; flux dross; Bi fume | `ejecta_knot_dust` → Ti fraction + Si, S, Ca, Fe; magnesite → Mg(OH)₂; LPE dross → Pb; BFO fume → Bi (columbite split exists, `:166-168`) | Ti-44 line; YIG; MESO |
| Platinum plant (EV, `ev/platinum_plant.js:598`) | sputter grade; etch and redeposit recovery | 5N Pt, Ru, Ir → `saf_target_set` and `pt_lpe_crucible` feed; etch residue, sputter redeposit (lines 4, 6-8, 10) → Pt, Ru | targets, crucible |
| Hot strip mill (EV, `ev/combined_cycle_and_hot_mill.js:464`) | lamination; foil; sheet; duct | `grindless:tetrataenite` → `tetrataenite_lamination`; 5N Ta → `ta_foil`; 5N Pt → `pt_sheet`; `lasagna_plate` → `alip_duct` | motor, Ta target, crucible, pump |
| Syngas plant (HV, `hv/syngas_plant.js:82`) | platform syngas | `volatile_condensate` → syngas | platform plastics |
| Fuel fabrication (IV, `iv/uranium_cycle.js:44`) | ion-source charge | depleted U → `u238_ion_source` | MNT |
| Hot cell (IV, `iv/hot_cell.js:36`) | sealed core; spent core | Ti-44 → `ti44_core`; spent core → Ca-44 | gamma laser |
| Fluorspar kiln (IV, `iv/fluorspar_kiln.js:83`) | oxide calcines; F₂ | Mg(OH)₂ → 5N MgO; DyScO₃, SrRuO₃, La-BFO, GGG oxides; HF → F₂ | targets, substrates, KrF laser |
| HTS magnet works (LuV, `luv/hts_magnet_works.js:32`) | strand stator | strand wire + lamination → `strand_stator` | motor |
| Coated conductor line (LuV, `luv/coated_conductor_line.js:32`) | strand tape | strand wire → `strand_tape` | field generator, SMES |
| GW detector (LuV, `luv/ganymede.js:48`) | Vela strain record | `vela_glitch_timing` → `vela_glitch_record` (data) | arm chart |
| Eu reductor (ZPM, `zpm/europium.js:105`) | Dy, Y oxides | depleted liquor → Dy₂O₃, Y₂O₃ (Tb, Gd, La rows exist, `:107-119`) | DyScO₃, YIG, Terfenol-D |
| Magnet works (ZPM, `zpm/magnet_works.js:27`) | rotor | `tetrataenite_lamination` → `tetrataenite_rotor` | motor |
| Quench caster (ZPM, `zpm/fusion.js:97`) | Mk6 ash x3 | He-burning ash → C-12 + O-16; C ash → Ne-20, Na-23, Mg-24; O ash → Si-28, S-32, P-31 | Mk6 c3, c4; stock |
| Ion implanter (ZPM, `zpm/qubits.js:47`) | ion-beam etch | annealed `mtj_stack_wafer`, `mram_stack_wafer` → etched | `mtj_die`, `mram_wafer` |
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
| Crystal growth (UHV, `uhv/crystals.js:28`) | GGG, DyScO₃ (Czochralski); WTe₂, FGT (CVT); CaF₂ windows; Terfenol-D, Ni-Mn-Ga (Bridgman); recrystallise | eight rows | spintronics, components, KrF laser |
| Foundry (UHV, `uhv/photonics.js:32`) | MESO integration; Cu back end; RF carpet | `me_switch_wafer` + `sot_readout_stack` → `meso_logic_die`; MRAM back end; `rf_carpet_board` | mainframe, MRAM, stopping cell |
| Transuranium (UHV, `uhv/transcurium.js:25`) | molecular plating | Fm-257, Es-254, Cm-248 → targets | superheavies, MNT |
| Tether works (UHV, `uhv/elevator.js:106`) | Whipple bumper | `cnt_densified_yarn` → `cnt_bumper_weave` | Whipple shield |
| Warp gate (UHV, `uhv/gate.js:28`) | c8 Vela, c9 Cas A, c10 OpV gate | Gate | travel, gate |
| Calutron (UEV, `uev/isotopes.js:21`) | Ti-44, Fm-257, Es-254, Cm-248, W-184 | five rows | lines |
| Cyclotron (UEV, `uev/superheavy.js:21`) | 121, 122 | Ti-50 + Es-254 / Fm-257 | census III |
| Recoil separator (UEV, `uev/superheavy.js:21`) | 121, 122 | → recoils | census III |
| Chem lab (UEV, `uev/superheavy.js:21`) | Es/Fm split; census III | UIV line 32 debris → Es, Fm; recoils → census | superheavies |
| Megabar (UEV, `uev/megabar.js:23`) | Ba-BN growth | BN + Ba → `hbn_crystal` | vdW |
| Electron beam furnace (UEV, `uev/electron_beam.js:23`) | 5N Co, Fe, Mn, Si, Ta, Ni, Ga; Pt melt; apertures, tracks, waveguides, contacts, ME patterning; C-12 vapour | about 14 rows | targets, SHeQUID, racetrack, YIG, vdW, MESO, Mk6 c3 |
| Nitride magnet works (UEV, `uev/composites.js:22`) | field anneals; twin training; SMES cell | MTJ, MRAM, SAF, Heusler, SOT anneals; Ni-Mn-Ga twin training; `uxv_smes_cell` | spintronics, conveyor, W |
| CVI (UEV, `uev/composites.js:22`) | W-184 preform | W-184 fibre → `w184_cvi_preform` | Mk6 casing |
| Photonic hall (UEV, `uev/photonics.js:25`) | spintronic mainframe | dies → `gtnn:spintronic_mainframe` | circuit |
| Ergosphere probe bay (UIV-B4) | Kerr sling | `relay_seed` → `launched_relay_seed` | travel |
| Matrioshka (UIV-A10) | arm chart | four records → `arm_chart` | gate |
| Neutronium cage (UIV-B2, RX J1856 site) | cage parts | `neutronium_pellet` → `grindless:cage_part` (carried to Vela) | phase sorter |
| R-process decompressor (UIV-B2) | gnocchi | `gnocchi_fragment` → r-process stock | by-product |
| Levitation melter (UIV-A3) | CoFeB, Heusler, Terfenol-D, Ni-Mn-Ga | four melts → `cofeb_ingot`, `heusler_ingot`, `terfenol_d_ingot`, `ni_mn_ga_ingot` | targets, piston, conveyor |
| X-ray pulse profiler (UIV-B3) | Ti-44 line map | knot dust sample → `ti44_map` (data) | arm chart |

**Count:** 46 older machines take about 120 rows (40 UEV-and-older machines, 6 UIV). UIV counted 58 machines; UXV leans on fewer machines but harder (132 crossings, Crossings).

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

**Lines** (the 26 that would reach 69):

1. Si-28 from Mk6 oxygen ash as UIV's H-Si28 wafer: second route; the ash is stocked for OpV.
2. Neon from carbon ash for UIV's solid neon moderator: second route; stock.
3. Sc-44 eluate as a positron source for the UHV accumulator: second route to positrons.
4. C-13 and N-14 from the CNO cut as products: no use beyond the Mk6 c1 catalyst.
5. Rare earths from the stellar heavy cut: second route; the condensation cuts are supply.
6. Skyrmion logic track: a second logic family; MESO is the logic.
7. YIG/Pt spin Seebeck thermopile: power from heat already counted.
8. Microquasar jet protons: OpV.
9. Spin-torque nano-oscillator: nothing needs it.
10. Antiferromagnet or altermagnet memory: a second memory.
11. Quantum anomalous Hall interconnect: nothing needs it; the pasta strand is the conductor.
12. Synthetic tetrataenite by irradiation: second route (LuV meteorite matter).
13. CNT yarn muscle actuator: second route (UEV).
14. Pasta core sample as a line: three steps; it is a gate token.
15. Polar cap electrode as a line: two steps.
16. Gnocchi to r-process nuclei: second route to UIV line 31.
17. Corona pairs from Cygnus X-1: second positron route.
18. Stellar He-3 cut: second route to UIV line 27.
19. Cas A Fe, Ca, Si, S, Ar: inert; voided.
20. Eta Carinae nitrogen: second route to the CNO cut.
21. WR 104 carbon dust: second route to carbon.
22. Crab pasta: a second pasta source.
23. Przybylski's star actinides: unconfirmed lines; second route to UIV actinides.
24. Magnetar field tap: OpV bulge.
25. Platform supply from the condensation tower: second route to ordinary materials (machine 12's product, not a line).
26. Assemblies with no feedstock of their own: robot arm, hull, mainframe join, `pasta_strand_repeater`.

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

Nothing new. Stellar cuts and plasmas are fluids in existing fluid cells; caged pasta phases are items; site-locked fluids (`disk_plasma`, `stellar_plasma`) are processed where they are made. No new cell tier, no cross-dimension bridge; wireless energy is the only link between places.

## New process lines

Steps count nodes, as uiv.md does. Numbers in brackets are UXV machines (Our multiblocks); "UIV line n" is uiv.md's line. The Cr column counts crossings: the machines of UEV or older that the line consumes from or feeds (Crossings).

| # | Line | Steps | Cr | By-products → destination |
|---|---|---|---|---|
| 1 | CoFeB target: cobaltite → Co (EV extraction cascade) → 5N Co (UEV electron beam furnace) → CoFeB melt with Fe, B (UIV levitation melter) → atomised (UV powder bed) → HIP blank (UV powder bed) → bonded `cofeb_target` | 7 | 3 | spent target → re-pressed (UV powder bed) |
| 2 | MgO target: magnesite → MgCl₂ brine purified (EV extraction cascade) → Mg(OH)₂ precipitate → 5N MgO (IV fluorspar kiln) → pressed (UV powder bed) → sintered `mgo_target` | 6 | 3 | CO₂ → voided (inert); CaCl₂ liquor → EV extraction cascade |
| 3 | Heusler target: Mn, Si → 5N (UEV electron beam furnace) → Co₂MnSi `heusler_ingot` with line 1's Co (UIV levitation melter) → homogenised (UEV nitride magnet works) → atomised (UV powder bed) → HIP `heusler_target` | 6 | 3 | melt skull → re-melted |
| 4 | SAF target set: PGM residue (EV platinum plant) → Pt, Ru, Ir salts → 5N metals (EV platinum plant) → powders → pressed (UV powder bed) → HIP-bonded `saf_target_set` | 6 | 2 | etch residue → Pt, Ru (EV platinum plant) |
| 5 | Ta seed target: columbite → Nb/Ta split (EV extraction cascade) → Ta₂O₅ → Ta → 5N Ta (UEV electron beam furnace) → rolled (EV hot strip mill) → bonded `ta_seed_target` | 7 | 3 | Nb → stock |
| 6 | MTJ die: `grindless:h_si28_wafer` (UIV) → Ta/CoFeB/MgO/CoFeB/Ru stack (1 c1) → field anneal (UEV nitride magnet works) → ion-beam etch (ZPM ion implanter) → SiN cap (UV MOCVD) → probed, diced `mtj_die` | 6 | 4 | redeposit → EV platinum plant |
| 7 | MRAM wafer: `h_si28_wafer` → Heusler/MgO stack (1 c2) → L2₁ anneal (UEV nitride magnet works) → ion-beam etch (ZPM ion implanter) → Cu back end (UHV foundry) → tested `mram_wafer` | 6 | 4 | as line 6 |
| 8 | Racetrack chip: `saf_target_set` → SAF track stack (1 c3) → field anneal (UEV nitride magnet works) → tracks written (UEV electron beam furnace) → notch-etched (4 c1) → `racetrack_chip` with `mtj_die` read heads (4 c2) | 6 | 3 | etch residue → EV platinum plant |
| 9 | DyScO₃: Dy₂O₃ (ZPM Eu reductor) + Sc₂O₃ (EV extraction cascade) → calcined (IV fluorspar kiln) → Czochralski boule (UHV crystal growth) → (110) slices → polished → terrace-annealed `dysco3_substrate` | 6 | 4 | kerf → re-melted |
| 10 | SrRuO₃ electrode: 5N Ru (line 4) + SrCO₃ → SrRuO₃ (IV fluorspar kiln) → `srruo3_target` (UV powder bed) → film on `dysco3_substrate` (2 c1) → O₂-annealed `srruo3_electrode_wafer` | 5 | 3 | RuO₄ fume → EV platinum plant |
| 11 | MESO logic die: monazite → La₂O₃ (ZPM Eu reductor) → La-BFO powder with Bi₂O₃, Fe₂O₃ (IV fluorspar kiln) → `la_bfo_target` (UV powder bed) → BFO film on line 10's wafer (2 c2) → CoFe magnet (2 c3) → patterned `me_switch_wafer` (UEV electron beam furnace) → MESO cell with `sot_readout_stack` (UHV foundry) → `meso_logic_die` | 9 | 6 | Bi fume → EV extraction cascade |
| 12 | hBN flake: air → N₂ (EV cryogenic plant) → BN (UV BN reactor) → Ba-BN charge → HPHT crystal (UEV megabar) → acid-leached `hbn_crystal` → exfoliated `hbn_flake` (3 c3) | 7 | 3 | Ba liquor → recycled |
| 13 | WTe₂ flake: Te → 7N Te (UV zone refining) → ampoule with W (EV extraction cascade) → CVT crystal (UHV crystal growth) → Te-flux annealed `wte2_crystal` → exfoliated `wte2_flake` (3 c1) | 6 | 3 | I₂ carrier → recovered |
| 14 | FGT flake: GeO₂ → Ge → 7N Ge, Te (UV zone refining) → Fe₃GeTe₂ charge with 5N Fe (UEV electron beam furnace) → CVT `fgt_crystal` (UHV crystal growth) → exfoliated `fgt_flake` (3 c2) | 6 | 3 | as line 13 |
| 15 | SOT readout stack: `hbn_flake` → bottom hBN picked up → WTe₂ → FGT → top hBN (3 c4, four transfers in argon from the EV cryogenic plant) → edge contacts (UEV electron beam furnace) → annealed `sot_readout_stack` (UEV nitride magnet works) | 7 | 3 | broken flakes → re-exfoliated |
| 16 | GGG wafer: gadolinite → Gd₂O₃ (ZPM Eu reductor) → GGG oxide with Ga₂O₃ (IV fluorspar kiln) → Czochralski boule in an Ir crucible (UHV crystal growth; Ir from the EV platinum plant) → (111) slices → polished, O₂-annealed `ggg_wafer` | 6 | 4 | kerf → re-melted |
| 17 | Magnonic bus: xenotime → Y₂O₃ (ZPM Eu reductor) → `lpe_flux` with Fe₂O₃, PbO-B₂O₃ (5 c1, in a `pt_lpe_crucible`) → YIG film on `ggg_wafer` (5 c2) → annealed → waveguides written (UEV electron beam furnace) → `magnonic_bus` with line 4's Pt antennas | 7 | 3 | spent flux (5 c3) → Pb dross (EV extraction cascade) |
| 18 | UXV sensor: SiH₂Cl₂ + NH₃ → SiN membrane (UV MOCVD) → back-etched → 70 nm `nanoaperture_array` (UEV electron beam furnace) → `weak_link_cell` (6 c1) → `shequid_gyro` with heat-flushed He-II (UV cold) and `mtj_die` (6 c2) → `uxv_sensor` with `nv_diamond_chip` | 7 | 3 | He-II boil-off → UV cold |
| 19 | Fm-257 target: Es/Fm debris (UIV line 32) → dissolved (ZPM actinide partitioning) → Es/Fm split (UEV chem lab) → Fm-257 (UEV calutron) → molecular-plated on Ti (UHV transuranium) → sintered `fm257_target` | 6 | 5 | spent target → ZPM waste retrieval; Fm-255 → stock |
| 20 | Es-254 target: line 19's Es fraction → Es-254 (UEV calutron) → plated (UHV transuranium) → sintered `es254_target` → spent target recovered (ZPM waste retrieval) | 5 | 3 | Es-253 → stock |
| 21 | Element 121: Ti-50 sponge (UIV line 9) → ion-source charge → Ti-50 beam on `es254_target` (UEV cyclotron) → recoils separated (UEV recoil separator) → caught on foil → `element_121_recoil` (UEV chem lab) | 6 | 3 | target activation → ZPM waste retrieval |
| 22 | Element 122, census III: Ti-50 beam on `fm257_target` (UEV cyclotron) → recoils (UEV recoil separator) → caught → `element_122_recoil` → `superheavy_census_iii` with line 21's recoil (UEV chem lab) | 5 | 3 | as line 21 |
| 23 | Cm-248 target: spent MOX → Cm cut (ZPM actinide partitioning) → Cm-248 (UEV calutron) → plated (UHV transuranium) → sintered `cm248_target` → activated target recovered (ZPM waste retrieval) | 6 | 4 | Cm-244, Cm-246 → stock |
| 24 | Island nuclides: depleted UF₆ → UF₄ → U metal charge (IV fuel fabrication) → U-238 beam (UV synchrotron) → on `cm248_target` (7 c1, through the `gas_stopping_cell`) → thermalised (7 c2) → MR-TOF-selected `island_nuclide` (7 c3) | 7 | 3 | fragments → Pb, Hg, Pt (ZPM actinide partitioning) |
| 25 | Gamma-ray emitter: Cas A knots → `ejecta_knot_dust` (21) → Ti fraction (EV extraction cascade) → TiCl₄ → Ti-44 (UEV calutron) → sealed `ti44_core` (IV hot cell) → positronium moderated on solid Ne (8 c1) → `positron_stack` (UV antimatter trap) → `gamma_laser_module` with the UIV gamma cavity and `mtj_die` (8 c2) → `uxv_emitter` | 10 | 4 | Si, S, Ar, Ca, Fe → voided (inert); spent core → Ca-44 (IV hot cell) |
| 26 | Hot CNO fuel: `stellar_plasma` lifted with He coolant (10; UV cold) → H and CNO cuts (11 c1) → burned (9 c1) → `cno_ash_plasma` → EU (ZPM DEC) → He-4 and 95% of the CNO back | 6 | 2 | none; the catalyst returns |
| 27 | Triple-alpha fuel: He-4 cut (11 c1) with line 26's He-4 → polished `triple_alpha_fuel` (EV cryogenic plant) → burned (9 c2) → ash plasma → EU (ZPM DEC) → C-12 + O-16 (ZPM quench caster) | 6 | 3 | Ne, H frozen out → stock |
| 28 | Carbon-burning fuel: C-12 (line 27) → vapour-purified `carbon_burning_fuel` (UEV electron beam furnace) → burned (9 c3) → EU (ZPM DEC) → Ne-20, Na-23, Mg-24 (ZPM quench caster) | 5 | 3 | Ne-20, Na-23, Mg-24 → stock (ordinary Ne, Na, Mg) |
| 29 | Oxygen-burning fuel: O-16 (line 27) → liquefied `oxygen_burning_fuel` (EV cryogenic plant) → burned (9 c4) → EU (ZPM DEC) → Si-28, S-32, P-31 (ZPM quench caster) | 5 | 3 | `si28_ash` → stock for OpV; S, P → stock |
| 30 | Field generator: `disk_plasma` skimmed on `mh_winding` (13) → filtered (11 c2) → FRC formed (14 c1) → `frc_cartridge` → in a strand coil (strand tape, LuV coated conductor line; wound, ZPM magnet works) → `uxv_field_generator` | 6 | 3 | cartridges also → warp gate c8 (UHV) |
| 31 | BZ power: `mh_winding` → `disk_plasma` (13) → filtered (11 c2) → `flux_loaded_plasma` (14 c2) → burned at 2^30 EU/t (15) | 5 | 0 | none; the jet carries it off |
| 32 | Pasta strand: Vela timing (ZPM DSN) → `raw_pasta` (16) → `spaghetti_phase` (17) → caged in a `cage_part` (UIV neutronium cage mode) → drawn in an aerogel sheath (18; ZPM aerogel) → `gtceu:pasta_strand_single_wire` | 6 | 2 | gnocchi → r-process stock (UIV decompressor) |
| 33 | Lasagna plate, UXV hull: `raw_pasta` → `lasagna_phase` (17) → caged in a `cage_part` → pressed with `wf_rhea_billet` into `lasagna_plate` (19 c1) → `gtceu:uxv_machine_hull` (on GTM's `uxv_machine_casing`, whose recipe is UIV's gate, uiv.md:1627) | 5 | 0 | anti-phases → `pasta_core_sample` (17 c2) |
| 34 | UXV motor: `grindless:tetrataenite` (LuV) → rolled (EV hot strip mill) → laminations → magnetised rotor (ZPM magnet works) → stator of strand tape (LuV coated conductor line, wound on LuV HTS magnet works) → `uxv_electric_motor` | 6 | 4 | lamination scrap → re-melted |
| 35 | UXV pump: Na + K (ordinary stock; natural Na is all Na-23) → NaK → ALIP duct rolled from `lasagna_plate` (EV hot strip mill) → three-phase strand coils (LuV coated conductor line; ZPM magnet works) → NaK-filled, sealed → `uxv_electric_pump` | 6 | 3 | none |
| 36 | UXV piston: Tb₄O₇, Dy₂O₃ (ZPM Eu reductor) → Tb, Dy → Terfenol-D melt (UIV levitation melter) → [112] Bridgman rod (UHV crystal growth) → prestressed in a `lasagna_plate` housing → `uxv_electric_piston` with a strand drive coil (LuV coated conductor line) | 6 | 3 | rod ends → re-melted |
| 37 | UXV conveyor: Ni, Mn, Ga → 5N (UEV electron beam furnace) → Ni₂MnGa melt (UIV levitation melter) → single crystal (UHV crystal growth) → twin-trained (UEV nitride magnet works) → `uxv_conveyor_module` (MSM elements driven by strand coils, LuV coated conductor line) | 6 | 4 | offcuts → re-melted |
| 38 | Mk6 casing: scheelite → WO₃ (EV extraction cascade) → W-184 (UEV calutron) → W-184 wire → fibre preform (UEV CVI) → infiltrated `wf_rhea_billet` (UIV) → `uxv_fusion_casing` | 7 | 3 | W-182, W-186 → stock |
| 39 | SMES cell: strand wire (line 32) → strand tape (LuV coated conductor line) → solenoid (UEV nitride magnet works) → `lasagna_plate` case → He-II cooled (UV cold) → `uxv_smes_cell` | 6 | 3 | none |
| 40 | Whipple shield: CNT yarn (UHV tether works) → `cnt_densified_yarn` (as built) → `cnt_bumper_weave` (UHV tether works) → on `whipple_shield_casing` with RHEA plate → `cnt_whipple_shield` (spent at warp gate c9, UHV) | 5 | 2 | none |
| 41 | KrF laser (PLD part): air → Kr (EV cryogenic plant) → KrF premix with F₂ (IV fluorspar kiln) → discharge tube with CaF₂ windows (UHV crystal growth) → pulsed-power head → `krf_excimer_laser` | 6 | 3 | spent premix → F₂ scrubbed (IV) |
| 42 | LPE crucible: PGM residue → 5N Pt (EV platinum plant) → electron-beam melted (UEV electron beam furnace) → sheet (EV hot strip mill) → spun, welded `pt_lpe_crucible` | 5 | 3 | worn crucible → EV platinum plant |
| 43 | Gas stopping cell (MNT part): He (UV cold) → 6N He (EV cryogenic plant) → RF carpet board (UHV foundry) → cryogenic cell → `gas_stopping_cell` | 5 | 3 | He → recovered |

**Totals:** 43 lines, 263 steps, an average of 6.1, none under 5 (rule 7's floor is 4); 132 crossings.

**Weakest claims:**
- Lines 26-29 burn a massive star's sequence in a ring: the reactions are textbook (B²FH 1957), the ring is named fiction.
- Line 31 is the shortest and has no crossing: power from the Kerr black hole, kept because the BZ dynamo is the Cygnus platform's source (rule 8).
- Line 33's casing has no crossing: pasta plate is a Vela product; the hull's other inputs are UIV.
- Lines 32-33: pasta as a drawn conductor and a plate is named fiction on real physics (Caplan 2018).
- Lines 41-43 are machine parts (UIV counted parts such as line 19's wick and line 20's droplet sheet); each is a real laboratory part: PLD runs on KrF lasers, YIG LPE uses Pt crucibles, MNT products are caught in gas cells.
- Line 25's Ti-44 activity at game scale is *(tune)*; Cas A holds about 1.5 x 10⁻⁴ M☉ of it (Grefenstette 2014).

## Crossings

A crossing is one (UXV line, older machine) pair from the Cr column; UIV is one era back and does not count (uiv.md counted UHV and older for UIV, so UXV counts UEV and older). The lines table is the list; this is the summary.

| Era | Crossings | Machines met |
|---|---|---|
| UEV | 33 | electron beam furnace (12), nitride magnet works (7), calutron (5), chem lab (3), cyclotron (2), recoil separator (2), megabar, CVI |
| ZPM | 25 | Eu reductor (5), quench caster (3), DEC (4), magnet works (3), actinide partitioning (3), waste retrieval (3), ion implanter (2), DSN, aerogel |
| EV | 26 | extraction cascade (9), platinum plant (7), cryogenic plant (6), hot strip mill (4) |
| UV | 17 | powder bed (6), cold (4), zone refining (2), MOCVD (2), BN reactor, synchrotron, antimatter trap |
| UHV | 16 | crystal growth (7), foundry (3), transuranium (3), warp gate (2), tether works |
| IV | 8 | fluorspar kiln (6), hot cell, fuel fabrication |
| LuV | 7 | coated conductor line (6), HTS magnet works |
| **Total** | **132** | 38 older machines; HV and below give ordinary stock only |

A line that meets one machine twice counts once; a by-product destination counts when it is a row on that machine. C1 checks the pairs against the built rows (Validator).

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

- **Ti-44, Fm-257, Es-254, Cm-248 and W-184 only from the UEV calutron** (with UIV's and UEV's calutron isotopes as built). Ti-44 only from Cas A knot dust.
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
- **C1 re-counts** the lines' nodes (263 steps, 43 lines), the 132 crossings and the 46 older machines.

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
**Data:** `data/gcyr/gcyr/planets/` and the solar system files S0-3 names, `tables/relay_platforms.json` (two rows), `tables/sunlight.json`, `tables/wireless_energy.json`, `tables/fusion_mk6.json` (new), `tables/uxv_components.json` (new), and the older tables each contract names (*Build order*).

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
| **Lines 43 against ~69 (x0.93 of UIV's 46)** | the rule 7 guideline is missed in the measure the user stressed | every missing line named under Considered and dropped; open question 9 (default accept, no padding) |
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

### Bootstrap check (UEV-C1 lesson, DECISIONS.md:516-517)

| Needed | Its inputs come from | Needed in | Cycle? |
|---|---|---|---|
| Controllers 1-6 | UIV hull, `gtnn:optical_mainframe`, UIV components | `uxv` | no |
| `mgo_target` (MTJ die, sensor) | magnesite through EV, IV, UV plants | `uxv` | no: never Mk6 ash (fixed in this design) |
| `uxv_sensor` | `mtj_die`, SHeQUID gyro, `nv_diamond_chip` | `uxv` | no |
| `gtnn:spintronic_mainframe` | machines 1-5, home older plants | `uxv` | no |
| Controllers 7, 8, 10-21 | UIV hull, 2 spintronic mainframes, `uxv_sensor`, UIV components | `uxv` (built at home, carried) | no |
| `frc_cartridge` (Vela travel) | disk plasma skimmed on `mh_winding` (UIV), never pasta | `uxv` | no |
| `cnt_whipple_shield` (Cas A travel) | UHV tether works, RHEA plate (UIV), `whipple_shield_casing` (LuV); no lasagna | `uxv` | no |
| `launched_relay_seed` | UIV relay seed, probe bay mode | `uxv` | no |
| `cage_part` | UIV neutronium cage at RX J1856 | before Vela | no |
| Pasta extractor | `vela_glitch_timing` (ZPM DSN, home) | `uxv-vela` | no |
| Cas A sweeper power | wireless case 11 (UIV): its recipe stays at or under 4 A x V[UIV] *(tune)*, so case 12 is not needed before Vela | `uxv-cas-a` | no |
| `gtceu:uxv_machine_hull`, UXV hatches | `lasagna_plate` (Vela), UIV-B5's `uxv_machine_casing`, strand wire | `uxv-vela` | no |
| UXV motor, pump, piston, conveyor, field generator, arm | strand tape and lasagna (Vela), natural Na, Cygnus cartridges | `uxv-vela` | no: the pump's Na is ordinary sodium, never Mk6 ash (fixed) |
| Mk6 controller | UXV hull and motor, pump, field generator (not the emitter) | `uxv-vela` | no: the Mk6 is never needed for the hull or the parts |
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
- **Prohibited, always:** as UIV's (`pack/index.toml`, `pack/pack.toml`, `hidden_until.json`, `lib/**`, `AGENTS.md`, `docs/STATUS.md`, `DECISIONS.md`, `CREDITS.md`, every `.snbt`, `script_order.json`), and any older file or table the contract does not list.
- **Older rows:** placed per DECISIONS.md:508 (the machine's table or inline array first; a companion table second; the package's own file only for GTM types and generated rows, such as the hot strip mill). One package owns a table per wave (*Parallel and serial*). A row adds a recipe and never edits an existing one.
- **Circuits:** the table below was read on 2026-10-28. The worker re-reads every row of the type before writing; if a number has been taken since, it takes the next free one and records it in the handoff.
- **Ids:** exactly as in this file. A new cross-package id, or a changed one, is an escalation.
- **Bootstrap:** every controller, travel item and gate input is checked against the *Bootstrap check* table (Risks). An input that arrives only in a later substage is an escalation, never a quiet change.
- **Invariants, always:**
  - no UXV recipe takes an OpV-only input (`gtceu:opv_machine_casing` is only researched) or anything in *Reserve for OpV* except as listed there;
  - no Earth, Mercury or Cygnus recipe takes a Vela or Cas A product before its substage;
  - Ti-44, Fm-257, Es-254, Cm-248 and W-184 only from the calutron; elements 121 and 122 and census III only from the cyclotron, the recoil separator and the chem lab;
  - the Mk6, its DEC rows, the BZ dynamo and the polar cap tap are written final, not in `power/generators.js`'s list;
  - no recipe EU/t above 2^31; only B6's c10 row reaches it (S0-2);
  - the pump's sodium is ordinary sodium and the MgO comes from magnesite (never Mk6 ash);
  - UIV's invariants hold.
- **Controllers** as *Voltages and controllers*. Only the Mk6 and M2 take the UXV hull.
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
| Calutron (`tables/isotopes.json`) | 1-9, 20-26 | A1 10-13; B5 14 |
| Cyclotron, recoil separator, chem lab (`tables/superheavy.json`) | 1-7, 20-25 | A1 8-11 per type |
| Transuranium (`tables/transcurium.json`) | 0-6 | A1 7-9 |
| Actinide partitioning, waste retrieval (`zpm/actinides.js:58`, `:85`) | 1-5 | A1 6-12 |
| Electron beam furnace (`tables/electron_beam.json`) | 0-7, 23, 25, 26 | A3 8-21 |
| Nitride magnet works, CVI (`tables/composites.json`) | 0-6 | W 7; A3 8-15 |
| Crystal growth (`tables/crystals.json`) | 0-9, 24 | A3 10-17 |
| Megabar (`tables/megabar.json`) | 0-3 | A3 4 |
| Levitation melter (`tables/levitation_melter.json`) | 1-5 | A3 6-9 |
| Foundry (`tables/photonics.json`) | 0-13 | A3 14-16 |
| MOCVD (`uv/photonics.js:143`) | 1-11 | A3 12-13 |
| Ion implanter (`zpm/qubits.js:47`) | 1-4, 6, 7 | A3 8-9 |
| Photonic hall (`tables/photonics_uev.json`) | 0-6 | A5 7 |
| Extraction cascade (`ev/extraction_cascade.js:92`) | 1-2, 5-13 | A2 14-21; B5 22 |
| Platinum plant (`ev/platinum_plant.js:598`) | 1-4, 7-9 | A2 10-13 |
| Powder bed (`tables/am_powders.json`) | 1-7 | A2 8-13 |
| Zone refining (`uv/detectors.js:56`) | 1-3, 6, 7 | A2 8-9 |
| Eu reductor (`zpm/europium.js:105`) | 1-9 | A2 10-11 |
| Cryogenic plant, fluorspar kiln | none (rows keyed by input) | A2: distinct inputs |
| Hot strip mill (generated, `ev/combined_cycle_and_hot_mill.js:464`) | own file | A2, A8: first free in their own files |
| Cold (`uv/cold.js:55`) | 1-5 | A6 6 |
| Fuel fabrication (`iv/uranium_cycle.js:44`) | 1-3, 9 | A6 10 |
| Synchrotron (`tables/accelerators.json`) | 0-4, 7 | A6 8 |
| Quench caster, DEC (`zpm/fusion.js:97`, `:149-170`) | 1-2 | A7 3-5; DEC rows keyed by plasma |
| Magnet works (`tables/magnet_works.json`) | 1-7 | A8 8; B3 9 |
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
  - components `grindless:uxv_electric_motor`, `uxv_electric_pump`, `uxv_conveyor_module`, `uxv_electric_piston`, `uxv_robot_arm`, `uxv_sensor`, `uxv_emitter`, `uxv_field_generator` (Monifactory `Post_UV_Components.js` pattern, LGPL, credited) and `tables/uxv_components.json` with no rows. Recipes: sensor A6; motor, pump, piston, conveyor, arm A8; field generator B3; emitter B5;
  - blocks: `grindless:uxv_fusion_casing` (S0-4);
  - materials (`gtceu:`): `pasta_strand` with cable properties (S0-8); `titanium_44`, `fermium_257`, `einsteinium_254`, `curium_248`, `tungsten_184`; CoFeB, Co₂MnSi, Terfenol-D, Ni₂MnGa, DyScO₃, SrRuO₃, La-BFO, GGG, YIG, hBN, WTe₂, Fe₃GeTe₂; and every material S0-1's dump shows missing;
  - fluids (`grindless:`): `stellar_plasma`, `disk_plasma`, `filtered_disk_plasma`, `flux_loaded_plasma`, the four cuts (`stellar_hydrogen_cut`, `stellar_helium_cut`, `stellar_cno_cut`, `stellar_heavy_cut`), `triple_alpha_fuel`, `carbon_burning_fuel`, `oxygen_burning_fuel`, the four ash plasmas (`cno_ash_plasma`, `helium_burning_ash_plasma`, `carbon_burning_ash_plasma`, `oxygen_burning_ash_plasma`), `lpe_flux`, `he_6n`, `mnt_product_gas`. They are here because older files (`zpm/fusion.js`, `ev/cryogenic_plant.js`) read them;
  - items made by one package and used by another:
    - spintronics: `cofeb_target`, `mgo_target`, `heusler_target`, `saf_target_set`, `ta_seed_target`, `srruo3_target`, `la_bfo_target`, `cofeb_ingot`, `heusler_ingot`, `terfenol_d_ingot`, `ni_mn_ga_ingot`, `ta_foil`, `pt_sheet`, `dysco3_substrate`, `ggg_wafer`, `hbn_crystal`, `wte2_crystal`, `fgt_crystal`, `mtj_stack_wafer`, `mram_stack_wafer`, `saf_track_wafer`, `mtj_die`, `mram_wafer`, `srruo3_electrode_wafer`, `me_switch_wafer`, `sot_readout_stack`, `meso_logic_die`, `racetrack_chip`, `magnonic_bus`, `sin_membrane`, `nanoaperture_array`, `rf_carpet_board`, `caf2_window`, `kr_f2_premix`, `krf_excimer_laser`, `pt_lpe_crucible`, `gas_stopping_cell`, `shequid_gyro`, `nv_diamond_chip` if S0-1 shows it missing;
    - superheavy: `fm257_target`, `es254_target`, `cm248_target`, `element_121_recoil`, `element_122_recoil`, `superheavy_census_iii`, `u238_ion_source`, `u238_beam_charge`, `island_nuclide`, `island_chart`;
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
  - `script_order.json`: a band for `uxv/` and one for each older file in *Older machines* that gets a row reading a UXV id.
- **Allowed:** `hidden_until.json`, `tools/analysis/tiers/obtain.json`, `script_order.json`, `server_scripts/grindless/uxv/cuts.js` (new), and a tag file only after a failed S0-5.
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
- **Allowed (extra):** `lib/parallel_hatch.js` (the three places named); its recipe in `server_scripts/grindless/uxv/parallel_hatch.js` (UXV hull, 4 spintronic mainframes, UXV field generator and emitter *(tune)*, by `server_scripts/grindless/uiv/parallel_hatch.js:17`); pinned tests that list the hatches.
- **References:** *Nothing one at a time*; mega.md 4.12; UIV-M1 (uiv.md:1128-1146; DECISIONS.md:530); S0-6.
- **Depends on:** F1, S0-6.
- **Invariants:** the UV to UIV hatches untouched; not counted.
- **Acceptance:** reports 65,536; forms in the stellar forge and in one UXV machine. Reachable after B4 and B5 (hull, emitter); C1 checks.
- **Tests:** T0; T1: `gg_test_uxv_parallel_hatch`, band assigned by integrator. Doubt: tier 12 with `highTierContent` off, and 65,536 copies still bound by energy as a long.
- **Commits:** 1.
- **Serial:** alone (lib). If S0-6 failed, M1 is dropped.

<!-- CONTINUE -->
