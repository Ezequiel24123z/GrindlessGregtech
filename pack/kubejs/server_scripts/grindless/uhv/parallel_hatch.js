// priority: -23574
// Gregtech Grindless - the UHV parallel hatch's recipe (package MEGA-0b; the hatch is registered in startup_scripts/grindless/lib/parallel_hatch.js).
//
//   gtceu:uhv_parallel_hatch (Hyper Parallel Control Hatch, up to 1024 copies of a recipe) -> grindless:assembly_line/uhv_parallel_hatch
//   Assembly line with station research (a hatch is a complex part): UHV hull + a UV sensor and emitter (no UHV ones exist with highTierContent
//   off) + 4 UHV circuits + 2 double europium cables + 4 fibre laser modules + 2 SRF cavities + 2 mu-metal shields, soldering alloy, lubricant and
//   tritanium; research: the SRF cryomodule. GTM has no recipe for it, so nothing is removed.
//
// Published for the smoke test: global.grindless.uhvParallelHatch { recipeId, output, missing, done }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uhv] '
  var G = global.grindless || (global.grindless = {})
  var H = G.uhvParallelHatch || (G.uhvParallelHatch = {})

  var OUTPUT = 'gtceu:uhv_parallel_hatch'
  var PARTS = ['gtceu:uhv_machine_hull', 'gtceu:uhv_sensor', 'gtceu:uhv_emitter', 'gtceu:europium_double_cable']
  var DOMAIN = ['grindless:fibre_laser_module', 'grindless:srf_cavity', 'grindless:mu_metal_shield']
  var RESEARCH = 'grindless:srf_cryomodule'

  H.recipeId = 'grindless:assembly_line/uhv_parallel_hatch'
  H.output = OUTPUT
  H.missing = []
  H.done = false

  ServerEvents.recipes(function (event) {
    try {
      var ids = [OUTPUT, RESEARCH].concat(PARTS, DOMAIN)
      var missing = ids.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        H.missing = missing
        console.error(LOG + H.recipeId + ' skipped, unknown item(s): ' + missing.join(', '))
      } else {
        event.recipes.gtceu.assembly_line('grindless:uhv_parallel_hatch')
          .itemInputs('gtceu:uhv_machine_hull', 'gtceu:uhv_sensor', 'gtceu:uhv_emitter', '2x gtceu:europium_double_cable', '4x #gtceu:circuits/uhv')
          .itemInputs('4x grindless:fibre_laser_module', '2x grindless:srf_cavity', '2x grindless:mu_metal_shield')
          .inputFluids(Fluid.of('gtceu:soldering_alloy', 2304), Fluid.of('gtceu:lubricant', 2000), Fluid.of('gtceu:tritanium', 1152))
          .itemOutputs(OUTPUT)
          .stationResearch(function (r) { return r.researchStack(Item.of(RESEARCH)).CWUt(64).EUt(1966080) })
          .EUt(1966080).duration(1500)
      }
    } catch (e) {
      console.error(LOG + H.recipeId + ' failed: ' + e)
    }
    H.done = true
  })
})()
