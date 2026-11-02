// priority: -27760
// SITE-E (owner, 2026-11-02): every recipe takes any circuit of its tier. The horizon processor (a row of the shared UEV photonics table)
// now names #gtceu:circuits/max in the table itself (the replaceInput swap that used to live here never matched). The OpV casing (uxv/gate.js), the plasma mass filter (uxv/cygnus_lift.js)
// and the warp gate's held mainframes (tables/gate.json) take their tags in their own files.
// Published for the tests: global.grindless.universalCircuitsE { rows }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var G = global.grindless || (global.grindless = {})
  var U = G.universalCircuitsE || (G.universalCircuitsE = {})

  // recipe id, specific circuit, tier tag
  var ROWS = []
  U.rows = ROWS

  global.grindless.recipes('integration/universal_circuits_e', function (event) {
    ROWS.forEach(function (r) {
      event.replaceInput({ id: r.id }, r.item, r.tag)
    })
  })
})()
