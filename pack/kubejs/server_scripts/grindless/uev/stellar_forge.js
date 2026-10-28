// priority: -23198
// Gregtech Grindless - the Stellar Forge's controller recipe (package UEV-M2; the machine is in startup_scripts/grindless/uev/stellar_forge.js).
//
//   gtceu:stellar_forge -> grindless:stellar_forge (assembler, no programmed circuit; no other assembler recipe has these inputs)
//   "N of the machines it replaces": 8 electric blast furnaces, 16 HfTaCN coil blocks (the forge's coil, UEV-B) and 4 UEV circuits.
//
// Published for the smoke test: global.grindless.stellarForgeRecipe { recipeId, output, inputs, missing, done }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uev] '
  var G = global.grindless || (global.grindless = {})
  var R = G.stellarForgeRecipe || (G.stellarForgeRecipe = {})

  var OUTPUT = 'gtceu:stellar_forge'
  var PLAIN = ['8x gtceu:electric_blast_furnace', '16x grindless:hftacn_coil_block']
  var CIRCUITS = '4x #gtceu:circuits/uev'

  R.recipeId = 'grindless:stellar_forge'
  R.output = OUTPUT
  R.inputs = PLAIN.concat([CIRCUITS])
  R.missing = []
  R.done = false

  ServerEvents.recipes(function (event) {
    try {
      var ids = [OUTPUT].concat(PLAIN.map(function (s) { return s.replace(/^\d+x /, '') }))
      var missing = ids.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        R.missing = missing
        console.error(LOG + R.recipeId + ' skipped, unknown item(s): ' + missing.join(', '))
      } else {
        event.recipes.gtceu.assembler(R.recipeId)
          .itemInputs(PLAIN[0], PLAIN[1], CIRCUITS)
          .itemOutputs(OUTPUT)
          .EUt(2097152)
          .duration(1200)
      }
    } catch (e) {
      console.error(LOG + R.recipeId + ' failed: ' + e)
    }
    R.done = true
  })
})()
