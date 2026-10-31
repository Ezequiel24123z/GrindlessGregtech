// priority: -5644
// TEST ONLY, MAX-G1 (gtceu:mirror_shell). Command: kubejs custom_command gg_test_max_shell
// Band ONLY: X 40344-40407, Z 0-63, gcyr:black_hole_orbit Y 70-102 (zones.json row max_shell).
//   T1 (named uncertainty: ONE controller carries a generator row (c1, -2^30 EU/t) and a consumer row (c3, 2^35 EU/t) of recipe type
//   gtceu:black_hole_bomb; the 33-cube forms; c3 draws 2^35 EU/t on two MAX 16 A hatches for 1,200 t and the structure survives the credits handler):
//     lookup   every recipe id of the package is in the recipe manager
//     static   nothing skipped; no pending route
//     formed   the 33-cube forms with two MAX 16 A input hatches, one MAX 16 A dynamo hatch and a bus pair
//     c3       starts at 2^35 EU/t; the universe seed and the mirror shell scrap reach the output bus; the shell stays formed
//     c2       starts and outputs the final spin map
//     c1       starts as a generator and pushes EU into the dynamo hatch
// The older one-row additions (clock, SRF, mK, forge, foundry) only add data on mechanisms proven by their own packages, so they are looked up, not run.
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 40344
  var X1 = 40407
  var Y0 = 70
  var Y1 = 102
  var NAME = 'max_shell'
  var DIM = 'gcyr:black_hole_orbit'
  var CX = 40376
  var CY = 86
  var CZ = 16
  var MACHINE = 'gtceu:mirror_shell'
  var HATCH = 'gtceu:max_energy_input_hatch_16a'
  var DYNAMO = 'gtceu:max_energy_output_hatch_16a'
  var CIRCUIT = 'gtceu:programmed_circuit'
  var EXP_C3 = 34359738368
  var EXP_C1 = 1073741824

  var STEPS = [
    {
      name: 'c3', eut: EXP_C3, id: 'universe_seed',
      items: [[CIRCUIT, 1, '{Configuration:3}'], ['grindless:seed_wave_packet', 1], ['grindless:genome_archive', 1], ['grindless:stream_bundle', 16],
        ['grindless:final_spin_map', 1], ['grindless:rydberg_logic_array', 1]],
      outs: ['grindless:universe_seed', 'grindless:mirror_shell_scrap']
    },
    {
      name: 'c2', eut: 2013265920, id: 'final_spin_map',
      items: [[CIRCUIT, 1, '{Configuration:2}'], ['grindless:sgr_a_spin_map', 1], ['grindless:shell_gradient_map', 1]],
      outs: ['grindless:final_spin_map']
    },
    {
      name: 'c1', eut: EXP_C1, id: 'vent_wave_packet', generator: true,
      items: [[CIRCUIT, 1, '{Configuration:1}'], ['grindless:seed_wave_packet', 1]],
      outs: []
    }
  ]

  var IDS = [
    'black_hole_bomb/vent_wave_packet', 'black_hole_bomb/final_spin_map', 'black_hole_bomb/universe_seed', 'assembly_line/mirror_shell',
    'kugelblitz_forming/write_seed_wave_packet', 'nuclear_clock/nuclear_clock/thorium_clock_reference', 'nuclear_demagnetisation/cooled_cavity_mode',
    'srf_cavity/srf_cavity/max_srf_cavity', 'chemical_bath/polished_srf_cavity', 'swarm_segment/mirror_shell_segment'
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
  function count(p, id) {
    var st = p.getInventory().storage
    var n = 0
    for (var i = 0; i < st.getSlots(); i++) {
      var s = st.getStackInSlot(i)
      if (!s.isEmpty() && itemId(s) === id) n += Number(s.getCount())
    }
    return n
  }
  function clearBus(p) {
    var st = p.getInventory().storage
    for (var i = 0; i < st.getSlots(); i++) st.setStackInSlot(i, Item.of('minecraft:air'))
  }
  function setBus(p, list) {
    clearBus(p)
    var st = p.getInventory().storage
    var slot = 0
    list.forEach(function (e) { st.setStackInSlot(slot++, e.length > 2 ? Item.of(e[0], e[1], e[2]) : Item.of(e[0], e[1])) })
  }
  function topUp(list) { list.forEach(function (p) { var c = p.energyContainer; c.setEnergyStored(c.getEnergyCapacity()) }) }
  function stored(list) {
    var n = 0
    list.forEach(function (p) { n += Number(p.energyContainer.getEnergyStored()) })
    return n
  }
  function formCheck(m, waited) {
    if (m.isFormed()) return true
    if (waited >= 100 && waited % 50 === 0) {
      if (m.checkPatternWithLock()) { m.setFlipped(m.getMultiblockState().isNeededFlip()); m.onStructureFormed() }
    }
    return m.isFormed()
  }
  function why(m) { try { return String(m.getMultiblockState().error) } catch (e) { return 'unknown' } }
  function reasons(m) { return String(m.getRecipeLogic().getFailureReasons()) }

  // the template walk; the 'X' oneOf cells take the parts, spread evenly over the sorted cells
  function place(parts) {
    var desc = global.grindless.patterns.describe(MACHINE)
    if (!desc) throw new Error('no structure description for ' + MACHINE)
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
      c.x = CX - (c.ci - ctrl.ci)
      c.y = CY + (c.ri - ctrl.ri)
      c.z = CZ - (c.si - ctrl.si)
      if (c.sym.kind === 'oneOf') xs.push(c)
    })
    xs.sort(function (a, b) { return a.y - b.y || a.x - b.x })
    var chosen = {}
    var n = xs.length
    parts.forEach(function (id, i) { chosen[Math.floor(i * (n - 1) / (parts.length - 1))] = id })
    var idx = {}
    xs.forEach(function (c, i) { idx[c.x + ',' + c.y + ',' + c.z] = i })
    var minY = 1e9
    var maxY = -1e9
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
      if (c.y < minY) minY = c.y
      if (c.y > maxY) maxY = c.y
      put(c.x, c.y, c.z, block + (part ? '[facing=north]' : ''))
    })
    put(controller.x, controller.y, controller.z, MACHINE + '[facing=north]')
    return { pos: pos(controller.x, controller.y, controller.z), height: maxY - minY + 1 }
  }

  function registrationChecks() {
    var rm = S.server.getRecipeManager()
    var missing = IDS.filter(function (i) { return !rm.byKey(new (classes().RL)('grindless:' + i)).isPresent() })
    check('lookup', missing.length === 0, IDS.length + ' ids checked; missing: ' + (missing.length ? missing.join(', ') : 'none'))
    var MI = global.grindless.maxShell
    var pending = MI ? MI.pendingRoutes.join(',') : 'none'
    check('static', !!MI && MI.skipped.length === 0 && pending === '',
      'recipes ' + (MI ? MI.recipes.length : null) + ', skipped ' + JSON.stringify(MI ? MI.skipped : null) + ', pending ' + pending)
  }

  function load(u) {
    var step = STEPS[u.step]
    clearBus(u.outBus)
    setBus(u.bus, step.items)
    u.last = u.m.getRecipeLogic().getLastRecipe()
    u.started = S.tick
    u.phase = 'start'
    u.m.getRecipeLogic().updateTickSubscription()
  }
  function next(u) {
    u.step++
    if (u.step >= STEPS.length) { u.phase = 'done'; return }
    load(u)
  }

  function tick(u) {
    var waited = S.tick - u.started
    var m = machine(u.pos)
    if (u.phase === 'forming') {
      if (!m || !formCheck(m, waited)) {
        if (waited > 1500) { check('formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      u.m = m
      u.energy = partsLike(m, /max_energy_input_hatch_16a/)
      u.dynamo = partsLike(m, /max_energy_output_hatch_16a/)
      u.bus = partsLike(m, /input_bus/)[0]
      u.outBus = partsLike(m, /output_bus/)[0]
      var ok = !!u.bus && !!u.outBus && u.energy.length === 2 && u.dynamo.length >= 1 && u.height === 33
      check('formed', ok, 'class ' + m.getClass().getSimpleName() + ', height ' + u.height + ', input hatches ' + u.energy.length + ', dynamo hatches ' + u.dynamo.length +
        ', parts ' + array(m.getParts()).length)
      if (!ok) { u.phase = 'done'; return }
      topUp(u.energy)
      u.step = 0
      load(u)
      return
    }
    var step = STEPS[u.step]
    var tag = step.name + '_'
    topUp(u.energy)
    var rlg = m.getRecipeLogic()
    if (u.phase === 'start') {
      var rec = rlg.getLastRecipe()
      if (rec !== null && rec !== undefined && rec !== u.last && String(rec.id).indexOf(step.id) >= 0) {
        var eut = NaN
        try { var io = classes().RecipeHelper.getRealEUtWithIO(rec); eut = io.isEmpty() ? 0 : Number(io.getTotalEU()) } catch (e) { }
        note(tag + 'measured', 'recipe ' + String(rec.id) + ', EU/t ' + eut + ', duration ' + rec.duration)
        check(tag + 'eut', Math.abs(eut) === step.eut, 'expected ' + step.eut + ' EU/t, got ' + eut + '; reasons ' + reasons(m))
        u.base = stored(u.dynamo)
        u.phase = step.generator ? 'gen' : 'wait'
        u.started = S.tick
      } else if (waited > 400) {
        check(tag + 'eut', false, 'no recipe started in 400 ticks; reasons ' + reasons(m) + '; last ' + (rec ? rec.id : 'none'))
        u.phase = 'done'
      }
      return
    }
    if (u.phase === 'gen') {
      if (waited >= 60) {
        var gained = stored(u.dynamo) - u.base
        check(tag + 'pushes_eu', gained > 0, 'dynamo hatches gained ' + gained + ' EU in ' + waited + ' ticks')
        u.phase = 'done'
      }
      return
    }
    if (u.phase === 'wait') {
      var got = count(u.outBus, step.outs[0])
      if (got >= 1) {
        var extra = step.outs.length > 1 ? count(u.outBus, step.outs[1]) : 1
        check(tag + 'output', extra >= 1, step.outs.join(' + ') + ': ' + got + ' / ' + extra)
        check(tag + 'still_formed', m.isFormed(), 'formed after the recipe and the credits handler: ' + m.isFormed())
        next(u)
      } else if (waited > 1700) {
        check(tag + 'output', false, 'no ' + step.outs[0] + ' in 1700 ticks; reasons ' + reasons(m))
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
    S = { server: server, tick: 0, failed: 0, finished: false, unit: null }
    S.level = server.getLevel(DIM)
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    clear()
    try { registrationChecks() } catch (e) { check('registration_exception', false, errText(e)) }
    try {
      var r = place([HATCH, HATCH, DYNAMO, 'gtceu:hv_input_bus', 'gtceu:hv_output_bus'])
      S.unit = { pos: r.pos, height: r.height, phase: 'forming', started: S.tick }
    } catch (e) { check('build_exception', false, errText(e)) }
  }
  ServerEvents.customCommand('gg_test_max_shell', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestMaxShellRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestMaxShellRequest && Date.now() - LOADED >= 10000) {
        global.ggTestMaxShellRequest = false
        begin(event.server)
      }
      if (S === null || S.finished) return
      S.tick++
      if (S.unit === null || S.unit.phase === 'done') { finish(); return }
      try { tick(S.unit) } catch (e) { check('exception', false, 'phase ' + S.unit.phase + ': ' + errText(e)); S.unit.phase = 'done' }
      if (S.tick > 9000) { check('deadline', false, '9000-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
