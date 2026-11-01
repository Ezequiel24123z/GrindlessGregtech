// priority: -247
// TEST ONLY (bench overlay, never shipped). XP-W2: the MAX+ wireless hatches and the exact store (server side: server_scripts/gg_test_maxplus_wireless.js).
// Off unless kubejs/config/gg_test_maxplus_wireless.json says {"enabled": true}. The hatches are the pack's own (gtceu:max_wireless_energy_hatch_1024a
// and _4096a); this registers only
//   gtceu:gg_maxplus_wireless         the probe's recipe type (one item in, one out, EU in)
//   gtceu:gg_maxplus_wireless_plate   a 3 x 3 x 3 test multiblock whose one energy cell is the pack's energy_input slot (PartAbility.INPUT_ENERGY)
// Rhino: var + function; console.warn, never console.error (fatal in a startup script, XP-S0a).
;(function () {
  var marker = JsonIO.read('kubejs/config/gg_test_maxplus_wireless.json')
  var ON = marker !== null && String(marker.get('enabled')) === 'true'
  if (!ON) return
  var TYPE = 'gg_maxplus_wireless'
  var PLATE = 'gg_maxplus_wireless_plate'
  var seen = {}
  function guard(key, fn) {
    try { fn(); console.info('[maxplus-wireless] ' + key + ' registered') } catch (e) {
      if (!seen[key]) { seen[key] = true; console.warn('[maxplus-wireless] ' + key + ' failed: ' + e) }
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
        .langValue('MAX+ Wireless Test Plate')
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(TYPE)
        .recipeModifier(function (machine, recipe) { return ModifierFunction.IDENTITY }, true)
        .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
        .pattern(function (def) { return Pat.build(def, SPEC) })
        .workableCasingModel('gtceu:block/casings/solid/machine_casing_solid_steel', 'gtceu:block/multiblock/implosion_compressor')
    })
  })
})()
