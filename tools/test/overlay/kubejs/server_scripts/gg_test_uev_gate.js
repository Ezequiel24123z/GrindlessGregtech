// priority: -7684
// TEST ONLY, UEV-B5. Command: kubejs custom_command gg_test_uev_gate
// Marker: GGTEST|uev_gate|DONE|failures=N (well within 180 seconds of game time: the hold is 1,200 ticks).
// Band ONLY: X 34816-34879, Z 0-63, Y 60-120, in grindless:sirius_b_orbit. All blocks and chunk tickets are owned and removed before DONE.
// Doubt: the 16 A UEV load on the gate's hatches. One warp gate (15 x 15 x 3) with one UEV 16 A energy hatch and an input bus holding
// circuit 3 and the stored items (tennessine sample, degenerate pellet, EOS model, 4 optical computers):
//   static_*    the c3 row and the UIV casing recipe load under their ids; the casing's research is the pulsar navigation chart only
//   formed      GTM forms the ring with the chosen parts
//   hold        the gate runs grindless:warp_gate/hold at 134,217,728 EU/t, the stored items are not consumed, the run is still going
//               at tick 1,000 of 1,200 (the 60 s hold), and the stored energy falls by about what the run draws
(function () {
  var REQUEST = 'ggTestUevGateRequest'
  var NAME = 'uev_gate'
  var LOADED_AT = Date.now()
  var S = null
  var J = null
  var BAND = { x0: 34816, x1: 34879, y0: 60, y1: 120, z0: 0, z1: 63 }
  var SIRIUS = 'grindless:sirius_b_orbit'
  var GATE = 'gtceu:warp_gate'
  var HOLD = 'grindless:warp_gate/hold'
  var CASING_RECIPE = 'grindless:assembly_line/uiv_machine_casing'
  var EUT = 134217728
  var DURATION = 1200
  var ORIGIN = { x: 34848, y: 80, z: 10 }
  var KEPT = [['grindless:tennessine_sample', 1], ['grindless:degenerate_pellet', 1], ['grindless:degenerate_eos_model', 1],
    ['gtnn:optical_computer', 4]]

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
      Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour')
    }
    return J
  }
  function rl(id) { return new (lazy().RL)(id) }
  function at(p) { return lazy().Machine.getMachine(S.level, new (lazy().Pos)(p.x, p.y, p.z)) }
  function cmd(text) { return Number(S.server.runCommandSilent('execute in ' + SIRIUS + ' run ' + text)) }
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
      S.order.push(p)
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
  function fill() {
    var m = at(S.pos.e0)
    if (m) m.energyContainer.setEnergyStored(m.energyContainer.getEnergyCapacity())
  }
  function stored() {
    var m = at(S.pos.e0)
    return m ? Number(m.energyContainer.getEnergyStored()) : -1
  }

  // ---------------------------------------------------------------- static
  function statics() {
    var WG = S.G.warpGate
    var UG = S.G.uevGate
    if (!check('static_published', WG && WG.recipes && WG.recipes.length === 4, 'global.grindless.warpGate recipes ' +
      (WG && WG.recipes ? WG.recipes.length : 'none'))) throw new Error('warpGate is not published')
    var missing = [HOLD, CASING_RECIPE, 'grindless:warp_gate/open', 'grindless:warp_gate/sustain'].filter(function (id) { return byId(id) === null })
    check('static_recipes', missing.length === 0 && (WG.skipped || []).length === 0 && (WG.clashes || []).length === 0 &&
      !!UG && (UG.skipped || []).length === 0, 'missing ' + (missing.join(' ') || 'none') + '; skipped ' + JSON.stringify((WG.skipped || []).concat(UG ? UG.skipped : [])) +
      '; clashes ' + JSON.stringify(WG.clashes || []))
    check('static_casing', !!UG && !!UG.casing && UG.casing.research === 'grindless:pulsar_navigation_chart' &&
      UG.casing.output === '2x gtceu:uiv_machine_casing', JSON.stringify(UG ? UG.casing : null))
    var rec = byId(CASING_RECIPE)
    var dump = rec ? String(rec.toString()) : ''
    emit('casing_recipe', 'NOTE', dump)
    var hold = WG.recipes.filter(function (r) { return r.name === 'hold' })[0]
    check('static_hold_row', !!hold && hold.eut === EUT && hold.duration === DURATION && hold.circuit === 3 && hold.site === 'sirius_b_orbit' &&
      hold.itemsOut.length === 0, JSON.stringify(hold || null))
  }

  // ---------------------------------------------------------------- the run
  function load() {
    var ctrl = at(ORIGIN)
    if (!ctrl || !ctrl.isFormed()) return false
    S.ctrl = ctrl
    var bus = at(S.pos.bus)
    var e = at(S.pos.e0)
    var parts = ctrl.getParts()
    check('formed', !!bus && !!e && parts.contains(bus) && parts.contains(e), 'GTM formed the gate in ' + SIRIUS)
    bus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(3))
    var inv = bus.getInventory()
    KEPT.forEach(function (k, i) { inv.setStackInSlot(i, Item.of(k[0], k[1])) })
    S.before = contents(inv)
    fill()
    ctrl.getRecipeLogic().updateTickSubscription()
    return true
  }
  function why() {
    var out = []
    var c = S.ctrl
    try { out.push('energy ' + c.getEnergyContainer().getInputVoltage() + 'V x ' + c.getEnergyContainer().getInputAmperage() + 'A stored ' + c.getEnergyContainer().getEnergyStored()) } catch (x) { out.push('energy: ' + x) }
    try { out.push('status ' + c.getRecipeLogic().getStatus() + ' reason ' + c.getRecipeLogic().getFancyTooltip()) } catch (x) { out.push('tooltip: ' + x) }
    try { out.push('bus ' + contents(at(S.pos.bus).getInventory())) } catch (x) { out.push('bus: ' + x) }
    return out.join(' ; ')
  }
  function step() {
    if (!S || S.finished) return
    S.tick = Number(S.server.getTickCount()) - S.tick0
    if (S.tick > 3000) throw new Error('overall deadline in ' + S.phase)
    var elapsed = S.tick - S.phaseAt
    if (S.phase === 'form') {
      if (load()) phase('hold')
      else if (elapsed > 400) throw new Error('the gate did not form')
      return
    }
    var logic = S.ctrl.getRecipeLogic()
    if (S.phase === 'hold') {
      fill()
      var last = logic.getLastRecipe()
      if (String(logic.getStatus()) === 'WORKING' && last && String(last.id) === HOLD) {
        var tickEut = -1
        try { tickEut = Number(Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper').getRealEUtWithIO(last).getTotalEU()) } catch (e) { tickEut = -1 }
        check('hold_eut', tickEut === EUT, 'recipe EU/t ' + tickEut + ' (row ' + EUT + ')')
        check('hold_duration', Number(last.duration) === DURATION, 'recipe duration ' + last.duration + ' ticks (row ' + DURATION + ')')
        S.drain0 = stored()
        S.runStart = S.tick
        phase('drain')
      } else if (elapsed > 300) throw new Error('the hold did not start: ' + why())
      return
    }
    if (S.phase === 'drain') {
      // no refill: with no cable feeding the hatch the stored energy falls by what the run draws
      if (elapsed >= 10) {
        var drop = S.drain0 - stored()
        var expect = EUT * elapsed
        check('hold_drain', drop >= expect * 0.8 && drop <= expect * 1.2, 'stored fell ' + drop + ' EU in ' + elapsed + ' ticks; expected about ' + expect)
        phase('long')
      }
      return
    }
    if (S.phase === 'long') {
      fill()
      if (S.tick - S.runStart >= 1000) {
        var live = String(logic.getStatus()) === 'WORKING'
        check('hold_long', live, 'still ' + logic.getStatus() + ' ' + (S.tick - S.runStart) + ' ticks into the run of ' + DURATION + '; ' + why())
        check('hold_kept', contents(at(S.pos.bus).getInventory()) === S.before, 'before ' + S.before + ' now ' + contents(at(S.pos.bus).getInventory()))
        finish()
      } else if (String(logic.getStatus()) !== 'WORKING') {
        check('hold_long', false, 'stopped after ' + (S.tick - S.runStart) + ' ticks: ' + why())
        finish()
      }
    }
  }
  function finish() {
    if (!S || S.finished) return
    S.finished = true
    var problems = []
    try { if (S.ctrl) S.ctrl.setWorkingEnabled(false) } catch (x) { problems.push('disable: ' + x) }
    try { Object.keys(S.G.warpGate.gates).forEach(function (k) { delete S.G.warpGate.gates[k] }) } catch (x) { problems.push('gates: ' + x) }
    S.order.slice().reverse().forEach(function (p) {
      try {
        cmd('setblock ' + p.x + ' ' + p.y + ' ' + p.z + ' minecraft:air replace')
        if (block(p) !== 'minecraft:air') problems.push('block remains ' + key(p))
      } catch (x) { problems.push('block ' + key(p) + ': ' + x) }
    })
    S.tickets.forEach(function (t) {
      try { cmd('forceload remove ' + t.x + ' ' + t.z) } catch (x) { problems.push('ticket: ' + x) }
    })
    check('cleanup', problems.length === 0, problems.length ? problems.join('; ') : S.order.length + ' blocks and ' + S.tickets.length +
      ' tickets removed')
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  function start(server) {
    S = { server: server, G: global.grindless, failed: 0, tick0: Number(server.getTickCount()), tick: 0, phaseAt: 0, phase: 'setup',
      owned: {}, order: [], chunks: {}, tickets: [], finished: false, level: server.getLevel(SIRIUS) }
    if (!check('orbit_loaded', S.level !== null && S.level !== undefined, SIRIUS)) throw new Error('no level ' + SIRIUS)
    statics()
    var hatch = 'gtceu:uev_energy_input_hatch_16a'
    var parts = [
      { ability: 'input_bus', id: 'gtceu:uhv_input_bus', key: 'bus' },
      { ability: 'output_bus', id: 'gtceu:uhv_output_bus', key: 'out' },
      { ability: 'energy_input', id: hatch, key: 'e0' }
    ]
    if (!Item.exists(hatch)) throw new Error('no ' + hatch)
    S.pos = build(GATE, ORIGIN, parts)
    phase('form')
  }
  ServerEvents.customCommand('gg_test_uev_gate', function () {
    if ((S && !S.finished) || global[REQUEST] === true) {
      emit('request', 'NOTE', 'already requested or running')
      return
    }
    global[REQUEST] = true
  })
  ServerEvents.tick(function (event) {
    try {
      if (global[REQUEST] === true && (!S || S.finished) && Date.now() - LOADED_AT >= 10000) {
        global[REQUEST] = false
        start(event.server)
      }
      step()
    } catch (e) {
      if (S === null) S = { failed: 0, order: [], tickets: [], finished: false }
      S.failed++
      emit('exception', 'FAIL', (S.phase || 'setup') + ': ' + e)
      if (S.server) finish()
      else console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
    }
  })
})()
