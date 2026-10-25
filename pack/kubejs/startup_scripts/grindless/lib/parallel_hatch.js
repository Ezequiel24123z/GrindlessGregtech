// priority: 997
// -----------------------------------------------------------------------------------------------
// Grindless parallel hatch helper (package IV-B6, docs/eras/iv.md "Nothing one at a time"): GTM's Parallel Control Hatch in our plants,
// the way GTM's GCYM machines take it (GCYMMachines: Predicates.autoAbilities(..., checkParallel) in the pattern and
// GTRecipeModifiers.PARALLEL_HATCH before the overclock).
//
//   global.grindless.parallelHatch.part()            a part predicate in lib/patterns.js's shape ({ kind, ability, limits, build }): one
//                                                    more option of a part cell, Pat.oneOf(casing, ..., PH.part()). At most one hatch per
//                                                    machine (GTM's own limit: a controller reads one parallel hatch). Pat.register()
//                                                    records it like any part (ability 'parallel_hatch'), so the shape and the plain-data
//                                                    description of a pattern don't change, only what one of its cells accepts.
//   global.grindless.parallelHatch.modifier(next)    a recipe modifier: with a hatch in the formed machine, GTM's hatch parallel
//                                                    (GTRecipeModifiers.hatchParallel: as many copies as the hatch's setting, the inputs,
//                                                    the voltage and the output room allow; every content and the EU/t are multiplied,
//                                                    chanced and non-consumed contents are not), then next(machine, scaled) on the scaled
//                                                    recipe; without a hatch, next(machine, recipe) alone, exactly as before.
//   global.grindless.parallelHatch.overclock         GTM's default overclock of an electric multiblock (non-perfect), as a `next`.
//
// Why a helper outside lib/patterns.js: its ABILITIES table has no parallel hatch and patterns.js is not edited (it stays the one place
// that changes for GTM 8.0). This file is the second place that builds a GTM predicate: when GTM 8.0 arrives, part() changes with it.
// What a parallel run costs: GTM multiplies the EU/t by the copies, so the energy hatches must carry the sum (one IV hatch: 8,192 V;
// two IV hatches: 32,768 V, GTM raises the voltage one tier). A non-consumed input (the heavy-water plant's H2S charge, the fuel plant's
// hydrogen) is needed once and never multiplied (FluidRecipeCapability#getMaxParallelByInput skips it; Content#copy leaves it as is).
//
// Same rules as patterns.js: everything inside a function, `var` inside functions that run more than once (Rhino), GTM classes reached
// only when a pattern is built or a recipe modified, so nothing GTM-related runs at script load.
(function () {
  const G = global.grindless || (global.grindless = {})
  const LOG = '[grindless/parallel_hatch] '
  const ABILITY = 'parallel_hatch'
  const LIMITS = { max: 1, preview: 1 }

  function part() {
    return {
      kind: 'part',
      ability: ABILITY,
      limits: { max: LIMITS.max, preview: LIMITS.preview },
      build: function () {
        return Predicates.abilities(PartAbility.PARALLEL_HATCH).setMaxGlobalLimited(LIMITS.max).setPreviewCount(LIMITS.preview)
      }
    }
  }

  // true while the formed machine has a parallel hatch (MultiblockControllerMachine#getParallelHatch)
  function hasHatch(machine) {
    return typeof machine.getParallelHatch === 'function' && machine.getParallelHatch().isPresent()
  }

  function overclock(machine, recipe) {
    return GTRecipeModifiers.OC_NON_PERFECT.getModifier(machine, recipe)
  }

  function modifier(next) {
    var failed = false
    return function (machine, recipe) {
      try {
        if (!hasHatch(machine)) return next(machine, recipe)
        var parallel = GTRecipeModifiers.PARALLEL_HATCH.getModifier(machine, recipe)
        var scaled = parallel.apply(recipe)
        // no copy fits (inputs, voltage or output room): GTM's ParallelLogic has recorded why
        if (scaled === null || scaled === undefined) return ModifierFunction.NULL
        return parallel.andThen(next(machine, scaled))
      } catch (e) {
        if (!failed) {
          failed = true
          console.error(LOG + 'recipe modifier failed: ' + e)
        }
        return ModifierFunction.NULL
      }
    }
  }

  G.parallelHatch = {
    ability: ABILITY,
    limits: LIMITS,
    // the IV hatch (x4, IV-B6's recipe); GTM's LuV, ZPM and UV ones (x16, x64, x256) fit the same cell
    hatches: ['gtceu:iv_parallel_hatch', 'gtceu:luv_parallel_hatch', 'gtceu:zpm_parallel_hatch', 'gtceu:uv_parallel_hatch'],
    part: part,
    hasHatch: hasHatch,
    modifier: modifier,
    overclock: overclock,
    // the plants that take it (IV-B6), for the smoke test and the dump
    machines: ['gtceu:hot_cell', 'gtceu:fuel_fabrication_plant', 'gtceu:heavy_water_plant']
  }
})()
