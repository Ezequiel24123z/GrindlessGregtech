// -----------------------------------------------------------------------------------------------
// MV Platline I: GT--'s platinum line taught and usable at MV (docs/eras/lines-steam-hv.md, section 4, step 6 and 7).
//
// GT-- 1.3.10 (config/gtnn.json enableHarderPlatinumLine, on) puts a GTNH-style platinum line in the loose recipes. Three things stop it
// from being a medium-voltage line, and this script fixes them in place (the recipe ids stay: the platinum plant and
// gg_test_addon_gates_misc.js read them):
//
//   1. aqua regia dissolution (real process: aqua regia, not nitration mixture, dissolves platinum). The four dissolve_platinum_metallic_powder
//      recipes (chemical reactor and large chemical reactor, 1 and 9 batches) take the same amount of gtceu:aqua_regia (mixer: HNO3 + 2 HCl)
//      where they took nitration mixture.
//   2. dilute hydrochloric acid out of the precipitation. large_platinum_dusts and tiny_platinum_dusts (ammonium chloroplatinate) gave diluted
//      sulfuric acid; the chloride route gives diluted hydrochloric acid (the distillery's input in GTM).
//   3. an MV precipitation. large_platinum_dusts exists only in the large chemical reactor (480 EU/t). The new chemical reactor variant runs
//      it at 120 EU/t, in half a batch because an MV chemical reactor tank holds 16 000 mB (the large one takes 18 000).
//
// Gas balance. A chemical reactor holds two fluid outputs and large_platinum_dusts has three (palladium-rich ammonia, nitrogen dioxide,
// diluted acid), so the MV variant cannot carry the nitrogen dioxide. It is a product of the nitric acid of the aqua regia, so it comes
// off where the acid is spent: the dissolution gives 0.5 mB of NO2 for each mB of aqua regia, which is exactly what the precipitation
// gave for each mB of concentrated platinum it took (9 000 mB per 18 000 mB). The large and tiny precipitations lose it too, so the
// line makes the same nitrogen dioxide whichever reactor runs it (it still feeds L2's nitric acid step) and no variant makes gas twice.
//
// Ratios of the MV precipitation (half of large_platinum_dusts, 18 000 mB concentrated platinum + 3 600 mB ammonium chloride ->
// 16 salt + 4 raw + 3 600 mB rich ammonia + 9 000 mB diluted acid): 9 000 + 1 800 -> 8 + 2 + 1 800 + 4 500, in 700 ticks (the large one
// takes 1 400 for twice as much, so the time per unit is the same). Programmed circuit 3: the large reactor's recipes use circuits 1 and 2.
//
// The EV platinum plant reads the ORIGINAL recipes of its stages (compose.js), so it keeps composing the GT-- stages as they ship and its
// recipes (and gg_test_ev_platinum_plant) do not change.
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/mv] platline: '
  var NITRATION = 'forge:nitration_mixture'
  var AQUA_REGIA = 'gtceu:aqua_regia'
  var NO2 = 'gtceu:nitrogen_dioxide'
  var DILUTE_H2SO4 = 'gtceu:diluted_sulfuric_acid'
  var DILUTE_HCL = 'gtceu:diluted_hydrochloric_acid'
  var DISSOLVE = [
    'gtceu:chemical_reactor/dissolve_platinum_metallic_powder',
    'gtceu:chemical_reactor/dissolve_platinum_metallic_powder9',
    'gtceu:large_chemical_reactor/dissolve_platinum_metallic_powder',
    'gtceu:large_chemical_reactor/dissolve_platinum_metallic_powder9'
  ]
  var PRECIPITATE = ['gtceu:large_chemical_reactor/large_platinum_dusts', 'gtceu:large_chemical_reactor/tiny_platinum_dusts']

  function fluidIdOf(entry) {
    var v = entry && entry.content && entry.content.value
    if (!v || v.length === 0) return ''
    return String(v[0].fluid || (v[0].tag ? '#' + v[0].tag : ''))
  }

  // the dissolution: nitration mixture in -> the same amount of aqua regia; the nitrogen dioxide of its nitric acid comes out here
  function dissolve(j) {
    var fluids = (j.inputs && j.inputs.fluid) || []
    var done = false
    var acid = 0
    fluids.forEach(function (e) {
      if (fluidIdOf(e) !== '#' + NITRATION) return
      e.content.value = [{ fluid: AQUA_REGIA }]
      acid = e.content.amount
      done = true
    })
    if (!done) return false
    j.outputs.fluid = j.outputs.fluid || []
    j.outputs.fluid.push({ content: { amount: Math.round(acid / 2), value: [{ fluid: NO2 }] } })
    return true
  }

  // the precipitation: diluted sulfuric acid -> diluted hydrochloric acid, and no nitrogen dioxide (the dissolution gave it)
  function precipitate(j) {
    var fluids = (j.outputs && j.outputs.fluid) || []
    var done = false
    var kept = []
    fluids.forEach(function (e) {
      var id = fluidIdOf(e)
      if (id === NO2) { done = true; return }
      if (id === DILUTE_H2SO4) {
        e.content.value = [{ fluid: DILUTE_HCL }]
        done = true
      }
      kept.push(e)
    })
    if (!done) return false
    j.outputs.fluid = kept
    return true
  }

  function edit(event, id, change, report) {
    var seen = 0
    event.forEachRecipe({ id: id }, function (r) {
      seen++
      var j = JSON.parse(String(r.json))
      if (!change(j)) {
        report.untouched.push(id)
        return
      }
      r.json.add('inputs', JsonIO.parseRaw(JSON.stringify(j.inputs)))
      r.json.add('outputs', JsonIO.parseRaw(JSON.stringify(j.outputs)))
      r.save()
      report.changed.push(id)
    })
    if (seen === 0) report.missing.push(id)
  }

  function addMvPrecipitation(event) {
    event.recipes.gtceu.chemical_reactor('grindless:platline/platinum_salt_mv')
      .circuit(3)
      .inputFluids(Fluid.of('gtceu:concentrated_platinum', 9000), Fluid.of('gtceu:ammonium_chloride', 1800))
      .itemOutputs('8x gtceu:platinum_salt_dust', '2x gtceu:platinum_raw_dust')
      .outputFluids(Fluid.of('gtceu:palladium_rich_ammonia', 1800), Fluid.of(DILUTE_HCL, 4500))
      .EUt(120).duration(700)
  }

  // an uncaught error here would stop the recipe handlers of every script that loads after this one
  ServerEvents.recipes(function (event) {
    try {
      var report = { changed: [], untouched: [], missing: [] }
      DISSOLVE.forEach(function (id) { edit(event, id, dissolve, report) })
      PRECIPITATE.forEach(function (id) { edit(event, id, precipitate, report) })
      if (report.changed.length === DISSOLVE.length + PRECIPITATE.length) {
        addMvPrecipitation(event)
        console.info(LOG + 'aqua regia dissolution, diluted hydrochloric acid and the MV precipitation set (' + report.changed.length + ' recipes changed)')
      } else {
        // the harder platinum line is off (or GT-- changed it): GTM's own line stays as it is and no MV variant is added
        console.warn(LOG + 'GT--\'s platinum line is not as expected, left alone: changed ' + report.changed.join(', ') + '; unchanged ' +
          report.untouched.join(', ') + '; missing ' + report.missing.join(', '))
      }
    } catch (e) {
      console.error(LOG + 'recipe changes failed: ' + e)
    }
  })
})()
