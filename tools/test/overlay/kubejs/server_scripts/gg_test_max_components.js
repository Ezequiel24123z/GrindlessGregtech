// TEST ONLY, MAX-A2 first six components (docs/eras/max.md, A2). Command: kubejs custom_command gg_test_max_components
// Markers: GGTEST|max_components|<check>|PASS/FAIL|..., then GGTEST|max_components|DONE|failures=N.
// Band ONLY: X 39448-39511, Z 0-63, Y 98-115 (zones.json row max_components). Read-only: it places nothing.
// Doubt: every row of components.js and the older-machine rows A2 added reach the recipe manager under their own ids, with the six
//   component rows at VA[MAX] (2013265920 EU/t), so the large assembler with two OpV 4 A hatches is the one that can run them.
//   lookup   every recipe id A2 writes is in the recipe manager
//   static   components.js skipped nothing, and its pendingRoutes name the three A3 parts
//   eut      each component recipe asks 2013265920 EU/t
(function () {
  var S = null
  var LOADED = Date.now()
  var NAME = 'max_components'
  var VA_MAX = 2013265920

  var COMPONENTS = ['max_electric_motor', 'max_electric_pump', 'max_electric_piston', 'max_robot_arm', 'max_emitter', 'max_fluid_regulator']
  var IDS = [
    'chemical_bath/stabilised_rebco_tape', 'chemical_reactor/silica_alcogel', 'chemical_bath/silylated_alcogel', 'chemical_reactor/exotic_infiltrated_preform',
    'chemical_reactor/potted_superleak', 'lathe/exotic_composite_rod', 'forming_press/exotic_composite_rotor', 'cutter/laminated_terfenol_stack',
    'assembler/max_field_coil', 'assembler/max_optical_isolator', 'assembler/sc_magnetic_bearing', 'assembler/superfluid_valve'
  ].concat(COMPONENTS.map(function (c) { return 'assembler/' + c }))

  function errText(e) {
    var s = ''
    try { s = String(e.message || '') } catch (x) { }
    return s === '' ? 'unprintable exception' : s
  }
  function clean(x) { return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 1500) }
  function check(name, ok, detail) {
    if (!ok) S.failed++
    console.info('GGTEST|' + NAME + '|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + clean(detail))
  }

  function begin(server) {
    S = { failed: 0 }
    try {
      var RL = Java.loadClass('net.minecraft.resources.ResourceLocation')
      var rm = server.getRecipeManager()
      var missing = IDS.filter(function (i) { return !rm.byKey(new RL('grindless:' + i)).isPresent() })
      check('lookup', missing.length === 0, IDS.length + ' ids checked; missing: ' + (missing.length ? missing.join(', ') : 'none'))
      var MC = global.grindless.maxComponents
      var pending = MC ? MC.pendingRoutes.join(',') : 'none'
      check('static', !!MC && MC.skipped.length === 0 && /max_conveyor_module/.test(pending) && /max_sensor/.test(pending) && /max_field_generator/.test(pending),
        'recipes ' + (MC ? MC.recipes.length : null) + ', skipped ' + JSON.stringify(MC ? MC.skipped : null) + ', pending ' + pending)
      var bad = []
      COMPONENTS.forEach(function (c) {
        var r = rm.byKey(new RL('grindless:assembler/' + c))
        if (!r.isPresent()) { bad.push(c + ' absent'); return }
        var eut = Number(r.get().tickInputs.get(Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.EURecipeCapability').CAP).get(0).content)
        if (eut !== VA_MAX) bad.push(c + ' ' + eut)
      })
      check('eut', bad.length === 0, 'components off VA[MAX]: ' + (bad.length ? bad.join(', ') : 'none'))
    } catch (e) { check('exception', false, errText(e)) }
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  ServerEvents.customCommand('gg_test_max_components', function () {
    if (S !== null) return 0
    global.ggTestMaxComponentsRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    if (global.ggTestMaxComponentsRequest && Date.now() - LOADED >= 10000) {
      global.ggTestMaxComponentsRequest = false
      begin(event.server)
    }
  })
})()
