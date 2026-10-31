// TEST ONLY, OpV-A3 (gtceu:field_frozen_press, the OpV field generator and the six OpV hatches). Command: kubejs custom_command gg_test_opv_field_press
// Band ONLY: X 38016-38079, Z 0-63, Y 98-115, in grindless:sgr1806_orbit (the press's rows are locked to SGR 1806-20's orbit).
//   T1 (named uncertainty: machine 13 forms at its site on two UXV 4 A hatches, and an OpV 16 A energy hatch it made feeds a 2^30 row as long):
//     lookup          the press rows, its controller, the field generator, the six hatches, EB c22 and line 45's older rows are in the recipe manager
//     static_clean    nothing skipped, no clash, one field generator and six hatch recipes made
//     a_formed        a press forms with two UXV 4 A energy hatches
//     c1_eut          its c1 billet row starts there at 268,435,456 EU/t (above V[UXV]: two hatches of the top tier lift the voltage one tier)
//     b_formed        a second press forms with one OpV 16 A energy hatch
//     probe_eut_long  a test row at 2^30 EU/t (above V[OpV], within 16 A) starts on it and reads 1,073,741,824 EU/t
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 38016
  var X1 = 38079
  var Y0 = 98
  var Y1 = 115
  var NAME = 'opv_field_press'
  var SGR = 'grindless:sgr1806_orbit'
  var CY = 106
  var PROBE_EUT = '1073741824'
  var UXV_4A = 'gtceu:uxv_energy_input_hatch_4a'
  var OPV_16A = 'gtceu:opv_energy_input_hatch_16a'
  var CIRCUIT = 'gtceu:programmed_circuit'

  var IDS = [
    'grindless:field_freezing/field_frozen_billet', 'grindless:field_freezing/field_frozen_plate', 'grindless:field_freezing/field_frozen_casing',
    'grindless:assembly_line/field_frozen_press', 'grindless:assembler/opv_field_generator',
    'grindless:assembly_line/opv_energy_input_hatch', 'grindless:assembly_line/opv_energy_input_hatch_4a', 'grindless:assembly_line/opv_energy_input_hatch_16a',
    'grindless:assembly_line/opv_energy_output_hatch', 'grindless:assembly_line/opv_energy_output_hatch_4a', 'grindless:assembly_line/opv_energy_output_hatch_16a',
    'grindless:electron_beam_refining/field_can', 'grindless:electron_beam_refining/field_can_remelt',
    'grindless:nitride_magnet_synthesis/aln_powder', 'grindless:nitride_magnet_synthesis/aln_kerf_repress', 'grindless:crystal_growth/crystal_growth/aln_boule',
    'grindless:cutter/aln_wafer', 'grindless:mocvd/mocvd/algan_epi', 'grindless:beuv_lithography/algan_gates', 'grindless:silicon_carbide/aln_power_die',
    'gg_test_opv_field_press:field_freezing/probe'
  ]

  var UNITS = [
    { name: 'a', cx: 38030, z: 16, energy: /uxv_energy_input_hatch_4a/, hatches: 2, parts: [UXV_4A, UXV_4A, 'gtceu:hv_input_bus', 'gtceu:hv_output_bus'],
      bus: [[CIRCUIT, 1, '{Configuration:1}'], ['grindless:field_canned_stack', 4]], recipe: 'field_frozen_billet', expect: 268435456, eutCheck: 'c1_eut' },
    { name: 'b', cx: 38060, z: 40, energy: /opv_energy_input_hatch_16a/, hatches: 1, parts: [OPV_16A, 'gtceu:hv_input_bus', 'gtceu:hv_output_bus'],
      bus: [[CIRCUIT, 1, '{Configuration:32}'], ['minecraft:dandelion', 1]], recipe: 'probe', expect: 1073741824, eutCheck: 'probe_eut_long' }
  ]

  // the probe: a 2^30 EU/t row on the press's own type, passed as a long; circuit 32 and a dandelion keep it apart from the real rows
  ServerEvents.recipes(function (event) {
    try {
      var Long = Java.loadClass('java.lang.Long')
      event.recipes.gtceu.field_freezing('gg_test_opv_field_press:probe').notConsumable('1x minecraft:dandelion').circuit(32)
        .itemOutputs('1x minecraft:poppy').dimension(SGR).EUt(Long.valueOf(PROBE_EUT)).duration(200)
    } catch (e) { console.error('[gg_test opv_field_press] could not add the probe: ' + errText(e)) }
  })

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
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
  function command(text) { return S.server.runCommandSilent('execute in ' + SGR + ' run ' + text) }
  function pos(x, y, z) { return new (classes().Pos)(x, y, z) }
  function inBand(x, y, z) { return x >= X0 && x <= X1 && z >= 0 && z <= 63 && y >= Y0 && y <= Y1 }
  function put(x, y, z, block) {
    if (!inBand(x, y, z)) throw new Error('refused: ' + x + ',' + y + ',' + z + ' is outside the band')
    return command('setblock ' + x + ' ' + y + ' ' + z + ' ' + block + ' replace')
  }
  function machine(u) { return classes().Meta.getMachine(u.level, u.pos) }
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

  // the structure: the template walk; the 'X' oneOf cells take the parts, spread evenly over the sorted cells (first part: lowest z)
  function place(u) {
    var desc = global.grindless.patterns.describe('gtceu:field_frozen_press')
    if (!desc) throw new Error('no structure description for gtceu:field_frozen_press')
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
    put(controller.x, controller.y, controller.z, 'gtceu:field_frozen_press[facing=north]')
    return pos(controller.x, controller.y, controller.z)
  }

  function registrationChecks() {
    var rm = S.server.getRecipeManager()
    var missing = IDS.filter(function (i) { return !rm.byKey(new (classes().RL)(i)).isPresent() })
    check('lookup', missing.length === 0, IDS.length + ' ids checked; missing: ' + (missing.length ? missing.join(', ') : 'none'))
    var FP = global.grindless.fieldPress
    var ok = !!FP && FP.skipped.length === 0 && FP.clashes.length === 0 && FP.fieldGeneratorRecipes.length === 1 && FP.hatchRecipes.length === 6
    check('static_clean', ok, FP ? 'skipped ' + JSON.stringify(FP.skipped) + ' clashes ' + JSON.stringify(FP.clashes) + ' field generator ' +
      JSON.stringify(FP.fieldGeneratorRecipes) + ' hatches ' + JSON.stringify(FP.hatchRecipes) : 'no global.grindless.fieldPress')
  }

  function begin1(u, m) {
    u.m = m
    u.energy = partsLike(m, u.energyRe)
    u.inBus = partsLike(m, /input_bus/)[0]
    u.outBus = partsLike(m, /output_bus/)[0]
    var ok = !!u.inBus && !!u.outBus && u.energy.length === u.hatches
    check(u.name + '_formed', ok, 'class ' + m.getClass().getSimpleName() + ', energy hatches ' + u.energy.length + ', max voltage ' + m.getMaxVoltage() +
      ', parts ' + array(m.getParts()).length)
    return ok
  }

  function startRun(u) {
    setBus(u.inBus, u.bus)
    topUp(u.energy)
    u.last = u.m.getRecipeLogic().getLastRecipe()
    try { u.m.getRecipeLogic().updateTickSubscription() } catch (e) { }
    u.started = S.tick
    u.phase = 'run'
  }

  function tick(u) {
    var waited = S.tick - u.started
    var m = machine(u)
    if (u.phase === 'forming') {
      if (!m || !formCheck(m, waited)) {
        if (waited > 600) { check(u.name + '_formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      if (!begin1(u, m)) { u.phase = 'done'; return }
      startRun(u)
      return
    }
    var rlg = m.getRecipeLogic()
    if (u.phase === 'run') {
      var rec = rlg.getLastRecipe()
      if (rec !== null && rec !== undefined && rec !== u.last) {
        var eut = NaN
        try { var io = classes().RecipeHelper.getRealEUtWithIO(rec); eut = io.isEmpty() ? 0 : Math.abs(Number(io.getTotalEU())) } catch (e) { }
        note(u.name + '_measured', 'recipe ' + String(rec.id) + ', EU/t ' + eut + ', status ' + rlg.getStatus() + ', max voltage ' + m.getMaxVoltage())
        check(u.eutCheck, String(rec.id).indexOf(u.recipe) >= 0 && eut === u.expect, 'expected ' + u.recipe + ' at ' + u.expect + ' EU/t, got ' + String(rec.id) +
          ' at ' + eut + '; reasons ' + reasons(m))
        u.phase = 'done'
      } else if (waited > 400) {
        check(u.eutCheck, false, 'no recipe started in 400 ticks; status ' + rlg.getStatus() + ', max voltage ' + m.getMaxVoltage() + ', reasons ' + reasons(m))
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
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    clear()
    try { registrationChecks() } catch (e) { check('registration_exception', false, errText(e)) }
    S.units = []
    UNITS.forEach(function (def) {
      var u = { name: def.name, cx: def.cx, z: def.z, parts: def.parts, bus: def.bus, energyRe: def.energy, hatches: def.hatches, recipe: def.recipe,
        expect: def.expect, eutCheck: def.eutCheck, phase: 'forming', started: S.tick }
      try {
        u.level = server.getLevel(SGR)
        if (!u.level) throw new Error('no level ' + SGR)
        u.pos = place(u)
        S.units.push(u)
      } catch (e) { check(def.name + '_build_exception', false, errText(e)) }
    })
  }
  ServerEvents.customCommand('gg_test_opv_field_press', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestOpvFieldPressRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestOpvFieldPressRequest && Date.now() - LOADED >= 10000) {
        global.ggTestOpvFieldPressRequest = false
        begin(event.server)
      }
      if (S === null || S.finished) return
      S.tick++
      var pending = 0
      S.units.forEach(function (u) {
        if (u.phase === 'done') return
        try {
          if (u.m && u.m.isFormed() && u.energy && u.energy.length) topUp(u.energy)
          tick(u)
        } catch (e) { check(u.name + '_exception', false, 'phase ' + u.phase + ': ' + errText(e)); u.phase = 'done' }
        if (u.phase !== 'done') pending++
      })
      if (pending === 0) finish()
      else if (S.tick > 3000) { check('deadline', false, '3000-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
