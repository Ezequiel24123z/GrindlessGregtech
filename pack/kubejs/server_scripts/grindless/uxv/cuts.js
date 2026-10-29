// priority: -26174
// UXV cuts (UXV-F2): GT--'s own recipe for the spintronic mainframe and GTM's generic makers of pasta_strand wire.
// Removals spare our own recipes (not mod grindless), so no load-order band is needed.
;(function () {
  var LOG = '[grindless] '
  var WIRE = 'gtceu:pasta_strand_'

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      var removals = [
        { output: 'gtnn:spintronic_mainframe', not: { mod: 'grindless' } },
        { type: 'gtceu:wiremill', output: WIRE + 'single_wire', not: { mod: 'grindless' } },
        { type: 'gtceu:extruder', output: WIRE + 'single_wire', not: { mod: 'grindless' } }
      ]
      var found = 0
      removals.forEach(function (f) { found += Number(event.countRecipes(f)) })
      removals.forEach(function (f) { event.remove(f) })
      console.info(LOG + 'uxv cuts: removed ' + found + ' recipes (GT-- spintronic mainframe, generic pasta_strand wire)')
    } catch (e) {
      console.error(LOG + 'uxv cuts failed: ' + e)
    }
  })
})()
