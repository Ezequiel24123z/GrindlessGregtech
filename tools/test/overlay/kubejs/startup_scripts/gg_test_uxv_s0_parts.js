// priority: -490
// TEST ONLY (bench overlay, never shipped). UXV-S0 disposable registrations, off unless kubejs/config/gg_test_uxv_s0.json says {"enabled": true}.
// The UXV hull and hatches are NOT registered here: S0-1 widens UEV's builders in a temp copy of pack/ (uev/foundation.js .tiers(UEV, UIV, UXV)).
//   S0-1/S0-4/S0-6 gtceu:gg_uxv_s0_frame, a multiblock of ours that takes the UXV hatches and one parallel hatch
//   S0-4  FusionReactorMachine.registerFusionTier(UXV) and gtceu:gg_uxv_s0_fusion (Mk5's ring pattern and casing, 16 UXV hatches)
//   S0-6  gtceu:gg_uxv_s0_parallel_hatch, ParallelHatchPartMachine at tier 12 (lib/parallel_hatch.js registers tiers 9-11 only)
//   S0-7  gtceu:gg_uxv_s0_w (twelve explicit tiers LV..UXV in one builder), grindless:gg_uxv_s0_repeater (the wireless row's link)
//   S0-8  gtceu:gg_uxv_s0_pasta_strand (a KubeJS material with cable properties at V[UXV], 4 A, zero loss)
;(function () {
  var marker = JsonIO.read('kubejs/config/gg_test_uxv_s0.json')
  var ON = marker !== null && String(marker.get('enabled')) === 'true'
  var UXV = 12
  var seen = {}
  function guard(key, fn) {
    try { fn(); console.info('[uxv-s0] ' + key + ' registered') } catch (e) {
      if (!seen[key]) { seen[key] = true; console.error('[uxv-s0] ' + key + ' failed: ' + e) }
    }
  }
  if (!ON) return

  var TEXTURE = 'gtceu:block/casings/solid/machine_casing_solid_steel'
  var OVERLAY = 'gtceu:block/multiblock/implosion_compressor'

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    guard('material', function () {
      event.create('gg_uxv_s0_pasta_strand')
        .ingot()
        .color(0xf0d890)
        .formula('Pa')
        .cableProperties(GTValues.V[UXV], 4, 0, false)
        .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })

  StartupEvents.registry('item', function (event) {
    guard('repeater', function () { event.create('grindless:gg_uxv_s0_repeater').texture('minecraft:item/ender_eye') })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var Pat = global.grindless.patterns
    var PH = global.grindless.parallelHatch
    var EHPM = Java.loadClass('com.gregtechceu.gtceu.common.machine.multiblock.part.EnergyHatchPartMachine')
    var PHPM = Java.loadClass('com.gregtechceu.gtceu.common.machine.multiblock.part.ParallelHatchPartMachine')
    var IO = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.IO')
    var RL = Java.loadClass('net.minecraft.resources.ResourceLocation')

    guard('twelve_tiers', function () {
      var t = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
      event.create('gg_uxv_s0_w', 'custom')
        .tiers(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10], t[11])
        .machine(function (holder, tier) { return new EHPM(holder, tier, IO.IN, 2) })
        .definition(function (tier, builder) {
          builder
            .langValue('UXV S0 twelve tiers')
            .rotationState(RotationState.ALL)
            .abilities(PartAbility.INPUT_ENERGY)
          builder.modelPropertyBool(GTModelProperties.IS_FORMED, false)
          builder['overlayTieredHullModel(net.minecraft.resources.ResourceLocation)'](new RL('gtceu', 'block/machines/energy_hatch.input'))
        })
    })

    guard('parallel_hatch_12', function () {
      event.create('gg_uxv_s0_parallel_hatch', 'custom')
        .tiers(UXV)
        .machine(function (holder, tier) { return new PHPM(holder, tier) })
        .definition(function (tier, builder) {
          builder
            .langValue('UXV S0 Parallel Control Hatch')
            .rotationState(RotationState.ALL)
            .abilities(PartAbility.PARALLEL_HATCH)
          builder.modelPropertyBool(GTModelProperties.IS_FORMED, false)
          builder['overlayTieredHullModel(net.minecraft.resources.ResourceLocation)'](new RL('grindless', 'block/machines/uiv_parallel_hatch'))
        })
    })

    guard('frame_multiblock', function () {
      var SPEC = {
        slices: [['CCC', 'CCC', 'CPC'], ['CCC', 'CKC', 'CCC'], ['CCC', 'BSO', 'CEC']],
        symbols: {
          S: Pat.controller(), B: Pat.part('input_bus', { exact: 1 }), O: Pat.part('output_bus', { exact: 1 }),
          E: Pat.part('energy_input', { exact: 1 }), C: Pat.block('gtceu:solid_machine_casing'), K: Pat.air(),
          P: Pat.oneOf(Pat.block('gtceu:solid_machine_casing'), PH.part())
        }
      }
      Pat.register('gtceu:gg_uxv_s0_frame', SPEC)
      event.create('gg_uxv_s0_frame', 'multiblock')
        .langValue('UXV S0 frame')
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeTypes('macerator')
        .recipeModifier(PH.modifier(PH.overclock))
        .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
        .pattern(function (def) { return Pat.build(def, SPEC) })
        .workableCasingModel(TEXTURE, OVERLAY)
    })

    // S0-4: Mk5's ring (uiv/mk5.js ringSpec: its shape, casing and coil) on a third registerFusionTier
    guard('fusion', function () {
      var FRM = Java.loadClass('com.gregtechceu.gtceu.common.machine.multiblock.electric.FusionReactorMachine')
      FRM.registerFusionTier(UXV, ' (UXV)')
      var CASING = 'grindless:uiv_fusion_casing'
      var lay = global.grindless.uivShapes.layouts.uiv_fusion_reactor()
      var SPEC = {
        slices: global.grindless.uivShapes.slices(lay.w, lay.h, lay.d, lay.fn),
        // same symbols as uiv/mk5.js ringSpec
        symbols: {
          S: Pat.controller(),
          C: Pat.block(CASING),
          K: Pat.block('grindless:metallic_hydrogen_coil_block'),
          A: Pat.block('gtceu:stable_machine_casing'),
          L: Pat.block('gtceu:laminated_glass'),
          P: Pat.block('gtceu:tungstensteel_pipe_casing'),
          Q: Pat.frame(['tungsten_steel']),
          E: Pat.oneOf(Pat.block(CASING), Pat.part('energy_input', { min: 1, max: 16 })),
          I: Pat.oneOf(Pat.block(CASING), Pat.part('input_hatch', { min: 1, max: 3 })),
          O: Pat.oneOf(Pat.block(CASING), Pat.part('output_hatch', { min: 1, max: 3 })),
          '#': Pat.air()
        }
      }
      Pat.register('gtceu:gg_uxv_s0_fusion', SPEC)
      event.create('gg_uxv_s0_fusion', 'multiblock')
        .langValue('UXV S0 fusion ring')
        .rotationState(RotationState.NON_Y_AXIS)
        .machine(function (holder) { return new FRM(holder, UXV) })
        .recipeType('fusion_reactor')
        .recipeModifier(function (machine, recipe) { return FRM.recipeModifier(machine, recipe) }, true)
        .appearanceBlock(function () { return Block.getBlock(CASING) })
        .pattern(function (def) { return Pat.build(def, SPEC) })
        .workableCasingModel('grindless:block/uiv/uiv_fusion_casing', OVERLAY)
    })
  })
})()
