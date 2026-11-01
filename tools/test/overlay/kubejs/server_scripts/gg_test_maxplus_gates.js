// priority: -5335
// TEST ONLY, XP-T2 (gate c17). Command: kubejs custom_command gg_test_maxplus_gates
// Band ONLY: X 47104-47167, Z 0-63, Y 98-115 of grindless:tarantula_orbit (30 Doradus; zones.json row maxplus_gates). The only place outside the band
// is the arrival platform the pack's own poller places at X 64 Z 64 of the grindless:magellanic_stream level; the test reads it and never writes there.
//   T1 (named uncertainty: a warp gate standing at a MAX+ place runs c17 at 2^37 EU/t on one 1,024 A MAX+ hatch and the Stream platform appears):
//     static    rows c17 to c19 (names, circuits, sites, EU/t, probe), nothing skipped, no clash; the hold recipes and the four levels exist
//     formed    the gate forms with one 1,024 A hatch and an OpV bus pair
//     eut       the hold starts as grindless:warp_gate/hold_magellanic_stream at 2^37 EU/t and the probe is consumed
//     platform  the poller places the warp gate ring at grindless:magellanic_stream 64,100,64 (mark uxvPlatform_magellanic_stream)
// c18 and c19 use the same mechanism and are checked statically.
(function () {
  var NAME = 'maxplus_gates'
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 47104
  var X1 = 47167
  var Y0 = 98
  var Y1 = 115
  var DIM = 'grindless:tarantula_orbit'
  var ARRIVAL = 'grindless:magellanic_stream'
  var EUT = 137438953472
  var DURATION = 1200
  var HOLD = 'grindless:warp_gate/hold_magellanic_stream'
  var CIRCUIT = 'gtceu:programmed_circuit'
  var HATCH = 'gtceu:max_maxplus_energy_hatch_1024a'
  var PROBE = 'grindless:ig_relay_probe'
  var MARK = 'uxvPlatform_magellanic_stream'
  var GATE_ORIGIN = { x: 47136, y: 100, z: 8 }
  var PLATFORM = { x: 64, y: 100, z: 64 }
  var ROWS = [
    { name: 'hold_magellanic_stream', circuit: 17, site: 'tarantula_orbit' },
    { name: 'hold_m31_nucleus', circuit: 18, site: 'tarantula_orbit' },
    { name: 'hold_local_group_filament', circuit: 19, site: 'm31_nucleus_orbit' }
  ]
  var LEVELS = ['grindless:tarantula_orbit', 'grindless:magellanic_stream', 'grindless:m31_nucleus_orbit', 'grindless:local_group_filament']

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
      Helper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper')
    }
    return C
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
  function cmd(text) { return S.server.runCommandSilent('execute in ' + DIM + ' run ' + text) }
  function pos(x, y, z) { return new (classes().Pos)(x, y, z) }
  function inBand(x, y, z) { return x >= X0 && x <= X1 && z >= 0 && z <= 63 && y >= Y0 && y <= Y1 }
  function put(x, y, z, block) {
    if (!inBand(x, y, z)) throw new Error('refused: ' + x + ',' + y + ',' + z + ' is outside the band')
    cmd('setblock ' + x + ' ' + y + ' ' + z + ' ' + block + ' replace')
  }
  function machineAt(p) { return classes().Meta.getMachine(S.level, pos(p.x, p.y, p.z)) }
  function itemId(s) { return String(classes().Registries.ITEMS.getKey(s.getItem())) }
  function contents(inv) {
    var out = []
    for (var i = 0; i < inv.getSlots(); i++) {
      var st = inv.getStackInSlot(i)
      if (!st.isEmpty()) out.push(itemId(st) + 'x' + st.getCount())
    }
    return out.join(' ') || 'empty'
  }
  function setBus(p, list) {
    var st = p.getInventory().storage
    for (var i = 0; i < st.getSlots(); i++) st.setStackInSlot(i, Item.of('minecraft:air'))
    var slot = 0
    list.forEach(function (e) { st.setStackInSlot(slot++, e.length > 2 ? Item.of(e[0], e[1], e[2]) : Item.of(e[0], e[1])) })
  }
  function topUp(p) { var c = p.energyContainer; c.setEnergyStored(c.getEnergyCapacity()) }
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
    plan.forEach(function (c) { put(c.p.x, c.p.y, c.p.z, c.id + (c.facing ? '[facing=north]' : '')) })
    put(origin.x, origin.y, origin.z, 'gtceu:warp_gate[facing=north]')
    return found
  }

  function statics() {
    var WG = global.grindless.warpGate
    check('static_published', !!WG && !!WG.recipes, 'global.grindless.warpGate')
    var bad = []
    ROWS.forEach(function (want) {
      var row = WG.recipes.filter(function (r) { return r.name === want.name })[0]
      var ok = !!row && row.circuit === want.circuit && row.eut === EUT && row.duration === DURATION && row.site === want.site &&
        row.itemsIn.length === 1 && row.itemsIn[0].id === PROBE && row.kept.length === 0
      if (!ok) bad.push(want.name + ': ' + JSON.stringify(row || null))
    })
    check('static_rows', bad.length === 0, bad.join(' ; ') || 'c17 to c19 on the probe at 2^37 EU/t, 1,200 t')
    check('static_clean', (WG.skipped || []).length === 0 && (WG.clashes || []).length === 0, 'skipped ' + JSON.stringify(WG.skipped || []) + '; clashes ' + JSON.stringify(WG.clashes || []))
    var rm = S.server.getRecipeManager()
    var missing = ROWS.map(function (r) { return 'grindless:warp_gate/' + r.name }).filter(function (id) { return !rm.byKey(new (classes().RL)(id)).isPresent() })
    check('static_recipes', missing.length === 0, 'missing: ' + (missing.join(', ') || 'none'))
    var gone = LEVELS.filter(function (d) { return !S.server.getLevel(d) })
    check('static_levels', gone.length === 0, 'missing levels: ' + (gone.join(', ') || 'none'))
  }

  function clear() {
    for (var z = 0; z < 64; z += 8) cmd('fill ' + X0 + ' ' + Y0 + ' ' + z + ' ' + X1 + ' ' + Y1 + ' ' + (z + 7) + ' minecraft:air')
  }
  function finish() {
    if (S.finished) return
    S.finished = true
    try { if (S.gate) S.gate.setWorkingEnabled(false) } catch (e) { }
    try { clear() } catch (e) { }
    cmd('forceload remove ' + X0 + ' 0 ' + X1 + ' 63')
    try { S.server.persistentData.remove(MARK) } catch (e) { }
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }

  function platformCheck() {
    var marked = S.server.persistentData.contains(MARK)
    var m = null
    try { m = classes().Meta.getMachine(S.server.getLevel(ARRIVAL), pos(PLATFORM.x, PLATFORM.y, PLATFORM.z)) } catch (e) { m = null }
    var ctrl = m ? String(m.getDefinition().getId()) : 'none'
    return { marked: marked, ctrl: ctrl, ok: marked && ctrl === 'gtceu:warp_gate' }
  }

  function step() {
    S.tick++
    if (S.phase === 'form') {
      var m = machineAt(GATE_ORIGIN)
      if (!m || !formCheck(m, S.tick)) {
        if (S.tick > 700) { check('gate_formed', false, m ? 'not formed: ' + why(m) : 'no controller'); finish() }
        return
      }
      var parts = m.getParts()
      var hatch = machineAt(S.gatePos.e)
      var bus = machineAt(S.gatePos.bus)
      var ok = !!hatch && !!bus && parts.contains(hatch) && parts.contains(bus) && String(hatch.getDefinition().getId()) === HATCH
      check('gate_formed', ok, 'warp gate at 30 Doradus with one 1,024 A MAX+ hatch and OpV buses')
      if (!ok) { finish(); return }
      S.gate = m
      S.hatch = hatch
      S.bus = bus
      S.server.persistentData.remove(MARK)
      topUp(hatch)
      setBus(bus, [[CIRCUIT, 1, '{Configuration:17}'], [PROBE, 1]])
      m.getRecipeLogic().updateTickSubscription()
      S.phase = 'hold'
      S.holdAt = S.tick
      return
    }
    topUp(S.hatch)
    var logic = S.gate.getRecipeLogic()
    if (S.phase === 'hold') {
      var last = logic.getLastRecipe()
      if (String(logic.getStatus()) === 'WORKING' && last && String(last.id) === HOLD) {
        var eut = -1
        try { eut = Number(classes().Helper.getRealEUtWithIO(last).getTotalEU()) } catch (e) { eut = -1 }
        check('hold_eut', eut === EUT, 'recipe EU/t ' + eut + ' (row ' + EUT + ')')
        check('hold_duration', Number(last.duration) === DURATION, 'recipe duration ' + last.duration + ' (row ' + DURATION + ')')
        check('probe_consumed', contents(S.bus.getInventory()).indexOf('ig_relay_probe') < 0, 'input bus ' + contents(S.bus.getInventory()))
        S.phase = 'platform'
        S.platformAt = S.tick
      } else if (S.tick - S.holdAt > 1200) {
        check('hold_start', false, 'the hold did not start: status ' + logic.getStatus() + ', reasons ' + logic.getFailureReasons() + ', bus ' + contents(S.bus.getInventory()))
        finish()
      }
      return
    }
    if (S.phase === 'platform') {
      var p = platformCheck()
      if (p.ok) {
        check('platform_placed', true, 'warp gate ring at ' + ARRIVAL + ' ' + PLATFORM.x + ',' + PLATFORM.y + ',' + PLATFORM.z + ', mark ' + MARK)
        finish()
      } else if (S.tick - S.platformAt > DURATION + 600) {
        check('platform_placed', false, 'no platform at ' + ARRIVAL + ': mark ' + p.marked + ', controller ' + p.ctrl + ', status ' + logic.getStatus())
        finish()
      }
    }
  }

  function begin(server) {
    S = { server: server, tick: 0, failed: 0, finished: false, phase: 'form' }
    S.level = server.getLevel(DIM)
    if (!S.level) throw new Error('no level ' + DIM)
    cmd('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    clear()
    try { statics() } catch (e) { check('static_exception', false, errText(e)) }
    try {
      S.gatePos = buildGate(GATE_ORIGIN, [
        { ability: 'input_bus', id: 'gtceu:opv_input_bus', key: 'bus' },
        { ability: 'output_bus', id: 'gtceu:opv_output_bus', key: 'out' },
        { ability: 'energy_input', id: HATCH, key: 'e' }
      ])
    } catch (e) { check('gate_build', false, errText(e)); finish() }
  }

  ServerEvents.customCommand('gg_test_maxplus_gates', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestMaxplusGatesRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestMaxplusGatesRequest && Date.now() - LOADED >= 10000) {
        global.ggTestMaxplusGatesRequest = false
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
