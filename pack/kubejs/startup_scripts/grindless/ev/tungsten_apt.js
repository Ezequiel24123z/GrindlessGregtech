// priority: -1601
// -----------------------------------------------------------------------------------------------
// D2-APT (docs/eras/lines-ev-zpm.md, section 2 E3): the three materials of EV's tungsten line, scheelite through ammonium paratungstate.
//
//   gtceu:ammonium_tungstate        fluid: tungstic acid dissolved in ammonia, 1,000 mB per mole of tungsten
//   gtceu:ammonium_paratungstate    dust: the APT crystals (one dust per mole of tungsten)
//   gtceu:tungsten_trioxide         dust: the yellow oxide, WO3 (GTM counts it as 4: one mole is 4 dusts)
//
// None has a decomposition recipe: an electrolysis of the oxide would be the shortcut the line replaces.
// Recipes: server_scripts/grindless/ev/tungsten_apt.js. Names: client_scripts/grindless/ev_tungsten_apt_lang.js.
(function () {
  const G = global.grindless || (global.grindless = {})
  const TA = G.evTungstenApt || (G.evTungstenApt = {})

  TA.materials = {
    solution: 'ammonium_tungstate',
    apt: 'ammonium_paratungstate',
    oxide: 'tungsten_trioxide'
  }
  TA.fluids = { solution: 'gtceu:ammonium_tungstate' }
  TA.items = { apt: 'gtceu:ammonium_paratungstate_dust', oxide: 'gtceu:tungsten_trioxide_dust' }

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    event.create(TA.materials.solution)
      .liquid()
      .color(0xE8E4C8)
      .formula('(NH4)2WO4(H2O)')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)

    event.create(TA.materials.apt)
      .dust()
      .color(0xF4F1E8).secondaryColor(0xBDB8A4)
      .iconSet(GTMaterialIconSet.FINE)
      .formula('(NH4)10H2(W12O42)')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)

    event.create(TA.materials.oxide)
      .dust()
      .color(0xE3C820).secondaryColor(0x9C8A12)
      .iconSet(GTMaterialIconSet.FINE)
      .components('1x tungsten', '3x oxygen')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
  })
})()
