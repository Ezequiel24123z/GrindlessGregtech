// priority: -17024
// -----------------------------------------------------------------------------------------------
// IV travel and network (docs/eras/iv.md, "Route" steps 5-7, "Venus and Mercury", "On-site power", "AE2 between planets: the IV step" and
// decision 10 of "Decisions taken with the raise"; package IV-B5). Registrations: startup_scripts/grindless/iv/travel_network.js.
//
// The tier 3 rocket. GCYR 0.2.9 works a rocket's tier out as floor((average motor tier + average tank tier) / 2) and refuses a destination
// with a higher rocket_tier; Venus and Mercury are rocket_tier 3 in this pack (data/gcyr/gcyr/planets/), so every motor and every tank must
// be elite. GCYR only makes its elite parts in the ZPM assembler (122,880 EU/t: ZPM quantum tanks, gravitation engines, naquadah alloy):
// both are remade by id in the IV assembler, with tungsten steel (Mars) and the inner planets chart as a catalyst, as EV remade the
// advanced ones with titanium and the Mars chart (integration/gcyr_mars_road.js):
//   gcyr:elite_fuel_tank     ASSEMBLER 7,680 EU/t, 300 t: 2 tungsten steel drums + 6 Kapton K plates + 1 tungsten steel frame, the chart
//                            not used up                                                   [GCYR: 2 ZPM quantum tanks, naquadah alloy]
//   gcyr:elite_rocket_motor  ASSEMBLER 7,680 EU/t, 300 t: 2 IV electric pumps (the turbopumps) + 4 advanced power thrusters + 6 Kapton K
//                            plates + 1 tungsten steel frame, the chart not used up     [GCYR: 4 gravitation engines, naquadah alloy]
// An elite tank holds 12,000 mB and a trip inside the solar system takes 14,000 (GCYR's solarSystemFuelAmount; the pack ships no GCYR
// config, so the default holds): the Venus and Mercury rocket needs two elite tanks. GCYR sums the capacity of every tank in the rocket.
// GCYR's KubeJS rocket_motor builder makes a fuel tank (a GCYR 0.2.9 bug), so no part of our own is registered.
//
// Proxima Centauri b is rocket_tier 3 in GCYR and 26,000 mB away (galaxyFuelAmount): three elite tanks would take an IV rocket there, and
// the journey reaches it in UHV through gates (docs/journey.md). data/gcyr/gcyr/planets/proxima_centauri_b.json (GCYR's own file with only
// rocket_tier changed, to 5 since LuV-B1: the cryogenic tank makes level 4 rockets, and nothing reaches tier 5) keeps it out of reach.
//
// The thermal suit upgrade. GCYR's thermal upgrade template (the smithing template that adds a heat-shielding or insulating fabric to a
// suit piece; Venus at 737 K and Mercury at 440 K burn an unshielded suit) is remade by id with iv.md's ingredients:
//   gcyr:space_suit_thermal_upgrade_smithing_template  ASSEMBLER 7,680 EU/t, 50 t: 3 heat shielding fabrics + 3 insulating fabrics (PBI)
//                            + 2 titanium plates + 2 Kapton K plates                            [GCYR: the same with 2 Kapton K foils]
// GCYR's IV oxygen spreader (gcyr:iv_oxygen_spreader) keeps GTM's shaped recipe (IV hull, 4 IV electric pumps, 2 fluid filters, 2 IV
// circuits): every part is pre-Mercury IV, so the bases get it (the smoke test checks the recipe is there).
//
// The inner planets chart. The deep space antenna's IV recipe (its own type, gtceu:deep_space_tracking; the antenna's EV code is not
// touched): on the Moon at night, the Mars Transfer Chart (not used up, it calibrates the dish) + 1 data stick -> 1 Inner Planets Chart,
// 7,680 EU/t (an IV energy hatch, or two EV ones), 600 t. Chart + data stick -> 2 charts by hand, the observatory family's rule.
//
// The RTG cell. gtceu:radioisotope_decay: 1 RTG pellet as a chanced input (100 of 10,000) -> 2,048 EU/t for 720 t: one pellet per 100
// runs, one per hour of running, 147,456,000 EU per pellet. The cell itself: EV assembler, 1,920 EU/t, 400 t: EV hull + 2 dense lead
// plates (the shield) + 4 titanium plates (the radiator fins) + 8 nichrome and 8 cupronickel wires (a chromel-constantan thermopile)
// + 2 EV circuits. Every part is EV: the cell is simple, its plutonium is IV.
//
// AE2, the IV step. Earth-Venus and Earth-Mercury pairs like the Mars one (ev/ae2_interplanetary.js): the far half is made on that planet
// (chemical reactor with its dimension condition, the first dimension of planets.json's entry), from the planet's own material, an ender
// pearl and helium-3 at the lunar seed's HV numbers, and AE2's explosion ritual marks the pair with planets.json's pairTag, which the
// quantum link chambers there keep (moon/quantum_bridge.js). Power crosses as EU over eup2p's EU P2P tunnels: the tunnel has no cap of its
// own, so 16 A IV hatches at both ends carry the reactor's 131,072 EU/t; no recipe of ours, and no laser tunnel in IV.
//
// Published for the smoke test: global.grindless.travelNetwork.recipes (final ids), .replaced (GCYR id -> ours), .done (what was added).
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/iv] '
  var CURIUM_RTG_PELLET = 'grindless:curium_rtg_pellet'
  var G = global.grindless || (global.grindless = {})
  var TN = G.travelNetwork || (G.travelNetwork = {})
  var PLANETS = 'kubejs/data/grindless/tables/planets.json'
  var PAIR_NBT_KEY = 'grindless_planet'
  var IV_EUT = 7680

  var CHART = 'grindless:inner_planets_chart'
  var MARS_CHART = 'grindless:mars_chart'
  var STICK = 'gtceu:data_stick'
  var SKY_KEY = 'grindless_sky'

  var REPLACED = {
    'gcyr:assembler/elite_fuel_tank': 'grindless:assembler/gcyr/elite_fuel_tank',
    'gcyr:assembler/elite_rocket_motor': 'grindless:assembler/gcyr/elite_rocket_motor',
    'gcyr:assembler/space_suit_thermal_upgrade_smithing_template': 'grindless:assembler/gcyr/space_suit_thermal_upgrade_smithing_template'
  }
  TN.replaced = REPLACED

  // the GCYR parts and the template, remade by id (item lists in the order the recipe takes them)
  TN.parts = {
    tank: {
      gcyrId: 'gcyr:assembler/elite_fuel_tank',
      id: REPLACED['gcyr:assembler/elite_fuel_tank'],
      builderId: 'grindless:gcyr/elite_fuel_tank',
      itemsIn: [{ id: 'gtceu:tungsten_steel_drum', n: 2 }, { id: '#forge:plates/kapton_k', n: 6, sample: 'gcyr:kapton_k_plate' },
        { id: '#forge:frames/tungsten_steel', n: 1, sample: 'gtceu:tungsten_steel_frame' }],
      catalyst: CHART,
      itemsOut: [{ id: 'gcyr:elite_fuel_tank', n: 1 }],
      eut: IV_EUT,
      duration: 300
    },
    motor: {
      gcyrId: 'gcyr:assembler/elite_rocket_motor',
      id: REPLACED['gcyr:assembler/elite_rocket_motor'],
      builderId: 'grindless:gcyr/elite_rocket_motor',
      itemsIn: [{ id: 'gtceu:iv_electric_pump', n: 2 }, { id: 'gtceu:advanced_power_thruster', n: 4 },
        { id: '#forge:plates/kapton_k', n: 6, sample: 'gcyr:kapton_k_plate' },
        { id: '#forge:frames/tungsten_steel', n: 1, sample: 'gtceu:tungsten_steel_frame' }],
      catalyst: CHART,
      itemsOut: [{ id: 'gcyr:elite_rocket_motor', n: 1 }],
      eut: IV_EUT,
      duration: 300
    },
    template: {
      gcyrId: 'gcyr:assembler/space_suit_thermal_upgrade_smithing_template',
      id: REPLACED['gcyr:assembler/space_suit_thermal_upgrade_smithing_template'],
      builderId: 'grindless:gcyr/space_suit_thermal_upgrade_smithing_template',
      itemsIn: [{ id: 'gcyr:heat_shielding_fabric', n: 3 }, { id: 'gcyr:insulating_fabric', n: 3 },
        { id: '#forge:plates/titanium', n: 2, sample: 'gtceu:titanium_plate' }, { id: '#forge:plates/kapton_k', n: 2, sample: 'gcyr:kapton_k_plate' }],
      catalyst: null,
      itemsOut: [{ id: 'gcyr:space_suit_thermal_upgrade_smithing_template', n: 1 }],
      eut: IV_EUT,
      duration: 50
    }
  }

  // the antenna's IV observation and the chart copy
  TN.chartSpec = {
    builderId: 'grindless:inner_planets_chart',
    id: 'grindless:deep_space_tracking/inner_planets_chart',
    calibration: MARS_CHART,
    medium: STICK,
    output: CHART,
    dimension: 'gcyr:luna',
    night: true,
    sky: 'inner_planets',
    eut: IV_EUT,
    duration: 600,
    copy: 'grindless:crafting/inner_planets_chart_copy'
  }

  // the RTG cell's crafting recipe
  TN.rtgCrafting = {
    itemsIn: [{ id: 'gtceu:ev_machine_hull', n: 1 }, { id: 'gtceu:dense_lead_plate', n: 2 },
      { id: '#forge:plates/titanium', n: 4, sample: 'gtceu:titanium_plate' }, { id: 'gtceu:nichrome_single_wire', n: 8 },
      { id: 'gtceu:cupronickel_single_wire', n: 8 }, { id: '#gtceu:circuits/ev', n: 2, sample: 'gtceu:nano_processor_assembly' }],
    eut: 1920,
    duration: 400
  }

  TN.recipes = {
    tank: TN.parts.tank.id,
    motor: TN.parts.motor.id,
    template: TN.parts.template.id,
    chart: TN.chartSpec.id,
    chartCopy: TN.chartSpec.copy,
    rtg: TN.rtg ? TN.rtg.recipe : 'grindless:radioisotope_decay/rtg_pellet',
    rtgCrafting: TN.rtg ? TN.rtg.crafting : 'grindless:assembler/ev_rtg',
    spreader: 'gtceu:shaped/iv_oxygen_spreader'
  }

  function missingItems(ids) {
    return ids.filter(function (id) { return !Item.exists(id) })
  }

  function samples(list) {
    return list.map(function (e) { return e.sample || e.id }).filter(function (id) { return id.charAt(0) !== '#' })
  }

  // one part: GCYR's recipe goes, ours comes; with anything missing GCYR's recipe stays
  function addPart(event, spec) {
    var want = samples(spec.itemsIn).concat(samples(spec.itemsOut))
    if (spec.catalyst) want.push(spec.catalyst)
    var missing = missingItems(want)
    if (missing.length > 0) {
      console.error(LOG + spec.itemsOut[0].id + ' left as GCYR has it, unknown item(s): ' + missing.join(', '))
      return false
    }
    event.remove({ id: spec.gcyrId })
    var recipe = event.recipes.gtceu.assembler(spec.builderId)
    spec.itemsIn.forEach(function (e) { recipe.itemInputs(e.n + 'x ' + e.id) })
    if (spec.catalyst) recipe.notConsumable(spec.catalyst)
    spec.itemsOut.forEach(function (e) { recipe.itemOutputs(e.n + 'x ' + e.id) })
    recipe.EUt(spec.eut).duration(spec.duration)
    return true
  }

  function addChart(event) {
    var c = TN.chartSpec
    var missing = missingItems([c.calibration, c.medium, c.output, 'gtceu:deep_space_antenna'])
    if (missing.length > 0) {
      console.error(LOG + 'inner planets chart skipped, unknown item(s): ' + missing.join(', '))
      return false
    }
    // on the Moon at night, like the Mars chart (the antenna's rule): the lunar night hides the Sun's radio noise
    event.recipes.gtceu.deep_space_tracking(c.builderId)
      .notConsumable(c.calibration)
      .itemInputs('1x ' + c.medium)
      .itemOutputs('1x ' + c.output)
      .addDataString(SKY_KEY, c.sky)
      .dimension(c.dimension)
      .daytime(c.night)
      .EUt(c.eut)
      .duration(c.duration)
    event.shapeless('2x ' + c.output, [c.output, c.medium]).id(c.copy)
    return true
  }

  function addRtg(event) {
    var R = TN.rtg
    if (!R) {
      console.error(LOG + 'RTG cell: no startup table (startup_scripts/grindless/iv/travel_network.js did not run): recipes skipped')
      return false
    }
    var missing = missingItems([R.machine, R.pellet].concat(samples(TN.rtgCrafting.itemsIn)))
    if (missing.length > 0) {
      console.error(LOG + 'RTG cell recipes skipped, unknown item(s): ' + missing.join(', '))
      return false
    }
    // the pellet decays at random: a chanced input, one pellet per 100 runs on average (GTM's OR chance with its per-machine cache)
    event.recipes.gtceu.radioisotope_decay(R.builderId)
      .chancedInput('1x ' + R.pellet, R.chance, 0)
      .addData(R.dataKey, Math.round(R.pelletTicks / 72000))
      .EUt(-R.eut)
      .duration(R.duration)

    // UV's curium RTG pellet (heat source works, circuit 5): the same chance and power, 3x the time (one pellet per 3 hours)
    if (Item.exists(CURIUM_RTG_PELLET)) {
      event.recipes.gtceu.radioisotope_decay('grindless:curium_rtg_pellet')
        .chancedInput('1x ' + CURIUM_RTG_PELLET, R.chance, 0)
        .addData(R.dataKey, Math.round(R.pelletTicks / 72000) * 3)
        .EUt(-R.eut)
        .duration(R.duration * 3)
    }

    var craft = event.recipes.gtceu.assembler(R.craftingBuilderId)
    TN.rtgCrafting.itemsIn.forEach(function (e) { craft.itemInputs(e.n + 'x ' + e.id) })
    craft.itemOutputs('1x ' + R.machine)
      .EUt(TN.rtgCrafting.eut)
      .duration(TN.rtgCrafting.duration)
    return true
  }

  function planetsTable() {
    var table = G.planets && G.planets.table ? G.planets.table : G.readJsonTable(PLANETS)
    return table && table.planets ? table.planets : {}
  }

  function addPairs(event) {
    var planets = planetsTable()
    var added = []
    ;(TN.seeds || []).forEach(function (s) {
      var def = planets[s.planet]
      if (!def || !def.pairTag || !def.dimensions || def.dimensions.length === 0) {
        console.error(LOG + 'Earth-' + s.planet + ' pair skipped: planets.json has no ' + s.planet + ' pairTag or dimension')
        return
      }
      var missing = missingItems([s.seed, s.local, TN.ids.singularity, TN.ids.entangled, 'minecraft:ender_pearl'])
      if (!Fluid.exists(TN.ids.helium3)) missing.push(TN.ids.helium3)
      if (missing.length > 0) {
        console.error(LOG + 'Earth-' + s.planet + ' pair skipped, unknown: ' + missing.join(', '))
        return
      }
      event.recipes.gtceu.chemical_reactor(s.builderId)
        .itemInputs(s.local, '#forge:ender_pearls')
        .inputFluids(Fluid.of(TN.ids.helium3, TN.seedHelium3))
        .itemOutputs(s.seed)
        .dimension(def.dimensions[0])
        .EUt(TN.seedEut)
        .duration(TN.seedDuration)

      var nbt = {}
      nbt[PAIR_NBT_KEY] = def.pairTag
      event.custom({
        type: 'ae2:transform',
        circumstance: { type: 'explosion' },
        ingredients: [{ item: TN.ids.singularity }, { item: s.seed }],
        result: { item: TN.ids.entangled, count: 2, nbt: nbt }
      }).id(s.pair)
      added.push(s.planet + ' (' + def.dimensions[0] + ', ' + PAIR_NBT_KEY + ': ' + def.pairTag + ')')
    })
    return added
  }

  // an uncaught error here would stop the recipe handlers of every script that loads after this one
  ServerEvents.recipes(function (event) {
    var done = []
    ;['tank', 'motor', 'template'].forEach(function (key) {
      try {
        if (addPart(event, TN.parts[key])) done.push(TN.parts[key].itemsOut[0].id)
      } catch (e) {
        console.error(LOG + 'travel and network: ' + key + ' recipe failed: ' + e)
      }
    })
    try {
      if (addChart(event)) done.push(CHART)
    } catch (e1) {
      console.error(LOG + 'travel and network: inner planets chart failed: ' + e1)
    }
    try {
      if (addRtg(event)) done.push(TN.rtg.machine)
    } catch (e2) {
      console.error(LOG + 'travel and network: RTG cell recipes failed: ' + e2)
    }
    var pairs = []
    try {
      pairs = addPairs(event)
    } catch (e3) {
      console.error(LOG + 'travel and network: AE2 pairs failed: ' + e3)
    }
    TN.done = done
    TN.pairs = pairs
    console.info(LOG + 'travel and network: ' + done.join(', ') + '; Earth pairs: ' + pairs.join(', '))
  })
})()
