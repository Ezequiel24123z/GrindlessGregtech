// priority: -23187
// Gregtech Grindless - the UEV parallel hatch's recipe (package UEV-M1; the hatch is registered in startup_scripts/grindless/lib/parallel_hatch.js).
//
//   gtceu:uev_parallel_hatch (Ultimate Parallel Control Hatch, up to 4096 copies of a recipe) -> grindless:crafting/uev_parallel_hatch
//   The UHV hatch's shape one tier up: a UEV sensor and emitter (UEV-B4/F1), 4 UEV circuits, a UEV hull and 2 double lay-superhydride cables.
//   GTM has no recipe for it, so nothing is removed.
//
// Published for the smoke test: global.grindless.uevParallelHatch { recipeId, output, missing, done }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uev] '
  var G = global.grindless || (global.grindless = {})
  var H = G.uevParallelHatch || (G.uevParallelHatch = {})

  var OUTPUT = 'gtceu:uev_parallel_hatch'
  var PATTERN = ['SZE', 'ZHZ', 'CZC']
  var KEY = { S: 'grindless:uev_sensor', E: 'grindless:uev_emitter', Z: '#gtceu:circuits/uev', H: 'gtceu:uev_machine_hull', C: 'gtceu:lay_superhydride_double_cable' }

  H.recipeId = 'grindless:crafting/uev_parallel_hatch'
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
