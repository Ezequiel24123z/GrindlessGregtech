// priority: -4250
// LuV HTS tape line L1 (package D2-TAPE, docs/eras/lines-ev-zpm.md section 1): the Mond carbonyls, the nickel-tungsten alloy and the six tape stages.
// Recipes: server_scripts/grindless/luv/asteroid_belt.js (Mond, alloy) and the coated conductor line's table. Names: client_scripts/grindless/luv_hts_tape_lang.js.
(function () {
  var LOG = '[grindless/luv] '
  var G = global.grindless
  var HT = G.htsTape || (G.htsTape = {})

  // item name -> stack size; every item carries one tooltip line (tooltip.grindless.<name>.0)
  var ITEMS = { textured_nickel_tungsten_tape: 64, seeded_tape: 64, barrier_tape: 64, buffered_tape: 64, coated_tape: 64, capped_tape: 64 }
  var FLUIDS = {
    crude_metal_carbonyl: { kind: 'liquid', color: 0xA89F7A, formula: 'Ni(CO)4 + Fe(CO)5' },
    nickel_tetracarbonyl: { kind: 'liquid', color: 0xC9D6DD, formula: 'Ni(CO)4' }
  }
  var DUSTS = { nickel_tungsten: { color: 0x8E9AA6, formula: 'Ni19W' } }

  HT.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })
  HT.materials = Object.keys(FLUIDS).concat(Object.keys(DUSTS)).map(function (name) { return 'gtceu:' + name })

  StartupEvents.registry('item', function (event) {
    Object.keys(ITEMS).forEach(function (name) {
      event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(ITEMS[name])
        .tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(FLUIDS).forEach(function (name) {
      var f = FLUIDS[name]
      var m = event.create(name)
      if (f.kind === 'gas') m.gas()
      else m.liquid()
      m.color(f.color).formula(f.formula).flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
    Object.keys(DUSTS).forEach(function (name) {
      var d = DUSTS[name]
      event.create(name)
        .dust()
        .color(d.color)
        .iconSet(GTMaterialIconSet.DULL)
        .formula(d.formula)
        .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })

})()
