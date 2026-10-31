// priority: -20014
// -----------------------------------------------------------------------------------------------
// MAX-B3 Rydberg array works (docs/eras/max.md, machine 1, lines L19, L23, L29, L40, L43, L46; package MAX-B3). The line steps on older
// machines are rows marked MAX-B3 in their own tables and scripts; this file holds the machine's two recipes, its controller and the GTM
// rows of the lines (cutter, chemical reactor, electric furnace, assembler):
//
//   L19 calutron c18-19 (Rb-87; c19 takes the getter scrap back) + MOCVD c26 (laser die) + QGL c6 (Rb-87 cartridge) -> c1 here
//   L23 crystal growth c30 -> cutter (here) -> SHB c26 -> fibre draw c19 -> assembler (here) quantum_memory_node
//   L29 MOCVD c27 -> BEUV c12 -> femto c9 -> foundry c23 -> clock lab c7 (clock_locked_microcomb)
//   L40 chemical reactor (here) -> zone refining c13 -> fibre draw c20 -> femto c11 -> assembler (here) uv_fibre_harness
//   L43 zone refining c14 -> femto c12 -> electric furnace (here) -> MTJ c22 -> He refrigerator -> cold_qualified_cell (the controller)
//   L46 crystal growth c32 -> cutter (here) -> TFLN c13 -> MTJ c23 -> assembler (here) crossed_aod_pair
//
// The assemblers run at VA[MAX] in gtceu:assembly_hall on two OpV 4 A hatches (decision 68, as A2 and A3). Published for the tests:
// global.grindless.maxRydberg.recipes, .skipped, .pendingRoutes, .controllerRecipe. Rhino: var + function in callbacks.
(function () {
  var LOG = '[grindless/max] '
  var G = global.grindless || (global.grindless = {})
  var MR = G.maxRydberg || (G.maxRydberg = {})
  MR.recipes = []
  MR.skipped = []
  MR.pendingRoutes = []
  MR.controllerRecipe = 'grindless:assembly_line/rydberg_array_works'

  var VA_MAX = Number(GTValues.VA[14])
  var LOW = 7864320
  var HE3 = 'gtceu:superfluid_helium_3'
  var CIRCUIT = '#gtceu:circuits/max'
  var CONTROLLER = 'gtceu:rydberg_array_works'
  var RESEARCH = 'grindless:tweezer_array_die'
  var HULL = 'gtceu:max_machine_hull'

  // the machine's own recipes; items in include the programmed circuit (itemsIn 9 of the recipe type)
  var ROWS = [
    {
      name: 'rydberg_logic_array', circuit: 1, duration: 1200,
      items: ['grindless:tweezer_array_die', 'grindless:atom_cartridge_rb87', 'grindless:rydberg_laser_die', 'grindless:squeezed_light_chip',
        'grindless:quantum_memory_node', 'grindless:clock_locked_microcomb', 'grindless:uv_fibre_harness', 'grindless:crossed_aod_pair'],
      fluid: HE3, amount: 1000,
      outs: ['grindless:rydberg_logic_array', 'grindless:rb_getter_scrap']
    },
    {
      name: 'rydberg_array_refurbish', circuit: 2, duration: 600,
      items: ['grindless:spent_rydberg_array', 'grindless:atom_cartridge_rb87'],
      fluid: null, amount: 0,
      outs: ['grindless:rydberg_logic_array']
    }
  ]

  // GTM rows of the lines: type, name, inputs (with counts), fluids, outputs, EU/t and ticks
  var GTM = [
    { type: 'cutter', name: 'eu_yso_slab', items: ['1x grindless:eu_yso_boule'], fluids: [['gtceu:lubricant', 100]],
      outs: ['2x grindless:eu_yso_slab'], eut: LOW, duration: 600 },
    { type: 'cutter', name: 'teo2_aod_blank', items: ['1x grindless:teo2_boule'], fluids: [['gtceu:lubricant', 100]],
      outs: ['2x grindless:teo2_aod_blank'], eut: LOW, duration: 600 },
    { type: 'chemical_reactor', name: 'synthetic_silica_soot', items: ['4x gtca:silicon_tetrachloride_dust'],
      fluids: [['gtceu:oxygen', 2000], ['minecraft:water', 2000]], outs: ['4x grindless:synthetic_silica_soot'], eut: LOW, duration: 400 },
    { type: 'chemical_reactor', name: 'annealed_glass_cell', items: ['1x grindless:laser_welded_glass_cell'], fluids: [['gtceu:nitrogen', 1000]],
      outs: ['1x grindless:annealed_glass_cell'], eut: 30720, duration: 800 },
    { type: 'assembler', name: 'quantum_memory_node', eut: null, duration: 600,
      items: ['1x grindless:burned_memory_crystal', '2x grindless:memory_fibre_pigtail', '1x ' + CIRCUIT, '2x gtceu:tritanium_plate',
        '4x gtceu:tritanium_foil', '2x gtceu:horizon_strand_single_wire', '2x gtceu:tritanium_round', '1x gtceu:fine_gold_wire'],
      fluids: [['gtceu:soldering_alloy', 288]], outs: ['1x grindless:quantum_memory_node'] },
    { type: 'assembler', name: 'uv_fibre_harness', eut: null, duration: 600,
      items: ['1x grindless:endcapped_hc_fibre', '2x grindless:hollow_core_fibre', '1x ' + CIRCUIT, '2x gtceu:tritanium_plate',
        '4x gtceu:tritanium_foil', '2x gtceu:horizon_strand_single_wire', '2x gtceu:tritanium_round', '1x gtceu:fine_gold_wire'],
      fluids: [['gtceu:soldering_alloy', 288]], outs: ['1x grindless:uv_fibre_harness'] },
    { type: 'assembler', name: 'crossed_aod_pair', eut: null, duration: 600,
      items: ['2x grindless:electroded_aod', '1x grindless:teo2_aod_blank', '1x ' + CIRCUIT, '2x gtceu:tritanium_plate',
        '4x gtceu:tritanium_foil', '2x gtceu:horizon_strand_single_wire', '2x gtceu:tritanium_round', '1x gtceu:fine_gold_wire'],
      fluids: [['gtceu:soldering_alloy', 288]], outs: ['1x grindless:crossed_aod_pair'] }
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
    MR.skipped.push(name)
    console.error(LOG + 'rydberg ' + name + ' skipped, unknown id(s): ' + missing.join(', '))
  }

  ServerEvents.recipes(function (event) {
    ROWS.forEach(function (r) {
      try {
        var missing = missingOf(r.items.concat(r.outs), r.fluid === null ? [] : [r.fluid])
        if (missing.length > 0) {
          skip(r.name, missing)
          return
        }
        var b = event.recipes.gtceu.rydberg_assembly('grindless:' + r.name)
        b.circuit(r.circuit)
        b.itemInputs(r.items.map(function (id) { return '1x ' + id }))
        if (r.fluid !== null) b.inputFluids(Fluid.of(r.fluid, r.amount))
        b.itemOutputs(r.outs.map(function (id) { return '1x ' + id }))
        b.addDataString('grindless_rydberg_assembly', r.name)
        b.EUt(VA_MAX).duration(r.duration)
        MR.recipes.push('grindless:rydberg_assembly/' + r.name)
      } catch (e) {
        console.error(LOG + 'rydberg ' + r.name + ' failed: ' + e)
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
        MR.recipes.push('grindless:' + r.type + '/' + r.name)
      } catch (e) {
        console.error(LOG + 'rydberg ' + r.name + ' failed: ' + e)
      }
    })

    try {
      var ids = [HULL, CONTROLLER, RESEARCH, 'grindless:max_robot_arm', 'grindless:max_sensor', 'grindless:max_field_generator',
        'grindless:quantum_memory_node', 'grindless:cryo_photonic_interposer', 'grindless:tetron_array', 'grindless:cold_qualified_cell']
      var mc = missingOf(ids, [HE3])
      if (mc.length > 0) {
        skip('rydberg_array_works', mc)
      } else {
        var a = event.recipes.gtceu.assembly_line('grindless:rydberg_array_works')
        a.itemInputs(HULL, '4x ' + CIRCUIT, '4x grindless:max_robot_arm', '4x grindless:max_sensor', '2x grindless:max_field_generator',
          'grindless:quantum_memory_node', 'grindless:cryo_photonic_interposer', 'grindless:tetron_array', 'grindless:cold_qualified_cell')
        a.inputFluids(Fluid.of(HE3, 1000))
        a.itemOutputs(CONTROLLER)
        a.stationResearch(function (r) { return r.researchStack(Item.of(RESEARCH)).CWUt(64).EUt(VA_MAX) })
        a.EUt(VA_MAX).duration(2400)
      }
    } catch (e) {
      console.error(LOG + 'rydberg controller failed: ' + e)
    }
    console.info(LOG + 'rydberg: ' + MR.recipes.length + ' recipes; skipped ' + MR.skipped.length)
  })
})()
