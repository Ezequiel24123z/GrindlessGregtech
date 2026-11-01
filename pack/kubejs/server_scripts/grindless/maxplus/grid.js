// priority: -20224
// -----------------------------------------------------------------------------------------------
// MAX+ machine 16, the hyper assembly array: its rows and its controller (docs/eras/maxplus.md "Machines" 16 and the Hyperstargate grid; package
// XP-H4a). The rows (ring block ... base, the T11 and T12 last steps and the six creative-item rows) are data in startup_scripts/grindless/maxplus/
// grid.js; this script adds them under gtceu:hyper_assembly_array at Sgr A* and puts the controller on the assembly line.
// Published for the tests: global.grindless.maxPlusGrid { rows, creative, machine, skipped, controller, maxItems }.
// Not here: the Hyperstargate controller itself (gtceu:hyperstargate, XP-G1). Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/maxplus_grid] '
  var G = global.grindless || (global.grindless = {})
  var GRID = G.maxPlusGrid || (G.maxPlusGrid = {})
  GRID.skipped = []
  GRID.controller = 'grindless:assembly_line/hyper_assembly_array'

  var VA_MAX = Number(GTValues.VA[14])
  var V_MAX = Number(GTValues.V[14])
  var KERR = 'gtceu:kerr_condensate'
  var HULL = 'gtceu:max_machine_hull'
  var SITE = (G.maxTravel && G.maxTravel.places && G.maxTravel.places.sgra ? G.maxTravel.places.sgra.dimension : 'gcyr:black_hole_orbit')

  // research item (made before the array exists), then the machine on the assembly line; the comm terminal is the stage II domain input
  var CONTROLLER = { machine: 'gtceu:hyper_assembly_array', research: 'grindless:cold_reference_assembly', casing: 'grindless:horizon_machine_casing',
    comps: ['2x grindless:maxplus_conveyor_module', '2x grindless:maxplus_robot_arm', '2x grindless:maxplus_field_generator', '2x grindless:maxplus_sensor'],
    plates: ['4x grindless:horizon_compressed_plate', '4x grindless:horizon_comm_terminal'] }

  function missingIds(ids, fluids) {
    return ids.filter(function (id, k) { return String(id).charAt(0) !== '#' && ids.indexOf(id) === k && !Item.exists(id) })
      .concat(fluids.filter(function (id, k) { return fluids.indexOf(id) === k && !Fluid.exists(id) }))
  }

  function skip(name, reason) {
    GRID.skipped.push({ name: name, reason: reason })
    console.error(LOG + 'skipped ' + name + ': ' + reason)
  }

  function addRow(event, r) {
    var ids = r.items.map(function (x) { return x[0] }).concat([r.out[0]])
    var fluids = r.fluids.map(function (x) { return x[0] })
    var missing = missingIds(ids, fluids)
    if (missing.length > 0) return skip(r.name, 'unknown id(s): ' + missing.join(', '))
    var b = event.recipes.gtceu.hyper_assembly_array('grindless:' + r.name)
    r.items.forEach(function (x) { b.itemInputs(x[1] + 'x ' + x[0]) })
    b.circuit(r.circuit)
    r.fluids.forEach(function (x) { b.inputFluids(Fluid.of(x[0], x[1])) })
    b.itemOutputs(r.out[1] + 'x ' + r.out[0])
    b.addDataString(GRID.machine.dataKey, r.name)
    b.dimension(SITE)
    b.EUt(V_MAX * r.amps).duration(r.duration)
  }

  function addController(event) {
    var c = CONTROLLER
    var strip = function (s) { return s.replace(/^\d+x /, '') }
    var ins = [HULL, c.research, c.casing, 'grindless:horizon_processor', c.machine].concat(c.comps.map(strip), c.plates.map(strip))
    var missing = missingIds(ins, [KERR])
    if (missing.length > 0) return skip('hyper_assembly_array controller', 'unknown id(s): ' + missing.join(', '))
    var a = event.recipes.gtceu.assembly_line('grindless:hyper_assembly_array')
    a.itemInputs(HULL, '2x ' + c.casing, '8x grindless:horizon_processor', '4x #gtceu:circuits/max')
    c.comps.concat(c.plates).forEach(function (s) { a.itemInputs(s) })
    a.inputFluids(Fluid.of(KERR, 2000))
    a.itemOutputs(c.machine)
    a.stationResearch(function (r) { return r.researchStack(Item.of(c.research)).CWUt(64).EUt(VA_MAX) })
    a.EUt(VA_MAX).duration(4800)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      GRID.skipped = []
      GRID.rows.forEach(function (r) { addRow(event, r) })
      GRID.creative.forEach(function (r) { addRow(event, r) })
      addController(event)
      console.info(LOG + 'grid: ' + (GRID.rows.length + GRID.creative.length + 1) + ' rows; skipped ' + GRID.skipped.length)
    } catch (e) {
      console.error(LOG + 'failed: ' + e)
    }
  })
})()
