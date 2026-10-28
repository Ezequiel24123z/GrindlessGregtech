// -----------------------------------------------------------------------------------------------
// UIV's isotopes and element 120 (docs/eras/uiv.md, lines 9 and 24, the heads of lines 13, 15, 16, 23, 42 and 44; package UIV-A1). No new
// machine: the calutron, the pyroprocessing cell, the hot cell, the cyclotron, the separator and the MBE reactor are older machines that
// get rows (tables/isotopes.json, transcurium_pyroprocessing.json, hot_cell.json, superheavy.json, photonics.json, zpm/europium.js); the
// steps in GTM's own types are in tables/isotopes_uiv.json (server uiv/isotopes.js). F1's ids (uiv/foundation.js) are not registered again.
//
// New ids:
//   items     cf249_target_wheel, ni58_ti_multilayer, neutron_supermirror, neutron_guide
//   materials titanium_tetrachloride_ice, titanium_50_chloride, titanium_50_sponge, nickel_chloride, nickel_58_chloride,
//             lithium_6_metal (dusts); element_120_recoil_gas (gas)
// Textures: tools/assets/Build-UIVIsotopesTextures.ps1. Names: client_scripts/grindless/uiv_isotopes_lang.js.
// Published: global.grindless.uivIsotopes.
(function () {
  var G = global.grindless || (global.grindless = {})
  var ISO = G.uivIsotopes || (G.uivIsotopes = {})

  ISO.table = 'kubejs/data/grindless/tables/isotopes_uiv.json'

  ISO.items = {
    cf249_target_wheel: { stack: 1 },
    ni58_ti_multilayer: { stack: 64 },
    neutron_supermirror: { stack: 16 },
    neutron_guide: { stack: 16 }
  }

  ISO.materials = {
    titanium_tetrachloride_ice: { form: 'dust', colour: 0xE4ECF4, formula: 'TiCl4' },
    titanium_50_chloride: { form: 'dust', colour: 0xD8E0F0, formula: '50TiCl4' },
    titanium_50_sponge: { form: 'dust', colour: 0xA8AEB8, formula: '50Ti' },
    nickel_chloride: { form: 'dust', colour: 0xB8D890, formula: 'NiCl2' },
    nickel_58_chloride: { form: 'dust', colour: 0xA8E0A0, formula: '58NiCl2' },
    lithium_6_metal: { form: 'dust', colour: 0xD0D4DC, formula: '6Li' },
    element_120_recoil_gas: { form: 'gas', colour: 0xF0A878, formula: '120*' }
  }

  StartupEvents.registry('item', function (event) {
    Object.keys(ISO.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(ISO.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(ISO.materials).forEach(function (name) {
      var spec = ISO.materials[name]
      var material = event.create(name)
      if (spec.form === 'gas') material.gas()
      else material.dust()
      material.color(spec.colour).formula(spec.formula)
      if (name === 'element_120_recoil_gas') material.radioactiveHazard(1)
      material.flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })
})()
