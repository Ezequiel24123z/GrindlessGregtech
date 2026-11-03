// -----------------------------------------------------------------------------------------------
// Ids of UV's thorium front end (docs/eras/lines-uv-uhv.md, V1 rows 2-12; package D3-TH-FRONT): the THOREX solvent line and the fuel
// fabrication rows that turn thoria into pins. Recipes: server_scripts/grindless/uv/thorium_refining.js (table tables/thorium_refining.json)
// and the fabrication rows of tables/thorium_fabrication.json. No machine or recipe type is new.
//
//   items      thoria_pellet, thorium_nitride_pellet, thoria_fuel_pin, thorium_nitride_fuel_pin, cladding_tube_15_15ti
//   materials  fluids n_butanol, tributyl_phosphate, tbp_solvent, loaded_tbp_solvent, crude_thorium_nitrate, thorium_nitrate;
//              dusts thorium_oxalate, thoria
// Textures: tools/assets/Build-UVThoriumRefiningTextures.ps1. Names: client_scripts/grindless/uv_thorium_refining_lang.js.
// Published for the recipe script and the smoke test: global.grindless.thoriumRefining (.items, .materials, .ids).
(function () {
  const G = global.grindless || (global.grindless = {})
  const TR = G.thoriumRefining || (G.thoriumRefining = {})

  const ITEMS = {
    thoria_pellet: { stack: 64 },
    thorium_nitride_pellet: { stack: 64 },
    thoria_fuel_pin: { stack: 16 },
    thorium_nitride_fuel_pin: { stack: 16 },
    cladding_tube_15_15ti: { stack: 64 }
  }

  // GT material name -> form, colour and formula (GTM colours, buckets and names them)
  const MATERIALS = {
    n_butanol: { form: 'liquid', colour: 0xE8D8A0, formula: 'C4H9OH' },
    tributyl_phosphate: { form: 'liquid', colour: 0xD8E0C0, formula: '(C4H9O)3PO' },
    tbp_solvent: { form: 'liquid', colour: 0xC8D8A8, formula: '(C4H9O)3PO(C12H26)' },
    loaded_tbp_solvent: { form: 'liquid', colour: 0x9ED08A, formula: 'Th(NO3)4(TBP)2' },
    crude_thorium_nitrate: { form: 'liquid', colour: 0xB8C890, formula: 'Th(NO3)4(aq)' },
    thorium_nitrate: { form: 'liquid', colour: 0xE0F0C0, formula: 'Th(NO3)4' },
    thorium_oxalate: { form: 'dust', colour: 0xF0F0E0, formula: 'Th(C2O4)2' },
    thoria: { form: 'dust', colour: 0xF4F4F0, formula: 'ThO2' }
  }

  TR.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })
  TR.materials = Object.keys(MATERIALS).map(function (name) { return 'gtceu:' + name })
  TR.ids = {}
  Object.keys(ITEMS).concat(Object.keys(MATERIALS)).forEach(function (name) {
    TR.ids[name] = (MATERIALS[name] ? 'gtceu:' : 'grindless:') + name
  })

  StartupEvents.registry('item', function (event) {
    Object.keys(ITEMS).forEach(function (name) {
      event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(ITEMS[name].stack)
        .tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
        .tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(MATERIALS).forEach(function (name) {
      var spec = MATERIALS[name]
      var material = event.create(name)
      if (spec.form === 'liquid') material.liquid()
      else material.dust()
      material.color(spec.colour).formula(spec.formula)
      material.flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })
})()
