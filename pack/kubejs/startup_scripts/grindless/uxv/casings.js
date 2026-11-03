// priority: -10740
// -----------------------------------------------------------------------------------------------
// UXV casing family (package D4-CASE-UXV, docs/eras/lines-uev-uxv.md section 9): the four new structure blocks a UXV multiblock's
// body is made of. A multiblock's body is its era's own family of casings, each needing a product only that era makes
// (docs/quality/structures.md, "Scale by tier and use"). uxv_fusion_casing keeps its registration in foundation.js and only gets a new
// recipe (tables/fusion_mk6.json). UXV has no thermal casing: no UXV process needs more heat than the metallic hydrogen coil gives.
//
//   gum_metal_casing          structural body of every UXV structure (superelastic gum metal frame, W-184 fibre panels)
//   mu_metal_shield_casing    magnetic shielding: the field-free rooms (annealed mu-metal)
//   pulsed_field_casing       field: the pulsed magnets (Ga2O3 switches and Finemet induction cores)
//   pasta_containment_casing  containment of nuclear pasta at Vela (FRC cartridges and UIV cage parts)
//
// Recipes: server_scripts/grindless/uxv/casings.js. Textures: tools/assets/Build-UXVCasingTextures.ps1. Names: client_scripts/grindless/uxv_casings_lang.js.
(function () {
  const G = global.grindless
  const CASINGS = G.uxvCasings || (G.uxvCasings = {})

  const BLOCKS = {
    gum_metal_casing: { texture: 'grindless:block/uxv/gum_metal_casing' },
    mu_metal_shield_casing: { texture: 'grindless:block/uxv/mu_metal_shield_casing' },
    pulsed_field_casing: { texture: 'grindless:block/uxv/pulsed_field_casing' },
    pasta_containment_casing: { texture: 'grindless:block/uxv/pasta_containment_casing' }
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
