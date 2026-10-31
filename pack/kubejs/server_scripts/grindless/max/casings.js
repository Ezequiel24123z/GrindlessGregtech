// -----------------------------------------------------------------------------------------------
// MAX casing pass (QR-MAX, docs/eras/max.md:1105): the assembler rows of the F1 casings that no machine package owns. Each casing is made at home
// from OpV parts, so its first machine can be built before anything of MAX runs: optical table (machines 1, 2 and 9, R1's furnace), membrane
// roller (machine 3), Geroch drum (machine 6). Two casings per craft, at VA[MAX] from stock plates, rods and OpV-era parts (no MAX component: those have no recipe yet). The turn casing
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
  var CASINGS = [
    { name: 'max_optical_table_casing', circuit: 14,
      items: ['gtceu:opv_machine_casing', '4x gtceu:tungsten_steel_plate', '4x gtceu:rubber_plate', '2x gtceu:tungsten_steel_gear', '2x grindless:gamma_multilayer_mirror', '2x #gtceu:circuits/max'] },
    { name: 'membrane_roller_casing', circuit: 15,
      items: ['gtceu:opv_machine_casing', '8x gtceu:tungsten_steel_rod', '4x gtceu:tungsten_steel_plate', '2x grindless:ffkm_seal', '2x #gtceu:circuits/max'] },
    { name: 'geroch_drum_casing', circuit: 16,
      items: ['gtceu:opv_machine_casing', '4x gtceu:tungsten_steel_plate', '2x gtceu:tungsten_steel_rod', '2x grindless:chain_composite_rod', '2x #gtceu:circuits/max'] }
  ]

  ServerEvents.recipes(function (event) {
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
        b.circuit(c.circuit)
        c.items.forEach(function (s) { b.itemInputs(s) })
        b.inputFluids(Fluid.of(FLUID, 250))
        b.itemOutputs('2x ' + out)
        b.EUt(MAX_VA).duration(200)
        MC.recipes.push('grindless:assembler/' + c.name)
      } catch (e) {
        console.error(LOG + 'casing ' + c.name + ' failed: ' + e)
      }
    })
    console.info(LOG + 'casings: ' + MC.recipes.length + ' recipes; skipped ' + MC.skipped.length)
  })
})()
