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

<!-- CONTINUE -->
