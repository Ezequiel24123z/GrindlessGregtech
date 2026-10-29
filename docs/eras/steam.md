# Steam era

The game starts here, without electricity. Coke, bricks, bronze, boilers and steel. Steam machines do the dirty work, and before you leave, ore and wood already arrive on their own.

## Route

1. **Start.** Wood, flint and the GT tools (mortar, hammer, file). Hand-mine only what is needed: a little copper, tin, iron and coal. Clay and sand for the bricks. The **Horizon Collector** you arrive with produces all of these slowly (see below).
2. **Coke.** Coke oven (`gtceu:coke_oven`): coal to coke, logs to charcoal. Creosote comes out as a byproduct. It fuels the liquid boiler or impregnates wood.
3. **Bronze.** Bronze dust made with the mortar, then smelted. First plates and gears.
4. **Steam.** Low-Pressure Boiler, coal-fired (`gtceu:lp_steam_solid_boiler`), and a Primitive Pump (`gtceu:primitive_pump`) for water. Single-block steam machines: Steam Macerator, Steam Compressor, Steam Forge Hammer, Steam Extractor, Steam Furnace and Steam Alloy Smelter.
5. **No more pickaxe.** Hand-mining ends here:
   - GTM's Steam Miner (`gtceu:lp_steam_miner`): pulls ore from a real vein beneath it.
   - **Steam vein drill** (ours): pulls indefinitely from the vein the sample marks.
   - **Steam greenhouse** (ours): wood, resin and crops.
   - Steam Rock Crusher (`gtceu:lp_steam_rock_crusher`): stone and cobblestone, with water and lava beside it.
6. **Steel.** Primitive Blast Furnace (`gtceu:primitive_blast_furnace`): iron and coke make steel. Steel brings the high-pressure machines and the steel drill bit.
   - Later, the **steam blast furnace** (ours) makes steel straight from the ore, faster, in exchange for steam.
   - The **coke battery** (ours) cokes like 6 or 7 coke ovens and stores coal gas for LV.
7. **Gate to LV.** LV Steam Turbine (`gtceu:lv_steam_turbine`), first LV circuit, LV Machine Hull and rubber-insulated tin cable. Once that works, the era is behind you.

## The Horizon Collector (the start)

A user-directed exception (2026-10-27), inspired by GregTech Leisure's *Fragment World Collection Machine* (idea only: our code, numbers and textures). It replaces most of the very first hand gathering and fades out once steam mining arrives.

- **Lore:** the machine was in your pack when you arrived. Nobody remembers building it. Its shard hums at the pitch of the black hole at the end of the journey, and it pulls a flood of ordinary matter through a horizon the size of a pin. The quest says no more; the mirror shell at MAX (`docs/journey.md:54`) may be where it was made.
- **Machine:** `gtceu:lv_horizon_collector`, a single-block LV machine (GTM `simple` builder, LV only, no higher tier). Recipe type `gtceu:horizon_collection`. It is never craftable and has no upgrade, parallel or multiblock version.
- **Catalyst:** `grindless:horizon_shard`, not consumed, never craftable.
- **Power:** two GTM LV solar panel covers (`gtceu:lv_solar_panel`) come with it. GTM lets a solar cover go only on a top face, so one cover sits on the machine and runs it by day (32 EU/t for a 16 EU/t recipe); it stops at night. The second is a spare for any other LV machine. Energy is not free: the covers are a real GTM source.
- **Recipes:** 16 EU/t, 160 ticks (8 s), shard plus programmed circuit; up to 4 output slots, the count split into stacks of 64:

| Circuit | Output per run |
|---|---|
| 1 | 128 oak logs |
| 2 | 256 cobblestone |
| 3 | 192 sand |
| 4 | 192 gravel |
| 5 | 128 clay balls |
| 6 | 64 coal |
| 7 | 64 raw copper |
| 8 | 64 raw tin |
| 9 | 64 raw iron |
| 10 | 64 flint (stone-age tools and the first fires: the only new row; redstone, gold and saplings are left to the drills and greenhouse) |

- **Why these numbers:** user-directed buff (2026-10-28, "muchisimo mas masivo"). Still 16 EU/t, so the one LV solar cover (32 EU/t) keeps running it by day, with no overclock; the run is 7.5 times shorter and 5 to 8 times bigger, 40 to 60 times the old rate. Ore is 8 a second, about 10 times the Steam Vein Drill's 40-60 a minute, but it is raw ore only: smelting, grinding, tin and iron plates and every later ore (lead, nickel, gold, redstone) still need the drills and the machine lines. It carries the steam era's first hours and is outgrown by the drills' reach, not by its rate.
- **How you get it:** the Welcome chapter's quest *The Horizon Collector*, unlocked by *Arrival*, gives the machine, the shard and the two covers once per player.
- **Saves:** new ids only; nothing is removed or renamed.

## Storage and furnaces

Sophisticated Storage's metal tiers are tuned above stock: copper, iron and gold have 90, 108 and 162 inventory slots; diamond and netherite reach the engine's 180-slot cap. Metal upgrade slots double, as do limited barrels' per-slot capacities. Wood is unchanged.

The pack raises only stock per-world config values, preserving customized values and existing contents. Placed single storages expand on load; existing double chests keep their saved size until tier-upgraded or rebuilt.

Iron Furnaces adds ordinary fuel-burning furnace tiers at twice the mod's stock speed (netherite: 5 to 2 ticks per item). One coal still smelts eight items without augments. Tier upgrades retain contents; FE generator/factory augments, the wireless heater and Million/rainbow routes are disabled. These furnaces do not generate power or replace GT ore processing.

## Building multiblocks

The **Hologram Projector** (`grindless:hologram_projector`) is made at the crafting table with glass, bronze plates, redstone torches and redstone, using a screwdriver.

Right-click an unformed controller to show its native GTM hologram for 30 seconds; click again to hide it. Sneak-right-click to place the default structural blocks from your inventory: casings, coils, glass, frames and pipes. It never places hatches, buses, mufflers or other GT machine parts, and leaves non-replaceable obstructions alone. Chat lists missing materials, obstructions and the cells left for parts. Formed controllers still open normally.

Repeating patterns use their minimum size. GTM's preview renderer does not display mirroring; the structural build does follow the controller's actual mirroring. GTM's Terminal uses the same conservative placement rules and keeps its recipe and Workshop quest.

## Our multiblocks

They are registered under `gtceu:` because that is how GTM registers machines. Our own items go under `grindless:`.

### Steam Vein Drill — `gtceu:steam_vein_drill`

What it gains: unlimited ore, without moving to another vein. No single-block machine generates ore; the steam miner only collects the ore already in the world, and depletes it.

**Virtual mining:** the sample selects an output recipe, not a deposit or coordinates. The Earth drill family generates the same Overworld resources in the Overworld, Flatland (`grindless:flat`) and Void (`grindless:void`), without a physical vein beneath it. A vein's depth in the table selects the required drill bit; it does not constrain the machine's height. Later planetary drills generate their resources in the required dimension, also without a physical vein. GTM's physical miners remain optional collectors, separate from this unlimited recipe-based family.

- **Recipe type:** `gtceu:vein_drilling`. The electric drills from LV up will use the same type.
- **Inputs of each recipe:**
  - a **vein sample** (`grindless:vein_sample_<vein>`), which is not used up;
  - a **drill bit** (`grindless:bronze_drill_bit` or `grindless:steel_drill_bit`), which wears out by chance (bronze about 10% per cycle, steel about 4%);
  - water (about 100 mB per cycle) if the multiblock accepts a fluid hatch; if not, steam only.
- **Outputs:** the raw ore (`raw_*`) of the vein, in proportion to the vein's weights in GTM, plus an inert stone byproduct that can be thrown away.
- **Vein table:** generated from the Overworld veins of GTM 7.5.3. A single data file feeds all the recipes. Deep veins (below Y 0) accept only the steel drill bit; the rest accept both, and the steel one yields more.
- **Vein sample:** crafted once from an empty vein probe (bronze plates and glass) and two raw ores of that vein. You get the raw ores by hand-mining once or from the steam miner.
- **Approximate rate:** with 4 in parallel, about 40-60 ores per minute. At full output it uses about 50-60 mB/t of steam, so it needs several boilers or a Large Bronze Boiler.
- **Structure:** a visible tower about 3×3 at the base and 5-7 high, with bronze or steel frames and a steam casing. It has an input bus, an output bus, a steam hatch and a water hatch.

### Steam Greenhouse — `gtceu:steam_greenhouse`

What it gains: wood, resin and food without felling or planting. No single-block GTM machine grows trees.

- **Recipe type:** `gtceu:greenhouse`. Electric greenhouses will share it.
- **Inputs:** a sapling or seed as catalyst (not used up), water and, optionally, fertilizer (bone meal or GT's fertilizer) for more output.
- **Outputs:**
  - vanilla trees: logs, sometimes a sapling, and sticks;
  - GTM rubber tree: rubber logs and sticky resin;
  - crops: wheat, sugar cane, carrot, potato, beetroot, pumpkin and melon.
- **Approximate rate:** about 6 logs every 30 s per parallel without fertilizer. With fertilizer, about 1.5 times more.
- **Structure:** about 5×5×5. Dirt floor, glass walls and roof, and a steam casing frame. It has to look like a greenhouse.

### Steam Blast Furnace — `gtceu:steam_blast_furnace`

What it gains: fewer steps and more speed. The furnace and the primitive blast furnace in one machine: it takes ore and gives steel. One structure makes as much steel as 6 or 7 primitive blast furnaces, so the drill's steel bits stop being the bottleneck.

- **Recipe type:** `gtceu:steelmaking` (steel production).
- **Recipe:** 4 iron + 4 coke + 1 flux → 4 steel ingots + 1 ash. 8 EU/t and 2,400 ticks per load.
  - **Iron:** raw or crushed iron ore, magnetite, hematite, goethite or yellow limonite, and iron ingot or iron dust. One recipe per row of the table `kubejs/data/grindless/tables/steam_blast_furnace.json`.
  - **Flux** (`#grindless:blast_furnace_fluxes`): raw, dust or block calcite. Calcite comes from the lapis lazuli vein.
  - **Left out:** pyrite is a sulfide and waits for the LV sulfide roaster.
- **Rate:** 4 loads at once and 1.5 times slower: 16 ingots every 180 s, about 5.3 per minute. It uses about 57 mB/t of steam (12,800 mB per ingot).
- **Comparison with GTM.** The primitive blast furnace (`gtceu:primitive_blast_furnace`) makes 1 iron ingot + 1 coke → 1 steel + 1/9 ash in 1,500 ticks, one at a time, and the iron has to be smelted first.
  - **The yield is GT's.** One raw ore gives 1 steel, just as smelting it gives 1 ingot. A crushed ore also gives 1, and macerating a raw ore gives 2 crushed ores, so 2 steel. It uses 1 coke per steel, like the primitive one.
  - **What it costs:** steam (the primitive one uses nothing else), a coke line, another calcite line, and a larger structure with steel in the controller.
- **Structure** (3 × 7 × 3):
  - hearth: steam casing with its parts (steam hatch, input bus and 1 or 2 output buses);
  - bosh: firebricks, three tuyeres (bronze or steel pipes) and the controller;
  - stack: hollow firebricks (the hollow must stay empty);
  - top: four frame posts (bronze or steel) and the downcomer, two pipes.
- **Controller:** the primitive blast furnace, steel plates, a bronze pipe, bronze gears and a steam casing.

### By-product Coke Battery — `gtceu:coking_battery`

What it gains: yield. It cokes like the coke oven and also recovers coal gas, which the coke oven loses.

- **Recipe type:** `gtceu:coking` (coking).
- **Recipe:** 1 coal → 1 coke + 500 mB creosote + 125 mB coal gas. 4 EU/t and 360 ticks.
- **Rate:** 4 chambers at once: 4 coal every 27 s, like 6 or 7 coke ovens. It uses about 28 mB/t of steam (3,840 mB per coal, which is about what 180 mB of its own creosote gives in a high-pressure liquid boiler).
- **Why these numbers** (per coal, GTM 7.5.3 recipes):

  | Machine | Era | Coke | Creosote | Coal gas | Cost |
  |---|---|---|---|---|---|
  | Coke oven | Steam | 1 | 500 mB | — | 900 ticks and nothing else |
  | **Coke battery** | Steam | 1 | 500 mB | 125 mB | 3,840 mB of steam |
  | Pyrolyse oven, with steam | MV | 1 | — | 250 mB | 62.5 mB of steam and 96 EU/t |
  | Pyrolyse oven, with N₂ | MV | 1 | 500 mB | — | 62.5 mB of N₂ and 96 EU/t |

  - Coke stays 1:1. The industrial coke oven from GT Community Additions gave 2 coke per coal and 3.4 times the creosote, so it was removed.
  - The creosote is the coke oven's.
  - The gas is half of what the MV pyrolyse oven recovers; the other half heats the ovens (a real battery burns 40-50% of its own gas under the chambers).
  - At LV prices (96 EU per mB of coal gas in the gas turbine; about 10.5 EU per mB of creosote in a high-pressure liquid boiler), a coal is worth about 5,250 EU in the coke oven, about 15,300 EU here (after subtracting the steam), and about 22,000 EU in the pyrolyse oven. Better than GTM's steam machine and below the MV one.
- **Structure** (5 × 4 × 3):
  - base: steam casing with the steam hatch and 1 or 2 output buses (the coke);
  - three chambers of coke oven bricks between two bronze firebox walls; the controller is the door of the middle chamber;
  - roof: steam casing with the input bus (the charging hole), the two fluid output hatches (creosote and gas), and the gas collector in the middle (bronze or steel pipes).
- **Controller:** two coke ovens, bronze plates and gears, a bronze pipe and a steam casing.
- **ULV fluid output hatch.** In GTM 7.5.3 it is only made in the assembler (LV), and no steam part pulls fluids out of a steam multiblock: the pump's hatch only accepts water, and the one for the coke oven only works with the coke oven. So it has a hand recipe: ULV Machine Hull + glass + 2 sticky resin (the glue). Minor side effects:
  - with a screwdriver it becomes the ULV input hatch (GTM recipe; no steam machine uses it);
  - the primitive pump pumps twice as much water with it as with its own hatch.

### Clockwork Observatory — `gtceu:steam_observatory`

What it gains: it is the only thing that makes the first Moon chart (`grindless:lunar_chart_draft`). It opens the observatory family, the one the journey relies on (`docs/journey.md`): navigation data only comes from looking.

- **Recipe type:** `gtceu:stargazing` (eyepiece observation).
- **Recipe:** 4 paper + 1 coal dust (the ink) → 1 Lunar Chart (Draft). 8 EU/t of steam and 400 ticks (600 in the steam multiblock, which is 30 s). One chart at a time.
- **Conditions** (from GTM, set in the recipe):
  - at night (the day condition, inverted);
  - with a clear sky (rain level below 0.2);
  - with the controller at Y 100 or higher (`posY 100..319`): above the valley haze and the smoke from the coke ovens.
  - If it gets light or rains partway through a drawing, the machine waits and keeps its progress (`regressWhenWaiting(false)`). In EMI, a line states the rule in words.
- **Why it is not grind:** a clear night comes on its own, and a 40-block tower goes up in a moment (on the Flat, the ground is at Y 63). There is no luck involved and no inflated times: observing takes 30 s and always gives the chart.
- **Structure** (3 × 6 × 5, outdoors):
  - platform of steam casing with the steam hatch, an input bus and an output bus;
  - stone brick pillar;
  - bronze gearbox (the clockwork mechanism) between two bronze frame fork arms;
  - tube of bronze pipes rising diagonally backwards, with glass on top (the objective).
  - The brass in the drawing is GTM's bronze: brass needs zinc, and there is no zinc in the steam era.
- **Controller:** glass, a bronze pipe (the tube), bronze gears, a bronze hull, bronze plates and a clock (the mechanism). Everything here is steam-era, so it can be built in any later era: a world already in LV can build it too.
- **The chart is not used up.** The Optical Observatory (LV) reads it without using it up. You copy it by hand: draft + paper + coal dust → 2.

#### Decisions taken (observatory, 2026-10-24)

- **One recipe type per observatory** (`stargazing`, `astrophotography`, `radio_astronomy`), not one shared type as in the drill. That way each chart only comes out of its own machine, and EMI shows it.
- **Charts are made once.** The next machine asks for them without using them up, and any chart can be copied in a crafting table (original + blank sheet → 2). The copy idea comes from Star Technology's coordinate crystals (MIT); its randomness does not: its dimensional finder gives the crystal with a 5% chance.
- **The validator does not model the sky conditions:** it treats them as met. They are tested in game by `gg_test_observatory`, which also checks that the observatory refuses to run when each one fails.
- **The ink is coal dust.** Black dye comes from ink sacs or wither roses, neither of which is automated in the steam era.

### Large Steam family — `gtceu:large_steam_macerator/centrifuge/thermal_centrifuge/chemical_bath/ore_washer`

What it gains: processing ore at plant scale, without electricity. Idea from GregTech Leisure (the "Large Steam X" family, `docs/research/leisure.md` §4.2). Its license is not permissive: no code, textures or text are copied, only the concept of a large steam multiblock with a parallel cap. The sixth GTL member is left out (the assembler with an AE2 molecular assembler core): it does not fit a multiblock built only with KubeJS.

All five machines share a casing (steel, 5×5×5, with bronze or steel frame posts on the 4 vertical edges) and a mechanism (`SteamParallelMultiblockMachine`, the same as GTM's standard Steam Grinder and Steam Oven: duration ×1.5, steam from one hatch, and GTM rejects outright any recipe above LV, 32 EU/t). Unlike GTM's Steam Grinder and Steam Oven, none of them calls `addOutputLimit` (which cuts them down to a single byproduct): here the whole ore byproduct chain is kept, with 2 output buses (8 slots) so that the 64-parallel cap does not run short on a single 4-slot bus.

Each controller runs an unchanged GTM recipe type:

| Machine | GTM type | EU/t of its ore-chain recipes | Fluid hatches |
|---|---|---|---|
| Large Steam Macerator | `gtceu:macerator` | always 2 | none |
| Large Steam Thermal Centrifuge | `gtceu:thermal_centrifuge` | 30 (the type's default value) | none |
| Large Steam Ore Washer | `gtceu:ore_washer` | 4 or 16 (the default value) | 1 input |
| Large Steam Chemical Bath | `gtceu:chemical_bath` | 32 (just LV) for ore washing; its hot ingot baths (960/128) are left out | 1 input, 1 output |
| Large Steam Centrifuge | `gtceu:centrifuge` | 24 and 5 for the dirty and pure dust separations | 1 input, 1-2 output |

Verified in the GTM 7.5.3 code (`data/recipe/generated/OreRecipeHandler.java`), not just from memory: all five have real ore byproduct-chain recipes at 32 EU/t or less, so none needed the electric LV step that had been kept as an emergency exit in case the steam cap blocked the whole type.

- **Controller:** steam casing (inherited from the era), steel plates and frames, and a "core" specific to each machine — macerator: `gtceu:steam_grinder` (GTM's small one, superseded); ore washer: `gtceu:primitive_pump` (GTM's Primitive Pump, superseded); centrifuge/thermal centrifuge/bath: bronze gear, rod and pipe.
- **Structure:** one shape shared by all five (104 free cells for parts + casing, 20 frame cells on the edges, 1 controller cell), registered once through `global.grindless.patterns` and reused with different sets of parts depending on the recipe type.

#### Decisions taken (Large Steam family, 2026-10-25)

- **All five stay on steam; none moves to electric LV.** The plan foresaw that escape if GTM blocked the centrifuge or thermal centrifuge completely; it does not (table above), so all five are still `SteamParallelMultiblockMachine`.
- **No `addOutputLimit`.** GTM sets it on its own Steam Grinder and Steam Oven to keep a single byproduct; here it is removed on purpose, because the family's goal is the full byproduct chain.
- **"Steel and brass" is texture only.** Real brass needs zinc, which does not come until the LV sulfide roaster (like the observatory's clock). The casing is standard steel (`gtceu:solid_machine_casing`, already used by the electric LV multiblocks); the brass is a golden tone hand-painted into the overlay.
- **64 parallels is the cap**, the same one GTL's "absurd parallels" rule sets in `docs/research/leisure.md`. No multiblock in the family goes past that.

### Small steam family — `gtceu:steam_forge_hammer/compressor/alloy_smelter/mixer/chemical_bath/ore_washer`

What it gains: the six GTM recipe types that the steam era did not run at scale. Without this family, the forge hammer, the compressor and the alloy smelter only reach the cap of a single steam block (`gtceu:lp_steam_*`/`hp_steam_*`); the mixer, the chemical bath and the ore washer do not exist at all until LV, because GTM gives them no single-block steam machine. Idea from GregTech Leisure (`docs/research/leisure.md` §4.2, GTLCore `LargeSteamParallelMultiblockMachine`), license unclear: only the concept (a small steam multiblock with 8 parallels on the single-block recipe); the structure, textures and code are ours (`steam/small_family.js`).

All six share the same hollow 3×3×3 cube that GTM's standard Steam Grinder and Steam Oven use (`SteamParallelMultiblockMachine`, with 8 parallels instead of the standard 4: duration ×1.5, EU/t ×(8/9) per parallel up to a cap of 32, nothing above LV). The forge hammer, the compressor and the alloy smelter only take item parts (steam hatch, input bus, output bus), and their controller is built with the single-block steam machine they replace. The chemical bath and the ore washer add a fluid input hatch, which their own recipes always need; the mixer makes it optional (0 to 2 inputs, 0 to 1 output), because bronze, brass, invar and the other powder alloys do not need fluid, while glue, salt water, concrete and drilling fluid do. None of the three has a single-block steam machine to replace, so their controller is built only from plates, gears, pipe and steam casing.

#### Decisions taken (small steam family, 2026-10-25)

- **No new recipe type.** All six run the GTM type of their electric machine (`forge_hammer`, `compressor`, `alloy_smelter`, `mixer`, `chemical_bath`, `ore_washer`): every existing recipe at LV or below becomes usable in steam without touching a single recipe of ours.
- **8 parallels, no more.** That is the number GTL's idea asks for in this small family (`docs/research/leisure.md` §4.2); the larger Large Steam family stays at 64.
- **The ULV fluid input hatch can be hand-crafted in steam**, like the output one the coke battery already used: same gap (GTM only gives it through the assembler, LV), same hand recipe (ULV Machine Hull + glass + sticky resin).
- **The mixer makes its fluid hatches optional** because half of its recipes (the powder alloys) do not need them: the cheapest structure already works for bronze, and it can be extended later without touching the controller.
- **A single mechanism tested in game for the family** (AGENTS.md): the compressor (item) and the chemical bath (fluid) process in game with 8 parallels; the forge hammer, alloy smelter, mixer and ore washer are only formed and checked statically, because they run the same, already tested `SteamParallelMultiblockMachine`.

- The drill's stone is inert and can be thrown away. In LV it can go into drilling fluid, and in MV into the centrifuge, as GTM does.
- Spare saplings go to compost (plant balls in LV) or to biomass later.
- The coke oven's creosote is fuel or treated wood. No recipe is invented just to "make use of it."
- The coke battery's creosote is the same: boiler fuel or treated wood.
- The steam blast furnace's ash is slag: the lime from the flux and the ash from the coke. It is inert and can be thrown away (the Trash Cans bin is already available in steam). In LV, GTM's chemical reactor makes fertilizer from calcite + 3 ash + water, and the centrifuge separates it into quicklime, magnesia, potash, sodium carbonate and some hematite.
- The gases from the steam blast furnace's throat (CO₂ and CO) leave through the downcomer, as in the primitive blast furnace.
- The coke battery's coal gas is flammable and poisonous: it is kept in tanks (drums or a multiblock tank), and if its hatch fills up, the battery stops.
  - In LV it feeds the gas turbine (96 EU/mB) and the distillery (coal tar, ammonia, ethylbenzene or CO₂, with some coke dust returned).
  - In MV it goes to the biorefinery and GTM's distillation tower.
  - In steam it is not burned: no boiler recipe is added that GTM does not have.

## Build dimensions

From the first mission you can earn two free keys:

- **Void Key** (`grindless:void_key`): leads to `grindless:void`, an empty dimension. The first time, it creates a small platform under your feet.
- **Flat Key** (`grindless:flat_key`): leads to `grindless:flat`, a fully flat dimension with layers of stone below, for building the factory on level ground. If GTM allows it, it will also have veins underground.

Using the key again returns you to the Overworld, to the point you left from. The keys can also be crafted cheaply in case they are lost.

## Missions

The quest book is in English and follows this route. Its structure, task types, layout and rewards are taken from the quest books of other GTM packs. If the license allows it, their texts are adapted with attribution.

## Exit gate

You leave the era once you have steel, an LV steam turbine that generates power steadily, and the first LV circuit. The static validation checks that coke, bronze, steam, steel, LV turbine, LV circuit and LV Machine Hull can be made without commands, starting only from what the world provides.

## Decisions taken: steam blast furnace and coke battery (2026-10-24)

- **The steam blast furnace gains steps and speed, not yield.** It gives 1 steel per ore, the same as smelting it and running it through the primitive blast furnace, and 1 coke per steel. Whoever macerates first gets 2, as in GT.
- **The battery gains yield without using a GTM machine.** Coke 1:1, the coke oven's creosote and half of the MV pyrolyse oven's gas. Per coal, it lands between the coke oven and the pyrolyse oven.
- **The ULV fluid output hatch can be hand-crafted in steam.** There is no other way to pull fluids out of a steam multiblock. The drill and the steam greenhouse do not change shape: they still have no water or fertilizer.
- **The slag is GTM's ash.** No new item is created. GTM's ash is already lime, magnesia and potash, and it has a use in LV.
- **Coal gas waits for LV.** In steam it is stored in tanks. It gets no boiler recipe, because GTM does not have one.
- **Both run with 4 parallels**, like the steam vein drill and the steam greenhouse.
- **The controller is built with the GTM machine it replaces:** the primitive blast furnace, and two coke ovens. The steam blast furnace also requires steel, so the primitive one is still how steel gets started.
- **The flux is raw, dust or block calcite.** Pyrite is left out of the blast furnace: it is a sulfide and must be roasted first (LV).

## Work package STEAM-X1: the Horizon Collector

- **Objective:** the machine, catalyst, recipes and quest in *The Horizon Collector (the start)* above, exactly as specified there (ids, numbers, circuits).
- **`<name>`:** `horizon`.
- **Allowed:**
  - `pack/kubejs/startup_scripts/grindless/steam/horizon_collector.js` (recipe type, machine, shard item);
  - `pack/kubejs/server_scripts/grindless/steam/horizon_collector.js` (the 9 recipes, read from the table);
  - `pack/kubejs/data/grindless/tables/horizon_collector.json`;
  - `pack/kubejs/client_scripts/grindless/steam_horizon_lang.js` (`en_us` and `es_es`: machine, shard, recipe type, tooltips);
  - textures and models under `pack/kubejs/assets/grindless/` for the machine face (idle, active) and the shard, drawn by a new `tools/assets/Build-HorizonCollectorTextures.ps1` (`-Credits` prints its rows);
  - `pack/config/ftbquests/quests/chapters/welcome.snbt` (one new quest only);
  - `tools/test/overlay/kubejs/server_scripts/gg_test_quests.js` (`GG_QUESTS_EXPECTED` only, if the linter asks);
  - `tools/analysis/test/steam-horizon_collector.test.mjs`.
- **Prohibited:** everything else. In particular `hidden_until.json`, `tools/analysis/tiers/*.json`, `emi_coverage.json`, `lang/*.json`, `emi_info_lang.js`, `lib/**`, `CREDITS.md`, `DECISIONS.md`, `docs/STATUS.md`, `pack/index.toml`, `pack/pack.toml`.
- **References:**
  - the single-block precedent `startup_scripts/grindless/lv/creatures.js:47-74` (recipe type with circuit overlay, `simple` builder, `workableTieredHullModel`, tooltips) and its server and lang files;
  - the quest rules in `.github/instructions/quests.instructions.md`; `docs/quests.md` §7 (rewards) and §10 (ids); *Arrival* in `welcome.snbt`.
- **Machine:** `event.create('horizon_collector', 'simple').tiers(GTValues.LV)`, so the id is `gtceu:lv_horizon_collector`. No crafting recipe for the machine or the shard. The tooltip says it was not built, cannot be made and runs on the solar covers by day.
- **Recipes:** ids `grindless:horizon_collection/<output>`; LV, 16 EU/t, 1200 ticks; inputs: `grindless:horizon_shard` not consumed (`chancedInput` 0 or `notConsumable`, as GTM 7.5.3 supports) and `circuit(n)`; outputs from the table; no fluids.
- **Quest:** title *The Horizon Collector*; depends on *Arrival*; a checkmark task; 3 rewards (1 `gtceu:lv_horizon_collector`, 1 `grindless:horizon_shard`, 2 `gtceu:lv_solar_panel`); 2-4 short lines of lore (the machine was in your pack; nobody built it; it hums like the black hole at the end of the journey; put the two solar covers on it and pick a circuit). New ids, first digit 1-7, unique in the book. It is an explicit exception to the small-reward rule (user-directed); add it to the linter's exception list only if the linter flags it, with the reason.
- **Invariants:** no existing id changes; no MV or higher tier; nothing generated or shared is edited; English everywhere except the `es_es` names.
- **Acceptance:** the static validator sees the machine, type, item and 9 recipes; the quest lints with 0 errors and 0 warnings; the node test pins the 9 rows (circuit, output, count, 16 EU/t, 1200 t, shard not consumed) and that no recipe outputs the machine or the shard.
- **Tests:** T0 (`tools/Check-Fast.ps1`). The expected integrator-class failures (EMI coverage and reachability for two items obtainable only from a quest) are reported, not fixed. T1: none (the `simple` builder and GTM's solar cover are proven).
- **Repairs:** at most 2, then stop with evidence.
- **Commits:** content, then textures. No push, no PR.
- **Handoff (at most 15 lines):** result, files, tests, new ids, the integrator edits needed (obtain class for quest-only items, EMI), a proposed CREDITS block (`-Credits`) and README row, risks.
