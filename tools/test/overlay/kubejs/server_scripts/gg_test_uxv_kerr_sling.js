// priority: -9862
// UXV-B1 T1: the c8 and c9 jump rows and the two arrival platforms. Band: grindless:cygnus_x1_orbit X 36736-36799, Z 0-63, Y 98-115 (the near ring at X 36752,
// Y 100, Z 20). The far sides are the platforms the jumps themselves place, in grindless:vela_pulsar_orbit (c8) and grindless:cas_a_remnant (c9), at 64,100,64.
// Doubt: two tier 12 places in the shipped datapack beside UIV's three, each jump placing its own platform row. Command (one leg per bench run):
//   gg_test_uxv_kerr_sling   statics, the c8 jump and its platform, then the c9 jump and its platform on the same ring (stand-in items)
//   gg_test_uxv_kerr_sling_sky   client suite: the test player in grindless:vela_pulsar_orbit, the client's dimension, sky resource and one screenshot;
//                                the client sends no commands, so a scratch overlay arms it with kubejs/config/gg_test_uxv_kerr_sling_sky.json {"enabled": true}
(function () {
  var NAME = 'uxv_kerr_sling'
  var NEAR = 'grindless:cygnus_x1_orbit'
  var FARS = { vela_pulsar: 'grindless:vela_pulsar_orbit', cas_a: 'grindless:cas_a_remnant' }
  var O = { x: 36752, y: 100, z: 20 }
  var FARO = { x: 64, y: 100, z: 64 }
  var X0 = 36736
  var X1 = 36799
  var LOADED_AT = Date.now()
  var S = null
  var J = null

  function lazy() {
    if (J === null) J = {
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      Machine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour')
    }
    return J
  }
  function emit(name, status, detail) {
    console.info('GGTEST|' + NAME + '|' + name + '|' + status + (detail ? '|' + String(detail).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 1500) : ''))
  }
  function check(name, ok, detail) {
    if (!ok) S.failed++
    emit(name, ok ? 'PASS' : 'FAIL', detail)
    return ok
  }
  function cmd(dim, text) { return Number(S.server.runCommandSilent('execute in ' + dim + ' run ' + text)) }
  function at(dim, p) { return lazy().Machine.getMachine(S.server.getLevel(dim), new (lazy().Pos)(p.x, p.y, p.z)) }
  function blockId(dim, p) { return String(S.server.getLevel(dim).getBlock(p.x, p.y, p.z).id) }
  function contents(inv) {
    var out = []
    for (var i = 0; i < inv.getSlots(); i++) {
      var st = inv.getStackInSlot(i)
      if (!st.isEmpty()) out.push(String(st.getId()) + 'x' + st.getCount())
    }
    return out.join(' ') || 'empty'
  }
  function ticket(p) {
    var x = Math.floor(p.x / 16) * 16
    var z = Math.floor(p.z / 16) * 16
    var k = x + ',' + z
    if (S.chunks[k]) return
    S.chunks[k] = true
    S.server.getLevel(NEAR).getChunk(x >> 4, z >> 4)
    if (cmd(NEAR, 'forceload query ' + x + ' ' + z) > 0) return
    S.tickets.push({ x: x, z: z })
    cmd(NEAR, 'forceload add ' + x + ' ' + z)
  }
  function put(p, id, facing) {
    if (p.x < X0 || p.x > X1 || p.z < 0 || p.z > 63) throw new Error('outside the band ' + p.x + ',' + p.z)
    ticket(p)
    S.order.push(p)
    cmd(NEAR, 'setblock ' + p.x + ' ' + p.y + ' ' + p.z + ' ' + id + (facing ? '[facing=north]' : '') + ' replace')
  }
  function allows(sym, ability) {
    return !!sym && sym.kind === 'oneOf' && sym.options.some(function (o) { return o.kind === 'part' && o.ability === ability })
  }
  function plain(sym) {
    if (sym.kind === 'blocks') return String(sym.blocks[0])
    if (sym.kind === 'frames') return 'gtceu:' + sym.materials[0] + '_frame'
    for (var i = 0; i < sym.options.length; i++) if (sym.options[i].kind === 'blocks') return String(sym.options[i].blocks[0])
    throw new Error('unsupported symbol ' + sym.kind)
  }
  function build() {
    var desc = S.G.structures['gtceu:warp_gate']
    var ctl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var s = desc.symbols[row.charAt(ci)]
          if (s && s.kind === 'controller') ctl = { si: si, ri: ri, ci: ci }
        }
      })
    })
    var parts = [{ ability: 'input_bus', id: 'gtceu:uhv_input_bus', key: 'bus' }, { ability: 'output_bus', id: 'gtceu:uhv_output_bus', key: 'out' },
      { ability: 'energy_input', id: 'gtceu:uiv_energy_input_hatch_16a', key: 'e0' }]
    var next = 0
    var pos = {}
    var plan = []
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var sym = desc.symbols[row.charAt(ci)]
          if (!sym || sym.kind === 'controller' || sym.kind === 'air' || sym.kind === 'any') continue
          var p = { x: O.x - (ci - ctl.ci), y: O.y + ri - ctl.ri, z: O.z - (si - ctl.si) }
          var id = null
          var facing = false
          if (si === ctl.si && next < parts.length && allows(sym, parts[next].ability)) {
            id = parts[next].id
            pos[parts[next].key] = p
            facing = true
            next++
          }
          plan.push({ p: p, id: id || plain(sym), facing: facing })
        }
      })
    })
    plan.forEach(function (c) { put(c.p, c.id, c.facing) })
    put(O, 'gtceu:warp_gate', true)
    return pos
  }
  function fill(m) { m.energyContainer.setEnergyStored(m.energyContainer.getEnergyCapacity()) }
  function release() {
    S.order.slice().reverse().forEach(function (p) { try { cmd(NEAR, 'setblock ' + p.x + ' ' + p.y + ' ' + p.z + ' minecraft:air replace') } catch (e) { } })
    S.tickets.forEach(function (t) { try { cmd(NEAR, 'forceload remove ' + t.x + ' ' + t.z) } catch (e) { } })
    Object.keys(FARS).forEach(function (k) {
      try { cmd(FARS[k], 'forceload remove ' + (FARO.x - 8) + ' ' + FARO.z + ' ' + (FARO.x + 14) + ' ' + (FARO.z + 15)) } catch (e) { }
    })
  }
  function finish() {
    if (S.finished) return
    S.finished = true
    release()
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  function phase(name) { S.phase = name; S.phaseAt = S.tick; emit('stage', 'NOTE', name) }
  function ctrl() { return at(NEAR, O) }
  function stockJump(circuit, items) {
    var bus = at(NEAR, S.pos.bus)
    bus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(circuit))
    var inv = bus.getInventory()
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, Item.empty)
    items.forEach(function (k, i) { inv.setStackInSlot(i, Item.of(k[0], k[1])) })
    return inv
  }

  function statics() {
    var WG = S.G.warpGate
    var want = { hold_vela_pulsar: 8, hold_cas_a: 9 }
    Object.keys(want).forEach(function (n) {
      var r = WG.recipes.filter(function (x) { return x.name === n })[0]
      check('static_' + n, !!r && r.circuit === want[n] && r.site === 'cygnus_x1_orbit' && r.eut === 536870912 && r.duration === 1200 && r.itemsOut.length === 0,
        JSON.stringify(r || null))
    })
    check('static_clean', (WG.skipped || []).length === 0 && (WG.clashes || []).length === 0, 'skipped ' + JSON.stringify(WG.skipped || []) + ' clashes ' + JSON.stringify(WG.clashes || []))
    var T = S.G.uxvTravel
    check('static_travel_script', !!T && T.tier === 12 && !!T.places.vela_pulsar && !!T.places.cas_a, 'startup uxv/travel.js published global.grindless.uxvTravel')
    check('static_levels', [NEAR, FARS.vela_pulsar, FARS.cas_a].every(function (d) { return !!S.server.getLevel(d) }), 'cygnus, vela, cas a')
    var RL = Java.loadClass('net.minecraft.resources.ResourceLocation')
    var rm = S.server.getRecipeManager()
    ;[['bumper_weave', 'tether_ribbon/bumper_weave'], ['whipple_shield', 'assembly_line/whipple_shield']].forEach(function (a) {
      check('static_recipe_' + a[0], rm.byKey(new RL('grindless:' + a[1])).isPresent(), 'grindless:' + a[1])
    })
  }

  function jumpStep() {
    var c = ctrl()
    var e = at(NEAR, S.pos.e0)
    if (e) fill(e)
    var key = S.jumps[S.ji]
    if (S.phase === 'form') {
      if (c && c.isFormed()) {
        check('ring_formed', true, 'gate formed in ' + NEAR)
        phase('stock')
      } else if (S.tick - S.phaseAt > 400) { check('ring_formed', false, 'not formed after 400 ticks'); finish() }
      return
    }
    if (S.phase === 'stock') {
      if (key === 'vela_pulsar') S.inv = stockJump(8, [['grindless:launched_relay_seed', 1], ['grindless:frc_cartridge', 1]])
      else S.inv = stockJump(9, [['grindless:launched_relay_seed', 1], ['grindless:cnt_whipple_shield', 1]])
      c.getRecipeLogic().updateTickSubscription()
      phase('jump')
      return
    }
    if (S.phase === 'jump') {
      if (c.getRecipeLogic().isWorking()) {
        check('jump_runs_' + key, true, 'hold_' + key + ' runs at 536,870,912 EU/t (gate overclock identity)')
        phase('jump_wait')
      } else if (S.tick - S.phaseAt > 200) { check('jump_runs_' + key, false, 'jump did not start: ' + c.getRecipeLogic().getStatus() + ' bus ' + contents(S.inv)); finish() }
      return
    }
    if (S.phase === 'jump_wait') {
      if (S.server.persistentData.contains('uxvPlatform_' + key)) { phase('platform'); return }
      if (S.tick - S.phaseAt > 1700) { check('platform_placed_' + key, false, 'no platform row after the jump; bus ' + contents(S.inv)); finish() }
      return
    }
    if (S.phase === 'platform') {
      if (S.tick - S.phaseAt < 40) return
      var far = FARS[key]
      check('platform_row_' + key, String(S.server.persistentData.getString('uxvPlatform_' + key)) === far + '@' + FARO.x + ',' + FARO.y + ',' + FARO.z, S.server.persistentData.getString('uxvPlatform_' + key))
      check('platform_inputs_spent_' + key, contents(S.inv).indexOf('launched_relay_seed') < 0, 'bus after the jump: ' + contents(S.inv))
      var m = at(far, FARO)
      check('platform_ring_formed_' + key, !!m && m.isFormed(), 'far ring in ' + far + ': ' + (m ? 'formed ' + m.isFormed() : 'no controller block entity'))
      if (m) {
        var fbus = null
        m.getParts().forEach(function (p) { if (/input_bus/.test(String(p.getDefinition().getId()))) fbus = p })
        check('platform_stock_' + key, !!fbus && contents(fbus.getInventory()).indexOf('exotic_matter_cell') >= 0, 'far input bus: ' + (fbus ? contents(fbus.getInventory()) : 'none'))
      }
      var dyn = at(far, { x: FARO.x + 9, y: FARO.y, z: FARO.z })
      check('platform_dynamo_' + key, !!dyn && /wireless_dynamo/.test(String(dyn.getDefinition().getId())), dyn ? String(dyn.getDefinition().getId()) : 'no dynamo hatch')
      check('platform_ae2_' + key, blockId(far, { x: FARO.x + 12, y: FARO.y, z: FARO.z }) === 'ae2:controller' && blockId(far, { x: FARO.x + 12, y: FARO.y + 1, z: FARO.z }) === 'ae2:drive',
        blockId(far, { x: FARO.x + 12, y: FARO.y, z: FARO.z }) + ' + ' + blockId(far, { x: FARO.x + 12, y: FARO.y + 1, z: FARO.z }))
      check('platform_forceload_' + key, Number(S.server.getLevel(far).getForcedChunks().size()) > 0, 'forced chunks in ' + far + ': ' + S.server.getLevel(far).getForcedChunks().size())
      S.ji++
      if (S.ji >= S.jumps.length) { finish(); return }
      phase('stock')
    }
  }

  function start(server) {
    S = { server: server, G: global.grindless, failed: 0, tick: 0, phaseAt: 0, phase: 'setup', order: [], chunks: {}, tickets: [], finished: false,
      jumps: ['vela_pulsar', 'cas_a'], ji: 0 }
    statics()
    S.pos = build()
    phase('form')
  }
  // ---------------------------------------------------------------- the client leg: one sky
  // gg_test_uxv_kerr_sling_sky (client suite, with client_scripts/gg_test_uxv_kerr_sling.js): the test player is moved to a stone block in
  // grindless:vela_pulsar_orbit, the client reports the dimension it sees and that the sky renderer's resource exists, and takes one screenshot.
  var SKY = 'grindless:vela_pulsar_orbit'
  var SK = null
  function shared() {
    if (!global.ggUxvKerrSling) global.ggUxvKerrSling = new (Java.loadClass('java.util.concurrent.ConcurrentHashMap'))()
    return global.ggUxvKerrSling
  }
  function sval(key) {
    var v = shared().get(key)
    return v === null || v === undefined ? '' : String(v)
  }
  function scmd(text) { return Number(SK.server.runCommandSilent('execute in ' + SKY + ' run ' + text)) }
  function skyDone(ok, detail) {
    emit('sky_' + (ok ? 'seen' : 'missing'), ok ? 'PASS' : 'FAIL', detail)
    shared().put('hold', false)
    scmd('setblock 64 100 64 minecraft:air replace')
    scmd('forceload remove 64 64')
    console.info('GGTEST|' + NAME + '|DONE|failures=' + (ok ? 0 : 1))
    SK.finished = true
  }
  function skyStep() {
    SK.tick++
    if (SK.tick === 1) {
      shared().put('hold', true)
      shared().put('sky', SKY)
      shared().put('shot', '')
      shared().put('shotTaken', '')
      SK.server.getLevel(SKY).getChunk(4, 4)
      scmd('forceload add 64 64')
      scmd('setblock 64 100 64 minecraft:stone replace')
      scmd('tp @a 64.5 101 64.5')
      emit('sky_stage', 'NOTE', 'player moved to ' + SKY)
      return
    }
    if (SK.tick > 1800) { skyDone(false, 'timed out; client dimension "' + sval('clientDim') + '", sky seen "' + sval('skySeen') + '", shot "' + sval('shotTaken') + '"'); return }
    if (SK.phase === 'wait_dim') {
      if (sval('clientDim') === SKY && sval('skySeen') === 'true') { SK.phase = 'shot'; SK.at = SK.tick }
      else if (SK.tick % 100 === 0) scmd('tp @a 64.5 101 64.5')
      return
    }
    if (SK.phase === 'shot') {
      if (SK.tick - SK.at === 40) shared().put('shot', 'vela')
      if (sval('shotTaken') === 'vela') skyDone(true, 'client dimension ' + sval('clientDim') + ', sky renderer resource found, screenshot taken')
    }
  }
  ServerEvents.customCommand('gg_test_uxv_kerr_sling_sky', function (event) {
    if (!SK || SK.finished) SK = { tick: 0, phase: 'wait_dim', at: 0, finished: false, server: event.server, delay: 0 }
  })
  // client suite (it sends no commands): armed once when the player joins, if the instance carries SKY_MARKER = {"enabled": true}, as
  // gg_test_uv_travel.js does. The hold is set first, so mc-runtime-test cannot quit before the leg reports; the leg starts 200 ticks later.
  var SKY_MARKER = 'kubejs/config/gg_test_uxv_kerr_sling_sky.json'
  function skyEnabledByMarker() {
    try {
      var m = JsonIO.read(SKY_MARKER)
      return m !== null && m !== undefined && String(m.get('enabled')) === 'true'
    } catch (e) {
      return false
    }
  }
  PlayerEvents.loggedIn(function (event) {
    if (SK || !skyEnabledByMarker()) return
    try {
      shared().put('hold', true)
      SK = { tick: 0, phase: 'wait_dim', at: 0, finished: false, server: event.server, delay: 200 }
      emit('sky_armed', 'NOTE', 'player ' + event.player.getProfile().getName() + ' joined and ' + SKY_MARKER + ' is present: the sky leg starts in 200 ticks')
    } catch (e) {
      emit('sky_armed', 'FAIL', 'could not arm the sky leg: ' + e)
      shared().put('hold', false)
      console.info('GGTEST|' + NAME + '|DONE|failures=1')
      SK = { finished: true }
    }
  })
  ServerEvents.tick(function (event) {
    if (!SK || SK.finished || Date.now() - LOADED_AT < 10000) return
    if (SK.delay > 0) { SK.delay--; return }
    try {
      skyStep()
    } catch (e) {
      emit('exception', 'FAIL', 'sky: ' + e)
      console.info('GGTEST|' + NAME + '|DONE|failures=1')
      SK.finished = true
    }
  })
  global.ggTestUxvKerrSlingRequest = ''
  ServerEvents.customCommand('gg_test_uxv_kerr_sling', function () {
    if ((S && !S.finished) || global.ggTestUxvKerrSlingRequest !== '') { emit('request', 'NOTE', 'already requested or running'); return }
    global.ggTestUxvKerrSlingRequest = 'run'
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestUxvKerrSlingRequest !== '' && (!S || S.finished) && Date.now() - LOADED_AT >= 10000) {
        global.ggTestUxvKerrSlingRequest = ''
        start(event.server)
      }
      if (!S || S.finished) return
      S.tick++
      if (S.tick > 4200) throw new Error('overall deadline in ' + S.phase)
      jumpStep()
    } catch (e) {
      if (!S) S = { failed: 0, order: [], tickets: [], finished: false }
      S.failed++
      emit('exception', 'FAIL', (S.phase || 'setup') + ': ' + e + ' @ ' + (e && e.stack ? String(e.stack).split('\n').slice(0, 3).join(' ; ') : ''))
      if (S.server) finish()
      else console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
    }
  })
})()
