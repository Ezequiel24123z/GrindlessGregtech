// priority: -5421
// TEST ONLY, MAX-E1 (gtceu:accretion_feeder). Command: kubejs custom_command gg_test_max_feeder
// Copied over the instance on the test bench, never shipped. NOT run by the package worker: the MAX integrator runs it.
// Band ONLY: X 40280-40343, Z 0-63, Y 98-135, in gcyr:black_hole_orbit (the Sgr A* level; zones.json row max_feeder).
//   T1 (named uncertainty: the 15 x 9 x 15 ring forms on a dynamo hatch and c1, a generator row with chanced wear inputs, runs at 2^30 EU/t):
//     lookup   every recipe id of the package (c1, c2, the controller line, the GTM and older rows) is in the recipe manager
//     static   nothing skipped; no pending route
//     formed   the feeder forms with a dynamo hatch and a bus pair
//     eut      c1 starts and its output is at least 2^30 EU/t
//     output   the pellet leaves the input bus and c1 keeps working (panel and module wear are chanced, so only noted)
// The dynamo hatch is emptied every tick so the generator never stops on a full buffer.
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 40280
  var X1 = 40343
  var Y0 = 98
  var Y1 = 135
  var NAME = 'max_feeder'
  var DIM = 'gcyr:black_hole_orbit'
  var CX = 40311
  var CY = 100
  var CZ = 48
  var VH_MAX = 1073741824
  var DYNAMO = 'gtceu:opv_wireless_dynamo_hatch_16a'
  var CIRCUIT = 'gtceu:programmed_circuit'
  var MACHINE = 'gtceu:accretion_feeder'
  // the floor ring has many hatch cells: one dynamo hatch and the bus pair
  var PARTS = [DYNAMO, 'gtceu:hv_input_bus', 'gtceu:hv_output_bus']
  var CANISTER = 'grindless:slag_pellet'
  var WORN = 'grindless:spent_collector_panel'
  var PANEL = 'grindless:xuv_collector_panel'

  var IDS = [
    'accretion_power/slag_pellet_burn', 'space_photovoltaics/panel_rework', 'assembly_line/accretion_feeder', 'compressor/slag_compact',
    'assembler/wolter_mirror_module', 'assembler/feeder_coil_casing', 'pgm_refining/opv/iridium_sponge', 'pgm_refining/opv/wolter_iridium_recovery',
    'electron_beam_refining/iridium_target', 'chemical_vapour_infiltration/sic_grazing_shell', 'mtj_sputtering/iridium_coated_shell',
    'mtj_sputtering/metallised_photocell', 'betavoltaic/diamond_photocell', 'space_photovoltaics/xuv_collector_panel',
    'regolith_processing/ev/slag_reduction', 'spark_plasma_sintering/slag_pellet', 'solar_vaporisation/devolatilised_slag', 'diamond_cvd/collector_diamond_plate', 'ion_implantation/pin_diamond_plate'
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
  function drain(list) { list.forEach(function (p) { p.energyContainer.setEnergyStored(0) }) }
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
    var MI = global.grindless.maxFeeder
    var pending = MI ? (MI.pendingRoutes || []).join(',') : 'none'
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
      u.energy = partsLike(m, /energy_output_hatch|dynamo_hatch/)
      u.bus = partsLike(m, /input_bus/)[0]
      u.outBus = partsLike(m, /output_bus/)[0]
      var ok = !!u.bus && !!u.outBus && u.energy.length === 1 && u.height === 9
      check('formed', ok, 'class ' + m.getClass().getSimpleName() + ', height ' + u.height + ', dynamo hatches ' + u.energy.length + ', parts ' + array(m.getParts()).length)
      if (!ok) { u.phase = 'done'; return }
      drain(u.energy)
      setBus(u.bus, [[CANISTER, 1], [PANEL, 1], ['grindless:wolter_mirror_module', 1], [CIRCUIT, 1, '{Configuration:1}']])
      u.last = m.getRecipeLogic().getLastRecipe()
      u.started = S.tick
      u.phase = 'run'
      return
    }
    drain(u.energy)
    var rlg = m.getRecipeLogic()
    if (u.phase === 'run') {
      var rec = rlg.getLastRecipe()
      if (rec !== null && rec !== undefined && rec !== u.last) {
        var eut = NaN
        try { var io = classes().RecipeHelper.getRealEUtWithIO(rec); eut = io.isEmpty() ? 0 : Math.abs(Number(io.getTotalEU())) } catch (e) { }
        note('measured', 'recipe ' + String(rec.id) + ', EU/t ' + eut + ', max voltage ' + m.getMaxVoltage())
        check('eut', eut >= VH_MAX, 'expected at least ' + VH_MAX + ' EU/t, got ' + eut + '; reasons ' + reasons(m))
        u.phase = 'wait'
        u.started = S.tick
      } else if (waited > 300) {
        check('eut', false, 'no recipe started in 300 ticks; reasons ' + reasons(m))
        u.phase = 'done'
      }
      return
    }
    if (u.phase === 'wait') {
      var left = count(u.bus, CANISTER)
      check('output', left === 0 && rlg.isWorking(), 'pellets left in the bus ' + left + ', working ' + rlg.isWorking() + ' after ' + waited + ' ticks')
      note('wear', WORN + ' in the output bus: ' + count(u.outBus, WORN) + ' (chance 1/64, not asserted)')
      u.phase = 'done'
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
    if (!S.level) { check('dimension', false, DIM + ' is not loaded'); finish(); return }
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    clear()
    try { registrationChecks() } catch (e) { check('registration_exception', false, errText(e)) }
    try {
      var r = place()
      S.unit = { pos: r.pos, height: r.height, phase: 'forming', started: S.tick }
    } catch (e) { check('build_exception', false, errText(e)) }
  }
  ServerEvents.customCommand('gg_test_max_feeder', function () {
    if (S !== null && !S.finished) return 0
      global.ggTestMaxFeederRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
        if (global.ggTestMaxFeederRequest && Date.now() - LOADED >= 10000) {
          global.ggTestMaxFeederRequest = false
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
