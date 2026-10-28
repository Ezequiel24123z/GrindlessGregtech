// priority: -26224
// -----------------------------------------------------------------------------------------------
// Recipes of ZPM's waste retrieval plant (gtceu:waste_retrieval) and actinide partitioning plant (gtceu:actinide_partitioning), the
// controllers' crafting recipes and the lanthanide nitrate's route back to the extraction cascade (machines, types and materials:
// startup_scripts/grindless/zpm/actinides.js; docs/eras/zpm.md "Machines 4-5"; package ZPM-A4). The programmed circuit picks the step.
//
//   waste retrieval plant
//   circuit 1  retrieve   4 radioactive waste + 1,000 mB nitric acid -> 1 radium dust + 1,000 mB actinide raffinate + 2 synroc + 500 mB NO2
//                         30,720 EU/t (ZPM VA / 4: the plant overclocks) x 400 t
//   circuit 2  emanate    1 radium capsule (1 % worn a run) + 1,000 mB helium (not consumed: the loop) -> 250 mB radon
//                         7,680 EU/t x 400 t; a worn capsule leaves its radium's end of chain, 4 lead dust at 1 %
//   circuit 3  capsule    4 radium dust + 1 platinum foil -> 1 radium capsule, 7,680 EU/t x 100 t
//   actinide partitioning plant
//   circuit 1  strip      1,000 mB actinide raffinate + the solvent charge (100 mB kerosene, not consumed) -> 1,000 mB minor-actinide
//                         strip + 1,000 mB lanthanide nitrate, 30,720 EU/t x 200 t
//   circuit 2  split      1,000 mB minor-actinide strip -> 2 americium dust + 1 curium oxide + 1 synroc, 30,720 EU/t x 200 t
//   chemical reactor      1,000 mB lanthanide nitrate + 3,000 mB hydrochloric acid -> 1,000 mB rare earth chloride solution (the cascade's
//                         leach liquor, its circuit 2) + 3,000 mB nitric acid:  Ln(NO3)3 + 3 HCl -> LnCl3 + 3 HNO3
//
// Destinations (rule 3): radium -> capsule -> radon (the Mk2's fuel and plasma); raffinate -> the partitioning plant; the retrieval's NO2 goes
// to GTM's nitric acid recipes as the hot cell's; the helium loops; a worn capsule ends as lead. Partitioning: americium (the Mk3's, with
// naquadria) and curium oxide (stored for UV) are the products, the lanthanide nitrate goes to the cascade through the chemical reactor,
// the solvent stays in the machine, and synroc is the sealed final form: a block, kept (the only inert end; the plants still refuse to void).
//
// Waste lookup: GT--'s own recipes for gtnn:radioactive_waste stay (nothing removed here). Ours live in their own recipe types and differ in
// circuit and inputs; no recipe's keys contain another's (checked at load).
// Published in global.grindless.actinides: .retrieval / .partition [{ name, recipeId, circuit, itemsIn, fluidsIn, notConsumed, chancedIn,
// itemsOut, chancedOut, fluidsOut, eut, duration }], .reactor, .skipped, .clashes, .crafting { retrieval, partition }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/zpm] '
  var G = global.grindless || (global.grindless = {})
  var AC = G.actinides || (G.actinides = {})

  var ZPM_VA = 122880
  var WASTE = 'gtnn:radioactive_waste'
  var RADIUM = 'gtceu:radium_dust'
  var AMERICIUM = 'gtceu:americium_dust'
  var LEAD = 'gtceu:lead_dust'
  var FOIL = 'gtceu:platinum_foil'
  var CAPSULE = 'grindless:radium_capsule'
  var CURIUM = 'grindless:curium_oxide'
  var SYNROC = 'grindless:synroc_block'
  var RAFFINATE = 'gtceu:actinide_raffinate'
  var STRIP = 'gtceu:minor_actinide_strip'
  var LANTHANIDES = 'gtceu:lanthanide_nitrate'
  var RE_CHLORIDE = 'gtceu:rare_earth_chloride_solution'
  var KEROSENE = 'gtceu:kerosene'
  // UEV-A1's partitioning cuts (materials: startup_scripts/grindless/uev/isotopes.js)
  var PU_NITRATE = 'gtceu:plutonium_nitrate'
  var PU_RICH_OXIDE = 'gtceu:plutonium_244_rich_oxide_dust'
  var CM_CF_NITRATE = 'gtceu:curium_californium_nitrate'
  var BK_CF_NITRATE = 'gtceu:berkelium_californium_nitrate'
  var CM_NITRATE = 'gtceu:curium_nitrate'
  var CF_NITRATE = 'gtceu:californium_nitrate'
  var BK_NITRATE = 'gtceu:berkelium_nitrate'

  var RETRIEVAL = [
    {
      name: 'retrieve', circuit: 1,
      itemsIn: [{ id: WASTE, count: 4 }], chancedIn: [], notConsumed: [],
      fluidsIn: [{ id: 'gtceu:nitric_acid', amount: 1000 }],
      itemsOut: [{ id: RADIUM, count: 1 }, { id: SYNROC, count: 2 }], chancedOut: [],
      fluidsOut: [{ id: RAFFINATE, amount: 1000 }, { id: 'gtceu:nitrogen_dioxide', amount: 500 }],
      eut: 30720, duration: 400
    },
    {
      name: 'emanate', circuit: 2,
      itemsIn: [], chancedIn: [{ id: CAPSULE, count: 1, chance: 100 }],
      fluidsIn: [], notConsumed: [{ id: 'gtceu:helium', amount: 1000 }],
      itemsOut: [], chancedOut: [{ id: LEAD, count: 4, chance: 100 }],
      fluidsOut: [{ id: 'gtceu:radon', amount: 250 }],
      eut: 7680, duration: 400
    },
    {
      name: 'capsule', circuit: 3,
      itemsIn: [{ id: RADIUM, count: 4 }, { id: FOIL, count: 1 }], chancedIn: [], notConsumed: [],
      fluidsIn: [],
      itemsOut: [{ id: CAPSULE, count: 1 }], chancedOut: [],
      fluidsOut: [],
      eut: 7680, duration: 100
    }
  ]

  var PARTITION = [
    {
      name: 'strip', circuit: 1,
      itemsIn: [], chancedIn: [],
      fluidsIn: [{ id: RAFFINATE, amount: 1000 }], notConsumed: [{ id: KEROSENE, amount: 100 }],
      itemsOut: [], chancedOut: [],
      fluidsOut: [{ id: STRIP, amount: 1000 }, { id: LANTHANIDES, amount: 1000 }],
      eut: 30720, duration: 200
    },
    {
      name: 'split', circuit: 2,
      itemsIn: [], chancedIn: [],
      fluidsIn: [{ id: STRIP, amount: 1000 }], notConsumed: [],
      itemsOut: [{ id: AMERICIUM, count: 2 }, { id: CURIUM, count: 1 }, { id: SYNROC, count: 1 }], chancedOut: [],
      fluidsOut: [],
      eut: 30720, duration: 200
    },
    {
      name: 'plutonium_recovery', circuit: 3,
      itemsIn: [], chancedIn: [],
      fluidsIn: [{ id: PU_NITRATE, amount: 1000 }], notConsumed: [{ id: KEROSENE, amount: 100 }],
      itemsOut: [{ id: PU_RICH_OXIDE, count: 1 }], chancedOut: [],
      fluidsOut: [{ id: 'gtceu:nitric_acid', amount: 2000 }],
      eut: 30720, duration: 200
    },
    {
      name: 'curium_cut', circuit: 4,
      itemsIn: [], chancedIn: [],
      fluidsIn: [{ id: CM_CF_NITRATE, amount: 1000 }], notConsumed: [],
      itemsOut: [], chancedOut: [],
      fluidsOut: [{ id: CM_NITRATE, amount: 500 }, { id: CF_NITRATE, amount: 500 }],
      eut: 30720, duration: 200
    },
    {
      name: 'berkelium_cut', circuit: 5,
      itemsIn: [], chancedIn: [],
      fluidsIn: [{ id: BK_CF_NITRATE, amount: 1000 }], notConsumed: [{ id: 'gtceu:hdehp_solvent', amount: 100 }],
      itemsOut: [], chancedOut: [],
      fluidsOut: [{ id: BK_NITRATE, amount: 500 }, { id: CF_NITRATE, amount: 500 }],
      eut: 30720, duration: 200
    }
  ]

  var REACTOR = {
    name: 'lanthanide_nitrate_to_chloride',
    fluidsIn: [{ id: LANTHANIDES, amount: 1000 }, { id: 'gtceu:hydrochloric_acid', amount: 3000 }],
    fluidsOut: [{ id: RE_CHLORIDE, amount: 1000 }, { id: 'gtceu:nitric_acid', amount: 3000 }],
    eut: 480, duration: 100
  }

  function finish(table, type) {
    return table.map(function (t) {
      return {
        name: t.name, id: 'grindless:' + t.name, recipeId: 'grindless:' + type + '/' + t.name, circuit: t.circuit,
        itemsIn: t.itemsIn, chancedIn: t.chancedIn, fluidsIn: t.fluidsIn, notConsumed: t.notConsumed,
        itemsOut: t.itemsOut, chancedOut: t.chancedOut, fluidsOut: t.fluidsOut,
        eut: t.eut, duration: t.duration, energy: t.eut * t.duration
      }
    })
  }

  AC.retrieval = finish(RETRIEVAL, 'waste_retrieval')
  AC.partition = finish(PARTITION, 'actinide_partitioning')
  AC.reactor = { name: REACTOR.name, recipeId: 'grindless:chemical_reactor/' + REACTOR.name, fluidsIn: REACTOR.fluidsIn, fluidsOut: REACTOR.fluidsOut, eut: REACTOR.eut, duration: REACTOR.duration }
  AC.skipped = []
  AC.clashes = []
  AC.crafting = { retrieval: 'grindless:crafting/waste_retrieval_plant', partition: 'grindless:crafting/actinide_partitioning_plant' }
  AC.craftingParts = ['gtceu:zpm_machine_hull', 'gtceu:zpm_electric_pump', 'gtceu:zpm_robot_arm']

  function keysOf(r) {
    var keys = {}
    r.itemsIn.concat(r.chancedIn).forEach(function (x) { keys['i:' + x.id] = true })
    r.fluidsIn.concat(r.notConsumed).forEach(function (x) { keys['f:' + x.id] = true })
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
    r.itemsIn.concat(r.chancedIn, r.itemsOut, r.chancedOut).forEach(function (x) { if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    r.fluidsIn.concat(r.notConsumed || [], r.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function add(event, builder, r) {
    var missing = missingIds(r)
    if (missing.length > 0) {
      AC.skipped.push({ name: r.name, reason: 'unknown id(s) ' + missing.join(', ') })
      console.error(LOG + 'actinides skipped ' + r.name + ': unknown id(s) ' + missing.join(', '))
      return
    }
    var recipe = builder(r.id)
    r.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
    r.chancedIn.forEach(function (x) { recipe.chancedInput(x.count + 'x ' + x.id, x.chance, 0) })
    recipe.circuit(r.circuit)
    r.fluidsIn.forEach(function (f) { recipe.inputFluids(Fluid.of(f.id, f.amount)) })
    r.notConsumed.forEach(function (f) { recipe.notConsumableFluid(Fluid.of(f.id, f.amount)) })
    r.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
    r.chancedOut.forEach(function (x) { recipe.chancedOutput(x.count + 'x ' + x.id, x.chance, 0) })
    r.fluidsOut.forEach(function (f) { recipe.outputFluids(Fluid.of(f.id, f.amount)) })
    recipe.EUt(r.eut).duration(r.duration)
  }

  function addPlants(event) {
    AC.clashes = clashesOf(AC.retrieval).concat(clashesOf(AC.partition))
    if (AC.clashes.length > 0) console.error(LOG + 'actinide recipes clash in the lookup: ' + AC.clashes.join(', '))
    AC.retrieval.forEach(function (r) { add(event, function (id) { return event.recipes.gtceu.waste_retrieval(id) }, r) })
    AC.partition.forEach(function (r) { add(event, function (id) { return event.recipes.gtceu.actinide_partitioning(id) }, r) })
    console.info(LOG + 'actinide recipes added: ' + (AC.retrieval.length + AC.partition.length - AC.skipped.length))
  }

  function addReactor(event) {
    var missing = []
    REACTOR.fluidsIn.concat(REACTOR.fluidsOut).forEach(function (f) { if (!Fluid.exists(f.id)) missing.push(f.id) })
    if (missing.length > 0) {
      AC.skipped.push({ name: REACTOR.name, reason: 'unknown id(s) ' + missing.join(', ') })
      console.error(LOG + 'lanthanide nitrate recipe skipped, unknown id(s): ' + missing.join(', '))
      return
    }
    var recipe = event.recipes.gtceu.chemical_reactor('grindless:' + REACTOR.name)
    REACTOR.fluidsIn.forEach(function (f) { recipe.inputFluids(Fluid.of(f.id, f.amount)) })
    REACTOR.fluidsOut.forEach(function (f) { recipe.outputFluids(Fluid.of(f.id, f.amount)) })
    recipe.EUt(REACTOR.eut).duration(REACTOR.duration)
  }

  // CRAFTING TABLE: ZPM hull + 2 ZPM pumps + ZPM robot arm (remote handling) + 4 ZPM circuits; the two shapes differ
  function addCrafting(event) {
    var missing = AC.craftingParts.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'actinide plant crafting skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    var parts = { C: '#gtceu:circuits/zpm', P: 'gtceu:zpm_electric_pump', H: 'gtceu:zpm_machine_hull', R: 'gtceu:zpm_robot_arm' }
    event.recipes.gtceu.shaped('gtceu:waste_retrieval_plant', ['CRC', 'PHP', 'C C'], parts).id(AC.crafting.retrieval)
    event.recipes.gtceu.shaped('gtceu:actinide_partitioning_plant', ['PCP', 'CHC', 'RC '], parts).id(AC.crafting.partition)
  }

  ServerEvents.recipes(function (event) {
    try { addPlants(event) } catch (e) { console.error(LOG + 'actinide recipes failed: ' + e) }
    try { addReactor(event) } catch (e2) { console.error(LOG + 'lanthanide nitrate recipe failed: ' + e2) }
    try { addCrafting(event) } catch (e3) { console.error(LOG + 'actinide plant crafting recipes failed: ' + e3) }
  })
})()
