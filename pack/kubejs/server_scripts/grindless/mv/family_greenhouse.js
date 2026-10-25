// -----------------------------------------------------------------------------------------------
// gtceu:greenhouse recipes of the MV Greenhouse (gtceu:mv_greenhouse): the FERTILIZER + CO2 variants. The MV greenhouse also runs
// every steam recipe and every LV one (see steam/greenhouse.js and lv/greenhouse.js); the LV greenhouse skips these (their ids
// are grindless:greenhouse/mv/...).
//
// One per crop, with the same shape as the LV fertilizer variant: sapling or seed (not consumed) + 1 gtceu:fertilizer + 100 mB of
// water + PROGRAMMED CIRCUIT 2, plus 200 mB of carbon dioxide  ->  x3 the output of the base recipe (the fertilizer's x2 and the
// CO2's x1.5) in half the time (200 ticks, 8 EU/t per run), and 100 mB of OXYGEN back per run (the EBF, the air line and the
// hazmat line take it). Without CO2 in a hatch the LV fertilizer variant runs; with circuit 1 or none the base recipe.
// CO2 comes from the Submerged Arc Furnace (silicon, circuit 1), from distilling wood gas and from fermented biomass.
//
// The FERMENTED BIOMASS booster (grindless:greenhouse/mv/<crop>_biomass, circuit 3): sapling or seed (not consumed) + 50 mB of
// gtceu:fermented_biomass (the biorefinery's brewery line) -> x2 the output in the base time and EU/t (400 ticks, 4 EU/t per run),
// with no fertilizer, no CO2 and no oxygen. It is the path for a greenhouse that ferments but has no fertilizer or CO2 line. It runs
// with or without CO2 in a hatch (the CO2 variants need circuit 2, so the two never compete for one circuit).
//
// Why only on top of the fertilizer: the steam recipes are [sapling] alone, and GTM's recipe lookup cannot hold "sapling" and
// "sapling + CO2" as two recipes of one type (the first is a prefix of the second and the lookup drops one of them). The
// fertilizer goes first in the ingredient list, like in the LV variants, so these never clash. The CO2 is optional in the sense
// that the LV fertilizer variant still runs without it.
//
// Lookup note (GTM's RecipeDB): ingredient lists are ordered by how often each ingredient appears in the type, items that
// appear once first: [fertilizer, catalyst, CO2 (43 recipes), circuit 2 (86), water (111)] against the LV variants' [fertilizer,
// catalyst, circuit 2, water]: they differ at the third ingredient, so neither is a prefix of the other. The biomass boosters list
// the CIRCUIT first, then the catalyst, then the biomass, the same order as the LV CO2 boosters (lv/greenhouse.js): no booster
// starts with the catalyst alone (the steam recipe) or with the fertilizer.
(function () {
  const G = global.grindless
  const LV = G.lv || (G.lv = {})
  const MV = G.mv || (G.mv = {})

  const WATER = 'minecraft:water'
  const WATER_MB = 100
  const FERTILIZER = 'gtceu:fertilizer'
  const CO2 = 'gtceu:carbon_dioxide'
  const CO2_MB = 200
  const O2 = 'gtceu:oxygen'
  const O2_MB = 100
  // the fertilizer's x2 times the CO2's x1.5
  const FACTOR = 3
  // the biomass booster: x2 the output, circuit 3, no fertilizer, CO2 or oxygen
  const BIOMASS = 'gtceu:fermented_biomass'
  const BIOMASS_MB = 50
  const BIOMASS_FACTOR = 2
  const BIOMASS_CIRCUIT = 3

  function addOutputs(recipe, outputs, factor) {
    outputs.forEach(function (o) {
      var n = o.n * factor
      if (o.chance === undefined) {
        recipe.itemOutputs(n + 'x ' + o.item)
      } else {
        recipe.chancedOutput(n + 'x ' + o.item, Math.max(1, Math.min(9999, Math.round(o.chance * 10000))), 0)
      }
    })
  }

  ServerEvents.recipes(function (event) {
    var missingFluids = [WATER, CO2, O2].filter(function (id) { return !Fluid.exists(id) })
    if (missingFluids.length > 0 || !Item.exists(FERTILIZER)) {
      console.error('[grindless/mv] greenhouse CO2 variants skipped, unknown id(s): ' +
        missingFluids.concat(Item.exists(FERTILIZER) ? [] : [FERTILIZER]).join(', '))
      return
    }

    var table = G.greenhouse
    var duration = Math.round(table.duration / 2)
    var eut = table.eut * 2
    var entries = table.entries.concat(LV.greenhouseExtras)
    var count = 0

    entries.forEach(function (entry) {
      var items = [entry.catalyst].concat(entry.outputs.map(function (o) { return o.item }))
      var missing = items.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error('[grindless/mv] greenhouse ' + entry.id + ' CO2 variant skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      var recipe = event.recipes.gtceu.greenhouse('grindless:mv/' + entry.id + '_fertilizer_co2')
        .itemInputs('1x ' + FERTILIZER)
        .notConsumable(entry.catalyst)
        .circuit(2)
        .inputFluids(Fluid.of(WATER, WATER_MB), Fluid.of(CO2, CO2_MB))
        .outputFluids(Fluid.of(O2, O2_MB))
      addOutputs(recipe, entry.outputs, FACTOR)
      recipe.EUt(eut).duration(duration)
      count++
    })

    // published for the smoke test
    MV.greenhouse = { count: count, co2: CO2, co2Mb: CO2_MB, o2: O2, o2Mb: O2_MB, waterMb: WATER_MB, factor: FACTOR, duration: duration, eut: eut }
    console.info('[grindless/mv] greenhouse fertilizer + CO2 recipes added: ' + count)

    // the fermented biomass boosters: the base time and EU/t, x2 the output (see the header). Own check: a missing biomass only
    // skips these.
    var boosters = 0
    if (!Fluid.exists(BIOMASS)) {
      console.error('[grindless/mv] greenhouse biomass boosters skipped, unknown fluid: ' + BIOMASS)
    } else {
      entries.forEach(function (entry) {
        var items = [entry.catalyst].concat(entry.outputs.map(function (o) { return o.item }))
        var missing = items.filter(function (id) { return !Item.exists(id) })
        if (missing.length > 0) {
          console.error('[grindless/mv] greenhouse ' + entry.id + ' biomass booster skipped, unknown item(s): ' + missing.join(', '))
          return
        }
        var recipe = event.recipes.gtceu.greenhouse('grindless:mv/' + entry.id + '_biomass')
          .circuit(BIOMASS_CIRCUIT)
          .notConsumable(entry.catalyst)
          .inputFluids(Fluid.of(BIOMASS, BIOMASS_MB))
        addOutputs(recipe, entry.outputs, BIOMASS_FACTOR)
        recipe.EUt(table.eut).duration(table.duration)
        boosters++
      })
    }

    // published for the smoke test
    MV.greenhouseBiomass = { count: boosters, fluid: BIOMASS, fluidMb: BIOMASS_MB, factor: BIOMASS_FACTOR, circuit: BIOMASS_CIRCUIT,
      eut: table.eut, duration: table.duration }
    console.info('[grindless/mv] greenhouse biomass boosters added: ' + boosters)
  })
})()
