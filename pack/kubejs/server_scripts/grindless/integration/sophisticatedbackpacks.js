// priority: -15824
// -----------------------------------------------------------------------------------------------
// Sophisticated Backpacks (sophisticatedbackpacks): the second tier of upgrades is an MV item.
//   Tier 1 stays as the mod has it (leather / copper / iron backpack, stack upgrades up to tier 1, basic upgrades): LV.
//   Tier 2 (MV): the "advanced" upgrades (filter, magnet, pickup, feeding, restock, deposit, jukebox, tool swapper, pump,
//   auto smelting/blasting/smoking, alchemy...), the gold backpack and the tier 2 stack upgrade (+ its two conversions) swap
//   gold ingots / gold blocks -> ALUMINIUM PLATES and diamonds -> STEEL PLATES. Everything above (diamond and netherite
//   backpack, tier 3 and 4 stack upgrades) builds on the tier 2 item, so it is gated through it.
// The recipes keep their own types (sophisticatedcore:upgrade_next_tier, sophisticatedbackpacks:backpack_upgrade), which copy the
// contents of the old backpack/upgrade into the new one: only the ingredient tags inside `key` are rewritten.
// Era: MV (docs/eras/mv.md, "Mods and integration").
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  ServerEvents.recipes(function (event) {
    var SWAPS = {
      'forge:ingots/gold': 'forge:plates/aluminium',
      'forge:storage_blocks/gold': 'forge:plates/aluminium',
      'forge:gems/diamond': 'forge:plates/steel'
    }
    var rewrite = function (r) {
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
    }
    event.forEachRecipe({ id: /^sophisticatedbackpacks:advanced_/ }, rewrite)
    event.forEachRecipe({ id: 'sophisticatedbackpacks:gold_backpack' }, rewrite)
    event.forEachRecipe({ id: /^sophisticatedbackpacks:stack_upgrade_(starter_tier_to_tier_2_conversion|tier_1_to_tier_2_conversion|tier_2)$/ }, rewrite)
  })
})()
