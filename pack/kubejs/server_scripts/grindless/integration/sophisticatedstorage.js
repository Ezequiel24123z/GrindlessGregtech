// priority: -15924
// -----------------------------------------------------------------------------------------------
// Sophisticated Storage (sophisticatedstorage): shares the upgrade recipes of Sophisticated Backpacks (library
// sophisticatedcore), so its "advanced" upgrades follow the same MV rule as sophisticatedbackpacks.js: gold ingots -> aluminium
// plates, diamonds -> steel plates. The recipes of the storage tiers (copper / iron / gold / diamond / netherite chests, barrels and
// shulker boxes, and their tier upgrades) stay as the mod has them; their capacity is the pack's, raised in every world by
// startup_scripts/grindless/integration/sophisticatedstorage_tiers.js (table data/grindless/tables/chest_furnace_tiers.json).
// Era: MV (docs/eras/mv.md, "Mods and integration").
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  ServerEvents.recipes(function (event) {
    var SWAPS = {
      'forge:ingots/gold': 'forge:plates/aluminium',
      'forge:gems/diamond': 'forge:plates/steel'
    }
    event.forEachRecipe({ id: /^sophisticatedstorage:advanced_/ }, function (r) {
      var key = r.json.getAsJsonObject('key')
      var names = key.keySet().toArray()
      var changed = false
      for (var i = 0; i < names.length; i++) {
        var entry = key.get(names[i])
        if (!entry.isJsonObject()) continue
        var o = entry.getAsJsonObject()
        if (!o.has('tag')) continue
        var to = SWAPS[String(o.get('tag').getAsString())]
        if (to) { o.addProperty('tag', to); changed = true }
      }
      if (changed) r.save()
    })
  })
})()
