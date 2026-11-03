// -----------------------------------------------------------------------------------------------
// D2-REE (docs/eras/lines-ev-zpm.md, section 2 E1 and section 9 D2-1): the samaric branch of EV's rare-earth trunk, GTCA's bastnasite
// line, charted. Two steps are ours on the large chemical reactor; the split between them is the cascade's seg_split mode
// (circuit 3, ev/extraction_cascade.js).
//
//   16'  SEG dissolution        1 samaric rare earth concentrate dust + 2,000 mB hydrochloric acid -> 1,000 mB SEG chloride solution
//                               1,920 EU/t, 100 t
//   17'  SEG split (cascade)    1,000 mB SEG solution + 500 mB HCl strip + 1,000 mB kerosene -> 500 mB europium chloride solution
//                               + 1,000 mB heavy rare earth chloride solution + 950 mB kerosene
//   18'  fluoride precipitation 1,000 mB heavy chloride solution + 2,000 mB hydrofluoric acid -> 1 fluorinated samaric concentrate dust
//                               + 2,000 mB hydrochloric acid (back to 16')                                  1,920 EU/t, 100 t
//
// The concentrate and its fluorinated form are GTCA's (gtca:samaric_rare_earth_concentrate_dust, gtca:fluorinated_samaric_concentrate_dust);
// the fluorinated concentrate still goes to grindless:electric_blast_furnace/offworld_only/flsamaric_to_ho (8 -> 1 holmium, unchanged).
// Units follow GTM: 1,000 mB of a fluid is one mole, one concentrate dust is one mole of rare earth. 16' spends the 2,000 mB of HCl
// that 18' gives back, so the acid loop closes with no outside HCl; the 500 mB of strip acid of 17' is fresh HCl from
// the pack's chlorine and hydrogen. The europium solution is stored for ZPM's reductor (zpm/europium.js); no step gives samarium.
//
// Retired:
//   gtceu:chemical_reactor/samaric_to_flsamaric (and its large twin)  GTCA fluorinated the whole concentrate, europium included
//   gtceu:electrolyzer/decomposition_electrolyzing_bastnasite         GTM's one-step 6 bastnasite -> cerium: a bypass of the whole line
//                                                                     (its row in tables/offworld_only.json goes with it)
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  const G = global.grindless || (global.grindless = {})
  const RE = G.evRareEarths || (G.evRareEarths = {})
  const LOG = '[grindless/ev] '

  const CONCENTRATE = 'gtca:samaric_rare_earth_concentrate_dust'
  const FLUORINATED = 'gtca:fluorinated_samaric_concentrate_dust'
  const HCL = 'gtceu:hydrochloric_acid'
  const HF = 'gtceu:hydrofluoric_acid'
  const SEG = 'gtceu:seg_chloride_solution'
  const HEAVY = 'gtceu:heavy_rare_earth_chloride_solution'
  const TYPE = 'large_chemical_reactor'

  RE.retired = [
    'gtceu:chemical_reactor/samaric_to_flsamaric',
    'gtceu:large_chemical_reactor/samaric_to_flsamaric',
    'gtceu:electrolyzer/decomposition_electrolyzing_bastnasite'
  ]

  RE.recipes = [
    {
      name: 'seg_dissolution', id: 'grindless:ev/seg_dissolution', recipeId: 'grindless:' + TYPE + '/ev/seg_dissolution',
      itemsIn: [{ id: CONCENTRATE, count: 1 }], fluidsIn: [{ id: HCL, amount: 2000 }],
      itemsOut: [], fluidsOut: [{ id: SEG, amount: 1000 }],
      eut: 1920, duration: 100
    },
    {
      name: 'fluoride_precipitation', id: 'grindless:ev/fluoride_precipitation', recipeId: 'grindless:' + TYPE + '/ev/fluoride_precipitation',
      itemsIn: [], fluidsIn: [{ id: HEAVY, amount: 1000 }, { id: HF, amount: 2000 }],
      itemsOut: [{ id: FLUORINATED, count: 1 }], fluidsOut: [{ id: HCL, amount: 2000 }],
      eut: 1920, duration: 100
    }
  ]
  RE.skipped = []

  function missingIds(r) {
    var missing = []
    r.itemsIn.concat(r.itemsOut).forEach(function (x) { if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    r.fluidsIn.concat(r.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  ServerEvents.recipes(function (event) {
    try {
      RE.retired.forEach(function (id) { event.remove({ id: id }) })
      RE.recipes.forEach(function (r) {
        var missing = missingIds(r)
        if (missing.length > 0) {
          RE.skipped.push({ name: r.name, reason: 'unknown id(s) ' + missing.join(', ') })
          console.error(LOG + 'rare earths skipped ' + r.name + ': unknown id(s) ' + missing.join(', '))
          return
        }
        var recipe = event.recipes.gtceu.large_chemical_reactor(r.id)
        r.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
        r.fluidsIn.forEach(function (f) { recipe.inputFluids(Fluid.of(f.id, f.amount)) })
        r.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
        r.fluidsOut.forEach(function (f) { recipe.outputFluids(Fluid.of(f.id, f.amount)) })
        recipe.EUt(r.eut).duration(r.duration)
      })
    } catch (e) {
      console.error(LOG + 'rare earths recipes failed: ' + e)
    }
  })
})()
