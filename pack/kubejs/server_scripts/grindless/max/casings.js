// priority: -19766
// -----------------------------------------------------------------------------------------------
// MAX casing pass (QR-MAX, docs/eras/max.md:1249; D5-CAS-MAX, docs/eras/lines-opv-maxplus.md 7.2): the assembler rows of the MAX casings that no machine
// package owns: the tensegrity truss (the structure), the optical table, membrane vacuum, droplet radiator and shell window coil casings, which
// each take the truss and a product only MAX makes, and the membrane roller and Geroch drum casings (OpV parts: the membrane line and the Geroch
// drum are built before anything of MAX runs). The clamp coil casing is retuned in max/flux_clamp.js. The turn casing
// and the bundle block belong to MAX-D4 (max/injector.js). Published for the tests: global.grindless.maxCasings.recipes, .skipped.
// Rhino: var + function in callbacks.
// -----------------------------------------------------------------------------------------------
(function () {
  var LOG = '[grindless/max] '
  var G = global.grindless || (global.grindless = {})
  var MC = G.maxCasings || (G.maxCasings = {})
  MC.recipes = []
  MC.skipped = []

  var MAX_VA = 2013265920
  var FLUID = 'gtceu:superfluid_helium_3'

  // items in include the programmed circuit; fluid 250 mB
  // the family (D5-CAS-MAX, docs/eras/lines-opv-maxplus.md 7.2): no circuits; the truss is the structure the other five take
  // (clamp_coil_casing, the sixth, is retuned in flux_clamp.js where it is made)
  var STRAND = 'gtceu:horizon_strand_single_wire'
  var TRUSS = 'grindless:tensegrity_truss_casing'
  var CASINGS = [
    { name: 'tensegrity_truss_casing', out: 4, duration: 200,
      items: ['2x grindless:exotic_composite_rod', '4x ' + STRAND, '2x grindless:chain_lamina_casing', '4x gtceu:tungsten_steel_plate', '2x gtceu:tungsten_steel_rod'] },
    { name: 'max_optical_table_casing', out: 2, duration: 400,
      items: ['grindless:zero_expansion_baseplate', 'grindless:laminated_terfenol_stack', TRUSS] },
    { name: 'membrane_vacuum_casing', out: 2, duration: 400,
      items: ['grindless:superconducting_membrane', '2x grindless:neg_xhv_casing', TRUSS, 'grindless:max_electric_pump', '2x grindless:ffkm_seal'] },
    { name: 'droplet_radiator_casing', out: 2, duration: 400,
      items: ['2x grindless:shell_droplet_radiator', TRUSS, 'grindless:max_fluid_regulator', 'grindless:max_electric_pump', '4x gtceu:tungsten_steel_plate', '2x grindless:ffkm_seal'] },
    { name: 'shell_window_coil_casing', out: 2, duration: 400,
      items: ['grindless:max_field_coil', 'grindless:superconducting_membrane', '2x ' + STRAND, TRUSS, 'grindless:max_sensor', '2x grindless:ffkm_seal'] },
    { name: 'membrane_roller_casing', circuit: 15,
      items: ['gtceu:opv_machine_casing', '8x gtceu:tungsten_steel_rod', '4x gtceu:tungsten_steel_plate', '2x grindless:ffkm_seal', '2x #gtceu:circuits/max'] },
    { name: 'geroch_drum_casing', circuit: 16,
      items: ['gtceu:opv_machine_casing', '4x gtceu:tungsten_steel_plate', '2x gtceu:tungsten_steel_rod', '2x grindless:chain_composite_rod', '2x #gtceu:circuits/max'] }
  ]

  ServerEvents.recipes(function (event) {
    try {
    CASINGS.forEach(function (c) {
      try {
        var out = 'grindless:' + c.name
        var missing = []
        c.items.concat([out]).forEach(function (s) {
          if (String(s).indexOf('#') >= 0) return
          var id = String(s).replace(/^\d+x /, '')
          if (!Item.exists(id)) missing.push(id)
        })
        if (!Fluid.exists(FLUID)) missing.push(FLUID)
        if (missing.length > 0) {
          MC.skipped.push(c.name)
          console.error(LOG + 'casing ' + c.name + ' skipped, unknown id(s): ' + missing.join(', '))
          return
        }
        var b = event.recipes.gtceu.assembler('grindless:' + c.name)
        if (c.circuit) b.circuit(c.circuit)
        c.items.forEach(function (s) { b.itemInputs(s) })
        b.inputFluids(Fluid.of(FLUID, 250))
        b.itemOutputs((c.out || 2) + 'x ' + out)
        b.EUt(MAX_VA).duration(c.duration || 200)
        MC.recipes.push('grindless:assembler/' + c.name)
      } catch (e) {
        console.error(LOG + 'casing ' + c.name + ' failed: ' + e)
      }
    })
    console.info(LOG + 'casings: ' + MC.recipes.length + ' recipes; skipped ' + MC.skipped.length)
    } catch (e) {
      console.error('[grindless/max/casings] recipes failed: ' + e)
    }
  })
})()
