// priority: -20260
// MAX+ machine 10, the void crystal fab, and line P14 (docs/eras/maxplus.md, machine 10 and 'Lines'; package XP-B4). Gate c19 to the Local Group
// filament is a row of data/grindless/tables/gate.json.
//
//   P14 void crystal lattice  diamond lattice fab c11 -> c12_seed_plate; void crystal fab c1 (filament) -> void_grown_diamond;
//                             ion implanter c28 -> nv_engineered_diamond; femto writer c13 -> void_crystal_lattice
//
// Circuit 2 of the fab stays free for line K2 (XP-K). Older machines keep their home site. Published for the tests:
// global.grindless.maxPlusVoidFab { rows, fab, controller, skipped }. Rhino: var + function inside callbacks.
(function () {
  var LOG = '[grindless/maxplus_void_fab] '
  var G = global.grindless || (global.grindless = {})
  var MV = G.maxPlusVoidFab || (G.maxPlusVoidFab = {})
  MV.skipped = []
  MV.controller = 'grindless:assembly_line/void_crystal_fab'

  function va(t) { return Number(GTValues.VA[t]) }
  var VA_MAX = va(14)
  var KERR = 'gtceu:kerr_condensate'
  var HULL = 'gtceu:max_machine_hull'
  var SITE = (G.maxPlusTravel && G.maxPlusTravel.places && G.maxPlusTravel.places.void ? G.maxPlusTravel.places.void.dimension : 'grindless:local_group_filament')

  var ROWS = [
    { type: 'diamond_cvd', name: 'c12_seed_plate', circuit: 11, eut: va(11), duration: 1200,
      items: [['gtceu:carbon_dust', 16], ['gtceu:sapphire_plate', 2]], fluids: [['gtceu:methane', 2000], ['gtceu:hydrogen', 4000]],
      outs: [['grindless:c12_seed_plate', 2]], fluidOuts: [['gtceu:hydrogen', 3000]] },
    { type: 'ion_implantation', name: 'nv_engineered_diamond', circuit: 28, eut: va(12), duration: 900,
      items: [['grindless:void_grown_diamond', 2]], fluids: [['gtceu:nitrogen', 2000]],
      outs: [['grindless:nv_engineered_diamond', 2]] },
    { type: 'femtosecond_writing', name: 'void_crystal_lattice', circuit: 13, eut: va(13), duration: 1200, key: 'grindless_femtosecond_writing',
      items: [['grindless:nv_engineered_diamond', 4]], fluids: [['gtceu:helium', 1000]],
      outs: [['grindless:void_crystal_lattice', 1]], fluidOuts: [['gtceu:helium', 800]] }
  ]
  MV.rows = ROWS

  var FAB = [
    { type: 'void_crystal_fab', name: 'void_grown_diamond', circuit: 1, eut: VA_MAX, duration: 2400, key: 'grindless_void_crystal_fab', dimension: SITE,
      items: [['grindless:c12_seed_plate', 4], ['gtceu:carbon_dust', 32]], fluids: [['gtceu:methane', 8000], ['gtceu:hydrogen', 16000]],
      outs: [['grindless:void_grown_diamond', 4]], fluidOuts: [['gtceu:hydrogen', 12000]] }
  ]
  MV.fab = FAB

  var CONTROLLER = { machine: 'gtceu:void_crystal_fab',   research: 'grindless:c12_seed_plate', casing: 'grindless:horizon_machine_casing',
    comps: ['2x grindless:maxplus_conveyor_module', '2x grindless:maxplus_robot_arm', '2x grindless:maxplus_field_generator', '2x grindless:maxplus_sensor'],
      plates: ['4x grindless:horizon_compressed_plate', '2x grindless:c12_seed_plate'] }
  MV.controllerSpec = CONTROLLER

  function missingIds(ids, fluids) {
    return ids.filter(function (id, k) { return String(id).charAt(0) !== '#' && ids.indexOf(id) === k && !Item.exists(id) })
      .concat(fluids.filter(function (id, k) { return fluids.indexOf(id) === k && !Fluid.exists(id) }))
  }
  function pairs(list, k) { return (list[k] || []).map(function (x) { return x[0] }) }
  function idOf(s) { return s.replace(/^\d+x /, '') }
  function skip(name, reason) {
    MV.skipped.push({ name: name, reason: reason })
    console.error(LOG + 'skipped ' + name + ': ' + reason)
  }

  function addRow(event, r) {
    var ids = pairs(r, 'items').concat(pairs(r, 'outs'))
    var fluids = pairs(r, 'fluids').concat(pairs(r, 'fluidOuts'))
    var missing = missingIds(ids, fluids)
    if (missing.length > 0) return skip(r.type + '/' + r.name, 'unknown id(s): ' + missing.join(', '))
    var b = event.recipes.gtceu[r.type]('grindless:' + r.name)
    ;(r.items || []).forEach(function (x) { b.itemInputs(x[1] + 'x ' + x[0]) })
    if (r.circuit) b.circuit(r.circuit)
    ;(r.fluids || []).forEach(function (x) { b.inputFluids(Fluid.of(x[0], x[1])) })
    ;(r.outs || []).forEach(function (x) { b.itemOutputs(x[1] + 'x ' + x[0]) })
    ;(r.fluidOuts || []).forEach(function (x) { b.outputFluids(Fluid.of(x[0], x[1])) })
    if (r.key) b.addDataString(r.key, r.name)
    if (r.dimension) b.dimension(r.dimension)
    b.EUt(r.eut).duration(r.duration)
  }

  function addAssemblyLine(event, name, spec, items, fluids, out, research, cwut, duration) {
    var ids = items.map(idOf).concat([out, research])
    var missing = missingIds(ids, fluids.map(function (f) { return f[0] }))
    if (missing.length > 0) return skip(name, 'unknown id(s): ' + missing.join(', '))
    var a = event.recipes.gtceu.assembly_line('grindless:' + name)
    items.forEach(function (s) { a.itemInputs(s) })
    fluids.forEach(function (f) { a.inputFluids(Fluid.of(f[0], f[1])) })
    a.itemOutputs(out)
    a.stationResearch(function (r) { return r.researchStack(Item.of(research)).CWUt(cwut).EUt(VA_MAX) })
    a.EUt(VA_MAX).duration(duration)
  }

  ServerEvents.recipes(function (event) {
    try {
      MV.skipped = []
      ROWS.forEach(function (r) { addRow(event, r) })
      FAB.forEach(function (r) { addRow(event, r) })
      var c = CONTROLLER
      var items = ['1x ' + HULL, '2x ' + c.casing, '8x grindless:horizon_processor', '4x #gtceu:circuits/max'].concat(c.comps, c.plates)
      addAssemblyLine(event, 'void_crystal_fab', c, items, [[KERR, 2000]], c.machine, c.research, 64, 4800)
      console.info(LOG + (ROWS.length + FAB.length + 1) + ' rows; skipped ' + MV.skipped.length)
    } catch (e) {
      console.error(LOG + 'failed: ' + e)
    }
  })
})()
