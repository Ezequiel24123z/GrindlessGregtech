// OpV-R1 T1: the c12 hold_terzan5 jump. Band: grindless:cygnus_x1_orbit X 38400-38463, Z 0-63, Y 98-115 (ring at X 38416, Y 100, Z 20).
// The far side is the platform the jump itself places in grindless:terzan5_core at 64,100,64 (tables/relay_platforms.json, uxv/kerr_sling.js).
// Doubt: the second-hop throw from Cygnus X-1 to Terzan 5 places its platform, remembers it (uxvPlatform_terzan5) and keeps its chunks
// force-loaded across @restart (S0-9 proved a bare hold). Invoke gg_test_opv_pathfinder, @restart, then the same command.
// The probe is stocked with /give-style stacks; no other package's recipe is relied on. The launched output is opv-terzan5's model grant.
(function () {
  var NAME = 'opv_pathfinder'
  var NEAR = 'grindless:cygnus_x1_orbit'
  var FAR = 'grindless:terzan5_core'
  var O = { x: 38416, y: 100, z: 20 }
  var FARO = { x: 64, y: 100, z: 64 }
  var X0 = 38400
  var X1 = 38463
  var LOADED_AT = Date.now()
  var SAVED = 'ggTestOpvPathfinderSaved'
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
    if (p.x < X0 || p.x > X1 || p.y < 98 || p.y > 115 || p.z < 0 || p.z > 63) throw new Error('outside the band ' + JSON.stringify(p))
    ticket(p)
    if (String(S.server.getLevel(NEAR).getBlock(p.x, p.y, p.z).id) !== 'minecraft:air') throw new Error('occupied test position ' + JSON.stringify(p))
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
    if (!ctl) throw new Error('no warp gate controller symbol')
    var parts = [{ ability: 'input_bus', id: 'gtceu:uxv_input_bus', key: 'bus' }, { ability: 'output_bus', id: 'gtceu:uxv_output_bus', key: 'out' },
      { ability: 'energy_input', id: 'gtceu:uxv_energy_input_hatch_16a', key: 'e0' },
      { ability: 'energy_input', id: 'gtceu:uxv_energy_input_hatch_16a', key: 'e1' }]
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
    if (next !== parts.length) throw new Error('not enough gate part positions')
    plan.forEach(function (c) { put(c.p, c.id, c.facing) })
    put(O, 'gtceu:warp_gate', true)
    return pos
  }
  function release() {
    S.order.slice().reverse().forEach(function (p) {
      try { cmd(NEAR, 'setblock ' + p.x + ' ' + p.y + ' ' + p.z + ' minecraft:air replace') }
      catch (e) { check('cleanup_block', false, String(e)) }
    })
    S.tickets.forEach(function (t) {
      try { cmd(NEAR, 'forceload remove ' + t.x + ' ' + t.z) }
      catch (e) { check('cleanup_ticket', false, String(e)) }
    })
  }
  function finish() {
    if (S.finished) return
    S.finished = true
    release()
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  function phase(name) { S.phase = name; S.phaseAt = S.tick; emit('stage', 'NOTE', name) }

  function statics() {
    var WG = S.G.warpGate
    var r = WG.recipes.filter(function (x) { return x.name === 'hold_terzan5' })[0]
    check('static_hold_terzan5', !!r && r.circuit === 12 && r.site === 'cygnus_x1_orbit' && r.eut === 1073741824 && r.duration === 2400,
      JSON.stringify(r || null))
    check('static_clean', (WG.skipped || []).length === 0 && (WG.clashes || []).length === 0, 'skipped ' + JSON.stringify(WG.skipped || []) + ' clashes ' + JSON.stringify(WG.clashes || []))
    check('static_levels', !!S.server.getLevel(NEAR) && !!S.server.getLevel(FAR), 'cygnus, terzan 5')
    var P = S.G.opvPathfinder
    check('static_pathfinder', !!P && (P.skipped || []).length === 0, 'opvPathfinder skipped ' + JSON.stringify((P && P.skipped) || null))
  }

  function platformChecks(suffix) {
    var row = String(S.server.persistentData.getString('uxvPlatform_terzan5'))
    check('platform_row' + suffix, row === FAR + '@' + FARO.x + ',' + FARO.y + ',' + FARO.z, row)
    var m = at(FAR, FARO)
    check('platform_ring_formed' + suffix, !!m && m.isFormed(), m ? 'formed ' + m.isFormed() : 'missing controller')
    check('platform_forceload' + suffix, cmd(FAR, 'forceload query 56 64') > 0 && cmd(FAR, 'forceload query 78 79') > 0, 'both arrival chunks')
    var level = S.server.getLevel(FAR)
    check('platform_ae2' + suffix, String(level.getBlock(76, 100, 64).id) === 'ae2:controller', 'AE2 controller')
    check('platform_dynamo' + suffix, String(level.getBlock(73, 100, 64).id) === 'gtceu:uiv_wireless_dynamo_hatch_16a', 'wireless dynamo')
  }

  function step() {
    if (S.phase === 'restart') {
      if (S.tick < 100) return
      check('restart_occurred', String(S.server.persistentData.getString(SAVED)) !== String(LOADED_AT), 'script instance changed')
      platformChecks('_after_restart')
      S.server.persistentData.remove(SAVED)
      finish()
      return
    }
    var c = at(NEAR, O)
    ;['e0', 'e1'].forEach(function (k) {
      var e = at(NEAR, S.pos[k])
      if (e) e.energyContainer.setEnergyStored(e.energyContainer.getEnergyCapacity())
    })
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
      S.inv.setStackInSlot(0, Item.of('grindless:pathfinder_probe', 1))
      c.getRecipeLogic().updateTickSubscription()
      phase('jump')
      return
    }
    if (S.phase === 'jump') {
      if (c.getRecipeLogic().isWorking()) { check('jump_runs', true, 'hold_terzan5 runs'); phase('jump_wait') }
      else if (S.tick - S.phaseAt > 200) { check('jump_runs', false, 'jump did not start: ' + c.getRecipeLogic().getStatus() + ' bus ' + contents(S.inv)); finish() }
      return
    }
    if (S.phase === 'jump_wait') {
      if (S.server.persistentData.contains('uxvPlatform_terzan5')) { phase('platform'); return }
      if (S.tick - S.phaseAt > 2800) { check('platform_placed', false, 'no platform row after the jump; bus ' + contents(S.inv)); finish() }
      return
    }
    if (S.phase === 'platform') {
      if (S.tick - S.phaseAt < 40) return
      platformChecks('')
      check('probe_spent', contents(S.inv).indexOf('pathfinder_probe') < 0, 'bus after the jump: ' + contents(S.inv))
      var out = at(NEAR, S.pos.out).getInventory()
      check('launched_output', contents(out).indexOf('grindless:launched_pathfinderx1') >= 0, contents(out))
      if (S.failed === 0) {
        S.server.persistentData.putString(SAVED, String(LOADED_AT))
        S.server.runCommandSilent('save-all')
        emit('restart_ready', 'NOTE', 'invoke @restart and gg_test_opv_pathfinder again; keep the arrival platform and its tickets')
      }
      finish()
    }
  }

  function start(server) {
    S = { server: server, G: global.grindless, failed: 0, tick: 0, phaseAt: 0, phase: 'setup', order: [], chunks: {}, tickets: [], finished: false }
    statics()
    if (server.persistentData.contains(SAVED)) { phase('restart'); return }
    if (server.persistentData.contains('uxvPlatform_terzan5')) throw new Error('arrival platform already exists; run this test in a fresh copied world')
    S.pos = build()
    phase('form')
  }
  global.ggTestOpvPathfinderRequest = ''
  ServerEvents.customCommand('gg_test_opv_pathfinder', function () {
    if ((S && !S.finished) || global.ggTestOpvPathfinderRequest !== '') { emit('request', 'NOTE', 'already requested or running'); return }
    global.ggTestOpvPathfinderRequest = 'run'
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestOpvPathfinderRequest !== '' && (!S || S.finished) && Date.now() - LOADED_AT >= 10000) {
        global.ggTestOpvPathfinderRequest = ''
        start(event.server)
      }
      if (!S || S.finished) return
      S.tick++
      if (S.tick > 4200) throw new Error('overall deadline in ' + S.phase)
      step()
    } catch (e) {
      if (!S) S = { failed: 0, order: [], tickets: [], finished: false }
      S.failed++
      emit('exception', 'FAIL', (S.phase || 'setup') + ': ' + e + ' @ ' + (e && e.stack ? String(e.stack).split('\n').slice(0, 3).join(' ; ') : ''))
      if (S.server) finish()
      else console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
    }
  })
})()
