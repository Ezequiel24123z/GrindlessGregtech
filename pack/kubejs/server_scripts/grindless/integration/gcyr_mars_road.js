// -----------------------------------------------------------------------------------------------
// The road to Mars, GCYR side (docs/eras/ev.md, "Mars, end of EV"): the parts of the tier 2 rocket, remade in EV with titanium.
//
// GCYR 0.2.9 works a rocket's tier out as (average motor tier + average tank tier) / 2 (integer division, RocketEntity#addBlock) and
// refuses a destination whose rocket_tier is higher (RocketEntity#startRocket). Mars is rocket_tier 2, so it needs advanced motors AND
// advanced tanks (tier 2 each; one basic part among them drops the rocket back to tier 1). GCYR assembles both at IV (7 680 EU/t) with
// tungsten steel drums and frames, and tungsten only comes from Mars: the trip would be impossible. They are remade in EV:
//
//   gcyr:advanced_fuel_tank     ASSEMBLER (1 920 EU/t, 300 t): 2 titanium drums + 6 Kapton K plates + 1 titanium frame, with the Mars
//                               Transfer Chart as catalyst (not used up)                         [GCYR: tungsten steel drums and frame, IV]
//   gcyr:advanced_rocket_motor  ASSEMBLER (1 920 EU/t, 300 t): 4 advanced power thrusters (GTM's, an HV motor each) + 6 Kapton K
//                               plates + 1 titanium frame, with the Mars Transfer Chart as catalyst [GCYR: tungsten steel frame, IV]
//
// The chart (grindless:mars_chart) is written by the deep space antenna on the far side of the Moon: the route to Mars has to be found
// before its rocket can be built. The titanium is lunar (DECISIONS.md 2026-10-24). An advanced tank holds 7 B, so two of them carry the
// 14 B a trip inside the solar system asks for (GCYR's solarSystemFuelAmount, from Earth or from the Moon alike); any rocket fuel works
// (GCYR's fuel recipes are all below the advanced motor's tier). The way back is the first-visit waystone.
//
// Venus and Mercury go up to rocket_tier 3 (data/gcyr/gcyr/planets/venus.json and mercury.json, GCYR's own files with that one value
// changed): otherwise this rocket would reach them, and only their heat would stop the player. Tier 3 asks for elite motors and tanks
// (IV and later). Proxima Centauri b is already rocket_tier 3 in GCYR.
//
// integration/gcyr.js (scanner, space fabric, fiberglass and suit at HV) and integration/gcyr_launch_road.js (the basic motor, tank and
// chip of the first rocket) are not touched; the elite parts stay as GCYR has them (later eras).
//
// Era: EV. Rhino: var + function inside callbacks that run more than once.
(function () {
  var LOG = '[grindless/gcyr_mars_road] '

  var CHART = 'grindless:mars_chart'
  var TANK = 'gcyr:advanced_fuel_tank'
  var MOTOR = 'gcyr:advanced_rocket_motor'
  var EV_EUT = 1920

  // GCYR recipe id -> the recipe that replaces it (published for tools/test and the audit)
  var REPLACED = {
    'gcyr:assembler/advanced_fuel_tank': 'grindless:assembler/gcyr/advanced_fuel_tank',
    'gcyr:assembler/advanced_rocket_motor': 'grindless:assembler/gcyr/advanced_rocket_motor'
  }

  var G = global.grindless || (global.grindless = {})
  var MR = G.marsRoad || (G.marsRoad = {})
  MR.gcyr = { replaced: REPLACED, chart: CHART, done: [] }
  MR.recipes = {
    tank: {
      gcyrId: 'gcyr:assembler/advanced_fuel_tank',
      id: REPLACED['gcyr:assembler/advanced_fuel_tank'],
      builderId: 'grindless:gcyr/advanced_fuel_tank',
      itemsIn: [{ id: 'gtceu:titanium_drum', n: 2 }, { id: '#forge:plates/kapton_k', n: 6, sample: 'gcyr:kapton_k_plate' },
        { id: '#forge:frames/titanium', n: 1, sample: 'gtceu:titanium_frame' }],
      catalyst: CHART,
      itemsOut: [{ id: TANK, n: 1 }],
      eut: EV_EUT,
      duration: 300
    },
    motor: {
      gcyrId: 'gcyr:assembler/advanced_rocket_motor',
      id: REPLACED['gcyr:assembler/advanced_rocket_motor'],
      builderId: 'grindless:gcyr/advanced_rocket_motor',
      itemsIn: [{ id: 'gtceu:advanced_power_thruster', n: 4 }, { id: '#forge:plates/kapton_k', n: 6, sample: 'gcyr:kapton_k_plate' },
        { id: '#forge:frames/titanium', n: 1, sample: 'gtceu:titanium_frame' }],
      catalyst: CHART,
      itemsOut: [{ id: MOTOR, n: 1 }],
      eut: EV_EUT,
      duration: 300
    }
  }

  function missingItems(ids) {
    return ids.filter(function (id) { return !Item.exists(id) })
  }

  function samples(list) {
    return list.map(function (e) { return e.sample || e.id })
  }

  // one advanced part: GCYR's IV recipe goes, ours comes; with anything missing GCYR's recipe stays
  function addPart(event, spec) {
    var missing = missingItems(samples(spec.itemsIn).concat([spec.catalyst], samples(spec.itemsOut)))
    if (missing.length > 0) {
      console.error(LOG + spec.itemsOut[0].id + ' left as GCYR has it, unknown item(s): ' + missing.join(', '))
      return false
    }
    event.remove({ id: spec.gcyrId })
    var recipe = event.recipes.gtceu.assembler(spec.builderId)
    spec.itemsIn.forEach(function (e) { recipe.itemInputs(e.n + 'x ' + e.id) })
    recipe.notConsumable(spec.catalyst)
    spec.itemsOut.forEach(function (e) { recipe.itemOutputs(e.n + 'x ' + e.id) })
    recipe.EUt(spec.eut).duration(spec.duration)
    return true
  }

  // an uncaught error here would stop the recipe handlers of every script that loads after this one
  ServerEvents.recipes(function (event) {
    var done = []
    ;['tank', 'motor'].forEach(function (key) {
      try {
        if (addPart(event, MR.recipes[key])) done.push(MR.recipes[key].itemsOut[0].id)
      } catch (e) {
        console.error(LOG + key + ' recipe failed: ' + e)
      }
    })
    MR.gcyr.done = done
    console.info(LOG + 'tier 2 rocket parts in EV with titanium and the Mars chart: ' + (done.length > 0 ? done.join(', ') : 'none'))
  })
})()
