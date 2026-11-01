// priority: -2460
// TEST ONLY, P9-T3a. Server half; partner of client_scripts/gg_test_horizon_city_shots.js (talks through global.ggCityShots).
// Client suite only, and only with kubejs/config/gg_test_horizon_city_shots.json {"enabled": true}. Sends the test player (spectator) to the
// arrival point of grindless:horizon_city (pack/kubejs/data/grindless/tables/horizon_city.json: 0,4,0), stands the plaza template where the
// table says, and asks the client for four screenshots, kubejs/exported/gg_city_<name>.png: the skyline south and north, the sky with the
// lensed ring, and the plaza from above. Nothing is placed outside the plaza's 32 x 6 x 32 footprint; the player goes back afterwards.
//   GGTEST|horizon_city_shots|<name>|PASS|FAIL|NOTE|<detail>   and   GGTEST|horizon_city_shots|DONE
// var + function: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
;(function () {
  var NAME = 'horizon_city_shots'
  var DIM = 'grindless:horizon_city'
  var CHM = Java.loadClass('java.util.concurrent.ConcurrentHashMap')
  if (!global.ggCityShots) global.ggCityShots = new CHM()
  var S = global.ggCityShots
  var marker = JsonIO.read('kubejs/config/gg_test_horizon_city_shots.json')
  if (!marker || !marker.enabled) return
  var table = JsonIO.read('kubejs/data/grindless/tables/horizon_city.json')
  var AX = table && table.arrival ? Number(table.arrival.x) : 0
  var AY = table && table.arrival ? Number(table.arrival.y) : 4
  var AZ = table && table.arrival ? Number(table.arrival.z) : 0
  var O = table && table.plaza ? table.plaza.origin : [-16, 3, -16]
  var SHOTS = [
    { name: 'skyline_south', x: AX + 0.5, y: AY + 1, z: AZ + 0.5, yaw: 0, pitch: -4, settle: 80 },
    { name: 'skyline_north', x: AX + 0.5, y: AY + 1, z: AZ + 0.5, yaw: 180, pitch: -4, settle: 80 },
    { name: 'sky_ring', x: AX + 0.5, y: AY + 1, z: AZ + 0.5, yaw: 0, pitch: -50, settle: 80 },
    { name: 'plaza', x: AX + 0.5, y: AY + 14, z: AZ - 28, yaw: 0, pitch: 27, settle: 80 }
  ]
  var st = { ticks: 0, phase: 'wait', at: 0, i: 0, origin: null, done: false, player: null, probe: null }

  function log(check, status, detail) {
    console.info('GGTEST|' + NAME + '|' + check + '|' + status + (detail ? '|' + String(detail).replace(/[\r\n|]+/g, ' ').substring(0, 1200) : ''))
  }
  function go(phase) { st.phase = phase; st.at = st.ticks }
  function since() { return st.ticks - st.at }
  function dimOf(p) {
    var d = p.level.dimension
    return String(typeof d === 'function' ? p.level.dimension().location() : d)
  }
  function cmd(server, text) { return Number(server.runCommandSilent('execute in ' + DIM + ' run ' + text)) }
  function finish(server, p) {
    st.done = true
    try {
      if (st.origin !== null) {
        p.teleportTo('minecraft:overworld', st.origin.x, st.origin.y, st.origin.z, st.origin.yaw, st.origin.pitch)
        server.runCommandSilent('gamemode ' + st.origin.mode + ' ' + p.getName().getString())
      }
    } catch (e) { log('restore', 'NOTE', 'failed: ' + e) }
    S.put('hold', 'false')
    log('DONE', 'NOTE')
  }
  function requestShot(s, probe) {
    S.put('shotResult', '')
    S.put('shotRequest', JSON.stringify({ name: 'gg_city_' + s.name, cam: { x: s.x, y: s.y, z: s.z }, probe: probe, settle: s.settle }))
    S.put('shotToken', 's' + st.ticks)
  }

  PlayerEvents.tick(function (event) {
    var p = event.player
    if (st.done || p === null || p === undefined) return
    var server = event.server
    try {
      st.ticks++
      S.put('hold', 'true')
      if (st.phase === 'wait') {
        if (st.ticks >= 100 && String(S.get('idle') || '') === 'true' && dimOf(p) === 'minecraft:overworld') {
          var mode = 'survival'
          try { mode = p.isCreative() ? 'creative' : 'survival' } catch (e0) { }
          st.origin = { x: p.getX(), y: p.getY(), z: p.getZ(), yaw: p.getYaw(), pitch: p.getPitch(), mode: mode }
          server.runCommandSilent('gamemode spectator ' + p.getName().getString())
          p.teleportTo(DIM, AX + 0.5, AY, AZ + 0.5, 0, 0)
          go('arrive')
        }
      } else if (st.phase === 'arrive') {
        if (dimOf(p) === DIM && since() >= 60) {
          cmd(server, 'forceload add -48 -48 48 48')
          go('place')
        } else if (since() > 400) {
          log('arrive', 'FAIL', 'dimension ' + dimOf(p))
          finish(server, p)
        }
      } else if (st.phase === 'place') {
        if (since() === 20) {
          var rc = cmd(server, 'place template grindless:horizon_city/arrival_plaza ' + O[0] + ' ' + O[1] + ' ' + O[2])
          log('plaza', rc > 0 ? 'PASS' : 'FAIL', 'place template result ' + rc)
        }
        if (since() >= 60) {
          st.probe = { x: AX, y: AY - 1, z: AZ, id: String(p.level.getBlock(AX, AY - 1, AZ).id) }
          log('probe', 'NOTE', st.probe.id + ' at ' + AX + ',' + (AY - 1) + ',' + AZ)
          go('aim')
        }
      } else if (st.phase === 'aim') {
        var s = SHOTS[st.i]
        p.teleportTo(DIM, s.x, s.y - 1.62, s.z, s.yaw, s.pitch)
        if (since() >= 6) {
          requestShot(s, st.probe)
          go('shot')
        }
      } else if (st.phase === 'shot') {
        var r = String(S.get('shotResult') || '')
        if (r !== '' || since() > 900) {
          log(SHOTS[st.i].name, r.indexOf('PASS') === 0 ? 'PASS' : 'FAIL', r === '' ? 'the client never answered' : r)
          S.put('shotToken', '')
          st.i++
          if (st.i >= SHOTS.length) {
            cmd(server, 'forceload remove -48 -48 48 48')
            finish(server, p)
          } else {
            go('aim')
          }
        } else if (since() % 20 === 0) {
          var s2 = SHOTS[st.i]
          p.teleportTo(DIM, s2.x, s2.y - 1.62, s2.z, s2.yaw, s2.pitch)
        }
      }
    } catch (e) {
      st.done = true
      S.put('hold', 'false')
      log('script', 'FAIL', 'exception: ' + e)
      log('DONE', 'NOTE')
    }
  })
})()
