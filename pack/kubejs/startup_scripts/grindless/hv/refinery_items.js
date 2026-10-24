// -----------------------------------------------------------------------------------------------
// Items of the HV refining line (both are the "condition" of a multiblock, like the drill bits and the graphite electrode of the lower tiers):
//   grindless:hydrotreating_catalyst   cobalt and molybdenum on silica. Goes in the input bus of the Refinery (gtceu:refinery); used up
//                                      by chance, about 0.05 % of the runs. Made in a mixer (server_scripts/grindless/hv/refinery_crafting.js)
//   grindless:reforming_catalyst       platinum on silica. Goes in the input bus of the Catalytic Reformer (gtceu:reformer); same wear.
//                                      The platinum comes from the sheldonite vein of the End
// Names / tooltips: client_scripts/grindless/hv_refinery_lang.js. Textures: item/hydrotreating_catalyst, item/reforming_catalyst.
(function () {
  StartupEvents.registry('item', function (event) {
    event.create('grindless:hydrotreating_catalyst')
      .texture('grindless:item/hydrotreating_catalyst')
      .maxStackSize(16)
      .tooltip(Text.gray(Text.translate('tooltip.grindless.hydrotreating_catalyst')))

    event.create('grindless:reforming_catalyst')
      .texture('grindless:item/reforming_catalyst')
      .maxStackSize(16)
      .tooltip(Text.gray(Text.translate('tooltip.grindless.reforming_catalyst')))
  })
})()
