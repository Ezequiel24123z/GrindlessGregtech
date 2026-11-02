// priority: -27749
// SITE-E (owner, 2026-11-02): every recipe takes any circuit of its tier. The horizon processor (a row of the shared UEV photonics table)
// named the MAX mainframe; it takes the MAX tag instead, swapped here so the shared table does not change. MAX holds only
// gtnn:supracausal_mainframe in its tag, so it is a one-member tag. The OpV casing (uxv/gate.js), the plasma mass filter (uxv/cygnus_lift.js)
// and the warp gate's held mainframes (tables/gate.json) take their tags in their own files.
// Published for the tests: global.grindless.universalCircuitsE { rows }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var G = global.grindless || (global.grindless = {})
  var U = G.universalCircuitsE || (G.universalCircuitsE = {})

  // recipe id, specific circuit, tier tag
  var ROWS = [
    { id: 'grindless:photonic_integration/horizon_processor', item: 'gtnn:supracausal_mainframe', tag: '#gtceu:circuits/max' }
  ]
  U.rows = ROWS

  ServerEvents.recipes(function (event) {
    ROWS.forEach(function (r) {
      event.replaceInput({ id: r.id }, r.item, r.tag)
    })
  })
})()
