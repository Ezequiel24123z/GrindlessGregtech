// priority: -19988
// Gregtech Grindless - the MAX parallel hatch's recipe (package MAX-M1; the hatch is registered in startup_scripts/grindless/lib/parallel_hatch.js).
//
//   gtceu:max_parallel_hatch (Maximum Parallel Control Hatch, up to 1048576 copies of a recipe) -> grindless:assembly_line/max_parallel_hatch
//   The OpV hatch's shape one tier up, an assembly line at VA[MAX] behind station research on the OpV hatch itself: a MAX hull, 2 field
//   generators, 2 robot arms and 4 MAX circuits, with 1,000 mB of superfluid helium-3. The inputs are made by later MAX packages
//   (hull A0; field generator and robot arm A3; circuits A1), so EMI keeps the row in pendingRoutes until A3.
//
// Published for the smoke test: global.grindless.maxParallelHatch { recipeId, output, missing, done }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/max] '
  var G = global.grindless || (global.grindless = {})
  var H = G.maxParallelHatch || (G.maxParallelHatch = {})

  var OUTPUT = 'gtceu:max_parallel_hatch'
  var RESEARCH = 'gtceu:opv_parallel_hatch'
  var HELIUM = 'gtceu:superfluid_helium_3'
  var CIRCUIT = '#gtceu:circuits/max'
  var KEY = { H: 'gtceu:max_machine_hull', G: 'grindless:max_field_generator', R: 'grindless:max_robot_arm' }
  var VA_MAX = 2013265920
  var VA_OPV = 503316480

  H.recipeId = 'grindless:assembly_line/max_parallel_hatch'
  H.output = OUTPUT
  H.missing = []
  H.done = false

  ServerEvents.recipes(function (event) {
    try {
      var ids = [OUTPUT, RESEARCH]
      Object.keys(KEY).forEach(function (k) { ids.push(KEY[k]) })
      var missing = ids.filter(function (id) { return !Item.exists(id) })
      if (!Fluid.exists(HELIUM)) missing.push(HELIUM)
      if (missing.length > 0) {
        H.missing = missing
        console.error(LOG + H.recipeId + ' skipped, unknown item(s): ' + missing.join(', '))
      } else {
        var b = event.recipes.gtceu.assembly_line('grindless:max_parallel_hatch')
        b.itemInputs(KEY.H)
        b.itemInputs('2x ' + KEY.G)
        b.itemInputs('2x ' + KEY.R)
        b.itemInputs('4x ' + CIRCUIT)
        b.inputFluids(Fluid.of(HELIUM, 1000))
        b.itemOutputs(OUTPUT)
        b.stationResearch(function (r) { return r.researchStack(Item.of(RESEARCH)).CWUt(128).EUt(VA_OPV) })
        b.EUt(VA_MAX).duration(2000)
      }
    } catch (e) {
      console.error(LOG + H.recipeId + ' failed: ' + e)
    }
    H.done = true
  })
})()