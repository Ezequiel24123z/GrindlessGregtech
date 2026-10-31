# OpV (T13): the galactic bulge

OpV is the era of the galactic bulge: the old, crowded, metal-rich core of the Milky Way (Barbuy, Chiappini & Gerhard 2018, ARA&A 56:223). The player reaches two places in it, revisits one place on the arm, and makes three things the pack has never had:

- **industrial antimatter**: antiprotons by the beam and antihydrogen by the cell, contained and annihilated with every loss given a destination;
- **stable exotic matter**: strangelets grown from heavy-ion fireballs;
- **Kugelblitz**: micro black holes made of light, held charged inside an absorber shell and fed until they are spent.

Places:

- **SGR 1806−20 orbit** (`grindless:sgr1806_orbit`, new): a magnetar about 8.7 kpc away, roughly 1.5 kpc from the Galactic Centre (Bibby 2008, MNRAS 386:L23; Kouveliotou 1998, Nature 393:235; giant flare: Hurley 2005, Nature 434:1098). Here the player takes chain matter from the crust, freezes field into plate, and makes positrons by one-photon pair production in a field above the quantum critical field.
- **Terzan 5 core** (`grindless:terzan5_core`, new): a bulge globular cluster about 5.9 kpc away, with two stellar populations and dozens of millisecond pulsars (Ferraro 2009, Nature 462:483; Origlia 2011, ApJL 726:L20; Ransom 2005, Science 307:892). Here self-replicating probes are built from the core's debris (named fiction), and the bulge collector swarm catches starlight.
- **Cygnus X-1 orbit** (`grindless:cygnus_x1_orbit`, UIV place, revisited a second time): the jet beam line, the antiproton source, the strangelet distiller, the Kugelblitz forge and the Hawking collector.
- **Home**: tetron circuits, gamma optics, the antihydrogen foundry, the strangelet vault, the annihilation engine, the components and the cosmic mainframe.

The OpV voltage is V[OpV] = 536,870,912 (2^29); VA[OpV] = 503,316,480. GTM's ladder is 8 x 4^n, and T14 is MAX; no voltage is invented (journey.md:14). OpV ends with a gate that holds **2^33 EU/t** (16 A x V[OpV]) and opens MAX: Sagittarius A*, the mirror shell and the largest multiblock (journey.md:54). It pre-empts none of it (DECISIONS.md:450).

The owner's directive (2026-10-29) shapes the whole era:

- OpV has GregTech's full component family: motor, pump, conveyor, piston, robot arm, emitter, sensor, field generator and fluid regulator.
- It has the basic single-block machines at OpV, on GTM's own ids, once the separate highTierContent retrofit (HT) has turned on `highTierContent`.
- Every OpV recipe for a machine, hatch or controller takes OpV components in GT-like counts and `#gtceu:circuits/opv`, and runs at OpV voltage.
- Multiblock tooltips are short, in GTM's style.

| | UXV (as designed, uxv.md:20-28) | OpV | Guideline (rule 7) |
|---|---|---|---|
| Progression multiblocks (ours) | 21 | **18** | 28 (x1.35) |
| Process lines (at least 4 steps each) | 49 (359 steps, average 7.33) | **45** (216 steps, average 4.80) | 74 (x1.5) |
| Crossings with lines two or more eras back | 178 (UEV and older, 44 machines) | **141** (UIV and older, 49 machines) | 267 (x1.5) |
| Older machines with a new mode | 46 | **49** | — |
| Places | 3 + home | 2 new + Cygnus X-1 (revisited) + home | — |
| Components | 8 (`grindless:uxv_*`) | **9** (GTM `gtceu:opv_*`, with fluid regulator) | — |
| Basic single-block machines | none | **GTM's ELECTRIC_TIERS set at OpV** | — |

**Why 18.** Each of the 18 machines has a product or a power output of its own, and each place has a product of its own. The ten multiblocks missing to reach 28 were all considered and are listed one by one under "Considered and dropped". Most failed rule 3 (a second route to an existing product), rule 8 (energy from a field with no fuel) or "deep, not wide" (a convenience version of a UV-UIV machine). Five machines carry the era:

- the beam line, spallation station and decelerator are three real stages of an antiproton source (CERN AD/ELENA);
- the pair converter and the field-frozen press are the two things only a magnetar field gives.

**Why 45.** OpV counts crossings only with UIV-and-older lines (rule 7 says two eras back), which is a narrower base than UXV's. The 29 lines missing to reach 74 are listed per item under "Considered and dropped": data chains, assemblies, second routes and lines whose only consumer is MAX. The average depth is about 4.8 steps, below UXV's 7.33. Most new chains are component cores and antimatter hardware, which are short in the real world too. Padding them would break rule 2. Open question 1 asks the owner whether to accept this or to send a second design pass.

## Route

1. **The gate.** UXV-B6's warp gate c10 at Cygnus X-1 orbit writes `grindless:bulge_chart` and grants `opv` (uxv.md:830-846). The chart is kept, not consumed; `gtceu:opv_machine_casing` is researched with it.
2. **The relay to SGR 1806−20.** A new warp gate mode c11, at Cygnus orbit on two UXV 16 A hatches (16 A x V[UXV] = 2^31, proven by UXV-S0), throws a `bulge_relay_seed`. The seed is made only from UXV parts: a pasta-strand magsail, a SHeQUID gyro and an FRC cartridge. It brakes on the bulge's interstellar medium with its magsail (Zubrin & Andrews 1991, JSR 28:197) and unfolds the SGR platform. This is UIV-B1's relay mechanism (DECISIONS.md:498); `grindless:sgr1806_orbit` opens as substage `opv-sgr`.
3. **Chain matter.** At SGR, new modes of UXV's four pasta machines skim the magnetar's outer crust. Its Fe-56 and Ni-62/64 layers are real (Chamel & Haensel 2008, LRR 11:10); its chain structure in B ≫ B_q is real (Lai 2001, RMP 73:629), and keeping it outside the field is named fiction. The modes cage the crust in `grindless:cage_part`, draw `gtceu:chain_strand` wire and laminate `chain_lamina_stack`. The OpV hull is `gtceu:opv_machine_hull` = opv casing + chain strand cable + lamina stack. No OpV multiblock is needed yet: the hull and the first controllers run on GTM's assembly line with UXV 4 A hatches (4 x V[UXV] = V[OpV]).
4. **Components and circuits.** The nine OpV component cores (lines 4-10) and the cosmic mainframe (an assembly joined on UEV's photonic integration hall from the parts of lines 13-16; lines 11-18 make the dies) come from new modes of older machines and chain matter only. The field-frozen press (machine 13, at SGR) makes `field_frozen_plate`; with the AlN power die (line 45) it gives the OpV energy hatches. The basic single-block machines follow.
5. **Home and Cygnus.** At home: tetron arrays, gamma optics, the antihydrogen foundry, the strangelet vault and the annihilation engine. At Cygnus orbit: the jet beam line, antiproton source and decelerator, the strangelet distiller, the Kugelblitz forge and the Hawking collector. At SGR: the magnetic pair converter, the only maker of dense positron cells.
6. **Terzan 5.** Warp gate c12 throws a home-made `pathfinder_probe` (tetron array, XNAV unit, SHeQUID gyro, a Hawking drive) into the cluster. The pathfinder brakes on its Hawking drive, because globular clusters are too gas-poor for a magsail (Freire 2001, ApJL 557:L105), and opens `opv-terzan5`. There the debris harvester, the replication refinery and the von Neumann foundry turn debris into seeds. Every seed copy costs metal feedstock, sinter casing and a home-made vitamin kit. Each seed carries collector nodes into the swarm, whose light feeds the bulge collector.
7. **The MAX gate.** Warp gate c13 holds 2^33 EU/t on two OpV 16 A hatches for 1,200 t *(tune)*. It consumes a Kugelblitz core and keeps the bulge light census, stable exotic matter, a tetron array, the superheavy census IV, the bulge chart and four cosmic mainframes. It writes `grindless:sgr_a_chart`, researches `gtceu:max_machine_casing` and grants `max`.

## Inherited, as built

| Inherited | From | State at eb9568fc |
|---|---|---|
| Warp gate (`gtceu:warp_gate`, uhv/gate.js:40), c10, `bulge_chart` (uxv/foundation.js:134), the `opv` grant | UXV-B6 | to come (design: uxv.md:830-846) |
| Pasta extractor, phase sorter, draw bench, laminator (uxv/vela_pasta.js:41, :49, :57, :65), `lasagna_plate`, `pasta_core_sample` | UXV-B4 | merged |
| `cage_part` (UIV neutronium cage mode, uiv/rx_j1856.js:77) | UXV-B4 | merged |
| UXV hull, UXV 4 A/16 A energy hatches (on UEV's builders, uev/foundation.js:181, :194) | UXV-B4 | merged |
| `frc_cartridge`, `disk_plasma`, `filtered_disk_plasma`, `stellar_plasma` (uxv/foundation.js:112) | UXV-B2, B3 | merged |
| `gamma_laser_module`, `positron_stack` (uxv/foundation.js:113-114), annihilation laser works | UXV-B5 | running |
| `shequid_gyro` (uxv/foundation.js:74), `gum_metal_blank` (:78), MTJ sputter cluster (uxv/spin_deposition.js:37) | UXV-A6, A8, A4 | merged |
| UXV parallel hatch (lib/parallel_hatch.js:81 pattern), wireless case 12 (lv/wireless_energy.js:305) | UXV-M1, W | merged |
| Stellar fractionation hall (mega) | UXV-M2 | running |
| `-Tier uxv` validator, UXV quests, release v0.15.0 | UXV-C1-C3 | to come |
| Relay seed and platform mechanism (UIV-B1; DECISIONS.md:498); xray pulse profiler at J0437 (uiv/j0437.js:75); `neutronium_pellet`, `cf249_target_wheel` | UIV | shipped v0.14.0 |
| Positron accumulator (uhv/antimatter.js:68), `empty_penning_trap` (:57), `positron_cartridge` (uhv/foundation.js:89); antimatter trap (uv/accelerators.js:97) | UHV, UV | shipped |
| `gtceu:opv_*` components, hull, energy hatches, basic machines (GTM ids under `highTierContent: true`) | **HT retrofit** (separate) | to come |

UXV ids reused here are only consumed or kept, never redefined. The UXV changes OpV needs are OpV packages: the SGR site entries for the four pasta machines are added in A0, as older rows in UXV files under the DECISIONS.md:508 placement rule.

## Places and site rules

| Place | Dimension | GCYR tier | Reached by | Products only from there |
|---|---|---|---|---|
| Home | `minecraft:overworld` | — | — | tetron arrays, gamma optics, antihydrogen ice, stable exotic matter, annihilation power, components, cosmic mainframe |
| Cygnus X-1 orbit | `grindless:cygnus_x1_orbit` | 11 (UIV-B1) | UIV warp gate | jet proton beam, antiprotons, strangelet seeds, Kugelblitz cores, Hawking drive, Hawking power |
| SGR 1806−20 orbit | `grindless:sgr1806_orbit` | 13 *(S0-3 PASS)* | c11 bulge relay seed (A0) | chain strand, Ni-64 slab, field-frozen plate, dense positron cells |
| Terzan 5 core | `grindless:terzan5_core` | 13 *(S0-3 PASS)* | c12 pathfinder (R1) | metal feedstock, sinter casing, probe seeds, collector nodes, bulge light |

Site rules (the UIV-B1 SITES table; every far-place machine refuses to form elsewhere, and its T1 forms it at its site):

- **SGR orbit:** vacuum, orbit gravity *(S0-8)*. A magnetar's surface field is about 2 x 10^15 G (Kouveliotou 1998). Machines 12 and 13, and the four pasta machines' SGR modes (c3-c5), need that field. Chain matter, field-frozen billets and pair cascades are made only there; what leaves is frozen plate, wire and sealed cells.
- **Cygnus X-1 orbit:** as UXV. Machines 6-11 are site-locked: the jet, the disk plasma and the place where a failed Kugelblitz seed is dumped are all there. A failed seed releases about 10^17 J as it evaporates; it is thrown into the hole, and the forge never runs at home.
- **Terzan 5 core:** a debris-strewn body in the cluster core *(named fiction; the cluster, its populations and its pulsars are real)*. Gravity is low and there is no atmosphere *(S0-8)*. Machines 14-18 are site-locked. Real globular-cluster cores are gas-poor (Freire 2001), so a magsail cannot brake there; this is why c12 needs a Hawking drive.
- **Home:** machines 1-5 and every component and circuit row. The annihilation engine runs only at home *(design choice: the TPV and absorber chain is home's and the engine's gammas need its shielding)*.

## Bridges and first arrivals

| Item | From → to | Why it travels |
|---|---|---|
| `grindless:cage_part` | RX J1856 (UIV cage) → SGR | chain phases leave the sorter only caged |
| `bulge_relay_seed` → `launched_bulge_seed` | home → Cygnus (c11) → SGR | first arrival at SGR (A0) |
| `gtceu:chain_strand_single_wire`, `_single_cable`, `chain_lamina_stack` | SGR → home | hull, components, coils |
| `ni_chain_slab` (caged) | SGR → home | Ni-64 for the superheavies |
| `field_frozen_plate` | SGR → everywhere | OpV hatches, field generators, traps |
| `seed_positron_plasma` (in `empty_penning_trap`) | home → SGR | the pair converter's seed |
| `dense_positron_cell` | SGR → home, Cygnus | antihydrogen, Kugelblitz charge |
| `ir_spallation_target`, `be_beam_window`, `li6_hydride_shield`, `electron_cooler`, `stochastic_cooling_pickup`, `pb208_beam_cell` | home → Cygnus | the antiproton source and the distiller |
| `cold_antiproton_cell` | Cygnus → home | stacking, antihydrogen, ACMF |
| `strangelet_seed` | Cygnus → home | the vault |
| `stable_exotic_matter` | home → Cygnus | Hawking collector fuel, gate keep |
| `kugelblitz_core`, `hawking_drive` | Cygnus → Cygnus (collector), home (pathfinder), gate | |
| `pathfinder_probe` → `launched_pathfinder` | home → Cygnus (c12) → Terzan 5 | first arrival at Terzan 5 (R1) |
| `vitamin_kit` | home → Terzan 5 | what a probe cannot make from debris |
| `bulge_light_census` | Terzan 5 → Cygnus | gate keep |

## Automatic resource generation

| Source | Machine | Rate *(tune)* |
|---|---|---|
| SGR outer crust, Fe-56 layer | UXV pasta extractor c3 at SGR (a new mode, A0) | 1 `chain_crust_slab` per 600 t |
| SGR outer crust, Ni-62/64 layer | pasta extractor c4 at SGR | 1 `ni_chain_slab` per 1,200 t |
| SGR deeper outer crust, condensed chain lattice (Medin & Lai 2006, PRA 74:062508) | pasta extractor c5 at SGR | 1 `chain_lattice_slab` per 600 t |
| Cygnus X-1 jet (proton-electron jet, spin-powered: BZ, uxv.md machine 15) | jet beam line c1 (machine 6) | 1,000 mB `jet_proton_beam` per 200 t |
| Terzan 5 core debris (named fiction) | debris harvester c1 (machine 14) | 4 `bulge_debris` per 400 t |
| Terzan 5 starlight | bulge collector (machine 18), through consumed node packs | see Power |

Nothing is mined by hand (rule 1), and none of these produces energy by itself: the jet beam line's beam is a feed, not power.

## Only from there and cuts

- **Chain strand, Ni-64 slab, field-frozen plate, dense positron cell:** SGR only. F2's cuts remove GTM's auto-generated routes for the `gtceu:chain_strand` material: the wiremill, extruder and bender routes, and the assembler cable rows with rubber or silicone. They also remove any macerator or arc-furnace return to the ingot. This is the UXV-F2 pasta-wire pattern; each cut is listed in F2.
- **Jet proton beam, antiprotons, strangelet seeds, Kugelblitz cores:** Cygnus orbit only.
- **Metal feedstock, sinter casing, probe seeds, collector nodes, bulge light census:** Terzan 5 only.
- **GTM's OpV recipes:** F2 removes GTM's shaped or assembler recipes for every `gtceu:opv_*` component, the hull, the energy and dynamo hatches and every basic machine. A0, A1, A3 and A4 then replace them with rows at OpV voltage that take OpV components and `#gtceu:circuits/opv`. The items stay hidden until those packages land: the obtain model reads `hidden_until`, and F2 names a pendingRoutes entry for each, naming the package that adds the route.
- **GT-- cosmic circuits:** F2 removes GT--'s own recipe for `gtnn:cosmic_mainframe` and the five `gtnn:cosmic_smd_*` items. A2 replaces them on our lines. S0-4: GT-- registers these recipes in Java, so `event.remove` finds none; F2 locates their source in the jar before cutting them.

## Our multiblocks

| Place | Machines | Count |
|---|---|---|
| Home | tetron fab, gamma optics works, antihydrogen foundry, strangelet vault, annihilation engine | 5 |
| Cygnus X-1 orbit | jet beam line, spallation target station, antiproton decelerator, strangelet distiller, Kugelblitz forge, Hawking collector | 6 |
| SGR 1806−20 orbit | magnetic pair converter, field-frozen press | 2 |
| Terzan 5 core | debris harvester, replication refinery, von Neumann foundry, collector node works, bulge collector | 5 |
| | | **18** |

**Not counted:** `gtceu:assembly_line_array`, the mega member (M2); the OpV parallel hatch (M1); GTM's hull, energy and dynamo hatches and basic machines (HT retrofit ids, our recipes); the three casing blocks (`grindless:field_frozen_casing`, `annihilation_shield_casing`, `neg_xhv_casing`, F1).

### Audit

Keys: what the era needs the machine for. Policy: H home (runs on two UXV hatches until OpV hatches exist), S site-locked, G generator.

| # | Machine | Route only it gives | Keys | Policy |
|---|---|---|---|---|
| 1 | Tetron fab | Majorana tetron qubit arrays | gate keep, pathfinder, vitamin kit, forge controller | H |
| 2 | Gamma optics works | Laue lenses and multilayer gamma mirrors | Kugelblitz forming, Hawking drive | H |
| 3 | Antihydrogen foundry | trapped, laser-cooled antihydrogen frozen into cells | annihilation engine c1 | H |
| 4 | Strangelet vault | strangelets grown and stabilised | Hawking collector fuel, gate keep | H |
| 5 | Annihilation engine | antimatter power with contained losses | power | H, G |
| 6 | Jet beam line | a proton beam drawn from the Cygnus X-1 jet | antiprotons | S |
| 7 | Spallation target station | antiprotons by pair production on iridium | antimatter | S |
| 8 | Antiproton decelerator | stochastic and electron cooling to trap energy | antimatter | S |
| 9 | Strangelet distiller | strangeness distillation from Pb-208 fireballs | exotic matter | S |
| 10 | Kugelblitz forge | micro black holes made of light | Hawking power, Hawking drive, gate | S |
| 11 | Hawking collector | Hawking radiation of a fed micro hole | power | S, G |
| 12 | Magnetic pair converter | one-photon pair production above B_q | dense positrons | S |
| 13 | Field-frozen press | plate with a frozen magnetar field | OpV hatches, field generator, traps | S |
| 14 | Debris harvester | Terzan 5 debris | probes | S |
| 15 | Replication refinery | Mond carbonyl metals, FFC silicon and oxygen | probes | S |
| 16 | von Neumann foundry | seed probes that copy themselves from feedstock | collector swarm | S |
| 17 | Collector node works | PV collector nodes deployed with a seed | collector fuel | S |
| 18 | Bulge collector | beamed bulge starlight | power, bulge light census | S, G |

### Voltages and controllers

OpV recipes run up to 1 A x V[OpV] = 536,870,912 EU/t on two UXV energy hatches, because a multiblock with two or more hatches of its highest tier runs one tier up (WorkableElectricMultiblockMachine.java:250-273, as uxv.md:172 cites). OpV hatches (A3) are needed for:

- every generator (OpV dynamo hatches);
- the 2^30 rows;
- the gate's 2^33 hold.

Until A4's `gtceu:opv_assembler` exists, assembler rows at OpV voltage run in the assembly hall (`gtceu:assembly_hall`, ZPM; or the UHV `gtceu:quantum_fabricator`) on two UXV 4 A hatches: GTM 7.5.3's GCyM `gtceu:large_assembler` takes exactly one energy hatch, so it never reaches V[OpV]. All EU/t and ticks below are *(tune)*. Every OpV row runs at more than V[UXV] = 134,217,728 EU/t (C1 checks).

**OpV component and circuit rule (owner, 2026-10-29).** Every recipe for an OpV machine, hatch, basic machine or controller takes:

- `gtceu:opv_machine_hull`;
- OpV components (`gtceu:opv_electric_motor`, `_electric_pump`, `_conveyor_module`, `_electric_piston`, `_robot_arm`, `_emitter`, `_sensor`, `_field_generator`, `_fluid_regulator`) in GT-like counts;
- `#gtceu:circuits/opv`;
- OpV voltage.

It never takes a UXV-or-lower component or circuit as a component, and never runs at UXV voltage. Research items and domain inputs are exempt; C1 checks the rest.

**Controllers (QR ladder; DECISIONS.md:551-567).** Each controller is a GTM `assembly_line` recipe with station research (`data_module`), at VA[OpV] = 503,316,480 EU/t for 2,400 t *(tune)*. The base is:

- the OpV hull;
- the components in the table;
- 4 `#gtceu:circuits/opv` (8 for machines 5, 10, 11, 16, 18 and M2);
- 1,000 mB `grindless:superfluid_helium_3` (line 5, the era fluid);
- three domain inputs.

Every controller has 9 or more distinct ingredients. No controller takes `opv_field_generator` before A3, because the field generator needs `field_frozen_plate` from machine 13 (bootstrap). No controller takes a product of a place before that place opens; the Terzan 5 controllers are built at home and carried.

| # | Research item | Components | Domain inputs |
|---|---|---|---|
| 1 | `inas_al_wafer` | 4 robot arm, 4 sensor, 2 field generator | `cryo_cmos_die`, `nb_tsv_interposer`, `chain_field_coil` |
| 2 | `hpge_compton_crystal` | 4 emitter, 4 sensor, 2 robot arm | `field_frozen_plate`, `th229_lasing_crystal`, `opv_harmonic_drive` |
| 3 | `octupole_trap_magnet` | 4 field generator, 4 emitter, 2 pump | `grindless:neg_xhv_casing`, `levitation_trap_cell`, `lyman_alpha_laser` |
| 4 | `pb208_beam_cell` | 4 field generator, 4 pump, 2 sensor | `field_frozen_plate`, `neutronium_pellet`, `chain_field_coil` |
| 5 | `gamma_absorber_tile` | 4 field generator, 4 pump, 4 sensor | `tpv_panel`, `li6_hydride_shield`, `octupole_trap_magnet` |
| 6 | `be_beam_window` | 4 field generator, 4 emitter, 2 pump | `chain_field_coil`, `frc_cartridge`, `field_frozen_plate` |
| 7 | `ir_spallation_target` | 4 field generator, 4 sensor, 2 pump | `li6_hydride_shield`, `be_beam_window`, `grindless:srf_cavity` |
| 8 | `electron_cooler` | 4 field generator, 4 sensor, 2 emitter | `stochastic_cooling_pickup`, `grindless:srf_cavity`, `chain_field_coil` |
| 9 | `pb208_beam_cell` | 4 field generator, 4 pump, 2 sensor | `pasta_core_sample`, `field_frozen_plate`, `grindless:neg_xhv_casing` |
| 10 | `laue_lens` | 8 emitter, 4 field generator, 4 sensor | `gamma_multilayer_mirror`, `tetron_array`, `frc_cartridge` |
| 11 | `kugelblitz_core` | 4 field generator, 4 sensor, 4 pump | `gamma_absorber_tile`, `tpv_panel`, `stable_exotic_matter` |
| 12 | `seed_positron_plasma` | 4 field generator, 4 emitter, 2 sensor | `gamma_laser_module`, `chain_field_coil`, `field_frozen_plate` |
| 13 | `chain_lamina_stack` | 4 piston, 4 motor, 2 robot arm | `chain_field_coil`, `gtceu:chain_strand_single_cable`, `lasagna_plate` |
| 14 | `node_power_transmitter` | 4 conveyor, 4 robot arm, 2 sensor | `chain_composite_rod`, `field_frozen_plate`, `xnav_unit` |
| 15 | `bulge_debris` | 4 pump, 4 fluid regulator, 2 sensor | `chain_field_coil`, `grindless:neg_xhv_casing`, `field_frozen_plate` |
| 16 | `metal_feedstock` | 4 robot arm, 4 conveyor, 4 field generator | `tetron_array`, `xnav_unit`, `cluster_sinter_casing` |
| 17 | `cluster_sinter_casing` | 4 robot arm, 4 emitter, 2 sensor | `node_power_transmitter`, `tpv_panel`, `field_frozen_plate` |
| 18 | `collector_node` | 4 sensor, 4 field generator, 4 emitter | `cryo_optical_link`, `node_power_transmitter`, `aln_power_die` |
| M2 | `tetron_array` | 8 robot arm, 8 conveyor, 4 sensor, 4 field generator | `opv_harmonic_drive`, `cryo_optical_link`, `nb_tsv_interposer` |

Research items 15 and 16 are Terzan 5 products. Each is made by the machine before it (14 before 15, 15 before 16), so neither is a cycle (Risks, bootstrap).

**The OpV components (A1; GTM ids under HT).** Each runs at 268,435,456 EU/t *(tune)* on the assembler (GCYM large assembler until A4) and takes 2 `#gtceu:circuits/opv` unless stated:

| Component | Recipe *(tune)* |
|---|---|
| `gtceu:opv_electric_motor` | 1 `chain_field_coil` + 2 `chain_composite_rod` + 4 `gtceu:chain_strand_single_wire` + 2 `gtceu:chain_strand_single_cable` + 250 mB superfluid He-3 (no circuit, as GTM's motor) |
| `gtceu:opv_electric_pump` | 1 motor + 1 `chain_composite_rotor` + 2 `superfluid_he3_seal` + 2 `chain_lamina_stack` + 1 cable (no circuit) |
| `gtceu:opv_conveyor_module` | 2 motors + 2 `chain_mesh_belt` + 1 cable (no circuit) |
| `gtceu:opv_electric_piston` | 1 motor + 1 `opv_harmonic_drive` + 2 `chain_composite_rod` + 2 `chain_lamina_stack` + 2 cables (no circuit) |
| `gtceu:opv_robot_arm` | 2 motors + 1 piston + 2 `opv_harmonic_drive` + 2 cables + 1 circuit |
| `gtceu:opv_emitter` | 1 `th229_lasing_crystal` + 2 circuits + 2 cables + 2 `chain_lamina_stack` + 1 `cryo_optical_link` |
| `gtceu:opv_sensor` | 1 `hpge_compton_crystal` + 2 circuits + 2 cables + 2 `chain_lamina_stack` + 1 `cryo_optical_link` |
| `gtceu:opv_field_generator` | 1 emitter + 2 `chain_field_coil` + 4 `field_frozen_plate` + 2 circuits + 2 cables (A3: needs machine 13) |
| `gtceu:opv_fluid_regulator` | 1 pump + 1 `opv_harmonic_drive` + 2 circuits |

**Hull and hatches (A0, A3):**

- `gtceu:opv_machine_hull`: 1 `gtceu:opv_machine_casing` + 2 `gtceu:chain_strand_single_cable` + 2 `chain_lamina_stack` + 500 mB superfluid He-3 (268,435,456 EU/t, 200 t).
- `gtceu:opv_energy_input_hatch` (2 A, GTM's plain hatch): hull + 2 cables + 1 `opv_sensor` + 2 circuits + 2 `field_frozen_plate` + 1 `aln_power_die`.
- 4 A (`gtceu:opv_energy_input_hatch_4a`): the 2 A hatch + 2 `aln_power_die` + 2 `chain_field_coil` + 1 `opv_field_generator` + 2 circuits.
- 16 A (`gtceu:opv_energy_input_hatch_16a`): the 4 A hatch + 4 `aln_power_die` + 2 `opv_field_generator` + 4 circuits.
- Dynamos (`gtceu:opv_energy_output_hatch` 1 A, `_4a`, `_16a`) mirror the inputs, with `opv_emitter` in place of the sensor.
- All at VA[OpV], 1,200 t.

### 1. Tetron fab: `gtceu:tetron_fab`, type `gtceu:tetron_assembly` (home)

**What it gains:** builds measurement-based topological qubits, two InAs-Al nanowires joined by a superconducting backbone (a tetron), and the parity readout that ties them into an array. Nothing older builds a qubit that is read by interferometric parity. The interferometric parity measurement is real (Aghaee 2025, Nature 638:651). The topological protection the array claims is *named fiction*.
**Recipes:**
- c1 1 `gated_2deg_wafer` + 1 `cryo_cmos_die` → 4 `tetron_die` (268,435,456 EU/t, 1,200 t).
- Between c1 and c2 each die is In-bumped on the UXV MTJ sputter cluster, flip-chip bonded to an `nb_tsv_interposer` on the UIV TFLN fab and parity-tested in the UIV millikelvin works (new modes) → `tested_tetron_die` (line 19).
- Failed dies (10% *(tune)*) → `failed_tetron_die` → EV extraction cascade (In recovery).
**Byproducts:** failed dies, as above.
**Structure (QR):** 9x7x11 cleanroom bay. A dilution-fridge mast stands in the centre, wafer handlers sit on both sides and a load lock is at the front.
- Blocks: `gtceu:plascrete` (appearance, about 50%); `gtceu:cleanroom_glass` (about 20%); a `gtceu:superconducting_coil` ring round the mast; `gtceu:tungstensteel_pipe_casing` helium runs; `gtceu:stainless_steel_frame` handlers.
- Kinds: glass, coil, pipe, frame.
- Hatches: energy and maintenance at the back; buses at the load lock.
**Crossings:** UIV TFLN fab (flip-chip bond), UIV millikelvin works (parity test), EV extraction cascade (failed dies); its wafers cross the UIV STM lithography and BEUV scanner (lines 12-13).
**Risks:** the weakest claim of the 18: one product line. Kept because the tetron array is the only OpV qubit and three later recipes need it.
**Source:** Aghaee 2025 (Nature 638:651); Karzig 2017 (PRB 95:235305, tetron design); Rosenberg 2017 (npj Quantum Inf. 3:42, flip-chip 3D-integrated qubits).

### 2. Gamma optics works: `gtceu:gamma_optics_works`, type `gtceu:gamma_optics` (home)

**What it gains:** focuses MeV gammas, which nothing older can do.
- Laue lenses: Bragg diffraction in transmission through hundreds of bent Ge and GaAs tiles, aligned to arcseconds.
- WC/SiC multilayer mirrors: they reflect gammas at grazing incidence up to hundreds of keV (Fernández-Perea 2013, PRL 111:027404).
**Recipes:**
- c1 32 `bent_ge_tile` + 32 `gaas_laue_tile` + 1 `aligned_laue_frame` → `laue_lens` (268,435,456 EU/t, 1,600 t).
- c2 1 `superpolished_sic_blank` + 1 `wc_sic_multilayer` + 1 `mirror_metrology_record` (UV synchrotron X-ray reflectivity, new mode) → `gamma_multilayer_mirror` (268,435,456 EU/t, 1,200 t).
**Byproducts:** rejected tiles → UEV megabar (re-bent, 75% back).
**Structure (QR):** 7x7x15 optical bench, a long vacuum tube on a granite bed with the lens frame at the far end.
- Blocks: `gtceu:high_power_casing` (appearance); `gtceu:laminated_glass` tube windows; `gtceu:tungsten_steel_frame` bed; `gtceu:heat_vent` at the ends.
- Kinds: glass, frame, vent.
- Hatches: on the bed.
**Crossings:** UEV megabar, UHV crystal growth, UV synchrotron (Laue tiles and mirrors are characterised on synchrotron beamlines, as at ESRF), UXV sputter cluster (not counted).
**Risks:** none beyond circuits on shared types.
**Source:** Fernández-Perea 2013 (PRL 111:027404); Frontera & von Ballmoos 2010 (X-Ray Optics Instrum. 2010:215375, Laue lenses).

### 3. Antihydrogen foundry: `gtceu:antihydrogen_foundry`, type `gtceu:antihydrogen_synthesis` (home)

**What it gains:** merges cold antiprotons and dense positrons in an octupole-mirror trap, laser-cools the antihydrogen on Lyman-α (Baker 2021, Nature 592:35) and freezes it into a cell. Nothing older makes neutral antimatter. Trapping and cooling are real; solid antihydrogen in a levitation cell is *named fiction*.
**Recipes:**
- c1 1 `cold_antiproton_cell` + 1 `dense_positron_cell` + `octupole_trap_magnet` (catalyst, wear 1/64) → `trapped_antihydrogen` (268,435,456 EU/t, 1,200 t).
- c2 + `lyman_alpha_laser` (catalyst, wear 1/128) → `cooled_antihydrogen` (268,435,456 EU/t, 800 t).
- c3 + 1 `levitation_trap_cell` → `antihydrogen_ice_cell` (503,316,480 EU/t, 1,600 t).
- Empty Penning traps return (90%).
**Byproducts:** annihilation losses in the trap (5% *(tune)*) → gamma heat in the `annihilation_shield_casing` walls (no item; rule 3: honest loss, stated in the tooltip).
**Structure (QR):** 9x9x13 trap hall. The trap axis runs through a ring of octupole coils, with the laser enclosure on top.
- Blocks: `grindless:neg_xhv_casing` (appearance, about 40%: the trap vacuum); `grindless:annihilation_shield_casing` outer wall; `gtceu:superconducting_coil` octupole ring; `gtceu:fusion_glass` laser ports; `gtceu:tungstensteel_pipe_casing` cryo runs.
- Kinds: shield, coil, glass, pipe.
- Hatches: back wall.
**Crossings:** UHV crystal growth (Ti:sapphire, LBO), IV fluorspar kiln (MgF₂), UHV Penning trap.
**Risks:** the Penning trap round-trip (c1 returns traps); the obtain model must see the return.
**Source:** Baker 2021 (Nature 592:35); Ahmadi 2017 (Nature 548:66, 1S-2S); Amole 2012 (NIM A 735:319, ALPHA trap).

### 4. Strangelet vault: `gtceu:strangelet_vault`, type `gtceu:strangelet_growth` (home)

**What it gains:**
- It grows strangelet seeds by neutron absorption. A positive strangelet has no Coulomb barrier for neutrons (Farhi & Jaffe 1984, PRD 30:2379).
- Then it holds them in a field-frozen Penning trap until they reach a stable size.

Strange quark matter as the ground state is the Witten hypothesis (Witten 1984, PRD 30:272); that it is stable here is *named fiction*.

**Recipes:**
- c1 1 `strangelet_seed` + 4 `neutronium_pellet` (UIV, carried in cage parts) → `fed_strangelet` (268,435,456 EU/t, 1,600 t).
- c2 → `grown_strangelet` + `strangelet_tailings` (503,316,480 EU/t, 2,400 t).
- c3 + 1 `field_frozen_plate` → `stable_exotic_matter` (503,316,480 EU/t, 2,400 t).
**Byproducts:** `strangelet_tailings` (beta-active) → IV hot cell (new mode: decay storage → `gtceu:lead_dust`, inert).
**Structure (QR):** 9x9x9 shielded vault, a trap column in a borated water pool.
- Blocks: `grindless:field_frozen_casing` (appearance); `grindless:annihilation_shield_casing` walls; `gtceu:fusion_glass` pool cover; `gtceu:superconducting_coil` trap rings.
- Kinds: shield, glass, coil.
**Crossings:** UIV neutron drip separator (`neutronium_pellet`), IV hot cell.
**Risks:** none beyond circuits on shared types.
**Source:** Witten 1984; Farhi & Jaffe 1984; Madsen 1999 (Lect. Notes Phys. 516:162, strangelet review).

### 5. Annihilation engine: `gtceu:annihilation_engine`, type `gtceu:annihilation_power` (home, generator)

**What it gains:** turns annihilation into power with every loss given a destination.
- π⁰ gammas stop in W/B₄C absorber tiles, and their heat drives a TPV panel wall (LaPotin 2022, Nature 604:287).
- Charged pions are turned in a magnetic nozzle and thermalised.
- About half the energy leaves as neutrinos and is lost (Frisbee 2003, AIAA 2003-4696).
**Recipes (generator, EU out; see Power for balance):**
- c1 1 `antihydrogen_ice_cell` + 1,000 mB hydrogen → 2^29 EU/t for 1,200 t *(tune)*.
- c2 1 `acmf_pellet` + 1 `antiproton_stack_opv` → 2^30 EU/t for 1,200 t *(tune)*.
- Each run wears 1/16 `gamma_absorber_tile` → `activated_absorber_tile`, and returns the empty `levitation_trap_cell` (95%).
**Byproducts:** `activated_absorber_tile` → IV hot cell (decay storage, then W/B₄C powder back to UHV SPS); neutrinos lost (tooltip says so).
**Structure (QR):** 11x11x11 sphere-in-a-cube. The reaction chamber is in the middle, rings of absorber tiles round it and a TPV wall outside them.
- Blocks: `grindless:annihilation_shield_casing` (appearance, about 50%); `gtceu:fusion_coil` nozzle rings; `gtceu:heat_vent` TPV wall; `gtceu:tungstensteel_pipe_casing` coolant.
- Kinds: coil, vent, pipe.
- Hatches: OpV dynamo hatches only (1 A for c1, 4 A for c2; S0-2).
**Crossings:** IV hot cell, UHV SPS, UV antimatter trap (stack), IV fuel fabrication (pellet).
**Risks:** rule 8 is held by the balance (Power).
**Source:** Frisbee 2003; LaPotin 2022; Forward 1985 (AFRPL TR-85-034, antiproton annihilation propulsion).

### 6. Jet beam line: `gtceu:jet_beam_line`, type `gtceu:jet_beam_extraction` (Cygnus X-1 orbit)

**What it gains:** draws protons from the base of Cygnus X-1's jet, which is real (Gallo 2005, Nature 436:819 for the jet's power). The beam line then bunches them on SRF cavities into a beam no Earth injector reaches.
**Recipes:**
- c1 (auto) `be_beam_window` (wear 1/32) + `grindless:srf_cavity` (catalyst) → 1,000 mB `jet_proton_beam` (268,435,456 EU/t, 200 t).
- c2 + 100 mB `flux_loaded_plasma` (UXV FRC former c2, the hook uxv.md:618 leaves) → 2,000 mB `jet_proton_beam` (503,316,480 EU/t, 200 t).
**Byproducts:** jet electrons → dumped back into the hole (no item, tooltip).
**Structure (QR):** 5x5x21 beam line, a straight pipe with quadrupole doublets and an SRF module.
- Blocks: `gtceu:high_power_casing` (appearance); `gtceu:superconducting_coil` quads; `grindless:srf_cryomodule_block` (UV block) cavity section; `gtceu:fusion_glass` diagnostics.
- Kinds: coil, cryomodule, glass.
**Crossings:** UV SRF cavity works, EV hot strip mill (window foil).
**Risks:** a site fluid (it never leaves Cygnus).
**Source:** Gallo 2005 (Nature 436:819); Blandford & Znajek 1977 (MNRAS 179:433).

### 7. Spallation target station: `gtceu:spallation_target_station`, type `gtceu:antiproton_production` (Cygnus X-1 orbit)

**What it gains:** antiprotons by pair production in an iridium target. About 1 antiproton per 10^6 protons at 26 GeV is CERN's real yield; here it is scaled. A magnetic horn collects them; a Li-6 hydride shield catches the neutrons and breeds tritium.
**Recipes:**
- c1 4,000 mB `jet_proton_beam` + `ir_spallation_target` (wear 1/16) + `li6_hydride_shield` (wear 1/32) → 1,000 mB `hot_antiproton_beam` (503,316,480 EU/t, 400 t).
- Spent target → `spent_ir_target`; spent shield → `spent_li6_shield`.
**Byproducts:**
- `spent_ir_target` → IV hot cell → EV platinum plant (Ir back, 85%).
- `spent_li6_shield` → IV tritium removal facility → tritium (line 22; its He-3 goes back to line 5).
- Pions and neutrinos are lost in the dump (tooltip).
**Structure (QR):** 9x7x13 target hall, a target wheel in a shielded pit with the horn after it.
- Blocks: `grindless:annihilation_shield_casing` (appearance); `gtceu:superconducting_coil` horn; `gtceu:tungstensteel_pipe_casing` coolant.
- Kinds: coil, pipe.
**Crossings:** IV hot cell, EV platinum plant, IV tritium removal facility.
**Risks:** none beyond circuits on shared types.
**Source:** Autin et al. (CERN AD design, CERN/PS 99-35); Möhl 1997 (Hyperfine Interact. 109:33).

### 8. Antiproton decelerator: `gtceu:antiproton_decelerator`, type `gtceu:beam_cooling` (Cygnus X-1 orbit)

**What it gains:** cools and decelerates antiprotons from GeV to keV, as CERN's AD and ELENA do. Stochastic cooling at high energy (van der Meer, Nobel 1984), then electron cooling at low energy. Then it fills them into Penning traps.
**Recipes:**
- c1 1,000 mB `hot_antiproton_beam` + `stochastic_cooling_pickup` (catalyst, wear 1/64) → 1,000 mB `stochastically_cooled_beam` (268,435,456 EU/t, 800 t).
- c2 + `electron_cooler` (catalyst, wear 1/64) + 1 `empty_penning_trap` → 1 `cold_antiproton_cell` (503,316,480 EU/t, 1,200 t).
**Byproducts:** annihilation losses on residual gas (3%) → heat, no item.
**Structure (QR):** 13x5x13 ring, a hexagonal decelerator ring with the cooler on one straight.
- Blocks: `gtceu:high_power_casing` (appearance); `gtceu:superconducting_coil` dipoles; `grindless:neg_xhv_casing` beam pipe; `grindless:srf_cryomodule_block` RF.
- Kinds: coil, vacuum, cryomodule.
**Crossings:** UHV Penning trap, UV SRF cavity.
**Risks:** none beyond circuits on shared types.
**Source:** van der Meer 1985 (Rev. Mod. Phys. 57:689); Maury 2014 (Hyperfine Interact. 229:105, ELENA).

### 9. Strangelet distiller: `gtceu:strangelet_distiller`, type `gtceu:strangelet_distillation` (Cygnus X-1 orbit)

**What it gains:** "strangeness distillation" (Greiner, Koch & Stöcker 1987, PRL 58:1825). A Pb-208 beam hits disk plasma; the baryon-rich fireball boils off antikaons and leaves its strangeness behind in a droplet. Here the droplet is caught as a seed, catalysed by `pasta_core_sample`; that it survives is *named fiction*.
**Recipes:**
- c1 1 `pb208_beam_cell` + 1,000 mB `disk_plasma` → `fireball_distillate` (503,316,480 EU/t, 1,200 t).
- c2 + `pasta_core_sample` (catalyst, wear 1/32) → `strangelet_seed` (268,435,456 EU/t, 1,600 t).
- c3 negative strangelets (`negative_strangelet_residue`, 20%) → thrown into Cygnus X-1 (voided by the machine, stated in the tooltip; they would convert ordinary matter).
**Byproducts:** kaons decay, lost; negative strangelets as c3.
**Structure (QR):** 7x7x13 target cell, a beam inlet into a plasma cell with a catcher behind it.
- Blocks: `grindless:field_frozen_casing` (appearance); `gtceu:fusion_glass`; `gtceu:superconducting_coil`.
- Kinds: glass, coil.
**Crossings:** UEV calutron, UEV heavy-ion cyclotron, UV synchrotron (through `pb208_beam_cell`).
**Risks:** c3 is the only voiding row in OpV; the no-voiding lib exempts it by id (F2 row).
**Source:** Greiner, Koch & Stöcker 1987; Witten 1984.

### 10. Kugelblitz forge: `gtceu:kugelblitz_forge`, type `gtceu:kugelblitz_forming` (Cygnus X-1 orbit)

**What it gains:** a black hole made of light, a Kugelblitz.
- **Fiction:** gamma pulses pumped by positron annihilation are focused by Laue lenses and mirrors inside an FRC cartridge until their energy sits within a Schwarzschild radius (Crane & Westmoreland 2009, arXiv:0908.1803 propose this). This is *named fiction* past real laser physics.
- **Real physics:** a 10^9 kg hole has r_s ≈ 1.5 x 10^-18 m, T_H ≈ 1.2 x 10^14 K, about 3.6 x 10^14 W of Hawking radiation and a lifetime of about 2,700 years (Hawking 1974, Nature 248:30; Page 1976, PRD 13:198).
- **How it is held:** charged with positrons and held electrostatically in an absorber shell. It never rotates, so there is no superradiance: that is MAX's mirror shell.
**Recipes:**
- c1 2 `dense_positron_cell` + `gamma_laser_module` (wear 1/8) → `gamma_pump_charge` (503,316,480 EU/t, 800 t).
- c2 4 `gamma_pump_charge` + `laue_lens` + `gamma_multilayer_mirror` (catalysts, wear 1/64) + 1 `frc_cartridge` → `kugelblitz_seed` (503,316,480 EU/t, 2,400 t).
- c3 + 4 `positron_cartridge` + 8 `gamma_absorber_tile` → `kugelblitz_core` (503,316,480 EU/t, 2,400 t).
- c4 1 `kugelblitz_core` + 1 `gamma_multilayer_mirror` + 1 `field_frozen_plate` → `hawking_drive` (268,435,456 EU/t, 1,200 t).
- A failed seed (5% *(tune)*) is thrown into Cygnus X-1 (tooltip).
**Byproducts:** spent catalysts → re-made (gamma optics works); a failed seed as above.
**Structure (QR):** 15x15x15, the largest OpV machine. A spherical mirror cavity sits in a field-frozen shell, with 8 Laue arms pointing in.
- Blocks: `grindless:field_frozen_casing` (appearance, about 40%); `grindless:annihilation_shield_casing`; `gtceu:fusion_glass` arms; `gtceu:fusion_coil` cavity ring.
- Kinds: shield, glass, coil.
**Crossings:** UHV positron accumulator (cartridges), UV synchrotron (through the lens).
**Risks:** must not pre-empt MAX (no rotation, no amplification, no Sgr A* id; C1 checks).
**Source:** Crane & Westmoreland 2009; Hawking 1974; Page 1976; MacGibbon & Webber 1990 (PRD 41:3052).

### 11. Hawking collector: `gtceu:hawking_collector`, type `gtceu:hawking_power` (Cygnus X-1 orbit, generator)

**What it gains:** feeds a Kugelblitz core and collects its Hawking radiation in absorber tiles and TPV, a mass-to-energy converter.
- A hole of r_s ≈ 10^-18 m swallows ordinary matter very slowly. Feeding nuclear-density matter (stable exotic matter) is the rate the machine is built for; stellar plasma feeds at half power. The feed rate is *named fiction*.
- The hole keeps its mass and the feed is the fuel, so there is no energy from nothing.
**Recipes (generator):**
- c1 1 `stable_exotic_matter` + `kugelblitz_core` (catalyst, wear 1/64) → 2^30 EU/t for 2,400 t *(tune)*.
- c2 4,000 mB `stellar_plasma` + core (wear 1/32) → 2^29 EU/t for 1,200 t *(tune)*.
- Each run wears 1/8 `gamma_absorber_tile`.
**Byproducts:** activated tiles → IV hot cell; the spent core (`evaporated_core_shell`) → the forge c3 as a shell (50% of its tiles back).
**Structure (QR):** 11x11x11 sphere, a core cage at the centre, absorber rings, TPV wall.
- Blocks: `grindless:annihilation_shield_casing` (appearance); `grindless:field_frozen_casing` cage; `gtceu:heat_vent`.
- Kinds: shield, cage, vent.
- Hatches: OpV dynamo hatches (two 1 A or one 4 A).
**Crossings:** IV hot cell.
**Risks:** rule 8 (Power balance).
**Source:** Hawking 1974; Page 1976; Crane & Westmoreland 2009.

### 12. Magnetic pair converter: `gtceu:magnetic_pair_converter`, type `gtceu:magnetic_pair_production` (SGR 1806−20 orbit)

**What it gains:** one-photon pair production γ → e⁺e⁻, possible only where B is near or above B_q = 4.4 x 10^13 G (Erber 1966, RMP 38:626), as in magnetar magnetospheres (Beloborodov 2013, ApJ 777:114). Seeded by a rotating-wall positron plasma from home (Greaves & Surko 2000, PRL 85:1883), it gives positron densities no Surko trap reaches. It is the only maker of `dense_positron_cell`.
**Recipes:**
- c1 1 `seed_positron_plasma` + `gamma_laser_module` (wear 1/16) → `hot_pair_plasma` (503,316,480 EU/t, 1,200 t).
- c2 `hot_pair_plasma` + `empty_penning_trap` → `unsealed_positron_cell` (268,435,456 EU/t, 800 t); the UEV electron beam furnace seals it with a fresh getter (`gtceu:zirconium_dust`) → `dense_positron_cell` (line 29). c1 returns the seed's trap (90%); consumers of the dense cell (B3, D3) return theirs (90%).
**Byproducts:** electrons → dumped to the magnetosphere (tooltip); photon splitting losses (Adler 1971, Ann. Phys. 67:599) → no item.
**Structure (QR):** 9x9x9 open frame, field-aligned along the magnetar's lines, with a trap on its axis.
- Blocks: `grindless:field_frozen_casing` (appearance); `gtceu:superconducting_coil`; `gtceu:tungsten_steel_frame`.
- Kinds: coil, frame.
**Crossings:** UHV positron accumulator (seed), UHV Penning trap.
**Risks:** the weakest claim of the SGR pair: one product. Kept because the dense cell is the bottleneck of antihydrogen and the forge.
**Source:** Erber 1966; Beloborodov 2013; Greaves & Surko 2000; Adler 1971.

### 13. Field-frozen press: `gtceu:field_frozen_press`, type `gtceu:field_freezing` (SGR 1806−20 orbit)

**What it gains:** presses chain-matter laminae in the magnetar's field so that the field stays frozen in the billet. Flux freezing in a superconducting stack is real (trapped-field bulks, Durrell 2014, SUST 27:082001); keeping a magnetar field is *named fiction*.
**Recipes:**
- c1 4 `field_canned_stack` → `field_frozen_billet` (268,435,456 EU/t, 1,200 t).
- c2 1 billet → 4 `field_frozen_plate` (268,435,456 EU/t, 800 t).
- c3 4 plates + 1 `gtceu:tungsten_steel_frame` → 2 `grindless:field_frozen_casing` blocks (268,435,456 EU/t, 400 t).
**Byproducts:** spent cans → UEV EBF (re-melted, 80% W-Re back).
**Structure (QR):** 7x9x7 press, a hydraulic frame aligned to the field with a can bay.
- Blocks: `gtceu:high_power_casing` (appearance); `gtceu:tungsten_steel_frame`; `gtceu:superconducting_coil`.
- Kinds: frame, coil.
- Hatches: two UXV 4 A hatches (bootstrap; OpV hatches need its plate).
**Crossings:** UEV EBF (W-Re can).
**Risks:** bootstrap: it must never need an OpV hatch or a field generator (A3 acceptance).
**Source:** Durrell 2014; Lai 2001.

### 14. Debris harvester: `gtceu:debris_harvester`, type `gtceu:debris_harvesting` (Terzan 5 core)

**What it gains:** collects and sorts the core's debris *(named fiction: the debris field)* into metal and silicate.
**Recipes:**
- c1 (auto) → 4 `bulge_debris` (268,435,456 EU/t, 400 t).
- c2 4 `bulge_debris` → 2 `metal_debris_fraction` + 2 `silicate_debris_fraction` (magnetic and eddy-current sort; 268,435,456 EU/t, 200 t).
**Byproducts:** none; the volatile fines stay in the silicate fraction (strangelet distiller c3 remains the only voiding row).
**Structure (QR):** 11x5x11 sweep frame with a sorter drum.
- Blocks: `gtceu:robust_machine_casing` (appearance); `gtceu:tungsten_steel_frame`; `gtceu:steel_gearbox`.
- Kinds: frame, gearbox.
**Crossings:** none (a frontier machine).
**Risks:** none.
**Source:** Ferraro 2009 and Origlia 2011 for the metal-rich cluster; the debris is fiction.

### 15. Replication refinery: `gtceu:replication_refinery`, type `gtceu:replication_refining` (Terzan 5 core)

**What it gains:** turns debris into probe feedstock with no supply from home, by two real processes:
- Mond carbonyl refining for Fe and Ni;
- FFC molten-salt electrolysis of silicates for Si, metal and oxygen (Lomax 2020, PSS 180:104748).
**Recipes:**
- c1 metal fraction + 1,000 mB carbon monoxide → `metal_carbonyl` 1,000 mB (268,435,456 EU/t, 400 t).
- c2 → `carbonyl_iron_nickel` powder + CO back (90%).
- c3 → `metal_feedstock`.
- c4 silicate fraction → `ffc_pellet`.
- c5 → `si_alloy_powder` + 500 mB oxygen.
- c6 → `cluster_sinter_casing`.
- CO is made from O₂ and the anode graphite.
**Byproducts:** oxygen → c1's CO; spent graphite anodes → ZPM methane pyrolyser feed (inert carbon).
**Structure (QR):** 9x9x9 two-cell plant, a carbonyl tower beside an FFC salt bath.
- Blocks: `gtceu:clean_machine_casing` (appearance); `gtceu:titanium_pipe_casing`; `gtceu:heat_vent`.
- Kinds: pipe, vent.
**Crossings:** ZPM methane pyrolyser (anode graphite).
**Risks:** none.
**Source:** Mond 1890 (J. Chem. Soc. 57:749); Lomax 2020.

### 16. von Neumann foundry: `gtceu:von_neumann_foundry`, type `gtceu:self_replication` (Terzan 5 core)

**What it gains:** a seed probe builds a copy of itself (Freitas 1980, JBIS 33:251) from:
- Terzan 5 feedstock;
- a home-made vitamin kit, the parts a probe cannot make from debris (circuits, tetrons, transmitters).

Self-replication is *named fiction* at this scale. Every copy has a stated feedstock (rules 1 and 8).
**Recipes:**
- c1 1 `probe_seed` (returned) + 16 `metal_feedstock` + 8 `cluster_sinter_casing` + 1 `vitamin_kit` → 2 `probe_seed` (503,316,480 EU/t, 2,400 t).
- c2 the first seed: 1 `pathfinder_probe_core` (from the landed pathfinder) + the same feedstock → 1 `probe_seed`.
**Byproducts:** none.
**Structure (QR):** 11x11x11 hall, a printing gantry over a seed cradle.
- Blocks: `gtceu:robust_machine_casing` (appearance); `gtceu:assembly_line_grating`; `gtceu:tungsten_steel_frame`.
- Kinds: grating, frame.
**Crossings:** none; the vitamin kit carries home's.
**Risks:** replication must never be the only cost of a node (Power).
**Source:** Freitas 1980; von Neumann 1966 (Theory of Self-Reproducing Automata).

### 17. Collector node works: `gtceu:collector_node_works`, type `gtceu:collector_node_assembly` (Terzan 5 core)

**What it gains:** turns local silicon into thin PV collector nodes and packs each batch of four onto a seed.
**Recipes:**
- c1 `si_alloy_powder` → `si_ribbon` (string ribbon).
- c2 ribbon + `silicate_debris_fraction` → `pv_collector_film` (diffused junction, SiO₂ anti-reflection coat from the local silicate).
- c3 2 films + 1 `node_power_transmitter` + 1 `cluster_sinter_casing` → `collector_node`.
- c4 4 nodes + 1 `probe_seed` → `deployed_node_pack`.
- All at 268,435,456 EU/t, 400-1,200 t.
**Byproducts:** kerf → c1 (recycled).
**Structure (QR):** 9x5x13 line.
- Blocks: `gtceu:cleanroom_glass` (appearance); `gtceu:plascrete`; `gtceu:assembly_line_grating`.
- Kinds: glass, grating.
**Crossings:** none on site; the transmitter carries home's.
**Risks:** none.
**Source:** Sachs 1987 (string ribbon); Kardashev 1964 (Sov. Astron. 8:217) for the scale.

### 18. Bulge collector: `gtceu:bulge_collector`, type `gtceu:bulge_light_collection` (Terzan 5 core, generator)

**What it gains:** receives the power beamed by deployed node packs that orbit in the cluster core, where starlight is many thousands of times denser than at the Sun *(tune; Terzan 5's core luminosity density is real, its value here is chosen)*. Nodes degrade under the core's radiation and are consumed.
**Recipes (generator):**
- c1 1 `deployed_node_pack` → 2^26 EU/t for 2,400 t.
- c2 4 packs → 2^28 EU/t for 2,400 t.
- c3 16 packs (64 nodes) → 2^30 EU/t for 2,400 t + 1 `bulge_light_census`.
- All *(tune)*; see Power for balance.
**Byproducts:** spent nodes → machine 15 c7 (Si back as `si_alloy_powder`, 50%; R3 adds the row).
**Structure (QR):** 13x7x13 rectenna field with a receiver mast.
- Blocks: `gtceu:high_power_casing` (appearance); `gtceu:laminated_glass`; `gtceu:superconducting_coil`.
- Kinds: glass, coil.
- Hatches: one OpV 4 A dynamo hatch.
**Crossings:** none on site.
**Risks:** a node-scaled generator (S0-11).
**Source:** Kardashev 1964; Ferraro 2009.

## Older machines, new modes

Placement follows DECISIONS.md:508. Each package takes its circuits after running `git grep` on the recipe type (Common). UXV machines are one era back: they take modes but are not crossings. Every other row is a crossing (UIV and older). 49 machines take a mode.

| Machine (era, file:line) | Mode | Recipe | Lines |
|---|---|---|---|
| Pasta extractor (UXV, `uxv/vela_pasta.js:41`) | chain crust; Ni-chain slab; chain lattice | site list gains `grindless:sgr1806_orbit`; c3 → `chain_crust_slab` (Fe-56 layer); c4 → `ni_chain_slab`; c5 → `chain_lattice_slab` (deeper condensed lattice) | 1, 2, 43 |
| Pasta sorter (UXV, `uxv/vela_pasta.js:49`) | caging | crust slab + `cage_part` → `caged_chain_phase`; lattice slab + `cage_part` → `caged_chain_lattice`; Ni slab + `cage_part` → `caged_ni_chain` | 1, 2, 43 |
| Draw bench (UXV, `uxv/vela_pasta.js:57`) | chain strand | `caged_chain_phase` → `gtceu:chain_strand_ingot` (c3) → wire (c4) | 1 |
| Laminator (UXV, `uxv/vela_pasta.js:65`) | lamina; stack; weave | `caged_chain_lattice` → `chain_lamina` (c3); + `lasagna_plate` → `chain_lamina_stack` (c4); PBO + chain wire → `chain_mesh_weave` (c5) | 2, 6 |
| MTJ sputter cluster (UXV, `uxv/spin_deposition.js:37`) | eight | TiZrV NEG; Ir cladding; Nb TSV fill; NbTiN; `wc_sic_multilayer` (SPS WC target); Au; SDD contact; In bumps on `tetron_die` | 13, 14, 18, 19, 21, 24, 25, 34 |
| Millikelvin cryostat (UIV, `uiv/memories_cryostat.js:57`) | He-3 superfluid; superleak; tetron test; cell test | liquid He-3 → `grindless:superfluid_helium_3`; aerogel plug + He-3 → `superleak_plug`; bonded die parity test → `tested_tetron_die` (10% `failed_tetron_die`); levitation cell cold test | 5, 19, 28 |
| Femtosecond writer (UIV, `uiv/tfln_femtosecond.js:65`) | teeth; waveguides | flexspline cup → toothed cup; TFLN on SOI → written waveguide | 7, 15 |
| TFLN fab (UIV, `uiv/tfln_femtosecond.js:60`, `ion_slicing`) | smart cut; TSV bond; TFLN on SOI; flip-chip | H-implanted Si-28 → `si28_soi_wafer`; via wafer → `nb_tsv_interposer`; LN on SOI; bumped die + interposer → `bonded_tetron_die` | 11, 14, 15, 19 |
| BEUV scanner (UIV, `uiv/beuv_stm.js:53`) | six masks | cryo-CMOS; TSV via; InGaAs HEMT; GaN HEMT; SDD anode; AlGaN die | 13, 14, 16-18, 45 |
| STM lithography cell (UIV, `uiv/beuv_stm.js:58`) | tetron gates | `inas_al_wafer` → `gated_2deg_wafer` | 12 |
| Levitation melter (UIV, `uiv/levitation_melter.js:47`) | TiZrV | Ti + Zr + V → TiZrV ingot | 25 |
| X-ray pulse profiler (UIV, `uiv/j0437.js:75`) | XNAV calibration | at J0437 only: integrated unit → `xnav_unit` | 41 |
| Calutron (UEV, `uev/isotopes.js:69`) | Ni-64; Pb-208; B-10 | thawed Ni → Ni-64; Pb → Pb-208; B → B-10 | 32, 36, 43 |
| CVI furnace (UEV, `uev/composites.js:74`) | chain composite; potting; SiC | chain/SiC preform → densified; REBCO winding potting; SiC substrate and blank | 4, 8, 17, 27, 34 |
| Nitride magnet works (UEV, `uev/composites.js:64`) | AlN | Al + N₂ → AlN powder | 45 |
| Megabar press (UEV, `uev/megabar.js:46`) | flexspline; bent Ge | `gum_metal_blank` → flexspline cup; Ge tile → `bent_ge_tile` | 7, 35 |
| Electron beam furnace (UEV, `uev/electron_beam.js:78`) | fourteen (F3 lets a circuit repeat with distinct inputs) | thaw caged Ni; W-Re can (`field_canned_stack`); Be reduction; braze (window, tank, spreader); HOPG; LiH can; NEG bake and positron trap seal; belt edge weld → `chain_mesh_belt`; W-Re hohlraum | 3, 6, 20, 22, 24, 25, 28, 29, 31, 33, 42, 43 |
| SNSPD foundry (UEV, `uev/photonics.js:66`) | link detector | NbN on SOI → SNSPD array | 15 |
| Photonic integration hall (UEV, `uev/photonics.js:88`) | mainframe join | `cryo_cmos_die` + `nb_tsv_interposer` + `cryo_optical_link` + `hemt_amplifier` → `gtnn:cosmic_mainframe` (an assembly, not a line) | — |
| Heavy-ion cyclotron (UEV, `uev/superheavy.js:64`) | Ni-64 beam; Pb-208 source | Ni-64 → beam; Pb-208 → ion source | 36, 43, 44 |
| Recoil separator (UEV, `uev/superheavy.js:69`) | E124; E126 | `cm248_target` (UXV, `uxv/superheavy.js:18`) + Ni-64 beam → `element_124_recoil`; irradiated `cf249_target_wheel` → `element_126_recoil` (both fiction above Og) | 43, 44 |
| Superheavy chemistry lab (UEV, `uev/superheavy.js:74`) | census IV | E124 + E126 + `island_nuclide` → `superheavy_census_iv` | 44 |
| Crystal growth furnace (UHV, `uhv/crystals.js:78`) | nine boules | HPGe; Th:CaF₂; InP; AlN; CeB₆; `gaas_laue_tile`; Ti:sapphire; LBO; GaSb | 9, 10, 12, 16, 23, 26, 33, 35, 45 |
| Nuclear clock lab (UHV, `uhv/crystals.js:67`) | Th-229 lock; XNAV clock | coated crystal → `th229_lasing_crystal`; → XNAV clock | 9, 41 |
| MBE reactor (UHV, `uhv/photonics.js:76`) | InAs QW and Al shell; InGaAs | InP → `inas_al_wafer`; InGaAs epi | 12, 16, 33 |
| Positron accumulator (UHV, `uhv/antimatter.js:68`) | seed plasma | rotating-wall compression → `seed_positron_plasma` in `empty_penning_trap` | 29 (37 as input) |
| Spark plasma sinterer (UHV, `uhv/propulsion.js:164`) | seven | chain rod and rotor; circular spline; Ir rod; LiH tiles; TiZrV target; WC target; W/B₄C tiles | 4, 7, 21, 22, 25, 32, 34 |
| SiC device fab (UHV, `uhv/power_devices.js:66`) | GaN MMIC; tile; AlN die | GaN on SiC → `gan_mmic`; MMIC → transmitter tile; AlGaN on AlN → `aln_power_die` | 17, 42, 45 |
| Warp gate (UHV, `uhv/gate.js:40`) | c11-c13 | bulge seed; pathfinder; MAX | gates |
| PBO plant (UHV, `uhv/elevator.js:214`) | chain cable braid | PBO + chain wire → braided wire | 1 (6 as input) |
| Zone refining tower (UV, `uv/detectors.js:208`) | Ge; FZ Si-28 | 13N Ge; float-zone Si-28 | 10, 11, 18, 35 |
| MOCVD reactor (UV, `uv/photonics.js:256`) | six | Si-28 poly; hBN; cryo-CMOS gate stack; Th:CaF₂ coat; GaN on SiC; AlGaN on AlN | 9, 11-13, 17, 45 |
| Fibre draw tower (UV, `uv/photonics.js:241`) | cryo fibre; polycapillary | cryo fibre; capillary draw and polycapillary redraw → X-ray optic | 15, 41 |
| Synchrotron (UV, `uv/accelerators.js:74`) | Pb-208 beam; metrology | `pb208_beam_cell`; mirror and Laue metrology → `mirror_metrology_record`, `aligned_laue_frame` | 34-36 |
| Antimatter trap (UV, `uv/accelerators.js:97`) | stacking | 8 `cold_antiproton_cell` → `antiproton_stack_opv` | 30 |
| SRF cavity works (UV, `uv/cold.js:255`) | RRR Nb | Nb → RRR 300 Nb | 14, 24 (30 as input) |
| Ion implanter (ZPM, `zpm/qubits.js:54`) | five | H for smart cut; HPGe contacts; CMOS source and drain; HEMT isolation; SDD drift rings | 10, 11, 13, 16, 18 |
| Methane pyrolyser (ZPM, `zpm/outer_chemistry.js:36`) | PG; anode graphite | pyrolytic graphite; FFC anode | 28, 39 |
| Actinide partitioning (ZPM, `zpm/actinides.js:244`) | ACMF fissile | Cm/Am split → Cm-245 fraction | 31 |
| HTS magnet works (LuV, `luv/hts_magnet_works.js:208`) | pancake; octupole; training | REBCO pancake; `octupole_trap_magnet` winding; quench training | 8, 27 |
| Helium refrigerator (LuV, `luv/helium_refrigerator.js:262`) | 4 K acceptance | belt, die, interposer, cooler, pickup, magnet at 4 K | 6, 13, 14, 23, 24, 27 |
| Hot cell (IV, `iv/hot_cell.js:198`) | five | Th-229 recovery; spent Ir target; activated tiles; strangelet tailings → `gtceu:lead_dust`; rad-hard tile test | 9, 21, 32, 36, 42 (44 as input: `cf249_target_wheel`, `tables/hot_cell.json:235`) |
| Fluorspar kiln (IV, `iv/fluorspar_kiln.js:219`) | three | ThF₄; BeF₂; MgF₂ | 9, 20, 26 |
| Fuel fabrication plant (IV, `iv/uranium_cycle.js:296`) | ACMF | Cm-245 fraction + W-Re hohlraum + DT fill → `acmf_pellet` | 31 |
| Tritium removal (IV, `iv/tritium_removal.js:330`) | spent shield | `spent_li6_shield` → T (decays to He-3 for line 5) | 22 |
| Cryogenic plant (EV, `ev/cryogenic_plant.js:260`) | four | 6N He-3 → liquid He-3; HPGe 77 K test; DT fill; Kr → `kr_tripler_cell` | 5, 10, 26, 31 |
| Extraction cascade (EV, `ev/extraction_cascade.js:164`) | three | GeCl₄; SiHCl₃ from `si28_ash`; failed tetron die → In, Nb | 10, 11, 19 |
| Hot strip mill (EV, `ev/combined_cycle_and_hot_mill.js:239`) | Be foil | Be → foil | 20 |
| Platinum plant (EV, `ev/platinum_plant.js:162`) | Ir 5N; recovery | Ir 5N; Ir from `spent_ir_target` | 21 |

Seven more machines are crossed as inputs only, through existing rows: neutronium cage (`cage_part`), neutron drip separator (`neutronium_pellet`), SiC fibre plant, pyroprocessing cell (`lithium_6_metal`), coated conductor line (REBCO), aerogel works (superleak plug) and UV superfluid helium plant (He-3/He-4 split, `uv/cold.js:73`).

## Family steps

| Family | Step | Machine | Era before |
|---|---|---|---|
| Circuits | `gtnn:cosmic_mainframe` (and the cosmic SMDs, S0-4) | UEV photonic hall join of lines 13-16's parts | `gtnn:spintronic_mainframe` (UXV) |
| Superheavies | census IV: elements 124 and 126 | UEV cyclotron and recoil separator rows | census III: 121, 122 (UXV) |
| Fusion | none: annihilation and Hawking plants replace it ("Fusion") | — | Mk6 stellar burning (UXV) |
| Neutron star matter | chain strand (field-frozen Fe-56 chains) | field-frozen press, UXV pasta modes | nuclear pasta (UXV) |
| Positrons | magnetic pair production; dense positron cell | pair converter, UHV accumulator rows | gamma laser module (UXV-B5) |
| Antimatter | antiprotons by the beam, antihydrogen by the cell | Cygnus source, antihydrogen foundry | UV antimatter trap (small) |
| Exotic matter | stable strangelet | strangelet distiller, strangelet vault | none (UXV's skimmer makes no exotic matter) |
| Black holes | Kugelblitz cores; Hawking collector | Cygnus machines | disk skimming, BZ dynamo (UXV) |
| Travel | self-replicating probes; pathfinder | Terzan 5 machines, gate c11-c12 | Kerr sling, M2P2 and Whipple shields (UXV) |
| Sensor | HPGe Compton sensor | sensor line 10 | SHeQUID gyroscope (UXV) |
| Components | GTM's `gtceu:opv_*` family of nine | A1 | `grindless:uxv_*` (HT moves them to GTM ids) |
| Mega | assembly line array | M2 | stellar fractionation hall (UXV-M2) |
| Parallel hatch | x262,144 | M1 | x65,536 (UXV-M1) |
| Wireless | case 13 | W | case 12 (UXV-W) |

## Reserve for MAX

MAX is the postgame era (DECISIONS.md:450). It is Sagittarius A*, the mirror shell and the largest multiblock (journey.md:54). OpV leaves each MAX item a hook, and makes none of them.

| Kept for MAX | Hook in OpV (id) |
|---|---|
| Sagittarius A* | `grindless:sgr_a_chart` (gate c13 output). GCYR `black_hole_orbit` is not used by OpV. |
| The mirror shell (a wave amplified around Sgr A*) | `stable_exotic_matter` and `gamma_multilayer_mirror` are stocked. OpV's Kugelblitz cores are charged, non-rotating holes. No OpV recipe amplifies a wave off a rotating hole: no superradiance and no black hole bomb. |
| The largest multiblock | OpV's largest is the assembly line array (M2). MAX's must be larger: the design records M2's footprint. |
| MAX hull and hatches | `gtceu:max_machine_casing` is researched by c13. `GTValues.V[MAX]` is 2^31 (a long) in GTM, VA[MAX] 2013265920 (S0-2 reads it), so MAX's design owns that edge. |
| MAX parallel hatch | `lib/parallel_hatch.js` tier 14 (x1,048,576 = 4^10, fits an int). Not built in OpV. |
| Wireless case 14 | not added; MAX decides. |
| Kardashev III proof → beyond | `bulge_light_census` (64 nodes) and `superheavy_census_iv` are kept by c13, and MAX's first gate may read them again. |
| MAX+ | intergalactic travel, the hyper stargate and creative items are untouched. The annihilation engine, the Hawking collector and the bulge collector all burn stated fuels, so none of them is a creative source. |

**OpV-bound ids made in UXV and used here:** `grindless:bulge_chart`, `pasta_core_sample`, `island_nuclide`, `gamma_laser_module`, `frc_cartridge`, `flux_loaded_plasma`, `disk_plasma`, `filtered_disk_plasma`, `stellar_plasma`, `si28_ash`, `shequid_gyro`, `cage_part`, `lasagna_plate`.

**Not used:** `island_chart` stays UXV's keep. `superheavy_census_iii` is superseded by census IV and is not consumed.

**MAX-bound ids made in OpV:** `grindless:sgr_a_chart`, `stable_exotic_matter`, `kugelblitz_core`, `gamma_multilayer_mirror`, `bulge_light_census`, `superheavy_census_iv`, `probe_seed`.

## Considered and dropped

**Machines.** These are the ten that would reach 28:

1. Muon-catalysis cell: the UV `muon_fusion_cell` exists (`uv/accelerators.js:84`).
2. Mk7 silicon-burning ring (`registerFusionTier(13)`, the UXV hook at uxv.md:631): silicon burning ends at the iron peak, and iron has no product of its own. Si-28 ash already has its OpV destination (line 11). See "Fusion".
3. Positronium condenser: UIV has one.
4. Dilution cryostat: the UIV millikelvin cryostat has a mode.
5. MBE cluster: the UHV MBE reactor has modes.
6. Magnetar field tap: it would be power from a field with no fuel (rule 8).
7. Flare r-process catcher: a second route to heavy nuclei. The 2004 giant flare's r-process ejecta is real (Patel 2025, ApJL 984:L29), but the calutron and cyclotron already make them.
8. Hawking pair separator: a free antimatter route. The Hawking collector burns its holes for power only.
9. Photonuclear transmuter: a second isotope route.
10. Chain skimmer and chain draw tower: the UXV pasta machines take modes. A new machine at SGR would also need its own product before it could be built there (bootstrap).

Also dropped:

- Lyman-α laser works: a multiblock for one part; line 26 makes the laser on older machines.
- Pion channel: no consumer.
- Beamed-sail launcher: duplicates the gate.
- UXV-MAX disk skimmer (journey.md:139): UXV machine 13 is the skimmer.

**Places** with no product of their own:

- PSR J0952−0607: a halo pulsar, not in the bulge, and a second route to quark matter (the uxv.md:626 hook is answered by the strangelet line).
- Sagittarius A* and the Galactic Centre: MAX.
- Baade's window: a sight line, not a source.
- Liller 1: a second bulge cluster; Terzan 5 suffices.
- Sgr B2: molecules, a second organic route.
- The Arches and Quintuplet clusters: massive stars, a second Wolf-Rayet route.
- The Fermi bubbles: Sgr A*'s outflow, MAX.
- PSR J1748−2446ad: a pulsar inside Terzan 5, not a place of its own.

**Lines.** 29 were judged and not counted; that is the whole gap to 74:

1. Muon-catalysed fusion rows: the UV muon cell; a second fusion route.
2. μCF breeding of U-233: a second fissile route (UV thorium cycle).
3. Hawking antiproton harvest: free antimatter.
4. Flare r-process catch: a second heavy-nucleus route.
5. Photonuclear isotopes: a second isotope route.
6. Chain fine wire: a size of the chain strand that GTM generates.
7. Cosmic SMD resistor: an assembly with no feedstock of its own.
8. Cosmic SMD transistor: the same.
9. Cosmic processor, assembly, computer and the mainframe join: assemblies; lines 13-16 count their parts.
10. Vitamin kit: an assembly of existing parts.
11. Pathfinder probe: an assembly (gate c12 input).
12. Hawking drive: an assembly.
13. Bulge relay seed: an assembly.
14. OpV hull: an assembly.
15. OpV hatches: assemblies; line 45 counts the hatch core.
16. OpV battery and SMES cell: storage assemblies.
17. Jet protons as a line: one node; jet extraction is step 1 of line 30.
18. A gamma laser module rebuild: a second route to UXV-B5's product.
19. He-6 halo beam: no consumer.
20. Ge-76 enriched HPGe: a second HPGe route; neutrinoless double beta decay is physics with no product.
21. Antideuterons: no consumer.
22. Bulge stellar census: a data chain.
23. MSP timing array: a data chain; the XNAV calibration counts once (line 41).
24. Terzan 5 stellar-wind skimmer: a second gas route.
25. SGR crust Fe-56 as stock: ordinary iron.
26. Mk7 silicon burning: no product.
27. J0952 quark matter: a second route to strange matter.
28. Antihelium: no consumer.
29. Si-28 from the SGR crust: a second route (Mk6 `si28_ash`).

## Power

**Wireless case 13** (`lv/wireless_energy.js:305`, W) caps the buffer at V[OpV] x amps x 10, as a long:

| Amps | Cap |
|---|---|
| 2 A | 10,737,418,240 |
| 4 A | 21,474,836,480 |
| 16 A | 85,899,345,920 |
| 64 A | 343,597,383,680 |

Case 12's long caps are proven (UIV-S0-5, UXV-W). The amperage per tick is checked by S0-6, because a 16 A hatch moves 2^33 EU/t.

- Link item `grindless:chain_strand_repeater`: chain strand wire + `grindless:pasta_strand_repeater` + `tetron_die`.
- Cell `grindless:opv_smes_cell`: holds 16,106,127,360,000 EU *(tune)* (four times UXV's). It is made on GTM's `gtceu:assembler` at OpV from `gtceu:chain_strand_single_wire`, `chain_lamina_stack` and 2 `gtceu:opv_field_generator`.
- SGR and Terzan 5 run on wireless from home and Cygnus until their own generators stand.

Every generator burns a stated fuel. The balance is EU out / EU spent making the fuel. C1 computes it with the obtain model and fails outside 1.3x-2.5x; the GT Leisure rule is x2 per fuel. UXV's precedents are the BZ dynamo at ~1.64x and the polar cap tap at ~1.99x (B4).

| Generator | Place | Fuel (per run) | EU/t × t | EU out per run | Target balance | Hatch |
|---|---|---|---|---|---|---|
| Annihilation engine c1 | home | 1 `antihydrogen_ice_cell` + 1,000 mB H | 2^29 × 1,200 | 644,245,094,400 | ~1.7x *(tune)* | 1 A dynamo |
| Annihilation engine c2 | home | 1 `acmf_pellet` + 1 `antiproton_stack_opv` | 2^30 × 1,200 | 1,288,490,188,800 | ~1.8x *(tune)* | 4 A dynamo |
| Hawking collector c1 | Cygnus | 1 `stable_exotic_matter` + core wear 1/64 | 2^30 × 2,400 | 2,576,980,377,600 | ~2.0x *(tune)* | two 1 A or one 4 A |
| Hawking collector c2 | Cygnus | 4,000 mB `stellar_plasma` + core wear 1/32 | 2^29 × 1,200 | 644,245,094,400 | ~1.5x *(tune)* | as c1 |
| Bulge collector c1/c2/c3 | Terzan 5 | 1 / 4 / 16 `deployed_node_pack` | 2^26 / 2^28 / 2^30 × 2,400 | 161,061,273,600 per pack | ~1.5x *(tune)* | 4 A dynamo |

The sources carry over from earlier eras: the Mk6 DEC rows, the BZ dynamo and the polar cap tap (UXV) keep running.

**Physics.** Real antiproton production costs about 10^9 times the energy annihilation returns: AD-scale yield is ~10^-5 p̄ per 26 GeV proton. A pack balance above 1 is a game rule (rule 8), like UXV's BZ dynamo, not physics. The tooltip says that half of each annihilation leaves as neutrinos (Frisbee 2003).

**Kardashev III** is proved by three figures the pack can measure:

1. The bulge collector c3 runs 64 nodes and outputs `bulge_light_census`.
2. Wireless case 13 is fed from at least three places at once (home, Cygnus, Terzan 5); C1 checks the network's sources.
3. Gate c13 holds 2^33 EU/t for 1,200 t, which is 10,307,921,510,400 EU.

The label alone proves nothing (journey.md:239).

**Gate example.** c13 needs 2^33 EU/t for 1,200 t *(tune)*. The supply is eight 2^30 sources on wireless, for example two Hawking c1, two annihilation c2, two bulge c3 and the UXV BZ dynamo plus two polar cap taps. If S0-2 fails, the fallback is 2^31 EU/t for 4,800 t: the same EU on two UXV-sized 16 A loads (Gate to MAX).

**Rule 8.** Every source has a fuel or consumable: antihydrogen, antiprotons with an ACMF pellet, exotic matter, stellar plasma, or node packs. No source exceeds 2^30 per machine, and none is at or above 2^31. The node packs are consumed (they degrade), so a pack is not a panel that runs forever.

## Fusion

**OpV has no fusion ring.** The UXV hook offered a Mk7 `registerFusionTier(13)` for silicon burning (uxv.md:631). OpV drops it for three reasons:

- Silicon burning rearranges Si-28 by photodisintegration and alpha capture, and ends at the iron peak: Ni-56 decays to Fe-56 (Woosley, Heger & Weaver 2002, RMP 74:1015). Its products are ordinary iron and nickel, with no product of their own (rule 3, deep not wide).
- Fusion releases nothing past the iron peak. OpV's power step is mass-energy: annihilation, where all rest mass converts and about half reaches the absorbers, and Hawking evaporation, where all of the hole's feed leaves as radiation. These are better fuels in more complex plants: three Cygnus stages plus the foundry, and the forge plus the collector (rule 8).
- `si28_ash` keeps an OpV destination: line 11 makes Si-28 SOI wafers by float zone and smart cut.

Mk6 stays. Its DEC rows are still a UXV source. `FusionReactorMachine` gets no tier 13. No OpV row uses `eu_to_start`, and no OpV row runs on a fusion recipe type. Line 31's ACMF pellets are burned only by the annihilation engine (machine 5).

## Nothing one at a time

- **Assembly line array** (`gtceu:assembly_line_array`, M2): the OpV member of the mega family (mega.md 4.1, 4.11, 4.12, 5, 6.6). It runs GTM `gtceu:assembly_line` recipes in parallel. Its parallels are energy-bound times the parallel hatch, and the overclock rule follows mega.md 5 as the stellar forge did (open question 6).
  - Gain: GTM's assembly line runs one recipe at a time. The array runs up to x262,144 in one structure, the one place where OpV's component-hungry recipes (the owner's rule) stop being one at a time.
  - Research data and ordered inputs (`ConfigHolder` ordered items and fluids) under parallels: S0-10 saw neither an ordered nor a research recipe start on a bare array, so M2 proves both on its own frame first or takes the fallback (M2).
  - Footprint: 9 wide x 7 high x 35 long *(tune)*. MAX's largest multiblock must exceed it (Reserve for MAX).
  - GT--'s component assembly line (`gtnn:component_assline_casing_opv` in the dump) makes components from raw stock. The array does not duplicate it.
  - GTNH's advanced assembly line is an idea only (CREDITS.md).
- **OpV parallel hatch** (`gtceu:opv_parallel_hatch`, M1): `lib/parallel_hatch.js:81` becomes `.tiers(9, 10, 11, 12, 13)`, with the name ternary at :85. x262,144 = 4^(13-4) = 2^18, which fits an int. Parallel x EU/t reaches 2^47 at OpV and must stay a long in GTM's parallel logic: S0-5 proved it with an overlay tier-13 hatch (262,144 copies of a 2,048 EU/t probe ran at 536,870,912 EU/t exactly), and HT registers no OpV parallel hatch (S0-1). The recipe (M1) mirrors `uiv/parallel_hatch.js:17` at OpV: the hull, 4 `gtceu:opv_field_generator`, 4 robot arms, 4 sensors, 8 `#gtceu:circuits/opv`, 4 `tetron_array` and superfluid He-3.

## AE2

Nothing new. Each arrival platform seeds AE2 through its far ring, as at UIV (uiv.md:677-679): AE2 stays the backbone between places (DECISIONS.md:59).

- Antimatter is never a fluid in an AE2 cell. Antiprotons, antihydrogen and positrons are items: trap cells and stacks.
- Site-locked fluids (`hot_pair_plasma`, `jet_proton_beam`, `fireball_distillate`) are processed where they are made.
- Probes carry no AE2.
- There is no new cell tier and no new AE2 mechanism.

## New process lines

Counted by UIV's method (uxv.md:725), as follows:

- **Steps** are item nodes from the first raw or older product. The first node counts. A product of another OpV line is not counted again.
- **A crossing** is a pair of one line and one machine of ours from UIV or earlier. Input and by-product rows count. A machine met twice in one line counts once. GTM machines and UXV machines are not crossings.
- **Every line** is a real chain of at least four steps. Each ends in a product that an OpV machine, hatch, controller, generator or gate consumes.
- **Not counted:** convenience versions, assemblies with no feedstock, data chains, and second routes to an existing product.

| # | Line | Steps | Cr | By-products → destination |
|---|---|---|---|---|
| 1 | Chain strand cable (A0): `chain_crust_slab` (UXV pasta extractor c3 at SGR) → `caged_chain_phase` (UXV sorter + `cage_part`) → `gtceu:chain_strand_ingot` (draw bench c3) → wire (c4) → PBO-braided → `gtceu:chain_strand_single_cable` | 6 | 2 | spent `cage_part` → UIV cage; unchained iron → `gtceu:iron_dust` |
| 2 | Chain lamina (A0): `chain_lattice_slab` → `caged_chain_lattice` → `chain_lamina` → `chain_lamina_stack` (+`lasagna_plate`) | 4 | 1 | unchained iron → iron dust; cage parts return |
| 3 | Field-frozen casing (A3): `field_canned_stack` (EB W-Re can) → `field_frozen_billet` → `field_frozen_plate` → `field_frozen_casing` | 4 | 1 | spent cans → EB re-melt (W, Re) |
| 4 | Composite rotor (A1): SiC fibre → preform → densified (CVI) → `chain_composite_rod` (SPS) → `chain_composite_rotor` | 5 | 3 | SPS offcuts → SiC dust → the SiC fibre line |
| 5 | Superfluid seal (A1): He-3 → 6N liquid → `superfluid_helium_3` → `superleak_plug` (aerogel) → `superfluid_he3_seal` | 5 | 4 | He-4 from the superleak → LuV He fridge |
| 6 | Mesh belt (A1): PBO → `chain_mesh_weave` (laminator c5) → `welded_mesh_belt` (EB) → `chain_mesh_belt` (4 K) | 4 | 3 | trim → UHV PBO re-spin |
| 7 | Harmonic drive (A1): `gum_metal_blank` → flexspline cup (megabar) → toothed cup (femto) → `opv_harmonic_drive` (SPS) | 4 | 3 | swarf → gum metal blend (`am_powders` c16) |
| 8 | Field coil (A1): REBCO → pancake → potted (CVI) → trained (HTS) → `chain_field_coil` | 5 | 3 | REBCO trim → coated conductor strip |
| 9 | Lasing crystal (A1): Th-229 (hot cell) → ThF₄ (fluorspar) → Th:CaF₂ (CG) → coated (MOCVD) → `th229_lasing_crystal` (clock check) | 5 | 5 | Th off-cuts → hot cell U-233 store; HF → fluorspar |
| 10 | Compton crystal (A1): GeCl₄ (extraction) → 13N Ge (zone) → boule (CG) → contacts (implanter) → 77 K test (cryo) → `hpge_compton_crystal` | 6 | 5 | Ge kerf → GeCl₄ |
| 11 | SOI wafer (A2): `si28_ash` → SiHCl₃ (extraction) → poly (MOCVD) → FZ (zone) → H implant → `si28_soi_wafer` (TFLN smart cut) | 6 | 5 | split-off Si-28 → back to poly; HCl → chemistry |
| 12 | Gated 2DEG (A2): InP (CG) → InAs QW (MBE) → `inas_al_wafer` (MOCVD) → hBN → `gated_2deg_wafer` (STM) | 5 | 4 | InP scrap → extraction (In) |
| 13 | Cryo-CMOS (A2): gate stack (MOCVD) → litho (BEUV) → S/D (implanter) → Au (sputter) → `cryo_cmos_die` (He fridge test) | 5 | 4 | Au overspray → Pt plant |
| 14 | Interposer (A2): RRR Nb (SRF) → TSV via (BEUV) → Nb fill → bond (TFLN) → `nb_tsv_interposer` (4 K test) | 5 | 4 | Nb swarf → EB re-melt |
| 15 | Optical link (A2): LN on SOI (TFLN) → waveguide (femto) → SNSPD → `cryo_optical_link` (fibre) | 4 | 4 | LN scrap → TFLN re-slice |
| 16 | HEMT (A2): InP (CG) → InGaAs (MBE) → HEMT (BEUV) → isolation (implanter) → `hemt_amplifier` | 5 | 4 | InP scrap → extraction |
| 17 | GaN MMIC (A2): SiC substrate (CVI) → GaN-on-SiC (MOCVD) → gated (BEUV) → processed (SiC fab) → `gan_mmic` | 5 | 4 | MOCVD exhaust Ga → extraction |
| 18 | Drift detector (A2): FZ Si (zone) → drift rings (implanter) → anode (BEUV) → `sdd_die` (sputter) | 4 | 3 | Si kerf → zone refining |
| 19 | Tetron array (B1): `tetron_die` → bumped (TFLN) → bonded → tested (mK) → `tetron_array` | 5 | 3 | failed dies → extraction (In, Al, Au) |
| 20 | Beam window (D1): BeF₂ (fluorspar) → Be (EB) → foil (hot strip) → brazed → `be_beam_window` | 5 | 3 | worn windows → fluorspar (Be back) |
| 21 | Spallation target (D1): Ir 5N (Pt plant) → rod (SPS) → clad (sputter) → `ir_spallation_target` → spent | 5 | 3 | spent → hot cell → Pt plant (Ir back) |
| 22 | LiH shield (D1): Li-6 → ⁶LiH (pyro) → tiles (SPS) → canned (EB) → `li6_hydride_shield` | 5 | 4 | spent → tritium facility; its He-3 → line 5 |
| 23 | Electron cooler (D1): CeB₆ → boule (CG) → cathode → gun in a `chain_field_coil` → `electron_cooler` (4 K) | 5 | 2 | worn cathode → CG re-grow |
| 24 | Cooling pickup (D1): RRR Nb (SRF) → NbTiN → pickup array (EB) → brazed tank (He fridge) → `stochastic_cooling_pickup` | 5 | 3 | Nb trim → EB re-melt |
| 25 | NEG casing (D1): TiZrV (lev) → target (SPS) → NEG chamber (EB) → `neg_xhv_casing` | 4 | 3 | spent chambers → lev re-melt |
| 26 | Lyman-α laser (B3): MgF₂ (fluorspar) → Ti:sapphire and LBO (CG) → `kr_tripler_cell` (cryo) → `lyman_alpha_laser` | 4 | 3 | spent tripler Kr → cryo plant |
| 27 | Octupole magnet (B3): REBCO → octupole winding (coated) → potted (CVI) → trained (HTS, He fridge) → `octupole_trap_magnet` | 5 | 4 | trim → coated conductor |
| 28 | Levitation cell (B3): PG (pyrolyser) → HOPG → plate (EB) → `levitation_trap_cell` (mK test) | 4 | 3 | worn HOPG → pyrolyser re-anneal |
| 29 | Dense positrons (E1): `empty_penning_trap` (accumulator) → `seed_positron_plasma` → `hot_pair_plasma` → `dense_positron_cell` (EB trap seal) | 4 | 2 | traps return; electrons to the magnetosphere; gammas absorbed where the cells are spent (B3, D3) |
| 30 | Antiprotons (B3): `jet_proton_beam` (SRF input) → `hot_antiproton_beam` → `stochastically_cooled_beam` → `cold_antiproton_cell` → `antiproton_stack_opv` (antimatter trap) | 5 | 2 | beam dump → absorber tiles; traps return |
| 31 | ACMF pellet (B3): Cm-245 (actinide) → W-Re hohlraum (EB) → DT fill (cryo) → `acmf_pellet` (fuel fab) | 4 | 4 | spent hohlraum → actinide partitioning (Cm back) |
| 32 | Gamma absorber (B3): B-10 (calutron) → B₄C-10 → W/B₄C tile (SPS) → `gamma_absorber_tile` | 4 | 3 | activated tiles → hot cell (He-4 → He fridge, W → SPS) |
| 33 | TPV panel (B3): GaSb boule (CG) → InGaAsSb epi (MBE) → spreader-brazed cell (EB) → `tpv_panel` | 4 | 3 | GaSb kerf → CG |
| 34 | Gamma mirror (B1): SiC blank (CVI) → WC target (SPS) → `wc_sic_multilayer` (sputter) → metrology (synchrotron) → `gamma_multilayer_mirror` | 5 | 3 | rejected mirrors → CVI strip and re-coat |
| 35 | Laue lens (B1): `bent_ge_tile` (zone, megabar), `gaas_laue_tile` (CG), alignment (synchrotron) → `aligned_laue_frame` → `laue_lens` | 4 | 4 | rejected tiles → megabar |
| 36 | Stable exotic matter (D2): Pb-208 (calutron) → ion source → `pb208_beam_cell` (cyclotron) → `fireball_distillate` (synchrotron) → `strangelet_seed` → `fed_strangelet` (drip) → `grown_strangelet` → `stable_exotic_matter` | 9 | 5 | tailings → hot cell → lead; negative strangelets contained and annihilated (the only voiding row) |
| 37 | Hawking drive (D3): `gamma_laser_module` → `gamma_pump_charge` (+ accumulator cells) → `kugelblitz_seed` → `kugelblitz_core` → `hawking_drive` | 5 | 1 | spent core shell → forge c3; gammas → absorber tiles |
| 38 | Probe seed (R2): `bulge_debris` → metal fraction → carbonyl → Fe-Ni → `metal_feedstock` → `probe_seed` | 6 | 0 | CO recycled; slag → line 39 |
| 39 | Sinter casing (R2): silicate → `ffc_pellet` (pyrolyser) → `si_alloy_powder` + O₂ → `cluster_sinter_casing` | 4 | 1 | O₂ → the sealed platform's air, then stock |
| 40 | Node pack (R3): `si_ribbon` → `pv_collector_film` → `collector_node` → `deployed_node_pack` | 4 | 0 | spent nodes → refinery c7 |
| 41 | XNAV unit (R1): polycapillary optic (fibre) → timing head (+ `sdd_die`) → clock-locked (clock) → `xnav_unit` (profiler, at J0437) | 4 | 3 | failed units → extraction |
| 42 | Node transmitter (R1): `gan_mmic` → tile (SiC fab) → rad-hard test (hot cell) → sealed (EB) → `node_power_transmitter` | 4 | 3 | rejects → extraction (Ga) |
| 43 | Element 124 (B2): `ni_chain_slab` → caged (cage) → thawed (EB) → Ni-64 (calutron) → beam (cyclotron) → `element_124_recoil` (recoil, on `cm248_target`) | 6 | 5 | cage parts return; Ni-58 and Ni-60 → calutron stock |
| 44 | Census IV (B2): `cf249_target_wheel` (hot cell) → irradiated (cyclotron) → `element_126_recoil` (recoil) → `superheavy_census_iv` (chem lab) | 4 | 4 | spent wheel → hot cell (Cf back) |
| 45 | Power die (A3): Al + N₂ → AlN (nitride) → boule (CG) → AlGaN epi (MOCVD) → die (BEUV) → `aln_power_die` (SiC fab) | 6 | 5 | AlN kerf → nitride re-press |

**Totals:**

- 45 lines and 216 steps, an average of 4.80. No line has fewer than 4 steps.
- 141 crossings on 49 machines of ours from UIV or earlier.
- Against UXV: 45 lines against 49, steps against 359, and an average of 4.80 against 7.33.
- The average drops because OpV draws on older products more than it makes new raw matter. Each line starts from a UXV-or-older product that already has its own count. "Why 45" gives the reason.

**Weakest claims:**

- **Nineteen lines have only four steps:** 2, 3, 6, 7, 15, 18, 25, 26, 28, 29, 31, 32, 33, 35, 39, 40, 41, 42 and 44. Each still ends in a consumed part. C1 fails any line that falls under 4 when re-counted.
- **Lines 38 and 40 have no crossings.** They are Terzan 5's own matter: a place with a product of its own. They count for steps but not for crossings.
- **Lines 2, 3, 37 and 39 have one crossing each.**
- **Named fiction**, marked as DECISIONS.md:502 does:
  - line 36: a strangelet that stays stable when fed is a hypothesis (Witten 1984; Farhi and Jaffe 1984), not an observation;
  - line 37: forming a Kugelblitz goes beyond Hawking evaporation, which is real physics;
  - line 44: element 126 and census IV lie above oganesson;
  - lines 1-3: chain strand and field freezing.

## Crossings

OpV meets 141 crossings on 49 machines of ours from UIV or earlier. UXV's 178 were counted against UEV and older (uxv.md:794), so the two baselines differ.

| Era | Crossings | Machines met |
|---|---|---|
| UIV | 22 | BEUV 6, TFLN 4, cage 3, mK cryostat 3, femto 2, STM, levitation melter, drip line, X-ray profiler |
| UEV | 31 | electron beam 12, CVI 5, calutron 3, cyclotron 3, megabar 2, recoil separator 2, SiC fibre, SNSPD, chem lab, nitride |
| UHV | 28 | crystal growth 9, SPS 7, MBE 3, SiC fab 3, PBO 2, clock 2, accumulator 2 |
| UV | 21 | MOCVD 6, zone refining 4, SRF 3, synchrotron 3, fibre 2, superfluid He, pyro, antimatter trap |
| ZPM | 9 | ion implanter 5, pyrolyser 2, aerogel, actinide partitioning |
| LuV | 10 | He fridge 6, coated conductor 2, HTS 2 |
| IV | 11 | hot cell 6, fluorspar 3, fuel fabrication, tritium |
| EV | 9 | cryogenic plant 4, extraction 3, hot strip mill, platinum plant |
| **Total** | **141** | **49 machines** |

The guideline asks for about x1.5 UXV's crossings, which is about 267 (rule 7). OpV has 141. The shortfall follows from the 45 lines ("Why 45"): OpV adds no line just to cross an old machine.

**Method.** Each row of *Older machines, new modes* names the line it serves. C1 re-counts from the recipe dump: for every line, the set of UIV-or-older machines of ours that appear in its node graph. The result must equal this table within ±3 *(tune)*.

## Quests

C2 builds `tools/quests/opv-chapter/` and `pl-data-opv.mjs`. The chapter follows the route and has short English quests with small rewards, and it never blocks a recipe (rule 5).

| Part | Quests | Ends with |
|---|---|---|
| Arrival | 3 | the OpV hull (A0) |
| The bulge relay | 3 | first arrival at SGR (c11) |
| Chain strand | 4 | `gtceu:chain_strand_single_cable`, `chain_lamina_stack` |
| Components | 5 | the nine `gtceu:opv_*` components |
| Field freezing | 3 | `field_frozen_casing`, the OpV energy hatches |
| Cosmic circuits | 4 | `gtnn:cosmic_mainframe` |
| Tetrons and gamma optics | 4 | `tetron_array`, `laue_lens` |
| Beams at Cygnus | 4 | `antiproton_stack_opv` |
| Antihydrogen and power | 4 | `antihydrogen_ice_cell`, the annihilation engine |
| Positrons at SGR | 2 | `dense_positron_cell` |
| Exotic matter | 3 | `stable_exotic_matter` |
| Kugelblitz | 3 | `kugelblitz_core`, the Hawking collector |
| Probes to Terzan 5 | 4 | the first `probe_seed` copy |
| Kardashev III | 2 | `bulge_light_census` |
| Census IV and scale | 3 | `superheavy_census_iv`, the x262,144 hatch, the array |
| Gate to MAX | 1 | `grindless:sgr_a_chart` |

That is 52 quests *(tune)*.

Every quest that touches named fiction (chain strand, Kugelblitz forming, the von Neumann foundry, the stable strangelet) says so in one line, as the UXV chapter does.

## Gate to MAX

Gate c13 runs on the warp gate at Cygnus X-1 orbit (G1):

- It holds 2^33 = 8,589,934,592 EU/t for 1,200 t *(tune)* on two OpV 16 A input hatches, fed by wireless case 13.
- It consumes one `kugelblitz_core`, the core that opens the way.
- It keeps the six proofs: `bulge_light_census`, `stable_exotic_matter`, `tetron_array`, `superheavy_census_iv`, `bulge_chart` and 4 `gtnn:cosmic_mainframe`.
- It outputs `grindless:sgr_a_chart`, researches `gtceu:max_machine_casing` and grants the `max` stage.

If S0-2 fails, the fallback is 2^31 EU/t for 4,800 t, the same EU on two UXV-sized 16 A loads.

| What is built or run | What it tests |
|---|---|
| Two OpV 16 A input hatches on the warp gate | field freezing at SGR (A3), the OpV hatch line, the 2^33 EnergyStack (S0-2) |
| A 2^33 hold from at least eight 2^30 sources | the generators at three places on one wireless network: Kardashev III (*Power*) |
| A consumed `kugelblitz_core` | the whole Cygnus antimatter line, the forge and the gamma optics |
| `bulge_light_census` kept | 64 collector nodes at Terzan 5, through self-replicating probes |
| `stable_exotic_matter` kept | the strangelet distiller and vault |
| `superheavy_census_iv` kept | the Ni-64 line from SGR and the census IV rows |
| `tetron_array` and 4 `gtnn:cosmic_mainframe` kept | the OpV circuit lines |
| `bulge_chart` kept | the UXV gate's output |

It unlocks:

- the `max` stage and the research of `gtceu:max_machine_casing`;
- `grindless:sgr_a_chart`, MAX's first input (Reserve for MAX).

It cannot unlock:

- Sagittarius A* as a place or GCYR's `black_hole_orbit`;
- the mirror shell or any superradiant row;
- the MAX hull, hatches or parallel hatch;
- MAX+ (intergalactic travel, creative items, the hyper stargate).

The chart is a map only. MAX's design builds the way there.

## Validator (-Tier opv)

C1 writes `tools/analysis/tiers/opv.json` with UXV's rules (uxv.md:848) and these additions:

- **Substages:** `opv` (home and Cygnus), `opv-sgr` (after c11) and `opv-terzan5` (after c12). No home or Cygnus recipe takes an SGR or Terzan 5 product before its substage, except as the *Bootstrap check* table lists.
- **Counts:** C1 re-counts 18 multiblocks, 45 lines (216 steps), 141 crossings and 49 older machines. Any line under 4 steps fails.
- **Component rule (owner):** every recipe that outputs a `gtceu:opv_*` machine, hatch or component, or an OpV controller, has all of these:
  - EU/t > V[UXV] = 134,217,728;
  - at least one `gtceu:opv_*` component;
  - `#gtceu:circuits/opv`, unless it is a GTM component that takes no circuit;
  - no `grindless:uxv_*`, `gtceu:uxv_*` or lower component, and no lower circuit tag.

  Controllers take at least 10 OpV components *(tune)*, hatches at least 1, and basic machines at least 2. Research items are exempt.
- **2^31:** no recipe EU/t at or above 2^31 except gate rows c11 and c13. No generator writes more than 2^30 per machine.
- **Generators:** each OpV generator row's balance (EU out / EU spent on its fuel, by the obtain model) lies in 1.3x-2.5x.
- **No voiding:** strangelet distiller c3 is the only voiding row, and F2's exemption names it.
- **Sites:** every row of machines 6-18 carries `recipe.dimension(...)` for its place.
- **Fiction marks:** every named-fiction item has an info page line saying so.
- **Reachability:** every F1 id is reachable at its substage, and the *Bootstrap check* has no cycle.

## Mods and integration

| Mod | Use | Spike |
|---|---|---|
| GregTech Modern 7.5.3 | HT ids for the hull, the hatches, the nine components and the basic machines; `EnergyStack` for 2^33; the parallel hatch at tier 13; `assembly_line` research | S0-1, S0-2, S0-5, S0-10 |
| GCYR 0.2.9 | two datapack places at tier 13 (fallback 12); no rocket offers them | S0-3, S0-8 |
| GT-- (gtnn) | `gtnn:cosmic_mainframe` and the cosmic SMDs in game; GT--'s recipe cut; `component_assline_casing_opv` stays hidden | S0-4 |
| KubeJS | the chain strand material and cable at V[OpV]; place-only rows with `recipe.dimension` | S0-7 |
| AE2 | nothing new (*AE2*) | none |
| EMI, FTB Quests | info pages; the OpV chapter | none |

### Hull, hatches and components (HT)

**Evidence.**

- The dump of the current pack (run 20261030-061423-obtain, `items.json`) has `gtceu:opv_machine_casing`, `gtceu:max_machine_casing` and `gtceu:max_battery`.
- It has no `gtceu:opv_machine_hull`, no `gtceu:opv_energy_input_hatch` and no `gtceu:opv_electric_motor`, because `highTierContent` is off (DECISIONS.md:457, 499, 594).
- UIV-S0 found that a second create of `machine_hull` or `energy_hatch` crashes the boot with a duplicate builder key (DECISIONS.md:526). UIV and UXV therefore widened UEV's builders with `.tiers(...)`.

**Choice.** The owner's directive (2026-10-29) reverses those three lines. The separate HT retrofit turns `highTierContent` on. GTM then registers its own `gtceu:opv_*` hull, energy and dynamo hatches (2 A, 4 A, 16 A), components and basic machines. OpV writes our recipes for them and designs against those ids.

HT also registers the `gtceu:max_*` hull and hatches:

- F2 hides every `gtceu:max_*` id that HT leaves visible, until `max`.
- F2 also cuts their GTM recipes. MAX's design owns them.

S0-1 records the full OpV and MAX id list.

**Fallback (if HT's S0 fails):** UEV's builders take a fourth tier, `.tiers(UEV, UIV, UXV, OpV)` at `uev/foundation.js:181` and `:194`, and the components become `grindless:opv_*` on the `uiv/uiv_components.js` pattern. Every recipe in this file stays the same apart from the id prefix.

- **Startup:** `startup_scripts/grindless/opv/*.js`. F1 registers ids. Each package registers its own machine and types.
- **Server:** `server_scripts/grindless/opv/*.js`. Older rows go where DECISIONS.md:508 puts them.
- **Data:** the two places (`data/grindless/gcyr/planets/`, `planets.json`, `orbits.json`); two rows of `relay_platforms.json`; `tables/opv_*.json`.

## Save compatibility

- Nothing is removed. Every UXV id that OpV reads is only consumed or kept.
- HT is the retrofit's own save step: the `grindless:uxv_*` components are hidden, with a 1:1 conversion. OpV adds no further conversion.
- Dimension ids `grindless:sgr1806_orbit` and `grindless:terzan5_core` are new. No older id changes.
- New rows on older machines only add recipes, so existing machines keep their recipes.
- Gate c11, c12 and c13 are new circuits, and c1-c10 are untouched.
- The x262,144 hatch adds a tier to the one create. Existing hatches keep their ids (S0-5).
- The wireless case 13 row is new. Existing networks keep their caps.
- The release notes of v0.16.0 list every new multiblock shape. None changes an existing shape.
- Arrival platforms place blocks only in new dimensions.
- A v0.15.0 save is reopened in C3 (T3).

## Risks

| Risk | Effect | Mitigation |
|---|---|---|
| Below the guideline (18 / 45 / 141 against 28 / 74 / 267) | the owner may want more | every missing item has a reason under *Considered and dropped*; open question 1 offers a second design pass instead of padding |
| HT retrofit late, or its S0 fails | no `gtceu:opv_*` components, hull, hatches or basic machines | F1 publishes the ids in `tables/opv_ids.json` and every package reads them from there. The one-line fallback: F1 registers `grindless:opv_*` components on the `uiv/uiv_components.js` pattern, and `uev/foundation.js:181, :194` gain OpV (`.tiers(UEV, UIV, UXV, OpV)`); only that table changes |
| 2^33 EU/t (16 A x V[OpV]) | no int holds it; GTM's EnergyStack, hatch or recipe paths may cap or wrap | S0-2 tests c13 as voltage V[OpV] x 16 A from two OpV 16 A hatches. Fallback: 2^31 x 4,800 t (the same EU) on the same hatches, or split over four 4 A hatches |
| V[MAX] = 2^31 (a long) in GTValues | a tier lookup on a long above 2^31 may return MAX and pre-empt it | c13 is written as V[OpV] with an amperage, never as a raw long EU/t; S0-2 reads the recipe's tier in EMI |
| Electron beam circuit space | 14 OpV rows against 9 free circuits | F3 lets a circuit repeat when item inputs differ; the subset-clash check stays |
| Far-place machines never formed at their site (UIV-A10) | a structure that cannot form at SGR or Terzan 5 ships | every far contract's T1 forms its machine at its site (named in each) |
| Self-replication becomes matter from nothing (rules 1, 8) | seeds multiply without feedstock | every foundry row consumes 16 `metal_feedstock`, 8 `cluster_sinter_casing` and 1 `vitamin_kit` per new seed; C1's obtain check fails any row whose seeds out exceed seeds in + vitamin kits |
| Antimatter or the Kugelblitz as a free battery (rule 8) | power from nothing | every generator burns a stated fuel; the EU balance stays in 1.3-2.5x (*Power*); C1 recomputes it from the obtain model's cost |
| The Kugelblitz pre-empts MAX (journey.md:54) | the mirror shell loses its point | holes are Schwarzschild and uncharged: no rotation, no superradiance, no Sgr A* product (D3 invariant) |
| GCYR refuses tier 13 | the two places do not load | S0-3; fallback tier 12 (UXV's), same rows |
| Circuit collisions | the most common repair | the table below was read on 2026-10-30; workers re-read before writing and record changes in the handoff |
| Pinned older tests | older tests break on a new row | each contract lists them as allowed edits |
| A4's workload (~38 basic machines and parts) | a long package | table-driven (`tables/opv_basic_machines.json`); `mechanical` (Haiku) fills rows; Sonnet writes the loader and reviews |
| M2's ordered inputs | an assembly-line recipe in a mega member may lose its order | S0-10 |
| A hidden input drops a recipe from EMI | the route looks missing | each contract names the later package; the integrator adds a pendingRoutes entry |
| Bench load | about 17 T1 runs | one T1 per package, serial, Linux VM first; client legs one per run |

### Bootstrap check

Every controller, travel item and gate input, against the substage order (`opv` → `opv-sgr` → `opv-terzan5`). C1 re-checks this table.

| Needed | Its inputs come from | Needed in | Cycle? |
|---|---|---|---|
| c11 `bulge_relay_seed` | magsail, `shequid_gyro`, `frc_cartridge` (UXV), on GTM's assembly line at UXV | `opv` (Cygnus) | no |
| UXV pasta machines at SGR | UXV controllers built at home and carried | `opv-sgr` | no: UXV recipes, no OpV input |
| `gtceu:opv_machine_hull` | opv casing (UXV-B6), strand cable and `chain_lamina_stack` (A0, SGR), superfluid He-3 (A1, older machines) | `opv-sgr` | no |
| Components (A1) | chain matter (A0), older modes; robot arm, emitter and sensor take `#gtceu:circuits/opv` from A2, joined on the UEV photonic hall (no OpV machine) | `opv-sgr` | no |
| Field-frozen press (13) | hull, 4 piston, 4 motor, 2 robot arm, 4 circuits, coil, strand cable, `lasagna_plate` | `opv-sgr` | no: no field generator; runs on two UXV 4 A hatches |
| Field generator, OpV hatches (A3) | `field_frozen_plate` (13), `aln_power_die` (A3) | `opv-sgr` | no: 13 takes neither |
| Controllers 1-12, 15-18, M2 | field generators (A3) | after A3 | no |
| Antihydrogen foundry (3) rows | dense positron cells (E1, SGR), cold antiprotons (B3, Cygnus) | `opv-sgr` | no: its research is `octupole_trap_magnet` (B3, home) |
| Kugelblitz forge (10) | `laue_lens`, mirror, `tetron_array` (B1), dense positrons (E1), `frc_cartridge` | after B1, E1 | no |
| Hawking collector (11) | research `kugelblitz_core` (10); fuel `stable_exotic_matter` (D2) | after D2, D3 | no: D2 before D3 |
| `pathfinder_probe` (c12) | `tetron_array` (B1), `xnav_unit` (R1, profiler at J0437), `shequid_gyro`, `hawking_drive` (D3) | `opv-sgr` | no |
| `vitamin_kit` | `tetron_array`, `xnav_unit`, 2 `gtceu:opv_robot_arm`, `hemt_amplifier` (home) | `opv-sgr` | no |
| Terzan 5 controllers 14-18 | built at home; research 14 `node_power_transmitter` (R1, home); 15 `bulge_debris` (14); 16 `metal_feedstock` (15); 17 `cluster_sinter_casing` (15); 18 `collector_node` (17); each research item is carried home on the ride | `opv-terzan5` | no: each is made by a machine already standing |
| First seed (foundry c2) | `pathfinder_probe_core` (the landed pathfinder) | `opv-terzan5` | no |
| Wireless case 13 blocks | OpV emitter and sensor (A1), field generator (A3), `chain_strand_repeater` | after A3 | no: nothing before G1 needs case 13 |
| Gate c13 | `kugelblitz_core` (D3), `bulge_light_census` (R3), `stable_exotic_matter` (D2), `tetron_array` (B1), `superheavy_census_iv` (B2), `bulge_chart` (UXV-B6), 4 cosmic mainframes (A2); two OpV 16 A hatches (A3); case 13 (W) | `opv-terzan5` | no |

## Build order

OpV is built in packages after v0.15.0, as UXV was. Each package below is one work-package issue (`.github/ISSUE_TEMPLATE/work-package.yml`), and its contract is written so the issue can be filled from this section alone. Each package's rationale is the machine sections and lines it cites.

**Test bands** are assigned by the integrator when it opens each issue (`tools\test\Get-GGTestZone.ps1 -Next` after UXV-C3's row). The worker adds only that row to `tools/test/zones.json`. F1, F2, C1 and C2 have no native test and no band.

**Script load-order bands** (`tools/analysis/script_order.json`) are integrator-owned. Every cross-file mutation names its band as "assigned by integrator"; packages never add `// priority:` lines (the integrator stamps them).

**HT first.** Every package except S0 and F3 waits for the HT retrofit's merge (it registers `gtceu:opv_*`). If HT's S0 fails, F1 takes the fallback (Risks) and nothing else changes.

### Common to every package

UXV's *Common to every package* (uxv.md:963-1029) applies with `uxv` replaced by `opv` in every path. The changes for OpV:

- **Allowed, always:** `startup_scripts/grindless/opv/<name>.js`, `server_scripts/grindless/opv/<name>.js`, `client_scripts/grindless/opv_<name>_lang.js`, new tables `tables/<name>*.json`, `tools/assets/Build-OpV<Name>Textures.ps1` and its outputs, `assets/emi/recipe/additions/grindless/opv_<name>_*.json`, `tools/analysis/test/opv-<name>.test.mjs`, `tools/test/overlay/kubejs/server_scripts/gg_test_opv_<name>.js` and the package's row in `tools/test/zones.json`.
  - **Its own obtain rule, pinned tests, EMI and sound:** as UXV.
  - **Pending entries:** a package whose product has no consumer yet names the consumer package (a pendingUses entry); a recipe whose input is hidden until a later package names that package (a pendingRoutes entry). The integrator adds both; the consuming or producing package deletes them.
- **Gates (QR):** as UXV, with tier 13 (F2). Until F2 lands, a package also runs them with `--era opv` and reads the findings by hand.
- **Info pages and loops (QR):** as UXV. Items with no consumer get a page naming their use or "stock for MAX". The loops:

  | Type → loop | Type → loop |
  |---|---|
  | `tetron_assembly` → `loop_tetron_fab` | `strangelet_distillation` → `loop_strangelet_distiller` |
  | `gamma_optics` → `loop_gamma_optics_works` | `kugelblitz_forming` → `loop_kugelblitz_forge` |
  | `antihydrogen_synthesis` → `loop_antihydrogen_foundry` | `hawking_power` → `loop_hawking_collector` |
  | `strangelet_growth` → `loop_strangelet_vault` | `magnetic_pair_production` → `loop_magnetic_pair_converter` |
  | `annihilation_power` → `loop_annihilation_engine` | `field_freezing` → `loop_field_frozen_press` |
  | `jet_beam_extraction` → `loop_jet_beam_line` | `debris_harvesting` → `loop_debris_harvester` |
  | `antiproton_production` → `loop_spallation_target_station` | `replication_refining` → `loop_replication_refinery` |
  | `beam_cooling` → `loop_antiproton_decelerator` | `self_replication` → `loop_von_neumann_foundry` |
  | `collector_node_assembly` → `loop_collector_node_works` | `bulge_light_collection` → `loop_bulge_collector` |

  M2 keeps GTM's sounds.
- **Tooltips (owner, 2026-10-29):** every OpV multiblock's tooltip is short, as GTM's: one line saying what it does, then one line per thing it accepts (parallel hatch, wireless, laser, subtick or batching, its site). No long text, no circuit lists. Detail belongs on the EMI info page. Part of every multiblock contract's acceptance.
- **Structures (QR):** as UXV.
- **Prohibited, always:** as UXV, plus `tables/opv_ids.json` (F1 owns it) and every `gtceu:opv_*` registration (HT owns them).
- **Older rows:** as UXV (DECISIONS.md:508). UXV machines take rows as older machines; their tables are older tables.
- **Circuits:** the table below was read on 2026-10-30. The worker re-reads every row of the type before writing; if a number has been taken since, it takes the next free one and records it in the handoff.
- **Ids:** exactly as in this file and `tables/opv_ids.json`. A new cross-package id, or a changed one, is an escalation.
- **Bootstrap:** as UXV, against the table above.
- **Invariants, always:**
  - the OpV component and circuit rule (*Voltages and controllers*): every machine, hatch, basic machine and controller recipe takes the OpV hull, OpV components in GT-like counts, `#gtceu:circuits/opv` and runs above V[UXV]; never a UXV-or-lower component or circuit;
  - no OpV recipe takes a MAX id (`gtceu:max_*`, `sgr_a_chart`) or anything in *Reserve for MAX*; `gtceu:max_machine_casing` is only researched (G1);
  - no home or Cygnus recipe takes an SGR or Terzan 5 product before its substage;
  - chain strand, Ni-64 slab, field-frozen plate and dense positrons only from SGR; antiprotons, strangelet seeds and Kugelblitz cores only from Cygnus; feedstock, casings, seeds and nodes only from Terzan 5;
  - every generator burns a stated fuel and keeps its balance in 1.3-2.5x;
  - no recipe EU/t at or above 2^31 except c11 (2^31) and c13 (2^33 or its fallback, S0-2);
  - UXV's invariants hold.
- **Controllers, parts and casings:** as *Voltages and controllers*. Casing blocks: `field_frozen_casing` is machine 13 c3 (A3); `neg_xhv_casing` (D1, line 25's last step) and `annihilation_shield_casing` (B3) are assembler rows at OpV with 2 `#gtceu:circuits/opv`. No crafting-table recipe, except save-compat 1:1 or unpacking.
- **Tests:** as UXV. A far-place machine's T1 forms it at its site.
- **Repairs and agent:** as UXV. `mechanical` (Haiku) may take A4's rows and lang parity.
- **Proof reuse:** UXV proved, and no OpV T1 re-proves:
  - the UEV builders with a third tier (UXV-F1);
  - one recipe at 2^31 on two UXV 16 A hatches (UXV-S0-2, B6);
  - wireless case 12 long caps (UXV-W);
  - the x65,536 hatch (UXV-M1);
  - relay platforms leaving from Cygnus orbit (UXV-B1, `uxv/kerr_sling.js`);
  - tier 12 datapack places (UXV-S0-3);
  - KubeJS cable at V[UXV] (UXV-B4's strand wire);
  - `.dimension` rows and a string site in `tables/vela_pasta.json`.

**Circuits by type** (in use as read; OpV numbers by package; EB after F3):

| Type (where its rows live) | In use | OpV |
|---|---|---|
| UXV pasta extraction (`tables/vela_pasta.json`) | 1-2 | A0 c3-5 |
| UXV pasta sorting / drawing / lamination (same) | 1 / 1 / 1-2 | A0 sorting c2-4, drawing c3-4, lamination c3-5 |
| UXV MTJ sputtering (`uxv/spin_deposition.js`) | re-read | A2 ×4 (NEG excluded), D1 ×2, B1 ×2 |
| UIV neutronium cage (`uiv/rx_j1856.js`) | 1-2 | A0 c3 (spent `cage_part` re-press) |
| UIV femtosecond writer | 1-4 | A1 c5, A2 c6 |
| UIV ion slicing (TFLN fab) | 1-4 | A2 c5-7, B1 c8 |
| UIV BEUV scanner | 1-3 | A2 c4-8, A3 c9 |
| UIV STM lithography | 1-3 | A2 c4 |
| UIV millikelvin cryostat | 1-3 | A1 c4-5, B1 c6, B3 c7 |
| UIV levitation melter | 1-16 | D1 c17-18 |
| UIV X-ray pulse profiler | 1-2 | R1 c3 |
| UEV calutron (`tables/isotopes.json`) | 1-10, 13, 14 (UXV-B5) | B2 c11, D2 c12, B3 c15 |
| UEV cyclotron / recoil / chem lab (`tables/superheavy.json`) | 1-10 / 1-9 / 1-10 | B2 c11, c13, D2 c12 / B2 c10-11 / B2 c11 |
| UEV CVI (`tables/composites.json`) | 1-5 | A1 c6-7, A2 c8, B3 c9, B1 c10-11 |
| UEV nitride magnet works | 1-15 | A3 c16-17 |
| UEV megabar | 1-6 | A1 c7, B1 c8 |
| UEV SNSPD foundry / photonic hall | 1-5 / 1-7 | A2 c6 / A2 c8 |
| UEV electron beam (`tables/electron_beam.json`) | 1-20, 27-29 | free 21-26, 30-32; after F3: A1 21, A3 22, B2 23, D1 24-26 and 30-31, B3 32 and 21-22 (distinct inputs), E1 23 (distinct), R1 24 (distinct) |
| UHV crystal growth (`tables/crystals.json`) | 1-18 | A1 c19-20, A2 c21, A3 c22, D1 c23, B1 c24, B3 c25-27 |
| UHV nuclear clock lab | 1-3 | A1 c4, R1 c5 |
| UHV MBE (`uhv/photonics.js`) | 1-8 | A2 c9-10, B3 c11 |
| UHV SiC device fab | 1-5 | A2 c6, R1 c7, A3 c8 |
| UHV positron accumulator | 1-4 | E1 c5 |
| UHV spark plasma sinterer | 1-7 | A1 c8-10, D1 c11-13, B1 c14, B3 c15 |
| UHV PBO plant | 1-7 | A0 c8, A1 c9 |
| UHV warp gate (`tables/gate.json`) | 1-2, 4-10 | A0 c11, R1 c12, G1 c13 |
| UV zone refining | 1-9 | A1 c10, A2 c11 |
| UV ion implanter (ZPM) | 1-8 | A1 c9, A2 c10-13 |
| UV synchrotron | 1-8 | D2 c9, B1 c10-11 |
| UV antimatter trap | 1-4 | B3 c5 |
| UV SRF cavity works | 1-5 | A2 c6 (D1 reads it) |
| UV MOCVD / fibre draw | 1-16 / 1-16 | A2 c17-19 and c21, A1 c20, A3 c22 / A2 c17, R1 c18 |
| ZPM actinide partitioning / pyrolyser | 1-7 / 1-4 | B3 c8-9 / B3 c5, R2 c6 |
| LuV HTS magnet works (`tables/hts_magnet_works.json`) | 1-6 | A1 c7-8, B3 c9-10 |
| IV hot cell (`tables/hot_cell.json`) | 1-15 | A1 c16, D1 c17, B3 c18, D2 c19, R1 c20 |
| IV fuel fabrication | 1-11 | B3 c12 |
| EV extraction cascade | 1-22 (UXV-B5 c22) | A1 c23, A2 c24 and c26-27, B1 c25, R1 c28-29 |
| EV platinum plant | 1-14 | D1 c15-16, A2 c17 |
| He refrigerator, tritium removal | re-read | keyed by input; each package re-reads |
| Cryogenic plant, fluorspar kiln | keyed by input | no circuit |
| Hot strip mill | each package's own file | D1 |

## S0 spikes

One worker, one branch, no shipped content; each spike is the smallest native probe that answers its question.

| Spike | Question | If it fails | Changes |
|---|---|---|---|
| S0-1 | With HT merged, do `gtceu:opv_*` components, hull, energy and dynamo hatches (1, 4, 16 A), parallel hatch and basic machines exist; which `gtceu:max_*` ids appear? | the HT fallback (Risks) | F1, F2's MAX list |
| S0-2 | Does a recipe of V[OpV] x 16 A (2^33 EU/t) run for 1,200 t from two OpV 16 A hatches, with long buffers and no wrap? What tier does EMI show? | 2^31 x 4,800 t (Gate to MAX) | G1 |
| S0-3 | Does GCYR 0.2.9 load two planets at tier 13 from the datapack, with a relay platform? | tier 12 | F1 |
| S0-4 | Is `gtnn:cosmic_mainframe` in `#gtceu:circuits/opv`, and can GT--'s own recipe and the cosmic SMDs be removed without breaking its loader? | tag ours (`#gtceu:circuits/opv` + the item) and hide GT--'s chain | A2, F2 |
| S0-5 | Does a x262,144 parallel hatch overflow GTM's parallel or EU maths (long EU/t x parallel)? | x131,072 (open question 7) | M1 |
| S0-6 | Does wireless case 13 hold 64 A x V[OpV] caps as long end to end? | cap at 16 A for OpV | W |
| S0-7 | Does a KubeJS `chain_strand` cable carry 16 A x V[OpV] with zero loss? | superconductor flag, or cable at 4 A | F1, A0 |
| S0-8 | Do the two site atmospheres and gravities (vacuum, orbit; low-g body) load? | GCYR defaults | F1 |
| S0-9 | Does a second-hop throw (c12 from Cygnus to Terzan 5) survive `@restart` with chunk loading? | land at a Cygnus relay and re-throw | R1 |
| S0-10 | Does `gtceu:assembly_line_array` keep GTM's ordered-input check and research at x262,144? | drop ordered inputs only for the array (fiction), or keep it single | M2 |
| S0-11 | Can a generator row scale with consumed node packs (c1-c3) without a script? | three fixed rows (as written) | R3 |
| S0-12 | Do UXV's four pasta machines form and run at SGR with a string site row? | duplicate the four rows' site as an array | A0 |

Order: S0-1 and S0-2 first (they gate F1 and G1), then 3, 7, 8, then the rest. The worker writes one result line per spike to the S0 handoff; the integrator copies them to DECISIONS.md.

**Results (2026-10-30, `docs/research/opv-s0.md`):**
- PASS: S0-1 (91 `gtceu:opv_*` ids, no OpV parallel hatch), S0-2 (2^33 x 1,200 t; EMI shows the tier as MAX), S0-3 and S0-8 (tier 13 places), S0-6, S0-7, S0-9 (survives a restart), S0-12. Their fallbacks are not used.
- S0-4 PASS with a caveat: the mainframe is in `#gtceu:circuits/opv`, but GT--'s cosmic recipes are Java-registered and `event.remove` finds none (A2, F2).
- S0-5: the library lacks tier 13 (M1 changes it); the mechanism reports x262,144 with long EU/t, so no x131,072 fallback.
- S0-10 FAIL: M2 takes the fallback unless its own T1 proves ordered and research recipes first.
- S0-11 FAIL (likely the harness: a consumer recipe type): R3 writes three fixed rows.

### Foundations

#### F1. Ids, places and the id table

- **Objective:**
  - `tables/opv_ids.json`: the component, hull, hatch, parallel-hatch and basic-machine ids (`gtceu:opv_*` under HT, or the fallback's);
  - the materials and fluids: `gtceu:chain_strand` (ingot, wire, single cable; cable at V[OpV], S0-7), `grindless:superfluid_helium_3`, `jet_proton_beam`, `hot_pair_plasma`;
  - the places: `grindless:sgr1806_orbit` and `grindless:terzan5_core` (GCYR tier 13, S0-3, S0-8), their two rows in `tables/relay_platforms.json` (UXV-B1 pattern: source `grindless:cygnus_x1_orbit`), and the substages `opv-sgr` and `opv-terzan5`;
  - the casing blocks `grindless:field_frozen_casing`, `annihilation_shield_casing`, `neg_xhv_casing`;
  - every cross-package item id, with names in en_us and es_es: `bulge_relay_seed`, `launched_bulge_seed`, `chain_lamina_stack`, `ni_chain_slab`, `chain_field_coil`, `chain_composite_rod`, `chain_composite_rotor`, `superfluid_he3_seal`, `chain_mesh_belt`, `opv_harmonic_drive`, `th229_lasing_crystal`, `hpge_compton_crystal`, `si28_soi_wafer`, `inas_al_wafer`, `gated_2deg_wafer`, `tetron_die`, `cryo_cmos_die`, `nb_tsv_interposer`, `cryo_optical_link`, `hemt_amplifier`, `gan_mmic`, `sdd_die`, `field_frozen_plate`, `aln_power_die`, `tetron_array`, `gamma_multilayer_mirror`, `laue_lens`, `be_beam_window`, `ir_spallation_target`, `spent_ir_target`, `li6_hydride_shield`, `electron_cooler`, `stochastic_cooling_pickup`, `pb208_beam_cell`, `octupole_trap_magnet`, `levitation_trap_cell`, `lyman_alpha_laser`, `gamma_absorber_tile`, `tpv_panel`, `acmf_pellet`, `seed_positron_plasma`, `dense_positron_cell`, `cold_antiproton_cell`, `antiproton_stack_opv`, `antihydrogen_ice_cell`, `strangelet_seed`, `stable_exotic_matter`, `kugelblitz_core`, `hawking_drive`, `xnav_unit`, `node_power_transmitter`, `bulge_debris`, `metal_feedstock`, `silicate_debris_fraction`, `si_alloy_powder`, `cluster_sinter_casing`, `collector_node`, `spent_collector_node`, `deployed_node_pack`, `probe_seed`, `vitamin_kit`, `pathfinder_probe`, `launched_pathfinder`, `pathfinder_probe_core`, `bulge_light_census`, `superheavy_census_iv`, `element_124_recoil`, `element_126_recoil`, `chain_strand_repeater`, `sgr_a_chart`.
- **`<name>`:** `foundation`.
- **Allowed (extra):** `tables/opv_ids.json`; `tables/relay_platforms.json` (2 rows); the GCYR planet datapack files for the two places (as UXV-F1); in the HT fallback only, `uev/foundation.js:181, :194` and `startup_scripts/grindless/opv/opv_components.js`.
- **References:** *Places and site rules*; *Bridges*; uxv.md F1 (:1094); DECISIONS.md:498 (relay), :526 (duplicate builder key); S0-1, -3, -7, -8.
- **Depends on:** S0; HT merged (or its fallback).
- **Invariants:** registers ids only, no recipe; no `gtceu:opv_*` registration (HT's); dimension ids are final (save rule).
- **Acceptance:** every id above exists with both names; the two places load at tier 13 (or 12); `tables/opv_ids.json` lists every id the packages read.
- **Tests:** T0. No band.
- **Commits:** 2 (ids and table; places).
- **Serial:** alone.

#### F2. Gating, cuts and obtain rules (integrator)

- **Objective:**
  - `hidden_until.json`: every F1 id at its substage; every `gtceu:opv_*` id until its producing package; every `gtceu:max_*` id until `max`;
  - class B obtain rules, one per producing package (A0-A4, B1-B3, D1-D3, E1, R1-R3, W, M1, M2, G1);
  - cuts (`server_scripts/grindless/opv/cuts.js`): GTM's recipes for every `gtceu:opv_*` component, the hull, hatches, parallel hatch and basic machines; every `gtceu:max_*` recipe; GT--'s `gtnn:cosmic_mainframe` and the five `gtnn:cosmic_smd_*` recipes (S0-4: Java-registered, so `event.remove` finds none; locate the source in the jar first, and if it cannot be cut, hide those routes from EMI and leave the obtain rule on ours); `gtceu:chain_strand` wiremill, extruder, bender, assembler-cable, macerator and arc-furnace routes;
  - the no-voiding exemption for distiller c3 (negative strangelets, line 36);
  - QR tier 13: `eraTier opv: 13`, `complexFloor "13": 10` *(tune)*, `TIER_NAMES` and process_audit `ERAS`;
  - `script_order.json` bands for `opv/`; pendingRoutes and pendingUses as each contract names them.
- **Depends on:** F1. **Tests:** T0. **Commits:** 2.
- **Serial:** pair: W.

#### F3. Electron beam circuit space

- **Objective:** `uev/electron_beam.js:37-45` lets a circuit repeat within a type when the two rows' item inputs differ; the subset-clash check at :16 stays and still fails any row whose inputs are a subset of another's.
- **`<name>`:** none (an older file).
- **Allowed:** `server_scripts/grindless/uev/electron_beam.js`, `tools/analysis/test/uev-electron_beam.test.mjs`.
- **References:** `uev/electron_beam.js:16-17, :37-47`; *Circuits by type* (EB).
- **Depends on:** nothing (runs beside S0).
- **Invariants:** every existing EB row loads unchanged; `circuit` stays 1..32; a repeat with identical item inputs is still an error.
- **Acceptance:** two rows with the same circuit and different item inputs load; a pair with subset inputs is reported in `clashes`.
- **Tests:** T0 (the unit test gains both cases). T1: `gg_test_opv_eb_circuits`, band assigned by integrator. Doubt: GTM's lookup picks the right row when two EB recipes share a circuit and differ only in one item, and `global.grindless.electronBeam.clashes` stays empty.
- **Commits:** 1.
- **Serial:** a standalone serial package on a shared mechanism; nothing else writes the EB loader.

#### W. Wireless case 13

- **Objective:**
  - `startup_scripts/grindless/lv/wireless_energy.js` case 13 after :305;
  - the OpV row in `tables/wireless_energy.json` (after :50-52): cell `grindless:opv_smes_cell` (16,106,127,360,000 EU *(tune)*), emitter `gtceu:opv_emitter`, sensor `gtceu:opv_sensor`, link `grindless:chain_strand_repeater`, the OpV casing metal, wire `gtceu:chain_strand`;
  - caps: 2 A 10,737,418,240; 4 A 21,474,836,480; 16 A 85,899,345,920; 64 A 343,597,383,680 EU (V[OpV] x amps x 10, long);
  - the repeater (chain strand wire + `pasta_strand_repeater` + `tetron_die`) and the cell (`gtceu:assembler` at OpV: strand wire, `chain_lamina_stack`, 2 `gtceu:opv_field_generator`) in `server_scripts/grindless/opv/wireless.js`.
- **`<name>`:** `wireless`.
- **Allowed (extra):** those two older files (1 case, 1 row); pinned tests `uev-wireless`, `uiv-wireless`, `uxv-wireless` (`.test.mjs`).
- **References:** *Power*; `lv/wireless_energy.js:294-305`; `tables/wireless_energy.json:5`; uxv.md W (:1145); S0-6.
- **Depends on:** F1, S0-6. Its recipes read A0's wire, A1's emitter and sensor, A2's die and A3's field generator: pendingRoutes naming A0, A1, A2 and A3.
- **Invariants:** no new mechanism beyond the case; 5% in-loss as built; the network tier is the lowest cell's.
- **Acceptance:** the OpV hatches, covers and cell exist; their recipes follow the component rule and appear once their inputs land.
- **QR:** tooltip rule for the tower is unchanged (not ours to restyle); the cell's info page states its capacity.
- **Tests:** T0. T1: `gg_test_opv_wireless`, band assigned by integrator. Doubt: a 64 A OpV wireless hatch draws 2^35 EU/t for one tick from a case 13 network with every buffer long.
- **Commits:** 2.
- **Serial:** pair: F2.

#### M1. OpV parallel hatch (x262,144)

- **Objective:** `lib/parallel_hatch.js:81` tiers gain 13; the name ternary at :85 gains `opv_parallel_hatch`; the hatch list at :103 gains `gtceu:opv_parallel_hatch`; its recipe in `server_scripts/grindless/opv/parallel.js` (assembly line at OpV: hull, 4 field generator, 4 robot arm, 4 sensor, 8 circuits, 4 `tetron_array`, superfluid He-3), (S0-1: HT does not register it).
- **`<name>`:** `parallel`.
- **Allowed (extra):** `lib/parallel_hatch.js` (three lines; a shared library: standalone serial package); pinned tests `uev-parallel-hatch`, `uiv-parallel-hatch`, `uxv-parallel_hatch` (`.test.mjs`).
- **References:** *Nothing one at a time*; mega.md 4.11, 4.12; DECISIONS.md:505; S0-5.
- **Depends on:** F1, S0-5. Its recipe reads A1-A3 and B1 (pendingRoutes naming them).
- **Invariants:** 4^9 = 262,144 fits an int; the hatch is the only change to the library.
- **Acceptance:** the hatch registers once, forms on an existing mega member and reports x262,144.
- **Tests:** T0. T1: `gg_test_opv_parallel`, band assigned by integrator. Doubt: at x262,144 on a GTM recipe the EU/t x parallel product stays long and the energy bound picks the parallel, not an overflow (S0-5's bare result, now with the shipped hatch).
- **Commits:** 1.
- **Serial:** alone (shared library).

### Wave A: chain matter, components and circuits

#### A0. Bulge relay, chain matter and the hull

- **Objective:**
  - `grindless:bulge_relay_seed`: assembly line at VA[UXV]: 32 `gtceu:pasta_strand_single_wire` (the magsail), 4 `lasagna_plate`, 1 `shequid_gyro`, 2 UXV sensors (`gtceu:uxv_sensor` after HT), 1 `frc_cartridge` *(tune)*. It is a travel item made before any OpV part exists, so it is the one OpV-stage recipe outside the component rule (*Bootstrap check*);
  - gate c11 in `tables/gate.json`: seed → `launched_bulge_seed`, 2^31 EU/t for 2,400 t *(tune)* on two UXV 16 A hatches at Cygnus X-1 orbit;
  - the hold in `server_scripts/grindless/opv/bulge_relay.js` (`uxv/kerr_sling.js:26, :196` pattern): places F1's SGR platform and grants `opv-sgr`;
  - lines 1-2 (*Older machines, new modes*): `tables/vela_pasta.json` gains `grindless:sgr1806_orbit` in its site list (S0-12) and 11 rows: extraction c3-5, sorting c2-4 (`cage_part` consumed), drawing c3-4, lamination c3-5 (c5 is `chain_mesh_weave`); PBO plant c8 braid (`uhv/elevator.js:214`); the UIV neutronium cage c3 re-presses spent `cage_part` (`uiv/rx_j1856.js`); one `gtceu:assembler` row insulates the braided wire into `gtceu:chain_strand_single_cable` (GTM's single-cable circuit, read first);
  - `gtceu:opv_machine_hull` (*Voltages and controllers*): `gtceu:opv_machine_casing` + 2 chain cable + 2 `chain_lamina_stack` + 500 mB `superfluid_helium_3`, 2^28 EU/t for 200 t.
- **`<name>`:** `bulge_relay`.
- **Allowed (extra):** `tables/gate.json` (1 row); `tables/vela_pasta.json` (11 rows, the site list); the PBO rows in `uhv/elevator.js` (1 row); the cage rows in `uiv/rx_j1856.js` (1 row); pinned tests `uxv-vela_pasta`, `uiv-rx_j1856`, `uhv-elevator`, `uhv-gate`.
- **References:** *Bridges and first arrivals*; *Places and site rules*; lines 1-2; uxv.md B1 (Kerr sling); `uhv/gate.js:30-34, :90-97`; DECISIONS.md:498; S0-7, S0-12.
- **Depends on:** F1, F2, UXV-B6 (c10, `bulge_chart`, the `opv` stage), S0-7, S0-12.
- **Invariants:** no OpV component in A0; chain matter only at SGR; c11 and c13 are the only rows at or above 2^31.
- **Pending:** `chain_mesh_weave` → A1 and `caged_ni_chain` → B2 (pendingUses); the hull's He-3 → A1 (pendingRoutes).
- **Acceptance:** the seed launches from Cygnus, the hold places the SGR platform and grants `opv-sgr`; the strand cable carries 16 A x V[OpV] with zero loss (or S0-7's fallback); the hull exists, hidden until A1.
- **Tests:** T0. T1: `gg_test_opv_bulge_relay`, band assigned by integrator. Doubt: the four UXV pasta machines form and run the new rows at SGR, and the hold survives `@restart` (S0-12 proved a bare row; UXV-B1 proved the sling from Cygnus).
- **Commits:** 3 (relay; chain matter; hull).
- **Serial:** alone.

#### A1. Components

- **Objective:**
  - lines 4-10, `superfluid_helium_3` (line 5), and seven components as *Voltages and controllers*: `gtceu:opv_electric_motor`, `_electric_pump`, `_conveyor_module`, `_electric_piston`, `_robot_arm`, `_emitter`, `_sensor`; `gtceu:opv_fluid_regulator` if HT registers it (S0-1): 1 pump + 2 circuits + 1 `opv_harmonic_drive`;
  - older rows (circuits as *Common*'s table): CVI c6-7; SPS c8-10; megabar c7; femtosecond c5; millikelvin cryostat c4-5; EB 21; HTS c7-8; crystal growth c19-20; nuclear clock c4; MOCVD c20; zone refining c10; implanter c9; hot cell c16; extraction c23; PBO c9; one row in `tables/am_powders.json` (re-read its key); keyed rows on the cryogenic plant, fluorspar kiln (ThF₄) and He refrigerator.
- **`<name>`:** `components`.
- **Allowed (extra):** the rows above in their files; pinned tests `uiv-tfln_femtosecond`, `uiv-memories_cryostat`, `uev-composites`, `uev-megabar`, `uev-electron_beam`, `uhv-crystals`, `uhv-propulsion`, `uhv-elevator`, `uv-detectors`, `zpm-qubits`, `uv-photonics`, `uv-materials`, `iv-features`, `ev-features`.
- **References:** *Voltages and controllers* (component table); lines 4-10; *Older machines, new modes*; S0-1.
- **Depends on:** A0; HT merged.
- **Invariants:** each component runs at 268,435,456 EU/t on the GCYM large assembler with two UXV 4 A hatches until A4; GT-like counts as the table; no UXV-or-lower component inside an OpV one.
- **Pending:** deletes A0's entries naming A1. Robot arm, emitter, sensor and regulator read circuits and `cryo_optical_link`: pendingRoutes naming A2. Components feed A3, A4, W, M1 and every controller (no pendingUses: A3 consumes them first).
- **Acceptance:** motor, pump, conveyor and piston are craftable at `opv-sgr`; the other four appear when A2 lands; GTM's own recipes for them are absent (F2's cut).
- **Tests:** T0. T1: `gg_test_opv_components`, band assigned by integrator. Doubt: the large assembler on two UXV 4 A hatches runs a 2^28 component row, and HT's recipe for the same id is gone in game (S0-1 read ids, not recipes).
- **Commits:** 3 (lines 4-6; lines 7-10; components).
- **Serial:** pair: A2. A1 merges first on the shared files (*Parallel and serial*).

#### A2. Circuits

- **Objective:**
  - lines 11-18;
  - the mainframe join on the UEV photonic integration hall c8 (`uev/photonics.js:88`): `cryo_cmos_die` + `nb_tsv_interposer` + `cryo_optical_link` + `hemt_amplifier` → `gtnn:cosmic_mainframe`, already in `#gtceu:circuits/opv` (S0-4); GT--'s lower cosmic items as S0-4 and F2 decide;
  - older rows: UXV MTJ x4 (Nb TSV fill, Au, SDD anode, NbTiN); femtosecond c6; ion slicing c5-7; BEUV c4-8; STM c4; CVI c8; SNSPD c6; crystal growth c21; MBE c9-10; SiC fab c6; zone c11; implanter c10-13; SRF c6; MOCVD c17-19 and c21; fibre c17; extraction c24 and c26-27; platinum plant c17; He refrigerator keyed.
- **`<name>`:** `circuits`.
- **Allowed (extra):** the rows above in their files; pinned tests `uxv-spin_deposition`, `uiv-tfln_femtosecond`, `uiv-beuv_stm`, `uev-composites`, `uev-photonics`, `uhv-crystals`, `uhv-photonics`, `uhv-power_devices`, `uv-detectors`, `zpm-qubits`, `uv-cold`, `uv-photonics`, `ev-features`.
- **References:** lines 11-18; *Family steps* (circuits); `uev/photonics.js:88`; S0-4.
- **Depends on:** A0; HT merged; S0-4.
- **Invariants:** GT--'s mainframe and cosmic SMD recipes stay cut (F2); the join is an assembly, not a line.
- **Pending:** deletes A1's pendingRoutes naming A2. pendingUses: `gan_mmic`, `sdd_die` → R1; `gated_2deg_wafer`, `cryo_cmos_die`, `nb_tsv_interposer` → B1; the NbTiN film → D1.
- **Acceptance:** `gtnn:cosmic_mainframe` comes only from our row and counts as `#gtceu:circuits/opv`; A1's four components become craftable.
- **Tests:** T0. T1: `gg_test_opv_circuits`, band assigned by integrator. Doubt: the mainframe satisfies `#gtceu:circuits/opv` in a GTM assembly-line recipe and GT--'s route is gone in game (S0-4 read the tag offline).
- **Commits:** 3 (lines 11-14; lines 15-18; join).
- **Serial:** pair: A1.

#### A3. Field-frozen press, field generator and hatches

- **Objective:**
  - machine 13 at SGR on two UXV 4 A hatches (*13*); lines 3 and 45; `grindless:field_frozen_casing` (machine 13 c3);
  - `gtceu:opv_field_generator` (component table);
  - the six hatches at VA[OpV] (*Voltages and controllers*): energy 2, 4 and 16 A; dynamo 1, 4 and 16 A;
  - older rows: EB c22 (the W-Re can, line 3); nitride magnet works c16-17 (`uev/composites.js:64`); crystal growth c22; MOCVD c22; BEUV c9; SiC fab c8.
- **`<name>`:** `field_press`.
- **Allowed (extra):** the rows above in their files; pinned tests `uev-electron_beam`, `uev-composites`, `uhv-crystals`, `uv-photonics`, `uiv-beuv_stm`, `uhv-power_devices`.
- **References:** *13*; lines 3, 45; *Voltages and controllers*; F3.
- **Depends on:** A1, A2, F3.
- **Invariants:** `field_frozen_plate` only at SGR; machine 13 is the only OpV machine built on UXV hatches (its own hatches come from it).
- **Pending:** deletes W's and M1's pendingRoutes naming A3, and A4's field-generator rows' entries. pendingUses: `field_frozen_plate` → D3 (drive); `field_frozen_casing` → E1, D3.
- **Acceptance:** machine 13 forms at SGR; its controller follows the component rule; the tooltip is short as *Common* (one line, then what it accepts: parallel hatch, its site); every hatch takes the sensor or emitter, `field_frozen_plate`, `aln_power_die`, and field generators from 4 A up.
- **Tests:** T0. T1: `gg_test_opv_field_press`, band assigned by integrator. Doubt: machine 13 forms at its site on two UXV 4 A hatches, and an OpV 16 A energy hatch it made feeds a 2^30 row as long.
- **Commits:** 3 (machine and line 3; line 45; field generator and hatches).
- **Serial:** pair: A4.

#### A4. Basic machines

- **Objective:** `tables/opv_basic_machines.json` (about 38 rows *(tune)*, the list S0-1 reads) and its loader `server_scripts/grindless/opv/basic_machines.js`: each `gtceu:opv_<machine>` is a `gtceu:assembler` row at VA[OpV] taking the OpV hull, the components GTM's own recipe for that machine uses at its counts (never fewer than 2), 2 `#gtceu:circuits/opv` and 2 chain cables. If HT ships its own table pattern, follow it.
- **`<name>`:** `basic_machines`.
- **Allowed (extra):** none beyond *Common*. The worker writes the loader and five rows; `mechanical` (Haiku) fills the rest.
- **References:** *Voltages and controllers*; *Hull, hatches and components (HT)*; S0-1.
- **Depends on:** A1, A2. Rows with a field generator: pendingRoutes naming A3.
- **Invariants:** GTM's own recipes stay cut (F2); no machine below the component rule.
- **Acceptance:** every row has ≥2 components (C1's threshold); the OpV assembler takes over the component rows from the large assembler.
- **Tests:** T0. T1: `gg_test_opv_basic_machines`, band assigned by integrator. Doubt: `gtceu:opv_assembler` on a chain strand cable, placed with `/setblock` and connected with `setConnection`, runs a 2^28 component row.
- **Commits:** 2.
- **Serial:** pair: A3.

### Waves B, D and E: home, Cygnus and SGR

Every multiblock contract below shares this acceptance: the controller follows the component rule (*Voltages and controllers*); the tooltip is short, as *Common*; a far-place machine forms at its site in T1 unless the contract says why not.

#### B1. Tetron fab and gamma optics works

- **Objective:** machines 1 and 2 (*1*, *2*); lines 19, 34, 35; older rows: UXV MTJ x2 (In bumps; `wc_sic_multilayer`); ion slicing c8; millikelvin cryostat c6; CVI c10-11; megabar c8; crystal growth c24; SPS c14; synchrotron c10-11 (`tables/accelerators.json`); extraction c25.
- **`<name>`:** `tetron_optics`.
- **Allowed (extra):** the rows above in their files; pinned tests `uxv-spin_deposition`, `uiv-tfln_femtosecond`, `uiv-memories_cryostat`, `uev-composites`, `uev-megabar`, `uhv-crystals`, `uhv-propulsion`, `uv-accelerators`, `ev-features`.
- **References:** *1*, *2*; lines 19, 34, 35.
- **Depends on:** A2, A3.
- **Pending:** deletes A2's entries naming B1 and M1's naming B1. pendingUses: `tetron_array` → M2, R1, G1; `laue_lens`, `gamma_multilayer_mirror` → D3.
- **Acceptance:** as the wave; failed tetron dies go to the extraction cascade.
- **Tests:** T0; no T1 (proof reuse: home machines on the workable class UXV-A1-A8 proved; no new mechanism). C3's T2 forms them.
- **Commits:** 3 (machine 1 and line 19; machine 2 and lines 34-35; older rows).
- **Serial:** pair: B2.

#### B2. Census IV (rows only)

- **Objective:** lines 43-44: EB c23 thaws `caged_ni_chain`; calutron c11 (`tables/isotopes.json`) → Ni-64; cyclotron c11 (Ni-64 beam) and c13 (irradiates `cf249_target_wheel`, `hot_cell.json:235`; the wheel is consumed); recoil separator c10 (on `cm248_target`) → `element_124_recoil`, c11 → `element_126_recoil`; chemistry lab c11: E124 + E126 + `island_nuclide` → `superheavy_census_iv` (`tables/superheavy.json`, `uev/superheavy.js:64-74`).
- **`<name>`:** `census_iv`.
- **Allowed (extra):** the rows above in their files; pinned tests `uev-isotopes`, `uev-superheavy`, `uev-electron_beam`.
- **References:** lines 43-44; *Older machines, new modes*; uxv.md B5 (superheavies III).
- **Depends on:** A0, F3.
- **Invariants:** elements 124 and 126 are named fiction above oganesson (tooltip).
- **Pending:** deletes A0's `caged_ni_chain` entry. pendingUses: `superheavy_census_iv` → G1.
- **Acceptance:** the census is made from SGR nickel, home curium and californium only.
- **Tests:** T0; no T1 (proof reuse: UXV-B5's superheavy rows on the same machines).
- **Commits:** 1.
- **Serial:** pair: B1.

#### D1. Beam hardware

- **Objective:** lines 20-25 and `grindless:neg_xhv_casing` (assembler at OpV, 2 circuits); older rows: UXV MTJ x2 (NEG, Ir cladding); levitation melter c17-18; EB 24-26 and 30-31; crystal growth c23; SPS c11-13; hot cell c17; platinum plant c15-16; the hot strip mill Be foil row in D1's own file (`ev/combined_cycle_and_hot_mill.js:239` pattern); keyed rows on the fluorspar kiln (BeF₂), He refrigerator and tritium removal (`iv/tritium_removal.js:330`).
- **`<name>`:** `beam_hardware`.
- **Allowed (extra):** the rows above in their files; pinned tests `uxv-spin_deposition`, `uiv-levitation_melter`, `uev-electron_beam`, `uhv-crystals`, `uhv-propulsion`, `iv-features`, `ev-features`.
- **References:** lines 20-25; F3.
- **Depends on:** A2 (NbTiN), A3.
- **Pending:** deletes A2's NbTiN entry. pendingUses: `be_beam_window`, `ir_spallation_target`, `li6_hydride_shield`, `electron_cooler`, `stochastic_cooling_pickup` → B3; `neg_xhv_casing` → B3, D2.
- **Acceptance:** spent Ir targets reach the hot cell; spent NEG chambers go back to the levitation melter.
- **Tests:** T0; no T1 (rows on proven machines; F3 proved the EB repeat).
- **Commits:** 2.
- **Serial:** pair: E1.

#### E1. Magnetic pair converter

- **Objective:** machine 12 at SGR (*12*); line 29; older rows: positron accumulator c5 (`tables/antimatter.json`, site as its existing rows) → `seed_positron_plasma` in `empty_penning_trap`; EB c23 (inputs distinct from B2's, F3): `unsealed_positron_cell` + 1 `gtceu:zirconium_dust` → `dense_positron_cell`. `unsealed_positron_cell` is E1's own id.
- **`<name>`:** `pair_converter`.
- **Allowed (extra):** the two rows; pinned tests `uhv-antimatter`, `uev-electron_beam`.
- **References:** *12*; line 29; S0-6.
- **Depends on:** A3 (casing, hatches), W, UXV-B5 (`gamma_laser_module`).
- **Invariants:** no absorber tile at SGR; the electron and photon-splitting losses have no item and the tooltip says so.
- **Pending:** deletes A3's `field_frozen_casing` entry. pendingUses: `dense_positron_cell` → B3, D3.
- **Acceptance:** as the wave; traps return at 90%.
- **Tests:** T0. T1: `gg_test_opv_pair_converter`, band assigned by integrator. Doubt: machine 12 forms at SGR and runs c1 on an OpV wireless hatch from a case 13 network (W proved the network at home only).
- **Commits:** 2.
- **Serial:** pair: D1.

#### B3. Antimatter: foundry, engine and the Cygnus beam lines

- **Objective:** machines 3, 5 (home) and 6, 7, 8 (Cygnus) (*3*, *5*-*8*); lines 26-28 and 30-33; `grindless:annihilation_shield_casing` (assembler at OpV, 2 circuits); older rows: millikelvin cryostat c7; calutron c15; CVI c9; EB 32, 21 and 22 (distinct inputs); crystal growth c25-27; MBE c11; SPS c15; antimatter trap c5; actinide partitioning c8-9 (`zpm/actinides.js:244`); pyrolyser c5 (`zpm/outer_chemistry.js:36`); HTS c9-10; hot cell c18; fuel fabrication c12 (`iv/uranium_cycle.js:296`); keyed rows on the fluorspar kiln (MgF₂), cryogenic plant (DT, Kr) and He refrigerator.
- **Containment:** antiprotons ride the jet beam (6) to the target (7) and decelerator (8) and are stacked in `cold_antiproton_cell` (octupole magnet, NEG vacuum); antihydrogen is frozen into `antihydrogen_ice_cell` in levitation cells (3). Every cell returns its trap or cell (90-95%). The engine's π⁰ gammas wear `gamma_absorber_tile` (1/16 per run); activated tiles go to the hot cell c18; the TPV wall recovers heat; the neutrino half is lost (tooltip). Nothing is a free battery: the balances are *Power*'s (~1.7x c1, ~1.8x c2 *(tune)*).
- **`<name>`:** `antimatter`.
- **Allowed (extra):** the rows above in their files; pinned tests `uiv-memories_cryostat`, `uev-isotopes`, `uev-composites`, `uev-electron_beam`, `uhv-crystals`, `uhv-photonics`, `uhv-propulsion`, `uv-accelerators`, `zpm-actinides`, `zpm-outer_chemistry`, `iv-features`, `ev-features`.
- **References:** *3*, *5*-*8*; lines 26-28, 30-33; *Power*.
- **Depends on:** D1, E1.
- **Invariants:** the engine runs only at home (open question 12) with OpV dynamo hatches (1 A for c1, 4 A for c2); antiprotons only from Cygnus.
- **Pending:** deletes D1's and E1's entries naming B3. pendingUses: `gamma_absorber_tile` → D3.
- **Acceptance:** as the wave; C1's balance for both engine rows is in 1.3-2.5x.
- **Tests:** T0. T1: `gg_test_opv_annihilation`, band assigned by integrator. Doubt: engine c2 writes 2^30 EU/t into a 4 A OpV dynamo hatch as long for 1,200 t and wears the tile; machines 6-8 form at Cygnus.
- **Commits:** 4 (home machines; Cygnus machines; lines; older rows). Open question 9 may split it into B3a (home: 3, 5, lines 26-28, 31-33) and B3b (Cygnus: 6-8, line 30).
- **Serial:** pair: D2; B3 merges first (isotopes, accelerators, hot cell).

#### D2. Exotic matter

- **Objective:** machines 4 (home) and 9 (Cygnus) (*4*, *9*); line 36; older rows: calutron c12 (Pb-208); cyclotron c12 (`pb208_beam_cell`); synchrotron c9 (`fireball_distillate`); hot cell c19 (strangelet tailings → `gtceu:lead_dust`).
- **Containment:** positive strangelets grow in the vault (4) inside `neg_xhv_casing` and are held neutralised as `stable_exotic_matter`; the distiller's c3 throws negative strangelets into Cygnus X-1 (the pack's one voiding row, F2's exemption; tooltip). Stable strange matter is a real hypothesis (Witten 1984); its industrial yield is named fiction.
- **`<name>`:** `exotic_matter`.
- **Allowed (extra):** the rows above in their files; pinned tests `uev-isotopes`, `uev-superheavy`, `uv-accelerators`, `iv-features`.
- **References:** *4*, *9*; line 36; F2 (exemption).
- **Depends on:** D1, B2 (calutron and cyclotron order); merges after B3.
- **Pending:** deletes D1's `neg_xhv_casing` entry naming D2. pendingUses: `stable_exotic_matter` → D3, G1.
- **Acceptance:** as the wave; distiller c3 is the only row C1 finds voiding.
- **Tests:** T0. T1: `gg_test_opv_exotic_matter`, band assigned by integrator. Doubt: c3 voids its negative strangelets with the exemption and no other row voids; machine 9 forms at Cygnus.
- **Commits:** 2.
- **Serial:** pair: B3.

#### D3. Kugelblitz forge and Hawking collector

- **Objective:** machines 10 and 11 at Cygnus (*10*, *11*); line 37; no older rows. Forge c1-c4 → `hawking_drive`; collector c1 (2^30 from `stable_exotic_matter`, core wear 1/64) and c2 (2^29 from `stellar_plasma`, wear 1/32) on two 1 A or one 4 A OpV dynamo hatches; balances ~2.0x and ~1.5x *(tune)*.
- **Containment:** the hole is Schwarzschild (no spin), charged with positrons and held electrostatically in the absorber shell; Hawking evaporation is real (Hawking 1974, Page 1976), the forming and the feed rate are named fiction. A failed seed is thrown into Cygnus X-1; the spent core returns as a shell to forge c3.
- **`<name>`:** `kugelblitz`.
- **Allowed (extra):** none beyond *Common*.
- **References:** *10*, *11*; line 37; *Power*; *Reserve for MAX*.
- **Depends on:** B1, B3, D2, E1, UXV-B5.
- **Invariants:** no rotation, superradiance, amplification or Sgr A* id (C1 checks); `kugelblitz_core` only at Cygnus.
- **Pending:** deletes B1's, B3's, D2's (`stable_exotic_matter` → D3), E1's and A3's (`field_frozen_plate`) entries naming D3. pendingUses: `hawking_drive` → R1; `kugelblitz_core` → G1.
- **Acceptance:** as the wave; the tooltip states the hole does not spin.
- **Tests:** T0. T1: `gg_test_opv_kugelblitz`, band assigned by integrator. Doubt: both machines form at Cygnus, and collector c1 writes 2^30 EU/t as long while the core wears 1/64 per run.
- **Commits:** 2.
- **Serial:** alone.

### Wave R: Terzan 5

#### R1. Pathfinder

- **Objective:**
  - `grindless:pathfinder_probe`: assembly line at VA[OpV]: `tetron_array`, `xnav_unit`, `shequid_gyro`, `hawking_drive`, 2 `gtceu:opv_sensor`, 1 `gtceu:opv_emitter`, 2 `#gtceu:circuits/opv` *(tune)*;
  - gate c12: probe → `launched_pathfinder`, 2^30 EU/t for 2,400 t *(tune)* on two UXV 16 A hatches at Cygnus, no FRC (the Hawking drive is the jump, open question 14);
  - the hold places F1's Terzan 5 platform and grants `opv-terzan5` (S0-9); a crafting-table unpack turns `launched_pathfinder` into `pathfinder_probe_core` at arrival;
  - `grindless:vitamin_kit`: `gtceu:assembler` at VA[OpV]: `tetron_array` + `xnav_unit` + 2 `gtceu:opv_robot_arm` + 1 `hemt_amplifier` *(tune; open question 11)*;
  - lines 41-42; older rows: X-ray pulse profiler c3 (`uiv/j0437.js:75`, at J0437 only); nuclear clock c5; SiC fab c7; fibre c18; EB 24 (inputs distinct from D1's); hot cell c20; extraction c28-29.
- **`<name>`:** `pathfinder`.
- **Allowed (extra):** `tables/gate.json` (1 row); the rows above in their files; pinned tests `uhv-gate`, `uiv-j0437`, `uhv-crystals`, `uhv-power_devices`, `uv-photonics`, `uev-electron_beam`, `iv-features`, `ev-features`.
- **References:** *Bridges and first arrivals*; lines 41-42; `uxv/kerr_sling.js:26, :196`; S0-9.
- **Depends on:** D3, B1, A2, S0-9.
- **Pending:** deletes A2's (`gan_mmic`, `sdd_die`), B1's (`tetron_array` → R1) and D3's (`hawking_drive`) entries. pendingUses: `vitamin_kit`, `pathfinder_probe_core` → R2; `node_power_transmitter` → R3.
- **Acceptance:** the probe launches, the hold grants `opv-terzan5`; the profiler row runs only at J0437.
- **Tests:** T0. T1: `gg_test_opv_pathfinder`, band assigned by integrator. Doubt: the second-hop throw from Cygnus to Terzan 5 survives `@restart` with chunk loading and grants the substage (S0-9 proved a bare hold).
- **Commits:** 3 (probe and gate; lines; kit).
- **Serial:** alone (gate table after A0).

#### R2. Replication

- **Objective:** machines 14, 15 and 16 at Terzan 5 (*14*-*16*); lines 38-39; older row: methane pyrolyser c6 (`zpm/outer_chemistry.js:36`, spent graphite anodes).
- **Self-replication with feedstock:** foundry c1: 1 `probe_seed` (returned) + 16 `metal_feedstock` + 8 `cluster_sinter_casing` + 1 `vitamin_kit` → 2 `probe_seed`; c2: 1 `pathfinder_probe_core` + the same feedstock → 1 `probe_seed`. Every copy consumes debris refined on site and one home-made kit (Freitas 1980's vitamins); nothing is copied from nothing.
- **`<name>`:** `replication`.
- **Allowed (extra):** the pyrolyser row; pinned test `zpm-outer_chemistry`.
- **References:** *14*-*16*; lines 38-39; *Automatic resource generation*.
- **Depends on:** R1.
- **Pending:** deletes R1's entries naming R2. pendingUses: `probe_seed`, `silicate_debris_fraction`, `si_alloy_powder`, `cluster_sinter_casing` → R3.
- **Acceptance:** as the wave; the seed is returned, never consumed, in c1.
- **Tests:** T0. T1: `gg_test_opv_replication`, band assigned by integrator. Doubt: the three machines form at Terzan 5; c1 returns the seed and outputs two only with all feedstock present.
- **Commits:** 3 (one per machine).
- **Serial:** alone.

#### R3. Collector nodes and the bulge collector

- **Objective:** machines 17 and 18 at Terzan 5 (*17*, *18*); line 40; refinery c7 (spent nodes → `si_alloy_powder`, 50%). Collector c1-c3 at 2^26, 2^28, 2^30 for 1, 4, 16 packs on one 4 A OpV dynamo hatch; c3 outputs `bulge_light_census`; balance ~1.5x *(tune)*; three fixed rows (S0-11 did not show a row scaling with packs).
- **`<name>`:** `bulge_collector`.
- **Allowed (extra):** machine 15's row list (1 row, R2's file).
- **References:** *17*, *18*; line 40; *Power*; S0-11.
- **Depends on:** R2.
- **Pending:** deletes R1's and R2's entries naming R3. pendingUses: `bulge_light_census` → G1.
- **Acceptance:** as the wave; the packs are consumed (no panel that runs forever).
- **Tests:** T0. T1: `gg_test_opv_bulge_collector`, band assigned by integrator. Doubt: c3 writes 2^30 EU/t at Terzan 5 into wireless case 13 and the census appears.
- **Commits:** 2.
- **Serial:** pair: M2.

### Scale and close

#### M2. Assembly line array (mega)

- **Objective:** `gtceu:assembly_line_array`, the OpV member of the mega family (*Nothing one at a time*):
  - it runs GTM's `gtceu:assembly_line` recipes with their research; parallels are energy-bound times the parallel hatch (x262,144); it overclocks as the stellar forge (open question 6);
  - controller: assembly line at VA[OpV], research `tetron_array`; 8 `gtceu:opv_robot_arm`, 8 `gtceu:opv_conveyor_module`, 4 `gtceu:opv_sensor`, 4 `gtceu:opv_field_generator`, 8 circuits; domain inputs `opv_harmonic_drive`, `cryo_optical_link`, `nb_tsv_interposer`; 1,000 mB superfluid He-3;
  - **Structure (QR):** 9x7x35 *(tune)*, four assembly tracks side by side under one gantry roof.
    - Blocks: `gtceu:opv_machine_casing` (appearance, ≤50%); `gtceu:assembly_line_casing`; `gtceu:assembly_line_unit` track slices; `gtceu:assembly_line_grating` between tracks; `gtceu:laminated_glass` roof lights.
    - Kinds: casing, unit, grating, glass.
    - Hatches: item and fluid inputs along one side in order, energy, data and the parallel hatch at the head, output bus at the tail.
  - **S0-10 fallback:** the first commit is the frame plus its T1 with one ordered and one research recipe. If either does not start after one repair, the array does not enforce input order (fiction: the gantry sorts) and still requires research; if research cannot be honoured either, M2 stops and returns the choice (keep it single) to the integrator.
- **`<name>`:** `assembly_line_array`.
- **Allowed (extra):** its row in the mega table if mega.md 6.6 uses one; pinned mega tests (member count only).
- **References:** mega.md 4.1, 4.11, 4.12, 5, 6.6; DECISIONS.md:505; `lib/mega.js` (read unchanged); S0-10.
- **Depends on:** M1, A3, B1, S0-10.
- **Invariants:** no recipe of its own; counted as the mega member, not as a line; no loop (GTM's sounds).
- **Acceptance:** it forms with the x262,144 hatch and runs a GTM assembly-line recipe at the energy-bound parallels with research honoured; tooltip short (what it runs; parallel hatch, wireless, laser hatches if it takes them).
- **QR:** info page `assembly_line_array` (what it runs, the parallel rule, no recipe of its own).
- **Tests:** T0. T1: `gg_test_opv_assembly_line_array`, band assigned by integrator. Doubt: at x262,144 the ordered-input check and the research check hold and output amounts stay long (S0-10 proved a bare structure).
- **Commits:** 1.
- **Serial:** pair: R3.

#### G1. Gate to MAX

- **Objective:**
  - `tables/gate.json` c13 (*Gate to MAX*): 2^33 EU/t for 1,200 t *(tune)* on two OpV 16 A input hatches on the warp gate at Cygnus X-1 orbit, fed by wireless case 13; consumes 1 `kugelblitz_core`; keeps `bulge_light_census`, `stable_exotic_matter`, `tetron_array`, `superheavy_census_iv`, `bulge_chart` and 4 `gtnn:cosmic_mainframe` (`uhv/gate.js:90-97`); outputs `grindless:sgr_a_chart`;
  - `server_scripts/grindless/opv/gate.js`: `gtceu:max_machine_casing` researched with `sgr_a_chart`, its assembly-line recipe at VA[OpV] with OpV parts (`uhv/gate.js:206-219`), the `max` grant (`uhv/gate.js:294`) and the c13 site (`uhv/gate.js:30-34`);
  - fallback if S0-2 fails: 2^31 EU/t for 4,800 t, the same EU.
- **`<name>`:** `gate`.
- **Allowed (extra):** `tables/gate.json` (1 row); pinned test `uhv-gate` (and any gate test A0 or R1 edited).
- **References:** *Gate to MAX*; *Reserve for MAX*; *Power* (Kardashev III); S0-2.
- **Depends on:** every A, B, D, E and R package, M2, W.
- **Invariants:** no MAX product, hull or hatch; the casing is only researched; no Sgr A* place; c13 is the only recipe above 2^31; MAX and MAX+ untouched (DECISIONS.md:450).
- **Pending:** deletes every pendingUses naming G1.
- **Acceptance:** the gate holds 2^33 (or the fallback) for its time, consumes the core, keeps the six, returns the chart and grants `max`; the MAX casing recipe appears only after research.
- **Tests:** T0. T1: `gg_test_opv_gate`, band assigned by integrator. Doubt: the hold, from real sources (at least eight 2^30 generators at three places on one case 13 network, *Power*), through two OpV 16 A hatches stays long end to end and grants `max` (S0-2 proved a bare row).
- **Commits:** 2.
- **Serial:** alone, after every package.

#### C1. Validator

- **Objective:**
  - `-Tier opv` with the rules of *Validator*;
  - re-count 18 multiblocks, 45 lines (216 steps), 141 crossings on 49 older machines, by UIV's method;
  - the reachability of every F1 id at its substage; the *Bootstrap check* table;
  - the generator balances in 1.3-2.5x; the component thresholds (controllers ≥10 OpV components, hatches ≥1, basic machines ≥2); no OpV recipe with a UXV-or-lower component or circuit (the seed excepted); no recipe at or above 2^31 but c11 and c13; no MAX id consumed.
- **Allowed:** `tools/analysis/tiers/opv.json` (new), `tools/analysis/test/opv-validator.test.mjs`, and the validator's era list (one line).
- **Depends on:** every package. **Tests:** T0. **Commits:** 1.

#### C2. Quests

- **Objective:** *Quests*' 52 quests *(tune)* in `tools/quests/opv-chapter/` and `pl-data-opv.mjs`; the integrator generates the chapter.
- **Allowed:** those files and their test.
- **Depends on:** C1. **Tests:** T0 (quest lint). **Commits:** 1.

#### C3. Integration and release (integrator)

- **Objective:**
  - reopen a v0.15.0 save (*Save compatibility*);
  - T2 batch, then T3 (client legs one per run);
  - `hidden_until.json` final; STATUS, DECISIONS and CREDITS lines; index; v0.16.0.
- **Depends on:** C1, C2.

### Parallel and serial

Order: S0 ∥ F3 → F1 → F2 ∥ W → M1 → A0 → A1 ∥ A2 → A3 ∥ A4 → B1 ∥ B2 → D1 ∥ E1 → B3 ∥ D2 → D3 → R1 → R2 → R3 ∥ M2 → G1 → C1 → C2 → C3. At most two workers; the bench is serial (Linux VM first). A pair starts only when the pair before it has merged. Every package after F3 waits for HT.

| Shared file | Writers in order |
|---|---|
| `tables/gate.json` | A0 → R1 → G1 |
| `tables/electron_beam.json` | A1 → A3 → B2 → D1 → E1 → B3 → R1 |
| `tables/crystals.json` | A1 → A2 → A3 → B1 → D1 → B3 |
| `tables/composites.json` | A1 → A2 → B1 → B3 |
| `tables/isotopes.json`, `tables/superheavy.json` | B2 → B3 → D2 |
| `tables/hot_cell.json` | A1 → D1 → B3 → D2 → R1 |
| `tables/accelerators.json` | B1 → B3 → D2 |
| `tables/hts_magnet_works.json` | A1 → B3 |
| `uv/photonics.js` | A1 → A2 → A3 → R1 |
| `ev/extraction_cascade.js` | A1 → A2 → B1 → R1 |
| `uxv/spin_deposition.js` | A2 → B1 → D1 |
| `tables/vela_pasta.json` A0; `tables/antimatter.json` E1; `lib/parallel_hatch.js` M1; `uev/electron_beam.js` F3 | one writer each |
| hot strip mill rows | D1's own file |

Pairs that share a file (A1 ∥ A2, B3 ∥ D2) append rows to different circuits; the first named merges first and the second rebases. A3 ∥ A4 holds: A4 reads the field generator by id with a pendingRoutes entry and writes none of A3's files. D1 ∥ E1 share only the EB table, at circuits 24-26/30-31 and 23. R3 ∥ M2 share nothing. Each pair's T1 runs one at a time on the bench.

## Decisions proposed

- 2026-10-30 OpV route: home antimatter, tetron circuits and census IV; Cygnus X-1 orbit for antiprotons, strangelets and the Kugelblitz forge; a bulge relay seed (gate c11, 2^31, one FRC) to SGR 1806−20 orbit for chain matter and field freezing; a Hawking-drive pathfinder (gate c12) to the Terzan 5 core for self-replicating probes and the bulge collector; gate c13 at Cygnus returns `sgr_a_chart`. Substages `opv`, `opv-sgr`, `opv-terzan5`.
- 2026-10-30 OpV size: 18 multiblocks, 45 lines (216 steps, average 4.80), 141 crossings with UIV-and-older lines on 49 machines, 49 older machines with a new mode; rule 7's ~28 / ~74 / ~267 are missed with no padding; every missing item is named under *Considered and dropped*.
- 2026-10-30 OpV components (owner): the nine-component family, hull, hatches and basic machines are GTM's `gtceu:opv_*` ids from the HT retrofit; every OpV machine, hatch, basic machine and controller recipe takes the OpV hull, OpV components in GT-like counts, `#gtceu:circuits/opv` and runs above V[UXV]. Fallback if HT's S0 fails: `.tiers(UEV, UIV, UXV, OpV)` at `uev/foundation.js:181, :194` and `grindless:opv_*` components on the `uiv/uiv_components.js` pattern.
- 2026-10-30 OpV tooltips (owner): one line of what the machine does, then one line per thing it accepts; detail on the EMI page.
- 2026-10-30 OpV circuit: `gtnn:cosmic_mainframe`, made only by our UEV photonic hall join; GT--'s recipe and cosmic SMDs cut.
- 2026-10-30 OpV places: `grindless:sgr1806_orbit` and `grindless:terzan5_core`, GCYR tier 13 datapack places (fallback 12), no rocket; arrival platforms are rows of `relay_platforms.json` from Cygnus.
- 2026-10-30 OpV 2^31 and 2^33: c11 at 2^31 (UXV-proved path); c13 at 2^33 on two OpV 16 A hatches (S0-2), fallback 2^31 x 4,800 t; no generator above 2^30 per machine; wireless case 13 caps as long.
- 2026-10-30 OpV self-replication: every probe copy consumes 16 `metal_feedstock`, 8 `cluster_sinter_casing` and a home-made `vitamin_kit`; the seed is returned; node packs are consumed by the collector.
- 2026-10-30 OpV antimatter and exotic matter: every cell returns its trap; annihilation gammas wear absorber tiles that go to the hot cell; neutrino losses stated; negative strangelets are the one voiding row (distiller c3).
- 2026-10-30 OpV power: no Mk7 fusion ring; the annihilation engine (home), Hawking collector (Cygnus) and bulge collector (Terzan 5) each burn a stated fuel at 1.3-2.5x; Kardashev III is the 2^33 hold fed from three places plus `bulge_light_census`.
- 2026-10-30 OpV wireless case 13: caps V[OpV] x amps x 10 as long; link `chain_strand_repeater`; cell `opv_smes_cell` 16,106,127,360,000 EU.
- 2026-10-30 OpV scale: `gtceu:opv_parallel_hatch` x262,144 (lib, serial; fallback x131,072); the mega member is the assembly line array.
- 2026-10-30 OpV EB circuits (F3): an electron beam circuit may repeat when the item inputs differ; subset clashes still fail.
- 2026-10-30 OpV MAX hooks: `sgr_a_chart`, `gtceu:max_machine_casing` research, the kept census and exotic matter (*Reserve for MAX*); no Sgr A* place, mirror shell or superradiance in OpV.
- 2026-10-30 OpV named fiction: the Kugelblitz forming and feed rate, industrial strangelet yield, field freezing, chain matter, self-replication at this scale, the bulge debris field, the Hawking drive, elements 124 and 126.
- QR-OpV: every controller is an assembly line with station research on an item of its own line or the previous machine, the OpV component counts, superfluid He-3 and three domain inputs; the hull, hatches, parallel hatch and components follow the component table; the three casings are assembler rows; each of the 18 structures plus M2 passes the rubric with appearance and overlay; each multiblock package ships its info pages; each of the 18 new types gets a `loop_<machine>`.
- QR-OpV gate tiers (F2, integrator): `eraTier` `opv: 13`; `complexFloor` `"13": 10` *(tune)*; `opv` 13 in `TIER_NAMES`/`TIER_PREFIX`; `opv` in process_audit `ERAS`/`TIER_ERA`.

**CREDITS lines proposed:** GT-- (AGPL) supplies `gtnn:cosmic_mainframe` in game; we use its item and none of its code. Monifactory (LGPL-3.0) is an idea only at OpV: the components are GTM's own ids under HT (its `Post_UV_Components.js` pattern stays credited for the fallback). Star Technology (MIT) is cited for ideas only, no code. GTNH and GT Leisure: ideas only (mega assembly line, power figures). Physics sources are cited in each machine section.

## Open questions

1. **18 / 45 / 141 against ~28 / ~74 / ~267?** **Default: accept, no padding**; a second design pass only if the owner asks.
2. **If S0-2 fails, c13 at 2^31 for 4,800 t?** **Default: yes**, the same EU.
3. **If HT's S0 fails, the fallback builders and `grindless:opv_*` components?** **Default: yes**, one line in F1, nothing else changes.
4. **Generator balance band 1.3-2.5x?** **Default: yes**, C1 enforces it.
5. **Tier 13 places?** **Default: yes; fallback tier 12** (S0-3).
6. **M2's overclock?** **Default: as the stellar forge** (mega.md 5).
7. **x262,144 or x131,072?** **Default: x262,144** if S0-5 passes.
8. **F3's change to the EB loader** (a circuit may repeat with distinct inputs)? **Default: yes**; otherwise EB rows move to another older machine per package.
9. **Split B3 into home and Cygnus packages?** **Default: no**, one package with four commits; split only if the first T1 fails twice.
10. **52 quests?** **Default: yes** *(tune)*.
11. **The vitamin kit's contents?** **Default: `tetron_array` + `xnav_unit` + 2 robot arms + `hemt_amplifier`.**
12. **The annihilation engine only at home?** **Default: yes**; antiprotons travel as stacks.
13. **`annihilation_shield_casing` owned by B3?** **Default: yes** (D3 reads it after B3).
14. **Gate c12 without an FRC cartridge?** **Default: yes**; the Hawking drive is the consumable.
