// priority: -6720
// -----------------------------------------------------------------------------------------------
// MV electronic-grade silicon (package D1-SILICON, docs/eras/lines-steam-hv.md section 4, line M2): the Siemens process before every boule.
// No machine of our own and no recipe type: chemical reactor, distillery and EBF (server_scripts/grindless/mv/silicon.js).
//
//   grindless:polysilicon           electronic-grade silicon rods broken to chunks; every GTM boule takes it instead of silicon dust
//   gtceu:crude_trichlorosilane     hydrochlorination product, still carrying SiCl4 (fluid)
//   gtceu:trichlorosilane           the distilled fraction (fluid)
//   gtceu:silicon_tetrachloride_bottoms  the SiCl4-rich bottoms of the distillation, hydrogenated back to crude (fluid)
//
// GTM gives a material created by KubeJS the gtceu: fluid namespace. Names: client_scripts/grindless/mv_family_lang.js.
(function () {
  const G = global.grindless || (global.grindless = {})
  const SI = G.mvSilicon || (G.mvSilicon = {})

  const MATERIALS = {
    'gtceu:crude_trichlorosilane': { colour: 0xA8B8A0, formula: 'HSiCl\u2083 + SiCl\u2084' },
    'gtceu:trichlorosilane': { colour: 0xC8D8C0, formula: 'HSiCl\u2083' },
    'gtceu:silicon_tetrachloride_bottoms': { colour: 0x98A890, formula: 'SiCl\u2084' }
  }

  SI.ids = {
    polysilicon: 'grindless:polysilicon',
    crude: 'gtceu:crude_trichlorosilane',
    trichlorosilane: 'gtceu:trichlorosilane',
    bottoms: 'gtceu:silicon_tetrachloride_bottoms'
  }

  StartupEvents.registry('item', function (event) {
    var item = event.create('grindless:polysilicon')
      .texture('grindless:item/polysilicon')
      .maxStackSize(64)
    item.tooltip(Text.gray(Text.translate('tooltip.grindless.polysilicon.0')))
    item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.polysilicon.1')))
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(MATERIALS).forEach(function (key) {
      var spec = MATERIALS[key]
      event.create(key).liquid().color(spec.colour).formula(spec.formula).flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })
})()
