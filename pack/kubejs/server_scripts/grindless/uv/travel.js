// priority: -26054
// -----------------------------------------------------------------------------------------------
// UV travel (package UV-B1, docs/eras/uv.md "Bridges and first arrivals", "AE2").
// Registrations and the rocket rule: startup_scripts/grindless/uv/travel.js.
//
//   The far halves of the Earth-Neptune and Earth-Pluto AE2 pairs, made only in those orbits (ZPM's rule: chemical reactor 480 EU/t x 10 s,
//   an ender pearl + 250 mB helium-3, with the orbit's dimension condition), each with the place's first automated product as the
//   catalyst, so a pair follows the first siphon or penetrator run; then AE2's explosion ritual marks the pair with planets.json's pairTag.
//     grindless:neptunian_quantum_seed    1,000 mB Neptune helium (not consumed; the deep siphon's), in Neptune orbit
//     grindless:plutonian_quantum_seed    a Sputnik ice core (not consumed; the penetrator's), in Pluto orbit
//
// Published for the tests: global.grindless.uvTravel.recipes (spec), .done (recipe ids added).
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uv] '
  var G = global.grindless
  var T = G.uvTravel || (G.uvTravel = {})
  var PLANETS = 'kubejs/data/grindless/tables/planets.json'
  var ids = (G.uvFoundation && G.uvFoundation.ids) || {}

  T.recipes = {
    seeds: [
      { planet: 'neptune', orbit: 'grindless:neptune_orbit', seed: 'grindless:neptunian_quantum_seed',
        catalystFluid: String(ids.neptuneHelium || 'gtceu:neptune_helium'), catalystAmount: 1000,
        builderId: 'grindless:neptunian_quantum_seed', id: 'grindless:chemical_reactor/neptunian_quantum_seed',
        pair: 'grindless:transform/neptunian_entangled_singularity' },
      { planet: 'pluto', orbit: 'grindless:pluto_orbit', seed: 'grindless:plutonian_quantum_seed',
        catalyst: String(ids.sputnikIceCore || 'grindless:sputnik_ice_core'),
        builderId: 'grindless:plutonian_quantum_seed', id: 'grindless:chemical_reactor/plutonian_quantum_seed',
        pair: 'grindless:transform/plutonian_entangled_singularity' }
    ],
    seed: {
      helium3: 'gtceu:helium_3',
      helium3Amount: 250,
      eut: 480,
      duration: 200,
      singularity: 'ae2:singularity',
      entangled: 'ae2:quantum_entangled_singularity',
      nbtKey: 'grindless_planet'
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
      if (!def || !def.pairTag) {
        console.error(LOG + 'Earth-' + s.planet + ' pair skipped: planets.json has no ' + s.planet + ' pairTag')
        return
      }
      var items = [s.seed, S.singularity, S.entangled, 'minecraft:ender_pearl']
      if (s.catalyst) items.push(s.catalyst)
      var missing = missingItems(items)
      if (!Fluid.exists(S.helium3)) missing.push(S.helium3)
      if (s.catalystFluid && !Fluid.exists(s.catalystFluid)) missing.push(s.catalystFluid)
      if (missing.length > 0) {
        console.error(LOG + 'Earth-' + s.planet + ' pair skipped, unknown: ' + missing.join(', '))
        return
      }
      var recipe = event.recipes.gtceu.chemical_reactor(s.builderId)
        .itemInputs('#forge:ender_pearls')
        .inputFluids(Fluid.of(S.helium3, S.helium3Amount))
      if (s.catalyst) recipe.notConsumable(s.catalyst)
      if (s.catalystFluid) recipe.notConsumableFluid(Fluid.of(s.catalystFluid, s.catalystAmount))
      recipe.itemOutputs(s.seed)
        .dimension(s.orbit)
        .EUt(S.eut)
        .duration(S.duration)

      var nbt = {}
      nbt[S.nbtKey] = def.pairTag
      event.custom({
        type: 'ae2:transform',
        circumstance: { type: 'explosion' },
        ingredients: [{ item: S.singularity }, { item: s.seed }],
        result: { item: S.entangled, count: 2, nbt: nbt }
      }).id(s.pair)
      added.push(s.id, s.pair)
    })
    return added
  }

  // an uncaught error here would stop the recipe handlers of every script that loads after this one
  ServerEvents.recipes(function (event) {
    var done = []
    try {
      done = done.concat(addSeeds(event))
    } catch (e) {
      console.error(LOG + 'travel: AE2 pairs failed: ' + e)
    }
    T.done = done
    console.info(LOG + 'travel: ' + done.join(', '))
  })
})()
