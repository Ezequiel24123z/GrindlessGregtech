// LuV germanium line L4 (package D2-GERMANIUM, docs/eras/lines-ev-zpm.md section 4): Io's chlorination, scrub, hydrolysis, reduction, boule and wafer.
// Recipes: server_scripts/grindless/luv/germanium.js. Names: client_scripts/grindless/luv_germanium_lang.js.
(function () {
  var G = global.grindless
  var GE = G.germanium || (G.germanium = {})

  // item name -> stack size; every item carries one tooltip line (tooltip.grindless.<name>.0)
  var ITEMS = { germanium_boule: 16, germanium_wafer: 64 }
  var MATERIALS = ['germanium_dioxide', 'indium_chloride']

  GE.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })
  GE.materials = MATERIALS.map(function (name) { return 'gtceu:' + name })

  StartupEvents.registry('item', function (event) {
    Object.keys(ITEMS).forEach(function (name) {
      event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(ITEMS[name])
        .tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    event.create('germanium_dioxide')
      .dust()
      .color(0xE8E8F0)
      .iconSet(GTMaterialIconSet.DULL)
      .formula('GeO2')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)

    event.create('indium_chloride')
      .dust()
      .color(0xB9C3E6)
      .iconSet(GTMaterialIconSet.DULL)
      .formula('InCl3')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
  })
})()
