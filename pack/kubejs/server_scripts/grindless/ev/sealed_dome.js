// priority: -13024
// -----------------------------------------------------------------------------------------------
// The Sealed Dome (gtceu:sealed_dome, startup_scripts/grindless/ev/sealed_dome.js): its sealed recipes and its crafting recipe.
//
//   gtceu:greenhouse, PROGRAMMED CIRCUIT 5 (Moon) or 6 (Mars), the sealed mode, one pair per plant of the family (the steam table of
//   data/greenhouse.js and the LV extras of lv/greenhouse.js, global.grindless.lv.greenhouseExtras):
//     grindless:greenhouse/ev/<plant>_sealed_moon   circuit 5 + plant (not consumed) + 200 mB carbon dioxide + 100 mB water
//                                                    -> x3 the base output + 100 mB oxygen, .dimension('gcyr:luna')
//     grindless:greenhouse/ev/<plant>_sealed_mars   circuit 6 + plant (not consumed) + 100 mB water
//                                                    -> x3 the base output + 100 mB oxygen, .dimension('gcyr:mars'): the CO2 is
//                                                    breathed in from the Martian air, like the gas collector does
//   Both run 200 ticks at 8 EU/t per run: the HV greenhouse's yield and time (its fertilizer + CO2 recipe, mv/family_greenhouse.js),
//   with LEDs instead of the sun and no fertilizer. The 100 mB of oxygen per run is the same as that recipe's.
//   Destinations: the oxygen goes to the suits, the cryogenic plant or the home network; the crops and the wood go home, where the
//   brewery turns them into biomass (the wither's 400 mB per Nether Star, mobs.json) and food.
//
// The ids carry the ev/ segment: lower greenhouses skip a higher tier's recipes. They also need circuit 5 or 6, which the LV, MV and HV
// vetoes already refuse (see the startup script).
//
// Lookup note (GTM's RecipeDB drops a recipe whose ingredient path is a prefix of another's; the order of items vs fluids and of
// the fluids themselves is not reliable, only the declared item order is): the sealed recipes list the CIRCUIT first, then the
// plant, so no sealed recipe starts with the plant alone (the steam recipe) or with the fertilizer, and each site has its own circuit
// so the Mars recipe [circuit 6, plant; water] is never a prefix of the Moon one [circuit 5, plant; CO2, water].
// tools/analysis/test/recipe-twins.test.mjs (findPrefixHazards) checks the whole pack.
//
// Crafting table: HV greenhouse + EV hull + 2 EV pumps + 4 EV circuits (ev.md), GT shaped recipe with a wrench (w).
(function () {
  const G = global.grindless
  const LV = G.lv || (G.lv = {})
  const SD = G.sealedDome || (G.sealedDome = {})

  const WATER = 'minecraft:water'
  const WATER_MB = 100
  const CO2 = 'gtceu:carbon_dioxide'
  const CO2_MB = 200
  const O2 = 'gtceu:oxygen'
  const O2_MB = 100
  const FACTOR = 3
  const EUT = 8
  const DURATION = 200

  // one circuit per site, so the Mars recipe [circuit 6, plant; water] is never a prefix of the Moon one [circuit 5, plant; CO2, water]
  const SITES = [
    { name: 'moon', dimension: 'gcyr:luna', co2: true, circuit: 5 },
    { name: 'mars', dimension: 'gcyr:mars', co2: false, circuit: 6 }
  ]

  const PARTS = ['gtceu:hv_greenhouse', 'gtceu:ev_machine_hull', 'gtceu:ev_electric_pump', 'grindless:night_sky_radiator', 'grindless:stainless_steel_drill_bit']

  SD.recipeId = function (entryId, site) {
    return 'grindless:greenhouse/ev/' + entryId + '_sealed_' + site
  }
  SD.sites = SITES
  SD.numbers = { waterMb: WATER_MB, co2Mb: CO2_MB, o2Mb: O2_MB, factor: FACTOR, eut: EUT, duration: DURATION }
  SD.craftingId = 'grindless:assembler/sealed_dome'

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
    // ---- the sealed recipes
    var missingFluids = [WATER, CO2, O2].filter(function (id) { return !Fluid.exists(id) })
    if (missingFluids.length > 0) {
      console.error('[grindless/ev] sealed dome recipes skipped, unknown fluid(s): ' + missingFluids.join(', '))
    } else if (!G.greenhouse || !LV.greenhouseExtras) {
      console.error('[grindless/ev] sealed dome recipes skipped: the greenhouse table (data/greenhouse.js) or the LV extras (lv/greenhouse.js) are not loaded')
    } else {
      var entries = G.greenhouse.entries.concat(LV.greenhouseExtras)
      var counts = { moon: 0, mars: 0 }
      var ids = []
      entries.forEach(function (entry) {
        var items = [entry.catalyst].concat(entry.outputs.map(function (o) { return o.item }))
        var missing = items.filter(function (id) { return !Item.exists(id) })
        if (missing.length > 0) {
          console.error('[grindless/ev] sealed dome: ' + entry.id + ' skipped, unknown item(s): ' + missing.join(', '))
          return
        }
        SITES.forEach(function (site) {
          try {
            var recipe = event.recipes.gtceu.greenhouse('grindless:ev/' + entry.id + '_sealed_' + site.name)
              .circuit(site.circuit)
              .notConsumable(entry.catalyst)
            if (site.co2) {
              recipe.inputFluids(Fluid.of(CO2, CO2_MB), Fluid.of(WATER, WATER_MB))
            } else {
              recipe.inputFluids(Fluid.of(WATER, WATER_MB))
            }
            recipe.outputFluids(Fluid.of(O2, O2_MB))
            addOutputs(recipe, entry.outputs, FACTOR)
            recipe.dimension(site.dimension)
            recipe.EUt(EUT).duration(DURATION)
            counts[site.name]++
            ids.push(SD.recipeId(entry.id, site.name))
          } catch (e) {
            console.error('[grindless/ev] sealed dome: ' + entry.id + ' (' + site.name + ') failed: ' + e)
          }
        })
      })
      // published for the smoke test
      SD.recipes = { ids: ids, moon: counts.moon, mars: counts.mars, entries: entries.length }
      console.info('[grindless/ev] sealed dome recipes: ' + counts.moon + ' on the Moon (CO2 + water), ' + counts.mars +
        ' on Mars (water, CO2 from the air), from ' + entries.length + ' plants')
    }

    // ---- the controller
    var missingParts = PARTS.filter(function (id) { return !Item.exists(id) })
    if (missingParts.length > 0) {
      console.error('[grindless/ev] sealed dome crafting recipe skipped, unknown item(s): ' + missingParts.join(', '))
    } else {
      event.recipes.gtceu.assembler('grindless:sealed_dome')
        .itemInputs('gtceu:ev_machine_hull', 'gtceu:hv_greenhouse', '2x gtceu:ev_electric_pump', '4x #gtceu:circuits/ev', '2x grindless:night_sky_radiator', '2x grindless:stainless_steel_drill_bit')
        .inputFluids(Fluid.of('gtceu:distilled_water', 2000))
        .itemOutputs('gtceu:sealed_dome')
        .EUt(120).duration(400)
    }
  })
})()
