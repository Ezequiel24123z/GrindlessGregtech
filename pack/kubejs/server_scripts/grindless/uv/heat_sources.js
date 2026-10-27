// priority: -25124
// -----------------------------------------------------------------------------------------------
// Recipes of UV's heat source works (gtceu:heat_source_works), its controller's crafting recipe and the composite autoclave's C-C
// aeroshell row (machine and items: startup_scripts/grindless/uv/heat_sources.js; docs/eras/uv.md "Machine 3"; package UV-A2).
// The programmed circuit picks the step. VA[ZPM] = 122,880 EU/t.
//
//   heat source works
//   circuit 1  pellet      4 curium oxide -> 1 Cm-244 pellet + 1 heavy curium oxide (curium-245/246, stored for UHV; the works refuses to
//                          void), 122,880 EU/t x 600 t
//   circuit 2  clad        1 Cm-244 pellet + 1 iridium foil + 1 C-C aeroshell -> 1 GPHS module + 25 % 1 small iridium dust (the scrap: it
//                          melts back into the foil route, the platinum plant's iridium), 30,720 EU/t x 300 t
//   circuit 3  probe RTG   4 GPHS modules + 8 silicon dust + 8 germanium dust (the SiGe thermocouple: the pair itself) + 1 UV hull
//                          -> 1 probe RTG, 122,880 EU/t x 400 t
//   circuit 4  micro       1 americium dust -> 8 Am-241 micro sources, 30,720 EU/t x 200 t
//   circuit 5  RTG pellet  1 Cm-244 pellet -> 2 curium RTG pellets, 30,720 EU/t x 200 t (IV's RTG cell burns it for 3x the plutonium pellet's time)
//   composite autoclave    circuit 6 (next free after PICA's 5)  4 carbon fibre + 250 mB creosote (pitch: the tar's residue) -> 1 C-C aeroshell,
//                          480 EU/t x 300 t
//
// Lookup: each recipe has its own circuit, so no recipe's keys contain another's (checked at load).
// Published in global.grindless.heatSources: .recipes [{ name, recipeId, circuit, itemsIn, itemsOut, chancedOut, eut, duration }], .aeroshell,
// .skipped, .clashes, .crafting { works }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uv] '
  var G = global.grindless || (global.grindless = {})
  var HS = G.heatSources || (G.heatSources = {})
  var UV = G.uvFoundation && G.uvFoundation.ids ? G.uvFoundation.ids : {}

  var ZPM_VA = 122880
  var PELLET = UV.curium244Pellet || 'grindless:curium_244_pellet'
  var GPHS = UV.gphsModule || 'grindless:gphs_module'
  var AEROSHELL = UV.carbonCarbonAeroshell || 'grindless:carbon_carbon_aeroshell'
  var CURIUM_OXIDE = 'grindless:curium_oxide'
  var HEAVY = 'grindless:heavy_curium_oxide'
  var PROBE_RTG = 'grindless:probe_rtg'
  var MICRO = 'grindless:americium_micro_source'
  var RTG_PELLET = 'grindless:curium_rtg_pellet'
  var FOIL = 'gtceu:iridium_foil'

  var TABLE = [
    {
      name: 'pellet', circuit: 1,
      itemsIn: [{ id: CURIUM_OXIDE, count: 4 }],
      itemsOut: [{ id: PELLET, count: 1 }, { id: HEAVY, count: 1 }], chancedOut: [],
      eut: ZPM_VA, duration: 600
    },
    {
      name: 'clad', circuit: 2,
      itemsIn: [{ id: PELLET, count: 1 }, { id: FOIL, count: 1 }, { id: AEROSHELL, count: 1 }],
      itemsOut: [{ id: GPHS, count: 1 }], chancedOut: [{ id: 'gtceu:small_iridium_dust', count: 1, chance: 2500 }],
      eut: ZPM_VA / 4, duration: 300
    },
    {
      name: 'probe_rtg', circuit: 3,
      itemsIn: [{ id: GPHS, count: 4 }, { id: 'gtceu:silicon_dust', count: 8 }, { id: 'gtceu:germanium_dust', count: 8 }, { id: 'gtceu:uv_machine_hull', count: 1 }],
      itemsOut: [{ id: PROBE_RTG, count: 1 }], chancedOut: [],
      eut: ZPM_VA, duration: 400
    },
    {
      name: 'micro_source', circuit: 4,
      itemsIn: [{ id: 'gtceu:americium_dust', count: 1 }],
      itemsOut: [{ id: MICRO, count: 8 }], chancedOut: [],
      eut: ZPM_VA / 4, duration: 200
    },
    {
      name: 'rtg_pellet', circuit: 5,
      itemsIn: [{ id: PELLET, count: 1 }],
      itemsOut: [{ id: RTG_PELLET, count: 2 }], chancedOut: [],
      eut: ZPM_VA / 4, duration: 200
    }
  ]

  HS.recipes = TABLE.map(function (t) {
    return {
      name: t.name, recipeId: 'grindless:heat_source/' + t.name, circuit: t.circuit,
      itemsIn: t.itemsIn, itemsOut: t.itemsOut, chancedOut: t.chancedOut,
      eut: t.eut, duration: t.duration, energy: t.eut * t.duration
    }
  })
  HS.aeroshell = {
    recipeId: 'grindless:composite_curing/carbon_carbon_aeroshell', circuit: 6,
    itemsIn: [{ id: 'gtceu:carbon_fibers', count: 4 }], fluidsIn: [{ id: 'gtceu:creosote', amount: 250 }],
    itemsOut: [{ id: AEROSHELL, count: 1 }], eut: 480, duration: 300
  }
  HS.skipped = []
  HS.clashes = []
  HS.crafting = { works: 'grindless:crafting/heat_source_works' }
  HS.craftingParts = ['gtceu:zpm_machine_hull', 'gtceu:uv_robot_arm']

  function keysOf(r) {
    var keys = {}
    r.itemsIn.forEach(function (x) { keys['i:' + x.id] = true })
    keys['circuit:' + r.circuit] = true
    return keys
  }

  function subset(a, b) {
    return Object.keys(a).every(function (k) { return b[k] === true })
  }

  function clashesOf(list) {
    var out = []
    for (var i = 0; i < list.length; i++) {
      for (var j = i + 1; j < list.length; j++) {
        var a = keysOf(list[i])
        var b = keysOf(list[j])
        if (subset(a, b) || subset(b, a)) out.push(list[i].name + ' / ' + list[j].name)
      }
    }
    return out
  }

  function missingIds(r) {
    var missing = []
    r.itemsIn.concat(r.itemsOut, r.chancedOut).forEach(function (x) { if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function addWorks(event) {
    HS.clashes = clashesOf(HS.recipes)
    if (HS.clashes.length > 0) console.error(LOG + 'heat source recipes clash in the lookup: ' + HS.clashes.join(', '))
    HS.recipes.forEach(function (r) {
      var missing = missingIds(r)
      if (missing.length > 0) {
        HS.skipped.push({ name: r.name, reason: 'unknown id(s) ' + missing.join(', ') })
        console.error(LOG + 'heat source recipe skipped ' + r.name + ': unknown id(s) ' + missing.join(', '))
        return
      }
      var recipe = event.recipes.gtceu.heat_source('grindless:' + r.name)
      r.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
      recipe.circuit(r.circuit)
      r.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
      r.chancedOut.forEach(function (x) { recipe.chancedOutput(x.count + 'x ' + x.id, x.chance, 0) })
      recipe.EUt(r.eut).duration(r.duration)
    })
    console.info(LOG + 'heat source recipes added: ' + (HS.recipes.length - HS.skipped.length))
  }

  function addAeroshell(event) {
    var a = HS.aeroshell
    var missing = a.itemsIn.concat(a.itemsOut).filter(function (x) { return !Item.exists(x.id) }).map(function (x) { return x.id })
    a.fluidsIn.forEach(function (f) { if (!Fluid.exists(f.id)) missing.push(f.id) })
    if (missing.length > 0) {
      HS.skipped.push({ name: 'aeroshell', reason: 'unknown id(s) ' + missing.join(', ') })
      console.error(LOG + 'C-C aeroshell recipe skipped, unknown id(s): ' + missing.join(', '))
      return
    }
    var recipe = event.recipes.gtceu.composite_curing('grindless:carbon_carbon_aeroshell')
    a.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
    recipe.circuit(a.circuit)
    a.fluidsIn.forEach(function (f) { recipe.inputFluids(Fluid.of(f.id, f.amount)) })
    a.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
    recipe.EUt(a.eut).duration(a.duration)
  }

  // CRAFTING TABLE: ZPM hull + 2 UV robot arms (the manipulators) + 4 UV circuits
  function addCrafting(event) {
    var missing = HS.craftingParts.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'heat source works crafting skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.shaped('gtceu:heat_source_works', ['CRC', ' H ', 'C C'], {
      C: '#gtceu:circuits/uv', R: 'gtceu:uv_robot_arm', H: 'gtceu:zpm_machine_hull'
    }).id(HS.crafting.works)
  }

  ServerEvents.recipes(function (event) {
    try { addWorks(event) } catch (e) { console.error(LOG + 'heat source recipes failed: ' + e) }
    try { addAeroshell(event) } catch (e2) { console.error(LOG + 'C-C aeroshell recipe failed: ' + e2) }
    try { addCrafting(event) } catch (e3) { console.error(LOG + 'heat source works crafting failed: ' + e3) }
  })
})()
