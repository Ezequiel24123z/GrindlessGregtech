// TEST ONLY, OpV-G1 (gate c13). Command: kubejs custom_command gg_test_opv_gate  (copied over the instance on the test PC, never shipped)
// Band ONLY: X 38656-38719, Z 0-63, Y 98-115, in three dimensions (the zone is global to X/Z): the Overworld (annihilation engines, the OpV cell
// tower), grindless:cygnus_x1_orbit (the warp gate and the Hawking collectors) and grindless:terzan5_core (the bulge collectors).
// Markers: GGTEST|opv_gate|<name>|PASS|FAIL|NOTE, then GGTEST|opv_gate|DONE|failures=N.
// The doubt it settles (docs/eras/opv.md "Gate to MAX", Power): the c13 hold, 2^33 EU/t for 1,200 t through two OpV 16 A wireless hatches of one
// case 13 network, fed by real generators at three places (two annihilation c2 at home, two Hawking c1 at Cygnus, two bulge c3 at Terzan 5), stays
// WORKING end to end, burns the Kugelblitz core and the launched bulge seed, keeps the six, returns grindless:sgr_a_chart; the casing's research
// recipe is in the recipe manager. The UXV BZ dynamo and the polar cap taps of the Power list are not built here (their machines are in
// no OpV package); the network starts with half the hold's energy so a shortfall of those never reads as a failure of the gate.
// Ids assumed from OpV batch 2 (skipped with a NOTE when missing): gtceu:annihilation_engine, gtceu:hawking_collector.
// Run: powershell -File tools\test\Invoke-GGTest.ps1 -Suite server -Commands 'kubejs custom_command gg_test_opv_gate' -WaitForLog 'GGTEST\|opv_gate\|DONE@@3000'
(function () {
  var NAME = 'opv_gate'
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 38656
  var X1 = 38719
  var Y0 = 98
  var Y1 = 115
  var HOME = 'minecraft:overworld'
  var CYG = 'grindless:cygnus_x1_orbit'
  var TERZ = 'grindless:terzan5_core'
  var DIMS = [HOME, CYG, TERZ]
  var CY = 106
  var EUT = 8589934592
  var DURATION = 1200
  var HOLD = 'grindless:warp_gate/hold_sgr_a'
  var CASING_RECIPE = 'grindless:assembly_line/max_machine_casing'
  var CIRCUIT = 'gtceu:programmed_circuit'
  var GATE_HATCH = 'gtceu:opv_wireless_energy_hatch_16a'
  var DYNAMO = 'gtceu:opv_wireless_dynamo_hatch_4a'
  var CELL = 'grindless:opv_smes_cell'
  var KEPT = [['grindless:bulge_light_census', 1], ['grindless:stable_exotic_matter', 1], ['grindless:tetron_array', 1],
    ['grindless:superheavy_census_iv', 1], ['grindless:bulge_chart', 1], ['gtnn:cosmic_mainframe', 4]]
  var GATE_ORIGIN = { x: 38688, y: 100, z: 8 }
  var TOWER = { x: 38688, y: 100, z: 56 }
  var SOURCES = [
    { name: 'annihilation_a', dim: HOME, machine: 'annihilation_engine', cx: 38666, z: 24, bus: [[CIRCUIT, 1, '{Configuration:2}'], ['grindless:acmf_pellet', 1], ['grindless:antiproton_stack_opv', 1], ['grindless:gamma_absorber_tile', 1]] },
    { name: 'annihilation_b', dim: HOME, machine: 'annihilation_engine', cx: 38710, z: 24, bus: [[CIRCUIT, 1, '{Configuration:2}'], ['grindless:acmf_pellet', 1], ['grindless:antiproton_stack_opv', 1], ['grindless:gamma_absorber_tile', 1]] },
    { name: 'hawking_a', dim: CYG, machine: 'hawking_collector', cx: 38666, z: 40, bus: [[CIRCUIT, 1, '{Configuration:1}'], ['grindless:stable_exotic_matter', 1], ['grindless:kugelblitz_core', 1], ['grindless:gamma_absorber_tile', 1]] },
    { name: 'hawking_b', dim: CYG, machine: 'hawking_collector', cx: 38710, z: 40, bus: [[CIRCUIT, 1, '{Configuration:1}'], ['grindless:stable_exotic_matter', 1], ['grindless:kugelblitz_core', 1], ['grindless:gamma_absorber_tile', 1]] },
    { name: 'bulge_a', dim: TERZ, machine: 'bulge_collector', cx: 38666, z: 32, bus: [[CIRCUIT, 1, '{Configuration:3}'], ['grindless:deployed_node_pack', 16]] },
    { name: 'bulge_b', dim: TERZ, machine: 'bulge_collector', cx: 38710, z: 32, bus: [[CIRCUIT, 1, '{Configuration:3}'], ['grindless:deployed_node_pack', 16]] }
  ]

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
  function array(collection) {
    var list = new (classes().ArrayList)(collection)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
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
  function at(dim, p) { return classes().Meta.getMachine(S.server.getLevel(dim), pos(p.x, p.y, p.z)) }
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
  function partsLike(ctrl, re) {
    return array(ctrl.getParts()).filter(function (p) { return re.test(String(p.getDefinition().getId())) })
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

  // a machine whose hatch slots are filled in order along the controller's wall: the one the OpV R3 test proved for the collector
  function place(u) {
    var desc = global.grindless.patterns.describe('gtceu:' + u.machine)
    if (!desc) throw new Error('no structure description for gtceu:' + u.machine)
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
    var xs = []
    cells.forEach(function (c) {
      c.x = u.cx - (c.ci - ctrl.ci)
      c.y = CY + (c.ri - ctrl.ri)
      c.z = u.z - (c.si - ctrl.si)
      if (c.sym.kind === 'oneOf') xs.push(c)
    })
    xs.sort(function (a, b) { return a.z - b.z || a.x - b.x })
    var parts = [DYNAMO, 'gtceu:hv_input_bus', 'gtceu:hv_output_bus']
    var chosen = {}
    var n = xs.length
    parts.forEach(function (id, i) { chosen[Math.floor(i * (n - 1) / (parts.length - 1))] = id })
    var idx = {}
    xs.forEach(function (c, i) { idx[c.x + ',' + c.y + ',' + c.z] = i })
    cells.forEach(function (c) {
      var sym = c.sym
      var block = null
      var part = false
      if (sym.kind === 'controller') { controller = { x: c.x, y: c.y, z: c.z }; return }
      if (sym.kind === 'blocks') block = sym.blocks[0]
      else if (sym.kind === 'frames') block = 'gtceu:' + sym.materials[0] + '_frame'
      else if (sym.kind === 'oneOf') {
        var pid = chosen[idx[c.x + ',' + c.y + ',' + c.z]]
        if (pid) { block = pid; part = true }
        else sym.options.forEach(function (o) { if (!block && o.kind === 'blocks') block = o.blocks[0] })
      }
      if (!block) return
      put(u.dim, c.x, c.y, c.z, block + (part ? '[facing=north]' : ''))
    })
    put(u.dim, controller.x, controller.y, controller.z, 'gtceu:' + u.machine + '[facing=north]')
    return controller
  }

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
    plan.forEach(function (c) { put(CYG, c.p.x, c.p.y, c.p.z, c.id + (c.facing ? '[facing=north]' : '')) })
    put(CYG, origin.x, origin.y, origin.z, 'gtceu:warp_gate[facing=north]')
    return found
  }

  // the wireless tower: its slots hold two OpV cells, the rest casing (the pattern of gg_test_opv_wireless.js)
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

  function statics() {
    var WG = global.grindless.warpGate
    var OG = global.grindless.opvGate
    check('static_published', !!WG && !!WG.recipes && !!OG, 'global.grindless.warpGate and opvGate')
    var row = WG.recipes.filter(function (r) { return r.name === 'hold_sgr_a' })[0]
    check('static_c13_row', !!row && row.circuit === 13 && row.eut === EUT && row.duration === DURATION && row.site === 'cygnus_x1_orbit' &&
      row.itemsIn.length === 2 && row.kept.length === 6 && row.itemsOut.length === 1 && row.itemsOut[0].id === 'grindless:sgr_a_chart', JSON.stringify(row || null))
    var hold = recipe(HOLD)
    var casing = recipe(CASING_RECIPE)
    check('static_recipes', !!hold && !!casing && OG.skipped.length === 0 && (WG.skipped || []).length === 0 && (WG.clashes || []).length === 0,
      'hold ' + !!hold + ', casing ' + !!casing + '; skipped ' + JSON.stringify(OG.skipped.concat(WG.skipped || [])) + '; clashes ' + JSON.stringify(WG.clashes || []))
  }

  function clearAll() {
    DIMS.forEach(function (dim) {
      for (var z = 0; z < 64; z += 8) cmd(dim, 'fill ' + X0 + ' ' + Y0 + ' ' + z + ' ' + X1 + ' ' + Y1 + ' ' + (z + 7) + ' minecraft:air')
    })
  }
  function finish() {
    if (S.finished) return
    S.finished = true
    try { if (S.gate) S.gate.setWorkingEnabled(false) } catch (e) { }
    try { clearAll() } catch (e) { }
    DIMS.forEach(function (dim) { cmd(dim, 'forceload remove ' + X0 + ' 0 ' + X1 + ' 63') })
    try { restoreNetwork() } catch (e) { note('cleanup', 'network not restored: ' + errText(e)) }
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }

  function tickSource(u) {
    var waited = S.tick - u.started
    var m = at(u.dim, u.pos)
    if (u.phase === 'forming') {
      if (!m || !formCheck(m, waited)) {
        if (waited > 600) { check(u.name + '_formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      u.m = m
      var dyn = partsLike(m, /opv_wireless_dynamo_hatch_4a/)
      var bus = partsLike(m, /input_bus/)[0]
      var ok = !!bus && dyn.length >= 1
      check(u.name + '_formed', ok, 'dynamo hatches ' + dyn.length + ', parts ' + array(m.getParts()).length)
      if (!ok) { u.phase = 'done'; return }
      dyn.forEach(function (d) { W().track(S.server.getLevel(u.dim), d.getPos()) })
      setBus(bus, u.bus)
      try { m.getRecipeLogic().updateTickSubscription() } catch (e) { }
      u.phase = 'ready'
    }
  }

  function startGate() {
    var m = at(CYG, GATE_ORIGIN)
    if (!m || !formCheck(m, S.tick - S.gateAt)) {
      if (S.tick - S.gateAt > 600) { check('gate_formed', false, m ? 'not formed: ' + why(m) : 'no controller'); finish() }
      return false
    }
    S.gate = m
    var bus = at(CYG, S.gatePos.bus)
    var parts = m.getParts()
    var ok = !!bus && parts.contains(bus) && parts.contains(at(CYG, S.gatePos.e0)) && parts.contains(at(CYG, S.gatePos.e1)) && parts.contains(at(CYG, S.gatePos.out))
    check('gate_formed', ok, 'warp gate with two OpV 16 A wireless hatches, OpV buses')
    if (!ok) { finish(); return false }
    W().track(S.server.getLevel(CYG), pos(S.gatePos.e0.x, S.gatePos.e0.y, S.gatePos.e0.z))
    W().track(S.server.getLevel(CYG), pos(S.gatePos.e1.x, S.gatePos.e1.y, S.gatePos.e1.z))
    var items = [['gtceu:programmed_circuit', 1, '{Configuration:13}'], ['grindless:kugelblitz_core', 1], ['grindless:launched_bulge_seed', 1]].concat(KEPT)
    setBus(bus, items)
    S.gateBus = bus
    S.gateOut = at(CYG, S.gatePos.out)
    W().setStored(S.server, EUT * 600)
    m.getRecipeLogic().updateTickSubscription()
    return true
  }

  function stored() {
    var st = W().status ? W().status(S.server) : null
    return st && st.stored !== undefined ? Number(st.stored) : -1
  }

  function step() {
    var w = W()
    S.tick++
    if (S.tick % Math.max(1, Number(w.settleTicks) || 20) === 0) {
      try { w.settle(S.server) } catch (e) { check('settle_exception', false, errText(e)); finish(); return }
    }
    if (S.phase === 'build') {
      S.units.forEach(function (u) { if (u.phase !== 'done') tickSource(u) })
      var pending = S.units.filter(function (u) { return u.phase === 'forming' }).length
      if (pending === 0 && !S.gateStarted) {
        S.gateStarted = startGate()
        if (S.gateStarted) { S.phase = 'hold'; S.holdAt = S.tick; S.units.forEach(function (u) { if (u.phase === 'ready') S.running++ }) }
      }
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
          check('hold_inputs', bus.indexOf('kugelblitz_core') < 0 && bus.indexOf('launched_bulge_seed') < 0, 'input bus ' + bus)
          S.started = true
          S.runAt = S.tick
          S.storedAtStart = stored()
          var live = S.units.filter(function (u) { return u.phase === 'ready' && u.m && u.m.getRecipeLogic().isWorking() }).length
          note('sources_running', live + ' of ' + SOURCES.length + ' sources working at the start')
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
        check('chart_out', out.indexOf('grindless:sgr_a_chartx1') >= 0, 'output bus ' + out)
        var kept = KEPT.every(function (k) { return inBus.indexOf(k[0] + 'x' + k[1]) >= 0 })
        check('six_kept', kept && inBus.indexOf('kugelblitz_core') < 0 && inBus.indexOf('launched_bulge_seed') < 0, 'input bus ' + inBus)
        var live = S.units.filter(function (u) { return u.phase === 'ready' && u.m && u.m.getRecipeLogic().isWorking() }).length
        check('sources_real', S.running >= 6, S.running + ' of ' + SOURCES.length + ' real sources formed; ' + live + ' still working at the end (BZ dynamo and polar cap taps not built)')
        finish()
      }
    }
  }

  function begin(server) {
    S = { server: server, tick: 0, failed: 0, finished: false, phase: 'build', units: [], running: 0, gateAt: 0 }
    DIMS.forEach(function (dim) {
      if (!server.getLevel(dim)) throw new Error('no level ' + dim)
      cmd(dim, 'forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    })
    clearAll()
    try { statics() } catch (e) { check('static_exception', false, errText(e)) }
    saveNetwork()
    try { placeTower(TOWER) } catch (e) { check('tower_exception', false, errText(e)) }
    SOURCES.forEach(function (src) {
      if (!Item.exists('gtceu:' + src.machine)) { note(src.name, 'skipped: gtceu:' + src.machine + ' is not in this base'); return }
      var u = { name: src.name, dim: src.dim, machine: src.machine, cx: src.cx, z: src.z, bus: src.bus, phase: 'forming', started: 0 }
      try {
        u.pos = place(u)
        S.units.push(u)
      } catch (e) { check(src.name + '_build', false, errText(e)) }
    })
    try {
      S.gatePos = buildGate(GATE_ORIGIN, [
        { ability: 'input_bus', id: 'gtceu:opv_input_bus', key: 'bus' },
        { ability: 'output_bus', id: 'gtceu:opv_output_bus', key: 'out' },
        { ability: 'energy_input', id: GATE_HATCH, key: 'e0' },
        { ability: 'energy_input', id: GATE_HATCH, key: 'e1' }
      ])
    } catch (e) { check('gate_build', false, errText(e)); finish() }
  }

  ServerEvents.customCommand('gg_test_opv_gate', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestOpvGateRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestOpvGateRequest && Date.now() - LOADED >= 10000) {
        global.ggTestOpvGateRequest = false
        begin(event.server)
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
