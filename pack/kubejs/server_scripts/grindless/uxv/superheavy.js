// priority: -26264
// -----------------------------------------------------------------------------------------------
// UXV's superheavies III (docs/eras/uxv.md, process lines 19-23; package UXV-A1). Every row of the package is an older machine's row:
// tables/isotopes.json (calutron), tables/superheavy.json (cyclotron, recoil separator, chem lab), tables/transcurium.json (plating),
// zpm/actinides.js (waste retrieval, partitioning). This file holds the only rows in a GTM type: the spark plasma sinterer
// (gtceu:spark_plasma_sintering; circuits 1-7 are uhv/propulsion.js's), which sinters each plated blank under argon into its target.
// VA[UHV] = 1,966,080 EU/t. Ids not registered skip their row with a console error.
//   8  fm257_target   Fm-257 plated blank + 100 mB argon -> 1 fermium-257 target     1,966,080 x 600 t
//   9  cm248_target   Cm-248 plated blank + 100 mB argon -> 1 curium-248 target      1,966,080 x 600 t
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uxv] '
  var G = global.grindless || (global.grindless = {})
  var SH = G.uxvSuperheavy || (G.uxvSuperheavy = {})

  SH.sintering = [
    { name: 'fm257_target', circuit: 8, input: 'grindless:fm257_plated_blank', output: 'grindless:fm257_target', fluid: 'gtceu:argon', amount: 100, eut: 1966080, duration: 600 },
    { name: 'cm248_target', circuit: 9, input: 'grindless:cm248_plated_blank', output: 'grindless:cm248_target', fluid: 'gtceu:argon', amount: 100, eut: 1966080, duration: 600 }
  ]
  SH.skipped = []

  ServerEvents.recipes(function (event) {
    SH.sintering.forEach(function (r) {
      var missing = []
      if (!Item.exists(r.input)) missing.push(r.input)
      if (!Item.exists(r.output)) missing.push(r.output)
      if (!Fluid.exists(r.fluid)) missing.push(r.fluid)
      if (missing.length > 0) {
        SH.skipped.push({ name: r.name, reason: 'unknown id(s) ' + missing.join(', ') })
        console.error(LOG + 'sintering skipped ' + r.name + ': unknown id(s) ' + missing.join(', '))
        return
      }
      var b = event.recipes.gtceu.spark_plasma_sintering('grindless:spark_plasma_sintering/' + r.name)
      b.itemInputs('1x ' + r.input)
      b.circuit(r.circuit)
      b.inputFluids(Fluid.of(r.fluid, r.amount))
      b.itemOutputs('1x ' + r.output)
      b.EUt(r.eut).duration(r.duration)
    })
    console.info(LOG + 'superheavy sintering added: ' + (SH.sintering.length - SH.skipped.length))
  })
})()
