// priority: -5156
// TEST ONLY, B13-DIAL (#238; gtceu:hyperstargate, one dial per team). Commands: kubejs custom_command gg_test_maxplus_dial (leg 1), then, after an
// `@restart`, kubejs custom_command gg_test_maxplus_dial_2 (leg 2).
// Band ONLY: X 49152-49215, Z 0-63, Y 98-160 of gcyr:black_hole_orbit (Sgr A*) (zones.json row maxplus_dial). No startup overlay.
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server -PackDir <copy of pack> `
//     -Commands 'kubejs custom_command gg_test_maxplus_dial;;@restart:GGTEST\|maxplus_dial\|PHASE1\|DONE;;kubejs custom_command gg_test_maxplus_dial_2' `
//     -WaitForLog 'GGTEST\|maxplus_dial\|DONE@@400'
//   T1 (named uncertainties: GTM's controller owner resolves to an FTB team at runtime, and the per-team record survives a restart):
//     party       a fake player with a known UUID is made a member of a new FTB party team (note when FTB Teams refuses it: the owner's team is then FTB's answer for that UUID)
//     formed      the 41 x 43 x 9 gate forms with one 4,096 A MAX+ wireless hatch and the buses
//     owner       the controller's GTM owner is that UUID (MetaMachine.setOwnerUUID, what placing sets) and lib/teams.js's ofMachine answers FTB's team id
//     charge_team the dial one EU short is refused 'charge' and W.dialCharge was asked for the owner's team, never the 'server' fallback
//     entry_team  the dial covered starts, and the gate entry (HS.gates() and gateAt) is open and carries the owner's team
//     crossing    the real ending.js logic (E.update, E.claim, E.cross) on that live entry: two members of the team cross once each, a player of another team
//                 and a repeat are refused; the record holds the team and both members and is written to persistent data (leg 1 ends with PHASE1|DONE)
//     record_cold (leg 2, a cold start) E.load reads the same record back from the save: same gate key, run, team and the two members, still open; the player
//                 refused before is still refused and the members are not admitted again
// W.dialCharge is replaced for the run by a fixed answer that records the team it was asked for (put back at the end); the network's keys are put aside and the
// wireless queue (ggTestWirelessQueue) is shared with the other wireless fixtures. The hatch is topped up every tick: the run stands for the banks' supply.
// Leg 1 clears and releases its band; leg 2 only reads the save, drops the record and its own key. The party team stays in the test world's save.
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'maxplus_dial'
  var REQUEST = 'ggTestMaxplusDialRequest'
  var REQUEST2 = 'ggTestMaxplusDialRequest2'
  var QUEUE = 'ggTestWirelessQueue'
  var SAVED = 'ggTestMaxplusDial'
  var TURN_TIMEOUT_MS = 180000
  var FORM_TIMEOUT = 1200
  var REFUSE_WAIT = 80
  var START_TIMEOUT = 400
  var LOADED_AT = Date.now()
  var X0 = 49152
  var X1 = 49215
  var Y0 = 98
  var Y1 = 160
  var CX = 49183
  var CY = 100
  var CZ = 20
  var SITE = 'gcyr:black_hole_orbit'
  var MACHINE = 'gtceu:hyperstargate'
  var HATCH = 'gtceu:max_wireless_energy_hatch_4096a'
  var IN_BUS = 'gtceu:hv_input_bus'
  var OUT_BUS = 'gtceu:hv_output_bus'
  var LOCK = 'grindless:horizon_lock'
  var NEED = '10555311626649600'
  var CAPACITY = '11258999068426240'
  var FEED = [['grindless:genome_archive', 1], ['grindless:cloud_phase_map', 1], ['grindless:horizon_phase_lock', 16], ['grindless:jacketed_condensate_cell', 64], [LOCK, 1]]
  var S = null
  var C = null

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      UUID: Java.loadClass('java.util.UUID'),
      Profile: Java.loadClass('com.mojang.authlib.GameProfile'),
      FPF: Java.loadClass('net.minecraftforge.common.util.FakePlayerFactory'),
      TeamsAPI: Java.loadClass('dev.ftb.mods.ftbteams.api.FTBTeamsAPI'),
      Color4I: Java.loadClass('dev.ftb.mods.ftblibrary.icon.Color4I')
    }
    return C
  }
  function errText(e) {
    var s = ''
    try { s = String(e.message || e) } catch (x) { }
    try { s += ' @' + String(e.stack || '').split('\n').slice(0, 3).join(' ') } catch (x) { }
    return s === '' ? 'unprintable exception' : s
  }
  function clean(x) { return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 1500) }
  // details never start with FAIL / ERROR: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function emit(name, kind, detail) { console.info(TAG + SCOPE + '|' + name + '|' + kind + '|' + clean(detail)) }
  function check(name, ok, detail) {
    if (!ok) S.failed++
    emit(name, ok ? 'PASS' : 'FAIL', detail)
  }
  function note(name, detail) { emit(name, 'NOTE', detail) }

  function queueList() {
    var s = global[QUEUE]
    s = s === undefined || s === null ? '' : String(s)
    return s === '' ? [] : s.split(',')
  }
  function joinQueue() {
    var q = queueList()
    if (q.indexOf(SCOPE) < 0) q.push(SCOPE)
    global[QUEUE] = q.join(',')
  }
  function leaveQueue() { global[QUEUE] = queueList().filter(function (n) { return n !== SCOPE }).join(',') }
  function myTurn() { return queueList()[0] === SCOPE }

  function W() {
    var w = global.grindless && global.grindless.wireless
    if (!w || !w.big || typeof w.dialCharge !== 'function') throw new Error('global.grindless.wireless has no bank API (lv/wireless_energy.js)')
    return w
  }
  function HS() {
    var h = global.grindless && global.grindless.hyperstargate
    if (!h || typeof h.gateAt !== 'function') throw new Error('global.grindless.hyperstargate is not published')
    return h
  }
  function T() {
    var t = global.grindless && global.grindless.teams
    if (!t || typeof t.ofMachine !== 'function') throw new Error('global.grindless.teams is missing (lib/teams.js did not run)')
    return t
  }
  function E() {
    var e = global.grindless && global.grindless.ending
    if (!e || typeof e.load !== 'function' || typeof e.claim !== 'function') throw new Error('global.grindless.ending is incomplete (maxplus/ending.js did not load)')
    return e
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
    S.realDialCharge = w.dialCharge
    S.fake = { capacity: CAPACITY, stored: NEED }
    S.asked = []
    w.dialCharge = function (server, team) {
      S.asked.push(String(team))
      return { bankCapacity: w.big.toBig(S.fake.capacity), stored: w.big.toBig(S.fake.stored) }
    }
  }
  function restoreNetwork() {
    var w = W()
    var pd = S.server.persistentData
    if (S.realDialCharge) w.dialCharge = S.realDialCharge
    Object.keys(S.savedKeys || {}).forEach(function (k) {
      pd.remove(k)
      var t = S.savedKeys[k]
      if (t !== null) pd.put(k, t)
    })
    w.dropCache()
    w.paused = S.wasPaused === true
  }

  function command(dim, text) { return S.server.runCommandSilent('execute in ' + dim + ' run ' + text) }
  function inBand(x, y, z) { return x >= X0 && x <= X1 && z >= 0 && z <= 63 && y >= Y0 && y <= Y1 }
  function put(x, y, z, block) {
    if (!inBand(x, y, z)) throw new Error('refused: ' + x + ',' + y + ',' + z + ' is outside the band')
    return command(SITE, 'setblock ' + x + ' ' + y + ' ' + z + ' ' + block + ' replace')
  }
  function clear() {
    for (var z = 0; z < 64; z += 8) command(SITE, 'fill ' + X0 + ' ' + Y0 + ' ' + z + ' ' + X1 + ' ' + Y1 + ' ' + (z + 7) + ' minecraft:air')
  }
  function pos(p) { return new (classes().Pos)(p.x, p.y, p.z) }
  function machine() {
    var m = classes().Meta.getMachine(S.level, pos(S.ctrl))
    return m === null || m === undefined ? null : m
  }
  function formCheck(m, waited) {
    if (m === null) return false
    if (m.isFormed()) return true
    if (waited >= 100 && waited % 50 === 0) {
      if (m.checkPatternWithLock()) { m.setFlipped(m.getMultiblockState().isNeededFlip()); m.onStructureFormed() }
    }
    return m.isFormed()
  }
  function why(m) { try { return String(m.getMultiblockState().error) } catch (e) { return 'unknown' } }
  function array(list) {
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }
  function partsLike(m, re) { return array(m.getParts()).filter(function (p) { return re.test(String(p.getDefinition().getId())) }) }

  // the template walk: the structure's blocks, casing in every oneOf, the controller facing north; then the hatch and buses on the front row
  function place() {
    var desc = global.grindless.patterns.describe(MACHINE)
    if (!desc) throw new Error('no structure description for ' + MACHINE)
    var cells = []
    var ctrl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var sym = desc.symbols[ch]
          if (sym.kind === 'controller') ctrl = { si: si, ri: ri, ci: ci }
          cells.push({ si: si, ri: ri, ci: ci, sym: sym })
        }
      })
    })
    var controller = null
    cells.forEach(function (c) {
      var x = CX - (c.ci - ctrl.ci)
      var y = CY + (c.ri - ctrl.ri)
      var z = CZ - (c.si - ctrl.si)
      var sym = c.sym
      var block = null
      if (sym.kind === 'controller') { controller = { x: x, y: y, z: z }; return }
      if (sym.kind === 'blocks') block = sym.blocks[0]
      else if (sym.kind === 'oneOf') {
        sym.options.forEach(function (o) { if (block === null && o.kind === 'blocks') block = o.blocks[0] })
      }
      if (block !== null && block !== 'minecraft:air') put(x, y, z, block)
    })
    put(controller.x - 1, controller.y, controller.z, HATCH + '[facing=north]')
    put(controller.x - 2, controller.y, controller.z, IN_BUS + '[facing=north]')
    put(controller.x - 3, controller.y, controller.z, IN_BUS + '[facing=north]')
    put(controller.x + 1, controller.y, controller.z, OUT_BUS + '[facing=north]')
    put(controller.x, controller.y, controller.z, MACHINE + '[facing=north]')
    return controller
  }

  function feed(m) {
    var buses = partsLike(m, /input_bus/)
    var st = buses[0].getInventory().storage
    for (var i = 0; i < st.getSlots(); i++) st.setStackInSlot(i, Item.of('minecraft:air'))
    FEED.forEach(function (f, i) { buses[i < 3 ? 0 : 1].getInventory().storage.setStackInSlot(i < 3 ? i : i - 3, Item.of(f[0], f[1])) })
  }
  function hatchContainer(m) {
    var h = partsLike(m, /max_wireless_energy_hatch_4096a/)[0]
    return h ? h.energyContainer : null
  }
  function topUp(m) {
    var ec = hatchContainer(m)
    if (!ec) return
    var room = Number(ec.getEnergyCapacity()) - Number(ec.getEnergyStored())
    if (room > 0) ec.changeEnergy(room)
  }

  // a fake player of a known UUID in a new party: the team id FTB Teams answers for that UUID is what the gate must carry
  function makeOwner() {
    var K = classes()
    var uuid = K.UUID.randomUUID()
    var tm = K.TeamsAPI.api().getManager()
    var fp = K.FPF.get(S.level, new K.Profile(uuid, 'gg_dial_owner'))
    var how = 'party'
    try {
      tm.playerLoggedIn(fp, uuid, 'gg_dial_owner')
      tm.createPartyTeam(fp, 'gg_dial_party_' + String(uuid).substring(0, 8), '', K.Color4I.rgb(0x2266aa))
    } catch (e) {
      how = 'FTB Teams refused the fake player a party (' + errText(e) + ')'
    }
    var t = tm.getTeamForPlayerID(uuid)
    var teamId = t.isPresent() ? String(t.get().getId()) : null
    var party = t.isPresent() && t.get().isPartyTeam()
    S.owner = { uuid: String(uuid), team: teamId === null ? String(uuid) : teamId, party: party }
    check('party', teamId !== null && teamId !== String(uuid) && party, 'owner ' + S.owner.uuid + ' -> FTB team ' + teamId + ' (party ' + party + '; ' + how + ')')
    return uuid
  }

  function cleanup() {
    try {
      W().paused = true
      clear()
      command(SITE, 'forceload remove ' + X0 + ' 0 ' + X1 + ' 63')
      restoreNetwork()
      note('CLEANUP', 'band cleared, force-load released, the network\'s keys and dialCharge put back')
    } catch (e) {
      note('CLEANUP', 'could not clean up: ' + errText(e))
    }
  }
  function finish(phaseOne) {
    if (S === null || S.finished) return
    S.finished = true
    if (S.started) cleanup()
    leaveQueue()
    console.info(TAG + SCOPE + (phaseOne ? '|PHASE1|DONE|failures=' : '|DONE|failures=') + S.failed)
  }
  function begin(server) {
    S = { server: server, failed: 0, finished: false, started: false, phase: 'turn', queuedAt: Date.now(), tick: 0 }
    joinQueue()
  }
  function refusalKind() {
    var p = S.ctrl
    var r = HS().refusal(SITE, p.x, p.y, p.z)
    return r ? String(r.kind) : 'none'
  }

  // the crossing, with the real ending.js logic on the live entry and synthetic players inside its box
  function crossing(gate) {
    var e = E()
    var rec = e.load(S.server)
    var gates = HS().gates()
    var changed = e.update(gates, rec)
    var key = e.gateKey(gate)
    var r = rec[key]
    var b = gate.box
    var inside = { dim: SITE, x: (b.minX + b.maxX + 1) / 2, y: b.minY + 1, z: b.minZ + 0.5, ok: true }
    function who(id, team) { return { id: id, team: team, dim: inside.dim, x: inside.x, y: inside.y, z: inside.z, ok: true } }
    var team = S.owner.team
    var players = [who('gg-outsider', 'gg-other-team'), who('gg-member-1', team), who('gg-member-2', team)]
    var first = e.claim(gates, players, rec)
    if (first !== null) e.cross(rec, first.key, first.id, first.team)
    var second = e.claim(gates, players, rec)
    if (second !== null) e.cross(rec, second.key, second.id, second.team)
    var third = e.claim(gates, players, rec)
    var used = r ? Array.prototype.slice.call(r.used) : []
    check('crossing', changed && !!r && r.open === true && r.team === team && !!first && !!second && first.id === 'gg-member-1' && second.id === 'gg-member-2' && third === null &&
      used.length === 2, 'record ' + (r ? 'run ' + r.run + ', team ' + r.team + ' (want ' + team + '), used ' + used.join('/') : 'none') + '; claims ' + (first && first.id) + ', ' + (second && second.id) + ', then ' + (third && third.id))
    e.save(S.server)
    var st = new (Java.loadClass('net.minecraft.nbt.CompoundTag'))()
    st.putString('key', key)
    st.putString('team', team)
    st.putInt('run', Number(r ? r.run : -1))
    st.putString('x', String(inside.x))
    st.putString('y', String(inside.y))
    st.putString('z', String(inside.z))
    S.server.persistentData.remove(SAVED)
    S.server.persistentData.put(SAVED, st)
  }

  function step() {
    var m
    if (S.phase === 'turn') {
      if (!myTurn()) {
        if (Date.now() - S.queuedAt > TURN_TIMEOUT_MS) {
          check('TURN', false, 'no turn on the wireless network in ' + (TURN_TIMEOUT_MS / 1000) + ' s; queue ' + queueList().join(','))
          finish(true)
        }
        return
      }
      S.started = true
      saveNetwork()
      S.level = S.server.getLevel(SITE)
      command(SITE, 'forceload add ' + X0 + ' 0 ' + X1 + ' 63')
      clear()
      makeOwner()
      S.ctrl = place()
      S.at = S.tick
      S.phase = 'forming'
      return
    }
    var waited = S.tick - S.at
    m = machine()
    if (S.phase === 'forming') {
      if (!formCheck(m, waited)) {
        if (waited > FORM_TIMEOUT) {
          check('formed', false, m ? 'not formed: ' + why(m) : 'no controller')
          finish(true)
        }
        return
      }
      var hatches = partsLike(m, /max_wireless_energy_hatch_4096a/).length
      check('formed', hatches === 1, 'formed with ' + hatches + ' wireless hatch')
      m.setOwnerUUID(classes().UUID.fromString(S.owner.uuid))
      var ofm = String(T().ofMachine(m))
      check('owner', String(m.getOwnerUUID()) === S.owner.uuid && ofm === S.owner.team, 'GTM owner ' + m.getOwnerUUID() + ', ofMachine ' + ofm + ', FTB team ' + S.owner.team)
      topUp(m)
      S.fake.stored = String(W().big.sub(W().big.toBig(NEED), Number(hatchContainer(m).getEnergyStored()) + 1))
      feed(m)
      S.at = S.tick
      S.phase = 'refuse'
      return
    }
    if (S.phase === 'refuse') {
      topUp(m)
      S.fake.stored = String(W().big.sub(W().big.toBig(NEED), Number(hatchContainer(m).getEnergyStored()) + 1))
      if (waited < REFUSE_WAIT) return
      var working = m.getRecipeLogic().isWorking()
      var asked = S.asked.length > 0 && S.asked.every(function (t) { return t === S.owner.team })
      check('charge_team', !working && refusalKind() === 'charge' && asked, 'one EU short: working ' + working + ', refusal ' + refusalKind() + ', dialCharge asked for ' + S.asked.slice(0, 3).join(',') + ' x' + S.asked.length + ' (want ' + S.owner.team + ')')
      S.fake.stored = NEED
      S.at = S.tick
      S.phase = 'start'
      return
    }
    if (S.phase === 'start') {
      topUp(m)
      if (!m.getRecipeLogic().isWorking()) {
        if (waited > START_TIMEOUT) {
          check('entry_team', false, 'the covered dial did not start in ' + START_TIMEOUT + ' ticks; refusal ' + refusalKind())
          finish(true)
        }
        return
      }
      var p = S.ctrl
      var gate = HS().gateAt(SITE, p.x, p.y, p.z)
      var listed = HS().gates().filter(function (g) { return g.pos.x === p.x && g.pos.y === p.y && g.pos.z === p.z })
      check('entry_team', !!gate && gate.open === true && gate.team === S.owner.team && listed.length === 1 && listed[0].team === S.owner.team,
        'gate ' + (gate ? 'open ' + gate.open + ', team ' + gate.team : 'unknown') + ' (want ' + S.owner.team + '), gates() lists ' + listed.length)
      if (gate) crossing(gate)
      finish(true)
    }
  }

  // ---------------------------------------------------------------- leg 2, after a cold start
  function legTwo(server) {
    S = { server: server, failed: 0, finished: true, started: false }
    var st = server.persistentData.getCompound(SAVED)
    var key = String(st.getString('key'))
    var team = String(st.getString('team'))
    var run = Number(st.getInt('run'))
    if (key === '') {
      check('record_cold', false, 'no state of leg 1 in persistent data (leg 1 did not run or the save was lost)')
      console.info(TAG + SCOPE + '|DONE|failures=' + S.failed)
      return
    }
    var e = E()
    var rec = e.load(server)
    var r = rec[key]
    var used = r ? Array.prototype.slice.call(r.used) : []
    check('record_cold', !!r && Number(r.run) === run && r.team === team && r.open === true && used.length === 2 && used.indexOf('gg-member-1') >= 0 && used.indexOf('gg-member-2') >= 0,
      'after the restart: ' + (r ? 'run ' + r.run + ' (want ' + run + '), team ' + r.team + ' (want ' + team + '), open ' + r.open + ', used ' + used.join('/') : 'no record for ' + key))
    if (r) {
      var parts = key.split('|')
      var xyz = String(parts[1]).split(',')
      var gate = { dimension: parts[0], open: true, box: { minX: -1e9, maxX: 1e9, minY: -1e9, maxY: 1e9, minZ: -1e9, maxZ: 1e9 }, team: team, run: run, pos: { x: xyz[0], y: xyz[1], z: xyz[2] } }
      var body = function (id, t) { return { id: id, team: t, dim: parts[0], x: 0, y: 0, z: 0, ok: true } }
      var claimed = e.claim([gate], [body('gg-outsider', 'gg-other-team'), body('gg-member-1', team), body('gg-member-2', team)], rec)
      var fresh = e.claim([gate], [body('gg-member-3', team)], rec)
      check('record_claims', claimed === null && !!fresh && fresh.id === 'gg-member-3', 'after the restart: the outsider and both members still refused (' + (claimed && claimed.id) + '), another member of the team admitted (' + (fresh && fresh.id) + ')')
      delete rec[key]
      e.save(server)
    }
    server.persistentData.remove(SAVED)
    console.info(TAG + SCOPE + '|DONE|failures=' + S.failed)
  }

  ServerEvents.customCommand('gg_test_maxplus_dial', function () {
    if (S !== null && !S.finished) return 0
    global[REQUEST] = true
    return 1
  })
  ServerEvents.customCommand('gg_test_maxplus_dial_2', function () {
    global[REQUEST2] = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global[REQUEST2] && Date.now() - LOADED_AT >= 10000) {
        global[REQUEST2] = false
        legTwo(event.server)
        return
      }
      if (global[REQUEST] && Date.now() - LOADED_AT >= 10000) {
        global[REQUEST] = false
        begin(event.server)
      }
      if (S === null || S.finished) return
      S.tick++
      step()
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false, started: false }
      check('exception', false, errText(e))
      finish(false)
    }
  })
})()
