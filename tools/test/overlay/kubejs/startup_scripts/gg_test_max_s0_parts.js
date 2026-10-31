// priority: -295
// TEST ONLY (bench overlay, never shipped). MAX-S0 disposable registrations, off unless kubejs/config/gg_test_max_s0.json says {"enabled": true}.
// GTM's highTierContent registers the gtceu:max_* hull, hatches and buses itself; none is registered here.
//   S0-3  gg_max_s0_strand       a KubeJS material with cable properties at V[MAX], 16 A, loss 1
//   S0-5  gtceu:gg_max_s0_w      fourteen explicit tiers LV..MAX in one builder (EnergyHatchPartMachine)
//   S0-6  gtceu:gg_max_s0_parallel_hatch  ParallelHatchPartMachine at tier 14 (registers as gtceu:max_gg_max_s0_parallel_hatch)
//   S0-6  gtceu:gg_max_s0_frame  a multiblock of ours with up to two energy hatches and one parallel hatch
//   S0-4  gtceu:gg_max_s0_gen_frame  a generator multiblock (macerator rows as generation) with one dynamo hatch
//   S0-13 gtceu:gg_max_s0_big_gen    the same at 15 x 9 x 15 (hollow shell, Pat spec)
//   S0-7  gtceu:gg_max_s0_cube33 and gg_max_s0_cube25  hollow cubes of casing round air, 33 aisle calls of 33 rows (MAX_ROWS 16 is bypassed on purpose)
;(function () {
  var marker = JsonIO.read('kubejs/config/gg_test_max_s0.json')
  var ON = marker !== null && String(marker.get('enabled')) === 'true'
  var MAXT = 14
  var seen = {}
  function guard(key, fn) {
    try { fn(); console.info('[max-s0] ' + key + ' registered') } catch (e) {
      if (!seen[key]) { seen[key] = true; console.error('[max-s0] ' + key + ' failed: ' + e) }
    }
  }
  if (!ON) return

  var TEXTURE = 'gtceu:block/casings/solid/machine_casing_solid_steel'
  var OVERLAY = 'gtceu:block/multiblock/implosion_compressor'

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    guard('material', function () {
      event.create('gg_max_s0_strand')
        .ingot()
        .color(0x90a0d0)
        .formula('Mx')
        .cableProperties(GTValues.V[MAXT], 16, 1, false)
        .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    guard('gen_type', function () {
      event.create('gg_max_s0_gen')
        .category('generator')
        .setEUIO('out')
        .setMaxIOSize(1, 1, 0, 0)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var Pat = global.grindless.patterns
    var Gen = global.grindless.generators
    var PH = global.grindless.parallelHatch
    var EHPM = Java.loadClass('com.gregtechceu.gtceu.common.machine.multiblock.part.EnergyHatchPartMachine')
    var PHPM = Java.loadClass('com.gregtechceu.gtceu.common.machine.multiblock.part.ParallelHatchPartMachine')
    var IO = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.IO')
    var RL = Java.loadClass('net.minecraft.resources.ResourceLocation')
    var CASING = Pat.block('gtceu:solid_machine_casing')

    guard('fourteen_tiers', function () {
      var t = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
      event.create('gg_max_s0_w', 'custom')
        .tiers(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10], t[11], t[12], t[13])
        .machine(function (holder, tier) { return new EHPM(holder, tier, IO.IN, 64) })
        .definition(function (tier, builder) {
          builder
            .langValue('MAX S0 fourteen tiers')
            .rotationState(RotationState.ALL)
            .abilities(PartAbility.INPUT_ENERGY)
          builder.modelPropertyBool(GTModelProperties.IS_FORMED, false)
          builder['overlayTieredHullModel(net.minecraft.resources.ResourceLocation)'](new RL('gtceu', 'block/machines/energy_hatch.input'))
        })
    })

    guard('parallel_hatch_14', function () {
      event.create('gg_max_s0_parallel_hatch', 'custom')
        .tiers(MAXT)
        .machine(function (holder, tier) { return new PHPM(holder, tier) })
        .definition(function (tier, builder) {
          builder
            .langValue('MAX S0 Parallel Control Hatch')
            .rotationState(RotationState.ALL)
            .abilities(PartAbility.PARALLEL_HATCH)
          builder.modelPropertyBool(GTModelProperties.IS_FORMED, false)
          builder['overlayTieredHullModel(net.minecraft.resources.ResourceLocation)'](new RL('grindless', 'block/machines/uiv_parallel_hatch'))
        })
    })

    guard('frame_multiblock', function () {
      var SPEC = {
        slices: [['CCC', 'CCC', 'CPC'], ['CCC', 'CKC', 'CCC'], ['CCC', 'BSO', 'CEE']],
        symbols: {
          S: Pat.controller(), B: Pat.part('input_bus', { exact: 1 }), O: Pat.part('output_bus', { exact: 1 }),
          E: Pat.oneOf(CASING, Pat.part('energy_input', { min: 1, max: 2 })), C: CASING, K: Pat.air(),
          P: Pat.oneOf(CASING, PH.part())
        }
      }
      Pat.register('gtceu:gg_max_s0_frame', SPEC)
      event.create('gg_max_s0_frame', 'multiblock')
        .langValue('MAX S0 frame')
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeTypes('macerator')
        .recipeModifier(PH.modifier(PH.overclock))
        .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
        .pattern(function (def) { return Pat.build(def, SPEC) })
        .workableCasingModel(TEXTURE, OVERLAY)
    })

    // S0-4: a generator frame, no parallel hatch: macerator rows run as generation (negative EU/t), one bus, one dynamo hatch
    guard('gen_frame', function () {
      var SPEC = {
        slices: [['CCC', 'CCC', 'CCC'], ['CCC', 'CKC', 'CCC'], ['CCC', 'BSD', 'COC']],
        symbols: {
          S: Pat.controller(), B: Pat.part('input_bus', { exact: 1 }), D: Pat.part('energy_output', { exact: 1 }), O: Pat.part('output_bus', { exact: 1 }),
          C: CASING, K: Pat.air()
        }
      }
      Pat.register('gtceu:gg_max_s0_gen_frame', SPEC)
      Gen.configure(event.create('gg_max_s0_gen_frame', 'multiblock'), { maxParallels: 1, name: 'gg_max_s0_gen_frame' })
        .langValue('MAX S0 generator frame')
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeTypes('gg_max_s0_gen')
        .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
        .pattern(function (def) { return Pat.build(def, SPEC) })
        .workableCasingModel(TEXTURE, OVERLAY)
    })

    // S0-13: 15 wide, 9 high, 15 deep; slices BACK -> FRONT, rows BOTTOM -> TOP; the controller is the bottom middle of the front face
    guard('big_gen', function () {
      var W = 15, H = 9, D = 15
      var slices = []
      for (var s = 0; s < D; s++) {
        var rows = []
        for (var r = 0; r < H; r++) {
          var row = ''
          for (var c = 0; c < W; c++) {
            var shell = s === 0 || s === D - 1 || r === 0 || r === H - 1 || c === 0 || c === W - 1
            var ch = shell ? 'C' : 'K'
            if (s === D - 1 && r === 0) {
              if (c === 7) ch = 'S'
              else if (c === 5) ch = 'B'
              else if (c === 6) ch = 'D'
              else if (c === 8) ch = 'O'
            }
            row += ch
          }
          rows.push(row)
        }
        slices.push(rows)
      }
      var SPEC = {
        slices: slices,
        symbols: {
          S: Pat.controller(), B: Pat.part('input_bus', { exact: 1 }), D: Pat.part('energy_output', { exact: 1 }), O: Pat.part('output_bus', { exact: 1 }),
          C: CASING, K: Pat.air()
        }
      }
      Pat.register('gtceu:gg_max_s0_big_gen', SPEC)
      Gen.configure(event.create('gg_max_s0_big_gen', 'multiblock'), { maxParallels: 1, name: 'gg_max_s0_big_gen' })
        .langValue('MAX S0 big generator')
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeTypes('gg_max_s0_gen')
        .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
        .pattern(function (def) { return Pat.build(def, SPEC) })
        .workableCasingModel(TEXTURE, OVERLAY)
    })

    // S0-7: our own FactoryBlockPattern; the lib's addSlice stops at 16 rows, so the aisles are built here with a Java array
    function cube(n) {
      var mid = (n - 1) / 2
      var slices = []
      for (var s = 0; s < n; s++) {
        var rows = []
        for (var r = 0; r < n; r++) {
          var row = ''
          for (var c = 0; c < n; c++) {
            var shell = s === 0 || s === n - 1 || r === 0 || r === n - 1 || c === 0 || c === n - 1
            row += (s === n - 1 && r === 0 && c === mid) ? 'S' : (shell ? 'C' : 'K')
          }
          rows.push(row)
        }
        slices.push(rows)
      }
      guard('cube' + n, function () {
        event.create('gg_max_s0_cube' + n, 'multiblock')
          .langValue('MAX S0 cube ' + n)
          .rotationState(RotationState.NON_Y_AXIS)
          .recipeTypes('macerator')
          .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
          .pattern(function (def) {
            var b = FactoryBlockPattern.start()
            slices.forEach(function (rows) { b = b.aisle(rows) })
            b = b.where('S', Predicates.controller(Predicates.blocks(def.get())))
            b = b.where('C', Predicates.blocks(GTBlocks.CASING_STEEL_SOLID.get()))
            b = b.where('K', Predicates.air())
            return b.build()
          })
          .workableCasingModel(TEXTURE, OVERLAY)
      })
    }
    cube(33)
    cube(25)
  })
})()
