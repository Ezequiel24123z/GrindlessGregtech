// priority: -7477
// -----------------------------------------------------------------------------------------------
// UEV casing family (package D4-CASE-UEV, docs/eras/lines-uev-uxv.md section 9): the three new structure blocks a UEV multiblock's
// body is made of. A multiblock's body is its era's own family of casings, each needing a product only that era makes
// (docs/quality/structures.md, "Scale by tier and use"). The two older members, photonic_casing and degenerate_containment_casing,
// keep their registration in foundation.js and only get new recipes (tables/photonics_uev.json, tables/sirius.json).
//
//   sic_composite_casing         structural body of UEV halls and workhorses (SiC/SiC sandwich with 6N Ta inserts)
//   superhydride_magnet_casing   field: the passive magnets (lay superhydride winding on a Fe16N2 yoke)
//   hftacn_lining_casing         thermal: the hot-zone lining of the furnaces ((Hf,Ta)CN bricks)
//
// Recipes: server_scripts/grindless/uev/casings.js. Textures: tools/assets/Build-UEVCasingTextures.ps1. Names: client_scripts/grindless/uev_casings_lang.js.
(function () {
  const G = global.grindless
  const CASINGS = G.uevCasings || (G.uevCasings = {})

  const BLOCKS = {
    sic_composite_casing: { texture: 'grindless:block/uev/sic_composite_casing' },
    superhydride_magnet_casing: { texture: 'grindless:block/uev/superhydride_magnet_casing' },
    hftacn_lining_casing: { texture: 'grindless:block/uev/hftacn_lining_casing' }
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
