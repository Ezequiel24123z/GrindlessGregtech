// priority: -5276
// TEST ONLY, XP-T1 (gtceu:hills_slingshot). Command: kubejs custom_command gg_test_maxplus_slingshot
// Band ONLY: X 46528-46591, Z 0-63, Y 98-125 of gcyr:black_hole_orbit (Sgr A*; zones.json row maxplus_slingshot).
//   T1 (named uncertainty: the slingshot forms on one 1,024 A MAX+ hatch and runs c2 at V[MAX] x 16 = 2^35 EU/t):
//     lookup   every recipe id of the package (slingshot c1-c2, older P15 and P16 rows, casing, probe and controller lines) is in the recipe manager
//     static   nothing skipped
//     formed   the slingshot forms with one energy hatch and a bus pair
//     eut      c2 (launched_ig_probe) starts at 2^35 EU/t
//     output   a launched probe in the output bus
// The older rows change only their data on mechanisms proven by their own packages, so they are looked up, not run.
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 46528
  var X1 = 46591
  var Y0 = 98
  var Y1 = 125
  var NAME = 'maxplus_slingshot'
  var CY = 104
  var CZ = 10
  var CIRCUIT = 'gtceu:programmed_circuit'
  var HATCH = 'gtceu:max_maxplus_energy_hatch_1024a'
  var DIM = 'gcyr:black_hole_orbit'
  var PARTS = [HATCH, 'gtceu:max_input_bus', 'gtceu:max_output_bus']

  var UNITS = [
    { id: 'slingshot', machine: 'gtceu:hills_slingshot', cx: 46560, minEut: Number(GTValues.V[14]) * 16,
      items: [['grindless:bound_probe_pair', 1]], circuit: 2, out: 'grindless:launched_ig_probe', outMin: 1 }
  ]

  var IDS = [
    'hills_slingshot/bound_probe_pair', 'hills_slingshot/launched_ig_probe', 'assembly_line/hills_slingshot', 'assembly_line/ig_relay_probe',
    'megabar_synthesis/dense_counterweight_core', 'canner/canned_counterweight', 'nuclear_clock/thorium_nav_clock', 'photonic_foundry/optical_nav_core',
    'assembler/slingshot_coil_casing'
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
  function place(u) {
    var desc = global.grindless.patterns.describe(u.machine)
    if (!desc) throw new Error('no structure description for ' + u.machine)
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
    put(controller.x, controller.y, controller.z, u.machine + '[facing=north]')
    return { pos: pos(controller.x, controller.y, controller.z), height: maxY - minY + 1 }
  }

  function registrationChecks() {
    var rm = S.server.getRecipeManager()
    var missing = IDS.filter(function (i) { return !rm.byKey(new (classes().RL)('grindless:' + i)).isPresent() })
    check('lookup', missing.length === 0, IDS.length + ' ids checked; missing: ' + (missing.length ? missing.join(', ') : 'none'))
    var MD = global.grindless.maxPlusSlingshot
    check('static', !!MD && !!MD.skipped && MD.skipped.length === 0, 'rows ' + (MD ? MD.rows.length + MD.slingshot.length : null) + ', skipped ' + JSON.stringify(MD ? MD.skipped : null))
  }

  function tick(u) {
    var waited = S.tick - u.started
    var m = machine(u.pos)
    var tag = u.def.id + '_'
    if (u.phase === 'forming') {
      if (!m || !formCheck(m, waited)) {
        if (waited > 700) { check(tag + 'formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      u.m = m
      u.energy = partsLike(m, /max_maxplus_energy_hatch_1024a/)
      u.bus = partsLike(m, /input_bus/)[0]
      u.outBus = partsLike(m, /output_bus/)[0]
      var ok = !!u.bus && !!u.outBus && u.energy.length === 1
      check(tag + 'formed', ok, 'class ' + m.getClass().getSimpleName() + ', height ' + u.height + ', 1,024 A hatches ' + u.energy.length + ', parts ' + array(m.getParts()).length)
      if (!ok) { u.phase = 'done'; return }
      topUp(u.energy)
      var list = u.def.items.map(function (e) { return [e[0], e[1]] })
      list.push([CIRCUIT, 1, '{Configuration:' + u.def.circuit + '}'])
      setBus(u.bus, list)
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
        note(tag + 'measured', 'recipe ' + String(rec.id) + ', EU/t ' + eut + ', max voltage ' + m.getMaxVoltage())
        check(tag + 'eut', eut >= u.def.minEut, 'expected at least ' + u.def.minEut + ' EU/t, got ' + eut + '; reasons ' + reasons(m))
        u.phase = 'wait'
        u.started = S.tick
      } else if (waited > 300) {
        check(tag + 'eut', false, 'no recipe started in 300 ticks; reasons ' + reasons(m))
        u.phase = 'done'
      }
      return
    }
    if (u.phase === 'wait') {
      var got = count(u.outBus, u.def.out)
      if (got >= u.def.outMin) {
        check(tag + 'output', true, u.def.out + ' x' + got)
        u.phase = 'done'
      } else if (waited > 3600) {
        check(tag + 'output', false, 'no ' + u.def.out + ' x' + u.def.outMin + ' in 3600 ticks (have ' + got + '); reasons ' + reasons(m))
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
    S = { server: server, tick: 0, failed: 0, finished: false, units: [] }
    S.level = server.getLevel(DIM)
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    clear()
    try { registrationChecks() } catch (e) { check('registration_exception', false, errText(e)) }
    UNITS.forEach(function (def) {
      try {
        var r = place(def)
        S.units.push({ def: def, pos: r.pos, height: r.height, phase: 'forming', started: S.tick })
      } catch (e) { check(def.id + '_build_exception', false, errText(e)) }
    })
  }
  ServerEvents.customCommand('gg_test_maxplus_slingshot', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestMaxplusSlingshotRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestMaxplusSlingshotRequest && Date.now() - LOADED >= 10000) {
        global.ggTestMaxplusSlingshotRequest = false
        begin(event.server)
      }
      if (S === null || S.finished) return
      S.tick++
      var open = 0
      S.units.forEach(function (u) {
        if (u.phase === 'done') return
        try { tick(u) } catch (e) { check(u.def.id + '_exception', false, 'phase ' + u.phase + ': ' + errText(e)); u.phase = 'done' }
        if (u.phase !== 'done') open++
      })
      if (open === 0) finish()
      else if (S.tick > 6000) { check('deadline', false, '6000-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
