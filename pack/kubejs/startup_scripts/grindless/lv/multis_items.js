// -----------------------------------------------------------------------------------------------
// LV items of the electric multiblocks:
//   grindless:graphite_electrode     wear part of the Submerged Arc Furnace (consumed by chance, ~3 % of the cycles)
//   grindless:vein_sample_<vein>     one per vein of data/grindless/tables/veins_nether.json: the vein samples of the
//                                    Nether table. Same two-layer icon as the Overworld samples (item/vein_sample_frame +
//                                    item/vein_sample_core, tinted); put in the input bus of the LV Vein Drill with a drill
//                                    bit and drilling fluid in the fluid hatch it selects the vein.
// It also loads the Nether vein table into global.grindless.tables.veins_nether (the Overworld one is loaded by
// lib/tables.js), so startup and server scripts share a single copy.
// Names / tooltips: client_scripts/grindless/lv_multis_lang.js (en_us / es_es).
// Textures: item/graphite_electrode (drawn with the machine overlays); the samples reuse the steam ones.
(function () {
  const G = global.grindless

  G.tables.veins_nether = G.readJsonTable('kubejs/data/grindless/tables/veins_nether.json')
  if (!G.tables.veins_nether || !G.tables.veins_nether.veins || G.tables.veins_nether.veins.length === 0) {
    throw new Error('[grindless/lv] veins_nether.json has no veins')
  }
  console.info('[grindless/lv] loaded ' + G.tables.veins_nether.veins.length + ' Nether veins')

  StartupEvents.registry('item', function (event) {
    event.create('grindless:graphite_electrode')
      .texture('grindless:item/graphite_electrode')
      .maxStackSize(16)
      .tooltip(Text.gray(Text.translate('tooltip.grindless.graphite_electrode')))

    G.tables.veins_nether.veins.forEach(function (vein) {
      var sample = event.create('grindless:vein_sample_' + vein.id)
        .texture('layer0', 'grindless:item/vein_sample_frame')
        .texture('layer1', 'grindless:item/vein_sample_core')
        .color(1, vein.color)
        .maxStackSize(16)
        .tooltip(Text.gray(Text.translate('tooltip.grindless.vein_sample.drill_lv')))

      var contents = Text.translate('material.gtceu.' + vein.materials[0].id)
      for (var i = 1; i < vein.materials.length; i++) {
        contents = contents.append(', ').append(Text.translate('material.gtceu.' + vein.materials[i].id))
      }
      sample.tooltip(Text.darkGray(Text.translate('tooltip.grindless.vein_sample.contains', contents)))
      sample.tooltip(Text.darkGray(Text.translate('tooltip.grindless.vein_sample.depth', String(vein.minY), String(vein.maxY))))
      sample.tooltip(Text.red(Text.translate('tooltip.grindless.vein_sample.nether')))
      sample.tag('grindless:vein_samples')
    })
  })
})()
