// priority: -8464
// UIV-B2 T1: the five RX J1856.5-3754 machines. Command: kubejs custom_command gg_test_uiv_rxj1856
// Band: X 35648-35711, Z 0-63, Y 98-115, in grindless:rx_j1856_orbit (B1's far place, read directly: no jump, no player) and, for the refusal, in the
// Overworld at the same X/Z/Y. The relay platform of B1 is at X 64, Z 64 and is not touched.
// Doubt: the decay heat vault as a local generator written final (12,000 ticks at 33,554,432 EU/t into its own UIV dynamo hatch) at a tier 11 datapack
// dimension, and the dimension lock of the five machines (they form anywhere, their recipes run only at the site).
//   T1: the five machines form at the site; a crust lift runs there and is refused in the Overworld; the separator and the vault start; the pellet,
//   the field generator, the element 119 recoil and census II resolve; the vault's figures and its dynamo hatch; the worn tether's scrap row.
(function () {
  var NAME = 'uiv_rxj1856'
  var FAR = 'grindless:rx_j1856_orbit'
  var NEAR = 'minecraft:overworld'
  var X0 = 35648
  var X1 = 35711
  var BASE_Y = 101
  var LOADED_AT = Date.now()
  var S = null
  var J = null

  var MACHINES = ['crust_lift', 'neutron_drip_separator', 'neutronium_cage', 'r_process_decompressor', 'decay_heat_vault']
  var HATCH = {
    input_bus: { id: 'gtceu:uhv_input_bus', key: 'bus' }, output_bus: { id: 'gtceu:uhv_output_bus', key: 'out' },
    energy_input: { id: 'gtceu:uiv_energy_input_hatch_16a', key: 'e0' }, energy_output: { id: 'gtceu:uiv_energy_output_hatch', key: 'dyn' },
    input_hatch: { id: 'gtceu:uhv_input_hatch', key: 'fin' }, output_hatch: { id: 'gtceu:uhv_output_hatch', key: 'fout' }
  }
  var WANT = {
    crust_lift: ['input_bus', 'output_bus', 'energy_input'],
    neutron_drip_separator: ['input_bus', 'output_bus', 'output_hatch', 'energy_input'],
    neutronium_cage: ['input_bus', 'output_bus', 'input_hatch', 'output_hatch', 'energy_input'],
    r_process_decompressor: ['input_bus', 'output_bus', 'input_hatch', 'output_hatch', 'energy_input'],
    decay_heat_vault: ['input_bus', 'output_bus', 'output_hatch', 'energy_output']
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
  function contents(inv) {
    var out = []
    for (var i = 0; i < inv.getSlots(); i++) {
      var st = inv.getStackInSlot(i)
      if (!st.isEmpty()) out.push(String(st.getId()) + 'x' + st.getCount())
    }
    return out.join(' ') || 'empty'
  }
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
    var RX = S.G.rxJ1856
    return (RX.recipes || []).filter(function (r) { return r.type === type && r.name === name })[0] || null
  }

  function statics() {
    var RX = S.G.rxJ1856
    check('static_published', !!RX && Array.isArray(RX.recipes), 'global.grindless.rxJ1856 published')
    check('static_clean', (RX.skipped || []).length === 0 && (RX.clashes || []).length === 0, 'skipped ' + JSON.stringify(RX.skipped || []) + ' clashes ' + JSON.stringify(RX.clashes || []))
    var missing = MACHINES.filter(function (m) { return !S.G.structures['gtceu:' + m] })
    check('static_structures', missing.length === 0, 'no descriptor for ' + missing.join(','))
    var vault = row('decay_heat', 'kilonova_decay')
    check('vault_figures', !!vault && vault.eut === 33554432 && vault.duration === 12000 && vault.generator === true && vault.site === true && vault.circuit === 1, JSON.stringify(vault))
    var ash = row('decay_heat', 'capsule_opening')
    check('vault_ash', !!ash && ash.itemsOut.some(function (o) { return o.id === 'grindless:r_process_ash' && o.count === 4 }) && ash.fluidsOut.some(function (f) { return f.id === 'gtceu:helium_4_ash' && f.amount === 1000 }), JSON.stringify(ash))
    var lift = row('crust_lifting', 'crust_lift')
    check('lift_row', !!lift && lift.eut === 31457280 && lift.site === true && lift.wear.length === 1 && lift.kept.length === 1, JSON.stringify(lift))
    var pellet = row('neutronium_caging', 'neutronium_pellet')
    check('pellet_row', !!pellet && pellet.itemsIn.some(function (i) { return i.id === 'grindless:cage_part' }) && pellet.itemsOut.some(function (o) { return o.id === 'grindless:neutronium_pellet' }), JSON.stringify(pellet))
    var fg = row('assembler', 'uiv_field_generator')
    check('field_generator_row', !!fg && fg.itemsIn.some(function (i) { return i.id === 'grindless:neutronium_pellet' }) && fg.itemsOut.some(function (o) { return o.id === 'gtceu:uiv_field_generator' }), JSON.stringify(fg))
    var dec = row('r_process_decompression', 'flash_target')
    check('flash_row', !!dec && dec.itemsOut.length === 1 && dec.itemsOut[0].id === 'grindless:flashed_target', JSON.stringify(dec))
    var older = S.older || []
    older.forEach(function (o) { check('older_' + o[0], !!S.recipe(o[0]), o[1]) })
  }

  function farPos(k) { return { x: X0 + 6 + k * 13, y: BASE_Y, z: 40 } }

  function step() {
    var k
    if (S.phase === 'build') {
      S.pos = {}
      MACHINES.forEach(function (m, i) { S.pos[m] = { O: farPos(i), p: build(FAR, m, farPos(i)) } })
      var NO = { x: X0 + 24, y: BASE_Y, z: 40 }
      for (var cx = 0; cx < 3; cx++) for (var cz = 0; cz < 3; cz++) {
        ticket(NEAR, { x: X0 + cx * 16, z: cz * 16 })
        cmd(NEAR, 'fill ' + (X0 + cx * 16) + ' 90 ' + (cz * 16) + ' ' + (X0 + cx * 16 + 15) + ' 125 ' + (cz * 16 + 15) + ' minecraft:air')
      }
      S.near = { O: NO, p: build(NEAR, 'crust_lift', NO) }
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
        var diag = 'near crust lift formed=' + nearFormed
        try { if (nc && !nearFormed) diag += ' pattern=' + String(nc.getPattern().getError()) } catch (e) { diag += ' (no pattern error: ' + e + ')' }
        emit('forms_anywhere', 'NOTE', diag)
        // the lift runs at the site, is refused in the Overworld; the separator and the vault start
        var L = S.pos.crust_lift
        stock(FAR, L.p, 1, [['grindless:crust_lift_tether', 1], ['grindless:polar_cap_electrode', 1]])
        at(FAR, L.O).getRecipeLogic().updateTickSubscription()
        var N = S.near
        if (nc) { stock(NEAR, N.p, 1, [['grindless:crust_lift_tether', 1], ['grindless:polar_cap_electrode', 1]])
        nc.getRecipeLogic().updateTickSubscription() }
        var P = S.pos.neutron_drip_separator
        stock(FAR, P.p, 1, [['grindless:neutron_star_crust', 4], ['grindless:neutron_supermirror', 1]])
        at(FAR, P.O).getRecipeLogic().updateTickSubscription()
        var V = S.pos.decay_heat_vault
        stock(FAR, V.p, 1, [['grindless:kilonova_capsule', 1]])
        at(FAR, V.O).getRecipeLogic().updateTickSubscription()
        phase('run')
      } else if (S.tick - S.phaseAt > 400) {
        MACHINES.forEach(function (m) { check('forms_' + m, formed[m], m + (formed[m] ? ' formed' : ' did not form after 400 ticks')) })
        finish()
      }
      return
    }
    if (S.phase === 'run') {
      MACHINES.forEach(function (m) { var e = S.pos[m].p.e0 ? at(FAR, S.pos[m].p.e0) : null; if (e) fill(e) })
      if (S.pos.crust_lift) { var ne = at(NEAR, S.near.p.e0); if (ne) fill(ne) }
      if (S.tick - S.phaseAt < 120) return
      var lift = at(FAR, S.pos.crust_lift.O)
      check('lift_runs', lift.getRecipeLogic().isWorking(), 'crust lift at the site: status ' + lift.getRecipeLogic().getStatus())
      var near = at(NEAR, S.near.O)
      if (near) check('lift_refused_elsewhere', !near.getRecipeLogic().isWorking(), 'same recipe in the Overworld: working ' + near.getRecipeLogic().isWorking() + ', status ' + near.getRecipeLogic().getStatus())
      var sep = at(FAR, S.pos.neutron_drip_separator.O)
      check('separator_runs', sep.getRecipeLogic().isWorking(), 'inner_crust: status ' + sep.getRecipeLogic().getStatus())
      var vault = at(FAR, S.pos.decay_heat_vault.O)
      check('vault_runs', vault.getRecipeLogic().isWorking(), 'kilonova_decay: status ' + vault.getRecipeLogic().getStatus())
      try {
        var dyn = at(FAR, S.pos.decay_heat_vault.p.dyn)
        var ec = dyn.energyContainer
        var cap = Number(ec.getOutputVoltage()) * Number(ec.getOutputAmperage())
        check('vault_dynamo', cap >= 33554432, 'dynamo hatch ' + dyn.getDefinition().getId() + ' pushes ' + cap + ' EU/t (needs 33,554,432)')
        check('vault_generates', Number(ec.getEnergyStored()) > 0, 'dynamo hatch holds ' + ec.getEnergyStored() + ' EU after 120 ticks')
      } catch (e) { check('vault_dynamo', false, errText(e)) }
      finish()
    }
  }

  ServerEvents.customCommand('gg_test_uiv_rxj1856', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestUivRxj1856Request = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestUivRxj1856Request && Date.now() - LOADED_AT >= 10000) {
        global.ggTestUivRxj1856Request = false
        S = { server: event.server, G: global.grindless, failed: 0, finished: false, tick: 0, phase: 'build', phaseAt: 0, order: [], tickets: [], chunks: {}, older: [
          ['es_fm_debris', 'hot cell c13'], ['ash_actinide_cut', 'hot cell c14'], ['es254_extraction', 'transcurium c9'], ['es254_bombard', 'cyclotron c8'],
          ['element_119_recoil', 'recoil separator c7: element 119'], ['census_ii', 'chemistry lab c3: census II'], ['u238_flash_target', 'uranium cycle c10'],
          ['uiv/r_process_ash', 'platinum plant c10'], ['es_fm_cut', 'actinide partitioning c6'], ['mh_tether', 'tether works c3'],
          ['worn_tether_scrap', 'tether works c4: the worn tether returns'], ['bn_coated_cnt_yarn', 'BN reactor c6']
        ] }
        S.recipe = function (id) { return event.server.getRecipeManager().getRecipes().stream().anyMatch(function (r) { return String(r.getId()).indexOf(id) >= 0 }) }
        try { statics() } catch (e) { check('static_exception', false, errText(e)) }
      }
      if (S !== null && !S.finished && S.phase) {
        S.tick++
        try { step() } catch (e) { check('exception', false, errText(e)); finish() }
      }
    } catch (e) {
      console.error('[gg_test uiv_rxj1856] ' + errText(e))
    }
  })
})()
