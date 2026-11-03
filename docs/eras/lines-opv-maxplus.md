# Long process lines, multiblock scale and casing families, OpV to MAX+ (D5-LINES)

Design package D5-LINES (#291), 2026-11-03, for AGENTS.md principles 4 and 7 as the owner set them on 2026-11-02 and 2026-11-03: depth first in every tier, and multiblocks that grow with their tier and use, built from the era's own expensive casings. The owner delegated every decision on 2026-11-03; each material choice below is a **Decision** with the options weighed (section 9). Format: `docs/eras/lines-steam-hv.md` (D1). Every recipe, structure, size and price named here as existing was read from the batch dump `5d57213f3b83` (line audit, `structure-quality.mjs`, `cost-matrix.mjs --trace`); "new" marks what this design adds. Nothing under `pack/` or `tools/` changes in this package; the implementation packages are in section 11 and their contracts in the handoff.

## 0. How the steps are counted

- **As D1, section 0.** A step is one machine recipe that makes a new species or a new part in a manufacturing line; packaging, form changes (dust, ingot, plate), melting, cooling and recycling are not steps. The base resource (a drill, rig, tap, jet or harvester output) is not a step. The end product of another line is a raw input (a crossing).
- **A line is a programme.** Chains whose products have a single consumer inside the same programme are intermediates of one line, not separate lines (D1's H3 Kapton branch). A line's length is its longest path; its other chains are branches and count in its total steps only.
- **Staged lines (D1's platline rule).** A later era's stage counts from the line's own start when it consumes an intermediate or byproduct the earlier stage makes for it (the platinum slag "stored for H1"). It never counts through another line's end product. Three stagings are used here: UXV's oxygen-burning `si28_ash`, kept "stock for OpV" (uxv.md:759), starts the Si-28 qubit line; MAX consumes OpV's `tested_tetron_die`, `kugelblitz_seed` and `chain_strand_single_wire`; MAX+ consumes MAX's new `shielded_quantum_module`, its `horizon_strand_single_wire` and `seed_wave_packet`, and OpV's `fed_strangelet`.
- **Critical path:** the line's length counted only from its first step in its own era.
- **The guide** (owner, 2026-11-02): OpV about 32, MAX about 34, MAX+ about 36, never padded. Section 1 states where each era lands and why (Decision L-1).
- The line audit (`tools/analysis/line-audit.mjs`) counts chart clusters and follows `extends` across charts since D1-AUDIT; the chart packages (section 11) draw these lines so that it measures the lengths given here.

## 1. Summary

| Era | Line | Steps | Critical path | Status |
|---|---|---|---|---|
| OpV | O1 Si-28 qubit line: oxygen ash to the tetron array | 26 (3 staged from UXV) | 23 | merge of L11, L13, L19 with L12, L14, L15, L16 as branches; 6 real fab steps added |
| OpV | O2 Antiprotons to antihydrogen | 7 | 7 | merge of L30, the foundry and the engine with L20-L28, L31-L33 as branches; AD and ELENA split into two rows |
| OpV | O3 Positrons to the Kugelblitz | 8 | 8 | merge of L29, L37, L34, L35 and the forge rows; staged into M3 and X4 |
| OpV | O4 Stable exotic matter | 8 | 8 | L36 as built; staged into X2 |
| OpV | O5 SGR chain matter and field freezing | 7 | 7 | merge of L1, L2, L3; staged into M2 and X3 |
| OpV | O6 Terzan 5 replication and the bulge | 10 | 10 | merge of L38-L42 with L17 and L18 (their only consumers are here) |
| OpV | O7 OpV components | 7 | 7 | merge of L4-L10 |
| OpV | O8 Superheavy census IV | 6 | 6 | merge of L43, L44 |
| OpV | O9 AlN power die | 6 | 6 | L45 as built |
| MAX | M1 Si-28 qubit line, MAX stage: the supracausal mainframe | 30 | 5 | new stage on O1 (4 new steps); L5, L6, L7 as branches |
| MAX | M2 Horizon strand and the tether | 11 | 8 | merge of L1, L20 on O5's wire |
| MAX | M3 The horizon lock | 8 | 8 | merge of L14, L18, L47-L51, L54-L57 on O3's seed |
| MAX | M4 The belt and the mirror segment | 7 | 7 | merge of L13, L15, L25, L30, L36, L37, L38, L42, L52, L53 |
| MAX | M5 MAX components | 8 | 8 | merge of L4, L9, L10, L11, L31, L32, L35, L41 |
| MAX | M6 Gene ark; M7 imager; M8 neutral-atom logic | 6; 7; 6 | same | merges of L12+L28; L21+L22+L44+L45; L19+L40+L46 |
| MAX | kept: L2 (+L34), L3, L8, L16, L17, L23, L24, L26, L27, L29, L33, L39, L43 | 4 to 6 | same | as built |
| MAX+ | X1 Si-28 qubit line, MAX+ stage: the horizon processor | 34 | 5 | new stage on M1 (4 new steps); Q1, Q2 as branches |
| MAX+ | X2 The gate line: the Hyperstargate tree | 15 | 9 | merge of P3, P12, P19, P24, T1-T17, K1-K4 and the grid crafts |
| MAX+ | X3 Kerr strand and its windings | 13 | 7 | merge of P4, P13, P18, C1, C6 on M2's wire |
| MAX+ | X4 Horizon-bound matter | 11 | 4 | merge of P1, P2, P5 on M3's wave packet |
| MAX+ | X5 30 Doradus: very massive stars to iron-56 | 9 | 9 | merge of P6, P7, P8, P17, P20, P21; new Fe-56 return |
| MAX+ | X6 Primordial fuels | 7 | 7 | merge of P9, P10, P11, P22, P23, P25, P26 |
| MAX+ | X7 Intergalactic relay | 5 | 5 | merge of P15, P16 and the slingshot rows |
| MAX+ | X8 MAX+ components | 7 | 7 | merge of C2-C5, C7 |
| MAX+ | kept: A1, A2, A3 | 4, 4, 5 | same | as built |

Against the audit (era: lines, longest): OpV 45, 7 becomes 9, 26; MAX 57, 8 becomes 21, 30; MAX+ 59, 6 becomes 11, 34. Each era's longest is about 2 to 6 below the guide (32, 34, 36): the band's trunks start at OpV, and the only honest staging below OpV is UXV's ash (Decision L-1). If band D4 makes UXV lines 27 and 29 one line, O1, M1 and X1 grow by line 27's length (section 12).

## 2. OpV

Voltages: "2^28" is 268,435,456 EU/t, the rate of OpV rows on older machines (two UXV 4 A hatches); "VA[OpV]" is 503,316,480. "As built" keeps the row's dump values.

### O1 Si-28 qubit line: oxygen ash to the tetron array (26; critical path 23)

The real route to a cryogenic quantum processor: isotopically pure silicon-28 (no nuclear spin, so no magnetic noise for the qubits) purified as trichlorosilane, grown by float zone, made into fully depleted SOI by Smart Cut, processed into cryo-CMOS (a back-gated FD-SOI front end, a high-k metal gate, contacts and a superconducting back end), diced, cold-tested and joined to InAs-Al nanowire wafers as tetron qubits. Today it is three charted chains of 4 to 6 (`opv.wafers` L11, L13, L19) and four branches; the process jumps from the implanted wafer to metal and from the split wafer to the gate. Merged, with the six real stages it skips:

| # | Machine | In → out | EU/t | Process |
|---|---|---|---|---|
| U1 | EV cryogenic plant (UXV row) | O-16 (UXV line 27) → `oxygen_burning_fuel` | as built | liquefaction |
| U2 | UXV fusion reactor Mk6 c4 | fuel → ash plasma + EU | as built | oxygen burning |
| U3 | ZPM plasma quench caster | ash plasma → `si28_ash` (+ S-32, P-31) | as built | quench and separation (UXV stage, stored for OpV) |
| 1 | EV extraction cascade (OpV row, output changed) | `si28_ash` + HCl → 1,000 mB crude Si-28 trichlorosilane (new `gtceu:crude_si28_trichlorosilane`) + H2 | 2^28 | hydrochlorination (the direct process) |
| 2 | GTM distillation tower (new) | 1,000 mB crude → 900 mB `gtceu:si28_trichlorosilane` + 90 mB Si-28 tetrachloride (new `gtceu:si28_tetrachloride`) + 10 mB chlorosilane purge (new `gtceu:chlorosilane_purge`) | 2^28 | fractional distillation: the ash's phosphorus would dope the silicon n-type |
| 3 | UV MOCVD reactor | 6N TCS + H2 → `si28_poly_rod` + HCl | as built | Siemens deposition on hot rods |
| 4 | UV zone refining tower | rod → `si28_fz_ingot` | as built | float zone |
| 5 | UIV BEUV scanner (`si28_fz_wafers`) | ingot → 8 `si28_fz_wafer` | as built | wafering |
| 6 | ZPM ion implanter | wafer → `h_si28_wafer` | as built | H+ implant for Smart Cut |
| 7 | UIV TFLN fab c2 | + oxidised wafer → `si28_soi_wafer` + `si28_donor_wafer` | as built | bond and split |
| 8 | GTM electric blast furnace, 1,373 K (new) | SOI wafer + 1,000 mB nitrogen → `annealed_soi_wafer` (new) | 2^28 | bond-strengthening anneal |
| 9 | ZPM ion implanter (new) | + boron (the implanter's p-type row input) → `back_gated_soi_wafer` (new) | 2^28 | ground-plane implant for FD-SOI back-gate biasing, which keeps cryo-CMOS thresholds tunable at 4 K |
| 10 | UV MOCVD (input changed) | → `gate_stack_soi_wafer` | as built | HfO2/TiN high-k metal gate by ALD |
| 11 | UIV BEUV | → `cryo_cmos_litho_wafer` | as built | gate patterning |
| 12 | ZPM ion implanter | → `cryo_cmos_implanted_wafer` | as built | source and drain implant |
| 13 | UEV electron beam furnace (new) | → `activated_cmos_wafer` (new) | 2^28 | millisecond flash anneal (dopant activation without diffusion) |
| 14 | UV MOCVD (new) | + 250 mB `gtceu:tungsten_hexafluoride` + H2 → `contacted_cmos_wafer` (new) + HF | 2^28 | CVD tungsten contact plugs (middle of line) |
| 15 | UXV MTJ sputter cluster (input changed) | → `cryo_cmos_metal_wafer` | as built | interconnect metal |
| 16 | UIV BEUV (new) | → `interconnected_cmos_wafer` (new) | 2^28 | via and top-metal patterning (back end) |
| 17 | GTM cutter (input changed) | → `untested_cryo_cmos_die` | as built | dicing |
| 18 | LuV helium refrigerator | → `cryo_cmos_die` | as built | 4 K test |
| 19 | Tetron fab c1 | + `gated_2deg_wafer` → 4 `tetron_die` | as built | tetron die: InAs-Al nanowires over the cryo-CMOS |
| 20 | UXV MTJ sputter cluster | → `bumped_tetron_die` | as built | indium bumps |
| 21 | UIV TFLN fab | + `nb_tsv_interposer` → `bonded_tetron_die` | as built | flip-chip bond |
| 22 | UIV millikelvin cryostat works | → `tested_tetron_die` | as built | interferometric parity test (Aghaee 2025) |
| 23 | Tetron fab c2 | → `tetron_array` | as built | array assembly |

- **Branches (as built, now O1):** `gated_2deg_wafer` (L12: InP, InAs quantum well, epitaxial Al, hBN, gate; 5), `nb_tsv_interposer` (L14; 5), `cryo_optical_link` (L15; 4), `hemt_amplifier` (L16; 5). The cosmic mainframe joins at step 18 (UEV photonic integration hall c8: `cryo_cmos_die` + interposer + link + HEMT + 2 `#gtceu:circuits/uxv`, as built), 19 on its path.
- **Stages after OpV:** MAX's M1 continues from step 22's `tested_tetron_die`, MAX+'s X1 from M1's module.
- **New recipes:** steps 2, 8, 9, 13, 14, 16; the Si-28 tetrachloride loop (GTM chemical reactor, 2^28: 1,000 mB Si-28 tetrachloride + 1,000 mB H2 → 1,000 mB crude Si-28 TCS + 1,000 mB HCl, real tetrachloride hydrogenation, back to step 2); purge hydrolysis (GTM chemical reactor: 1,000 mB purge + 3,000 mB water → 300 mB `gtceu:phosphoric_acid` + 300 mB `gtceu:sulfuric_acid` + 2,000 mB HCl + 1 `gtceu:silicon_dioxide_dust`). Input changes: steps 10, 15, 17 take the new wafer of the step before them.
- **Byproducts:** H2 (1) → step 3; HCl (3, loop, hydrolysis) → step 1; Si-28 tetrachloride → the loop; phosphoric and sulfuric acid → GTM stock; SiO2 → glass; HF (14) → the fluorine chain (GTM electrolysis of HF, IV fluorspar kiln); the donor wafer and failed dies as built.
- **New materials:** `gtceu:crude_si28_trichlorosilane`, `gtceu:si28_tetrachloride`, `gtceu:chlorosilane_purge` (fluids, KubeJS materials like `gtceu:si28_trichlorosilane`); `annealed_soi_wafer`, `back_gated_soi_wafer`, `activated_cmos_wafer`, `contacted_cmos_wafer`, `interconnected_cmos_wafer` (`grindless:` items). The dump has `gtceu:trichlorosilane`, `crude_trichlorosilane` (D1), `si28_trichlorosilane`, `tungsten_hexafluoride`, `phosphoric_acid` and `sulfuric_acid`, and no silicon tetrachloride, phosphorus trichloride or sulfur chloride, so the purge stays one fluid.

### O2 Antiprotons to antihydrogen (7)

CERN's chain with the Cygnus X-1 jet as the accelerator: target and horn, the Antiproton Decelerator (stochastic, then electron cooling), ELENA to 100 keV and capture, then mixing with positrons, Lyman-α cooling and the levitation cell. The spallation target station merges into the decelerator, which becomes the antiproton complex (section 6); its second row splits in two, as AD and ELENA are two rings.

| # | Machine | In → out | EU/t | Process |
|---|---|---|---|---|
| — | Jet beam line c1 (Cygnus) | → `jet_proton_beam` | as built | base resource |
| 1 | Antiproton complex c1 (the station's row) | 4,000 mB beam + Ir target (wear 1/16) + LiH shield (wear 1/32) → 1,000 mB `hot_antiproton_beam` | as built | spallation on iridium, horn collection |
| 2 | Antiproton complex c2 | + pickup (wear 1/64) → `stochastically_cooled_beam` | as built | stochastic cooling at 3.5 GeV/c |
| 3 | Antiproton complex c3 (new split) | + electron cooler (wear 1/64) → 1,000 mB `decelerated_antiproton_beam` (new fluid) | VA[OpV], 800 t | deceleration with electron cooling to 5.3 MeV |
| 4 | Antiproton complex c4 (the rest of the old c2) | + `empty_penning_trap` → `cold_antiproton_cell` | 2^28, 400 t | ELENA to 100 keV, degrader and catching trap (Maury 2014) |
| 5 | Antihydrogen foundry c1 | + `dense_positron_cell` (O3) + octupole (wear) → `trapped_antihydrogen` | as built | mixing in a magnetic-minimum trap |
| 6 | Foundry c2 | + Lyman-α laser (wear) → `cooled_antihydrogen` | as built | laser cooling (Baker 2021) |
| 7 | Foundry c3 | + `levitation_trap_cell` → `antihydrogen_ice_cell` | as built | frozen into a levitation cell (named fiction) |

- Then the annihilation engine c1 (EU). The stack branch: UV antimatter trap → `antiproton_stack_opv` → engine c2 with the ACMF pellet.
- **Branches (as built):** beam window (L20), Ir target (L21), LiH shield (L22), electron cooler (L23), pickup (L24), NEG chamber (L25, the vacuum ELENA's rings are coated with; now also the NEG casing's input, section 7), Lyman-α laser (L26), octupole magnet (L27), levitation cell (L28), ACMF pellet (L31), absorber tile (L32), TPV panel (L33).
- **Byproducts:** as built (spent targets to the hot cell and the platinum plant, spent shields to the tritium facility, traps return, activated tiles to the hot cell, neutrinos lost and stated).

### O3 Positrons to the Kugelblitz (8)

| # | Machine | In → out | EU/t | Process |
|---|---|---|---|---|
| 1 | UHV positron accumulator (OpV row) | `positron_cartridge` + `empty_penning_trap` → `seed_positron_plasma` | as built | rotating-wall compression |
| 2 | Magnetic pair converter c1 (SGR) | + gamma laser (wear) → `hot_pair_plasma` | as built | one-photon pair production above B_q |
| 3 | Pair converter c2 | + trap → `unsealed_positron_cell` | as built | capture |
| 4 | UEV electron beam furnace | + zirconium getter → `dense_positron_cell` | as built | getter seal |
| 5 | Kugelblitz forge c1 | 2 cells + gamma laser (wear) → `gamma_pump_charge` | as built | positronium annihilation pump |
| 6 | Forge c2 | 4 charges + `frc_cartridge`, Laue lens and gamma mirror (wear) → `kugelblitz_seed` | as built | focusing (named fiction) |
| 7 | Forge c3 | + 4 positron cartridges + 8 absorber tiles → `kugelblitz_core` | as built | charge and hold |
| 8 | Forge c4 | + gamma mirror + field-frozen plate → `hawking_drive` | as built | drive |

Branches: Laue lens (L35) and gamma mirror (L34), which also feeds the Kugelblitz cavity casing. MAX's M3 and MAX+'s X4 continue from the seed (step 6).

### O4 to O9

- **O4 Stable exotic matter (8, L36 as built):** UEV calutron → Pb-208; ion source charge; UEV heavy-ion cyclotron → `pb208_beam_cell`; distiller c1 → `fireball_distillate`; c2 → `strangelet_seed`; vault c1 (+ UIV `neutronium_pellet`) → `fed_strangelet`; c2 → `grown_strangelet`; c3 (+ field-frozen plate) → `stable_exotic_matter`. X2 continues from `fed_strangelet` (step 6).
- **O5 SGR chain matter and field freezing (7):** cable branch: SGR crust slab (pasta extractor c3, base) → `caged_chain_phase` → `chain_strand_ingot` → `chain_strand_single_wire` → PBO-braided wire → `chain_strand_single_cable` (5); lamina branch: lattice slab (base) → caged lattice → `chain_lamina` → `chain_lamina_stack` → `field_canned_stack` (EB W-Re can) → `field_frozen_billet` → `field_frozen_plate` (7). The chain lamina casing and the field-frozen casing hang off steps 3 and 7 (section 7). M2 continues from the wire.
- **O6 Terzan 5 replication and the bulge (10):** UEV CVI → `hpsi_sic_wafer`; UV MOCVD → `gan_sic_epi_wafer`; UIV BEUV → `gan_gated_wafer`; UHV SiC device fab → `gan_mmic`; SiC fab → `gan_mmic_tile`; IV hot cell (PuBe) → rad-hard tile; UEV EB furnace → `node_power_transmitter`; node works c3 (+ 2 PV films + sinter casing) → `collector_node`; c4 (+ probe seed) → `deployed_node_pack`; bulge collector c3 (16 packs) → EU + `bulge_light_census`. Branches: metal (debris → fractions → carbonyl → Fe-Ni → `metal_feedstock` → `probe_seed`), silicate (FFC pellet → Si alloy → ribbon → PV film), sinter casing, XNAV unit (L41 with the drift detector L18), vitamin kit. GaN MMIC (L17) and the drift detector (L18) have no consumer outside this line.
- **O7 OpV components (7):** the longest path is REBCO (LuV, crossing) → pancake → potted (CVI) → trained (HTS) → `chain_field_coil` → `opv_electric_motor` → `opv_electric_piston` → `opv_robot_arm`. Branches L4-L7, L9, L10 (rotor, seal, belt, harmonic drive, lasing crystal, Compton crystal) end in their component.
- **O8 Superheavy census IV (6):** `ni_chain_slab` (SGR c4, base) → caged → thawed (EB) → Ni-64 (calutron) → Ni-64 beam (cyclotron) → `element_124_recoil` (recoil separator) → `superheavy_census_iv` (chem lab, with the Cf-249 branch L44).
- **O9 AlN power die (6, L45 as built).**

## 3. MAX

"VH[MAX]" is 1,073,741,824 EU/t and "VA[MAX]" 2,013,265,920; MAX rows on older machines run at most at VA[MAX] (max.md, *Voltages*).

### M1 Si-28 qubit line, MAX stage: the supracausal mainframe (30; critical path 5)

The MAX circuit networks OpV's topological qubits optically: tested tetron dies are bonded to the cryogenic microwave-to-optical transducer (L7's interposer; Mirhosseini 2020), read out by squeezed light (L5), calibrated cold and wrapped in a superconducting membrane shield, then integrated. Today the mainframe takes a whole `tetron_array` beside the parts; the dies are the honest unit, and a MAX player who runs this stage runs O1 (staged).

| # | Machine | In → out | EU/t | Process |
|---|---|---|---|---|
| 1-22 | O1 (with U1-U3) | → `tested_tetron_die` | | as O1 |
| 26 | UIV TFLN fab (new) | 4 `tested_tetron_die` + 1 `cryo_photonic_interposer` → `transducer_bonded_stack` (new) | VH[MAX] | hybrid bonding onto the transducer |
| 27 | UHV photonic foundry (new) | + 2 `squeezed_light_chip` → `photonic_tetron_module` (new) | VH[MAX] | squeezed-light readout attach |
| 28 | UIV millikelvin cryostat works (new) | → `calibrated_photonic_module` (new) | VH[MAX] | transduction calibration at 10 mK |
| 29 | Membrane line c4 (new) | + 1 `superconducting_membrane` → `shielded_quantum_module` (new) | VA[MAX] | superconducting magnetic shield wrap |
| 30 | UEV photonic integration hall c9 (inputs changed) | module + 2 `tweezer_array_die` + 4 `#gtceu:circuits/opv` + 2,000 mB superfluid He-3 → `gtnn:supracausal_mainframe` | as built | system integration |

- Steps 26 to 30 are numbered from the staged start (U1); the critical path inside MAX is 5.
- **Input changes:** c9 loses its 2 squeezed-light chips, 1 interposer and the tetron array (moved into steps 26-27; the array becomes its four dies); everything else stays.
- **Branches (as built):** squeezed-light chip (L5), tweezer array die (L6), cryo photonic interposer (L7). The membrane (L2) has many consumers and stays its own line.
- **Byproducts:** failed bonds (10%, *tune*) → `failed_tetron_die` → EV extraction cascade (In, Nb back), as O1's failed dies.

### M2 Horizon strand and the tether (11; critical path 8)

| # | Machine | In → out | EU/t | Process |
|---|---|---|---|---|
| 1-3 | O5 cable branch | SGR crust → `chain_strand_single_wire` | | as O5 |
| 4 | GTM assembler (+ `exotic_cladding_foil` from the OpV vault row) | → `clad_chain_strand` | as built | cladding |
| 5 | Pasta draw bench c5 (SGR) | → `horizon_strand_preform` | as built | drawing in the field |
| 6 | Draw bench c6 | → `gtceu:horizon_strand_single_wire` | as built | wire drawing |
| 7 | UHV tether ribbon works | → `strand_ribbon` | as built | ribbon braiding |
| 8 | UXV stellar elevator (Cygnus) | → `proof_loaded_ribbon` | as built | proof load |
| 9 | GTM chemical bath (+ `stable_exotic_matter`) | → `exotic_coated_ribbon` | as built | coating |
| 10 | GTM autoclave | → `cured_exotic_ribbon` | as built | cure |
| 11 | GTM assembler | → `horizon_tether` | as built | assembly (the winch wears it) |

Cable branch: wire → PBO plant → `pbo_braid_sleeve` → `horizon_strand_single_cable` (8). MAX+'s X3 continues from the wire (step 6).

### M3 The horizon lock (8; critical path 8)

Everything the mirror shell's c3 consumes is made only for it, so the lock is one line. Its longest paths: O3 to the Kugelblitz seed (6) → Kugelblitz forge c6 with L18's `cooled_cavity_mode` → `seed_wave_packet` (7) → shell c3 → `horizon_lock` (8); and inside MAX, L50: extraction cascade → V2O5 → crystal growth → `sapphire_web_wafer` → oxide PLD → `vo2_on_sapphire` → BEUV → patterned metasurface → MTJ → metallised → GTM assembler → `tunable_impedance_sheet` (6) → ergoregion synchroniser → `horizon_phase_lock` (7) → shell c3 → `horizon_lock` (8).

Branches (as built): stream pellets (L14) and the injector's stream bundle; the seed wave packet's cavity (L18); the synchroniser's SRF driver (L51) and oscillator bank (L55); the flux clamp's HTS flux pump (L54); the horizon interferometer's sensor, bench, thruster, laser and phasemeter (L47, L48, L49, L56, L57); the final spin map (shell c2). Byproducts as built (spent phase locks → synchroniser c2, the Rydberg array returned as spent).

### M4 The belt and the mirror segment (7)

The shell segment is an assembly of line products made at the belt and at home: segment truss (L13: NSC planetesimal → `metal_rich_bloom` → carbonyl Fe-Ni powder → segment alloy ingot → truss billet → `segment_truss`, 5), tetrataenite coupler (L37, 5), shell cryocooler (L30, 5), segment controller (L38, 5), tunable impedance sheet (L50, 6, shared with M3), droplet radiator (L15, 4). The UHV swarm segment foundry's MAX mode → `mirror_shell_segment` (7). Belt branches: slag pellet (L25, feeder fuel), hearth liner (L36, furnace), Wolter mirror (L42, from the belt's PGM residue). Byproduct branches: REBCO reclamation (L52) and erbium return (L53) send worn segments back to L32 and L30 (not counted in the length).

### M5 to M8 and the kept lines

- **M5 MAX components (8):** the longest path is TEOS sol-gel → alcogel → silylated → aerogel superleak → potted → calibrated (SHeQUID) → cold-tested → `superfluid_valve` (L41, 7) → `max_fluid_regulator` (8). Branches: gradiometer (L4), field coil (L9), composite rod and rotor (L10), membrane belt (L11), optical isolator (L31), SC bearing (L32), terfenol stack (L35), each ending in its component.
- **M6 Gene ark (6):** L12's oligo pool, organoid extract, ark and xeno genome sets and encapsulated library with L28's minimal boot cells → gene ark c1 → `genome_archive`.
- **M7 Photon ring imager parts (7):** dish panel (L21), SIS mixer (L22), photonic LO (L44), cryo LNA (L45) → the imager's maps.
- **M8 Neutral-atom logic (6):** the Rb-87 cartridge (L19), the UV fibre harness (L40) and the crossed AODs (L46: TeO2 boule → blank → transducer-bonded → electroded → `crossed_aod_pair`, 5) → Rydberg works c1 → `rydberg_logic_array` (6).
- **Kept as built:** L2 superconducting membrane with L34's Cu(111) foil (6), L3 albedo panel (5), L8 diamond power die (5), L16 flux-loaded FRC (4), L17 Geroch canister (5), L23 quantum memory node (5; Rydberg works, phase locks and the horizon processor), L24 Penrose payload (5), L26 XUV collector panel (5), L27 SMES toroid (5), L29 microcomb (5; Rydberg works and imager), L33 reference cavity (5), L39 fault-current limiter (5), L43 cold glass cell (5).

## 4. MAX+

MAX+ runs at MAX voltage with amperage (maxplus.md, *Voltages*): "VA[MAX]" rows, or "V[MAX] x A".

### X1 Si-28 qubit line, MAX+ stage: the horizon processor (34; critical path 5)

The horizon processor stacks MAX's shielded quantum module with the Si-28 spin logic dies (Q1) and the horizon interposer (Q2), jackets it in Kerr condensate and cold-tests it. Today the processor recipe joins those parts with two MAX circuits in one row; the module makes the stage real and keeps the same parts.

| # | Machine | In → out | EU/t | Process |
|---|---|---|---|---|
| 1-29 | O1 and M1 | → `shielded_quantum_module` | | as O1, M1 |
| 30 | UXV MTJ sputter cluster (new) | module + 2 `horizon_logic_die` → `stacked_horizon_module` (new) | VA[MAX] | 3D stacking with spin interconnect |
| 31 | UIV femtosecond writer (new) | + 1 `horizon_interposer` → `linked_horizon_module` (new) | VA[MAX] | laser-written waveguide links |
| 32 | Condensate refinery c10 (new, Sgr A\* orbit) | + 1,000 mB `kerr_condensate` → `condensate_cooled_module` (new) | VA[MAX] | condensate jacket (pack fiction) |
| 33 | UIV millikelvin cryostat works (new) | → `tested_horizon_module` (new) | VA[MAX] | cold test |
| 34 | UEV photonic integration hall c14 (inputs changed) | module + `quantum_memory_node` + `rydberg_logic_array` + 2 `#gtceu:circuits/max` → `grindless:horizon_processor` | as built | system integration |

- **Input changes:** c14 loses its 2 logic dies, 1 interposer and 1,000 mB of condensate (moved to steps 30-32: the processor's condensate total does not change, so #233's totals hold).
- **Branches (as built):** horizon logic die (Q1, 6), horizon interposer (Q2, 5).
- **Byproducts:** failed stacks (5%, *tune*) → `horizon_module_scrap` (new) → EV extraction cascade (In, Nb back), the line's only new byproduct.

### X2 The gate line: the Hyperstargate tree (15; critical path 9)

Everything made only for the Hyperstargate is one line, from the strange matter it starts with to the grid crafts. Its longest path runs through the iris:

| # | Machine | In → out | EU/t | Process |
|---|---|---|---|---|
| 1-6 | O4 | Pb-208 → `fed_strangelet` | | as O4 |
| 7 | UIV levitation melter | → `strange_alloy_charge` | as built | levitation melting |
| 8 | Condensate refinery c3 | → `kerr_strange_ingot` | as built | condensate binding (pack fiction) |
| 9 | Bound-matter press c2 | → `kerr_strange_plate` | as built | field pressing |
| 10 | UEV single crystal foundry | → `oriented_blade_blank` | as built | oriented solidification |
| 11 | UEV megabar press | → `densified_blade` | as built | densification |
| 12 | GTM lathe | → `edged_blade` | as built | edging |
| 13 | UEV electron beam furnace | → `coated_iris_blade` | as built | coating |
| 14 | Hyper assembly array | → `iris_blade` | as built | grid craft |
| 15 | Hyper assembly array | 240 blades + … → `horizon_iris` | as built | grid craft |

Branches (as built): containment plate (T1, on X4's plates), chevron core (T2), horizon mesh (T3, on X3's wire), the four meta-materials (T4-T7), crystal slurry with the p-process plasma (T8, P12, P24), core and controller crystals (T9, T10), alignment matrix (T12), resonance chamber (T13), Kerr SMES toroid (T14), flux absorber (T15), frame truss (T16), comm terminal (T17), Kerr gyroscope (P19), the creative cores (K1-K4) and the grid crafts (ring block, chevron upgrade and block, capacitor, power unit, base, controller, interface). The ring path, `kerr_strange_plate` (9) → ring block (10) → chevron block (11) → base (12), is shorter. MAX+-only paths reach 9 (the iris, the conduit and waveguide through the base).

### X3 Kerr strand and its windings (13; critical path 7)

O5's wire (3) → M2's clad strand, preform and horizon strand wire (4-6) → condensate refinery c4 → `kerr_clad_strand` (7) → pasta draw bench (SGR) → `kerr_strand_wire` (8) → UHV tether ribbon works → `kerr_ribbon` (9) → UXV stellar elevator (Cygnus) → `proof_loaded_kerr_ribbon` (10) → GTM chemical bath (+ condensate) → `bound_coated_ribbon` (11) → GTM autoclave → `cured_bound_ribbon` (12) → GTM assembler → `deep_horizon_tether` (13; the blueshift forge wears it). Branches from the wire: MTJ → `insulated_kerr_wire` (the horizon machine casing), PBO plant → `kerr_braid_sleeve`, the Kerr field coil (C1: stabilised wire → winding → impregnated → `kerr_field_coil`, 12, then the Kerr coil casing, 13), the horizon belt (C6), the Kerr fault-current limiter (P18).

### X4 Horizon-bound matter (11; critical path 4)

O3 to the seed (1-6) → M3's `seed_wave_packet` (7) → mirror shell c4 → `kerr_condensate` (8) → condensate refinery c1 → `settled_condensate` (9) → refinery c2 (+ UEV megabar's compressed neutronium core) → `bound_neutronium_ingot` (10) → bound-matter press c1 → `horizon_compressed_plate` (11). Branches: the jacketed condensate cell (P1, the travel form) and the bound degenerate billet (P5: megabar compact → refinery c5 → SPS billet), which the bound lattice casing and the crucible liner take. The plate goes to the gate line and the horizon machine casing.

### X5 30 Doradus: very massive stars to iron-56 (9)

| # | Machine | In → out | EU/t | Process |
|---|---|---|---|---|
| — | Tarantula stellar lift c1 | → `raw_vms_plasma` | as built | base resource |
| 1 | UXV plasma mass filter (30 Doradus row) | → `vms_core_plasma` | as built | mass filtering |
| 2 | UXV FRC former (30 Doradus row) | → `confined_vms_plasma` | as built | confinement |
| 3 | Pair-instability crucible c1 | → `ni56_slug` + 8 `ime_ash` | as built | pair-instability burning (named fiction) |
| 4 | GTM canner (+ `chain_lamina_stack`) | → `canned_ni56` | as built | canning |
| 5 | IV hot cell | → `shielded_ni56_cask` | as built | shielding |
| 6 | Nickel-56 burner c1 | → EU + `co56_cask` | as built | Ni-56 decay heat |
| 7 | Burner c2 | → EU + `spent_fe56_cask` | as built | Co-56 decay heat |
| 8 | IV hot cell (output changed) | → `gtceu:iron_56_dust` (new material) instead of iron dust | as built | the slug has decayed to isotopically pure Fe-56 |
| 9 | GTM assembler | iron-56 plates + … → `fe56_shield_casing` (and the cryostat, window and gate casings) | VA[MAX] | casing (section 7) |

Branches: IME ash (P8 → `electronic_grade_silicon`), sCO2 turbine (P17), lift nozzle (P20), crucible liner (P21). New material: `gtceu:iron_56` (dust, ingot, plate; the pack's isotope naming, as `gtceu:tungsten_184`; the dump has no iron-56). Real: pure Fe-56 shows no Fe-54(n,p) Mn-54 or Fe-58(n,γ) Fe-59 activation, so it suits reduced-activation shields.

### X6 to X8 and the kept lines

- **X6 Primordial fuels (7):** pristine gas works (base) → EV cryogenic plant → `liquid_pristine_hydrogen` → distillation → `hd_fraction` → calutron → `primordial_deuterium` (3) → chemical reactor → `hd_equilibrium_mix` → distillation → `pure_hd` → millikelvin works → `frozen_spin_hd` → extruder → `polarized_hd_pellet` (7) → stellarator. Helium branch (P10, P26): `pristine_helium_3` (4) → `polarized_helium_3` (5); pristine He-3 also goes to the cryostat and gate casings. Wear branches: direct converter (P11), neutral beam injector (P22), magnetic scoop (P23), helium-4 dewar (P25).
- **X7 Intergalactic relay (5):** clock lab → `thorium_nav_clock` → photonic foundry → `optical_nav_core` → assembly line (+ OpV probe seed and Hawking drive) → `ig_relay_probe` → Hills slingshot c1 (+ `canned_counterweight`, P15) → `bound_probe_pair` → c2 → `launched_ig_probe` (5).
- **X8 MAX+ components (7):** PMN-PT actuator (C7, 5) → `maxplus_electric_piston` → `maxplus_robot_arm` (7); photonic engine (C3) → emitter → field generator (7); rotor (C2), phase sensor core (C4), condensate field cell (C5) end in their components.
- **Kept as built:** horizon storage die (A1, 4), photonic coprocessor (A2, 4), pattern memory (A3, 5; the interface and AE2).

## 5. Basic materials that change

| Material | Today | After | What it moves |
|---|---|---|---|
| Si-28 trichlorosilane (OpV) | extraction cascade straight to `si28_trichlorosilane` | crude TCS, distilled; tetrachloride loop; P and S purge | the OpV front end's yield (90% per pass, the loop returns the rest) |
| OpV, MAX and MAX+ circuits | three one-row joins | six fab steps in O1; four module steps each in M1 and X1 | `#gtceu:circuits/opv`, `/max` and `/maxplus` prices (counts unchanged; section 14) |
| Tetron arrays (MAX) | one array per supracausal mainframe | four tested dies per mainframe | the tetron fab's c2 load falls, its c1 load stays |
| Antiprotons (OpV) | station c1, decelerator c1 and c2 | one antiproton complex, four rows (ELENA split) | `gtceu:spallation_target_station` is removed with its recipes, quests, lang and tests |
| Iron-56 (MAX+) | spent casks give iron back | spent casks give `gtceu:iron_56_dust` | the Fe-56 shield, cryostat, window and gate casings (section 7) |
| Horizon crystal slurry (MAX+) | the multi-plasma blender | the horizon crystal furnace c0 | `gtceu:multi_plasma_blender` is removed |
| Multiblock bodies (OpV to MAX+) | GTM robust and atomic casings, one MAX+ casing everywhere | the era families (section 7) | about 30,000 OpV, 34,000 MAX and 60,000 MAX+ family casings across the band's structures (section 6) |

Reachability: every new row runs on a machine its era already has, and no new machine is needed: the MAX membrane line gains a fourth row (c4), the condensate refinery a tenth (c10), the antiproton complex its target and ELENA rows, the horizon crystal furnace the slurry row (c0).

**New ids, checked against dump `5d57213f3b83` (GTM 7.5.3 and the pack): none exists today.** Fluids (KubeJS materials): `gtceu:crude_si28_trichlorosilane`, `gtceu:si28_tetrachloride`, `gtceu:chlorosilane_purge`, `gtceu:decelerated_antiproton_beam`. Material: `gtceu:iron_56` (dust, ingot, plate). Items: `annealed_soi_wafer`, `back_gated_soi_wafer`, `activated_cmos_wafer`, `contacted_cmos_wafer`, `interconnected_cmos_wafer`, `transducer_bonded_stack`, `photonic_tetron_module`, `calibrated_photonic_module`, `shielded_quantum_module`, `stacked_horizon_module`, `linked_horizon_module`, `condensate_cooled_module`, `tested_horizon_module`, `horizon_module_scrap` (all `grindless:`). Blocks: `chain_lamina_casing`, `tpv_wall_casing`, `kugelblitz_cavity_casing`, `tensegrity_truss_casing`, `membrane_vacuum_casing`, `droplet_radiator_casing`, `shell_window_coil_casing`, `bound_lattice_casing`, `kerr_coil_casing`, `fe56_shield_casing`, `primordial_cryostat_casing`, `void_diamond_window`, `horizon_gate_casing` (all `grindless:`). Every other id this design names exists in the dump, among them `gtceu:trichlorosilane`, `gtceu:tungsten_hexafluoride`, `gtceu:phosphoric_acid`, `gtceu:lithium_6_dust`, `he4_dewar`, `exotic_cladding_foil`, `cooled_cavity_mode`, `laminated_terfenol_stack` and `failed_tetron_die`. Removed ids: `gtceu:spallation_target_station`, `gtceu:multi_plasma_blender` (no save compatibility: their recipes, quests, lang and tests go with them).

## 6. Multiblock scale

Rule: `docs/quality/structures.md`, *Scale by tier and use*. Guide in filled cells: OpV workhorse 1,400-2,200, plant 2,200-3,600, flagship 3,800-5,500, field unit about 470-730; MAX 1,800-2,800, 2,800-4,500, 5,000-8,000, 600-930; MAX+ 2,200-3,500, 3,500-6,000, 7,000-12,000, 730-1,170. "Now" is dump `5d57213f3b83` (bbox W x H x D, filled cells, GTM active blocks). Body shares are of the filled cells; no block passes 70% and every structure keeps at least two kinds of functional detail. Every target fits the forming sweep's band (60 x 60 x 124); the Hyperstargate uses its full height. Active blocks stay under the T0 ceiling of 264.

### 6.1 OpV (family: section 7.1)

| # | Structure | Class | Cells now → target | Bbox now → target | Silhouette | Body | Active now → cap |
|---|---|---|---|---|---|---|---|
| 1 | Kugelblitz forge | flagship | 1,068 → 4,200-4,800 | 15³ → 23³ | two-shell sphere (cavity inside, field-frozen outside) pierced by 8 Laue arms on a lamina cradle | cavity ~30%, field-frozen ~30%, lamina ~15%, shield ~10%, fusion glass arms | 146 → 96 (one equatorial fusion-coil ring) |
| 2 | Annihilation engine | plant | 806 → 2,400-2,800 | 11³ → 17³ | sphere in a cage: NEG chamber, absorber shell, TPV wall, magnetic nozzle rings | shield ~30%, TPV wall ~30%, lamina ~20%, NEG ~8% | 264 → 128 (the 136 heat vents become TPV wall casings) |
| 3 | Antihydrogen foundry | plant | 798 → 2,300-2,700 | 9x9x13 → 13x11x25 | long trap hall: the trap axis through octupole rings, laser enclosure on the roof | NEG ~35%, shield ~25%, lamina ~20% | 68 → 96 |
| 4 | Strangelet vault | workhorse | 624 → 1,500-1,800 | 9³ → 13³ | shielded vault: a trap column in a borated pool | field-frozen ~30%, shield ~30%, lamina ~20%, water | 16 → 32 |
| 5 | Hawking collector | plant | 598 → 2,300-2,700 | 11³ → 17³ | sphere: core cage, absorber ring, TPV wall | TPV wall ~35%, shield ~30%, field-frozen ~15%, lamina ~10% | 118 → 48 (vents to TPV wall) |
| 6 | Spallation target station | merged | 567 → 0 | 9x7x13 | into the antiproton complex (Decision S-3) | — | 48 → — |
| 7 | Antiproton complex (id `gtceu:antiproton_decelerator` kept, renamed) | plant | 564 → 2,800-3,300 | 13x5x13 → 29x7x29 | hexagonal AD ring with an inner ELENA ring and a shielded target hall on one straight | lamina ~40%, NEG ~20%, shield ~15%, SRF cryomodules ~5% | 109 → 192 |
| 8 | Jet beam line | workhorse | 430 → 1,400-1,700 | 5x5x21 → 7x7x45 | straight beam line: quadrupole doublets, SRF module, diagnostics | lamina ~45%, NEG ~25%, SRF ~10% | 48 → 64 |
| 9 | Strangelet distiller | workhorse | 400 → 1,400-1,700 | 7x7x13 → 11x11x19 | beam inlet into a plasma cell, catcher behind | field-frozen ~35%, lamina ~25%, NEG ~20% | 61 → 64 |
| 10 | Magnetic pair converter | workhorse | 102 → 1,400-1,600 | 9³ → 13x17x13 | tall open frame along the field lines, trap on its axis | field-frozen ~35%, lamina ~30%, NEG ~15% | 2 → 32 |
| 11 | Field-frozen press | workhorse (bootstrap) | 288 → 1,400-1,600 | 7x9x7 → 11x15x11 | press frame aligned to the field, can bay | lamina ~50%, GTM high-power casing ~15% (no field-frozen casing: it makes them) | 48 → 48 |
| 12 | Tetron fab | workhorse | 423 → 1,500-1,800 | 9x7x11 → 15x11x17 | cleanroom bay round a dilution-fridge mast | lamina ~40%, cleanroom glass ~20%, NEG ~10%, plascrete detail | 16 → 32 |
| 13 | Gamma optics works | workhorse | 435 → 1,400-1,700 | 7x7x15 → 9x9x31 | long optical bench: a vacuum tube on a stone bed, lens frame at the far end | lamina ~40%, NEG ~25%, shield ~10% (the end vents become shield) | 18 → 0 |
| 14 | Debris harvester | field unit | 302 → 500-700 | 11x5x11 → 15x7x15 | sweep frame with a sorter drum | lamina ~55%, frames, gearbox | 0 → 0 |
| 15 | Replication refinery | workhorse | 365 → 1,400-1,700 | 9³ → 13x15x13 | carbonyl column beside the FFC cells | lamina ~40%, TPV wall ~15%, pipes | 20 → 32 |
| 16 | von Neumann foundry | plant | 565 → 2,200-2,600 | 11³ → 17x13x17 | replicator bay: assembly cradles round a seed core | lamina ~45%, field-frozen ~15%, frames | 0 → 16 |
| 17 | Collector node works | workhorse | 354 → 1,400-1,600 | 9x5x13 → 13x9x21 | film line hall | lamina ~45%, TPV wall ~15%, glass | 0 → 0 |
| 18 | Bulge collector | plant | 478 → 2,400-3,000 | 13x7x13 → 31x9x31 | receiving dish ring for the swarm's beamed light | TPV wall ~40%, lamina ~35%, glass | 21 → 32 |
| 19 | Assembly line array | plant (mega) | 1,281 → 2,400-2,800 | 9x7x35 → 13x9x41 | gantry hall over four tracks with a crane frame | lamina ~40%, GTM assembly line casing and units ~30% (the GTM machine needs them), glass | 0 → 0 |

### 6.2 MAX (family: section 7.2)

| # | Structure | Class | Cells now → target | Bbox now → target | Silhouette | Body | Active now → cap |
|---|---|---|---|---|---|---|---|
| 1 | Mirror shell | flagship | 6,146 → ~7,060 | 33³ → 35³ | two-layer sphere round the hole (section 6.5) | segments ~44%, tensegrity truss ~40%, window coil ~6%, glass ~7%, bundles ~3% | 0 → 0 |
| 2 | Horizon flux clamp | plant | 1,583 → 3,200-3,800 | 23x7x23 → 31x11x31 | ring of flux-pump coil stacks round a central bore | truss ~35%, clamp coil ~30%, membrane vacuum ~10%, radiator ~10% | 5 → 16 |
| 3 | Geroch winch | plant | 1,203 → 3,000-3,600 | 9x33x9 → 13x45x13 | tether tower: drum at the top, tether well, radiator fins | truss ~40%, Geroch drum ~20%, radiator ~15%, clamp coil ~10% | 81 → 96 |
| 4 | Ergoregion synchroniser | plant | 1,191 → 3,000-3,500 | 19x7x19 → 27x9x27 | driver ring with RF feed spokes | truss ~35%, driver ring ~25%, clamp coil ~15%, membrane vacuum ~10% | 5 → 16 |
| 5 | Photon ring imager | workhorse | 1,050 → 2,000-2,600 | 17x9x17 → 25x11x25 | central dish with a ring of sub-dishes | optical table ~35%, truss ~35%, radiator ~10% | 16 → 32 |
| 6 | Accretion feeder | plant | 936 → 3,000-3,500 | 15x9x15 → 27x9x27 | feeding ring in the ISCO plane | truss ~35%, feeder coil ~25%, radiator ~20% | 144 → 144 |
| 7 | Segment reclamation works | workhorse | 886 → 1,900-2,400 | 15x9x15 → 19x11x23 | disassembly bay with strip tanks | truss ~40%, reclamation bay ~25%, membrane vacuum ~10% | 11 → 16 |
| 8 | Cluster-light furnace | plant | 855 → 3,000-3,400 | 13x9x13 → 23x15x23 | solar furnace: a concentrator bowl over a hearth | optical table ~30%, truss ~30%, radiator ~15% (OpV's casings leave its body) | 1 → 16 |
| 9 | Mass stream injector | workhorse | 767 → 2,000-2,500 | 15x7x15 → 21x9x21 | injector ring with turning magnets | truss ~35%, stream turn ~25%, clamp coil ~15% | 13 → 16 |
| 10 | Gene ark | workhorse | 554 → 1,900-2,300 | 11x9x11 → 17x13x17 | sealed vault with cryo racks | membrane vacuum ~35%, truss ~30%, GTM sterilizing filter ~15% | 32 → 32 |
| 11 | Membrane line | workhorse | 396 → 1,900-2,300 | 5x5x21 → 9x9x45 | roll-to-roll hall | truss ~45%, membrane roller ~30%, glass (no membrane vacuum: it makes the membrane) | 14 → 14 |
| 12 | Rydberg array works | workhorse | 346 → 1,900-2,200 | 9x7x9 → 15x11x17 | optical lab round a vacuum cell | optical table ~35%, membrane vacuum ~25%, truss ~25% | 24 → 32 |
| 13 | Atom interferometer works | workhorse | 259 → 1,800-2,100 | 5x15x5 → 9x45x9 | atom fountain tower | membrane vacuum ~35%, truss ~30%, optical table base ~15%, clamp coil shield ~10% | 2 → 16 |
| 14 | Horizon interferometer | plant | 201 → 2,800-3,400 | 21x5x21 → 45x7x41 | triangle: three test-mass stations joined by laser-link arms | truss ~35%, laser link ~25%, test mass enclosure ~20%, optical table ~10% | 24 → 24 |

### 6.3 MAX+ (family: section 7.3)

| # | Structure | Class | Cells now → target | Bbox now → target | Silhouette | Body | Active now → cap |
|---|---|---|---|---|---|---|---|
| 1 | Hyperstargate | flagship, largest in the pack | 553 → 8,500-9,500 | 41x43x9 → 59x60x23 | circular gate in a toroidal jacket on a stepped pedestal (section 6.4) | gate casing ~30%, Fe-56 shield ~30%, cryostat ~12%, void window ~8% | 2 → 8 |
| 2 | Polarized fusion stellarator | plant | 3,458 → 4,500-5,200 | 31x11x31 → 37x13x37 | twisted stellarator ring | bound lattice ~35%, Kerr coil ~25%, Fe-56 ~20%, cryostat ~10% | 136 → 136 |
| 3 | Hyper assembly array | plant | 2,401 → 4,000-4,600 | 27x11x27 → 33x13x33 | grid hall: a 9 x 9 bus field round an assembly core | bound lattice ~40%, cryostat ~10%, void window ~10% | 152 → 152 |
| 4 | Tarantula stellar lift | plant | 2,013 → 4,200-5,000 | 21x15x21 → 31x21x31 | lift funnel | bound lattice ~35%, lift nozzle ~25%, Kerr coil ~20% (no Fe-56: the first 30 Doradus machine) | 80 → 96 |
| 5 | Pristine gas works | plant | 1,854 → 4,000-4,600 | 25x7x25 → 41x9x41 | scoop ring | bound lattice ~40%, Kerr coil ~25%, Fe-56 ~15% (no cryostat: it makes the helium) | 124 → 128 |
| 6 | Primordial fusion torus | plant | 1,782 → 4,200-4,800 | 23x9x23 → 35x11x35 | tokamak torus | bound lattice ~30%, Kerr coil ~25%, Fe-56 ~25%, cryostat ~10% | 108 → 128 |
| 7 | Blueshift forge | plant | 1,759 → 3,800-4,500 | 13x31x13 → 17x51x17 | tower over a tether well | bound lattice ~35%, Fe-56 ~25%, void window ~15%, Kerr coil ~10% | 25 → 32 |
| 8 | Condensate assembler | plant | 1,523 → 3,800-4,400 | 19x13x19 → 25x15x25 | condensate bath hall | cryostat ~30%, bound lattice ~30%, Kerr coil ~15%, condensate vessel ~10% | 3 → 16 |
| 9 | Horizon crystal furnace (absorbs the blender) | plant | 1,365 → 3,600-4,200 | 15x17x15 → 21x23x21 | crystal puller tower with eight plasma inlets at its foot | bound lattice ~30%, cryostat ~20%, Fe-56 ~15%, Kerr coil ~15%, void window ~10% | 55 → 64 |
| 10 | Void crystal fab | workhorse | 1,219 → 2,400-2,900 | 15³ → 19³ | open frame in the dark | bound lattice ~40%, cryostat ~20%, Fe-56 ~15% (no void window: it grows the diamond) | 36 → 36 |
| 11 | Hyperfactory | plant (mega) | 1,125 → 3,800-4,400 | 15x9x21 → 25x13x33 | factory hall | bound lattice ~40%, Kerr coil ~10%, void window ~10%, cryostat ~10% | 4 → 16 |
| 12 | Hills slingshot | plant | 1,099 → 4,000-4,800 | 17x9x17 → 37x11x37 | capture ring | bound lattice ~35%, slingshot coil ~25%, Kerr coil ~20% | 68 → 96 |
| 13 | Pair-instability crucible | plant | 1,091 → 3,800-4,400 | 15³ → 21³ | sphere | bound lattice ~30%, crucible liner ~25%, Kerr coil ~15% (no Fe-56: it precedes it) | 36 → 48 |
| 14 | Bound-matter press | workhorse | 1,037 → 2,300-2,700 | 13³ → 17³ | press column | bound lattice ~35%, bound press ~30%, Kerr coil ~15% | 0 → 0 |
| 15 | Condensate refinery | plant (bootstrap) | 1,019 → 3,600-4,200 | 15x11x15 → 23x15x23 | vessel hall round a superfluid core | MAX tensegrity truss ~35%, condensate vessel ~30%, MAX membrane vacuum ~15% (Decision C-4) | 9 → 16 |
| 16 | Nickel-56 burner | plant | 878 → 3,600-4,200 | 15x9x15 → 25x13x25 | cask vault beside an sCO2 turbine hall | bound lattice ~40%, Kerr coil ~15%, MAX droplet radiator ~15% (no Fe-56: it makes it) | 36 → 48 |
| 17 | Meta-material loom | plant | 787 → 3,600-4,200 | 21x9x9 → 33x13x15 | loom hall | bound lattice ~35%, Kerr coil ~15%, cryostat ~15% | 5 → 16 |
| 18 | Multi-plasma blender | merged | 611 → 0 | 11³ | into the horizon crystal furnace (Decision S-3) | — | 7 → — |
| 19 | Horizon capacitor bank | plant | 480 → 3,500-4,200 | 25x5x25 → 41x9x41 | storage torus with 40 capacitor slots | bound lattice ~30%, Kerr coil ~25%, cryostat ~25% | 52 → 64 |

### 6.4 The Hyperstargate (8,500-9,500 cells, the largest structure in the pack)

Today a square frame of 160 cells, 41 x 43 x 9, 553 cells, smaller than seventeen other MAX+ structures. The new gate is a circle, as every stargate is, held in a jacket of the era's own casings on a pedestal (Decision H-1):

- **Ring (unchanged counts):** the thin digital circle of radius 27 in the plane z = 11 (cells with |d - 27| ≤ 0.5 round the centre (29, 30)) has exactly 160 cells: 151 `hyperstargate_ring_block` and 9 `hyperstargate_locked_chevron`, 40° apart from the top. The grid layer (1,212 crafts) and #233's totals do not change.
- **Jacket:** horizon gate casings in the torus 27.5 < d ≤ 29.5 for z = 5 to 17 (13 planes, about 3,700 cells); its inner half (d ≤ 28.5) is primordial cryostat casing for z = 9 to 13 (about 900, the cold channel round the ring); void diamond windows every 30° on its outer face and on its front and back faces (about 400).
- **Pedestal:** a stepped deck of Fe-56 shield casing, y = 0 to 5, from 43 x 23 at the floor to 33 x 13 at the top (about 3,000), with two cradle buttresses front and back that climb the jacket's lower arc (about 1,200). The base block, the four power units and the iris sit on the top step under the ring plane; the controller faces the front; the hatch cells (1-2 input buses, 1 output bus, the one energy cell for the 4,096 A wireless hatch) are on the front step.
- **Open plane:** the disc d < 26.5 in z = 11, about 2,200 cells of air. `HS.box` keeps its bounds and gains the centre and radius; the crossing check in `maxplus/ending.js` tests the distance from the centre.
- **Measured layout:** 9,727 cells with the jacket on z = 4 to 18 (gate casing 41%, Fe-56 44%, cryostat 9.5%, windows 4%, ring 1.6%); z = 5 to 17 gives about 9,100. Bbox 59 x 60 x 23. Active blocks: none required (the two superconducting coils go).
- **Cost and the 10x target (RF-4A):** the jacket and pedestal take no horizon plate, containment plate or Kerr condensate (section 7.3), so #233's plate total (15,840), containment and condensate totals stand. The grid layer stays at 1,212 crafts (target 1,200-1,600). The body adds about 8,900 family casings, made 4 per run (the gate casing 2 per run): about 3,000 runs of four recipe types the era already has plus one new one (the gate casing), so the tree's recipe types go from about 120 to about 121 (target 100-150). In base units the body costs about 3e10 to 4e10, half to two thirds of its 160 ring blocks (5.9e10).

### 6.5 The Mirror Shell (about 7,060 cells)

Today a 33-block hollow cube with face windows (6,146 cells; 1,528 feeder coil casings in the window rings since c2aa8b49). It becomes what the physics describes, a mirror round the hole (Decision H-2): a two-layer sphere in a 35-block box.

- **Inner layer** (15.5 < d ≤ 16.5 from the centre, 3,338 cells): `mirror_shell_segment` facing the hole, except the ports.
- **Outer layer** (16.5 < d ≤ 17.5, 3,722 cells): `tensegrity_truss_casing`, two `stream_bundle_block` belts at ±30° latitude, and round each port a ring of the new `shell_window_coil_casing`.
- **Ports:** 26 windows of `gtceu:cleanroom_glass` (3 x 3, through both layers) on the 26 directions of a cube (faces, edges and corners), each ringed in the outer layer by 16 window coil casings: about 470 glass and 416 coil cells.
- **Shares:** segments about 44% (about 3,100, 11% fewer than today's 3,497), truss about 40%, coil 6%, glass 7%, bundles 3%. Active blocks: 0. Hatch cells: two rows of seven round the controller at the equator of the front, as today.
- The c3 rule (every segment in place) and the shell's recipes do not change.

### 6.6 Fit and the Terminal

- Every target fits the forming band (60 x 60 x 124). The tallest are the Hyperstargate (60), the blueshift forge (51), the winch and the atom interferometer (45); the widest the Hyperstargate (59) and the horizon interferometer (45); the deepest the jet beam line and the membrane line (45). If a reshape needs more, the package names the bbox and the integrator moves the band.
- GTM's Terminal places at most about 2,300 blocks per pass. Each structure quest states its passes, ceil(cells / 2,300) on the built layout: the Hyperstargate (about 9,100 cells) and the Mirror Shell 4, the MAX+ plants and the Kugelblitz forge 2 or 3, the other plants 2 (1 under 2,300 cells), workhorses 1 or 2, field units 1.

## 7. Casing families

**Price reference (Decision C-1).** The OpV hull is an outlier (02_cost_curve.md, *The hull outlier*), so each family is priced against **C, the era's median core component**, by `cost-matrix.mjs --trace` on dump `5d57213f3b83`: OpV C = 348,000 base units (the fluid regulator; the hull is 4.7 C); MAX C = 3.32 million (the emitter; hull 2.7 C); MAX+ C = 21.7 million (the emitter; MAX+ has no hull, its horizon machine casing is 0.56 C). Classes: structural 0.03-0.05 C, function 0.10-0.15 C, signature 0.25-0.6 C. A controller is about 15 to 40 C, and a workhorse body at the shares of section 6 is 60 to 120 C, so the casings cost more than the controller. Packages set the counts from their inputs' trace prices; the integrator's T2 checks each casing within ±30% of its class.

Today: `field_frozen_casing` 58 base units (0.0002 C), `annihilation_shield_casing` 1.17 million (3.4 C), `neg_xhv_casing` 0.34 C; the MAX machine casings 0.5 C each, `feeder_coil_casing` 0.06 C, `mirror_shell_segment` 0.95 C; `horizon_machine_casing` 0.56 C as bulk in nine MAX+ structures (2,141 in the stellarator), `crucible_liner_casing`, `slingshot_coil_casing` and `lift_nozzle_casing` near 0.

### 7.1 OpV: the bulge family

| Casing | Job | Recipe (machine, EU/t, ticks: in → out) | Era-only input and why | Cost | Art brief | Used by |
|---|---|---|---|---|---|---|
| `grindless:chain_lamina_casing` (new) | structure: frames, walls, floors | assembler (assembly hall or quantum fabricator on two UXV 4 A hatches until the OpV assembler exists), 2^28, 200 t: 4 `chain_lamina_stack` + 8 `gtceu:chain_strand_single_wire` + 2 `gtceu:neutronium_plate` + 1 `gtceu:neutronium_frame` → 4 | `chain_lamina_stack` (SGR): the laminate's chains carry tension along the plate, the strongest structure OpV makes (named fiction outside the field) | 0.04 C | deep OpV blue plate laminated in 1 px bands every 2 rows, cross-tied every 4 px by thin silver strand lines, darker rim, light RF-6D speckle | every OpV body; the MAX tensegrity truss |
| `grindless:field_frozen_casing` (kept, recipe raised) | field and confinement | field-frozen press c3 (SGR, `tables/field_press.json`), VA[OpV], 400 t: 4 `field_frozen_plate` + 1 `chain_field_coil` + 2 `gtceu:chain_strand_single_cable` + 1 `gtceu:tungsten_steel_frame` → 2. **As built (OPV-DETAIL-CASINGS #398):** 4 `field_frozen_plate` + 2 `gtceu:uxv_sensor` → 3; the field-freezing type has 3 item slots with the circuit, so coil, cable and frame do not fit | `field_frozen_plate`: a magnetar field frozen into the plate holds itself without power | 0.12 C | as built | forge, vault, distiller, pair converter, collector, von Neumann foundry; the cavity casing |
| `grindless:annihilation_shield_casing` (kept, retuned from 2 to 4 per run) | gamma and pion shield | assembler, 2^28, 400 t: 4 `gamma_absorber_tile` + 1 `li6_hydride_shield` + 2 `chain_lamina_stack` + 2 `gtceu:tungsten_plate` → 4. **As built (#398):** the same + 2 `gtceu:uxv_sensor` + 1 `gtceu:uxv_electric_motor` + helium-3 → 4 | `gamma_absorber_tile` (L32): W/B4C-10 stops the π0 gammas and captures neutrons | 0.12 C | as built | engine, foundry, vault, collector, antiproton complex, gamma optics, forge |
| `grindless:neg_xhv_casing` (kept, retuned) | extreme-high vacuum wall | assembler, 2^28, 400 t: 1 `activated_neg_chamber` (L25) + 2 `chain_lamina_stack` + 1 `gtceu:stainless_steel_frame` → 4 (before: 4 chambers + 4 titanium plates → 2). **As built (#398):** the same + 2 `gtceu:uxv_electric_pump` + nitrogen → 4 | the TiZrV getter coating (L25) pumps the wall itself | 0.10 C | as built | foundry, complex, jet beam line, distiller, pair converter, tetron fab, gamma optics, engine core; the MAX membrane vacuum casing |
| `grindless:tpv_wall_casing` (new) | thermal: a passive thermophotovoltaic wall in place of heat vents | assembler, 2^28, 400 t: 2 `tpv_panel` + 1 `gamma_absorber_tile` + 2 `gtceu:copper_plate` + 1 `chain_lamina_stack` → 4 | `tpv_panel` (L33, GaSb and InGaAsSb cells): turns the absorber's heat into power (LaPotin 2022) | 0.10 C | dark ceramic 4 x 4 tiles, each a deep purple-grey cell, a thin warm copper spreader grid between them; no emissive layer | engine, Hawking collector, bulge collector, replication refinery, node works |
| `grindless:kugelblitz_cavity_casing` (new, signature) | the forge's spherical gamma mirror | assembly line, VA[OpV], 600 t: 1 `gamma_multilayer_mirror` + 2 `field_frozen_plate` + 1 `annihilation_shield_casing` + 4 `gtceu:chain_strand_single_wire` → 2 | `gamma_multilayer_mirror` (L34, WC/SiC): reflects MeV gammas at grazing incidence (Fernández-Perea 2013) | 0.5 C | hexagonal facets of alternating WC grey and SiC teal rings round a violet pip, field-frozen rim | Kugelblitz forge |

Lines: the lamina, field-frozen, NEG, TPV and cavity casings hang off O5, O5, O2 (L25), O2 (L33) and O3 (L34). Bootstrap: the field-frozen press, the first OpV multiblock, is built of chain lamina casings only.

### 7.2 MAX: the Sagittarius family

| Casing | Job | Recipe | Era-only input and why | Cost | Art brief | Used by |
|---|---|---|---|---|---|---|
| `grindless:tensegrity_truss_casing` (new) | structure | GTM large assembler on a MAX hatch (or the assembly hall on two OpV hatches), VH[MAX], 200 t: 2 `exotic_composite_rod` + 4 `gtceu:horizon_strand_single_wire` + 2 `chain_lamina_casing` → 4 | horizon strand (L1) as the tendons, near maximal tension; exotic composite rods (L10) as the struts | 0.04 C | dark graphite struts in an X brace, thin white-gold strand tendons on the diagonals, nodes at the corners, MAX era style | every MAX body; the Mirror Shell's outer layer; the MAX+ bound lattice; the condensate refinery (bootstrap) |
| `grindless:clamp_coil_casing` (kept, the family's field casing, retuned) | passive field winding | assembler, VH[MAX], 400 t: 1 `max_field_coil` + 2 `gtceu:horizon_strand_single_wire` + 1 `tensegrity_truss_casing` → 2 | `max_field_coil` (L9, REBCO in a CMC former) | 0.12 C | as built | flux clamp, winch, synchroniser, injector, atom interferometer |
| `grindless:max_optical_table_casing` (kept, the family's optical casing, retuned) | vibration-free optical bench | assembler, VH[MAX], 400 t: 1 `zero_expansion_baseplate` + 1 `laminated_terfenol_stack` + 1 `tensegrity_truss_casing` → 2 | the zero-expansion baseplate (L48) and a terfenol stack (L35) for active damping | 0.12 C | as built | imager, Rydberg works, furnace, the two interferometers |
| `grindless:membrane_vacuum_casing` (new) | vacuum and magnetic shielding | assembler, VH[MAX], 400 t: 1 `superconducting_membrane` + 2 `neg_xhv_casing` + 1 `tensegrity_truss_casing` → 2 | `superconducting_membrane` (L2): a superconducting liner screens stray fields | 0.10 C | smooth dark plate under a fine iridescent gold-violet grid, flanged and bolted rim | gene ark, Rydberg works, atom interferometer, clamp, synchroniser, reclamation; the condensate refinery |
| `grindless:droplet_radiator_casing` (new) | heat rejection | assembler, VH[MAX], 400 t: 2 `shell_droplet_radiator` + 1 `tensegrity_truss_casing` → 2 | `shell_droplet_radiator` (L15, made at Sgr A\*): Sn-Li droplet sheets radiate where fins would be too heavy | 0.10 C | fine vertical silver droplet streaks over a dark collector frame, collector slots every 8 px | winch, clamp, imager, feeder, furnace; the Ni-56 burner |
| `grindless:shell_window_coil_casing` (new, signature with the segment and the bundle block) | the Mirror Shell's window rings: a passive coil that keeps the trapped mode off the ports | assembler, VH[MAX], 400 t: 1 `max_field_coil` + 1 `superconducting_membrane` + 2 `gtceu:horizon_strand_single_wire` + 1 `tensegrity_truss_casing` → 2 | the coil and the membrane, the shell's own conductor | 0.15 C | concentric square windings of white-gold strand round a dark core in a grey CMC former; no lit state (not a GTM ActiveBlock) | Mirror Shell |

`mirror_shell_segment` (0.95 C) and `stream_bundle_block` stay as built. Machine detail casings stay, each at most 30% of its machine: `geroch_drum_casing`, `membrane_roller_casing`, `stream_turn_casing`, `feeder_coil_casing`, `driver_ring_casing`, `reclamation_bay_casing`, `test_mass_enclosure_casing`, `laser_link_casing`. Bootstrap: the membrane line, which makes the membrane, uses no membrane vacuum casing; home machines use no radiator (it is made at Sgr A\*).

### 7.3 MAX+: the horizon family

| Casing | Job | Recipe | Era-only input and why | Cost | Art brief | Used by |
|---|---|---|---|---|---|---|
| `grindless:bound_lattice_casing` (new) | structure | assembler (MAX hatch), VA[MAX], 200 t: 1 `bound_degenerate_billet` + 2 `kerr_strand_wire` + 2 `tensegrity_truss_casing` → 4 | `bound_degenerate_billet` (P5): white-dwarf matter bound in the condensate, the stiffest structure the pack makes (pack fiction) | 0.04 C | near-black hexagonal lattice with faint condensate-blue lines and a soft lensing highlight, XP-V1 style | every MAX+ body but the refinery and the Hyperstargate |
| `grindless:kerr_coil_casing` (new) | passive field winding | assembler, VA[MAX], 400 t: 1 `kerr_field_coil` + 1 `bound_lattice_casing` → 2 | `kerr_field_coil` (C1) | 0.12 C | tight helical bands of pale-gold Kerr strand with a blue sheen over a lattice former; no lit state | stellarator, lift, gas works, torus, slingshot, crucible, capacitor bank, condensate assembler, blueshift forge, furnace, loom, hyperfactory, press, burner |
| `grindless:fe56_shield_casing` (new) | radiation and thermal shield | assembler, VA[MAX], 400 t: 6 `gtceu:iron_56_plate` + 2 `gtceu:lithium_6_dust` + 1 `gtceu:tungsten_plate` → 4 | iron-56 (X5): no activation chain in a neutron flux; lithium-6 captures the neutrons | 0.12 C | cold steel-grey slabs with a fine forged grain and recessed bolt rows, low saturation, a faint violet seam | Hyperstargate pedestal, stellarator, torus, gas works, blueshift forge, crystal furnace, void fab |
| `grindless:primordial_cryostat_casing` (new) | cryogenic containment | assembler, VA[MAX], 400 t: 2 `gtceu:iron_56_plate` + 1 `he4_dewar` + 250 mB `gtceu:pristine_helium_3` + 1 `neg_xhv_casing` → 2 | pristine helium-3 (P10): a dilution refrigerator needs He-3, and the Stream's never passed through a star | 0.12 C | frosted pale-blue wall with light cyan superfluid channels and vacuum-jacket seams | Hyperstargate cold channel, stellarator, torus, condensate assembler, crystal furnace, void fab, loom, hyper assembly array, capacitor bank, hyperfactory |
| `grindless:void_diamond_window` (new) | optical window | assembler, VA[MAX], 200 t: 2 `void_grown_diamond` + 1 `gtceu:iron_56_plate` → 2 | `void_grown_diamond` (P14): defect-free, grown in the 2.7 K dark | 0.10 C | nearly clear lilac-white pane with sharp facet glints in a thin steel frame (reads as glass) | Hyperstargate, blueshift forge, crystal furnace, hyper assembly array, hyperfactory |
| `grindless:horizon_gate_casing` (new, signature) | the Hyperstargate's jacket | assembly line, VA[MAX], 600 t: 4 `gtceu:iron_56_plate` + 1 `void_grown_diamond` + 1 `max_field_coil` + 250 mB `gtceu:pristine_helium_3` → 2 | the three far places' gifts, iron-56 (30 Doradus), helium-3 (the Stream) and void diamond (the filament); with MAX's REBCO coil it holds the ring's field with no condensate | 0.3 C | dark plate with gold-white chevron arcs inlaid and a faint horizon-violet edge, matching XP-V2's gate face | Hyperstargate |

No Hyperstargate casing takes a horizon plate, a containment plate or Kerr condensate (#233). Machine detail casings stay at most 30% each: `condensate_vessel_casing`, `bound_press_casing`, `slingshot_coil_casing`, `lift_nozzle_casing`, `crucible_liner_casing`, the last three retuned to the function class. `horizon_machine_casing` stays the MAX+ machine casing in controllers and leaves every body. Bootstraps: the condensate refinery is built of MAX casings; the stellar lift, crucible and burner take no Fe-56, the gas works no cryostat and the void fab no window, because each makes or precedes what that casing needs.

## 8. The assembly line array's preview

**Finding.** EMI's `gtceu:multiblock_info` category holds no recipe for `gtceu:assembly_line_array` (T3 vm-20261103-024257-9942706d-2903221, `previewsMissing`), nor for GTM's own `assembly_line` and `data_bank`; the Hyperfactory turned its preview off for the same reason (`maxplus/hyperfactory.js:136`). GTM 7.5.3 adds one `MultiblockInfoEmiRecipe` per definition with the preview on (`MultiblockInfoEmiCategory.registerDisplays`) and builds its widget from `getMatchingShapes()`; the forming sweep forms the array from that same first shape on the server, so the shape exists and the client widget is what EMI drops. The three structures EMI drops have in common a data access hatch with an exact limit (`setExactLimit(1)`).

**Design (Decision E-1).** The array's head row keeps every part, and the data access hatch moves to one marked head cell `D` = `oneOf(wall, data access with setMaxGlobalLimited(1))`: no minimum and no preview count, so the generated preview shows the wall there and holds no data hatch. Research stays honoured: GTM's `AssemblyLineMachine` starts a research recipe only when a data access hatch in the formed structure holds its research, so a structure without the hatch runs no research recipe and loses nothing else. The tooltip, the info page and the quest say "one data access hatch in the marked head cell". The Hyperfactory takes the same cell and turns its preview on.

**Fallback.** If the T3 audit still lists either id, the package gives it an explicit preview shape (GTM's `shapeInfos`, built from the same `cell()` function with named hatches in the part cells and the wall in `D`); failing that, the two get the EMI build page that DECISIONS gives the other six (A6-03).

**Tests.** T1: the array forms without the hatch and runs no research recipe; with the hatch in `D` it runs one (the existing `gg_test_opv_assembly_line_array`). T3, in the integrator's client run (EMI audit, 8 GB): `previewsMissing` and `previewsOff` lose both ids, and `emi_runtime_known.json` shrinks by one.

## 9. Decisions

The owner delegated every decision on 2026-11-03. Each is taken here, with the options weighed.

| Id | Decision | Options weighed | Reason |
|---|---|---|---|
| L-1 | Count as D1; stage only through an intermediate or byproduct made for the later stage; never pad. Result: OpV 26, MAX 30, MAX+ 34, against a guide of 32, 34, 36. | (a) pad with generic fab or packaging steps to reach the guide; (b) count each era's circuit through the previous era's circuits (an end product); (c) as chosen | (a) breaks principle 7; (b) contradicts D1's crossing rule and would make every era's longest line the circuit by definition; (c) is honest and lands within 2 to 6 of the guide. D4 can add up to UXV line 27's length (section 12). |
| L-2 | The band's longest line is the Si-28 qubit line, staged UXV → OpV → MAX → MAX+. | the antimatter-to-horizon chain (11 to the plate); the Hyperstargate tree (15); the strand (13) | the qubit line is the longest real process (a cryogenic fab), the one every later circuit needs, and its stages consume dies and modules made for them; it adds 14 real steps and no padding. |
| L-3 | Lines are programmes: single-consumer chains merge into the line they serve. OpV 45 lines become 9, MAX 57 become 21, MAX+ 59 become 11. | keep the many short chains and add links; merge only sequential pieces | principle 7 counts depth, not lines; D1 merged branches the same way (H3's Kapton); the charts and quests become readable programmes. |
| C-1 | Price casings against the era's median core component (trace), with the class bands of section 7. | the era's hull (an outlier at OpV); the cost-curve index; a peer era's hull scaled | the median component is robust, measured on the same tool as the casings, and comparable across eras (OpV → MAX x9.5, MAX → MAX+ x6.5). |
| C-2 | Six casings per era form the bodies; machine detail casings stay at most 30% each; `horizon_machine_casing` leaves the bodies. | one casing per machine (MAX today, 13 ids); one casing per era; remove the detail casings | the rule asks for a family of 3 to 6; detail casings say what each process is; removing them would churn art, quests and tests for no gain. The stellarator's 2,141 machine casings (26 billion base units) were a bulk misuse of a controller ingredient. |
| C-3 | Every casing takes an input only its era makes, chosen for its job; the Hyperstargate's take no horizon plate, containment plate or condensate. | generic expensive inputs (components, circuits); condensate everywhere in MAX+ | the owner's rule; #233's totals stay exact; the gate's jacket is made of the three far places' products, which teaches why the trip was needed. |
| C-4 | Bootstrap exceptions: the field-frozen press (lamina only), the condensate refinery (MAX casings), the stellar lift, crucible and burner (no Fe-56), the gas works (no cryostat), the void fab (no window), the membrane line (no membrane vacuum). | a decay-storage route for Fe-56 before the burner; rebuild the first machines later | no second route and no rebuild; each exception is the machine that makes or precedes the input. |
| S-1 | Size classes as section 6: three flagships (the Kugelblitz forge, the Mirror Shell, the Hyperstargate), plants for multi-step and big-physics machines, workhorses for single-process machines, one field unit. | the same class for all; flagships only grown | the rule's guide by use; most MAX+ machines are physically huge (stars, tori), most OpV and MAX machines are labs. |
| S-2 | Passive TPV wall casings replace the heat vents of the annihilation engine (264 active to 128) and Hawking collector (118 to 48); MAX+ field rings use passive Kerr coil casings. | keep the vents and shrink elsewhere; raise the ceiling | the engine sits at the ceiling; the TPV wall is what the vents stood for (opv.md machine 5). |
| S-3 | Two merges: the spallation target station into the antiproton decelerator (id kept, renamed Antiproton Complex, rows c1-c4 with ELENA split from AD); the multi-plasma blender into the horizon crystal furnace (c0). No other merge. | merge the stabilisation trio, the Terzan 5 refinery and foundry, the atom interferometer into the Rydberg works | both are single-recipe bays of one process and one site; the others are distinct processes with distinct silhouettes (the fountain tower, the triangle). |
| H-1 | The Hyperstargate: a circle of radius 27 with the same 160 ring cells, a toroidal jacket and a stepped pedestal, about 9,000 cells in 59 x 60 x 23. | keep the square and add a frame; a larger ring with more ring blocks | the circle keeps every grid count and plate total, fits the forming band, and is the largest structure by a clear margin (the shell 7,060). |
| H-2 | The Mirror Shell: a two-layer sphere (35-block box, about 7,060 cells) with 26 ports ringed by the new passive `shell_window_coil_casing`. | keep the cube and swap only the coils | the cube does not say "a mirror round a hole"; the sphere keeps about the same segment count and cost and stays below the Hyperstargate. |
| E-1 | The array's and the Hyperfactory's data access hatch becomes optional in one marked cell. | explicit shape info; an EMI build page | smallest change, research still enforced, and the fallback stays available. |
| M-1 | Spent Ni-56 casks give `gtceu:iron_56` instead of iron. | a new decay-storage route; keep iron | the slug has decayed to pure Fe-56 (real); it gives MAX+ a condensate-free structural metal with a physical reason (no activation). |

## 10. Quests and Processing Lines charts

Each era chapter teaches its lines in order, one quest per step that makes a new species, and its casings, one quest each: what the casing is for, how it is made, the era-only input it needs and which machines are built of it (principle 5). Every structure quest states its size and its Terminal passes (section 6.6). Rewards stay proportionate and never skip a step; no quest gates a recipe; quests on named fiction say so in one line.

| Chapter | Lines, in order | Casings | Other changes |
|---|---|---|---|
| OpV (`tools/quests/opv-chapter/`) | O5, O7, O9, O1 (the circuits section becomes "The Si-28 qubit line": 23 step quests in place of 4), O2, O3, O4, O6, O8 | "Bulge casings": 6 quests, after the field-frozen press | the antiproton complex replaces the station's quest and teaches the ELENA row |
| MAX (`tools/quests/max-chapter/`) | M2, M5, M1 ("The supracausal stage": 4 module quests), M8, M6, M7, M4, M3 | "Sagittarius casings": 6 quests incl. the window coil, the radiator after Sgr A\* | the Mirror Shell's sphere: one quest per quarter of segments, as today, and its 26 ports |
| MAX+ (`tools/quests/maxplus-chapter/`, ages I to III) | X4, X3, X8, X7, X5 (with an iron-56 quest), X6, X1 ("The horizon processor": 4 module quests), X2 | "Horizon casings" by stage: bound lattice and Kerr coil with the refinery (I), Fe-56 after the burner (I), cryostat after the Stream (I), void window (II), gate casing (III) | the Hyperstargate: one quest each for the jacket, the cold channel, the windows and the pedestal, and its four Terminal passes; the crystal furnace takes the blender's quest |

**Charts** (`tools/quests/processing-lines/pl-data-{opv,max,maxplus}.mjs`): one cluster per line of sections 2 to 4, kept lines grouped by machine; staged lines link their start with `extends` to the earlier stage's node: O1 to UXV's `si28_ash`, M1 to O1's `tested_tetron_die`, X1 to M1's `shielded_quantum_module`, M2 to O5's wire, X3 to M2's wire, M3 and X4 to O3's seed, X2 to O4's `fed_strangelet`. The line audit on the batch dump must read the lengths of section 1 (the integrator's T2). The Multiblocks chapter regenerates from the registrations; the station and the blender drop out.

## 11. Implementation packages (dependency order, in waves)

Full contracts are in the handoff. Each is one Sonnet session with at most 2 repairs. No two packages of a wave edit the same file; reshape packages update the forming sweep's ids and the structure-quality baseline themselves, so they run one per wave. `gg_test_emi_coverage_expect.json` is exempt (release.instructions.md: either side, then regenerate).

| Wave | Id | Scope | Depends on | T1 doubt |
|---|---|---|---|---|
| 1 | D5-CAS-OPV | OpV family (7.1): 3 new casings, 3 recipes retuned, art, lang | none | none |
| 1 | D5-QPU-OPV | O1: 6 new steps, the tetrachloride loop, the purge hydrolysis, 3 fluids, 5 items | none | none |
| 2 | D5-CAS-MAX | MAX family (7.2): 4 new casings incl. the shell window coil, 2 retuned, art, lang | D5-CAS-OPV | none |
| 2 | D5-ALA | the array's reshape (13 x 9 x 41, chain lamina body) and the optional data cell; the Hyperfactory's data cell, preview on (section 8) | D5-CAS-OPV | without the hatch no research recipe runs, with it in `D` one does (T3 previews in the integrator's client run) |
| 3 | D5-CAS-MAXP | MAX+ family (7.3): 6 new casings, `gtceu:iron_56` and the casks' new return, art, lang | D5-CAS-MAX | none |
| 3 | D5-SHAPE-OPV-A | home and Cygnus structures: forge, engine, foundry, vault, collector, distiller, jet beam line, tetron fab, gamma optics; the antiproton complex (station merged, ELENA split) | D5-CAS-OPV, D5-ALA | each forms from its first preview shape (sweep, these ids); the complex runs c1 and c4 |
| 4 | D5-QPU-MAX | M1: 4 new steps, membrane line c4, the mainframe's inputs | D5-QPU-OPV | none |
| 4 | D5-SHAPE-OPV-B | SGR and Terzan 5 structures (7) | D5-SHAPE-OPV-A | sweep, these ids |
| 5 | D5-QPU-MAXP | X1: 4 new steps, refinery c10, the processor's inputs | D5-QPU-MAX | none |
| 5 | D5-SHAPE-MAX-A | the Mirror Shell sphere (6.5) | D5-CAS-MAX, D5-SHAPE-OPV-B | the sphere forms at Sgr A\* orbit from its first preview shape and runs its vent row (c1) |
| 6 | D5-CHARTS-OPV | `pl-data-opv.mjs` | D5-QPU-OPV, D5-SHAPE-OPV-A | none |
| 6 | D5-SHAPE-MAX-B | the other 13 MAX structures | D5-SHAPE-MAX-A | sweep, these ids |
| 7 | D5-CHARTS-MAX | `pl-data-max.mjs` | D5-QPU-MAX | none |
| 7 | D5-SHAPE-MAXP-A | the Hyperstargate (6.4) | D5-CAS-MAXP, D5-SHAPE-MAX-B | the gate forms, dials and lets the owner's team cross the circular plane |
| 8 | D5-QUESTS-OPV | the OpV chapter (section 10) | D5-CHARTS-OPV, D5-CAS-OPV, D5-SHAPE-OPV-A and -B | none |
| 8 | D5-SHAPE-MAXP-B1 | stage I structures: refinery, press, slingshot, lift, crucible, burner, gas works, torus, stellarator | D5-SHAPE-MAXP-A | sweep, these ids |
| 9 | D5-QUESTS-MAX | the MAX chapter | D5-CHARTS-MAX, D5-CAS-MAX, D5-SHAPE-MAX-A and -B | none |
| 9 | D5-SHAPE-MAXP-B2 | stage II and III structures: blueshift forge, void fab, loom, crystal furnace (blender merged), condensate assembler, capacitor bank, hyper assembly array, Hyperfactory | D5-SHAPE-MAXP-B1, D5-ALA | sweep, these ids; the furnace runs c0 |
| 10 | D5-CHARTS-MAXP | `pl-data-maxplus.mjs` | D5-QPU-MAXP, D5-SHAPE-MAXP-B2 | none |
| 11 | D5-QUESTS-MAXP | the MAX+ chapters | D5-CHARTS-MAXP, D5-CAS-MAXP, D5-SHAPE-MAXP-A, -B1 and -B2 | none |

## 12. Crossings

**With UXV (band D4):**
- `si28_ash` and its three UXV steps (the EV cryogenic plant's oxygen-burning fuel row, the Mk6 reactor's c4 and the quench caster's ash row) are O1's staged start. D4 keeps the ash and its OpV destination; if D4 makes UXV lines 27 and 29 one line, O1, M1 and X1 count that line's length too. No D5 package edits these rows.
- UXV machines with band rows: the MTJ sputter cluster (O1 steps 15 and 20 as built, X1 step 30 new, in `tables/spin_deposition.json`), the pasta draw bench (O5, M2, X3), the stellar elevator (M2, X3), the plasma mass filter and FRC former (X5), the oxide PLD, SHeQUID, racetrack fab and YIG LPE (as built). The only new UXV-machine row is X1's step 30.
- UXV products the band takes as raw inputs: `gamma_laser_module`, `frc_cartridge`, `flux_loaded_plasma`, `disk_plasma`, `stellar_plasma`, `shequid_gyro`, `gum_metal_blank`, `lasagna_plate`, `pasta_core_sample`, and one UXV component per OpV core component (P2-E).

**Shared files with bands D2 to D4.** These packages add or change band rows in older machines' tables; the orchestrator keeps any D2 to D4 package that edits the same file out of the same wave:
- D5-QPU-OPV: `server_scripts/grindless/ev/extraction_cascade.js`, `server_scripts/grindless/uv/photonics.js` (MOCVD), the ion implanter's OpV-A2 rows, `tables/electron_beam.json`, `tables/beuv_stm.json`.
- D5-QPU-MAX: `tables/tfln_femtosecond.json`, `tables/memories_cryostat.json`, `tables/photonics.json` (photonic foundry), `tables/photonics_uev.json`.
- D5-QPU-MAXP: `tables/spin_deposition.json`, `tables/tfln_femtosecond.json`, `tables/memories_cryostat.json`, `tables/photonics_uev.json`.
- D5-CAS-MAXP: the hot cell's spent-cask row in `server_scripts/grindless/maxplus/tarantula.js` (a MAX+ file).

## 13. Licences

Nothing is imported. The processes are real (Siemens trichlorosilane and its tetrachloride hydrogenation, Smart Cut, FD-SOI back gates, flash anneal, CVD tungsten, CERN's AD and ELENA, microwave-to-optical transduction, tensegrity, droplet radiators, thermophotovoltaics, Li-6 neutron capture, the Ni-56 to Fe-56 decay chain, dilution refrigeration); the rest is the pack's own named or pack fiction, marked as such. GTNH, TJ and Gregicality stay ideas only (CREDITS.md); no Star Technology content is used. Proposed CREDITS line: none.

## 14. Risks

- **Cost curve:** six new OpV fab steps and the module stages raise the price of every OpV, MAX and MAX+ circuit, and through them the components (counts unchanged). The integrator's T2 cost gate must hold; if it does not, the circuit rows' counts are tuned before any factor.
- **Volume:** the band's bodies take about 30,000 OpV, 34,000 MAX and 60,000 MAX+ family casings. The casing rows are batch rows on automatable machines (4 per run), and the quests teach them before the structures that need them.
- **The Mirror Shell and the Hyperstargate** change their patterns at the end of the progression; their fixtures (the vent row, the dial and the crossing) are the T1 of their packages, and the Hyperstargate's 60-block height fills the forming band exactly.
- **EMI preview:** the data-cell design rests on the finding that the exact-limit data hatch is the cause; the fallback is named (section 8).
- **Merged lines change the charts:** until the chart packages land, the audit reads the old clusters; the lengths of section 1 are measured only after D5-CHARTS-*.
- **D4's parallel design** may change UXV rows the band crosses (section 12); a conflict is resolved by the orchestrator, not by either package.

