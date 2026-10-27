// priority: -18924
// -----------------------------------------------------------------------------------------------
// LuV travel, bridges and first landings (package LuV-B1, docs/eras/luv.md "Cryogenic fuel tank", "Bridges and first landings" and
// "AE2 between planets: the LuV step"). Registrations and the level 4 rocket: startup_scripts/grindless/luv/travel.js.
//
//   grindless:assembler/cryogenic_fuel_tank   LuV assembler, 30,720 EU/t x 400 t: GCYR's elite fuel tank + 6 HSS-S plates + 8 Kapton K
//                                             plates + a LuV electric pump, the Outer System Chart as a catalyst -> 1 cryogenic tank
//   grindless:assembler/station_truss_casing  EV assembler, 1,920 EU/t x 100 t: a titanium frame + 4 aluminium plates -> 2 casings
//                                             (the orbital machines' casing: B2, B3, B4)
//   The far halves of the Earth-Io, Earth-Europa and Earth-Ganymede AE2 pairs, made only there (the IV travel network's rule:
//   chemical reactor 480 EU/t x 10 s, the local material + an ender pearl + 250 mB helium-3, with the place's dimension condition from
//   tables/places.json), and AE2's explosion ritual that marks the pair with planets.json's pairTag. Io's pair also works in Io orbit
//   (planets.json lists io_orbit under io). The belt's seed is the belt package's (B5, luv/asteroid_belt.js); Jupiter keeps no pair.
//     grindless:ionian_quantum_seed       Biomes O' Plenty brimstone, on Io
//     grindless:europan_quantum_seed      blue ice, on Europa
//     grindless:ganymedean_quantum_seed   tuff, on Ganymede
//
// Published for the tests: global.grindless.luvTravel.recipes (spec), .done (recipe ids added).
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/luv] '
  var G = global.grindless
  var T = G.luvTravel || (G.luvTravel = {})
  var PLANETS = 'kubejs/data/grindless/tables/planets.json'

  T.recipes = {
    tank: {
      builderId: 'grindless:cryogenic_fuel_tank',
      id: 'grindless:assembler/cryogenic_fuel_tank',
      itemsIn: [{ id: 'gcyr:elite_fuel_tank', n: 1 }, { id: '#forge:plates/hsss', n: 6, sample: 'gtceu:hsss_plate' },
        { id: '#forge:plates/kapton_k', n: 8, sample: 'gcyr:kapton_k_plate' }, { id: 'gtceu:luv_electric_pump', n: 1 }],
      catalyst: 'grindless:outer_system_chart',
      out: 'grindless:cryogenic_fuel_tank',
      eut: 30720,
      duration: 400
    },
    truss: {
      builderId: 'grindless:station_truss_casing',
      id: 'grindless:assembler/station_truss_casing',
      itemsIn: [{ id: '#forge:frames/titanium', n: 1, sample: 'gtceu:titanium_frame' },
        { id: '#forge:plates/aluminium', n: 4, sample: 'gtceu:aluminium_plate' }],
      out: 'grindless:station_truss_casing',
      count: 2,
      eut: 1920,
      duration: 100
    },
    seeds: [
      { planet: 'io', place: 'io', seed: 'grindless:ionian_quantum_seed', local: 'biomesoplenty:brimstone',
        builderId: 'grindless:ionian_quantum_seed', id: 'grindless:chemical_reactor/ionian_quantum_seed',
        pair: 'grindless:transform/ionian_entangled_singularity' },
      { planet: 'europa', place: 'europa', seed: 'grindless:europan_quantum_seed', local: 'minecraft:blue_ice',
        builderId: 'grindless:europan_quantum_seed', id: 'grindless:chemical_reactor/europan_quantum_seed',
        pair: 'grindless:transform/europan_entangled_singularity' },
      { planet: 'ganymede', place: 'ganymede', seed: 'grindless:ganymedean_quantum_seed', local: 'minecraft:tuff',
        builderId: 'grindless:ganymedean_quantum_seed', id: 'grindless:chemical_reactor/ganymedean_quantum_seed',
        pair: 'grindless:transform/ganymedean_entangled_singularity' }
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

  function missingItems(ids) {
    return ids.filter(function (id) { return id.charAt(0) !== '#' && !Item.exists(id) })
  }

  function samples(list) {
    return list.map(function (e) { return e.sample || e.id })
  }

  function addTank(event) {
    var R = T.recipes.tank
    var missing = missingItems(samples(R.itemsIn).concat([R.catalyst, R.out]))
    if (missing.length > 0) {
      console.error(LOG + 'cryogenic fuel tank recipe skipped, unknown item(s): ' + missing.join(', '))
      return null
    }
    var recipe = event.recipes.gtceu.assembler(R.builderId)
    R.itemsIn.forEach(function (e) { recipe.itemInputs(e.n + 'x ' + e.id) })
    recipe.notConsumable(R.catalyst)
      .itemOutputs('1x ' + R.out)
      .EUt(R.eut)
      .duration(R.duration)
    return R.id
  }

  function addTruss(event) {
    var R = T.recipes.truss
    var missing = missingItems(samples(R.itemsIn).concat([R.out]))
    if (missing.length > 0) {
      console.error(LOG + 'station truss casing recipe skipped, unknown item(s): ' + missing.join(', '))
      return null
    }
    var recipe = event.recipes.gtceu.assembler(R.builderId)
    R.itemsIn.forEach(function (e) { recipe.itemInputs(e.n + 'x ' + e.id) })
    recipe.itemOutputs(R.count + 'x ' + R.out)
      .EUt(R.eut)
      .duration(R.duration)
    return R.id
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
      var missing = missingItems([s.seed, s.local, S.singularity, S.entangled, 'minecraft:ender_pearl'])
      if (!Fluid.exists(S.helium3)) missing.push(S.helium3)
      if (missing.length > 0) {
        console.error(LOG + 'Earth-' + s.planet + ' pair skipped, unknown: ' + missing.join(', '))
        return
      }
      G.places.allow(event.recipes.gtceu.chemical_reactor(s.builderId)
        .itemInputs(s.local, '#forge:ender_pearls')
        .inputFluids(Fluid.of(S.helium3, S.helium3Amount))
        .itemOutputs(s.seed), s.place)
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
    var steps = [['tank', addTank], ['truss', addTruss]]
    steps.forEach(function (step) {
      try {
        var id = step[1](event)
        if (id) done.push(id)
      } catch (e) {
        console.error(LOG + 'travel: ' + step[0] + ' recipe failed: ' + e)
      }
    })
    try {
      done = done.concat(addSeeds(event))
    } catch (e2) {
      console.error(LOG + 'travel: AE2 pairs failed: ' + e2)
    }
    T.done = done
    console.info(LOG + 'travel: ' + done.join(', '))
  })
})()
