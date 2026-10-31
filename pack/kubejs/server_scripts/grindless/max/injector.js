// priority: -19960
// -----------------------------------------------------------------------------------------------
// MAX mass stream injector (docs/eras/max.md, machine 7 and line L14; package MAX-D4). The line steps on older machines are rows marked MAX-D4
// in their own tables; this file holds the machine's two recipes, its controller and the GTM rows of the line:
//
//   L14 furnace c3 (R1) pellet_blank -> megabar c10 dense_pellet -> lathe (here) turned_pellet_core -> SRF works c9 sc_jacketed_pellet
//       -> canner (here) stream_pellet -> injector c1 (here) stream_bundle + spent pellets -> injector c2 (here) stream_pellet, 7 in 8
//
// Both machine recipes run only at Sgr A* (gcyr:black_hole_orbit, global.grindless.maxTravel.places.sgra). c1 eats the flux-loaded FRC that
// D1's hot flow line makes and returns its cooled exhaust, which D1's mass filter (cooled_exhaust_return) takes back. The controller is an
// assembly line at VA[MAX]. Published for the tests: global.grindless.maxInjector.recipes, .skipped, .pendingRoutes, .controllerRecipe.
// Rhino: var + function in callbacks.
(function () {
  var LOG = '[grindless/max] '
  var G = global.grindless || (global.grindless = {})
  var MD = G.maxInjector || (G.maxInjector = {})
  MD.recipes = []
  MD.skipped = []
  MD.pendingRoutes = []
  MD.controllerRecipe = 'grindless:assembly_line/mass_stream_injector'

  var VA_MAX = Number(GTValues.VA[14])
  var OPV_VA = 503316480
  var MAX_VA = 2013265920
  var LOW = 7864320
  var SITE = (G.maxTravel && G.maxTravel.places && G.maxTravel.places.sgra ? G.maxTravel.places.sgra.dimension : 'gcyr:black_hole_orbit')
  var CIRCUIT = '#gtceu:circuits/max'
  var CONTROLLER = 'gtceu:mass_stream_injector'
  var RESEARCH = 'grindless:matter_wave_gradiometer'
  var HULL = 'gtceu:max_machine_hull'
  var LINE_FLUID = 'gtceu:superfluid_helium_3'
  var FRC = 'gtceu:flux_loaded_frc'
  var EXHAUST = 'gtceu:cooled_exhaust'

  // the machine's own recipes; items in include the programmed circuit (itemsIn 4 of the recipe type); out: [item, chance, of] with chance 0 = sure
  var ROWS = [
    {
      name: 'stream_bundle', circuit: 1, eut: VA_MAX, duration: 1200,
      items: ['64x grindless:stream_pellet', '4x grindless:max_field_coil'],
      fluids: [[FRC, 4000]], fluidOuts: [[EXHAUST, 3200]],
      outs: [['1x grindless:stream_bundle', 0, 0], ['64x grindless:spent_stream_pellet', 0, 0]]
    },
    {
      name: 'pellet_recast', circuit: 2, eut: LOW, duration: 100,
      items: ['1x grindless:spent_stream_pellet'],
      fluids: [], fluidOuts: [],
      outs: [['1x grindless:stream_pellet', 7, 8]]
    }
  ]

  // GTM rows of the line: type, name, inputs (with counts), fluids, outputs, EU/t and ticks
  var GTM = [
    { type: 'lathe', name: 'turned_pellet_core', items: ['8x grindless:dense_pellet'], fluids: [],
      outs: ['8x grindless:turned_pellet_core'], eut: 1966080, duration: 600 },
    { type: 'canner', name: 'stream_pellet', items: ['8x grindless:sc_jacketed_pellet', '4x gtceu:tritanium_foil'],
      fluids: [['gtceu:liquid_helium', 500]], outs: ['8x grindless:stream_pellet'], eut: OPV_VA, duration: 600 },
    // the turn casing: made at home from OpV parts, so the injector can be built (no input comes from the injector's line)
    { type: 'assembler', name: 'stream_turn_casing', circuit: 12,
      items: ['gtceu:opv_machine_casing', '4x gtceu:tungsten_steel_plate', '2x grindless:chain_field_coil', '2x #gtceu:circuits/max'],
      fluids: [['gtceu:superfluid_helium_3', 250]], outs: ['2x grindless:stream_turn_casing'], eut: MAX_VA, duration: 200 },
    // G1's shell rings: four bundles held in a frame
    { type: 'assembler', name: 'stream_bundle_block', circuit: 13,
      items: ['4x grindless:stream_bundle', 'gtceu:tungsten_steel_frame'],
      fluids: [['gtceu:superfluid_helium_3', 250]], outs: ['grindless:stream_bundle_block'], eut: OPV_VA, duration: 200 }
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
    console.error(LOG + 'injector ' + name + ' skipped, unknown id(s): ' + missing.join(', '))
  }

  ServerEvents.recipes(function (event) {
    ROWS.forEach(function (r) {
      try {
        var missing = missingOf(r.items.concat(r.outs.map(function (o) { return o[0] })),
          r.fluids.concat(r.fluidOuts).map(function (f) { return f[0] }))
        if (missing.length > 0) {
          skip(r.name, missing)
          return
        }
        var b = event.recipes.gtceu.mass_stream_injection('grindless:' + r.name)
        b.circuit(r.circuit)
        r.items.forEach(function (s) { b.itemInputs(s) })
        r.fluids.forEach(function (f) { b.inputFluids(Fluid.of(f[0], f[1])) })
        r.outs.forEach(function (o) {
          // 7/8 is not a whole number of ten-thousandths: the builder's chance and maxChance, reset right after
          if (o[1] > 0) {
            b.chance(o[1]).maxChance(o[2])
            b.itemOutputs(o[0])
            b.chance(10000).maxChance(10000)
          } else {
            b.itemOutputs(o[0])
          }
        })
        r.fluidOuts.forEach(function (f) { b.outputFluids(Fluid.of(f[0], f[1])) })
        b.dimension(SITE)
        b.addDataString('grindless_mass_stream_injection', r.name)
        b.EUt(r.eut).duration(r.duration)
        MD.recipes.push('grindless:mass_stream_injection/' + r.name)
      } catch (e) {
        console.error(LOG + 'injector ' + r.name + ' failed: ' + e)
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
        console.error(LOG + 'injector ' + r.name + ' failed: ' + e)
      }
    })

    try {
      var ids = [HULL, CONTROLLER, RESEARCH, 'grindless:max_sensor', 'grindless:max_emitter', 'grindless:max_field_generator',
        'grindless:stream_pellet', 'grindless:max_field_coil', 'grindless:diamond_power_die']
      var mc = missingOf(ids, [LINE_FLUID])
      if (mc.length > 0) {
        skip('mass_stream_injector', mc)
      } else {
        var a = event.recipes.gtceu.assembly_line('grindless:mass_stream_injector')
        a.itemInputs(HULL, '4x ' + CIRCUIT, '4x grindless:max_sensor', '4x grindless:max_emitter', '4x grindless:max_field_generator',
          'grindless:stream_pellet', 'grindless:max_field_coil', 'grindless:diamond_power_die', 'grindless:matter_wave_gradiometer')
        a.inputFluids(Fluid.of(LINE_FLUID, 1000))
        a.itemOutputs(CONTROLLER)
        a.stationResearch(function (r) { return r.researchStack(Item.of(RESEARCH)).CWUt(64).EUt(VA_MAX) })
        a.EUt(VA_MAX).duration(2400)
      }
    } catch (e) {
      console.error(LOG + 'injector controller failed: ' + e)
    }
    console.info(LOG + 'injector: ' + MD.recipes.length + ' recipes; skipped ' + MD.skipped.length)
  })
})()
