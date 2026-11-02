// priority: -20900
// SITE-E (owner, 2026-11-02): every recipe takes any circuit of its tier. The four recipes of the MAX and MAX+ range that named one specific
// circuit take the tier tag instead (the rows live in uxv/gate.js, opv/gate.js, uxv/cygnus_lift.js and the UEV photonics table; the input is
// swapped here so no shared file changes). MAX holds only gtnn:supracausal_mainframe in its tag, so the MAX row is a one-member tag.
// Published for the tests: global.grindless.universalCircuitsE { rows }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var G = global.grindless || (global.grindless = {})
  var U = G.universalCircuitsE || (G.universalCircuitsE = {})

  // recipe id, specific circuit, tier tag
  var ROWS = [
    { id: 'grindless:assembly_line/opv_machine_casing', item: 'gtnn:spintronic_mainframe', tag: '#gtceu:circuits/uxv' },
    { id: 'grindless:warp_gate/hold_sgr_a', item: 'gtnn:cosmic_mainframe', tag: '#gtceu:circuits/opv' },
    { id: 'grindless:assembly_line/plasma_mass_filter', item: 'gtnn:spintronic_mainframe', tag: '#gtceu:circuits/uxv' },
    { id: 'grindless:photonic_integration/horizon_processor', item: 'gtnn:supracausal_mainframe', tag: '#gtceu:circuits/max' }
  ]
  U.rows = ROWS

  ServerEvents.recipes(function (event) {
    ROWS.forEach(function (r) {
      event.replaceInput({ id: r.id }, r.item, r.tag)
    })
  })
})()
