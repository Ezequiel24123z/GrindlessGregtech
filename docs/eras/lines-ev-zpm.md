# Long process lines, EV to ZPM (D2-LINES)

Design package D2-LINES (#288), 2026-11-03, for AGENTS.md principle 7 (depth first in every tier, real processes, never padded) and principle 4 as the owner rewrote it on 2026-11-03 (multiblocks grow with tier and use). The owner delegated every decision that day, so this pass decides; each material choice is recorded as a **Decision** (section 9). Research: `docs/research/long-lines.md` (band 2, E-1 to E-6). Every recipe, voltage and material named here as existing was read from the batch dump `5d57213f3b83` (the v1.4.1 T2 dump) through `tools/vm/gg-vm-exec.sh` at c6ffcd61c; "new" marks what this design adds, and every new id was checked absent from that dump (GTM 7.5.3, GT-- 1.3.10, GTCA 2.2.0 and the pack). Nothing under `pack/` or `tools/` changes in this package; the implementation packages are in section 11 and their contracts in the handoff. Format: `docs/eras/lines-steam-hv.md` (D1).

## 0. How the steps are counted

- D1's rules (`lines-steam-hv.md` section 0) hold. A step is one machine recipe that makes a new species, or a new part in a manufacturing line; packaging, dust/ingot/plate/foil/wire changes, melting, freezing and cooling hot ingots are not steps. The drill, rig, siphon, sampler, collector or leach field that gives the base resource is not a step (row 0 in the tables).
- **Folds** (RF-3S, `ev.md:498`): a multiblock row that folds a live chain into one recipe (the platinum plant, the hot cell's enrichment, the naquadah plant's modes, the naquadria refinery) is the compressed form; the live chain is the line, and the fold is not counted again. That is how the platline counts 24 at EV, and how the naquadah ladder counts here.
- **Staged lines** count their later stages from their own start (D1-AUDIT, v1.4.0): Z1 starts on EV's bastnasite, Z2 and L3 on IV's Venus ore, E2 on MV's sand. The charts tag them with one `line:` id across eras.
- **Critical path:** the shortest route to the same end product inside the era, stated honestly where one exists.
- **Guide** (owner, 2026-11-02): longest about EV 14, IV 16, LuV 18, ZPM 20, several long lines per era. Chains under 4 steps are not lines and leave the charts.
- **Quantities** in new rows are moles in GTM's units (dust counts by atoms, 1,000 mB a mole) where a table gives them; the implementation packages balance every new row and conserve each element, and mark tunings *(tune)*.

## 1. Summary

| Era | Line | Steps | Critical path | Status |
|---|---|---|---|---|
| EV | E1 Rare earths: Nether bastnasite to the separated lanthanides | 19 (holmium); Eu 17, La 17, Nd 17, Ce 16 | Ce 16; La 5 through Mars merrillite's strip | GTCA's live line charted and taught; one-step cerium retired; the samaric concentrate is split before its holmium (new) |
| EV | E2 Nano circuits, staged from MV's silicon | 13 (7 at MV, 6 at EV) | 13 | chart only |
| EV | E3 Tungsten: Mars scheelite through APT to the IV hull | 10 | 10 | ammonium paratungstate route new; GTM's tungstic-acid electrolysis retired |
| EV | E4 Platline at EV: the platinum plant | 24 (staged) | as D1 | unchanged |
| IV | I1 The uranium fuel cycle | 14 | 14 | yellowcake, U3O8, UF4 and deconversion new; reactor-grade zirconium for the cladding |
| IV | I2 PBI and the thermal suit | 9 (PBI at 7) | 9 | chart only (GTM's chain) |
| IV | I3 Platline IV: Mercury's iridium and osmium | 8 | 8 | chart the loose GT-- stages (fold rule) |
| IV | I4 Niobium-titanium from pyrochlore | 7 | 7 | HF digestion and aluminothermic niobium new; GTM's pyrochlore electrolysis retired |
| IV | I5 Naquadah from Venus to the wafer | 7 | 7 | chart mode 1's GT-- stages |
| LuV | L1 HTS tape: belt nickel to the fusion coil | 13 | 13 | carbonyl split, Ni-W alloy and four tape stages new (RABiTS) |
| LuV | L2 Living circuits with a PEDOT:PSS interface | 11 | 11 | PEDOT:PSS chemistry and the microelectrode array new |
| LuV | L3 Enriched naquadah and trinium, staged from IV | 9 | 9 | chart mode 2's GT-- stages |
| LuV | L4 Germanium and the triple-junction cell | 9 | 9 | GeCl4, GeO2, germanium boule and wafer new |
| LuV | L5 ZBLAN from fluorides | 8 | 8 | five metal fluorides new; the ZBLAN batch becomes real |
| ZPM | Z1 Europium from the SEG fraction, staged from E1 | 20 (17 at EV, 3 at ZPM) | 2 (the Mk1's Nd + H on native Nether neodymium, LuV) | SEG split new (EV); the reductor takes its solution |
| ZPM | Z2 Naquadria and its fuel, staged from IV | 16 | 16 | chart GT--'s naquadria stages; the power ladder retuned (section 9, D2-4) |
| ZPM | Z3 The living medium (Enceladus) | 14 (staged from LuV) | — | unchanged |
| ZPM | Z4 Titan: PAN carbon fibre | 6 | 6 | acrylonitrile, PAN and its fibre stages new; the reformer's one-step fibre retired |
| ZPM | Z5 Waste and actinides; Z6 qubits | 4 to 7; 5 | — | unchanged |

Against the current audit (dump `5d57213f3b83`, production chains of 4+, longest): EV 12, 24 (6 without the staged platline) becomes about 20, 24 (19 native); IV 8, 7 becomes about 14, 14; LuV 7, 9 becomes about 16, 13; ZPM 8, 14 becomes about 13, 20. Lines of 10 or more: EV 3 (E1, E2, E3) plus the platline, IV 1, LuV 2, ZPM 3. **Named gaps** (never padded): IV 14 against 16 and LuV 13 against 18. The real chemistry of those eras is shorter; the band's length comes from the staged ladders, which carry Z1 to 20 and Z2 to 16.

## 2. EV

### E1 Rare earths: Nether bastnasite to the separated lanthanides (19; cerium 16)

**What is in the pack.** GTCA 2.2.0's GTNH-style bastnasite chain is live and EV (`integration/gtca.js:45`: the thermal reactor is kept at EV), and runs on Earth. Two of its stages are rebuilt for Earth by `moon/offworld_only.js` (strip: same recipe, the other world's outputs removed): the filtration without its lunar rutile and ilmenite (`grindless:centrifuge/offworld_only/diluted_to_filtered`, `offworld_only.json:61`), and the holmium reduction without its samarium-terbium mixture (`grindless:electric_blast_furnace/offworld_only/flsamaric_to_ho`, `offworld_only.json:67`), because samarium comes only from Mars (DECISIONS 2026-10-25). That reduction is holmium's only primary source (enriched holmium foil, wetware boards). Nobody charts or teaches it: the EV chart shows only Mars merrillite's two-step cascade (audit: 5). Bastnasite and monazite are Nether ores (`veins_nether.json:76-83`: bastnasite 3, monazite 1, neodymium 1), drilled from LV; Mars gives merrillite only. **Real process:** Mountain Pass and Bayan Obo: acid cracking, conditioning, roasting that oxidises cerium to Ce(IV) so it stays undissolved, solvent extraction of the trivalent rest, and the samarium-europium-gadolinium (SEG) cut.

| # | Machine | In → out | Real process |
|---|---|---|---|
| 0 | LV-HV vein drill, Nether monazite vein | raw bastnasite (+ monazite, neodymium) | mining |
| 1 | Macerator | raw → crushed bastnasite | crushing |
| 2 | Thermal reactor (GTCA), 1,920 EU/t, 800 K (`gtceu:thermal_reactor/crushed_to_muddy`) | 2 crushed + 700 mB HNO3 → SiO2 + 400 mB muddy bastnasite solution | acid cracking |
| 3 | Cracker, 480 EU/t (`gtceu:cracker/muddy_crack`) | + steam → steam-cracked mud | steam stripping |
| 4 | Mixer, 120 EU/t (`gtceu:mixer/muddy_crack_to_conditioned`) | + 320 mB sodium fluorosilicate → conditioned mud | conditioning (fluosilicate) |
| 5 | Large chemical reactor, 1,920 EU/t (`conditioned_to_diluted`) | + saltpeter + 10,000 mB water → diluted mud | dilution |
| 6 | Centrifuge, 240 EU/t (`grindless:centrifuge/offworld_only/diluted_to_filtered`) | → filtered mud + SiO2 + red zircon | filtration |
| 7 | EBF 1,400 K, 600 EU/t (`filtered_to_oxides`) | → bastnasite rare-earth oxides | calcination |
| 8 | Chemical bath (`to_acid_leached`) | + HCl → acid-leached oxides | carbonate leach |
| 9 | EBF 1,200 K (`acidleached_to_roasted`) | + O2 → roasted oxides + 13 mB F2 | oxidative roast |
| 10 | Mixer (`roasted_to_wet`) | + water → wet oxides | slurrying |
| 11 | Large chemical reactor, 480 EU/t (`wet_to_ceriumoxidised`) | + 4,000 mB F2 → cerium-oxidised oxides + 4,000 mB HF | Ce(III) → Ce(IV) |
| 12 | Centrifuge (`ceriumoxidised_to_ceriumdioxide`) | → rarer-earth oxides + CeO2 (90 %) | cerium separation |
| 13 | Mixer (`rarer_to_nitrogenated`) | + HNO3 → nitrated rarer-earth oxides | nitric dissolution |
| 14 | Chemical reactor (`nitrogenated_to_suspension`) | + acetone → suspension | solvent extraction |
| 15 | Centrifuge (`suspension_to_concentrate`) | → Nd concentrate (80 %) + samaric (SEG) concentrate (50 %) + 450 mB acetone | phase split |
| 16 | Large chemical reactor (`neod_to_cl`) | Nd concentrate + HCl → La chloride + Nd oxide | chlorination |
| 17 | Electrolyzer (`lacl_to_la`, `neodox_to_neod`) | → lanthanum; neodymium | electrowinning |
| 16' | Large chemical reactor (new) | samaric concentrate + 2,000 mB HCl → 1,000 mB SEG chloride solution (new) | dissolution |
| 17' | Extraction cascade, EV, new mode | 1,000 mB SEG solution + 500 mB HCl strip + 1,000 mB kerosene → 500 mB europium chloride solution (existing fluid) + 1,000 mB heavy rare-earth chloride solution (new: Sm, Gd, Tb, Ho) + 950 mB kerosene | SEG split: europium stripped |
| 18' | Large chemical reactor (new; replaces GTCA's `samaric_to_flsamaric`) | 1,000 mB heavy chloride + 2,000 mB HF → 1 fluorinated samaric concentrate (GTCA) + 2,000 mB HCl (back to 16') | fluoride precipitation |
| 19' | EBF 1,200 K, 1,920 EU/t (`grindless:electric_blast_furnace/offworld_only/flsamaric_to_ho`, unchanged) | 8 fluorinated concentrate + 4 calcium → 1 holmium | calciothermic reduction |

- **Cerium branch (16):** CeO2 (12) → `cedio_to_cecl` (+ H2, NH4Cl) → `cecl_to_ceox` (+ GTCA oxalate, made from sugar and nitric acid, `oxalate_sugar`: Scheele's route) → `ceox_to_ceiii` (EBF, + carbon) → `ceiii_to_cerium`. The naquadah fuel works' cerium (ZPM) is its consumer.
- **Mars merrillite** stays the second feed: the cascade's leach (c1) and extraction (c2) give samarium, neodymium and the mixed chlorides whose strips feed later eras. Its lanthanum and yttrium strip (`lanthanum_yttrium_strip`) is the 5-step critical path for lanthanum; it stays, because the strips are the honest route for yttrium and the heavies.
- **Retired:** `grindless:electrolyzer/offworld_only/decomposition_electrolyzing_bastnasite` (6 bastnasite → cerium in one GTM decomposition: a 2-step bypass of the whole line; its row in `tables/offworld_only.json` goes) and GTCA's `samaric_to_flsamaric` in both reactors (it fluorinated the whole concentrate, so the europium was lost; 16'-18' spend the same 2,000 mB HF per fluorinated concentrate after the split, and the holmium yield is unchanged).
- **Samarium stays Martian:** the heavy fraction carries the bastnasite's samarium into the holmium reduction, whose samarium-terbium output is already stripped on Earth; no new row yields samarium (the Moon smoke test scans every recipe for a new Earth source, `moon/offworld_only.js:10-11`).
- **Byproducts:** SiO2 → glass and silicon; red zircon → L5 and I1's zirconium; the 13 mB F2 and the 4,000 mB HF → the fluorspar kiln and the naquadah plant; acetone and kerosene circulate; 18''s HCl → 16'; lanthanum chloride's chlorine → HCl; **the europium chloride solution is stored for ZPM** (Z1; its stated future use, as MV's platinum slag was for HV).
- **New:** `gtceu:seg_chloride_solution` and `gtceu:heavy_rare_earth_chloride_solution` (fluids). The SEG split is a new cascade mode at 1,920 EU/t, 200 t (the extraction's figures).

### E2 Nano circuits, staged from MV's silicon (13: 7 at MV, 6 at EV)

GTM's own chain, charted (the RF-3S `nano` cluster) and now counted from D1's M2, which the EV player runs whole: sand → SiO2 (1) → metallurgical silicon (2) → trichlorosilane (3) → distillation (4) → Siemens polysilicon (5) → silicon boule (6) → wafer (7) | EV: laser engraver, CPU wafer (8) → chemical reactor in a cleanroom, CPU wafer + 16 carbon fibres + 576 mB glowstone → nano CPU wafer (9) → cutter, nano CPU chips (10) → circuit assembler, nano processor (11) → nano processor assembly (12) → nano processor computer (13), the IV gate's 8. Branch: phosphorus boule (EBF 2,484 K: 64 polysilicon + 8 P + GaAs + N2) → wafer → NOR wafer → NOR chips into the computer. No recipe changes.

### E3 Tungsten: Mars scheelite through ammonium paratungstate to the IV hull (10)

Today Mars scheelite goes HCl bath → tungstic acid → GTM's electrolysis → tungsten: tungstic acid cannot be electrolysed to the metal. The real route (Wolfram, Sandvik) dissolves tungstic acid in ammonia, removes molybdenum as a sulfide, crystallises ammonium paratungstate (APT), calcines it to the yellow oxide and reduces it in hydrogen.

| # | Machine | In → out | Real process |
|---|---|---|---|
| 0 | EV tripod on Mars | raw scheelite (+ tungstate, lithium) | mining |
| 1 | Ore plant | → scheelite dust | beneficiation |
| 2 | Chemical bath, 960 EU/t (`gtceu:chemical_bath/tungstic_acid_from_scheelite`) | 6 scheelite + 2,000 mB HCl → 7 tungstic acid + 3 CaCl2 | acid decomposition |
| 3 | Chemical reactor, EV (new) | 7 tungstic acid + 2,000 mB NH3 + 1,000 mB water → 1,000 mB ammonium tungstate solution (new) | ammoniacal dissolution |
| 4 | Chemical reactor, EV (new) | + 1 sodium sulfide → purified solution (same fluid, new row) + 1 molybdenite (MoS2 as the precipitate) | molybdenum removal |
| 5 | Distillery, EV (new) | 1,000 mB solution → 1 APT (new) + 800 mB water + 1,000 mB NH3 (back to 3) | evaporative crystallisation |
| 6 | EBF 900 K (new) | 1 APT → 4 tungsten trioxide (new; GTM counts WO3 as 4) + 1,000 mB NH3 + water | calcination |
| 7 | EBF 1,200 K (new) | 4 WO3 + 6,000 mB H2 → 1 tungsten dust + 3,000 mB water | hydrogen reduction |
| 8 | Mixer (GTM) | tungsten + steel → tungsten steel dust (then EBF 3,000 K, freezer: form) | alloying |
| 9 | Assembler | 8 tungsten steel plates → IV machine casing | manufacture |
| 10 | Assembler | casing + 2 platinum cables + PTFE → IV hull (the gate) | manufacture |

- Rate unchanged: 6 scheelite → 1 tungsten, as GTM's bath and electrolysis gave. Steps 3-7 add 5 EV recipes and their EU (about 1 M EU per tungsten at EV voltages, *tune* in the package).
- **Branches:** WC (W + carbon, EBF 1,800 K) → the HSS-G coil's WC plates (IV); the RTM coil (Ru + W + Mo) takes step 4's molybdenite through GTM's roast and reduction, so the line gives its own molybdenum, as real tungsten plants do.
- **Retired:** `gtceu:electrolyzer/tungstic_acid_electrolysis` (7 tungstic acid → W + H2 + O2). The cascade's `scheelite_tungstic_acid` and `tungsten_charge` are UXV modes (`ev/extraction_cascade.js:221-229`) and stay.
- **Byproducts:** CaCl2 → the regolith cell's salt charge; molybdenite → molybdenum; NH3 loops (3 → 5 → 3, 6 → 3); water to the network; lithium chloride (tungstate's bath) → lithium.
- **New:** `gtceu:ammonium_tungstate` (fluid), `gtceu:ammonium_paratungstate` (dust), `gtceu:tungsten_trioxide` (dust).

### E4 and the short EV chains

The platinum plant (24, staged, D1) is unchanged. The Moon's titanium (4) and the sealed dome (4) stay. The lunar cryogenics, Mars methalox and the combined cycle keep their roles.

## 3. IV

### I1 The uranium fuel cycle (14)

**Today:** the in-situ leach field gives uraninite dust; the hot cell's circuit 1 folds GTM's UF6 chain (30 uraninite + 40,000 mB HF → 1 U-235 + 9 U-238 + F2); fuel fabrication, reactor, reprocessing and MOX follow (audit: 4, 6, 5). **Real process:** ISR liquor → ion exchange → peroxide yellowcake → U3O8 → UO2 → UF4 (green salt) → UF6 → centrifuge enrichment → deconversion back to UO2 with the fluorine recovered as HF → pellets in zircaloy → reactor → PUREX → MOX.

| # | Machine | In → out | Real process |
|---|---|---|---|
| 0 | In-situ leach field (End pitchblende), changed output | pregnant uranyl sulfate liquor (new fluid) | in-situ leaching |
| 1 | Large chemical reactor, IV (new) | liquor + ion-exchange resin (charge, 1 % wear) → uranium eluate (new) + diluted sulfuric acid (back to the field) | ion exchange |
| 2 | Chemical reactor (new) | eluate + H2O2 → yellowcake (uranium peroxide, new) + H2SO4 | peroxide precipitation |
| 3 | EBF 700 K (new) | yellowcake → triuranium octoxide (new) + O2 + water | calcination |
| 4 | EBF 900 K (new) | U3O8 + H2 → uraninite (UO2) + water | reduction |
| 5 | Large chemical reactor (new, the first half of GTM's `uranium_hexafluoride`) | 3 uraninite + 4,000 mB HF → 5 uranium tetrafluoride (new) + 2,000 mB water | hydrofluorination |
| 6 | Large chemical reactor (new, the second half) | 5 UF4 + 2,000 mB F2 → 1,000 mB UF6 | fluorination |
| 7 | Centrifuge (`gtceu:centrifuge/uranium_hexafluoride_separation`) | → 100 mB enriched + 900 mB depleted UF6 | enrichment |
| 8 | Large chemical reactor (new, replaces both GTM electrolyses) | enriched UF6 + steam + H2 → U-235 dust + 6,000 mB HF (depleted: U-238 the same way) | deconversion |
| 9 | Fuel fabrication plant | U-235 + U-238 → LEU pellets | pelleting and sintering |
| 10 | Fuel fabrication plant | pellets + zircaloy tubes + helium → LEU assembly | assembly |
| 11 | Fission reactor | → spent fuel + tritiated heavy water (+ EU) | fission |
| 12 | Hot cell c3 | spent + HNO3 → Pu, U-238, Xe, Kr, Cs, Nd, NO2, vitrified waste | PUREX (our fold) |
| 13 | Hot cell c2 | Pu + U-238 + O2 → MOX assembly | MOX fabrication |
| 14 | Fission reactor | MOX → spent MOX | fission |

- **Reactor-grade zirconium (branch, 7):** End red zircon → ore plant → `grindless:chemical_reactor/zircon_chlorination` → the cascade's `zr_hf_cut` → `grindless:fuel_fabrication/kroll_zr_sponge` → zircaloy (mixer, new: zirconium sponge + tin + iron + chromium) → cladding tubes. Every one of these exists except the zircaloy row; zircaloy dust stops coming from unseparated zirconium, because hafnium eats neutrons: that is why real cladding needs the cut. Hafnium chloride → stored for UEV's 6N hafnium (its stated use).
- **The fold:** the hot cell's c1 plan (`tables/hot_cell.json`, `composed` entry `enrichment`) is re-pinned to steps 5-8. `lib/compose.js` reads original and script-added stages, and `iv/hot_cell.js` loads after `iv/uranium_cycle.js` (priority -27666 against -17224), so the new stages live in that script. The fold gives 30 uraninite + 40,000 mB HF + 20,000 mB F2 + steam + H2 → 1 U-235 + 9 U-238 + 60,000 mB HF + water. Fluorine is conserved (60,000 in, 60,000 out); the cell returns HF instead of F2, which the naquadah plant's mode 1 drinks directly (40,500 mB a run). Mode 2's F2 comes from HF electrolysis or the kiln's `fluorine_from_hf`, as today.
- **Retired:** `gtceu:electrolyzer/enriched_uranium_hexafluoride_separation` and `depleted_uranium_hexafluoride_separation` (UF6 is never electrolysed), GTM's one-reactor `uranium_hexafluoride` (both reactor types; replaced by 5 and 6).
- **Byproducts:** diluted H2SO4 → the leach field; HF → step 5, the naquadah plant; depleted U-238 → breeder blankets, radon (c4), RTG; the radium waste stays contained (ZPM Z5); xenon → enriched naquadah (L3).
- **New:** `gtceu:uranyl_sulfate_liquor` and `gtceu:uranium_eluate` (fluids), `gtceu:yellowcake`, `gtceu:triuranium_octoxide`, `gtceu:uranium_tetrafluoride` (dusts).

### I2 PBI and the thermal suit (9)

The suit that lets the player land on Venus and Mercury is the IV gate's travel item; PBI was developed for NASA's suits after Apollo 1. GTM's chain is live and was never charted: rig (0) → refinery (1) → steam cracking, benzene (2) → `chlorobenzene` (3) → `nitrochlorobenzene` (4, D1's nitration mixture) → `dichlorobenzidine_9` (5, copper, hydrogen) → `diaminobenzidine` (6, ammonia, zinc kept) → `polybenzimidazole` (7, with diphenyl isophthalate; the phenol comes back) → GCYR's insulating fabric (8) → `space_suit_thermal_upgrade_smithing_template` (9). Branch: benzene + methane → `dimethylbenzene` → `phthalic_acid_from_dimethylbenzene_9` (K2Cr2O7 catalyst) → `diphenyl_isophtalate` (with H3's phenol). No recipe changes.

### I3 Platline IV: Mercury's iridium and osmium (8)

Mercury drill (0) → ore plant (1) → `grindless:solar_processing/iridosmine_fusion` (2, saltpeter in the solar furnace) → EBF `rarest_metal_residue_ebf` (3) → EBF `iridium_metal_residue_process` (4, IrO2) → `iridium_dioxide_dissolving` (5) → `iridium_chloride` (6, ammonium hexachloroiridate) → `iridium_chloride_separation` (7, calcium) → HSS-S, ruridit or the IV sensor and emitter (8). Osmium: (3) → distillation tower, OsO4 → `osmium_dust_completion`. The platinum plant's mode 3 is the fold (`ev/platinum_plant.js:155-170`). Chart only.

### I4 Niobium-titanium from pyrochlore (7)

Pyrochlore is the world's niobium ore (Araxá); it is digested in HF, the niobium is solvent-extracted and precipitated as the pentoxide, and reduced with aluminium. GTM's `decomposition_electrolyzing_pyrochlore` (11 pyrochlore → 2 Nb) skips all of it.

| # | Machine | In → out | Real process |
|---|---|---|---|
| 0 | Vein drill (Overworld pyrochlore) | raw pyrochlore | mining |
| 1 | Ore plant | → pyrochlore dust | beneficiation |
| 2 | Fluorspar kiln, new row | pyrochlore + HF → niobium oxyfluoride + fluorite dust (its calcium as CaF2, back to the kiln) + water | HF digestion |
| 3 | Extraction cascade (`columbite_niobium_split`) | niobium oxyfluoride + water, kerosene → niobium pentoxide + HF | solvent extraction, precipitation |
| 4 | EBF 2,200 K (new) | Nb2O5 + aluminium → niobium + sapphire (Al2O3); 3 Nb2O5 + 10 Al → 6 Nb + 5 Al2O3 in moles | aluminothermic reduction |
| 5 | Mixer (GTM) | niobium + titanium → NbTi dust (smelting complex: form) | alloying |
| 6 | Assembler | NbTi wire + insulation → NbTi cable | manufacture |
| 7 | Assembler | LuV casing + 2 NbTi cables + PTFE → LuV hull (the gate) | manufacture |

- Tantalite (Nether manganese vein) follows the same digestion into the cascade's existing `tantalum_cut` (K2TaF7 + niobium oxyfluoride); K2TaF7 + sodium → tantalum (EBF, new row) is its branch.
- **Retired:** `gtceu:electrolyzer/decomposition_electrolyzing_pyrochlore`. **Byproducts:** fluorite → the kiln; sapphire → aluminium or the zero-g grower; HF loops. **New rows only** (no new material); the package balances every row in GTM's dust and mB units, conserving niobium (11 pyrochlore hold 2 Nb, as GTM's decomposition says).

### I5 Naquadah from Venus to the wafer (7), and heavy water (5)

Pressurized drill (0) → ore plant (1) → [mode 1's fold, charted: antimony trioxide (LV's roaster, a crossing) → `antimony_trifluoride` (2) → `fluoroantimonic_acid` (3)] → GT--'s `neutron_activator/naquadah` (4) → naquadah (EBF 5,000 K, freezer: form) → naquadah boule (5) → naquadah wafer (6) → CPU wafers engraved from it (7). TiF3 → `titanium_trifluoride_separation` → titanium. Chart only. Heavy water (5) stays.

## 4. LuV

### L1 HTS tape: belt nickel to the fusion coil (13)

Real second-generation HTS tape (RABiTS, AMSC): a nickel-tungsten alloy is rolled and annealed into a cube-textured substrate, buffered (Y2O3 seed, YSZ barrier, CeO2 cap), coated with the cuprate, capped with silver, oxygenated and stabilised with copper. The coated conductor line folds it into two modes today, and the asteroid processor folds the Mond process into one. Both unfold here, so the belt's carbonyl nickel, Mars tungsten and EV's yttrium and cerium meet in the coils the Mk1 is built from. The coils are its body, not a consumed input, so the Mk1's europium is not counted as a step (D1 counted H3's motor the same way: to the part).

| # | Machine | In → out | Real process |
|---|---|---|---|
| 0 | Harpoon anchor drill (belt) | raw meteoric iron | mining |
| 1 | Macerator | → crushed meteoric iron | crushing |
| 2 | Asteroid processor, c1 changed | 16 crushed + CO → crude metal carbonyl (new: the nickel and a little iron) + iron dust (the unreacted kamacite) + 1 cobalt + 1 asteroid PGM concentrate | carbonylation |
| 3 | Distillation tower, LuV (new) | crude carbonyl → nickel tetracarbonyl (new, bp 43 °C) + iron pentacarbonyl (existing, bp 103 °C) | fractional distillation |
| 4 | Asteroid processor, new mode | Ni(CO)4 → nickel + CO (back to 2); Fe(CO)5 → carbonyl iron (iron dust) + CO | thermal decomposition |
| 5 | Mixer (new) | 19 nickel + 1 tungsten (EV) → 20 nickel-tungsten alloy (new) | alloying |
| 6 | Coated conductor line, c1 changed | Ni-W alloy → rolled Ni-W tape (`grindless:nickel_tungsten_tape`) | cold rolling |
| 7 | Coated conductor line, new mode | + H2/Ar → cube-textured tape (new) | recrystallisation anneal |
| 8 | Coated conductor line, new mode | + yttrium oxide + YSZ powder + cerium dioxide → buffered tape (new) | buffer deposition |
| 9 | Coated conductor line, c2 changed | + ITBTC + O2 → coated tape (new) | cuprate deposition |
| 10 | Coated conductor line, new mode | + silver + O2 → capped tape (new) | silver cap and oxygen anneal |
| 11 | Coated conductor line, new mode | + copper foil → ITBTC coated conductor (existing) | copper stabiliser |
| 12 | HTS magnet works | → superconducting coil | winding |
| 13 | Assembler (GTM `fusion_coil`) | → fusion coil (the Mk1's body) | manufacture |

- Today's c1 row (19 nickel dust + 1 tungsten dust → 20 tape) and the asteroid processor's `mond_crushed` and `mond_dust` rows (16 → 24 iron + 4 nickel + 1 cobalt + 1 concentrate) are replaced by steps 2-6 with the same totals per 16 crushed; the CO is taken in step 2 and given back in step 4, so it circulates as it does today as a charge. The tape counts stay (16 tapes → 16 conductors), so the coil's cost moves by the added stages, not by quantity.
- **Byproducts:** carbonyl iron → iron (or the network); CO loops; the PGM concentrate → the platinum plant's mode 4 (Ir, Os, sludge), as today; cobalt → alloys; YSZ powder comes from the existing `grindless:mixer/ysz_powder` (zirconia + Y2O3), cerium dioxide from E1 (a crossing).
- **New:** `gtceu:crude_metal_carbonyl` and `gtceu:nickel_tetracarbonyl` (fluids), `gtceu:nickel_tungsten` (dust), `grindless:textured_nickel_tungsten_tape`, `grindless:buffered_tape`, `grindless:coated_tape`, `grindless:capped_tape`.

### L2 Living circuits with a PEDOT:PSS interface (11)

Today's living chain (9: cryobot → algae bioreactor → biofoundry → mutagen → medium → stem cells → organoid → NPU → wetware) stays. What is missing is real: an organoid is read through a microelectrode array coated with PEDOT:PSS, the conductive polymer of neural interfaces. The NPU recipe (`grindless:organoid_assembly/luv/neuro_processing_unit`) takes 8 electrum plates as its electrodes; they become 1 PEDOT:PSS microelectrode array. Imported from Star Technology's PEDOT:PSS line (MIT, `lines/polymers/pedot_pss.js`), adapted to the industrial EDOT route.

| # | Machine | In → out | Real process |
|---|---|---|---|
| 0 | MV fluid drilling rig | crude oil | extraction |
| 1-2 | Refinery; distillation tower | → refinery gas → butane | fractionation |
| 3 | Chemical reactor (new) | butane + 4 sulfur → thiophene (new) + 3,000 mB H2S | high-temperature sulfurisation |
| 4 | Chemical reactor (new) | thiophene + 4,000 mB bromine (HV's brine line) → tetrabromothiophene (new) + HBr | bromination |
| 5 | Chemical reactor (new) | + 2 zinc + acetic acid → 3,4-dibromothiophene (new) + zinc bromide | selective debromination |
| 6 | Large chemical reactor (new) | + 2,000 mB sodium methoxide (new: methanol + sodium) → 3,4-dimethoxythiophene (new) + NaBr | methoxylation |
| 7 | Large chemical reactor (new) | + ethylene glycol (new) → EDOT (new) + methanol (back) | transetherification |
| 8 | Large chemical reactor (new) | EDOT + polystyrene sulfonate (new) + sodium persulfate (LV) → PEDOT:PSS (new) | oxidative polymerisation |
| 9 | Laser engraver, cleanroom (new) | PEDOT:PSS + gold foil + sapphire wafer → PEDOT:PSS microelectrode array (new) | lithography and coating |
| 10 | Organoid lab, NPU recipe changed | organoid + array + board ... → neuro processing unit | interfacing |
| 11 | Circuit assembly line (GT--) | → wetware processor | assembly |

- **Feeders:** ethylene (HV) → ethylene oxide (new, silver catalyst) → ethylene glycol; styrene (HV) → polystyrene (new) → sulfonation with SO3 → polystyrene sulfonate. Bromine is HV's brine line (a crossing).
- **Byproducts:** H2S → sulfuric acid; HBr and NaBr → electrolysis back to bromine; zinc bromide → zinc and bromine; methanol loops.
- **New:** `gtceu:thiophene`, `gtceu:tetrabromothiophene`, `gtceu:dibromothiophene`, `gtceu:dimethoxythiophene`, `gtceu:edot`, `gtceu:sodium_methoxide`, `gtceu:ethylene_oxide`, `gtceu:ethylene_glycol`, `gtceu:polystyrene`, `gtceu:polystyrene_sulfonate`, `gtceu:pedot_pss` (fluids or dusts as their state), `grindless:pedot_microelectrode_array`.

### L3 Enriched naquadah and trinium, staged from IV (9)

Pressurized drill (0) → ore plant, enriched oxide (1) → mode 2's GT-- stages, charted: `enriched_naquadah_oxide_mixture` (2) → `hexafluoride_enriched_naquadah_solution` (3) → `xenon_hexafluoro_enriched_naquadate` (4, cleanroom) → GT--'s chemical plant `enriched_naquadah_residue_solution` (5) → residue: `dehydrator/xenoauric_fluoroantimonic_acid` (6, trinium sulfide) → EBF 7,200 K `trinium_sulfide_separation` (7) → helium refrigerator (form) → HTS magnet works, superconducting coil (8) → fusion coil (9), the Mk1's body. Enriched naquadah: (5) → `enriched_naquadah_solution_separation` → `neutron_activator/enriched_naquadah` (7) → EBF 7,000 K (8) → rods → reactor III (power). Naquadah alloy (ZPM hull) branches at (7). Chart only; mode 2 is the fold (`luv.md:1000-1078`).

### L4 Germanium and the triple-junction cell (9)

Germanium is refined through its chloride: GeCl4 is distilled and scrubbed, hydrolysed to GeO2, reduced in hydrogen, grown into a crystal and sliced; a triple-junction cell (InGaP/InGaAs on germanium) is grown on that wafer. Today the condenser's c2 turns the sublimate straight into germanium dust.

| # | Machine | In → out | Real process |
|---|---|---|---|
| 0 | Fumarole condenser c1 (Io) | sulfur, Ionian sublimate, SO2 | condensation |
| 1 | Fumarole condenser, c2 changed | 4 sublimate + 2,000 mB HCl + 500 mB Cl2 → 1,000 mB germanium tetrachloride + 1 indium chloride (new) + water | chlorination |
| 2 | Extraction cascade (`germanium_tetrachloride_scrub`, EV) | → pure GeCl4 | scrubbing |
| 3 | Chemical reactor (new) | pure GeCl4 + 2,000 mB water → 3 germanium dioxide (new) + 4,000 mB HCl | hydrolysis |
| 4 | EBF 900 K (new) | 3 GeO2 + 4,000 mB H2 → 1 germanium + 2,000 mB water | hydrogen reduction |
| 5 | EBF, argon (new) | 16 germanium + argon → germanium boule (new) | Czochralski growth |
| 6 | Cutter (new) | → 16 germanium wafers (new) | wafering |
| 7 | Wake shield facility, c3 changed | germanium wafer replaces the germanium plate → triple-junction wafer | epitaxy in the wake |
| 8 | Cutter | → triple-junction cell | dicing |
| 9 | Assembly line | → orbital solar panel | manufacture |

- **Indium branch:** indium chloride → electrolysis → indium → InGaP (mixer) → the wake shield's HPIC (c2) and UHPIC (c1) → UHPIC chips.
- **Byproducts:** HCl loops (1 ← 3); water to the station; sulfur and SO2 as today.
- **New:** `gtceu:germanium_dioxide`, `gtceu:indium_chloride` (dusts), `grindless:germanium_boule`, `grindless:germanium_wafer`.

### L5 ZBLAN from fluorides (8)

ZBLAN is a melt of ZrF4, BaF2, LaF3, AlF3 and NaF (about 53/20/4/3/20 mol %), with the zirconium fluoride sublimed clean; it is drawn into fibre in microgravity because it crystallises on the ground (the Made In Space experiments). Today's mixer adds small zirconium and lanthanum dusts to fluorine gas.

End zirconium vein (0) → ore plant (1) → `zircon_chlorination` (2) → cascade `zr_hf_cut` (3) → `zirconia_hydrolysis` (4) → fluorspar kiln, zirconia + HF → zirconium tetrafluoride (5, new) → mixer, 10 ZrF4 + 4 BaF2 + 1 LaF3 + 1 AlF3 + 4 NaF → 20 ZBLAN (6, replaces `grindless:mixer/zblan`) → microgravity smelter `zblan_optical_pipe` (7) → data bank (8, assembly line; research infrastructure). The other fluorides come from kiln rows (new): barium + HF → BaF2, lanthanum oxide (E1, a crossing) + HF → LaF3, sapphire + HF → AlF3, sodium hydroxide + HF → NaF. **New:** `gtceu:zirconium_tetrafluoride`, `gtceu:barium_fluoride`, `gtceu:lanthanum_fluoride`, `gtceu:aluminium_fluoride`, `gtceu:sodium_fluoride` (dusts). **Byproducts:** hydrogen from the kiln rows → the network; hafnium chloride → stored for UEV.

## 5. ZPM

### Z1 Europium from the SEG fraction, staged from E1 (20: 17 at EV, 3 at ZPM)

Europium is not mined; it is the reducible member of the SEG cut, separated by reducing Eu(III) to Eu(II) with zinc and precipitating europium sulfate (McCoy, 1936). E1 already makes the SEG cut at EV (17'); its europium chloride solution waits for ZPM's reductor.

E1 steps 1-15 → SEG dissolution (16') → SEG split (17', EV) → europium reductor c1, zinc + Venus H2SO4 + mercury charge → europium sulfate (18) → c2 → europium oxide (19) → c3, metallothermic with lanthanum → europium (20). All three reductor steps exist (`zpm/europium.js`); the reductor takes the SEG solution because it is the same fluid as the froth's.

- **Parallel sources:** GTCA's monazite froth (IsaMill, flotation, cascade c5, ZPM) and the Mk1's Nd + H stay; the Mk1 on native neodymium is the 2-step critical path, and the slow one (one fusion ring, one run at a time). The SEG route is the bulk one: it needs no ZPM grinding balls.
- **Byproducts:** zinc sulfate and lanthanum oxide loop through the reductor's c4 and c5 (as today); the reductor's rare-earth chloride → the cascade's strips. GTCA's red mud already has its centrifuge (`gtceu:centrifuge/red_mud_slurry`).
- **No new recipe:** the reductor's c1 already takes `gtceu:europium_chloride_solution`, the fluid the SEG split makes; Z1 is D2-REE's rows plus the charts and quests.

### Z2 Naquadria and its fuel, staged from IV (16)

L3 steps 1-7 (the activator's impure naquadria solution) → GT--'s naquadria stages, charted: `hexafluoride_naquadria_solution` (8) → `radon_naquadria_octafluoride` (9, cleanroom; radon difluoride from Z5's radon) → `naquadria_caesium_xenonnonfluoride` (10, cleanroom) → `nitrosonium_octafluoroxenate` (11, naquadria caesium fluoride) → `acidic_naquadria_caesiumfluoride` (12) → `neutron_activator/naquadria` (13, window 1,050-1,100 MeV) → `naquadria_sulfate_separation` (14, EBF 9,000 K, or the smelting complex row) → fuel works `fuel_mix` (15, cerium from E1) → Mk2 `naquadah_based_liquid_fuel_excited` (16, radon) → large naquadah reactor (power) → depleted fuel → fuel works c2. The naquadria refinery's c1 is the fold. Chart only, plus the power ladder (section 9, D2-4).

### Z3 The living medium, Z5 waste and actinides, Z6 qubits

Unchanged: the Enceladus medium (14, staged from LuV's living line; its stem cells feed L2's organoids), the waste line (radium, capsule, radon, duranium; americium and curium) and the qubit line.

### Z4 Titan: PAN carbon fibre (6)

Titan's air holds acrylonitrile (detected in 2017) and the other nitriles the tholin reformer makes. Real carbon fibre is PAN: polymerised, wet-spun, stabilised in hot air, carbonised in nitrogen.

| # | Machine | In → out | Real process |
|---|---|---|---|
| 0 | Entry probe bay (Saturn orbit) | tholin, methane | atmospheric entry |
| 1 | Tholin reformer c1 | → Titan nitriles | reforming |
| 2 | Distillation tower, ZPM (new) | nitriles → acrylonitrile (new) + HCN + methane | fractionation |
| 3 | Large chemical reactor (new) | acrylonitrile + sodium persulfate → polyacrylonitrile (new) | polymerisation |
| 4 | Chemical bath (new) | PAN + water → PAN precursor fibre (new) | wet spinning |
| 5 | EBF 550 K, air (new) | → stabilised fibre (new) | oxidative stabilisation |
| 6 | EBF 1,600 K, nitrogen (new) | → carbon fibres (GTM) + HCN | carbonisation |

- **Consumers:** EV's nano CPU wafer (16 a wafer, a second source beside the EV autoclave's fibre), GTM's carbon fibre mesh and plate (duct tape, reinforced glass; the compressor's mesh is a form change, not a step), UV composites.
- **Retired:** the reformer's c2 (nitriles → carbon fibres in one step). The reformer keeps c1 and c3 (diaminobenzidine → PBI, a crossing to I2's polymer).
- **Byproducts:** HCN → the reformer's diaminobenzidine row or sodium cyanide; methane → the qubit line.
- **New:** `gtceu:acrylonitrile`, `gtceu:polyacrylonitrile`, `grindless:pan_precursor_fibre`, `grindless:stabilised_pan_fibre`.

## 6. Crossings

| Item | From | To | Note |
|---|---|---|---|
| polysilicon, silicon boule | HV/MV (D1 M2) | E2 | staged |
| nitric acid (Pt-Rh gauze), sodium fluorosilicate's HF | HV (D1 H1) | E1 | crossing |
| benzene, phenol (H3), styrene (H6), ethylene, HV brine bromine | HV | I2, L2 | crossings |
| antimony trioxide (LV roaster) | LV | I5 | crossing |
| tungsten (E3), yttrium oxide and cerium dioxide (E1), lanthanum (E1) | EV | L1, L5 | crossings |
| europium chloride solution | EV (E1 17') | ZPM Z1 | staged, stored |
| hafnium chloride | IV, LuV | UEV 6N hafnium | stored |
| europium | ZPM | UV and later wire, the Mk2 casings | consumers unchanged |
| naquadah fuel, the large reactor | ZPM | UV | ladder of D2-4 holds in UV |
| `grindless:uv_smes_cell` (4 ZPM cells) | ZPM table | UV network tier | D2-5; `tables/magnet_works.json` is ZPM's |
| Neptune deep siphon research, EHI research | ZPM samples and catalogue | UV (`uv/neptune.js`, `uv/edge.js`) | D2-5; **D3 reconciles** |
| PBI, carbon fibre | ZPM | UV electromagnets, UHV conveyor | unchanged consumers |
| stored thorium | IV | UV's accelerator-driven reactor | the liquid thorium fuel retires (D2-4) |

## 7. Basic materials that change

| Material | Today | After | What it moves |
|---|---|---|---|
| Cerium (EV) | GTM's bastnasite decomposition, one step (retiered to EV, `offworld_only.json:65`) | oxidative roast and the oxalate route (E1, 16) | the naquadah fuel works' cerium make-up; GTCA's cerium users; no core key item |
| Holmium (EV, used from LuV) | GTCA's fluorination of the whole samaric concentrate, then the EBF | the same EBF after the SEG split (E1, 19) | enriched holmium foil for wetware boards (same yield); samarium stays Mars-only |
| Lanthanum (EV, LuV) | GTCA chain (uncharted) and the merrillite strip | the same, charted; LaF3 for ZBLAN | ZBLAN, the reductor's lanthanum |
| Europium (ZPM) | the froth and the Mk1 | + the SEG route (bulk) | Mk2 casings and coils (6 and 4 europium plates), ZPM wire |
| Tungsten (EV) | bath, then GTM's electrolysis | bath, APT, WO3, hydrogen | same tungsten per scheelite, about 1 M EU more each; tungsten steel, the IV hull and motor, RTM coil; molybdenum as a byproduct |
| Uranium (IV) | leach field gives uraninite; the hot cell folds UF6 with electrolysis | liquor, IX, yellowcake, U3O8, UF4, UF6, centrifuge, deconversion | LEU, MOX and breeder prices; the hot cell's c1 pins; HF instead of F2 back |
| Zirconium (IV) | zircaloy from unseparated zirconium | Hf-free Kroll sponge for zircaloy | cladding tubes, LEU assemblies |
| Niobium, tantalum (IV) | GTM's pyrochlore electrolysis | HF, SX, aluminothermic | NbTi cables (LuV hull, LuV coils) |
| Nickel, iron, cobalt (LuV) | the asteroid processor's one-step Mond | carbonylation, carbonyl distillation, decomposition | the coated conductor, HTS coils, the Mk1 |
| Germanium, indium (LuV) | condenser c2 gives germanium and indium dust | chloride route, GeO2, boule and wafer | triple-junction cells, orbital panels; UHPIC |
| Carbon fibre (ZPM) | reformer c2, one step | PAN route | EV nano CPU wafers (alternative source), UV composites |
| Carbon (all) | GTM's `diamond_electrolysis` gives 64 carbon a diamond | retired (D2-6) | none of the pack's lines uses it; it fed the cost model's iron-from-gas loop |
| Fluorine (model) | priced from hand-mined Nether blue topaz ore | priced from drilled fluorite (D2-7) | the cost model only; UV+ capstones' top contributor |
| Naquadah power (LuV, ZPM) | per material: II 0.1 G, IV-V 4 G, large reactor 0.35 G | a rising ladder (D2-4) | the ZPM gate's reactor count, naquadria per hour |

Reachability: every new recipe runs at or below its line's era on machines the era already has (the distillation tower, EBF, kiln, cascade, coated conductor line, asteroid processor, reactors, bath, laser engraver). The new modes (the coated conductor line's four tape stages, the asteroid processor's decomposer, the cascade's SEG split, the condenser's chlorination, the wake shield's germanium wafer) are rows on existing machines.

## 8. Quests and Processing Lines charts

Each era chapter teaches its lines in order, one quest per step that makes a new species, each saying what the step is for, what it needs, what it unlocks and how to automate it (principle 5); rewards never skip a step. Chains under 4 steps leave the charts.

| Chart | Keep or new | Merge into a line | Leave the chart |
|---|---|---|---|
| `pl_ev` | E1 rare earths (new: the GTCA trunk with the merrillite feed and the cerium branch), E2 nano (linked to `pl_mv`, `line: 'silicon'`), E3 tungsten (APT), platinum plant, Moon titanium, sealed dome | `cascade` → E1; `tungsten` → E3 | `kroll` (1 step: D1 moved the Kroll line to HV's H4); `mars` and `power` keep their roles |
| `pl_iv` | I1 fuel cycle (unfolded, with the zirconium branch), I2 PBI (new), I3 Mercury platline (`line: 'platline'`), I4 niobium (new upstream), I5 naquadah (`line: 'naquadah'`), heavy water | `uranium`, `fuel`, `plutonium`, `radon` → I1; `supercon` → I4 | `mercury` (infrastructure), `far` (research) keep their roles |
| `pl_luv` | L1 HTS tape (new: `belt`, `miner`, `tape`, `magnets`, `fusion` merged), L2 living (with PEDOT), L3 trinium (`line: 'naquadah'`), L4 germanium (`io`, `wake`), L5 ZBLAN (`optics`) | `belt`+`tape`+`magnets`+`fusion` → L1; `biofoundry`+`organoid`+`europa` → L2 | `grower` (crystal CPU, 3: a GTM fold) |
| `pl_zpm` | Z1 europium (`line: 'rareearth'`, linked to `pl_ev`), Z2 naquadria (`line: 'naquadah'`), Z3 living, Z4 Titan (PAN), Z5 waste, Z6 qubits | `naquadria` → Z2 | `aerogel`, `network`, `charts`, `saturn` keep their roles |

Chapter notes:
- **EV** teaches that rare earths are separated, not mined: the roast that leaves cerium behind and the SEG cut whose europium waits for ZPM; and why tungsten passes through a salt (APT) before it is a metal.
- **IV** teaches the fuel cycle as one loop the player closes (yellowcake to MOX), why cladding needs hafnium-free zirconium, and the suit's PBI.
- **LuV** teaches the HTS tape as the era's flagship manufacturing line, ending in the coils the Mk1 is built from; PEDOT:PSS as the bridge between a living organoid and a circuit.
- **ZPM** teaches Z1 as the payoff of EV's stored solution, and the naquadah power ladder (D2-4): why the large reactor is the best use of naquadria.

## 9. Decisions

### D2-1 Rare earths: which line carries EV

| Option | What it means | Consequences |
|---|---|---|
| **A (taken)** GTCA's live bastnasite line, charted, with merrillite as a feeder and a new SEG split before the holmium | 19 steps from live recipes; the one-step cerium and the unsplit fluorination retired; Z1 staged from it | the deepest EV line costs 3 new rows and 2 new fluids; holmium keeps its only source at the same yield; samarium stays Mars-only (DECISIONS 2026-10-25) |
| B The monazite line of research E-1 (GTNH ideas) | about 18 new recipes | duplicates a live line; GTNH is ideas only |
| C Merrillite only, as today | 5 steps | leaves a live 17-step line uncharted and a 2-step cerium bypass |

Reason: the long real line already exists in the pack and nobody is taught it; principle 9 keeps meaningful complexity, and principle 7 merges split chains.

### D2-2 Tungsten through APT

A (taken): APT route, GTM's electrolysis retired, same yield. B: keep the electrolysis (unreal, 2 steps). C: GTNH's tungsten chain (ideas only, longer, same chemistry). A is the industrial route and gives molybdenum honestly.

### D2-3 The fuel cycle: unfold the front end, keep PUREX folded

A (taken): yellowcake, U3O8, UO2, UF4, deconversion and Hf-free zirconium as loose IV recipes; the hot cell keeps c3 (PUREX) folded, because radioactive solutions must not cross pipes (`iv.md`, hot cell). B: unfold PUREX too (TBP in the cascade): 3 more steps, but plutonium nitrate in open machines breaks the hot cell's purpose. C: as today (8 steps, GTM's electrolysis of UF6).

### D2-4 The naquadah power ladder (#274 A4-01, A4-02)

**Finding.** Read from the dump (generators.js's ×2 included), per unit of fuel material and per base unit of input cost (cost matrix `--trace`, each fuel priced in its own era: enriched naquadah ingot 0.912 at LuV, naquadria dust 3.26 at ZPM, LEU assembly 5.74, excited fuels per mB):

| Generator | Burns | EU/t × t | EU per material now | EU per base now | Target t | EU per material after | EU per base after |
|---|---|---|---|---|---|---|---|
| Naquadah reactor I (EV hull) | enriched Nq bolt (⅛ ingot) | 2,048 × 48,828 | 0.80 G an ingot | 877 M | unchanged | 0.80 G | 877 M |
| II (IV hull) | enriched Nq rod (½) | 8,192 × 6,102 | **0.10 G** | 110 M | **54,932** | 0.90 G | 987 M |
| III (LuV hull) | long enriched Nq rod (1) | 32,768 × 30,516 | 1.00 G | 1.10 G | unchanged | 1.00 G | 1.10 G |
| IV (ZPM hull) | naquadria bolt (⅛) | 131,072 × 3,814 | **4.0 G** | 1.23 G | **1,431** | 1.50 G | 460 M |
| V (UV hull) | naquadria rod (½) | 524,288 × 3,814 | **4.0 G** | 1.23 G | **1,669** | 1.75 G | 537 M |
| Large naquadah reactor | excited naquadah fuel, 1 mB | 975,000 × 120 | **0.35 G a naquadria** (117 M a mB) | 106 M | **690** | 2.00 G a naquadria (673 M a mB) | 613 M |
| Large naquadah reactor | excited uranium fuel, 1,000 mB | 12,960 × 200 | 2.6 M an enriched-uranium item (2.6 k a mB) | **184 k** | retired | — | — |
| Large naquadah reactor | excited thorium fuel, 1,000 mB | 2,200 × 1,000 | 2.2 M an enriched-thorium item | **9.3 k** | retired | — | — |
| Fission reactor (IV, for scale) | LEU assembly, heavy water | — | 2.62 G an assembly | 456 M | unchanged | — | — |

(42 naquadria → 1,000 mB fuel → 125 mB excited with 250 mB radon; the Mk2's excitation costs 130 k EU a mB, 0.02 % of the output.)

**What is wrong.** A4-01's "117 M EU per mB against 2.6 k" is a unit artefact: one mB of excited naquadah fuel holds a third of a naquadria dust, one mB of uranium fuel a thousandth of an enriched-uranium item. Per input, naquadah fuel sits in the nuclear band. The real faults: reactor II is 8× below I and III (A4-02); single-block reactors IV and V give 11× more per naquadria than the large reactor, so seventeen of them beat ZPM's "main plant" and the era's designed plant is pointless (principle 4, "nothing one at a time"); GT--'s uranium and thorium liquid fuels are 2,500× and 50,000× below fission per input, and enrich by implosion (`gtceu:implosion_compressor/implode_enriched_*_nugget_*`), which is not a process.

| Option | What it means | Consequences |
|---|---|---|
| **A (taken)** A rising ladder: the same fuel gives more in a bigger plant (I 0.8 → II 0.9 → III 1.0 G an enriched ingot; IV 1.5 → V 1.75 → large 2.0 G a naquadria) | durations above; U and Th liquid fuels retired (hidden for good with their implosion chain, as the plutonium fuel already is) | one large reactor burns 35 naquadria an hour (was 202); the ZPM gate's two reactors need 70 an hour, one mode-2 plant at ×4 parallel (216 an hour) feeds six; naquadria stays the cap |
| B Keep the large reactor, cut IV and V to 0.25-0.3 G | the main plant wins, naquadria worth less than enriched naquadah per unit | breaks principle 8's "same or better fuels" |
| C Record the exception (GT--'s upstream scale) | nothing changes | the main plant stays pointless |

Durations are the dump's (post-×2) figures; the package writes the pre-doubling values (half) or rebuilds after the doubling. Thorium keeps its destination: UV's accelerator-driven reactor (`uv.md:53`).

### D2-5 Consumers for the ZPM cell, the Neptune sample and the catalogue (#277 A2-06)

- **`grindless:zpm_smes_cell`:** the UV cell is wound around four ZPM cells, as the UHV, UEV, UIV and UXV cells already are around four of the tier below (`tables/magnet_works.json`): `uv_smes_cell` takes 4 ZPM cells + 16 NaqTriEuDu wires + 8 darmstadtium plates (the 16 advanced SMD capacitors leave). Capacity agrees: 4 × 3.93 G = 15.73 G, the UV cell's. The towers' cell slots remain its other use. (`uxv_smes_cell` → `opv_smes_cell` is the same gap, between D4's and D5's bands.)
- **`grindless:neptune_sample`:** the UV Neptune deep siphon's controller is researched from the sample (`uv/neptune.js`: research `scoop_head` → `neptune_sample`), and its rows keep it as a non-consumed calibration; the flyby bay splits into c1 Neptune flyby (recording only) and a new c3 sampling pass (sample only, aerogel spent), so no surplus is forced; the `grindless:centrifuge/neptune_sample_flask` recipe goes (`zpm/uranus.js:163`, with its pins in `zpm-uranus.test.mjs:88` and `gg_test_zpm_uranus.js:187`).
- **`grindless:multimessenger_catalogue`:** the event horizon interferometer is researched from the catalogue (`uv/edge.js`: research `sapphire_boule` → `multimessenger_catalogue`) and its domain drops the 2 catalogues; `event_horizon_imaging` keeps it non-consumed.
- Both research items then pass the audit's research role (consumed only by research or as a non-consumed input). Rejected: re-tagging the chains as `travel` (the flask would still eat the sample) or removing the cell (the network's ZPM tier needs it).

### D2-6 The carbon matter loop (`02_cost_curve.md:113`)

GTM's `electrolyzer/diamond_electrolysis` (`SeparationRecipes.java`, 1 diamond dust → 64 carbon, 30 EU/t) turns ZPM's CVD diamond (1,000 mB methane → 1 plate: one carbon in, one out) into 64 carbon, which the HV gasifier turns into CO, hydrogen and ash, and the ash centrifuge into hematite: iron and carbon from gas. **Decision:** retire `diamond_electrolysis` (no real process electrolyses diamond; nothing in the band uses it), and conserve carbon in `grindless:chemical_reactor/nanodiamond_cleaning` (`tables/megabar.json:80-82`): 4 nanodiamond + 4,000 mB hydrogen → 3 diamond dust + 1,000 mB methane (hydrogen etching takes the sp² shell off as methane: 4 carbon and 4,000 H in, 4 and 4,000 out; today 4 → 4.5 carbon). The CVD rows already conserve carbon and stay. Graphite's 1 → 4 electrolysis stays: graphite is only mined (no carbon → graphite route in the dump); the package's `recipe-cycles.mjs` run confirms no other carbon multiplier.

### D2-7 Blue topaz and fluorine at scale (`02_cost_curve.md:114`)

- **Confirmed renewable:** the Nether topaz vein (`veins_nether.json:136-146`) has drill rows from LV to HV (HV stainless bit with drilling fluid: 2 + 0.11 raw blue topaz, 8 EU/t × 200 t). 10⁴ raw blue topaz is about 13 drill-hours, under an hour for an array of 16 drills.
- **What the capstones eat is fluorine.** Read on the current dump (`cost-matrix --trace`, exec-20261103-063923): the model's cheapest fluorine and HF come from GTM's `decomposition_electrolyzing_blue_topaz` fed by **hand-mined** `netherrack_blue_topaz_ore` blocks (8 crushed each). That is 52 % of UV's capstone and 42-46 % of UHV to MAX (exec-20261103-063815). No drill gives ore blocks, so the model prices a source the player cannot automate (principle 1).
- **Fluorine's honest route at 10⁴ scale** is the Earth fluorite vein (from steam; HV stainless with fluid: 2 + 0.81 raw fluorite a run) → the kiln (3 fluorite → 2,000 mB HF) → HF electrolysis or the kiln's `fluorine_from_hf`: several times the fluorine per drill-hour of blue topaz, plus E1's and I4's fluorite returns.
- **Decision:** the cost model takes drilled raw ores as the base for every ore, and placed ore blocks stop being bases (`tools/analysis/cost_matrix.json`, package D2-COSTBASE). Gameplay recipes do not change; GTM's blue topaz decomposition stays (principle 6). The re-priced curve is the integrator's (it may move every era's index; the package reports `--compare` and escalates if an era leaves the 10 % band).

### D2-8 Multiblock sizes (section 10)

Resize only what contradicts its use (`structures.md:34-88`): six structures, all plants or the era's flagship built at field-unit or workhorse size.

### D2-9 LuV and IV below the guide

LuV's longest real line is 13 (L1) against 18, IV's 14 against 16. Rejected: counting the belt's PGM through the EV plant's earlier stages (the LuV player runs the compressed plant, so the length is not run), and new organoid biology steps (reprogramming factors) whose items would be invented. Named, not padded (principle 7).

## 10. Multiblock size review (EV to ZPM)

Dump `5d57213f3b83`, `structure-quality.mjs --json` (cells = filled cells). Era medians: EV about 100, IV about 125, LuV about 140, ZPM about 200. Only these contradict their use class:

| Machine | Era | Use class | Now (bbox, cells) | Target | Why |
|---|---|---|---|---|---|
| `extraction_cascade` | EV | plant (46 modes; E1's and later SX) | 3×3×7, 61 | about 240 (a mixer-settler hall, about 7×5×13) | a plant at field-unit size |
| `platinum_plant` | EV | plant (40 recipes folded) | 5×5×7, 130, 3 block types | about 260 (7×7×9) | barely above the era's workhorses |
| `fission_reactor` | IV | flagship ("the era's") | 5×5×8, 156 | about 500 (a containment drum, 11×13×11) | IV's flagship must be its largest; the mega smelting complex is 482 |
| `hot_cell` | IV | plant (4 modes, 2 impossible at small scale) | 7×5×4, 104 | about 240 | a shielded facility at workhorse size |
| `naquadah_plant` | IV | plant (folds GT--'s activator line, 3 modes) | 7×4×5, 107 | about 260 | same |
| `microgravity_smelter` | LuV | plant (ZBLAN fibre, naquadah alloy, Whipple casing) | 3×9×7, 66 | about 180 | an orbital plant at field-unit size |

None else: the field units (drills, cryobot, samplers), workhorses and the large LuV and ZPM halls (mega chemical complex 1,319, neutrino observatory 1,117, assembly hall 558) fit their use. GTM's and GT--'s structures (the Mk1, Mk2, the large naquadah reactor) are not ours to resize. Every resize keeps the rubric (no block over 70 %, a silhouette that says the process, parts on the surface), the Terminal build, and active blocks under 264.

## 11. Implementation packages (dependency order)

Full contracts are in the handoff. Each is one Sonnet session, at most 2 repairs, T0 before handoff. Waves: no two packages of a wave edit the same file.

| Wave | Id | Scope | Depends on | T1 doubt |
|---|---|---|---|---|
| 1 | D2-REE | E1: SEG dissolution, split and fluoride precipitation; one-step cerium and the unsplit fluorination retired | none | the cascade runs the SEG split by its circuit |
| 1 | D2-APT | E3: APT route; tungstic-acid electrolysis retired | none | none |
| 1 | D2-FUEL | I1: liquor, IX, yellowcake, U3O8, UF4, deconversion, zircaloy from Kroll sponge; hot cell c1 re-pinned | none | the hot cell composes c1 from the new stages |
| 1 | D2-NIOBIUM | I4: kiln digestion, aluminothermic niobium, tantalum; pyrochlore electrolysis retired | none | none |
| 1 | D2-TAPE | L1: carbonyl split, Ni-W alloy, four tape stages | none | the coated conductor line selects its new circuits |
| 1 | D2-PEDOT | L2's chemistry up to PEDOT:PSS | none | none |
| 1 | D2-GERMANIUM | L4: chlorination, GeO2, boule, wafer, the wake shield's input | none | none |
| 1 | D2-PAN | Z4: acrylonitrile to carbon fibre; reformer c2 retired | none | none |
| 1 | D2-NAQPOWER | D2-4: the ladder; uranium and thorium liquid fuels retired | none | GT--'s generators run the new durations once (no double doubling) |
| 1 | D2-MATTER | D2-6 | none | none |
| 1 | D2-COSTBASE | D2-7: the model's base | none | none (dump-based) |
| 1 | D2-A206 | D2-5 | none | none |
| 1 | D2-SIZE-EV | section 10: extraction cascade, platinum plant | none | each new shape forms (form sweep) |
| 2 | D2-MEA | L2's array and the NPU change | D2-PEDOT | none |
| 2 | D2-ZBLAN | L5: fluorides and the ZBLAN batch | D2-NIOBIUM (kiln script), D2-GERMANIUM (orbital script) | none |
| 2 | D2-SIZE-IV | section 10: fission reactor, hot cell, naquadah plant | D2-SIZE-EV (`zones.json`) | each new shape forms |
| 3 | D2-SIZE-LUV | section 10: microgravity smelter | D2-SIZE-IV (`zones.json`) | it forms |
| 3 | D2-CHARTS-EV, -IV, -LUV, -ZPM | section 8, one `pl-data` file each | their era's recipe packages | none |
| 4 | D2-QUESTS-EV, -IV, -LUV, -ZPM | section 8, one `<era>-chapter/quests-data.mjs` each | their era's chart | none |

## 12. Licences

GTCA (LGPL-3.0) and GT-- (AGPL-3.0) are downloaded mods: their live recipes are charted, used and changed by our KubeJS; nothing of theirs is copied. GTM (LGPL-3.0): recipes used and changed. Star Technology (MIT): the PEDOT:PSS line (`lines/polymers/pedot_pss.js`) is imported as an idea and re-implemented on the industrial EDOT route, with attribution (proposed CREDITS line in the handoff). GTNH and Technological Journey: ideas only. Everything else is real chemistry and engineering: bastnasite cracking and the SEG cut, McCoy's europium, APT, ISR and the uranium front end, Kroll zirconium, PBI, aluminothermic niobium, the Mond process, RABiTS tape, PEDOT:PSS arrays, germanium refining, ZBLAN, PAN carbon fibre.

## 13. Risks

- The cost curve moves: tungsten, uranium, niobium, cerium and the HTS coil gain steps (counts unchanged), and D2-COSTBASE re-prices every era's base. The integrator re-solves if an era leaves the 10 % band.
- The hot cell's c1 plan (`tables/hot_cell.json`) pins GTM ids that D2-FUEL retires; it must be re-pinned in the same package, with the new stages in a script that loads before `iv/hot_cell.js`, or c1 stops loudly.
- D2-A206 edits two UV files (`uv/neptune.js`, `uv/edge.js`) that D3 may also touch: the integrator orders them.
- D2-NAQPOWER changes GT--'s generator durations after generators.js's doubling; a double application would halve or double them. Its static test pins the dump figures of section 9.
- E1 runs on Earth: D2-REE's rows must yield no samarium (the Moon smoke test, `moon/offworld_only.js:10-11`), and holmium's yield per samaric concentrate must stay 1 in 8.
- The line audit counts charts: until the four chart packages land, the new lengths do not show.
