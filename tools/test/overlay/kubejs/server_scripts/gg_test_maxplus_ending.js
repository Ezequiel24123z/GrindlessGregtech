// priority: -5166
// TEST ONLY, XP-Z1b ending (docs/eras/maxplus.md "The ending"). Server half; partner of client_scripts/gg_test_maxplus_ending.js.
// Runs in the client suite (integrated server) and only with kubejs/config/gg_test_maxplus_ending.json {"enabled": true}.
// Installs a test-only double of global.grindless.hyperstargate (XP-G1): one gate whose interior box surrounds the test player, open on demand.
// Checks: a closed gate never teleports; an open one sends the player to grindless:horizon_city at the arrival point with the plaza in place;
// the epilogue (count 1) and, on the client, the WinScreen after the dimension change; the player alive, the same object and not moved after
// the credits; the epilogue book opening on a real right-click; one crossing per dial run (ending.js tracks used players per run), so a same-run
// reopening does not cross again, with no second epilogue and no second WinScreen.
;(function () {
  var NAME = 'maxplus_ending'
  var CHM = Java.loadClass('java.util.concurrent.ConcurrentHashMap')
  if (!global.ggMaxplusEnding) global.ggMaxplusEnding = new CHM()
  var S = global.ggMaxplusEnding
  var marker = JsonIO.read('kubejs/config/gg_test_maxplus_ending.json')
  if (!marker || !marker.enabled) return
  var HORIZON = 'grindless:horizon_city'
  var st = { ticks: 0, phase: 'wait', at: 0, gate: null, before: null, player: null, done: false, afterClose: null, closedAt: -1 }

  function log(check, status, detail) {
    console.info('GGTEST|' + NAME + '|' + check + '|' + status + (detail ? '|' + String(detail).replace(/\|/g, '/') : ''))
  }
  function dimOf(p) {
    var d = p.level.dimension
    return String(typeof d === 'function' ? p.level.dimension().location() : d)
  }
  function go(phase) {
    st.phase = phase
    st.at = st.ticks
  }
  function since() {
    return st.ticks - st.at
  }
  function epilogues(p) {
    return Number(p.inventory.count('grindless:epilogue'))
  }
  function finish() {
    st.done = true
    S.put('hold', 'false')
    log('DONE', 'NOTE')
  }
  function check(name, ok, detail) {
    log(name, ok ? 'PASS' : 'FAIL', detail)
  }

  PlayerEvents.tick(function (event) {
    var p = event.player
    if (st.done || p === null || p === undefined) return
    try {
      st.ticks++
      S.put('hold', 'true')
      var dim = dimOf(p)
      if (st.phase === 'wait') {
        if (st.ticks >= 60 && String(S.get('idle') || '') === 'true' && dim === 'minecraft:overworld') {
          var x = Math.floor(p.getX())
          var y = Math.floor(p.getY())
          var z = Math.floor(p.getZ())
          st.before = { x: p.getX(), y: p.getY(), z: p.getZ() }
          st.player = p
          st.gate = {
            dimension: 'minecraft:overworld', pos: { x: x, y: y + 10, z: z }, facing: 'north', open: false,
            box: { minX: x - 3, minY: y - 3, minZ: z - 3, maxX: x + 3, maxY: y + 3, maxZ: z + 3 }
          }
          var gate = st.gate
          global.grindless = global.grindless || {}
          global.grindless.hyperstargate = { gates: function () { return [gate] } }
          log('double', 'NOTE', 'closed test gate around ' + x + ',' + y + ',' + z)
          // #302: an admin's forced chunk inside the plaza must survive the crossing; the others must not stay forced
          p.server.runCommandSilent('execute in ' + HORIZON + ' run forceload add 0 0')
          go('closed')
        }
      } else if (st.phase === 'closed') {
        if (since() >= 40) {
          check('closed_gate', dim === 'minecraft:overworld', 'dimension ' + dim)
          st.gate.open = true
          go('open1')
        }
      } else if (st.phase === 'open1') {
        if (dim === HORIZON) {
          var d = Math.abs(p.getX() - 0.5) + Math.abs(p.getY() - 4) + Math.abs(p.getZ() - 0.5)
          check('teleport', d < 1.5, 'at ' + p.getX().toFixed(2) + ',' + p.getY().toFixed(2) + ',' + p.getZ().toFixed(2) + ' after ' + since() + ' ticks')
          var ground = String(p.level.getBlock(0, 3, 0).id)
          check('plaza', ground !== 'minecraft:air', 'block at 0,3,0 is ' + ground)
          var q = function (bx, bz) { return Number(p.server.runCommandSilent('execute in ' + HORIZON + ' run forceload query ' + bx + ' ' + bz)) }
          check('tickets_kept_preforced', q(0, 0) > 0, 'the pre-forced chunk 0,0 query ' + q(0, 0))
          check('tickets_released', q(-16, -16) === 0 && q(-16, 0) === 0 && q(0, -16) === 0, 'queries ' + q(-16, -16) + ',' + q(-16, 0) + ',' + q(0, -16))
          check('epilogue_given', epilogues(p) === 1, 'count ' + epilogues(p))
          go('credits')
        } else if (since() > 400) {
          check('teleport', false, 'no crossing in 400 ticks, dimension ' + dim)
          finish()
        }
      } else if (st.phase === 'credits') {
        if (st.closedAt < 0 && String(S.get('closed') || '') === 'true') {
          st.closedAt = st.ticks
          st.afterClose = { x: p.getX(), y: p.getY(), z: p.getZ() }
        }
        if (st.closedAt >= 0 && st.ticks - st.closedAt >= 100) {
          var m = Math.abs(p.getX() - st.afterClose.x) + Math.abs(p.getY() - st.afterClose.y) + Math.abs(p.getZ() - st.afterClose.z)
          check('credits_seen', String(S.get('seen') || '') === 'true', 'WinScreen after the dimension change: ' + S.get('screenClass'))
          check('alive', p.isAlive() && p.getHealth() > 0, 'health ' + p.getHealth())
          check('same_player', p === st.player, 'not respawned')
          check('not_moved', m < 0.01 && dim === HORIZON, 'moved ' + m.toFixed(3) + ', dimension ' + dim)
          S.put('bookReq', 'true')
          go('book')
        } else if (since() > 900) {
          check('credits_seen', false, 'the WinScreen never closed: seen ' + S.get('seen'))
          finish()
        }
      } else if (st.phase === 'book') {
        if (String(S.get('bookSeen') || '') === 'true') {
          check('book', true, String(S.get('bookClass')))
          p.teleportTo('minecraft:overworld', st.before.x, st.before.y, st.before.z, 0, 0)
          go('back')
        } else if (since() > 300) {
          check('book', false, 'no BookViewScreen after right-click; screen ' + S.get('bookClass'))
          p.teleportTo('minecraft:overworld', st.before.x, st.before.y, st.before.z, 0, 0)
          go('back')
        }
      } else if (st.phase === 'back') {
        if (since() === 60) {
          check('one_per_opening', dim === 'minecraft:overworld', 'same opening, dimension ' + dim)
          st.gate.open = false
          go('shut')
        }
      } else if (st.phase === 'shut') {
        if (since() === 20) {
          S.put('seenBefore2', String(S.get('seen') || ''))
          S.put('phase2', 'true')
          st.gate.open = true
          go('open2')
        }
      } else if (st.phase === 'open2') {
        if (dim === HORIZON) {
          check('second_crossing', false, 'crossed again in the same run after ' + since() + ' ticks')
          finish()
        } else if (since() > 400) {
          check('second_crossing', dim === 'minecraft:overworld', 'same run, dimension ' + dim)
          go('settle')
        }
      } else if (st.phase === 'settle') {
        if (since() >= 60) {
          check('epilogue_once', epilogues(p) === 1, 'count ' + epilogues(p))
          check('no_second_credits', String(S.get('win2') || '') !== 'true', 'second WinScreen: ' + S.get('win2'))
          finish()
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
