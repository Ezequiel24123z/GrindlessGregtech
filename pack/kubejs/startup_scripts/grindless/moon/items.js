// -----------------------------------------------------------------------------------------------
// Items of the Moon (end of HV, DECISIONS.md 2026-10-24: the Moon is the only source of titanium and helium-3):
//   grindless:vein_sample_<vein>     one per vein of data/grindless/tables/veins_moon.json: the ilmenite vein of the lunar mare
//                                    and the regolith (volatiles). Same idea as the Earth samples (not consumed, selects the vein
//                                    in the Lunar Drill), with their own two-layer icon (item/lunar_vein_sample_frame +
//                                    item/lunar_vein_sample_core, tinted). Crafted from what the first visit brings back by hand.
//   grindless:lunar_quantum_seed     the Moon's half of an Earth-Moon quantum pair: made only on the Moon (chemical reactor with
//                                    .dimension('gcyr:luna'), ender pearl + helium-3). Blown up with an AE2 singularity it makes two
//                                    entangled singularities that also work between the Earth and the Moon (server_scripts/
//                                    grindless/moon/quantum_bridge.js).
// It also loads the lunar table into global.grindless.tables.veins_moon, so startup and server scripts share one copy.
// Names / tooltips: client_scripts/grindless/moon_lang.js. Textures: item/lunar_vein_sample_*, item/lunar_quantum_seed.
(function () {
  const G = global.grindless

  G.tables.veins_moon = G.readJsonTable('kubejs/data/grindless/tables/veins_moon.json')
  if (!G.tables.veins_moon || !G.tables.veins_moon.veins || G.tables.veins_moon.veins.length === 0) {
    throw new Error('[grindless/moon] veins_moon.json has no veins')
  }
  console.info('[grindless/moon] loaded ' + G.tables.veins_moon.veins.length + ' lunar veins')

  // GTM material name -> lang key; a material of an addon mod keeps its namespace (gtca:red_zircon -> material.gtca.red_zircon)
  function materialKey(id) {
    var i = id.indexOf(':')
    return i < 0 ? 'material.gtceu.' + id : 'material.' + id.substring(0, i) + '.' + id.substring(i + 1)
  }

  // GTM fluids are named after their material (gtceu:helium_3 -> material.gtceu.helium_3)
  function fluidKey(id) {
    var i = id.indexOf(':')
    return 'material.' + id.substring(0, i) + '.' + id.substring(i + 1)
  }

  function joined(keys) {
    var text = Text.translate(keys[0])
    for (var i = 1; i < keys.length; i++) text = text.append(', ').append(Text.translate(keys[i]))
    return text
  }

  StartupEvents.registry('item', function (event) {
    G.tables.veins_moon.veins.forEach(function (vein) {
      var sample = event.create('grindless:vein_sample_' + vein.id)
        .texture('layer0', 'grindless:item/lunar_vein_sample_frame')
        .texture('layer1', 'grindless:item/lunar_vein_sample_core')
        .color(1, vein.color)
        .maxStackSize(16)
        .tooltip(Text.gray(Text.translate('tooltip.grindless.vein_sample.drill_lunar')))
      if (vein.kind === 'volatiles') {
        sample.tooltip(Text.darkGray(Text.translate('tooltip.grindless.vein_sample.volatiles',
          joined(vein.volatiles.map(function (v) { return fluidKey(v.fluid) })))))
        sample.tooltip(Text.darkGray(Text.translate('tooltip.grindless.vein_sample.daytime')))
      } else {
        sample.tooltip(Text.darkGray(Text.translate('tooltip.grindless.vein_sample.contains',
          joined(vein.materials.map(function (m) { return materialKey(m.id) })))))
        sample.tooltip(Text.darkGray(Text.translate('tooltip.grindless.vein_sample.depth', String(vein.minY), String(vein.maxY))))
      }
      sample.tooltip(Text.aqua(Text.translate('tooltip.grindless.vein_sample.moon')))
      sample.tag('grindless:vein_samples')
      sample.tag('grindless:lunar_vein_samples')
    })

    event.create('grindless:lunar_quantum_seed')
      .texture('grindless:item/lunar_quantum_seed')
      .maxStackSize(16)
      .tooltip(Text.gray(Text.translate('tooltip.grindless.lunar_quantum_seed.0')))
      .tooltip(Text.darkGray(Text.translate('tooltip.grindless.lunar_quantum_seed.1')))
  })
})()
