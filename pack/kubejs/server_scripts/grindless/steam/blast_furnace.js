// priority: -22224
// -----------------------------------------------------------------------------------------------
// gtceu:steelmaking recipes of the Steam Blast Furnace (gtceu:steam_blast_furnace), its flux tag and its controller.
//
// One recipe per feed of kubejs/data/grindless/tables/steam_blast_furnace.json (raw and crushed iron ores, iron ingot and dust):
//   4 feed + 4 coke + 1 flux (#grindless:blast_furnace_fluxes: raw calcite, calcite dust or a calcite block)
//     -> 4 steel ingots + 1 ash dust                                    8 EU/t, 2 400 ticks per batch of 4
// The steam multiblock runs 4 batches at once and 1.5x slower: 16 steel every 3 600 ticks (180 s, about 5.3 steel a minute),
// drawing about 57 mB/t of steam (12 800 mB per steel).
//
// Against GTM (gtceu:primitive_blast_furnace): 1 iron ingot + 1 coke -> 1 steel + 1/9 ash in 1 500 ticks, one at a time, and the
// ore has to be smelted into ingots first. Here the furnace step and the PBF are one machine, it takes the ore itself and one
// structure makes as much steel as about 6.7 PBFs. It costs steam (the PBF burns nothing else), a coke line, a calcite line
// and a bigger build. Yield is GT's: 1 steel per raw ore (smelting gives 1 ingot) and 1 per crushed ore (macerating first
// gives 2 crushed, so 2 steel), 1 coke per steel like the PBF.
//
// Byproduct: GTM's ash dust stands for the slag (the flux lime plus the coke ash; GTM's centrifuge splits ash into quicklime,
// magnesia, potash, soda ash and a little hematite). It is inert: void it, or keep it for LV, where GTM's chemical reactor makes
// fertilizer from calcite + 3 ash + water and its centrifuge splits it. The top gas (CO2, CO) leaves through the downcomer.
//
// Lookup note (GTM's RecipeDB): every recipe starts with a different feed, so no ingredient list is a prefix of another.
(function () {
  const G = global.grindless

  const TABLE = 'kubejs/data/grindless/tables/steam_blast_furnace.json'
  const FLUX_TAG = 'grindless:blast_furnace_fluxes'
  const BATCH = 4
  const COKE = 'gtceu:coke_gem'
  const STEEL = 'gtceu:steel_ingot'
  const ASH = 'gtceu:ash_dust'
  const EUT = 8
  const DURATION = 2400

  var table = G.readJsonTable(TABLE)

  // published for the smoke test (tools/test/overlay/kubejs/server_scripts/gg_test_steam_content.js)
  var SC = G.steamContent || (G.steamContent = {})
  SC.blastFurnace = {
    machine: 'gtceu:steam_blast_furnace',
    type: 'gtceu:steelmaking',
    batch: BATCH,
    coke: COKE,
    steel: STEEL,
    ash: ASH,
    fluxTag: FLUX_TAG,
    eut: EUT,
    duration: DURATION,
    feeds: table.feeds.map(function (f) { return { id: f.id, input: f.input, recipe: 'grindless:steelmaking/' + f.id } })
  }

  ServerEvents.tags('item', function (event) {
    event.add(FLUX_TAG, table.fluxes)
  })

  ServerEvents.recipes(function (event) {
    var count = 0
    table.feeds.forEach(function (feed) {
      event.recipes.gtceu.steelmaking('grindless:' + feed.id)
        .itemInputs(BATCH + 'x ' + feed.input, BATCH + 'x ' + COKE, '1x #' + FLUX_TAG)
        .itemOutputs(BATCH + 'x ' + STEEL, '1x ' + ASH)
        .EUt(EUT).duration(DURATION)
      count++
    })

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

    console.info('[grindless/steam] steelmaking recipes: ' + count)
  })
})()
