// -----------------------------------------------------------------------------------------------
// UHV travel (package UHV-B1, docs/eras/uhv.md "Bridges and first arrivals", "AE2"). The places: startup_scripts/grindless/uhv/travel.js.
//
//   The Mercury orbit seed, ZPM's pattern (chemical reactor 480 EU/t x 10 s, an ender pearl + 250 mB helium-3, only in the orbit):
//   the station's own route to IV's Hermean quantum seed (grindless:hermean_quantum_seed, the existing mercury pairTag, which
//   planets.json already gives Mercury orbit), with the swarm's first segment (grindless:swarm_segment, UHV-F1; made by B3's
//   foundry) as the catalyst, not used up. IV's explosion ritual (grindless:transform/hermean_entangled_singularity) turns either
//   route's seed into the far half of an Earth-Mercury pair, so no new item and no new pair: both of Mercury's places keep one tag.
//   The Proxima b pair is made only by the warp gate (package B7).
//
// Published for the tests: global.grindless.uhvTravel.recipes (spec), .done (recipe ids added).
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uhv] '
  var G = global.grindless
  var T = G.uhvTravel || (G.uhvTravel = {})
  var PLANETS = 'kubejs/data/grindless/tables/planets.json'
  var ids = (G.uhvFoundation && G.uhvFoundation.ids) || {}

  T.recipes = {
    seeds: [
      { planet: 'mercury', orbit: 'gcyr:mercury_orbit', seed: 'grindless:hermean_quantum_seed',
        catalyst: String(ids.swarmSegment || 'grindless:swarm_segment'),
        builderId: 'grindless:hermean_quantum_seed_orbit', id: 'grindless:chemical_reactor/hermean_quantum_seed_orbit',
        pair: 'grindless:transform/hermean_entangled_singularity' }
    ],
    seed: {
      helium3: 'gtceu:helium_3',
      helium3Amount: 250,
      eut: 480,
      duration: 200
    }
  }

  function missingItems(list) {
    return list.filter(function (id) { return id.charAt(0) !== '#' && !Item.exists(id) })
  }

  function addSeeds(event) {
    var S = T.recipes.seed
    var table = G.readJsonTable(PLANETS)
    var planets = table && table.planets ? table.planets : {}
    var added = []
    T.recipes.seeds.forEach(function (s) {
      var def = planets[s.planet]
      if (!def || !def.pairTag || !def.dimensions || def.dimensions.indexOf(s.orbit) < 0) {
        console.error(LOG + s.planet + ' orbit seed skipped: planets.json has no ' + s.planet + ' pairTag or no ' + s.orbit)
        return
      }
      var missing = missingItems([s.seed, s.catalyst, 'minecraft:ender_pearl'])
      if (!Fluid.exists(S.helium3)) missing.push(S.helium3)
      if (missing.length > 0) {
        console.error(LOG + s.planet + ' orbit seed skipped, unknown: ' + missing.join(', '))
        return
      }
      event.recipes.gtceu.chemical_reactor(s.builderId)
        .itemInputs('#forge:ender_pearls')
        .notConsumable(s.catalyst)
        .inputFluids(Fluid.of(S.helium3, S.helium3Amount))
        .itemOutputs(s.seed)
        .dimension(s.orbit)
        .EUt(S.eut)
        .duration(S.duration)
      added.push(s.id)
    })
    return added
  }

  // an uncaught error here would stop the recipe handlers of every script that loads after this one
  ServerEvents.recipes(function (event) {
    var done = []
    try {
      done = done.concat(addSeeds(event))
    } catch (e) {
      console.error(LOG + 'travel: Mercury orbit seed failed: ' + e)
    }
    T.done = done
    console.info(LOG + 'travel: ' + done.join(', '))
  })
})()
