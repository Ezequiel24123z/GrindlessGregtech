// TEST ONLY, OpV-D3 (gtceu:kugelblitz_forge, gtceu:hawking_collector). Command: kubejs custom_command gg_test_opv_kugelblitz
// Band ONLY: X 38336-38399, Z 0-63, Y 98-115, built in grindless:cygnus_x1_orbit (the dimension their recipes are locked to).
//   T1 (named uncertainty: the collector's c1 row is a generator at 2^30 EU/t, a long, with a core wearing exactly 1/64; GTM's builder cannot
//   hold 1/64, so the row is plain recipe JSON with chance 1 and maxChance 64):
//     lookup     the seven rows and the two controllers' assembly lines are in the recipe manager
//     wear_json  the loaded c1 / c2 / seed rows hold the core and optics at chance 1, maxChance 64 (c2: 1/32)
//     wear_roll  GTM's own chance logic, rolled 20,000 times on the loaded core content, consumes the core about 1/64 of the time
//     formed     forge and collector form in the orbit dimension with their hatches
//     hp_eut     the collector's c1 starts and is 1,073,741,824 EU/t (a long)
//     hp_dynamo  two OpV 1 A dynamos write exactly 2^30 EU per productive tick for the first 1,200 ticks, then stop
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 38336
  var X1 = 38399
  var Y0 = 98
  var Y1 = 115
  var NAME = 'opv_kugelblitz'
  var DIM = 'grindless:cygnus_x1_orbit'
  var CY = 106
  var EUT = 1073741824
  var ENERGY = 'gtceu:opv_energy_input_hatch'
  var DYNAMO = 'gtceu:opv_energy_output_hatch'
  var CIRCUIT = 'gtceu:programmed_circuit'

  var IDS = [
    'kugelblitz_forming/charge_gamma_pump', 'kugelblitz_forming/focus_kugelblitz_seed', 'kugelblitz_forming/condense_kugelblitz_core',
    'kugelblitz_forming/forge_hawking_drive', 'kugelblitz_forming/recondense_core_from_shell', 'hawking_power/feed_exotic_matter',
    'hawking_power/feed_stellar_plasma', 'assembly_line/kugelblitz_forge', 'assembly_line/hawking_collector'
  ]

  var UNITS = [
    { name: 'forge', id: 'gtceu:kugelblitz_forge', cx: 38352, z: 18, parts: [ENERGY, ENERGY, 'gtceu:hv_input_bus', 'gtceu:hv_output_bus'], energy: 2, run: false },
    { name: 'collector', id: 'gtceu:hawking_collector', cx: 38384, z: 14, parts: [DYNAMO, DYNAMO, 'gtceu:hv_input_bus', 'gtceu:hv_input_hatch', 'gtceu:hv_output_bus'], energy: 0, run: true }
  ]

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

  // the loaded recipe's contents: [chance, maxChance] of the input item whose JSON mentions the id
  function chanceOf(recipe, needle, output) {
    var found = null
    var contents = output ? recipe.outputs : recipe.inputs
    var caps = array(contents.keySet())
    caps.forEach(function (cap) {
      array(contents.get(cap)).forEach(function (c) {
        if (String(c.content).indexOf(needle) >= 0 || String(c.content.toJson ? c.content.toJson() : '').indexOf(needle) >= 0) found = c
      })
    })
    return found
  }
  function loaded(id) {
    var o = S.server.getRecipeManager().byKey(new (classes().RL)('grindless:' + id))
    return o.isPresent() ? o.get() : null
  }

  function wearChecks() {
    var want = [['hawking_power/feed_exotic_matter', 'kugelblitz_core', 1, 64], ['hawking_power/feed_stellar_plasma', 'kugelblitz_core', 1, 32],
      ['kugelblitz_forming/focus_kugelblitz_seed', 'laue_lens', 1, 64], ['kugelblitz_forming/focus_kugelblitz_seed', 'gamma_multilayer_mirror', 1, 64],
      ['hawking_power/feed_exotic_matter', 'activated_absorber_tile', 1250, 10000, true],
      ['hawking_power/feed_stellar_plasma', 'activated_absorber_tile', 1250, 10000, true]]
    var bad = []
    var core = null
    want.forEach(function (w) {
      var r = loaded(w[0])
      var c = r === null ? null : chanceOf(r, w[1], w[4] === true)
      if (c === null) { bad.push(w[0] + ' ' + w[1] + ': content not found'); return }
      if (Number(c.chance) !== w[2] || Number(c.maxChance) !== w[3]) bad.push(w[0] + ' ' + w[1] + ': ' + c.chance + '/' + c.maxChance)
      if (w[0] === 'hawking_power/feed_exotic_matter' && w[1] === 'kugelblitz_core') core = c
    })
    check('wear_json', bad.length === 0, bad.length ? bad.join('; ') : 'c1 core 1/64, c2 core 1/32, seed optics 1/64; both activated tile outputs 1250/10000')
    if (core === null) return
    try {
      var CL = Java.loadClass('com.gregtechceu.gtceu.api.recipe.chance.logic.ChanceLogic')
      var CB = Java.loadClass('com.gregtechceu.gtceu.api.recipe.chance.boost.ChanceBoostFunction')
      var one = new (classes().ArrayList)()
      one.add(core)
      var kept = 0
      var N = 20000
      for (var i = 0; i < N; i++) {
        var got = null
        try { got = CL.OR.roll(one, CB.OVERCLOCK, 0, 0, 0) } catch (e1) { got = CL.OR.roll(one, CB.OVERCLOCK, 0, 0) }
        if (got !== null && got.size() > 0) kept++
      }
      // 1/64 of 20,000 = 312.5, sigma 17.5: accept 250..375 (3.5 sigma)
      check('wear_roll', kept >= 250 && kept <= 375, kept + ' of ' + N + ' rolls consumed the core (1/64 expects 312)')
    } catch (e) { check('wear_roll', false, 'the chance logic API drifted, not sampled: ' + errText(e)) }
  }

  function registrationChecks() {
    var missing = IDS.filter(function (i) { return !S.server.getRecipeManager().byKey(new (classes().RL)('grindless:' + i)).isPresent() })
    check('lookup', missing.length === 0, IDS.length + ' ids checked; missing: ' + (missing.length ? missing.join(', ') : 'none'))
    var G = global.grindless.kugelblitz
    check('static_clean', !!G && G.skipped.length === 0 && G.clashes.length === 0, 'skipped ' + JSON.stringify(G ? G.skipped : null) + ' clashes ' + JSON.stringify(G ? G.clashes : null))
    wearChecks()
  }

  function begin1(u, m) {
    u.m = m
    u.energy = partsLike(m, /opv_energy_input_hatch/)
    u.dyn = partsLike(m, /energy_output_hatch/)
    u.bus = partsLike(m, /input_bus/)[0]
    u.hatch = partsLike(m, /^(?!.*energy).*input_hatch/)[0]
    var ok = !!u.bus && u.energy.length === u.energy_want && (u.name !== 'collector' || (u.dyn.length === 2 && !!u.hatch))
    check(u.name + '_formed', ok, 'class ' + m.getClass().getSimpleName() + ', OpV energy hatches ' + u.energy.length + ', dynamo hatches ' + u.dyn.length + ', parts ' + array(m.getParts()).length)
    return ok
  }

  function startRun(u) {
    setBus(u.bus, [[CIRCUIT, 1, '{Configuration:1}'], ['grindless:stable_exotic_matter', 1], ['grindless:kugelblitz_core', 1], ['grindless:gamma_absorber_tile', 1]])
    u.last = u.m.getRecipeLogic().getLastRecipe()
    u.productiveTicks = 0
    u.euWritten = 0
    u.dyn.forEach(function (h) { h.energyContainer.setEnergyStored(0) })
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
      if (u.run) startRun(u)
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
        check('hp_eut', eut === EUT, 'expected ' + EUT + ' EU/t, got ' + eut + '; reasons ' + reasons(m))
        u.dyn.forEach(function (h) { h.energyContainer.setEnergyStored(0) })
        u.phase = 'wait'
        u.started = S.tick
      } else if (waited > 300) {
        check('hp_eut', false, 'no recipe started in 300 ticks; reasons ' + reasons(m))
        u.phase = 'done'
      }
      return
    }
    if (u.phase === 'wait') {
      var cap = 0
      var stored = 0
      u.dyn.forEach(function (h) {
        var ec = h.energyContainer
        cap += Number(ec.getOutputVoltage()) * Number(ec.getOutputAmperage())
        stored += Number(ec.getEnergyStored())
        ec.setEnergyStored(0)
      })
      if (stored > 0) {
        if (stored !== EUT) {
          check('hp_dynamo', false, 'one productive tick wrote ' + stored + ' EU, expected ' + EUT)
          u.phase = 'done'
          return
        }
        u.productiveTicks++
        u.euWritten += stored
      }
      if (u.productiveTicks === 1200) {
        check('hp_dynamo', cap >= EUT && u.euWritten === EUT * 1200,
          'capacity ' + cap + ' EU/t; first 1200 productive ticks wrote ' + u.euWritten + ' EU; expected ' + (EUT * 1200))
        u.phase = 'done'
      } else if (waited > 1500) {
        check('hp_dynamo', false, 'only ' + u.productiveTicks + ' productive ticks in 1500 ticks; reasons ' + reasons(m))
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
      var u = { name: def.name, id: def.id, cx: def.cx, z: def.z, parts: def.parts, energy_want: def.energy, run: def.run, phase: 'forming', started: S.tick }
      try {
        u.pos = place(u)
        S.units.push(u)
      } catch (e) { check(def.name + '_build_exception', false, errText(e)) }
    })
  }
  ServerEvents.customCommand('gg_test_opv_kugelblitz', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestOpvKugelblitzRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestOpvKugelblitzRequest && Date.now() - LOADED >= 10000) {
        global.ggTestOpvKugelblitzRequest = false
        begin(event.server)
      }
      if (S === null || S.finished) return
      S.tick++
      var pending = 0
      S.units.forEach(function (u) {
        if (u.phase === 'done') return
        try {
          if (u.energy && u.energy.length && u.m && u.m.isFormed()) topUp(u.energy)
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
