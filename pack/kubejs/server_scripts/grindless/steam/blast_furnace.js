// priority: -22224
// -----------------------------------------------------------------------------------------------
// The Steam Age ironworks (docs/eras/lines-steam-hv.md, S1): sinter, pig iron and Bessemer steel, plus the flux tag and the
// controller of the Steam Blast Furnace (gtceu:steam_blast_furnace).
//
//   1. Sintering, gtceu:alloy_smelter (the steam alloy smelter), one recipe per feed of
//      kubejs/data/grindless/tables/steam_blast_furnace.json:
//        4 purified iron ore + 1 coke dust -> 4 grindless:iron_sinter                       8 EU/t, 300 ticks
//   2. Smelting, gtceu:steelmaking (blast furnace; the type has three input slots, so no circuit selects the mode):
//        4 sinter + 3 coke + 1 flux (#grindless:blast_furnace_fluxes) -> 4 grindless:pig_iron + 1 ash dust   8 EU/t, 1 200 ticks
//   3. Bessemer blowing, gtceu:steelmaking (the same furnace, chosen by its input):
//        4 pig iron -> 4 steel ingots + 1 ash dust                                                           8 EU/t, 1 200 ticks
// The steam multiblock runs 4 batches at once and 1.5x slower: 16 pig iron every 1 800 ticks, then 16 steel every 1 800 ticks,
// drawing about 57 mB/t of steam.
//
// Yield is GT's: a raw ore macerates into 2 crushed ores, and each purified ore ends as one steel; 1 coke per steel like the PBF
// (0.25 in the sinter as dust, 0.75 in the furnace). GTM's primitive blast furnace stays as the slow one-at-a-time route.
//
// Byproduct: GTM's ash dust stands for the slag (the flux lime plus the coke ash; GTM's centrifuge splits ash into quicklime,
// magnesia, potash, soda ash and a little hematite) in the smelting step and for the converter slag in the blowing step. It is
// inert: void it, or keep it for LV, where GTM's chemical reactor makes fertilizer from calcite + 3 ash + water and its
// centrifuge splits it. The top gas (CO2, CO) leaves through the downcomer.
//
// Lookup note (GTM's RecipeDB): no two recipes of one type share a first ingredient: the sinter rows start with different ores,
// the furnace modes start with sinter and with pig iron.
(function () {
  const G = global.grindless

  const TABLE = 'kubejs/data/grindless/tables/steam_blast_furnace.json'
  const FLUX_TAG = 'grindless:blast_furnace_fluxes'
  const BATCH = 4
  const COKE = 'gtceu:coke_gem'
  const COKE_DUST = 'gtceu:coke_dust'
  const SINTER = 'grindless:iron_sinter'
  const PIG_IRON = 'grindless:pig_iron'
  const STEEL = 'gtceu:steel_ingot'
  const ASH = 'gtceu:ash_dust'
  const EUT = 8
  const SINTER_DURATION = 300
  const FURNACE_DURATION = 1200

  var table = G.readJsonTable(TABLE)

  // published for the smoke tests (tools/test/overlay/kubejs/server_scripts/gg_test_steam*.js)
  var SC = G.steamContent || (G.steamContent = {})
  SC.blastFurnace = {
    machine: 'gtceu:steam_blast_furnace',
    type: 'gtceu:steelmaking',
    sinterMachine: 'gtceu:steam_alloy_smelter',
    sinterType: 'gtceu:alloy_smelter',
    batch: BATCH,
    coke: COKE,
    cokeDust: COKE_DUST,
    sinter: SINTER,
    pigIron: PIG_IRON,
    steel: STEEL,
    ash: ASH,
    fluxTag: FLUX_TAG,
    eut: EUT,
    sinterDuration: SINTER_DURATION,
    duration: FURNACE_DURATION,
    pigIronRecipe: 'grindless:steelmaking/pig_iron',
    bessemerRecipe: 'grindless:steelmaking/bessemer_steel',
    feeds: table.feeds.map(function (f) { return { id: f.id, input: f.input, recipe: 'grindless:alloy_smelter/sinter_' + f.id } })
  }

  ServerEvents.tags('item', function (event) {
    event.add(FLUX_TAG, table.fluxes)
  })

  global.grindless.recipes('steam/blast_furnace', function (event) {
    var count = 0
    table.feeds.forEach(function (feed) {
      event.recipes.gtceu.alloy_smelter('grindless:sinter_' + feed.id)
        .itemInputs('4x ' + feed.input, '1x ' + COKE_DUST)
        .itemOutputs('4x ' + SINTER)
        .EUt(EUT).duration(SINTER_DURATION)
      count++
    })

    event.recipes.gtceu.steelmaking('grindless:pig_iron')
      .itemInputs('4x ' + SINTER, '3x ' + COKE, '1x #' + FLUX_TAG)
      .itemOutputs('4x ' + PIG_IRON, '1x ' + ASH)
      .EUt(EUT).duration(FURNACE_DURATION)
    event.recipes.gtceu.steelmaking('grindless:bessemer_steel')
      .itemInputs('4x ' + PIG_IRON)
      .itemOutputs('4x ' + STEEL, '1x ' + ASH)
      .EUt(EUT).duration(FURNACE_DURATION)
    count += 2

    // the controller is built around GTM's Primitive Blast Furnace (the machine it replaces): steel plates, the steam blast
    // pipe and two bronze gears for the blowing engine
    event.recipes.gtceu.shaped('gtceu:steam_blast_furnace', ['DTP', 'GBG', 'CwC'], {
      D: 'grindless:steel_drill_bit',
      P: '#forge:plates/steel',
      T: 'gtceu:bronze_normal_fluid_pipe',
      G: '#forge:gears/bronze',
      B: 'gtceu:primitive_blast_furnace',
      C: 'gtceu:steam_machine_casing'
    }).id('grindless:crafting/steam_blast_furnace')

    console.info('[grindless/steam] ironworks recipes (sinter + pig iron + Bessemer): ' + count)
  })
})()
