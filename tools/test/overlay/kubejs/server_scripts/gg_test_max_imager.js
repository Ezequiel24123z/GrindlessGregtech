// priority: -5504
// TEST ONLY, MAX-D2 (gtceu:photon_ring_imager). Command: kubejs custom_command gg_test_max_imager
// Band ONLY: X 39896-39959, Z 0-63, Y 98-115 of gcyr:black_hole_orbit (Sgr A*; zones.json row max_imager).
//   T1 (named uncertainty: the 9-high imager forms at Sgr A* and runs c1 at VA[MAX] = 2,013,265,920 EU/t on two OpV 4 A hatches):
//     lookup   every recipe id of the package (c1, c2, the GTM rows, the controller line and the older rows) is in the recipe manager
//     static   nothing skipped; no pending route
//     formed   the imager forms with two OpV 4 A hatches, a bus pair and two fluid hatches, 9 blocks high
//     eut      c1 starts at 2,013,265,920 EU/t
//     output   the spin map and the SIS scrap reach the output bus
// The older rows change only their data on mechanisms proven by their own packages, so they are looked up, not run.
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 39896
  var X1 = 39959
  var Y0 = 98
  var Y1 = 115
  var NAME = 'max_imager'
  var CX = 39928
  var CY = 100
  var CZ = 32
  var VA_MAX = 2013265920
  var HATCH = 'gtceu:opv_energy_input_hatch_4a'
  var CIRCUIT = 'gtceu:programmed_circuit'
  var MACHINE = 'gtceu:photon_ring_imager'
  var DIM = 'gcyr:black_hole_orbit'
  var PARTS = [HATCH, HATCH, 'gtceu:hv_input_bus', 'gtceu:hv_output_bus', 'gtceu:hv_input_hatch', 'gtceu:hv_output_hatch']
  var INPUTS = [['grindless:imager_dish_panel', 4], ['grindless:sis_mixer', 2], ['grindless:photonic_lo_module', 1], ['grindless:cryo_lna_module', 2], ['grindless:clock_locked_microcomb', 1], ['grindless:quantum_memory_node', 1], ['grindless:rydberg_logic_array', 1]]
  var OUTS = ['grindless:sgr_a_spin_map', 'grindless:sis_scrap']

  var IDS = [
    'photon_ring_imaging/sgr_a_spin_map', 'photon_ring_imaging/nsc_ephemeris', 'assembly_line/photon_ring_imager',
    'assembler/imager_dish_panel', 'chemical_bath/anodised_junction_wafer', 'cutter/sis_die', 'assembler/sis_mixer',
    'chemical_reactor/passivated_utc_wafer', 'cutter/utc_die', 'cutter/hemt_die', 'assembler/cryo_lna_module',
    'sic_fibre_spinning/sic_mirror_tow', 'chemical_vapour_infiltration/sic_dish_blank', 'ion_implantation/figured_dish_blank',
    'mtj_sputtering/gold_coated_dish', 'mtj_sputtering/nb_alox_nb_trilayer', 'beuv_lithography/sis_junction_wafer',
    'beuv_lithography/utc_photodiode_wafer', 'beuv_lithography/hemt_gate_wafer', 'nuclear_demagnetisation/tested_sis_die',
    'molecular_beam_epitaxy/hemt_stack_epi', 'photonic_foundry/photonic_lo_module', 'closed_loop_cooling/cryo_tested_lna'
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
  function place() {
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
    xs.sort(function (a, b) { return a.z - b.z || a.x - b.x })
    var chosen = {}
    var n = xs.length
    PARTS.forEach(function (id, i) { chosen[Math.floor(i * (n - 1) / (PARTS.length - 1))] = id })
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
    var MI = global.grindless.maxImager
    var pending = MI ? MI.pendingRoutes.join(',') : 'none'
    check('static', !!MI && MI.skipped.length === 0 && pending === '',
      'recipes ' + (MI ? MI.recipes.length : null) + ', skipped ' + JSON.stringify(MI ? MI.skipped : null) + ', pending ' + pending)
  }

  function tick(u) {
    var waited = S.tick - u.started
    var m = machine(u.pos)
    if (u.phase === 'forming') {
      if (!m || !formCheck(m, waited)) {
        if (waited > 700) { check('formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      u.m = m
      u.energy = partsLike(m, /opv_energy_input_hatch_4a/)
      u.bus = partsLike(m, /input_bus/)[0]
      u.outBus = partsLike(m, /output_bus/)[0]
      u.hatch = partsLike(m, /^gtceu:[a-z0-9]+_input_hatch$/)[0]
      var ok = !!u.bus && !!u.outBus && !!u.hatch && u.energy.length === 2 && u.height === 9
      check('formed', ok, 'class ' + m.getClass().getSimpleName() + ', height ' + u.height + ', OpV 4 A hatches ' + u.energy.length + ', parts ' + array(m.getParts()).length)
      if (!ok) { u.phase = 'done'; return }
      topUp(u.energy)
      var list = INPUTS.map(function (e) { return [e[0], e[1]] })
      list.push([CIRCUIT, 1, '{Configuration:1}'])
      setBus(u.bus, list)
      try { u.hatch.tank.setFluidInTank(0, Fluid.of('gtceu:liquid_helium', 1000).getFluidStack()) } catch (e) { note('fluid', 'could not fill the hatch: ' + errText(e)) }
      u.last = m.getRecipeLogic().getLastRecipe()
      u.started = S.tick
      u.phase = 'run'
      return
    }
    topUp(u.energy)
    var rlg = m.getRecipeLogic()
    if (u.phase === 'run') {
      var rec = rlg.getLastRecipe()
      if (rec !== null && rec !== undefined && rec !== u.last) {
        var eut = NaN
        try { var io = classes().RecipeHelper.getRealEUtWithIO(rec); eut = io.isEmpty() ? 0 : Number(io.getTotalEU()) } catch (e) { }
        note('measured', 'recipe ' + String(rec.id) + ', EU/t ' + eut + ', max voltage ' + m.getMaxVoltage())
        check('eut', eut >= VA_MAX, 'expected at least ' + VA_MAX + ' EU/t, got ' + eut + '; reasons ' + reasons(m))
        u.phase = 'wait'
        u.started = S.tick
      } else if (waited > 300) {
        check('eut', false, 'no recipe started in 300 ticks; reasons ' + reasons(m))
        u.phase = 'done'
      }
      return
    }
    if (u.phase === 'wait') {
      var got = count(u.outBus, OUTS[0])
      var spent = count(u.outBus, OUTS[1])
      if (got >= 1) {
        check('output', spent >= 1, OUTS[0] + ' x' + got + ', ' + OUTS[1] + ' x' + spent)
        u.phase = 'done'
      } else if (waited > 3600) {
        check('output', false, 'no ' + OUTS[0] + ' in 3600 ticks; reasons ' + reasons(m))
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
      var r = place()
      S.unit = { pos: r.pos, height: r.height, phase: 'forming', started: S.tick }
    } catch (e) { check('build_exception', false, errText(e)) }
  }
  ServerEvents.customCommand('gg_test_max_imager', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestMaxImagerRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestMaxImagerRequest && Date.now() - LOADED >= 10000) {
        global.ggTestMaxImagerRequest = false
        begin(event.server)
      }
      if (S === null || S.finished) return
      S.tick++
      if (S.unit !== null && S.unit.phase !== 'done') {
        try { tick(S.unit) } catch (e) { check('exception', false, 'phase ' + S.unit.phase + ': ' + errText(e)); S.unit.phase = 'done' }
      }
      if (S.unit === null || S.unit.phase === 'done') finish()
      else if (S.tick > 6000) { check('deadline', false, '6000-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()