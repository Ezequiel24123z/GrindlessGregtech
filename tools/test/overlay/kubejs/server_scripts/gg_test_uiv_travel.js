// priority: -8502
// UIV-B1 T1, AF-1 (issue #203): the jump rows, the relay platform and the ride both ways. Band: grindless:sirius_b_orbit X 35584-35647, Z 0-63,
// Y 98-115 (the near ring at X 35600, Y 100, Z 20; the wireless tower at X 35630, Z 50). The far side is the platform the jump itself places, in
// grindless:rx_j1856_orbit (leg 'c6' visits grindless:cygnus_x1_orbit); the queue case places the Vela platform (a row with a source).
// Nothing is set by hand on a far ring: the test acts only as the player at home (the near ring's bus and energy hatch, the network's tower and
// charge) and as a stand-in player for the transit step. Commands (one leg per bench run):
//   gg_test_uiv_travel         statics; the c4 jump; the platform (frames, floor, paused, circuit 2, cells, the way back, wireless pair tracked);
//                              the coordinates in the near output bus; the ride there; the platform woken by stepping in; the ride back; the
//                              queue served from persistent data after the placer's memory is cleared (Vela, a source row); the save mark
//   gg_test_uiv_travel_check   after a @restart: the platform, its chunks, its way back and the ring registry read back from disk
//   gg_test_uiv_travel_c6      c6 refused without the solution and the pellet, then run with both (stand-in items)
(function () {
  var NAME = 'uiv_travel'
  var SIRIUS = 'grindless:sirius_b_orbit'
  var FAR = 'grindless:rx_j1856_orbit'
  var VELA = 'grindless:vela_pulsar_orbit'
  var O = { x: 35600, y: 100, z: 20 }
  var FARO = { x: 64, y: 100, z: 64 }
  var TOWER = { x: 35630, y: 100, z: 50 }
  var CELL = 'grindless:opv_smes_cell'
  var SUSTAIN = 'grindless:warp_gate/sustain'
  var CHARGE = Math.floor(31457280 * 1200 * 1.1)
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
  function pos(p) { return new (lazy().Pos)(p.x, p.y, p.z) }
  function at(dim, p) { return lazy().Machine.getMachine(S.server.getLevel(dim), pos(p)) }
  function blockId(dim, p) { return String(S.server.getLevel(dim).getBlock(p.x, p.y, p.z).id) }
  function R() { return S.G.relayPlatforms }
  function W() {
    var w = S.G.wireless
    if (!w || typeof w.settle !== 'function') throw new Error('global.grindless.wireless is missing or incomplete')
    return w
  }
  function contents(inv) {
    var out = []
    for (var i = 0; i < inv.getSlots(); i++) {
      var st = inv.getStackInSlot(i)
      if (!st.isEmpty()) out.push(String(st.getId()) + 'x' + st.getCount() + (R().coordinatesOf(st) ? '[' + JSON.stringify(R().coordinatesOf(st)) + ']' : ''))
    }
    return out.join(' ') || 'empty'
  }
  function countOf(inv, id) {
    var n = 0
    for (var i = 0; i < inv.getSlots(); i++) {
      var st = inv.getStackInSlot(i)
      if (!st.isEmpty() && String(st.getId()) === id) n += Number(st.getCount())
    }
    return n
  }
  // the slot of the first stack whose coordinates name `ring`, or -1
  function coordinatesSlot(inv, ring) {
    for (var i = 0; i < inv.getSlots(); i++) {
      var c = R().coordinatesOf(inv.getStackInSlot(i))
      if (c && c.dim === ring.dim && c.x === ring.x && c.y === ring.y && c.z === ring.z) return i
    }
    return -1
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
  // the near ring: the shared placer's own plan (lib/relay_platforms.js), with an ordinary energy hatch the test fills (the home's power)
  function build() {
    var ring = JSON.parse(JSON.stringify(R().ring()))
    ring.energy = 'gtceu:uiv_energy_input_hatch_16a'
    var built = R().plan(ring, O)
    built.cells.forEach(function (c) { if (c.id !== 'minecraft:air') put(c.p, c.id, c.facing) })
    put(O, 'gtceu:warp_gate', true)
    return { bus: built.at.bus, out: built.at.out, e0: built.at.energy }
  }
  // the wireless tower: two OpV cells, the rest casing (the method of gg_test_max_gate_gc.js)
  function placeTower(p) {
    var w = W()
    var desc = S.G.patterns.describe(w.towerId)
    if (!desc) throw new Error('no structure description for ' + w.towerId)
    var ctrl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var s = desc.symbols[row.charAt(ci)]
          if (s && s.kind === 'controller') ctrl = { si: si, ri: ri, ci: ci }
        }
      })
    })
    var used = 0
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var sym = desc.symbols[ch]
          if (sym.kind === 'controller' || sym.kind === 'air' || sym.kind === 'any') continue
          var id = null
          if (sym.kind === 'frames') id = 'gtceu:' + sym.materials[0] + '_frame'
          else if (sym.kind === 'blocks') id = sym.blocks[0]
          else if (sym.kind === 'oneOf') id = used < 2 ? CELL : w.casing
          if (id === null) continue
          if (sym.kind === 'oneOf') used++
          put({ x: p.x - (ci - ctrl.ci), y: p.y + (ri - ctrl.ri), z: p.z - (si - ctrl.si) }, id, false)
        }
      })
    })
    put(p, w.towerId, true)
    w.track(S.server.getLevel(SIRIUS), pos(p))
  }
  function saveNetwork() {
    var w = W()
    var pd = S.server.persistentData
    S.savedKeys = {}
    ;[w.blocksKey, w.storeKey, w.legacyKey].forEach(function (k) {
      if (k === undefined || k === null) return
      var t = pd.get(k)
      S.savedKeys[k] = t === null || t === undefined ? null : t.copy()
      pd.remove(k)
    })
    w.dropCache()
    S.wasPaused = w.paused === true
    w.paused = true
    S.networkSaved = true
  }
  function restoreNetwork() {
    if (!S.networkSaved) return
    var w = W()
    var pd = S.server.persistentData
    Object.keys(S.savedKeys || {}).forEach(function (k) {
      pd.remove(k)
      var t = S.savedKeys[k]
      if (t !== null) pd.put(k, t)
    })
    w.dropCache()
    w.paused = S.wasPaused === true
    S.networkSaved = false
  }
  function fill(m) { m.energyContainer.setEnergyStored(m.energyContainer.getEnergyCapacity()) }
  function fakePlayer(dim, x, y, z, id) {
    var f = { dim: dim, x: x, y: y, z: z, calls: [], msgs: [] }
    f.getUuid = function () { return 'gg-fake-uiv-' + (id || 'a') }
    f.getLevel = function () { return { getDimension: function () { return f.dim } } }
    f.getX = function () { return f.x }
    f.getY = function () { return f.y }
    f.getZ = function () { return f.z }
    f.getYaw = function () { return 0 }
    f.getPitch = function () { return 0 }
    f.getName = function () { return { getString: function () { return 'ggfake' } } }
    f.displayClientMessage = function (c) { f.msgs.push(String(c.getString ? c.getString() : c)) }
    f.teleportTo = function (d, x2, y2, z2) { f.calls.push(String(d) + '@' + x2 + ',' + y2 + ',' + z2); f.dim = String(d); f.x = x2; f.y = y2; f.z = z2 }
    return f
  }
  // the server's own transit step with one stand-in player (the world's persistent data, so placed platforms count as rings)
  function stepAs(player) {
    var server = S.server
    S.G.warpGate.transit.step({ getPlayers: function () { return [player] }, getLevel: function (d) { return server.getLevel(d) },
      persistentData: server.persistentData })
  }
  function holds(m) {
    if (!m) return false
    var logic = m.getRecipeLogic()
    var last = logic.getLastRecipe()
    return logic.isWorking() && !!last && String(last.id) === SUSTAIN
  }
  function release() {
    S.order.slice().reverse().forEach(function (p) { try { cmd(SIRIUS, 'setblock ' + p.x + ' ' + p.y + ' ' + p.z + ' minecraft:air replace') } catch (e) { } })
    S.tickets.forEach(function (t) { try { cmd(SIRIUS, 'forceload remove ' + t.x + ' ' + t.z) } catch (e) { } })
  }
  function finish() {
    if (S.finished) return
    S.finished = true
    try { var c = ctrl(); if (c) c.setWorkingEnabled(false) } catch (e) { }
    try { if (S.G.warpGate.transit) { delete S.G.warpGate.transit.moved['gg-fake-uiv-a']; delete S.G.warpGate.transit.woke['gg-fake-uiv-a'] } } catch (e) { }
    try { if (S.velaQueued) S.server.persistentData.remove('uxvPlatform_vela_pulsar') } catch (e) { }
    try { restoreNetwork() } catch (e) { emit('cleanup', 'NOTE', 'network not restored: ' + e) }
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
    check('static_travel_script', !!T && !!T.placed && T.placed === S.G.relayPlatforms.placed, 'uivTravel.placed is the shared placer\'s map')
    check('static_relay_lib', typeof R().place === 'function' && typeof R().step === 'function' && WG.onFinished === R().onFinished &&
      typeof WG.finishRun === 'function', 'lib/relay_platforms.js published; the gate hands completed runs to it')
    var sites = ['grindless:rx_j1856_orbit', 'grindless:psr_j0437_orbit', 'grindless:cygnus_x1_orbit', VELA]
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
  function farBus(far) {
    var fb = null
    far.getParts().forEach(function (p) { if (/input_bus/.test(String(p.getDefinition().getId()))) fb = p })
    return fb
  }

  function jumpStep() {
    var c = ctrl()
    var e = at(SIRIUS, S.pos.e0)
    if (e) fill(e)
    if (S.networkSaved && S.tick % Math.max(1, Number(W().settleTicks) || 10) === 0) W().settle(S.server)
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
      if (S.tick - S.phaseAt === 600) check('jump_no_early_platform', !S.server.persistentData.contains('uivPlatform_rx_j1856'), 'no platform halfway through the jump')
      if (S.server.persistentData.contains('uivPlatform_rx_j1856')) { phase('platform'); return }
      if (S.tick - S.phaseAt > 1700) { check('platform_placed', false, 'no platform row after the jump; bus ' + contents(S.inv)); finish() }
      return
    }
    if (S.phase === 'platform') {
      if (S.tick - S.phaseAt < 40) return
      check('platform_seed_consumed', contents(S.inv).indexOf('launched_relay_seed') < 0, 'bus after the jump: ' + contents(S.inv))
      check('platform_chart_kept', contents(S.inv).indexOf('pulsar_navigation_chart') >= 0, 'bus after the jump: ' + contents(S.inv))
      check('platform_queue_empty', !S.server.persistentData.contains(R().dueKey), 'queue ' + S.server.persistentData.getString(R().dueKey))
      var far = at(FAR, FARO)
      check('platform_ring_formed', !!far && far.isFormed(), 'far ring in ' + FAR + ': ' + (far ? 'formed ' + far.isFormed() : 'no controller block entity'))
      var post = { x: FARO.x + 7, y: FARO.y + 1, z: FARO.z }
      check('platform_frames', blockId(FAR, post) === 'gtceu:tungsten_steel_frame', 'post at ' + JSON.stringify(post) + ': ' + blockId(FAR, post))
      var under = { x: FARO.x, y: FARO.y - 2, z: FARO.z + 7 }
      check('platform_floor', blockId(FAR, under) === 'grindless:station_truss_casing', 'floor at ' + JSON.stringify(under) + ': ' + blockId(FAR, under))
      if (far) {
        check('platform_paused', String(far.getRecipeLogic().getStatus()) === 'SUSPEND', 'far ring status ' + far.getRecipeLogic().getStatus())
        var fbus = farBus(far)
        var fc = fbus ? fbus.getCircuitInventory().getStackInSlot(0) : null
        check('platform_stock', !!fbus && countOf(fbus.getInventory(), 'grindless:exotic_matter_cell') === 8, 'far input bus: ' + (fbus ? contents(fbus.getInventory()) : 'none'))
        check('platform_circuit', !!fc && !fc.isEmpty() && Number(lazy().Circuit.getCircuitConfiguration(fc)) === 2, 'far circuit ' + (fc ? String(fc.getId()) + ' ' + fc.getNbt() : 'none'))
        check('platform_way_back', !!fbus && coordinatesSlot(fbus.getInventory(), { dim: SIRIUS, x: O.x, y: O.y, z: O.z }) >= 0, 'far input bus: ' + (fbus ? contents(fbus.getInventory()) : 'none'))
        var ids = []
        far.getParts().forEach(function (p) { ids.push(String(p.getDefinition().getId())) })
        emit('platform_parts', 'NOTE', ids.join(' '))
      }
      var dyn = at(FAR, { x: FARO.x + 9, y: FARO.y, z: FARO.z })
      check('platform_wireless_pair', !!dyn && /wireless_dynamo/.test(String(dyn.getDefinition().getId())), dyn ? String(dyn.getDefinition().getId()) : 'no dynamo hatch')
      var tracked = W().tracked(S.server).filter(function (x) { return String(x.d) === FAR })
      check('platform_wireless_tracked', tracked.length === 2, JSON.stringify(tracked))
      check('platform_ae2', blockId(FAR, { x: FARO.x + 12, y: FARO.y, z: FARO.z }) === 'ae2:controller' && blockId(FAR, { x: FARO.x + 12, y: FARO.y + 1, z: FARO.z }) === 'ae2:drive',
        blockId(FAR, { x: FARO.x + 12, y: FARO.y, z: FARO.z }) + ' + ' + blockId(FAR, { x: FARO.x + 12, y: FARO.y + 1, z: FARO.z }))
      check('platform_forceload', Number(S.server.getLevel(FAR).getForcedChunks().size()) > 0, 'forced chunks in ' + FAR + ': ' + S.server.getLevel(FAR).getForcedChunks().size())
      var out = at(SIRIUS, S.pos.out).getInventory()
      var slot = coordinatesSlot(out, { dim: FAR, x: FARO.x, y: FARO.y, z: FARO.z })
      check('coordinates_given', slot >= 0, 'near output bus: ' + contents(out))
      S.server.runCommandSilent('save-all flush')
      // the player at home: the coordinates into the input bus, circuit 2 and two cells; the near ring's own sustain pays the ride
      var stick = slot >= 0 ? out.getStackInSlot(slot).copy() : null
      if (slot >= 0) out.setStackInSlot(slot, Item.empty)
      var inv = stockJump(2, [['grindless:exotic_matter_cell', 2]])
      if (stick) inv.setStackInSlot(1, stick)
      ctrl().getRecipeLogic().updateTickSubscription()
      phase('ride_there')
      return
    }
    if (S.phase === 'ride_there') {
      if (!holds(ctrl())) {
        if (S.tick - S.phaseAt > 200) { check('ride_near_holds', false, 'near ring status ' + ctrl().getRecipeLogic().getStatus()); finish() }
        return
      }
      var far2 = at(FAR, FARO)
      var f = fakePlayer(SIRIUS, O.x + 0.5, O.y, O.z + 7.5)
      S.f = f
      stepAs(f)
      check('ride_there', f.calls.length === 1 && f.dim === FAR && f.x === FARO.x + 0.5 && f.z === FARO.z + 7.5, 'calls ' + JSON.stringify(f.calls) + ' now ' + f.dim)
      stepAs(f)
      check('ride_no_pingpong', f.calls.length === 1 && String(far2.getRecipeLogic().getStatus()) === 'SUSPEND',
        'calls ' + f.calls.length + ', far status ' + far2.getRecipeLogic().getStatus() + ' (arriving wakes nothing)')
      f.y = FARO.y + 10
      stepAs(f)
      f.y = FARO.y
      stepAs(f)
      var logic = far2.getRecipeLogic()
      check('wake', !logic.isSuspend() && logic.isSuspendAfterFinish() && f.calls.length === 1, 'far status ' + logic.getStatus() + ', suspend after finish ' +
        logic.isSuspendAfterFinish() + ', messages ' + JSON.stringify(f.msgs))
      phase('ride_back')
      return
    }
    if (S.phase === 'ride_back') {
      var far3 = at(FAR, FARO)
      if (!holds(far3)) {
        if (S.tick - S.phaseAt > 300) {
          var fb3 = farBus(far3)
          check('ride_far_holds', false, 'far ring status ' + far3.getRecipeLogic().getStatus() + ', bus ' + (fb3 ? contents(fb3.getInventory()) : 'none') + ', stored ' +
            JSON.stringify(W().status ? W().status(S.server) : null))
          finish()
        }
        return
      }
      var fb = farBus(far3)
      check('ride_paid', !!fb && countOf(fb.getInventory(), 'grindless:exotic_matter_cell') === 7, 'far input bus after waking: ' + (fb ? contents(fb.getInventory()) : 'none'))
      stepAs(S.f)
      check('ride_back', S.f.calls.length === 2 && S.f.dim === SIRIUS && S.f.x === O.x + 0.5 && S.f.z === O.z + 7.5, 'calls ' + JSON.stringify(S.f.calls) + ' now ' + S.f.dim)
      // the queue after a restart of the placer's memory: a source row (Vela) read back from persistent data and placed by the same placer
      S.velaQueued = !S.server.persistentData.contains('uxvPlatform_vela_pulsar')
      R().enqueue(S.server, 'vela_pulsar', { dim: SIRIUS, x: O.x, y: O.y, z: O.z, fx: 0, fz: -1 })
      R().reset()
      phase('queue')
      return
    }
    if (S.phase === 'queue') {
      if (!S.server.persistentData.contains('uxvPlatform_vela_pulsar') || S.server.persistentData.contains(R().dueKey)) {
        if (S.tick - S.phaseAt > 100) { check('queue_vela', false, 'queue ' + S.server.persistentData.getString(R().dueKey)); finish() }
        return
      }
      var vela = at(VELA, FARO)
      check('queue_vela', !!vela && String(vela.getDefinition().getId()) === 'gtceu:warp_gate' && String(vela.getRecipeLogic().getStatus()) === 'SUSPEND' &&
        blockId(VELA, { x: FARO.x + 7, y: FARO.y + 1, z: FARO.z }) === 'gtceu:tungsten_steel_frame',
        'mark ' + S.server.persistentData.getString('uxvPlatform_vela_pulsar') + ', controller ' + (vela ? vela.getDefinition().getId() + ' ' + vela.getRecipeLogic().getStatus() : 'none'))
      var outv = at(SIRIUS, S.pos.out).getInventory()
      check('queue_coordinates', coordinatesSlot(outv, { dim: VELA, x: FARO.x, y: FARO.y, z: FARO.z }) >= 0, 'near output bus: ' + contents(outv))
      S.keep = false
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
    var fbus = far && far.isFormed() ? farBus(far) : at(FAR, { x: FARO.x + 6, y: FARO.y - 1, z: FARO.z })
    check('restart_way_back', !!fbus && coordinatesSlot(fbus.getInventory(), { dim: SIRIUS, x: O.x, y: O.y, z: O.z }) >= 0, 'far input bus: ' + (fbus ? contents(fbus.getInventory()) : 'none'))
    check('restart_ae2', blockId(FAR, { x: FARO.x + 12, y: FARO.y, z: FARO.z }) === 'ae2:controller', blockId(FAR, { x: FARO.x + 12, y: FARO.y, z: FARO.z }))
    var key = SIRIUS + '|' + O.x + '|' + O.y + '|' + O.z
    var saved = String(S.server.persistentData.getString(S.G.warpGate.ringsKey))
    check('restart_rings', saved.indexOf(key + '|0|-1') >= 0 && !!S.G.warpGate.gates[key], 'saved rings "' + saved + '", this boot ' + JSON.stringify(Object.keys(S.G.warpGate.gates)))
    S.keep = false
    finish()
  }

  function start(server, leg) {
    S = { server: server, G: global.grindless, failed: 0, tick: 0, phaseAt: 0, phase: 'setup', leg: leg, owned: {}, order: [], chunks: {}, tickets: [],
      finished: false, keep: false, networkSaved: false }
    if (leg === 'check') { checkAfterRestart(); return }
    statics()
    S.pos = build()
    if (leg === 'c4') {
      saveNetwork()
      placeTower(TOWER)
      W().setStored(S.server, CHARGE)
    }
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
      if (S.tick > 3200) throw new Error('overall deadline in ' + S.phase)
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