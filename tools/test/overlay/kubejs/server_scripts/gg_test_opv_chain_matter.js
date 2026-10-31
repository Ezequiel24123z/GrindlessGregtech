// priority: -6524
// TEST ONLY, OpV-A0 chain matter (process lines 1 and 2). Command: kubejs custom_command gg_test_opv_chain_matter
// Markers: GGTEST|opv_chain_matter|<check>|PASS/FAIL|..., then GGTEST|opv_chain_matter|DONE|failures=N.
// Band ONLY: X 37824-37887, Z 0-63, Y 98-115 (zones.json row opv_bulge_relay), built in grindless:sgr1806_orbit, the dimension the OpV-A0 rows of
// tables/vela_pasta.json are locked to. gg_test_opv_bulge_relay uses the same band in grindless:cygnus_x1_orbit; the SGR platform (64,100,64) is far.
// Doubt: UXV-B4's four pasta machines form at SGR 1806-20 with UXV hatches and run the new circuit 3-5 rows there (the rows existed only at Vela).
//   lookup      the 11 OpV-A0 rows, the PBO plant's c8 braid and the strand cable covering are in the recipe manager
//   formed      the extractor, phase sorter, draw bench and laminator form (one UXV energy hatch, HV buses)
//   <unit>_run  each runs its circuit 3 row: extractor chain_crust (bulge chart kept), sorter chain_caging (cage part consumed),
//               draw bench chain_strand_drawing, laminator chain_lamina
//   <unit>_out  the row's products reach the output bus; the kept chart stays and the cage part is gone
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 37824
  var X1 = 37887
  var Y0 = 98
  var Y1 = 115
  var NAME = 'opv_chain_matter'
  var DIM = 'grindless:sgr1806_orbit'
  var CY = 102
  var ENERGY = 'gtceu:uxv_energy_input_hatch'
  var CIRCUIT = 'gtceu:programmed_circuit'
  var C3 = '{Configuration:3}'

  var IDS = [
    'pasta_extraction/chain_crust', 'pasta_extraction/ni_chain', 'pasta_extraction/chain_lattice',
    'pasta_sorting/chain_caging', 'pasta_sorting/ni_chain_caging', 'pasta_sorting/lattice_caging',
    'pasta_drawing/chain_strand_drawing', 'pasta_drawing/chain_wire_drawing',
    'pasta_lamination/chain_lamina', 'pasta_lamination/chain_lamina_stack', 'pasta_lamination/chain_mesh_weave',
    'pbo_synthesis/chain_braid', 'assembler/chain_strand_single_cable'
  ]
  var HV = ['gtceu:hv_input_bus', 'gtceu:hv_output_bus']

  // feed: the input bus; recipe: the row expected to run; out: [id, at least] in the output bus; stays/gone: input bus after the run
  var UNITS = [
    { name: 'extractor', id: 'gtceu:pasta_extractor', cx: 37830, z: 8,
      feed: [[CIRCUIT, 1, C3], ['grindless:bulge_chart', 1], ['grindless:neutronium_pellet', 4]],
      recipe: 'grindless:pasta_extraction/chain_crust', out: [['grindless:chain_crust_slab', 1]], stays: 'grindless:bulge_chart' },
    { name: 'sorter', id: 'gtceu:pasta_phase_sorter', cx: 37842, z: 8,
      feed: [[CIRCUIT, 1, C3], ['grindless:chain_crust_slab', 1], ['grindless:cage_part', 1]],
      recipe: 'grindless:pasta_sorting/chain_caging', out: [['grindless:caged_chain_phase', 1], ['gtceu:iron_dust', 2]], gone: 'grindless:cage_part' },
    { name: 'draw_bench', id: 'gtceu:pasta_draw_bench', cx: 37852, z: 8,
      feed: [[CIRCUIT, 1, C3], ['grindless:caged_chain_phase', 1]],
      recipe: 'grindless:pasta_drawing/chain_strand_drawing', out: [['gtceu:chain_strand_ingot', 4]], gone: 'grindless:caged_chain_phase' },
    { name: 'laminator', id: 'gtceu:pasta_laminator', cx: 37862, z: 8,
      feed: [[CIRCUIT, 1, C3], ['grindless:caged_chain_lattice', 1]],
      recipe: 'grindless:pasta_lamination/chain_lamina', out: [['grindless:chain_lamina', 4]], gone: 'grindless:caged_chain_lattice' }
  ]

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine')
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
    try { s += ' @' + String(e.stack || '').split('\n').slice(0, 4).join(' ') } catch (x) { }
    return s === '' ? 'unprintable exception' : s
  }
  function clean(x) { return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 1500) }
  function check(name, ok, detail) {
    if (!ok) S.failed++
    console.info('GGTEST|' + NAME + '|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + clean(detail))
  }
  function command(text) { return S.server.runCommandSilent('execute in ' + DIM + ' run ' + text) }
  function pos(x, y, z) { return new (classes().Pos)(x, y, z) }
  function inBand(x, y, z) { return x >= X0 && x <= X1 && z >= 0 && z <= 63 && y >= Y0 && y <= Y1 }
  function put(x, y, z, block) {
    if (!inBand(x, y, z)) throw new Error('refused: ' + x + ',' + y + ',' + z + ' is outside the band')
    return command('setblock ' + x + ' ' + y + ' ' + z + ' ' + block + ' replace')
  }
  function machine(p) { return classes().Meta.getMachine(S.level, p) }
  function partsLike(ctrl, re) {
    var out = []
    array(ctrl.getParts()).forEach(function (p) { if (re.test(String(p.getDefinition().getId()))) out.push(p) })
    return out
  }
  function setBus(p, list) {
    var st = p.getInventory().storage
    for (var i = 0; i < st.getSlots(); i++) st.setStackInSlot(i, Item.of('minecraft:air'))
    var slot = 0
    list.forEach(function (e) { st.setStackInSlot(slot++, e.length > 2 ? Item.of(e[0], e[1], e[2]) : Item.of(e[0], e[1])) })
  }
  // id -> count over a bus's slots
  function contents(p) {
    var st = p.getInventory().storage
    var out = {}
    for (var i = 0; i < st.getSlots(); i++) {
      var s = st.getStackInSlot(i)
      if (s.isEmpty()) continue
      var id = String(s.getId())
      out[id] = (out[id] || 0) + Number(s.getCount())
    }
    return out
  }
  function topUp(list) { list.forEach(function (p) { var c = p.energyContainer; c.setEnergyStored(c.getEnergyCapacity()) }) }
  function formCheck(m, waited) {
    if (m.isFormed()) return true
    if (waited >= 100 && waited % 50 === 0) {
      if (m.checkPatternWithLock()) { m.setFlipped(m.getMultiblockState().isNeededFlip()); m.onStructureFormed() }
    }
    return m.isFormed()
  }
  function why(m) { try { return String(m.getMultiblockState().error) } catch (e) { return 'unknown' } }
  function reasons(m) { try { return String(m.getRecipeLogic().getFailureReasons()) } catch (e) { return 'unknown' } }

  // the structure: the template walk; the 'X' oneOf cells take the parts, spread evenly over the sorted cells
  function place(u) {
    var desc = global.grindless.patterns.describe(u.id)
    if (!desc) throw new Error('no structure description for ' + u.id)
    var cells = []
    var ctrl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var sym = desc.symbols[ch]
          if (sym.kind === 'controller') ctrl = { si: si, ri: ri, ci: ci }
          cells.push({ si: si, ri: ri, ci: ci, ch: ch, sym: sym })
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
    var chosen = {}
    var n = xs.length
    u.parts.forEach(function (id, i) { chosen[Math.floor(i * (n - 1) / (u.parts.length - 1))] = id })
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
      put(c.x, c.y, c.z, block + (part ? '[facing=north]' : ''))
    })
    put(controller.x, controller.y, controller.z, u.id + '[facing=north]')
    return pos(controller.x, controller.y, controller.z)
  }

  function registrationChecks() {
    var rm = S.server.getRecipeManager()
    var missing = IDS.filter(function (i) { return !rm.byKey(new (classes().RL)('grindless:' + i)).isPresent() })
    check('lookup', missing.length === 0, IDS.length + ' ids checked; missing: ' + (missing.length ? missing.join(', ') : 'none'))
    var G = global.grindless.velaPasta
    check('static_clean', !!G && G.skipped.length === 0 && G.clashes.length === 0, 'skipped ' + JSON.stringify(G ? G.skipped : null) + ' clashes ' + JSON.stringify(G ? G.clashes : null))
    var B = global.grindless.opvBulgeRelay
    check('static_cable', !!B && B.recipes.indexOf('grindless:assembler/chain_strand_single_cable') >= 0, 'bulge_relay.js recipes ' + JSON.stringify(B ? B.recipes : null))
  }

  function begin1(u, m) {
    u.m = m
    u.energy = partsLike(m, /uxv_energy_input_hatch/)
    u.bus = partsLike(m, /input_bus/)[0]
    u.outBus = partsLike(m, /output_bus/)[0]
    var ok = !!u.bus && !!u.outBus && u.energy.length === 1
    check(u.name + '_formed', ok, 'class ' + m.getClass().getSimpleName() + ', energy hatches ' + u.energy.length + ', parts ' + array(m.getParts()).length)
    if (!ok) return false
    setBus(u.bus, u.feed)
    u.last = m.getRecipeLogic().getLastRecipe()
    u.phase = 'run'
    u.started = S.tick
    return true
  }

  function tick(u) {
    var waited = S.tick - u.started
    var m = machine(u.pos)
    if (u.phase === 'forming') {
      if (!m || !formCheck(m, waited)) {
        if (waited > 600) { check(u.name + '_formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      if (!begin1(u, m)) u.phase = 'done'
      return
    }
    topUp(u.energy)
    var rec = m.getRecipeLogic().getLastRecipe()
    if (u.phase === 'run') {
      if (rec !== null && rec !== undefined && rec !== u.last) {
        check(u.name + '_run', String(rec.id) === u.recipe, 'expected ' + u.recipe + ', got ' + String(rec.id))
        u.phase = 'out'
        u.started = S.tick
      } else if (waited > 300) {
        check(u.name + '_run', false, 'no recipe started in 300 ticks; reasons ' + reasons(m) + '; input ' + JSON.stringify(contents(u.bus)))
        u.phase = 'done'
      }
      return
    }
    if (u.phase === 'out') {
      var got = contents(u.outBus)
      var short = u.out.filter(function (o) { return (got[o[0]] || 0) < o[1] })
      if (short.length === 0) {
        var left = contents(u.bus)
        var ok = true
        var detail = 'output ' + JSON.stringify(got) + '; input ' + JSON.stringify(left)
        if (u.stays && !(left[u.stays] >= 1)) { ok = false; detail = u.stays + ' was consumed; ' + detail }
        if (u.gone && left[u.gone]) { ok = false; detail = u.gone + ' is still in the bus; ' + detail }
        check(u.name + '_out', ok, detail)
        u.phase = 'done'
      } else if (waited > 1500) {
        check(u.name + '_out', false, 'after ' + waited + ' ticks missing ' + JSON.stringify(short) + '; output ' + JSON.stringify(got) + '; reasons ' + reasons(m))
        u.phase = 'done'
      }
    }
  }

  function clear() {
    for (var z = 0; z < 64; z += 8) command('fill ' + X0 + ' ' + Y0 + ' ' + z + ' ' + X1 + ' ' + Y1 + ' ' + (z + 7) + ' minecraft:air')
  }
  function finish() {
    if (S.finished) return
    S.finished = true
    try { clear() } catch (e) { }
    command('forceload remove ' + X0 + ' 0 ' + X1 + ' 63')
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  function begin(server) {
    S = { server: server, tick: 0, failed: 0, finished: false }
    S.level = server.getLevel(DIM)
    if (!S.level) { check('dimension', false, DIM + ' is not loaded'); finish(); return }
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    clear()
    try { registrationChecks() } catch (e) { check('registration_exception', false, errText(e)) }
    S.units = []
    UNITS.forEach(function (def) {
      var u = { name: def.name, id: def.id, cx: def.cx, z: def.z, parts: [ENERGY].concat(HV), feed: def.feed, recipe: def.recipe, out: def.out,
        stays: def.stays || null, gone: def.gone || null, phase: 'forming', started: S.tick }
      try {
        u.pos = place(u)
        S.units.push(u)
      } catch (e) { check(def.name + '_build_exception', false, errText(e)) }
    })
  }
  ServerEvents.customCommand('gg_test_opv_chain_matter', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestOpvChainMatterRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestOpvChainMatterRequest && Date.now() - LOADED >= 10000) {
        global.ggTestOpvChainMatterRequest = false
        begin(event.server)
      }
      if (S === null || S.finished) return
      S.tick++
      var pending = 0
      S.units.forEach(function (u) {
        if (u.phase === 'done') return
        try { tick(u) } catch (e) { check(u.name + '_exception', false, 'phase ' + u.phase + ': ' + errText(e)); u.phase = 'done' }
        if (u.phase !== 'done') pending++
      })
      if (pending === 0) finish()
      else if (S.tick > 4000) { check('deadline', false, '4000-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
