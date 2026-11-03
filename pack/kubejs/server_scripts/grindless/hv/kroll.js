// priority: -13449
// -----------------------------------------------------------------------------------------------
// D1-KROLL (docs/eras/lines-steam-hv.md, H4; owner decision D-2: titanium stays lunar). The Kroll line at HV, on the lunar ilmenite:
//   1. rutile_from_ilmenite (GTM, unchanged)          ilmenite + carbon -> rutile + wrought iron (steel)
//   2. chlorination (this script, replaces GTM's)     rutile + 2 C + 4,000 Cl2 -> 1,250 crude TiCl4 + 2,000 CO   (480 EU/t, 400 t, as GTM)
//   3. distillery (new)                               1,250 crude -> 1,000 TiCl4 + 1 silica dust. The bottoms are the real impurities, VOCl3 and
//                                                     SiCl4; the distillery has one fluid output, so they leave hydrolysed as silica (glass, silicon)
//   4. titanium_from_tetrachloride (GTM, unchanged)   TiCl4 + 2 Mg -> hot titanium + 6 MgCl2, the vacuum freezer cools it
//   + magnesium loop (new): 3 MgCl2 -> Mg + 2,000 Cl2 in the electrolyzer (GTM's own sodium route salt_from_magnesium_chloride stays, same 3 -> 1);
//     step 4's 6 MgCl2 give 2 Mg + 4,000 Cl2, so the loop closes exactly: the chlorine goes back to step 2.
// CO: methanol or tank (toxic, contained). GTM's chemical reactor and large reactor recipes are both replaced (integration/lcr_mirror.js gives the large
// reactor the copy of ours: GTM copies only recipes built in Java), so no route skips the distillation.
// Titanium gains no Earth source: crude TiCl4 needs rutile, and rutile needs lunar ilmenite (data/grindless/tables/offworld_only.json).
(function () {
  const LOG = '[grindless/hv] Kroll line: '
  const CRUDE = 'gtceu:crude_titanium_tetrachloride'
  const TICL4 = 'gtceu:titanium_tetrachloride'

  ServerEvents.recipes(function (event) {
    try {
      var missingItems = ['gtceu:silicon_dioxide_dust', 'gtceu:carbon_dust', 'gtceu:rutile_dust', 'gtceu:magnesium_chloride_dust', 'gtceu:magnesium_dust'].filter(function (id) { return !Item.exists(id) })
      var missingFluids = [CRUDE, TICL4, 'gtceu:chlorine', 'gtceu:carbon_monoxide'].filter(function (id) { return !Fluid.exists(id) })
      if (missingItems.length > 0 || missingFluids.length > 0) {
        console.error(LOG + 'skipped, unknown id(s): ' + missingItems.concat(missingFluids).join(', '))
        return
      }

      event.remove({ id: 'gtceu:chemical_reactor/titanium_tetrachloride' })
      event.remove({ id: 'gtceu:large_chemical_reactor/titanium_tetrachloride' })
      // one chemical reactor recipe: integration/lcr_mirror.js copies it into the large chemical reactor under the same path, so a
      // second, explicit large reactor recipe would replace the copy
      event.recipes.gtceu.chemical_reactor('grindless:kroll_chlorination_chemical_reactor')
        .itemInputs('2x gtceu:carbon_dust', '1x gtceu:rutile_dust')
        .inputFluids(Fluid.of('gtceu:chlorine', 4000))
        .outputFluids(Fluid.of(CRUDE, 1250), Fluid.of('gtceu:carbon_monoxide', 2000))
        .EUt(480).duration(400)

      event.recipes.gtceu.distillery('grindless:kroll_crude_tetrachloride')
        .circuit(1)
        .inputFluids(Fluid.of(CRUDE, 1250))
        .itemOutputs('1x gtceu:silicon_dioxide_dust')
        .outputFluids(Fluid.of(TICL4, 1000))
        .EUt(120).duration(100)

      event.recipes.gtceu.electrolyzer('grindless:magnesium_chloride_electrolysis')
        .itemInputs('3x gtceu:magnesium_chloride_dust')
        .itemOutputs('1x gtceu:magnesium_dust')
        .outputFluids(Fluid.of('gtceu:chlorine', 2000))
        .EUt(120).duration(150)
    } catch (e) {
      console.error(LOG + 'recipes failed: ' + e)
    }
  })
})()
