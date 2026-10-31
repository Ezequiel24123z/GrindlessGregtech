// priority: -5559
// TEST ONLY, MAX-M1 (gtceu:max_parallel_hatch). Command: kubejs custom_command gg_test_max_parallel
// Band ONLY: X 39320-39383, Z 0-63, Overworld Y 98-115 (the forge is 16 high; zones.json carries the same Y range).
//   T1 (named uncertainty: at x1,048,576 on a GTM recipe the EU/t x parallel product stays long and the energy bound picks the parallel, not an overflow):
//     registered    the UHV, UEV, UIV, UXV, OpV and MAX hatches are registered machines; the MAX one is in the hatch list once
//     recipe        grindless:assembly_line/max_parallel_hatch is in the recipe manager (max/parallel.js reports no missing input)
//     reports       a placed MAX hatch reports 1,048,576; older_hatches: the UHV, UEV, UIV, UXV and OpV ones beside it still 1,024, 4,096, 16,384, 65,536 and 262,144
//     forge_formed  gtceu:stellar_forge (a mega member) with two OpV 16 A energy hatches and the OpV hatch forms and sees it
//     hatch_energy  a 64 EU/t EBF probe at 9000 K (pink tulip, not consumed): ceiling 256 x 1,048,576 = 67,108,864, whose EU/t (2^32) would wrap an int;
//                   two OpV hatches give V[min(13 + 1, MAX)] = V[14] = 2^31 = 2,147,483,648 (GTM 7.5.3), so copies = floor(volt / 64) = 33,554,432 < ceiling (energy-bound)
//     no_wrap       the running recipe's EU/t is positive and at most the hatches' combined input (2 x 16 A x V[OpV] = 2^34); the forge may overclock it
//                   against that input (x4 each), so with those x4 steps removed it lies between the discount floor (0.80) of copies x 64 and copies x 64
//     gcym_formed   gtceu:large_assembler (a GCyM machine that takes GTM's parallel hatch) built from its own preview shape, the hatch swapped for the OpV one, forms and reports 1,048,576
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 39320
  var X1 = 39383
  var Y0 = 98
  var Y1 = 115
  var NAME = 'max_parallel'
  var HATCH = 'gtceu:max_parallel_hatch'
  var ID = 'gtceu:stellar_forge'
  var GCYM = 'gtceu:large_assembler'
  var PROBE = 'minecraft:pink_tulip'
  var COIL = 'grindless:hftacn_coil_block'
  var ENERGY16 = 'gtceu:opv_energy_input_hatch_16a'
  var RECIPE = 'grindless:assembly_line/opv_parallel_hatch'
  var PROBE_EUT = 64
  var DISCOUNT_FLOOR = 0.80
  var CEILING = 256 * 1048576
  var VMAX = 2147483648
  var BUDGET = 2 * 16 * 536870912
  var CX = 39352
  var CY = 100
  // the forge's front parts row: column 4 is the controller, so the second energy hatch takes column 3
  var PARTS = { 0: 'gtceu:maintenance_hatch', 1: ENERGY16, 2: 'gtceu:hv_input_bus', 3: ENERGY16, 5: 'gtceu:hv_output_hatch', 6: HATCH }
  var PROBES = [
    { x: 39328, id: 'gtceu:uhv_parallel_hatch', want: 1024 },
    { x: 39330, id: 'gtceu:uev_parallel_hatch', want: 4096 },
    { x: 39332, id: 'gtceu:uiv_parallel_hatch', want: 16384 },
    { x: 39334, id: 'gtceu:uxv_parallel_hatch', want: 65536 },
    { x: 39336, id: 'gtceu:opv_parallel_hatch', want: 262144 },
    { x: 39338, id: HATCH, want: 1048576 }
  ]

  ServerEvents.recipes(function (event) {
    try {
      event.recipes.gtceu.electric_blast_furnace('gg_test_opv:ph_probe').notConsumable('1x ' + PROBE).blastFurnaceTemp(9000).duration(40).EUt(PROBE_EUT)
    } catch (e) {
      console.error('[gg_test opv_parallel_hatch] could not add the test recipe: ' + errText(e))
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

  function placeForge(cx, cy, cz) {
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
        if (c.si === last && c.ri === ctrl.ri && PARTS[c.ci]) { block = PARTS[c.ci]; part = true; parts++ }
        else sym.options.forEach(function (o) { if (!block && o.kind === 'blocks') block = o.blocks[0]; if (!block && o.kind === 'frames') block = 'gtceu:' + o.materials[0] + '_frame' })
      }
      if (!block) return
      put(c.x, c.y, c.z, block + (part ? '[facing=north]' : ''))
    })
    put(controller.x, controller.y, controller.z, ID + '[facing=north]')
    note('forge_placed', parts + ' part cells placed (expected 6: maintenance, two OpV 16 A energy hatches, bus, output hatch, OpV parallel hatch)')
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
      if (/parallel_hatch/.test(id)) { hatches++; id = HATCH }
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
    var ids = PROBES.map(function (p) { return p.id })
    var have = ids.filter(function (i) { return !!classes().Regs.MACHINES.get(new RL(i)) })
    var list = array(global.grindless.parallelHatch.hatches).map(String)
    var times = list.filter(function (i) { return i === HATCH }).length
    check('registered', have.length === 6 && times === 1, 'registered: ' + have.join(', ') + '; ' + HATCH + ' in the hatch list ' + times + ' time(s) (expected 1)')
    var H = global.grindless.maxParallelHatch || {}
    var found = false
    try { found = S.server.getRecipeManager().byKey(new RL(RECIPE)).isPresent() } catch (e) { note('recipe_lookup', errText(e)) }
    check('recipe', found && H.done === true && String(H.missing) === '', RECIPE + ' in the recipe manager: ' + found + '; max/parallel.js done ' + H.done + ', missing [' + H.missing + ']')
    PROBES.forEach(function (p) { put(p.x, 100, 5, p.id + '[facing=north]') })
    S.hatchTick = 40
    try { S.forge = { phase: 'forming', started: S.tick, pos: placeForge(CX, CY, 40) } } catch (e) { check('forge_build', false, errText(e)); S.forge = null }
    try {
      var g = placeGcym(39368, 100, 20)
      note('gcym_placed', g.placed + ' blocks from the preview shape, ' + g.hatches + ' parallel hatch cell(s) swapped for the OpV one')
      S.gcym = { phase: 'forming', started: S.tick, pos: g.pos, hatches: g.hatches }
    } catch (e) { check('gcym_build', false, errText(e)); S.gcym = null }
  }

  function measureHatches() {
    var got = PROBES.map(function (p) {
      var m = machine(pos(p.x, 100, 5))
      return { id: p.id, want: p.want, got: m ? Number(m.getCurrentParallel()) : NaN, cls: m ? String(m.getClass().getSimpleName()) : 'none' }
    })
    var opv = got[5]
    var older = got.slice(0, 5)
    check('reports', opv.got === 1048576, 'MAX hatch reports ' + opv.got + ' (expected 1048576), class ' + opv.cls)
    check('older_hatches', older.every(function (g) { return g.got === g.want }), older.map(function (g) { return g.id + ' ' + g.got + ' (expected ' + g.want + ')' }).join(', '))
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
      check('forge_formed', !!h && Number(h.getCurrentParallel()) === 1048576 && u.energy.length === 2 && !!u.bus, 'class ' + m.getClass().getSimpleName() + ', hatch ' + (h ? h.getCurrentParallel() : 'none') + ', OpV 16 A energy hatches ' + u.energy.length + ' (expected 2)')
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
        var want = Math.min(CEILING, cap)
        note('hatch_measured', 'recipe ' + (snap ? snap.id : 'none') + ', copies ' + (snap ? snap.parallels : 'none') + ', EU/t ' + (snap ? snap.eut : 'none') + '; ceiling ' + CEILING + ' (x ' + PROBE_EUT + ' EU/t = ' + (CEILING * PROBE_EUT) + ', above 2^31-1), energy cap floor(' + volt + ' V / ' + PROBE_EUT + ') = ' + cap + '; reasons ' + String(m.getRecipeLogic().getFailureReasons()))
        check('hatch_energy', snap !== null && snap.parallels === want && want < CEILING && volt === VMAX, 'two OpV 16 A hatches: voltage ' + volt + ' (expected ' + VMAX + '); expected min(' + CEILING + ', cap ' + cap + ') = ' + want + ' (energy-bound: ' + (want < CEILING) + '), got ' + (snap ? snap.parallels : 'none'))
        var full = snap ? snap.parallels * PROBE_EUT : NaN
        var low = Math.floor(full * DISCOUNT_FLOOR)
        var base = snap ? snap.eut : NaN
        var ocs = 0
        while (base > full && base % 4 === 0) { base = base / 4; ocs++ }
        var ok = snap !== null && snap.eut > 0 && snap.eut <= BUDGET && base <= full && base >= low
        check('no_wrap', ok, 'recipe EU/t ' + (snap ? snap.eut : 'none') + ': positive, at most the hatches\' input ' + BUDGET + '; ' + ocs + ' overclock(s) of x4 removed gives ' + base + ', between the discount floor ' + low + ' and copies x ' + PROBE_EUT + ' = ' + full)
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
    check('gcym_formed', !!h && Number(h.getCurrentParallel()) === 1048576, GCYM + ' class ' + m.getClass().getSimpleName() + ', hatch ' + (h ? h.getCurrentParallel() : 'none') + ', hatch cells swapped ' + u.hatches)
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
  ServerEvents.customCommand('gg_test_max_parallel', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestMaxHatchRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestMaxHatchRequest && Date.now() - LOADED >= 10000) {
        global.ggTestMaxHatchRequest = false
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
