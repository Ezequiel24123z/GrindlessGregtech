// priority: -23262
// Gregtech Grindless - the Stellar Forge's controller recipe (package UEV-M2; the machine is in startup_scripts/grindless/uev/stellar_forge.js).
//
//   gtceu:stellar_forge -> grindless:assembly_line/stellar_forge (assembly line, research: the HfTaCN coil block)
//   "N of the machines it replaces": 8 electric blast furnaces, 16 HfTaCN coil blocks (the forge's coil, UEV-B) and 4 UEV circuits.
//
// Published for the smoke test: global.grindless.stellarForgeRecipe { recipeId, output, inputs, missing, done }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uev] '
  var G = global.grindless || (global.grindless = {})
  var R = G.stellarForgeRecipe || (G.stellarForgeRecipe = {})

  var OUTPUT = 'gtceu:stellar_forge'
  var PLAIN = ['8x gtceu:electric_blast_furnace', '16x grindless:hftacn_coil_block', '3x gtceu:uev_field_generator', '3x gtceu:uev_electric_pump', '2x gtceu:uev_sensor']
  var CIRCUITS = '4x #gtceu:circuits/uev'

  R.recipeId = 'grindless:assembly_line/stellar_forge'
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
        event.recipes.gtceu.assembly_line('grindless:stellar_forge')
          .itemInputs(PLAIN[0], PLAIN[1], PLAIN[2], PLAIN[3], PLAIN[4], CIRCUITS, '2x grindless:ule_cavity', '2x grindless:hftacn_heating_element')
          .inputFluids(Fluid.of('gtceu:soldering_alloy', 2304), Fluid.of('gtceu:lubricant', 1000), Fluid.of('gtceu:helium_plasma', 576))
          .itemOutputs(OUTPUT)
          .stationResearch(function (r) { return r.researchStack(Item.of('grindless:hftacn_coil_block')).CWUt(64).EUt(7864320) })
          .EUt(7864320)
          .duration(2400)
      }
    } catch (e) {
      console.error(LOG + R.recipeId + ' failed: ' + e)
    }
    R.done = true
  })
})()
