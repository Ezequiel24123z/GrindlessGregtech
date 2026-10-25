# MV era

The factory no longer fits in one room. Polymers, fuels and crossing lines appear: silicon gives off CO that ends up as methanol, wood yields acetic acid and carbon, ethylene comes from ethanol, and spent acid gets distilled again. One of our multiblocks replaces ten loose machines. The era ends when the HV circuit comes out of its own line and the power plant can handle HV.

You enter with what LV leaves: MV hull (`gtceu:mv_machine_hull`), MV energy hatch, 8 MV electronic circuits (`gtceu:good_electronic_circuit`), a cupronickel EBF running at 120 EU/t, and an AE2 network with a 16k CPU.

## Route

1. **MV grid.** Rubber-insulated copper cable (9 raw rubber from the greenhouse + 1 sulfur → 1,296 mB of rubber), battery buffer, hull and MV hatches on the LV→MV transformer (4 A → 1 A) at the LV gate. The power plant grows with large bronze boilers (creosote, biomass) and MV steam turbines (`gtceu:mv_steam_turbine`) until fuels arrive (step 7).
2. **MV machines** (`gtceu:mv_<machine>`). Motor (double cupronickel wire + aluminium rods), piston, pump, robot arm and conveyor (rubber). Two parts cross lines: the cutter needs a vanadium steel saw blade, and the laser engraver, an emitter with flawless emerald (Nether beryllium vein).
3. **Ore plant** (ours). Everything that follows consumes metal: chromium, vanadium, nickel, manganese, silver and gold. The plant processes whole ores and distributes the secondary outputs.
4. **Kanthal and steels.** Ruby (deep redstone vein) → electrolysis → chromium and aluminium; aluminium gets a second route: bauxite from the mica vein → MV electrolysis (60 EU/t: 15 bauxite → 6 aluminium + 9,000 mB of O₂; no rutile since v0.5.0: titanium only comes from the Moon). Kanthal (iron + aluminium + chromium, cupronickel EBF at 1,800 K) → MV chemical bath → wire → Kanthal coil (2,700 K). Vanadium steel (vanadium + chromium + 7 steel) and stainless steel (6 iron + chromium + manganese + nickel, EBF at 1,700 K).
5. **Silicon and wafers.** 3 SiO₂ + 2 carbon → hot ingot (Kanthal EBF, 2,273 K, 120 EU/t, 2,000 mB of CO) → MV chemical bath. Boule: 32 silicon dust + 1 small GaAs dust (EBF at 1,784 K, circuit 2). MV cutter (16 wafers) → MV laser engraver (red lens = ILC, green = RAM) → cutter → chips.
6. **Renewable carbon.** MV greenhouse → logs and crops → pyrolysis (`gtceu:pyrolyse_oven`), brewery and fermentation → **biorefinery** (ours): ethanol, methanol, acetic acid, acetone, phenol, benzene, creosote.
7. **Oil and fuels.** GTM's MV fluid drilling rig → distillery → desulfurize with H₂ → mixer → diesel. Biodiesel from seed oil and methanol. MV generators.
8. **Polymers.** Ethanol + sulfuric acid → ethylene → PE; brine → chlorine → vinyl chloride → PVC; greenhouse rubber.
9. **Circuits.** Phenolic board (wood dust + glue) → good board (silver + persulfate or FeCl₃), diodes with GaAs, transistors (silicon + tin + PE), carbon resistors. ILC → basic integrated circuit → good integrated circuit (MV) → advanced integrated circuit (HV): 2 good + 2 ILC + 2 RAM + 4 transistors + 8 fine electrum wires + 8 annealed copper bolts (GTM arc, verify).
10. **The End (v0.5.0).** Blaze rods from the MV simulator → macerator → extractor (liquid blaze) → MV chemical bath with a pearl (120 EU/t) → Eye of Ender → End Key → one trip for two ores of each vein → vein samples → MV vein drill with a vanadium steel drill bit and drilling fluid: aluminium ore, vanadium, chromite and gold, platinum and palladium, and zirconium.
11. **Exit.** See *Gate to HV*.

## Automatic resource generation

Same pattern as LV: a catalyst that is not used up, and inputs that come from another line. What MV needs still comes from the Overworld and the Nether.

### MV vein drill (family step)

- **Registration:** `gtceu:mv_vein_drill`, type `gtceu:vein_drilling`, the same pattern spec and the same vein table as LV (`lv/multis.js` and `lv/vein_drilling.js`); no tiered builder from GTM, as with LV.
- **Decision (v0.5.0): the End moves to MV** (DECISIONS.md, 2026-10-24: this way HV only opens the Moon). The blaze (MV simulator) and the Eye of Ender chemical bath (120 EU/t) are MV; the End recipes with vanadium steel drill bit and drilling fluid are in `vein_drilling/mv/` (`hv/family_vein_drilling.js`). The trip is worth it: bauxite with aluminium ore, magnetite with vanadium, chromite and gold, sheldonite with platinum and palladium, and zirconium. No ilmenite (Moon) or scheelite (Mars); naquadah and pitchblende wait for IV.
- **Gains over LV:** the same parallel modifier (`bores`: voltage ÷ 8 EU/t) with a cap of 16 instead of 8. One MV hatch (128 EU/t) fills all 16 runs: ×6 over steam, and twice what LV gets with two hatches. And a vanadium steel drill bit (`grindless:vanadium_steel_drill_bit`, ~1% per cycle; ~0.5% with drilling fluid) made from vanadium and chromium from the ore plant: the drill pays for its own bit. If balance asks for less, the cap is 8, and the gain drops to one hatch and the bit.
- **Closes the loop:** vein sample and water as in LV. Stone dust stops being surplus: drilling fluid (LV) and the rest to the centrifuge (see *Base fluids, salt and stone*).

### Oil and gas: GTM's fluid drilling rig

- **Decision:** `gtceu:mv_fluid_drilling_rig` is used as is, not one of ours. It already has prospecting, deposits (`oil_deposit`, `raw_oil_deposit`, `light_oil_deposit`, `heavy_oil_deposit`, `natural_gas_deposit`, `salt_water_deposit`) and a cost that crosses lines: MV hull, 4 steel frames, 4 circuits, 4 motors, 4 pumps and 4 vanadium steel gears.
- **What gets fixed:** `worldgen.oreVeins.infiniteBedrockOresFluids: true` in `config/gtceu.yaml` (the vein never runs out and nobody has to relocate) and, through data, own deposits for `grindless:flat` and `grindless:void` (GTM fluid vein event, verify). Searching is a one-off survey: if there is gas or salt water under the base, the rig moves only once.
- **Why not one of ours:** with infinite veins, a deposit sample gains nothing and would force you to get the first drop of crude.
- **Closes the loop:** it only uses EU. Oil sands (`oilsands_vein`) also give 2,000 mB of heavy oil per dust in the centrifuge (30 EU/t), a backup source (verify that the rig delivers that ore).

### MV greenhouse

- **Registration:** `gtceu:mv_greenhouse`, type `gtceu:greenhouse`, the same spec as LV and `bores` with a cap of 16. Fertilizer per circuit and the same crop table: logs, rubber resin, sugar cane, potatoes, mushrooms and berries for pyrolysis, biomass and rubber.
- **Decision:** no separate tree farm: the greenhouse already gathers logs, resin and crops, and there are no steps to join.
- **Gains:** cap of 16 and an optional CO₂ input (200 mB per cycle): +50% output, and it returns 100 mB of O₂, which goes back to the EBF. CO₂ stays inert and can be drained (LV decision 9); the greenhouse and the methanol recipe (`methanol_from_dioxide`: 6,000 mB of H₂ per 1,000 of CO₂) give it a use. It comes from the arc furnace and from distilling wood gas and fermented biomass.
- **Closes the loop:** sapling or seed at no cost, water from the pump, fertilizer from chemistry. Logs and crops feed pyrolysis, biomass and rubber.

### Creatures

- `gtceu:mv_creature_simulator` already exists: `lv/creatures.js` registers the simulator from LV to EV. `mobs.json` has the creeper in MV (4 gunpowder per 1 saltpeter, 120 EU/t) and the blaze in HV (rods, 480 EU/t). MV needs no new model.
- No blaze in MV: in GTM, blaze powder comes from an HV chemical reactor (carbon + sulfur, 480 EU/t), and the simulator's rod is also HV. The MV EnderChests only need the pearl from the LV simulator; the Eye of Ender (HV emitters and sensors, End portal) is left for HV.

### Base fluids, salt and stone

- **Air, N₂ and O₂:** LV. N₂ speeds up pyrolysis (320 t instead of 640, at 96 EU/t).
- **Water and distilled water:** pump and distillery (`distill_water_small`, circuit 5). Distilled water is the washing and cooling medium for hot ingots.
- **Salt:** brine from the `salt_water_deposit` (fluid drilling rig) or salt vein + water (mixer) → LV electrolysis: 3 NaOH + 1,000 mB of Cl₂ + 1,000 mB of H₂ per 1,000 mB of brine. H₂ and O₂ also come from electrolyzing water.
- **Stone:** stone dust goes to drilling fluid (LV) or to `stone_dust_separation` (MV, 120 EU/t): quartzite, feldspar, marble, biotite, sodalite and mixed metal. The mix is kept: separating it is an EV job (900 EU/t).
- **Closes the loop:** salt, sulfur, wood, oil and water come from the drilling rig, the greenhouse and the pump. Everything else is just EU.

## Our multiblocks

### Ore plant: `gtceu:ore_plant` (the era's main one)

What it gains: **several steps in one, with none skipped**. It runs the full GTM chain (macerate, wash, thermal-centrifuge, macerate) in one pass and delivers all secondary outputs. With one hatch it processes 3.6 ores/min: the same as ten loose machines (4 macerators, 3 ore washers and 3 thermal centrifuges) with their buses and one sorter per secondary output.

- **Recipe type:** `gtceu:ore_processing` (new, check for id clashes).
- **Recipe:** 1 raw ore (`raw_*`) + 2,000 mB of water (or 200 mB of distilled water with circuit 2) → 2 dusts + the three secondary outputs of the GTM chain with their chances (≈80%, ≈67% and ≈28%) + 4 stone dust (the tailings). Chain energy, with no discount: 1,000 t at 40 EU/t (the loose chain uses 39,200 EU per ore). The LV parallel modifier (`bores`, cap 6) does the rest: one MV hatch (128 V) runs 3 ores at a time, and two hatches run 6 (240 EU/t). They are generated from GTM's `OreProperty`, with no table of their own. Ores with their own reagent (persulfate, mercury) request it through a fluid hatch.
- **Structure:** 7×3×4 hall with three stations: crusher (2 `gtceu:steel_gearbox`), washing (glass and fluid hatches) and furnace (`gtceu:heatproof_machine_casing`). Casing `gtceu:solid_machine_casing` ≥ 28, 1–2 MV energy hatches, input bus, 2 output buses and 2 fluid hatches (water and reagent).
- **Built from what it replaces:** MV hull + macerator, ore washer, thermal centrifuge and MV centrifuge (`gtceu:mv_macerator`, `mv_ore_washer`, `mv_thermal_centrifuge`, `mv_centrifuge`) + 4 MV circuits.
- **What it does not do:** gem ores (they still go to the sieve), electromagnetic separation (HV) and the chemical bath for special ores.
- **Why it is not a big cube:** (1) its recipe type does not exist in any single-block machine (ore + water → dusts + secondary outputs + tailings); (2) same output and same energy per ore as the chain: it gains steps, buses and space, not throughput per EU; (3) it needs conditions (water, reagent, destination of the tailings and of each secondary output), not quantity.
- **Byproducts:** stone dust (inert): drilling fluid or `stone_dust_separation`. Secondary outputs: each goes to its own line. If the bus fills up, the plant stops: the tailings are not forgotten.

### Biorefinery: `gtceu:biorefinery` (second, cuttable)

What it gains: **throughput and several steps in one**. The distillery yields one fraction per pass, and the rest is never produced. The biorefinery is a layered column that collects all of them, but only from organic inputs; crude oil and liquid air belong to GTM's tower in HV (EV circuits).

- **Recipe type:** `gtceu:bio_distillation` (new), generated from the `gtceu:distillation_tower` recipes with organic input: charcoal byproducts, tar, vinegar and wood gas, biomass (also fermented), seed oil, creosote, tar and coal gas, dilute acids. Same proportions; EU/t ≤ 120 with the same energy per recipe, no bonus.
- **Structure:** 3×3 tower with 4–8 layers, `gtceu:solid_machine_casing` casing and `gtceu:steel_pipe_casing` pipes, one output hatch per layer, an input hatch, an output bus (fertilizer, wood dust), MV energy. It uses GTM's tower class (verify from KubeJS).
- **Why it is not a big cube:** the distillery has 1 output and the column up to 8, and it does not simplify anything: it forces a destination for each fraction. That is where the lines cross.
- **Later:** in HV, GTM's tower does the same and more; the biorefinery stays as the cheap version. Without it, the fractions come out of the distillery one per pass.

### Engine test stand: `gtceu:engine_test_stand` (the road to the first rocket)

What it gains: **a recipe that is impossible at small scale**. No machine does a static fire, and no rocket flies with an untested engine. It is the first step of the first rocket (`docs/journey.md`: MV sets up the stand and the radio telescope, HV flies to the Moon): its MV job is the part the HV engine will request, and in HV the same stand tests the whole engine (see `hv.md`, *The first rocket*).

- **Recipe type:** `gtceu:static_fire` (new). The part under test enters through the bus, the fuel and oxidizer through the tanks, and the exhaust leaves as CO₂ and water, each through its own hatch.
- **MV, the thruster cluster:** 4 GTM power thrusters (`gtceu:power_thruster`: MV motor, aluminium, steel rotor) + 200 mB of RP-1 + 300 mB of O₂ → 4 qualified thrusters (`grindless:qualified_power_thruster`) + 200 mB of CO₂ + 200 mB of water. 300 t at 120 EU/t. The four for one engine ignite together, like the engines of one stage.
- **The fuel is MV's:** RP-1 is rocket kerosene (diesel → kerosene → RP-1, two passes through the distillery with circuit 23 at 120 EU/t; GT-- recipes). Kerosene and oxygen burn to CO₂ and water. The refinery, the reformer and the rocket fuel are HV and are not needed here. If GT-- left the pack, the test would burn diesel.
- **Structure:** 5×6×5. Base of frost-proof aluminium casing around a pit of refractory brick (`gtceu:firebricks`); the pit runs through the stand under the engine and opens to the air on both sides. Four aluminium frame legs in the pit, the engine mount (heat-proof casing) hanging between them over the pit, and the feed line (steel pipe casing) coming down from the tanks, which sit on top (aluminium casing, cryogenic like a LOX tank). At the base: 1–2 energy hatches, an input bus, an output bus and 2 output hatches (CO₂ and water); on the tanks, 1–2 input hatches (fuel and oxidizer).
- **Controller:** MV hull + 2 MV pumps (feed the tanks) + 2 MV sensors (telemetry) + 4 MV circuits, in the crafting table.
- **Byproducts:** CO₂ → MV greenhouse (+50% and O₂ back) or methanol; water → back to the pumps, or thrown away (inert).
- **Why it is not a big cube:** its recipe type does not exist in any machine, gives no parallels or discount, and needs two fluids and two destinations for the exhaust.
- **Decisions taken (road to the rocket, 2026-10-24):**
  1. The stand is MV's, as the trip table says, and its first job is MV's: it qualifies the thrusters the HV engine will request. It does not move to HV.
  2. Thrusters are qualified four at a time (one engine), with no randomness: nothing breaks in the test.
  3. MV's fuel is GT--'s RP-1 with oxygen; GTM's rocket fuel (dimethylhydrazine) is left for HV.
  4. The exhaust goes to two mandatory hatches: CO₂ and water each have a destination.

### Radio telescope: `gtceu:radio_telescope` (road to the first rocket)

What it gains: it is the only machine that makes the **Lunar Landing-Site Chart** (`grindless:lunar_landing_chart`), the chart for the first trip to the Moon at the end of HV. It is the third step of the observatory family (`docs/journey.md`), and it gains sky: radio goes through clouds and rain.

- **Recipe type:** `gtceu:radio_astronomy` (`startup_scripts/grindless/observatory/machines.js`, recipes in `server_scripts/grindless/observatory/recipes.js`).
- **Recipe:** the photographic map and the LV ephemerides, which are not used up, + 2 paper → 1 Lunar Landing-Site Chart. 120 EU/t and 600 ticks (30 s).
- **Conditions:**
  - at night: the Minecraft Moon only shows up at night, and with the ephemerides the antenna finds it even when clouds cover it;
  - no storm (storm level below 0.2): lightning hides the radar echo;
  - rain is fine.
  - If a storm arrives halfway, it waits and does not lose the work already done.
- **Structure** (11 × 3 × 5):
  - three 3 × 3 aluminium frame antennas, with the rim one block higher than the center (a mesh bowl), each on a frame pillar;
  - a lightning rod at the focus of each antenna (the horn);
  - a run of aluminium frames along the ground to the hut;
  - the hut, 5 × 2 × 2 of frost-proof aluminium casing, with the controller and the parts: 1 or 2 energy hatches (MV), an input bus and an output bus.
- **Controller:** aluminium frames, one MV emitter (the radar), two MV sensors (the receivers), the MV hull, MV circuits and aluminium plates.
- **The chart is not used up and can be copied:** chart + paper + coal dust → 2.
- **The rocket:** the chart is recommended as an ingredient that stays in the crafting grid (`keepIngredient`) in the recipe for GCYR's identification chip (`gcyr:id_chip`), which carries the flight destination. The orchestrator wires it up when the Moon arrives; this multiblock does not touch GCYR.
- **Decisions taken (radio telescope, 2026-10-24):**
  1. Each step in the family relaxes one sky condition: steam asks for night, clear sky and altitude; LV, night and clear sky; MV, night and no storm.
  2. The lightning rods are the antennas: they draw in storm lightning, exactly when the radio telescope is not working.
  3. The chart's name includes the site (`lunar_landing_chart`), so charts for other sites do not clash with it.

### Discarded

- **Big cubes** (GCYM and Star Technology's `t_large_*`): speed only. GTM brings the GCYM in IV.
- **Universal factory** (GTL): joining machines of any type would erase the lines that give MV its identity (circuits, polymers). Reconsidered on 2026-10-25 as a convenience that keeps every step (see *Convenience*, below).
- **Pressure and vacuum system** (GCYS): needs Java and its own networks. If needed, it comes in HV with the cracker.
- **Multiblock combustion engine** (gap between LV and EV in GTM): 16 MV generators give 2,048 EU/t with about 85 mB/s of diesel. Not needed.
- **GTM bedrock ore miner** (`gtceu:mv_bedrock_ore_miner`): off by default (`doBedrockOres`) and with no bedrock veins. Our vein drill already does that job with a vein sample.

## New process lines

| Line | Steps | Byproducts → destination |
|---|---|---|
| Silicon → chips | sand → SiO₂ (electrolysis, 8 sand per dust) and coal → carbon (centrifuge) → Kanthal EBF → chemical bath → boule → cutter → engraver → ILC and RAM | CO (2,000 mB per ingot, 64,000 per boule): methanol (`methanol_from_monoxide`: 4 H₂ per CO, 96 EU/t) or tank (toxic: it is contained, not drained). Ash (1/9): fertilizer |
| Pyrolysis → fractions | 16 logs → pyrolysis oven (the circuit picks the fraction; with N₂ it runs twice as fast) → biorefinery | Charcoal (20 per batch): resistors, gunpowder and activated carbon (with N₂), the suit filter. Creosote: lubricant (`distill_creosote`) or boiler. Phenol, benzene, toluene and xylene: tanks for HV–EV (epoxy, SBR, gasoline); the surplus goes to a gas turbine or generator. Methanol: biodiesel and methyl acetate. Acetic acid and acetone: glue (vinyl acetate → PVA) for the phenolic board. Wood gas: gas turbine (24 EU/mB) or distillate (methane to the turbine, CO₂ to the greenhouse or to methanol). Dark ash (50% of the coal): centrifuge to ash and carbon (the carbon goes back to silicon) or fertilizer |
| Fuels | crude → distillery (one fraction per pass; the HV tower collects them all) → fractions with sulfur → desulfurize with H₂ (LV reactor) → 5,000 of light + 1,000 of heavy → mixer → 6,000 of diesel. Biodiesel: seed oil + methanol + sodium hydroxide | H₂S: sulfuric acid (`sulfuric_acid_from_sulfide`). Refinery gas: gas turbine (160 EU/mB) or distillate (methane, ethane, helium). Naphtha: generator (320 EU/mB) or tank for the HV cracker. Biodiesel glycerol: stored for HV (with CO₂ it gives ethylene). Diesel 480 EU/mB, biodiesel 256, ethanol 192 |
| Ethylene → PE and PVC | biomass (brewery) → distillery → 600 mB of ethanol per 1,000; ethanol + H₂SO₄ → ethylene (120 EU/t) → PE; 2 Cl₂ + ethylene → vinyl chloride → PVC | Dilute acid: distillery, 2/3 acid + water (loop). HCl: recycled (O₂ + HCl + ethylene → vinyl chloride). NaOH: bisulfate → persulfate (plates) or biodiesel catalyst. H₂: methanol and desulfurization. Wood dust from distillation (50%): phenolic board |
| Ore → plant | vein drill → plant (water) → dusts → alloys and EBF | Stone dust (4 per ore): drilling fluid or MV centrifuge. Secondary outputs: sulfur, gallium, indium, cobalt… each to its own line |

## Convenience (counted apart from rule 7)

GregTech Leisure ideas with our code (2026-10-25). They save space and buses, but no line loses a step.

- **Universal factories:**
  - `gtceu:universal_processing_factory`: 11 modes (bender, wiremill, lathe, cutter, extruder, compressor, forge hammer, forming press, polarizer, laser engraver, fluid solidifier);
  - `gtceu:universal_assembly_factory`: assembler and circuit assembler;
  - `gtceu:universal_separation_factory`: centrifuge, electrolyzer, thermal centrifuge, macerator, sifter, extractor, electromagnetic separator;
  - `gtceu:universal_mixing_factory`: mixer, chemical reactor, chemical bath, ore washer.
  
  Each one runs one mode at a time with the single blocks' own recipes, so the silicon and polymer lines keep every step. At most 4 parallels, each at its full EU/t, with the standard overclock and the tier from the energy hatches. A mode change takes effect when the run in progress ends. The structure is a 5×3×3 frost proof hall with a core per factory.
- **Advanced multi smelter** (`gtceu:advanced_multi_smelter`).
  - It merges different furnace recipes with the same cooking time into one run.
  - Parallels double every 900 K of coil (4 with cupronickel, 8 kanthal, 16 nichrome, 32 RTM), up to 64, each one costing one electric furnace.
  - GTM's HV multi smelter stays the bulk smelter.
- **Lava furnace** (`gtceu:lava_furnace`): it smelts using lava as heat, 10 mB per item, 8 at once, with no energy hatch. It never makes lava, because lava in a large boiler is worth far more than any melting cost.
- **Weather controller** (`gtceu:weather_controller`, Overworld only).
  - Circuit 1: clear for a day (4 calcium chloride).
  - Circuit 2: rain for half a day (2 salt).
  - Circuit 3: thunderstorm for 5 minutes (2 salt + 4 fine copper wire).
  
  The weather changes when a run ends. It helps with the sky conditions of the observatories and the heliostat.

## New crossings (complexity audit)

- **MV greenhouse, fermented biomass (circuit 3):** catalyst + 50 mB of fermented biomass from the biorefinery → ×2 the output, same time and EU/t, no fertilizer or CO₂ (`grindless:mv/<crop>_biomass`). This is the route for whoever already ferments and does not have the acid and CO₂ line.
- **MV vein drill, acid leaching (all veins):** drill bit + vein sample + 50 mB of sulfuric acid → the base yield and an extra 5% of the rarest ore in the vein (`grindless:mv/<vein>_vanadium_steel_acid_fluid`). With acid in the hatch, the base vanadium recipe gives way to this one.

## Gate to HV

| What is built | What it proves |
|---|---|
| HV hull (`gtceu:hv_machine_hull`: stainless steel HV casing, 2 PE plates, 2 gold cables) | stainless steel and PE plates come out of their own lines (the HV energy hatch is the first step of HV: it needs an assembler at 480 EU/t, an LPIC chip and a cleanroom) |
| 8 advanced integrated circuits (`gtceu:advanced_integrated_circuit`, `#gtceu:circuits/hv`) | silicon → boule → wafers → ILC and RAM, PE transistors, electrum, annealed copper and good board with glue run in batches |
| HV motor (stainless steel rods, double silver cable, double electrum wire) and HV pump (stainless steel tube, rubber rings) | a steady supply of alloys, silver and rubber |
| Full hazmat suit (`gtceu:hazmat_*`: PVC plates, rubber, lead, glass and a mask filter of PE and activated carbon) | the PVC line closes the HCl loop, and pyrolysis with N₂ gives the activated carbon |
| MV power plant of 2,048 EU/t or more (diesel, ethanol or gas), 2 battery buffers and an MV→HV transformer (4 A → 1 A) | "not cutting it close": HV fits with the buffer above 50% |
| Kanthal EBF with the boule running, and the plant with chromium and vanadium | MV really works |
| AE2 network with a 64k CPU that crafts the HV motor from patterns | AE2 is still the logistics |
| Ore, greenhouse, simulator, fluid drilling rig and plant running 10 minutes without touching them | generation holds up on its own |

It opens HV: HV hull and hatches, cleanroom (`gtceu:cleanroom`: HV hull, HV circuit, 3 filters, 2 stainless steel rotors and 2 HV motors), cracker (`gtceu:cracker`), large chemical reactor (PTFE pipes), large steel boiler and large steam turbine (HV circuits), distillation tower (EV circuits), HV vein drill (End) and HV greenhouse.

## Mods and integration

| Mod | Slug | Use in MV |
|---|---|---|
| Applied Flux | `appflux` | FE on the AE2 network; recipes with MV circuits and aluminium, EU→FE with GTM's converters |
| AE2WTLib and crafting terminal | `applied-energistics-2-wireless-terminals`, `ae2-wcwt` | wireless terminals: GT battery + MV circuit (lv.md sets this: MV) |
| EnderChests and EnderTanks | `enderchests`, `endertanks` | Ender pearl from the LV simulator (automatic source) + aluminium plates and MV circuit |
| Productive Bees | `productivebees` | hives with MV circuit; honeycombs via GT centrifuge and mixer, no direct ores |
| Sophisticated Backpacks and GregTech Storage Drawers | `sophisticated-backpacks`, `gregtech-storage-drawers` | tier 2: aluminium and steel plates |
| Create and Greate | `create`, `greate` | no changes: no MV recipe goes through Create |

No new mod is required: machines, recipe types and drill bits are KubeJS.

- **Startup:** types `gtceu:ore_processing` and `gtceu:bio_distillation`; machines `ore_plant`, `biorefinery`, `mv_vein_drill` and `mv_greenhouse` with the pattern helper; `bores` gets the cap per step (LV 8, MV 16, plant 6); item `grindless:vanadium_steel_drill_bit`. LV's `widen` sets `greenhouse` to 2 input fluids (water and CO₂) and 1 output fluid (O₂).
- **Server:** generate `ore_processing` from `OreProperty` and `bio_distillation` from the tower recipes with organic input; the vanadium steel drill bit goes into `BITS` in `lv/vein_drilling.js`; greenhouse variants with CO₂. Gate the mods in the table behind MV circuits.
- **Config:** `config/gtceu.yaml` already enables `compat.energy.enableFEConverters`; `worldgen.oreVeins.infiniteBedrockOresFluids: true` is added. GTM hazards (`gameplay.hazardsEnabled`, on by default) stay on: the suit is part of the gate.
- **Quests:** a chapter "MV Factory" with about 12, one per step, small reward and no recipe locks.
- **Tests:** (1) it starts; (2) the ore plant, biorefinery, vein drill and MV greenhouse form and process; (3) ore → dust + secondary outputs; logs → pyrolysis → fractions; sand → silicon → boule → wafers → HV circuit, and `-Tier mv` with no orphans.

## Risks and open questions

- **Ore plant.** About 100 recipes generated from `OreProperty`: secondary outputs that match in two stages, gem ores and ores with their own reagent, noise in EMI. The rate (3.6 or 7.2 ores/min) is set by power, and the drill always has spare capacity: if it falls short, add more hatches or more plants, never less energy per ore. Alternative: a table of its own, only for the exceptions.
- **Oil in Flat and Void.** The data-driven deposits and the infinite config are untested in our own dimensions. If they do not work, the deposit sample (our drill) becomes the route.
- **CO, H₂ and hazards.** Silicon gives off 64,000 mB of CO per boule, and methanol needs 4 H₂ per CO: the H₂ (from water electrolysis; the brine leaves plenty of chlorine) is sized to the silicon, or the CO goes into tanks. Methanol goes to biodiesel, methyl acetate and generators (64 EU/mB). The suit has to be introduced before the chemistry.
- **Biorefinery.** Reusing GTM's tower class from KubeJS is not verified (if it fails, outputs go to free hatches, with no layers), and in HV the tower takes over from it. It is the cuttable part of the scope.
- **Handed to HV.** The End (vein sample, portal), the Eye of Ender (blaze powder from the HV chemical reactor), the separation of the mixed metal (EV) and the stored glycerol must have an owner in the HV design.

Credits to add to `CREDITS.md`: ore plant (idea from GTMoreOreProcessing and GTE2, LGPL-3.0); controller as the sum of the machines it replaces, and CO₂ input in the greenhouse (ideas from Star Technology, MIT); biorefinery column (GTM tower class, LGPL-3.0); big cubes (Star Technology, GCYM) remain as discarded alternatives; the universal factory (GTL) entered on 2026-10-25 as a convenience (see `CREDITS.md`).

## Proposed decisions

1. **The End stays in HV.** The MV vein table is the LV one (Overworld and Nether).
2. **Oil with GTM's fluid drilling rig** and infinite veins via config. There is no fluid drill of our own.
3. **Two multiblocks of ours:** ore plant (the era's main one) and biorefinery (cuttable). Family steps: vein drill (parallel cap 16, open to balance) and MV greenhouse; the simulator is already the LV one.
4. **CO goes to methanol** (or to a tank), and CO₂ stays inert: the greenhouse and `methanol_from_dioxide` give it a use, and the greenhouse returns O₂. There are no recipes of ours for burning CO.
5. **No blaze in MV.** In GTM, blaze powder comes from an HV chemical reactor, and the Eye of Ender is left for HV. Dark ash goes to the centrifuge (carbon for silicon) or to fertilizer.
6. **GTM hazards stay active**, and the hazmat suit is part of the gate.

## Decisions taken (orchestrator, 2026-10-24)

The six proposals are approved, with these clarifications:

- **EBF in MV:** Kanthal and stainless steel need 480 EU/t in the EBF, so the MV EBF takes **two MV hatches** (they step up one tier, as the two LV hatches did for aluminium). This must be stated in the route and in the quests.
- **Maintenance:** disabled across the whole pack (see `DECISIONS.md`). GTM multiblocks do not ask for a maintenance hatch.

- **Oil in Flat and Void.** If GTM's data-driven deposits do not work in our own dimensions, a deposit sample is used with our drill (same family as the veins). No new fluid drill is added.
- **Productive Bees in MV.** Honeycombs only give materials through GT machines (centrifuge and mixer). No bee gives ores, ingots or dusts directly. It is a second way to automate, not a shortcut.
