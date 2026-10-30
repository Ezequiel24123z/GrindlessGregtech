// priority: -23226
// Gregtech Grindless - the UEV parallel hatch's recipe (package UEV-M1; the hatch is registered in startup_scripts/grindless/lib/parallel_hatch.js).
//
//   gtceu:uev_parallel_hatch (Ultimate Parallel Control Hatch, up to 4096 copies of a recipe) -> grindless:assembly_line/uev_parallel_hatch
//   QR-C0: no longer a crafting-table shape. An assembly line with station research (the UEV emitter): UEV hull, sensor, 2 emitters,
//   4 UEV circuits, 2 double lay-superhydride cables and a near-net neutronium gear, with soldering alloy and neutronium.
//   GTM has no recipe for it, so nothing is removed.
//
// Published for the smoke test: global.grindless.uevParallelHatch { recipeId, output, missing, done }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uev] '
  var G = global.grindless || (global.grindless = {})
  var H = G.uevParallelHatch || (G.uevParallelHatch = {})

  var OUTPUT = 'gtceu:uev_parallel_hatch'
  var HULL = 'gtceu:uev_machine_hull'
  var SENSOR = 'gtceu:uev_sensor'
  var EMITTER = 'gtceu:uev_emitter'
  var CABLE = 'gtceu:lay_superhydride_double_cable'
  var GEAR = 'grindless:near_net_neutronium_gear'
  var INPUTS = [HULL, SENSOR, '2x ' + EMITTER, '4x #gtceu:circuits/uev', '2x ' + CABLE, GEAR]

  H.recipeId = 'grindless:assembly_line/uev_parallel_hatch'
  H.output = OUTPUT
  H.missing = []
  H.done = false

  ServerEvents.recipes(function (event) {
    try {
      var ids = [OUTPUT, HULL, SENSOR, EMITTER, CABLE, GEAR]
      var missing = ids.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        H.missing = missing
        console.error(LOG + H.recipeId + ' skipped, unknown item(s): ' + missing.join(', '))
      } else {
        var b = event.recipes.gtceu.assembly_line('grindless:uev_parallel_hatch')
        b.itemInputs(INPUTS)
        b.inputFluids(Fluid.of('gtceu:soldering_alloy', 2304), Fluid.of('gtceu:neutronium', 288))
        b.itemOutputs(OUTPUT)
        b.stationResearch(function (r) { return r.researchStack(Item.of(EMITTER)).CWUt(64).EUt(7864320) })
        b.EUt(7864320).duration(1200)
      }
    } catch (e) {
      console.error(LOG + H.recipeId + ' failed: ' + e)
    }
    H.done = true
  })
})()
