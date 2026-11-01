// TEST ONLY (bench overlay, never shipped). XP-D1 spike S0-11, the Hyperstargate dial's power path (docs/research/maxplus-s0.md, S0-11).
// Off unless kubejs/config/gg_test_xp_s0_dial.json says {"enabled": true} (committed as false). Server side: server_scripts/gg_test_xp_s0_dial.js.
//   gtceu:max_gg_xp_s0_dial_hatch_4096a  a 4,096 A wireless MAX+ energy hatch, built the way XP-W2 would build gtceu:max_wireless_energy_hatch_4096a:
//                                        the wireless hatch builder of lv/wireless_energy.js (GTM's EnergyHatchPartMachine at tier 14, IO.IN,
//                                        PartAbility.INPUT_ENERGY), then entered in global.grindless.wireless.hatches, so the pack's settlement
//                                        tops it up like any wireless energy hatch (cap V[MAX] x 4,096 x settleTicks: maxplusCaps' 4,096 A row)
//   gtceu:gg_xp_s0_dial                  the probe's recipe type (one item in, one out, EU in)
//   gtceu:gg_xp_s0_dial_plate            a 3 x 3 x 3 test multiblock whose one energy cell is the pack's energy_input slot (lib/patterns.js
//                                        part('energy_input'): PartAbility.INPUT_ENERGY); rows run as written (IDENTITY, as the MAX+ machines)
// Rhino: var + function; console.warn, never console.error (fatal in a startup script, XP-S0a).
;(function () {
  var marker = JsonIO.read('kubejs/config/gg_test_xp_s0_dial.json')
  var ON = marker !== null && String(marker.get('enabled')) === 'true'
  if (!ON) return
  var MAXT = 14
  var AMPS = 4096
  var HATCH = 'gg_xp_s0_dial_hatch_4096a'
  var TYPE = 'gg_xp_s0_dial'
  var PLATE = 'gg_xp_s0_dial_plate'
  var seen = {}
  function guard(key, fn) {
    try { fn(); console.info('[xp-s0-dial] ' + key + ' registered') } catch (e) {
      if (!seen[key]) { seen[key] = true; console.warn('[xp-s0-dial] ' + key + ' failed: ' + e) }
    }
  }

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    guard('recipe type', function () {
      event.create(TYPE)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(1, 1, 0, 0)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var Pat = global.grindless.patterns
    var EHPM = Java.loadClass('com.gregtechceu.gtceu.common.machine.multiblock.part.EnergyHatchPartMachine')
    var IO = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.IO')
    var RL = Java.loadClass('net.minecraft.resources.ResourceLocation')

    guard('hatch', function () {
      event.create(HATCH, 'custom')
        .tiers(MAXT)
        .machine(function (holder, tier, tankScaling) { return new EHPM(holder, tier, IO.IN, AMPS) })
        .definition(function (tier, builder) {
          builder
            .langValue('XP S0 Dial 4,096 A Wireless Energy Hatch')
            .rotationState(RotationState.ALL)
            .abilities(PartAbility.INPUT_ENERGY)
          builder.modelPropertyBool(GTModelProperties.IS_FORMED, false)
          builder['overlayTieredHullModel(net.minecraft.resources.ResourceLocation)'](new RL('grindless', 'block/machines/wireless/hatch_64a'))
        })
      // the network's book (server_scripts/grindless/lv/wireless_energy.js): track() and the settlement read W.hatches by block id
      var W = global.grindless.wireless
      var id = 'gtceu:max_' + HATCH
      W.hatches[id] = { kind: 'hatch', tier: MAXT, amps: AMPS }
      if (W.hatchIds.indexOf(id) < 0) W.hatchIds.push(id)
    })

    guard('plate', function () {
      var SPEC = {
        slices: [
          ['CCC', 'CEC', 'CCC'],
          ['CCC', 'CCC', 'CCC'],
          ['CCC', 'PSP', 'CCC']
        ],
        symbols: {
          S: Pat.controller(),
          C: Pat.block('gtceu:solid_machine_casing'),
          E: Pat.part('energy_input', { exact: 1 }),
          P: Pat.oneOf(Pat.part('input_bus', { exact: 1 }), Pat.part('output_bus', { exact: 1 }))
        }
      }
      Pat.register('gtceu:' + PLATE, SPEC)
      event.create(PLATE, 'multiblock')
        .langValue('XP S0 Dial Plate')
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(TYPE)
        .recipeModifier(function (machine, recipe) { return ModifierFunction.IDENTITY }, true)
        .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
        .pattern(function (def) { return Pat.build(def, SPEC) })
        .workableCasingModel('gtceu:block/casings/solid/machine_casing_solid_steel', 'gtceu:block/multiblock/implosion_compressor')
    })
  })
})()
