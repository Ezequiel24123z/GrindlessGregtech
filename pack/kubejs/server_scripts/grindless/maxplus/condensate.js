// priority: -20176
// MAX+ machines 1 and 2 (docs/eras/maxplus.md, machines 1 and 2, lines P1 to P5; package XP-A1). The older steps of the lines are rows marked
// XP-A1 in their own tables and scripts; this file holds the two machines' recipes, their controllers, the two casings and the empty cell shell:
//
//   refinery c1 settle: 16,000 mB kerr condensate -> 12,000 mB settled condensate + 4 condensate boil-off (circuit 1, P1)
//   refinery c10 recompress: 4 boil-off -> 4,000 mB kerr condensate, back to c1 (nothing is vented; own circuit so the lookup never clashes with c1)
//   refinery c2 neutronium bind (P2), c3 strange bind (P3), c4 strand cladding on MAX horizon strand wire (P4), c5 degenerate bind (P5):
//       each takes settled condensate and the line's older form and gives the bound form plus boil-off
//   press c1 bound neutronium ingot -> horizon compressed plate (P2), c2 Kerr strange ingot -> Kerr strange plate (P3); the press flash is
//       2,000 mB kerr condensate, the c1 feed of the refinery
//
// Rows run at Sgr A* (gcyr:black_hole_orbit). The refinery runs at VA[MAX] to V[MAX] x 16 and the press at V[MAX] x 16 (never a literal) on
// 1,024 A or 64 A substation hatches. Amounts are the design's first figures (tune). The empty condensate cell shell is an assembler row at
// home; the superfluid helium plant (uv/cold.js) fills it. The controllers are assembly lines at VA[MAX]; the two casings are made at home.
// Published for the tests: global.grindless.maxPlusCondensate.recipes, .skipped, .controllerRecipes.
// Rhino: var + function in callbacks.
(function () {
  var LOG = '[grindless/maxplus] '
  var G = global.grindless || (global.grindless = {})
  var MC = G.maxPlusCondensate || (G.maxPlusCondensate = {})
  MC.recipes = []
  MC.skipped = []
  MC.controllerRecipes = ['grindless:assembly_line/condensate_refinery', 'grindless:assembly_line/bound_matter_press']

  var VA_MAX = Number(GTValues.VA[14])
  var V_MAX = Number(GTValues.V[14])
  var LOW = 7864320
  var CIRCUIT = '#gtceu:circuits/max'
  var HULL = 'gtceu:max_machine_hull'
  var KERR = 'gtceu:kerr_condensate'
  var SETTLED = 'gtceu:settled_condensate'

  // type, key, name, circuit, inputs, fluids in, outputs, fluids out, EU/t, ticks
  var ROWS = [
    { type: 'condensate_refinery', key: 'grindless_condensate_refinery', name: 'settle', circuit: 1, eut: VA_MAX, duration: 600,
      items: [], fluids: [[KERR, 16000]], outs: ['4x grindless:condensate_boil_off'], fluidOuts: [[SETTLED, 12000]] },
    { type: 'condensate_refinery', key: 'grindless_condensate_refinery', name: 'recompress_boil_off', circuit: 10, eut: VA_MAX, duration: 300,
      items: ['4x grindless:condensate_boil_off'], fluids: [], outs: [], fluidOuts: [[KERR, 4000]] },
    // D5-QPU-MAXP (X1 step 32, c12): the linked horizon module jacketed in 1,000 mB of Kerr condensate (the processor's own, moved here)
    { type: 'condensate_refinery', key: 'grindless_condensate_refinery', name: 'condensate_cooled_module', circuit: 12, eut: VA_MAX, duration: 1800,
      items: ['1x grindless:linked_horizon_module'], fluids: [[KERR, 1000]], outs: ['1x grindless:condensate_cooled_module'], fluidOuts: [] },
    { type: 'condensate_refinery', key: 'grindless_condensate_refinery', name: 'neutronium_bind', circuit: 2, eut: V_MAX * 2, duration: 1200,
      items: ['16x grindless:compressed_neutronium_core'], fluids: [[SETTLED, 32000]],
      outs: ['8x grindless:bound_neutronium_ingot', '8x grindless:condensate_boil_off'], fluidOuts: [] },
    { type: 'condensate_refinery', key: 'grindless_condensate_refinery', name: 'strange_bind', circuit: 3, eut: V_MAX * 4, duration: 1500,
      items: ['8x grindless:strange_alloy_charge'], fluids: [[SETTLED, 24000]],
      outs: ['4x grindless:kerr_strange_ingot', '6x grindless:condensate_boil_off'], fluidOuts: [] },
    { type: 'condensate_refinery', key: 'grindless_condensate_refinery', name: 'strand_cladding', circuit: 4, eut: V_MAX * 8, duration: 900,
      items: ['16x gtceu:horizon_strand_single_wire'], fluids: [[SETTLED, 16000]],
      outs: ['16x grindless:kerr_clad_strand', '4x grindless:condensate_boil_off'], fluidOuts: [] },
    { type: 'condensate_refinery', key: 'grindless_condensate_refinery', name: 'degenerate_bind', circuit: 5, eut: V_MAX * 16, duration: 2400,
      items: ['8x grindless:degenerate_compact'], fluids: [[SETTLED, 32000]],
      outs: ['8x grindless:bound_degenerate_powder', '8x grindless:condensate_boil_off'], fluidOuts: [] },
    { type: 'bound_matter_press', key: 'grindless_bound_matter_press', name: 'bound_neutronium_plate', circuit: 1, eut: V_MAX * 16, duration: 1200,
      items: ['8x grindless:bound_neutronium_ingot'], fluids: [], outs: ['4x grindless:horizon_compressed_plate'], fluidOuts: [[KERR, 2000]] },
    { type: 'bound_matter_press', key: 'grindless_bound_matter_press', name: 'strange_plate', circuit: 2, eut: V_MAX * 16, duration: 1200,
      items: ['8x grindless:kerr_strange_ingot'], fluids: [], outs: ['4x grindless:kerr_strange_plate'], fluidOuts: [[KERR, 2000]] },
    // XP-H1 (line T4 step 3, c4): horizon plate and Gd-HfB2 cermet pressed into the graded laminate the loom's c1 weaves
    { type: 'bound_matter_press', key: 'grindless_bound_matter_press', name: 'graded_horizon_laminate', circuit: 4, eut: V_MAX * 16, duration: 1200,
      items: ['4x grindless:gd_hfb2_cermet'], kept: ['grindless:horizon_compressed_plate'], fluids: [], outs: ['2x grindless:graded_horizon_laminate'], fluidOuts: [[KERR, 2000]] },
    // XP-H3 (line T1 step 3, c3): the Gd absorber tile and graded Z billet pressed into the laminated core the assembler's c1 uses
    { type: 'bound_matter_press', key: 'grindless_bound_matter_press', name: 'laminated_containment_core', circuit: 3, eut: V_MAX * 16, duration: 1200,
      items: ['4x grindless:gd_absorber_tile', '2x grindless:graded_z_billet'], kept: ['grindless:horizon_compressed_plate'], fluids: [], outs: ['2x grindless:laminated_containment_core'], fluidOuts: [[KERR, 2000]] }
  ]

  // GTM rows at home: the empty cell shell and the two casings (no input comes from the machines' own lines)
  var GTM = [
    { type: 'assembler', name: 'condensate_cell', circuit: 21,
      items: ['2x gtceu:tungsten_steel_plate', '2x gtceu:tungsten_steel_ring', '#gtceu:circuits/max'],
      fluids: [['gtceu:epoxy', 144]], outs: ['4x grindless:condensate_cell'], eut: LOW, duration: 300 },
    { type: 'chemical_reactor', name: 'jacketed_condensate_cell', circuit: 24,
      items: ['grindless:condensate_cell'],
      fluids: [[SETTLED, 1000], ['gtceu:superfluid_helium_3', 1000]], outs: ['grindless:jacketed_condensate_cell'], eut: LOW, duration: 400 },
    { type: 'assembler', name: 'condensate_vessel_casing', circuit: 22,
      items: ['gtceu:opv_machine_casing', '4x gtceu:tungsten_steel_rod', '2x grindless:max_field_coil', '2x #gtceu:circuits/max'],
      fluids: [['gtceu:superfluid_helium_3', 250]], outs: ['2x grindless:condensate_vessel_casing'], eut: VA_MAX, duration: 200 },
    { type: 'assembler', name: 'bound_press_casing', circuit: 23,
      items: ['gtceu:opv_machine_casing', '4x gtceu:tungsten_steel_rod', '2x grindless:diamond_power_die', '2x #gtceu:circuits/max'],
      fluids: [['gtceu:superfluid_helium_3', 250]], outs: ['2x grindless:bound_press_casing'], eut: VA_MAX, duration: 200 }
  ]

  var CONTROLLERS = [
    { name: 'condensate_refinery', machine: 'gtceu:condensate_refinery', research: 'grindless:horizon_phase_lock', casing: 'grindless:condensate_vessel_casing',
      extra: ['2x grindless:max_electric_pump', '2x grindless:max_fluid_regulator', '4x grindless:stream_bundle'] },
    { name: 'bound_matter_press', machine: 'gtceu:bound_matter_press', research: 'grindless:horizon_flux_clamp', casing: 'grindless:bound_press_casing',
      extra: ['2x grindless:max_electric_piston', '2x grindless:max_robot_arm', '4x grindless:stream_bundle'] }
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
    MC.skipped.push(name)
    console.error(LOG + 'condensate ' + name + ' skipped, unknown id(s): ' + missing.join(', '))
  }

  function fluidIds(list) { return list.map(function (f) { return f[0] }) }

  ServerEvents.recipes(function (event) {
    try {
    ROWS.forEach(function (r) {
      try {
        var missing = missingOf(r.items.concat(r.kept || [], r.outs), fluidIds(r.fluids).concat(fluidIds(r.fluidOuts)))
        if (missing.length > 0) {
          skip(r.type + '/' + r.name, missing)
          return
        }
        var b = event.recipes.gtceu[r.type]('grindless:' + r.name)
        b.circuit(r.circuit)
        r.items.forEach(function (s) { b.itemInputs(s) })
        ;(r.kept || []).forEach(function (s) { b.notConsumable(s) })
        r.fluids.forEach(function (f) { b.inputFluids(Fluid.of(f[0], f[1])) })
        r.outs.forEach(function (s) { b.itemOutputs(s) })
        r.fluidOuts.forEach(function (f) { b.outputFluids(Fluid.of(f[0], f[1])) })
        b.addDataString(r.key, r.name)
        b.EUt(r.eut).duration(r.duration)
        MC.recipes.push('grindless:' + r.type + '/' + r.name)
      } catch (e) {
        console.error(LOG + 'condensate ' + r.name + ' failed: ' + e)
      }
    })

    GTM.forEach(function (r) {
      try {
        var missing = missingOf(r.items.concat(r.outs), fluidIds(r.fluids))
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
        MC.recipes.push('grindless:' + r.type + '/' + r.name)
      } catch (e) {
        console.error(LOG + 'condensate ' + r.name + ' failed: ' + e)
      }
    })

    CONTROLLERS.forEach(function (c) {
      try {
        var ins = [HULL, c.research, c.casing, 'grindless:max_field_generator', 'grindless:max_electric_motor'].concat(c.extra)
        var mc = missingOf(ins.concat([c.machine]), ['gtceu:superfluid_helium_3'])
        if (mc.length > 0) {
          skip(c.name + ' controller', mc)
          return
        }
        var a = event.recipes.gtceu.assembly_line('grindless:' + c.name)
        a.itemInputs(HULL, '4x ' + CIRCUIT, '4x ' + c.casing, '4x grindless:max_field_generator', '2x grindless:max_electric_motor')
        c.extra.forEach(function (s) { a.itemInputs(s) })
        a.inputFluids(Fluid.of('gtceu:superfluid_helium_3', 1000))
        a.itemOutputs(c.machine)
        a.stationResearch(function (r) { return r.researchStack(Item.of(c.research)).CWUt(64).EUt(VA_MAX) })
        a.EUt(VA_MAX).duration(2400)
      } catch (e) {
        console.error(LOG + 'condensate ' + c.name + ' controller failed: ' + e)
      }
    })
    console.info(LOG + 'condensate: ' + MC.recipes.length + ' recipes; skipped ' + MC.skipped.length)
    } catch (e) {
      console.error('[grindless/maxplus/condensate] recipes failed: ' + e)
    }
  })
})()
