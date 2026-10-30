// priority: -9774
// TEST ONLY, UXV-B5 (gtceu:ejecta_knot_sweeper, gtceu:annihilation_laser_works). Command: kubejs custom_command gg_test_uxv_cas_a
// Band ONLY: X 36992-37055, Z 0-63, Y 98-115. The sweeper is built in grindless:cas_a_remnant (its recipe is locked there), the laser works in the Overworld.
//   T1 (named uncertainty: the sweeper's sweep_ejecta_knots row, 67,108,864 EU/t and dimension-locked, starts at Cassiopeia A on two UIV energy hatches only):
//     lookup      every row, the older rows and the controllers' assembly lines are in the recipe manager
//     formed      both controllers form with their hatches
//     sweep_eut   the sweep row starts at the remnant and is 67,108,864 EU/t
//     laser_eut   the laser works' moderate_positronium row starts and is 67,108,864 EU/t (no site lock)
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 36992
  var X1 = 37055
  var Y0 = 98
  var Y1 = 115
  var NAME = 'uxv_cas_a'
  var REMNANT = 'grindless:cas_a_remnant'
  var EARTH = 'minecraft:overworld'
  var CY = 106
  var EUT = 67108864
  var ENERGY = 'gtceu:uiv_energy_input_hatch'
  var CIRCUIT = 'gtceu:programmed_circuit'

  var IDS = [
    'ejecta_sweeping/sweep_ejecta_knots', 'annihilation_lasing/moderate_positronium', 'annihilation_lasing/stimulate_gamma_emission',
    'antimatter_storage/positron_stack', 'calutron_separation/titanium_44', 'hot_cell/ti44_core_capsule', 'hot_cell/ti44_core_decay',
    'xray_pulse_profiling/ti44_map', 'solvent_extraction/ev/ejecta_knot_titanium', 'assembly_line/ejecta_knot_sweeper',
    'assembly_line/annihilation_laser_works', 'assembly_line/uxv_emitter'
  ]

  var UNITS = [
    { name: 'sweeper', id: 'gtceu:ejecta_knot_sweeper', dim: REMNANT, cx: 37010, z: 16, parts: [ENERGY, ENERGY, 'gtceu:hv_input_bus', 'gtceu:hv_output_bus'],
      bus: [[CIRCUIT, 1, '{Configuration:1}'], ['grindless:mh_winding', 1]] },
    { name: 'laser', id: 'gtceu:annihilation_laser_works', dim: EARTH, cx: 37030, z: 18, parts: ['gtceu:hv_output_bus', ENERGY, ENERGY, 'gtceu:hv_input_bus', 'gtceu:hv_input_hatch', 'gtceu:hv_output_hatch'],
      bus: [[CIRCUIT, 1, '{Configuration:1}'], ['grindless:neon_moderator_cartridge', 1], ['grindless:ti44_core', 1]] }
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
  function command(dim, text) { return S.server.runCommandSilent('execute in ' + dim + ' run ' + text) }
  function pos(x, y, z) { return new (classes().Pos)(x, y, z) }
  function inBand(x, y, z) { return x >= X0 && x <= X1 && z >= 0 && z <= 63 && y >= Y0 && y <= Y1 }
  function put(dim, x, y, z, block) {
    if (!inBand(x, y, z)) throw new Error('refused: ' + x + ',' + y + ',' + z + ' is outside the band')
    return command(dim, 'setblock ' + x + ' ' + y + ' ' + z + ' ' + block + ' replace')
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
      put(u.dim, c.x, c.y, c.z, block + (part ? '[facing=north]' : ''))
    })
    put(u.dim, controller.x, controller.y, controller.z, u.id + '[facing=north]')
    return pos(controller.x, controller.y, controller.z)
  }

  function registrationChecks() {
    var rm = S.server.getRecipeManager()
    var missing = IDS.filter(function (i) { return !rm.byKey(new (classes().RL)('grindless:' + i)).isPresent() })
    check('lookup', missing.length === 0, IDS.length + ' ids checked; missing: ' + (missing.length ? missing.join(', ') : 'none'))
    var G = global.grindless.casA
    check('static_clean', !!G && G.skipped.length === 0 && G.clashes.length === 0, 'skipped ' + JSON.stringify(G ? G.skipped : null) + ' clashes ' + JSON.stringify(G ? G.clashes : null))
  }

  function begin1(u, m) {
    u.m = m
    u.energy = partsLike(m, /uiv_energy_input_hatch/)
    u.inBus = partsLike(m, /input_bus/)[0]
    u.hatch = partsLike(m, /^(?!.*energy).*input_hatch/)[0]
    var ok = !!u.inBus && u.energy.length === 2 && (u.name !== 'laser' || !!u.hatch)
    check(u.name + '_formed', ok, 'class ' + m.getClass().getSimpleName() + ', UIV energy hatches ' + u.energy.length + ', parts ' + array(m.getParts()).length)
    return ok
  }

  function startRun(u) {
    setBus(u.inBus, u.bus)
    if (u.name === 'laser') {
      try { u.hatch.tank.setFluidInTank(0, Fluid.of('gtceu:liquid_helium', 1000).getFluidStack()) } catch (e) { note(u.name + '_fluid', 'could not fill the hatch: ' + errText(e)) }
    }
    u.last = u.m.getRecipeLogic().getLastRecipe()
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
        note(u.name + '_measured', 'recipe ' + String(rec.id) + ', EU/t ' + eut + ', max voltage ' + m.getMaxVoltage())
        check(u.eutCheck, eut === EUT, 'expected ' + EUT + ' EU/t, got ' + eut + '; reasons ' + reasons(m))
        u.phase = 'done'
      } else if (waited > 300) {
        check(u.eutCheck, false, 'no recipe started in 300 ticks; reasons ' + reasons(m))
        u.phase = 'done'
      }
    }
  }

  function clear() {
    ;[REMNANT, EARTH].forEach(function (dim) {
      for (var z = 0; z < 64; z += 8) command(dim, 'fill ' + X0 + ' ' + Y0 + ' ' + z + ' ' + X1 + ' ' + Y1 + ' ' + (z + 7) + ' minecraft:air')
    })
  }
  function finish() {
    if (S.finished) return
    S.finished = true
    try { clear() } catch (e) { }
    ;[REMNANT, EARTH].forEach(function (dim) { command(dim, 'forceload remove ' + X0 + ' 0 ' + X1 + ' 63') })
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  function begin(server) {
    S = { server: server, tick: 0, failed: 0, finished: false }
    ;[REMNANT, EARTH].forEach(function (dim) { command(dim, 'forceload add ' + X0 + ' 0 ' + X1 + ' 63') })
    clear()
    try { registrationChecks() } catch (e) { check('registration_exception', false, errText(e)) }
    S.units = []
    UNITS.forEach(function (def) {
      var u = { name: def.name, id: def.id, dim: def.dim, cx: def.cx, z: def.z, parts: def.parts, bus: def.bus, phase: 'forming', started: S.tick,
        eutCheck: def.name === 'sweeper' ? 'sweep_eut' : 'laser_eut' }
      try {
        u.level = server.getLevel(def.dim)
        u.pos = place(u)
        S.units.push(u)
      } catch (e) { check(def.name + '_build_exception', false, errText(e)) }
    })
  }
  ServerEvents.customCommand('gg_test_uxv_cas_a', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestUxvCasARequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestUxvCasARequest && Date.now() - LOADED >= 10000) {
        global.ggTestUxvCasARequest = false
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
