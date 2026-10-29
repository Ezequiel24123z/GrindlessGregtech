// priority: -26199
// Gregtech Grindless - the UXV parallel hatch's recipe (package UXV-M1; the hatch is registered in startup_scripts/grindless/lib/parallel_hatch.js).
//
//   gtceu:uxv_parallel_hatch (Extreme Parallel Control Hatch, up to 65536 copies of a recipe) -> grindless:assembly_line/uxv_parallel_hatch
//   The UIV hatch's shape one tier up, an assembly line behind station research on the UIV hatch itself: a UXV hull, 4 spintronic mainframes,
//   a UXV field generator and emitter (UXV-F1), double metallic hydrogen cables, rhea plate and FFKM seals, with 1,000 mB of filtered disk
//   plasma, soldering alloy and lubricant. Every input is made by a later UXV package (B4, B5, A5, B3); C1 checks reachability.
//   GTM has no recipe for it, so nothing is removed.
//
// Published for the smoke test: global.grindless.uxvParallelHatch { recipeId, output, missing, done }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uxv] '
  var G = global.grindless || (global.grindless = {})
  var H = G.uxvParallelHatch || (G.uxvParallelHatch = {})

  var OUTPUT = 'gtceu:uxv_parallel_hatch'
  var RESEARCH = 'gtceu:uiv_parallel_hatch'
  // F1 registers the material key grindless:filtered_disk_plasma, but GTM makes its fluid under gtceu:
  var PLASMA = 'gtceu:filtered_disk_plasma'
  var KEY = { H: 'gtceu:uxv_machine_hull', M: 'gtnn:spintronic_mainframe', G: 'grindless:uxv_field_generator', E: 'grindless:uxv_emitter', C: 'gtceu:metallic_hydrogen_double_cable', P: 'gtceu:rhea_plate', F: 'grindless:ffkm_seal' }

  H.recipeId = 'grindless:assembly_line/uxv_parallel_hatch'
  H.output = OUTPUT
  H.missing = []
  H.done = false

  ServerEvents.recipes(function (event) {
    try {
      var ids = [OUTPUT, RESEARCH]
      Object.keys(KEY).forEach(function (k) { ids.push(KEY[k]) })
      var missing = ids.filter(function (id) { return !Item.exists(id) })
      if (!Fluid.exists(PLASMA)) missing.push(PLASMA)
      if (missing.length > 0) {
        H.missing = missing
        console.error(LOG + H.recipeId + ' skipped, unknown item(s): ' + missing.join(', '))
      } else {
        var b = event.recipes.gtceu.assembly_line('grindless:uxv_parallel_hatch')
        b.itemInputs(KEY.H)
        b.itemInputs('4x ' + KEY.M)
        b.itemInputs(KEY.G)
        b.itemInputs(KEY.E)
        b.itemInputs('4x ' + KEY.C)
        b.itemInputs('16x ' + KEY.P)
        b.itemInputs('8x ' + KEY.F)
        b.inputFluids(Fluid.of(PLASMA, 1000), Fluid.of('gtceu:soldering_alloy', 4608), Fluid.of('gtceu:lubricant', 4000))
        b.itemOutputs(OUTPUT)
        b.stationResearch(function (r) { return r.researchStack(Item.of(RESEARCH)).CWUt(128).EUt(31457280) })
        b.EUt(31457280).duration(1800)
      }
    } catch (e) {
      console.error(LOG + H.recipeId + ' failed: ' + e)
    }
    H.done = true
  })
})()
