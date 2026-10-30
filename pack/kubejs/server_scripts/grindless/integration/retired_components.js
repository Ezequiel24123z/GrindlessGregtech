// priority: -15774
// Tier parity (docs/research/tier-parity.md, TP-D2): our UEV, UIV and UXV components (grindless:<tier>_<family>, registered by
// startup_scripts/grindless/{uev,uiv,uxv}/foundation.js) are retired in favour of GTM's own gtceu:<tier>_<family> (gtceu.yaml
// highTierContent: true). Every recipe makes and takes the gtceu id. The old item stays registered for saves, is hidden from EMI's index
// (tools/analysis/tiers/obtain.json, a keepRecipes rule) and crafts 1:1 into the new one here.
(function () {
  var TIERS = ['uev', 'uiv', 'uxv']
  var FAMILIES = ['electric_motor', 'electric_pump', 'conveyor_module', 'electric_piston', 'robot_arm', 'field_generator', 'emitter', 'sensor']

  ServerEvents.recipes(function (event) {
    var made = 0
    TIERS.forEach(function (t) {
      FAMILIES.forEach(function (f) {
        var old = 'grindless:' + t + '_' + f
        var now = 'gtceu:' + t + '_' + f
        if (!Item.exists(old) || !Item.exists(now)) {
          console.error('[grindless/tp] retired component conversion skipped, unknown item: ' + (Item.exists(old) ? now : old))
          return
        }
        event.shapeless(now, [old]).id('grindless:crafting/retired/' + t + '_' + f)
        made++
      })
    })
    console.info('[grindless/tp] retired component conversions: ' + made)
  })
})()
