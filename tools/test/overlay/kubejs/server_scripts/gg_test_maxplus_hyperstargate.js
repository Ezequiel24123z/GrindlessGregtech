// priority: -5250
// TEST ONLY, XP-G1 (gtceu:hyperstargate). Command: kubejs custom_command gg_test_maxplus_hyperstargate
// Band ONLY: X 46912-46975, Z 0-63, Y 98-160 of gcyr:black_hole_orbit (Sgr A*) (zones.json row maxplus_hyperstargate). No startup overlay: the gate,
// its dial type and the spent charge are part of the pack.
//   T1 (named uncertainty: the run-start check refuses a dial the banks cannot cover and a broken ring, and lets a covered dial run at exactly 2^43 EU/t):
//     lookup    the controller row, the dial row and the recharge row are in the recipe manager
//     formed    the 41 x 43 x 9 gate forms with one 4,096 A MAX+ wireless hatch, an input bus pair and an output bus
//     refused   the network answers one EU short of a dial: no run, and the controller's refusal is 'charge'
//     eut       with the dial covered the run starts at exactly 2^43 EU/t for 1,200 t
//     open      the gate reads open while the dial runs (and its box is the 39 x 39 x 1 plane)
//     spent     the dial's end puts one spent charge in the output bus, keeps the horizon lock and reads closed again
//     broken    a ring block taken out: the next dial does not start (refused 'structure', or the machine unformed)
// The bank's capacity and the store are the network's own numbers in production; here W.dialCharge is replaced for the run by a fixed answer (put
// back at the end) so the check is tested against exact values without building a bank; the network's keys are put aside and the wireless queue
// (ggTestWirelessQueue) is shared with the other wireless fixtures. The hatch is topped up every tick: the run stands for the banks' supply.
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'maxplus_hyperstargate'
  var REQUEST = 'ggTestMaxplusHyperstargateRequest'
  var QUEUE = 'ggTestWirelessQueue'
  var TURN_TIMEOUT_MS = 180000
  var FORM_TIMEOUT = 1200
  var REFUSE_WAIT = 80
  var START_TIMEOUT = 400
  var END_TIMEOUT = 200
  var LOADED_AT = Date.now()
  var X0 = 46912
  var X1 = 46975
  var Y0 = 98
  var Y1 = 160
  var CX = 46943
  var CY = 100
  var CZ = 20
  var SITE = 'gcyr:black_hole_orbit'
  var MACHINE = 'gtceu:hyperstargate'
  var HATCH = 'gtceu:max_wireless_energy_hatch_4096a'
  var IN_BUS = 'gtceu:hv_input_bus'
  var OUT_BUS = 'gtceu:hv_output_bus'
  var SPENT = 'grindless:spent_dial_charge'
  var LOCK = 'grindless:horizon_lock'
  var DIAL_EUT = 8796093022208
  var DIAL_TICKS = 1200
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
      RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper')
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
    if (!h || typeof h.isOpen !== 'function') throw new Error('global.grindless.hyperstargate is not published')
    return h
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
    w.dialCharge = function () { return { bankCapacity: w.big.toBig(S.fake.capacity), stored: w.big.toBig(S.fake.stored) } }
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
    var counts = { ring: 0, chevron: 0 }
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
      if (block === 'grindless:hyperstargate_ring_block') counts.ring++
      if (block === 'grindless:hyperstargate_locked_chevron') counts.chevron++
      if (block !== null && block !== 'minecraft:air') put(x, y, z, block)
    })
    put(controller.x - 1, controller.y, controller.z, HATCH + '[facing=north]')
    put(controller.x - 2, controller.y, controller.z, IN_BUS + '[facing=north]')
    put(controller.x - 3, controller.y, controller.z, IN_BUS + '[facing=north]')
    put(controller.x + 1, controller.y, controller.z, OUT_BUS + '[facing=north]')
    put(controller.x, controller.y, controller.z, MACHINE + '[facing=north]')
    return { pos: controller, counts: counts }
  }

  function feed(m) {
    var buses = partsLike(m, /input_bus/)
    var st = buses[0].getInventory().storage
    for (var i = 0; i < st.getSlots(); i++) st.setStackInSlot(i, Item.of('minecraft:air'))
    FEED.forEach(function (f, i) { buses[i < 3 ? 0 : 1].getInventory().storage.setStackInSlot(i < 3 ? i : i - 3, Item.of(f[0], f[1])) })
  }
  function wipeOutput(m) {
    var st = partsLike(m, /output_bus/)[0].getInventory().storage
    for (var i = 0; i < st.getSlots(); i++) st.setStackInSlot(i, Item.of('minecraft:air'))
  }
  function countIn(m, id) {
    var n = 0
    array(m.getParts()).forEach(function (p) {
      try {
        var st = p.getInventory().storage
        for (var i = 0; i < st.getSlots(); i++) {
          var s = st.getStackInSlot(i)
          if (!s.isEmpty() && String(s.id) === id) n += Number(s.count)
        }
      } catch (e) { }
    })
    return n
  }
  function hatchContainer(m) { return partsLike(m, /max_wireless_energy_hatch_4096a/)[0].energyContainer }
  function topUp(m) {
    var ec = hatchContainer(m)
    var room = Number(ec.getEnergyCapacity()) - Number(ec.getEnergyStored())
    if (room > 0) ec.changeEnergy(room)
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
  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    if (S.started) cleanup()
    leaveQueue()
    console.info(TAG + SCOPE + '|DONE|failures=' + S.failed)
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

  function step() {
    var m
    if (S.phase === 'turn') {
      if (!myTurn()) {
        if (Date.now() - S.queuedAt > TURN_TIMEOUT_MS) {
          check('TURN', false, 'no turn on the wireless network in ' + (TURN_TIMEOUT_MS / 1000) + ' s; queue ' + queueList().join(','))
          finish()
        }
        return
      }
      S.started = true
      saveNetwork()
      var rm = S.server.getRecipeManager()
      var rows = ['grindless:hyper_assembly_array/hyperstargate', 'grindless:hyperstargate_dial/hyperstargate_dial', 'grindless:condensate_refinery/recharge_dial_charge']
      var found = rows.filter(function (id) { return rm.byKey(new (classes().RL)(id)).isPresent() })
      check('lookup', found.length === rows.length, 'rows found: ' + found.join(', '))
      S.level = S.server.getLevel(SITE)
      command(SITE, 'forceload add ' + X0 + ' 0 ' + X1 + ' 63')
      clear()
      var r = place()
      S.ctrl = r.pos
      S.counts = r.counts
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
          finish()
        }
        return
      }
      var hatches = partsLike(m, /max_wireless_energy_hatch_4096a/).length
      check('formed', hatches === 1 && S.counts.ring === 151 && S.counts.chevron === 9, 'formed; ' + S.counts.ring + ' ring blocks, ' + S.counts.chevron + ' chevrons, ' + hatches + ' wireless hatch')
      S.fake.stored = String(W().big.sub(W().big.toBig(NEED), Number(hatchContainer(m).getEnergyStored()) + 1))
      topUp(m)
      S.fake.stored = String(W().big.sub(W().big.toBig(NEED), Number(hatchContainer(m).getEnergyStored()) + 1))
      feed(m)
      S.at = S.tick
      S.phase = 'refuse'
      return
    }
    if (S.phase === 'refuse') {
      topUp(m)
      if (waited < REFUSE_WAIT) return
      var working = m.getRecipeLogic().isWorking()
      check('refused', !working && refusalKind() === 'charge', 'one EU short: working ' + working + ', refusal ' + refusalKind())
      S.fake.stored = NEED
      S.at = S.tick
      S.phase = 'start'
      return
    }
    if (S.phase === 'start') {
      topUp(m)
      if (!m.getRecipeLogic().isWorking()) {
        if (waited > START_TIMEOUT) {
          check('eut', false, 'the covered dial did not start in ' + START_TIMEOUT + ' ticks; refusal ' + refusalKind())
          finish()
        }
        return
      }
      var rec = m.getRecipeLogic().getLastRecipe()
      var eut = NaN
      var dur = NaN
      var id = ''
      try { eut = Number(classes().RecipeHelper.getRealEUtWithIO(rec).getTotalEU()) } catch (e) { }
      try { dur = Number(rec.duration); id = String(rec.id) } catch (e) { }
      check('eut', eut === DIAL_EUT && dur === DIAL_TICKS && /hyperstargate_dial/.test(id), 'recipe ' + id + ': EU/t ' + eut + ' (want ' + DIAL_EUT + '), duration ' + dur)
      var p = S.ctrl
      var b = HS().box(p, 'north')
      var gate = HS().gateAt(SITE, p.x, p.y, p.z)
      check('open', HS().isOpen(m) && !!gate && gate.open === true && b.maxX - b.minX === 38 && b.maxY - b.minY === 38 && b.maxZ === b.minZ,
        'isOpen ' + HS().isOpen(m) + ', gate ' + JSON.stringify(gate && gate.box))
      S.at = S.tick
      S.phase = 'run'
      return
    }
    if (S.phase === 'run') {
      topUp(m)
      if (waited === 60) m.getRecipeLogic().setProgress(DIAL_TICKS - 20)
      if (waited > 60 && !m.getRecipeLogic().isWorking()) {
        var spent = countIn(m, SPENT)
        var lock = countIn(m, LOCK)
        check('spent', spent === 1 && lock === 1 && !HS().isOpen(m), 'spent charges ' + spent + ', locks kept ' + lock + ', open ' + HS().isOpen(m))
        wipeOutput(m)
        feed(m)
        var q = S.ctrl
        put(q.x + 5, q.y + 1, q.z + 4, 'minecraft:air')
        S.at = S.tick
        S.phase = 'broken'
        return
      }
      if (waited > 60 + END_TIMEOUT) {
        check('spent', false, 'the dial did not finish ' + END_TIMEOUT + ' ticks after setProgress')
        finish()
      }
      return
    }
    if (S.phase === 'broken') {
      topUp(m)
      if (waited < REFUSE_WAIT) return
      var formed = m.isFormed()
      var running = formed && m.getRecipeLogic().isWorking()
      var kind = refusalKind()
      check('broken', !running && (!formed || kind === 'structure'), 'ring block removed: formed ' + formed + ', working ' + running + ', refusal ' + kind)
      finish()
    }
  }

  ServerEvents.customCommand('gg_test_maxplus_hyperstargate', function () {
    if (S !== null && !S.finished) return 0
    global[REQUEST] = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
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
      finish()
    }
  })
})()
