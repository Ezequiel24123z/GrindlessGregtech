// priority: -19944
// -----------------------------------------------------------------------------------------------
// MAX-A2 "First six components" (docs/eras/max.md, A2; lines L9, L10, L41 and the Components table): the GTM steps of the lines that
// feed the six components, and the six components themselves. Every other step is one row in an older machine's table.
//
//   L9   rebco_tape_max (coated conductor c5) -> chemical bath stabilised_rebco_tape -> HTS c11 max_coil_winding -> assembler max_field_coil
//   L10  sic_tow, sic_sic_preform (SiC fibre, CVI) -> reactor exotic_infiltrated_preform -> SPS c21 -> SHeQUID c5 balanced billet
//        -> lathe exotic_composite_rod / forming press exotic_composite_rotor
//   L41  silica alcogel -> bath silylated_alcogel -> aerogel works -> potted_superleak -> assembler superfluid_valve
//   L31  isolator_waveguide_die, bearing_rotor_ring -> assemblers max_optical_isolator, sc_magnetic_bearing
//   L35  oriented_terfenol_rod -> cutter laminated_terfenol_stack
//
// The components are assembler rows at VA[MAX] (the large assembler with two OpV 4 A hatches). The conveyor module, the sensor and the
// field generator are A3's: nothing here consumes them, and they are listed in pendingRoutes.
// Published: global.grindless.maxComponents.rows, .skipped, .pendingRoutes. Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/max_components] '
  var MAXT = 14
  var G = global.grindless || (global.grindless = {})
  var MC = G.maxComponents || (G.maxComponents = {})
  MC.rows = []
  MC.recipes = []
  MC.skipped = []
  MC.pendingRoutes = []
  MC.pendingBy = 'A3'

  var LOW = 7864320
  var CIRCUIT = '#gtceu:circuits/max'

  // type: GTM recipe type; eut null means VA[MAX]
  var ROWS = [
    { name: 'stabilised_rebco_tape', type: 'chemical_bath', eut: LOW, duration: 300,
      items: ['4x grindless:rebco_tape_max'], fluids: [['gtceu:copper', 288]], out: ['4x grindless:stabilised_rebco_tape'] },
    { name: 'silica_alcogel', type: 'chemical_reactor', eut: LOW, duration: 400,
      items: ['4x gtceu:silicon_dioxide_dust'], fluids: [['gtceu:ethanol', 1000], ['gtceu:ammonia', 500]], out: ['4x grindless:silica_alcogel'] },
    { name: 'silylated_alcogel', type: 'chemical_bath', eut: LOW, duration: 300,
      items: ['4x grindless:silica_alcogel'], fluids: [['gtceu:ethanol', 500]], out: ['4x grindless:silylated_alcogel'] },
    { name: 'exotic_infiltrated_preform', type: 'chemical_reactor', eut: LOW, duration: 600,
      items: ['1x grindless:sic_sic_preform', '1x grindless:stable_exotic_matter'], fluids: [['gtceu:argon', 1000]], out: ['1x grindless:exotic_infiltrated_preform'] },
    { name: 'potted_superleak', type: 'chemical_reactor', eut: LOW, duration: 300,
      items: ['1x grindless:aerogel_superleak_plug'], fluids: [['gtceu:epoxy', 144]], out: ['1x grindless:potted_superleak'] },
    { name: 'exotic_composite_rod', type: 'lathe', eut: LOW, duration: 400,
      items: ['1x grindless:balanced_composite_billet'], fluids: [], out: ['2x grindless:exotic_composite_rod'] },
    { name: 'exotic_composite_rotor', type: 'forming_press', eut: LOW, duration: 400,
      items: ['2x grindless:balanced_composite_billet', '2x gtceu:tritanium_plate'], fluids: [], out: ['1x grindless:exotic_composite_rotor'] },
    { name: 'laminated_terfenol_stack', type: 'cutter', eut: LOW, duration: 300,
      items: ['1x grindless:oriented_terfenol_rod'], fluids: [['gtceu:lubricant', 100]], out: ['4x grindless:laminated_terfenol_stack'] },

    { name: 'max_field_coil', type: 'assembler', eut: LOW, duration: 600,
      items: ['1x grindless:max_coil_winding', '2x gtceu:horizon_strand_single_wire', '2x gtceu:tritanium_plate', '4x gtceu:tritanium_foil',
        '1x grindless:chain_lamina_stack', '2x gtceu:tritanium_round', '1x gtceu:horizon_strand_single_cable'],
      fluids: [['gtceu:epoxy', 144]], out: ['1x grindless:max_field_coil'] },
    { name: 'max_optical_isolator', type: 'assembler', eut: LOW, duration: 600,
      items: ['1x grindless:isolator_waveguide_die', '2x gtceu:tritanium_plate', '4x gtceu:tritanium_foil', '2x gtceu:horizon_strand_single_wire',
        '1x grindless:yig_on_ln_wafer', '2x gtceu:tritanium_round', '1x grindless:cryo_optical_link'],
      fluids: [['gtceu:soldering_alloy', 144]], out: ['1x grindless:max_optical_isolator'] },
    { name: 'sc_magnetic_bearing', type: 'assembler', eut: LOW, duration: 600,
      items: ['1x grindless:bearing_rotor_ring', '1x grindless:fe16n2_ring_magnet', '2x gtceu:tritanium_plate', '4x gtceu:tritanium_round',
        '2x gtceu:horizon_strand_single_wire', '1x gtceu:tritanium_ring', '4x gtceu:tritanium_foil'],
      fluids: [['gtceu:lubricant', 200]], out: ['1x grindless:sc_magnetic_bearing'] },
    { name: 'superfluid_valve', type: 'assembler', eut: LOW, duration: 600,
      items: ['1x grindless:potted_superleak', '1x grindless:superfluid_he3_seal', '2x gtceu:tritanium_plate', '4x gtceu:tritanium_round',
        '2x gtceu:horizon_strand_single_wire', '1x gtceu:tritanium_gear', '4x gtceu:tritanium_foil'],
      fluids: [['gtceu:superfluid_helium_3', 100]], out: ['1x grindless:superfluid_valve'] },

    { name: 'max_electric_motor', type: 'assembler', eut: null, duration: 400,
      items: ['1x grindless:max_field_coil', '1x grindless:exotic_composite_rod', '1x grindless:sc_magnetic_bearing', '4x gtceu:horizon_strand_single_wire',
        '2x gtceu:horizon_strand_single_cable', '2x gtceu:tritanium_gear', '4x gtceu:tritanium_foil'],
      fluids: [['gtceu:lubricant', 250]], out: ['1x grindless:max_electric_motor'] },
    { name: 'max_electric_pump', type: 'assembler', eut: null, duration: 400,
      items: ['1x grindless:max_electric_motor', '1x grindless:exotic_composite_rotor', '1x grindless:superfluid_he3_seal', '2x gtceu:tritanium_plate',
        '4x gtceu:tritanium_round', '2x gtceu:horizon_strand_single_wire', '1x gtceu:tritanium_gear'],
      fluids: [['gtceu:lubricant', 250]], out: ['1x grindless:max_electric_pump'] },
    { name: 'max_electric_piston', type: 'assembler', eut: null, duration: 400,
      items: ['1x grindless:max_electric_motor', '1x grindless:opv_harmonic_drive', '1x grindless:laminated_terfenol_stack', '1x grindless:exotic_composite_rod',
        '2x gtceu:tritanium_plate', '4x gtceu:tritanium_round', '2x gtceu:horizon_strand_single_wire'],
      fluids: [['gtceu:lubricant', 250]], out: ['1x grindless:max_electric_piston'] },
    { name: 'max_robot_arm', type: 'assembler', eut: null, duration: 600,
      items: ['2x grindless:max_electric_motor', '1x grindless:max_electric_piston', CIRCUIT, '4x gtceu:tritanium_round',
        '2x gtceu:horizon_strand_single_cable', '1x gtceu:tritanium_gear', '2x gtceu:tritanium_plate'],
      fluids: [['gtceu:lubricant', 250]], out: ['1x grindless:max_robot_arm'] },
    { name: 'max_emitter', type: 'assembler', eut: null, duration: 600,
      items: ['1x grindless:squeezed_light_chip', '1x grindless:cryo_optical_link', '1x grindless:max_optical_isolator', '2x ' + CIRCUIT,
        '4x gtceu:tritanium_foil', '2x gtceu:horizon_strand_single_wire', '1x gtceu:tritanium_plate'],
      fluids: [['gtceu:soldering_alloy', 288]], out: ['1x grindless:max_emitter'] },
    { name: 'max_fluid_regulator', type: 'assembler', eut: null, duration: 600,
      items: ['1x grindless:max_electric_pump', '1x grindless:superfluid_valve', '2x ' + CIRCUIT, '1x grindless:tetron_array',
        '1x gtceu:tritanium_plate', '2x gtceu:tritanium_round', '1x gtceu:horizon_strand_single_cable'],
      fluids: [['gtceu:soldering_alloy', 288]], out: ['1x grindless:max_fluid_regulator'] }
  ]
  MC.rows = ROWS
  MC.pendingRoutes = ['grindless:max_conveyor_module', 'grindless:max_sensor', 'grindless:max_field_generator']

  ServerEvents.recipes(function (event) {
    var vaMax = Number(GTValues.VA[MAXT])
    ROWS.forEach(function (r) {
      var strip = function (s) { return s.replace(/^\d+x /, '') }
      var ids = r.items.map(strip).concat(r.out.map(strip)).filter(function (id) { return id.charAt(0) !== '#' })
      var missing = ids.filter(function (id) { return !Item.exists(id) }).concat(r.fluids.map(function (f) { return f[0] }).filter(function (id) { return !Fluid.exists(id) }))
      if (missing.length > 0) {
        MC.skipped.push(r.name)
        console.error(LOG + r.name + ' skipped, unknown id(s): ' + missing.join(', '))
        return
      }
      try {
        var b = event.recipes.gtceu[r.type]('grindless:' + r.name)
        r.items.forEach(function (s) { b.itemInputs(s) })
        r.fluids.forEach(function (f) { b.inputFluids(Fluid.of(f[0], f[1])) })
        r.out.forEach(function (s) { b.itemOutputs(s) })
        b.EUt(r.eut === null ? vaMax : r.eut).duration(r.duration)
        MC.recipes.push('grindless:' + r.type + '/' + r.name)
      } catch (e) {
        MC.skipped.push(r.name)
        console.error(LOG + r.name + ' failed: ' + e)
      }
    })
    console.info(LOG + MC.recipes.length + ' recipes; skipped ' + MC.skipped.length)
  })
})()
