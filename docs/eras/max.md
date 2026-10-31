# MAX (T14): Sagittarius A*

MAX is the last era and the end of the game. The player reaches the supermassive black hole at the centre of the Milky Way, builds a mirror round it and makes the hole's spin amplify a wave until the mirror bursts. That is the "black hole bomb" (Press and Teukolsky 1972, Nature 238:211). The era makes three things the pack has never had:

- **horizon work**: mass lowered on a tether almost to the horizon, the final destination of every waste canister (Geroch's engine; Bekenstein 1973, PRD 7:2333; Unruh and Wald 1982, PRD 25:942);
- **superradiance**: a wave below the horizon frequency that grows on each bounce and takes rotational energy from the hole (Zel'dovich 1971; Brito, Cardoso and Pani 2015, LNP 906);
- **the ending**: the mirror shell, the largest multiblock of the pack, and a last recipe that leaves a seed for whatever comes after (MAX+).

Places:

- **Sgr A* orbit** (`gcyr:black_hole_orbit`, GCYR's own dimension, given a planet file): a hole of 4.3e6 solar masses at 8.18 kpc (GRAVITY 2019, A&A 625:L10). Its accretion flow is hot, thin and faint, about 1e29 W (Yuan and Narayan 2014, ARA&A 52:529; Genzel, Eisenhauer and Gillessen 2010, RMP 82:3121). Here stand the photon ring imager, the Geroch winch, the mass stream injector and the mirror shell. UXV's disk machines and UIV's Penrose engine take new rows here.
- **NSC belt** (`grindless:nsc_belt`, new): a belt of metal-rich planetesimals inside the nuclear star cluster. The cluster is real: about 2.5e7 solar masses within a few parsecs, with supersolar metallicity (Schödel 2014, A&A 566:A47; Do 2015, ApJ 809:143; Feldmeier-Krause 2017, MNRAS 464:194). The belt is *named fiction*; it is placed where in-situ star formation is plausible (Zubovas, Nayakshin and Sazonov 2012, MNRAS 421:1315). The cluster-light furnace smelts here.
- **Cygnus X-1 orbit** (UIV place, revisited a third time): gate c14 and a Kugelblitz forge mode that writes the seed wave packet.
- **SGR 1806−20 orbit** (OpV place, revisited): the UXV draw bench draws horizon strand where OpV put it.
- **Home**: the Rydberg array works, the atom interferometer works, the membrane line, the gene ark, the components and the supracausal mainframe.

The MAX voltage is V[MAX] = 2,147,483,648 (2^31), a `long` (GTValues.java:60-61). VA[MAX] = 2,013,265,920 and VH[MAX] = 1,073,741,824 are `int` (:66-73); `GTValues.MAX = 14` (:104). OpV's design says "V[MAX] = Integer.MAX_VALUE" (opv.md *Risks*); that is off by one, and the integrator corrects it in DECISIONS (*Decisions proposed*). MAX is the top of GTM's ladder, so nothing runs one tier up from it: two MAX hatches give V[MAX], not more (WorkableElectricMultiblockMachine.java:271-273). The era opens from OpV's gate c13 (`grindless:sgr_a_chart`, `gtceu:max_machine_casing` researched; opv.md *Gate to MAX*) and ends the pack. It pre-empts no MAX+ content (DECISIONS.md:450).

**State.** UXV is complete (a9f01511, v0.15.0). On `opv-integ`, OpV-F1, F3 and W are merged and the rest of OpV is running. `docs/STATUS.md` predates this and is stale; the integrator updates it. MAX is designed against OpV as designed (opv.md) and each package names the OpV package it waits for.

| | UXV (uxv.md:20-28) | OpV (opv.md:24-32) | MAX | Guideline (rule 7, from OpV) |
|---|---|---|---|---|
| Progression multiblocks (ours) | 21 | 18 | **10** | 24 (x1.35) |
| Process lines (at least 4 steps each) | 49 (359 steps) | 45 (216 steps, average 4.80) | **46** (232 steps, average 5.04) | 68 (x1.5) |
| Crossings with lines two or more eras back | 178 (UEV and older) | 141 (UIV and older, 49 machines) | **167** (UXV and older, 71 machines) | 212 (x1.5) |
| Older machines with a new mode | 46 | 49 | **78** (71 crossing + Penrose engine + photonic hall + swarm segment foundry + 4 OpV) | — |
| Places | 3 + home | 2 new + Cygnus + home | 2 new + Cygnus + SGR + home | — |
| Components | 8 | 9 (GTM `gtceu:opv_*`) | **9** (`grindless:max_*`; GTM has none at MAX) | — |
| Basic single-block machines | none | GTM's set at OpV | **none** (GTM registers none at MAX) | — |
| Hull and hatches | UEV builders | GTM `gtceu:opv_*` | GTM `gtceu:max_*` (29 ids, opv_ids.json:14) | — |

**Why 10.** MAX has one destination and one task: reach Sgr A*, build the mirror, end the game. Each of the ten has a route only it gives: four home machines make the parts nothing older can (Rydberg logic, matter-wave sensing, superconducting membranes, the genome archive), five Sgr A* machines exist only at a spinning supermassive hole (imaging its photon ring, lowering mass to its horizon, holding a shell up with mass streams, burning belt slag in a thin ring down to the ISCO, and the shell itself), and one belt machine smelts under cluster light. Fourteen candidates are missing to reach 24; *Considered and dropped* names every one with its reason (second route, rule 8, data chain, assembly, or MAX+ reserve). The mirror shell is the largest multiblock of the pack and carries the era (journey.md:54, :127).

**Why 46.** MAX now has more lines (46) and crossings (167) than OpV (45, 141), so the era is clearly bigger where rule 7 puts the weight, but it is short of the x1.5 guide by 22 lines and 45 crossings. *Considered and dropped* lists each of the 22 lines and the 47 crossings they would have brought (they cover the 45), one specific candidate and one reason each; none is waved through as "data" or "assembly" in general. Every counted line has at least 4 feedstock transformations besides any final assembly or cold qualification (the repair added a real intermediate step, such as stabiliser plating, electropolish, anodisation, a cure or a substrate, to the sixteen lines that lacked one: L9, L11, L14, L18, L20, L22 (two), L23, L24, L33, L38-L40, L41 (two), L43, L44, L45); the average depth is 5.04 because MAX's chains are part cores and Sgr A* feedstock, short in the real world too. Open question 1 asks the owner whether to accept the residual shortfall.

## Route

1. **The way in.** OpV-G1's gate c13 at Cygnus X-1 orbit holds 2^33 EU/t, consumes a Kugelblitz core, writes `grindless:sgr_a_chart` and grants `max` (opv.md *Gate to MAX*). The chart is kept. `gtceu:max_machine_casing` is researched with it.
2. **The hull without travel.** At SGR, the UXV draw bench draws `gtceu:horizon_strand`: OpV chain strand clad in stable exotic matter (a new OpV vault row at home). The UHV PBO plant braids it into cable. `gtceu:max_machine_hull` = MAX casing + horizon strand cable + `chain_lamina_stack` + superfluid He-3. Until MAX hatches exist, every MAX row runs on two OpV 4 A or 16 A hatches, which give V[MAX] (WorkableElectricMultiblockMachine.java:271-273; OpV-S0-2 saw EMI show MAX).
3. **Circuits and the first components.** The supracausal mainframe (`gtnn:supracausal_mainframe`, the only member of `#gtceu:circuits/max`) is joined on UEV's photonic integration hall from three MAX parts made on older machines only: `squeezed_light_chip`, `tweezer_array_die` and `cryo_photonic_interposer`. Six components (motor, pump, piston, robot arm, emitter, fluid regulator) follow from older modes.
4. **Home machines.** The membrane line (superconducting membrane, albedo panel, membrane belt) and the atom interferometer works (gradiometer) close the component family: conveyor, sensor and field generator. The MAX hatches follow (`diamond_power_die`). Then the Rydberg array works and the gene ark.
5. **The galactic centre.** Gate c14, at Cygnus on two OpV 16 A hatches (2^33, the proven path), throws a `gc_relay_probe`: an OpV probe seed with a Hawking drive and a chain-strand magsail that brakes on the Galactic Centre's hot gas, carrying the feedstock its seed needs to unfold the platform. `gcyr:black_hole_orbit` opens as substage `max-sgra`.
6. **At Sgr A*.** New rows on older machines start first: the UXV disk skimmer clears the hot flow, the UXV BZ dynamo and UIV Penrose engine run on its spin, and the UIV droplet radiator works builds the shell's radiators. The photon ring imager measures the spin and charts the cluster.
7. **The belt.** Gate c15, on a warp gate built at Sgr A* orbit, throws a `nsc_belt_seed` aimed by the imager's `nsc_ephemeris`. `grindless:nsc_belt` opens as `max-nsc`. OpV's debris harvester and replication refinery take rows there; the cluster-light furnace smelts the planetesimals into segment truss and stream pellets.
8. **Horizon work.** The Geroch winch lowers waste canisters on a horizon tether; the mass stream injector makes the stream bundles that hold a shell up without a rigid support.
9. **The mirror.** The mirror shell (about 33 x 33 x 33 *(tune)*) forms round the hole from thousands of segments. Its vent mode is a generator. Its last recipe takes the seed wave packet, the genome archive, stream bundles and a charged case 14 network, bursts the mirror and returns `grindless:universe_seed`. The credits roll.

## Inherited, as built

| Inherited | From | State at 8c765141 |
|---|---|---|
| Warp gate (`gtceu:warp_gate`, uhv/gate.js:40), `tables/gate.json` c1-10 (c10 at 2,147,483,648 EU/t, a long in JSON) | UHV-UXV | merged |
| Gate c11-c13, `sgr_a_chart`, `max` grant, `gtceu:max_machine_casing` research | OpV-A0, R1, G1 | to come (opv.md) |
| `gtceu:chain_strand` (opv/foundation.js:113), `chain_lamina_stack`, `superfluid_helium_3`, `superfluid_he3_seal` | OpV-F1, A0, A1 | F1 merged; rows to come |
| Strangelet vault, Kugelblitz forge, debris harvester, replication refinery (`stable_exotic_matter`, `hawking_drive`, `probe_seed`, `metal_feedstock`, `cluster_sinter_casing`, `vitamin_kit`) | OpV-D2, D3, R1, R2 | to come |
| `gtceu:opv_*` components and OpV 4 A/16 A energy and dynamo hatches; `tetron_array`, `cryo_optical_link`, `opv_harmonic_drive` | HT, OpV-A1-A3, B1 | HT ids in registry; rows to come |
| Wireless case 13 (lv/wireless_energy.js:305 pattern), `server_scripts/grindless/opv/wireless.js` | OpV-W | merged |
| OpV parallel hatch x262,144 (`lib/parallel_hatch.js:81`), assembly line array | OpV-M1, M2 | to come |
| Relay platforms (`tables/relay_platforms.json`, `uxv/kerr_sling.js` pattern); places publication `G.opvTravel` (opv/travel.js:10-17) | UIV-B1, UXV-B1, OpV-F1 | merged |
| Accretion disk skimmer, FRC former, BZ dynamo (uxv/cygnus_disk.js:37, :51, :68); stellar elevator, plasma mass filter (uxv/cygnus_lift.js:35, :51) | UXV-B2, B3 | merged |
| Penrose engine (uiv/cygnus.js:50); droplet radiator works (uiv/matrioshka.js:83) | UIV | shipped |
| The 29 `gtceu:max_*` ids (hull, casing, battery, hatches, buses, converters, buffers, charger) | HT (`opv_ids.json:14`) | in registry, hidden until `max` (OpV-F2) |
| `gtnn:supracausal_*` circuits and SMDs, `gtnn:max_wrap_circuit`, `gtnn:component_assline_casing_max`, `gtmutils:max_64a_energy_converter` | GT--, GTMUtils | in registry; Java recipes |

OpV ids are only consumed or kept, never redefined. The OpV changes MAX needs are MAX packages that name the OpV package they wait for: the vault's cladding row (A0, after OpV-D2), the forge's wave packet (G1, after OpV-D3), the harvester and refinery at the belt (R1, after OpV-R1/R2).

## Places and site rules

| Place | Id | GCYR tier | Substage | How the player arrives | What only it gives |
|---|---|---|---|---|---|
| Sgr A* orbit | `gcyr:black_hole_orbit` (fallback `grindless:sgr_a_orbit`, S0-1) | 14 | `max-sgra` | gate c14 at Cygnus, `gc_relay_probe` | hot flow, spin, horizon (machines 5-8; UXV and UIV rows) |
| NSC belt | `grindless:nsc_belt` | 14 | `max-nsc` | gate c15 at Sgr A* orbit, `nsc_belt_seed` | metal-rich planetesimals, cluster light (machine 9) |
| Cygnus X-1 orbit | `grindless:cygnus_x1_orbit` | 11 (as built) | `max` | warp gate (UXV) | gate c14; seed wave packet (forge row) |
| SGR 1806−20 orbit | `grindless:sgr1806_orbit` | 13 (OpV) | `max` | OpV relay | horizon strand (draw bench rows) |

**`gcyr:black_hole_orbit`.** GCYR 0.2.9 ships this dimension with a black-hole sky and no planet file pointing to it (docs/research/space/gtm-tiers.md:132; space-mods.md:23). journey.md:125 wants it used and uiv.md:94, :583 kept it for MAX. F1 adds the planet entry (`data/grindless/gcyr/planets/`, tier 14, no rocket offers it) and its relay-platform row. If GCYR refuses it (S0-1), F1 registers `grindless:sgr_a_orbit` with a copy of the sky settings; GCYR is LGPL, so the copy is credited. F1 fixes the id after S0-1 and it never changes.

**Site rules.**

- Every row of machines 5-8 carries `recipe.dimension(...)` for Sgr A* orbit; machine 9 for the belt. Older machines gain the site as a string row in their own table (OpV-S0-12 proved string sites).
- Sgr A* fluids and plasma (`hot_flow_plasma`) are processed where they are made; only items travel.
- No home recipe takes a Sgr A* or belt product before its substage (*Bootstrap check*). Controllers of far machines are built at home and carried.
- Sgr A* has no surface. Everything stands on the arrival platform or the shell's own frame; the platform's far ring seeds AE2 (uiv.md:677-679).
- **Places publication.** F1 adds `startup_scripts/grindless/max/travel.js` on the `opv/travel.js:10-17` pattern: `G.maxTravel` with `{dimension, circuit, jump, temperature}` per place and `T.tier = 14`.

## Bridges and first arrivals

**c14, Cygnus to Sgr A*.** The galactic-centre probe is OpV hardware, so it can be built before any MAX part exists:

- `gc_relay_probe` (T1; GTM `assembly_line` at VA[OpV], an OpV-stage travel item outside the MAX component rule): 1 `probe_seed` (OpV-R2, a copy made at Terzan 5), 1 `hawking_drive` (OpV-D3), 64 `gtceu:chain_strand_single_wire` (the magsail), 1 `tetron_array`, 1 `vitamin_kit`, 16 `metal_feedstock`, 8 `cluster_sinter_casing`, 4 `gtceu:opv_sensor` *(tune)*.
- Gate c14 in `tables/gate.json`: probe → `launched_gc_probe`, 2^33 EU/t (V[OpV] x 16 A) for 1,200 t *(tune)* on two OpV 16 A hatches at Cygnus X-1 orbit, keeping `sgr_a_chart`. This is OpV-S0-2's proven path.
- The probe crosses on the Hawking drive and brakes on its magsail in the Galactic Centre's hot, magnetised gas, which a magsail needs and a globular cluster lacks (Zubrin and Andrews 1991, JSR 28:197; opv.md route 6). Its seed unfolds the platform from the feedstock it carries: no matter from nothing (rules 1, 8).
- The relay row in `tables/relay_platforms.json` (source `grindless:cygnus_x1_orbit`) places the platform and grants `max-sgra`.

**c15, Sgr A* to the belt.** A warp gate is built at Sgr A* orbit (its controller carried) and fed by wireless:

- `nsc_belt_seed` (T2; assembly line at VA[MAX], MAX parts): 1 `probe_seed`, 1 `nsc_ephemeris` (imager c2), 1 `rydberg_logic_array`, 2 `grindless:max_robot_arm`, 2 `grindless:max_sensor`, 8 `metal_feedstock`, 4 `cluster_sinter_casing`, 2 `#gtceu:circuits/max`.
- Gate c15: seed → `launched_belt_seed`, 2^33 EU/t for 1,200 t on two OpV 16 A hatches at Sgr A* orbit; `uhv/gate.js:30-34` gains the Sgr A* site.
- The second hop restarts from a place that was itself reached by a relay (S0-11; OpV-S0-9 passed for Cygnus → Terzan 5).

**First arrival at each place:** the platform holds a ME far ring, a 9x9 deck, one wireless tower anchor and a chest with the substage book. Nothing else is given.

## Automatic resource generation

Rule 1 at MAX:

- **Hot flow.** The UXV disk skimmer at Sgr A* skims `hot_flow_plasma` from the radiatively inefficient flow (Yuan and Narayan 2014). It needs no hand. The flow is thin (n_e about 1e6 cm^-3 near the hole), so each row is slow and runs in parallel.
- **Planetesimals.** OpV's debris harvester takes a belt row and collects `nsc_planetesimal` by itself; the cluster-light furnace smelts them.
- **Waste.** Every older era's waste ends as `geroch_canister`: the waste retrieval plant and hot cell can it, the winch lowers it. The winch is the last destination of all waste (rule 3).
- **Energy.** The winch, the BZ and Penrose rows at Sgr A*, and the shell's vent mode run on stated fuels into wireless case 14.

Nothing is mined by hand. The platform's deck is not a quarry.

## Only from there, and cuts

| Only from | Products |
|---|---|
| Sgr A* orbit | `hot_flow_plasma`, `flux_loaded_frc`, `sgr_a_spin_map`, `nsc_ephemeris`, `max_penrose_payload` use, `stream_bundle`, `horizon_tether` proof, `shell_droplet_radiator`, accretion feeder power, the shell and its products |
| NSC belt | `nsc_planetesimal`, `metal_rich_bloom`, `segment_truss`, `stream_pellet`, `silicate_slag`, `iron_core_fragment` |
| SGR 1806−20 | `gtceu:horizon_strand` (drawn there) |
| Cygnus X-1 | `seed_wave_packet`, gate c14 |
| Home | components, circuits, hatches, membranes, gradiometers, Rydberg arrays, the genome archive |

**Cuts (F2).**

- GTM's own recipes for the 29 `gtceu:max_*` ids (hull, casing, hatches, buses, converters, buffers, charger, battery). Ours replace the hull, hatches and buses; converters, buffers, charger and battery keep GTM's shape with MAX parts (A4).
- GT--'s supracausal family: `gtnn:supracausal_processor`, `_assembly`, `_computer`, `_mainframe` and every `gtnn:supracausal_smd_*`, and `gtnn:max_wrap_circuit`. They are Java-registered, so `event.remove` finds none (OpV-S0-4). F2 locates the recipe source in the jar first; if it cannot be cut, it hides those routes from EMI and the obtain rule sees only ours (S0-8).
- `gtnn:component_assline_casing_max` and `gtmutils:max_64a_energy_converter` stay hidden (no MAX recipe).
- `gtceu:horizon_strand` auto-routes: wiremill, extruder, bender, assembler cable, macerator, arc furnace. Only our draw bench and PBO rows make it.
- No GTM fusion recipe at tier 14 is added (*Fusion*).

## Audit of the design against the rules

| Rule | How MAX meets it |
|---|---|
| 1 Nothing by hand | hot flow skimmed, planetesimals harvested, waste canned and lowered; no deck quarry |
| 2 Complexity, not quantity | 46 lines of at least 4 steps, 167 crossings, two hops, a 33-cube shell; times 1,200-4,800 t *(tune)*, never inflated |
| 3 Honest byproducts | each machine section lists byproducts; belt slag → L25 → accretion feeder fuel; all waste ends in the winch |
| 4 A multiblock that gains | each of the 10 has a route only it gives; the shell is the era's goal |
| 5 Quests | about 40 short English quests, small rewards, never gating (*Quests*) |
| 6 GTM wins | V[MAX] is 2^31 and a long; MAX ids are GTM's; no tier above MAX; no fusion tier 14 |
| 7 Bigger | more lines and crossings than OpV; fewer machines; every shortfall to the guideline enumerated item by item (*Considered and dropped*, open question 1) |
| 8 Power | five generators on stated fuels, balance 1.5-2.3x *(tune)*; case 14 stores, never makes |

**Count audit.** The *Lines* table sums to 232 steps and 167 crossings; the *Crossings* table sums by era to the same 167 on 71 distinct machines. A worker who drops a step or a crossing updates both tables in its handoff; the integrator re-sums them.

## Voltages, hull, hatches and controllers

**Voltages.** All values from GTValues.java (v7.5.3):

| Constant | MAX value | Type | Use |
|---|---|---|---|
| V[14] | 2,147,483,648 | long | gate rows (V x amps), cable voltage, wireless caps |
| VA[14] | 2,013,265,920 | int | every machine row |
| VH[14] | 1,073,741,824 | int | hull row, generators |
| VHA[14] | 1,006,632,960 | int | — |

**The 2^31 plan.**

1. Every machine row of every package is at most VA[MAX], so it fits an `int` and no older code path sees a long. Rows on older machines stay at their own tier or VA[MAX].
2. Long values appear only in new MAX scripts and `tables/gate.json`: c14 and c15 at 2^33 (V[OpV] x 16 A, two OpV 16 A hatches, proven by OpV-S0-2), and the shell's final recipe.
3. They are written as V x amps from `GTValues`, never as a literal: `GTValues.V[GTValues.MAX] * 16` in JS is a double, exact up to 2^53; the KubeJS builder takes it as `long` (S0-2).
4. The shell's final recipe: 2^35 EU/t (V[MAX] x 16 A) for 1,200 t *(tune)* = 41,231,686,041,600 EU, on two `gtceu:max_energy_input_hatch_16a`. The input buffer of one MAX 16 A hatch is V x 16 x 16 = 549,755,813,888 EU, a long (EnergyHatchPartMachine.java:54-60). The parallel EU sum is a long (EURecipeCapability.java:41-96). Two hatches give V[MAX] as the multiblock voltage, and 16 A each covers 2^35 by amperage. Not yet run (S0-2). **Fallback:** 2^33 for 4,800 t *(tune)* (same energy, OpV-proven path).
5. MAX parallel hatch: `(int) Math.pow(4, tier - EV)` = 4^10 = 1,048,576, int-safe (ParallelHatchPartMachine.java:37). M1 adds the id; it is our own (`grindless:max_parallel_hatch`; GTM has none at MAX), S0-6.

**Hull.** `gtceu:max_machine_hull` (GTM id; F2 cuts GTM's recipe; A0 adds ours): GCYM `large_assembler`, 1 `gtceu:max_machine_casing` + 2 `gtceu:horizon_strand_single_cable` + 2 `chain_lamina_stack` + 500 mB `superfluid_helium_3`, VH[MAX] for 200 t *(tune)*, on two OpV 4 A hatches. It needs no far product other than the strand, which comes from SGR (OpV place), so MAX's hull is the first MAX item and travel waits for nothing MAX. The casing is GTM's; F2 keeps its recipe shape and changes its plate to `gtceu:chain_strand` lamina (A4 row).

**Material.** `gtceu:horizon_strand` (F1, KubeJS material, wire and cable at V[MAX], 16 A, loss 1 *(tune)*; WireProperties.java:11 `voltage` is a long, :17). It is OpV chain strand clad in stable exotic matter and drawn at SGR: *named fiction*, a cable "near the maximal tension" c^4/4G (Gibbons 2002, Found Phys 32:1891), the limit no real material reaches. S0-3 proves the cable carries 16 A at V[MAX]; if the GTM wire cap stops it, the cable is an item only and power travels by wireless (case 14).

**Hatches.** All GTM ids (opv_ids.json:14): energy input and output 1/4/16 A, substation 64 A, buses, fluid hatches 1/4/9x, dual hatches, converters, buffers, charger, battery. A4 writes them from one table (`tables/max_parts.json`): each row = hull + `diamond_power_die` (energy family) or `superconducting_membrane` (fluid family) or `max_conveyor_module` (buses) + the matching sensor or emitter + `#gtceu:circuits/max` x2 + horizon strand cable. It meets the hatch rule (at least 2 tier components, highest circuit = MAX; kubejs_static.mjs rules :266-289). The cheapest MAX energy pair needs A3 (die, sensor); everything before runs on OpV hatches.

**Hatch and hull evidence.** Read from GTM v7.5.3 sources (session copies; *HT evidence* below), not the wiki:

- EnergyHatchPartMachine.java:54-60: input buffer V x 16 x A, output V x 64 x A, both `long` math.
- WorkableElectricMultiblockMachine.java:271-273: with two or more hatches of the top tier, the machine voltage is V[min(tier + 1, MAX)]; at MAX it stays V[MAX].
- RecipeHelper.java:54-66: a recipe's tier is `getTierByVoltage(EUt)`, so a 2^35 row shows as MAX.
- FusionReactorMachine.java:308: `registerFusionTier` is public static; MAX does not use it.

**Controllers.** Each controller is an `assembly_line` row with station research, VA[MAX] for 2,400 t *(tune)*, on GTM's assembly line with two OpV 4 A hatches (no OpV-M2 array needed). Base: `gtceu:max_machine_hull`, 4 `#gtceu:circuits/max` (8 for machines 5, 6 and 8), 1,000 mB `superfluid_helium_3`, plus:

| # | Controller | Research item | MAX components | Domain inputs |
|---|---|---|---|---|
| 1 | `gtceu:rydberg_array_works` | `tweezer_array_die` | 4 robot arm, 4 sensor, 2 field generator | `quantum_memory_node`, `cryo_photonic_interposer`, `tetron_array`, `cold_qualified_cell` |
| 2 | `gtceu:atom_interferometer_works` | `degenerate_sr_cartridge` | 4 emitter, 4 robot arm, 2 pump | `squeezed_light_chip`, `shequid_rotation_ref`, `atom_optics_modulator` |
| 3 | `gtceu:membrane_line` | `rebco_on_pbo_web` | 4 motor, 4 piston, 2 robot arm | `max_field_coil`, `gtceu:horizon_strand_single_cable`, `chain_lamina_stack` |
| 4 | `gtceu:gene_ark` | `encapsulated_genome_library` | 4 robot arm, 4 sensor, 2 fluid regulator | `rydberg_logic_array`, `superconducting_membrane`, `gtceu:horizon_strand_single_cable` |
| 5 | `gtceu:photon_ring_imager` | `sis_mixer` | 8 sensor, 4 emitter, 4 field generator | `imager_dish_panel`, `quantum_memory_node`, `rydberg_logic_array` |
| 6 | `gtceu:geroch_winch` | `horizon_tether` | 4 motor, 4 field generator, 4 piston | `exotic_composite_rotor`, `diamond_power_die`, `albedo_multilayer_panel`, `sc_magnetic_bearing` |
| 7 | `gtceu:mass_stream_injector` | `stream_pellet` | 4 field generator, 4 conveyor, 4 sensor | `max_field_coil`, `diamond_power_die`, `matter_wave_gradiometer` |
| 8 | `gtceu:mirror_shell` | `sgr_a_spin_map` | 8 field generator, 8 sensor, 8 emitter, 4 robot arm | `superconducting_membrane`, `stream_bundle`, `rydberg_logic_array` |
| 9 | `gtceu:cluster_light_furnace` | `nsc_ephemeris` | 4 pump, 4 fluid regulator, 2 field generator | `albedo_multilayer_panel`, `exotic_composite_rod`, `diamond_power_die`, `sealed_hearth_liner` |
| 10 | `gtceu:accretion_feeder` | `slag_pellet` | 4 field generator, 4 emitter, 4 sensor | `xuv_collector_panel`, `wolter_mirror_module`, `max_field_coil` |

Each has at least 8 tier components from at least 3 families and at least 4 tier circuits (kubejs_static.mjs rules :266-289). Machine 2 waits for no sensor, and machine 3 for no conveyor, sensor or field generator, because those components need machines 2 and 3 (*Bootstrap check*). The research item for machine 6 is `horizon_tether` (L20), made on the UHV tether ribbon works and the UXV stellar elevator (its Cygnus X-1 row); the tether wear row is on the winch itself. Machine 1 consumes `quantum_memory_node` but does not make it: L23 ends on older machines.

**Components.** `grindless:max_*` (F1 registers on the `uiv/uiv_components.js` pattern; GTM registers no MAX components). Recipes on GTM's `assembler` or `assembly_line` at VA[MAX] *(tune)*:

| Component | Core | Package | Needs |
|---|---|---|---|
| `max_electric_motor` | `max_field_coil` + `exotic_composite_rod` + `sc_magnetic_bearing` (L32) + 4 horizon strand single wire + 2 horizon strand cable | A2 | L9, L10, L32, A0 |
| `max_electric_pump` | motor + `exotic_composite_rotor` + `superfluid_he3_seal` (OpV) | A2 | motor |
| `max_electric_piston` | motor + `opv_harmonic_drive` + `laminated_terfenol_stack` (L35) + `exotic_composite_rod` | A2 | motor, L35 |
| `max_robot_arm` | 2 motor + piston + `#gtceu:circuits/max` | A2 | circuits (A1) |
| `max_emitter` | `squeezed_light_chip` + `cryo_optical_link` (OpV) + `max_optical_isolator` (L31) + `#gtceu:circuits/max` x2 | A2 | A1, L31 |
| `max_fluid_regulator` | pump + `superfluid_valve` (L41) + `#gtceu:circuits/max` x2 + `tetron_array` | A2 | pump, L41 |
| `max_conveyor_module` | 2 motor + `membrane_belt` | A3 | machine 3 (L11) |
| `max_sensor` | `matter_wave_gradiometer` + `#gtceu:circuits/max` x2 | A3 | machine 2 (L4) |
| `max_field_generator` | emitter + 2 `max_field_coil` + `superconducting_membrane` + `stable_exotic_matter` | A3 | machine 3 (L2) |

**Circuits.** `#gtceu:circuits/max` has one member: `gtnn:supracausal_mainframe`. A1 adds one recipe for it, on UEV's photonic integration hall (uev/photonics.js:88) at VA[MAX] *(tune)*: 2 `squeezed_light_chip` + 2 `tweezer_array_die` + 1 `cryo_photonic_interposer` + 4 `#gtceu:circuits/opv` + `tetron_array` + 2,000 mB `superfluid_helium_3`. GT--'s own processor, assembly, computer and SMD tiers are cut or hidden (F2, S0-8); MAX has one circuit, as GTM's ladder has one at the top.

## Machines

Format as in opv.md: what it gains, recipes, byproducts, structure (QR), crossings, risks, source. Tuning numbers are *(tune)*. Shapes are drawn by the machine's package on the `lib/patterns.js` pattern; dimensions are a guide.

### 1. Rydberg array works (home)

**Gains.** Neutral-atom logic: hundreds of atoms in optical tweezers, entangled by Rydberg blockade, run error-corrected logical qubits (Bluvstein 2024, Nature 626:58; Evered 2023, Nature 622:268). It is the only machine that makes `rydberg_logic_array` and `quantum_memory_node` use: the logic of the field generator's control, the imager and the shell.

**Recipes.** c1 `rydberg_logic_array`: `tweezer_array_die` + `atom_cartridge_rb87` (L19) + `squeezed_light_chip` + `quantum_memory_node` (L23, made on older machines) + `clock_locked_microcomb` (L29) + `uv_fibre_harness` (L40) + `crossed_aod_pair` (L46) + 1,000 mB superfluid He-3 → 1 array; VA[MAX], 1,200 t *(tune)*. c2 refurbish: `spent_rydberg_array` (the shell's c3 and the imager return one) + `atom_cartridge_rb87` → array; VA[MAX], 600 t *(tune)*. One product, one structure: the gain is that nothing older can trap and entangle atoms one by one.

**Byproducts.** Spent atom cartridges → `rb_getter_scrap` → calutron row (L19 recovers rubidium). Helium boil-off → helium refrigerator (LuV) row.

**Structure.** 9 x 7 x 9 *(tune)*: vibration-isolated table, `grindless:max_optical_table_casing` (F1) and GTM `gtceu:atomic_casing`, a vacuum chamber of horizon-strand coils. QR from MAX hatches or two OpV hatches.

**Crossings.** L19 (calutron, MOCVD, QGL); it consumes L23 (crystal growth, SHB, fibre draw), L29, L40, L43 (controller) and L46.

**Risks.** Item names can sound like a quantum computer that does everything; recipes stay a part maker.

**Source.** Kaufman and Ni 2021, Nat Phys 17:1324; Bluvstein 2024; Evered 2023.

### 2. Atom interferometer works (home)

**Gains.** Matter-wave sensing: a falling cloud of cold atoms split and recombined by light measures gravity gradients and rotation better than any other instrument (Rosi 2014, Nature 510:518; Asenbaum 2017, PRL 118:183602). It is the only source of `matter_wave_gradiometer`, the core of `max_sensor`, and of the shell's gradient map.

**Recipes.** c1 `matter_wave_gradiometer`: `degenerate_sr_cartridge` (L4) + `squeezed_light_chip` + `shequid_rotation_ref` + `atom_optics_modulator` (L4) + `cryo_reference_cavity` (L33) + 500 mB superfluid He-3; VA[MAX], 1,200 t *(tune)*. c2 calibration: gradiometer + `sgr_a_spin_map` → `shell_gradient_map` (G1 input; only after `max-sgra`).

**Byproducts.** `spent_sr_cartridge` → calutron row returns Sr-88 (B2). No waste.

**Structure.** 5 x 15 x 5 *(tune)*: a tall drop tower (10 m-class fountains are real; Asenbaum 2017), `max_optical_table_casing` and a magnetic shield of OpV `chain_lamina_stack` blocks (not membrane: machine 2 must not wait for machine 3).

**Crossings.** L4 (calutron, QGL, TFLN, SHeQUID); consumes L33.

**Risks.** A tall structure in a base; height is the point (drop time).

**Source.** Rosi 2014; Asenbaum 2017; Kasevich and Chu 1991, PRL 67:181.

### 3. Membrane line (home)

**Gains.** Roll-to-roll metres-wide atomically thin films: graphene grown on copper foil and transferred to polymer at 30-inch scale (Bae 2010, Nat Nano 5:574). At MAX it makes `superconducting_membrane` (REBCO on a PBO web over graphene, *named fiction* in its scale), `albedo_multilayer_panel` and `membrane_belt`: the skins of the shell, field generators and conveyors.

**Recipes.** c1 membrane (L2 last step), c2 albedo panel (L3 last step), c3 membrane belt (L11 last step); VA[MAX], 600-1,200 t *(tune)*. All three in one structure: that is its gain (several steps in one: growth, transfer, coating, lamination).

**Byproducts.** `spent_ferric_chloride` (copper-foil etchant) → extraction cascade row (copper back, B1). Trimmed edges → `membrane_scrap` → macerator → carbon dust.

**Structure.** 21 x 5 x 5 *(tune)*: a long line of rollers (`grindless:membrane_roller_casing`, F1) through a CVD zone and a cold zone.

**Crossings.** L2 (vdW, PBO, MOCVD, coated conductor, HTS), L3 (extraction, MTJ, zone refining, EB), L11 (PBO, EB, He fridge).

**Risks.** Roll-to-roll is the gain, not throughput: rows are not inflated.

**Source.** Bae 2010; Raman 2014, Nature 515:540 (radiative cooling multilayer).

### 4. Gene ark (home)

**Gains.** DNA as long-term storage: 5.27 Mbit written in DNA (Church 2012, Science 337:1628), error-coded (Goldman 2013, Nature 494:77) and kept in silica for millennia (Grass 2015, Angew Chem 54:2552). At MAX it holds every living line of the pack (biofoundry, organoid labs, ark biosphere, xenobotany) as `genome_archive`, one of the inputs of the last recipe: the seed of what comes after carries life.

**Recipes.** c1 `genome_archive` (L12 last step): 4 `encapsulated_genome_library` (aerogel works, L12 step 5) + `rydberg_logic_array` (the index) + `vitrified_cell_capsule` (L28: a minimal cell that can boot the archive, Gibson 2010, Science 329:52) + 1,000 mB superfluid He-3; VA[MAX], 2,400 t *(tune)*. c2 copy: 1 archive + 4 `synthetic_oligo_pool` → 2 archives (DNA is copied by PCR; Church 2012); VA[MAX], 1,200 t *(tune)*.

**Byproducts.** Spent nucleotide reagent → biofoundry row (recycled). Silica fines → glass dust.

**Structure.** 11 x 9 x 11 *(tune)*: sealed cold vault (`gtceu:sterilizing_filter_casing`, GTM) with a cryogenic core.

**Crossings.** L12 (biofoundry, organoid lab, aerogel, ark biosphere, xenobotany); consumes L28.

**Risks.** Sentiment: the archive is a recipe, not a story item. Quests keep text short.

**Source.** Church 2012; Goldman 2013; Grass 2015.

### 5. Photon ring imager (Sgr A* orbit)

**Gains.** The hole's photon ring, imaged at sub-ring resolution, gives its spin and the cluster's orbits (Johnson 2020, Sci Adv 6:eaaz1310; EHT 2022, ApJL 930:L12). c1 `sgr_a_spin_map`: the research item of the shell and an input of its last recipe. c2 `nsc_ephemeris`: aims gate c15.

**Recipes.** c1 4 `imager_dish_panel` + 2 `sis_mixer` + `photonic_lo_module` (L44) + 2 `cryo_lna_module` (L45) + `clock_locked_microcomb` (L29) + `quantum_memory_node` + `rydberg_logic_array` → `sgr_a_spin_map`; c2 `sgr_a_spin_map` (kept) + 2 `sis_mixer` → `nsc_ephemeris`; VA[MAX], 2,400 t *(tune)*; dimension Sgr A* orbit.

**Byproducts.** Spent mixers → `sis_scrap` → electron beam furnace row (niobium back, L22). c1 returns a `spent_rydberg_array` → Rydberg works c2.

**Structure.** 17 x 9 x 17 *(tune)*: a ring of dish panels on a truss, the SIS receivers in a mK core.

**Crossings.** L21 (SiC fibre, CVI, implanter, MTJ), L22 (MTJ, BEUV, mK cryostat), L44, L45; consumes L29.

**Risks.** "Data" products: each is a real item and an input, never a quest-only token.

**Source.** Johnson 2020; EHT 2022; GRAVITY 2019 (mass and distance).

### 6. Geroch winch (Sgr A* orbit, generator)

**Gains.** The Geroch engine: a box of mass lowered on a rope towards the horizon gives up almost all its rest energy as work at the top; buoyancy from the thermal atmosphere near the horizon (Unruh and Wald 1982, PRD 25:942) and the rope's strength limit (Gibbons 2002) keep it below 100%, and the entropy bound (Bekenstein 1973, PRD 7:2333) holds. In the pack it is the last destination of every waste canister and the first MAX generator.

**Recipes.** c1 generator: 1 `geroch_canister` (L17) → `spent_tether_segment` with chance 1/128 *(tune)* (tether wear); 2^30 EU/t (VH[MAX]) out for 2,400 t *(tune)* through two OpV 16 A dynamo hatches or a MAX dynamo (S0-4). c2 tether rework: `spent_tether_segment` + `horizon_tether` → `horizon_tether` (L20 continues). Dimension Sgr A* orbit.

**Balance.** A canister costs about 1.3e12 EU along L17 *(tune)*; c1 gives 2^30 x 2,400 = 2.58e12 EU: about 2.0x *(tune)*.

**Byproducts.** None returns: the canister crosses the horizon (that is honest: a black hole is the one destination where waste is not stored). Spent tether → c2.

**Structure.** 9 x 33 x 9 *(tune)*: a tall winch tower of `grindless:geroch_drum_casing` (F1) over a tether well. The tether is not modelled block by block.

**Crossings.** L17 (waste retrieval, hot cell), L20 (tether ribbon works, stellar elevator).

**Risks.** "Energy from a hole": the fuel is the canister and the tether wear; the energy is the canister's own rest energy (rule 8).

**Source.** Bekenstein 1973; Unruh and Wald 1982; Gibbons 2002.

### 7. Mass stream injector (Sgr A* orbit)

**Gains.** Dynamic support: a stream of pellets running round a closed loop, turned by magnets, holds a structure up with no material strong enough to hold it statically (Birch 1982, JBIS 35:475, orbital rings). The shell needs it: no material holds a 20 r_g shell round a 4.3e6 solar-mass hole. It makes `stream_bundle`, the support of the shell.

**Recipes.** c1 `stream_pellet` x64 + `max_field_coil` x4 + 4,000 mB `flux_loaded_frc` → 1 `stream_bundle`; VA[MAX], 1,200 t *(tune)*. c2 re-capture: `spent_stream_pellet` → `stream_pellet` with 7/8 return *(tune)*.

**Byproducts.** Ablated pellets → `spent_stream_pellet` (c2). FRC exhaust → plasma mass filter row.

**Structure.** 15 x 7 x 15 *(tune)*: a ring of `grindless:stream_turn_casing` (F1) magnets round a pellet accelerator of SRF cavities.

**Crossings.** L14 (megabar, SRF).

**Risks.** *Named fiction* at this scale (shell mass and pellet speeds are not modelled).

**Source.** Birch 1982; Lofstrom 1985 (launch loop) for the principle.

### 8. Mirror shell (Sgr A* orbit, generator and ending)

**Gains.** The black hole bomb: a reflecting shell round a spinning hole traps waves with frequency below m·Ω_H; each pass through the ergoregion amplifies them, so the energy grows until the mirror fails (Press and Teukolsky 1972, Nature 238:211; Cardoso 2004, PRD 70:044039; Zel'dovich 1971). It is the largest multiblock of the pack, the ending and a generator.

**Physics.** Sgr A*: M = 4.3e6 solar masses; GM/c^3 = 21.2 s; r_g = 6.35e9 m. Spin a = 0.9 is *pack fiction* (EHT 2024, ApJL 964:L25-L26 favour a spinning MAD but measure no exact a). Then r_+ = 1.436 r_g, Ω_H = a c / (2 r_+) ≈ 0.0148 rad/s, f = Ω_H / 2π ≈ 2.35 mHz, a wavelength of at least 1.27e11 m. A mirror must sit well beyond the wave's own size: at about 20 r_g (1.3e11 m, 0.85 AU). Rotational energy (1 − √((1 + √(1 − a²))/2)) Mc² = 15.3% Mc² ≈ 1.2e53 J. Starlight is negligible; the flow's luminosity of about 1e29 W gives about 4.9e5 W/m² (350 suns) at the shell, so the shell needs radiators. The plasma frequency (ω_p = 5.64e4 √n_e rad/s) is far above Ω_H, so the plasma itself reflects low-frequency light (Pani and Loeb 2013, PRD 88:041301; Conlon and Herdeiro 2018, PLB 780:169). That the shell clears its interior of plasma with the skimmer and mass filter rows is *named fiction*; the superconducting mirror is.

**Recipes.**

- c1 vent (generator): 1 `seed_wave_packet` (L18) → 2^30 EU/t out for 4,800 t *(tune)*; the packet's growth stops before it can burst the mirror (balance about 2.3x *(tune)*).
- c2 `final_spin_map`: `sgr_a_spin_map` + `shell_gradient_map` → `final_spin_map`; VA[MAX], 1,200 t.
- c3 **the last recipe** (*The ending*).

**Byproducts.** Vent: `spent_wave_packet` → nothing (the wave leaves as light; inert). Ablated segments → `mirror_shell_scrap` → cluster-light furnace row (returns truss).

**Structure.** About 33 x 33 x 33 *(tune)*, a hollow shell of `grindless:mirror_shell_segment` blocks (F1) round an empty core, with `grindless:stream_bundle_block` rings and the controller at its equator. A segment is truss + membrane + albedo panel + droplet radiator + `shell_cryocooler` (L30) + `segment_controller` (L38) + `halbach_segment_coupler` (L37), assembled on the UHV swarm segment foundry (uhv/swarm.js:67) as a new mode at VA[MAX] (G1 row; an assembly, so not a crossing; segments are blocks, so no circuit is required; casing exemption as in OpV). Thousands of segments: a structure built over hours, by AE2 and robots, not one at a time. Needs P (MAX_ROWS 64) and S0-7.

**Crossings.** L18 (clock lab, SRF, mK cryostat) and through its segment chain L13, L15, L30, L37, L38.

**Risks.** Server cost of a 33-cube scan (S0-7); a shape change after release goes in release notes.

**Source.** Press and Teukolsky 1972; Cardoso 2004; Brito, Cardoso and Pani 2015 LNP 906; Penrose 1969; Christodoulou 1970, PRL 25:1596.

### 9. Cluster-light furnace (NSC belt)

**Gains.** The planetesimals of the nuclear star cluster are metal-rich (supersolar metallicity; Do 2015; Feldmeier-Krause 2017). The furnace concentrates the cluster's starlight (*named fiction*: the light density of the inner parsec is a million times local) onto the rock and smelts it to `metal_rich_bloom` in one structure: heating, separation, casting. It is the only source of segment truss steel and stream pellets in quantity.

**Recipes.** c1 `nsc_planetesimal` x16 → `metal_rich_bloom` x4 + 8 `silicate_slag` (L25 step 1) + `pgm_residue` (L13 step 1, L42); c2 `segment_alloy_ingot` → `segment_truss_billet` (L13 step 4, light-heated rolling); c3 bloom → `pellet_blank` (L14 step 1); c4 `mirror_shell_scrap` → `segment_truss_billet`; c5 hearth relining: `sealed_hearth_liner` (L36) consumed with chance 1/32 *(tune)* per c1; VA[MAX], 600 t *(tune)*. Dimension NSC belt.

**Byproducts.** Slag is no longer voided: `silicate_slag` is devolatilised and pelletised (L25) into the accretion feeder's fuel (machine 10), with O2 and ferrosilicon returned on the way (rule 3). PGM residue → EV platinum plant (L13, L42). Volatiles vent (inert).

**Structure.** 13 x 9 x 13 *(tune)*: a concentrator bowl of albedo panels over a hearth of `cluster_sinter_casing` (OpV) lined with Ta-Hf-C (L36).

**Crossings.** Carries L13 (with carbonyl refinery, levitation melter, platinum plant), L14's step and L25's first step; consumes L36.

**Risks.** The "light density" claim is order-of-magnitude (Schödel 2014; Genzel 2010).

**Source.** Schödel 2014; Do 2015; Feldmeier-Krause 2017; Genzel, Eisenhauer and Gillessen 2010; Cedillos-Barraza 2016, Sci Rep 6:37962 (Ta-Hf-C melting point).

### 10. Accretion feeder (Sgr A* orbit, generator)

**Gains.** Accretion is the most efficient fuel burn known: matter that spirals in through a thin disk to the innermost stable circular orbit radiates the binding energy there, 1 − E_isco ≈ 15.6% of its rest mass at a = 0.9 (Bardeen 1970, Nature 226:64; Novikov and Thorne 1973; Bardeen, Press and Teukolsky 1972, ApJ 178:347). The feeder drops pelletised belt slag into a magnetically held ring just outside the ISCO and collects the ultraviolet and soft X-ray light it gives off. It is the only machine that turns inert slag into power, and the only one that needs a hole with a thin, cool ring: nothing older or at home can do it.

**Recipes.** c1 generator: 1 `slag_pellet` (L25) → 2^30 EU/t (VH[MAX]) out for 2,400 t *(tune)* through two OpV 16 A dynamo hatches or a MAX dynamo (S0-4); `xuv_collector_panel` (L26) worn with chance 1/64, `wolter_mirror_module` (L42) with 1/128 *(tune)*, each returning a `spent_collector_panel` / `spent_wolter_module`. c2 panel rework: `spent_collector_panel` + 2 `pin_diamond_plate` → `xuv_collector_panel`; VA[MAX], 600 t. Dimension Sgr A* orbit.

**Balance.** A pellet costs about 1.3e12 EU along L25 plus wear *(tune)*; c1 gives 2.58e12 EU: about 2.0x *(tune)*, the same as the winch. The burned mass is real fuel; the pack does not claim the 15.6% literally (rule 8: stated fuel, never energy from nothing).

**Byproducts.** None of the pellet returns: what is not radiated crosses the horizon. Spent panels → c2; spent Wolter modules → EV platinum plant row (iridium back, L42).

**Structure.** 15 x 9 x 15 *(tune)*: a ring of `grindless:feeder_coil_casing` (F1) with the collector panels on the inner face and a Wolter mirror stack at each quadrant.

**Crossings.** L25 (solar vapour furnace, regolith cell, SPS), L26 (diamond lattice fab, implanter, betavoltaic fab, MTJ, solar array fab), L42 (platinum plant, EB furnace, CVI, MTJ).

**Risks.** At game feed rates real matter would join the hot, radiatively inefficient flow, not a thin disk (Yuan and Narayan 2014): the cool, magnetically held ring is *named fiction*. S0-13 proves a fifth generator forms at Sgr A* and its output reaches case 14.

**Source.** Bardeen 1970; Novikov and Thorne 1973; Shakura and Sunyaev 1973, A&A 24:337; Weisskopf 2000, Proc SPIE 4012:2 (Wolter optics, iridium coating).

## Older machines in MAX

Rows on older machines are added to that machine's own table or script by the named package, at its pre-assigned circuit (*Circuits by type*), as DECISIONS.md:508 places older rows. Far rows carry their site as a string row. 78 older machines take rows (71 crossing, the Penrose engine, the photonic hall, the swarm segment foundry and 4 OpV machines); the rows added by the repair are listed after the table.

| Machine (era, file) | Rows (line step) | Site | Package |
|---|---|---|---|
| Pasta draw bench (UXV, uxv/vela_pasta.js:57) | horizon strand preform, wire (L1) | SGR 1806−20 | A0 |
| vdW stacking cell (UXV, uxv/spin_logic.js:56) | graphene/hBN film (L2) | home | B1 |
| MTJ sputter cluster (UXV, uxv/spin_deposition.js:37) | HfO2/SiO2 stack (L3), metalens coat (L6), Nb film (L7), diamond metallisation (L8), dish coat (L21), Nb/AlOx/Nb trilayer (L22) | home | A1, B1, A3, D2 |
| SHeQUID works (UXV, uxv/shequid_mnt.js:36) | rotation reference (L4), composite spin balance (L10) | home | A2, B2 |
| Accretion disk skimmer (UXV, uxv/cygnus_disk.js:37) | hot flow (L16) | Sgr A* | D1 |
| Plasma mass filter (UXV, uxv/cygnus_lift.js:51) | filtered hot flow (L16); FRC exhaust return | Sgr A* | D1 |
| FRC former (UXV, uxv/cygnus_disk.js:51) | flux-loaded FRC (L16) | Sgr A* | D1 |
| BZ dynamo (UXV, uxv/cygnus_disk.js:68) | generator on flux-loaded FRC (L16) | Sgr A* | D1 |
| Stellar elevator (UXV, uxv/cygnus_lift.js:35) | proof-loaded ribbon (L20) | Cygnus X-1 | D3 |
| TFLN fab (UIV, uiv/tfln_femtosecond.js:60) | atom-optics modulator (L4), PPLN film (L5), transducer wafer (L7) | home | A1, B2 |
| Femtosecond writer (UIV, :65) | squeezer waveguide (L5), droplet nozzle plate (L15) | home | A1, D1 |
| BEUV scanner (UIV, uiv/beuv_stm.js:53) | metalens mask (L6), SIS junction wafer (L22) | home | A1, D2 |
| Millikelvin cryostat (UIV, uiv/memories_cryostat.js:57) | interposer calibration (L7), cooled cavity mode (L18), SIS test (L22) | home | A1, D2, G1 |
| Spectral hole burner (UIV, :51) | burned memory crystal (L23) | home | B3 |
| Levitation melter (UIV, uiv/levitation_melter.js:47) | segment alloy ingot (L13) | home | R1 |
| Droplet radiator works (UIV, uiv/matrioshka.js:83) | shell droplet radiator (L15) | Sgr A* | D1 |
| Penrose engine (UIV, uiv/cygnus.js:50) | generator on `max_penrose_payload` (L24 use) | Sgr A* | D1 |
| Calutron (UEV, uev/isotopes.js:69) | Sr-88 (L4), Rb-87 (L19); spent cartridge returns | home | B2, B3 |
| Quantum gas lab (UEV, uev/earth_orbit.js:40) | degenerate Sr cartridge (L4), tweezer calibration (L6), Rb-87 cartridge (L19) | Earth orbit | A1, B2, B3 |
| SNSPD foundry (UEV, uev/photonics.js:66) | squeezed-light chip (L5) | home | A1 |
| Photonic integration hall (UEV, uev/photonics.js:88) | `gtnn:supracausal_mainframe` join | home | A1 |
| SiC fibre plant (UEV, uev/composites.js:69) | SiC tow (L10), mirror tow (L21) | home | A2, D2 |
| CVI furnace (UEV, uev/composites.js:74) | coil former (L9), SiC/SiC preform (L10), dish blank (L21) | home | A2, D2 |
| Electron beam furnace (UEV, uev/electron_beam.js:78) | hafnia target (L3), wear coat (L11); SIS scrap return | home | B1, D2 |
| Carbonyl refinery (UEV, uev/barnard.js:65) | Fe-Ni carbonyl powder (L13) | its UEV site | R1 |
| Megabar press (UEV, uev/megabar.js:46) | payload core (L24), dense pellet (L14) | its UEV site | D1, D4 |
| Degenerate harvester (UEV, uev/sirius.js:44) | degenerate matter slug (L24) | Sirius B | D1 |
| PBO plant (UHV, uhv/elevator.js:31) | strand braid sleeve (L1), carrier web (L2), belt web (L11) | home | A0, B1 |
| Tether ribbon works (UHV, uhv/elevator.js:33) | strand ribbon (L20) | home | D3 |
| Crystal growth furnace (UHV, uhv/crystals.js:78) | PPLN boule (L5), quartz wafer (L6), Eu:YSO boule (L23) | home | A1, B3 |
| Nuclear clock lab (UHV, uhv/crystals.js:67) | clock reference (L18) | home | G1 |
| MBE reactor (UHV, uhv/photonics.js:76) | piezo optomechanical layer (L7) | home | A1 |
| SiC device fab (UHV, uhv/power_devices.js:66) | diamond power wafer (L8) | home | A3 |
| Spark plasma sinterer (UHV, uhv/propulsion.js:31) | composite billet (L10), collector shell (L15), payload casing (L24) | home | A2, D1 |
| Xenobotany greenhouse (UHV, uhv/proxima_life.js:121) | xeno genome set (L12) | Proxima b | B4 |
| MOCVD reactor (UV, uv/photonics.js:33) | buffered web (L2), pump laser die (L5), AlN wafer (L7), Rydberg laser die (L19) | home | A1, B1, B3 |
| Fibre draw tower (UV, uv/photonics.js:31) | memory fibre pigtail (L23) | home | B3 |
| Zone refining tower (UV, uv/detectors.js:25) | ultrapure silica target (L3) | home | B1 |
| SRF cavity works (UV, uv/cold.js:28) | SC-jacketed pellet (L14), MAX SRF cavity (L18) | home | D4, G1 |
| Ark biosphere (UV, uv/life.js:27) | ark genome set (L12) | home | B4 |
| Diamond lattice fab (ZPM, zpm/qubits.js:46) | power diamond plate (L8) | home | A3 |
| Ion implanter (ZPM, zpm/qubits.js:54) | boron delta doping (L8), ion-beam figuring (L21) | home | A3, D2 |
| Aerogel works (ZPM, zpm/outer_chemistry.js:50) | encapsulated genome library (L12) | home | B4 |
| Waste retrieval plant (ZPM, zpm/actinides.js:34) | retrieved waste mix (L17) | home | D3 |
| Coated conductor line (LuV, luv/coated_conductor_line.js:53) | REBCO on PBO web (L2), MAX tape (L9) | home | A2, B1 |
| HTS magnet works (LuV, luv/hts_magnet_works.js:46) | pinned REBCO web (L2), coil winding (L9) | home | A2, B1 |
| Helium refrigerator (LuV, luv/helium_refrigerator.js:51) | cryo-conditioned web (L11) | home | B1 |
| Biofoundry (LuV, luv/biofoundry.js:48) | oligo pool (L12) | home | B4 |
| Organoid lab (LuV, luv/orbital_biology.js:8) | organoid genome extract (L12) | its LuV site | B4 |
| Hot cell (IV, iv/hot_cell.js:53) | vitrified waste log (L17) | home | D3 |
| Extraction cascade (EV, ev/extraction_cascade.js:54) | hafnia (L3), Sn-Li eutectic (L15) | home | B1, D1 |
| Platinum plant (EV, ev/platinum_plant.js:65) | PGM residue from bloom (L13) | home | R1 |
| Strangelet vault (OpV-D2) | exotic cladding foil (L1) | home | A0 |
| Kugelblitz forge (OpV-D3) | seed wave packet (L18) | Cygnus X-1 | G1 |
| Debris harvester (OpV-R1) | `nsc_planetesimal` | NSC belt | R1 |
| Replication refinery (OpV-R2) | `metal_feedstock` at the belt | NSC belt | R1 |

"Its UEV site", "its LuV site": the worker reads the machine's current dimension rule and keeps it; items travel.

**Rows added by the repair** (L17's vault step, L25-L46, the segment mode). Format: line (package). All at home unless a site is named.

| Machine | New rows |
|---|---|
| MTJ (UXV) | L26 (E1), L38 (H1), L42 (E1), L43 (B3), L46 (B3) |
| SHeQUID (UXV); oxide PLD (UXV, uxv/spin_deposition.js:52) | L41 (A2); L27 (W), L39 (A4) |
| YIG LPE (UXV, uxv/spin_logic.js:70); racetrack fab (:63) | L31 (A2); L38 (H1) |
| TFLN (UIV); femtosecond writer (UIV) | L31 (A2), L46 (B3); L29 (B3), L31 (A2), L40 (B3), L43 (B3) |
| BEUV (UIV); mK cryostat (UIV) | L29 (B3), L44 (D2), L45 (D2); L41 (A2) |
| Levitation melter (UIV); decay heat vault (UIV, uiv/rx_j1856.js:91) | L30 (H1), L35 (A2); L17 (D3) |
| CVI (UEV); EB furnace (UEV) | L36 (R1), L42 (E1); L42 (E1) |
| Nitride magnet works (UEV, uev/composites.js:64) | L31 (A2), L32 (A2), L37 (R1) |
| Single crystal foundry (UEV, uev/electron_beam.js:88) | L32 (A2), L34 (B1), L35 (A2) |
| Crystal growth (UHV); MBE (UHV) | L33 (B2), L38 (H1), L45 (D2), L46 (B3); L33 (B2), L45 (D2) |
| SiC device fab (UHV); SPS (UHV); clock lab (UHV) | L38 (H1); L25 (E1), L36 (R1); L29 (B3) |
| Solar vapour furnace (UHV, uhv/mercury.js:79); betavoltaic fab (uhv/betavoltaics.js:67); solar array fab (uhv/power_devices.js:77) | L25 (E1); L26 (E1); L26 (E1) |
| Xenobiochem plant (uhv/proxima_life.js:133); radiotrophic vat (:145) | L28 (B4), site kept; L28 (B4), site kept |
| Photonic foundry (uhv/photonics.js:88); high flux reactor (uhv/transcurium.js:61) | L29 (B3), L44 (D2); L32 (A2) |
| Swarm segment foundry (uhv/swarm.js:67) | segment mode (G1; an assembly, not a crossing) |
| MOCVD (UV); zone refining (UV); fibre draw (UV) | L29 (B3), L44 (D2); L40 (B3), L43 (B3); L40 (B3) |
| Superfluid helium plant (UV, uv/cold.js:240) | L30 (H1) |
| Diamond lattice fab (ZPM); implanter (ZPM); aerogel works (ZPM) | L26 (E1); L26 (E1); L28 (B4), L41 (A2) |
| Magnet works (zpm/magnet_works.js:238); vent bioreactor (zpm/outer_chemistry.js:43); plasma quench caster (zpm/fusion.js:184) | L27 (W); L28 (B4), site kept; L30 (H1) |
| Coated conductor (LuV); HTS works (LuV) | L27 (W), L39 (A4); L27 (W), L39 (A4) |
| He refrigerator (LuV); biofoundry (LuV) | L27 (W), L33 (B2), L39 (A4), L43 (B3), L45 (D2); L28 (B4) |
| Asteroid processor (LuV, luv/asteroid_belt.js:378) | L37 (R1), NSC belt string row |
| Extraction cascade (EV); platinum plant (EV) | L30 (H1), L32 (A2), L34 (B1), L35 (A2), L36 (R1); L42 (E1) |
| Regolith cell (ev/regolith_cell.js:118); hot strip mill (ev/combined_cycle_and_hot_mill.js:237); cryogenic plant (ev/cryogenic_plant.js:260) | L25 (E1); L34 (B1); L37 (R1) |

## The MAX family

Nine components (`grindless:max_*`), one circuit (`gtnn:supracausal_mainframe`), the hull and 29 GTM parts, one parallel hatch (`grindless:max_parallel_hatch`, M1), one cable (`gtceu:horizon_strand`), case 14 wireless (W). No basic single-block machines: GTM registers none at MAX and adding them would be padding (rule 7, convenience versions do not count).

## Reserve for MAX+

MAX is the last GTM tier, so MAX+ means content after the ending, not a new voltage. Kept, unused:

- `grindless:universe_seed` (the last recipe's output): a hook for a MAX+ chapter or pack.
- Intergalactic travel (Andromeda, the Magellanic Clouds), the hyper stargate (journey.md:139), hypervelocity stars as couriers: MAX+.
- Sgr A*'s magnetar (SGR J1745−2900), the PeVatron, the Fermi bubbles: listed under *Considered and dropped* and free for MAX+.
- GT--'s `gtnn:component_assline_casing_max` and `gtmutils:max_64a_energy_converter`: hidden, not removed (save rule).

## Considered and dropped

Machines (14 short of the guideline of 24; each one named):

1. **GKP photonic state fab** (Bourassa 2021, Quantum 5:392). A second route to OpV's photonic logic (rule 3).
2. **Squeezed-light works.** The chip is needed before any MAX machine exists (circuits), so it is line L5 on older machines.
3. **Segment foundry.** A segment is an assembly of seven line products; the UHV swarm segment foundry takes a mode (G1). An assembly machine gains nothing.
4. **Zel'dovich rig** (Cromb 2020, Nat Phys 16:1069). Its output is a measurement: a data chain.
5. **Tidal mill.** The tidal gradient 2GM/r^3 is 4.5e-3 s^-2 at r_g and 5.6e-7 s^-2 at the shell's 20 r_g, below Earth's own 3.1e-6 s^-2: nothing to mill with.
6. **Pilot black hole bomb at Cygnus X-1.** A second ending and a second route to the vent.
7. **Redshift clock array.** Clocks near the hole measure redshift: data.
8. **Wolf-Rayet wind scoop** (IRS 16 stars). A second route to UXV's gas products.
9. **SGR J1745−2900 magnetar station** (Mori 2013, ApJL 770:L23). OpV already has a magnetar (SGR 1806−20); MAX+ reserve.
10. **PeVatron proton harvester** (HESS 2016, Nature 531:476). Energy from a field with no fuel (rule 8).
11. **Hypervelocity star courier / Hills launcher** (Hills 1988, Nature 331:687). Travel out of the galaxy: MAX+.
12. **Dark-matter spike detector, monopole catcher, axion haloscope.** Nothing detected: unproven physics, or data only.
13. **Circumnuclear disk, minispiral or tidal-disruption gas scoop.** A second route to hot flow and to UXV's gas.
14. **Cluster starlight net** in the inner parsec. Energy with no fuel (rule 8); the furnace already uses that light as a process.

Also considered and turned into something else, so not in the 14: a cold core mill (the asteroid processor, cryogenic plant and GTM separator do it: L37); a hot-flow diverter (a skimmer row); a microcomb foundry and a SMES works (lines L29, L27 on older machines); a BSW collider (Bañados, Silk and West 2009, PRL 103:111102: high collision energy, no product); a mass driver (logistics); a plasmoid catcher (a second route to the FRC); the Fermi bubble collector (MAX+); a MAX mega member (*Nothing one at a time*), laser hatches (GTM registers none) and a MAX fusion tier (*Fusion*).

Lines (22 short of 68). Each names the crossings it would have brought; they sum to 47, which covers the 45 missing (212 − 167).

| # | Candidate | Would cross | Cr | Why not |
|---|---|---|---|---|
| 1 | Supracausal SMD chain | MTJ, BEUV, SiC fab | 3 | GT--'s family is cut (F2); one circuit at the top, as GTM's ladder |
| 2 | Th-229 clock crystal | transuranium facility, crystal growth, clock lab | 3 | second route: UHV makes `thorium_229` (uhv/foundation.js:13, tables/transcurium.json:120), OpV `th229_lasing_crystal` (opv/foundation.js:38) |
| 3 | GKP state chain | TFLN, femto, SNSPD | 3 | machine 1 dropped; second route to OpV's photonic logic |
| 4 | Hot-flow D and He-3 line | calutron, cryogenic plant, superfluid He plant | 3 | the flow is H and He; OpV already supplies superfluid He-3 |
| 5 | NSC per-element refinement (Ni, Co, Cu) | carbonyl refinery, extraction cascade, levitation melter | 3 | the bloom feeds refineries whose lines count in their own eras: second route |
| 6 | Sc-V-Y refinery | extraction cascade, zone refining | 2 | the enhancement (Do 2018, ApJL 855:L5) is contested as a line-modelling effect (Thorsbro 2018, ApJL 866:52) |
| 7 | Hydride superconductor wire (Drozdov 2019, Nature 569:528) | megabar press, MTJ | 2 | superconducts only near 170 GPa; no ambient wire: unproven |
| 8 | Hf-178m2 isomer cell | calutron, high flux reactor | 2 | triggered release not reproduced (Ahmad 2001, PRL 87:072503); rule 8 |
| 9 | Sgr A* flare log (Genzel 2003, Nature 425:934) | SNSPD, mK cryostat | 2 | data |
| 10 | S2 orbit ephemeris (GRAVITY 2018, A&A 615:L15) | clock lab, fibre draw | 2 | data; imager c2 already aims c15 |
| 11 | Seed packet from home cavities | SRF works, mK cryostat | 2 | second route to L18 |
| 12 | Stream pellet recovery chain | plasma mass filter, megabar press | 2 | second route to L14; injector c2 returns 7/8 |
| 13 | Tether repair chain | tether ribbon works, stellar elevator | 2 | second route to L20; winch c2 |
| 14 | Genome archive via the organoid array (UHV) | organoid array, aerogel works | 2 | second route to L12 |
| 15 | Separate rotor line | SPS, SHeQUID | 2 | shares L10's billet |
| 16 | MAX chemical battery cell | extraction cascade, SPS | 2 | the MAX battery stores in the SMES toroid (L27) |
| 17 | Per-era waste canister variants | waste retrieval, decay heat vault | 2 | one canister (L17) takes all waste |
| 18 | MAX coolant line (He-3/He-4 dilution) | superfluid He plant, He refrigerator | 2 | OpV's superfluid He-3 is enough: padding |
| 19 | Minispiral gas line | disk skimmer, plasma mass filter | 2 | second route to hot flow (machine 13) |
| 20 | Membrane recycling chain | EB furnace, coated conductor | 2 | a macerator row returns carbon; a chain would remake L2 |
| 21 | Horizon strand plate and foil | megabar press | 1 | no consumer |
| 22 | Segment, probe and seed assemblies | swarm segment foundry | 1 | assemblies, not feedstock |
| | **Total** | | **47** | |

## Power

Generous, never free (rule 8). MAX adds no fusion and no free source; every generator burns a stated fuel. Balance = EU out / EU in along its line, aimed at 1.3-2.5x *(tune)* (OpV aimed at 1.4-2.0x).

| Generator | Place | Fuel | Output | Balance |
|---|---|---|---|---|
| Geroch winch c1 | Sgr A* | `geroch_canister` (L17) + tether wear 1/128 *(tune)* | 2^30 EU/t x 2,400 t | ~2.0x *(tune)* |
| BZ dynamo, Sgr A* row | Sgr A* | 1,000 mB `flux_loaded_frc` (L16) | 2^30 EU/t x 1,200 t | ~1.6x *(tune)* |
| Penrose engine, Sgr A* row | Sgr A* | `max_penrose_payload` (L24) | 2^29 EU/t x 2,400 t | ~1.5x *(tune)* |
| Mirror shell c1 vent | Sgr A* | `seed_wave_packet` (L18) | 2^30 EU/t x 4,800 t | ~2.3x *(tune)* |
| Accretion feeder c1 | Sgr A* | `slag_pellet` (L25) + panel 1/64 and Wolter 1/128 wear *(tune)* | 2^30 EU/t x 2,400 t | ~2.0x *(tune)* |

- **Hatch path.** Generator output ≤ VH[MAX] = 2^30 per recipe, which two OpV 16 A dynamo hatches carry (V[OpV] x 16 = 2^33 per hatch). A MAX dynamo (`gtceu:max_energy_output_hatch_16a`) path is used only if S0-4 shows a GTM generator multiblock emits at MAX; otherwise rows stay at 2^30 and output through OpV dynamos.
- **Wireless case 14.** W adds `case 14` to the tier switch on the `lv/wireless_energy.js:305` pattern. Cap = V[MAX] x A x 10 (long): 2 A 42,949,672,960; 4 A 85,899,345,920; 16 A 343,597,383,680; 64 A 1,374,389,534,720 (S0-5 for 64 A). Cell `grindless:max_smes_cell` 64,424,509,440,000 EU *(tune)* (1.56 times the shell's last recipe; *The ending*). Link `grindless:horizon_strand_repeater`. Rows in `tables/wireless_energy.json`.
- **Physics.** The Sgr A* rows draw on real reservoirs: the hole's rotational energy (about 1.2e53 J at a = 0.9, *pack fiction* spin), the flow's magnetic flux (MAD, EHT 2024) and mass-energy lowered to the horizon (Geroch) and accreted belt slag (at most 15.6% of rest mass at a = 0.9; Novikov and Thorne 1973). The Penrose process gives at most 20.7% of the fragment's energy (Penrose 1969; Christodoulou 1970; Wald 1974, ApJ 191:231).

## Fusion

None at tier 14. FusionReactorMachine.java:308 would allow `registerFusionTier(14, ...)`, but GTM's fusion ladder stops before MAX, a tier-14 fusion reactor would need a casing, coil and controller set we would invent whole, and MAX already has five fuels on horizon physics. Rule 6.

## Nothing one at a time

- MAX parallel hatch x1,048,576 (M1; 4^10; `lib/parallel_hatch.js:81` levels, :85 tier ids, :103 accepted tiers gain 14). Every multiblock that accepts a parallel hatch takes it; the mega family needs no MAX member (open question 4).
- Segments are made in batches of 64 *(tune)* and placed by AE2 and robots; the shell is never built one block by hand.
- Long rows (1,200-4,800 t) run in parallel; quantities are not inflated (rule 2).

## AE2

Unchanged. The platforms' ME far rings seed AE2 at Sgr A* and the belt (uiv.md:677-679). No new storage tier: GT--/AE2 cells already cover the volumes.

## Lines

Each step is a real transformation (≥4 per line). Cr counts crossings with UXV-and-older machines; OpV, GTM and MAX machines are steps but not crossings.

| # | Line | Steps (machine → product) | Steps | Cr | Package |
|---|---|---|---|---|---|
| L1 | Horizon strand cable | OpV vault → `exotic_cladding_foil`; GTM assembler → `clad_chain_strand`; draw bench c5 (SGR) → `horizon_strand_preform`; draw bench c6 → `gtceu:horizon_strand_single_wire`; PBO plant → `pbo_braid_sleeve`; GTM assembler → `gtceu:horizon_strand_single_cable` | 6 | 2 | A0 |
| L2 | Superconducting membrane | vdW cell → `graphene_hbn_film`; PBO plant → `pbo_carrier_web`; MOCVD → `buffered_pbo_web`; coated conductor → `rebco_on_pbo_web`; HTS works → `pinned_rebco_web`; membrane line c1 → `superconducting_membrane` | 6 | 5 | B1 |
| L3 | Albedo multilayer panel (Raman 2014) | extraction cascade → `hafnia_powder`; zone refining → `ultrapure_silica_target`; EB furnace → `hafnia_target`; MTJ → `hfo2_sio2_stack`; membrane line c2 → `albedo_multilayer_panel` | 5 | 4 | B1 |
| L4 | Matter-wave gradiometer | calutron → `sr88_isotope`; QGL → `degenerate_sr_cartridge`; TFLN → `atom_optics_modulator`; SHeQUID → `shequid_rotation_ref`; interferometer c1 → `matter_wave_gradiometer` | 5 | 4 | B2 |
| L5 | Squeezed-light chip (Nehra 2022, Science 377:1333; Vahlbruch 2016, PRL 117:110801) | crystal growth → `ppln_boule`; TFLN → `ppln_thin_film_wafer`; femto → `squeezer_waveguide_die`; MOCVD → `pump_laser_bonded_die`; SNSPD foundry → `squeezed_light_chip` | 5 | 5 | A1 |
| L6 | Tweezer array die (Kaufman and Ni 2021) | crystal growth → `quartz_crystal_wafer`; BEUV → `metalens_wafer`; MTJ → `coated_metalens`; QGL → `tweezer_calibrated_lens`; GTM laser engraver → `tweezer_array_die` | 5 | 4 | A1 |
| L7 | Cryo photonic interposer (Mirhosseini 2020, Nature 588:599) | MOCVD → `aln_on_si_wafer`; MTJ → `nb_coplanar_film`; MBE → `piezo_optomech_layer`; TFLN → `transducer_wafer`; mK cryostat → `cryo_photonic_interposer` | 5 | 5 | A1 |
| L8 | Diamond power die (Donato 2020, J Phys D 53:093001) | diamond lattice fab → `power_diamond_plate`; implanter → `boron_delta_diamond`; MTJ → `metallised_diamond`; SiC fab → `diamond_power_wafer`; GTM cutter → `diamond_power_die` | 5 | 4 | A3 |
| L9 | MAX field coil | coated conductor → `rebco_tape_max`; GTM chemical bath (electroplated copper stabiliser) → `stabilised_rebco_tape`; CVI → `cmc_coil_former`; HTS works → `max_coil_winding`; GTM assembler (+ strand) → `max_field_coil` | 5 | 3 | A2 |
| L10 | Exotic composite rod and rotor | SiC fibre → `sic_tow`; CVI → `sic_sic_preform`; GTM chemical reactor (+ `stable_exotic_matter`) → `exotic_infiltrated_preform`; SPS → `exotic_composite_billet`; SHeQUID → `balanced_composite_billet`; GTM lathe / forming press → `exotic_composite_rod` / `exotic_composite_rotor` | 6 | 4 | A2 |
| L11 | Membrane belt | PBO plant → `pbo_belt_web`; GTM chemical bath (silane adhesion primer) → `primed_belt_web`; EB furnace → `refractory_wear_coat`; He refrigerator → `cryo_conditioned_web`; membrane line c3 → `membrane_belt` | 5 | 3 | B1 |
| L12 | Genome archive (Church 2012; Goldman 2013; Grass 2015) | biofoundry → `synthetic_oligo_pool`; organoid lab → `organoid_genome_extract`; ark biosphere → `ark_genome_set`; xenobotany → `xeno_genome_set`; aerogel works → `encapsulated_genome_library`; gene ark c1 → `genome_archive` | 6 | 5 | B4 |
| L13 | Segment truss | cluster-light furnace c1 → `metal_rich_bloom` (+ `pgm_residue` → platinum plant); carbonyl refinery → `carbonyl_fe_ni_powder`; levitation melter → `segment_alloy_ingot`; furnace c2 → `segment_truss_billet`; GTM extruder → `segment_truss` | 5 | 3 | R1 |
| L14 | Stream pellets | furnace c3 → `pellet_blank`; megabar → `dense_pellet`; GTM lathe (turned to the injector bore) → `turned_pellet_core`; SRF works → `sc_jacketed_pellet`; GTM canner → `stream_pellet` | 5 | 2 | D4 |
| L15 | Shell droplet radiator | extraction cascade → `sn_li_eutectic`; femto → `droplet_nozzle_plate`; SPS → `radiator_collector_shell`; droplet works (Sgr A*) → `shell_droplet_radiator` | 4 | 4 | D1 |
| L16 | Hot flow to flux-loaded FRC | skimmer (Sgr A*) → `hot_flow_plasma`; mass filter → `filtered_hot_flow`; FRC former → `flux_loaded_frc`; BZ dynamo burns it → EU + `cooled_exhaust` (→ mass filter) | 4 | 4 | D1 |
| L17 | Geroch canister | waste retrieval → `retrieved_waste_mix`; decay heat vault (UIV, uiv/rx_j1856.js:91) → `cooled_waste_mix`; hot cell → `vitrified_waste_log`; GTM canner (+ `chain_lamina_stack`) → `sealed_waste_log`; GTM assembler (+ strand) → `geroch_canister` | 5 | 3 | D3 |
| L18 | Seed wave packet | clock lab → `thorium_clock_reference`; SRF works → `max_srf_cavity`; GTM chemical bath (electropolish, as real niobium cavities) → `polished_srf_cavity`; mK cryostat → `cooled_cavity_mode`; Kugelblitz forge (Cygnus) → `seed_wave_packet` | 5 | 3 | G1 |
| L19 | Rydberg logic array | calutron → `rb87_isotope`; MOCVD → `rydberg_laser_die`; QGL → `atom_cartridge_rb87`; Rydberg works c1 → `rydberg_logic_array` | 4 | 3 | B3 |
| L20 | Horizon tether | tether ribbon works → `strand_ribbon`; stellar elevator (Cygnus) → `proof_loaded_ribbon`; GTM chemical bath (+ `stable_exotic_matter`) → `exotic_coated_ribbon`; GTM autoclave (cures the coating) → `cured_exotic_ribbon`; GTM assembler → `horizon_tether` | 5 | 2 | D3 |
| L21 | Imager dish panel | SiC fibre → `sic_mirror_tow`; CVI → `sic_dish_blank`; implanter → `figured_dish_blank`; MTJ → `gold_coated_dish`; GTM assembler → `imager_dish_panel` | 5 | 4 | D2 |
| L22 | SIS mixer | MTJ → `nb_alox_nb_trilayer`; BEUV → `sis_junction_wafer`; GTM chemical bath (selective niobium anodisation) → `anodised_junction_wafer`; GTM cutter → `sis_die`; mK cryostat → `tested_sis_die`; GTM assembler → `sis_mixer` | 6 | 3 | D2 |
| L23 | Quantum memory node | crystal growth → `eu_yso_boule`; GTM cutter (oriented slab) → `eu_yso_slab`; SHB → `burned_memory_crystal`; fibre draw → `memory_fibre_pigtail`; GTM assembler → `quantum_memory_node` | 5 | 3 | B3 |
| L24 | Penrose payload | degenerate harvester → `degenerate_matter_slug`; megabar → `compressed_payload_core`; GTM lathe (turned to the capture bore) → `turned_payload_core`; SPS → `payload_casing`; GTM assembler → `max_penrose_payload` (burnt in the Penrose engine, Sgr A*) | 5 | 3 | D1 |
| L25 | Slag pellet (feeder fuel) | furnace c1 (belt) → `silicate_slag`; solar vapour furnace (UHV, uhv/mercury.js:79) → `devolatilised_slag`; regolith cell (EV, ev/regolith_cell.js:118; O2 and ferrosilicon out) → `ca_al_oxide_residue`; GTM compressor → `slag_compact`; SPS → `slag_pellet` | 5 | 3 | E1 |
| L26 | XUV collector panel | diamond lattice fab → `collector_diamond_plate`; implanter → `pin_diamond_plate`; betavoltaic fab (UHV, uhv/betavoltaics.js:67) → `diamond_photocell`; MTJ → `metallised_photocell`; solar array fab (UHV, uhv/power_devices.js:77) → `xuv_collector_panel` | 5 | 5 | E1 |
| L27 | SMES toroid | coated conductor → `smes_buffered_tape`; oxide PLD (UXV, uxv/spin_deposition.js:52) → `thick_rebco_tape`; HTS works → `smes_toroid_winding`; magnet works (ZPM, zpm/magnet_works.js:238) → `braced_smes_toroid`; He refrigerator → `cold_smes_toroid` (→ `max_smes_cell`, `gtceu:max_battery`) | 5 | 5 | W |
| L28 | Minimal boot cell (Hutchison 2016, Science 351:aad6253; Lartigue 2007, Science 317:632) | biofoundry → `syn3_genome_cassettes`; vent bioreactor (ZPM, zpm/outer_chemistry.js:43) → `recipient_mycoplasma_culture`; xenobiochem plant (UHV, uhv/proxima_life.js:133) → `transplanted_minimal_cell`; radiotrophic vat (:145) → `hardened_minimal_cell`; aerogel works → `vitrified_cell_capsule` (→ gene ark c1) | 5 | 5 | B4 |
| L29 | Clock-locked microcomb (Kippenberg 2018, Science 361:eaan8083) | MOCVD → `nitride_film_wafer`; BEUV → `microring_wafer`; femto → `trimmed_microring`; photonic foundry (UHV, uhv/photonics.js:88) → `packaged_microcomb`; clock lab → `clock_locked_microcomb` (→ Rydberg c1, imager c1) | 5 | 5 | B3 |
| L30 | Shell cryocooler | extraction cascade → `er_ho_oxide`; levitation melter → `er3ni_ingot`; plasma quench caster (ZPM, zpm/fusion.js:184) → `er3ni_spheres`; superfluid helium plant (UV, uv/cold.js:240) → `charged_pulse_tube`; GTM assembler → `shell_cryocooler` (→ segment) | 5 | 4 | H1 |
| L31 | Optical isolator | nitride magnet works (UEV, uev/composites.js:64) → `fe16n2_ring_magnet`; YIG LPE (UXV, uxv/spin_logic.js:70) → `bi_yig_film`; TFLN → `yig_on_ln_wafer`; femto → `isolator_waveguide_die`; GTM assembler → `max_optical_isolator` (→ emitter) | 5 | 4 | A2 |
| L32 | SC magnetic bearing | extraction cascade → `ybco_precursor_powder`; single crystal foundry (UEV, uev/electron_beam.js:88) → `tsmg_ybco_bulk`; high flux reactor (UHV, uhv/transcurium.js:61; fission-track pinning) → `irradiated_ybco_bulk`; nitride works → `bearing_rotor_ring`; GTM assembler → `sc_magnetic_bearing` (→ motor, winch) | 5 | 4 | A2 |
| L33 | Crystalline reference cavity (Kessler 2012, Nat Photon 6:687; Cole 2013, Nat Photon 7:644) | crystal growth → `silicon_cavity_spacer`; MBE → `algaas_bragg_stack`; GTM chemical bath (selective GaAs substrate etch) → `released_algaas_film`; GTM laser engraver (pattern and direct bond) → `transferred_crystalline_mirror`; He refrigerator → `cryo_reference_cavity` (→ interferometer c1) | 5 | 3 | B2 |
| L34 | Cu(111) growth foil | extraction cascade (SX-EW) → `cathode_copper`; hot strip mill (EV, ev/combined_cycle_and_hot_mill.js:237) → `rolled_cu_foil`; single crystal foundry → `cu111_foil`; GTM chemical bath → `electropolished_cu111_foil` (→ L2 vdW step) | 4 | 3 | B1 |
| L35 | Magnetostrictive stack (Engdahl 2000) | extraction cascade → `tb_dy_oxide`; levitation melter → `terfenol_ingot`; single crystal foundry → `oriented_terfenol_rod`; GTM cutter → `laminated_terfenol_stack` (→ piston) | 4 | 3 | A2 |
| L36 | Ta-Hf-C hearth liner (Cedillos-Barraza 2016) | extraction cascade → `hafnium_tantalum_oxide`; GTM chemical reactor (carbothermal) → `ta_hf_c_powder`; SPS → `ta_hf_c_billet`; CVI → `sealed_hearth_liner` (→ furnace controller, c5) | 4 | 3 | R1 |
| L37 | Tetrataenite coupler (Lewis 2014, J Phys Condens Matter 26:064213) | asteroid processor (LuV, luv/asteroid_belt.js:378; belt row) → `iron_core_fragment`; cryogenic plant (EV, ev/cryogenic_plant.js:260) → `cryo_milled_core`; GTM electromagnetic separator → `tetrataenite_concentrate`; GTM compressor (cold, never melted) → `cold_pressed_tetrataenite`; nitride works → `halbach_segment_coupler` (→ segment) | 5 | 3 | R1 |
| L38 | Segment controller | crystal growth (PVT SiC) → `sic_substrate_wafer`; SiC device fab → `sic_cmos_wafer`; MTJ → `mram_stack_wafer`; racetrack fab (UXV, uxv/spin_logic.js:63) → `racetrack_memory_die`; GTM assembler → `segment_controller` (→ segment) | 5 | 4 | H1 |
| L39 | SC fault-current limiter (Noe and Steurer 2007, SUST 20:R15) | GTM bender (high-resistivity Hastelloy C-276, the limiting shunt) → `fcl_substrate_strip`; coated conductor → `fcl_tape`; oxide PLD → `thick_film_fcl_tape`; HTS works → `fcl_coil`; He refrigerator → `cold_fcl_module` (→ substation hatches, converters) | 5 | 4 | A4 |
| L40 | UV fibre harness (Russell 2003, Science 299:358) | GTM chemical reactor (SiCl4 flame hydrolysis) → `synthetic_silica_soot`; zone refining → `ultrapure_silica_tube`; fibre draw → `hollow_core_fibre`; femto → `endcapped_hc_fibre`; GTM assembler → `uv_fibre_harness` (→ Rydberg c1) | 5 | 3 | B3 |
| L41 | Superfluid valve | GTM chemical reactor (TEOS sol-gel) → `silica_alcogel`; GTM chemical bath (TMCS silylation) → `silylated_alcogel`; aerogel works → `aerogel_superleak_plug`; GTM chemical reactor (Stycast potting cure) → `potted_superleak`; SHeQUID → `calibrated_superleak`; mK cryostat → `cold_tested_superleak`; GTM assembler → `superfluid_valve` (→ fluid regulator, fluid hatches) | 7 | 3 | A2 |
| L42 | Wolter mirror module (Weisskopf 2000) | platinum plant (belt `pgm_residue`) → `iridium_sponge`; EB furnace → `iridium_target`; CVI → `sic_grazing_shell`; MTJ → `iridium_coated_shell`; GTM assembler → `wolter_mirror_module` (→ feeder) | 5 | 4 | E1 |
| L43 | Cryogenic glass cell (Schymik 2021, PR Applied 16:034013) | zone refining → `ultrapure_silica_plate`; femto → `laser_welded_glass_cell`; GTM electric furnace (stress anneal) → `annealed_glass_cell`; MTJ → `ar_coated_glass_cell`; He refrigerator → `cold_qualified_cell` (→ Rydberg works controller) | 5 | 4 | B3 |
| L44 | Photonic local oscillator (Ito 2004, IEEE JSTQE 10:709) | MOCVD → `inp_utc_epi_wafer`; BEUV → `utc_photodiode_wafer`; GTM chemical reactor (BCB planarisation and passivation) → `passivated_utc_wafer`; GTM cutter → `utc_die`; photonic foundry → `photonic_lo_module` (→ imager c1) | 5 | 3 | D2 |
| L45 | Cryogenic IF amplifier | crystal growth (LEC Fe:InP) → `semi_insulating_inp_wafer`; MBE → `inp_hemt_epi`; BEUV → `hemt_gate_wafer`; GTM cutter → `hemt_die`; He refrigerator → `cryo_tested_lna`; GTM assembler → `cryo_lna_module` (→ imager c1) | 6 | 4 | D2 |
| L46 | Crossed AOD pair (Bluvstein 2022, Nature 604:451) | crystal growth → `teo2_boule`; GTM cutter → `teo2_aod_blank`; TFLN → `ln_transducer_bonded_blank`; MTJ → `electroded_aod`; GTM assembler → `crossed_aod_pair` (→ Rydberg c1) | 5 | 3 | B3 |
| | **Total** | | **232** | **167** | |

**Fiction marks.** *Named fiction*: the NSC belt; horizon strand near c^4/4G; superconducting membranes at shell scale; clearing the shell's interior plasma; the cluster-light furnace's concentration; nodes as a quantum telescope; the feeder's cool, magnetically held ring; slow-cooled tetrataenite-bearing iron cores in the belt (tetrataenite is real in meteorites and disorders above about 320 °C, so L37 never melts it). *Pack fiction*: Sgr A*'s spin a = 0.9; the universe seed. Everything else cites a paper. Older-machine functions in L25-L46 are read from the machines' names and file lines; each package checks its row against the machine's real recipe type first (S0-12).

## Crossings

| Era | Crossings | Machines |
|---|---|---|
| UXV | 25 | draw bench 1, vdW cell 1, MTJ 11, SHeQUID 3, skimmer 1, mass filter 1, FRC former 1, BZ dynamo 1, stellar elevator 1, oxide PLD 2, YIG LPE 1, racetrack fab 1 (12) |
| UIV | 26 | TFLN 5, femto 6, BEUV 5, mK cryostat 4, levitation melter 3, droplet works 1, SHB 1, decay heat vault 1 (8) |
| UEV | 26 | calutron 2, QGL 3, SNSPD 1, SiC fibre 2, CVI 5, EB furnace 3, carbonyl 1, megabar 2, degenerate harvester 1, nitride magnet works 3, single crystal foundry 3 (11) |
| UHV | 32 | PBO 3, crystal growth 7, MBE 3, SiC fab 2, SPS 5, xenobotany 1, clock lab 2, tether ribbon 1, solar vapour furnace 1, betavoltaic fab 1, solar array fab 1, xenobiochem 1, radiotrophic vat 1, photonic foundry 2, high flux reactor 1 (15) |
| UV | 15 | MOCVD 6, zone refining 3, ark biosphere 1, SRF 2, fibre draw 2, superfluid He plant 1 (6) |
| ZPM | 12 | diamond lattice 2, implanter 3, aerogel 3, waste retrieval 1, magnet works 1, vent bioreactor 1, plasma quench caster 1 (7) |
| LuV | 18 | coated conductor 4, HTS works 4, He refrigerator 6, biofoundry 2, organoid lab 1, asteroid processor 1 (6) |
| IV | 1 | hot cell (1) |
| EV | 12 | extraction cascade 7, platinum plant 2, regolith cell 1, hot strip mill 1, cryogenic plant 1 (5) |
| **Total** | **167** | **71 machines** |

## Quests

About 40 *(tune)* short English quests in one chapter `max` (generated by `tools/quests/`; integrator writes the chapter). Small rewards (a MAX circuit, a cell, segments), never a gate on a recipe (rule 5). Sections: way in (chart, strand, hull); circuits and components; home machines; the probe and arrival; Sgr A* machines; the belt; horizon work; the shell (one quest per 25% of segments *(tune)*); the last recipe. Quest text names the physics in one line each, with fiction marked.

## The ending

The mirror shell's c3, **the last recipe**: needs the full structure formed, and consumes:

- 1 `seed_wave_packet`, 1 `genome_archive`, 16 `stream_bundle` *(tune)*, 1 `final_spin_map`, 1 `rydberg_logic_array` (returned as `spent_rydberg_array`);
- 2^35 EU/t (V[MAX] x 16 A) for 1,200 t *(tune)*: 41,231,686,041,600 EU, on two `gtceu:max_energy_input_hatch_16a` fed by wireless case 14 (one charged `max_smes_cell` holds it). Fallback 2^33 x 4,800 t (S0-2).

Output: `grindless:universe_seed` and 64 `mirror_shell_scrap` *(tune)* (the mirror fails; the scrap returns to the furnace, rule 3). The wave escapes as light and gravitational radiation: the shell is spent, the hole spun down a little (*pack fiction*: that a "new universe" is seeded is Smolin 1992 cosmological natural selection, named and not claimed). The structure stays formed; the recipe can be run again (no lockout, no creative ending: journey.md:173).

**Galactic scale.** Sgr A*'s rotational energy at a = 0.9, about 1.2e53 J, is some 400 million years of the whole Milky Way's light (about 1e37 W); a Kardashev type III civilisation commands about 4e37 W (Kardashev 1964, Sov Astron 8:217; Griffith 2015, ApJS 217:25). The pack does not claim the player drains it: what is measured in game is the case 14 network the last recipe drains (41,231,686,041,600 EU) and the spin-down the final spin map records. A real mirror at 2.35 mHz would need a conductor thicker than copper's skin depth there (about 1.35 m); the superconducting membrane is the shell's *named fiction*. Intergalactic travel, creative tools and the hyper stargate stay MAX+ (*Reserve*).

**Credits.** On the first output, G1's server script sends the vanilla `WIN_GAME` game event (end-poem and credits). If S0-9 shows the client screen does not open, or the respawn after it fails (`ServerPlayer.wonGame` must be true for `PERFORM_RESPAWN` to act), the fallback is: the FTB chapter's last quest, a title, a written book `grindless:max_epilogue` and a monument block. Neither changes game mode.

## Validator

C1 adds `tools/analysis/tiers/max.json` and `-Tier max`. `kubejs_static.mjs:10-11` already has `max` in `TIER_NAMES` and `TIER_PREFIX`. Changes, each one line:

- `recipe_quality.mjs:228`: `grindless:` components are allowed for tiers 10-12; widen to 10-14 (MAX components are `grindless:max_*`, GTM has none).
- `kubejs_static.mjs:871` `GTM_HIGH_TIER_COMPONENTS` lists uhv-opv; MAX is not added (no `gtceu:max_*` components exist).
- The component rule (rules :266-289) applies unchanged: controllers ≥8 tier components from ≥3 families and ≥4 tier circuits; hatches and parts ≥2 tier components; highest circuit = tier; `T-HULL`; EU/t ≥ VA[tier]. **Exemptions**, listed in `max.json` with a reason: `gc_relay_probe` (an OpV-stage travel item); `grindless:mirror_shell_segment` and the three casing blocks (casing exemption, as OpV); `gtceu:max_machine_hull` (no circuit, as GTM's hulls).
- `eraTier` `max: 14`, `complexFloor` `"14": 8` *(tune)*; `max` in process_audit `ERAS` / `TIER_ERA` (F2, integrator).
- C1 re-counts 10 multiblocks, 46 lines (232 steps), 167 crossings on 71 machines, and checks: no MAX recipe takes an OpV-or-lower component or circuit (the probe excepted); no recipe ≥ 2^31 except c14, c15 and the shell's c3; every generator 1.3-2.5x; no MAX+ hook consumed.

## Mods and evidence

No new mod. MAX uses GTM 7.5.3 (tier 14 ids), GCYR 0.2.9 (`black_hole_orbit`), GT-- (`gtnn:supracausal_mainframe` only) and KubeJS. GTMUtils' `max_64a_energy_converter` stays hidden.

**HT evidence (hull and hatches).** The 29 `gtceu:max_*` ids are registered by GTM itself and present in our registry dump (`tables/opv_ids.json:14`, filled from the dump by OpV-F1). GTM v7.5.3 source lines read for this design (copies in the design session, not in the repo):

| Fact | Source |
|---|---|
| V[14] = 2^31 (long), VA[14] = 2,013,265,920, VH[14] = 2^30 (int), MAX = 14 | GTValues.java:60-73, :104 |
| Hatch buffers V x 16 x A (in), V x 64 x A (out), long | EnergyHatchPartMachine.java:54-60 |
| Two top-tier hatches give V[min(tier + 1, MAX)] | WorkableElectricMultiblockMachine.java:271-273 |
| Parallel hatch = `(int) Math.pow(4, tier - EV)` | ParallelHatchPartMachine.java:37 |
| Parallel EU computed as long | EURecipeCapability.java:41-96 |
| Recipe tier from `getTierByVoltage(EUt)` | RecipeHelper.java:54-66 |
| Wire voltage is a long | WireProperties.java:11, :17 |
| `registerFusionTier` public static | FusionReactorMachine.java:308 |

GTM registers no MAX components, basic machines, parallel hatch, wireless, laser hatches, transformers or wire (registry dump; opv_ids.json:14 lists all 29). The MAX parallel hatch is therefore ours (M1, S0-6), as is the cable (`gtceu:horizon_strand`, F1, S0-3).

## Save compatibility

- No registered id is removed. GT--'s other supracausal items and SMDs stay registered (GT-- owns them) and are only hidden; F2 confirms they were hidden before `max` in v0.16.0 (S0-8), so no conversion is needed; if one was obtainable, it keeps working as an item and EMI hides only its recipe. `gtnn:supracausal_mainframe` stays our circuit.
- `gcyr:black_hole_orbit` (or `grindless:sgr_a_orbit`) and `grindless:nsc_belt` are new dimension ids; fixed after S0-1.
- The mirror shell's shape goes in the release notes if it changes after v0.17.0.
- C3 reopens a v0.16.0 (OpV) save.

## Risks

- **2^35 on MAX hatches (S0-2).** Not yet run anywhere. Fallback 2^33 x 4,800 t, the same EU.
- **The shell's size (S0-7, P).** A 33-cube with thousands of positions may cost server time on every structure check. Fallback 25 x 25 x 25 *(tune)* with the same segment count per face reduced; MAX_ROWS 64 is a library change (P, serial).
- **GCYR refusing tier 14 or the black-hole dimension (S0-1).** Fallback `grindless:sgr_a_orbit`.
- **GT-- Java recipes (S0-8).** If they cannot be cut, they are hidden and the obtain rule ignores them.
- **Credits (S0-9).** Vanilla's win screen is client-side; fallback is a book and a quest.
- **Count deficit.** 10 / 46 / 167 against ~24 / ~68 / ~212: above OpV (18 / 45 / 141) in lines and crossings, below the guide by 14 machines, 22 lines and 45 crossings, each named under *Considered and dropped*; open question 1.
- **OpV not merged.** Most OpV packages are still running. MAX packages name the OpV package they wait for; an OpV id that changes is an escalation for the MAX worker, not a silent rename.
- **Older shared files.** 78 older machines take rows; the shared-file order and pre-assigned circuits (*Parallel and serial*, *Circuits by type*) are the protection.
- **Bootstrap cycles.** UXV-FX found a controller needing its own place's product. Every MAX controller, travel item and gate input is checked against the substage order in *Bootstrap check*; C1 repeats the check; a package that adds an input re-runs it in its handoff.
- **The V[MAX] slip.** opv.md says V[MAX] = Integer.MAX_VALUE; it is 2^31, a long. Code written from that sentence would overflow by one; the integrator corrects the DECISIONS line.

## Bootstrap check

Every gate, travel and controller input with where it is first made. "Before" = available before the item that needs it, without the needing machine or place.

| Needs | Input | First made by | Before? |
|---|---|---|---|
| Hull | `gtceu:max_machine_casing` | OpV-G1 (researched with `sgr_a_chart`) | yes (route 1) |
| Hull | horizon strand cable | L1: OpV vault, draw bench at SGR, PBO | yes (OpV places) |
| Hull | `chain_lamina_stack`, superfluid He-3 | OpV-A0, F1 | yes |
| Gate c14 | `gc_relay_probe`: probe seed, Hawking drive, chain strand wire, tetron array, vitamin kit, feedstock, sinter casing, OpV sensors | OpV-R2, D3, A0, B1, R1 | yes (OpV only) |
| Gate c14 | 2^33 hold | two OpV 16 A hatches, wireless case 13 | yes (OpV-S0-2) |
| Mainframe | squeezed chip, tweezer die, interposer | L5-L7 on UXV-and-older machines | yes |
| Components A2 | field coil, composite rod/rotor, bearing, isolator, Terfenol stack, superfluid valve, He-3 seal, harmonic drive, cryo optical link, mainframe | L9, L10, L31, L32, L35, L41 (older only), OpV-A1/A2, A1 | yes |
| Controller 3 | motor, piston, robot arm; `rebco_on_pbo_web` (L2 step 4); field coil; strand cable; lamina | A2; LuV CC line | yes (no conveyor, sensor, field generator) |
| Controller 2 | emitter, robot arm, pump; `degenerate_sr_cartridge` (L4 step 2); squeezed chip; rotation reference; modulator | A2; QGL, SHeQUID, TFLN | yes (no sensor) |
| Conveyor, sensor, field generator | membrane belt, gradiometer, membrane | machines 3 and 2 | yes (after B1, B2) |
| MAX hatches | diamond power die, sensor, emitter; `cold_fcl_module` (substation, converters); `cold_smes_toroid` (battery) | L8, L39, L27 (older only), A3 | yes |
| Controller 1 | robot arm, sensor, field generator; `tweezer_array_die`; `quantum_memory_node` (L23, older only); interposer; tetron; `cold_qualified_cell` (L43, older only) | A3, A1, B3's older rows | yes (machine 1 makes no input of its own controller) |
| Controller 4 | `encapsulated_genome_library` (aerogel works); Rydberg array; membrane; strand cable | B4 row on ZPM machine, machine 1, machine 3 | yes |
| Controller 5 | `sis_mixer` (L22, older); dish panel (L21, older); memory node; Rydberg array | D2 rows, B3 | yes; built at home, carried |
| Controller 6 | `horizon_tether` (L20: UHV ribbon works, UXV elevator at Cygnus, GTM); rotor; die; albedo panel; bearing (L32) | D3 rows, A2, A3, B1 | yes; built at home, carried |
| Gate c15 | `nsc_belt_seed`: probe seed, `nsc_ephemeris` (machine 5 c2 at Sgr A*), Rydberg array, MAX arm and sensor, feedstock, sinter casing | OpV-R2, D2, B3, A3 | yes (after `max-sgra`) |
| Controller 9 | `nsc_ephemeris`; albedo; composite rod; die; `sealed_hearth_liner` (L36, older and GTM only) | D2, B1, A2, A3, R1 | yes; carried to the belt |
| Controller 7 | `stream_pellet` (L14: belt furnace c3, megabar, SRF, canner); field coil; die; gradiometer | R1, D4 rows, A2, A3, B2 | yes (after `max-nsc`) |
| Controller 8 | `sgr_a_spin_map` (machine 5 c1); membrane; `stream_bundle` (machine 7); Rydberg array | D2, B1, D4, B3 | yes |
| Controller 10 | `slag_pellet` (L25: belt furnace c1 slag, then home or Sgr A* older rows); `xuv_collector_panel` (L26, older); `wolter_mirror_module` (L42: belt PGM, older); field coil; field generator, emitter, sensor | R1, E1 rows, A2, A3 | yes (after `max-nsc`; the feeder makes none of its own inputs) |
| Shell segments | truss (belt), membrane, albedo panel, shell droplet radiator (Sgr A*), cryocooler and segment controller (L30, L38, older only), Halbach coupler (L37, belt asteroid processor row) | R1, B1, D1, H1 | yes (after `max-nsc`) |
| Last recipe | seed wave packet (forge at Cygnus), genome archive, stream bundles, final spin map, Rydberg array, 2^35 | G1 rows, B4, D4, shell c2, B3, W + A4 hatches | yes |

No home recipe takes a Sgr A* or belt product before its substage: `shell_gradient_map` (machine 2 c2) and `final_spin_map` are made after `max-sgra` and used only at Sgr A*.

## Build order

Workers and sessions are unlimited (owner approval): a package starts as soon as every package in its **Depends on** has merged, and *Parallel and serial* lists the earliest wave for each. Dependencies are behaviour only (a product, a place, a component the package's recipes or tests need); ids never create a dependency, because F1 registers every cross-package id and every MAX circuit offset first. Only two things stay limited: the bench (three T1 slots on the Linux VM; extra T1 runs queue, bands assigned by the integrator) and the shared libraries (M1 then P, each alone on `lib/`, integrator-run). An OpV change is a MAX package that names the OpV package it waits for.

### Common to every package

OpV's *Common to every package* (opv.md, same heading) applies with `opv` replaced by `max` in every path. The changes for MAX:

- **Allowed, always:** `startup_scripts/grindless/max/<name>.js`, `server_scripts/grindless/max/<name>.js`, `client_scripts/grindless/max_<name>_lang.js`, new tables `tables/<name>*.json`, `tools/assets/Build-Max<Name>Textures.ps1` and its outputs, `assets/emi/recipe/additions/grindless/max_<name>_*.json`, `tools/analysis/test/max-<name>.test.mjs`, `tools/test/overlay/kubejs/server_scripts/gg_test_max_<name>.js` and the package's row in `tools/test/zones.json` (the integrator adds the row; the package fills it). Rows on an older machine: only the files that machine's row names in *Older machines in MAX*, in the order of *Parallel and serial*.
- **Gates (QR):** as OpV, with tier 14 (F2). Until F2 lands, run them with `--era max` and read the findings by hand.
- **Info pages and loops (QR):** as OpV. Items with no consumer get a page naming their use; `universe_seed` says "MAX+". The loops:

  | Type → loop | Type → loop |
  |---|---|
  | `rydberg_assembly` → `loop_rydberg_array_works` | `geroch_power` → `loop_geroch_winch` |
  | `atom_interferometry` → `loop_atom_interferometer_works` | `mass_stream_injection` → `loop_mass_stream_injector` |
  | `membrane_rolling` → `loop_membrane_line` | `superradiant_amplification` → `loop_mirror_shell` |
  | `genome_archiving` → `loop_gene_ark` | `cluster_light_smelting` → `loop_cluster_light_furnace` |
  | `photon_ring_imaging` → `loop_photon_ring_imager` | `accretion_power` → `loop_accretion_feeder` |

- **Tooltips:** as OpV (owner, 2026-10-29): one line of what it does, one line per thing it accepts.
- **Prohibited, always:** as OpV, plus `tables/max_ids.json` (F1 owns it), every `gtceu:max_*` registration (GTM's), `pack/kubejs/*/grindless/lib/**` (only M1 and P, integrator-run) and every OpV file not named in the contract.
- **Ids:** exactly as in this file and `tables/max_ids.json`. A new cross-package id, or a changed one, is an escalation. OpV ids are consumed, never redefined.
- **Invariants, always:**
  - the MAX component and circuit rule (*Voltages, hull, hatches and controllers*): every MAX machine, hatch and controller recipe takes the MAX hull, MAX components, `#gtceu:circuits/max` and runs at ≥ VA[MAX]; never an OpV-or-lower component or circuit (the probe, the hull and the casings excepted, *Validator*);
  - no recipe EU/t ≥ 2^31 except gate c14, c15 and the shell's c3; long values written as `GTValues.V[GTValues.MAX] * amps` or `GTValues.V[13] * 16`, never a literal;
  - no home recipe takes a Sgr A* or belt product before its substage; horizon strand only from the SGR draw bench; hot flow only at Sgr A*; planetesimals only at the belt;
  - every generator burns a stated fuel at 1.3-2.5x; nothing consumes `universe_seed`;
  - no `// priority:` lines (load order is `script_order.json`, integrator);
  - OpV's and UXV's invariants hold.
- **Pinned older tests:** a package may edit the pinned test of an older machine it adds rows to (named in its Allowed line).
- **Tests:** T0 before every commit. T1 `gg_test_max_<name>`, band assigned by the integrator; three T1 runs at once (three VM slots), however many workers are running; the rest queue. A far-place machine's T1 forms it at its site. Overlay cable tests connect cables with `setConnection`.
- **Repairs and agent:** at most two repairs, then stop with the escalation evidence. `mechanical` (Haiku) may take A4's rows, lang parity and es_es names.
- **Proof reuse:** OpV proved, and no MAX T1 re-proves: 2^33 x 1,200 t on two OpV 16 A hatches (OpV-S0-2); tier 13 datapack places (OpV-S0-3); a KubeJS cable at 16 A x V[OpV] (OpV-S0-7); a second-hop throw surviving a restart (OpV-S0-9); string site rows on UXV machines (OpV-S0-12); wireless case 13 long caps (OpV-S0-6); the parallel-hatch mechanism with long EU/t (OpV-S0-5).

**Circuits by type** (read 2026-10-30; MAX numbers start after OpV's assignments in opv.md *Circuits by type*, so parallel branches never collide; each listed circuit is one row of that machine's own recipe type). Machines MAX did not use before the repair are written `f`, `f+1`: F1 reads the first free circuit `f` of each such type once, after OpV's rows, and records it in the `circuits` block of `tables/max_ids.json`; packages read it from there. Every row has one owner, so packages sharing a file merge in any order and only rebase. If a number was taken meanwhile, the worker escalates instead of renumbering.

| Type (where its rows live) | In use + OpV | MAX |
|---|---|---|
| UXV pasta drawing (`tables/vela_pasta.json`) | 1, OpV c3-4 | A0 c5-6 |
| UXV vdW stacking (`tables/spin_logic.json`) | 0-4 | B1 c5 |
| UXV MTJ sputtering (`uxv/spin_deposition.js`) | 0-4, OpV 8 rows (c5-12) | A1 c13-14, B1 c15, A3 c16, D2 c17-18, E1 c19, H1 c20, E1 c21, B3 c22-23 |
| UXV SHeQUID (`tables/shequid_mnt.json`) | 0-4 | A2 c5, B2 c6, A2 c7 |
| UXV skimmer / FRC former / BZ (`tables/cygnus_disk.json`) | 1-2 each | D1 c3 each |
| UXV mass filter / stellar elevator (`tables/cygnus_lift.json`) | 1-2 each | D1 c3-4 / D3 c3 |
| UIV ion slicing (TFLN) | 1-4, OpV c5-8 | A1 c9-10, B2 c11, A2 c12, B3 c13 |
| UIV femtosecond writer | 1-4, OpV c5-6 | A1 c7, D1 c8, B3 c9, A2 c10, B3 c11-12 |
| UIV BEUV scanner | 1-3, OpV c4-9 | A1 c10, D2 c11, B3 c12, D2 c13-14 |
| UIV millikelvin cryostat | 1-3, OpV c4-7 | A1 c8, D2 c9, G1 c10, A2 c11 |
| UIV spectral hole burner (`tables/memories_cryostat.json`) | 20-23, 25 | B3 c26 |
| UIV levitation melter | 1-16, OpV c17-18 | R1 c19, H1 c20, A2 c21 |
| UIV droplet works / Penrose engine | 0-4 / 1-5 | D1 c5 / D1 c6 |
| UEV calutron (`tables/isotopes.json`) | 1-15, 20-27 | B2 c16-17, B3 c18-19 |
| UEV quantum gas lab (`tables/earth_orbit.json`) | 0-3 | A1 c4, B2 c5, B3 c6 |
| UEV SNSPD / photonic hall | 1-5, OpV c6 / 1-7, OpV c8 | A1 c7 / A1 c9 |
| UEV SiC fibre / CVI (`tables/composites.json`) | table 0-15, OpV to c17 / 1-5, OpV c6-11 | A2 c18, D2 c19 / A2 c12-13, D2 c14, R1 c15, E1 c16 |
| UEV electron beam (`tables/electron_beam.json`) | 1-32 after OpV | full: B1 (two rows), D2 and E1 repeat c30-32, each on a circuit whose existing rows take different item inputs (OpV-F3 rule; the cap is 32, decision 48) |
| UEV carbonyl / megabar / degenerate harvester | 0-1 / 1-6, OpV c7-8 / 0-1 | R1 c2 / D1 c11 (c9 bent_ge_rebend), D4 c10 / D1 c2 |
| UHV PBO plant / tether ribbon (`uhv/elevator.js`) | 1-7, OpV c8-9 | A0 c10, B1 c11-12 / D3 c13 |
| UHV crystal growth (`tables/crystals.json`) | 1-18, OpV c19-27 | A1 c28-29, B3 c30, B2 c31, B3 c32; H1 (landed, L38) c32; D2 (L45) c32 again: programmed circuits stop at 32 (decision 48), so a repeat is allowed when the item inputs differ (OpV-F3 rule) |
| UHV clock lab / MBE / SiC fab | 1-3, OpV c4-5 / 1-8, OpV c9-11 / 1-5, OpV c6-8 | G1 c6, B3 c7 / A1 c12, B2 c13, D2 c14 / A3 c9, H1 c10 |
| UHV SPS / xenobotany | 1-7, OpV c8-15 / 0-4 | A2 c21 (OpV chain_composite_rod/rotor hold c16-17), D1 c18 and c22, E1 c19, R1 c20 / B4 c5 |
| UV MOCVD / fibre draw (`uv/photonics.js`) | 1-16, OpV c17-22 / 1-16, OpV c17-18 | A1 c23-24, B1 c25, B3 c26-27, D2 c28 / B3 c19-20 |
| UV zone refining / SRF / ark | 1-9, OpV c10-11 / 1-5, OpV c6 / 1-3 | B1 c12, B3 c13-14 / D4 c7, G1 c8 / B4 c4 |
| ZPM diamond lattice / implanter | file 1-4, 6-8 / 1-8, OpV c9-13 | A3 c9, E1 c10 / A3 c11, D2 c16, E1 c17 (c14 sdd_rings, c15 hpge_contacts) |
| ZPM aerogel / waste retrieval | 0-4 / 1-7, OpV-B3 c8-9 | B4 c5-6, A2 c7 / D3 c10 |
| LuV coated conductor / HTS | 1-4 / 1-6, OpV c7-10 | A2 c5, B1 c6, W c7, A4 c8 / A2 c11, B1 c12, W c13, A4 c14 |
| LuV He refrigerator / biofoundry / organoid lab | keyed by input / 1-16 / 1, 2, 6 | B1, W, B2, A4, B3, D2 (one input each) / B4 c17-18 / B4 c3 |
| IV hot cell (`tables/hot_cell.json`) | 1-15, OpV c16-20 | D3 c21 |
| EV extraction cascade / platinum plant | 1-22, OpV c23-29 / 1-14, OpV c15-17 | B1 c30-31, D1 c32; H1 (landed, L30) c32; A2 (L32, L35), B1 (L34) and R1 (L36) repeat c30-32 by item inputs (OpV-F3 rule; cap 32, decision 48) / R1 c18, E1 c19-20 (c20 the spent Wolter return) |
| First used by MAX in the repair (F1 records `f` per type) | — | UXV oxide PLD W f, A4 f+1; YIG LPE A2 f; racetrack H1 f · UIV decay heat vault D3 f · UEV nitride magnet works A2 f-f+1, R1 f+2; single crystal foundry A2 f, B1 f+1, A2 f+2 · UHV solar vapour, betavoltaic, solar array E1 f each; xenobiochem, radiotrophic B4 f each; photonic foundry B3 f, D2 f+1; high flux A2 f; swarm segment foundry G1 f · UV superfluid He plant H1 f · ZPM magnet works W f; vent bioreactor B4 f; plasma quench H1 f · LuV asteroid processor R1 f (belt) · EV regolith E1 f; hot strip B1 f; cryogenic plant R1 f |
| UHV warp gate (`tables/gate.json`) | 1-2, 4-10, OpV c11-13 | T1 c14, T2 c15 |
| OpV vault / forge / harvester / refinery | OpV rows not merged | one MAX writer each (A0 / G1 / R1 / R1): first free after OpV's last row |

## S0 spikes

One worker, one branch, no shipped content.

| Spike | Question | If it fails | Changes |
|---|---|---|---|
| S0-1 | Does GCYR 0.2.9 load `gcyr:black_hole_orbit` as a tier-14 planet from our datapack, with a relay platform row? And `grindless:nsc_belt` at tier 14? | `grindless:sgr_a_orbit` copy; tier 13 | F1 |
| S0-2 | Does a recipe of V[MAX] x 16 A (2^35) run for 1,200 t on two MAX 16 A input hatches, long end to end? EMI tier? | 2^33 x 4,800 t | G1 |
| S0-3 | Does a KubeJS `horizon_strand` cable carry 16 A x V[MAX] with loss 1? | item only, power by wireless | F1, A0 |
| S0-4 | Does a GTM generator multiblock emit 2^31 or more through MAX dynamo hatches? | rows at ≤ 2^30 through OpV dynamos (as written) | D1, D3, G1 |
| S0-5 | Does wireless case 14 hold 64 A x V[MAX] x 10 caps as long? | cap at 16 A | W |
| S0-6 | Does a tier-14 parallel hatch report x1,048,576 with long EU/t and no overflow? | x262,144 (open question 5) | M1 |
| S0-7 | Does a 33 x 33 x 33 hollow structure with MAX_ROWS 64 form and re-check within the tick budget? | 25-cube | P, G1 |
| S0-8 | Where does GT-- register its supracausal recipes; can they be cut; are they hidden before `max`? | hide only | F2, A1 |
| S0-9 | Does the `WIN_GAME` event open credits on a dedicated server and respawn the player? | book, title, quest | G1 |
| S0-10 | Do UXV disk machines and UIV's Penrose engine and droplet works form and run at Sgr A* with string site rows? | duplicate site as an array | D1 |
| S0-11 | Does gate c15 (a second hop from Sgr A*, itself reached by relay) survive `@restart`? | land at a Cygnus relay and re-throw | T2 |
| S0-12 | Do the 22 older machines first used by the repair (the `f` types of *Circuits by type*), and the other machines of *Rows added by the repair*, accept the input and output shapes their L17 and L25-L46 rows need (function read from the script, not the name), and run at the sites named? | replace that step with a GTM machine step and drop its crossing; the line stays only if it keeps 4 steps, else it moves to *Considered and dropped* | every package with an L17 or L25-L46 row |
| S0-13 | Does a 15 x 9 x 15 generator multiblock with a Sgr A* string site row form at the feeder site and emit 2^30 through OpV dynamos into case 14 wireless? | output through the OpV generator dynamo pattern of D3 at 2^29; balance re-checked by C1 | E1 |

Order: S0-1, S0-2, S0-3 first (they gate F1, A0, G1), then the rest; S0-12 is one read per machine and may run in parallel with all of them. One result line per spike in the S0 handoff; the integrator copies them to DECISIONS.md.

### Foundations

#### F1. Ids, places and materials

- **Objective:**
  - `tables/max_ids.json`: the 9 components, the hull, the 29 parts, the parallel hatch id, the two places, and a `circuits` block with the first free circuit `f` of each type MAX first uses in the repair (*Circuits by type*), read once after OpV's rows;
  - `startup_scripts/grindless/max/travel.js` (`G.maxTravel`, opv/travel.js:10-17 pattern);
  - the material `gtceu:horizon_strand` (wire, single cable at V[MAX], 16 A, S0-3); fluids `hot_flow_plasma`, `filtered_hot_flow`, `flux_loaded_frc`, `cooled_exhaust`, `sn_li_eutectic`;
  - the places: the planet file for `gcyr:black_hole_orbit` (or `grindless:sgr_a_orbit`) and `grindless:nsc_belt`, tier 14 (S0-1); two rows in `tables/relay_platforms.json` (source Cygnus X-1 orbit; source Sgr A* orbit); substages `max-sgra`, `max-nsc`;
  - the components `grindless:max_*` (*Components*) on the `uiv/uiv_components.js` pattern;
  - the blocks `max_optical_table_casing`, `membrane_roller_casing`, `geroch_drum_casing`, `stream_turn_casing`, `mirror_shell_segment`, `stream_bundle_block`, `feeder_coil_casing`;
  - every cross-package item id, with names in en_us and es_es: the line products of *Lines*; `sgr_a_spin_map`, `nsc_ephemeris`, `shell_gradient_map`, `final_spin_map`, `stream_bundle`, `spent_stream_pellet`, `spent_tether_segment`, `spent_wave_packet`, `spent_rydberg_array`, `spent_sr_cartridge`, `rb_getter_scrap`, `sis_scrap`, `spent_ferric_chloride`, `membrane_scrap`, `mirror_shell_scrap`, `gc_relay_probe`, `launched_gc_probe`, `nsc_belt_seed`, `launched_belt_seed`, `universe_seed`, `max_epilogue`, `max_smes_cell`, `horizon_strand_repeater`, `silicate_slag`, `iron_core_fragment`, `spent_collector_panel`, `spent_wolter_module`. The line products include every intermediate of L17 and L25-L46 that two packages touch, so no package waits on another for an id.
- **`<name>`:** `foundation`.
- **Allowed (extra):** `tables/max_ids.json`; `tables/relay_platforms.json` (2 rows); the GCYR planet datapack files.
- **References:** *Places and site rules*; *Bridges*; opv.md F1; S0-1, S0-3.
- **Depends on:** S0; OpV-F1 (merged).
- **Invariants:** ids only, no recipe; no `gtceu:max_*` registration; dimension ids final after S0-1.
- **Acceptance:** every id exists with both names; both places load at tier 14 (or the fallback); the strand cable exists.
- **Tests:** T0. T1: `gg_test_max_foundation`, band assigned by integrator. Doubt: the cable at 16 A x V[MAX] (setConnection) and both places with platforms.
- **Commits:** 2. **Serial:** alone.

#### F2. Obtain, cuts and gates (integrator)

- **Objective:** `hidden_until.json` (`max`, `max-sgra`, `max-nsc`); `server_scripts/grindless/max/cuts.js`: GTM's recipes for the 29 `gtceu:max_*` ids, GT--'s supracausal family, SMDs and `max_wrap_circuit` (or hide, S0-8), horizon strand auto-routes; QR tier 14 (`eraTier`, `complexFloor`, process_audit).
- **Allowed:** those files; `tools/analysis/tiers/max.json` stub.
- **Depends on:** F1. **Invariants:** nothing is removed from the registry. **Tests:** T0; obtain test. **Commits:** 2. **Serial:** integrator.

#### W. Wireless case 14

- **Objective:** `case 14` in the tier switch (lv/wireless_energy.js:305 pattern) as an override in `server_scripts/grindless/max/wireless.js` (as OpV-W); caps V[MAX] x A x 10 as long (*Power*); `max_smes_cell`, `horizon_strand_repeater` recipes (assembler, VA[MAX], MAX parts after A2; until then pendingRoutes); rows in `tables/wireless_energy.json`; L27 (CC c7, oxide PLD f, HTS c13, magnet works f, He refrigerator; `cold_smes_toroid` into `max_smes_cell`).
- **Allowed (extra):** `tables/wireless_energy.json` (rows); pinned test `opv-wireless`.
- **Depends on:** F1, OpV-W. **Acceptance:** caps match *Power*; 64 A or the S0-5 fallback; the SMES toroid obtainable on older machines.
- **Tests:** T0. T1: `gg_test_max_wireless`, band by integrator. Doubt: the 64 A cap stays long end to end. **Commits:** 1.

#### M1. MAX parallel hatch (lib, integrator-run)

- **Objective:** `lib/parallel_hatch.js` gains tier 14: level (:81), id `grindless:max_parallel_hatch` (:85), accepted tier (:103); its recipe in `server_scripts/grindless/max/parallel.js` (assembly line, VA[MAX], MAX hull, 2 field generators, 2 robot arms, 4 `#gtceu:circuits/max`; pendingRoutes until A3).
- **Allowed (extra):** `lib/parallel_hatch.js`; pinned tests of the hatch.
- **Depends on:** F1, OpV-M1. **Acceptance:** x1,048,576 or the S0-6 fallback.
- **Tests:** T0. T1: `gg_test_max_parallel`, band by integrator. Doubt: the parallel count and EU/t stay long. **Commits:** 1. **Serial:** alone on `lib/`.

#### P. Pattern size (lib, integrator-run)

- **Objective:** `lib/patterns.js:60` `MAX_ROWS` 16 → 64 (check at :218), nothing else.
- **Allowed (extra):** `lib/patterns.js`; its pinned test. **Depends on:** M1 merged (both on `lib/`). **Acceptance:** every older structure still forms (QR rubric re-run on three samples). **Tests:** T0; S0-7. **Commits:** 1. **Serial:** alone on `lib/`.

#### T1. Gate c14 to Sgr A*

- **Objective:** `gc_relay_probe` (*Bridges*, assembly line at VA[OpV]); `tables/gate.json` c14 (2^33 x 1,200 t *(tune)*, two OpV 16 A hatches at Cygnus X-1 orbit, keeps `sgr_a_chart`, outputs `launched_gc_probe`); the relay hand-off to the F1 platform row; `max-sgra` grant.
- **`<name>`:** `gate_gc`. **Allowed (extra):** `tables/gate.json` (1 row); pinned test `uhv-gate`.
- **References:** *Bridges*; `uhv/gate.js:90-97` (keeps), :294 (grant); `uxv/kerr_sling.js` (relay).
- **Depends on:** F1; OpV-G1 (c13, `max` grant), OpV-R2 (probe seed), OpV-D3 (Hawking drive).
- **Invariants:** OpV parts only in the probe; c14 is a long row written as V x amps.
- **Acceptance:** the gate holds 2^33, consumes the probe, keeps the chart, places the platform and grants `max-sgra`.
- **Tests:** T0. T1: `gg_test_max_gate_gc`, band by integrator. Doubt: arrival at `black_hole_orbit` (or the fallback) with the platform. **Commits:** 2.

### Way in and family

#### A0. Horizon strand and hull

- **Objective:** L1 (OpV vault row, draw bench c5-6 at SGR, PBO c10, two assembler rows); `gtceu:max_machine_hull` (*Hull*).
- **`<name>`:** `strand`. **Allowed (extra):** `tables/vela_pasta.json` (2 rows); the PBO rows in `uhv/elevator.js`; the vault's table (1 row).
- **References:** *Hull*, *Material*, L1; opv.md A0 (SGR rows).
- **Depends on:** F1, F2; OpV-A0 (draw bench at SGR), OpV-D2 (vault, `stable_exotic_matter`).
- **Invariants:** strand only from SGR; hull without travel.
- **Acceptance:** strand wire and cable obtainable; the hull obtainable at home.
- **Tests:** T0. T1: `gg_test_max_strand`, band by integrator. Doubt: the draw bench rows at SGR with string site. **Commits:** 2.

#### A1. Circuits

- **Objective:** L5, L6, L7 (rows on crystal growth c28-29, TFLN c9-10, femto c7, MOCVD c23-24, SNSPD c7, BEUV c10, MTJ x2, QGL c4, MBE c12, mK c8; GTM laser engraver row); the mainframe join (photonic hall c9).
- **`<name>`:** `circuits`. **Allowed (extra):** each named older table or script (one row each), in the shared-file order.
- **References:** *Circuits*; L5-L7; S0-8.
- **Depends on:** F1, F2.
- **Invariants:** `#gtceu:circuits/max` has one member; no GT-- route visible.
- **Acceptance:** the mainframe obtainable only through our join.
- **Tests:** T0. T1: `gg_test_max_circuits`, band by integrator. Doubt: the join at VA[MAX] on two OpV hatches on the photonic hall. **Commits:** 3.

#### A2. First six components

- **Objective:** L9, L10 (CC c5, CVI c12-13, HTS c11, SiC fibre, SPS c21, SHeQUID c5, GTM rows); L31 (nitride works f, YIG LPE f, TFLN c12, femto c10), L32 (extraction c34, single crystal foundry f, high flux f, nitride works f+1), L35 (extraction c36, levitation c21, single crystal foundry f+2), L41 (GTM bath and reactor rows, aerogel works, keyed by silylated_alcogel (c0), SHeQUID c7, mK c11); motor, pump, piston, robot arm, emitter, fluid regulator (*Components*).
- **`<name>`:** `components`. **Allowed (extra):** the named older tables.
- **Depends on:** A0, A1; OpV-A1 (`superfluid_he3_seal`), OpV-A2 (`opv_harmonic_drive`, `cryo_optical_link`).
- **Pending:** conveyor, sensor and field generator: pendingRoutes naming A3.
- **Machine (integrator, bench-run):** MAX components run in gtceu:assembly_hall on two OpV 4 A hatches (GCyM large_assembler takes one energy hatch; gtceu:max_assembler does not exist).
- **Acceptance:** six components obtainable with MAX parts only.
- **Tests:** T0. T1: `gg_test_max_components`, band by integrator. Doubt: a component recipe at VA[MAX] on the assembler with two OpV 4 A hatches. **Commits:** 2.

#### H1. Shell parts

- **Objective:** L30 (extraction c33, levitation c20, plasma quench f, superfluid He plant f, GTM assembler → `shell_cryocooler`) and L38 (crystal growth c33, SiC fab c10, MTJ c20, racetrack f, GTM assembler → `segment_controller`); older machines and GTM only, at home.
- **`<name>`:** `shell_parts`. **Allowed (extra):** the named older tables and scripts (one row each).
- **References:** *Lines* L30, L38; *Mirror shell*; S0-12.
- **Depends on:** F1 (ids, `circuits` block); S0-12. No MAX product enters either line.
- **Acceptance:** both parts obtainable at home before `max-sgra`; nothing by hand.
- **Tests:** T0 only: rows on machines already proven, no new mechanism (C1 checks reachability). **Commits:** 1.

#### B1. Membrane line (machine 3)

- **Objective:** machine 3 (controller, shape, c1-c3); L2, L3, L11 rows on vdW c5, PBO c11-12, MOCVD c25, CC c6, HTS c12, extraction c30-31, zone c12, EB c33-34, MTJ x1, He refrigerator; L34 (extraction c35, hot strip f, single crystal foundry f+1, GTM bath; the foil feeds L2's vdW step); byproduct rows.
- **`<name>`:** `membrane_line`. **Allowed (extra):** the named older tables.
- **Depends on:** A2. **Acceptance:** membrane, albedo panel and belt obtainable; structure passes QR.
- **Tests:** T0. T1: `gg_test_max_membrane_line`, band by integrator. Doubt: forms and runs c1 on two OpV 4 A hatches. **Commits:** 3.

#### B2. Atom interferometer works (machine 2)

- **Objective:** machine 2 (controller, shape, c1; c2 with a pendingRoutes naming D2); L4 rows on calutron c16-17, QGL c5, TFLN c11, SHeQUID c6; L33 (crystal growth c31, MBE c13, GTM engraver, He refrigerator; the cavity enters c1); Sr return.
- **`<name>`:** `interferometer`. **Allowed (extra):** the named older tables.
- **Depends on:** A2. **Acceptance:** gradiometer obtainable; tall structure passes QR.
- **Tests:** T0. T1: `gg_test_max_interferometer`, band by integrator. Doubt: the 15-high shape forms. **Commits:** 2.

#### A3. Last components and the power die

- **Objective:** L8 (diamond lattice, implanter c14, MTJ x1, SiC fab c9, GTM cutter); conveyor, sensor, field generator.
- **`<name>`:** `components_late`. **Depends on:** B1, B2. **Pending:** deletes A2's pendingRoutes.
- **Acceptance:** all nine components obtainable. **Tests:** T0. T1: `gg_test_max_components_late`, band by integrator. Doubt: the field generator chain end to end. **Commits:** 2.

#### A4. MAX parts

- **Objective:** `tables/max_parts.json` and `server_scripts/grindless/max/parts.js`: the 29 `gtceu:max_*` recipes (*Hatches*); casing plate row; L39 (CC c8, oxide PLD f+1, HTS c14, He refrigerator; the limiter enters substation hatches and converters; W's `cold_smes_toroid` enters `gtceu:max_battery`).
- **`<name>`:** `parts`. **Depends on:** A3, F2, W (toroid). **Agent:** `mechanical` may fill rows from the table.
- **Acceptance:** each part obtainable; ≥2 MAX components each; validator clean.
- **Tests:** T0. T1: `gg_test_max_parts`, band by integrator. Doubt: a MAX 16 A pair forms on a shell-less test multiblock. **Commits:** 1.

### Home and the galactic centre

#### B3. Rydberg array works (machine 1)

- **Objective:** machine 1 (c1, c2; controller with `cold_qualified_cell`); L19 (calutron c18-19, MOCVD c26, QGL c6), L23 (crystal growth c30, SHB, fibre draw c19, GTM row); L29 (MOCVD c27, BEUV c12, femto c9, photonic foundry f, clock lab c7), L40 (zone c13, fibre draw c20, femto c11), L43 (zone c14, femto c12, MTJ c22, He refrigerator), L46 (crystal growth c32, TFLN c13, MTJ c23); Rb return.
- **`<name>`:** `rydberg`. **Depends on:** A3. **Acceptance:** array and memory node obtainable.
- **Tests:** T0. T1: `gg_test_max_rydberg`, band by integrator. Doubt: c1 on MAX hatches. **Commits:** 2.

#### D1. Sgr A* modes on older machines

- **Objective:** L15, L16, L24 rows (skimmer, mass filter, FRC former, BZ dynamo generator, droplet works, Penrose engine generator at Sgr A*; extraction c32, femto c8, SPS c18 and c22, megabar c9, degenerate harvester c2); the two generator balances.
- **`<name>`:** `sgra_modes`. **Allowed (extra):** `uxv/cygnus_disk.js`, `uxv/cygnus_lift.js`, `uiv/cygnus.js`, `uiv/matrioshka.js` tables and the named older tables.
- **Depends on:** T1, B1, A2; S0-10.
- **Acceptance:** hot flow to flux-loaded FRC at Sgr A*; generators at their balance.
- **Tests:** T0. T1: `gg_test_max_sgra_modes`, band by integrator. Doubt: UXV machines form at Sgr A* with string site rows. **Commits:** 3.

#### B4. Gene ark (machine 4)

- **Objective:** machine 4 (c1, c2); L12 rows (biofoundry c17, organoid lab c3, ark c4, xenobotany c5, aerogel c5); L28 (biofoundry c18, vent bioreactor f, xenobiochem f, radiotrophic f, aerogel c6; each at its machine's current site; the capsule enters c1).
- **`<name>`:** `gene_ark`. **Depends on:** B3. **Acceptance:** archive obtainable.
- **Tests:** T0. T1: `gg_test_max_gene_ark`, band by integrator. Doubt: the five-era chain to one archive. **Commits:** 2.

#### D2. Photon ring imager (machine 5)

- **Objective:** machine 5 at Sgr A* (c1, c2); L21 (SiC fibre, CVI c14, implanter c15, MTJ, GTM), L22 (MTJ, BEUV c11, mK c9, GTM); L44 (MOCVD c28, BEUV c13, GTM reactor and cutter, photonic foundry f+1), L45 (crystal growth c34, MBE c14, BEUV c14, GTM cutter, He refrigerator, GTM); L29's microcomb from B3; `sis_scrap` EB c35; machine 2 c2 (`shell_gradient_map`) deletes B2's pendingRoutes.
- **`<name>`:** `imager`. **Depends on:** B3, T1. **Acceptance:** spin map and ephemeris obtainable only at Sgr A*.
- **Tests:** T0. T1: `gg_test_max_imager`, band by integrator. Doubt: forms at Sgr A*. **Commits:** 3.

#### D3. Geroch winch (machine 6)

- **Objective:** machine 6 at Sgr A* (c1 generator, c2 rework; controller with A2's bearing); L17 (waste retrieval c10, decay heat vault f, hot cell c21, GTM canner and assembler), L20 (tether ribbon, stellar elevator c3 at Cygnus, GTM).
- **`<name>`:** `winch`. **Depends on:** T1 (the place), A3, B1. D1 writes other rows of `uxv/cygnus_lift.js`; whichever merges second rebases, no wait. **Acceptance:** canisters burn at ~2.0x; tether wear returns.
- **Tests:** T0. T1: `gg_test_max_winch`, band by integrator. Doubt: generator output through OpV dynamos at Sgr A*. **Commits:** 2.

#### T2. Gate c15 to the belt

- **Objective:** `nsc_belt_seed`; `tables/gate.json` c15 at Sgr A* orbit; `uhv/gate.js:30-34` Sgr A* site; `max-nsc` grant.
- **`<name>`:** `gate_nsc`. **Allowed (extra):** `tables/gate.json` (1 row), `uhv/gate.js` (SITES only); pinned `uhv-gate`.
- **Depends on:** D2, T1; S0-11. **Acceptance:** second hop arrives, platform placed, survives restart.
- **Tests:** T0. T1: `gg_test_max_gate_nsc`, band by integrator. Doubt: the hop from a relay-reached place. **Commits:** 2.

### The belt and the shell

#### R1. Cluster-light furnace (machine 9)

- **Objective:** machine 9 at the belt (c1-c5; c1 gives `silicate_slag` for E1, c3 with pendingUses naming D4, c5 relining); OpV debris harvester and replication refinery rows at the belt; L13 (carbonyl c2, levitation c19, platinum c18, GTM extruder); L36 (extraction c37, GTM reactor, SPS c20, CVI c15; the liner enters the controller and c5); L37 (asteroid processor f at the belt, cryogenic plant f, GTM separator and compressor, nitride works f+2).
- **`<name>`:** `furnace`. **Depends on:** T2; OpV-R1, OpV-R2. **Acceptance:** truss from planetesimals and the liner from older machines, nothing by hand.
- **Tests:** T0. T1: `gg_test_max_furnace`, band by integrator. Doubt: the harvester row runs at the belt. **Commits:** 3.

#### D4. Mass stream injector (machine 7)

- **Objective:** machine 7 at Sgr A* (c1, c2); L14 (megabar c10, SRF c7, GTM canner).
- **`<name>`:** `injector`. **Depends on:** R1, D1. **Acceptance:** stream bundles obtainable; pellets 7/8 returned.
- **Tests:** T0. T1: `gg_test_max_injector`, band by integrator. Doubt: forms at Sgr A*. **Commits:** 2.

#### E1. Accretion feeder (machine 10)

- **Objective:** machine 10 at Sgr A* (controller, shape, `feeder_coil_casing` recipe, c1 generator, c2 panel rework, `loop_accretion_feeder`); L25 (solar vapour f, regolith f, GTM compressor, SPS c19; step 1 is R1's furnace c1), L26 (diamond lattice c10, implanter c16, betavoltaic f, MTJ c19, solar array f), L42 (platinum c19 at the belt, EB c36, CVI c16, MTJ c21, GTM assembler); platinum c20 returns spent Wolter modules; the generator balance.
- **`<name>`:** `feeder`. **Allowed (extra):** the named older tables and scripts (one row each).
- **References:** *10. Accretion feeder*; *Power*; L25, L26, L42; S0-4, S0-13.
- **Depends on:** R1 (`silicate_slag`, belt `pgm_residue`), A3 (field generator, emitter, sensor); S0-13.
- **Invariants:** no EU without a pellet; c1 at 2^30 ≤ VA[MAX]; panels and modules wear and return.
- **Acceptance:** pellets burn at ~2.0x; nothing by hand; the feeder forms only at Sgr A*.
- **Tests:** T0. T1: `gg_test_max_feeder`, band by integrator. Doubt: forms at Sgr A* and its output reaches case 14 (S0-13). **Commits:** 3.

#### G1. Mirror shell and the ending

- **Objective:** machine 8 (structure with segments, c1 vent, c2, c3 *The ending*); the segment recipe as a swarm segment foundry mode (circuit f, H1's cryocooler and controller, R1's coupler); L18 (clock lab c6, SRF c8, mK c10, forge row at Cygnus); credits event or fallback (S0-9); `max_epilogue`.
- **`<name>`:** `shell`. **Allowed (extra):** the OpV forge's table (1 row); the named older tables.
- **Depends on:** every A, B, D, E, H, R and T package, P, W, M1; OpV-D3. S0-2, S0-7, S0-9.
- **Invariants:** c3 is the only 2^35 recipe; it never removes the structure; no creative mode.
- **Acceptance:** the shell forms; the last recipe runs (or its fallback), outputs the seed and rolls credits (or the fallback).
- **Tests:** T0. T1: `gg_test_max_shell`, band by integrator. Doubt: the 33-cube forms and c3 holds 2^35 on two MAX 16 A from case 14. **Commits:** 3. **Serial:** alone.

#### C1. Validator

- **Objective:** `-Tier max` (*Validator*); re-count 10 / 46 (232 steps) / 167 on 71 machines; reachability of every F1 id at its substage; the *Bootstrap check*; balances; exemptions.
- **Allowed:** `tools/analysis/tiers/max.json`, `tools/analysis/test/max-validator.test.mjs`, the one-line changes of *Validator*. **Depends on:** every package. **Tests:** T0. **Commits:** 1.

#### C2. Quests

- **Objective:** *Quests*' ~40 quests in `tools/quests/max-chapter/` and `pl-data-max.mjs`; the integrator generates the chapter. **Depends on:** C1. **Tests:** T0. **Commits:** 1.

#### C3. Integration and release (integrator)

- **Objective:** reopen a v0.16.0 save; T2 batch, then T3; `hidden_until.json` final; STATUS, DECISIONS, CREDITS; index; v0.17.0. **Depends on:** C1, C2.

### Parallel and serial

Uncapped: every package in a wave starts at once, each in its own session (owner-approved unlimited workers). A package's wave is the longest chain of behaviour dependencies (its **Depends on**) before it; ids and circuits never count, because F1 registers them all. The bench stays at three T1 slots: extra T1 runs queue in the order of this table.

| Wave | Packages (all parallel) | Behaviour that gates the wave |
|---|---|---|
| 0 | S0 (13 spikes, any order after S0-1 to S0-3) | — |
| 1 | F1 | S0-1, S0-3 |
| 2 | F2 ∥ W ∥ M1 ∥ T1 ∥ H1 | F1 ids, places, `circuits` block |
| 3 | A0 ∥ A1 ∥ P | F2 cuts (A0, A1); M1 merged on `lib/` (P) |
| 4 | A2 | strand and hull (A0), mainframe (A1) |
| 5 | B1 ∥ B2 | the first six components |
| 6 | A3 ∥ D1 | belt and gradiometer (A3); T1's place, B1's membrane, A2 (D1, S0-10) |
| 7 | A4 ∥ B3 ∥ D3 | the last components (all three); T1's place (D3); W's toroid (A4) |
| 8 | B4 ∥ D2 | Rydberg array and microcomb (B3) |
| 9 | T2 | `nsc_ephemeris` (D2), the first hop (T1), S0-11 |
| 10 | R1 | the belt (T2) |
| 11 | D4 ∥ E1 | pellet blank (R1) and megabar rows (D1); slag and belt PGM (R1), components (A3), S0-13 |
| 12 | G1 | every product of the shell and the last recipe |
| 13 | C1 → C2 → C3 | — |

Peak width is five (wave 2); the critical path is S0, F1, F2, A0, A2, B1, A3, B3, D2, T2, R1, E1 or D4, G1, C1-C3. A wider cut would need a package to run before the product it consumes exists, which is not safe.

**Serial by nature:** `lib/` (M1 then P, integrator-run); `hidden_until.json`, quest chapter, index (integrator); `tables/max_ids.json` (F1 only); `tables/gate.json` (T1 then T2, a behaviour chain).

**Shared older files** (rows and circuits per writer are in *Circuits by type*; one owner per row, so the first to merge goes in and the others rebase, nobody waits):

| Shared file or type | Writers (any order) |
|---|---|
| `uxv/spin_deposition.js` (MTJ); UXV oxide PLD | A1, B1, A3, D2, E1, H1, B3; W, A4 |
| `tables/spin_logic.json` (vdW); YIG LPE; racetrack | B1; A2; H1 |
| `tables/shequid_mnt.json`; `tables/vela_pasta.json`; `uhv/elevator.js` | A2, B2; A0; A0, B1, D3 |
| `tables/cygnus_disk.json`, `uiv/matrioshka.js`; `tables/cygnus_lift.json` | D1; D1, D3 |
| UIV TFLN; femto; BEUV; mK; SHB; levitation; decay heat vault | A1, B2, A2, B3; A1, D1, B3, A2; A1, D2, B3; A1, D2, G1, A2; B3; R1, H1, A2; D3 |
| `tables/isotopes.json`; `tables/earth_orbit.json`; SNSPD, photonic hall | B2, B3; A1, B2, B3; A1 |
| `tables/composites.json` (SiC fibre, CVI); `tables/electron_beam.json` | A2, D2, R1, E1; B1, D2, E1 |
| megabar; nitride magnet works; single crystal foundry | D1, D4; A2, R1; A2, B1 |
| `tables/crystals.json`; clock lab; MBE; SiC fab; SPS; photonic foundry | A1, B3, B2, H1, D2; G1, B3; A1, B2, D2; A3, H1; A2, D1, E1, R1; B3, D2 |
| `uv/photonics.js` (MOCVD, fibre); zone refining; SRF | A1, B1, B3, D2; B1, B3; D4, G1 |
| diamond lattice; implanter; aerogel; biofoundry | A3, E1; A3, D2, E1; B4, A2; B4 |
| CC; HTS; He refrigerator (keyed by input) | A2, B1, W, A4; same; B1, W, B2, A4, B3, D2 |
| extraction cascade; platinum plant; `tables/hot_cell.json` | B1, D1, H1, A2, R1; R1, E1; D3 |
| the single-writer machines first used by the repair | one package each (*Circuits by type*) |
| `tables/relay_platforms.json`, `tables/max_ids.json` (`circuits` block) | F1 only |

## Decisions proposed

- 2026-10-30 MAX route: horizon strand at SGR and the MAX hull without travel; the supracausal mainframe from three lines on older machines; gate c14 at Cygnus throws a `gc_relay_probe` (OpV parts, magsail) to `gcyr:black_hole_orbit` (tier 14; fallback `grindless:sgr_a_orbit`); gate c15 at Sgr A* orbit throws a belt seed to `grindless:nsc_belt`. Substages `max`, `max-sgra`, `max-nsc`.
- 2026-10-30 MAX size: 10 multiblocks, 46 lines (232 steps, average 5.04, each with at least four feedstock transformations besides any final assembly or cooling), 167 crossings with UXV-and-older lines on 71 machines, 78 older machines with a new mode; above OpV's 45 lines and 141 crossings; rule 7's ~24 / ~68 / ~212 missed by 14 / 22 / 45 with no padding, every missing item named.
- 2026-10-30 MAX repair: machine 10 (accretion feeder) makes the belt slag a fuel instead of a void; the Th-229 clock crystal is dropped as a second route (UHV and OpV already make it); lines count only with at least four feedstock transformations besides assembly or cooling, so older lines gained real GTM steps rather than new crossings.
- 2026-10-30 MAX build: implementation workers uncapped (owner-approved), waves gated only by behaviour dependencies (peak five, 14 waves); ids and circuits never gate because F1 registers them all; the bench keeps three T1 slots and queues the rest; `lib/` stays serial.
- 2026-10-30 MAX components: GTM has none, so nine `grindless:max_*` components; hull and 29 parts are GTM's `gtceu:max_*` ids with our recipes; no basic machines; `#gtceu:circuits/max` = `gtnn:supracausal_mainframe` only, GT--'s family cut or hidden.
- 2026-10-30 Correction: V[MAX] = 2,147,483,648 (2^31, a long), not Integer.MAX_VALUE; VA[MAX] = 2,013,265,920 (GTValues.java:60-73).
- 2026-10-30 MAX 2^31 plan: machine rows ≤ VA[MAX]; long rows only c14, c15 (2^33) and the shell's last recipe (2^35 on two MAX 16 A, fallback 2^33 x 4,800 t); written as V x amps.
- 2026-10-30 MAX power: no fusion tier 14; Geroch winch, BZ and Penrose rows at Sgr A*, the accretion feeder (machine 10, belt slag pellets from L25, ~2.0x), shell vent, each on a stated fuel at 1.3-2.5x; wireless case 14 caps V[MAX] x A x 10 as long.
- 2026-10-30 MAX scale: `grindless:max_parallel_hatch` x1,048,576 (lib, serial); MAX_ROWS 64 (lib, serial); no mega member.
- 2026-10-30 MAX ending: the mirror shell's last recipe outputs `universe_seed` (MAX+ hook) and rolls credits (fallback book and quest); no creative ending; repeatable.
- 2026-10-30 MAX fiction: the NSC belt, horizon strand, shell-scale superconducting membranes, interior plasma clearing, cluster-light concentration, the feeder's injection ring (named fiction); Sgr A* spin 0.9 and the universe seed (pack fiction).
- QR-MAX: as QR-OpV with MAX components (≥8 from ≥3 families) and four MAX circuits; casings and segments assembler rows; each of the 10 structures passes the rubric; each new type gets its `loop_<machine>`.
- QR-MAX gate tiers (F2, integrator): `eraTier` `max: 14`; `complexFloor` `"14": 8` *(tune)*; `max` in process_audit `ERAS`/`TIER_ERA`; `recipe_quality.mjs:228` to tiers 10-14.

**CREDITS lines proposed:** GCYR (LGPL-3.0): `black_hole_orbit` dimension used as a place (and its sky settings copied in the fallback, credited). GT-- (AGPL): `gtnn:supracausal_mainframe` used in game, none of its code. GTMUtils: item hidden only. Physics sources are cited in each machine section.

## Open questions

1. **10 / 46 / 167 against ~24 / ~68 / ~212?** **Default: accept, no padding**: lines and crossings exceed OpV; the 14 machines, 22 lines and 45 crossings still missing are each named with a reason under *Considered and dropped*. A further pass only if the owner rejects one of those reasons.
2. **If S0-2 fails, the last recipe at 2^33 for 4,800 t?** **Default: yes**, same EU.
3. **`gcyr:black_hole_orbit` or our own dimension?** **Default: GCYR's** if S0-1 passes.
4. **A mega member for MAX?** **Default: no**; the x1,048,576 hatch serves the existing members.
5. **x1,048,576 or x262,144 for the MAX hatch?** **Default: x1,048,576** if S0-6 passes.
6. **Shell size 33-cube or 25-cube?** **Default: 33** if S0-7 passes.
7. **Credits on the last recipe, every run or the first?** **Default: first run per player**.
8. **Sgr A* spin a = 0.9?** **Default: yes**, marked pack fiction.
9. **Generator balance band 1.3-2.5x?** **Default: yes**, C1 enforces it.
10. **~40 quests?** **Default: yes** *(tune)*.
11. **Hull row on GCYM's large assembler?** **Default: yes**; GTM's assembler if the large one rejects the casing.
