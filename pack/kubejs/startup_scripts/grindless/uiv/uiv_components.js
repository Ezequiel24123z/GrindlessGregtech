// priority: -9249
// -----------------------------------------------------------------------------------------------
// UIV's pump, robot arm and motor lines (docs/eras/uiv.md, lines 6, 8 and 23; package UIV-A8): no machine, only the items the lines pass
// between the older machines (the powder bed printer, the megabar press, the fuel plant, the coated conductor line, the HTS magnet works,
// the nitride magnet works, the levitation melter) and GTM's own types. The recipes: data/grindless/tables/uiv_components.json
// (server_scripts/grindless/uiv/uiv_components.js) and one row each in the six older tables, marked UIV-A8.
// Textures: tools/assets/Build-UIVUivComponentsTextures.ps1. Names: client_scripts/grindless/uiv_uiv_components_lang.js.
(function () {
  const G = global.grindless
  const UC = G.uivComponents || (G.uivComponents = {})

  UC.table = 'kubejs/data/grindless/tables/uiv_components.json'
  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  UC.items = {
    rhea_am_powder: { stack: 64 },
    near_net_rhea_impeller: { stack: 16 },
    printed_rhea_impeller: { stack: 16 },
    dense_rhea_impeller: { stack: 16 },
    machined_rhea_impeller: { stack: 16 },
    balanced_rhea_impeller: { stack: 16 },
    rhea_swarf: { stack: 64 },
    zirconium_sponge: { stack: 64 },
    bmg_blank: { stack: 16 },
    bmg_gate: { stack: 64 },
    bmg_flexspline: { stack: 16 },
    strain_wave_gear: { stack: 16 },
    ba_cu_blend: { stack: 64 },
    bulk_gdbco: { stack: 16 },
    oxygenated_gdbco: { stack: 16 },
    impregnated_gdbco: { stack: 16 },
    field_cooled_gdbco: { stack: 16 }
  }

  StartupEvents.registry('item', function (event) {
    Object.keys(UC.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(UC.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })
})()
