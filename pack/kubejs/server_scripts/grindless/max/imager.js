// priority: -19944
// -----------------------------------------------------------------------------------------------
// MAX photon ring imager (docs/eras/max.md, machine 5, lines L21, L22, L44 and L45; package MAX-D2). The line steps on older machines are
// rows marked MAX-D2 in their own tables and scripts; this file holds the machine's two recipes, its controller and the GTM rows of the
// lines (cutter, chemical bath, chemical reactor, assembler):
//
//   L21 SiC fibre c19 -> CVI c14 -> implanter c16 -> MTJ c17 -> assembler (here) imager_dish_panel
//   L22 MTJ c18 -> BEUV c11 -> chemical bath (here) -> cutter (here) -> mK cryostat c9 -> assembler (here) sis_mixer
//   L44 MOCVD c28 -> BEUV c13 -> chemical reactor (here) -> cutter (here) -> photonic foundry c24 (photonic_lo_module)
//   L45 crystal growth c32 -> MBE c14 -> BEUV c14 -> cutter (here) -> He refrigerator -> assembler (here) cryo_lna_module
//
// Both machine recipes run only at Sgr A* (gcyr:black_hole_orbit, global.grindless.maxTravel.places.sgra). The assemblers run at VA[MAX] in
// gtceu:assembly_hall on two OpV 4 A hatches (decision 68, as A2, A3 and B3). The first recipe closes the route B2's interferometer
// left pending (sgr_a_spin_map). Published for the tests: global.grindless.maxImager.recipes, .skipped, .pendingRoutes, .controllerRecipe.
// Rhino: var + function in callbacks.
(function () {
  var LOG = '[grindless/max] '
  var G = global.grindless || (global.grindless = {})
  var MD = G.maxImager || (G.maxImager = {})
  MD.recipes = []
  MD.skipped = []
  MD.pendingRoutes = []
  MD.controllerRecipe = 'grindless:assembly_line/photon_ring_imager'

  var VA_MAX = Number(GTValues.VA[14])
  var LOW = 7864320
  var SITE = (G.maxTravel && G.maxTravel.places && G.maxTravel.places.sgra ? G.maxTravel.places.sgra.dimension : 'gcyr:black_hole_orbit')
  var CIRCUIT = '#gtceu:circuits/max'
  var CONTROLLER = 'gtceu:photon_ring_imager'
  var RESEARCH = 'grindless:sis_mixer'
  var HULL = 'gtceu:max_machine_hull'
  var COOLANT = 'gtceu:liquid_helium'
  var LINE_FLUID = 'gtceu:superfluid_helium_3'
  var BOILOFF = 'gtceu:helium'

  // the machine's own recipes; items in include the programmed circuit (itemsIn 9 of the recipe type); kept items are not consumed
  var ROWS = [
    {
      name: 'sgr_a_spin_map', circuit: 1, duration: 2400,
      items: ['4x grindless:imager_dish_panel', '2x grindless:sis_mixer', '1x grindless:photonic_lo_module', '2x grindless:cryo_lna_module',
        '1x grindless:clock_locked_microcomb', '1x grindless:quantum_memory_node', '1x grindless:rydberg_logic_array'],
      kept: [],
      fluids: [[COOLANT, 1000]], fluidOuts: [[BOILOFF, 1000]],
      outs: ['1x grindless:sgr_a_spin_map', '1x grindless:spent_rydberg_array', '1x grindless:sis_scrap']
    },
    {
      name: 'nsc_ephemeris', circuit: 2, duration: 1200,
      items: ['2x grindless:sis_mixer'],
      kept: ['grindless:sgr_a_spin_map'],
      fluids: [[COOLANT, 500]], fluidOuts: [[BOILOFF, 500]],
      outs: ['1x grindless:nsc_ephemeris', '1x grindless:sis_scrap']
    }
  ]

  var ASSEMBLY_TAIL = ['1x ' + CIRCUIT, '2x gtceu:tritanium_plate', '4x gtceu:tritanium_foil', '2x gtceu:horizon_strand_single_wire',
    '2x gtceu:tritanium_round', '1x gtceu:fine_gold_wire']

  // GTM rows of the lines: type, name, inputs (with counts), fluids, outputs, EU/t and ticks
  var GTM = [
    { type: 'assembler', name: 'imager_dish_panel', eut: null, duration: 600,
      items: ['2x grindless:gold_coated_dish'].concat(ASSEMBLY_TAIL),
      fluids: [['gtceu:soldering_alloy', 288]], outs: ['1x grindless:imager_dish_panel'] },
    { type: 'chemical_bath', name: 'anodised_junction_wafer', items: ['1x grindless:sis_junction_wafer'], fluids: [['gtceu:sulfuric_acid', 1000]],
      outs: ['1x grindless:anodised_junction_wafer'], eut: LOW, duration: 400 },
    { type: 'cutter', name: 'sis_die', items: ['1x grindless:anodised_junction_wafer'], fluids: [['gtceu:lubricant', 100]],
      outs: ['2x grindless:sis_die'], eut: LOW, duration: 600 },
    { type: 'assembler', name: 'sis_mixer', eut: null, duration: 600,
      items: ['2x grindless:tested_sis_die'].concat(ASSEMBLY_TAIL),
      fluids: [['gtceu:soldering_alloy', 288]], outs: ['1x grindless:sis_mixer'] },
    { type: 'chemical_reactor', name: 'passivated_utc_wafer', items: ['1x grindless:utc_photodiode_wafer'],
      fluids: [['gtceu:silane', 500], ['gtceu:ammonia', 1000]], outs: ['1x grindless:passivated_utc_wafer'], eut: LOW, duration: 400 },
    { type: 'cutter', name: 'utc_die', items: ['1x grindless:passivated_utc_wafer'], fluids: [['gtceu:lubricant', 100]],
      outs: ['2x grindless:utc_die'], eut: LOW, duration: 600 },
    { type: 'cutter', name: 'hemt_die', items: ['1x grindless:hemt_gate_wafer'], fluids: [['gtceu:lubricant', 100]],
      outs: ['2x grindless:hemt_die'], eut: LOW, duration: 600 },
    { type: 'assembler', name: 'cryo_lna_module', eut: null, duration: 600,
      items: ['2x grindless:cryo_tested_lna'].concat(ASSEMBLY_TAIL),
      fluids: [['gtceu:soldering_alloy', 288]], outs: ['1x grindless:cryo_lna_module'] }
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
    console.error(LOG + 'imager ' + name + ' skipped, unknown id(s): ' + missing.join(', '))
  }

  ServerEvents.recipes(function (event) {
    ROWS.forEach(function (r) {
      try {
        var missing = missingOf(r.items.concat(r.kept, r.outs), r.fluids.concat(r.fluidOuts).map(function (f) { return f[0] }))
        if (missing.length > 0) {
          skip(r.name, missing)
          return
        }
        var b = event.recipes.gtceu.photon_ring_imaging('grindless:' + r.name)
        b.circuit(r.circuit)
        r.items.forEach(function (s) { b.itemInputs(s) })
        r.kept.forEach(function (id) { b.notConsumable(id) })
        r.fluids.forEach(function (f) { b.inputFluids(Fluid.of(f[0], f[1])) })
        r.outs.forEach(function (s) { b.itemOutputs(s) })
        r.fluidOuts.forEach(function (f) { b.outputFluids(Fluid.of(f[0], f[1])) })
        b.dimension(SITE)
        b.addDataString('grindless_photon_ring_imaging', r.name)
        b.EUt(VA_MAX).duration(r.duration)
        MD.recipes.push('grindless:photon_ring_imaging/' + r.name)
      } catch (e) {
        console.error(LOG + 'imager ' + r.name + ' failed: ' + e)
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
        r.items.forEach(function (s) { b.itemInputs(s) })
        r.fluids.forEach(function (f) { b.inputFluids(Fluid.of(f[0], f[1])) })
        r.outs.forEach(function (s) { b.itemOutputs(s) })
        b.EUt(r.eut === null ? VA_MAX : r.eut).duration(r.duration)
        MD.recipes.push('grindless:' + r.type + '/' + r.name)
      } catch (e) {
        console.error(LOG + 'imager ' + r.name + ' failed: ' + e)
      }
    })

    try {
      var ids = [HULL, CONTROLLER, RESEARCH, 'grindless:max_sensor', 'grindless:max_emitter', 'grindless:max_field_generator',
        'grindless:imager_dish_panel', 'grindless:quantum_memory_node', 'grindless:rydberg_logic_array']
      var mc = missingOf(ids, [LINE_FLUID])
      if (mc.length > 0) {
        skip('photon_ring_imager', mc)
      } else {
        var a = event.recipes.gtceu.assembly_line('grindless:photon_ring_imager')
        a.itemInputs(HULL, '4x ' + CIRCUIT, '8x grindless:max_sensor', '4x grindless:max_emitter', '4x grindless:max_field_generator',
          'grindless:imager_dish_panel', 'grindless:quantum_memory_node', 'grindless:rydberg_logic_array')
        a.inputFluids(Fluid.of(LINE_FLUID, 1000))
        a.itemOutputs(CONTROLLER)
        a.stationResearch(function (r) { return r.researchStack(Item.of(RESEARCH)).CWUt(64).EUt(VA_MAX) })
        a.EUt(VA_MAX).duration(2400)
      }
    } catch (e) {
      console.error(LOG + 'imager controller failed: ' + e)
    }
    console.info(LOG + 'imager: ' + MD.recipes.length + ' recipes; skipped ' + MD.skipped.length)
  })
})()
