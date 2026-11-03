// priority: -19850
// -----------------------------------------------------------------------------------------------
// MAX horizon flux clamp (docs/eras/max.md, machine 13 and line L54; package MX-S3). The line steps on older machines are rows marked MX-S3
// in their own tables; this file holds the machine's recipe, its controller and the GTM rows of the line:
//
//   L54 coated conductor c9 pump_buffered_tape -> oxide PLD c7 thick_pump_tape -> HTS works c15 flux_pump_stator -> nitride magnet works c21
//       fe16n2_rotor_magnet -> He refrigerator cold_flux_pump -> assembler (here) hts_flux_pump -> clamp c1 (here) winding + plasmoid
//
// c1 runs only at Sgr A* (gcyr:black_hole_orbit, global.grindless.maxTravel.places.sgra). It takes four HTS flux pumps, eight field coils, four
// stream bundles and 2,000 mB of the flux-loaded FRC D1's hot flow line makes. The captured plasmoid goes to the UXV plasma mass filter
// (cygnus_lift.json, reconnection_plasmoid_return). The controller is an assembly line at VA[MAX]. The casing is made at home from OpV parts.
// Published for the tests: global.grindless.maxFluxClamp.recipes, .skipped, .controllerRecipe.
// Rhino: var + function in callbacks.
(function () {
  var LOG = '[grindless/max] '
  var G = global.grindless || (global.grindless = {})
  var MD = G.maxFluxClamp || (G.maxFluxClamp = {})
  MD.recipes = []
  MD.skipped = []
  MD.controllerRecipe = 'grindless:assembly_line/horizon_flux_clamp'

  var VA_MAX = Number(GTValues.VA[14])
  var MAX_VA = 2013265920
  var LOW = 7864320
  var SITE = (G.maxTravel && G.maxTravel.places && G.maxTravel.places.sgra ? G.maxTravel.places.sgra.dimension : 'gcyr:black_hole_orbit')
  var CIRCUIT = '#gtceu:circuits/max'
  var CONTROLLER = 'gtceu:horizon_flux_clamp'
  var RESEARCH = 'grindless:hts_flux_pump'
  var HULL = 'gtceu:max_machine_hull'
  var LINE_FLUID = 'gtceu:superfluid_helium_3'
  var FRC = 'gtceu:flux_loaded_frc'

  // the machine's own recipe; items in include the programmed circuit (itemsIn 4 of the recipe type)
  var ROWS = [
    {
      name: 'horizon_flux_clamp', circuit: 1, eut: VA_MAX, duration: 2400,
      items: ['4x grindless:hts_flux_pump', '8x grindless:max_field_coil', '4x grindless:stream_bundle'],
      fluids: [[FRC, 2000]],
      outs: ['1x grindless:horizon_flux_clamp', '1x grindless:reconnection_plasmoid']
    }
  ]

  // GTM rows: type, name, inputs (with counts), fluids, outputs, EU/t and ticks
  var GTM = [
    // L54 step 6: the cold pump set in its frame with a field coil winding and the tungsten steel casing
    { type: 'assembler', name: 'hts_flux_pump', circuit: 17,
      items: ['grindless:cold_flux_pump', '2x gtceu:tungsten_steel_plate', '4x gtceu:tungsten_steel_rod', '2x gtceu:tungsten_steel_ring', 'gtceu:tungsten_steel_gear', 'gtceu:tungsten_steel_frame', '2x grindless:chain_field_coil', '2x #gtceu:circuits/max'],
      fluids: [['gtceu:epoxy', 144]], outs: ['grindless:hts_flux_pump'], eut: LOW, duration: 600 },
    // the clamp casing: made at home from OpV parts, so the clamp can be built (no input comes from the clamp's line)
    // retuned by D5-CAS-MAX (docs/eras/lines-opv-maxplus.md 7.2): the REBCO field coil and horizon strand on a truss
    { type: 'assembler', name: 'clamp_coil_casing',
      items: ['grindless:max_field_coil', '2x gtceu:horizon_strand_single_wire', 'grindless:tensegrity_truss_casing'],
      fluids: [['gtceu:superfluid_helium_3', 250]], outs: ['2x grindless:clamp_coil_casing'], eut: MAX_VA, duration: 400 }
  ]

  function missingOf(items, fluids) {
    var m = []
    items.forEach(function (s) {
      if (String(s).indexOf('#') >= 0) return
      var id = String(s).replace(/^\d+x /, '')
      if (!Item.exists(id)) m.push(id)
    })
    fluids.forEach(function (f) { if (!Fluid.exists(f)) m.push(f) })
    return m
  }

  function skip(name, missing) {
    MD.skipped.push(name)
    console.error(LOG + 'flux clamp ' + name + ' skipped, unknown id(s): ' + missing.join(', '))
  }

  ServerEvents.recipes(function (event) {
    try {
    ROWS.forEach(function (r) {
      try {
        var missing = missingOf(r.items.concat(r.outs), r.fluids.map(function (f) { return f[0] }))
        if (missing.length > 0) {
          skip(r.name, missing)
          return
        }
        var b = event.recipes.gtceu.horizon_flux_clamp('grindless:' + r.name)
        b.circuit(r.circuit)
        r.items.forEach(function (s) { b.itemInputs(s) })
        r.fluids.forEach(function (f) { b.inputFluids(Fluid.of(f[0], f[1])) })
        r.outs.forEach(function (s) { b.itemOutputs(s) })
        b.dimension(SITE)
        b.addDataString('grindless_horizon_flux_clamp', r.name)
        b.EUt(r.eut).duration(r.duration)
        MD.recipes.push('grindless:horizon_flux_clamp/' + r.name)
      } catch (e) {
        console.error(LOG + 'flux clamp ' + r.name + ' failed: ' + e)
      }
    })

    GTM.forEach(function (r) {
      try {
        var missing = missingOf(r.items.concat(r.outs), r.fluids.map(function (f) { return f[0] }))
        if (missing.length > 0) {
          skip(r.name, missing)
          return
        }
        var b = event.recipes.gtceu[r.type]('grindless:' + r.name)
        if (r.circuit) b.circuit(r.circuit)
        r.items.forEach(function (s) { b.itemInputs(s) })
        r.fluids.forEach(function (f) { b.inputFluids(Fluid.of(f[0], f[1])) })
        r.outs.forEach(function (s) { b.itemOutputs(s) })
        b.EUt(r.eut).duration(r.duration)
        MD.recipes.push('grindless:' + r.type + '/' + r.name)
      } catch (e) {
        console.error(LOG + 'flux clamp ' + r.name + ' failed: ' + e)
      }
    })

    try {
      var ids = [HULL, CONTROLLER, RESEARCH, 'grindless:max_field_generator', 'grindless:max_electric_motor', 'grindless:max_conveyor_module',
        'grindless:max_field_coil', 'grindless:stream_bundle', 'grindless:diamond_power_die', 'grindless:cold_fcl_module']
      var mc = missingOf(ids, [LINE_FLUID])
      if (mc.length > 0) {
        skip('horizon_flux_clamp controller', mc)
      } else {
        var a = event.recipes.gtceu.assembly_line('grindless:horizon_flux_clamp')
        a.itemInputs(HULL, '4x ' + CIRCUIT, '8x grindless:max_field_generator', '4x grindless:max_electric_motor', '4x grindless:max_conveyor_module',
          'grindless:max_field_coil', 'grindless:stream_bundle', 'grindless:diamond_power_die', 'grindless:cold_fcl_module')
        a.inputFluids(Fluid.of(LINE_FLUID, 1000))
        a.itemOutputs(CONTROLLER)
        a.stationResearch(function (r) { return r.researchStack(Item.of(RESEARCH)).CWUt(64).EUt(VA_MAX) })
        a.EUt(VA_MAX).duration(2400)
      }
    } catch (e) {
      console.error(LOG + 'flux clamp controller failed: ' + e)
    }
    console.info(LOG + 'flux clamp: ' + MD.recipes.length + ' recipes; skipped ' + MD.skipped.length)
    } catch (e) {
      console.error('[grindless/max/flux_clamp] recipes failed: ' + e)
    }
  })
})()
