// -----------------------------------------------------------------------------------------------
// Steam Age items of the Steam Vein Drill:
//   grindless:bronze_drill_bit, grindless:steel_drill_bit   wear parts (consumed by chance by the drill)
//   grindless:empty_vein_probe                              crafting ingredient of the samples
//   grindless:vein_sample_<vein>                            one per vein of data/grindless/tables/veins.json;
//                                                           put in the drill's input bus it selects the vein
//                                                           (a non-consumed input of the vein_drilling recipes)
// Names / tooltips live in assets/grindless/lang/{en_us,es_es}.json.
// Textures: item/bronze_drill_bit, item/steel_drill_bit, item/empty_vein_probe, and for the samples two
// layers: item/vein_sample_frame (untinted) + item/vein_sample_core (tinted with the color of the vein).
(function () {
  const G = global.grindless

  StartupEvents.registry('item', function (event) {
    var bronzeBit = event.create('grindless:bronze_drill_bit')
      .texture('grindless:item/bronze_drill_bit')
      .maxStackSize(16)
      .tooltip(Text.gray(Text.translate('tooltip.grindless.bronze_drill_bit')))
    bronzeBit.tag('grindless:drill_bits')

    var steelBit = event.create('grindless:steel_drill_bit')
      .texture('grindless:item/steel_drill_bit')
      .maxStackSize(16)
      .tooltip(Text.gray(Text.translate('tooltip.grindless.steel_drill_bit')))
    steelBit.tag('grindless:drill_bits')

    event.create('grindless:empty_vein_probe')
      .texture('grindless:item/empty_vein_probe')
      .maxStackSize(16)
      .tooltip(Text.gray(Text.translate('tooltip.grindless.empty_vein_probe')))

    G.tables.veins.veins.forEach(function (vein) {
      var sample = event.create('grindless:vein_sample_' + vein.id)
        .texture('layer0', 'grindless:item/vein_sample_frame')
        .texture('layer1', 'grindless:item/vein_sample_core')
        .color(1, vein.color)
        .maxStackSize(16)
        .tooltip(Text.gray(Text.translate('tooltip.grindless.vein_sample')))

      // "Contains: A, B, C" with the GT material names (translated by GTM itself)
      var contents = Text.translate('material.gtceu.' + vein.materials[0].id)
      for (var i = 1; i < vein.materials.length; i++) {
        contents = contents.append(', ').append(Text.translate('material.gtceu.' + vein.materials[i].id))
      }
      sample.tooltip(Text.darkGray(Text.translate('tooltip.grindless.vein_sample.contains', contents)))
      sample.tooltip(Text.darkGray(Text.translate('tooltip.grindless.vein_sample.depth', String(vein.minY), String(vein.maxY))))
      if (vein.maxY < 0) {
        sample.tooltip(Text.red(Text.translate('tooltip.grindless.vein_sample.steel_only')))
      }
      sample.tag('grindless:vein_samples')
    })
  })
})()
