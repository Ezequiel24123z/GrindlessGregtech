// priority: -8502
// UIV-B1 T1: the jump rows and the arrival platform. Band: grindless:sirius_b_orbit X 35584-35647, Z 0-63, Y 98-115 (the near ring at X 35600, Y 100, Z 20).
// The far side is the platform the jump itself places, in grindless:rx_j1856_orbit (the dimension of this run; leg 'cygnus' visits grindless:cygnus_x1_orbit).
// Doubt: a platform placed in an unvisited tier 11 datapack dimension, and the jump rows at the Sirius B relay. Commands (one leg per bench run):
//   gg_test_uiv_travel         statics, the c4 jump, the platform, the ride there and back (stand-in player), the save mark
//   gg_test_uiv_travel_check   after a @restart: the platform, its force-loaded chunks and its AE2 seed read back from disk
//   gg_test_uiv_travel_c6      c6 refused without the solution and the pellet, then run with both (stand-in items)
(function () {
  var NAME = 'uiv_travel'
  var SIRIUS = 'grindless:sirius_b_orbit'
  var FAR = 'grindless:rx_j1856_orbit'
  var O = { x: 35600, y: 100, z: 20 }
  var FARO = { x: 64, y: 100, z: 64 }
  var X0 = 35584
  var X1 = 35647
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
    S.server.getLevel(SIRIUS).getChunk(x >> 4, z >> 4)
    if (cmd(SIRIUS, 'forceload query ' + x + ' ' + z) > 0) return
    S.tickets.push({ x: x, z: z })
    cmd(SIRIUS, 'forceload add ' + x + ' ' + z)
  }
  function put(p, id, facing) {
    if (p.x < X0 || p.x > X1 || p.z < 0 || p.z > 63) throw new Error('outside the band ' + p.x + ',' + p.z)
    ticket(p)
    S.order.push(p)
    cmd(SIRIUS, 'setblock ' + p.x + ' ' + p.y + ' ' + p.z + ' ' + id + (facing ? '[facing=north]' : '') + ' replace')
  }
  function allows(sym, ability) {
    return !!sym && sym.kind === 'oneOf' && sym.options.some(function (o) { return o.kind === 'part' && o.ability === ability })
  }
  function plain(sym) {
    if (sym.kind === 'blocks') return String(sym.blocks[0])
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
  function fakePlayer(dim, x, y, z, id) {
    var f = { dim: dim, x: x, y: y, z: z, calls: [] }
    f.getUuid = function () { return 'gg-fake-uiv-' + (id || 'a') }
    f.getLevel = function () { return { getDimension: function () { return f.dim } } }
    f.getX = function () { return f.x }
    f.getY = function () { return f.y }
    f.getZ = function () { return f.z }
    f.getYaw = function () { return 0 }
    f.getPitch = function () { return 0 }
    f.getName = function () { return { getString: function () { return 'ggfake' } } }
    f.teleportTo = function (d, x2, y2, z2) { f.calls.push(String(d) + '@' + x2 + ',' + y2 + ',' + z2); f.dim = String(d); f.x = x2; f.y = y2; f.z = z2 }
    return f
  }
  function stepAs(player) {
    var server = S.server
    S.G.warpGate.transit.step({ getPlayers: function () { return [player] }, getLevel: function (d) { return server.getLevel(d) } })
  }
  function release() {
    S.order.slice().reverse().forEach(function (p) { try { cmd(SIRIUS, 'setblock ' + p.x + ' ' + p.y + ' ' + p.z + ' minecraft:air replace') } catch (e) { } })
    S.tickets.forEach(function (t) { try { cmd(SIRIUS, 'forceload remove ' + t.x + ' ' + t.z) } catch (e) { } })
  }
  function finish() {
    if (S.finished) return
    S.finished = true
    if (!S.keep) release()
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  function phase(name) { S.phase = name; S.phaseAt = S.tick; emit('stage', 'NOTE', name) }

  function statics() {
    var WG = S.G.warpGate
    var want = { hold_rx_j1856: 4, hold_psr_j0437: 5, hold_cygnus_x1: 6 }
    Object.keys(want).forEach(function (n) {
      var r = WG.recipes.filter(function (x) { return x.name === n })[0]
      check('static_' + n, !!r && r.circuit === want[n] && r.site === 'sirius_b_orbit' && r.eut === 31457280 && r.duration === 1200 && r.itemsOut.length === 0,
        JSON.stringify(r || null))
    })
    check('static_clean', (WG.skipped || []).length === 0 && (WG.clashes || []).length === 0, 'skipped ' + JSON.stringify(WG.skipped || []) + ' clashes ' + JSON.stringify(WG.clashes || []))
    var T = S.G.uivTravel
    check('static_travel_script', !!T && !!T.placed, 'server uiv/travel.js published global.grindless.uivTravel')
    var sites = ['grindless:rx_j1856_orbit', 'grindless:psr_j0437_orbit', 'grindless:cygnus_x1_orbit']
    check('static_levels', sites.every(function (d) { return !!S.server.getLevel(d) }), sites.join(' '))
  }

  // ---------------------------------------------------------------- leg 1 and leg 3: the jump
  function stockJump(circuit, items) {
    var bus = at(SIRIUS, S.pos.bus)
    bus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(circuit))
    var inv = bus.getInventory()
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, Item.empty)
    items.forEach(function (k, i) { inv.setStackInSlot(i, Item.of(k[0], k[1])) })
    return inv
  }
  function ctrl() { return at(SIRIUS, O) }

  function jumpStep() {
    var c = ctrl()
    var e = at(SIRIUS, S.pos.e0)
    if (e) fill(e)
    if (S.phase === 'form') {
      if (c && c.isFormed()) {
        check('ring_formed', true, 'gate formed in ' + SIRIUS)
        if (S.leg === 'c6') {
          stockJump(6, [['grindless:launched_relay_seed', 1], ['grindless:pulsar_navigation_chart', 1]])
          c.getRecipeLogic().updateTickSubscription()
          phase('c6_refused')
        } else {
          S.inv = stockJump(4, [['grindless:launched_relay_seed', 1], ['grindless:pulsar_navigation_chart', 1]])
          c.getRecipeLogic().updateTickSubscription()
          phase('jump')
        }
      } else if (S.tick - S.phaseAt > 400) { check('ring_formed', false, 'not formed after 400 ticks'); finish() }
      return
    }
    if (S.phase === 'c6_refused') {
      if (S.tick - S.phaseAt === 100) {
        var logic = c.getRecipeLogic()
        check('c6_refused', !logic.isWorking(), 'c6 with only the seed and the chart: working ' + logic.isWorking() + ', status ' + logic.getStatus())
        stockJump(6, [['grindless:launched_relay_seed', 1], ['grindless:pulsar_navigation_chart', 1], ['grindless:pulsar_navigation_solution', 1], ['grindless:neutronium_pellet', 1]])
        c.getRecipeLogic().updateTickSubscription()
        phase('c6_run')
      }
      return
    }
    if (S.phase === 'c6_run') {
      if (c.getRecipeLogic().isWorking()) {
        check('c6_runs', true, 'c6 runs with the seed, the solution and the pellet')
        phase('c6_wait')
      } else if (S.tick - S.phaseAt > 200) { check('c6_runs', false, 'c6 did not start with all inputs: ' + c.getRecipeLogic().getStatus()); finish() }
      return
    }
    if (S.phase === 'c6_wait') {
      if (S.server.persistentData.contains('uivPlatform_cygnus_x1')) {
        check('c6_platform', true, 'Cygnus X-1 platform row ' + S.server.persistentData.getString('uivPlatform_cygnus_x1'))
        finish()
      } else if (S.tick - S.phaseAt > 1500) { check('c6_platform', false, 'no Cygnus platform row'); finish() }
      return
    }
    if (S.phase === 'jump') {
      if (c.getRecipeLogic().isWorking()) {
        check('jump_runs', true, 'hold_rx_j1856 runs at 31,457,280 EU/t (gate overclock identity)')
        phase('jump_wait')
      } else if (S.tick - S.phaseAt > 200) { check('jump_runs', false, 'c4 did not start: ' + c.getRecipeLogic().getStatus() + ' bus ' + contents(S.inv)); finish() }
      return
    }
    if (S.phase === 'jump_wait') {
      if (S.server.persistentData.contains('uivPlatform_rx_j1856')) { phase('platform'); return }
      if (S.tick - S.phaseAt > 1700) { check('platform_placed', false, 'no platform row after the jump; bus ' + contents(S.inv)); finish() }
      return
    }
    if (S.phase === 'platform') {
      if (S.tick - S.phaseAt < 40) return
      check('platform_seed_consumed', contents(S.inv).indexOf('launched_relay_seed') < 0, 'bus after the jump: ' + contents(S.inv))
      check('platform_chart_kept', contents(S.inv).indexOf('pulsar_navigation_chart') >= 0, 'bus after the jump: ' + contents(S.inv))
      var far = at(FAR, FARO)
      check('platform_ring_formed', !!far && far.isFormed(), 'far ring in ' + FAR + ': ' + (far ? 'formed ' + far.isFormed() : 'no controller block entity'))
      if (far) {
        var fbus = null
        far.getParts().forEach(function (p) { if (/input_bus/.test(String(p.getDefinition().getId()))) fbus = p })
        check('platform_stock', !!fbus && contents(fbus.getInventory()).indexOf('exotic_matter_cell') >= 0, 'far input bus: ' + (fbus ? contents(fbus.getInventory()) : 'none'))
        var ids = []
        far.getParts().forEach(function (p) { ids.push(String(p.getDefinition().getId())) })
        emit('platform_parts', 'NOTE', ids.join(' '))
      }
      var dyn = at(FAR, { x: FARO.x + 9, y: FARO.y, z: FARO.z })
      check('platform_wireless_pair', !!dyn && /wireless_dynamo/.test(String(dyn.getDefinition().getId())), dyn ? String(dyn.getDefinition().getId()) : 'no dynamo hatch')
      check('platform_ae2', blockId(FAR, { x: FARO.x + 12, y: FARO.y, z: FARO.z }) === 'ae2:controller' && blockId(FAR, { x: FARO.x + 12, y: FARO.y + 1, z: FARO.z }) === 'ae2:drive',
        blockId(FAR, { x: FARO.x + 12, y: FARO.y, z: FARO.z }) + ' + ' + blockId(FAR, { x: FARO.x + 12, y: FARO.y + 1, z: FARO.z }))
      check('platform_forceload', Number(S.server.getLevel(FAR).getForcedChunks().size()) > 0, 'forced chunks in ' + FAR + ': ' + S.server.getLevel(FAR).getForcedChunks().size())
      S.server.runCommandSilent('save-all flush')
      // the ride: a sustain ring at each end (c2), a stand-in player in the near ring
      var cc = ctrl()
      stockJump(2, [['grindless:exotic_matter_cell', 2]])
      cc.getRecipeLogic().updateTickSubscription()
      if (far) {
        try {
          var fb = null
          far.getParts().forEach(function (p) { if (/input_bus/.test(String(p.getDefinition().getId()))) fb = p })
          fb.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(2))
          far.getRecipeLogic().updateTickSubscription()
          far.getParts().forEach(function (p) { if (/energy/.test(String(p.getDefinition().getId()))) { try { fill(p) } catch (x) { emit('far_energy', 'NOTE', 'cannot fill ' + p.getDefinition().getId() + ': ' + x) } } })
        } catch (x) { emit('far_arm', 'NOTE', x) }
      }
      phase('ride')
      return
    }
    if (S.phase === 'ride') {
      var far2 = at(FAR, FARO)
      if (far2) far2.getParts().forEach(function (p) { if (/energy/.test(String(p.getDefinition().getId()))) { try { fill(p) } catch (x) { } } })
      if (S.tick - S.phaseAt < 80) return
      var farLive = far2 && far2.getRecipeLogic().isWorking()
      var nearLive = ctrl().getRecipeLogic().isWorking()
      check('ride_rings_live', !!farLive && nearLive, 'near ' + nearLive + ', far ' + farLive + (far2 ? ' status ' + far2.getRecipeLogic().getStatus() : ''))
      var cE = { x: O.x + 0.5, y: O.y, z: O.z + 7.5 }
      var f = fakePlayer(SIRIUS, cE.x, cE.y, cE.z)
      stepAs(f)
      check('ride_there', f.calls.length === 1 && f.dim === FAR, 'calls ' + JSON.stringify(f.calls) + ' now ' + f.dim)
      var farC = { x: FARO.x + 0.5, y: FARO.y, z: FARO.z + 7.5 }
      var g = fakePlayer(FAR, farC.x, farC.y, farC.z, 'b')
      stepAs(g)
      check('ride_back', g.calls.length === 1 && g.dim === SIRIUS, 'calls ' + JSON.stringify(g.calls) + ' now ' + g.dim)
      finish()
    }
  }

  // ---------------------------------------------------------------- leg 2: after the restart
  function checkAfterRestart() {
    var row = String(S.server.persistentData.getString('uivPlatform_rx_j1856'))
    check('restart_row', row === FAR + '@' + FARO.x + ',' + FARO.y + ',' + FARO.z, 'row after the restart: "' + row + '"')
    var forced = Number(S.server.getLevel(FAR).getForcedChunks().size())
    check('restart_forceload', forced > 0, 'forced chunks in ' + FAR + ' with nobody there: ' + forced)
    var far = at(FAR, FARO)
    check('restart_machine', !!far, far ? 'controller loaded, formed ' + far.isFormed() : 'controller not loaded')
    check('restart_ae2', blockId(FAR, { x: FARO.x + 12, y: FARO.y, z: FARO.z }) === 'ae2:controller', blockId(FAR, { x: FARO.x + 12, y: FARO.y, z: FARO.z }))
    S.keep = false
    cmd(FAR, 'forceload remove ' + (FARO.x - 8) + ' ' + FARO.z + ' ' + (FARO.x + 14) + ' ' + (FARO.z + 15))
    finish()
  }

  function start(server, leg) {
    S = { server: server, G: global.grindless, failed: 0, tick: 0, phaseAt: 0, phase: 'setup', leg: leg, owned: {}, order: [], chunks: {}, tickets: [],
      finished: false, keep: false }
    if (leg === 'check') { checkAfterRestart(); return }
    statics()
    S.pos = build()
    S.keep = false
    phase('form')
  }
  function request(leg) {
    return function () {
      if ((S && !S.finished) || global.ggTestUivTravelRequest !== '') { emit('request', 'NOTE', 'already requested or running'); return }
      global.ggTestUivTravelRequest = leg
    }
  }
  global.ggTestUivTravelRequest = ''
  ServerEvents.customCommand('gg_test_uiv_travel', request('c4'))
  ServerEvents.customCommand('gg_test_uiv_travel_check', request('check'))
  ServerEvents.customCommand('gg_test_uiv_travel_c6', request('c6'))
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestUivTravelRequest !== '' && (!S || S.finished) && Date.now() - LOADED_AT >= 10000) {
        var leg = global.ggTestUivTravelRequest
        global.ggTestUivTravelRequest = ''
        start(event.server, leg)
      }
      if (!S || S.finished || S.leg === 'check') return
      S.tick++
      if (S.tick > 2600) throw new Error('overall deadline in ' + S.phase)
      jumpStep()
    } catch (e) {
      if (!S) S = { failed: 0, order: [], tickets: [], finished: false, keep: false }
      S.failed++
      emit('exception', 'FAIL', (S.phase || 'setup') + ': ' + e)
      if (S.server) finish()
      else console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
    }
  })
})()
