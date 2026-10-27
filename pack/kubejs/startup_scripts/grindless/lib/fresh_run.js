// priority: 700
// -----------------------------------------------------------------------------------------------
// Grindless "a fresh price every run" helper: IV-B2's freshEveryRun (iv/mercury.js), made reusable.
//
//   global.grindless.freshRun.afterWorking(name)   for the machine builder's .afterWorking(...); name is only for the log
//
// Why: GTM 7.5.3 keeps an idle machine's last recipe for one tick and restarts it without calling its recipe modifier if it can run
// then (RecipeLogic#findAndHandleRecipe: "try to execute last recipe if possible"). A machine whose modifier prices a run when it starts
// (the cryogenic plant's and the tritium facility's night price, the EV tripod's solar wings) would then carry the price of the tick
// before across a sunset or a sunrise. So when a run ends and the next one may not start at once, the logic is marked dirty and the next
// start is a fresh search through the modifier. afterWorking runs before GTM puts this run's outputs away, so the check is GTM's own
// match on a copy of the run with its outputs doubled: inputs for one more run, and room for this run's outputs and the next one's (a
// copy, because the match writes the recipe's bus group). A machine that keeps running is not touched: GTM re-applies the modifier when
// each run ends (alwaysTryModifyRecipe). Proven on the Mercury drill and solar works (IV-B2, gg_test_mercury).
//
// Same rules as patterns.js: everything inside a function, `var` inside functions that run more than once (Rhino), GTM classes loaded
// lazily so nothing GTM-related runs at script load.
(function () {
  const G = global.grindless || (global.grindless = {})
  const LOG = '[grindless/fresh_run] '

  var LC = null
  function lazy() {
    if (LC === null) {
      LC = {
        RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
        ContentModifier: Java.loadClass('com.gregtechceu.gtceu.api.recipe.content.ContentModifier')
      }
    }
    return LC
  }

  function afterWorking(name) {
    var failed = false
    var doubled = null
    return function (machine) {
      try {
        var logic = machine.getRecipeLogic()
        var last = logic.getLastRecipe()
        if (last != null) {
          if (doubled === null) doubled = ModifierFunction.builder().outputModifier(lazy().ContentModifier.multiplier(2)).build()
          var probe = doubled.apply(last)
          if (probe != null && lazy().RecipeHelper.matchRecipe(machine, probe).isSuccess()) return
        }
        logic.markLastRecipeDirty()
      } catch (e) {
        if (!failed) {
          failed = true
          console.error(LOG + name + ': could not mark the last recipe dirty: ' + e)
        }
      }
    }
  }

  G.freshRun = { afterWorking: afterWorking }
})()
