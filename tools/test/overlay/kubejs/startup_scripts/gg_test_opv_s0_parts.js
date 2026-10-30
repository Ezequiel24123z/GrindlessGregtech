// priority: -375
// TEST ONLY (bench overlay, never shipped). OpV-S0 disposable registrations, off unless kubejs/config/gg_test_opv_s0.json says {"enabled": true}.
// The OpV hull, hatches and basic machines are NOT registered here: GTM's highTierContent registers gtceu:opv_* itself (S0-1).
//   S0-5/S0-10 gtceu:gg_opv_s0_parallel_hatch, ParallelHatchPartMachine at tier 13 (lib/parallel_hatch.js registers tiers 9-12 only)
//   S0-5       gtceu:gg_opv_s0_frame, a multiblock of ours with up to two energy hatches and one parallel hatch
//   S0-6       gtceu:gg_opv_s0_w (thirteen explicit tiers LV..OpV in one builder)
//   S0-7       gg_opv_s0_chain_strand (a KubeJS material with cable properties at V[OpV], 16 A, zero loss)
//   S0-10      gtceu:gg_opv_s0_assembly_array (GTM's AssemblyLineMachine class, three ordered input buses, a data access hatch and the tier 13 parallel hatch)
//   S0-11      gtceu:gg_opv_s0_gen_frame (.generator(true) with a parallel hatch and identity overclock: does a generator row scale with consumed items)
;(function () {
  var marker = JsonIO.read('kubejs/config/gg_test_opv_s0.json')
  var ON = marker !== null && String(marker.get('enabled')) === 'true'
  var OPV = 13
  var seen = {}
  function guard(key, fn) {
    try { fn(); console.info('[opv-s0] ' + key + ' registered') } catch (e) {
      if (!seen[key]) { seen[key] = true; console.error('[opv-s0] ' + key + ' failed: ' + e) }
    }
  }
  if (!ON) return

  var TEXTURE = 'gtceu:block/casings/solid/machine_casing_solid_steel'
  var OVERLAY = 'gtceu:block/multiblock/implosion_compressor'

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    guard('material', function () {
      event.create('gg_opv_s0_chain_strand')
        .ingot()
        .color(0x90a0d0)
        .formula('Cs')
        .cableProperties(GTValues.V[OPV], 16, 0, false)
        .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var Pat = global.grindless.patterns
    var PH = global.grindless.parallelHatch
    var EHPM = Java.loadClass('com.gregtechceu.gtceu.common.machine.multiblock.part.EnergyHatchPartMachine')
    var PHPM = Java.loadClass('com.gregtechceu.gtceu.common.machine.multiblock.part.ParallelHatchPartMachine')
    var ALM = Java.loadClass('com.gregtechceu.gtceu.common.machine.multiblock.electric.AssemblyLineMachine')
    var IO = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.IO')
    var RL = Java.loadClass('net.minecraft.resources.ResourceLocation')

    guard('thirteen_tiers', function () {
      var t = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
      event.create('gg_opv_s0_w', 'custom')
        .tiers(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10], t[11], t[12])
        .machine(function (holder, tier) { return new EHPM(holder, tier, IO.IN, 2) })
        .definition(function (tier, builder) {
          builder
            .langValue('OpV S0 thirteen tiers')
            .rotationState(RotationState.ALL)
            .abilities(PartAbility.INPUT_ENERGY)
          builder.modelPropertyBool(GTModelProperties.IS_FORMED, false)
          builder['overlayTieredHullModel(net.minecraft.resources.ResourceLocation)'](new RL('gtceu', 'block/machines/energy_hatch.input'))
        })
    })

    guard('parallel_hatch_13', function () {
      event.create('gg_opv_s0_parallel_hatch', 'custom')
        .tiers(OPV)
        .machine(function (holder, tier) { return new PHPM(holder, tier) })
        .definition(function (tier, builder) {
          builder
            .langValue('OpV S0 Parallel Control Hatch')
            .rotationState(RotationState.ALL)
            .abilities(PartAbility.PARALLEL_HATCH)
          builder.modelPropertyBool(GTModelProperties.IS_FORMED, false)
          builder['overlayTieredHullModel(net.minecraft.resources.ResourceLocation)'](new RL('grindless', 'block/machines/uiv_parallel_hatch'))
        })
    })

    guard('frame_multiblock', function () {
      var CASING = Pat.block('gtceu:solid_machine_casing')
      var SPEC = {
        slices: [['CCC', 'CCC', 'CPC'], ['CCC', 'CKC', 'CCC'], ['CCC', 'BSO', 'CEE']],
        symbols: {
          S: Pat.controller(), B: Pat.part('input_bus', { exact: 1 }), O: Pat.part('output_bus', { exact: 1 }),
          E: Pat.oneOf(CASING, Pat.part('energy_input', { min: 1, max: 2 })), C: CASING, K: Pat.air(),
          P: Pat.oneOf(CASING, PH.part())
        }
      }
      Pat.register('gtceu:gg_opv_s0_frame', SPEC)
      event.create('gg_opv_s0_frame', 'multiblock')
        .langValue('OpV S0 frame')
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeTypes('macerator')
        .recipeModifier(PH.modifier(PH.overclock))
        .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
        .pattern(function (def) { return Pat.build(def, SPEC) })
        .workableCasingModel(TEXTURE, OVERLAY)
    })

    // S0-11: a generator frame: macerator-type recipes run as generation (negative EU/t), one input bus, one dynamo hatch, the tier 13 parallel
    // hatch; no overclock, so the only scaling is the parallel hatch's copies, bounded by what the bus holds
    guard('gen_frame', function () {
      var CASING = Pat.block('gtceu:solid_machine_casing')
      var SPEC = {
        slices: [['CCC', 'CCC', 'CPC'], ['CCC', 'CKC', 'CCC'], ['CCC', 'BSD', 'CCC']],
        symbols: {
          S: Pat.controller(), B: Pat.part('input_bus', { exact: 1 }), D: Pat.part('energy_output', { exact: 1 }),
          C: CASING, K: Pat.air(), P: Pat.oneOf(CASING, PH.part())
        }
      }
      Pat.register('gtceu:gg_opv_s0_gen_frame', SPEC)
      event.create('gg_opv_s0_gen_frame', 'multiblock')
        .langValue('OpV S0 generator frame')
        .rotationState(RotationState.NON_Y_AXIS)
        .generator(true)
        .recipeTypes('macerator')
        .recipeModifier(PH.modifier(function (machine, recipe) { return ModifierFunction.IDENTITY }))
        .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
        .pattern(function (def) { return Pat.build(def, SPEC) })
        .workableCasingModel(TEXTURE, OVERLAY)
    })

    // S0-10: GTM's own ordered-input line class on a pattern of ours: slices 1-3 hold one input bus each (top centre), slice 0 the output bus,
    // the OpV energy hatch, the data access hatch and the parallel hatch sit in the bottom centre of slices 0-3
    guard('assembly_array', function () {
      var CASING = Pat.block('gtceu:solid_machine_casing')
      var data = {
        kind: 'part', ability: 'data_access', limits: { exact: 1 },
        build: function () { return Predicates.abilities(PartAbility.DATA_ACCESS).setExactLimit(1) }
      }
      var SPEC = {
        slices: [
          ['COC', 'CKC', 'CCC'],
          ['CEC', 'CKC', 'CIC'],
          ['CDC', 'CKC', 'CIC'],
          ['CPC', 'CKC', 'CIC'],
          ['CCC', 'CSC', 'CCC']
        ],
        symbols: {
          S: Pat.controller(), C: CASING, K: Pat.air(),
          O: Pat.oneOf(CASING, Pat.part('output_bus', { exact: 1 })),
          I: Pat.oneOf(CASING, Pat.part('input_bus', { exact: 3 })),
          E: Pat.oneOf(CASING, Pat.part('energy_input', { min: 1, max: 2 })),
          D: Pat.oneOf(CASING, data),
          P: Pat.oneOf(CASING, PH.part())
        }
      }
      Pat.register('gtceu:gg_opv_s0_assembly_array', SPEC)
      event.create('gg_opv_s0_assembly_array', 'multiblock')
        .langValue('OpV S0 assembly array')
        .rotationState(RotationState.NON_Y_AXIS)
        .machine(function (holder) { return new ALM(holder) })
        .recipeTypes('assembly_line')
        .recipeModifier(PH.modifier(PH.overclock))
        .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
        .pattern(function (def) { return Pat.build(def, SPEC) })
        .workableCasingModel(TEXTURE, OVERLAY)
    })
  })
})()
