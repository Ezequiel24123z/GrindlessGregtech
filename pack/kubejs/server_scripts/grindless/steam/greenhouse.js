// priority: -22524
// -----------------------------------------------------------------------------------------------
// gtceu:greenhouse recipes of the Steam Greenhouse, generated from data/greenhouse.js
// (global.grindless.greenhouse).
//
// One recipe per sapling / seed: the catalyst is a NON-CONSUMED input (it is never used up) and the recipe
// gives the logs / crops / resin of the table. 400 ticks and 4 EU/t per run; the steam multiblock runs up to 4 in
// parallel (x1.5 duration): 30 s per cycle, 24 logs per cycle, about 28 mB/t of steam.
//
// No water input: a fluid hatch cannot be made without electricity in GTM 7.5.3 (see recipe_types.js).
(function () {
  const G = global.grindless

  ServerEvents.recipes(function (event) {
    var table = G.greenhouse
    var count = 0

    table.entries.forEach(function (entry) {
      var items = [entry.catalyst].concat(entry.outputs.map(function (o) { return o.item }))
      var missing = items.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error('[grindless/steam] greenhouse ' + entry.id + ' skipped, unknown item(s): ' + missing.join(', '))
        return
      }

      var recipe = event.recipes.gtceu.greenhouse('grindless:' + entry.id)
        .notConsumable(entry.catalyst)
      entry.outputs.forEach(function (o) {
        if (o.chance === undefined) {
          recipe.itemOutputs(o.n + 'x ' + o.item)
        } else {
          recipe.chancedOutput(o.n + 'x ' + o.item, Math.max(1, Math.min(9999, Math.round(o.chance * 10000))), 0)
        }
      })
      recipe.EUt(table.eut).duration(table.duration)
      count++
    })
    console.info('[grindless/steam] greenhouse recipes: ' + count)
  })
})()
