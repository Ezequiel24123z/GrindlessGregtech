// priority: -9118
// -----------------------------------------------------------------------------------------------
// UIV casing family (package D4-CASE-UIV, docs/eras/lines-uev-uxv.md section 9): the four new structure blocks a UIV multiblock's
// body is made of. A multiblock's body is its era's own family of casings, each needing a product only that era makes
// (docs/quality/structures.md, "Scale by tier and use"). The two older members, neutron_star_site_casing and uiv_fusion_casing,
// keep their registration in foundation.js and only get new recipes (tables/rx_j1856.json, tables/mk5.json).
//
//   rhea_casing                  structural body of UIV halls and workhorses (a printed RHEA gyroid lattice between RHEA faces)
//   mh_field_casing              field: the passive magnets (metallic hydrogen windings behind a rad-hard controller)
//   multilayer_optics_casing     optical: hydrogen-flushed vacuum optics (La/B4C multilayer, 6.7 nm reflector)
//   dilution_cryostat_casing     cryogenic: millikelvin stages (PrNi5 module, He-3 circulation pump)
//
// Recipes: server_scripts/grindless/uiv/casings.js. Textures: tools/assets/Build-UIVCasingTextures.ps1. Names: client_scripts/grindless/uiv_casings_lang.js.
(function () {
  const G = global.grindless
  const CASINGS = G.uivCasings || (G.uivCasings = {})

  const BLOCKS = {
    rhea_casing: { texture: 'grindless:block/uiv/rhea_casing' },
    mh_field_casing: { texture: 'grindless:block/uiv/mh_field_casing' },
    multilayer_optics_casing: { texture: 'grindless:block/uiv/multilayer_optics_casing' },
    dilution_cryostat_casing: { texture: 'grindless:block/uiv/dilution_cryostat_casing' }
  }

  CASINGS.blocks = Object.keys(BLOCKS).map(function (name) { return 'grindless:' + name })

  StartupEvents.registry('block', function (event) {
    Object.keys(BLOCKS).forEach(function (name) {
      event.create('grindless:' + name)
        .stoneSoundType()
        .hardness(5)
        .resistance(6)
        .requiresTool(true)
        .tagBlock('minecraft:mineable/pickaxe')
        .textureAll(BLOCKS[name].texture)
        .item(function (item) {
          item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
          item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
        })
    })
  })
})()
