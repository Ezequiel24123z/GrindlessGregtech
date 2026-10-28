// -----------------------------------------------------------------------------------------------
// The items of UIV's optical mainframe line (docs/eras/uiv.md, lines 17 and 22; package UIV-A7): no machine, only items. The recipes
// come from the older tables the package appends to (photonics.json, photonics_uev.json, crystals.json, alpha_centauri.json, the
// fluorspar kiln) and from data/grindless/tables/mainframe.json (server_scripts/grindless/uiv/mainframe.js).
// Textures: tools/assets/Build-UIVMainframeTextures.ps1.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var G = global.grindless || (global.grindless = {})
  var MF = G.mainframe || (G.mainframe = {})

  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  MF.items = {
    pcm_crossbar: { stack: 16 },
    crossbar_on_interposer: { stack: 16 },
    photonic_tensor_core: { stack: 16 },
    thf4: { stack: 16 },
    thf4_film: { stack: 16 },
    capped_thf4_film: { stack: 16 },
    chip_nuclear_clock: { stack: 16 },
    disciplined_clock_core: { stack: 16 }
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
