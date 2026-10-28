// priority: -23574
// Gregtech Grindless - the UHV parallel hatch's recipe (package MEGA-0b; the hatch is registered in startup_scripts/grindless/lib/parallel_hatch.js).
//
//   gtceu:uhv_parallel_hatch (Hyper Parallel Control Hatch, up to 1024 copies of a recipe) -> grindless:crafting/uhv_parallel_hatch
//   One tier above GTM's UV hatch (gtceu:shaped/parallel_hatch_mk4, GCYMRecipes) in the same shape: a UV sensor and emitter (no UHV ones
//   exist with highTierContent off; the pack's UHV machines take the UV ones), 4 UHV circuits, a UHV hull and 2 double europium cables
//   (GTM's UHV cable). GTM has no recipe for it, so nothing is removed.
//
// Published for the smoke test: global.grindless.uhvParallelHatch { recipeId, output, missing, done }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uhv] '
  var G = global.grindless || (global.grindless = {})
  var H = G.uhvParallelHatch || (G.uhvParallelHatch = {})

  var OUTPUT = 'gtceu:uhv_parallel_hatch'
  var PATTERN = ['SZE', 'ZHZ', 'CZC']
  var KEY = { S: 'gtceu:uv_sensor', E: 'gtceu:uv_emitter', Z: '#gtceu:circuits/uhv', H: 'gtceu:uhv_machine_hull', C: 'gtceu:europium_double_cable' }

  H.recipeId = 'grindless:crafting/uhv_parallel_hatch'
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
        event.shaped(OUTPUT, PATTERN, KEY).id(H.recipeId)
      }
    } catch (e) {
      console.error(LOG + H.recipeId + ' failed: ' + e)
    }
    H.done = true
  })
})()
