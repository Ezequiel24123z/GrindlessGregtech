# Long production lines: sources, candidates and merge options (R-LINES)

Research package R-LINES, 2026-11-02. Question: which lines of 10 or more real steps exist in Star Technology (StarT), Technological Journey (TJ) and GTNH, at which tier, with which steps, under which licence, and how each maps onto GTM 7.5.3 and this pack. This file is research only: nothing under `pack/` or `tools/` changed. Owner direction applied: follow real processes (TJ style), whole lines may be imported where the licence allows and are then adapted, flag the basic materials each line would change, and the platinum-group line is one of the pack's massive lines.

## 0. Method and how to read the numbers

- **Step** = one machine recipe that makes a new intermediate. Packaging, compress/decompress, recycling, plain cell or bucket moves and pure form changes are not steps. Chains of 2 or 3 steps are not lines and appear nowhere; 4 is the minimum for anything counted.
- **Steps** is the longest dependency chain. "Recipes" is the total count, listed separately where known.
- **Verified** = the research pass read the recipe code and chained it by hand. **Est.** = estimated from module structure or from feeders that were not traced recipe by recipe. Counts are hand counts, not source claims.
- Sources read: StarT scripts (`kubejs/server_scripts`), TJ (`overrides/scripts` plus the upstream Gregicality Java it bundles), GT5-Unofficial tags 5.09.54.265 and 5.09.54.270, NewHorizonsCoreMod 2.9.99 and 2.9.103, GTM `PlatGroupMetalsRecipes.java` (branch 1.20.1). The GTNH wiki was not reachable (404), so no count depends on it. The StarT-Core Java was not read.
- Tier names: StarT and GTM share LV to MAX one to one. GTNH's tiers run UHV, UEV, UIV, **UMV**, UXV, MAX; GTM and this pack run UHV, UEV, UIV, **UXV**, OpV, MAX. So GTNH UMV is about this pack's UXV, GTNH UXV about OpV, GTNH MAX is MAX. Nothing in any source goes beyond MAX.
- Tier labels inside StarT are nominal: many of its recipes are cheap ZPM recipes with a higher label. Where a StarT script gives only `EUt=<number>` the tier is inferred and marked "~".
- Licence status: **import** = MIT or LGPL, usable with attribution (AGENTS.md). **ideas** = GPL, non-commercial or ambiguous: read, then re-derive from real chemistry; copy nothing. For GTNH the pack already records "ideas only" (CREDITS.md lines 50, 53, 68, 77). This file keeps that line even for GT5-Unofficial (LGPL-3.0); see section 7.
- "Adaptation" = a way to make the line more realistic (early and mid tiers) or more futuristic and interesting (late tiers). "Touches" = basic materials whose supply or rate the line would change.

### Owner targets against the audit baseline

| Era | Audit today: lines of 4+ steps, longest | Owner target, longest line | Best candidate found |
|---|---|---|---|
| Steam | 2, 5 | 6 | ore plant + coke/steel merge 6-7; void-drill slurry 5-6 |
| LV | 3, 6 | 8 | precious metals 5 plus acid sub-lines; nitric chain 4 |
| MV | 5, 8 | 10 | platline Pt/Pd/Rh stage: 10-12 at MV |
| HV | 2, 4 | 12-13, several | platline 13, hydrazine/H2O2 12-13, bastnasite 14 |
| EV | 15, 6 | about 14 | monazite rare earths 18 (EV, lowerable), platline Os/Ir tail |
| IV | 8, 7 | about 16 | naquadah ladder, thorium/molten-salt loop |
| LuV to ZPM | 10, 9 / 7, 5 | about 18 / 20 | PEDOT:PSS 10-12, naquadah ladder 15, aerogel 7-8 |
| UV to UXV | 10, 12 to 46, 8 | +2 per era | hormone 13, akreyrium 12, stargate rods 12 |
| OpV to MAX+ | 45, 7 to 59, 6 | +2 per era | Planck circuit 14+, quantum circuit 12-14, Creon plates 12 |

The baseline counts come from `tools/analysis/line-audit.mjs` on the batch dump (real lines of 4 or more steps; era: count, longest). Targets are a guide, not quotas (AGENTS.md rule 7).

## 1. Platinum-group line (platline), in depth

The owner wants this as one of the pack's massive lines. Four versions exist, plus the pack's own plant.

### 1.1 The real process (general refinery practice; no primary source fetched in this pass)

Pt, Pd, Rh, Ru, Os and Ir come from Cu-Ni sulfide matte, anode slimes and magnetic concentrates. The industrial order is:
1. Concentrate and leach the base metals (here: sulfide ore with nitric acid gives a sulfate solution and a platinum-group sludge, PGS).
2. Dissolve the sludge in aqua regia (1 HNO3 : 3 HCl). Pt, Pd (and Au) dissolve; Rh, Ru, Os, Ir mostly stay in the insoluble residue.
3. Precipitate Pt as ammonium chloroplatinate, (NH4)2PtCl6, with NH4Cl; wash; ignite to platinum sponge.
4. Recover Pd from the filtrate as the diamminedichloropalladium salt (ammonia, then HCl), then reduce it (hydrogen or formate).
5. Treat the insoluble residue: fuse it (K2S2O7 for Rh; NaOH/nitrate or peroxide for Ru and Os), then oxidise Ru and Os to the volatile tetroxides RuO4 and OsO4 and distil them off into HCl, ethanol or alkali scrubbers; reduce each to metal.
6. Ir stays in the residue: oxidise to IrO2, dissolve in HCl, precipitate as (NH4)2IrCl6 with NH4Cl, reduce in hydrogen.
7. Modern plants replace the precipitation steps with solvent-extraction cascades (amine, TBP) and ion exchange.

### 1.2 The four versions side by side

| Version | Licence | Entry | Longest chain | Recipes | Tier span | Ammonium chloroplatinate? |
|---|---|---|---|---|---|---|
| **GTM 7.5.3** `PlatGroupMetalsRecipes.java` (+`AcidRecipes`) | LGPL-3.0 | sulfide ore + HNO3 | 7 ore to Ir; 10 with the Ostwald nitric feeder; est. 11 with chlor-alkali | 17 (+about 5 feeders) | LV to IV, most MV | **No**: aqua regia goes straight to PtCl2 |
| **GTNH** `bartworks/.../PlatinumSludgeRecipes.java` (GT5-Unofficial) | code LGPL-3.0; pack and design CC BY-NC-SA: ideas | purified ore | 15 to Rh (17 with ore prep); 31 steps across all branches | about 70 entries, about 45 distinct | LV to EV (Os distillation IV, Ir last step EV in code) | **Yes**: crude salt (centrifuge), sifter, EBF to powder |
| **TJ** (Gregicality `GARecipeAddition.java`, bundled by TJ) | GPL-3.0; Gregicality README "No License": ideas | Pt/Pd ore dust | 14-15 from air, 11 from the metallic powder | about 42 | LV to MV; gates EV (Pd formic, Ir/Ca), HV (Ru crack and distil), IV (Os distil) | **Yes** |
| **StarT** | MIT | none | none of its own | 2 | ZPM | no: only `chemical_skip` recipes (`multiblock_recipes/chemical_plant.js`) that fold GTM's chain into one ZPM recipe with +5% Ru/Rh/Os/Ir |
| **This pack today** `gtceu:platinum_plant` (`docs/eras/ev.md` 176-192) | GT--, AGPL-3.0, read in game, nothing copied | sulfide ore | about 40 live recipes folded into 5 at load | 5 | EV | yes (inside) |

GTNH and TJ share the same reagent logic: K2S2O7 fusion and Zn cementation for Rh, formic acid for Pd, Ca reduction for Ir, RuO4 and OsO4 distillation, NH4Cl and Cl2 loops. GTM's own chain is the shortest and skips the ammonium salts.

**Correction (D1-LINES, verified on dump 6f89eb0df970):** in this pack GTM's chain above is not live. GT-- 1.3.10's harder platinum line empties `pgs_separation` and the osmium, rhodium, inert-metal and rarest-metal steps and installs its GTNH-style stages as loose recipes, all registered under `gtceu:`. They run at 30 to 120 EU/t (chemical reactor, mixer, sifter, centrifuge, EBF 600-900 K, distillery), except the ammonium chloride precipitation (`large_platinum_dusts` 480 EU/t and `tiny_platinum_dusts` 30 EU/t, large chemical reactor only), the hot RuO4 cracker (480) and `iridium_chloride_separation` (1,920). The sulfuric attack has a 30 EU/t chemical-reactor variant (`platinum_group_sludge_dust1_lv`, `_dust2_lv`). Platinum ore washes to platinum metal dust, the line's entry, never straight to platinum.

### 1.3 Step lists

**GTM (LGPL-3.0, already in the pack's GTM):** chemical reactor, sulfide ore + 100 mB HNO3 gives 2 PGS (4 from cooperite) + Cu/Ni sulfate solution (LV). Mixer: 1000 HNO3 + 2000 HCl gives aqua regia (LV). Centrifuge `pgs_separation` (HV): 6 PGS + 1200 aqua regia gives 3 PtCl2, 3 PdNH3, 2 RhRuO4 mixture, 1 IrOsO4 mixture, 2 residue. Pt: electrolyzer (MV). Pd: reactor + HCl gives Pd + NH4Cl (MV). Rh and Ru: reactor + H2SO4 (EV), then electrolyzer for Rh (MV) and reactor + C for Ru (MV). Os and Ir: large reactor + HCl (IV), distillation of the acidic osmium solution (MV), H2 reduction for Os (LV), residue centrifuge (MV), H2 reduction for Ir (LV).

**GTNH (ideas only):** (1) ore + aqua regia gives PT concentrate. (2) + NH4Cl gives crude chloroplatinate salt, raw powder, Pd-ammonia solution, NO2. (3) sifter gives refined salt. (4) EBF 900 K gives metallic powder + Cl2. (5) EBF gives Pt (loop: powder + aqua regia back to step 1). (6) raw Pt + Ca gives Pt. Pd: Pd powder + Pd-ammonia, sifter loop, raw Pd + formic acid gives Pd + NH3 + ethylene. Rh: residue + molten K2S2O7 (EBF 775 K) gives Rh sulfate; water; Zn cementation; Cl2 roast gives Rh salt; NaNO3; filter cake; ReRh salt; HCl gives Rh. Ru: alkali fusion (saltpeter) gives sodium ruthenate; Cl2 gives RuO4 solution; heater; distillation (HV); HCl gives Ru. Os: HCl leach of the Ir/Os residue; OsO4 distillation; HCl gives Os. Ir: IrO2; HCl; NH4Cl gives ammonium chloroiridate; Ca gives Ir. Reagent sub-chains: Ostwald HNO3 (NH3, NO, NO2, HNO3), NH4Cl, formic acid (CO + NaOH, then H2SO4; the Na2SO4 returns as Na + acid).

**TJ (ideas only):** same shape as GTNH, entered from ore dust, with the Rh path 12 steps (aqua regia, Pt concentrate, K2S2O7 fusion, solution, Zn, chlorination, mixer, NaNO3, sifter, mixer, ReRh, HCl) and separate Pt (6), Pd (7), Ru (8 deep), Os (6 deep), Ir (8 deep) branches. Residues return Au, Si, Ni and Cu; Rh + 3 Pd mixes into rhodium-plated palladium.

### 1.4 At which tier a player could start it

- **LV:** nitric acid, HCl, aqua regia, sulfide-ore leach, Pd formic reduction, Os and Ir reductions are all LV recipes in GTM and GTNH. A player can start the front end at LV.
- **MV:** every Pt, Pd and Rh stage in GTNH and TJ runs at MV (EBF 775-900 K is below cupronickel coil heat). The pack's End veins carry platinum at MV (`docs/eras/ev.md` line 33), so MV is the natural first tier for a real Pt/Pd/Rh line.
- **HV:** the GTM separation centrifuge and the Ru stage (heater, distillation) are HV.
- **IV and EV:** GTM puts the Os/Ir large reactor at IV; GTNH puts Os distillation at IV and Ir reduction at EV. Nothing physical needs these tiers, so they can be lowered to HV.
- Earth ores in the pack carry no Ir or Os (`ev.md` 180-190): those come from Mercury (IV) and the asteroid belt (LuV). Moving the whole line to MV to HV forces a decision on where Os and Ir first appear (see gaps).

### 1.5 Proposed shape for the pack

A staged, visible line instead of one compressed plant (a decision for the owner and the era design, not made here):

1. **LV feeders** (4 to 6 steps): ammonia (coal gas already exists, `lv.coalgas#ammonia`), NO, NO2, HNO3, brine to Cl2 to HCl.
2. **MV Pt/Pd stage** (about 10 steps from sulfide ore): leach, aqua regia, ammonium chloroplatinate precipitation, wash, ignition to Pt; Pd as ammine salt, formic or H2 reduction; NH4Cl loop. Fits the MV target of 10.
3. **MV to HV Rh and Ru** (adds 5 to 8): K2S2O7 fusion, cementation, chlorination, nitrate and cake steps for Rh; alkali fusion, RuO4 volatilisation, distillation (HV) for Ru.
4. **HV Os and Ir** (adds 4 to 6): HCl leach, OsO4 distillation, IrO2, (NH4)2IrCl6, reduction. Longest chain from air and brine: about 13 (4 nitric, 1 aqua regia, 8 along the Ir path). Meets the HV target of 12 to 13.
5. **EV plant:** the existing `platinum_plant` can stay as the compressed late form ("several steps in one", AGENTS.md rule 4) of a line the player has already built by hand at MV and HV, as StarT's `chemical_skip` does.

Adaptations: realistic, name the real species and move Os and Ir to HV; futuristic, replace the precipitation steps with a solvent-extraction or ionic-liquid cascade multiblock at EV and add a vacuum OsO4/RuO4 distillation unit.

Touches: **platinum, palladium, rhodium, ruthenium, osmium, iridium** (all supply and rate), nickel and copper (sulfate byproduct), gold (TJ residue), rhenium (GTNH ReRh), zinc, potassium, sodium, calcium, nitric acid, HCl, chlorine, ammonia, formic acid. Pack consumers to re-check: the platinum anode (`ev.md` 128 and 133), the ruthenium catalyst (`ev.md` 170), `grindless:platinum_electrode`, and StarT-style nether-star powders that use Pt and Rh.

## 2. Band 1: Steam to HV (lines a HV player can run)

Candidates of 12 or more steps first, then the shorter ones that serve the Steam, LV and MV targets. Every line below runs at HV or below as written or after lowering the stated steps.

### P-1 Platinum-group line, staged (13 steps from air at HV; 10 to 12 at MV)
- **Source and licence:** section 1. GTM chain: LGPL-3.0, import with attribution. GTNH, TJ: ideas only. Real chemistry: free.
- **Tier:** LV start, MV core, HV for Ru, Os, Ir.
- **Steps:** NH3, NO, NO2, HNO3 (4); brine to Cl2 to HCl (2, parallel); aqua regia; ore leach to PGS; separation; (NH4)2PtCl6; ignition to Pt; Pd salt and reduction; alkali fusion; RuO4 distillation; Os and Ir branches.
- **Mapping:** GTM has every machine and PGS, aqua regia, PtCl2, PdNH3, RhRuO4, IrOsO4, OsO4, RuO4, IrCl3. New: ammonium chloroplatinate, ammonium chloroiridate, K2S2O7, formic acid, sodium ruthenate, Rh intermediates (about 12 materials). GTM's shorter chain would be replaced, not stacked.
- **Correction (D1-LINES, verified on dump 6f89eb0df970):** none of these is new. GT-- registers platinum salt and refined platinum salt (the chloroplatinate), raw platinum, palladium salt, raw palladium, potassium pyrosulfate (and its melt), rhodium sulfate, rhodium salt, rhodium nitrate, rhodium filter cake, reprecipitated rhodium, inert metal mixture, sodium rutheniate, ruthenium tetroxide, iridium chloride (the chloroiridate) and acidic osmium solution; formic acid and sodium formate are GTM's.
- **Adaptation and touches:** section 1.5.

### P-2 Hydrazine, hydrogen peroxide (anthraquinone) and rocket fuel (12 to 13 steps)
- **Source:** TJ, Gregicality `GARecipeAddition.java` lines 929-956 plus the K2Cr2O7 area. GPL-3.0: **ideas only**. Real chemistry (Riedl-Pfleiderer anthraquinone process, hydrazine, MMH/NTO bipropellants).
- **Tier:** LV to EV; HV when phthalic acid and K2Cr2O7 steps are lowered.
- **Steps:** N2 to NH3 (HV), NH3 to HNO3, KNO3, K2Cr2O7, xylene to phthalic acid (EV), phthalic anhydride, ethylanthraquinone (EAQ), EAQ to EAHQ, EAHQ + air gives H2O2 and regenerates EAQ (loop), NH3 + H2O2 gives hydrazine, hydrazine to MMH, MMH + HNO3 to rocket fuel T3. Variants: Cu + HNO3 to N2O4 for T4.
- **Mapping:** reactor, large reactor, distillation, mixer and dehydrator-equivalents all exist. GTM 7.5.3 lacks the anthraquinone cycle and K2Cr2O7 (verify); ammonia and nitric acid exist. New: EAQ cycle, phthalic anhydride, K2Cr2O7, MMH. Fits the pack's rocket line (`hv.rocket`, `mv.fire`).
- **Correction (D1-LINES, verified on dump 6f89eb0df970):** the cycle is in the pack. GT-- runs it in `gtnn:exxonmobil_chemical_plant` (type `gtceu:chemical_plant`): `ethyl_anthra_quinone`, `ethyl_anthra_hydro_quinone` (Pd-V catalyst), `hydrogen_peroxide_air` and `_oxygen`, `hydrazine`, `methyl_hydrazine`, `methylhydrazine_nitrate_rocket_fuel`. Phthalic anhydride (naphthalene + air + V2O5, 1,920 EU/t), potassium dichromate (480), UDMH by chloramine, N2O4 and GTM's rocket fuel exist too, and a direct H2 + O2 → H2O2 recipe (240 EU/t) makes the cycle optional.
- **Adaptation:** make H2O2 from the anthraquinone loop the mandatory oxidiser source of every rocket era; later, plasma nitrogen fixation replaces the Haber step.
- **Touches:** hydrogen, nitrogen, ammonia, nitric acid, **chromium**, potassium, benzene and xylene, carbon.

### P-3 Bastnasite rare earths (about 14 steps)
- **Source:** GTNH `gtnhlanth/loader/RecipeLoader.java`, GT5-Unofficial 5.09.54.270, LGPL-3.0 code, design from the GTNH pack: **ideas only** (policy, section 7). About 30 recipes.
- **Tier:** mostly HV; the digester and dissolution tank are EV and lowerable.
- **Steps:** digester (acid), cracking with steam, fluorosilicate mixer, dissolution, sifter, EBF 1400 K, HCl bath, O2 roast (F2 byproduct), fluorination, centrifuge, HNO3 mixer, acetone reaction, centrifuge, HCl to Nd2O3 and LaCl3. Branch: fluorination, Ca EBF, Ho and a Sm/Tb mix (EV).
- **Mapping:** GTM has centrifuge, mixer, sifter, EBF, chemical reactors, thermal centrifuge and electrolyzer. New: the digester (a large-reactor recipe type) and the fluorosilicate and fluoride intermediates. The pack's `ev.cascade` (2 chains of 5: samarium, neodymium) is the existing slot.
- **Adaptation:** sulfuric roast, water leach and solvent extraction (the real industry route); futuristic, bioleaching in a vat.
- **Touches:** **neodymium, lanthanum, cerium, samarium, holmium, terbium**, fluorine, silicon. This would give rare earths at HV instead of EV.
- **Correction (D1-LINES, verified on dump 6f89eb0df970):** GT Community Additions 2.2.0 (in the pack, LGPL-3.0) already ships a bastnasite line of this lineage: muddy solution from its thermal reactor (1,920 EU/t, 800 K), conditioned and diluted mud (`conditioned_to_diluted`, 1,920), acid leach, oxygen roast (1,200 K), wet oxides, cerium dioxide, chloride and oxalate, Ce(III) oxide, nitrated rarer earths in acetone, neodymium concentrate → Nd oxide + LaCl3, fluorinated samaric concentrate. Its intermediates exist; the front end is GTCA's own machine. Native neodymium ore still gives Nd directly.

### P-4 Bayer, Solvay, Hall-Heroult and Kroll composite (12 steps with feeders)
- **Source:** GTM-native: `TitaniumRecipes.java` lines 26-168 (16 recipes), `LCRCombined.java`; StarT only patches it (`lines/modifications.js`, MIT). GTNH `BauxiteRefineChain.java` (LGPL-3.0, ideas only) has 8 steps with ore prep and 23 recipes.
- **Tier:** MV to HV; runnable at HV as written.
- **Steps:** ilmenite to rutile (EBF), TiCl4 (chem), Kroll with Mg (EBF), Mg recovery (loop); bauxite slurry, cracking, LCR aluminium, decalcification, centrifuge for Rutile, Ga, SiO2, Fe, EM separation of slag; Solvay loop (NaHCO3, soda ash, CaCl2, quicklime). Rutile closes the loop into Ti. Longest alone 8 to 9; 12 when the Solvay and chlor-alkali feeders are counted. The pack already has `lv.aluminium` (6) and `ev.kroll` (2 chains of 4).
- **Mapping:** GTM has all of it. Nothing new except the merge and the pack's own ids.
- **Adaptation:** Hall-Heroult cell as a multiblock; futuristic, FFC Cambridge electrolysis of TiO2 in a single step.
- **Touches:** **titanium, aluminium**, magnesium, gallium, neodymium, chromium, rutile, iron, sodium. Titanium in the pack currently comes from the Moon at EV; a Kroll line at HV conflicts with that gate and needs an owner decision.

### P-5 Crude oil to PVC and PTFE, from the pack's own chain (12 steps)
- **Source:** this repository. The audit links `lv.acid` (4) to `mv.plastics#polyvinyl_chloride` (4) to `hv.ptfe` (4): 12 steps. Links are as recorded in the chart data (raws and crossings), not re-verified in recipes.
- **Tier:** LV to HV. Real chemistry (EDC, VCM, chloroform, R22, TFE).
- **Also in the same family:** `hv.refinery` (4 chains of 1), `hv.aromatics` (5 chains of 1), `hv.gasoline` 3, `hv.sbr` 3, `hv.syngas` 2, `hv.rocket` 3 and 2. These split chains are the reason HV counts only 2 lines and a longest of 4 today.
- **Mapping:** nothing new; this is a merge (section 5).
- **Adaptation:** make PVC and PTFE one cracker-to-polymer line with an explicit HCl and HF loop (HF from fluorite and sulfuric acid).
- **Touches:** ethylene, propene, butadiene, benzene, chlorine, fluorine, sulfur, PE/PVC/PTFE supply.

### Shorter lines for the Steam, LV and MV targets (all 4 or more steps)

| Line | Steps | Tier | Source and licence | Touches | Use |
|---|---|---|---|---|---|
| Precious metals, Au and Ag | 5 (8-9 with the acid side) | LV-MV | TJ `GARecipeAddition.java` 1734-1821, GPL-3.0: ideas | gold, silver, copper, nickel | LV 8 target when joined to the nitric chain |
| PBI (polybenzimidazole) | 9-10 from benzene; GTNH 10, TJ 7-8, StarT 9-10 | LV-IV; retier dichlorobenzidine and diaminobenzidine to HV | GTM `PolymerRecipes.java` ~327-470 (LGPL-3.0, import); GTNH `ChemicalRecipes.java` ~2493; TJ 1626-1735 | benzene, **copper, zinc, chromium** | pack has `zpm.titan#polybenzimidazole` (5): extend downward |
| Brine and bromine | 8-9 (14 recipes) | HV, one MV step | StarT `lines/brine_line.js` 4-156, MIT: import | **bromine, iodine**, chlorine, potassium, sodium, lithium | HV, adaptation: Kubierschky column; later lithium and bromine from brine. **Correction (D1-LINES, dump 6f89eb0df970):** GTM 7.5.3 already has a brine line: iodized brine (EBF 1,128 K), iodine brine mixture, brominated brine and iodine slurry (centrifuge), bromine sulfate solution, overheated gas (cracker), wet bromine, iodine (dehydrator); nothing to import |
| Void-drill ore slurry | 5-6 with loops | LV-EV | StarT `systems/void_drill_line/*`, MIT: import | **REE, tungsten, bauxite, molybdenum, titanium, platinum group, tantalum, cobalt** | Steam to LV; changes how every basic ore is obtained; needs the pack's drill, not StarT's custom `void_excavation` type |
| Silicon, sand to wafer | 7-8 | MV-EV | GTNH `ChemicalRecipes.java`, `BlastFurnaceRecipes` (LGPL, ideas); pack `mv.silicon` 2 chains of 8 | silicon, gallium, arsenic | MV 10: extend with trichlorosilane and doping steps. **Correction (D1-LINES, dump 6f89eb0df970):** GTM 7.5.3 has no plain trichlorosilane (only the pack's `si28_trichlorosilane`); the boule melts 32 metallurgical silicon dust |
| Ore processing, full | 5-7 | LV-MV | GTNH `ProcessingOre/*.java`; StarT `ore_factory_processing.js` (a mechanism, not a chain) | all ores | Steam 6: pack `steam.ore` 4 |
| Kroll titanium alone | 4-5 | HV-EV | GTM `TitaniumRecipes.java`; GTNH `ChemicalRecipes.java` ~443 | titanium, magnesium, chlorine | merged into P-4 |
| Tungsten, hydrometallurgical | 5 | EV-HV | GTNH `BotRecipes.java` (LGPL, ideas); pack `ev.tungsten` 5 and 6 | tungsten, manganese, calcium | pack already has it |
| Polymers PTFE, PVC, epoxy, rubber, silicone | 4-6 each | LV-MV | GTNH `ChemicalRecipes.java` ~3040-4017 | PE/PVC/PTFE, silicone, sulfur | feeds P-5 |

## 3. Band 2: EV to ZPM

### E-1 Monazite rare earths (about 18 steps)
- **Source:** GTNH `gtnhlanth/loader/RecipeLoader.java` (LGPL code, ideas). About 40 recipes in this branch.
- **Tier:** EV to HV, Eu electrolysis ZPM-adjacent. Not HV-only as written (EV digester, EM separator, centrifuge).
- **Steps:** digester (HNO3), dissolution tank, sifter (Hf-Zr blend, thorianite), mixer, MCR with NH4NO3, sifter (ThP cake to Th), chem bath, sifter (hydroxide, uranium filtrate), EBF 1200 K, HNO3 nitration, mixer, sifter (CeO2), vacuum freezer, EM separator (Eu2O3), EBF + Cl2, acetone mixer, centrifuge, sifter (Sm, Gd).
- **Mapping:** GTM has centrifuge, mixer, sifter, EBF, vacuum freezer, EM separator (verify), reactors. New: digester, dissolution tank (large-reactor recipe flags), Hf, Zr, Th intermediates. Pack slots: `ev.cascade` (samarium, neodymium, 2 x 5) and `zpm.europium` (5) are extended or merged into this.
- **Adaptation:** HNO3 digestion, TBP solvent-extraction cascade, oxalate precipitation, calcination (the real industry); later, chelating-resin ion-exchange columns.
- **Touches:** **europium, samarium, gadolinium, cerium, lanthanum, neodymium, thorium, uranium, hafnium, zirconium**, titanium, phosphorus.
- **Correction (D2-LINES, verified on dump 5d57213f3b83):** GTCA 2.2.0's bastnasite chain is live in the pack at EV (its thermal reactor is kept at EV, `integration/gtca.js:45`): 17 stages from crushed bastnasite to lanthanum and neodymium, with cerium dioxide split out after an oxidative roast and two stages rebuilt for Earth without the other worlds' outputs (`moon/offworld_only.js`: the filtration loses its lunar rutile and ilmenite, the holmium reduction its samarium). Bastnasite and monazite are Nether ores (`veins_nether.json:76-83`), drilled from LV; Mars gives only merrillite. The design uses that chain, not a new monazite line (`docs/eras/lines-ev-zpm.md`, E1).

### E-2 Naquadah, enriched and naquadria ladder (15 steps in the pack's own chart)
- **Source:** pack chart: `iv.naquadah` (7) to `luv.naquadah#enriched_naquadah_ingot` (4) to `zpm.naquadria` (4). Source designs: GTM `NaquadahRecipes.java` (LGPL, import), GTNH `goodgenerator/loader/NaquadahRecipeLoader.java` (LGPL code, ideas; 10 steps, 15 with enriched and naquadria, 43 recipes), StarT `chemical_plant.js` skips (MIT).
- **Tier:** EV to ZPM; not runnable at HV (fictional chemistry).
- **Steps:** EBF naquadah earth + fluoroantimonic acid (TiF3), centrifuge + NaOH, MCR + P507, neutron activator, autoclave naquadahine, EBF with C (IV); then the enriched BF (IV 7500 K) and naquadria (ZPM 9100 K). P507: seed oil to 2-ethylhexanol to an MCR step with Na, H3PO4, ethanol.
- **Mapping:** GTM has all three materials. New: fluoroantimonic acid, P507, adamantine intermediates, neutron activator.
- **Adaptation:** treat it as the transuranic analogue of PUREX: dissolution, solvent extraction and partitioning with a real tails stream.
- **Touches:** naquadah, **gallium, antimony, titanium**, adamantium.
- **Correction (D2-LINES, verified on dump 5d57213f3b83):** the pack's naquadah chemistry is GT-- 1.3.10's: the neutron activator with fluoroantimonic acid (naquadah), the xenon, gold-fluoride and palladium-on-carbon loops (enriched naquadah and trinium), and naquadria through radon, caesium and nitryl fluorides back to the activator. It uses no P507 and no naquadahine. Staged from Venus's ore, the ladder counts 16 steps to the excited naquadah fuel (`docs/eras/lines-ev-zpm.md`, Z2).

### E-3 Thorium and uranium molten-salt fuel loop (about 12 steps)
- **Source:** GTNH `gtPlusPlus/.../RecipeLoaderLFTR.java`, `RecipeLoaderNuclear.java` (LGPL code, ideas). About 35 recipes.
- **Tier:** HV to IV (spargers, cold trap HV; fuel processing EV to IV).
- **Steps:** Li2CO3 + Ca(OH)2 to LiOH to LiF; Be to Be(OH)2 to ammonium tetrafluoroberyllate to BeF2; Zr + Cl2 to ZrCl4 to ZrF4; EBF LiF + BeF2 to Li2BeF4; fuel blend; LFTR run; sparge (He or F2); cold trap (NaF) gives UF6; reprocessing; distillation; EBF UF6 + H2 to fuel salt.
- **Mapping:** GTM 7.5.3 has no LFTR; new: reactor, sparge tower, cold trap, fluoride salts. Pack slots: `iv.uranium+fuel+plutonium+radon` (3 chains: 4, 6, 5) and `uv.thorium` (7).
- **Adaptation:** fluoride-volatility fuel cycle (real); later, pyroprocessing with an electrorefiner.
- **Touches:** **thorium, uranium, lithium (Li-7), beryllium, zirconium**, protactinium, fluorine, helium.

### E-4 PEDOT:PSS conductive polymer (10 steps, 11-12 from crude)
- **Source:** StarT `lines/polymers/pedot_pss.js` 4-150 (feeds from `polyimide.js`, `peek.js`). **MIT: import with attribution.** About 22 recipes.
- **Tier:** LuV to UHV as labelled; the chemistry could run MV to HV with retiering.
- **Steps:** benzene to maleic anhydride, dimethyl maleate, dimethyl succinate, 1,4-butanediol, thiophene (BDO + sulfur), EDOT (ordered chemistry), PEDOT, PEDOT:PSS doping, distillery paste, bath with polysorbate-20. Side branches: PSS (5: toluene, benzotrichloride, benzoyl chloride, benzoyl peroxide, PSS), polysorbate-20 (4).
- **Mapping:** GTM has the reactors, bath, distillery and the benzene, toluene, methanol chain, but no PEDOT. New: the `ordered_chemistry` machine type (custom in StarT-Core; the pack must register its own), PEDOT/PSS/EDOT/polysorbate materials, sterile cleanroom gating.
- **Adaptation:** EDOT by a Williamson route, oxidative polymerisation with iron(III) tosylate in a vapour-phase reactor, a PSS dialysis loop, film casting as the last machine.
- **Touches:** sulfur, benzene and toluene (petrochemistry), bromine; no scarce metal.

### E-5 Polyimide (8 steps, LuV to UV)
- **Source:** StarT `lines/polymers/polyimide.js` 5-112, MIT: import. Benzene, maleic anhydride, dimethyl maleate, succinate, BDO, GBL, NMP, polyamic acid, polyimide; BTDA and m-phenylenediamine branch.
- **Mapping:** shares the BDO half with E-4, so E-4 and E-5 merged make a petrochemical polymer line of 12. Adaptation: Davy-style BDO, spin-coat and imidisation oven as the last step. Touches: Pd and Ni catalysts, benzene.

### E-6 Other lines in the band (4 to 9 steps)
- Aerogel (sol-gel), 7 to 8 steps, EV to ZPM: StarT `lines/gate_lines/aerogels.js` 8-73, MIT. Touches silicon. Adaptation: a supercritical CO2 drying vessel with batch pressure cycling.
- Zirconium via titanite, 7 steps, IV to UV: StarT `lines/abydos_lines/zirconium.js` 49-103, MIT. Touches **titanium, zirconium, hafnium**. Hafnium feeds the UEV `six_n_hafnium` chain.
  - **Correction (D2-LINES, verified on dump 5d57213f3b83):** the pack already separates zirconium from hafnium on the End's red zircon: `grindless:chemical_reactor/zircon_chlorination`, the extraction cascade's `zr_hf_cut`, `zirconia_hydrolysis` and the fuel fabrication plant's `kroll_zr_sponge`. No titanite route is needed.
- Xenotime rare earths, 5 steps, EV to IV: StarT `lines/abydos_lines/rare_earth.js` 5-39, MIT. Touches **yttrium, lutetium, dysprosium, europium, samarium**.
- Cryptands, 7 to 8 steps (9-10 est. from crude), EV to IV: StarT `lines/cryptands.js`, MIT. Touches sodium, lithium, potassium, silver, palladium.
- Water grades 1-5, 5 to 7 steps, LuV to UV: GTNH `PurifiedWaterRecipes.java` (ideas); the start of line U-3.
- Combustion fuels, 4 to 6 steps each, MV to ZPM: StarT `lines/combustion_lines.js`, MIT.

## 4. Band 3: UV to UXV

Most of StarT's long late lines are fantasy chemistry with labels inflated above their real cost. They are listed because the owner may import them with attribution (MIT); each carries a realistic or more interesting adaptation.

### U-1 Draconic and End hormone line (13 steps, UHV to UIV, about 25 recipes)
- **Source:** StarT `lines/end_lines/abyssal_room.js` 4-163 and `end_lines/misc_materials.js`. MIT: import.
- **Steps:** dragon egg cutter, autoclave embryo fluid, extractor residue (UEV), LCR medium, bath (aurouric medium), LCR + precursor serum (mythril, adamantine, FeCl3), distillery, mixer, autoclave peptide chain, LCR residue, autoclave hormone fluids, injection mixer (hormone complex), mixer to pure dragon breath (UIV) or draconic enrichment serum (UEV).
- **Mapping:** GTM has autoclave, extractor, LCR, mixer, distillery, bath. New: `injection_mixer`, the abyssal containment room, the materials. The pack's late biology is `luv.biofoundry+organoid+europa` (9), `uhv.life` (2 x 6), `max.bio`.
- **Adaptation:** swap the egg for a cultured-cell bioreactor (CHO or yeast, fed-batch, chromatography) making a recombinant stabiliser protein: same length, plausible biotech.
- **Touches:** mythril and adamantine dusts, iron (FeCl3); gates UEV circuits.

### U-2 Akreyrium injection catalysts to the abyssal stabiliser (about 12 steps, LuV to UIV, about 70 recipes)
- **Source:** StarT `lines/abydos_lines/akreyrium.js` 1-400. MIT: import.
- **Steps:** cyclonic sifter, manifold centrifuge, a 9 to 10 step electron-flux branch (mono-phase flux, distillation, polariser, EM separator, mixers, canner), then stabilisation. Muon branch 7, tau branch about 6. With the final stretch the depth is 13 to 16.
- **Mapping:** new: `cyclonic_sifter`, `manifold_centrifuge`, `injection_mixer`, `polarizer`, `folding_akreyrium_stabiliser`, `abyssal_akreyriadix_stabiliser`.
- **Adaptation:** isotope and ion-beam separation: laser isotope separation, a calutron or centrifuge cascade with real stage counts and tails recycled, ending in enriched fuel-cell pellets.
- **Touches:** thallium, antimony, tungsten and platinum group only through the superalloys.

### U-3 Stargate component rods, CSG to ASG to DSG (12 steps, ZPM to UIV, about 45 recipes)
- **Source:** StarT `systems/gate_based/csg.js` 176-387, `asg.js` 287-528, `dsg.js` 382-767. MIT: import. For the stargate design see also `docs/research/gtnh-stargate.md`.
- **Steps:** circuit assembler matrix, rotor machine rod base, raw rod, heat chamber activated rod, ASG rod base, reforged rod (WS2), pressure-heat awakened rod, DSG rod base, infused rod, riftic enhancement, assembly ring block, chevron block.
- **Mapping:** new: `large_rotor_machine`, `stargate_component_assembly`, `riftic_enhancement`, `quantum_compressor`.
- **Adaptation:** a real superconducting cold-mass line: wind Nb3Sn or REBCO tape, vacuum impregnate, cure, quench-test, cryostat assembly, cool.
- **Touches:** **tungsten (WS2), rhenium**, naquadah and trinium family, netherite; high volume of foil.

### U-4 Abyss harvesting (about 12 steps with the mesh chain, UEV to UIV)
- **Source:** StarT `systems/resource_gen/abyss_harvesting.js` 6-290, `systems/draco_infusion.js` 6-316. MIT: import. About 60 templated recipes; 6 own steps plus a 6-step mesh support chain.
- **Steps:** abyssal harvester, excression states, sifter (voidic mesh), slurries, manifold centrifuge sludge, centrifuge residue, injection mixer, draco infusion to voidic metals.
- **Adaptation:** deep-sea nodule mining: lift, hydrocyclone, leach, solvent extraction, electrowinning, depth-gated, giving Mn, Ni, Co, Cu, REE and tailings with a real destination.
- **Touches:** **rhenium**, echo shards, many exotic ingots; with the adaptation, **manganese, nickel, cobalt, copper, rare earths**.

### U-5 Grade-8 purified water to phonon crystal (11 steps, LuV to UXV; most plausible)
- **Source:** GTNH `PurifiedWaterRecipes.java`, `AutoclaveRecipes.java`, `BlastFurnaceRecipes.java`. LGPL code, design CC BY-NC-SA: **ideas**. Verified.
- **Steps:** clarifier with activated-carbon mesh, ozonation, flocculation (PAC), pH adjustment, plasma heating, UV treatment, degasification, particle extraction (quark creation catalyst), catalyst realignment loop, autoclave to seed crystal, blast furnace to phonon crystal solution.
- **Mapping:** GTM has only distilled water. New: the grade train. The real unit operations make it the easiest late line to justify.
- **Adaptation:** replace "plasma heating" with reverse osmosis and electrodeionisation, add per-grade recirculation and a brine byproduct.
- **Touches:** carbon (mesh), aluminium, chlorine, phosphorus, helium, water.

### U-6 Plasma Forge ladder to Transcendent Metal and Celestial Tungsten (11 steps, ZPM to GTNH UMV)
- **Source:** GTNH `gregtech/.../MixerRecipes`, nhcm `DTPFRecipes`, `PlasmaForgeRecipes`, `BlastFurnaceRecipes`. LGPL-3.0 / GPL-3.0: **ideas**. Verified.
- **Steps:** plasma generation, four mixer catalyst levels (DTCC to DTPC to DTRC to DTEC), laser engraving to Excited DTEC; then Plasma Forge Cosmic Neutronium, Tesseract, Transcendent Metal; blast furnace Celestial Tungsten; Plasma Forge Six-Phased Copper.
- **Mapping:** GTM has plasma arc and fusion plasmas to about UHV, no Plasma Forge. New: a coil-heat and catalyst multiblock, the DT* fluids. Avaritia items must be replaced.
- **Adaptation:** a plasma-sintered refractory line; Six-Phased Copper becomes a six-stage superconducting cable alloy built by sequential vapour deposition.
- **Touches:** **tungsten**, titanium, copper, silver, tin, americium, lead, thorium.

### U-7 Riftion and faematter (own 8 plus 6-7; 15 or more with feeders, UEV to UXV, about 45 recipes)
- **Source:** StarT `lines/riftic/riftion.js` 4-168, `faematter_filaments.js`, `misc.js`. MIT: import.
- **Adaptation:** plasma-physics line: pulsed power, plasma focus, heavy-ion target, isotope harvest with explicit tail waste.
- **Touches:** flerovium, einsteinium-253 (fantasy); gates K.O.M.A.R.U.

### U-8 Also in the band
- Dimensionally shifted superfluid via the Plasma Forge: 10-11 steps (GTNH, ideas): water chain plus metastable oganesson from naquadah fuel; adaptation, a helium-3 dilution-refrigerator coolant; touches helium, tungsten, naquadah.
- Plasma Forge superconductor bases, about 10-12 (est.; GTNH, ideas); adaptation, real families (cuprate, pnictide, hydride, MgB2); touches indium, tin, palladium, samarium, europium, americium.
- Hellforge infernal concentrate, 6; nether magma, mythril, adamantine, 6-7; high circuits (UHV to UXV), 8-9 (all StarT, MIT).
- Metastable oganesson to neutron accelerators, 7-9; chromatic glass, 8; astral titanium, 8 (GTNH, ideas).

## 5. Band 4: OpV to MAX+

GTNH tops out at MAX, and StarT's top lines stop at UXV. **No source has lines above MAX**; MAX+ is pack-only design. These OpV to MAX candidates come from GTNH and are mostly estimates, so each must be traced again before it is used.

### M-1 Planck circuit, Nanochip Assembly Complex (14 or more steps, GTNH UMV to MAX; est.)
- **Source:** nhcm `ScriptNanochipRecipes` (GPL-3.0): **ideas**. About 40 recipes.
- **Steps (verified pieces):** raw manifold bud (UMV), arc furnace blossoming bud, hammer Calabi-Yau manifold, assembly matrix; 14 module types (encasement, CPU, thermal superconductor, cleansed and optical and planck boards, harmony and supermassive wire, lost-quantum rack, wire strands, organised quantum CPU, Yocto PIC cut, trio wire).
- **Mapping:** GTM circuits stop at UV/UHV plus universal. New: the top circuit tier and its modular assembler.
- **Adaptation:** a real chip-fab line: lithography, ion implantation, cryogenic bonding, one fab step per module.
- **Touches:** gold, silver, **palladium**, tungsten, rare earths, titanium.

### M-2 Quantum circuit (12-14 steps, one tier below Planck; est.)
- Same source and licence as M-1. Adaptation: superconducting qubit chip. Touches gold, silver, **niobium, indium**, helium.

### M-3 Creon, Mellion and Proto-Halkonite superdense plates (about 12 steps; 5 own steps verified)
- **Source:** GTNH `MixerRecipes`, `BlastFurnaceRecipes`, `MTEBlackHoleCompressor` (LGPL, ideas).
- **Steps:** mixer Mellion, blast Harmonic Compound (seeded loop), vacuum freezer Creon, bath Hot Proto-Halkonite, Black Hole Compressor plate; upstream DTR from the ladder (about 8).
- **Mapping:** new: a compressor with decaying stability and catalyst feed.
- **Adaptation:** a dynamic pressure vessel (diamond anvil with a magnetar-field analogue); the plate is an ultra-high-pressure phase. Touches tungsten (Tritanium base), rubidium, rare earths, carbon.

### M-4 Nano Forge nanite ladder (about 12 steps, UV to MAX; est.)
- **Source:** GTNH `NaniteChain` (LGPL, ideas). Carbon, silver, neutronium, glowstone, gold, Transcendent Metal, Six-Phased Copper, white and black dwarf, Universium, Eternity, MagMatter nanites; each level needs the previous.
- **Adaptation:** self-assembling molecular machines built in staged molecular assemblers. Touches silver, gold, carbon, neutronium, UUM.

### M-5 Optical and bioware circuits (10-12 steps, UHV to UIV; est.)
- Source nhcm `ScriptNanochipRecipes` (ideas). Adaptation: optical = silicon photonics (waveguide, laser, modulator); bioware = cultured neural tissue on a chip. Touches indium, gallium, silicon, lanthanum, phosphorus, erbium.

### M-6 Spacetime and timepiece (9-10 steps, ZPM to MAX; partly est.)
- Source nhcm `DTPFRecipes`, `CentrifugeRecipes` (ideas). The Infinity input needs Avaritia; replace with a pack alloy chain. Adaptation: exotic-matter lattice from a collider chain; the Time/Space split as a gravitational-lens separator.

### M-7 Composed chains already in the pack (OpV to MAX+)
- The audit's own links give 26 to 27 steps for `opv.wafers#L15` and `max.optics#L23` through `uhv.mercury#aluminium_reflector_film` (5), `uhv.power` (9) and `uhv.photonics` (8), and 16 for `maxplus.cond#bound_degenerate_billet` to `maxplus.cryo` to `maxplus.tara` to `maxplus.creative#horizon_computation_core`. These are the ones to turn into single named lines (section 6).

## 6. Existing pack lines that could be extended or merged

Counts are chains of 4 or more steps from `tools/quests/processing-lines/pl-data-*.mjs` as the audit reads them. Chains inside one cluster show no raw-product links to each other, so a merge means giving each branch a real dependency on the next; it is not free.

| Cluster | Chains today | Proposed merge or extension |
|---|---|---|
| `hv.refinery` (4 x 1), `hv.aromatics` (5 x 1), `hv.gasoline` 3, `hv.sbr` 3, `hv.syngas` 2, `hv.rocket` 3+2 | single steps | One crude-to-polymer line: refinery to naphtha to cracker to ethylene, benzene, butadiene to PVC, PTFE, SBR (P-5). Gives HV 12 |
| `lv.acid` 4 to `mv.plastics#polyvinyl_chloride` 4 to `hv.ptfe` 4 | 3 lines | One line of 12 (P-5) |
| `ev.platinum` | 4 chains of 4: palladium, rhodium, ruthenium, ruthenium catalyst | The platline (section 1): one line of 13 from the feeders, with the EV plant as its compressed form |
| `ev.kroll` (4 x 2), `ev.moon#titanium_plate`, `iv.naquadah` (7), `luv.naquadah` (4 x 2), `zpm.naquadria` (4) | separate | Titanium to naquadah to enriched to naquadria: 15 to 19 (E-2) |
| `ev.cascade` (5 x 2), `zpm.europium` 5 | separate | Monazite and bastnasite rare-earth line (E-1, P-3) |
| `iv.uranium+fuel+plutonium+radon` (4, 6, 5), `uv.thorium` 7 | 4 lines | Thorium and uranium molten-salt loop (E-3) |
| `luv.optics#whipple_shield_casing` 5 to `luv.wake+io#uhpic_chip` 6 | 2 | One line of 11 |
| `uv.starshot+parts+probe` | 6 chains: 4, 4, 11, 4, 4, 12 | Already holds two long chains (11 and 12): name them as lines |
| `uev.pressure` | 10 chains: 5, 7, 6, 5, 4, 4, 5, 5, 5, 4 | `six_n_hafnium` (5, hafnium chloride to sponge) + `six_n_tantalum` (4, K2TaF7) + `hftacn_coil_block` (4): 13. `divertor` and `wf_w_tile` share their first four steps (tungsten ingot, wire, coated wire, fibre preform): one trunk of 4 and two ends. `brayton_turbine_wheel` (7) takes 6N rhenium and YSZ |
| `uev.light` | 13 chains: 4, 5, 7, 9, 4, 5, 4, 5, 6, 5, 6, 4, 3 | `optical_computer` (9) as the trunk fed by `graphene_modulator` (7), `qd_source` (4), `snspd` (4) and `hollow_core_fibre` (5): 20 or more. `sdd` shares the float-zone wafer start of the optical computer. `spdc_source`, `ule_cavity`, `ktp_electroded_wafer` form a source and cavity group |
| `uhv.mercury` 5 to `uhv.power` 9 to `uhv.photonics` 8 | 3 | A line of 22; `uiv.light` and `uiv.memory` chains hang off it (27 to 28) |
| `uev.isotopes` (7, 5, 3, 5, 2), `uhv.isotopes` (4 x 3), `uiv.hydrogen` (10 chains), `uxv.wafers`, `opv.wafers` (11 chains) | many parallel short chains | One trunk per cluster with the others as branches |

## 7. Licence table

| Source | Licence (verified) | Evidence | Policy for this pack |
|---|---|---|---|
| Star-Technology pack scripts | MIT, Copyright (c) 2023 trulyno | `gh api repos/Star-Technology/Star-Technology/license`, `LICENSE` | **Import with attribution.** Credit StarT in CREDITS.md for each imported line |
| StarT-Core (custom machines, Java) | LGPL-3.0 | `gh api repos/StarT-Dev-Team/StarT-Core/license` | Not read. Re-implement machines; do not copy code |
| Technological Journey modpack repo | GPL-3.0 (verbatim GPL v3, branch `TJ-GTCE-version`) | `gh api repos/Technological-Journey/Technological-journey/license`, `LICENSE` | **Ideas only** |
| Gregicality (huneau), bundled by TJ | GitHub reports GPL-3.0; README says "No License" | `huneau/gregicality` `LICENSE`, README | **Ideas only**; treat conservatively. TJ's modified jars are not published, so TJ's numbers may differ from the upstream numbers read here |
| GTCE core | LGPL-3.0 | GregTechCE/GregTech | Already the base of GTM |
| GregTech Modern (GTM) | LGPL-3.0 | `gh api repos/GregTechCEu/GregTech-Modern/license` | Already in the pack; its PGM chain may be adapted with attribution |
| GT5-Unofficial | LGPL-3.0 | `gh api repos/GTNewHorizons/GT5-Unofficial/license`, `LICENSE.txt` | LGPL permits reuse with attribution under AGENTS.md. Its recipes are Java code, so import means rewriting them in KubeJS anyway. **This file and CREDITS.md treat GTNH as ideas only**; if the owner wants literal reuse of a GT5-Unofficial recipe set, say so per package |
| NewHorizonsCoreMod | GPL-3.0 | `gh api repos/GTNewHorizons/NewHorizonsCoreMod/license` | **Ideas only** |
| GT-New-Horizons-Modpack | CC BY-NC-SA 4.0 (API says NOASSERTION; the `LICENSE` file begins "Attribution-NonCommercial-ShareAlike 4.0 International") | repo `LICENSE` | **Ideas only**; non-commercial and share-alike |
| GTNH wiki | CC BY-SA 4.0 (site footer) | not fetched as a recipe source | Ideas only |
| GT-- (gtnn 1.3.10) | AGPL-3.0 | CREDITS.md 53-54 | Already read in game for the platinum plant; nothing copied |
| Real chemistry | not copyrightable | | Free to use; the safest basis for every adaptation above |

Risks: (1) StarT's MIT scripts call custom machine types from StarT-Core (LGPL) that GTM does not have, so each import still needs its own machine and recipe-type design; (2) the GTNH, TJ and GT-- platlines are the same lineage, so a new platline should be written from the real process and GTM's LGPL chain, not from any of them; (3) TJ's numbers are unverified against its unpublished jars.

## 8. Gaps

- **Sources are exhausted for realistic lines of 12 or more at HV.** Only the platline, hydrazine/H2O2, bastnasite and composites reach 12; most other realistic chemistry stops at 8 to 10. Longer HV lines need merging (P-4, P-5), not new sources.
- **StarT's realistic lines are short** (polyimide 8, brine 8-9, aerogel 7-8, zirconium 7); only PEDOT:PSS reaches 10. All its 12 or longer lines are fantasy and sit at UHV and above.
- **Above MAX nothing exists** in any source. MAX+ lines are pack-only.
- **Estimates:** GTNH M-1, M-2, M-4, M-5 and the superconductor bases are [est.]; counts in sections 3 to 5 marked "est." need tracing before commitment. Not traced: Eye of Harmony outputs, Space Mining and Elevator, bio and DNA, BEC throughput, Godforge costs, StarT fusion MK4 and `multiblock_recipes/*`, StarT-Core Java, GTNH cracker recipe source, the GTNH wiki.
- **GTM coverage of new intermediates** (anthraquinone cycle, K2Cr2O7, PBI recipe depth, EM separator, sifter) was checked only by general knowledge and a read of `PlatGroupMetalsRecipes.java`; verify against GTM 7.5.3 before any package.
  - **Correction (D2-LINES, verified on dump 5d57213f3b83):** GTM 7.5.3 has the whole PBI chain (chlorobenzene, nitrochlorobenzene, dichlorobenzidine over copper, diaminobenzidine with zinc, dimethylbenzene, phthalic acid over potassium dichromate, diphenyl isophthalate, PBI) and the electromagnetic separator (22 recipes). It has no thiophene, EDOT, polystyrene, acrylonitrile, uranium tetrafluoride, yellowcake, tungsten trioxide or ammonium paratungstate.
- **Decisions the owner must make before the platline and rare-earth packages:** where Os and Ir first appear if the line runs at MV to HV (today Mercury and the asteroid belt); where titanium first appears if Kroll runs at HV (today the Moon at EV); whether rare earths appear at HV (P-3) or EV; and whether GT5-Unofficial (LGPL) may be reused literally or stays ideas only.
- **Existing chart data:** the audit's link counts (section 6) rest on the chart's raws and crossings and were not re-verified in recipes.
