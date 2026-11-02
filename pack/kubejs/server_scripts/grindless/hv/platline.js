// -----------------------------------------------------------------------------------------------
// HV Platline II, the consumer: the integrated nitric acid plant (docs/eras/lines-steam-hv.md, section 5, H1).
//
// Real Ostwald plants burn ammonia over a platinum-rhodium gauze (90:10) that wears slowly. GTM's large chemical reactor already makes nitric
// acid from ammonia in one reactor (nitric_acid_from_ammonia: 1 000 mB NH3 + 4 000 mB O2 -> 1 000 mB HNO3 + 1 000 mB water, 30 EU/t, circuit 24);
// this script makes it take a grindless:platinum_rhodium_gauze in the input bus, a chanced input used up in 0.05 % of the runs like
// grindless:reforming_catalyst (hv/reformer.js).
//
//   gauze   ASSEMBLER, HV: 9 platinum foil + 1 rhodium foil -> 1 grindless:platinum_rhodium_gauze (480 EU/t, 5 s)
//
// Removed (nitrogen oxides straight from the elements, which no plant does; the Haber ammonia, the Ostwald steps and the oxidation of nitric
// oxide stay): gtceu:large_chemical_reactor/nitric_acid_from_elements, nitrogen_dioxide_from_elements and dinitrogen_tetroxide_shortcut.
// What stays reachable: L2's Ostwald route (nitric_oxide_from_ammonia -> nitrogen_dioxide_from_oxide -> nitric_acid_from_dioxide_1, untouched,
// LV, no gauze) and N2O4 for the rocket fuel from NO2 (chemical_reactor/dinitrogen_tetroxide_from_dioxide, or from ammonia and oxygen).
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/hv] platline II: '
  var GAUZE = 'grindless:platinum_rhodium_gauze'
  var GAUZE_WEAR = 5
  var NITRIC_FROM_AMMONIA = 'gtceu:large_chemical_reactor/nitric_acid_from_ammonia'
  var REMOVED = [
    'gtceu:large_chemical_reactor/nitric_acid_from_elements',
    'gtceu:large_chemical_reactor/nitrogen_dioxide_from_elements',
    'gtceu:large_chemical_reactor/dinitrogen_tetroxide_shortcut'
  ]

  // GTM's recipe is rebuilt with the gauze as one more chanced input (chance in 1/10000 of the runs it is consumed); the recipe is now grindless:large_chemical_reactor/nitric_acid_from_ammonia
  function nitricAcidWithGauze(event) {
    event.remove({ id: NITRIC_FROM_AMMONIA })
    event.recipes.gtceu.large_chemical_reactor('grindless:nitric_acid_from_ammonia')
      .chancedInput(GAUZE, GAUZE_WEAR, 0)
      .circuit(24)
      .inputFluids(Fluid.of('gtceu:ammonia', 1000), Fluid.of('gtceu:oxygen', 4000))
      .outputFluids(Fluid.of('gtceu:nitric_acid', 1000), Fluid.of('minecraft:water', 1000))
      .EUt(30).duration(320)
  }

  // an uncaught error here would stop the recipe handlers of every script that loads after this one
  ServerEvents.recipes(function (event) {
    try {
      var missing = [GAUZE, 'gtceu:platinum_foil', 'gtceu:rhodium_foil'].filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + 'skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      event.recipes.gtceu.assembler('grindless:platinum_rhodium_gauze')
        .itemInputs('9x gtceu:platinum_foil', '1x gtceu:rhodium_foil')
        .itemOutputs('1x ' + GAUZE)
        .EUt(480).duration(100)
      nitricAcidWithGauze(event)
      REMOVED.forEach(function (id) { event.remove({ id: id }) })
      console.info(LOG + 'gauze assembled, nitric acid from ammonia takes it, ' + REMOVED.length + ' shortcut recipes removed')
    } catch (e) {
      console.error(LOG + 'recipe changes failed: ' + e)
    }
  })
})()
