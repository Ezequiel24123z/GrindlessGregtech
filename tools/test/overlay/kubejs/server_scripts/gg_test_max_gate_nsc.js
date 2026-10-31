// priority: -5504
// TEST ONLY, MAX-T2 (gate c15). Commands: kubejs custom_command gg_test_max_gate_nsc, then @restart, then kubejs custom_command gg_test_max_gate_nsc_2
// (copied over the instance on the test PC, never shipped).
// Band ONLY: X 40024-40087, Z 0-63, Y 98-115, in the Overworld (the wireless tower) and gcyr:black_hole_orbit (the warp gate: the Sgr A* ring the
// c14 relay platform stands for). The only place outside the band is the arrival platform the pack's own poller places at X 64 Z 64 of the
// grindless:nsc_belt level; the test reads it and never writes there.
// The doubt it settles (docs/eras/max.md T2): from a gate standing at Sgr A* (a relay-reached place, so kerr_sling's second source), the c15 hold,
// 2^33 EU/t (V[OpV] x 16 A) for 1,200 t through two OpV 16 A wireless hatches, stays WORKING, consumes nsc_belt_seed, returns launched_belt_seed,
// and the arrival at grindless:nsc_belt gets its platform (warp gate ring controller at 64,100,64, mark uxvPlatform_nsc); after @restart the mark
// and the platform are still there. Source: the method of gg_test_max_gate_gc.js (the OpV tower holds two OpV cells, 2 x 16,106,127,360,000 EU,
// and the test charges 1.1 x (2^33 x 1,200) = 1.13e13 EU).
// Markers: GGTEST|max_gate_nsc|<name>|PASS|FAIL|NOTE, GGTEST|max_gate_nsc|PHASE1|DONE|failures=N, then (after the restart)
// GGTEST|max_gate_nsc|DONE|failures=N.
// Run: powershell -File tools\test\Invoke-GGTest.ps1 -Suite server -Commands 'kubejs custom_command gg_test_max_gate_nsc;;@restart:GGTEST\|max_gate_nsc\|PHASE1\|DONE;;kubejs custom_command gg_test_max_gate_nsc_2' -WaitForLog 'GGTEST\|max_gate_nsc\|DONE@@3000'
(function () {
  var NAME = 'max_gate_nsc'
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 40024
  var X1 = 40087
  var Y0 = 98
  var Y1 = 115
  var HOME = 'minecraft:overworld'
  var SGR = 'gcyr:black_hole_orbit'
  var DIMS = [HOME, SGR]
  var EUT = 8589934592
  var DURATION = 1200
  var CHARGE = Math.floor(EUT * DURATION * 1.1)
  var HOLD = 'grindless:warp_gate/hold_nsc_belt'
  var CIRCUIT = 'gtceu:programmed_circuit'
  var GATE_HATCH = 'gtceu:opv_wireless_energy_hatch_16a'
  var CELL = 'grindless:opv_smes_cell'
  var SEED = 'grindless:nsc_belt_seed'
  var LAUNCHED = 'grindless:launched_belt_seed'
  var MARK = 'uxvPlatform_nsc'
  var GATE_ORIGIN = { x: 40056, y: 100, z: 8 }
  var TOWER = { x: 40056, y: 100, z: 56 }
  var PLATFORM = { x: 64, y: 100, z: 64 }

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Helper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper')
    }
    return C
  }
  function errText(e) {
    var s = ''
    try { s = String(e.message || '') } catch (x) { }
    try { s += ' @' + String(e.stack || '').split('\n').slice(0, 3).join(' ') } catch (x) { }
    return s === '' ? 'unprintable exception' : s
  }
  function clean(x) { return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 1500) }
  function emit(name, status, detail) {
    console.info('GGTEST|' + NAME + '|' + name + '|' + status + (detail !== undefined && detail !== '' ? '|' + clean(detail) : ''))
  }
  function check(name, ok, detail) {
    if (!ok) S.failed++
    emit(name, ok ? 'PASS' : 'FAIL', detail)
    return ok
  }
  function note(name, detail) { emit(name, 'NOTE', detail) }
  function cmd(dim, text) { return Number(S.server.runCommandSilent('execute in ' + dim + ' run ' + text)) }
  function pos(x, y, z) { return new (classes().Pos)(x, y, z) }
  function at(dim, p) {
    var level = S.server.getLevel(dim)
    return level ? classes().Meta.getMachine(level, pos(p.x, p.y, p.z)) : null
  }
  function inBand(x, y, z) { return x >= X0 && x <= X1 && z >= 0 && z <= 63 && y >= Y0 && y <= Y1 }
  function put(dim, x, y, z, block) {
    if (!inBand(x, y, z)) throw new Error('refused: ' + x + ',' + y + ',' + z + ' is outside the band')
    cmd(dim, 'setblock ' + x + ' ' + y + ' ' + z + ' ' + block + ' replace')
  }
  function W() {
    var w = global.grindless && global.grindless.wireless
    if (!w || typeof w.settle !== 'function') throw new Error('global.grindless.wireless is missing or incomplete')
    return w
  }
  function recipe(id) {
    var found = S.server.getRecipeManager().byKey(new (classes().RL)(id))
    return found.isPresent() ? found.get() : null
  }
  function setBus(p, list) {
    var st = p.getInventory().storage
    for (var i = 0; i < st.getSlots(); i++) st.setStackInSlot(i, Item.of('minecraft:air'))
    var slot = 0
    list.forEach(function (e) { st.setStackInSlot(slot++, e.length > 2 ? Item.of(e[0], e[1], e[2]) : Item.of(e[0], e[1])) })
  }
  function contents(inv) {
    var out = []
    for (var i = 0; i < inv.getSlots(); i++) {
      var st = inv.getStackInSlot(i)
      if (!st.isEmpty()) out.push(String(st.getId()) + 'x' + st.getCount())
    }
    return out.join(' ') || 'empty'
  }
  function formCheck(m, waited) {
    if (m.isFormed()) return true
    if (waited >= 100 && waited % 50 === 0) {
      if (m.checkPatternWithLock()) { m.setFlipped(m.getMultiblockState().isNeededFlip()); m.onStructureFormed() }
    }
    return m.isFormed()
  }
  function why(m) { try { return String(m.getMultiblockState().error) } catch (e) { return 'unknown' } }

  function plain(sym) {
    if (sym.kind === 'blocks') return String(sym.blocks[0])
    if (sym.kind === 'frames') return 'gtceu:' + sym.materials[0] + '_frame'
    if (sym.kind === 'oneOf') {
      for (var i = 0; i < sym.options.length; i++) if (sym.options[i].kind === 'blocks') return String(sym.options[i].blocks[0])
    }
    throw new Error('unsupported structural symbol ' + sym.kind)
  }
  function allows(sym, ability) {
    return sym.kind === 'oneOf' && sym.options.some(function (o) { return o.kind === 'part' && o.ability === ability })
  }
  // lib/patterns.js's description: slices back -> front, rows bottom -> top; the controller faces north; parts go on the front wall by ability
  function buildGate(origin, parts) {
    var desc = global.grindless.structures['gtceu:warp_gate']
    if (!desc) throw new Error('missing structures entry gtceu:warp_gate')
    var ctl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var sym = desc.symbols[row.charAt(ci)]
          if (sym && sym.kind === 'controller') ctl = { si: si, ri: ri, ci: ci }
        }
      })
    })
    var plan = []
    var found = {}
    var next = 0
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var sym = desc.symbols[row.charAt(ci)]
          var p = { x: origin.x - (ci - ctl.ci), y: origin.y + ri - ctl.ri, z: origin.z - (si - ctl.si) }
          if (!sym || sym.kind === 'controller' || sym.kind === 'air' || sym.kind === 'any') continue
          var bid = null
          var facing = false
          if (si === ctl.si && next < parts.length && allows(sym, parts[next].ability)) {
            bid = parts[next].id
            found[parts[next].key] = p
            facing = true
            next++
          }
          plan.push({ p: p, id: bid || plain(sym), facing: facing })
        }
      })
    })
    if (next < parts.length) throw new Error('front wall has no slot for ' + parts[next].ability)
    plan.forEach(function (c) { put(SGR, c.p.x, c.p.y, c.p.z, c.id + (c.facing ? '[facing=north]' : '')) })
    put(SGR, origin.x, origin.y, origin.z, 'gtceu:warp_gate[facing=north]')
    return found
  }

  // the wireless tower: its slots hold two OpV cells, the rest casing (the pattern of gg_test_opv_gate.js)
  function placeTower(p) {
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
          put(HOME, p.x - (ci - ctrl.ci), p.y + (ri - ctrl.ri), p.z - (si - ctrl.si), id)
        }
      })
    })
    put(HOME, p.x, p.y, p.z, w.towerId + '[facing=north]')
    w.track(S.server.getLevel(HOME), pos(p.x, p.y, p.z))
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

  function arrivalDim() {
    var places = global.grindless.maxTravel && global.grindless.maxTravel.places
    return places && places.nsc ? String(places.nsc.dimension) : 'grindless:nsc_belt'
  }

  function statics() {
    var WG = global.grindless.warpGate
    var MN = global.grindless.maxGateNsc
    check('static_published', !!WG && !!WG.recipes && !!MN, 'global.grindless.warpGate and maxGateNsc')
    var row = WG.recipes.filter(function (r) { return r.name === 'hold_nsc_belt' })[0]
    check('static_c15_row', !!row && row.circuit === 15 && row.eut === EUT && row.duration === DURATION && row.site === 'sgr_a_orbit' &&
      row.itemsIn.length === 1 && row.itemsIn[0].id === SEED && row.kept.length === 0 &&
      row.itemsOut.length === 1 && row.itemsOut[0].id === LAUNCHED, JSON.stringify(row || null))
    var hold = recipe(HOLD)
    var seed = recipe('grindless:assembly_line/nsc_belt_seed')
    check('static_recipes', !!hold && !!seed && MN.skipped.length === 0 && (WG.skipped || []).length === 0 && (WG.clashes || []).length === 0,
      'hold ' + !!hold + ', seed ' + !!seed + '; skipped ' + JSON.stringify(MN.skipped.concat(WG.skipped || [])) + '; clashes ' + JSON.stringify(WG.clashes || []))
    S.arrival = arrivalDim()
    check('static_levels', !!S.server.getLevel(S.arrival) && !!S.server.getLevel(SGR), 'levels ' + SGR + ' and ' + S.arrival)
    check('static_relay_row', !!global.grindless.uxvKerrSling, 'uxvKerrSling published (its poll serves the Sgr A* source of the nsc row)')
  }

  function clearAll() {
    DIMS.forEach(function (dim) {
      for (var z = 0; z < 64; z += 8) cmd(dim, 'fill ' + X0 + ' ' + Y0 + ' ' + z + ' ' + X1 + ' ' + Y1 + ' ' + (z + 7) + ' minecraft:air')
    })
  }
  function release() { DIMS.forEach(function (dim) { cmd(dim, 'forceload remove ' + X0 + ' 0 ' + X1 + ' 63') }) }
  // phase 1 ends with the mark and the platform in place for the restart; only its own band, network and gate are put back
  function finish() {
    if (S.finished) return
    S.finished = true
    try { if (S.gate) S.gate.setWorkingEnabled(false) } catch (e) { }
    try { clearAll() } catch (e) { }
    release()
    try { restoreNetwork() } catch (e) { note('cleanup', 'network not restored: ' + errText(e)) }
    console.info('GGTEST|' + NAME + '|PHASE1|DONE|failures=' + S.failed)
  }

  function startGate() {
    var m = at(SGR, GATE_ORIGIN)
    if (!m || !formCheck(m, S.tick)) {
      if (S.tick > 600) { check('gate_formed', false, m ? 'not formed: ' + why(m) : 'no controller'); finish() }
      return false
    }
    S.gate = m
    var bus = at(SGR, S.gatePos.bus)
    var parts = m.getParts()
    var ok = !!bus && parts.contains(bus) && parts.contains(at(SGR, S.gatePos.e0)) && parts.contains(at(SGR, S.gatePos.e1)) && parts.contains(at(SGR, S.gatePos.out))
    check('gate_formed', ok, 'warp gate at Sgr A* with two OpV 16 A wireless hatches, OpV buses')
    if (!ok) { finish(); return false }
    W().track(S.server.getLevel(SGR), pos(S.gatePos.e0.x, S.gatePos.e0.y, S.gatePos.e0.z))
    W().track(S.server.getLevel(SGR), pos(S.gatePos.e1.x, S.gatePos.e1.y, S.gatePos.e1.z))
    setBus(bus, [[CIRCUIT, 1, '{Configuration:15}'], [SEED, 1]])
    S.gateBus = bus
    S.gateOut = at(SGR, S.gatePos.out)
    S.server.persistentData.remove(MARK)
    W().setStored(S.server, CHARGE)
    note('source_sum', 'network charged with ' + CHARGE + ' EU against 2^33 x ' + DURATION + ' = ' + (EUT * DURATION) + ' EU (1.1x); the hold draws ' + EUT + ' EU/t')
    m.getRecipeLogic().updateTickSubscription()
    return true
  }

  function stored() {
    var st = W().status ? W().status(S.server) : null
    return st && st.stored !== undefined ? Number(st.stored) : -1
  }

  function platformCheck() {
    var marked = S.server.persistentData.contains(MARK)
    var m = null
    try { m = classes().Meta.getMachine(S.server.getLevel(S.arrival), pos(PLATFORM.x, PLATFORM.y, PLATFORM.z)) } catch (e) { m = null }
    var ctrl = m ? String(m.getDefinition().getId()) : 'none'
    return { marked: marked, ctrl: ctrl, ok: marked && ctrl === 'gtceu:warp_gate' }
  }

  function step() {
    var w = W()
    S.tick++
    if (S.tick % Math.max(1, Number(w.settleTicks) || 20) === 0) {
      try { w.settle(S.server) } catch (e) { check('settle_exception', false, errText(e)); finish(); return }
    }
    if (S.phase === 'build') {
      if (startGate()) { S.phase = 'hold'; S.holdAt = S.tick }
      if (S.tick > 3500) { check('deadline', false, 'build phase did not finish'); finish() }
      return
    }
    if (S.phase === 'hold') {
      var logic = S.gate.getRecipeLogic()
      var elapsed = S.tick - S.holdAt
      var last = logic.getLastRecipe()
      if (!S.started) {
        if (String(logic.getStatus()) === 'WORKING' && last && String(last.id) === HOLD) {
          var eut = -1
          try { eut = Number(classes().Helper.getRealEUtWithIO(last).getTotalEU()) } catch (e) { eut = -1 }
          check('hold_eut', eut === EUT, 'recipe EU/t ' + eut + ' (row ' + EUT + ')')
          check('hold_duration', Number(last.duration) === DURATION, 'recipe duration ' + last.duration + ' (row ' + DURATION + ')')
          var bus = contents(S.gateBus.getInventory())
          check('hold_inputs', bus.indexOf('nsc_belt_seed') < 0, 'input bus ' + bus)
          S.started = true
          S.runAt = S.tick
          S.storedAtStart = stored()
        } else if (elapsed > 1200) {
          check('hold_start', false, 'the hold did not start: status ' + logic.getStatus() + ', reasons ' + logic.getFailureReasons() + ', bus ' + contents(S.gateBus.getInventory()))
          finish()
        }
        return
      }
      if (String(logic.getStatus()) !== 'WORKING' && S.tick - S.runAt < DURATION) {
        check('hold_long', false, 'stopped ' + (S.tick - S.runAt) + ' ticks into ' + DURATION + ': status ' + logic.getStatus() + ', reasons ' + logic.getFailureReasons() + ', network stored ' + stored())
        finish()
        return
      }
      if (S.tick - S.runAt >= DURATION + 40) {
        var out = contents(S.gateOut.getInventory())
        var inBus = contents(S.gateBus.getInventory())
        check('hold_long', true, 'WORKING through the whole run; network stored ' + S.storedAtStart + ' at the start, ' + stored() + ' at the end')
        check('launched_out', out.indexOf(LAUNCHED + 'x1') >= 0, 'output bus ' + out)
        check('seed_consumed', inBus.indexOf('nsc_belt_seed') < 0, 'input bus ' + inBus)
        S.phase = 'platform'
        S.platformAt = S.tick
      }
      return
    }
    if (S.phase === 'platform') {
      var p = platformCheck()
      if (p.ok) {
        check('platform_placed', true, 'warp gate ring at ' + S.arrival + ' ' + PLATFORM.x + ',' + PLATFORM.y + ',' + PLATFORM.z + ', mark ' + MARK)
        finish()
      } else if (S.tick - S.platformAt > 400) {
        check('platform_placed', false, 'no platform at ' + S.arrival + ': mark ' + p.marked + ', controller ' + p.ctrl)
        finish()
      }
    }
  }

  function begin(server) {
    S = { server: server, tick: 0, failed: 0, finished: false, phase: 'build' }
    DIMS.forEach(function (dim) {
      if (!server.getLevel(dim)) throw new Error('no level ' + dim)
      cmd(dim, 'forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    })
    clearAll()
    try { statics() } catch (e) { check('static_exception', false, errText(e)) }
    saveNetwork()
    try { placeTower(TOWER) } catch (e) { check('tower_exception', false, errText(e)) }
    try {
      S.gatePos = buildGate(GATE_ORIGIN, [
        { ability: 'input_bus', id: 'gtceu:opv_input_bus', key: 'bus' },
        { ability: 'output_bus', id: 'gtceu:opv_output_bus', key: 'out' },
        { ability: 'energy_input', id: GATE_HATCH, key: 'e0' },
        { ability: 'energy_input', id: GATE_HATCH, key: 'e1' }
      ])
    } catch (e) { check('gate_build', false, errText(e)); finish() }
  }

  // phase 2, after the cold start: the mark, the platform and the arrival level read back from disk; then the mark is removed
  function phase2(server) {
    S = { server: server, tick: 0, failed: 0, finished: true, phase: 'restart' }
    try {
      S.arrival = arrivalDim()
      var p = platformCheck()
      check('restart_mark', p.marked, 'persistent mark ' + MARK + ' after the restart')
      check('restart_platform', p.ctrl === 'gtceu:warp_gate', 'controller at ' + S.arrival + ' ' + PLATFORM.x + ',' + PLATFORM.y + ',' + PLATFORM.z + ': ' + p.ctrl)
      var m = classes().Meta.getMachine(server.getLevel(S.arrival), pos(PLATFORM.x, PLATFORM.y, PLATFORM.z))
      note('restart_formed', 'platform formed ' + (m ? m.isFormed() : 'no machine'))
    } catch (e) { check('restart_exception', false, errText(e)) }
    try { server.persistentData.remove(MARK) } catch (e) { }
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }

  ServerEvents.customCommand('gg_test_max_gate_nsc', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestMaxGateNscRequest = 1
    return 1
  })
  ServerEvents.customCommand('gg_test_max_gate_nsc_2', function () {
    global.ggTestMaxGateNscRequest = 2
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestMaxGateNscRequest && Date.now() - LOADED >= 10000) {
        var which = global.ggTestMaxGateNscRequest
        global.ggTestMaxGateNscRequest = 0
        if (which === 2) phase2(event.server)
        else begin(event.server)
      }
      if (S === null || S.finished) return
      step()
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
