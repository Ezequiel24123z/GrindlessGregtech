// -----------------------------------------------------------------------------------------------
// MAX horizon interferometer (docs/eras/max.md, machine 11, lines L47, L48, L49, L56 and L57; package MX-S1). The line steps on older machines
// are rows marked MX-S1 in their own tables and scripts; this file holds the machine's three recipes, its controller, the two casing crafts and
// the GTM rows of the lines (lathe, electric furnace, cutter, assembler):
//
//   L47 platinum plant c21 -> levitation melter c22 -> lathe (here) au_pt_test_mass -> MTJ c24 -> assembler (here) gravitational_reference_sensor
//       (the UV LED die: MOCVD c29)
//   L48 zone refining c14 -> electric furnace (here) -> MTJ c25 -> assembler (here) hydroxide_bonded_bench -> photonic foundry c25
//   L49 extraction cascade c31 -> zone refining c15 -> EB furnace c31 -> assembler (here) wetted_emitter_crown -> assembler (here) feep_thruster
//   L56 crystal growth c32 -> cutter (here) -> MOCVD c30 and fibre draw c21 -> photonic foundry c26 (stabilised_npro_laser)
//   L57 zone refining c16 -> cutter (here) -> ion implanter c15 -> BEUV c15 -> cutter (here) -> assembler (here) phasemeter_board
//
// The three machine recipes run only at Sgr A* (gcyr:black_hole_orbit, global.grindless.maxTravel.places.sgra). The cloud phase map needs
// shell c2's final spin map kept in the bus (the map is not consumed), which holds the "only after the shell's c1" order of the design. The
// used reference sensors and optical benches that c1 returns are the inputs of c3, so no instrument is voided; the spent FEEP crowns go to
// the EB furnace (c32) and come back as porous crowns. Published for the tests: global.grindless.maxHorizonInterferometer.recipes, .skipped,
// .pendingRoutes, .controllerRecipe.
// Rhino: var + function in callbacks.
(function () {
  var LOG = '[grindless/max] '
  var G = global.grindless || (global.grindless = {})
  var MD = G.maxHorizonInterferometer || (G.maxHorizonInterferometer = {})
  MD.recipes = []
  MD.skipped = []
  MD.pendingRoutes = []
  MD.controllerRecipe = 'grindless:assembly_line/horizon_interferometer'

  var VA_MAX = Number(GTValues.VA[14])
  var LOW = 7864320
  var SITE = (G.maxTravel && G.maxTravel.places && G.maxTravel.places.sgra ? G.maxTravel.places.sgra.dimension : 'gcyr:black_hole_orbit')
  var CIRCUIT = '#gtceu:circuits/max'
  var CONTROLLER = 'gtceu:horizon_interferometer'
  var RESEARCH = 'grindless:gravitational_reference_sensor'
  var HULL = 'gtceu:max_machine_hull'
  var LINE_FLUID = 'gtceu:superfluid_helium_3'
  var KEPT_MAP = 'grindless:final_spin_map'
  var DATA_KEY = 'grindless_horizon_interferometry'

  // the machine's own recipes; items in include the programmed circuit (itemsIn 9 of the recipe type); kept items are not consumed; a chanced
  // output is [stack, chance out of 10000]
  var ROWS = [
    {
      name: 'cloud_phase_map', circuit: 1, duration: 2400,
      items: ['3x grindless:gravitational_reference_sensor', '3x grindless:bonded_optical_bench', '3x grindless:stabilised_npro_laser',
        '12x grindless:feep_thruster', '2x grindless:phasemeter_board'],
      kept: [KEPT_MAP],
      outs: ['1x grindless:cloud_phase_map', '12x grindless:spent_feep_crown'],
      chanced: [['3x grindless:used_reference_sensor', 7500], ['3x grindless:used_optical_bench', 7500]]
    },
    {
      name: 'calibrated_oscillator_bank', circuit: 2, duration: 600,
      items: ['4x grindless:phase_lock_oscillator_bank'],
      kept: ['grindless:cloud_phase_map'],
      outs: ['4x grindless:calibrated_oscillator_bank'],
      chanced: []
    },
    {
      name: 'cloud_phase_map_reuse', circuit: 3, duration: 2400,
      items: ['2x grindless:used_reference_sensor', '1x grindless:gravitational_reference_sensor', '3x grindless:used_optical_bench',
        '3x grindless:stabilised_npro_laser', '12x grindless:feep_thruster', '2x grindless:phasemeter_board'],
      kept: [KEPT_MAP],
      outs: ['1x grindless:cloud_phase_map'],
      chanced: []
    }
  ]

  var ASSEMBLY_TAIL = ['1x ' + CIRCUIT, '2x gtceu:tritanium_plate', '4x gtceu:tritanium_foil', '2x gtceu:horizon_strand_single_wire',
    '2x gtceu:tritanium_round', '1x gtceu:fine_gold_wire']

  // GTM rows of the lines: type, name, inputs (with counts), fluids, outputs, EU/t and ticks; eut null is VA[MAX]
  var GTM = [
    { type: 'lathe', name: 'au_pt_test_mass', items: ['4x grindless:au_pt_ingot'], fluids: [],
      outs: ['1x grindless:au_pt_test_mass'], eut: LOW, duration: 600 },
    { type: 'assembler', name: 'zero_expansion_baseplate', items: ['1x grindless:ultrapure_silica_plate', '1x gtceu:titanium_dust'].concat(ASSEMBLY_TAIL),
      fluids: [['gtceu:oxygen', 1000], ['gtceu:soldering_alloy', 288]], outs: ['1x grindless:zero_expansion_baseplate'], eut: LOW, duration: 800 },
    { type: 'assembler', name: 'hydroxide_bonded_bench', items: ['2x grindless:coated_bench_optics', '1x gtceu:sodium_hydroxide_dust'].concat(ASSEMBLY_TAIL),
      fluids: [['gtceu:distilled_water', 1000], ['gtceu:soldering_alloy', 288]], outs: ['1x grindless:hydroxide_bonded_bench'], eut: LOW, duration: 400 },
    { type: 'assembler', name: 'wetted_emitter_crown', items: ['1x grindless:porous_tungsten_crown', '1x grindless:six_n_indium'].concat(ASSEMBLY_TAIL),
      fluids: [['gtceu:argon', 1000], ['gtceu:soldering_alloy', 288]], outs: ['1x grindless:wetted_emitter_crown'], eut: LOW, duration: 400 },
    { type: 'cutter', name: 'npro_crystal', items: ['1x grindless:nd_yag_boule'], fluids: [['gtceu:lubricant', 100]],
      outs: ['4x grindless:npro_crystal'], eut: LOW, duration: 600 },
    { type: 'cutter', name: 'fz_wafer', items: ['1x grindless:fz_silicon_rod'], fluids: [['gtceu:lubricant', 100]],
      outs: ['4x grindless:fz_wafer'], eut: LOW, duration: 600 },
    { type: 'cutter', name: 'fpga_die', items: ['1x grindless:rad_hard_fpga_wafer'], fluids: [['gtceu:lubricant', 100]],
      outs: ['2x grindless:fpga_die'], eut: LOW, duration: 600 },
    { type: 'assembler', name: 'gravitational_reference_sensor', eut: null, duration: 600,
      items: ['1x grindless:coated_test_mass', '2x grindless:uv_led_die'].concat(ASSEMBLY_TAIL),
      fluids: [['gtceu:soldering_alloy', 288]], outs: ['1x grindless:gravitational_reference_sensor'] },
    { type: 'assembler', name: 'feep_thruster', eut: null, duration: 600,
      items: ['2x grindless:wetted_emitter_crown'].concat(ASSEMBLY_TAIL),
      fluids: [['gtceu:soldering_alloy', 288]], outs: ['1x grindless:feep_thruster'] },
    { type: 'assembler', name: 'phasemeter_board', eut: null, duration: 600,
      items: ['2x grindless:fpga_die'].concat(ASSEMBLY_TAIL),
      fluids: [['gtceu:soldering_alloy', 288]], outs: ['1x grindless:phasemeter_board'] }
  ]

  // the two casings no other package makes: the same craft as casings.js (circuits 17 and 18; 14-16 are QR-MAX's), two per craft
  var CASINGS = [
    { name: 'test_mass_enclosure_casing', circuit: 17,
      items: ['gtceu:opv_machine_casing', '4x gtceu:tungsten_steel_plate', '2x grindless:zero_expansion_baseplate', '2x ' + CIRCUIT] },
    { name: 'laser_link_casing', circuit: 18,
      items: ['gtceu:opv_machine_casing', '4x gtceu:tungsten_steel_plate', '2x grindless:yb_doped_fibre', '2x grindless:coated_bench_optics', '2x ' + CIRCUIT] }
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
    console.error(LOG + 'horizon interferometer ' + name + ' skipped, unknown id(s): ' + missing.join(', '))
  }

  ServerEvents.recipes(function (event) {
    ROWS.forEach(function (r) {
      try {
        var chancedStacks = r.chanced.map(function (c) { return c[0] })
        var missing = missingOf(r.items.concat(r.kept, r.outs, chancedStacks), [])
        if (missing.length > 0) {
          skip(r.name, missing)
          return
        }
        var b = event.recipes.gtceu.horizon_interferometry('grindless:' + r.name)
        b.circuit(r.circuit)
        r.items.forEach(function (s) { b.itemInputs(s) })
        r.kept.forEach(function (id) { b.notConsumable(id) })
        r.outs.forEach(function (s) { b.itemOutputs(s) })
        r.chanced.forEach(function (c) { b.chancedOutput(c[0], c[1], 0) })
        b.dimension(SITE)
        b.addDataString(DATA_KEY, r.name)
        b.EUt(VA_MAX).duration(r.duration)
        MD.recipes.push('grindless:horizon_interferometry/' + r.name)
      } catch (e) {
        console.error(LOG + 'horizon interferometer ' + r.name + ' failed: ' + e)
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
        console.error(LOG + 'horizon interferometer ' + r.name + ' failed: ' + e)
      }
    })

    CASINGS.forEach(function (c) {
      try {
        var out = 'grindless:' + c.name
        var missing = missingOf(c.items.concat([out]), [LINE_FLUID])
        if (missing.length > 0) {
          skip(c.name, missing)
          return
        }
        var b = event.recipes.gtceu.assembler('grindless:' + c.name)
        b.circuit(c.circuit)
        c.items.forEach(function (s) { b.itemInputs(s) })
        b.inputFluids(Fluid.of(LINE_FLUID, 250))
        b.itemOutputs('2x ' + out)
        b.EUt(VA_MAX).duration(200)
        MD.recipes.push('grindless:assembler/' + c.name)
      } catch (e) {
        console.error(LOG + 'horizon interferometer casing ' + c.name + ' failed: ' + e)
      }
    })

    try {
      var ids = [HULL, CONTROLLER, RESEARCH, 'grindless:max_sensor', 'grindless:max_emitter', 'grindless:max_field_generator',
        'grindless:bonded_optical_bench', 'grindless:stabilised_npro_laser', 'grindless:phasemeter_board', 'grindless:feep_thruster']
      var mc = missingOf(ids, [LINE_FLUID])
      if (mc.length > 0) {
        skip('horizon_interferometer', mc)
      } else {
        var a = event.recipes.gtceu.assembly_line('grindless:horizon_interferometer')
        a.itemInputs(HULL, '4x ' + CIRCUIT, '8x grindless:max_sensor', '4x grindless:max_emitter', '4x grindless:max_field_generator',
          'grindless:bonded_optical_bench', 'grindless:stabilised_npro_laser', 'grindless:phasemeter_board', 'grindless:feep_thruster')
        a.inputFluids(Fluid.of(LINE_FLUID, 1000))
        a.itemOutputs(CONTROLLER)
        a.stationResearch(function (r) { return r.researchStack(Item.of(RESEARCH)).CWUt(64).EUt(VA_MAX) })
        a.EUt(VA_MAX).duration(2400)
      }
    } catch (e) {
      console.error(LOG + 'horizon interferometer controller failed: ' + e)
    }
    console.info(LOG + 'horizon interferometer: ' + MD.recipes.length + ' recipes; skipped ' + MD.skipped.length)
  })
})()
