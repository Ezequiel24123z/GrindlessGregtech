// priority: -4050
// LuV living-circuit line L2 (package D2-PEDOT, docs/eras/lines-ev-zpm.md section 4): the chemistry from butane to PEDOT:PSS.
// Recipes: server_scripts/grindless/luv/pedot.js. Names: client_scripts/grindless/luv_pedot_lang.js.
(function () {
  var G = global.grindless
  var PE = G.pedot || (G.pedot = {})

  var FLUIDS = {
    thiophene: { kind: 'liquid', color: 0xC9B458, formula: 'C4H4S' },
    dibromothiophene: { kind: 'liquid', color: 0xB58A3C, formula: 'C4H2Br2S' },
    dimethoxythiophene: { kind: 'liquid', color: 0xD8C88A, formula: 'C6H8O2S' },
    edot: { kind: 'liquid', color: 0x8FB6D9, formula: 'C6H6O2S' },
    sodium_methoxide: { kind: 'liquid', color: 0xE8E2D0, formula: 'NaOCH3(CH3OH)' },
    ethylene_oxide: { kind: 'gas', color: 0xD9E4EA, formula: 'C2H4O' },
    ethylene_glycol: { kind: 'liquid', color: 0xCFE6DD, formula: 'C2H6O2' },
    hydrogen_bromide: { kind: 'gas', color: 0xE0B07A, formula: 'HBr' },
    polystyrene_sulfonate: { kind: 'liquid', color: 0xE6D7B8, formula: 'C8H8O3S' },
    pedot_pss: { kind: 'liquid', color: 0x1E3A6E, formula: 'C14H12O5S2' }
  }
  var DUSTS = {
    tetrabromothiophene: { color: 0x9C6B2E, formula: 'C4Br4S' },
    zinc_bromide: { color: 0xD8D8E0, formula: 'ZnBr2' },
    sodium_bromide: { color: 0xF0EDE6, formula: 'NaBr' },
    polystyrene: { color: 0xEDEDED, formula: 'C8H8' }
  }

  PE.materials = Object.keys(FLUIDS).concat(Object.keys(DUSTS)).map(function (name) { return 'gtceu:' + name })

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
