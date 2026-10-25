// -----------------------------------------------------------------------------------------------
// Controller crafting recipes of the small Steam multiblock family (startup_scripts/grindless/steam/small_family.js),
// plus the Steam-era crafting-table recipe for GTM's ULV fluid IMPORT hatch (mixer, chemical bath and ore washer need
// one: GTM 7.5.3 only makes either fluid hatch direction in the assembler, LV; the coke battery already hand-crafts
// the OUTPUT direction for its own fluids, server_scripts/grindless/steam/coking_battery.js - this is the same recipe
// mirrored onto the IMPORT direction, so the Steam Age never needs an assembler for either one).
//
// No new recipes for the six recipe types themselves: forge_hammer/compressor/alloy_smelter/mixer/chemical_bath/
// ore_washer are GTM's own native types, so every existing recipe of theirs at LV tier or below (bronze dust mixing,
// ore washing, chemical-bath paper and treated planks...) already runs; SteamParallelMultiblockMachine.recipeModifier
// rejects anything above LV by itself (same as every other Steam multiblock, GTM's own Steam Grinder/Oven included).
//
// Each controller costs more than the single block it replaces, built from Steam-era materials only (bronze, steel,
// bricks at most - no LV part): the item-only trio is built around GTM's own Steam single-block machine it replaces
// (gtceu:lp_steam_forge_hammer / _compressor / _alloy_smelter); mixer, chemical bath and ore washer have no Steam
// single-block equivalent in GTM at all (vapor.md 4 only lists macerator/compressor/hammer/extractor/furnace/alloy
// smelter as one-block Steam machines), so their controllers are built from plates, gears, pipe and casing alone -
// building the full multiblock is the only way to reach those three recipe types before LV.
(function () {
  const G = global.grindless

  var SF = G.steamSmallFamily = {
    machines: [
      { id: 'gtceu:steam_forge_hammer', type: 'gtceu:forge_hammer', crafting: 'grindless:crafting/steam_forge_hammer' },
      { id: 'gtceu:steam_compressor', type: 'gtceu:compressor', crafting: 'grindless:crafting/steam_compressor' },
      { id: 'gtceu:steam_alloy_smelter', type: 'gtceu:alloy_smelter', crafting: 'grindless:crafting/steam_alloy_smelter' },
      { id: 'gtceu:steam_mixer', type: 'gtceu:mixer', crafting: 'grindless:crafting/steam_mixer' },
      { id: 'gtceu:steam_chemical_bath', type: 'gtceu:chemical_bath', crafting: 'grindless:crafting/steam_chemical_bath' },
      { id: 'gtceu:steam_ore_washer', type: 'gtceu:ore_washer', crafting: 'grindless:crafting/steam_ore_washer' }
    ],
    ulvInputHatchRecipe: 'grindless:crafting/ulv_input_hatch',
    parallels: 8
  }

  ServerEvents.recipes(function (event) {
    // item-only trio: controller built around the GTM Steam single-block machine it replaces
    event.recipes.gtceu.shaped('gtceu:steam_forge_hammer', ['PTP', 'GBG', 'CwC'], {
      P: '#forge:plates/steel',
      T: 'gtceu:bronze_normal_fluid_pipe',
      G: '#forge:gears/steel',
      B: 'gtceu:lp_steam_forge_hammer',
      C: 'gtceu:steam_machine_casing'
    }).id('grindless:crafting/steam_forge_hammer')

    event.recipes.gtceu.shaped('gtceu:steam_compressor', ['PTP', 'GBG', 'CwC'], {
      P: '#forge:plates/bronze',
      T: 'gtceu:bronze_normal_fluid_pipe',
      G: '#forge:gears/bronze',
      B: 'gtceu:lp_steam_compressor',
      C: 'gtceu:steam_machine_casing'
    }).id('grindless:crafting/steam_compressor')

    event.recipes.gtceu.shaped('gtceu:steam_alloy_smelter', ['PTP', 'GBG', 'CwC'], {
      P: '#forge:plates/steel',
      T: 'gtceu:bronze_normal_fluid_pipe',
      G: '#forge:gears/bronze',
      B: 'gtceu:lp_steam_alloy_smelter',
      C: 'gtceu:steam_machine_casing'
    }).id('grindless:crafting/steam_alloy_smelter')

    // mixer / chemical bath / ore washer: no Steam single block to replace, built from plates, gears, pipe and casing
    event.recipes.gtceu.shaped('gtceu:steam_mixer', ['PGP', 'TwT', 'CGC'], {
      P: '#forge:plates/bronze',
      G: '#forge:gears/bronze',
      T: 'gtceu:bronze_normal_fluid_pipe',
      C: 'gtceu:steam_machine_casing'
    }).id('grindless:crafting/steam_mixer')

    event.recipes.gtceu.shaped('gtceu:steam_chemical_bath', ['PGP', 'TwT', 'CGC'], {
      P: '#forge:plates/steel',
      G: '#forge:glass',
      T: 'gtceu:bronze_normal_fluid_pipe',
      C: 'gtceu:steam_machine_casing'
    }).id('grindless:crafting/steam_chemical_bath')

    event.recipes.gtceu.shaped('gtceu:steam_ore_washer', ['GPG', 'TwT', 'CGC'], {
      G: '#forge:gears/bronze',
      P: '#forge:plates/steel',
      T: 'gtceu:bronze_normal_fluid_pipe',
      C: 'gtceu:steam_machine_casing'
    }).id('grindless:crafting/steam_ore_washer')

    // GTM's ULV fluid import hatch by hand: the same recipe the coke battery already uses for the export direction
    // (assembler recipe's hull and glass, two sticky resin as the glue), mirrored onto gtceu:ulv_input_hatch
    event.recipes.gtceu.shaped('gtceu:ulv_input_hatch', [' G ', 'RHR', ' w '], {
      G: '#forge:glass',
      R: 'gtceu:sticky_resin',
      H: 'gtceu:ulv_machine_hull'
    }).id('grindless:crafting/ulv_input_hatch')

    console.info('[grindless/steam] small family: ' + SF.machines.length + ' controllers + ULV input hatch crafting added')
  })
})()
