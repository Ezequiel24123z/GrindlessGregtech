// priority: -5632
// TEST ONLY, MAX-S0 dump: S0-1 (planet rows and levels), S0-5 (long maths of case 14), S0-8 (gtnn supracausal recipes), S0-10 (site rows).
// Command: kubejs custom_command gg_test_max_s0_dump (needs kubejs/config/gg_test_max_s0.json {"enabled": true})
(function () {
  var NAME = 'max_s0_dump'
  var failed = 0
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestMaxS0DumpRequest'
  var marker = JsonIO.read('kubejs/config/gg_test_max_s0.json')
  var ON = marker !== null && String(marker.get('enabled')) === 'true'

  function emit(name, status, detail) {
    console.info('GGTEST|' + NAME + '|' + name + '|' + status + (detail ? '|' + String(detail).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 1500) : ''))
  }
  function check(name, ok, detail) {
    if (!ok) failed++
    emit(name, ok ? 'PASS' : 'FAIL', detail)
  }
  function run(server) {
    var GTValues = Java.loadClass('com.gregtechceu.gtceu.api.GTValues')
    var v = GTValues.V[GTValues.MAX]
    emit('s0_5_vmax', 'NOTE', 'V[MAX]=' + v + ' tier MAX=' + GTValues.MAX)
    var cap = v * 64 * 10
    check('s0_5_cap_long', cap === 2 * 1024 * 1024 * 1024 * 64 * 10 && cap > 2147483647, '64 A x V[MAX] x 10 = ' + cap)
    check('s0_5_int_wrap_2a', (v * 2) !== (v * 2 | 0), '2 A x V[MAX] = ' + (v * 2) + ' as int ' + (v * 2 | 0))

    ;['grindless:s0_max_bh_orbit', 'grindless:s0_max_nsc_belt', 'gcyr:black_hole_orbit'].forEach(function (d) {
      check('s0_1_level_' + d, !!server.getLevel(d), d + ' level ' + (server.getLevel(d) ? 'loaded' : 'missing'))
    })
    try {
      var PD = Java.loadClass('argent_matter.gcyr.data.loader.PlanetData')
      var rows = PD.planets()
      var out = []
      rows.forEach(function (key, p) { out.push(String(key) + ':t' + p.rocketTier()) })
      emit('s0_1_planets', 'NOTE', out.join(' '))
    } catch (e) { emit('s0_1_planets', 'NOTE', 'PlanetData not readable: ' + e) }

    var rm = server.getRecipeManager()
    var n = 0
    var ids = []
    rm.getRecipes().forEach(function (r) {
      var id = String(r.getId())
      if (id.indexOf('gtnn') === 0 && /supracausal/.test(id)) { n++; if (ids.length < 12) ids.push(id) }
    })
    emit('s0_8_recipes', 'NOTE', n + ' gtnn supracausal recipes in the recipe manager: ' + ids.join(' '))
    var tags = server.tags
    emit('s0_8_item', 'NOTE', 'gtnn:supracausal_mainframe = ' + (Item.exists('gtnn:supracausal_mainframe') ? 'registered' : 'missing'))

    var disk = global.grindless && global.grindless.cygnusDisk
    emit('s0_10_global', 'NOTE', 'cygnus disk table loaded: ' + (disk ? 'yes' : 'no'))
    console.info('GGTEST|' + NAME + '|DONE|failures=' + failed)
  }
  global[REQUEST] = ''
  ServerEvents.customCommand('gg_test_max_s0_dump', function () {
    if (!ON) return
    global[REQUEST] = 'run'
  })
  ServerEvents.tick(function (event) {
    try {
      if (global[REQUEST] !== '' && Date.now() - LOADED_AT >= 10000) {
        global[REQUEST] = ''
        run(event.server)
      }
    } catch (e) {
      failed++
      emit('exception', 'FAIL', String(e))
      console.info('GGTEST|' + NAME + '|DONE|failures=' + failed)
    }
  })
})()
