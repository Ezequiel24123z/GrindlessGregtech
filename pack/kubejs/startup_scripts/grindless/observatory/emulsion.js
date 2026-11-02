// -----------------------------------------------------------------------------------------------
// Silver halide emulsion of the photographic plate (docs/eras/lines-steam-hv.md, line L2). GTM 7.5.3, GT-- and GTCA register none of these:
//   gtceu:silver_nitrate_dust, gtceu:silver_chloride_dust, fluid gtceu:photographic_emulsion.
// Recipes: server_scripts/grindless/observatory/recipes.js. Names: client_scripts/grindless/observatory_lang.js.
(function () {
  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    event.create('silver_nitrate')
      .dust()
      .color(0xE6E6F0).secondaryColor(0xA8A8B8)
      .iconSet(GTMaterialIconSet.SHINY)
      .formula('AgNO3')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)

    event.create('silver_chloride')
      .dust()
      .color(0xE8E4DC).secondaryColor(0xB8B2A6)
      .iconSet(GTMaterialIconSet.DULL)
      .formula('AgCl')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)

    event.create('photographic_emulsion')
      .liquid()
      .color(0xD9CFA8)
      .formula('AgCl(gelatin)')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
  })
})()
