// -----------------------------------------------------------------------------------------------
// The road to the first rocket, GCYR side: every recipe change of a GCYR part made for the Engine Test Stand (MV), the Composite
// Autoclave (HV) and the landing-site chart lives in this one file. integration/gcyr.js (the scanner, the space fabric, the fiberglass
// and the suit at HV) is not touched, and neither is GCYR's rocket itself: it is still built from gcyr:launch_pad, a
// gtceu:stainless_steel_frame tower, gcyr:seat, gcyr:basic_fuel_tank and gcyr:basic_rocket_motor; only how some of those are made changes.
//
//   gcyr:basic_rocket_motor   GCYR: assembler, 4 power thrusters + 6 Kapton K plates + a stainless steel frame (HV).
//                             Now two steps, and the second one only on the Engine Test Stand:
//                               ASSEMBLER (480 EU/t, 300 t): 4 qualified power thrusters (their MV static fire) + 2 ablative heat shield
//                               tiles (the base heat shield, from the Composite Autoclave) + 4 Kapton K plates + 1 stainless steel frame
//                               -> grindless:untested_rocket_motor
//                               STATIC FIRE (gtceu:static_fire, 480 EU/t, 400 t): untested rocket motor + 500 mB of rocket fuel
//                               -> gcyr:basic_rocket_motor + 250 mB CO2 + 500 mB water
//                             The rocket fuel is the one the rocket flies on (GTM's rocket_fuel: dimethylhydrazine and oxygen or N2O4,
//                             HV chemistry); the Moon rocket carries 10 B, a static fire burns half a bucket. Its nitrogen is vented.
//   gcyr:basic_fuel_tank      GCYR: assembler, 2 stainless steel drums + 6 Kapton K plates + a stainless steel frame.
//                             Now: 2 composite overwrapped tanks (a stainless steel drum overwrapped with para-aramid in epoxy, cured in
//                             the Composite Autoclave) + 6 Kapton K plates + 1 stainless steel frame, same assembler, 480 EU/t, 300 t
//   gcyr:id_chip              GCYR: crafting table, magnetic iron foil + polyethylene plate. The chip carries the destination of the
//                             flight, so it is written from the landing-site chart of the radio telescope (the observatory family, MV):
//                             magnetic iron foil + polyethylene plate + the chart, which stays in the grid (keepIngredient). Every launch
//                             needs a chip; the chart is made once. While the chart is not registered the chip keeps GCYR's recipe.
// Untouched: the launch pad, the seat, the scanner (integration/gcyr.js) and every later GCYR part (advanced and elite motors and tanks).
//
// Era: MV (the qualified thrusters) and HV (everything else). Rhino: var + function inside callbacks that run more than once.
(function () {
  var LOG = '[grindless/gcyr_launch_road] '

  // The landing-site chart for the HV launch, the last chart of the observatory family (clockwork, optical, radio telescope): made only
  // by the MV radio telescope (gtceu:radio_telescope, recipe type gtceu:radio_astronomy; startup_scripts/grindless/observatory/items.js).
  // Single constant on purpose. While that item is not registered (the observatory ships separately) the chip keeps GCYR's recipe.
  var CHART = 'grindless:lunar_landing_chart'

  var THRUSTER = 'grindless:qualified_power_thruster'
  var TILE = 'grindless:ablative_heat_shield_tile'
  var COPV = 'grindless:composite_overwrapped_tank'
  var UNTESTED = 'grindless:untested_rocket_motor'
  var MOTOR = 'gcyr:basic_rocket_motor'
  var TANK = 'gcyr:basic_fuel_tank'
  var CHIP = 'gcyr:id_chip'
  var ROCKET_FUEL = 'gtceu:rocket_fuel'

  // GCYR recipe id -> the recipe that replaces it (published for tools/test and the audit)
  var REPLACED = {
    'gcyr:assembler/basic_rocket_motor': 'grindless:static_fire/gcyr/basic_rocket_motor',
    'gcyr:assembler/basic_fuel_tank': 'grindless:assembler/gcyr/basic_fuel_tank',
    'gcyr:shapeless/id_chip': 'grindless:gcyr/id_chip'
  }
  var ADDED = { untestedMotor: 'grindless:assembler/gcyr/untested_rocket_motor' }

  var G = global.grindless || (global.grindless = {})
  var LR = G.launchRoad || (G.launchRoad = {})
  LR.gcyr = { replaced: REPLACED, added: ADDED, chart: CHART, chartWired: false }
  LR.recipes = LR.recipes || {}
  LR.recipes.untestedMotor = {
    id: ADDED.untestedMotor,
    itemsIn: [{ id: THRUSTER, n: 4 }, { id: TILE, n: 2 }, { id: '#forge:plates/kapton_k', n: 4, sample: 'gcyr:kapton_k_plate' },
      { id: '#forge:frames/stainless_steel', n: 1, sample: 'gtceu:stainless_steel_frame' }],
    itemsOut: [{ id: UNTESTED, n: 1 }],
    eut: 480,
    duration: 300
  }
  LR.recipes.motor = {
    id: REPLACED['gcyr:assembler/basic_rocket_motor'],
    itemsIn: [{ id: UNTESTED, n: 1 }],
    fluidsIn: [{ id: ROCKET_FUEL, mb: 500 }],
    itemsOut: [{ id: MOTOR, n: 1 }],
    fluidsOut: [{ id: 'gtceu:carbon_dioxide', mb: 250 }, { id: 'minecraft:water', mb: 500 }],
    eut: 480,
    duration: 400
  }
  LR.recipes.tank = {
    id: REPLACED['gcyr:assembler/basic_fuel_tank'],
    itemsIn: [{ id: COPV, n: 2 }, { id: '#forge:plates/kapton_k', n: 6, sample: 'gcyr:kapton_k_plate' },
      { id: '#forge:frames/stainless_steel', n: 1, sample: 'gtceu:stainless_steel_frame' }],
    itemsOut: [{ id: TANK, n: 1 }],
    eut: 480,
    duration: 300
  }

  function missingItems(ids) {
    return ids.filter(function (id) { return !Item.exists(id) })
  }

  function samples(list) {
    return list.map(function (e) { return e.sample || e.id })
  }

  function addMotor(event) {
    var u = LR.recipes.untestedMotor
    var m = LR.recipes.motor
    var missing = missingItems(samples(u.itemsIn).concat([UNTESTED, MOTOR]))
    if (missing.length > 0 || !Fluid.exists(ROCKET_FUEL)) {
      console.error(LOG + 'basic rocket motor left as GCYR has it, unknown id(s): ' + missing.concat(Fluid.exists(ROCKET_FUEL) ? [] : [ROCKET_FUEL]).join(', '))
      return false
    }
    // the static fire is the only way to the motor once GCYR's recipe is gone, and the tiles come only from the autoclave: without
    // the recipe types (startup failed) nothing changes
    if (!event.recipes.gtceu.static_fire || !event.recipes.gtceu.composite_curing) {
      console.error(LOG + 'basic rocket motor left as GCYR has it: gtceu:static_fire or gtceu:composite_curing is not registered')
      return false
    }
    event.remove({ id: 'gcyr:assembler/basic_rocket_motor' })

    var assembly = event.recipes.gtceu.assembler('grindless:gcyr/untested_rocket_motor')
    u.itemsIn.forEach(function (e) { assembly.itemInputs(e.n + 'x ' + e.id) })
    assembly.itemOutputs(UNTESTED).EUt(u.eut).duration(u.duration)

    var fire = event.recipes.gtceu.static_fire('grindless:gcyr/basic_rocket_motor')
      .itemInputs(UNTESTED)
      .inputFluids(Fluid.of(ROCKET_FUEL, m.fluidsIn[0].mb))
      .itemOutputs(MOTOR)
    m.fluidsOut.forEach(function (f) { fire.outputFluids(Fluid.of(f.id, f.mb)) })
    fire.EUt(m.eut).duration(m.duration)
    return true
  }

  function addTank(event) {
    var t = LR.recipes.tank
    var missing = missingItems(samples(t.itemsIn).concat([TANK]))
    if (missing.length > 0) {
      console.error(LOG + 'basic fuel tank left as GCYR has it, unknown item(s): ' + missing.join(', '))
      return false
    }
    // the overwrapped tanks come only from the Composite Autoclave
    if (!event.recipes.gtceu.composite_curing) {
      console.error(LOG + 'basic fuel tank left as GCYR has it: the recipe type gtceu:composite_curing is not registered')
      return false
    }
    event.remove({ id: 'gcyr:assembler/basic_fuel_tank' })
    var tank = event.recipes.gtceu.assembler('grindless:gcyr/basic_fuel_tank')
    t.itemsIn.forEach(function (e) { tank.itemInputs(e.n + 'x ' + e.id) })
    tank.itemOutputs(TANK).EUt(t.eut).duration(t.duration)
    return true
  }

  function addChip(event) {
    if (!Item.exists(CHART)) {
      console.warn(LOG + 'the landing-site chart ' + CHART + ' is not registered (observatory not in the pack yet), ' + CHIP + ' keeps GCYR\'s recipe')
      return false
    }
    if (!Item.exists(CHIP)) {
      console.error(LOG + 'ID chip left as it is, unknown item: ' + CHIP)
      return false
    }
    event.remove({ id: 'gcyr:shapeless/id_chip' })
    event.shapeless(CHIP, ['#forge:foils/magnetic_iron', '#forge:plates/polyethylene', CHART])
      .keepIngredient(CHART)
      .id(REPLACED['gcyr:shapeless/id_chip'])
    LR.gcyr.chartWired = true
    return true
  }

  // an uncaught error here would stop the recipe handlers of every script that loads after this one
  ServerEvents.recipes(function (event) {
    var done = []
    try {
      if (addMotor(event)) done.push('basic rocket motor (assembler + static fire)')
    } catch (e) {
      console.error(LOG + 'basic rocket motor recipes failed: ' + e)
    }
    try {
      if (addTank(event)) done.push('basic fuel tank (composite overwrapped tanks)')
    } catch (e) {
      console.error(LOG + 'basic fuel tank recipe failed: ' + e)
    }
    try {
      if (addChip(event)) done.push('ID chip (landing-site chart)')
    } catch (e) {
      console.error(LOG + 'ID chip recipe failed: ' + e)
    }
    console.info(LOG + 'GCYR parts on the road to the first rocket: ' + (done.length > 0 ? done.join(', ') : 'none'))
  })
})()
