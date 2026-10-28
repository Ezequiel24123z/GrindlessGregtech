// priority: -9256
// -----------------------------------------------------------------------------------------------
// UIV travel (package UIV-B1, docs/eras/uiv.md "B1. Travel: the relay seed, the jump and the platforms").
//
// Registered here, three items (textures: tools/assets/Build-UIVTravelTextures.ps1; names: client_scripts/grindless/uiv_travel_lang.js):
//   grindless:relay_seed          a starchip with a sealed degenerate pellet and an exotic-matter cell (starchip fab, circuit 3)
//   grindless:launched_relay_seed the seed after the laser sail launcher threw it from the Moon at about 0.2 c (launcher, circuit 2)
//   grindless:ergosphere_probe    a rad-hard starchip for Cygnus X-1 (starchip fab, circuit 4); read by UIV-B4
// Their recipes are three rows appended to server_scripts/grindless/uv/starshot.js; the warp gate rows (circuits 4 to 6) are in
// data/grindless/tables/gate.json and the arrival platforms in data/grindless/tables/relay_platforms.json.
//
// The places are data (spike S0-3, proven under s0_ ids): data/grindless/dimension/<id>.json, data/grindless/gcyr/planets/<id>.json and
// assets/grindless/gcyr/planet_assets/sky_renderers/<id>.json. No rocket reaches a tier 11 place and no station is added.
// Published as global.grindless.uivTravel for the recipe scripts and the tests. The dimension ids are final once shipped.
(function () {
  var G = global.grindless
  var T = G.uivTravel || (G.uivTravel = {})

  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  var ITEMS = {
    relay_seed: { stack: 16 },
    launched_relay_seed: { stack: 16 },
    ergosphere_probe: { stack: 16 }
  }
  T.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })
  T.ids = { relaySeed: 'grindless:relay_seed', launchedRelaySeed: 'grindless:launched_relay_seed', ergosphereProbe: 'grindless:ergosphere_probe' }

  // key -> the place: dimension id (world and orbit are the same), planets.json key, warp gate circuit and the platform's name, then the
  // temperature of the star (K) the planet file carries
  T.places = {
    rx_j1856: { dimension: 'grindless:rx_j1856_orbit', pairTag: 'rx_j1856', circuit: 4, temperature: 700000 },
    psr_j0437: { dimension: 'grindless:psr_j0437_orbit', pairTag: 'psr_j0437', circuit: 5, temperature: 3000000 },
    cygnus_x1: { dimension: 'grindless:cygnus_x1_orbit', pairTag: 'cygnus_x1', circuit: 6, temperature: 10000000 }
  }
  T.tier = 11

  StartupEvents.registry('item', function (event) {
    Object.keys(ITEMS).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(ITEMS[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })
})()
