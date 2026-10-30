// priority: -9986
// TEST ONLY, UXV-B4 (gtceu:pasta_extractor, pasta_phase_sorter, pasta_draw_bench, pasta_laminator, polar_cap_tap). Command: kubejs custom_command gg_test_uxv_vela_pasta
// Band ONLY: X 36928-36991, Z 0-63, Y 98-115, built in grindless:vela_pulsar_orbit (the dimension their recipes are locked to).
//   T1 (named uncertainty: the tap's c1 row (one lasagna electrode -> 536,870,912 EU/t for 720 t, a generator written final through one UIV 16 A dynamo
//   hatch) starts, and that power crosses a run of gtceu:pasta_strand_quadruple_cable (16 A = 4 A x V[UXV]) into a UXV energy hatch; and every machine forms with UXV hatches):
//     lookup     every row, line 48, the hull, the hatches and the five controllers' assembly lines are in the recipe manager
//     formed     the five machines form (UXV hatches; the tap with a UIV 16 A dynamo hatch)
//     tap        c1 starts at 536,870,912 EU/t (generator)
//     wire       a run of pasta strand wire from the dynamo hatch fills a UXV energy hatch; the wire is still there after 100 ticks
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 36928
  var X1 = 36991
  var Y0 = 98
  var Y1 = 115
  var NAME = 'uxv_vela_pasta'
  var DIM = 'grindless:vela_pulsar_orbit'
  var CY = 102
  var EUT = 536870912
  var ENERGY = 'gtceu:uxv_energy_input_hatch'
  var DYNAMO = 'gtceu:uiv_energy_output_hatch_16a'
  var WIRE = 'gtceu:pasta_strand_quadruple_cable'
  var CIRCUIT = 'gtceu:programmed_circuit'

  var IDS = [
    'pasta_extraction/pasta_extraction', 'pasta_sorting/phase_sorting', 'pasta_sorting/core_sample', 'pasta_drawing/strand_drawing',
    'pasta_lamination/plate_pressing', 'pasta_lamination/lasagna_electrode', 'polar_cap_tapping/polar_cap_tap', 'neutronium_caging/cage_part_pressing',
    'telemetry_decoding/vela_glitch_timing', 'gravitational_wave_astronomy/luv/vela_glitch_record', 'assembler/finemet_toroid', 'assembler/uxv_voltage_coil',
    'assembler/pasta_strand_repeater', 'assembly_line/uxv_machine_hull', 'assembly_line/uxv_energy_input_hatch', 'assembly_line/uxv_energy_output_hatch',
    'assembly_line/uxv_energy_input_hatch_16a', 'assembly_line/uxv_energy_output_hatch_16a', 'assembly_line/pasta_extractor',
    'assembly_line/pasta_phase_sorter', 'assembly_line/pasta_draw_bench', 'assembly_line/pasta_laminator', 'assembly_line/polar_cap_tap'
  ]
  var HV = ['gtceu:hv_input_bus', 'gtceu:hv_output_bus']

  var UNITS = [
    { name: 'extractor', id: 'gtceu:pasta_extractor', cx: 36934, z: 8, parts: [ENERGY].concat(HV) },
    { name: 'sorter', id: 'gtceu:pasta_phase_sorter', cx: 36946, z: 8, parts: [ENERGY].concat(HV) },
    { name: 'draw_bench', id: 'gtceu:pasta_draw_bench', cx: 36956, z: 8, parts: [ENERGY].concat(HV) },
    { name: 'laminator', id: 'gtceu:pasta_laminator', cx: 36966, z: 8, parts: [ENERGY].concat(HV) },
    { name: 'tap', id: 'gtceu:polar_cap_tap', cx: 36980, z: 8, parts: [DYNAMO, 'gtceu:hv_input_bus'], tap: true }
  ]

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
      RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper')
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
  function note(name, detail) { console.info('GGTEST|' + NAME + '|' + name + '|NOTE|' + clean(detail)) }
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
  function topUp(list) { list.forEach(function (p) { var c = p.energyContainer; c.setEnergyStored(c.getEnergyCapacity()) }) }
  function formCheck(m, waited) {
    if (m.isFormed()) return true
    if (waited >= 100 && waited % 50 === 0) {
      if (m.checkPatternWithLock()) { m.setFlipped(m.getMultiblockState().isNeededFlip()); m.onStructureFormed() }
    }
    return m.isFormed()
  }
  function why(m) { try { return String(m.getMultiblockState().error) } catch (e) { return 'unknown' } }
  function reasons(m) { return String(m.getRecipeLogic().getFailureReasons()) }

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
  }

  function begin1(u, m) {
    u.m = m
    u.energy = partsLike(m, u.tap ? /uiv_energy_output_hatch_16a/ : /uxv_energy_input_hatch/)
    u.bus = partsLike(m, /input_bus/)[0]
    var ok = !!u.bus && u.energy.length === 1
    check(u.name + '_formed', ok, 'class ' + m.getClass().getSimpleName() + ', energy hatches ' + u.energy.length + ', parts ' + array(m.getParts()).length)
    return ok
  }

  // a run of strand wire from the dynamo hatch's front to a UXV energy hatch of its own
  function wireUp(u) {
    var h = u.energy[0]
    var hp = h.getPos()
    var f = h.getFrontFacing()
    var dx = f.getNormal().getX()
    var dz = f.getNormal().getZ()
    u.wire = []
    for (var i = 1; i <= 3; i++) {
      put(hp.getX() + dx * i, hp.getY(), hp.getZ() + dz * i, WIRE)
      u.wire.push(pos(hp.getX() + dx * i, hp.getY(), hp.getZ() + dz * i))
    }
    var sx = hp.getX() + dx * 4
    var sz = hp.getZ() + dz * 4
    var opposite = f.getOpposite().getName()
    put(sx, hp.getY(), sz, ENERGY + '[facing=' + opposite + ']')
    u.sink = pos(sx, hp.getY(), sz)
    // a setblock pipe has no connections: link each cable to its neighbours the way PipeBlockItem.placeBlock does
    try {
      u.wire.forEach(function (p) {
        var be = S.level.getBlockEntity(p)
        be.setConnection(f, true, false)
        be.setConnection(f.getOpposite(), true, false)
      })
    } catch (e) { check('wire_build', false, errText(e)) }
    note('wire_layout', 'dynamo at ' + hp + ' facing ' + f + ', wire ' + u.wire.length + ' blocks, sink at ' + u.sink)
  }

  function startRun(u) {
    // a generator needs room to put its power: the dynamo hatch starts empty
    setBus(u.bus, [[CIRCUIT, 1, '{Configuration:1}'], ['grindless:lasagna_electrode', 1]])
    try { wireUp(u) } catch (e) { check('wire_build', false, errText(e)) }
    u.last = u.m.getRecipeLogic().getLastRecipe()
    u.started = S.tick
    u.phase = 'run'
  }

  function tick(u) {
    var waited = S.tick - u.started
    var m = machine(u.pos)
    if (u.phase === 'forming') {
      if (!m || !formCheck(m, waited)) {
        if (waited > 600) { check(u.name + '_formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      if (!begin1(u, m)) { u.phase = 'done'; return }
      if (u.tap) startRun(u)
      else u.phase = 'done'
      return
    }
    var rlg = m.getRecipeLogic()
    if (u.phase === 'run') {
      var rec = rlg.getLastRecipe()
      if (rec !== null && rec !== undefined && rec !== u.last) {
        var eut = NaN
        try { var io = classes().RecipeHelper.getRealEUtWithIO(rec); eut = io.isEmpty() ? 0 : Math.abs(Number(io.getTotalEU())) } catch (e) { }
        note(u.name + '_measured', 'recipe ' + String(rec.id) + ', EU/t ' + eut + ', max voltage ' + m.getMaxVoltage())
        check(u.name + '_eut', eut === EUT, 'expected ' + EUT + ' EU/t, got ' + eut + '; reasons ' + reasons(m))
        u.phase = 'flow'
        u.started = S.tick
        u.sinkStart = 0
      } else if (waited > 300) {
        check(u.name + '_eut', false, 'no recipe started in 300 ticks; reasons ' + reasons(m))
        u.phase = 'done'
      }
      return
    }
    if (u.phase === 'flow') {
      var sm = u.sink ? machine(u.sink) : null
      if (!sm) { check('wire_flow', false, 'no sink hatch at ' + u.sink); u.phase = 'done'; return }
      var stored = Number(sm.energyContainer.getEnergyStored())
      if (waited >= 100) {
        var alive = true
        var masks = []
        u.wire.forEach(function (p) {
          if (String(S.level.getBlock(p.getX(), p.getY(), p.getZ()).getId()) !== WIRE) alive = false
          try { masks.push(String(S.level.getBlockEntity(p).getConnections())) } catch (e) { masks.push('?') }
        })
        note('wire_measured', 'connections ' + masks.join(',') + '; sink stored ' + stored + ' EU after ' + waited + ' ticks, max voltage ' + sm.getMaxVoltage() + ', tap stored ' + u.energy[0].energyContainer.getEnergyStored())
        check('wire_flow', stored > 0 && alive, 'sink hatch stored ' + stored + ' EU; wire intact ' + alive)
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
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    clear()
    try { registrationChecks() } catch (e) { check('registration_exception', false, errText(e)) }
    S.units = []
    UNITS.forEach(function (def) {
      var u = { name: def.name, id: def.id, cx: def.cx, z: def.z, parts: def.parts, tap: def.tap === true, phase: 'forming', started: S.tick }
      try {
        u.pos = place(u)
        S.units.push(u)
      } catch (e) { check(def.name + '_build_exception', false, errText(e)) }
    })
  }
  ServerEvents.customCommand('gg_test_uxv_vela_pasta', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestUxvVelaPastaRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestUxvVelaPastaRequest && Date.now() - LOADED >= 10000) {
        global.ggTestUxvVelaPastaRequest = false
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
