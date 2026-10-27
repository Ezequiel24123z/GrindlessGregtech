// priority: -16024
// -----------------------------------------------------------------------------------------------
// Storage Drawers (storagedrawers): the storage upgrades are the drawer "levels"; the second level is an MV item
// (docs/eras/mv.md, "Mods and integration": level 2 with aluminium and steel plates). Copper (level 1) stays; the iron upgrade asks
// for STEEL PLATES instead of iron ingots and the gold upgrade for ALUMINIUM PLATES instead of gold ingots. Obsidian, diamond,
// emerald and netherite upgrades are built on top of those drawers and keep their materials. The GregTech Storage Drawers addon
// (gtstoragedrawers: rubber / treated wood drawers) only adds drawer frames made of GT wood and needs no gate.
// Era: MV.
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  ServerEvents.recipes(function (event) {
    var swap = function (r, fromTag, toTag) {
      var key = r.json.getAsJsonObject('key')
      var names = key.keySet().toArray()
      var changed = false
      for (var i = 0; i < names.length; i++) {
        var entry = key.get(names[i])
        if (!entry.isJsonObject()) continue
        var o = entry.getAsJsonObject()
        if (o.has('tag') && String(o.get('tag').getAsString()) === fromTag) { o.addProperty('tag', toTag); changed = true }
      }
      if (changed) r.save()
    }
    event.forEachRecipe({ id: 'storagedrawers:iron_storage_upgrade' }, function (r) { swap(r, 'forge:ingots/iron', 'forge:plates/steel') })
    event.forEachRecipe({ id: 'storagedrawers:gold_storage_upgrade' }, function (r) { swap(r, 'forge:ingots/gold', 'forge:plates/aluminium') })
  })
})()
