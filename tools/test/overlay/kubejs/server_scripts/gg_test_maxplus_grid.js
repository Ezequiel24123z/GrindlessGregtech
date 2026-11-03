// priority: -5192
// TEST ONLY, XP-H4a (gtceu:hyper_assembly_array). Command: kubejs custom_command gg_test_maxplus_grid
// Band ONLY: X 46784-46847, Z 0-63, Y 98-125 of gcyr:black_hole_orbit (Sgr A*; zones.json row maxplus_grid).
//   T1 (named uncertainty: a recipe with nine distinct inputs, counts above 64 and a million-mB bath runs on the array with 81 input buses and one
//   1,024 A MAX+ hatch: the inputs are spread over the buses, the recipe starts at 2^39 EU/t and the output block appears):
//     lookup   every row of the package and the controller line is in the recipe manager
//     static   nothing skipped; the recipe type's item inputs are the widest row's
//     formed   the array forms with 74 input buses (its 80 part cells), one 1,024 A hatch, two output buses and two fluid hatches
//     eut      the Hyperstargate base row starts at 2^39 EU/t
//     output   a Hyperstargate base block in an output bus (the run skips to 20 ticks before the end once the recipe is measured)
// The other rows differ by data only, on the mechanism this run proves: they are looked up, not run.
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 46784
  var X1 = 46847
  var Y0 = 98
  var Y1 = 125
  var NAME = 'maxplus_grid'
  var CY = 104
  var CZ = 16
  var CIRCUIT = 'gtceu:programmed_circuit'
  var HATCH = 'gtceu:max_maxplus_energy_hatch_1024a'
  var DIM = 'gcyr:black_hole_orbit'
  var BUSES = 74
  var ROW = 'hyperstargate_base'

  function gridRows() {
    var G = global.grindless.maxPlusGrid
    return G.rows.concat(G.creative)
  }
  function rowOf(name) {
    var found = null
    gridRows().forEach(function (r) { if (r.name === name) found = r })
    return found
  }

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
  // a count above 64 is split over slots of one bus
  function fill(p, id, n, nbt) {
    var st = p.getInventory().storage
    var slot = 0
    while (n > 0) {
      while (slot < st.getSlots() && !st.getStackInSlot(slot).isEmpty()) slot++
      if (slot >= st.getSlots()) throw new Error('bus is full placing ' + id)
      var take = n > 64 ? 64 : n
      st.setStackInSlot(slot, nbt ? Item.of(id, take, nbt) : Item.of(id, take))
      n -= take
    }
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

  // the structure: the template walk; the 'X' oneOf cells take the parts in order: BUSES input buses, one 1,024 A hatch, two output buses, two input hatches
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
    xs.sort(function (a, b) { return a.y - b.y || a.x - b.x })
    var order = []
    for (var i = 0; i < BUSES; i++) order.push('gtceu:max_input_bus')
    order.push(HATCH, 'gtceu:max_output_bus', 'gtceu:max_output_bus', 'gtceu:max_input_hatch', 'gtceu:max_input_hatch')
    if (xs.length < order.length) throw new Error('only ' + xs.length + ' part cells for ' + order.length + ' parts')
    var chosen = {}
    xs.forEach(function (c, k) { if (k < order.length) chosen[c.x + ',' + c.y + ',' + c.z] = order[k] })
    cells.forEach(function (c) {
      var sym = c.sym
      var block = null
      var part = false
      if (sym.kind === 'controller') { controller = { x: c.x, y: c.y, z: c.z }; return }
      if (sym.kind === 'blocks') block = sym.blocks[0]
      else if (sym.kind === 'frames') block = 'gtceu:' + sym.materials[0] + '_frame'
      else if (sym.kind === 'oneOf') {
        var pid = chosen[c.x + ',' + c.y + ',' + c.z]
        if (pid) { block = pid; part = true }
        else sym.options.forEach(function (o) { if (!block && o.kind === 'blocks') block = o.blocks[0] })
      }
      if (!block) return
      put(c.x, c.y, c.z, block + (part ? '[facing=north]' : ''))
    })
    put(controller.x, controller.y, controller.z, u.machine + '[facing=north]')
    return { pos: pos(controller.x, controller.y, controller.z) }
  }

  function registrationChecks() {
    var rm = S.server.getRecipeManager()
    var ids = gridRows().map(function (r) { return 'hyper_assembly_array/' + r.name }).concat(['assembly_line/hyper_assembly_array'])
    var missing = ids.filter(function (i) { return !rm.byKey(new (classes().RL)('grindless:' + i)).isPresent() })
    check('lookup', missing.length === 0, ids.length + ' ids checked; missing: ' + (missing.length ? missing.join(', ') : 'none'))
    var G = global.grindless.maxPlusGrid
    var widest = 0
    gridRows().forEach(function (r) { if (r.items.length + 1 > widest) widest = r.items.length + 1 })
    check('static', !!G && !!G.skipped && G.skipped.length === 0 && G.maxItems === widest, 'rows ' + gridRows().length + ', max item inputs ' + (G ? G.maxItems : null) + ', widest row ' + widest + ', skipped ' + JSON.stringify(G ? G.skipped : null))
  }

  function tick(u) {
    var waited = S.tick - u.started
    var m = machine(u.pos)
    var tag = u.id + '_'
    if (u.phase === 'forming') {
      if (!m || !formCheck(m, waited)) {
        if (waited > 900) { check(tag + 'formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      u.m = m
      u.energy = partsLike(m, /max_maxplus_energy_hatch_1024a/)
      u.buses = partsLike(m, /input_bus/)
      u.outBuses = partsLike(m, /output_bus/)
      u.hatches = partsLike(m, /^gtceu:[a-z0-9]+_input_hatch$/)
      var ok = u.buses.length === BUSES && u.energy.length === 1 && u.outBuses.length === 2 && u.hatches.length === 2
      check(tag + 'formed', ok, 'class ' + m.getClass().getSimpleName() + ', input buses ' + u.buses.length + ', 1,024 A hatches ' + u.energy.length + ', output buses ' + u.outBuses.length + ', fluid hatches ' + u.hatches.length + ', parts ' + array(m.getParts()).length)
      if (!ok) { u.phase = 'done'; return }
      topUp(u.energy)
      u.buses.forEach(clearBus)
      // each distinct input in its own bus; the circuit in the first
      // the shape has 80 part cells (74 buses, the rest of the parts): inputs past the first 73 stacks share buses
      fill(u.buses[0], CIRCUIT, 1, '{Configuration:' + u.row.circuit + '}')
      u.row.items.forEach(function (e, k) { fill(u.buses[(1 + k) % BUSES], e[0], e[1]) })
      u.row.fluids.forEach(function (f, k) {
        try { u.hatches[k].tank.setFluidInTank(0, Fluid.of(f[0], f[1]).getFluidStack()) } catch (e) { note(tag + 'fluid', 'could not fill hatch ' + k + ': ' + errText(e)) }
      })
      u.last = m.getRecipeLogic().getLastRecipe()
      u.started = S.tick
      u.phase = 'run'
      return
    }
    topUp(u.energy)
    var rlg = u.m.getRecipeLogic()
    if (u.phase === 'run') {
      var rec = rlg.getLastRecipe()
      if (rec !== null && rec !== undefined && rec !== u.last) {
        var eut = NaN
        try { var io = classes().RecipeHelper.getRealEUtWithIO(rec); eut = io.isEmpty() ? 0 : Number(io.getTotalEU()) } catch (e) { }
        note(tag + 'measured', 'recipe ' + String(rec.id) + ', EU/t ' + eut + ', max voltage ' + u.m.getMaxVoltage())
        check(tag + 'eut', eut >= u.minEut, 'expected at least ' + u.minEut + ' EU/t, got ' + eut + '; reasons ' + reasons(u.m))
        try { rlg.setProgress(Math.max(0, Number(rlg.getDuration()) - 20)) } catch (e) { note(tag + 'skip', 'could not set progress: ' + errText(e)) }
        u.phase = 'wait'
        u.started = S.tick
      } else if (waited > 300) {
        check(tag + 'eut', false, 'no recipe started in 300 ticks; reasons ' + reasons(u.m))
        u.phase = 'done'
      }
      return
    }
    if (u.phase === 'wait') {
      var got = 0
      u.outBuses.forEach(function (p) { got += count(p, u.row.out[0]) })
      if (got >= 1) {
        check(tag + 'output', true, u.row.out[0] + ' x' + got)
        u.phase = 'done'
      } else if (waited > 600) {
        check(tag + 'output', false, 'no ' + u.row.out[0] + ' in 600 ticks; reasons ' + reasons(u.m))
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
    try {
      var row = rowOf(ROW)
      if (!row) throw new Error('no grid row ' + ROW)
      var r = place({ machine: 'gtceu:hyper_assembly_array', cx: 46816 })
      S.units.push({ id: 'array', row: row, pos: r.pos, minEut: Number(GTValues.V[14]) * row.amps, phase: 'forming', started: S.tick, cx: 46816 })
    } catch (e) { check('build_exception', false, errText(e)) }
  }
  ServerEvents.customCommand('gg_test_maxplus_grid', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestMaxplusGridRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestMaxplusGridRequest && Date.now() - LOADED >= 10000) {
        global.ggTestMaxplusGridRequest = false
        begin(event.server)
      }
      if (S === null || S.finished) return
      S.tick++
      var open = 0
      S.units.forEach(function (u) {
        if (u.phase === 'done') return
        try { tick(u) } catch (e) { check(u.id + '_exception', false, 'phase ' + u.phase + ': ' + errText(e)); u.phase = 'done' }
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
