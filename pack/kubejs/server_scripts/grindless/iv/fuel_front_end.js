// priority: -20000
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
  var LOG = '[grindless] '
  var RETIRED = [
    'gtceu:chemical_reactor/uranium_hexafluoride',
    'gtceu:large_chemical_reactor/uranium_hexafluoride',
    'gtceu:electrolyzer/enriched_uranium_hexafluoride_separation',
    'gtceu:electrolyzer/depleted_uranium_hexafluoride_separation',
    'grindless:mixer/zircaloy'
  ]
  RETIRED.forEach(function (id) { event.remove({ id: id }) })

  var RESIN = 'grindless:ion_exchange_resin'
  var SPONGE = 'grindless:zirconium_sponge'

  // rows: type, name, itemsIn / fluidsIn ([id, amount]), itemsOut / fluidsOut, wear (chanced input), temp, eut, duration
  var ROWS = [
    { type: 'large_chemical_reactor', name: 'uranium_eluate',
      fluidsIn: [['gtceu:uranyl_sulfate_liquor', 3000]], wear: [[RESIN, 100]],
      fluidsOut: [['gtceu:uranium_eluate', 3000], ['gtceu:diluted_sulfuric_acid', 2000]], eut: 1920, duration: 200 },
    { type: 'chemical_reactor', name: 'yellowcake',
      fluidsIn: [['gtceu:uranium_eluate', 3000], ['gtceu:hydrogen_peroxide', 1500]],
      itemsOut: [['gtceu:yellowcake_dust', 3]], fluidsOut: [['gtceu:sulfuric_acid', 2000]], eut: 480, duration: 200 },
    { type: 'electric_blast_furnace', name: 'triuranium_octoxide',
      itemsIn: [['gtceu:yellowcake_dust', 3]], itemsOut: [['gtceu:triuranium_octoxide_dust', 1]],
      fluidsOut: [['gtceu:steam', 3000]], temp: 700, eut: 1920, duration: 300 },
    { type: 'electric_blast_furnace', name: 'uraninite_from_octoxide',
      itemsIn: [['gtceu:triuranium_octoxide_dust', 1]], fluidsIn: [['gtceu:hydrogen', 2000]],
      itemsOut: [['gtceu:uraninite_dust', 3]], fluidsOut: [['gtceu:steam', 2000]], temp: 900, eut: 1920, duration: 400 },
    { type: 'large_chemical_reactor', name: 'uranium_tetrafluoride',
      itemsIn: [['gtceu:uraninite_dust', 3]], fluidsIn: [['gtceu:hydrogen_fluoride', 4000]],
      itemsOut: [['gtceu:uranium_tetrafluoride_dust', 5]], fluidsOut: [['gtceu:water', 2000]], eut: 1920, duration: 300 },
    { type: 'large_chemical_reactor', name: 'uranium_hexafluoride',
      itemsIn: [['gtceu:uranium_tetrafluoride_dust', 5]], fluidsIn: [['gtceu:fluorine', 2000]],
      fluidsOut: [['gtceu:uranium_hexafluoride', 1000]], eut: 3840, duration: 300 },
    { type: 'large_chemical_reactor', name: 'enriched_uranium_deconversion',
      fluidsIn: [['gtceu:enriched_uranium_hexafluoride', 1000], ['gtceu:steam', 2000], ['gtceu:hydrogen', 1000]],
      itemsOut: [['gtceu:uranium_235_dust', 1]], fluidsOut: [['gtceu:hydrogen_fluoride', 6000], ['gtceu:water', 2000]], eut: 1920, duration: 200 },
    { type: 'large_chemical_reactor', name: 'depleted_uranium_deconversion',
      fluidsIn: [['gtceu:depleted_uranium_hexafluoride', 1000], ['gtceu:steam', 2000], ['gtceu:hydrogen', 1000]],
      itemsOut: [['gtceu:uranium_238_dust', 1]], fluidsOut: [['gtceu:hydrogen_fluoride', 6000], ['gtceu:water', 2000]], eut: 1920, duration: 200 },
    { type: 'mixer', name: 'zircaloy_from_sponge',
      itemsIn: [[SPONGE, 63], ['gtceu:tin_dust', 1]], itemsOut: [['gtceu:zircaloy_dust', 64]], eut: 1920, duration: 400 }
  ]

  function missing(r) {
    var out = []
    ;(r.itemsIn || []).concat(r.itemsOut || [], r.wear || []).forEach(function (x) { if (!Item.exists(x[0])) out.push(x[0]) })
    ;(r.fluidsIn || []).concat(r.fluidsOut || []).forEach(function (x) { if (!Fluid.exists(x[0])) out.push(x[0]) })
    return out
  }

  ROWS.forEach(function (r) {
    var gone = missing(r)
    if (gone.length > 0) {
      console.error(LOG + 'uranium front end skipped ' + r.name + ': unknown id(s) ' + gone.join(', '))
      return
    }
    try {
      var b = event.recipes.gtceu[r.type]('grindless:' + r.name)
      ;(r.itemsIn || []).forEach(function (x) { b.itemInputs(x[1] + 'x ' + x[0]) })
      ;(r.wear || []).forEach(function (x) { b.chancedInput('1x ' + x[0], x[1], 0) })
      ;(r.fluidsIn || []).forEach(function (x) { b.inputFluids(Fluid.of(x[0], x[1])) })
      ;(r.itemsOut || []).forEach(function (x) { b.itemOutputs(x[1] + 'x ' + x[0]) })
      ;(r.fluidsOut || []).forEach(function (x) { b.outputFluids(Fluid.of(x[0], x[1])) })
      if (r.temp) b.blastFurnaceTemp(r.temp)
      b.EUt(r.eut).duration(r.duration)
    } catch (e) {
      console.error(LOG + 'uranium front end skipped ' + r.name + ': the builder failed: ' + e)
    }
  })

  console.info(LOG + 'uranium front end: ' + ROWS.length + ' rows, ' + RETIRED.length + ' retired')
})
