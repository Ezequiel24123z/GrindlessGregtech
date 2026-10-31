// priority: -19903
// -----------------------------------------------------------------------------------------------
// MAX-A3 "Last components and the power die" (docs/eras/max.md, A3; line L8 and the Components table): the GTM cutter step of L8
// (the other four steps are rows in older machines: diamond_cvd c9, ion_implantation c11, mtj_sputtering c16, silicon_carbide c9) and
// the three last components, assembler rows at VA[MAX] that run in gtceu:assembly_hall on two OpV 4 A hatches (as A2's six).
//
//   L8   power_diamond_plate -> boron_delta_diamond -> metallised_diamond -> diamond_power_wafer -> cutter diamond_power_die
//   max_conveyor_module  = 2 motor + membrane_belt;  max_sensor = gradiometer + 2 circuits;
//   max_field_generator  = emitter + 2 field coil + superconducting membrane + stable exotic matter
//
// Published: global.grindless.maxComponentsLate.rows, .recipes, .skipped. Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/max_components_late] '
  var MAXT = 14
  var G = global.grindless || (global.grindless = {})
  var ML = G.maxComponentsLate || (G.maxComponentsLate = {})
  ML.rows = []
  ML.recipes = []
  ML.skipped = []

  var LOW = 7864320
  var CIRCUIT = '#gtceu:circuits/max'

  // type: GTM recipe type; eut null means VA[MAX]
  var ROWS = [
    { name: 'diamond_power_die', type: 'cutter', eut: LOW, duration: 400,
      items: ['1x grindless:diamond_power_wafer'], fluids: [['gtceu:lubricant', 100]], out: ['4x grindless:diamond_power_die'] },

    { name: 'max_conveyor_module', type: 'assembler', eut: null, duration: 400,
      items: ['2x grindless:max_electric_motor', '1x grindless:membrane_belt', CIRCUIT, '1x grindless:max_fluid_regulator', '2x gtceu:tritanium_plate',
              '4x gtceu:tritanium_round', '2x gtceu:horizon_strand_single_cable'],
      fluids: [['gtceu:lubricant', 250]], out: ['1x grindless:max_conveyor_module'] },
    { name: 'max_sensor', type: 'assembler', eut: null, duration: 600,
      items: ['1x grindless:matter_wave_gradiometer', '2x ' + CIRCUIT, '1x grindless:cryo_optical_link', '2x gtceu:tritanium_plate',
        '4x gtceu:tritanium_foil', '2x gtceu:horizon_strand_single_wire', '2x gtceu:tritanium_round'],
      fluids: [['gtceu:soldering_alloy', 288]], out: ['1x grindless:max_sensor'] },
    { name: 'max_field_generator', type: 'assembler', eut: null, duration: 800,
      items: ['1x grindless:max_emitter', '2x grindless:max_field_coil', '1x grindless:superconducting_membrane', '1x grindless:stable_exotic_matter',
        CIRCUIT, '1x grindless:max_fluid_regulator', '2x gtceu:tritanium_plate', '4x gtceu:horizon_strand_single_wire'],
      fluids: [['gtceu:soldering_alloy', 288]], out: ['1x grindless:max_field_generator'] }
  ]
  ML.rows = ROWS

  ServerEvents.recipes(function (event) {
    var vaMax = Number(GTValues.VA[MAXT])
    ROWS.forEach(function (r) {
      var strip = function (s) { return s.replace(/^\d+x /, '') }
      var ids = r.items.map(strip).concat(r.out.map(strip)).filter(function (id) { return id.charAt(0) !== '#' })
      var missing = ids.filter(function (id) { return !Item.exists(id) }).concat(r.fluids.map(function (f) { return f[0] }).filter(function (id) { return !Fluid.exists(id) }))
      if (missing.length > 0) {
        ML.skipped.push(r.name)
        console.error(LOG + r.name + ' skipped, unknown id(s): ' + missing.join(', '))
        return
      }
      try {
        var b = event.recipes.gtceu[r.type]('grindless:' + r.name)
        r.items.forEach(function (s) { b.itemInputs(s) })
        r.fluids.forEach(function (f) { b.inputFluids(Fluid.of(f[0], f[1])) })
        r.out.forEach(function (s) { b.itemOutputs(s) })
        b.EUt(r.eut === null ? vaMax : r.eut).duration(r.duration)
        ML.recipes.push('grindless:' + r.type + '/' + r.name)
      } catch (e) {
        ML.skipped.push(r.name)
        console.error(LOG + r.name + ' failed: ' + e)
      }
    })
    console.info(LOG + ML.recipes.length + ' recipes; skipped ' + ML.skipped.length)
  })
})()
