// priority: -20152
// -----------------------------------------------------------------------------------------------
// XP-A3 "MAX+ circuits" (docs/eras/maxplus.md, Lines Q1 and Q2 and the processor design): the GTM steps of the two lines, the tag and the join.
// Every other step is one row of an older machine, marked XP-A3 in its own file:
//
//   Q1  horizon logic die   calutron c31 -> crystal growth c32 -> BEUV c21 -> MTJ c32 -> racetrack c6 -> GTM cutter (here)
//   Q2  horizon interposer  ion slicing c19 -> femtosecond writer c20 -> MBE c32 -> GTM cutter (here) -> mK cryostat c32
//
// The join is the UEV photonic integration hall's c14 (tables/photonics_uev.json): 2 horizon logic dies + the horizon interposer + a quantum
// memory node + a Rydberg logic array + 2 supracausal mainframes + 1,000 mB Kerr condensate -> grindless:horizon_processor, the only member
// of #gtceu:circuits/maxplus (GTM has no tag above MAX; every MAX+ hardware recipe takes this tag).
//
// Published: global.grindless.maxplusCircuits.recipes, .skipped, .joinRecipe, .joinOutput, .tag.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/maxplus] '
  var G = global.grindless || (global.grindless = {})
  var MC = G.maxplusCircuits || (G.maxplusCircuits = {})
  MC.recipes = []
  MC.skipped = []
  MC.joinRecipe = 'grindless:photonic_integration/horizon_processor'
  MC.joinOutput = 'grindless:horizon_processor'
  MC.tag = 'gtceu:circuits/maxplus'

  var ROWS = [
    { name: 'horizon_logic_die', eut: 536870912, duration: 1200, input: 'grindless:stacked_logic_wafer', out: 'grindless:horizon_logic_die', count: 2 },
    { name: 'interposer_die', eut: 536870912, duration: 1200, input: 'grindless:piezo_transducer_layer', out: 'grindless:interposer_die', count: 1 }
  ]

  global.grindless.recipes('maxplus/circuits', function (event) {
    ROWS.forEach(function (r) {
      var missing = [r.input, r.out].filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        MC.skipped.push(r.name)
        console.error(LOG + r.name + ' skipped, unknown id(s): ' + missing.join(', '))
        return
      }
      // GTM prefixes the type itself: grindless:<name> becomes grindless:cutter/<name>
      var b = event.recipes.gtceu.cutter('grindless:' + r.name)
      b.itemInputs('1x ' + r.input)
      b.inputFluids(Fluid.of('gtceu:distilled_water', 1000))
      b.itemOutputs(r.count + 'x ' + r.out)
      b.EUt(r.eut).duration(r.duration)
      MC.recipes.push('grindless:cutter/' + r.name)
    })
    console.info(LOG + 'circuits: ' + MC.recipes.length + ' recipes; skipped ' + MC.skipped.length)
  })

  ServerEvents.tags('item', function (event) {
    event.add(MC.tag, MC.joinOutput)
  })
})()
