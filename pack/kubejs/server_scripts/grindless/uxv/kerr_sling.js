// priority: -26180
// UXV-B1, the Kerr sling (docs/eras/uxv.md "B1. The Kerr sling"). Two parts:
//
//   1. The Whipple shield, the jump item of c9: an assembly line row (never crafting) that fits a bumper weave and a RHEA plate on a Whipple shield
//      casing. It is a part, so it needs no research.
//   2. The arrival platforms of the c8 and c9 jumps from Cygnus X-1's orbit (rows of tables/relay_platforms.json with a "source"). Since AF-1
//      (issue #203) they are placed by the shared placer, server_scripts/grindless/lib/relay_platforms.js, like every other row (mark
//      uxvPlatform_<place>); K.placed is that placer's map, kept here for the tests.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var G = global.grindless || (global.grindless = {})
  var LOG = '[grindless/uxv] '
  var K = G.uxvKerrSling || (G.uxvKerrSling = {})
  var R = G.relayPlatforms || (G.relayPlatforms = {})
  R.placed = R.placed || {}
  K.placed = R.placed
  K.skipped = K.skipped || []

  // ------------------------------------------------------------ the Whipple shield

  var SHIELD_PARTS = ['grindless:whipple_shield_casing', 'gtceu:rhea_plate', 'grindless:cnt_bumper_weave', 'grindless:cnt_whipple_shield']

  global.grindless.recipes('uxv/kerr_sling', function (event) {
    var missing = SHIELD_PARTS.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      K.skipped.push({ name: 'whipple_shield', reason: 'unknown id(s) ' + missing.join(', ') })
      console.error(LOG + 'whipple shield skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    var b = event.recipes.gtceu.assembly_line('grindless:whipple_shield')
    b.itemInputs('grindless:whipple_shield_casing')
    b.itemInputs('2x gtceu:rhea_plate')
    b.itemInputs('4x grindless:cnt_bumper_weave')
    b.inputFluids(Fluid.of('gtceu:soldering_alloy', 144))
    b.itemOutputs('grindless:cnt_whipple_shield')
    b.EUt(1966080).duration(600)
  })
})()
