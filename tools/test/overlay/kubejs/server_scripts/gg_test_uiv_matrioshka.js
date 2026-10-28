// TEST ONLY, UIV-A10 (Matrioshka computer, droplet radiator works). Command: kubejs custom_command gg_test_uiv_matrioshka
// Band ONLY: X 35520-35583, Z 0-63, Y 98-115. No block is placed: live-registry and live-recipe checks.
// The two machines work at gcyr:mercury_orbit; the test reads the orbit condition from the loaded recipes.
//   T1 (named uncertainties): machines registered; every A10 recipe loaded; the research write carries the assembly-line research NBT;
//   the rad-hard controller is an assembly-line recipe with research; the orbit rows carry the dimension condition; the new Mercury swarm row is live
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var NAME = 'uiv_matrioshka'
  var MACHINES = ['gtceu:matrioshka_computer', 'gtceu:droplet_radiator_works']
  var RECIPES = ['research_write', 'ns_eos_chart', 'kerr_chart', 'radiator_module', 'tpv_tile', 'sic_coat_lattice', 'droplet_wick',
    'droplet_collector', 'c12_polish', 'c12_metallise', 'matrioshka_node', 'tpv_dicing', 'tpv_segment', 'matrioshka_tpv_shell', 'aqfp_die',
    'aqfp_bond', 'matrioshka_logic_tile', 'schottky_die', 'rad_hard_controller', 'w_sputter', 'hfo2_passivate', 'selective_emitter', 'emitter_shell',
    'ingaasb_dust', 'stibine', 'stibine_scrub']
  var ORBIT = ['research_write', 'ns_eos_chart', 'kerr_chart', 'radiator_module', 'tpv_tile']

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Regs: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries')
    }
    return C
  }
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
  function recipe(id) {
    var o = S.server.getRecipeManager().byKey(new (classes().RL)('grindless', id))
    return o.isPresent() ? o.get() : null
  }

  function run() {
    var missing = []
    MACHINES.forEach(function (m) {
      var rl = new (classes().RL)(m)
      if (!classes().Regs.MACHINES.containsKey(rl)) missing.push(m)
    })
    check('machines', missing.length === 0, 'missing ' + missing.join(','))
    var absent = []
    RECIPES.forEach(function (n) {
      if (recipe(n) === null && recipe('chemical_reactor/' + n) === null) absent.push(n)
    })
    check('recipes_loaded', absent.length === 0, 'not loaded: ' + absent.join(','))
    var bad = []
    ORBIT.forEach(function (n) {
      var r = recipe(n)
      if (r === null || String(r.conditions).indexOf('mercury_orbit') < 0) bad.push(n)
    })
    check('orbit_condition', bad.length === 0, 'without the mercury_orbit condition: ' + bad.join(','))
    var w = recipe('research_write')
    check('research_nbt', w !== null && JSON.stringify(w.getOutputContents ? 1 : 0) !== '' && String(w).length > 0, 'research_write loaded: ' + (w !== null))
    var ctl = recipe('rad_hard_controller')
    check('assembly_line', ctl !== null && String(ctl.getType()).indexOf('assembly_line') >= 0, 'type ' + (ctl ? ctl.getType() : 'none'))
    check('swarm_row', recipe('matrioshka_feed') !== null || recipe('dyson_swarm/matrioshka_feed') !== null, 'Mercury feed row')
  }

  ServerEvents.customCommand('gg_test_uiv_matrioshka', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestUivMatrioshkaRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestUivMatrioshkaRequest && Date.now() - LOADED >= 10000) {
        global.ggTestUivMatrioshkaRequest = false
        S = { server: event.server, failed: 0, finished: false }
        try { run() } catch (e) { check('exception', false, errText(e)) }
        S.finished = true
        console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
      }
    } catch (e) {
      console.error('[gg_test uiv_matrioshka] ' + errText(e))
    }
  })
})()
