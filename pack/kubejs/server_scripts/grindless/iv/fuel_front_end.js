// priority: -16474
// -----------------------------------------------------------------------------------------------
// IV's uranium front end (docs/eras/lines-ev-zpm.md, I1 and D2-3; startup_scripts/grindless/iv/fuel_front_end.js has the materials).
// It loads after iv/foundation.js (-16424), so it can remove that script's zircaloy mixer, and before iv/hot_cell.js (-27666 loads later
// still), so the hot cell's c1 composes from these stages.
//
//   the leach field (iv/uranium_cycle.js and its table) now gives 2,000 mB of gtceu:uranyl_sulfate_liquor a run (2 U), no uraninite
//   1 LARGE CHEMICAL REACTOR   3,000 mB liquor + 1 ion-exchange resin (1 % wear, moved here from the field) -> 3,000 mB uranium eluate +
//                              2,000 mB diluted sulfuric acid (back to the field's acid)
//   2 CHEMICAL REACTOR         3,000 mB eluate + 1,500 mB hydrogen peroxide -> 3 yellowcake + 2,000 mB sulfuric acid
//   3 EBF 700 K                3 yellowcake -> 1 triuranium octoxide + 3,000 mB steam
//   4 EBF 900 K                1 U3O8 + 2,000 mB hydrogen -> 3 uraninite + 2,000 mB steam
//   5 LARGE CHEMICAL REACTOR   3 uraninite + 4,000 mB HF -> 5 uranium tetrafluoride + 2,000 mB water (GTM's UF6 reactor, first half)
//   6 LARGE CHEMICAL REACTOR   5 UF4 + 2,000 mB fluorine -> 1,000 mB UF6 (the second half; the amounts are GTM's own)
//   7 GTM's centrifuge         gtceu:centrifuge/uranium_hexafluoride_separation (kept)
//   8 LARGE CHEMICAL REACTOR   1,000 mB enriched (or depleted) UF6 + 2,000 mB steam + 1,000 mB hydrogen -> 1 U-235 (or U-238) dust +
//                              6,000 mB HF + 2,000 mB water. UF6 is never electrolysed: the fluorine comes back as HF.
//   zircaloy                   MIXER: 63 zirconium sponge (the Hf-free Kroll sponge) + 1 tin -> 64 zircaloy dust, the foundation's
//                              numbers. The foundation's mixer on unseparated zirconium goes: hafnium eats neutrons.
//   retired                    GTM's one-reactor UF6 (both sizes) and both UF6 electrolyses.
// -----------------------------------------------------------------------------------------------

ServerEvents.recipes(function (event) {
  try {
    event.remove({ id: 'gtceu:chemical_reactor/uranium_hexafluoride' })
    event.remove({ id: 'gtceu:large_chemical_reactor/uranium_hexafluoride' })
    event.remove({ id: 'gtceu:electrolyzer/enriched_uranium_hexafluoride_separation' })
    event.remove({ id: 'gtceu:electrolyzer/depleted_uranium_hexafluoride_separation' })
    event.remove({ id: 'grindless:mixer/zircaloy' })

    event.recipes.gtceu.large_chemical_reactor('grindless:uranium_eluate')
      .inputFluids(Fluid.of('gtceu:uranyl_sulfate_liquor', 3000))
      .chancedInput('1x grindless:ion_exchange_resin', 100, 0)
      .outputFluids(Fluid.of('gtceu:uranium_eluate', 3000), Fluid.of('gtceu:diluted_sulfuric_acid', 2000))
      .EUt(1920).duration(200)

    event.recipes.gtceu.chemical_reactor('grindless:yellowcake')
      .inputFluids(Fluid.of('gtceu:uranium_eluate', 3000), Fluid.of('gtceu:hydrogen_peroxide', 1500))
      .itemOutputs('3x gtceu:yellowcake_dust')
      .outputFluids(Fluid.of('gtceu:sulfuric_acid', 2000))
      .EUt(480).duration(200)

    event.recipes.gtceu.electric_blast_furnace('grindless:triuranium_octoxide')
      .itemInputs('3x gtceu:yellowcake_dust')
      .itemOutputs('1x gtceu:triuranium_octoxide_dust')
      .outputFluids(Fluid.of('gtceu:steam', 3000))
      .blastFurnaceTemp(700)
      .EUt(1920).duration(300)

    event.recipes.gtceu.electric_blast_furnace('grindless:uraninite_from_octoxide')
      .itemInputs('1x gtceu:triuranium_octoxide_dust')
      .inputFluids(Fluid.of('gtceu:hydrogen', 2000))
      .itemOutputs('3x gtceu:uraninite_dust')
      .outputFluids(Fluid.of('gtceu:steam', 2000))
      .blastFurnaceTemp(900)
      .EUt(1920).duration(400)

    event.recipes.gtceu.large_chemical_reactor('grindless:uranium_tetrafluoride')
      .itemInputs('3x gtceu:uraninite_dust')
      .inputFluids(Fluid.of('gtceu:hydrofluoric_acid', 4000))
      .itemOutputs('5x gtceu:uranium_tetrafluoride_dust')
      .outputFluids(Fluid.of('minecraft:water', 2000))
      .EUt(1920).duration(300)

    event.recipes.gtceu.large_chemical_reactor('grindless:uranium_hexafluoride')
      .itemInputs('5x gtceu:uranium_tetrafluoride_dust')
      .inputFluids(Fluid.of('gtceu:fluorine', 2000))
      .outputFluids(Fluid.of('gtceu:uranium_hexafluoride', 1000))
      .EUt(3840).duration(300)

    event.recipes.gtceu.large_chemical_reactor('grindless:enriched_uranium_deconversion')
      .inputFluids(Fluid.of('gtceu:enriched_uranium_hexafluoride', 1000), Fluid.of('gtceu:steam', 2000), Fluid.of('gtceu:hydrogen', 1000))
      .itemOutputs('1x gtceu:uranium_235_dust')
      .outputFluids(Fluid.of('gtceu:hydrofluoric_acid', 6000), Fluid.of('minecraft:water', 2000))
      .EUt(1920).duration(200)

    event.recipes.gtceu.large_chemical_reactor('grindless:depleted_uranium_deconversion')
      .inputFluids(Fluid.of('gtceu:depleted_uranium_hexafluoride', 1000), Fluid.of('gtceu:steam', 2000), Fluid.of('gtceu:hydrogen', 1000))
      .itemOutputs('1x gtceu:uranium_dust')
      .outputFluids(Fluid.of('gtceu:hydrofluoric_acid', 6000), Fluid.of('minecraft:water', 2000))
      .EUt(1920).duration(200)

    event.recipes.gtceu.mixer('grindless:zircaloy_from_sponge')
      .itemInputs('63x grindless:zirconium_sponge', '1x gtceu:tin_dust')
      .itemOutputs('64x gtceu:zircaloy_dust')
      .EUt(1920).duration(400)
  } catch (e) {
    console.error('[grindless] uranium front end skipped: ' + e)
  }
})

