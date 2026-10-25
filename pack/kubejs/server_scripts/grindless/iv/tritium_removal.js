// -----------------------------------------------------------------------------------------------
// The tritium removal facility's recipe and controller (machine and recipe type: startup_scripts/grindless/iv/tritium_removal.js;
// docs/eras/iv.md, "Tritium removal facility"; package IV-B4).
//
//   gtceu:detritiation   one recipe, id grindless:detritiation/tritiated_heavy_water (GTM's builder puts the type in front):
//                          1,000 mB tritiated heavy water, with a 100 mB deuterium charge (the exchange carrier: GTM's non-consumed
//                          fluid input, needed to start and never drained, taken once whatever the overclock)
//                          -> 900 mB heavy water + 200 mB tritium, .dimension('gcyr:luna')
//                        EU: the design's two stages, each at the rate of the GTM recipe it stands for:
//                          separation     GTM's centrifuge/deuterium_separation (160 mB D -> 40 mB T, 80 EU/t x 160 t: 12,800 EU per 40 mB
//                                         of tritium; IV-A1 removed it, decision 4): 320 EU per mB, 200 mB -> 64,000 EU
//                          liquefaction   GTM's vacuum_freezer/liquid_oxygen (1,920 EU/t x 240 t per 1,000 mB: 46,080 EU), the carrier
//                                         stream through the cold box for 1,000 mB of feed -> 46,080 EU
//                        = 110,080 EU, spent at IV voltage: the shortest whole number of ticks, at no more than 7,680 EU/t, whose EU/t
//                        is a whole even number that pays the energy exactly (so the night half is exact too): 6,880 EU/t x 16 t. The
//                        data key grindless_night_eut holds the night EU/t (3,440: what the startup's modifier gives a run that starts in
//                        the lunar night with every radiator open to the sky), read by the EMI line of the type.
//                        The type has only this recipe, so GTM's lookup cannot hide it (one recipe per ingredient path).
//   crafting             the controller (iv.md, "Controller", with the orchestrator's change): IV hull + cryogenic plant + EV electrolyzer
//                        + 2 IV electric pumps + 4 IV circuits, in a crafting grid (grindless:crafting/tritium_removal_facility, GTM's shaped
//                        recipe). GTM's IV electrolyzer needs osmium wire, which only comes from Mercury: the facility must not wait for
//                        Mercury (the hot cell did the same).
//
// Balance: the reactor's heavy-water cores (IV-A2) turn 5 mB of heavy water into tritiated heavy water per channel and 400-tick cycle,
// 900 mB an hour per channel; a full reactor (4 channels) gives 3,600 mB an hour, which this facility turns into 3,240 mB of heavy water
// back (the make-up drops to 360 mB an hour) and 720 mB of tritium an hour, in 3.6 runs (58 ticks of work an hour).
// Destinations: the heavy water goes back to the reactor (or to IV-A1's electrolysis); the tritium is stored for LuV's fusion (the
// facility refuses fluid voiding); the deuterium charge stays in its hatch.
//
// Published for the smoke test: global.grindless.tritiumRemoval.run { name, recipeId, feed { id, amount }, carrier { id, amount },
// heavyWater { id, amount }, tritium { id, amount }, stages [{ stage, from, eu, per, amount, total }], sourceEnergy, maxEUt, eut,
// duration, energy, nightEut, nightEnergy, dimension }, .recipes (the ids added), .craftingRecipe, .craftingParts.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/iv] '
  var G = global.grindless || (global.grindless = {})
  var TRF = G.tritiumRemoval || (G.tritiumRemoval = {})

  var TYPE_PATH = 'detritiation'
  var MAX_EUT = 7680
  // how far past the shortest duration the exact price is looked for
  var PRICE_SEARCH = 64

  var RUN = {
    name: 'tritiated_heavy_water',
    feed: { id: 'gtceu:tritiated_heavy_water', amount: 1000 },
    carrier: TRF.carrier || { id: 'gtceu:deuterium', amount: 100 },
    heavyWater: { id: 'gtceu:heavy_water', amount: 900 },
    tritium: { id: 'gtceu:tritium', amount: 200 },
    // each stage: eu per `per` units of what it handles, and how many units one run handles
    stages: [
      { stage: 'separation', from: 'gtceu:centrifuge/deuterium_separation', eu: 12800, per: 40, amount: 200, unit: 'mB of tritium' },
      { stage: 'liquefaction', from: 'gtceu:vacuum_freezer/liquid_oxygen', eu: 46080, per: 1000, amount: 1000, unit: 'mB of feed' }
    ],
    maxEUt: MAX_EUT,
    dimension: TRF.dimension || 'gcyr:luna'
  }
  RUN.recipeId = 'grindless:' + TYPE_PATH + '/' + RUN.name

  // the stages' energy at IV voltage: the shortest whole duration with an even EU/t that pays it exactly, else the hot cell's rule (the
  // shortest duration, then the smallest EU/t that pays for it)
  function price(run) {
    var source = 0
    run.stages.forEach(function (s) {
      s.total = s.eu * s.amount / s.per
      source += s.total
    })
    var shortest = Math.max(1, Math.ceil(source / run.maxEUt))
    var duration = 0
    for (var d = shortest; d <= shortest + PRICE_SEARCH; d++) {
      if (source % d === 0 && (source / d) % 2 === 0 && source / d <= run.maxEUt) {
        duration = d
        break
      }
    }
    if (duration === 0) duration = shortest
    run.sourceEnergy = source
    run.duration = duration
    run.eut = Math.ceil(source / duration)
    run.energy = run.eut * run.duration
    // GTM's eutMultiplier truncates (ContentModifier.apply(long))
    run.nightEut = Math.floor(run.eut * (TRF.nightFactor || 0.5))
    run.nightEnergy = run.nightEut * run.duration
  }
  price(RUN)
  TRF.run = RUN

  var CONTROLLER = 'gtceu:tritium_removal_facility'
  var HULL = 'gtceu:iv_machine_hull'
  var PLANT = 'gtceu:cryogenic_plant'
  var ELECTROLYZER = 'gtceu:ev_electrolyzer'
  var PUMP = 'gtceu:iv_electric_pump'
  var CONTROLLER_PARTS = [CONTROLLER, HULL, PLANT, ELECTROLYZER, PUMP]
  TRF.craftingRecipe = 'grindless:crafting/tritium_removal_facility'
  TRF.craftingParts = CONTROLLER_PARTS

  function addRun(event) {
    var missing = [RUN.feed.id, RUN.carrier.id, RUN.heavyWater.id, RUN.tritium.id].filter(function (id) { return !Fluid.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'tritium removal facility: no recipe, unknown fluid(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.detritiation('grindless:' + RUN.name)
      .inputFluids(Fluid.of(RUN.feed.id, RUN.feed.amount))
      .notConsumableFluid(Fluid.of(RUN.carrier.id, RUN.carrier.amount))
      .outputFluids(Fluid.of(RUN.heavyWater.id, RUN.heavyWater.amount))
      .outputFluids(Fluid.of(RUN.tritium.id, RUN.tritium.amount))
      .dimension(RUN.dimension)
      .addDataNumber(TRF.nightKey || 'grindless_night_eut', RUN.nightEut)
      .EUt(RUN.eut)
      .duration(RUN.duration)
    TRF.recipes.push(RUN.recipeId)
    console.info(LOG + 'tritium removal facility: ' + RUN.recipeId + ' ' + RUN.feed.amount + ' mB tritiated heavy water (' + RUN.carrier.amount +
      ' mB deuterium not consumed) -> ' + RUN.heavyWater.amount + ' mB heavy water + ' + RUN.tritium.amount + ' mB tritium, ' + RUN.duration + ' t x ' +
      RUN.eut + ' EU/t = ' + RUN.energy + ' EU for ' + RUN.sourceEnergy + ' EU of stages (' + RUN.stages.map(function (s) { return s.stage + ' ' + s.total }).join(', ') +
      '); night ' + RUN.nightEut + ' EU/t = ' + RUN.nightEnergy + ' EU; only in ' + RUN.dimension)
  }

  function addController(event) {
    var missing = CONTROLLER_PARTS.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'tritium removal facility controller recipe skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    // GTM shaped: lowercase letters are tool symbols, so ingredient keys are uppercase
    event.recipes.gtceu.shaped(CONTROLLER, ['CKC', 'PHP', 'CEC'], {
      C: '#gtceu:circuits/iv',
      K: PLANT,
      P: PUMP,
      H: HULL,
      E: ELECTROLYZER
    }).id(TRF.craftingRecipe)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    TRF.recipes = []
    try {
      addRun(event)
    } catch (e) {
      console.error(LOG + 'tritium removal facility recipe failed: ' + e)
    }
    try {
      addController(event)
    } catch (e2) {
      console.error(LOG + 'tritium removal facility controller recipe failed: ' + e2)
    }
  })
})()
