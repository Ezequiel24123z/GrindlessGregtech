// priority: 450
// -----------------------------------------------------------------------------------------------
// Grindless mega library (package MEGA-0, docs/eras/mega.md 4.1 and 6.3): what every mega machine shares, proven by MEGA-S
// (S-M1 and S-M2, tools/test/overlay/kubejs/startup_scripts/gg_test_mega_spike_machines.js).
//
//   global.grindless.mega.coilParallel(cap)         a recipe modifier: 2^floor(K/900) copies (K = the coil's temperature), at most `cap`
//                                                   (null: no cap), cut to what the inputs and the output room allow
//                                                   (ParallelLogic.getParallelAmount) and, first, to what the energy hatches carry:
//                                                   floor(max input voltage / the recipe's EU/t). GTM's getParallelAmount does NOT check
//                                                   EU (S-M1), so without that cap a machine would start a run its hatches cannot pay;
//                                                   every copy costs the recipe's full EU/t (family rule 1)
//   global.grindless.mega.fixedParallel(cap, hatch) the same core with a fixed ceiling cap; coilParallel(cap, hatch) too: with hatch true the
//                                                   ceiling is min(base, cap) x the formed parallel hatch's parallel (cap before the hatch)
//   global.grindless.mega.coilDiscount(rate, floor, baseK)
//                                                   a recipe modifier: the EU/t times rate^steps, steps = floor((K - baseK) / 900)
//                                                   (baseK 1800, Cupronickel), never below `floor`; GTM's EBF coil rate is 0.95 and
//                                                   0.80 (family rule 2: nothing is discounted further)
//   global.grindless.mega.withHatch(next)           lib/parallel_hatch.js's modifier: a formed parallel hatch scales the recipe first,
//                                                   then next(machine, recipe) runs on the scaled one; without a hatch, next alone
//   global.grindless.mega.chain(opts)               the modifier list in the order S-M1 proved: parallel, discount, overclock, batch.
//                                                   opts { parallel: 'coil' (default) | 'fixed' | 'hatch' (legacy: GTM's parallel hatch, no energy cap) | 'none', cap (fixed: the
//                                                   ceiling), hatch: true multiplies coil/fixed by the formed parallel hatch, discount: { rate, floor,
//                                                   baseK } | null, oc: 'perfect' (default) | 'nonperfect' | 'none', batch: true }
//   global.grindless.mega.install(builder, list)    builder.recipeModifiers(true, ...list): the overclock must come before the batch
//                                                   and `true` makes GTM run the modifiers on every recipe, as S-M1 did
//   global.grindless.mega.modules(blockIds)         S-M2: { socket(), of(machine), gate(needByRecipeType, next) }. socket() is a pattern
//                                                   predicate (lib/patterns.js shape) that accepts any of the blocks and records
//                                                   position -> block id in the match context ('GGModules'); of(machine) reads them back
//                                                   from a formed controller; gate(...) vetoes (ModifierFunction.cancel) a recipe whose
//                                                   type needs a module block that is not in a socket, else runs next
//   global.grindless.mega.formulas                  the pure arithmetic (no GTM class), for tools/analysis/test/mega-lib.test.mjs
//
// Same rules as lib/patterns.js: everything inside a function, `var` inside functions that run more than once (Rhino), GTM classes
// loaded when a pattern is built or a recipe modified, so nothing GTM-related runs at script load.
// Load order (tools/analysis/script_order.json): after lib/parallel_hatch.js (withHatch reuses it) and lib/coils.js, before every era script.
(function () {
  const G = global.grindless || (global.grindless = {})
  const LOG = '[grindless/mega] '
  const STEP_K = 900
  const BASE_K = 1800
  const MATCH_KEY = 'GGModules'
  const failedOnce = {}

  function once(key, e) {
    if (failedOnce[key]) return
    failedOnce[key] = true
    console.error(LOG + key + ' failed: ' + e)
  }

  // ---------------------------------------------------------------- pure formulas
  // 2^floor(K / 900), at most cap (null or undefined: only the exponent bound that keeps the number an int)
  function coilCeiling(kelvin, cap) {
    var steps = Math.floor(Number(kelvin) / STEP_K)
    if (!(steps >= 0)) return 1
    var n = Math.pow(2, Math.min(steps, 30))
    if (cap !== null && cap !== undefined) n = Math.min(n, cap)
    return Math.max(1, n)
  }

  // how many copies the hatches pay for: floor(max voltage / EU per tick of one copy); no cost, no cap
  function energyCap(maxVoltage, recipeEut) {
    var eut = Math.abs(Number(recipeEut))
    if (!(eut > 0)) return Infinity
    var v = Number(maxVoltage)
    if (!(v > 0)) return 0
    return Math.floor(v / eut)
  }

  // the ceiling cut by the energy cap, then by what getParallelAmount found for the inputs and the output room
  function parallels(ceiling, energy, byInputs) {
    var n = Math.min(ceiling, energy)
    if (byInputs !== null && byInputs !== undefined) n = Math.min(n, byInputs)
    return n < 1 ? 0 : Math.floor(n)
  }

  // rate per coil step above baseK, never below floor; baseK defaults to Cupronickel
  function discountMultiplier(kelvin, rate, floor, baseK) {
    var base = baseK === null || baseK === undefined ? BASE_K : baseK
    var steps = Math.max(0, Math.floor((Number(kelvin) - base) / STEP_K))
    var m = Math.pow(rate, steps)
    return Math.max(floor, Math.min(1, m))
  }

  // base ceiling cut by cap (null: none), times the formed parallel hatch's parallel (1 without one): the cap applies before the hatch
  function ceiling(base, cap, hatchParallel) {
    var b = Math.max(1, Number(base))
    if (cap !== null && cap !== undefined) b = Math.min(b, cap)
    var h = Number(hatchParallel)
    return Math.max(1, b) * (h >= 1 ? Math.floor(h) : 1)
  }

  const formulas = {
    ceiling: ceiling,
    stepKelvin: STEP_K,
    baseKelvin: BASE_K,
    coilCeiling: coilCeiling,
    energyCap: energyCap,
    parallels: parallels,
    discountMultiplier: discountMultiplier
  }

  // ---------------------------------------------------------------- GTM glue
  function classes() {
    return {
      PL: Java.loadClass('com.gregtechceu.gtceu.api.recipe.modifier.ParallelLogic'),
      CM: Java.loadClass('com.gregtechceu.gtceu.api.recipe.content.ContentModifier'),
      RH: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper')
    }
  }

  function recipeEut(recipe) {
    var RH = classes().RH
    try {
      return Number(RH.getRealEUt(recipe).getTotalEU())
    } catch (e) {
      return Number(RH.getInputEUt(recipe))
    }
  }

  // the EU/t the formed machine's energy hatches carry (GTM raises the voltage tier when several hatches add up)
  function maxVoltage(machine) {
    var v = 0
    try { if (typeof machine.getMaxVoltage === 'function') v = Number(machine.getMaxVoltage()) } catch (e) { }
    if (!(v > 0)) {
      try { v = Number(machine.energyContainer.getInputVoltage()) } catch (e) { }
    }
    return v > 0 ? v : 0
  }

  function scaling(n) {
    var C = classes()
    return ModifierFunction.builder().modifyAllContents(C.CM.multiplier(n)).eutMultiplier(n).parallels(n).build()
  }

  // the parallel of the formed parallel hatch (machine.getParallelHatch(), an Optional); 1 without one
  function hatchParallel(machine) {
    try {
      var o = machine.getParallelHatch()
      if (o !== null && o !== undefined && o.isPresent()) return Number(o.get().getCurrentParallel())
    } catch (e) { }
    return 1
  }

  // the shared core: ceiling(machine) -> energy cap floor(maxVoltage / recipe EU/t) -> ParallelLogic.getParallelAmount
  function bound(name, ceilingOf) {
    return function (machine, recipe) {
      try {
        var want = parallels(ceilingOf(machine), energyCap(maxVoltage(machine), recipeEut(recipe)), null)
        if (want < 1) return ModifierFunction.NULL
        var n = classes().PL.getParallelAmount(machine, recipe, want)
        if (n < 1) return ModifierFunction.NULL
        if (n === 1) return ModifierFunction.IDENTITY
        return scaling(n)
      } catch (e) {
        once(name, e)
        return ModifierFunction.NULL
      }
    }
  }

  // hatch (default false): multiply the ceiling by the formed parallel hatch's parallel; cap applies to the base, before it
  function coilParallel(cap, hatch) {
    return bound('coilParallel', function (machine) {
      return ceiling(coilCeiling(G.coils.temperature(machine), null), cap, hatch ? hatchParallel(machine) : 1)
    })
  }

  function fixedParallel(cap, hatch) {
    return bound('fixedParallel', function (machine) {
      return ceiling(cap, null, hatch ? hatchParallel(machine) : 1)
    })
  }
  function coilDiscount(rate, floor, baseK) {
    return function (machine, recipe) {
      try {
        var m = discountMultiplier(G.coils.temperature(machine), rate, floor, baseK)
        if (m >= 1) return ModifierFunction.IDENTITY
        return ModifierFunction.builder().eutMultiplier(m).build()
      } catch (e) {
        once('coilDiscount', e)
        return ModifierFunction.NULL
      }
    }
  }

  function withHatch(next) {
    return G.parallelHatch.modifier(next)
  }

  // modifier objects of GTM (GTRecipeModifiers.OC_*, BATCH_MODE) answer getModifier(machine, recipe); our own are plain functions
  function modifierOf(m, machine, recipe) {
    return typeof m === 'function' ? m(machine, recipe) : m.getModifier(machine, recipe)
  }

  // the modifiers one after the other, each on the recipe the previous one left (what recipeModifiers does with its list)
  function sequence(list) {
    return function (machine, recipe) {
      var cur = recipe
      var acc = null
      for (var i = 0; i < list.length; i++) {
        var mf = modifierOf(list[i], machine, cur)
        if (mf === null || mf === undefined || mf === ModifierFunction.NULL) return ModifierFunction.NULL
        var scaled = mf.apply(cur)
        if (scaled === null || scaled === undefined) return ModifierFunction.NULL
        acc = acc === null ? mf : acc.andThen(mf)
        cur = scaled
      }
      return acc === null ? ModifierFunction.IDENTITY : acc
    }
  }

  function chain(opts) {
    var o = opts || {}
    var parallel = o.parallel || 'coil'
    var oc = o.oc === undefined ? 'perfect' : o.oc
    var tail = []
    if (o.discount) tail.push(coilDiscount(o.discount.rate, o.discount.floor, o.discount.baseK))
    if (oc === 'perfect') tail.push(GTRecipeModifiers.OC_PERFECT_SUBTICK)
    else if (oc === 'nonperfect') tail.push(GTRecipeModifiers.OC_NON_PERFECT)
    if (o.batch !== false) tail.push(GTRecipeModifiers.BATCH_MODE)
    if (parallel === 'hatch') return [withHatch(sequence(tail))]
    var cap = o.cap === undefined ? null : o.cap
    if (parallel === 'coil') return [coilParallel(cap, o.hatch === true)].concat(tail)
    if (parallel === 'fixed') return [fixedParallel(cap, o.hatch === true)].concat(tail)
    return tail
  }

  // Rhino does not convert a JS array to Java varargs reliably: one argument per modifier, as the proven S-M1 call
  function install(builder, list) {
    switch (list.length) {
      case 1: return builder.recipeModifiers(true, list[0])
      case 2: return builder.recipeModifiers(true, list[0], list[1])
      case 3: return builder.recipeModifiers(true, list[0], list[1], list[2])
      case 4: return builder.recipeModifiers(true, list[0], list[1], list[2], list[3])
      case 5: return builder.recipeModifiers(true, list[0], list[1], list[2], list[3], list[4])
      default: throw new Error(LOG + 'install: 1 to 5 modifiers supported (got ' + list.length + ')')
    }
  }

  // ---------------------------------------------------------------- modules (S-M2)
  function modules(blockIds) {
    var ids = blockIds.slice()

    function socket() {
      return {
        kind: 'blocks',
        blocks: ids.slice(),
        build: function () {
          var HM = Java.loadClass('java.util.HashMap')
          var blocks = ids.map(function (id) { return Block.getBlock(id) })
          return Predicates.custom(function (state) {
            var bs = state.getBlockState()
            for (var i = 0; i < blocks.length; i++) {
              if (bs.is(blocks[i])) {
                var map = state.getMatchContext().getOrCreate(MATCH_KEY, function () { return new HM() })
                map.put(String(state.getPos().asLong()), ids[i])
                return true
              }
            }
            return false
          }, Predicates['blocks(net.minecraft.world.level.block.Block[])'](blocks).common.get(0).candidates)
        }
      }
    }

    function of(machine) {
      var out = []
      var map = machine.getMultiblockState().getMatchContext().get(MATCH_KEY)
      if (map === null || map === undefined) return out
      var it = map.values().iterator()
      while (it.hasNext()) out.push(String(it.next()))
      return out
    }

    // need: { '<recipe type id>': '<module block id>' }; a type without an entry needs no module
    function gate(need, next) {
      return function (machine, recipe) {
        try {
          var type = String(recipe.recipeType.registryName)
          var want = need[type]
          if (want !== undefined && of(machine).indexOf(want) < 0) {
            return ModifierFunction.cancel(Text.literal('Module missing: ' + want))
          }
          return next(machine, recipe)
        } catch (e) {
          once('modules.gate', e)
          return ModifierFunction.NULL
        }
      }
    }

    return { socket: socket, of: of, gate: gate, matchKey: MATCH_KEY }
  }

  G.mega = {
    coilParallel: coilParallel,
    fixedParallel: fixedParallel,
    coilDiscount: coilDiscount,
    withHatch: withHatch,
    chain: chain,
    install: install,
    modules: modules,
    maxVoltage: maxVoltage,
    formulas: formulas
  }
})()
