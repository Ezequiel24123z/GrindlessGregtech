// TEST ONLY, UXV-M1 (gtceu:uxv_parallel_hatch). Command: kubejs custom_command gg_test_uxv_parallel_hatch
// Band ONLY: X 36416-36479, Z 0-63, Overworld Y 98-115 (the forge is 16 high; zones.json carries the same Y range).
//   T1 (named uncertainty: tier 12 registration of ParallelHatchPartMachine with highTierContent off, and 65,536 copies still bound by energy as a long):
//     reports      a placed UXV hatch reports 65,536; the UHV, UEV and UIV ones beside it still 1,024, 4,096 and 16,384
//     forge_formed gtceu:stellar_forge with one UXV energy hatch and the UXV hatch forms and sees the hatch
//     hatch_energy the 16 EU/t probe of gg_test_uiv_parallel_hatch.js (the same overlay folder; its lookup holds only one recipe on a dandelion): copies = min(256 x 65,536, floor(max voltage / 16)); the cap (8,388,608) is below the ceiling (16,777,216), so energy bounds it
//     gcym_formed  gtceu:large_assembler (a GCyM machine that takes GTM's parallel hatch) built from its own preview shape, the hatch swapped for the UXV one, forms and reports 65,536
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 36416
  var X1 = 36479
  var Y0 = 98
  var Y1 = 115
  var NAME = 'uxv_parallel_hatch'
  var ID = 'gtceu:stellar_forge'
  var GCYM = 'gtceu:large_assembler'
  var DANDELION = 'minecraft:dandelion'
  var COIL = 'grindless:hftacn_coil_block'
  var PROBE_EUT = 16
  var CEILING = 256 * 65536
  var CX = 36448
  var CY = 100
  var PARTS = { 0: 'gtceu:maintenance_hatch', 1: 'gtceu:uxv_energy_input_hatch', 2: 'gtceu:hv_input_bus', 4: 'gtceu:hv_input_hatch', 5: 'gtceu:hv_output_hatch', 6: 'gtceu:uxv_parallel_hatch' }

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Regs: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
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
  function hatchOf(m) {
    var ph = m.getParallelHatch()
    return ph.isPresent() ? ph.get() : null
  }

  function placeForge(cx, cy, cz, energyId) {
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
    cells.forEach(function (c) {
      c.x = cx - (c.ci - ctrl.ci)
      c.y = cy + (c.ri - ctrl.ri)
      c.z = cz - (c.si - ctrl.si)
    })
    cells.forEach(function (c) {
      var sym = c.sym
      var block = null
      var part = false
      if (sym.kind === 'controller') { controller = { x: c.x, y: c.y, z: c.z }; return }
      if (sym.kind === 'blocks') block = sym.blocks.length > 1 ? COIL : sym.blocks[0]
      else if (sym.kind === 'frames') block = 'gtceu:' + sym.materials[0] + '_frame'
      else if (sym.kind === 'oneOf') {
        if (c.si === last && c.ri === ctrl.ri && PARTS[c.ci]) { block = c.ci === 1 ? energyId : PARTS[c.ci]; part = true }
        else sym.options.forEach(function (o) { if (!block && o.kind === 'blocks') block = o.blocks[0]; if (!block && o.kind === 'frames') block = 'gtceu:' + o.materials[0] + '_frame' })
      }
      if (!block) return
      put(c.x, c.y, c.z, block + (part ? '[facing=north]' : ''))
    })
    put(controller.x, controller.y, controller.z, ID + '[facing=north]')
    return pos(controller.x, controller.y, controller.z)
  }

  // GTM's own preview shape of the GCyM machine, placed block by block; the parallel hatch of the shape is replaced by ours
  function placeGcym(ox, oy, oz) {
    var def = classes().Regs.MACHINES.get(new (classes().RL)(GCYM))
    if (!def) throw new Error(GCYM + ' is not registered')
    var shapes = array(def.getMatchingShapes())
    if (shapes.length === 0) throw new Error('no preview shape for ' + GCYM)
    var grid = shapes[0].getBlocks()
    var cells = []
    var ctl = null
    var hatches = 0
    var placed = 0
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
    cells.forEach(function (c) {
      var s = String(c.state)
      if (/Block\{minecraft:air\}/.test(s)) return
      var m = /Block\{([^}]+)\}(\[.*\])?/.exec(s)
      if (!m) return
      var id = m[1]
      if (/parallel_hatch/.test(id)) { hatches++; id = 'gtceu:uxv_parallel_hatch' }
      put(ox + c.x - ctl.x, oy + c.y - ctl.y, oz + c.z - ctl.z, id + (m[2] || ''))
      placed++
    })
    return { pos: pos(ox, oy, oz), placed: placed, hatches: hatches }
  }

  function begin() {
    S.level = S.server.getLevel('minecraft:overworld')
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    command('fill ' + X0 + ' ' + Y0 + ' 0 ' + X1 + ' ' + Y1 + ' 63 minecraft:air')
    var RL = classes().RL
    var ids = ['gtceu:uhv_parallel_hatch', 'gtceu:uev_parallel_hatch', 'gtceu:uiv_parallel_hatch', 'gtceu:uxv_parallel_hatch']
    var have = ids.filter(function (i) { return !!classes().Regs.MACHINES.get(new RL(i)) })
    var list = global.grindless.parallelHatch.hatches
    check('registered', have.length === 4 && String(list).indexOf('gtceu:uxv_parallel_hatch') >= 0, 'registered: ' + have.join(', ') + '; in the hatch list: ' + (String(list).indexOf('gtceu:uxv_parallel_hatch') >= 0))
    put(36424, 100, 5, 'gtceu:uhv_parallel_hatch[facing=north]')
    put(36426, 100, 5, 'gtceu:uev_parallel_hatch[facing=north]')
    put(36428, 100, 5, 'gtceu:uiv_parallel_hatch[facing=north]')
    put(36430, 100, 5, 'gtceu:uxv_parallel_hatch[facing=north]')
    S.hatchTick = 40
    try { S.forge = { phase: 'forming', started: S.tick, pos: placeForge(CX, CY, 40, PARTS[1]) } } catch (e) { check('forge_build', false, errText(e)); S.forge = null }
    try {
      var g = placeGcym(36464, 100, 20)
      note('gcym_placed', g.placed + ' blocks from the preview shape, ' + g.hatches + ' parallel hatch cell(s) swapped for the UXV one')
      S.gcym = { phase: 'forming', started: S.tick, pos: g.pos, hatches: g.hatches }
    } catch (e) { check('gcym_build', false, errText(e)); S.gcym = null }
  }

  function measureHatches() {
    var a = machine(pos(36424, 100, 5))
    var b = machine(pos(36426, 100, 5))
    var c = machine(pos(36428, 100, 5))
    var d = machine(pos(36430, 100, 5))
    var uhv = a ? Number(a.getCurrentParallel()) : NaN
    var uev = b ? Number(b.getCurrentParallel()) : NaN
    var uiv = c ? Number(c.getCurrentParallel()) : NaN
    var uxv = d ? Number(d.getCurrentParallel()) : NaN
    check('reports', uxv === 65536, 'UXV hatch reports ' + uxv + ' (expected 65536), class ' + (d ? d.getClass().getSimpleName() : 'none'))
    check('older_hatches', uhv === 1024 && uev === 4096 && uiv === 16384, 'UHV ' + uhv + ' (expected 1024), UEV ' + uev + ' (expected 4096), UIV ' + uiv + ' (expected 16384)')
  }

  function tickForge(u) {
    var waited = S.tick - u.started
    var m = machine(u.pos)
    if (u.phase === 'forming') {
      if (!m || !formCheck(m, waited)) {
        if (waited > 600) { check('forge_formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      var h = hatchOf(m)
      u.m = m
      u.energy = partsLike(m, /energy_input_hatch/)
      u.bus = partsLike(m, /input_bus/)[0]
      check('forge_formed', !!h && Number(h.getCurrentParallel()) === 65536 && u.energy.length === 1 && !!u.bus, 'class ' + m.getClass().getSimpleName() + ', hatch ' + (h ? h.getCurrentParallel() : 'none') + ', energy hatches ' + u.energy.length)
      topUp(u.energy)
      setBus(u.bus, DANDELION)
      u.started = S.tick
      u.phase = 'run'
      return
    }
    topUp(u.energy)
    if (u.phase === 'run') {
      var snap = m.getRecipeLogic().isWorking() ? snapshot(m) : null
      if (snap !== null || waited > 300) {
        var volt = Number(global.grindless.mega.maxVoltage(m))
        note('get_max_voltage', 'MetaMachine.getMaxVoltage() reports ' + Number(m.getMaxVoltage()) + '; the forge caps by lib/mega.js maxVoltage ' + volt)
        var cap = Math.floor(volt / PROBE_EUT)
        var want = Math.min(CEILING, cap)
        note('hatch_measured', 'copies ' + (snap ? snap.parallels : 'none') + ', ceiling ' + CEILING + ', energy cap floor(' + volt + ' V / ' + PROBE_EUT + ' EU/t) = ' + cap)
        check('hatch_energy', snap !== null && snap.parallels === want && want < CEILING, 'UXV hatch with one UXV energy hatch: expected min(' + CEILING + ', cap ' + cap + ') = ' + want + ' (energy-bound: ' + (want < CEILING) + '), got ' + (snap ? snap.parallels : 'none'))
        u.phase = 'done'
      }
    }
  }

  function tickGcym(u) {
    var waited = S.tick - u.started
    var m = machine(u.pos)
    if (!m || !formCheck(m, waited)) {
      if (waited > 600) { check('gcym_formed', false, (m ? 'not formed: ' + why(m) : 'no controller') + '; hatch cells swapped ' + u.hatches); u.phase = 'done' }
      return
    }
    var h = hatchOf(m)
    check('gcym_formed', !!h && Number(h.getCurrentParallel()) === 65536, GCYM + ' class ' + m.getClass().getSimpleName() + ', hatch ' + (h ? h.getCurrentParallel() : 'none') + ', hatch cells swapped ' + u.hatches)
    u.phase = 'done'
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
  ServerEvents.customCommand('gg_test_uxv_parallel_hatch', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestUxvHatchRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestUxvHatchRequest && Date.now() - LOADED >= 10000) {
        global.ggTestUxvHatchRequest = false
        S = { server: event.server, tick: 0, failed: 0, finished: false, forge: null, gcym: null, hatchTick: -1 }
        try { begin() } catch (e) { check('setup_exception', false, errText(e)); finish() }
        return
      }
      if (S === null || S.finished) return
      S.tick++
      if (S.hatchTick > 0 && S.tick === S.hatchTick) { try { measureHatches() } catch (e) { check('reports_exception', false, errText(e)) } }
      var pending = 0
      if (S.forge && S.forge.phase !== 'done') {
        try { tickForge(S.forge) } catch (e) { check('forge_exception', false, 'phase ' + S.forge.phase + ': ' + errText(e)); S.forge.phase = 'done' }
        if (S.forge.phase !== 'done') pending++
      }
      if (S.gcym && S.gcym.phase !== 'done') {
        try { tickGcym(S.gcym) } catch (e) { check('gcym_exception', false, errText(e)); S.gcym.phase = 'done' }
        if (S.gcym.phase !== 'done') pending++
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
