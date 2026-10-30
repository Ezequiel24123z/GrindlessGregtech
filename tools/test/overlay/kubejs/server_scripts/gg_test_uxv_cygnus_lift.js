// TEST ONLY, UXV-B2 (gtceu:stellar_elevator, gtceu:plasma_mass_filter, gtceu:stellar_condensation_tower). Command: kubejs custom_command gg_test_uxv_cygnus_lift
// Band ONLY: X 36800-36863, Z 0-63, Y 98-115, built in grindless:cygnus_x1_orbit (the dimension their recipes are locked to).
//   T1 (named uncertainty: the elevator's c1 row (1,000 mB liquid helium -> 1,000 mB stellar plasma + 900 mB helium, 134,217,728 EU/t) carries
//   the Cygnus X-1 dimension lock and still starts and delivers in a 25-deep structure laid on its side, fed by two UIV energy hatches):
//     lookup     every row, the older EHT and syngas rows and the three controllers' assembly lines are in the recipe manager
//     formed     elevator, filter and tower form in the orbit dimension with two UIV energy hatches, bus and hatches
//     lift       elevator c1 starts at 134,217,728 EU/t and delivers 1,000 mB stellar plasma and the warm helium
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 36800
  var X1 = 36863
  var Y0 = 98
  var Y1 = 115
  var NAME = 'uxv_cygnus_lift'
  var DIM = 'grindless:cygnus_x1_orbit'
  var CY = 102
  var EUT = 134217728
  var ENERGY = 'gtceu:uiv_energy_input_hatch'
  var CIRCUIT = 'gtceu:programmed_circuit'

  var IDS = [
    'star_lifting/stellar_lift', 'star_lifting/elevator_log', 'plasma_mass_filtering/stellar_cuts', 'plasma_mass_filtering/disk_filter',
    'stellar_condensation/condense', 'event_horizon_imaging/cygnus_vlbi_record', 'assembly_line/stellar_elevator',
    'assembly_line/plasma_mass_filter', 'assembly_line/stellar_condensation_tower'
  ]
  var HV = ['gtceu:hv_input_bus', 'gtceu:hv_output_bus', 'gtceu:hv_input_hatch', 'gtceu:hv_output_hatch']

  var UNITS = [
    { name: 'elevator', id: 'gtceu:stellar_elevator', cx: 36808, z: 2, parts: [ENERGY, ENERGY].concat(HV, ['gtceu:hv_output_hatch']), run: true },
    { name: 'filter', id: 'gtceu:plasma_mass_filter', cx: 36824, z: 2, parts: [ENERGY, ENERGY, 'gtceu:hv_input_bus', 'gtceu:hv_input_hatch', 'gtceu:hv_output_hatch'], run: false },
    { name: 'tower', id: 'gtceu:stellar_condensation_tower', cx: 36840, z: 2, parts: [ENERGY, ENERGY].concat(HV), run: false }
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
  function itemId(s) { return String(classes().Registries.ITEMS.getKey(s.getItem())) }
  function setBus(p, list) {
    var st = p.getInventory().storage
    for (var i = 0; i < st.getSlots(); i++) st.setStackInSlot(i, Item.of('minecraft:air'))
    var slot = 0
    list.forEach(function (e) { st.setStackInSlot(slot++, e.length > 2 ? Item.of(e[0], e[1], e[2]) : Item.of(e[0], e[1])) })
  }
  function tankAmount(h, id) {
    var total = 0
    try {
      for (var i = 0; i < h.tank.getTanks(); i++) {
        var f = h.tank.getFluidInTank(i)
        if (!f.isEmpty() && String(classes().Registries.FLUIDS.getKey(f.getFluid())) === id) total += Number(f.getAmount())
      }
    } catch (e) { }
    return total
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
    var G = global.grindless.cygnusLift
    check('static_clean', !!G && G.skipped.length === 0 && G.clashes.length === 0, 'skipped ' + JSON.stringify(G ? G.skipped : null) + ' clashes ' + JSON.stringify(G ? G.clashes : null))
  }

  function begin1(u, m) {
    u.m = m
    u.energy = partsLike(m, /uiv_energy_input_hatch/)
    u.bus = partsLike(m, /input_bus/)[0]
    u.out = partsLike(m, /output_bus/)[0]
    u.hatch = partsLike(m, /^(?!.*energy).*input_hatch/)[0]
    u.outHatches = partsLike(m, /output_hatch/)
    u.outHatch = u.outHatches[0]
    var ok = !!u.bus && (!!u.out || u.name === 'filter') && !!u.hatch && !!u.outHatch && u.energy.length === 2
    check(u.name + '_formed', ok, 'class ' + m.getClass().getSimpleName() + ', UIV energy hatches ' + u.energy.length + ', parts ' + array(m.getParts()).length)
    return ok
  }

  function startRun(u) {
    topUp(u.energy)
    setBus(u.bus, [[CIRCUIT, 1, '{Configuration:1}']])
    try { u.hatch.tank.setFluidInTank(0, Fluid.of('gtceu:liquid_helium', 1000).getFluidStack()) } catch (e) { note(u.name + '_fluid', 'could not fill the hatch: ' + errText(e)) }
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
      if (u.run) startRun(u)
      else u.phase = 'done'
      return
    }
    topUp(u.energy)
    var rlg = m.getRecipeLogic()
    if (u.phase === 'run') {
      var rec = rlg.getLastRecipe()
      if (rec !== null && rec !== undefined && rec !== u.last) {
        var eut = NaN
        try { var io = classes().RecipeHelper.getRealEUtWithIO(rec); eut = io.isEmpty() ? 0 : Number(io.getTotalEU()) } catch (e) { }
        note(u.name + '_measured', 'recipe ' + String(rec.id) + ', EU/t ' + eut + ', max voltage ' + m.getMaxVoltage())
        check(u.name + '_eut', eut === EUT, 'expected ' + EUT + ' EU/t, got ' + eut + '; reasons ' + reasons(m))
        u.phase = 'wait'
        u.started = S.tick
      } else if (waited > 300) {
        check(u.name + '_eut', false, 'no recipe started in 300 ticks; reasons ' + reasons(m))
        u.phase = 'done'
      }
      return
    }
    if (u.phase === 'wait') {
      var plasma = 0
      var warm = 0
      u.outHatches.forEach(function (h) { plasma += tankAmount(h, 'gtceu:stellar_plasma'); warm += tankAmount(h, 'gtceu:helium') })
      if (plasma >= 1000) {
        check(u.name + '_output', warm >= 900, 'stellar plasma ' + plasma + ' mB, warm helium ' + warm + ' mB')
        u.phase = 'done'
      } else if (waited > 1800) {
        check(u.name + '_output', false, 'no stellar plasma in 1800 ticks; reasons ' + reasons(m))
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
      var u = { name: def.name, id: def.id, cx: def.cx, z: def.z, parts: def.parts, run: def.run, phase: 'forming', started: S.tick }
      try {
        u.pos = place(u)
        S.units.push(u)
      } catch (e) { check(def.name + '_build_exception', false, errText(e)) }
    })
  }
  ServerEvents.customCommand('gg_test_uxv_cygnus_lift', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestUxvCygnusLiftRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestUxvCygnusLiftRequest && Date.now() - LOADED >= 10000) {
        global.ggTestUxvCygnusLiftRequest = false
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
