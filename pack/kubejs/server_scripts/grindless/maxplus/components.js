// priority: -20164
// MAX+ components (docs/eras/maxplus.md, components, lines C1 to C7; package XP-A2). The older steps of the lines are rows of this file on
// the older recipe types (OLD below, ids grindless:<type>/<name>, the precedent of maxplus/power.js); the circuits count every MAX+ row the
// design puts on that machine (maxplus.md, older machines in MAX+) from the table's highest + 1, capped at 32. This file also holds the
// GTM-machine steps, the condensate step at Sgr A*, the nine components and the casing:
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
      items: ['grindless:balanced_bound_billet'], fluids: [], outs: ['grindless:bound_rotor_blank', 'gtceu:tungsten_steel_dust'], eut: LOW, duration: 400 },
    { type: 'forming_press', name: 'bound_matter_rotor', circuit: 0,
      items: ['grindless:wear_coated_rotor', '2x gtceu:tungsten_steel_plate'], fluids: [], outs: ['grindless:bound_matter_rotor'], eut: LOW, duration: 300 },
    { type: 'cutter', name: 'readout_die', circuit: 0,
      items: ['grindless:readout_wafer'], fluids: [], outs: ['4x grindless:readout_die'], eut: LOW, duration: 300 },
    { type: 'condensate_refinery', name: 'condensate_loaded_cavity', circuit: 7, dimension: SITE,
      items: ['grindless:nb_coated_cavity'], fluids: [[SETTLED, 8000]], outs: ['grindless:condensate_loaded_cavity'], eut: VA_MAX, duration: 900,
      dataKey: 'grindless_condensate_refinery' },
    { type: 'canner', name: 'sealed_field_cavity', circuit: 0,
      items: ['grindless:condensate_loaded_cavity'], fluids: [['gtceu:epoxy', 144]], outs: ['grindless:sealed_field_cavity'], eut: LOW, duration: 300 },
    { type: 'chemical_bath', name: 'primed_kerr_web', circuit: 2,
      items: ['grindless:kerr_braided_web'], fluids: [['gtceu:epoxy', 144]], outs: ['grindless:primed_kerr_web'], eut: LOW, duration: 300 },
    { type: 'cutter', name: 'pmn_pt_plate', circuit: 0,
      items: ['grindless:pmn_pt_boule'], fluids: [], outs: ['4x grindless:pmn_pt_plate'], eut: LOW, duration: 400 },
    { type: 'assembler', name: 'horizon_actuator_stack', circuit: 25,
      items: ['grindless:electroded_pmn_stack'], fluids: [['gtceu:epoxy', 144]], outs: ['grindless:horizon_actuator_stack'], eut: LOW, duration: 300 },
    { type: 'assembler', name: 'horizon_machine_casing', circuit: 0,
      items: ['gtceu:max_machine_casing', '4x grindless:horizon_compressed_plate', 'grindless:insulated_kerr_wire', '2x gtceu:horizon_strand_single_wire', 'grindless:chain_lamina_stack', 'grindless:max_sensor'],
      fluids: [['gtceu:epoxy', 144]], outs: ['grindless:horizon_machine_casing'], eut: VA_MAX, duration: 200 }
  ]

  // Rows on the older machines. items/outs: 'Nx id', or [stack, chance in 1/10000]; kept: not consumed; charge: not-consumed fluid;
  // dataKey: the custom type's data string (the EMI line), '' for a type GTM shows itself.
  var OLD = [
    { type: 'magnet_winding', name: 'kerr_coil_winding', circuit: 22, dataKey: 'grindless_magnet_winding',
      items: ['grindless:cmc_coil_former', '4x grindless:stabilised_kerr_wire'], fluids: [['gtceu:epoxy', 144]], charge: [['gtceu:liquid_helium', 1000]],
      outs: ['grindless:kerr_coil_winding'], eut: 536870912, duration: 1200 },
    { type: 'shequid_assembly', name: 'balanced_bound_billet', circuit: 10, dataKey: 'grindless_shequid_assembly',
      items: ['grindless:bound_degenerate_billet'], kept: ['grindless:weak_link_cell'], fluids: [['gtceu:superfluid_helium', 500]],
      outs: ['grindless:balanced_bound_billet'], eut: 536870912, duration: 1600 },
    { type: 'mtj_sputtering', name: 'wear_coated_rotor', circuit: 32, dataKey: 'grindless_mtj_sputtering',
      items: ['grindless:bound_rotor_blank', '2x grindless:rrr_nb_target'], fluids: [['gtceu:argon', 1000]],
      outs: ['grindless:wear_coated_rotor', 'grindless:niobium_scrap'], fluidOuts: [['gtceu:argon', 800]], eut: 536870912, duration: 1600 },
    { type: 'mtj_sputtering', name: 'nb_coated_cavity', circuit: 32, dataKey: 'grindless_mtj_sputtering',
      items: ['grindless:confinement_cavity', '2x grindless:rrr_nb_target'], fluids: [['gtceu:argon', 1000]],
      outs: ['grindless:nb_coated_cavity', 'grindless:niobium_scrap'], fluidOuts: [['gtceu:argon', 800]], eut: 536870912, duration: 1600 },
    { type: 'mtj_sputtering', name: 'electroded_pmn_stack', circuit: 32, dataKey: 'grindless_mtj_sputtering',
      items: ['2x grindless:pmn_pt_plate', '2x gtceu:gold_dust'], fluids: [['gtceu:argon', 1000]],
      outs: ['grindless:electroded_pmn_stack'], fluidOuts: [['gtceu:argon', 800]], eut: 536870912, duration: 1600 },
    { type: 'ion_slicing', name: 'ln_on_diamond', circuit: 15, dataKey: 'grindless_ion_slicing',
      items: ['grindless:c12_photonic_plate', 'grindless:lithium_niobate_wafer'], fluids: [],
      outs: ['grindless:ln_on_diamond'], fluidOuts: [['gtceu:hydrogen', 1000]], eut: 536870912, duration: 2000 },
    { type: 'beuv_lithography', name: 'patterned_engine_wafer', circuit: 19, dataKey: 'grindless_beuv_lithography',
      items: ['2x grindless:tb_droplet_target', 'grindless:gan_laser_array', 'grindless:ln_on_diamond', 'grindless:beuv_mirror'], fluids: [],
      outs: ['grindless:patterned_engine_wafer', 'grindless:fouled_beuv_mirror'], eut: 536870912, duration: 2400 },
    { type: 'beuv_lithography', name: 'readout_wafer', circuit: 20, dataKey: 'grindless_beuv_lithography',
      items: ['grindless:tb_droplet_target', 'grindless:snspd_array_die', 'grindless:beuv_mirror'], fluids: [],
      outs: ['grindless:readout_wafer', 'grindless:fouled_beuv_mirror'], eut: 536870912, duration: 2000 },
    { type: 'photonic_foundry', name: 'horizon_photonic_engine', circuit: 31, dataKey: 'grindless_photonic_foundry',
      items: ['grindless:patterned_engine_wafer', 'grindless:glass_interposer'], fluids: [['gtceu:ultrapure_water', 1000], ['gtceu:soldering_alloy', 144]],
      outs: ['grindless:horizon_photonic_engine'], fluidOuts: [['minecraft:water', 1000]], eut: 536870912, duration: 1800 },
    { type: 'photonic_foundry', name: 'horizon_phase_sensor_core', circuit: 32, dataKey: 'grindless_photonic_foundry',
      items: ['grindless:cold_snspd_module', 'grindless:readout_die'], fluids: [['gtceu:ultrapure_water', 1000], ['gtceu:soldering_alloy', 144]],
      outs: ['grindless:horizon_phase_sensor_core'], fluidOuts: [['minecraft:water', 1000]], eut: 536870912, duration: 1800 },
    { type: 'snspd_fabrication', name: 'snspd_array_die', circuit: 8, dataKey: 'grindless_snspd_fabrication',
      items: ['4x grindless:snspd', '2x gtceu:gold_dust'], fluids: [['gtceu:superfluid_helium', 200]],
      outs: ['grindless:snspd_array_die'], eut: 536870912, duration: 1200 },
    { type: 'nuclear_demagnetisation', name: 'cold_snspd_module', circuit: 16, dataKey: 'grindless_nuclear_demagnetisation',
      items: ['grindless:readout_die', 'grindless:snspd_array_die'], kept: ['grindless:mk_cryostat_module'], fluids: [['gtceu:he3_he4_mixture', 200]],
      outs: ['grindless:cold_snspd_module'], fluidOuts: [['gtceu:he3_he4_mixture', 200]], eut: 536870912, duration: 2400 },
    { type: 'nuclear_demagnetisation', name: 'condensate_field_cell', circuit: 17, dataKey: 'grindless_nuclear_demagnetisation',
      items: ['grindless:sealed_field_cavity'], kept: ['grindless:mk_cryostat_module'], fluids: [['gtceu:he3_he4_mixture', 200]],
      outs: ['grindless:condensate_field_cell'], fluidOuts: [['gtceu:he3_he4_mixture', 200]], eut: 536870912, duration: 2400 },
    { type: 'crystal_growth', name: 'pmn_pt_boule', circuit: 32, dataKey: 'grindless_crystal_growth',
      items: ['4x grindless:pmn_precursor_oxides', ['grindless:iridium_crucible', 313]], fluids: [['gtceu:oxygen', 2000]], charge: [['gtceu:argon', 1000]],
      outs: ['grindless:pmn_pt_boule', ['grindless:worn_iridium_crucible', 313]], eut: 536870912, duration: 2400 },
    { type: 'electron_beam_refining', name: 'refractory_coated_web', circuit: 32, dataKey: 'grindless_electron_beam',
      items: ['grindless:primed_kerr_web', '2x gtceu:tungsten_dust'], fluids: [['gtceu:argon', 100]],
      outs: ['grindless:refractory_coated_web'], fluidOuts: [['gtceu:argon', 90]], eut: 536870912, duration: 1200 },
    { type: 'srf_cavity', name: 'confinement_cavity', circuit: 8, dataKey: '',
      items: ['grindless:srf_cavity', '4x grindless:rrr_niobium_sheet'], fluids: [], charge: [['gtceu:argon', 1000]],
      outs: ['grindless:confinement_cavity', '2x grindless:niobium_scrap'], eut: 536870912, duration: 1200 },
    { type: 'membrane_rolling', name: 'horizon_belt', circuit: 4, dataKey: 'grindless_membrane_rolling',
      items: ['grindless:refractory_coated_web', '2x gtceu:horizon_strand_single_wire'], fluids: [['gtceu:epoxy', 144]],
      outs: ['grindless:horizon_belt', ['grindless:membrane_scrap', 2500]], eut: 2013265920, duration: 1200 },
    { type: 'pbo_synthesis', name: 'kerr_braided_web', circuit: 17, dataKey: '',
      items: ['2x grindless:insulated_kerr_wire', '4x grindless:pbo_fibre'], fluids: [],
      outs: ['grindless:kerr_braided_web'], eut: 1966080, duration: 400 },
    { type: 'diamond_cvd', name: 'c12_photonic_plate', circuit: 12, dataKey: '',
      items: ['grindless:c12_cvd_plate'], kept: ['grindless:ice_giant_diamond_seed'],
      fluids: [['gtceu:carbon_12_methane', 2000], ['gtceu:hydrogen', 10000]],
      outs: ['grindless:c12_photonic_plate'], fluidOuts: [['gtceu:hydrogen', 9500]], eut: 491520, duration: 1600 },
    { type: 'mocvd', name: 'gan_laser_array', circuit: 32, dataKey: '',
      items: ['grindless:hpsi_sic_wafer', '2x gtceu:gallium_dust', 'gtceu:indium_dust'], fluids: [['gtceu:trimethylgallium', 500], ['gtceu:ammonia', 2000]],
      outs: ['grindless:gan_laser_array'], fluidOuts: [['gtceu:methane', 1500], ['gtceu:hydrogen', 2000]], eut: 1966080, duration: 1600 },
    // the type holds two item inputs and a circuit takes one: a row with two solids is told apart by its item pair alone
    { type: 'solvent_extraction', name: 'pmn_precursor_oxides', circuit: 0, dataKey: '',
      items: ['3x gtceu:lead_dust', '2x gtceu:niobium_dust'],
      fluids: [['gtceu:nitric_acid', 4000], ['gtceu:magnesium', 144], ['gtceu:titanium_tetrachloride', 1000]],
      outs: ['4x grindless:pmn_precursor_oxides'], fluidOuts: [['gtceu:hydrogen', 4000]], eut: 1920, duration: 200 }
  ]

  // the helium refrigerator's keyed row (luv/helium_refrigerator.js), as maxplus/power.js does: the potted coil run cold in the loop
  var COOL = { name: 'kerr_field_coil', input: 'grindless:impregnated_kerr_coil', output: 'grindless:kerr_field_coil', eut: 30720, duration: 600 }
  var COOL_FLUIDS = {
    makeUp: { id: 'gtceu:liquid_helium', amount: 25 }, precoolIn: { id: 'gtceu:liquid_nitrogen', amount: 50 },
    precoolOut: { id: 'gtceu:nitrogen', amount: 50 }, charge: { id: 'gtceu:liquid_helium', amount: 4000 }
  }

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

  function stackOf(s) { return Array.isArray(s) ? s[0] : s }

  function addRow(event, r) {
    try {
      var all = r.items.map(stackOf).concat(r.kept || [], r.outs.map(stackOf))
      var fl = r.fluids.concat(r.charge || [], r.fluidOuts || []).map(function (f) { return f[0] })
      var missing = missingOf(all, fl)
      if (missing.length > 0) {
        skip(r.type + '/' + r.name, missing)
        return
      }
      var b = event.recipes.gtceu[r.type]('grindless:' + r.name)
      r.items.forEach(function (s) {
        if (Array.isArray(s)) b.chancedInput('1x ' + s[0], s[1], 0)
        else b.itemInputs(s)
      })
      ;(r.kept || []).forEach(function (s) { b.notConsumable(s) })
      if (r.circuit) b.circuit(r.circuit)
      r.fluids.forEach(function (f) { b.inputFluids(Fluid.of(f[0], f[1])) })
      ;(r.charge || []).forEach(function (f) { b.notConsumableFluid(Fluid.of(f[0], f[1])) })
      r.outs.forEach(function (s) {
        if (Array.isArray(s)) b.chancedOutput('1x ' + s[0], s[1], 0)
        else b.itemOutputs(s)
      })
      ;(r.fluidOuts || []).forEach(function (f) { b.outputFluids(Fluid.of(f[0], f[1])) })
      if (r.dimension) b.dimension(r.dimension)
      if (r.dataKey) b.addDataString(r.dataKey, r.name)
      b.EUt(r.eut).duration(r.duration)
      MP.recipes.push('grindless:' + r.type + '/' + r.name + ' -> ' + r.outs.map(stackOf).map(idOf).join(','))
    } catch (e) {
      console.error(LOG + 'components ' + r.name + ' failed: ' + e)
    }
  }

  function addCool(event) {
    var cfg = (G.heliumRefrigerator && G.heliumRefrigerator.config) || COOL_FLUIDS
    var fl = [cfg.makeUp.id, cfg.precoolIn.id, cfg.precoolOut.id, cfg.charge.id]
    var missing = missingOf([COOL.input, COOL.output], fl)
    if (missing.length > 0) return skip('closed_loop_cooling/' + COOL.name, missing)
    var dataKey = (G.heliumRefrigerator && G.heliumRefrigerator.dataKey) || 'grindless_closed_loop'
    event.recipes.gtceu.closed_loop_cooling('grindless:' + COOL.name)
      .itemInputs('1x ' + COOL.input)
      .inputFluids(Fluid.of(cfg.makeUp.id, cfg.makeUp.amount))
      .inputFluids(Fluid.of(cfg.precoolIn.id, cfg.precoolIn.amount))
      .notConsumableFluid(Fluid.of(cfg.charge.id, cfg.charge.amount))
      .itemOutputs('1x ' + COOL.output)
      .outputFluids(Fluid.of(cfg.precoolOut.id, cfg.precoolOut.amount))
      .addDataString(dataKey, 'grindless:closed_loop_cooling/' + COOL.name)
      .EUt(COOL.eut).duration(COOL.duration)
    MP.recipes.push('grindless:closed_loop_cooling/' + COOL.name + ' -> ' + COOL.output)
  }

  ServerEvents.recipes(function (event) {
    ROWS.concat(OLD).forEach(function (r) { addRow(event, r) })
    addCool(event)

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
