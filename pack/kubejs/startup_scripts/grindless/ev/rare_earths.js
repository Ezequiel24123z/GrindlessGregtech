// -----------------------------------------------------------------------------------------------
// D2-REE (docs/eras/lines-ev-zpm.md, section 2 E1, steps 16'-18'): the two fluids of the samaric branch of EV's rare-earth trunk.
//
//   gtceu:seg_chloride_solution              the samaric concentrate dissolved in hydrochloric acid: the chlorides of the samarium-europium-
//                                            gadolinium (SEG) cut and the heavies (Sm, Eu, Gd, Tb, Ho), 1,000 mB per mole of rare earth
//   gtceu:heavy_rare_earth_chloride_solution what stays after the europium is stripped (Sm, Gd, Tb, Ho chlorides): the feed of the
//                                            fluoride precipitation that makes GTCA's fluorinated samaric concentrate
//
// Both are acidic liquids with no components and no decomposition: only the large chemical reactor and the extraction cascade
// (server_scripts/grindless/ev/rare_earths.js, extraction_cascade.js) make or take them. Names: client_scripts/grindless/ev_rare_earths_lang.js.
(function () {
  const G = global.grindless || (global.grindless = {})
  const RE = G.evRareEarths || (G.evRareEarths = {})

  RE.materials = {
    seg: 'seg_chloride_solution',
    heavy: 'heavy_rare_earth_chloride_solution'
  }
  RE.fluids = {
    seg: 'gtceu:seg_chloride_solution',
    heavy: 'gtceu:heavy_rare_earth_chloride_solution'
  }

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    event.create(RE.materials.seg)
      .liquid(new GTFluidBuilder().attribute(GTFluidAttributes.ACID))
      .color(0xD9B9E8)
      .formula('(Sm,Eu,Gd,Tb,Ho)Cl3(H2O)')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)

    event.create(RE.materials.heavy)
      .liquid(new GTFluidBuilder().attribute(GTFluidAttributes.ACID))
      .color(0xB98FCB)
      .formula('(Sm,Gd,Tb,Ho)Cl3(H2O)')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
  })
})()
