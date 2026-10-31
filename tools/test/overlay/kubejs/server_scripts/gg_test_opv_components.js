// TEST ONLY, OpV-A1 (components). Command: kubejs custom_command gg_test_opv_components
// Band ONLY: X 37888-37951, Z 0-63, Overworld Y 98-115 (zones.json "opv_components").
//   T1 (named uncertainty, docs/eras/opv.md "A1. Components": S0-1 read ids, not recipes):
//     recipes      the seven assembler rows of server_scripts/grindless/opv/components.js are in the recipe manager at 2^28 EU/t
//     gtm_cut      each of the four components made here has exactly one producer, ours: GTM's own recipe for the same id is gone (F2)
//     gcym_formed  gtceu:large_assembler, built from its own preview shape with two gtceu:uxv_energy_input_hatch_4a, forms
//     runs         it takes the 2^28 conveyor row (2 motors + 2 chain mesh belts + 1 chain cable + 2 tritanium plates + 4 tritanium rounds +
//                  2 tritanium rings; no fluid) and reports the recipe as running
//     output       the OpV conveyor module reaches the output bus
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 37888
  var X1 = 37951
  var Y0 = 98
  var Y1 = 115
  var NAME = 'opv_components'
  var GCYM = 'gtceu:large_assembler'
  var HATCH = 'gtceu:uxv_energy_input_hatch_4a'
  var OPV_EUT = 268435456
  var ROWS = ['chain_sic_preform', 'superfluid_he3_seal', 'chain_field_coil', 'opv_electric_motor', 'opv_electric_pump', 'opv_conveyor_module',
    'opv_electric_piston']
  var MADE = ['gtceu:opv_electric_motor', 'gtceu:opv_electric_pump', 'gtceu:opv_conveyor_module', 'gtceu:opv_electric_piston']
  var LATER = ['gtceu:opv_robot_arm', 'gtceu:opv_emitter', 'gtceu:opv_sensor', 'gtceu:opv_fluid_regulator']
  var PROBE = 'grindless:assembler/opv_conveyor_module'
  var PROBE_OUT = 'gtceu:opv_conveyor_module'
  var PROBE_IN = [['gtceu:opv_electric_motor', 2], ['grindless:chain_mesh_belt', 2], ['gtceu:chain_strand_single_cable', 1], ['gtceu:tritanium_plate', 2],
    ['gtceu:tritanium_round', 4], ['gtceu:tritanium_ring', 2]]

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Regs: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
      BI: Java.loadClass('net.minecraft.core.registries.BuiltInRegistries'),
      ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
      GTRecipe: Java.loadClass('com.gregtechceu.gtceu.api.recipe.GTRecipe')
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

  // recipe manager: our seven rows at 2^28, and the producers of each component (GT recipes by their item outputs, others by result)
  function outputIds(r, access) {
    var ids = []
    if (r instanceof classes().GTRecipe) {
      var cap = classes().ItemCap
      array(r.getOutputContents(cap)).forEach(function (o) {
        var found = String(cap.serializer.toJson(cap.of(o.content))).match(/"item":"[^"]+"/g) || []
        found.forEach(function (f) { ids.push(f.substring(8, f.length - 1)) })
      })
    } else {
      var res = r.getResultItem(access)
      if (res !== null && !res.isEmpty()) ids.push(String(classes().BI.ITEM.getKey(res.getItem())))
    }
    return ids
  }
  function checkRecipes() {
    var rm = S.server.getRecipeManager()
    var RL = classes().RL
    var bad = []
    ROWS.forEach(function (p) {
      var id = 'grindless:assembler/' + p
      var o = rm.byKey(new RL(id))
      if (!o.isPresent()) { bad.push(id + ' missing'); return }
      var r = o.get()
      var eu = r.getInputEUt()
      var eut = Number(eu.voltage()) * Number(eu.amperage())
      if (String(r.recipeType.registryName) !== 'gtceu:assembler' || eut !== OPV_EUT) bad.push(id + ' type ' + r.recipeType.registryName + ' EU/t ' + eut)
    })
    check('recipes', bad.length === 0, bad.length === 0 ? ROWS.length + ' rows at ' + OPV_EUT + ' EU/t on gtceu:assembler' : bad.join('; '))

    var want = MADE.concat(LATER)
    var index = {}
    want.forEach(function (id) { index[id] = [] })
    var unreadable = 0
    var access = S.server.registryAccess()
    array(rm.getRecipes()).forEach(function (r) {
      try {
        outputIds(r, access).forEach(function (id) { if (index[id] && index[id].indexOf(String(r.getId())) < 0) index[id].push(String(r.getId())) })
      } catch (e) { unreadable++ }
    })
    var wrong = []
    MADE.forEach(function (id) {
      var ours = 'grindless:assembler/' + id.substring(6)
      if (index[id].length !== 1 || index[id][0] !== ours) wrong.push(id + ' <- [' + index[id].join(', ') + ']')
    })
    check('gtm_cut', wrong.length === 0, (wrong.length === 0 ? 'each component has only our assembler row' : wrong.join('; ')) + '; unreadable recipes ' + unreadable)
    note('later', LATER.map(function (id) { return id + ' <- [' + index[id].join(', ') + ']' }).join('; ') + ' (OpV-A2 makes them)')
  }

  // GTM's own preview shape of the GCyM machine, placed block by block: energy hatches (and the parallel hatch cell, for the second one)
  // become UXV 4 A hatches, buses become HV ones (16 slots)
  function placeGcym(ox, oy, oz) {
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
    var energy = 0
    parsed.forEach(function (c) { if (/energy_input_hatch/.test(c.id)) { c.id = HATCH; energy++ } })
    parsed.forEach(function (c) { if (energy < 2 && /parallel_hatch/.test(c.id)) { c.id = HATCH; energy++ } })
    if (energy < 2) {
      // no second ability cell in the preview: the most common block (the casing) on the side face at the controller's height takes it
      var casing = Object.keys(census).sort(function (a, b) { return census[b] - census[a] })[0]
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
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    command('fill ' + X0 + ' ' + Y0 + ' 0 ' + X1 + ' ' + Y1 + ' 63 minecraft:air')
    try { checkRecipes() } catch (e) { check('recipes_exception', false, errText(e)) }
    try {
      var g = placeGcym(37920, 100, 32)
      note('gcym_placed', g.placed + ' blocks from the preview shape, ' + g.energy + ' UXV 4 A hatch cell(s); refused: ' + (g.refused.join(', ') || 'none'))
      S.gcym = { phase: 'forming', started: S.tick, pos: g.pos }
    } catch (e) { check('gcym_build', false, errText(e)); S.gcym = null }
  }

  function tickGcym(u) {
    var waited = S.tick - u.started
    var m = machine(u.pos)
    if (u.phase === 'forming') {
      if (!m || !formCheck(m, waited)) {
        if (waited > 600) { check('gcym_formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      u.energy = partsLike(m, /energy_input_hatch/)
      u.inBus = partsLike(m, /input_bus/)[0]
      u.outBus = partsLike(m, /output_bus/)[0]
      var hatches = u.energy.map(function (p) { return String(p.getDefinition().getId()) })
      check('gcym_formed', u.energy.length === 2 && hatches.every(function (h) { return h === HATCH }) && !!u.inBus && !!u.outBus,
        GCYM + ' formed; energy hatches [' + hatches.join(', ') + '], input bus ' + !!u.inBus + ', output bus ' + !!u.outBus +
        '; max voltage ' + Number(m.getMaxVoltage()))
      if (!u.inBus || !u.outBus || u.energy.length === 0) { u.phase = 'done'; return }
      topUp(u.energy)
      var st = u.inBus.getInventory().storage
      for (var i = 0; i < st.getSlots(); i++) st.setStackInSlot(i, Item.of('minecraft:air'))
      PROBE_IN.forEach(function (e, n) { st.setStackInSlot(n, Item.of(e[0], e[1])) })
      u.m = m
      u.started = S.tick
      u.phase = 'run'
      return
    }
    topUp(u.energy)
    var logic = u.m.getRecipeLogic()
    if (u.phase === 'run') {
      var last = logic.getLastRecipe()
      var id = last ? String(last.id) : 'none'
      if ((logic.isWorking() && id === PROBE) || waited > 300) {
        check('runs', logic.isWorking() && id === PROBE, 'working ' + logic.isWorking() + ', recipe ' + id + ' (expected ' + PROBE + '), max voltage ' +
          Number(u.m.getMaxVoltage()) + ', status ' + String(logic.getStatus()))
        u.phase = logic.isWorking() ? 'output' : 'done'
        u.started = S.tick
      }
      return
    }
    if (u.phase === 'output') {
      var made = count(u.outBus, PROBE_OUT)
      if (made >= 1 || waited > 1500) {
        check('output', made === 1, made + ' x ' + PROBE_OUT + ' in the output bus after ' + waited + ' ticks; motors left ' + count(u.inBus, 'gtceu:opv_electric_motor'))
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
  ServerEvents.customCommand('gg_test_opv_components', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestOpvComponentsRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestOpvComponentsRequest && Date.now() - LOADED >= 10000) {
        global.ggTestOpvComponentsRequest = false
        S = { server: event.server, tick: 0, failed: 0, finished: false, gcym: null }
        try { begin() } catch (e) { check('setup_exception', false, errText(e)); finish() }
        return
      }
      if (S === null || S.finished) return
      S.tick++
      if (S.gcym && S.gcym.phase !== 'done') {
        try { tickGcym(S.gcym) } catch (e) { check('gcym_exception', false, 'phase ' + S.gcym.phase + ': ' + errText(e)); S.gcym.phase = 'done' }
      }
      if (!S.gcym || S.gcym.phase === 'done') finish()
      else if (S.tick > 2600) { check('deadline', false, '2600-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
