// -----------------------------------------------------------------------------------------------
// gtceu:greenhouse recipes of the LV Greenhouse (gtceu:lv_greenhouse). The LV greenhouse also runs every steam recipe
// (server_scripts/grindless/steam/greenhouse.js: sapling or seed as a catalyst that is never used up, no water) and adds:
//
//   1. Fertilizer variants, one for every steam recipe: sapling or seed (not consumed) + 1 gtceu:fertilizer (consumed per
//      run) + 100 mB of water + PROGRAMMED CIRCUIT 2  ->  DOUBLE the output in HALF the time (200 ticks, 8 EU/t per run).
//      Circuit 1 or no circuit = the base steam recipe. While a circuit of 2 or more is in a bus the machine ignores the
//      base recipes (see startup_scripts/grindless/lv/multis.js), so the fertilizer recipe is the one that runs.
//      The fertilizer is GTM's own: mixer (dirt + 2 wood dust + 4 sand + water -> 4) or chemical reactor (calcite, calcium,
//      apatite or glauconite + sulfur, TCP, phosphate, ASH or dark ash + water). The ash is where the Submerged Arc
//      Furnace's byproduct goes.
//   2. Extra crops that need water, so only this machine can grow them (the steam greenhouse has no fluid hatch):
//      mushrooms, berries, vines, kelp, bamboo, lily pads and flowers. Same shape as the steam crops: the plant is the
//      catalyst, 6-8 plants per run, 400 ticks, 4 EU/t per run. Destinations: biomass (GTM brewery: mushrooms, berries and
//      kelp), dyes (flowers) and the big boiler; the fertilizer variants exist for them too.
//      (Cocoa is already a steam crop.)
//
// Lookup note (GTM's RecipeDB cannot keep a recipe whose ingredient list is a prefix of another's): a steam recipe is just
// [catalyst], so the fertilizer variants list the FERTILIZER first, then the catalyst, then circuit and water. The extras
// have catalysts no steam recipe uses.
(function () {
  const G = global.grindless
  const LV = G.lv || (G.lv = {})

  const WATER = 'minecraft:water'
  const WATER_MB = 100
  const FERTILIZER = 'gtceu:fertilizer'

  // plants the steam greenhouse does not grow. n = plants per run
  const EXTRAS = [
    { id: 'red_mushroom', item: 'minecraft:red_mushroom', n: 6 },
    { id: 'brown_mushroom', item: 'minecraft:brown_mushroom', n: 6 },
    { id: 'sweet_berries', item: 'minecraft:sweet_berries', n: 6 },
    { id: 'glow_berries', item: 'minecraft:glow_berries', n: 6 },
    { id: 'vine', item: 'minecraft:vine', n: 6 },
    { id: 'kelp', item: 'minecraft:kelp', n: 8 },
    { id: 'bamboo', item: 'minecraft:bamboo', n: 8 },
    { id: 'lily_pad', item: 'minecraft:lily_pad', n: 6 },
    { id: 'dandelion', item: 'minecraft:dandelion', n: 6 },
    { id: 'poppy', item: 'minecraft:poppy', n: 6 },
    { id: 'blue_orchid', item: 'minecraft:blue_orchid', n: 6 },
    { id: 'allium', item: 'minecraft:allium', n: 6 },
    { id: 'azure_bluet', item: 'minecraft:azure_bluet', n: 6 },
    { id: 'red_tulip', item: 'minecraft:red_tulip', n: 6 },
    { id: 'orange_tulip', item: 'minecraft:orange_tulip', n: 6 },
    { id: 'white_tulip', item: 'minecraft:white_tulip', n: 6 },
    { id: 'pink_tulip', item: 'minecraft:pink_tulip', n: 6 },
    { id: 'oxeye_daisy', item: 'minecraft:oxeye_daisy', n: 6 },
    { id: 'cornflower', item: 'minecraft:cornflower', n: 6 },
    { id: 'lily_of_the_valley', item: 'minecraft:lily_of_the_valley', n: 6 },
    { id: 'sunflower', item: 'minecraft:sunflower', n: 6 },
    { id: 'lilac', item: 'minecraft:lilac', n: 6 },
    { id: 'rose_bush', item: 'minecraft:rose_bush', n: 6 },
    { id: 'peony', item: 'minecraft:peony', n: 6 },
    { id: 'torchflower', item: 'minecraft:torchflower', n: 6 }
  ]

  // published for the smoke test: [{ id, catalyst, outputs: [{ item, n, chance? }], extra }] in the shape of the steam table
  LV.greenhouseExtras = EXTRAS.map(function (e) {
    return { id: 'extra_' + e.id, kind: 'extra', catalyst: e.item, outputs: [{ item: e.item, n: e.n }] }
  })

  function addOutputs(recipe, outputs, factor) {
    outputs.forEach(function (o) {
      var n = o.n * factor
      if (o.chance === undefined) {
        recipe.itemOutputs(n + 'x ' + o.item)
      } else {
        recipe.chancedOutput(n + 'x ' + o.item, Math.max(1, Math.min(9999, Math.round(o.chance * 10000))), 0)
      }
    })
  }

  ServerEvents.recipes(function (event) {
    var table = G.greenhouse
    var baseDuration = table.duration
    var baseEut = table.eut
    var fertDuration = Math.round(baseDuration / 2)
    var fertEut = baseEut * 2
    var count = 0

    function fertilizerVariant(entry) {
      var items = [FERTILIZER, entry.catalyst].concat(entry.outputs.map(function (o) { return o.item }))
      var missing = items.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error('[grindless/lv] greenhouse ' + entry.id + ' fertilizer variant skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      var recipe = event.recipes.gtceu.greenhouse('grindless:lv/' + entry.id + '_fertilizer')
        .itemInputs('1x ' + FERTILIZER)
        .notConsumable(entry.catalyst)
        .circuit(2)
        .inputFluids(Fluid.of(WATER, WATER_MB))
      addOutputs(recipe, entry.outputs, 2)
      recipe.EUt(fertEut).duration(fertDuration)
      count++
    }

    // 1. fertilizer variants of the steam recipes
    table.entries.forEach(fertilizerVariant)

    // 2. extra crops: base recipe (water) and fertilizer variant
    LV.greenhouseExtras.forEach(function (entry) {
      var items = [entry.catalyst].concat(entry.outputs.map(function (o) { return o.item }))
      var missing = items.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error('[grindless/lv] greenhouse ' + entry.id + ' skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      var recipe = event.recipes.gtceu.greenhouse('grindless:lv/' + entry.id)
        .notConsumable(entry.catalyst)
        .inputFluids(Fluid.of(WATER, WATER_MB))
      addOutputs(recipe, entry.outputs, 1)
      recipe.EUt(baseEut).duration(baseDuration)
      count++
      fertilizerVariant(entry)
    })

    console.info('[grindless/lv] greenhouse recipes added: ' + count)
  })
})()
