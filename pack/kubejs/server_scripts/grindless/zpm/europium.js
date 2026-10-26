// -----------------------------------------------------------------------------------------------
// gtceu:valence_reduction recipes of ZPM's europium reductor (gtceu:europium_reductor; machine, type and materials:
// startup_scripts/grindless/zpm/europium.js; docs/eras/zpm.md "Machine 3"; package ZPM-A3), the recipe that makes the controller, and the
// change to GTCA's monazite froth line that makes the reductor the only source of europium. The programmed circuit picks the step:
//
//   circuit 1  reduction   2,000 mB europium chloride solution + 1 zinc dust + 3,000 mB sulfuric acid (+ 144 mB mercury, the amalgam bath,
//                          not consumed) -> 2 europium sulfate + 1 zinc sulfate + 6,000 mB hydrochloric acid + 2,000 mB depleted
//                          rare earth chloride solution
//                              2 EuCl3 + Zn + 3 H2SO4 -> 2 EuSO4 + ZnSO4 + 6 HCl       (balanced in every element)
//   circuit 2  roasting    4 europium sulfate + 1,000 mB oxygen -> 2 europium oxide + 4,000 mB sulfur trioxide
//                              4 EuSO4 + O2 -> 2 Eu2O3 + 4 SO3
//   circuit 3  reduction   1 europium oxide + 2 lanthanum dust -> 2 europium dust + 1 lanthanum oxide
//                              Eu2O3 + 2 La -> 2 Eu + La2O3
//   circuit 4  recovery    1 zinc sulfate + 2,000 mB hydrogen -> 1 zinc dust + 1,000 mB sulfur dioxide + 2,000 mB water
//                              ZnSO4 + 2 H2 -> Zn + SO2 + 2 H2O
//   circuit 5  recovery    1 lanthanum oxide + 3 carbon dust -> 2 lanthanum dust + 3,000 mB carbon monoxide
//                              La2O3 + 3 C -> 2 La + 3 CO
// 1,000 mB of a fluid is one mole, as in the cascade. All five are ZPM recipes (122,880 EU/t): 40 t, then 20 t each. Two europium cost
// 4.9 + 1.2 + 2.5 = 8.6 million EU in the reductor (about 4.3 million each), well under the Mk1's roughly 14.2 million per ingot.
//
// Destinations (rule 3 of AGENTS.md): hydrochloric acid goes back to the cascade's leach; the depleted solution is the cascade's own
// leach liquor (gtceu:rare_earth_chloride_solution) and re-enters its circuit 2, so the cerium, neodymium and the rest go on to the fuel
// works; sulfur trioxide + water -> sulfuric acid (GTM's chemical reactor) closes the sulfate loop; zinc sulfate and lanthanum oxide go
// back to their metals in circuits 4 and 5, so the zinc and the lanthanum of circuits 1 and 3 are recycled. Nothing is voided and nothing
// is dangerous but the mercury, which never leaves the bath.
//
// GTCA's monazite froth line: GTCA's thermal reactor splits the froth into red mud, water, lanthanum, lutetium AND europium dust
// (gtceu:thermal_reactor/monazite_froth: 64 + 48 + 48 dust). The europium output is dropped here (the recipe is replaced by
// grindless:thermal_reactor/monazite_froth_no_europium, everything else equal), so the froth line stops at the chlorides: the cascade's
// circuit 5 (ev/extraction_cascade.js) makes the europium chloride solution and this machine the metal (DECISIONS: europium only through the
// reductor).
//
// Lookup safety: the five recipes have different programmed circuits and no one's ingredient keys contain another's (checked at load).
// Published in global.grindless.europiumReductor: .recipes [{ name, recipeId, circuit, itemsIn, fluidsIn, notConsumed, itemsOut, fluidsOut,
// eut, duration }], .skipped, .clashes, .craftingRecipe, .craftingParts, .froth { removedId, newRecipeId }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/zpm] '
  var G = global.grindless || (global.grindless = {})
  var ER = G.europiumReductor || (G.europiumReductor = {})

  var TYPE_PATH = 'valence_reduction'
  var ZPM_VA = 122880

  var LIQUOR = 'gtceu:europium_chloride_solution'
  var DEPLETED = 'gtceu:rare_earth_chloride_solution'
  var SULFATE = 'gtceu:europium_sulfate_dust'
  var OXIDE = 'gtceu:europium_oxide_dust'
  var ZN_SO4 = 'gtceu:zinc_sulfate_dust'
  var LA_OXIDE = 'gtceu:lanthanum_oxide_dust'
  var EUROPIUM = 'gtceu:europium_dust'
  var LANTHANUM = 'gtceu:lanthanum_dust'
  var LUTETIUM = 'gtceu:lutetium_dust'
  var ZINC = 'gtceu:zinc_dust'
  var FROTH = 'gtca:monazite_froth'
  var RED_MUD = 'gtca:red_mud_slurry'

  var TABLE = [
    {
      name: 'reduction', circuit: 1,
      itemsIn: [{ id: ZINC, count: 1 }],
      fluidsIn: [{ id: LIQUOR, amount: 2000 }, { id: 'gtceu:sulfuric_acid', amount: 3000 }],
      notConsumed: [{ id: 'gtceu:mercury', amount: 144 }],
      itemsOut: [{ id: SULFATE, count: 2 }, { id: ZN_SO4, count: 1 }],
      fluidsOut: [{ id: 'gtceu:hydrochloric_acid', amount: 6000 }, { id: DEPLETED, amount: 2000 }],
      eut: ZPM_VA, duration: 40
    },
    {
      name: 'roasting', circuit: 2,
      itemsIn: [{ id: SULFATE, count: 4 }],
      fluidsIn: [{ id: 'gtceu:oxygen', amount: 1000 }],
      notConsumed: [],
      itemsOut: [{ id: OXIDE, count: 2 }],
      fluidsOut: [{ id: 'gtceu:sulfur_trioxide', amount: 4000 }],
      eut: ZPM_VA, duration: 20
    },
    {
      name: 'metallothermic_reduction', circuit: 3,
      itemsIn: [{ id: OXIDE, count: 1 }, { id: LANTHANUM, count: 2 }],
      fluidsIn: [],
      notConsumed: [],
      itemsOut: [{ id: EUROPIUM, count: 2 }, { id: LA_OXIDE, count: 1 }],
      fluidsOut: [],
      eut: ZPM_VA, duration: 20
    },
    {
      name: 'zinc_recovery', circuit: 4,
      itemsIn: [{ id: ZN_SO4, count: 1 }],
      fluidsIn: [{ id: 'gtceu:hydrogen', amount: 2000 }],
      notConsumed: [],
      itemsOut: [{ id: ZINC, count: 1 }],
      fluidsOut: [{ id: 'gtceu:sulfur_dioxide', amount: 1000 }, { id: 'minecraft:water', amount: 2000 }],
      eut: ZPM_VA, duration: 20
    },
    {
      name: 'lanthanum_recovery', circuit: 5,
      itemsIn: [{ id: LA_OXIDE, count: 1 }, { id: 'gtceu:carbon_dust', count: 3 }],
      fluidsIn: [],
      notConsumed: [],
      itemsOut: [{ id: LANTHANUM, count: 2 }],
      fluidsOut: [{ id: 'gtceu:carbon_monoxide', amount: 3000 }],
      eut: ZPM_VA, duration: 20
    }
  ]

  ER.recipes = TABLE.map(function (t) {
    return {
      name: t.name, id: 'grindless:' + t.name, recipeId: 'grindless:' + TYPE_PATH + '/' + t.name, circuit: t.circuit,
      itemsIn: t.itemsIn, fluidsIn: t.fluidsIn, notConsumed: t.notConsumed, itemsOut: t.itemsOut, fluidsOut: t.fluidsOut,
      eut: t.eut, duration: t.duration, energy: t.eut * t.duration
    }
  })
  ER.skipped = []
  ER.clashes = []

  var HULL = 'gtceu:zpm_machine_hull'
  var PUMP = 'gtceu:zpm_electric_pump'
  ER.craftingParts = [HULL, PUMP, ER.machine || 'gtceu:europium_reductor']
  ER.craftingRecipe = 'grindless:crafting/europium_reductor'

  var FROTH_ORIGINAL = 'gtceu:thermal_reactor/monazite_froth'
  var FROTH_NEW = 'grindless:thermal_reactor/monazite_froth_no_europium'
  ER.froth = { removedId: FROTH_ORIGINAL, newRecipeId: FROTH_NEW, replaced: false }

  function keysOf(r) {
    var keys = {}
    r.itemsIn.forEach(function (x) { keys['i:' + x.id] = true })
    r.fluidsIn.concat(r.notConsumed).forEach(function (x) { keys['f:' + x.id] = true })
    keys['circuit:' + r.circuit] = true
    return keys
  }

  function subset(a, b) {
    return Object.keys(a).every(function (k) { return b[k] === true })
  }

  function clashes() {
    var out = []
    for (var i = 0; i < ER.recipes.length; i++) {
      for (var j = i + 1; j < ER.recipes.length; j++) {
        var a = keysOf(ER.recipes[i])
        var b = keysOf(ER.recipes[j])
        if (subset(a, b) || subset(b, a)) out.push(ER.recipes[i].name + ' / ' + ER.recipes[j].name)
      }
    }
    return out
  }

  function missingIds(r) {
    var missing = []
    r.itemsIn.concat(r.itemsOut).forEach(function (x) { if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    r.fluidsIn.concat(r.notConsumed, r.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function addReductions(event) {
    ER.clashes = clashes()
    if (ER.clashes.length > 0) console.error(LOG + 'europium reductor recipes clash in the lookup: ' + ER.clashes.join(', '))
    ER.recipes.forEach(function (r) {
      var missing = missingIds(r)
      if (missing.length > 0) {
        ER.skipped.push({ name: r.name, reason: 'unknown id(s) ' + missing.join(', ') })
        console.error(LOG + 'europium reductor skipped ' + r.name + ': unknown id(s) ' + missing.join(', '))
        return
      }
      var recipe = event.recipes.gtceu.valence_reduction(r.id)
      r.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
      recipe.circuit(r.circuit)
      r.fluidsIn.forEach(function (f) { recipe.inputFluids(Fluid.of(f.id, f.amount)) })
      r.notConsumed.forEach(function (f) { recipe.notConsumableFluid(Fluid.of(f.id, f.amount)) })
      r.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
      r.fluidsOut.forEach(function (f) { recipe.outputFluids(Fluid.of(f.id, f.amount)) })
      recipe.EUt(r.eut).duration(r.duration)
    })
    console.info(LOG + 'europium reductor recipes added: ' + (ER.recipes.length - ER.skipped.length))
  }

  // CRAFTING TABLE: ZPM hull + 2 ZPM pumps (the column's circulation) + 4 ZPM circuits
  function addCrafting(event) {
    var missing = ER.craftingParts.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'europium reductor crafting skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.shaped('gtceu:europium_reductor', ['CPC', ' H ', 'CPC'], {
      C: '#gtceu:circuits/zpm',
      P: PUMP,
      H: HULL
    }).id(ER.craftingRecipe)
  }

  // GTCA's froth reactor without the europium
  function replaceFroth(event) {
    var missing = [LANTHANUM, LUTETIUM].filter(function (id) { return !Item.exists(id) })
      .concat([FROTH, RED_MUD, 'minecraft:water'].filter(function (id) { return !Fluid.exists(id) }))
    if (missing.length > 0) {
      console.error(LOG + 'GTCA monazite froth recipe left as it is, unknown id(s): ' + missing.join(', '))
      return
    }
    event.remove({ id: FROTH_ORIGINAL })
    event.recipes.gtceu.thermal_reactor('grindless:monazite_froth_no_europium')
      .inputFluids(Fluid.of(FROTH, 4000))
      .outputFluids(Fluid.of(RED_MUD, 2000), Fluid.of('minecraft:water', 2000))
      .itemOutputs('64x ' + LANTHANUM, '48x ' + LUTETIUM)
      .EUt(122880).duration(2400)
    ER.froth.replaced = true
  }

  ServerEvents.recipes(function (event) {
    try { addReductions(event) } catch (e) { console.error(LOG + 'europium reductor recipes failed: ' + e) }
    try { addCrafting(event) } catch (e2) { console.error(LOG + 'europium reductor crafting recipe failed: ' + e2) }
    try { replaceFroth(event) } catch (e3) { console.error(LOG + 'GTCA froth replacement failed: ' + e3) }
  })
})()
