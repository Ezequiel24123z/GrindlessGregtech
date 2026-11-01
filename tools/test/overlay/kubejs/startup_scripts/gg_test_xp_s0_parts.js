// TEST ONLY (bench overlay, never shipped). XP-S0a MAX+ spike registrations, off unless kubejs/config/gg_test_xp_s0.json says {"enabled": true}.
// GTM's highTierContent registers gtceu:max_substation_input_hatch_64a, gtceu:max_substation_output_hatch_64a and the 16 A hatches itself.
//   S0-2  gtceu:max_gg_xp_s0_in1024 / _out1024  EnergyHatchPartMachine at tier 14 with 1,024 A (input, dynamo)
//   S0-3  gg_xp_s0_kerr             a KubeJS material with cable properties at V[MAX], 256 A, loss 0
//   S0-3  gtceu:max_gg_xp_s0_in256 / _out256    256 A hatches for the cable sink and source
//   S0-5  gtceu:max_gg_xp_s0_ph_refl            ParallelHatchPartMachine at tier 14 (the server raises its private currentParallel by reflection)
//   S0-5  gtceu:max_gg_xp_s0_ph_ext             a Java.extend subclass of ParallelHatchPartMachine whose getCurrentParallel returns 4,194,304
//   S0-1/2/5 gtceu:gg_xp_s0_plate     a 10 x 3 x 10 hollow plate: up to 64 hatches in the roof, one parallel hatch, a bus pair (macerator rows)
//   S0-4  gtceu:gg_xp_s0_genplate     a 7 x 3 x 7 hollow plate with up to 25 dynamo hatches in the roof (generator recipe type gg_xp_s0_gen)
;(function () {
  var marker = JsonIO.read('kubejs/config/gg_test_xp_s0.json')
  var ON = marker !== null && String(marker.get('enabled')) === 'true'
  var MAXT = 14
  var seen = {}
  function guard(key, fn) {
    try { fn(); console.info('[xp-s0] ' + key + ' registered') } catch (e) {
      if (!seen[key]) { seen[key] = true; console.warn('[xp-s0] ' + key + ' failed: ' + e) }
    }
  }
  if (!ON) return

  var TEXTURE = 'gtceu:block/casings/solid/machine_casing_solid_steel'
  var OVERLAY = 'gtceu:block/multiblock/implosion_compressor'

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    guard('material', function () {
      event.create('gg_xp_s0_kerr')
        .ingot()
        .color(0x6070c0)
        .formula('Kx')
        .cableProperties(GTValues.V[MAXT], 256, 0, false)
        .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
      event.create('gg_xp_s0_kerr_lossy')
        .ingot()
        .color(0x6070c1)
        .formula('Kxl')
        .cableProperties(GTValues.V[MAXT], 256, 1, false)
        .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    guard('gen_type', function () {
      event.create('gg_xp_s0_gen')
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

    function energyPart(name, lang, io, amps) {
      guard(name, function () {
        var isIn = io === IO.IN
        event.create(name, 'custom')
          .tiers(MAXT)
          .machine(function (holder, tier) { return new EHPM(holder, tier, io, amps) })
          .definition(function (tier, builder) {
            builder
              .langValue(lang)
              .rotationState(RotationState.ALL)
              .abilities(isIn ? PartAbility.INPUT_ENERGY : PartAbility.OUTPUT_ENERGY)
            builder.modelPropertyBool(GTModelProperties.IS_FORMED, false)
            builder['overlayTieredHullModel(net.minecraft.resources.ResourceLocation)'](new RL('gtceu', isIn ? 'block/machines/energy_hatch.input' : 'block/machines/energy_hatch.output'))
          })
      })
    }
    energyPart('gg_xp_s0_in1024', 'XP S0 1024 A Energy Hatch', IO.IN, 1024)
    energyPart('gg_xp_s0_out1024', 'XP S0 1024 A Dynamo Hatch', IO.OUT, 1024)
    energyPart('gg_xp_s0_in256', 'XP S0 256 A Energy Hatch', IO.IN, 256)
    energyPart('gg_xp_s0_out256', 'XP S0 256 A Dynamo Hatch', IO.OUT, 256)

    function parallelPart(name, lang, factory) {
      guard(name, function () {
        event.create(name, 'custom')
          .tiers(MAXT)
          .machine(factory)
          .definition(function (tier, builder) {
            builder
              .langValue(lang)
              .rotationState(RotationState.ALL)
              .abilities(PartAbility.PARALLEL_HATCH)
            builder.modelPropertyBool(GTModelProperties.IS_FORMED, false)
            builder['overlayTieredHullModel(net.minecraft.resources.ResourceLocation)'](new RL('grindless', 'block/machines/uiv_parallel_hatch'))
          })
      })
    }
    parallelPart('gg_xp_s0_ph_refl', 'XP S0 Parallel Hatch (reflection)', function (holder, tier) { return new PHPM(holder, tier) })
    var Ext = null
    guard('ph_ext_class', function () {
      Ext = Java.extend(PHPM, { getCurrentParallel: function () { return 4194304 } })
    })
    if (Ext !== null) parallelPart('gg_xp_s0_ph_ext', 'XP S0 Parallel Hatch (subclass)', function (holder, tier) { return new Ext(holder, tier) })

    // hatch cells: casing or the substation / ordinary ability, counted per ability (GTM limits are per leaf)
    function ability(name, getter, max) {
      return { kind: 'part', ability: name, limits: { max: max }, build: function () { return Predicates.abilities(getter()).setMaxGlobalLimited(max) } }
    }

    // slices BACK -> FRONT, rows BOTTOM -> TOP; the controller is the middle of the front floor
    function plate(w, d, front) {
      var slices = []
      for (var s = 0; s < d; s++) {
        var rows = []
        for (var r = 0; r < 3; r++) {
          var row = ''
          for (var c = 0; c < w; c++) {
            var shell = s === 0 || s === d - 1 || r === 0 || r === 2 || c === 0 || c === w - 1
            var ch = shell ? 'C' : 'K'
            if (r === 2 && s > 0 && s < d - 1 && c > 0 && c < w - 1) ch = 'H'
            if (s === d - 1) ch = front(r, c, ch)
            row += ch
          }
          rows.push(row)
        }
        slices.push(rows)
      }
      return slices
    }

    guard('plate', function () {
      var slices = plate(10, 10, function (r, c, ch) {
        if (r === 0 && c === 5) return 'S'
        if (r === 0 && c === 3) return 'B'
        if (r === 0 && c === 7) return 'O'
        if (r === 1 && c === 5) return 'P'
        return ch
      })
      var SPEC = {
        slices: slices,
        symbols: {
          S: Pat.controller(), B: Pat.part('input_bus', { exact: 1 }), O: Pat.part('output_bus', { exact: 1 }),
          H: Pat.oneOf(CASING,
            ability('substation_input', function () { return PartAbility.SUBSTATION_INPUT_ENERGY }, 64),
            ability('energy_input', function () { return PartAbility.INPUT_ENERGY }, 64)),
          P: Pat.oneOf(CASING, PH.part()), C: CASING, K: Pat.air()
        }
      }
      Pat.register('gtceu:gg_xp_s0_plate', SPEC)
      event.create('gg_xp_s0_plate', 'multiblock')
        .langValue('XP S0 plate')
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeTypes('macerator')
        .recipeModifier(PH.modifier(PH.overclock))
        .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
        .pattern(function (def) { return Pat.build(def, SPEC) })
        .workableCasingModel(TEXTURE, OVERLAY)
    })

    guard('genplate', function () {
      var slices = plate(7, 7, function (r, c, ch) {
        if (r === 0 && c === 3) return 'S'
        if (r === 0 && c === 1) return 'B'
        if (r === 0 && c === 5) return 'O'
        return ch
      })
      var SPEC = {
        slices: slices,
        symbols: {
          S: Pat.controller(), B: Pat.part('input_bus', { exact: 1 }), O: Pat.part('output_bus', { exact: 1 }),
          H: Pat.oneOf(CASING,
            ability('substation_output', function () { return PartAbility.SUBSTATION_OUTPUT_ENERGY }, 25),
            ability('energy_output', function () { return PartAbility.OUTPUT_ENERGY }, 25)),
          C: CASING, K: Pat.air()
        }
      }
      Pat.register('gtceu:gg_xp_s0_genplate', SPEC)
      Gen.configure(event.create('gg_xp_s0_genplate', 'multiblock'), { maxParallels: 1, name: 'gg_xp_s0_genplate' })
        .langValue('XP S0 generator plate')
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeTypes('gg_xp_s0_gen')
        .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
        .pattern(function (def) { return Pat.build(def, SPEC) })
        .workableCasingModel(TEXTURE, OVERLAY)
    })
  })
})()
