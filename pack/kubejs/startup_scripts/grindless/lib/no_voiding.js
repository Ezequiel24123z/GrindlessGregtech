// priority: 600
// -----------------------------------------------------------------------------------------------
// Grindless "keep what you make" helper: a machine that must not throw its outputs away refuses to run while its controller is set to
// void them (GTM's IVoidable voiding mode). The mechanism of grindless.steam_outputs.no_voiding (ev/combined_cycle_and_hot_mill.js),
// made reusable, with the hole it had closed:
//
//   global.grindless.noVoiding.voids(machine, which)      true while the controller voids that kind of output; which = 'items',
//                                                          'fluids' or 'both' (either kind)
//   global.grindless.noVoiding.modifier(opts, next)       a recipe modifier (register it with alwaysTryModifyRecipe = true): while the
//                                                          controller voids, it cancels the run with Text.translate(opts.reason), which
//                                                          GTM shows as the controller's failure reason; otherwise it returns
//                                                          next(machine, recipe) (GTM's overclock, a generator helper's modifier...)
//   global.grindless.noVoiding.beforeWorking(opts)        for the machine builder's .beforeWorking(...): the same refusal at the start of
//                                                          every run
//   opts: { which: 'items' | 'fluids' | 'both', reason: '<lang key>', name: '<machine name for the log>' }
//
// Why both: GTM 7.5.3 restarts an idle machine's cached last recipe without its modifier (RecipeLogic#findAndHandleRecipe: "try to
// execute last recipe if possible"), and with voiding on its start check skips the room for the voided outputs (RecipeRunner skips a
// voidable capability when simulating). A machine that waits with a cached recipe (its inputs ran out) and is then set to void would run
// one more time, and void what does not fit. RecipeLogic#setupRecipe calls the definition's beforeWorking on every start, so the refusal
// sits there too. A refused start leaves the logic idle with nothing to search (it unsubscribes until something changes), so
// beforeWorking records the reason itself, the way GTM records a failed match (RecipeLogic.putFailureReason: given the machine, only
// its (Object, GTRecipe, Component) overload applies). Switching voiding off wakes the logic (WorkableMultiblockMachine#setVoidingMode).
// Proven on the IV leach field (gg_test_uranium_cycle: no_voiding, resumes).
//
// Same rules as patterns.js: everything inside a function, `var` inside functions that run more than once (Rhino), GTM classes loaded
// lazily so nothing GTM-related runs at script load.
(function () {
  const G = global.grindless || (global.grindless = {})
  const LOG = '[grindless/no_voiding] '

  var LC = null
  function lazy() {
    if (LC === null) {
      LC = {
        ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
        FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
        RecipeLogic: Java.loadClass('com.gregtechceu.gtceu.api.machine.trait.RecipeLogic')
      }
    }
    return LC
  }

  function voids(machine, which) {
    var c = lazy()
    var items = which === 'items' || which === 'both'
    var fluids = which === 'fluids' || which === 'both'
    if (!items && !fluids) throw new Error(LOG + 'which must be items, fluids or both (got ' + which + ')')
    return (items && machine.canVoidRecipeOutputs(c.ItemCap) === true) || (fluids && machine.canVoidRecipeOutputs(c.FluidCap) === true)
  }

  function modifier(opts, next) {
    var failed = false
    var cancel = null
    return function (machine, recipe) {
      try {
        if (voids(machine, opts.which)) {
          if (cancel === null) cancel = ModifierFunction.cancel(Text.translate(opts.reason))
          return cancel
        }
      } catch (e) {
        if (!failed) {
          failed = true
          console.error(LOG + opts.name + ': voiding check failed: ' + e)
        }
        return ModifierFunction.NULL
      }
      return next(machine, recipe)
    }
  }

  function beforeWorking(opts) {
    var failed = false
    var text = null
    return function (machine, recipe) {
      var refuse = false
      try {
        refuse = voids(machine, opts.which)
      } catch (e) {
        if (!failed) {
          failed = true
          console.error(LOG + opts.name + ': voiding check before a run failed: ' + e)
        }
        return true
      }
      if (!refuse) return true
      try {
        if (recipe !== null && recipe !== undefined) {
          if (text === null) text = Text.translate(opts.reason)
          lazy().RecipeLogic.putFailureReason(machine, recipe, text)
        }
        machine.getRecipeLogic().markLastRecipeDirty()
      } catch (e2) {
        if (!failed) {
          failed = true
          console.error(LOG + opts.name + ': could not record why it refused a run: ' + e2)
        }
      }
      return false
    }
  }

  G.noVoiding = {
    voids: voids,
    modifier: modifier,
    beforeWorking: beforeWorking
  }
})()
