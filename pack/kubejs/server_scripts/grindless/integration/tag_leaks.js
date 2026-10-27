// priority: -16124
// -----------------------------------------------------------------------------------------------
// Tag leaks found by the reachability validator (tools/analysis).
// Some mods put their own blocks in GT material tags (forge:storage_blocks/<material>). GTM recipes take those tags as
// input (arc furnace, macerator, recycling), so the modded block turns into the GT material and can open it before its era.
// One entry per leak: tag, item, why.
//   forge:storage_blocks/silicon  expatternprovider:silicon_block (ExtendedAE)
//     ae2:silicon (LV arc smelting) -> ExtendedAE silicon block -> gtceu:arc_furnace/arc_silicon_block -> 9 GT silicon
//     ingots at LV. GT silicon belongs to MV (EBF with a Kanthal coil).
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LEAKS = [
    ['forge:storage_blocks/silicon', 'expatternprovider:silicon_block']
  ]
  ServerEvents.tags('item', function (event) {
    LEAKS.forEach(function (leak) { event.remove(leak[0], leak[1]) })
  })
})()
