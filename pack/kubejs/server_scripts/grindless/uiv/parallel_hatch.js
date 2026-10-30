// priority: -24649
// Gregtech Grindless - the UIV parallel hatch's recipe (package UIV-M1; the hatch is registered in startup_scripts/grindless/lib/parallel_hatch.js).
//
//   gtceu:uiv_parallel_hatch (Insane Parallel Control Hatch, up to 16384 copies of a recipe) -> grindless:assembly_line/uiv_parallel_hatch
//   The UEV hatch's shape one tier up, now an assembly line behind station research: a UIV sensor and emitter (UIV-F1), UIV circuits, a UIV hull,
//   2 double metallic hydrogen cables, FFKM seals and rhea plate, with soldering alloy, lubricant and neutronium.
//   GTM has no recipe for it, so nothing is removed.
//
// Published for the smoke test: global.grindless.uivParallelHatch { recipeId, output, missing, done }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uiv] '
  var G = global.grindless || (global.grindless = {})
  var H = G.uivParallelHatch || (G.uivParallelHatch = {})

  var OUTPUT = 'gtceu:uiv_parallel_hatch'
  var RESEARCH = 'gtceu:uiv_emitter'
  var KEY = { S: 'gtceu:uiv_sensor', E: 'gtceu:uiv_emitter', Z: '#gtceu:circuits/uiv', H: 'gtceu:uiv_machine_hull', C: 'gtceu:metallic_hydrogen_double_cable', P: 'gtceu:rhea_plate', F: 'grindless:ffkm_seal' }

  H.recipeId = 'grindless:assembly_line/uiv_parallel_hatch'
  H.output = OUTPUT
  H.missing = []
  H.done = false

  ServerEvents.recipes(function (event) {
    try {
      var ids = [OUTPUT]
      Object.keys(KEY).forEach(function (k) {
        if (KEY[k].charAt(0) !== '#') ids.push(KEY[k])
      })
      var missing = ids.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        H.missing = missing
        console.error(LOG + H.recipeId + ' skipped, unknown item(s): ' + missing.join(', '))
      } else {
        var b = event.recipes.gtceu.assembly_line('grindless:uiv_parallel_hatch')
        b.itemInputs(KEY.H)
        b.itemInputs(KEY.S)
        b.itemInputs(KEY.E)
        b.itemInputs('2x ' + KEY.C)
        b.itemInputs('4x ' + KEY.Z)
        b.itemInputs('8x ' + KEY.P)
        b.itemInputs('4x ' + KEY.F)
        b.inputFluids(Fluid.of('gtceu:soldering_alloy', 2304), Fluid.of('gtceu:lubricant', 2000), Fluid.of('gtceu:neutronium', 576))
        b.itemOutputs(OUTPUT)
        b.stationResearch(function (r) { return r.researchStack(Item.of(RESEARCH)).CWUt(64).EUt(7864320) })
        b.EUt(7864320).duration(1500)
      }
    } catch (e) {
      console.error(LOG + H.recipeId + ' failed: ' + e)
    }
    H.done = true
  })
})()
