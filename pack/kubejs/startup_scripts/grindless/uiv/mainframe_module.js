// priority: -9195
// -----------------------------------------------------------------------------------------------
// The two intermediates of the optical mainframe's compute module (docs/eras/lines-uev-uxv.md, I1 steps 25 and 27; package
// D4-UIV-MAINFRAME): no machine, only items. Their recipes are rows of data/grindless/tables/photonics_uev.json (the photonic
// integration hall, circuits 12 and 13).
// Textures: tools/assets/Build-UIVMainframeModuleTextures.ps1.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var G = global.grindless || (global.grindless = {})
  var MF = G.mainframeModule || (G.mainframeModule = {})

  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  MF.items = {
    photonic_compute_module: { stack: 16 },
    comb_fed_tensor_core: { stack: 16 }
  }

  StartupEvents.registry('item', function (event) {
    Object.keys(MF.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(MF.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })
})()
