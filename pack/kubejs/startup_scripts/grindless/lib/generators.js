// priority: 999
// -----------------------------------------------------------------------------------------------
// Grindless generator multiblock helper: the one working way, on GTM 7.5.3, for a multiblock registered from KubeJS to GENERATE EU
// through dynamo hatches. The LV Generator Array (power/generator_array.js) uses it; the later generator multiblocks (EV lunar solar
// array and combined-cycle plant, IV fission reactor) are meant to use it too. Patterns still go through lib/patterns.js (the dynamo
// hatch is its part 'energy_output').
//
// How GTM 7.5.3 does it (read in its source, then proven on the bench by tools/test/overlay/.../gg_test_power_generators.js):
//   - event.create(id, 'multiblock') returns GTM's own MultiblockMachineBuilder (KJSWrappingMultiblockBuilder.createKJSMulti) whose
//     default controller is WorkableElectricMultiblockMachine, the superclass of GTM's Large Combustion Engine.
//   - .generator(true) marks the definition as a generator, so WorkableElectricMultiblockMachine#getMaxVoltage reads the dynamo
//     hatches instead of energy input hatches.
//   - A generator recipe carries its EU as tickOutputs.eu (in a KubeJS recipe: .EUt(-x)). Every tick RecipeLogic#handleTickRecipe
//     pushes it into the controller's EU OUT handlers, the NotifiableEnergyContainer of each dynamo hatch (PartAbility.OUTPUT_ENERGY),
//     filling them in order (NotifiableEnergyContainer#handleRecipeInner). Each hatch then sends up to its voltage x amperage per
//     tick out of its front face, into the cable, battery buffer or machine there. When every hatch is full the run waits.
//   - .regressWhenWaiting(false), as GTM's own generators (SimpleGeneratorMachine, LargeCombustionEngineMachine, LargeTurbineMachine).
//     With the default (true) a waiting run goes back to progress 1 and then pays EU again for ticks it already paid: the same
//     fuel would give more energy every time the output backs up. That is energy from nothing (AGENTS.md rule 8).
//   - The recipe modifier below is LargeCombustionEngineMachine#recipeModifier without the lubricant and the oxygen boost: n copies
//     of the recipe (inputs and outputs x n, EU/t x n, the same duration), so the EU per unit of fuel is exactly the single block's.
//     n = min(the cap, what the dynamo hatches carry / EU per run, what the fuel in the hatches allows). No overclock.
//     The dynamo limit is the SUM of voltage x amperage over the hatches, read hatch by hatch (GTM 7.5.3's standard dynamo hatch is
//     2 A: an LV one carries 64 EU/t). GTM's own limit (EURecipeCapability, through getOverclockVoltage) reads EnergyContainerList,
//     which folds the amps into a tier voltage and then ignores them when it cannot: one LV hatch (32 V, 2 A) reads as 32 V, one run
//     of 32 EU/t instead of two. ParallelLogic#getParallelAmountWithoutEU skips that limit and still checks the fuel and the room for
//     the other outputs (the steam turbine's distilled water).
//   - Custom generator recipe types (later packages): register them with .setEUIO('out') and write their recipes with .EUt(-x). In
//     GTM 7.5.3's source nothing else in the recipe pipeline looks at the recipe type, but the bench only proved the stock types:
//     give the first custom type one in-game EU check. If they double their duration like the stock fuels, add them to the TYPES
//     list of server_scripts/grindless/power/generators.js.
//
// Use:
//   var Gen = global.grindless.generators
//   Gen.configure(event.create('my_generator', 'multiblock'), { maxParallels: 16, name: 'my_generator' })
//     .recipeTypes(...).pattern(...) ...
//   configure() sets .generator(true), .regressWhenWaiting(false), the recipe modifier (re-run before every run) and the extra
//   controller lines. The pieces are public too: modifier(opts) is a RecipeModifier, display(opts) a BiConsumer for
//   .additionalDisplay(), dynamoCapacity(machine) the EU/t the dynamo hatches carry, recipeEUt(recipe) the EU/t a recipe makes.
//
// opts: maxParallels  a number, or function (machine) -> number (for example a count of panels); default 1
//       veto          function (machine, recipe) -> true to refuse that recipe (optional)
//       name          used in log lines (optional)
//
// Lang keys (client_scripts/grindless/power_generator_array_lang.js): grindless.generators.capacity / .output / .dynamo_too_small.
// Everything sits in one IIFE (one scope for every startup script), and only `var` is used inside the functions, which run many
// times (this Rhino throws "redeclaration of var" otherwise).
(function () {
  var G = global.grindless || (global.grindless = {})
  var LOG = '[grindless/generators] '

  var C = null
  function lazy() {
    if (C === null) {
      C = {
        IO: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.IO'),
        EUCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.EURecipeCapability').CAP,
        ContentModifier: Java.loadClass('com.gregtechceu.gtceu.api.recipe.content.ContentModifier'),
        ParallelLogic: Java.loadClass('com.gregtechceu.gtceu.api.recipe.modifier.ParallelLogic'),
        RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper')
      }
    }
    return C
  }

  // EU/t the machine's dynamo hatches can send out per tick: voltage x amperage summed over every EU output handler
  function dynamoCapacity(machine) {
    var c = lazy()
    var handlers = machine.getCapabilitiesFlat(c.IO.OUT, c.EUCap)
    var total = 0
    for (var i = 0; i < handlers.size(); i++) {
      var h = handlers.get(i)
      if (typeof h.getOutputVoltage !== 'function' || typeof h.getOutputAmperage !== 'function') continue
      total += Number(h.getOutputVoltage()) * Number(h.getOutputAmperage())
    }
    return total
  }

  // EU/t the recipe makes (all its parallel runs together); 0 when it makes none (a recipe that uses EU, or none at all)
  function recipeEUt(recipe) {
    var io = lazy().RecipeHelper.getRealEUtWithIO(recipe)
    if (io.isEmpty() || io.isInput()) return 0
    return Number(io.getTotalEU())
  }

  function capOf(opts, machine) {
    var cap = opts.maxParallels === undefined ? 1 : opts.maxParallels
    if (typeof cap === 'function') cap = cap(machine)
    cap = Math.floor(Number(cap))
    return cap > 0 ? cap : 0
  }

  // the recipe modifier: n parallel runs of a generator recipe, the same EU per unit of fuel, the dynamo hatches as the limit
  function modifier(opts) {
    var o = opts || {}
    var tooSmall = null
    var failed = false
    return function (machine, recipe) {
      try {
        var eut = recipeEUt(recipe)
        if (!(eut > 0)) return ModifierFunction.NULL
        if (o.veto && o.veto(machine, recipe)) return ModifierFunction.NULL
        var cap = capOf(o, machine)
        if (cap < 1) return ModifierFunction.NULL
        var byDynamo = Math.floor(dynamoCapacity(machine) / eut)
        if (byDynamo < 1) {
          if (tooSmall === null) tooSmall = ModifierFunction.cancel(Text.translate('grindless.generators.dynamo_too_small'))
          return tooSmall
        }
        var c = lazy()
        var runs = c.ParallelLogic.getParallelAmountWithoutEU(machine, recipe, Math.min(cap, byDynamo))
        if (runs < 1) return ModifierFunction.NULL
        return ModifierFunction.builder()
          .inputModifier(c.ContentModifier.multiplier(runs))
          .outputModifier(c.ContentModifier.multiplier(runs))
          .eutMultiplier(runs)
          .parallels(runs)
          .build()
      } catch (e) {
        if (!failed) {
          failed = true
          console.error(LOG + (o.name || 'generator') + ' recipe modifier failed: ' + e)
        }
        return ModifierFunction.NULL
      }
    }
  }

  // extra controller lines (GTM's own lines already show the parallels and the working status): what the dynamo hatches carry and,
  // while running, the EU/t being made
  function display(opts) {
    var o = opts || {}
    var failed = false
    return function (controller, list) {
      try {
        if (!controller.isFormed()) return
        var capacity = dynamoCapacity(controller)
        var logic = controller.getRecipeLogic()
        var last = logic.getLastRecipe()
        if (logic.isActive() && last !== null && last !== undefined) {
          list.add(Text.translate('grindless.generators.output', String(Math.round(recipeEUt(last))), String(last.parallels),
            String(capOf(o, controller))))
        }
        list.add(Text.translate('grindless.generators.capacity', String(Math.round(capacity))))
      } catch (e) {
        if (!failed) {
          failed = true
          console.error(LOG + (o.name || 'generator') + ' controller display failed: ' + e)
        }
      }
    }
  }

  function configure(builder, opts) {
    return builder
      .generator(true)
      .regressWhenWaiting(false)
      .recipeModifier(modifier(opts), true)
      .additionalDisplay(display(opts))
  }

  G.generators = {
    GTM_VERSION: '7.5.3',
    configure: configure,
    modifier: modifier,
    display: display,
    dynamoCapacity: dynamoCapacity,
    recipeEUt: recipeEUt
  }
})()
