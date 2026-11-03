// priority: -4040
// LuV L5 ZBLAN from fluorides (package D2-ZBLAN, docs/eras/lines-ev-zpm.md section 4): the four fluorides the fluorspar kiln makes and the
// dopant blend the large chemical reactor kneads from three of them. ZrF4 is UHV's (startup_scripts/grindless/uhv/zblan.js).
// Recipes: server_scripts/grindless/iv/fluorspar_kiln.js and luv/orbital_industry.js. Names: client_scripts/grindless/luv_zblan_fluorides_lang.js.
(function () {
  var G = global.grindless
  var ZF = G.zblanFluorides || (G.zblanFluorides = {})

  // name -> colour and formula (dusts, no decomposition: the compounds are only made and used whole)
  var MATERIALS = {
    barium_fluoride: { colour: 0xDCE3EA, formula: 'BaF2' },
    lanthanum_fluoride: { colour: 0xE9E4F2, formula: 'LaF3' },
    aluminium_fluoride: { colour: 0xF1F3F5, formula: 'AlF3' },
    sodium_fluoride: { colour: 0xF4F1EA, formula: 'NaF' },
    zblan_dopant_blend: { colour: 0xCFD6E6, formula: '(LaF3)(AlF3)(NaF)4' }
  }
  ZF.materials = Object.keys(MATERIALS).map(function (name) { return 'gtceu:' + name })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(MATERIALS).forEach(function (name) {
      var m = MATERIALS[name]
      event.create(name)
        .dust()
        .color(m.colour)
        .iconSet(GTMaterialIconSet.DULL)
        .formula(m.formula)
        .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })
})()
