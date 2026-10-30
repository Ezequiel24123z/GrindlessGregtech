// priority: -7574
// TEST ONLY, TP-S0F. Command: kubejs custom_command gg_test_tp_high_tier
// Registry and recipe-manager checks only (no structures, no world blocks, no zone): highTierContent is on, GTM registers the UHV-OpV
// components, basic machines, hulls and hatches, and the 15 UEV/UIV/UXV hull and hatch outputs keep exactly one recipe, ours.
(function () {
  var NAME = 'tp_high_tier'
  var TIERS = ['uhv', 'uev', 'uiv', 'uxv', 'opv']
  var FAMILIES = ['electric_motor', 'electric_pump', 'fluid_regulator', 'conveyor_module', 'electric_piston', 'robot_arm', 'field_generator', 'emitter', 'sensor']
  var OURS_TIERS = ['uev', 'uiv', 'uxv']
  var OURS_BASES = ['machine_hull', 'energy_input_hatch', 'energy_output_hatch', 'energy_input_hatch_16a', 'energy_output_hatch_16a']
  var GTM_DUPLICATES = []
  OURS_TIERS.forEach(function (t) {
    GTM_DUPLICATES.push('gtceu:shaped/' + t + '_machine_hull', 'gtceu:assembler/energy_hatch_16a_' + t, 'gtceu:assembler/dynamo_hatch_16a_' + t)
  })
  function clean(x) { return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 1500) }
  function check(name, ok, detail) {
    console.info('GGTEST|' + NAME + '|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + clean(detail))
  }
  function safely(name, fn) {
    try { fn() } catch (e) { check(name, false, 'exception: ' + e) }
  }

  ServerEvents.customCommand('gg_test_tp_high_tier', function (event) {
    var server = event.getLevel().getServer()
    var RL = Java.loadClass('net.minecraft.resources.ResourceLocation')
    var Registries = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
    var have = function (id) { return Registries.ITEM.containsKey(new RL(id)) }

    safely('config', function () {
      var Holder = Java.loadClass('com.gregtechceu.gtceu.config.ConfigHolder')
      Holder.init()
      var v = Holder.INSTANCE.machines.highTierContent
      check('config', v === true, 'highTierContent=' + v)
    })

    safely('components', function () {
      var missing = []
      TIERS.forEach(function (t) { FAMILIES.forEach(function (f) { if (!have('gtceu:' + t + '_' + f)) missing.push(t + '_' + f) }) })
      check('components', missing.length === 0, (TIERS.length * FAMILIES.length) + ' ids, missing: ' + missing.join(','))
    })

    safely('basic_machines', function () {
      var missing = []
      TIERS.forEach(function (t) { ['electric_furnace', 'assembler'].forEach(function (m) { if (!have('gtceu:' + t + '_' + m)) missing.push(t + '_' + m) }) })
      check('basic_machines', missing.length === 0, 'missing: ' + missing.join(','))
    })

    safely('hull_and_hatches', function () {
      var missing = []
      OURS_TIERS.forEach(function (t) { OURS_BASES.forEach(function (b) { if (!have('gtceu:' + t + '_' + b)) missing.push(t + '_' + b) }) })
      check('hull_and_hatches', missing.length === 0, '15 ids, missing: ' + missing.join(','))
    })

    safely('one_recipe_each', function () {
      var manager = server.getRecipeManager()
      var bad = []
      OURS_TIERS.forEach(function (t) {
        OURS_BASES.forEach(function (b) {
          var id = 'gtceu:' + t + '_' + b
          var ours = 'grindless:assembly_line/' + t + '_' + b
          if (!manager.byKey(new RL(ours)).isPresent()) bad.push(id + ' lacks ' + ours)
        })
      })
      GTM_DUPLICATES.forEach(function (id) { if (manager.byKey(new RL(id)).isPresent()) bad.push('GTM duplicate present: ' + id) })
      check('one_recipe_each', bad.length === 0, bad.length === 0 ? '15 outputs, ours only; 9 GTM duplicates absent' : bad.join('; '))
    })

    console.info('GGTEST|' + NAME + '|DONE')
    return 1
  })
})()
