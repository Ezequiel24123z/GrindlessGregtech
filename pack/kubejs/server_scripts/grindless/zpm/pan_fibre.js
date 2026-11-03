// priority: -27223
// -----------------------------------------------------------------------------------------------
// Recipes of ZPM's PAN carbon fibre (docs/eras/lines-ev-zpm.md section 5, Z4; package D2-PAN): Titan's nitriles become carbon fibre.
// Every row is ZPM voltage; carbon, hydrogen and nitrogen are conserved from acrylonitrile on (1,000 mB a molecule, one dust or item a monomer,
// elemental gases 1,000 mB an atom). The nitrile mix is an abstract blend (tholin hydrolysate), so the cut is the first balanced row.
//
//   2  distillation_tower   2,000 mB nitrile mix -> 8,000 mB acrylonitrile + 2,000 mB hydrogen cyanide + 2,000 mB methane
//   3  large_chemical_reactor   circuit 1  8,000 mB acrylonitrile + 1,000 mB sodium persulfate (initiator, not used up) -> 8 polyacrylonitrile
//   4  chemical_bath        circuit 1  8 polyacrylonitrile + water coagulation bath (not used up) -> 8 PAN precursor fibre (wet spinning)
//   5  electric_blast_furnace  550 K, circuit 1  8 precursor fibre + 8,000 mB oxygen -> 8 stabilised fibre + 8,000 mB water (C3H3N + O -> C3HN + H2O)
//   6  electric_blast_furnace  1,600 K, circuit 2  8 stabilised fibre + nitrogen blanket (not used up) -> 16 carbon fibres + 8,000 mB hydrogen cyanide
//                                                  (C3HN -> 2 C + HCN)
// Destinations: hydrogen cyanide -> GTM's glycolonitrile and calcium ferrocyanide rows; methane -> the qubit line's CVD diamond;
// water is inert and may be voided; ammonia is no longer made here (the reformer's circuit 3 only consumes it).
// Published: global.grindless.zpmPanFibre.recipes [{ name, type, recipeId, ... }], .skipped.
(function () {
  var LOG = '[grindless/zpm] '
  var G = global.grindless || (global.grindless = {})
  var PF = G.zpmPanFibre || (G.zpmPanFibre = {})

  var ZPM_VA = 122880
  var ACN = 'gtceu:acrylonitrile'
  var PAN = 'gtceu:polyacrylonitrile'
  var PRE = 'grindless:pan_precursor_fibre'
  var STAB = 'grindless:stabilised_pan_fibre'
  var HCN = 'gtceu:hydrogen_cyanide'

  PF.recipes = [
    { name: 'acrylonitrile_cut', type: 'distillation_tower', circuit: 0,
      itemsIn: [], notConsumed: [], fluidsIn: [{ id: 'gtceu:titan_nitriles', amount: 2000 }], fluidsKept: [],
      itemsOut: [], fluidsOut: [{ id: ACN, amount: 8000 }, { id: HCN, amount: 2000 }, { id: 'gtceu:methane', amount: 2000 }], eut: ZPM_VA, duration: 400 },
    { name: 'polyacrylonitrile', type: 'large_chemical_reactor', circuit: 1,
      itemsIn: [], notConsumed: [], fluidsIn: [{ id: ACN, amount: 8000 }], fluidsKept: [{ id: 'gtceu:sodium_persulfate', amount: 1000 }],
      itemsOut: [{ id: PAN, count: 8 }], fluidsOut: [], eut: ZPM_VA, duration: 300 },
    { name: 'pan_wet_spinning', type: 'chemical_bath', circuit: 1,
      itemsIn: [{ id: PAN, count: 8 }], notConsumed: [], fluidsIn: [], fluidsKept: [{ id: 'minecraft:water', amount: 1000 }],
      itemsOut: [{ id: PRE, count: 8 }], fluidsOut: [], eut: ZPM_VA, duration: 200 },
    { name: 'pan_stabilisation', type: 'electric_blast_furnace', circuit: 1, temp: 550,
      itemsIn: [{ id: PRE, count: 8 }], notConsumed: [], fluidsIn: [{ id: 'gtceu:oxygen', amount: 8000 }], fluidsKept: [],
      itemsOut: [{ id: STAB, count: 8 }], fluidsOut: [{ id: 'minecraft:water', amount: 8000 }], eut: ZPM_VA, duration: 300 },
    { name: 'pan_carbonisation', type: 'electric_blast_furnace', circuit: 2, temp: 1600,
      itemsIn: [{ id: STAB, count: 8 }], notConsumed: [], fluidsIn: [], fluidsKept: [{ id: 'gtceu:nitrogen', amount: 1000 }],
      itemsOut: [{ id: 'gtceu:carbon_fibers', count: 16 }], fluidsOut: [{ id: HCN, amount: 8000 }], eut: ZPM_VA, duration: 400 }
  ].map(function (t) {
    t.recipeId = 'grindless:' + t.type + '/' + t.name
    t.id = 'grindless:' + t.name
    return t
  })
  PF.skipped = []

  function missingIds(r) {
    var missing = []
    var items = r.itemsIn.map(function (x) { return x.id }).concat(r.itemsOut.map(function (x) { return x.id }), r.notConsumed)
    items.forEach(function (id) { if (!Item.exists(id) && missing.indexOf(id) < 0) missing.push(id) })
    r.fluidsIn.concat(r.fluidsOut, r.fluidsKept).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  ServerEvents.recipes(function (event) {
    try {
      PF.recipes.forEach(function (r) {
        var missing = missingIds(r)
        if (missing.length > 0) {
          PF.skipped.push({ name: r.name, reason: 'unknown id(s) ' + missing.join(', ') })
          console.error(LOG + 'pan fibre skipped ' + r.name + ': unknown id(s) ' + missing.join(', '))
          return
        }
        var recipe = event.recipes.gtceu[r.type](r.id)
        r.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
        r.notConsumed.forEach(function (id) { recipe.notConsumable(id) })
        if (r.circuit > 0) recipe.circuit(r.circuit)
        r.fluidsIn.forEach(function (f) { recipe.inputFluids(Fluid.of(f.id, f.amount)) })
        r.fluidsKept.forEach(function (f) { recipe.notConsumableFluid(Fluid.of(f.id, f.amount)) })
        r.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
        r.fluidsOut.forEach(function (f) { recipe.outputFluids(Fluid.of(f.id, f.amount)) })
        if (r.temp) recipe.blastFurnaceTemp(r.temp)
        recipe.EUt(r.eut).duration(r.duration)
      })
      console.info(LOG + 'pan fibre recipes added: ' + (PF.recipes.length - PF.skipped.length))
    } catch (e) { console.error(LOG + 'pan fibre recipes failed: ' + e) }
  })
})()
