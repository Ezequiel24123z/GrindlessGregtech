// TEST ONLY, MEGA-S spikes (docs/eras/mega.md 3.1). Throwaway registrations, never shipped; ids gtceu:gg_spike_*.
//   S-M1  gtceu:gg_spike_lcr_chain         a coil machine (Coils.create) on gtceu:large_chemical_reactor with the chain
//                                          coil parallel -> OC_PERFECT_SUBTICK -> BATCH_MODE
//   S-M2  gtceu:gg_spike_modules           macerator + compressor; module sockets filled by one of two casing blocks, read from
//                                          the pattern match context; a modifier vetoes the type whose module is absent
//   S-M3  gtceu:uhv_gg_spike_parallel_hatch  GTM's ParallelHatchPartMachine at tier 9 (PartAbility.PARALLEL_HATCH)
//         gtceu:gg_spike_ebf               a coil machine that takes the hatch through lib/parallel_hatch.js
// The chain parallel is the one mega.md names: 2^floor(K/900), capped at 64, then ParallelLogic.getParallelAmount.
(function () {
  var LOG = '[gg_test mega_spike] '
  var MODULES = ['gtceu:heatproof_machine_casing', 'gtceu:stable_machine_casing']
  var NEED = { 'gtceu:macerator': MODULES[0], 'gtceu:compressor': MODULES[1] }
  var failedOnce = {}

  function once(key, e) {
    if (failedOnce[key]) return
    failedOnce[key] = true
    console.error(LOG + key + ' failed: ' + e)
  }

  // ---------------------------------------------------------------- S-M1
  function coilParallel(machine, recipe) {
    try {
      var G = global.grindless
      var k = G.coils.temperature(machine)
      var want = Math.min(64, Math.pow(2, Math.floor(k / 900)))
      var PL = Java.loadClass('com.gregtechceu.gtceu.api.recipe.modifier.ParallelLogic')
      var CM = Java.loadClass('com.gregtechceu.gtceu.api.recipe.content.ContentModifier')
      var n = PL.getParallelAmount(machine, recipe, want)
      if (n < 1) return ModifierFunction.NULL
      if (n === 1) return ModifierFunction.IDENTITY
      return ModifierFunction.builder().modifyAllContents(CM.multiplier(n)).eutMultiplier(n).parallels(n).build()
    } catch (e) {
      once('coilParallel', e)
      return ModifierFunction.NULL
    }
  }

  // ---------------------------------------------------------------- S-M2
  function modulesOf(machine) {
    var map = machine.getMultiblockState().getMatchContext().get('GGModules')
    var out = []
    if (map === null || map === undefined) return out
    var it = map.values().iterator()
    while (it.hasNext()) out.push(String(it.next()))
    return out
  }

  function moduleGate(machine, recipe) {
    try {
      var type = String(recipe.recipeType.registryName)
      var need = NEED[type]
      if (need === undefined) return GTRecipeModifiers.OC_NON_PERFECT.getModifier(machine, recipe)
      if (modulesOf(machine).indexOf(need) < 0) return ModifierFunction.cancel(Text.literal('gg spike: module ' + need + ' absent'))
      return GTRecipeModifiers.OC_NON_PERFECT.getModifier(machine, recipe)
    } catch (e) {
      once('moduleGate', e)
      return ModifierFunction.NULL
    }
  }

  function moduleSocket() {
    return {
      kind: 'blocks',
      blocks: MODULES.slice(),
      build: function () {
        var BI = Java.loadClass('com.lowdragmc.lowdraglib.utils.BlockInfo')
        var HM = Java.loadClass('java.util.HashMap')
        var blocks = MODULES.map(function (id) { return Block.getBlock(id) })
        return Predicates.custom(function (state) {
          var bs = state.getBlockState()
          for (var i = 0; i < blocks.length; i++) {
            if (bs.is(blocks[i])) {
              var map = state.getMatchContext().getOrCreate('GGModules', function () { return new HM() })
              map.put(String(state.getPos().asLong()), MODULES[i])
              return true
            }
          }
          return false
        }, function () {
          // only the structure preview asks for these; formation never calls this supplier
          var list = []
          for (var i = 0; i < blocks.length; i++) list.push(BI.fromBlockState(blocks[i].defaultBlockState()))
          return Java.to(list, BI)
        })
      }
    }
  }

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var G = global.grindless
    var Pat = G.patterns
    var Coils = G.coils
    var PH = G.parallelHatch
    var CASING = 'gtceu:solid_machine_casing'
    var TEXTURE = 'gtceu:block/casings/solid/machine_casing_solid_steel'
    var OVERLAY = 'gtceu:block/multiblock/implosion_compressor'

    function front(extra) {
      var s = { S: Pat.controller(), B: Pat.part('input_bus', { exact: 1 }), O: Pat.part('output_bus', { exact: 1 }),
        E: Pat.part('energy_input', { exact: 1 }), C: Pat.block(CASING), '#': Pat.air() }
      Object.keys(extra || {}).forEach(function (k) { s[k] = extra[k] })
      return s
    }

    var M1 = { slices: [['CCC', 'CKC', 'CCC'], ['CCC', 'CKC', 'CCC'], ['CCC', 'BSO', 'CEC']], symbols: front({ K: Coils.predicate() }) }
    Pat.register('gtceu:gg_spike_lcr_chain', M1)
    event.create('gg_spike_lcr_chain', 'multiblock')
      .langValue('Spike LCR chain')
      .rotationState(RotationState.NON_Y_AXIS)
      .machine(function (holder) { return Coils.create(holder) })
      .recipeType('large_chemical_reactor')
      .recipeModifiers(true, coilParallel, GTRecipeModifiers.OC_PERFECT_SUBTICK, GTRecipeModifiers.BATCH_MODE)
      .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
      .pattern(function (def) { return Pat.build(def, M1) })
      .workableCasingModel(TEXTURE, OVERLAY)

    var M2 = { slices: [['CCC', 'MCM', 'CCC'], ['CCC', 'CCC', 'CCC'], ['CCC', 'BSO', 'CEC']], symbols: front({ M: moduleSocket() }) }
    Pat.register('gtceu:gg_spike_modules', M2)
    event.create('gg_spike_modules', 'multiblock')
      .langValue('Spike module socket')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeTypes('macerator', 'compressor')
      .recipeModifier(moduleGate, true)
      .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
      .pattern(function (def) { return Pat.build(def, M2) })
      .workableCasingModel(TEXTURE, OVERLAY)

    var M3 = {
      slices: [['CCC', 'CKC', 'CCC'], ['CCC', 'CKC', 'CCC'], ['CHC', 'BSO', 'CEC']],
      symbols: front({ K: Coils.predicate(), H: Pat.oneOf(Pat.block(CASING), PH.part()) })
    }
    Pat.register('gtceu:gg_spike_ebf', M3)
    event.create('gg_spike_ebf', 'multiblock')
      .langValue('Spike hatch EBF')
      .rotationState(RotationState.NON_Y_AXIS)
      .machine(function (holder) { return Coils.create(holder) })
      .recipeType('electric_blast_furnace')
      .recipeModifier(PH.modifier(function (machine, recipe) { return GTRecipeModifiers.ebfOverclock(machine, recipe) }), true)
      .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
      .pattern(function (def) { return Pat.build(def, M3) })
      .workableCasingModel(TEXTURE, OVERLAY)

    var PHPM = Java.loadClass('com.gregtechceu.gtceu.common.machine.multiblock.part.ParallelHatchPartMachine')
    var RL = Java.loadClass('net.minecraft.resources.ResourceLocation')
    event.create('gg_spike_parallel_hatch', 'custom')
      .tiers(9)
      .machine(function (holder, tier, tankScaling) { return new PHPM(holder, tier) })
      .definition(function (tier, builder) {
        builder
          .langValue('UHV Spike Parallel Hatch')
          .rotationState(RotationState.ALL)
          .abilities(PartAbility.PARALLEL_HATCH)
        builder.modelPropertyBool(GTModelProperties.IS_FORMED, false)
        builder['overlayTieredHullModel(net.minecraft.resources.ResourceLocation)'](new RL('gtceu', 'block/machines/parallel_hatch_mk4'))
      })
  })
})()
