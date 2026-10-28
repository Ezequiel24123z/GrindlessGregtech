// priority: -23227
// Gregtech Grindless - the UIV parallel hatch's recipe (package UIV-M1; the hatch is registered in startup_scripts/grindless/lib/parallel_hatch.js).
//
//   gtceu:uiv_parallel_hatch (Insane Parallel Control Hatch, up to 16384 copies of a recipe) -> grindless:crafting/uiv_parallel_hatch
//   The UEV hatch's shape one tier up: a UIV sensor and emitter (UIV-F1), 4 UIV circuits, a UIV hull and 2 double metallic hydrogen cables.
//   GTM has no recipe for it, so nothing is removed.
//
// Published for the smoke test: global.grindless.uivParallelHatch { recipeId, output, missing, done }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uiv] '
  var G = global.grindless || (global.grindless = {})
  var H = G.uivParallelHatch || (G.uivParallelHatch = {})

  var OUTPUT = 'gtceu:uiv_parallel_hatch'
  var PATTERN = ['SZE', 'ZHZ', 'CZC']
  var KEY = { S: 'grindless:uiv_sensor', E: 'grindless:uiv_emitter', Z: '#gtceu:circuits/uiv', H: 'gtceu:uiv_machine_hull', C: 'gtceu:metallic_hydrogen_double_cable' }

  H.recipeId = 'grindless:crafting/uiv_parallel_hatch'
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
