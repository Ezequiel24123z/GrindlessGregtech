// Gregtech Grindless - test overlay (not shipped with the pack)
//
// REAL-PATH test of the three travel keys (grindless:void_key / flat_key / end_key) with a real player, the way a person
// uses them: the client half (client_scripts/gg_test_dimension_keys.js) holds the "use" key binding for one client tick,
// so Minecraft runs its own right-click code (startUseItem -> MultiPlayerGameMode.useItem -> ServerboundUseItemPacket ->
// ServerPlayerGameMode.useItem -> Forge RightClickItem -> KubeJS ItemEvents.rightClicked -> server_scripts/grindless/
// dimensions.js). For each key: Overworld -> target -> back, checking the dimension on the server AND on the client, the
// landing spot, solid ground under the feet (block below + the client-driven onGround flag + no fall), the saved return
// point and the return to the exact departure spot. gg_test_dimensions.js only covers registration and the landing helpers.
//
// HOW TO RUN (client suite only: it needs a real player). Copy tools\test\overlay to a scratch folder, add
// kubejs\config\gg_test_dimension_keys.json = {"enabled": true} to it, then
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite client -OverlayDir <that folder>
// It starts by itself a few seconds after the player joins the world mc-runtime-test creates; the client half keeps
// mc-runtime-test in the world until GGTEST|dimension_keys|DONE. Do not combine it with the gg_test_gcyr_flight.json
// marker: both tests drive the same player.
//
// MARKERS: GGTEST|dimension_keys|<check>|PASS|FAIL|NOTE|<detail>; the last line is GGTEST|dimension_keys|DONE.
//   probe                                  which vanilla names KubeJS exposes on the real ServerPlayer/ServerLevel
//   <key>_click_out / <key>_click_back     how the right-click was done (NOTE)
//   <key>_travel, <key>_landing, <key>_on_ground, <key>_return_point, <key>_return
//   failure_message                        a key that cannot travel shows its action-bar message on the client (read by
//                                          startup_scripts/gg_test_dimension_keys.js) and leaves the player where it was
//   all_keys
//
// TEST AREA: Overworld band X 4352-4415, Y 98-112, Z 0-15: it clears X 4379-4389 Z 3-13 Y 98-112 and puts a smooth stone
// floor at Y 98 (X 4382-4386, Z 6-10); the player starts at 4384.5 99 8.5 and ends there, so the floor stays (the client
// world is thrown away after the run). The keys themselves land on grindless:void 4384 64 8 (stone brick platform at Y 63),
// grindless:flat 4384 64 8 and minecraft:the_end 2000 64 0.
//
// var + function everywhere: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
;(function () {
  var TAG = 'GGTEST|dimension_keys|'
  var MARKER = 'kubejs/config/gg_test_dimension_keys.json'
  var REQ = 'ggTestDimensionKeysRequest'
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var AREA = { x0: 4379, x1: 4389, y0: 98, y1: 112, z0: 3, z1: 13 }
  var FLOOR = { x0: 4382, x1: 4386, y: 98, z0: 6, z1: 10 }
  var START = { x: 4384.5, y: 99, z: 8.5 }
  var OVERWORLD = 'minecraft:overworld'
  var MISSING_DIM = 'grindless:no_such_dimension'
  var KEYS = [
    { name: 'void', item: 'grindless:void_key', dim: 'grindless:void' },
    { name: 'flat', item: 'grindless:flat_key', dim: 'grindless:flat' },
    { name: 'end', item: 'grindless:end_key', dim: 'minecraft:the_end', fixed: { x: 2000.5, z: 0.5 } }
  ]
  var START_TICKS = 100   // after the first teleport to the test area: chunks around it reach the client
  var SETTLE_TICKS = 40   // after a trip, at least: the client loads the dimension and reports its position/onGround
  var SETTLE_MAX = 200    // ... and at most
  var STAY_TICKS = 20     // extra wait before using the key again (the keys have a 20-tick cooldown)
  var CLICK_TIMEOUT = 400 // ticks the client gets to perform a requested click
  var MOVE_TIMEOUT = 100  // ticks to wait for the dimension change after a click
  var ATTEMPTS = 3        // clicks per trip; the last one calls MultiPlayerGameMode.useItem directly
  var TEST_TIMEOUT = 6000

  var T = null

  // ---------------------------------------------------------------- output

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 2000)
  }

  // details never start with FAIL / ERROR: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function emit(check, status, detail) {
    var line = TAG + check + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }

  function check(name, ok, detail) {
    if (!ok) T.failed.push(name)
    emit(name, ok ? 'PASS' : 'FAIL', detail)
  }

  function note(name, detail) {
    emit(name, 'NOTE', detail)
  }

  function f2(n) {
    return Number(n).toFixed(2)
  }

  // ---------------------------------------------------------------- shared state with the client half

  // ConcurrentHashMap: the integrated server thread writes while the render thread reads (same JVM in the client suite)
  function shared() {
    if (!global.ggDimensionKeys) global.ggDimensionKeys = new (Java.loadClass('java.util.concurrent.ConcurrentHashMap'))()
    return global.ggDimensionKeys
  }

  function sval(key) {
    var v = shared().get(key)
    return v === null || v === undefined ? '' : String(v)
  }

  function enabledByMarker() {
    try {
      var m = JsonIO.read(MARKER)
      return m !== null && m !== undefined && String(m.get('enabled')) === 'true'
    } catch (e) {
      return false
    }
  }

  // ---------------------------------------------------------------- world and player helpers
  // Only names this KubeJS really exposes: it renames some vanilla members for scripts (Entity#getYRot/getXRot are
  // getYaw/getPitch, Level#getGameTime is getTime, Entity#level() is hidden), see the probe below.

  function testPlayer(server) {
    var list = new (Java.loadClass('java.util.ArrayList'))(server.getPlayerList().getPlayers())
    for (var i = 0; i < list.size(); i++) {
      var p = list.get(i)
      if (T.playerName === '' || String(p.getName().getString()) === T.playerName) return p
    }
    return null
  }

  function dimOf(p) {
    return String(p.getLevel().getDimension())
  }

  function pos(p) {
    return { x: Number(p.getX()), y: Number(p.getY()), z: Number(p.getZ()) }
  }

  function posText(q) {
    return f2(q.x) + ' ' + f2(q.y) + ' ' + f2(q.z)
  }

  function blockAt(level, x, y, z) {
    return level.getBlock(Math.floor(x), Math.floor(y), Math.floor(z))
  }

  function groundReport(level, q) {
    var below = blockAt(level, q.x, q.y - 1, q.z)
    var feet = blockAt(level, q.x, q.y, q.z)
    var head = blockAt(level, q.x, q.y + 1, q.z)
    var belowState = below.getBlockState()
    return {
      solid: !belowState.isAir() && belowState.blocksMotion(),
      free: feet.getBlockState().isAir() && head.getBlockState().isAir(),
      text: 'below ' + below.getId() + ', feet ' + feet.getId() + ', head ' + head.getId()
    }
  }

  function prepareArea(server) {
    var level = server.getLevel(OVERWORLD)
    var changed = 0
    for (var x = AREA.x0; x <= AREA.x1; x++) {
      for (var z = AREA.z0; z <= AREA.z1; z++) {
        for (var y = AREA.y0; y <= AREA.y1; y++) {
          var want = (y === FLOOR.y && x >= FLOOR.x0 && x <= FLOOR.x1 && z >= FLOOR.z0 && z <= FLOOR.z1) ? 'minecraft:smooth_stone' : 'minecraft:air'
          var b = level.getBlock(x, y, z)
          if (String(b.getId()) !== want) {
            b.set(want)
            changed++
          }
        }
      }
    }
    return changed
  }

  function returnPoint(p) {
    var sub = p.getPersistentData().getCompound('grindless_dimensions')
    if (!sub.contains('return_dim')) return null
    return { dim: String(sub.getString('return_dim')), x: Number(sub.getDouble('return_x')), y: Number(sub.getDouble('return_y')), z: Number(sub.getDouble('return_z')) }
  }

  // which vanilla names this KubeJS exposes on the real objects the key handler uses
  function probe(p) {
    var level = p.getLevel()
    var names = ['getYRot', 'getYaw', 'getXRot', 'getPitch', 'getX', 'level', 'getLevel', 'getStringUUID', 'getStringUuid', 'teleportTo']
    var parts = names.map(function (n) { return 'player.' + n + '=' + typeof p[n] })
    parts.push('level.getGameTime=' + typeof level.getGameTime)
    parts.push('level.getTime=' + typeof level.getTime)
    note('probe', 'real ' + p + ': ' + parts.join(' '))
  }

  // ---------------------------------------------------------------- state machine

  function go(phase) {
    T.phase = phase
    T.since = T.t
    T.once = false
  }

  function requestClick(p, expectDim, item) {
    T.attempt++
    T.token = 'k' + T.t + '_' + T.attempt
    T.clickAt = T.t
    T.clickSeenAt = -1
    shared().put('clicked', '')
    shared().put('clickedHow', '')
    shared().put('clickItem', item)
    shared().put('clickDim', expectDim)
    shared().put('clickMode', T.attempt >= ATTEMPTS ? 'direct' : 'key')
    shared().put('clickToken', T.token)
  }

  function clientSees() {
    return 'client dimension ' + (sval('clientDim') || '?') + ', client y ' + (sval('clientY') || '?') + ', client holds ' +
      (sval('clientItem') || '?') + ', client screen ' + (sval('clientScreen') || 'none')
  }

  // the client shows the dimension with no screen open and stands where the server put it (or the wait is over)
  function clientSettled(wantDim, at, age) {
    if (age < SETTLE_TICKS) return false
    if (age >= SETTLE_MAX) return true
    return sval('clientDim') === wantDim && sval('clientScreen') === '' && Math.abs(Number(sval('clientY')) - at.y) < 0.05
  }

  // waits for the requested click and then for the dimension change; returns 'moved', 'wait' or 'failed'
  function awaitTrip(p, key, wantDim, label) {
    if (dimOf(p) === wantDim) {
      note(key.name + '_click_' + label, 'attempt ' + T.attempt + ': ' + sval('clickedHow') + ' (client side), the server moved the player ' +
        (T.clickSeenAt >= 0 ? (T.t - T.clickSeenAt) : '?') + ' ticks after the click was reported')
      shared().put('clickToken', '')
      return 'moved'
    }
    if (T.clickSeenAt < 0) {
      if (sval('clicked') === T.token) {
        T.clickSeenAt = T.t
      } else if (T.t - T.clickAt > CLICK_TIMEOUT) {
        note(key.name + '_click_' + label, 'the client never performed click ' + T.attempt + ' (' + clientSees() + ')')
        return 'failed'
      }
      return 'wait'
    }
    if (T.t - T.clickSeenAt < MOVE_TIMEOUT) return 'wait'
    note(key.name + '_click_' + label, 'attempt ' + T.attempt + ': ' + sval('clickedHow') + ', no dimension change ' + MOVE_TIMEOUT +
      ' ticks later (server: ' + dimOf(p) + ' at ' + posText(pos(p)) + '; ' + clientSees() + ')')
    if (T.attempt < ATTEMPTS) {
      requestClick(p, dimOf(p), key.item)
      return 'wait'
    }
    return 'failed'
  }

  // only after a failed trip: run the handler directly to capture the error it throws (KubeJS also logs it in server.log)
  function diagnose(p, key) {
    if (typeof handleKeyUse !== 'function') {
      note(key.name + '_diagnosis', 'handleKeyUse is not defined (server_scripts/grindless/dimensions.js not loaded?)')
      return
    }
    var before = dimOf(p)
    var outcome
    try {
      handleKeyUse(p, key.dim, Item.of(key.item).getItem())
      outcome = 'returned without an exception'
    } catch (e) {
      outcome = 'threw ' + e
    }
    note(key.name + '_diagnosis', 'handleKeyUse(player, ' + key.dim + ') called directly ' + outcome + '; player ' + before + ' -> ' + dimOf(p))
  }

  function recover(p) {
    p.teleportTo(OVERWORLD, START.x, START.y, START.z, 0, 0)
    go('recover')
  }

  function step(server) {
    var p = testPlayer(server)
    if (p === null) {
      check('player_present', false, 'the test player left during ' + T.phase)
      finish(server)
      return
    }
    var key = KEYS[T.k]
    var age = T.t - T.since

    if (T.phase === 'setup') {
      T.playerName = String(p.getName().getString())
      try {
        probe(p)
      } catch (e) {
        note('probe', 'could not probe the player: ' + e)
      }
      var changed = prepareArea(server)
      p.teleportTo(OVERWORLD, START.x, START.y, START.z, 0, 0)
      note('setup', 'player ' + T.playerName + ' moved to ' + START.x + ' ' + START.y + ' ' + START.z + ' (Overworld test area, ' + changed + ' blocks changed)')
      go('start_wait')
      return
    }

    if (T.phase === 'start_wait' || T.phase === 'recover') {
      if (age < (T.phase === 'start_wait' ? START_TICKS : SETTLE_TICKS)) return
      if (T.phase === 'recover') T.k++
      go(T.k >= KEYS.length ? 'fail_check' : 'key_prepare')
      return
    }

    if (T.phase === 'key_prepare') {
      if (!T.once) {
        T.once = true
        p.setMainHandItem(Item.of(key.item))
      }
      if (age < 10) return
      T.attempt = 0
      T.depart = pos(p)
      T.departDim = dimOf(p)
      requestClick(p, OVERWORLD, key.item)
      go('out')
      return
    }

    if (T.phase === 'out') {
      var out = awaitTrip(p, key, key.dim, 'out')
      if (out === 'wait') return
      if (out === 'failed') {
        check(key.name + '_travel', false, 'right-click with ' + key.item + ' in the Overworld did not take the player to ' + key.dim +
          ' (still ' + dimOf(p) + ' at ' + posText(pos(p)) + ')')
        diagnose(p, key)
        recover(p)
        return
      }
      T.landing = pos(p)
      go('arrived')
      return
    }

    if (T.phase === 'arrived') {
      if (!clientSettled(key.dim, T.landing, age)) return
      var level = p.getLevel()
      var now = pos(p)
      var clientDim = sval('clientDim')
      var clientY = Number(sval('clientY'))
      check(key.name + '_travel', clientDim === key.dim, 'right-click with ' + key.item + ': Overworld -> ' + dimOf(p) + ' on the server, ' +
        clientDim + ' on the client (' + age + ' ticks after arriving)')
      var ex = key.fixed ? key.fixed.x : Math.floor(T.depart.x) + 0.5
      var ez = key.fixed ? key.fixed.z : Math.floor(T.depart.z) + 0.5
      var g = groundReport(level, T.landing)
      var spotOk = Math.abs(T.landing.x - ex) < 0.01 && Math.abs(T.landing.z - ez) < 0.01 && Math.abs(T.landing.y - Math.floor(T.landing.y)) < 0.01
      check(key.name + '_landing', spotOk && g.solid && g.free, 'landed at ' + posText(T.landing) + ' (expected x ' + ex + ' z ' + ez + '); ' + g.text)
      check(key.name + '_on_ground', p.onGround() && Math.abs(now.y - T.landing.y) < 0.05 && Math.abs(clientY - T.landing.y) < 0.05,
        age + ' ticks later: onGround=' + p.onGround() + ', server y ' + f2(T.landing.y) + ' -> ' + f2(now.y) + ', client y ' + sval('clientY'))
      var rp = returnPoint(p)
      check(key.name + '_return_point', rp !== null && rp.dim === T.departDim && Math.abs(rp.x - T.depart.x) < 0.01 &&
        Math.abs(rp.y - T.depart.y) < 0.01 && Math.abs(rp.z - T.depart.z) < 0.01,
        rp === null ? 'no return point saved' : 'saved ' + rp.dim + ' ' + posText(rp) + ' (departed from ' + T.departDim + ' ' + posText(T.depart) + ')')
      go('stay')
      return
    }

    if (T.phase === 'stay') {
      if (age < STAY_TICKS) return
      T.attempt = 0
      requestClick(p, key.dim, key.item)
      go('back')
      return
    }

    if (T.phase === 'back') {
      var back = awaitTrip(p, key, OVERWORLD, 'back')
      if (back === 'wait') return
      if (back === 'failed') {
        check(key.name + '_return', false, 'right-click with ' + key.item + ' in ' + key.dim + ' did not bring the player back (still ' +
          dimOf(p) + ' at ' + posText(pos(p)) + ')')
        diagnose(p, key)
        recover(p)
        return
      }
      T.returned = pos(p)
      go('returned')
      return
    }

    if (T.phase === 'returned') {
      if (!clientSettled(OVERWORLD, T.returned, age)) return
      var level2 = p.getLevel()
      var now2 = pos(p)
      var clientY2 = Number(sval('clientY'))
      var g2 = groundReport(level2, T.returned)
      var d = Math.max(Math.abs(T.returned.x - T.depart.x), Math.abs(T.returned.y - T.depart.y), Math.abs(T.returned.z - T.depart.z))
      check(key.name + '_return', sval('clientDim') === OVERWORLD && d < 0.01 && g2.solid && g2.free && p.onGround() &&
        Math.abs(now2.y - T.returned.y) < 0.05 && Math.abs(clientY2 - T.returned.y) < 0.05, 'second right-click: ' + key.dim + ' -> ' +
        dimOf(p) + ' on the server, ' + sval('clientDim') + ' on the client, at ' + posText(T.returned) + ' (departed from ' +
        posText(T.depart) + '); ' + g2.text + '; ' + age + ' ticks later onGround=' + p.onGround() + ', server y ' + f2(now2.y) +
        ', client y ' + sval('clientY'))
      T.k++
      go(T.k >= KEYS.length ? 'fail_check' : 'key_prepare')
      return
    }

    // a key that cannot travel must say so: the handler towards a dimension that does not exist sends the action-bar
    // message (read on the client by startup_scripts/gg_test_dimension_keys.js) instead of failing silently
    if (T.phase === 'fail_check') {
      if (!T.once) {
        T.once = true
        shared().put('clientActionBar', '')
        T.failFrom = pos(p)
        T.failOutcome = 'returned'
        try {
          handleKeyUse(p, MISSING_DIM, Item.of(KEYS[0].item).getItem())
        } catch (e) {
          T.failOutcome = 'threw ' + e
        }
        return
      }
      var bar = sval('clientActionBar')
      if (bar === '' && age < 100) return
      var stay = Math.max(Math.abs(pos(p).x - T.failFrom.x), Math.abs(pos(p).y - T.failFrom.y), Math.abs(pos(p).z - T.failFrom.z))
      var shown = bar.indexOf('The key fails') === 0 || bar.indexOf('La llave falla') === 0
      check('failure_message', T.failOutcome === 'returned' && shown && dimOf(p) === OVERWORLD && stay < 0.01,
        'handleKeyUse(player, ' + MISSING_DIM + ') ' + T.failOutcome + ', the player stayed in ' + dimOf(p) + ' (moved ' + f2(stay) +
        '), the client action bar shows "' + bar + '"')
      finish(server)
      return
    }
  }

  function finish(server) {
    if (T === null || T.finished) return
    T.finished = true
    check('all_keys', T.failed.length === 0, T.failed.length === 0 ? 'void, flat and end keys out and back by right-click, on solid ground; a key that cannot travel shows its message' :
      'failed: ' + T.failed.join(', '))
    shared().put('clickToken', '')
    shared().put('hold', false)
    global[REQ + 'Done'] = true
    console.info(TAG + 'DONE')
  }

  function onTick(server) {
    if (global[REQ] && T === null && Date.now() - LOADED_AT >= QUIET_MS && Date.now() >= Number(global[REQ + 'At'] || 0)) {
      global[REQ] = false
      T = { t: 0, tick0: server.getTickCount(), phase: 'setup', since: 0, k: 0, attempt: 0, token: '', clickAt: 0, clickSeenAt: -1,
        failed: [], finished: false, playerName: '' }
    }
    if (T === null || T.finished) return
    T.t = server.getTickCount() - T.tick0
    if (T.t > TEST_TIMEOUT) {
      check('timeout', false, 'the test ran ' + T.t + ' ticks; phase ' + T.phase + ', key ' + (KEYS[T.k] ? KEYS[T.k].name : '-'))
      finish(server)
      return
    }
    try {
      step(server)
    } catch (e) {
      check('step', false, 'exception in ' + T.phase + ' (key ' + (KEYS[T.k] ? KEYS[T.k].name : '-') + '): ' + e)
      finish(server)
    }
  }

  ServerEvents.tick(function (event) {
    onTick(event.server)
  })

  // client suite: armed when the player joins, if the instance carries the marker file
  PlayerEvents.loggedIn(function (event) {
    if (global[REQ + 'Done'] || T !== null || !enabledByMarker()) return
    global[REQ + 'At'] = Date.now() + 5000
    global[REQ] = true
    shared().put('hold', true)
    shared().put('clickToken', '')
    note('armed', 'player ' + event.player.getName().getString() + ' joined and ' + MARKER + ' is present: the travel-key test starts in a few seconds')
  })
})()
