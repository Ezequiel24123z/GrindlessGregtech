// priority: -5100
// -----------------------------------------------------------------------------------------------
// LV items of the electric multiblocks:
//   grindless:graphite_electrode     wear part of the Submerged Arc Furnace (consumed by chance, ~3 % of the cycles)
//   grindless:vein_sample_<vein>     one per vein of data/grindless/tables/veins_nether.json: the vein samples of the
//                                    Nether table. Same two-layer icon as the Overworld samples (item/vein_sample_frame +
//                                    item/vein_sample_core, tinted); put in the input bus of the LV Vein Drill with a drill
//                                    bit and drilling fluid in the fluid hatch it selects the vein.
//   grindless:vein_sample_<vein>     one per vein of data/grindless/tables/veins_overworld_extra.json: the Overworld veins
//                                    other mods add (GT--: kaolinite, wollastonite). Same icon; they drill in the Steam
//                                    Vein Drill like the 22 of veins.json, so they carry the steam tooltip.
// It also loads the Nether and the extra Overworld vein tables into global.grindless.tables.veins_nether /
// veins_overworld_extra (the main Overworld one is loaded by lib/tables.js), so startup and server scripts share a single copy.
// Names / tooltips: client_scripts/grindless/lv_multis_lang.js (en_us / es_es).
// Textures: item/graphite_electrode (drawn with the machine overlays); the samples reuse the steam ones.
(function () {
  const G = global.grindless

  G.tables.veins_nether = G.readJsonTable('kubejs/data/grindless/tables/veins_nether.json')
  if (!G.tables.veins_nether || !G.tables.veins_nether.veins || G.tables.veins_nether.veins.length === 0) {
    throw new Error('[grindless/lv] veins_nether.json has no veins')
  }
  console.info('[grindless/lv] loaded ' + G.tables.veins_nether.veins.length + ' Nether veins')

  G.tables.veins_overworld_extra = G.readJsonTable('kubejs/data/grindless/tables/veins_overworld_extra.json')
  if (!G.tables.veins_overworld_extra || !G.tables.veins_overworld_extra.veins || G.tables.veins_overworld_extra.veins.length === 0) {
    throw new Error('[grindless/lv] veins_overworld_extra.json has no veins')
  }
  console.info('[grindless/lv] loaded ' + G.tables.veins_overworld_extra.veins.length + ' extra Overworld veins')

  // GTM material name -> lang key; a material of an addon mod keeps its namespace (gtca:germanite -> material.gtca.germanite)
  function materialKey(id) {
    var i = id.indexOf(':')
    return i < 0 ? 'material.gtceu.' + id : 'material.' + id.substring(0, i) + '.' + id.substring(i + 1)
  }

  // "Contains: A, B, C" with the GT material names (translated by GTM itself)
  function contentsOf(vein) {
    var contents = Text.translate(materialKey(vein.materials[0].id))
    for (var i = 1; i < vein.materials.length; i++) {
      contents = contents.append(', ').append(Text.translate(materialKey(vein.materials[i].id)))
    }
    return contents
  }

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

      sample.tooltip(Text.darkGray(Text.translate('tooltip.grindless.vein_sample.contains', contentsOf(vein))))
      sample.tooltip(Text.darkGray(Text.translate('tooltip.grindless.vein_sample.depth', String(vein.minY), String(vein.maxY))))
      sample.tooltip(Text.red(Text.translate('tooltip.grindless.vein_sample.nether')))
      sample.tag('grindless:vein_samples')
    })

    G.tables.veins_overworld_extra.veins.forEach(function (vein) {
      var sample = event.create('grindless:vein_sample_' + vein.id)
        .texture('layer0', 'grindless:item/vein_sample_frame')
        .texture('layer1', 'grindless:item/vein_sample_core')
        .color(1, vein.color)
        .maxStackSize(16)
        .tooltip(Text.gray(Text.translate('tooltip.grindless.vein_sample')))

      sample.tooltip(Text.darkGray(Text.translate('tooltip.grindless.vein_sample.contains', contentsOf(vein))))
      sample.tooltip(Text.darkGray(Text.translate('tooltip.grindless.vein_sample.depth', String(vein.minY), String(vein.maxY))))
      if (vein.maxY < 0) {
        sample.tooltip(Text.red(Text.translate('tooltip.grindless.vein_sample.steel_only')))
      }
      sample.tag('grindless:vein_samples')
    })
  })
})()
