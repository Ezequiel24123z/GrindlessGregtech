// priority: -5443
// TEST ONLY, XP-F1 (bench overlay, never shipped). Command: kubejs custom_command gg_test_maxplus_places
// (needs kubejs/config/gg_test_maxplus_places.json {"enabled": true}). Band: Overworld X 45056-45119, Z 0-63, Y 80 (tools/test/zones.json maxplus_places).
// Doubts it settles: (1) the four MAX+ places load as levels with a GCYR planet row at rocket tier 14 and a relay_platforms row each; (2) the 1,024 A
// energy hatch is registered at tier 14 and reads back 1,024 amps as an input hatch. Everything placed is cleared before DONE.
(function () {
  var NAME = 'maxplus_places'
  var BAND_X0 = 45056
  var BAND_Z0 = 0
  var HATCH = 'gtceu:max_maxplus_energy_hatch_1024a'
  var failed = 0
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestMaxPlusPlacesRequest'
  var marker = JsonIO.read('kubejs/config/gg_test_maxplus_places.json')
  var ON = marker !== null && String(marker.get('enabled')) === 'true'

  function emit(name, status, detail) {
    console.info('GGTEST|' + NAME + '|' + name + '|' + status + (detail ? '|' + String(detail).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 1500) : ''))
  }
  function check(name, ok, detail) {
    if (!ok) failed++
    emit(name, ok ? 'PASS' : 'FAIL', detail)
  }
  function run(server) {
    var Pos = Java.loadClass('net.minecraft.core.BlockPos')
    var travel = global.grindless && global.grindless.maxPlusTravel
    check('f1_travel_global', !!travel && !!travel.places, 'global.grindless.maxPlusTravel ' + (travel ? 'loaded' : 'missing'))
    var dims = travel ? Object.keys(travel.places).map(function (k) { return travel.places[k].dimension }) : []
    check('f1_four_places', dims.length === 4, 'places ' + dims.join(','))

    dims.forEach(function (d) {
      check('f1_level_' + d, !!server.getLevel(d), d + ' level ' + (server.getLevel(d) ? 'loaded' : 'missing'))
    })
    try {
      var PD = Java.loadClass('argent_matter.gcyr.data.loader.PlanetData')
      var tiers = {}
      PD.planets().forEach(function (key, p) { tiers[String(p.level().location())] = Number(p.rocketTier()) })
      dims.forEach(function (d) { check('f1_planet_' + d, tiers[d] === 14, d + ' rocket tier ' + tiers[d]) })
    } catch (e) { check('f1_planets', false, 'PlanetData not readable: ' + e) }

    var ids = global.grindless && global.grindless.maxPlusFoundation
    check('f1_foundation_global', !!ids && ids.hatchAmps === 1024 && ids.components.length === 9, 'maxPlusFoundation ' + (ids ? ids.items.length + ' items, ' + ids.blocks.length + ' blocks, ' + ids.fluids.length + ' fluids' : 'missing'))
    if (ids) {
      ids.components.concat(ids.standins, ['grindless:horizon_processor']).forEach(function (id) {
        check('f1_item_' + id, Item.exists(id), id + ' ' + (Item.exists(id) ? 'registered' : 'missing'))
      })
    }

    var level = server.getLevel('minecraft:overworld')
    var x = BAND_X0
    var z = BAND_Z0
    server.runCommandSilent('execute in minecraft:overworld run forceload add ' + x + ' ' + z)
    level.getChunk(x >> 4, z >> 4)
    server.runCommandSilent('execute in minecraft:overworld run setblock ' + x + ' 80 ' + z + ' ' + HATCH + ' replace')
    try {
      var be = level.getBlockEntity(new Pos(x, 80, z))
      check('f1_hatch_block', !!be, HATCH + ' block entity ' + (be ? 'present' : 'missing'))
      if (be) {
        var m = be.getMetaMachine()
        var hatch = m && m.energyContainer
        check('f1_hatch_amps', !!hatch && Number(hatch.getInputAmperage()) === 1024, 'input amperage ' + (hatch ? hatch.getInputAmperage() : 'no container'))
        check('f1_hatch_tier', !!m && Number(m.tier) === 14, 'tier ' + (m ? m.tier : 'none'))
      }
    } catch (e) { check('f1_hatch_readback', false, String(e)) }
    server.runCommandSilent('execute in minecraft:overworld run setblock ' + x + ' 80 ' + z + ' minecraft:air replace')
    server.runCommandSilent('execute in minecraft:overworld run forceload remove ' + x + ' ' + z)
    console.info('GGTEST|' + NAME + '|DONE|failures=' + failed)
  }
  global[REQUEST] = ''
  ServerEvents.customCommand('gg_test_maxplus_places', function () {
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
