// priority: -20260
// -----------------------------------------------------------------------------------------------
// MAX+ machine 17, the Hyperstargate's rows (docs/eras/maxplus.md "The Hyperstargate"; package XP-G1). Three rows and one visual:
//   hyper_assembly_array  hyperstargate           the controller, at Sgr A*
//   hyperstargate_dial    hyperstargate_dial      one dial: 2^43 EU/t for 1,200 t, the horizon lock kept, one spent charge out
//   condensate_refinery   recharge_dial_charge    the spent charge back into jacketed condensate cells (16 of the 64 are lost)
// and a portal particle in the open plane while a dial runs (it places no block). The structure, the charge check and the open state are in
// startup_scripts/grindless/maxplus/hyperstargate.js. Published for the tests: global.grindless.hyperstargateRows { rows, skipped }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/hyperstargate] '
  var G = global.grindless || (global.grindless = {})
  var ROWS = G.hyperstargateRows || (G.hyperstargateRows = {})
  ROWS.skipped = []
  ROWS.rows = {}

  var V_MAX = Number(GTValues.V[14])
  var KERR = 'gtceu:kerr_condensate'
  var SITE = (G.maxTravel && G.maxTravel.places && G.maxTravel.places.sgra ? G.maxTravel.places.sgra.dimension : 'gcyr:black_hole_orbit')
  var SPENT = 'grindless:spent_dial_charge'
  var CELL = 'grindless:jacketed_condensate_cell'
  var LOCK = 'grindless:horizon_lock'

  // the dial: 2^43 EU/t is V_MAX x 4,096 A (V_MAX is 2^31 EU), exact in a double
  ROWS.dialAmps = 4096
  ROWS.dialEUt = V_MAX * ROWS.dialAmps
  ROWS.dialTicks = 1200

  function missingIds(ids, fluids) {
    return ids.filter(function (id, k) { return ids.indexOf(id) === k && !Item.exists(id) })
      .concat(fluids.filter(function (id, k) { return fluids.indexOf(id) === k && !Fluid.exists(id) }))
  }

  function skip(name, reason) {
    ROWS.skipped.push({ name: name, reason: reason })
    console.error(LOG + 'skipped ' + name + ': ' + reason)
  }

  function guarded(name, ids, fluids, build) {
    var missing = missingIds(ids, fluids)
    if (missing.length > 0) return skip(name, 'unknown id(s): ' + missing.join(', '))
    try {
      build()
      ROWS.rows[name] = true
    } catch (e) {
      skip(name, String(e))
    }
  }

  var CONTROLLER = {
    name: 'hyperstargate', circuit: 18, amps: 256, duration: 2400,
    items: [['grindless:hyperstargate_ring_block', 8], ['grindless:horizon_controller_crystal', 1], ['grindless:creative_computation_provider', 1],
      ['grindless:horizon_processor', 16], ['grindless:hyperstargate_interface', 1]],
    kerr: 1000000
  }
  var DIAL = {
    name: 'dial', items: [['grindless:genome_archive', 1], ['grindless:cloud_phase_map', 1], ['grindless:horizon_phase_lock', 16], [CELL, 64]]
  }
  var RECHARGE = { name: 'recharge_dial_charge', circuit: 11, amps: 16, duration: 2400, fluid: 48000, cells: 48 }
  ROWS.controller = CONTROLLER
  ROWS.dial = DIAL
  ROWS.recharge = RECHARGE

  global.grindless.recipes('maxplus/hyperstargate', function (event) {
    guarded(CONTROLLER.name, CONTROLLER.items.map(function (x) { return x[0] }).concat(['gtceu:hyperstargate']), [KERR], function () {
      var b = event.recipes.gtceu.hyper_assembly_array('grindless:' + CONTROLLER.name)
      CONTROLLER.items.forEach(function (x) { b.itemInputs(x[1] + 'x ' + (x[0] === 'grindless:horizon_processor' ? '#gtceu:circuits/maxplus' : x[0])) })
      b.circuit(CONTROLLER.circuit)
      b.inputFluids(Fluid.of(KERR, CONTROLLER.kerr))
      b.itemOutputs('1x gtceu:hyperstargate')
      b.addDataString('grindless_hyper_assembly_array', CONTROLLER.name)
      b.dimension(SITE)
      b.EUt(V_MAX * CONTROLLER.amps).duration(CONTROLLER.duration)
    })

    guarded('hyperstargate_dial', DIAL.items.map(function (x) { return x[0] }).concat([LOCK, SPENT]), [], function () {
      var d = event.recipes.gtceu.hyperstargate_dial('grindless:hyperstargate_dial')
      DIAL.items.forEach(function (x) { d.itemInputs(x[1] + 'x ' + x[0]) })
      d.notConsumable('1x ' + LOCK)
      d.itemOutputs('1x ' + SPENT)
      d.addDataString('grindless_hyperstargate_dial', DIAL.name)
      d.dimension(SITE)
      d.EUt(ROWS.dialEUt).duration(ROWS.dialTicks)
    })

    guarded(RECHARGE.name, [SPENT, CELL], ['gtceu:settled_condensate', 'gtceu:superfluid_helium_3'], function () {
      var r = event.recipes.gtceu.condensate_refinery('grindless:' + RECHARGE.name)
      r.itemInputs('1x ' + SPENT)
      r.circuit(RECHARGE.circuit)
      r.inputFluids(Fluid.of('gtceu:settled_condensate', RECHARGE.fluid), Fluid.of('gtceu:superfluid_helium_3', RECHARGE.fluid))
      r.itemOutputs(RECHARGE.cells + 'x ' + CELL)
      r.addDataString('grindless_condensate_refinery', RECHARGE.name)
      r.EUt(V_MAX * RECHARGE.amps).duration(RECHARGE.duration)
    })
  })

  // an open gate shows its plane: portal particles through the interior, twice a second
  var particleFailed = false
  ServerEvents.tick(function (event) {
    var server = event.server
    if (Number(server.getTickCount()) % 10 !== 0) return
    var HS = global.grindless.hyperstargate
    if (!HS || typeof HS.gates !== 'function') return
    try {
      HS.gates().forEach(function (g) {
        if (!g.open || !g.box) return
        var b = g.box
        var cx = (b.minX + b.maxX + 1) / 2
        var cy = (b.minY + b.maxY + 1) / 2
        var cz = (b.minZ + b.maxZ + 1) / 2
        var dx = (b.maxX - b.minX + 1) / 2
        var dy = (b.maxY - b.minY + 1) / 2
        var dz = (b.maxZ - b.minZ + 1) / 2
        server.runCommandSilent('execute in ' + g.dimension + ' run particle minecraft:portal ' + cx + ' ' + cy + ' ' + cz + ' ' + dx + ' ' + dy + ' ' + dz + ' 0.2 40 normal')
      })
    } catch (e) {
      if (!particleFailed) {
        particleFailed = true
        console.error(LOG + 'gate particles failed: ' + e)
      }
    }
  })
})()
