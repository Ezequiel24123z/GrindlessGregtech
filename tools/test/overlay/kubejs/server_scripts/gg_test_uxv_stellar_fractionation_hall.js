// priority: -9975
// TEST ONLY, UXV-M2 (gtceu:stellar_fractionation_hall). Command: kubejs custom_command gg_test_uxv_stellar_fractionation_hall
// Band ONLY: X 37056-37119, Z 0-63, Overworld Y 98-115 (the hall has no site: it is built in the Overworld; zones.json carries the same Y range).
//   T1 (named uncertainty: a distillation tower recipe with 12 fluid outputs at the x65,536 UXV hatch keeps long amounts and lands exact in 12 output hatches):
//     formed   the hall (13 x 13 x 25) with one UXV energy hatch, the UXV parallel hatch, a bus, an input hatch and 12 UHV output hatches forms and sees the hatch
//     lookup   the 12-output probe (16 EU/t, non-consumed input) and the controller recipe are in the recipe manager
//     copies   the probe runs min(4,096 x 65,536, energy cap floor(max voltage / 16), output room of the tightest hatch) copies
//     outputs  after the run each of the 12 hatches holds exactly copies x its recipe amount, one fluid per hatch
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 37056
  var X1 = 37119
  var Y0 = 98
  var Y1 = 115
  var NAME = 'uxv_stellar_fractionation_hall'
  var ID = 'gtceu:stellar_fractionation_hall'
  var CX = 37088
  var CY = 100
  var CZ = 20
  var CEILING = 4096 * 65536
  var PROBE_EUT = 16
  var INPUT = 'gtceu:sulfuric_acid'
  var OUT_HATCH = 'gtceu:uhv_output_hatch'
  var OUTS = [
    ['minecraft:water', 10], ['minecraft:lava', 20], ['gtceu:oxygen', 30], ['gtceu:hydrogen', 40],
    ['gtceu:nitrogen', 50], ['gtceu:helium', 60], ['gtceu:methane', 70], ['gtceu:ethylene', 80],
    ['gtceu:propene', 90], ['gtceu:benzene', 100], ['gtceu:toluene', 110], ['gtceu:ammonia', 120]
  ]
  var PARTS = { 2: 'gtceu:maintenance_hatch', 3: 'gtceu:uxv_energy_input_hatch', 4: 'gtceu:hv_input_bus', 5: 'gtceu:hv_input_hatch', 8: 'gtceu:uxv_parallel_hatch' }

  ServerEvents.recipes(function (event) {
    try {
      var b = event.recipes.gtceu.distillation_tower('gg_test_uxv:sfh_probe').notConsumableFluid(Fluid.of(INPUT, 1)).duration(20).EUt(PROBE_EUT)
      OUTS.forEach(function (o) { b.outputFluids(Fluid.of(o[0], o[1])) })
    } catch (e) {
      console.error('[gg_test uxv_stellar_fractionation_hall] could not add the test recipe: ' + errText(e))
    }
  })

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries')
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
  function field(o, name) {
    try {
      var v = o[name]
      if (v !== undefined && v !== null && typeof v !== 'function') return Number(v)
      var g = o['get' + name.charAt(0).toUpperCase() + name.substring(1)]
      if (typeof g === 'function') return Number(g.call(o))
    } catch (e) { }
    return NaN
  }
  function snapshot(m) {
    var rec = m.getRecipeLogic().getLastRecipe()
    if (rec === null || rec === undefined) return null
    return { parallels: field(rec, 'parallels'), id: String(rec.id) }
  }
  function tankFluid(p) { try { return String(classes().Registries.FLUIDS.getKey(p.tank.getFluidInTank(0).getFluid())) } catch (e) { return '?' } }
  function tankAmount(p) { try { return Number(p.tank.getFluidInTank(0).getAmount()) } catch (e) { return NaN } }
  function tankCapacity(p) { try { return Number(p.tank.getTankCapacity(0)) } catch (e) { return NaN } }

  function placeHall() {
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
    var outCells = 0
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
      else if (sym.kind === 'frames') block = 'gtceu:' + sym.materials[0] + '_frame'
      else if (sym.kind === 'oneOf') {
        var isOut = sym.options.some(function (o) { return o.ability === 'output_hatch' })
        if (isOut) { block = OUT_HATCH; part = true; outCells++ }
        else if (c.si === last && c.ri === ctrl.ri && PARTS[c.ci]) { block = PARTS[c.ci]; part = true }
        else sym.options.forEach(function (o) { if (!block && o.kind === 'blocks') block = o.blocks[0] })
      }
      if (!block) return
      put(c.x, c.y, c.z, block + (part ? '[facing=north]' : ''))
    })
    put(controller.x, controller.y, controller.z, ID + '[facing=north]')
    note('placed', cells.length + ' cells, ' + outCells + ' output hatch cells')
    return pos(controller.x, controller.y, controller.z)
  }

  function begin() {
    S.level = S.server.getLevel('minecraft:overworld')
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    command('fill ' + X0 + ' ' + Y0 + ' 0 ' + X1 + ' ' + Y1 + ' 63 minecraft:air')
    var rm = S.server.getRecipeManager()
    var RL = classes().RL
    var probe = rm.byKey(new RL('gg_test_uxv:distillation_tower/sfh_probe')).isPresent()
    var made = []
    array(rm.getRecipes()).forEach(function (r) { var rid = String(r.getId()); if (rid.indexOf('stellar_fractionation_hall') >= 0) made.push(rid) })
    check('lookup', probe && made.length >= 1, 'probe recipe ' + probe + '; controller recipe ids: ' + made.join(', '))
    S.hall = { phase: 'forming', started: S.tick, pos: placeHall() }
  }

  function tickHall(u) {
    var waited = S.tick - u.started
    var m = machine(u.pos)
    if (u.phase === 'forming') {
      if (!m || !formCheck(m, waited)) {
        if (waited > 600) { check('formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      var ph = m.getParallelHatch()
      var hatch = ph.isPresent() ? ph.get() : null
      u.energy = partsLike(m, /energy_input_hatch/)
      u.bus = partsLike(m, /input_bus/)[0]
      u.inH = partsLike(m, /input_hatch/).filter(function (p) { return !/energy/.test(String(p.getDefinition().getId())) })[0]
      u.outs = partsLike(m, /output_hatch/)
      check('formed', !!hatch && Number(hatch.getCurrentParallel()) === 65536 && u.energy.length === 1 && !!u.inH && u.outs.length === 12, 'class ' + m.getClass().getSimpleName() + ', hatch ' + (hatch ? hatch.getCurrentParallel() : 'none') + ', energy hatches ' + u.energy.length + ', output hatches ' + u.outs.length)
      u.inH.tank.setFluidInTank(0, Fluid.of(INPUT, 1000).getFluidStack())
      u.m = m
      u.phase = 'run'
      u.started = S.tick
      return
    }
    topUp(u.energy)
    var rlg = m.getRecipeLogic()
    if (u.phase === 'run') {
      if (rlg.isWorking() && u.snap === undefined) {
        u.snap = snapshot(m)
        u.phase = 'drain'
        u.started = S.tick
      } else if (waited > 400) {
        check('copies', false, 'the probe never started; ' + String(rlg.getFailureReasons()))
        u.phase = 'done'
      }
      return
    }
    if (u.phase === 'drain') {
      if ((!rlg.isWorking() && waited > 5) || waited > 400) {
        var volt = Number(global.grindless.mega.maxVoltage(m))
        var energyCap = Math.floor(volt / PROBE_EUT)
        var tight = 1e18
        OUTS.forEach(function (o) { tight = Math.min(tight, Math.floor(tankCapacity(u.outs[0]) / o[1])) })
        var want = Math.min(CEILING, energyCap, tight)
        var got = u.snap ? u.snap.parallels : NaN
        note('measured', 'copies ' + got + ', ceiling ' + CEILING + ', energy cap floor(' + volt + ' V / ' + PROBE_EUT + ') = ' + energyCap + ', tightest hatch room ' + tight + ' (hatch capacity ' + tankCapacity(u.outs[0]) + ' mB, largest output 120 mB)')
        check('copies', got === want, 'expected min(ceiling, energy cap, output room) = ' + want + ', got ' + got + '; reasons ' + String(rlg.getFailureReasons()))
        var byFluid = {}
        var ok = true
        var seen = []
        u.outs.forEach(function (p) {
          var f = tankFluid(p)
          if (f !== 'minecraft:empty') { byFluid[f] = (byFluid[f] || 0) + tankAmount(p); seen.push(f) }
        })
        var bad = []
        OUTS.forEach(function (o) {
          if (byFluid[o[0]] !== got * o[1]) { ok = false; bad.push(o[0] + ' ' + byFluid[o[0]] + ' (expected ' + (got * o[1]) + ')') }
        })
        check('outputs', ok && seen.length === 12 && new Set(seen).size === 12, '12 hatches, one fluid each: ' + seen.length + ' filled, ' + new Set(seen).size + ' distinct; wrong: ' + bad.join('; '))
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
  ServerEvents.customCommand('gg_test_uxv_stellar_fractionation_hall', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestUxvSfhRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestUxvSfhRequest && Date.now() - LOADED >= 10000) {
        global.ggTestUxvSfhRequest = false
        S = { server: event.server, tick: 0, failed: 0, finished: false, hall: null }
        try { begin() } catch (e) { check('setup_exception', false, errText(e)); finish() }
        return
      }
      if (S === null || S.finished) return
      S.tick++
      if (S.hall && S.hall.phase !== 'done') {
        try { tickHall(S.hall) } catch (e) { check('hall_exception', false, 'phase ' + S.hall.phase + ': ' + errText(e)); S.hall.phase = 'done' }
      }
      if (!S.hall || S.hall.phase === 'done') finish()
      else if (S.tick > 1800) { check('deadline', false, '1800-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
