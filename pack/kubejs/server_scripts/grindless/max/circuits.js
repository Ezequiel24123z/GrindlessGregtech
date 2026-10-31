// priority: -19934
// -----------------------------------------------------------------------------------------------
// MAX-A1 "Circuits" (docs/eras/max.md, A1; lines 5-7 and the Circuits paragraph): the GTM step of line 6 and the join. Every other step of
// the three lines is one row of an older machine, marked MAX-A1 in its own file:
//
//   L5  squeezed-light chip      crystal growth c28 -> TFLN ion slicing c9 -> femtosecond writer c7 -> MOCVD c23 -> SNSPD foundry c7
//   L6  tweezer array die        crystal growth c29 -> BEUV c10 -> MTJ c13 -> QGL c4 -> GTM laser engraver (here)
//   L7  cryo photonic interposer MOCVD c24 -> MTJ c14 -> MBE c12 -> TFLN ion slicing c10 -> mK cryostat c8
//
// The join is the UEV photonic integration hall's c9 (tables/photonics_uev.json): 2 squeezed-light chips + 2 tweezer array dies + the cryo
// photonic interposer + 4 OpV circuits + a tetron array + 2,000 mB superfluid helium-3 -> gtnn:supracausal_mainframe, the only member of
// #gtceu:circuits/max. GT--'s own processors, computers and SMDs are cut or hidden by MAX-F2 (the S0-8 spike: they are registered in Kotlin, so
// the cut is hide-only). No input of the lines is a MAX product, and nothing returns through a loop.
//
// Published: global.grindless.maxCircuits.recipes, .skipped, .joinRecipe, .joinOutput.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/max] '
  var G = global.grindless || (global.grindless = {})
  var MC = G.maxCircuits || (G.maxCircuits = {})
  MC.recipes = []
  MC.skipped = []
  MC.joinRecipe = 'grindless:photonic_integration/supracausal_mainframe'
  MC.joinOutput = 'gtnn:supracausal_mainframe'

  var ROWS = [
    { name: 'tweezer_array_die', eut: 31457280, duration: 1200, input: 'grindless:tweezer_calibrated_lens', lens: 'gtceu:purple_glass_lens',
      out: 'grindless:tweezer_array_die' }
  ]

  ServerEvents.recipes(function (event) {
    ROWS.forEach(function (r) {
      var missing = [r.input, r.lens, r.out].filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        MC.skipped.push(r.name)
        console.error(LOG + r.name + ' skipped, unknown id(s): ' + missing.join(', '))
        return
      }
      // GTM prefixes the type itself: grindless:<name> becomes grindless:laser_engraver/<name>
      var b = event.recipes.gtceu.laser_engraver('grindless:' + r.name)
      b.itemInputs('1x ' + r.input)
      b.notConsumable(r.lens)
      b.itemOutputs('1x ' + r.out)
      b.EUt(r.eut).duration(r.duration)
      MC.recipes.push('grindless:laser_engraver/' + r.name)
    })
    console.info(LOG + 'circuits: ' + MC.recipes.length + ' recipes; skipped ' + MC.skipped.length)
  })
})()
