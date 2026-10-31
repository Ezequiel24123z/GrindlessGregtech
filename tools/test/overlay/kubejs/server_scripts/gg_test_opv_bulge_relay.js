// priority: -6424
// TEST ONLY, OpV-A0. Command: kubejs custom_command gg_test_opv_bulge_relay, sent twice: before and after one @restart.
// Markers: GGTEST|opv_bulge_relay|PHASE1|DONE (leg 1 is done: restart now), then GGTEST|opv_bulge_relay|DONE|failures=N (leg 2).
// Band ONLY: X 37824-37887, Z 0-63, Y 98-115, in grindless:cygnus_x1_orbit. The far platform is kerr_sling.js's (grindless:sgr1806_orbit at
// 64,100,64); this test only drops its chunk tickets. Leg 1 keeps its blocks and tickets for leg 2 (persistent data ggTestOpvBulgeRelay), which
// removes them before DONE.
// Doubt: the c11 throw survives a restart. The gate keeps its runs only in memory; bulge_relay.js keeps the c11 run in persistent data and gives it
// back once on the next boot, so kerr_sling.js still places the SGR 1806-20 platform when the run has lasted its time.
//   leg 1  static_*  the c11 row, the seed and hull recipes, the chain strand wire (16 A at V[OpV], no loss)
//          formed    one warp gate with two UXV 16 A energy hatches and UXV buses forms in Cygnus X-1's orbit
//          hold      the gate runs grindless:warp_gate/hold_sgr1806 at 2,147,483,648 EU/t, the seed is spent and the bulge chart is not
//          kept      bulge_relay.js keeps the run (opvBulgeHold); 1,500 ticks into the 2,400 there is no platform yet; PHASE1
//   leg 2  the gate still holds the c11 recipe after the restart, bulge_relay.js gave the run back, the platform is placed and its far ring formed,
//          the hold is released, the launched seed reaches the output bus and the bulge chart stays in the input bus.
// Not covered here: the four UXV pasta machines running the chain rows at SGR (gg_test_opv_chain_matter, same band, in grindless:sgr1806_orbit).
(function () {
  var REQUEST = 'ggTestOpvBulgeRelayRequest'
  var STATE = 'ggTestOpvBulgeRelay'
  var NAME = 'opv_bulge_relay'
  var LOADED_AT = Date.now()
  var S = null
  var J = null
  var P = undefined // leg 2: the state leg 1 saved, read once a boot
  var BAND = { x0: 37824, x1: 37887, y0: 98, y1: 115, z0: 0, z1: 63 }
  var SOURCE = 'grindless:cygnus_x1_orbit'
  var FAR = 'grindless:sgr1806_orbit'
  var FARO = { x: 64, y: 100, z: 64 }
  var GATE = 'gtceu:warp_gate'
  var HOLD = 'grindless:warp_gate/hold_sgr1806'
  var SEED_RECIPE = 'grindless:assembly_line/bulge_relay_seed'
  var HULL_RECIPE = 'grindless:assembly_line/opv_machine_hull'
  var EUT = 2147483648
  var DURATION = 2400
  var RESTART_AT = 1500
  var ORIGIN = { x: 37856, y: 100, z: 10 }
  var SEED = 'grindless:bulge_relay_seed'
  var CHART = 'grindless:bulge_chart'
  var LAUNCHED = 'grindless:launched_bulge_seed'
  var PLATFORM_KEY = 'uxvPlatform_sgr1806'
  var GATE_KEY = SOURCE + '|' + ORIGIN.x + '|' + ORIGIN.y + '|' + ORIGIN.z

  function emit(name, status, detail) {
    console.info('GGTEST|' + NAME + '|' + name + '|' + status + (detail ? '|' + String(detail).replace(/[\r\n|]+/g, ' ').substring(0, 1500) : ''))
  }
  function check(name, ok, detail) {
    if (!ok) S.failed++
    emit(name, ok ? 'PASS' : 'FAIL', detail)
    return ok
  }
  function lazy() {
    if (J === null) J = {
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Machine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour'),
      Key: Java.loadClass('com.gregtechceu.gtceu.api.data.chemical.material.properties.PropertyKey')
    }
    return J
  }
  function rl(id) { return new (lazy().RL)(id) }
  function atIn(level, p) { return lazy().Machine.getMachine(level, new (lazy().Pos)(p.x, p.y, p.z)) }
  function at(p) { return atIn(S.level, p) }
  function cmdIn(server, dim, text) { return Number(server.runCommandSilent('execute in ' + dim + ' run ' + text)) }
  function cmd(text) { return cmdIn(S.server, SOURCE, text) }
  function byId(id) {
    var found = S.server.getRecipeManager().byKey(rl(id))
    return found.isPresent() ? found.get() : null
  }
  function inside(p) {
    if (p.x < BAND.x0 || p.x > BAND.x1 || p.y < BAND.y0 || p.y > BAND.y1 || p.z < BAND.z0 || p.z > BAND.z1) {
      throw new Error('out-of-band coordinate ' + JSON.stringify(p))
    }
  }
  function key(p) { return p.x + ',' + p.y + ',' + p.z }
  function block(p) { return String(S.level.getBlock(p.x, p.y, p.z).id) }
  function grow(p) {
    var b = S.box
    if (!b) { S.box = { x0: p.x, x1: p.x, y0: p.y, y1: p.y, z0: p.z, z1: p.z }; return }
    b.x0 = Math.min(b.x0, p.x); b.x1 = Math.max(b.x1, p.x)
    b.y0 = Math.min(b.y0, p.y); b.y1 = Math.max(b.y1, p.y)
    b.z0 = Math.min(b.z0, p.z); b.z1 = Math.max(b.z1, p.z)
  }
  function ticket(p) {
    var x = Math.floor(p.x / 16) * 16
    var z = Math.floor(p.z / 16) * 16
    var k = x + ',' + z
    if (S.chunks[k]) return
    S.chunks[k] = true
    S.level.getChunk(x >> 4, z >> 4)
    if (cmd('forceload query ' + x + ' ' + z) > 0) return
    S.tickets.push({ x: x, z: z })
    if (cmd('forceload add ' + x + ' ' + z) < 1) throw new Error('cannot acquire chunk ticket ' + k)
  }
  function put(p, id, facing) {
    inside(p)
    ticket(p)
    var k = key(p)
    if (!S.owned[k]) {
      if (block(p) !== 'minecraft:air') throw new Error('refusing to replace unowned block at ' + k)
      S.owned[k] = true
      grow(p)
    }
    cmd('setblock ' + p.x + ' ' + p.y + ' ' + p.z + ' ' + id + (facing ? '[facing=north]' : '') + ' replace')
    if (block(p) !== id) throw new Error('setblock did not place ' + id + ' at ' + k)
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
  // lib/patterns.js's description: slices back -> front, rows bottom -> top; the controller faces north, the body runs to +z
  function build(id, origin, parts) {
    var desc = S.G.structures[id]
    if (!desc) throw new Error('missing G.structures entry ' + id)
    var ctl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var sym = desc.symbols[row.charAt(ci)]
          if (sym && sym.kind === 'controller') ctl = { si: si, ri: ri, ci: ci }
        }
      })
    })
    if (!ctl) throw new Error('no controller in ' + id)
    var plan = []
    var pos = {}
    var next = 0
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var sym = desc.symbols[row.charAt(ci)]
          var p = { x: origin.x - (ci - ctl.ci), y: origin.y + ri - ctl.ri, z: origin.z - (si - ctl.si) }
          inside(p)
          ticket(p)
          if (block(p) !== 'minecraft:air') throw new Error('structure footprint is occupied at ' + key(p))
          if (!sym || sym.kind === 'controller' || sym.kind === 'air' || sym.kind === 'any') continue
          var bid = null
          var facing = false
          if (si === ctl.si && next < parts.length && allows(sym, parts[next].ability)) {
            bid = parts[next].id
            pos[parts[next].key] = p
            facing = true
            next++
          }
          plan.push({ p: p, id: bid || plain(sym), facing: facing })
        }
      })
    })
    if (next < parts.length) throw new Error('front wall has no slot for ' + parts[next].ability)
    plan.forEach(function (c) { put(c.p, c.id, c.facing) })
    put(origin, id, true)
    return pos
  }
  function contents(inv) {
    var out = []
    for (var i = 0; i < inv.getSlots(); i++) {
      var st = inv.getStackInSlot(i)
      if (!st.isEmpty()) out.push(String(st.getId()) + 'x' + st.getCount())
    }
    return out.join(' ') || 'empty'
  }
  function phase(name) {
    S.phase = name
    S.phaseAt = S.tick
    emit('stage', 'NOTE', name)
  }
  function fillAt(level, pos) {
    ;['e0', 'e1'].forEach(function (k) {
      var m = pos && pos[k] ? atIn(level, pos[k]) : null
      if (m) m.energyContainer.setEnergyStored(m.energyContainer.getEnergyCapacity())
    })
  }
  function fill() { fillAt(S.level, S.pos) }
  function why() {
    var out = []
    var c = S.ctrl
    try { out.push('status ' + c.getRecipeLogic().getStatus() + ' reason ' + c.getRecipeLogic().getFancyTooltip()) } catch (x) { out.push('tooltip: ' + x) }
    try { out.push('bus ' + contents(at(S.pos.bus).getInventory())) } catch (x) { out.push('bus: ' + x) }
    return out.join(' ; ')
  }
  function lastId() {
    var r = S.ctrl.getRecipeLogic().getLastRecipe()
    return r ? String(r.id) : 'none'
  }

  // ---------------------------------------------------------------- leg 1
  function statics() {
    var WG = S.G.warpGate
    var B = S.G.opvBulgeRelay
    if (!check('static_published', !!WG && !!WG.recipes && !!B, 'global.grindless.warpGate and opvBulgeRelay')) throw new Error('not published')
    var row = WG.recipes.filter(function (r) { return r.name === 'hold_sgr1806' })[0]
    check('static_hold_row', !!row && row.circuit === 11 && row.eut === EUT && row.duration === DURATION && row.site === 'cygnus_x1_orbit' &&
      row.itemsIn.length === 1 && row.itemsIn[0].id === SEED && row.kept.length === 1 && row.kept[0].id === CHART && row.itemsOut.length === 1 &&
      row.itemsOut[0].id === LAUNCHED, JSON.stringify(row || null))
    var missing = [HOLD, SEED_RECIPE, HULL_RECIPE].filter(function (id) { return byId(id) === null })
    check('static_recipes', missing.length === 0 && B.skipped.length === 0 && (WG.skipped || []).length === 0 && (WG.clashes || []).length === 0,
      'missing ' + (missing.join(' ') || 'none') + '; skipped ' + JSON.stringify(B.skipped.concat(WG.skipped || [])) + '; clashes ' + JSON.stringify(WG.clashes || []))
    var detail = 'no material'
    var ok = false
    try {
      var m = GTMaterials.get('chain_strand')
      var w = m && !m.isNull() ? m.getProperty(lazy().Key.WIRE) : null
      if (w) {
        var v = Number(w.getVoltage()), a = Number(w.getAmperage()), loss = Number(w.getLossPerBlock())
        ok = v === 536870912 && a === 16 && loss === 0 && Item.exists('gtceu:chain_strand_single_cable')
        detail = 'voltage ' + v + ', amperage ' + a + ', loss/block ' + loss + ', cable item ' + Item.exists('gtceu:chain_strand_single_cable')
      } else detail = 'no wire property on ' + m
    } catch (e) { detail = String(e) }
    check('static_chain_strand', ok, detail)
    check('static_fresh_world', !S.server.persistentData.contains(PLATFORM_KEY) && !S.server.persistentData.contains('opvBulgeHold'),
      'no SGR platform and no kept c11 run before the test')
  }
  function load() {
    var ctrl = at(ORIGIN)
    if (!ctrl || !ctrl.isFormed()) return false
    S.ctrl = ctrl
    var bus = at(S.pos.bus)
    var parts = ctrl.getParts()
    check('formed', !!bus && parts.contains(bus) && parts.contains(at(S.pos.e0)) && parts.contains(at(S.pos.e1)) && parts.contains(at(S.pos.out)),
      'GTM formed the gate in ' + SOURCE)
    bus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(11))
    var inv = bus.getInventory()
    inv.setStackInSlot(0, Item.of(SEED, 1))
    inv.setStackInSlot(1, Item.of(CHART, 1))
    fill()
    ctrl.getRecipeLogic().updateTickSubscription()
    return true
  }
  function save() {
    var st = { leg: 2, pos: S.pos, box: S.box, tickets: S.tickets }
    S.server.persistentData.putString(STATE, JSON.stringify(st))
  }
  function step1() {
    var elapsed = S.tick - S.phaseAt
    if (S.phase === 'form') {
      if (load()) phase('hold')
      else if (elapsed > 400) throw new Error('the gate did not form')
      return
    }
    fill()
    var logic = S.ctrl.getRecipeLogic()
    if (S.phase === 'hold') {
      var last = logic.getLastRecipe()
      if (String(logic.getStatus()) === 'WORKING' && last && String(last.id) === HOLD) {
        var tickEut = -1
        try { tickEut = Number(Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper').getRealEUtWithIO(last).getTotalEU()) } catch (e) { tickEut = -1 }
        check('hold_eut', tickEut === EUT, 'recipe EU/t ' + tickEut + ' (row ' + EUT + ')')
        check('hold_duration', Number(last.duration) === DURATION, 'recipe duration ' + last.duration + ' ticks (row ' + DURATION + ')')
        var bus = contents(at(S.pos.bus).getInventory())
        check('hold_inputs', bus.indexOf(SEED) < 0 && bus.indexOf(CHART + 'x1') >= 0, 'input bus ' + bus)
        S.runStart = S.tick
        phase('kept')
      } else if (elapsed > 300) throw new Error('the hold did not start: ' + why())
      return
    }
    if (S.phase === 'kept') {
      var data = S.server.persistentData
      if (data.contains('opvBulgeHold')) {
        var v = String(data.getString('opvBulgeHold'))
        check('hold_kept', v.indexOf(GATE_KEY + '|') === 0, 'opvBulgeHold = ' + v)
        phase('run')
      } else if (elapsed > 100) {
        check('hold_kept', false, 'no opvBulgeHold ' + elapsed + ' ticks into the run; gates ' + JSON.stringify(Object.keys(S.G.warpGate.gates)))
        finish()
      }
      return
    }
    if (S.phase === 'run') {
      if (String(logic.getStatus()) !== 'WORKING') {
        check('hold_running', false, 'stopped ' + (S.tick - S.runStart) + ' ticks into the run: ' + why())
        finish()
        return
      }
      if (S.tick - S.runStart >= RESTART_AT) {
        check('no_platform_yet', !S.server.persistentData.contains(PLATFORM_KEY), (S.tick - S.runStart) + ' ticks into ' + DURATION)
        save()
        emit('restart', 'NOTE', 'leg 1 kept ' + S.tickets.length + ' tickets and the box ' + JSON.stringify(S.box) + '; failures so far ' + S.failed)
        console.info('GGTEST|' + NAME + '|PHASE1|DONE')
        phase('restart')
      }
    }
    // 'restart': keep the hatches full until the server stops
  }

  // ---------------------------------------------------------------- leg 2
  function saved(server) {
    if (P !== undefined) return P
    P = null
    try {
      if (server.persistentData.contains(STATE)) {
        var st = JSON.parse(String(server.persistentData.getString(STATE)))
        if (st && st.leg === 2) P = st
      }
    } catch (e) { console.error('[gg_test] ' + NAME + ': bad ' + STATE + ': ' + e) }
    return P
  }
  function step2() {
    var elapsed = S.tick - S.phaseAt
    fill()
    var B = S.G.opvBulgeRelay
    if (S.phase === 'restored') {
      if (B.restored) {
        check('last_recipe_kept', lastId() === HOLD, 'the gate\'s last recipe after the restart: ' + lastId())
        check('run_given_back', String(B.restored).indexOf(GATE_KEY + '|') === 0, 'opvBulgeRelay.restored = ' + B.restored)
        phase('platform')
      } else if (elapsed > 200) {
        check('run_given_back', false, 'nothing given back; opvBulgeHold ' + S.server.persistentData.getString('opvBulgeHold') + '; last ' + lastId())
        finish()
      }
      return
    }
    if (S.phase === 'platform') {
      if (S.server.persistentData.contains(PLATFORM_KEY)) {
        if (S.platformAt === undefined) S.platformAt = S.tick
        if (S.tick - S.platformAt < 40) return
        var row = String(S.server.persistentData.getString(PLATFORM_KEY))
        check('platform_row', row === FAR + '@' + FARO.x + ',' + FARO.y + ',' + FARO.z, PLATFORM_KEY + ' = ' + row)
        var m = atIn(S.server.getLevel(FAR), FARO)
        check('platform_ring_formed', !!m && m.isFormed(), 'far ring in ' + FAR + ': ' + (m ? 'formed ' + m.isFormed() : 'no controller block entity'))
        check('hold_released', !S.server.persistentData.contains('opvBulgeHold') && B.hold === null, 'opvBulgeHold ' +
          S.server.persistentData.getString('opvBulgeHold') + ', hold ' + JSON.stringify(B.hold))
        phase('output')
      } else if (elapsed > DURATION) {
        check('platform_row', false, 'no ' + PLATFORM_KEY + ' after ' + elapsed + ' ticks; ' + why())
        finish()
      }
      return
    }
    if (S.phase === 'output') {
      var out = contents(at(S.pos.out).getInventory())
      if (out.indexOf(LAUNCHED + 'x1') >= 0) {
        check('launched_output', true, 'output bus ' + out)
        var bus = contents(at(S.pos.bus).getInventory())
        check('chart_kept', bus.indexOf(CHART + 'x1') >= 0 && bus.indexOf(SEED) < 0, 'input bus ' + bus)
        finish()
      } else if (elapsed > DURATION) {
        check('launched_output', false, 'no launched seed after ' + elapsed + ' ticks; output bus ' + out + '; ' + why())
        finish()
      }
    }
  }

  // ---------------------------------------------------------------- both legs
  function step() {
    if (!S || S.finished) return
    S.tick = Number(S.server.getTickCount()) - S.tick0
    if (S.tick > 6000) throw new Error('overall deadline in ' + S.phase)
    if (S.leg === 1) step1()
    else step2()
  }
  function finish() {
    if (!S || S.finished) return
    S.finished = true
    var problems = []
    try { if (S.ctrl) S.ctrl.setWorkingEnabled(false) } catch (x) { problems.push('disable: ' + x) }
    try { delete S.G.warpGate.gates[GATE_KEY] } catch (x) { problems.push('gates: ' + x) }
    var b = S.box
    if (b) {
      try {
        cmd('fill ' + b.x0 + ' ' + b.y0 + ' ' + b.z0 + ' ' + b.x1 + ' ' + b.y1 + ' ' + b.z1 + ' minecraft:air replace')
        if (block(ORIGIN) !== 'minecraft:air') problems.push('the controller remains')
      } catch (x) { problems.push('fill: ' + x) }
    }
    ;(S.tickets || []).forEach(function (t) {
      try { cmd('forceload remove ' + t.x + ' ' + t.z) } catch (x) { problems.push('ticket: ' + x) }
    })
    try { cmdIn(S.server, FAR, 'forceload remove ' + (FARO.x - 8) + ' ' + FARO.z + ' ' + (FARO.x + 14) + ' ' + (FARO.z + 15)) } catch (x) { problems.push('far: ' + x) }
    try { S.server.persistentData.remove(STATE) } catch (x) { problems.push('state: ' + x) }
    P = null
    check('cleanup', problems.length === 0, problems.length ? problems.join('; ') : 'box ' + JSON.stringify(b) + ' and ' + (S.tickets || []).length + ' tickets removed')
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  function start(server) {
    var st = saved(server)
    S = { server: server, G: global.grindless, failed: 0, tick0: Number(server.getTickCount()), tick: 0, phaseAt: 0, phase: 'setup',
      owned: {}, chunks: {}, tickets: [], box: null, finished: false, level: server.getLevel(SOURCE), leg: st ? 2 : 1 }
    if (!check('orbit_loaded', S.level !== null && S.level !== undefined && !!server.getLevel(FAR), SOURCE + ' and ' + FAR)) throw new Error('no level')
    emit('leg', 'NOTE', String(S.leg))
    if (S.leg === 2) {
      S.pos = st.pos
      S.box = st.box
      S.tickets = st.tickets
      S.ctrl = at(ORIGIN)
      if (!check('formed_after_restart', !!S.ctrl && S.ctrl.isFormed(), 'gate at ' + key(ORIGIN))) throw new Error('the gate is gone')
      phase('restored')
      return
    }
    statics()
    var hatch = 'gtceu:uxv_energy_input_hatch_16a'
    if (!Item.exists(hatch)) throw new Error('no ' + hatch)
    S.pos = build(GATE, ORIGIN, [
      { ability: 'input_bus', id: 'gtceu:uxv_input_bus', key: 'bus' },
      { ability: 'output_bus', id: 'gtceu:uxv_output_bus', key: 'out' },
      { ability: 'energy_input', id: hatch, key: 'e0' },
      { ability: 'energy_input', id: hatch, key: 'e1' }
    ])
    phase('form')
  }
  ServerEvents.customCommand('gg_test_opv_bulge_relay', function () {
    if ((S && !S.finished) || global[REQUEST] === true) {
      emit('request', 'NOTE', 'already requested or running')
      return
    }
    global[REQUEST] = true
  })
  ServerEvents.tick(function (event) {
    try {
      // leg 2: keep the hatches full from the first tick of the boot, before the command arrives
      if (!S) {
        var st = saved(event.server)
        if (st) fillAt(event.server.getLevel(SOURCE), st.pos)
      }
      if (global[REQUEST] === true && (!S || S.finished) && Date.now() - LOADED_AT >= 10000) {
        global[REQUEST] = false
        start(event.server)
      }
      step()
    } catch (e) {
      if (S === null) S = { failed: 0, tickets: [], finished: false }
      S.failed++
      emit('exception', 'FAIL', (S.phase || 'setup') + ': ' + e)
      if (S.server) finish()
      else console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
    }
  })
})()
