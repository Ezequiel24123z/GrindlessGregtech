// priority: -5400
// -----------------------------------------------------------------------------------------------
// Mars, end of EV (docs/eras/ev.md, "Mars, end of EV"): what Mars brings that must exist at startup.
//
//   GT material deuterium_rich_ice   the third thing only Mars gives: water ice with about five times the deuterium of Earth's water
//                                    (D/H ~8e-4 against ~1.6e-4: Mars lost most of its hydrogen to space and kept the heavy isotope).
//                                    Dust and ore (gtceu:mars_deuterium_rich_ice_ore is the one that generates, in the Mars ice vein;
//                                    GTM makes the ore in every stone type), raw, crushed, purified, refined and dust forms. Ore
//                                    byproducts gypsum and salt, the salts it is crusted with. DISABLE_DECOMPOSITION and
//                                    NO_ORE_SMELTING: nothing splits it or smelts it here. Its use is IV: melted and enriched into heavy
//                                    water (D2O) for fusion; until then it is stored.
//   grindless:vein_sample_<vein>     one per vein of data/grindless/tables/veins_mars.json (scheelite_mars, merrillite_mars, ice_mars):
//                                    the same idea as the Earth and Moon samples (never used up, it selects the vein in the EV tripod
//                                    on Mars), with its own two-layer icon (item/martian_vein_sample_frame + item/martian_vein_sample_core,
//                                    tinted). Crafted from what the first visit brings back by hand (server_scripts/grindless/mars/travel.js).
// It also loads the Mars table into global.grindless.tables.veins_mars, so startup and server scripts (and the EV tripod) share one
// copy, and publishes the ids in global.grindless.marsTravel for the server script and the test.
// Names / tooltips: client_scripts/grindless/mars_travel_lang.js. Textures: tools/assets/Build-MarsTravelTextures.ps1.
(function () {
  const G = global.grindless
  const MT = G.marsTravel || (G.marsTravel = {})

  G.tables.veins_mars = G.readJsonTable('kubejs/data/grindless/tables/veins_mars.json')
  if (!G.tables.veins_mars || !G.tables.veins_mars.veins || G.tables.veins_mars.veins.length === 0) {
    throw new Error('[grindless/mars] veins_mars.json has no veins')
  }
  console.info('[grindless/mars] loaded ' + G.tables.veins_mars.veins.length + ' Mars veins')

  MT.materials = { ice: 'deuterium_rich_ice' }
  MT.ids = {
    iceRaw: 'gtceu:raw_deuterium_rich_ice',
    iceDust: 'gtceu:deuterium_rich_ice_dust',
    iceMarsOre: 'gtceu:mars_deuterium_rich_ice_ore',
    probe: 'grindless:empty_vein_probe'
  }
  MT.samples = G.tables.veins_mars.veins.map(function (vein) { return 'grindless:vein_sample_' + vein.id })

  // GTM material name -> lang key; a material of an addon mod keeps its namespace (gtca:red_zircon -> material.gtca.red_zircon)
  function materialKey(id) {
    var i = id.indexOf(':')
    return i < 0 ? 'material.gtceu.' + id : 'material.' + id.substring(0, i) + '.' + id.substring(i + 1)
  }

  function joined(keys) {
    var text = Text.translate(keys[0])
    for (var i = 1; i < keys.length; i++) text = text.append(', ').append(Text.translate(keys[i]))
    return text
  }

  // ---------------------------------------------------------------- GT material

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    event.create(MT.materials.ice)
      .dust(1)
      .ore()
      .addOreByproducts(GTMaterials.Gypsum, GTMaterials.Salt)
      .color(0xD6E9F5).secondaryColor(0x8C6E5A)
      .iconSet(GTMaterialIconSet.SHINY)
      .formula('H2O + HDO')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION, GTMaterialFlags.NO_ORE_SMELTING, GTMaterialFlags.NO_SMASHING)
  })

  // ---------------------------------------------------------------- Mars vein samples

  StartupEvents.registry('item', function (event) {
    G.tables.veins_mars.veins.forEach(function (vein) {
      var sample = event.create('grindless:vein_sample_' + vein.id)
        .texture('layer0', 'grindless:item/martian_vein_sample_frame')
        .texture('layer1', 'grindless:item/martian_vein_sample_core')
        .color(1, vein.color)
        .maxStackSize(16)
        .tooltip(Text.gray(Text.translate('tooltip.grindless.vein_sample.drill_martian')))
        .tooltip(Text.darkGray(Text.translate('tooltip.grindless.vein_sample.contains',
          joined(vein.materials.map(function (m) { return materialKey(m.id) })))))
        .tooltip(Text.darkGray(Text.translate('tooltip.grindless.vein_sample.depth', String(vein.minY), String(vein.maxY))))
        .tooltip(Text.red(Text.translate('tooltip.grindless.vein_sample.mars')))
      sample.tag('grindless:vein_samples')
      sample.tag('grindless:martian_vein_samples')
    })
  })
})()
