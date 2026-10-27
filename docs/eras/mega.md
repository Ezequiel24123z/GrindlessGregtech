# Mega multiblocks (LV to UHV, hooks for UEV and MAX+)

Design for the family the user asked for on the MEGA-D package (translated from Spanish): *"huge, giant multiblocks that can run enormous parallels or dedicated functions, like Star Technology's or Leisure's; also from LV, scaled to their use and capabilities; a parallelised Large Chemical Reactor that scales with the coil and is better in general, and another that is a massive LCR."*

Status: design only. Nothing here is registered. The packages run after UHV v0.11.0 ships and before UEV implementation (section 6).

Notation: `K` is the coil temperature in kelvin. `coilPar(K) = 2^floor(K/900)`. `(tune)` marks a figure the implementer may change. Routes, recipe types and gates are fixed.

---

## 1. Inventory: what exists today

### 1.1 Ours

| What | Evidence | Parallels |
|---|---|---|
| Parallel hatch support for our multiblocks | `startup_scripts/grindless/lib/parallel_hatch.js:35-41` (`part()`, ability `PARALLEL_HATCH`, max 1), `:51-53` (non-perfect OC), `:55-77` (`modifier(next)`: GTM's `PARALLEL_HATCH` modifier, then `parallel.andThen(next(...))`) and `:79-89` (hatches IV to UV; `machines`, `luvMachines`) | hatch only |
| Example user of the hatch | `startup_scripts/grindless/ev/platinum_plant.js:37-180` | hatch |
| Coil machines | `startup_scripts/grindless/lib/coils.js:33` (coil list, includes `gtceu:molybdenum_disilicide_coil_block`), `:45` (`predicate()` → `Predicates.heatingCoils()`), `:53` (`create(holder)` → `CoilWorkableElectricMultiblockMachine`), `:58` (`temperature(m)`) | — |
| Pattern helper | `startup_scripts/grindless/lib/patterns.js:60` (`MAX_ROWS = 16`, checked at `:218`; rows are the height of a slice, slices are unbounded) | — |
| Steps-in-one composer | `server_scripts/grindless/lib/compose.js:202` (`gather`), `:225` (`solve`); used as `global.grindless.compose` (`server_scripts/grindless/ev/platinum_plant.js:5-11`) | — |
| Energy-bound bores | `startup_scripts/grindless/lv/multis.js:259-292` (`bores(veto, cap)`: copies = hatch voltage / EU per copy; caps LV 8, MV 16, HV 32, EV Tripod 64, ore plant 6) | energy, capped |
| Coil-scaled smelter | `startup_scripts/grindless/mv/leisure_utility.js:364-366` (`min(64, 2^floor(K/900))`), `:464-466` (registration: `Coils.create`, `electric_furnace`, `.recipeModifier(crossSmelt(...), true)`); credited `CREDITS.md:88` | coil, cap 64 |
| Universal factories (4 modes) | `startup_scripts/grindless/mv/leisure_factories.js:71-101`, `:186-188` (each `recipeType` call appends a mode; mode veto) | `bores` cap 4 |
| Steam families | `steam/large_family.js` (5 machines, 64 parallels, `CREDITS.md:77`), `steam/small_family.js` (8 parallels, `CREDITS.md:78`) | 8 / 64 |
| Built-in parallels | `ev/combined_cycle_and_hot_mill.js:67` (256), `ev/sealed_dome.js:56` (64), `ev/lunar_power_and_antenna.js:257` (lit panels); `ModifierFunction` builder with `.parallels(n)` in `iv/fluorspar_kiln.js:172-175`, `eutMultiplier` in `ev/cryogenic_plant.js:179` | fixed |

There is no mega family and no LCR variant of ours.

### 1.2 GTM 7.5.3 (tag `v7.5.3-1.20.1`, `src/main/java/com/gregtechceu/gtceu/`)

| Machine | Source | Modifiers | Structure |
|---|---|---|---|
| Large chemical reactor | `common/data/machines/GTMultiMachines.java:195-239` | `DEFAULT_ENVIRONMENT_REQUIREMENT, OC_PERFECT_SUBTICK, BATCH_MODE`; **no parallel hatch**; every `chemical_reactor` recipe is also added to `large_chemical_reactor` | 3x3x3, PTFE casings, 1 coil |
| Multi smelter | `GTMultiMachines.java:336` | `multiSmelterParallel` (`GTRecipeModifiers.java:243-269`, 32 × coil level) | 3x3x3 |
| Mega blast furnace (GCYM) | `common/data/machines/GCYMMachines.java:816-859` | `PARALLEL_HATCH, ebfOverclock, BATCH_MODE` | 13x17x13 |
| Mega vacuum freezer (GCYM) | `GCYMMachines.java:911-938` | `PARALLEL_HATCH, OC_NON_PERFECT_SUBTICK, BATCH_MODE` | 11x7x7 |
| Parallel hatch | `common/machine/multiblock/part/ParallelHatchPartMachine.java:37` | `maxParallel = 4^(tier − EV)`: IV 4, LuV 16, ZPM 64, UV 256 (UHV would be 1024) | part |

GCYM's large machines arrive at IV in this pack (`docs/eras/iv.md:177`; the large mixer is LuV). The mega EBF and mega vacuum freezer are ZPM (`docs/eras/iv.md:205`). The LCR is HV (`docs/eras/hv.md:12`). GTM registers no UHV parallel hatch with `highTierContent` off (`docs/eras/uhv.md:770`).

### 1.3 Installed addons

| Addon | Machine | Evidence | Verdict |
|---|---|---|---|
| GTCA | `gtca:mega_lcr` | re-gated to IV at `server_scripts/grindless/integration/gtca.js:49, 80-81`. Source: `GTCAMachines.java` ~447-480 (mordgren/GTCA `02cbd6d`): plain `WorkableElectricMultiblockMachine`, `BATCH_MODE, OC_NON_PERFECT_SUBTICK`, 5x9x5 PTFE | **no parallels, no coil, and a worse overclock than GTM's own LCR** (non-perfect against perfect). It is a bigger LCR, not a mega one. |
| GTCA | `gtca:mega_oil_cracking_unit` | `gtca.js:80-81`; `GTCAMachines.java` ~371-440: coil machine, `BATCH_MODE, OC_NON_PERFECT_SUBTICK, crackerOverclock`, ~13x7x9 | a cracker with batch; kept as is |
| GT-- | Maceration Stack | re-gated to IV at `integration/gtnn.js:28-31`; `FactoryMacerationMachine.kt` (Arborsm/GT-- `c81ba3e`): `maxParallel = 2 × voltage tier`, speed +60 | modest; kept |

Conclusion: nothing installed scales an LCR with the coil, and nothing is a mega machine before ZPM except the IV GTCA pair. The user's request is not covered.

---

## 2. Research: how the reference packs compute mega parallels

Question-driven: *what formula sets the parallels, how is energy and overclock charged, how big is the structure.* Sources read at the commits below.

### 2.1 GregTech Leisure (GTLCore; ideas only, `DECISIONS.md:102`)

Repo `github.com/EasterFG/GTLCore` at `561eed4`, file `src/main/java/org/gtlcore/gtlcore/common/data/GTLRecipeModifiers.java`:

- **`COIL_PARALLEL`:** parallels `2^(K/900)` through `accurateParallel` (energy-bound), then non-perfect OC. This is the rule already credited for our advanced multi smelter (`CREDITS.md:88`).
- **`chemicalPlantOverclock`** (GTL's chemical plant, its LCR successor): EU × (1 − 0.05·coilTier) × 0.8 and duration × (1 − 0.05·coilTier) × 0.6; parallels from the parallel hatch (`hatchParallel`); perfect subtick OC.
- **`processingPlantOverclock`:** EU × 0.9, duration × 0.6, parallels `4·tier − 1`, non-perfect subtick.
- **`GCYM_REDUCTION`:** EU × 0.8, duration × 0.6.
- No mega laser class was found; the chemical plant's attachment is in `MultiBlockMachineA.java` (too large to search; not needed).

What we take: the coil exponent (capped or energy-bound) and the idea that a chemical successor keeps perfect OC and gives a coil-scaled discount. What we leave: the stacked EU × 0.8 reductions (they go below GTM's own figures) and the million-scale parallels (`docs/research/leisure.md:293`), except where section 5 bounds them by energy.

### 2.2 Star Technology (MIT)

Repo `github.com/StarT-Dev-Team/Star-Technology` at `b88b5ba`, and StarT-Core `d3999fd`:

- **Chemical plant:** `kubejs/startup_scripts/machines/multiblocks/very_late_game_multis/abydos_multis/chemical_plant.js`. A coil multiblock with `[PARALLEL_HATCH, CHEMICAL_REACTOR_OVERCLOCK, BATCH_MODE]`, recipe type `chemical_skip`, 5x5 PTFE structure.
- **Super EBF:** `.../intermediate_multiblocks/super_ebf.js`, `[EBF_OVERCLOCK, THROUGHPUT_BOOSTING, BATCH_MODE]`.
- StarT-Core `src/main/java/com/startechnology/start_core/recipe/StarTRecipeModifiers.java`:
  - `ABSOLUTE_PARALLEL` is `hatchParallel`;
  - `THROUGHPUT_BOOSTING`: ×4 throughput, duration × 1.6, EU × 0.95;
  - `HELL_FORGE_OC`: `2^floor(max(0, (T − Trecipe)/450))`;
  - `BULKING`: ×16 throughput, duration × 13.
- StarT targets a newer GTM; `CHEMICAL_REACTOR_OVERCLOCK` does not exist in 7.5.3. We do not depend on it.
- **K.O.M.A.R.U.:** a frame of modules whose upkeep grows with size (`docs/journey.md:178`). The model for our UV factory.
- **Controller built from the machines it replaces:** already credited (`CREDITS.md:44`). Every mega controller here follows it.

### 2.3 GTCA and GT-- (section 1.3)

GTCA (`mordgren/GTCA` `02cbd6d`, LGPL) shows the conservative end: batch plus a bigger structure, no parallels. GT-- (`Arborsm/GT--` `c81ba3e`, AGPL, read only): `GTNNRecipeModifiers.kt` `GTPP_MODIFIER`, duration × 100/(100 + speed), parallels `min(max, maxV / EUt)`. Same energy-bound idea as our `bores`.

### 2.4 What the research settles

1. Every reference bounds the parallels by energy (`accurateParallel`, `hatchParallel`, `maxV / EUt`). The "enormous" numbers are only reachable with enormous power. That is the honest form of the user's request.
2. Coil scaling is always an exponent of K/900 (GTL) or K/450 above the recipe (StarT). We use K/900; it is already in the pack.
3. Chemistry successors keep perfect OC (GTM's LCR, GTL, StarT). Ours must too, or they are worse than the LCR they replace, which is GTCA's mistake.

---

## 3. Feasibility in KubeJS on GTM 7.5.3

| Need | API (GTM 7.5.3) | Status |
|---|---|---|
| Several recipe types on one controller | `MachineBuilder.recipeType` appends (`api/registry/registrate/MachineBuilder.java:319`), `recipeTypes` (`:333`) | proven (`mv/leisure_factories.js:186-188`) |
| Modifier chains | `recipeModifier(mod)` (`:579`), `recipeModifier(mod, alwaysTry)` (`:584`), `recipeModifiers(...)` (`:589`), `alwaysTryModifyRecipe` (`:269`) | proven (`mv/leisure_utility.js:464-466`) |
| Compose two GTM modifiers in JS | `GTRecipeModifiers.PARALLEL_HATCH.getModifier(machine, recipe)` then `.andThen(...)`, `ModifierFunction.NULL` on fail | proven (`lib/parallel_hatch.js:55-77`) |
| Coil temperature | `CoilWorkableElectricMultiblockMachine.getCoilType()` (coil from match context `"CoilType"`, `CoilWorkableElectricMultiblockMachine.java:28`); our `Coils.temperature(m)` (`lib/coils.js:58`) | proven |
| Energy-bound parallels | `ParallelLogic.getParallelAmount(machine, recipe, max)` (`api/recipe/modifier/ParallelLogic.java:34`; checks inputs, output room and EU) and `getParallelAmountWithoutEU` (`:158`) | public static; used by GTM's `hatchParallel` (`GTRecipeModifiers.java:91-104`) |
| Apply n parallels | `ModifierFunction.builder()...parallels(n).eutMultiplier(n)` with content × n | proven (`iv/fluorspar_kiln.js:172-175`) |
| Overclock | `GTRecipeModifiers.OC_PERFECT_SUBTICK` / `OC_NON_PERFECT_SUBTICK` (`GTRecipeModifiers.java:49-52`). Perfect: duration × 0.25 per ×4 voltage (energy-neutral); non-perfect: × 0.5 (energy per operation doubles) | GTM |
| Batch mode | `GTRecipeModifiers.BATCH_MODE` (`:79`, `batchMode` `:107-124`): needs `isBatchEnabled()` (`WorkableElectricMultiblockMachine.java:54, 90`) and a duration under `batchDuration`; multiplies inputs, outputs and duration, EU/t unchanged | **unproven on a KubeJS coil machine** (S-M1) |
| Coil EU discount precedent | `ebfOverclock` (`GTRecipeModifiers.java:170-193`): × 0.95 per 900 K above the recipe | GTM precedent |
| Parallel hatch above UV | `ParallelHatchPartMachine.java:37`: `4^(tier − EV)`, so a UHV hatch is 1024 by GTM's own formula; GTM does not register it with `highTierContent` off | **unproven from KubeJS** (S-M3) |
| Structures larger than 16 tall | `lib/patterns.js:60` caps rows per slice (height) at 16; slices (depth) are unbounded | **design rule: every mega is ≤16 tall and grows in width and depth.** No lib change. |
| Detect installed modules | read which module blocks the formed structure holds (the match context or a scan of the pattern's cells on `onStructureFormed`) | **unproven** (S-M2) |

### 3.1 Spikes (disposable, bench overlay only, before MEGA-0)

| Spike | One named uncertainty | If it fails | Changes |
|---|---|---|---|
| **S-M1** | A KubeJS `Coils.create` machine with the chain *coil parallel (`ParallelLogic.getParallelAmount`) → `OC_PERFECT_SUBTICK` → `BATCH_MODE`* runs a `large_chemical_reactor` recipe with the expected parallels, perfect OC and, with the batch toggle on in its screen, a batched duration | batch is dropped from the family (parallels alone); the chain order is the escalation evidence | MEGA-0, all |
| **S-M2** | A formed KubeJS multiblock can tell which of several module casing blocks fill its module sockets, and a recipe modifier can veto a recipe type whose module is absent | the UV factory is a fixed structure with all modes (no modules) and a higher controller cost | MEGA-8 |
| **S-M3** | A UHV `ParallelHatchPartMachine` registered from KubeJS (tier 9) reports 1024, forms in a GTM mega EBF and in one of ours through `lib/parallel_hatch.js` | the UHV machine gets a built-in parallel instead and the hatch stays at UV 256 | MEGA-0b, MEGA-9 |

The results go in the PR body of the spike package (no new doc).

---

## 4. The design

### 4.1 Family rules

1. **Energy-bound.** Every parallel goes through `ParallelLogic.getParallelAmount`: each copy pays the recipe's full EU/t, and the hatches cap the total. A machine's formula is a ceiling, never a promise.
2. **No energy from nothing.** No discount below GTM's own precedents. The only discount in the family is the coil discount on the chemical machines, at GTM's EBF rate (× 0.95 per coil step, floor × 0.80). No machine generates power; `lib/generators.js` is untouched.
3. **Overclock.** Non-perfect subtick (the GCYM mega precedent), except chemistry (perfect subtick, GTM's LCR rule) and the UHV fabricator (section 4.10). Parallels are applied first, then OC on the voltage left over (GTM's order).
4. **Batch mode** on every mega if S-M1 passes.
5. **Growth by era.** Each era's mega is bigger in footprint, parallel ceiling and number of steps it folds. Height ≤16 (`lib/patterns.js:60`).
6. **Cost.** The controller is built from N of the machines it replaces (`CREDITS.md:44`) plus the era's circuits and a casing in the era's material. The structure needs the era's casing in bulk.
7. **No new process recipes.** A mega runs GTM's or our live recipe types. "Steps in one" uses `global.grindless.compose` (`server_scripts/grindless/lib/compose.js:202-225`): the composed recipe is the line's sum, so ratios and byproducts stay honest by construction.
8. **Quotas.** Megas are parallel or composed versions: quality of life, counted apart from rule 7's era quotas (`docs/research/complexity.md:23`).
9. **Ids.** `gtceu:<name>` for machines, `grindless:<name>` for casings and items. Ids are final once registered.

### 4.2 Overview

| Era | Machine (`gtceu:`) | Runs | Parallel ceiling | OC | Size (W×H×D) | Gains |
|---|---|---|---|---|---|---|
| LV | `wire_works` | `wiremill`, `bender` | 8 (energy) | non-perfect | 5×4×5 | throughput on wire and foil, the LV circuit bottleneck |
| MV | `polymer_works` | composed: ethylene → polyethylene → sheet; rubber → sheet | 16 (energy) | non-perfect | 5×5×7 | 3 steps in one |
| HV | **`coil_chemical_plant`** (a) | `large_chemical_reactor` | `min(coilPar(K), 64)` | **perfect** | 5×6×7 | parallels from coil, coil discount, batch |
| EV | `ore_refinery` | composed ore lines (macerate → wash → thermal centrifuge → macerate) | 64 (energy) | non-perfect | 7×7×9 | 4 steps in one, successor of the MV ore plant |
| IV | `smelting_complex` | composed: EBF hot ingot → vacuum freezer | `min(coilPar(K), 64)` | EBF rule | 9×9×11 | 2 steps in one, no hot-ingot logistics |
| LuV | **`mega_chemical_complex`** (b) | `large_chemical_reactor` + composed chemistry lines | `coilPar(K) × hatch` | **perfect** | 15×15×15 | the massive LCR |
| ZPM | `assembly_hall` | `assembler`, `circuit_assembler` | `64 × hatch` | non-perfect | 11×9×15 | the bulk assembler of the late game |
| UV | `mega_factory` | modules: each adds GCYM recipe types | `256 × hatch` | non-perfect | 15×12×21+ | K.O.M.A.R.U.-style modular factory |
| UHV | `quantum_fabricator` | `assembler`, `circuit_assembler`, `forming_press`, `laser_engraver`, `cutter` | `1024 × hatch` | **perfect** | 17×13×17 | perfect OC outside chemistry |

`coilPar(K)`: Cupronickel 1800 K → 4, Kanthal 2700 → 8, Nichrome 3600 → 16, RTM 4500 → 32, HSS-G 5400 → 64, Naquadah 7200 → 256, Trinium 9001 → 1024, Tritanium 10800 → 4096 (`common/block/CoilBlock.java:59-67`).

Parallel hatch: IV 4, LuV 16, ZPM 64, UV 256, UHV 1024 if S-M3 passes (`ParallelHatchPartMachine.java:37`).

### 4.3 LV: Wire Works (`gtceu:wire_works`)

- **Runs:** `wiremill`, `bender` (two modes, player-selected).
- **Structure:** 5×4×5, steel solid casings (`gtceu:solid_machine_casing`), steel frames, 1 maintenance, ≤2 energy hatches, buses.
- **Parallels:** energy-bound, ceiling 8 (`bores` rule, `lv/multis.js:259-292`).
- **OC:** non-perfect subtick. **Batch:** yes.
- **Controller:** 4 LV wiremills + 4 LV benders + 4 LV circuits + steel plates.
- **Gains:** 8 copies at LV power. With LV hatches (2 × 32 EU/t) only cheap recipes reach 8; the ceiling grows with the hatches the player can feed, not with the machine.
- **Gating:** no parallel hatch (it starts at IV); the cost is 8 LV machines; it competes with MV's universal processing factory (cap 4 but 10+ modes) by being narrow.

### 4.4 MV: Polymer Works (`gtceu:polymer_works`)

- **Runs:** composed recipes (`compose`) of live recipes: ethanol + sulfuric acid → ethylene; ethylene + oxygen → polyethylene; polyethylene → sheet (fluid solidifier); and raw rubber + sulfur → rubber → sheet. One composed recipe per line, the line's own sum.
- **Structure:** 5×5×7, steel solid casings, aluminium frames, tempered glass, 1 coil row (Cupronickel minimum).
- **Parallels:** energy-bound, ceiling 16.
- **Controller:** 2 MV chemical reactors + 2 MV fluid solidifiers + 2 MV mixers + 4 MV circuits.
- **Gains:** three steps and two intermediates in one, the first time a player sees a line fold.
- **Gating:** each composed recipe needs the line already unlocked (it reads the live recipes); MV energy keeps the throughput modest.

### 4.5 HV: Coil Chemical Plant (`gtceu:coil_chemical_plant`): the coil-scaled parallel LCR (a)

The user's "parallelised LCR that scales with the coil and is better in general". Better than GTM's LCR (`GTMultiMachines.java:195-239`) in exactly these ways, and worse in none:

| | GTM LCR | GTCA mega LCR | Coil Chemical Plant |
|---|---|---|---|
| Recipe types | `large_chemical_reactor` (includes every `chemical_reactor` recipe) | same | same |
| Parallels | 1 | 1 | `min(coilPar(K), 64)`, energy-bound: Cupronickel 4, Kanthal 8, Nichrome 16, RTM 32, HSS-G 64 |
| OC | perfect subtick | non-perfect subtick | **perfect subtick** |
| Energy per operation | 100% | 100%, doubles per OC | **× 0.95 per coil step above Cupronickel, floor × 0.80** (Kanthal 0.95, Nichrome 0.90, RTM 0.86, HSS-G 0.81) *(tune)*; GTM's EBF coil discount rate |
| Batch | yes | yes | yes |
| Parallel hatch | no | no | no (the LuV complex takes it) |
| Hatches | 3×3×3 slots | more | 4 input hatches, 4 output hatches, 2 input buses, 2 output buses |

- **Structure:** 5×6×7 (W×H×D): PTFE casings (`gtceu:inert_machine_casing`), PTFE pipe casings in the core, 2 full coil rings (16 coils), tempered glass windows.
- **Chain:** `coilParallel(cap 64)` → coil discount (`eutMultiplier`) → `OC_PERFECT_SUBTICK` → `BATCH_MODE` (S-M1).
- **Controller:** 8 HV large chemical reactors' worth: 2 `gtceu:large_chemical_reactor` controllers + 4 HV chemical reactors + 4 HV circuits + PTFE plates + 4 Kanthal coils.
- **Gating:** at HV only Cupronickel and Kanthal are practical (4 and 8 parallels); 16+ needs Nichrome (EV) and 64 needs HSS-G. The machine grows with the player's coils, so HV gets a modest version without a separate machine.
- **GTCA's `gtca:mega_lcr`:** it becomes strictly worse than this. Open question for the user: keep it (no harm, IV) or hide it in EMI with a 1:1 conversion to the plant (the saves rule; never removed).

### 4.6 EV: Ore Refinery (`gtceu:ore_refinery`)

- **Runs:** composed ore lines per crushed ore: macerate → wash → thermal centrifuge → macerate, with byproducts summed to the outputs (compose keeps them). One composed recipe per ore, generated from live recipes at server load.
- **Structure:** 7×7×9, stable titanium casings, steel gearbox casings, 1 muffler.
- **Parallels:** energy-bound, ceiling 64. Successor of the MV ore plant (cap 6, `lv/multis.js` `bores`).
- **Controller:** 16 machines: 4 EV macerators, 4 ore washers, 4 thermal centrifuges, 4 sifters, + 4 EV circuits.
- **Gains:** four steps in one; the ore line stops being a logistics puzzle at EV, when ore volume rises with the Moon and Mars.
- **Risk:** the number of composed recipes (one per ore); MEGA-4 caps the set at ores with a live full chain.

### 4.7 IV: Smelting Complex (`gtceu:smelting_complex`)

- **Runs:** composed EBF → vacuum freezer for every EBF recipe that outputs a hot ingot: one recipe from dust to cooled ingot.
- **Structure:** 9×9×11: a coil chamber (2 rings, heatproof invar casings) and a cold chamber (frostproof aluminium casings) joined by a tungstensteel bridge.
- **Parallels:** `min(coilPar(K), 64)`, no parallel hatch. EBF rule for temperature and OC (`ebfOverclock`, `GTRecipeModifiers.java:170-193`).
- **Controller:** 4 EBF controllers + 4 vacuum freezer controllers + 4 IV circuits.
- **Gains:** two steps in one; no hot-ingot shuttling. It does not overtake the ZPM mega EBF in raw throughput (that takes the parallel hatch to 256).

### 4.8 LuV: Mega Chemical Complex (`gtceu:mega_chemical_complex`): the massive LCR (b)

- **Runs:** two modes: `large_chemical_reactor` (every LCR and chemical reactor recipe), and composed chemistry lines (our own multi-step lines up to LuV that end in a product the player bulk-consumes, chosen in MEGA-6 from the live recipes; e.g. PTFE from fluorspar/HF/chloroform, epoxy, para-aramid). The line list is MEGA-6's table, *(tune)*.
- **Structure:** 15×15×15, PTFE casings, PTFE pipe casings, 4 coil rings (≈ 112 coils), a central reaction column, HSS-S frames, laminated glass.
- **Parallels:** `coilPar(K) × hatch`, energy-bound: HSS-G 64 × LuV 16 = 1024 at LuV; Naquadah 256 × ZPM 64 = 16384; Trinium 1024 × UV 256 = 262144; Tritanium 4096 × UHV 1024 (if S-M3) ≈ 4.2 M. The real figure is set by the energy hatches and output room.
- **OC:** perfect subtick. Coil discount as (a), floor × 0.80. Batch.
- **Controller:** 4 coil chemical plants + 16 LuV chemical reactors + 4 LuV circuits + PTFE frames.
- **Gains:** the massive LCR: thousands of parallels with the power to feed them, and whole lines in one recipe. This is the one place the family reaches GTL scale, honestly: every copy pays its EU.

### 4.9 ZPM: Assembly Hall (`gtceu:assembly_hall`)

- **Runs:** `assembler`, `circuit_assembler` (the assembly line is left out: its research data condition stays where it is).
- **Structure:** 11×9×15, assembly line casings, ZPM robot arms and conveyors as structure blocks *(tune)*, cleanroom filter casings inside (it is its own cleanroom, `DEFAULT_ENVIRONMENT_REQUIREMENT` met by the structure if feasible, else a cleanroom requirement stays).
- **Parallels:** `64 × hatch` (64 × ZPM 64 = 4096), energy-bound. Non-perfect OC, batch.
- **Controller:** 16 ZPM assemblers + 16 circuit assemblers + 4 ZPM circuits.

### 4.10 UV: Mega Factory (`gtceu:mega_factory`)

- **Model:** Star Technology's K.O.M.A.R.U. (`docs/journey.md:178`): a frame with module sockets.
- **Runs:** each installed module unlocks recipe types: separation module (centrifuge, electrolyzer, sifter), forming module (bender, extruder, forming press, wiremill), cutting module (cutter, lathe, laser engraver), mixing module (mixer, chemical bath, autoclave), heat module (arc furnace, alloy smelter). A recipe type whose module is absent is vetoed (S-M2).
- **Structure:** 15 wide × 12 tall, 21 deep for 4 sockets *(tune)*; more sockets cost depth (slices are unbounded).
- **Parallels:** `256 × hatch` (UV 256 → 65536), energy-bound. **Upkeep:** each installed module adds a coolant input per recipe (PCB coolant or liquid helium, *(tune)*), so a bigger factory costs logistics, not EU.
- **Controller:** 64 machines across the modules' types + 4 UV circuits; each module block costs 8 of its machines.

### 4.11 UHV: Quantum Fabricator (`gtceu:quantum_fabricator`) and the UHV parallel hatch

- **UHV parallel hatch** (`gtceu:uhv_parallel_hatch` or GTM's own id if S-M3 reuses it): 1024 by GTM's formula. Usable by every machine through `lib/parallel_hatch.js` and by GTM's megas.
- **Runs:** `assembler`, `circuit_assembler`, `forming_press`, `laser_engraver`, `cutter`.
- **Structure:** 17×13×17, our UHV casing (or `uhv.md`'s F1 casing), a field generator ring.
- **Parallels:** `1024 × hatch`, energy-bound. **Perfect subtick OC** (the gain; energy-neutral, so no EU from nothing).
- **Controller:** 16 UHV assemblers' worth, the assembly hall, 4 UHV circuits.

### 4.12 Hooks: UEV and MAX+

- **UEV:** a stellar forge (EBF successor with plasma, StarT's `HELL_FORGE_OC` idea, `2^floor((T − Trecipe)/450)` parallels, credited); a UEV parallel hatch (4096 by GTM's formula, the S-M3 mechanism). Designed with UEV, not here.
- **MAX+ postgame (user-directed during MEGA-D; see section 7.1):** after the MAX ending, a postgame with intergalactic travel, fantastic materials, processes and lines, and **creative items as a trial by fire in GTNH style**: each creative item asks for absurdly massive quantities of every component, like GTNH's Stargate. The absolute final goal is the **Hyper Stargate**, built from the creative items and far more complex and demanding than GTNH's Stargate. To make that crafting possible the pack needs infrastructure: this mega family at its top tiers, further mega machines, and AE2-specific items and additions (e.g. bigger crafting CPUs and pattern providers, bulk storage). This doc only reserves the direction; the postgame needs its own era design.

---

## 5. Principles

- **Rule 2 (complexity, not quantity):** the megas add no quantity walls. They add steps folded, structures to build and controllers made of the machines they replace. The postgame's massive quantities are an explicit user override for MAX+ only (section 7).
- **Rule 3 (byproducts):** composed recipes are the line's sum (`compose.js`), so every byproduct still leaves the machine.
- **Rule 4:** each era gains one mega with a real gain (section 4.2), on top of the era's own multiblocks.
- **Rule 6 (GTM wins):** the chemical machines keep GTM's LCR rules (perfect OC, batch, recipe set); the coil discount uses GTM's EBF rate; the hatch uses GTM's formula.
- **Rule 7:** the user's request overrides "Steam to HV only get small additions" for this family (proposed DECISIONS line). Megas are not counted in era quotas (`docs/research/complexity.md:23`).
- **Rule 8 (power generous, never free):** every copy pays full EU/t; the only discount is GTM's coil rate with a floor; perfect OC is energy-neutral; nothing generates.
- **`docs/research/leisure.md:293` (parallels capped at 64):** kept for LV to IV (ceilings 8, 16, 64, 64, 64). From LuV the ceiling is energy-bound only (proposed DECISIONS line): the user asked for enormous parallels and energy makes them honest.
- **Saves:** no id is removed or renamed; `gtca:mega_lcr`, if hidden, keeps a 1:1 conversion.

### 5.1 Keeping LV to HV from being trivialised

1. Ceilings 8 (LV), 16 (MV), 64 (HV, only with HSS-G coils, i.e. LuV).
2. Energy-bound: LV and MV hatches feed few copies of anything but cheap recipes.
3. No parallel hatch before IV (GTM's own first tier).
4. Controllers cost 8 to 12 of the era's machines plus circuits; structures need the era's casing in bulk.
5. Unlock after the era's core line: each controller recipe sits behind the machine it replaces and, for MV and up, the line it composes.
6. Quests: one per machine, small reward, never a gate (rule 5).

---

## 6. Packages

### 6.1 Common to every package

UHV's *Common to every package* (`docs/eras/uhv.md:1017-1033`) applies with these changes:

- **Allowed, always:** `pack/kubejs/startup_scripts/grindless/<era>/mega_<name>.js`, `pack/kubejs/server_scripts/grindless/<era>/mega_<name>.js`, `pack/kubejs/client_scripts/grindless/<era>_mega_<name>_lang.js`, new tables `pack/kubejs/data/grindless/tables/mega_<name>*.json`, `tools/assets/Build-Mega<Name>Textures.ps1` and its outputs, `tools/analysis/test/mega-<name>.test.mjs`, `tools/test/overlay/kubejs/server_scripts/gg_test_mega_<name>.js` and the package's row in `tools/test/zones.json`.
- **Prohibited, always:** `pack/index.toml`, `pack/pack.toml`, `hidden_until.json`, `pack/kubejs/*/grindless/lib/**` (except MEGA-0), `AGENTS.md`, `docs/STATUS.md`, `DECISIONS.md`, `CREDITS.md`, every `.snbt`, and any older file the contract does not list.
- **Prohibited, UHV-owned until v0.11.0 ships** (`docs/eras/uhv.md:1241-1305`): B3 (`uhv/swarm*`, `server_scripts/grindless/uv/starshot.js`, `server_scripts/grindless/ev/cryogenic_plant.js`), B5 (`uhv/proxima_ground*`, `server_scripts/grindless/ev/platinum_plant.js`, `ev/extraction_cascade.js`, `ev/regolith_cell.js`, `tables/heavy_water_plant.json`, `zpm/titan_probes.js`), B6 (`uhv/organoids*`, `luv/orbital_biology.js`), B7 (`uhv/gate*`). Reading them is allowed.
- **Invariants, always:** family rules 1-9 (section 4.1); no new process recipe outside `compose`; no generator; no id removed or renamed; every controller recipe uses N of the machines it replaces.
- **Tests:** T0 `powershell -NoProfile -ExecutionPolicy Bypass -File tools\Check-Fast.ps1`. T1 only as named. One bench JVM.
- **Repairs:** at most 2, then escalate (triage output, suspected `path:line`, attempts). Implementer (Sonnet).
- **Proof reuse:** once MEGA-0's T1 passes, a mega that uses `lib/mega.js` unchanged needs only the recipe lookup check and its own parallel figure.

### 6.2 MEGA-S. Spikes

- **Objective:** answer S-M1, S-M2 and S-M3 (section 3.1), pass or fail with run ids.
- **Allowed:** bench overlay files `gg_test_mega_spike*.js` and the S row of `tools/test/zones.json`. Nothing in `pack/`.
- **Depends on:** UHV v0.11.0 shipped.
- **Acceptance:** three answers in the PR body; a fail rewrites the named packages' contracts before they open.
- **Tests:** the three spikes, one after another. **Commits:** 1. **Serial:** alone.

### 6.3 MEGA-0. Shared library (serial; integrator-owned files)

- **Objective:** `startup_scripts/grindless/lib/mega.js`: `coilParallel(capOrNull)` (`2^floor(K/900)`, `ParallelLogic.getParallelAmount`), `coilDiscount(step, floor)`, `withHatch(next)` (reuses `lib/parallel_hatch.js` `modifier`), `chain(...)` in S-M1's proven order, and `modules(machine)` if S-M2 passed.
- **Allowed:** `lib/mega.js` (new), `tools/analysis/test/mega-lib.test.mjs`, overlay `gg_test_mega_lib.js`, its zones row. **MEGA-0b** (only if S-M3 passed): `lib/parallel_hatch.js` registers the UHV hatch and adds it to the list at `:79`.
- **References:** `lib/parallel_hatch.js:55-77`, `mv/leisure_utility.js:364-366, 464-466`, `GTRecipeModifiers.java:91-124`, `ParallelLogic.java:34`.
- **Depends on:** MEGA-S.
- **Invariants:** existing users of `parallel_hatch.js` unchanged (same exports, same figures).
- **Acceptance:** unit tests for the formulas; the T1 proves a throwaway machine with the chain.
- **Tests:** T0; T1 `mega-lib` (the chain on a coil machine, parallels and EU match the formula). **Commits:** 2. **Serial:** alone; everything below depends on it.

### 6.4 Machine packages

Each: objective = section 4.x; acceptance = the controller forms in its `patterns.js` structure, its controller recipe takes N replaced machines, the recipe lookup finds each type, the parallel figure matches the formula at two coil or hatch tiers, names in `en_us` and `es_es`, one quest row proposed in the handoff; tests = T0 + `mega-<name>.test.mjs`; T1 only where named; commits 2 (machine and recipes; textures and lang).

| Package | Machine | References | Extra allowed | Depends on | T1 |
|---|---|---|---|---|---|
| MEGA-1 | LV `wire_works` | `lv/multis.js:259-292`, `mv/leisure_factories.js:186-188` | — | MEGA-0 | none (proof reuse) |
| MEGA-2 | MV `polymer_works` | `server_scripts/grindless/lib/compose.js:202-225`, `ev/platinum_plant.js:5-11` (read only) | — | MEGA-0 | composed recipe matches the line's sum |
| MEGA-3 | HV `coil_chemical_plant` (a) | `GTMultiMachines.java:195-239`, `lib/coils.js:45-58` | `server_scripts/grindless/integration/gtca.js` (only if the user chooses to hide `gtca:mega_lcr`: EMI hide + 1:1 conversion) | MEGA-0 | perfect OC + coil discount + batch on one LCR recipe |
| MEGA-4 | EV `ore_refinery` | `compose.js`, `lv/multis.js` ore plant | — | MEGA-0, MEGA-2 (compose proof) | none beyond MEGA-2's |
| MEGA-5 | IV `smelting_complex` | `GTRecipeModifiers.java:170-193`, `GCYMMachines.java:816-859` | — | MEGA-0, MEGA-2 | EBF temperature rule inside a composed recipe |
| MEGA-6 | LuV `mega_chemical_complex` (b) | MEGA-3's file, `lib/parallel_hatch.js:55-77` | — | MEGA-3 | coil × hatch at LuV and ZPM figures |
| MEGA-7 | ZPM `assembly_hall` | `lib/parallel_hatch.js` | — | MEGA-0 | cleanroom requirement met (or kept) |
| MEGA-8 | UV `mega_factory` | S-M2 result, `docs/journey.md:178` | — | MEGA-0 (+ S-M2) | module veto |
| MEGA-9 | UHV `quantum_fabricator` | S-M3 result, `ParallelHatchPartMachine.java:37` | — | MEGA-0b, MEGA-7 | UHV hatch 1024 in the fabricator |

### 6.5 MEGA-I. Integrator step (once, after the machines)

`hidden_until.json` substages for the new ids, quest rows in the era chapters, `docs/STATUS.md`, `DECISIONS.md` and `CREDITS.md` lines (section 7), the pack index. T2 once: startup without errors, reachability, recipe lookup for every mega.

### 6.6 Parallel and serial

| Band | Packages | Notes |
|---|---|---|
| 1 | MEGA-S | alone |
| 2 | MEGA-0 (+0b) | alone, shared lib |
| 3 | MEGA-1 ∥ MEGA-2 | disjoint files |
| 4 | MEGA-3 ∥ MEGA-7 | MEGA-3 alone owns `integration/gtca.js` |
| 5 | MEGA-4 ∥ MEGA-5 | both depend on MEGA-2 |
| 6 | MEGA-6 ∥ MEGA-8 | MEGA-6 depends on MEGA-3 |
| 7 | MEGA-9 | depends on 0b and 7 |
| 8 | MEGA-I | integrator |

At most two workers at once; one bench JVM.

---

## 7. Proposed DECISIONS and CREDITS lines

### 7.1 DECISIONS (for the integrator)

- `<date> · Mega family (docs/eras/mega.md): the user's request (translated: "huge multiblocks with enormous parallels or dedicated functions, also from LV") overrides rule 7's "Steam to HV only get small additions" for this family. One mega per era from LV to UHV; they are parallel or composed versions, counted apart from era quotas. LV to HV stay modest: ceilings 8/16/64, energy-bound, controllers made of the machines they replace, no parallel hatch before IV.`
- `<date> · Mega parallels: leisure.md:293's ≤64 cap holds up to IV. From LuV the mega family is bounded by energy only (each copy pays full EU/t through ParallelLogic), by the user's request. The only discount is GTM's coil rate (×0.95 per step, floor ×0.80) on the chemical megas.`
- `<date> · Coil Chemical Plant (HV) and Mega Chemical Complex (LuV) keep GTM's LCR rules (perfect subtick OC, batch, every LCR and chemical reactor recipe) and add coil parallels and the coil discount; GTCA's mega_lcr (non-perfect OC, no parallels) is <kept | hidden with a 1:1 conversion> (the user's decision).`
- `<date> · Postgame direction (the user's decision, revises 2026-10-24's "creative ending left out" for the postgame only): after the MAX ending (the mirror shell over Sgr A*, unchanged) comes a MAX+ postgame with intergalactic travel, fantastic materials, processes and lines, and creative items as a GTNH-style trial by fire (absurdly massive quantities of each component, like GTNH's Stargate). The absolute final goal is the Hyper Stargate, built from the creative items, more complex and demanding than GTNH's Stargate, supported by mega multiblocks and AE2 additions. Rule 2's "no quantity walls" does not apply to the creative items. Designed in its own era doc, far in the future.`

### 7.2 CREDITS (for the integrator)

| What | Source | Licence | What is taken |
|---|---|---|---|
| Coil-scaled parallels `2^floor(K/900)` on the mega family | GregTech Leisure (GTLCore `GTLRecipeModifiers.COIL_PARALLEL`), already credited for the advanced multi smelter (`CREDITS.md:88`) | No clear licence (ideas only) | The formula; the code is ours (`lib/mega.js`). |
| A chemical successor of the LCR with coil scaling and perfect OC | GregTech Leisure (chemical plant, `chemicalPlantOverclock`), Star Technology (`chemical_plant.js`, MIT) | ideas only / MIT | The concept; our formulas keep GTM's EBF discount rate instead of GTL's ×0.8 stacks. |
| Modular factory with module upkeep | Star Technology (K.O.M.A.R.U.) | MIT | The concept (`uv/mega_factory.js`). |
| Stellar forge parallels `2^floor((T − Trecipe)/450)` (UEV hook) | Star Technology (`StarTRecipeModifiers.HELL_FORGE_OC`) | MIT | The formula, with attribution, when UEV registers it. |
| Controller built from the machines it replaces | Star Technology (`CREDITS.md:44`) | MIT | Already credited. |
| Energy-bound parallels reference | GT-- (`GTNNRecipeModifiers.GTPP_MODIFIER`), GTCA (`GTCAMachines` mega LCR) | AGPL (read only) / LGPL | Nothing copied; read to compare. |
| Hyper Stargate (MAX+ hook) | GTNH's Stargate (idea of a final structure demanding massive quantities) | LGPL/GPL (ideas only) | The idea only. |

---

## 8. Open questions for the user

1. The LV to UV picks (wire works, polymer works, ore refinery, smelting complex, assembly hall, mega factory, quantum fabricator): confirm or swap.
2. `gtca:mega_lcr`: keep it or hide it with a 1:1 conversion to the coil chemical plant.
3. The UHV parallel hatch (1024): register it if S-M3 passes, or keep UV 256 as the top until UEV.
