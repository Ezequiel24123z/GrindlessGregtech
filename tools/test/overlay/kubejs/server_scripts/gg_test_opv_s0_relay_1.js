// priority: -6901
// TEST ONLY, OpV-S0 S0-9, leg 1. Command: kubejs custom_command gg_test_opv_s0_relay_1
// Needs the temp pack copy E3 (a throwaway hold_s0_terzan5 row, circuit 12, in tables/gate.json at grindless:cygnus_x1_orbit, and a relay_platforms.json row
// { place s0_terzan5, jump hold_s0_terzan5, dimension grindless:s0_terzan5_core, source grindless:cygnus_x1_orbit, x 64, y 100, z 64 }). Never committed.
// A c12 gate formed in Cygnus X-1's orbit (band X 37376-37439, Z 0-63, Y 80) runs the throw; when it ends, UXV's kerr_sling.js places the platform in the
// throwaway place and force-loads it. Leg 2 (gg_test_opv_s0_relay_2) runs after @restart and checks the platform and its chunk tickets survived.
(function () {
  var NAME = 'opv_s0_relay_1'
  var NEAR = 'grindless:cygnus_x1_orbit'
  var FAR = 'grindless:s0_terzan5_core'
  var PLACE = 's0_terzan5'
  var JUMP = 'hold_s0_terzan5'
  var O = { x: 37400, y: 80, z: 20 }
  var FARO = { x: 64, y: 100, z: 64 }
  var X0 = 37376
  var X1 = 37439
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
  function at(dim, p) { return lazy().Machine.getMachine(S.server.getLevel(dim), new (lazy().Pos)(p.x, p.y, p.z)) }
  function contents(inv) {
    var out = []
    for (var i = 0; i < inv.getSlots(); i++) {
      var st = inv.getStackInSlot(i)
      if (!st.isEmpty()) out.push(String(st.getId()) + 'x' + st.getCount())
    }
    return out.join(' ') || 'empty'
  }
  function ticket(p) {
    var x = Math.floor(p.x / 16) * 16
    var z = Math.floor(p.z / 16) * 16
    var k = x + ',' + z
    if (S.chunks[k]) return
    S.chunks[k] = true
    S.server.getLevel(NEAR).getChunk(x >> 4, z >> 4)
    if (cmd(NEAR, 'forceload query ' + x + ' ' + z) > 0) return
    S.tickets.push({ x: x, z: z })
    cmd(NEAR, 'forceload add ' + x + ' ' + z)
  }
  function put(p, id, facing) {
    if (p.x < X0 || p.x > X1 || p.z < 0 || p.z > 63) throw new Error('outside the band ' + p.x + ',' + p.z)
    ticket(p)
    S.order.push(p)
    cmd(NEAR, 'setblock ' + p.x + ' ' + p.y + ' ' + p.z + ' ' + id + (facing ? '[facing=north]' : '') + ' replace')
  }
  function allows(sym, ability) {
    return !!sym && sym.kind === 'oneOf' && sym.options.some(function (o) { return o.kind === 'part' && o.ability === ability })
  }
  function plain(sym) {
    if (sym.kind === 'blocks') return String(sym.blocks[0])
    if (sym.kind === 'frames') return 'gtceu:' + sym.materials[0] + '_frame'
    for (var i = 0; i < sym.options.length; i++) if (sym.options[i].kind === 'blocks') return String(sym.options[i].blocks[0])
    throw new Error('unsupported symbol ' + sym.kind)
  }
  function build() {
    var desc = S.G.structures['gtceu:warp_gate']
    var ctl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var s = desc.symbols[row.charAt(ci)]
          if (s && s.kind === 'controller') ctl = { si: si, ri: ri, ci: ci }
        }
      })
    })
    var parts = [{ ability: 'input_bus', id: 'gtceu:uhv_input_bus', key: 'bus' }, { ability: 'output_bus', id: 'gtceu:uhv_output_bus', key: 'out' },
      { ability: 'energy_input', id: 'gtceu:uiv_energy_input_hatch_16a', key: 'e0' }]
    var next = 0
    var pos = {}
    var plan = []
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var sym = desc.symbols[row.charAt(ci)]
          if (!sym || sym.kind === 'controller' || sym.kind === 'air' || sym.kind === 'any') continue
          var p = { x: O.x - (ci - ctl.ci), y: O.y + ri - ctl.ri, z: O.z - (si - ctl.si) }
          var id = null
          var facing = false
          if (si === ctl.si && next < parts.length && allows(sym, parts[next].ability)) {
            id = parts[next].id
            pos[parts[next].key] = p
            facing = true
            next++
          }
          plan.push({ p: p, id: id || plain(sym), facing: facing })
        }
      })
    })
    plan.forEach(function (c) { put(c.p, c.id, c.facing) })
    put(O, 'gtceu:warp_gate', true)
    return pos
  }
  function fill(m) { m.energyContainer.setEnergyStored(m.energyContainer.getEnergyCapacity()) }
  function release() {
    S.order.slice().reverse().forEach(function (p) { try { cmd(NEAR, 'setblock ' + p.x + ' ' + p.y + ' ' + p.z + ' minecraft:air replace') } catch (e) { } })
    S.tickets.forEach(function (t) { try { cmd(NEAR, 'forceload remove ' + t.x + ' ' + t.z) } catch (e) { } })
  }
  function finish() {
    if (S.finished) return
    S.finished = true
    release()
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  function phase(name) { S.phase = name; S.phaseAt = S.tick; emit('stage', 'NOTE', name) }

  function statics() {
    var r = S.G.warpGate.recipes.filter(function (x) { return x.name === JUMP })[0]
    check('static_row', !!r && r.circuit === 12 && r.site === 'cygnus_x1_orbit', JSON.stringify(r || null))
    check('static_levels', !!S.server.getLevel(NEAR) && !!S.server.getLevel(FAR), 'cygnus orbit and ' + FAR)
    check('static_no_final_id', !S.server.getLevel('grindless:terzan5_core'), 'the final grindless:terzan5_core is not loaded')
  }

  function step() {
    var c = at(NEAR, O)
    var e = at(NEAR, S.pos.e0)
    if (e) fill(e)
    if (S.phase === 'form') {
      if (c && c.isFormed()) { check('ring_formed', true, 'gate formed in ' + NEAR); phase('stock') }
      else if (S.tick - S.phaseAt > 400) { check('ring_formed', false, 'not formed after 400 ticks'); finish() }
      return
    }
    if (S.phase === 'stock') {
      var bus = at(NEAR, S.pos.bus)
      bus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(12))
      S.inv = bus.getInventory()
      for (var i = 0; i < S.inv.getSlots(); i++) S.inv.setStackInSlot(i, Item.empty)
      S.inv.setStackInSlot(0, Item.of('grindless:launched_relay_seed', 1))
      c.getRecipeLogic().updateTickSubscription()
      phase('jump')
      return
    }
    if (S.phase === 'jump') {
      if (c.getRecipeLogic().isWorking()) { check('throw_runs', true, JUMP + ' runs at 536,870,912 EU/t'); phase('jump_wait') }
      else if (S.tick - S.phaseAt > 200) { check('throw_runs', false, 'did not start: ' + c.getRecipeLogic().getStatus() + ' bus ' + contents(S.inv)); finish() }
      return
    }
    if (S.phase === 'jump_wait') {
      if (S.server.persistentData.contains('uxvPlatform_' + PLACE)) { phase('platform'); return }
      if (S.tick - S.phaseAt > 1700) { check('platform_placed', false, 'no platform row after the throw; bus ' + contents(S.inv)); finish() }
      return
    }
    if (S.phase === 'platform') {
      if (S.tick - S.phaseAt < 40) return
      check('platform_row', String(S.server.persistentData.getString('uxvPlatform_' + PLACE)) === FAR + '@' + FARO.x + ',' + FARO.y + ',' + FARO.z, S.server.persistentData.getString('uxvPlatform_' + PLACE))
      var m = at(FAR, FARO)
      check('platform_ring_formed', !!m && m.isFormed(), 'far ring in ' + FAR + ': ' + (m ? 'formed ' + m.isFormed() : 'no controller block entity'))
      check('platform_forceload', Number(S.server.getLevel(FAR).getForcedChunks().size()) > 0, 'forced chunks in ' + FAR + ': ' + S.server.getLevel(FAR).getForcedChunks().size())
      emit('saved', 'NOTE', 'save-all before the restart')
      S.server.runCommandSilent('save-all flush')
      finish()
    }
  }

  function start(server) {
    S = { server: server, G: global.grindless, failed: 0, tick: 0, phaseAt: 0, phase: 'setup', order: [], chunks: {}, tickets: [], finished: false }
    statics()
    S.pos = build()
    phase('form')
  }
  global.ggTestOpvS0Relay1Request = ''
  ServerEvents.customCommand('gg_test_opv_s0_relay_1', function () {
    if ((S && !S.finished) || global.ggTestOpvS0Relay1Request !== '') return
    global.ggTestOpvS0Relay1Request = 'run'
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestOpvS0Relay1Request !== '' && (!S || S.finished) && Date.now() - LOADED_AT >= 10000) {
        global.ggTestOpvS0Relay1Request = ''
        start(event.server)
      }
      if (!S || S.finished) return
      S.tick++
      if (S.tick > 3000) throw new Error('overall deadline in ' + S.phase)
      step()
    } catch (e) {
      if (!S) S = { failed: 0, order: [], tickets: [], finished: false }
      S.failed++
      emit('exception', 'FAIL', (S.phase || 'setup') + ': ' + e)
      if (S.server) finish()
      else console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
    }
  })
})()
