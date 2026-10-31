// priority: -6819
// TEST ONLY, OpV-E1 (gtceu:magnetic_pair_converter). Command: kubejs custom_command gg_test_opv_pair_converter
// Band ONLY: X 38208-38271, Z 0-63, Y 98-115, grindless:sgr1806_orbit (tools/test/zones.json: opv_pair_converter). It takes its turn
// on the wireless network with the other wireless fixtures (the queue ggTestWirelessQueue in global): a one-cell OpV SMES tower feeds
// the converter's own OpV wireless energy hatch; the cell's recipe waits on other packages, so the network's energy is set directly
// (W.setStored) and the settlement is paused and run by hand each tick (so the hatch charges without waiting on real time), then put
// back as it was.
//
//   T1 (named uncertainty, docs/eras/opv.md machine 12 / the zone note): the magnetic pair converter forms at SGR 1806-20 orbit with
//   no direct energy hatch, only an OpV wireless energy hatch, and circuit 1 (boil the seed plasma) starts and runs at 503,316,480
//   EU/t fed only by a case 13 network.
//     lookup    the loader built pair_converter's two rows with no clashes or skips; the older antimatter c5 (seed_plasma) and
//               electron beam c23 (positron_cell_seal) rows and the controller's assembly_line recipe are in the recipe manager
//     network   the tower's OpV SMES cell is tracked and the network reports it at tier 13
//     formed    the controller forms with exactly one OpV wireless energy hatch, one input bus and one output bus (no plain hatch)
//     c1_eut    circuit 1 starts fed by the wireless hatch alone and runs at 503,316,480 EU/t; the trap comes back in the output bus
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var NAME = 'opv_pair_converter'
  var DIM = 'grindless:sgr1806_orbit'
  var X0 = 38208
  var X1 = 38271
  var Z0 = 0
  var Z1 = 63
  var Y0 = 98
  var Y1 = 115
  var ID = 'gtceu:magnetic_pair_converter'
  var CX = 38240
  var CZ = 40
  var CY = 102
  var TOWER = { x: 38216, y: 100, z: 20 }
  var HATCH_ID = 'gtceu:opv_wireless_energy_hatch'
  var PARTS = ['gtceu:opv_input_bus', 'gtceu:opv_output_bus', 'gtceu:opv_input_hatch', 'gtceu:opv_output_hatch', HATCH_ID]
  var CIRCUIT = 'gtceu:programmed_circuit'
  var SEED = 'grindless:seed_positron_plasma'
  var LASER = 'grindless:gamma_laser_module'
  var EUT = 503316480
  var CELL_ID = 'grindless:opv_smes_cell'
  var CELL_EU = 16106127360000
  var OPV = 13
  var FORM_TIMEOUT = 600
  var CHARGE_TIMEOUT = 600
  var RUN_TIMEOUT = 1600
  var TURN_TIMEOUT_MS = 120000
  var SCOPE = 'opv_pair_converter'
  var QUEUE = 'ggTestWirelessQueue'
  var IDS = [
    'magnetic_pair_production/boil_seed_plasma', 'magnetic_pair_production/seal_positron_cell', 'assembly_line/magnetic_pair_converter',
    'positron_accumulation/seed_plasma', 'electron_beam_refining/positron_cell_seal'
  ]

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Helper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
      Registries: Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
    }
    return C
  }
  function array(collection) {
    var list = new (classes().ArrayList)(collection)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }
  function errText(e) {
    var s = ''
    try { s = String(e.message || '') } catch (x) { }
    try { s += ' @' + String(e.stack || '').split('\n').slice(0, 4).join(' ') } catch (x) { }
    return s === '' ? 'unprintable exception' : s
  }
  function clean(x) { return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 1500) }
  function check(name, ok, detail) {
    if (!ok) S.failed++
    console.info('GGTEST|' + NAME + '|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + clean(detail))
  }
  function note(name, detail) { console.info('GGTEST|' + NAME + '|' + name + '|NOTE|' + clean(detail)) }
  function command(text) { return S.server.runCommandSilent('execute in ' + DIM + ' run ' + text) }
  function pos(x, y, z) { return new (classes().Pos)(x, y, z) }
  function inBand(x, y, z) { return x >= X0 && x <= X1 && y >= Y0 && y <= Y1 && z >= Z0 && z <= Z1 }
  function put(x, y, z, block) {
    if (!inBand(x, y, z)) throw new Error('refused: ' + x + ',' + y + ',' + z + ' is outside the band')
    return command('setblock ' + x + ' ' + y + ' ' + z + ' ' + block + ' replace')
  }
  function machineAt(p) { return classes().Meta.getMachine(S.level, p) }
  function partsLike(ctrl, re) {
    var out = []
    array(ctrl.getParts()).forEach(function (p) { if (re.test(String(p.getDefinition().getId()))) out.push(p) })
    return out
  }
  function rl(id) { return new (classes().RL)(id) }

  // ---------------------------------------------------------------- the turn queue (shared with the other wireless fixtures)
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

  // ---------------------------------------------------------------- the wireless network (lv/wireless_energy.js)
  function W() {
    var w = global.grindless && global.grindless.wireless
    if (!w || typeof w.settle !== 'function' || typeof w.setStored !== 'function' || typeof w.track !== 'function') {
      throw new Error('global.grindless.wireless is missing or incomplete (lv/wireless_energy.js)')
    }
    return w
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
  }
  function restoreNetwork() {
    var w = W()
    var pd = S.server.persistentData
    Object.keys(S.savedKeys || {}).forEach(function (k) {
      pd.remove(k)
      var t = S.savedKeys[k]
      if (t !== null) pd.put(k, t)
    })
    w.dropCache()
    w.paused = S.wasPaused === true
  }

  // ---------------------------------------------------------------- the structure: template walk, oneOf cells take the parts
  // (spread evenly over the sorted cells; one each, the rest casing), the tower holds one OpV SMES cell
  function place() {
    var desc = global.grindless.patterns.describe(ID)
    if (!desc) throw new Error('no structure description for ' + ID)
    var cells = []
    var ctrl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var sym = desc.symbols[ch]
          if (sym.kind === 'controller') ctrl = { si: si, ri: ri, ci: ci }
          cells.push({ si: si, ri: ri, ci: ci, ch: ch, sym: sym })
        }
      })
    })
    var controller = null
    var xs = []
    cells.forEach(function (c) {
      c.x = CX - (c.ci - ctrl.ci)
      c.y = CY + (c.ri - ctrl.ri)
      c.z = CZ - (c.si - ctrl.si)
      if (c.sym.kind === 'oneOf') xs.push(c)
    })
    xs.sort(function (a, b) { return a.z - b.z || a.x - b.x })
    var chosen = {}
    var n = xs.length
    PARTS.forEach(function (id, i) { chosen[Math.floor(i * (n - 1) / (PARTS.length - 1))] = id })
    var idx = {}
    xs.forEach(function (c, i) { idx[c.x + ',' + c.y + ',' + c.z] = i })
    var hatchPos = null
    cells.forEach(function (c) {
      var sym = c.sym
      var block = null
      var part = false
      if (sym.kind === 'controller') { controller = { x: c.x, y: c.y, z: c.z }; return }
      if (sym.kind === 'blocks') block = sym.blocks[0]
      else if (sym.kind === 'frames') block = 'gtceu:' + sym.materials[0] + '_frame'
      else if (sym.kind === 'oneOf') {
        var pid = chosen[idx[c.x + ',' + c.y + ',' + c.z]]
        if (pid) { block = pid; part = true; if (pid === HATCH_ID) hatchPos = { x: c.x, y: c.y, z: c.z } }
        else sym.options.forEach(function (o) { if (!block && o.kind === 'blocks') block = o.blocks[0] })
      }
      if (!block) return
      put(c.x, c.y, c.z, block + (part ? '[facing=north]' : ''))
    })
    put(controller.x, controller.y, controller.z, ID + '[facing=north]')
    return { ctrl: pos(controller.x, controller.y, controller.z), hatch: hatchPos === null ? null : pos(hatchPos.x, hatchPos.y, hatchPos.z) }
  }

  // a tiny tower (controller facing north at p) holding one OpV SMES cell, the rest casing
  function towerPlace(p) {
    var w = W()
    var desc = global.grindless.patterns.describe(w.towerId)
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
    var placedCell = false
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
          else if (sym.kind === 'oneOf') id = placedCell ? w.casing : CELL_ID
          if (id === null) continue
          var x = p.x - (ci - ctrl.ci)
          var y = p.y + (ri - ctrl.ri)
          var z = p.z - (si - ctrl.si)
          put(x, y, z, id)
          if (sym.kind === 'oneOf' && !placedCell) placedCell = true
        }
      })
    })
    put(p.x, p.y, p.z, w.towerId + '[facing=north]')
    // /setblock fires no BlockEvents.placed: the tower is tracked by hand
    w.track(S.level, pos(p.x, p.y, p.z))
    return placedCell
  }

  function registrationChecks() {
    var PC = (global.grindless || {}).pairConverter
    var built = PC && PC.recipes ? Number(PC.recipes.length) : -1
    var skipped = PC && PC.skipped ? Number(PC.skipped.length) : -1
    var clashes = PC && PC.clashes ? Number(PC.clashes.length) : -1
    check('clashes', built === 2 && skipped === 0 && clashes === 0,
      'loader rows ' + built + ' (want 2), skipped ' + skipped + ', clashes ' + clashes)
    var rm = S.server.getRecipeManager()
    var missing = IDS.filter(function (i) { return !rm.byKey(rl('grindless:' + i)).isPresent() })
    check('lookup', missing.length === 0, IDS.length + ' ids checked; missing: ' + (missing.length ? missing.join(', ') : 'none'))
  }

  function liveRecipe(id) {
    var found = S.server.getRecipeManager().byKey(rl(id))
    return found.isPresent() ? found.get() : null
  }
  function eutOf(r) { return Number(classes().Helper.getRealEUt(r).getTotalEU()) }
  function setBus(p, list) {
    var st = p.getInventory().storage
    for (var i = 0; i < st.getSlots(); i++) st.setStackInSlot(i, Item.of('minecraft:air'))
    var slot = 0
    list.forEach(function (e) { st.setStackInSlot(slot++, e.length > 2 ? Item.of(e[0], e[1], e[2]) : Item.of(e[0], e[1])) })
  }
  function formCheck(m, waited) {
    if (m.isFormed()) return true
    if (waited >= 100 && waited % 50 === 0) {
      if (m.checkPatternWithLock()) { m.setFlipped(m.getMultiblockState().isNeededFlip()); m.onStructureFormed() }
    }
    return m.isFormed()
  }
  function why(m) { try { return String(m.getMultiblockState().error) } catch (e) { return 'unknown' } }
  function reasons(m) { return String(m.getRecipeLogic().getFailureReasons()) }

  function tick(u) {
    var waited = S.tick - u.started
    if (u.phase === 'forming') {
      var m = machineAt(u.pos)
      if (!m || !formCheck(m, waited)) {
        if (waited > FORM_TIMEOUT) { check('formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      u.m = m
      u.energy = partsLike(m, /energy_input|wireless_energy_hatch/)
      u.bus = partsLike(m, /input_bus/)[0]
      u.out = partsLike(m, /output_bus/)[0]
      u.fluidOut = partsLike(m, /output_hatch/)[0]
      var onlyWireless = u.energy.length === 1 && String(u.energy[0].getDefinition().getId()) === HATCH_ID
      var ok = !!u.bus && !!u.out && !!u.fluidOut && onlyWireless
      check('formed', ok, 'class ' + m.getClass().getSimpleName() + ', energy parts ' + u.energy.map(function (e) { return String(e.getDefinition().getId()) }).join(',') +
        ', parts ' + array(m.getParts()).length)
      if (!ok) { u.phase = 'done'; return }
      u.phase = 'charging'
      u.started = S.tick
      return
    }
    if (u.phase === 'charging') {
      var status = W().settle(S.server)
      if (status.up && Number(status.tier) === OPV) u.case13 = true
      var cap = Number(u.energy[0].energyContainer.getEnergyCapacity())
      var stored = Number(u.energy[0].energyContainer.getEnergyStored())
      // two ticks' worth is enough to start; the hatch keeps refilling from the network (W().settle()) every tick of the run too
      if (stored >= EUT * 2 || stored >= cap) {
        check('network', stored > 0 && u.case13 === true, 'case 13=' + u.case13 + '; the wireless hatch holds ' + stored + ' / ' + cap + ' EU after charging')
        setBus(u.bus, [[SEED, 1], [LASER, 1], [CIRCUIT, 1, '{Configuration:1}']])
        u.last = u.m.getRecipeLogic().getLastRecipe()
        u.started = S.tick
        u.phase = 'run'
        return
      }
      if (waited > CHARGE_TIMEOUT) {
        check('network', false, 'the wireless hatch only reached ' + stored + ' / ' + cap + ' EU in ' + CHARGE_TIMEOUT + ' ticks')
        u.phase = 'done'
      }
      return
    }
    if (u.phase === 'run') {
      W().settle(S.server)
      var rlg = u.m.getRecipeLogic()
      var rec = rlg.getLastRecipe()
      if (rec !== null && rec !== undefined && rec !== u.last) {
        var eut = NaN
        try { eut = eutOf(rec) } catch (e) { }
        note('c1_measured', 'recipe ' + String(rec.id) + ', EU/t ' + eut)
        var correct = eut === EUT && String(rec.id) === 'grindless:magnetic_pair_production/boil_seed_plasma'
        check('c1_eut', correct, 'expected ' + EUT + ' EU/t on boil_seed_plasma, got ' + eut + ' on ' + rec.id + '; reasons ' + reasons(u.m))
        u.phase = correct ? 'complete' : 'done'
      } else if (waited > RUN_TIMEOUT) {
        check('c1_eut', false, 'no recipe started in ' + RUN_TIMEOUT + ' ticks; reasons ' + reasons(u.m))
        u.phase = 'done'
      }
    }
    if (u.phase === 'complete') {
      W().settle(S.server)
      var tank = u.fluidOut.tank
      var amount = 0
      for (var i = 0; i < tank.getTanks(); i++) {
        var fluid = tank.getFluidInTank(i)
        if (!fluid.isEmpty() && String(classes().Registries.FLUID.getKey(fluid.getFluid())) === 'gtceu:hot_pair_plasma') amount += Number(fluid.getAmount())
      }
      if (amount > 0) {
        check('c1_complete', amount === 1000, 'wireless-powered c1 delivered ' + amount + ' mB hot pair plasma; trap return is independently chanced at 90%')
        u.phase = 'done'
      } else if (waited > RUN_TIMEOUT) {
        check('c1_complete', false, 'no hot pair plasma after ' + RUN_TIMEOUT + ' ticks; reasons ' + reasons(u.m))
        u.phase = 'done'
      }
    }
  }

  function clear() {
    for (var z = Z0; z <= Z1; z += 16) command('fill ' + X0 + ' ' + Y0 + ' ' + z + ' ' + X1 + ' ' + Y1 + ' ' + Math.min(z + 15, Z1) + ' air')
  }
  function finish() {
    if (S.finished) return
    S.finished = true
    try { clear() } catch (e) { }
    try { command('forceload remove ' + X0 + ' ' + Z0 + ' ' + X1 + ' ' + Z1) } catch (e) { }
    try { restoreNetwork() } catch (e) { note('cleanup', 'could not restore the network: ' + errText(e)) }
    leaveQueue()
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  function begin(server) {
    S = { server: server, tick: 0, failed: 0, finished: false }
    S.level = server.getLevel(DIM)
    if (!S.level) { S.finished = true; check('dimension', false, DIM + ' is not a loaded level'); console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed); return }
    command('forceload add ' + X0 + ' ' + Z0 + ' ' + X1 + ' ' + Z1)
    clear()
    try { registrationChecks() } catch (e) { check('registration_exception', false, errText(e)) }
    S.units = []
    try {
      saveNetwork()
      var cellPlaced = towerPlace(TOWER)
      W().setStored(S.server, CELL_EU)
      var built = place()
      if (built.hatch !== null) W().track(S.level, built.hatch)
      check('network', cellPlaced, cellPlaced ? 'tower placed with one ' + CELL_ID : 'the tower had no oneOf cell slot for the cell')
      var u = { phase: 'forming', started: S.tick, pos: built.ctrl }
      S.units.push(u)
    } catch (e) { check('build_exception', false, errText(e)) }
  }
  ServerEvents.customCommand('gg_test_opv_pair_converter', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestOpvPairConverterRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestOpvPairConverterRequest && Date.now() - LOADED >= 10000) {
        if (S !== null && !S.finished && !S.queuedAt) return
        joinQueue()
        if (!myTurn()) {
          if (S === null) S = { server: event.server, tick: 0, failed: 0, finished: false, queuedAt: Date.now() }
          if (Date.now() - (S.queuedAt || Date.now()) > TURN_TIMEOUT_MS) {
            check('turn', false, 'no turn on the wireless network in ' + (TURN_TIMEOUT_MS / 1000) + ' s; queue ' + queueList().join(','))
            leaveQueue()
            console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
            global.ggTestOpvPairConverterRequest = false
            S.finished = true
          }
          return
        }
        global.ggTestOpvPairConverterRequest = false
        begin(event.server)
      }
      if (S === null || S.finished) return
      S.tick++
      var pending = 0
      S.units.forEach(function (u) {
        if (u.phase === 'done') return
        try { tick(u) } catch (e) { check('exception', false, 'phase ' + u.phase + ': ' + errText(e)); u.phase = 'done' }
        if (u.phase !== 'done') pending++
      })
      if (pending === 0) finish()
      else if (S.tick > 3000) { check('deadline', false, '3000-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
