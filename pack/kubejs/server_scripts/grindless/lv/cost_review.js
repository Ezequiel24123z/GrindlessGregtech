// priority: -19074
// -----------------------------------------------------------------------------------------------
// Cost curve band A, LV review (docs/reforge/02_cost_curve.md "Band A"). LV keeps factor 1.0 (no table): only the recipes the
// matrix showed as incoherent are rebuilt here, by hand, in the GTM style.
//
//   hull_lv         GTM's LV hull was cheaper than the ULV one (matrix 0.449 against 0.479): casing + 2 tin cables + 288 mB
//                   polyethylene. Now casing + 4 tin cables + 576 mB polyethylene (about 0.63, a third more than the ULV hull).
//   energy_hatch_lv GTM: hull + 2 cables + 1 voltage coil (0.72 against 1.37 for the ULV hatch). Now hull + 4 cables + 2 voltage
//                   coils. Every machine hatch of the LV era goes through these two, so they are the cheapest place to raise LV.
//
// Left alone on purpose: the LV casing (8 steel plates) and the LV voltage coil look cheap in the matrix only because it prices LV
// steel through the ash separation loop and the ULV coil through lead; both are solver artefacts, not LV recipes.
(function () {
  var REMOVE = ['gtceu:assembler/hull_lv', 'gtceu:assembler/energy_hatch_lv']

  ServerEvents.recipes(function (event) {
    var needed = ['gtceu:lv_machine_casing', 'gtceu:lv_machine_hull', 'gtceu:tin_single_cable', 'gtceu:lv_voltage_coil',
      'gtceu:lv_energy_input_hatch']
    var missing = needed.filter(function (id) { return !Item.exists(id) })
      .concat(Fluid.exists('gtceu:polyethylene') ? [] : ['gtceu:polyethylene'])
    if (missing.length > 0) {
      console.error('[grindless/lv] cost review skipped, unknown id(s): ' + missing.join(', '))
      return
    }

    REMOVE.forEach(function (id) { event.remove({ id: id }) })

    event.recipes.gtceu.assembler('grindless:hull_lv')
      .itemInputs('1x gtceu:lv_machine_casing', '4x gtceu:tin_single_cable')
      .inputFluids(Fluid.of('gtceu:polyethylene', 576))
      .itemOutputs('1x gtceu:lv_machine_hull')
      .duration(50)
      .EUt(16)

    event.recipes.gtceu.assembler('grindless:energy_hatch_lv')
      .itemInputs('1x gtceu:lv_machine_hull', '4x gtceu:tin_single_cable', '2x gtceu:lv_voltage_coil')
      .itemOutputs('1x gtceu:lv_energy_input_hatch')
      .duration(200)
      .EUt(30)
  })
})()
