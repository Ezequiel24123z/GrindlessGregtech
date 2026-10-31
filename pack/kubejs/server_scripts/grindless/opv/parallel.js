// priority: -21735
// Gregtech Grindless - the OpV parallel hatch's recipe (package OpV-M1; the hatch is registered in startup_scripts/grindless/lib/parallel_hatch.js).
//
//   gtceu:opv_parallel_hatch (Overpowered Parallel Control Hatch, up to 262144 copies of a recipe) -> grindless:assembly_line/opv_parallel_hatch
//   The UXV hatch's shape one tier up, an assembly line at VA[OpV] behind station research on the UXV hatch itself: an OpV hull, 4 field
//   generators, 4 robot arms, 4 sensors, 8 OpV circuits and 4 tetron arrays, with 1,000 mB of superfluid helium-3 (OpV-F1's material).
//   The inputs are made by later OpV packages (hull A0; robot arm and sensor A1; circuits A2; field generator A3; tetron array B1).
//   GTM has no recipe for it (S0-1: HT does not register the hatch), so nothing is removed.
//
// Published for the smoke test: global.grindless.opvParallelHatch { recipeId, output, missing, done }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/opv] '
  var G = global.grindless || (global.grindless = {})
  var H = G.opvParallelHatch || (G.opvParallelHatch = {})

  var OUTPUT = 'gtceu:opv_parallel_hatch'
  var RESEARCH = 'gtceu:uxv_parallel_hatch'
  // F1 registers the material key grindless:superfluid_helium_3, but GTM makes its fluid under gtceu: (tables/opv_ids.json)
  var HELIUM = 'gtceu:superfluid_helium_3'
  var CIRCUIT = '#gtceu:circuits/opv'
  var KEY = { H: 'gtceu:opv_machine_hull', G: 'gtceu:opv_field_generator', R: 'gtceu:opv_robot_arm', S: 'gtceu:opv_sensor', T: 'grindless:tetron_array' }
  var VA_OPV = 503316480
  var VA_UXV = 125829120

  H.recipeId = 'grindless:assembly_line/opv_parallel_hatch'
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
        var b = event.recipes.gtceu.assembly_line('grindless:opv_parallel_hatch')
        b.itemInputs(KEY.H)
        b.itemInputs('4x ' + KEY.G)
        b.itemInputs('4x ' + KEY.R)
        b.itemInputs('4x ' + KEY.S)
        b.itemInputs('8x ' + CIRCUIT)
        b.itemInputs('4x ' + KEY.T)
        b.inputFluids(Fluid.of(HELIUM, 1000))
        b.itemOutputs(OUTPUT)
        b.stationResearch(function (r) { return r.researchStack(Item.of(RESEARCH)).CWUt(128).EUt(VA_UXV) })
        b.EUt(VA_OPV).duration(1800)
      }
    } catch (e) {
      console.error(LOG + H.recipeId + ' failed: ' + e)
    }
    H.done = true
  })
})()
