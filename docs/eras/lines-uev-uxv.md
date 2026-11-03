# Long process lines, multiblock scale and casing families, UEV to UXV (D4-LINES)

Design package D4-LINES (#290), 2026-11-03, for AGENTS.md principles 4 and 7 as the owner set them: depth first in every tier (principle 7, 2026-11-02), and multiblocks that grow with their tier and their use, whose body from UEV on is the era's own expensive casings (principle 4, 2026-11-03; `docs/quality/structures.md:34-88`). The owner delegated every decision on 2026-11-03, so each material choice is recorded as a **Decision** in section 7, with the options weighed and the reason.

Sources:
- Research: `docs/research/long-lines.md`, band 3 (U-1 to U-8).
- Existing content: every recipe, structure, count and cost named here as existing was read from the batch dump `5d57213f3b83` on the VM:
  - line audit and structure metrics: exec run at c6ffcd61c;
  - the cost-matrix model (`priceDump`), structure bills of materials and active-block counts: exec-20261103-064744-2985814.
- "New" marks what this design adds. Nothing under `pack/` or `tools/` changes in this package; the implementation packages are in section 12.

## 0. How the steps are counted

The rules are D1's (`docs/eras/lines-steam-hv.md:5-12`):
- **Step:** one machine recipe that makes a new species, or a new part in a manufacturing line: a wafer after a deposition, an etch or a transfer, a die after dicing, a packaged chip.
- **Not steps:** packaging into blocks, dust, ingot, plate, wire and foil changes, melting, freezing, recycling, and records (a census, a chart, a model). A kept (non-consumed) input is never a step.
- **Length:** the longest dependency chain from base resources. A drill, rig, collector, lift or skimmer output is the base resource. The end product of another line counts as a raw input (a crossing).

Three staged streams matter in this band. Each stage counts from its own start, as the platline's HV stage counts from its MV ore (D1-AUDIT's staged-line feature, `extends`):
- **The circuit lines branch off the MV silicon line M2 at the Czochralski boule.** The boule is an M2 intermediate, not its end product: M2 ends at the HV circuit (`lines-steam-hv.md:138-158`). Six steps come from M2: SiO2, metallurgical Si, trichlorosilane, distilled trichlorosilane, polysilicon, boule. UXV's Si-28 instead branches off at M2's metallurgical silicon, which the IV hot cell enriches (`tables/hot_cell.json:146`).
- **The superheavy ladder continues the actinide stream.** IV, ZPM, UV and UHV keep material for it: UV's heavy curium oxide, "kept for UHV" (`pl-data-uhv.mjs:34`), and UHV's berkelium-249, "the next target" (`:43`). These are sub-products kept for the next stage, as M1's platinum slag is.
- **The UIV optical mainframe consumes the UEV quantum photonic chip.** The chip is an intermediate of E1 (E1 ends at the optical computer), and the UIV tensor core already takes it today (`tables/photonics_uev.json:191-193`).

Guide (#290): longest line about UEV 26, UIV 28 and UXV 30, shaped to the progression and never padded. Lines under 4 steps are not lines and leave the charts.

## 1. Summary

### Lines

Steps are each line's length, its longest path from base resources (section 0).

| Era | Line | Steps | Status |
|---|---|---|---|
| UEV | E1 The quantum photonic fab: sand to the optical computer | 25 (from the FZ boule 18) | monolithic wafer; merges 5 chains (SNSPD, hBN emitter, graphene modulator, QD source, optical computer) |
| UEV | E2 Superheavy ladder I: uraninite to tennessine and the census | 19 | staged from IV; merges 5 chains (Ca-48 beam, flerovium, Cf-249 wheel, tennessine, membranes) |
| UEV | E3 Barnard b: rhenium superalloy to the DFD Mk2, iron to the UEV motor | 13 | merges 5 (turbine wheel, YSZ, Hf, Ta, Fe16N2); 6N Hf enters the SX alloy |
| UEV | E4 The UEV body: silane to SiC/SiC, carbonitride and the casings | 11 | merges 4 (SiC/SiC, HfTaCN, Wf/W, Nb3Sn cavity); ends in the family casings |
| UEV | E5 Diamond anvils to the superhydride and its magnets | 8 | merges superhydride and ammonia borane; ends in the magnet casing |
| UEV | E6 The X-ray timing payload: SDD and lobster-eye optics | 12 | merges 2 (SDD, MCP) |
| UEV | E7 The entanglement repeater: PPKTP, TGG and hollow-core fibre | 8 | merges 4 (KTP, TGG, SPDC, hollow-core fibre); the poled KTP wafer gets its consumer |
| UEV | E8 Alpha Centauri's dust: aerogel to the iron-60 grains | 8 | merges 2 (aerogel, Fe-60) |
| UEV | E9 Mk4 fuel: nebula gas to polarised D-He-3 | 7 | merges the nebula gas front; was 3 |
| UEV | E10 CNT muscles to the UEV arm | 7 | as built |
| UEV | E11 The ULE cavity | 5 | as built; now also feeds the photonic casing |
| UIV | I1 The optical mainframe | 28 | staged through E1's chip; merges 7 (EO transceiver, glass interposer, BEUV ASIC, PCM crossbar, microcomb, P:Si, memories as feeders) |
| UIV | I2 Superheavy ladder II: elements 119 and 120 | 17 | staged; merges 2 |
| UIV | I3 The UIV body: metallic hydrogen and RHEA to the Mk5 wall and the casings | 11 | merges 5 (MH coil, RHEA plate, first wall, divertor, impeller) |
| UIV | I4 Neutron star matter | 7 | merges 3 (neutronium, kilonova, tether) |
| UIV | I5 Positronium to the gamma laser | 8 | merges 3 (gamma cavity, Ps cooling laser, gamma mirror) |
| UIV | I6 The Matrioshka node | 7 | merges 5 (AQFP, TPV, selective emitter, droplet radiator, 5D crystal) |
| UIV | I7 Mk5 fuels | 8 | as built (L26 and the He-3 return) |
| UIV | I8 The Penrose sled | 8 | merges 2 (sled, polymeric nitrogen) |
| UIV | I9 The UIV movers | 10 | merges 5 (UIV motor, GdBCO, maglev conveyor, lonsdaleite bearing, BMG gear) |
| UIV | I10 The nuclear clock to the UIV sensor | 10 | staged from UV's uranium-233; merges 2 |
| UXV | X1 The spintronic wafer: sand to the spintronic mainframe | 29 | monolithic wafer; merges 17 chains (targets, wafers, flakes, garnets as feeders) |
| UXV | X2 The SHeQUID gyroscope to the UXV sensor | 12 | MTJ die branch from the Si-28 wafer |
| UXV | X3 Superheavy ladder III: the island chart and elements 121 and 122 | 19 | staged; merges 6 |
| UXV | X4 The stellar burning sequence: CNO to silicon-28 | 11 | merges 4 (lines 26 to 29), each fuel from the ash before |
| UXV | X5 The disk and the field-reversed rings | 4 | merges 2 (lines 30, 31); the MH winding is a worn tool, not a step |
| UXV | X6 Nuclear pasta to the cable, the plate and the hull | 4 | merges 4 (32, 33, 35, 39) |
| UXV | X7 The UXV movers | 11 | merges 5 (motor, piston, conveyor, gear, encoder) |
| UXV | X8 Cassiopeia A to the gamma-ray emitter | 9 | as built |
| UXV | X9 Power chips to the UXV hull | 8 | merges 3 (Ga2O3, Finemet, mu-metal) |
| UXV | X10 The CNT Whipple shield | 5 | as built |

Against the audit baseline (era: chart lines, real lines, longest), and leaving aside short records and site taps:

| Era | Before | After |
|---|---|---|
| UEV | 31, 23, 9 | 11 lines, longest 25 and 19 |
| UIV | 39, 39, 7 | 10 lines, longest 28 and 17 |
| UXV | 46, 46, 8 | 10 lines, longest 29 and 19 |

The near-identical clusters (#230) become trunks with feeders. Each feeder keeps its own steps, but it is drawn, taught and counted as a branch of its line, never as a line of its own.

### Multiblocks (section 8)

| Era | Before: count, median cells | After: count, median target | Flagships | Halls |
|---|---|---|---|---|
| UEV | 26, 349 | 24, 825 | Mk4 ring, the superheavy factory | calutron, photonic integration hall, degenerate works, stellar forge |
| UIV | 23, 491 | 22, 1,100 | Mk5 ring, Matrioshka computer, Penrose engine | pulser, BEUV scanner, neutron drip works, compression hall |
| UXV | 22, 454 | 17, 1,400 | Mk6 ring, MNT collider, stellar elevator | spintronic cluster tool, BZ dynamo, pasta mill, fractionation hall |

- **Six physical merges remove eight controllers** (section 7, D4-4).
- **Every structure fits the forming sweep's band**, 60 wide x 60 high x 124 deep (`tools/test/zones.json:143`). The tallest is the stellar elevator (57) and the deepest the MNT collider (91).
- **Twelve structures are above about 2,300 blocks, so GTM's Terminal builds them in two passes** (their quests say so).

### Casing families (section 9)

| Era | Structural | Field | Optical | Thermal or cryogenic | Containment | Signature |
|---|---|---|---|---|---|---|
| UEV | `sic_composite_casing` (new) | `superhydride_magnet_casing` (new) | `photonic_casing` (UEV only now) | `hftacn_lining_casing` (new) | `degenerate_containment_casing` | `uev_fusion_casing` (Mk4) |
| UIV | `rhea_casing` (new) | `mh_field_casing` (new) | `multilayer_optics_casing` (new) | `dilution_cryostat_casing` (new) | `neutron_star_site_casing` (UIV only now) | `uiv_fusion_casing` (Mk5), `droplet_radiator_module` (Matrioshka) |
| UXV | `gum_metal_casing` (new) | `pulsed_field_casing` (new) | `mu_metal_shield_casing` (new; magnetic shielding) | none (no process needs it) | `pasta_containment_casing` (new) | `uxv_fusion_casing` (Mk6) |

Eleven new blocks; five existing casings get new recipes (photonic, degenerate containment, neutron-star site, and the Mk5 and Mk6 fusion casings).

## 2. UEV

### E1 The quantum photonic fab: sand to the optical computer (25; from the FZ boule 18)

Today the quantum photonic chip (`tables/photonics_uev.json:184-187`) is a bag of parallel parts made on separate wafers and joined in one step:
- a waveguide circuit;
- a SNSPD (UEV line 18, from its own FZ wafer);
- a QD source;
- an SDD;
- a graphene modulator;
- an hBN emitter chip.

Real integrated quantum photonics builds them on one wafer, in sequence, on the silicon nitride platform:
- **Detectors:** waveguide-integrated nanowire detectors (Pernice 2012).
- **Modulators:** graphene modulators on SiN rings (Phare 2015).
- **Sources:** quantum dots transfer-printed onto SiN (Davanco 2017).

E1 is that flow. The discrete SNSPD, QD source and graphene modulator stay as branches, because the repeater, the UEV sensor and emitter, the pulsar station and the controllers use them (consumers in the dump).

| # | Machine (tier) | In → out | Process |
|---|---|---|---|
| 1-6 | M2 (MV, HV), as built | sand → SiO2 → metallurgical Si → trichlorosilane → distilled → polysilicon → `gtceu:silicon_boule` | Siemens and Czochralski |
| 7 | Zone refining tower c4 (UV), as built | boule + Ar → `fz_silicon_boule` | float-zone refining |
| 8 | Cutter, as built | → 8 `fz_silicon_wafer` | wafering |
| 9 | EBF 1,800 K, as built | + O2 → `oxidised_wafer` | 8 µm wet oxide, the lower cladding |
| 10 | Chemical reactor, as built (`sin_lpcvd`) | SiH2Cl2 + NH3 → `sin_coated_wafer` | LPCVD SiN |
| 11 | Synchrotron c6 (UV), as built | → `sin_lithographed_wafer` | X-ray lithography |
| 12 | Chemical reactor, as built (`sin_etch`) | → `sin_etched_wafer` | reactive ion etch |
| 13 | Photonic foundry (UHV), as built | → `annealed_sin_chip` | 1,200 °C anneal, H out |
| 14 | Photonic integration hall c1, as built | + `lnoi_wafer` (UHV) → `waveguide_circuit` | LN bonded on SiN: electro-optic phase shifters |
| 15 | SNSPD foundry, new circuit | + tungsten silicide (F1 material) → `wsi_waveguide_wafer` (new) | WSi sputtered on the waveguides |
| 16 | SNSPD foundry, new circuit | + HSQ resist (the line-18 row's) → `detector_waveguide_wafer` (new) | e-beam written and etched nanowires on the waveguides |
| 17 | vdW stacker, new circuit | + `graphene_film` (feeder) → `graphene_ring_wafer` (new) | graphene transferred onto the ring resonators |
| 18 | vdW stacker, new circuit | + `annealed_hbn_film` (feeder) → `encapsulated_ring_wafer` (new) | hBN encapsulation |
| 19 | Photonic foundry (UHV), new row | + gold and titanium foil → `electroded_photonic_wafer` (new) | Ti/Au contacts and TiN thermal phase shifters |
| 20 | vdW stacker, new circuit | + `micropillar_wafer` (feeder) → `hybrid_quantum_wafer` (new) | InAs QD micropillars transfer-printed onto the waveguides |
| 21 | MOCVD (UV), new row | + SiH4 + O2 → `clad_quantum_wafer` (new) | PECVD SiO2 upper cladding |
| 22 | Cutter, new row | → 4 `quantum_photonic_die` (new) | dicing |
| 23 | Photonic integration hall, new circuit | + `gtceu:optical_pipe` fibre array → `pigtailed_quantum_die` (new) | fibre-array attach |
| 24 | Photonic integration hall c2, changed | + superfluid He charge (UV cold, kept) → `quantum_photonic_chip` | cryopackaging with the detector readout |
| 25 | Photonic integration hall c3, as built | + `gtnn:optical_assembly` → `gtnn:optical_computer` | final assembly (UEV circuit) |

The feeders are branches, and each is shorter than the trunk where it joins:
- **Graphene** (UEV line 20, as built): copper foil → electropolished → CVD graphene → PMMA-coated → transferred → `graphene_film`.
- **hBN:** boric acid → trimethyl borate → NaBH4 → ammonia borane → borazine → hBN on Cu → hBN film → `annealed_hbn_film`.
- **QD:** indium → 7N In → InAs QD wafer (UHV MBE) → `micropillar_wafer`.

Changes:
- **Removed:**
  - the QPC assembly row (waveguide circuit + QD source + SNSPD + SDD + graphene modulator + hBN emitter chip);
  - `grindless:hbn_emitter_chip` and its `vdw_assembly` row: the QPC was its only consumer, and the hBN film is now consumed on the wafer.
- **Kept:** the discrete `snspd`, `qd_source` and `graphene_modulator` for their other consumers, which are 7, 3 and 2 (dump).

Byproducts: the cutter's kerf goes to silicon stock; spent HSQ developer is neutralised and voided (inert); the transfer copper returns to the graphene branch as built. Voltage: UHV at the SNSPD foundry, vdW stacker and hall, the voltage they run at today (`uev.md:237`).

### E2 Superheavy ladder I: uraninite to tennessine and the census (19, staged)

Real superheavy elements come from targets bred along the actinide ladder in high-flux reactors and hit by a calcium-48 beam:
- tennessine from ORNL's berkelium-249 at Dubna (2010);
- flerovium from plutonium-244.

The pack already runs the ladder across five eras. E2 names it as one staged line and draws the stages as one chart.

| # | Machine (era) | In → out | Process |
|---|---|---|---|
| 1 | Hot cell c1 (IV) | uraninite (ISR wellfield, the base) + HF → U-235, U-238 | enrichment |
| 2 | Fuel fabrication (IV) | → `leu_pellet` (+ Zircaloy tubes) | pelletising |
| 3 | Fuel fabrication (IV) | → `leu_fuel_assembly` | rodding |
| 4 | Fission reactor (IV) | → `spent_fuel_assembly` | burn-up breeds Pu, Am, Cm |
| 5 | Hot cell c3 (IV) | + HNO3 → Pu, U + `gtnn:radioactive_waste` | PUREX |
| 6 | Waste retrieval plant (ZPM) | waste → `actinide_raffinate` | retrieval |
| 7 | Actinide partitioning c1 (ZPM) | → `minor_actinide_strip` | actinide strip |
| 8 | Actinide partitioning c2 (ZPM) | → `curium_oxide` (+ Am, synroc) | Am/Cm split |
| 9 | Heat source works (UV) | → Cm-244 pellets + `heavy_curium_oxide` (kept for UHV) | the heavy cut |
| 10 | Transuranium facility (UHV) | → `transcurium_target` | target fabrication |
| 11 | High flux reactor (UHV) | → `irradiated_transcurium_target` | HFIR campaign |
| 12 | Transuranium facility (UHV) | → `transcurium_liquor` | dissolution |
| 13 | Transuranium facility, HDEHP (UHV) | → `californium_252` + `berkelium_249` (kept for the next target) | Bk/Cf separation |
| 14 | As built (UEV) | Bk-249 + HNO3 → `berkelium_nitrate` | dissolution |
| 15 | As built (UEV) | → `berkelium_oxide_dust` | calcination |
| 16 | Hot cell, as built | → `target_wheel` | molecular plating on Ti foil |
| 17 | Superheavy factory (the heavy-ion cyclotron), c3 as built (`superheavy.json:43`) | + `ca48_beam` → tennessine recoil gas | fusion-evaporation |
| 18 | Superheavy factory, separator side, c3 as built (`:239`) | + `etched_membrane` → `tennessine_atoms` | gas-filled recoil separation |
| 19 | Superheavy chemistry lab c1 | + `aerogel_tile` catcher → `tennessine_sample` | thermochromatography; stored for the gate |

Branches, each shorter than the trunk:
- **Calcium-48 beam** (8): CaCl2 → calutron (40 %) → re-chlorinated → calutron (97 %) → Ca metal → crucible load → oven charge → plasma bunch → beam.
- **Plutonium-244 to flerovium** (16 from the base, branching at step 5): PuO2 target → HFIR → Pu nitrate → Pu-242-rich oxide → PuCl3 → Pu-244 (calutron) → oxide → plating ampoule → target → recoil gas → atoms.
- **Cf-249 wheel to oganesson** (17 from the base, branching at step 13): Bk-249 aged to Cf-249 in the hot cell (real β decay, 330 d) → wheel → recoil gas → atoms.
- **Ion-track membranes** (3, a feeder): polycarbonate foil → tracked foil → etched membrane.
- The Lv and Mc atoms come by their own targets, as built.

The superheavy census (Fl, Lv, Mc, Og atoms + gold foil) is a record, not a step. It has no consumer today. Census II now keeps it (D4-3).

Byproducts as built: activated wheels go to the hot cell; depleted calcium goes to stock; fission products go to the synroc line, contained.

### E3 Barnard b: the rhenium superalloy to the DFD Mk2, the iron to the UEV motor (13)

The carbonyl refinery splits Barnard rock in two streams, the real Mond process: iron as Fe(CO)5, and a residue that holds the platinum metals and rhenium. Today they are drawn as six chains: rhenium, the SX blade, YSZ, Hf, Ta and iron pentacarbonyl, which is a one-step chain. E3 joins them.

The rhenium path (10):

| # | Machine | In → out | Process |
|---|---|---|---|
| 1 | Carbonyl refinery (UEV) | Barnard core rock (core drill, the base) + CO → `iron_pentacarbonyl` + `barnard_residue` | Mond carbonylation |
| 2 | Platinum plant (EV), as built | residue → `gtceu:rhenium_ingot` (Os, Ir, Pt to the plant's own cuts) | digest and APR route |
| 3 | Electron beam furnace (UEV) | → `six_n_rhenium` | EB zone refining |
| 4 | Electron beam furnace, changed row | 6N Re + Ni + Ru + 6N Ta + **6N Hf (new input)** → `sx_master_alloy_dust` | master melt (CMSX-4 carries about 0.1 % Hf against grain-boundary cracking) |
| 5 | Single-crystal foundry | → `sx_blade` | Bridgman casting with a seed |
| 6 | Electron beam furnace | → `heat_treated_sx_blade` | solution and ageing |
| 7 | As built | + Pt-Al (EV platinum plant) → `bond_coated_sx_blade` | bond coat |
| 8 | Electron beam furnace | + `ysz_ingot` → `coated_sx_blade` | EB-PVD thermal barrier |
| 9 | Single-crystal foundry | → `brayton_turbine_wheel` | wheel casting |
| 10 | Thruster works (UV), as built | → `dfd_mk2_motor` | the Brayton loop of a direct fusion drive (Princeton PFRC concept) |

The longest path runs through hafnium (13), as built:

| # | Product | Machine |
|---|---|---|
| 1 | `zr_hf_chloride_dust` | from zircon, `electron_beam.json:226` |
| 2 | `hafnium_chloride_dust` | MIBK split |
| 3 | `hafnia_dust` | |
| 4 | `hafnium_tetrachloride_dust` | |
| 5 | `hafnium_sponge` | Kroll |
| 6 | `six_n_hafnium` | EB |
| 7 | the SX alloy | |
| 8 | blade | |
| 9 | heat treatment | |
| 10 | bond coat | |
| 11 | YSZ coat | |
| 12 | the wheel | |
| 13 | the DFD Mk2 | |

Branches:
- **Tantalum** (5 to the alloy): tantalite → fluoride cake → K2TaF7 → Ta powder → `six_n_tantalum`.
- **Iron to the UEV motor** (7): Fe(CO)5 → carbonyl iron powder → reduced powder → `fe16n2_dust` (nitride magnet works) → strain-annealed → bonded magnet → UEV motor.

Byproducts: CO goes back to step 1; Os, Ir and Pt go to the EV platinum plant (as built); casting gates are remelted.

### E4 The UEV body: silane to SiC/SiC, carbonitride and the casings (11)

The UEV family casings (section 9) are the products this line exists for. They join the four chains the UEV hull, the Mk4 wall and the cavities already used.

| # | Machine | In → out | Process |
|---|---|---|---|
| 1 | Chemical reactor (GTM), as built | methanol + HCl → chloromethane | |
| 2 | Chemical reactor (GTM) | + silicon → dimethyldichlorosilane | Rochow-Müller |
| 3 | As built (`composites.json:157`) | + sodium → `polydimethylsilane_dust` (+ salt) | Wurtz coupling |
| 4 | As built (`composites.json:159-160`) | → `polycarbosilane_dust` (CH4, H2 out) | Kumada rearrangement |
| 5 | SiC fibre plant c1 | → `green_sic_fibre` | melt spinning |
| 6 | SiC fibre plant c2 | → `cured_sic_fibre` | electron-beam curing |
| 7 | SiC fibre plant c3 | → `sic_fibre` (CH4, H2 to the pyrolyser) | pyrolysis (Hi-Nicalon S) |
| 8 | BN reactor (UV), as built | → `bn_coated_sic_fibre` | BN interphase |
| 9 | Assembler, as built | → `sic_fibre_preform` | weaving |
| 10 | CVI furnace | → `sic_sic_plate` (HCl to the cascade) | chemical vapour infiltration |
| 11 | CVI furnace, new circuit | plates + preforms + 6N Ta → `sic_composite_casing` (new) | sandwich casing densified in place |

The thermal branch (8):

| # | Product | Machine |
|---|---|---|
| 1-3 | zircon → … → `hafnia_dust` | as E3 |
| 4 | `hftacn_crude_dust` | with Ta2O5, carbothermal (`composites.json:151`) |
| 5 | `hftacn_powder` | |
| 6 | `gtceu:hftacn_ingot` or the new `hftacn_lining_casing` | the casing from the powder |
| 7 | heating element | |
| 8 | `hftacn_coil_block` | |

The longest path is the silane branch above (11, from methanol).

Branches:
- **Wf/W** (5): tungsten dust → ingot → wire → coated wire → preform → CVI tile, to the Mk4 casing.
- **Nb3Sn cavity** (5 from Nb powder): RRR sheet → cavity → Sn diffusion, kept by the cyclotron and calutron rows.

### E5 Diamond anvils to the superhydride and its magnets (8)

| # | Product | Machine |
|---|---|---|
| 1 | `nanodiamond_dust` | from methane, the ZPM CVD row (`zpm/qubits.js:119`) |
| 2 | the hydrogen-treated product | megabar press (`megabar.json:81`) |
| 3 | onion carbon | EB (`electron_beam.json:24`) |
| 4 | `nanodiamond_pellet` | megabar press (`megabar.json:91`) |
| 5 | `nanotwinned_diamond` | megabar press (`megabar.json:11`) |
| 6 | the anvil | |
| 7 | `lay_superhydride_ingot` | the press, with the La–Y foil and the ammonia borane charge |
| 8 | the new `superhydride_magnet_casing` | |

Ammonia borane is the real hydrogen source of diamond-anvil syntheses.

The ammonia borane feeder (5): boric acid → trimethyl borate → NaBH4 → ammonia borane → pressed charge. The wire is GTM's form change and not a step. Fiction stays named: the real (La,Y)H10 needs over 100 GPa.

### E6 The X-ray timing payload: SDD and lobster-eye optics (12)

The pulsar timing station times pulsars with a silicon drift detector behind lobster-eye micropore optics, as NICER-class X-ray timing instruments do.
- **SDD:** M2's boule, then the FZ boule (7), wafer (8), oxidised (9), drift rings implanted (10, ZPM ion implanter), annealed (11) and the metallised `sdd` (12).
- **MCP** (7): lead glass → etchable-core tube → multi-fibre (UV draw tower) → fused boule → sliced plate → etched → reduced → `lobster_eye_mcp`.
- Both end in the station's timing survey. The navigation chart is a record.

### E7 The entanglement repeater: PPKTP, TGG and hollow-core fibre (8)

Today the SPDC source takes PPKTP as two dusts (`earth_orbit.json:184`), while the poled KTP wafer the KTP chain makes has no consumer at all (`uev.md`, "stays isolated"). A real SPDC source needs the poled crystal, not powder. **Change (D4-LINKS):** the SPDC row takes 1 `ktp_electroded_wafer` instead of the 2 `ppktp_dust`.

| Branch | Steps to the SPDC source | Chain |
|---|---|---|
| KTP | 5 | KH2PO4 → KTP flux → boule (UHV crystal growth) → wafer → electroded and poled wafer → `spdc_source` |
| TGG | 7 | Tb and Ga oxides → co-precipitated hydroxide cake → TGG powder (calcined, `earth_orbit.json:84`) → boule → rod → polished rod → `faraday_isolator` → `spdc_source` |

The `quantum_repeater_node` (entanglement station) follows the SPDC source, with the QD source, an SNSPD and the hollow-core fibre: SiO2 → `fused_silica_tube` (`earth_orbit.json:86`) → capillaries → stacked preform → caned → drawn → `hollow_core_fibre` (6), then the node (7).

The longest path runs through TGG: 8.

### E8 Alpha Centauri's dust: aerogel to the iron-60 grains (8)

| # | Product | Machine |
|---|---|---|
| 1 | TEOS | from SiCl4 |
| 2 | sol | |
| 3 | wet gel | |
| 4 | aged gel | |
| 5 | `aerogel_tile` | |
| 6 | dust-laden aerogel | nebula collector |
| 7 | extracted grains | dust lab |
| 8 | demineralised grains | dust lab |

The iron-60 record that follows is a record, not a step. It feeds the pulsar navigation chart, as built.

### E9 Mk4 fuel: nebula gas to polarised D-He-3 (7)

The nebula collector's interstellar gas is the base. It is compressed (1), then the cryogenic plant takes the helium fraction (2), helium-3 (3, UV superfluid flush) and 6N He-3 (4, EV). The polariser makes polarised He-3 (5, MEOP at 1,083 nm). The polarised D-He-3 fuel (6) burns in the Mk4 ring; the DEC gives power and He-4 ash (7) goes to stock. Today the chart starts at 6N He-3 from the EV line (3 steps, not a line). The Moon and Saturn routes to He-3 stay as alternative sources.

### E10 CNT muscles to the UEV arm (7, as built)

Methane → CNT sock → ribbon → densified → annealed → sized → twisted → `cnt_coiled_muscle` → UEV robot arm. Unchanged.

### E11 The ULE cavity (5, as built)

| # | Product | Note |
|---|---|---|
| 1 | ULE soot | flame hydrolysis of SiCl4 + TiCl4 |
| 2 | `ule_boule` | |
| 3 | spacer | |
| 4 | mirrored spacer | |
| 5 | `ule_cavity` | with the LuV sapphire test mass as reference |

The cavity serves the quantum gas lab's rows and the UEV hull and hatches. The ULE boule now also feeds the photonic casing (section 9).

### Short by design (not lines)

- **The degenerate EOS model:** two calutron runs and one model; it stays a quest.
- **The relay seed:** Sirius B's pellet seated in a starchip.

Both keep their quests.

## 3. UIV

### I1 The optical mainframe (28, staged through E1's chip)

Today's mainframe already uses the UEV quantum photonic chip:
- the tensor core takes it with the BEUV driver ASIC and four thin-film LN modulators;
- the mainframe takes the core with a PCM crossbar on a glass interposer, a six-hour memory and a P:Si processor (`photonics_uev.json:191-197`).

The real photonic tensor core (Feldmann 2021) puts phase-change cells on silicon nitride waveguides and feeds them from a soliton microcomb, so the comb belongs inside the core. Single-photon detection of its outputs is the low-power readout of later optical neural networks (Wang 2022). I1 makes the integration sequential:

| # | Machine (tier) | In → out | Process |
|---|---|---|---|
| 1-24 | E1 | sand → `quantum_photonic_chip` | as E1 |
| 25 | Photonic integration hall, new circuit | chip + `crossbar_on_interposer` → `photonic_compute_module` (new) | 2.5D bonding on the fs-written glass interposer; its written waveguides couple the two dies |
| 26 | Photonic integration hall c4, changed | + `beuv_driver_asic` + 4 `thin_film_ln_modulator` → `photonic_tensor_core` | driver ASIC flip-chip and the EO input modulators |
| 27 | Photonic integration hall, new circuit | + `eo_microcomb` → `comb_fed_tensor_core` (new) | the soliton comb as the core's multi-wavelength source |
| 28 | Photonic integration hall c5, changed | + `six_hour_memory` + `p_si_processor` + `gtnn:optical_assembly` + 2 UEV circuits → `gtnn:optical_mainframe` | final assembly (UIV circuit); the crossbar input moves to step 25 |

Feeders, each shorter than the trunk where it joins:

| Feeder | Steps | Chain |
|---|---|---|
| PCM crossbar on the glass interposer, UIV lines 12 and 17 | 7 | Li + Nb2O5 → LN boule (UHV crystal growth) → wafer → He-implanted (ZPM implanter) → LNOI → PCM die (photonic foundry c2) → crossbar → on the interposer (`assembler/crossbar_on_interposer`). The interposer itself (6): Si → SiCl4 → ULE soot → boule → fs-written (femtosecond writer) → KOH-etched → `glass_interposer` |
| BEUV driver ASIC, the beuv cluster | 6 | zircon → Zr-Hf chloride → hafnium chloride → hafnia (E3's branch) → `hfo2_resist_wafer` → `beuv_exposed_wafer` (Tb droplet source, BEUV scanner) → `beuv_driver_asic` |
| EO microcomb, UIV line 18 | 13 | M2 → FZ wafer → oxide → X-ray-trenched (synchrotron c7) → damascene SiN → annealed ring → `eo_microcomb` (TFLN fab c4). The microcomb gains this consumer besides the UIV sensor |
| P:Si processor, UIV line 11 | 11 | sand → SiO2 → Si → Si-28 (IV hot cell) → FZ ingot → H-implanted → SOI (TFLN c2) → H-terminated → STM-patterned → PH3-dosed and overgrown (MBE) → `p_si_processor` (millikelvin cryostat works c3) |
| Six-hour memory, UIV line 15 | 7 | Eu2O3 → Eu-151 (calutron) → Eu:YSO boule → slab → hole-burned → cryostat module → memory |

Byproducts as built: PH3 is scrubbed to H3PO4; spent GST is remelted; Tb debris is recovered by the scanner's cleaning circuit.

### I2 Superheavy ladder II: elements 119 and 120 (17, staged)

| # | Machine | In → out | Process |
|---|---|---|---|
| 1-13 | E2 | uraninite → `berkelium_249` | as E2 |
| 14 | Hot cell decay store, as built | → `californium_249_dust` | Bk-249 β decay (330 d) |
| 15 | As built | → `cf249_target_wheel` | wheel loading |
| 16 | Superheavy factory c7, as built (`superheavy.json:105`) | + `ti50_oven_charge` (Nb3Sn cavity kept) → element 120 recoil gas + activated wheel | titanium-50 beam |
| 17 | Superheavy factory, separator c6, as built | + `etched_membrane` → `element_120_recoil` | recoil separation |

Branches:
- **Titanium-50** (4): TiCl4 → Ti-50 chloride (calutron) → sponge (UV pyroprocessing) → melted (levitation melter) → oven charge.
- **Element 119** (9, staged from IV): U-238 target → neutron flash (r-process decompressor c2, Ivy Mike) → Es/Fm debris (hot cell) → actinide cut (ZPM) → Es-254 (UHV transuranium) → target → recoil gas → `element_119_recoil`.

Census II (119 + 120 + sealed capsule) is a record. It now keeps census I as a non-consumed reference (D4-3).

### I3 The UIV body: metallic hydrogen and RHEA to the Mk5 wall and the casings (11)

| # | Machine | In → out | Process |
|---|---|---|---|
| 1 | EV extraction cascade | tantalite → `tantalite_fluoride_cake` | HF digest |
| 2 | EV extraction cascade c9 | → `niobium_oxyfluoride_dust` | MIBK split |
| 3 | As built | → `niobium_powder` | reduction |
| 4 | Electron beam furnace (UEV) | + 6N Ta → `nb_ta_button` | EB melting |
| 5 | Levitation melter | + W, Mo, Hf → `gtceu:rhea_ingot` | containerless melting of the WMoNbTaHf alloy |
| 6 | Hot strip mill (EV) | → `rhea_slab` | hot forging |
| 7 | Hot strip mill | → `gtceu:rhea_plate` | rolling |
| 8 | Assembler | → `rhea_former` | former machining |
| 9 | Assembler | + `mh_winding` → `wound_rhea_former` | winding |
| 10 | As built | → `impregnated_mh_coil` | vacuum impregnation |
| 11 | As built, and the new casing package | → `metallic_hydrogen_coil_block` or the new `mh_field_casing` | coil and magnet casing |

Branches:
- **Metallic hydrogen** (8 to the winding): protium → o/p-converted H2 → liquid para-H2 → solid target → MH (pulser) → quenched rod → wire → `mh_winding` (ZPM magnet works).
- **Mk5 wall** (10): RHEA ingot (5) → `wf_rhea_billet` (with UEV's W fibre preform) → plasma-sprayed tile → first-wall tile → Li-Sn armoured tile → `uiv_fusion_casing`. The divertor feeds the same casing.
- **Pump impeller** (5 from the AM powder): RHEA AM powder → printed → HIP → machined → balanced impeller → UIV pump.
- **The new `rhea_casing`:** from the RHEA AM powder, plates and Wf/RHEA billets (section 9).

### I4 Neutron star matter (7)

The crust lift's crust is the base. Two branches run from it:

| # | Neutronium branch | Machine |
|---|---|---|
| 1 | inner-crust matter | neutron drip works c1 |
| 2 | drip neutrons | |
| 3 | neutron superfluid | UV superfluid helium |
| 4 | caged neutronium | |
| 5 | `neutronium_pellet` | |
| 6 | UIV field generator | |

| # | Kilonova branch | Machine |
|---|---|---|
| 1 | crust nuclei | |
| 2 | decompressed nuclei | r-process decompressor |
| 3 | hot r-process mix | |
| 4 | sealed capsule | decay heat vault |
| 5 | aged capsule | |
| 6 | `r_process_ash` | |
| 7 | the actinide cut | hot cell `ash_actinide_cut` |

The crust lift tether (CNT yarn → BN-coated → MH-laminated → braided → MH tether → crust lift tether) is the lift's consumable, not a step of this line, as a drill bit is not.

### I5 Positronium to the gamma laser (8)

The pulsar wind trap's pair plasma is the base. It gives cooled positrons (1, UHV accumulator), Ps in aerogel (2), laser-cooled Ps (3), the Ps BEC (4, antimatter trap), the `gamma_laser_cavity` (5) and the UIV emitter (6).

The longest path is through the cooling laser (8): LNOI (UHV) → poled → PPLN waveguide → 486 nm SHG → `ps_cooling_laser`, which joins at step 3. Other feeders:
- the gamma Bragg mirror: C-12 diamond → HPHT → (004) cut → ion-milled;
- the neon moderator.

### I6 The Matrioshka node (7)

| Part | Steps | Chain |
|---|---|---|
| AQFP logic | 7 | Nb (EV cascade) → Nb target (SPS) → trilayer (MBE) → JJ wafer (SNSPD foundry) → AQFP die → module → `matrioshka_logic_tile` |
| TPV shell | 6 | InGaAsSb epi → air bridge → cell → tile (droplet radiator works) → segment → `matrioshka_tpv_shell` |
| Selective emitter | 5 | as built |
| Droplet radiator module | 6 | as built |
| 5D data crystal | 6 | as built |

The node is the computer's structure itself, so the parts are placed blocks and feeders of one line.

### I7 Mk5 fuels (8)

LiCl → Li-6 (calutron) → Li-6 metal (pyroprocessing) → Li-6H → polarised (proton source c2) → pellet → p-Li-6 fuel → Mk5 burn → He-3 ash → polarised He-3–He-3 fuel. The p–N-15 fuel is a branch. Protons return to the source.

### I8 The Penrose sled (8)

N2 → DAC charge → laser-heated → cg-N (pulser c3) → quenched (named fiction) → RHEA-cased charge → `sled_charge` → split-charge sled (probe bay c2, with the compacted waste canister) → recovered half-sled (Penrose drop). The ballast half falls into the hole. The canister branch: synroc (ZPM) → liner → canister (hot cell) → compacted (megabar).

### I9 The UIV movers (10, staged from E3's iron)

| # | Product | Machine |
|---|---|---|
| 1 | Fe(CO)5 | carbonyl refinery |
| 2 | carbonyl iron powder | |
| 3 | reduced powder | |
| 4 | strain-annealed Fe16N2 | nitride magnet works |
| 5 | bonded magnet | |
| 6 | Halbach array | |
| 7 | RHEA-cased Halbach | |
| 8 | potted MH stator | |
| 9 | maglev stator | |
| 10 | UIV conveyor | |

Feeders:
- **UIV motor:** the GdBCO bulk branch (5) and the UEV motor (L23, L123).
- **UIV piston:** the lonsdaleite bearing (4).
- **UIV arm:** the BMG strain-wave gear (6).

### I10 The nuclear clock to the UIV sensor (10, staged from UV)

UV's uranium-233 (its thorium line, about 4 steps, "keep some for UHV") gives thorium-229 in the transuranium decay store (5). Then come ThF4 (6, IV fluorspar kiln), the ThF4 film (7, UHV MBE), the capped film (8), the chip nuclear clock (9) and the UIV sensor (10, with the EO microcomb).

## 4. UXV

### X1 The spintronic wafer: sand to the spintronic mainframe (29)

Today the spintronic mainframe joins six parts (`photonics_uev.json:202`): a MESO logic die, a racetrack chip, an MRAM wafer, a magnonic bus, an MTJ die and a shielded interposer. Four of them start from their own isotopically pure silicon-28 wafer (UXV lines 6, 7, 8 and 44 each run the Si-28 prefix).

Real spintronic memory is built in the back end of one CMOS wafer: embedded MRAM is a stack of BEOL modules processed below about 400 °C. X1 builds the UXV chip as one monolithic 3D stack:
- the CMOS front end;
- the MRAM layer;
- the racetrack layer with its MTJ read heads;
- the spin-torque oscillators;
- the YIG magnonic bus, bonded die to wafer;
- the oxide magnetoelectric switches, grown on DyScO3 and transferred as freestanding membranes (Lu 2016);
- the van der Waals spin-orbit readouts.

One wafer replaces four, and the near-identical clusters become one long line.

| # | Machine (tier) | In → out | Process |
|---|---|---|---|
| 1-2 | M2 (MV) | sand → SiO2 → metallurgical silicon | carbothermic reduction |
| 3 | Hot cell c5 (IV), as built (`hot_cell.json:146`) | 4 Si + HF → `silicon_28_dust` + 3 Si back | SiF4 isotope enrichment |
| 4 | Zone refining c6 (UV), as built | → `si28_fz_ingot` | float zone |
| 5 | Cutter, as built | → `si28_fz_wafer` | wafering |
| 6 | Ion implanter c6 (ZPM), as built | → `h_si28_wafer` | hydrogen termination |
| 7 | MOCVD (UV), new row | + `hafnia_dust` (UEV E3) + TiCl4 + NH3 + ultrapure water (UHV) → `si28_cmos_wafer` (new) | high-k metal gate, the CMOS front end |
| 8 | Photonic foundry (UHV), new row | + tungsten + copper foil → `si28_m1_wafer` (new) | W contacts and the first Cu metal |
| 9 | Spintronic cluster tool c2 (the MTJ sputter cluster), input changed | + Heusler, MgO and Ta seed targets → `mram_stack_wafer` | Heusler/MgO MTJ stack |
| 10 | Nitride magnet works (UEV), as built | → `annealed_mram_wafer` | L2₁ anneal |
| 11 | Ion implanter (ZPM), as built | → `etched_mram_wafer` | ion-beam etch |
| 12 | Photonic foundry (UHV), as built (`mram_copper`) | → `mram_wafer` | Cu back end: the MRAM layer is done |
| 13 | Cluster tool c3, input changed | + `saf_target_set` → `saf_track_wafer` | synthetic antiferromagnet tracks over the MRAM |
| 14 | Nitride magnet works, as built | → `annealed_saf_wafer` | field anneal |
| 15 | Electron beam furnace (UEV), as built | → `written_track_wafer` | tracks written |
| 16 | Cluster tool, racetrack patterning c1, as built | → `patterned_track_wafer` | notch etch |
| 17 | Cluster tool, racetrack patterning c2, as built | + `mtj_die` read heads → `racetrack_chip` | read heads |
| 18 | Cluster tool c4, input changed | + Heusler and MgO targets → `stno_stack_wafer` | spin-torque oscillator stack |
| 19 | Electron beam furnace, as built | → `stno_defined_wafer` | pillars defined |
| 20 | Ion implanter, as built | → `stno_milled_wafer` | ion milling |
| 21 | As built | → `stno_clean_wafer` | post-mill clean |
| 22 | MOCVD (UV), as built | → `stno_planarised_wafer` | SiN planarisation |
| 23 | Photonic foundry, as built (`stno_contacts`) | → `stno_array` | Au contacts, phase-locked |
| 24 | Assembler, as built | + `yig_waveguide_wafer` + Pt antennas → `magnonic_bus` | YIG bus bonded die to wafer |
| 25 | vdW stacker (UEV; gains the UXV stacking type, section 8), new circuit | + `me_switch_wafer` → `me_on_spin_wafer` (new) + DyScO3 substrate back (80 %) | release and transfer of the BFO/CoFe membranes |
| 26 | vdW stacker, new circuit | + `sot_readout_stack` → `meso_spin_wafer` (new) | spin-orbit readout stacks transferred |
| 27 | Photonic foundry (UHV), new row | + copper and gold foil → `spintronic_wafer` (new) | MESO interconnect and passivation |
| 28 | Cutter, new row | → 4 `spintronic_die` (new) | dicing |
| 29 | Photonic integration hall c7, changed | die + `mtj_die` + `shielded_interposer` + 2 UIV circuits → `gtnn:spintronic_mainframe` | flip-chip on the mu-metal-shielded interposer |

Feeders, each joining after their own length:
- **Sputter targets:**
  - CoFeB 7, used by the MTJ die;
  - MgO 6;
  - Heusler 8;
  - SAF set 8;
  - Ta seed 7.
- **The magnetoelectric switch** (13): DyScO3 substrate (9) → SrRuO3 electrode → BFO film → CoFe → `me_switch_wafer`.
- **The van der Waals readout** (10): hBN, WTe2 and FGT flakes → heterostack → contacted → annealed `sot_readout_stack`.
- **The magnonic waveguide** (11): GGG wafer (8) → YIG film (LPE, in the Pt crucible) → annealed → `yig_waveguide_wafer`.
- **The shielded interposer** (8): mu-metal (7) on UIV's glass interposer.

Changes:
- **Removed:** `grindless:meso_logic_die` and its row; its two inputs now go to steps 25 and 26.
- **The mainframe drops** the MESO die, the racetrack chip, the MRAM wafer and the magnonic bus, which are all inside the die.
- **Kept:** `racetrack_chip` stays a product. MAX+'s racetrack 3D stack (`maxplus/ae2.js:35`) still consumes it, now a chip that also carries an MRAM layer.

Byproducts: target remnants go back to the targets' re-pressing (as built). Mill redeposit is remelted in the levitation melter (as built). The DyScO3 substrate returns to its polishing step; 20 % is kerf, re-melted.

### X2 The SHeQUID gyroscope to the UXV sensor (12)

| # | Product | Machine |
|---|---|---|
| 1-6 | X1's prefix to `h_si28_wafer` | |
| 7 | MTJ stack | cluster tool c1 |
| 8 | annealed | |
| 9 | etched | |
| 10 | `mtj_die` | UV MOCVD SiN cap and dicing |
| 11 | `shequid_gyro` | SHeQUID works c2, with He-II and the weak-link cell |
| 12 | `uxv_sensor` | with the NV diamond chip |

The weak-link branch: SiN membrane → back-etched → nanoaperture array (EB) → `weak_link_cell` (5).

### X3 Superheavy ladder III: the island chart and elements 121 and 122 (19, staged)

| # | Machine | In → out | Process |
|---|---|---|---|
| 1-13 | E2 | uraninite → `californium_252` | as E2 |
| 14 | Hot cell c8, as built (`hot_cell.json:184-191`) | → `gtceu:curium_248_dust` | Cf-252 α decay |
| 15 | Transuranium facility (UHV), as built | → `cm248_plated_blank` | molecular plating |
| 16 | Spark plasma sinterer, as built | → `cm248_target` | sintering |
| 17 | MNT collider c1, as built | + `u238_beam_charge` through the `gas_stopping_cell` → MNT product gas | multinucleon transfer |
| 18 | MNT collider c2 | → `mnt_thermal_ions` | thermalisation |
| 19 | MNT collider c3 | → `island_nuclide` | MR-TOF selection |

The island chart is a record.

Branches:
- **Element 122** (13): U-238 target → neutron flash → Es/Fm debris → actinide cut → Fm (UHV transuranium) → Fm-257 (calutron c10) → plated → target → gas → atoms → caught `element_122_recoil`.
- **Element 121** (12): the same chain to Es-254.
- **The U-238 beam** (4).

Census III is a record that keeps census II (D4-3).

### X4 The stellar burning sequence: CNO to silicon-28 (11)

The stellar elevator's lifted plasma is the base. Each fuel is made from the ash of the burn before (B²FH 1957; the ring is named fiction):

| # | Product | Machine |
|---|---|---|
| 1 | CNO cut | plasma mass filter c1 |
| 2 | `cno_ash_plasma` | Mk6 c1 |
| 3 | He-4 and the CNO catalyst back | ZPM DEC |
| 4 | `triple_alpha_fuel` | EV cryogenic plant, with the filter's helium cut |
| 5 | helium-burning ash plasma | Mk6 c2 |
| 6 | helium-burning ash | DEC |
| 7 | C-12 and O-16 | ZPM plasma quench caster |
| 8 | `oxygen_burning_fuel` | EV cryogenic plant |
| 9 | oxygen-burning ash plasma | Mk6 c4 |
| 10 | oxygen-burning ash | DEC |
| 11 | `si28_ash` | quench caster |

Carbon burning is a branch: C-12 → vapour-purified fuel (EB) → Mk6 c3 → ash → Ne-20, Na-23, Mg-24 to stock. Si-28 ash goes on to OpV's wafers: the extraction cascade's `si28_trichlorosilane` row is in OpV mode (`ev/extraction_cascade.js:273`), a crossing.

### X5 The disk and the field-reversed rings (4)

The skimmer's disk plasma is the base. It is filtered (1, mass filter c2), formed into the `frc_cartridge` (2, FRC former c1), wound into the strand coil (3) and built into the UXV field generator (4). The flux-loaded plasma (FRC c2) burns in the BZ dynamo: power, not a product. The MH winding is only worn by the skimmer, by chance (`cygnus_disk.json:11`), so it is a tool, not a step.

### X6 Nuclear pasta to the cable, the plate and the hull (4)

The pasta extractor's raw pasta is the base. The pasta mill (section 8) sorts it into `spaghetti_phase` and `lasagna_phase` (1):

| Branch | Steps | Chain |
|---|---|---|
| Spaghetti | 4 | caged and drawn `pasta_strand_single_wire` (2) → `strand_tape` (3, LuV coated conductor line) → `uxv_smes_cell` (4) |
| Lasagna | 4 | caged and pressed with a Wf/RHEA billet into `lasagna_plate` (2) → `alip_duct` (3, EV hot strip mill) → the UXV pump (4); the plate also gives the UXV hull (3) |

Gnocchi and anti-phases go to the r-process stock and the core sample, as built.

### X7 The UXV movers (11)

The longest branch is the gum-metal strain-wave gear (UXV line 45, as built):

| # | Product | Machine |
|---|---|---|
| 1 | fluoride cake | from tantalite |
| 2 | niobium oxyfluoride | |
| 3 | niobium powder | |
| 4 | 6N Nb | |
| 5 | gum metal blend (Ti-23Nb-0.7Ta-2Zr-O) | |
| 6 | billet | UV powder bed |
| 7 | blank | EV hot strip mill |
| 8 | cold-swaged cup | |
| 9 | hobbed flexspline | |
| 10 | `uxv_strain_wave_gear` | |
| 11 | the UXV robot arm | |

The other branches are as built:
- **Motor** (9): tetrataenite laminations and the strand stator.
- **Piston** (9): Terfenol-D.
- **Conveyor** (6): Ni-Mn-Ga.
- **TMR encoder** (7).

### X8 Cassiopeia A to the gamma-ray emitter (9)

| # | Product | Machine |
|---|---|---|
| 1 | ejecta knot dust | sweeper |
| 2 | Ti fraction | EV cascade |
| 3 | TiCl4 | |
| 4 | Ti-44 | calutron |
| 5 | sealed core | hot cell |
| 6 | moderated positronium | annihilation laser works c1 |
| 7 | positron stack | UV antimatter trap |
| 8 | `gamma_laser_module` | |
| 9 | the UXV emitter | |

### X9 Power chips to the UXV hull (8)

The Ga2O3 die is the longest branch (7, as built): gallium → Ga2O3 → EFG plate (iridium die) → slice → wafer → Sn-doped epitaxy (UV MOCVD) → gated (EB) → packaged `ga2o3_power_die`. The UXV hull (8) follows. Feeders:
- the Finemet voltage coil (6);
- the mu-metal shielded interposer (8, which goes to X1).

### X10 The CNT Whipple shield (5)

Methane → CNT sock → ribbon → densified yarn → `cnt_bumper_weave` (UHV tether works) → `cnt_whipple_shield`, spent at the warp gate's Cas A throw.

## 5. Crossings

### With UHV and below (D2 and D3 keep these as they are)

| Older line or machine | Era | Feeds |
|---|---|---|
| M2 silicon: the Czochralski boule (staged) | MV | E1, E6; I1 through E1 and its PCM and comb feeders; X1 and X2 through metallurgical silicon |
| The actinide stream: hot cell, fuel fabrication, reactor | IV | E2, I2, X3 (steps 1-5) |
| Waste retrieval, actinide partitioning (staged) | ZPM | E2, I2, X3 (steps 6-8); the Cf/Cm cuts |
| Heat source works: heavy curium oxide, "kept for UHV" | UV | E2, I2, X3 (step 9) |
| Transuranium facility and high flux reactor: Bk-249 "the next target", Cf-252 | UHV | E2, I2, X3 (steps 10-13); D3 must keep both kept outputs |
| LNOI wafer, photonic foundry, crystal growth, spark plasma sinterer, MBE, ultrapure water plant | UHV | E1 (14, 19), E4 (HfTaCN billet), X1 (7, 8, 12, 23, 27), the QD and flake feeders |
| Zone refining, synchrotron, MOCVD, superfluid helium, powder bed printer, BN reactor, fibre draw, pyroprocessing | UV | E1 (7, 11, 21, 24), X1 (4, 21), I3, E4, the RHEA casing |
| Ion implanter, naquadria magnet works, diamond lattice fab, DEC, quench caster, Eu reductor | ZPM | X1 (6, 11, 20), the superhydride magnet casing, E5, X4 |
| Platinum plant, extraction cascade, hot strip mill, cryogenic plant | EV | E3, I3, X4, X7, X9 |

The other half of A2-06 belongs to D3: `grindless:zpm_smes_cell` has no consumer either. By the ladder every cell from UHV up follows (section 10), the UV cell should be rewound from four ZPM cells. Today it is made from EnTED wire, darmstadtium and capacitors (`tables/magnet_works.json:52-57`).

### With OpV (D5)

| This band | OpV or above | Note |
|---|---|---|
| `uxv_smes_cell` | the OpV cell (`opv/wireless.js:22`) | becomes its input (section 10); package D4-SMES edits that one row |
| `si28_ash` (X4) | OpV wafers, through `ev/extraction_cascade.js:273` (OpV mode) | as built |
| `racetrack_chip` (X1, step 17) | MAX+ racetrack 3D stack (`maxplus/ae2.js:35`) | now carries an MRAM layer; nothing to change |
| `quantum_photonic_chip` (E1, step 24) | OpV and MAX rows `photonic_coprocessor`, `photonic_qpu` | same id, unchanged |
| Recipe types moved by the merges (`recoil_separation`, `pulsed_laser_deposition`, `racetrack_patterning`, `vdw_stacking`, `neutron_drip_separation`, `pasta_drawing`, `pasta_lamination`, `degenerate_containment`) | OpV census IV (elements 124 and 126 on `recoil_separation` c10 and c11); MAX+ rows on racetrack patterning c7 and MTJ c32 | rows follow their type to the surviving machine; no OpV or MAX+ edit |
| `neutronium_pellet`, `frc_cartridge`, `cage_part`, `lasagna_plate`, `mu_metal_foil` | many OpV rows | unchanged |
| The UXV casing family | OpV structures | UXV only; D5 gives OpV its own family |

## 6. Basic materials that change

| Material | Today | After | What it moves |
|---|---|---|---|
| FZ silicon wafers (UV) | each QPC part on its own wafer (SNSPD, SDD...) | one wafer carries the whole QPC; discrete SNSPD, QD and SDD wafers only for their other uses | fewer wafers per optical computer; the zone refining tower's UEV load falls |
| Silicon-28 (IV hot cell) | 4 Si-28 wafers per spintronic mainframe plus 1 for the MTJ die | 1 plus 1 | Si-28 per mainframe falls by about 60 % |
| Hafnium (UEV) | Hf for the coil, BEUV resist and the pump | adds the SX master alloy (6N Hf), the CMOS gate (hafnia) and the HfTaCN lining | zircon and the extraction cascade's MIBK cut run harder |
| SiC/SiC (UEV) | UEV hull, Mk4 casing, controllers | the structural casing takes 12 plates per 2 casings | a UEV workhorse body needs about 3,000 plates: the SiC fibre plant and CVI furnace become volume machines |
| (La,Y)H10 wire and Fe16N2 (UEV) | cable, motors | the magnet casing | Barnard iron runs at volume |
| ULE glass and hollow-core fibre (UEV) | cavities, repeater | the photonic casing | |
| RHEA (UIV) | plate, former, impeller, Wf/RHEA | the RHEA casing (AM powder, plates, billets) | the levitation melter becomes a volume machine |
| Rad-hard diamond controllers (UIV line 43) | the neutron-star casing (1 per 8) | MH field and neutron-star casings (1 per 4) | the diamond Schottky line becomes a volume line |
| Gum metal (UXV) | the arm's strain-wave gear | the structural casing (8 billets per 2 casings) | a UXV workhorse body needs about 4,000 billets; X7's longest branch becomes a volume line |
| Mu-metal, Ga2O3 dies, Finemet cores (UXV) | interposer, hull, voltage coil | shield and pulsed-field casings | |
| Era sensors, pumps, emitters, field generators | components | a fixed share in the specialty casings (section 9) | about 1 component per 8 to 64 casings |
| GTM's `uiv_machine_casing` (135,489) and `uxv_machine_casing` (376,146) | bulk body blocks of 16 UIV and UXV structures | hulls only | structure costs fall by up to two orders of magnitude, to the band of section 9 |

Reachability: every new recipe runs on machines the era already has. The new intermediates and casings are made at or below their structure's era. No casing of an Earth structure needs a Vela or Cassiopeia A product (uxv.md's bootstrap rule, `uxv.md:928-953`): the UXV structural and shield casings use home lines only.

## 7. Decisions

The owner delegated every decision on 2026-11-03. Each decision below weighs its options and states the reason.

### D4-1 How the longest lines reach the guide

| Option | Consequence |
|---|---|
| A. Import StarT's long late lines (MIT) | fantasy chemistry with inflated labels (`long-lines.md:197-252`); adds content, not depth |
| B. Chain records (census, charts) | not real transformations; padding |
| **C. Make each era's circuit a monolithic wafer flow, and count the staged material streams honestly** | real (monolithic 3D integration, heterogeneous photonics); merges 29 near-identical chains into three trunks; fewer wafers |

**Decision: C.** The circuits reach 25, 28 and 29 against the guide's 26, 28 and 30. U-3's superconducting cold-mass idea (winding, impregnation, quench test) is reused as an idea for the field casings (section 9), with nothing copied.

### D4-2 Where the wafer lines start counting

| Option | Counts |
|---|---|
| A. At the FZ boule (for UXV, at the Si-28 dust) | 18, 21 and 26 |
| **B. From sand, through M2's boule** | 25, 28 and 29 |

**Decision: B.** The boule is an intermediate of M2, whose end product is the HV circuit. The player runs M2 to feed these lines, which is exactly the staged-line rule.

### D4-3 The superheavy ladder

| Option | Consequence |
|---|---|
| A. Ten short element lines | as today; census I has no consumer |
| B. One line per era | breaks the material stream that runs across eras |
| **C. One staged ladder, IV to UXV** | each era's census keeps the one before as a non-consumed reference |

**Decision: C.** It is the real campaign: reactor-bred targets, then beam, separation and chemistry. The kept census gives census I its consumer without counting a record as a step.

### D4-4 Machine merges

| Option | Consequence |
|---|---|
| A. None | |
| **B. Merge only where physics forbids moving the intermediate, or a machine duplicates an older one** | six merges |
| C. One hall per site | loses real distinctions, such as power versus process |

**Decision: B**, six merges removing eight controllers:

| Merge | Physical reason |
|---|---|
| UEV recoil separator into the heavy-ion cyclotron (the superheavy factory) | the gas-filled separator is the cyclotron's beam line (DGFRS at the U-400) |
| UEV containment works into the degenerate harvester (the degenerate works) | degenerate matter must be held in the field the moment it is taken |
| UIV neutron drip separator into the neutronium cage (the neutron drip works) | free neutrons decay in about 15 minutes; they cannot be shipped between machines |
| UXV pasta draw bench and laminator into the phase sorter (the pasta mill) | pasta cannot leave confinement |
| UXV oxide PLD chamber and racetrack fab into the MTJ sputter cluster (the spintronic cluster tool) | cluster tools are how real spintronic fabs work: chambers around one vacuum wafer handler |
| UXV vdW stacking cell into the UEV vdW stacker | the same process on an older machine, as the pack does everywhere |

### D4-5 The casing families

| Option | Consequence |
|---|---|
| A. Keep GTM and older casings | breaks principle 4 |
| B. One generic casing per era | no silhouette or thematic meaning |
| **C. A family per era: structural, field, optical, thermal or cryogenic, containment, and a signature for each flagship** | each made from a product only that era's lines make |

**Decision: C.** Section 9 lists the members. Today's shared casings go back to their own era: photonic to UEV, cryostat to UV, neutron-star site to UIV, and each coil to its era as heat detail only.

### D4-6 What a casing costs

| Option | Consequence |
|---|---|
| A. Price by material only | UIV and UXV line products cost 0.1 to 50 each in the cost model, so bodies would cost almost nothing |
| B. One era component per casing | bodies at 100 times the controller |
| **C. Bands against the era's median core component** | material-only structural casings; each specialty casing carries one era component per 4 to 64 casings, for the job that needs it |

**Decision: C.** The specialty components:

| Casing | Component |
|---|---|
| Field | quench and field sensing |
| Optics | metrology or a reference laser |
| Cryostat | the He-3 circulation pump |
| Containment | the field generator |

Targets: a workhorse or hall body costs 1 to 3 times its controller, and a flagship at most 5 times. The UXV hull is not a reference, because it is an outlier: 535,199 against a median component of 40,308. Neither is the UIV hull, which is 99.9 % its machine casing.

### D4-7 GTM's tier machine casings in UIV and UXV bodies

They cost 135,489 (UIV) and 376,146 (UXV) per block. Bodies built from them cost 5 to 186 times their controller: the BZ dynamo's body is 157 M against a 970 k controller.

**Decision: they leave every body**; they stay in hulls only.

### D4-8 Coils and active blocks

GTM 7.5.3 makes every KubeJS `gtceu:coil` block a `CoilBlock`, which extends `ActiveBlock` (`CoilBlockBuilder.java:64-67`, `CoilBlock.java:26`, tag `v7.5.3-1.20.1`). T0's counter matches only `gtceu:` ids (`tools/analysis/lib/active_blocks.mjs:10`), so it misses our HfTaCN and MH coils. Counted with them, the pulsar wind trap holds 256 and the Mk6 220, against a ceiling of 264.

**Decision:**
- T0 counts our coils (package D4-ACTIVE).
- Coils appear only where a process needs heat or a lit ring: furnaces, fusion solenoids.
- Magnets that were coil bodies become the passive field casings.
- Each era uses its own newest coil. UXV keeps the MH coil, because no UXV process needs more than 14,400 K (`uxv.md:27`).

### D4-9 The UXV SMES cell's consumer

| Option | Consequence |
|---|---|
| A. A UXV casing | a 4-trillion-EU store in every block is absurd |
| B. A gate input | a one-off |
| **C. The OpV cell, rewound from four UXV cells** | the ladder every cell from UHV to UXV already follows |

**Decision: C** (section 10).

### D4-10 Removed ids

| Id | Replaced by |
|---|---|
| `grindless:hbn_emitter_chip` | E1, step 18 |
| `grindless:meso_logic_die` | X1, steps 25-27 |
| `gtceu:recoil_separator`, `gtceu:containment_works`, `gtceu:neutron_drip_separator`, `gtceu:pasta_draw_bench`, `gtceu:pasta_laminator`, `gtceu:oxide_pld_chamber`, `gtceu:racetrack_fab`, `gtceu:vdw_stacking_cell` | D4-4 |

No save compatibility (AGENTS.md); each removed id takes its references with it.

### D4-11 Sizes

**Decision:** every structure fits the forming sweep's band, 60 x 60 x 124 (`zones.json:143`), so the band does not move. Structures above about 2,300 blocks need two Terminal passes, and their quests say so.

## 8. Multiblock scale

The rule is `docs/quality/structures.md:34-88`. Cells are the `cells` metric of `structure-quality.mjs` (filled cells, hatches and controller included). Bounding boxes are W x H x D, with D along the slices.

**Active blocks** are GTM ActiveBlocks:
- the wire coils, including our two `gtceu:coil` blocks (D4-8);
- fusion coils, superconducting coils and heat vents.

"Now" counts them with our coils, so it is higher than T0's count today.

**Body** is the family casing that makes most of the non-part cells (section 9). Lower-era and GTM blocks stay only as detail: frames, glass, pipes, gearboxes, heat coils.

**Targets:**
- Cells within ±15 %; the silhouette is binding, the exact count is not.
- The dominant block designed at 60 % or less.
- Parts on the outer skin.

### UEV (24 after merges; median 349 → 825)

Class bands (cells): field unit about 230-370, workhorse 700-1,100, hall 1,100-1,800, flagship 1,800-2,800.

| Structure | Class | Cells now (bbox) | Target | Target bbox | Silhouette | Body; detail | Active now → max |
|---|---|---|---|---|---|---|---|
| `heavy_ion_cyclotron`, renamed the Superheavy Factory; absorbs `recoil_separator` (600, 9x7x19) | **flagship** | 727 (17x7x15) | 2,400 | 31x11x47 | cyclotron disk with spiral sector poles, a beam line to the target-wheel vault, the gas-filled separator bending to its focal plane | superhydride magnet (signature: poles, dipoles), SiC composite; radiation-proof casing as detail | 162 + 133 → 120 |
| `uev_fusion_reactor` (Mk4) | **flagship** | 480 (11x5x13) | 2,400 | 33x9x33 | torus: Wf/W and SiC/SiC wall, passive toroidal magnets, a lit central solenoid | Mk4 fusion casing (signature; at most 450), superhydride magnet, SiC composite | 84 → 128 |
| `calutron` | hall | 704 (11x7x17) | 1,400 | 27x9x23 | Y-12 Alpha racetrack: eight magnet tanks in an oval, source and collector tanks in the gaps | SiC composite, superhydride magnet | 184 → 48 |
| `photonic_integration_hall` | hall | 563 (11x9x13) | 1,500 | 23x11x23 | cleanroom hall: flip-chip bonders and fibre-attach cells round a central gallery (it assembles the three band circuits) | photonic, SiC composite | 1 → 8 |
| `degenerate_harvester`, renamed the Degenerate Works; absorbs `containment_works` (395, 9x7x11) | hall | 349 (9x8x13) | 1,400 | 21x15x29 | a harvester boom reaching out from a stasis vault | degenerate containment, superhydride magnet, SiC composite | 23 + 6 → 32 |
| `stellar_forge` (UEV mega) | hall | 535 (9x16x9) | 1,600 | 15x23x15 | a stacked furnace tower girdled by four coil rings | HfTaCN lining, SiC composite | 32 → 64 (HfTaCN coils replace MoSi2) |
| `superheavy_chemistry_lab` | workhorse | 380 (9x7x11) | 800 | 15x9x17 | hot-cell row with thermochromatography columns | SiC composite; radiation-proof as detail | 9 → 9 |
| `megabar_press` | workhorse | 227 (9x9x9) | 850 | 15x15x15 | cubic multi-anvil frame: six rams around a central vessel, laser ports | SiC composite, HfTaCN lining | 1 → 8 |
| `electron_beam_furnace` | workhorse | 413 (9x10x13) | 900 | 13x13x19 | vacuum hall with electron-gun towers on the roof, cold hearths, a withdrawal pit | SiC composite, HfTaCN lining | 9 → 16 |
| `single_crystal_foundry` | workhorse | 269 (7x13x7) | 800 | 11x21x11 | Bridgman tower: mould chamber over a withdrawal shaft with a baffle ring | SiC composite, HfTaCN lining | 37 → 48 |
| `nitride_magnet_works` | workhorse | 232 (7x11x7) | 750 | 13x13x15 | nitriding retort, field-anneal magnet and bonding press around a core | SiC composite, superhydride magnet | 25 → 24 |
| `sic_fibre_plant` | workhorse | 319 (7x16x7) | 800 | 11x23x13 | spinning tower with an e-beam curing tunnel and a pyrolysis furnace at its foot | SiC composite, HfTaCN lining | 1 → 8 |
| `cvi_furnace` | workhorse | 286 (9x9x9) | 850 | 13x15x15 | bell-jar retort with gas manifolds and an HCl scrubber | SiC composite, HfTaCN lining | 25 → 32 |
| `snspd_foundry` | workhorse | 398 (7x7x15) | 850 | 11x9x23 | cleanroom bay: sputter chamber, e-beam writer, etcher and cryoprober in a row | photonic, SiC composite | 11 → 12 |
| `vdw_stacker`; gains UXV's `vdw_stacking` type | workhorse | 250 (7x11x7) | 1,000 | 15x11x19 | glovebox train with transfer stages and microscope turrets | photonic, SiC composite | 25 → 16 |
| `helium3_polariser` | workhorse | 202 (7x7x9) | 700 | 13x9x17 | MEOP cell gallery inside a holding-field solenoid, a 1,083 nm laser bench, a compressor | superhydride magnet, photonic | 4 → 4 |
| `quantum_gas_lab` (Earth orbit) | workhorse | 343 (9x9x9) | 750 | 15x11x15 | orbital module: vacuum chambers in Feshbach coils, laser tables | photonic, superhydride magnet, SiC composite | 3 → 4 |
| `entanglement_station` (Earth orbit) | workhorse | 581 (15x10x7) | 900 | 25x13x11 | twin telescopes on a truss over an SPDC bench | photonic, SiC composite | 16 → 16 |
| `interstellar_dust_lab` (α Centauri) | workhorse | 414 (9x7x13) | 800 | 13x11x21 | lab hall with an AMS tandem beam line along it (the iron-60 count) | photonic, SiC composite, superhydride magnet | 7 → 8 |
| `pulsar_timing_station` (α Centauri) | workhorse | 197 (7x11x9) | 700 | 13x19x13 | X-ray timing tower: lobster-eye optics tube over a detector deck and a clock room | photonic, SiC composite | 3 → 4 |
| `carbonyl_refinery` (Barnard b) | workhorse | 253 (7x12x7) | 750 | 11x19x13 | Mond plant: carbonylation reactor, distillation column, decomposer | SiC composite; inert casing as detail | 0 → 0 |
| `nebula_collector` (α Centauri) | field unit | 449 (11x12x11) | 450 | 11x12x11 | scoop dish (size kept, body changed) | SiC composite; photonic as detail | 1 → 1 |
| `white_dwarf_spectrograph` (Sirius B) | field unit | 312 (9x11x9) | 350 | 9x13x9 | telescope | photonic, SiC composite | 1 → 1 |
| `barnard_core_drill` | field unit | 62 (5x6x5) | 280 | 9x15x9 | derrick with a pipe rack | SiC composite | 0 → 0 |

### UIV (22 after merges; median 491 → 1,100)

Class bands: field unit about 300-470, workhorse 900-1,400, hall 1,400-2,400, flagship 2,400-3,600.

| Structure | Class | Cells now (bbox) | Target | Target bbox | Silhouette | Body; detail | Active now → max |
|---|---|---|---|---|---|---|---|
| `uiv_fusion_reactor` (Mk5) | **flagship** | 756 (13x7x15) | 3,000 | 39x11x39 | torus: Li-Sn first wall, passive MH toroidal magnets, a lit central solenoid | Mk5 fusion casing (signature; at most 600), MH field, RHEA | 180 → 144 |
| `matrioshka_computer` (Mercury) | **flagship** | 597 (11x11x11) | 3,000 | 29x29x29 | nested lattice spheres: logic core, TPV shell, emitter shell, radiator sheets | droplet radiator module (signature; about 32), TPV and emitter shells (about 16 each), RHEA lattice | 0 → 0 |
| `penrose_engine` (Cygnus X-1) | **flagship** | 491 (13x9x13) | 2,600 | 39x11x39 | ring of sled release rails and recovery dynamos round a drop shaft | MH field (signature), RHEA | 32 → 64 |
| `ramp_compression_pulser` | hall | 642 (13x12x13) | 1,900 | 31x11x31 | Z-machine wheel: a central chamber with twelve Marx-bank arms | RHEA, MH field | 0 → 0 |
| `beuv_scanner` | hall | 768 (15x10x13) | 2,000 | 25x15x23 | Tb droplet source vessel, illuminator, reticle stage, projection box, wafer stage | multilayer optics, RHEA | 0 → 8 |
| `neutronium_cage`, renamed the Neutron Drip Works; absorbs `neutron_drip_separator` (415, 9x8x11) | hall | 365 (9x9x9) | 1,700 | 21x13x29 | drip-separator drum feeding a superfluid cage vault | neutron-star site, MH field, dilution cryostat | 44 + 6 → 48 |
| `neutronium_compression_hall` (UIV mega) | hall | 624 (13x10x11) | 2,000 | 21x15x27 | a long press hall with the neutronium press line under a gantry | neutron-star site, MH field, RHEA | 3 → 16 |
| `levitation_melter` | workhorse | 350 (9x11x9) | 1,000 | 15x17x15 | levitation coil cage under an inert dome over a casting pit | RHEA, MH field | 48 → 48 (MH coils replace HfTaCN) |
| `tfln_fab` | workhorse | 549 (13x9x11) | 1,100 | 17x11x23 | ion-slicing line: implanter, bonder, split furnace, polisher | multilayer optics, RHEA | 1 → 4 |
| `femtosecond_writer` | workhorse | 597 (9x7x21) | 1,000 | 13x9x31 | amplifier chain along an optical table into a five-axis writing stage | multilayer optics, RHEA | 120 → 24 |
| `spectral_hole_burner` | workhorse | 204 (7x10x7) | 900 | 13x17x13 | dilution cryostat column in a ZEFOZ magnet, laser ports | dilution cryostat, MH field, multilayer optics | 3 → 4 |
| `stm_lithography_cell` | workhorse | 322 (9x8x9) | 900 | 15x11x17 | STM chambers on a pneumatic isolation slab with a load-lock train | multilayer optics, dilution cryostat, RHEA | 1 → 4 |
| `millikelvin_cryostat_works` | workhorse | 544 (9x14x9) | 1,200 | 13x23x13 | a tall dilution and nuclear-demagnetisation column over its 9 T magnet | dilution cryostat, MH field | 69 → 0 |
| `polarised_proton_source` | workhorse | 586 (9x8x15) | 1,200 | 13x11x27 | dissociator, sextupole train, storage cell and ice cryostat in a line | MH field, dilution cryostat, RHEA | 111 → 24 |
| `droplet_radiator_works` (Mercury) | workhorse | 472 (13x9x13) | 1,100 | 17x13x21 | tin melt tank, orifice bank, a long drop chamber with field-steered collectors | RHEA, MH field | 5 → 8 |
| `r_process_decompressor` (RX J1856) | workhorse | 388 (11x10x13) | 1,000 | 15x13x19 | decompression chamber and a capsule-sealing line | neutron-star site, RHEA, MH field | 112 → 16 |
| `decay_heat_vault` (RX J1856, generator) | workhorse | 321 (9x8x9) | 900 | 15x11x17 | shielded vault of capsule wells with heat exchangers | neutron-star site, RHEA | 1 → 1 |
| `pulsar_wind_trap` (PSR J0437) | workhorse | 680 (13x9x13) | 1,200 | 15x15x31 | magnetic bottle: mirror throats at both ends of a long solenoid, tungsten-lined | MH field, RHEA; tungsten block as detail | 256 → 32 |
| `positronium_condensate_lab` (PSR J0437) | workhorse | 327 (11x9x9) | 1,000 | 15x13x17 | accumulator input, aerogel target cryostat, cooling-laser tables | dilution cryostat, multilayer optics, MH field | 4 → 4 |
| `xray_pulse_profiler` (PSR J0437) | workhorse | 517 (7x9x17) | 1,000 | 11x13x29 | X-ray telescope tube with multilayer optics over a detector deck | multilayer optics, RHEA | 120 → 16 |
| `crust_lift` (RX J1856) | field unit | 465 (9x13x9) | 470 | 9x13x9 | shaft with a cage (size kept, body changed) | neutron-star site, RHEA | 1 → 1 |
| `ergosphere_probe_bay` (Cygnus X-1) | field unit | 282 (9x7x9) | 420 | 15x9x15 | launch bay | RHEA, MH field | 2 → 2 |

### UXV (17 after merges; median 454 → 1,400)

Class bands: field unit about 370-600, workhorse 1,100-1,800, hall 1,800-3,000, flagship 3,000-4,500.

| Structure | Class | Cells now (bbox) | Target | Target bbox | Silhouette | Body; detail | Active now → max |
|---|---|---|---|---|---|---|---|
| `uxv_fusion_reactor` (Mk6) | **flagship** | 924 (15x7x17) | 4,000 | 45x11x45 | torus burning the star's sequence | Mk6 fusion casing (signature; at most 450), pulsed field, gum metal | 220 → 160 |
| `mnt_collider` | **flagship** | 730 (9x7x23) | 3,200 | 15x13x91 | a U-238 linac into a target hall, the gas-stopping cell and an MR-TOF ring | pulsed field (signature), gum metal | 22 → 96 |
| `stellar_elevator` (Cygnus X-1) | **flagship** | 634 (11x11x25) | 3,600 | 23x57x23 | star-lift tower: a stack of ring-current coils (the tallest structure) | pulsed field (signature), gum metal | 108 → 96 |
| `mtj_sputter_cluster`, renamed the Spintronic Cluster Tool; absorbs `oxide_pld_chamber` (295) and `racetrack_fab` (454) | hall | 315 (11x7x11) | 2,600 | 31x11x31 | central vacuum wafer handler with eight radial chambers: four sputter, the PLD with its KrF beam line, ion-beam and notch etch, anneal, load locks | mu-metal shield, gum metal | 17 + 9 + 11 → 32 |
| `pasta_phase_sorter`, renamed the Pasta Mill; absorbs `pasta_draw_bench` (428) and `pasta_laminator` (229) | hall | 488 (11x9x13) | 2,600 | 19x13x55 | a long mill: the sorter drum splits into a draw line and a press line | pasta containment, pulsed field, gum metal | 33 + 152 → 96 |
| `bz_dynamo` (Cygnus X-1, generator) | hall | 696 (19x7x19) | 2,400 | 41x9x41 | ring electrode and field coils round the jet base | pulsed field, gum metal | 104 → 64 |
| `stellar_fractionation_hall` (UXV mega) | hall | 1,114 (13x13x25) | 2,900 | 21x21x61 | a fractionation hall: a column train under a crane gantry | gum metal, pulsed field | 40 → 64 |
| `yig_lpe_furnace` | workhorse | 266 (7x13x7) | 1,200 | 13x21x13 | vertical dipping furnace with a Pt crucible and three heater zones | gum metal, mu-metal shield (the garnet is grown and annealed in zero field) | 40 → 40 (MH coils replace tritanium) |
| `shequid_works` | workhorse | 330 (9x11x9) | 1,200 | 15x19x15 | He-II cryostat inside a nested mu-metal room on an isolation pier | mu-metal shield, gum metal | 64 → 8 |
| `annihilation_laser_works` | workhorse | 540 (9x9x15) | 1,400 | 15x13x27 | Ps moderator, positron stack and gamma cavity in a tungsten-shielded line | gum metal, pulsed field | 32 → 32 |
| `plasma_mass_filter` (Cygnus X-1) | workhorse | 554 (9x9x15) | 1,500 | 15x15x37 | Archimedes-type filter: a long solenoid with end electrodes | pulsed field, gum metal | 192 → 48 |
| `stellar_condensation_tower` (Cygnus X-1) | workhorse | 410 (7x7x23) | 1,400 | 13x31x13 | condensation column with stage trays | gum metal, pulsed field | 0 → 0 |
| `frc_former` (Cygnus X-1) | workhorse | 546 (7x7x21) | 1,400 | 13x13x41 | theta-pinch formation tube and translation section | pulsed field, gum metal; fusion glass as detail | 80 → 64 |
| `accretion_disk_skimmer` (Cygnus X-1) | field unit | 384 (15x7x15) | 560 | 19x9x19 | magnetic scoop ring | pulsed field, gum metal | 67 → 32 |
| `pasta_extractor` (Vela) | field unit | 458 (11x11x21) | 560 | 11x11x21 | crust tap | pasta containment, gum metal | 68 → 32 |
| `polar_cap_tap` (Vela, generator) | field unit | 380 (11x13x11) | 560 | 13x17x13 | tap mast | pulsed field, gum metal | 72 → 32 |
| `ejecta_knot_sweeper` (Cassiopeia A) | field unit | 622 (13x7x15) | 620 | 13x7x15 | sweeper (size kept, body changed) | gum metal; Whipple casing (LuV) as detail, at most 20 % | 84 → 24 |

UXV's vdW stacking cell (302 cells) leaves: its type joins the UEV vdW stacker.

### Terminal passes and the band

| Era | Structures above 2,300 blocks (two passes) |
|---|---|
| UEV | Superheavy Factory, Mk4 |
| UIV | Mk5, Matrioshka, Penrose engine |
| UXV | Mk6, MNT collider, stellar elevator, cluster tool, pasta mill, BZ dynamo, fractionation hall |

Every bounding box fits 60 x 60 x 124. The largest in each axis: the Mk6 is 45 wide, the stellar elevator 57 high, the MNT collider 91 deep. The sweep lays a preview's slices along Z, the band's 124-block axis (`gg_test_form_sweep.js:100-138`), so the MNT collider and the fractionation hall must be long in their slices, not in their rows. Sizes grow by:

| Era | Total cells | Median |
|---|---|---|
| UEV | 9,940 → about 24,000 | x2.4 |
| UIV | 11,262 → about 30,600 | x2.2 |
| UXV | 11,099 → about 31,700 | x3.1 |

"Before" covers every structure today, the merged ones included, with the medians of `docs/quality/structures.md:55-57` (for an even count, the lower middle value); "after" covers the targets of the survivors.

## 9. Casing families

### Why: what a body costs today

The cost-matrix model on dump `5d57213f3b83` gives the score of each structure's controller and its body. The body is the bill of materials of the formed structure, without its parts.

| Structure | Controller | Body | Body / controller |
|---|---|---|---|
| UEV calutron | 109,606 | 11,118 | 0.10 |
| UEV Mk4 | 418,121 | 1,101,166 | 2.6 |
| UIV STM lithography cell | 301,721 | 20,940 | 0.07 |
| UIV crust lift | 510,210 | 17,871,183 | 35 |
| UIV pulsar wind trap | 1,345,687 | 13,341,973 | 9.9 |
| UXV vdW stacking cell | 1,051,275 | 567 | 0.0005 |
| UXV Mk6 | 2,054,460 | 70,341,505 | 34 |
| UXV BZ dynamo | 969,967 | 157,238,826 | 162 |
| UXV fractionation hall | 1,150,442 | 214,036,729 | 186 |

The spread runs from 0.0005 to 186, for two reasons:
- **Nearly free GTM casings** make the cheap end: plascrete 0.1, clean casing 0.4, robust 0.7.
- **GTM's tier machine casings** make the expensive end: UIV 135,489 and UXV 376,146 per block, a whole hull each, because their recipe is the gate's.

The families fix both (D4-6, D4-7). Every body goes to 1 to 3 times its controller, and a flagship to at most 5 times.

### Reference costs (same model)

| Era | Hull | Median core component | Note |
|---|---|---|---|
| UEV | 28,795 | 5,809 | |
| UIV | 135,650 | 15,538 | 99.9 % of the hull is its machine casing |
| UXV | 535,199 | 40,308 | the hull is an outlier, not used; casings are priced against the median component |

The UXV median component is the mean of the pump (40,926) and the sensor (39,691), the middle two of the eight.

Two kinds of casing:
- **Structural casings are material only.** The model scores base resources and not EU, so a UXV material casing scores low. Its real price is its line and its volume: a UXV workhorse body takes about 4,000 gum metal billets.
- **Specialty casings carry one era component per 4 to 64 casings, for the job that needs it:**
  - field casings: quench and field sensing;
  - optics: metrology or a reference laser;
  - cryostats: the He-3 circulation pump;
  - containment: the field generator.

Every recipe below is a machine recipe, never a crafting table. Counts are indicative: each casing package tunes them so the score lands in the band.

### UEV family

The UEV style is "ribbed, scorched ember steel" (`Era.Lib.ps1:58`): notched corners, horizontal ribs every third row, scorch wear, edge-light trim, a warm ember tint.

| Casing | Job | Machine and recipe | Era-only input and why | Score (band) | vs median component; vs hull |
|---|---|---|---|---|---|
| `sic_composite_casing` (new) | structural body of UEV halls and workhorses: stiff, light, 1,600 °C, low activation | CVI furnace, new circuit: 12 `sic_sic_plate` + 6 `sic_fibre_preform` + 4 `six_n_tantalum` + the SiC row's infiltration gas → 2 (HCl to the cascade) | SiC/SiC (E4): the casing is a SiC/SiC sandwich densified in place; 6N Ta inserts at the joints | about 121 (100-250) | 2.1 %; 0.42 % |
| `superhydride_magnet_casing` (new) | field: the passive magnets of the racetrack, cyclotron, separator, polariser, Feshbach coils and toroidal fields | naquadria magnet works (ZPM), new UEV row: 64 `gtceu:lay_superhydride_single_wire` + 16 `sic_sic_plate` + 8 `bonded_fe16n2_magnet` + 1 `gtceu:uev_sensor` → 16 | (La,Y)H10 (E5), the UEV superconductor; Fe16N2 (E3), the highest-saturation iron, as the yoke; the sensor is the quench detector | about 674 (400-900) | 11.6 %; 2.3 % |
| `photonic_casing` (existing; new recipe) | optical: the zero-expansion, light-tight bench of every UEV optical machine | assembler: 16 `ule_boule` + 8 `hollow_core_fibre` + 8 `sic_sic_plate` + 1 `gtceu:uev_emitter` → 16 (the UV casing, tungsten-steel, iridium and FZ-wafer recipe goes) | ULE glass (E11): an optical bench must not expand; hollow-core fibre (E7) carries the light; the emitter is the bench's stabilised reference laser | about 384 (300-700) | 6.6 %; 1.3 % |
| `hftacn_lining_casing` (new) | thermal: the hot-zone lining of the UEV furnaces | spark plasma sinterer (UHV), new row: 16 `hftacn_powder` + 4 `sic_sic_plate` + 2 `ysz_ingot` → 2 | (Hf,Ta)CN (E4): the most refractory compound known (melting near 4,200 K); YSZ as the bond coat | about 126 (100-300) | 2.2 %; 0.44 % |
| `degenerate_containment_casing` (existing; new recipe) | containment at Sirius B | assembler: 64 `sic_sic_plate` + 32 `hollow_core_fibre` + 1 `gtceu:uev_field_generator` + epoxy → 64 (the GTM `uev_machine_casing` input goes) | the UEV field generator, with its degenerate-pellet core, holds the stasis field | about 1,226 (800-1,500) | 21 %; 4.3 % |
| `uev_fusion_casing` (existing, kept) | signature of the Mk4 ring | as built (`fusion_mk4.json:7`) | Wf/W tile and SiC/SiC | 3,699 | 64 %; 13 % |
| `hftacn_coil_block` (existing coil) | heat element: Mk4 solenoid, furnaces, the stellar forge | as built | | 511 | heat detail only |

Art briefs (16x16, `Build-UEVCasingTextures.ps1`, nothing copied):
- **SiC composite:** a charcoal 2x2 twill weave under three ribs, ember scorch at the rib edges, notched corners with blue-grey tantalum inserts.
- **Superhydride magnet:** the grey SiC face with a copper-rose winding band seen through the ribs and an ember-lit pole tip at the centre.
- **HfTaCN lining:** golden-grey carbonitride bricks in a notched course with ember-glowing mortar lines and heavy scorch.
- The photonic, degenerate and Mk4 casings keep their textures.

### UIV family

The UIV style is "rounded, frosted and cool" (`Era.Lib.ps1:59`): round corners, frost wear, a concentric lit ring, a cyan-teal tint.

| Casing | Job | Machine and recipe | Era-only input and why | Score (band) | vs median component; vs hull |
|---|---|---|---|---|---|
| `rhea_casing` (new) | structural body of UIV halls and workhorses: strength at 1,600 °C | powder bed printer (UV), new row: 12 `rhea_am_powder` + 4 `gtceu:rhea_plate` + 2 `wf_rhea_billet` → 2 | RHEA (I3): a printed gyroid lattice of WMoNbTaHf between RHEA faces | about 94 (80-200) | 0.6 %; 0.07 % |
| `mh_field_casing` (new) | field: the passive magnets of the wind trap, proton source, Penrose engine, Mk5 toroidal field, cryostat and ZEFOZ magnets | naquadria magnet works, new UIV row: 16 `mh_winding` + 8 `gtceu:rhea_plate` + 4 `rad_hard_controller` → 16 | metallic hydrogen windings (I3); the rad-hard diamond controller (UIV line 43) is the quench and power controller | about 2,647 (1,500-3,000) | 17 %; 2.0 % |
| `multilayer_optics_casing` (new) | optical: the hydrogen-flushed vacuum optics of the BEUV, TFLN, femtosecond, STM, X-ray and positronium machines | assembler: 8 `la_b4c_multilayer` + 8 `gtceu:rhea_plate` + 4 `glass_interposer` + 1 `gtceu:uiv_sensor` → 8 | the La/B4C multilayer (I1's BEUV branch), the 6.7 nm and X-ray reflector; the sensor is the stage metrology | about 2,325 (1,500-3,000) | 15 %; 1.7 % |
| `dilution_cryostat_casing` (new) | cryogenic: millikelvin stages | millikelvin cryostat works, new circuit: 8 `mk_cryostat_module` + 8 `gtceu:rhea_plate` + 1 `gtceu:uiv_electric_pump` + He-3/He-4 charge (kept) → 8 | the PrNi5 millikelvin module (UIV line 42); the pump is the He-3 circulation pump of every dilution refrigerator | about 2,470 (1,500-3,000) | 16 %; 1.8 % |
| `neutron_star_site_casing` (existing; new recipe) | containment at RX J1856 | assembler (`rx_j1856.json:112`): 2 `rad_hard_controller` instead of 1, per 8 casings | as built: the rad-hard controller | about 2,650 (1,500-3,000) | 17 %; 2.0 % |
| `uiv_fusion_casing` (existing; new wall recipe) | signature of the Mk5 ring | assembler (`mk5.json:92`): 4 `li_sn_armoured_tile` + 4 `w_fibre_preform` + 1 `gtceu:uiv_electric_pump` + Li-Sn → 4; the divertor recipe stays | the Li-Sn armoured first wall; the pump drives its liquid-metal loop | about 4,970 (3,000-6,000) | 32 %; 3.7 % |
| `droplet_radiator_module` (existing, kept) | signature of the Matrioshka computer | as built | | 49,976 | used sparingly: about 32 |
| `metallic_hydrogen_coil_block` (existing coil) | heat element: levitation melter, Mk5 solenoid; UXV's heat element too | as built | | 248 | heat detail only |

Art briefs:
- **RHEA:** frosted blue-grey with a printed rounded-cell lattice, a teal concentric ring at the centre and frost speckles.
- **MH field:** silver-cyan concentric winding rings, a frosted rim and a cool lit ring.
- **Multilayer optics:** dark glass with iridescent thin violet-teal multilayer bands and a rounded window with teal edge light.
- **Dilution cryostat:** a pale frosted white-cyan can with nested rounded shields as concentric circles, frost and a faint blue ring.

### UXV family

The UXV style is "violet-tinted etched hardware" (`Era.Lib.ps1:55`): stepped bevels, etched wear, a grid panel, rim trim, a violet tint, lower luminance.

| Casing | Job | Machine and recipe | Era-only input and why | Score (band) | vs median component |
|---|---|---|---|---|---|
| `gum_metal_casing` (new) | structural body of every UXV structure: a superelastic frame that takes the thermal strain of huge halls without yielding | assembler: 8 `gum_metal_billet` + 4 `w184_cvi_preform` → 2 | gum metal (X7: Ti-23Nb-0.7Ta-2Zr-O, Saito 2003); W-184 fibre panels (the Mk6 casing's isotope-pure tungsten: low activation beside stellar plasma) | about 9 (5-30); its cost is volume | 0.02 % |
| `mu_metal_shield_casing` (new) | magnetic shielding: the field-free rooms of the spintronic fab, the YIG furnace and the SHeQUID gyroscope | nitride magnet works (UEV; it already anneals mu-metal), new circuit: 16 `annealed_mu_foil` + 4 `gum_metal_billet` + 1 `gtceu:uxv_sensor` → 8. **As built (integrator, 2026-11-03):** assembler, 16 `annealed_mu_foil` + 4 `gum_metal_billet` + 4 `w184_cvi_preform` + 2 `gtceu:uiv_sensor` + epoxy → 8: UIV sensors, because the Spintronic Cluster Tool is built from this casing and makes the MTJ dies of every UXV sensor (bootstrap) | annealed mu-metal (X9); the sensor is the active-compensation magnetometer of a shielded room | about 4,962 (3,000-6,000) | 12 % |
| `pulsed_field_casing` (new) | field: the pulsed magnets of the Cygnus plasma machines, the MNT beam line and the Mk6 toroidal field | naquadria magnet works, new UXV row: 48 `mh_winding` + 24 `ga2o3_power_die` + 12 `finemet_core` + 24 `gum_metal_billet` + 1 `gtceu:uxv_emitter` → 48 | Ga2O3 switches and Finemet induction cores (X9): a linear transformer driver; the emitter is the laser trigger of the pulsed-power switches | about 4,649 (3,000-6,000) | 11.5 % |
| `pasta_containment_casing` (new) | containment of nuclear pasta at Vela | assembler: 32 `frc_cartridge` + 32 `cage_part` + 32 `gum_metal_billet` + 1 `gtceu:uiv_field_generator` → 64 | FRC cartridges (X5, field-reversed rings) and UIV cage parts. Bootstrap: these structures are built before Vela, so a UIV field generator, never the UXV one that needs strand tape (`uxv.md:949`) | about 3,224 (2,000-5,000) | 8 % |
| `uxv_fusion_casing` (existing; new recipe) | signature of the Mk6 ring | assembler (`fusion_mk6.json:7`): 12 `wf_rhea_billet` + 12 `w184_cvi_preform` + 12 `mh_winding` + 12 `gtceu:tritanium_frame` + 1 `gtceu:uxv_field_generator` + `he_6n` → 24 (was 1 field generator per 2) | Wf/RHEA and W-184 | about 15,240 (10,000-20,000; was 182,555) | 38 % |

UXV has no thermal casing: no UXV process needs more heat than the MH coil gives (`uxv.md:27`).

Art briefs:
- **Gum metal:** pale titanium-grey with a violet cast, a stepped bevel, a fine etched grid and darker chevron springs in the corners.
- **Mu-metal shield:** bright nickel-silver panels on an etched grid, with nested squares for the shielding layers and a violet rim light.
- **Pulsed field:** a dark violet coil face with a stepped amber Finemet ring and small pale-blue die squares on the grid lines.
- **Pasta containment:** violet-black with glowing magenta parallel striations (spaghetti) behind an etched grid window, under a heavy rim.

### Reassignment of today's shared casings

| Casing | Used today | After |
|---|---|---|
| `photonic_casing` (UEV) | nine UEV structures; UIV BEUV scanner (337 blocks), TFLN fab (226) | UEV only; UIV's optical machines take the multilayer optics casing |
| `cryostat_casing` (UV) | UIV millikelvin works (136), proton source (93), positronium lab (219), hole burner (82); UXV SHeQUID (159), FRC former, laser works (16), laminator (9) | UV only; UIV takes the dilution cryostat; UXV takes the mu-metal shield, the pulsed field and gum metal |
| `neutron_star_site_casing` (UIV) | five UIV structures; UXV draw bench (104), extractor (82), laminator (135), sorter (232), polar cap tap (222) | UIV only; Vela takes the pasta containment |
| `metallic_hydrogen_coil_block` (UIV coil) | as body: wind trap (256), r-process (112), proton source (111), millikelvin works (69), cage (44), Penrose (32); as heat: Mk5 (180), Mk6 (220) | heat detail only (levitation melter 48, Mk5 and Mk6 solenoids, YIG furnace 40); the magnet bodies become MH field casings |
| `hftacn_coil_block` (UEV coil) | Mk4 (84); UIV levitation melter (48) | UEV only; the melter takes MH coils |
| GTM `uiv_machine_casing`, `uxv_machine_casing` | sixteen bodies | hulls only |
| GTM `uev_machine_casing` | eight UIV bodies | none |
| `whipple_shield_casing` (LuV) | the UXV sweeper's body (288) | detail, at most 20 % |
| `coilgun_coil_casing` (LuV) | the UIV pulser (120) | none |
| GTM generic casings (stable, robust, clean, heatproof, high-power, filter, plascrete) | most band bodies | frames, glass, pipes and gearboxes only |

### Bodies after (estimates at the target counts)

| Structure | Body | Controller | Ratio |
|---|---|---|---|
| UEV workhorse, 800 cells | about 480 SiC composite and 160 specialty: about 154 k | about 105 k | 1.5 |
| UIV workhorse, 1,100 cells | about 600 RHEA and 300 specialty: about 776 k | about 650 k | 1.2 |
| UXV workhorse, 1,400 cells | about 800 gum metal and 350 specialty: about 1.69 M | about 1.0 M | 1.7 |
| Mk4 | 450 fusion and 400 magnet casings: 1.93 M | 418 k | 4.6 |
| Mk5 | 600 fusion and 500 MH field casings: 4.3 M | 1.30 M | 3.3 |
| Mk6 | 450 fusion and 500 pulsed-field casings: 9.2 M | 2.05 M | 4.5 |
| Matrioshka | 32 radiator modules, 16 TPV and 16 emitter shells, about 1,500 RHEA casings: 3.3 M | 798 k | 4.1 |

The reshape packages measure each structure with `cost-tree.mjs --target <controller>` (its formed bill of materials) once the casings exist, and keep every workhorse and hall between 1 and 3 and every flagship at 5 or below.

### Active blocks per structure

Section 8 gives each structure's now and maximum. The largest after the redesign:

| Era | Largest after |
|---|---|
| UEV | the Superheavy Factory (120), the Mk4 (128) |
| UIV | the Mk5 (144) |
| UXV | the Mk6 (160) |

All are under 264. The two over-200 cases of today drop: the wind trap from 256 to 32, the Mk6 from 220 to 160.

## 10. The UXV SMES cell's consumer (#284 A2-06, #277)

Since UHV, every wireless cell is rewound from four cells of the tier below:

| Cell | Inputs | Source |
|---|---|---|
| UHV | four UV cells and RTAN windings | `magnet_works.json:61-66` |
| UEV | four UHV cells and superhydride | `:70-75` |
| UIV | four UEV cells and MH wire | `composites.json:15-17` |
| UXV | four UIV cells and strand tape | `:24-26` |

The OpV cell breaks the ladder. Its own comment calls it "four UXV cells' worth" (`opv/wireless.js:8`), but it takes chain-strand wire, chain lamina and two OpV field generators (`:22-23`). So `grindless:uxv_smes_cell` has no recipe consumer: its only use is a placed block in a tower's cell slot.

**Decision (D4-9):** the OpV cell is rewound from four UXV cells. The UXV cells' pasta-strand coils stay; chain-strand windings take the OpV field; chain lamina is the new case.

New row: 4 `grindless:uxv_smes_cell` + 16 `gtceu:chain_strand_single_wire` + 4 `grindless:chain_lamina_stack` → `grindless:opv_smes_cell`. Same machine, duration, wire and lamina; the two field generators go, because the UXV cells bring the field. Capacity is unchanged (16.1 T EU, four times the UXV cell).

The cell keeps its placed use: towers take any tier's cell. The same rule gives ZPM's orphan cell its consumer in D3's UV row (section 5).

## 11. Quests and Processing Lines charts

### Charts

Each line becomes one cluster: a trunk with its feeders drawn as branches. Staged lines use `extends` to the earlier stage (D1-AUDIT):

| Line | Extends to |
|---|---|
| E1, E6 | `pl_mv` silicon cluster |
| E2 | `pl_iv` fuel cycle, `pl_zpm` actinides, `pl_uv` heat source, `pl_uhv` isotopes |
| I1 | E1 |
| I2, X3 | E2 |
| I9 | E3 |
| I10 | `pl_uv` thorium |
| X1, X2 | `pl_mv` silicon and `pl_iv` hot cell |

| Chart | Clusters after | Where today's clusters go | Leave the chart |
|---|---|---|---|
| `pl_uev` | E1 to E11 | light (13 audited lines) → E1, E6, E7, E9, E10, E11; pressure (9) → E3, E4, E5; isotopes (5) → E2; stars (4) → E3, E8 | the EOS model and the relay seed stay drawn as short ends (keepShort) |
| `pl_uiv` | I1 to I10 | light, memory and beuv → I1 with its feeders, I5, I6; hydrogen → I3, I8, I9; atoms → I2, I4, I8; fusion → I5, I6, I7, I10 | none |
| `pl_uxv` | X1 to X10 | targets, wafers and flakes (19 audited lines) → X1's feeders and X2; atoms → X3, X8; stars → X4, X5; pasta → X6; parts → X7, X10; chips → X9 and X1's feeders | none |

### Quests

Each era chapter teaches its lines and its casings in English (principle 5). One quest covers each module or stage: what it is for, what it needs, what it unlocks and how to automate it. Rewards are proportionate and never skip a step.

**UEV chapter (`tools/quests/uev-chapter/`):**
- "The quantum photonic fab" (E1), 8 quests: the SiN platform, waveguide detectors, the hBN-encapsulated graphene modulators, the electrodes, the quantum-dot sources, cladding and dicing, packaging, the optical computer.
- "The superheavy ladder" (E2), 5 quests: what IV to UHV keep for it, the calcium-48 beam, flerovium, tennessine, the census.
- "The UEV body", 6 quests, one per family member: its job, its recipe, which machines use it, and how many a typical structure takes (a workhorse about 500 SiC composite casings).
- The Superheavy Factory and the Degenerate Works replace the quests of the machines they absorb.
- E3 to E11 move to their merged lines.

**UIV chapter:**
- "The optical mainframe" (I1), 5 quests: the compute module, the tensor core, the comb, the mainframe, and one that maps the feeders.
- "The superheavy ladder II", 2 quests.
- "The UIV body", 7 quests: the four new casings, the neutron-star site casing, the Mk5 casing, the radiator module.
- The Neutron Drip Works.

**UXV chapter:**
- "The spintronic wafer" (X1), 9 module quests: Si-28 and CMOS, MRAM, racetrack, oscillators, the magnonic bus, the oxide membranes, the van der Waals readouts, interconnect and dicing, the mainframe.
- "The superheavy ladder III", 2 quests.
- "The UXV body", 5 quests.
- The Spintronic Cluster Tool, the Pasta Mill, and the vdW stacker's UXV mode.

The twelve structures above about 2,300 blocks say so in their quest: "GTM's Terminal places about 2,300 blocks per pass; this one takes two."

## 12. Implementation packages

The work-package fields of the contracts follow. Each package is one Sonnet session with at most 2 repairs.

### Common to every package

| Field | Value |
|---|---|
| Prohibited | `pack/index.toml`, `pack/pack.toml`, `pack/kubejs/data/grindless/tables/hidden_until.json`, the generated quest chapters (`pack/config/ftbquests/**`), `AGENTS.md`, `docs/STATUS.md`, `DECISIONS.md`, `CREDITS.md`, `pack/kubejs/*/grindless/lib/**`, `lines-ev-zpm.md`, `lines-uv-uhv.md`, `lines-opv-maxplus.md`, and every file not in the package's allowed list |
| Invariants | AGENTS.md principles 2 to 11 and its Invariants; English only; `var`, never `const`, in Rhino pattern loops; no `Java.to` in `Predicates.custom`; every new recipe a machine recipe; every input automatable and every byproduct with a destination; times never inflated; GTM 7.5.3 wins; no save compatibility (a removed id takes its references with it) |
| References | this file's section for the package; AGENTS.md; `docs/quality/structures.md:18-88` for structure packages |
| T0 | push the branch and read its GitHub Actions T0 run (`docs/testing/usage.md:21-27`); never on the workstation |
| Maximum repairs | 2 |
| Escalation evidence | the failing check with at most 20 lines (triage agent), the suspected path:line, the attempts made |
| Expected commits | 1 or 2 |
| Agent | the default agent on Sonnet |
| Handoff | the work-package template's fields, at most 15 lines |

### Waves

No two packages of a wave edit the same file. The reshape packages share the structure-quality baseline and the forming-sweep list, so they go one per wave.

| Wave | Packages |
|---|---|
| 1 | D4-ACTIVE, D4-SMES, D4-CASE-UEV, D4-CASE-UIV, D4-CASE-UXV, D4-LINKS |
| 2 | D4-UEV-PHOTON |
| 3 | D4-SHAPE-UEV-A |
| 4 | D4-SHAPE-UEV-B, D4-UIV-MAINFRAME |
| 5 | D4-SHAPE-UIV-A, D4-UXV-SPIN |
| 6 | D4-SHAPE-UIV-B, D4-CHARTS-UEV |
| 7 | D4-SHAPE-UXV-A, D4-CHARTS-UIV, D4-QUESTS-UEV |
| 8 | D4-SHAPE-UXV-B, D4-QUESTS-UIV |
| 9 | D4-CHARTS-UXV |
| 10 | D4-QUESTS-UXV |

### Contracts

#### D4-ACTIVE (wave 1)

| Field | Value |
|---|---|
| Objective | T0's active-block count includes our `gtceu:coil` blocks (`grindless:hftacn_coil_block`, `grindless:metallic_hydrogen_coil_block`, and any later `grindless:*_coil_block` registered as `gtceu:coil`) |
| Rationale | D4-8: GTM 7.5.3 makes them ActiveBlocks (`CoilBlockBuilder.java:64-67`, `CoilBlock.java:26`); counted, the pulsar wind trap holds 256 |
| Allowed | `tools/analysis/lib/active_blocks.mjs`, `tools/analysis/test/active-blocks.test.mjs` |
| References | `active_blocks.mjs:7-10`; section 8, the "now" counts |
| Dependencies | none |
| Acceptance | a test pins a structure with our coils; `active-blocks.mjs` reports no structure above 264 (the largest in the handoff) |
| T1 | none |

#### D4-SMES (wave 1)

| Field | Value |
|---|---|
| Objective | the OpV cell is rewound from four UXV cells (section 10) |
| Allowed | `pack/kubejs/server_scripts/grindless/opv/wireless.js` (the `opv_smes_cell` row), `tools/analysis/test/opv-wireless.test.mjs`, `pack/kubejs/client_scripts/grindless/opv_wireless_lang.js` (only a text that lists the inputs) |
| References | `opv/wireless.js:8,22-23`; `composites.json:15-26`; `wireless_energy.json:70-73` |
| Dependencies | none; no D5 package edits that row in the same wave |
| Acceptance | the row as section 10; the UXV cell has a recipe consumer; capacity lint passes |
| T1 | none |

#### D4-CASE-UEV (wave 1)

| Field | Value |
|---|---|
| Objective | the UEV family: register `sic_composite_casing`, `superhydride_magnet_casing` and `hftacn_lining_casing`; their recipes; the new `photonic_casing` and `degenerate_containment_casing` recipes; textures in the UEV style; names and two tooltip lines each |
| Allowed | new `startup_scripts/grindless/uev/casings.js`, `server_scripts/grindless/uev/casings.js`, `client_scripts/grindless/uev_casings_lang.js`, `tools/assets/Build-UEVCasingTextures.ps1`, `assets/grindless/textures/block/uev/{sic_composite_casing,superhydride_magnet_casing,hftacn_lining_casing}.png`, `tools/analysis/test/uev-casings.test.mjs`; `tables/photonics_uev.json` (the `photonic_casing` row), `tables/sirius.json` (the `degenerate_containment_casing` row). The `tools/assets/README.md` row is proposed in the handoff; the integrator adds the three families' rows at once |
| References | `uev/foundation.js:59-62,118-126` (block registration); `Era.Lib.ps1:58`; `tools/assets/README.md:1641-1645`; section 9 |
| Dependencies | none |
| Acceptance | each casing's predicted score lands in its band. The prediction is the sum of input scores on `$GG_DUMP` divided by the outputs, printed on the VM and quoted in the handoff. No crafting-table recipe. Tooltips, lang parity and capacity pass |
| T1 | none |

#### D4-CASE-UIV (wave 1)

| Field | Value |
|---|---|
| Objective | the UIV family: register `rhea_casing`, `mh_field_casing`, `multilayer_optics_casing` and `dilution_cryostat_casing`, with recipes as section 9; the new `neutron_star_site_casing` and `uiv_fusion_casing` wall recipes |
| Allowed | new `uiv/casings.js` (startup and server), `uiv_casings_lang.js`, `Build-UIVCasingTextures.ps1`, `block/uiv/*.png` for the four, `uiv-casings.test.mjs`; `tables/rx_j1856.json` (the row at :112), `tables/mk5.json` (the row at :92). The `tools/assets/README.md` row is proposed in the handoff; the integrator adds the three families' rows at once |
| References | `uiv/foundation.js:62-65,127-135` (block registration); `Era.Lib.ps1:59`; section 9 |
| Dependencies | none |
| Acceptance | as D4-CASE-UEV |
| T1 | none |

#### D4-CASE-UXV (wave 1)

| Field | Value |
|---|---|
| Objective | the UXV family: register `gum_metal_casing`, `mu_metal_shield_casing`, `pulsed_field_casing` and `pasta_containment_casing`, with recipes as section 9; the new `uxv_fusion_casing` recipe |
| Allowed | new `uxv/casings.js` (startup and server), `uxv_casings_lang.js`, `Build-UXVCasingTextures.ps1`, `block/uxv/*.png` for the four, `uxv-casings.test.mjs`; `tables/fusion_mk6.json` (the row at :7). The `tools/assets/README.md` row is proposed in the handoff; the integrator adds the three families' rows at once |
| References | `uxv/foundation.js:127-129,192-200` (block registration); `Era.Lib.ps1:55`; `uxv.md:928-953` (bootstrap) |
| Dependencies | none |
| Acceptance | as D4-CASE-UEV, and no Vela or Cassiopeia A product in the four new casings |
| T1 | none |

#### D4-LINKS (wave 1)

| Field | Value |
|---|---|
| Objective | census II keeps census I and census III keeps census II, as non-consumed inputs (`superheavy.json:393-460`); the SX master alloy takes 6N Hf (E3); the SPDC source takes 1 `ktp_electroded_wafer` instead of 2 `gtceu:ppktp_dust` (E7, `earth_orbit.json:184`) |
| Allowed | `tables/superheavy.json` (the two census rows); `tables/electron_beam.json` (the `sx_master_alloy` row, :166-168); `tables/earth_orbit.json` (the `spdc_source` row); `tools/analysis/test/uev-electron_beam.test.mjs`, `uev-earth_orbit.test.mjs`, `uiv-rx_j1856.test.mjs` (the census II case, :260-281) and `uxv-superheavy.test.mjs` (the census III case, :103-106); the EMI text of those rows in their lang files (`git grep -n -e census_ii -e sx_master_alloy -e spdc_source -- pack/kubejs/client_scripts`) |
| Dependencies | none |
| Acceptance | census I and the poled KTP wafer each have a consumer; capacity lint passes (the chemistry lab's slots) |
| T1 | none |

#### D4-UEV-PHOTON (wave 2)

| Field | Value |
|---|---|
| Objective | E1 steps 15 to 24: nine new intermediates, the changed QPC row; `hbn_emitter_chip` and the old QPC assembly removed |
| Allowed | `tables/photonics_uev.json`; `server_scripts/grindless/uev/photonics.js` (only if the table needs a type it does not read); new `startup_scripts/grindless/uev/photonic_wafer.js`; the registration line of `hbn_emitter_chip` (`startup_scripts/grindless/uev/photonics.js`); `uev_photonics_lang.js`; new `uev_photonic_wafer_lang.js`; new `Build-UEVPhotonicWaferTextures.ps1` and the item PNGs; `tools/analysis/test/uev-photonics.test.mjs`; every other touchpoint of `hbn_emitter_chip` (`git grep -l -e hbn_emitter_chip -- pack tools/analysis tools/quests tools/test`: `pl-data-uev.mjs`, `uev-chapter/circuits-data.mjs`, `gg_test_emi_coverage_expect.json`), removal only; never `pack/index.toml` or `pack/config/ftbquests/**` |
| References | section 2, E1; `photonics_uev.json:176-200`; `photonics.json:325-329`; `uev.md:366-396` |
| Dependencies | D4-CASE-UEV |
| Acceptance | the QPC row takes `pigtailed_quantum_die` with the superfluid helium charge kept; the optical computer and tensor core rows still find the QPC; every new id has a producer and a consumer in the static load; capacity lint passes |
| T1 | none |

#### D4-SHAPE-UEV-A (wave 3): eighteen UEV workhorses and field units (section 8)

| Field | Value |
|---|---|
| Structures | chemistry lab, megabar press, electron beam furnace, single-crystal foundry, nitride magnet works, SiC fibre plant, CVI furnace, SNSPD foundry, vdW stacker, helium-3 polariser, quantum gas lab, entanglement station, dust lab, pulsar station, carbonyl refinery, nebula collector, white dwarf spectrograph, Barnard drill |
| Objective | section 8's targets with the UEV family as body; appearance blocks and casing models follow the new body |
| Allowed | the patterns, appearance blocks and casing models in `startup_scripts/grindless/uev/{shapes,superheavy,megabar,electron_beam,composites,photonics,earth_orbit,alpha_centauri,barnard,sirius}.js`; `tools/analysis/structure_quality.json` (these entries); `tools/test/overlay/kubejs/config/gg_test_form_sweep_ids.json` (only if an entry changes); the `tools/analysis/test/uev-*.test.mjs` files that pin these sizes; `tools/analysis/tooltip_lint.json` and the `uev_*_lang.js` lines that state a size |
| References | section 8; `structures.md:18-88` and its QR-S5 notes; `uev/shapes.js` |
| Dependencies | D4-ACTIVE, D4-CASE-UEV, D4-UEV-PHOTON |
| Acceptance | cells within ±15 % of the target; bbox inside 60 x 60 x 124; the rubric passes with no baseline violation; active blocks at or under section 8's maximum; family casings at least 60 % of the non-part cells, and no block above 60 %; body over controller between 1 and 3 (the static bill priced with section 9's scores), quoted |
| T1 | the forming sweep over these ids (strict) |

#### D4-SHAPE-UEV-B (wave 4): UEV halls, flagships and merges

| Field | Value |
|---|---|
| Structures | calutron, the Superheavy Factory (absorbing the recoil separator), photonic integration hall, Mk4, the Degenerate Works (absorbing the containment works), stellar forge |
| Objective | section 8; the two merges (the survivor gains the absorbed recipe type; the absorbed controller, its controller recipe, lang, tests and quest and chart references go) |
| Allowed | as A, plus every touchpoint of the two absorbed ids that `git grep -l -e recoil_separator -e containment_works -- pack tools/analysis tools/quests tools/test` lists at the package's base (`kubejs.instructions.md:7`), edited by rename to the survivor or removal only; research items that name an absorbed controller point to its survivor (the chemistry lab's, `server_scripts/grindless/uev/superheavy.js:167`). The shared files in that list are named here, as `release.instructions.md:15` requires: `tools/analysis/tiers/{uev,uiv,uxv}.json`; `tables/cost_curve/uev.json` (the ids go, the factors stay; the integrator re-measures the curve in T2); `tools/test/overlay/kubejs/config/gg_test_emi_coverage_expect.json`. Never the integrator's `pack/index.toml` or `pack/config/ftbquests/**`. The OpV files in the list (`opv-chapter/integration-data.mjs`, `pl-data-opv.mjs`) are serialized with D5's packages |
| Dependencies | D4-SHAPE-UEV-A |
| Acceptance | as A, with flagships at 5 times their controller or less |
| T1 | the forming sweep over these ids, and one recipe lookup per merged type on its survivor |

#### D4-UIV-MAINFRAME (wave 4)

| Field | Value |
|---|---|
| Objective | I1 steps 25 to 28: two new intermediates, the changed tensor core and mainframe rows, the microcomb as an input |
| Allowed | `tables/photonics_uev.json` (rows c4, c5 and two new ones); new `startup_scripts/grindless/uiv/mainframe_module.js`; new `uiv_mainframe_module_lang.js`; `uiv_mainframe_lang.js` (EMI lines); new textures script and PNGs; `tools/analysis/test/uiv-mainframe.test.mjs` |
| Dependencies | D4-UEV-PHOTON |
| Acceptance | the mainframe row no longer takes `crossbar_on_interposer`, which the compute module consumes; `eo_microcomb` has two consumers |
| T1 | none |

#### D4-SHAPE-UIV-A (wave 5): fifteen UIV workhorses and field units

| Field | Value |
|---|---|
| Structures | levitation melter, TFLN fab, femtosecond writer, hole burner, STM cell, millikelvin works, proton source, droplet works, r-process decompressor, decay heat vault, wind trap, positronium lab, X-ray profiler, crust lift, ergosphere bay |
| Allowed | as D4-SHAPE-UEV-A, for `startup_scripts/grindless/uiv/*.js` and `uiv/shapes.js`, the `uiv-*.test.mjs` that pin sizes and the `uiv_*_lang.js` size lines |
| Dependencies | D4-CASE-UIV, D4-SHAPE-UEV-B |
| Acceptance | as D4-SHAPE-UEV-A |
| T1 | as D4-SHAPE-UEV-A |

#### D4-UXV-SPIN (wave 5)

| Field | Value |
|---|---|
| Objective | X1: two front-end rows (MOCVD, photonic foundry); three rewired inputs (MRAM stack, SAF track, STNO stack); the back-end rows (two new vdW stacker circuits on the UEV `vdw_assembly` type, a photonic foundry row, a cutter row); the new mainframe row; `meso_logic_die` and its row removed |
| Allowed | `tables/spin_logic.json`, `spin_deposition.json`, `photonics_uev.json` (the c7 row); `server_scripts/grindless/uxv/{spin_logic,spin_rows,spin_feed}.js`; new `startup_scripts/grindless/uxv/spin_wafer.js`; `uxv_spin_logic_lang.js`, `uxv_spin_rows_lang.js`; new `uxv_spin_wafer_lang.js`; new textures script and PNGs; `uxv-spin_logic.test.mjs`, `uxv-spin_rows.test.mjs`, `uxv-spin_deposition.test.mjs`; every other touchpoint of `meso_logic_die` (`git grep -l -e meso_logic_die -- pack tools/analysis tools/quests tools/test`: its registration in `uxv/foundation.js`, `uxv_foundation_lang.js`, `tables/photonics.json`, `recipe_bridge.json`, `uxv-foundation.test.mjs`, `pl-data-uxv.mjs`, `uxv-chapter/circuits-data.mjs`, `gg_test_emi_coverage_expect.json`, and the shared `tools/analysis/tiers/uxv.json`), removal only; never `pack/index.toml` or `pack/config/ftbquests/**` |
| Dependencies | D4-UIV-MAINFRAME |
| Acceptance | the mainframe row as section 4, step 29; `racetrack_chip` still feeds MAX+'s 3D stack; no orphan id |
| T1 | none |

#### D4-SHAPE-UIV-B (wave 6): UIV halls, flagships and the merge

| Field | Value |
|---|---|
| Structures | Mk5, Matrioshka, Penrose engine, pulser, BEUV scanner, the Neutron Drip Works (absorbing the drip separator), compression hall |
| Allowed | as D4-SHAPE-UIV-A, plus every touchpoint of `neutron_drip_separator` (`git grep -l -e neutron_drip_separator -- pack tools/analysis tools/quests tools/test`), by rename to the survivor or removal only. Shared files named: `tools/analysis/tiers/{uiv,uxv}.json`, `tables/cost_curve/uiv.json` (as UEV-B), `startup_scripts/grindless/sounds.js` and `assets/grindless/sounds.json` (its entry), `gg_test_emi_coverage_expect.json`. Never `pack/index.toml` or `pack/config/ftbquests/**`; `maxplus-chapter/integration-data.mjs` is serialized with D5 |
| Dependencies | D4-SHAPE-UIV-A |
| Acceptance | as D4-SHAPE-UEV-B |
| T1 | as D4-SHAPE-UEV-B |

#### D4-CHARTS-UEV (wave 6)

| Field | Value |
|---|---|
| Objective | `pl_uev` as section 11: eleven clusters with feeders, the staged `extends`, keepShort ends |
| Allowed | `tools/quests/processing-lines/pl-data-uev.mjs` |
| Dependencies | D4-UEV-PHOTON, D4-LINKS, D4-SHAPE-UEV-B |
| Acceptance | the Node suite passes. The handoff lists the expected lengths (section 1) for the integrator's T2 line audit and `pl-check` |
| T1 | none |

#### D4-SHAPE-UXV-A (wave 7): ten UXV workhorses and field units

| Field | Value |
|---|---|
| Structures | YIG furnace, SHeQUID works, annihilation laser works, plasma mass filter, condensation tower, FRC former, disk skimmer, pasta extractor, polar cap tap, ejecta sweeper |
| Allowed | as D4-SHAPE-UEV-A for `startup_scripts/grindless/uxv/*.js`, the `uxv-*.test.mjs` that pin sizes and the `uxv_*_lang.js` size lines |
| Dependencies | D4-CASE-UXV, D4-SHAPE-UIV-B |
| Acceptance | as D4-SHAPE-UEV-A |
| T1 | as D4-SHAPE-UEV-A |

#### D4-CHARTS-UIV (wave 7)

| Field | Value |
|---|---|
| Objective | `pl_uiv` as section 11 |
| Allowed | `pl-data-uiv.mjs` |
| Dependencies | D4-UIV-MAINFRAME, D4-SHAPE-UIV-B, D4-CHARTS-UEV |
| T1 | none |

#### D4-QUESTS-UEV (wave 7)

| Field | Value |
|---|---|
| Objective | the UEV chapter as section 11 |
| Allowed | `tools/quests/uev-chapter/*.mjs` |
| Dependencies | D4-CASE-UEV, D4-SHAPE-UEV-B, D4-CHARTS-UEV |
| Acceptance | `tools/quests/test` passes. The handoff gives the expected quest counts for `GG_QUESTS_EXPECTED`; the integrator regenerates the chapter and records them. Every casing has a quest; every structure above 2,300 blocks names its two passes |
| T1 | none |

#### D4-SHAPE-UXV-B (wave 8): UXV halls, flagships and merges

| Field | Value |
|---|---|
| Structures | Mk6, MNT collider, stellar elevator, the Spintronic Cluster Tool (absorbing the PLD chamber and the racetrack fab), the Pasta Mill (absorbing the draw bench and the laminator), BZ dynamo, fractionation hall; the vdW stacking cell leaves and its type joins the UEV vdW stacker (its recipe-type list in `uev/photonics.js`) |
| Allowed | as D4-SHAPE-UXV-A, plus every touchpoint of the five absorbed ids (`git grep -l -e pasta_draw_bench -e pasta_laminator -e oxide_pld_chamber -e racetrack_fab -e vdw_stacking_cell -- pack tools/analysis tools/quests tools/test`), by rename to the survivor or removal only; research items that name an absorbed controller point to its survivor (the polar cap tap's, `server_scripts/grindless/uxv/vela_pasta.js:208`). Shared files named: `tools/analysis/tiers/{uxv,maxplus}.json`, `tables/cost_curve/uxv.json` (as UEV-B), `sounds.js` and `sounds.json` (their entries), `gg_test_emi_coverage_expect.json`; and the `vdw_stacker` definition in `startup_scripts/grindless/uev/photonics.js:76` (its recipe-type list). Never `pack/index.toml` or `pack/config/ftbquests/**`; the OpV, MAX and MAX+ files in the list are serialized with D5 |
| Dependencies | D4-SHAPE-UXV-A, D4-UXV-SPIN |
| Acceptance | as D4-SHAPE-UEV-B; MAX+'s rows on `racetrack_patterning` c7 and `mtj_sputtering` c32 still find their machine |
| T1 | as D4-SHAPE-UEV-B |

#### D4-QUESTS-UIV (wave 8)

| Field | Value |
|---|---|
| Objective | the UIV chapter as section 11 |
| Allowed | `tools/quests/uiv-chapter/*.mjs` |
| Dependencies | D4-CASE-UIV, D4-SHAPE-UIV-B, D4-CHARTS-UIV |
| Acceptance | as D4-QUESTS-UEV |
| T1 | none |

#### D4-CHARTS-UXV (wave 9)

| Field | Value |
|---|---|
| Objective | `pl_uxv` as section 11 |
| Allowed | `pl-data-uxv.mjs` |
| Dependencies | D4-UXV-SPIN, D4-SHAPE-UXV-B, D4-CHARTS-UIV |
| T1 | none |

#### D4-QUESTS-UXV (wave 10)

| Field | Value |
|---|---|
| Objective | the UXV chapter as section 11 |
| Allowed | `tools/quests/uxv-chapter/*.mjs` (with `layout.mjs`) |
| Dependencies | D4-CASE-UXV, D4-SHAPE-UXV-B, D4-CHARTS-UXV |
| Acceptance | as D4-QUESTS-UEV |
| T1 | none |

## 13. Licences

Nothing is imported. Every line follows a real process:
- integrated quantum photonics (Pernice 2012, Phare 2015, Davanco 2017);
- photonic tensor cores (Feldmann 2021) and single-photon readout (Wang 2022);
- embedded MRAM and freestanding oxide membranes (Lu 2016);
- the Mond process, Bridgman single crystals, CMSX-4, Hi-Nicalon S;
- stellar nucleosynthesis (B²FH 1957);
- the actinide ladder of HFIR campaigns.

Fiction stays named as fiction: the superhydride at ambient pressure, pasta, degenerate matter, the stellar-burning ring.

Other sources:
- **StarT (MIT):** U-3's cold-mass idea (winding, impregnation, quench test) informs the field casings, as an idea; nothing is copied.
- **GTNH, Technological Journey and Gregicality:** not used.
- **GTM (LGPL-3.0):** its `CoilBlock` facts are read and cited, nothing copied.

Proposed CREDITS line: none.

## 14. Risks

- **A monolithic flow stops the circuit when one module stalls.** That is real fab behaviour. Each module is one recipe the player can buffer, and the discrete SNSPD, QD source, graphene modulator, MTJ die and racetrack chip keep their other uses.
- **Eight controllers leave.** Their quests, charts and tests change in the merge packages. The integrator regenerates the chapters. OpV and MAX+ rows on moved types follow their type, which T2's recipe lookup must confirm.
- **Casing bands are estimates on dump `5d57213f3b83`'s cost model;** the casing packages tune the counts. No core component changes, so the cost curve's index does not move for the casings. The merges drop eight controllers from the curve's key-item lists (`tables/cost_curve/{uev,uiv,uxv}.json`), so the integrator re-measures the index once in T2 (`cost-matrix.mjs --table --factors`). D4-SMES raises the OpV cell's price, which is not a core component.
- **New volume demand.** Each new body is a production campaign:

  | Era | Volume line |
  |---|---|
  | UEV | SiC/SiC |
  | UIV | RHEA, rad-hard controllers |
  | UXV | gum metal |

  The casing packages report each recipe's batch, and the line packages' T2 reachability shows the rates hold.
- **Bigger structures** cost more structure-check time. Twelve need two Terminal passes. Active blocks stay capped, and T0 now counts ours.
- **GTM's UIV and UXV machine casings stay in the hulls**, so the hull outliers remain, as explained in `02_cost_curve.md`.
- **Staged counting needs D1-AUDIT's `extends`,** and needs D2 and D3 to keep the kept intermediates of section 5 (M2's boule, UV's heavy curium oxide, UHV's berkelium-249).
- **The CMOS step (X1, 7) takes UHV's ultrapure water,** a small amount per wafer.