// TEST ONLY (bench overlay, never shipped). UEV-S0 disposable registrations, off unless kubejs/config/gg_test_uev_s0.json says {"enabled": true}.
//   S0-1  gtceu:uev_machine_hull, gtceu:uev_energy_input_hatch / _output_hatch (2 A) and the 16 A pair, with highTierContent off
//   S0-2  grindless:s0_motor7 and grindless:s0_motor9 (createCustom GCYR motors, tiers 7 and 9)
//   S0-6  FusionReactorMachine.registerFusionTier(UEV) and gtceu:gg_uev_s0_fusion (a KubeJS fusion ring, 16 UEV hatches)
//   S0-7  grindless:s0_coil_12600 (a 12,600 K gtceu:coil block) and gtceu:gg_uev_s0_ebf (a coil machine of ours)
//   S0-9  grindless:lay_superhydride (a KubeJS material with cable properties at V[UEV], 4 A, zero loss)
//   S0-1  gtceu:gg_uev_s0_frame, a multiblock of ours that takes the UEV hatches
;(function () {
  var marker = JsonIO.read('kubejs/config/gg_test_uev_s0.json')
  var ON = marker !== null && String(marker.get('enabled')) === 'true'
  var UEV = 10
  var seen = {}
  function guard(key, fn) {
    try { fn(); console.info('[uev-s0] ' + key + ' registered') } catch (e) {
      if (!seen[key]) { seen[key] = true; console.error('[uev-s0] ' + key + ' failed: ' + e) }
    }
  }
  if (!ON) return

  var TEXTURE = 'gtceu:block/casings/solid/machine_casing_solid_steel'
  var OVERLAY = 'gtceu:block/multiblock/implosion_compressor'

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    guard('material', function () {
      event.create('grindless:lay_superhydride')
        .ingot()
        .color(0x9fe8ff)
        .formula('LaH10')
        .cableProperties(GTValues.V[UEV], 4, 0, false)
        .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })

  StartupEvents.registry('block', function (event) {
    guard('coil_12600', function () {
      event.create('grindless:s0_coil_12600', 'gtceu:coil')
        .temperature(12600)
        .level(10)
        .energyDiscount(10)
        .tier(10)
        .texture('gtceu:block/casings/coils/machine_coil_tritanium')
        .coilMaterial(function () { return GTMaterials.get('tritanium') })
    })
    guard('motor_blocks', function () {
      var RMB = Java.loadClass('argent_matter.gcyr.common.block.RocketMotorBlock')
      var RMT = Java.loadClass('argent_matter.gcyr.common.block.RocketMotorBlock$RocketMotorType')
      var IRMT = Java.loadClass('argent_matter.gcyr.api.block.IRocketMotorType')
      var Props = Java.loadClass('net.minecraft.world.level.block.state.BlockBehaviour$Properties')
      var VBlocks = Java.loadClass('net.minecraft.world.level.block.Blocks')
      var elite = RMT.ELITE
      var t7 = new IRMT({
        getTier: function () { return 7 },
        getMaxCarryWeight: function () { return elite.getMaxCarryWeight() },
        getMotorCount: function () { return elite.getMotorCount() },
        getSerializedName: function () { return 'grindless_s0_motor7' }
      })
      var t9 = new IRMT({
        getTier: function () { return 9 },
        getMaxCarryWeight: function () { return elite.getMaxCarryWeight() },
        getMotorCount: function () { return elite.getMotorCount() },
        getSerializedName: function () { return 'grindless_s0_motor9' }
      })
      event.createCustom('grindless:s0_motor7', function () { return new RMB(Props.copy(VBlocks.IRON_BLOCK), t7) })
      event.createCustom('grindless:s0_motor9', function () { return new RMB(Props.copy(VBlocks.IRON_BLOCK), t9) })
    })
  })

  StartupEvents.registry('item', function (event) {
    guard('quantum_repeater_node', function () { event.create('grindless:quantum_repeater_node').texture('minecraft:item/ender_eye') })
    guard('motor_items', function () {
      var BlockItem = Java.loadClass('net.minecraft.world.item.BlockItem')
      var ItemProps = Java.loadClass('net.minecraft.world.item.Item$Properties')
      var Forge = Java.loadClass('net.minecraftforge.registries.ForgeRegistries')
      var RL = Java.loadClass('net.minecraft.resources.ResourceLocation')
      ;['grindless:s0_motor7', 'grindless:s0_motor9'].forEach(function (id) {
        event.createCustom(id, function () { return new BlockItem(Forge.BLOCKS.getValue(new RL(id)), new ItemProps()) })
      })
    })
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
        .tiers(UEV)
        .machine(function (holder, tier) { return new EHPM(holder, tier, io, amps) })
        .definition(function (tier, builder) {
          builder
            .langValue('UEV ' + id)
            .rotationState(RotationState.ALL)
            .abilities(ability)
          builder.modelPropertyBool(GTModelProperties.IS_FORMED, false)
          builder['overlayTieredHullModel(net.minecraft.resources.ResourceLocation)'](rl(model))
        })
    }

    guard('hull', function () {
      event.create('machine_hull', 'custom')
        .tiers(UEV)
        .machine(function (holder, tier) { return new HullMachine(holder, tier) })
        .definition(function (tier, builder) {
          builder
            .langValue('UEV Machine Hull')
            .rotationState(RotationState.ALL)
            .abilities(PartAbility.PASSTHROUGH_HATCH)
          builder['overlayTieredHullModel(java.lang.String)']('hull')
        })
    })
    guard('hatch_in_2a', function () { hatch('energy_input_hatch', IO.IN, 2, PartAbility.INPUT_ENERGY, 'block/machines/energy_hatch.input') })
    guard('hatch_out_2a', function () { hatch('energy_output_hatch', IO.OUT, 2, PartAbility.OUTPUT_ENERGY, 'block/machines/energy_hatch.output') })
    guard('hatch_in_16a', function () { hatch('energy_input_hatch_16a', IO.IN, 16, PartAbility.INPUT_ENERGY, 'block/machines/energy_hatch.input_16a') })
    guard('hatch_out_16a', function () { hatch('energy_output_hatch_16a', IO.OUT, 16, PartAbility.OUTPUT_ENERGY, 'block/machines/energy_hatch.output_16a') })

    // S0-5: the wireless hatches' withTiers has no case 10; ten explicit tiers LV..UEV through the same builder call
    guard('ten_tiers', function () {
      var t = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      event.create('gg_uev_s0_w', 'custom')
        .tiers(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9])
        .machine(function (holder, tier) { return new EHPM(holder, tier, IO.IN, 2) })
        .definition(function (tier, builder) {
          builder
            .langValue('UEV S0 ten tiers')
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
      Pat.register('gtceu:gg_uev_s0_frame', SPEC)
      event.create('gg_uev_s0_frame', 'multiblock')
        .langValue('UEV S0 frame')
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
      Pat.register('gtceu:gg_uev_s0_ebf', SPEC)
      event.create('gg_uev_s0_ebf', 'multiblock')
        .langValue('UEV S0 coil machine')
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
      FRM.registerFusionTier(UEV, ' (UEV)')
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
      Pat.register('gtceu:gg_uev_s0_fusion', SPEC)
      event.create('gg_uev_s0_fusion', 'multiblock')
        .langValue('UEV S0 fusion ring')
        .rotationState(RotationState.NON_Y_AXIS)
        .machine(function (holder) { return new FRM(holder, UEV) })
        .recipeType('fusion_reactor')
        .recipeModifier(function (machine, recipe) { return FRM.recipeModifier(machine, recipe) }, true)
        .appearanceBlock(function () { return Block.getBlock(CAS) })
        .pattern(function (def) { return Pat.build(def, SPEC) })
        .workableCasingModel('gtceu:block/casings/fusion/fusion_casing_mk3', OVERLAY)
    })
  })
})()
