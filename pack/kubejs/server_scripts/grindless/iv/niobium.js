// priority: -16924
// -----------------------------------------------------------------------------------------------
// IV's niobium and tantalum line (D2-NIOBIUM, docs/eras/lines-ev-zpm.md section 3 I4).
//
//   kiln (iv/fluorspar_kiln.js)   11 pyrochlore dust + 9,000 mB HF -> 2 niobium oxyfluoride dust + 6 fluorite dust (the 2 CaF2, back to the
//                                 kiln's charge) + 4,500 mB water (Ca2Nb2O6F + 9 HF -> 2 NbOF3 + 2 CaF2 + 4.5 H2O).
//   cascade (ev/extraction_cascade.js, c12 columbite_niobium_split)  4 NbOF3 + water -> 2 Nb2O5 + HF; (c9 tantalum_cut) -> 2 K2TaF7.
//   EBF 2,200 K   3 Nb2O5 + 10 Al -> 6 Nb + 5 Al2O3, the alumina as 25 GTM sapphire dust (GTM counts a compound's dust by atom).
//   EBF 1,800 K   2 K2TaF7 + 10 Na -> 2 Ta + 4 KF + 10 NaF (14 alkali fluoride dust, the kiln's hf_from_alkali_fluoride feed).
//
// Retired: gtceu:electrolyzer/decomposition_electrolyzing_pyrochlore (11 pyrochlore -> 2 Ca, 2 Nb, 6 O, 1 F) skipped the whole line.
// Destinations: sapphire -> aluminium (electrolyser) or the grower; alkali fluoride and fluorite -> the kiln; HF loops in the cascade.
//
// Published for the test: global.grindless.niobium = { removed, recipes: [ids] }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var G = global.grindless || (global.grindless = {})
  var N = G.niobium || (G.niobium = {})
  var LOG = '[grindless/iv] '

  N.removed = 'gtceu:electrolyzer/decomposition_electrolyzing_pyrochlore'
  N.rows = [
    {
      name: 'niobium_aluminothermic',
      temp: 2200, eut: 1920, duration: 400,
      itemsIn: [{ id: 'gtceu:niobium_pentoxide_dust', count: 3 }, { id: 'gtceu:aluminium_dust', count: 10 }],
      itemsOut: [{ id: 'gtceu:niobium_dust', count: 6 }, { id: 'gtceu:sapphire_dust', count: 25 }]
    },
    {
      name: 'tantalum_sodium_reduction',
      temp: 1800, eut: 1920, duration: 400,
      itemsIn: [{ id: 'grindless:k2taf7_dust', count: 2 }, { id: 'gtceu:sodium_dust', count: 10 }],
      itemsOut: [{ id: 'gtceu:tantalum_dust', count: 2 }, { id: 'grindless:alkali_fluoride_dust', count: 14 }]
    }
  ]
  N.recipes = []

  G.recipes('iv/niobium', function (event) {
    event.remove({ id: N.removed })
    N.recipes = []
    N.rows.forEach(function (r) {
      var ids = r.itemsIn.concat(r.itemsOut).map(function (x) { return x.id })
      var missing = ids.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + 'niobium row ' + r.name + ' skipped, unknown id(s): ' + missing.join(', '))
        return
      }
      event.recipes.gtceu.electric_blast_furnace('grindless:' + r.name)
        .itemInputs(r.itemsIn.map(function (x) { return x.count + 'x ' + x.id }))
        .itemOutputs(r.itemsOut.map(function (x) { return x.count + 'x ' + x.id }))
        .blastFurnaceTemp(r.temp)
        .EUt(r.eut)
        .duration(r.duration)
      N.recipes.push('grindless:' + r.name)
    })
    console.info(LOG + 'niobium: ' + N.removed + ' removed, ' + N.recipes.length + ' EBF rows')
  })
})()
