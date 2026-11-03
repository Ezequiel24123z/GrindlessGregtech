// priority: -5206
// TEST ONLY, XP-M1 (gtceu:max_maxplus_parallel_hatch, gtceu:hyperfactory). Command: kubejs custom_command gg_test_maxplus_hyperfactory
// Band ONLY: X 46848-46911, Z 0-63, Overworld Y 98-115.
//   T1 (named uncertainty: the reflected private currentParallel of 4,194,304 survives forming, and 4,096 x 4,194,304 = 2^34 never reaches the recipe as a wrapped int):
//     registered   the MAX+ hatch and the Hyperfactory are registered machines; the hatch is in the hatch list once
//     reports      a placed hatch reports 4,194,304; the MAX hatch beside it still 1,048,576
//     formed       the Hyperfactory forms on one 1,024 A MAX+ energy hatch and the MAX+ hatch and sees it at 4,194,304
//     copies       a 64 EU/t assembler probe (pink tulip, not consumed): copies = min(2^31-1, 4,096 x 4,194,304, floor(voltage / 64)), positive
//     no_wrap      the running recipe's EU/t is positive
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 46848
  var X1 = 46911
  var Y0 = 98
  var Y1 = 115
  var NAME = 'maxplus_hyperfactory'
  var HATCH = 'gtceu:max_maxplus_parallel_hatch'
  var OLD = 'gtceu:max_parallel_hatch'
  var ID = 'gtceu:hyperfactory'
  var ENERGY = 'gtceu:max_maxplus_energy_hatch_1024a'
  var PROBE = 'minecraft:pink_tulip'
  var PROBE_EUT = 64
  var INT_MAX = 2147483647
  var CEILING = 4096 * 4194304
  var CX = 46866
  var CY = Y0
  var PARTS = { 2: ENERGY, 3: 'gtceu:hv_input_bus', 4: 'gtceu:hv_output_bus', 10: 'gtceu:data_access_hatch', 6: HATCH, 8: 'gtceu:hv_input_hatch', 9: 'gtceu:hv_output_hatch' }

  ServerEvents.recipes(function (event) {
    try {
      event.recipes.gtceu.assembler('gg_test_xp_m1:probe').notConsumable('1x ' + PROBE).duration(40).EUt(PROBE_EUT)
    } catch (e) {
      console.error('[gg_test maxplus_hyperfactory] could not add the test recipe: ' + errText(e))
    }
  })

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Regs: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
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
  function snapshot(m) {
    var rec = m.getRecipeLogic().getLastRecipe()
    if (rec === null || rec === undefined) return null
    var eut = NaN
    try { eut = Number(classes().RecipeHelper.getRealEUtWithIO(rec).getTotalEU()) } catch (e) { }
    var par = NaN
    try { par = Number(rec.parallels) } catch (e) { }
    return { parallels: par, eut: eut, id: String(rec.id) }
  }
  function hatchOf(m) {
    var ph = m.getParallelHatch()
    return ph.isPresent() ? ph.get() : null
  }

  function placeFactory(cx, cy, cz) {
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
    var parts = 0
    // the shape outgrew a fixed anchor: cx and cz are the low X and Z corner of its box; its low Y is Y0
    var mnX = 1e9
    var mnY = 1e9
    var mnZ = 1e9
    cells.forEach(function (c) {
      c.x = -c.ci
      c.y = c.ri
      c.z = -c.si
      mnX = Math.min(mnX, c.x); mnY = Math.min(mnY, c.y); mnZ = Math.min(mnZ, c.z)
    })
    cells.forEach(function (c) { c.x += cx - mnX; c.y += cy - mnY; c.z += cz - mnZ })
    cells.forEach(function (c) {
      var sym = c.sym
      var block = null
      var part = false
      if (sym.kind === 'controller') { controller = { x: c.x, y: c.y, z: c.z }; return }
      if (sym.kind === 'blocks') block = sym.blocks[0]
      else if (sym.kind === 'frames') block = 'gtceu:' + sym.materials[0] + '_frame'
      else if (sym.kind === 'oneOf') {
        if (c.si === last && c.ri === ctrl.ri && PARTS[c.ci]) { block = PARTS[c.ci]; part = true; parts++ }
        else sym.options.forEach(function (o) { if (!block && o.kind === 'blocks') block = o.blocks[0]; if (!block && o.kind === 'frames') block = 'gtceu:' + o.materials[0] + '_frame' })
      }
      if (!block) return
      put(c.x, c.y, c.z, block + (part ? '[facing=north]' : ''))
    })
    put(controller.x, controller.y, controller.z, ID + '[facing=north]')
    note('factory_placed', parts + ' part cells placed (expected 7)')
    return pos(controller.x, controller.y, controller.z)
  }

  function begin() {
    S.level = S.server.getLevel('minecraft:overworld')
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    command('fill ' + X0 + ' ' + Y0 + ' 0 ' + X1 + ' ' + Y1 + ' 63 minecraft:air')
    var RL = classes().RL
    var have = [HATCH, ID].filter(function (i) { return !!classes().Regs.MACHINES.get(new RL(i)) })
    var list = array(global.grindless.parallelHatch.hatches).map(String)
    var times = list.filter(function (i) { return i === HATCH }).length
    check('registered', have.length === 2 && times === 1, 'registered: ' + have.join(', ') + '; ' + HATCH + ' in the hatch list ' + times + ' time(s) (expected 1)')
    put(46852, 100, 5, HATCH + '[facing=north]')
    put(46854, 100, 5, OLD + '[facing=north]')
    S.hatchTick = 40
    try { S.fac = { phase: 'forming', started: S.tick, pos: placeFactory(CX, CY, 20) } } catch (e) { check('factory_build', false, errText(e)); S.fac = null }
  }

  function measureHatches() {
    var a = machine(pos(46852, 100, 5))
    var b = machine(pos(46854, 100, 5))
    var ga = a ? Number(a.getCurrentParallel()) : NaN
    var gb = b ? Number(b.getCurrentParallel()) : NaN
    check('reports', ga === 4194304 && gb === 1048576, 'MAX+ hatch reports ' + ga + ' (expected 4194304); MAX hatch ' + gb + ' (expected 1048576)')
  }

  function tickFactory(u) {
    var waited = S.tick - u.started
    var m = machine(u.pos)
    if (u.phase === 'forming') {
      if (!m || !formCheck(m, waited)) {
        if (waited > 600) { check('formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      var h = hatchOf(m)
      u.energy = partsLike(m, /energy_hatch|energy_input/)
      u.bus = partsLike(m, /input_bus/)[0]
      check('formed', !!h && Number(h.getCurrentParallel()) === 4194304 && u.energy.length === 1 && !!u.bus, 'class ' + m.getClass().getSimpleName() + ', hatch ' + (h ? h.getCurrentParallel() : 'none') + ', 1,024 A hatches ' + u.energy.length + ' (expected 1)')
      topUp(u.energy)
      setBus(u.bus, PROBE)
      u.started = S.tick
      u.phase = 'run'
      return
    }
    topUp(u.energy)
    if (u.phase === 'run') {
      var snap = m.getRecipeLogic().isWorking() ? snapshot(m) : null
      if (snap !== null || waited > 300) {
        var volt = Number(global.grindless.mega.maxVoltage(m))
        var cap = Math.floor(volt / PROBE_EUT)
        var want = Math.min(INT_MAX, CEILING, cap)
        note('measured', 'recipe ' + (snap ? snap.id : 'none') + ', copies ' + (snap ? snap.parallels : 'none') + ', EU/t ' + (snap ? snap.eut : 'none') + '; voltage ' + volt + ', cap ' + cap + ', ceiling ' + CEILING + '; reasons ' + String(m.getRecipeLogic().getFailureReasons()))
        check('copies', snap !== null && snap.parallels > 0 && snap.parallels === want, 'expected min(int max, ' + CEILING + ', ' + cap + ') = ' + want + ', got ' + (snap ? snap.parallels : 'none'))
        check('no_wrap', snap !== null && snap.eut > 0, 'recipe EU/t ' + (snap ? snap.eut : 'none') + ' is positive')
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
  ServerEvents.customCommand('gg_test_maxplus_hyperfactory', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestXpM1Request = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestXpM1Request && Date.now() - LOADED >= 10000) {
        global.ggTestXpM1Request = false
        S = { server: event.server, tick: 0, failed: 0, finished: false, fac: null, hatchTick: -1 }
        try { begin() } catch (e) { check('setup_exception', false, errText(e)); finish() }
        return
      }
      if (S === null || S.finished) return
      S.tick++
      if (S.hatchTick > 0 && S.tick === S.hatchTick) { try { measureHatches() } catch (e) { check('reports_exception', false, errText(e)) } }
      var pending = 0
      if (S.fac && S.fac.phase !== 'done') {
        try { tickFactory(S.fac) } catch (e) { check('factory_exception', false, 'phase ' + S.fac.phase + ': ' + errText(e)); S.fac.phase = 'done' }
        if (S.fac.phase !== 'done') pending++
      }
      if (S.tick < 41) pending++
      if (pending === 0) finish()
      else if (S.tick > 1800) { check('deadline', false, '1800-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
