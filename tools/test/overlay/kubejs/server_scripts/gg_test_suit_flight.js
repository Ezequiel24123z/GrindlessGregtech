// priority: -7474
// TEST ONLY, NANO-1 suit flight (#181). Server half; partner of client_scripts/gg_test_suit_flight.js (keeps the client in the world).
// Client suite, integrated server with the real player. Only with kubejs/config/gg_test_suit_flight.json {"enabled": true}.
// Checks integration/suit_flight.js: a charged NanoMuscle chestplate grants flight, flying drains the stated EU (175 EU/t in
// 5-tick checks), no drain while not flying, taking it off or running dry ends flight, a creative player is untouched, and the
// advanced QuarkTech chestplate grants flight the same way (2,500 EU/t) with its jetpack flag switched off while flying.
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
  var st = { i: 0, wait: 0, done: false, ticks: 0, mem: {} }

  function log(check, status, detail) {
    console.info('GGTEST|' + NAME + '|' + check + '|' + status + (detail ? '|' + String(detail).replace(/\|/g, '/') : ''))
  }
  function check(name, ok, detail) { log(name, ok ? 'PASS' : 'FAIL', detail) }
  function cmd(p, c) { p.server.runCommandSilent(c) }
  function mode(p, m) { cmd(p, 'gamemode ' + m + ' ' + p.getGameProfile().getName()) }
  function chest(p) { return p.getItemBySlot(Slot.CHEST) }
  function elec(p) { return Helper.getElectricItem(chest(p)) }
  function equip(p, id, charge) {
    p.setItemSlot(Slot.CHEST, Item.of(id))
    var e = elec(p)
    var max = Number(e.getMaxCharge())
    var want = charge < 0 ? max : charge
    if (want < max) e.discharge(max, e.getTier(), true, false, false)
    e.charge(want, e.getTier(), true, false)
    return e
  }
  function bare(p) { p.setItemSlot(Slot.CHEST, Item.of('minecraft:air')) }
  // Flying is reset on the ground: lift the player a step earlier (slow falling), and bring them down before flight ends.
  function lift(p) { p.runCommandSilent('tp @s ~ ~40 ~'); p.runCommandSilent('effect give @s minecraft:slow_falling 120 0 true') }
  function fly(p, on) {
    if (!on) p.runCommandSilent('tp @s ~ ~-40 ~')
    var ab = p.getAbilities(); ab.flying = on; p.onUpdateAbilities()
  }
  function mayfly(p) { return !!p.getAbilities().mayfly }
  function flying(p) { return !!p.getAbilities().flying }
  function marked(p) { return !!p.getPersistentData().getBoolean('gg_suit_flight') }
  function jetOn(p) { var t = chest(p).getNbt(); return t !== null && t !== undefined && !!t.getBoolean('enabled') }

  // Each step: wait d ticks since the previous one, then run f(player).
  var steps = [
    { d: 5, f: function (p) { mode(p, 'survival') } },
    { d: 20, f: function (p) {
      check('survival_start', !p.isCreative() && !mayfly(p), 'mayfly ' + mayfly(p))
      var e = equip(p, 'gtceu:nanomuscle_chestplate', -1)
      st.mem.max = Number(e.getMaxCharge())
      log('capacity', 'NOTE', 'nanomuscle max ' + st.mem.max + ' EU')
    } },
    { d: 15, f: function (p) {
      check('nano_grants', mayfly(p) && marked(p), 'mayfly ' + mayfly(p) + ' marker ' + marked(p))
      st.mem.c0 = Number(elec(p).getCharge())
      lift(p)
    } },
    { d: 20, f: function (p) {
      check('ground_no_drain', Number(elec(p).getCharge()) === st.mem.c0, 'charge ' + elec(p).getCharge() + ' vs ' + st.mem.c0)
      fly(p, true)
      st.mem.c1 = Number(elec(p).getCharge())
    } },
    { d: 40, f: function (p) {
      var used = st.mem.c1 - Number(elec(p).getCharge())
      var n = used / 875
      check('nano_drain', used > 0 && used % 875 === 0 && n >= 6 && n <= 9, 'drained ' + used + ' EU in 40 ticks, ' + n + ' checks of 875 (175 EU/t)')
      check('nano_still_flying', flying(p) && mayfly(p), 'flying ' + flying(p))
      fly(p, false)
      st.mem.c2 = Number(elec(p).getCharge())
    } },
    { d: 25, f: function (p) {
      check('landed_no_drain', Number(elec(p).getCharge()) === st.mem.c2, 'charge ' + elec(p).getCharge() + ' vs ' + st.mem.c2)
      var ab0 = p.getAbilities(); ab0.flying = true; p.onUpdateAbilities()
      bare(p)
    } },
    { d: 10, f: function (p) {
      check('remove_ends', !mayfly(p) && !flying(p) && !marked(p), 'mayfly ' + mayfly(p) + ' flying ' + flying(p) + ' marker ' + marked(p))
      equip(p, 'gtceu:nanomuscle_chestplate', 2000)
      lift(p)
    } },
    { d: 10, f: function (p) {
      check('low_grants', mayfly(p), 'mayfly with 2000 EU ' + mayfly(p))
      fly(p, true)
    } },
    { d: 60, f: function (p) {
      check('dry_ends', !mayfly(p) && !flying(p) && !marked(p), 'mayfly ' + mayfly(p) + ' charge ' + elec(p).getCharge())
      p.runCommandSilent('tp @s ~ ~-40 ~')
      bare(p)
      mode(p, 'creative')
    } },
    { d: 10, f: function (p) {
      equip(p, 'gtceu:nanomuscle_chestplate', -1)
      st.mem.c3 = Number(elec(p).getCharge())
    } },
    { d: 20, f: function (p) {
      check('creative_untouched_wear', p.isCreative() && !marked(p) && Number(elec(p).getCharge()) === st.mem.c3, 'marker ' + marked(p) + ' charge ' + elec(p).getCharge())
      bare(p)
    } },
    { d: 15, f: function (p) {
      check('creative_untouched_remove', p.isCreative() && mayfly(p), 'creative mayfly ' + mayfly(p))
      mode(p, 'survival')
    } },
    { d: 10, f: function (p) {
      var e = equip(p, 'gtceu:advanced_quarktech_chestplate', -1)
      st.mem.max = Number(e.getMaxCharge())
      log('capacity', 'NOTE', 'advanced quarktech max ' + st.mem.max + ' EU')
      var t = chest(p).getNbt()
      if (t === null || t === undefined) { chest(p).setNbt({}) ; t = chest(p).getNbt() }
      t.putBoolean('enabled', true)
      lift(p)
    } },
    { d: 15, f: function (p) {
      check('quark_grants', mayfly(p) && marked(p), 'mayfly ' + mayfly(p) + ' marker ' + marked(p))
      fly(p, true)
      st.mem.q1 = Number(elec(p).getCharge())
    } },
    { d: 40, f: function (p) {
      var used = st.mem.q1 - Number(elec(p).getCharge())
      var n = used / 12500
      check('quark_drain', used > 0 && used % 12500 === 0 && n >= 6 && n <= 9, 'drained ' + used + ' EU in 40 ticks, ' + n + ' checks of 12500 (2500 EU/t)')
      check('jetpack_suppressed', !jetOn(p), 'jetpack enabled flag while flying: ' + jetOn(p))
      fly(p, false)
    } },
    { d: 15, f: function (p) {
      check('jetpack_restored', jetOn(p), 'jetpack enabled flag after landing: ' + jetOn(p))
      bare(p)
    } },
    { d: 10, f: function (p) {
      check('quark_remove_ends', !mayfly(p) && !marked(p), 'mayfly ' + mayfly(p))
    } }
  ]

  PlayerEvents.tick(function (event) {
    var p = event.player
    if (st.done || p === null || p === undefined) return
    try {
      S.put('hold', 'true')
      st.ticks++
      if (st.ticks < 60) return
      if (st.i >= steps.length) {
        st.done = true
        S.put('hold', 'false')
        log('DONE', 'NOTE')
        return
      }
      st.wait++
      if (st.wait >= steps[st.i].d) {
        st.wait = 0
        var s = steps[st.i++]
        s.f(p)
      }
    } catch (e) {
      st.done = true
      S.put('hold', 'false')
      log('script', 'FAIL', 'exception at step ' + st.i + ': ' + e)
      log('DONE', 'NOTE')
    }
  })
})()
