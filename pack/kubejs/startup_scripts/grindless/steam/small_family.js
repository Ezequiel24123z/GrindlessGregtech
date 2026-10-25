// -----------------------------------------------------------------------------------------------
// Small Steam multiblock family (GTL idea, docs/research/leisure.md 4.2: "small steam multiblock family
// ... 8 parallels over the single-block recipe", GTLCore LargeSteamParallelMultiblockMachine - idea only,
// no code/textures copied, licence unclear). GTM already has Steam Grinder/Oven (macerator/furnace, 4 parallels);
// this family covers the six GTM recipe types that have NO steam multiblock yet: forge hammer, compressor, alloy
// smelter, mixer, chemical bath, ore washer. Every one is a SteamParallelMultiblockMachine (GTM's own class, used
// exactly like Steam Grinder/Oven and GTM's own docs example "Large Steam Compressor", gtceu Example_Steam_Multiblock.md)
// with 8 parallels instead of GTM's default 4: same steam-voltage limit as every steam multiblock (recipe tier capped
// at LV, duration x1.5, EUt x(8/9) x parallels up to 32 EU/t). No new recipe types: each multiblock just runs GTM's
// own native recipe type for its single block (forge_hammer/compressor/alloy_smelter/mixer/chemical_bath/ore_washer),
// so every existing LV-tier-or-below recipe of that type (bronze dust mixing, ore washing, paper from the chemical
// bath...) becomes usable at Steam tier with 8x throughput. Ids checked against GTM 7.5.3 (GTMachines/GTMultiMachines/
// GTRecipeTypes): gtceu:lp_steam_forge_hammer/compressor/alloy_smelter are GTM's single-block Steam machines (and
// gtceu:lv_mixer/chemical_bath/ore_washer the first electric ones; mixer/chemical_bath/ore_washer have no Steam
// single-block version at all), gtceu:steam_grinder/steam_oven are GTM's two Steam multiblocks: none of our six ids
// (gtceu:steam_forge_hammer, _compressor, _alloy_smelter, _mixer, _chemical_bath, _ore_washer) exists anywhere in GTM.
//
//   gtceu:steam_forge_hammer    recipeType gtceu:forge_hammer     (replaces gtceu:lp_steam_forge_hammer)   item only
//   gtceu:steam_compressor      recipeType gtceu:compressor       (replaces gtceu:lp_steam_compressor)     item only
//   gtceu:steam_alloy_smelter   recipeType gtceu:alloy_smelter    (replaces gtceu:lp_steam_alloy_smelter)  item only
//   gtceu:steam_mixer           recipeType gtceu:mixer            (no Steam single block to replace)       item + optional fluids
//   gtceu:steam_chemical_bath   recipeType gtceu:chemical_bath    (no Steam single block to replace)       item + 1 fluid in
//   gtceu:steam_ore_washer      recipeType gtceu:ore_washer       (no Steam single block to replace)       item + 1 fluid in
//
// Structure: one shared family look (Steam palette: bronze, brass, riveted iron), all six a 3x3x3 hollow cube, the
// same shape GTM itself uses for Steam Grinder/Oven - every pattern through global.grindless.patterns (lib/patterns.js):
//   item-only trio (forge hammer, compressor, alloy smelter): 22 bronze-plated-bricks casing + 1 steam hatch +
//     1 steam input bus + 1 steam output bus (25 cells around a hollow air centre, controller on the front face).
//   chemical bath / ore washer (both recipe types always need exactly 1 fluid, GTM's maxIOSize fluid-in=1): same
//     cube, 21 casing + the same three steam parts + 1 fluid input hatch (any tier; the Steam-craftable ULV one,
//     server_scripts/grindless/steam/small_family.js, is the cheapest - mirrors the ULV output hatch the coke
//     battery already hand-crafts, DECISIONS.md).
//   mixer (some recipes are dust-only - bronze, brass, invar... - others need fluids - glue, salt water, concrete,
//     drilling fluid): same cube, 19-22 casing + the three steam parts + 0-2 fluid input hatches + 0-1 fluid output
//     hatch (GTM's mixer allows up to 2 fluid in / 1 fluid out): build it bare for the dust alloys, add hatches later
//     for the fluid recipes, no second controller needed.
//
// Textures: overlay dirs grindless:block/multiblock/steam_<name> (overlay_front*.png, tools/assets/
// Build-SteamSmallFamilyTextures.ps1), base casing gtceu:block/casings/solid/machine_casing_bronze_plated_bricks
// (GTM's steam machine casing, same as every other Grindless steam multiblock). Names: client_scripts/grindless/
// steam_small_family_lang.js. Controller recipes: server_scripts/grindless/steam/small_family.js.
(function () {
  const Pat = global.grindless.patterns

  const CASING = 'gtceu:steam_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/solid/machine_casing_bronze_plated_bricks'
  const PARALLELS = 8

  // shared 3x3x3 hollow cube (controller on the front face), same shape GTM uses for Steam Grinder/Oven
  const CUBE_SLICES = [
    ['XXX', 'XXX', 'XXX'],
    ['XXX', 'X#X', 'XXX'],
    ['XXX', 'XSX', 'XXX']
  ]

  // item-only trio: forge hammer, compressor, alloy smelter (none of the three recipe types takes a fluid at all)
  const ITEM_SPEC = {
    slices: CUBE_SLICES,
    symbols: {
      S: Pat.controller(),
      // 25 cells: 22 casing + 1 steam hatch + 1 steam input bus + 1 steam output bus
      X: Pat.oneOf(
        Pat.block(CASING, { min: 22 }),
        Pat.part('steam', { exact: 1 }),
        Pat.part('steam_input_bus', { exact: 1 }),
        Pat.part('steam_output_bus', { exact: 1 })
      ),
      '#': Pat.air()
    }
  }

  // chemical bath / ore washer: every usable recipe needs exactly 1 fluid in, 0 fluid out (GTM's own maxIOSize)
  const FLUID_SPEC = {
    slices: CUBE_SLICES,
    symbols: {
      S: Pat.controller(),
      // 25 cells: 21 casing + 1 steam hatch + 1 steam input bus + 1 steam output bus + 1 fluid input hatch
      X: Pat.oneOf(
        Pat.block(CASING, { min: 21 }),
        Pat.part('steam', { exact: 1 }),
        Pat.part('steam_input_bus', { exact: 1 }),
        Pat.part('steam_output_bus', { exact: 1 }),
        Pat.part('input_hatch', { exact: 1 })
      ),
      '#': Pat.air()
    }
  }

  // mixer: dust alloys need no fluid at all; glue, salt water, concrete and drilling fluid need 1-2 fluids in and
  // some give a fluid back, so both hatch kinds are optional (0 is a valid, cheaper build for the dust-only use)
  const MIXER_SPEC = {
    slices: CUBE_SLICES,
    symbols: {
      S: Pat.controller(),
      // 25 cells: 19-22 casing + 1 steam hatch + 1 steam input bus + 1 steam output bus + 0-2 fluid in + 0-1 fluid out
      X: Pat.oneOf(
        Pat.block(CASING, { min: 19 }),
        Pat.part('steam', { exact: 1 }),
        Pat.part('steam_input_bus', { exact: 1 }),
        Pat.part('steam_output_bus', { exact: 1 }),
        Pat.part('input_hatch', { min: 0, max: 2 }),
        Pat.part('output_hatch', { min: 0, max: 1 })
      ),
      '#': Pat.air()
    }
  }

  // id, display name, GTM recipe type id, pattern spec, how many tooltip lines (client_scripts/grindless/steam_small_family_lang.js)
  const MACHINES = [
    { id: 'steam_forge_hammer', name: 'Steam Forge Hammer', type: 'forge_hammer', spec: ITEM_SPEC, tooltips: 3 },
    { id: 'steam_compressor', name: 'Steam Compressor', type: 'compressor', spec: ITEM_SPEC, tooltips: 3 },
    { id: 'steam_alloy_smelter', name: 'Steam Alloy Smelter', type: 'alloy_smelter', spec: ITEM_SPEC, tooltips: 3 },
    { id: 'steam_mixer', name: 'Steam Mixer', type: 'mixer', spec: MIXER_SPEC, tooltips: 4 },
    { id: 'steam_chemical_bath', name: 'Steam Chemical Bath', type: 'chemical_bath', spec: FLUID_SPEC, tooltips: 3 },
    { id: 'steam_ore_washer', name: 'Steam Ore Washer', type: 'ore_washer', spec: FLUID_SPEC, tooltips: 3 }
  ]

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    MACHINES.forEach(function (m) {
      Pat.register('gtceu:' + m.id, m.spec)

      var tips = []
      for (var i = 0; i < m.tooltips; i++) tips.push(Text.translate('grindless.machine.' + m.id + '.tooltip.' + i))

      event.create(m.id, 'multiblock')
        .langValue(m.name)
        .rotationState(RotationState.ALL)
        .machine(function (holder) { return MachineConstructors.createSteamMultiblock(holder, PARALLELS) })
        .recipeType(m.type)
        .recipeModifier(MachineModifiers.STEAM_PARALLEL_MULTIBLOCK, true)
        .appearanceBlock(GTBlocks.CASING_BRONZE_BRICKS)
        .pattern(function (def) { return Pat.build(def, m.spec) })
        ["tooltips(net.minecraft.network.chat.Component[])"](tips)
        .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/' + m.id)
    })
  })
})()
