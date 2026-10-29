// priority: -7874
// TEST ONLY, UHV-B7. Command: kubejs custom_command gg_test_uhv_gate
// Marker: GGTEST|uhv_gate|DONE|failures=N (well within 180 seconds).
// Band ONLY: X 29440-29503, Z 0-63, Y 60-120, in gcyr:overworld_orbit and grindless:proxima_b_orbit (the two ends of the gate). All
// blocks and chunk tickets are owned and removed before DONE.
// Doubt: the player transit and the c2 load. A real warp gate (15 x 5 x 15) is built at each end with four UHV 4 A energy hatches
// (c2 is 16 A UHV = 31,457,280 EU/t) and an input bus holding circuit 2 and exotic matter cells:
//   static_*    every B7 row loads under its id; the machines and the AE2 pair and the UEV casing are published and load
//   formed      GTM forms both rings with the chosen parts
//   sustain     both ends run grindless:warp_gate/sustain at 31,457,280 EU/t and the machine hook records each end as live
//   transit     the server's own transit step (global.grindless.warpGate.transit.step) with a stand-in player: a player in one ring
//               is carried to the centre of the other once (no ping-pong), and again after leaving and re-entering. The real
//               Entity#teleportTo is the engine's call, proven by gg_test_uhv_s0_stations S0-7 with a real player; this suite has none.
(function () {
  var REQUEST = 'ggTestUhvGateRequest'
  var NAME = 'uhv_gate'
  var LOADED_AT = Date.now()
  var S = null
  var J = null
  var BAND = { x0: 29440, x1: 29503, y0: 60, y1: 120, z0: 0, z1: 63 }
  var EARTH = 'gcyr:overworld_orbit'
  var PROXIMA = 'grindless:proxima_b_orbit'
  var GATE = 'gtceu:warp_gate'
  var SUSTAIN = 'grindless:warp_gate/sustain'
  var EUT = 31457280
  var CELL = 'grindless:exotic_matter_cell'
  var ORIGIN = { x: 29472, y: 80, z: 10 }

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
      Registry: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
      Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour')
    }
    return J
  }
  function rl(id) { return new (lazy().RL)(id) }
  function at(dim, p) { return lazy().Machine.getMachine(S.levels[dim], new (lazy().Pos)(p.x, p.y, p.z)) }
  function cmd(dim, text) { return Number(S.server.runCommandSilent('execute in ' + dim + ' run ' + text)) }
  function byId(id) {
    var found = S.server.getRecipeManager().byKey(rl(id))
    return found.isPresent() ? found.get() : null
  }
  function inside(p) {
    if (p.x < BAND.x0 || p.x > BAND.x1 || p.y < BAND.y0 || p.y > BAND.y1 || p.z < BAND.z0 || p.z > BAND.z1) {
      throw new Error('out-of-band coordinate ' + JSON.stringify(p))
    }
  }
  function key(dim, p) { return dim + '@' + p.x + ',' + p.y + ',' + p.z }
  function block(dim, p) { return String(S.levels[dim].getBlock(p.x, p.y, p.z).id) }
  function ticket(dim, p) {
    var x = Math.floor(p.x / 16) * 16
    var z = Math.floor(p.z / 16) * 16
    var k = dim + '@' + x + ',' + z
    if (S.chunks[k]) return
    S.chunks[k] = true
    S.levels[dim].getChunk(x >> 4, z >> 4)
    if (cmd(dim, 'forceload query ' + x + ' ' + z) > 0) return
    S.tickets.push({ dim: dim, x: x, z: z })
    if (cmd(dim, 'forceload add ' + x + ' ' + z) < 1) throw new Error('cannot acquire chunk ticket ' + k)
  }
  function put(dim, p, id, facing) {
    inside(p)
    ticket(dim, p)
    var k = key(dim, p)
    if (!S.owned[k]) {
      if (block(dim, p) !== 'minecraft:air') throw new Error('refusing to replace unowned block at ' + k)
      S.owned[k] = true
      S.order.push({ dim: dim, p: p })
    }
    cmd(dim, 'setblock ' + p.x + ' ' + p.y + ' ' + p.z + ' ' + id + (facing ? '[facing=north]' : '') + ' replace')
    if (block(dim, p) !== id) throw new Error('setblock did not place ' + id + ' at ' + k)
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
  function build(dim, id, origin, parts) {
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
          ticket(dim, p)
          if (block(dim, p) !== 'minecraft:air') throw new Error('structure footprint is occupied at ' + key(dim, p))
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
    plan.forEach(function (c) { put(dim, c.p, c.id, c.facing) })
    put(dim, origin, id, true)
    return pos
  }
  function hatchId() {
    var ids = ['gtceu:uhv_energy_input_hatch_4a', 'gtceu:uhv_energy_input_hatch_16a', 'gtceu:uhv_energy_input_hatch']
    for (var i = 0; i < ids.length; i++) if (Item.exists(ids[i])) return ids[i]
    throw new Error('no UHV energy input hatch exists')
  }
  function partsList() {
    var h = hatchId()
    emit('hatch', 'NOTE', h)
    return [
      { ability: 'input_bus', id: 'gtceu:uhv_input_bus', key: 'bus' },
      { ability: 'output_bus', id: 'gtceu:uhv_output_bus', key: 'out' },
      { ability: 'energy_input', id: h, key: 'e0' },
      { ability: 'energy_input', id: h, key: 'e1' },
      { ability: 'energy_input', id: h, key: 'e2' },
      { ability: 'energy_input', id: h, key: 'e3' }
    ]
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
  function storedOf(end) {
    var sum = 0
    ;['e0', 'e1', 'e2', 'e3'].forEach(function (k) {
      var m = at(end.dim, end.pos[k])
      if (m) sum += Number(m.energyContainer.getEnergyStored())
    })
    return sum
  }
  function fill(end) {
    ;['e0', 'e1', 'e2', 'e3'].forEach(function (k) {
      var m = at(end.dim, end.pos[k])
      if (m) m.energyContainer.setEnergyStored(m.energyContainer.getEnergyCapacity())
    })
  }

  // ---------------------------------------------------------------- static
  function statics() {
    var WG = S.G.warpGate
    // 4 since UEV-B5 added the c3 hold row (grindless:warp_gate/hold)
    if (!check('static_published', WG && WG.recipes && WG.recipes.length === 4, 'global.grindless.warpGate recipes ' +
      (WG && WG.recipes ? WG.recipes.length : 'none'))) throw new Error('warpGate is not published')
    var ids = ['grindless:warp_gate/open', SUSTAIN, 'grindless:baseline_astrometry/stellar_neighbourhood_chart']
      .concat((WG.controllerRecipes || []).map(String))
    if (WG.pair && WG.pair.id) ids.push(String(WG.pair.id))
    if (WG.casing && WG.casing.id) ids.push(String(WG.casing.id))
    var missing = ids.filter(function (id) { return byId(id) === null })
    check('static_recipes', missing.length === 0 && (WG.skipped || []).length === 0 && (WG.clashes || []).length === 0,
      ids.length + ' ids; missing ' + (missing.join(' ') || 'none') + '; skipped ' + JSON.stringify(WG.skipped || []) +
      '; clashes ' + JSON.stringify(WG.clashes || []))
    check('static_pair_casing', !!WG.pair && !!WG.casing, 'pair ' + JSON.stringify(WG.pair || null) + ' casing ' + (WG.casing ? WG.casing.id : 'none'))
    ;['gtceu:warp_gate', 'gtceu:baseline_astrometer'].forEach(function (m) {
      check('static_' + m.split(':')[1], !!lazy().Registry.MACHINES.get(rl(m)), m)
    })
    check('static_transit', !!(WG.transit && WG.transit.step), 'transit step published')
  }

  // ---------------------------------------------------------------- the run
  function load(end) {
    var ctrl = at(end.dim, ORIGIN)
    if (!ctrl || !ctrl.isFormed()) return false
    end.ctrl = ctrl
    var bus = at(end.dim, end.pos.bus)
    var parts = ctrl.getParts()
    var ok = !!bus
    ;['e0', 'e1', 'e2', 'e3'].forEach(function (k) { var m = at(end.dim, end.pos[k]); if (!m || !parts.contains(m)) ok = false })
    check('formed_' + end.dim, ok && parts.contains(bus), 'GTM formed the gate in ' + end.dim)
    bus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(2))
    var inv = bus.getInventory()
    inv.setStackInSlot(0, Item.of(CELL, 4))
    fill(end)
    ctrl.getRecipeLogic().updateTickSubscription()
    return true
  }
  function fakePlayer(dim, x, y, z) {
    var f = { dim: dim, x: x, y: y, z: z, calls: [] }
    f.getUuid = function () { return 'gg-fake-player' }
    f.getLevel = function () { return { getDimension: function () { return f.dim } } }
    f.getX = function () { return f.x }
    f.getY = function () { return f.y }
    f.getZ = function () { return f.z }
    f.getYaw = function () { return 0 }
    f.getPitch = function () { return 0 }
    f.getName = function () { return { getString: function () { return 'ggfake' } } }
    f.teleportTo = function (d, x2, y2, z2) {
      f.calls.push(String(d) + '@' + x2 + ',' + y2 + ',' + z2)
      f.dim = String(d)
      f.x = x2
      f.y = y2
      f.z = z2
    }
    return f
  }
  function stepAs(player) {
    var server = S.server
    S.G.warpGate.transit.step({
      getPlayers: function () { return [player] },
      getLevel: function (d) { return server.getLevel(d) }
    })
  }
  function transit() {
    var WG = S.G.warpGate
    var T = WG.transit
    var cE = { x: ORIGIN.x + 0.5, y: ORIGIN.y, z: ORIGIN.z + 7.5 }
    var f = fakePlayer(EARTH, cE.x, cE.y, cE.z)
    stepAs(f)
    check('transit_there', f.calls.length === 1 && f.dim === PROXIMA && f.x === cE.x && f.z === cE.z,
      'calls ' + JSON.stringify(f.calls) + '; now ' + f.dim)
    stepAs(f)
    check('transit_no_pingpong', f.calls.length === 1, 'still ' + f.calls.length + ' call(s) while the player stands in the far ring')
    f.x = cE.x + 30
    stepAs(f)
    check('transit_rearm', T.moved['gg-fake-player'] === undefined, 'left every ring: moved flag ' + T.moved['gg-fake-player'])
    f.dim = EARTH
    f.x = cE.x
    f.z = cE.z
    stepAs(f)
    check('transit_again', f.calls.length === 2 && f.dim === PROXIMA, 'calls ' + JSON.stringify(f.calls))
    delete T.moved['gg-fake-player']
    // outside the ring nothing happens
    var g = fakePlayer(EARTH, cE.x + 30, cE.y, cE.z)
    stepAs(g)
    check('transit_outside', g.calls.length === 0, 'a player outside the ring stays')
    var real = Number(S.server.getPlayers().size())
    emit('transit_real_player', 'NOTE', real + ' real player(s) online; the engine teleport is proven by S0-7')
    finish()
  }
  function step() {
    if (!S || S.finished) return
    S.tick = Number(S.server.getTickCount()) - S.tick0
    if (S.tick > 2400) throw new Error('overall deadline in ' + S.phase)
    var elapsed = S.tick - S.phaseAt
    if (S.phase === 'form') {
      if (!S.loaded) {
        if (load(S.ends[0]) && load(S.ends[1])) {
          S.loaded = true
          phase('sustain')
        } else if (elapsed > 400) throw new Error('a gate did not form')
      }
      return
    }
    if (S.phase === 'sustain') {
      S.ends.forEach(fill)
      var up = 0
      S.ends.forEach(function (e) {
        var logic = e.ctrl.getRecipeLogic()
        var last = logic.getLastRecipe()
        if (String(logic.getStatus()) === 'WORKING' && last && String(last.id) === SUSTAIN) up++
      })
      if (up === 2) {
        var WG = S.G.warpGate
        var live = Object.keys(WG.gates || {}).map(function (k) { return WG.gates[k] })
        var good = live.filter(function (r) { return r.sustain === true && r.fx === 0 && r.fz === -1 })
        check('sustain_runs', good.length === 2 && good.some(function (r) { return r.dim === EARTH }) &&
          good.some(function (r) { return r.dim === PROXIMA }), 'recorded ends ' + JSON.stringify(live))
        var logic0 = S.ends[0].ctrl.getRecipeLogic()
        var rec = logic0.getLastRecipe()
        var tickEut = -1
        try { tickEut = Number(Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper').getRealEUtWithIO(rec).getTotalEU()) } catch (e) { tickEut = -1 }
        check('sustain_eut', tickEut === EUT, 'recipe EU/t ' + tickEut + ' (table ' + EUT + ')')
        S.drain0 = storedOf(S.ends[0])
        phase('drain')
      } else if (elapsed > 300) {
        var why = []
        S.ends.forEach(function (e) {
          var c = e.ctrl
          try { why.push('energy ' + c.getEnergyContainer().getInputVoltage() + 'V x ' + c.getEnergyContainer().getInputAmperage() + 'A stored ' + c.getEnergyContainer().getEnergyStored()) } catch (x) { why.push('energy: ' + x) }
          try { why.push('status ' + c.getRecipeLogic().getStatus() + ' reason ' + c.getRecipeLogic().getFancyTooltip()) } catch (x) { why.push('tooltip: ' + x) }
          try { why.push('bus ' + contents(at(e.dim, e.pos.bus).getInventory())) } catch (x) { why.push('bus: ' + x) }
        })
        throw new Error('the sustain runs did not start: ' + why.join(' ; '))
      }
      return
    }
    if (S.phase === 'drain') {
      // no refill here: with no cable feeding the hatches, the stored energy falls by exactly what the run draws
      if (elapsed >= 10) {
        var drop = S.drain0 - storedOf(S.ends[0])
        var expect = EUT * elapsed
        check('sustain_drain', drop >= expect * 0.8 && drop <= expect * 1.2, 'stored fell ' + drop + ' EU in ' + elapsed + ' ticks; expected about ' + expect)
        phase('transit')
        transit()
      }
      return
    }
  }
  function finish() {
    if (!S || S.finished) return
    S.finished = true
    var problems = []
    S.ends.forEach(function (e) { try { if (e.ctrl) e.ctrl.setWorkingEnabled(false) } catch (x) { problems.push('disable: ' + x) } })
    try { delete S.G.warpGate.transit.moved['gg-fake-player'] } catch (x) { problems.push('moved: ' + x) }
    try { Object.keys(S.G.warpGate.gates).forEach(function (k) { delete S.G.warpGate.gates[k] }) } catch (x) { problems.push('gates: ' + x) }
    S.order.slice().reverse().forEach(function (o) {
      try {
        cmd(o.dim, 'setblock ' + o.p.x + ' ' + o.p.y + ' ' + o.p.z + ' minecraft:air replace')
        if (block(o.dim, o.p) !== 'minecraft:air') problems.push('block remains ' + key(o.dim, o.p))
      } catch (x) { problems.push('block ' + key(o.dim, o.p) + ': ' + x) }
    })
    S.tickets.forEach(function (t) {
      try { cmd(t.dim, 'forceload remove ' + t.x + ' ' + t.z) } catch (x) { problems.push('ticket: ' + x) }
    })
    check('cleanup', problems.length === 0, problems.length ? problems.join('; ') : S.order.length + ' blocks and ' + S.tickets.length +
      ' tickets removed')
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  function start(server) {
    S = { server: server, G: global.grindless, failed: 0, tick0: Number(server.getTickCount()), tick: 0, phaseAt: 0, phase: 'setup',
      owned: {}, order: [], chunks: {}, tickets: [], finished: false, levels: {}, loaded: false, ends: [] }
    ;[EARTH, PROXIMA].forEach(function (d) {
      S.levels[d] = server.getLevel(d)
      if (!check('orbit_loaded_' + d, S.levels[d] !== null && S.levels[d] !== undefined, d)) throw new Error('no level ' + d)
    })
    statics()
    var parts = partsList()
    ;[EARTH, PROXIMA].forEach(function (d) { S.ends.push({ dim: d, pos: build(d, GATE, ORIGIN, parts) }) })
    phase('form')
  }
  ServerEvents.customCommand('gg_test_uhv_gate', function () {
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
      if (S === null) S = { failed: 0, order: [], tickets: [], finished: false, ends: [] }
      S.failed++
      emit('exception', 'FAIL', (S.phase || 'setup') + ': ' + e)
      if (S.server) finish()
      else console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
    }
  })
})()
