// priority: -20064
// -----------------------------------------------------------------------------------------------
// MAX ergoregion synchroniser (docs/eras/max.md, machine 12, L50 L51 L55; package MX-S2). Its recipes, the three assembler steps and the GTM
// steps of the lines, and its controller. The other steps of the lines are one row each of an older machine, marked MX-S2 in their own files:
//
//   L50  extraction cascade c30 vanadium_pentoxide -> crystal growth c30 sapphire_web_wafer -> oxide PLD c6 vo2_on_sapphire -> BEUV c16
//        patterned_vo2_metasurface -> MTJ sputtering c26 metallised_metasurface -> assembler tunable_impedance_sheet (here)
//        (the fatigued VO2 sheets of c1 go back to the extraction cascade c32 as vanadium pentoxide and sapphire dust)
//   L51  single crystal foundry c28 large_grain_nb_disc -> SRF works c11 nb_driver_cell -> chemical bath polished_driver_cell (here) -> electric
//        blast furnace nb3sn_driver_cell (here, tin vapour diffusion) -> He refrigerator conduction_cooled_cell -> assembler srf_driver_module
//        (here). The contract's superfluid helium plant step is the He refrigerator: the plant has no item slots (docs/research/max-s0.md, S0-12).
//   L55  crystal growth c31 sapphire_resonator_disc -> lathe polished_sapphire_disc (here) -> He refrigerator cryo_sapphire_oscillator -> clock lab
//        c8 clock_steered_oscillator -> photonic foundry c27 optical_phase_lock_unit -> assembler phase_lock_oscillator_bank (here)
//
// c1 horizon_phase_lock: 2 SRF driver modules + 2 calibrated oscillator banks + 4 tunable impedance sheets + 1 quantum memory node + 500 mB
// superfluid He-3 -> 1 lock (and a fatigued VO2 sheet 1 time in 8), VA[MAX], 1,200 t. c2 relock: a spent phase lock + 1 calibrated oscillator bank
// -> 1 lock (the drivers survive, the oscillator drifts), VA[MAX], 600 t. Both run in the Sgr A* orbit. The spent lock's route is the shell's.
// Published: global.grindless.maxSynchroniser.recipes, .skipped, .pendingRoutes, .controllerRecipe. Rhino: var + function in callbacks.
(function () {
  var LOG = '[grindless/max] '
  var G = global.grindless || (global.grindless = {})
  var MS = G.maxSynchroniser || (G.maxSynchroniser = {})
  MS.recipes = []
  MS.skipped = []
  MS.pendingRoutes = ['grindless:spent_phase_lock']
  MS.controllerRecipe = 'grindless:assembly_line/ergoregion_synchroniser'

  var VA_MAX = Number(GTValues.VA[14])
  var HE3 = 'gtceu:superfluid_helium_3'
  var CIRCUIT = '#gtceu:circuits/max'
  var CONTROLLER = 'gtceu:ergoregion_synchroniser'
  var RESEARCH = 'grindless:srf_driver_module'
  var HULL = 'gtceu:max_machine_hull'
  var SITE = (G.maxTravel && G.maxTravel.places && G.maxTravel.places.sgra ? G.maxTravel.places.sgra.dimension : 'gcyr:black_hole_orbit')
  var TYPE = 'ergoregion_synchronisation'
  var KEY = 'grindless_ergoregion_synchronisation'
  var SFX = 'grindless:'

  var LOCK_ROWS = [
    {
      name: 'horizon_phase_lock', circuit: 1, duration: 1200,
      items: ['2x grindless:srf_driver_module', '2x grindless:calibrated_oscillator_bank', '4x grindless:tunable_impedance_sheet', '1x grindless:quantum_memory_node'],
      fluid: HE3, amount: 500,
      outs: ['1x grindless:horizon_phase_lock'],
      chanced: [{ id: 'grindless:fatigued_vo2_sheet', chance: 1250 }]
    },
    {
      name: 'relock_phase_lock', circuit: 2, duration: 600,
      items: ['1x grindless:spent_phase_lock', '1x grindless:calibrated_oscillator_bank'],
      fluid: null, amount: 0,
      outs: ['1x grindless:horizon_phase_lock'],
      chanced: []
    }
  ]

  // GTM machines: type, EU/t, duration, item inputs, fluid inputs [id, mB], item outputs, fluid outputs [id, mB], blast temperature (EBF only)
  var STEPS = [
    // L51 step 3: the niobium cavity electropolished in the acid bath, as real SRF cavities are; the spent acid goes to the electrolyzer row of uv/cold.js
    { name: 'polished_driver_cell', type: 'chemical_bath', eut: 7864320, duration: 600,
      items: ['1x grindless:nb_driver_cell'], fluids: [['gtceu:electropolish_acid', 500]],
      outs: ['1x grindless:polished_driver_cell'], fluidOuts: [['gtceu:spent_electropolish_acid', 500]] },
    // L51 step 4: tin vapour diffused into the niobium surface under argon at about 1,100 K: the Nb3Sn layer; the argon is not consumed
    { name: 'nb3sn_driver_cell', type: 'electric_blast_furnace', eut: 7864320, duration: 800, temp: 2700,
      items: ['1x grindless:polished_driver_cell', '4x gtceu:tin_dust'], fluids: [['gtceu:argon', 1000]],
      outs: ['1x grindless:nb3sn_driver_cell'], fluidOuts: [] },
    // L55 step 2: the grown sapphire disc turned to its resonator figure; the swarf is sapphire dust, which goes back to crystal growth
    { name: 'polished_sapphire_disc', type: 'lathe', eut: 7864320, duration: 400,
      items: ['1x grindless:sapphire_resonator_disc'], fluids: [],
      outs: ['1x grindless:polished_sapphire_disc', '1x gtceu:sapphire_dust'], fluidOuts: [] },
    // L50 step 6: the metasurface pair bonded on its niobium-titanium leads under solder into the sheet the shell segment and c1 take
    { name: 'tunable_impedance_sheet', type: 'assembler', eut: 7864320, duration: 400,
      items: ['2x grindless:metallised_metasurface', '4x gtceu:gold_foil', '2x gtceu:niobium_titanium_foil', '1x gtceu:uxv_sensor', '#gtceu:circuits/opv'],
      fluids: [['gtceu:soldering_alloy', 288]], outs: ['1x grindless:tunable_impedance_sheet'], fluidOuts: [] },
    // L51 step 6: four conduction-cooled cells in a cryostat, the driver module. Motors, not pumps: the OpV pump now descends from the
    // UHV pump (darmstadtium rotor), and a pump here would close the recipe-quality depth loop through the sheet returns.
    { name: 'srf_driver_module', type: 'assembler', eut: 31457280, duration: 800,
      items: ['4x grindless:conduction_cooled_cell', '2x gtceu:opv_electric_motor', '1x gtceu:opv_sensor', '2x gtceu:tungsten_steel_plate',
        '4x gtceu:niobium_titanium_foil', '#gtceu:circuits/opv'],
      fluids: [['gtceu:helium', 2000]], outs: ['1x grindless:srf_driver_module'], fluidOuts: [] },
    // the ring casing: made at home from OpV parts, so the synchroniser can be built (no input comes from its own lines)
    { name: 'driver_ring_casing', type: 'assembler', circuit: 14, eut: VA_MAX, duration: 200,
      items: ['gtceu:opv_machine_casing', '8x gtceu:niobium_titanium_foil', '2x gtceu:opv_electric_motor', '2x #gtceu:circuits/opv'],
      fluids: [['gtceu:superfluid_helium_3', 250]], outs: ['2x grindless:driver_ring_casing'], fluidOuts: [] },
    // L55 step 6: two optical phase lock units on a sensor board in a shielded case, the oscillator bank
    { name: 'phase_lock_oscillator_bank', type: 'assembler', eut: 31457280, duration: 800,
      items: ['2x grindless:optical_phase_lock_unit', '2x gtceu:opv_sensor', '1x gtceu:opv_robot_arm', '2x gtceu:tungsten_steel_plate',
        '4x gtceu:gold_foil', '#gtceu:circuits/opv'],
      fluids: [['gtceu:soldering_alloy', 576]], outs: ['1x grindless:phase_lock_oscillator_bank'], fluidOuts: [] }
  ]

  function idOf(s) { return String(s).replace(/^\d+x /, '') }

  function missingOf(items, fluids) {
    var m = []
    items.forEach(function (s) {
      var id = idOf(s)
      if (id.charAt(0) === '#') return
      if (!Item.exists(id)) m.push(id)
    })
    fluids.forEach(function (f) { if (!Fluid.exists(f)) m.push(f) })
    return m
  }

  function skip(name, missing) {
    MS.skipped.push(name)
    console.error(LOG + 'synchroniser ' + name + ' skipped, unknown id(s): ' + missing.join(', '))
  }

  ServerEvents.recipes(function (event) {
    LOCK_ROWS.forEach(function (r) {
      try {
        var ids = r.items.concat(r.outs).concat(r.chanced.map(function (c) { return c.id }))
        var missing = missingOf(ids, r.fluid === null ? [] : [r.fluid])
        if (missing.length > 0) {
          skip(r.name, missing)
          return
        }
        var b = event.recipes.gtceu[TYPE]('grindless:' + r.name)
        b.circuit(r.circuit)
        r.items.forEach(function (s) { b.itemInputs(s) })
        if (r.fluid !== null) b.inputFluids(Fluid.of(r.fluid, r.amount))
        r.outs.forEach(function (s) { b.itemOutputs(s) })
        r.chanced.forEach(function (c) { b.chancedOutput('1x ' + c.id, c.chance, 0) })
        b.dimension(SITE)
        b.addDataString(KEY, r.name)
        b.EUt(VA_MAX).duration(r.duration)
        MS.recipes.push(SFX + TYPE + '/' + r.name)
      } catch (e) {
        console.error(LOG + 'synchroniser ' + r.name + ' failed: ' + e)
      }
    })

    STEPS.forEach(function (r) {
      try {
        var missing = missingOf(r.items.concat(r.outs), r.fluids.map(function (f) { return f[0] }).concat(r.fluidOuts.map(function (f) { return f[0] })))
        if (missing.length > 0) {
          skip(r.name, missing)
          return
        }
        var b = event.recipes.gtceu[r.type](SFX + r.name)
        if (r.circuit) b.circuit(r.circuit)
        r.items.forEach(function (s) { b.itemInputs(s) })
        r.fluids.forEach(function (f) { b.inputFluids(Fluid.of(f[0], f[1])) })
        r.outs.forEach(function (s) { b.itemOutputs(s) })
        r.fluidOuts.forEach(function (f) { b.outputFluids(Fluid.of(f[0], f[1])) })
        if (r.temp) b.blastFurnaceTemp(r.temp)
        b.EUt(r.eut).duration(r.duration)
        MS.recipes.push(SFX + r.type + '/' + r.name)
      } catch (e) {
        console.error(LOG + 'synchroniser ' + r.name + ' failed: ' + e)
      }
    })

    try {
      var ids = [HULL, CONTROLLER, RESEARCH, 'grindless:max_field_generator', 'grindless:max_emitter', 'grindless:max_sensor',
        'grindless:tunable_impedance_sheet', 'grindless:phase_lock_oscillator_bank', 'grindless:rydberg_logic_array']
      var mc = missingOf(ids, [HE3])
      if (mc.length > 0) {
        skip('ergoregion_synchroniser', mc)
      } else {
        var a = event.recipes.gtceu.assembly_line('grindless:ergoregion_synchroniser')
        a.itemInputs(HULL, '4x ' + CIRCUIT, '8x grindless:max_field_generator', '4x grindless:max_emitter', '4x grindless:max_sensor',
          'grindless:tunable_impedance_sheet', 'grindless:phase_lock_oscillator_bank', 'grindless:rydberg_logic_array')
        a.inputFluids(Fluid.of(HE3, 1000))
        a.itemOutputs(CONTROLLER)
        a.stationResearch(function (r) { return r.researchStack(Item.of(RESEARCH)).CWUt(64).EUt(VA_MAX) })
        a.EUt(VA_MAX).duration(2400)
      }
    } catch (e) {
      console.error(LOG + 'synchroniser controller failed: ' + e)
    }
    console.info(LOG + 'synchroniser: ' + MS.recipes.length + ' recipes; skipped ' + MS.skipped.length)
  })
})()
