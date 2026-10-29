# HV era

Here the pack becomes a real GregTech pack: crude oil is refined, cracked and ends up as plastics; titanium comes from a chlorine and magnesium chain; and EV circuits need a cleanroom. Multiblocks are projects: they are planned before they are placed. Leaving HV hurts because of the production line, not because of hand mining. In the end, the first rocket goes to the Moon, the only place with titanium: you land once, to bring two ores from each vein, and a lunar drill does the rest. One of our multiblocks, the refinery, does in one pass what GTM splits across four distillery passes, four desulfurization reactors and a cracker. HV brings together four of our multiblocks and eight GTM multiblocks that have to be coordinated.

You start HV with what MV leaves you: HV hull (`gtceu:hv_machine_hull`) and HV energy hatch, 8 advanced integrated circuits (`gtceu:advanced_integrated_circuit`), an MV power plant at 2,048 EU/t with a transformer to HV, the ore plant, a running Kanthal EBF and an AE2 network with a 64k CPU.

## Route

1. **HV grid.** MV→HV transformer (4 A → 1 A), buffers and HV hatches. The power plant grows with a large steel boiler and a large steam turbine (HV circuits) and, once gasoline arrives (step 4), with HV generators up to the gate's 8,192 EU/t.
2. **HV machines.** HV emitter and sensor need an ender eye, which since v0.5.0 belongs to MV (blaze from the MV simulator → extractor → chemical bath at 120 EU/t, `mv.md`; the vanilla recipe is removed by KubeJS). In HV the chemical reactor also makes blaze powder from carbon and sulfur (`blaze_powder`, 480 EU/t). The HV cutter's saw needs red steel (step 7).
3. **Oil and refinery.** MV fluid drilling rig → refinery (ours) → sulfur-free fuels, refinery gas, naphtha and H₂S. The reformer (ours) turns naphtha into aromatics and returns H₂ to the refinery. The gas goes to the distillery (methane) and, until there is gasoline, diesel runs the power plant.
4. **Cracking, plastics and gasoline.** Naphtha + steam in GTM's cracker (`gtceu:cracker`) or in the refinery → ethylene, propylene, butadiene and benzene. PTFE (chloroform + HF), epoxy (MV glycerol, benzene and propylene) and SBR. With PTFE, you can build the large chemical reactor (`gtceu:large_chemical_reactor`): naphtha + refinery gas + methanol + acetone (from MV) → raw gasoline, and with toluene → gasoline (1,600 EU/mB, five times the naphtha).
5. **Cleanroom and EV circuits.** `gtceu:cleanroom` (HV hull, HV circuit, 3 filters, 2 stainless steel rotors, 2 HV motors), plascrete walls (`gtceu:plascrete`, PE plates) and a filter ceiling. Chain: CPU (MV wafer) → microprocessor → assembly (2 microprocessors, 4 inductors, 8 capacitors, 4 RAM) → workstation inside the cleanroom (2 assemblies, 4 diodes, 4 RAM, electrum wire and 16 blue alloy bolts). It is the wall: the freezer and the tower need EV circuits.
6. **Vacuum freezer and titanium.** `gtceu:vacuum_freezer` (3 EV circuits) cools hot titanium ingots and makes liquid air. Kroll: lunar ilmenite (step 8) → TiCl₄ → Kanthal EBF with magnesium → hot ingot → freezer. MgCl₂ goes back to magnesium with sodium (Mg/Cl₂ loop).
7. **Serious alloys.** Black steel (nickel + black bronze + 3 steel; EBF 1,758 K, bath) → red steel (rose gold + brass + 2 steel + 4 black steel; Kanthal EBF 1,813 K, 480 EU/t, bath): gold, silver, copper, zinc and nickel from the ore plant. Nichrome (4 nickel + 1 chrome; EBF 2,700 K, 1,920 EU/t with two HV hatches, freezer) for the EV coil.
8. **The Moon.** GCYR rocket and suit (HV, stainless steel: `integration/gcyr.js`; the motors are tested on the test stand, the tanks and the motor shield come from the composite autoclave, and the destination chip is written with the lunar landing chart: see *The first rocket*) → one trip for two ores from each lunar vein → samples → lunar drill (see *Lunar drill*): ilmenite (the only titanium in the pack) and helium-3. Then Waystones and `/home` let you go and return for free, and AE2's quantum bridge Earth–Moon handles items, fluids and energy. The End (platinum for the reformer's catalyst, palladium) has belonged to MV since v0.5.0.
9. **Serious storage.** 256k cells and CPUs, stainless steel and titanium drums, super chests and GT tanks (see *Serious storage*).
10. **Exit.** See *Gate to EV*.

## Inherited from MV

- **The Moon and the trip.** Owner: the lunar drill (`veins_moon.json`), the rocket and the suit. One trip, two ores per vein (LV decision 4). The End and its key belong to MV.
- **Ender eye.** Owner: MV (`mv.md`). In HV the blaze also comes from carbon and sulfur.
- **Mixed metal.** Owner: EV (centrifuge, 900 EU/t). In HV it stays stored or is not separated (stone dust goes to sludge). There is no new recipe.
- **Glycerol.** Two destinations: epichlorohydrin (`epichlorohydrin_from_glycerol`, epoxy) and ethylene (`ethylene_from_glycerol`: 1,000 mB of glycerol + 1,000 of CO₂ → 2,000 of ethylene + 5,000 of O₂, 200 EU/t), which gives a use to the inert CO₂ from the arc furnace.
- **Methanol and acetone.** Owner: raw gasoline (large reactor, step 4). Methanol comes from the CO of silicon, and acetone from the biorefinery; in MV they only had small destinations (biodiesel, glue).

## Automatic resource generation

Same pattern as LV and MV: a catalyst that is not used up and inputs from another line. What HV needs comes from MV, except the Moon.

### HV vein drill

- **Registration:** `gtceu:hv_vein_drill`, recipe type `gtceu:vein_drilling`, the spec and the table from LV and MV (`lv/multis.js`, `lv/vein_drilling.js`) plus the new `veins_end.json` table.
- **End veins (from MV since v0.5.0).** With the stainless steel drill bit and mud, HV can run them too (`vein_drilling/hv/`); with the vanadium bit they belong to MV (`vein_drilling/mv/`). Four: `bauxite_vein_end` (bauxite and aluminium: the ilmenite moved to the Moon), `magnetite_vein_end` (magnetite, vanadium, chromite, gold), `sheldonite_vein` (bornite, cooperite, platinum, palladium) and the zircon one from GTCA. The scheelite vein moved to Mars; `naquadah_vein` and `pitchblende_vein_end` are radioactive and wait for IV.
- **Sample and trip:** the sample takes 2 ores from the vein, so one trip is enough. The End key (`grindless:end_key`, recipe with an ender eye; same helper as the Void and Flat keys) takes you to `minecraft:the_end` and returns you to the starting point. You do not have to kill the dragon. GTM's indicator rocks and the HV prospector (`gtceu:prospector.hv`, check its range) show where to look.
- **Beats MV:** cap of 32 on `bores` (one HV hatch, 512 V ÷ 8, fills all 32 runs: ×12 over steam; left open to balancing) and a stainless steel drill bit (`grindless:stainless_steel_drill_bit`, ~0.5% per cycle; ~0.25% with mud). HV has no titanium (see *HV without titanium*, at the end); the vanadium bit still counts.
- **Closes the loop:** sample and water, no more trips. From the End it gives platinum and palladium (EV), aluminium, vanadium and chrome.

### Lunar drill (the Moon)

- **Registration:** `gtceu:lunar_drill`, its own recipe type `gtceu:lunar_drilling` (no Earth drill runs a lunar vein, and the lunar drill does not run an Earth vein), table `veins_moon.json`, recipes in `moon/lunar_drilling.js`, all with `.dimension('gcyr:luna')`: it can be formed anywhere but only works on the Moon.
- **Shape (the family changes shape):** a 7×5×5 landing module: three stainless steel frame legs on regolith slabs, a clean stainless steel casing body with the hatches, two light sensor wings, and a steel pipe drill string running down the body, with a mast on top.
- **Veins:** `ilmenite_moon` (ilmenite, olivine, chromite, iron: the only titanium source in the pack), dry, with the stainless steel drill bit (3.75 ores per run, 0.5% wear), and `regolith_moon` (regolith: 5 mB of helium-3 per run, daytime only). 8 EU/t and 200 t per run, cap of 32 (one HV hatch). Samples: two ores or blocks from each vein, brought by hand on the first trip.
- **Power:** nothing burns in a vacuum. Batteries brought from Earth and, with the quantum bridge, the home power plant through EU P2P tunnels (eup2p) or FE from Applied Flux.
- **Bridge:** a lunar quantum seed (HV chemical reactor on the Moon: programmed circuit 1 + ender pearl + 250 mB of helium-3) and an AE2 singularity in an explosion give a linked pair marked for the Moon. A chamber outside Earth ejects the singularities of another planet. Quality-of-life items have no limits between planets: ender chests, tanks, bags and drawers, ender caps, Modular Routers and Waystones (plates included) work the same way on the Moon.
- **EV takes over:** the EV tripod drill (Moon and Mars, titanium drill bit) and the regolith cell (O₂, chlorine-free titanium, sintered regolith bricks).

### Oil, gas and air

- **Oil:** still uses `gtceu:mv_fluid_drilling_rig` (`oil`, `raw_oil`, `light_oil`, `heavy_oil`, `natural_gas`; 100–300 mB/s per deposit). The HV one (`gtceu:hv_fluid_drilling_rig`, ×16) needs an EV hull and belongs to EV; one MV rig already feeds two refineries. Natural gas is desulfurized into refinery gas (`desulfurize_natural_gas`).
- **Air:** gas collector and centrifuge (N₂, O₂) as in MV. Liquid air (`liquid_air`, freezer, 480 EU/t) and the noble gases belong to the gate to EV; helium also comes from refinery gas (`distill_refinery_gas`).
- **Cracking:** the feedstock comes from the refinery (naphtha, light, heavy and gas); the steam comes from the boiler, with water from the pump; the H₂ comes from electrolysis or the reformer.
- **H₂, Cl₂ and fluorine:** H₂ and Cl₂ from electrolysis of water and brine. Fluorine from topaz and blue topaz (Nether vein), lepidolite (salts) or bastnasite (monazite) → HF with H₂ (`hydrofluoric_acid_from_elements`). Magnesium from magnesite (olivine vein) and sodium from salt.
- **Closes the loop:** crude oil, salt, topaz, magnesite and metals come from drills; everything else is just EU.

### HV greenhouse

- `gtceu:hv_greenhouse`, recipe type `gtceu:greenhouse`, the same spec with `bores` at 32. **Decision: just the step.** HV does not ask for more wood or crops than MV: the new carbon comes from oil. It still gives natural rubber, seed oil (biodiesel → glycerol) and the useful CO₂ sink.

### Creatures

- `gtceu:hv_creature_simulator` already exists (LV to EV), and `mobs.json` has blaze in MV since v0.5.0 (120 EU/t, 2 rods per 1 coal dust). HV does not need new models: the wither (Nether star) is decided in EV.

## Our multiblocks

### Refinery: `gtceu:refinery` (this era's)

What it gains: **several steps in one, and throughput.** The distillery yields one fraction per pass, and the other three are never produced: having all four costs ×4 the crude. GTM's tower needs EV circuits; with HV circuits you only get the distillery. The refinery does crude + H₂ → four sulfur-free fractions in one pass, and cracks and separates what comes out of the process.

- **Recipe type:** `gtceu:refining` (new, check for id collision), generated from GTM's recipes with their proportions and the energy of the sum of stages, with no discount. The circuit selects the mode:
  1. **Refining** (circuit 1): 50 mB of crude oil (`distill_oil`; `raw_oil`, `light_oil` and `heavy_oil` with their own figures) + ≈ 23 mB of H₂ → 15 heavy, 50 light, 20 naphtha and 60 gas, sulfur-free, + ≈ 11 mB of H₂S. 20 t at ≈ 100 EU/t (tower 96 plus desulfurization).
  2. **Cracking with H₂** (circuit 2): naphtha, light, heavy or refinery gas + H₂ → gases already separated (butane, propane, ethane, methane; `lightly_hydro_crack_*` + `distill_*cracked*`). Cracking refinery gas gives back part of the H₂.
  3. **Cracking with steam** (circuit 3): the same with steam (`lightly_steam_crack_*`, 240 EU/t): per 1,000 mB of naphtha, 200 of ethylene, 200 of propylene, 150 of butadiene, 150 of benzene and 40 of toluene, plus heavy, light, butene and methane.
- **Structure:** reactor base of 7×7×3 and a 3×3 column of 6 to 12 layers: `gtceu:clean_machine_casing` casing, `gtceu:steel_pipe_casing` pipes, one fluid output hatch per layer (up to 8), 2 inputs (crude and H₂ or steam), input bus (catalyst), output bus (carbon) and 1–2 HV energy hatches. It reuses GTM's tower class (check from KubeJS); otherwise, free outputs.
- **Own requirement:** catalyst (`grindless:hydrotreating_catalyst`: cobalt, molybdenum and silica from sand electrolysis) in the input bus, ≈ 0.05% per pass (figure to adjust). Cobalt from the Overworld nickel vein, molybdenum from the Nether one: it crosses three ore lines.
- **Built from what it replaces:** HV hull + HV distillery + 2 HV chemical reactors (`gtceu:hv_distillery`, `gtceu:hv_chemical_reactor`) + 2 HV pumps + 4 HV circuits.
- **Throughput:** normal GT overclocking gives ≈ 100 mB/s with one HV hatch and ≈ 200 with two; no parallels. One MV drilling rig feeds two refineries.
- **Why it is not a big cube:** (1) its recipe type crosses three GTM machines and has more fluid outputs than any of them; (2) it gives no parallels and no discount: it gains steps and crude (×4 over the distillery), not energy per mB; (3) it needs H₂, a catalyst and a destination for each fraction: if one hatch fills up, it stops.
- **Byproducts:** H₂S → sulfuric acid (`sulfuric_acid_from_sulfide`) or sulfur. Refinery gas → distillery (methane for PTFE, ethane, propane, butane, helium) or turbine (160 EU/mB). Light and heavy → diesel or cracking; naphtha → reformer, cracking, raw gasoline or, if there is excess, generator (320 EU/mB). Carbon (1/9 per batch) → blaze, steel. Surplus butadiene (204 EU/mB) and butane → turbine.

### Catalytic reformer: `gtceu:reformer` (second, removable)

What it gains: **H₂ and aromatics.** GTM does not reform: benzene comes out of steam cracking (150 per 1,000 of cracked naphtha), and H₂ comes mostly from electrolysis. The reformer turns naphtha into benzene, toluene and H₂, and gives back to the refinery the H₂ it uses. It gives the End's platinum a use in HV.

- **Recipe type:** `gtceu:reforming` (new, check for id collision), 2–3 hand-written recipes. Indicative, to be set with the H₂ balance: 1,000 mB of naphtha → ≈ 300 of benzene + ≈ 150 of toluene + ≈ 1,200 of H₂, 80 t at 240 EU/t. With these figures, all the naphtha from a medium crude (`oil`) reformed returns ≈ 105% of the H₂ the refining used; heavy crude (`heavy_oil`) runs a deficit and needs H₂ from electrolysis. Choosing the deposit and splitting the naphtha (reformer, gasoline, cracking) are decisions.
- **Own requirement:** platinum catalyst (`grindless:reforming_catalyst`: End platinum on silica) in the input bus, ≈ 0.05% per pass.
- **Structure:** 5×5×6, `gtceu:clean_machine_casing` casing, one input hatch (naphtha), three output hatches (benzene, toluene, H₂), catalyst bus and one HV energy hatch. HV hull + HV chemical reactor + 2 HV pumps + 4 HV circuits.
- **Why it is not a big cube:** its recipe does not exist in any GTM machine, it gives no parallels or discount, and it forces routing: the naphtha comes from the refinery and the H₂ goes back to it. Without platinum it does not run.
- **Byproducts:** H₂ → refinery or methanol (`methanol_from_dioxide`); any excess is voided (in GTM H₂ is not dangerous). Benzene → styrene, cumene or turbine (352 EU/mB). Toluene → gasoline (1,000 per 10,000 of raw gasoline) or generator (320 EU/mB).
- **Removable:** if the H₂ balance does not close or the platinum fails, it is removed and the refinery keeps running on H₂ from electrolysis.

### Composite autoclave: `gtceu:composite_autoclave` (the path to the first rocket)

What it gains: **a recipe that is impossible at small scale.** No single-block machine can cure a large fiber-and-epoxy part with heat and nitrogen pressure (GTM's autoclave crystallizes gems with a single fluid). It is the only source of two parts of the first rocket (see *The first rocket*).

- **Recipe type:** `gtceu:composite_curing` (new). 300 t at 480 EU/t. Nitrogen pressurizes the vessel and is vented when each cure ends (it is inert: venting it is its destination).
  - **Ablative heat shield tile** (`grindless:ablative_heat_shield_tile`): 4 fiberglass sheets (from GCYR; the fiberglass comes from the HV chemical bath, `integration/gcyr.js`) + 250 mB of epoxy + 500 mB of N₂ → 2 tiles. They are the shield at the base of the motor (against the flame that comes back, under the tanks): two per motor.
  - **Composite overwrapped tank** (`grindless:composite_overwrapped_tank`, a COPV): 1 stainless steel drum (the liner) + 4 para-aramid sheets + 250 mB of epoxy + 500 mB of N₂ → 1 tank. Two per basic fuel tank, instead of the two bare drums.
- **Structure:** 5×7×4. A pressure vessel lying on two stainless steel frame supports, with its axis facing the player: a 5×5 octagonal clean stainless steel casing around a 3×3 air chamber in the two middle slices, closed at the back, the door at the front (the controller in the middle of the door), and the nitrogen line (steel pipe casing) on top. Hatches on the casing: 1–2 HV energy hatches, input bus (fibers and liners), output bus, and 2 inputs (epoxy and nitrogen).
- **Controller:** HV hull + 2 HV autoclaves + 2 HV pumps (pressure) + 4 HV circuits, in the crafting table.
- **Lines it crosses:** fiberglass (silica + epoxy), para-aramid (large chemical reactor, the same line as the suit fabric), epoxy (glycerol, benzene, propylene) and nitrogen from the air.
- **Why it is not a big cube:** its recipe type does not exist in any machine, it gives no parallels or discount, and it needs two fluids.

### Syngas plant: `gtceu:syngas_plant` (the hydrogen for the rocket and the refinery)

What it gains: **several steps in one, and a reaction that no small machine performs.** GTM does not gasify with steam and does not have the water-gas shift reaction: its CO only goes to methanol, acetic acid, some synthesis or the electrolyzer, and coal only gives CO by burning it with O₂. The plant gasifies powdered carbon or the refinery's heavy fuel with steam, shifts the CO with more steam over a catalyst, and separates the gases, each to its own hatch. It also turns the excess CO in HV into H₂.

- **Recipe type:** `gtceu:syngas`, six recipes written from real chemistry in a table (`server_scripts/grindless/hv/syngas_plant.js`). The circuit selects the mode:

  | Circuit | Reaction | In | Out | EU |
  |---|---|---|---|---|
  | 1, gasification | C + H₂O → CO + H₂ | 1 dust + 1,000 mB of steam | 1,000 of CO + 2,000 of H₂ | 480 EU/t × 60 t |
  | 1, gasification | CH₂ + H₂O → CO + 2 H₂ | 1,000 of heavy fuel + 1,000 of steam | 1,000 of CO + 4,000 of H₂ | 480 × 60 |
  | 2, methanol gas | 3 C + 4 H₂O → 2 CO + 4 H₂ + CO₂ | 3 dusts + 4,000 of steam | 2,000 of CO + 8,000 of H₂ + 1,000 of CO₂ | 480 × 220 |
  | 3, hydrogen | C + 2 H₂O → CO₂ + 2 H₂ | 1 dust + 2,000 of steam | 4,000 of H₂ + 1,000 of CO₂ | 480 × 100 |
  | 3, hydrogen | CH₂ + 2 H₂O → CO₂ + 3 H₂ | 1,000 of heavy fuel + 2,000 of steam | 6,000 of H₂ + 1,000 of CO₂ | 480 × 100 |
  | 4, shift | CO + H₂O → CO₂ + H₂ | 1,000 of CO + 1,000 of steam | 2,000 of H₂ + 1,000 of CO₂ | 480 × 40 |

  The dust is any item in the `#grindless:gasifier_feed` tag: coal, coke, charcoal or carbon (entrained-flow gasifier: it needs pulverized feed; the ore plant already gives powdered coal). The dusts give ash at GTM's coal probability (1 in 9 per mole). Mode 2 gives exactly the CO + 4 H ratio of GTM's methanol (`methanol_from_monoxide`); heavy fuel already gives it in mode 1.
- **Honest units:** they are GTM's: 1,000 mB is one mole, and its hydrogen counts in atoms (electrolysis gives 2,000 mB per 1,000 of water). Steam is H₂O in GTM's own material, and 1,000 mB counts as one mole of water, as when the cracker and the pyrolysis oven take it as a reactant. Heavy fuel counts as CH₂ (long chain). Each recipe balances carbon, hydrogen and oxygen; the test checks it.
- **Energy:** the sum of the stages, with no discount: 28,800 EU for gasification (it is endothermic, +131 kJ/mol) and 19,200 for the shift with CO₂ capture (the reaction gives off heat, −41 kJ/mol; regenerating the amine takes more). Everything at 480 EU/t, no parallels; with two HV hatches it moves up one step like any GTM machine. H₂ comes out at 12 EU/mB in mode 3 (9.6 in the shift, 8 from heavy fuel), versus 22.5 from electrolysis in LV (90 with overclocking to HV) and 9 plus the methane from GTM's methane reforming. No loop beats what GTM already gives: two carbons through modes 1 and 3 plus GTM's `methane_shortcut` give one methane (112,000 EU in a turbine) for 81,600 EU, about 15,000 EU per carbon, which is less than GTM's pyrolysis (about 22,000 of coal gas per carbon, and the coke stays); three carbons through mode 2 and the methanol reactor give two methanols (128,000 EU) for 128,640 EU.
- **Own requirement:** shift catalyst (`grindless:shift_catalyst`: 3 magnetite + 1 chrome → 4 in the mixer; the iron and chrome oxide of real high-temperature shift) in the input bus, ≈ 0.05% per pass, only in the modes that shift (2, 3 and 4). Gasification alone does not need it. It crosses the Overworld magnetite vein with the chrome from stainless steel.
- **Structure:** 9×7×3 (width × height × depth). Floor of 9×3 clean stainless steel casing, the only place for hatches. On top, from left to right: the gasifier (heat-resistant casing around a cavity, a ring of 8 Kanthal coils in the middle and the cap with the gas outlet), the two shift drums (clean stainless steel over a core of steel pipes, separated by four stainless steel frames) and the CO₂ absorber column (clean stainless steel, six blocks high, tempered glass window). A steel pipe manifold joins the three from above. Hatches: 1–2 HV energy hatches, input bus (feed and catalyst), output bus (ash), 1–2 inputs (steam, and CO or heavy fuel) and 2–3 outputs (each one holds one gas: if a gas has no place, the recipe does not start, so nothing is lost or mixed).
- **Controller:** HV hull + HV chemical reactor (the shift) + HV centrifuge (gas separation) + 2 HV pumps + 4 HV circuits, in the crafting table.
- **The excess CO in HV:** silicon (arc furnace and EBF: 2,000 mB per ingot, and each boule needs 32), the wood gas from the biorefinery and the Nether air. Kroll (2,000 per TiCl₄) no longer counts: titanium belongs to EV and the Moon.
- **The H₂ HV needs:** the refinery (≈ 0.46 mB per mB of medium crude, and 0.8 with heavy, which with the reformer recovers barely 22%; cracking with H₂, 2,000 per 1,000 of feed) and the rocket. GCYR burns H₂ as tier-1 fuel, but 8 B (buckets) of `gtceu:rocket_fuel` need about 26.7 B of H₂ and 2.7 B of CO, for the methanol and the ammonia in the dimethylhydrazine and N₂O₄. With the plant, it takes about 4 dusts in mode 2 (methanol) and 4 more in mode 3 (ammonia), about 333,000 EU (electrolysis would need 600,000 in LV and 2.4 million overclocked to HV).
- **Difference from the reformer:** the reformer turns naphtha into aromatics over platinum, and its H₂ is a byproduct that returns the medium crude's H₂ to the refinery; it takes no steam, carbon or CO, and gives no CO₂. The plant makes H₂ (or syngas) from solid carbon and from the heavy bottoms, with steam, shifts the CO and captures the CO₂. Neither of the two reforms methane: a GTM chemical reactor already does that (`carbon_dioxide_from_methane`).
- **Byproducts:** H₂ → refinery, ammonia, HF, methanol or the rocket. CO (toxic in GTM: it is contained) → methanol (mode 2 is its exact gas), acetic acid, butyraldehyde, or back to the plant in mode 4. CO₂ (inert in GTM, not dangerous: it can be discarded) → MV and HV greenhouses, ethylene from glycerol, methanol from CO₂, soda, bicarbonate, back to CO with carbon or electrolysis. Ash → GTM centrifuge (quicklime, potash, magnesia…) or fertilizer.
- **Why it is not a big cube:** its recipe type does not exist in any machine, it gives no parallels or discount, and it needs steam from the power plant, feed from the drill, a catalyst from two veins and a destination for each gas.
- **Decisions taken (syngas plant, 2026-10-24):**
  1. Six recipes, not one per feed: the four dusts enter through their own tag (`grindless:gasifier_feed`), with the same ash.
  2. Pulverized feed only: the gasifier is entrained-flow, like real pulverized-coal gasifiers; gems go through the macerator.
  3. Steam is the reactant, at 1,000 mB per mole of water (GTM's material is H₂O); no separate water is required.
  4. Heavy fuel is the "heavy residue": it counts as CH₂, and it gives the bottoms of the heavy crude a destination that closes its H₂ deficit.
  5. No methane: methane reforming is already GTM's. The reformer is still naphtha-only.
  6. The catalyst is only required where there is shifting, and it is iron and chrome; the low-temperature copper and zinc one is dropped (it adds no other decision for the player).
  7. CO₂ comes out captured and pure: discarding it is honest because it is inert in GTM, and it has six uses in GTM and the pack.

### Family steps

The HV drill and greenhouse (above). GTM's tower is not replaced: it stays for liquid air and general chemistry in EV.

### Discarded

- **Our own titanium plant (Kroll in a box):** erases the line that gives HV its identity. The whole GTM chain stays.
- **Pressure and vacuum system** (GCYS, MIT): requires Java (pressure hatches, axial compressor). Vacuum is GTM's freezer.
- **Large cubes and alloy smelting** (GCYM, `t_large_*`): speed only; GTM brings the GCYM ones in at IV.
- **Large miner and bedrock miner** (GTM): the sampling drill already does that job.

## The first rocket: the parts chain

The first rocket stops being an assembler recipe and becomes a project that crosses MV and HV. The rocket is still GCYR's, built from its blocks (launch pad `gcyr:launch_pad`, stainless steel frame tower, `gcyr:seat`, `gcyr:basic_fuel_tank` and `gcyr:basic_rocket_motor`); only the recipes of its parts change, all in `integration/gcyr_launch_road.js` (what is in `integration/gcyr.js` — scanner, fabric, fiber and suit — stays the same).

| Part | How it is made | Machines |
|---|---|---|
| Qualified thruster (`grindless:qualified_power_thruster`) | 4 GTM power thrusters + 200 mB of RP-1 + 300 mB of O₂ → 4 (MV static fire, 120 EU/t, 300 t) | assembler (thruster), test stand (MV) |
| Ablative tile and overwrapped tank | see *Composite autoclave* | composite autoclave (HV) |
| Untested rocket motor (`grindless:untested_rocket_motor`) | 4 qualified thrusters + 2 ablative tiles + 4 Kapton K plates + 1 stainless steel frame (before: 4 thrusters + 6 Kapton K + frame) | HV assembler, 480 EU/t, 300 t |
| **Basic rocket motor** | untested motor + 500 mB of rocket fuel → motor + 250 mB of CO₂ + 500 mB of water (the N₂ is vented). GCYR's assembler recipe is removed: the motor only comes out of the test stand | test stand with 1 HV hatch or 2 MV, 480 EU/t, 400 t |
| **Basic fuel tank** | 2 overwrapped tanks + 6 Kapton K plates + 1 stainless steel frame (before: 2 stainless steel drums) | HV assembler, 480 EU/t, 300 t |
| Seat, pad, tower | as in GCYR (seat: MV assembler; pad: black concrete, steel frame and yellow dye) | — |
| Rocket scanner | `integration/gcyr.js`: HV hull, 4 HV circuits, 2 stainless steel plates and 2 platforms | crafting table |
| **Destination chip** (`gcyr:id_chip`) | magnetic iron sheet + PE plate + the radio telescope's lunar landing chart (`grindless:lunar_landing_chart`, MV), which stays in the crafting table. Until the observatory is in the pack, the chip keeps GCYR's recipe | crafting table |
| Suit | `integration/gcyr.js`, and 16 B of O₂ in the chest piece (fluid canner) before leaving | — |
| Fuel | 8 B or more of `gtceu:rocket_fuel` for the Moon (the two tanks hold 10 B; each leg burns about 1.2 B) | HV chemical reactor (dimethylhydrazine) + mixer |

- **How much the first rocket needs:** 4 to 6 motors (with 6 motors, 2 tanks and 1 seat, the flight-test rocket climbs 5 blocks per tick: thrust 24, weight 19; with 4 it barely climbs), 2 tanks and 1 seat. That is 16–24 thrusters (4–6 MV static fires), 4–6 tile curings, 4 tank curings, 4–6 HV static fires and 2–3 B of extra fuel for the tests.
- **Why this way:** difficulty rises through steps and crossed lines (MV's RP-1, fiberglass, para-aramid, epoxy, nitrogen, rocket fuel), not through quantity: GCYR's figures stay and no time is inflated. Each byproduct has a destination (CO₂ and water from the test stand go to their hatches; the N₂ from the autoclave, inert, is vented).
- **No new launch multiblock:** GCYR's scanner and pad already are the launch complex and already belong to HV; there is no gap that would justify another.
- **Decisions taken (path to the rocket, 2026-10-24):**
  1. GCYR's basic motor only comes out of the test stand: no rocket flies with an untested motor. The static fire burns the same fuel the rocket flies on.
  2. The heat shield goes on the motor (base shield, against the flame), not on the seat: this way the static fire tests it too, and the seat stays GCYR's.
  3. The basic tank swaps its two drums for two tanks overwrapped in para-aramid; the Kapton K stays as insulation.
  4. The lunar landing chart goes in the destination chip, not in the scanner: the chip carries the flight's destination, each launch needs one (the chart is not used up and counts for every flight), and `integration/gcyr.js` is not touched. The scanner is built only once.
  5. The autoclave consumes the nitrogen and does not return it: it is vented after each cure, as in a real autoclave.

## New process lines

| Line | Steps | Byproducts → destination |
|---|---|---|
| Crude → fuels | deposit → refinery (mode 1) → light + heavy → mixer → diesel (480 EU/mB). Gasoline: 16,000 of naphtha + 2,000 of refinery gas + 1,000 of methanol + 1,000 of acetone → 20,000 of raw gasoline (large reactor, `raw_gasoline`, 480 EU/t) + 1,000 of toluene per 10,000 → gasoline (`gasoline`, 1,600 EU/mB) | H₂S: acid or sulfur. Refinery gas: distillery or turbine. Surplus heavy: cracking (mode 2). The methanol and acetone from MV find their big destination here |
| Cracking → olefins and aromatics | naphtha (or light, heavy, gas) + steam → refinery (mode 3) or cracker → ethylene (PE, PVC), propylene, butadiene, benzene, toluene. Naphtha → reformer → benzene, toluene and H₂ | Carbon: blaze and steel. Ethane, propane and methane: turbine or moderate cracking in the cracker. The reformer's H₂ goes back to the refinery |
| PTFE | methane + 6,000 of Cl₂ → chloroform (`chloroform`, 3,000 of HCl); + 4 HF → TFE (`tetrafluoroethylene_from_chloroform`, 240 EU/t, 6 HCl) → PTFE (`ptfe_from_oxygen`) | HCl: vinyl chloride (PVC), epichlorohydrin and acid. PTFE: inert machine casing (`gtceu:inert_machine_casing`) and large reactor tubes |
| Epoxy and SBR | glycerol + HCl → epichlorohydrin; benzene + propylene + phosphoric acid → cumene (`cumene_from_benzene`) → phenol + acetone → bisphenol A → + epichlorohydrin + 3 NaOH → epoxy. Styrene (ethylene + benzene) + butadiene + O₂ → raw SBR (240 EU/t) → + sulfur → rubber | Salt water from epoxy: electrolysis (Cl₂ and Na). Acetone: glue. SBR: replaces rubber in EV pumps and belts, and is mandatory from IV (silicone or SBR rings) |
| Titanium | lunar ilmenite → rutile (`rutile_from_ilmenite`, EBF 1,700 K, 480 EU/t) → `titanium_tetrachloride` (2 C + rutile + 4,000 of Cl₂, 400 t) → `titanium_from_tetrachloride` (EBF 2,141 K, 480 EU/t, 800 t; + 2 Mg) → hot ingot → freezer | CO (2,000 mB per TiCl₄): methanol or tank (toxic, contained). CO₂ from rutile: inert. Wrought iron: steel. MgCl₂: `salt_from_magnesium_chloride` (3 MgCl₂ + 2 Na → Mg + 4 salt), the salt goes back to electrolysis |
| EV circuits | boule → wafers → CPU; capacitors, inductors, diodes and RAM → assembly → workstation in cleanroom (`gtceu:micro_processor_computer`, soldering ×2); blue alloy = 4 electrotine (redstone + electrum, or saltpeter vein) + 1 silver | Acid and persulfate from the boards: MV loops. The parts leave no waste |

## Convenience (counted apart from rule 7)

- **Cleaning maintenance hatch at HV** (2026-10-25, a GregTech Leisure idea). GTM's `gtceu:cleaning_maintenance_hatch` moves from its UV recipe to an HV assembler recipe: auto maintenance hatch + 4 filter casings + 2 HV motors + 2 stainless steel rotors + 2 HV circuits. It gives a cleanroom to the multiblocks that take a maintenance part, which are GTM's own; ours don't take one.

## New crossings (complexity audit)

- **Sulfide roaster, H₂S burner:** 1,000 mB of hydrogen sulfide from the refinery + the air and water of the sulfur burner → 1,000 mB of acid, steam and 500 mB of extra hydrogen, at 30 EU/t and 60 ticks (`grindless:sulfide_roasting/h2s`). It needs 3 input hatches and 3 output hatches, the roaster's maximum.
- **Hydrotreating catalyst with ash:** 1 cobalt + 1 molybdenum + 3 syngas ash (instead of silica) → 4 catalysts, same EU/t and time (`grindless:hydrotreating_catalyst_ash`).

## Serious storage

- **AE2:** HV raises the capacity, not the mechanics: 256k cell and CPU with an HV circuit and a stainless steel plate (about 2 rewritten recipes). AE2 stays hybrid (LV decision 1).
- **Co-processors:** `expanded-ae` (batch 2) brings ×2 up to 1M; in HV only the small ones, with MV and HV circuits; the large ones wait for EV–IV (check ids and recipes).
- **GT:** stainless steel and titanium drums (`gtceu:stainless_steel_drum`, `gtceu:titanium_drum`), `gtceu:hv_super_chest` and `gtceu:hv_super_tank` (LV to EV in GTM; check capacity) and buffers.
- **GTM ME hatches: EV** (`me_input_bus` and similar). In HV the machines are fed with AE2 export buses, interfaces and LaserIO or Pipez: logistics is not the wall.
- **Out:** AdvancedAE (replaces AE2 parts and puts chemistry into one box) and MEGA Cells (IV).

## Gate to EV

| What is built | What it tests |
|---|---|
| EV hull (`gtceu:ev_machine_hull`: EV casing of 8 titanium plates, 2 aluminium cables, PE) and EV energy hatch | Kroll titanium with its Mg/Cl₂ loop, and aluminium, in batch |
| 8 EV circuits (`gtceu:micro_processor_computer`, `#gtceu:circuits/ev`) made in a cleanroom | boule → CPU → assembly → workstation; blue alloy and silver sustained |
| EV motor (titanium rods, neodymium magnet, double aluminium cable, double Kanthal wire) and EV pump (titanium pipe, stainless steel rotor, rubber rings) | neodymium from the monazite vein (Nether), titanium, Kanthal and rubber sustained |
| Vacuum freezer and distillation tower (`gtceu:distillation_tower`: 4 EV circuits) with liquid air running | air is separated, and GTM's tower does what the refinery does not |
| Large chemical reactor built, with PTFE, epoxy and gasoline in batch | the fluorine line, and the glycerol, methanol and acetone from MV and the cracker, all close their loops |
| HV power plant at 8,192 EU/t or more (gasoline, large boilers and turbines), 2 buffers and HV→EV transformer (4 A → 1 A) | "not cutting it close": EV fits with the buffer above 50% |
| AE2 network with a 256k CPU that crafts the EV motor with patterns | AE2 is still the logistics |
| HV drill with an End vein, greenhouse, simulator, fluid drilling rig, refinery and reformer running 10 minutes without touching them | generation holds up by itself |

Unlocks EV: EV hull and hatches (4 A and 16 A), HV fluid drilling rig (EV hull, ×16), GTM ME hatches, large gas turbine and large combustion engine, high-octane gasoline (EV large reactor: gasoline + octane + nitrous oxide + toluene + ETBE), tungsten steel (Martian tungsten; nichrome coil), nano and quantum circuits (End platinum) and the EV field generator (Nether star).

## Mods and integration

| Mod | Slug | Use in HV |
|---|---|---|
| Expanded AE | `expanded-ae` | already in batch 2: 72-slot provider and co-processors; HV gates the large ones with HV circuits and stainless steel (check recipes) |
| ExtendedAE | `extended-ae` | to review: overlaps with the previous one; if it stays, only the ×8 I/O bus, the wireless connector and the pattern modifier with HV circuits; no infinite cells, instant crystal or extended inscriber |
| AdvancedAE | `advancedae` | proposed to be dropped (lv.md lists it for HV–EV) |
| GTM Advanced Hatch, Modern AE2 Additions | `gtm-advanced-hatch`, `modern-ae2-additions` | to review: HV or higher; it must not duplicate GTM's ME hatches |
| MEGA Cells | `mega` | IV (set by lv.md) |
| GCYR | `gcyr` | the first rocket and the space suit are HV, with stainless steel and HV parts (`integration/gcyr.js`, see *HV without titanium*) |
| Sophisticated Backpacks and Storage, Storage Drawers for GT | `sophisticated-backpacks`, `sophisticated-storage`, `gregtech-storage-drawers` | tier 3 with stainless steel and titanium |
| Create and Greate | `create`, `greate` | no changes |

No new mod is required: machines, recipe types, key and catalysts are KubeJS.

- **Startup:** recipe types `gtceu:refining` and `gtceu:reforming`; machines `refinery`, `reformer`, `hv_vein_drill` and `hv_greenhouse` with the pattern helper; `bores` at 32 for HV; items `grindless:stainless_steel_drill_bit`, `grindless:hydrotreating_catalyst`, `grindless:reforming_catalyst` and `grindless:end_key`. The refinery's `widen`: 2 input fluids, 8 output fluids, 1 input item and 1 output item.
- **Server:** generate `refining` from `distillation_tower` (crude) and `cracker` + tower (cracking); the 2–3 `reforming` recipes by hand in a table; `veins_end.json` and the stainless steel drill bit in `lv/vein_drilling.js`; the key in `dimensions.js`; remove the vanilla recipe `minecraft:ender_eye` (in GTM only `recipes.hardMiscRecipes` removes it, and that would also remove the furnace and the crafting table); 256k AE2 recipes; gates for the mods in the table, with HV circuits.
- **Config:** `config/gtceu.yaml` already sets FE and infinite fluid veins; `machines.enableMaintenance` still needs a decision (risk 5), and `recipes.enableExtractorRecycling` (on by default) needs checking: the liquid blaze comes from it.
- **Quests:** the "HV: Moonshot" chapter, 32 quests since the 2026-10-25 voice pass (`docs/quests.md` section 14), with small rewards and no recipe locks.
- **Tests:** (1) starts up; (2) refinery, reformer, HV drill and HV greenhouse form and process; (3) crude → refinery → naphtha → gasoline; naphtha → cracker → ethylene → PE; boule → workstation; rutile → titanium, and `-Tier hv` with no orphans.

## Risks and questions

- **Refinery and reformer.** About 13 generated recipes (4 crude, 8 cracking, natural gas) and 2–3 reformer recipes with figures that are ours, not GTM's. The reused tower class from KubeJS is unverified (if it fails: free outputs, no layers). One sentence in mv.md changes: there, crude came from GTM's tower; here, the tower stays for liquid air and general chemistry.
- **The End.** One trip with the dragon alive; it must be checked that the key works for a vanilla dimension. Plan B: a custom dimension with the veins, via datapack like the Void and the Flat.
- **The wall is the EV circuit line.** Cleanroom, 16 blue alloy bolts per station (electrotine, silver, deep redstone), capacitors, inductors and diodes. If 8 stations are too many, the gate drops to 4 after one balance pass.
- **H₂, Cl₂ and CO.** The refinery uses ≈ 0.46 mB of H₂ per mB of medium crude; Kroll uses 4,000 mB of Cl₂ per ingot and leaves 2,000 of CO; PTFE uses 6,000 of Cl₂ per chloroform. The H₂ comes from electrolysis and, with medium crude, almost closes on its own with the reformer; with heavy crude it does not. If the balance fails, the reformer is cut and the H₂ comes from electrolysis. The syngas plant closes the heavy crude's H₂ deficit (it gasifies its heavy fuel) and turns the excess CO into H₂.
- **Maintenance and hazards.** GTM requires a maintenance hatch by default on the cleanroom, cracker, tower and EBF, and our multiblocks do not have one. Hazards stay on (`gameplay.hazardsEnabled`); End radioactivity is left out until IV.

Credits to note in `CREDITS.md`: refinery as a petrochemical complex (idea from GTNH and Star Technology, MIT) and catalytic reforming (idea from GCYS, MIT); column (GTM's tower class, LGPL-3.0); our own titanium plant, the pressure and vacuum system and large cubes remain as discarded alternatives.

## Proposed decisions

1. **The End enters HV with four veins** (`veins_end.json`); the radioactive ones wait for IV. Sample of 2 ores and one trip.
2. **End key** (`grindless:end_key`, recipe with an ender eye). The vanilla portal still works and the dragon does not have to be killed. Plan B: a custom dimension.
3. **Two new multiblocks: the refinery** (`gtceu:refining`, the circuit selects the mode, cobalt and molybdenum catalyst) **and the reformer** (`gtceu:reforming`, End platinum; removable). Family steps: HV drill (cap 32) and HV greenhouse (just the step). Cracker, cleanroom, large reactor, freezer and tower are used as they are.
4. **GTM's tower stays for liquid air and general chemistry (EV);** crude is the refinery's. The sentence in mv.md is adjusted.
5. **The ender eye** comes from blaze powder (carbon + sulfur) → extractor → chemical bath, and the vanilla recipe (pearl + blaze powder) is removed; the simulator's rods are the other route.
6. **Titanium, EV circuits, plastics and gasoline are the whole GTM chains,** with no shortcut of ours. The freezer (3 EV circuits) ties titanium to the EV circuit: that order is the line. Gasoline (1,600 EU/mB) is the fuel of the HV power plant.
7. **Glycerol** to epichlorohydrin and ethylene; **mixed metal** stored until EV.
8. **Storage:** AE2 256k with HV circuits, `expanded-ae` gated, `extended-ae` to review, AdvancedAE out, MEGA in IV, GTM ME hatches in EV; drums, super chests and GT tanks.
9. **Maintenance:** turn off `machines.enableMaintenance` in `config/gtceu.yaml`; none of ours requires it, and it is a formality, not a line.

## Decisions taken (orchestrator, 2026-10-24)

The nine proposals are approved, with two clarifications:

- **End key.** It takes you to the vanilla End, to a safe platform far from the central island, and returns you like the other keys. The dragon does not need to be killed: it is enough to bring two ores from each End vein, once.
- **Maintenance.** It has already been off across the whole pack since MV (`DECISIONS.md`).
- **Base AE2 stays intact in LV** (the user asked for it), including the 256k cells. Proposal 8 now reads: in HV, gates go only on the addons (`expanded-ae`, `extended-ae` if it stays), on the drums, super chests and GT tanks, and on GTM ME hatches in EV. No base AE2 recipe requires HV circuits.

## HV without titanium (user decision, 2026-10-24)

Titanium enters at EV and comes only from the Moon (`docs/journey.md`, option A). All of HV moves to stainless steel. What is written above about titanium in HV (the Kroll line in step 6 and the titanium drum) is superseded by this; the End's ilmenite stays for now as a source (see the last note). The gate to EV (EV hull, motor and pump) still needs titanium, but now it is the titanium brought from the Moon at the end of HV.

- **Audit** of the recipe dump (everything the HV era makes and what each part makes): in GTM 7.5.3 the HV step was already stainless steel. No GTM machine, hull, casing, component, hatch or multiblock at HV requires titanium, and ours (refinery, reformer, HV drill and greenhouse) do not either. The only things that required it were our drill bit, GCYR's rocket scanner and the sample for the End's bauxite vein, because it is made with ilmenite.
- **HV drill bit.** `grindless:stainless_steel_drill_bit`: stainless steel plates and rods, same wear and yield as the titanium one had. The titanium one stays registered for old worlds, hidden in EMI, and converts 1:1 into the stainless steel one.
- **The first rocket and the suit** (GCYR) are HV (`integration/gcyr.js`):
  - The rocket scanner uses an HV hull, HV circuits and stainless steel plates.
  - The space fabric swaps polybenzimidazole (IV) for a Kapton K plate (HV chemistry).
  - Fiberglass moves to the HV chemical bath (480 EU/t).
  - The helmet and greaves use HV circuits.
  - The chest piece uses a large stainless steel cell and HV circuits, instead of the tungsten steel one.
  - The motor, the basic tank, the seat, the launch pad and the destination chip were already HV or lower. Afterwards, the path to the rocket remakes the motor, the tank and the chip (`integration/gcyr_launch_road.js`, see *The first rocket*).
- **Oxygen.** GCYR only registers the oxygen diffuser from IV onward. On the first trip the oxygen goes in the chest piece's tank (16 buckets, about 40 minutes), which is filled in a fluid canner.
- **End veins in v0.4.1** (transition until the Moon arrives in v0.5.0, orchestrator decision):
  - The ilmenite stays in the End's bauxite vein, so titanium has a source until the Moon replaces it. The sample no longer asks for it: it is made with bauxite and aluminium (`"sample": false` in `veins_end.json`).
  - The scheelite vein leaves the End (`veins_excluded.json`) with its recipes, and comes back on Mars. Its sample stays registered for the playthroughs that already have it: hidden in EMI, it converts into an empty vein probe. The validator confirms that nothing from steam to HV needs it. Lithium still comes from the salts vein (lepidolite and spodumene) and from clay.
