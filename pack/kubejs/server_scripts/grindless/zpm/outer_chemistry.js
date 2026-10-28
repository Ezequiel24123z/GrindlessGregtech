// priority: -26824
// -----------------------------------------------------------------------------------------------
// Recipes of ZPM's outer chemistry (machines: startup_scripts/grindless/zpm/outer_chemistry.js; docs/eras/zpm.md "Machines 9, 13, 14"; package
// ZPM-A8): the methane pyrolyser, the vent bioreactor, the aerogel works and the controllers' crafting recipes.
//
//   gtceu:methane_pyrolysis     circuit 1  1,000 mB methane + the bath (1,000 mB tin + 1,000 mB nickel, not consumed) -> 2,000 mB hydrogen + 2 graphene dust
//                               circuit 2  the same -> 2,000 mB hydrogen + 1 carbon nanotube yarn, slower
//   gtceu:chemosynthesis        circuit 1  250 mB bacteria (Europa's) + 1,000 mB Enceladus brine + 500 mB hydrogen + 250 mB CO2
//                                          -> 4 archaeal cultures + 250 mB methane
//                               circuit 2  1 tholin + the culture (not consumed) + 1,000 mB brine + 1,000 mB mutagen
//                                          -> 4,000 mB raw growth medium + 500 mB salt water
//   gtceu:supercritical_drying  4 silica nanograins + 1,000 mB ethanol + the CO2 charge (1,000 mB, not consumed)
//                               -> 4 silica aerogel + 1,000 mB ethanol     (gel and dry in one run: the alcogel is the machine's inner stage)
//
// Destinations (rule 3 of AGENTS.md): hydrogen -> the network's hydrogen (the diamond fab and this reactor's culture take it); the bath is
// never consumed (the slag skims of the doc stay in the column: no tin is made from nothing); the culture run's methane -> back to the
// pyrolyser; the spent brine leaves as salt water -> GTM's electrolyzer (salt and water); the aerogel works' ethanol loops back into the next
// run and the CO2 never leaves the charge. gtceu:bacteria stays cut: only Europa's reaches this machine, and the culture exists only from
// it. GTM's raw growth medium mixer recipe stays (a different type). The aerogel run needs silica nanograins, whose route is ZPM-B4's:
// grindless:supercritical_drying/silica_aerogel is hidden in EMI until then (pendingRoutes).
// Lookup safety: the recipes of one type differ in the programmed circuit (the aerogel type has one recipe); checked at load, and live by
// gg_test_zpm_outer_chemistry. Published in global.grindless.outerChemistry: .recipes, .skipped, .clashes, .crafting.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/zpm] '
  var G = global.grindless || (global.grindless = {})
  var OC = G.outerChemistry || (G.outerChemistry = {})

  var ZPM_VA = 122880
  var LUV_VA = 30720

  var GRAPHENE = 'gtceu:graphene_dust'
  var YARN = 'grindless:carbon_nanotube_yarn'
  var CULTURE = 'grindless:archaeal_culture'
  var THOLIN = 'grindless:tholin'
  var AEROGEL = 'grindless:silica_aerogel'
  var NANOGRAINS = 'grindless:silica_nanograins'

  var TABLE = [
    {
      name: 'graphene', type: 'methane_pyrolysis', circuit: 1,
      itemsIn: [], notConsumedItems: [],
      fluidsIn: [{ id: 'gtceu:methane', amount: 1000 }], notConsumedFluids: [{ id: 'gtceu:tin', amount: 1000 }, { id: 'gtceu:nickel', amount: 1000 }],
      itemsOut: [{ id: GRAPHENE, count: 2 }], fluidsOut: [{ id: 'gtceu:hydrogen', amount: 2000 }],
      eut: ZPM_VA, duration: 400
    },
    {
      name: 'nanotube_yarn', type: 'methane_pyrolysis', circuit: 2,
      itemsIn: [], notConsumedItems: [],
      fluidsIn: [{ id: 'gtceu:methane', amount: 1000 }], notConsumedFluids: [{ id: 'gtceu:tin', amount: 1000 }, { id: 'gtceu:nickel', amount: 1000 }],
      itemsOut: [{ id: YARN, count: 1 }], fluidsOut: [{ id: 'gtceu:hydrogen', amount: 2000 }],
      eut: ZPM_VA, duration: 800
    },
    {
      name: 'cnt_sock', type: 'methane_pyrolysis', circuit: 3,
      itemsIn: [], notConsumedItems: [],
      fluidsIn: [{ id: 'gtceu:methane', amount: 1000 }, { id: 'gtceu:iron', amount: 144 }], notConsumedFluids: [{ id: 'gtceu:tin', amount: 1000 }],
      itemsOut: [{ id: 'grindless:cnt_sock', count: 1 }], fluidsOut: [{ id: 'gtceu:hydrogen', amount: 2000 }],
      eut: ZPM_VA, duration: 800
    },
    {
      name: 'archaeal_culture', type: 'chemosynthesis', circuit: 1,
      itemsIn: [], notConsumedItems: [],
      fluidsIn: [{ id: 'gtceu:bacteria', amount: 250 }, { id: 'gtceu:enceladus_brine', amount: 1000 }, { id: 'gtceu:hydrogen', amount: 500 }, { id: 'gtceu:carbon_dioxide', amount: 250 }],
      notConsumedFluids: [],
      itemsOut: [{ id: CULTURE, count: 4 }], fluidsOut: [{ id: 'gtceu:methane', amount: 250 }],
      eut: LUV_VA, duration: 600
    },
    {
      name: 'growth_medium_broth', type: 'chemosynthesis', circuit: 2,
      itemsIn: [{ id: THOLIN, count: 1 }], notConsumedItems: [CULTURE],
      fluidsIn: [{ id: 'gtceu:enceladus_brine', amount: 1000 }, { id: 'gtceu:mutagen', amount: 1000 }], notConsumedFluids: [],
      itemsOut: [], fluidsOut: [{ id: 'gtceu:raw_growth_medium', amount: 4000 }, { id: 'gtceu:salt_water', amount: 500 }],
      eut: LUV_VA, duration: 400
    },
    {
      name: 'silica_aerogel', type: 'supercritical_drying', circuit: 0,
      itemsIn: [{ id: NANOGRAINS, count: 4 }], notConsumedItems: [],
      fluidsIn: [{ id: 'gtceu:ethanol', amount: 1000 }], notConsumedFluids: [{ id: 'gtceu:carbon_dioxide', amount: 1000 }],
      itemsOut: [{ id: AEROGEL, count: 4 }], fluidsOut: [{ id: 'gtceu:ethanol', amount: 1000 }],
      eut: LUV_VA, duration: 600
    },
    // UIV-A2 (docs/eras/uiv.md, line 3): shock-grade pyrolytic graphite, the ramp-compression pulser's lonsdaleite feed (circuit 4)
    {
      name: 'pyrolytic_graphite', type: 'methane_pyrolysis', circuit: 4,
      itemsIn: [], notConsumedItems: [],
      fluidsIn: [{ id: 'gtceu:methane', amount: 1000 }], notConsumedFluids: [{ id: 'gtceu:tin', amount: 1000 }, { id: 'gtceu:nickel', amount: 1000 }],
      itemsOut: [{ id: 'grindless:pyrolytic_graphite', count: 1 }], fluidsOut: [{ id: 'gtceu:hydrogen', amount: 2000 }],
      eut: ZPM_VA, duration: 600
    },
    // UIV-B3 (docs/eras/uiv.md, line 34): Ps-converter mesoporous silica, the aerogel re-dried from ethanol with its pores tuned to stop positronium
    // (circuit 1: the silica_aerogel row above has none); the lab at PSR J0437 takes it
    {
      name: 'ps_converter_aerogel', type: 'supercritical_drying', circuit: 1,
      itemsIn: [{ id: AEROGEL, count: 2 }], notConsumedItems: [],
      fluidsIn: [{ id: 'gtceu:ethanol', amount: 500 }], notConsumedFluids: [{ id: 'gtceu:carbon_dioxide', amount: 1000 }],
      itemsOut: [{ id: 'grindless:ps_converter_aerogel', count: 2 }], fluidsOut: [{ id: 'gtceu:ethanol', amount: 500 }],
      eut: LUV_VA, duration: 800
    }
  ]

  OC.recipes = TABLE.map(function (t) {
    return {
      name: t.name, type: t.type, recipeId: 'grindless:' + t.type + '/' + t.name, circuit: t.circuit,
      itemsIn: t.itemsIn, notConsumedItems: t.notConsumedItems, fluidsIn: t.fluidsIn, notConsumedFluids: t.notConsumedFluids || [],
      itemsOut: t.itemsOut, fluidsOut: t.fluidsOut, eut: t.eut, duration: t.duration, energy: t.eut * t.duration
    }
  })
  OC.skipped = []
  OC.clashes = []

  OC.crafting = [
    { id: 'grindless:crafting/methane_pyrolyser', output: 'gtceu:methane_pyrolyser', pattern: ['CPC', ' H ', 'CPC'], keys: { C: '#gtceu:circuits/zpm', P: 'gtceu:zpm_electric_pump', H: 'gtceu:zpm_machine_hull' } },
    { id: 'grindless:crafting/vent_bioreactor', output: 'gtceu:vent_bioreactor', pattern: ['CPC', ' H ', 'CPC'], keys: { C: '#gtceu:circuits/zpm', P: 'gtceu:zpm_electric_pump', H: 'gtceu:zpm_machine_hull' } },
    { id: 'grindless:crafting/aerogel_works', output: 'gtceu:aerogel_works', pattern: ['CPC', ' H ', 'C C'], keys: { C: '#gtceu:circuits/zpm', P: 'gtceu:zpm_electric_pump', H: 'gtceu:zpm_machine_hull' } }
  ]

  function keysOf(r) {
    var keys = {}
    r.itemsIn.forEach(function (x) { keys['i:' + x.id] = true })
    r.notConsumedItems.forEach(function (id) { keys['i:' + id] = true })
    r.fluidsIn.concat(r.notConsumedFluids).forEach(function (x) { keys['f:' + x.id] = true })
    keys['circuit:' + r.circuit] = true
    return keys
  }

  function subset(a, b) {
    return Object.keys(a).every(function (k) { return b[k] === true })
  }

  function clashes() {
    var out = []
    for (var i = 0; i < OC.recipes.length; i++) {
      for (var j = i + 1; j < OC.recipes.length; j++) {
        if (OC.recipes[i].type !== OC.recipes[j].type) continue
        var a = keysOf(OC.recipes[i])
        var b = keysOf(OC.recipes[j])
        if (subset(a, b) || subset(b, a)) out.push(OC.recipes[i].name + ' / ' + OC.recipes[j].name)
      }
    }
    return out
  }

  function missingIds(r) {
    var missing = []
    r.itemsIn.concat(r.itemsOut).forEach(function (x) { if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    r.notConsumedItems.forEach(function (id) { if (!Item.exists(id) && missing.indexOf(id) < 0) missing.push(id) })
    r.fluidsIn.concat(r.notConsumedFluids, r.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  // GTM files a recipe as <namespace>:<type>/<path>: the id handed to it is <namespace>:<path>
  function shortId(id) { return 'grindless:' + id.substring(id.lastIndexOf('/') + 1) }

  function addChain(event) {
    OC.clashes = clashes()
    if (OC.clashes.length > 0) console.error(LOG + 'outer chemistry recipes clash in the lookup: ' + OC.clashes.join(', '))
    OC.recipes.forEach(function (r) {
      var missing = missingIds(r)
      if (missing.length > 0) {
        OC.skipped.push({ name: r.name, reason: 'unknown id(s) ' + missing.join(', ') })
        console.error(LOG + 'outer chemistry skipped ' + r.name + ': unknown id(s) ' + missing.join(', '))
        return
      }
      var recipe = event.recipes.gtceu[r.type](shortId(r.recipeId))
      r.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
      r.notConsumedItems.forEach(function (id) { recipe.notConsumable(id) })
      if (r.circuit > 0) recipe.circuit(r.circuit)
      r.fluidsIn.forEach(function (f) { recipe.inputFluids(Fluid.of(f.id, f.amount)) })
      r.notConsumedFluids.forEach(function (f) { recipe.notConsumableFluid(Fluid.of(f.id, f.amount)) })
      r.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
      r.fluidsOut.forEach(function (f) { recipe.outputFluids(Fluid.of(f.id, f.amount)) })
      recipe.EUt(r.eut).duration(r.duration)
    })
    console.info(LOG + 'outer chemistry recipes added: ' + (OC.recipes.length - OC.skipped.length))
  }

  function addCrafting(event) {
    OC.crafting.forEach(function (c) {
      var ids = [c.output]
      Object.keys(c.keys).forEach(function (k) { if (c.keys[k].charAt(0) !== '#') ids.push(c.keys[k]) })
      var missing = ids.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + 'outer chemistry crafting ' + c.id + ' skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      event.recipes.gtceu.shaped(c.output, c.pattern, c.keys).id(c.id)
    })
  }

  ServerEvents.recipes(function (event) {
    try { addChain(event) } catch (e) { console.error(LOG + 'outer chemistry recipes failed: ' + e) }
    try { addCrafting(event) } catch (e2) { console.error(LOG + 'outer chemistry crafting failed: ' + e2) }
  })
})()
