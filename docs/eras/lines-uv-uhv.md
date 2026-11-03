# Long process lines and multiblock sizes, UV and UHV (D3-LINES)

Design package D3-LINES (#289), 2026-11-03, for AGENTS.md principle 7 (depth first in every tier, 2026-11-02) and principle 4 (multiblocks grow with their tier and use, 2026-11-03). The owner delegated every decision on 2026-11-03, so each material choice is recorded below as a **Decision** with the options weighed. Research: `docs/research/long-lines.md` band 3. Every recipe, voltage and material named here as existing was read from the batch dump `5d57213f3b83` (the batch 15 T2 dump, `exec-20261103-062414-2969798` and later queries); "new" marks what this design adds, and no new species exists in GTM 7.5.3, GTCA, GT-- or GCYR under another name unless the text says so. Nothing under `pack/` or `tools/` changes in this package; the implementation packages are listed in section 9 and contracted in the handoff.

## 0. How the steps are counted

- The rules of D1 hold (`docs/eras/lines-steam-hv.md`:5-12): a step is one machine recipe that makes a new species or a new part; form changes (dust, ingot, plate, melting, freezing) are not steps; the end product of another line is a raw input (a crossing).
- **Measured** is what `tools/analysis/line-audit.mjs` will count on the charts this design asks for: a machine node is one step, an item a machine node makes is that machine's step, an item made straight from items is one step. Charts draw no form change.
- **Staged across UV and UHV.** Both eras are this band, so a UHV stage of a UV line counts from the UV start, through the item it takes. The audit adds the whole UV stage (its own end included), so where the UV stage ends after the hand-off item the audit reads one step more; both figures are given.
- **Critical path:** the longest chain when every input takes its shortest route in the era, required feeders included (a working solution such as TBP must be made once). A catalyst that is kept (the heliopause data, the Triton ice core) still has to exist, so its chain counts.
- **A worn tool counts** when it is consumed by chance (a fibre laser module at 2% in the printer): the printer cannot run without it.
- **Guide** (owner, 2026-11-02): longest line about UV 22 and UHV 24, several long lines per era, never padded. Chains under 4 steps leave the charts unless the audit's `keepShort` names why.

## 1. Summary

| Era | Line | Steps (measured) | Critical path | Status |
|---|---|---|---|---|
| UV | V1 Thorium cycle: nuclear-grade thoria to uranium-233 | 18 | 17 | rework: THOREX with TBP, oxalate and calcination, carbothermic nitride pellets and pins, head-end chop, cathode processing, the protactinium-233 hold; merges `uv.thorium` and the fuel fabrication plant's one-step assemblies |
| UV | V2 Starshot: fibre lasers, the printed probe and the downlink | 14 | 14 | MCVD unfolded (soot, solution doping, collapse), the grating drawn, facet-coated diode bars; merges the `starshot`, `parts` and `probe` chains |
| UV | V3 Pluto's ices to the UV circuit | 10 | 10 | merge of `uv.pluto` with GTM's wetware chain; the ice annealer merges into the fractionator (section 6) |
| UV | V5 Boron-11: borax to the p-B11 capsule | 7 | 4 | charted from borax through the isotope column; no recipe change (the IV hot cell route is the shorter one) |
| UV | V4 SRF cavities: niobium to the cryomodule | 6 | 6 | deep-drawn half-cells and the dressed cavity added |
| UV | V7 BNNT: borax to the Pluto rocket's tank | 6 | 6 | charted from borax; no recipe change |
| UV | V6 Neptune's fusion fuels: helium-3 and deuterium | 5 | 5 | exists; charted as its own line |
| UV | V8 Americium and neutronium; V9 EnTED wire | 4; 4 | same | exist; V9's chart end is corrected (the UV SMES cell takes the wire) |
| UV | Muon-catalysed fusion | 2 | 2 | `keepShort` as today |
| UHV | W1 Thorium II: uranium-233 to the nuclear clock | 22 (audit 23) | 21 | staged from V1; the clock crystal is grown from laser-grade ThF4 |
| UHV | W2 Thorium III: the high-flux reactor (californium-252, berkelium-249, nickel-63) | 22 (audit 23); nickel-63 21 | 21 | staged from V1 through the HFIR driver element; no new recipe |
| UHV | W3 Light computing: lithium niobate to the wetware mainframe | 9 | 9 | etched LNOI waveguides added; SiC source powder from polysilicon |
| UHV | W11 The gate ring: MgB2 coils for the warp gate | 10 | 8 | new: cable, winding, reaction, impregnation and quench test; the warp gate casing is made from qualified coils (StarT U-3, adapted) |
| UHV | W5 Mercury to the swarm | 9 | 9 | merge of `uhv.mercury` and `uhv.power`; the aluminium form change and the refurbishing loop are not counted |
| UHV | W7 PBO to the geo-assembled stage and the ICAN motor (W8 UHTC joins at the motor) | 9 | 9 | charted through the ribbon and the elevator; no recipe change |
| UHV | W6 Proxima life: strains, chitosan and melanin to the base casing and the organoid | 8 | 8 | chitin and chitosan unfolded |
| UHV | W4 Ultrapure water | 6 | 6 | the plant's one recipe becomes five grades and a polish, on GTCA's purified water grade fluids |
| UHV | W9 Antimatter for the gate | 6 | 6 | exists; charted |
| UHV | W10 RTAN to the UHV SMES cell | 5 | 5 | exists; the ingot form change leaves the chart |
| UHV | Carbon-12 spreaders; oganesson propellant | 4; 4 | same | exist |
| UHV | ZBLAN fibre | 3 | 3 | `keepShort` as today |

Against the line-audit on the batch dump (real lines of 4+, longest): UV 9 lines, longest 12 (`starshot#proxima_approach_data`), becomes 9 design lines, longest 18, with three of 10 or more; UHV 12, longest 9 (`uhv.power`), becomes 12 design lines, longest 22, with three of 10 or more. Before D1 (dump 6f89eb0df970) UV was 10 and 12, UHV 12 and 9.

The guide asks about 22 at UV: V1 stops at 18 because every further step would be padding (Decision D3-1); the thorium line reaches 22 in its UHV stages.

## 2. UV

### V1 Thorium cycle: nuclear-grade thoria to uranium-233 (18; critical path 17)

**What is in the pack.** The fuel fabrication plant (IV) turns 8 thorium dust and oxygen, or 8 thorium dust, carbon and nitrogen-15, into a fuel assembly in one row (`tables/thorium_fabrication.json`, circuits 4 and 5); the accelerator-driven reactor burns it (1,572,864 EU/t); the pyroprocessing cell turns the spent fuel back into uranium-233 and thorium in one or two rows (`tables/thorium.json`). Charted as `uv.thorium`, 7 steps.

**Real process.** Reactor thorium must be free of neutron poisons (gadolinium, samarium, boron), so ore thorium is purified by the THOREX solvent extraction (tributyl phosphate in kerosene, Oak Ridge), precipitated as the oxalate and calcined to thoria. Nitride fuel is made by carbothermic nitridation of the oxide under nitrogen-15 (nitrogen-14 would breed carbon-14), pressed and sintered into pellets and loaded into 15-15Ti steel pins (the MYRRHA cladding for lead-bismuth). After the burn, nitride fuel is chopped and electrorefined in molten chloride (JAEA and Argonne): the nitride dissolves at the anode and gives its nitrogen back, uranium deposits on the cathode, and the cathode is distilled free of salt. Thorium breeds uranium-233 through protactinium-233 (27-day half-life); the protactinium in the salt is pulled into molten bismuth by lithium reduction and held until it decays (the ORNL molten-salt breeder's protactinium isolation).

| # | Machine | In → out | Process |
|---|---|---|---|
| 1 | Chemical reactor, 480 EU/t (GTM `butraldehyde`, exists) | propene + 2,000 mB H2 + 1,000 mB CO → butyraldehyde | hydroformylation (oxo) |
| 2 | Chemical reactor, 7,680 EU/t (new) | butyraldehyde + 2,000 mB H2, nickel kept → n-butanol (new) | hydrogenation |
| 3 | Chemical reactor, 7,680 EU/t (new) | 3,000 mB n-butanol + 1,000 mB POCl3 (`phosphoryl_chloride`, exists) → 1,000 mB tributyl phosphate (new) + 3,000 mB HCl | esterification |
| 4 | Mixer, 7,680 EU/t (new) | 300 mB TBP + 700 mB kerosene → 1,000 mB TBP solvent (new) | 30% TBP diluent |
| 5 | Extraction cascade (EV machine, new UV row, 122,880 EU/t) | crude thorium nitrate (below) + TBP solvent → loaded TBP solvent (new) + raffinate: nitric acid and 250 mB lanthanide nitrate (exists) | THOREX extraction; the poisons stay in the raffinate |
| 6 | Extraction cascade (new UV row) | loaded solvent + distilled water → thorium nitrate (new, nuclear grade) + 980 mB TBP solvent (back to 5) | stripping |
| 7 | Chemical reactor, 122,880 EU/t (new) | thorium nitrate + `gtca:oxalate` (GTCA, exists) → thorium oxalate (new) + nitric acid (back) | oxalate precipitation |
| 8 | EBF 1,073 K, 122,880 EU/t (new) | thorium oxalate → thoria (new, ThO2) + CO + CO2 | calcination |
| 9 | Fuel fabrication plant (IV machine, new row) | 2 thoria + 4 carbon + 500 mB nitrogen-15 → 2 thorium nitride (exists, ours) + 4,000 mB CO | carbothermic nitridation under N-15 |
| 10 | Fuel fabrication plant (new row) | 8 thorium nitride → 8 thorium nitride pellets (new) | pressing and sintering in nitrogen-hydrogen |
| 11 | Fuel fabrication plant (new row) | 4 pellets + 15-15Ti cladding tube (new) + helium → thorium nitride fuel pin (new) | pin loading, helium bond, end-cap welding |
| 12 | Fuel fabrication plant (`thorium_nitride_assembly`, changed) | 2 pins + 2 stainless steel plates → thorium nitride fuel assembly | wire-wrapped bundle in a hexagonal wrapper (8 thorium per assembly, as today) |
| 13 | Accelerator-driven reactor (exists) | assembly, lead-bismuth kept → spent nitride fuel + Po-210 | the spallation-driven burn (power) |
| 14 | Pyroprocessing cell (new mode `chop`, 524,288 EU/t) | spent nitride fuel → 2 spent nitride fragments (new) + radioactive waste (the hulls) | head-end chopping and decladding |
| 15 | Pyroprocessing cell (`nitride`, changed) | 2 fragments, LiCl kept → U-233 cathode deposit (new) + thorium dust + 250 mB loaded LiCl + 500 mB nitrogen-15 | electrorefining with anodic dissolution |
| 16 | Pyroprocessing cell (`salt`, changed) | 1,000 mB loaded LiCl + lithium + 144 mB molten bismuth → LiCl + 144 mB protactinium bismuth (new) + radioactive waste | reductive extraction of protactinium; fission products to the waste form |
| 17 | Pyroprocessing cell (new mode `decay`) | 144 mB protactinium bismuth → uranium-233 dust + 144 mB molten bismuth | the protactinium-233 hold, then stripping |
| 18 | Fuel fabrication plant (`uranium_233_rod`, exists) | 4 uranium-233 + 4 zircaloy tubes → U-233 fuel rod | rod fabrication; end: IV's fission reactor |

- **Thorium feed** (parallel input of 5): large chemical reactor, 122,880 EU/t (new): 4 thorium dust + 16,000 mB HNO3 + 100 mB HF → 4,000 mB crude thorium nitrate (new) + 4,000 mB NO2 (Thorex dissolution; fluoride catalyses it). The thorium dust is a crossing (section 4).
- **Cathode branch** (critical path): pyroprocessing cell, new mode `cathode`: U-233 cathode deposit → U-233 ingot + 250 mB LiCl (back). It is a separation (the entrained salt is distilled off under vacuum), not a form change, so it counts. Steps 1-15, the cathode and 18 make the critical path of 17; the protactinium hold adds the bred uranium the salt carries (about a quarter at discharge).
- **Nitrogen-15 branch** (exists, `uv.thorium`): Triton geyser sampler → Triton nitrogen → Triton nitric oxide (chemical reactor) → nitrogen-15 oxide (EV cryogenic plant) → nitrogen-15 (reduction); step 15 returns most of it.
- **Oxide route** (before Triton, no nitrogen-15): thoria → thoria pellets (new, fuel fabrication plant) → thoria fuel pins (new) → `thorium_oxide_assembly` (changed: pins and plates instead of dust and oxygen) → ADR → spent oxide fuel → `chop` → spent oxide fragments (new) → `reduce` (changed: takes fragments) → thorium-uranium metal → `refine` (changed: gives the cathode deposit) → cathode → U-233. One step longer at the back, it breeds less, and the ADR burns it 12,000 ticks against the nitride's 16,000, as today.
- **15-15Ti cladding tube** (new): fuel fabrication plant, stainless steel ingot + titanium → 2 tubes.
- **Byproducts:** lanthanide nitrate → `lanthanide_nitrate_to_chloride` (exists) → rare-earth chloride → the EV extraction cascade; nitric acid back to the dissolution; NO2 → nitric acid (LV Ostwald stages); HCl → chlorine chemistry; CO → the syngas plant or methanol; CO2 → the ark or voided (inert); hulls and salt waste → contained, the waste retrieval plant (synroc); Po-210 contained, decays to lead (exists); thorium, nitrogen-15, TBP solvent and bismuth go round.
- **New materials:** fluids n-butanol, tributyl phosphate, TBP solvent, loaded TBP solvent, crude thorium nitrate, thorium nitrate, protactinium bismuth; dusts thorium oxalate, thoria; items thoria pellet, thorium nitride pellet, thoria fuel pin, thorium nitride fuel pin, 15-15Ti cladding tube, spent oxide fragments, spent nitride fragments, U-233 cathode deposit. GTM 7.5.3 registers thorium but no thorium compound; GTM, GTCA, GT-- and GCYR register no butanol, TBP or protactinium (dump queries `thori|oxal|butyl|protactin`).

### V2 Starshot: fibre lasers, the printed probe and the downlink (14; critical path 14)

The longest UV line today (12, `starshot#proxima_approach_data`), drawn as one tangle split into five chains. Real process: Breakthrough Starshot (a lunar phased laser array pushing gram-scale chips on metasurface sails), rare-earth fibre lasers by MCVD and solution doping (Southampton, 1987), InGaAs pump diodes, laser powder bed fusion, gridded ion thrusters, photon-counting downlink. Today one recipe goes from silicon tetrachloride to the doped preform; MCVD is three real operations.

| # | Machine | In → out | Process |
|---|---|---|---|
| 1 | Fibre draw tower (new mode `soot`, 122,880 EU/t) | fused silica tube + 5 SiCl4 + 100 mB GeCl4 + 3,700 mB O2 → MCVD soot tube (new) + 4,400 mB Cl2 | soot deposition inside the substrate tube |
| 2 | Fibre draw tower (new mode `dope`) | soot tube + 250 mB ytterbium chloride solution (new) + aluminium → doped soot tube (new) | solution doping |
| 3 | Fibre draw tower (`preform`, changed) | doped soot tube + chlorine and oxygen → Yb-doped preform (exists) + glass dust | drying, sintering and collapse |
| 4 | Fibre draw tower (`draw`, exists) | preform + acrylate → 16 Yb fibre | drawing |
| 5 | Assembler (`fibre_bragg_grating`, exists) | Yb fibre + germanium + lens + H2 → fibre Bragg grating | UV inscription in hydrogen-loaded fibre |
| 6 | Fibre draw tower (`laser_module`, exists) | 4 fibre + 4 pump modules + grating → fibre laser module | pump combining and splicing |
| 7 | Powder bed printer (exists) | 8 tritanium powder + a module (2%) → near-net thruster chamber | laser powder bed fusion |
| 8 | Powder bed printer (exists) | near-net chamber → printed thruster chamber | hot isostatic pressing |
| 9 | Thruster works (exists) | grids, LaB6 cathode, chamber, xenon → ion thruster | assembly |
| 10 | Thruster works (exists) | ion and Hall thrusters, UV circuit, tank → thruster pod | assembly |
| 11 | Assembler (exists) | 2 probe RTG + pod + HPGe + UV sensor + printed frame → precursor probe | assembly |
| 12 | Precursor probe bay (exists, Pluto orbit) | probe + 4 ICAN pellets → heliopause data | the heliopause flight |
| 13 | Laser sail launcher (exists, the Moon) | sailcraft + heliopause data (kept) + modules (64%) → Starshot probe | launch |
| 14 | Optical ground station (exists) | probe + SNSPD array (kept) + superfluid helium → Proxima approach data | photon-counting downlink |

- **Pump diodes** (6 steps, as long as the fibre): organometallics (MOCVD reactor c1) → InGaAs epi (c2) → diode bars (c3) → facet-coated diode bars (new mode: alumina and tantala mirror coatings, new item) → pump module (c5, now from coated bars) → laser module.
- **Ytterbium chloride solution** (new fluid): chemical reactor, ytterbium oxide (the EV cascade's UV row) + HCl → solution + water.
- **Branches, all existing:** the sail (wake epitaxy → nitride carrier → metasurface → release → light sail → sailcraft); the starchip (X-ray lithography: PMMA wafer → exposed → developed → photonic chip; with the NV diamond chip, the americium micro-source and a neutronium wafer); the probe RTG (curium oxide → pellet → GPHS → RTG); HPGe (germanium → GeCl4 → ingot → crystal); the SNSPD array (sapphire boule → wafer → NbN film → array); the Kuiper noble gases (interceptor → planetesimal → annealing → Kuiper noble gas → krypton and xenon for the thrusters).
- **Chart honesty:** today the printer node is drawn from the laser module, so the atomising (which needs no laser) reads as a laser step. The chart draws atomising and printing apart; the measured 14 is the honest figure.
- **Byproducts:** chlorine → HCl and back to SiCl4 chemistry; glass dust → glass; arsine → scrubbed to arsenic and hydrogen (exists); spent laser modules refurbished (exists); argon looped; xenon and krypton returned by the thruster works.

### V3 Pluto's ices to the UV circuit (10)

Merges `uv.pluto` (7) with GTM's wetware chain, which the chart stopped at the neuro processing unit. Real process: ice penetrators (cryobot), fractional sublimation of nitrogen, carbon monoxide and methane ices, a closed ecological system (algae and archaea, as ESA's MELiSSA), sterilisation of the medium, neural culture.

| # | Machine | In → out | Process |
|---|---|---|---|
| 1 | Powder bed printer (exists) | near-net probe frame (V2's printer) → printed probe frame | hot isostatic pressing |
| 2 | Assembler (exists) | frame + GPHS + HPGe + melt head + UV sensor → penetrator probe | assembly |
| 3 | Penetrator probe bay (exists, Pluto orbit) | probe, Triton ice core kept → Sputnik ice core or Charon core | coring |
| 4 | Volatile ice fractionator (exists; absorbs the annealer, section 6) | Charon core → water + ammonia + silica; Sputnik core → nitrogen, CO, methane, tholin | fractional sublimation |
| 5 | Ark biosphere (exists) | cultures kept + CO2 + ammonia + water → raw growth medium + oxygen + biomass | closed ecosystem |
| 6 | Neural culture vat (exists) | raw medium + gelatin, neural organoid kept → 64 stem cells | expansion |
| 7 | Neural culture vat (exists) | 8 stem cells + wetware board + sterilised medium → 4 neuro processing units | neural processing units |
| 8 | Circuit assembler (GTM) | → wetware processor (`gtceu:wetware_processor`, LuV circuit) | circuit assembly |
| 9 | Circuit assembler (GTM) | → wetware processor assembly (ZPM circuit) | circuit assembly |
| 10 | Circuit assembler (GTM) | → wetware processor computer (`gtceu:wetware_processor_computer`, the UV circuit) | circuit assembly; end: every UV machine |

- Sterilisation (parallel, exists): GTM's fluid heater in a sterile cleanroom, raw → sterilised growth medium.
- Byproducts: oxygen → the network; biomass → the culture seed (exists); nitrogen → the nitrogen network; CO → the syngas plant's Pluto shift; methane → the pyrolyser; tholin → the tholin reformer; silica → glass (all exist).

### V4 SRF cavities: niobium to the cryomodule (6)

Real process: TESLA nine-cell cavities are deep-drawn as half-cells from RRR niobium sheet, electron-beam welded into dumbbells and the cavity, chemically polished and nitrogen-doped (Fermilab), then welded into a titanium helium vessel (the dressed cavity) before the string goes into the cryomodule. Today sheet → bare cavity is one row and the cryomodule takes bare-treated cavities.

| # | Machine | In → out |
|---|---|---|
| 1 | SRF cavity works c1 (exists) | 4 niobium ingot → 3 RRR sheets + scrap (electron-beam melting) |
| 2 | SRF cavity works (new mode) | RRR sheet → 2 niobium half-cells (new) (deep drawing) |
| 3 | SRF cavity works c2 (changed) | 18 half-cells → bare nine-cell cavity (EB welding) |
| 4 | SRF cavity works c3 (exists) | bare cavity + electropolish acid + nitrogen → SRF cavity (surface and nitrogen doping) |
| 5 | SRF cavity works (new mode) | SRF cavity + 2 titanium plates + helium → dressed SRF cavity (new) (helium vessel) |
| 6 | SRF cavity works c4 (changed) | 8 dressed cavities + 2 UV field generators + mu-metal shield + superfluid helium → SRF cryomodule |

The later rows that take the plain SRF cavity (Nb3Sn diffusion, the confinement cavity, the MAX cavity) keep taking it. Byproducts: niobium scrap and spent acid back (exist).

### V5 to V9 and the muon cell

- **V5 Boron-11 (7; critical path 4):** borax → boric acid → boron trioxide → BF3 (chemical reactor with HF) → isotope column → boron-11 trifluoride → decaborane (chemical reactor) → p-B11 capsule (diamond CVD on the lattice fab's plate) → laser fusion chamber. Every recipe exists; the chart starts at borax instead of boron dust. The IV hot cell route (boron dust + fluorine → B-11 trifluoride) is the shorter one. Boron-10 trifluoride → the BN reactor (exists).
- **V6 Neptune's fusion fuels (5):** deep siphon → Neptune helium → superleak (superfluid helium plant) → helium-3 concentrate → isotope column → helium-3 → D-He3 capsule (with the siphon's deuterium) → laser fusion chamber. Exists; helium-4 → superfluid helium.
- **V7 BNNT (6):** borax → boric acid → boron trioxide → hexagonal boron nitride (BN reactor, ammonia) → nanotubes (hydrogen plasma) → yarn → BNNT fuel tank (cryotank winder). Exists; charted from borax.
- **V8 Americium and neutronium (4)** and **V9 EnTED wire (4):** unchanged. V9's chart end says "stored: no recipe uses it yet"; the UV SMES cell takes 16 EnTED wires (`naquadria_magnets/uv_smes_cell`), and the chart says so.
- **Muon-catalysed fusion (2):** `keepShort` as today.

## 3. UHV

### W1 Thorium II: uranium-233 to the nuclear clock (22, the audit reads 23; critical path 21)

The UHV stage of the thorium line. Real process: thorium-229 is milked from aged uranium-233 stockpiles (Oak Ridge); in 2024 JILA and TU Wien drove its 8.4 eV nuclear transition with a VUV frequency comb in thorium-doped calcium fluoride grown from ThF4.

| # | Machine | In → out | Process |
|---|---|---|---|
| 1-17 | V1 steps 1 to 17 | → uranium-233 | V1 |
| 18 | Transuranium facility (`decay_store`, exists) | 8 uranium-233 → thorium-229 + 8 uranium-233 | in-growth (the uranium is kept) |
| 19 | Hot cell (IV, `thorium_229_nitrate`, exists) | thorium-229 + HNO3 → thorium-229 nitrate | anion-exchange purification |
| 20 | Fluorspar kiln (IV, `laser_grade_thf4`, exists) | thorium-229 nitrate + HF → laser-grade ThF4 + HNO3 | fluoride precipitation |
| 21 | Crystal growth furnace (`thorium_caf2`, changed) | 3 fluorite + laser-grade ThF4 + PbF2 scavenger, iridium crucible → Th:CaF2 crystal | doped crystal growth |
| 22 | Nuclear clock lab (`clock`, exists) | crystal + VUV comb + UHV circuit → nuclear clock | the isomer locked to the comb |

- Change: `thorium_caf2` takes `grindless:laser_grade_thf4` instead of `grindless:thorium_229`. `thf4_from_thorium_229` keeps the MBE thin-film route (the chip clock).
- VUV comb (exists): fluorite → VUV CaF2 boule (crystal growth) → VUV optics (cutter) → comb (nuclear clock lab, with V2's fibre laser module and xenon).
- End: the UHV link of the wireless network, the warp gate and the Casimir harvest (both keep it), and the later clocks of UEV and up.
- Byproducts: nitric acid back (exists); hydrogen → network; worn iridium crucibles → the platinum plant (exists).

### W2 Thorium III: the high-flux reactor (22, the audit reads 23; nickel-63 21; critical path 21)

The other UHV stage, all recipes existing. Real process: Oak Ridge's HFIR and REDC breed berkelium and californium from curium targets; nickel-63 for betavoltaics is bred from enriched nickel-62.

| # | Machine | In → out |
|---|---|---|
| 1-17 | V1 steps 1 to 17 | → uranium-233 |
| 18 | Fuel fabrication plant (`hfir_driver_element`) | 3 uranium-233 + 4 aluminium foil → 2 HFIR driver elements |
| 19 | High flux reactor (`transcurium_target`) | target + 6 drivers → irradiated target + 6 spent drivers + waste |
| 20 | Transuranium facility (`dissolve`) | irradiated target + HNO3 → transcurium liquor + fission product liquor |
| 21 | Transuranium facility (`separate`) | liquor + HDEHP solvent → berkelium-249 + 2 californium-252 + heavy curium oxide |
| 22 | High flux reactor (`californium_source`) | californium-252 + platinum foil + helium → sealed californium-252 source |

- Targets (exist): heavy curium oxide (UV's heat source works) + 2 americium (ZPM's partitioning plant) + aluminium → transcurium target (transuranium facility).
- Nickel-63 (21): nickel-62 target (IV hot cell, carbonyl centrifuge) and 6 drivers → nickel-63 target (19) → plating liquor (20) → betavoltaic cells on diamond diodes (21).
- HDEHP solvent (exists, 5 steps): propene → butyraldehyde → 2-ethylhexenal → 2-ethylhexanol → HDEHP → solvent. One oxo front feeds TBP (V1) and HDEHP.
- Byproducts (exist): spent drivers → pyroprocessing → uranium-233; fission product liquor → evaporated → waste (contained) and nitric acid; spent HDEHP → incinerated → phosphoric acid; heavy curium oxide → the next target; berkelium-249 → stored for UEV (section 4).

### W3 Light computing: lithium niobate to the wetware mainframe (9)

Merges the photonics chains (lithium niobate, phase change, quantum memory, cascade lasers) with the ultrapure water and silicon carbide feeders into the UHV circuit. Real process: thin-film lithium niobate on insulator (He+ smart cut, ridge waveguides by argon-ion milling, gold electrodes), heterogeneous photonic integration.

| # | Machine | In → out |
|---|---|---|
| 1 | Crystal growth furnace (`lithium_niobate`, exists) | 2 lithium + niobium oxide + O2, iridium crucible → LN boule |
| 2 | Cutter (exists) | boule → 16 LN wafers |
| 3 | Ion implanter (ZPM, `ln_smart_cut`, exists) | wafer + helium → implanted LN wafer |
| 4 | Photonic foundry (`lnoi_wafer`, exists) | implanted wafer + silicon wafer + ultrapure water + HF → LNOI wafer |
| 5 | Photonic foundry (new mode) | LNOI + argon → etched LNOI wafer (new) |
| 6 | Photonic foundry (`thin_film_modulators`, changed) | etched LNOI + gold foil + ultrapure water → 16 thin-film modulators |
| 7 | Photonic foundry (`optical_processor`, exists) | LNOI + PCM dies + cascade lasers + modulators + ultrapure water → 2 optical processors |
| 8 | Photonic foundry (`optical_assembly`, exists) | 3 processors + 3 quantum memory chips → optical assembly |
| 9 | Organoid array (exists) | optical assembly + 4 organoid processors + SiC power module → wetware mainframe |

- Ultrapure water is W4's end product, so W3 takes it as a crossing and counts 9 (section 0).
- **SiC power module** (changed front): SiC device fab, new mode: polysilicon (D1's `grindless:polysilicon`) + graphite → SiC source powder (new); `sic_boule` takes it instead of GTCA's abrasive-grade silicon carbide dust; then wafers, epi, aluminium implant, anneal, modules (exist). Real: PVT source powder is synthesised from electronic-grade silicon and carbon. GTCA's dust keeps the mirror blanks and the later substrates.
- Branches (exist): PCM dies (GST target sputtered on LNOI), quantum memory (Eu:YSO boule → chips), cascade lasers (InP boule → wafer → MBE superlattice → lasers), organoid processors (W6).
- Byproducts (exist): LN offcut back to the LNOI row, water and argon → network, graphite back.

### W4 Ultrapure water (6)

Today one row: water + NaOH + HCl, ion exchange resin kept → ultrapure water + salt water. Real process: the semiconductor UPW train (carbon filtration, two-pass reverse osmosis, electrodeionisation, 185 nm UV oxidation of organics, membrane degassing, mixed-bed polishing and ultrafiltration to 18.2 MΩ·cm). GTCA 2.2.0 registers eight purified water grades and seven purification units; the pack gives the units no controller recipe (`integration/gtca.js`:49), so the grade fluids are registered, hidden and unused. The train uses grades 1 to 5.

| # | Ultrapure water plant row | In → out |
|---|---|---|
| 1 | new | 8,000 mB water + activated carbon (5%) → 8,000 mB purified water grade 1 |
| 2 | new | grade 1 → 6,000 mB grade 2 + 2,000 mB salt water (the RO concentrate) |
| 3 | new | grade 2 → grade 3 (electrodeionisation) |
| 4 | new | grade 3 → grade 4 + 50 mB CO2 (UV oxidation) |
| 5 | new | grade 4 → grade 5 (degassing) |
| 6 | `ultrapure_water`, changed | grade 5 + NaOH + 1,000 mB HCl, resin kept → 6,000 mB ultrapure water + salt water (polishing; the acid and caustic regenerate the beds) |

- Rate: every row keeps today's 200 ticks, so one plant makes a sixth of today's flow; a second plant or the UHV parallel hatch restores it. Times are not inflated: the extra cost is five real steps.
- Grades 6 to 8 stay free for D4 (UEV and later), which owns research U-5.
- Byproducts: salt water → brine electrolysis (exists); CO2 → the Proxima greenhouses or voided (inert).

### W5 Mercury to the swarm (9)

Merges `uhv.mercury` (5) and `uhv.power` (9); the aluminium dust → ingot form change leaves the chart. Real process: Dyson swarm segments, regolith vaporised in a solar furnace, molten oxide electrolysis, aluminised film, inverted metamorphic multijunction cells, SiC power electronics.

- Longest chain (SiC): SiC source powder (1) → boule (2) → wafer (3) → epi (4) → implanted (5) → device wafer (6) → power modules (7) → swarm segment foundry (8) → swarm control station (9, a generator). The refurbished segment is the same species coming round, so the chart draws it as a return from the station and it is not a step (today's chart counts it).
- Mercury branch (exists): excavator → low fraction (stripped regolith, Na-K, sulfur) → high fraction (alumina-calcia, magnesium, SiO, iron, graphite) → aluminium (electrolysis) → reflector film (light sail fab) → segment.
- Other inputs (exist): IMM arrays (MOCVD epi → lift-off → array with cerium coverglass), fibre laser modules (V2), C-12 spreaders, betavoltaic cells (W2), Na-K heat pipes; oganesson propellant pods.
- Byproducts (exist): Na-K → heat pipes; sulfur → sulfuric acid; magnesium → W11; SiO, iron, graphite → network; worn segments refurbished; tanks return.

### W6 Proxima life: strains, chitosan and melanin to the base casing (8)

Real process: chitosan from fungal chitin (demineralise, deproteinise, deacetylate in hot caustic), freeze-cast scaffolds, melanised radiotrophic fungi, microbially induced calcite (biocement). Today 8 mushrooms + NaOH + HCl → 2 scaffolds in one row.

| # | Machine | In → out |
|---|---|---|
| 1 | Sample receiving facility (`isolate`, exists) | flora sample (rover) + sterilised medium → characterised strain |
| 2 | Xenobotany greenhouse (`mushrooms`, exists, Proxima b) | strain kept + water + CO2 → 8 xeno mushrooms |
| 3 | Xenobiochemistry plant (new mode) | 8 mushrooms + HCl + NaOH → 2 xeno chitin (new) + salt water |
| 4 | Xenobiochemistry plant (new mode) | 2 chitin + 4 hot NaOH → 2 chitosan (new) |
| 5 | Xenobiochemistry plant (`chitosan`, changed) | 2 chitosan + acetic acid → 2 chitosan scaffolds |
| 6 | (exists) | melanin extract + scaffold → melanin-chitosan composite |
| 7 | (exists) | composite → flare shield panel |
| 8 | Assembler (exists) | panel + 4 biocemented regolith + naquadah alloy frame → 2 Proxima base casings |

- Scaffold → organoid processor → mainframe (W3); radioprotectant (biomass → lysate → radioprotectant → sterilised medium), melanin (radiotrophic vat), biocement (biomining heap) and far-red algae branches exist.
- Byproducts (exist): salt water → brine; biomass → biorefinery; oxygen → the base's air; ammonium chloride → fertiliser.

### W7 PBO to the geo-assembled stage and the ICAN motor (9); W8 UHTC (6, joins at the motor)

All recipes exist; the chart runs them through. Real process: Zylon from 1,2,3-trichlorobenzene via 4,6-diaminoresorcinol and terephthalic acid in polyphosphoric acid, dry-jet wet spinning; a CNT, BNNT and PBO ribbon; ZrB2-SiC ultra-high-temperature ceramics by spark plasma sintering.

- W7: benzene → trichlorobenzene (chemical reactor) → dinitrotrichlorobenzene → chlorodinitroresorcinol → diaminoresorcinol → PBO dope → PBO fibre (PBO plant, five rows) → tether ribbon segment (ribbon works) → geo-assembled stage (GTCA's space elevator, our `geo_lift`) → ICAN rocket motor (thruster works).
- W8: red zircon (the End) → zirconia → zirconium diboride → UHTC blend (with SiC) → tile → nozzle (spark plasma sinterer, with a TaC liner) → the motor.
- Byproducts (exist): HCl, salt, dilute sulfuric acid → network; phosphoric acid → polyphosphoric acid; carbon monoxide → syngas.

### W11 The gate ring: MgB2 coils for the warp gate (10; critical path 8)

The flagship's body. Today the warp gate casing is 6 neutronium plates + a frame + 4 MgB2 wires → 2 casings. Real process: a warp-gate ring is, before it is fiction, a ring of superconducting magnets: wind-and-react MgB2 coils (MRI magnets, CERN's MgB2 links), cabled round a copper stabiliser, insulated with polyimide, reacted, impregnated, cold-tested and integrated in their cryostat. Idea from StarT's stargate component rods (research U-3, MIT); nothing is copied, and its fantasy steps (riftic enhancement, quantum compressor) stay out.

| # | Machine | In → out |
|---|---|---|
| 1 | Solar vapour furnace low fraction (exists, Mercury) | 16 regolith → stripped regolith + Na-K + sulfur |
| 2 | Solar vapour furnace high fraction (exists) | stripped regolith → 3 magnesium + SiO + iron + alumina-calcia + graphite |
| 3 | Mixer (GTM) | magnesium + 2 boron → magnesium diboride (GTM material) |
| 4 | Powder-in-tube line (`mgb2_wire`, exists) | 6 MgB2 + 2 iron tubes → 8 MgB2 single wires + iron |
| 5 | Naquadria magnet works (ZPM machine, new mode, 1,966,080 EU/t) | 8 wires + 2 copper foil → MgB2 cable (new) |
| 6 | Magnet works (new mode) | 4 cables + 4 Kapton K foil (GCYR) → gate coil winding (new) |
| 7 | EBF 973 K (new) | winding, argon → reacted gate coil (new) |
| 8 | Composite autoclave (HV machine, new row) | reacted coil + 288 mB epoxy → impregnated gate coil (new) |
| 9 | Magnet works (new mode) | impregnated coil + 1,000 mB liquid helium → qualified gate coil (new) + 1,000 mB helium |
| 10 | Assembler (`warp_gate_casing`, changed) | qualified coil + 4 neutronium plates + neutronium frame → 2 warp gate casings |

- Critical path 8: magnesium from GTM's other routes skips steps 1 and 2.
- Cost: the reshaped gate (section 6) holds about 700 casings, so about 350 coils per gate, and the pair is built twice: a project, as a flagship should be. The MgB2 single wire keeps its other uses; the `uhv.mercury` infrastructure chain of 2 merges into W11.
- Byproducts: iron back to the tubes; helium back; the vapour furnace's as W5.

### W9, W10 and the short chains

- **W9 Antimatter for the gate (6, exists):** magnesium target → sodium-22 target (synchrotron) → moderated source (neon) → positron cartridge (accumulator) → antihydrogen cartridge (UV's antimatter trap, with V2's antiprotons) → warp gate: Proxima gate seed. Casimir (fiction, labelled): SiC mirror blank → NbN plate → cavity stack → exotic matter cell → the gate.
- **W10 RTAN to the UHV SMES cell (5, exists):** cold-trap regolith → biomining heap (PGM liquor) → platinum plant (ruthenium) → RTAN (alloy blast smelter) → RTAN wire (powder-in-tube) → UHV SMES cell (magnet works). The ingot form change leaves the chart.
- **Carbon-12 spreaders (4)** and **oganesson propellant (4):** unchanged. **ZBLAN (3)** keeps its `keepShort`; its batch question is Decision D3-9. **Heavy water** from Proxima ice keeps its `resource` role.

## 4. Crossings

Hand-off items at the band's edges. D3 stops at each and names it; the other band owns what lies beyond.

**Into UV and UHV (ZPM and older; D1, D2 and the mods):**

| Item | From | Into |
|---|---|---|
| Thorium dust | IV's pitchblende centrifuge (the documented source), GTM's thorium ore and monazite chains | V1's dissolution. If D2's monazite line (research E-1) separates a thorium cake, the dissolution takes it too, and the integrator gives both charts the `thorium` line id. |
| Propene, benzene, terephthalic acid, kerosene, epoxy, Kapton K | HV refinery and aromatics (D1-H3), GCYR | V1 (oxo front), W2 (HDEHP), W7, W11 |
| POCl3, LiCl, lead-bismuth eutectic, zircaloy tubes, HF | IV chemistry, the fuel fabrication plant, the fluorspar kiln | V1, W1 |
| `gtca:oxalate` | GTCA large chemical reactor (sugar or ethanol over V2O5) | V1 step 7 |
| Ytterbium oxide, Mars lithium, niobium oxide | the EV extraction cascade (its UV row), EV Mars | V2, W3 |
| Gallium, Io indium and germanium, GaAs wafers | MV gallium line, LuV Io, LuV and ZPM | V2, W3, W5 |
| Curium oxide, americium, NV diamond chip, the ion implanter, the pyrolyser's CNT yarn, the aerogel tank | ZPM | V2, V7, W2, W3, W7 |
| Neural organoid, strains and cultures, the algae bioreactor | LuV organoid lab, biofoundry | V3, W6 |
| Plutonium-241, quantum star, tritium, heavy water, nickel-62 target | IV | V8, the muon cell, W2 |
| Enriched naquadah, trinium, europium, duranium | LuV and ZPM | V9 |
| Ruthenium | EV platinum plant | W10 |
| Polysilicon | MV (D1-M2) | the SiC source powder (W3, W5) |

**Out of UV and UHV:**

| Item | To |
|---|---|
| Lanthanide nitrate (V1's raffinate) | → rare-earth chloride → the EV extraction cascade (D2) |
| Uranium-233 fuel rods | IV's fission reactor (D2) |
| Radioactive waste | ZPM's waste retrieval plant (synroc) |
| Berkelium-249, stored | UEV's superheavy targets (D4) |
| Californium-252 source | the cold-trap drill (UHV) and UEV's irradiated YBCO (D4) |
| Nuclear clock, SRF cryomodule, wetware mainframe, optical assembly, fibre laser module, stellar neighbourhood chart | UEV and later machines (D4, D5) |
| Ultrapure water; GTCA purified water grades 6 to 8 left free | D4, if it takes research U-5 to its higher grades |

**Research band 3 (`docs/research/long-lines.md`:197-252) in this band:**

- U-5 (water grades, LuV to UXV): UHV takes grades 1 to 5 as W4; grades 6 to 8 are D4's.
- U-3 (stargate component rods, ZPM to UIV, MIT): adapted as W11, the gate ring; the ASG and DSG stages, if any, are D4's.
- U-2 (akreyrium catalysts, LuV to UIV): its real adaptation is isotope separation in a calutron, which UEV owns; nothing enters UV or UHV.
- U-1 (hormone line, UHV to UIV): not taken; UHV's biotech is W6, and the line's UEV stages are D4's to decide.

## 5. Basic materials that change

| Material | Today | After | What it moves |
|---|---|---|---|
| Thorium fuel (UV) | an assembly from 8 thorium dust and oxygen, or with carbon and nitrogen-15, in one row | THOREX, oxalate, thoria, pellets, pins, assembly | the ADR's fuel cost (one nitride assembly still gives about 25 G EU); `tables/thorium_fabrication.json`; the UV chapter's thorium quests. Thorium per assembly unchanged (8). |
| Uranium-233 (UV) | one or two pyroprocessing rows | chop, electrorefining, cathode processing, the protactinium hold | total U-233 per assembly unchanged, about a quarter after the hold; HFIR drivers, W1's thorium-229, U-233 rods |
| n-butanol and TBP (UV, new) | none | the oxo front shared with HDEHP | butyraldehyde demand (GTM's oxo row, propene from the HV refinery) |
| Fibre laser module (UV) | preform in one row | MCVD in three rows; facet-coated diode bars | every module consumer: the laser fusion chamber, the printer, the launcher, the clock comb, swarm segments, laser module blocks and later eras; count per module unchanged |
| SRF cryomodule (UV) | bare-treated cavities | half-cells and dressed cavities | cryomodule blocks (synchrotron, ADR, muon cell) and UEV machines |
| Ultrapure water (UHV) | one row | six rows on GTCA grades 1 to 5 | 30+ photonic foundry rows (UHV to MAX), the organoid array, xenobiochemistry; a plant makes a sixth of today's flow |
| SiC power module (UHV) | boule from GTCA silicon carbide dust | boule from SiC source powder (polysilicon and graphite) | polysilicon demand (MV, M2); every module consumer (mainframe, swarm, ICAN motor, geo stage, climber) |
| Chitosan (UHV) | one row | chitin, chitosan, scaffold | organoid processors, the Proxima base casing |
| Th:CaF2 crystal (UHV) | from thorium-229 | from laser-grade ThF4 | the hot cell and the fluorspar kiln run one row more each per crystal |
| Warp gate casing (UHV) | neutronium and 4 MgB2 wires | a qualified MgB2 gate coil and neutronium | the gate pair's cost (about 700 casings each); MgB2 and Mercury magnesium demand |
| ZBLAN batch (LuV) | mixer | large chemical reactor, same ratios | LuV's optical pipes only (D3-9) |
| Thorium dust, niobium, boron, lithium, nickel | as today | as today | nothing |

Reachability: every new row runs in a machine its era already has (the extraction cascade, the fuel fabrication plant, the EBF, the large chemical reactor, the pyroprocessing cell, the fibre draw tower, the MOCVD reactor, the SRF cavity works, the ultrapure water plant, the photonic foundry, the SiC device fab, the xenobiochemistry plant, the magnet works, the composite autoclave). D3 adds no machine; one machine merges into another (section 6).

## 6. Multiblock sizes by use

The guide (`docs/quality/structures.md`:34-88): UV workhorse 300 to 600 cells, plant or hall 600 to 1,200, flagship 1,000 to 1,500; UHV 400 to 700, 700 to 1,400 and 1,400 to 2,000; a field unit is about a third of its era's workhorse band. Measured on the batch dump (`structure-quality.mjs --dump`, `exec-20261103-062529-2970313`): UV 33 structures, median 273; UHV 32, median 211. A machine grows when its size contradicts its use: a flagship or plant far under its band, or a workhorse under about 70% of its floor (UV 210, UHV 280). Machines within about a quarter of their band stay: their use is small and padding is forbidden.

Rules for every reshape: the rubric holds (no block above 70% of the cells, at least 3 block types, 2 kinds of functional detail, parts on the surface); GTM's Terminal must still build it (no custom predicate without candidates); GTM ActiveBlocks (wire, fusion and superconducting coils, heat vents) stay at 80 or fewer per structure, far under T0's 264; the formed look (`appearanceBlock`, overlay) and the controller recipe stay. The UEV casing-family rule does not apply: each body uses the pack's own casing where the process needs one, and only the warp gate's casing changes recipe (W11). Targets are approximate; a package lands within about 15% and says why.

**UV**

| Machine | Use | Now | Target | Silhouette | Casings (body; detail) | Package |
|---|---|---|---|---|---|---|
| Laser sail launcher | flagship | 15×3×15, 506 | ~1,300 | a lunar phased array: a 21×21 truss deck with laser emitters on alternate cells (about 220), coolant runs between them, a beam director tower at the centre, a low radiator fence | laser module block (ours, UV: each holds a fibre laser module), station truss; UV machine casing, frames, glass | SIZE-UV1 |
| Laser fusion chamber | flagship | 13×13×13, 866 | ~1,200 | a spherical target chamber with fusion-glass ports at the centre of twelve beamline arms over a capacitor floor | UV machine casing; laser module blocks (about 48, the beamlines), fusion glass, tungstensteel frames | SIZE-UV1 |
| Starchip fab | workhorse | 5×5×5, 99 | ~320 | a clean room: a filter-ceiling hall with a bonding line, a dicing saw and a test bench behind glass | photonic casing (ours, UV); GTM filter casing, plascrete, glass | SIZE-UV1 |
| Heat source works | workhorse | 5×5×7, 146 | ~350 | a shielded glovebox line: hot press, iridium-clad welder, RTG assembly bay behind lead glass | radiation vault casing (ours, LuV); GT-- radiation-proof casing, laminated glass | SIZE-UV1 |
| Pyroprocessing cell | plant (V1's back end and 5 other rows) | 7×7×7, 255 | ~800 | three hot cells in a row (head end, electrorefiner, cathode processor) behind lead glass, an argon duct on the roof, a salt loop; the electrorefiner banded with heaters | radiation vault casing; radiation-proof casing, laminated glass, PTFE pipe casing, cupronickel coils (≤ 40) | SIZE-UV2 |
| Fibre draw tower | plant (V2's MCVD and 14 later rows) | 5×15×5, 272 | ~650 | the draw tower (furnace, coating cups, capstan) beside a horizontal MCVD lathe hall, joined by a preform hoist | clean casing, photonic casing; glass, tungstensteel frames | SIZE-UV2 |
| MOCVD reactor | workhorse (30+ rows, UV to MAX) | 7×7×7, 245 | ~450 | a cluster tool: a transfer hub with four showerhead chambers, gas cabinets and an arsine scrubber stack | clean casing, photonic casing; PTFE pipe casing, glass | SIZE-UV2 |
| Zone refining tower | workhorse (19 rows) | 3×13×3, 114 | ~350 | a quartz tower with travelling RF coil rings over an argon glovebox base, the chlorination column beside it | clean casing; tungstensteel frames, glass, cupronickel coils (≤ 30) | SIZE-UV2 |
| Powder-in-tube line | workhorse (6 rows, UV and later) | 3×5×15, 200 | ~350 | a draw-bench hall: packing station, swaging, a row of dies, an annealing furnace | UV machine casing; steel frames, coils (≤ 24) | SIZE-UV2 |
| Volatile ice fractionator, absorbing the amorphous ice annealer | plant (three rows, Pluto orbit) | 7×7×7, 231 + 5×7×5, 135 | ~650 | a cryogenic fractional sublimation column with an annealing carousel at its foot, inside the station truss | station truss; cryostat casing (ours), frostproof casing, glass | ICEWORKS |

Unchanged: ADR 725 and synchrotron 1,138 (in band); muon cell 459, ark 525, thruster works 341, cryotank winder 303, ground station 317, BN reactor 284, SRF works 292, superfluid plant 273, light sail fab 252, neural vat 232, antimatter trap 218, event horizon interferometer 260 (within about a quarter of the workhorse floor, small uses); the field units (siphon 373 and 423, Triton sampler 223, penetrator bay 273, Kuiper bay 281, precursor bay 331); the mega factory 1,310.

**UHV**

| Machine | Use | Now | Target | Silhouette | Casings (body; detail) | Package |
|---|---|---|---|---|---|---|
| Warp gate (built twice) | flagship | 15×5×15, 280 | ~1,800 | a standing ring about 25 across and 5 deep, nine chevrons as frame clusters, a field-coil band on the inner face, a control deck and an antimatter feed spur at its foot | warp gate casing (W11's coils); field ring casing (ours, UHV), neutronium frames, station truss | SIZE-UHV1 |
| Swarm control station | flagship (Kardashev II) | 11×5×11, 258 | ~1,500 | a hub under a sunshade, four long relay booms ending in laser transmitter heads, a propellant depot ring | station truss; Hermean heat-shield brick (ours), laser module blocks (about 64), pressure hull casing | SIZE-UHV1 |
| Swarm segment foundry | plant | 9×7×9, 166 | ~800 | an orbital assembly hangar: a long jig bay, film roll stands, a segment dock | hangar casing (ours, UHV); station truss, glass | SIZE-UHV1 |
| Baseline astrometer | workhorse | 9×9×9, 151 | ~450 | two telescope towers on a long truss boom with a beam-combiner hut between them | station truss; photonic casing, glass | SIZE-UHV1 |
| Transuranium facility | plant (10+ rows) | 9×7×9, 360 | ~900 | a hot-cell bank: seven cells in a row behind lead glass, manipulator ports, a tank farm under the floor, a stack | radiation vault casing; radiation-proof casing, laminated glass, PTFE pipe casing | SIZE-UHV2 |
| Nuclear clock lab | workhorse | 7×5×9, 253 | ~450 | an optical hall on an isolated slab: VUV vacuum chamber, comb enclosure, shielded clock cell | photonic casing; clean casing, glass, frames | SIZE-UHV2 |
| Crystal growth furnace | plant (40+ rows) | 5×9×5, 219 | ~650 | three Czochralski pullers (tall pull towers with coil bands) on a shared argon manifold | clean casing, robust casing; glass, coils (≤ 60) | SIZE-UHV2 |
| MBE reactor | workhorse | 7×5×9, 263 | ~450 | an ultra-high-vacuum cluster: load lock, growth chamber ringed by effusion cells, cryopanels | clean casing, photonic casing; frostproof casing, glass | SIZE-UHV2 |
| Photonic foundry | plant (30+ rows, UHV to MAX) | 11×5×9, 375 | ~900 | a clean-room fab hall: lithography, etch and bonding bays under a filter ceiling | photonic casing; clean casing, GTM filter casing, glass | SIZE-UHV2 |
| SiC device fab | plant | 7×5×7, 188 | ~750 | a PVT furnace tower, an epi reactor, an anneal furnace and a module line in one hall | clean casing; heatproof casing, coils (≤ 48), glass | SIZE-UHV3 |
| Solar array fab | workhorse | 7×5×7, 194 | ~450 | a laminating line under a clean hood | clean casing, photonic casing; glass | SIZE-UHV3 |
| Ultrapure water plant | plant (W4) | 7×5×11, 358 | ~800 | a treatment train: carbon filters, RO skids, EDI stacks, UV reactors, a degasser column, a polishing skid | inert casing; PTFE pipe casing, glass | SIZE-UHV3 |
| Betavoltaic fab | workhorse | 7×5×7, 201 | ~450 | a shielded plating line and a cell sealing press | radiation vault casing, inert casing; glass | SIZE-UHV3 |
| Xenobiochemistry plant | workhorse (W6) | 7×5×7, 184 | ~450 | lysis tanks and chromatography columns behind BSL-4 walls | BSL-4 casing (ours, UHV); inert casing, glass | SIZE-UHV4 |
| Radiotrophic vat | workhorse | 5×5×5, 101 | ~400 | an open culture vat under a flare window | Proxima base casing (ours, UHV); glass, frames | SIZE-UHV4 |
| Cold-trap drill | field unit | 5×6×5, 62 | ~170 | a drill rig with a coring tower | Proxima base casing; frames | SIZE-UHV4 |
| Regolith excavator | field unit | 9×3×5, 93 | ~170 | a bucket-wheel excavator | Hermean heat-shield brick; frames | SIZE-UHV4 |
| Solar vapour furnace | workhorse | 9×5×9, 143 | ~450 | a heliostat bed, a concentrator and a crucible receiver tower | Hermean heat-shield brick; glass, frames | SIZE-UHV4 |
| Organoid array | workhorse (the UHV circuit) | 7×5×7, 194 | ~500 | a sterile hall with racks of electrode-array incubators | plascrete, GTM sterilizing filter casing; glass | SIZE-UHV5 |
| PBO plant | plant (the five PBO rows and nine later ones) | 7×5×9, 230 | ~800 | a reactor train beside a dry-jet wet spinning tower | inert casing; PTFE pipe casing, frames, glass | SIZE-UHV5 |
| Tether ribbon works | workhorse | 11×5×5, 211 | ~500 | a long braiding hall with bobbin carousels | robust casing; frames, glass | SIZE-UHV5 |
| Spark plasma sinterer | workhorse (25+ rows) | 5×5×7, 152 | ~450 | a press frame with stacked graphite dies and a pulsed power bank | robust casing, heatproof casing; coils (≤ 32) | SIZE-UHV5 |
| ZBLAN draw tower | workhorse (Earth orbit) | 5×15×5, 195 | ~450 | a tall orbital draw tower with a preform melt cell | station truss, clean casing; glass | SIZE-UHV5 |

Unchanged: high flux reactor 603 (a plant 14% under its band), Casimir array 433, positron accumulator 312, sample receiving facility 304, xenobotany greenhouse 343, biomining heap 278, rover bay 173 (field unit), solar probe bay 112 (field unit, 14% under), the quantum fabricator 600 (mega).

After the reshapes the UHV median is about 450 and the UV median about 300; UHV is no longer smaller than UV.

## 7. Decisions

The owner delegated every decision (2026-11-03). Each was weighed as below; the chosen option is first.

**D3-1 UV's longest line stops at 18.**

| Option | Consequence |
|---|---|
| **A** V1 at 18 measured (critical path 17); the thorium line reaches 22 in UHV | honest: every step is a separate species in a real thorium cycle |
| B Start V1 at monazite inside UV (crush, magnetic separation, caustic cracking, selective leach: about 22) | duplicates the monazite cracking that D2's rare-earth line (research E-1) is likely to build at EV; two recipes for one process |
| C Add a spent-fuel cooling pool, a second extraction cycle, separate pressing and sintering | padding: a wait or a form change is not a new species |

If D2's monazite line hands a thorium cake to V1, the two charts share the `thorium` line id and the staged line counts from monazite (about 22 at UV), as H1 counts from M1.

**D3-2 Where V1 starts:** **A** `gtceu:thorium_dust`, from any source, purified by THOREX (thorium from ore always is: the poisons must go); B a UV-only thorium ore digestion (a second route to thorium that only the critical path would skip); C keep the one-row assemblies (the 7-step line the audit found too thin). A.

**D3-3 Protactinium-233:** **A** a protactinium hold in the pyroprocessing cell (about a quarter of the bred uranium comes through it); B ignore it (simpler, but the thorium cycle's defining delay disappears); C a separate decay facility (a second machine for one row). A: it is the fact every thorium-cycle text explains, and it costs one fluid and two rows.

**D3-4 Where V1's front end runs:** **A** existing machines: the EV extraction cascade (TBP rows, as its UV ytterbium row), the IV fuel fabrication plant (nitridation, pellets, pins), GTM's reactors and the EBF, the UV pyroprocessing cell; B a new UV "thorium refinery" multiblock. A (prefer existing machines; the crossings two or more eras back are real ones). The rows live in UV files (a new `tables/thorium_refining.json`, `tables/thorium_fabrication.json`), never in the EV or IV scripts, so D2's packages do not collide with them.

**D3-5 TBP:** **A** made from GTM's oxo butyraldehyde → n-butanol → POCl3 ester → 30% in kerosene, the front HDEHP already uses; B one TBP row from phosphorus and butane; C GTCA's or GT--'s extractants (neither registers TBP). A.

**D3-6 Fibre laser modules:** **A** MCVD in three rows (soot, solution doping, collapse) and facet-coated diode bars; B leave the one-row preform. A: the way rare-earth fibre is really made, and the module is UV's most used part; the module count per recipe does not change.

**D3-7 Ultrapure water:** **A** five grades and the polish in the existing plant, on GTCA's registered, unused purified water grade 1 to 5 fluids; B five new fluids of our own (duplicates GTCA's hidden ones); C enable GTCA's seven purification units (GTNH's design, a controller-less plant the pack hid on purpose, `integration/gtca.js`:49). A.

**D3-8 SiC source powder:** **A** from D1's polysilicon and graphite, for the device-grade boule only; B keep GTCA's abrasive-grade dust. A: PVT needs high-purity source powder, and it crosses five eras back to the MV silicon line.

**D3-9 The ZBLAN mixer row** (`server_scripts/grindless/luv/orbital_industry.js`:35-53, LuV, not UHV: 53 small zirconium, 20 small barium, 4 small lanthanum, 3 small aluminium, 20 small sodium and 73,250 mB fluorine → 25 ZBLAN dust, more fluorine than a singleblock mixer's 16,000 mB tank).

| Option | Consequence |
|---|---|
| **A** Make it multiblock-only: the same row, same ratios, in GTM's large chemical reactor type | direct fluorination of the metals is a reactor's job, not a mixer's; the large reactor's hatches hold the fluorine; the capacity warning goes |
| B Scale it so a singleblock fits | impossible with whole small dusts: 53:20:4:3:20 → 25 has no common divisor, and dividing the fluorine by five breaks the composition |
| C Keep it and accept the warning | the large mixer runs it, but a singleblock mixer shows a recipe it can never run |

A, in package D3-SMALL (the file belongs to LuV, so the integrator orders it against D2's packages).

**D3-10 The warp gate's body:** **A** W11: the casing made from a qualified MgB2 gate coil (a real magnet-manufacturing line, StarT's U-3 adapted), so the reshaped gate costs about 350 coils; B keep the casing recipe and only enlarge the ring (a big but cheap flagship); C a new UHV casing family (the family rule starts at UEV). A: the owner's rule that a flagship's body is expensive and needs something only its era makes, applied where the process needs it.

**D3-11 The amorphous ice annealer:** **A** merges into the volatile ice fractionator (both are thermal processing of ices in Pluto orbit; one row moves to the fractionator's type, the annealer id and its references go); B grow the 135-cell annealer on its own. A: bigger and fewer (`docs/quality/structures.md`, constraints).

**D3-12 Which machines grow:** **A** the flagships and plants far under their band and every workhorse under about 70% of its floor (UV 10 structures, UHV 23), with the pack's existing casings; B grow every machine to its band (pads the small uses); C only the flagships. A.

**D3-13 GTM's wetware circuits in V3:** **A** the chart follows the neuro processing unit through GTM's processor, assembly and computer, because Pluto's ices end in the UV circuit; B stop at the NPU as today. A (D1's L1 and M2 count circuit assembly the same way).

## 8. Quests and Processing Lines charts

Each chapter teaches its lines in order, one quest per step that makes a new species, each text saying what the step is for, what it needs, what it unlocks and how to automate it (principle 5); rewards stay proportionate and never skip a step. Quests never block recipes.

**Charts** (`tools/quests/processing-lines/pl-data-{uv,uhv}.mjs`):

| Chart | Cluster (line id) | Change |
|---|---|---|
| `pl_uv` | `thorium` (`thorium`) | V1 whole: the oxo and TBP front, the dissolution, THOREX, oxalate, thoria, the nitride and oxide routes, the ADR, the chop, electrorefining, the cathode and the protactinium hold, the nitrogen-15 branch, U-233 rods |
| `pl_uv` | `starshot`, `parts`, `probe` (`starshot`) | V2 with MCVD, the grating and coated bars; the printer's atomising and printing drawn apart; V4 (half-cells, dressed cavity), V5 and V7 from borax, V6 as its own chain |
| `pl_uv` | `pluto` | V3 through GTM's wetware chain to the UV circuit; the annealer node becomes the fractionator |
| `pl_uv` | `americium`, `ented`, `beams` | unchanged, except EnTED's end (the UV SMES cell) |
| `pl_uhv` | `isotopes` (`thorium`) | W1, W2 and nickel-63, staged from `pl_uv:thorium` by a link to its uranium-233 node; the clock crystal from laser-grade ThF4 |
| `pl_uhv` | `photonics`, new `water` | W3 with the etched LNOI wafer, taking ultrapure water and the SiC module as links (crossings); W4's five grades and the polish in `water` |
| `pl_uhv` | `mercury`, `power` (one id, `swarm`) | W5 with the SiC source powder at its head; the aluminium form change leaves; the refurbished segment is drawn as a return; the MgB2 chain moves to W11 |
| `pl_uhv` | new `gate` | W11 (MgB2 to the warp gate casing) and W9 (from `antimatter`) |
| `pl_uhv` | `life`, `materials`, `ground`, `optics` | W6 with chitin and chitosan; W7 through the ribbon, the elevator and the ICAN motor, W8; W10 without the ingot step; ZBLAN `keepShort` |

**Chapters:**

| Chapter part | What it teaches |
|---|---|
| UV, integration (`uv-chapter/integration-data.mjs`) | the thorium cycle as one story: why reactor thorium must be purified (poisons), TBP and THOREX, oxalate and thoria, why the nitride needs nitrogen-15, pellets and pins, the ADR's missing neutrons, chopping, the electrorefiner and its cathode, and the 27-day protactinium hold that delays a quarter of the bred uranium; "The Thorium Burn" and "Back to Uranium-233" become the ends of that chain |
| UV, machines | the fibre draw tower teaches MCVD (soot, solution doping, collapse) and the grating; the MOCVD reactor the facet coating; the SRF cavity works half-cells and the dressed cavity; the fractionator absorbs the annealer's quest |
| UV, circuits | the wetware computer quest says where its neurons come from: Pluto's ices, the ark and the vat |
| UV, quests (journey) | unchanged order; the Pluto quests point at V3 and the Starshot quests at V2 |
| UHV, isotopes | uranium-233 grows thorium-229; the nitrate and the laser-grade fluoride before the crystal; the same reactor that breeds californium breeds nickel-63 |
| UHV, light and water | the five water grades and why a fab needs 18 megohms; etched waveguides before modulators; why the SiC boule needs source powder from polysilicon |
| UHV, life | chitin to chitosan to the scaffold, and what the scaffold carries (organoids, the flare shield) |
| UHV, the gate | the gate ring: cable, winding, reaction, impregnation, the quench test, then the casing; the reshaped gate's size and why it costs so many coils |
| UHV, power | the swarm as one line from Mercury's regolith and polysilicon to the segment |

The Multiblocks chapter is generated by the integrator and follows the reshaped structures by itself.

## 9. Implementation packages (dependency order)

Full contracts are in the handoff. Each is one Sonnet session (the default agent, or `mechanical` where noted), at most 2 repairs. Waves: no two packages of a wave edit the same file. `tools/analysis/structure_quality.json` is shared by every reshape, so each wave holds at most one reshape package; line packages, charts and quests run beside them.

| Wave | Id | Scope | Depends on | T1 doubt |
|---|---|---|---|---|
| 1 | D3-TH-FRONT | V1 front end: n-butanol, TBP, TBP solvent, dissolution, THOREX extraction and strip, oxalate, calcination, nitridation, pellets, pins, assemblies (both routes), 15-15Ti tube | none | none |
| 1 | D3-TH-BACK | V1 back end: chop, electrorefining to the cathode deposit, cathode processing, protactinium extraction and hold, oxide reduction from fragments | none | none |
| 1 | D3-STARSHOT | V2: MCVD soot and doping, collapse, ytterbium chloride solution, facet-coated bars | none | none |
| 1 | D3-SRF | V4: half-cells, dressed cavity | none | none |
| 1 | D3-UPW | W4: five grades on GTCA's fluids, the polish | none | none |
| 1 | D3-LIGHT | W3: etched LNOI; the SiC source powder | none | none |
| 1 | D3-XENO | W6: chitin, chitosan | none | none |
| 1 | D3-GATERING | W11: cable, winding, reaction, impregnation, quench test, the warp gate casing recipe | none | none |
| 1 | D3-SMALL (mechanical) | D3-9 ZBLAN row to the large chemical reactor; `thorium_caf2` from laser-grade ThF4 | none | none |
| 1 | D3-ICEWORKS | merge the annealer into the fractionator and reshape it (~650) | none | the merged fractionator forms in Pluto orbit and runs the annealing row |
| 2 | D3-SIZE-UV1 | launcher, laser fusion chamber, starchip fab, heat source works | none | the four form (forming sweep, UV ids) |
| 2 | D3-CHARTS | `pl-data-uv.mjs`, `pl-data-uhv.mjs` per section 8 | all wave 1 | none |
| 3 | D3-SIZE-UV2 | pyroprocessing hall, fibre draw tower, MOCVD reactor, zone refining tower, powder-in-tube line | D3-TH-BACK, D3-STARSHOT | the five form |
| 3 | D3-QUESTS | `uv-chapter`, `uhv-chapter` data per section 8 | D3-CHARTS, D3-ICEWORKS | none |
| 4 | D3-SIZE-UHV1 | warp gate (both orbits), swarm control station, segment foundry, astrometer | D3-GATERING | the four form, the gate in both orbits |
| 5 | D3-SIZE-UHV2 | transuranium facility, clock lab, crystal growth furnace, MBE reactor, photonic foundry | D3-LIGHT | the five form |
| 6 | D3-SIZE-UHV3 | SiC device fab, solar array fab, ultrapure water plant, betavoltaic fab | D3-LIGHT, D3-UPW | the four form |
| 7 | D3-SIZE-UHV4 | xenobiochemistry plant, radiotrophic vat, cold-trap drill, regolith excavator, solar vapour furnace | D3-XENO | the five form, each in its dimension |
| 8 | D3-SIZE-UHV5 | organoid array, PBO plant, tether ribbon works, spark plasma sinterer, ZBLAN draw tower | none | the five form |

## 10. Licences

- **Star Technology (MIT):** research U-3 (the stargate component rods) is the idea behind W11; the line is re-derived from real MgB2 magnet manufacturing, and no script or recipe is copied.
- **GTCA (LGPL-3.0):** its registered purified water grade fluids are reused as W4's intermediates; its purification units stay hidden, and nothing of its code is copied. Its oxalate and silicon carbide are used as in-pack materials.
- **GTM, GCYR (LGPL-3.0), GT-- (AGPL-3.0):** recipes used and changed (the oxo butyraldehyde, MgB2, the wetware circuits, Kapton K, fluorite, the radiation-proof casing).
- **GTNH, Technological Journey, GT5-Unofficial:** ideas only, and none is used here: the water train follows semiconductor practice, not GTNH's grade order.
- **Real processes:** THOREX and oxalate precipitation (Oak Ridge), carbothermic nitridation and nitrogen-15 enrichment, MYRRHA's 15-15Ti cladding, nitride electrorefining (JAEA, Argonne), the molten-salt breeder's protactinium isolation (ORNL), MCVD and solution doping (Southampton), fibre Bragg gratings, TESLA cavities and nitrogen doping (DESY, Fermilab), the thorium-229 nuclear clock (JILA and TU Wien, 2024), HFIR and REDC, smart-cut LNOI, PVT silicon carbide, Zylon, fungal chitosan, wind-and-react MgB2 magnets.

## 11. Risks

- **Cost and power:** V1 adds about 18 ids and 20 rows in six machines; one nitride assembly still gives about 25 G EU, so the ADR stays generous, never free. MCVD, the SiC source powder and the gate coils raise the price of items many later recipes take; the integrator's cost gate (T2) must still pass.
- **The IV fuel fabrication plant's reader** (`server_scripts/grindless/iv/uranium_cycle.js`, D2's band) reads `tables/thorium_fabrication.json` with one fluid output per row and energy stages. If a V1 row needs a field it lacks, D3-TH-FRONT stops and escalates rather than edit the IV script.
- **Water flow:** one ultrapure water plant makes a sixth of today's flow. UHV to MAX photonic rows take thousands of mB per run; a second plant or the parallel hatch is needed, and the T2 flow check should confirm no later era starves.
- **D2 overlap:** if D2 builds research E-3 (a thorium molten-salt loop at IV), uranium-233 would appear two eras early; the integrator then reconciles V1's back end with it. If D2 separates a thorium cake from monazite (E-1), V1's dissolution takes it (section 4). D3-SMALL edits a LuV file that D2's packages may also touch.
- **The merge** removes `gtceu:amorphous_ice_annealer` and its type: generated chapters, the sounds table and any shared library that names it are the integrator's (D3-ICEWORKS lists what it finds).
- **Reshapes:** 33 structures grow; big structures form slower and must stay buildable by the Terminal. Each reshape package runs the forming sweep for its ids and rewrites the structure-quality baseline; fixture zones in `tools/test/zones.json` that build a reshaped machine are reported to the integrator, who owns that file.
- **The audit's staged count** reads one step more than the honest count where the UV stage ends after the hand-off (W1 and W2: 23 against 22). This design keeps D1-AUDIT's rule and states both.

