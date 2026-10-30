// priority: -9791
// TEST ONLY, UXV-B3 (gtceu:accretion_disk_skimmer, gtceu:frc_former, gtceu:bz_dynamo). Command: kubejs custom_command gg_test_uxv_cygnus_disk
// Band ONLY: X 36864-36927, Z 0-63, Y 98-115, built in grindless:cygnus_x1_orbit (the dimension their recipes are locked to).
//   T1 (named uncertainty: the BZ dynamo's spin_down row, written final at 2^30 EU/t as a generator, starts in the orbit with 400 mB of
//   flux-loaded plasma and its two UIV 16 A dynamo hatches (2^29 each) carry and receive the whole 2^30 EU/t):
//     lookup     every row, the older magnet works row and the four controllers' assembly lines are in the recipe manager
//     formed     skimmer, former and dynamo form in the orbit dimension with their hatches
//     bz_eut     the spin_down recipe starts and is 1,073,741,824 EU/t
//     bz_dynamo  two dynamo hatches whose voltage x amperage add up to 2^30 hold energy after the run starts
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 36864
  var X1 = 36927
  var Y0 = 98
  var Y1 = 115
  var NAME = 'uxv_cygnus_disk'
  var DIM = 'grindless:cygnus_x1_orbit'
  var CY = 106
  var EUT = 1073741824
  var ENERGY = 'gtceu:uiv_energy_input_hatch'
  var DYNAMO = 'gtceu:uiv_energy_output_hatch_16a'
  var CIRCUIT = 'gtceu:programmed_circuit'

  var IDS = [
    'disk_skimming/skim_disk', 'frc_forming/form_cartridge', 'frc_forming/load_flux', 'blandford_znajek/spin_down',
    'naquadria_magnets/strand_coil', 'assembly_line/accretion_disk_skimmer', 'assembly_line/frc_former', 'assembly_line/bz_dynamo',
    'assembly_line/uxv_field_generator'
  ]

  var UNITS = [
    { name: 'skimmer', id: 'gtceu:accretion_disk_skimmer', cx: 36872, z: 2, parts: [ENERGY, ENERGY, 'gtceu:hv_input_bus', 'gtceu:hv_output_hatch'], energy: 2, run: false },
    { name: 'former', id: 'gtceu:frc_former', cx: 36892, z: 2, parts: [ENERGY, ENERGY, 'gtceu:hv_input_bus', 'gtceu:hv_output_bus', 'gtceu:hv_input_hatch', 'gtceu:hv_output_hatch'], energy: 2, run: false },
    { name: 'dynamo', id: 'gtceu:bz_dynamo', cx: 36912, z: 2, parts: [DYNAMO, DYNAMO, 'gtceu:hv_input_bus', 'gtceu:hv_input_hatch'], energy: 0, run: true }
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
    var G = global.grindless.cygnusDisk
    check('static_clean', !!G && G.skipped.length === 0 && G.clashes.length === 0, 'skipped ' + JSON.stringify(G ? G.skipped : null) + ' clashes ' + JSON.stringify(G ? G.clashes : null))
  }

  function begin1(u, m) {
    u.m = m
    u.energy = partsLike(m, /uiv_energy_input_hatch/)
    u.dyn = partsLike(m, /energy_output_hatch/)
    u.bus = partsLike(m, /input_bus/)[0]
    u.hatch = partsLike(m, /^(?!.*energy).*input_hatch/)[0]
    var ok = !!u.bus && u.energy.length === u.energy_want && (u.name !== 'dynamo' || (u.dyn.length === 2 && !!u.hatch))
    check(u.name + '_formed', ok, 'class ' + m.getClass().getSimpleName() + ', UIV energy hatches ' + u.energy.length + ', dynamo hatches ' + u.dyn.length + ', parts ' + array(m.getParts()).length)
    return ok
  }

  function startRun(u) {
    setBus(u.bus, [[CIRCUIT, 1, '{Configuration:1}']])
    try { u.hatch.tank.setFluidInTank(0, Fluid.of('gtceu:flux_loaded_plasma', 400).getFluidStack()) } catch (e) { note(u.name + '_fluid', 'could not fill the hatch: ' + errText(e)) }
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
    var rlg = m.getRecipeLogic()
    if (u.phase === 'run') {
      var rec = rlg.getLastRecipe()
      if (rec !== null && rec !== undefined && rec !== u.last) {
        var eut = NaN
        try { var io = classes().RecipeHelper.getRealEUtWithIO(rec); eut = io.isEmpty() ? 0 : Math.abs(Number(io.getTotalEU())) } catch (e) { }
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
      if (waited < 60) return
      var cap = 0
      var stored = 0
      u.dyn.forEach(function (h) {
        var ec = h.energyContainer
        cap += Number(ec.getOutputVoltage()) * Number(ec.getOutputAmperage())
        stored += Number(ec.getEnergyStored())
      })
      check('bz_dynamo', cap >= EUT && stored > 0, 'dynamo hatches push ' + cap + ' EU/t (needs ' + EUT + '), hold ' + stored + ' EU after 60 ticks; working ' + rlg.isWorking())
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
  ServerEvents.customCommand('gg_test_uxv_cygnus_disk', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestUxvCygnusDiskRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestUxvCygnusDiskRequest && Date.now() - LOADED >= 10000) {
        global.ggTestUxvCygnusDiskRequest = false
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
