// priority: -13724
// -----------------------------------------------------------------------------------------------
// gtceu:reforming recipes of the Catalytic Reformer (gtceu:reformer). GTM has no reforming, so these three are ours, written by hand:
// desulfurized naphtha over a platinum catalyst becomes benzene, toluene and hydrogen. The programmed circuit picks the mix:
//
//   circuit 1  benzene mode    1 000 mB naphtha -> 300 benzene + 150 toluene + 1 200 hydrogen    (80 t at 240 EU/t)
//   circuit 2  toluene mode    1 000 mB naphtha -> 100 benzene + 350 toluene + 1 000 hydrogen
//   circuit 3  hydrogen mode   1 000 mB naphtha -> 150 benzene +  50 toluene + 1 600 hydrogen
// Same energy for all three: 19 200 EU per batch. In a generator the naphtha is worth 320 000 EU and the aromatics of the first mode 153 600
// (benzene 352 EU/mB, toluene 320; GTM's hydrogen is not a fuel), so nothing is made out of nothing. The vessel is HV by its power (240 EU/t)
// and has no parallels.
// Output order = layer order of the machine: benzene (lowest hatch), toluene, hydrogen (top hatch). Every run needs the reforming catalyst
// (grindless:reforming_catalyst: platinum of the End on silica) in the input bus, a chanced input used up in 0.05 % of the runs.
//
// The hydrogen balance (what the numbers are for): the Refinery's crude recipes spend H2 and yield naphtha (global.grindless.refinery.h2).
// Reforming ALL the naphtha of a crude gives back, as a share of the H2 the refining used:
//   oil (medium crude, 50 mB -> 15 / 50 / 20 / 60)      mode 1 104.7 %   mode 2 87.3 %   mode 3 139.6 %    <- roughly closes by itself
//   light oil                                           mode 1  88.2 %   mode 2 73.5 %   mode 3 117.6 %
//   raw oil (a lot of naphtha, little H2)               mode 1 415 %
//   heavy oil (almost no naphtha, a lot of H2)          mode 1  22.5 %   mode 3  30 %                       <- needs H2 from the electrolyzer
// so the crude, the share of the naphtha that goes to the Reformer (the rest: gasoline, cracking) and the mode are the player's decisions.
// The hydrogen cracking of the Refinery (circuit 2) spends 2 000 mB of H2 per 1 000 mB of feed: that H2 is the electrolyzer's.
//
// Published in global.grindless.reformer.recipes for the smoke test:
//   [{ id, name, circuit, fluidsIn: [{ id, amount }], fluidsOut: [...], eut, duration, energy }]
(function () {
  const G = global.grindless || (global.grindless = {})
  const RF = G.reformer || (G.reformer = {})

  const CATALYST = 'grindless:reforming_catalyst'
  const CATALYST_WEAR = 5
  const ID_PREFIX = 'grindless:hv/'

  const NAPHTHA = 'gtceu:naphtha'
  const BENZENE = 'gtceu:benzene'
  const TOLUENE = 'gtceu:toluene'
  const HYDROGEN = 'gtceu:hydrogen'

  const EUT = 240
  const DURATION = 80

  const TABLE = [
    { name: 'benzene', circuit: 1, naphtha: 1000, benzene: 300, toluene: 150, hydrogen: 1200 },
    { name: 'toluene', circuit: 2, naphtha: 1000, benzene: 100, toluene: 350, hydrogen: 1000 },
    { name: 'hydrogen', circuit: 3, naphtha: 1000, benzene: 150, toluene: 50, hydrogen: 1600 }
  ]

  RF.catalyst = CATALYST
  RF.catalystWear = CATALYST_WEAR
  RF.eut = EUT
  RF.duration = DURATION
  RF.recipes = TABLE.map(function (t) {
    return {
      id: 'grindless:reforming/hv/' + t.name,
      name: t.name,
      circuit: t.circuit,
      fluidsIn: [{ id: NAPHTHA, amount: t.naphtha }],
      fluidsOut: [{ id: BENZENE, amount: t.benzene }, { id: TOLUENE, amount: t.toluene }, { id: HYDROGEN, amount: t.hydrogen }],
      eut: EUT,
      duration: DURATION,
      energy: EUT * DURATION
    }
  })

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      addRecipes(event)
    } catch (e) {
      console.error('[grindless/hv] reforming recipes failed: ' + e)
    }
  })

  function addRecipes(event) {
    var missing = [CATALYST].filter(function (id) { return !Item.exists(id) })
      .concat([NAPHTHA, BENZENE, TOLUENE, HYDROGEN].filter(function (id) { return !Fluid.exists(id) }))
    if (missing.length > 0) {
      console.error('[grindless/hv] reforming recipes skipped, unknown id(s): ' + missing.join(', '))
      return
    }
    RF.recipes.forEach(function (r) {
      var recipe = event.recipes.gtceu.reforming(ID_PREFIX + r.name)
        .chancedInput(CATALYST, CATALYST_WEAR, 0)
        .circuit(r.circuit)
      r.fluidsIn.forEach(function (f) { recipe.inputFluids(Fluid.of(f.id, f.amount)) })
      r.fluidsOut.forEach(function (f) { recipe.outputFluids(Fluid.of(f.id, f.amount)) })
      recipe.EUt(r.eut).duration(r.duration)
    })
    console.info('[grindless/hv] reforming recipes added: ' + RF.recipes.length)
  }
})()
