// priority: -8463
// UIV-B4 T1: the ergosphere probe bay and the Penrose engine. Command: kubejs custom_command gg_test_uiv_penrose
// Band: X 35712-35775, Z 0-63, Y 98-112, in grindless:cygnus_x1_orbit (read directly, no jump) and, for the refusal, in the Overworld.
// Doubt: the Penrose engine as a local generator written final (2,400 ticks at 268,435,456 EU/t = 8 A of V[UIV]) into a 16 A UIV dynamo hatch,
// and the dimension lock of both machines (they form anywhere, their recipes run only at the site).
//   T1: both machines form at the site; the bay's refit (c3) and the engine's sled run there and are refused in the Overworld; the engine's figures
//   and dynamo hatch; the chain probe data -> ringdown record -> correlated Kerr data resolves by recipe lookup.
(function () {
  var NAME = 'uiv_penrose'
  var FAR = 'grindless:cygnus_x1_orbit'
  var NEAR = 'minecraft:overworld'
  var X0 = 35712
  var X1 = 35775
  var BASE_Y = 101
  var LOADED_AT = Date.now()
  var S = null
  var J = null

  var MACHINES = ['ergosphere_probe_bay', 'penrose_engine']
  var HATCH = {
    input_bus: { id: 'gtceu:uhv_input_bus', key: 'bus' }, output_bus: { id: 'gtceu:uhv_output_bus', key: 'out' },
    energy_input: { id: 'gtceu:uiv_energy_input_hatch_16a', key: 'e0' }, energy_output: { id: 'gtceu:uiv_energy_output_hatch_16a', key: 'dyn' }
  }
  var WANT = {
    ergosphere_probe_bay: ['input_bus', 'output_bus', 'energy_input'],
    penrose_engine: ['input_bus', 'output_bus', 'energy_output']
  }

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
  function errText(e) {
    var s = ''
    try { s = String(e.message || '') } catch (x) { }
    return s === '' ? 'unprintable exception' : s
  }
  function cmd(dim, text) { return Number(S.server.runCommandSilent('execute in ' + dim + ' run ' + text)) }
  function at(dim, p) { return lazy().Machine.getMachine(S.server.getLevel(dim), new (lazy().Pos)(p.x, p.y, p.z)) }
  function ticket(dim, p) {
    var x = Math.floor(p.x / 16) * 16
    var z = Math.floor(p.z / 16) * 16
    var k = dim + ' ' + x + ',' + z
    if (S.chunks[k]) return
    S.chunks[k] = true
    S.server.getLevel(dim).getChunk(x >> 4, z >> 4)
    if (cmd(dim, 'forceload query ' + x + ' ' + z) > 0) return
    S.tickets.push({ dim: dim, x: x, z: z })
    cmd(dim, 'forceload add ' + x + ' ' + z)
  }
  function put(dim, p, id, facing) {
    if (p.x < X0 || p.x > X1 || p.z < 0 || p.z > 63) throw new Error('outside the band ' + p.x + ',' + p.z)
    ticket(dim, p)
    S.order.push({ dim: dim, p: p })
    cmd(dim, 'setblock ' + p.x + ' ' + p.y + ' ' + p.z + ' ' + id + (facing ? '[facing=north]' : '') + ' replace')
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
  // places the machine with its controller at O; returns the hatch positions by key
  function build(dim, name, O) {
    var desc = S.G.structures['gtceu:' + name]
    var ctl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var s = desc.symbols[row.charAt(ci)]
          if (s && s.kind === 'controller') ctl = { si: si, ri: ri, ci: ci }
        }
      })
    })
    var want = WANT[name].slice()
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
          for (var w = 0; w < want.length; w++) {
            if (allows(sym, want[w])) {
              id = HATCH[want[w]].id
              pos[HATCH[want[w]].key] = p
              facing = true
              want.splice(w, 1)
              break
            }
          }
          plan.push({ p: p, id: id || plain(sym), facing: facing })
        }
      })
    })
    plan.forEach(function (c) { put(dim, c.p, c.id, c.facing) })
    put(dim, O, 'gtceu:' + name, true)
    return pos
  }
  function fill(m) { try { m.energyContainer.setEnergyStored(m.energyContainer.getEnergyCapacity()) } catch (e) { } }
  function stock(dim, pos, circuit, items) {
    var bus = at(dim, pos.bus)
    bus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(circuit))
    var inv = bus.getInventory()
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, Item.empty)
    items.forEach(function (k, i) { inv.setStackInSlot(i, Item.of(k[0], k[1])) })
    return inv
  }
  function release() {
    S.order.slice().reverse().forEach(function (o) { try { cmd(o.dim, 'setblock ' + o.p.x + ' ' + o.p.y + ' ' + o.p.z + ' minecraft:air replace') } catch (e) { } })
    S.tickets.forEach(function (t) { try { cmd(t.dim, 'forceload remove ' + t.x + ' ' + t.z) } catch (e) { } })
  }
  function finish() {
    if (S.finished) return
    S.finished = true
    release()
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  function phase(name) { S.phase = name; S.phaseAt = S.tick; emit('stage', 'NOTE', name) }
  function row(type, name) {
    var CY = S.G.cygnus
    return (CY.recipes || []).filter(function (r) { return r.type === type && r.name === name })[0] || null
  }

  function statics() {
    var CY = S.G.cygnus
    check('static_published', !!CY && Array.isArray(CY.recipes), 'global.grindless.cygnus published')
    check('static_clean', (CY.skipped || []).length === 0 && (CY.clashes || []).length === 0, 'skipped ' + JSON.stringify(CY.skipped || []) + ' clashes ' + JSON.stringify(CY.clashes || []))
    var missing = MACHINES.filter(function (m) { return !S.G.structures['gtceu:' + m] })
    check('static_structures', missing.length === 0, 'no descriptor for ' + missing.join(','))
    var drop = row('penrose_extraction', 'penrose_drop')
    check('engine_figures', !!drop && drop.eut === 268435456 && drop.duration === 2400 && drop.generator === true && drop.site === true && drop.circuit === 1, JSON.stringify(drop))
    var refit = row('ergosphere_probing', 'refit_sled')
    check('refit_row', !!refit && refit.circuit === 3 && refit.site === true, JSON.stringify(refit))
    var ids = ['kerr_probe', 'split_sled', 'refit_sled', 'sled_hull', 'penrose_drop', 'luv/kerr_ringdown_record', 'event_horizon_imaging/correlated_kerr_data', 'synroc_liner', 'waste_canister_fill', 'canister_compaction']
    ids.forEach(function (o) { check('recipe_' + o, !!S.recipe(o), 'recipe id containing ' + o) })
  }

  function farPos(k) { return { x: X0 + 8 + k * 24, y: BASE_Y, z: 40 } }

  function step() {
    if (S.phase === 'build') {
      S.pos = {}
      MACHINES.forEach(function (m, i) { S.pos[m] = { O: farPos(i), p: build(FAR, m, farPos(i)) } })
      for (var cx = 0; cx < 4; cx++) for (var cz = 0; cz < 3; cz++) {
        ticket(NEAR, { x: X0 + cx * 16, z: cz * 16 })
        cmd(NEAR, 'fill ' + (X0 + cx * 16) + ' 90 ' + (cz * 16) + ' ' + (X0 + cx * 16 + 15) + ' 125 ' + (cz * 16 + 15) + ' minecraft:air')
      }
      var NO = { x: X0 + 8, y: BASE_Y, z: 40 }
      S.near = { O: NO, p: build(NEAR, 'ergosphere_probe_bay', NO) }
      phase('form')
      return
    }
    if (S.phase === 'form') {
      var formed = {}
      MACHINES.forEach(function (m) { var c = at(FAR, S.pos[m].O); formed[m] = !!c && c.isFormed() })
      var all = MACHINES.every(function (m) { return formed[m] })
      var nc = at(NEAR, S.near.O)
      var nearFormed = !!nc && nc.isFormed()
      if (all && (nearFormed || S.tick - S.phaseAt > 200)) {
        MACHINES.forEach(function (m) { check('forms_' + m, true, m + ' formed in ' + FAR) })
        emit('forms_anywhere', 'NOTE', 'near bay formed=' + nearFormed)
        var refit = [['grindless:recovered_half_sled', 1], ['grindless:compacted_waste_canister', 1], ['grindless:sled_charge', 1]]
        var B = S.pos.ergosphere_probe_bay
        stock(FAR, B.p, 3, refit)
        at(FAR, B.O).getRecipeLogic().updateTickSubscription()
        if (nc) { stock(NEAR, S.near.p, 3, refit); nc.getRecipeLogic().updateTickSubscription() }
        var E = S.pos.penrose_engine
        stock(FAR, E.p, 1, [['grindless:split_charge_sled', 1], ['grindless:kerr_chart', 1]])
        at(FAR, E.O).getRecipeLogic().updateTickSubscription()
        phase('run')
      } else if (S.tick - S.phaseAt > 400) {
        MACHINES.forEach(function (m) { check('forms_' + m, formed[m], m + (formed[m] ? ' formed' : ' did not form after 400 ticks')) })
        finish()
      }
      return
    }
    if (S.phase === 'run') {
      MACHINES.forEach(function (m) { var e = S.pos[m].p.e0 ? at(FAR, S.pos[m].p.e0) : null; if (e) fill(e) })
      var ne = at(NEAR, S.near.p.e0)
      if (ne) fill(ne)
      if (S.tick - S.phaseAt < 120) return
      var bay = at(FAR, S.pos.ergosphere_probe_bay.O)
      check('refit_runs', bay.getRecipeLogic().isWorking(), 'bay c3 at the site: status ' + bay.getRecipeLogic().getStatus())
      var near = at(NEAR, S.near.O)
      if (near) check('refit_refused_elsewhere', !near.getRecipeLogic().isWorking(), 'same recipe in the Overworld: working ' + near.getRecipeLogic().isWorking() + ', status ' + near.getRecipeLogic().getStatus())
      var eng = at(FAR, S.pos.penrose_engine.O)
      check('engine_runs', eng.getRecipeLogic().isWorking(), 'penrose_drop: status ' + eng.getRecipeLogic().getStatus())
      try {
        var dyn = at(FAR, S.pos.penrose_engine.p.dyn)
        var ec = dyn.energyContainer
        var cap = Number(ec.getOutputVoltage()) * Number(ec.getOutputAmperage())
        check('engine_dynamo', cap >= 268435456, 'dynamo hatch ' + dyn.getDefinition().getId() + ' pushes ' + cap + ' EU/t (needs 268,435,456)')
        check('engine_generates', Number(ec.getEnergyStored()) > 0, 'dynamo hatch holds ' + ec.getEnergyStored() + ' EU after 120 ticks')
      } catch (e) { check('engine_dynamo', false, errText(e)) }
      finish()
    }
  }

  ServerEvents.customCommand('gg_test_uiv_penrose', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestUivPenroseRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestUivPenroseRequest && Date.now() - LOADED_AT >= 10000) {
        global.ggTestUivPenroseRequest = false
        S = { server: event.server, G: global.grindless, failed: 0, finished: false, tick: 0, phase: 'build', phaseAt: 0, order: [], tickets: [], chunks: {} }
        S.recipe = function (id) { return event.server.getRecipeManager().getRecipes().stream().anyMatch(function (r) { return String(r.getId()).indexOf(id) >= 0 }) }
        try { statics() } catch (e) { check('static_exception', false, errText(e)) }
      }
      if (S !== null && !S.finished && S.phase) {
        S.tick++
        try { step() } catch (e) { check('exception', false, errText(e)); finish() }
      }
    } catch (e) {
      console.error('[gg_test uiv_penrose] ' + errText(e))
    }
  })
})()
