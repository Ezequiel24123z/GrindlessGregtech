// priority: -27799
// -----------------------------------------------------------------------------------------------
// Orphan large chemical reactor twins (FIX-LCR, audit 2026-11-03).
//
// GTM 7.5.3 copies every chemical reactor recipe into the large chemical reactor when it is built (data pack recipes come with their copy
// in the data pack; recipes a script adds get theirs at runtime, after the recipe event, from the final chemical reactor recipe). But
// when a script REMOVES a data pack chemical reactor recipe, its data pack large reactor twin stays live and bypasses the new line
// (vinyl_chloride_from_chlorine, vinyl_chloride_from_ethane, tetrafluoroethylene_from_chloroform, dinitrogen_tetroxide_from_ammonia).
// This handler removes the twin of every <ns>:chemical_reactor/<path> that was in the data pack and is gone from the final set, in every
// namespace, so a later removal cannot leak. A large reactor recipe a script adds is never touched, and large reactor recipes with no
// chemical reactor original (GTM's shortcut family, GT--'s lines) are left alone.
//
// Band -400 (tools/analysis/script_order.json): after every handler that removes recipes. Recipes are read live like the composers do
// (ev/combined_cycle_and_hot_mill.js gather()): originalRecipes plus addedRecipes, minus removed.
//
// Published for the test (tools/test/overlay/kubejs/server_scripts/gg_test_lcr_orphans.js): global.grindless.lcrOrphans = { done, removed: [ids] }
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var G = global.grindless || (global.grindless = {})
  var LOG = '[grindless/lcr_orphans] '
  var CR = 'gtceu:chemical_reactor'
  var LCR = 'gtceu:large_chemical_reactor'
  // RecipeJS.toString() is "<id>[<type>]"
  var ID_TYPE = /^(.*)\[([^\[\]]*)\]$/
  var LCR_ID = /^([^:]+):large_chemical_reactor\/(.+)$/

  G.lcrOrphans = { done: false, removed: [] }

  global.grindless.recipes('integration/lcr_orphans', function (event) {
    var R = G.lcrOrphans
    var crOriginal = {}
    var crFinal = {}
    var lcrOriginal = []
    event.originalRecipes.values().forEach(function (r) {
      var m = ID_TYPE.exec(String(r))
      if (!m) return
      if (m[2] === CR) {
        crOriginal[m[1]] = true
        if (!r.removed) crFinal[m[1]] = true
      } else if (m[2] === LCR && !r.removed) {
        lcrOriginal.push(m[1])
      }
    })
    event.addedRecipes.forEach(function (r) {
      var m = ID_TYPE.exec(String(r))
      if (m && m[2] === CR && !r.removed) crFinal[m[1]] = true
    })
    lcrOriginal.forEach(function (target) {
      var m = LCR_ID.exec(target)
      if (!m) return
      var crId = m[1] + ':chemical_reactor/' + m[2]
      if (crOriginal[crId] && !crFinal[crId]) {
        event.remove({ id: target })
        R.removed.push(target)
      }
    })
    R.done = true
    console.info(LOG + R.removed.length + ' orphan large chemical reactor recipes removed: ' + R.removed.join(', '))
  })
})()
