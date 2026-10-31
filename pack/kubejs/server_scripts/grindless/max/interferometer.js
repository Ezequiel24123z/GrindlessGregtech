// priority: -19963
// -----------------------------------------------------------------------------------------------
// MAX-B2 atom interferometer works (docs/eras/max.md, machine 2, L4 last step, L33 steps 3-4; package MAX-B2). The other steps of the two
// lines are one row each of an older machine, marked MAX-B2 in their own files:
//
//   L4  Sr-88 isotope (calutron c16) -> degenerate Sr cartridge (QGL c5) -> [+ squeezed-light chip, SHeQUID rotation ref (SHeQUID c6),
//       atom-optics modulator (TFLN ion slicing c11), cryo reference cavity] -> matter-wave gradiometer (here, c1)
//   L33 Si cavity spacer (crystal growth c31) -> AlGaAs Bragg stack (MBE c13) -> GTM chemical bath (here) -> GTM laser engraver (here)
//       -> He refrigerator (cryo_reference_cavity)
//
// c2 (shell gradient map) needs grindless:sgr_a_spin_map, whose route is D2's: it is a pending route and c2 runs only after max-sgra.
// Published: global.grindless.maxInterferometer.recipes, .skipped, .pendingRoutes, .controllerRecipe. Rhino: var + function in callbacks.
(function () {
  var LOG = '[grindless/max] '
  var G = global.grindless || (global.grindless = {})
  var MI = G.maxInterferometer || (G.maxInterferometer = {})
  MI.recipes = []
  MI.skipped = []
  MI.pendingRoutes = ['grindless:sgr_a_spin_map']
  MI.controllerRecipe = 'grindless:assembly_line/atom_interferometer_works'

  var VA_MAX = Number(GTValues.VA[14])
  var HE3 = 'gtceu:superfluid_helium_3'
  var CIRCUIT = '#gtceu:circuits/max'
  var CONTROLLER = 'gtceu:atom_interferometer_works'
  var RESEARCH = 'grindless:degenerate_sr_cartridge'
  var HULL = 'gtceu:max_machine_hull'

  var ROWS = [
    {
      name: 'matter_wave_gradiometer', circuit: 1, duration: 1200,
      items: ['grindless:degenerate_sr_cartridge', 'grindless:squeezed_light_chip', 'grindless:shequid_rotation_ref', 'grindless:atom_optics_modulator', 'grindless:cryo_reference_cavity'],
      fluid: HE3, amount: 500,
      outs: ['grindless:matter_wave_gradiometer', 'grindless:spent_sr_cartridge']
    },
    {
      name: 'shell_gradient_map', circuit: 2, duration: 1200,
      items: ['grindless:matter_wave_gradiometer', 'grindless:sgr_a_spin_map'],
      fluid: null, amount: 0,
      outs: ['grindless:shell_gradient_map']
    }
  ]

  // GTM rows of L33: a selective etch frees the film from its substrate onto the silicon spacer that carries it, a laser engraver bonds it
  var BATH = { name: 'released_algaas_film', input: 'grindless:algaas_bragg_stack', spacer: 'grindless:silicon_cavity_spacer', fluid: 'gtceu:hydrogen_peroxide', amount: 1000, out: 'grindless:released_algaas_film', eut: 7864320, duration: 600 }
  var ENGRAVE = { name: 'transferred_crystalline_mirror', input: 'grindless:released_algaas_film', lens: 'gtceu:purple_glass_lens', out: 'grindless:transferred_crystalline_mirror', eut: 31457280, duration: 800 }

  function missingOf(ids, fluids) {
    var m = ids.filter(function (id) { return !Item.exists(id) })
    fluids.forEach(function (f) { if (!Fluid.exists(f)) m.push(f) })
    return m
  }

  function skip(name, missing) {
    MI.skipped.push(name)
    console.error(LOG + 'interferometer ' + name + ' skipped, unknown id(s): ' + missing.join(', '))
  }

  ServerEvents.recipes(function (event) {
    ROWS.forEach(function (r) {
      try {
        var missing = missingOf(r.items.concat(r.outs), r.fluid === null ? [] : [r.fluid])
        if (missing.length > 0) {
          skip(r.name, missing)
          return
        }
        var b = event.recipes.gtceu.atom_interferometry('grindless:' + r.name)
        b.circuit(r.circuit)
        b.itemInputs(r.items.map(function (id) { return '1x ' + id }))
        if (r.fluid !== null) b.inputFluids(Fluid.of(r.fluid, r.amount))
        b.itemOutputs(r.outs.map(function (id) { return '1x ' + id }))
        b.addDataString('grindless_atom_interferometry', r.name)
        b.EUt(VA_MAX).duration(r.duration)
        MI.recipes.push('grindless:atom_interferometry/' + r.name)
      } catch (e) {
        console.error(LOG + 'interferometer ' + r.name + ' failed: ' + e)
      }
    })

    try {
      var mb = missingOf([BATH.input, BATH.spacer, BATH.out], [BATH.fluid])
      if (mb.length > 0) {
        skip(BATH.name, mb)
      } else {
        var cb = event.recipes.gtceu.chemical_bath('grindless:' + BATH.name)
        cb.itemInputs('1x ' + BATH.input, '1x ' + BATH.spacer)
        cb.inputFluids(Fluid.of(BATH.fluid, BATH.amount))
        cb.itemOutputs('1x ' + BATH.out)
        cb.EUt(BATH.eut).duration(BATH.duration)
        MI.recipes.push('grindless:chemical_bath/' + BATH.name)
      }
    } catch (e) {
      console.error(LOG + 'interferometer ' + BATH.name + ' failed: ' + e)
    }

    try {
      var me = missingOf([ENGRAVE.input, ENGRAVE.lens, ENGRAVE.out], [])
      if (me.length > 0) {
        skip(ENGRAVE.name, me)
      } else {
        var le = event.recipes.gtceu.laser_engraver('grindless:' + ENGRAVE.name)
        le.itemInputs('1x ' + ENGRAVE.input)
        le.notConsumable(ENGRAVE.lens)
        le.itemOutputs('1x ' + ENGRAVE.out)
        le.EUt(ENGRAVE.eut).duration(ENGRAVE.duration)
        MI.recipes.push('grindless:laser_engraver/' + ENGRAVE.name)
      }
    } catch (e) {
      console.error(LOG + 'interferometer ' + ENGRAVE.name + ' failed: ' + e)
    }

    try {
      var ids = [HULL, CONTROLLER, RESEARCH, 'grindless:max_emitter', 'grindless:max_robot_arm', 'grindless:max_electric_pump',
        'grindless:squeezed_light_chip', 'grindless:shequid_rotation_ref', 'grindless:atom_optics_modulator']
      var mc = missingOf(ids, [HE3])
      if (mc.length > 0) {
        skip('atom_interferometer_works', mc)
      } else {
        var a = event.recipes.gtceu.assembly_line('grindless:atom_interferometer_works')
        a.itemInputs(HULL, '4x ' + CIRCUIT, '4x grindless:max_emitter', '4x grindless:max_robot_arm', '2x grindless:max_electric_pump',
          'grindless:squeezed_light_chip', 'grindless:shequid_rotation_ref', 'grindless:atom_optics_modulator')
        a.inputFluids(Fluid.of(HE3, 1000))
        a.itemOutputs(CONTROLLER)
        a.stationResearch(function (r) { return r.researchStack(Item.of(RESEARCH)).CWUt(64).EUt(VA_MAX) })
        a.EUt(VA_MAX).duration(2400)
      }
    } catch (e) {
      console.error(LOG + 'interferometer controller failed: ' + e)
    }
    console.info(LOG + 'interferometer: ' + MI.recipes.length + ' recipes; skipped ' + MI.skipped.length)
  })
})()
