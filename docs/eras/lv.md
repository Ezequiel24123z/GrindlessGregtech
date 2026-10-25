# LV era

The first electric factory: cables, single-block machines, small chemistry, centrifuging, ore washing and the first real circuits. Resources become electric and faster, AE2 unlocks in full, and the era ends when MV can be powered without cutting it close.

You enter with what steam leaves you: an LV steam turbine (`gtceu:lv_steam_turbine`), the first LV circuit, an LV machine hull and tin cable with rubber.

## Route

1. **LV network.** Tin cable with rubber, LV machine hull (`gtceu:lv_machine_hull`), energy hatch (`gtceu:lv_energy_input_hatch`) and battery buffer (`gtceu:lv_battery_buffer_4x`). The Large Bronze Boiler (`gtceu:bronze_large_boiler`, about 800 mB/t of steam, verify) drives about 12 turbines (64 mB/t and 32 EU/t each) and also burns biomass and creosote.
2. **Single-block machines.** The LV motor, piston, pump, conveyor and robot arm make the macerator, ore washer, centrifuge, thermal centrifuge, electrolyzer, mixer, chemical reactor, assembler, circuit assembler, forming press, polarizer, autoclave, chemical bath, packer, brewery, fermenter, distillery, gas collector and rock crusher (`gtceu:lv_<machine>`).
3. **Electric ore.** LV vein drill (ours) and the full line: macerate, wash, thermal-centrifuge and centrifuge.
4. **Plants and creatures.** LV greenhouse (ours) → biomass → creature simulator: bones, string, slime, wool, leather, feathers and ender pearls.
5. **Small chemistry.** Air → N₂ and O₂; Sulfur → Sulfuric Acid; Salt + acid → Sodium Bisulfate and HCl → Sodium Persulfate and Iron III Chloride; Creosote → Lubricant → Drilling Fluid.
6. **Real circuits.** Basic Electronic Circuits in batches, good board, Gallium + Arsenic → Diodes → Good Electronic Circuit.
7. **Arc furnace and AE2.** The Submerged Arc Furnace (ours) makes silicon, sky dust and obsidian. With quartz, silicon, sky and pearls you can build all of AE2.
8. **Aluminium.** Sapphire from a deep vein → LV electrolyzer → Aluminium → MV machine hull.
9. **Exit.** An LV power plant with spare capacity, an LV→MV transformer and the EBF running at 120 EU/t. See *Gate to MV*.

## Automatic resource generation

Every resource has a catalyst that is never used up, and inputs that come from another line. Nothing is collected by hand more than once.

### LV vein drill: our multiblock

- **Decision:** multiblock `gtceu:lv_vein_drill`, recipe type `gtceu:vein_drilling` and the same vein table as the steam drill. GTM ships `KJSTieredMultiblockBuilder`: one registration gives LV, MV and HV (verify usage from KubeJS).
- **Why not a single block:** (1) the steam rule is that no single block generates ore; (2) a block can be stacked without limit, while a tower needs room and a hull; (3) GTM already builds its drills this way (`gtceu:mv_fluid_drilling_rig`, `gtceu:mv_bedrock_ore_miner`).
- **Structure:** the steam drill's tower (3×3 base, 5–7 high) with frames and a steel hull, an LV energy hatch, an input bus (sample and bit), an output bus and a fluid hatch.
- **Beats steam:** a rough ×2 rate at about 30 EU/t, and **Drilling Fluid** (`gtceu:drilling_fluid`): +50% ore and half the drill bit wear. It works in any dimension, including Flat and Void, because the sample replaces the vein.
- **Closes the loop:** the sample is never used up; the steel drill bit wears out by chance (~4% per cycle, ~2% with drilling fluid); the water comes from the pump; the stone dust from the drill comes back as drilling fluid (1 dust + 20 mB of Lubricant + 4,980 mB of water → 5,000 mB, GTM recipe).

### LV greenhouse: the electric step

- **Registration:** `gtceu:lv_greenhouse`, recipe type `gtceu:greenhouse` (the steam one). 5×5×5, steel hull, glass, dirt floor and an LV energy hatch.
- **Gains:** ×2 rate and fertilizer per circuit (1 = base; 2 + fertilizer = double output in half the time). Adds mushrooms, flowers, berries and vines (biomass and dyes).
- **Fertilizer** (`gtceu:fertilizer`): LV mixer (dirt + 2 sawdust + 4 sand + water → 4) or chemical reactor (calcite, apatite, TCP or ashes with sulfur or phosphate). It is the honest destination for the arc furnace's ashes and for the apatite.
- **Closes the loop:** the sapling or seed is never used up; water comes from the pump; the fertilizer comes from chemistry; the leftover biomass goes to the large boiler.

### Creature drops: own recipe type, no HNN

- **Chosen:** recipe type `gtceu:creature_simulation` and machine `gtceu:lv_creature_simulator` (one block, LV–EV).
- **Why not Hostile Neural Networks** (MIT, 1.20.1): (1) it uses FE and sits outside GT's recipes: no programmed circuit, hatches or EMI category; (2) its models are trained by killing, and we would have to rewrite them, as Monifactory did; (3) with a recipe type of our own, models and drops live in one table (`mobs.json`), and every cycle consumes real inputs; (4) one dependency fewer.
- **Recipe:** model (`grindless:creature_model_<id>`, never used up) + biomass + the creature's mineral + programmed circuit (picks the roll). Biomass is 25 mB per 10 s cycle at LV, 50 for the enderman and the creeper, and 100 for the blaze: a fermenter of the same tier feeds a simulator. The drops come out; the biomass is consumed and there is no by-product.
- **Models:** the assembler prints them from a blank model and 8 units of the mineral they later consume. Nobody kills anything.

| Model | Mineral per cycle | Output (rough, 10 s at 30 EU/t) |
|---|---|---|
| Skeleton | 1 TCP (apatite vein) | 4 bones |
| Spider | 1 Sulfur | 6 string |
| Slime | 1 Raw Rubber (greenhouse) | 4 slimeballs |
| Sheep | nothing | 4 wool |
| Cow | nothing | 2 leather and 2 raw beef |
| Chicken | nothing | 4 feathers and 1 egg |
| Enderman | 2 Obsidian Dust | 1 ender pearl (20 s) |

- **Starting pearl:** GTM asks for pearls already at LV (LV Field Generator, drain covers), and their synthesis is HV and needs beryllium, which only exists in the Nether. The Enderman model is the only one that asks for 1 real pearl (quest "First Pearl" (translated from Spanish) or a one-off hunt); from there they multiply.
- **Closes the loop:** the model is never used up; biomass from the greenhouse; minerals from the vein drill.

### Base fluids

- **Water:** the steam-era Primitive Pump and `gtceu:lv_pump`. In Flat and Void the biome counts (use plains).
- **Air:** `gtceu:lv_gas_collector` (10,000 mB per 200 t at 16 EU/t) and a centrifuge: 3,900 mB of N₂ + 1,000 mB of O₂. The rest of the air is inert and is vented.
- **Lava:** placed once next to the rock crusher (it is never used up). It is not manufactured: burned in a boiler it would yield more energy than it costs.
- **Obsidian:** arc furnace (cobblestone melted and quenched with water). It goes into sky dust.
- **Salt and salt water:** mixer (salt + water) and electrolyzer.
- **Oil:** none at LV (GTM's fluid drilling rig is MV). LV's fuel is whatever the boilers burn: biomass, coke and creosote.
- **Closes the loop:** the collector and pump only use EU; the lava is placed once.

### Stone, sand, gravel and clay

- **Stone and cobblestone:** LV rock crusher (andesite, granite and diorite move on to MV; obsidian, to HV).
- **Gravel and sand:** LV forge hammer (cobblestone → gravel → sand, 16 EU/t), macerator (sand → Quartz Sand) and LV sifter (`gtceu:lv_sifter`: gravel → Flint).
- **Clay:** its own "sediments" (translated from Spanish) entry in the vein table (clay, red sand, flint). It is only needed for bricks and ceramics.
- **Closes the loop:** everything comes from rock, water and EU.

## Our multiblocks

### Submerged Arc Furnace: `gtceu:submerged_arc_furnace` (this era's)

What it gains: **recipes that are impossible at small scale**. In GTM, silicon needs 2,273 K and 120 EU/t (EBF with Kanthal, MV), and no LV block reduces oxides. This furnace reduces at LV with two hatches (2 A).

- **Recipe type:** `gtceu:arc_smelting` (new).
- **Structure:** 3×3×4, Heat Proof Invar Machine Casing (`gtceu:heatproof_machine_casing`, verify) ≥ 12, a one-block chimney with a muffler hatch, 2 LV energy hatches, an input bus (material and electrodes), an output bus and a fluid hatch.
- **Electrodes:** `grindless:graphite_electrode` (graphite from the diamond vein, LV lathe). They wear out by chance (~3% per cycle), like the drill bits.
- **Recipes** (rough, 64 EU/t and 200–300 t):
  1. **Silicon:** 3 Quartz Sand + 2 Coke Dust → 1 Silicon Ingot, Ashes (1/9) and 2,000 mB of CO₂ up the chimney.
  2. **Impactite:** 4 Obsidian Dust + 4 Quartz Sand + 1 Charged Certus Quartz Crystal → 4 Sky Dust (`ae2:sky_dust`). It is rock melted by an impact, like tektites.
  3. **Obsidian:** 32 cobblestone + 4,000 mB of water → 4 obsidian (melted and quenched).
- **Why it is not a big cube:** no single-block machine has these recipes, and they need conditions (two hatches, electrodes, a chimney), not quantity. In MV the EBF with Kanthal will reach silicon by another route.
- **By-products:** CO₂ is inert and is vented (with circuit 2, CO comes out into a tank, useful in MV for methanol); the ashes go to fertilizer; the stone slag goes to drilling fluid.

### LV vein drill (second multiblock)

Same family as the steam drill, described above. It gains rate and yield from a new input, the drilling fluid, which links to its own by-product. It is the size of the steam tower. It is not "the same recipe in a bigger cube" (translated from Spanish): it is a step up the family, with other power and another material loop.

### Sulfide Roaster: `gtceu:sulfide_roaster` (reinforced LV)

What it gains: **steps, heat recovery and silver at LV**. GTM roasts sulfides in the EBF with 3,000 mB of oxygen separated by dust (120 EU/t, 120 t, 1,200 K) and leaves the SO₂ for two more chemical reactors (SO₂ + O₂ → SO₃; SO₃ + water → acid). At LV the oxygen comes from the air centrifuge (1,000 mB per 10,000 of air in 80 s): a single roast in a row would need about 40 centrifuges. The roaster does everything in one cycle and with air.

- **Recipe type:** `gtceu:sulfide_roasting` (`startup_scripts/grindless/lv/sulfide_roaster.js`, recipes in `server_scripts/grindless/lv/sulfide_roaster.js`).
- **Structure:** 5 × 7 × 3. A heat-proof casing furnace on four steel legs, a grate of Steel Firebox Casings (GTM lights them while it works), a fluidized bed (air) and a steel contact tower on top. Exactly 2 energy hatches, 1 input bus, 2 input hatches (air and water), 1 output bus and 2 output hatches (acid and steam).
- **Recipes.** The GTM EBF recipes, with the same solids, the same energy and the same time (30 V × 4 A = 120 EU/t, 120 t). They were read from the 0.4.1 dump and from `MachineRecipeLoader`, and the in-game test compares them with the EBF.

  | Ore | Solids (same as EBF) | Acid (mB) | Steam (mB) | Air (mB) | Water (mB) |
  |---|---|---|---|---|---|
  | Sphalerite | Zincite + 1/9 Ashes | 1,000 | 3,200 | 15,000 | 1,020 |
  | Pyrite | Hematite + 1/9 Ashes | 2,000 | 6,400 | 15,000 | 2,040 |
  | Galena | Massicot + 6 Silver Nuggets | 1,000 | 3,200 | 15,000 | 1,020 |
  | Stibnite | Antimony Trioxide + 1/9 Ashes | 1,500 | 4,800 | 15,000 | 1,530 |
  | Tetrahedrite | Cupric Oxide + 3 pinches of Antimony Trioxide | 2,000 | 6,400 | 15,000 | 2,040 |
  | Sulfur (burner) | — | 1,000 | 3,200 | 7,500 | 1,020 (30 EU/t, 60 t) |

- **Where the numbers come from:**
  - Air: the EBF's 3,000 mB of oxygen × 5, because air is one-fifth oxygen. The converter uses the oxygen left over from that air, as in a real plant, and the nitrogen leaves inert with the tail gases.
  - Acid: 1 mB per mB of the EBF's SO₂, with GTM's 1:1 water.
  - Steam: 3,200 mB per 1,000 of SO₂, plus its water at 1:160. Through an LV turbine, between 11% and 22% of the cycle's energy comes back.
  - The sulfur burner returns a little less than it uses: it is not an energy source.
- **Catalyst:** `grindless:contact_catalyst`. Vanadium (from the LV centrifuge of Vanadium Magnetite) + 4 Diatomite in the LV mixer → 4. It wears out by chance, in 2% of the cycles.
- **By-products and where they go:**
  - Zincite, massicot, antimony trioxide and cupric oxide → LV electrolyzer: Zinc, Lead, Antimony and Copper, and its oxygen goes back into the EBF's steel.
  - Hematite → any furnace: Iron.
  - Silver Nuggets → Silver Ingot, and from there to the solar tower's mirrors.
  - Ashes → fertilizer. Acid → GT chemistry. Steam → turbines.
  - SO₂ never leaves the machine.

### Heliostat Tower: `gtceu:heliostat_tower` (reinforced LV)

What it gains: **steam without fuel**. It is the first solar plant and the first step in the power family: heliostat tower → lunar solar field → orbital solar station → Dyson. No small LV machine draws steam from sunlight in quantity (GTM's solar boiler gives 120 mB per second).

- **Recipe type:** `gtceu:solar_steam` (`startup_scripts/grindless/lv/heliostat_tower.js`, recipes in `server_scripts/grindless/lv/heliostat_tower.js`).
- **Structure:** 7 × 11 × 7.
  - A 3 × 3 pump house with the controller in the doorway.
  - A steel lattice tower with the rising pipe inside.
  - On top, the receiver: 3 × 3 × 2 Steel Firebox Casings, which GTM lights while it works, and a mast.
  - Behind the tower, 28 Heliostat Mirrors in four rows of seven.
  - 1 energy hatch, 1 input hatch and 1 output hatch.
- **Recipes:** 50 mB of water or Distilled Water → 8,000 mB of steam every 10 t, that is, **800 mB/t**. It uses 16 EU/t (mirror motors and pump). No overclock or parallels: the field sets the rate, not the hatch.
- **The sun rule** (the one that will govern the bases on the Moon and Mercury):
  - A cycle only starts if the same test as GTM's solar boiler passes at the top of the tower (`GTUtil.canSeeSunClearly`: open sky, daytime, no rain or snow above, not in the End) and if all four corners of the field can see the sky. If not, the controller says "No sun on the receiver" (translated from Spanish).
  - GTM's daytime condition, which EMI shows, stops the cycle in progress at nightfall.
  - Deserts never rain. The Nether and the End never count as day.
- **Balance against the boilers:**
  - By day it gives what a Large Bronze Boiler at full fire gives (800 mB/t, 12.5 LV turbines), with no fuel or fuel line.
  - At night or in rain it gives nothing. On average, a little under half a boiler: a Minecraft day is a little less than half of the cycle.
  - The night is covered by the day's steam stored in GTM multiblock tanks. The steel one holds 1,000,000 mB, and a night of 10 turbines needs about 8 of them.
  - It costs 28 silvered mirrors (56 Silver Foils), plus the tower and the turbines.
- **Water:** 1 mB of water gives 160 of steam, as in the large boilers. The LV turbine returns 4 mB of Distilled Water for every 640 of steam, exactly what a cycle needs, so the water loop can be closed.
- **Mirror:** `grindless:heliostat_mirror`, in the LV assembler: Steel Plate, 2 Silver Foils, a Glass Pane and a Small Steel Gear. The silver comes from the galena vein or the roaster, so the two machines cross.

#### Decisions taken (reinforced LV, 2026-10-24)

1. Roasts copy GTM's EBF ones without changing their solids or energy. Only three things change: air instead of oxygen, acid instead of SO₂, and steam returned.
2. Air = 5 × the EBF's oxygen, and the converter uses the surplus, with no extra air.
3. The roaster also burns loose sulfur, like an acid plant, with a negative energy balance.
4. The contact catalyst is vanadium on diatomite and wears out by chance (2%), like the electrodes and drill bits.
5. Chalcopyrite, pentlandite and cobaltite are left out: the catalog asked for these five, and cobaltite yields arsenic trioxide, which would have to be contained.
6. The solar tower gives 800 mB/t by day, with no overclock.
7. The sun is checked with GTM's solar boiler function plus the corners of the field. Rain only counts in biomes where it rains or snows.
8. The tower has no storage of its own: the night is covered by GTM's multiblock tanks.
9. The mirror is its own block with its own model and textures, and it uses silver.

### Optical Observatory: `gtceu:optical_observatory` (reinforced LV)

What it gains: it is the only machine that makes the **photographic lunar map** (`grindless:lunar_map`) and the **lunar ephemerides** (`grindless:lunar_ephemeris`). It is the second step in the observatory family (`docs/journey.md`), and it gains sky: height is no longer needed.

- **Recipe type:** `gtceu:astrophotography` (`startup_scripts/grindless/observatory/machines.js`, recipes in `server_scripts/grindless/observatory/recipes.js`).
- **Recipe:** the Lunar Chart (Draft), which is never used up (it is the chart you navigate by) + 4 Photographic Plates + 2 paper → 1 Photographic Lunar Map + 1 Lunar Ephemeris. 30 EU/t and 600 ticks (30 s).
- **Photographic Plate** (`grindless:photographic_plate`): LV assembler, 2 Glass Panes + 1 small pile of Silver Dust (the emulsion) → 2 plates, 16 EU/t and 100 ticks. The silver comes from the galena vein or the roaster.
- **Conditions:** at night with a clear sky, at any height (long exposures beat the haze). If it rains partway through, it waits and keeps its progress.
- **Structure** (5 × 6 × 5):
  - a floor ring of Solid Steel Machine Casing with the parts: 1 or 2 energy hatches, an input bus and an output bus;
  - two courses of stone brick wall, with the controller at eye level;
  - a stepped dome of steel casing with the shutter slit open: its two cells must stay empty;
  - inside, the refractor: brick base, steel frame, a Steel Gearbox Casing (the tracking motor), two steel pipes poking out through the slit and a glass pane on top.
- **Controller:** glass, an LV sensor (the plate holder), two LV motors (the tracking), the LV machine hull, LV circuits and steel plates.
- **The charts are never used up.** The Radio Telescope (MV) reads the map and the ephemerides without using them up. Hand copies: map + photographic plate → 2 (a contact print) and ephemeris + paper + coal dust → 2.

#### Decisions taken (optical observatory, 2026-10-24)

1. The map and the ephemerides come from the same observation: it is one night of work, not two.
2. The Lunar Chart (Draft) is never used up. If the player loses the map, they do not have to go back to steam.
3. The dome is steel casing and the walls are stone brick: about 30 casings, like the LV greenhouse, so the structure is not a wall of raw quantity.
4. The slit must be open (air): it is the shape of the observatory, not a cost.

### Rejected

- **Multiblock steam engine.** It is a real gap in GTM (there is no multiblock generator at LV or MV). Dropped: LV is covered by the large boiler and the turbines, and GTM ships large turbines at EV. If it were needed, it would enter at MV with processed fuel, not raw.
- **Ore plant** (macerate, wash and centrifuge in one). Left for MV or HV: at LV the chain has to be learned step by step.
- **Universal factory** (several machine types on one controller). Too early: there are no chains yet that justify joining them.

## AE2 at LV

AE2 15.4.11 stays as it comes (channels 8/32). How it is made changes: the Inscriber and the Charger are removed (blocks and recipes `ae2:inscriber` and `ae2:charger`), along with AE2's crafting recipes, and each family goes through an LV GT machine from a single table (`ae2_gt.json`). Network blocks take an LV machine hull as their body, like a GT machine. The cost is complexity (quartz, silicon, sky, pearls); the amounts are AE2's: a 256k component costs 121 processors (81 logic and 40 calculation), ~360 certus crystals and 121 silicon. It is the end goal of LV.

| AE2 item | GT machine | Key inputs |
|---|---|---|
| Certus Quartz Crystal (`ae2:certus_quartz_crystal`) | macerator (steam) → `lv_centrifuge` → `lv_autoclave` | sand → Quartz Sand → Certus Quartz Dust (25% per 2 sand, GTM recipe) → crystal with water |
| Charged Certus Quartz Crystal | `lv_polarizer` (new recipe) | Certus Quartz Crystal, EU only (replaces AE2's charger) |
| Fluix Crystal | `lv_mixer` | Charged Certus Quartz Crystal + redstone + quartzite or quartz + water → 2 |
| Dusts (certus, fluix, ender, sky) | macerator | crystal, pearl or block |
| Silicon | Submerged Arc Furnace | Quartz Sand + coke; outputs `gtceu:silicon_ingot` and is added to `forge:silicon` |
| Sky dust and sky stone | arc furnace; `lv_electric_furnace` (verify that it reads AE2's smelting recipes) | obsidian + sand + charged certus; dust → block → smooth |
| 4 presses | `lv_forming_press` | steel plate + certus, diamond, gold ingot or silicon |
| Printed calculation, engineering, logic and silicon | `lv_forming_press` | press (not consumed) + certus, diamond (deep vein), gold or silicon |
| Processors (3) | `lv_circuit_assembler` | printed item + printed silicon + redstone |
| Cores and cards | `lv_assembler` | cores: quartz (certus or quartzite) + fluix dust + logic processor; cards: gold, iron, redstone and processor |
| Quartz Glass, Quartz Fiber, fluix cable | `lv_assembler` | quartz dust + glass; fiber + fluix |
| Controller | `lv_assembler` | LV machine hull + 4 smooth sky stone + 4 fluix + engineering processor |
| Drive, interface, pattern provider, terminals, buses, monitors, emitters, P2P | `lv_assembler` | LV machine hull (blocks) or steel plate (parts) + cores or processors |
| Components 1k to 256k | `lv_assembler` | 1k = logic + certus + redstone; each step = 3 of the previous one + calculation + quartz glass + dust (glowstone; sky dust at 256k) |
| Item and fluid cells, housings | `lv_packer` | housing (quartz glass, redstone, iron or copper) + component |
| CPUs: unit, storage 1k to 256k, coprocessor, monitor | `lv_assembler` | unit + component or engineering processor |
| Molecular Assembler | `lv_assembler` | LV machine hull + formation and annihilation cores + quartz glass |
| Energy: energy cell, dense energy cell, energy acceptor, vibration chamber | `lv_assembler` and `gtceu:lv_1a_energy_converter` (verify) | certus + fluix + glass; EU→FE at 4 FE per EU |
| Fluix pearl, receiver, access point, wireless booster | `lv_assembler` | ender pearl (simulator) + fluix dust |
| Spatial (components, pylon, port, anchor) and quantum (link, ring) | `lv_assembler` | fluix pearls + processors; the singularity comes out of AE2's Condenser and gets entangled in AE2's ritual (an explosion) |
| Budding crystal | in the world, with water | charged certus + block; optional as a farm |
| Tools, paints, memory card | `lv_assembler` | certus or fluix crystals + iron |

- **Network power:** EU→FE converter + energy acceptor, or a vibration chamber with coke. The hand crank only serves to get started.
- **Presses without meteorites:** they are stamped in the forming press with a steel plate and the material they later print (certus, diamond, gold, silicon). The LV laser engraver is left out: its wafers are MV.
- **No shortcuts:** the meteorite presses are switched off (AE2 config, verify `spawnPressesInMeteoritesEnabled`) and the "silicon from certus dust" (translated from Spanish) is removed.
- **Inert sink:** AE2's Condenser accepts surplus stone dust and gravel.
- **Later:** ExtendedAE and AdvancedAE (HV–EV), Applied Flux and AE2WTLib (MV), MEGA Cells (IV, beyond 256k) and GTM's ME hatches (EV).

## New process lines

| Line | Steps | By-products → destination |
|---|---|---|
| Complete ore | raw ore → macerator → ore washer (water; Sodium Persulfate with bauxite, sphalerite, stibnite and ilmenite) → thermal centrifuge → macerator → centrifuge | stone dust: inert (drilling fluid, condenser or thrown away); secondaries (14% when macerating, 1/3 when washing): each to its own line (Gallium, Sulfur, Zinc, Iron, Aluminium) |
| Sapphire → Aluminium | sapphire vein (deep, steel drill bit) → dust → `lv_electrolyzer` (30 EU/t); the ore also gives Aluminium as a secondary (14%) | O₂: for the EBF's steel; Green Sapphire: same route; Almandine and Pyrope: dust stored, their electrolysis is MV |
| Salt → persulfate and FeCl₃ | Sulfur + O₂ → SO₂ → SO₃ → H₂SO₄; Salt + H₂SO₄ → Sodium Bisulfate + HCl; Sodium Bisulfate → Sodium Persulfate; Iron + HCl → FeCl₃ | H₂ (from the persulfate and the FeCl₃): tank, MV destination (methanol, ammonia), flammable, not vented; surplus HCl: tank |
| Gallium + arsenic → diodes | washed bauxite → thermal centrifuge → macerator (14% Gallium); Realgar → electrolysis → Arsenic and Sulfur; mixer → GaAs; assembler → Diode | Sulfur: acid and creature simulator; Antimony and barite from the Realgar: stored |

GTM's stone dust is separated at MV (`stone_dust_separation`, 120 EU/t). KubeJS brings it down to LV to meet what steam.md says.

## New cross-links (complexity audit)

- **LV greenhouse, CO₂ variant (circuit 3):** catalyst + 100 mB of CO₂ from the arc furnace → ×1.25 the output, same time and EU/t (`grindless:lv/<crop>_co2`). No water or O₂: the input hatch is one and holds a single fluid, and the LV greenhouse has no output hatch.
- **Arc furnace, obsidian with distilled water (circuit 2):** 32 cobblestone + electrode + 4,000 mB of Distilled Water (the one the steam turbine returns, the same one that feeds the solar tower) → 4 obsidian and an extra 10% Quartz Sand. Same EU/t and time as the water recipe (`grindless:arc_smelting/obsidian_distilled`).

## Gate to MV

| What is built | What it proves |
|---|---|
| MV machine hull (`gtceu:mv_machine_hull`) and MV energy hatch | Aluminium comes out of the sapphire line without requiring MV |
| 8 MV electronic circuits (`#gtceu:circuits/mv`, verify) | the good board and gallium + arsenic diodes work |
| LV power plant of 512 EU/t or more (2 large boilers and ~16 turbines, or biomass), 2 buffers and an LV→MV transformer (4 A → 1 A) | "without cutting it close" (translated from Spanish): MV fits with the buffer above 50% |
| MV energy hatch on the EBF (`gtceu:mv_energy_input_hatch`), fed by the LV→MV transformer, running `steel_from_iron` (iron + 200 mB of O₂, 120 EU/t) with the O₂ from the gas collector | MV arrives through real cable, not through two LV hatches, and the EBF is ready |
| AE2 network with a controller and a 16k CPU that makes an LV part (the LV motor) with patterns | AE2 already handles the logistics |
| Ore, greenhouse and simulator run for 10 minutes without touching them | electric generation sustains itself |

It opens MV: the MV machine hull and hatches, pyrolysis (MV machine hull), the MV fluid drilling rig (oil) and the MV vein drill.

## Mods and integration

| Mod | Slug | Use |
|---|---|---|
| Applied Energistics 2 (already in) | `ae2` | recipes remade with GT |
| Crafting Station (already in) | `crafting-station-jei-edition-updated` | no changes |
| ME Requester (optional) | `merequester` | requests parts from the network for machines (LGPL-3.0) |
| AE2 Crafting Tree Refreshed (optional) | `ae2-crafting-tree-refreshed` | crafting tree (LGPL-3.0) |
| Later | `extended-ae`, `advancedae`, `appflux`, `mega`, `applied-energistics-2-wireless-terminals` | see AE2, "Later" (translated from Spanish) |

No new mod is required: machines, recipe types and models are KubeJS.

- **Startup:** recipe types `gtceu:creature_simulation` and `gtceu:arc_smelting`; machines `lv_vein_drill`, `lv_greenhouse`, `lv_creature_simulator` and `submerged_arc_furnace`, using the pattern helper and GTM casings; items `grindless:blank_creature_model`, `grindless:creature_model_<id>` and `grindless:graphite_electrode`. Textures: one generic icon, tinted per model.
- **Server:** remove by type `ae2:inscriber` and `ae2:charger`, the `ae2:transform` recipes for certus and fluix, and AE2's crafting recipes; also remove `silicon_from_certus_quartz_dust`. Everything is regenerated from `ae2_gt.json` and `mobs.json`.
- **Tags:** merge `forge:gems/certus_quartz` (GT and AE2 have the same crystal: GT's outputs are switched to AE2's) and add GT's silicon to `forge:silicon`.
- **Dimensions:** GTM's air is only valid in `overworld`; add gas collector recipes with `.dimension('grindless:void')` and `.dimension('grindless:flat')`, and plains biome in both.
- **Quests:** chapter "LV Factory" (translated from Spanish) with about 9 quests, one per step, a small reward and no recipe locks.
- **Tests:** (1) it starts; (2) the four new multiblocks and machines form and process; (3) sand → certus → fluix → processor → controller, and sapphire → Aluminium → MV machine hull.

## Risks and open questions

- **Nether and End veins.** GTM 7.5.3 puts certus, quartz, beryllium, saltpeter, pure sulfur, sphalerite, tetrahedrite and topaz in the Nether. LV gets by without them (certus from sand, sulfur from pyrite, gallium from bauxite), but MV and HV will need them. We must decide now whether the vein table accepts the Nether and End ones, with a sample that can be made without travelling.
- **Aluminium by one route only.** The only LV route is sapphire: electrolysis (30 EU/t) or the 14% of Aluminium its ore gives. Bauxite (60 EU/t) and EBF with sapphire (100 EU/t) are MV. The MV gate depends on a deep vein and the steel drill bit; the alternative is to move `bauxite_electrolysis` down to LV.
- **Silicon at LV.** GTM leaves it at MV (EBF with Kanthal). We still need to decide whether arc silicon is also valid for GT circuits or only for AE2, with its own item or tag. Boules and wafers still require MV.
- **First ender pearl.** It is the only manual or quest input of the era. Confirm the quest or one-off hunt.
- **AE2 rewrite.** About 150 recipes, with a risk of orphans in EMI and of GT/AE2 duplicates. AE2 stays pinned at 15.4.11.

Credits to record in `CREDITS.md`: fertilizer per circuit in the greenhouse (Monifactory, LGPL-3.0); AE2 presses, processors and cells made by GT machines (Star Technology, MIT); creature models without killing (Monifactory and Nomifactory; HNN, MIT, stays as a rejected alternative); drilling fluid from stone (GTM recipe).

## Decisions taken (orchestrator, 2026-10-24)

They override the above when they conflict.

1. **AE2 hybrid, not fully rewritten.**
   - The inscriber and the charger stay, but they are made from LV GT parts (hull, motor, circuit).
   - Only the inputs are remade: silicon, presses (forming press, without meteorites), sky stone, controller, unit, energy acceptor, molecular assembler, interface, pattern provider, inscriber and charger.
   - The rest of AE2's recipes stay the same, because they already depend on processors.
   - That is about 20 recipes instead of 150. AE2 stays AE2 and comes into LV whole.
2. **Arc furnace silicon is `ae2:silicon`, for AE2 only.** GT silicon follows GTM's order (EBF at MV) so as not to break its circuits. The AE2 recipe that smelts certus dust into silicon is removed.
3. **Stone dust does not go down to LV.** It is inert: at LV it is thrown away or goes into drilling fluid, and at MV it is separated in the centrifuge, as GTM does. GTM recipes are not touched.
4. **Veins from all dimensions in the same table.**
   - The steam drill does the Overworld ones, LV adds the Nether ones, and MV or HV does the End ones.
   - The sample is made from two ores of that vein, so one trip is enough: it is exploration, not grind.
5. **First ender pearl:** an LV quest gives it. From there, the creature simulator multiplies it.
6. **AE2 power:** a vibration chamber with coke at first, and GTM's EU→FE converter if the 7.5.3 config allows it (verify). The hand crank only serves to start.
7. **The arc furnace does not make lava.** Burning it in a boiler would yield more energy than it costs to make. It makes **obsidian** (cobblestone melted and quenched with water), which is what sky dust needs. For the rock crusher, placing lava once is enough.
8. **Real rate of the LV vein drill:** with one hatch, ×1.5 the steam one; with two, ×3. It has its own parallel modifier (voltage ÷ 8 EU/t, maximum 8), because GTM does not overclock recipes at 8 EU/t.
9. **The arc furnace's CO₂** is inert: the player sets the controller to void fluids or stores it. With circuit 2, it yields CO for MV.
10. **AE2, as it ended up:**
    - The 8 input blocks are made in the LV assembler.
    - The presses come from the LV forming press.
    - The certus comes from GT's autoclave (it gives the AE2 crystal) or from the Nether certus vein with the LV vein drill.
    - Charged certus comes from AE2's charger or the LV polarizer; fluix comes from AE2's transformation or the LV mixer.
    - Quartzite counts as Nether quartz, so the annihilation core does not force a trip to the Nether.
    - The presses do not come out of meteorites, and GTM's EU→FE converter is enabled.
11. **Creature simulator:**
    - Each loot roll has its own programmed circuit.
    - Passive creatures print their model with what they eat (wheat, seeds or string).
    - Creeper (gunpowder) is MV, and Blaze (rods) is HV.
    - An LV fermenter feeds an LV simulator at full rate (1:1 ratio).
12. **Wireless power also at LV (2026-10-25, requested by the user, "like in Leisure" (translated from Spanish)).** Anyone who does not want to run GT cable already has two LV parts: the EU P2P tunnel (`eup2p:eu_p2p_tunnel`, unchanged: any AE2 P2P tunnel becomes EU when touched with a GT cable) and ExtendedAE's wireless connector (`expatternprovider:wireless_connect`), whose recipe drops from an HV circuit to LV (`integration/expatternprovider.js`). The rest of its recipe (engineering processor, wireless receiver, sky dust, AE2 smart cable) was already LV. The note on "Later: ExtendedAE and AdvancedAE (HV–EV)" above still applies to the rest of ExtendedAE (large buses, extended interface and unit, wireless hub...), which stays at HV.
