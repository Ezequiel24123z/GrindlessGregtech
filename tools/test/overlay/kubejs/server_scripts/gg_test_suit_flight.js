// priority: -7474
// TEST ONLY, suit flight: NANO-1 (#181) and its escalation NANO-1b (#195). Server half; partner of
// client_scripts/gg_test_suit_flight.js. Client suite, integrated server with the real player. Only with
// kubejs/config/gg_test_suit_flight.json {"enabled": true}. No world band: nothing is built, the player flies above its spawn.
// Checks integration/suit_flight.js the way a player plays it: this half lifts the player (a teleport, which needs no permission)
// and then only observes and asserts; the client half takes off and lands like a player (see its header).
//   NanoMuscle chestplate: grants flight; sustained flight drains 875 EU per 5-tick check (175 EU/t) and stays on, on the server
//   and on the client; touching the ground ends flight and nothing is drained on the ground; taking it off or running dry in
//   flight ends flight; a creative player is untouched.
//   Advanced QuarkTech chestplate: the same at 12,500 EU per check (2,500 EU/t); its jetpack ('enabled') is off while flying, on
//   again after landing, and on again when a chestplate taken off mid-flight is worn again.
// Why NANO-1's version never saw sustained flight (runs 20261102-020046-client-b68, -024350-client-6d3, -030629-client-fda): it
// lifted the player with the player's own '/tp' (p.runCommandSilent), which KubeJS runs at the player's permission level, and
// mc-runtime-test creates its world with cheats off, so the player never left the ground. There Minecraft's client clears
// 'flying' (LocalPlayer#aiStep) and the server copies the client's value back. In survival a vindicator near spawn also hit the
// player (the armour paid for the hits) and killed it, so the world is peaceful while this test runs. The NOTEs 'nano1_lift' and
// 'server_set_flight' record that evidence on every run.
// var + function: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
;(function () {
  var NAME = 'suit_flight'
  var CHM = Java.loadClass('java.util.concurrent.ConcurrentHashMap')
  if (!global.ggSuitFlight) global.ggSuitFlight = new CHM()
  var S = global.ggSuitFlight
  var marker = JsonIO.read('kubejs/config/gg_test_suit_flight.json')
  if (!marker || !marker.enabled) return
  var Helper = Java.loadClass('com.gregtechceu.gtceu.api.capability.GTCapabilityHelper')
  var Slot = Java.loadClass('net.minecraft.world.entity.EquipmentSlot')
  var Heightmap = Java.loadClass('net.minecraft.world.level.levelgen.Heightmap$Types')
  var NANO = 875 // EU per 5-tick check: 175 EU/t
  var QUARK = 12500 // 2,500 EU/t
  var LOW = 2000 // two NanoMuscle checks, then too little for a third
  var LIFT = 40 // blocks above the highest block of the start column
  var WATCH = 30 // ticks of sustained flight observed per suit
  var st = { i: 0, wait: 0, done: false, ticks: 0, seq: 0, token: '', watch: null, mem: {} }

  function log(check, status, detail) {
    var line = 'GGTEST|' + NAME + '|' + check + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + String(detail).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/')
    console.info(line)
  }
  function check(name, ok, detail) { log(name, ok ? 'PASS' : 'FAIL', detail) }
  function safe(f) { try { return String(f()) } catch (e) { return 'n/a (' + e + ')' } }
  function f2(n) { return Number(n).toFixed(2) }

  // ---- the player and its chestplate
  function who(p) { return String(p.getGameProfile().getName()) }
  function cmd(p, c) { p.server.runCommandSilent(c) }
  function mode(p, m) { cmd(p, 'gamemode ' + m + ' ' + who(p)) }
  function chest(p) { return p.getItemBySlot(Slot.CHEST) }
  function elec(p) { var s = chest(p); return s === null || s.isEmpty() ? null : Helper.getElectricItem(s) }
  function charge(p) { var e = elec(p); return e === null || e === undefined ? -1 : Number(e.getCharge()) }
  function equip(p, id, want) {
    p.setItemSlot(Slot.CHEST, Item.of(id))
    var e = elec(p)
    var max = Number(e.getMaxCharge())
    var target = want < 0 ? max : want
    if (target < max) e.discharge(max, e.getTier(), true, false, false)
    e.charge(target, e.getTier(), true, false)
    return e
  }
  function bare(p) { p.setItemSlot(Slot.CHEST, Item.of('minecraft:air')) }
  function mayfly(p) { return !!p.getAbilities().mayfly }
  function flying(p) { return !!p.getAbilities().flying }
  function marked(p) { return !!p.getPersistentData().getBoolean('gg_suit_flight') }
  function granted(p) { return mayfly(p) && marked(p) }
  function tagOf(s) {
    if (s === null || s === undefined || s.isEmpty()) return null
    var t = s.getNbt()
    return t === null || t === undefined ? null : t
  }
  function jetOn(s) { var t = tagOf(s); return t !== null && !!t.getBoolean('enabled') }
  function jetMarked(s) { var t = tagOf(s); return t !== null && !!t.getBoolean('gg_jet_off') }

  // ---- where the player flies: straight above the spot where it stood at the start
  function goTo(p, y) { p.teleportTo(st.mem.dim, st.mem.x, y, st.mem.z, p.getYaw(), p.getPitch()) }
  function lift(p) { goTo(p, st.mem.liftY) }
  function ground(p) { goTo(p, st.mem.y) }
  function height(p) { return f2(Number(p.getY()) - st.mem.y) }

  // ---- the client half: requests in 'cmd', answers in 'ack', what the client sees in 'c*'
  function cval(k) { var v = S.get(k); return v === null || v === undefined ? '' : String(v) }
  function cFlying() { return cval('cFlying') === 'true' }
  function client() { return 'client flying ' + cval('cFlying') + ', mayfly ' + cval('cMayfly') + ', on ground ' + cval('cGround') + ', y ' + cval('cY') }
  function ask(what) { st.seq++; st.token = what + '#' + st.seq; S.put('cmd', st.token) }
  function answer() { var a = cval('ack'); return a.indexOf(st.token + '|') === 0 ? a.substring(st.token.length + 1) : '' }
  function answeredOk() { return answer().indexOf('ok|') === 0 }
  function flew(p) { return answer() !== '' && flying(p) }
  function landed(p) { return answer() !== '' && !flying(p) }
  // The client applies the server's abilities packet a few ticks later, more when the server is catching up after a stall.
  function clientGrounded() { return cval('cFlying') === 'false' && cval('cMayfly') === 'false' }

  // ---- sustained flight: sampled every tick while a watch is open
  function watch(p) { st.watch = { last: charge(p), t: 0, at: 0, drops: [], gaps: [], serverOff: 0, clientOff: 0, jetOn: 0 } }
  function sample(p) {
    var w = st.watch
    w.t++
    var c = charge(p)
    if (c !== w.last) {
      w.drops.push(w.last - c)
      if (w.at > 0) w.gaps.push(w.t - w.at)
      w.at = w.t
      w.last = c
    }
    if (!flying(p) || !mayfly(p)) w.serverOff++
    if (!cFlying()) w.clientOff++
    if (w.drops.length > 0 && jetOn(chest(p))) w.jetOn++
  }
  function closeWatch() { var w = st.watch; st.watch = null; return w }
  function drained(w, cost) {
    if (w.drops.length < 3) return false
    for (var i = 0; i < w.drops.length; i++) if (w.drops[i] !== cost) return false
    for (var j = 0; j < w.gaps.length; j++) if (w.gaps[j] !== 5) return false
    return true
  }
  function drainText(w, cost) {
    var sum = 0
    for (var i = 0; i < w.drops.length; i++) sum += w.drops[i]
    return 'drained ' + sum + ' EU in ' + w.t + ' ticks of flight: ' + w.drops.length + ' checks of [' + w.drops.join(', ') + '] EU, [' +
      w.gaps.join(', ') + '] ticks apart (want at least 3 checks of ' + cost + ' EU 5 ticks apart: ' + (cost / 5) + ' EU/t)'
  }
  function airText(w) { return 'not flying on the server in ' + w.serverOff + ', on the client in ' + w.clientOff + ' of ' + w.t + ' ticks' }

  // A step waits d ticks, then runs f(p); an 'until' step polls until(p) every tick for at most max ticks, then runs f(p, ok, ticks).
  var steps = [
    // ---- setup: survival, peaceful, standing; the start spot is where every flight starts and every landing ends
    { d: 1, f: function (p) {
      st.mem.diff = safe(function () { return p.getLevel().getDifficulty().getKey() })
      cmd(p, 'difficulty peaceful')
      mode(p, 'survival')
      bare(p)
    } },
    // The client must be in the world, not behind the world-join screen: closing a screen resets the keys the landings hold.
    { until: function (p) { return p.onGround() && !p.isCreative() && cval('cScreen') === 'none' }, max: 600, f: function (p, ok, n) {
      var standing = !!p.onGround()
      st.mem.dim = String(p.getLevel().getDimension())
      st.mem.x = Number(p.getX())
      st.mem.y = Number(p.getY())
      st.mem.z = Number(p.getZ())
      var top = Number(p.getLevel().getHeight(Heightmap.MOTION_BLOCKING, Math.floor(st.mem.x), Math.floor(st.mem.z)))
      st.mem.liftY = Math.max(st.mem.y, top) + LIFT
      cmd(p, 'effect give ' + who(p) + ' minecraft:slow_falling 600 0 true')
      log('start', 'NOTE', (standing ? 'standing' : 'not on the ground') + ' at ' + f2(st.mem.x) + ' ' + f2(st.mem.y) + ' ' + f2(st.mem.z) +
        ' in ' + st.mem.dim + ' after ' + n + ' ticks, client screen ' + (cval('cScreen') || 'unknown') + '; the column is clear from y ' + top +
        ', flights hang at y ' + f2(st.mem.liftY) + ' (' + f2(st.mem.liftY - top) + ' blocks of air below); difficulty ' + st.mem.diff +
        ', peaceful while the test runs')
      check('survival_start', standing && !p.isCreative() && !mayfly(p), 'mayfly ' + mayfly(p) + ', on the ground ' + standing)
      // Evidence: NANO-1's lift, the player's own /tp
      var y0 = Number(p.getY())
      var r = safe(function () { return p.runCommandSilent('tp @s ~ ~' + LIFT + ' ~') })
      var y1 = Number(p.getY())
      log('nano1_lift', 'NOTE', "NANO-1's lift ('tp @s ~ ~" + LIFT + " ~' run by the player, p.runCommandSilent) returned " + r + ', y ' + f2(y0) + ' -> ' + f2(y1) +
        '; player op ' + safe(function () { return p.isOp() }) + ', permission level 2 ' + safe(function () { return p.hasPermissions(2) }) +
        ', world allows cheats ' + safe(function () { return p.server.getWorldData().getAllowCommands() }))
      if (Math.abs(y1 - y0) > 0.01) ground(p)
    } },

    // ---- NanoMuscle chestplate: grant, ground, sustained flight, landing
    { d: 5, f: function (p) {
      var e = equip(p, 'gtceu:nanomuscle_chestplate', -1)
      log('capacity', 'NOTE', 'nanomuscle max ' + Number(e.getMaxCharge()) + ' EU')
    } },
    { until: granted, max: 20, f: function (p, ok, n) {
      check('nano_grants', ok, 'mayfly ' + mayfly(p) + ' marker ' + marked(p) + ' after ' + n + ' ticks')
      st.mem.c0 = charge(p)
    } },
    { d: 20, f: function (p) {
      check('ground_no_drain', charge(p) === st.mem.c0 && !flying(p), 'charge ' + charge(p) + ' vs ' + st.mem.c0 + ' over 20 ticks on the ground, flying ' + flying(p))
      lift(p)
    } },
    { d: 3, f: function () { ask('fly') } },
    { until: flew, max: 100, f: function (p, ok, n) {
      check('nano_takeoff', ok, 'client: ' + answer() + '; server flying ' + flying(p) + ' after ' + n + ' ticks, ' + height(p) + ' blocks up')
      watch(p)
    } },
    { d: WATCH, f: function (p) {
      var w = closeWatch()
      check('nano_drain', drained(w, NANO), drainText(w, NANO))
      check('nano_still_flying', w.serverOff === 0 && w.clientOff === 0, airText(w) + '; ' + height(p) + ' blocks up, ' + client())
      ground(p)
    } },
    { d: 3, f: function () { ask('land') } },
    { until: landed, max: 120, f: function (p, ok, n) {
      check('nano_landing', ok && answeredOk() && mayfly(p) && marked(p), 'client: ' + answer() + '; server flying ' + flying(p) + ', mayfly ' + mayfly(p) + ' after ' + n + ' ticks')
      st.mem.c2 = charge(p)
    } },
    { d: 25, f: function (p) {
      check('landed_no_drain', charge(p) === st.mem.c2 && !flying(p), 'charge ' + charge(p) + ' vs ' + st.mem.c2 + ' over 25 ticks after landing, flying ' + flying(p))
    } },

    // ---- taking the chestplate off in flight
    { d: 5, f: function (p) { lift(p) } },
    { d: 3, f: function () { ask('fly') } },
    { until: flew, max: 100, f: function (p, ok) {
      st.mem.flew = ok
      st.mem.flewText = 'took off: ' + answer()
      bare(p)
    } },
    { until: function (p) { return !mayfly(p) }, max: 15, f: function () { } },
    { until: clientGrounded, max: 100, f: function (p, ok, n) {
      check('remove_ends', st.mem.flew && !mayfly(p) && !flying(p) && !marked(p) && ok,
        st.mem.flewText + '; taken off: server mayfly ' + mayfly(p) + ' flying ' + flying(p) + ' marker ' + marked(p) + '; ' + n + ' ticks later ' + client())
      ground(p)
    } },

    // ---- running dry in flight
    { d: 5, f: function (p) { equip(p, 'gtceu:nanomuscle_chestplate', LOW) } },
    { until: granted, max: 20, f: function (p, ok) {
      check('low_grants', ok, 'mayfly with ' + LOW + ' EU ' + mayfly(p) + ' (one check costs ' + NANO + ')')
      lift(p)
    } },
    { d: 3, f: function () { ask('fly') } },
    { until: flew, max: 100, f: function (p, ok) {
      st.mem.flew = ok
      st.mem.flewText = 'took off: ' + answer()
    } },
    { until: function (p) { return !mayfly(p) }, max: 40, f: function (p, ok, n) { st.mem.dryTicks = n } },
    { until: clientGrounded, max: 100, f: function (p, ok, n) {
      var want = LOW - 2 * NANO
      check('dry_ends', st.mem.flew && !mayfly(p) && !flying(p) && !marked(p) && ok && charge(p) === want,
        st.mem.flewText + '; flight ended ' + st.mem.dryTicks + ' ticks later with ' + charge(p) + ' EU left (want ' + want +
        '); server mayfly ' + mayfly(p) + ' flying ' + flying(p) + ' marker ' + marked(p) + '; ' + n + ' ticks later ' + client())
      ground(p)
      bare(p)
    } },

    // ---- creative players are untouched
    { d: 5, f: function (p) { mode(p, 'creative') } },
    { d: 10, f: function (p) {
      equip(p, 'gtceu:nanomuscle_chestplate', -1)
      st.mem.c3 = charge(p)
    } },
    { d: 20, f: function (p) {
      check('creative_untouched_wear', p.isCreative() && !marked(p) && charge(p) === st.mem.c3, 'marker ' + marked(p) + ' charge ' + charge(p) + ' vs ' + st.mem.c3)
      bare(p)
    } },
    { d: 15, f: function (p) {
      check('creative_untouched_remove', p.isCreative() && mayfly(p), 'creative mayfly ' + mayfly(p))
      mode(p, 'survival')
    } },

    // ---- advanced QuarkTech chestplate: grant, sustained flight with the jetpack off, landing puts it back on
    { d: 10, f: function (p) {
      var e = equip(p, 'gtceu:advanced_quarktech_chestplate', -1)
      log('capacity', 'NOTE', 'advanced quarktech max ' + Number(e.getMaxCharge()) + ' EU')
      var s = chest(p)
      if (tagOf(s) === null) s.setNbt({})
      tagOf(s).putBoolean('enabled', true)
    } },
    { until: granted, max: 20, f: function (p, ok) {
      check('quark_grants', ok && jetOn(chest(p)), 'mayfly ' + mayfly(p) + ' marker ' + marked(p) + ', jetpack enabled before flight ' + jetOn(chest(p)))
      lift(p)
    } },
    { d: 3, f: function () { ask('fly') } },
    { until: flew, max: 100, f: function (p, ok, n) {
      check('quark_takeoff', ok, 'client: ' + answer() + '; server flying ' + flying(p) + ' after ' + n + ' ticks, ' + height(p) + ' blocks up')
      watch(p)
    } },
    { d: WATCH, f: function (p) {
      var w = closeWatch()
      check('quark_drain', drained(w, QUARK) && w.serverOff === 0 && w.clientOff === 0, drainText(w, QUARK) + '; ' + airText(w))
      check('jetpack_suppressed', w.drops.length > 0 && w.jetOn === 0 && !jetOn(chest(p)) && jetMarked(chest(p)),
        'jetpack enabled in ' + w.jetOn + ' ticks of flight after the first check; now enabled ' + jetOn(chest(p)) + ', chestplate marked ' + jetMarked(chest(p)))
      ground(p)
    } },
    { d: 3, f: function () { ask('land') } },
    { until: landed, max: 120, f: function (p, ok, n) {
      st.mem.landed = ok && answeredOk()
      st.mem.landText = 'client: ' + answer() + '; server flying ' + flying(p) + ' after ' + n + ' ticks'
    } },
    { until: function (p) { return jetOn(chest(p)) }, max: 12, f: function (p, ok, n) {
      check('jetpack_restored', st.mem.landed && ok && !jetMarked(chest(p)) && !flying(p),
        st.mem.landText + '; jetpack enabled ' + jetOn(chest(p)) + ' ' + n + ' ticks after landing, chestplate marked ' + jetMarked(chest(p)))
    } },

    // ---- the advanced chestplate taken off mid-flight: flight ends, and the jetpack comes back when it is worn again
    { d: 5, f: function (p) { lift(p) } },
    { d: 3, f: function () { ask('fly') } },
    { until: function (p) { return flew(p) && !jetOn(chest(p)) }, max: 100, f: function (p, ok) {
      st.mem.flew = ok
      st.mem.held = chest(p)
      bare(p)
    } },
    { until: function (p) { return !mayfly(p) }, max: 15, f: function () {
      st.mem.heldOff = !jetOn(st.mem.held) && jetMarked(st.mem.held)
      st.mem.heldText = 'taken off in flight with the jetpack enabled ' + jetOn(st.mem.held) + ', marked ' + jetMarked(st.mem.held)
    } },
    { until: clientGrounded, max: 100, f: function (p, ok, n) {
      check('quark_remove_ends', st.mem.flew && !mayfly(p) && !flying(p) && !marked(p) && ok,
        'server mayfly ' + mayfly(p) + ' flying ' + flying(p) + ' marker ' + marked(p) + '; ' + n + ' ticks later ' + client())
      ground(p)
    } },
    { d: 10, f: function (p) { p.setItemSlot(Slot.CHEST, st.mem.held) } },
    { until: function (p) { return jetOn(chest(p)) }, max: 12, f: function (p, ok, n) {
      check('jetpack_back_after_removal', st.mem.heldOff && ok && !jetMarked(chest(p)),
        st.mem.heldText + '; worn again on the ground: enabled ' + jetOn(chest(p)) + ' after ' + n + ' ticks, marked ' + jetMarked(chest(p)))
      bare(p)
    } },

    // ---- evidence: 'flying' set by the server, as NANO-1 did, but with the player really in the air
    { d: 5, f: function (p) { equip(p, 'gtceu:nanomuscle_chestplate', -1) } },
    { until: granted, max: 20, f: function (p) { lift(p) } },
    { d: 5, f: function (p) {
      var a = p.getAbilities()
      a.flying = true
      p.onUpdateAbilities()
      watch(p)
    } },
    { d: 20, f: function (p) {
      var w = closeWatch()
      log('server_set_flight', 'NOTE', "NANO-1's way (the server sets 'flying' and syncs it) " + height(p) + ' blocks up: ' + airText(w) + ', ' + w.drops.length + ' checks drained')
      ground(p)
    } },
    { d: 3, f: function () { ask('land') } },
    { until: landed, max: 120, f: function (p) { bare(p) } },

    // ---- cleanup
    { d: 5, f: function (p) {
      bare(p)
      ground(p)
      cmd(p, 'effect clear ' + who(p) + ' minecraft:slow_falling')
      if (st.mem.diff.indexOf('n/a') !== 0) cmd(p, 'difficulty ' + st.mem.diff)
    } }
  ]

  function finish() {
    st.done = true
    S.put('cmd', '')
    S.put('hold', 'false')
    log('DONE', 'NOTE')
  }

  PlayerEvents.tick(function (event) {
    var p = event.player
    if (st.done || p === null || p === undefined) return
    var at = st.i
    try {
      S.put('hold', 'true')
      st.ticks++
      if (st.ticks < 60) return
      if (st.watch !== null) sample(p)
      if (st.i >= steps.length) {
        finish()
        return
      }
      var s = steps[st.i]
      st.wait++
      if (s.until) {
        var ok = !!s.until(p)
        if (ok || st.wait >= s.max) {
          var n = st.wait
          st.i++
          st.wait = 0
          s.f(p, ok, n)
        }
      } else if (st.wait >= s.d) {
        st.i++
        st.wait = 0
        s.f(p)
      }
    } catch (e) {
      log('script', 'FAIL', 'exception at step ' + at + ': ' + e)
      try {
        bare(p)
        if (st.mem.dim) ground(p)
        if (st.mem.diff && st.mem.diff.indexOf('n/a') !== 0) cmd(p, 'difficulty ' + st.mem.diff)
      } catch (e2) { }
      finish()
    }
  })
})()
