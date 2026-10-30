// priority: -9953
// TEST ONLY, UXV-A4 (gtceu:mtj_sputter_cluster, gtceu:oxide_pld_chamber). Command: kubejs custom_command gg_test_uxv_spin_deposition
// Band ONLY: X 36480-36543, Z 0-63, Overworld Y 98-112.
//   T1 (named uncertainty: a 67,108,864 EU/t row, twice V[UIV] and the first of the line, is accepted by two UIV energy hatches, and the
//   multiblock modifier (parallel hatch overclock) leaves it running):
//     lookup     every table row, the controllers' and the laser's assembly lines are in the recipe manager
//     formed     sputter cluster and PLD chamber form with two UIV energy hatches
//     sputter    c2 (heusler_target + mgo_target + wafer, circuit 2): starts at 67,108,864 EU/t and delivers the MRAM stack wafer
//     pld        c2 (electrode + La-BFO target, circuit 2, the laser not consumed): starts at 67,108,864 EU/t, delivers the BFO film
//                wafer and the BFO fume, and the laser is still in the bus
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 36480
  var X1 = 36543
  var Y0 = 98
  var Y1 = 112
  var NAME = 'uxv_spin_deposition'
  var CX = 36512
  var CY = 100
  var EUT = 67108864
  var ENERGY = 'gtceu:uiv_energy_input_hatch'
  var CIRCUIT = 'gtceu:programmed_circuit'

  var IDS = [
    'mtj_sputtering/mtj_stack', 'mtj_sputtering/mram_stack', 'mtj_sputtering/saf_track', 'mtj_sputtering/stno_stack',
    'pulsed_laser_deposition/srruo3_electrode', 'pulsed_laser_deposition/bfo_film', 'pulsed_laser_deposition/me_switch',
    'mixer/kr_f2_premix', 'assembler/krf_discharge_tube_blank', 'assembler/pulsed_power_head', 'assembler/cofe_target',
    'chemical_reactor/krf_discharge_tube', 'assembly_line/mtj_sputter_cluster', 'assembly_line/oxide_pld_chamber',
    'assembly_line/krf_excimer_laser'
  ]

  var UNITS = [
    {
      name: 'sputter', id: 'gtceu:mtj_sputter_cluster', z: 20, circuit: 2, wafer: 'grindless:mram_stack_wafer',
      inputs: [['grindless:heusler_target', 1], ['grindless:mgo_target', 1], ['grindless:h_si28_wafer', 1]],
      fluid: ['gtceu:argon', 4000], extra: 'grindless:heusler_am_powder',
      parts: [ENERGY, ENERGY, 'gtceu:hv_input_bus', 'gtceu:hv_output_bus', 'gtceu:hv_input_hatch', 'gtceu:hv_output_hatch']
    },
    {
      name: 'pld', id: 'gtceu:oxide_pld_chamber', z: 50, circuit: 2, wafer: 'grindless:bfo_film_wafer',
      inputs: [['grindless:srruo3_electrode_wafer', 1], ['grindless:la_bfo_target', 1], ['grindless:krf_excimer_laser', 1]],
      fluid: ['gtceu:oxygen', 4000], extra: 'grindless:bfo_fume', laser: 'grindless:krf_excimer_laser',
      parts: [ENERGY, ENERGY, 'gtceu:hv_input_bus', 'gtceu:hv_output_bus', 'gtceu:hv_input_hatch']
    }
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
  function command(text) { return S.server.runCommandSilent('execute in minecraft:overworld run ' + text) }
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
      c.x = CX - (c.ci - ctrl.ci)
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
    put(controller.x, controller.y, controller.z, u.id + '[facing=north]')
    return { pos: pos(controller.x, controller.y, controller.z), height: maxY - minY + 1 }
  }

  function registrationChecks() {
    var rm = S.server.getRecipeManager()
    var missing = IDS.filter(function (i) { return !rm.byKey(new (classes().RL)('grindless:' + i)).isPresent() })
    check('lookup', missing.length === 0, IDS.length + ' ids checked; missing: ' + (missing.length ? missing.join(', ') : 'none'))
  }

  function begin1(u, m) {
    u.m = m
    u.energy = partsLike(m, /uiv_energy_input_hatch/)
    u.bus = partsLike(m, /input_bus/)[0]
    u.out = partsLike(m, /output_bus/)[0]
    u.hatch = partsLike(m, /^(?!.*energy).*input_hatch/)[0]
    var ok = !!u.bus && !!u.out && !!u.hatch && u.energy.length === 2 && u.height <= 16
    check(u.name + '_formed', ok, 'class ' + m.getClass().getSimpleName() + ', height ' + u.height + ', UIV energy hatches ' + u.energy.length + ', parts ' + array(m.getParts()).length)
    return ok
  }

  function startRun(u) {
    topUp(u.energy)
    var list = u.inputs.map(function (e) { return [e[0], e[1]] })
    list.push([CIRCUIT, 1, '{Configuration:' + u.circuit + '}'])
    setBus(u.bus, list)
    try { u.hatch.tank.setFluidInTank(0, Fluid.of(u.fluid[0], u.fluid[1]).getFluidStack()) } catch (e) { note(u.name + '_fluid', 'could not fill the hatch: ' + errText(e)) }
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
      startRun(u)
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
      var got = count(u.out, u.wafer)
      if (got >= 1) {
        var extra = count(u.out, u.extra)
        var laserOk = u.laser ? count(u.bus, u.laser) === 1 : true
        check(u.name + '_output', extra >= 1 && laserOk, u.wafer + ' x' + got + ', ' + u.extra + ' x' + extra + (u.laser ? ', laser left in the bus ' + count(u.bus, u.laser) : ''))
        u.phase = 'done'
      } else if (waited > 2400) {
        check(u.name + '_output', false, 'no ' + u.wafer + ' in 2400 ticks; reasons ' + reasons(m))
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
    S.level = server.getLevel('minecraft:overworld')
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    clear()
    try { registrationChecks() } catch (e) { check('registration_exception', false, errText(e)) }
    S.units = []
    UNITS.forEach(function (def) {
      var u = { name: def.name, id: def.id, z: def.z, circuit: def.circuit, wafer: def.wafer, inputs: def.inputs, fluid: def.fluid, extra: def.extra, laser: def.laser, parts: def.parts, phase: 'forming', started: S.tick }
      try {
        var r = place(u)
        u.pos = r.pos
        u.height = r.height
        S.units.push(u)
      } catch (e) { check(def.name + '_build_exception', false, errText(e)) }
    })
  }
  ServerEvents.customCommand('gg_test_uxv_spin_deposition', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestUxvSpinDepositionRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestUxvSpinDepositionRequest && Date.now() - LOADED >= 10000) {
        global.ggTestUxvSpinDepositionRequest = false
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
