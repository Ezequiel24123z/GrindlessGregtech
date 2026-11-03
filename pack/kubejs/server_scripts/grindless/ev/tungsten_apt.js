// priority: -13125
// -----------------------------------------------------------------------------------------------
// D2-APT (docs/eras/lines-ev-zpm.md, section 2 E3 and D2-2): Mars scheelite to tungsten through ammonium paratungstate, the real
// route (tungstic acid cannot be electrolysed to the metal). GTM's bath (scheelite -> tungstic acid + CaCl2) is unchanged.
//
//   3  dissolution       chemical reactor  7 tungstic acid + 2,000 mB NH3 + 1,000 mB water -> 1,000 mB ammonium tungstate solution
//   4  Mo removal        chemical reactor  1,000 mB solution + 1 sodium sulfide -> 1,000 mB solution + 1 molybdenite
//   5  crystallisation   distillery        1,000 mB solution -> 1 APT + 1,000 mB NH3 (back to 3); 800 mB of water leaves as vapour
//   6  calcination       EBF 900 K         1 APT -> 4 tungsten trioxide + 1,000 mB NH3 (back to 3); 1,200 mB of water leaves as vapour
//   7  reduction         EBF 1,200 K       4 tungsten trioxide + 6,000 mB H2 -> 1 tungsten dust + 3,000 mB water
//
// Units follow GTM: items are counted by atoms (one mole of tungstic acid is 7 dusts, of WO3 4), 1,000 mB of a fluid is one mole.
// Per mole of W: ammonia 2,000 mB in (3), 1,000 back at 5 and 1,000 at 6; water 1,000 in at 3, 800 + 1,200 out at 5 and 6 (the
// solvent plus the acid's own water); WO3 + 3 H2 -> W + 3 H2O at 7. 3-7 cost about 1.15 M EU per tungsten at 1,920 EU/t.
// Step 4's molybdenite (and the sodium) is the trace Mo of the Martian concentrate: it goes to GTM's molybdenum roast.
//
// Retired: gtceu:electrolyzer/tungstic_acid_electrolysis. The cascade's UXV scheelite_tungstic_acid and tungsten_charge stay.
// Steps 3 and 4 are chemical reactor rows: GTM copies them into the large chemical reactor at runtime.
(function () {
  const G = global.grindless || (global.grindless = {})
  const TA = G.evTungstenApt || (G.evTungstenApt = {})
  const LOG = '[grindless/ev] '

  const ACID = 'gtceu:tungstic_acid_dust'
  const NH3 = 'gtceu:ammonia'
  const WATER = 'gtceu:water'
  const SOLUTION = 'gtceu:ammonium_tungstate'
  const APT = 'gtceu:ammonium_paratungstate_dust'
  const WO3 = 'gtceu:tungsten_trioxide_dust'

  TA.retired = ['gtceu:electrolyzer/tungstic_acid_electrolysis']

  TA.recipes = [
    {
      name: 'ammoniacal_dissolution', type: 'chemical_reactor', id: 'grindless:ev/tungsten_dissolution',
      itemsIn: [{ id: ACID, count: 7 }], fluidsIn: [{ id: NH3, amount: 2000 }, { id: WATER, amount: 1000 }],
      itemsOut: [], fluidsOut: [{ id: SOLUTION, amount: 1000 }], eut: 1920, duration: 100
    },
    {
      name: 'molybdenum_removal', type: 'chemical_reactor', id: 'grindless:ev/tungsten_mo_removal',
      itemsIn: [{ id: 'gtceu:sodium_sulfide_dust', count: 1 }], fluidsIn: [{ id: SOLUTION, amount: 1000 }],
      itemsOut: [{ id: 'gtceu:molybdenite_dust', count: 1 }], fluidsOut: [{ id: SOLUTION, amount: 1000 }], eut: 1920, duration: 100
    },
    {
      name: 'apt_crystallisation', type: 'distillery', id: 'grindless:ev/apt_crystallisation',
      itemsIn: [], fluidsIn: [{ id: SOLUTION, amount: 1000 }],
      itemsOut: [{ id: APT, count: 1 }], fluidsOut: [{ id: NH3, amount: 1000 }], eut: 1920, duration: 100
    },
    {
      name: 'apt_calcination', type: 'electric_blast_furnace', id: 'grindless:ev/apt_calcination', temp: 900,
      itemsIn: [{ id: APT, count: 1 }], fluidsIn: [],
      itemsOut: [{ id: WO3, count: 4 }], fluidsOut: [{ id: NH3, amount: 1000 }], eut: 1920, duration: 150
    },
    {
      name: 'hydrogen_reduction', type: 'electric_blast_furnace', id: 'grindless:ev/tungsten_reduction', temp: 1200,
      itemsIn: [{ id: WO3, count: 4 }], fluidsIn: [{ id: 'gtceu:hydrogen', amount: 6000 }],
      itemsOut: [{ id: 'gtceu:tungsten_dust', count: 1 }], fluidsOut: [{ id: WATER, amount: 3000 }], eut: 1920, duration: 150
    }
  ]
  TA.skipped = []

  function missingIds(r) {
    var missing = []
    r.itemsIn.concat(r.itemsOut).forEach(function (x) { if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    r.fluidsIn.concat(r.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  ServerEvents.recipes(function (event) {
    try {
      TA.retired.forEach(function (id) { event.remove({ id: id }) })
      TA.recipes.forEach(function (r) {
        var missing = missingIds(r)
        if (missing.length > 0) {
          TA.skipped.push({ name: r.name, reason: 'unknown id(s) ' + missing.join(', ') })
          console.error(LOG + 'tungsten apt skipped ' + r.name + ': unknown id(s) ' + missing.join(', '))
          return
        }
        var recipe = event.recipes.gtceu[r.type](r.id)
        r.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
        r.fluidsIn.forEach(function (f) { recipe.inputFluids(Fluid.of(f.id, f.amount)) })
        r.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
        r.fluidsOut.forEach(function (f) { recipe.outputFluids(Fluid.of(f.id, f.amount)) })
        if (r.temp) recipe.blastFurnaceTemp(r.temp)
        recipe.EUt(r.eut).duration(r.duration)
      })
    } catch (e) {
      console.error(LOG + 'tungsten apt recipes failed: ' + e)
    }
  })
})()
