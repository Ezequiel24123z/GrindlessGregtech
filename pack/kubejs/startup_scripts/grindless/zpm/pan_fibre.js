// priority: -11650
// -----------------------------------------------------------------------------------------------
// ZPM's PAN carbon fibre (docs/eras/lines-ev-zpm.md section 5, Z4; package D2-PAN): the materials and items of Titan's carbon-fibre line.
//   gtceu:acrylonitrile        (liquid, C3H3N)   the nitrile mix's main cut, fractionated
//   gtceu:polyacrylonitrile    (dust, C3H3N)     one dust a monomer
//   grindless:pan_precursor_fibre, grindless:stabilised_pan_fibre   one item a monomer (stabilised: C3HN)
// Recipes: server_scripts/grindless/zpm/pan_fibre.js. Names: client_scripts/grindless/zpm_pan_fibre_lang.js.
// Textures: grindless:item/<id> (tools/assets/Build-ZPMPanFibreTextures.ps1). Published: global.grindless.zpmPanFibre.
(function () {
  const G = global.grindless || (global.grindless = {})
  const PF = G.zpmPanFibre || (G.zpmPanFibre = {})

  PF.acrylonitrile = 'acrylonitrile'
  PF.polyacrylonitrile = 'polyacrylonitrile'
  PF.precursor = 'grindless:pan_precursor_fibre'
  PF.stabilised = 'grindless:stabilised_pan_fibre'

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    event.create(PF.acrylonitrile)
      .liquid()
      .color(0xE9E1A8)
      .components('3x carbon', '3x hydrogen', '1x nitrogen')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    event.create(PF.polyacrylonitrile)
      .dust()
      .color(0xE8EAEE).secondaryColor(0xA9AEB8)
      .iconSet(GTMaterialIconSet.DULL)
      .components('3x carbon', '3x hydrogen', '1x nitrogen')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
  })

  StartupEvents.registry('item', function (event) {
    event.create(PF.precursor).texture('grindless:item/pan_precursor_fibre')
      .tooltip(Text.gray(Text.translate('tooltip.grindless.pan_precursor_fibre.0')))
    event.create(PF.stabilised).texture('grindless:item/stabilised_pan_fibre')
      .tooltip(Text.gray(Text.translate('tooltip.grindless.stabilised_pan_fibre.0')))
  })
})()
