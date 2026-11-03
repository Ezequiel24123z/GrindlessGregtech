# Long process lines, Steam to HV (D1-LINES)

Design package D1-LINES (#242), 2026-11-02, for AGENTS.md principle 7 as the owner rewrote it that day: depth first in every tier, lines that follow real processes, long and complex but never artificially hard; the platinum-group line (platline) is one of the pack's massive lines. Research: `docs/research/long-lines.md`. Every recipe, voltage and material named here as existing was read from the batch dump `6f89eb0df970` (the dump of the line audit baseline); "new" marks what this design adds. Nothing under `pack/` or `tools/` changes in this package; the implementation packages are listed in section 9.

## 0. How the steps are counted

- **Step:** one machine recipe that makes a new species, or a new part in a manufacturing line. Not steps: packaging, dust, ingot, plate and foil changes, melting, freezing, cooling hot ingots, recycling.
- **Length:** the longest dependency chain from base resources (drill, rig, collector, greenhouse, pump or gas collector output; a drill or rig produces the base resource and is not a step, as the line audit counts it, v1.4.1). The end product of another line counts as a raw input (a crossing). A staged line counts its later stages from its own start: the platline's HV stage counts from the ore it began with at MV, because the HV player runs the whole chain.
- **Critical path:** given where a shorter route to the end product exists inside the same era; it is the honest minimum.
- **Guide** (owner, 2026-11-02): longest line about Steam 6, LV 8, MV 10, HV 12-13 with several. A chain of 2 or 3 steps is not a line and leaves the Processing Lines charts.
- The line audit (`tools/analysis/line-audit.mjs`) counts a chart cluster and stops at `link` nodes. Package D1-AUDIT (section 9) lets a staged line count through its own earlier stage and lists the accepted bootstrap routes (section 2, S1).

## 1. Summary

| Era | Line | Steps | Critical path | Status |
|---|---|---|---|---|
| Steam | S1 Ironworks: ore to Bessemer steel | 6 | 6 | rework of the steam blast furnace; merges `steam.coke`, `steam.steel`, `steam.drill` |
| Steam | S2 Refractories: firebricks | 5 | 5 | exists |
| Steam | S3 Ore dressing with byproducts | 4 | 4 | exists |
| LV | L1 Etched boards and diodes to the MV circuit | 8 | 6 | merge of `lv.acid`, `lv.roaster`, `lv.salt`, `lv.diodes`; no recipe change |
| LV | L2 Coke-oven ammonia to the photographic plate | 10 | 10 | Ostwald chain plus a real silver-halide emulsion; feeds the platline and HV propellants |
| LV | L3 Sapphire to aluminium; L4 Drilling fluid | 4; 4 | 4; 4 | exist |
| MV | M1 Platline I: platinum and palladium | 9 | 8 | the live GT-- line staged at MV; one new chemical-reactor variant |
| MV | M2 Electronic-grade silicon to chips | 10 | 10 | trichlorosilane and Siemens polysilicon before the boule; extends `mv.silicon` |
| MV | M3 Biomass to PVC | 7 | 7 | merge of `mv.wood` and `mv.plastics`, one real step added (EDC) |
| MV | M4 Crude to RP-1 and the static fire | 7 | 7 | merge of `mv.fuels` and `mv.fire` |
| MV | M5 Eye of Ender; M6 Kanthal | 5; 4 | 5; 4 | exist |
| HV | H1 Platline II: rhodium and ruthenium | 20 (9 staged from M1, 11 at HV) | 16 | the live GT-- line staged at HV; Pt-Rh gauze as its HV consumer |
| HV | H2 Hydrazine and Aerozine 50 | 8 | 8 | the live GT-- anthraquinone cycle made the only peroxide route; real Apollo-era propellant |
| HV | H3 Composite rocket motor: epoxy and Kapton | 9 (fuel-tank branch 8) | 9 | merge of `hv.refinery`, `hv.aromatics`, `hv.rocket`; GTM LCR shortcuts removed |
| HV | H4 Kroll titanium from lunar ilmenite | 5 | 5 | moved from the EV chart; TiCl4 purification and MgCl2 electrolysis added (decision D-2, default) |
| HV | H5 PTFE through R22; H6 SBR; H8 Nichrome | 6; 5; 4 | same | PTFE gains the real chloroform, R22 and pyrolysis steps; SBR is a merge |
| HV | H7 Gasoline | 3 | 3 | not a line (under 4); stays a short chart |

Against the audit baseline (era: lines of 4+, longest): Steam 2, 5 becomes 3, 6; LV 3, 6 becomes 4, 10; MV 5, 8 becomes 6, 10; HV 2, 4 becomes 8, 20, with one line of 10 or more and one of 12 or more (H1). The HV numbers are what `tools/analysis/line-audit.mjs` measures from `pl-data-hv.mjs` (H3, H5 and H6 share one chain group in the chart, `line: 'hvoil'`).

## 2. Steam

### S1 Ironworks: ore to Bessemer steel (6)

The real nineteenth-century route: beneficiate the ore, sinter the fines with coke breeze, smelt pig iron in a blast furnace fluxed with limestone, and blow the pig iron into steel (Bessemer, 1856) with a steam-driven blast. Today the steam blast furnace (`gtceu:steelmaking`) turns raw ore, coke and calcite into steel in one recipe.

| # | Machine | In → out | Real process |
|---|---|---|---|
| 1 | Steam vein drill (ours) | iron vein sample + bit + water → raw goethite, hematite, magnetite or yellow limonite | mining |
| 2 | Steam or large steam macerator | raw ore → 2 crushed ore | crushing |
| 3 | Steam or large steam ore washer | crushed → purified ore + stone dust | washing (beneficiation) |
| 4 | Steam alloy smelter, 8 EU/t (new recipe) | 4 purified iron ore + 1 coke dust → 4 iron sinter (new `grindless:iron_sinter`) | sintering on a strand with coke breeze |
| 5 | Steam blast furnace, circuit 1 (new recipe) | 4 sinter + 3 coke + 1 calcite → 4 pig iron (new `grindless:pig_iron`) + 1 ash | blast-furnace smelting with limestone flux |
| 6 | Steam blast furnace, circuit 2 (new recipe) | 4 pig iron → 4 steel + 1 ash, the steam is the blast | Bessemer converter |

- Coke branch: coal → by-product coke battery (ours) → coke (+ creosote, coal gas); coke → macerator → coke dust (a form change).
- Figures: 2 steel per raw ore as today (the macerator doubles), 1 coke per steel as today (0.25 in the sinter, 0.75 in the furnace), and the two furnace runs take 1,200 ticks each, the 2,400 of the current recipe: costs and times are reviewed, not raised (principle 2 up to LV).
- Removed: the current `gtceu:steelmaking` rows (raw, crushed, ingot and dust iron straight to steel) from `tables/steam_blast_furnace.json`. Pyrite stays out (it waits for the roaster).
- Kept: GTM's primitive blast furnace (iron ingot + coke → steel, one ingot per 1,500 ticks), the bootstrap that makes the steel the steam blast furnace is built from. It is shorter than S1, so D1-AUDIT lists it as an accepted bootstrap route rather than a skip.
- Byproducts: stone dust (inert, voided or drilling fluid at LV); ash, the slag (inert, fertilizer at LV); coal gas (tank until LV).

### S2 Refractories (5) and S3 Ore dressing (4)

Unchanged. S2: clay and brick → dusts → fireclay → compressed fireclay → firebrick → firebricks (the blast furnaces are built from them). S3: raw copper → macerate → wash → thermal centrifuge → macerate, with cobalt, gold and nickel as the end products the line exists for.

Leaving the Steam chart (fewer than 4 steps): rubber (3), glass (3), the first Moon chart (1), the collector (1); coke, steel and the drill join S1. Their machines keep their quests in the era chapter.

## 3. LV

### L1 Etched boards and diodes to the MV circuit (8; critical path 6)

The LV gate asks for 8 good electronic circuits. Every recipe exists; today they are four charted chains of 2 to 4 (`lv.acid`, `lv.roaster`, `lv.salt`, `lv.diodes`). Real process: printed-circuit-board etching with persulfate, and gallium arsenide from the gallium in bauxite.

| # | Machine | In → out | Process |
|---|---|---|---|
| 1 | LV vein drill | pyrite vein → raw pyrite | mining |
| 2 | Sulfide roaster (ours), 120 EU/t | pyrite + air + water → hematite + H2SO4 + steam | roasting with contact acid plant |
| 3 | LV chemical reactor | salt + H2SO4 → sodium bisulfate + HCl | salt cake process |
| 4 | LV electrolyzer, 30 EU/t | sodium bisulfate → sodium persulfate + H2 | anodic oxidation |
| 5 | LV chemical bath, 30 EU/t (`bathe_bauxite_crushed_ore_to_purified_ore`) | crushed bauxite + persulfate → purified bauxite + gallium | gallium recovery |
| 6 | LV mixer, 7 EU/t | gallium + arsenic (realgar electrolysis) → GaAs | compound synthesis |
| 7 | LV assembler, 30 EU/t | GaAs + copper fine wire + glass → diode | device assembly |
| 8 | LV circuit assembler, 30 EU/t | 2 phenolic printed boards + 4 basic circuits + 3 diodes + wire → good electronic circuit | board assembly |

- The etched board joins at 8: phenolic board (wood dust + glue) + 4 silver foil + persulfate → phenolic printed circuit board (LV chemical reactor, 30 EU/t), silver from the roaster's galena. FeCl3 is the other etchant (iron + HCl from step 3).
- Critical path 6: sphalerite electrolysis also gives gallium; the board still needs persulfate or FeCl3 (drill, roaster, bisulfate, persulfate, etch, circuit).
- Byproducts: H2 (tank, MV methanol and ammonia), HCl (FeCl3, PVC), hematite (iron), stone dust (inert).

### L2 Coke-oven ammonia to the photographic plate (10)

Before Haber, ammonia came from coke-oven gas; Ostwald's process (1902) oxidises it to nitric acid; astronomical plates were glass coated with a silver-halide gelatin emulsion. The optical observatory (ours) already needs 4 photographic plates for the lunar map that the MV radio telescope and the HV rocket chip read; today a plate is 2 glass panes + a small pile of silver dust. This line makes the emulsion real and teaches the nitric acid that M1 and H2 need in bulk.

| # | Machine | In → out | Process |
|---|---|---|---|
| 1 | Coke battery (ours, Steam) | coal → coke + creosote + 125 mB coal gas | coking |
| 2 | LV distillery, 30 EU/t (`distill_coal_gas_to_ammonia`) | 1,000 mB coal gas → 300 mB NH3 + coke dust | ammonia recovery |
| 3 | LV chemical reactor, 30 EU/t (`nitric_oxide_from_ammonia`) | 2 NH3 + 5 O2 → 2 NO + 3 H2O | Ostwald oxidation |
| 4 | LV chemical reactor, 30 EU/t (`nitrogen_dioxide_from_oxide`) | NO + O2 → NO2 | oxidation |
| 5 | LV chemical reactor, 30 EU/t (`nitric_acid_from_dioxide_1`) | 3 NO2 + H2O → 2 HNO3 + NO (back to 4) | absorption |
| 6 | LV chemical reactor (new) | Ag + 2 HNO3 → silver nitrate (new) + NO2 (back to 5) + H2O | dissolving silver |
| 7 | LV chemical reactor (new) | silver nitrate + salt → silver chloride (new) + sodium nitrate | precipitation |
| 8 | LV mixer (new) | silver chloride + glue → photographic emulsion (new fluid) | emulsion making (animal glue is impure gelatin) |
| 9 | LV assembler (changed recipe) | 2 glass panes + emulsion → 2 photographic plates | plate coating |
| 10 | Optical observatory (ours) | chart + 4 plates + 2 paper → lunar map + ephemeris | exposure |

- Silver: galena → sulfide roaster → silver nuggets (exists). Air: gas collector and centrifuge.
- Byproducts: sodium nitrate (stored; H1 uses it in the rhodium nitrate step, and it is a real fertilizer), NO and NO2 loop inside the line, water, coke dust (sinter in S1).
- New materials: silver nitrate (dust), silver chloride (dust), photographic emulsion (fluid). GTM 7.5.3, GT-- and GTCA register none of them.

### L3, L4 and the LV chart

L3 sapphire to aluminium (4) and L4 drilling fluid (4) stay. Leaving the LV chart: the arc furnace's silicon (1) and sky dust (3), the heliostat (2), fertilizer (2), creatures (2), coal gas (1, now L2's step 1). The observatory cluster joins L2.

## 4. MV

### M1 Platline I: platinum and palladium (9; critical path 8)

**What is already in the pack.** GT-- 1.3.10 (`config/gtnn.json` harder platinum line, on) empties GTM's `pgs_separation` and installs a GTNH-style line whose stages are live as loose recipes; the EV platinum plant only composes them (`ev/platinum_plant.js`). Read on the dump, the stages run at 30 to 120 EU/t except the ammonium chloride precipitation, which exists only in the large chemical reactor (`large_platinum_dusts` 480 EU/t, `tiny_platinum_dusts` 30 EU/t). Every intermediate (platinum metal dust, concentrated platinum, platinum salt, refined platinum salt, raw platinum, palladium metal dust, palladium-rich ammonia, palladium salt, raw palladium, platinum slag) is registered. Platinum ore never smelts to platinum: GT--'s washer and the ore plant give platinum metal dust, the line's entry. So the platline already exists; it is hidden in an EV box and charted as four chains of 4 at EV.

**Real process:** Sudbury-style Ni-Cu sulfide (pentlandite, chalcopyrite) leached for a PGM sludge; aqua regia dissolves Pt and Pd; Pt precipitates as ammonium chloroplatinate; Pd is recovered from the ammine filtrate and reduced (formate).

| # | Machine | In → out | Process |
|---|---|---|---|
| 1 | MV vein drill | Overworld nickel vein → raw pentlandite (or copper vein → chalcopyrite) | mining |
| 2 | Macerator | raw → crushed pentlandite | crushing |
| 3 | Ore washer | crushed → purified pentlandite | flotation stand-in |
| 4 | Chemical reactor, 30 EU/t (`platinum_group_sludge_dust1_lv`) | purified pentlandite + 1,000 mB H2SO4 → PGM sludge (chance) + 2,000 mB sulfuric nickel solution | sulfuric leach |
| 5 | Centrifuge (`grindless:centrifuge/offworld_only/platinum_group_sludge_dust`) | 1 sludge → 6 platinum metal dust, 0.95 palladium metal dust, 3 gold, 3 SiO2 | separation |
| 6 | Chemical reactor, 30 EU/t (`dissolve_platinum_metallic_powder`) | platinum metal dust + aqua regia (adapted, see below) → concentrated platinum + platinum slag + NO2 (0.5 mB per mB of aqua regia) | aqua regia dissolution |
| 7 | Chemical reactor, MV, 120 EU/t (new `platinum_salt_mv`: half a `large_platinum_dusts` batch, since a chemical reactor holds 2 fluid outputs) | concentrated platinum + NH4Cl → platinum salt + raw platinum + palladium-rich ammonia + dilute hydrochloric acid | ammonium chloroplatinate precipitation |
| 8 | Chemical reactor, 30 EU/t (`large_palladium_dusts`) | palladium metal dust + palladium-rich ammonia → palladium salt + raw palladium | ammine salt |
| 9 | Chemical reactor, 30 EU/t (`raw_palladium_separation`) | raw palladium + formic acid → palladium + NH3 | formate reduction |

- Platinum: raw platinum + calcium → platinum + CaCl2 (chemical reactor, 30 EU/t; step 8); the salt goes sifter → EBF 900 K → platinum metal dust and back to step 6 (GT--'s loop).
- End ore entry (MV since v0.5.0): sheldonite vein → ore plant → platinum and palladium metal dust (steps 1, 2, then 6): shorter, so it is the critical path's start (8).
- Feeders: aqua regia (mixer: L2's HNO3 + 2 HCl); NH4Cl (NH3 + HCl); formic acid (brine electrolysis → NaOH; NaOH + CO from M2's arc furnace → sodium formate; + H2SO4 → formic acid, all 30 EU/t); calcium (CaCl2 electrolysis closes the loop).
- Adaptation (realism): GT-- dissolves platinum in nitration mixture (HNO3 + H2SO4), which does not dissolve platinum. The dissolve stages take aqua regia instead, and the precipitation's dilute sulfuric acid becomes dilute hydrochloric acid. The platinum plant composes the live stages (its composer reads script changes since FIX-COMPOSE), so it follows them.
- The new MV variant of step 7 is the only gate change: the large chemical reactor's PTFE gate added no step.
- Byproducts: sulfuric nickel solution → electrolysis → nickel + O2 + H2SO4 (acid comes back); gold → electrum; SiO2 → glass or silicon; NO2 → L2 step 5; dilute acid → distillery; NH3 → NH4Cl; CaCl2 → electrolysis; **platinum slag → stored for H1** (its stated future use, principle 3).
- Consumers at MV and HV: the HV reformer's platinum catalyst, the palladium hydrogenation catalyst of H2, the HCN catalyst, the MV wireless transmitter cover, then the EV platinum electrode, emitter and sensor rods and nano-circuit bolts.

### M2 Electronic-grade silicon to chips (10)

Today the boule (EBF, 1,784 K) melts 32 silicon dust from the Kanthal EBF's SiO2 + carbon: metallurgical silicon straight into a Czochralski crystal. Real chips need electronic-grade polysilicon from the Siemens process (trichlorosilane, distilled, deposited on hot rods with hydrogen).

| # | Machine | In → out | Process |
|---|---|---|---|
| 1 | MV electrolyzer | sand → silicon dioxide | mineral separation |
| 2 | Kanthal EBF, 2,273 K, 120 EU/t (`blast_silicon_dioxide`) | 3 SiO2 + 2 C → silicon (metallurgical) + CO | carbothermic reduction |
| 3 | Chemical reactor (new) | silicon + 3 HCl → trichlorosilane (new fluid) + H2 | hydrochlorination |
| 4 | Distillery (new) | crude trichlorosilane → trichlorosilane + SiCl4-rich bottoms | fractional distillation |
| 5 | EBF, cupronickel (new) | trichlorosilane + H2 → polysilicon (new `grindless:polysilicon`) + 3 HCl | Siemens CVD on hot rods |
| 6 | EBF, 1,784 K (`silicon_boule`, input changed) | 32 polysilicon + GaAs → silicon boule | Czochralski growth |
| 7 | Cutter | boule → 16 wafers | wafering |
| 8 | Laser engraver | wafer + lens → ILC or RAM wafer | lithography |
| 9 | Cutter | wafer → chips | dicing |
| 10 | Assembler | 2 good circuits + 2 ILC + 2 RAM + transistors … → advanced integrated circuit (HV circuit) | assembly |

- Byproducts: CO → methanol or M1's formic acid; H2 from 3 → step 5; HCl from 5 → step 3 (loop); bottoms → back to step 3 with silicon and H2 (real hydrochlorination of SiCl4), so nothing new needs a destination.
- The LV submerged arc furnace's silicon stays AE2's (`lv.md`, risks); D1-SILICON does not change it.
- Every GTM boule recipe (silicon, phosphorus and the higher ones) takes polysilicon instead of silicon dust; metallurgical silicon keeps all its other uses (alloys, AE2, wafers of the pack's own lines read their own inputs).
- New materials: trichlorosilane (fluid; the pack already registers `si28_trichlorosilane` the same way), polysilicon. The bottoms reuse the crude fluid.

### M3 Biomass to PVC (7) and M4 Crude to RP-1 and the static fire (7)

- **M3:** greenhouse (1) → brewery biomass (2) → distillery ethanol (3) → ethylene with H2SO4 (4, `ethylene_from_ethanol`) → ethylene + Cl2 over FeCl3 (L1) → 1,2-dichloroethane (5, GTM's `dichloroethane`, 120 EU/t) → EDC cracking → vinyl chloride + HCl (6, new: GTM has no cracking recipe) → PVC (7). Real (bio-ethylene, the balanced EDC route). GTM's `vinyl_chloride_from_hydrochloric` (ethylene + HCl + O2) gives EDC instead, as real oxychlorination does, so the cracker's HCl closes the loop; `vinyl_chloride_from_chlorine` and `vinyl_chloride_from_ethane` (one step, not industrial) go. Ends in the hazmat suit of the HV gate.
- **M4:** MV fluid drilling rig (1) → distillery fraction (2) → desulfurisation with H2 (3) → diesel (4) → kerosene (5, GT--) → RP-1 (6, GT--) → static fire: qualified thrusters (7). Merges two chains of 3.
- **M5** Eye of Ender (5) and **M6** Kanthal (4) stay. Leaving the MV chart: the ore plant (2; its outputs start M1 and other lines) and the radio telescope (1).

## 5. HV

### H1 Platline II: rhodium and ruthenium (20 measured: 9 staged from M1, 11 at HV)

The platinum slag M1 stores is the insoluble residue of real refining. GT--'s stages turn it into rhodium (pyrosulfate fusion, zinc cementation, chlorination, nitrite-style complexation, reprecipitation) and ruthenium (oxidative fusion to sodium ruthenate, volatile RuO4 distilled off).

| # | Machine | In → out | Process |
|---|---|---|---|
| 1-6 | M1 steps 1 to 6 | ore → platinum slag | as M1 |
| 7 | EBF 775 K, 120 EU/t (`leach_residue_one`) | slag + molten K2S2O7 → rhodium sulfate gas + inert metal mixture | pyrosulfate fusion |
| 8 | Chemical reactor, 30 EU/t (`rhodium_sulfate_to_solution`) | + water → rhodium sulfate + potassium | leaching |
| 9 | Chemical reactor, 30 EU/t (`crude_rhodium_metallic_powder`) | + zinc → crude rhodium + ZnSO4 | cementation |
| 10 | EBF 600 K, 120 EU/t (`rhodium_salt_ebf`) | + salt + Cl2 → rhodium salt | chlorination |
| 11 | Mixer (`rhodium_salt_solution`) | + water → rhodium salt solution | dissolution |
| 12 | Chemical reactor (`rhodium_nitrate`) | + sodium nitrate (L2) → rhodium nitrate + salt | complexation |
| 13 | Sifter (`rhodium_filter_cake`) | → rhodium filter cake | filtration |
| 14 | Mixer (`rhodium_filter_cake_solution`) | + water → solution | redissolution |
| 15 | Chemical reactor (`reprecipitated_rhodium`) | → reprecipitated rhodium | purification |
| 16 | Chemical reactor (`rhodium_dust`) | + HCl → rhodium + Cl2 + NH3 | reduction |

- Ruthenium: inert metal mixture (7) + saltpeter + salt water → EBF 775 K → sodium ruthenate (8) → + Cl2 → RuO4 (9) → cracker + steam → hot RuO4 (10, HV machine) → distillery 120 EU/t → liquid RuO4 (11) → (frozen) → + HCl → ruthenium (12).
- Feeders: K2S2O7 (K + S + O2, 120 EU/t; melted in the extractor), zinc (sphalerite, roaster), sodium nitrate (L2 or sodium + HNO3), Cl2 and HCl (brine).
- HV consumer (new, real): the integrated nitric acid plant. GTM's large chemical reactor `nitric_acid_from_ammonia` (NH3 + O2 → HNO3 in one reactor) takes a platinum-rhodium gauze (new `grindless:platinum_rhodium_gauze`: 9 platinum foil + 1 rhodium foil, consumed by chance like the pack's other catalysts), as every real Ostwald plant does. GTM's `nitric_acid_from_elements`, `nitrogen_dioxide_from_elements` and `dinitrogen_tetroxide_shortcut` (nitrogen oxides from the elements in a reactor) go. Ruthenium's first consumer stays EV (the Martian ruthenium catalyst; RTM alloy).
- Honest note: every rhodium stage runs at 30 to 120 EU/t, so a MV player may run it; no gate is added. The cracker makes ruthenium HV.
- Byproducts: ZnSO4 → electrolysis (zinc and acid back); salt → brine; Cl2 → HCl; NH3 → NH4Cl; potassium → K2S2O7; water. The rarest metal mixture stays stripped on Earth (`offworld_only.json`; decision D-1).

### H2 Hydrazine and Aerozine 50 (8 measured; steps 1-3 are L2's end product, a crossing, and step 12 is drawn in H3's rocket cluster)

Riedl-Pfleiderer hydrogen peroxide (2-ethylanthraquinone hydrogenated on palladium and autoxidised in air, the world's only industrial route), hydrazine by the peroxide process, and Aerozine 50 (half hydrazine, half UDMH) burned with N2O4: the hypergolic pair of the Titan II and the Apollo service module. GT-- already registers and runs the whole cycle in its `gtnn:exxonmobil_chemical_plant` (recipe type `gtceu:chemical_plant`); a direct H2 + O2 → H2O2 reactor recipe (240 EU/t) makes it optional today, and GTM's rocket fuel is UDMH alone.

| # | Machine | In → out | Process |
|---|---|---|---|
| 1 | Vein drill | coal vein → coal | mining |
| 2 | Coke battery (ours) | coal → coke + coal gas | coking |
| 3 | Distillery, 30 EU/t (`distill_coal_gas_to_coal_tar`) | coal gas → coal tar | tar recovery |
| 4 | Distillery, 30 EU/t (`distill_coal_tar_to_naphthalene`) | coal tar → naphthalene | tar distillation |
| 5 | Chemical reactor (`phthalic_anhydride`, retiered 1,920 → 480 EU/t) | naphthalene + air + V2O5 → phthalic anhydride | catalytic oxidation |
| 6 | Chemical plant, 120 EU/t (`ethyl_anthra_quinone`) | phthalic anhydride + ethylbenzene → 2-ethylanthraquinone | Friedel-Crafts and ring closure |
| 7 | Chemical plant, 120 EU/t (`ethyl_anthra_hydro_quinone`) | EAQ + H2 + Pd-V catalyst (`gtnn:orange_metal_catalyst`, M1's palladium) → EAHQ | hydrogenation |
| 8 | Chemical plant, 480 EU/t (`hydrogen_peroxide_air`) | EAHQ + air + anthracene make-up → H2O2 + EAQ (back to 7) | autoxidation |
| 9 | Chemical plant, 480 EU/t (`hydrazine`) | NH3 + H2O2 → hydrazine | peroxide process |
| 10 | Mixer (new) | hydrazine + UDMH → Aerozine 50 (new fluid) | blending |
| 11 | Mixer (changed) | Aerozine 50 + N2O4 → rocket fuel (`gtceu:rocket_fuel`) | propellant charge |
| 12 | Engine test stand (ours) | untested motor + rocket fuel → basic rocket motor | static fire |

- UDMH branch (Raschig, real; all exist): methanol + NH3 → dimethylamine; Cl2 + water → HOCl; + NH3 → monochloramine; + dimethylamine → UDMH. N2O4: L2's NO2 dimerised (`dinitrogen_tetroxide_from_dioxide`, 30 EU/t).
- Feeders: ethylbenzene (coal gas distillery or benzene + ethylene), H2 (syngas plant, ours), NH3 (Haber `ammonia_from_elements` or L2), V2O5 (vanadium from the ore plant).
- Removed: `hydrogen_peroxide` (chemical and large reactor, H2 + O2 directly: not an industrial process), `dimethylhydrazine_from_methanol` (one step, not real), GTM's `rocket_fuel_from_oxygen` and `rocket_fuel_from_dinitrogen_tetroxide` (replaced by step 11).
- Byproducts: H2S from coal tar → sulfuric acid; coke dust → S1 sinter; dilute HCl from Raschig → distillery → HCl; water. EAQ circulates; only anthracene (coal tar) is made up.

### H3 Composite rocket motor: epoxy and Kapton (9; fuel-tank branch 8; step 1 is the rig's base resource)

The first rocket's motor already crosses MV and HV (`hv.md`, *The first rocket*). Today the charts split it into eleven chains of 1 to 3 (refinery, aromatics, rocket). Merged, with GTM's large-reactor shortcuts removed, it is the cumene, bisphenol A and epoxy chain into the composite autoclave.

| # | Machine | In → out | Process |
|---|---|---|---|
| 1 | MV fluid drilling rig | crude oil | extraction |
| 2 | Refinery (ours), circuit 1 | crude + H2 → naphtha, gas, light, heavy | hydrotreating and fractionation |
| 3 | Refinery, circuit 3 | naphtha + steam → benzene, propylene, ethylene … | steam cracking |
| 4 | Chemical reactor (`cumene_from_benzene`) | benzene + propylene + H3PO4 → cumene | alkylation |
| 5 | Chemical reactor (`phenol_from_cumene`) | cumene + O2 → phenol + acetone | Hock process |
| 6 | Chemical reactor (`bisphenol_a`) | 2 phenol + acetone + HCl → bisphenol A | condensation |
| 7 | Large chemical reactor (`epoxy_from_bisphenol_a`) | BPA + epichlorohydrin + NaOH → epoxy + salt water | epoxide resin |
| 8 | Composite autoclave (ours) | epoxy + fiberglass + N2 → ablative tile; epoxy + para-aramid + drum → COPV | autoclave curing |
| 9 | HV assembler | thrusters + tiles + Kapton K + frame → untested motor | integration |
| 10 | Engine test stand (ours) | → basic rocket motor | static fire (shared with H2) |

- Kapton branch (GCYR, exists): benzene → chlorobenzene → nitrochlorobenzene (nitration mixture: L2) → oxydianiline sludge (+ aminophenol, DMF) → distillation → ODA → + PMDA (coal tar → durene → PMDA) → Kapton K (step 8 equivalent).
- Removed (GTM `LCRCombined`, circuit 24): `phenol_acetone_shortcut`, `phenol_hcl_shortcut`, `phenol_salt_shortcut`, `epoxy_shortcut`. Kept: the epichlorohydrin shortcuts (they only shorten a branch).
- Byproducts: salt water → brine electrolysis; HCl → chloroform (H5); N2 vented (inert); refinery fractions each with their line (H6, H7, the syngas plant).

### H4 Kroll titanium from lunar ilmenite (5, decision D-2 default)

It already runs at HV: the EV gate's titanium is made on Earth from the lunar ilmenite the first rocket brings (`hv.md`, *HV without titanium*). The chart moves from EV to HV.

1. Lunar drill (ours, the Moon): ilmenite.
2. EBF 1,700 K, 480 EU/t (`rutile_from_ilmenite`): ilmenite + carbon → rutile + wrought iron (synthetic rutile).
3. Chemical reactor, 480 EU/t (`titanium_tetrachloride`): rutile + 2 C + 4 Cl2 → crude TiCl4 + 2 CO (output becomes crude, new fluid).
4. Distillery (new, `grindless:kroll_crude_tetrachloride`, 120 EU/t): 1,250 mB crude TiCl4 → 1,000 mB TiCl4 + silica dust (the bottoms; in real plants VOCl3 and SiCl4, but a distillery has one fluid output, so the residue leaves as a solid).
5. EBF 2,141 K (`titanium_from_tetrachloride`): TiCl4 + 2 Mg → hot titanium + MgCl2; the vacuum freezer cools it (not a counted step).

- Magnesium loop: 3 MgCl2 → electrolyzer → Mg + 2,000 mB Cl2 (`grindless:magnesium_chloride_electrolysis`; GTM has only `salt_from_magnesium_chloride`, MgCl2 reduced by sodium, which stays as the alternative). The reduction's 6 MgCl2 per titanium give back 2 Mg and the 4,000 mB Cl2 of step 3, as in real Kroll plants. The loop adds no length.
- Byproducts: CO → methanol or M1's formate; wrought iron → steel; silica dust (bottoms) → glass or silicon.

### H5 PTFE through R22 (6), H6 SBR (5), H7 Gasoline (3, not a line), H8 Nichrome (4)

- **H5:** rig (base resource) → refinery gas (1) → steam-cracking methane (2; the refinery's `steamcrack` recipes, there is no distillery recipe) → chloroform (3, methane + Cl2) → chloroform + 2 HF → chlorodifluoromethane (R22) + 2 HCl (4, new recipe; GTM registers R22 with no recipe) → 2 R22 → TFE + 2 HCl, pyrolysis (5, new; replaces `tetrafluoroethylene_from_chloroform`) → PTFE (6). HCl to vinyl chloride and acid.
- **H6:** rig (base resource) → refinery (1) → cracking (2) → styrene (benzene + ethylene) → SBR → vulcanised rubber: 5 in all.
- **H7:** rig (base resource) → refinery → reformer toluene / raw gasoline (large reactor) → gasoline: 3 steps, so a short chart, not a line.
- **H8:** unchanged.
- Leaving or merging in the HV chart: refinery (4 x 1) and aromatics (5 x 1) become H3's, H6's and H7's front; syngas (2) becomes H2's hydrogen feeder; rocket (3 + 2) becomes H3.

## 6. Basic materials that change

| Material | Today | After | What it moves |
|---|---|---|---|
| Steel (Steam) | steam blast furnace: ore + coke + calcite → steel | sinter → pig iron → Bessemer steel; primitive blast furnace unchanged | `steam.md` steam blast furnace section, `tables/steam_blast_furnace.json`, the steam chapter's steel quests, steel's price in the cost matrix (LV casings and hulls); yield and coke per steel unchanged |
| Silver halide (LV) | plate = glass + small silver dust | plate = glass + emulsion (AgNO3 → AgCl + glue) | observatory recipes and quests; silver per plate about the same |
| Nitric acid (LV to HV) | Ostwald stages exist; HV has one-reactor shortcuts | Ostwald stages taught at LV; the HV one-reactor route needs a Pt-Rh gauze; the from-elements recipes go | HV nitric users (Kapton, N2O4, nitration mixture) |
| Silicon (MV) | boule from metallurgical silicon dust | boule from polysilicon (trichlorosilane, Siemens) | `mv.md` silicon route, every boule recipe, HV, EV and later circuits' price (key items: circuits) with the same counts |
| Platinum, palladium (MV) | loose GT-- line usable from HV (LCR precipitation); taught only through the EV plant | same line taught and usable at MV (one MV variant); aqua regia dissolution | HV reformer catalyst, EV electrode, emitter, sensor and nano-circuit routes; the EV plant stays the compressed form |
| Rhodium, ruthenium (HV) | loose, untaught | taught at HV; new Pt-Rh gauze consumer | EV ruthenium catalyst available earlier |
| H2O2, hydrazine, rocket fuel (HV) | direct H2O2; UDMH rocket fuel | anthraquinone only; rocket fuel = Aerozine 50 + N2O4 | every `gtceu:rocket_fuel` consumer (GCYR rockets of all tiers, the test stand, GT-- rocket engines, Power tab and `site_fuels.json` figures) |
| PTFE, PVC | one-step TFE; one-step vinyl chloride | R22 pyrolysis; EDC cracking | large chemical reactor and inert casing price; hazmat suit |
| Phenol, epoxy | LCR shortcuts | only the cumene route | composite autoclave inputs |
| Titanium, rare earths, iridium, osmium | as today | as today (defaults below) | nothing |

Reachability: every new recipe runs at or below its line's era on machines the era already has; the one new machine-level dependency is GT--'s chemical plant for H2 (MV structure; D1-HV-PROP proves it forms and runs).

## 7. Owner decisions

### D-1 Where osmium and iridium first appear

| Option | What it means | Consequences |
|---|---|---|
| **A (default)** Off-world, as today | Earth's sludge stays stripped; Mercury's iridosmine (IV) and the asteroid belt (LuV) are the sources; the platline's IV tail is the plant's mode 3 and its loose GT-- stages | No change to `iv.md` decision 5, the Mercury trip's purpose or the IV and LuV supply; H1 ends at Rh and Ru, already 16 |
| B Earth trace at HV | Un-strip the rarest metal mixture from the inert metal leach; H1 adds Ir (7 more stages; `iridium_chloride_separation` retiered 1,920 → 480) and Os (OsO4 distillation) | Ir and Os two eras early: IV items priced on iridium (rods, plates, the substation frame) become reachable at HV; Mercury becomes a rate upgrade; `iv.md` and `luv.md` supply text and the cost curve's band B must be redone |
| C Osmium only at HV | OsO4 co-distils with RuO4 in H1's step 11 (real); iridium stays off-world | Os two eras early (osmium cables, osmiridium); smaller than B, still touches IV |

### D-2 Where titanium first appears if a Kroll line runs before EV

| Option | What it means | Consequences |
|---|---|---|
| **A (default)** The Moon only | H4 runs at HV on lunar ilmenite, as the EV gate already requires; it moves from the EV chart to HV and gains the TiCl4 distillation | Keeps "HV without titanium" (2026-10-24) and the journey (the Moon is titanium's only place) |
| B Earth titanium at HV from red mud | Re-enable rutile from GTM's Bayer chain (bauxite slurry, cracker, sludge decalcification) and merge Bayer, Solvay and Kroll (research P-4, about 12) | Titanium before the first rocket: the rocket's purpose, the EV gate and `journey.md` option A fall; HV items move to titanium |
| C Earth ilmenite from the End | Restore the End bauxite vein's ilmenite at MV or HV | Same as B, earlier |

### D-3 Whether rare earths arrive at HV or EV

| Option | What it means | Consequences |
|---|---|---|
| **A (default)** EV | Rare earths stay EV (`ev.cascade`); the EV design deepens them with GTCA 2.2.0's bastnasite intermediates (in the pack) and the monazite line (research E-1, about 18). HV keeps native neodymium ore for the EV gate's magnet | No HV work; EV keeps its best long-line candidate |
| B HV | GTCA's bastnasite line retiered to HV: its front end (GTCA thermal reactor, 1,920 EU/t) replaced by our acid digestion, `conditioned_to_diluted` 1,920 → 480; 12 to 14 steps; Nd, La, Ce at HV | A fourth HV line of 12+; native neodymium ore must stop being a one-step bulk source (a basic-material change that moves the EV motor and voltage coil); the largest of the three packages |

## 8. Quests and Processing Lines charts

Each era chapter teaches its lines in order, one quest per step that makes a new species, each text saying what the step is for, what it needs, what it unlocks and how to automate it (principle 5); the line's end product is the quest that matters for the gate. Rewards stay proportionate and never skip a step. Chains under 4 steps leave the charts; their machines keep ordinary quests.

| Chart | Keep or new | Merge into a line | Leave the chart |
|---|---|---|---|
| `pl_steam` | S1 ironworks (new), S2 firebricks, S3 ore | coke, steel, drill → S1 | rubber, glass, sky, collector |
| `pl_lv` | L1 boards (new), L2 photographic plate (new), aluminium, drilling fluid | acid, roaster, salt, diodes → L1; coal gas, observatory → L2 | arc, heliostat, fertilizer, creatures |
| `pl_mv` | M1 platline I (new), M2 silicon, M3 PVC, M4 RP-1, end, alloys | wood, plastics → M3; fuels, fire → M4 | plant, radio |
| `pl_hv` | H1 platline II (new), H2 propellant (new), H3 motor, H4 Kroll (from `pl_ev`), H5 PTFE, H6 SBR, H7 gasoline, nichrome | refinery, aromatics, rocket → H3, H6, H7; syngas → H2 | none |
| `pl_ev` | the platinum plant as the compressed form of M1 and H1 | the four `ev.platinum` chains → one plant node linked to H1 | `ev.kroll` (to H4) |

Chapter notes: Steam teaches why steel takes six steps (sinter, smelt, blow) and that the primitive blast furnace is the bootstrap. LV teaches nitric acid as a process the player will keep building (M1, H2). MV's platline quests say plainly that the slag is kept for HV. HV's quests join H2 and H3 at the static fire, the first rocket's final test.

## 9. Implementation packages (dependency order)

Full contracts are in the handoff. Each is one Sonnet session, at most 2 repairs.

| Id | Scope | Depends on | T1 doubt |
|---|---|---|---|
| D1-AUDIT | line audit counts a staged line through its own earlier stage; accepted bootstrap routes | none | none |
| D1-STEAM | S1: sinter, pig iron, two steelmaking circuits | none | steam blast furnace's two circuit modes select and run with buses |
| D1-LV-PHOTO | L2: silver nitrate, silver chloride, emulsion, plate | none | none |
| D1-PGM-MV | M1: MV precipitation variant, aqua regia dissolution | none | platinum plant composes from the changed stages |
| D1-SILICON | M2: trichlorosilane, distillation, Siemens, polysilicon boules | none | none |
| D1-POLY | M3 EDC cracking and oxychlorination, H5 R22, H3 LCR shortcut removals | none | none |
| D1-PGM-HV | H1: Pt-Rh gauze, integrated nitric acid, nitrogen-oxide shortcuts | D1-PGM-MV | none |
| D1-HV-PROP | H2: peroxide and UDMH shortcuts out, phthalic anhydride retiered, Aerozine 50, rocket fuel | D1-PGM-MV | GT--'s chemical plant forms and runs EAHQ → H2O2 → hydrazine |
| D1-KROLL | H4: crude TiCl4 and its distillation, MgCl2 electrolysis | none | none |
| D1-CHARTS | `pl-data-{steam,lv,mv,hv,ev}.mjs` per section 8 | all above | none |
| D1-QUESTS | `{steam,lv,mv,hv}-chapter/quests-data.mjs` per section 8 | D1-CHARTS | none |

## 10. Licences

GT-- (AGPL-3.0) and GTCA (LGPL-3.0) are downloaded mods: their live recipes are used and changed by our KubeJS; nothing of theirs is copied. GTM and GCYR (LGPL-3.0): recipes used and changed. GTNH and Technological Journey: ideas only (the platline's lineage). Everything else is real chemistry and engineering: sintering and the Bessemer converter, coke-oven ammonia and Ostwald, silver-halide plates, the Siemens process, Riedl-Pfleiderer, Raschig, Aerozine 50, the Hock process, R22 pyrolysis, Kroll.

## 11. Risks

- The primitive blast furnace stays shorter than S1 and many cheap ones can out-produce one steam blast furnace; S1's gain is automation and buses, as today.
- Changing GT--'s dissolve and precipitation stages changes the EV platinum plant's composed recipes; the plant test must pass, or the aqua regia adaptation is dropped and only the MV variant ships.
- Rocket fuel's new recipe reaches every consumer of `gtceu:rocket_fuel`; GT--'s chemical plant has never run in a pack test.
- Polysilicon raises the price of every circuit from HV up (counts unchanged); the cost gate (x1.3 per era) must still pass.
- The audit counts charts, not recipes: until D1-AUDIT, H1 reads as 10 and the bootstrap reads as a skip.
