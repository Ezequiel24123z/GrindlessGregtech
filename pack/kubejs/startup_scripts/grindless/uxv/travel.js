// priority: -10973
// UXV travel (package UXV-B1, docs/eras/uxv.md "B1. The Kerr sling"): the two tier-12 places the warp gate reaches from Cygnus X-1's orbit.
// No item is registered here: grindless:launched_relay_seed is UIV-B1's, cnt_whipple_shield and cnt_bumper_weave are F1's.
// The places are data (spike S0-3): data/grindless/dimension/<id>.json, data/grindless/gcyr/planets/<id>.json and
// assets/grindless/gcyr/planet_assets/sky_renderers/<id>.json. No rocket reaches a tier 12 place and no station is added.
// Published as global.grindless.uxvTravel for the recipe scripts and the tests. The dimension ids are final once shipped.
(function () {
  var G = global.grindless
  var T = G.uxvTravel || (G.uxvTravel = {})

  // key -> the place: dimension id (world and orbit are the same), warp gate circuit, the jump row's name and the star's temperature (K)
  T.places = {
    vela_pulsar: { dimension: 'grindless:vela_pulsar_orbit', circuit: 8, jump: 'hold_vela_pulsar', temperature: 1500000 },
    cas_a: { dimension: 'grindless:cas_a_remnant', circuit: 9, jump: 'hold_cas_a', temperature: 30000000 }
  }
  T.tier = 12
  T.source = 'grindless:cygnus_x1_orbit'
  T.ids = { launchedRelaySeed: 'grindless:launched_relay_seed', frcCartridge: 'grindless:frc_cartridge', whippleShield: 'grindless:cnt_whipple_shield', bumperWeave: 'grindless:cnt_bumper_weave' }
})()
