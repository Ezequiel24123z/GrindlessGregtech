// TEST ONLY (bench overlay, never shipped). UIV-S0 disposable registrations, off unless kubejs/config/gg_test_uiv_s0.json says {"enabled": true}.
//   S0-1  gtceu:uiv_machine_hull, gtceu:uiv_energy_input_hatch / _output_hatch (2 A) and the 16 A pair, with highTierContent off
//   S0-1  gtceu:gg_uiv_s0_frame, a multiblock of ours that takes the UIV hatches (also the relay platform of S0-2 / S0-4)
//   S0-5  gtceu:gg_uiv_s0_w, one custom machine with the eleven tiers LV..UIV
//   S0-6  FusionReactorMachine.registerFusionTier(UIV) and gtceu:gg_uiv_s0_fusion (a KubeJS fusion ring, 16 UIV hatches)
//   S0-7  grindless:metallic_hydrogen (a KubeJS material with cable properties at V[UIV], 4 A, zero loss)
//   S0-9  gtceu:gg_uiv_s0_cwu, a KubeJS multiblock on GTM's HPCAMachine (a computation provider)
//   S0-11 grindless:gg_uiv_s0_coil (a 14,400 K gtceu:coil block) and gtceu:gg_uiv_s0_ebf (a coil machine of ours)
;(function () {
  var marker = JsonIO.read('kubejs/config/gg_test_uiv_s0.json')
  var ON = marker !== null && String(marker.get('enabled')) === 'true'
  var FALLBACK = marker !== null && String(marker.get('fallback')) === 'true'
  var UIV = 11
  var seen = {}
  function guard(key, fn) {
    if (FALLBACK && (key === 'hull' || key.indexOf('hatch_') === 0)) return
    try { fn(); console.info('[uiv-s0] ' + key + ' registered') } catch (e) {
      if (!seen[key]) { seen[key] = true; console.error('[uiv-s0] ' + key + ' failed: ' + e) }
    }
  }
  if (!ON) return
  // "fallback": true means the bench overlay also carries a copy of uev/foundation.js with .tiers(UEV, UIV) on the hull and the four hatches,
  // so this file must not create the same builder keys again (GTRegistryInfo#addBuilder rejects a duplicate key whatever the tiers)

  var TEXTURE = 'gtceu:block/casings/solid/machine_casing_solid_steel'
  var OVERLAY = 'gtceu:block/multiblock/implosion_compressor'

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    guard('material', function () {
      event.create('grindless:metallic_hydrogen')
        .ingot()
        .color(0xd8f0ff)
        .formula('H')
        .cableProperties(GTValues.V[UIV], 4, 0, false)
        .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })

  StartupEvents.registry('block', function (event) {
    guard('coil_14400', function () {
      event.create('grindless:gg_uiv_s0_coil', 'gtceu:coil')
        .temperature(14400)
        .level(11)
        .energyDiscount(11)
        .tier(11)
        .texture('gtceu:block/casings/coils/machine_coil_tritanium')
        .coilMaterial(function () { return GTMaterials.get('tritanium') })
    })
  })

  StartupEvents.registry('item', function (event) {
    guard('pulsar_timed_repeater', function () { event.create('grindless:pulsar_timed_repeater').texture('minecraft:item/ender_eye') })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var Pat = global.grindless.patterns
    var Coils = global.grindless.coils
    var HullMachine = Java.loadClass('com.gregtechceu.gtceu.common.machine.electric.HullMachine')
    var EHPM = Java.loadClass('com.gregtechceu.gtceu.common.machine.multiblock.part.EnergyHatchPartMachine')
    var IO = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.IO')
    var RL = Java.loadClass('net.minecraft.resources.ResourceLocation')

    function rl(p) { return new RL('gtceu', p) }
    function hatch(id, io, amps, ability, model) {
      event.create(id, 'custom')
        .tiers(UIV)
        .machine(function (holder, tier) { return new EHPM(holder, tier, io, amps) })
        .definition(function (tier, builder) {
          builder
            .langValue('UIV ' + id)
            .rotationState(RotationState.ALL)
            .abilities(ability)
          builder.modelPropertyBool(GTModelProperties.IS_FORMED, false)
          builder['overlayTieredHullModel(net.minecraft.resources.ResourceLocation)'](rl(model))
        })
    }

    guard('hull', function () {
      event.create('machine_hull', 'custom')
        .tiers(UIV)
        .machine(function (holder, tier) { return new HullMachine(holder, tier) })
        .definition(function (tier, builder) {
          builder
            .langValue('UIV Machine Hull')
            .rotationState(RotationState.ALL)
            .abilities(PartAbility.PASSTHROUGH_HATCH)
          builder['overlayTieredHullModel(java.lang.String)']('hull')
        })
    })
    guard('hatch_in_2a', function () { hatch('energy_input_hatch', IO.IN, 2, PartAbility.INPUT_ENERGY, 'block/machines/energy_hatch.input') })
    guard('hatch_out_2a', function () { hatch('energy_output_hatch', IO.OUT, 2, PartAbility.OUTPUT_ENERGY, 'block/machines/energy_hatch.output') })
    guard('hatch_in_16a', function () { hatch('energy_input_hatch_16a', IO.IN, 16, PartAbility.INPUT_ENERGY, 'block/machines/energy_hatch.input_16a') })
    guard('hatch_out_16a', function () { hatch('energy_output_hatch_16a', IO.OUT, 16, PartAbility.OUTPUT_ENERGY, 'block/machines/energy_hatch.output_16a') })

    // S0-5: the pack's withTiers has no case 11; eleven explicit tiers LV..UIV through the same builder call
    guard('eleven_tiers', function () {
      var t = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
      event.create('gg_uiv_s0_w', 'custom')
        .tiers(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10])
        .machine(function (holder, tier) { return new EHPM(holder, tier, IO.IN, 2) })
        .definition(function (tier, builder) {
          builder
            .langValue('UIV S0 eleven tiers')
            .rotationState(RotationState.ALL)
            .abilities(PartAbility.INPUT_ENERGY)
          builder.modelPropertyBool(GTModelProperties.IS_FORMED, false)
          builder['overlayTieredHullModel(net.minecraft.resources.ResourceLocation)'](rl('block/machines/energy_hatch.input'))
        })
    })

    guard('frame_multiblock', function () {
      var SPEC = {
        slices: [['CCC', 'CCC', 'CCC'], ['CCC', 'CKC', 'CCC'], ['CCC', 'BSO', 'CEC']],
        symbols: {
          S: Pat.controller(), B: Pat.part('input_bus', { exact: 1 }), O: Pat.part('output_bus', { exact: 1 }),
          E: Pat.part('energy_input', { exact: 1 }), C: Pat.block('gtceu:solid_machine_casing'), K: Pat.air()
        }
      }
      Pat.register('gtceu:gg_uiv_s0_frame', SPEC)
      event.create('gg_uiv_s0_frame', 'multiblock')
        .langValue('UIV S0 frame')
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeTypes('macerator')
        .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
        .pattern(function (def) { return Pat.build(def, SPEC) })
        .workableCasingModel(TEXTURE, OVERLAY)
    })

    guard('ebf', function () {
      var SPEC = {
        slices: [['CCC', 'CKC', 'CCC'], ['CCC', 'CKC', 'CCC'], ['CCC', 'BSO', 'CEC']],
        symbols: {
          S: Pat.controller(), B: Pat.part('input_bus', { exact: 1 }), O: Pat.part('output_bus', { exact: 1 }),
          E: Pat.part('energy_input', { exact: 1 }), C: Pat.block('gtceu:solid_machine_casing'), K: Coils.predicate()
        }
      }
      Pat.register('gtceu:gg_uiv_s0_ebf', SPEC)
      event.create('gg_uiv_s0_ebf', 'multiblock')
        .langValue('UIV S0 coil machine')
        .rotationState(RotationState.NON_Y_AXIS)
        .machine(function (holder) { return Coils.create(holder) })
        .recipeType('electric_blast_furnace')
        .recipeModifier(function (machine, recipe) { return GTRecipeModifiers.ebfOverclock(machine, recipe) }, true)
        .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
        .pattern(function (def) { return Pat.build(def, SPEC) })
        .workableCasingModel(TEXTURE, OVERLAY)
    })

    guard('fusion', function () {
      var FRM = Java.loadClass('com.gregtechceu.gtceu.common.machine.multiblock.electric.FusionReactorMachine')
      FRM.registerFusionTier(UIV, ' (UIV)')
      var CAS = 'gtceu:fusion_casing_mk3'
      var floor = Pat.part('energy_input', {})
      var SPEC = {
        slices: [
          ['EEEEE', 'CCCCC', 'EEEEE'],
          ['EEEEE', 'I###C', 'EEEEE'],
          ['EEEEE', 'I###C', 'EEEEE'],
          ['EEEEE', 'C###O', 'EEEEE'],
          ['EEEEE', 'CCSCC', 'EEEEE']
        ],
        symbols: {
          S: Pat.controller(), C: Pat.block(CAS), E: floor, '#': Pat.air(),
          I: Pat.part('input_hatch', {}), O: Pat.part('output_hatch', { exact: 1 })
        }
      }
      Pat.register('gtceu:gg_uiv_s0_fusion', SPEC)
      event.create('gg_uiv_s0_fusion', 'multiblock')
        .langValue('UIV S0 fusion ring')
        .rotationState(RotationState.NON_Y_AXIS)
        .machine(function (holder) { return new FRM(holder, UIV) })
        .recipeType('fusion_reactor')
        .recipeModifier(function (machine, recipe) { return FRM.recipeModifier(machine, recipe) }, true)
        .appearanceBlock(function () { return Block.getBlock(CAS) })
        .pattern(function (def) { return Pat.build(def, SPEC) })
        .workableCasingModel('gtceu:block/casings/fusion/fusion_casing_mk3', OVERLAY)
    })

    // S0-9: a KubeJS multiblock on GTM's HPCAMachine; the transmission hatch exposes its computation
    guard('cwu', function () {
      var HPCA = Java.loadClass('com.gregtechceu.gtceu.common.machine.multiblock.electric.research.HPCAMachine')
      event.create('gg_uiv_s0_cwu', 'multiblock')
        .langValue('UIV S0 CWU provider')
        .rotationState(RotationState.NON_Y_AXIS)
        .machine(function (holder) { return new HPCA(holder) })
        .recipeType('dummy')
        .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
        .pattern(function (def) {
          return FactoryBlockPattern.start()
            .aisle('CCC', 'CCC', 'CCC')
            .aisle('CTC', 'CHC', 'CCC')
            .aisle('CEC', 'CSC', 'CCC')
            .where('S', Predicates.controller(Predicates.blocks(def.get())))
            .where('C', Predicates.blocks(GTBlocks.CASING_STEEL_SOLID.get()))
            .where('H', Predicates.abilities(PartAbility.HPCA_COMPONENT))
            .where('T', Predicates.abilities(PartAbility.COMPUTATION_DATA_TRANSMISSION).setExactLimit(1))
            .where('E', Predicates.abilities(PartAbility.INPUT_ENERGY).setExactLimit(1))
            .build()
        })
        .workableCasingModel(TEXTURE, OVERLAY)
    })
  })
})()
