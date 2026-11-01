// priority: -20114
// MAX+ components (docs/eras/maxplus.md, components, lines C1 to C7; package XP-A2). The older steps of the lines are rows marked XP-A2 in
// their own tables and scripts; this file holds the GTM-machine steps, the condensate step at Sgr A*, the nine components and the casing:
//
//   C1 Kerr field coil: chemical_bath (stabilise the wire), chemical_reactor (impregnate the wound coil)
//   C2 bound-matter rotor: lathe (rotor blank), forming_press (the coated rotor)
//   C4 readout die: cutter
//   C5 field cell: condensate_refinery c7 at Sgr A* (load the cavity), canner (seal it)
//   C6 horizon belt: chemical_bath (prime the braided web)
//   C7 actuator stack: cutter (the PMN-PT plate), assembler (the electroded stack)
//
// The nine components are assembly lines at VA[MAX]. The casing is made at home. The casing design names gtceu:kerr_strand_single_cable,
// which was not built; the insulated Kerr wire stands in for it. The valve parts (grindless:horizon_valve) belong to XP-H1.
// Published for the tests: global.grindless.maxPlusComponents.recipes, .skipped, .componentRecipes.
// Rhino: var + function in callbacks.
(function () {
  var LOG = '[grindless/maxplus] '
  var G = global.grindless || (global.grindless = {})
  var MP = G.maxPlusComponents || (G.maxPlusComponents = {})
  MP.recipes = []
  MP.skipped = []
  MP.componentRecipes = []

  var VA_MAX = Number(GTValues.VA[14])
  var LOW = 7864320
  var SITE = (G.maxTravel && G.maxTravel.places && G.maxTravel.places.sgra ? G.maxTravel.places.sgra.dimension : 'gcyr:black_hole_orbit')
  var SETTLED = 'gtceu:settled_condensate'
  var CIRCUIT = '#gtceu:circuits/max'

  // type, name, circuit, inputs, fluids in, outputs, EU/t, ticks, optional dimension
  var ROWS = [
    { type: 'chemical_bath', name: 'stabilised_kerr_wire', circuit: 1,
      items: ['grindless:insulated_kerr_wire'], fluids: [['gtceu:copper', 144]], outs: ['grindless:stabilised_kerr_wire'], eut: LOW, duration: 200 },
    { type: 'chemical_reactor', name: 'impregnated_kerr_coil', circuit: 1,
      items: ['grindless:kerr_coil_winding'], fluids: [['gtceu:epoxy', 288]], outs: ['grindless:impregnated_kerr_coil'], eut: LOW, duration: 300 },
    { type: 'lathe', name: 'bound_rotor_blank', circuit: 0,
      items: ['grindless:balanced_bound_billet'], fluids: [], outs: ['grindless:bound_rotor_blank'], eut: LOW, duration: 400 },
    { type: 'forming_press', name: 'bound_matter_rotor', circuit: 0,
      items: ['grindless:wear_coated_rotor'], fluids: [], outs: ['grindless:bound_matter_rotor'], eut: LOW, duration: 300 },
    { type: 'cutter', name: 'readout_die', circuit: 0,
      items: ['grindless:readout_wafer'], fluids: [], outs: ['4x grindless:readout_die'], eut: LOW, duration: 300 },
    { type: 'condensate_refinery', name: 'condensate_loaded_cavity', circuit: 7, dimension: SITE,
      items: ['grindless:nb_coated_cavity'], fluids: [[SETTLED, 8000]], outs: ['grindless:condensate_loaded_cavity'], eut: VA_MAX, duration: 900 },
    { type: 'canner', name: 'sealed_field_cavity', circuit: 0,
      items: ['grindless:condensate_loaded_cavity'], fluids: [['gtceu:epoxy', 144]], outs: ['grindless:sealed_field_cavity'], eut: LOW, duration: 300 },
    { type: 'chemical_bath', name: 'primed_kerr_web', circuit: 2,
      items: ['grindless:kerr_braided_web'], fluids: [['gtceu:epoxy', 144]], outs: ['grindless:primed_kerr_web'], eut: LOW, duration: 300 },
    { type: 'cutter', name: 'pmn_pt_plate', circuit: 0,
      items: ['grindless:pmn_pt_boule'], fluids: [], outs: ['4x grindless:pmn_pt_plate'], eut: LOW, duration: 400 },
    { type: 'assembler', name: 'horizon_actuator_stack', circuit: 25,
      items: ['grindless:electroded_pmn_stack'], fluids: [['gtceu:epoxy', 144]], outs: ['grindless:horizon_actuator_stack'], eut: LOW, duration: 300 },
    { type: 'assembler', name: 'horizon_machine_casing', circuit: 26,
      items: ['gtceu:max_machine_casing', '4x grindless:horizon_compressed_plate', 'grindless:insulated_kerr_wire'],
      fluids: [['gtceu:epoxy', 144]], outs: ['grindless:horizon_machine_casing'], eut: VA_MAX, duration: 200 }
  ]

  var MOTOR = 'grindless:maxplus_electric_motor'
  var PUMP = 'grindless:maxplus_electric_pump'
  var PISTON = 'grindless:maxplus_electric_piston'
  var EMITTER = 'grindless:maxplus_emitter'
  var CPU = '2x grindless:horizon_processor'
  var COIL = 'grindless:kerr_field_coil'

  // name, research stack, inputs, fluids in
  var COMPONENTS = [
    { name: 'maxplus_electric_motor', research: 'grindless:max_electric_motor',
      items: ['2x ' + COIL, 'grindless:bound_matter_rotor', 'grindless:max_electric_motor'] },
    { name: 'maxplus_electric_pump', research: 'grindless:max_electric_pump',
      items: [MOTOR, 'grindless:bound_matter_rotor', 'grindless:horizon_valve', 'grindless:max_electric_pump'] },
    { name: 'maxplus_electric_piston', research: 'grindless:max_electric_piston',
      items: [MOTOR, 'grindless:horizon_actuator_stack', 'grindless:max_electric_piston'] },
    { name: 'maxplus_robot_arm', research: 'grindless:max_robot_arm',
      items: ['2x ' + MOTOR, PISTON, CPU, 'grindless:max_robot_arm'] },
    { name: 'maxplus_emitter', research: 'grindless:max_emitter',
      items: ['grindless:horizon_photonic_engine', 'grindless:max_emitter', CPU] },
    { name: 'maxplus_sensor', research: 'grindless:max_sensor',
      items: ['grindless:horizon_phase_sensor_core', 'grindless:max_sensor', CPU] },
    { name: 'maxplus_field_generator', research: 'grindless:max_field_generator',
      items: ['grindless:condensate_field_cell', EMITTER, '2x ' + COIL, 'grindless:max_field_generator'] },
    { name: 'maxplus_conveyor_module', research: 'grindless:max_conveyor_module',
      items: ['2x ' + MOTOR, 'grindless:horizon_belt', 'grindless:max_conveyor_module'] },
    { name: 'maxplus_fluid_regulator', research: 'grindless:max_fluid_regulator',
      items: [PUMP, 'grindless:horizon_valve', CPU, 'grindless:max_fluid_regulator'] }
  ]

  function idOf(s) { return String(s).replace(/^\d+x /, '') }

  function missingOf(items, fluids) {
    var m = []
    items.forEach(function (s) {
      if (String(s).indexOf('#') >= 0) return
      if (!Item.exists(idOf(s))) m.push(idOf(s))
    })
    fluids.forEach(function (f) { if (!Fluid.exists(f)) m.push(f) })
    return m
  }

  function skip(name, missing) {
    MP.skipped.push(name)
    console.error(LOG + 'components ' + name + ' skipped, unknown id(s): ' + missing.join(', '))
  }

  ServerEvents.recipes(function (event) {
    ROWS.forEach(function (r) {
      try {
        var out = r.outs.map(idOf)
        var missing = missingOf(r.items.concat(r.outs), r.fluids.map(function (f) { return f[0] }))
        if (missing.length > 0) {
          skip(r.type + '/' + r.name, missing)
          return
        }
        var b = event.recipes.gtceu[r.type]('grindless:' + r.name)
        if (r.circuit) b.circuit(r.circuit)
        r.items.forEach(function (s) { b.itemInputs(s) })
        r.fluids.forEach(function (f) { b.inputFluids(Fluid.of(f[0], f[1])) })
        r.outs.forEach(function (s) { b.itemOutputs(s) })
        if (r.dimension) {
          b.dimension(r.dimension)
          b.addDataString('grindless_condensate_refinery', r.name)
        }
        b.EUt(r.eut).duration(r.duration)
        MP.recipes.push('grindless:' + r.type + '/' + r.name + ' -> ' + out.join(','))
      } catch (e) {
        console.error(LOG + 'components ' + r.name + ' failed: ' + e)
      }
    })

    COMPONENTS.forEach(function (c) {
      try {
        var outId = 'grindless:' + c.name
        var missing = missingOf(c.items.concat([outId]), ['gtceu:superfluid_helium_3'])
        if (missing.length > 0) {
          skip(c.name, missing)
          return
        }
        var a = event.recipes.gtceu.assembly_line('grindless:' + c.name)
        c.items.forEach(function (s) { a.itemInputs(s) })
        a.itemInputs('2x ' + CIRCUIT)
        a.inputFluids(Fluid.of('gtceu:superfluid_helium_3', 500))
        a.itemOutputs(outId)
        if (Item.exists(c.research)) {
          a.stationResearch(function (r) { return r.researchStack(Item.of(c.research)).CWUt(64).EUt(VA_MAX) })
        }
        a.EUt(VA_MAX).duration(1200)
        MP.componentRecipes.push('grindless:assembly_line/' + c.name)
      } catch (e) {
        console.error(LOG + 'components ' + c.name + ' failed: ' + e)
      }
    })
    console.info(LOG + 'components: ' + MP.recipes.length + ' rows, ' + MP.componentRecipes.length + ' components; skipped ' + MP.skipped.length)
  })
})()
