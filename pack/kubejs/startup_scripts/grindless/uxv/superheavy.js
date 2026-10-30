// priority: -10960
// -----------------------------------------------------------------------------------------------
// UXV's superheavies III (docs/eras/uxv.md, process lines 19-23; package UXV-A1). No new machine: the rows go to older machines
// (see server_scripts/grindless/uxv/superheavy.js). F1's ids (uxv/foundation.js) are not registered again.
//
// New ids:
//   items     element_121_atoms, element_122_atoms, fm257_plated_blank, cm248_plated_blank
//   materials element_121_recoil_gas, element_122_recoil_gas (gases)
// Textures: tools/assets/Build-UXVSuperheavyTextures.ps1. Names: client_scripts/grindless/uxv_superheavy_lang.js.
(function () {
  var G = global.grindless || (global.grindless = {})
  var SH = G.uxvSuperheavyReg || (G.uxvSuperheavyReg = {})

  SH.items = {
    element_121_atoms: { stack: 64 },
    element_122_atoms: { stack: 64 },
    fm257_plated_blank: { stack: 16 },
    cm248_plated_blank: { stack: 16 }
  }

  SH.materials = {
    element_121_recoil_gas: { colour: 0xE8A0F0, formula: '121*' },
    element_122_recoil_gas: { colour: 0xB8A0F8, formula: '122*' }
  }

  StartupEvents.registry('item', function (event) {
    Object.keys(SH.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(SH.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(SH.materials).forEach(function (name) {
      var spec = SH.materials[name]
      var material = event.create(name)
      material.gas()
      material.color(spec.colour).formula(spec.formula)
      material.radioactiveHazard(1)
      material.flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })
})()
