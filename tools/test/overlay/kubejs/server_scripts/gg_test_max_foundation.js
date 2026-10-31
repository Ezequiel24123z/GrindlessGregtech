// TEST ONLY, MAX-F1 (bench overlay, never shipped). Command: kubejs custom_command gg_test_max_foundation
// (needs kubejs/config/gg_test_max_foundation.json {"enabled": true}). Band: Overworld X 0-15, Z 0-15 of BAND_X0/BAND_Z0 below, Y 80 (the integrator assigns
// the real band in tools/test/zones.json and edits BAND_X0 here). Everything placed is cleared before DONE.
// Doubts it settles: (1) gtceu:horizon_strand_single_cable reads back 16 A at V[MAX] with loss 1 per block and amp (S0-3); (2) both tier-14 places load as
// levels with a GCYR planet row at rocket tier 14 and a relay_platforms row each, and the three F1 ids that already existed are still registered once.
(function () {
  var NAME = 'max_foundation'
  var BAND_X0 = 39000
  var BAND_Z0 = 0
  var CABLE = 'gtceu:horizon_strand_single_cable'
  var failed = 0
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestMaxFoundationRequest'
  var marker = JsonIO.read('kubejs/config/gg_test_max_foundation.json')
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
    var Pos = Java.loadClass('net.minecraft.core.BlockPos')
    var maxT = Number(GTValues.MAX)
    var level = server.getLevel('minecraft:overworld')
    var x = BAND_X0
    var z = BAND_Z0
    server.runCommandSilent('execute in minecraft:overworld run forceload add ' + x + ' ' + z)
    level.getChunk(x >> 4, z >> 4)
    server.runCommandSilent('execute in minecraft:overworld run setblock ' + x + ' 80 ' + z + ' ' + CABLE + ' replace')
    try {
      var be = level.getBlockEntity(new Pos(x, 80, z))
      check('f1_cable_block', !!be, CABLE + ' block entity ' + (be ? 'present' : 'missing'))
      if (be) {
        var nd = be.getNodeData()
        check('f1_cable_voltage', Number(nd.getVoltage()) === Number(GTValues.V[maxT]), 'voltage ' + nd.getVoltage() + ' vs V[MAX] ' + GTValues.V[maxT])
        check('f1_cable_amperage', Number(nd.getAmperage()) === 16, 'amperage ' + nd.getAmperage())
        check('f1_cable_loss', Number(nd.getLossPerBlock()) === 1, 'loss per block ' + nd.getLossPerBlock())
      }
    } catch (e) { check('f1_cable_readback', false, String(e)) }
    server.runCommandSilent('execute in minecraft:overworld run setblock ' + x + ' 80 ' + z + ' minecraft:air replace')
    server.runCommandSilent('execute in minecraft:overworld run forceload remove ' + x + ' ' + z)

    ;['gcyr:black_hole_orbit', 'grindless:nsc_belt'].forEach(function (d) {
      check('f1_level_' + d, !!server.getLevel(d), d + ' level ' + (server.getLevel(d) ? 'loaded' : 'missing'))
    })
    try {
      var PD = Java.loadClass('argent_matter.gcyr.data.loader.PlanetData')
      var rows = PD.planets()
      var tiers = {}
      rows.forEach(function (key, p) { tiers[String(p.orbitWorld ? p.orbitWorld() : '') + '|' + String(key)] = Number(p.rocketTier()) })
      var found = { 'gcyr:black_hole_orbit': -1, 'grindless:nsc_belt': -1 }
      Object.keys(tiers).forEach(function (k) {
        var w = k.split('|')[0]
        if (Object.prototype.hasOwnProperty.call(found, w)) found[w] = tiers[k]
      })
      Object.keys(found).forEach(function (w) { check('f1_planet_' + w, found[w] === 14, w + ' rocket tier ' + found[w]) })
    } catch (e) { check('f1_planets', false, 'PlanetData not readable: ' + e) }

    var plat = global.grindless && global.grindless.maxTravel
    check('f1_travel_global', !!plat && !!plat.places && plat.places.sgra.dimension === 'gcyr:black_hole_orbit' && plat.places.nsc.dimension === 'grindless:nsc_belt',
      'global.grindless.maxTravel ' + (plat ? 'loaded' : 'missing'))
    var ids = global.grindless && global.grindless.maxFoundation
    check('f1_foundation_global', !!ids && ids.items.length === 258 && ids.blocks.length === 7, 'maxFoundation ' + (ids ? ids.items.length + ' items, ' + ids.blocks.length + ' blocks' : 'missing'))
    ;['grindless:eu_yso_boule', 'grindless:mram_stack_wafer', 'grindless:hollow_core_fibre'].forEach(function (id) {
      check('f1_existing_' + id, Item.exists(id), id + ' ' + (Item.exists(id) ? 'registered' : 'missing'))
    })
    console.info('GGTEST|' + NAME + '|DONE|failures=' + failed)
  }
  global[REQUEST] = ''
  ServerEvents.customCommand('gg_test_max_foundation', function () {
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
