// TEST ONLY, MAX-A2 first six components (docs/eras/max.md, A2). Command: kubejs custom_command gg_test_max_components
// Markers: GGTEST|max_components|<check>|PASS/FAIL|..., then GGTEST|max_components|DONE|failures=N.
// Band ONLY: X 39448-39511, Z 0-63, Overworld Y 98-115 (zones.json row max_components).
// Doubt (max.md L166): the six component rows ask VA[MAX] (2013265920 EU/t); gtceu:assembly_hall on two gtceu:opv_energy_input_hatch_4a runs them.
//   lookup        every recipe id A2 writes is in the recipe manager; static: nothing skipped, pendingRoutes name the three A3 parts
//   eut           each component recipe asks 2013265920 EU/t
//   gcym_formed   assembly_hall (the ZPM mega: 1 to 4 energy hatches) from its own preview shape with two OpV 4 A hatches forms
//   run_<c>       the recipe lookup finds grindless:assembler/<c> and it starts
//   out_<c>       the component reaches the output bus (inputs from the rows themselves, fluid in the input hatch)
//   neg_formed / neg_blocked   the same machine with ONE OpV 4 A hatch forms but the motor row never starts (nothing in the output bus)
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 39448
  var X1 = 39511
  var Y0 = 98
  var Y1 = 115
  var NAME = 'max_components'
  var VA_MAX = 2013265920
  var GCYM = 'gtceu:assembly_hall'
  var HATCH = 'gtceu:opv_energy_input_hatch_4a'
  var COMPONENTS = ['max_electric_motor', 'max_electric_pump', 'max_electric_piston', 'max_robot_arm', 'max_emitter', 'max_fluid_regulator']
  var IDS = [
    'chemical_bath/stabilised_rebco_tape', 'chemical_reactor/silica_alcogel', 'chemical_bath/silylated_alcogel', 'chemical_reactor/exotic_infiltrated_preform',
    'chemical_reactor/potted_superleak', 'lathe/exotic_composite_rod', 'forming_press/exotic_composite_rotor', 'cutter/laminated_terfenol_stack',
    'assembler/max_field_coil', 'assembler/max_optical_isolator', 'assembler/sc_magnetic_bearing', 'assembler/superfluid_valve'
  ].concat(COMPONENTS.map(function (c) { return 'assembler/' + c }))

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Regs: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
      BI: Java.loadClass('net.minecraft.core.registries.BuiltInRegistries'),
      EUCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.EURecipeCapability').CAP
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
  function topUp(list) { list.forEach(function (p) { var c = p.energyContainer; c.setEnergyStored(c.getEnergyCapacity()) }) }
  function formCheck(m, waited) {
    if (m.isFormed()) return true
    if (waited >= 100 && waited % 50 === 0) {
      if (m.checkPatternWithLock()) { m.setFlipped(m.getMultiblockState().isNeededFlip()); m.onStructureFormed() }
    }
    return m.isFormed()
  }
  function why(m) {
    try {
      var er = m.getMultiblockState().error
      var info = ''
      try { info = ' | ' + String(er.getErrorInfo().getString()) + ' @ ' + String(er.getPos()) } catch (x) { }
      return String(er) + info
    } catch (e) { return 'unknown' }
  }
  function count(part, id) {
    var st = part.getInventory().storage
    var n = 0
    for (var i = 0; i < st.getSlots(); i++) {
      var s = st.getStackInSlot(i)
      if (!s.isEmpty() && String(classes().BI.ITEM.getKey(s.getItem())) === id) n += Number(s.getCount())
    }
    return n
  }
  function clearBus(part) {
    var st = part.getInventory().storage
    for (var i = 0; i < st.getSlots(); i++) st.setStackInSlot(i, Item.of('minecraft:air'))
  }
  function rowOf(name) {
    var rows = global.grindless.maxComponents.rows
    for (var i = 0; i < rows.length; i++) if (rows[i].name === name) return rows[i]
    return null
  }
  // "4x gtceu:x" or "#tag" / "2x #tag" -> a stack (the first member of a tag)
  function stackOf(s) {
    var m = /^(?:(\d+)x )?(.+)$/.exec(String(s))
    var n = m[1] ? Number(m[1]) : 1
    var id = m[2]
    if (id.charAt(0) === '#') id = String(array(Ingredient.of(id).getItemIds())[0])
    return Item.of(id, n)
  }
  function fill(u, name) {
    var row = rowOf(name)
    clearBus(u.inBus)
    clearBus(u.outBus)
    var st = u.inBus.getInventory().storage
    row.items.forEach(function (s, n) { st.setStackInSlot(n, stackOf(s)) })
    u.hatches.forEach(function (h) { h.tank.setFluidInTank(0, Fluid.of('gtceu:lubricant', 0).getFluidStack()) })
    row.fluids.forEach(function (f, n) { if (u.hatches[n]) u.hatches[n].tank.setFluidInTank(0, Fluid.of(f[0], f[1] * 2).getFluidStack()) })
  }

  function checkRecipes(server) {
    var rm = server.getRecipeManager()
    var RL = classes().RL
    var missing = IDS.filter(function (i) { return !rm.byKey(new RL('grindless:' + i)).isPresent() })
    check('lookup', missing.length === 0, IDS.length + ' ids checked; missing: ' + (missing.length ? missing.join(', ') : 'none'))
    var MC = global.grindless.maxComponents
    var pending = MC ? MC.pendingRoutes.join(',') : 'none'
    check('static', !!MC && MC.skipped.length === 0 && /max_conveyor_module/.test(pending) && /max_sensor/.test(pending) && /max_field_generator/.test(pending),
      'recipes ' + (MC ? MC.recipes.length : null) + ', skipped ' + JSON.stringify(MC ? MC.skipped : null) + ', pending ' + pending)
    var bad = []
    COMPONENTS.forEach(function (c) {
      var r = rm.byKey(new RL('grindless:assembler/' + c))
      if (!r.isPresent()) { bad.push(c + ' absent'); return }
      var eut = Number(r.get().tickInputs.get(classes().EUCap).get(0).content)
      if (eut !== VA_MAX) bad.push(c + ' ' + eut)
    })
    check('eut', bad.length === 0, 'components off VA[MAX]: ' + (bad.length ? bad.join(', ') : 'none'))
  }

  // GTM's own preview shape of the GCyM machine, placed block by block: `want` energy hatch cells become OpV 4 A hatches (the extra
  // energy cells go back to casing; the parallel hatch cell takes the second one), buses become HV ones (16 slots)
  function placeGcym(ox, oy, oz, want) {
    var def = classes().Regs.MACHINES.get(new (classes().RL)(GCYM))
    if (!def) throw new Error(GCYM + ' is not registered')
    var shapes = array(def.getMatchingShapes())
    if (shapes.length === 0) throw new Error('no preview shape for ' + GCYM)
    var grid = shapes[0].getBlocks()
    var cells = []
    var ctl = null
    var i, j, k
    for (i = 0; i < grid.length; i++) {
      for (j = 0; j < grid[i].length; j++) {
        for (k = 0; k < grid[i][j].length; k++) {
          if (grid[i][j][k]) cells.push({ x: i, y: j, z: k, state: grid[i][j][k].getBlockState() })
        }
      }
    }
    cells.forEach(function (c) { if (c.state.getBlock() === def.getBlock()) ctl = c })
    if (ctl === null) throw new Error('no controller in the preview shape')
    var parsed = []
    var census = {}
    cells.forEach(function (c) {
      var s = String(c.state)
      if (/Block\{minecraft:air\}/.test(s)) return
      var m = /Block\{([^}]+)\}(\[.*\])?/.exec(s)
      if (!m) return
      parsed.push({ x: c.x, y: c.y, z: c.z, id: m[1], props: m[2] || '' })
      census[m[1]] = (census[m[1]] || 0) + 1
    })
    var byCount = Object.keys(census).sort(function (a, b) { return census[b] - census[a] })
    var casing = byCount.filter(function (id) { return /casing/.test(id) })[0] || byCount[0]
    var energy = 0
    parsed.forEach(function (c) {
      if (!/energy_input_hatch/.test(c.id)) return
      if (energy < want) { c.id = HATCH; energy++ } else { c.id = casing; c.props = '' }
    })
    parsed.forEach(function (c) { if (energy < want && /parallel_hatch/.test(c.id)) { c.id = HATCH; energy++ } })
    if (energy < want) {
      var minX = Math.min.apply(null, parsed.map(function (c) { return c.x }))
      var side = parsed.filter(function (c) { return c.id === casing && c.x === minX && c.y === ctl.y })
      if (side.length > 0) { side[0].id = HATCH; side[0].props = ''; energy++ }
    }
    parsed.forEach(function (c) {
      if (/input_bus/.test(c.id)) c.id = 'gtceu:hv_input_bus'
      else if (/output_bus/.test(c.id)) c.id = 'gtceu:hv_output_bus'
    })
    var placed = 0
    var refused = []
    parsed.forEach(function (c) {
      var x = ox + c.x - ctl.x
      var y = oy + c.y - ctl.y
      var z = oz + c.z - ctl.z
      var ok = put(x, y, z, c.id + c.props)
      if (!ok && c.props !== '') ok = put(x, y, z, c.id)
      if (ok) placed++
      else refused.push(c.id + '@' + x + ',' + y + ',' + z)
    })
    return { pos: pos(ox, oy, oz), placed: placed, energy: energy, refused: refused }
  }

  function begin() {
    S.level = S.server.getLevel('minecraft:overworld')
    try { checkRecipes(S.server) } catch (e) { check('recipes_exception', false, errText(e)) }
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    command('fill ' + X0 + ' ' + Y0 + ' 0 ' + X1 + ' ' + Y1 + ' 63 minecraft:air')
    try {
      var g = placeGcym(39480, 100, 32, 2)
      note('gcym_placed', g.placed + ' blocks, ' + g.energy + ' OpV 4 A hatch cell(s); refused: ' + (g.refused.join(', ') || 'none'))
      S.main = { phase: 'forming', started: 0, pos: g.pos, next: 0 }
      var n = placeGcym(39460, 100, 32, 1)
      note('neg_placed', n.placed + ' blocks, ' + n.energy + ' OpV 4 A hatch cell(s); refused: ' + (n.refused.join(', ') || 'none'))
      S.neg = { phase: 'forming', started: 0, pos: n.pos }
    } catch (e) { check('gcym_build', false, errText(e)); S.main = null; S.neg = null }
  }

  function grab(u, m, want) {
    u.energy = partsLike(m, /energy_input_hatch/)
    u.inBus = partsLike(m, /input_bus/)[0]
    u.outBus = partsLike(m, /output_bus/)[0]
    u.hatches = partsLike(m, /^gtceu:[a-z0-9]+_input_hatch$/)
    u.m = m
    return u.energy.length === want && !!u.inBus && !!u.outBus
  }

  function tickMain(u) {
    var waited = S.tick - u.started
    var m = machine(u.pos)
    if (u.phase === 'forming') {
      if (!m || !formCheck(m, S.tick)) {
        if (S.tick > 700) { check('gcym_formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      var okp = grab(u, m, 2)
      var ids = u.energy.map(function (p) { return String(p.getDefinition().getId()) })
      check('gcym_formed', okp && ids.every(function (h) { return h === HATCH }),
        GCYM + ' formed; energy hatches [' + ids.join(', ') + '], fluid input hatches ' + u.hatches.length + '; max voltage ' + Number(m.getMaxVoltage()))
      if (!okp) { u.phase = 'done'; return }
      u.phase = 'load'
      return
    }
    topUp(u.energy)
    var logic = u.m.getRecipeLogic()
    var name = COMPONENTS[u.next]
    if (u.phase === 'load') {
      fill(u, name)
      u.started = S.tick
      u.phase = 'run'
      return
    }
    if (u.phase === 'run') {
      var last = logic.getLastRecipe()
      var id = last ? String(last.id) : 'none'
      var want = 'grindless:assembler/' + name
      if ((logic.isWorking() && id === want) || waited > 300) {
        var ok = logic.isWorking() && id === want
        check('run_' + name, ok, 'working ' + logic.isWorking() + ', recipe ' + id + ' (expected ' + want + '), status ' + String(logic.getStatus()))
        u.phase = ok ? 'output' : 'next'
        u.started = S.tick
      }
      return
    }
    if (u.phase === 'output') {
      var made = count(u.outBus, 'grindless:' + name)
      if (made >= 1 || waited > 1500) {
        check('out_' + name, made === 1, made + ' x grindless:' + name + ' in the output bus after ' + waited + ' ticks')
        u.phase = 'next'
      }
      return
    }
    if (u.phase === 'next') {
      u.next++
      u.phase = u.next >= COMPONENTS.length ? 'done' : 'load'
    }
  }

  // one OpV 4 A hatch: VA[MAX] is out of reach, so the motor row must never start
  function tickNeg(u) {
    var m = machine(u.pos)
    if (u.phase === 'forming') {
      if (!m || !formCheck(m, S.tick)) {
        if (S.tick > 700) { check('neg_formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      var okp = grab(u, m, 1)
      check('neg_formed', okp, GCYM + ' formed on one OpV 4 A hatch; max voltage ' + Number(m.getMaxVoltage()))
      if (!okp) { u.phase = 'done'; return }
      fill(u, 'max_electric_motor')
      u.started = S.tick
      u.phase = 'watch'
      return
    }
    topUp(u.energy)
    if (S.tick - u.started >= 200) {
      var logic = u.m.getRecipeLogic()
      var last = logic.getLastRecipe()
      var made = count(u.outBus, 'grindless:max_electric_motor')
      check('neg_blocked', !logic.isWorking() && made === 0, 'working ' + logic.isWorking() + ', last recipe ' + (last ? String(last.id) : 'none') + ', motors out ' + made +
        ', status ' + String(logic.getStatus()))
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
  ServerEvents.customCommand('gg_test_max_components', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestMaxComponentsRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestMaxComponentsRequest && Date.now() - LOADED >= 10000) {
        global.ggTestMaxComponentsRequest = false
        S = { server: event.server, tick: 0, failed: 0, finished: false, main: null, neg: null }
        try { begin() } catch (e) { check('setup_exception', false, errText(e)); finish() }
        return
      }
      if (S === null || S.finished) return
      S.tick++
      if (S.main && S.main.phase !== 'done') {
        try { tickMain(S.main) } catch (e) { check('main_exception', false, 'phase ' + S.main.phase + ': ' + errText(e)); S.main.phase = 'done' }
      }
      if (S.neg && S.neg.phase !== 'done') {
        try { tickNeg(S.neg) } catch (e) { check('neg_exception', false, 'phase ' + S.neg.phase + ': ' + errText(e)); S.neg.phase = 'done' }
      }
      if ((!S.main || S.main.phase === 'done') && (!S.neg || S.neg.phase === 'done')) finish()
      else if (S.tick > 12000) { check('deadline', false, '12000-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
