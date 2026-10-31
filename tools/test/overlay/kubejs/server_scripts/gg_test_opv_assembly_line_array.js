// priority: -6299
// TEST ONLY, OpV-M2 (gtceu:assembly_line_array). Command: kubejs custom_command gg_test_opv_assembly_line_array
// Band ONLY: X 38592-38655, Z 0-63, Overworld Y 98-115 (the array is 7 high; zones.json carries the same Y range).
//   T1 (named uncertainty, S0-10: does a GTM AssemblyLineMachine on our pattern, with the x262,144 hatch, honour ordered inputs and research?):
//     recipes         grindless:assembly_line/assembly_line_array is in the recipe manager (opv/assembly_line_array.js reports no missing input)
//     formed          the array forms with the maintenance hatch, two OpV 16 A energy hatches, three input buses, a data access hatch, an output bus and the OpV hatch (262,144)
//     ordered         a three-item ordered recipe starts in exactly one bus order (GTM keeps its ordered-input check); NOTE names the order that worked
//     ordered_parallel the running ordered recipe has more than one copy and EU/t = copies x recipe EU/t (a long product, positive)
//     research_blocked a recipe with research does not start without the data stick
//     research_parallel with the stick in the data access hatch it starts, with more than one copy and EU/t = copies x recipe EU/t
//   Fallback (docs/eras/opv.md #### M2.): if ordered fails after one repair, the array stops enforcing the order; if research fails too, M2 stops.
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 38592
  var X1 = 38655
  var Y0 = 98
  var Y1 = 115
  var NAME = 'opv_assembly_line_array'
  var ID = 'gtceu:assembly_line_array'
  var HATCH = 'gtceu:opv_parallel_hatch'
  var ENERGY16 = 'gtceu:opv_energy_input_hatch_16a'
  var RECIPE = 'grindless:assembly_line/assembly_line_array'
  var RESEARCH_ID = 'gg_opv_m2_research'
  var ORDER_ITEMS = ['minecraft:dandelion', 'minecraft:poppy', 'minecraft:azure_bluet']
  var RESEARCH_ITEMS = ['minecraft:cornflower', 'minecraft:allium', 'minecraft:oxeye_daisy']
  var PROBE_EUT = 2048
  var BUDGET = 2 * 16 * 536870912
  var CX = 38624
  var CY = 100
  var CZ = 16
  // the front wall's first row: column 4 is the controller
  var HEAD = { 1: 'gtceu:maintenance_hatch', 2: ENERGY16, 3: ENERGY16, 5: 'gtceu:data_access_hatch', 6: HATCH }
  var BUSES = 3

  ServerEvents.recipes(function (event) {
    try {
      var o = ORDER_ITEMS
      event.recipes.gtceu.assembly_line('gg_test_opv_m2:ordered').itemInputs('1x ' + o[0]).itemInputs('1x ' + o[1]).itemInputs('1x ' + o[2]).EUt(PROBE_EUT).duration(40)
      var r = RESEARCH_ITEMS
      event.recipes.gtceu.assembly_line('gg_test_opv_m2:research').itemInputs('1x ' + r[0]).itemInputs('1x ' + r[1]).itemInputs('1x ' + r[2]).EUt(PROBE_EUT).duration(40)
        .researchWithoutRecipe(RESEARCH_ID)
    } catch (e) {
      console.error('[gg_test opv_assembly_line_array] could not add the test recipes: ' + errText(e))
    }
  })

  function classes() {
    if (C !== null) return C
    C = {
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
      RM: Java.loadClass('com.gregtechceu.gtceu.utils.ResearchManager')
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
  function setBus(p, id) {
    var st = p.getInventory().storage
    for (var i = 0; i < st.getSlots(); i++) st.setStackInSlot(i, Item.of('minecraft:air'))
    if (id) st.setStackInSlot(0, Item.of(id, 1))
  }
  function fillBus(p, id) {
    var st = p.getInventory().storage
    for (var i = 0; i < st.getSlots(); i++) st.setStackInSlot(i, Item.of(id, 64))
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
  function status(m) { try { return String(m.getRecipeLogic().getStatus()) } catch (e) { return 'unknown' } }
  function reasons(m) { try { return String(m.getRecipeLogic().getFailureReasons()) } catch (e) { return 'unknown' } }
  function snapshot(m) {
    var rec = m.getRecipeLogic().getLastRecipe()
    if (rec === null || rec === undefined) return null
    var eut = NaN
    try { eut = Number(classes().RecipeHelper.getRealEUtWithIO(rec).getTotalEU()) } catch (e) { }
    var par = NaN
    try { par = Number(rec.parallels) } catch (e) { }
    return { parallels: par, eut: eut, id: String(rec.id) }
  }

  // the array from the pattern's description, controller at (CX, CY, CZ) facing north: the head parts of HEAD, the first three input
  // buses of the side wall, the output bus in the tail's middle; every other part cell takes the first block option (the wall)
  function placeArray() {
    var desc = global.grindless.patterns.describe(ID)
    if (!desc) throw new Error('no structure description for ' + ID)
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
    var last = desc.slices.length - 1
    var controller = null
    var buses = 0
    var parts = 0
    // input buses nearest the controller first: slices from the front backwards
    cells.sort(function (a, b) { return b.si - a.si })
    cells.forEach(function (c) {
      c.x = CX - (c.ci - ctrl.ci)
      c.y = CY + (c.ri - ctrl.ri)
      c.z = CZ - (c.si - ctrl.si)
    })
    cells.forEach(function (c) {
      var sym = c.sym
      var block = null
      var part = false
      if (sym.kind === 'controller') { controller = { x: c.x, y: c.y, z: c.z }; return }
      if (sym.kind === 'blocks') block = sym.blocks[0]
      else if (sym.kind === 'oneOf') {
        if (c.ch === 'X' && c.si === last && HEAD[c.ci]) { block = HEAD[c.ci]; part = true; parts++ }
        else if (c.ch === 'O' && c.si === 0 && c.ci === ctrl.ci) { block = 'gtceu:hv_output_bus'; part = true; parts++ }
        else if (c.ch === 'I' && buses < BUSES) { block = 'gtceu:hv_input_bus'; part = true; buses++; parts++ }
        else sym.options.forEach(function (o) { if (!block && o.kind === 'blocks') block = o.blocks[0] })
      }
      if (!block) return
      put(c.x, c.y, c.z, block + (part ? '[facing=' + (c.ch === 'I' ? 'east' : 'north') + ']' : ''))
    })
    put(controller.x, controller.y, controller.z, ID + '[facing=north]')
    note('array_placed', parts + ' part cells placed (expected 9: maintenance, two OpV 16 A energy hatches, data access, OpV parallel hatch, 3 input buses, output bus)')
    return pos(controller.x, controller.y, controller.z)
  }

  function loadOrder(u, items, backFirst) {
    var ordered = backFirst ? u.buses : u.buses.slice().reverse()
    ordered.forEach(function (b, i) { fillBus(b, items[i]) })
  }
  function clearBuses(u) { u.buses.forEach(function (b) { setBus(b, null) }) }

  function begin() {
    S.level = S.server.getLevel('minecraft:overworld')
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    command('fill ' + X0 + ' ' + Y0 + ' 0 ' + X1 + ' ' + Y1 + ' 63 minecraft:air')
    var R = global.grindless.assemblyLineArrayRecipe || {}
    var found = false
    try { found = S.server.getRecipeManager().byKey(new (classes().RL)(RECIPE)).isPresent() } catch (e) { note('recipe_lookup', errText(e)) }
    check('recipes', found && R.done === true && String(R.missing) === '', RECIPE + ' in the recipe manager: ' + found + '; opv/assembly_line_array.js done ' + R.done + ', missing [' + R.missing + ']')
    S.u = { phase: 'forming', started: S.tick, pos: placeArray() }
  }

  function tickArray(u) {
    var waited = S.tick - u.started
    var m = machine(u.pos)
    if (u.phase === 'forming') {
      if (!m || !formCheck(m, waited)) {
        if (waited > 600) { check('formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      u.m = m
      u.energy = partsLike(m, /energy_input_hatch/)
      u.data = partsLike(m, /data_access/)[0]
      u.buses = partsLike(m, /input_bus/).sort(function (a, b) { return b.getPos().getZ() - a.getPos().getZ() })
      var ph = m.getParallelHatch()
      var rep = ph.isPresent() ? Number(ph.get().getCurrentParallel()) : NaN
      check('formed', u.buses.length === BUSES && !!u.data && u.energy.length === 2 && rep === 262144,
        'class ' + m.getClass().getSimpleName() + ', input buses ' + u.buses.length + ', data access ' + !!u.data + ', OpV 16 A energy hatches ' + u.energy.length + ', parallel hatch reports ' + rep)
      u.trials = [['back_first', true], ['front_first', false]]
      u.results = {}
      u.ti = 0
      u.phase = 'trial_load'
      return
    }
    topUp(u.energy)
    if (u.phase === 'trial_load') {
      if (u.ti >= u.trials.length) { u.phase = 'research_load'; u.rstep = 0; return }
      clearBuses(u)
      loadOrder(u, ORDER_ITEMS, u.trials[u.ti][1])
      u.started = S.tick
      u.phase = 'trial_wait'
      return
    }
    if (u.phase === 'trial_wait') {
      var t = u.trials[u.ti]
      var snap = m.getRecipeLogic().isWorking() ? snapshot(m) : null
      if (snap !== null) {
        u.results[t[0]] = snap
        note('ordered_' + t[0], 'started after ' + (S.tick - u.started) + ' ticks: ' + snap.id + ', copies ' + snap.parallels + ', ' + snap.eut + ' EU/t')
      } else if (S.tick - u.started > 100) {
        u.results[t[0]] = null
        note('ordered_' + t[0], 'idle for 100 ticks: status ' + status(m) + ', reasons ' + reasons(m))
      } else return
      clearBuses(u)
      u.phase = 'trial_idle'
      u.started = S.tick
      return
    }
    if (u.phase === 'trial_idle') {
      if (status(m) === 'WORKING' && S.tick - u.started < 120) return
      u.ti++
      u.phase = 'trial_load'
      return
    }
    if (u.phase === 'research_load') {
      if (u.rstep === 0) {
        var a = u.results.back_first
        var b = u.results.front_first
        check('ordered', a === null && b !== null, 'back-first ' + (a ? 'started, copies ' + a.parallels : 'refused') + ', front-first ' + (b ? 'started, copies ' + b.parallels : 'refused') + ' (expected: the order from the bus nearest the controller starts and the reverse is refused, the array sorts its parts by depth from the controller)')
        var win = b
        if (win) check('ordered_parallel', win.parallels > 1 && win.eut > 0 && win.eut % (win.parallels * PROBE_EUT) === 0 && win.eut <= BUDGET, 'the ordered recipe ran at ' + win.parallels + ' copies, ' + win.eut + ' EU/t (expected copies x ' + PROBE_EUT + ' x the overclock, at most ' + BUDGET + ')')
        u.backFirst = false
        clearBuses(u)
        loadOrder(u, RESEARCH_ITEMS, u.backFirst)
        u.started = S.tick
        u.rstep = 1
        return
      }
      if (u.rstep === 1) {
        if (S.tick - u.started < 80) {
          if (m.getRecipeLogic().isWorking()) { check('research_blocked', false, 'the research recipe started without data: ' + String(m.getRecipeLogic().getLastRecipe().id)); u.rstep = 9 }
          return
        }
        check('research_blocked', status(m) !== 'WORKING', 'no data stick: status ' + status(m) + ', reasons ' + reasons(m))
        var stick = Item.of('gtceu:data_stick', '{assembly_line_research:{research_id:"' + RESEARCH_ID + '",research_type:"gtceu:assembly_line"}}')
        var rest = u.data.importItems.insertItem(0, stick.copy(), false)
        if (!rest.isEmpty()) u.data.importItems.storage.setStackInSlot(0, stick.copy())
        var held = u.data.importItems.getStackInSlot(0)
        note('stick', 'data hatch holds ' + held.getId() + ', research id ' + classes().RM.readResearchId(held))
        u.started = S.tick
        u.rstep = 2
        return
      }
      if (u.rstep === 2) {
        var snap2 = m.getRecipeLogic().isWorking() ? snapshot(m) : null
        if (snap2 !== null || S.tick - u.started > 200) {
          check('research_parallel', snap2 !== null && snap2.parallels > 1 && snap2.eut > 0 && snap2.eut % (snap2.parallels * PROBE_EUT) === 0 && snap2.eut <= BUDGET,
            'with the stick: ' + (snap2 ? snap2.id + ', copies ' + snap2.parallels + ', ' + snap2.eut + ' EU/t' : 'no start; status ' + status(m) + ', reasons ' + reasons(m)))
          u.phase = 'done'
        }
        return
      }
      if (u.rstep === 9) u.phase = 'done'
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
  ServerEvents.customCommand('gg_test_opv_assembly_line_array', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestOpvArrayRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestOpvArrayRequest && Date.now() - LOADED >= 10000) {
        global.ggTestOpvArrayRequest = false
        S = { server: event.server, tick: 0, failed: 0, finished: false, u: null }
        try { begin() } catch (e) { check('setup_exception', false, errText(e)); finish() }
        return
      }
      if (S === null || S.finished) return
      S.tick++
      if (S.u && S.u.phase !== 'done') {
        try { tickArray(S.u) } catch (e) { check('array_exception', false, 'phase ' + S.u.phase + ': ' + errText(e)); S.u.phase = 'done' }
      }
      if (!S.u || S.u.phase === 'done') finish()
      else if (S.tick > 1800) { check('deadline', false, '1800-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
