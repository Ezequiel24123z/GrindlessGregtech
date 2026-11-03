// priority: -5172
// TEST ONLY, B14-GAS (gtceu:pristine_gas_works). Command: kubejs custom_command gg_test_maxplus_gas_works
// Band ONLY: X 49408-49471, Z 0-63, Y 98-125, in grindless:magellanic_stream; zones.json row maxplus_gas_works.
//   T1 (named uncertainties):
//     formed    the gas works (25 x 7 x 25) forms on a bus, two output hatches and one 1,024 A MAX+ energy hatch
//     wear      a fixture row (circuit 2, a 50% chanced torchflower, 2^33 EU/t, 20 t) with 100 flowers starts 64 runs and takes between 16 and 48 of them:
//               the chanced input is rolled per run, not once for the multiplied stack
//     fewer     the same fixture with 10 flowers starts exactly 10 runs (10 x 2^33 EU/t), never a partial run
//     parallels the real row c1 with 64 magnetic scoop modules starts 64 runs: 2^39 EU/t, 2,400 t, no shorter run
//     draw      the hatch loses exactly 2^39 EU in a working tick
//     output    the run ends with 64 x 64,000 mB of pristine gas in the output hatches
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let).
(function () {
  var NAME = 'maxplus_gas_works'
  var REQUEST = 'ggTestMaxplusGasWorksRequest'
  var X0 = 49408
  var X1 = 49471
  var Y0 = 98
  var Y1 = 125
  var CX = 49440
  var CY = 108
  var CZ = 10
  var STREAM = 'grindless:magellanic_stream'
  var WORKS = 'gtceu:pristine_gas_works'
  var HATCH = 'gtceu:max_maxplus_energy_hatch_1024a'
  var CIRCUIT = 'gtceu:programmed_circuit'
  var SCOOP = 'grindless:magnetic_scoop_module'
  var GAS = 'gtceu:pristine_gas'
  var CHANCED = 'minecraft:torchflower'
  var RUNS = 64
  var PER_RUN_EUT = 8589934592
  var MAIN_EUT = 549755813888
  var GAS_PER_RUN = 64000
  var DURATION = 2400
  var FORM_TIMEOUT = 900
  var DEADLINE = 6000
  var LOADED_AT = Date.now()

  var S = null
  var C = null

  function errText(e) {
    var s = ''
    try { s = String(e.message || e) } catch (x) { }
    try { s += ' @' + String(e.stack || '').split('\n').slice(0, 3).join(' ') } catch (x) { }
    return s === '' ? 'unprintable exception' : s
  }

  // the fixture row of the wear and fewer checks: circuit 2, a 50% torchflower per run, the real row's 2^33 EU/t, 20 ticks, no output
  ServerEvents.recipes(function (event) {
    try {
      event.recipes.gtceu.pristine_gas_works('gg_test_maxplus_gas_works:wear')
        .circuit(2)
        .chancedInput('1x ' + CHANCED, 5000, 0)
        .EUt(Math.pow(2, 33))
        .duration(20)
    } catch (e) {
      console.error('[gg_test maxplus_gas_works] could not add the fixture row: ' + errText(e))
    }
  })

  function classes() {
    if (C === null) {
      C = {
        Pos: Java.loadClass('net.minecraft.core.BlockPos'),
        ArrayList: Java.loadClass('java.util.ArrayList'),
        Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
        Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
        RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper')
      }
    }
    return C
  }
  function array(collection) {
    var list = new (classes().ArrayList)(collection)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }
  function clean(x) { return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 1500) }
  function check(name, ok, detail) {
    if (!ok) S.failed++
    console.info('GGTEST|' + NAME + '|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + clean(detail))
  }
  function note(name, detail) { console.info('GGTEST|' + NAME + '|' + name + '|NOTE|' + clean(detail)) }
  function cmd(text) { return S.server.runCommandSilent('execute in ' + STREAM + ' run ' + text) }
  function pos(x, y, z) { return new (classes().Pos)(x, y, z) }
  function inBand(x, y, z) { return x >= X0 && x <= X1 && z >= 0 && z <= 63 && y >= Y0 && y <= Y1 }
  function put(x, y, z, block) {
    if (!inBand(x, y, z)) throw new Error('refused: ' + x + ',' + y + ',' + z + ' is outside the band')
    return cmd('setblock ' + x + ' ' + y + ' ' + z + ' ' + block + ' replace')
  }
  function machineAt(p) { return classes().Meta.getMachine(S.server.getLevel(STREAM), p) }
  function partsLike(ctrl, re) {
    var out = []
    array(ctrl.getParts()).forEach(function (p) { if (re.test(String(p.getDefinition().getId()))) out.push(p) })
    return out
  }
  function itemId(s) { return String(classes().Registries.ITEMS.getKey(s.getItem())) }
  function countIn(p, id) {
    var st = p.getInventory().storage
    var n = 0
    for (var i = 0; i < st.getSlots(); i++) {
      var s = st.getStackInSlot(i)
      if (!s.isEmpty() && itemId(s) === id) n += Number(s.getCount())
    }
    return n
  }
  // a count above 64 is split over slots of one bus
  function setBus(p, circuit, id, n) {
    var st = p.getInventory().storage
    for (var i = 0; i < st.getSlots(); i++) st.setStackInSlot(i, Item.of('minecraft:air'))
    st.setStackInSlot(0, Item.of(CIRCUIT, 1, '{Configuration:' + circuit + '}'))
    var slot = 1
    while (n > 0) {
      if (slot >= st.getSlots()) throw new Error('bus is full placing ' + id)
      var take = n > 64 ? 64 : n
      st.setStackInSlot(slot++, Item.of(id, take))
      n -= take
    }
  }
  function topUp(list) { list.forEach(function (p) { var c = p.energyContainer; c.setEnergyStored(c.getEnergyCapacity()) }) }
  function stored(list) {
    var t = 0
    list.forEach(function (p) { t += Number(p.energyContainer.getEnergyStored()) })
    return t
  }
  function tankMb(h) { return Number(h.tank.getFluidInTank(0).getAmount()) }
  function formCheck(m, waited) {
    if (m.isFormed()) return true
    if (waited >= 100 && waited % 50 === 0) {
      if (m.checkPatternWithLock()) { m.setFlipped(m.getMultiblockState().isNeededFlip()); m.onStructureFormed() }
    }
    return m.isFormed()
  }
  function why(m) { try { return String(m.getMultiblockState().error) } catch (e) { return 'unknown' } }
  function reasons(m) { return String(m.getRecipeLogic().getFailureReasons()) }
  function eutOf(rec) {
    try { var io = classes().RecipeHelper.getRealEUtWithIO(rec); return io.isEmpty() ? 0 : Number(io.getTotalEU()) } catch (e) { return NaN }
  }
  function newRecipe(u) {
    var rec = u.m.getRecipeLogic().getLastRecipe()
    return rec !== null && rec !== undefined && rec !== u.last ? rec : null
  }

  // the template walk; the 'X' oneOf cells take the parts in order: a bus, two output hatches, the 1,024 A hatch
  function place() {
    var desc = global.grindless.patterns.describe(WORKS)
    if (!desc) throw new Error('no structure description for ' + WORKS)
    var cells = []
    var ctrl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var sym = desc.symbols[ch]
          if (sym.kind === 'controller') ctrl = { si: si, ri: ri, ci: ci }
          cells.push({ si: si, ri: ri, ci: ci, sym: sym })
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
    var order = ['gtceu:max_input_bus', 'gtceu:max_output_hatch', 'gtceu:max_output_hatch', HATCH]
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
    put(controller.x, controller.y, controller.z, WORKS + '[facing=north]')
    return pos(controller.x, controller.y, controller.z)
  }

  function tick(u) {
    var waited = S.tick - u.started
    var m = machineAt(u.pos)
    if (u.phase === 'forming') {
      if (!m || !formCheck(m, waited)) {
        if (waited > FORM_TIMEOUT) { check('formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      u.m = m
      u.energy = partsLike(m, /max_maxplus_energy_hatch_1024a/)
      u.bus = partsLike(m, /:max_input_bus$/)[0]
      u.out = partsLike(m, /:max_output_hatch$/)
      var ok = !!u.bus && u.energy.length === 1 && u.out.length === 2
      check('formed', ok, 'class ' + m.getClass().getSimpleName() + ', 1,024 A hatches ' + u.energy.length + ', output hatches ' + u.out.length + ', parts ' + array(m.getParts()).length)
      if (!ok) { u.phase = 'done'; return }
      note('capacity', 'output hatch tanks ' + u.out.map(function (h) { return Number(h.tank.getTankCapacity(0)) }).join(',') + ' mB, energy hatch ' + Number(u.energy[0].energyContainer.getEnergyCapacity()) + ' EU')
      topUp(u.energy)
      setBus(u.bus, 2, CHANCED, 100)
      u.last = m.getRecipeLogic().getLastRecipe()
      u.started = S.tick
      u.phase = 'wear'
      return
    }
    if (u.phase !== 'draw') topUp(u.energy)
    var rlg = u.m.getRecipeLogic()
    if (u.phase === 'wear') {
      var rec = newRecipe(u)
      if (rec !== null) {
        var taken = 100 - countIn(u.bus, CHANCED)
        var eut = eutOf(rec)
        note('wear_measured', 'recipe ' + String(rec.id) + ', EU/t ' + eut + ' (' + (eut / PER_RUN_EUT) + ' runs), flowers taken ' + taken)
        check('wear_parallels', eut === RUNS * PER_RUN_EUT, 'the fixture row started ' + (eut / PER_RUN_EUT) + ' runs (want ' + RUNS + ')')
        check('wear', taken >= 16 && taken <= 48, 'a 50% chanced input under 64 runs took ' + taken + ' of 64 (between 16 and 48 means it is rolled per run; 0 or 64 means once for the stack)')
        setBus(u.bus, 2, CHANCED, 0)
        u.last = rec
        u.started = S.tick
        u.phase = 'wear_wait'
      } else if (waited > 300) {
        check('wear', false, 'the fixture row did not start in 300 ticks; reasons ' + reasons(u.m))
        u.phase = 'done'
      }
      return
    }
    if (u.phase === 'wear_wait') {
      if (String(rlg.getStatus()) !== 'WORKING' || waited > 100) {
        setBus(u.bus, 2, CHANCED, 10)
        u.started = S.tick
        u.phase = 'fewer'
      }
      return
    }
    if (u.phase === 'fewer') {
      var r10 = newRecipe(u)
      if (r10 !== null) {
        var e10 = eutOf(r10)
        check('fewer', e10 === 10 * PER_RUN_EUT, 'inputs for 10 runs started ' + (e10 / PER_RUN_EUT) + ' runs (want 10); flowers left ' + countIn(u.bus, CHANCED))
        setBus(u.bus, 2, CHANCED, 0)
        u.last = r10
        u.started = S.tick
        u.phase = 'fewer_wait'
      } else if (waited > 300) {
        check('fewer', false, 'the fixture row did not start in 300 ticks; reasons ' + reasons(u.m))
        u.phase = 'done'
      }
      return
    }
    if (u.phase === 'fewer_wait') {
      if (String(rlg.getStatus()) !== 'WORKING' || waited > 100) {
        setBus(u.bus, 1, SCOOP, RUNS)
        u.started = S.tick
        u.phase = 'main'
      }
      return
    }
    if (u.phase === 'main') {
      var r = newRecipe(u)
      if (r !== null) {
        var eutMain = eutOf(r)
        var duration = Number(rlg.getDuration())
        var worn = RUNS - countIn(u.bus, SCOOP)
        note('main_measured', 'recipe ' + String(r.id) + ', EU/t ' + eutMain + ' (' + (eutMain / PER_RUN_EUT) + ' runs), duration ' + duration + ', scoop modules taken ' + worn)
        check('parallels', eutMain === MAIN_EUT, 'the real row started ' + (eutMain / PER_RUN_EUT) + ' runs at EU/t ' + eutMain + ' (want ' + RUNS + ' runs, 2^39 = ' + MAIN_EUT + '); reasons ' + reasons(u.m))
        check('duration', duration === DURATION, 'the run lasts ' + duration + ' ticks (want ' + DURATION + ')')
        check('wear_real', worn >= 0 && worn <= 8, 'scoop modules taken ' + worn + ' of 64 runs at 156 in 10000; expected about 1')
        u.last = r
        u.before = stored(u.energy)
        u.started = S.tick
        u.phase = 'draw'
      } else if (waited > 300) {
        check('parallels', false, 'the real row did not start in 300 ticks; reasons ' + reasons(u.m))
        u.phase = 'done'
      }
      return
    }
    if (u.phase === 'draw') {
      var after = stored(u.energy)
      var lost = u.before - after
      check('draw', lost === MAIN_EUT, 'the hatch lost ' + lost + ' EU in one working tick (want 2^39 = ' + MAIN_EUT + '); status ' + String(rlg.getStatus()))
      topUp(u.energy)
      try { rlg.setProgress(Math.max(0, DURATION - 20)) } catch (e) { note('skip', 'could not set progress: ' + errText(e)) }
      u.started = S.tick
      u.phase = 'output'
      return
    }
    if (u.phase === 'output') {
      var gas = 0
      var seen = []
      u.out.forEach(function (h) {
        var fs = h.tank.getFluidInTank(0)
        var fid = fs.isEmpty() ? 'empty' : String(classes().Registries.FLUIDS.getKey(fs.getFluid()))
        seen.push(fid + ' ' + tankMb(h))
        if (fid === GAS) gas += tankMb(h)
      })
      if (gas >= RUNS * GAS_PER_RUN) {
        check('output', gas === RUNS * GAS_PER_RUN, 'output hatches hold ' + gas + ' mB of pristine gas (want ' + (RUNS * GAS_PER_RUN) + ')')
        u.phase = 'done'
      } else if (waited > 200) {
        check('output', false, 'output hatches hold ' + gas + ' mB of pristine gas after 200 ticks (want ' + (RUNS * GAS_PER_RUN) + '); tanks ' + seen.join(', ') + '; status ' + String(rlg.getStatus()) + ', progress ' + rlg.getProgress() + '/' + rlg.getDuration() + '; reasons ' + reasons(u.m))
        u.phase = 'done'
      }
    }
  }

  function clear() {
    for (var z = 0; z < 64; z += 8) cmd('fill ' + X0 + ' ' + Y0 + ' ' + z + ' ' + X1 + ' ' + Y1 + ' ' + (z + 7) + ' minecraft:air')
  }
  function finish() {
    if (S.finished) return
    S.finished = true
    try { clear() } catch (e) { }
    cmd('forceload remove ' + X0 + ' 0 ' + X1 + ' 63')
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  function begin(server) {
    S = { server: server, tick: 0, failed: 0, finished: false, units: [] }
    if (!server.getLevel(STREAM)) throw new Error('no level ' + STREAM)
    cmd('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    clear()
    try {
      S.units.push({ id: 'works', pos: place(), phase: 'forming', started: S.tick })
    } catch (e) { check('build_exception', false, errText(e)) }
  }

  ServerEvents.customCommand('gg_test_maxplus_gas_works', function () {
    if (S !== null && !S.finished) return 0
    global[REQUEST] = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global[REQUEST] && Date.now() - LOADED_AT >= 10000) {
        global[REQUEST] = false
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
      else if (S.tick > DEADLINE) { check('deadline', false, DEADLINE + '-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
