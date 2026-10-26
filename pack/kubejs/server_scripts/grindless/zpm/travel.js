// -----------------------------------------------------------------------------------------------
// ZPM travel (package ZPM-B1, docs/eras/zpm.md "Route" 6, "Saturn, Uranus and what is only seen", "Bridges and first arrivals").
// Registrations and the rocket rule: startup_scripts/grindless/zpm/travel.js.
//
//   grindless:assembler/naquadah_fuel_tank   ZPM assembler, 122,880 EU/t x 400 t: the cryogenic tank + 8 naquadah plates + a ZPM electric
//                                            pump, the Saturn transfer chart as the catalyst -> 1 naquadah tank
//   grindless:assembler/aerogel_fuel_tank    ZPM assembler, 122,880 EU/t x 600 t: the naquadah tank + 8 silica aerogel + 4 carbon nanotube yarn
//                                            + a ZPM electric pump, the Uranus transfer chart as the catalyst -> 1 aerogel tank
//   The far halves of the Earth-Saturn and Earth-Uranus AE2 pairs, made only in those orbits (LuV's rule: chemical reactor 480 EU/t x 10 s,
//   the local input + an ender pearl + 250 mB helium-3, with the orbit's dimension condition), and AE2's explosion ritual that marks the
//   pair with planets.json's pairTag.
//     grindless:saturnian_quantum_seed    a ring ice sample, in Saturn orbit
//     grindless:uranian_quantum_seed      an ice-giant atmosphere sample, in Uranus orbit
//
// Published for the tests: global.grindless.zpmTravel.recipes (spec), .done (recipe ids added).
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/zpm] '
  var G = global.grindless
  var T = G.zpmTravel || (G.zpmTravel = {})
  var PLANETS = 'kubejs/data/grindless/tables/planets.json'

  T.recipes = {
    tanks: [
      {
        builderId: 'grindless:naquadah_fuel_tank',
        id: 'grindless:assembler/naquadah_fuel_tank',
        itemsIn: [{ id: 'grindless:cryogenic_fuel_tank', n: 1 }, { id: '#forge:plates/naquadah', n: 8, sample: 'gtceu:naquadah_plate' },
          { id: 'gtceu:zpm_electric_pump', n: 1 }],
        catalyst: 'grindless:saturn_transfer_chart',
        out: 'grindless:naquadah_fuel_tank',
        eut: 122880,
        duration: 400
      },
      {
        builderId: 'grindless:aerogel_fuel_tank',
        id: 'grindless:assembler/aerogel_fuel_tank',
        itemsIn: [{ id: 'grindless:naquadah_fuel_tank', n: 1 }, { id: 'grindless:silica_aerogel', n: 8 },
          { id: 'grindless:carbon_nanotube_yarn', n: 4 }, { id: 'gtceu:zpm_electric_pump', n: 1 }],
        catalyst: 'grindless:uranus_transfer_chart',
        out: 'grindless:aerogel_fuel_tank',
        eut: 122880,
        duration: 600
      }
    ],
    seeds: [
      { planet: 'saturn', orbit: 'grindless:saturn_orbit', seed: 'grindless:saturnian_quantum_seed', local: 'grindless:ring_ice_sample',
        builderId: 'grindless:saturnian_quantum_seed', id: 'grindless:chemical_reactor/saturnian_quantum_seed',
        pair: 'grindless:transform/saturnian_entangled_singularity' },
      { planet: 'uranus', orbit: 'grindless:uranus_orbit', seed: 'grindless:uranian_quantum_seed', local: 'grindless:ice_giant_atmosphere_sample',
        builderId: 'grindless:uranian_quantum_seed', id: 'grindless:chemical_reactor/uranian_quantum_seed',
        pair: 'grindless:transform/uranian_entangled_singularity' }
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

  function addTanks(event) {
    var added = []
    T.recipes.tanks.forEach(function (R) {
      var ids = R.itemsIn.map(function (e) { return e.sample || e.id }).concat([R.catalyst, R.out])
      var missing = missingItems(ids)
      if (missing.length > 0) {
        console.error(LOG + R.id + ' skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      var recipe = event.recipes.gtceu.assembler(R.builderId)
      R.itemsIn.forEach(function (e) { recipe.itemInputs(e.n + 'x ' + e.id) })
      recipe.notConsumable(R.catalyst)
        .itemOutputs('1x ' + R.out)
        .EUt(R.eut)
        .duration(R.duration)
      added.push(R.id)
    })
    return added
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
      event.recipes.gtceu.chemical_reactor(s.builderId)
        .itemInputs(s.local, '#forge:ender_pearls')
        .inputFluids(Fluid.of(S.helium3, S.helium3Amount))
        .itemOutputs(s.seed)
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
      done = done.concat(addTanks(event))
    } catch (e) {
      console.error(LOG + 'travel: tank recipes failed: ' + e)
    }
    try {
      done = done.concat(addSeeds(event))
    } catch (e2) {
      console.error(LOG + 'travel: AE2 pairs failed: ' + e2)
    }
    T.done = done
    console.info(LOG + 'travel: ' + done.join(', '))
  })
})()
